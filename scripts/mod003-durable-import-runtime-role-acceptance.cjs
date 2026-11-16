/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
/*
 * MOD-003 C003-02 #643 — real two-Nest durable CSV import identity QA.
 * Disposable PostgreSQL16, preexisting runtime role without DELETE/TRUNCATE on
 * import_operations, signed two-tenant HTTP, no backend/UI/production writes.
 * --guard-only rejects unsafe targets BEFORE connecting or posting any fixtures.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const { createRequire } = require('node:module');

const DATABASE = 'sher_mod003_p3_643_20261116';
const MARKER = 'MOD003_643_DISPOSABLE_PG16_ONLY_20261116';
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const PASSWORD = 'Synthetic643NotProduction!2026';
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const HEADER = 'Product Name,Base Unit,Purchase Price,Selling Price,Reorder Level,Brand,Category,Subcategory,Product Code,Barcode,Description';

function ulid() {
  return '0' + Array.from(crypto.randomBytes(25), x => ALPHABET[x % ALPHABET.length]).join('');
}
function apiOrigin(raw, port, label) {
  const u = new URL(raw);
  assert.equal(u.protocol, 'http:', label + ' needs isolated HTTP');
  assert.equal(u.hostname, '127.0.0.1', label + ' must be literal loopback');
  assert.equal(u.port, port, label + ' uses dedicated port');
  assert.equal(u.pathname, '/', label + ' cannot have path');
  assert.equal(u.search, '', label + ' cannot have search');
  assert.equal(u.hash, '', label + ' cannot have fragment');
  assert.equal(u.username, '', label + ' cannot embed credentials');
  return u.origin;
}
function environment() {
  assert.equal(process.env.MOD003_643_TEST_ONLY, MARKER,
    'Explicit disposable-only marker required');
  const a = apiOrigin(process.env.MOD003_643_API_A || '', '55762', 'Nest A');
  const b = apiOrigin(process.env.MOD003_643_API_B || '', '55763', 'Nest B');
  assert.notEqual(a,b);
  const url = new URL(process.env.MOD003_643_DB_URL || '');
  assert.equal(url.protocol, 'postgres:', 'PostgreSQL only');
  assert.equal(url.hostname, '127.0.0.1', 'Local PostgreSQL only');
  assert.equal(url.port, '55761', 'Dedicated PostgreSQL port only');
  assert.equal(url.pathname, '/' + DATABASE, 'Exact disposable database required');
  assert.equal(url.username, 'sher_app', 'Nonowner runtime principal required');
  const backend = process.env.MOD003_643_BACKEND_DIR || '';
  assert.ok(path.isAbsolute(backend), 'Absolute isolated backend checkout required');
  assert.equal(path.resolve(backend), backend, 'Canonical backend path required');
  assert.notEqual(path.resolve(backend), process.cwd(), 'Backend is not frontend');
  const aPid = Number(process.env.MOD003_643_PID_A);
  const bPid = Number(process.env.MOD003_643_PID_B);
  if (!process.argv.includes('--guard-only')) {
    assert.ok(Number.isSafeInteger(aPid) && aPid > 1, 'Real Nest A PID required');
    assert.ok(Number.isSafeInteger(bPid) && bPid > 1, 'Real Nest B PID required');
    assert.notEqual(aPid,bPid,'Two different Nest OS processes required');
  }
  return { a, b, db: url.toString(), backend, pids: [aPid,bPid] };
}
async function http(api, route, body, token, operationId, method='POST') {
  const res = await fetch(api + route, {
    method, redirect:'error', credentials:'omit', signal:AbortSignal.timeout(20000),
    headers: {
      Accept:'application/json',
      ...(body===undefined?{}:{'Content-Type':'application/json'}),
      ...(token===undefined?{}:{Authorization:'Bearer '+token}),
      ...(operationId===undefined?{}:{'Idempotency-Key':operationId}),
    },
    body:body===undefined?undefined:JSON.stringify(body),
  });
  const payload=res.status===204?{}:await res.json();
  return {status:res.status,data:payload.data,error:payload.error};
}
function posted(r,status,label) {
  assert.equal(r.status,status,label+' rejected: '+r.status+' '+String(r.error?.code));
  return r.data;
}
async function signedTenant(api,label) {
  const suffix=crypto.randomBytes(5).toString('hex');
  const identifier='m003643'+label+suffix+'@isolated.invalid';
  const otp=posted(await http(api,'/api/v1/auth/registration/otp',{identifier}),200,'OTP');
  assert.match(otp.devCode,/^\d{6}$/,'Actual development OTP required');
  const registered=posted(await http(api,'/api/v1/auth/registration',{
    identifier,otpCode:otp.devCode,username:'m003643'+label+suffix,
    businessName:'Synthetic import 643 '+label,password:PASSWORD,pin:'472906',
  }),201,'real tenant registration');
  const login=posted(await http(api,'/api/v1/auth/login',{identifier,password:PASSWORD}),200,'login');
  const me=posted(await http(api,'/api/v1/me',undefined,login.accessToken,undefined,'GET'),
    200,'signed /me');
  assert.equal(me.tenantId,registered.tenant.id);
  assert.match(me.tenantId,ULID);
  return {tenantId:me.tenantId,token:login.accessToken};
}
async function tenantRows(pool,tenant,sql,args=[]) {
  const client=await pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SELECT set_config('app.tenant_id',$1,true)",[tenant]);
    const rows=(await client.query(sql,args)).rows;
    await client.query('ROLLBACK');
    return rows;
  } catch(e) {
    await client.query('ROLLBACK').catch(()=>undefined);
    throw e;
  } finally { client.release(); }
}
async function pruneOnlyFastCache(pool,tenant,operationId) {
  const c=await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query("SELECT set_config('app.tenant_id',$1,true)",[tenant]);
    const removed=await c.query(
      'DELETE FROM idempotency_keys WHERE tenant_id=$1 AND operation_id=$2',
      [tenant,operationId]);
    assert.equal(removed.rowCount,1,'Exactly this synthetic fast-cache row');
    await c.query('COMMIT');
  } catch(e) {
    await c.query('ROLLBACK').catch(()=>undefined);
    throw e;
  } finally { c.release(); }
}
async function assertNoPermanentDelete(pool,tenant,operationId) {
  const c=await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query("SELECT set_config('app.tenant_id',$1,true)",[tenant]);
    await assert.rejects(
      c.query('DELETE FROM import_operations WHERE tenant_id=$1 AND operation_id=$2',
        [tenant,operationId]),
      error => error?.code==='42501',
      'Runtime must fail permission check for deleting import history');
  } finally {
    await c.query('ROLLBACK').catch(()=>undefined);
    c.release();
  }
}
async function roleGate(pool, config) {
  const db=(await pool.query("SELECT current_database() AS name,current_user AS principal,current_setting('server_version_num')::int AS version")).rows[0];
  assert.equal(db.name,DATABASE);
  assert.equal(db.principal,'sher_app');
  assert.ok(db.version>=160000 && db.version<170000,'PostgreSQL16 only');
  const row=(await pool.query("SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname=current_user")).rows[0];
  assert.deepEqual(row,{rolsuper:false,rolbypassrls:false,rolcreatedb:false,rolcreaterole:false});
  const owner=(await pool.query("SELECT pg_get_userbyid(datdba) AS name FROM pg_database WHERE datname=current_database()")).rows[0];
  assert.notEqual(owner.name,'sher_app');
  const rights=(await pool.query(
    "SELECT has_table_privilege(current_user,'public.import_operations','SELECT') AS can_select, "+
    "has_table_privilege(current_user,'public.import_operations','INSERT') AS can_insert, "+
    "has_table_privilege(current_user,'public.import_operations','UPDATE') AS can_update, "+
    "has_table_privilege(current_user,'public.import_operations','DELETE') AS can_delete, "+
    "has_table_privilege(current_user,'public.import_operations','TRUNCATE') AS can_truncate",
  )).rows[0];
  assert.deepEqual(rights,{can_select:true,can_insert:true,can_update:true,
    can_delete:false,can_truncate:false},'Permanent import grant must be exact');
  const unsafe=(await pool.query(
    "SELECT count(*)::int AS n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace "+
    "WHERE n.nspname='public' AND c.relkind='r' "+
    "AND has_table_privilege(current_user,c.oid,'TRUNCATE')",
  )).rows[0];
  assert.equal(unsafe.n,0,'No public table TRUNCATE granted to runtime');
  assert.equal((await tenantRows(pool,ulid(),'SELECT id FROM import_operations')).length,0,
    'Unknown tenant cannot see any durable import operation');
  for(const pid of config.pids)process.kill(pid,0);
  for(const api of [config.a,config.b]) {
    assert.equal((await http(api,'/api/v1/me',undefined,undefined,undefined,'GET')).status,401,
      'Unsigned request must receive 401');
  }
  console.log('MOD003_643_ROLE_PASS pg16=true before-migration-role=true select-insert-update=true delete=false truncate=false rls=true nests=2');
}
function productFile(name) {
  return [HEADER,name+',Piece,10.00,15.00,1,,,,,,'].join('\r\n');
}
async function checkSource(pool,tenant,operationId,name,expectedResponse,csv) {
  const [opRows,products,audits,events]=await Promise.all([
    tenantRows(pool,tenant,
      'SELECT tenant_id,operation_id,import_type,request_fingerprint,response_json,completed_at FROM import_operations WHERE operation_id=$1',
      [operationId]),
    tenantRows(pool,tenant,'SELECT id,name FROM products WHERE name=$1',[name]),
    tenantRows(pool,tenant,
      "SELECT id FROM audit_events WHERE entity_type='data_import' AND entity_id=$1",
      [operationId]),
    tenantRows(pool,tenant,
      "SELECT id FROM outbox WHERE event_type='data.imported' AND aggregate_id=$1",
      [operationId]),
  ]);
  assert.equal(opRows.length,1,'One permanent claim only');
  assert.equal(opRows[0].tenant_id,tenant);
  assert.equal(opRows[0].import_type,'PRODUCTS');
  assert.match(opRows[0].request_fingerprint,/^import:sha256:v1:[0-9a-f]{64}$/);
  assert.deepEqual(opRows[0].response_json,expectedResponse);
  assert.ok(opRows[0].completed_at,'Atomic completion required');
  assert.equal(products.length,1,'Exactly one SKU-less product');
  assert.equal(audits.length,1,'Exactly one import audit');
  assert.equal(events.length,1,'Exactly one outbox event');
  assert.equal(JSON.stringify(opRows[0]).includes(csv),false,'No raw CSV retained');
  return opRows[0].request_fingerprint;
}
async function execute() {
  const cfg=environment();
  if(process.argv.includes('--guard-only')) {
    console.log('MOD003_643_ENV_GUARD_PASS');
    return;
  }
  const {Pool}=createRequire(path.join(cfg.backend,'apps/api/package.json'))('pg');
  const pool=new Pool({connectionString:cfg.db,max:6});
  try {
    await roleGate(pool,cfg);
    const a=await signedTenant(cfg.a,'a');
    const b=await signedTenant(cfg.b,'b');
    const key=ulid(),name='Synthetic Nut A',changedName='Synthetic Nut B';
    const csv=productFile(name),changed=productFile(changedName);
    assert.equal(csv.length,changed.length,'Changed equal-length CSV test required');
    // Product preview is a pure read; never persist an import document.
    const preview=posted(await http(cfg.a,'/api/v1/imports/preview',
      {type:'PRODUCTS',csv},a.token),200,'preview');
    assert.equal(preview.validRows,1);
    assert.equal(preview.invalidRows,0);
    assert.equal((await tenantRows(pool,a.tenantId,
      'SELECT id FROM import_operations WHERE operation_id=$1',[key])).length,0);
    assert.equal((await tenantRows(pool,a.tenantId,
      'SELECT id FROM products WHERE name=$1',[name])).length,0);
    const start=() => http(cfg.a,'/api/v1/imports',{type:'PRODUCTS',csv},a.token,key);
    const contest=() => http(cfg.b,'/api/v1/imports',{type:'PRODUCTS',csv},a.token,key);
    const [left,right]=await Promise.all([start(),contest()]);
    const expected={type:'PRODUCTS',rows:1,imported:1};
    assert.deepEqual(posted(left,201,'Nest A import'),expected);
    assert.deepEqual(posted(right,201,'Nest B same-key replay'),expected);
    const firstFingerprint=await checkSource(pool,a.tenantId,key,name,expected,csv);
    await assertNoPermanentDelete(pool,a.tenantId,key);
    await pruneOnlyFastCache(pool,a.tenantId,key);
    assert.equal((await tenantRows(pool,a.tenantId,
      'SELECT id FROM idempotency_keys WHERE operation_id=$1',[key])).length,0);
    assert.equal((await tenantRows(pool,a.tenantId,
      'SELECT id FROM import_operations WHERE operation_id=$1',[key])).length,1);
    assert.deepEqual(posted(await contest(),201,'Post-pruning replay'),expected);
    const refused=await http(cfg.a,'/api/v1/imports',
      {type:'PRODUCTS',csv:changed},a.token,key);
    assert.equal(refused.status,409,'Changed bytes must not reuse permanent key');
    assert.equal(refused.error?.code,'IDEMPOTENCY_KEY_REUSED');
    assert.equal((await tenantRows(pool,a.tenantId,
      'SELECT id FROM products WHERE name=$1',[changedName])).length,0);
    assert.equal(await checkSource(pool,a.tenantId,key,name,expected,csv),firstFingerprint);
    const isolation=await tenantRows(pool,b.tenantId,
      'SELECT tenant_id FROM import_operations WHERE tenant_id=$1',[a.tenantId]);
    assert.equal(isolation.length,0,'Tenant B cannot view A permanent operation');
    // Identical operation ULID belongs to a different tenant with distinct CSV.
    assert.deepEqual(posted(await http(cfg.b,'/api/v1/imports',
      {type:'PRODUCTS',csv:changed},b.token,key),201,'Tenant B same ULID'),expected);
    const secondFingerprint=await checkSource(pool,b.tenantId,key,changedName,expected,changed);
    assert.notEqual(secondFingerprint,firstFingerprint);
    await assertNoPermanentDelete(pool,b.tenantId,key);
    // No source journals or stock movement invented by a catalogue-only import.
    for(const tenant of [a.tenantId,b.tenantId]) {
      const rows=await tenantRows(pool,tenant,[
        'SELECT',
        '(SELECT count(*)::int FROM stock_movements) AS stock,',
        "(SELECT count(*)::int FROM journal_entries WHERE source_document_type='STOCK_OPENING') AS openings",
      ].join(' '));
      assert.deepEqual(rows[0],{stock:0,openings:0});
    }
    console.log('MOD003_643_REAL_PASS pg16=true separate-nest-processes=2 tenants=2 permanent-claims=2 no-delete=true no-truncate=true late-replay=true changed-file-409=true accounting-zero=true');
  } finally {await pool.end();}
}
execute().catch(error=>{
  console.error('MOD003_643_FAIL:',error?.stack||String(error));
  process.exitCode=1;
});
