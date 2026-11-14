/* M5-05 QA only: React provider -> live Vite proxy -> Nest -> disposable PG16.
 * Never imported into production. No mocked API, no financial stubs. */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const output = '/home/shoaib/Projects/.hisabiq-m505-react-live-20261114/screenshots';
fs.mkdirSync(output, { recursive: true });
const { createServer } = require('vite');
const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const op = () => '01' + Array.from(crypto.randomBytes(24), b => alphabet[b % 32]).join('');
const backend = 'http://127.0.0.1:33081';
if (process.env.MOD005_M505_REAL_BROWSER !== 'EXCLUSIVE_M505_20261114' ||
    process.env.VITE_HISABIQ_INTEGRATION_MODE !== 'connected' ||
    process.env.MOD005_M505_DATABASE_ID !== 'hisabiq_mod005_m505_realack_20261114') {
  throw Error('Refusing unapproved or non-disposable browser run');
}
async function api(path, body, token) {
  const r = await fetch(backend + '/api/v1/' + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const json = await r.json();
  assert.ok(r.ok, path + ' HTTP ' + r.status + ': ' + JSON.stringify(json));
  return json;
}
async function register(identifier, index) {
  const password = 'OnlyM505QA-P4ss';
  const otp = await api('auth/registration/otp', { identifier });
  assert.match(otp.data.devCode, /^[0-9]{6}$/);
  const signed = await api('auth/registration', {
    identifier, otpCode: otp.data.devCode, username: 'm505qa' + index,
    businessName: 'Disposable cash QA ' + index, password, pin: '4821',
  });
  const token = signed.data.accessToken;
  const account = await api('money/accounts', {
    name: 'Disposable counted drawer', type: 'CASH', holderName: null,
    reference: null, isDrawer: true, openingAmountMinor: 500000,
    openingDate: '2026-01-01', operationId: op(),
  }, token);
  assert.ok(account.data.id);
  return { identifier, password, tenantId: signed.data.tenant.id, token };
}
const html = '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div>' +
  '<script type="module">import RefreshRuntime from "/@react-refresh";' +
  'RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};' +
  'window.$RefreshSig$=()=>type=>type;window.__vite_plugin_react_preamble_installed__=true;</script>' +
  '<script type="module" src="/tests/mod005LiveCashRuntimeHarness.tsx"></script></body></html>';
async function scenario(browser, width, index) {
  const user = await register('01712' + String(crypto.randomInt(100000, 999999)), index);
  const ctx = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 },
    hasTouch: width === 390, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  const errors = [], writes = [], commits = [];
  let dropNext = 'start';
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/__m505_real_browser', route =>
    route.fulfill({ contentType: 'text/html', body: html }));
  await page.route('**/api/v1/money/day/**', async route => {
    const req = route.request();
    if (req.method() !== 'POST') return route.continue();
    const action = new URL(req.url()).pathname.split('/').at(-1);
    const body = req.postDataJSON();
    assert.equal(body.operationId, req.headers()['idempotency-key']);
    writes.push({ action, operationId: body.operationId });
    if (action !== dropNext) return route.continue();
    dropNext = null;
    // Forward to actual Nest and observe 201 before denying the browser its ACK.
    const real = await route.fetch();
    const payload = await real.json();
    assert.equal(real.status(), 201, JSON.stringify(payload));
    commits.push({ action, body: payload, operationId: body.operationId });
    await route.abort('failed');
  });
  async function confirmInActualDialog(stage) {
    await page.locator('#open-cash-dialog').click();
    const dialog = page.getByRole('dialog');
    const action = dialog.getByRole('button', { name: 'Confirm previous cash operation' });
    await action.waitFor();
    await page.screenshot({ path: path.join(output, 'real-dialog-' + stage + '-' + width + '.png') });
    if (width === 390) {
      const rect = await dialog.boundingBox();
      assert.ok(rect && rect.x >= -2 && rect.x + rect.width <= 392,
        'recovery dialog must remain inside 390px viewport');
    }
    await action.click();
    await page.waitForFunction(() => { const state = document.querySelector('#cash')?.dataset;
      return state?.pending === 'false' && state.busy === 'false' && state.mode === 'connected'; });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
  }
  try {
    await page.goto('http://127.0.0.1:5179/__m505_real_browser');
    await page.locator('#identifier').fill(user.identifier);
    await page.locator('#password').fill(user.password);
    await page.locator('#login').click();
    await page.locator('#outcome').getByText(/^confirmed:login:/).waitFor();
    await page.waitForFunction(() => document.querySelector('#cash')?.dataset.mode === 'connected');
    assert.equal(await page.locator('#cash').getAttribute('data-can-start'), 'true');
    await page.locator('#start').click();
    await page.locator('#outcome').getByText(/^failed:start:/).waitFor();
    assert.equal(commits.length, 1);
    await page.locator('#refresh').click();
    await page.locator('#outcome').getByText(/^confirmed:refresh:/).waitFor();
    await page.waitForFunction(() => document.querySelector('#cash')?.dataset.open === 'true');
    assert.equal(await page.locator('#auth').getAttribute('data-tenant'), user.tenantId);
    assert.equal(await page.locator('#cash').getAttribute('data-pending'), 'true');
    await page.screenshot({ path: path.join(output, 'start-unknown-' + width + '.png') });
    await confirmInActualDialog('start');
    assert.equal(await page.locator('#cash').getAttribute('data-pending'), 'false');
    assert.equal(writes.at(-1).operationId, commits[0].operationId);

    dropNext = 'close';
    await page.locator('#close').click();
    await page.locator('#outcome').getByText(/^failed:close:/).waitFor();
    assert.equal(commits.at(-1).action, 'close');
    await page.locator('#refresh').click();
    await page.locator('#outcome').getByText(/^confirmed:refresh:/).waitFor();
    await page.waitForFunction(() => { const n = document.querySelector('#cash');
      return n?.dataset.mode === 'connected' && n.dataset.open === 'false'; });
    const closeStatus = await page.locator('#cash').evaluate(node => ({ ...node.dataset }));
    console.log('CLOSE_CONFIRMED_STATE', JSON.stringify(closeStatus));
    assert.equal(await page.locator('#cash').getAttribute('data-reopen'), 'true');
    assert.equal(await page.locator('#cash').getAttribute('data-pending'), 'true');
    await page.screenshot({ path: path.join(output, 'close-unknown-' + width + '.png') });
    await confirmInActualDialog('close');
    assert.equal(await page.locator('#cash').getAttribute('data-pending'), 'false');
    assert.equal(writes.at(-1).operationId, commits[1].operationId);

    dropNext = 'reopen';
    await page.locator('#reopen').click();
    await page.locator('#outcome').getByText(/^failed:reopen:/).waitFor();
    assert.equal(commits.at(-1).action, 'reopen');
    await page.locator('#refresh').click();
    await page.locator('#outcome').getByText(/^confirmed:refresh:/).waitFor();
    await page.waitForFunction(() => document.querySelector('#cash')?.dataset.open === 'true');
    assert.equal(await page.locator('#cash').getAttribute('data-pending'), 'true');
    await confirmInActualDialog('reopen');
    assert.equal(await page.locator('#cash').getAttribute('data-pending'), 'false');
    assert.equal(writes.at(-1).operationId, commits[2].operationId);
    await page.screenshot({ path: path.join(output, 'reopen-verified-' + width + '.png') });

    assert.equal(commits.length, 3);
    assert.deepEqual(writes.map(x => x.action),
      ['start', 'start', 'close', 'close', 'reopen', 'reopen']);
    for (let i = 0; i < commits.length; i += 1) {
      assert.equal(writes[2 * i].operationId, writes[2 * i + 1].operationId);
    }
    assert.deepEqual(errors, []);
    const state = await api('money/day', undefined, user.token);
    const today = state.data ?? state;
    assert.equal(today.todaySession.status, 'OPEN');
    assert.equal(today.todaySession.closes.length, 1);
    assert.equal(today.todaySession.closes[0].status, 'SUPERSEDED');
    console.log('PASS real React lost-ACK Start/Close/Reopen + explicit original-ID confirmation ' + width);
  } finally { await ctx.close(); }
}
(async () => {
  const server = await createServer({ server: { host: '127.0.0.1', port: 5179, strictPort: true, hmr: false,
    proxy: { '/api/v1': { target: backend, changeOrigin: false } } },
    logLevel: 'error' });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({ executablePath: '/usr/bin/chromium',
      headless: true, args: ['--no-sandbox'] });
    await scenario(browser, 1440, 0);
    await scenario(browser, 390, 1);
  } finally {
    await browser?.close();
    await server.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
