/**
 * Genuine mounted React → localhost Nest → disposable PG16 cash lifecycle QA.
 * No /api/v1 response mocking; the only valid target is M5-03's fresh DB.
 * This script intentionally mutates the disposable tenant A; tenant B is
 * preserved untouched for the owner's subsequent manual testing.
 */
const { chromium } = require('playwright');
const { readFileSync } = require('node:fs');
const assert = require('node:assert/strict');
const fixturePath = process.env.MOD005_PRIVATE_CREDENTIAL_FILE;
if (process.env.MOD005_LIFECYCLE_CONFIRM !== 'hisabiq_mod005_lifecycle_425' ||
    !fixturePath ||
    !fixturePath.startsWith('/home/shoaib/Projects/.hisabiq-mod005-lifecycle-425/') ||
    process.env.MOD005_LIFECYCLE_API_URL !== 'http://127.0.0.1:3071') {
  throw new Error('Refusing financial actions without isolated test-only database confirmation');
}
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'));
assert.equal(fixture.database, 'hisabiq_mod005_lifecycle_425');
assert.notEqual(fixture.tenants.A.tenantId, fixture.tenants.B.tenantId);
const apiBase=process.env.MOD005_LIFECYCLE_API_URL;
const url='http://127.0.0.1:5189/__mod005_lifecycle';
const errors=[], requests=[], startBodies=[];
async function fetchJson(path, method, body, token) {
  const response=await fetch(apiBase+path,{
    method,redirect:'error',
    headers:{
      Accept:'application/json',
      ...(body===undefined?{}:{'Content-Type':'application/json'}),
      ...(token?{Authorization:'Bearer '+token}:{})
    },
    ...(body===undefined?{}:{body:JSON.stringify(body)})
  });
  const data=await response.json().catch(()=>null);
  return {status:response.status,body:data?.data??data,raw:data};
}
async function action(page,button,label) {
  await page.locator('#'+button).click();
  await page.waitForFunction(name=>{
    const result=document.querySelector('#outcome')?.textContent??'';
    return result.startsWith('PASS: '+name+' #')||result.startsWith('FAIL: '+name+' —');
  },label,{timeout:45000});
  const status=(await page.locator('#outcome').textContent())??'';
  assert.ok(status.startsWith('PASS: '+label+' #'),status);
}
async function waitCash(page,open,tenantId) {
  await page.waitForFunction(expected=>{
    const cash=document.querySelector('#cash');
    const auth=document.querySelector('#auth');
    return cash?.getAttribute('data-mode')==='connected' &&
      cash?.getAttribute('data-open')===expected.open &&
      auth?.getAttribute('data-tenant')===expected.tenant;
  },{open:String(open),tenant:tenantId},{timeout:45000});
}
async function run() {
  const health=await fetchJson('/health','GET');
  assert.equal(health.status,200);
  const browser=await chromium.launch({
    headless:true,executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,
    args:['--no-sandbox']
  });
  try {
    const page=await browser.newPage({viewport:{width:1280,height:900}});
    page.setDefaultTimeout(45000);
    page.on('pageerror',error=>errors.push(error.message));
    page.on('request',req=>{
      const path=new URL(req.url()).pathname;
      if(path.startsWith('/api/v1/')){
        requests.push(req.method()+' '+path);
        if(req.method()==='POST'&&path==='/api/v1/money/day/start') {
          startBodies.push(req.postDataJSON());
        }
      }
    });
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
    await page.locator('#login').waitFor({timeout:90000});
    const a=fixture.tenants.A;
    await page.locator('#identifier').fill(a.identifier);
    await page.locator('#password').fill(a.password);
    await action(page,'login','Sign in');
    await waitCash(page,false,a.tenantId);
    assert.equal(await page.locator('#cash').getAttribute('data-enabled'),'true');
    const day0=await fetchJson('/api/v1/auth/login','POST',{
      identifier:a.identifier,password:a.password
    });
    assert.equal(day0.status,200);
    const token=day0.body.accessToken;
    const opening=await fetchJson('/api/v1/money/day','GET',undefined,token);
    assert.equal(opening.status,200);
    assert.equal(opening.body.drawerBalanceMinor,a.openingMinor);
    assert.equal(opening.body.todaySession,null);
    await action(page,'start','Start cash day');
    await waitCash(page,true,a.tenantId);
    assert.equal(startBodies.length,1);
    assert.match(startBodies[0].operationId,/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
    const opened=await fetchJson('/api/v1/money/day','GET',undefined,token);
    assert.equal(opened.status,200);
    assert.equal(opened.body.todaySession.status,'OPEN');
    assert.equal(opened.body.todaySession.openingAmountMinor,a.openingMinor);
    const originalSessionId=opened.body.todaySession.id;
    const duplicate=await fetchJson('/api/v1/money/day/start','POST',startBodies[0],token);
    assert.ok([200,201].includes(duplicate.status),'idempotent replay HTTP '+duplicate.status+
      ' code='+(duplicate.raw?.error?.code??'none'));
    assert.equal(duplicate.body.id,originalSessionId,'duplicate start must reuse same session');
    console.log('PASS real React Start + same-operationId server replay, no duplicate session ID');
    await page.locator('#counted').fill('950.00');
    await page.locator('#note').fill('Disposable QA shortage 50 BDT');
    await action(page,'close','Count and close cash day');
    await waitCash(page,false,a.tenantId);
    const closed=await fetchJson('/api/v1/money/day','GET',undefined,token);
    assert.equal(closed.status,200);
    assert.equal(closed.body.todaySession.status,'CLOSED');
    assert.equal(closed.body.todaySession.id,originalSessionId);
    assert.equal(closed.body.todaySession.closes?.[0]?.countedClosingMinor,95000);
    assert.equal(closed.body.todaySession.closes?.[0]?.differenceMinor,-5000);
    assert.equal(closed.body.todaySession.closes?.[0]?.status,'ACTIVE');
    console.log('PASS counted Close: expected BDT 1000, actual 950, shortage BDT 50');
    await page.locator('#reopen').waitFor({state:'visible'});
    await action(page,'reopen','Reopen cash day');
    await waitCash(page,true,a.tenantId);
    const reopened=await fetchJson('/api/v1/money/day','GET',undefined,token);
    assert.equal(reopened.status,200);
    assert.equal(reopened.body.todaySession.status,'OPEN');
    assert.equal(reopened.body.todaySession.id,originalSessionId);
    console.log('PASS actual Reopen with genuine Nest audit state');

    // Tenant B did not inherit tenant A's server-side day.
    const b=fixture.tenants.B;
    await action(page,'logout','Log out');
    await page.locator('#identifier').fill(b.identifier);
    await page.locator('#password').fill(b.password);
    await action(page,'login','Sign in');
    await waitCash(page,false,b.tenantId);
    const bLogin=await fetchJson('/api/v1/auth/login','POST',{
      identifier:b.identifier,password:b.password
    });
    assert.equal(bLogin.status,200);
    const bDay=await fetchJson('/api/v1/money/day','GET',undefined,bLogin.body.accessToken);
    assert.equal(bDay.status,200);
    assert.equal(bDay.body.todaySession,null);
    assert.equal(bDay.body.drawerBalanceMinor,b.openingMinor);
    assert.deepEqual(errors,[]);
    assert.ok(requests.some(s=>s==='POST /api/v1/money/day/start'));
    assert.ok(requests.some(s=>/^POST \/api\/v1\/money\/day\/.*\/close$/.test(s)));
    assert.ok(requests.some(s=>/^POST \/api\/v1\/money\/day\/.*\/reopen$/.test(s)));
    console.log('PASS tenant B has its own unopened day, no tenant A cash state');
    console.log('PASS total browser API requests='+requests.length);
  } finally { await browser.close(); }
}
run().catch(err=>{
  console.error('MOD005_LIFECYCLE_QA_RED:',err?.message??String(err));
  process.exitCode=1;
});
