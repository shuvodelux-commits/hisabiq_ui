/**
 * MOD-008 P4D — real React SessionStore + connected Draft inspector browser
 * acceptance with mock Nest GETs. Test HTML lives ONLY in tests/fixtures,
 * never in the Vite production entry or the deployed Workers bundle.
 *
 * This is NOT a React→Nest→PostgreSQL test. The production /app gate stays shut.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const ORIGIN = 'http://127.0.0.1:4216';
const TENANT_A = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const TENANT_B = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const USER_A = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const USER_B = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const USER_RESTRICTED = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const SUPPLIER = '01ARZ3NDEKTSV4RRFFQ69G5FB0';
const PRODUCT = '01ARZ3NDEKTSV4RRFFQ69G5FB1';
const DRAFT = '01ARZ3NDEKTSV4RRFFQ69G5FB2';
const ALL_PERMISSIONS = [
  'purchase.bill.create', 'inventory.cost.view',
  'party.supplier.view', 'catalog.product.view',
];
const roles = {
  'owner-a': { access: 'testA.access', refresh: 'testA.refresh',
    userId: USER_A, tenantId: TENANT_A, business: 'Electrical A',
    permissions: ALL_PERMISSIONS },
  'owner-b': { access: 'testB.access', refresh: 'testB.refresh',
    userId: USER_B, tenantId: TENANT_B, business: 'Electrical B',
    permissions: ALL_PERMISSIONS },
  restricted: { access: 'testRestricted.access', refresh: 'testRestricted.refresh',
    userId: USER_RESTRICTED, tenantId: TENANT_A, business: 'Electrical A',
    permissions: ALL_PERMISSIONS.slice(0, 2) },
};
const activeFor = access => Object.values(roles).find(value => value.access === access);

const supplier = {
  id: SUPPLIER, name: 'Rahman Traders', roles: ['CUSTOMER', 'SUPPLIER'],
  phone: null, address: null, guardianName: null, nid: null, email: null,
  notes: null, customerGroupId: null, customerGroupName: null,
  creditLimitMinor: null, status: 'ACTIVE', isSystemReserved: false,
  version: 1, hasLedgerEntries: false,
  balance: { netMinor: 0, direction: 'SETTLED', outstandingMinor: 0, advanceMinor: 0 },
};
const product = {
  id: PRODUCT, name: 'Copper Cable', displayName: 'Copper Cable',
  brandId: null, brandName: null, categoryId: null, categoryName: null,
  parentCategoryName: null, sku: null, barcode: null, description: null,
  baseUnitId: TENANT_A, baseUnitName: 'Feet',
  sellingPriceMinor: 2400, purchasePriceMinor: 1700,
  minStockQty: 0, status: 'ACTIVE', defaultDiscountType: null,
  defaultDiscountValue: null, offerEnabled: false, offerPriceMinor: null,
  offerStartDate: null, offerEndDate: null, offerLive: false,
  hasImage: false, tracksExpiry: false, tracksSerial: false,
  conversion: { unitId: USER_A, unitName: 'Pipe', factorQty: 20000 },
  stockQty: 100000, stockStatus: 'IN_STOCK', hasStockHistory: true,
  usualSupplierId: SUPPLIER, usualSupplierName: 'Rahman Traders',
  minOrderQty: null, warrantyMonths: null, supplierWarrantyMonths: null,
  version: 1,
};

const editor = {
  tenantId: TENANT_A, supplierId: SUPPLIER, supplierName: 'Rahman Traders',
  date: '2026-11-13', backdateReason: '', referenceNo: 'INV-TEST-77',
  notes: 'Retain the precise multi-unit entry', photos: [],
  discount: '5', discountMode: 'percent', total: 123.45,
  lines: [{
    id: 'line-1',
    product: {
      id: PRODUCT, name: 'Copper Cable', unit: 'Feet',
      purchasePrice: 17, sellPrice: 24,
      unitRelations: [
        { leftUnit: 'Box', rightUnit: 'Pipe', quantity: 12 },
        { leftUnit: 'Pipe', rightUnit: 'Feet', quantity: 20 },
      ],
      unitPurchasePrices: { Box: 3000.125, Pipe: 260.25, Feet: 17 },
      unitSellPrices: { Box: 3600, Pipe: 330.125, Feet: 24 },
    },
    bigQty: '1', smallQty: '1.2500',
    unitQuantities: { Box: '1', Pipe: '2', Feet: '1.2500' },
    cost: '260.25', costUnit: 'Pipe', lotSellPrice: '36.125',
    lotSellUnit: 'Feet', detailsOpen: true, serialText: 'SER-1',
    batchNumber: 'LOT-99', manufactureDate: '2026-10-01',
    expiryDate: '2027-10-01',
  }],
  payments: [
    { id: 'pay-1', method: 'Cash', account: 'Drawer A', amount: '23.45' },
    { id: 'pay-2', method: 'Bank', account: 'Bank 01', amount: '100' },
  ],
};
const savedDraft = {
  id: DRAFT, label: 'INV-TEST-77', supplierName: 'Rahman Traders',
  itemCount: 1, grandTotalMinor: 12345,
  cart: { schema: 'hisabiq.purchase-editor.draft.v1', tenantId: TENANT_A, editor },
  businessDate: '2026-11-13', savedAt: '2026-11-13T08:00:00.000Z',
  createdAt: '2026-11-13T07:59:00.000Z', version: 1,
  deletedAt: null, recoverableUntilEpochMs: null,
};
function send(route, data, status = 200) {
  return route.fulfill({ status, contentType: 'application/json',
    body: JSON.stringify(data) });
}
function apiError(route, status = 403) {
  return send(route, { error: { code: 'FORBIDDEN', message: 'Denied',
    details: {}, traceId: 'test-trace' } }, status);
}

async function exercise(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport, height: 844 }, reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  let denyProduct = false;
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/v1/**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();
    requests.push({ method, path });
    assert.equal(url.origin, ORIGIN, 'same-origin fake API only');
    const header = req.headers()['authorization'] || '';
    const role = activeFor(header.replace(/^Bearer /, ''));
    if (path === '/api/v1/auth/login' && method === 'POST') {
      const input = req.postDataJSON();
      assert.equal(input.password, 'test-password');
      const current = roles[input.identifier];
      assert.ok(current, 'only named mock users may sign in');
      return send(route, { data: {
        accessToken: current.access, refreshToken: current.refresh,
        user: { id: current.userId, username: input.identifier },
      } });
    }
    if (path === '/api/v1/auth/logout' && method === 'POST')
      return route.fulfill({ status: 204, body: '' });
    if (path === '/api/v1/me' && method === 'GET') {
      assert.ok(role, 'Nest /me requires bearer token');
      return send(route, { data: {
        tenantId: role.tenantId, timezone: 'Asia/Dhaka',
        user: {
          id: role.userId, username: 'test-user',
          displayName: 'Test Owner', roleName: 'Owner',
        },
        businessName: role.business,
        permissions: role.permissions, features: [],
      } });
    }
    if (!role || method !== 'GET') return apiError(route, 403);
    if (path === '/api/v1/purchases/drafts') {
      assert.equal(url.search, '');
      return send(route, { data: role.tenantId === TENANT_A
        ? [savedDraft] : [] });
    }
    if (path === '/api/v1/purchases/drafts/' + DRAFT) {
      return role.tenantId === TENANT_A
        ? send(route, { data: savedDraft }) : apiError(route);
    }
    if (path === '/api/v1/parties/' + SUPPLIER) {
      assert.equal(url.searchParams.get('role'), 'SUPPLIER');
      return role.tenantId === TENANT_A
        ? send(route, { data: supplier }) : apiError(route);
    }
    if (path === '/api/v1/products/' + PRODUCT) {
      if (denyProduct || role.tenantId !== TENANT_A) return apiError(route);
      return send(route, { data: product });
    }
    throw Error('Unexpected API request ' + method + ' ' + path);
  });
  const openFixture = async () => {
    await page.goto(ORIGIN + '/tests/fixtures/connected-purchase-drafts.html');
    await page.locator('[data-test-session-status]').waitFor();
  };
  const login = async (kind, business) => {
    await page.locator('[data-test-login-' + kind + ']').click();
    await page.getByText('Verified: ' + business, { exact: true }).waitFor();
  };
  const trigger = page.locator('[data-connected-purchase-drafts-trigger]');
  const draftRow = () => page.locator('[data-connected-purchase-drafts-list]');
  try {
    await openFixture();
    assert.equal(await trigger.isDisabled(), true);
    await login('a', 'Electrical A');
    assert.equal(await trigger.isEnabled(), true);
    await trigger.click();
    await draftRow().getByText('INV-TEST-77', { exact: true }).waitFor();
    const reviewButton = page.getByRole('button', { name: 'Review', exact: true });
    assert.equal(await reviewButton.isEnabled(), true);

    await reviewButton.click();
    const details = page.locator('[data-connected-draft-readonly]');
    await details.getByText('Stored draft total').waitFor();
    for (const item of [
      '1 Box · 2 Pipe · 1.2500 Feet', '3000.125', '330.125',
      '36.125', 'SER-1', 'LOT-99', '2027-10-01', '23.45',
      '100', 'Read-only', 'INDEPENDENT',
    ].filter(x => x !== 'INDEPENDENT')) {
      assert.ok(await details.getByText(item, { exact: false }).count() > 0,
        'Review must preserve ' + item);
    }
    assert.equal(await details.getByRole('button', { name: /Edit|Post|Confirm|Save/i }).count(), 0);
    const width = await page.evaluate(() =>
      ({ viewport: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth }));
    assert.ok(width.scroll <= width.viewport + 2,
      viewport + 'px Review overflow: ' + JSON.stringify(width));
    const back = details.getByRole('button', { name: 'Back to drafts' });
    await back.focus();
    assert.equal(await back.evaluate(node => document.activeElement === node), true,
      'Back action must be keyboard focusable');
    await page.keyboard.press('Enter');
    await draftRow().getByText('INV-TEST-77', { exact: true }).waitFor();

    // Force a real SessionStore authentication switch while the Drafts
    // dialog is open. Do not navigate through a production connected route.
    await page.evaluate(() => {
      document.querySelector('[data-test-login-b]')?.click();
    });
    await page.getByText('Verified: Electrical B').waitFor();
    await page.getByText('INV-TEST-77', { exact: true }).waitFor({
      state: 'detached',
    });
    assert.equal(await page.locator('[data-connected-draft-readonly]').count(), 0);
    assert.equal(await page.getByText('Rahman Traders').count(), 0);

    await trigger.click();
    await draftRow().getByText('No saved purchase drafts in this section.').waitFor();
    await page.keyboard.press('Escape');

    await login('restricted', 'Electrical A');
    await trigger.click();
    await draftRow().getByText('INV-TEST-77', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Review', exact: true }).isDisabled(), true);
    await page.keyboard.press('Escape');

    await login('a', 'Electrical A');
    await trigger.click();
    await draftRow().getByText('INV-TEST-77', { exact: true }).waitFor();
    denyProduct = true;
    await page.getByRole('button', { name: 'Review', exact: true }).click();
    await page.getByText('Access to this draft or its supplier/products was denied.').waitFor();
    assert.equal(await page.locator('[data-connected-draft-readonly]').getByText('3000.125').count(), 0);
    await page.keyboard.press('Escape');

    assert.deepEqual(errors, [], 'No unhandled React page errors');
    assert.equal(requests.filter(r =>
      r.path.startsWith('/api/v1/purchases') && r.method !== 'GET').length, 0,
    'Draft review must not write');
    assert.equal(requests.filter(r =>
      /\/api\/v1\/(stock|inventory|journal|money|cash|payment)/.test(r.path)).length, 0,
    'Draft review must not perform financial or inventory actions');
    console.log('Connected Draft inspector browser acceptance passed at ' +
      viewport + 'px; ' + requests.length + ' mocked Nest requests, no draft writes');
  } finally {
    await context.close();
  }
}
async function main() {
  process.env.VITE_HISABIQ_INTEGRATION_MODE = 'connected';
  const { createServer } = await import('vite');
  const server = await createServer({
    cacheDir: '.superpowers/connected-purchase-drafts-browser-cache',
    server: { host: '127.0.0.1', port: 4216, strictPort: true },
  });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox'],
    });
    for (const viewport of [320, 390]) await exercise(browser, viewport);
  } finally {
    await browser?.close();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
