import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ApiError } from '../src/integration/errors.ts';
import { decodeSalesInvoiceDetail, readSalesInvoiceDetail } from '../src/integration/sales-invoice-detail.ts';

const id = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const party = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const lineId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const product = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const allocationId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const paymentId = '01ARZ3NDEKTSV4RRFFQ69G5FB0';
const receiptId = '01ARZ3NDEKTSV4RRFFQ69G5FB1';
const serialId = '01ARZ3NDEKTSV4RRFFQ69G5FB2';
const vendorId = '01ARZ3NDEKTSV4RRFFQ69G5FB3';
const vendorLot = '01ARZ3NDEKTSV4RRFFQ69G5FB4';
const origin = 'https://hisabiq-sale-detail.test';
const protocol = (error: unknown) => error instanceof ApiError && error.kind === 'protocol';

const allocation = {
  sourceType: 'VENDOR', qty: 1000, vendorPartyId: vendorId, serialUnitIds: [serialId],
  id: allocationId, ownedLotId: null, vendorStockReceiptId: vendorLot,
  vendorLotId: vendorLot, inventoryUnitId: serialId, serialNo: 'SN-0001', unitCostUsed: 230000,
};
const line = {
  id: lineId, productId: product, productName: 'Smart Switch', displayName: null,
  unitName: 'Pcs', qty: 1000, unitPriceMinor: 4500,
  lineDiscountMinor: 0, lineTotalMinor: 4500, discountShareMinor: 0,
  netAmountMinor: 4500, source: 'VENDOR_CONSIGNMENT', vendorPartyId: vendorId,
  vendorName: 'Vendor A', isProvisionalCost: false, tracksSerial: true,
  allocations: [allocation],
};
const sale = {
  id, number: 'INV-2026-101', partyId: party, isWalkIn: false,
  customerName: 'Customer A', customerPhone: null, customerGuardianName: null,
  customerAddress: null, businessDate: '2026-11-13', dueDate: null,
  status: 'POSTED', notes: null, lines: [line],
  payments: [{ id: paymentId, accountCode: 'CASH:C001', accountName: 'Main Cash',
    accountType: 'CASH', amountMinor: 3000 }],
  itemsTotalMinor: 4500, discountMinor: 0, grandTotalMinor: 4500,
  paidMinor: 3500, dueMinor: 1000, changeMinor: 0, advanceMinor: 0,
  ageing: 'NOT_DUE', version: 2, presentation: null,
  receipts: [{ id: receiptId, number: 'RCPT-001', businessDate: '2026-11-13',
    accountName: 'Main Cash', amountMinor: 500 }],
  warnings: [], originMode: 'OFFLINE', originDeviceName: 'Counter 1',
  originDeviceCode: 'OFF-A', deviceCreatedAt: '2026-11-13T11:35:00.000Z',
};
const envelope = { data: sale };
function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(mock: typeof fetch, task: () => Promise<void>): Promise<void> {
  const host = globalThis as unknown as { fetch: typeof fetch; window?: unknown; location?: unknown };
  const original = { fetch: host.fetch, window: host.window, location: host.location };
  host.fetch = mock;
  host.window = { location: { origin } };
  host.location = { origin };
  try { await task(); } finally {
    host.fetch = original.fetch;
    if (original.window === undefined) delete host.window; else host.window = original.window;
    if (original.location === undefined) delete host.location; else host.location = original.location;
  }
}

test('R09D-01 authentic unwrapped server sale detail preserves original cost-redacted sources', () => {
  const detail = decodeSalesInvoiceDetail(envelope).data;
  assert.equal(detail.id, id);
  assert.equal(detail.lines[0]?.id, lineId);
  assert.equal(detail.lines[0]?.allocations[0]?.inventoryUnitId, serialId);
  assert.equal(detail.lines[0]?.allocations[0]?.serialNo, 'SN-0001');
  assert.equal(detail.payments[0]?.accountCode, 'CASH:C001');
  assert.equal(detail.receipts[0]?.amountMinor, 500);
  assert.equal(detail.originMode, 'OFFLINE');
  assert.equal(detail.version, 2);
  assert.equal(detail.dueMinor, 1000);
  assert.equal('cogsMinor' in detail, false);
  assert.equal('profitMinor' in detail, false);
  assert.equal('costMinor' in detail.lines[0]!, false);
});

test('R09D-02 optional permission-bearing costs and presentation stay verbatim, not inferred', () => {
  const visible = { ...sale, cogsMinor: 6400, profitMinor: -1900, lines: [
    { ...line, costMinor: 6400 },
  ], presentation: {
    customerDisplayName: 'Client on receipt', customerPhone: null,
    customerGuardianName: null, customerAddress: null, deliveryAddress: null,
    courierName: null, deliveryInstruction: null, paymentNote: null,
    customLabel1: null, customValue1: null, customLabel2: null,
    customValue2: null, customLabel3: null, customValue3: null,
    lineNames: [{ saleLineId: lineId, displayName: 'Invoice line label' }],
  } };
  const detail = decodeSalesInvoiceDetail({ data: visible }).data;
  assert.equal(detail.cogsMinor, 6400);
  assert.equal(detail.profitMinor, -1900);
  assert.equal(detail.lines[0]?.costMinor, 6400);
  assert.equal(detail.presentation?.customerDisplayName, 'Client on receipt');
  assert.equal(detail.presentation?.lineNames[0]?.saleLineId, lineId);
});

test('R09D-03 source-bound authenticated same-origin GET uses no posting or idempotency key', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/sales/' + id);
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer cashier-token');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json(envelope);
  }) as typeof fetch, async () => {
    const result = await readSalesInvoiceDetail('cashier-token', id);
    assert.equal(result.data.id, id);
  });
  assert.equal(calls, 1);
});

test('R09D-04 strict source matching rejects a different well-formed sale', async () => {
  await withFetch((async () => json({ data: { ...sale, id: party } })) as typeof fetch,
    async () => assert.rejects(readSalesInvoiceDetail('cashier-token', id), protocol));
});

test('R09D-05 malformed envelope, unexpected keys, absent keys, invalid dates fail closed', () => {
  const malformed: unknown[] = [
    sale, { data: sale, extra: 2 }, { ...envelope, data: { ...sale, extra: 1 } },
    { data: { ...sale, dueMinor: undefined } },
    { data: { ...sale, dueDate: '2026-02-30' } },
    { data: { ...sale, businessDate: '2026-11-31' } },
    { data: { ...sale, originMode: 'REVIEW' } },
    { data: { ...sale, status: 'DRAFT' } },
    { data: { ...sale, ageing: 'UNPAID' } },
    { data: { ...sale, version: Number.MAX_SAFE_INTEGER + 1 } },
    { data: { ...sale, paidMinor: 1.5 } },
    { data: { ...sale, cogsMinor: null } },
    { data: { ...sale, profitMinor: Infinity } },
    { data: { ...sale, presentation: { customerDisplayName: 'only one key' } } },
  ];
  for (const value of malformed) assert.throws(() => decodeSalesInvoiceDetail(value), protocol);
});

test('R09D-06 invalid nested serial, allocation, payment, receipt and duplicate source IDs fail closed', () => {
  const bad: unknown[] = [
    { ...sale, lines: [{ ...line, qty: Number.MAX_SAFE_INTEGER + 1 }] },
    { ...sale, lines: [{ ...line, source: 'NOT_OWNED' }] },
    { ...sale, lines: [{ ...line, allocations: [{ ...allocation, inventoryUnitId: 'unknown' }] }] },
    { ...sale, lines: [{ ...line, allocations: [{ ...allocation, sourceType: 'OWNED_BAD' }] }] },
    { ...sale, lines: [{ ...line, allocations: [{ ...allocation, serialUnitIds: [serialId, serialId] }] }] },
    { ...sale, lines: [line, line] },
    { ...sale, lines: [{ ...line, allocations: [allocation, allocation] }] },
    { ...sale, payments: [sale.payments[0], sale.payments[0]] },
    { ...sale, receipts: [sale.receipts[0], sale.receipts[0]] },
    { ...sale, receipts: [{ ...sale.receipts[0], businessDate: '2026-13-01' }] },
  ];
  for (const data of bad) assert.throws(() => decodeSalesInvoiceDetail({ data }), protocol);
});

test('R09D-07 nullable presentation, notes, redacted cost and signed due stay source data', () => {
  const detail = decodeSalesInvoiceDetail({ data: {
    ...sale, status: 'VOIDED', dueMinor: -500, paidMinor: 5000, advanceMinor: 500,
    originMode: 'ONLINE', originDeviceName: null, originDeviceCode: null,
    deviceCreatedAt: null, receipts: [], presentation: null,
  } }).data;
  assert.equal(detail.status, 'VOIDED');
  assert.equal(detail.dueMinor, -500);
  assert.equal(detail.advanceMinor, 500);
  assert.deepEqual(detail.receipts, []);
  assert.equal(detail.originDeviceName, null);
});

test('R09D-08 invalid token, id, timeout and pre-aborted signal fail before network call', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(envelope); }) as typeof fetch, async () => {
    for (const task of [
      () => readSalesInvoiceDetail('', id),
      () => readSalesInvoiceDetail('bearer token', id),
      () => readSalesInvoiceDetail('t', '01-not-valid'),
      () => readSalesInvoiceDetail('t', id, undefined, 0),
      () => readSalesInvoiceDetail('t', id, undefined, 120001),
    ]) await assert.rejects(task(), protocol);
    const ctrl = new AbortController();
    ctrl.abort();
    await assert.rejects(readSalesInvoiceDetail('t', id, ctrl.signal),
      (error: unknown) => error instanceof ApiError && error.kind === 'network');
  });
  assert.equal(calls, 0);
});

test('R09D-09 HTTP 401/403/404, invalid 200 and offline errors cannot become preview success', async () => {
  for (const status of [401, 403, 404]) {
    await withFetch((async () => json({ error: 'not authorized' }, status)) as typeof fetch,
      async () => assert.rejects(readSalesInvoiceDetail('t', id),
        (error: unknown) => error instanceof ApiError && error.kind === 'http' && error.status === status));
  }
  await withFetch((async () => json({ data: { ...sale, grandTotalMinor: '4500' } })) as typeof fetch,
    async () => assert.rejects(readSalesInvoiceDetail('t', id), protocol));
  await withFetch((async () => { throw Error('offline'); }) as typeof fetch,
    async () => assert.rejects(readSalesInvoiceDetail('t', id),
      (error: unknown) => error instanceof ApiError && error.kind === 'network'));
});

test('R09D-10 original Sales preview, gate and invoice-list adapter remain unchanged/unmounted', () => {
  const page = readFileSync(new URL('../src/pages/Sales.tsx', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const list = readFileSync(new URL('../src/integration/sales-invoices.ts', import.meta.url), 'utf8');
  const adapter = readFileSync(new URL('../src/integration/sales-invoice-detail.ts', import.meta.url), 'utf8');
  assert.match(page, /subscribeSalesPreview/);
  assert.match(app, /ConnectedWorkspaceGate/);
  assert.match(list, /export async function readSalesInvoices/);
  assert.doesNotMatch(page, /readSalesInvoiceDetail/);
  assert.doesNotMatch(app, /readSalesInvoiceDetail/);
  assert.match(adapter, /method:\s*'GET'/);
  assert.doesNotMatch(adapter, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(adapter, /salesPreviewStore|localStorage|sessionStorage|toast\.success/);
});
