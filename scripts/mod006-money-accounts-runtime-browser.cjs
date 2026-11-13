/* P2-B executable read-only Finance browser QA. Only test HTTP fixtures;
 * this does not open AppShell or use production/retained PostgreSQL.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const ids = {
  tenantA: '01ARZ3NDEKTSV4RRFFQ69G5FAA',
  tenantB: '01ARZ3NDEKTSV4RRFFQ69G5FAB',
  userA: '01ARZ3NDEKTSV4RRFFQ69G5FAC',
  userB: '01ARZ3NDEKTSV4RRFFQ69G5FAD',
  cash: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  bank: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
  loan: '01ARZ3NDEKTSV4RRFFQ69G5FAX',
  mfs: '01ARZ3NDEKTSV4RRFFQ69G5FAY',
  cashB: '01ARZ3NDEKTSV4RRFFQ69G5FAZ',
  inactive: '01ARZ3NDEKTSV4RRFFQ69G5FAT',
  line: '01ARZ3NDEKTSV4RRFFQ69G5FAR',
  source: '01ARZ3NDEKTSV4RRFFQ69G5FAS',
};
const actor = {
  'access-A-1': { tenant: ids.tenantA, user: ids.userA, username: 'tenant-a' },
  'access-A-2': { tenant: ids.tenantA, user: ids.userA, username: 'tenant-a' },
  'access-B-1': { tenant: ids.tenantB, user: ids.userB, username: 'tenant-b' },
};

function account(id, type, balanceMinor, openingAmountMinor, status = 'ACTIVE') {
  return {
    id, name: id === ids.inactive ? 'Inactive cash' : 'Shared account',
    type, holderName: null, reference: null, isDrawer: type === 'CASH' && id !== ids.inactive,
    status, balanceMinor, openingAmountMinor,
    openingDate: openingAmountMinor === null ? null : '2026-11-01', version: 1,
  };
}
function list(token, includeInactive) {
  if (token === 'access-B-1') {
    return {
      accounts: [account(ids.cashB, 'CASH', 15501, null)],
      totalCashMinor: 15501, totalBankMinor: 0, totalMfsMinor: 0, totalLoanMinor: 0,
    };
  }
  const cashBalance = token === 'access-A-1' ? 111123 : 411123;
  const accounts = [
    account(ids.cash, 'CASH', cashBalance, null),
    account(ids.bank, 'BANK', 222234, 0),
    account(ids.mfs, 'MFS', 3030, 3030),
    account(ids.loan, 'LOAN', 777700, 777700),
  ];
  if (includeInactive) accounts.push(account(ids.inactive, 'CASH', 0, 0, 'INACTIVE'));
  return {
    accounts, totalCashMinor: cashBalance, totalBankMinor: 222234,
    totalMfsMinor: 3030, totalLoanMinor: 777700,
  };
}
function statement(token, id) {
  const a = list(token, true).accounts.find(x => x.id === id);
  assert.ok(a, 'server statement for allowed account only');
  return {
    accountId: a.id, accountName: a.name, type: a.type,
    openingBalanceMinor: 100000, closingBalanceMinor: a.balanceMinor,
    totalInMinor: 500, totalOutMinor: 0,
    rows: [{
      journalLineId: ids.line, businessDate: '2026-11-13',
      createdAt: '2026-11-13T07:00:00.000Z', sourceType: 'SALE',
      sourceNumber: 'SALE-001', sourceId: ids.source,
      description: 'Verified statement ' + id, reference: 'SALE-001',
      amountMinor: 500, debitMinor: 500, creditMinor: 0,
      runningBalanceMinor: a.balanceMinor,
    }],
    page: { nextCursor: null, hasMore: false },
  };
}
const reply = (route, value, status = 200) => route.fulfill({
  contentType: 'application/json', status, body: JSON.stringify(value),
});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const { createServer } = await import('vite');
  const server = await createServer({
    server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false },
    logLevel: 'error',
  });
  await server.listen();
  const port = server.httpServer.address().port;
  const held = new Map();
  const pauseRequests = new Set();
  const requestedAccounts = [];
  const writes = [];
  const pageErrors = [];
  let browser, accessToken = 'access-A-1', deny = false;
  const waitForHeld = async key => {
    for (let i = 0; i < 120; i++) {
      if (held.has(key)) return;
      await pause(25);
    }
    throw new Error('Missing held list request: ' + key);
  };
  const release = async key => {
    const task = held.get(key);
    assert.ok(task, 'request was held: ' + key);
    held.delete(key);
    await task().catch(() => undefined); // React cancellation aborts superseded GETs.
  };
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox'],
      headless: true,
    });
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 }, reducedMotion: 'reduce',
    });
    page.setDefaultTimeout(15_000);
    page.on('pageerror', error => { pageErrors.push(error.message); console.error('PAGE ERROR:', error.message); });
    page.on('console', message => { if (message.type() === 'error') console.error('CONSOLE ERROR:', message.text()); });
    page.on('response', response => { if (response.status() >= 400) console.error('HTTP ERROR:', response.status(), response.url()); });
    await page.route('**/__mod006_p2b_accounts', route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="UTF-8"></head><body><div id="root"></div><script type="module">import RefreshRuntime from "/@react-refresh"; RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => (type) => type; window.__vite_plugin_react_preamble_installed__ = true;</script><script type="module" src="/tests/mod006MoneyAccountsRuntimeHarness.tsx"></script></body></html>',
    }));
    await page.route('**/api/v1/**', async route => {
      const request = route.request(), url = new URL(request.url());
      const token = request.headers().authorization?.replace(/^Bearer /, '');
      console.log('API:', request.method(), url.pathname, token || '(no bearer)');
      if (url.pathname === '/api/v1/auth/login') {
        accessToken = request.postDataJSON().identifier === 'tenant-b' ? 'access-B-1' : 'access-A-1';
        const who = actor[accessToken];
        return reply(route, { data: {
          accessToken, refreshToken: accessToken.replace('access', 'refresh'),
          user: { id: who.user, username: who.username },
        } });
      }
      if (url.pathname === '/api/v1/auth/refresh') {
        accessToken = 'access-A-2';
        return reply(route, { data: {
          accessToken, refreshToken: 'refresh-A-2',
          user: { id: ids.userA, username: 'tenant-a' },
        } });
      }
      if (url.pathname === '/api/v1/auth/logout') return route.fulfill({ status: 204, body: '' });
      if (url.pathname === '/api/v1/me') {
        assert.equal(token, accessToken, 'verified /me uses current bearer');
        const who = actor[token];
        return reply(route, { data: {
          tenantId: who.tenant, timezone: 'Asia/Dhaka',
          user: { id: who.user, username: who.username, displayName: 'Test owner', roleName: 'Owner' },
          businessName: 'Sandbox business', permissions: ['cash.account.view','bank.account.view'],
          features: [],
        } });
      }
      if (request.method() !== 'GET') {
        writes.push(request.method() + ' ' + url.pathname);
        return reply(route, { error: { code: 'METHOD_NOT_ALLOWED', message: 'Read-only', details:{}, traceId:'mock' } }, 405);
      }
      if (url.pathname === '/api/v1/money/accounts') {
        assert.ok(actor[token], 'list requires verified bearer');
        requestedAccounts.push({ token, query: url.search });
        if (deny) {
          return reply(route, { error: { code: 'PERMISSION_DENIED', message: 'No account list permission',
            details: {}, traceId: 'permission-mock' } }, 403);
        }
        const key = token + ':list';
        if (pauseRequests.has(key)) {
          pauseRequests.delete(key);
          held.set(key, () => reply(route, list(token, url.searchParams.get('includeInactive') === 'true')));
          return;
        }
        return reply(route, list(token, url.searchParams.get('includeInactive') === 'true'));
      }
      if (url.pathname.startsWith('/api/v1/money/accounts/') && url.pathname.endsWith('/statement')) {
        const id = url.pathname.split('/')[5];
        assert.ok(actor[token], 'statement requires verified bearer');
        const found = list(token, true).accounts.some(x => x.id === id);
        if (!found) return reply(route, { error: { code:'NOT_FOUND', message:'Account not found',
          details:{}, traceId:'foreign-mock' } }, 404);
        return reply(route, statement(token, id));
      }
      throw new Error('Unexpected GET: ' + url.pathname);
    });

    await page.goto('http://127.0.0.1:' + port + '/__mod006_p2b_accounts');
    const accounts = page.locator('[data-connected-money-account]');
    const session = page.locator('#verified-session');
    assert.equal(await accounts.count(), 0, 'no preview accounts on initial signed-out render');
    await page.locator('#login-a').click();
    await page.locator('[data-connected-money-account="' + ids.loan + '"]').waitFor().catch(async error => {
      console.error('BROWSER DOM:', (await page.locator('body').innerText()).slice(0, 4000));
      console.error('AUTH DATA:', await page.locator('#verified-session').getAttribute('data-status'));
      throw error;
    });
    assert.equal(await session.getAttribute('data-tenant'), ids.tenantA);
    assert.equal(await accounts.count(), 4);
    assert.equal(await page.locator('[data-connected-money-summary]').getByText('৳7,777').count(), 0,
      'lender liability excluded from liquid summaries');
    assert.equal(await page.locator('[data-connected-money-liabilities]').getByText('৳7,777').count() > 0, true);
    assert.ok((await page.locator('[data-connected-money-account="' + ids.cash + '"]').innerText())
      .includes('Not recorded'), 'missing opening must never read as zero');
    assert.ok((await page.locator('[data-connected-money-account="' + ids.bank + '"]').innerText())
      .includes('৳0'), 'explicit zero opening is displayed');
    assert.equal(await page.getByRole('button', { name: 'Add account' }).isDisabled(), true);
    assert.equal(await page.getByRole('button', { name: 'Transfer', exact: true }).first().isDisabled(), true);
    assert.equal(await page.getByText('Main Cash Counter').count(), 0, 'no demo fixture account fallback');

    // Identical names do not become identity. The canonical server ULID is
    // present in each ledger button's accessible name and outgoing GET.
    const cashCard = page.locator('[data-connected-money-account="' + ids.cash + '"]');
    const bankCard = page.locator('[data-connected-money-account="' + ids.bank + '"]');
    await cashCard.getByRole('button', { name: /View ledger for/ }).click();
    await page.getByText('Verified statement ' + ids.cash).waitFor().catch(async error => {
      console.error('STATEMENT FIRST DIALOG:', (await page.locator('body').innerText()).slice(-3500));
      throw error;
    });
    await bankCard.getByRole('button', { name: /View ledger for/ }).evaluate(button => button.click());
    await page.getByText('Verified statement ' + ids.bank).waitFor();
    assert.equal(await page.getByText('Verified statement ' + ids.cash).count(), 0);

    // Same tenant, same epoch, different bearer. Old list, balances and
    // printable statement immediately disappear before the new GET resolves.
    pauseRequests.add('access-A-2:list');
    await page.locator('#refresh-token').evaluate(button => button.click());
    await waitForHeld('access-A-2:list');
    assert.equal(await session.getAttribute('data-epoch'), '1');
    assert.equal(await accounts.count(), 0, 'old account balances hidden during token rotation');
    assert.equal(await page.getByRole('dialog').count(), 0, 'old statement cannot be printed after rotation');
    await release('access-A-2:list');
    await page.locator('[data-connected-money-account="' + ids.cash + '"]').waitFor();
    assert.ok((await cashCard.innerText()).includes('৳4,111.23'), 'fresh balance replaces old scoped balance');

    // Backend can deny account list without ever leaking old results.
    deny = true;
    await page.getByRole('button', { name: 'Refresh' }).click();
    await page.getByRole('alert').getByText(/Account-list permission is required/).waitFor();
    assert.equal(await accounts.count(), 0, 'permission-denied list never shows old account data');
    deny = false;
    await page.getByRole('button', { name: 'Refresh' }).click();
    await page.locator('[data-connected-money-account="' + ids.cash + '"]').waitFor();

    // includeInactive uses backend query, not preview local filtering.
    await page.getByRole('checkbox', { name: 'Include inactive accounts' }).check();
    await page.locator('[data-connected-money-account="' + ids.inactive + '"]').waitFor();
    assert.ok(requestedAccounts.some(x => x.query.includes('includeInactive=true')));

    // Switch to another verified tenant, including a duplicate account name.
    // Neither tenant A's list, loan, or selected print may cross identities.
    await page.locator('#login-b').click();
    await page.locator('[data-connected-money-account="' + ids.cashB + '"]').waitFor();
    assert.equal(await session.getAttribute('data-tenant'), ids.tenantB);
    assert.equal(await accounts.count(), 1);
    assert.equal(await page.locator('[data-connected-money-liabilities]').count(), 0);
    assert.equal(await page.locator('[data-connected-money-account="' + ids.cash + '"]').count(), 0);
    await page.locator('[data-connected-money-account="' + ids.cashB + '"]')
      .getByRole('button', { name: /View ledger for/ }).click();
    await page.getByText('Verified statement ' + ids.cashB).waitFor();
    await page.locator('#logout').evaluate(button => button.click());
    await page.waitForFunction(() => document.querySelector('#verified-session')?.getAttribute('data-status') === 'signed-out');
    assert.equal(await accounts.count(), 0);
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(await page.getByText('Verified statement ' + ids.cashB).count(), 0);

    // Restore A, verify Bangla helper and no mobile horizontal overflow.
    await page.locator('#login-a').click();
    await page.locator('[data-connected-money-account="' + ids.cash + '"]').waitFor();
    await page.locator('#language').click();
    await page.getByText('টাকার হিসাব').first().waitFor();
    for (const width of [320, 390, 768, 1440]) {
      for (const theme of ['light', 'dark']) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(dark => document.documentElement.classList.toggle('dark', dark), theme === 'dark');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          'no horizontal overflow at ' + width + ' ' + theme);
        const dir = process.env.MOD006_P2B_SCREENSHOT_DIR;
        if (dir && (width === 320 || width === 1440)) {
          require('node:fs').mkdirSync(dir, { recursive: true });
          await page.screenshot({ path: dir + '/accounts-' + width + '-' + theme + '.png', fullPage: true });
        }
      }
    }
    assert.deepEqual(writes, [], 'Money Accounts composition performed zero business writes');
    assert.deepEqual(pageErrors, [], 'mounted React view has no uncaught errors');
    const sessionTokens = await page.evaluate(() =>
      JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
    assert.ok(!sessionTokens.includes('access-A-1') && !sessionTokens.includes('access-A-2'),
      'bearer access tokens cannot be persisted in page storage');
    console.log('MOD-006 P2-B mock-backed React browser: scoped accounts, permission denial, tenant rotation, duplicates, bilingual and responsive PASS');
  } finally {
    await browser?.close();
    await server.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
