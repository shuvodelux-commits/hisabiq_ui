/* MOD-006 T02-F1: disposable signed React→Nest→PG16 BANK POST acceptance.
 * Run ONLY with a fresh dedicated tmpfs PostgreSQL16 + local Nest API.
 * A test-only Vite route imports the unmounted coordinator; the real Counter
 * remains protected and no production UI route/source is modified.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { chromium } = require('playwright');

const ACK = 'MOD006_T02F1_DISPOSABLE_20261115';
const API = 'http://127.0.0.1:55797';
const DB = 'hisabiq_mod006_t02f1_20261115';
const CONTAINER = 'hisabiq-mod006-t02f1-pg-20261115';
const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ulid = () => '0' + [...crypto.randomBytes(25)].map(x => alphabet[x % 32]).join('');
const validId = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
function refuse(message) { throw Error('T02-F1 DISPOSABLE ONLY: ' + message); }

function verifyIsolation() {
  if (process.env.MOD006_T02F1_ACK !== ACK ||
      process.env.MOD006_T02F1_API_ORIGIN !== API ||
      process.env.MOD006_T02F1_PG_DB !== DB ||
      process.env.MOD006_T02F1_PG_CONTAINER !== CONTAINER) {
    refuse('required exact acknowledgement, API and PG identity not supplied');
  }
  const result = spawnSync('podman', ['inspect', '--format', '{{json .}}', CONTAINER],
    { encoding: 'utf8', timeout: 9000 });
  if (result.status !== 0 || !result.stdout) refuse('disposable PostgreSQL container absent');
  let info;
  try { info = JSON.parse(result.stdout); }
  catch { refuse('invalid PostgreSQL inspection'); }
  const env = info.Config?.Env || [];
  if (!info.State?.Running || !env.includes('POSTGRES_DB=' + DB) ||
      !env.includes('PG_MAJOR=16') ||
      !/postgres:16-alpine/.test(info.Config?.Image || info.ImageName || '')) {
    refuse('PostgreSQL16 tmpfs instance/database mismatch');
  }
  const mounts = info.Mounts || [];
  const tmpfs = info.HostConfig?.Tmpfs || {};
  if (!Object.keys(tmpfs).includes('/var/lib/postgresql/data') &&
      !mounts.some(m => m.Type === 'tmpfs' && m.Destination === '/var/lib/postgresql/data')) {
    refuse('database data directory must be tmpfs');
  }
}

async function api(path, method = 'GET', body, token) {
  const allowed = path.startsWith('/api/v1/') || path.startsWith('/api/v2/parties/');
  if (!allowed) refuse('unlisted API path');
  const res = await fetch(API + path, {
    method, redirect: 'error',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(method === 'POST' && !path.startsWith('/api/v1/auth/')
        ? { 'Idempotency-Key': body?.operationId || ulid() } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });
  const raw = await res.json();
  return { status: res.status, body: raw };
}
function status(result, code, label) {
  assert.equal(result.status, code, label + ': ' + JSON.stringify(result.body?.error || {}));
  return result.body;
}
async function setup() {
  status(await api('/api/v1/me'), 401, 'Nest must demand a signed bearer');
  const suffix = crypto.randomBytes(4).toString('hex');
  const identifier = 't02f1-' + suffix + '@disposable.invalid';
  const password = 'T02fOnlyPassw0rd!1';
  const otp = status(await api('/api/v1/auth/registration/otp', 'POST',
    { identifier }), 200, 'real OTP');
  assert.match(otp.data.devCode, /^\d{6}$/, 'real disposable development OTP required');
  const registration = status(await api('/api/v1/auth/registration', 'POST', {
    identifier, otpCode: otp.data.devCode, username: 't02f1' + suffix,
    businessName: 'T02F1 Disposable Browser', password, pin: '472906',
  }), 201, 'real Nest registration');
  const login = status(await api('/api/v1/auth/login', 'POST', { identifier, password }),
    200, 'real signed session');
  const token = login.data.accessToken;
  const me = status(await api('/api/v1/me', 'GET', undefined, token), 200, 'signed /me');
  assert.equal(me.data.tenantId, registration.data.tenant.id);
  assert.ok(me.data.permissions.includes('sale.payment.record'), 'real cashier permission');
  assert.ok(me.data.permissions.includes('bank.account.view'), 'real BANK viewer permission');
  status(await api('/api/v1/settings/value', 'POST',
    { key: 'bank_accounts_enabled', value: 'on' }, token), 201, 'BANK settings');
  const operationId = ulid();
  const bank = status(await api('/api/v1/money/accounts', 'POST', {
    name: 'T02-F1 BANK', type: 'BANK', holderName: null, reference: null,
    isDrawer: false, openingAmountMinor: 50000, openingDate: '2026-01-01',
    operationId,
  }, token), 201, 'real BANK opening').data.id;
  const party = status(await api('/api/v1/parties', 'POST', {
    name: 'T02-F1 Customer', roles: ['CUSTOMER'], phone: '01712345678',
    address: null, guardianName: null, nid: null, email: null, notes: null,
    customerGroupId: null, creditLimitMinor: null,
  }, token), 201, 'real customer Party').data.id;
  assert.match(bank, validId); assert.match(party, validId);
  const accounts = status(await api('/api/v1/money/accounts', 'GET', undefined, token),
    200, 'baseline account list');
  assert.equal(accounts.accounts.find(x => x.id === bank)?.balanceMinor, 50000);
  const customer = status(await api('/api/v2/parties/' + party + '?role=CUSTOMER',
    'GET', undefined, token), 200, 'baseline Party');
  assert.equal(customer.data.balance.netMinor, 0);
  return { identifier, password, token, bank, party, tenant: me.data.tenantId, operationId: ulid() };
}
async function run() {
  verifyIsolation(); // MUST execute before registering users or posting money.
  const fixture = await setup();
  const { createServer } = await import('vite');
  const vite = await createServer({
    logLevel: 'error',
    server: {
      host: '127.0.0.1', port: 0, strictPort: false, hmr: false,
      proxy: {
        '/api/v1': { target: API, changeOrigin: false },
        '/api/v2': { target: API, changeOrigin: false },
      },
    },
  });
  await vite.listen();
  const port = vite.httpServer.address().port;
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 }, hasTouch: true,
      reducedMotion: 'reduce',
    });
    const posts = [];
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('request', req => {
      const path = new URL(req.url()).pathname;
      if (req.method() !== 'GET' && /^\/api\/v1\/(customer-payments|suppliers\/payments|money\/movements)$/.test(path)) {
        posts.push({ method: req.method(), path, key: req.headers()['idempotency-key'] });
      }
    });
    await page.route('**/__mod006_t02f1_signed_browser', route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="UTF-8"></head><body><div id="root"></div>' +
        '<script type="module">import RefreshRuntime from "/@react-refresh";' +
        'RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$=()=>{};' +
        'window.$RefreshSig$=()=>(type)=>type;' +
        'window.__vite_plugin_react_preamble_installed__=true;</script>' +
        '<script type="module" src="/tests/mod006CounterConnectedPostHarness.tsx"></script>' +
        '</body></html>',
    }));
    await page.goto('http://127.0.0.1:' + port + '/__mod006_t02f1_signed_browser');
    await page.locator('#t02f-session[data-status="signed-out"]').waitFor();
    assert.equal(await page.locator('#t02f-post').isDisabled(), true);
    assert.equal(posts.length, 0);

    await page.locator('#t02f-identifier').fill(fixture.identifier);
    await page.locator('#t02f-password').fill(fixture.password);
    await page.locator('#t02f-login').click();
    await page.locator('#t02f-session[data-status="authenticated"]').waitFor();
    assert.equal(await page.locator('#t02f-session').getAttribute('data-tenant'), fixture.tenant);
    await page.locator('#t02f-party').fill(fixture.party);
    await page.locator('#t02f-account').fill(fixture.bank);
    await page.locator('#t02f-operation').fill(fixture.operationId);

    for (const selector of ['#t02f-discount', '#t02f-split']) {
      await page.locator(selector).click();
      await page.locator('#t02f-result[data-status="error"]').waitFor();
      assert.equal(posts.length, 0, 'unsupported settlement must not POST');
      assert.equal(await page.locator('#t02f-operation').inputValue(), fixture.operationId);
    }

    await page.locator('#t02f-post').click();
    await page.locator('#t02f-result[data-status="posted"]').waitFor({ timeout: 30000 });
    const firstId = await page.locator('#t02f-result').getAttribute('data-payment-id');
    assert.match(firstId, validId);
    assert.equal(await page.locator('#t02f-result').getAttribute('data-bank-balance'), '52350');
    assert.equal(await page.locator('#t02f-result').getAttribute('data-party-balance'), '-2350');
    assert.equal(posts.length, 1);
    assert.deepEqual(posts[0], {
      method: 'POST', path: '/api/v1/customer-payments', key: fixture.operationId,
    });

    const after = status(await api('/api/v1/money/accounts', 'GET', undefined, fixture.token),
      200, 'source account refetch');
    assert.equal(after.accounts.find(x => x.id === fixture.bank)?.balanceMinor, 52350);
    const party = status(await api('/api/v2/parties/' + fixture.party + '?role=CUSTOMER',
      'GET', undefined, fixture.token), 200, 'source Party refetch');
    assert.equal(party.data.balance.netMinor, -2350);

    // Exact same key + body replay via actual keyboard activation (never auto-retry).
    await page.setViewportSize({ width: 1280, height: 850 });
    await page.locator('#t02f-post').focus();
    await page.keyboard.press('Enter');
    await page.locator('#t02f-result[data-status="posted"]').waitFor({ timeout: 30000 });
    assert.equal(await page.locator('#t02f-result').getAttribute('data-payment-id'), firstId);
    assert.equal(posts.length, 2);
    assert.deepEqual(posts[1], posts[0], 'caller key and original Nest endpoint retained');
    const replay = status(await api('/api/v1/money/accounts', 'GET', undefined, fixture.token),
      200, 'idempotent account refetch');
    assert.equal(replay.accounts.find(x => x.id === fixture.bank)?.balanceMinor, 52350);

    await page.locator('#t02f-logout').click();
    await page.locator('#t02f-session[data-status="signed-out"]').waitFor();
    assert.equal(await page.locator('#t02f-post').isDisabled(), true);
    assert.equal(posts.length, 2);
    assert.deepEqual(pageErrors, []);
    console.log('T02-F1 PASS: real registered signed React mobile BANK POST→Nest→PG16, source reread, exact-key keyboard replay, split/discount/logout blocked; 2 manual HTTP POSTs, 1 source settlement');
  } finally {
    await browser?.close();
    await vite.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
