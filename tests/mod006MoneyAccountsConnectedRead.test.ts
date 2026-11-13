import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/pages/Finance.tsx', import.meta.url), 'utf8');
const start = source.indexOf('function ConnectedMoneyAccountsRead()');
const end = source.indexOf('/** All preview behavior', start);
assert.ok(start > 0 && end > start, 'P2-B connected read component must be isolated');
const live = source.slice(start, end);
const preview = source.slice(source.indexOf('function FinancePreview('), start);
const wrapper = source.slice(end);

test('original preview Finance keeps existing money accounts actions and cards', () => {
  assert.match(preview, /useSyncExternalStore\(subscribeFinancePreview, getFinancePreviewSnapshot\)/);
  assert.match(preview, /<FinanceAccountActionDialog/);
  assert.match(preview, /onManualEntry=\{addManualAccountEntry\}/);
  assert.match(preview, /openAccountActions\(account, 'ledger'\)/);
  assert.match(preview, /Transfer history/);
  assert.match(wrapper, /return <FinancePreview \{\.\.\.props\} \/>/);
});

test('connected Finance only mounts verified read-only accounts, never preview stores', () => {
  assert.match(wrapper, /if \(mode === 'connected'\)/);
  assert.match(wrapper, /if \(props\.moneyAccountsOnly\) return <ConnectedMoneyAccountsRead \/>/);
  assert.match(live, /readMoneyAccounts\(snapshot\.accessToken, \{ includeInactive \}, controller\.signal\)/);
  assert.doesNotMatch(live, /getFinancePreviewSnapshot|subscribeFinancePreview|updateFinancePreview|seedAccounts|seedTransfers/);
  assert.doesNotMatch(live, /setAccounts|setTransactions|onManualEntry|onTransfer=\{/);
  assert.doesNotMatch(live, /POST|PATCH|DELETE|startCashDay|closeCashDay/);
});

test('verified snapshot identity invalidates in-flight pages and selected ledger', () => {
  assert.match(live, /Symbol\('verified-money-account-list'\)/);
  assert.match(live, /\[mode, snapshot, includeInactive, retry\]/);
  assert.match(live, /controller\.abort\(\)/);
  assert.match(live, /opened\?\.scope === scope/);
  assert.match(live, /account\.id === opened\.selection\.account\.id/);
  assert.match(live, /tenantId: snapshot\.tenantId/);
  assert.match(live, /userId: snapshot\.userId/);
  assert.match(live, /epoch: snapshot\.epoch/);
  assert.doesNotMatch(live, /accessToken.*\.join|scope:.*accessToken|localStorage|sessionStorage/);
});

test('lender liability is separate from liquid account balances', () => {
  assert.match(live, /account\.type !== 'LOAN'/);
  assert.match(live, /account\.type === 'LOAN'/);
  assert.match(live, /data\.totalLoanMinor/);
  assert.match(live, /serverMoney\(loan \? -BigInt\(account\.balanceMinor\) : account\.balanceMinor\)/);
  assert.match(live, /account\.balanceMinor > 0/);
  assert.match(live, /Opening date:/);
  assert.doesNotMatch(live, /No activity date supplied/);
  assert.match(live, /data\.totalCashMinor/);
  assert.match(live, /data\.totalBankMinor/);
  assert.match(live, /data\.totalMfsMinor/);
  assert.match(live, /account\.openingAmountMinor === null/);
  assert.doesNotMatch(live, /account\.openingAmountMinor \?\? 0/);
});

test('connected unsupported actions are visibly disabled with truthful explanation', () => {
  assert.match(live, /const noWrites = text\(/);
  assert.match(live, /const unavailable = text\(/);
  assert.match(live, /<Button size="sm" disabled title=\{unavailable\}>/);
  assert.match(live, /<ActionMenuItem icon=\{Pencil\} disabled/);
  assert.match(live, /<ActionMenuItem icon=\{Banknote\} disabled/);
  assert.match(live, /<ActionMenuItem icon=\{Power\} disabled/);
  assert.match(live, /<ActionMenuItem icon=\{RotateCcw\} disabled/);
  assert.match(live, /Transfer history is not connected/);
  assert.match(live, /<ConnectedMoneyAccountActionDialog selection=\{safeSelection\}/);
});

test('permission denial and GET failures never substitute fixture balances', () => {
  assert.match(live, /error\.status === 403/);
  assert.match(live, /\? 'permission-denied' : 'error'/);
  assert.match(live, /current\?\.status === 'error'/);
  assert.match(live, /No permitted accounts to display/);
  assert.match(live, /preview balances will not be substituted/);
  assert.match(live, /<RefreshCw className="size-4" \/>/);
});
