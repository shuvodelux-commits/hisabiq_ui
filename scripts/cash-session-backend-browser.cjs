/* eslint-env node */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

const BASE = 'http://127.0.0.1:4463';
const SESSION_ID = '01ARZ3NDEKTSV4RRFFQ69G5FAV';

function liveFixture() {
  const day = {
    enabled: true,
    drawerAccountId: SESSION_ID,
    businessDate: '2026-11-10',
    todaySession: null,
    blockedByDate: null,
    blockedSession: null,
    previousClosingMinor: null,
    drawerBalanceMinor: 0,
    canReopenToday: false,
  };
  let session = null;
  const history = [];
  const calls = [];
  const respond = async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    assert.equal(request.headers().authorization, 'Bearer verified-test-token');
    const input = method === 'POST' ? request.postDataJSON() : null;
    calls.push({ path, method, input });
    let body;
    if (path === '/api/v1/money/day' && method === 'GET') {
      body = day;
    } else if (path === '/api/v1/money/accounts' && method === 'GET') {
      body = { accounts: [], totalCashMinor: 0, totalBankMinor: 0, totalMfsMinor: 0, totalLoanMinor: 0 };
    } else if (path === '/api/v1/money/daily-cash' && method === 'GET') {
      body = { rows: history, page: { nextCursor: null, hasMore: false } };
    } else if (path === '/api/v1/money/day/start' && method === 'POST') {
      assert.equal(input.businessDate, day.businessDate);
      assert.equal(input.openingAmountMinor, 20000);
      assert.equal(input.counterpartAccountCode, 'OWNER_CURRENT_ACCOUNT');
      assert.equal(input.operationId.length, 26);
      session = {
        id: SESSION_ID, number: 'CS-2026-000001', accountId: SESSION_ID,
        accountName: 'Main Cash Drawer', businessDate: day.businessDate,
        status: 'OPEN', openingAmountMinor: 20000, previousClosingMinor: null,
        cashInMinor: 0, cashOutMinor: 0, expectedClosingMinor: 20000,
        openedAt: '2026-11-10T09:00:00+06:00', openedByName: 'Owner',
        closes: [], version: 1,
      };
      day.todaySession = session;
      day.drawerBalanceMinor = 20000;
      history.splice(0, history.length, {
        sessionId: SESSION_ID, businessDate: day.businessDate, status: 'OPEN',
        openingAmountMinor: 20000, cashInMinor: 0, cashOutMinor: 0,
        expectedClosingMinor: null, countedClosingMinor: null, differenceMinor: null,
        differenceKind: null, differenceReason: null, wasReopened: false,
      });
      body = { data: session };
    } else if (path === '/api/v1/money/day/' + SESSION_ID + '/close' && method === 'POST') {
      assert.equal(input.countedClosingMinor, 20000);
      assert.equal(input.reason, null);
      assert.equal(input.operationId.length, 26);
      assert.ok(session, 'the day must be opened before closing');
      session = {
        ...session, status: 'CLOSED', version: 2,
        closes: [{
          id: SESSION_ID, status: 'ACTIVE', openingAmountMinor: 20000,
          cashInMinor: 0, cashOutMinor: 0, expectedClosingMinor: 20000,
          countedClosingMinor: 20000, differenceMinor: 0, differenceKind: 'MATCHED',
          differenceReason: null, reopenReason: null,
          closedAt: '2026-11-10T18:00:00+06:00', closedByName: 'Owner', supersededAt: null,
        }],
      };
      day.todaySession = session;
      day.canReopenToday = true;
      history[0] = {
        ...history[0], status: 'CLOSED', expectedClosingMinor: 20000,
        countedClosingMinor: 20000, differenceMinor: 0, differenceKind: 'MATCHED',
      };
      body = { data: session };
    } else {
      throw new Error('Unexpected Cash API call: ' + method + ' ' + path);
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  };
  return { respond, calls };
}

async function run(browser, width, height, theme) {
  const context = await browser.newContext({
    viewport: { width, height }, colorScheme: theme,
    hasTouch: width < 600, reducedMotion: 'reduce',
  });
  const fixture = liveFixture();
  await context.addInitScript(({ theme }) => {
    localStorage.setItem('shererp_auth_token', 'verified-test-token');
    localStorage.setItem('hisabiq-theme', theme);
  }, { theme });
  await context.route('https://fonts.googleapis.com/**', route => route.abort());
  await context.route('**/api/v1/**', fixture.respond);
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  try {
    await page.goto(BASE + '/#/app/finance?tab=cash', { waitUntil: 'domcontentloaded' });
    const tab = page.getByRole('tab', { name: 'Cash Sessions', exact: true });
    await tab.click();
    const open = page.getByRole('button', { name: 'Open cash session', exact: true }).last();
    await expect(open).toBeVisible();
    await open.click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await modal.getByLabel('Opening cash', { exact: true }).fill('200');
    await modal.getByRole('combobox', { name: 'Cash adjustment account' }).click();
    await page.getByRole('option', { name: 'Owner funds', exact: true }).click();
    await modal.getByRole('button', { name: 'Open session', exact: true }).click();
    await expect(modal).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Count / close cash session' })).toBeVisible();

    await page.getByRole('button', { name: 'Count / close cash session' }).click();
    await expect(modal).toBeVisible();
    await modal.getByLabel('Cash counted', { exact: true }).fill('200');
    await modal.getByRole('button', { name: 'Close session', exact: true }).click();
    await expect(modal).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Review closed cash day', exact: true })).toBeVisible();
    await expect(page.getByRole('table').getByText(SESSION_ID, { exact: true })).toBeVisible();
    assert.equal(await page.getByText('CS-000240', { exact: true }).count(), 0,
      'seeded preview session must not be displayed as connected history');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2), true,
      'connected Cash Sessions must fit the viewport');
    assert.deepEqual(pageErrors, []);
    assert.equal(fixture.calls.filter(call => call.method === 'POST').length, 2,
      'one real start and one real close, no duplicate posting');
    console.log('PASS live cash flow', width, height, theme);
  } finally {
    await context.close();
  }
}

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({
    cacheDir: '.superpowers/vite-cash-api-cache',
    server: { host: '127.0.0.1', port: 4463, strictPort: true },
  });
  await server.listen();
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox'],
  });
  try {
    for (const theme of ['light', 'dark']) {
      await run(browser, 1440, 900, theme);
      await run(browser, 390, 844, theme);
    }
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
