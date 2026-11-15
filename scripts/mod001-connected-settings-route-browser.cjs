/* MOD-001 #549: source gates and real browser signed-out route.
 * This does not replace genuine two-tenant Nest/PostgreSQL acceptance. */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { randomBytes } = require('node:crypto');

const app = readFileSync('src/App.tsx', 'utf8');
const workspace = readFileSync('src/integration/ConnectedSettingsWorkspace.tsx', 'utf8');
assert.ok(app.includes("integrationMode === 'connected' ? <PageBoundary>"), 'lazy connected route requires Suspense boundary');
assert.match(app, /<ConnectedWorkspaceGate><AppShell \/><\/ConnectedWorkspaceGate>/);
assert.match(workspace, /useSession/);
assert.match(workspace, /TenantSettingsProvider/);
assert.match(workspace, /GeneralSettingsSection/);
assert.match(workspace, /TeamSettings/);
assert.doesNotMatch(workspace, /CashSessionProvider|<AppShell|<TopBar|<Sidebar|downloadSettings|canManage\(/);
assert.match(workspace, /settings\.setting\.view/);
assert.match(workspace, /user\.account\.view/);
assert.match(workspace, /user\.role\.view/);
assert.ok(workspace.includes('fieldset disabled'), 'Connected route must disable all live edit controls');
console.log('PASS source isolation: connected /app is distinct from untouched preview AppShell');

async function browserCheck() {
  process.env.VITE_HISABIQ_INTEGRATION_MODE = 'connected';
  const { createServer } = await import('vite');
  const { chromium } = require('playwright');
  const live = process.argv.includes('--real');
  const apiOrigin = process.env.MOD001_549_TEST_API_ORIGIN || '';
  if (live) {
    assert.equal(process.env.MOD001_549_DISPOSABLE_ACK,
      '549:pg16:55849:476cefcdecad55873ee33bd182f12943fb4b1127',
      'Real QA requires exact task-owned API + database attestation');
    assert.match(apiOrigin, /^http:\/\/127\.0\.0\.1:3059$/);
  }
  const server = await createServer({
    configFile: 'vite.config.ts',
    server: { host: '127.0.0.1', port: 4299, strictPort: true,
      ...(live ? { proxy: { '/api/v1': { target: apiOrigin } } } : {}),
    },
  });
  let browser;
  await server.listen();
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || '/usr/bin/chromium',
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const path of ['business', 'team', 'data', 'finance']) {
      await page.goto('http://127.0.0.1:4299/#/app/settings/' + path);
      await page.waitForURL('**/#/login*', { timeout: 25000 });
      assert.equal(await page.locator('[data-settings-magic-general], [data-settings-magic-team]').count(), 0);
      assert.equal(await page.locator('[data-erp-table]').count(), 0);
    }
    for (const path of ['pos', 'finance', 'dashboard']) {
      await page.goto('http://127.0.0.1:4299/#/app/' + path);
      await page.waitForURL('**/#/login*', { timeout: 25000 });
      assert.equal(await page.locator('[data-settings-magic-team], [data-erp-table]').count(), 0);
    }
    assert.deepEqual(errors, []);
    console.log('PASS browser: signed-out business/team/settings and ERP routes never mount preview data');
    if (live) {
      const api = async (path, options = {}) => {
        const response = await fetch(apiOrigin + '/api/v1' + path, {
          method: options.body ? 'POST' : 'GET',
          headers: {
            ...(options.token ? { Authorization: 'Bearer ' + options.token } : {}),
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          },
          ...(options.body ? { body: JSON.stringify(options.body) } : {}),
          signal: AbortSignal.timeout(10000),
        });
        assert.equal(response.status, options.expected || 200, path + ' HTTP ' + response.status);
        return response.json();
      };
      const register = async label => {
        const suffix = randomBytes(4).readUInt32BE().toString().padStart(10, '0').slice(-8);
        const identifier = '017' + suffix;
        const businessName = 'QA549 ' + label + ' ' + suffix;
        const password = randomBytes(18).toString('base64url') + 'aA1!';
        const otp = await api('/auth/registration/otp', { body: { identifier } });
        assert.match(otp.data.devCode, /^[0-9]{6}$/);
        await api('/auth/registration', { expected: 201, body: {
          identifier, otpCode: otp.data.devCode, businessName,
          username: 'qa549' + suffix, password, pin: '736291',
        } });
        const auth = await api('/auth/login', { body: { identifier, password } });
        const me = (await api('/me', { token: auth.data.accessToken })).data;
        assert.equal(me.businessName, businessName);
        assert.ok(me.permissions.includes('settings.setting.view'));
        return { identifier, password, businessName, token: auth.data.accessToken, me };
      };
      const a = await register('A');
      const b = await register('B');
      assert.notEqual(a.me.tenantId, b.me.tenantId);
      const snapshots = [];
      for (const user of [a, b]) {
        const settings = (await api('/settings', { token: user.token })).data;
        assert.equal(settings.businessName, user.businessName);
        snapshots.push(settings);
        await api('/users', { token: user.token });
        await api('/roles', { token: user.token });
      }
      const realLogin = async user => {
        await page.goto('http://127.0.0.1:4299/#/login');
        await page.locator('#auth-phone').fill(user.identifier);
        await page.locator('#auth-password').fill(user.password);
        const verified = page.waitForResponse(response =>
          response.url().endsWith('/api/v1/me') && response.status() === 200);
        await page.locator('button[type="submit"]').click();
        await verified;
      };
      for (const [user, other] of [[a, b], [b, a]]) {
        await realLogin(user);
        await page.goto('http://127.0.0.1:4299/#/app/settings/business');
        const business = page.getByLabel('Business name', { exact: true });
        await page.waitForFunction(expected =>
          document.querySelector('input[aria-label="Business name"]')?.value === expected,
        user.businessName);
        assert.equal(await business.inputValue(), user.businessName);
        assert.ok(!(await page.locator('[data-connected-settings-workspace]').innerText())
          .includes(other.businessName));
        for (const width of [320, 390, 1440]) {
          await page.setViewportSize({ width, height: 850 });
          assert.ok(await page.locator('[data-connected-settings-workspace]').isVisible());
        }
        await page.getByRole('link', { name: /Users & roles/ }).click();
        await page.locator('[data-settings-team-table] tbody tr').first().waitFor();
        assert.ok((await page.locator('[data-settings-team-table]').innerText()).includes(user.me.user.displayName));
        assert.equal(await page.locator('[data-settings-directory]').count(), 0);
        assert.equal(await page.locator('[data-connected-settings-workspace] a[href*="/app/settings/data"]').count(), 0);
        await page.goto('http://127.0.0.1:4299/#/app/settings/data');
        await page.getByText('This section is not yet connected.', { exact: false }).waitFor();
        assert.equal(await page.locator('[data-settings-magic-general], [data-settings-magic-team]').count(), 0);
        await page.goto('http://127.0.0.1:4299/#/app/pos');
        await page.waitForURL('**/#/login?workspace=pending');
        console.log('PASS real authenticated ' + user.businessName + ' business/team/unsupported-route isolation');
      }
      for (const [i, user] of [a, b].entries()) {
        const after = (await api('/settings', { token: user.token })).data;
        assert.deepEqual(after, snapshots[i], 'Read-only route must not mutate Settings');
      }
      console.log('PASS real A/B Nest login, server GET, React business/team and unchanged settings projections');
    }
    await page.close();
  } finally {
    await browser?.close();
    await server.close();
  }
}
browserCheck().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
