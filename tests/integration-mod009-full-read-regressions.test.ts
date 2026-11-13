import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { decodeSalesInvoices, readSalesInvoices } from '../src/integration/sales-invoices.ts';
import { decodeSalesInvoiceDetail, readSalesInvoiceDetail } from '../src/integration/sales-invoice-detail.ts';
import { decodeSalesReturnHistory, readSalesReturnHistory } from '../src/integration/sales-return-history.ts';
import { decodeReturnableSale, decodeReturnablePurchase, readReturnableSale, readReturnablePurchase } from '../src/integration/returns.ts';
import { salesInvoiceVisibleState, salesInvoiceSelectedId, formatSalesInvoiceMoney } from '../src/integration/sales-invoice-read-model.ts';
import { salesHistoryVisibleState, formatSalesHistoryQuantity } from '../src/integration/sales-return-history-read-model.ts';

const a = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const b = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const c = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const d = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const e = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const f = '01ARZ3NDEKTSV4RRFFQ69G5FB0';
const g = '01ARZ3NDEKTSV4RRFFQ69G5FB1';
const origin = 'https://mod009-regression.test';
const protocol = (error: unknown) => error instanceof ApiError && error.kind === 'protocol';

const invoiceRow = {
  originMode: 'ONLINE', id: a, number: 'INV-BN-001',
  partyId: b, customerName: 'রহিম', customerPhone: null,
  businessDate: '2026-11-13', dueDate: null, status: 'POSTED',
  grandTotalMinor: 1000, paidMinor: 500, dueMinor: 500, ageing: 'NOT_DUE',
};
const invoices = {
  items: [invoiceRow], nextCursor: null,
  totals: { salesMinor: 1000, receivedMinor: 500, dueMinor: 500, invoiceCount: 1 },
};
const saleLine = {
  id: c, productId: d, productName: 'Switch', displayName: null,
  unitName: 'Pcs', qty: 1000, unitPriceMinor: 1000, lineDiscountMinor: 0,
  lineTotalMinor: 1000, discountShareMinor: 0, netAmountMinor: 1000,
  source: 'OWN_STOCK', vendorPartyId: null, vendorName: null,
  isProvisionalCost: false, tracksSerial: false, allocations: [],
};
const saleDetail = {
  id: a, number: 'INV-BN-001', partyId: b, isWalkIn: false,
  customerName: 'রহিম', customerPhone: null, customerGuardianName: null,
  customerAddress: null, businessDate: '2026-11-13', dueDate: null,
  status: 'POSTED', notes: null, lines: [saleLine], payments: [],
  itemsTotalMinor: 1000, discountMinor: 0, grandTotalMinor: 1000,
  paidMinor: 0, dueMinor: 1000, changeMinor: 0, advanceMinor: 0,
  ageing: 'NOT_DUE', version: 1, presentation: null, receipts: [],
  warnings: [], originMode: 'ONLINE', originDeviceName: null,
  originDeviceCode: null, deviceCreatedAt: null,
};
const returnLine = {
  id: f, saleLineId: c, productId: d, productName: 'Switch',
  unitName: 'Pcs', qty: 1000, valueMinor: 1000,
};
const returnRow = {
  id: e, number: 'SR-001', saleId: a, saleNumber: 'INV-BN-001',
  partyId: b, customerName: 'রহিম', businessDate: '2026-11-13',
  reason: 'DAMAGED', note: null, returnValueMinor: 1000,
  refundMinor: 500, creditMinor: 200,
  refundAccountCode: 'CASH-01', refundAccountName: 'Cash',
  approvedByName: null, lines: [returnLine],
  createdAt: '2026-11-13T11:00:00.000Z',
};
const history = {
  returns: [returnRow], nextCursor: null, totalValueMinor: 1000, totalRefundMinor: 500,
};
const returnableSaleLine = {
  saleLineId: c, productId: d, productName: 'Switch', unitName: 'Pcs',
  qtySold: 2000, qtyReturned: 1000, valueReturnedMinor: 500,
  qtyReturnable: 1000, unitPriceMinor: 500, netAmountMinor: 1000,
  returnable: true, tracksSerial: false, serials: [],
};
const returnableSale = {
  data: {
    saleId: a, number: 'INV-BN-001', businessDate: '2026-11-13',
    customerName: 'রহিম', customerPhone: null, customerAddress: null,
    customerGuardianName: null, partyId: b, isWalkIn: false,
    grandTotalMinor: 1000, dueMinor: -100, lines: [returnableSaleLine],
    refundLimit: { perReturnMinor: null, perDayMinor: null, usedTodayMinor: 0 },
  },
};
const purchaseLine = {
  purchaseLineId: c, productId: d, productName: 'Switch', unitName: 'Pcs',
  lotId: g, qtyReceived: 2000, qtyReturned: 1000,
  valueReturnedMinor: 500, costReturnedMinor: 400,
  qtyReturnable: 1000, qtyRemainingInLot: 1000,
  billedNetMinor: 1000, actualUnitCost: 2000,
};
const returnablePurchase = {
  data: {
    purchaseId: a, number: 'PUR-001', businessDate: '2026-11-13',
    supplierName: 'Supply Co.', supplierPartyId: b, grandTotalMinor: 1000,
    outstandingMinor: -100, lines: [purchaseLine],
  },
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(mock: typeof fetch, task: () => Promise<void>): Promise<void> {
  const host = globalThis as unknown as { fetch: typeof fetch; window?: unknown; location?: unknown };
  const original = { fetch: host.fetch, window: host.window, location: host.location };
  host.fetch = mock;
  host.window = { location: { origin } };
  host.location = { origin };
  try { await task(); }
  finally {
    host.fetch = original.fetch;
    if (original.window === undefined) delete host.window; else host.window = original.window;
    if (original.location === undefined) delete host.location; else host.location = original.location;
  }
}

test('R09QA-01 records from an old tenant, user, permission, epoch, token or filter are masked before effect cleanup', () => {
  const data = { sensitive: 'tenant A' };
  const listKey = JSON.stringify(['tenantA', 'userA', 1, 'tokenA', ['sale.view'], 'INV', null]);
  const ready = { key: listKey, status: 'ready' as const, data };
  const changes = [
    ['tenantB', 'userA', 1, 'tokenA', ['sale.view'], 'INV', null],
    ['tenantA', 'userB', 1, 'tokenA', ['sale.view'], 'INV', null],
    ['tenantA', 'userA', 2, 'tokenA', ['sale.view'], 'INV', null],
    ['tenantA', 'userA', 1, 'tokenB', ['sale.view'], 'INV', null],
    ['tenantA', 'userA', 1, 'tokenA', [], 'INV', null],
    ['tenantA', 'userA', 1, 'tokenA', ['sale.view'], 'CHANGED', null],
    ['tenantA', 'userA', 1, 'tokenA', ['sale.view'], 'INV', 'cursor2'],
  ];
  assert.deepEqual(salesInvoiceVisibleState(ready, listKey), { status: 'ready', data });
  assert.deepEqual(salesHistoryVisibleState(ready, listKey), { status: 'ready', data });
  for (const changed of changes) {
    assert.deepEqual(salesInvoiceVisibleState(ready, JSON.stringify(changed)), { status: 'loading', data: null });
    assert.deepEqual(salesHistoryVisibleState(ready, JSON.stringify(changed)), { status: 'loading', data: null });
  }
});
test('R09QA-02 denied, error and loading states never leak retained server data', () => {
  for (const status of ['loading', 'denied', 'error'] as const) {
    const state = { key: 'k', status, data: null };
    assert.deepEqual(salesInvoiceVisibleState(state, 'k'), { status, data: null });
    assert.deepEqual(salesHistoryVisibleState(state, 'k'), { status, data: null });
  }
  assert.deepEqual(salesInvoiceVisibleState(null, 'k'), { status: 'loading', data: null });
  assert.deepEqual(salesHistoryVisibleState(null, 'k'), { status: 'loading', data: null });
});
test('R09QA-03 a detail may open only from a verified row on the current page and identity', () => {
  const current = [{ ...invoiceRow }, { ...invoiceRow, id: b }];
  for (const invalid of [
    null, { listKey: 'previous', id: a }, { listKey: 'new', id: c },
  ]) assert.equal(salesInvoiceSelectedId(invalid, 'new', current), null);
  assert.equal(salesInvoiceSelectedId({ listKey: 'new', id: b }, 'new', current), b);
  assert.equal(salesInvoiceSelectedId({ listKey: 'new', id: a }, 'new', []), null);
});
test('R09QA-04 exact poisha formatting preserves sign, zero and fractional cents', () => {
  for (const [minor, wanted] of [
    [0, '৳0.00'], [1, '৳0.01'], [99, '৳0.99'],
    [100, '৳1.00'], [101, '৳1.01'], [-1, '−৳0.01'],
    [-100, '−৳1.00'], [10000000, '৳1,00,000.00'],
  ] as const) assert.equal(formatSalesInvoiceMoney(minor), wanted);
  for (const invalid of [NaN, Infinity, -Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1, undefined, null]) {
    assert.equal(formatSalesInvoiceMoney(invalid), '—');
  }
});
test('R09QA-05 safe-integer extremes format with exact bigint poisha, never float rounding', () => {
  const max = Number.MAX_SAFE_INTEGER;
  assert.equal(formatSalesInvoiceMoney(max), '৳9,00,71,99,25,47,409.91');
  assert.equal(formatSalesInvoiceMoney(-max), '−৳9,00,71,99,25,47,409.91');
});
test('R09QA-06 scale-three quantities remain exact at every fractional boundary', () => {
  for (const [qty, wanted] of [
    [0, '0'], [1, '0.001'], [10, '0.01'], [100, '0.1'],
    [999, '0.999'], [1000, '1'], [1001, '1.001'],
    [1010, '1.01'], [1100, '1.1'], [1234567, '1,234.567'],
  ] as const) assert.equal(formatSalesHistoryQuantity(qty), wanted);
  for (const invalid of [-1, -1000, 0.001, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(formatSalesHistoryQuantity(invalid), '—');
  }
});
test('R09QA-07 sale list permits legitimate signed due and original ONLINE/OFFLINE, POSTED/VOIDED states', () => {
  const second = { ...invoiceRow, id: b, originMode: 'OFFLINE', status: 'VOIDED', dueMinor: -1,
    dueDate: '2026-12-01', ageing: 'D90_PLUS' };
  const decoded = decodeSalesInvoices({ ...invoices, items: [invoiceRow, second] });
  assert.equal(decoded.items[1]?.dueMinor, -1);
  assert.equal(decoded.items[1]?.originMode, 'OFFLINE');
  assert.equal(decoded.items[1]?.status, 'VOIDED');
});
for (const [name, modified] of [
  ['duplicate IDs', { ...invoices, items: [invoiceRow, invoiceRow] }],
  ['fractional aggregate', { ...invoices, totals: { ...invoices.totals, dueMinor: 0.5 } }],
  ['unsafe aggregate', { ...invoices, totals: { ...invoices.totals, salesMinor: Number.MAX_SAFE_INTEGER + 1 } }],
  ['negative count', { ...invoices, totals: { ...invoices.totals, invoiceCount: -1 } }],
  ['unrecognized origin', { ...invoices, items: [{ ...invoiceRow, originMode: 'LOCAL' }] }],
  ['unrecognized state', { ...invoices, items: [{ ...invoiceRow, status: 'DRAFT' }] }],
  ['invalid calendar date', { ...invoices, items: [{ ...invoiceRow, businessDate: '2026-02-30' }] }],
  ['unknown field', { ...invoices, items: [{ ...invoiceRow, ledgerBalance: 10 }] }],
  ['false data envelope', { data: invoices }],
] as const) test('R09QA-08 list decoder rejects ' + name, () => {
  assert.throws(() => decodeSalesInvoices(modified), protocol);
});
test('R09QA-09 cost-redacted invoice remains valid; source names and signed due are verbatim', () => {
  const detail = decodeSalesInvoiceDetail({ data: { ...saleDetail, dueMinor: -100,
    originMode: 'OFFLINE', originDeviceCode: 'DEVICE-A' } }).data;
  assert.equal(detail.dueMinor, -100);
  assert.equal(detail.lines[0]?.source, 'OWN_STOCK');
  assert.equal('costMinor' in detail.lines[0]!, false);
  assert.equal('profitMinor' in detail, false);
});
for (const [name, broken] of [
  ['zero source line quantity', { ...saleDetail, lines: [{ ...saleLine, qty: 0 }] }],
  ['negative source line quantity', { ...saleDetail, lines: [{ ...saleLine, qty: -1000 }] }],
  ['negative document version', { ...saleDetail, version: -1 }],
  ['unsafe paid amount', { ...saleDetail, paidMinor: Number.MAX_SAFE_INTEGER + 1 }],
  ['nested unknown permission cost', { ...saleDetail, lines: [{ ...saleLine, costMinor: null }] }],
  ['unexpected invoice field', { ...saleDetail, exposedToken: 'secret' }],
  ['duplicate payment identity', { ...saleDetail, payments: [
    { id: f, accountCode: 'CASH', accountName: 'Drawer', accountType: 'CASH', amountMinor: 500 },
    { id: f, accountCode: 'BANK', accountName: 'Bank', accountType: 'BANK', amountMinor: 500 },
  ] }],
] as const) test('R09QA-10 detail decoder rejects ' + name, () => {
  assert.throws(() => decodeSalesInvoiceDetail({ data: broken }), protocol);
});
test('R09QA-11 return history preserves amount applied to prior due (not all refund or credit)', () => {
  const result = decodeSalesReturnHistory(history).returns[0]!;
  assert.equal(result.returnValueMinor, 1000);
  assert.equal(result.refundMinor, 500);
  assert.equal(result.creditMinor, 200);
  assert.equal(result.returnValueMinor - result.refundMinor - result.creditMinor, 300);
});
for (const [name, broken] of [
  ['combined refund and credit exceeding return value', { ...history, returns: [{ ...returnRow, refundMinor: 800, creditMinor: 500 }] }],
  ['aggregate refund exceeding aggregate return value', { ...history, totalRefundMinor: 1001 }],
  ['duplicate return ID', { ...history, returns: [returnRow, returnRow] }],
  ['negative original quantity', { ...history, returns: [{ ...returnRow, lines: [{ ...returnLine, qty: -1 }] }] }],
  ['duplicate return source line', { ...history, returns: [{ ...returnRow, lines: [
    returnLine, { ...returnLine, id: g },
  ] }] }],
  ['bad return reason', { ...history, returns: [{ ...returnRow, reason: 'REPLACEMENT' }] }],
  ['invalid local date', { ...history, returns: [{ ...returnRow, businessDate: '2026-11-31' }] }],
] as const) test('R09QA-12 history decoder rejects ' + name, () => {
  assert.throws(() => decodeSalesReturnHistory(broken), protocol);
});
test('R09QA-13 sale returnability exposes actual source quantities, signed due and refund limits', () => {
  const data = decodeReturnableSale(returnableSale).data;
  assert.equal(data.dueMinor, -100);
  assert.equal(data.lines[0]?.qtyReturnable, 1000);
  assert.equal(data.refundLimit.perReturnMinor, null);
});
for (const [name, line] of [
  ['quantity greater than original', { ...returnableSaleLine, qtyReturned: 2001, qtyReturnable: 0 }],
  ['incorrect remaining quantity', { ...returnableSaleLine, qtyReturnable: 500 }],
  ['negative prior returned value', { ...returnableSaleLine, valueReturnedMinor: -1 }],
  ['over-returned monetary value', { ...returnableSaleLine, valueReturnedMinor: 1001 }],
  ['unsafe sell price', { ...returnableSaleLine, unitPriceMinor: Number.MAX_SAFE_INTEGER + 1 }],
] as const) test('R09QA-14 sale returnability rejects ' + name, () => {
  assert.throws(() => decodeReturnableSale({ data: { ...returnableSale.data, lines: [line] } }), protocol);
});
test('R09QA-15 source returnability rejects negative day limits and mismatched source', () => {
  assert.throws(() => decodeReturnableSale({ data: {
    ...returnableSale.data, refundLimit: { ...returnableSale.data.refundLimit, usedTodayMinor: -1 },
  } }), protocol);
  assert.equal(decodeReturnableSale(returnableSale).data.saleId, a);
});
test('R09QA-16 purchase source preserves separate billed value, actual unit cost, stock lot and signed outstanding', () => {
  const result = decodeReturnablePurchase(returnablePurchase).data;
  assert.equal(result.outstandingMinor, -100);
  assert.equal(result.lines[0]?.actualUnitCost, 2000);
  assert.equal(result.lines[0]?.lotId, g);
});
for (const [name, broken] of [
  ['stock quantity exceeded', { ...purchaseLine, qtyReturned: 2001, qtyReturnable: 0 }],
  ['inconsistent unreturned quantity', { ...purchaseLine, qtyReturnable: 900 }],
  ['negative source cost', { ...purchaseLine, actualUnitCost: -1 }],
  ['cost as a fraction', { ...purchaseLine, costReturnedMinor: 1.25 }],
  ['unsafe inventory quantity', { ...purchaseLine, qtyReceived: Number.MAX_SAFE_INTEGER + 1 }],
  ['incorrect lot ID', { ...purchaseLine, lotId: 'not-ulid' }],
] as const) test('R09QA-17 purchase returnability rejects ' + name, () => {
  assert.throws(() => decodeReturnablePurchase({ data: { ...returnablePurchase.data, lines: [broken] } }), protocol);
});
test('R09QA-18 all five source adapters issue authenticated same-origin GET only, never post', async () => {
  const sources = new Map<string, unknown>([
    ['/api/v1/sales?limit=20', invoices],
    ['/api/v1/sales/' + a, { data: saleDetail }],
    ['/api/v1/sales-returns?limit=20', history],
    ['/api/v1/sales-returns/returnable/' + a, returnableSale],
    ['/api/v1/purchase-returns/returnable/' + a, returnablePurchase],
  ]);
  const seen = new Set<string>();
  await withFetch((async (url, init) => {
    const parsed = new URL(String(url));
    assert.equal(parsed.origin, origin);
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenantA-token');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    assert.equal(sources.has(parsed.pathname + parsed.search), true);
    seen.add(parsed.pathname + parsed.search);
    return json(sources.get(parsed.pathname + parsed.search));
  }) as typeof fetch, async () => {
    await readSalesInvoices('tenantA-token');
    await readSalesInvoiceDetail('tenantA-token', a);
    await readSalesReturnHistory('tenantA-token');
    await readReturnableSale('tenantA-token', a);
    await readReturnablePurchase('tenantA-token', a);
  });
  assert.equal(seen.size, 5);
});
test('R09QA-19 source mismatch must be rejected for detail, sale returnable and purchase returnable', async () => {
  const paths = new Map<string, unknown>([
    ['/api/v1/sales/' + a, { data: { ...saleDetail, id: b } }],
    ['/api/v1/sales-returns/returnable/' + a, { data: { ...returnableSale.data, saleId: b } }],
    ['/api/v1/purchase-returns/returnable/' + a, { data: { ...returnablePurchase.data, purchaseId: b } }],
  ]);
  await withFetch((async (url) => json(paths.get(new URL(String(url)).pathname))) as typeof fetch, async () => {
    await assert.rejects(readSalesInvoiceDetail('token', a), protocol);
    await assert.rejects(readReturnableSale('token', a), protocol);
    await assert.rejects(readReturnablePurchase('token', a), protocol);
  });
});
test('R09QA-20 401, 403, 404, 409, 429, 500 never render as authenticated success', async () => {
  for (const status of [401, 403, 404, 409, 429, 500]) {
    await withFetch((async () => json({ message: 'failure' }, status)) as typeof fetch, async () => {
      for (const read of [
        () => readSalesInvoices('token'),
        () => readSalesInvoiceDetail('token', a),
        () => readSalesReturnHistory('token'),
        () => readReturnableSale('token', a),
        () => readReturnablePurchase('token', a),
      ]) {
        await assert.rejects(read(), (error: unknown) =>
          error instanceof ApiError && error.kind === 'http' && error.status === status);
      }
    });
  }
});
test('R09QA-21 invalid auth and IDs fail before fetch, including CRLF and whitespace token injection', async () => {
  let called = 0;
  await withFetch((async () => { called += 1; return json(invoices); }) as typeof fetch, async () => {
    for (const read of [
      () => readSalesInvoices('bad token'),
      () => readSalesInvoiceDetail('token', 'nonexistent'),
      () => readSalesReturnHistory('bad token'),
      () => readReturnableSale('token', 'nonexistent'),
      () => readReturnablePurchase('token', 'nonexistent'),
      () => readSalesInvoices('token', { search: 'x'.repeat(65) }),
      () => readSalesInvoices('token', { limit: 201 }),
      () => readSalesReturnHistory('token', { cursor: 'x\nfake-header' }),
    ]) await assert.rejects(read(), protocol);
  });
  assert.equal(called, 0);
});
test('R09QA-22 pre-aborted controllers do not expose rows for any Sales read endpoint', async () => {
  const ctrl = new AbortController(); ctrl.abort();
  let called = 0;
  await withFetch((async (_url, init) => {
    called += 1;
    if (init?.signal?.aborted) throw new Error('already aborted');
    return json(invoices);
  }) as typeof fetch, async () => {
    for (const read of [
      () => readSalesInvoices('token', {}, ctrl.signal),
      () => readSalesInvoiceDetail('token', a, ctrl.signal),
      () => readSalesReturnHistory('token', {}, ctrl.signal),
      () => readReturnableSale('token', a, ctrl.signal),
      () => readReturnablePurchase('token', a, ctrl.signal),
    ]) await assert.rejects(read(), (error: unknown) =>
      error instanceof ApiError && error.kind === 'network');
  });
  assert.ok(called <= 3, 'reads must fail before or inside the abort-aware transport');
});
