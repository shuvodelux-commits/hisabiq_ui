import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ApiError } from '../src/integration/errors.ts';
import { recordVerifiedMoneyTransfer } from '../src/integration/money-transfer.ts';

const cash = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const bank = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const mfs = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const operationId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const postingId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const token = 'authenticated-tenant-transport-test';
const date = '2026-11-15';

const account = (id, type, overrides = {}) => ({
  id, name: 'Verified account', type, holderName: null, reference: null,
  isDrawer: type === 'CASH', status: 'ACTIVE',
  balanceMinor: 100_000, openingAmountMinor: 100_000,
  openingDate: '2026-01-01', version: 1, ...overrides,
});
const draft = (overrides = {}) => ({
  kind: 'TRANSFER', from: account(cash,'CASH'), to: account(bank,'BANK'),
  amount: '123.45', businessDate: date, operationId,
  reference: null, note: null, ...overrides,
});
const replyData = (overrides = {}) => ({ data: {
  id: postingId, number: 'MV-001', kind:'TRANSFER',
  fromAccountCode:'CASH:' + cash, fromAccountName:'Cash counter',
  toAccountCode:'BANK:' + bank, toAccountName:'Bank',
  amountMinor:12345, businessDate:date, reference:null, note:null,
  createdAt:'2026-11-15T03:00:00.000Z', ...overrides,
}});
const savedFetch = globalThis.fetch;
const savedLocation = Object.getOwnPropertyDescriptor(globalThis,'location');
Object.defineProperty(globalThis,'location',{configurable:true,value:{origin:'https://erp.example.test'}});
after(() => {
  globalThis.fetch = savedFetch;
  if (savedLocation) Object.defineProperty(globalThis,'location',savedLocation);
  else delete globalThis.location;
});
let calls = [];
function mock(body,status=201) {
  calls = [];
  globalThis.fetch = async (url,options) => {
    calls.push({url:String(url),options});
    return new Response(JSON.stringify(body),{
      status,headers:{'content-type':'application/json'},
    });
  };
}
async function blocked(value) {
  calls = [];
  globalThis.fetch = async () => { calls.push('unexpected'); throw Error('must not send'); };
  await assert.rejects(recordVerifiedMoneyTransfer(token,value),
    error => error instanceof ApiError && error.kind === 'protocol');
  assert.equal(calls.length,0);
}
test('CASH to BANK sends exact source-owned movement schema and idempotency key',async()=>{
  mock(replyData());
  const source = draft();
  const response = await recordVerifiedMoneyTransfer(token,source);
  assert.equal(response.id,postingId);
  assert.equal(calls.length,1);
  assert.equal(calls[0].url,'https://erp.example.test/api/v1/money/movements');
  assert.equal(calls[0].options.method,'POST');
  assert.equal(calls[0].options.headers.get('Authorization'),'Bearer ' + token);
  assert.equal(calls[0].options.headers.get('Idempotency-Key'),operationId);
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    kind:'TRANSFER',fromAccountCode:'CASH:' + cash,toAccountCode:'BANK:' + bank,
    amountMinor:12345,businessDate:date,reference:null,note:null,operationId,
  });
  assert.equal(source.amount,'123.45');
});
test('BANK to MFS and MFS to CASH are BANK journal codes, never MFS codes',async()=>{
  mock(replyData({fromAccountCode:'BANK:' + bank,toAccountCode:'BANK:' + mfs}));
  const x = await recordVerifiedMoneyTransfer(token,draft({
    from:account(bank,'BANK'),to:account(mfs,'MFS'),
  }));
  assert.equal(x.toAccountCode,'BANK:' + mfs);
  assert.deepEqual(JSON.parse(calls[0].options.body).toAccountCode,'BANK:' + mfs);
  mock(replyData({fromAccountCode:'BANK:' + mfs,toAccountCode:'CASH:' + cash}));
  await recordVerifiedMoneyTransfer(token,draft({
    from:account(mfs,'MFS'),to:account(cash,'CASH'),
  }));
  assert.equal(JSON.parse(calls[0].options.body).fromAccountCode,'BANK:' + mfs);
});
test('exact reference and note are trimmed, never used to infer a posting',async()=>{
  mock(replyData({reference:'BK-12',note:'Bank deposit'}));
  const source = draft({reference:'  BK-12  ',note:' Bank deposit '});
  await recordVerifiedMoneyTransfer(token,source);
  assert.equal(source.reference,'  BK-12  ');
  assert.equal(JSON.parse(calls[0].options.body).reference,'BK-12');
  assert.equal(JSON.parse(calls[0].options.body).note,'Bank deposit');
});
test('refuses same-account transfer, including duplicated bank and MFS source id',async()=>{
  await blocked(draft({to:account(cash,'CASH')}));
  await blocked(draft({from:account(bank,'BANK'),to:account(bank,'MFS')}));
});
test('refuses inactive, LOAN, counterfeit preview or wrong account identities',async()=>{
  await blocked(draft({from:account(cash,'CASH',{status:'INACTIVE'})}));
  await blocked(draft({to:account(bank,'LOAN')}));
  await blocked(draft({to:account('preview-account','BANK')}));
  await blocked(draft({from:account('','CASH')}));
  await blocked(draft({to:account(bank,'BANK',{name:''})}));
});
test('strict decimal poisha validation, no zero, negative, extra decimals or overflow',async()=>{
  for(const amount of ['0','0.00','-50','1.001','1e6',' 1.00','90071992547409.92','']){
    await blocked(draft({amount}));
  }
});
test('only TRANSFER is accepted, not owner, loan or opening adjustments',async()=>{
  for(const kind of ['OWNER_INJECTION','OWNER_WITHDRAWAL','LOAN_RECEIVED','LOAN_REPAYMENT',
    'OPENING_ADJUSTMENT','EXPENSE']) await blocked(draft({kind}));
});
test('rejects invalid date, operation key, reference/note length and token before POST',async()=>{
  await blocked(draft({businessDate:'2026-02-30'}));
  await blocked(draft({businessDate:''}));
  await blocked(draft({operationId:'preview-id'}));
  await blocked(draft({reference:'R'.repeat(65)}));
  await blocked(draft({note:'N'.repeat(501)}));
  calls = [];globalThis.fetch = async()=>{calls.push('unexpected');throw Error('should not send');};
  await assert.rejects(recordVerifiedMoneyTransfer('bad token',draft()),
    {name:'ApiError',kind:'protocol'});
  await assert.rejects(recordVerifiedMoneyTransfer(token,draft(),undefined,0),
    {name:'ApiError',kind:'protocol'});
  assert.equal(calls.length,0);
});
test('server response must echo original source, target, amount, date, kind and reference',async()=>{
  const malformed=[
    {data:{}}, replyData({amountMinor:12346}),
    replyData({fromAccountCode:'BANK:' + bank}),replyData({toAccountCode:'CASH:' + cash}),
    replyData({businessDate:'2026-11-14'}),replyData({kind:'OWNER_WITHDRAWAL'}),
    replyData({id:'preview-movement'}), replyData({reference:'unrelated'}),
    replyData({createdAt:'not-a-date'}),
    {data:{...replyData().data,untrustedField:'bad'}},
    {data:replyData().data,extra:true},
  ];
  for(const body of malformed){
    mock(body);
    await assert.rejects(recordVerifiedMoneyTransfer(token,draft()),
      {name:'ApiError',kind:'protocol'});
    assert.equal(calls.length,1);
  }
});
test('API denials and uncertain failures cannot become successful transfer notifications',async()=>{
  for(const status of [400,403,409,500]){
    mock({error:{code:'CONFLICT',message:'Denied',details:{},traceId:'test-trace'}},status);
    const original = draft();
    await assert.rejects(recordVerifiedMoneyTransfer(token,original), error=>
      error instanceof ApiError && error.kind==='http' && error.status===status);
    assert.equal(calls.length,1);
    assert.equal(original.operationId,operationId);
  }
  calls=[];
  globalThis.fetch = async(url,options)=>{
    calls.push({url,options});throw new TypeError('lost response');
  };
  const source = draft();
  await assert.rejects(recordVerifiedMoneyTransfer(token,source),
    {name:'ApiError',kind:'network'});
  assert.equal(calls.length,1,'never retries a possibly committed transfer automatically');
  assert.equal(source.operationId,operationId);
});
test('manual replay keeps the same operation ID and body',async()=>{
  mock(replyData());
  const source=draft();
  await recordVerifiedMoneyTransfer(token,source);
  await recordVerifiedMoneyTransfer(token,source);
  assert.equal(calls.length,2);
  for(const call of calls){
    assert.equal(call.options.headers.get('Idempotency-Key'),operationId);
    assert.equal(JSON.parse(call.options.body).operationId,operationId);
  }
});
test('already-aborted signal cannot be reported as a successful transfer',async()=>{
  const controller=new AbortController();controller.abort();
  calls=[];
  globalThis.fetch=async(url,options)=>{
    calls.push({url,options});
    assert.equal(options.signal.aborted,true);
    throw new DOMException('Aborted','AbortError');
  };
  await assert.rejects(recordVerifiedMoneyTransfer(token,draft(),controller.signal),
    {name:'ApiError',kind:'network'});
  assert.equal(calls.length,1);
});
test('new transfer transport is unmounted and leaves preview + workspace gate unchanged',()=>{
  const source=readFileSync(new URL('../src/integration/money-transfer.ts',import.meta.url),'utf8');
  const gate=readFileSync(new URL('../src/integration/ConnectedWorkspaceGate.tsx',import.meta.url),'utf8');
  const counter=readFileSync(new URL('../src/components/finance/CounterWorkspace.tsx',import.meta.url),'utf8');
  const finance=readFileSync(new URL('../src/pages/Finance.tsx',import.meta.url),'utf8');
  assert.doesNotMatch(source,/dispatchPartyPreview|setAccounts\(|getFinancePreviewSnapshot|localStorage/);
  assert.match(gate,/workspace=pending/);
  assert.doesNotMatch(counter,/integration\/money-transfer/);
  assert.doesNotMatch(finance,/integration\/money-transfer/);
});
