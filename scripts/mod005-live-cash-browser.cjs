/* MOD-005 M5-02A: test-only real HTTP browser smoke.
 * Requires a separately provisioned disposable PostgreSQL16 database and a
 * real Nest API running on loopback. Never mocks /api/v1 responses.
 * No fixture creation, production route activation, or accounting writes.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const base = process.env.MOD005_API_BASE_URL;
const username = process.env.MOD005_TEST_IDENTIFIER;
const password = process.env.MOD005_TEST_PASSWORD;
const anonymous = process.env.MOD005_ANON_ONLY === '1';
if (process.env.MOD005_DISPOSABLE_CONFIRM !== 'hisabiq_mod005_live_425') {
  throw new Error('Disposable test environment not confirmed');
}
if (!base || (!anonymous && (!username || !password))) {
  throw new Error('Missing API origin or isolated test account credentials');
}
const endpoint = new URL(base);
if (endpoint.protocol !== 'http:' || endpoint.hostname !== '127.0.0.1' ||
    !endpoint.port || endpoint.pathname !== '/' ||
    endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
  throw new Error('Only a local Nest test API is accepted');
}

async function main() {
  const probe = await fetch(base + '/health', { redirect: 'error' });
  assert.equal(probe.status, 200, 'A real Nest health check must be available');
  const { createServer } = await import('vite');
  const server = await createServer({
    server: {
      host: '127.0.0.1', port: 5187, strictPort: true, hmr: false,
      proxy: { '/api/v1': { target: base, changeOrigin: true } },
    },
    logLevel: 'error',
  });
  let browser;
  try {
    await server.listen();
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      headless: true, args: ['--no-sandbox'],
    });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.setDefaultTimeout(20000);
    const requests = [];
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      const path = new URL(request.url()).pathname;
      if (path.startsWith('/api/v1/')) requests.push(request.method() + ' ' + path);
    });
    // Static test entry only; all business API calls are real HTTP over Vite proxy.
    await page.route('**/__mod005_live', route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="UTF-8"></head><body><div id="root"></div>' +
        '<script type="module">import RefreshRuntime from "/@react-refresh";' +
        'RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};' +
        'window.$RefreshSig$=()=>type=>type;' +
        'window.__vite_plugin_react_preamble_installed__=true;</script>' +
        '<script type="module" src="/tests/mod005LiveCashRuntimeHarness.tsx"></script>' +
        '</body></html>',
    }));
    await page.goto('http://127.0.0.1:5187/__mod005_live');
    if (anonymous) {
      assert.notEqual(await page.locator('#auth').getAttribute('data-status'), 'authenticated');
      const statuses = await page.evaluate(async () => ({
        day: (await fetch('/api/v1/money/day', { credentials: 'omit' })).status,
        me: (await fetch('/api/v1/me', { credentials: 'omit' })).status,
        settings: (await fetch('/api/v1/settings', { credentials: 'omit' })).status,
      }));
      assert.deepEqual(statuses, { day: 401, me: 401, settings: 401 });
      assert.ok(requests.includes('GET /api/v1/money/day'));
      assert.deepEqual(errors, []);
      console.log('MOD-005 real React→Nest anonymous-denial smoke PASS');
      console.log('No identity provisioned, no cash POST, no financial acceptance claim.');
    } else {
      await page.locator('#identifier').fill(username);
      await page.locator('#password').fill(password);
      await page.locator('#login').click();
      await page.waitForFunction(() => {
        const text = document.querySelector('#outcome')?.textContent ?? '';
        return text.startsWith('confirmed:login:') || text.startsWith('failed:login:');
      });
      const outcome = await page.locator('#outcome').textContent();
      assert.match(outcome, /^confirmed:login:/, 'Real login must succeed');
      await page.waitForFunction(() =>
        document.querySelector('#cash')?.getAttribute('data-mode') === 'connected');
      assert.equal(await page.locator('#auth').getAttribute('data-status'), 'authenticated');
      assert.ok(requests.includes('GET /api/v1/me'), 'real verified /me must be called');
      assert.ok(requests.includes('GET /api/v1/money/day'), 'real cash-day GET must be called');
      assert.deepEqual(errors, [], 'no React runtime errors');
      console.log('MOD-005 real React→Nest day-read smoke PASS; requests=' + requests.length);
      console.log('Mutation, tenant isolation and accounting acceptance are NOT yet covered.');
    }
  } finally {
    await browser?.close();
    await server.close();
  }
}
main().catch(error => {
  console.error('MOD-005 real HTTP smoke RED:', error.message);
  process.exitCode = 1;
});
