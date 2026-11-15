import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');
const workspace = read('../src/components/sales/ConnectedSalesReadWorkspace.tsx');
const invoicePanel = read('../src/components/sales/ConnectedSalesInvoicesPanel.tsx');
const sourcePanel = read('../src/components/sales/ConnectedSalesReturnSourceReview.tsx');
const historyPanel = read('../src/components/sales/ConnectedSalesReturnHistoryPanel.tsx');

test('R09B-01 workspace composes verified server reads; adds no custom transport or preview store', () => {
  assert.match(workspace, /ConnectedSalesInvoicesPanel/);
  assert.match(workspace, /ConnectedSalesReturnSourceReview/);
  assert.match(workspace, /ConnectedSalesReturnHistoryPanel/);
  assert.doesNotMatch(workspace, /(?:read|request)Json\(|\bfetch\(|salesPreviewStore|subscribeSalesPreview|sessionStorage|localStorage/);
  assert.doesNotMatch(workspace, /method:\s*['"](?:POST|PATCH|PUT|DELETE)['"]|createSalesReturn|createSale\(|refund\(|postStock|journal/);
});

test('R09B-02 invoice view requires sale.invoice.view and verified connected authentication', () => {
  assert.match(workspace, /mode === 'connected' && snapshot\.status === 'authenticated'/);
  assert.match(workspace, /const canViewInvoices = canReadSalesInvoices\(mode, snapshot\)/);
  assert.match(workspace, /disabled: !canViewInvoices/);
  assert.match(invoicePanel, /const allowed = canReadSalesInvoices\(mode, snapshot\)/);
});

test('R09B-03 returnability GET requires sales.return.create, not return-history permission', () => {
  assert.match(workspace, /authenticated && canViewInvoices && snapshot\.permissions\.includes\('sales\.return\.create'\)/);
  assert.match(invoicePanel, /snapshot\.permissions\.includes\('sales\.return\.create'\)/);
  assert.match(sourcePanel, /snapshot\.permissions\.includes\('sales\.return\.create'\)/);
  assert.doesNotMatch(workspace, /canReviewSource.*sales\.return\.view/);
});

test('R09B-04 return-history GET separately requires sales.return.view', () => {
  assert.match(workspace, /snapshot\.permissions\.includes\('sales\.return\.view'\)/);
  assert.match(workspace, /disabled: !canViewHistory/);
  assert.match(historyPanel, /snapshot\.permissions\.includes\('sales\.return\.view'\)/);
  assert.doesNotMatch(historyPanel, /snapshot\.permissions\.includes\('sales\.return\.create'\)/);
});

test('R09B-05 verified source callback is optional and not offered for voided or unverified invoices', () => {
  assert.match(invoicePanel, /onReviewReturnable\?: \(saleId: string\) => void/);
  assert.match(invoicePanel, /selectedDetail && selectedDetail\.status === 'POSTED'/);
  assert.match(invoicePanel, /selectedId === selectedDetail\.id && canReviewReturnable && onReviewReturnable/);
  assert.match(invoicePanel, /onClick=\{\(\) => onReviewReturnable\(selectedDetail\.id\)\}/);
  assert.match(invoicePanel, /salesInvoiceSelectedId\(selected, listKey, rows\)/);
  assert.match(invoicePanel, /readSalesInvoiceDetail\(token, selectedId, controller\.signal\)/);
});

test('R09B-06 source ID is accepted only through verified detail callback and validated as a server ULID', () => {
  assert.match(workspace, /const reviewPostedSource = \(verifiedSaleId: string\) =>/);
  assert.match(workspace, /if \(!canReviewSource \|\| !\/\^\[0-7\]/);
  assert.match(workspace, /setSource\(\{ identity, saleId: verifiedSaleId \}\)/);
  assert.match(workspace, /onReviewReturnable=\{reviewPostedSource\}/);
  assert.doesNotMatch(workspace, /<Input|<textarea|URLSearchParams|query\.get\(|window\.location/);
});

test('R09B-07 tenant/user/epoch/token/permissions identity always masks old source after switch', () => {
  assert.match(workspace, /snapshot\.tenantId, snapshot\.userId, snapshot\.epoch,/);
  assert.match(workspace, /snapshot\.accessToken, snapshot\.permissions,/);
  assert.match(workspace, /source\?\.identity === identity \? source\.saleId : null/);
  assert.match(workspace, /const saleId = canReviewSource && source\?\.identity === identity \?/);
  assert.match(workspace, /<ConnectedSalesReturnSourceReview saleId=\{saleId\}/);
  assert.match(sourcePanel, /salesHistoryVisibleState\(sourceResult, sourceKey\)/);
  assert.match(sourcePanel, /return \(\) => controller\.abort\(\)/);
});

test('R09B-08 original server invoice detail must be source-ID matched before review callback can run', () => {
  const detailAdapter = read('../src/integration/sales-invoice-detail.ts');
  assert.match(detailAdapter, /if \(decoded\.data\.id !== saleId\) return invalid\(\)/);
  assert.match(detailAdapter, /method: 'GET'/);
  assert.match(invoicePanel, /visibleDetail\.status === 'ready' \? visibleDetail\.data\?\.data : null/);
  assert.match(invoicePanel, /selectedDetail\.status === 'POSTED'/);
});

test('R09B-09 tab controls have meaningful enabled/disabled state, labels and focus indication', () => {
  assert.match(workspace, /role="tablist"/);
  assert.match(workspace, /role="tab" aria-selected=\{tab === item\.id\}/);
  assert.match(workspace, /aria-controls=\{prefix \+ '-panel'\}/);
  assert.match(workspace, /disabled=\{item\.disabled\}/);
  assert.match(workspace, /focus-visible:ring-2/);
  assert.match(workspace, /role="tabpanel" aria-labelledby=\{prefix \+ '-' \+ tab\}/);
  assert.match(workspace, /text\('Invoices', 'চালান'\)/);
  assert.match(workspace, /text\('Return source', 'ফেরতের মূল তথ্য'\)/);
  assert.match(workspace, /text\('Return history', 'ফেরতের ইতিহাস'\)/);
});

test('R09B-10 tab navigation clears source on return to invoices and denies unauthorized tabs', () => {
  assert.match(workspace, /if \(next === 'source' && !canReviewSource\) return;/);
  assert.match(workspace, /if \(next === 'history' && !canViewHistory\) return;/);
  assert.match(workspace, /if \(next === 'invoices'\) setSource\(null\);/);
  assert.match(workspace, /setTab\(next\)/);
  assert.match(workspace, /setTab\('source'\)/);
});

test('R09B-11 existing preview Sales page and global gate are untouched and workspace UNMOUNTED', () => {
  const preview = read('../src/pages/Sales.tsx');
  const app = read('../src/App.tsx');
  const gate = read('../src/integration/ConnectedWorkspaceGate.tsx');
  assert.match(preview, /subscribeSalesPreview/);
  assert.match(preview, /planBundleReturn/);
  assert.match(app, /ConnectedWorkspaceGate/);
  assert.match(gate, /workspace=pending/);
  for (const src of [app, preview, gate]) {
    assert.doesNotMatch(src, /ConnectedSalesReadWorkspace/);
  }
  assert.match(workspace, /UNMOUNTED connected Sales GET-only workspace/);
});

test('R09B-12 no new financial, cash-session, stock or return-posting action is wired', () => {
  for (const src of [workspace, invoicePanel]) {
    assert.doesNotMatch(src, /\b(?:POST|PUT|PATCH|DELETE)\b\s*:\s*['"]/);
    assert.doesNotMatch(src, /\b(?:createSalesReturn|postSalesReturn|voidSale|saveJournal|receivePayment|updateInventory)\s*\(/);
    assert.doesNotMatch(src, /salesPreviewStore|toast\.success|erpDemoStore/);
  }
  assert.match(sourcePanel, /This review cannot create, approve, refund, credit, void or post a return/);
  assert.match(historyPanel, /GET \/api\/v1\/sales-returns requires sales\.return\.view/);
});
