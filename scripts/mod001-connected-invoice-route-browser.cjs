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
assert.match(workspace, /connectedReadOnly/);
assert.match(studio, /verified\.canWrite && !connectedReadOnly/);
assert.match(workspace, /<fieldset disabled/);
require('./mod001-connected-logo-write-gate.cjs');
assert.doesNotMatch(workspace, /<AppShell|CashSessionProvider|<TopBar|<Sidebar/);
assert.match(studio, /await store\.revalidateAccess\(\)/);
assert.match(studio, /connectedAuthorizationPending/);
assert.match(logo, /await confirmCurrent\(\)/);
assert.match(studio, /current\.permissions\.includes\('sale\.invoice\.view'\)/);
assert.match(logo, /confirmCurrent \? await confirmCurrent\(\) : false/);
assert.match(logo, /URL\.revokeObjectURL/);
console.log('PASS source: invoice read permission, stale-response revalidation and read-only route');


async function privateLogoGuardCheck() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { middlewareMode: true, hmr: false } });
  const oldFetch = globalThis.fetch;
  const oldWindow = globalThis.window;
  const oldCreate = URL.createObjectURL;
  const oldRevoke = URL.revokeObjectURL;
  const made = [], revoked = [], states = [];
  let decide;
  try {
    globalThis.window = { location: { origin: 'https://qa605.example' } };
    globalThis.fetch = async () => new Response(
      new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]),
      { status: 200, headers: { 'Content-Type': 'image/png' } });
    URL.createObjectURL = () => {
      const url = 'blob:qa605-' + (made.length + 1);
      made.push(url);
      return url;
    };
    URL.revokeObjectURL = url => { revoked.push(url); };
    const { createConnectedInvoiceLogoController } =
      await server.ssrLoadModule('/src/settings/magic/invoice/ConnectedInvoiceLogo.tsx');
    const ctl = createConnectedInvoiceLogoController(state => states.push(state));
    const source = { identityKey: 'A:staff:1', accessToken: 'test-token', hasLogo: true };
    ctl.load(source, () => new Promise(resolve => { decide = resolve; }));
    for (let i = 0; i < 20 && !decide; i++) await new Promise(r => setTimeout(r, 5));
    assert.equal(typeof decide, 'function', 'Real private binary GET must reach authorization check');
    decide(false);
    await new Promise(r => setTimeout(r, 10));
    assert.equal(made.length, 0, 'revoked authorization must never create a private object URL');
    assert.equal(states.at(-1).status, 'denied');
    ctl.load(source, async () => true);
    for (let i = 0; i < 20 && !made.length; i++) await new Promise(r => setTimeout(r, 5));
    assert.equal(made.length, 1, 'fresh authorization may create exactly one logo URL');
    ctl.dispose();
    assert.deepEqual(revoked, made, 'unmount releases the authorized private URL');
    console.log('PASS controller: late revoked binary blocked; authorized URL released');
  } finally {
    globalThis.fetch = oldFetch;
    if (oldWindow === undefined) delete globalThis.window;
    else globalThis.window = oldWindow;
    URL.createObjectURL = oldCreate;
    URL.revokeObjectURL = oldRevoke;
    await server.close();
  }
}

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
(async () => {
  if (!process.argv.includes('--source-only')) await privateLogoGuardCheck();
  await browserCheck();
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
