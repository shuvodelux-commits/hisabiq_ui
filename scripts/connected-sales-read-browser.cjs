/* MOD-009 R09-SALES-BROWSER-QA-11 — isolated, MOCK-ONLY rendered React QA.
 *
 * Explicitly NO real Nest, tenant DB, account mutation, production route, or
 * deployment. Auth and every invoice/return read are Playwright stubs; browser
 * network interception refuses all other API operations and external traffic.
 *
 * Run: HISABIQ_R09_MOCK_ONLY=isolated-sales-get-only node scripts/connected-sales-read-browser.cjs
 */
const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const { spawn } = require('node:child_process');
const { resolve } = require('node:path');
const { chromium } = require('playwright');

if (process.env.HISABIQ_R09_MOCK_ONLY !== 'isolated-sales-get-only') {
  throw Error('Refusing browser QA without explicit mock-only acknowledgement');
}
const repo = resolve(__dirname, '..');
const port = '5196';
const origin = 'http://127.0.0.1:' + port;
const fixture = origin + '/tests/fixtures/connected-sales-read-browser.html';
const id = {
  a: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  b: '01ARZ3NDEKTSV4RRFFQ69G5FB5',
  d: '01ARZ3NDEKTSV4RRFFQ69G5FB6',
  voided: '01ARZ3NDEKTSV4RRFFQ69G5FAX',
  party: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
  line: '01ARZ3NDEKTSV4RRFFQ69G5FAZ',
  product: '01ARZ3NDEKTSV4RRFFQ69G5FAY',
  payment: '01ARZ3NDEKTSV4RRFFQ69G5FB0',
  receipt: '01ARZ3NDEKTSV4RRFFQ69G5FB1',
  serial: '01ARZ3NDEKTSV4RRFFQ69G5FB2',
  return: '01ARZ3NDEKTSV4RRFFQ69G5FB3',
  returnLine: '01ARZ3NDEKTSV4RRFFQ69G5FB4',
  tenantA: '01ARZ3NDEKTSV4RRFFQ69G5FC0',
  tenantB: '01ARZ3NDEKTSV4RRFFQ69G5FC1',
  tenantD: '01ARZ3NDEKTSV4RRFFQ69G5FC2',
  userA: '01ARZ3NDEKTSV4RRFFQ69G5FC3',
  userB: '01ARZ3NDEKTSV4RRFFQ69G5FC4',
  userD: '01ARZ3NDEKTSV4RRFFQ69G5FC5',
};
const roles = {
  a: { tenant: id.tenantA, user: id.userA,
    permissions: ['sale.view', 'sales.return.create', 'sales.return.view'] },
  b: { tenant: id.tenantB, user: id.userB, permissions: ['sale.view'] },
  d: { tenant: id.tenantD, user: id.userD,
    permissions: ['sale.view', 'sales.return.view'] },
};
const whoOf = req => {
  const bearer = req.headers().authorization || '';
  return ['a', 'b', 'd'].find(w => bearer === 'Bearer r09-mock-token-' + w) || null;
};
function invoiceRow(w, voided = false) {
  return {
    originMode: 'ONLINE', id: voided ? id.voided : id[w],
    number: 'INV-QA-' + w.toUpperCase() + (voided ? '-VOIDED' : '-POSTED'),
    partyId: id.party, customerName: 'Mock Customer ' + w.toUpperCase(),
    customerPhone: null, businessDate: '2026-11-13', dueDate: null,
    status: voided ? 'VOIDED' : 'POSTED',
    grandTotalMinor: voided ? 1000 : 4500, paidMinor: voided ? 1000 : 3500,
    dueMinor: voided ? 0 : 1000, ageing: 'NOT_DUE',
  };
}
function invoiceList(w) {
  const items = w === 'a' ? [invoiceRow(w), invoiceRow(w, true)] : [invoiceRow(w)];
  return {
    items, nextCursor: null,
    totals: {
      salesMinor: w === 'a' ? 5500 : 4500,
      receivedMinor: w === 'a' ? 4500 : 3500,
      dueMinor: 1000, invoiceCount: items.length,
    },
  };
}
function invoiceDetail(w, voided = false) {
  const row = invoiceRow(w, voided);
  return { data: {
    ...row, isWalkIn: false, customerGuardianName: null, customerAddress: null,
    notes: null, lines: [{
      id: id.line, productId: id.product, productName: 'Mock Switch',
      displayName: null, unitName: 'Pcs', qty: 1000,
      unitPriceMinor: row.grandTotalMinor, lineDiscountMinor: 0,
      lineTotalMinor: row.grandTotalMinor, discountShareMinor: 0,
      netAmountMinor: row.grandTotalMinor,
      source: 'OWN_STOCK', vendorPartyId: null, vendorName: null,
      isProvisionalCost: false, tracksSerial: true, allocations: [],
    }],
    payments: [{
      id: id.payment, accountCode: 'CASH-01', accountName: 'Mock cash',
      accountType: 'CASH', amountMinor: row.paidMinor,
    }],
    itemsTotalMinor: row.grandTotalMinor, discountMinor: 0,
    changeMinor: 0, advanceMinor: 0, version: 1, presentation: null,
    receipts: [{
      id: id.receipt, number: 'RCPT-MOCK-' + w.toUpperCase(),
      businessDate: '2026-11-13', accountName: 'Mock cash', amountMinor: 0,
    }],
    warnings: [], originDeviceName: null, originDeviceCode: null,
    deviceCreatedAt: null,
  } };
}
function returnable() {
  return { data: {
    saleId: id.a, number: 'INV-QA-A-POSTED', businessDate: '2026-11-13',
    customerName: 'Mock Customer A', customerPhone: null, customerAddress: null,
    customerGuardianName: null, partyId: id.party, isWalkIn: false,
    grandTotalMinor: 4500, dueMinor: 1000,
    lines: [{
      saleLineId: id.line, productId: id.product, productName: 'Mock Switch',
      unitName: 'Pcs', qtySold: 1000, qtyReturned: 0, qtyReturnable: 1000,
      valueReturnedMinor: 0, unitPriceMinor: 4500, netAmountMinor: 4500,
      returnable: true, tracksSerial: true,
      serials: [{
        id: id.serial, serialNo: 'QA-SERIAL-A-123', sourceType: 'OWNED',
        vendorPartyId: null,
      }],
    }],
    refundLimit: { perReturnMinor: 5000, perDayMinor: 10000, usedTodayMinor: 0 },
  } };
}
function history(w) {
  if (w !== 'a') return {
    returns: [], nextCursor: null, totalValueMinor: 0, totalRefundMinor: 0,
  };
  return {
    returns: [{
      id: id.return, number: 'SR-QA-A-01', saleId: id.a,
      saleNumber: 'INV-QA-A-POSTED', partyId: id.party,
      customerName: 'Mock Customer A', businessDate: '2026-11-13',
      reason: 'DAMAGED', note: null, returnValueMinor: 3000,
      refundMinor: 1000, creditMinor: 500,
      refundAccountCode: 'CASH-01', refundAccountName: 'Mock cash',
      approvedByName: null, lines: [{
        id: id.returnLine, saleLineId: id.line, productId: id.product,
        productName: 'Mock Switch', unitName: 'Pcs', qty: 1000,
        valueMinor: 3000,
      }],
      createdAt: '2026-11-13T07:15:00.000Z',
    }],
    nextCursor: null, totalValueMinor: 3000, totalRefundMinor: 1000,
  };
}
function send(route, body, status = 200) {
  return route.fulfill({
    status, contentType: 'application/json', body: JSON.stringify(body),
  });
}
function setupMockRoutes(page, requestLog, violations) {
  page.route('**/*', route => {
    const u = new URL(route.request().url());
    if (u.origin !== origin) {
      violations.push('external-request-blocked');
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
  page.route('**/api/v1/**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();
    const who = whoOf(req);
    requestLog.push({ method, path, who });
    try {
      assert.equal(url.origin, origin, 'Only isolated fixture API origin permitted');
      if (path === '/api/v1/auth/login' && method === 'POST') {
        const body = req.postDataJSON();
        const w = String(body.identifier).replace('r09-qa-', '');
        assert.ok(Object.hasOwn(roles, w), 'Only explicit mock identities');
        assert.equal(body.password, 'test-only-password');
        return await send(route, { data: {
          accessToken: 'r09-mock-token-' + w,
          refreshToken: 'r09-mock-refresh-' + w,
          user: { id: roles[w].user, username: 'qa-' + w },
        } });
      }
      assert.ok(who !== null, 'Verified mock bearer required');
      if (path === '/api/v1/me' && method === 'GET') {
        return await send(route, { data: {
          tenantId: roles[who].tenant, timezone: 'Asia/Dhaka',
          user: { id: roles[who].user, username: 'qa-' + who,
            displayName: 'Mock QA ' + who.toUpperCase(), roleName: 'QA' },
          businessName: 'Mock Shop ' + who.toUpperCase(),
          permissions: roles[who].permissions, features: [],
        } });
      }
      assert.equal(method, 'GET', 'No financial/stock/return write may be requested');
      assert.ok(roles[who].permissions.includes('sale.view') ||
        path === '/api/v1/sales-returns', 'Sale listing requires sale.view');
      if (path === '/api/v1/sales') {
        assert.equal(url.searchParams.get('limit'), '20');
        return await send(route, invoiceList(who));
      }
      if (path.startsWith('/api/v1/sales/') && /^\/api\/v1\/sales\/[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(path)) {
        assert.ok(path === '/api/v1/sales/' + id[who] ||
          (who === 'a' && path === '/api/v1/sales/' + id.voided),
          'No cross-tenant invoice ID may be requested');
        return await send(route, invoiceDetail(who, path.endsWith(id.voided)));
      }
      if (path.startsWith('/api/v1/sales-returns/returnable/')) {
        assert.equal(who, 'a', 'Only return-create role A may read returnability');
        assert.ok(roles[who].permissions.includes('sales.return.create'));
        assert.equal(path, '/api/v1/sales-returns/returnable/' + id.a);
        return await send(route, returnable());
      }
      if (path === '/api/v1/sales-returns') {
        assert.ok(roles[who].permissions.includes('sales.return.view'),
          'History GET requires sales.return.view');
        return await send(route, history(who));
      }
      throw Error('Unrecognised API operation: ' + method + ' ' + path);
    } catch (error) {
      violations.push(String(error && error.message || error).replace(/r09-mock-token-[abd]/g, '[redacted]'));
      return await send(route, { error: 'Mock QA blocked unexpected request' }, 599).catch(() => undefined);
    }
  });
}
async function startVite() {
  const server = spawn(process.execPath, [
    'node_modules/vite/bin/vite.js', '--host', '127.0.0.1',
    '--port', port, '--strictPort',
  ], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  server.stdout.on('data', data => { output = (output + data).slice(-5000); });
  server.stderr.on('data', data => { output = (output + data).slice(-5000); });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw Error('Isolated Vite exited before ready: ' + output.slice(-400));
    try {
      const res = await fetch(fixture, { signal: AbortSignal.timeout(750) });
      if (res.status === 200) return server;
    } catch { /* Only local isolated Vite may become ready. */ }
    await new Promise(done => setTimeout(done, 250));
  }
  server.kill('SIGTERM');
  throw Error('Timed out opening isolated Vite fixture: ' + output.slice(-400));
}
async function exercise(browser, width) {
  const context = await browser.newContext({
    viewport: { width, height: 860 }, reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(22_000);
  const requestLog = [];
  const violations = [];
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  setupMockRoutes(page, requestLog, violations);
  const session = page.locator('[data-qa-session]');
  const panel = page.locator('[data-connected-sales-read-workspace]');
  try {
    await page.goto(fixture, { waitUntil: 'domcontentloaded' });
    await session.waitFor({ state: 'visible' });
    assert.match(await session.textContent(), /Session:signed-out/);
    assert.equal(await panel.locator('[data-connected-sales-invoices-table]').count(), 0);
    await page.locator('[data-qa-login-a]').click();
    await page.getByText('Verified:Mock Shop A').waitFor();
    const invoices = panel.locator('[data-connected-sales-invoices-table]');
    await invoices.getByText('INV-QA-A-POSTED').waitFor();
    await invoices.getByText('INV-QA-A-VOIDED').waitFor();
    assert.equal(await panel.getByRole('tab', { name: /Return source/ }).isDisabled(), false);
    assert.equal(await panel.getByRole('tab', { name: /Return history/ }).isDisabled(), false);

    await panel.getByRole('button', { name: /View original invoice: INV-QA-A-POSTED/ }).click();
    await panel.getByText('RCPT-MOCK-A').waitFor();
    await panel.getByRole('button', { name: /Review returnable source/ }).click();
    await panel.getByText('QA-SERIAL-A-123').waitFor();
    assert.equal(await panel.getByRole('tab', { name: /Return source/ }).getAttribute('aria-selected'), 'true');

    await panel.getByRole('tab', { name: /Invoices/ }).click();
    await panel.getByRole('button', { name: /View original invoice: INV-QA-A-VOIDED/ }).click();
    await panel.getByText('INV-QA-A-VOIDED').last().waitFor();
    assert.equal(await panel.getByRole('button', { name: /Review returnable source/ }).count(), 0,
      'Voided original invoice must not expose source-return review');

    await panel.getByRole('tab', { name: /Return history/ }).click();
    await panel.getByText('SR-QA-A-01').waitFor();
    assert.equal(await panel.getByText('Mock Shop B').count(), 0);

    // Real SessionStore changes tenant, epoch, bearer and verified permissions.
    await page.locator('[data-qa-login-b]').click();
    await page.getByText('Verified:Mock Shop B').waitFor();
    assert.equal(await panel.getByRole('tab', { name: /Return source/ }).isDisabled(), true);
    assert.equal(await panel.getByRole('tab', { name: /Return history/ }).isDisabled(), true);
    assert.equal(await panel.getByText('SR-QA-A-01').count(), 0,
      'Tenant A history must disappear synchronously after login B');
    assert.equal(await panel.getByText('QA-SERIAL-A-123').count(), 0);
    await panel.getByRole('tab', { name: /Invoices/ }).click();
    await panel.getByText('INV-QA-B-POSTED').waitFor();
    assert.equal(await panel.getByText('INV-QA-A-POSTED').count(), 0,
      'No prior tenant invoice may appear after tenant switch');

    await page.locator('[data-qa-login-d]').click();
    await page.getByText('Verified:Mock Shop D').waitFor();
    assert.equal(await panel.getByRole('tab', { name: /Return source/ }).isDisabled(), true,
      'sales.return.view must not authorize returnable/source GET');
    assert.equal(await panel.getByRole('tab', { name: /Return history/ }).isDisabled(), false);
    await panel.getByRole('tab', { name: /Return history/ }).click();
    await panel.getByText('No verified sales returns on this page.').waitFor();
    assert.equal(await panel.getByText('SR-QA-A-01').count(), 0);

    assert.deepEqual(violations, [], 'No unauthorized/off-origin/business write API');
    assert.deepEqual(errors, [], 'No React runtime errors');
    const businessCalls = requestLog.filter(x => x.path.startsWith('/api/v1/sales'));
    assert.ok(businessCalls.length >= 5, 'Full list/detail/returnable/history requests exercised');
    assert.ok(businessCalls.every(x => x.method === 'GET'));
    assert.equal(requestLog.some(x => x.who === 'b' &&
      x.path.startsWith('/api/v1/sales-returns')), false,
      'Read-only tenant B cannot call returnability or history');
    assert.equal(requestLog.some(x => x.who === 'd' &&
      x.path.startsWith('/api/v1/sales-returns/returnable')), false,
      'History-only D cannot call returnability');
    assert.ok(requestLog.some(x => x.who === 'd' &&
      x.path === '/api/v1/sales-returns'), 'D can read permitted history');
    console.log('PASS MOCK-ONLY Sales React browser @' + width +
      'px: source, roles, tenant switch, voided, history and GET-only (' +
      businessCalls.length + ' business GETs)');
  } finally {
    await context.close();
  }
}
async function main() {
  let server = null;
  let browser = null;
  try {
    server = await startVite();
    const binary = process.env.PLAYWRIGHT_EXECUTABLE_PATH ||
      (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
    browser = await chromium.launch({
      headless: true, executablePath: binary, args: ['--no-sandbox'],
    });
    await exercise(browser, 1280);
    await exercise(browser, 390);
    console.log('PASS R09 mock browser acceptance; no real API, DB or production activation');
  } finally {
    await browser?.close();
    server?.kill('SIGTERM');
  }
}
main().catch(error => {
  console.error('R09_MOCK_SALES_BROWSER_RED: ' + String(error && error.message || error));
  process.exitCode = 1;
});
