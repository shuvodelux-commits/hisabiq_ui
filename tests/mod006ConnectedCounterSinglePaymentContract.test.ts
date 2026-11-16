import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8');
const panel='../src/components/finance/ConnectedCounterSinglePayment.tsx';
const view='../src/components/finance/ConnectedCounterReadWorkspace.tsx';

test('H2 has a named real signed single-tender Review→Record panel only',()=>{
  const code=read(panel);
  assert.match(code,/export function ConnectedCounterSinglePayment/);
  assert.match(code,/recordConnectedCounterSettlement\(/);
  assert.match(code,/generateOperationId\(/);
  assert.match(code,/counterTakaToMinor\(/);
  assert.match(code,/data-h2-review/);
  assert.match(code,/data-h2-confirm/);
  assert.match(code,/data-h2-state/);
  assert.match(code,/data-h2-amount/);
  assert.match(code,/inFlight\.current/);
  assert.match(code,/businessDate/);
  assert.match(code,/original operation/i);
  for(const forbidden of [
    /dispatchPartyPreview/,/getPartyPreviewSnapshot/,/updateFinancePreview/,
    /recordSingleAccountCounterSettlement\(/,/localStorage/,/sessionStorage/,
    /setAccounts\(/,/Promise\.all\(.*recordConnectedCounterSettlement/s,
  ])assert.doesNotMatch(code,forbidden);
});
test('H2 exact backend source method and role and one-tender mapping',()=>{
  const code=read(panel);
  assert.match(code,/CUSTOMER_RECEIPT/);
  assert.match(code,/SUPPLIER_PAYMENT/);
  assert.match(code,/method:\s*'Cash'/);
  assert.match(code,/method:\s*'Bank'/);
  assert.match(code,/method:\s*'Mobile Banking'/);
  assert.match(code,/sources:\s*\[/);
  assert.doesNotMatch(code,/discount:\s*\d|invoiceId:\s*[^n]|splitPayment/);
});
test('connected source UI composes signed panel without replacing the H1 read-only section',()=>{
  const code=read(view);
  assert.match(code,/import \{ ConnectedCounterSinglePayment \}/);
  assert.match(code,/<ConnectedCounterSinglePayment/);
  assert.match(code,/selectedAccount/);
  assert.match(code,/selected/);
  assert.match(code,/onPosted=/);
  assert.match(code,/onUnresolved=/);
  assert.match(code,/setReload\(/);
  assert.match(code,/data-read-only="true"/);
  assert.doesNotMatch(code,/recordConnectedCounterSettlement\(/);
});
test('preview Counter, global connected route gate and H1 read-only test stay intact',()=>{
  const page=read('../src/pages/Finance.tsx');
  const gate=read('../src/integration/ConnectedWorkspaceGate.tsx');
  const h1=read('../tests/mod006ConnectedCounterReadContract.test.ts');
  assert.match(page,/return <FinancePreview \{\.\.\.props\} \/>;/);
  assert.match(page,/<CounterWorkspace accounts=\{accounts\}/);
  assert.match(page,/if \(props\.counterOnly\) return <ConnectedCounterReadWorkspace \/>;/);
  assert.match(gate,/workspace=pending/);
  assert.doesNotMatch(gate,/ConnectedCounterSinglePayment/);
  assert.match(h1,/recordConnectedCounterSettlement/);
});
