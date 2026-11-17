import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '../src/integration/errors.ts';
import {
  createTradingPartyV2,
  decodePartyV2CreateReceipt,
  verifyPartyV2CreateInput,
} from '../src/integration/party-v2-create.ts';

const origin = 'https://hisabiq-mod004.test';
const id = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const operation = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const expectedReceipt = {
  data: { id, version: 1, selectedRole: 'CUSTOMER', status: 'ACTIVE' },
};
const input = () => ({
  selectedRole: 'CUSTOMER', name: 'নতুন ক্রেতা', roles: ['CUSTOMER'],
  phone: '01712345678', address: null, guardianName: null, nid: null,
  email: null, notes: null, customerGroupId: null, creditLimitMinor: null,
});
function json(body: unknown, status = 201): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
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
function isProtocol(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'protocol';
}

test('V2 create sends one exact POST with bearer, original operation ID and directory-only body', async () => {
  let calls = 0;
  await withFetch((async (url, options) => {
    calls++;
    assert.equal(String(url), origin + '/api/v2/parties');
    assert.equal(options?.method, 'POST');
    assert.equal(options?.redirect, 'error');
    assert.equal(options?.credentials, 'omit');
    const headers = new Headers(options?.headers);
    assert.equal(headers.get('Authorization'), 'Bearer session-A');
    assert.equal(headers.get('Idempotency-Key'), operation);
    assert.equal(headers.get('Content-Type'), 'application/json');
    assert.deepEqual(JSON.parse(String(options?.body)), input());
    assert.equal(Object.keys(JSON.parse(String(options?.body))).length, 11);
    return json(expectedReceipt);
  }) as typeof fetch, async () => {
    assert.deepEqual(await createTradingPartyV2('session-A', operation, input()), expectedReceipt);
  });
  assert.equal(calls, 1);
});

test('Supplier and shared relationship create keep one explicit selected trading role', async () => {
  const supplier = { ...input(), selectedRole: 'SUPPLIER', roles: ['CUSTOMER', 'SUPPLIER'] };
  const supplierReceipt = { data: { ...expectedReceipt.data, selectedRole: 'SUPPLIER' } };
  assert.deepEqual(verifyPartyV2CreateInput(supplier), supplier);
  await withFetch((async (_url, init) => {
    assert.deepEqual(JSON.parse(String(init?.body)), supplier);
    return json(supplierReceipt);
  }) as typeof fetch, async () => {
    assert.deepEqual(await createTradingPartyV2('session-B', operation, supplier), supplierReceipt);
  });
});

test('reject missing fields, unknown data, finance roles, duplicates and any historical opening before network', async () => {
  const all = [
    { ...input(), opening: null },
    { ...input(), opening: { role: 'CUSTOMER', amountMinor: 5000 } },
    { ...input(), globalHistory: true },
    { ...input(), balance: { netMinor: 50 } },
    { ...input(), tenantId: id },
    { ...input(), selectedRole: 'All' },
    { ...input(), selectedRole: 'OWNER' },
    { ...input(), selectedRole: 'LENDER' },
    { ...input(), selectedRole: 'PAYEE' },
    { ...input(), roles: ['CUSTOMER', 'CUSTOMER'] },
    { ...input(), roles: ['CUSTOMER', 'BORROWER'] },
    { ...input(), selectedRole: 'SUPPLIER' },
    { ...input(), roles: [] },
    { ...input(), phone: 1712345678 },
    { ...input(), name: ' ' },
    { ...input(), name: 'a'.repeat(201) },
    { ...input(), creditLimitMinor: -1 },
    { ...input(), creditLimitMinor: 0.5 },
    { ...input(), creditLimitMinor: Number.MAX_SAFE_INTEGER + 1 },
    { ...input(), customerGroupId: 'not-id' },
    { ...input(), roles: ['SUPPLIER'], selectedRole: 'SUPPLIER', creditLimitMinor: 300 },
    { ...input(), roles: ['SUPPLIER'], selectedRole: 'SUPPLIER', customerGroupId: id },
    { ...input(), address: false },
    { ...input(), notes: 'n'.repeat(2001) },
    { ...input(), nid: 'n'.repeat(61) },
    { ...input(), email: 'e'.repeat(201) },
    { ...input(), guardianName: 'g'.repeat(201) },
  ];
  let calls = 0;
  await withFetch((async () => { calls++; return json(expectedReceipt); }) as typeof fetch, async () => {
    for (const payload of all) {
      await assert.rejects(createTradingPartyV2('session-A', operation, payload as any), isProtocol);
    }
    const missing: any = input();
    delete missing.notes;
    await assert.rejects(createTradingPartyV2('session-A', operation, missing), isProtocol);
    await assert.rejects(createTradingPartyV2('session-A', 'invalid', input()), isProtocol);
    await assert.rejects(createTradingPartyV2('bad token', operation, input()), isProtocol);
    await assert.rejects(createTradingPartyV2('', operation, input()), isProtocol);
  });
  assert.equal(calls, 0);
});

test('strict receipt refuses PII, role array, balances, global history, wrong role, ID, version or extra envelope', () => {
  assert.deepEqual(decodePartyV2CreateReceipt(expectedReceipt, 'CUSTOMER'), expectedReceipt);
  const bad = [
    { data: { ...expectedReceipt.data, nid: 'private' } },
    { data: { ...expectedReceipt.data, roles: ['CUSTOMER', 'SUPPLIER'] } },
    { data: { ...expectedReceipt.data, name: 'hidden' } },
    { data: { ...expectedReceipt.data, phone: '01712345678' } },
    { data: { ...expectedReceipt.data, profile: { state: 'VISIBLE' } } },
    { data: { ...expectedReceipt.data, globalHistory: { state: 'VISIBLE' } } },
    { data: { ...expectedReceipt.data, hasLedgerEntries: true } },
    { data: { ...expectedReceipt.data, balance: {} } },
    { data: { ...expectedReceipt.data, opening: null } },
    { data: { ...expectedReceipt.data, selectedRole: 'SUPPLIER' } },
    { data: { ...expectedReceipt.data, selectedRole: 'OWNER' } },
    { data: { ...expectedReceipt.data, id: 'invalid' } },
    { data: { ...expectedReceipt.data, version: 0 } },
    { data: { ...expectedReceipt.data, version: 1.5 } },
    { data: { ...expectedReceipt.data, status: 'DELETED' } },
    { data: expectedReceipt.data, meta: {} },
    { data: null },
    { ok: true },
  ];
  for (const response of bad) assert.throws(
    () => decodePartyV2CreateReceipt(response, 'CUSTOMER'), isProtocol,
  );
});

test('sends no V1 fallback and no retry on permission denial, conflict or HTTP 5xx', async () => {
  for (const status of [400, 401, 403, 404, 409, 500]) {
    let calls = 0;
    await withFetch((async (url) => {
      calls++;
      assert.equal(String(url), origin + '/api/v2/parties');
      return json({ error: {
        code: 'DENIED', message: 'Not permitted', details: {}, traceId: 'trace',
      } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(createTradingPartyV2('tenant-A', operation, input()),
        (error: unknown) => error instanceof ApiError &&
          error.kind === 'http' && error.status === status);
    });
    assert.equal(calls, 1);
  }
});

test('network loss leaves outcome unknown; caller-owned operation ID remains unchanged', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; throw new TypeError('lost acknowledgement'); }) as typeof fetch,
    async () => {
      await assert.rejects(createTradingPartyV2('tenant-A', operation, input()),
        (error: unknown) => error instanceof ApiError && error.kind === 'network');
    });
  assert.equal(calls, 1);
});

test('external abort and bounded timeout cannot auto-replay a create', async () => {
  let calls = 0;
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
    await assert.rejects(
      createTradingPartyV2('tenant-A', operation, input(), controller.signal),
      (error: unknown) => error instanceof ApiError && error.kind === 'network',
    );
    await assert.rejects(
      createTradingPartyV2('tenant-A', operation, input(), undefined, 5),
      (error: unknown) => error instanceof ApiError && error.kind === 'network',
    );
  });
  assert.equal(calls, 2);
});

test('no cross-tenant result cache or generated new retry ID', async () => {
  const actual: string[] = [];
  await withFetch((async (_url, init) => {
    const headers = new Headers(init?.headers);
    actual.push(headers.get('Authorization') + ':' + headers.get('Idempotency-Key'));
    return json(expectedReceipt);
  }) as typeof fetch, async () => {
    await createTradingPartyV2('tenant-A', operation, input());
    await createTradingPartyV2('tenant-B', id, input());
  });
  assert.deepEqual(actual, ['Bearer tenant-A:' + operation, 'Bearer tenant-B:' + id]);
});
