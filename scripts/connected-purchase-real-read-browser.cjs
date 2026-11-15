/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
/** R09-PURCHASE-REAL-READ: isolated signed Nest/PG16 GET-only browser QA.
 * No production route, fixture seeding, purchase, return, cash, stock or journal write. */
const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const { resolve } = require('node:path');
const { existsSync } = require('node:fs');
const ACK = 'disposable-pg16-purchase-read-only';
const API = 'http://127.0.0.1:3294';
const CONTAINER = 'hisabiq-mod009-purchase-read-pg16';
const DATABASE = 'hisabiq_mod009_purchase_read_598';
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const origin = 'http://127.0.0.1:5198';
const fixture = origin + '/tests/fixtures/connected-purchase-real-read.html';
const root = resolve(__dirname, '..');
function refuse(why) { throw Error('Refusing real purchase QA: ' + why); }
function setup() {
  if (process.env.HISABIQ_R09_PURCHASE_ACK !== ACK)
    refuse('explicit disposable purchase read-only acknowledgement is missing');
  if (process.env.HISABIQ_R09_PURCHASE_API_ORIGIN !== API)
    refuse('isolated purchase test API origin is required');
  if (process.env.HISABIQ_R09_PURCHASE_PG_CONTAINER !== CONTAINER ||
      process.env.HISABIQ_R09_PURCHASE_PG_DB !== DATABASE)
    refuse('dedicated disposable purchase PG16 identity mismatch');
  const identities = {};
  for (const key of ['a', 'b']) {
    const suffix = key.toUpperCase();
    const tenantId = process.env['HISABIQ_R09_PURCHASE_TENANT_' + suffix];
    const userId = process.env['HISABIQ_R09_PURCHASE_USER_' + suffix];
    const purchaseId = process.env['HISABIQ_R09_PURCHASE_SOURCE_' + suffix];
    const token = process.env['HISABIQ_R09_PURCHASE_JWT_' + suffix];
    if (![tenantId, userId, purchaseId].every(x => typeof x === 'string' && ULID.test(x)) ||
        typeof token !== 'string' || !/^[A-Za-z0-9._-]{32,8192}$/.test(token))
      refuse('two actual signed disposable tenant/user/purchase sources required');
    identities[key] = { tenantId, userId, purchaseId, token };
  }
  for (const field of ['tenantId', 'userId', 'purchaseId'])
    assert.notEqual(identities.a[field], identities.b[field], 'A/B ' + field + ' must differ');
  return identities;
}
const people = setup();
const inspected = spawnSync('podman', ['inspect', '--format', '{{json .}}', CONTAINER],
  { encoding: 'utf8', timeout: 8000 });
if (inspected.status !== 0 || !inspected.stdout) refuse('disposable PG16 container unavailable');
let podman;
try { podman = JSON.parse(inspected.stdout); } catch { refuse('invalid PG16 inspection'); }
if (!podman.State?.Running || !Array.isArray(podman.Config?.Env) ||
    !podman.Config.Env.includes('POSTGRES_DB=' + DATABASE) ||
    !podman.Config.Env.includes('PG_MAJOR=16') ||
    !/(?:^|\/)postgres:16(?:[-@]|$)/.test(String(podman.Config.Image)))
  refuse('isolated PG16 container or database not verified');
const { chromium } = require('playwright');
function allowedGet(path) {
  const u = new URL(path, API);
  const p = u.pathname;
  if (u.origin !== API || !(
    ['/health', '/api/v1/me', '/api/v1/purchases', '/api/v1/purchase-returns'].includes(p) ||
    /^\/api\/v1\/purchases\/[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(p) ||
    /^\/api\/v1\/purchase-returns\/returnable\/[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(p)
  )) refuse('only known purchase read routes are permitted');
  return u;
}
async function get(path, token) {
  const u = allowedGet(path);
  const response = await fetch(u, { method: 'GET', redirect: 'error',
    headers: { Accept: 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    signal: AbortSignal.timeout(18_000) });
  if (u.pathname !== '/health' && !/application\/(?:[\w.-]+\+)?json/i.test(
    response.headers.get('content-type') || '')) refuse('Nest response is not JSON');
  const raw = await response.text();
  if (raw.length > 2 * 1024 * 1024) refuse('oversized read response');
  let data = null;
  try { data = JSON.parse(raw); } catch { if (u.pathname !== '/health') refuse('bad JSON'); }
  return { status: response.status, data, raw, type: response.headers.get('content-type') };
}
async function preflight() {
  assert.equal((await get('/health')).status, 200);
  const results = {};
  for (const who of ['a', 'b']) {
    const person = people[who];
    const me = await get('/api/v1/me', person.token);
    assert.equal(me.status, 200);
    const access = me.data?.data;
    assert.equal(access?.tenantId, person.tenantId);
    assert.equal(access?.user?.id, person.userId);
    assert.ok(access.user.username?.trim() && access.user.displayName?.trim() &&
      access.businessName?.trim() && Array.isArray(access.permissions));
    assert.ok(access.permissions.includes('purchase.bill.view'));
    for (const permission of ['purchase.return.create', 'purchase.return.view'])
      assert.equal(access.permissions.includes(permission), who === 'a');
    const list = await get('/api/v1/purchases?limit=25', person.token);
    assert.equal(list.status, 200);
    assert.ok(Array.isArray(list.data?.data));
    const row = list.data.data.find(x => x.id === person.purchaseId);
    assert.ok(row && row.status === 'POSTED' && row.supplierName);
    const detail = await get('/api/v1/purchases/' + person.purchaseId, person.token);
    assert.equal(detail.status, 200);
    assert.equal(detail.data?.data?.id, person.purchaseId);
    assert.ok(Array.isArray(detail.data?.data?.lines));
    results[who] = { access, row };
  }
  // Tenant-local bill numbers can collide. Use distinct supplier snapshots for UI evidence.
  assert.notEqual(results.a.row.supplierName, results.b.row.supplierName,
    'A/B fixture supplier snapshots must be distinct');
  assert.equal((await get('/api/v1/purchases/' + people.a.purchaseId, people.b.token)).status,
    404, 'B cannot inspect A purchase');
  assert.equal((await get('/api/v1/purchases/' + people.b.purchaseId, people.a.token)).status,
    404, 'A cannot inspect B purchase');
  const source = await get('/api/v1/purchase-returns/returnable/' + people.a.purchaseId,
    people.a.token);
  assert.equal(source.status, 200);
  assert.equal(source.data?.data?.purchaseId, people.a.purchaseId);
  assert.ok(source.data.data.lines?.length > 0);
  const history = await get('/api/v1/purchase-returns?limit=20', people.a.token);
  assert.equal(history.status, 200);
  assert.ok(history.data?.returns?.some(x => x.purchaseId === people.a.purchaseId));
  assert.equal((await get('/api/v1/purchase-returns/returnable/' + people.b.purchaseId,
    people.b.token)).status, 403);
  assert.equal((await get('/api/v1/purchase-returns?limit=20', people.b.token)).status, 403);
  console.log('PASS purchase read preflight: signed /me, A/B source GET, cross-tenant 404, roles 200/403');
  return results;
}
function bearer(request) {
  const h = request.headers().authorization || '';
  return ['a', 'b'].find(w => h === 'Bearer ' + people[w].token) ?? null;
}
function intercept(page, log, violations, blocked) {
  page.route('**/*', route => {
    const u = new URL(route.request().url());
    if (u.origin !== origin) { blocked.push(u.origin); return route.abort('blockedbyclient'); }
    return route.continue();
  });
  page.route('**/api/v1/**', async route => {
    const request = route.request(), u = new URL(request.url());
    const path = u.pathname, method = request.method(), who = bearer(request);
    try {
      assert.equal(u.origin, origin);
      log.push({ path, method, who });
      if (method === 'POST' && path === '/api/v1/auth/login') {
        const q = request.postDataJSON();
        const alias = q?.identifier === 'r09-purchase-a' ? 'a' :
          q?.identifier === 'r09-purchase-b' ? 'b' : null;
        assert.ok(alias && q?.password === 'test-only-password');
        return route.fulfill({ status: 200, contentType: 'application/json',
          body: JSON.stringify({ data: { accessToken: people[alias].token,
            refreshToken: 'r09-purchase-test-only-' + alias,
            user: { id: people[alias].userId, username: q.identifier } } }) });
      }
      assert.ok(who, 'actual signed disposable bearer required');
      assert.equal(method, 'GET', 'no business writes can reach Nest');
      const purchaseId = /^\/api\/v1\/purchases\/([0-7][0-9A-HJKMNP-TV-Z]{25})$/.exec(path);
      const returnId = /^\/api\/v1\/purchase-returns\/returnable\/([0-7][0-9A-HJKMNP-TV-Z]{25})$/.exec(path);
      if (purchaseId) assert.equal(purchaseId[1], people[who].purchaseId);
      if (returnId) { assert.equal(who, 'a'); assert.equal(returnId[1], people.a.purchaseId); }
      if (path === '/api/v1/purchase-returns') assert.equal(who, 'a');
      const response = await get(path + u.search, people[who].token);
      return route.fulfill({ status: response.status,
        contentType: response.type || 'application/json', body: response.raw });
    } catch {
      violations.push('Unexpected purchase read route or method');
      return route.fulfill({ status: 599, contentType: 'application/json',
        body: JSON.stringify({ error: 'read-only test guard' }) }).catch(() => {});
    }
  });
}
async function startVite() {
  const child = spawn(process.execPath, ['node_modules/vite/bin/vite.js',
    '--host', '127.0.0.1', '--port', '5198', '--strictPort'],
  { cwd: root, stdio: 'ignore', env: { ...process.env,
    VITE_HISABIQ_INTEGRATION_MODE: 'preview' } });
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) refuse('test Vite exited');
    try {
      if ((await fetch(fixture, { redirect: 'error',
        signal: AbortSignal.timeout(2000) })).status === 200) {
        let ready = true;
        for (const path of ['/tests/fixtures/connected-purchase-real-read.tsx',
          '/src/pages/Purchases.tsx', '/src/index.css']) {
          const response = await fetch(origin + path, { redirect: 'error',
            signal: AbortSignal.timeout(30000) });
          if (response.status !== 200 || new URL(response.url).origin !== origin) {
            ready = false;
            break;
          }
          await response.arrayBuffer();
        }
        if (ready) return child;
      }
    } catch { /* isolated Vite is warming */ }
    await new Promise(ok => setTimeout(ok, 250));
  }
  child.kill('SIGTERM');
  refuse('test-only Vite did not become ready');
}
async function exercise(browser, width, preflightRecords) {
  const context = await browser.newContext({ viewport: { width, height: 860 },
    reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);
  const log = [], violations = [], blocked = [], errors = [];
  const stage = { value: 'setup' };
  page.on('pageerror', e => errors.push(e.name));
  intercept(page, log, violations, blocked);
  try {
    stage.value = 'navigation';
    await page.goto(fixture, { waitUntil: 'domcontentloaded', timeout: 60000 });
    stage.value = 'tenant-a';
    await page.locator('[data-purchase-real-login-a]').click();
    await page.getByText('Verified:' + preflightRecords.a.access.businessName).waitFor();
    const rowA = preflightRecords.a.row, rowB = preflightRecords.b.row;
    const table = page.locator('[data-purchases-table]');
    await table.getByText(rowA.supplierName).filter({ visible: true }).first().waitFor();
    stage.value = 'bill-a';
    await page.getByRole('button', { name: 'View bill ' + rowA.number }).click();
    await page.getByRole('dialog', { name: 'Purchase bill details' }).waitFor();
    await page.keyboard.press('Escape');
    stage.value = 'return-a';
    await page.getByRole('button',
      { name: 'Review returnable quantities ' + rowA.number }).click();
    await page.locator('[data-purchase-returnable-table]').waitFor();
    stage.value = 'history-a';
    await page.getByRole('tab', { name: 'Return history' }).click();
    await page.locator('[data-purchase-return-history-table]').waitFor();
    stage.value = 'tenant-b';
    await page.locator('[data-purchase-real-login-b]').click();
    await page.getByText('Verified:' + preflightRecords.b.access.businessName).waitFor();
    await page.getByRole('tab', { name: 'Purchases' }).click();
    await table.getByText(rowB.supplierName).filter({ visible: true }).first().waitFor();
    assert.equal(await table.getByText(rowA.supplierName).count(), 0);
    stage.value = 'bill-b';
    await page.getByRole('button', { name: 'View bill ' + rowB.number }).click();
    await page.getByRole('dialog', { name: 'Purchase bill details' }).waitFor();
    assert.ok(log.some(row => row.path === '/api/v1/purchases/' + people.b.purchaseId &&
      row.method === 'GET' && row.who === 'b'));
    await page.keyboard.press('Escape');
    stage.value = 'denied-b';
    await page.getByRole('tab', { name: 'Purchase return' }).click();
    await page.getByText('You need purchase return permission to review returnable quantities.').waitFor();
    await page.getByRole('tab', { name: 'Return history' }).click();
    await page.getByText('You do not have permission to view supplier return history.').waitFor();
    stage.value = 'checks';
    assert.deepEqual(violations, []);
    assert.deepEqual(errors, []);
    assert.ok(log.filter(x => x.method === 'GET' && x.path.startsWith('/api/v1/purchase')).length >= 6);
    assert.equal(log.some(x => x.who === 'b' && x.path.startsWith('/api/v1/purchase-returns')), false);
    console.log('PASS real signed purchase-return read @' + width + 'px');
  } catch (error) {
    const category = error?.name === 'TimeoutError' ? 'timeout' :
      error?.name === 'AssertionError' ? 'assertion' : 'other';
    console.error('R09_PURCHASE_BROWSER_PHASE_RED', width, stage.value, category);
    throw error;
  } finally { await context.close(); }
}
async function main() {
  const preflightRecords = await preflight();
  let vite, browser;
  try {
    vite = await startVite();
    browser = await chromium.launch({ headless: true,
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
        (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
      args: ['--no-sandbox'] });
    await exercise(browser, 1280, preflightRecords);
    await exercise(browser, 768, preflightRecords);
    await exercise(browser, 390, preflightRecords);
    console.log('PASS signed purchase-return Nest/PG16 GET acceptance; no business writes');
  } finally {
    await browser?.close();
    vite?.kill('SIGTERM');
  }
}
main().catch(() => {
  // Never emit tokens, private PostgreSQL URLs or source response bodies.
  console.error('R09_PURCHASE_READ_QA_RED: isolated preflight/browser acceptance failed');
  process.exitCode = 1;
});
