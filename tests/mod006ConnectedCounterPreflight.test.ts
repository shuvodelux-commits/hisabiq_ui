import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ApiError } from '../src/integration/errors.ts';
import { resolveConnectedCounterPreflight } from '../src/integration/connected-counter-preflight.ts';

const tenant = '01ARZ3NDEKTSV4RRFFQ69G5FAA';
const user = '01ARZ3NDEKTSV4RRFFQ69G5FAB';
const partyId = '01ARZ3NDEKTSV4RRFFQ69G5FAC';
const accountId = '01ARZ3NDEKTSV4RRFFQ69G5FAD';
const otherId = '01ARZ3NDEKTSV4RRFFQ69G5FAE';
const basePermissions = [
  'party.customer.view','party.supplier.view','sale.payment.record',
  'purchase.payment.record','cash.account.view','bank.account.view',
];
const snapshot = (extra = {}) => ({
  status:'authenticated',tenantId:tenant,userId:user,epoch:11,
  accessToken:'signed-access-token',timezone:'Asia/Dhaka',
  username:'cashier',displayName:'Cashier',roleName:'Cashier',businessName:'Hardware',
  persistence:'memory',permissions:[...basePermissions],features:[], ...extra,
});
const account = (extra = {}) => ({
  id:accountId,name:'Trading bank',type:'BANK',holderName:null,reference:null,
  isDrawer:false,status:'ACTIVE',balanceMinor:25_000,
  openingAmountMinor:null,openingDate:null,version:1,...extra,
});
const accounts = (a = account()) => ({
  accounts:[a],totalCashMinor:0,totalBankMinor:a.balanceMinor,
  totalMfsMinor:0,totalLoanMinor:0,
});
const party = (role = 'CUSTOMER',extra = {}) => ({
  id:partyId,name:'Trading party',roles:[role],readRole:role,
  phone:null,customerGroupId:null,customerGroupName:null,
  creditLimitMinor:null,status:'ACTIVE',isSystemReserved:false,version:1,
  balance:{netMinor:0,direction:'SETTLED',outstandingMinor:0,advanceMinor:0},
  profile:{state:'WITHHELD'},globalHistory:{state:'WITHHELD'},...extra,
});
const originalFetch=globalThis.fetch;
const oldLocation=Object.getOwnPropertyDescriptor(globalThis,'location');
Object.defineProperty(globalThis,'location',{configurable:true,value:{origin:'https://hisabiq.example.test'}});
after(()=>{
  globalThis.fetch=originalFetch;
  if(oldLocation) Object.defineProperty(globalThis,'location',oldLocation);
  else delete globalThis.location;
});
function makeStore(initial=snapshot()) {
  let current=initial;
  const listeners=new Set();
  let revalidate=async()=>undefined;
  return {
    getSnapshot:()=>current,
    subscribe:(fn)=>{listeners.add(fn);return ()=>listeners.delete(fn);},
    revalidateAccess:()=>revalidate(),
    change:(next)=>{current=next;for(const fn of listeners)fn();},
    setRevalidate:(fn)=>{revalidate=fn;},
    listenerCount:()=>listeners.size,
  };
}
let calls=[];
function reply(body,status=200) {
  return new Response(JSON.stringify(body),{
    status,headers:{'content-type':'application/json'},
  });
}
function mockNetwork({role='CUSTOMER',accountValue=account(),partyValue=party(role),status=200}={}) {
  calls=[];
  globalThis.fetch=async(url,options)=>{
    const path=new URL(url).pathname;
    calls.push({url:String(url),options});
    assert.equal(options.method,'GET');
    assert.equal(options.headers.get('Authorization'),'Bearer signed-access-token');
    if(path==='/api/v1/money/accounts')return reply(accounts(accountValue),status);
    if(path==='/api/v2/parties/'+partyId) {
      assert.equal(new URL(url).search,'?role='+role);
      return reply({data:partyValue},status);
    }
    throw Error('unexpected route '+path);
  };
}
async function denied(store,kind='CUSTOMER_RECEIPT',p=partyId,a=accountId) {
  await assert.rejects(resolveConnectedCounterPreflight(store,kind,p,a), e=>
    e instanceof ApiError && (e.kind==='protocol'||e.kind==='http'||e.kind==='network'));
}
test('customer receipt reads only signed Party and money-account GET, returns scoped bank context',async()=>{
  mockNetwork();
  const store=makeStore();
  const result=await resolveConnectedCounterPreflight(store,'CUSTOMER_RECEIPT',partyId,accountId);
  assert.equal(result.account.id,accountId);
  assert.equal(result.party.readRole,'CUSTOMER');
  assert.deepEqual(result.scope,{tenantId:tenant,userId:user,epoch:11});
  assert.equal(result.requiresCashSessionVerification,false);
  assert.equal(calls.length,2);
  assert.equal(store.listenerCount(),0);
  assert.ok(calls.every(c=>c.options.method==='GET'&&c.options.credentials==='omit'));
});
test('supplier payment uses SUPPLIER role; CASH only flags downstream session verification',async()=>{
  mockNetwork({role:'SUPPLIER',accountValue:account({type:'CASH',isDrawer:true}),partyValue:party('SUPPLIER')});
  const result=await resolveConnectedCounterPreflight(makeStore(),'SUPPLIER_PAYMENT',partyId,accountId);
  assert.equal(result.party.readRole,'SUPPLIER');
  assert.equal(result.requiresCashSessionVerification,true);
  assert.equal(calls.length,2);
});
test('MFS is a BANK-view account without a CASH session requirement',async()=>{
  mockNetwork({accountValue:account({type:'MFS'})});
  const result=await resolveConnectedCounterPreflight(makeStore(),'CUSTOMER_RECEIPT',partyId,accountId);
  assert.equal(result.account.type,'MFS');
  assert.equal(result.requiresCashSessionVerification,false);
});
test('preview, locked, signed-out and authenticating sessions never read financial endpoints',async()=>{
  for(const state of [{status:'preview',epoch:1},{status:'locked',epoch:2,reason:'inactivity'},
    {status:'signed-out',epoch:3},{status:'authenticating',epoch:4}]) {
    calls=[]; globalThis.fetch=async()=>{calls.push('unexpected');throw Error('unexpected');};
    await denied(makeStore(state));
    assert.equal(calls.length,0);
  }
});
test('read and payment permissions are exact for each action',async()=>{
  const kinds=[
    ['CUSTOMER_RECEIPT','party.customer.view'],
    ['CUSTOMER_RECEIPT','sale.payment.record'],
    ['SUPPLIER_PAYMENT','party.supplier.view'],
    ['SUPPLIER_PAYMENT','purchase.payment.record'],
  ];
  for(const [kind,missing] of kinds) {
    calls=[];globalThis.fetch=async()=>{calls.push('unexpected');throw Error('no call');};
    await denied(makeStore(snapshot({permissions:basePermissions.filter(x=>x!==missing)})),kind);
    assert.equal(calls.length,0);
  }
  mockNetwork();
  await denied(makeStore(snapshot({permissions:basePermissions.filter(x=>x!=='bank.account.view')})));
});
test('invalid account/Party identities, unsupported action and malformed account fail closed',async()=>{
  mockNetwork();
  await denied(makeStore(),'CUSTOMER_RECEIPT','preview-party',accountId);
  await denied(makeStore(),'CUSTOMER_RECEIPT',partyId,'preview-account');
  await denied(makeStore(),'LOAN_RECEIVED',partyId,accountId);
  mockNetwork({accountValue:account({status:'INACTIVE'})});
  await denied(makeStore());
  mockNetwork({accountValue:account({type:'LOAN'})});
  await denied(makeStore());
  mockNetwork({accountValue:account({id:otherId})});
  await denied(makeStore());
});
test('wrong Party role, system-reserved and inactive Party are rejected',async()=>{
  for(const patch of [
    {roles:['SUPPLIER'],readRole:'SUPPLIER'},
    {isSystemReserved:true},
    {status:'INACTIVE'},
  ]) {
    mockNetwork({partyValue:party('CUSTOMER',patch)});
    await denied(makeStore());
  }
});
test('revalidateAccess can revoke session before either resource GET',async()=>{
  const store=makeStore();
  store.setRevalidate(async()=>{store.change({status:'signed-out',epoch:12});});
  calls=[];globalThis.fetch=async()=>{calls.push('unexpected');throw Error('no');};
  await denied(store);
  assert.equal(calls.length,0);
});
test('tenant/epoch or permission changes while GET is pending invalidate both responses',async()=>{
  for(const changed of [
    snapshot({tenantId:otherId,epoch:12}),
    snapshot({epoch:12}),
    snapshot({permissions:basePermissions.filter(p=>p!=='sale.payment.record'),epoch:12}),
    {status:'locked',epoch:12,reason:'inactivity'},
  ]) {
    const store=makeStore();
    let release;
    const waiting=new Promise(resolve=>{release=resolve;});
    calls=[];
    globalThis.fetch=async(url,options)=>{
      calls.push(options);
      await waiting;
      if(new URL(url).pathname==='/api/v1/money/accounts')return reply(accounts());
      return reply({data:party('CUSTOMER')});
    };
    const pending=resolveConnectedCounterPreflight(store,'CUSTOMER_RECEIPT',partyId,accountId);
    // Allow /me and the GET pair to begin, then invalidate the session.
    for(let i=0;i<10 && calls.length<2;i++)await new Promise(resolve=>setImmediate(resolve));
    assert.equal(calls.length,2);
    store.change(changed);
    release();
    await deniedPromise(pending);
    assert.equal(store.listenerCount(),0);
  }
});
async function deniedPromise(p) {
  await assert.rejects(p,e=>e instanceof ApiError && e.kind==='protocol');
}
test('network and HTTP 403 failures never return preview balances or post money',async()=>{
  mockNetwork({status:403});
  await denied(makeStore());
  assert.equal(calls.length,2);
  calls=[];
  globalThis.fetch=async()=>{calls.push('GET');throw new TypeError('offline');};
  await denied(makeStore());
  assert.equal(calls.length,2);
});
test('read-only preflight is not mounted in Counter, Finance or connected route gate',()=>{
  const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
  const source=read('../src/integration/connected-counter-preflight.ts');
  assert.doesNotMatch(source, /method:\\s*['\"]POST['\"]|setAccounts\\(|dispatchPartyPreview|localStorage|sessionStorage/);
  for(const path of ['../src/components/finance/CounterWorkspace.tsx',
    '../src/pages/Finance.tsx','../src/integration/ConnectedWorkspaceGate.tsx']) {
    assert.doesNotMatch(read(path),/connected-counter-preflight/);
  }
  assert.match(read('../src/integration/ConnectedWorkspaceGate.tsx'),/workspace=pending/);
});
