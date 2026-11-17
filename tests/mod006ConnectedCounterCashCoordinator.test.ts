import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  recordConnectedBankCounterSettlement,
  recordConnectedCounterSettlement,
} from '../src/integration/connected-counter-settlement.ts';

const tenant='01ARZ3NDEKTSV4RRFFQ69G5FAA';
const user='01ARZ3NDEKTSV4RRFFQ69G5FAB';
const customer='01ARZ3NDEKTSV4RRFFQ69G5FAC';
const supplier='01ARZ3NDEKTSV4RRFFQ69G5FAD';
const cash='01ARZ3NDEKTSV4RRFFQ69G5FAE';
const paymentId='01ARZ3NDEKTSV4RRFFQ69G5FAF';
const operationId='01ARZ3NDEKTSV4RRFFQ69G5FAG';
const dayId='01ARZ3NDEKTSV4RRFFQ69G5FAH';
const date='2026-11-16';
const token='g3-signed-test-token';
const grants=[
  'party.customer.view','party.supplier.view','sale.payment.record',
  'purchase.payment.record','cash.account.view','cash.daily.view','bank.account.view',
];
const snapshot=(overrides={})=>({
  status:'authenticated',tenantId:tenant,userId:user,epoch:7,accessToken:token,
  permissions:[...grants],features:[],persistence:'memory',timezone:'Asia/Dhaka',
  username:'signed',displayName:'Signed',roleName:'Cashier',businessName:'Disposable',
  ...overrides,
});
const account=(overrides={})=>({
  id:cash,name:'Signed drawer',type:'CASH',status:'ACTIVE',isDrawer:true,
  holderName:null,reference:null,balanceMinor:50000,openingAmountMinor:0,
  openingDate:null,version:1,...overrides,
});
const day=(overrides={})=>({
  enabled:true,drawerAccountId:cash,businessDate:date,
  todaySession:{
    id:dayId,number:'CS-0001',accountId:cash,accountName:'Signed drawer',
    businessDate:date,status:'OPEN',openingAmountMinor:50000,
    previousClosingMinor:null,cashInMinor:0,cashOutMinor:0,
    expectedClosingMinor:50000,openedAt:'2026-11-16T08:00:00Z',
    openedByName:'Signed',closes:[],version:1,
  },
  blockedByDate:null,blockedSession:null,previousClosingMinor:null,
  drawerBalanceMinor:50000,canReopenToday:false,...overrides,
});
const party=(kind,after)=>({
  id:kind==='CUSTOMER_RECEIPT'?customer:supplier,name:'Counter Party',
  roles:[kind==='CUSTOMER_RECEIPT'?'CUSTOMER':'SUPPLIER'],
  readRole:kind==='CUSTOMER_RECEIPT'?'CUSTOMER':'SUPPLIER',
  status:'ACTIVE',isSystemReserved:false,phone:null,
  customerGroupId:null,customerGroupName:null,creditLimitMinor:null,version:1,
  balance:{netMinor:after?-2350:0,direction:after?'PAYABLE':'SETTLED',
    outstandingMinor:0,advanceMinor:after?2350:0},
  profile:{state:'WITHHELD'},globalHistory:{state:'WITHHELD'},
});
const draft=(kind='CUSTOMER_RECEIPT',overrides={})=>({
  kind,partyId:kind==='CUSTOMER_RECEIPT'?customer:supplier,
  operationId,sources:[{method:'Cash',account:account(),amount:'23.50'}],
  ...overrides,
});
const receipt=(kind)=>({data:{
  id:paymentId,number:kind==='CUSTOMER_RECEIPT'?'CR-009':'SP-009',
  [kind==='CUSTOMER_RECEIPT'?'customerPartyId':'supplierPartyId']:
    kind==='CUSTOMER_RECEIPT'?customer:supplier,
  [kind==='CUSTOMER_RECEIPT'?'customerName':'supplierName']:'Counter Party',
  accountCode:'CASH:'+cash,accountName:'Signed drawer',amountMinor:2350,
  businessDate:date,note:null,allocations:[],status:'POSTED',
  entryMode:'ON_TIME',voidReason:null,version:1,
  ...(kind==='CUSTOMER_RECEIPT'
    ?{settledMinor:0,advanceMinor:2350}
    :{outstandingAfterMinor:0,createdAt:'2026-11-16T08:00:00Z'}),
}});
const response=(value,status=200)=>new Response(JSON.stringify(value),{
  status,headers:{'content-type':'application/json'},
});
const previousFetch=globalThis.fetch;
const previousLocation=Object.getOwnPropertyDescriptor(globalThis,'location');
Object.defineProperty(globalThis,'location',{
  configurable:true,value:{origin:'https://hisabiq.invalid'},
});
after(()=>{
  globalThis.fetch=previousFetch;
  if(previousLocation)Object.defineProperty(globalThis,'location',previousLocation);
  else delete globalThis.location;
});
function store(initial=snapshot()){
  let current=initial;
  let checks=0;
  const listeners=new Set();
  return {
    getSnapshot:()=>current,
    subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},
    revalidateAccess:async()=>{checks++;},
    change:next=>{current=next;for(const fn of listeners)fn();},
    subscribers:()=>listeners.size,
    checks:()=>checks,
  };
}
let hits=[];
function mock(kind='CUSTOMER_RECEIPT',options={}){
  hits=[];
  globalThis.fetch=async(url,init)=>{
    const path=new URL(url).pathname;
    hits.push({method:init.method,path,headers:init.headers,body:init.body});
    assert.equal(init.headers.get('Authorization'),'Bearer '+token);
    if(options.onCall)await options.onCall({path,method:init.method});
    if(init.method==='POST'){
      assert.equal(init.headers.get('Idempotency-Key'),operationId);
      assert.equal(init.headers.get('Content-Type'),'application/json');
      const body=JSON.parse(init.body);
      assert.equal(body.accountCode,'CASH:'+cash);
      assert.equal(body.businessDate,date);
      assert.equal(body.amountMinor,2350);
      assert.equal(path,kind==='CUSTOMER_RECEIPT'
        ?'/api/v1/customer-payments':'/api/v1/suppliers/payments');
      return response(receipt(kind),201);
    }
    assert.equal(init.method,'GET');
    const posted=hits.some(h=>h.method==='POST');
    if(path==='/api/v1/money/accounts')return response({
      accounts:[account({balanceMinor:posted?52350:50000})],
      totalCashMinor:posted?52350:50000,
      totalBankMinor:0,totalMfsMinor:0,totalLoanMinor:0,
    });
    if(path==='/api/v1/money/day')return response(options.day??day());
    if(path==='/api/v2/parties/'+(kind==='CUSTOMER_RECEIPT'?customer:supplier)){
      assert.equal(new URL(url).search,'?role='+(
        kind==='CUSTOMER_RECEIPT'?'CUSTOMER':'SUPPLIER'));
      return response({data:party(kind,posted)});
    }
    throw Error('Unexpected '+path);
  };
}
async function denied(value, options={}, st=store()){
  mock(value.kind||'CUSTOMER_RECEIPT',options);
  await assert.rejects(recordConnectedCounterSettlement(st,value),error=>
    error instanceof ApiError&&error.kind==='protocol');
  assert.equal(hits.filter(h=>h.method==='POST').length,0);
}
test('ON and OPEN: signed cashier CASH receipt goes through Party/account/day, single writer POST and real reread',async()=>{
  mock();
  const s=store();
  const result=await recordConnectedCounterSettlement(s,draft());
  assert.equal(result.payment.data.id,paymentId);
  assert.equal(result.payment.data.accountCode,'CASH:'+cash);
  assert.equal(result.account.balanceMinor,52350);
  assert.equal(result.party.balance.netMinor,-2350);
  assert.equal(result.cashDay.mode,'OPEN');
  assert.equal(result.cashDay.sessionId,dayId);
  assert.equal(result.scope.tenantId,tenant);
  assert.equal(s.subscribers(),0);
  assert.equal(hits.filter(h=>h.method==='POST').length,1);
  assert.equal(hits.filter(h=>h.path==='/api/v1/money/day').length,1);
  assert.ok(s.checks()>=2);
});
test('OFF: supplier CASH payment is allowed with server-verified NULL session and a single POST',async()=>{
  mock('SUPPLIER_PAYMENT',{day:day({enabled:false,todaySession:null})});
  const result=await recordConnectedCounterSettlement(store(),draft('SUPPLIER_PAYMENT'));
  assert.equal(result.payment.kind,'SUPPLIER_PAYMENT');
  assert.equal(result.cashDay.mode,'OFF');
  assert.equal(result.cashDay.sessionId,null);
  assert.equal(hits.filter(h=>h.method==='POST').length,1);
});
test('ON: non-drawer CASH source does not invent a counted Cash Day',async()=>{
  mock('CUSTOMER_RECEIPT',{day:day({enabled:true,drawerAccountId:null,todaySession:null})});
  // Accounts request still returns a drawer and must refuse mismatched physical policy.
  await assert.rejects(recordConnectedCounterSettlement(store(),draft()),ApiError);
  assert.equal(hits.filter(h=>h.method==='POST').length,0);
});
test('ON with missing/closed/previous day refuses before financial POST',async()=>{
  for(const bad of [
    day({todaySession:null}),
    day({todaySession:{...day().todaySession,status:'CLOSED'}}),
    day({blockedByDate:'2026-11-15',blockedSession:{
      ...day().todaySession,businessDate:'2026-11-15',
    }}),
  ])await denied(draft(),{day:bad});
});
test('server date differs from draft date: refuses before financial POST',async()=>{
  await denied(draft('CUSTOMER_RECEIPT',{businessDate:'2026-11-15'}));
});
test('split tender, discount, invoice, stale account and mismatched method never send a POST',async()=>{
  const items=[
    draft('CUSTOMER_RECEIPT',{sources:[...draft().sources,...draft().sources]}),
    draft('CUSTOMER_RECEIPT',{discount:'1.00'}),
    draft('CUSTOMER_RECEIPT',{invoiceId:dayId}),
    draft('CUSTOMER_RECEIPT',{sources:[{
      method:'Bank',account:account(),amount:'23.50',
    }]}),
    draft('CUSTOMER_RECEIPT',{sources:[{
      method:'Cash',account:account({status:'INACTIVE'}),amount:'23.50',
    }]}),
  ];
  for(const item of items)await denied(item);
});
test('legacy BANK/MFS-only coordinator keeps rejecting CASH before even reading source',async()=>{
  mock();
  await assert.rejects(recordConnectedBankCounterSettlement(store(),draft()),ApiError);
  assert.equal(hits.length,0);
});
test('stale tenant/session during signed Cash Day GET never posts money',async()=>{
  const st=store();
  mock('CUSTOMER_RECEIPT',{onCall:async({path})=>{
    if(path==='/api/v1/money/day')st.change(snapshot({
      tenantId:'01ARZ3NDEKTSV4RRFFQ69G5FAJ',epoch:8,
    }));
  }});
  await assert.rejects(recordConnectedCounterSettlement(st,draft()),ApiError);
  assert.equal(hits.filter(h=>h.method==='POST').length,0);
  assert.equal(st.subscribers(),0);
});
test('no Cash Day view permission or signed session never reads data',async()=>{
  for(const s of [
    store(snapshot({permissions:grants.filter(x=>x!=='cash.daily.view')})),
    store({status:'signed-out',epoch:8}),
  ]) {
    mock();
    await assert.rejects(recordConnectedCounterSettlement(s,draft()),ApiError);
    assert.equal(hits.filter(h=>h.method==='POST').length,0);
  }
});
