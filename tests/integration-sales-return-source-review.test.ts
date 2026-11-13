import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { salesHistoryVisibleState, formatSalesHistoryQuantity } from '../src/integration/sales-return-history-read-model.ts';
import { readReturnableSale } from '../src/integration/returns.ts';
import { ApiError } from '../src/integration/errors.ts';

const source = readFileSync(new URL('../src/components/sales/ConnectedSalesReturnSourceReview.tsx', import.meta.url), 'utf8');
const sales = readFileSync(new URL('../src/pages/Sales.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const saleId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const partyId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const lineId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const envelope = { data: {
  saleId, number: 'INV-0029', businessDate: '2026-11-13', customerName: 'Customer A',
  customerPhone: null, customerAddress: null, customerGuardianName: null,
  partyId, isWalkIn: false, grandTotalMinor: 12500, dueMinor: 5000,
  lines: [{
    saleLineId: lineId, productId, productName: 'Switch', unitName: 'Pcs',
    qtySold: 3000, qtyReturned: 1000, valueReturnedMinor: 3000,
    qtyReturnable: 2000, unitPriceMinor: 4000, netAmountMinor: 12000,
    returnable: true, tracksSerial: false, serials: [],
  }],
  refundLimit: { perReturnMinor: 10000, perDayMinor: 30000, usedTodayMinor: 1000 },
} };
const origin = 'https://hisabiq-sale-source.test';
async function withFetch(mock: typeof fetch, task: () => Promise<void>): Promise<void> {
  const host = globalThis as unknown as { fetch: typeof fetch; window?: unknown; location?: unknown };
  const oldFetch = host.fetch;
  const oldWindow = host.window;
  const oldLocation = host.location;
  host.fetch = mock;
  host.window = { location: { origin } };
  host.location = { origin };
  try { await task(); } finally {
    host.fetch = oldFetch;
    if (oldWindow === undefined) delete host.window; else host.window = oldWindow;
    if (oldLocation === undefined) delete host.location; else host.location = oldLocation;
  }
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

test('R09SR-01 existing GET source validates actual sale ID and carries recorded original facts', async () => {
  await withFetch((async (url, init) => {
    assert.equal(String(url), origin + '/api/v1/sales-returns/returnable/' + saleId);
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer source-token');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json(envelope);
  }) as typeof fetch, async () => {
    const result = await readReturnableSale('source-token', saleId);
    assert.equal(result.data.saleId, saleId);
    assert.equal(result.data.lines[0]?.qtyReturned, 1000);
    assert.equal(result.data.lines[0]?.valueReturnedMinor, 3000);
    assert.equal(result.data.lines[0]?.qtyReturnable, 2000);
    assert.equal(result.data.refundLimit.usedTodayMinor, 1000);
  });
});

test('R09SR-02 a response for another sale ID fails closed without displaying its data', async () => {
  await withFetch((async () => json({ data: { ...envelope.data, saleId: partyId } })) as typeof fetch, async () => {
    await assert.rejects(readReturnableSale('source-token', saleId),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  });
});

test('R09SR-03 quantity display is base-scale-3 exact without float rounding', () => {
  assert.equal(formatSalesHistoryQuantity(1234), '1.234');
  assert.equal(formatSalesHistoryQuantity(0), '0');
  assert.equal(formatSalesHistoryQuantity(1001), '1.001');
  assert.equal(formatSalesHistoryQuantity(Number.MAX_SAFE_INTEGER).endsWith('.991'), true);
});

test('R09SR-04 source render state cannot cross tenant, user, epoch, source ID or refresh key', () => {
  const previous = { key: 'tenant-A:user-1:epoch-8:source-A:revision-0',
    status: 'ready' as const, data: envelope };
  assert.equal(salesHistoryVisibleState(previous, previous.key).data, envelope);
  for (const key of ['tenant-B:user-1:epoch-8:source-A:revision-0',
    'tenant-A:user-2:epoch-8:source-A:revision-0',
    'tenant-A:user-1:epoch-9:source-A:revision-0',
    'tenant-A:user-1:epoch-8:source-B:revision-0',
    'tenant-A:user-1:epoch-8:source-A:revision-1']) {
    assert.deepEqual(salesHistoryVisibleState(previous, key), { status: 'loading', data: null });
  }
  assert.deepEqual(salesHistoryVisibleState(null, previous.key), { status: 'loading', data: null });
});

test('R09SR-05 only authenticated connected users with create permission read source', () => {
  assert.match(source, /export function ConnectedSalesReturnSourceReview\(\{ saleId \}/);
  assert.match(source, /useSession\(\)/);
  assert.match(source, /mode === 'connected' && snapshot\.status === 'authenticated'/);
  assert.match(source, /snapshot\.permissions\.includes\('sales\.return\.create'\)/);
  assert.match(source, /if \(!authenticated \|\| !canReview \|\| token === null \|\| saleId === null\) return/);
  assert.match(source, /readReturnableSale\(token, saleId, controller\.signal\)/);
  assert.doesNotMatch(source, /sales\.return\.view|salesPreviewStore|availableInvoices|seedReturns/);
});

test('R09SR-06 render is synchronously source/session keyed; stale GET aborts', () => {
  assert.match(source, /snapshot\.tenantId, snapshot\.userId, snapshot\.epoch, snapshot\.accessToken/);
  assert.match(source, /const sourceKey = \[identity, 'sale-returnable', saleId \?\? 'none', revision\]\.join\(':'\)/);
  assert.match(source, /salesHistoryVisibleState\(sourceResult, sourceKey\)/);
  assert.match(source, /if \(!controller\.signal\.aborted\)/);
  assert.match(source, /return \(\) => controller\.abort\(\)/);
  assert.match(source, /setRevision\(value => value \+ 1\)/);
});

test('R09SR-07 displays source facts, already returned money, eligibility and serial availability', () => {
  assert.match(source, /data-sales-return-source-table=""/);
  assert.match(source, /formatSalesHistoryQuantity\(line\.qtySold\)/);
  assert.match(source, /formatSalesHistoryQuantity\(line\.qtyReturned\)/);
  assert.match(source, /formatSalesHistoryQuantity\(line\.qtyReturnable\)/);
  assert.match(source, /purchaseMoney\(line\.valueReturnedMinor\)/);
  assert.match(source, /line\.returnable/);
  assert.match(source, /line\.serials\.map\(serial/);
  assert.match(source, /data\.number/);
  assert.match(source, /data\.customerName/);
  assert.doesNotMatch(source, /refundMinor|receivedMinor|createSalesReturn|method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
});

test('R09SR-08 placeholder, denied, no-line, error and loading paths cannot show fixture', () => {
  assert.match(source, /saleId === null/);
  assert.match(source, /visible\.status === 'denied'/);
  assert.match(source, /visible\.status === 'error'/);
  assert.match(source, /visible\.status === 'loading'/);
  assert.match(source, /data\.lines\.length === 0/);
  assert.doesNotMatch(source, /toast\.success|localStorage|sessionStorage|erpDemoStore/);
});

test('R09SR-09 preserves the original Sales UI, routing gate and previously prepared history', () => {
  const history = readFileSync(new URL('../src/components/sales/ConnectedSalesReturnHistoryPanel.tsx', import.meta.url), 'utf8');
  assert.match(sales, /salesPreviewStore/);
  assert.match(sales, /subscribeSalesPreview/);
  assert.doesNotMatch(sales, /ConnectedSalesReturnSourceReview|readReturnableSale/);
  assert.match(history, /ConnectedSalesReturnHistoryPanel/);
  assert.doesNotMatch(history, /ConnectedSalesReturnSourceReview/);
  assert.doesNotMatch(app, /ConnectedSalesReturnSourceReview/);
  assert.match(app, /ConnectedWorkspaceGate/);
  assert.doesNotMatch(source, /font-mono|tabular-nums|tnum/);
});
