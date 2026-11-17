import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { resolveConnectedCashSessionEligibility } from '../src/integration/connected-counter-cash-day.ts';

const tenant='01ARZ3NDEKTSV4RRFFQ69G5FAA';
const user='01ARZ3NDEKTSV4RRFFQ69G5FAB';
const drawer='01ARZ3NDEKTSV4RRFFQ69G5FAC';
const sessionId='01ARZ3NDEKTSV4RRFFQ69G5FAD';
const token='real-session-store-access-token';
const date='2026-11-16';
const grants=['cash.account.view','cash.daily.view'];
const account=(overrides={})=>({
  id:drawer,name:'Physical till',type:'CASH',isDrawer:true,status:'ACTIVE',
  holderName:null,reference:null,balanceMinor:10000,openingAmountMinor:null,
  openingDate:null,version:1,...overrides,
});
const day=(overrides={})=>({
  enabled:true,drawerAccountId:drawer,businessDate:date,
  todaySession:{
    id:sessionId,number:'DAY-001',accountId:drawer,accountName:'Physical till',
    businessDate:date,status:'OPEN',openingAmountMinor:10000,
    previousClosingMinor:null,cashInMinor:0,cashOutMinor:0,
    expectedClosingMinor:10000,openedAt:'2026-11-16T07:00:00Z',
    openedByName:'Tester',closes:[],version:1,
  },
  blockedByDate:null,blockedSession:null,previousClosingMinor:null,
  drawerBalanceMinor:10000,canReopenToday:false,...overrides,
});
const snapshot=(overrides={})=>({
  status:'authenticated',tenantId:tenant,userId:user,epoch:2,accessToken:token,
  permissions:grants,features:[],persistence:'memory',timezone:'Asia/Dhaka',
  username:'tester',displayName:'Tester',roleName:'Cashier',businessName:'Test shop',
  ...overrides,
});
function sessionStore(initial=snapshot()) {
  let current=initial;
  const listeners=new Set();
  let revalidation=0;
  return {
    getSnapshot:()=>current,
    subscribe:listener=>{listeners.add(listener);return()=>listeners.delete(listener);},
    revalidateAccess:async()=>{revalidation++;},
    change:next=>{current=next;for(const listener of listeners)listener();},
    pending:()=>listeners.size,
    revalidations:()=>revalidation,
  };
}
const originalFetch=globalThis.fetch;
const originalLocation=Object.getOwnPropertyDescriptor(globalThis,'location');
Object.defineProperty(globalThis,'location',{
  configurable:true,value:{origin:'https://hisabiq.invalid'},
});
after(()=>{
  globalThis.fetch=originalFetch;
  if(originalLocation)Object.defineProperty(globalThis,'location',originalLocation);
  else delete globalThis.location;
});
function reply(body,status=200) {
  return new Response(JSON.stringify(body),{
    status,headers:{'content-type':'application/json'},
  });
}
let requests=[];
function serve(config={}) {
  requests=[];
  globalThis.fetch=async(url,options)=>{
    const path=new URL(url).pathname;
    requests.push({path,method:options.method});
    assert.equal(options.method,'GET','read-only preflight must never POST money');
    assert.equal(options.headers.get('Authorization'),'Bearer '+token);
    if(config.beforeReply)await config.beforeReply(path);
    if(config.failNetwork)throw Error('disposable network unavailable');
    if(path==='/api/v1/money/accounts')return reply({
      accounts:config.accounts??[account()],
      totalCashMinor:10000,totalBankMinor:0,totalMfsMinor:0,totalLoanMinor:0,
    });
    if(path==='/api/v1/money/day')return reply(config.day??day());
    throw Error('unexpected endpoint '+path);
  };
}
async function denied(store,id=drawer,expected='protocol',businessDate) {
  await assert.rejects(resolveConnectedCashSessionEligibility(store,id,businessDate),
    err=>err instanceof ApiError&&err.kind===expected);
}
test('ON + signed OPEN same date permits only a currently verified drawer; zero POST',async()=>{
  const st=sessionStore();serve();
  const state=await resolveConnectedCashSessionEligibility(st,drawer,date);
  assert.equal(state.mode,'OPEN');
  assert.equal(state.sessionId,sessionId);
  assert.equal(state.account.id,drawer);
  assert.deepEqual(state.scope,{tenantId:tenant,userId:user,epoch:2});
  assert.equal(state.businessDate,date);
  assert.equal(st.revalidations(),1);
  assert.equal(st.pending(),0);
  assert.deepEqual(requests.map(x=>x.path).sort(),[
    '/api/v1/money/accounts','/api/v1/money/day',
  ]);
});
test('OFF does not invent a session or require Start Day',async()=>{
  serve({day:day({enabled:false,todaySession:null})});
  const state=await resolveConnectedCashSessionEligibility(sessionStore(),drawer);
  assert.equal(state.mode,'OFF');
  assert.equal(state.sessionId,null);
});
test('non-drawer CASH remains session-independent without pretending to open today',async()=>{
  serve({accounts:[account({isDrawer:false})],day:day({
    enabled:true,drawerAccountId:null,todaySession:null,
  })});
  const state=await resolveConnectedCashSessionEligibility(sessionStore(),drawer);
  assert.equal(state.mode,'NON_DRAWER');
  assert.equal(state.sessionId,null);
});
test('ON without same-date OPEN day, closed day or older blocker is refused before posting',async()=>{
  for(const item of [
    day({todaySession:null}),
    day({todaySession:{...day().todaySession,status:'CLOSED'}}),
    day({todaySession:{...day().todaySession,businessDate:'2026-11-15'}}),
    day({blockedByDate:'2026-11-15',blockedSession:{
      ...day().todaySession,businessDate:'2026-11-15',
    }}),
  ]){
    serve({day:item});
    await denied(sessionStore());
    assert.ok(requests.every(x=>x.method==='GET'));
  }
});
test('wrong or absent drawer identity never silently enables physical Cash',async()=>{
  for(const item of [day({drawerAccountId:null}),day({
    drawerAccountId:'01ARZ3NDEKTSV4RRFFQ69G5FAE',
  })]){
    serve({day:item});
    await denied(sessionStore());
  }
});
test('server date mismatch and unsupported supplied business date are denied',async()=>{
  serve();
  await denied(sessionStore(),drawer,'protocol','2026-11-15');
  serve();
  await denied(sessionStore(),drawer,'protocol','2026-02-30');
});
test('missing, inactive, LOAN or foreign tenant money source fails closed',async()=>{
  for(const accounts of [[],[account({status:'INACTIVE'})],[account({type:'LOAN'})],
    [account({id:'01ARZ3NDEKTSV4RRFFQ69G5FAE'})]]){
    serve({accounts});
    await denied(sessionStore());
  }
});
test('malformed, contradictory or unknown server day data is refused',async()=>{
  for(const invalid of [
    day({enabled:'off'}),
    day({businessDate:'2026-02-30'}),
    day({todaySession:{...day().todaySession,status:'REOPENING'}}),
    day({blockedByDate:'2026-11-15',blockedSession:null}),
    day({enabled:false,todaySession:day().todaySession}),
    {...day(),undocumented:true},
  ]){
    serve({day:invalid});
    await denied(sessionStore());
  }
});
test('signed-out, preview, locked, missing permission refuse before any request',async()=>{
  for(const invalid of [
    {status:'signed-out',epoch:4},{status:'preview',epoch:0},
    {status:'locked',epoch:4,reason:'inactivity'},
    snapshot({permissions:['cash.account.view']}),
    snapshot({permissions:['cash.daily.view']}),
  ]){
    requests=[];
    globalThis.fetch=async()=>{requests.push('unexpected');throw Error('unexpected GET');};
    await denied(sessionStore(invalid));
    assert.equal(requests.length,0);
  }
});
test('changed tenant/epoch during resource reads fails closed and releases listener',async()=>{
  const st=sessionStore();
  serve({beforeReply:async()=>{
    st.change(snapshot({tenantId:'01ARZ3NDEKTSV4RRFFQ69G5FAJ',epoch:3}));
  }});
  await denied(st);
  assert.equal(st.pending(),0);
});
test('network failure refuses without fallback or a financial POST',async()=>{
  serve({failNetwork:true});
  await assert.rejects(resolveConnectedCashSessionEligibility(sessionStore(),drawer),
    err=>err instanceof ApiError&&err.kind==='network');
  assert.ok(requests.every(x=>x.method==='GET'));
});
test('already aborted signal refuses before a new network GET',async()=>{
  const signal=new AbortController();signal.abort();
  serve();
  await assert.rejects(resolveConnectedCashSessionEligibility(sessionStore(),drawer,undefined,signal.signal),
    err=>err instanceof ApiError);
  assert.equal(requests.length,0);
});
