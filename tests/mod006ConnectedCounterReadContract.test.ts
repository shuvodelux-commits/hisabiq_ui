import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = relative => readFileSync(new URL(relative, import.meta.url), 'utf8');
const target = '../src/components/finance/ConnectedCounterReadWorkspace.tsx';

test('connected Counter must be a real separate read-only screen, not preview CounterWorkspace', () => {
  const component = read(target);
  assert.match(component, /export function ConnectedCounterReadWorkspace/);
  assert.match(component, /readTradingParties\(/);
  assert.match(component, /readMoneyAccounts\(/);
  assert.match(component, /fetchCashDay\(/);
  assert.match(component, /snapshot\.status\s*===\s*'authenticated'/);
  assert.match(component, /AbortController/);
  assert.match(component, /data-connected-counter/);
  for (const unsupported of [
    /dispatchPartyPreview/, /getPartyPreviewSnapshot/, /updateFinancePreview/,
    /setAccounts\(/, /recordConnectedCounterSettlement/, /recordSingleAccountCounterSettlement/,
    /method:\s*['"]POST['"]/, /localStorage/, /sessionStorage/,
  ]) assert.doesNotMatch(component, unsupported);
});
test('Finance connected counterOnly renders the read-only source component while preserving preview branch', () => {
  const page = read('../src/pages/Finance.tsx');
  assert.match(page, /import \{ ConnectedCounterReadWorkspace \}/);
  assert.match(page, /if \(props\.counterOnly\) return <ConnectedCounterReadWorkspace\s*\/>;/);
  assert.match(page, /return <FinancePreview \{\.\.\.props\} \/>;/);
  assert.match(page, /<CounterWorkspace accounts=\{accounts\}/);
  assert.match(page, /updateFinancePreview\('accounts', change\)/);
});
test('real connected workspace global gate stays CLOSED and never mounts preview financial pages',()=>{
  const gate=read('../src/integration/ConnectedWorkspaceGate.tsx');
  assert.match(gate, /workspace=pending/);
  assert.match(gate, /if \(mode === 'preview'\) return/);
  assert.doesNotMatch(gate, /ConnectedCounterReadWorkspace|CounterWorkspace/);
});
test('amount formatting is source minor-unit aware and not optimistic local debit/credit',()=>{
  const code=read(target);
  assert.match(code,/BigInt/);
  assert.doesNotMatch(code,/balanceMinor\s*[+-]=|\.balanceMinor\s*\+|\.balanceMinor\s*-/);
  assert.match(code,/role === 'CUSTOMER'/);
  assert.match(code,/role === 'CUSTOMER'\s*\?/);
  assert.match(code,/Supplier advance/);
});
