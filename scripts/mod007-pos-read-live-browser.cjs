/*
 * MOD-007 P0D: TEST ONLY real React SessionStore -> Vite same-origin
 * proxy -> Nest -> disposable PostgreSQL16.
 *
 * Pre-browser fixture POSTs are allowed only for synthetic signup/products/
 * parties in the isolated database. While the browser runs, all business
 * requests MUST be GET; no sale, stock or financial posting is permitted.
 * No synthetic successful API responses and no production route mounting.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { chromium } = require('playwright');

const apiBase = 'http://127.0.0.1:55672';
const livePath = '/__mod007_p0d_live_browser';
const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function ulid() {
  return '0' + Array.from(crypto.randomBytes(25), b => alphabet[b % alphabet.length]).join('');
}
function requireDisposable() {
  assert.equal(process.env.MOD007_P0D_TEST_ONLY,
    'MOD007_P0D_DISPOSABLE_PG16_20261113', 'Disposable PostgreSQL16 is mandatory');
  assert.equal(process.env.MOD007_P0D_API_BASE, apiBase,
    'Only this isolated loopback Nest instance is permitted');
  assert.equal(process.env.MOD007_P0D_DB_NAME, 'hisabiq_mod007_p0d_20261113');
}
async function request(path, body, token, method = 'POST', operationId = null) {
  const headers = {
    Accept: 'application/json',
    ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    ...(token === undefined ? {} : { Authorization: 'Bearer ' + token }),
    ...(operationId === null ? {} : { 'Idempotency-Key': operationId }),
  };
  const response = await fetch(apiBase + path, {
    method, headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'error',
  });
  const payload = await response.json();
  return { status: response.status, body: payload };
}
function success(value, status, description) {
  assert.equal(value.status, status, description + ': ' +
    JSON.stringify(value.body).slice(0, 800));
}
async function register(label) {
  const suffix = crypto.randomBytes(4).toString('hex');
  const identifier = 'p0d-' + label + '-' + suffix + '@isolated.invalid';
  const password = 'P0dOnlyPassw0rd!1';
  const otp = await request('/api/v1/auth/registration/otp', { identifier });
  success(otp, 200, 'Disposable dev OTP ' + label);
  const otpCode = otp.body?.data?.devCode;
  assert.match(otpCode, /^[0-9]{6}$/);
  const created = await request('/api/v1/auth/registration', {
    identifier, otpCode, username: 'p0d' + label + suffix,
    businessName: 'P0D Disposable ' + label,
    password, pin: '472906',
  });
  success(created, 201, 'Register ' + label);
  const login = await request('/api/v1/auth/login', { identifier, password });
  success(login, 200, 'Login ' + label);
  const token = login.body.data.accessToken;
  const access = await request('/api/v1/me', undefined, token, 'GET');
  success(access, 200, 'Verify /me ' + label);
  assert.equal(access.body.data.tenantId, created.body.data.tenant.id);
  return {
    identifier, password, token,
    tenantId: access.body.data.tenantId,
    userId: access.body.data.user.id,
  };
}
async function seedUnit(actor) {
  const value = await request('/api/v1/catalog/units', { name: 'Piece' }, actor.token);
  success(value, 201, 'Create unit');
  const units = value.body.data.units;
  const piece = units.find(item => item.name === 'Piece');
  assert.match(piece?.id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  return piece.id;
}
async function seedProduct(actor, unitId, name, barcode) {
  const result = await request('/api/v1/products', {
    name, baseUnitId: unitId,
    purchasePriceMinor: 1000, sellingPriceMinor: 2000,
    minStockQty: 0, brandId: null, categoryId: null,
    sku: null, barcode: barcode ?? null,
    description: null, defaultDiscountType: null,
    defaultDiscountValue: null, offerEnabled: false,
    offerPriceMinor: null, offerStartDate: null,
    offerEndDate: null, tracksExpiry: false, tracksSerial: false,
    conversionUnitId: null, conversionFactorQty: null,
  }, actor.token, 'POST', ulid());
  success(result, 201, 'Create product ' + name);
  return result.body.data.id;
}
async function seedCustomer(actor, name, phone) {
  const created = await request('/api/v1/parties', {
    name, roles: ['CUSTOMER'], phone, address: null,
    guardianName: null, nid: null, email: null,
    notes: null, customerGroupId: null, creditLimitMinor: null,
  }, actor.token, 'POST', ulid());
  success(created, 201, 'Create customer ' + name);
  return created.body.data.id;
}
async function seed() {
  const a = await register('a');
  const b = await register('b');
  assert.notEqual(a.tenantId, b.tenantId);
  const [unitA, unitB] = await Promise.all([seedUnit(a), seedUnit(b)]);
  const ids = {
    aFirst: await seedProduct(a, unitA, 'Wire coil A', 'P0D-A-1'),
    aExact: await seedProduct(a, unitA, 'Wire', 'P0D-A-2'),
    aThird: await seedProduct(a, unitA, 'Wire switch A', 'P0D-A-3'),
    bWire: await seedProduct(b, unitB, 'Wire tenant B', 'P0D-B-1'),
    customerA: await seedCustomer(a, 'Karim POS QA A', '01711110001'),
    customerB: await seedCustomer(b, 'Karim POS QA B', '01711110002'),
  };
  const ranked = await request(
    '/api/v1/sales/pos-products?rankingMode=GLOBAL_V2&search=wire&limit=2',
    undefined, a.token, 'GET',
  );
  success(ranked, 200, 'Actual ranked POS API before browser');
  assert.equal(ranked.body.items[0].id, ids.aExact,
    'Exact product name must globally outrank older prefix IDs');
  assert.ok(ranked.body.nextCursor?.startsWith('v2.'));
  const forbidden = await request('/api/v1/customers/' + ids.customerA + '/standing',
    undefined, b.token, 'GET');
  assert.equal(forbidden.status, 404, 'Cross-tenant customer standing must fail closed');
  return { a, b, ids };
}
async function run() {
  requireDisposable();
  const health = await fetch(apiBase + '/api/v1/me');
  assert.equal(health.status, 401, 'Real protected Nest API must serve isolated port');
  const fixtures = await seed();

  // Identical to the tested MOD-006 live read pattern; no app production route.
  const { createServer } = await import('vite');
  const vite = await createServer({
    logLevel: 'error',
    server: {
      host: '127.0.0.1', port: 0, strictPort: false, hmr: false,
      proxy: { '/api/v1': { target: apiBase, changeOrigin: false } },
    },
  });
  await vite.listen();
  const vitePort = vite.httpServer.address().port;
  let browser;
  const observed = [];
  const businessWrites = [];
  const browserErrors = [];
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      headless: true, args: ['--no-sandbox'],
    });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce' });
    page.setDefaultTimeout(20000);
    page.on('pageerror', error => browserErrors.push(error.message));
    page.on('request', req => {
      const path = new URL(req.url()).pathname;
      if (!path.startsWith('/api/v1/')) return;
      observed.push(req.method() + ' ' + path);
      const isAuth = path.startsWith('/api/v1/auth/');
      if (!isAuth && req.method() !== 'GET') {
        businessWrites.push(req.method() + ' ' + path);
      }
    });
    page.on('console', msg => {
      if (msg.type() !== 'error') return;
      const detail = msg.text();
      const devHmr = detail.startsWith('[vite] failed to connect to websocket.\n')
        || /^WebSocket connection to 'ws:\/\/127\.0\.0\.1:(?:5173|0)\/\?token=[^']+' failed: Error in connection establishment: net::ERR_(?:UNSAFE_PORT|BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS)$/.test(detail);
      if (!devHmr) browserErrors.push(detail.slice(0, 300));
    });
    await page.route('**' + livePath, route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="UTF-8"></head>'+
        '<body><div id="root"></div>'+
        '<script type="module">import RefreshRuntime from "/@react-refresh";'+
        'RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$=()=>{};'+
        'window.$RefreshSig$=()=>(type)=>type;'+
        'window.__vite_plugin_react_preamble_installed__=true;</script>'+
        '<script type="module" src="/tests/mod007PosReadLiveHarness.tsx"></script>'+
        '</body></html>',
    }));
    await page.goto('http://127.0.0.1:' + vitePort + livePath);
    const products = page.locator('[data-p0d-product]');
    const customers = page.locator('[data-p0d-customer]');
    const standing = page.locator('[data-p0d-standing]');
    const ready = () => page.locator('#p0d-products[data-ready="yes"]');
    const login = async actor => {
      await page.locator('#p0d-identifier').fill(actor.identifier);
      await page.locator('#p0d-password').fill(actor.password);
      await page.locator('#p0d-login').click();
      await page.waitForFunction(tenantId =>
        document.querySelector('#p0d-session')?.getAttribute('data-tenant') === tenantId,
        actor.tenantId);
      await ready().waitFor();
    };

    assert.equal(await products.count(), 0, 'No preview product when not signed in');
    assert.equal(await customers.count(), 0);
    assert.equal(await standing.count(), 0);

    await login(fixtures.a);
    assert.equal(await products.count(), 2);
    assert.equal(await products.first().getAttribute('data-p0d-product'), fixtures.ids.aExact);
    assert.equal(await customers.count(), 1);
    assert.equal(await customers.first().getAttribute('data-p0d-customer'), fixtures.ids.customerA);
    assert.equal(await standing.getAttribute('data-p0d-standing'), fixtures.ids.customerA);
    assert.match(await standing.innerText(), /due 0 poisha; advance 0 poisha/);
    assert.equal(await products.first().getAttribute('data-p0d-cost-present'), 'yes',
      'OWNER with COST_VIEW should have cost available, not fabricated');

    await page.locator('#p0d-more').click();
    await page.waitForFunction(() =>
      document.querySelectorAll('[data-p0d-product]').length === 3);
    assert.equal(await products.count(), 3);
    assert.equal(await page.locator('[data-p0d-product="' + fixtures.ids.aThird + '"]').count(), 1);
    assert.ok(observed.some(s => s === 'GET /api/v1/sales/pos-products'));
    assert.ok(observed.some(s => s === 'GET /api/v1/parties'));
    assert.ok(observed.some(s =>
      s === 'GET /api/v1/customers/' + fixtures.ids.customerA + '/standing'));

    // A different verified identity must instantly hide A's products and standing.
    await login(fixtures.b);
    assert.equal(await products.count(), 1);
    assert.equal(await products.first().getAttribute('data-p0d-product'), fixtures.ids.bWire);
    assert.equal(await page.locator('[data-p0d-product="' + fixtures.ids.aExact + '"]').count(), 0);
    assert.equal(await customers.first().getAttribute('data-p0d-customer'), fixtures.ids.customerB);
    assert.equal(await standing.getAttribute('data-p0d-standing'), fixtures.ids.customerB);

    await page.locator('#p0d-logout').click();
    await page.locator('#p0d-session[data-status="signed-out"]').waitFor();
    assert.equal(await products.count(), 0);
    assert.equal(await customers.count(), 0);
    assert.equal(await standing.count(), 0);

    await login(fixtures.a);
    const epochBefore = Number(await page.locator('#p0d-session').getAttribute('data-epoch'));
    await page.locator('#p0d-refresh').click();
    await page.waitForFunction(() =>
      document.querySelector('#p0d-result')?.textContent === 'confirmed');
    // SessionStore.refresh() legitimately rotates its bearer in the SAME
    // verified tenant epoch; switching identity, not token refresh, advances it.
    assert.equal(Number(await page.locator('#p0d-session').getAttribute('data-epoch')),
      epochBefore);
    await ready().waitFor();
    assert.equal(await products.first().getAttribute('data-p0d-product'), fixtures.ids.aExact);

    // Delay a genuine server GET; changing to signed-out must never reveal
    // its late response. No fabricated response body is used for this test.
    let release;
    let delayed = false;
    await page.route('**/api/v1/sales/pos-products*', async route => {
      if (!delayed) {
        delayed = true;
        await new Promise(resolve => { release = resolve; });
      }
      await route.continue().catch(() => undefined);
    });
    await page.locator('#p0d-search').fill('wire ');
    for (let i = 0; i < 100 && !delayed; i++) {
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    assert.equal(delayed, true, 'Query change must initiate a true server GET');
    await page.locator('#p0d-logout').click();
    await page.locator('#p0d-session[data-status="signed-out"]').waitFor();
    release();
    assert.equal(await products.count(), 0);
    assert.equal(await customers.count(), 0);
    assert.equal(await standing.count(), 0);

    const overflows = [];
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const dimensions = await page.evaluate(() => ({
        view: innerWidth, document: document.documentElement.scrollWidth,
      }));
      if (dimensions.document > dimensions.view + 1) overflows.push({ width, dimensions });
    }
    assert.deepEqual(overflows, [], 'Read-only test harness must work at 320+ px');
    assert.deepEqual(businessWrites, [], 'After fixture seed browser must make zero ERP writes');
    assert.deepEqual(browserErrors, [], 'No unhandled browser errors');
    const persisted = await page.evaluate(() =>
      JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
    for (const actor of [fixtures.a, fixtures.b]) {
      assert.equal(persisted.includes(actor.token), false, 'Access bearer not persisted');
    }
    console.log('MOD-007 P0D real SessionStore → Nest → disposable PG16: two tenants, GLOBAL_V2, real standing, epoch/logout, zero browser ERP writes PASS');
  } finally {
    await browser?.close();
    await vite.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
