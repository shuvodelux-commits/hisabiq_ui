/* MOD-008 P5C: Test-only React → real Nest → disposable PostgreSQL draft acceptance.
 *
 * Prerequisites (supplied by authorized QA runner; never commit secrets):
 *   HISABIQ_P5C_API_ORIGIN=http://127.0.0.1:3220
 *   HISABIQ_P5C_DISPOSABLE_ACK=isolated-pg16-only
 *   HISABIQ_P5C_TENANT_A / _B, HISABIQ_P5C_USER_A / _B (real seeded ULIDs)
 *   HISABIQ_P5C_JWT_A / _B (signed for those users; redacted from all output)
 *   HISABIQ_P5C_PG_CONTAINER=hisabiq-mod008-p5c-pg16
 *   PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium (when bundled browser absent)
 *
 * Never run against a retained database. This runner creates/edits/recycles
 * only its own QA drafts and makes no changes to production React/connected gate.
 * It DOES mock auth login + /me to provision the browser with pre-signed test
 * identities; it NEVER mocks Purchase Draft operations.
 */
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { chromium } = require('playwright');
let lastSafeStage = 'initializing';

const ORIGIN = 'http://127.0.0.1:4220';
const API = process.env.HISABIQ_P5C_API_ORIGIN;
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const required = [
  'HISABIQ_P5C_TENANT_A','HISABIQ_P5C_TENANT_B',
  'HISABIQ_P5C_USER_A','HISABIQ_P5C_USER_B',
  'HISABIQ_P5C_JWT_A','HISABIQ_P5C_JWT_B',
];
const permissions = [
  'purchase.bill.create', 'inventory.cost.view',
  'party.supplier.view', 'catalog.product.view',
];
function settings() {
  assert.equal(API, 'http://127.0.0.1:3220', 'API must use dedicated local-only P5C port');
  assert.equal(process.env.HISABIQ_P5C_DISPOSABLE_ACK, 'isolated-pg16-only',
    'Explicit disposable-only acknowledgement required');
  assert.equal(process.env.HISABIQ_P5C_PG_CONTAINER, 'hisabiq-mod008-p5c-pg16',
    'Dedicated P5C PostgreSQL container identity required');
  for (const key of required) assert.ok(process.env[key], 'Missing QA-only variable ' + key);
  for (const key of required.filter(key => key.includes('TENANT_') || key.includes('USER_'))) {
    assert.match(process.env[key], ULID, 'Invalid seeded ULID in ' + key);
  }
  assert.notEqual(process.env.HISABIQ_P5C_TENANT_A, process.env.HISABIQ_P5C_TENANT_B);
  assert.notEqual(process.env.HISABIQ_P5C_USER_A, process.env.HISABIQ_P5C_USER_B);
  const inspect = spawnSync('podman', ['inspect', '--format', '{{.State.Running}}',
    process.env.HISABIQ_P5C_PG_CONTAINER], { encoding:'utf8' });
  assert.equal(inspect.status, 0, 'Dedicated isolated Podman PG16 must exist');
  assert.equal(inspect.stdout.trim(), 'true', 'Dedicated test DB must be running');
}
const user = who => ({
  tenantId: process.env['HISABIQ_P5C_TENANT_' + who.toUpperCase()],
  userId: process.env['HISABIQ_P5C_USER_' + who.toUpperCase()],
  token: process.env['HISABIQ_P5C_JWT_' + who.toUpperCase()],
  business: 'P5C isolated shop ' + who.toUpperCase(),
});
async function preflight() {
  for (const who of ['a','b']) {
    const response = await fetch(API + '/api/v1/purchases/drafts', {
      headers: { Authorization: 'Bearer ' + user(who).token },
    });
    assert.equal(response.status, 200, 'real Nest signed-token /drafts preflight');
    const data = await response.json();
    assert.ok(Array.isArray(data.data), 'real Nest draft list required');
    assert.equal(data.data.length, 0, 'P5C must start from two fresh, empty test tenants');
  }
}
function send(route, body, status = 200) {
  return route.fulfill({ status, contentType: 'application/json',
    body: JSON.stringify(body) });
}
async function waitResult(page, wanted) {
  await page.waitForFunction(expected =>
    document.querySelector('[data-test-result]')?.textContent === expected, wanted);
}
async function tap(page, button, wanted) {
  lastSafeStage = button; // Never log values, JWTs, headers or request bodies.
  await page.locator('[data-test-' + button + ']').click();
  await waitResult(page, wanted);
}
const textOf = async (page, selector) =>
  (await page.locator('[data-test-' + selector + ']').textContent() || '').trim();

async function exercise(browser, width, previousCount) {
  const context = await browser.newContext({ viewport:{ width, height:844 },
    reducedMotion:'reduce' });
  const page = await context.newPage();
  const requests = [];
  const createAttempts = [];
  const pageErrors = [];
  let firstCommittedId = '';
  let interceptOneResponse = true;
  let probeFailure = '';
  page.on('pageerror', e => pageErrors.push(e.message));
  page.on('response', response => {
    if (new URL(response.url()).pathname.startsWith('/api/v1/purchases/drafts')) {
      requests.push({ method: response.request().method(),
        path: new URL(response.url()).pathname, status:response.status() });
    }
  });
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const method = request.method();
    if (method === 'POST' && path === '/api/v1/purchases/drafts') {
      createAttempts.push(request.postDataJSON().operationId);
    }
    assert.equal(new URL(request.url()).origin, ORIGIN,
      'The test fixture is limited to a same-origin Vite proxy');
    if (method === 'POST' && path === '/api/v1/auth/login') {
      const body = request.postDataJSON();
      assert.equal(body.password, 'test-only-password');
      const who = body.identifier === 'p5c-a' ? 'a'
        : body.identifier === 'p5c-b' ? 'b' : null;
      assert.ok(who, 'Only two explicit disposable test identities are allowed');
      const u = user(who);
      return send(route, { data: { accessToken:u.token,
        refreshToken:'test-fixture-refresh-' + who,
        user:{ id:u.userId, username:body.identifier } } });
    }
    if (method === 'GET' && path === '/api/v1/me') {
      const bearer = (request.headers().authorization || '').replace(/^Bearer /, '');
      const who = ['a','b'].find(key => user(key).token === bearer);
      assert.ok(who, 'The real signed tenant JWT must be presented');
      const u = user(who);
      return send(route, { data: {
        tenantId:u.tenantId, timezone:'Asia/Dhaka',
        user:{ id:u.userId, username:'p5c-' + who,
          displayName:'QA Owner', roleName:'Owner' },
        businessName:u.business, permissions, features:[],
      } });
    }
    if (method === 'POST' && path === '/api/v1/auth/logout')
      return route.fulfill({ status:204, body:'' });
    assert.ok(path.startsWith('/api/v1/purchases/drafts'),
      'Unexpected non-draft API in isolated nonposting fixture: ' + path);
    if (method === 'POST' && path === '/api/v1/purchases/drafts' && interceptOneResponse) {
      interceptOneResponse = false;
      // Catch Playwright's network exceptions inside the route callback:
      // its TimeoutError includes raw Authorization headers, even for QA tokens.
      try {
        const committed = await route.fetch({ timeout: 90_000 });
        if (committed.status() !== 201) {
          probeFailure = 'Unexpected Nest status during post-commit fault probe';
        } else {
          const saved = await committed.json();
          if (ULID.test(saved?.data?.id || '')) firstCommittedId = saved.data.id;
          else probeFailure = 'Nest create response lacked a draft ID';
        }
      } catch {
        probeFailure = 'Post-commit probe timed out or failed; request details suppressed';
      }
      await route.abort('failed').catch(() => {});
      return;
    }
    return route.continue(); // ALL other draft CRUD goes to real Nest/PG
  });

  try {
    await page.goto(ORIGIN + '/tests/fixtures/connected-purchase-drafts-postgres.html');
    await page.locator('[data-test-session]').waitFor();
    await tap(page, 'login-a', 'login-a:ok');
    await page.getByText('Verified:P5C isolated shop A').waitFor();
    await tap(page, 'prepare', 'prepare:ok');
    const operation = await textOf(page, 'operation-id');
    assert.match(operation, ULID);

    await tap(page, 'create', 'create:error');
    assert.equal(probeFailure, '', probeFailure || 'Post-commit probe must succeed');
    assert.ok(firstCommittedId, 'Nest committed before the lost response');
    assert.match(await textOf(page, 'error'), /create:(network|http|The network|Network)/i);
    assert.equal(await textOf(page, 'operation-id'), operation,
      'ambiguous network failure retains original immutable intent');

    await tap(page, 'create', 'create:ok');
    assert.equal(await textOf(page, 'draft-id'), firstCommittedId,
      'explicit retry returns the same server-generated document');
    assert.equal(await textOf(page, 'operation-id'), operation);
    assert.equal(await textOf(page, 'version'), '1');

    await tap(page, 'load', 'load:ok');
    assert.equal(await textOf(page, 'notes'), 'Opaque draft; no financial posting');
    await tap(page, 'list-active', 'list-active:ok');
    assert.equal(await textOf(page, 'list-count'), String(previousCount + 1));

    await tap(page, 'update', 'update:ok');
    assert.equal(await textOf(page, 'version'), '2');
    assert.equal(await textOf(page, 'notes'), 'Versioned edit after replay');
    await tap(page, 'stale', 'stale:error');
    assert.equal(await textOf(page, 'version'), '2', 'stale version cannot mutate client state');
    await tap(page, 'recycle', 'recycle:ok');
    assert.equal(await textOf(page, 'version'), '3');
    await tap(page, 'list-active', 'list-active:ok');
    assert.equal(await textOf(page, 'list-count'), String(previousCount));
    await tap(page, 'list-deleted', 'list-deleted:ok');
    assert.equal(await textOf(page, 'list-count'), '1');
    await tap(page, 'restore', 'restore:ok');
    assert.equal(await textOf(page, 'version'), '4');

    await tap(page, 'login-b', 'login-b:ok');
    await page.getByText('Verified:P5C isolated shop B').waitFor();
    await tap(page, 'list-active', 'list-active:ok');
    assert.equal(await textOf(page, 'list-count'), '0');
    const forbidden = await fetch(API + '/api/v1/purchases/drafts/' + firstCommittedId, {
      headers:{ Authorization:'Bearer ' + user('b').token },
    });
    assert.equal(forbidden.status, 404, 'Nest RLS/source service hides tenant A draft');
    const postsBefore = createAttempts.length;
    await tap(page, 'create', 'create:error');
    assert.equal(createAttempts.length, postsBefore,
      'stale cross-tenant create intent refused before HTTP POST');

    const full = await fetch(API + '/api/v1/purchases/drafts/' + firstCommittedId, {
      headers:{ Authorization:'Bearer ' + user('a').token },
    });
    assert.equal(full.status, 200);
    const stored = (await full.json()).data;
    assert.equal(stored.version, 4);
    assert.equal(stored.cart.editor.notes, 'Versioned edit after replay');
    assert.deepEqual(stored.cart.editor.payments.map(p => p.amount), ['23.45','100']);
    assert.equal(stored.grandTotalMinor, 12345);
    assert.equal(stored.itemCount, 0);
    assert.deepEqual(createAttempts, [operation, operation],
      'exactly two explicit POST attempts with the identical operation ID');
    assert.equal(requests.some(r => r.method === 'PUT' && r.status === 409), true,
      'real Nest refused stale version');
    assert.deepEqual(pageErrors, [], 'No React page exceptions');
    const metrics = await page.evaluate(() => ({
      viewport:document.documentElement.clientWidth,
      content:document.documentElement.scrollWidth,
    }));
    assert.ok(metrics.content <= metrics.viewport + 2,
      width + 'px fixture should not overflow horizontally');
    console.log('MOD-008 P5C PASS: real draft create/replay/version/recycle/restore/RLS at ' +
      width + 'px; no purchase posting endpoints');
    return firstCommittedId;
  } finally {
    await context.close();
  }
}

/** 390px: independently remount real React and read the completed source via Nest. */
async function exerciseReadOnly(browser, draftId) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  const actions = [];
  try {
    await page.route('**/api/v1/**', async route => {
      try {
        const req = route.request();
        const path = new URL(req.url()).pathname;
        const method = req.method();
        assert.equal(new URL(req.url()).origin, ORIGIN, 'Only same-origin QA API');
        if (path === '/api/v1/auth/login' && method === 'POST') {
          const body = req.postDataJSON();
          assert.equal(body.password, 'test-only-password');
          const who = body.identifier === 'p5c-a' ? 'a'
            : body.identifier === 'p5c-b' ? 'b' : null;
          assert.ok(who, 'Known QA identities only');
          const u = user(who);
          return send(route, { data: { accessToken: u.token,
            refreshToken: 'test-fixture-refresh-' + who,
            user: { id: u.userId, username: body.identifier } } });
        }
        if (path === '/api/v1/me' && method === 'GET') {
          const token = (req.headers().authorization || '').replace(/^Bearer /, '');
          const who = ['a', 'b'].find(key => user(key).token === token);
          assert.ok(who, 'Signed test token required');
          const u = user(who);
          return send(route, { data: { tenantId: u.tenantId,
            timezone: 'Asia/Dhaka',
            user: { id: u.userId, username: 'p5c-' + who,
              displayName: 'QA Owner', roleName: 'Owner' },
            businessName: u.business, permissions, features: [] } });
        }
        if (path === '/api/v1/auth/logout' && method === 'POST') {
          return route.fulfill({ status: 204, body: '' });
        }
        assert.ok(path.startsWith('/api/v1/purchases/drafts') && method === 'GET',
          '390px inspection must not post or mutate a purchase');
        actions.push({ path, method });
        return route.continue();
      } catch {
        // Never propagate Playwright errors that may include Authorization.
        return route.abort('failed').catch(() => {});
      }
    });
    await page.goto(ORIGIN + '/tests/fixtures/connected-purchase-drafts-postgres.html');
    await tap(page, 'login-a', 'login-a:ok');
    await tap(page, 'list-active', 'list-active:ok');
    assert.equal(await textOf(page, 'list-count'), '1');
    assert.equal(await textOf(page, 'draft-id'), draftId);
    await tap(page, 'load', 'load:ok');
    assert.equal(await textOf(page, 'version'), '4');
    assert.equal(await textOf(page, 'notes'), 'Versioned edit after replay');
    await tap(page, 'login-b', 'login-b:ok');
    assert.equal(await textOf(page, 'draft-id'), '',
      'Account switch immediately clears previous tenant draft');
    await tap(page, 'list-active', 'list-active:ok');
    assert.equal(await textOf(page, 'list-count'), '0');
    assert.ok(actions.every(x => x.method === 'GET'),
      'Only authenticated reads after nonposting 320px lifecycle');
    const metrics = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(metrics.content <= metrics.viewport + 2,
      '390px read-only draft view does not horizontally overflow');
    console.log('MOD-008 P5C PASS: authenticated cross-session read-only draft review at 390px');
  } finally {
    await context.close();
  }
}

function verifyNoPosting() {
  const sql = [
    'SELECT (SELECT count(*) FROM purchases) AS purchases,',
    '(SELECT count(*) FROM journal_entries) AS journals,',
    '(SELECT count(*) FROM stock_movements) AS stocks,',
    '(SELECT count(*) FROM cash_movements) AS cash,',
    '(SELECT count(*) FROM supplier_payments) AS supplier_payments',
  ].join(' ');
  const check = spawnSync('podman', ['exec', process.env.HISABIQ_P5C_PG_CONTAINER,
    'psql','-U','postgres','-d','sher_test','-t','-A','-F',',','-c',sql],
    { encoding:'utf8' });
  assert.equal(check.status, 0, 'PostgreSQL source-side nonposting assertion must execute');
  assert.deepEqual(check.stdout.trim().split(','), ['0','0','0','0','0'],
    'draft lifecycle MUST NOT post a purchase, journal, stock, cash or settlement');
}
async function main() {
  settings();
  await preflight();
  process.env.VITE_HISABIQ_INTEGRATION_MODE = 'connected';
  const { createServer } = await import('vite');
  const server = await createServer({
    cacheDir: '.superpowers/mod008-p5c-browser-cache',
    server: { host:'127.0.0.1', port:4220, strictPort:true,
      proxy:{ '/api/v1':{ target:API, changeOrigin:false },
        '/api':{ target:API, changeOrigin:false } } },
  });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      args:['--no-sandbox'],
    });
    const committedId = await exercise(browser, 320, 0);
    lastSafeStage = '390px-readonly';
    await exerciseReadOnly(browser, committedId);
    verifyNoPosting();
    console.log('MOD-008 P5C PASS: zero purchase/journal/stock/cash/supplier-payment rows');
  } finally {
    await browser?.close();
    await server.close();
  }
}
main().catch(() => {
  // A Playwright error can contain request headers (even test JWTs). Never
  // print raw errors, stacks or request metadata from this authenticated run.
  console.error('P5C acceptance FAILED at '+lastSafeStage+' (details suppressed to protect QA credentials)');
  process.exitCode = 1;
});
