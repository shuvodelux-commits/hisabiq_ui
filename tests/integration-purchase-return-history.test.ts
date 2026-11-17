import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ApiError } from '../src/integration/errors.ts';
import {
  decodePurchaseReturnHistory,
  readPurchaseReturnHistory,
} from '../src/integration/purchase-return-history.ts';

const origin = 'https://hisabiq-r09-history.test';
const returnId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const purchaseId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const supplierId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const returnLineId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const sourceLineId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FB0';
const item = {
  id: returnId, number: 'PR-000012', purchaseId, purchaseNumber: 'PUR-000120',
  supplierPartyId: supplierId, supplierName: 'Supplier A',
  businessDate: '2026-11-13', reason: 'DAMAGED', note: null,
  returnValueMinor: 4000, receivedMinor: 1000, creditMinor: 3000,
  receiptAccountCode: 'BANK-01', receiptAccountName: 'Business bank',
  lines: [{
    id: returnLineId, purchaseLineId: sourceLineId,
    productId, productName: 'PVC Pipe', unitName: 'Feet',
    qty: 3000, valueMinor: 4000,
  }],
  createdAt: '2026-11-13T06:10:00.000Z',
};
const page = {
  returns: [item], nextCursor: null,
  totalValueMinor: 4000, totalReceivedMinor: 1000,
};
const protocol = (error: unknown) => error instanceof ApiError && error.kind === 'protocol';
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, run: () => Promise<void>): Promise<void> {
  const host = globalThis as unknown as { fetch: typeof fetch; window?: unknown; location?: unknown };
  const prevFetch = host.fetch;
  const prevWindow = host.window;
  const prevLocation = host.location;
  host.fetch = fake;
  host.window = { location: { origin } };
  host.location = { origin };
  try { await run(); }
  finally {
    host.fetch = prevFetch;
    if (prevWindow === undefined) delete host.window; else host.window = prevWindow;
    if (prevLocation === undefined) delete host.location; else host.location = prevLocation;
  }
}

test('R09H-01 backend uses an unwrapped typed list, independent actual cash vs supplier credit', () => {
  const result = decodePurchaseReturnHistory(page);
  assert.deepEqual(result, page);
  assert.equal(result.returns[0]?.receivedMinor, 1000);
  assert.equal(result.returns[0]?.creditMinor, 3000);
  assert.equal(result.returns[0]?.returnValueMinor, 4000);
  assert.equal(result.returns[0]?.purchaseId, purchaseId);
  assert.equal(result.returns[0]?.lines[0]?.purchaseLineId, sourceLineId);
});

test('R09H-02 GET uses bearer and the existing API transport without posting or body', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/purchase-returns?limit=20');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer user-A');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json(page);
  }) as typeof fetch, async () => {
    assert.deepEqual(await readPurchaseReturnHistory('user-A'), page);
  });
  assert.equal(calls, 1);
});

test('R09H-03 pagination cursor is opaque and safely URL-encoded', async () => {
  await withFetch((async (url, init) => {
    const parsed = new URL(String(url));
    assert.equal(parsed.pathname, '/api/v1/purchase-returns');
    assert.equal(parsed.searchParams.get('cursor'), 'opaque:2026/11+13=');
    assert.equal(parsed.searchParams.get('limit'), '25');
    assert.equal(init?.method, 'GET');
    return json({ ...page, nextCursor: 'another:cursor' });
  }) as typeof fetch, async () => {
    const result = await readPurchaseReturnHistory('user-A', { cursor: 'opaque:2026/11+13=', limit: 25 });
    assert.equal(result.nextCursor, 'another:cursor');
  });
});

test('R09H-04 malformed headers, envelopes, unknown or missing fields fail closed', () => {
  const malformed: unknown[] = [
    { data: page },
    { ...page, unexpected: true },
    { returns: page.returns, nextCursor: null, totalValueMinor: 4000 },
    { ...page, nextCursor: 5 },
    { ...page, returns: [{ ...item, unexpected: 'no' }] },
    { ...page, returns: [{ ...item, purchaseId: 'not-a-ulid' }] },
    { ...page, returns: [{ ...item, reason: 'CANCELLED' }] },
    { ...page, returns: [{ ...item, businessDate: '2026-02-30' }] },
    { ...page, returns: [{ ...item, createdAt: 'tomorrow' }] },
    { ...page, returns: [{ ...item, receiptAccountName: 23 }] },
    { ...page, returns: [{ ...item, lines: [{ ...item.lines[0], extra: 1 }] }] },
    { ...page, returns: [{ ...item, lines: [{ ...item.lines[0], qty: 2.5 }] }] },
  ];
  for (const value of malformed) assert.throws(() => decodePurchaseReturnHistory(value), protocol);
});

test('R09H-05 rejects unsafe/negative poisha, duplicates and excessive refund records', () => {
  for (const bad of [
    { ...page, totalValueMinor: Number.MAX_SAFE_INTEGER + 1 },
    { ...page, totalReceivedMinor: -1 },
    { ...page, returns: [item, item] },
    { ...page, returns: [{ ...item, receivedMinor: 5000 }] },
    { ...page, returns: [{ ...item, creditMinor: -1 }] },
    { ...page, returns: [{ ...item, lines: [item.lines[0], item.lines[0]] }] },
    { ...page, returns: [{ ...item, lines: [{ ...item.lines[0], qty: -1000 }] }] },
  ]) assert.throws(() => decodePurchaseReturnHistory(bad), protocol);
});

test('R09H-06 positive stock quantity with zero poisha is valid; no invented supplier refund', () => {
  const freeLine = { ...item.lines[0], qty: 1000, valueMinor: 0 };
  const freeReturn = { ...item, returnValueMinor: 0, receivedMinor: 0, creditMinor: 0, lines: [freeLine] };
  assert.equal(decodePurchaseReturnHistory({
    returns: [freeReturn], nextCursor: null, totalValueMinor: 0, totalReceivedMinor: 0,
  }).returns[0]?.lines[0]?.valueMinor, 0);
});

test('R09H-07 invalid query and missing token are rejected before sending a request', async () => {
  let called = false;
  await withFetch((async () => { called = true; return json(page); }) as typeof fetch, async () => {
    await assert.rejects(readPurchaseReturnHistory('', {}), protocol);
    await assert.rejects(readPurchaseReturnHistory('user', { limit: 0 }), protocol);
    await assert.rejects(readPurchaseReturnHistory('user', { limit: 101 }), protocol);
    await assert.rejects(readPurchaseReturnHistory('user', { cursor: '' }), protocol);
    await assert.rejects(readPurchaseReturnHistory('user', { cursor: 'x'.repeat(2000) }), protocol);
    await assert.rejects(readPurchaseReturnHistory('user', { limit: 20 }, undefined, 0), protocol);
  });
  assert.equal(called, false);
});

test('R09H-08 HTTP 401/403/404, malformed 200, network and abort do not fall back', async () => {
  for (const status of [401, 403, 404]) {
    await withFetch((async () => json({ error: 'unavailable' }, status)) as typeof fetch, async () => {
      await assert.rejects(readPurchaseReturnHistory('user'), (e: unknown) =>
        e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
  }
  await withFetch((async () => json({ data: page })) as typeof fetch, async () => {
    await assert.rejects(readPurchaseReturnHistory('user'), protocol);
  });
  await withFetch((async () => { throw new Error('offline'); }) as typeof fetch, async () => {
    await assert.rejects(readPurchaseReturnHistory('user'), (e: unknown) =>
      e instanceof ApiError && e.kind === 'network');
  });
  await withFetch((async (_url, init) => {
    if (init?.signal?.aborted) throw new Error('aborted');
    return json(page);
  }) as typeof fetch, async () => {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(readPurchaseReturnHistory('user', {}, controller.signal),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
  });
});

const source = readFileSync(new URL('../src/pages/Purchases.tsx', import.meta.url), 'utf8');
const connected = source.split('function ConnectedPurchasesRead()')[1]?.split('function PreviewPurchases()')[0] ?? '';
const preview = source.split('function PreviewPurchases()')[1] ?? '';

test('R09H-09 history UI requires view permission, identity-bound GET, abort and error/empty states', () => {
  assert.match(connected, /purchase\.return\.view/);
  assert.match(connected, /readPurchaseReturnHistory\(token, \{ cursor: historyCursor, limit: 20 \}, controller\.signal\)/);
  assert.match(connected, /historyKey = \[identity, 'return-history', historyCursor \?\? 'first', historyRevision\]\.join\(':'\)/);
  assert.match(connected, /purchaseVisibleState\(history, historyKey\)/);
  assert.match(connected, /tab !== 'return-history'/);
  assert.match(connected, /return \(\) => controller\.abort\(\)/);
  assert.match(connected, /visibleHistory\.status === 'denied'/);
  assert.match(connected, /visibleHistory\.status === 'error'/);
  assert.match(connected, /historyRows\.length === 0/);
  assert.match(connected, /setHistoryRevision\(value => value \+ 1\)/);
});

test('R09H-10 history displays distinct money components and source IDs with pagination', () => {
  assert.match(connected, /data-purchase-return-history-table=""/);
  assert.match(connected, /purchaseMoney\(item\.returnValueMinor\)/);
  assert.match(connected, /purchaseMoney\(item\.receivedMinor\)/);
  assert.match(connected, /purchaseMoney\(item\.creditMinor\)/);
  assert.match(connected, /item\.purchaseNumber/);
  assert.match(connected, /item\.lines\.map\(line/);
  assert.match(connected, /setHistoryCursor\(visibleHistory\.data\?\.nextCursor \?\? null\)/);
});

test('R09H-11 preview and previous connected source panel are preserved and no posting added', () => {
  assert.match(source, /export function Purchases\(\)/);
  assert.match(preview, /<PurchaseSourceDialog/);
  assert.match(preview, /sampleReturnHistory/);
  assert.match(connected, /data-purchase-returnable-review=""/);
  assert.match(connected, /data-purchase-return-history-table=""/);
  assert.doesNotMatch(connected, /createPreviewPurchase|availablePurchaseEvents|PurchaseSourceDialog|erpDemoStore/);
  assert.doesNotMatch(connected, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
});
