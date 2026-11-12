import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { setTenantUserDisabled, type ServerUser } from '../src/integration/settings-team.ts';

const origin = 'https://hisabiq-user-disable.test';
const a: ServerUser = {
  id:'01J0F5JK4BXH01EFGN6DJPQ5XB', username:'staff-a', displayName:'Staff A',
  email:null, phone:'01711001111', roleId:'01J0F5JK4BXH01EFGN6DJPQ5XC',
  roleName:'Cashier', disabled:false, hasPassword:false,
};
const b: ServerUser = {...a, id:'01J0F5JK4BXH01EFGN6DJPQ5XD',
  roleId:'01J0F5JK4BXH01EFGN6DJPQ5XE', displayName:'Staff B', disabled:true};
function json(body:unknown,status=200) {
 return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
}
async function withFetch(fake:typeof fetch,action:()=>Promise<void>) {
 const f=globalThis.fetch, w=(globalThis as any).window, l=(globalThis as any).location;
 (globalThis as any).fetch=fake;
 (globalThis as any).window={location:{origin}};
 (globalThis as any).location={origin};
 try{await action();}finally{
  globalThis.fetch=f;
  if(w===undefined)delete (globalThis as any).window;else (globalThis as any).window=w;
  if(l===undefined)delete (globalThis as any).location;else (globalThis as any).location=l;
 }
}
test('disable POST sends exact validated server ID + caller password; no role or preview status mutation',async()=>{
 let calls=0;
 const password='  exact passphrase with spaces  ';
 await withFetch((async(url,init)=>{
  calls++;
  assert.equal(String(url),origin+'/api/v1/users/'+a.id+'/disabled');
  assert.equal(init?.method,'POST');
  assert.equal(init?.redirect,'error');
  assert.equal(init?.credentials,'omit');
  assert.equal(new Headers(init?.headers).get('Authorization'),'Bearer verified-A');
  assert.deepEqual(JSON.parse(String(init?.body)),{disabled:true,confirmPassword:password});
  assert.equal(String(url).includes('passphrase'),false);
  return json({data:{...a,disabled:true}});
 }) as typeof fetch,async()=>{
  const result=await setTenantUserDisabled('verified-A',a,true,password);
  assert.equal(result.data.disabled,true);
  assert.equal(result.data.roleId,a.roleId);
  assert.equal(a.disabled,false);
 });
 assert.equal(calls,1);
});
test('enabling a verified disabled account uses same step-up endpoint, no role changes',async()=>{
 await withFetch((async(url,init)=>{
  assert.equal(String(url),origin+'/api/v1/users/'+b.id+'/disabled');
  assert.equal(init?.method,'POST');
  assert.deepEqual(JSON.parse(String(init?.body)),{disabled:false,confirmPassword:'OwnerPassword123!'});
  return json({data:{...b,disabled:false}});
 }) as typeof fetch,async()=>{
  const updated=await setTenantUserDisabled('verified-B',b,false,'OwnerPassword123!');
  assert.equal(updated.data.id,b.id);
  assert.equal(updated.data.disabled,false);
  assert.equal(b.disabled,true);
 });
});
test('invalid password, unverified IDs, no-op status and invalid controls reject before network',async()=>{
 let calls=0;
 await withFetch((async()=>{calls++;return json({data:{...a,disabled:true}})}) as typeof fetch,async()=>{
  for(const pw of ['', 'x'.repeat(201),42,null,undefined]){
   await assert.rejects(setTenantUserDisabled('token',a,true,pw as string),
     (err:unknown)=>err instanceof ApiError && err.kind==='protocol');
  }
  for(const u of [{...a,id:'t1'},{...a,roleId:'Cashier'},{...a,password:'hidden'}]){
   await assert.rejects(setTenantUserDisabled('token',u,true,'secret'),
     (err:unknown)=>err instanceof ApiError && err.kind==='protocol');
  }
  await assert.rejects(setTenantUserDisabled('token',a,false,'secret'),
    (err:unknown)=>err instanceof ApiError && err.kind==='protocol');
  await assert.rejects(setTenantUserDisabled('token',a,'true' as unknown as boolean,'secret'),
    (err:unknown)=>err instanceof ApiError && err.kind==='protocol');
  for(const limit of [0,-1,2.5,120001]){
   await assert.rejects(setTenantUserDisabled('token',a,true,'secret',undefined,limit),
    (err:unknown)=>err instanceof ApiError && err.kind==='protocol');
  }
 });
 assert.equal(calls,0);
});
test('wrong returned principal/status, malformed envelope or credential field fails closed',async()=>{
 for(const response of [
  {data:{...a,id:b.id,disabled:true}},
  {data:{...a,disabled:false}},
  {data:{...a,disabled:true,passwordHash:'secret'}},
  {data:{...a,disabled:true,hasPassword:'yes'}},
  {data:null}, {data:{...a,disabled:true,roleId:'Sales'}},
 ]){
  await withFetch((async()=>json(response)) as typeof fetch,async()=>{
   await assert.rejects(setTenantUserDisabled('token',a,true,'secret'),
     (err:unknown)=>err instanceof ApiError && err.kind==='protocol');
  });
 }
});
test('HTTP 401/403/404/409/422/500 rejects without any duplicate account mutation',async()=>{
 for(const status of [401,403,404,409,422,500]){
  let calls=0;
  await withFetch((async()=>{calls++;return json({error:{code:'DENIED',message:'No',details:{},traceId:'test'}},status)}) as typeof fetch,async()=>{
   await assert.rejects(setTenantUserDisabled('token',a,true,'secret'),
     (err:unknown)=>err instanceof ApiError && err.kind==='http' && err.status===status);
  });
  assert.equal(calls,1);
 }
});
test('network interruption, cancellation and deadline are unknown outcomes; never replay',async()=>{
 for(const reason of ['offline','abort','timeout']){
  const ctl=new AbortController(); let calls=0;
  await withFetch((async(_url,init)=>{
   calls++;
   if(reason==='offline')throw new TypeError('Disconnected');
   return await new Promise<Response>((_resolve,reject)=>{
    init?.signal?.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true});
    if(reason==='abort')ctl.abort();
   });
  }) as typeof fetch,async()=>{
   await assert.rejects(setTenantUserDisabled('token',a,true,'secret',ctl.signal,5),
     (err:unknown)=>err instanceof ApiError && err.kind==='network');
  });
  assert.equal(calls,1);
 }
});
test('distinct verified tenant tokens and server IDs are never reused or cached',async()=>{
 const seen:Array<{token:string|null;id:string;disabled:boolean}>=[];
 await withFetch((async(url,init)=>{
  const user=String(url).includes(a.id)?a:b;
  const {disabled}=JSON.parse(String(init?.body));
  seen.push({token:new Headers(init?.headers).get('Authorization'),id:user.id,disabled});
  return json({data:{...user,disabled}});
 }) as typeof fetch,async()=>{
  await setTenantUserDisabled('tenant-A',a,true,'password-A');
  await setTenantUserDisabled('tenant-B',b,false,'password-B');
 });
 assert.deepEqual(seen,[
  {token:'Bearer tenant-A',id:a.id,disabled:true},
  {token:'Bearer tenant-B',id:b.id,disabled:false},
 ]);
});
