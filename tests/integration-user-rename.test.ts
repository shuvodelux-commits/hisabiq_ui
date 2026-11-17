import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { updateTenantUserDisplayName, type ServerUser } from '../src/integration/settings-team.ts';

const origin = 'https://hisabiq-rename.test';
const a: ServerUser = {
  id: '01J0F5JK4BXH01EFGN6DJPQ5XB', username: 'owner', displayName: 'Owner A',
  email: null, phone: '01711001111', roleId: '01J0F5JK4BXH01EFGN6DJPQ5XC',
  roleName: 'Owner', disabled: false, hasPassword: true,
};
const b: ServerUser = {
  ...a, id: '01J0F5JK4BXH01EFGN6DJPQ5XD',
  roleId: '01J0F5JK4BXH01EFGN6DJPQ5XE', displayName: 'Owner B',
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
async function withFetch(fake: typeof fetch, run: () => Promise<void>) {
  const f = globalThis.fetch, w = (globalThis as any).window, l = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await run(); } finally {
    globalThis.fetch = f;
    if (w === undefined) delete (globalThis as any).window; else (globalThis as any).window = w;
    if (l === undefined) delete (globalThis as any).location; else (globalThis as any).location = l;
  }
}
test('rename sends exact verified role ID, no password, and never changes original user', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/users/' + a.id);
    assert.equal(init?.method, 'PATCH');
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-A');
    assert.deepEqual(JSON.parse(String(init?.body)), { displayName: 'New Owner A', roleId: a.roleId });
    return json({ data: { ...a, displayName: 'New Owner A' } });
  }) as typeof fetch, async () => {
    const result = await updateTenantUserDisplayName('tenant-A', a, '  New Owner A  ');
    assert.equal(result.data.displayName, 'New Owner A');
    assert.equal(result.data.roleId, a.roleId);
    assert.equal(a.displayName, 'Owner A');
  });
  assert.equal(calls, 1);
});
test('invalid identity/name/role rejects before any network call', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: a }); }) as typeof fetch, async () => {
    for (const name of ['', ' ', 'x'.repeat(121)]) {
      await assert.rejects(updateTenantUserDisplayName('token', a, name),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    }
    for (const u of [{ ...a, id: '../secret' }, { ...a, roleId: 'Sales' }, { ...a, password: 'secret' }]) {
      await assert.rejects(updateTenantUserDisplayName('token', u, 'Name'),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    }
  });
  assert.equal(calls, 0);
});
test('wrong returned id or role, malformed envelope or credential field fails closed', async () => {
  for (const response of [
    { data: { ...a, id: b.id, displayName: 'New Name' } },
    { data: { ...a, roleId: b.roleId, displayName: 'New Name' } },
    { data: { ...a, password: 'secret', displayName: 'New Name' } },
    { data: { ...a, hasPassword: 'yes', displayName: 'New Name' } },
    { data: null },
  ]) {
    await withFetch((async () => json(response)) as typeof fetch, async () => {
      await assert.rejects(updateTenantUserDisplayName('token', a, 'New Name'),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    });
  }
});
test('HTTP failures return error without retry', async () => {
  for (const status of [401, 403, 404, 422, 500]) {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: { code: 'DENIED', message: 'No', details: {}, traceId: 'test' } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(updateTenantUserDisplayName('token', a, 'New Name'),
        (e: unknown) => e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
    assert.equal(calls, 1);
  }
});
test('abort, timeout and offline are unknown outcomes, never retried', async () => {
  for (const reason of ['offline', 'abort', 'timeout']) {
    const ctl = new AbortController();
    let calls = 0;
    await withFetch((async (_url, init) => {
      calls++;
      if (reason === 'offline') throw new TypeError('Offline');
      return await new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Abort', 'AbortError')), { once: true });
        if (reason === 'abort') ctl.abort();
      });
    }) as typeof fetch, async () => {
      await assert.rejects(updateTenantUserDisplayName('token', a, 'New Name', ctl.signal, 5),
        (e: unknown) => e instanceof ApiError && e.kind === 'network');
    });
    assert.equal(calls, 1);
  }
});
test('two tenant tokens do not reuse user or role identifiers', async () => {
  const observed: Array<{ auth: string | null; id: string; role: string }> = [];
  await withFetch((async (url, init) => {
    const user = String(url).endsWith(a.id) ? a : b;
    const body = JSON.parse(String(init?.body));
    observed.push({ auth: new Headers(init?.headers).get('Authorization'), id: user.id, role: body.roleId });
    return json({ data: { ...user, displayName: body.displayName } });
  }) as typeof fetch, async () => {
    await updateTenantUserDisplayName('tenant-A', a, 'New A');
    await updateTenantUserDisplayName('tenant-B', b, 'New B');
  });
  assert.deepEqual(observed, [
    { auth: 'Bearer tenant-A', id: a.id, role: a.roleId },
    { auth: 'Bearer tenant-B', id: b.id, role: b.roleId },
  ]);
});
