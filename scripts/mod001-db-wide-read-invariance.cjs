/* #574: CI-owned disposable PostgreSQL16 & real Nest/React security invariance. */
const assert = require('node:assert/strict');
const { randomBytes, randomInt, createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const app = process.cwd();
const root = process.env.MOD001_574_TEST_API_ORIGIN;
const apiRoot = root + '/api/v1';
const summary = [];
const uniquePhone = () => '017' + String(randomInt(0, 100000000)).padStart(8, '0');
const pass = () => randomBytes(18).toString('base64url') + '!aA19';

async function call(method, path, token, body, expected=200) {
  const response = await fetch(apiRoot + path, {
    method, headers: { ...(token ? {Authorization: 'Bearer ' + token} : {}),
      ...(body ? {'Content-Type': 'application/json'} : {}) },
    ...(body ? {body: JSON.stringify(body)} : {}),
    signal: AbortSignal.timeout(12000),
  });
  assert.equal(response.status, expected, method + ' ' + path + ' status=' + response.status);
  return response.status === 204 ? null : response.json();
}
function mark(text) { summary.push(text); console.log('PASS ' + text); }
function normalizeDump(text) {
  return text.split('\n').filter(line =>
    !line.startsWith('\\restrict ') && !line.startsWith('\\unrestrict ')).join('\n');
}
function hash(text) { return createHash('sha256').update(text).digest('hex'); }
function assertDisposable() {
  assert.equal(process.env.CI, 'true', 'QA-only CI attestation required');
  assert.equal(process.env.MOD001_574_DISPOSABLE_ACK,
    '574:pg16:55474:476cefcdecad55873ee33bd182f12943fb4b1127');
  assert.equal(root, 'http://127.0.0.1:3059');
  const a = new URL(process.env.MOD001_574_AUDIT_DATABASE_URL || '');
  const u = new URL(process.env.DATABASE_URL || '');
  for (const db of [a,u]) {
    assert.equal(db.hostname, '127.0.0.1');
    assert.equal(db.port, '55474');
    assert.equal(db.pathname, '/hisabiq_mod001_574_ci');
    assert.equal(db.protocol, 'postgres:');
  }
  assert.equal(a.username, 'postgres');
  assert.equal(u.username, 'sher_app');
  const sql = 'SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user';
  const props=execFileSync('psql',['-d',process.env.DATABASE_URL,'-Atc',sql],
    {encoding:'utf8'}).trim();
  assert.equal(props, 'f|f', 'Nest app must have NO SUPERUSER/BYPASSRLS');
  const rls=execFileSync('psql',['-d',process.env.DATABASE_URL,'-Atc',
    "SELECT relname FROM pg_class WHERE relname IN ('tenants','users','roles','settings') AND NOT (relrowsecurity AND relforcerowsecurity)"],
    {encoding:'utf8'}).trim();
  assert.equal(rls, '', 'Critical tenant tables must use FORCE RLS');
  const pgver=execFileSync('psql',['-d',process.env.DATABASE_URL,'-Atc',
    'SHOW server_version_num'],{encoding:'utf8'}).trim();
  assert.ok(Number(pgver)>=160000 && Number(pgver)<170000, 'PostgreSQL 16 required');
}
function fingerprint() {
  const dump=execFileSync('pg_dump',[
    '--dbname',process.env.MOD001_574_AUDIT_DATABASE_URL,
    '--data-only','--no-owner','--no-privileges'],
    {maxBuffer:32*1024*1024,encoding:'utf8',
      env:{...process.env, PGOPTIONS:'-c default_transaction_read_only=on'},
      stdio:['ignore','pipe','pipe']});
  const stable=normalizeDump(dump);
  const tables=[...stable.matchAll(/^COPY public\.("[^"]+"|[a-z0-9_]+) /gm)];
  const sequences=[...stable.matchAll(/^SELECT pg_catalog\.setval\(/gm)];
  assert.ok(tables.length>=50,'Full public table inventory required, not partial');
  assert.ok(sequences.length>=1,'Sequence state must be included');
  return {digest:hash(stable),tables:tables.length,sequences:sequences.length};
}
if (process.argv.includes('--self-test')) {
  const x="-- Header\n\\restrict abc\nCOPY public.test (a) FROM stdin;\n1\n\\.\n\\unrestrict abc\n";
  const y=x.replaceAll('abc','xyz');
  assert.equal(hash(normalizeDump(x)),hash(normalizeDump(y)));
  assert.notEqual(hash(normalizeDump(x)),hash(normalizeDump(x.replace('\n1\n','\n2\n'))));
  console.log('PASS pg_dump random sentinel normalizer and row-change sensitivity');
  process.exit(0);
}
async function register(label) {
  const identifier = uniquePhone(), password=pass();
  const businessName='MOD001 574 '+label+' '+identifier.slice(-6);
  const otp=await call('POST','/auth/registration/otp',null,{identifier});
  assert.match(otp.data.devCode,/^[0-9]{6}$/);
  await call('POST','/auth/registration',null,{
    identifier,otpCode:otp.data.devCode,businessName,
    username:'owner'+identifier.slice(-6),password,pin:'736291'
  },201);
  const auth=await call('POST','/auth/login',null,{identifier,password});
  const token=auth.data.accessToken, me=(await call('GET','/me',token)).data;
  assert.equal(me.businessName,businessName);
  return {identifier,password,businessName,token,me};
}
async function main() {
  assertDisposable();
  const a=await register('A'), b=await register('B');
  assert.notEqual(a.me.tenantId,b.me.tenantId);
  mark('two fresh tenant registrations with separate verified /me');
  const role=await call('POST','/roles',a.token,{
    name:'QA Staff Reader',permissions:[
      'settings.setting.view','user.account.view','user.role.view'
    ],confirmPassword:a.password
  },201);
  const roleId=role.data.id;
  const staffIdentifier=uniquePhone();
  await call('POST','/users',a.token,{
    displayName:'QA 574 Staff Reader',username:'qa579staff',
    identifier:staffIdentifier,roleId,confirmPassword:a.password
  },201);
  const otp=await call('POST','/auth/password/otp',null,{identifier:staffIdentifier});
  assert.match(otp.data.devCode,/^[0-9]{6}$/);
  const staffPassword=pass();
  await call('POST','/auth/password/reset',null,{
    identifier:staffIdentifier,otpCode:otp.data.devCode,password:staffPassword
  },204);
  const staffLogin=await call('POST','/auth/login',null,{
    identifier:staffIdentifier,password:staffPassword
  });
  const staffToken=staffLogin.data.accessToken;
  const me=(await call('GET','/me',staffToken)).data;
  for(const permission of ['settings.setting.view','user.account.view','user.role.view']){
    assert.ok(me.permissions.includes(permission),permission);
  }
  for(const path of ['/settings','/users','/roles']){
    const data=await call('GET',path,staffToken);
    assert.ok(!JSON.stringify(data).includes(b.businessName));
    const other=await call('GET',path,b.token);
    assert.ok(!JSON.stringify(other).includes(a.businessName));
  }
  mark('real restricted staff permissions and A/B API data isolation');

  process.env.VITE_HISABIQ_INTEGRATION_MODE = 'connected';
  const {preview}=await import('vite');
  const {chromium}=require('playwright');
  const server=await preview({root:app,configFile:app+'/vite.config.ts',
    preview:{host:'127.0.0.1',port:4299,strictPort:true,
      proxy:{'/api/v1':{target:root}}}});
  let browser;
  try {
    browser=await chromium.launch({...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH} : {}),args:['--no-sandbox']});
    const page=await browser.newPage({viewport:{width:390,height:844}});
    page.setDefaultTimeout(14000);
    const errors=[],writes=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{
      if(/\/api\/v1\/(settings|users|roles)(?:\/|$)/.test(r.url()) && r.method()!=='GET')writes.push(r.method());
    });
    await page.goto('http://127.0.0.1:4299/#/login', {waitUntil:'domcontentloaded',timeout:120000});
    await page.locator('#auth-phone').fill(staffIdentifier);
    await page.locator('#auth-password').fill(staffPassword);
    const verified=page.waitForResponse(r=>r.url().endsWith('/api/v1/me') && r.status()===200);
    await page.getByRole('button',{name:'Sign in',exact:true}).click();
    await verified;
    await page.goto('http://127.0.0.1:4299/#/app/settings/business');
    try {
      await page.waitForFunction(name=>document.querySelector('input[aria-label="Business name"]')?.value===name,a.businessName,{timeout:25000});
    } catch(error) {
      console.log('DEBUG_ROUTE',page.url());
      console.log('DEBUG_VISIBLE_LAYOUT',await page.locator('[data-connected-settings-workspace]').count());
      console.log('DEBUG_PAGEERRORS',JSON.stringify(errors.slice(0,3)));
      throw error;
    }
    assert.equal(await page.getByRole('link',{name:/Users & roles/}).count(),1);
    assert.equal(await page.locator('input[aria-label="Business name"]').isDisabled(),true);
    await page.getByRole('link',{name:/Users & roles/}).click();
    await page.locator('[data-settings-team-table] tbody tr').first().waitFor();
    assert.ok((await page.locator('[data-settings-team-table]').innerText()).includes('QA 574 Staff Reader'));
    assert.ok(!(await page.locator('[data-connected-settings-workspace]').innerText()).includes(b.businessName));
    for(const width of [320,390,1440]){
      await page.setViewportSize({width,height:850});
      assert.ok(await page.locator('[data-connected-settings-workspace]').isVisible());
    }
    mark('genuine restricted staff React business/team at 320/390/1440, read-only');

    let releaseHeldSettings = null;
    let markHeldSettings = null;
    let interceptedStatus = null;
    const intercepted = new Promise(resolve => { markHeldSettings = resolve; });
    await page.route('**/api/v1/settings', async route => {
      try {
        const liveResponse = await route.fetch();
        interceptedStatus = liveResponse.status();
        markHeldSettings();
        await new Promise(resolve => { releaseHeldSettings = resolve; });
        await route.fulfill({ response: liveResponse }).catch(() => undefined);
      } catch (error) {
        markHeldSettings();
        await route.abort().catch(() => undefined);
      }
    });
    await page.getByRole('link',{name:/Business profile/}).click();
    await Promise.race([
      intercepted,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Real Settings GET not intercepted')), 12000)),
    ]);
    assert.equal(interceptedStatus, 200, 'Held actual pre-revocation Nest GET must be HTTP 200');
    await call('PATCH','/roles/'+roleId,a.token,{
      name:'QA Staff Reader',permissions:[],confirmPassword:a.password
    });
    await call('GET','/settings',staffToken,null,403);
    await call('GET','/users',staffToken,null,403);
    await call('GET','/roles',staffToken,null,403);
    await page.waitForFunction(()=>!document.querySelector('[data-settings-team-table]') &&
      !document.querySelector('input[aria-label="Business name"]') &&
      !Array.from(document.querySelectorAll('a')).some(a=>a.getAttribute('href')?.includes('/app/settings/business')),
      null,{timeout:9000});
    assert.ok(!(await page.locator('main').innerText()).includes('QA 574 Staff Reader'));
    releaseHeldSettings();
    await page.waitForTimeout(250);
    assert.equal(await page.locator('input[aria-label="Business name"]').count(), 0);
    assert.ok(!(await page.locator('main').innerText()).includes(a.businessName));
    await page.unroute('**/api/v1/settings');
    mark('delayed pre-revocation real HTTP 200 cannot re-expose Settings after revocation');
    mark('real role revoke causes HTTP 403 and mounted React hides staff/team/settings');
    assert.deepEqual(writes,[], 'Connected read-only UI must send no settings/user/role writes');
    assert.deepEqual(errors,[], 'No browser JavaScript errors');
    await page.close();
  } finally { await browser?.close(); await new Promise(resolve => server.httpServer.close(resolve)); }

  // Read-only GET/403 audit: seed/login/role mutations are deliberately outside snapshot.
  const stableIdle=fingerprint();
  const before=fingerprint();
  assert.deepEqual(before,stableIdle,'No-traffic snapshots must match before GET test');
  for(const user of [a,b]){
    for(const path of ['/me','/settings','/users','/roles']) await call('GET',path,user.token);
  }
  for(const path of ['/me','/settings','/users','/roles']){
    await call('GET',path,staffToken,null,path==='/me'?200:403);
  }
  const after=fingerprint();
  assert.deepEqual(after,before,'DB-wide dump and sequence state must not change on GET/403');
  mark('whole disposable PostgreSQL dump fingerprint unchanged across authorized GET and 403');
  console.log('RESULT '+summary.length+' VERIFIED SECURITY SCENARIOS; PUBLIC_TABLES '+after.tables+' SEQUENCES '+after.sequences+' FINGERPRINT '+after.digest.slice(0,12));
}
main().catch(error=>{console.error('FAIL '+(error.stack||error));process.exitCode=1;});
