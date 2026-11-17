/** MOD-004 T20-R (#658): strict unmounted V2 Party identity-wide status transport. */
import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '../src/integration/errors.ts';
import { requestJson } from '../src/integration/http.ts';
import {
  decodePartyV2StatusReceipt,
  setTradingPartyStatusV2,
  verifyPartyV2StatusInput,
} from '../src/integration/party-v2-status.ts';

const origin = 'https://hisabiq-mod004.test';
const id = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const otherId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const input = () => ({ selectedRole: 'CUSTOMER', version: 5, status: 'INACTIVE' });
const updated = { data: { id, version: 6, selectedRole: 'CUSTOMER', status: 'INACTIVE' } };
const unchanged = { data: { ...updated.data, version: 5 } };
const json = (value: unknown, status = 200): Response => new Response(JSON.stringify(value), {
  status, headers: { 'content-type': 'application/json' },
});
const protocol = (error: unknown): boolean =>
  error instanceof ApiError && error.kind === 'protocol';
async function withFetch(mock: typeof fetch, run: () => Promise<void>): Promise<void> {
  const oldFetch = globalThis.fetch;
  const oldWindow = (globalThis as any).window;
  const oldLocation = (globalThis as any).location;
  (globalThis as any).fetch = mock;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await run(); }
  finally {
    (globalThis as any).fetch = oldFetch;
    if (oldWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = oldWindow;
    if (oldLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = oldLocation;
  }
}

test('exact authenticated POST status; no V1 fallback, Idempotency-Key, credentials or redirects', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v2/parties/' + id + '/status');
    assert.equal(init?.method, 'POST');
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('Authorization'), 'Bearer tenant-A');
    assert.equal(headers.get('Idempotency-Key'), null);
    assert.equal(headers.get('Content-Type'), 'application/json');
    assert.deepEqual(JSON.parse(String(init?.body)), input());
    assert.deepEqual(Object.keys(JSON.parse(String(init?.body))).sort(),
      ['selectedRole', 'status', 'version']);
    return json(updated);
  }) as typeof fetch, async () => {
    assert.deepEqual(await setTradingPartyStatusV2('tenant-A', id, input()), updated);
  });
  assert.equal(calls, 1);
});

test('same-state no-op returns unchanged version without retry or interpretation as a write', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v2/parties/' + id + '/status');
    assert.equal(init?.method, 'POST');
    return json(unchanged);
  }) as typeof fetch, async () => {
    assert.deepEqual(await setTradingPartyStatusV2('tenant-A', id, input()), unchanged);
  });
  assert.equal(calls, 1);
});

test('Supplier and Vendor selection support ACTIVE/INACTIVE while keeping exact role receipt', async () => {
  const values = [
    { selectedRole: 'SUPPLIER', version: 1, status: 'ACTIVE' },
    { selectedRole: 'VENDOR', version: 7, status: 'INACTIVE' },
  ];
  const expected: unknown[] = [];
  await withFetch((async (_url, init) => {
    const body = JSON.parse(String(init?.body)) as ReturnType<typeof input>;
    expected.push(body);
    return json({ data: { id, version: body.version + 1,
      selectedRole: body.selectedRole, status: body.status } });
  }) as typeof fetch, async () => {
    for (const item of values) {
      assert.equal(verifyPartyV2StatusInput(item).selectedRole, item.selectedRole);
      const got = await setTradingPartyStatusV2('tenant-B', id, item as any);
      assert.deepEqual(got.data, { id, version: item.version + 1,
        selectedRole: item.selectedRole, status: item.status });
    }
  });
  assert.deepEqual(expected, values);
});

test('preflight strictly rejects other ERP roles, extra/missing/invalid fields, unsafe IDs and tokens', async () => {
  const valid = input();
  const bad = [
    { ...valid, selectedRole: 'OWNER' }, { ...valid, selectedRole: 'BORROWER' },
    { ...valid, selectedRole: 'LENDER' }, { ...valid, selectedRole: 'PAYEE' },
    { ...valid, selectedRole: 'ALL' }, { ...valid, selectedRole: '' },
    { ...valid, version: 0 }, { ...valid, version: -1 },
    { ...valid, version: 1.1 }, { ...valid, version: Infinity },
    { ...valid, version: NaN }, { ...valid, version: Number.MAX_SAFE_INTEGER },
    { ...valid, status: 'SUSPENDED' }, { ...valid, status: 'DELETED' },
    { ...valid, roles: ['CUSTOMER'] }, { ...valid, opening: null },
    { ...valid, phone: '01711111111' }, { ...valid, name: 'Private name' },
    { ...valid, nid: 'private' }, { ...valid, address: 'private' },
    { ...valid, balance: {} }, { ...valid, globalHistory: true },
    { ...valid, creditLimitMinor: 100 }, { ...valid, tenantId: id },
  ];
  const missing = ['selectedRole', 'version', 'status'].map(key => {
    const v: Record<string, unknown> = { ...valid };
    delete v[key]; return v;
  });
  let calls = 0;
  await withFetch((async () => { calls++; return json(updated); }) as typeof fetch, async () => {
    for (const body of [...bad, ...missing]) {
      await assert.rejects(setTradingPartyStatusV2('tenant-A', id, body as any), protocol);
    }
    for (const badId of ['', 'bad', id.toLowerCase(), id + '/ledger',
      id + '?role=CUSTOMER', '../' + id, 'https://evil.example/' + id]) {
      await assert.rejects(setTradingPartyStatusV2('tenant-A', badId, valid), protocol);
    }
    for (const token of ['', 'bad token', 'bad\nheader']) {
      await assert.rejects(setTradingPartyStatusV2(token, id, valid), protocol);
    }
    for (const timeout of [0, -1, 0.5, 120001, Infinity, NaN]) {
      await assert.rejects(setTradingPartyStatusV2('tenant-A', id, valid, undefined, timeout), protocol);
    }
  });
  assert.equal(calls, 0);
});

test('strict receipt binds requested ID, role and status; only current or next version allowed', () => {
  assert.deepEqual(decodePartyV2StatusReceipt(updated, id, 'CUSTOMER', 5, 'INACTIVE'), updated);
  assert.deepEqual(decodePartyV2StatusReceipt(unchanged, id, 'CUSTOMER', 5, 'INACTIVE'), unchanged);
  for (const bad of [
    { data: { ...updated.data, id: otherId } },
    { data: { ...updated.data, selectedRole: 'SUPPLIER' } },
    { data: { ...updated.data, status: 'ACTIVE' } },
    { data: { ...updated.data, version: 4 } },
    { data: { ...updated.data, version: 7 } },
    { data: { ...updated.data, version: 5.5 } },
    { data: { ...updated.data, id: 'invalid' } },
    { data: { ...updated.data, name: 'secret' } },
    { data: { ...updated.data, nid: 'secret' } },
    { data: { ...updated.data, roles: ['CUSTOMER', 'SUPPLIER'] } },
    { data: { ...updated.data, balance: {} } },
    { data: { ...updated.data, profile: { state: 'VISIBLE' } } },
    { data: { ...updated.data, globalHistory: { state: 'VISIBLE' } } },
    { data: updated.data, extra: true }, { data: null }, { ok: true },
  ]) {
    assert.throws(() => decodePartyV2StatusReceipt(bad, id, 'CUSTOMER', 5, 'INACTIVE'), protocol);
  }
  assert.throws(() =>
    decodePartyV2StatusReceipt(updated, id, 'SUPPLIER', 5, 'INACTIVE'), protocol);
  assert.throws(() =>
    decodePartyV2StatusReceipt(updated, id, 'CUSTOMER', 5, 'ACTIVE'), protocol);
});

test('raw HTTP refuses all non-POST verbs, anonymous status, key and arbitrary V2 paths', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(updated); }) as typeof fetch, async () => {
    for (const method of ['GET', 'PATCH', 'PUT', 'DELETE']) {
      await assert.rejects(requestJson({
        method: method as any, path: '/api/v2/parties/' + id + '/status',
        body: input(), accessToken: 'tenant-A',
      }, v => v), protocol);
    }
    for (const value of [
      { method: 'POST', path: '/api/v2/parties/' + id + '/status',
        accessToken: 'tenant-A', operationId: otherId, body: input() },
      { method: 'POST', path: '/api/v2/parties/' + id + '/status', body: input() },
      { method: 'POST', path: '/api/v2/parties/' + id + '/status', accessToken: 'tenant-A' },
      { method: 'POST', path: '/api/v2/parties/' + id + '/status',
        accessToken: 'tenant-A', body: { ...input(), roles: ['CUSTOMER'] } },
      { method: 'POST', path: '/api/v2/parties/' + id + '/status?role=CUSTOMER',
        accessToken: 'tenant-A', body: input() },
      { method: 'POST', path: '/api/v2/parties/' + id + '/status/ledger',
        accessToken: 'tenant-A', body: input() },
      { method: 'POST', path: '/api/v2/parties/' + id + '/opening',
        accessToken: 'tenant-A', body: input() },
      { method: 'POST', path: '/api/v2/parties/' + id,
        accessToken: 'tenant-A', body: input() },
    ]) await assert.rejects(requestJson(value as any, v => v), protocol);
  });
  assert.equal(calls, 0);
});

test('HTTP failures are surfaced without retry/fallback: denied, missing, stale, locked, server', async () => {
  for (const status of [400, 401, 403, 404, 409, 423, 500, 503]) {
    let calls = 0;
    await withFetch((async url => {
      calls++;
      assert.equal(String(url), origin + '/api/v2/parties/' + id + '/status');
      return json({ error: { code: 'REFUSED', message: 'Action denied',
        details: {}, traceId: 'trace' } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(setTradingPartyStatusV2('tenant-A', id, input()), error =>
        error instanceof ApiError && error.kind === 'http' && error.status === status);
    });
    assert.equal(calls, 1);
  }
});

test('timeout, lost acknowledgement and abort remain unknown outcome; never auto-retry', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; throw new TypeError('connection dropped'); }) as typeof fetch,
    async () => {
      await assert.rejects(setTradingPartyStatusV2('tenant-A', id, input()), e =>
        e instanceof ApiError && e.kind === 'network');
    });
  assert.equal(calls, 1);
  calls = 0;
  await withFetch((async (_url, init) => {
    calls++;
    return new Promise<Response>((_resolve, reject) => {
      if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
      init?.signal?.addEventListener('abort',
        () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
  }) as typeof fetch, async () => {
    const abort = new AbortController();
    abort.abort();
    await assert.rejects(setTradingPartyStatusV2('tenant-A', id, input(), abort.signal),
      e => e instanceof ApiError && e.kind === 'network');
    await assert.rejects(setTradingPartyStatusV2('tenant-A', id, input(), undefined, 5),
      e => e instanceof ApiError && e.kind === 'network');
  });
  assert.equal(calls, 2);
});

test('two independent bearer contexts do not share role or version and never send a key', async () => {
  const seen: Array<{ token: string | null; body: unknown }> = [];
  await withFetch((async (_url, init) => {
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('Idempotency-Key'), null);
    const sent = JSON.parse(String(init?.body));
    seen.push({ token: headers.get('Authorization'), body: sent });
    return json({ data: { id, selectedRole: sent.selectedRole,
      version: sent.version + 1, status: sent.status } });
  }) as typeof fetch, async () => {
    await setTradingPartyStatusV2('tenant-A', id, input());
    await setTradingPartyStatusV2('tenant-B', id, {
      selectedRole: 'SUPPLIER', version: 6, status: 'ACTIVE',
    });
  });
  assert.deepEqual(seen, [
    { token: 'Bearer tenant-A', body: input() },
    { token: 'Bearer tenant-B', body: { selectedRole: 'SUPPLIER',
      version: 6, status: 'ACTIVE' } },
  ]);
});
