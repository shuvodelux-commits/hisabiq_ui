/* MOD-001 #605: source boundary + mounted real browser signed-out denial.
 * Authenticated Nest/PG16, delayed 200 and private-logo acceptance are separate QA. */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const src = path => readFileSync(path, 'utf8');
const workspace = src('src/integration/ConnectedSettingsWorkspace.tsx');
const studio = src('src/settings/magic/invoice/InvoiceStudio.tsx');
const logo = src('src/settings/magic/invoice/ConnectedInvoiceLogo.tsx');
const app = src('src/App.tsx');

assert.ok(app.includes("integrationMode === 'connected' ? <PageBoundary>"));
assert.match(workspace, /sale\.invoice\.view/);
assert.match(workspace, /item\.id === 'invoices'/);
assert.match(workspace, /section === 'invoices'/);
assert.match(workspace, /<InvoiceStudio /);
assert.match(workspace, /<fieldset disabled/);
assert.doesNotMatch(workspace, /<AppShell|CashSessionProvider|<TopBar|<Sidebar/);
assert.match(studio, /await store\.revalidateAccess\(\)/);
assert.match(studio, /connectedAuthorizationPending/);
assert.match(logo, /await confirmCurrent\(\)/);
assert.match(studio, /current\.permissions\.includes\('sale\.invoice\.view'\)/);
assert.match(logo, /confirmCurrent \? await confirmCurrent\(\) : false/);
assert.match(logo, /URL\.revokeObjectURL/);
console.log('PASS source: invoice read permission, stale-response revalidation and read-only route');

async function browserCheck() {
  if (process.argv.includes('--source-only')) return;
  process.env.VITE_HISABIQ_INTEGRATION_MODE = 'connected';
  const { createServer } = await import('vite');
  const { chromium } = require('playwright');
  const server = await createServer({ configFile: 'vite.config.ts', server: {
    host: '127.0.0.1', port: 4365, strictPort: true,
  } });
  let browser;
  await server.listen();
  try {
    browser = await chromium.launch({
      ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH
        ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}),
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage({ viewport: { width: 320, height: 720 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['invoices','data','finance']) {
      await page.goto('http://127.0.0.1:4365/#/app/settings/' + route,
        { waitUntil: 'domcontentloaded' });
      await page.waitForURL('**/#/login*', { timeout: 30000 });
      assert.equal(await page.locator('[data-settings-live-invoice-read]').count(), 0);
      assert.equal(await page.locator('[data-connected-invoice-logo]').count(), 0);
      assert.equal(await page.locator('[data-settings-magic-invoice-studio]').count(), 0);
    }
    assert.deepEqual(errors, []);
    console.log('PASS browser: signed-out invoice route never mounts private logo or preview invoice');
  } finally {
    await browser?.close();
    await server.close();
  }
}
browserCheck().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
