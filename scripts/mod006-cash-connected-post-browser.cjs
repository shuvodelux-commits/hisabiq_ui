/* MOD-006 T02-G2 — disposable CASH ON/OFF React→Nest→PG16 acceptance.
 * NEVER run against retained databases or production. Source-owned Nest writes
 * only; a QA-only React route uses original SessionStore and existing source
 * transport. Connected CounterWorkspace remains unmounted.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { chromium } = require('playwright');
const API = 'http://127.0.0.1:56011';
const CONTAINER = 'hisabiq-mod006-g2-cash-pg-20261116';
const DB = 'hisabiq_mod006_g2_cash_20261116';
const ACK = 'MOD006_G2_DISPOSABLE_ONLY_20261116';
const letters = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const id = () => '0' + [...crypto.randomBytes(25)].map(x => letters[x % 32]).join('');
const isId = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const assertId = value => assert.match(value, isId);
function refuse(message) { throw Error('G2 DISPOSABLE BOUNDARY: ' + message); }
function guard() {
  if (process.env.MOD006_G2_ACK !== ACK || process.env.MOD006_G2_ORIGIN !== API ||
      process.env.MOD006_G2_DB !== DB || process.env.MOD006_G2_CONTAINER !== CONTAINER) {
    refuse('exact disposable environment acknowledgement missing');
  }
  const inspect = spawnSync('podman', ['inspect', '--format', '{{json .}}', CONTAINER], {
    encoding: 'utf8', timeout: 9000, maxBuffer: 2 * 1024 * 1024,
  });
  if (inspect.status !== 0 || !inspect.stdout) refuse('disposable PG16 container not running');
  let info;
  try { info = JSON.parse(inspect.stdout); } catch { refuse('container inspection invalid'); }
  const env = info.Config?.Env || [];
  const tmpfs = info.HostConfig?.Tmpfs || {};
  if (!info.State?.Running || !env.includes('PG_MAJOR=16') ||
      !env.includes('POSTGRES_DB=' + DB) ||
      !/postgres:16-alpine/.test(info.Config?.Image || info.ImageName || '') ||
      (!Object.keys(tmpfs).includes('/var/lib/postgresql/data') &&
       !info.Mounts?.some(m => m.Type === 'tmpfs' &&
         m.Destination === '/var/lib/postgresql/data'))) {
    refuse('expected isolated PostgreSQL16 tmpfs identity mismatch');
  }
}
async function api(path, method = 'GET', body, token) {
  if (!/^\/api\/v1\/[a-z0-9/-]+$/.test(path.split('?')[0]) &&
      !/^\/api\/v2\/parties\/[0-7][0-9A-HJKMNP-TV-Z]{25}\?role=(CUSTOMER|SUPPLIER)$/.test(path)) {
    refuse('unapproved test-only API path');
  }
  const response = await fetch(API + path, {
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
  return { status: response.status, body: await response.json() };
}
function ok(result, status, context) {
  assert.equal(result.status, status,
    context + ' ' + JSON.stringify(result.body?.error || {}));
  return result.body;
}
function sql(query) {
  // Only assert-generated ULIDs and exact internal identifiers can enter SQL.
  const result = spawnSync('podman', [
    'exec', CONTAINER, 'psql', '-U', 'postgres', '-d', DB,
    '-At', '-v', 'ON_ERROR_STOP=1', '-c', query,
  ], { encoding: 'utf8', timeout: 12000, maxBuffer: 2 * 1024 * 1024 });
  assert.equal(result.status, 0, 'real PG query: ' + result.stderr);
  return result.stdout.trim();
}
function databaseState(tenant) {
  assertId(tenant);
  const query = `SELECT (SELECT count(*) FROM customer_receipts WHERE tenant_id='${tenant}'),` +
    `(SELECT count(*) FROM supplier_payments WHERE tenant_id='${tenant}'),` +
    `(SELECT count(*) FROM journal_entries WHERE tenant_id='${tenant}'),` +
    `(SELECT coalesce(sum(amount_minor),0) FROM journal_lines WHERE tenant_id='${tenant}')`;
  const [receipts, supplierPayments, entries, journalSum] = sql(query).split('|').map(Number);
  for (const item of [receipts, supplierPayments, entries, journalSum]) {
    assert.ok(Number.isSafeInteger(item), 'real PG snapshot must contain integers');
  }
  assert.equal(journalSum, 0, 'every source posting must be double-entry balanced');
  return { receipts, supplierPayments, entries };
}
function persistedSession(table, documentId, tenant) {
  assert.ok(['customer_receipts', 'supplier_payments'].includes(table));
  assertId(documentId); assertId(tenant);
  return sql(`SELECT coalesce(session_id::text,'NULL') FROM ${table} ` +
    `WHERE id='${documentId}' AND tenant_id='${tenant}'`);
}
async function register(name) {
  const suffix = crypto.randomBytes(4).toString('hex');
  const identifier = 'g2-' + name + '-' + suffix + '@isolated.invalid';
  const password = 'G2OnlySafePassw0rd!1';
  const otp = ok(await api('/api/v1/auth/registration/otp', 'POST',
    { identifier }), 200, name + ' OTP');
  assert.match(otp.data.devCode, /^\d{6}$/);
  const registration = ok(await api('/api/v1/auth/registration', 'POST', {
    identifier, otpCode: otp.data.devCode,
    username: 'g2' + name + suffix, businessName: 'G2 Disposable ' + name,
    password, pin: '472906',
  }), 201, name + ' registration');
  const login = ok(await api('/api/v1/auth/login', 'POST', {
    identifier, password,
  }), 200, name + ' login');
  const token = login.data.accessToken;
  const me = ok(await api('/api/v1/me', 'GET', undefined, token), 200, name + ' signed /me');
  assert.equal(me.data.tenantId, registration.data.tenant.id);
  for (const grant of ['cash.account.view', 'cash.daily.view',
    'party.customer.view', 'party.supplier.view',
    'sale.payment.record', 'purchase.payment.record']) {
    assert.ok(me.data.permissions.includes(grant), 'permission: ' + grant);
  }
  return { identifier, password, token, tenant: me.data.tenantId };
}
async function party(actor, role) {
  const response = ok(await api('/api/v1/parties', 'POST', {
    name: 'G2 ' + role, roles: [role], phone: '01712345678',
    address: null, guardianName: null, nid: null, email: null, notes: null,
    customerGroupId: null, creditLimitMinor: null,
  }, actor.token), 201, role + ' Party');
  assertId(response.data.id);
  return response.data.id;
}
async function seed(mode) {
  const actor = await register(mode.toLowerCase());
  ok(await api('/api/v1/settings/value', 'POST', {
    key: 'cash_session_enabled', value: mode === 'ON' ? 'on' : 'off',
  }, actor.token), 201, 'cash setting ' + mode);
  const account = ok(await api('/api/v1/money/accounts', 'POST', {
    name: 'G2 tracked drawer ' + mode, type: 'CASH', holderName: null,
    reference: null, isDrawer: true, openingAmountMinor: 50000,
    openingDate: '2026-01-01', operationId: id(),
  }, actor.token), 201, 'tracked CASH source').data.id;
  assertId(account);
  const customer = await party(actor, 'CUSTOMER');
  const supplier = await party(actor, 'SUPPLIER');
  const catalog = ok(await api('/api/v1/catalog', 'GET', undefined, actor.token),
    200, 'real signup catalog');
  const piece = catalog.data.units.find(unit => unit.name === 'Piece');
  assert.ok(piece && isId.test(piece.id), 'reuse signup-provisioned Piece');
  const product = ok(await api('/api/v1/products', 'POST', {
    name: 'G2 cash trade item', baseUnitId: piece.id,
    purchasePriceMinor: 10000, sellingPriceMinor: 12000, minStockQty: 0,
    brandId: null, categoryId: null, sku: null, barcode: null,
    description: null, defaultDiscountType: null, defaultDiscountValue: null,
    offerEnabled: false, offerPriceMinor: null, offerStartDate: null,
    offerEndDate: null, tracksExpiry: false, tracksSerial: false,
    conversionUnitId: null, conversionFactorQty: null,
  }, actor.token), 201, 'product');
  ok(await api('/api/v1/purchases', 'POST', {
    supplierPartyId: supplier,
    lines: [{ productId: product.data.id, qty: 10000, unitPriceMinor: 10000 }],
    discountMinor: 0, paidMinor: 0, paidAccountCode: null,
  }, actor.token), 201, 'unpaid 100000 minor supplier bill');
  const status = ok(await api('/api/v1/money/day', 'GET', undefined, actor.token),
    200, mode + ' server day');
  assert.equal(status.enabled, mode === 'ON');
  assert.equal(status.drawerAccountId, account);
  assert.equal(status.todaySession, null);
  assert.equal(ok(await api('/api/v1/money/accounts', 'GET', undefined, actor.token),
    200, 'source accounts').accounts.find(a => a.id === account)?.balanceMinor, 50000);
  assert.equal(ok(await api('/api/v2/parties/' + supplier + '?role=SUPPLIER',
    'GET', undefined, actor.token), 200, 'supplier before').data.balance.netMinor, -100000);
  return { ...actor, mode, account, customer, supplier, businessDate: status.businessDate };
}
async function run() {
  guard(); // BEFORE registering tenants or making a single financial write.
  ok(await api('/api/v1/me'), 401, 'unsigned Nest session denied');
  const on = await seed('ON');
  const off = await seed('OFF');
  assert.notEqual(on.tenant, off.tenant);
  for (const role of ['CUSTOMER', 'SUPPLIER']) {
    const path = '/api/v2/parties/' + (role === 'CUSTOMER' ? on.customer : on.supplier) +
      '?role=' + role;
    assert.equal((await api(path, 'GET', undefined, off.token)).status, 404,
      'other tenant cannot view signed role');
  }
  const offAccounts = ok(await api('/api/v1/money/accounts', 'GET', undefined, off.token),
    200, 'OFF tenant account isolation');
  assert.ok(!offAccounts.accounts.some(a => a.id === on.account));

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
    page.setDefaultTimeout(25000);
    const posts = [], errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      const pathname = new URL(request.url()).pathname;
      if (request.method() === 'POST' &&
          ['/api/v1/customer-payments', '/api/v1/suppliers/payments'].includes(pathname)) {
        posts.push({ path: pathname, key: request.headers()['idempotency-key'] });
      }
    });
    await page.route('**/__mod006_g2_cash_browser_only', route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="UTF-8"></head><body>' +
        '<div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh";' +
        'RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};' +
        'window.$RefreshSig$=()=>(type)=>type;' +
        'window.__vite_plugin_react_preamble_installed__=true;</script>' +
        '<script type="module" src="/tests/mod006CashConnectedPostHarness.tsx"></script>' +
        '</body></html>',
    }));
    await page.goto(origin + '/__mod006_g2_cash_browser_only');
    await page.locator('#g2-session[data-status="signed-out"]').waitFor();
    assert.equal(await page.locator('#g2-post').isDisabled(), true);

    async function login(actor) {
      await page.locator('#g2-identifier').fill(actor.identifier);
      await page.locator('#g2-password').fill(actor.password);
      await page.locator('#g2-login').click();
      await page.locator('#g2-session[data-status="authenticated"]').waitFor();
      assert.equal(await page.locator('#g2-session').getAttribute('data-tenant'), actor.tenant);
    }
    async function fill(actor, kind, amount, key) {
      assertId(key);
      await page.locator('#g2-kind').selectOption(kind);
      await page.locator('#g2-party').fill(kind === 'CUSTOMER_RECEIPT' ? actor.customer : actor.supplier);
      await page.locator('#g2-account').fill(actor.account);
      await page.locator('#g2-amount').fill(amount);
      await page.locator('#g2-operation').fill(key);
    }
    async function blockedNoPost(actor, kind, amount, expectedReason) {
      const before = databaseState(actor.tenant);
      const beforePosts = posts.length;
      const previous = Number(await page.locator('#g2-result').getAttribute('data-completed'));
      await page.locator('#g2-post').click();
      await page.locator('#g2-result[data-status="error"][data-completed="' +
        (previous + 1) + '"]').waitFor();
      const actualMessage = await page.locator('#g2-result').innerText();
      assert.match(actualMessage, expectedReason, 'expected fail-closed reason');
      assert.equal(posts.length, beforePosts, 'blocked day must not send payment POST');
      assert.deepEqual(databaseState(actor.tenant), before,
        'blocked cash day must not change source documents/journal');
      assert.equal(await page.locator('#g2-operation').inputValue(), amount);
    }
    const expectedPath = kind => kind === 'CUSTOMER_RECEIPT'
      ? '/api/v1/customer-payments' : '/api/v1/suppliers/payments';
    const responseFor = kind => page.waitForResponse(r =>
      new URL(r.url()).pathname === expectedPath(kind) &&
      r.request().method() === 'POST', { timeout: 45000 });

    async function money(actor, kind, amount, key, expectedCash, expectedParty, session, keyboard = false) {
      await fill(actor, kind, amount, key);
      const before = databaseState(actor.tenant);
      const postCount = posts.length;
      const seq = Number(await page.locator('#g2-result').getAttribute('data-completed'));
      if (keyboard) {
        await page.setViewportSize({ width: 1280, height: 850 });
        await page.locator('#g2-post').focus();
      }
      const responsePromise = responseFor(kind);
      if (keyboard) await page.keyboard.press('Enter');
      else await page.locator('#g2-post').click();
      const response = await responsePromise;
      assert.equal(response.status(), 201, 'actual Nest source POST response');
      const data = (await response.json()).data;
      assertId(data.id);
      assert.equal(data.accountCode, 'CASH:' + actor.account);
      const result = page.locator('#g2-result[data-status="posted"][data-completed="' +
        (seq + 1) + '"]');
      await result.waitFor();
      assert.equal(await result.getAttribute('data-payment-id'), data.id);
      assert.equal(await result.getAttribute('data-cash-balance'), String(expectedCash));
      assert.equal(await result.getAttribute('data-party-balance'), String(expectedParty));
      assert.equal(await result.getAttribute('data-mode'), actor.mode === 'ON' ? 'OPEN' : 'OFF');
      assert.equal(await result.getAttribute('data-session-id'), session || '');
      assert.equal(posts.length, postCount + 1);
      assert.equal(posts.at(-1).key, key, 'original persistent key on actual POST');
      assert.equal(posts.at(-1).path, expectedPath(kind));
      const current = databaseState(actor.tenant);
      const countField = kind === 'CUSTOMER_RECEIPT' ? 'receipts' : 'supplierPayments';
      assert.equal(current[countField], before[countField] + 1, 'exactly one source document');
      assert.equal(current.entries, before.entries + 1, 'exactly one new balanced journal');
      assert.equal(persistedSession(kind === 'CUSTOMER_RECEIPT'
        ? 'customer_receipts' : 'supplier_payments', data.id, actor.tenant),
      session || 'NULL', 'real source document Cash Day link');
      const source = ok(await api('/api/v1/money/accounts', 'GET', undefined, actor.token),
        200, 'cash source after POST');
      assert.equal(source.accounts.find(a => a.id === actor.account)?.balanceMinor, expectedCash);
      const role = kind === 'CUSTOMER_RECEIPT' ? 'CUSTOMER' : 'SUPPLIER';
      const partyId = role === 'CUSTOMER' ? actor.customer : actor.supplier;
      const detail = ok(await api('/api/v2/parties/' + partyId + '?role=' + role,
        'GET', undefined, actor.token), 200, 'Party source after POST');
      assert.equal(detail.data.balance.netMinor, expectedParty);
      return data.id;
    }
    async function replay(actor, kind, key, expectedId, expectedCash, expectedParty) {
      const baseline = databaseState(actor.tenant);
      const previous = Number(await page.locator('#g2-result').getAttribute('data-completed'));
      await page.setViewportSize({ width: 1280, height: 850 });
      await page.locator('#g2-post').focus();
      const responsePromise = responseFor(kind);
      await page.keyboard.press('Enter');
      const response = await responsePromise;
      assert.equal(response.status(), 201, 'actual Nest replay response');
      assert.equal((await response.json()).data.id, expectedId, 'same source document on replay');
      await page.locator('#g2-result[data-status="posted"][data-completed="' +
        (previous + 1) + '"]').waitFor();
      assert.equal(await page.locator('#g2-result').getAttribute('data-payment-id'), expectedId);
      assert.equal(await page.locator('#g2-result').getAttribute('data-cash-balance'), String(expectedCash));
      assert.equal(await page.locator('#g2-result').getAttribute('data-party-balance'), String(expectedParty));
      assert.equal(posts.at(-1).key, key, 'no new retry key');
      assert.deepEqual(databaseState(actor.tenant), baseline, 'no second settlement/journal');
    }
    async function logout() {
      await page.locator('#g2-logout').click();
      await page.locator('#g2-session[data-status="signed-out"]').waitFor();
      assert.equal(await page.locator('#g2-post').isDisabled(), true);
    }

    await login(on);
    const onCustomerKey = id();
    await fill(on, 'CUSTOMER_RECEIPT', '23.50', onCustomerKey);
    await blockedNoPost(on, 'CUSTOMER_RECEIPT', onCustomerKey,
      /start|cash day|eligible|verif/i);
    console.log('G2_ON_UNOPENED_CLIENT_ZERO_POST_PASS');
    const onDay = ok(await api('/api/v1/money/day', 'GET', undefined, on.token),
      200, 'ON day before start');
    const started = ok(await api('/api/v1/money/day/start', 'POST', {
      businessDate: onDay.businessDate, openingAmountMinor: 50000,
      counterpartAccountCode: null, note: null, operationId: id(),
    }, on.token), 201, 'real Cash Day start').data.id;
    assertId(started);
    const onCustomerId = await money(on, 'CUSTOMER_RECEIPT', '23.50',
      onCustomerKey, 52350, -2350, started);
    await replay(on, 'CUSTOMER_RECEIPT', onCustomerKey, onCustomerId, 52350, -2350);
    const onSupplierKey = id();
    const onSupplierId = await money(on, 'SUPPLIER_PAYMENT', '200.00',
      onSupplierKey, 32350, -80000, started);
    await replay(on, 'SUPPLIER_PAYMENT', onSupplierKey, onSupplierId, 32350, -80000);
    console.log('G2_ON_OPEN_CASH_RECEIPT_SUPPLIER_REPLAY_PASS');
    await logout();

    await login(off);
    const offDay = ok(await api('/api/v1/money/day', 'GET', undefined, off.token),
      200, 'OFF without a session');
    assert.equal(offDay.enabled, false);
    assert.equal(offDay.todaySession, null);
    const offCustomerKey = id();
    const offCustomerId = await money(off, 'CUSTOMER_RECEIPT', '23.50',
      offCustomerKey, 52350, -2350, null);
    await replay(off, 'CUSTOMER_RECEIPT', offCustomerKey, offCustomerId, 52350, -2350);
    const offSupplierKey = id();
    const offSupplierId = await money(off, 'SUPPLIER_PAYMENT', '200.00',
      offSupplierKey, 32350, -80000, null);
    await replay(off, 'SUPPLIER_PAYMENT', offSupplierKey, offSupplierId, 32350, -80000);
    console.log('G2_OFF_NO_DAY_CASH_RECEIPT_SUPPLIER_REPLAY_PASS');

    // The test-owned UI still goes through Nest's atomic cash-out shortage
    // enforcement. This reaches the server (expected HTTP 400), but posts no
    // document/journal and must not alter the business's recorded balance.
    await fill(off, 'SUPPLIER_PAYMENT', '400.00', id());
    const shortageState = databaseState(off.tenant);
    const shortageResponse = responseFor('SUPPLIER_PAYMENT');
    const shortageSequence = Number(await page.locator('#g2-result').getAttribute('data-completed'));
    await page.locator('#g2-post').click();
    const shortage = await shortageResponse;
    assert.equal(shortage.status(), 400, 'actual Nest drawer insufficient cash denial');
    const shortageJson = await shortage.json();
    assert.equal(shortageJson.error?.details?.reason, 'CASH_ACCOUNT_SHORT');
    await page.locator('#g2-result[data-status="error"][data-completed="' +
      (shortageSequence + 1) + '"]').waitFor();
    assert.deepEqual(databaseState(off.tenant), shortageState,
      'cash shortage must not change posted documents/journals');
    console.log('G2_OFF_CASH_SHORTAGE_ROLLBACK_PASS');
    await logout();
    assert.deepEqual(errors, [], 'no React browser runtime exceptions');
    console.log('G2 PASS: authentic signed CASH ON/OFF customer+supplier POST, 4 original payments/4 same-key replays, 2 tenant RLS, source account/AP/advance rereads, PG16 session_id and balanced journal, ON-unopened blocked, OFF shortage rollback');
  } finally {
    await browser?.close();
    await vite.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
