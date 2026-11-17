import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  COUNTER_PENDING_PREFIX, pendingCounterKey,
  readPendingCounterOperation, reservePendingCounterOperation,
  clearVerifiedCounterOperation,
  type PendingCounterStorage, type PendingCounterScope,
} from '../src/integration/connected-counter-pending.ts';

const tenant='01'+'A'.repeat(24), user='01'+'B'.repeat(24);
const otherTenant='01'+'C'.repeat(24), otherUser='01'+'D'.repeat(24);
const op='01'+'E'.repeat(24), another='01'+'F'.repeat(24);
const scope:PendingCounterScope={tenantId:tenant,userId:user};

class Store implements PendingCounterStorage {
  readonly values = new Map<string,string>();
  fail: 'get' | 'set' | 'remove' | null=null;
  getItem(key:string){if(this.fail==='get')throw Error('denied');return this.values.get(key)??null;}
  setItem(key:string,value:string){if(this.fail==='set')throw Error('quota');this.values.set(key,value);}
  removeItem(key:string){if(this.fail==='remove')throw Error('denied');this.values.delete(key);}
}

test('empty store is clear, but null/denied storage fails closed',()=>{
  const store=new Store();
  assert.deepEqual(readPendingCounterOperation(store,scope),{state:'clear'});
  assert.equal(readPendingCounterOperation(null,scope).state,'blocked');
  store.fail='get';
  assert.equal(readPendingCounterOperation(store,scope).state,'blocked');
  assert.throws(()=>reservePendingCounterOperation(store,scope,op,'CUSTOMER_RECEIPT',12345));
});
test('reserve synchronously writes only version/scope/operation/kind/time, never tokens or customer/payment data',()=>{
  const store=new Store();
  const record=reservePendingCounterOperation(store,scope,op,'CUSTOMER_RECEIPT',12345);
  assert.equal(record.operationId,op);
  const key=pendingCounterKey(scope);
  assert.ok(key.startsWith(COUNTER_PENDING_PREFIX));
  const raw=store.getItem(key)!;
  assert.deepEqual(Object.keys(JSON.parse(raw)).sort(),[
    'createdAt','kind','operationId','tenantId','userId','version',
  ]);
  for(const forbidden of ['accessToken','refreshToken','partyId','amount','phone','balance','password'])
    assert.doesNotMatch(raw,new RegExp(forbidden,'i'));
  assert.equal(readPendingCounterOperation(store,scope).state,'pending');
});
test('same verified tenant/user sees unresolved marker after simulated reload without expiration',()=>{
  const persistent=new Store();
  reservePendingCounterOperation(persistent,scope,op,'SUPPLIER_PAYMENT',12345);
  const reloadScope={...scope};
  const state=readPendingCounterOperation(persistent,reloadScope);
  assert.equal(state.state,'pending');
  if(state.state==='pending') {
    assert.equal(state.record.operationId,op);
    assert.equal(state.record.kind,'SUPPLIER_PAYMENT');
    assert.equal(state.record.createdAt,12345);
  }
  assert.throws(()=>reservePendingCounterOperation(persistent,reloadScope,another,'SUPPLIER_PAYMENT',999999));
});
test('different tenant or user never inherits or clears the old marker',()=>{
  const persistent=new Store();
  reservePendingCounterOperation(persistent,scope,op,'CUSTOMER_RECEIPT',100);
  assert.equal(readPendingCounterOperation(persistent,{tenantId:otherTenant,userId:user}).state,'clear');
  assert.equal(readPendingCounterOperation(persistent,{tenantId:tenant,userId:otherUser}).state,'clear');
  assert.throws(()=>clearVerifiedCounterOperation(persistent,{tenantId:otherTenant,userId:user},op));
  assert.equal(readPendingCounterOperation(persistent,scope).state,'pending');
});
test('different operation cannot overwrite or clear the original pending marker',()=>{
  const store=new Store();
  reservePendingCounterOperation(store,scope,op,'CUSTOMER_RECEIPT',100);
  assert.throws(()=>reservePendingCounterOperation(store,scope,another,'CUSTOMER_RECEIPT',101));
  assert.throws(()=>clearVerifiedCounterOperation(store,scope,another));
  assert.equal(readPendingCounterOperation(store,scope).state,'pending');
});
test('only exact source-confirmed operation may clear, with verified storage readback',()=>{
  const store=new Store();
  reservePendingCounterOperation(store,scope,op,'CUSTOMER_RECEIPT',100);
  assert.equal(clearVerifiedCounterOperation(store,scope,op),true);
  assert.equal(readPendingCounterOperation(store,scope).state,'clear');
  assert.throws(()=>clearVerifiedCounterOperation(store,scope,op));
});
test('inaccessible or full storage prohibits payment reservation',()=>{
  const store=new Store();store.fail='set';
  assert.throws(()=>reservePendingCounterOperation(store,scope,op,'CUSTOMER_RECEIPT',100));
  assert.equal(store.values.size,0);
  store.fail=null;reservePendingCounterOperation(store,scope,op,'CUSTOMER_RECEIPT',100);
  store.fail='remove';
  assert.throws(()=>clearVerifiedCounterOperation(store,scope,op));
  store.fail=null;
  assert.equal(readPendingCounterOperation(store,scope).state,'pending');
});
test('invalid, corrupt, mismatched or unexpected fields do not silently unblock',()=>{
  const store=new Store(),key=pendingCounterKey(scope);
  const invalid=['','{}','not json',
    JSON.stringify({version:99,tenantId:tenant,userId:user,operationId:op,kind:'CUSTOMER_RECEIPT',createdAt:100}),
    JSON.stringify({version:1,tenantId:otherTenant,userId:user,operationId:op,kind:'CUSTOMER_RECEIPT',createdAt:100}),
    JSON.stringify({version:1,tenantId:tenant,userId:user,operationId:'not-ulid',kind:'CUSTOMER_RECEIPT',createdAt:100}),
    JSON.stringify({version:1,tenantId:tenant,userId:user,operationId:op,kind:'CASH',createdAt:100}),
    JSON.stringify({version:1,tenantId:tenant,userId:user,operationId:op,kind:'CUSTOMER_RECEIPT',createdAt:100,secret:'x'}),
  ];
  for(const raw of invalid){
    store.setItem(key,raw);
    assert.equal(readPendingCounterOperation(store,scope).state,'blocked',raw);
    assert.throws(()=>reservePendingCounterOperation(store,scope,another,'CUSTOMER_RECEIPT',101));
  }
});
test('invalid identities, operation IDs and clocks cannot create a storage key/record',()=>{
  const store=new Store();
  assert.throws(()=>pendingCounterKey({tenantId:'not-tenant',userId:user}));
  assert.equal(readPendingCounterOperation(store,{tenantId:'not-tenant',userId:user}).state,'blocked');
  assert.throws(()=>reservePendingCounterOperation(store,scope,'bad','CUSTOMER_RECEIPT',100));
  assert.throws(()=>reservePendingCounterOperation(store,scope,op,'CUSTOMER_RECEIPT',-1));
  assert.throws(()=>reservePendingCounterOperation(store,scope,op,'CASH' as never,100));
  assert.equal(store.values.size,0);
});

test('connected H2 form reserves before source POST, clears only on source proof and never auto retries',()=>{
  const file=readFileSync(new URL('../src/components/finance/ConnectedCounterSinglePayment.tsx',import.meta.url),'utf8');
  const reserve=file.indexOf('reservePendingCounterOperation(');
  const post=file.indexOf('await recordConnectedCounterSettlement(');
  const confirmed=file.indexOf('clearVerifiedCounterOperation(');
  assert.ok(reserve>=0 && reserve<post,'write-ahead reservation precedes signed payment');
  assert.ok(confirmed>post,'source proof precedes clearing marker');
  assert.match(file,/reserved = true;/);
  assert.match(file,/onPendingChange\(\)/);
  assert.match(file,/phase === 'unknown'/);
  assert.doesNotMatch(file,/localStorage\.clear\(|sessionStorage|window\.location\.reload\(/);
});
test('connected H1 reads a signed-scope pending lock and does not expose a manual clear action',()=>{
  const file=readFileSync(new URL('../src/components/finance/ConnectedCounterReadWorkspace.tsx',import.meta.url),'utf8');
  assert.match(file,/readPendingCounterOperation\(/);
  assert.match(file,/pendingStatus\.state !== 'clear'/);
  assert.match(file,/data-h3-original-operation/);
  assert.match(file,/window\.addEventListener\('storage'/);
  assert.match(file,/onPendingChange=/);
  assert.doesNotMatch(file,/clearVerifiedCounterOperation\(/);
  const gate=readFileSync(new URL('../src/integration/ConnectedWorkspaceGate.tsx',import.meta.url),'utf8');
  assert.match(gate,/workspace=pending/);
});
