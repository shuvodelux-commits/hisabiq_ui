/** MOD-004 T19-R (#622): unmounted, strict V2 name/phone PATCH transport. */
import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '../src/integration/errors.ts';
import { requestJson } from '../src/integration/http.ts';
import {
  decodePartyV2EditReceipt,
  editTradingPartyNamePhoneV2,
  verifyPartyV2EditInput,
} from '../src/integration/party-v2-edit.ts';

const origin = 'https://hisabiq-mod004.test';
const id = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const otherId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const receipt = { data: { id, version: 2, selectedRole: 'CUSTOMER', status: 'ACTIVE' } };
const input = () => ({
  selectedRole: 'CUSTOMER', version: 1, name: 'নতুন নাম', phone: '01712345678',
});
function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { 'content-type': 'application/json' },
  });
}
function isProtocol(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'protocol';
}
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

test('one authenticated exact PATCH, body allowlist and minimal receipt, never Idempotency-Key', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v2/parties/' + id);
    assert.equal(init?.method, 'PATCH');
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('Authorization'), 'Bearer tenant-A');
    assert.equal(headers.get('Idempotency-Key'), null);
    assert.equal(headers.get('Content-Type'), 'application/json');
    assert.deepEqual(JSON.parse(String(init?.body)), input());
    assert.deepEqual(Object.keys(JSON.parse(String(init?.body))).sort(),
      ['name', 'phone', 'selectedRole', 'version']);
    return json(receipt);
  }) as typeof fetch, async () => {
    assert.deepEqual(await editTradingPartyNamePhoneV2('tenant-A', id, input()), receipt);
  });
  assert.equal(calls, 1);
});

test('Supplier EDIT with nullable phone keeps selectedRole, version and inactive receipt', async () => {
  const supplier = { ...input(), selectedRole: 'SUPPLIER', phone: null };
  const result = { data: { ...receipt.data, selectedRole: 'SUPPLIER', status: 'INACTIVE' } };
  assert.deepEqual(verifyPartyV2EditInput(supplier), supplier);
  await withFetch((async (_url, init) => {
    assert.deepEqual(JSON.parse(String(init?.body)), supplier);
    return json(result);
  }) as typeof fetch, async () => {
    assert.deepEqual(await editTradingPartyNamePhoneV2('tenant-B', id, supplier), result);
  });
});

test('reject malformed, missing or excess request fields and all non-trading roles before network', async () => {
  const invalid = [
    { ...input(), roles: ['CUSTOMER'] }, { ...input(), opening: null },
    { ...input(), nid: 'private' }, { ...input(), email: 'secret' },
    { ...input(), globalHistory: true }, { ...input(), balance: {} },
    { ...input(), creditLimitMinor: 10 }, { ...input(), customerGroupId: null },
    { ...input(), tenantId: id }, { ...input(), status: 'INACTIVE' },
    { ...input(), selectedRole: 'OWNER' }, { ...input(), selectedRole: 'LENDER' },
    { ...input(), selectedRole: 'BORROWER' }, { ...input(), selectedRole: 'PAYEE' },
    { ...input(), selectedRole: 'All' }, { ...input(), selectedRole: '' },
    { ...input(), version: 0 }, { ...input(), version: -1 },
    { ...input(), version: 1.1 }, { ...input(), version: Infinity },
    { ...input(), version: Number.MAX_SAFE_INTEGER + 1 },
    { ...input(), name: '' }, { ...input(), name: '  ' },
    { ...input(), name: 'N'.repeat(201) }, { ...input(), name: 999 },
    { ...input(), phone: '3'.repeat(31) }, { ...input(), phone: 123456 },
    { ...input(), phone: false }, { ...input(), phone: {} },
  ];
  const missing = ['name', 'phone', 'version', 'selectedRole'].map(key => {
    const value: Record<string, unknown> = input(); delete value[key]; return value;
  });
  let calls = 0;
  await withFetch((async () => { calls++; return json(receipt); }) as typeof fetch, async () => {
    for (const value of [...invalid, ...missing]) {
      await assert.rejects(editTradingPartyNamePhoneV2('tenant-A', id, value as any), isProtocol);
    }
    for (const badId of ['', 'bad-id', id.toLowerCase(), id + '/opening', '../' + id,
      id + '?role=CUSTOMER', 'https://evil.example/' + id]) {
      await assert.rejects(editTradingPartyNamePhoneV2('tenant-A', badId, input()), isProtocol);
    }
    for (const badToken of ['', 'bad token', 'bad\nheader']) {
      await assert.rejects(editTradingPartyNamePhoneV2(badToken, id, input()), isProtocol);
    }
    for (const badTimeout of [0, -1, 1.5, 120001, Infinity, NaN]) {
      await assert.rejects(editTradingPartyNamePhoneV2('tenant-A', id, input(), undefined, badTimeout), isProtocol);
    }
  });
  assert.equal(calls, 0);
});

test('strict receipt binds to requested ID and role, next version, safe status and no PII', () => {
  assert.deepEqual(decodePartyV2EditReceipt(receipt, id, 'CUSTOMER', 1), receipt);
  const invalid = [
    { data: { ...receipt.data, id: otherId } },
    { data: { ...receipt.data, id: 'bad' } },
    { data: { ...receipt.data, selectedRole: 'SUPPLIER' } },
    { data: { ...receipt.data, selectedRole: 'OWNER' } },
    { data: { ...receipt.data, version: 1 } },
    { data: { ...receipt.data, version: 3 } },
    { data: { ...receipt.data, version: 1.5 } },
    { data: { ...receipt.data, status: 'DELETED' } },
    { data: { ...receipt.data, phone: '01712345678' } },
    { data: { ...receipt.data, name: 'PII' } },
    { data: { ...receipt.data, nid: 'private' } },
    { data: { ...receipt.data, roles: ['CUSTOMER'] } },
    { data: { ...receipt.data, balance: {} } },
    { data: { ...receipt.data, profile: { state: 'VISIBLE' } } },
    { data: { ...receipt.data, globalHistory: { state: 'VISIBLE' } } },
    { data: receipt.data, extra: true }, { data: null }, { ok: true },
  ];
  for (const value of invalid) assert.throws(() =>
    decodePartyV2EditReceipt(value, id, 'CUSTOMER', 1), isProtocol);
});

test('raw HTTP refuses non-PATCH verbs, operationId, anonymous or other V2 paths before fetch', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(receipt); }) as typeof fetch, async () => {
    for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
      await assert.rejects(requestJson({
        method: method as any, path: '/api/v2/parties/' + id,
        body: input(), accessToken: 'tenant-A',
      }, raw => raw), isProtocol);
    }
    for (const values of [
      { method: 'PATCH', path: '/api/v2/parties/' + id, operationId: otherId,
        accessToken: 'tenant-A', body: input() },
      { method: 'PATCH', path: '/api/v2/parties/' + id, body: input() },
      { method: 'PATCH', path: '/api/v2/parties/' + id, accessToken: 'tenant-A' },
      { method: 'PATCH', path: '/api/v2/parties/' + id, accessToken: 'tenant-A',
        body: { ...input(), roles: ['SUPPLIER'] } },
      { method: 'PATCH', path: '/api/v2/parties/' + id + '/ledger',
        accessToken: 'tenant-A', body: input() },
      { method: 'PATCH', path: '/api/v2/parties/' + id + '?role=CUSTOMER',
        accessToken: 'tenant-A', body: input() },
    ]) await assert.rejects(requestJson(values as any, raw => raw), isProtocol);
  });
  assert.equal(calls, 0);
});

test('stale 409, permission/feature denials and server errors never retry or use V1', async () => {
  for (const status of [400, 401, 403, 404, 409, 423, 500]) {
    let calls = 0;
    await withFetch((async (url) => {
      calls++; assert.equal(String(url), origin + '/api/v2/parties/' + id);
      return json({ error: {
        code: 'DENIED', message: 'Refused', details: {}, traceId: 'trace',
      } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(editTradingPartyNamePhoneV2('tenant-A', id, input()),
        (e: unknown) => e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
    assert.equal(calls, 1);
  }
});

test('lost ACK, abort and timeout leave result unknown; zero automatic replay', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; throw new TypeError('lost connection'); }) as typeof fetch,
    async () => {
      await assert.rejects(editTradingPartyNamePhoneV2('tenant-A', id, input()),
        (e: unknown) => e instanceof ApiError && e.kind === 'network');
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
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(editTradingPartyNamePhoneV2('tenant-A', id, input(), controller.signal),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
    await assert.rejects(editTradingPartyNamePhoneV2('tenant-A', id, input(), undefined, 5),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
  });
  assert.equal(calls, 2);
});

test('two tenant bearer tokens and independent edits never share cache or operation ID', async () => {
  const observed: Array<{ token: string | null; body: unknown }> = [];
  await withFetch((async (_url, init) => {
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('Idempotency-Key'), null);
    observed.push({ token: headers.get('Authorization'), body: JSON.parse(String(init?.body)) });
    const b = JSON.parse(String(init?.body));
    return json({ data: { ...receipt.data, version: b.version + 1, selectedRole: b.selectedRole } });
  }) as typeof fetch, async () => {
    await editTradingPartyNamePhoneV2('tenant-A', id, input());
    await editTradingPartyNamePhoneV2('tenant-B', id, { ...input(), selectedRole: 'SUPPLIER', version: 2 });
  });
  assert.deepEqual(observed, [
    { token: 'Bearer tenant-A', body: input() },
    { token: 'Bearer tenant-B', body: { ...input(), selectedRole: 'SUPPLIER', version: 2 } },
  ]);
});
