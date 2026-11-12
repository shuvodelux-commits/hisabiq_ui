import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { readTenantUsers, readTenantRoles } from '../src/integration/settings-team.ts';

const origin = 'https://hisabiq-team.test';
const userA = '01J0F5JK4BXH01EFGN6DJPQ5XB';
const roleA = '01J0F5JK4BXH01EFGN6DJPQ5XC';
const userB = '01J0F5JK4BXH01EFGN6DJPQ5XD';
const roleB = '01J0F5JK4BXH01EFGN6DJPQ5XE';
const userEnvelope = (id: string, roleId: string, name: string) => ({
  data: {
    users: [{ id, username: 'owner', displayName: name, email: null, phone: '01711001111',
      roleId, roleName: 'Owner', disabled: false, hasPassword: true }],
    roles: [{ id: roleId, code: 'OWNER', name: 'Owner' }],
  },
});
const roleEnvelope = (id: string) => ({
  data: {
    roles: [{ id, code: 'OWNER', name: 'Owner', isSystem: true, locked: true,
      permissions: ['user.account.view', 'user.role.view'],
      cashRefundPerReturnMinor: null, cashRefundPerDayMinor: null, userCount: 1 }],
    catalogue: [{ code: 'user.account.view', group: 'Users', label: 'View users',
      detail: 'See tenant users' }],
  },
});
const aUsers = userEnvelope(userA, roleA, 'Owner A');
const bUsers = userEnvelope(userB, roleB, 'Owner B');
const aRoles = roleEnvelope(roleA);
const bRoles = roleEnvelope(roleB);
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, run: () => Promise<void>) {
  const fetchBefore = globalThis.fetch;
  const winBefore = (globalThis as any).window;
  const locBefore = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await run(); }
  finally {
    (globalThis as any).fetch = fetchBefore;
    if (winBefore === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = winBefore;
    if (locBefore === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = locBefore;
  }
}

test('separate exact GET users and roles, bearer identity, no mutation', async () => {
  const urls: string[] = [];
  await withFetch((async (url, init) => {
    const u = String(url);
    urls.push(u);
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-A-token');
    assert.ok(u.endsWith('/api/v1/users') || u.endsWith('/api/v1/roles'));
    return json(u.endsWith('/users') ? aUsers : aRoles);
  }) as typeof fetch, async () => {
    assert.deepEqual(await readTenantUsers('tenant-A-token'), aUsers);
    assert.deepEqual(await readTenantRoles('tenant-A-token'), aRoles);
  });
  assert.deepEqual(urls, [origin + '/api/v1/users', origin + '/api/v1/roles']);
});

test('tenant users and roles cannot be reused across verified tokens', async () => {
  const seen: string[] = [];
  await withFetch((async (url, init) => {
    const token = new Headers(init?.headers).get('Authorization') ?? '';
    seen.push(token);
    assert.ok(token === 'Bearer token-A' || token === 'Bearer token-B');
    const first = token === 'Bearer token-A';
    return json(String(url).endsWith('/users')
      ? (first ? aUsers : bUsers) : (first ? aRoles : bRoles));
  }) as typeof fetch, async () => {
    const a = await readTenantUsers('token-A');
    const b = await readTenantUsers('token-B');
    assert.equal(a.data.users[0]?.displayName, 'Owner A');
    assert.equal(b.data.users[0]?.displayName, 'Owner B');
    const ar = await readTenantRoles('token-A');
    const br = await readTenantRoles('token-B');
    assert.equal(ar.data.roles[0]?.id, roleA);
    assert.equal(br.data.roles[0]?.id, roleB);
  });
  assert.deepEqual(seen, ['Bearer token-A', 'Bearer token-B', 'Bearer token-A', 'Bearer token-B']);
});

test('401/403/500 deny either resource with no retries and no preview fixture', async () => {
  for (const resource of [readTenantUsers, readTenantRoles]) {
    for (const status of [401, 403, 500]) {
      let calls = 0;
      await withFetch((async () => {
        calls++;
        return json({ error: { code: 'DENIED', message: 'Blocked', details: {}, traceId: 't02-r' } }, status);
      }) as typeof fetch, async () => {
        await assert.rejects(resource('valid-token'), (error: unknown) =>
          error instanceof ApiError && error.kind === 'http' && error.status === status);
      });
      assert.equal(calls, 1);
    }
  }
});

test('strict schema rejects malformed envelopes and invalid refund cap fields', async () => {
  const badUsers = [
    {}, { data: {} },
    { data: { ...aUsers.data, users: [{ ...aUsers.data.users[0], id: 'fake' }] } },
    { data: { ...aUsers.data, users: [{ ...aUsers.data.users[0], password: 'secret' }] } },
    { data: { ...aUsers.data, users: [{ ...aUsers.data.users[0], hasPassword: 'yes' }] } },
    { data: { ...aUsers.data, roles: [{ ...aUsers.data.roles[0], roleIds: ['owner'] }] } },
  ];
  const badRoles = [
    {}, { data: {} },
    { data: { ...aRoles.data, roles: [{ ...aRoles.data.roles[0], permissions: ['valid', 42] }] } },
    { data: { ...aRoles.data, roles: [{ ...aRoles.data.roles[0], userCount: 1.5 }] } },
    { data: { ...aRoles.data, catalogue: [{ ...aRoles.data.catalogue[0], secret: true }] } },
    { data: { ...aRoles.data, roles: [{ ...aRoles.data.roles[0], cashRefundPerDayMinor: undefined }] } },
    { data: { ...aRoles.data, roles: [{ ...aRoles.data.roles[0], cashRefundPerReturnMinor: -1 }] } },
    { data: { ...aRoles.data, roles: [{ ...aRoles.data.roles[0], cashRefundPerDayMinor: 4.5 }] } },
    { data: { ...aRoles.data, roles: [{ ...aRoles.data.roles[0], cashRefundPerReturnMinor: '500' }] } },
    { data: { ...aRoles.data, roles: [{ ...aRoles.data.roles[0], cashRefundPerReturnMinor: Number.MAX_SAFE_INTEGER + 1 }] } },
    { data: { ...aRoles.data, roles: [{ ...aRoles.data.roles[0], extraPrivilege: true }] } },
  ];
  for (const [method, invalid] of [[readTenantUsers, badUsers], [readTenantRoles, badRoles]] as const) {
    for (const candidate of invalid) {
      await withFetch((async () => json(candidate)) as typeof fetch, async () => {
        await assert.rejects(method('valid-token'), (err: unknown) =>
          err instanceof ApiError && err.kind === 'protocol');
      });
    }
  }
});

test('network loss, caller abort and timeout produce one failed read', async () => {
  for (const resource of [readTenantUsers, readTenantRoles]) {
    for (const reason of ['offline', 'abort', 'timeout']) {
      const controller = new AbortController();
      let calls = 0;
      await withFetch((async (_url, init) => {
        calls++;
        assert.ok(init?.signal instanceof AbortSignal);
        if (reason === 'offline') throw new TypeError('Offline');
        return await new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true });
          if (reason === 'abort') controller.abort();
        });
      }) as typeof fetch, async () => {
        await assert.rejects(resource('valid-token', controller.signal, 5), (err: unknown) =>
          err instanceof ApiError && err.kind === 'network');
      });
      assert.equal(calls, 1);
    }
  }
});

test('HTML success, unexpected cross-origin redirect or invalid token never return teams', async () => {
  for (const resource of [readTenantUsers, readTenantRoles]) {
    await withFetch((async () => new Response('<html/>', { headers: { 'content-type': 'text/html' } })) as typeof fetch, async () => {
        await assert.rejects(resource('valid-token'), (err: unknown) =>
          err instanceof ApiError && err.kind === 'protocol');
      });
    await withFetch((async (_url, init) => {
      assert.equal(init?.redirect, 'error');
      throw new TypeError('Foreign origin blocked');
    }) as typeof fetch, async () => {
      await assert.rejects(resource('valid-token'), (err: unknown) =>
        err instanceof ApiError && err.kind === 'network');
    });
    let calls = 0;
    await withFetch((async () => { calls++; return json(aUsers); }) as typeof fetch, async () => {
      await assert.rejects(resource(''), (err: unknown) =>
        err instanceof ApiError && err.kind === 'protocol');
    });
    assert.equal(calls, 0);
  }
});


test('pinned backend cash refund cap fields roundtrip exactly: null unlimited, zero blocked, integer cap', async () => {
  const valid = [
    { cashRefundPerReturnMinor: null, cashRefundPerDayMinor: null },
    { cashRefundPerReturnMinor: 0, cashRefundPerDayMinor: 0 },
    { cashRefundPerReturnMinor: 50000, cashRefundPerDayMinor: 500000 },
  ];
  for (const caps of valid) {
    const envelope = {
      data: { ...aRoles.data, roles: [{ ...aRoles.data.roles[0], ...caps }] },
    };
    await withFetch((async () => json(envelope)) as typeof fetch, async () => {
      const response = await readTenantRoles('tenant-A-token');
      assert.deepEqual(response.data.roles[0]?.cashRefundPerReturnMinor, caps.cashRefundPerReturnMinor);
      assert.deepEqual(response.data.roles[0]?.cashRefundPerDayMinor, caps.cashRefundPerDayMinor);
    });
  }
});
