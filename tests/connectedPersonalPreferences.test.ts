import test from 'node:test';
import assert from 'node:assert/strict';
import { personalDefaults, personalKey } from '../src/settings/model.ts';
import type { SessionSnapshot } from '../src/integration/session.ts';
import {
  connectedPersonalScope, personalStorageKey,
  readConnectedPersonal, writeConnectedPersonal,
} from '../src/settings/connectedPersonalPreferences.ts';

const tenantA = '01J0F5JK4BXH01EFGN6DJPQ5XB';
const tenantB = '01J0F5JK4BXH01EFGN6DJPQ5XC';
const userA = '01J0F5JK4BXH01EFGN6DJPQ5XD';
const userB = '01J0F5JK4BXH01EFGN6DJPQ5XE';
function verified(tenantId = tenantA, userId = userA, epoch = 1): SessionSnapshot {
  return { status: 'authenticated', tenantId, userId, epoch, accessToken: 'test-only-access',
    username: 'test', displayName: 'Test', roleName: 'Owner', businessName: 'Test business',
    timezone: 'Asia/Dhaka', permissions: ['settings.setting.view'],
    features: [], persistence: 'memory' };
}
class FakeStorage {
  readonly data = new Map<string,string>();
  reads: string[] = [];
  writes: string[] = [];
  getItem(k: string) { this.reads.push(k); return this.data.get(k) ?? null; }
  setItem(k: string, v: string) { this.writes.push(k); this.data.set(k,v); }
}
test('scope is authenticated and server-identity-only, never preview, locked or malformed', () => {
  const a = connectedPersonalScope(verified());
  assert.deepEqual(a, {tenantId:tenantA,userId:userA,epoch:1});
  assert.equal(connectedPersonalScope({status:'preview',epoch:0}),null);
  assert.equal(connectedPersonalScope({status:'signed-out',epoch:2}),null);
  assert.equal(connectedPersonalScope({status:'authenticating',epoch:2}),null);
  assert.equal(connectedPersonalScope({status:'locked',epoch:3,reason:'offline',persistence:'memory'}),null);
  assert.equal(connectedPersonalScope(verified('t1',userA)),null);
  assert.equal(connectedPersonalScope(verified(tenantA,'mahmud')),null);
});
test('keys are unique across actual tenant and user, but stable across a token epoch', () => {
  const a = connectedPersonalScope(verified())!;
  const key = personalStorageKey(a);
  assert.equal(key,'hisabiq-erp-personal-v2:'+tenantA+':'+userA);
  assert.notEqual(key,personalStorageKey(connectedPersonalScope(verified(tenantB,userA))!));
  assert.notEqual(key,personalStorageKey(connectedPersonalScope(verified(tenantA,userB))!));
  assert.equal(key,personalStorageKey(connectedPersonalScope(verified(tenantA,userA,18))!));
  assert.notEqual(key,personalKey);
  assert.throws(()=>personalStorageKey({tenantId:'t1',userId:userA,epoch:1}));
});
test('connected read never falls back to global preview personal or terminology keys', () => {
  const storage = new FakeStorage();
  storage.data.set(personalKey, JSON.stringify({...personalDefaults,language:'Bangla'}));
  storage.data.set('hisabiq-terminology-mode','accounting');
  storage.data.set('hisabiq-entry-date-view','created');
  assert.deepEqual(readConnectedPersonal(storage,connectedPersonalScope(verified())!),personalDefaults);
  assert.deepEqual(storage.reads,[personalStorageKey(connectedPersonalScope(verified())!)]);
  assert.deepEqual(storage.writes,[]);
});
test('two tenants and two users preserve distinct validated local preferences', () => {
  const storage = new FakeStorage();
  const a = connectedPersonalScope(verified())!;
  const otherTenant = connectedPersonalScope(verified(tenantB,userA))!;
  const otherUser = connectedPersonalScope(verified(tenantA,userB))!;
  const first = {...personalDefaults,language:'Bangla' as const,terminology:'accounting' as const};
  const second = {...personalDefaults,dateView:'created' as const};
  assert.equal(writeConnectedPersonal(storage,a,first),true);
  assert.equal(writeConnectedPersonal(storage,otherTenant,second),true);
  assert.equal(storage.writes.length,2);
  assert.deepEqual(readConnectedPersonal(storage,a),first);
  assert.deepEqual(readConnectedPersonal(storage,otherTenant),second);
  assert.deepEqual(readConnectedPersonal(storage,otherUser),personalDefaults);
  assert.equal(storage.data.has(personalKey),false);
  assert.equal(storage.data.has('hisabiq-terminology-mode'),false);
});
test('invalid JSON or invalid personal payload yields defaults, never another identity', () => {
  const storage = new FakeStorage();
  const scope = connectedPersonalScope(verified())!;
  const key = personalStorageKey(scope);
  for(const broken of ['{', 'null', '"hi"', JSON.stringify({...personalDefaults,mode:'SUPER'})]) {
    storage.data.set(key,broken);
    assert.deepEqual(readConnectedPersonal(storage,scope),personalDefaults);
  }
  assert.equal(writeConnectedPersonal(storage,scope,{...personalDefaults,mode:'SUPER'} as any),false);
  assert.equal(storage.data.get(key),JSON.stringify({...personalDefaults,mode:'SUPER'}));
});
test('blocked storage fails closed without leaking legacy preferences or throwing', () => {
  const scope = connectedPersonalScope(verified())!;
  assert.deepEqual(readConnectedPersonal(null,scope),personalDefaults);
  assert.equal(writeConnectedPersonal(null,scope,personalDefaults),false);
  const denied = {getItem:(_k:string):string|null=>{throw Error('denied')},
    setItem:(_k:string,_v:string)=>{throw Error('denied')}};
  assert.deepEqual(readConnectedPersonal(denied,scope),personalDefaults);
  assert.equal(writeConnectedPersonal(denied,scope,personalDefaults),false);
});
