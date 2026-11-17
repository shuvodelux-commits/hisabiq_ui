/* MOD-005 M5-02A: test-only real HTTP browser smoke.
 * Requires a separately provisioned disposable PostgreSQL16 database and a
 * real Nest API running on loopback. Never mocks /api/v1 responses.
 * Opt-in fixture registration is restricted to a confirmed fresh local QA DB.
 * Never activates production routes or makes cash/journal postings.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { randomBytes } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const base = process.env.MOD005_API_BASE_URL;
const existingDemoReadOnly = process.env.MOD005_READONLY_EXISTING_DEMO === '1';
const privateDir = process.env.MOD005_DEMO_PRIVATE_DIR;
const privateFixture = existingDemoReadOnly && privateDir
  ? {
    login: JSON.parse(readFileSync(join(privateDir, 'demo-login.private.json'), 'utf8')),
    mapping: JSON.parse(readFileSync(join(privateDir, 'backend-id-map.json'), 'utf8')),
  }
  : null;
const username = existingDemoReadOnly ? privateFixture?.login?.identifier : process.env.MOD005_TEST_IDENTIFIER;
const password = existingDemoReadOnly ? privateFixture?.login?.password : process.env.MOD005_TEST_PASSWORD;
const anonymous = process.env.MOD005_ANON_ONLY === '1';
const seedFixtures = process.env.MOD005_SEED_FIXTURES === '1';
if (existingDemoReadOnly) {
  if (process.env.MOD005_DEMO_READ_ONLY_CONFIRM !== 'hisabiq_ui_demo_20261113' ||
      process.env.MOD005_SEED_FIXTURES === '1' || anonymous ||
      base !== 'http://127.0.0.1:3065' || !privateFixture ||
      !/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(privateFixture.mapping.tenantId) ||
      privateFixture.mapping.sourceSha !== 'bce2470d346d18a7e7876b555bb242861e734f9a') {
    throw new Error('Existing demo mode requires verified exact local source and read-only scope');
  }
} else if (process.env.MOD005_DISPOSABLE_CONFIRM !== 'hisabiq_mod005_live_425') {
  throw new Error('Disposable test environment not confirmed');
}
if (!base || (!anonymous && !seedFixtures && (!username || !password))) {
  throw new Error('Missing API origin or isolated test account credentials');
}
const endpoint = new URL(base);
if (endpoint.protocol !== 'http:' || endpoint.hostname !== '127.0.0.1' ||
    !endpoint.port || endpoint.pathname !== '/' ||
    endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
  throw new Error('Only a local Nest test API is accepted');
}

async function createIsolatedFixture(suffix) {
  if (!seedFixtures || process.env.MOD005_NEW_EMPTY_DB !== 'hisabiq_mod005_live_425') {
    throw new Error('Fresh single-use database is not certified for fixture creation');
  }
  const identifier = 'mod005-' + suffix + '-' + randomBytes(6).toString('hex') + '@example.test';
  const localPassword = 'QA' + randomBytes(12).toString('hex') + 'z9!';
  const post = async (path, payload) => {
    const result = await fetch(base + path, {
      method: 'POST', redirect: 'error', credentials: 'omit',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await result.json();
    assert.ok(result.ok, path + ': HTTP ' + result.status + ' (' +
      (data?.error?.code ?? 'unknown') + ')');
    return { status: result.status, body: data };
  };
  const code = await post('/api/v1/auth/registration/otp', { identifier });
  assert.equal(code.status, 200);
  assert.match(code.body?.data?.devCode, /^\d{6}$/);
  const created = await post('/api/v1/auth/registration', {
    identifier, otpCode: code.body.data.devCode,
    businessName: 'Disposable MOD005 ' + suffix,
    username: 'test' + suffix.toLowerCase(),
    password: localPassword, pin: '482193',
  });
  assert.equal(created.status, 201);
  const tenantId = created.body?.data?.tenant?.id;
  assert.match(tenantId, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  return { identifier, password: localPassword, tenantId };
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
    page.setDefaultTimeout(seedFixtures ? 45000 : 20000);
    const requests = [];
    const errors = [];
    const blockedMutations = [];
    // The retained demo database is not disposable. Enforce a proactive
    // financial-write firewall in addition to checking the observed calls.
    // Read API traffic is never mocked; allowed requests reach real Nest.
    if (existingDemoReadOnly) {
      await page.route('**/api/v1/**', route => {
        const request = route.request();
        const method = request.method();
        const path = new URL(request.url()).pathname;
        if (['GET', 'HEAD', 'OPTIONS'].includes(method) ||
            (method === 'POST' && ['/api/v1/auth/login', '/api/v1/auth/refresh'].includes(path))) {
          return route.continue();
        }
        blockedMutations.push(method + ' ' + path);
        return route.abort('blockedbyclient');
      });
    }
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
    await page.goto('http://127.0.0.1:5187/__mod005_live', {
      waitUntil: 'domcontentloaded', timeout: seedFixtures ? 90000 : 30000,
    });
    await page.locator('#identifier').waitFor({ timeout: seedFixtures ? 90000 : 30000 });
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
      const first = seedFixtures
        ? await createIsolatedFixture('A')
        : { identifier: username, password, tenantId: null };
      const second = seedFixtures ? await createIsolatedFixture('B') : null;
      await page.locator('#identifier').fill(first.identifier);
      await page.locator('#password').fill(first.password);
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
      const firstTenant = await page.locator('#auth').getAttribute('data-tenant');
      assert.match(firstTenant, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
      if (seedFixtures) assert.equal(firstTenant, first.tenantId);
      if (existingDemoReadOnly) {
        assert.equal(firstTenant, privateFixture.mapping.tenantId,
          'Existing demo session must use exact seeded tenant');
        await page.locator('#read-day').click();
        await page.waitForFunction(() => {
          const result = document.querySelector('#outcome')?.textContent ?? '';
          return result.startsWith('confirmed:read:') || result.startsWith('failed:read:');
        });
        assert.match(await page.locator('#outcome').textContent(), /^confirmed:read:/,
          'Real authenticated cash-day read must succeed');
        assert.equal(await page.locator('#cash').getAttribute('data-mode'), 'connected');
        assert.equal(await page.locator('#cash').getAttribute('data-can-view'), 'true',
          'Authenticated owner must hold permission to view cash day');
        assert.equal(await page.locator('#cash').getAttribute('data-open'), 'false',
          'Demo account openings are not an open cash-day session');
        assert.equal(await page.locator('#cash').getAttribute('data-today'), '',
          'Historical demo openings must not automatically create an open cash session');
        await page.locator('#refresh').click();
        await page.waitForFunction(() => {
          const result = document.querySelector('#outcome')?.textContent ?? '';
          return result.startsWith('confirmed:refresh:') || result.startsWith('failed:refresh:');
        });
        assert.match(await page.locator('#outcome').textContent(), /^confirmed:refresh:/,
          'Real token rotation must succeed');
        assert.equal(await page.locator('#auth').getAttribute('data-tenant'),
          privateFixture.mapping.tenantId, 'Same tenant after refresh');
        await page.locator('#read-day').click();
        await page.waitForFunction(() => {
          const result = document.querySelector('#outcome')?.textContent ?? '';
          return result.startsWith('confirmed:read:') || result.startsWith('failed:read:');
        });
        assert.match(await page.locator('#outcome').textContent(), /^confirmed:read:/,
          'Cash-day read after token rotation must succeed');
        assert.equal(await page.locator('#cash').getAttribute('data-open'), 'false');
        assert.deepEqual(blockedMutations, [],
          'Mounted React must not even attempt unexpected API mutations');
        assert.ok(!requests.some(value =>
          /^(POST|PUT|PATCH|DELETE) \/api\/v1\/(money|sales|purchases|parties|inventory|expenses)/.test(value)),
          'Read-only smoke must not make economic business writes');
        console.log('MOD-005 existing seeded demo: mounted React real auth + cash-day read PASS');
        console.log('Zero cash/business POSTs from browser; no day starts/closes or journal writes.');
      }
      if (second) {
        await page.locator('#logout').click();
        await page.waitForFunction(() =>
          document.querySelector('#auth')?.getAttribute('data-status') !== 'authenticated');
        await page.locator('#identifier').fill(second.identifier);
        await page.locator('#password').fill(second.password);
        await page.locator('#login').click();
        await page.waitForFunction(expected =>
          document.querySelector('#auth')?.getAttribute('data-tenant') === expected,
        second.tenantId);
        assert.notEqual(firstTenant, second.tenantId);
        // Tenant B's authenticated identity commits before the cash context
        // finishes its separately scoped /money/day request. A synchronous
        // mode check is a React scheduling race, not evidence of failed reads.
        await page.waitForFunction(() =>
          document.querySelector('#cash')?.getAttribute('data-mode') === 'connected');
        assert.equal(await page.locator('#cash').getAttribute('data-today'), '',
          'A new tenant must not inherit the prior tenant cash-session state');
        console.log('Two independent real Nest test tenants, React session switching PASS');
      }
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
