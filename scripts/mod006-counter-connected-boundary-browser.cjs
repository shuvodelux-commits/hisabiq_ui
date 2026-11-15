/* MOD-006 T02-C: real Chromium gate and preview parity; no source writes.
 * This is NOT authenticated live posting or Nest/PostgreSQL acceptance.
 * Run: node scripts/mod006-counter-connected-boundary-browser.cjs
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function run() {
  const { createServer } = await import('vite');
  const originalMode = process.env.VITE_HISABIQ_INTEGRATION_MODE;
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox'],
  });
  let journeys = 0;
  const forbidden = /\/api\/v1\/(?:customer-payments|suppliers\/payments|money\/movements)(?:\?|$|\/)/;
  try {
    for (const mode of ['connected', 'preview']) {
      process.env.VITE_HISABIQ_INTEGRATION_MODE = mode;
      const port = mode === 'connected' ? 47864 : 47865;
      const server = await createServer({
        cacheDir: 'node_modules/.vite-mod006-t02c-' + mode,
        server: { host: '127.0.0.1', port, strictPort: true },
      });
      await server.listen();
      try {
        for (const width of [390, 1280]) {
          const context = await browser.newContext({
            viewport: { width, height: 850 },
            hasTouch: width === 390,
            reducedMotion: 'reduce',
          });
          const page = await context.newPage();
          const errors = [];
          const financialWrites = [];
          page.on('pageerror', error => errors.push(error.message));
          page.on('request', request => {
            if (request.method() !== 'GET' &&
                forbidden.test(new URL(request.url()).pathname)) {
              financialWrites.push(request.method() + ' ' + new URL(request.url()).pathname);
            }
          });
          await page.route('https://fonts.googleapis.com/**', route => route.abort());
          try {
            if (mode === 'connected') {
              // A forged or invalid stored refresh credential cannot unlock business UI.
              await page.addInitScript(() => {
                sessionStorage.setItem('hisabiq.live.session.v1',
                  JSON.stringify({ schema: 1, refreshToken: 'invalid%credential' }));
              });
              for (const route of ['/app/finance', '/app/counter']) {
                await page.goto('http://127.0.0.1:' + port + '/#' + route);
                await page.waitForFunction(() => location.hash.startsWith('#/login'),
                  { timeout: 15000 });
                assert.equal(await page.getByRole('group', { name: 'Counter actions' }).count(), 0,
                  'connected signed-out must not mount preview Counter');
                assert.equal(await page.getByRole('heading', { name: /^Finance$/ }).count(), 0,
                  'connected signed-out must not mount preview Finance');
              }
            } else {
              await page.goto('http://127.0.0.1:' + port + '/#/app/finance');
              await page.getByRole('heading', { name: /^Finance$|^টাকা-পয়সা$/ }).waitFor();
              const tab = page.getByRole('tab', { name: /Counter|কাউন্টার/ });
              if (width === 390) await tab.tap();
              else { await tab.focus(); await page.keyboard.press('Enter'); }
              await page.getByRole('group', { name: 'Counter actions' }).waitFor();
              assert.equal(await page.getByRole('button', { name: /Customer Receive/ }).count() > 0,
                true, 'existing customer receipt action stays visible');
              assert.equal(await page.getByRole('button', { name: /Supplier Pay/ }).count() > 0,
                true, 'existing supplier payment action stays visible');
            }
            assert.deepEqual(financialWrites, [],
              'browser navigation must not post a real customer/supplier/money movement');
            assert.deepEqual(errors, [], mode + ' browser had runtime errors');
            journeys++;
          } finally {
            await context.close();
          }
        }
      } finally {
        await server.close();
      }
    }
    console.log('MOD-006 Counter browser boundary PASS: ' + journeys +
      ' real Chromium journeys (390px touch, 1280px keyboard; connected + preview)');
  } finally {
    if (originalMode === undefined) delete process.env.VITE_HISABIQ_INTEGRATION_MODE;
    else process.env.VITE_HISABIQ_INTEGRATION_MODE = originalMode;
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
