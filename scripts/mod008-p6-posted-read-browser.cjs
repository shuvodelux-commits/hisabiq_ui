/* MOD-008 P6: isolated, opt-in React -> signed Nest -> PostgreSQL16
 * posted Purchase/return GET-only browser acceptance.
 * Run ONLY after the existing P5D disposable identity bootstrap and real HTTP
 * source seed. Never use a retained shop or another workstream's R09 instance.
 * This script creates POSTED sources in its *own* disposable database, then
 * delegates all GET-only browser assertions to the unchanged R09 harness.
 */
'use strict';
const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const { createHmac, randomBytes } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { dirname, resolve } = require('node:path');
const Module = require('node:module');

const NAME = 'hisabiq-mod008-p5d-pg16';
const OWNER = 'mod008-p6-posted-647-20261116';
const ACK = 'isolated-p6-posted-react';
const API = 'http://127.0.0.1:3230';
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const E = process.env;
const whoKeys = ['A', 'B'];

function deny(message) {
  throw new Error(message); // No credentials or response bodies in errors.
}
function guard() {
  if (E.HISABIQ_P6_POSTED_ACK !== ACK)
    deny('P6 posted QA acknowledgement missing');
  if (E.HISABIQ_P5D_API_ORIGIN !== API)
    deny('P6 posted QA API origin mismatch');
  if (E.HISABIQ_P5D_PG_CONTAINER !== NAME)
    deny('P6 posted QA container mismatch');
  if (E.HISABIQ_P5D_DISPOSABLE_ACK !== 'isolated-pg16-only')
    deny('P6 posted QA disposable acknowledgement missing');
  if (E.HISABIQ_P6_POSTED_TEST_SECRET !== 'test-secret-not-used-in-production')
    deny('P6 posted QA test-signature key mismatch');
  for (const who of whoKeys) {
    for (const key of ['TENANT', 'USER', 'SUPPLIER', 'PRODUCT']) {
      assert.match(E['HISABIQ_P5D_' + key + '_' + who] || '', ULID,
        'P6 posted QA signed source identity missing');
    }
    assert.equal(typeof E['HISABIQ_P5D_JWT_' + who], 'string',
      'P6 posted QA signed token missing');
    verifyJwt(E['HISABIQ_P5D_JWT_' + who], who);
  }
  assert.notEqual(E.HISABIQ_P5D_TENANT_A, E.HISABIQ_P5D_TENANT_B);
  const inspection = spawnSync('podman', ['inspect', '--format', '{{json .}}', NAME],
    { encoding: 'utf8', timeout: 8000 });
  assert.equal(inspection.status, 0, 'P6 posted QA container must exist');
  const data = JSON.parse(inspection.stdout);
  assert.equal(data.State?.Running, true, 'P6 posted QA PG must be running');
  assert.equal(data.Config?.Labels?.['hisabiq.qa'], 'mod008-p5d-501');
  assert.equal(data.Config?.Labels?.['hisabiq.owner'], OWNER,
    'P6 posted QA run-owner mismatch');
  assert.ok(data.Config?.Env?.includes('PG_MAJOR=16'));
  assert.ok(data.Config?.Env?.includes('POSTGRES_DB=sher_test'));
  assert.match(String(data.Config?.Image), /postgres:16[-@]/);
  const port = data.NetworkSettings?.Ports?.['5432/tcp'] || [];
  assert.ok(port.some(x => x.HostIp === '127.0.0.1' && x.HostPort === '55681'),
    'P6 posted QA database is not on the approved loopback port');
  return true;
}
function sign(content) {
  return createHmac('sha256', E.HISABIQ_P6_POSTED_TEST_SECRET)
    .update(content).digest('base64url');
}
function verifyJwt(jwt, who) {
  const fields = jwt.split('.');
  assert.equal(fields.length, 3, 'P6 posted QA needs a real JWT');
  assert.equal(sign(fields[0] + '.' + fields[1]), fields[2],
    'P6 posted QA JWT signature invalid');
  const header = JSON.parse(Buffer.from(fields[0], 'base64url').toString('utf8'));
  const payload = JSON.parse(Buffer.from(fields[1], 'base64url').toString('utf8'));
  assert.equal(header.alg, 'HS256');
  assert.equal(payload.sub, E['HISABIQ_P5D_USER_' + who]);
  assert.equal(payload.tid, E['HISABIQ_P5D_TENANT_' + who]);
  assert.equal(payload.tz, 'Asia/Dhaka');
  assert.ok(payload.exp > Math.floor(Date.now() / 1000) + 30, 'Test JWT expires too soon');
  return { fields, payload };
}
function expiredJwt() {
  const { fields, payload } = verifyJwt(E.HISABIQ_P5D_JWT_A, 'A');
  const body = Buffer.from(JSON.stringify({
    ...payload, exp: Math.floor(Date.now() / 1000) - 60,
  })).toString('base64url');
  const input = fields[0] + '.' + body;
  return input + '.' + sign(input);
}
function ulid() {
  let t = Date.now(), head = '';
  for (let i = 0; i < 10; i++) {
    head = ALPHABET[t % 32] + head;
    t = Math.floor(t / 32);
  }
  const bytes = randomBytes(10);
  let bits = 0, buffer = 0, tail = '';
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      tail += ALPHABET[(buffer >>> bits) & 31];
      buffer &= (1 << bits) - 1;
    }
  }
  return head + tail;
}
function sql(command) {
  const proc = spawnSync('podman', ['exec', NAME, 'psql', '-U', 'postgres',
    '-d', 'sher_test', '-v', 'ON_ERROR_STOP=1', '-t', '-A', '-q', '-c', command],
  { encoding: 'utf8', timeout: 12000, maxBuffer: 1024 * 1024 });
  assert.equal(proc.status, 0, 'P6 posted QA isolated PG query failed');
  return proc.stdout.trim();
}
function snapshot() {
  return JSON.parse(sql("SELECT json_build_object(" + [
    'purchases', 'purchase_lines', 'purchase_returns',
    'journal_entries', 'journal_lines', 'stock_movements',
    'inventory_lots', 'supplier_payments', 'cash_movements',
    'audit_events', 'outbox',
  ].map(name => "'" + name + "', (SELECT count(*) FROM " + name + ")").join(', ')
  + ')::text'));
}
function setDisposableUsername(tenant, user, who) {
  assert.match(tenant, ULID);
  assert.match(user, ULID);
  const username = who === 'A' ? 'p6posted-a-647' : 'p6posted-b-647';
  const query = "UPDATE users SET username='" + username + "' " +
    "WHERE tenant_id='" + tenant + "' AND id='" + user + "' RETURNING username";
  assert.equal(sql(query), username,
    'P6 posted QA fixture username update failed');
}
function grant(tenant, user, permission) {
  assert.match(tenant, ULID);
  assert.match(user, ULID);
  assert.match(permission, /^[a-z.]+$/);
  const query = "INSERT INTO role_permissions " +
    "(id, tenant_id, role_id, permission_code, created_at, updated_at, created_by, updated_by, version) " +
    "SELECT '" + ulid() + "', u.tenant_id, u.role_id, '" + permission +
    "', now(), now(), u.id, u.id, 1 FROM users u " +
    "WHERE u.tenant_id='" + tenant + "' AND u.id='" + user + "' " +
    "AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.tenant_id=u.tenant_id " +
    "AND rp.role_id=u.role_id AND rp.permission_code='" + permission + "') RETURNING id";
  assert.match(sql(query), ULID, 'P6 posted QA fixture permission insert failed');
}
async function post(who, path, body) {
  const response = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
      Authorization: 'Bearer ' + E['HISABIQ_P5D_JWT_' + who],
      'Idempotency-Key': ulid() },
    body: JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(20000),
  });
  assert.equal(response.status, 201, 'P6 posted QA fixture HTTP status failed');
  const data = await response.json();
  assert.ok(data?.data && typeof data.data === 'object');
  return data.data;
}
function substituteOnce(src, oldText, newText) {
  assert.equal(src.split(oldText).length, 2, 'Pinned R09 browser source anchor changed');
  return src.replace(oldText, newText);
}
function runUnmodifiedR09BrowserInP6Namespace() {
  const sourcePath = resolve(__dirname, 'connected-purchase-real-read-browser.cjs');
  let source = readFileSync(sourcePath, 'utf8');
  for (const [from, to] of [
    ["const ACK = 'disposable-pg16-purchase-read-only';", "const ACK = '" + ACK + "';"],
    ["const API = 'http://127.0.0.1:3294';", "const API = '" + API + "';"],
    ["const CONTAINER = 'hisabiq-mod009-purchase-read-pg16';", "const CONTAINER = '" + NAME + "';"],
    ["const DATABASE = 'hisabiq_mod009_purchase_read_598';", "const DATABASE = 'sher_test';"],
    ["const origin = 'http://127.0.0.1:5198';", "const origin = 'http://127.0.0.1:5231';"],
    ["'--port', '5198'", "'--port', '5231'"],
  ]) source = substituteOnce(source, from, to);
  const taskModule = new Module(sourcePath, module);
  taskModule.filename = sourcePath;
  taskModule.paths = Module._nodeModulePaths(dirname(sourcePath));
  // Module._compile executes the unchanged R09 assertions in a P6-only namespace.
  // Its inherited startVite is always bound to the fixed P6 port.
  taskModule._compile(source, sourcePath);
}
async function browserChild(env) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [__filename], {
      cwd: resolve(__dirname, '..'), env: {
        ...env, HISABIQ_P6_POSTED_PHASE: 'browser',
        HISABIQ_R09_PURCHASE_ACK: ACK,
        HISABIQ_R09_PURCHASE_API_ORIGIN: API,
        HISABIQ_R09_PURCHASE_PG_CONTAINER: NAME,
        HISABIQ_R09_PURCHASE_PG_DB: 'sher_test',
      }, stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error('P6 signed React read-browser assertions failed'));
    });
  });
}
async function main() {
  guard();
  if (E.HISABIQ_P6_POSTED_PHASE === 'browser') {
    runUnmodifiedR09BrowserInP6Namespace();
    return;
  }
  if (E.HISABIQ_P6_POSTED_PHASE) deny('Unknown P6 posted QA phase');
  for (const who of whoKeys) {
    const tenant = E['HISABIQ_P5D_TENANT_' + who];
    const user = E['HISABIQ_P5D_USER_' + who];
    setDisposableUsername(tenant, user, who);
    grant(tenant, user, 'purchase.bill.view');
    if (who === 'A') {
      grant(tenant, user, 'purchase.return.create');
      grant(tenant, user, 'purchase.return.view');
    }
  }
  const ids = {};
  for (const who of whoKeys) {
    const bill = await post(who, '/api/v1/purchases', {
      supplierPartyId: E['HISABIQ_P5D_SUPPLIER_' + who],
      lines: [{ productId: E['HISABIQ_P5D_PRODUCT_' + who],
        qty: 5_000, unitPriceMinor: 187 }],
      discountMinor: 0, paidMinor: 0, paidAccountCode: null,
    });
    assert.match(bill.id, ULID);
    assert.match(bill.lines?.[0]?.id, ULID);
    ids[who] = bill;
  }
  await post('A', '/api/v1/purchase-returns', {
    purchaseId: ids.A.id,
    lines: [{ sourceLineId: ids.A.lines[0].id, qty: 1_000 }],
    reason: 'DAMAGED', note: null,
    receivedMinor: 0, receiptAccountCode: null,
  });
  const before = snapshot();
  const env = {
    ...E,
    HISABIQ_R09_PURCHASE_TENANT_A: E.HISABIQ_P5D_TENANT_A,
    HISABIQ_R09_PURCHASE_TENANT_B: E.HISABIQ_P5D_TENANT_B,
    HISABIQ_R09_PURCHASE_USER_A: E.HISABIQ_P5D_USER_A,
    HISABIQ_R09_PURCHASE_USER_B: E.HISABIQ_P5D_USER_B,
    HISABIQ_R09_PURCHASE_SOURCE_A: ids.A.id,
    HISABIQ_R09_PURCHASE_SOURCE_B: ids.B.id,
    HISABIQ_R09_PURCHASE_JWT_A: E.HISABIQ_P5D_JWT_A,
    HISABIQ_R09_PURCHASE_JWT_B: E.HISABIQ_P5D_JWT_B,
    HISABIQ_R09_PURCHASE_EXPIRED_JWT_A: expiredJwt(),
  };
  await browserChild(env);
  const after = snapshot();
  assert.deepEqual(after, before, 'GET-only Purchase browser must not post money or mutate audit');
  console.log('PASS P6 signed posted React browser and PostgreSQL nonposting totals');
}
main().catch((error) => {
  // Never print private environment, signed identity or HTTP response bodies.
  console.error(error && /P6 posted QA/.test(error.message)
    ? error.message : 'P6 posted QA failed; isolated failure, private details suppressed');
  process.exitCode = 1;
});
