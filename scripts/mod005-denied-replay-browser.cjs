/* Issue #557, front-end safety test only.
 * Exercises the real mounted React providers with controlled HTTP transport.
 * This is NOT a real Nest/PG16 accounting acceptance test.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { createServer } = require('vite');

const tenant = '01ARZ3NDEKTSV4RRFFQ69G5FAA';
const user = '01ARZ3NDEKTSV4RRFFQ69G5FAC';
const drawer = '01ARZ3NDEKTSV4RRFFQ69G5FAF';
const sessionId = '01ARZ3NDEKTSV4RRFFQ69G5FAG';
const businessDate = '2026-11-14';

function session(status) {
  return {
    id: sessionId, number: 'CASH-1', accountId: drawer,
    accountName: 'QA cash drawer', businessDate, status,
    openingAmountMinor: 0, previousClosingMinor: null,
    cashInMinor: 0, cashOutMinor: 0, expectedClosingMinor: 0,
    openedAt: '2026-11-14T07:00:00.000Z', openedByName: 'QA owner',
    closes: [], version: status === 'CLOSED' ? 2 : 1,
  };
}
const respond = (route, value, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
function responseError(route, status) {
  return respond(route, {
    error: {
      code: status === 401 ? 'AUTH_UNAUTHORIZED' : status === 403 ? 'PERMISSION_DENIED' : 'CASH_CONFLICT',
      message: 'HTTP ' + status + ' confirmation denied',
      details: {}, traceId: 'qa-denied-replay',
    },
  }, status);
}
const root = '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div>' +
  '<script type="module">import RefreshRuntime from "/@react-refresh";' +
  'RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};' +
  'window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script>' +
  '<script type="module" src="/tests/mod005CashP0RuntimeHarness.tsx"></script></body></html>';

async function scenario(browser, origin, width, denial, firstDenied = false) {
  let token = 'qa-access-1';
  let refreshCount = 0;
  let status = null;
  let firstStartId = null;
  let nextStartId = null;
  let deniedReplays = 0;
  let acceptedReplays = 0;
  let startAttempts = 0;
  const closeWrites = [];
  const browserErrors = [];
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 900 },
    hasTouch: width === 390, reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.route('**/__m505_denied_browser', route =>
    route.fulfill({ contentType: 'text/html', body: root }));
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const bearer = request.headers().authorization?.replace(/^Bearer /, '');
    if (path === '/api/v1/auth/login') return respond(route, {
      data: {
        accessToken: token, refreshToken: 'qa-refresh-1',
        user: { id: user, username: 'qa-owner' },
      },
    });
    if (path === '/api/v1/auth/refresh') {
      refreshCount += 1;
      token = 'qa-access-' + (refreshCount + 1);
      return respond(route, {
        data: {
          accessToken: token, refreshToken: 'qa-refresh-' + (refreshCount + 1),
          user: { id: user, username: 'qa-owner' },
        },
      });
    }
    if (path === '/api/v1/auth/logout') return route.fulfill({ status: 204, body: '' });
    assert.equal(bearer, token, 'every signed request uses latest access token');
    if (path === '/api/v1/me') return respond(route, {
      data: {
        tenantId: tenant, timezone: 'Asia/Dhaka',
        user: { id: user, username: 'qa-owner', displayName: 'QA Owner', roleName: 'Owner' },
        businessName: 'QA hardware', permissions: [
          'cash.daily.view', 'cash.session.start', 'cash.session.close',
        ], features: [],
      },
    });
    if (path === '/api/v1/money/day') {
      assert.equal(request.method(), 'GET');
      return respond(route, {
        enabled: true, drawerAccountId: drawer, businessDate,
        todaySession: status === null ? null : session(status),
        blockedByDate: null, blockedSession: null,
        previousClosingMinor: null, drawerBalanceMinor: 0,
        canReopenToday: status === 'CLOSED',
      });
    }
    if (path === '/api/v1/money/daily-cash') return respond(route, {
      rows: [], page: { nextCursor: null, hasMore: false },
    });
    if (path === '/api/v1/money/accounts') return respond(route, []);
    if (path === '/api/v1/money/day/start') {
      assert.equal(request.method(), 'POST');
      const body = request.postDataJSON();
      assert.equal(body.operationId, request.headers()['idempotency-key']);
      assert.equal(body.openingAmountMinor, 0);
      startAttempts += 1;
      if (startAttempts === 1) {
        firstStartId = body.operationId;
        if (firstDenied) return responseError(route, denial); // definitely not posted
        status = 'OPEN'; // deterministic local model of an already-committed upstream
        return route.abort('failed'); // browser never receives the committed response
      }
      if (firstDenied) {
        nextStartId = body.operationId;
        status = 'OPEN';
        return respond(route, { data: session('OPEN') }, 201);
      }
      assert.equal(body.operationId, firstStartId, 'all confirmation calls reuse original economic key');
      if (deniedReplays === 0) {
        deniedReplays += 1;
        return responseError(route, denial);
      }
      acceptedReplays += 1;
      return respond(route, { data: session('OPEN') }, 201);
    }
    if (path === '/api/v1/money/day/' + sessionId + '/close') {
      closeWrites.push(request.postDataJSON().operationId);
      if (acceptedReplays === 0) return responseError(route, 409);
      status = 'CLOSED';
      return respond(route, { data: session('CLOSED') }, 201);
    }
    throw new Error('Unexpected QA path ' + request.method() + ' ' + path);
  });

  async function state(key, want) {
    await page.waitForFunction(([k, v]) =>
      document.querySelector('#cash-state')?.getAttribute('data-' + k) === v,
      [key, want]);
  }
  async function clickResult(button, marker) {
    const before = await page.locator('#result').getAttribute('data-sequence');
    await page.locator(button).click();
    await page.waitForFunction(([oldSerial, value]) => {
      const result = document.querySelector('#result');
      return result?.getAttribute('data-sequence') !== oldSerial &&
        result?.textContent?.startsWith(value);
    }, [before, marker]);
  }
  try {
    await page.goto(origin + '/__m505_denied_browser');
    await clickResult('#login-a', 'confirmed');
    await state('mode', 'connected');
    await clickResult('#start', 'failed:');
    assert.equal(startAttempts, 1);
    if (firstDenied) {
      await state('pending', 'no');
      await clickResult('#refresh', 'confirmed');
      await state('mode', 'connected');
      await state('open', 'no');
      await clickResult('#start', 'confirmed');
      await state('open', 'yes');
      assert.equal(startAttempts, 2);
      assert.notEqual(nextStartId, firstStartId,
        'a definitely refused first attempt must not pin an unposted key');
      assert.equal(closeWrites.length, 0);
      assert.deepEqual(browserErrors, []);
      console.log('PASS initial definitive HTTP ' + denial + ', width=' + width +
        ', new key only after server refused first intent');
      return;
    }
    await clickResult('#refresh', 'confirmed');
    await state('mode', 'connected');
    await state('open', 'yes');
    await state('pending', 'yes');

    await clickResult('#confirm-previous', 'failed:');
    assert.equal(deniedReplays, 1);
    // P0 assertion: a denial of the second attempt is NOT proof the first was unposted.
    await state('pending', 'yes');
    await clickResult('#refresh', 'confirmed');
    await state('mode', 'connected');
    await state('pending', 'yes');
    await clickResult('#close', 'failed:');
    assert.equal(closeWrites.length, 0,
      'another economic action must remain blocked before original-key confirmation');
    assert.match(await page.locator('#result').innerText(), /previous cash operation/i);

    await clickResult('#confirm-previous', 'confirmed');
    await state('pending', 'no');
    assert.equal(startAttempts, 3); // original, denied original-key confirmation, successful confirmation
    assert.equal(acceptedReplays, 1);
    await clickResult('#close', 'confirmed');
    assert.equal(closeWrites.length, 1);
    assert.notEqual(closeWrites[0], firstStartId, 'new intent gets new ID only after confirmation');
    await state('open', 'no');
    assert.equal(await page.locator('#auth-status').getAttribute('data-epoch'), '1');
    assert.deepEqual(browserErrors, []);
    console.log('PASS actual mounted provider with controlled HTTP ' + denial +
      ', width=' + width + ', one original ID retained until explicit success');
  } finally {
    await context.close();
  }
}
(async () => {
  const server = await createServer({
    server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false },
    logLevel: 'error',
  });
  await server.listen();
  const port = server.httpServer.address().port;
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || '/usr/bin/chromium',
      headless: true, args: ['--no-sandbox'],
    });
    for (const width of [1440, 390]) {
      for (const denial of [401, 403, 409]) {
        await scenario(browser, 'http://127.0.0.1:' + port, width, denial);
      }
      for (const denial of [401, 403]) {
        await scenario(browser, 'http://127.0.0.1:' + port, width, denial, true);
      }
    }
  } finally {
    await browser?.close();
    await server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
