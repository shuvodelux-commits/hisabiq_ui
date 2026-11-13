/*
 * MOD-006 P2-D test-only adversarial READ acceptance.
 * Real password/OTP + /me + Nest/PG accounts; browser intercepts only negative,
 * malformed, or delayed responses. No fake successful business API responses.
 * This is NOT an AppShell/ConnectedWorkspaceGate route or financial writer.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const { chromium } = require('playwright');

const apiBase = 'http://127.0.0.1:3068';
const pagePath = '/__mod006_p2d_adversarial';
const idAlphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const id = () => '0' + Array.from(crypto.randomBytes(25), n => idAlphabet[n % 32]).join('');
const requireBoundary = () => {
  assert.equal(process.env.MOD006_P2D_TEST_ONLY,
    'MOD006_P2D_DISPOSABLE_DB_20261113', 'Only the named disposable DB is permitted');
  assert.equal(process.env.MOD006_P2D_API_BASE, apiBase);
  const database = new URL(process.env.MOD006_P2D_DATABASE_URL || 'http://invalid');
  assert.equal(database.hostname, '127.0.0.1');
  assert.equal(database.port, '55683');
  assert.equal(database.pathname, '/hisabiq_mod006_p2d_20261113');
  assert.equal(database.username, 'sher_app');
};

async function api(path, data, token, method = 'POST') {
  const response = await fetch(apiBase+path,{
    method,headers:{
      Accept:'application/json',
      ...(data === undefined ? {} : {'Content-Type':'application/json'}),
      ...(token ? { Authorization:'Bearer '+token } : {}),
    },
    body:data===undefined ? undefined : JSON.stringify(data),redirect:'error',
  });
  return { status:response.status, body:await response.json() };
}
async function register(label) {
  const suffix = crypto.randomBytes(4).toString('hex');
  const identifier='p2d-'+label+'-'+suffix+'@isolated.invalid';
  const password='OnlyDisposableP2d!123';
  const otp=await api('/api/v1/auth/registration/otp',{identifier});
  assert.equal(otp.status,200,'real test-only Nest dev OTP required');
  assert.match(otp.body?.data?.devCode,/^\d{6}$/);
  const created=await api('/api/v1/auth/registration',{
    identifier,otpCode:otp.body.data.devCode,
    username:'p2d'+label+suffix,businessName:'P2-D Synthetic '+label,
    password,pin:'472906',
  });
  assert.equal(created.status,201,JSON.stringify(created.body));
  const logged=await api('/api/v1/auth/login',{identifier,password});
  assert.equal(logged.status,200);
  const token=logged.body.data.accessToken;
  const me=await api('/api/v1/me',undefined,token,'GET');
  assert.equal(me.status,200);
  assert.equal(me.body.data.tenantId,created.body.data.tenant.id);
  return {identifier,password,token,tenantId:me.body.data.tenantId};
}
async function makeAccount(actor,label,type,amountMinor) {
  const operationId=id();
  const created=await api('/api/v1/money/accounts',{
    name:label,type,holderName:null,reference:null,isDrawer:false,
    openingAmountMinor:amountMinor,openingDate:'2026-01-01',operationId,
  },actor.token);
  assert.equal(created.status,201,JSON.stringify(created.body));
  assert.match(created.body.data.id,/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  return created.body.data.id;
}
const tick = ms => new Promise(resolve=>setTimeout(resolve,ms));
async function run() {
  requireBoundary(); // MUST precede any authenticated fixture writes.
  assert.equal((await fetch(apiBase+'/api/v1/me')).status,401,
    'anonymous /me must be rejected by actual Nest');
  const a=await register('a'), b=await register('b');
  assert.notEqual(a.tenantId,b.tenantId);
  const aCash=await makeAccount(a,'P2D Cash A','CASH',125000);
  const aLoan=await makeAccount(a,'P2D Lender A','LOAN',90000);
  const bCash=await makeAccount(b,'P2D Cash B','CASH',1200);
  const foreign=await api('/api/v1/money/accounts/'+aCash+'/statement',undefined,b.token,'GET');
  assert.equal(foreign.status,404,'real foreign tenant statement must be 404');
  console.log('REAL_NEST_401_AND_CROSS_TENANT_404_PASS');

  const {createServer}=await import('vite');
  const vite=await createServer({logLevel:'error',server:{
    host:'127.0.0.1',port:5198,strictPort:true,hmr:false,
    proxy:{'/api/v1':{target:apiBase,changeOrigin:false}},
  }});
  await vite.listen();
  let browser;
  const moneyWrites=[],pageErrors=[],requests=[],failures=[];
  const screenshot=async(page,name)=>{
    if(!process.env.MOD006_P2D_SCREEN_DIR)return;
    fs.mkdirSync(process.env.MOD006_P2D_SCREEN_DIR,{recursive:true});
    await page.screenshot({path:process.env.MOD006_P2D_SCREEN_DIR+'/'+name+'.png',fullPage:true});
  };
  try {
    browser=await chromium.launch({
      executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      headless:true,args:['--no-sandbox'],
    });
    const context=await browser.newContext({
      viewport:{width:320,height:844},hasTouch:true,reducedMotion:'reduce',
    });
    const page=await context.newPage();
    page.setDefaultTimeout(11000);
    page.on('pageerror',e=>pageErrors.push(e.message));
    page.on('request',r=>{
      const pathname=new URL(r.url()).pathname;
      if(!pathname.startsWith('/api/v1/'))return;
      requests.push(r.method()+' '+pathname);
      if(pathname.startsWith('/api/v1/money')&&r.method()!=='GET'){
        moneyWrites.push(r.method()+' '+pathname);
      }
    });
    await page.route('**'+pagePath,route=>route.fulfill({
      contentType:'text/html',
      body:'<!doctype html><html><head><meta charset="UTF-8"></head><body><div id="root"></div>'+
        '<script type="module">import RefreshRuntime from "/@react-refresh";'+
        'RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};'+
        'window.$RefreshSig$=()=>(type)=>type;'+
        'window.__vite_plugin_react_preamble_installed__=true;</script>'+
        '<script type="module" src="/tests/mod006MoneyAccountsLiveHarness.tsx"></script>'+
        '</body></html>',
    }));
    // Do not block navigation on Vite's module preloads; require React to mount separately.
    await page.goto('http://127.0.0.1:5198'+pagePath,
      {waitUntil:'commit',timeout:45_000});
    await page.locator('#p2c-auth').waitFor({timeout:90_000});
    const cards=page.locator('[data-connected-money-account]');
    const cashA=page.locator('[data-connected-money-account="'+aCash+'"]');
    const cashB=page.locator('[data-connected-money-account="'+bCash+'"]');
    const dialog=page.getByRole('dialog');
    const login=async actor=>{
      await page.locator('#p2c-identifier').fill(actor.identifier);
      await page.locator('#p2c-password').fill(actor.password);
      await page.locator('#p2c-login').click();
      await page.waitForFunction(tenant=>
        document.querySelector('#p2c-auth')?.getAttribute('data-tenant')===tenant,
        actor.tenantId);
    };
    const waitLoaded=async accountId=>
      page.locator('[data-connected-money-account="'+accountId+'"]').waitFor();
    const readyPrint=async()=>{
      await page.waitForFunction(()=>Array.from(document.querySelectorAll('[role=dialog] button'))
        .some(button=>/(^Print$|^প্রিন্ট$)/.test(button.textContent?.trim()||'')&&!button.disabled));
    };
    const openCash=async()=>{
      const button=cashA.getByRole('button',{name:/View ledger for/});
      await button.focus();
      await page.keyboard.press('Enter');
      await dialog.waitFor();
    };
    const closeDialog=async()=>{
      await dialog.getByRole('button',{name:'Close',exact:true}).first().click();
      await dialog.waitFor({state:'detached'});
    };
    const injectOnce=async(path,interceptor)=>{
      await page.route('**'+path+'*',async route=>{
        const url=new URL(route.request().url());
        if(url.pathname===path)return interceptor(route);
        await route.continue();
      },{times:1});
    };
    const listPath='/api/v1/money/accounts';
    const statementPath=listPath+'/'+aCash+'/statement';
    const refresh=()=>page.getByRole('button',{name:'Refresh',exact:true}).click();
    const clearFailure=async()=>{
      await page.getByRole('alert').waitFor();
      assert.equal(await cards.count(),0,'failed account GET may not retain old business balances');
      assert.equal(await dialog.count(),0,'failed account GET may not retain printable statement');
      assert.equal(await page.locator('[data-connected-money-liabilities]').count(),0);
    };

    assert.equal(await cards.count(),0,'signed-out preview account fallback prohibited');
    await login(a);
    await waitLoaded(aCash);
    assert.equal(await cards.count(),2);
    assert.ok((await page.locator('[data-connected-money-account="'+aLoan+'"]').innerText())
      .includes('৳900'),'lender liability must show debt, not liquid cash');
    assert.equal(await page.getByRole('button',{name:'Add account'}).isDisabled(),true);
    await screenshot(page,'p2d-320-accounts');

    // Keyboard Enter opens verified server ledger; Escape must close and return focus.
    await openCash();
    await readyPrint();
    const keyboardButtonLabel=await cashA.getByRole('button',{name:/View ledger for/})
      .getAttribute('aria-label');
    await screenshot(page,'p2d-320-ledger');
    await page.keyboard.press('Escape');
    await dialog.waitFor({state:'detached'});
    const focusLabel=await page.evaluate(()=>document.activeElement?.getAttribute('aria-label'));
    assert.equal(focusLabel,keyboardButtonLabel,'Escape must restore keyboard focus to triggering ledger control');
    console.log('KEYBOARD_ENTER_ESCAPE_FOCUS_PASS');

    // Touch action at 320: deliberate phone interaction, no mouse click.
    await cashA.getByRole('button',{name:/View ledger for/}).tap();
    await dialog.waitFor();
    await readyPrint();
    await closeDialog();
    console.log('TOUCH_LEDGER_320_PASS');

    // FAILURE INJECTION ONLY: real role restrictions separately proved by Nest PG tests.
    await injectOnce(listPath,route=>route.fulfill({status:403,contentType:'application/json',
      body:JSON.stringify({error:{code:'FORBIDDEN',message:'P2-D simulated client denial'}})}));
    await refresh();
    await clearFailure();
    assert.match(await page.getByRole('alert').innerText(),/Account-list permission is required/);
    console.log('INJECTED_CLIENT_403_NO_PREVIEW_PASS');
    await refresh();
    await waitLoaded(aCash);

    await injectOnce(listPath,route=>route.fulfill({status:401,contentType:'application/json',
      body:JSON.stringify({error:{code:'UNAUTHORIZED',message:'P2-D simulated token expiry'}})}));
    await refresh();
    await clearFailure();
    assert.match(await page.getByRole('alert').innerText(),/could not be loaded/);
    console.log('INJECTED_CLIENT_401_NO_STALE_PASS');
    await refresh();await waitLoaded(aCash);

    // 200 with plausible-looking but invalid payload must be rejected, never shown.
    await injectOnce(listPath,route=>route.fulfill({status:200,contentType:'application/json',
      body:JSON.stringify({accounts:[{name:'UNVERIFIED GHOST'}],
        totalCashMinor:999999999,totalBankMinor:0,totalMfsMinor:0,totalLoanMinor:0})}));
    await refresh();await clearFailure();
    assert.equal(await page.getByText('UNVERIFIED GHOST').count(),0);
    console.log('MALFORMED_200_NO_FALLBACK_PASS');
    await refresh();await waitLoaded(aCash);

    await injectOnce(listPath,route=>route.abort('timedout'));
    await refresh();await clearFailure();
    console.log('NETWORK_TIMEOUT_ABORT_FAIL_CLOSED_PASS');
    await refresh();await waitLoaded(aCash);

    // Error 404 in statement must not allow printing. Real server is NOT forged.
    await injectOnce(statementPath,route=>route.fulfill({status:404,contentType:'application/json',
      body:JSON.stringify({error:{code:'NOT_FOUND',message:'P2D simulated statement 404'}})}));
    await openCash();
    await dialog.getByRole('alert').waitFor();
    assert.equal(await dialog.getByRole('button',{name:'Print'}).isDisabled(),true);
    assert.match(await dialog.getByRole('alert').innerText(),/could not be loaded/);
    await dialog.getByRole('button',{name:'Retry'}).click();
    await readyPrint();
    await closeDialog();
    console.log('INJECTED_STATEMENT_404_RETRY_PASS');

    await injectOnce(statementPath,route=>route.fulfill({status:200,contentType:'application/json',
      body:'{"accountId":"wrong-account","rows":[{"amountMinor":999}]}'}));
    await openCash();
    await dialog.getByRole('alert').waitFor();
    assert.equal(await dialog.getByRole('button',{name:'Print'}).isDisabled(),true);
    await dialog.getByRole('button',{name:'Retry'}).click();
    await readyPrint();
    await closeDialog();
    console.log('MALFORMED_STATEMENT_200_NO_PRINT_PASS');

    // Hold a true Nest GET across verified tenant switch, release afterward.
    let release;
    let held=false;
    await page.route('**/api/v1/money/accounts*',async route=>{
      if(new URL(route.request().url()).pathname===listPath&&!held){
        held=true;await new Promise(resolve=>{release=resolve;});
      }
      await route.continue().catch(()=>{ /* stale canceled request only */ });
    },{times:1});
    await page.getByRole('button',{name:'Refresh',exact:true})
      .evaluate(element=>element.click());
    for(let i=0;i<120&&!held;i++)await tick(25);
    assert.equal(held,true);
    assert.equal(await cards.count(),0,'old money must hide while server GET is held');
    await login(b);
    release();
    await waitLoaded(bCash);
    assert.equal(await cashA.count(),0);
    assert.equal(await cards.count(),1);
    assert.equal(await dialog.count(),0);
    console.log('STALE_LATE_REAL_GET_CROSS_TENANT_FAIL_CLOSED_PASS');

    // Logout while a real statement is visible must invalidate old print.
    await cashB.getByRole('button',{name:/View ledger for/}).tap();
    await dialog.waitFor();
    await page.locator('#p2c-logout').evaluate(element=>element.click());
    await page.waitForFunction(()=>document.querySelector('#p2c-auth')
      ?.getAttribute('data-status')==='signed-out');
    assert.equal(await cards.count(),0);
    assert.equal(await dialog.count(),0);
    console.log('LOGOUT_INVALIDATES_PRINT_PASS');

    await login(a);await waitLoaded(aCash);
    await page.locator('#p2c-language').click();
    await page.getByText('টাকার হিসাব').first().waitFor();
    for(const width of [320,390,768,1440]){
      for(const theme of ['light','dark']){
        await page.setViewportSize({width,height:900});
        await page.evaluate(mode=>
          document.documentElement.classList.toggle('dark',mode==='dark'),theme);
        const bounds=await page.evaluate(()=>({
          doc:document.documentElement.scrollWidth,view:innerWidth,
          account:document.querySelector('[data-connected-money-accounts]')?.scrollWidth,
        }));
        if(bounds.doc>bounds.view+1)failures.push({width,theme,bounds});
        if(width===320||width===1440)await screenshot(page,
          'p2d-bn-'+width+'-'+theme);
      }
    }
    assert.deepEqual(failures,[],'responsive Bangla account view overflow');
    assert.deepEqual(pageErrors,[],'React page errors must not be ignored');
    assert.deepEqual(moneyWrites,[],'browser Money Accounts may never write');
    const browserStorage=await page.evaluate(()=>JSON.stringify({
      local:Object.entries(localStorage),session:Object.entries(sessionStorage),
    }));
    assert.ok(!browserStorage.includes(a.token)&&!browserStorage.includes(b.token),
      'access tokens cannot be persisted in browser storage');
    assert.ok(requests.some(entry=>entry==='GET /api/v1/money/accounts'),
      'real account GET absent');
    assert.ok(requests.some(entry=>entry.includes('/statement')),
      'real statement GET absent');
    console.log('MOD006_P2D_ADVERSARIAL_BROWSER_PASS',
      JSON.stringify({real401:true,realForeign404:true,
        injected403:true,injected401:true,malformed:true,networkAbort:true,
        statement404:true,statementMalformed:true,staleRealGet:true,
        keyboard:true,touch:true,bilingual:true,responsiveCombinations:8,
        financialBrowserWrites:moneyWrites.length,apiGetCount:requests.filter(x=>x.startsWith('GET /api/v1/money')).length}));
  } finally {
    await browser?.close();
    await vite.close();
  }
}
run().catch(error=>{console.error(error);process.exitCode=1});
