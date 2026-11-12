/* MOD-000-A F0-07: disposable CI-only real React -> Nest authentication.
 * No test account is seeded via SQL. No retained database or production origin.
 * No token/password/OTP is logged. The PG16 service is owned by the CI job.
 */
const assert = require('node:assert/strict');
const path = require('node:path');
const { existsSync } = require('node:fs');
const { spawn, execFileSync } = require('node:child_process');
const { createRequire } = require('node:module');
const { setTimeout: delay } = require('node:timers/promises');

const API_ORIGIN = 'http://127.0.0.1:3000';
const CONNECTED_ORIGIN = 'http://127.0.0.1:5173';
const PREVIEW_ORIGIN = 'http://127.0.0.1:5174';
const SESSION_KEY = 'hisabiq.live.session.v1';
const PG_HOST = '127.0.0.1';
const PG_DB = 'hisabiq_foundation_test';
const USER_A = {
  identifier: '01711000245', username: 'fixture_owner_a',
  businessName: 'Fixture Electrical A', password: 'TestPassw0rd23',
  pin: '123456',
};
const USER_B = {
  identifier: '01711000246', username: 'fixture_owner_b',
  businessName: 'Fixture Hardware B', password: 'TestPassw0rd23',
  pin: '4821',
};

function enforceDisposableEnvironment() {
  assert.equal(process.env.GITHUB_ACTIONS, 'true', 'F0-07 is CI-only; no retained desktop DB');
  assert.equal(process.env.CI, 'true', 'F0-07 must run as a CI job');
  assert.equal(process.env.NODE_ENV, 'test', 'API must not run in production mode');
  const urls = [
    ['ADMIN_DATABASE_URL', 'postgres'],
    ['DATABASE_URL', 'sher_app'],
  ];
  for (const [name, role] of urls) {
    const value = process.env[name];
    assert.ok(value, name + ' is required');
    const url = new URL(value);
    assert.equal(url.protocol, 'postgres:');
    assert.equal(url.hostname, PG_HOST);
    assert.equal(url.port, '5432');
    assert.equal(url.pathname, '/' + PG_DB);
    assert.equal(decodeURIComponent(url.username), role);
  }
  assert.equal(process.env.IDENTITY_VERIFIER, 'dev');
  assert.equal(process.env.SINGLE_TENANT_MODE, 'false');
  assert.equal(process.env.ENTITLEMENT_SOURCE, 'subscription');
  assert.equal(process.env.WEB_ORIGIN, CONNECTED_ORIGIN);
  assert.equal(process.env.PORT, '3000');
  assert.ok((process.env.JWT_SECRET || '').length >= 32);
  assert.ok(process.env.BACKEND_NODE_BIN, 'Pinned backend Node 20 executable required');
  assert.equal(process.env.APPROVED_BACKEND_SHA?.length, 40);
  const root = path.resolve(process.env.BACKEND_ROOT || '');
  const frontend = path.resolve(process.env.FRONTEND_ROOT || '');
  assert.ok(existsSync(path.join(root, 'apps/api/package.json')));
  assert.ok(existsSync(path.join(frontend, 'vite.config.ts')));
  const actual = execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  assert.equal(actual, process.env.APPROVED_BACKEND_SHA, 'Backend checkout must match pinned SHA');
  assert.ok(existsSync(path.join(root, 'apps/api/dist/main.js')), 'Compiled backend is required');
  console.log('F0-07 isolated runner authorized: exact backend SHA and job-local PG16 database checked');
  return { root, frontend };
}

async function initializeDisposableDatabase(root) {
  const backendRequire = createRequire(path.join(root, 'apps/api/package.json'));
  const { createPool, runMigrations } = backendRequire('@sher/adapter-postgres');
  const admin = createPool(process.env.ADMIN_DATABASE_URL);
  try {
    await admin.query(
      "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sher_app') THEN CREATE ROLE sher_app LOGIN PASSWORD 'sher_app_test'; END IF; END $$"
    );
    await runMigrations(admin, path.join(root, 'migrations'));
    await admin.query('GRANT USAGE ON SCHEMA public TO sher_app');
    await admin.query('GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public TO sher_app');
  } finally {
    await admin.end();
  }
  console.log('F0-07 disposable schema initialized; backend RLS role is unprivileged');
}

async function waitForHealth(origin, child) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('Nest API exited before /health');
    try {
      const response = await fetch(origin + '/health', { signal: AbortSignal.timeout(1200) });
      if (response.status === 200) return;
    } catch { /* not ready yet */ }
    await delay(250);
  }
  throw new Error('Nest /health did not become ready within 30 seconds');
}

async function jsonRequest(pathname, body, accessToken) {
  const response = await fetch(API_ORIGIN + pathname, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(8_000),
    redirect: 'manual',
  });
  const parsed = response.status === 204 ? null : await response.json().catch(() => null);
  return { status: response.status, data: parsed?.data, error: parsed?.error };
}

function requireSuccess(response, code, label) {
  assert.equal(response.status, code, label + ' returned unexpected HTTP status ' + response.status);
  assert.ok(response.data && typeof response.data === 'object', label + ' returned no data');
  return response.data;
}

async function registerViaRealApi(user) {
  const challenge = requireSuccess(
    await jsonRequest('/api/v1/auth/registration/otp', { identifier: user.identifier }),
    200, 'request disposable OTP',
  );
  assert.match(challenge.devCode, /^[0-9]{6}$/, 'CI dev verifier must return six digits');
  const created = requireSuccess(
    await jsonRequest('/api/v1/auth/registration', {
      identifier: user.identifier,
      otpCode: challenge.devCode,
      businessName: user.businessName,
      username: user.username,
      password: user.password,
      pin: user.pin,
    }),
    201, 'create disposable shop user',
  );
  assert.match(created.tenant.id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  assert.match(created.user.id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  assert.ok(typeof created.refreshToken === 'string');
  return created;
}

async function verifyServerIdentity(created) {
  const data = requireSuccess(
    await jsonRequest('/api/v1/me', undefined, created.accessToken),
    200, 'server-authoritative /me',
  );
  assert.equal(data.user.id, created.user.id);
  assert.equal(data.tenantId, created.tenant.id);
  assert.ok(typeof data.timezone === 'string');
  new Intl.DateTimeFormat('en', { timeZone: data.timezone });
  assert.ok(Array.isArray(data.permissions));
  assert.ok(Array.isArray(data.features));
  return data;
}

async function exerciseRealBrowser(createServer, chromium, frontendRoot, tenantA, tenantB) {
  const savedMode = process.env.VITE_HISABIQ_INTEGRATION_MODE;
  let connected;
  let preview;
  let browser;
  try {
    process.env.VITE_HISABIQ_INTEGRATION_MODE = 'connected';
    connected = await createServer({
      root: frontendRoot,
      configFile: path.join(frontendRoot, 'vite.config.ts'),
      server: { host: '127.0.0.1', port: 5173, strictPort: true },
    });
    await connected.listen();
    process.env.VITE_HISABIQ_INTEGRATION_MODE = 'preview';
    preview = await createServer({
      root: frontendRoot,
      configFile: path.join(frontendRoot, 'vite.config.ts'),
      server: { host: '127.0.0.1', port: 5174, strictPort: true },
    });
    await preview.listen();

    browser = await chromium.launch({ args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on('pageerror', error => runtimeErrors.push(error.message));

    await page.goto(CONNECTED_ORIGIN + '/#/app/pos');
    await page.getByRole('heading', { name: /Sign in/i }).waitFor();
    assert.match(page.url(), /#\/login/, 'connected POS route must require live login');
    assert.equal(await page.getByText('Nusrat Jahan', { exact: true }).count(), 0);

    await page.getByLabel('Mobile number').fill(USER_A.identifier);
    await page.getByLabel('Password', { exact: true }).fill(USER_A.password);
    await page.getByRole('button', { name: /^Sign in$/ }).click();
    await page.getByText('Workspace access pending', { exact: false }).waitFor({ timeout: 15_000 });
    const credential1 = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key) || 'null'), SESSION_KEY);
    assert.equal(credential1?.schema, 1);
    assert.ok(typeof credential1.refreshToken === 'string');
    const localDump = await page.evaluate(() => JSON.stringify(Object.entries(localStorage)));
    assert.ok(!localDump.includes(credential1.refreshToken));

    await page.goto(CONNECTED_ORIGIN + '/#/app/settings');
    await page.getByText('Workspace access pending', { exact: false }).waitFor();
    assert.equal(await page.locator('[data-erp-table]').count(), 0, 'Never mount preview business data in connected mode');

    await page.reload();
    await page.getByText('Workspace access pending', { exact: false }).waitFor();
    const credential2 = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key) || 'null'), SESSION_KEY);
    assert.equal(credential2?.schema, 1);
    assert.notEqual(credential2.refreshToken, credential1.refreshToken, 'reload must rotate refresh');

    await page.goto(CONNECTED_ORIGIN + '/#/login/accounts?account=nusrat');
    await page.getByRole('heading', { name: /Choose account/i }).waitFor();
    assert.equal(await page.getByText('Nusrat Jahan', { exact: true }).count(), 0);
    assert.equal(await page.getByText(USER_B.username, { exact: true }).count(), 0);
    await page.goto(CONNECTED_ORIGIN + '/#/login/pin?account=nusrat');
    await page.getByLabel('Enter your 6-digit PIN').fill(USER_A.pin);
    await page.getByRole('button', { name: /^Sign in$/ }).click();
    await page.getByText('Workspace access pending', { exact: false }).waitFor({ timeout: 15_000 });
    const credential3 = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key) || 'null'), SESSION_KEY);
    assert.notEqual(credential3.refreshToken, credential2.refreshToken, 'PIN must rotate session');

    const other = await jsonRequest('/api/v1/auth/login/pin', {
      refreshToken: tenantB.refreshToken, pin: USER_B.pin,
    });
    const legacy = requireSuccess(other, 200, 'backend legacy four-digit PIN');
    assert.equal(legacy.user.id, tenantB.user.id);
    const loggedOut = await jsonRequest('/api/v1/auth/logout', {
      refreshToken: legacy.refreshToken,
    });
    assert.equal(loggedOut.status, 204, 'logout must return HTTP 204');

    const previewContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const previewPage = await previewContext.newPage();
    const previewApiRequests = [];
    await previewPage.route('**/api/v1/**', route => {
      previewApiRequests.push(route.request().url());
      return route.abort();
    });
    await previewPage.goto(PREVIEW_ORIGIN + '/#/login');
    await previewPage.getByRole('heading', { name: /Sign in/i }).waitFor();
    await previewPage.goto(PREVIEW_ORIGIN + '/#/app/dashboard');
    await previewPage.getByRole('button', { name: 'Calculator', exact: true }).waitFor();
    assert.deepEqual(previewApiRequests, [], 'preview must never call live authentication API');
    await previewContext.close();
    assert.deepEqual(runtimeErrors, [], 'connected app must have no page runtime errors');
    console.log('F0-07 PASS real Nest/PG16: two tenant identities, login, /me, refresh, PIN, connected workspace gate, preview isolation');
    await context.close();
  } finally {
    process.env.VITE_HISABIQ_INTEGRATION_MODE = savedMode;
    await browser?.close().catch(() => undefined);
    await preview?.close().catch(() => undefined);
    await connected?.close().catch(() => undefined);
  }
}

async function stopChild(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([
    new Promise(resolve => child.once('exit', resolve)),
    delay(2500),
  ]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

async function main() {
  const { root, frontend } = enforceDisposableEnvironment();
  await initializeDisposableDatabase(root);

  let api;
  try {
    api = spawn(process.env.BACKEND_NODE_BIN, [path.join(root, 'apps/api/dist/main.js')], {
      cwd: path.join(root, 'apps/api'),
      env: { ...process.env, VITE_HISABIQ_INTEGRATION_MODE: undefined },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    // Suppress server logs; never expose any test-only OTP/token or DB credentials.
    api.stdout.on('data', () => undefined);
    api.stderr.on('data', () => undefined);
    await waitForHealth(API_ORIGIN, api);

    const tenantA = await registerViaRealApi(USER_A);
    const tenantB = await registerViaRealApi(USER_B);
    assert.notEqual(tenantA.tenant.id, tenantB.tenant.id);
    const profileA = await verifyServerIdentity(tenantA);
    const profileB = await verifyServerIdentity(tenantB);
    assert.notEqual(profileA.tenantId, profileB.tenantId);
    console.log('F0-07 real server identity isolation: two tenants verified');

    const { createServer } = await import('vite');
    const { chromium } = require('playwright');
    await exerciseRealBrowser(createServer, chromium, frontend, tenantA, tenantB);
  } finally {
    await stopChild(api);
  }
}
main().catch(error => {
  // Error messages contain check labels only, not request or credential bodies.
  console.error('F0-07 FAILED:', error.message);
  process.exitCode = 1;
});
