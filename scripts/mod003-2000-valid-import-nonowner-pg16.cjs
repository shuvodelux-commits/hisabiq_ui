/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
/*
 * MOD-003 C003-02 #661 — real two-Nest durable CSV import identity QA.
 * Disposable PostgreSQL16, preexisting runtime role without DELETE/TRUNCATE on
 * import_operations, signed two-tenant HTTP, no backend/UI/production writes.
 * --guard-only rejects unsafe targets BEFORE connecting or posting any fixtures.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { performance } = require('node:perf_hooks');
const path = require('node:path');
const { createRequire } = require('node:module');

const DATABASE = 'sher_mod003_p6_661_20261116';
const MARKER = 'MOD003_661_DISPOSABLE_PG16_ONLY_20261116';
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const PASSWORD = 'Synthetic661NotProduction!2026';
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
  assert.equal(process.env.MOD003_661_TEST_ONLY, MARKER,
    'Explicit disposable-only marker required');
  const a = apiOrigin(process.env.MOD003_661_API_A || '', '55802', 'Nest A');
  const b = apiOrigin(process.env.MOD003_661_API_B || '', '55803', 'Nest B');
  assert.notEqual(a,b);
  const url = new URL(process.env.MOD003_661_DB_URL || '');
  assert.equal(url.protocol, 'postgres:', 'PostgreSQL only');
  assert.equal(url.hostname, '127.0.0.1', 'Local PostgreSQL only');
  assert.equal(url.port, '55801', 'Dedicated PostgreSQL port only');
  assert.equal(url.pathname, '/' + DATABASE, 'Exact disposable database required');
  assert.equal(url.username, 'sher_app', 'Nonowner runtime principal required');
  const backend = process.env.MOD003_661_BACKEND_DIR || '';
  assert.ok(path.isAbsolute(backend), 'Absolute isolated backend checkout required');
  assert.equal(path.resolve(backend), backend, 'Canonical backend path required');
  assert.notEqual(path.resolve(backend), process.cwd(), 'Backend is not frontend');
  const aPid = Number(process.env.MOD003_661_PID_A);
  const bPid = Number(process.env.MOD003_661_PID_B);
  if (!process.argv.includes('--guard-only')) {
    assert.ok(Number.isSafeInteger(aPid) && aPid > 1, 'Real Nest A PID required');
    assert.ok(Number.isSafeInteger(bPid) && bPid > 1, 'Real Nest B PID required');
    assert.notEqual(aPid,bPid,'Two different Nest OS processes required');
  }
  return { a, b, db: url.toString(), backend, pids: [aPid,bPid] };
}
async function http(api, route, body, token, operationId, method='POST') {
  const res = await fetch(api + route, {
    method, redirect:'error', credentials:'omit', signal:AbortSignal.timeout(600000),
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
  const identifier='m003661'+label+suffix+'@isolated.invalid';
  const otp=posted(await http(api,'/api/v1/auth/registration/otp',{identifier}),200,'OTP');
  assert.match(otp.devCode,/^\d{6}$/,'Actual development OTP required');
  const registered=posted(await http(api,'/api/v1/auth/registration',{
    identifier,otpCode:otp.devCode,username:'m003661'+label+suffix,
    businessName:'Synthetic import 661 '+label,password:PASSWORD,pin:'472906',
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
  console.log('MOD003_661_ROLE_PASS pg16=true before-migration-role=true select-insert-update=true delete=false truncate=false rls=true nests=2');
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

/**
 * #661: Large invalid last-row import must not strand any import operation.
 * Exact runtime role is provisioned and checked by the existing #645 role gate.
 * The successful recovery is intentionally ONE row, not a 2,000-row load claim.
 */
async function bulkSourceState(pool,tenant,operationId) {
  const [counts] = await tenantRows(pool,tenant,[
    'SELECT',
    "(SELECT count(*)::int FROM products WHERE name LIKE 'Bulk661 %') AS products,",
    '(SELECT count(*)::int FROM import_operations WHERE operation_id=$1) AS claims,',
    '(SELECT count(*)::int FROM idempotency_keys WHERE operation_id=$1) AS fast_keys,',
    "(SELECT count(*)::int FROM audit_events WHERE entity_type='data_import' AND entity_id=$1) AS audits,",
    "(SELECT count(*)::int FROM outbox WHERE event_type='data.imported' AND aggregate_id=$1) AS events,",
    '(SELECT count(*)::int FROM stock_movements) AS stock_movements,',
    '(SELECT count(*)::int FROM stock_openings) AS stock_openings,',
    '(SELECT count(*)::int FROM journal_entries) AS journal_entries',
  ].join(' '),[operationId]);
  return counts;
}
async function proveMaxRowsFailClosed(pool,cfg,tenant,foreign) {
  const operationId=ulid();
  const nameAt=index=>'Bulk661 '+String(index+1).padStart(4,'0');
  const data=Array.from({length:2000},(_,index)=>
    nameAt(index)+','+(index===1999?'Peice':'Piece')+',10.00,15.00,1,,,,,,');
  assert.equal(data.length,2000);
  const invalidCsv=[HEADER,...data].join('\r\n');
  const pre=posted(await http(cfg.a,'/api/v1/imports/preview',
    {type:'PRODUCTS',csv:invalidCsv},tenant.token),200,'2,000-row invalid preview');
  assert.equal(pre.totalRows,2000,'Limit-boundary preview');
  assert.equal(pre.validRows,1999,'Only final invalid unit');
  assert.equal(pre.invalidRows,1,'Exactly one invalid row');
  assert.ok(pre.rows.at(-1)?.errors.length>0,'Last data row has a real validation error');

  const before=await bulkSourceState(pool,tenant.tenantId,operationId);
  assert.deepEqual(before,{
    products:0,claims:0,fast_keys:0,audits:0,events:0,
    stock_movements:0,stock_openings:0,journal_entries:0,
  },'Independent synthetic bulk prefix and import operation have zero baseline');
  const rejected=await http(cfg.a,'/api/v1/imports',
    {type:'PRODUCTS',csv:invalidCsv},tenant.token,operationId);
  assert.equal(rejected.status,400,'Last invalid row must refuse entire batch');
  assert.equal(rejected.error?.code,'VALIDATION_FAILED');
  assert.deepEqual(await bulkSourceState(pool,tenant.tenantId,operationId),before,
    'Refused row 2000 cannot persist first 1999 products, claim or outbox');

  // Same ULID after failed transaction: it is not permanently claimed.
  const corrected=productFile('Bulk661 Fixed');
  const result={type:'PRODUCTS',rows:1,imported:1};
  assert.deepEqual(posted(await http(cfg.b,'/api/v1/imports',
    {type:'PRODUCTS',csv:corrected},tenant.token,operationId),
    201,'Recovery after invalid row 2000'),result);
  const recovery=await bulkSourceState(pool,tenant.tenantId,operationId);
  assert.deepEqual(recovery,{
    products:1,claims:1,fast_keys:1,audits:1,events:1,
    stock_movements:0,stock_openings:0,journal_entries:0,
  },'One corrected row, one durable claim and no accounting source');
  await checkSource(pool,tenant.tenantId,operationId,'Bulk661 Fixed',result,corrected);
  await pruneOnlyFastCache(pool,tenant.tenantId,operationId);
  assert.deepEqual(posted(await http(cfg.a,'/api/v1/imports',
    {type:'PRODUCTS',csv:corrected},tenant.token,operationId),
    201,'Late replay after aborted 2000-row import'),result);
  const after=await bulkSourceState(pool,tenant.tenantId,operationId);
  assert.deepEqual(after,{...recovery,fast_keys:0},
    'Late retry cannot create extra product, permanent claim or audit/outbox');

  const changed=productFile('Bulk661 Other');
  const mismatch=await http(cfg.b,'/api/v1/imports',
    {type:'PRODUCTS',csv:changed},tenant.token,operationId);
  assert.equal(mismatch.status,409,'Different bytes under committed ULID');
  assert.equal(mismatch.error?.code,'IDEMPOTENCY_KEY_REUSED');
  assert.deepEqual(await bulkSourceState(pool,tenant.tenantId,operationId),after);

  // 2,001 data rows exceed the documented hard max even when all are valid.
  const tooManyKey=ulid();
  const overCsv=[HEADER,...Array.from({length:2001},(_,i)=>
    'Bulk661 Over '+String(i+1).padStart(4,'0')+',Piece,10.00,15.00,1,,,,,,')].join('\r\n');
  const over=await http(cfg.b,'/api/v1/imports',
    {type:'PRODUCTS',csv:overCsv},tenant.token,tooManyKey);
  assert.equal(over.status,400,'2,001 rows must exceed hard limit');
  assert.equal(over.error?.code,'VALIDATION_FAILED');
  const tooMany=await bulkSourceState(pool,tenant.tenantId,tooManyKey);
  assert.deepEqual(tooMany,{
    ...after,fast_keys:0,claims:0,audits:0,events:0,
  },'2,001-row refusal cannot post anything or claim its operation ID');
  assert.equal((await tenantRows(pool,foreign.tenantId,
    'SELECT id FROM import_operations WHERE operation_id IN ($1,$2)',
    [operationId,tooManyKey])).length,0,'Foreign tenant cannot see the operation ids');
  console.log('MOD003_661_BULK_PASS pg16=true no-truncate=true last-row-2000-400=true zero-side-effects=true corrected-same-key-201=true replay-after-prune=true changed-409=true over-2001-400=true rls=true');
}


/**
 * #661 successful maximum-sized import acceptance. Same source-owned importer,
 * real signed Nest HTTP + nonowner PG16, 2,000 genuine created products.
 * Elapsed time is observed evidence, not a service-level benchmark or promise.
 */
async function snapshotMaxValid(pool,tenant,operationId) {
  const [row]=await tenantRows(pool,tenant,[
    'SELECT',
    "(SELECT count(*)::int FROM products WHERE name LIKE 'Bulk661Max %') AS products,",
    "(SELECT count(DISTINCT name)::int FROM products WHERE name LIKE 'Bulk661Max %') AS unique_names,",
    "(SELECT count(*)::int FROM products WHERE name LIKE 'Bulk661Max %' AND (sku IS NOT NULL OR barcode IS NOT NULL OR deleted_at IS NOT NULL)) AS unexpected_identifiers,",
    "(SELECT COALESCE(sum(purchase_price_minor),0)::bigint FROM products WHERE name LIKE 'Bulk661Max %') AS purchase_minor,",
    "(SELECT COALESCE(sum(selling_price_minor),0)::bigint FROM products WHERE name LIKE 'Bulk661Max %') AS selling_minor,",
    "(SELECT COALESCE(sum(min_stock_qty),0)::bigint FROM products WHERE name LIKE 'Bulk661Max %') AS reorder_qty,",
    '(SELECT count(*)::int FROM import_operations WHERE operation_id=$1) AS claims,',
    '(SELECT count(*)::int FROM idempotency_keys WHERE operation_id=$1) AS fast_keys,',
    "(SELECT count(*)::int FROM audit_events WHERE entity_type='data_import' AND entity_id=$1) AS import_audits,",
    "(SELECT count(*)::int FROM outbox WHERE event_type='data.imported' AND aggregate_id=$1) AS import_events,",
    '(SELECT count(*)::int FROM stock_openings) AS openings,',
    '(SELECT count(*)::int FROM inventory_lots) AS lots,',
    '(SELECT count(*)::int FROM stock_movements) AS movements,',
    '(SELECT count(*)::int FROM product_cost_state) AS cost_states,',
    '(SELECT count(*)::int FROM journal_entries) AS journals',
  ].join(' '),[operationId]);
  return Object.fromEntries(Object.entries(row).map(([key,value])=>[key,Number(value)]));
}
async function proveSuccessfulMaxImport(pool,cfg,actor,foreign) {
  const operationId=ulid();
  const name=i=>'Bulk661Max '+String(i+1).padStart(4,'0');
  const rows=Array.from({length:2000},(_,i)=>name(i)+',Piece,10.00,15.00,1,,,,,,');
  const csv=[HEADER,...rows].join('\r\n');
  assert.equal(rows.length,2000,'Exactly at import max, not an approximation');
  assert.ok(csv.length<2_000_000,'Full source content must fit import limit');
  const expected={type:'PRODUCTS',rows:2000,imported:2000};
  const baseline=await snapshotMaxValid(pool,actor.tenantId,operationId);
  assert.equal(baseline.products,0,'No previous test products under unique max prefix');
  assert.equal(baseline.claims,0);
  assert.equal(baseline.fast_keys,0);
  const previewStart=performance.now();
  const preview=posted(await http(cfg.a,'/api/v1/imports/preview',
    {type:'PRODUCTS',csv},actor.token),200,'Actual 2000-row valid preview');
  const previewMs=Math.round(performance.now()-previewStart);
  assert.equal(preview.totalRows,2000);
  assert.equal(preview.validRows,2000);
  assert.equal(preview.invalidRows,0);
  assert.equal(preview.rows.length,2000);
  assert.deepEqual(await snapshotMaxValid(pool,actor.tenantId,operationId),baseline,
    'Full valid preview writes zero products, source identity, journal or outbox');
  const submit=api=>http(api,'/api/v1/imports',{type:'PRODUCTS',csv},
    actor.token,operationId);
  const commitStart=performance.now();
  const original=await submit(cfg.a);
  const commitMs=Math.round(performance.now()-commitStart);
  assert.deepEqual(posted(original,201,'2,000-row real signed transactional commit'),expected);
  const committed=await snapshotMaxValid(pool,actor.tenantId,operationId);
  assert.deepEqual(committed,{
    products:2000,
    unique_names:2000,
    unexpected_identifiers:0,
    purchase_minor:2_000_000,
    selling_minor:3_000_000,
    reorder_qty:2_000_000,
    claims:1,
    fast_keys:1,
    import_audits:1,
    import_events:1,
    openings:baseline.openings,
    lots:baseline.lots,
    movements:baseline.movements,
    cost_states:baseline.cost_states,
    journals:baseline.journals,
  },'All 2,000 rows committed once, exactly one batch, no invented accounting');
  const op=await tenantRows(pool,actor.tenantId,[
    'SELECT operation_id,request_fingerprint,response_json,completed_at',
    'FROM import_operations WHERE operation_id=$1',
  ].join(' '),[operationId]);
  assert.equal(op.length,1);
  const digest='import:sha256:v1:'+crypto.createHash('sha256')
    .update(JSON.stringify(['PRODUCTS',csv])).digest('hex');
  assert.equal(op[0].request_fingerprint,digest,'Versioned entire-request digest');
  assert.deepEqual(op[0].response_json,expected,'Committed original result');
  assert.ok(op[0].completed_at,'Permanent operation completed in same UOW');
  assert.equal(JSON.stringify(op).includes(csv),false,'Permanent claim does not expose raw CSV');
  const foreignSource=await tenantRows(pool,foreign.tenantId,[
    'SELECT',
    "(SELECT count(*)::int FROM products WHERE name LIKE 'Bulk661Max %') AS products,",
    '(SELECT count(*)::int FROM import_operations WHERE operation_id=$1) AS claims',
  ].join(' '),[operationId]);
  assert.deepEqual(foreignSource,[{products:0,claims:0}],
    'Foreign tenant sees neither the 2,000 products nor their permanent operation');
  await assertNoPermanentDelete(pool,actor.tenantId,operationId);
  await pruneOnlyFastCache(pool,actor.tenantId,operationId);
  const afterPrune={...committed,fast_keys:0};
  assert.deepEqual(await snapshotMaxValid(pool,actor.tenantId,operationId),afterPrune);
  const replayStart=performance.now();
  const replay=await submit(cfg.b);
  const replayMs=Math.round(performance.now()-replayStart);
  assert.deepEqual(posted(replay,201,'2,000-row late replay from other Nest'),expected);
  assert.deepEqual(await snapshotMaxValid(pool,actor.tenantId,operationId),afterPrune,
    'A 2,000-row late replay must not duplicate any catalogue, outbox or journal source');
  const changed=csv.replace('Bulk661Max 0001','Bulk661Max X001');
  assert.equal(changed.length,csv.length,'Equal-length changed source bytes');
  const refused=await http(cfg.b,'/api/v1/imports',
    {type:'PRODUCTS',csv:changed},actor.token,operationId);
  assert.equal(refused.status,409,'Reused key for changed maximum-size file must conflict');
  assert.equal(refused.error?.code,'IDEMPOTENCY_KEY_REUSED');
  assert.deepEqual(await snapshotMaxValid(pool,actor.tenantId,operationId),afterPrune,
    'Changing content under original operation ID must post nothing');
  assert.equal((await tenantRows(pool,actor.tenantId,
    "SELECT count(*)::int AS n FROM products WHERE name='Bulk661Max X001'"))[0].n,0,
    'No changed row may be posted');
  const rps=Math.round((2000/(commitMs/1000))*100)/100;
  console.log('MOD003_661_VALID_MAX_PASS pg16=true no-truncate=true nodes=2 rows=2000 products=2000 claims=1 audit=1 outbox=1 preview-writes=0 late-replay=true changed-409=true rls=true no-journals=true');
  console.log('MOD003_661_OBSERVED_METRICS preview_ms='+previewMs+
    ' commit_ms='+commitMs+' replay_ms='+replayMs+' rows_per_second='+rps+
    ' csv_characters='+csv.length+' source_rows=2000 no_contractual_sla=true');
}

async function execute() {
  const cfg=environment();
  if(process.argv.includes('--guard-only')) {
    console.log('MOD003_661_ENV_GUARD_PASS');
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
    console.log('MOD003_661_REAL_PASS pg16=true separate-nest-processes=2 tenants=2 permanent-claims=2 no-delete=true no-truncate=true late-replay=true changed-file-409=true accounting-zero=true');
    await proveMaxRowsFailClosed(pool,cfg,a,b);
    await proveSuccessfulMaxImport(pool,cfg,a,b);
  } finally {await pool.end();}
}
execute().catch(error=>{
  console.error('MOD003_661_FAIL:',error?.stack||String(error));
  process.exitCode=1;
});
