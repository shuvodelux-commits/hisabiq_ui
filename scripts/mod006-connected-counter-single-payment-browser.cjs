/* MOD-006 T02-H2 — real signed REVIEW→RECORD React→Nest→disposable PG16.
 * NEVER use against retained/production DB. Signed synthetic financial acceptance;
 * only Nest posts financial journals. Connected App route remains gated.
 */
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { chromium } = require('playwright');
const API = 'http://127.0.0.1:56131';
const DB = 'hisabiq_mod006_h3a_pending_20261117';
const CONTAINER = 'hisabiq-mod006-h3a-pending-pg-20261117';
const ACK = 'MOD006_H3A_PENDING_DISPOSABLE_20261117';
const letters = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const id = () => '0' + [...crypto.randomBytes(25)].map(x => letters[x % 32]).join('');
const isId = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
function fail(message) { throw Error('H2 FINANCIAL TEST SAFETY: ' + message); }
function guard() {
  if (process.env.MOD006_H3A_ACK !== ACK ||
      process.env.MOD006_H3A_ORIGIN !== API ||
      process.env.MOD006_H3A_DB !== DB ||
      process.env.MOD006_H3A_CONTAINER !== CONTAINER) {
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
  const mfs=ok(await api('/api/v1/money/accounts','POST',{
    name:'H2 '+label+' MFS',type:'MFS',
    holderName:null,reference:null,isDrawer:false,
    openingAmountMinor:20000,openingDate:'2026-01-01',operationId:id(),
  },token),201,'MFS account').data.id;
  assert.match(mfs,isId);
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
  const catalog=ok(await api('/api/v1/catalog','GET',undefined,token),200,'catalog');
  const piece=catalog.data.units.find(unit=>unit.name==='Piece');
  assert.ok(piece && isId.test(piece.id),'reused Piece source unit');
  const product=ok(await api('/api/v1/products','POST',{
    name:'H2 synthetic payable item',baseUnitId:piece.id,
    purchasePriceMinor:10000,sellingPriceMinor:12000,minStockQty:0,
    brandId:null,categoryId:null,sku:null,barcode:null,
    description:null,defaultDiscountType:null,defaultDiscountValue:null,
    offerEnabled:false,offerPriceMinor:null,offerStartDate:null,offerEndDate:null,
    tracksExpiry:false,tracksSerial:false,conversionUnitId:null,conversionFactorQty:null,
  },token),201,'product');
  ok(await api('/api/v1/purchases','POST',{
    supplierPartyId:supplier,
    lines:[{productId:product.data.id,qty:10000,unitPriceMinor:10000}],
    discountMinor:0,paidMinor:0,paidAccountCode:null,
  },token),201,'unpaid 100000 minor purchase');
  const day=ok(await api('/api/v1/money/day','GET',undefined,token),200,'day '+mode);
  assert.equal(day.enabled,mode==='ON');assert.equal(day.todaySession,null);
  const accounts=ok(await api('/api/v1/money/accounts','GET',undefined,token),
    200,'source accounts');
  assert.equal(accounts.accounts.find(a=>a.id===cash)?.balanceMinor,50000);
  assert.equal(accounts.accounts.find(a=>a.id===bank)?.balanceMinor,30000);
  return {identifier,password,token,tenant:me.data.tenantId,customer,supplier,cash,bank,mfs,day};
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
      ].includes(pathname))paymentPosts.push({path:pathname,method:r.method(),key:r.headers()['idempotency-key']});
    });
    await page.route('**/__mod006_h2_real_counter_payment_only',route=>route.fulfill({
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
    await page.goto(origin+'/__mod006_h2_real_counter_payment_only');
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
      await page.locator('[data-counter-cash-status="NOT_STARTED"],[data-counter-cash-status="OFF"],[data-counter-cash-status="OPEN"]').waitFor();
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
    assert.equal(await page.locator('[data-h2-review]').isDisabled(),true,'ON unopened drawer cannot review a CASH payment');
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
    console.log('H2_ON_UNOPENED_READ_ROLE_KEYBOARD_320_PASS');
    const started=ok(await api('/api/v1/money/day/start','POST',{
      businessDate:a.day.businessDate,openingAmountMinor:50000,
      counterpartAccountCode:null,note:null,operationId:id(),
    },a.token),201,'real ON Cash Day start').data.id;
    assert.match(started,isId);
    await page.getByRole('button',{name:/Refresh|রিফ্রেশ/}).click();
    await page.locator('[data-counter-cash-status="OPEN"]').waitFor();
    console.log('H2_ON_REAL_DAY_START_REFRESH_PASS');

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
    assert.deepEqual(paymentPosts,[],'read and selection must not POST money');
    const baseline=queryPg('SELECT (SELECT count(*) FROM customer_receipts),'+
      '(SELECT count(*) FROM supplier_payments),'+
      '(SELECT count(*) FROM journal_entries)');
    assert.equal(baseline,before,'review-only actions cannot change journals');
    async function choose(role,partyId,accountId) {
      const buttons=page.locator('[role="group"][aria-label="Connected Counter actions"] button');
      await buttons.nth(role==='CUSTOMER'?0:1).click();
      await page.locator('[data-counter-party="'+partyId+'"]').waitFor();
      await page.locator('[data-counter-party="'+partyId+'"]').click();
      await page.locator('#connected-counter-account').selectOption(accountId);
      await page.locator('[data-connected-single-payment]').waitFor();
    }
    const financial=()=>paymentPosts.filter(p=>[
      '/api/v1/customer-payments','/api/v1/suppliers/payments',
    ].includes(p.path));
    async function postReviewed(amount, expectedRoute) {
      const count=financial().length;
      await page.locator('[data-h2-amount]').fill(amount);
      await page.locator('[data-h2-review]').click();
      await page.locator('[data-h2-confirm]').waitFor();
      assert.equal(financial().length,count,'review cannot POST');
      assert.equal(await page.evaluate(() =>
        Object.keys(localStorage).filter(k =>
          k.startsWith('hisabiq.connected.counter.pending.v1.')).length),0,
        'Review alone must not reserve payment write-ahead marker');
      const responseWait=page.waitForResponse(r=>
        new URL(r.url()).pathname===expectedRoute && r.request().method()==='POST');
      await page.locator('[data-h2-confirm]').click();
      const response=await responseWait;
      assert.equal(response.status(),201,'real Nest source HTTP201');
      const result=await response.json();
      assert.match(result.data.id,isId);
      await page.locator('[data-h2-posted-result]').filter({hasText:result.data.number}).waitFor();
      assert.equal(financial().length,count+1,'one user confirmation sends one payment');
      assert.match(financial().at(-1).key,isId,'cryptographic operation key');
      assert.equal(await page.locator('[data-h2-confirm]').count(),0,'confirm cannot double-submit');
      assert.equal(await page.evaluate(() =>
        Object.keys(localStorage).filter(k =>
          k.startsWith('hisabiq.connected.counter.pending.v1.')).length),0,
        'confirmed source/reread must clear only original pending marker');
      return result.data.id;
    }
    const bankB=await postReviewed('23.50','/api/v1/customer-payments');
    assert.equal(queryPg("SELECT coalesce(session_id::text,'NULL') FROM customer_receipts WHERE id='"+bankB+"' AND tenant_id='"+b.tenant+"'"),'NULL');
    assert.equal(ok(await api('/api/v1/money/accounts','GET',undefined,b.token),200,'post source balance').accounts.find(a=>a.id===b.bank)?.balanceMinor,32350);
    console.log('H2_BANK_RECEIPT_SOURCE_JOURNAL_PASS');
    await choose('CUSTOMER',b.customer,b.mfs);
    const mfsB=await postReviewed('5.00','/api/v1/customer-payments');
    assert.equal(queryPg("SELECT coalesce(session_id::text,'NULL') FROM customer_receipts WHERE id='"+mfsB+"' AND tenant_id='"+b.tenant+"'"),'NULL');
    console.log('H2_MFS_RECEIPT_SIGNED_PASS');
    await choose('CUSTOMER',b.customer,b.cash);
    const cashB=await postReviewed('12.50','/api/v1/customer-payments');
    assert.equal(queryPg("SELECT coalesce(session_id::text,'NULL') FROM customer_receipts WHERE id='"+cashB+"' AND tenant_id='"+b.tenant+"'"),'NULL');
    assert.equal(ok(await api('/api/v1/money/accounts','GET',undefined,b.token),200,'post source balance').accounts.find(a=>a.id===b.cash)?.balanceMinor,51250);
    console.log('H2_CASH_OFF_RECEIPT_NULL_SESSION_PASS');

    await page.locator('#h1-logout').click();
    await page.locator('#h1-session[data-status="signed-out"]').waitFor();
    await signIn(a);
    await page.locator('[data-counter-cash-status="OPEN"]').waitFor();
    await choose('SUPPLIER',a.supplier,a.cash);
    const supplierA=await postReviewed('200.00','/api/v1/suppliers/payments');
    assert.equal(queryPg("SELECT coalesce(session_id::text,'NULL') FROM supplier_payments WHERE id='"+supplierA+"' AND tenant_id='"+a.tenant+"'"),started);
    assert.equal(ok(await api('/api/v1/money/accounts','GET',undefined,a.token),200,'post source balance').accounts.find(account=>account.id===a.cash)?.balanceMinor,30000);
    console.log('H2_CASH_ON_SUPPLIER_LINKED_SESSION_PASS');
    await choose('CUSTOMER',a.customer,a.cash);
    const customerA=await postReviewed('20.00','/api/v1/customer-payments');
    assert.equal(queryPg("SELECT coalesce(session_id::text,'NULL') FROM customer_receipts WHERE id='"+customerA+"' AND tenant_id='"+a.tenant+"'"),started);
    console.log('H2_CASH_ON_CUSTOMER_LINKED_SESSION_PASS');

    await choose('SUPPLIER',a.supplier,a.cash);
    await page.locator('[data-h2-amount]').fill('400.00');
    await page.locator('[data-h2-review]').click();
    const negativeBefore=financial().length;
    const rejectedWait=page.waitForResponse(r=>
      new URL(r.url()).pathname==='/api/v1/suppliers/payments' && r.request().method()==='POST');
    await page.locator('[data-h2-confirm]').click();
    const rejectedResponse=await rejectedWait;
    assert.equal(rejectedResponse.status(),400,'source must reject insufficient CASH drawer');
    await page.locator('[data-h2-state="rejected"]').waitFor();
    assert.equal(await page.evaluate(() =>
      Object.keys(localStorage).filter(k =>
        k.startsWith('hisabiq.connected.counter.pending.v1.')).length),0,
      'definite insufficient-cash HTTP400 clears rejected write-ahead operation');
    assert.equal(financial().length,negativeBefore+1);
    assert.equal(ok(await api('/api/v1/money/accounts','GET',undefined,a.token),200,'post source balance').accounts.find(account=>account.id===a.cash)?.balanceMinor,32000);
    console.log('H2_CASH_SHORTAGE_ROLLBACK_PASS');

    // Simulate the first GET after a real source commit being lost: no auto retry,
    // and a new selection must remain blocked by the parent per-session lock.
    await choose('CUSTOMER',a.customer,a.bank);
    const preUnknown=financial().length;
    let intercepted=0;
    await page.route('**/api/v1/money/accounts',route=>{
      if(financial().length>preUnknown && intercepted===0){
        intercepted++;return route.abort('failed');
      }
      return route.continue();
    });
    await page.locator('[data-h2-amount]').fill('1.00');
    await page.locator('[data-h2-review]').click();
    const lostResponseWait=page.waitForResponse(r=>
      new URL(r.url()).pathname==='/api/v1/customer-payments' && r.request().method()==='POST');
    await page.locator('[data-h2-confirm]').click();
    assert.equal((await lostResponseWait).status(),201,'money committed before readback loss');
    await page.locator('[data-h2-state="unknown"]').waitFor();
    await page.locator('[data-h2-global-lock]').waitFor();
    assert.equal(intercepted,1,'one post-commit money account GET deliberately dropped');
    await page.locator('#connected-counter-account').selectOption(a.cash);
    await page.locator('[data-connected-single-payment]').waitFor();
    assert.equal(await page.locator('[data-h2-review]').isDisabled(),true,'uncertain operation blocks new source writes');
    assert.equal(financial().length,preUnknown+1,'no automatic replay on unknown commit');
    await page.unroute('**/api/v1/money/accounts');
    console.log('H2_UNKNOWN_POST_COMMIT_NO_DUPLICATE_LOCK_PASS');

    // H3A durability: the actual POST committed in Nest/PG16, but the first
    // post-read was deliberately lost. Same-browser reload must NOT reset the
    // no-duplicate interlock. Browser storage contains no token or Party data.
    const originalId=await page.locator('[data-h3-pending-state="pending"]')
      .getAttribute('data-h3-original-operation');
    assert.match(originalId,isId,'persisted unresolved original ULID');
    const saved=await page.evaluate(() => {
      const keys=Object.keys(localStorage).filter(k=>
        k.startsWith('hisabiq.connected.counter.pending.v1.'));
      return keys.map(key=>JSON.parse(localStorage.getItem(key)));
    });
    assert.equal(saved.length,1,'one pending write-ahead marker');
    assert.equal(saved[0].operationId,originalId);
    assert.deepEqual(Object.keys(saved[0]).sort(),[
      'createdAt','kind','operationId','tenantId','userId','version',
    ]);
    assert.equal(saved[0].tenantId,a.tenant);
    assert.equal(saved[0].kind,'CUSTOMER_RECEIPT');
    const afterUnknown=financial().length;
    await page.reload();
    try {
      await page.locator('#h1-session[data-status="authenticated"]').waitFor({timeout:10000});
    } catch {
      await signIn(a);
    }
    await page.locator('[data-h3-pending-state="pending"]').waitFor();
    assert.equal(await page.locator('[data-h3-original-operation]')
      .getAttribute('data-h3-original-operation'),originalId);
    await choose('CUSTOMER',a.customer,a.bank);
    assert.equal(await page.locator('[data-h2-review]').isDisabled(),true,
      'same tenant/user must not re-post after reload');
    assert.equal(financial().length,afterUnknown,'reload must cause zero auto replays');
    console.log('H3A_RELOAD_RESTORES_UNCERTAIN_ORIGINAL_OPERATION_NO_POST_PASS');

    await page.locator('#h1-logout').click();
    await page.locator('#h1-session[data-status="signed-out"]').waitFor();
    await signIn(b);
    await choose('CUSTOMER',b.customer,b.bank);
    assert.equal(await page.locator('[data-h2-global-lock]').count(),0,
      'other tenant never inherits original user pending operation');
    assert.equal(await page.locator('[data-h2-review]').isEnabled(),true,
      'other tenant remains independently reviewable');
    await page.locator('#h1-logout').click();
    await page.locator('#h1-session[data-status="signed-out"]').waitFor();
    await signIn(a);
    await page.locator('[data-h3-pending-state="pending"]').waitFor();
    assert.equal(await page.locator('[data-h3-original-operation]')
      .getAttribute('data-h3-original-operation'),originalId);
    await choose('CUSTOMER',a.customer,a.cash);
    assert.equal(await page.locator('[data-h2-review]').isDisabled(),true,
      'original tenant login still blocked until source verified');
    assert.equal(financial().length,afterUnknown,'tenant switches cannot replay');
    console.log('H3A_OTHER_TENANT_ISOLATED_ORIGINAL_TENANT_LOCK_PERSISTED_PASS');

    assert.deepEqual(errors,[],'React browser must not throw');
    assert.equal(queryPg('SELECT coalesce(sum(amount_minor),0) FROM journal_lines'),'0',
      'journal lines remain double-entry balanced');
    const after=queryPg('SELECT (SELECT count(*) FROM customer_receipts),'+
      '(SELECT count(*) FROM supplier_payments),'+
      '(SELECT count(*) FROM journal_entries)');
    const start=before.split('|').map(Number),done=after.split('|').map(Number);
    assert.equal(done[0]-start[0],5,'five customer receipts');
    assert.equal(done[1]-start[1],1,'one supplier payment');
    assert.equal(done[2]-start[2],6,'six unique source journals, no duplicate');
    assert.equal(new Set(financial().map(p=>p.key)).size,financial().length,
      'each reviewed operation has unique source key; no automatic duplicate');
    console.log('H2_REAL_SIGNED_TWO_TENANT_BANK_MFS_CASH_JOURNAL_IDEMPOTENCY_PASS');
  } finally {
    await browser?.close();
    await vite.close();
  }
}
run().catch(error=>{console.error(error);process.exitCode=1;});
