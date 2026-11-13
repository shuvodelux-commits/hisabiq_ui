/*
 * MOD-006 P2-C: Live React SessionStore -> Vite same-origin proxy ->
 * real Nest API -> disposable PostgreSQL16. Test-only. No fake successful
 * API responses, no AppShell/global connected-workspace gate modifications.
 * The bootstrap API POSTs below provision disposable synthetic fixtures.
 * After the browser begins, NO financial HTTP POST/PATCH/DELETE is permitted.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const { chromium } = require('playwright');

const apiBase = 'http://127.0.0.1:3000';
const livePath = '/__mod006_p2c_live_browser';
const idAlphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function ulid() {
  return '0' + Array.from(crypto.randomBytes(25), n => idAlphabet[n % idAlphabet.length]).join('');
}
function assertTestEnvironment() {
  assert.equal(process.env.MOD006_P2C_TEST_ONLY, 'MOD006_P2C_DISPOSABLE_DB_ONLY_20261113',
    'No non-disposable browser QA permitted');
  assert.equal(process.env.MOD006_P2C_LIVE_BASE_URL, apiBase);
}
async function request(path, body, accessToken, method = 'POST') {
  const response = await fetch(apiBase + path, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken === undefined ? {} : { Authorization: 'Bearer ' + accessToken }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'error',
  });
  const result = await response.json();
  return { status: response.status, body: result };
}
async function register(label) {
  const suffix = crypto.randomBytes(4).toString('hex');
  const identifier = 'p2c-browser-' + label + '-' + suffix + '@isolated.invalid';
  const password = 'P2cOnlyPassw0rd!1';
  const issued = await request('/api/v1/auth/registration/otp', { identifier });
  assert.equal(issued.status, 200, 'real test-only development OTP must be available');
  const otpCode = issued.body?.data?.devCode;
  assert.match(otpCode, /^[0-9]{6}$/, 'OTP may not be mocked or replaced');
  const signup = await request('/api/v1/auth/registration', {
    identifier, otpCode, username: 'p2cbrowser' + label + suffix,
    businessName: 'P2C Browser Disposable ' + label, password, pin: '472906',
  });
  assert.equal(signup.status, 201, JSON.stringify(signup.body));
  const session = await request('/api/v1/auth/login', { identifier, password });
  assert.equal(session.status, 200);
  const accessToken = session.body.data.accessToken;
  const me = await request('/api/v1/me', undefined, accessToken, 'GET');
  assert.equal(me.status, 200, 'real /me must verify signed identity');
  assert.equal(me.body.data.tenantId, signup.body.data.tenant.id);
  return { identifier, password, token: accessToken,
    tenantId: me.body.data.tenantId, userId: me.body.data.user.id };
}
async function setting(actor, key, value) {
  const response = await request('/api/v1/settings/value', { key, value }, actor.token);
  assert.equal(response.status, 201, JSON.stringify(response.body));
}
async function account(actor, name, type, amountMinor, openingMissing = false, inactive = false) {
  const operationId = ulid();
  const response = await request('/api/v1/money/accounts', {
    name, type, holderName: null, reference: null, isDrawer: false,
    openingAmountMinor: amountMinor, openingDate: openingMissing ? null : '2026-01-01', operationId,
  }, actor.token);
  assert.equal(response.status, 201, JSON.stringify(response.body));
  const id = response.body.data.id;
  assert.match(id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  if (inactive) {
    const retired = await request('/api/v1/money/accounts/' + id + '/deactivate',
      { version: response.body.data.version }, actor.token);
    assert.equal(retired.status, 200, JSON.stringify(retired.body));
  }
  return id;
}
async function seed() {
  const a = await register('a');
  const b = await register('b');
  assert.notEqual(a.tenantId,b.tenantId);
  await setting(a,'bank_accounts_enabled','on');
  await setting(b,'bank_accounts_enabled','on');
  const ids = {
    cashA: await account(a,'Duplicate name across tenants','CASH',120000),
    bank: await account(a,'Bank holding','BANK',220000),
    mfs: await account(a,'Mobile wallet','MFS',7500),
    loan: await account(a,'Lender payable','LOAN',900000),
    missing: await account(a,'Missing cash opening','CASH',0,true),
    inactive: await account(a,'Inactive cash','CASH',0,true,true),
    cashB: await account(b,'Duplicate name across tenants','CASH',44000),
  };
  const aList = await request('/api/v1/money/accounts',undefined,a.token,'GET');
  assert.equal(aList.status,200);
  assert.equal(aList.body.accounts.find(x=>x.id===ids.loan).balanceMinor,-900000);
  assert.equal(aList.body.totalLoanMinor,900000);
  const deniedForeign = await request('/api/v1/money/accounts/'+ids.cashA+'/statement',
    undefined,b.token,'GET');
  assert.equal(deniedForeign.status,404,'foreign tenant statement must fail safely');
  return { a,b,ids };
}
async function run() {
  assertTestEnvironment();
  const nestStatus = await fetch(apiBase+'/api/v1/me').then(r=>r.status);
  assert.equal(nestStatus,401,'real protected Nest must be live on local port 3000');
  const fixture = await seed();

  // The proxy is a development-only equivalent of the actual HisabIQ same-origin
  // request path; account responses are forwarded from Nest untouched.
  const { createServer } = await import('vite');
  const vite = await createServer({
    logLevel: 'error',
    server: {
      host: '127.0.0.1', port: 0, strictPort: false, hmr: false,
      proxy: { '/api/v1': { target: apiBase, changeOrigin: false } },
    },
  });
  await vite.listen();
  const port = vite.httpServer.address().port;
  let browser;
  const badMoneyWrites = [];
  const seen = [];
  const errors = [];
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      headless: true, args: ['--no-sandbox'],
    });
    const page = await browser.newPage({ viewport:{width:390,height:844},
      reducedMotion:'reduce' });
    page.setDefaultTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', req => {
      const path = new URL(req.url()).pathname;
      if (!path.startsWith('/api/v1/')) return;
      seen.push(req.method()+' '+path);
      if (path.startsWith('/api/v1/money') && req.method() !== 'GET') {
        badMoneyWrites.push(req.method()+' '+path);
      }
    });
    page.on('console', message => {
      if (message.type()!=='error') return;
      const detail=message.text();
      // Vite's injected *development-only* HMR client tries ports 5173/0 when
      // this one-shot test allocates an ephemeral HTTP port. Those known WS
      // messages are not React exceptions or application HTTP failures. Do not
      // broadly ignore console errors: every other error still fails QA.
      const devHmrSocketError =
        /^WebSocket connection to 'ws:\/\/127\.0\.0\.1:(?:5173|0)\/\?token=[^']+' failed: Error in connection establishment: net::ERR_(?:UNSAFE_PORT|BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS)$/.test(detail)
        || detail.startsWith('[vite] failed to connect to websocket.\n');
      if (!devHmrSocketError) errors.push(detail.slice(0,300));
    });
    page.route('**'+livePath, route => route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html><head><meta charset="UTF-8"></head><body><div id="root"></div>'+
        '<script type="module">import RefreshRuntime from "/@react-refresh";'+
        'RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$=()=>{};'+
        'window.$RefreshSig$=()=>(type)=>type;'+
        'window.__vite_plugin_react_preamble_installed__=true;</script>'+
        '<script type="module" src="/tests/mod006MoneyAccountsLiveHarness.tsx"></script>'+
        '</body></html>',
    }));
    await page.goto('http://127.0.0.1:'+port+livePath);
    const login = async actor => {
      await page.locator('#p2c-identifier').fill(actor.identifier);
      await page.locator('#p2c-password').fill(actor.password);
      await page.locator('#p2c-login').click();
      await page.waitForFunction(expected =>
        document.querySelector('#p2c-auth')?.getAttribute('data-tenant')===expected,
        actor.tenantId);
    };
    const accounts = page.locator('[data-connected-money-account]');
    assert.equal(await accounts.count(),0,'signed-out connected mode must never show preview accounts');
    await login(fixture.a);
    const cash = page.locator('[data-connected-money-account="'+fixture.ids.cashA+'"]');
    await cash.waitFor();
    assert.equal(await accounts.count(),5);
    assert.ok((await page.locator('[data-connected-money-account="'+fixture.ids.loan+'"]').innerText())
      .includes('৳9,000'),'lender credit-negative journal must be displayed as amount owed');
    assert.ok((await page.locator('[data-connected-money-account="'+fixture.ids.missing+'"]').innerText())
      .includes('Not recorded'),'no historical opening must not be fabricated');
    assert.equal(await page.getByRole('button',{name:'Add account'}).isDisabled(),true);
    assert.equal(await page.getByRole('button',{name:'Transfer',exact:true}).first().isDisabled(),true);

    await cash.getByRole('button',{name:/View ledger for/}).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    await page.waitForFunction(id =>
      Array.from(document.querySelectorAll('[role=dialog] *')).some(e =>
        e.textContent?.includes('Opening') || e.textContent?.includes('opening')),
      fixture.ids.cashA).catch(async error => {
      throw new Error('Live statement did not render: '+
        (await dialog.innerText()).slice(0,2000)+'; '+error.message);
    });
    assert.ok(seen.some(s=>s.includes('/api/v1/money/accounts/'+fixture.ids.cashA+'/statement')),
      'statement GET must target exact server ULID, not account name');

    // Legitimate same-epoch token rotation: hold the real GET, not a fake reply.
    let release;
    let blocked=false;
    await page.route('**/api/v1/money/accounts*',async route => {
      const path = new URL(route.request().url()).pathname;
      if (path==='/api/v1/money/accounts'&&!blocked) {
        blocked=true;
        await new Promise(resolve=>{release=resolve});
      }
      await route.continue();
    });
    await page.locator('#p2c-refresh').evaluate(el=>el.click());
    for(let i=0;i<120&&!blocked;i++)await new Promise(resolve=>setTimeout(resolve,25));
    assert.equal(blocked,true,'refresh should initiate a real account GET');
    assert.equal(await accounts.count(),0,'old accounts hidden before refreshed GET completes');
    assert.equal(await dialog.count(),0,'stale statement and print hidden before refreshed GET');
    release();
    await cash.waitFor();

    // Changing verified identity must erase tenant A rows before tenant B rows render.
    await login(fixture.b);
    const bCash = page.locator('[data-connected-money-account="'+fixture.ids.cashB+'"]');
    await bCash.waitFor();
    assert.equal(await accounts.count(),1);
    assert.equal(await cash.count(),0);
    assert.equal(await page.locator('[data-connected-money-liabilities]').count(),0);
    await bCash.getByRole('button',{name:/View ledger for/}).click();
    await dialog.waitFor();
    await page.locator('#p2c-logout').evaluate(el=>el.click());
    await page.waitForFunction(()=>
      document.querySelector('#p2c-auth')?.getAttribute('data-status')==='signed-out');
    assert.equal(await accounts.count(),0);
    assert.equal(await dialog.count(),0,'logged-out statement and print must disappear');

    await login(fixture.a);
    await cash.waitFor();
    await page.locator('#p2c-language').click();
    await page.getByText('টাকার হিসাব').first().waitFor();
    // Continue through every viewport even if one fails: capture true P0
    // dimensions and screenshots without hiding, downgrading or skipping it.
    const overflowFailures=[];
    for(const width of [320,390,768,1440]){
      for(const theme of ['light','dark']){
        await page.setViewportSize({width,height:900});
        await page.evaluate(mode=>document.documentElement.classList.toggle('dark',mode==='dark'),theme);
        const layout=await page.evaluate(()=>({
          doc:document.documentElement.scrollWidth,view:innerWidth,
          controls:document.getElementById('p2c-fixture-controls')?.scrollWidth,
          accounts:document.querySelector('[data-connected-money-accounts]')?.scrollWidth,
          body:document.body.scrollWidth,
          summary:document.querySelector('[data-connected-money-summary]')?.scrollWidth,
          summaryClient:document.querySelector('[data-connected-money-summary]')?.clientWidth,
          liabilities:document.querySelector('[data-connected-money-liabilities]')?.scrollWidth,
          cards:[...document.querySelectorAll('[data-connected-money-account]')].map(card=>({
            width:card.clientWidth,scroll:card.scrollWidth,
            footer:[...card.querySelectorAll('span')].filter(e=>/Opening date|শুরুর তারিখ/.test(e.textContent||''))
              .map(e=>({width:e.clientWidth,scroll:e.scrollWidth,
                minWidth:getComputedStyle(e).minWidth,whiteSpace:getComputedStyle(e).whiteSpace})),
          })),
        }));
        console.log('WIDTH_CHECK',width,theme,layout);
        if(layout.doc>layout.view+1){
          overflowFailures.push({width,theme,document:layout.doc,viewport:layout.view,
            accountRoot:layout.accounts,cardWidths:layout.cards.map(card=>card.width)});
        }
        if(process.env.MOD006_P2C_SCREEN_DIR&&(width===320||width===1440)){
          fs.mkdirSync(process.env.MOD006_P2C_SCREEN_DIR,{recursive:true});
          await page.screenshot({
            path:process.env.MOD006_P2C_SCREEN_DIR+'/p2c-live-'+width+'-'+theme+'.png',
            fullPage:true,
          });
        }
      }
    }
    assert.deepEqual(badMoneyWrites,[],'live Money Accounts browser must make no business writes');
    assert.deepEqual(errors,[],'real mounted React should have no uncaught browser errors');
    const tokens = await page.evaluate(()=>
      JSON.stringify([Object.entries(localStorage),Object.entries(sessionStorage)]));
    assert.ok(!tokens.includes(fixture.a.token)&&!tokens.includes(fixture.b.token),
      'access bearer may not appear in browser persisted storage');
    assert.ok(seen.some(s=>s==='GET /api/v1/me'),'real verified /me must be called');
    assert.ok(seen.some(s=>s==='GET /api/v1/money/accounts'),
      'account GETs must pass through Vite proxy to Nest');
    assert.deepEqual(overflowFailures,[],
      'P2-C real responsive gate RED: actual 320px/card overflow must be fixed in source; see issue #420');
    console.log('P2-C LIVE React -> Nest -> disposable PG16: two tenants, token rotation, ledger, permissions, responsive/Bangla, zero business writes PASS');
  } finally {
    await browser?.close();
    await vite.close();
  }
}
run().catch(error=>{console.error(error);process.exitCode=1});
