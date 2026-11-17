/* #542: real task-only Nest acceptance. Never print credentials or API bodies. */
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { mkdirSync } = require('node:fs');
const api = 'http://127.0.0.1:3000/api/v1';
async function request(path, { token, body, status = 200 } = {}) {
  const response = await fetch(api + path, {
    method: body ? 'POST' : 'GET', redirect: 'error',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(10000),
  });
  assert.equal(response.status, status, `${path}: expected HTTP ${status}, got ${response.status}`);
  return response.json();
}
async function register(label) {
  const suffix = randomBytes(6).toString('hex');
  const identifier = `qa542-${suffix}@example.com`, username = `qa542${suffix}`;
  const password = randomBytes(24).toString('base64url') + '!aA1';
  const businessName = `QA542 ${label} ${suffix}`;
  const otp = await request('/auth/registration/otp', { body: { identifier } });
  assert.match(otp.data.devCode || '', /^\d{6}$/, 'Task API must use documented development OTP delivery');
  await request('/auth/registration/otp/verify', { body: { identifier, otpCode: otp.data.devCode } });
  await request('/auth/registration', { status: 201, body: {
    identifier, otpCode: otp.data.devCode, businessName, username, password, pin: '736291',
  } });
  const login = await request('/auth/login', { body: { identifier, password } });
  const token = login.data.accessToken;
  const me = (await request('/me', { token })).data;
  assert.equal(me.businessName, businessName, 'Password login must verify the registered business through /me');
  for (const permission of ['settings.setting.view', 'user.account.view', 'user.role.view'])
    assert.ok(me.permissions.includes(permission), `Registered owner must have ${permission}`);
  return { identifier, password, token, me, businessName, username };
}
async function main() {
  // Coordinator attests the pinned task-only API uses PostgreSQL16 on55452; never infer safety from loopback.
  assert.equal(process.env.MOD001_DISPOSABLE_API_ACK, '542:pg16:55452:476cefcdecad55873ee33bd182f12943fb4b1127', 'Explicit task-only API attestation required before registration');
  for (const path of ['/settings', '/users', '/roles']) {
    await request(path, { status: 401 });
    await request(path, { token: 'invalid-disposable-test-token', status: 401 });
  }
  console.log('PASS unauthenticated real settings GET returns 401');
  const a = await register('A');
  const b = await register('B');
  assert.notEqual(a.me.tenantId, b.me.tenantId, 'Two genuine registrations must own distinct tenants');
  for (const [self, other] of [[a, b], [b, a]]) {
    const settings = (await request('/settings', { token: self.token })).data;
    assert.equal(settings.businessName, self.businessName);
    assert.equal(settings.timezone, 'Asia/Dhaka');
    assert.deepEqual(settings.supportedTimezones, ['Asia/Dhaka']);
    // Independent literals from pinned core-contracts/settings.ts, not copied from the response.
    const defaults = {
      inventory_issue_method: 'FIFO', sale_costing_method: 'FIFO', negative_stock_policy: 'BLOCK',
      expired_stock_sale_policy: 'BLOCK', expiry_warn_days: '30', expiry_tracking_enabled: 'off',
      serial_tracking_enabled: 'off', warranty_enabled: 'off', product_offers_enabled: 'on',
      customer_groups_enabled: 'off', wholesale_sales_enabled: 'off', dealer_pricing_enabled: 'off',
      vendor_management_enabled: 'off', vendor_ledger_enabled: 'off', vendor_consignment_enabled: 'off',
      bank_accounts_enabled: 'off', bank_reconciliation_enabled: 'off', cash_session_enabled: 'on',
      customer_field_address_visible: 'on', customer_field_guardian_visible: 'on', customer_field_nid_visible: 'off',
      customer_field_email_visible: 'off', customer_field_notes_visible: 'on', planner_look_back_days: '30', planner_cover_days: '30',
    };
    assert.deepEqual(settings.values, defaults);
    assert.deepEqual(Object.fromEntries(settings.catalogue.map(item => [item.key, item.defaultValue])), defaults);
    for (const item of settings.catalogue) assert.ok(item.options.includes(settings.values[item.key]));
    assert.ok(!JSON.stringify(settings).includes(other.businessName));
    const users = (await request('/users', { token: self.token })).data;
    assert.ok(users.users.some(user => user.username === self.username));
    assert.ok(users.users.every(user => user.id !== other.me.user.id), 'List must exclude foreign tenant principal');
    assert.ok(!JSON.stringify(users).includes(other.identifier));
    self.userCount = users.users.length;
    const roles = (await request('/roles', { token: self.token })).data;
    self.roleCount = roles.roles.length;
    assert.ok(roles.roles.some(role => role.code === 'OWNER'));
  }
  const before = [];
  for (const self of [a, b]) for (const path of ['/settings', '/users', '/roles'])
    before.push((await request(path, { token: self.token })).data);
  assert.ok(before[2].roles.every(role => !before[5].roles.some(other => other.id === role.id)), 'Role records must belong to separate tenants');
  console.log('PASS real password login, /me and isolated A/B settings/users/roles');
  const { createServer } = await import('vite');
  const { chromium } = require('playwright');
  const server = await createServer({ server: { host: '127.0.0.1', port: 4254, strictPort: true,
    proxy: { '/api/v1': { target: 'http://127.0.0.1:3000' } } } });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox'] });
    const failures = [], errors = [], writes = [];
    let abortedReads = 0;
    const run = async (name, scenario) => {
      try { await scenario(); console.log(`PASS ${name}`); }
      catch (error) { failures.push(name); console.error(`RED ${name}: ${error.message.split('\n')[0]}`); }
    };
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    page.on('requestfailed', req => { if (/\/api\/v1\/(settings|users|roles)$/.test(req.url()) && /ABORTED/.test(req.failure()?.errorText || '')) abortedReads++; });
    page.on('pageerror', () => errors.push('pageerror'));
    page.on('request', req => {
      if (/\/api\/v1\/(settings|users|roles)(?:\/|$)/.test(req.url()) && req.method() !== 'GET') writes.push(req.method());
    });
    await page.goto('http://127.0.0.1:4254/tests/fixtures/mod001-connected-settings-team.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.getByLabel('Identifier', { exact: true }).waitFor({ timeout: 120000 });
    const name = page.getByLabel('Business name', { exact: true });
    const rows = page.locator('[data-settings-team-table] tbody tr');
    const login = async (actor, keyboard = false) => {
      await page.getByLabel('Identifier', { exact: true }).fill(actor.identifier);
      await page.getByLabel('Password', { exact: true }).fill(actor.password);
      if (keyboard) await page.getByLabel('Password', { exact: true }).press('Enter');
      else await page.getByRole('button', { name: 'Sign in', exact: true }).tap();
    };
    const ready = async actor => {
      await page.waitForFunction(expected => document.querySelector('[data-settings-magic-general="business"] input')?.value === expected, actor.businessName);
      await page.getByText('Verified team accounts.', { exact: false }).waitFor();
      assert.ok((await page.locator('[data-settings-team-table]').innerText()).includes(actor.username));
      assert.equal(await rows.count(), actor.userCount);
      await page.getByText('Live server role permissions shown;', { exact: false }).waitFor();
      assert.equal(await page.locator('[data-settings-magic-team] dl dt').count(), actor.roleCount);
      assert.ok(!(await page.locator('main').innerText()).includes('Nawabpur Hardware House'));
      assert.match(await page.locator('main').innerText(), /সার্ভার/);
    };
    const blank = async () => {
      assert.equal(await name.inputValue(), '', 'Old business must disappear');
      assert.equal(await rows.count(), 0, 'Old team must disappear');
      assert.equal(await page.locator('[data-settings-magic-team] dl dt').count(), 0, 'Old roles must disappear');
      assert.ok(!(await page.locator('main').innerText()).includes('Nawabpur Hardware House'));
    };
    const logout = async () => {
      await page.getByRole('button', { name: 'Sign out', exact: true }).tap();
      await page.locator('[data-session-status]').filter({ hasText: 'signed-out' }).waitFor();
      await blank();
    };
    await run('signed-out mount contains no preview business/team/roles', blank);
    await run('real A keyboard login and verified Settings/Team', async () => { await login(a, true); await ready(a); });
    mkdirSync('/tmp/mod001-542-browser', { recursive: true });
    await run('320/390/1440 touch, keyboard focus, Bangla status and snapshots', async () => {
      await page.getByLabel('Identifier', { exact: true }).fill('');
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.getByRole('button', { name: 'English', exact: true }).tap();
        assert.equal(await page.getByLabel('Selected language', { exact: true }).innerText(), 'English');
        await page.getByRole('button', { name: 'English', exact: true }).focus();
        await page.keyboard.press('Tab');
        assert.equal(await page.getByRole('button', { name: 'বাংলা', exact: true }).evaluate(el => el === document.activeElement), true);
        await page.keyboard.press('Space');
        assert.equal(await page.getByLabel('Selected language', { exact: true }).innerText(), 'Bangla');
        await page.keyboard.press('Shift+Tab');
        assert.equal(await page.getByRole('button', { name: 'English', exact: true }).evaluate(el => el === document.activeElement), true);
        assert.ok(await page.locator('[role="status"][aria-live="polite"]').count() >= 2);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.screenshot({ path: `/tmp/mod001-542-browser/connected-${width}.png`, fullPage: true });
      }
    });
    await run('lock synchronously hides tenant values and team', async () => {
      await page.getByRole('button', { name: 'Lock session', exact: true }).tap();
      await page.getByText('Session locked.', { exact: false }).waitFor(); await blank();
    });
    await run('real B login after lock excludes A', async () => {
      await login(b); await ready(b); assert.ok(!(await page.locator('main').innerText()).includes(a.username));
    });
    await run('logout failure still clears local sensitive presentation', async () => {
      await page.route('**/api/v1/auth/logout', route => route.abort('failed'));
      await logout(); await page.unroute('**/api/v1/auth/logout');
    });
    await run('invalid password never opens connected data', async () => {
      await login({ identifier: a.identifier, password: 'incorrect-password' });
      await page.getByRole('alert').filter({ hasText: 'Sign-in failed' }).waitFor(); await blank();
    });
    // Presentation-only faults: real login and /me stay untouched; these are NOT DB permission evidence.
    const reads = /\/api\/v1\/(settings|users|roles)$/;
    for (const fault of [401, 403, 'malformed', 'network']) {
      await run(`presentation-only ${fault} read failure hides all data`, async () => {
        await logout();
        await page.route(reads, route => fault === 'network' ? route.abort('failed') : route.fulfill({
          status: typeof fault === 'number' ? fault : 200, contentType: 'application/json', body: '{}',
        }));
        await login(a);
        await page.getByText(fault === 401 || fault === 403 ? 'You do not have permission to view live settings.' : 'Live settings are unavailable.', { exact: false }).waitFor();
        await blank(); await page.unroute(reads);
      });
    }
    await run('offline login stays fail closed without cached tenant data', async () => {
      await logout(); await context.setOffline(true); await login(a);
      await page.getByRole('alert').filter({ hasText: 'Sign-in failed' }).waitFor();
      await blank(); await context.setOffline(false);
    });
    for (const releaseAfterB of [false, true]) await run(`delayed genuine A GET released ${releaseAfterB ? 'after' : 'before'} verified B`, async () => {
      await logout();
      let actor = 'A';
      const pending = { A: [], B: [] };
      const received = { A: 0, B: 0 }, settled = { A: 0, B: 0 };
      const abortedBefore = abortedReads;
      await page.route(reads, async route => {
        const key = actor;
        const response = await route.fetch(); // real Nest response, held only at the browser transport boundary
        received[key]++;
        await new Promise(resolve => pending[key].push(resolve));
        await route.fulfill({ response }).catch(() => undefined);
        settled[key]++;
      });
      await login(a);
      await page.waitForFunction(() => document.querySelector('[data-session-status]')?.textContent === 'authenticated');
      const until = async predicate => { const end = Date.now() + 15000; while (!predicate()) { assert.ok(Date.now() < end, 'Expected real GET batch'); await new Promise(resolve => setTimeout(resolve, 25)); } };
      await until(() => received.A === 3);
      await blank(); actor = 'B'; await login(b);
      await until(() => received.B === 3); await blank();
      await until(() => abortedReads >= abortedBefore + 3);
      if (!releaseAfterB) { pending.A.splice(0).forEach(resolve => resolve()); await until(() => settled.A === 3); await blank(); }
      pending.B.splice(0).forEach(resolve => resolve()); await ready(b);
      if (releaseAfterB) {
        pending.A.splice(0).forEach(resolve => resolve());
        await until(() => settled.A === 3);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await ready(b);
      }
      assert.ok(!(await page.locator('main').innerText()).includes(a.username));
      await page.unroute(reads);
    });
    assert.deepEqual(writes, [], 'Acceptance must not mutate settings/users/roles');
    assert.deepEqual(errors, [], 'Mounted React must not throw');
    await context.close();
    const after = [];
    for (const self of [a, b]) for (const path of ['/settings', '/users', '/roles'])
      after.push((await request(path, { token: self.token })).data);
    assert.deepEqual(after, before, 'All exposed read projections must stay unchanged');
    console.log('PASS API settings/users/roles projections unchanged after browser acceptance');
    assert.deepEqual(failures, [], 'Required browser scenarios failed');
    console.log('BLOCKED genuine restricted-role/403/revoked-role acceptance: registration provides Owner only; role/user writes excluded');
    process.exitCode = 2; // Passing permitted scenarios do not satisfy the blocked release gate.

  } finally { await browser?.close(); await server.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
