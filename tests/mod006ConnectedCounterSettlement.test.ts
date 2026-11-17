import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ApiError } from '../src/integration/errors.ts';
import { recordConnectedBankCounterSettlement } from '../src/integration/connected-counter-settlement.ts';

const tenant = '01ARZ3NDEKTSV4RRFFQ69G5FAA';
const user = '01ARZ3NDEKTSV4RRFFQ69G5FAB';
const customer = '01ARZ3NDEKTSV4RRFFQ69G5FAC';
const supplier = '01ARZ3NDEKTSV4RRFFQ69G5FAD';
const sourceId = '01ARZ3NDEKTSV4RRFFQ69G5FAE';
const paymentId = '01ARZ3NDEKTSV4RRFFQ69G5FAF';
const operationId = '01ARZ3NDEKTSV4RRFFQ69G5FAG';
const saleId = '01ARZ3NDEKTSV4RRFFQ69G5FAH';
const accessToken='verified-counter-access';
const grants=['party.customer.view','party.supplier.view','sale.payment.record',
  'purchase.payment.record','cash.account.view','bank.account.view'];
const snapshot=(overrides={})=>({
  status:'authenticated',tenantId:tenant,userId:user,epoch:21,accessToken,
  permissions:[...grants],features:[],persistence:'memory',timezone:'Asia/Dhaka',
  username:'cashier',displayName:'Cashier',roleName:'Cashier',businessName:'Shop',
  ...overrides,
});
const bank=(type='BANK',overrides={})=>({
  id:sourceId,name:'Trading source',type,status:'ACTIVE',isDrawer:false,
  balanceMinor:100000,holderName:null,reference:null,openingAmountMinor:0,
  openingDate:null,version:1,...overrides,
});
const party=(role='CUSTOMER',after=false,overrides={})=>({
  id:role==='SUPPLIER'?supplier:customer,name:'Trading Party',roles:[role],
  readRole:role,status:'ACTIVE',isSystemReserved:false,phone:null,
  customerGroupId:null,customerGroupName:null,creditLimitMinor:null,version:1,
  balance:{netMinor:after?-2350:0,direction:after?'PAYABLE':'SETTLED',
    outstandingMinor:0,advanceMinor:after?2350:0},
  profile:{state:'WITHHELD'},globalHistory:{state:'WITHHELD'},
  ...overrides,
});
const draft=(kind='CUSTOMER_RECEIPT',overrides={})=>({
  kind,partyId:kind==='SUPPLIER_PAYMENT'?supplier:customer,
  operationId,sources:[{method:'Bank',account:bank(),amount:'23.50'}],
  ...overrides,
});
const customerReply=()=>({data:{
  id:paymentId,number:'CR-002',customerPartyId:customer,customerName:'Trading Party',
  accountCode:'BANK:'+sourceId,accountName:'Trading source',amountMinor:2350,
  businessDate:'2026-11-15',note:null,allocations:[],settledMinor:0,advanceMinor:2350,
  status:'POSTED',entryMode:'ON_TIME',voidReason:null,version:1,
}});
const supplierReply=()=>({data:{
  id:paymentId,number:'SP-002',supplierPartyId:supplier,supplierName:'Trading Party',
  accountCode:'BANK:'+sourceId,accountName:'Trading source',amountMinor:2350,
  businessDate:'2026-11-15',note:null,allocations:[],outstandingAfterMinor:0,
  createdAt:'2026-11-15T08:00:00.000Z',status:'POSTED',entryMode:'ON_TIME',
  voidReason:null,version:1,
}});
const initFetch=globalThis.fetch;
const initLocation=Object.getOwnPropertyDescriptor(globalThis,'location');
Object.defineProperty(globalThis,'location',{
  value:{origin:'https://hisabiq.example.test'},configurable:true,
});
after(()=>{
  globalThis.fetch=initFetch;
  if(initLocation)Object.defineProperty(globalThis,'location',initLocation);
  else delete globalThis.location;
});
function store(initial=snapshot()) {
  let current=initial;const listeners=new Set();
  let checks=0;
  return {
    getSnapshot:()=>current,
    subscribe:(fn)=>{listeners.add(fn);return()=>listeners.delete(fn);},
    revalidateAccess:async()=>{checks++;},
    change:(next)=>{current=next;for(const fn of listeners)fn();},
    listenerCount:()=>listeners.size,
    revalidations:()=>checks,
  };
}
const reply=(data,status=200)=>new Response(JSON.stringify(data),{
  status,headers:{'content-type':'application/json'},
});
let calls=[];
function mock(role='CUSTOMER',type='BANK',opts={}) {
  calls=[];
  let reads=0;
  globalThis.fetch=async(url,options)=>{
    const path=new URL(url).pathname;
    calls.push({path,method:options.method,options});
    assert.equal(options.headers.get('Authorization'),'Bearer '+accessToken);
    if(options.method==='POST') {
      assert.equal(options.headers.get('Idempotency-Key'),operationId);
      assert.equal(calls.filter(c=>c.method==='POST').length,1);
      if(opts.beforePost) await opts.beforePost();
      if(opts.rejectPost) throw new TypeError('network lost response');
      if(opts.postStatus) return reply({error:{code:'DENIED',message:'Denied',details:{},traceId:'test'}},opts.postStatus);
      return reply(role==='CUSTOMER'?customerReply():supplierReply(),201);
    }
    assert.equal(options.method,'GET');
    if(opts.rejectAfterPost&&calls.some(c=>c.method==='POST'))throw new TypeError('read after commit unavailable');
    const after=calls.some(c=>c.method==='POST');
    reads++;
    if(opts.onGet)await opts.onGet({path,after});
    if(path==='/api/v1/money/accounts')return reply({
      accounts:[bank(type,{balanceMinor:after?102350:100000})],
      totalCashMinor:0,totalBankMinor:after?102350:100000,
      totalMfsMinor:0,totalLoanMinor:0,
    });
    if(path==='/api/v2/parties/'+(role==='CUSTOMER'?customer:supplier)) {
      assert.equal(new URL(url).search,'?role='+role);
      return reply({data:party(role,after)});
    }
    throw Error('unexpected '+path);
  };
  return()=>reads;
}
async function blocked(value,st=store()) {
  calls=[];globalThis.fetch=async()=>{calls.push('unexpected');throw Error('unexpected network call');};
  await assert.rejects(recordConnectedBankCounterSettlement(st,value),
    error=>error instanceof ApiError && error.kind==='protocol');
  assert.equal(calls.length,0);
}
test('signed customer BANK: GET/GET → one source POST → GET/GET fresh account and Party',async()=>{
  mock();
  const s=store(),original=draft();
  const result=await recordConnectedBankCounterSettlement(s,original);
  assert.equal(s.revalidations(),1);
  assert.equal(s.listenerCount(),0);
  assert.equal(result.payment.kind,'CUSTOMER_RECEIPT');
  assert.equal(result.account.balanceMinor,102350);
  assert.equal(result.party.balance.advanceMinor,2350);
  assert.deepEqual(result.scope,{tenantId:tenant,userId:user,epoch:21});
  assert.equal(calls.filter(c=>c.method==='GET').length,4);
  assert.equal(calls.filter(c=>c.method==='POST').length,1);
  assert.deepEqual(calls.map(c=>c.method),['GET','GET','POST','GET','GET']);
  assert.equal(calls[2].path,'/api/v1/customer-payments');
  assert.equal(JSON.parse(calls[2].options.body).amountMinor,2350);
  assert.equal(original.sources[0].account.balanceMinor,100000);
  assert.equal(original.operationId,operationId);
});
test('supplier MFS maps source-owned BANK journal and correct role',async()=>{
  mock('SUPPLIER','MFS');
  const value=draft('SUPPLIER_PAYMENT',{sources:[{method:'Mobile Banking',account:bank('MFS'),amount:'23.50'}]});
  const result=await recordConnectedBankCounterSettlement(store(),value);
  assert.equal(result.payment.kind,'SUPPLIER_PAYMENT');
  assert.equal(result.account.type,'MFS');
  assert.equal(calls[2].path,'/api/v1/suppliers/payments');
  assert.equal(JSON.parse(calls[2].options.body).accountCode,'BANK:'+sourceId);
});
test('all invalid/split/discount/invoice/loan/owner/CASH requests fail before any GET or POST',async()=>{
  const cases=[
    draft('OWNER_WITHDRAWAL'),
    draft('CUSTOMER_RECEIPT',{sources:[]}),
    draft('CUSTOMER_RECEIPT',{sources:[...draft().sources,...draft().sources]}),
    draft('CUSTOMER_RECEIPT',{discount:'5'}),
    draft('CUSTOMER_RECEIPT',{discountReason:'Rounding'}),
    draft('CUSTOMER_RECEIPT',{invoiceId:saleId}),
    draft('CUSTOMER_RECEIPT',{partyId:'preview-party'}),
    draft('CUSTOMER_RECEIPT',{operationId:'preview-operation'}),
    draft('CUSTOMER_RECEIPT',{sources:[{method:'Bank',account:bank(),amount:'0.00'}]}),
    draft('CUSTOMER_RECEIPT',{sources:[{method:'Cash',account:bank('CASH'),amount:'23.50'}]}),
    draft('CUSTOMER_RECEIPT',{sources:[{method:'Bank',account:bank('LOAN'),amount:'23.50'}]}),
    draft('CUSTOMER_RECEIPT',{sources:[{method:'Cash',account:bank('BANK'),amount:'23.50'}]}),
  ];
  for(const value of cases)await blocked(value);
});
test('locked, preview and revoked session are rejected before GET',async()=>{
  await blocked(draft(),store({status:'locked',epoch:22,reason:'inactivity'}));
  await blocked(draft(),store({status:'preview',epoch:0}));
  await blocked(draft(),store(snapshot({permissions:grants.filter(x=>x!=='sale.payment.record')})));
});
test('fresh server account type mismatch refuses POST',async()=>{
  mock('CUSTOMER','MFS');
  await assert.rejects(recordConnectedBankCounterSettlement(store(),draft()),
    {name:'ApiError',kind:'protocol'});
  assert.equal(calls.filter(c=>c.method==='POST').length,0);
});
test('session switch during signed GET refuses money POST and restores listeners',async()=>{
  const s=store();
  mock('CUSTOMER','BANK',{onGet:async()=>{
    s.change(snapshot({tenantId:'01ARZ3NDEKTSV4RRFFQ69G5FAJ',epoch:22}));
  }});
  await assert.rejects(recordConnectedBankCounterSettlement(s,draft()),
    {name:'ApiError',kind:'protocol'});
  assert.equal(calls.filter(c=>c.method==='POST').length,0);
  assert.equal(s.listenerCount(),0);
});
test('session change while POST is in flight may have committed; no success or hidden retry',async()=>{
  const s=store();
  mock('CUSTOMER','BANK',{beforePost:async()=>{
    s.change({status:'locked',epoch:22,reason:'inactivity'});
    throw new TypeError('lost connection after submission');
  }});
  const original=draft();
  await assert.rejects(recordConnectedBankCounterSettlement(s,original),error=>
    error instanceof ApiError && /reconcil|may have posted/i.test(error.message));
  assert.equal(calls.filter(c=>c.method==='POST').length,1);
  assert.equal(s.listenerCount(),0);
  assert.equal(original.operationId,operationId);
});
test('denied 403/409 and network lost response retain original key without automatic retry',async()=>{
  for(const status of [403,409]){
    mock('CUSTOMER','BANK',{postStatus:status});
    await assert.rejects(recordConnectedBankCounterSettlement(store(),draft()),
      error=>error instanceof ApiError && error.kind==='http' && error.status===status);
    assert.equal(calls.filter(c=>c.method==='POST').length,1);
  }
  mock('CUSTOMER','BANK',{rejectPost:true});
  const original=draft();
  await assert.rejects(recordConnectedBankCounterSettlement(store(),original),
    error=>error instanceof ApiError && error.kind==='network');
  assert.equal(calls.filter(c=>c.method==='POST').length,1);
  assert.equal(original.operationId,operationId);
});
test('post may have committed but fresh GET fails: reconciliation required, no false success',async()=>{
  mock('CUSTOMER','BANK',{rejectAfterPost:true});
  await assert.rejects(recordConnectedBankCounterSettlement(store(),draft()),
    error=>error instanceof ApiError && /reconcil|may have posted/i.test(error.message));
  assert.equal(calls.filter(c=>c.method==='POST').length,1);
});
test('manual replay retains original key and posts only one source operation per invocation',async()=>{
  mock();
  const s=store(),original=draft();
  await recordConnectedBankCounterSettlement(s,original);
  // New mock session simulates caller-initiated retry with unchanged original operation ID.
  mock();
  await recordConnectedBankCounterSettlement(s,original);
  assert.equal(calls.filter(c=>c.method==='POST').length,1);
  assert.equal(calls[2].options.headers.get('Idempotency-Key'),operationId);
});
test('coordinator stays unmounted and never writes preview balance or uses local fixtures',()=>{
  const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
  const coordinator=read('../src/integration/connected-counter-settlement.ts');
  for(const path of [
    '../src/components/finance/CounterWorkspace.tsx',
    '../src/pages/Finance.tsx',
    '../src/integration/ConnectedWorkspaceGate.tsx',
  ]) assert.doesNotMatch(read(path),/connected-counter-settlement/);
  assert.doesNotMatch(coordinator,/setAccounts\(|dispatchPartyPreview|localStorage|sessionStorage|updateFinancePreview/);
  assert.match(read('../src/integration/ConnectedWorkspaceGate.tsx'),/workspace=pending/);
});
