/* eslint-disable @typescript-eslint/no-var-requires, no-undef */
/*
 * MOD-003 T01-R/P2B0 — isolated REAL Nest/PG16 + React/Vite browser acceptance.
 * Test-only fixture POSTs run before browser interaction. During the browser
 * only authentication endpoints may POST; ALL business reads must be real GETs.
 *
 * Precondition: operator has verified/started a disposable PG16 database and
 * a separately booted Nest API pointing to that DB. No default credentials or
 * production origin. The runner re-checks the DB identity and fixture rows.
 *
 * Example: MOD003_P2B0_TEST_ONLY=MOD003_P2B0_DISPOSABLE_DB_ONLY_20261113
 * MOD003_P2B0_API_URL=http://127.0.0.1:55694
 * MOD003_P2B0_DB_URL=postgres://sher_app:...@127.0.0.1:55693/sher_mod003_p2b0_20261113
 * MOD003_P2B0_BACKEND_DIR=/abs/path/to/isolation/nestshererp
 * node scripts/inventory-real-tenant-acceptance.cjs
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createRequire } = require('node:module');
const { chromium } = require('playwright');

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const TEST_DB = 'sher_mod003_p2b0_20261113';
const TEST_TAG = 'MOD003_P2B0_DISPOSABLE_DB_ONLY_20261113';
const LIVE_PATH = '/__mod003_p2b0_real_inventory_read';
const PASSWORD = 'DisposableP2b0Passw0rd!1';
function ulid() {
  return '0' + Array.from(crypto.randomBytes(25), n => ALPHABET[n % ALPHABET.length]).join('');
}
function localOrigin(raw, label) {
  const url = new URL(raw);
  assert.equal(url.protocol, 'http:', label);
  assert.equal(url.hostname, '127.0.0.1', label);
  assert.equal(url.pathname, '/', label);
  assert.equal(url.search, '', label);
  assert.equal(url.hash, '', label);
  return url.origin;
}
function setup() {
  assert.equal(process.env.MOD003_P2B0_TEST_ONLY, TEST_TAG,
    'Explicit disposable-only marker required');
  const apiBase = localOrigin(process.env.MOD003_P2B0_API_URL || '', 'dedicated Nest API');
  assert.equal(new URL(apiBase).port, '55694', 'Never use a shared or default API port');
  const dbUrl = new URL(process.env.MOD003_P2B0_DB_URL || '');
  assert.equal(dbUrl.hostname, '127.0.0.1');
  assert.equal(dbUrl.port, '55693');
  assert.equal(dbUrl.pathname, '/' + TEST_DB, 'Only the exact disposable DB is allowed');
  assert.equal(dbUrl.protocol, 'postgres:');
  assert.ok(process.env.MOD003_P2B0_BACKEND_DIR?.startsWith('/'),
    'Explicit isolated backend path required');
  return {
    apiBase,
    dbUrl: dbUrl.toString(),
    backendDir: path.resolve(process.env.MOD003_P2B0_BACKEND_DIR),
  };
}
async function http(apiBase, route, body, bearer, method = 'POST', operationId) {
  const response = await fetch(apiBase + route, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(bearer === undefined ? {} : { Authorization: 'Bearer ' + bearer }),
      ...(operationId === undefined ? {} : { 'Idempotency-Key': operationId }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'error',
  });
  let payload = {};
  if (response.status !== 204) payload = await response.json();
  return { status: response.status, data: payload.data, error: payload.error };
}
function expectStatus(response, expected, operation) {
  assert.equal(response.status, expected,
    operation + ' unexpected status ' + String(response.status) +
    ' code=' + String(response.error?.code || '(none)'));
  return response.data;
}
async function register(api, label) {
  const suffix = crypto.randomBytes(5).toString('hex');
  const identifier = 'p2b0-' + label + '-' + suffix + '@isolated.invalid';
  const challenge = expectStatus(await http(api, '/api/v1/auth/registration/otp', { identifier }),
    200, 'real development OTP');
  assert.match(challenge.devCode, /^\d{6}$/, 'No mocked OTP');
  const created = expectStatus(await http(api, '/api/v1/auth/registration', {
    identifier, otpCode: challenge.devCode, username: 'p2b0' + label + suffix,
    businessName: 'P2B0 Disposable ' + label, password: PASSWORD, pin: '472906',
  }), 201, 'real tenant registration');
  const login = expectStatus(await http(api, '/api/v1/auth/login',
    { identifier, password: PASSWORD }), 200, 'real login');
  const me = expectStatus(await http(api, '/api/v1/me', undefined,
    login.accessToken, 'GET'), 200, 'real /me');
  assert.equal(me.tenantId, created.tenant.id);
  return {
    identifier, password: PASSWORD, token: login.accessToken,
    tenantId: me.tenantId, userId: me.user.id,
  };
}
async function seedProduct(api, actor, label, initialQty, extraQty = 0) {
  const catalogue = expectStatus(await http(api, '/api/v1/catalog',
    undefined, actor.token, 'GET'), 200, 'read seeded catalogue');
  const unit = catalogue.units.find(item => item.name === 'Piece');
  assert.ok(unit);
  const body = {
    name: 'Same product label across tenants ' + label,
    baseUnitId: unit.id, purchasePriceMinor: 10_000,
    sellingPriceMinor: 12_000, minStockQty: 1_000,
    brandId: null, categoryId: null, sku: null, barcode: null,
    description: null, defaultDiscountType: null, defaultDiscountValue: null,
    offerEnabled: false, offerPriceMinor: null, offerStartDate: null,
    offerEndDate: null, tracksExpiry: false, tracksSerial: false,
    conversionUnitId: null, conversionFactorQty: null,
  };
  const product = expectStatus(await http(api, '/api/v1/products', body,
    actor.token, 'POST', ulid()), 201, 'create real product');
  assert.match(product.id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  if (initialQty > 0) {
    expectStatus(await http(api, '/api/v1/inventory/openings', {
      productId: product.id, qty: initialQty,
    }, actor.token, 'POST', ulid()), 201, 'create source-linked opening');
  }
  if (extraQty !== 0) {
    expectStatus(await http(api, '/api/v1/inventory/adjustments', {
      productId: product.id, qtyDelta: extraQty, reason: 'RECOUNT',
      note: 'Disposable QA real journal', 
    }, actor.token, 'POST', ulid()), 201, 'create source-linked adjustment');
  }
  return product.id;
}
async function makeStaff(api, owner, roleName, permissions, suffix) {
  const role = expectStatus(await http(api, '/api/v1/roles', {
    name: roleName,
    permissions,
    cashRefundPerReturnMinor: null, cashRefundPerDayMinor: null,
    confirmPassword: owner.password,
  }, owner.token), 201, 'create restricted role via server');
  const identifier = 'p2b0-staff-' + suffix + '-' +
    crypto.randomBytes(4).toString('hex') + '@isolated.invalid';
  const user = expectStatus(await http(api, '/api/v1/users', {
    displayName: 'Disposable ' + roleName, username: 'p2b0' + suffix +
      crypto.randomBytes(3).toString('hex'),
    identifier, roleId: role.id, confirmPassword: owner.password,
  }, owner.token), 201, 'create restricted user via server');
  assert.equal(user.hasPassword, false, 'staff must use real password reset');
  const challenge = expectStatus(await http(api, '/api/v1/auth/password/otp',
    { identifier }), 200, 'request staff password OTP');
  assert.match(challenge.devCode, /^\d{6}$/);
  expectStatus(await http(api, '/api/v1/auth/password/reset', {
    identifier, otpCode: challenge.devCode, password: PASSWORD,
  }), 204, 'staff password activation');
  const signed = expectStatus(await http(api, '/api/v1/auth/login', {
    identifier, password: PASSWORD,
  }), 200, 'restricted staff real login');
  const me = expectStatus(await http(api, '/api/v1/me',
    undefined, signed.accessToken, 'GET'), 200, 'restricted staff /me');
  assert.equal(me.tenantId, owner.tenantId);
  assert.ok(!me.permissions.includes('inventory.cost.view'),
    'test role must not hold cost permission');
  return { identifier, password: PASSWORD, token: signed.accessToken,
    tenantId: me.tenantId, userId: me.user.id };
}
async function verifyDatabase(backendDir, dbUrl, ids) {
  const requireBackend = createRequire(path.join(backendDir, 'apps/api/package.json'));
  const pg = requireBackend('pg');
  const db = new pg.Pool({ connectionString: dbUrl, max: 1 });
  try {
    const identity = await db.query('SELECT current_database() AS db, current_user AS role');
    assert.equal(identity.rows[0].db, TEST_DB);
    assert.equal(identity.rows[0].role, 'sher_app',
      'RLS would be bypassed by a database-owner or superuser connection');
    for (const item of ids) {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        await client.query('SELECT set_config($1,$2,true)',
          ['app.tenant_id', item.tenantId]);
        const mine = await client.query('SELECT id FROM products WHERE id=$1', [item.productId]);
        assert.equal(mine.rows.length, 1, 'must see tenant-owned product under RLS');
        const foreign = ids.filter(other => other.tenantId !== item.tenantId);
        for (const other of foreign) {
          const hidden = await client.query('SELECT id FROM products WHERE id=$1',
            [other.productId]);
          assert.equal(hidden.rows.length, 0, 'foreign product must be RLS-invisible');
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }
  } finally {
    await db.end();
  }
}
async function run() {
  const cfg = setup();
  // This never provisions a DB itself and refuses to use a default API.
  assert.equal((await http(cfg.apiBase, '/api/v1/me', undefined,
    undefined, 'GET')).status, 401, 'must reach authenticated Nest, not a fake API');
  const a = await register(cfg.apiBase, 'a');
  const b = await register(cfg.apiBase, 'b');
  assert.notEqual(a.tenantId, b.tenantId);
  const productA = await seedProduct(cfg.apiBase, a, 'A', 10_000, -2_000);
  const productB = await seedProduct(cfg.apiBase, b, 'B', 5_000);
  const emptyProduct = await seedProduct(cfg.apiBase, b, 'B-empty', 0);
  assert.notEqual(productA, productB);
  const blind = await makeStaff(cfg.apiBase, a, 'P2B0 Blind Read', [
    'catalog.product.view', 'inventory.lot.view',
  ], 'blind');
  const noLots = await makeStaff(cfg.apiBase, a, 'P2B0 Product Only', [
    'catalog.product.view',
  ], 'nolots');

  await verifyDatabase(cfg.backendDir, cfg.dbUrl, [
    { tenantId: a.tenantId, productId: productA },
    { tenantId: b.tenantId, productId: productB },
  ]);
  const testA = expectStatus(await http(cfg.apiBase, '/api/v1/inventory',
    undefined, a.token, 'GET'), 200, 'real owner inventory');
  assert.equal(testA.stock.find(row => row.productId === productA)?.qtyOnHand, 8_000);
  const hidden = expectStatus(await http(cfg.apiBase, '/api/v1/inventory',
    undefined, blind.token, 'GET'), 200, 'blind stock');
  assert.ok(hidden.stock.every(row => !Object.hasOwn(row, 'valueMinor')));
  const empty = expectStatus(await http(cfg.apiBase, '/api/v1/inventory',
    undefined, b.token, 'GET'), 200, 'second tenant inventory');
  assert.equal(empty.stock.find(row => row.productId === emptyProduct)?.qtyOnHand, 0);
  assert.equal((await http(cfg.apiBase, '/api/v1/inventory/lots?productId=' + productA,
    undefined, b.token, 'GET')).status, 404);
  assert.equal((await http(cfg.apiBase, '/api/v1/inventory/lots',
    undefined, noLots.token, 'GET')).status, 403);

  const { createServer } = await import('vite');
  const vite = await createServer({
    logLevel: 'error',
    server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false,
      proxy: { '/api/v1': { target: cfg.apiBase, changeOrigin: false } } },
  });
  await vite.listen();
  const webPort = vite.httpServer.address().port;
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      headless: true, args: ['--no-sandbox'],
    });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.setDefaultTimeout(20_000);
    const writes = [], seen = [], errors = [];
    page.on('request', req => {
      const pathname = new URL(req.url()).pathname;
      if (!pathname.startsWith('/api/v1/')) return;
      seen.push(req.method() + ' ' + pathname);
      if (req.method() !== 'GET' && !pathname.startsWith('/api/v1/auth/')) {
        writes.push(req.method() + ' ' + pathname);
      }
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**' + LIVE_PATH, route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div>' +
        '<script type="module">import RefreshRuntime from "/@react-refresh";' +
        'RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};' +
        'window.$RefreshSig$=()=>(type)=>type;' +
        'window.__vite_plugin_react_preamble_installed__=true;</script>' +
        '<script type="module" src="/tests/integrationInventoryRealTenantAcceptance.test.tsx"></script>' +
        '</body></html>',
    }));
    await page.goto('http://127.0.0.1:' + webPort + LIVE_PATH);
    const login = async actor => {
      await page.locator('#p2b0-identifier').fill(actor.identifier);
      await page.locator('#p2b0-password').fill(actor.password);
      await page.locator('#p2b0-login').click();
      await page.waitForFunction(expected => {
        const identity = document.querySelector('#p2b0-identity');
        return identity?.getAttribute('data-tenant') === expected.tenantId &&
          identity?.getAttribute('data-user') === expected.userId;
      }, { tenantId: actor.tenantId, userId: actor.userId });
    };
    const projected = async () => {
      await page.locator('#p2b0-read[data-status="loaded"]').waitFor();
      return JSON.parse(await page.locator('#p2b0-projection').innerText());
    };
    const none = () => page.locator('#p2b0-projection').count();
    const panel = page.locator('#p2b2-real-panel [data-mod003-panel]');
    const panelReady = async state => {
      await page.locator('#p2b2-real-panel [data-mod003-panel][data-view-state="' + state + '"]').waitFor();
    };
    const panelTab = async name => panel.getByRole('tab', { name, exact: true }).click();
    const panelStockRow = productId => panel.locator('[data-product-id="' + productId + '"]');
    const screenshots = fs.mkdtempSync(path.join(os.tmpdir(), 'hisabiq-mod003-p2b2-real-'));
    assert.equal(await none(), 0, 'signed-out must show no preview fixture');
    assert.equal(await panel.locator('table').count(), 0, 'signed-out panel must contain no stock table');
    await login(a);
    const aResult = await projected();
    assert.equal(aResult.scope.split('/')[0], a.tenantId);
    assert.equal(aResult.stock.rows.find(row => row.source.productId === productA)
      ?.source.qtyOnHand, 8_000);
    assert.ok(aResult.movements.rows.some(row => row.source.productId === productA));
    assert.ok(aResult.adjustments.rows.some(row =>
      row.source.productId === productA && row.source.qtyDelta === -2_000));
    assert.ok(aResult.lots.rows.every(row => row.source.productId === productA));
    assert.ok(aResult.stock.rows.some(row =>
      row.source.productId === productA && Object.hasOwn(row.source, 'valueMinor')));
    assert.equal(aResult.movements.rows[0].runningBalance.state, 'unavailable');
    assert.equal(aResult.lots.rows[0].batchNumber.state, 'unavailable');
    assert.equal('totalQty' in aResult, false);

    // P2B2: assertions on the actual rendered, previously unmounted P2B1
    // component, using real PostgreSQL rows through SessionStore/Nest.
    await panelReady('ready');
    await panelTab('Stock');
    assert.ok(await panelStockRow(productA).count() >= 1,
      'live server product must be displayed with its actual ULID');
    const ownerStockRow = panelStockRow(productA).first();
    const ownerSourceRow = testA.stock.find(row => row.productId === productA);
    assert.ok(ownerSourceRow, 'source stock row must exist');
    assert.equal(await ownerStockRow.getAttribute('data-location-id'),
      ownerSourceRow.locationId ?? '', 'must preserve server location identity');
    assert.ok((await ownerStockRow.innerText()).includes('8 ' + ownerSourceRow.baseUnitName),
      'scale-3 on-hand quantity rendered as 8 base units');
    assert.ok((await ownerStockRow.innerText()).includes('IN STOCK'),
      'source stock status must not be inferred from partial movements');
    assert.ok((await ownerStockRow.innerText()).includes('৳'),
      'authorized stock value shown from server cost field');
    await panelTab('Lots');
    await page.locator('[data-lot-id="' + aResult.lots.rows[0].source.id + '"]').waitFor();
    assert.equal(await panel.locator('[data-lot-id]').count(), aResult.lots.rows.length);
    assert.equal(await panel.locator('[data-page-has-more]').getAttribute('data-page-has-more'),
      String(aResult.lots.page.hasMore), 'UI must retain server cursor page boundary');
    assert.ok((await panel.innerText()).includes(aResult.lots.rows[0].source.sourceNumber),
      'actual source number is visible, not a manufactured batch number');
    assert.ok((await panel.innerText()).includes('This is a filtered keyset page'),
      'lot page must never claim to contain every lot');
    assert.ok((await panel.innerText()).includes('unavailable'),
      'batch, serial, manufacture and selling price remain unavailable');
    await panelTab('Movements');
    assert.ok(await panel.locator('[data-movement-id="' +
      aResult.movements.rows[0].source.id + '"]').count() === 1);
    assert.ok((await panel.innerText()).includes('Not provided by API'),
      'no running balance or movement note invented');
    await panelTab('Adjustments');
    assert.ok(await panel.locator('[data-adjustment-id="' +
      aResult.adjustments.rows[0].source.id + '"]').count() === 1);

    await page.locator('#p2b2-language').selectOption('Bangla');
    await panelTab('স্টক');
    assert.ok((await panel.innerText()).includes('স্টকের সারাংশ'));
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 850 });
      const geometry = await page.evaluate(() =>
        ({ viewport: window.innerWidth, scroll: document.documentElement.scrollWidth }));
      assert.ok(geometry.scroll <= geometry.viewport + 2,
        'real-data inventory panel should not overflow page at ' + width);
      if (width === 320 || width === 1440) {
        await page.screenshot({
          path: path.join(screenshots, 'real-inventory-' + width + '-dark.png'),
          fullPage: true,
        });
      }
    }
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.locator('#p2b2-language').selectOption('English + Bangla');
    assert.ok((await panel.innerText()).includes('Stock · স্টক'),
      'source-backed labels remain bilingual');
    await page.locator('#p2b2-language').selectOption('English');
    await page.setViewportSize({ width: 390, height: 844 });

    await login(blind);
    const blindResult = await projected();
    assert.equal(blindResult.scope.split('/')[0], a.tenantId);
    assert.ok(blindResult.stock.rows.every(row =>
      !Object.hasOwn(row.source, 'valueMinor')));
    assert.ok(blindResult.lots.rows.every(row =>
      !Object.hasOwn(row.source, 'valueMinor') &&
      !Object.hasOwn(row.source, 'actualUnitCost') &&
      !Object.hasOwn(row.source, 'landedCostTotal')));
    assert.ok(blindResult.adjustments.rows.every(row =>
      !Object.hasOwn(row.source, 'valueMinor')));
    await panelReady('ready');
    await panelTab('Stock');
    assert.equal(await panelStockRow(productA).count(), 1);
    assert.ok(!(await panel.innerText()).includes('৳'),
      'COST_VIEW-blind role must never see monetary stock values in DOM');
    await panelTab('Lots');
    assert.ok(!(await panel.innerText()).includes('৳'),
      'cost-blind lots must have no purchase, actual, landed or lot values');
    await panelTab('Adjustments');
    assert.ok(!(await panel.innerText()).includes('৳'),
      'cost-blind adjustment row must have no monetary value');
    await page.locator('#p2b0-foreign').fill(productB);
    await page.locator('#p2b0-foreign-check').click();
    await page.waitForFunction(() =>
      document.querySelector('#p2b0-foreign-result')?.textContent?.startsWith('HTTP_'));
    assert.equal(await page.locator('#p2b0-foreign-result').innerText(), 'HTTP_404');

    await login(noLots);
    await page.locator('#p2b0-read[data-status="failed"]').waitFor();
    assert.equal(await none(), 0, 'LOT_VIEW refusal must not reveal partial inventory');
    assert.equal(await page.locator('#p2b0-read-status').innerText(), 'HTTP_403');
    await panelReady('denied');
    assert.equal(await panel.locator('table').count(), 0,
      '403 must not leave previously permitted cost-bearing panel visible');
    assert.ok((await panel.innerText()).includes('Permission denied'));

    await login(b);
    const bResult = await projected();
    assert.equal(bResult.scope.split('/')[0], b.tenantId);
    assert.ok(bResult.stock.rows.some(row => row.source.productId === productB));
    assert.ok(bResult.stock.rows.some(row =>
      row.source.productId === emptyProduct && row.source.qtyOnHand === 0));
    assert.ok(bResult.stock.rows.every(row => row.source.productId !== productA));
    assert.equal(bResult.adjustments.rows.some(row =>
      row.source.productId === productA), false);
    await panelReady('ready');
    await panelTab('Stock');
    assert.equal(await panelStockRow(productA).count(), 0,
      'tenant B must not see tenant A product even as a transient DOM row');
    assert.ok(await panelStockRow(productB).count() >= 1);
    const emptyRow = panelStockRow(emptyProduct).first();
    assert.ok((await emptyRow.innerText()).includes('0 '),
      'source-provided zero must be rendered as zero, not an unknown value');

    // Reauthenticate tenant A, stall one live inventory GET, then immediately
    // switch to B. No A result may appear in B's active epoch.
    let release;
    const hold = new Promise(resolve => { release = resolve; });
    let holdOne = true;
    await page.route('**/api/v1/inventory', async route => {
      if (!holdOne) return route.continue();
      holdOne = false;
      await hold;
      await route.continue().catch(() => undefined);
    });
    // Do not allow a false-positive race: require an actual A-scoped GET to
    // reach the interceptor before we reauthenticate tenant B.
    const heldARequest = page.waitForRequest(request => request.method() === 'GET' &&
      new URL(request.url()).pathname === '/api/v1/inventory');
    await login(a);
    await heldARequest;
    await page.locator('#p2b0-read[data-status="loading"]').waitFor();
    await panelReady('loading');
    assert.equal(await panel.locator('table').count(), 0,
      'old tenant inventory must be hidden before the stalled request resolves');
    await login(b);
    assert.equal(await panelStockRow(productA).count(), 0,
      'cross-tenant switch must mask prior tenant without waiting for passive effects');
    release();
    const afterSwitch = await projected();
    assert.equal(afterSwitch.scope.split('/')[0], b.tenantId);
    assert.equal(afterSwitch.stock.rows.some(row => row.source.productId === productA), false);
    await panelReady('ready');
    await panelTab('Stock');
    assert.equal(await panelStockRow(productA).count(), 0);
    assert.ok(await panelStockRow(productB).count() >= 1);

    await page.locator('#p2b0-logout').click();
    await page.waitForFunction(() =>
      document.querySelector('#p2b0-identity')?.getAttribute('data-status') === 'signed-out');
    assert.equal(await none(), 0, 'logout cannot retain tenant inventory');
    assert.equal(await panel.locator('table').count(), 0,
      'logout cannot leave a real stock panel with private tenant data');
    assert.equal((await page.evaluate(async () => {
      const { readInventoryOverview } = await import('/src/integration/inventory.ts');
      try {
        await readInventoryOverview('invalid.test.token');
        return 0;
      } catch (e) {
        return e.status;
      }
    })), 401, 'bad token must fail through strict adapter');
    assert.ok(seen.some(x => x === 'GET /api/v1/inventory'));
    assert.ok(seen.some(x => x === 'GET /api/v1/inventory/lots'));
    assert.ok(seen.some(x => x === 'GET /api/v1/inventory/adjustments'));
    assert.ok(seen.some(x => x === 'GET /api/v1/products'));
    assert.deepEqual(writes, [], 'browser may only read business endpoints');
    assert.deepEqual(errors, [], 'unhandled React errors');
    console.log('MOD003_P2B0_REAL_PASS tenants=2 protected-reads=4 mobile-width=390');
    console.log('MOD003_P2B2_REAL_RENDERED_PASS tenants=2 viewports=320,390,768,1440');
    console.log('MOD003_P2B2_SCREENSHOTS=' + screenshots);
  } finally {
    if (browser) await browser.close();
    await vite.close();
  }
}
run().catch(error => {
  // Do not log credentials, auth tokens or database connection strings.
  console.error('MOD003_P2B0_REAL_FAIL', String(error?.message || error));
  process.exitCode = 1;
});
