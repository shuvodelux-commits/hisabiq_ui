/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
/**
 * MOD-003 #627: isolated signed SALE × DAMAGE acceptance against two
 * independent Nest processes and a PostgreSQL16 app role with no TRUNCATE.
 * Test-only; no UI mount, backend writer edits or production data.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const { createRequire } = require('node:module');

const DB = 'sher_mod003_p2c_627_20261116';
const MARK = 'MOD003_627_ISOLATED_PG16_ONLY';
const ABC = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const PASS = 'Disposable627TestPass!2026';
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const op = () => '0' + Array.from(crypto.randomBytes(25), b => ABC[b % ABC.length]).join('');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function apiOrigin(raw, port) {
  const u = new URL(raw);
  assert.equal(u.protocol, 'http:', 'Only isolated HTTP');
  assert.equal(u.hostname, '127.0.0.1', 'Loopback API only');
  assert.equal(u.port, port, 'Dedicated API port only');
  assert.equal(u.pathname, '/');
  assert.equal(u.search, '');
  assert.equal(u.hash, '');
  return u.origin;
}
function environment() {
  assert.equal(process.env.MOD003_627_TEST_ONLY, MARK, 'Disposable marker required');
  const a = apiOrigin(process.env.MOD003_627_API_A || '', '55742');
  const b = apiOrigin(process.env.MOD003_627_API_B || '', '55743');
  assert.notEqual(a, b);
  const pg = new URL(process.env.MOD003_627_DB_URL || '');
  assert.equal(pg.protocol, 'postgres:', 'PostgreSQL required');
  assert.equal(pg.hostname, '127.0.0.1', 'Loopback database required');
  assert.equal(pg.port, '55741', 'Dedicated database port required');
  assert.equal(pg.pathname, '/' + DB, 'Disposable database name required');
  assert.equal(pg.username, 'sher_app', 'Unprivileged runtime identity required');
  const backend = process.env.MOD003_627_BACKEND_DIR || '';
  assert.ok(path.isAbsolute(backend), 'Isolated backend checkout required');
  return { a, b, db: pg.toString(), backend };
}
async function http(base, route, data, token, method = 'POST', key) {
  const res = await fetch(base + route, {
    method, redirect: 'error', credentials: 'omit', signal: AbortSignal.timeout(20000),
    headers: {
      Accept: 'application/json',
      ...(data === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token === undefined ? {} : { Authorization: 'Bearer ' + token }),
      ...(key === undefined ? {} : { 'Idempotency-Key': key }),
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const payload = res.status === 204 ? {} : await res.json();
  return { status: res.status, data: payload.data, error: payload.error };
}
function success(result, status, title) {
  assert.equal(result.status, status,
    title + ' HTTP ' + result.status + ' ' + String(result.error?.code));
  return result.data;
}
async function transaction(pool, tenant, sql, args = []) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN READ ONLY');
    await db.query("SELECT set_config('app.tenant_id',$1,true)", [tenant]);
    const data = (await db.query(sql, args)).rows;
    await db.query('ROLLBACK');
    return data;
  } catch (error) {
    await db.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    db.release();
  }
}
async function proveRole(pool, cfg) {
  const identity = (await pool.query(
    "SELECT current_database() AS db, current_user AS role, current_setting('server_version_num')::int AS ver",
  )).rows[0];
  assert.equal(identity.db, DB);
  assert.equal(identity.role, 'sher_app');
  assert.ok(identity.ver >= 160000 && identity.ver < 170000, 'PG16 required');
  const privileges = (await pool.query(
    "SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname=current_user",
  )).rows[0];
  assert.deepEqual(privileges, {
    rolsuper: false, rolbypassrls: false, rolcreatedb: false, rolcreaterole: false,
  });
  const unsafe = (await pool.query(
    "SELECT count(*)::int AS n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace " +
    "WHERE n.nspname='public' AND c.relkind='r' " +
    "AND has_table_privilege(current_user,c.oid,'TRUNCATE')",
  )).rows[0];
  assert.equal(unsafe.n, 0, 'App role may not TRUNCATE tables');
  const dbOwner = (await pool.query(
    "SELECT pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datname=current_database()",
  )).rows[0];
  assert.notEqual(dbOwner.owner, 'sher_app');
  assert.equal((await transaction(pool, op(), 'SELECT id FROM products')).length, 0,
    'Unknown tenant cannot see products');
  for (const api of [cfg.a, cfg.b]) {
    assert.equal((await http(api, '/api/v1/me', undefined, undefined, 'GET')).status, 401,
      'Both real Nest processes must enforce authentication');
  }
  console.log('MOD003_627_ROLE_PASS PG16 no-TRUNCATE RLS two-Nest=true');
}
async function signUp(api, label) {
  const suffix = crypto.randomBytes(5).toString('hex');
  const identifier = 'm003627-' + label + suffix + '@isolated.invalid';
  const challenge = success(await http(api, '/api/v1/auth/registration/otp', {
    identifier,
  }), 200, 'Dev registration OTP');
  assert.match(challenge.devCode, /^\d{6}$/);
  const created = success(await http(api, '/api/v1/auth/registration', {
    identifier, otpCode: challenge.devCode,
    username: 'm003627' + label + suffix, businessName: 'Synthetic 627 ' + label,
    password: PASS, pin: '472906',
  }), 201, 'Real registration');
  const login = success(await http(api, '/api/v1/auth/login', {
    identifier, password: PASS,
  }), 200, 'Real password login');
  const me = success(await http(api, '/api/v1/me', undefined,
    login.accessToken, 'GET'), 200, 'Signed tenant /me');
  assert.equal(me.tenantId, created.tenant.id);
  return { token: login.accessToken, tenantId: me.tenantId };
}
async function seed(api, owner, round) {
  const catalog = success(await http(api, '/api/v1/catalog', undefined,
    owner.token, 'GET'), 200, 'Tenant catalog');
  const piece = catalog.units.find(u => u.name === 'Piece');
  assert.ok(piece, 'Registered tenant must have Piece unit');
  const product = success(await http(api, '/api/v1/products', {
    name: 'MOD003 #627 Synthetic Cable ' + round, baseUnitId: piece.id,
    purchasePriceMinor: 10000, sellingPriceMinor: 12000, minStockQty: 1000,
    brandId: null, categoryId: null, sku: null, barcode: null,
    description: null, defaultDiscountType: null, defaultDiscountValue: null,
    offerEnabled: false, offerPriceMinor: null, offerStartDate: null, offerEndDate: null,
    tracksExpiry: false, tracksSerial: false, conversionUnitId: null,
    conversionFactorQty: null,
  }, owner.token, 'POST', op()), 201, 'Actual product create');
  assert.match(product.id, ULID);
  success(await http(api, '/api/v1/inventory/openings', {
    productId: product.id, qty: 10000,
  }, owner.token, 'POST', op()), 201, 'Ten-unit opening');
  const party = success(await http(api, '/api/v1/parties', {
    name: 'Synthetic Credit Customer ' + round, roles: ['CUSTOMER'],
    phone: '01712345678', address: null, guardianName: null, nid: null, email: null,
    notes: null, customerGroupId: null, creditLimitMinor: null,
  }, owner.token, 'POST', op()), 201, 'Actual customer create');
  assert.match(party.id, ULID);
  return { productId: product.id, partyId: party.id };
}
async function state(pool, tenant, product) {
  const rows = await transaction(pool, tenant, [
    'SELECT',
    '(SELECT COALESCE(SUM(qty_on_hand),0)::int FROM product_cost_state WHERE product_id=$1) AS qty,',
    "(SELECT COALESCE(SUM(qty_remaining),0)::int FROM inventory_lots WHERE product_id=$1 AND owner_type='OWNED') AS lots,",
    '(SELECT COUNT(*)::int FROM sales) AS sales,',
    '(SELECT COUNT(*)::int FROM stock_adjustments WHERE product_id=$1) AS adjustments,',
    "(SELECT COUNT(*)::int FROM stock_movements WHERE product_id=$1 AND source_document_type='SALE') AS sale_movements,",
    "(SELECT COUNT(*)::int FROM stock_movements WHERE product_id=$1 AND source_document_type='STOCK_ADJUSTMENT') AS adjustment_movements,",
    "(SELECT COUNT(*)::int FROM journal_entries WHERE source_document_type='SALE') AS sale_journals,",
    "(SELECT COUNT(*)::int FROM journal_entries WHERE source_document_type='STOCK_ADJUSTMENT') AS adjustment_journals,",
    "(SELECT COUNT(*)::int FROM audit_events WHERE entity_type='sale') AS sale_audits,",
    "(SELECT COUNT(*)::int FROM audit_events WHERE entity_type='stock_adjustment') AS adjustment_audits,",
    "(SELECT COUNT(*)::int FROM outbox WHERE event_type='sale.posted') AS sale_events,",
    "(SELECT COUNT(*)::int FROM outbox WHERE event_type='inventory.stock-adjusted') AS adjustment_events,",
    "(SELECT COALESCE(SUM(amount_minor),0)::int FROM journal_lines WHERE account_code='INVENTORY') AS inventory,",
    "(SELECT COALESCE(SUM(amount_minor),0)::int FROM journal_lines WHERE account_code='COGS') AS cogs,",
    "(SELECT COALESCE(SUM(amount_minor),0)::int FROM journal_lines WHERE account_code='STOCK_ADJUSTMENT') AS variance,",
    "(SELECT COALESCE(SUM(amount_minor),0)::int FROM journal_lines WHERE account_code='AR') AS receivable,",
    "(SELECT COALESCE(SUM(amount_minor),0)::int FROM journal_lines WHERE account_code='SALES') AS revenue",
  ].join(' '), [product]);
  return Object.fromEntries(Object.entries(rows[0]).map(([k,v])=>[k,Number(v)]));
}
async function accounting(pool, tenant, productId, api, token, winner) {
  const sale = Number(winner === 'SALE');
  const damage = Number(winner === 'DAMAGE');
  assert.deepEqual(await state(pool, tenant, productId), {
    qty: 3000, lots: 3000, sales: sale, adjustments: damage,
    sale_movements: sale, adjustment_movements: damage,
    sale_journals: sale, adjustment_journals: damage,
    sale_audits: sale, adjustment_audits: damage,
    sale_events: sale, adjustment_events: damage,
    inventory: 30000, cogs: 70000 * sale, variance: 70000 * damage,
    receivable: 84000 * sale, revenue: -84000 * sale,
  });
  const journals = await transaction(pool, tenant,
    'SELECT j.id,coalesce(sum(l.amount_minor),0)::bigint AS sum ' +
    'FROM journal_entries j JOIN journal_lines l ON l.journal_entry_id=j.id GROUP BY j.id');
  assert.equal(journals.length, 2, 'Opening plus exactly one source journal');
  assert.ok(journals.every(j=>Number(j.sum)===0), 'Every journal balances');
  const negative = await transaction(pool, tenant,
    "SELECT count(*)::int AS n FROM inventory_lots WHERE owner_type='OWNED' AND qty_remaining<0");
  assert.equal(negative[0].n, 0);
  const valuation = success(await http(api, '/api/v1/inventory/valuation',
    undefined, token, 'GET'), 200, 'Live financial reconciliation');
  assert.equal(valuation.totalValueMinor, 30000);
  assert.equal(valuation.inventoryAccountMinor, 30000);
  assert.equal(valuation.differenceMinor, 0);
  assert.equal(valuation.reconciled, true);
}
async function waitForQueuedCostStateWriters(pool, expected, label) {
  // Real PG16 observations, not mocked promises or an assumed request order.
  // Both Nest processes share the same deliberately isolated sher_app role.
  for (let attempt = 0; attempt < 70; attempt++) {
    const rows = (await pool.query(
      "SELECT count(*)::int AS waiting FROM pg_stat_activity " +
      "WHERE datname=current_database() AND usename=current_user " +
      "AND pid <> pg_backend_pid() AND wait_event_type='Lock' " +
      "AND query ILIKE '%product_cost_state%'"
    )).rows;
    if (rows[0].waiting >= expected) return;
    await delay(100);
  }
  throw Error('Real PG16 '+label+' writer never queued at cost-state row lock');
}
async function overlap(pool, tenant, product, sale, damage, damageFirst) {
  const client = await pool.connect();
  let writes;
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.tenant_id',$1,true)", [tenant]);
    const locked = await client.query(
      'SELECT id FROM product_cost_state WHERE tenant_id=$1 AND product_id=$2 FOR UPDATE',
      [tenant, product]);
    assert.equal(locked.rows.length, 1, 'Real PG row lock barrier required');
    if (damageFirst) {
      // Exercise the genuinely missing branch: DAMAGE must queue before SALE.
      // Catch to avoid an unhandled rejection while watching PG lock queue.
      const queuedDamage = damage().catch(error => ({
        status: 0, error: { message: String(error) },
      }));
      await waitForQueuedCostStateWriters(pool, 1, 'DAMAGE-first');
      writes = Promise.all([sale(), queuedDamage]);
      await waitForQueuedCostStateWriters(pool, 2, 'SALE-after-DAMAGE');
    } else {
      writes = Promise.all([sale(), damage()]);
      await delay(400);
    }
    await client.query('COMMIT');
    return await writes;
  } catch (e) {
    await client.query('ROLLBACK').catch(()=>undefined);
    if (writes) await writes.catch(()=>undefined);
    throw e;
  } finally {
    client.release();
  }
}
async function run() {
  const cfg = environment();
  if (process.argv.includes('--guard-only')) {
    console.log('MOD003_627_ENV_PASS');
    return;
  }
  const { Pool } = createRequire(path.join(cfg.backend,'apps/api/package.json'))('pg');
  const pool = new Pool({ connectionString: cfg.db, max: 5 });
  try {
    await proveRole(pool, cfg);
    const { submitInventoryAdjustment } =
      await import('../src/integration/inventory-adjustment-command.ts');
    globalThis.window = { location: { origin: cfg.b } };
    const foreign = await signUp(cfg.b, 'foreign');
    for (let i=1;i<=3;i++) {
      const owner = await signUp(cfg.a, 'round'+i);
      const { productId, partyId } = await seed(cfg.a, owner, i);
      const hidden = await transaction(pool, foreign.tenantId,
        'SELECT id FROM products WHERE id=$1',[productId]);
      assert.equal(hidden.length, 0, 'Cross-tenant RLS must hide inventory');
      const saleId = op(), damageId = op();
      const saleBody = {
        partyId, customerName:null, customerPhone:null,
        lines:[{productId,qty:7000,unitPriceMinor:12000,lineDiscountMinor:0}],
        payments:[], discountMinor:0,
      };
      const adjustment = {productId,qtyDelta:-7000,reason:'DAMAGE',note:null};
      const sale = () => http(cfg.a,'/api/v1/sales',saleBody,owner.token,'POST',saleId);
      const damage = async () => {
        try {
          const posted = await submitInventoryAdjustment(owner.token,damageId,adjustment);
          return {status:201,data:posted.data};
        } catch (error) {
          if (error.kind!=='http') throw error;
          return {status:error.status,error:{code:error.code,message:error.message}};
        }
      };
      const [s,d] = await overlap(pool,owner.tenantId,productId,sale,damage,i===2);
      assert.equal([s.status,d.status].filter(status=>status===201).length,1,
        'Only one of two 7/10 owned-stock writers may succeed');
      const winner = s.status===201?'SALE':'DAMAGE';
      if (i === 2) assert.equal(winner, 'DAMAGE',
        'With real queued DAMAGE-first PG source lock, SALE must lose');
      if (winner==='SALE') {
        assert.equal(d.status,400,'Losing DAMAGE must report actual shortage');
        assert.equal(d.error?.code,'VALIDATION_FAILED');
        assert.equal(d.error?.message,'Only 3 in stock — remove that much or less');
        assert.match(s.data.id,ULID);
      } else {
        assert.equal(d.status,201);
        assert.ok([409,422].includes(s.status),'Losing SALE must be typed');
        assert.equal(s.error?.code,s.status===422?'INSUFFICIENT_STOCK':'CONFLICT_STALE_VERSION');
        assert.match(d.data.id,ULID);
      }
      await accounting(pool,owner.tenantId,productId,cfg.a,owner.token,winner);
      const retry = winner==='SALE'?await sale():
        {status:201,data:(await submitInventoryAdjustment(owner.token,damageId,adjustment)).data};
      assert.ok([200,201].includes(retry.status),'Idempotent replay must succeed');
      assert.equal(retry.data.id,winner==='SALE'?s.data.id:d.data.id);
      await accounting(pool,owner.tenantId,productId,cfg.a,owner.token,winner);
      try {
        await submitInventoryAdjustment(foreign.token,op(),
          {productId,qtyDelta:-1000,reason:'DAMAGE',note:null});
        assert.fail('Foreign tenant write must be invisible');
      } catch (error) {
        assert.equal(error.kind,'http');
        assert.equal(error.status,404);
      }
      await accounting(pool,owner.tenantId,productId,cfg.a,owner.token,winner);
      console.log('MOD003_627_ROUND_PASS '+i+' winner='+winner);
    }
    console.log('MOD003_627_REAL_PASS rounds=3 two-Nest=true PG16=true no-truncate=true RLS=true accounting=true');
  } finally {
    delete globalThis.window;
    await pool.end();
  }
}
run().catch(error=>{console.error('MOD003_627_FAILED:',error?.stack||String(error));process.exitCode=1;});
