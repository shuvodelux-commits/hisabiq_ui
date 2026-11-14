/* MOD-001 #549: source gates and real browser signed-out route.
 * This does not replace genuine two-tenant Nest/PostgreSQL acceptance. */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const app = readFileSync('src/App.tsx', 'utf8');
const workspace = readFileSync('src/integration/ConnectedSettingsWorkspace.tsx', 'utf8');
assert.match(app, /integrationMode === 'connected'\s*\?\s*<ConnectedSettingsWorkspace/);
assert.match(app, /<ConnectedWorkspaceGate><AppShell \/><\/ConnectedWorkspaceGate>/);
assert.match(workspace, /useSession/);
assert.match(workspace, /TenantSettingsProvider/);
assert.match(workspace, /GeneralSettingsSection/);
assert.match(workspace, /TeamSettings/);
assert.doesNotMatch(workspace, /CashSessionProvider|<AppShell|<TopBar|<Sidebar|downloadSettings|canManage\(/);
assert.match(workspace, /settings\.setting\.view/);
assert.match(workspace, /user\.account\.view/);
assert.match(workspace, /user\.role\.view/);
console.log('PASS source isolation: connected /app is distinct from untouched preview AppShell');

async function browserCheck() {
  process.env.VITE_HISABIQ_INTEGRATION_MODE = 'connected';
  const { createServer } = await import('vite');
  const { chromium } = require('playwright');
  const server = await createServer({
    configFile: 'vite.config.ts',
    server: { host: '127.0.0.1', port: 4299, strictPort: true },
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
    await page.close();
  } finally {
    await browser?.close();
    await server.close();
  }
}
browserCheck().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
