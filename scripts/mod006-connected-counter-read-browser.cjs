/* MOD-006 T02-H1 — real signed READ-ONLY Counter React→Nest→disposable PG16.
 * NEVER use against any retained/production DB. No Counter payment posting,
 * connected-route activation, previews, journal writes or background worker.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { chromium } = require('playwright');
const API = 'http://127.0.0.1:56111';
const DB = 'hisabiq_mod006_h1_counter_20261116';
const CONTAINER = 'hisabiq-mod006-h1-counter-pg-20261116';
const ACK = 'MOD006_H1_READ_ONLY_DISPOSABLE_20261116';
const letters = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const id = () => '0' + [...crypto.randomBytes(25)].map(x => letters[x % 32]).join('');
const isId = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
function fail(message) { throw Error('H1 READ-ONLY SAFETY: ' + message); }
function guard() {
  if (process.env.MOD006_H1_ACK !== ACK ||
      process.env.MOD006_H1_ORIGIN !== API ||
      process.env.MOD006_H1_DB !== DB ||
      process.env.MOD006_H1_CONTAINER !== CONTAINER) {
    fail('explicit disposable database identity not acknowledged');
  }
  const result = spawnSync('podman', ['inspect', '--format', '{{json .}}', CONTAINER], {
    encoding:'utf8', timeout:8000, maxBuffer:2*1024*1024,
  });
  if (result.status !== 0 || !result.stdout) fail('disposable container unavailable');
  let info;
  try { info = JSON.parse(result.stdout); } catch { fail('invalid PG16 inspect'); }
  const env = info.Config?.Env || [];
  const tmpfs = info.HostConfig?.Tmpfs || {};
  if (!info.State?.Running || !env.includes('PG_MAJOR=16') ||
      !env.includes('POSTGRES_DB=' + DB) ||
      !/postgres:16-alpine/.test(info.Config?.Image || info.ImageName || '') ||
      (!Object.keys(tmpfs).includes('/var/lib/postgresql/data') &&
       !info.Mounts?.some(m => m.Type === 'tmpfs' && m.Destination === '/var/lib/postgresql/data'))) {
    fail('named PG16 disposable tmpfs identity mismatch');
  }
}
async function api(path,method='GET',body,token) {
  if (!/^\/api\/v1\/[a-z0-9/-]+$/.test(path) &&
      !/^\/api\/v2\/parties(?:\?.*)?$/.test(path)) fail('unapproved test-only API path');
  const response=await fetch(API+path,{
    method,redirect:'error',
    headers:{
      Accept:'application/json',
      ...(body===undefined?{}:{'Content-Type':'application/json'}),
      ...(token?{Authorization:'Bearer '+token}:{}),
      ...(method==='POST'&&!path.startsWith('/api/v1/auth/')?
        {'Idempotency-Key':body?.operationId||id()}:{}),
    },
    body:body===undefined?undefined:JSON.stringify(body),
    signal:AbortSignal.timeout(60000),
  });
  return {status:response.status,body:await response.json()};
}
function ok(result,status,message) {
  assert.equal(result.status,status,message+' '+JSON.stringify(result.body?.error||{}));
  return result.body;
}
function queryPg(query) {
  const result=spawnSync('podman',[
    'exec',CONTAINER,'psql','-U','postgres','-d',DB,'-At',
    '-v','ON_ERROR_STOP=1','-c',query,
  ],{encoding:'utf8',timeout:10000,maxBuffer:1024*1024});
  assert.equal(result.status,0,'PG read failed: '+result.stderr);
  return result.stdout.trim();
}
async function register(label,mode) {
  const suffix=crypto.randomBytes(4).toString('hex');
  const identifier='h1-'+label+'-'+suffix+'@isolated.invalid';
  const password='H1ReadOnlyTestPassw0rd!1';
  const otp=ok(await api('/api/v1/auth/registration/otp','POST',{identifier}),
    200,'OTP '+label);
  assert.match(otp.data.devCode,/^\d{6}$/);
  const signup=ok(await api('/api/v1/auth/registration','POST',{
    identifier,otpCode:otp.data.devCode,username:'h1'+label+suffix,
    businessName:'H1 disposable '+label,password,pin:'472906',
  }),201,'signup '+label);
  const login=ok(await api('/api/v1/auth/login','POST',{identifier,password}),
    200,'signed login '+label);
  const token=login.data.accessToken;
  const me=ok(await api('/api/v1/me','GET',undefined,token),200,'/me '+label);
  assert.equal(me.data.tenantId,signup.data.tenant.id);
  for (const permission of ['party.customer.view','party.supplier.view',
    'cash.account.view','cash.daily.view','bank.account.view']) {
    assert.ok(me.data.permissions.includes(permission),'permission '+permission);
  }
  ok(await api('/api/v1/settings/value','POST',{
    key:'cash_session_enabled',value:mode==='ON'?'on':'off',
  },token),201,'cash setting '+mode);
  ok(await api('/api/v1/settings/value','POST',{
    key:'bank_accounts_enabled',value:'on',
  },token),201,'activate test banking');
  const cash=ok(await api('/api/v1/money/accounts','POST',{
    name:'H1 '+label+' drawer',type:'CASH',
    holderName:null,reference:null,isDrawer:true,
    openingAmountMinor:50000,openingDate:'2026-01-01',operationId:id(),
  },token),201,'CASH drawer').data.id;
  assert.match(cash,isId);
  const bank=ok(await api('/api/v1/money/accounts','POST',{
    name:'H1 '+label+' bank',type:'BANK',
    holderName:null,reference:null,isDrawer:false,
    openingAmountMinor:30000,openingDate:'2026-01-01',operationId:id(),
  },token),201,'bank account').data.id;
  assert.match(bank,isId);
  const customer=ok(await api('/api/v1/parties','POST',{
    name:'H1 '+label+' Customer',roles:['CUSTOMER'],phone:'01712345678',
    address:null,guardianName:null,nid:null,email:null,notes:null,
    customerGroupId:null,creditLimitMinor:null,
  },token),201,'customer').data.id;
  const supplier=ok(await api('/api/v1/parties','POST',{
    name:'H1 '+label+' Supplier',roles:['SUPPLIER'],phone:'01812345678',
    address:null,guardianName:null,nid:null,email:null,notes:null,
    customerGroupId:null,creditLimitMinor:null,
  },token),201,'supplier').data.id;
  assert.match(customer,isId);assert.match(supplier,isId);
  const day=ok(await api('/api/v1/money/day','GET',undefined,token),200,'day '+mode);
  assert.equal(day.enabled,mode==='ON');assert.equal(day.todaySession,null);
  const accounts=ok(await api('/api/v1/money/accounts','GET',undefined,token),
    200,'source accounts');
  assert.equal(accounts.accounts.find(a=>a.id===cash)?.balanceMinor,50000);
  assert.equal(accounts.accounts.find(a=>a.id===bank)?.balanceMinor,30000);
  return {identifier,password,token,tenant:me.data.tenantId,customer,supplier,cash,bank,day};
}
async function run() {
  guard();
  ok(await api('/api/v1/me'),401,'unsigned API must refuse');
  const a=await register('alpha','ON'), b=await register('beta','OFF');
  assert.notEqual(a.tenant,b.tenant);
  const before=queryPg('SELECT (SELECT count(*) FROM customer_receipts),'+
    '(SELECT count(*) FROM supplier_payments),'+
    '(SELECT count(*) FROM journal_entries)');
  const { createServer }=await import('vite');
  const vite=await createServer({
    logLevel:'error',
    server:{host:'127.0.0.1',port:0,strictPort:false,hmr:false,
      proxy:{
        '/api/v1':{target:API,changeOrigin:false},
        '/api/v2':{target:API,changeOrigin:false},
      },
    },
  });
  await vite.listen();
  const origin='http://127.0.0.1:'+vite.httpServer.address().port;
  let browser;
  try {
    browser=await chromium.launch({
      executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,
      args:['--no-sandbox'],
    });
    const page=await browser.newPage({
      viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce',
    });
    page.setDefaultTimeout(30000);
    const errors=[], paymentPosts=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{
      const pathname=new URL(r.url()).pathname;
      if(r.method()==='POST'&&[
        '/api/v1/customer-payments','/api/v1/suppliers/payments',
        '/api/v1/money/day/start',
      ].includes(pathname))paymentPosts.push({path:pathname,method:r.method()});
    });
    await page.route('**/__mod006_h1_real_counter_read_only',route=>route.fulfill({
      contentType:'text/html',
      body:'<!doctype html><html><head><meta charset="UTF-8"></head>'+
        '<body><div id="root"></div>'+
        '<script type="module">import RefreshRuntime from "/@react-refresh";'+
        'RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};'+
        'window.$RefreshSig$=()=>(type)=>type;'+
        'window.__vite_plugin_react_preamble_installed__=true;</script>'+
        '<script type="module" src="/tests/mod006ConnectedCounterReadHarness.tsx"></script>'+
        '</body></html>',
    }));
    await page.goto(origin+'/__mod006_h1_real_counter_read_only');
    await page.locator('#h1-session[data-status="signed-out"]').waitFor();
    assert.equal(await page.locator('[data-connected-counter]').count(),0);
    async function signIn(actor) {
      await page.locator('#h1-identifier').fill(actor.identifier);
      await page.locator('#h1-password').fill(actor.password);
      await page.locator('#h1-login').click();
      await page.locator('#h1-session[data-status="authenticated"]').waitFor();
      assert.equal(await page.locator('#h1-session').getAttribute('data-tenant'),actor.tenant);
      await page.locator('[data-connected-counter][data-read-only="true"]').waitFor();
      await page.locator('[data-counter-party-state="ready"]').waitFor();
      await page.locator('#connected-counter-account[data-counter-account-state="ready"]').waitFor();
      await page.locator('[data-counter-cash-status="NOT_STARTED"],[data-counter-cash-status="OFF"]').waitFor();
      assert.equal(await page.locator('[data-counter-submit-disabled]').isDisabled(),true);
    }
    await signIn(a);
    await page.locator('[data-counter-cash-status="NOT_STARTED"]').waitFor();
    assert.equal(await page.locator('[data-counter-party="'+a.customer+'"]').count(),1);
    assert.equal(await page.locator('[data-counter-party="'+b.customer+'"]').count(),0);
    await page.locator('[data-counter-party="'+a.customer+'"]').click();
    assert.equal(await page.locator('[data-counter-source-party]').getAttribute('data-counter-source-party'),a.customer);
    await page.locator('#connected-counter-account').selectOption(a.cash);
    assert.match(await page.locator('[data-counter-source-balance]').innerText(),/500\.00/);
    await page.locator('#connected-counter-party-search').fill('Nothing-match-h1');
    await page.locator('[data-counter-party-state="ready"]').waitFor();
    assert.equal(await page.locator('[data-counter-party]').count(),0);
    assert.equal(await page.locator('[data-counter-source-party]').count(),0);
    await page.locator('#connected-counter-party-search').fill('');
    await page.locator('[data-counter-party="'+a.customer+'"]').waitFor();
    const tabs=page.locator('[role="group"][aria-label="Connected Counter actions"] button');
    await tabs.nth(1).focus();
    await page.keyboard.press('Enter');
    await page.locator('[data-counter-party-state="ready"]').waitFor();
    await page.locator('[data-counter-party="'+a.supplier+'"]').waitFor();
    assert.equal(await page.locator('[data-counter-party="'+a.customer+'"]').count(),0);
    await page.locator('[data-counter-party="'+a.supplier+'"]').click();
    assert.equal(await page.locator('[data-counter-source-party]').getAttribute('data-counter-source-party'),a.supplier);
    for (const disabled of [2,3,4])assert.equal(await tabs.nth(disabled).isDisabled(),true);
    await page.setViewportSize({width:320,height:700});
    assert.equal(await page.locator('[data-counter-submit-disabled]').isDisabled(),true);
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(overflow<=2,'320px horizontal overflow '+overflow);
    console.log('H1_ON_PARTY_ACCOUNT_CASH_UNOPENED_SEARCH_ROLE_KEYBOARD_320_PASS');
    const started=ok(await api('/api/v1/money/day/start','POST',{
      businessDate:a.day.businessDate,openingAmountMinor:50000,
      counterpartAccountCode:null,note:null,operationId:id(),
    },a.token),201,'real ON Cash Day start').data.id;
    assert.match(started,isId);
    await page.getByRole('button',{name:/Refresh|রিফ্রেশ/}).click();
    await page.locator('[data-counter-cash-status="OPEN"]').waitFor();
    console.log('H1_REAL_DAY_REFRESH_OPEN_PASS');

    await page.locator('#h1-logout').click();
    await page.locator('#h1-session[data-status="signed-out"]').waitFor();
    assert.equal(await page.locator('[data-connected-counter]').count(),0);
    await page.setViewportSize({width:390,height:844});
    await signIn(b);
    await page.locator('[data-counter-cash-status="OFF"]').waitFor();
    const secondRoleButtons=page.locator('[role="group"][aria-label="Connected Counter actions"] button');
    await secondRoleButtons.nth(0).click();
    await page.locator('[data-counter-party="'+b.customer+'"]').waitFor();
    assert.equal(await page.locator('[data-counter-party="'+a.customer+'"]').count(),0);
    assert.equal(await page.locator('[data-counter-party="'+b.customer+'"]').count(),1);
    await page.locator('[data-counter-party="'+b.customer+'"]').click();
    await page.locator('#connected-counter-account').selectOption(b.bank);
    assert.match(await page.locator('[data-counter-source-balance]').innerText(),/300\.00/);
    assert.equal(await page.locator('[data-counter-submit-disabled]').isDisabled(),true);
    const second=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
    assert.ok(second<=2,'390px horizontal overflow '+second);
    assert.deepEqual(paymentPosts,[],'Counter UI must never POST financial data');
    assert.deepEqual(errors,[],'React browser must not throw');
    const after=queryPg('SELECT (SELECT count(*) FROM customer_receipts),'+
      '(SELECT count(*) FROM supplier_payments),'+
      '(SELECT count(*) FROM journal_entries)');
    assert.equal(after,before,'Counter read interactions must not alter journals/documents');
    console.log('H1_SIGNED_TWO_TENANT_ACCOUNT_PARTY_READ_CASH_DAY_NO_PAYMENTS_PASS');
  } finally {
    await browser?.close();
    await vite.close();
  }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
