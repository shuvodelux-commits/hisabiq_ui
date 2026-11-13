import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source=readFileSync(new URL('../src/pages/Finance.tsx',import.meta.url),'utf8');
const from=source.indexOf('function ConnectedMoneyAccountsRead()');
const to=source.indexOf('/** All preview behavior',from);
assert.ok(from>0 && to>from,'connected money read section exists');
const connected=source.slice(from,to);
const preview=source.slice(source.indexOf('function FinancePreview('),from);

test('real live 320px P2-C regression: account grid has zero-minimum single track',()=>{
  assert.match(connected, /className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"/);
  assert.match(connected, /className="min-w-0 rounded-xl border border-border bg-card p-4"/);
  assert.match(connected, /data-connected-money-liabilities/);
  assert.equal((connected.match(/grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3/g)||[]).length,2);
});

test('account opening and date remain readable and honest',()=>{
  assert.match(connected, /openingAmountMinor === null/);
  assert.match(connected, /Opening date:/);
  assert.match(connected, /শুরুর তারিখ:/);
  assert.match(connected, /flex flex-wrap items-center justify-between/);
  assert.doesNotMatch(connected, /overflow-x-hidden|text-clip|hidden sm:/);
});

test('preview and connected financial semantics remain independent',()=>{
  assert.match(preview, /<FinanceAccountActionDialog/);
  assert.match(preview, /onManualEntry=\{addManualAccountEntry\}/);
  assert.match(connected, /readMoneyAccounts\(snapshot\.accessToken/);
  assert.match(connected, /<ConnectedMoneyAccountActionDialog selection=\{safeSelection\}/);
  assert.match(connected, /serverMoney\(loan \? -BigInt\(account\.balanceMinor\) : account\.balanceMinor\)/);
  assert.doesNotMatch(connected, /onManualEntry|onTransfer=\{|setFinancePreview/);
});
