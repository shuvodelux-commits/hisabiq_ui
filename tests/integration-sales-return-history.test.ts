import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ApiError } from '../src/integration/errors.ts';
import { decodeSalesReturnHistory, readSalesReturnHistory } from '../src/integration/sales-return-history.ts';

const origin = 'https://hisabiq-sales-return-history.test';
const returnId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const saleId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const partyId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const returnLineId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const saleLineId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FB0';

const returnRow = {
  id: returnId, number: 'SR-000023', saleId, saleNumber: 'INV-000043',
  partyId, customerName: 'Customer A',
  businessDate: '2026-11-13', reason: 'DAMAGED', note: null,
  returnValueMinor: 3000, refundMinor: 1000, creditMinor: 2000,
  refundAccountCode: 'BANK-01', refundAccountName: 'Business bank',
  approvedByName: null,
  lines: [{
    id: returnLineId, saleLineId, productId, productName: 'Switch',
    unitName: 'Pcs', qty: 3000, valueMinor: 3000,
  }],
  createdAt: '2026-11-13T07:15:00.000Z',
};
const response = {
  returns: [returnRow], nextCursor: null,
  totalValueMinor: 3000, totalRefundMinor: 1000,
};
const protocol = (e: unknown): boolean => e instanceof ApiError && e.kind === 'protocol';
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
async function withFetch(mock: typeof fetch, callback: () => Promise<void>): Promise<void> {
  const host = globalThis as unknown as { fetch: typeof fetch; window?: unknown; location?: unknown };
  const oldFetch = host.fetch;
  const oldWindow = host.window;
  const oldLocation = host.location;
  host.fetch = mock;
  host.window = { location: { origin } };
  host.location = { origin };
  try { await callback(); }
  finally {
    host.fetch = oldFetch;
    if (oldWindow === undefined) delete host.window; else host.window = oldWindow;
    if (oldLocation === undefined) delete host.location; else host.location = oldLocation;
  }
}

test('R09S-01 unwrapped source response preserves refund, credit, due allocation and original IDs', () => {
  assert.deepEqual(decodeSalesReturnHistory(response), response);
  assert.equal(decodeSalesReturnHistory(response).returns[0]?.refundMinor, 1000);
  assert.equal(decodeSalesReturnHistory(response).returns[0]?.creditMinor, 2000);
  assert.equal(decodeSalesReturnHistory(response).returns[0]?.returnValueMinor, 3000);
  assert.equal(decodeSalesReturnHistory(response).returns[0]?.saleId, saleId);
  assert.equal(decodeSalesReturnHistory(response).returns[0]?.lines[0]?.saleLineId, saleLineId);
});

test('R09S-02 read uses authenticated GET only, not POST or an idempotency key', async () => {
  let count = 0;
  await withFetch((async (url, init) => {
    count++;
    assert.equal(String(url), origin + '/api/v1/sales-returns?limit=20');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.body, undefined);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer cashier-token');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json(response);
  }) as typeof fetch, async () => {
    assert.deepEqual(await readSalesReturnHistory('cashier-token'), response);
  });
  assert.equal(count, 1);
});

test('R09S-03 query encodes an opaque cursor without modifying its meaning', async () => {
  await withFetch((async (url, init) => {
    const parsed = new URL(String(url));
    assert.equal(parsed.pathname, '/api/v1/sales-returns');
    assert.equal(parsed.searchParams.get('cursor'), 'next:2026/11+13=');
    assert.equal(parsed.searchParams.get('limit'), '25');
    assert.equal(init?.method, 'GET');
    return json({ ...response, nextCursor: 'next-page:v2' });
  }) as typeof fetch, async () => {
    const actual = await readSalesReturnHistory('cashier-token', { cursor: 'next:2026/11+13=', limit: 25 });
    assert.equal(actual.nextCursor, 'next-page:v2');
  });
});

test('R09S-04 exact contract rejects unknown fields, missing totals and false envelope', () => {
  const invalid: unknown[] = [
    { data: response },
    { ...response, extra: true },
    { ...response, totalRefundMinor: undefined },
    { ...response, nextCursor: 12 },
    { ...response, returns: [{ ...returnRow, extra: true }] },
    { ...response, returns: [{ ...returnRow, saleId: 'not-id' }] },
    { ...response, returns: [{ ...returnRow, saleNumber: null }] },
    { ...response, returns: [{ ...returnRow, createdAt: 'invalid' }] },
    { ...response, returns: [{ ...returnRow, businessDate: '2026-02-30' }] },
    { ...response, returns: [{ ...returnRow, reason: 'REFUND_ONLY' }] },
    { ...response, returns: [{ ...returnRow, approvedByName: 12 }] },
    { ...response, returns: [{ ...returnRow, lines: [{ ...returnRow.lines[0], extra: 1 }] }] },
  ];
  for (const raw of invalid) assert.throws(() => decodeSalesReturnHistory(raw), protocol);
});

test('R09S-05 unsafe quantities, negative minor values and duplicate line/return IDs fail closed', () => {
  const invalid = [
    { ...response, totalValueMinor: Number.MAX_SAFE_INTEGER + 1 },
    { ...response, totalRefundMinor: -1 },
    { ...response, returns: [returnRow, returnRow] },
    { ...response, returns: [{ ...returnRow, refundMinor: 4000 }] },
    { ...response, returns: [{ ...returnRow, creditMinor: -1 }] },
    { ...response, returns: [{ ...returnRow, lines: [returnRow.lines[0], returnRow.lines[0]] }] },
    { ...response, returns: [{ ...returnRow, lines: [{ ...returnRow.lines[0], qty: -1000 }] }] },
    { ...response, returns: [{ ...returnRow, lines: [{ ...returnRow.lines[0], qty: 0.5 }] }] },
    { ...response, returns: [{ ...returnRow, lines: [{ ...returnRow.lines[0], saleLineId: 'x' }] }] },
  ];
  for (const raw of invalid) assert.throws(() => decodeSalesReturnHistory(raw), protocol);
});

test('R09S-06 positive quantity and zero-poisha posted line remain valid', () => {
  const freeLine = { ...returnRow.lines[0], qty: 1000, valueMinor: 0 };
  const freeReturn = { ...returnRow, lines: [freeLine], returnValueMinor: 0, refundMinor: 0, creditMinor: 0,
    refundAccountCode: null, refundAccountName: null };
  const page = { returns: [freeReturn], nextCursor: null, totalValueMinor: 0, totalRefundMinor: 0 };
  assert.equal(decodeSalesReturnHistory(page).returns[0]?.lines[0]?.qty, 1000);
  assert.equal(decodeSalesReturnHistory(page).returns[0]?.returnValueMinor, 0);
});

test('R09S-07 invalid cursor, token, page limit and deadline fail before network request', async () => {
  let count = 0;
  await withFetch((async () => { count++; return json(response); }) as typeof fetch, async () => {
    await assert.rejects(readSalesReturnHistory(''), protocol);
    await assert.rejects(readSalesReturnHistory('invalid token'), protocol);
    await assert.rejects(readSalesReturnHistory('user', { limit: 0 }), protocol);
    await assert.rejects(readSalesReturnHistory('user', { limit: 101 }), protocol);
    await assert.rejects(readSalesReturnHistory('user', { cursor: '' }), protocol);
    await assert.rejects(readSalesReturnHistory('user', { cursor: 'bad\nrequest' }), protocol);
    await assert.rejects(readSalesReturnHistory('user', { cursor: 'x'.repeat(1100) }), protocol);
    await assert.rejects(readSalesReturnHistory('user', {}, undefined, 0), protocol);
  });
  assert.equal(count, 0);
});

test('R09S-08 401/403/404, malformed 200, offline and abort fail without fallback', async () => {
  for (const status of [401, 403, 404]) {
    await withFetch((async () => json({ error: 'denied' }, status)) as typeof fetch, async () => {
      await assert.rejects(readSalesReturnHistory('user'), (e: unknown) =>
        e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
  }
  await withFetch((async () => json({ data: response })) as typeof fetch, async () => {
    await assert.rejects(readSalesReturnHistory('user'), protocol);
  });
  await withFetch((async () => { throw Error('network down'); }) as typeof fetch, async () => {
    await assert.rejects(readSalesReturnHistory('user'), (e: unknown) =>
      e instanceof ApiError && e.kind === 'network');
  });
  await withFetch((async (_url, init) => {
    if (init?.signal?.aborted) throw Error('aborted');
    return json(response);
  }) as typeof fetch, async () => {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(readSalesReturnHistory('user', {}, controller.signal),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
  });
});

test('R09S-09 new adapter remains separate from existing preview-mode Sales UI', () => {
  const source = readFileSync(new URL('../src/pages/Sales.tsx', import.meta.url), 'utf8');
  const adapter = readFileSync(new URL('../src/integration/sales-return-history.ts', import.meta.url), 'utf8');
  assert.match(source, /salesPreviewStore/);
  assert.doesNotMatch(source, /readSalesReturnHistory/);
  assert.match(adapter, /method:\s*'GET'/);
  assert.doesNotMatch(adapter, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(adapter, /salesPreviewStore|localStorage|sessionStorage|toast\.success/);
});
