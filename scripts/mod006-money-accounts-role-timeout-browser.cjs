/*
 * MOD-006 P2-E TEST ONLY — real staff permissions, lender overpayment,
 * and actual 12s client read timeout against Nest + disposable PostgreSQL16.
 * Does not mount a production route; does not fake successful money responses.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const {chromium} = require('playwright');

const apiBase='http://127.0.0.1:3072';
const routePath='/__mod006_p2e_authentic_role';
const ulid=()=> '0'+Array.from(crypto.randomBytes(25),n=>'0123456789ABCDEFGHJKMNPQRSTVWXYZ'[n%32]).join('');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const asDate=()=>new Date(Date.now()+6*60*60*1000).toISOString().slice(0,10);
function guard() {
  assert.equal(process.env.MOD006_P2E_TEST_ONLY,
    'MOD006_P2E_DISPOSABLE_DB_20261113','Test-only opt-in required');
  assert.equal(process.env.MOD006_P2E_API_BASE,apiBase);
  const u=new URL(process.env.MOD006_P2E_DATABASE_URL||'http://invalid');
  assert.equal(u.protocol,'postgres:');
  assert.equal(u.hostname,'127.0.0.1');
  assert.equal(u.port,'55687');
  assert.equal(u.pathname,'/hisabiq_mod006_p2e_20261113');
  assert.equal(u.username,'sher_app');
}
async function api(path,body,token,method='POST') {
  const r=await fetch(apiBase+path,{
    method,redirect:'error',headers:{
      Accept:'application/json',
      ...(body===undefined?{}:{'Content-Type':'application/json'}),
      ...(token?{Authorization:'Bearer '+token}:{})
    },body:body===undefined?undefined:JSON.stringify(body)
  });
  const raw=await r.text();
  let data=null;
  if(raw){try{data=JSON.parse(raw)}catch{data=raw}}
  return {status:r.status,body:data};
}
async function createTenant(label) {
  const suffix=crypto.randomBytes(4).toString('hex');
  const identifier='p2e-owner-'+label+'-'+suffix+'@isolated.invalid';
  const password='P2eOnlyOwnerPass!123';
  const otp=await api('/api/v1/auth/registration/otp',{identifier});
  assert.equal(otp.status,200,'real Nest dev OTP required');
  assert.match(otp.body?.data?.devCode,/^\d{6}$/);
  const created=await api('/api/v1/auth/registration',{
    identifier,otpCode:otp.body.data.devCode,
    username:'p2eowner'+label+suffix,
    businessName:'P2E Strict Synthetic '+label,password,pin:'472906'
  });
  assert.equal(created.status,201,JSON.stringify(created.body));
  const login=await api('/api/v1/auth/login',{identifier,password});
  assert.equal(login.status,200);
  const token=login.body?.data?.accessToken;
  const me=await api('/api/v1/me',undefined,token,'GET');
  assert.equal(me.status,200);
  assert.equal(me.body.data.tenantId,created.body.data.tenant.id);
  return {identifier,password,token,tenantId:me.body.data.tenantId};
}
async function enableBank(owner) {
  const r=await api('/api/v1/settings/value',
    {key:'bank_accounts_enabled',value:'on'},owner.token);
  assert.equal(r.status,201,JSON.stringify(r.body));
}
async function account(owner,name,type,minor) {
  const operationId=ulid();
  const r=await api('/api/v1/money/accounts',{
    name,type,holderName:null,reference:null,isDrawer:false,
    openingAmountMinor:minor,openingDate:'2026-01-01',operationId
  },owner.token);
  assert.equal(r.status,201,JSON.stringify(r.body));
  assert.match(r.body?.data?.id,/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  return r.body.data.id;
}
async function staff(owner,label,permissions) {
  // Genuine Nest role + staff User. Never mutate seeded Owner permissions.
  const role=await api('/api/v1/roles',{
    name:'P2E '+label+' role',permissions,confirmPassword:owner.password,
    cashRefundPerReturnMinor:null,cashRefundPerDayMinor:null
  },owner.token);
  assert.equal(role.status,201,JSON.stringify(role.body));
  assert.equal(role.body?.data?.locked,false);
  const suffix=crypto.randomBytes(4).toString('hex');
  const identifier='p2e-staff-'+label+'-'+suffix+'@isolated.invalid';
  const password='P2eOnlyStaffPass!123';
  const user=await api('/api/v1/users',{
    displayName:'P2E '+label,username:'p2e'+label+suffix,
    identifier,roleId:role.body.data.id,confirmPassword:owner.password
  },owner.token);
  assert.equal(user.status,201,JSON.stringify(user.body));
  assert.equal(user.body?.data?.hasPassword,false);
  const otp=await api('/api/v1/auth/password/otp',{identifier});
  assert.equal(otp.status,200);
  assert.match(otp.body?.data?.devCode,/^\d{6}$/);
  const reset=await api('/api/v1/auth/password/reset',{
    identifier,otpCode:otp.body.data.devCode,password
  });
  assert.equal(reset.status,204,'staff must choose password through verified OTP');
  const login=await api('/api/v1/auth/login',{identifier,password});
  assert.equal(login.status,200,JSON.stringify(login.body));
  const token=login.body?.data?.accessToken;
  const me=await api('/api/v1/me',undefined,token,'GET');
  assert.equal(me.status,200);
  assert.equal(me.body?.data?.tenantId,owner.tenantId);
  assert.equal(me.body?.data?.user?.id,user.body.data.id);
  return {identifier,password,token,tenantId:owner.tenantId};
}
async function run() {
  guard(); // Before ANY test fixture write or browser setup.
  assert.equal((await fetch(apiBase+'/api/v1/me')).status,401);
  const owner=await createTenant('a');
  const another=await createTenant('b');
  assert.notEqual(owner.tenantId,another.tenantId);
  await enableBank(owner);
  const cash=await account(owner,'P2E Cash Only','CASH',120000);
  const bank=await account(owner,'P2E Bank Private','BANK',350000);
  const loan=await account(owner,'P2E Lender Liability','LOAN',90000);
  const foreign=await account(another,'P2E Tenant B','CASH',7000);
  assert.equal((await api('/api/v1/money/accounts/'+foreign+'/statement',
    undefined,owner.token,'GET')).status,404,'real cross-tenant 404');

  const cashStaff=await staff(owner,'cash',['cash.account.view']);
  const noView=await staff(owner,'none',[]);
  const limited=await api('/api/v1/money/accounts',undefined,cashStaff.token,'GET');
  assert.equal(limited.status,200,JSON.stringify(limited.body));
  assert.deepEqual(limited.body.accounts.map(x=>x.id),[cash]);
  assert.deepEqual([limited.body.totalBankMinor,limited.body.totalMfsMinor,
    limited.body.totalLoanMinor],[0,0,0]);
  assert.equal(JSON.stringify(limited.body).includes('P2E Bank Private'),false);
  assert.equal(JSON.stringify(limited.body).includes('P2E Lender Liability'),false);
  assert.equal((await api('/api/v1/money/accounts/'+bank+'/statement',
    undefined,cashStaff.token,'GET')).status,403);
  assert.equal((await api('/api/v1/money/accounts/'+loan+'/statement',
    undefined,cashStaff.token,'GET')).status,403);
  assert.equal((await api('/api/v1/money/accounts',undefined,noView.token,'GET')).status,403);
  console.log('REAL_STAFF_ROLES_403_AND_TENANT_404_PASS');

  // Legitimate source posting creates a genuine lender DEBIT-positive overpayment.
  // Only test fixture setup posts a movement; connected browser never posts money.
  const operationId=ulid();
  const repayment=await api('/api/v1/money/movements',{
    kind:'LOAN_REPAYMENT',
    fromAccountCode:'BANK:'+bank,toAccountCode:'LOAN:'+loan,
    amountMinor:105000,businessDate:asDate(),
    reference:null,note:'P2-E disposable overpayment fixture',operationId
  },owner.token);
  assert.equal(repayment.status,201,JSON.stringify(repayment.body));
  const ownerAccounts=await api('/api/v1/money/accounts',undefined,owner.token,'GET');
  assert.equal(ownerAccounts.status,200);
  const lender=ownerAccounts.body.accounts.find(x=>x.id===loan);
  assert.equal(lender?.balanceMinor,15000,'loan journal is debit positive after overpayment');
  assert.equal(ownerAccounts.body.totalLoanMinor,-15000,
    'lender payable summary must be negative, never absolute');
  const ledger=await api('/api/v1/money/accounts/'+loan+'/statement',
    undefined,owner.token,'GET');
  assert.equal(ledger.status,200);
  assert.ok(ledger.body.rows.some(r=>r.debitMinor===105000&&
    r.sourceType!=='ACCOUNT_OPENING'),'overpaid repayment must be a genuine source journal');
  console.log('REAL_LOAN_OVERPAYMENT_SIGN_AND_JOURNAL_PASS');

  const {createServer}=await import('vite');
  const vite=await createServer({
    logLevel:'error',server:{
      host:'127.0.0.1',port:5197,strictPort:true,hmr:false,
      proxy:{'/api/v1':{target:apiBase,changeOrigin:false}}
    }
  });
  await vite.listen();
  let browser;
  const writes=[],pageErrors=[],getMethods=[];
  const screenshot=async(page,name)=>{
    if(!process.env.MOD006_P2E_SCREEN_DIR)return;
    fs.mkdirSync(process.env.MOD006_P2E_SCREEN_DIR,{recursive:true});
    await page.screenshot({path:process.env.MOD006_P2E_SCREEN_DIR+'/'+name+'.png',fullPage:true});
  };
  try {
    browser=await chromium.launch({
      executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,
      headless:true,args:['--no-sandbox']
    });
    const page=await browser.newPage({
      viewport:{width:320,height:900},hasTouch:true,reducedMotion:'reduce'
    });
    page.setDefaultTimeout(15000);
    page.on('pageerror',error=>pageErrors.push(error.message));
    page.on('request',request=>{
      const path=new URL(request.url()).pathname;
      if(!path.startsWith('/api/v1/'))return;
      if(path.startsWith('/api/v1/money')){
        getMethods.push(request.method()+' '+path);
        if(request.method()!=='GET')writes.push(request.method()+' '+path);
      }
    });
    await page.route('**'+routePath,route=>route.fulfill({
      contentType:'text/html',
      body:'<!doctype html><html><head><meta charset="UTF-8"></head><body>'+
        '<div id="root"></div>'+
        '<script type="module">import RefreshRuntime from "/@react-refresh";'+
        'RefreshRuntime.injectIntoGlobalHook(window);window.$RefreshReg$=()=>{};'+
        'window.$RefreshSig$=()=>(type)=>type;'+
        'window.__vite_plugin_react_preamble_installed__=true;</script>'+
        '<script type="module" src="/tests/mod006MoneyAccountsLiveHarness.tsx"></script>'+
        '</body></html>'
    }));
    await page.goto('http://127.0.0.1:5197'+routePath,{
      waitUntil:'commit',timeout:45000});
    await page.locator('#p2c-auth').waitFor({timeout:90000});
    const cards=page.locator('[data-connected-money-account]');
    const login=async actor=>{
      await page.locator('#p2c-identifier').fill(actor.identifier);
      await page.locator('#p2c-password').fill(actor.password);
      await page.locator('#p2c-login').click();
      await page.waitForFunction(tenant=>
        document.querySelector('#p2c-auth')?.getAttribute('data-tenant')===tenant,
        actor.tenantId);
    };
    assert.equal(await cards.count(),0);
    await login(cashStaff);
    const cashCard=page.locator('[data-connected-money-account="'+cash+'"]');
    await cashCard.waitFor();
    assert.equal(await cards.count(),1);
    assert.equal(await page.getByText('P2E Bank Private').count(),0);
    assert.equal(await page.getByText('P2E Lender Liability').count(),0);
    assert.equal(await page.locator('[data-connected-money-liabilities]').count(),0);
    await screenshot(page,'p2e-320-real-cash-only-staff');
    console.log('REAL_STAFF_REACT_CASH_ONLY_PASS');

    await login(noView);
    await page.getByRole('alert').waitFor();
    assert.match(await page.getByRole('alert').innerText(),
      /Account-list permission is required/);
    assert.equal(await cards.count(),0);
    assert.equal(await page.locator('[data-connected-money-summary]').count(),0);
    console.log('REAL_STAFF_REACT_PERMISSION_DENIED_PASS');

    await login(owner);
    const lenderCard=page.locator('[data-connected-money-account="'+loan+'"]');
    await lenderCard.waitFor();
    assert.ok((await lenderCard.innerText()).includes('overpaid'));
    const renderedLoan=await lenderCard.innerText();
    assert.ok(renderedLoan.includes('−৳150'),
      'signed negative payable must use real Money Accounts formatter (Unicode minus)');
    const ledgerButton=lenderCard.getByRole('button',{name:/View ledger for/});
    await ledgerButton.focus();
    await page.keyboard.press('Enter');
    const dialog=page.getByRole('dialog');
    await dialog.waitFor();
    await dialog.getByRole('button',{name:'Print',exact:true}).waitFor();
    await page.keyboard.press('Escape');
    await dialog.waitFor({state:'detached'});
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),
      await ledgerButton.getAttribute('aria-label'));
    await screenshot(page,'p2e-320-signed-loan-overpayment');
    console.log('REAL_LOAN_OVERPAYMENT_REACT_AND_KEYBOARD_PASS');

    // Real authenticated backend GET is fetched; its true response is then
    // held by test transport > 12 seconds. No synthetic success envelope.
    let release,held=false,fetchStatus=null;
    const accountPath='/api/v1/money/accounts';
    await page.route('**/api/v1/money/accounts*',async route=>{
      if(new URL(route.request().url()).pathname!==accountPath){
        return route.continue();
      }
      const response=await route.fetch();
      fetchStatus=response.status();
      held=true;
      await new Promise(resolve=>{release=resolve});
      await route.fulfill({response}).catch(()=>{ /* client timed out first */ });
    },{times:1});
    const started=Date.now();
    await page.getByRole('button',{name:'Refresh',exact:true}).click();
    for(let i=0;i<200&&!held;i++)await sleep(25);
    assert.equal(held,true,'real server money GET should be fetched and held');
    assert.equal(fetchStatus,200,'held response must be a real Nest 200');
    await page.getByRole('alert').waitFor({timeout:18000});
    const elapsed=Date.now()-started;
    assert.ok(elapsed>=11000&&elapsed<=22000,
      'verified real transport client timeout must follow ~12s adapter deadline, actual '+elapsed);
    assert.equal(await cards.count(),0,'old balances must vanish after deadline');
    assert.equal(await dialog.count(),0,'old ledger print must not survive timeout');
    release();
    await page.getByRole('button',{name:'Refresh',exact:true}).click();
    await lenderCard.waitFor();
    assert.equal(await cards.count(),3);
    console.log('REAL_BACKEND_RESPONSE_HELD_12S_CLIENT_TIMEOUT_PASS',elapsed);

    for(const width of [320,390]){
      await page.setViewportSize({width,height:900});
      for(const theme of ['light','dark']){
        await page.evaluate(t=>document.documentElement.classList.toggle('dark',t==='dark'),theme);
        const {doc,view}=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,view:innerWidth}));
        assert.ok(doc<=view+1,'no finance overflow at '+width+' '+theme+' '+doc+'/'+view);
      }
    }
    assert.deepEqual(pageErrors,[],'no uncaught React page errors');
    assert.deepEqual(writes,[],'browser must not post money transactions');
    assert.ok(getMethods.some(x=>x==='GET /api/v1/money/accounts'));
    const persisted=await page.evaluate(()=>JSON.stringify([
      Object.entries(localStorage),Object.entries(sessionStorage)]));
    for(const actor of [owner,another,cashStaff,noView])assert.ok(!persisted.includes(actor.token),
      'no bearer may be persisted in browser storage');
    console.log('MOD006_P2E_REAL_ROLE_TIMEOUT_BROWSER_PASS',JSON.stringify({
      genuineRoles:2,crossTenant404:true,lenderOverpaymentMinor:-15000,
      deadlineMs:elapsed,responsiveCombinations:4,financialBrowserWrites:writes.length
    }));
  } finally {
    await browser?.close();
    await vite.close();
  }
}
run().catch(error=>{console.error(error);process.exitCode=1});
