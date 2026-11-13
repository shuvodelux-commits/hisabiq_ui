/* MOD-006 P2-A executable React + SessionStore browser regression.
 * Uses mocked HTTP on a TEST-ONLY synthetic page, NOT a live PostgreSQL backend
 * or an activated connected AppShell. No production route/file is added.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const tenantA = '01ARZ3NDEKTSV4RRFFQ69G5FAA';
const tenantB = '01ARZ3NDEKTSV4RRFFQ69G5FAB';
const userA = '01ARZ3NDEKTSV4RRFFQ69G5FAC';
const userB = '01ARZ3NDEKTSV4RRFFQ69G5FAD';
const accountA = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const accountB = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const journalLine = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const journalSource = '01ARZ3NDEKTSV4RRFFQ69G5FAY';

const credentials = {
  'access-A-1': { tenantId: tenantA, userId: userA, username: 'owner-a' },
  'access-A-2': { tenantId: tenantA, userId: userA, username: 'owner-a' },
  'access-B-1': { tenantId: tenantB, userId: userB, username: 'owner-b' },
};

function statement(accountId, accessToken) {
  const marker = accessToken === 'access-A-1' ? 'A1 OLD PRIVATE ROW'
    : accessToken === 'access-A-2' && accountId === accountB ? 'A2 ACCOUNT B ROW'
    : accessToken === 'access-A-2' ? 'A2 FRESH SESSION ROW'
    : 'TENANT B ISOLATED ROW';
  return {
    accountId, accountName: accountId === accountA ? 'Shared account name' : 'Shared account name',
    type: 'BANK',
    openingBalanceMinor: 100000,
    closingBalanceMinor: accessToken === 'access-B-1' ? 55000 : 100500,
    totalInMinor: 500,
    totalOutMinor: 0,
    rows: [{
      journalLineId: journalLine, businessDate: '2026-01-03',
      createdAt: '2026-01-03T12:00:00.000Z',
      sourceType: 'SALE', sourceNumber: 'INV-1', sourceId: journalSource,
      description: marker, reference: 'INV-1',
      amountMinor: 500, debitMinor: 500, creditMinor: 0,
      runningBalanceMinor: 100500,
    }],
    page: { nextCursor: null, hasMore: false },
  };
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({
    server: { host: '127.0.0.1', port: 0, strictPort: false },
    logLevel: 'error',
  });
  await server.listen();
  const port = server.httpServer.address().port;
  let browser;
  const pending = new Map();
  const holds = new Set();
  const financialWrites = [];
  const pageErrors = [];
  let liveAuth = 'access-A-1';

  async function waitForPending(key) {
    for (let i = 0; i < 150; i++) {
      if (pending.has(key)) return;
      await delay(25);
    }
    throw new Error('Expected delayed account request did not arrive: ' + key);
  }
  async function release(key) {
    const fn = pending.get(key);
    assert.ok(fn, 'held request ' + key);
    pending.delete(key);
    try { await fn(); } catch { /* React cancellation may abort the held GET. */ }
  }
  const json = (route, body, status = 200) => route.fulfill({
    status, contentType: 'application/json', body: JSON.stringify(body),
  });

  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox'],
      headless: true,
    });
    const page = await browser.newPage({
      viewport: { width: 390, height: 850 }, reducedMotion: 'reduce',
    });
    page.on('pageerror', error => { pageErrors.push(error.message); console.error('PAGE ERROR:', error.message); });
    page.on('console', message => { if (message.type() === 'error') console.error('BROWSER ERROR:', message.text()); });
    page.on('response', response => {
      if (response.status() >= 400) console.error('HTTP RESOURCE ERROR:', response.status(), response.url());
    });
    page.on('requestfailed', request => console.error('RESOURCE FAILED:', request.method(), request.url(), request.failure()?.errorText));
    await page.route('**/__mod006_statement_runtime', route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="UTF-8"></head><body><div id="root"></div><script type="module" src="/tests/mod006StatementRuntimeHarness.tsx"></script></body></html>',
    }));
    await page.route('**/api/v1/**', async route => {
      const request = route.request();
      const url = new URL(request.url());
      if (request.method() !== 'GET' && !url.pathname.startsWith('/api/v1/auth/')) {
        financialWrites.push(request.method() + ' ' + url.pathname);
      }
      if (url.pathname === '/api/v1/auth/login') {
        const identifier = request.postDataJSON().identifier;
        liveAuth = identifier === 'tenant-b' ? 'access-B-1' : 'access-A-1';
        const who = credentials[liveAuth];
        return json(route, { data: {
          accessToken: liveAuth, refreshToken: liveAuth.replace('access','refresh'),
          user: { id: who.userId, username: who.username },
        } });
      }
      if (url.pathname === '/api/v1/auth/refresh') {
        liveAuth = 'access-A-2';
        const who = credentials[liveAuth];
        return json(route, { data: {
          accessToken: liveAuth, refreshToken: 'refresh-A-2',
          user: { id: who.userId, username: who.username },
        } });
      }
      if (url.pathname === '/api/v1/auth/logout') {
        return route.fulfill({ status: 204, body: '' });
      }
      if (url.pathname === '/api/v1/me') {
        const token = request.headers().authorization?.replace(/^Bearer /,'');
        const who = credentials[token];
        assert.ok(who, 'verified bearer required for /me');
        return json(route, { data: {
          tenantId: who.tenantId, timezone: 'Asia/Dhaka',
          user: { id: who.userId, username: who.username,
            displayName: 'Test Owner', roleName: 'Owner' },
          businessName: 'Test business', permissions: ['bank.account.view'],
          features: [],
        } });
      }
      if (url.pathname.startsWith('/api/v1/money/accounts/') && url.pathname.endsWith('/statement')) {
        assert.equal(request.method(), 'GET', 'account history cannot POST');
        const token = request.headers().authorization?.replace(/^Bearer /,'');
        assert.ok(credentials[token], 'verified bearer required for account statement');
        const id = url.pathname.split('/')[5];
        assert.ok([accountA,accountB].includes(id), 'real ULID account selected');
        const key = token + ':' + id;
        if (holds.has(key)) {
          holds.delete(key);
          pending.set(key, () => json(route, statement(id, token)));
          return;
        }
        return json(route, statement(id, token));
      }
      throw new Error('Unexpected API route: ' + request.method() + ' ' + url.pathname);
    });

    await page.goto('http://127.0.0.1:' + port + '/__mod006_statement_runtime');
    const session = page.locator('#session-state');
    await session.waitFor({ timeout: 15_000 }).catch(async error => {
      console.error('RUNTIME HARNESS DOM:', (await page.locator('body').innerHTML()).slice(0, 2500));
      throw error;
    });
    assert.equal(await session.getAttribute('data-status'), 'signed-out');
    await page.locator('#login-a').click();
    await page.getByText('A1 OLD PRIVATE ROW').waitFor();
    assert.equal(await session.getAttribute('data-tenant'), tenantA);
    assert.equal(await page.getByRole('button', { name: 'Print' }).isEnabled(), true);

    // Same tenant/user/epoch on refresh, but a NEW access token. The source
    // account statement and printable old page must vanish synchronously.
    holds.add('access-A-2:' + accountA);
    await page.locator('#refresh').click();
    await waitForPending('access-A-2:' + accountA);
    await page.getByText('A1 OLD PRIVATE ROW').waitFor({ state: 'hidden' });
    assert.equal(await page.getByRole('button', { name: 'Print' }).isDisabled(), true,
      'old session statement must not be printable during refresh');
    assert.equal(await session.getAttribute('data-tenant'), tenantA);
    await release('access-A-2:' + accountA);
    await page.getByText('A2 FRESH SESSION ROW').waitFor();

    // Different server account with the SAME name: no name matching, no stale
    // page/print while B fetch is held.
    holds.add('access-A-2:' + accountB);
    await page.locator('#account-b').click();
    await waitForPending('access-A-2:' + accountB);
    await page.getByText('A2 FRESH SESSION ROW').waitFor({ state: 'hidden' });
    assert.equal(await page.getByRole('button', { name: 'Print' }).isDisabled(), true);
    await release('access-A-2:' + accountB);
    await page.getByText('A2 ACCOUNT B ROW').waitFor();

    // Account B -> A -> B while A is in flight; abandoned A's late result
    // must never replace B and A's ID must not become B's page identity.
    holds.add('access-A-2:' + accountA);
    await page.locator('#account-a').click();
    await waitForPending('access-A-2:' + accountA);
    await page.locator('#account-b').click();
    await page.getByText('A2 ACCOUNT B ROW').waitFor();
    await release('access-A-2:' + accountA);
    assert.equal(await page.getByText('A2 FRESH SESSION ROW').count(), 0);

    // Wrong-tenant selected record cannot render even while authenticated.
    await page.locator('#pin-old').click();
    await page.locator('#logout').click();
    await session.locator('[data-unused]').count().catch(() => 0);
    await page.waitForFunction(() => document.querySelector('#session-state')?.getAttribute('data-status') === 'signed-out');
    assert.equal(await page.getByRole('dialog').count(), 0);
    await page.locator('#login-b').click();
    await page.getByText('TENANT B ISOLATED ROW').waitFor();
    assert.equal(await session.getAttribute('data-tenant'), tenantB);
    await page.locator('#try-old').click();
    assert.equal(await page.getByRole('dialog').count(), 0,
      'old tenant selection cannot survive new verified tenant');
    await page.locator('#restore-selection').click();
    await page.getByText('TENANT B ISOLATED ROW').waitFor();
    assert.equal(await page.getByText('A1 OLD PRIVATE ROW').count(), 0);
    assert.equal(await page.getByText('A2 FRESH SESSION ROW').count(), 0);
    assert.deepEqual(financialWrites, [], 'no server money writes made');

    const storage = await page.evaluate(() =>
      JSON.stringify([Object.entries(sessionStorage), Object.entries(localStorage)]));
    assert.ok(!storage.includes('access-A-1') &&
      !storage.includes('access-A-2') && !storage.includes('access-B-1'),
      'access tokens never persisted by the runtime harness');
    assert.deepEqual(pageErrors, [], 'no uncaught real-browser runtime errors');
    console.log('MOD-006 mounted dialog: 7 scoped transitions passed, real React hooks, GET only, no retained backend.');
  } finally {
    await browser?.close();
    await server.close();
  }
}
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
