import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * MOD-006 T01-R/P2-A source contract, not a mounted-browser acceptance suite.
 * P2-B must still verify authenticated React→Nest→disposable PostgreSQL16.
 * This isolated slice must never activate any connected AppShell routes.
 */
const path = fileURLToPath(new URL('../src/components/finance/FinanceRecordDialogs.tsx', import.meta.url));
const source = readFileSync(path, 'utf8');
const start = source.indexOf('export function ConnectedMoneyAccountActionDialog(');
const connected = start < 0 ? '' : source.slice(start);

test('server statement dialog exists separately from preserved preview dialog', () => {
  assert.match(source, /export function FinanceAccountActionDialog\(/);
  assert.ok(start >= 0, 'requires separate server-money dialog');
  assert.match(source, /account: ServerMoneyAccount;/);
  assert.match(connected, /selection: ConnectedMoneyAccountSelection/);
});

test('server dialog requires exact verified tenant, user and epoch before displaying account', () => {
  assert.match(connected, /selection\.tenantId\s*===\s*snapshot\.tenantId/);
  assert.match(connected, /selection\.userId\s*===\s*snapshot\.userId/);
  assert.match(connected, /selection\.epoch\s*===\s*snapshot\.epoch/);
  assert.match(connected, /mode\s*===\s*'connected'/);
});

test('server dialog reads selected canonical account statement and aborts stale requests', () => {
  assert.match(connected, /readMoneyAccountStatement\(/);
  assert.match(connected, /selection\.account\.id/);
  assert.match(connected, /new AbortController\(\)/);
  assert.match(connected, /controller\.abort\(\)/);
  assert.match(connected, /if\s*\(!active\)/);
});

test('server dialog has only read and print actions; no money posting or preview fallback', () => {
  for (const forbidden of [
    'setAccounts(', 'updateFinancePreview(', 'onManualEntry(', 'onToggleStatus(',
    'onUpdate(', 'onTransfer(', 'POST', 'PATCH', 'DELETE',
  ]) assert.equal(connected.includes(forbidden), false, forbidden);
  assert.match(connected, /printReport\(/);
});

test('loan balance explicitly remains a debt and period totals are never invented', () => {
  assert.match(connected, /Lender loan \(liability\)/);
  assert.match(connected, /Shown money in \(page\)/);
  assert.match(connected, /Shown money out \(page\)/);
  assert.match(connected, /Current balance/);
  assert.match(connected, /Page opening/);
});

test('statement print and rows come only from the verified same-scope response', () => {
  assert.match(connected, /visibleStatement/);
  assert.match(connected, /visibleStatement\.rows/);
  assert.match(connected, /scope:/);
  assert.match(connected, /sessionScope/);
  assert.match(connected, /safeMinorTaka/);
});

test('server presentation has navigation and retry but does not open the connected workspace gate', () => {
  assert.match(connected, /Previous page/);
  assert.match(connected, /Next page/);
  assert.match(connected, /Retry/);
  assert.doesNotMatch(source, /ConnectedWorkspaceGate/);
});


test('state keys use an opaque symbol, never persist or serialize the bearer', () => {
  assert.match(connected, /Symbol\('verified-account-statement'\)/);
  assert.match(connected, /\[snapshot, mode, authenticatedScope/);
  assert.match(connected, /scope: symbol;/);
  assert.match(connected, /scope: symbol \| null;/);
  assert.doesNotMatch(connected, /join\(':'\)/);
  assert.doesNotMatch(connected, /scope: snapshot\.accessToken/);
  assert.doesNotMatch(connected, /scope:.*accessToken/);
});
