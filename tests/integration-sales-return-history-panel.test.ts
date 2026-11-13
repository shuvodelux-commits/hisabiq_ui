import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  salesHistoryVisibleState,
  formatSalesHistoryQuantity,
  type SalesHistoryReadState,
} from '../src/integration/sales-return-history-read-model.ts';

const panel = readFileSync(new URL('../src/components/sales/ConnectedSalesReturnHistoryPanel.tsx', import.meta.url), 'utf8');
const sales = readFileSync(new URL('../src/pages/Sales.tsx', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

test('R09P-01 original source scale-3 quantity is rendered exactly with proportional digits', () => {
  assert.equal(formatSalesHistoryQuantity(0), '0');
  assert.equal(formatSalesHistoryQuantity(1000), '1');
  assert.equal(formatSalesHistoryQuantity(1200), '1.2');
  assert.equal(formatSalesHistoryQuantity(1234), '1.234');
  assert.equal(formatSalesHistoryQuantity(123456789), '1,23,456.789');
  assert.equal(formatSalesHistoryQuantity(Number.MAX_SAFE_INTEGER).endsWith('.991'), true);
  assert.equal(formatSalesHistoryQuantity(-1000), '—');
  assert.equal(formatSalesHistoryQuantity(1.5), '—');
  assert.equal(formatSalesHistoryQuantity(Number.MAX_SAFE_INTEGER + 1), '—');
});

test('R09P-02 stale identity/cursor/revision may never reveal prior tenant data', () => {
  const state: SalesHistoryReadState<{ returns: string[] }> = {
    key: 'tenant:A|epoch:2|first|revision:0',
    status: 'ready',
    data: { returns: ['only-A'] },
  };
  assert.deepEqual(salesHistoryVisibleState(state, state.key), { status: 'ready', data: { returns: ['only-A'] } });
  assert.deepEqual(salesHistoryVisibleState(state, 'tenant:B|epoch:3|first|revision:0'),
    { status: 'loading', data: null });
  assert.deepEqual(salesHistoryVisibleState(state, 'tenant:A|epoch:2|cursor:next|revision:0'),
    { status: 'loading', data: null });
  assert.deepEqual(salesHistoryVisibleState(state, 'tenant:A|epoch:2|first|revision:1'),
    { status: 'loading', data: null });
  assert.deepEqual(salesHistoryVisibleState(null, state.key), { status: 'loading', data: null });
  for (const status of ['loading', 'denied', 'error'] as const) {
    assert.deepEqual(salesHistoryVisibleState({ key: state.key, status, data: null }, state.key),
      { status, data: null });
  }
});

test('R09P-03 only a verified connected session with sales.return.view sends a GET', () => {
  assert.match(panel, /useSession\(\)/);
  assert.match(panel, /mode === 'connected' && snapshot\.status === 'authenticated'/);
  assert.match(panel, /snapshot\.permissions\.includes\('sales\.return\.view'\)/);
  assert.match(panel, /if \(!authenticated \|\| !allowed \|\| token === null\) return/);
  assert.match(panel, /readSalesReturnHistory\(token, \{ cursor: historyCursor, limit: 20 \}, controller\.signal\)/);
  assert.doesNotMatch(panel, /sales\.return\.create|salesPreviewStore|availableInvoices|seedReturns/);
});

test('R09P-04 identity-bound response is discarded immediately and request aborts on change', () => {
  assert.match(panel, /snapshot\.tenantId, snapshot\.userId, snapshot\.epoch, snapshot\.accessToken/);
  assert.match(panel, /const historyCursor = page\.identity === identity \? page\.cursor : null/);
  assert.match(panel, /const historyKey = \[identity, 'sales-return-history', historyCursor \?\? 'first', revision\]\.join\(':'\)/);
  assert.match(panel, /salesHistoryVisibleState\(history, historyKey\)/);
  assert.match(panel, /if \(!controller\.signal\.aborted\)/);
  assert.match(panel, /return \(\) => controller\.abort\(\)/);
});

test('R09P-05 display separates server-recorded return, cash refund and customer credit', () => {
  assert.match(panel, /data-sales-return-history-table=""/);
  assert.match(panel, /purchaseMoney\(item\.returnValueMinor\)/);
  assert.match(panel, /purchaseMoney\(item\.refundMinor\)/);
  assert.match(panel, /purchaseMoney\(item\.creditMinor\)/);
  assert.match(panel, /item\.saleNumber/);
  assert.match(panel, /item\.lines\.map\(line/);
  assert.match(panel, /formatSalesHistoryQuantity\(line\.qty\)/);
  assert.match(panel, /text\('Refund recorded'/);
  assert.match(panel, /text\('Customer credit'/);
  assert.match(panel, /voided/i);
  assert.doesNotMatch(panel, /refundMinor \+ .*creditMinor|returnValueMinor - .*refundMinor/);
});

test('R09P-06 retry, status, empty state and first/next pagination remain GET-only', () => {
  assert.match(panel, /setRevision\(value => value \+ 1\)/);
  assert.match(panel, /visible\.status === 'loading'/);
  assert.match(panel, /visible\.status === 'denied'/);
  assert.match(panel, /visible\.status === 'error'/);
  assert.match(panel, /rows\.length === 0/);
  assert.match(panel, /setPage\(\{ identity, cursor: visible\.data\?\.nextCursor \?\? null \}\)/);
  assert.match(panel, /setPage\(\{ identity, cursor: null \}\)/);
  assert.doesNotMatch(panel, /method:\s*['"](?:POST|PUT|PATCH|DELETE)['"]/);
  assert.doesNotMatch(panel, /requestJson|toast\.success/);
});

test('R09P-07 preserve preview mode and route gate; panel is a separately unmounted component', () => {
  assert.match(sales, /salesPreviewStore/);
  assert.match(sales, /subscribeSalesPreview/);
  assert.doesNotMatch(sales, /ConnectedSalesReturnHistoryPanel|readSalesReturnHistory/);
  assert.doesNotMatch(app, /ConnectedSalesReturnHistoryPanel/);
  assert.match(app, /ConnectedWorkspaceGate/);
  assert.match(panel, /from '\.\.\/Table'/);
  assert.doesNotMatch(panel, /font-mono|tabular-nums|tnum/);
});
