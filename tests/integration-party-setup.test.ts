import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { decodePartySetup, readPartySetup } from '../src/integration/party-setup.ts';

const origin = 'https://hisabiq-party-setup.test';
const groupId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const secondId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const setup = {
  groups: [{ id: groupId, name: 'Retail' }, { id: secondId, name: 'Wholesale' }],
  features: { customerGroups: true, vendors: true },
  fields: { address: true, guardianName: false, nid: false, email: true, notes: false },
};
const off = { ...setup, groups: [], features: { customerGroups: false, vendors: false } };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, action: () => Promise<void>): Promise<void> {
  const oldFetch = globalThis.fetch;
  const oldWindow = (globalThis as any).window;
  const oldLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await action(); } finally {
    (globalThis as any).fetch = oldFetch;
    if (oldWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = oldWindow;
    if (oldLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = oldLocation;
  }
}

test('setup makes one exact authenticated GET with no money, session, retry or mutation fields', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/party-setup');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-A');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    assert.equal(new Headers(init?.headers).has('X-Tenant-Id'), false);
    return json({ data: setup });
  }) as typeof fetch, async () => {
    const result = await readPartySetup('tenant-A');
    assert.deepEqual(result.data.groups, setup.groups);
    assert.deepEqual(result.data.fields, setup.fields);
    assert.equal(result.data.features.vendors, true);
  });
  assert.equal(calls, 1);
});

test('feature OFF hides selectable groups even if historical server groups persist', async () => {
  assert.deepEqual(decodePartySetup({ data: off }).data.groups, []);
  assert.equal(decodePartySetup({ data: off }).data.features.vendors, false);
  assert.throws(() => decodePartySetup({
    data: { ...off, groups: [{ id: groupId, name: 'Hidden historic group' }] },
  }), ApiError);
});

test('field visibility is server boolean data, not inferred from default UI fields', () => {
  const result = decodePartySetup({ data: {
    ...setup, fields: { address: false, guardianName: false, nid: false,
      email: false, notes: false },
  } });
  assert.equal(result.data.fields.email, false);
  assert.equal(result.data.features.customerGroups, true);
});

test('group ID, names and flag keys must match exact Nest contract', () => {
  const wrong = [
    {},
    { data: { ...setup, groups: 'Retail' } },
    { data: { ...setup, groups: [{ id: 'preview-group', name: 'Retail' }] } },
    { data: { ...setup, groups: [{ id: groupId, name: '' }] } },
    { data: { ...setup, groups: [{ id: groupId, name: ' Retail ' }] } },
    { data: { ...setup, groups: [{ id: groupId, name: 'a'.repeat(121) }] } },
    { data: { ...setup, groups: [setup.groups[0], setup.groups[0]] } },
    { data: { ...setup, groups: [{ ...setup.groups[0], archived: false }] } },
    { data: { ...setup, features: { customerGroups: 'false', vendors: true } } },
    { data: { ...setup, features: { customerGroups: true } } },
    { data: { ...setup, features: { ...setup.features, ownerLoans: true } } },
    { data: { ...setup, fields: { ...setup.fields, email: 'false' } } },
    { data: { ...setup, fields: { ...setup.fields, ownerOnly: true } } },
    { data: { ...setup, fields: { address: true } } },
    { data: { ...setup, untrustedAmount: 100 } },
    { data: setup, tenantId: 'client-tenant' },
    setup,
  ];
  for (const item of wrong) assert.throws(() => decodePartySetup(item), ApiError);
});

test('client uses no shared or cross-tenant cache between access tokens', async () => {
  const seen: string[] = [];
  await withFetch((async (_url, init) => {
    const token = new Headers(init?.headers).get('Authorization') ?? '';
    seen.push(token);
    return json({ data: token === 'Bearer A' ? setup : off });
  }) as typeof fetch, async () => {
    const a = await readPartySetup('A');
    const b = await readPartySetup('B');
    assert.equal(a.data.groups.length, 2);
    assert.equal(b.data.groups.length, 0);
    assert.equal(b.data.features.vendors, false);
  });
  assert.deepEqual(seen, ['Bearer A', 'Bearer B']);
});

test('bad access token or invalid timeout prevents network request', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: setup }); }) as typeof fetch, async () => {
    for (const execute of [
      () => readPartySetup(''),
      () => readPartySetup('two tokens'),
      () => readPartySetup('ok', undefined, 0),
      () => readPartySetup('ok', undefined, 120001),
      () => readPartySetup('ok', undefined, 1.5),
    ]) await assert.rejects(execute(), (e: unknown) =>
      e instanceof ApiError && e.kind === 'protocol');
  });
  assert.equal(calls, 0);
});

for (const status of [401, 403, 404, 503]) {
  test('HTTP ' + status + ' never falls back to fixture groups or retries', async () => {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: { code: 'DENIED', message: 'Denied', details: {}, traceId: 'abc' } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(readPartySetup('A'), (e: unknown) =>
        e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
    assert.equal(calls, 1);
  });
}

test('abort, timeout, offline errors reject without retry or partial setup', async () => {
  for (const why of ['abort', 'timeout', 'offline']) {
    const controller = new AbortController();
    let calls = 0;
    await withFetch((async (_url, init) => {
      calls++;
      if (why === 'offline') throw new TypeError('Offline');
      return await new Promise<Response>((_resolve, reject) => {
        if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')), { once: true });
        if (why === 'abort') controller.abort();
      });
    }) as typeof fetch, async () => {
      await assert.rejects(readPartySetup('A', controller.signal, 5), (e: unknown) =>
        e instanceof ApiError && e.kind === 'network');
    });
    assert.equal(calls, 1);
  }
});
