/**
 * MOD-005 M5-04: genuine restricted cashier, read-only role, live Nest 403s.
 * May ONLY run against the isolated disposable M5-03 test DB, not retained demo.
 * Creates one real role and one real member in existing test tenant A.
 * It does NOT post financial transactions.
 */
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { openSync, closeSync, readFileSync, writeFileSync } = require('node:fs');
const { chromium } = require('playwright');

const privateRoot = '/home/shoaib/Projects/.hisabiq-mod005-lifecycle-425/';
const file = privateRoot + 'test-credentials.private.json';
const out = privateRoot + 'cashier-denial.private.json';
const base = process.env.MOD005_CASHIER_API_URL;
if (process.env.MOD005_CASHIER_CONFIRM !== 'hisabiq_mod005_lifecycle_425' ||
    base !== 'http://127.0.0.1:3071') {
  throw new Error('Cashier verification requires exact disposable DB and localhost API');
}
const source = JSON.parse(readFileSync(file, 'utf8'));
assert.equal(source.database, 'hisabiq_mod005_lifecycle_425');
assert.notEqual(source.tenants.A.tenantId, source.tenants.B.tenantId);
const a = source.tenants.A;
const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function operationId() {
  let n = Date.now(), value = '';
  for (let i = 0; i < 10; i++) { value = alphabet[n % 32] + value; n = Math.floor(n / 32); }
  return value + Array.from(randomBytes(16), x => alphabet[x & 31]).join('');
}
async function api(path, method = 'GET', body, token) {
  const response = await fetch(base + path, {
    method,
    redirect: 'error',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const json = await response.json().catch(() => null);
  return { status: response.status, data: json?.data ?? json, raw: json };
}
function success(result, code, where) {
  assert.equal(result.status, code, where + ': HTTP ' + result.status +
    ', error=' + String(result.raw?.error?.code ?? 'none'));
  return result.data;
}
async function run() {
  const health = await fetch(base + '/health', { redirect: 'error' });
  assert.equal(health.status, 200);
  const ownerLogin = success(await api('/api/v1/auth/login','POST',
    { identifier: a.identifier, password: a.password }), 200, 'Owner login');
  const ownerToken = ownerLogin.accessToken;
  const ownerMe = success(await api('/api/v1/me','GET',undefined,ownerToken),200,'Owner me');
  assert.equal(ownerMe.tenantId,a.tenantId);
  const original = success(await api('/api/v1/money/day','GET',undefined,ownerToken),200,'Owner day');
  assert.equal(original.todaySession?.status,'OPEN',
    'M5-03 tenant A must have its own open session; do not target manual tenant B');
  assert.equal(original.todaySession?.openingAmountMinor,100000);
  const originalId = original.todaySession.id;
  const originalVersion = original.todaySession.version;

  // Reserve local evidence BEFORE making any non-financial setup POST.
  const fd = openSync(out,'wx',0o600); closeSync(fd);
  try {
    const role = success(await api('/api/v1/roles','POST',{
      name:'MOD005 Read-only QA Cashier V2',
      permissions:['cash.daily.view'],
      cashRefundPerReturnMinor:null,
      cashRefundPerDayMinor:null,
      confirmPassword:a.password
    },ownerToken),201,'Create read-only role');
    assert.deepEqual(role.permissions,['cash.daily.view']);
    assert.equal(role.isSystem,false);
    const hex = randomBytes(5).toString('hex');
    const identifier = 'mod005-readonly-'+hex+'@example.test';
    const password = 'CashTest_'+randomBytes(10).toString('hex')+'Aa9!';
    const user = success(await api('/api/v1/users','POST',{
      displayName:'MOD005 restricted cashier',
      username:'cashqa'+hex,
      identifier,roleId:role.id,confirmPassword:a.password
    },ownerToken),201,'Create restricted cashier');
    assert.equal(user.hasPassword,false);
    const otp = success(await api('/api/v1/auth/password/otp','POST',{identifier}),200,'Password OTP');
    assert.match(otp.devCode,/^\d{6}$/);
    success(await api('/api/v1/auth/password/reset','POST',{
      identifier,otpCode:otp.devCode,password
    }),204,'Cashier sets own password');
    const cashierLogin = success(await api('/api/v1/auth/login','POST',
      {identifier,password}),200,'Cashier login');
    const token = cashierLogin.accessToken;
    const cashierMe = success(await api('/api/v1/me','GET',undefined,token),200,'Cashier me');
    assert.equal(cashierMe.tenantId,a.tenantId,'Cashier must belong only to owner A');
    assert.equal(cashierMe.user.id,user.id);
    const read = success(await api('/api/v1/money/day','GET',undefined,token),
      200,'Cashier day GET');
    assert.equal(read.todaySession.id,originalId);
    assert.equal(read.todaySession.version,originalVersion);
    console.log('PASS genuine cashier login, cash.day view and tenant A identity');

    // The caller has cash.daily.view only — mutation capability is absent.
    success(await api('/api/v1/money/day/start','POST',{
      businessDate:read.businessDate,
      openingAmountMinor:100000,
      counterpartAccountCode:null,note:null,operationId:operationId()
    },token),403,'Cashier Start denial');
    success(await api('/api/v1/money/day/'+originalId+'/close','POST',{
      countedClosingMinor:100000,reason:null,operationId:operationId()
    },token),403,'Cashier Close denial');
    const unchanged = success(await api('/api/v1/money/day','GET',undefined,ownerToken),
      200,'Owner confirms unchanged day');
    assert.equal(unchanged.todaySession.id,originalId);
    assert.equal(unchanged.todaySession.status,'OPEN');
    assert.equal(unchanged.todaySession.version,originalVersion);
    console.log('PASS two real HTTP 403 denies, same session version/id afterward');

    const browser = await chromium.launch({
      headless:true,
      executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      args:['--no-sandbox']
    });
    try {
      const page = await browser.newPage({viewport:{width:390,height:844}});
      const pageErrors = [], financialPosts=[];
      page.on('pageerror',err=>pageErrors.push(err.message));
      page.on('request',req=>{
        const path = new URL(req.url()).pathname;
        if (/^\/api\/v1\/money\/day/.test(path) && req.method()==='POST')
          financialPosts.push(req.method()+' '+path);
      });
      await page.goto('http://127.0.0.1:5189/__mod005_lifecycle',
        {waitUntil:'domcontentloaded',timeout:90000});
      await page.locator('#identifier').waitFor({timeout:90000});
      await page.locator('#identifier').fill(identifier);
      await page.locator('#password').fill(password);
      await page.locator('#login').click();
      await page.waitForFunction(tenant=>{
        return document.querySelector('#auth')?.getAttribute('data-tenant')===tenant &&
          document.querySelector('#cash')?.getAttribute('data-mode')==='connected';
      },a.tenantId,{timeout:45000});
      assert.equal(await page.locator('#cash').getAttribute('data-can-start'),'false');
      assert.equal(await page.locator('#cash').getAttribute('data-can-close'),'false');
      assert.equal(await page.locator('#cash').getAttribute('data-open'),'true');
      assert.equal(await page.locator('#start').isDisabled(),true);
      assert.equal(await page.locator('#close').isDisabled(),true);
      assert.equal(await page.locator('#reopen').isDisabled(),true);
      assert.deepEqual(financialPosts,[]);
      assert.deepEqual(pageErrors,[]);
      console.log('PASS real mounted React disabled all unsafe cash mutation controls');
    } finally { await browser.close(); }

    writeFileSync(out,JSON.stringify({
      database:'hisabiq_mod005_lifecycle_425',tenantId:a.tenantId,
      identifier,password,roleId:role.id,userId:user.id,verified:true
    },null,2)+'\n',{mode:0o600});
    console.log('PASS M5-04 restricted cashier verified; private evidence saved');
  } catch(err) {
    writeFileSync(out,JSON.stringify({verified:false,message:'PARTIAL DISPOSABLE QA, DO NOT RETRY WITHOUT RESET'})+'\n');
    throw err;
  }
}
run().catch(err=>{console.error('M5-04 CASHIER QA RED:',err.message);process.exitCode=1});
