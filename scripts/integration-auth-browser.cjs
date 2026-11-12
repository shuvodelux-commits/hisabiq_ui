/* F0-06: isolated browser contract, fake same-origin responses, no DB/test account writes.
 * F0-07 separately runs real Nest→PostgreSQL integration. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const USER = '01JCCQ8MTS8SZ9G3HVJ8D3A7AA';
const TENANT = '01JCCQ8MTS8SZ9G3HVJ8D3A7AC';
const ORIGIN = 'http://127.0.0.1:4209';
const storageKey = 'hisabiq.live.session.v1';

async function main() {
  process.env.VITE_HISABIQ_INTEGRATION_MODE = 'connected';
  const { createServer } = await import('vite');
  const server = await createServer({
    server: { host: '127.0.0.1', port: 4209, strictPort: true },
  });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox'],
    });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const requests = [];
    const errors = [];
    let rotations = 0;
    let loginCalls = 0;
    let pinCalls = 0;
    let meCalls = 0;
    let expectedRefresh = '';
    const loginBody = () => ({
      data: {
        accessToken: 'verified.access.' + (rotations + 1),
        refreshToken: 'verified.refresh.' + (rotations + 1),
        user: { id: USER, username: 'rahim' },
      },
    });
    const profile = {
      data: {
        tenantId: TENANT, timezone: 'Asia/Dhaka',
        user: { id: USER, username: 'rahim', displayName: 'Rahim Live', roleName: 'Owner' },
        businessName: 'Verified Electrical', permissions: ['settings.setting.view'],
        features: ['cash_sessions'],
      },
    };
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/v1/**', async route => {
      const req = route.request();
      const url = new URL(req.url());
      const path = url.pathname;
      requests.push({ path, method: req.method() });
      const input = req.postDataJSON() || {};
      const json = body => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
      if (path === '/api/v1/auth/login' && req.method() === 'POST') {
        loginCalls++;
        assert.deepEqual(input, { identifier: '01711000245', password: 'correct-password' });
        rotations++;
        expectedRefresh = 'verified.refresh.' + rotations;
        return json(loginBody());
      }
      if (path === '/api/v1/auth/refresh' && req.method() === 'POST') {
        assert.equal(input.refreshToken, expectedRefresh);
        rotations++;
        expectedRefresh = 'verified.refresh.' + rotations;
        return json(loginBody());
      }
      if (path === '/api/v1/auth/login/pin' && req.method() === 'POST') {
        pinCalls++;
        assert.deepEqual(input, { refreshToken: expectedRefresh, pin: '123456' });
        rotations++;
        expectedRefresh = 'verified.refresh.' + rotations;
        return json(loginBody());
      }
      if (path === '/api/v1/me' && req.method() === 'GET') {
        meCalls++;
        assert.ok(req.headers().authorization?.startsWith('Bearer verified.access.'));
        return json(profile);
      }
      if (path === '/api/v1/auth/logout') return route.fulfill({ status: 204, body: '' });
      return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Unknown path' } }) });
    });
    const go = async path => page.goto(ORIGIN + '/#' + path);
    await go('/app/pos');
    await page.getByRole('heading', { name: /Sign in|সাইন ইন/ }).waitFor({ timeout: 10_000 });
    assert.equal(await page.getByText('Rahim Ahmed', { exact: true }).count(), 0, 'No sample workspace users in connected mode');
    assert.ok(page.url().includes('/login'), 'connected /app must redirect to login, not mount preview POS');

    await go('/login/accounts?account=nusrat');
    await page.getByRole('heading', { name: /Choose account|অ্যাকাউন্ট বাছুন/ }).waitFor();
    assert.equal(await page.getByText('Nusrat Jahan', { exact: true }).count(), 0);
    assert.equal(await page.getByText('Rahim Ahmed', { exact: true }).count(), 0);
    await go('/login');
    await page.getByLabel('Mobile number').fill('০১৭১১-০০০২৪৫');
    await page.getByLabel('Password', { exact: true }).fill('correct-password');
    await page.getByRole('button', { name: /^Sign in$/ }).click();
    await page.getByText('Workspace access pending', { exact: false }).waitFor({ timeout: 10_000 });
    assert.equal(loginCalls, 1);
    assert.equal(meCalls, 1);

    const stored = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), storageKey);
    assert.deepEqual(stored, { schema: 1, refreshToken: expectedRefresh });
    const local = await page.evaluate(() => JSON.stringify(Object.entries(localStorage)));
    assert.ok(!local.includes('verified.access') && !local.includes('verified.refresh'), 'No credentials in localStorage');

    await go('/app/dashboard');
    await page.getByText('Workspace access pending', { exact: false }).waitFor();
    assert.equal(await page.getByText('Sample accounts', { exact: false }).count(), 0);
    assert.equal(await page.locator('[data-erp-table]').count(), 0, 'No preview ERP tables in connected mode');

    await page.reload();
    await page.waitForFunction(() => document.body.textContent?.includes('Workspace access pending'));
    assert.equal(meCalls, 2, 'Restored login must call /me after a single refresh');
    const rotated = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), storageKey);
    assert.deepEqual(rotated, { schema: 1, refreshToken: expectedRefresh });

    await go('/login/pin?account=nusrat');
    await page.getByLabel('Enter your 6-digit PIN').fill('১২৩৪৫৬');
    await page.getByRole('button', { name: /^Sign in$/ }).click();
    await page.getByText('Workspace access pending', { exact: false }).waitFor();
    assert.equal(pinCalls, 1);
    assert.equal(meCalls, 3);
    assert.equal(await page.getByText('Nusrat Jahan', { exact: true }).count(), 0);

    // No tested route may switch to a preview business workspace.
    await go('/app/settings');
    await page.getByText('Workspace access pending', { exact: false }).waitFor();
    assert.equal(await page.getByText('Sample accounts', { exact: false }).count(), 0);
    assert.deepEqual(errors, []);
    console.log('F0-06 connected auth browser passed: no preview workspace, login, /me, restore, PIN and tenant isolation');
  } finally {
    await browser?.close();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
