/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
/*
 * MOD-003 #624: real signed HisabIQ stock adjustment command -> Nest -> PG16.
 * TEST-ONLY. Frontend is unmounted; Products and ConnectedWorkspaceGate unchanged.
 * Requires a separate disposable local PG16 owned by postgres and a running
 * actual Nest process using role sher_app (NO TRUNCATE, NO BYPASSRLS).
 * The runner provisions only synthetic data through genuine HTTP APIs.
 *
 * --guard-only is for explicit negative preflight checks before any writes.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const { createRequire } = require('node:module');

const MARKER = 'MOD003_T02P2_DISPOSABLE_ONLY_20261116';
const TEST_DB = 'sher_mod003_t02p2_20261116';
const API_PORT = '55724';
const PG_PORT = '55723';
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const PASSWORD = 'DisposableMod003Qa2026!9';

function ulid() {
  return '0' + Array.from(crypto.randomBytes(25), n => ALPHABET[n % ALPHABET.length]).join('');
}
function origin(raw, label) {
  const url = new URL(raw);
  assert.equal(url.protocol, 'http:', label + ' protocol');
  assert.equal(url.hostname, '127.0.0.1', label + ' hostname');
  assert.equal(url.port, API_PORT, 'Never use shared or default API port');
  assert.equal(url.pathname, '/', label + ' path');
  assert.equal(url.search, '', label + ' query');
  assert.equal(url.hash, '', label + ' hash');
  return url.origin;
}
function setup() {
  assert.equal(process.env.MOD003_T02P2_TEST_ONLY, MARKER,
    'Explicit disposable-only marker required');
  const apiBase = origin(process.env.MOD003_T02P2_API_URL || '', 'dedicated Nest API');
  const db = new URL(process.env.MOD003_T02P2_DB_URL || '');
  assert.equal(db.protocol, 'postgres:', 'Only PostgreSQL runtime is accepted');
  assert.equal(db.hostname, '127.0.0.1', 'Only local PostgreSQL is accepted');
  assert.equal(db.port, PG_PORT, 'Never use shared or default PostgreSQL port');
  assert.equal(db.pathname, '/' + TEST_DB, 'Only exact disposable database is allowed');
  assert.equal(db.username, 'sher_app', 'Only nonowner application role is allowed');
  assert.ok(process.env.MOD003_T02P2_BACKEND_DIR?.startsWith('/'),
    'Explicit isolated backend path required');
  const backendDir = path.resolve(process.env.MOD003_T02P2_BACKEND_DIR);
  assert.equal(backendDir, process.env.MOD003_T02P2_BACKEND_DIR,
    'Backend path must be absolute and canonical');
  assert.notEqual(backendDir, process.cwd(), 'Backend path must be separate from frontend');
  return { apiBase, dbUrl: db.toString(), backendDir };
}
function expectStatus(result, expected, label) {
  assert.equal(result.status, expected,
    label + ': unexpected HTTP ' + result.status + ' code=' + (result.error?.code || '-'));
  return result.data;
}
async function http(base, route, body, token, method = 'POST', operationId) {
  const res = await fetch(base + route, {
    method, redirect: 'error', credentials: 'omit',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token === undefined ? {} : { Authorization: 'Bearer ' + token }),
      ...(operationId === undefined ? {} : { 'Idempotency-Key': operationId }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const payload = res.status === 204 ? {} : await res.json();
  return { status: res.status, data: payload.data, error: payload.error };
}
async function register(api, label) {
  const suffix = crypto.randomBytes(5).toString('hex');
  const identifier = 'mod003-p2-' + label + suffix + '@isolated.invalid';
  const otp = expectStatus(await http(api, '/api/v1/auth/registration/otp', {
    identifier,
  }), 200, 'development registration OTP');
  assert.match(otp.devCode, /^\d{6}$/, 'Must use genuine development OTP, not fabricated');
  const created = expectStatus(await http(api, '/api/v1/auth/registration', {
    identifier, otpCode: otp.devCode, username: 'mod003' + label + suffix,
    businessName: 'MOD003 disposable ' + label, password: PASSWORD, pin: '472906',
  }), 201, 'real registration');
  const signed = expectStatus(await http(api, '/api/v1/auth/login', {
    identifier, password: PASSWORD,
  }), 200, 'real password login');
  const me = expectStatus(await http(api, '/api/v1/me', undefined,
    signed.accessToken, 'GET'), 200, 'authenticated identity');
  assert.equal(me.tenantId, created.tenant.id);
  assert.match(me.tenantId, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  return { tenantId: me.tenantId, userId: me.user.id, token: signed.accessToken };
}
async function createProduct(api, owner, label, qty) {
  const catalog = expectStatus(await http(api, '/api/v1/catalog',
    undefined, owner.token, 'GET'), 200, 'catalogue');
  const unit = catalog.units.find(item => item.name === 'Piece');
  assert.ok(unit, 'real onboarding must provide Piece unit');
  const product = expectStatus(await http(api, '/api/v1/products', {
    name: 'MOD003 synthetic adjustment ' + label,
    baseUnitId: unit.id, purchasePriceMinor: 10000, sellingPriceMinor: 12000,
    minStockQty: 1000, brandId: null, categoryId: null, sku: null, barcode: null,
    description: null, defaultDiscountType: null, defaultDiscountValue: null,
    offerEnabled: false, offerPriceMinor: null, offerStartDate: null,
    offerEndDate: null, tracksExpiry: false, tracksSerial: false,
    conversionUnitId: null, conversionFactorQty: null,
  }, owner.token, 'POST', ulid()), 201, 'product create');
  assert.match(product.id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  const opening = expectStatus(await http(api, '/api/v1/inventory/openings', {
    productId: product.id, qty,
  }, owner.token, 'POST', ulid()), 201, 'opening stock');
  assert.equal(opening.qty, qty);
  assert.match(opening.id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  return product.id;
}
async function staff(api, owner, label, permissions) {
  const role = expectStatus(await http(api, '/api/v1/roles', {
    name: 'MOD003 QA ' + label, permissions,
    cashRefundPerReturnMinor: null, cashRefundPerDayMinor: null,
    confirmPassword: PASSWORD,
  }, owner.token), 201, 'restricted role');
  const id = crypto.randomBytes(5).toString('hex');
  const identifier = 'mod003-staff-' + id + '@isolated.invalid';
  const user = expectStatus(await http(api, '/api/v1/users', {
    displayName: 'Disposable ' + label, username: 'm003' + id,
    identifier, roleId: role.id, confirmPassword: PASSWORD,
  }, owner.token), 201, 'restricted user');
  assert.equal(user.hasPassword, false);
  const challenge = expectStatus(await http(api, '/api/v1/auth/password/otp', {
    identifier,
  }), 200, 'staff password OTP');
  assert.match(challenge.devCode, /^\d{6}$/);
  expectStatus(await http(api, '/api/v1/auth/password/reset', {
    identifier, otpCode: challenge.devCode, password: PASSWORD,
  }), 204, 'staff password activation');
  const signed = expectStatus(await http(api, '/api/v1/auth/login', {
    identifier, password: PASSWORD,
  }), 200, 'staff login');
  const me = expectStatus(await http(api, '/api/v1/me', undefined,
    signed.accessToken, 'GET'), 200, 'staff identity');
  assert.equal(me.tenantId, owner.tenantId);
  assert.equal(me.permissions.includes('inventory.cost.view'), false);
  return { token: signed.accessToken };
}
async function tenantQuery(pool, tenant, sql, params = []) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await client.query('SELECT set_config($1, $2, true)', ['app.tenant_id', tenant]);
    const result = await client.query(sql, params);
    await client.query('ROLLBACK');
    return result.rows;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
async function validateRuntime(pool) {
  const info = (await pool.query(
    "SELECT current_database() AS db, current_user AS role, current_setting('server_version_num')::integer AS version",
  )).rows[0];
  assert.equal(info.db, TEST_DB, 'Runtime connected to wrong database');
  assert.equal(info.role, 'sher_app', 'Runtime must be nonowner');
  assert.ok(info.version >= 160000 && info.version < 170000, 'PostgreSQL16 required');
  const roles = (await pool.query(
    "SELECT rolsuper, rolbypassrls, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = current_user",
  )).rows;
  assert.deepEqual(roles, [{ rolsuper: false, rolbypassrls: false,
    rolcreatedb: false, rolcreaterole: false }]);
  const unsafe = (await pool.query(
    "SELECT count(*)::integer AS n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace " +
    "WHERE n.nspname='public' AND c.relkind='r' AND " +
    "has_table_privilege(current_user, c.oid, 'TRUNCATE')",
  )).rows[0].n;
  assert.equal(unsafe, 0, 'Runtime role must not TRUNCATE any public table');
  const dbOwner = (await pool.query(
    "SELECT pg_get_userbyid(datdba) AS owner FROM pg_database WHERE datname=current_database()",
  )).rows[0].owner;
  assert.notEqual(dbOwner, 'sher_app', 'Runtime role must not own disposable database');
  const [tables] = await tenantQuery(pool, ulid(),
    "SELECT count(*)::integer AS n FROM products");
  assert.equal(tables.n, 0, 'Empty unprovisioned tenant must see zero products under RLS');
  console.log('MOD003_RUNTIME_GUARD_PASS pg16=true role=sher_app no-truncate=true rls=true');
}
async function snapshot(pool, actor, productId) {
  const rows = await tenantQuery(pool, actor.tenantId, [
    'SELECT',
    '(SELECT count(*)::int FROM stock_adjustments WHERE product_id=$1) AS adjustments,',
    "(SELECT count(*)::int FROM stock_movements WHERE product_id=$1 AND source_document_type='STOCK_ADJUSTMENT') AS movements,",
    "(SELECT count(*)::int FROM journal_entries WHERE source_document_type='STOCK_ADJUSTMENT') AS journals,",
    "(SELECT count(*)::int FROM audit_events WHERE entity_type='stock_adjustment') AS audit,",
    "(SELECT count(*)::int FROM outbox WHERE event_type='inventory.stock-adjusted') AS outbox,",
    '(SELECT sum(qty_on_hand)::bigint FROM product_cost_state WHERE product_id=$1) AS stock,',
    "(SELECT sum(qty_remaining)::bigint FROM inventory_lots WHERE product_id=$1 AND owner_type='OWNED') AS lots",
  ].join(' '), [productId]);
  const row = rows[0];
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v === null ? null : Number(v)]));
}
async function assertAccounting(pool, api, actor, product, qty, valueMinor, adjustments) {
  const state = await snapshot(pool, actor, product);
  assert.equal(state.stock, qty, 'persisted stock quantity');
  assert.equal(state.lots, qty, 'sum of owned lot remains equals cost state');
  assert.equal(state.adjustments, adjustments, 'distinct adjustment document count');
  assert.equal(state.movements, adjustments, 'one movement per adjustment');
  assert.equal(state.journals, adjustments, 'one journal per adjustment');
  assert.equal(state.audit, adjustments, 'one audit event per adjustment');
  assert.equal(state.outbox, adjustments, 'one outbox event per adjustment');
  const journals = await tenantQuery(pool, actor.tenantId, [
    'SELECT j.id, coalesce(sum(l.amount_minor),0)::bigint AS balance',
    'FROM journal_entries j INNER JOIN journal_lines l ON l.journal_entry_id = j.id',
    'GROUP BY j.id ORDER BY j.id',
  ].join(' '));
  assert.ok(journals.length >= adjustments + 1, 'opening plus adjustment journal entries');
  for (const j of journals) assert.equal(Number(j.balance), 0, 'every journal must double-entry balance');
  const negatives = await tenantQuery(pool, actor.tenantId,
    "SELECT count(*)::int AS n FROM inventory_lots WHERE owner_type='OWNED' AND qty_remaining<0");
  assert.equal(negatives[0].n, 0, 'owned lots must not be negative');
  const valuation = expectStatus(await http(api, '/api/v1/inventory/valuation',
    undefined, actor.token, 'GET'), 200, 'inventory valuation');
  assert.equal(valuation.totalValueMinor, valueMinor, 'inventory valuation is exact');
  assert.equal(valuation.inventoryAccountMinor, valueMinor, 'inventory account balances valuation');
  assert.equal(valuation.differenceMinor, 0, 'zero inventory reconciliation difference');
  assert.equal(valuation.reconciled, true, 'source valuation reconciled');
  const inventoryJournal = await tenantQuery(pool, actor.tenantId,
    "SELECT coalesce(sum(amount_minor),0)::bigint AS v FROM journal_lines WHERE account_code='INVENTORY'");
  assert.equal(Number(inventoryJournal[0].v), valueMinor, 'journal INVENTORY equals stock value');
}
async function failHttp(action, status, label) {
  try {
    await action();
  } catch (error) {
    assert.equal(error.kind, 'http', label + ' error kind');
    assert.equal(error.status, status, label + ' HTTP status');
    return;
  }
  assert.fail(label + ' unexpectedly succeeded');
}
async function run() {
  const cfg = setup(); // ALL environment guardrails run before any API or DB operations.
  if (process.argv.includes('--guard-only')) {
    console.log('MOD003_ENV_GUARD_PASS');
    return;
  }
  const requireBackend = createRequire(path.join(cfg.backendDir, 'apps/api/package.json'));
  const pg = requireBackend('pg');
  const pool = new pg.Pool({ connectionString: cfg.dbUrl, max: 4 });
  try {
    await validateRuntime(pool); // No fixture writes before principal and RLS checks.
    const unauthorized = await http(cfg.apiBase, '/api/v1/me', undefined, undefined, 'GET');
    expectStatus(unauthorized, 401, 'unsigned real Nest preflight');
    const { submitInventoryAdjustment } =
      await import('../src/integration/inventory-adjustment-command.ts');
    // Node24 executes the actual React transport and same-origin HTTP client, not a mock.
    globalThis.window = { location: { origin: cfg.apiBase } };
    const a = await register(cfg.apiBase, 'a');
    const b = await register(cfg.apiBase, 'b');
    assert.notEqual(a.tenantId, b.tenantId);
    const productA = await createProduct(cfg.apiBase, a, 'a', 10000);
    const productB = await createProduct(cfg.apiBase, b, 'b', 10000);
    const invisibleA = await tenantQuery(pool, a.tenantId, 'SELECT id FROM products WHERE id=$1', [productB]);
    const invisibleB = await tenantQuery(pool, b.tenantId, 'SELECT id FROM products WHERE id=$1', [productA]);
    assert.equal(invisibleA.length, 0, 'RLS must deny tenant B product to A');
    assert.equal(invisibleB.length, 0, 'RLS must deny tenant A product to B');
    await assertAccounting(pool, cfg.apiBase, a, productA, 10000, 100000, 0);
    await assertAccounting(pool, cfg.apiBase, b, productB, 10000, 100000, 0);

    const instruction = { productId: productA, qtyDelta: -3000,
      reason: 'DAMAGE', note: 'Synthetic damaged wire' };
    const op = ulid();
    const first = await submitInventoryAdjustment(a.token, op, instruction);
    assert.match(first.data.id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
    assert.equal(first.data.qtyDelta, -3000);
    assert.equal(first.data.direction, 'OUT');
    assert.equal(first.data.qtyOnHandAfter, 7000);
    assert.equal(first.data.valueMinor, 30000);
    await assertAccounting(pool, cfg.apiBase, a, productA, 7000, 70000, 1);
    // Real HTTP same-key replay models caller recovery after a lost ACK.
    const again = await submitInventoryAdjustment(a.token, op, instruction);
    assert.equal(again.data.id, first.data.id, 'same source ID on duplicate identity');
    await assertAccounting(pool, cfg.apiBase, a, productA, 7000, 70000, 1);
    await failHttp(() => submitInventoryAdjustment(a.token, op,
      { ...instruction, qtyDelta: -2000 }), 409, 'changed payload with reused id');
    await assertAccounting(pool, cfg.apiBase, a, productA, 7000, 70000, 1);
    await failHttp(() => submitInventoryAdjustment(b.token, ulid(),
      { ...instruction, qtyDelta: -1000 }), 404, 'cross-tenant product write');
    await assertAccounting(pool, cfg.apiBase, b, productB, 10000, 100000, 0);

    const noEdit = await staff(cfg.apiBase, a, 'No Edit', ['catalog.product.view']);
    await failHttp(() => submitInventoryAdjustment(noEdit.token, ulid(), instruction),
      403, 'missing product edit permission');
    await assertAccounting(pool, cfg.apiBase, a, productA, 7000, 70000, 1);
    const withoutCost = await staff(cfg.apiBase, a, 'No Cost',
      ['catalog.product.view', 'catalog.product.edit']);
    const increment = await submitInventoryAdjustment(withoutCost.token, ulid(), {
      productId: productA, qtyDelta: 1000, reason: 'RECOUNT', note: null,
    });
    assert.equal(increment.data.qtyOnHandAfter, 8000);
    assert.equal(Object.hasOwn(increment.data, 'valueMinor'), false,
      'non-COST_VIEW principal cannot receive cost field');
    await assertAccounting(pool, cfg.apiBase, a, productA, 8000, 80000, 2);
    await failHttp(() => submitInventoryAdjustment(a.token, ulid(), {
      productId: productA, qtyDelta: -9000, reason: 'DAMAGE', note: null,
    }), 400, 'overdraft owned lot');
    const tomorrow = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
    await failHttp(() => submitInventoryAdjustment(a.token, ulid(), {
      productId: productA, qtyDelta: 1000, reason: 'RECOUNT', note: null, businessDate: tomorrow,
    }), 400, 'future business date');
    await assertAccounting(pool, cfg.apiBase, a, productA, 8000, 80000, 2);

    // Genuine competing HTTP requests against one stock position, not mocked races.
    const negative = { productId: productB, qtyDelta: -7000,
      reason: 'DAMAGE', note: 'Concurrent stock QA' };
    const results = await Promise.allSettled([
      submitInventoryAdjustment(b.token, ulid(), negative),
      submitInventoryAdjustment(b.token, ulid(), negative),
    ]);
    const good = results.filter(r => r.status === 'fulfilled');
    const bad = results.filter(r => r.status === 'rejected');
    assert.equal(good.length, 1, 'one concurrent negative writer wins');
    assert.equal(bad.length, 1, 'other concurrent negative writer must fail');
    assert.equal(bad[0].reason.kind, 'http');
    assert.ok([400, 409].includes(bad[0].reason.status), 'typed refusal, never HTTP 500');
    await assertAccounting(pool, cfg.apiBase, b, productB, 3000, 30000, 1);
    console.log('MOD003_T02P2_REAL_PASS tenants=2 pg16=true rls=true no-truncate=true ' +
      'adjustments=3 journals=3 idempotency=true concurrency=true cost-redaction=true');
  } finally {
    delete globalThis.window;
    await pool.end();
  }
}
run().catch(error => {
  console.error('MOD003_T02P2_FAIL:', error?.stack || String(error));
  process.exitCode = 1;
});
