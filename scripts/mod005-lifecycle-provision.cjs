/**
 * Provision TWO brand-new QA tenants on a NEW EMPTY, isolated local Nest DB.
 * Contains no source-owned credentials; outputs a 0600 local private file.
 * This makes cash account openings, but never fabricates journal rows.
 */
const { randomBytes } = require('node:crypto');
const { openSync, closeSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.MOD005_LIFECYCLE_API_URL;
const output = process.env.MOD005_PRIVATE_CREDENTIAL_FILE;
if (process.env.MOD005_LIFECYCLE_CONFIRM !== 'hisabiq_mod005_lifecycle_425' ||
    process.env.MOD005_FRESH_DATABASE_VERIFIED !== 'hisabiq_mod005_lifecycle_425' ||
    base !== 'http://127.0.0.1:3071' || !output ||
    !resolve(output).startsWith('/home/shoaib/Projects/.hisabiq-mod005-lifecycle-425/')) {
  throw new Error('Refusing account creation without fresh, approved local disposable DB');
}
const alphabet='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function operationId() {
  let ms = Date.now(), first='';
  for(let i=0;i<10;i++){first=alphabet[ms%32]+first;ms=Math.floor(ms/32);}
  return first+Array.from(randomBytes(16),b=>alphabet[b&31]).join('');
}
async function api(path, body, token) {
  const response=await fetch(base+path,{
    method: body === undefined ? 'GET' : 'POST',
    redirect:'error',headers:{
      Accept:'application/json',
      ...(body===undefined?{}:{'Content-Type':'application/json'}),
      ...(token?{Authorization:'Bearer '+token}:{})
    },...(body===undefined?{}:{body:JSON.stringify(body)})
  });
  const json=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(path+' HTTP '+response.status+' code='+(json?.error?.code??'unknown'));
  return {status:response.status,data:json?.data??json};
}
async function createTenant(letter, openingMinor) {
  const identifier='mod005-lifecycle-'+letter+'-'+randomBytes(5).toString('hex')+'@example.test';
  const password='TestOnly_'+randomBytes(12).toString('hex')+'Aa9!';
  const otp=await api('/api/v1/auth/registration/otp',{identifier});
  assert.equal(otp.status,200);
  assert.match(otp.data.devCode,/^\d{6}$/);
  const registered=await api('/api/v1/auth/registration',{
    identifier,otpCode:otp.data.devCode,
    businessName:'MOD-005 isolated cash QA '+letter,
    username:'cashqa'+letter.toLowerCase(),password,pin:'482193'
  });
  assert.equal(registered.status,201);
  const tenantId=registered.data.tenant.id;
  const token=registered.data.accessToken;
  assert.match(tenantId,/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  const me=await api('/api/v1/me',undefined,token);
  assert.equal(me.data.tenantId,tenantId);
  const drawer=await api('/api/v1/money/accounts',{
    name:'Disposable QA Cash Drawer',type:'CASH',
    holderName:null,reference:null,isDrawer:true,
    openingAmountMinor:openingMinor,openingDate:'2026-11-01',
    operationId:operationId()
  },token);
  assert.equal(drawer.status,201);
  assert.match(drawer.data.id,/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  const day=await api('/api/v1/money/day',undefined,token);
  assert.equal(day.data.enabled,true);
  assert.equal(day.data.todaySession,null);
  assert.equal(day.data.drawerBalanceMinor,openingMinor);
  console.log('SEED_'+letter+'_PASS: genuine auth, separate tenant, drawer, cash-day read, opening_minor='+openingMinor);
  return {identifier,password,tenantId,drawerId:drawer.data.id,openingMinor};
}
async function main() {
  const health=await fetch(base+'/health');
  assert.equal(health.status,200);
  // Reserve the output path before posting any registration operations.
  const fd=openSync(output,'wx',0o600); closeSync(fd);
  try {
    const first=await createTenant('A',100000);
    const second=await createTenant('B',50000);
    assert.notEqual(first.tenantId,second.tenantId);
    writeFileSync(output,JSON.stringify({database:'hisabiq_mod005_lifecycle_425',
      tenants:{A:first,B:second}},null,2)+'\n',{mode:0o600});
    console.log('TWO_TENANT_DISPOSABLE_CASH_FIXTURES_PASS; credentials stored privately');
  } catch(error) {
    writeFileSync(output,JSON.stringify({error:'Partial disposable seed; destroy this isolated DB and retry fresh'})+'\n');
    throw error;
  }
}
main().catch(error=>{console.error('SEED_RED:',error.message);process.exitCode=1});
