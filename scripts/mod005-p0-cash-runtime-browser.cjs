/* MOD-005 P0 mounted React+SessionStore regression, mocked HTTP only.
 * No real business, tenant database or cash posting is touched.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const tenant = '01ARZ3NDEKTSV4RRFFQ69G5FAA';
const user = '01ARZ3NDEKTSV4RRFFQ69G5FAC';
const drawer = '01ARZ3NDEKTSV4RRFFQ69G5FAF';
const sessionId = '01ARZ3NDEKTSV4RRFFQ69G5FAG';
const businessDate = '2026-11-13';
const postedIds = [];
const forbiddenWrites = [];
const pageErrors = [];
let attempt = 0;
let currentToken = 'cash-access-1';
let sessionOpen = false;

function day() {
  return {
    enabled: true, drawerAccountId: drawer, businessDate,
    todaySession: sessionOpen ? {
      id: sessionId, number: 'CASH-1', accountId: drawer,
      accountName: 'Main cash drawer', businessDate, status: 'OPEN',
      openingAmountMinor: 0, previousClosingMinor: null, cashInMinor: 0,
      cashOutMinor: 0, expectedClosingMinor: 0,
      openedAt: '2026-11-13T07:00:00.000Z', openedByName: 'Cashier',
      closes: [], version: 1,
    } : null,
    blockedByDate: null, blockedSession: null, previousClosingMinor: null,
    drawerBalanceMinor: 0, canReopenToday: false,
  };
}
const respond = (route, value, status = 200) => route.fulfill({
  status, contentType: 'application/json', body: JSON.stringify(value),
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const { createServer } = await import('vite');
  const server = await createServer({
    server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false },
    logLevel: 'error',
  });
  await server.listen();
  const port = server.httpServer.address().port;
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      headless: true, args: ['--no-sandbox'],
    });
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 }, reducedMotion: 'reduce',
    });
    page.setDefaultTimeout(15_000);
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.route('**/__mod005_p0_browser', route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="UTF-8"></head><body><div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh"; RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => (type) => type; window.__vite_plugin_react_preamble_installed__ = true;</script><script type="module" src="/tests/mod005CashP0RuntimeHarness.tsx"></script></body></html>',
    }));
    await page.route('**/api/v1/**', async route => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      const token = request.headers().authorization?.replace(/^Bearer /, '');
      if (path === '/api/v1/auth/login') {
        currentToken = 'cash-access-1';
        return respond(route, { data: {
          accessToken: currentToken, refreshToken: 'cash-refresh-1',
          user: { id: user, username: 'cashier' },
        } });
      }
      if (path === '/api/v1/auth/refresh') {
        currentToken = 'cash-access-2';
        return respond(route, { data: {
          accessToken: currentToken, refreshToken: 'cash-refresh-2',
          user: { id: user, username: 'cashier' },
        } });
      }
      if (path === '/api/v1/auth/logout') return route.fulfill({ status: 204, body: '' });
      if (path === '/api/v1/me') {
        assert.equal(token, currentToken, 'verified auth must use current access token');
        return respond(route, { data: {
          tenantId: tenant, timezone: 'Asia/Dhaka',
          user: { id: user, username: 'cashier', displayName: 'Cashier', roleName: 'Cashier' },
          businessName: 'Test hardware', permissions: ['cash.daily.view','cash.session.start'],
          features: [],
        } });
      }
      assert.equal(token, currentToken, 'server calls require latest verified access token');
      if (path === '/api/v1/money/day') {
        assert.equal(request.method(), 'GET');
        return respond(route, day());
      }
      if (path === '/api/v1/money/daily-cash') {
        assert.equal(request.method(), 'GET');
        return respond(route, { rows: [], page: { nextCursor: null, hasMore: false } });
      }
      if (path === '/api/v1/money/accounts') {
        assert.equal(request.method(), 'GET');
        return respond(route, { error: {
          code: 'PERMISSION_DENIED', message: 'No account-list permission',
          details: {}, traceId: 'mock-permission',
        } }, 403);
      }
      if (path === '/api/v1/money/day/start') {
        assert.equal(request.method(), 'POST');
        const body = request.postDataJSON();
        assert.equal(body.businessDate, businessDate);
        assert.equal(body.openingAmountMinor, 0);
        assert.equal(body.counterpartAccountCode, null);
        assert.equal(body.operationId, request.headers()['idempotency-key']);
        postedIds.push(body.operationId);
        attempt += 1;
        if (attempt === 1) return route.abort('failed');
        sessionOpen = true;
        return respond(route, { data: day().todaySession });
      }
      forbiddenWrites.push(request.method() + ' ' + path);
      throw Error('Unexpected or forbidden API call ' + path);
    });

    await page.goto('http://127.0.0.1:' + port + '/__mod005_p0_browser');
    await page.locator('#login-a').click();
    const view = page.locator('#cash-state');
    await page.waitForFunction(() => document.querySelector('#cash-state')?.getAttribute('data-mode') === 'connected');
    assert.equal(await view.getAttribute('data-can-view'), 'yes',
      'cash.daily.view is usable without account-list permission');
    assert.equal(await view.getAttribute('data-enabled'), 'yes');
    assert.equal(await view.getAttribute('data-access'), 'permission-denied');
    assert.equal(await page.locator('#cash-error').innerText(), '',
      'account 403 does not suppress independently authorized day status');

    await page.locator('#start').click();
    await page.getByText(/failed: /).waitFor();
    assert.equal(postedIds.length, 1);
    assert.match(postedIds[0], /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
    assert.equal(await view.getAttribute('data-open'), 'no');

    await page.locator('#refresh').click();
    await page.waitForFunction(() => document.querySelector('#cash-state')?.getAttribute('data-mode') === 'connected' &&
      document.querySelector('#result')?.textContent === 'confirmed');
    assert.equal(await page.locator('#auth-status').getAttribute('data-epoch'), '1',
      'verified token rotation retains same identity epoch');
    assert.equal(await view.getAttribute('data-access'), 'permission-denied');

    await page.locator('#start').click();
    await page.waitForFunction(() => document.querySelector('#cash-state')?.getAttribute('data-open') === 'yes');
    assert.equal(attempt, 2);
    assert.equal(postedIds[0], postedIds[1],
      'unknown POST outcome must keep its canonical idempotency key across token rotation');
    assert.deepEqual(forbiddenWrites, [], 'no surprise financial writers or fixture fallbacks');
    assert.deepEqual(pageErrors, [], 'mounted React cash provider must not throw');
    console.log('MOD-005 P0: connected cash day survives account 403; same-epoch refresh reused uncertain POST operation ID. PASS');
  } finally {
    await browser?.close();
    await server.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
