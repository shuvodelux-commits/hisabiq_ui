/* MOD-006 T02-F2 — authenticated React MFS supplier settlement, actual Nest + PG16.
 * Test-only isolated route. Explicit disposable DB/container identity, signed
 * login and real source API results are mandatory. Production Counter stays gated.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { chromium } = require('playwright');
const API = 'http://127.0.0.1:55821';
const CONTAINER = 'hisabiq-mod006-t02f2-pg-20261115';
const DB = 'hisabiq_mod006_t02f2_20261115';
const ACK = 'MOD006_T02F2_DISPOSABLE_20261115';
const letters = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const id = () => '0' + [...crypto.randomBytes(25)].map(x => letters[x % letters.length]).join('');
const isId = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
function refuse(message) { throw Error('MOD006 T02-F2 DISPOSABLE ONLY: ' + message); }
function guard() {
  if (process.env.MOD006_T02F2_ACK !== ACK ||
      process.env.MOD006_T02F2_ORIGIN !== API ||
      process.env.MOD006_T02F2_DB !== DB ||
      process.env.MOD006_T02F2_CONTAINER !== CONTAINER) {
    refuse('exact disposable acknowledgement, loopback API and database identity required');
  }
  const result = spawnSync('podman', ['inspect', '--format', '{{json .}}', CONTAINER], {
    encoding: 'utf8', timeout: 8000, maxBuffer: 2 * 1024 * 1024,
  });
  if (result.status !== 0 || !result.stdout) refuse('PG16 container is not running');
  let info;
  try { info = JSON.parse(result.stdout); }
  catch { refuse('PG16 inspection invalid'); }
  const env = info.Config?.Env || [];
  const tmpfs = info.HostConfig?.Tmpfs || {};
  if (!info.State?.Running || !env.includes('POSTGRES_DB=' + DB) ||
      !env.includes('PG_MAJOR=16') ||
      !/postgres:16-alpine/.test(info.Config?.Image || info.ImageName || '') ||
      (!Object.keys(tmpfs).includes('/var/lib/postgresql/data') &&
       !info.Mounts?.some(m => m.Type === 'tmpfs' && m.Destination === '/var/lib/postgresql/data'))) {
    refuse('expected dedicated tmpfs PostgreSQL16/database not verified');
  }
}
async function api(path, method = 'GET', body, token) {
  if (!/^\/api\/v1\/[a-z0-9/-]+$/.test(path.split('?')[0]) &&
      !/^\/api\/v2\/parties\/[0-7][0-9A-HJKMNP-TV-Z]{25}\?role=SUPPLIER$/.test(path)) {
    refuse('unapproved test API path');
  }
  process.stdout.write('T02-F2 request ' + method + ' ' + path.split('?')[0] + '\n');
  const res = await fetch(API + path, {
    method, redirect: 'error',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(method === 'POST' && !path.startsWith('/api/v1/auth/')
        ? { 'Idempotency-Key': body?.operationId || id() } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  return { status: res.status, body: await res.json() };
}
function ok(result, expected, name) {
  assert.equal(result.status, expected, name + ' ' + JSON.stringify(result.body?.error || {}));
  return result.body;
}
async function register(label) {
  const suffix = crypto.randomBytes(4).toString('hex');
  const identifier = 't02f2-' + label + '-' + suffix + '@isolated.invalid';
  const password = 'T02f2OnlyPassw0rd!1';
  const otp = ok(await api('/api/v1/auth/registration/otp', 'POST',
    { identifier }), 200, label + ' OTP');
  assert.match(otp.data.devCode, /^\d{6}$/);
  const signup = ok(await api('/api/v1/auth/registration', 'POST', {
    identifier, otpCode: otp.data.devCode,
    username: 't02f2' + label + suffix, businessName: 'T02F2 Synthetic ' + label,
    password, pin: '472906',
  }), 201, label + ' signup');
  const login = ok(await api('/api/v1/auth/login', 'POST', {
    identifier, password,
  }), 200, label + ' login');
  const token = login.data.accessToken;
  const me = ok(await api('/api/v1/me', 'GET', undefined, token), 200, label + ' /me');
  assert.equal(me.data.tenantId, signup.data.tenant.id);
  assert.ok(me.data.permissions.includes('purchase.payment.record'));
  assert.ok(me.data.permissions.includes('party.supplier.view'));
  assert.ok(me.data.permissions.includes('bank.account.view'));
  return { identifier, password, token, tenant: me.data.tenantId };
}
async function party(owner, label) {
  const data = ok(await api('/api/v1/parties', 'POST', {
    name: 'T02-F2 ' + label, roles: ['SUPPLIER'], phone: '01712345678',
    address: null, guardianName: null, nid: null, email: null, notes: null,
    customerGroupId: null, creditLimitMinor: null,
  }, owner.token), 201, 'real ' + label + ' Party');
  assert.match(data.data.id, isId);
  return data.data.id;
}
async function seed() {
  ok(await api('/api/v1/me'), 401, 'signed Nest API must be protected');
  const a = await register('a');
  const b = await register('b');
  assert.notEqual(a.tenant, b.tenant);
  ok(await api('/api/v1/settings/value', 'POST', {
    key: 'bank_accounts_enabled', value: 'on',
  }, a.token), 201, 'enable MFS');
  const mfs = ok(await api('/api/v1/money/accounts', 'POST', {
    name: 'T02F2 actual mobile wallet', type: 'MFS', holderName: null,
    reference: null, isDrawer: false, openingAmountMinor: 40000,
    openingDate: '2026-01-01', operationId: id(),
  }, a.token), 201, 'real MFS account').data.id;
  assert.match(mfs, isId);
  const supplier = await party(a, 'A supplier');
  const otherSupplier = await party(b, 'B supplier');
  const catalog = ok(await api('/api/v1/catalog', 'GET', undefined, a.token),
    200, 'signup-provisioned catalog');
  const piece = catalog.data.units.find(row => row.name === 'Piece');
  assert.ok(piece && isId.test(piece.id), 'real signup-provisioned Piece unit required');
  const product = ok(await api('/api/v1/products', 'POST', {
    name: 'T02F2 trade bolt', baseUnitId: piece.id,
    purchasePriceMinor: 10000, sellingPriceMinor: 12000, minStockQty: 0,
    brandId: null, categoryId: null, sku: null, barcode: null,
    description: null, defaultDiscountType: null, defaultDiscountValue: null,
    offerEnabled: false, offerPriceMinor: null, offerStartDate: null,
    offerEndDate: null, tracksExpiry: false, tracksSerial: false,
    conversionUnitId: null, conversionFactorQty: null,
  }, a.token), 201, 'product');
  ok(await api('/api/v1/purchases', 'POST', {
    supplierPartyId: supplier,
    lines: [{ productId: product.data.id, qty: 10000, unitPriceMinor: 10000 }],
    discountMinor: 0, paidMinor: 0, paidAccountCode: null,
  }, a.token), 201, 'unpaid credit purchase');
  const accounts = ok(await api('/api/v1/money/accounts', 'GET', undefined, a.token),
    200, 'source MFS list');
  assert.equal(accounts.accounts.find(x => x.id === mfs)?.balanceMinor, 40000);
  const before = ok(await api('/api/v2/parties/' + supplier + '?role=SUPPLIER',
    'GET', undefined, a.token), 200, 'source supplier detail');
  assert.equal(before.data.balance.netMinor, -100000);
  const foreign = await api('/api/v2/parties/' + supplier + '?role=SUPPLIER',
    'GET', undefined, b.token);
  assert.equal(foreign.status, 404, 'other tenant must not read supplier');
  return { a, b, mfs, supplier, otherSupplier, key: id() };
}
async function run() {
  guard(); // Never start a fixture writer without proving the disposable boundary.
  const fixture = await seed();
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
  const origin = 'http://127.0.0.1:' + vite.httpServer.address().port;
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 },
      hasTouch: true, reducedMotion: 'reduce' });
    page.setDefaultTimeout(15000);
    const posts = [];
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => {
      if (r.method() === 'POST' &&
          new URL(r.url()).pathname === '/api/v1/suppliers/payments') {
        posts.push({ key: r.headers()['idempotency-key'], path: new URL(r.url()).pathname });
      }
    });
    await page.route('**/__mod006_t02f2_supplier_mfs_browser', route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="UTF-8"></head><body><div id="root"></div>' +
        '<script type="module">import RefreshRuntime from "/@react-refresh";' +
        'RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$=()=>{};' +
        'window.$RefreshSig$=()=>(type)=>type;' +
        'window.__vite_plugin_react_preamble_installed__=true;</script>' +
        '<script type="module" src="/tests/mod006SupplierMfsConnectedPostHarness.tsx"></script>' +
        '</body></html>',
    }));
    await page.goto(origin + '/__mod006_t02f2_supplier_mfs_browser');
    await page.locator('#f2-session[data-status="signed-out"]').waitFor();
    assert.equal(await page.locator('#f2-post').isDisabled(), true);
    await page.locator('#f2-identifier').fill(fixture.a.identifier);
    await page.locator('#f2-password').fill(fixture.a.password);
    await page.locator('#f2-login').click();
    await page.locator('#f2-session[data-status="authenticated"]').waitFor();
    assert.equal(await page.locator('#f2-session').getAttribute('data-tenant'), fixture.a.tenant);
    await page.locator('#f2-party').fill(fixture.supplier);
    await page.locator('#f2-foreign').fill(fixture.otherSupplier);
    await page.locator('#f2-account').fill(fixture.mfs);
    await page.locator('#f2-operation').fill(fixture.key);

    for (const selector of ['#f2-split', '#f2-discount', '#f2-cash', '#f2-foreign-party']) {
      const previous = Number(await page.locator('#f2-result').getAttribute('data-completed'));
      await page.locator(selector).click();
      await page.locator('#f2-result[data-status="error"][data-completed="' + (previous + 1) + '"]').waitFor();
      assert.equal(posts.length, 0, selector + ' cannot cause supplier POST');
      assert.equal(await page.locator('#f2-operation').inputValue(), fixture.key);
    }

    const awaitSupplierResponse = () => page.waitForResponse(r =>
      new URL(r.url()).pathname === '/api/v1/suppliers/payments' &&
      r.request().method() === 'POST', { timeout: 30000 });
    const firstResponse = awaitSupplierResponse();
    const previous = Number(await page.locator('#f2-result').getAttribute('data-completed'));
    await page.locator('#f2-post').click();
    const postedResponse = await firstResponse;
    assert.equal(postedResponse.status(), 201, 'real Nest MFS POST status');
    const sourcePayment = await postedResponse.json();
    assert.match(sourcePayment.data?.id, isId);
    assert.equal(sourcePayment.data.accountCode, 'BANK:' + fixture.mfs);
    await page.locator('#f2-result[data-status="posted"][data-completed="' + (previous + 1) + '"]').waitFor();
    assert.equal(await page.locator('#f2-result').getAttribute('data-payment-id'), sourcePayment.data.id);
    assert.equal(await page.locator('#f2-result').getAttribute('data-mfs-balance'), '20000');
    assert.equal(await page.locator('#f2-result').getAttribute('data-party-balance'), '-80000');
    assert.equal(posts.length, 1);
    assert.equal(posts[0].key, fixture.key);

    const account = ok(await api('/api/v1/money/accounts', 'GET', undefined, fixture.a.token),
      200, 'source MFS after payment');
    assert.equal(account.accounts.find(x => x.id === fixture.mfs)?.balanceMinor, 20000);
    const supplier = ok(await api('/api/v2/parties/' + fixture.supplier + '?role=SUPPLIER',
      'GET', undefined, fixture.a.token), 200, 'source AP after payment');
    assert.equal(supplier.data.balance.netMinor, -80000);

    // The old F1 test had a stale-success race. This case explicitly observes
    // the second Nest POST RESPONSE before asserting the second React rendering.
    await page.setViewportSize({ width: 1280, height: 850 });
    const replayPrev = Number(await page.locator('#f2-result').getAttribute('data-completed'));
    await page.locator('#f2-post').focus();
    const replayResponse = awaitSupplierResponse();
    await page.keyboard.press('Enter');
    const retry = await replayResponse;
    assert.equal(retry.status(), 201, 'idempotent source replay status');
    assert.equal((await retry.json()).data.id, sourcePayment.data.id,
      'replay must return original supplier payment');
    await page.locator('#f2-result[data-status="posted"][data-completed="' + (replayPrev + 1) + '"]').waitFor();
    assert.equal(await page.locator('#f2-result').getAttribute('data-payment-id'), sourcePayment.data.id);
    assert.deepEqual(posts, [{ key: fixture.key, path: '/api/v1/suppliers/payments' },
      { key: fixture.key, path: '/api/v1/suppliers/payments' }]);
    const replayAccount = ok(await api('/api/v1/money/accounts', 'GET', undefined, fixture.a.token),
      200, 'MFS after exact-key replay');
    assert.equal(replayAccount.accounts.find(x => x.id === fixture.mfs)?.balanceMinor, 20000);
    const replayParty = ok(await api('/api/v2/parties/' + fixture.supplier + '?role=SUPPLIER',
      'GET', undefined, fixture.a.token), 200, 'supplier after replay');
    assert.equal(replayParty.data.balance.netMinor, -80000);

    await page.locator('#f2-logout').click();
    await page.locator('#f2-session[data-status="signed-out"]').waitFor();
    assert.equal(await page.locator('#f2-post').isDisabled(), true);
    assert.deepEqual(errors, [], 'React page exceptions');
    console.log('MOD006 T02-F2 PASS: genuine signed React SUPPLIER MFS→Nest→PG16, 40k→20k MFS, -100k→-80k AP, real replay HTTP 201 same source ID/key, source reread, foreign/split/discount/CASH/logout protected');
  } finally {
    await browser?.close();
    await vite.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
