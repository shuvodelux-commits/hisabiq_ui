import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { ApiError } from '../src/integration/errors.ts';
import {
  decodeReturnableSale, decodeReturnablePurchase,
  readReturnableSale, readReturnablePurchase,
} from '../src/integration/returns.ts';

const origin = 'https://hisabiq-r09.test';
const saleId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const purchaseId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const partyId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const saleLineId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const purchaseLineId = '01ARZ3NDEKTSV4RRFFQ69G5FB0';
const lotId = '01ARZ3NDEKTSV4RRFFQ69G5FB1';
const serialId = '01ARZ3NDEKTSV4RRFFQ69G5FB2';

const sale = {
  saleId, number: 'INV-2026-42', businessDate: '2026-11-13',
  customerName: 'Customer A', customerPhone: null, customerAddress: null,
  customerGuardianName: null, partyId, isWalkIn: false,
  grandTotalMinor: 10000, dueMinor: 2000,
  lines: [{
    saleLineId, productId, productName: 'Bulb', unitName: 'Pcs',
    qtySold: 3000, qtyReturned: 1000, qtyReturnable: 2000,
    valueReturnedMinor: 3333, unitPriceMinor: 3333, netAmountMinor: 10000,
    returnable: true, tracksSerial: true,
    serials: [{ id: serialId, serialNo: 'SN-0001', sourceType: 'OWNED', vendorPartyId: null }],
  }],
  refundLimit: { perReturnMinor: 5000, perDayMinor: 15000, usedTodayMinor: 2000 },
};
const purchase = {
  purchaseId, number: 'PUR-2026-42', businessDate: '2026-11-13',
  supplierName: 'Supplier B', supplierPartyId: partyId,
  grandTotalMinor: 3, outstandingMinor: 1,
  lines: [{
    purchaseLineId, productId, productName: 'Bulb', unitName: 'Pcs',
    lotId, qtyReceived: 5000, qtyReturned: 1000,
    qtyReturnable: 4000, qtyRemainingInLot: 3500,
    valueReturnedMinor: 1, costReturnedMinor: 2,
    billedNetMinor: 3, actualUnitCost: 200,
  }],
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, run: () => Promise<void>): Promise<void> {
  const previousFetch = globalThis.fetch;
  const previousWindow = (globalThis as any).window;
  const previousLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await run(); }
  finally {
    (globalThis as any).fetch = previousFetch;
    if (previousWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = previousWindow;
    if (previousLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = previousLocation;
  }
}
const protocol = (error: unknown): boolean =>
  error instanceof ApiError && error.kind === 'protocol';

test('R09G-01 GET sale returnable requires auth and preserves source and refund caps', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls += 1;
    assert.equal(String(url), origin + '/api/v1/sales-returns/returnable/' + saleId);
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer user-A');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json({ data: sale });
  }) as typeof fetch, async () => {
    const response = await readReturnableSale('user-A', saleId);
    assert.deepEqual(response, { data: sale });
    assert.equal(response.data.refundLimit.usedTodayMinor, 2000);
    assert.equal(response.data.lines[0]?.serials[0]?.sourceType, 'OWNED');
  });
  assert.equal(calls, 1);
});

test('R09G-02 GET purchase returnable preserves lot and distinct booked cost/credit', async () => {
  await withFetch((async (url, init) => {
    assert.equal(String(url), origin + '/api/v1/purchase-returns/returnable/' + purchaseId);
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer supplier-user');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json({ data: purchase });
  }) as typeof fetch, async () => {
    const result = await readReturnablePurchase('supplier-user', purchaseId);
    assert.deepEqual(result, { data: purchase });
    assert.equal(result.data.lines[0]?.lotId, lotId);
    assert.equal(result.data.lines[0]?.valueReturnedMinor, 1);
    assert.equal(result.data.lines[0]?.costReturnedMinor, 2);
  });
});

test('R09G-03 posted prior money is passed through unchanged, never re-rounded', () => {
  const result = decodeReturnableSale({ data: sale });
  assert.equal(result.data.lines[0]?.qtyReturned, 1000);
  assert.equal(result.data.lines[0]?.valueReturnedMinor, 3333);
  assert.equal(result.data.lines[0]?.netAmountMinor, 10000);
});

test('R09G-04 zero-poisha source quantities remain valid with no invented money', () => {
  const zeroSale = structuredClone(sale);
  zeroSale.lines[0]!.qtyReturned = 0;
  zeroSale.lines[0]!.qtyReturnable = zeroSale.lines[0]!.qtySold;
  zeroSale.lines[0]!.netAmountMinor = 0;
  zeroSale.lines[0]!.unitPriceMinor = 0;
  zeroSale.lines[0]!.valueReturnedMinor = 0;
  assert.equal(decodeReturnableSale({ data: zeroSale }).data.lines[0]?.netAmountMinor, 0);

  const zeroPurchase = structuredClone(purchase);
  zeroPurchase.lines[0]!.billedNetMinor = 0;
  zeroPurchase.lines[0]!.valueReturnedMinor = 0;
  assert.equal(decodeReturnablePurchase({ data: zeroPurchase }).data.lines[0]?.billedNetMinor, 0);
});

test('R09G-05 strict sale decoder rejects unexpected/missing fields and unsafe quantities', () => {
  const variants: unknown[] = [
    sale,
    { data: sale, extra: true },
    { data: { ...sale, unknown: true } },
    { data: { ...sale, refundLimit: { usedTodayMinor: 0 } } },
    { data: { ...sale, lines: [{ ...sale.lines[0], unknown: true }] } },
    { data: { ...sale, lines: [{ ...sale.lines[0], qtySold: 3000.5 }] } },
    { data: { ...sale, lines: [{ ...sale.lines[0], valueReturnedMinor: Number.MAX_SAFE_INTEGER + 1 }] } },
    { data: { ...sale, businessDate: '2026-02-30' } },
    { data: { ...sale, customerPhone: 123 } },
    { data: { ...sale, partyId: 'invalid' } },
    { data: { ...sale, refundLimit: { perReturnMinor: -1, perDayMinor: null, usedTodayMinor: 0 } } },
  ];
  for (const v of variants) assert.throws(() => decodeReturnableSale(v), protocol);
});

test('R09G-05 purchase decoder rejects malformed field and unsafe minor values', () => {
  for (const value of [
    { data: { ...purchase, lines: [{ ...purchase.lines[0], actualUnitCost: NaN }] } },
    { data: { ...purchase, lines: [{ ...purchase.lines[0], billedNetMinor: -1 }] } },
    { data: { ...purchase, lines: [{ ...purchase.lines[0], qtyReceived: 1.5 }] } },
    { data: { ...purchase, lines: [{ ...purchase.lines[0], productId: 'x' }] } },
    { data: { ...purchase, lines: [{ ...purchase.lines[0], unknown: 'no' }] } },
    { data: { ...purchase, grandTotalMinor: Number.MAX_SAFE_INTEGER + 1 } },
  ]) assert.throws(() => decodeReturnablePurchase(value), protocol);
});

test('R09G-06 a well-formed different source may never fill requested source', async () => {
  await withFetch((async () => json({ data: sale })) as typeof fetch, async () => {
    await assert.rejects(readReturnableSale('user', purchaseId), protocol);
  });
  await withFetch((async () => json({ data: purchase })) as typeof fetch, async () => {
    await assert.rejects(readReturnablePurchase('user', saleId), protocol);
  });
});

test('R09G-07 duplicate source lines and duplicate serial IDs fail closed', () => {
  assert.throws(() => decodeReturnableSale({
    data: { ...sale, lines: [sale.lines[0], sale.lines[0]] },
  }), protocol);
  const serial = sale.lines[0]!.serials[0]!;
  assert.throws(() => decodeReturnableSale({
    data: { ...sale, lines: [{ ...sale.lines[0], serials: [serial, serial] }] },
  }), protocol);
  assert.throws(() => decodeReturnablePurchase({
    data: { ...purchase, lines: [purchase.lines[0], purchase.lines[0]] },
  }), protocol);
});

test('R09G-07 source quantity mismatch and negative lot fail closed', () => {
  assert.throws(() => decodeReturnableSale({
    data: { ...sale, lines: [{ ...sale.lines[0], qtyReturned: 1001 }] },
  }), protocol);
  assert.throws(() => decodeReturnablePurchase({
    data: { ...purchase, lines: [{ ...purchase.lines[0], qtyRemainingInLot: -1 }] },
  }), protocol);
  assert.throws(() => decodeReturnablePurchase({
    data: { ...purchase, lines: [{ ...purchase.lines[0], valueReturnedMinor: 4 }] },
  }), protocol);
});

test('R09G-08 malformed 200, HTTP 401/403/404 and network failure never fall back', async () => {
  for (const status of [401, 403, 404]) {
    await withFetch((async () => json({ error: 'denied' }, status)) as typeof fetch, async () => {
      await assert.rejects(readReturnableSale('user', saleId), (e: unknown) =>
        e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
  }
  await withFetch((async () => json({ data: [] })) as typeof fetch, async () => {
    await assert.rejects(readReturnablePurchase('user', purchaseId), protocol);
  });
  await withFetch((async () => { throw new Error('connection reset'); }) as typeof fetch, async () => {
    await assert.rejects(readReturnableSale('user', saleId), (e: unknown) =>
      e instanceof ApiError && e.kind === 'network');
  });
});

test('R09G-08/09 invalid source ID, timeout range and abort have no success path', async () => {
  let calls = 0;
  await withFetch((async (_url, init) => {
    calls += 1;
    if (init?.signal?.aborted) throw new Error('aborted');
    return json({ data: sale });
  }) as typeof fetch, async () => {
    await assert.rejects(readReturnableSale('user', 'not-an-id'), protocol);
    await assert.rejects(readReturnablePurchase('user', purchaseId, undefined, 120001), protocol);
    assert.equal(calls, 0);
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(readReturnableSale('user', saleId, controller.signal), (e: unknown) =>
      e instanceof ApiError && e.kind === 'network');
    assert.equal(calls, 1);
  });
});

test('R09G-10 source adapter stays unmounted and never performs POST', () => {
  const adapter = readFileSync(new URL('../src/integration/returns.ts', import.meta.url), 'utf8');
  assert.match(adapter, /method:\s*'GET'/);
  assert.doesNotMatch(adapter, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(adapter, /salesPreviewStore|availablePurchases|localStorage|sessionStorage/);
});
