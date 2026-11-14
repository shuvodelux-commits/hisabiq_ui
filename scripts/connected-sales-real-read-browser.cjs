/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * MOD-009 R09-SALES-REAL-READ-12.
 *
 * GENUINE GET-only Nest + dedicated disposable PostgreSQL 16 acceptance.
 * NEVER seed / create / void / return / refund / credit / change cash or stock.
 * Authentication bootstrap is a test-only POST interception using REAL signed
 * disposable JWTs; /me and ALL business data come directly from local Nest.
 *
 * Required environment (secrets are NEVER logged):
 * HISABIQ_R09_REAL_READ_ACK=disposable-pg16-read-only
 * HISABIQ_R09_REAL_API_ORIGIN=http://127.0.0.1:3293
 * HISABIQ_R09_REAL_PG_CONTAINER=hisabiq-mod009-read-pg16
 * HISABIQ_R09_REAL_PG_DB=hisabiq_mod009_sales_read_12
 * HISABIQ_R09_TENANT_A, HISABIQ_R09_USER_A, HISABIQ_R09_JWT_A, HISABIQ_R09_SALE_A
 * HISABIQ_R09_TENANT_B, HISABIQ_R09_USER_B, HISABIQ_R09_JWT_B, HISABIQ_R09_SALE_B
 *
 * A: sale.invoice.view, sales.return.create, sales.return.view.
 * B: sale.invoice.view, neither return permission.
 * Both posted sales MUST pre-exist and appear in first 20 server invoice rows.
 * Never enable in a production Vite route or GitHub CI without real disposable PG.
 */
const assert = require('node:assert/strict');
const { spawn, spawnSync } = require('node:child_process');
const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

const ACK = 'disposable-pg16-read-only';
const API = 'http://127.0.0.1:3293';
const CONTAINER = 'hisabiq-mod009-read-pg16';
const DATABASE = 'hisabiq_mod009_sales_read_12';
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const fixturePort = '5197';
const fixtureOrigin = 'http://127.0.0.1:' + fixturePort;
const fixture = fixtureOrigin + '/tests/fixtures/connected-sales-real-read.html';
const repo = resolve(__dirname, '..');
const localApiPaths = new Set(['/health', '/api/v1/me', '/api/v1/sales', '/api/v1/sales-returns']);

function refuse(reason) {
  throw Error('Refusing real Sales read QA: ' + reason);
}
function settings() {
  if (process.env.HISABIQ_R09_REAL_READ_ACK !== ACK) {
    refuse('explicit disposable-PG16 read-only acknowledgement is missing');
  }
  if (process.env.HISABIQ_R09_REAL_API_ORIGIN !== API) {
    refuse('API origin must be the pinned localhost disposable test port');
  }
  if (process.env.HISABIQ_R09_REAL_PG_CONTAINER !== CONTAINER ||
      process.env.HISABIQ_R09_REAL_PG_DB !== DATABASE) {
    refuse('dedicated disposable PostgreSQL identity mismatch');
  }
  const identities = {};
  for (const who of ['a', 'b']) {
    const suffix = who.toUpperCase();
    const tenantId = process.env['HISABIQ_R09_TENANT_' + suffix];
    const userId = process.env['HISABIQ_R09_USER_' + suffix];
    const saleId = process.env['HISABIQ_R09_SALE_' + suffix];
    const token = process.env['HISABIQ_R09_JWT_' + suffix];
    if (![tenantId, userId, saleId].every(value =>
      typeof value === 'string' && ULID.test(value))) {
      refuse('valid seeded tenant, user and sale ULIDs are required');
    }
    if (typeof token !== 'string' || !/^[A-Za-z0-9._-]{32,8192}$/.test(token)) {
      refuse('valid signed disposable bearer tokens required');
    }
    identities[who] = { tenantId, userId, saleId, token };
  }
  for (const key of ['tenantId', 'userId', 'saleId']) {
    if (identities.a[key] === identities.b[key]) refuse('A/B identities must differ');
  }
  return identities;
}
function validateDisposablePodman() {
  const inspected = spawnSync('podman', [
    'inspect', '--format', '{{json .}}', CONTAINER,
  ], { encoding: 'utf8', timeout: 8000, maxBuffer: 2 * 1024 * 1024 });
  if (inspected.status !== 0 || !inspected.stdout) {
    refuse('dedicated PostgreSQL container is missing, unreachable or stopped');
  }
  let result;
  try { result = JSON.parse(inspected.stdout); }
  catch { refuse('invalid disposable container inspection'); }
  const image = result.Config?.Image ?? result.ImageName ?? '';
  const environment = result.Config?.Env ?? [];
  if (!result.State?.Running || !Array.isArray(environment) ||
      !environment.includes('POSTGRES_DB=' + DATABASE) ||
      !environment.includes('PG_MAJOR=16') ||
      !/(?:^|\/)postgres:16(?:[-@]|$)/.test(String(image))) {
    refuse('running, dedicated PostgreSQL 16 container/database not independently verified');
  }
}

const identities = settings();
validateDisposablePodman();
const { chromium } = require('playwright');

function allowedGet(path) {
  const u = new URL(path, API);
  const full = u.pathname;
  if (u.origin !== API || !(
    localApiPaths.has(full) ||
    /^\/api\/v1\/sales\/[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(full) ||
    /^\/api\/v1\/sales-returns\/returnable\/[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(full)
  )) {
    refuse('unlisted read endpoint');
  }
  return u;
}
async function backendGet(path, token) {
  const u = allowedGet(path);
  const response = await fetch(u, {
    method: 'GET', redirect: 'error',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    signal: AbortSignal.timeout(18_000),
  });
  const type = response.headers.get('content-type') || '';
  if (!/^application\/(?:[\w.-]+\+)?json(?:\s*;|\s*$)/i.test(type) &&
      u.pathname !== '/health') {
    refuse('non-JSON response from Nest read endpoint');
  }
  const raw = await response.text();
  if (raw.length > 2 * 1024 * 1024) refuse('oversized Nest read response');
  let data = null;
  try { data = JSON.parse(raw); }
  catch { if (u.pathname !== '/health') refuse('invalid JSON from Nest read endpoint'); }
  return { status: response.status, type, raw, data };
}
function assertHttp(result, status, label) {
  assert.equal(result.status, status, label + ' returned unexpected HTTP status');
}
function hasPermission(person, permission) {
  return person.permissions.includes(permission);
}
async function preflight() {
  const health = await backendGet('/health');
  assertHttp(health, 200, 'isolated Nest health');
  const results = {};
  for (const who of ['a', 'b']) {
    const person = identities[who];
    const me = await backendGet('/api/v1/me', person.token);
    assertHttp(me, 200, 'real /me ' + who);
    assert.equal(me.data?.data?.tenantId, person.tenantId, 'signed token tenant ' + who);
    assert.equal(me.data?.data?.user?.id, person.userId, 'signed token user ' + who);
    assert.ok(Array.isArray(me.data?.data?.permissions));
    const permissions = me.data.data.permissions;
    assert.ok(permissions.includes('sale.invoice.view'), 'sale.invoice.view required for both');
    if (who === 'a') {
      assert.ok(permissions.includes('sales.return.create') &&
        permissions.includes('sales.return.view'),
      'A must have BOTH independent permissions');
    } else {
      assert.equal(permissions.includes('sales.return.create'), false);
      assert.equal(permissions.includes('sales.return.view'), false);
    }
    const list = await backendGet('/api/v1/sales?limit=20', person.token);
    assertHttp(list, 200, 'source invoice list ' + who);
    assert.ok(Array.isArray(list.data?.items), 'Nest returns unwrapped items');
    const row = list.data.items.find(entry => entry.id === person.saleId);
    assert.ok(row && row.status === 'POSTED' && typeof row.number === 'string',
      'posted source invoice must be present in first 20 server rows: ' + who);
    const detail = await backendGet('/api/v1/sales/' + person.saleId, person.token);
    assertHttp(detail, 200, 'source invoice detail ' + who);
    assert.equal(detail.data?.data?.id, person.saleId);
    assert.equal(detail.data?.data?.number, row.number);
    assert.equal(detail.data?.data?.status, 'POSTED');
    assert.ok(Array.isArray(detail.data?.data?.lines) && detail.data.data.lines.length > 0,
      'genuine source invoice must have sold lines');
    if (!permissions.includes('inventory.cost.view')) {
      assert.equal(Object.hasOwn(detail.data.data, 'cogsMinor'), false);
      assert.equal(Object.hasOwn(detail.data.data, 'profitMinor'), false);
      assert.ok(detail.data.data.lines.every(line => !Object.hasOwn(line, 'costMinor')),
        'costs redacted for role without inventory.cost.view');
    }
    results[who] = { row, access: me.data.data };
  }
  const crossA = await backendGet('/api/v1/sales/' + identities.a.saleId, identities.b.token);
  const crossB = await backendGet('/api/v1/sales/' + identities.b.saleId, identities.a.token);
  assertHttp(crossA, 404, 'B cannot see A source invoice');
  assertHttp(crossB, 404, 'A cannot see B source invoice');

  const source = await backendGet('/api/v1/sales-returns/returnable/' +
    identities.a.saleId, identities.a.token);
  assertHttp(source, 200, 'A source returnability GET');
  assert.equal(source.data?.data?.saleId, identities.a.saleId);
  assert.ok(Array.isArray(source.data?.data?.lines), 'source returnability lines required');
  assert.ok(source.data.data.lines.length > 0, 'returnability fixture requires original lines');

  const history = await backendGet('/api/v1/sales-returns?limit=20', identities.a.token);
  assertHttp(history, 200, 'A return history GET');
  assert.ok(Array.isArray(history.data?.returns), 'Nest returns unwrapped return list');

  const bSource = await backendGet('/api/v1/sales-returns/returnable/' +
    identities.b.saleId, identities.b.token);
  const bHistory = await backendGet('/api/v1/sales-returns?limit=20', identities.b.token);
  assertHttp(bSource, 403, 'B cannot read returnability without return.create');
  assertHttp(bHistory, 403, 'B cannot read history without return.view');

  console.log('PASS R09 preflight: real signed tenant /me, invoice list/detail, ' +
    'cross-tenant 404, returnability/history 200 vs restricted 403');
  return results;
}
function send(route, body, status = 200) {
  return route.fulfill({ status, contentType: 'application/json',
    body: JSON.stringify(body) });
}
function userForBearer(request) {
  const auth = request.headers().authorization || '';
  return ['a', 'b'].find(w => auth === 'Bearer ' + identities[w].token) ?? null;
}
function intercept(page, log, violations, blocked) {
  page.route('**/*', route => {
    const request = route.request();
    const u = new URL(request.url());
    if (u.origin !== fixtureOrigin) {
      blocked.push(u.origin);
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
  page.route('**/api/v1/**', async route => {
    const request = route.request();
    const u = new URL(request.url());
    const path = u.pathname;
    const method = request.method();
    const who = userForBearer(request);
    try {
      assert.equal(u.origin, fixtureOrigin, 'API requests only on isolated Vite origin');
      log.push({ path, method, who });
      if (path === '/api/v1/auth/login' && method === 'POST') {
        const value = request.postDataJSON();
        const alias = value?.identifier === 'r09-real-read-a' ? 'a'
          : value?.identifier === 'r09-real-read-b' ? 'b' : null;
        assert.ok(alias && value?.password === 'test-only-password',
          'Only two known test-only synthetic auth choices');
        return await send(route, { data: {
          accessToken: identities[alias].token,
          refreshToken: 'r09-test-only-refresh-' + alias,
          user: { id: identities[alias].userId, username: 'r09-real-read-' + alias },
        } });
      }
      if (path === '/api/v1/auth/logout' && method === 'POST') {
        // Synthetic refresh invalidation ONLY; no real backend call.
        return await route.fulfill({ status: 204, body: '' });
      }
      assert.ok(who !== null, 'real signed disposable bearer required');
      assert.equal(method, 'GET', 'no business mutation may reach Nest');
      const detail = /^\/api\/v1\/sales\/([0-7][0-9A-HJKMNP-TV-Z]{25})$/.exec(path);
      const returnable = /^\/api\/v1\/sales-returns\/returnable\/([0-7][0-9A-HJKMNP-TV-Z]{25})$/.exec(path);
      if (detail) assert.equal(detail[1], identities[who].saleId,
        'browser may only select its own verified original source');
      if (returnable) {
        assert.equal(who, 'a', 'returnable GET restricted to role A');
        assert.equal(returnable[1], identities.a.saleId);
      }
      if (path === '/api/v1/sales-returns') assert.equal(who, 'a',
        'return-history GET restricted to authorized role A');
      assert.ok(path === '/api/v1/me' || path === '/api/v1/sales' ||
        detail || returnable || path === '/api/v1/sales-returns',
      'only verified read routes are forwarded');
      const nested = await backendGet(path + u.search, identities[who].token);
      return await route.fulfill({
        status: nested.status,
        contentType: nested.type || 'application/json',
        body: nested.raw,
      });
    } catch {
      // Do not print signed JWTs or raw errors/body/headers on failure.
      violations.push('Unexpected or failed read-only API route');
      return await send(route, { error: 'Isolated read-only API guard' }, 599).catch(() => {});
    }
  });
}
async function startFixtureVite() {
  const server = spawn(process.execPath, [
    'node_modules/vite/bin/vite.js', '--host', '127.0.0.1',
    '--port', fixturePort, '--strictPort',
  ], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, VITE_HISABIQ_INTEGRATION_MODE: 'preview' } });
  let output = '';
  server.stdout.on('data', data => { output = (output + data).slice(-4000); });
  server.stderr.on('data', data => { output = (output + data).slice(-4000); });
  for (let tries = 0; tries < 100; tries++) {
    if (server.exitCode !== null) refuse('isolated Vite unexpectedly exited');
    try {
      const response = await fetch(fixture, { signal: AbortSignal.timeout(750) });
      if (response.status === 200) return server;
    } catch { /* local-only server warming */ }
    await new Promise(done => setTimeout(done, 250));
  }
  server.kill('SIGTERM');
  refuse('isolated Vite did not become ready');
}
async function exercise(browser, width, preflightRecords) {
  const context = await browser.newContext({
    viewport: { width, height: 860 }, reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(25_000);
  const log = [];
  const violations = [];
  const blocked = [];
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  intercept(page, log, violations, blocked);
  const workspace = page.locator('[data-connected-sales-read-workspace]');
  try {
    await page.goto(fixture, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-real-session]').waitFor();
    assert.match((await page.locator('[data-real-session]').textContent()) || '',
      /Session:signed-out/);

    await page.locator('[data-real-login-a]').click();
    await page.getByText('Verified:' + preflightRecords.a.access.businessName).waitFor();
    const rowA = preflightRecords.a.row;
    await workspace.getByText(rowA.number).first().waitFor();
    await workspace.getByRole('button', { name: 'View original invoice: ' + rowA.number }).click();
    await workspace.locator('[data-connected-sales-invoice-lines]').waitFor();
    await workspace.getByRole('button', { name: /Review returnable source/ }).click();
    await workspace.locator('[data-sales-return-source-table]').waitFor();
    await workspace.getByRole('tab', { name: /Return history/ }).click();
    await workspace.getByText('Return value recorded').waitFor();

    await page.locator('[data-real-login-b]').click();
    await page.getByText('Verified:' + preflightRecords.b.access.businessName).waitFor();
    assert.equal(await workspace.getByRole('tab', { name: /Return source/ }).isDisabled(), true);
    assert.equal(await workspace.getByRole('tab', { name: /Return history/ }).isDisabled(), true);
    await workspace.getByRole('tab', { name: /Invoices/ }).click();
    const rowB = preflightRecords.b.row;
    await workspace.getByText(rowB.number).first().waitFor();
    assert.equal(await workspace.getByText(rowA.number).count(), 0,
      'A invoice must disappear when B logs in');
    await workspace.getByRole('button', { name: 'View original invoice: ' + rowB.number }).click();
    await workspace.locator('[data-connected-sales-invoice-lines]').waitFor();
    assert.equal(await workspace.getByRole('button',
      { name: /Review returnable source/ }).count(), 0);
    if (!hasPermission(preflightRecords.b.access, 'inventory.cost.view')) {
      assert.equal(await workspace.getByText('Recorded cost').count(), 0);
      assert.equal(await workspace.getByText('Recorded profit').count(), 0);
    }
    assert.deepEqual(violations, [], 'no unauthorized or unexpected Nest request');
    assert.deepEqual(pageErrors, [], 'no unhandled React browser error');
    assert.ok(blocked.every(entry => entry !== fixtureOrigin),
      'external browser resources must remain blocked');
    const readCalls = log.filter(row => row.path.startsWith('/api/v1/sales'));
    assert.ok(readCalls.length >= 6, 'rendered real Sales list/detail/returns GET coverage');
    assert.ok(readCalls.every(row => row.method === 'GET'));
    assert.equal(readCalls.some(row => row.who === 'b' &&
      row.path.startsWith('/api/v1/sales-returns')), false);
    assert.ok(readCalls.some(row => row.who === 'a' &&
      row.path.startsWith('/api/v1/sales-returns/returnable/')));
    assert.ok(readCalls.some(row => row.who === 'a' &&
      row.path === '/api/v1/sales-returns'));
    console.log('PASS R09 REAL-NEST Sales read React @' + width +
      'px: genuine Nest GET list/detail/source/history, tenant isolation and roles (' +
      readCalls.length + ' read requests)');
  } finally { await context.close(); }
}
async function main() {
  const preflightRecords = await preflight();
  let server;
  let browser;
  try {
    server = await startFixtureVite();
    const bin = process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
      (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
    browser = await chromium.launch({
      headless: true, executablePath: bin, args: ['--no-sandbox'],
    });
    await exercise(browser, 1280, preflightRecords);
    await exercise(browser, 390, preflightRecords);
    console.log('PASS R09 real signed-tenant GET acceptance; no business writes or route activation');
  } finally {
    await browser?.close();
    server?.kill('SIGTERM');
  }
}
main().catch(() => {
  // Credentials, response bodies, request headers and raw framework stack
  // traces are intentionally suppressed in this test-only terminal output.
  console.error('R09_REAL_SALES_READ_QA_RED: preflight/browser acceptance failed; see safe guards');
  process.exitCode = 1;
});
