import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { ServerSalesInvoiceRow } from '../src/integration/sales-invoices.ts';
import {
  formatSalesInvoiceMoney,
  salesInvoiceSelectedId,
  salesInvoiceVisibleState,
} from '../src/integration/sales-invoice-read-model.ts';

const file = new URL('../src/components/sales/ConnectedSalesInvoicesPanel.tsx', import.meta.url);
const source = readFileSync(file, 'utf8');
const saleId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const otherId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const row: ServerSalesInvoiceRow = {
  originMode: 'OFFLINE', id: saleId, number: 'S-099', partyId: otherId,
  customerName: 'Customer A', customerPhone: null, businessDate: '2026-11-13',
  dueDate: null, status: 'POSTED', grandTotalMinor: 12000,
  paidMinor: 8000, dueMinor: 4000, ageing: 'NOT_DUE',
};

test('R09UI-01 signed server poisha is formatted exactly, without float or negative zero', () => {
  assert.equal(formatSalesInvoiceMoney(0), '৳0.00');
  assert.equal(formatSalesInvoiceMoney(1), '৳0.01');
  assert.equal(formatSalesInvoiceMoney(100), '৳1.00');
  assert.equal(formatSalesInvoiceMoney(12540020), '৳1,25,400.20');
  assert.equal(formatSalesInvoiceMoney(-35000), '−৳350.00');
  assert.equal(formatSalesInvoiceMoney(-1), '−৳0.01');
  assert.equal(formatSalesInvoiceMoney(Number.MAX_SAFE_INTEGER), '৳9,00,71,99,25,47,409.91');
  assert.equal(formatSalesInvoiceMoney(Number.MIN_SAFE_INTEGER), '−৳9,00,71,99,25,47,409.91');
  assert.equal(formatSalesInvoiceMoney(Number.POSITIVE_INFINITY), '—');
  assert.equal(formatSalesInvoiceMoney(Number.NaN), '—');
  assert.equal(formatSalesInvoiceMoney(null), '—');
  assert.equal(formatSalesInvoiceMoney(undefined), '—');
});

test('R09UI-02 a ready response becomes invisible synchronously on identity/filter/cursor/refresh change', () => {
  const data = { items: [row] };
  const existing = { key: 'tenantA:user1:epoch1:list1:first:rev1', status: 'ready' as const, data };
  assert.deepEqual(salesInvoiceVisibleState(existing, existing.key), { status: 'ready', data });
  for (const key of [
    'tenantB:user1:epoch1:list1:first:rev1',
    'tenantA:user2:epoch1:list1:first:rev1',
    'tenantA:user1:epoch2:list1:first:rev1',
    'tenantA:user1:epoch1:list2:first:rev1',
    'tenantA:user1:epoch1:list1:next:rev1',
    'tenantA:user1:epoch1:list1:first:rev2',
  ]) {
    assert.deepEqual(salesInvoiceVisibleState(existing, key), { status: 'loading', data: null });
  }
  assert.deepEqual(salesInvoiceVisibleState(null, existing.key), { status: 'loading', data: null });
  assert.deepEqual(salesInvoiceVisibleState({ key: existing.key, status: 'denied', data: null }, existing.key),
    { status: 'denied', data: null });
});

test('R09UI-03 a selection must belong to the current verified page and source ID', () => {
  const selected = { listKey: 'session:filter:first:0', id: saleId };
  assert.equal(salesInvoiceSelectedId(selected, selected.listKey, [row]), saleId);
  assert.equal(salesInvoiceSelectedId(selected, 'other-session:filter:first:0', [row]), null);
  assert.equal(salesInvoiceSelectedId(selected, selected.listKey, []), null);
  assert.equal(salesInvoiceSelectedId({ listKey: selected.listKey, id: otherId },
    selected.listKey, [row]), null);
  assert.equal(salesInvoiceSelectedId(null, selected.listKey, [row]), null);
});

test('R09UI-04 only authenticated connected sale.view users can read list and detail', () => {
  assert.match(source, /useSession\(\)/);
  assert.match(source, /mode === 'connected' && snapshot\.status === 'authenticated'/);
  assert.match(source, /snapshot\.permissions\.includes\('sale\.view'\)/);
  assert.match(source, /if \(!authenticated \|\| !allowed \|\| token === null\) return;/);
  assert.match(source, /if \(!authenticated \|\| !allowed \|\| token === null \|\| selectedId === null\) return;/);
  assert.match(source, /readSalesInvoices\(token,/);
  assert.match(source, /readSalesInvoiceDetail\(token, selectedId, controller\.signal\)/);
  assert.doesNotMatch(source, /sales\.return\.create|sales\.return\.view|purchase\.bill\.view/);
});

test('R09UI-05 list, page and detail keys include session permissions, filters and source ID', () => {
  assert.match(source, /snapshot\.tenantId, snapshot\.userId, snapshot\.epoch,/);
  assert.match(source, /snapshot\.accessToken, snapshot\.permissions/);
  assert.match(source, /const scope = JSON\.stringify\(\[identity, search\.trim\(\), source, dueFilter\]\)/);
  assert.match(source, /const cursor = page\.scope === scope \? page\.cursor : null/);
  assert.match(source, /const listKey = JSON\.stringify\(\[scope, cursor, revision\]\)/);
  assert.match(source, /salesInvoiceVisibleState\(list, listKey\)/);
  assert.match(source, /salesInvoiceSelectedId\(selected, listKey, rows\)/);
  assert.match(source, /const detailKey = JSON\.stringify\(\[listKey, selectedId\]\)/);
  assert.match(source, /salesInvoiceVisibleState\(detail, detailKey\)/);
});

test('R09UI-06 every network request is abortable and stale effects are unable to publish', () => {
  const controllers = source.match(/const controller = new AbortController\(\)/g) ?? [];
  const guards = source.match(/if \(!controller\.signal\.aborted\)/g) ?? [];
  const cleanups = source.match(/return \(\) => controller\.abort\(\)/g) ?? [];
  assert.equal(controllers.length, 2);
  assert.equal(cleanups.length, 2);
  assert.equal(guards.length, 4);
  assert.match(source, /\}, controller\.signal\)\.then\(data/);
  assert.match(source, /selectedId, controller\.signal/);
});

test('R09UI-07 search, source, due filter, retry and pagination reset selection coherently', () => {
  assert.match(source, /value\.slice\(0, 64\)/);
  assert.match(source, /maxLength=\{64\}/);
  assert.match(source, /setPage\(\{ scope: '', cursor: null \}\)/);
  assert.match(source, /setSelected\(null\)/);
  assert.match(source, /dueFilter === 'UNPAID' \? \{ unpaidOnly: true \} : \{\}/);
  assert.doesNotMatch(source, /unpaidOnly:\s*false/);
  assert.match(source, /source === 'ALL' \? \{\} : \{ origin: source \}/);
  assert.match(source, /limit: 20/);
  assert.match(source, /setRevision\(value => value \+ 1\)/);
  assert.match(source, /disabled=\{cursor === null\}/);
  assert.match(source, /disabled=\{!visibleList\.data\.nextCursor\}/);
});

test('R09UI-08 money and quantities are server-recorded, profit is separately permission gated', () => {
  assert.match(source, /formatSalesInvoiceMoney\(row\.grandTotalMinor\)/);
  assert.match(source, /formatSalesInvoiceMoney\(row\.paidMinor\)/);
  assert.match(source, /formatSalesInvoiceMoney\(row\.dueMinor\)/);
  assert.match(source, /formatSalesInvoiceMoney\(visibleList\.data\.totals\.dueMinor\)/);
  assert.match(source, /formatSalesHistoryQuantity\(line\.qty\)/);
  assert.match(source, /snapshot\.permissions\.includes\('inventory\.cost\.view'\)/);
  assert.match(source, /canViewCost && selectedDetail\.cogsMinor !== undefined/);
  assert.match(source, /canViewCost && selectedDetail\.profitMinor !== undefined/);
  assert.match(source, /selectedDetail\.payments\.map/);
  assert.match(source, /selectedDetail\.receipts\.map/);
  assert.match(source, /line\.allocations\.map/);
  assert.doesNotMatch(source, /\/\s*100|toFixed|Math\.round|font-mono|tabular-nums|tnum/);
});

test('R09UI-09 panels show loading/denied/error/empty states without mock data or posting', () => {
  assert.match(source, /data-connected-sales-invoices-panel=""/);
  assert.match(source, /data-connected-sales-invoices-table=""/);
  assert.match(source, /data-connected-sales-invoice-detail=""/);
  assert.match(source, /data-connected-sales-invoice-lines=""/);
  assert.match(source, /visibleList\.status === 'loading'/);
  assert.match(source, /visibleList\.status === 'denied' \|\| visibleList\.status === 'error'/);
  assert.match(source, /rows\.length === 0/);
  assert.match(source, /visibleDetail\.status === 'loading'/);
  assert.match(source, /visibleDetail\.status === 'denied' \|\| visibleDetail\.status === 'error'/);
  assert.doesNotMatch(source, /salesPreviewStore|erpDemoStore|seedReturns|localStorage|sessionStorage|toast\.success/);
  assert.doesNotMatch(source, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]|createSale|createSalesReturn|receivePayment/);
});

test('R09UI-10 existing Sales preview, live workspace gate and return read panels are preserved', () => {
  const preview = readFileSync(new URL('../src/pages/Sales.tsx', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const history = readFileSync(new URL('../src/components/sales/ConnectedSalesReturnHistoryPanel.tsx', import.meta.url), 'utf8');
  const sourceReview = readFileSync(new URL('../src/components/sales/ConnectedSalesReturnSourceReview.tsx', import.meta.url), 'utf8');
  assert.match(preview, /subscribeSalesPreview/);
  assert.match(preview, /planBundleReturn/);
  assert.match(app, /ConnectedWorkspaceGate/);
  assert.doesNotMatch(preview, /ConnectedSalesInvoicesPanel/);
  assert.doesNotMatch(app, /ConnectedSalesInvoicesPanel/);
  assert.match(history, /ConnectedSalesReturnHistoryPanel/);
  assert.match(sourceReview, /ConnectedSalesReturnSourceReview/);
  assert.doesNotMatch(source, /ConnectedSalesReturnHistoryPanel|ConnectedSalesReturnSourceReview/);
});
