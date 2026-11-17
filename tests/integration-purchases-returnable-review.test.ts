import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/pages/Purchases.tsx', import.meta.url), 'utf8');
const connected = source.split('function ConnectedPurchasesRead()')[1]?.split('function PreviewPurchases()')[0] ?? '';
const preview = source.split('function PreviewPurchases()')[1] ?? '';

test('R09U-01 connected Purchases remains isolated from functioning preview return flow', () => {
  assert.match(source, /mode\s*===\s*'connected'\s*\?\s*<ConnectedPurchasesRead\s*\/>\s*:\s*<PreviewPurchases\s*\/>/);
  assert.match(preview, /<PurchaseSourceDialog/);
  assert.doesNotMatch(connected, /createPreviewPurchase|mutatePreviewPurchase|availablePurchaseEvents|availablePurchases\(/);
  assert.doesNotMatch(connected, /PurchaseSourceDialog|erpDemoStore|purchaseDraftsPreviewStore/);
});

test('R09U-02 contextual returnability GET is permission-gated by both view and create', () => {
  assert.match(connected, /const canReviewReturns = allowed && snapshot\.permissions\.includes\('purchase\.return\.create'\)/);
  assert.match(connected, /readReturnablePurchase\(token, returnId, controller\.signal\)/);
  assert.match(connected, /row\.status === 'POSTED'/);
  assert.match(connected, /currentDetail\.status === 'POSTED'/);
});

test('R09U-03 returnable source stays keyed to authenticated identity and selected server ID', () => {
  assert.match(connected, /const returnId = returnSelection\?\.identity === identity \? returnSelection\.id : null/);
  assert.match(connected, /const returnKey = \[identity, 'returnable', returnId \?\? 'none', returnRetry\]\.join\(':'\)/);
  assert.match(connected, /purchaseVisibleState\(returnable, returnKey\)/);
  assert.match(connected, /if \(!authenticated \|\| !canReviewReturns \|\| token === null \|\| returnId === null \|\| tab !== 'return'\) return/);
  assert.match(connected, /return \(\) => controller\.abort\(\)/);
  assert.match(connected, /if \(!controller\.signal\.aborted\)/);
});

test('R09U-04 source review displays no sample purchase and no success or mutation action', () => {
  assert.match(connected, /data-purchase-returnable-review=""/);
  assert.match(connected, /read-only/i);
  assert.match(connected, /tab === 'return'/);
  assert.match(connected, /tab === 'return-history'/);
  assert.match(connected, /text\('Review returnable quantities'/);
  assert.match(connected, /readPurchaseReturnHistory\(token/);
  assert.match(connected, /data-purchase-return-history-table=""/);
  assert.doesNotMatch(connected, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(connected, /requestJson\(|toast\.success|setPurchases\(/);
});

test('R09U-05 loading, denied, failed source and refresh state are distinct', () => {
  assert.match(connected, /setReturnable\(\{ key: returnKey, status: 'loading', data: null \}\)/);
  assert.match(connected, /status: reportError\(error\), data: null/);
  assert.match(connected, /visibleReturnable\.status === 'denied'/);
  assert.match(connected, /visibleReturnable\.status === 'error'/);
  assert.match(connected, /setReturnRetry\(revision => revision \+ 1\)/);
});

test('R09U-06 screen shows both unreturned and physical-lot quantity without posting money', () => {
  assert.match(connected, /Math\.min\(line\.qtyReturnable, line\.qtyRemainingInLot\)/);
  assert.match(connected, /line\.qtyReturned/);
  assert.match(connected, /line\.unitName/);
  assert.match(connected, /purchaseMoney\(line\.valueReturnedMinor\)/);
  assert.match(connected, /purchaseMoney\(visibleReturnable\.data\.data\.outstandingMinor\)/);
  assert.match(connected, /<Table\s+data-purchase-returnable-table=""/);
});

test('R09U-07 bill detail and list retain original read actions and current draft gateway', () => {
  assert.match(connected, /<ConnectedPurchaseDraftsPanel/);
  assert.match(connected, /readPurchases\(token/);
  assert.match(connected, /readPurchase\(token, selectedId/);
  assert.match(connected, /setSelected\(\{ identity, id: row\.id \}\)/);
  assert.match(connected, /<Dialog open=\{selectedId !== null\}/);
  assert.match(connected, /chooseTab\('return'\)/);
});
