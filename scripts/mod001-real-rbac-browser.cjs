/* #559: disposable-only real Nest/PG16 RBAC acceptance; never log credentials/bodies.
 * Seams authorized by #559: public auth/admin/read HTTP + unchanged parent React mount.
 * N/A: finance/stock/rounding/Cash/Bank/MFS, posting/reversal, offline device sync,
 * mutation retry/version conflicts: this slice seeds identity only, then reads.
 * Concurrent revocation is tested at the real response boundary, without fake GETs.
 * ponytail: one sequential runner, installed dependencies, unchanged JSX fixture.
 */
const assert = require('node:assert/strict');
const { randomBytes, createHash } = require('node:crypto');
const { readFileSync, mkdirSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const { chromium, expect } = require('playwright/test');
const backend = '/home/shoaib/Projects/nestshererp-mod001-qa-20261114';
const backendSha = '476cefcdecad55873ee33bd182f12943fb4b1127';
const parentSha = 'b4c810f54d9336fc544916e0f49ab71ca0977f94';
const api = 'http://127.0.0.1:3059/api/v1';
const origin = 'http://127.0.0.1:4259';
const paths = ['/settings', '/users', '/roles'];
const grants = ['settings.setting.view', 'user.account.view', 'user.role.view'];
const failures = [], gaps = [], results = [];
const secret = () => randomBytes(24).toString('base64url') + '!aA1';
const suffix = () => randomBytes(6).toString('hex');
let phase = 'preflight', captureFailure;
async function run(name, scenario) {
  try { await scenario(); results.push({ name, result: 'PASS' }); console.log(`PASS ${name}`); }
  catch (error) {
    failures.push(name); results.push({ name, result: 'RED' });
    console.error(`RED ${name}${error.safeDiagnostic ? `: ${error.safeDiagnostic}` : ''}`);
    try { await captureFailure?.(results.length); } catch { console.error('BLOCKED failure screenshot unavailable'); }
  }
}
async function request(path, { token, body, method = body ? 'POST' : 'GET', status = 200 } = {}) {
  // No financial writes, arbitrary hosts or production settings writes are supported.
  assert.ok(method === 'GET' || /^\/auth\/(registration(?:\/otp(?:\/verify)?)?|password\/(otp|reset)|login)$/.test(path) ||
    (token && (/^\/roles(?:\/[0-9A-Z]{26})?$/.test(path) || /^\/users(?:\/[0-9A-Z]{26}\/disabled)?$/.test(path))));
  const response = await fetch(api + path, {
    method, redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  // Safe messages only: assertion libraries must never dump token-bearing response objects.
  if (response.status !== status) {
    const error = new Error('Unexpected task API status');
    error.safeDiagnostic = `${method} ${path.replace(/[0-9A-Z]{26}/g, ':id')}: HTTP ${response.status}, expected ${status}`;
    throw error;
  }
  return response.status === 204 ? null : (await response.json());
}
async function signIn(actor) {
  const login = (await request('/auth/login', { body: { identifier: actor.identifier, password: actor.password } })).data;
  assert.equal(typeof login.accessToken, 'string');
  actor.token = login.accessToken;
  actor.me = (await request('/me', { token: actor.token })).data;
  assert.ok(actor.me.tenantId && actor.me.user.id);
  assert.equal(actor.me.user.username, actor.username);
}
async function register(label) {
  const id = suffix();
  const actor = { identifier: `qa559-${id}@example.com`, username: `qa559${id}`, password: secret(), businessName: `QA559 ${label} ${id}` };
  const otp = (await request('/auth/registration/otp', { body: { identifier: actor.identifier } })).data.devCode;
  assert.match(otp || '', /^\d{6}$/);
  await request('/auth/registration/otp/verify', { body: { identifier: actor.identifier, otpCode: otp } });
  await request('/auth/registration', { status: 201, body: {
    identifier: actor.identifier, username: actor.username, password: actor.password,
    otpCode: otp, businessName: actor.businessName, pin: '736291',
  } });
  await signIn(actor);
  assert.equal(actor.me.businessName, actor.businessName);
  assert.equal(actor.me.user.roleName, 'Owner');
  for (const grant of grants) assert.ok(actor.me.permissions.includes(grant));
  return actor;
}
async function staff(owner, kind, permissions) {
  const id = suffix(), roleName = `QA559 ${kind} ${id}`;
  const role = (await request('/roles', { token: owner.token, status: 201, body: {
    name: roleName, permissions, confirmPassword: owner.password,
  } })).data;
  assert.deepEqual(role.permissions, permissions);
  assert.equal(role.isSystem, false);
  const actor = { identifier: `qa559-${id}@example.com`, username: `qa559${id}`, password: secret(),
    businessName: owner.businessName, role, kind, permissions };
  const user = (await request('/users', { token: owner.token, status: 201, body: {
    displayName: `QA559 ${kind}`, username: actor.username, identifier: actor.identifier,
    roleId: role.id, confirmPassword: owner.password,
  } })).data;
  assert.equal(user.hasPassword, false);
  assert.equal(user.roleId, role.id);
  const otp = (await request('/auth/password/otp', { body: { identifier: actor.identifier } })).data.devCode;
  assert.match(otp || '', /^\d{6}$/);
  await request('/auth/password/reset', { status: 204, body: { identifier: actor.identifier, otpCode: otp, password: actor.password } });
  await signIn(actor);
  assert.equal(actor.me.tenantId, owner.me.tenantId);
  assert.equal(actor.me.user.id, user.id);
  assert.equal(actor.me.user.roleName, roleName);
  assert.deepEqual([...actor.me.permissions].sort(), [...permissions].sort());
  return actor;
}
async function projections(owners) {
  const data = [];
  for (const owner of owners) for (const path of paths) data.push((await request(path, { token: owner.token })).data);
  return data;
}
async function matrix(actor, foreign) {
  for (let i = 0; i < paths.length; i++) {
    const allowed = actor.permissions.includes(grants[i]);
    const response = await request(paths[i], { token: actor.token, status: allowed ? 200 : 403 });
    if (!allowed) assert.equal(response.error.code, 'PERMISSION_DENIED');
    const text = JSON.stringify(response);
    for (const other of foreign) {
      assert.ok(!text.includes(other.me.user.id));
      assert.ok(!text.includes(other.identifier));
      if (other.role) assert.ok(!text.includes(other.role.id));
    }
    if (allowed && i === 0) assert.equal(response.data.businessName, actor.businessName);
    if (allowed && i === 1) assert.ok(response.data.users.some(user => user.id === actor.me.user.id));
    if (allowed && i === 2) assert.ok(response.data.roles.some(role => role.id === actor.role.id));
  }
}
async function main() {
  assert.equal(process.env.MOD001_DISPOSABLE_API_ACK, `559:hisabiq_mod001_559_rbac:pg16:55459:${backendSha}`,
    'Owner attestation of task DB/Node20 API/non-bypass sher_app/FORCE RLS required before seed');
  assert.equal(execFileSync('git', ['-C', backend, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), backendSha);
  assert.equal(execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim(), 'codex/mod001-qa-rbac02-559-20261114');
  execFileSync('git', ['merge-base', '--is-ancestor', parentSha, 'HEAD']);
  for (const [extension, hash] of [['html', 'b6b5c5c38b0a8ff4e0bf0be00c37634b53c242b5e2b4f9b3aaf78b39cad7e54f'],
    ['tsx', 'bfe1812e3f7f0fdc6e2a03f8bee0543f708a360c5da88dd77acc48565ad6518a']]) {
    assert.equal(createHash('sha256').update(readFileSync(`tests/fixtures/mod001-connected-settings-team.${extension}`)).digest('hex'), hash);
  }
  await run('real missing/invalid bearer: 6 HTTP401 responses', async () => {
    for (const path of paths) for (const token of [undefined, 'invalid-task-only-token']) await request(path, { token, status: 401 });
  });
  // Setup must stop on failure: no dependent browser checks against imaginary actors.
  phase = 'real owner/staff provisioning';
  const a = await register('A'), b = await register('B');
  assert.notEqual(a.me.tenantId, b.me.tenantId);
  const owners = [a, b], actors = [];
  await run('seed validation: missing/wrong owner step-up and unknown grant leave projections unchanged', async () => {
    const baseline = await projections(owners), ownerRole = baseline[2].roles.find(role => role.code === 'OWNER');
    const roleBody = { name: `QA559 rejected ${suffix()}`, permissions: [] };
    const userBody = { displayName: 'QA559 rejected', username: `qa559${suffix()}`,
      identifier: `qa559-${suffix()}@example.com`, roleId: ownerRole.id };
    for (const [path, body] of [['/roles', roleBody], ['/users', userBody]]) {
      await request(path, { token: a.token, body, status: 400 });
      await request(path, { token: a.token, body: { ...body, confirmPassword: secret() }, status: 401 });
    }
    await request('/roles', { token: a.token, body: { ...roleBody, permissions: ['qa559.unknown'], confirmPassword: a.password }, status: 400 });
    assert.deepEqual(await projections(owners), baseline);
  });
  for (const owner of owners) {
    owner.staff = [];
    for (const [kind, permissions] of [['settings', [grants[0]]], ['users', [grants[1]]], ['roles', [grants[2]]], ['none', []]]) {
      const actor = await staff(owner, kind, permissions); owner.staff.push(actor); actors.push(actor);
    }
  }
  console.log('SETUP verified two owners + eight custom-role staff: genuine OTP/password login and exact /me grants');
  const before = await projections(owners);
  assert.ok(before[2].roles.every(role => !before[5].roles.some(other => role.id === other.id)));
  for (const owner of owners) for (const actor of owner.staff) await run(`real ${owner === a ? 'A' : 'B'}/${actor.kind}: HTTP200/403 matrix + foreign ID exclusion`,
    () => matrix(actor, [owner === a ? b : a, ...(owner === a ? b : a).staff]));
  phase = 'Vite/browser startup';
  const { createServer } = await import('vite');
  const server = await createServer({ cacheDir: '/tmp/mod001-559-vite-cache', server: { host: '127.0.0.1', port: 4259, strictPort: true,
    proxy: { '/api/v1': { target: 'http://127.0.0.1:3059' } } } });
  let browser;
  mkdirSync('/tmp/mod001-559-browser', { recursive: true });
  try {
    await server.listen();
    browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox'] });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: true });
    const page = await context.newPage(), writes = [], errors = [];
    captureFailure = number => page.screenshot({ path: `/tmp/mod001-559-browser/red-${number}.png`, fullPage: true,
      mask: [page.getByLabel('Identifier', { exact: true }), page.getByLabel('Password', { exact: true })] });
    page.setDefaultTimeout(15000);
    page.on('pageerror', () => errors.push('React pageerror'));
    page.on('request', req => {
      if (/\/api\/v1\/(settings|users|roles)(\/|$)/.test(req.url()) && req.method() !== 'GET') writes.push(req.method());
    });
    const mount = async () => {
      await page.goto(`${origin}/tests/fixtures/mod001-connected-settings-team.html`, { waitUntil: 'domcontentloaded', timeout: 120000 });
      await page.getByLabel('Identifier', { exact: true }).waitFor({ timeout: 120000 });
    };
    phase = 'unchanged React fixture mount';
    await mount();
    console.log('SETUP verified unchanged React fixture mounted');
    const name = page.getByLabel('Business name', { exact: true });
    const rows = page.locator('[data-settings-team-table] tbody tr');
    const roles = page.locator('[data-settings-magic-team] dl dt');
    const login = async actor => {
      await page.getByLabel('Identifier', { exact: true }).fill(actor.identifier);
      await page.getByLabel('Password', { exact: true }).fill(actor.password);
      await page.getByLabel('Password', { exact: true }).press('Enter');
      await expect(page.locator('[data-session-status]')).toHaveText('authenticated');
    };
    const blank = async () => {
      await expect(name).toHaveValue(''); await expect(rows).toHaveCount(0); await expect(roles).toHaveCount(0);
    };
    const presentation = async actor => {
      const self = actor.me.tenantId === a.me.tenantId ? a : b, foreign = self === a ? b : a;
      await expect(name).toHaveValue(actor.permissions.includes(grants[0]) ? self.businessName : '');
      await expect(rows).toHaveCount(actor.permissions.includes(grants[1]) ? 5 : 0);
      await expect(roles).toHaveCount(actor.permissions.includes(grants[2]) ? 10 : 0);
      const offset = self === a ? 0 : 3;
      if (actor.permissions.includes(grants[1])) {
        const displayed = await rows.evaluateAll(nodes => nodes.map(row => Array.from(row.querySelectorAll('td')).slice(0, 3).map(cell => cell.textContent)));
        const expected = before[offset + 1].users.map(user => [user.displayName, user.roleName, user.disabled ? 'Disabled' : 'Active']);
        assert.deepEqual(displayed.sort(), expected.sort());
      }
      if (actor.permissions.includes(grants[2])) {
        assert.deepEqual((await roles.allTextContents()).sort(), before[offset + 2].roles.map(role => role.name).sort());
      }
      const text = await page.locator('main').innerText();
      assert.ok(text.includes(actor.me.user.roleName));
      assert.ok(!text.includes(foreign.businessName));
      for (const other of foreign.staff) assert.ok(!text.includes(other.role.name));
      assert.ok(!text.includes('Nawabpur Hardware House'));
      assert.ok(!text.includes('Everything, including business settings'));
      if (!actor.permissions.includes(grants[1])) assert.ok(!text.includes('Verified team accounts.'));
      assert.match(text, /সার্ভার|ভূমিকা/);
    };
    for (const actor of actors) await run(`React ${actor.me.tenantId === a.me.tenantId ? 'A' : 'B'}/${actor.kind}: real login, authorized sections, no preview`, async () => {
      await page.getByRole('button', { name: 'Sign out', exact: true }).tap();
      await expect(page.locator('[data-session-status]')).toHaveText('signed-out'); await blank();
      await login(actor); await presentation(actor);
      await page.getByLabel('Identifier', { exact: true }).fill('');
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.getByRole('button', { name: 'English', exact: true }).tap();
        await page.getByRole('button', { name: 'English', exact: true }).focus(); await page.keyboard.press('Tab');
        await expect(page.getByRole('button', { name: 'বাংলা', exact: true })).toBeFocused(); await page.keyboard.press('Space');
        await expect(page.getByLabel('Selected language', { exact: true })).toHaveText('Bangla');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await presentation(actor);
        await page.screenshot({ path: `/tmp/mod001-559-browser/${actor.me.tenantId === a.me.tenantId ? 'a' : 'b'}-${actor.kind}-${width}.png`, fullPage: true });
      }
    });
    await run('post-setup API projections unchanged by read-only browser matrix', async () => {
      assert.deepEqual(await projections(owners), before); assert.deepEqual(writes, []); assert.deepEqual(errors, []);
    });
    // Distinct phase: deliberate owner mutations below are not part of SELECT invariance.
    phase = 'active revocation';
    const revoked = a.staff[0];
    await login(revoked); await presentation(revoked);
    await request(`/roles/${revoked.role.id}`, { token: a.token, method: 'PATCH', body: {
      name: revoked.role.name, permissions: [], confirmPassword: a.password,
    } });
    await run('active revoked bearer: /me empty grants and three genuine HTTP403s', async () => {
      assert.deepEqual((await request('/me', { token: revoked.token })).data.permissions, []);
      for (const path of paths) await request(path, { token: revoked.token, status: 403 });
    });
    await run('active React clears revoked settings without reload within 5 seconds', async () => {
      await expect(name).toHaveValue('', { timeout: 5000 }); await blank();
    });
    await run('reload re-verifies revoked principal and clears settings', async () => {
      await mount(); await expect(page.locator('[data-session-status]')).toHaveText('authenticated'); await blank();
    });
    await run('new real password login after revocation has no grants or React data', async () => {
      await signIn(revoked); assert.deepEqual(revoked.me.permissions, []);
      await login(revoked); await blank();
    });
    phase = 'active disable';
    const disabled = a.staff[1];
    await login(disabled); await presentation(disabled);
    await request(`/users/${disabled.me.user.id}/disabled`, { token: a.token, body: { disabled: true, confirmPassword: a.password } });
    await run('disabled account: existing bearer and new password login rejected', async () => {
      await request('/auth/login', { status: 401, body: { identifier: disabled.identifier, password: disabled.password } });
      await request('/me', { token: disabled.token, status: 404 });
      for (const path of paths) await request(path, { token: disabled.token, status: 403 });
    });
    await run('active React clears disabled staff data without reload within 5 seconds', blank);
    await run('reload disabled session fails closed and fresh browser login stays denied', async () => {
      await mount(); await expect(page.locator('[data-session-status]')).toHaveText('signed-out'); await blank();
      await page.getByLabel('Identifier', { exact: true }).fill(disabled.identifier);
      await page.getByLabel('Password', { exact: true }).fill(disabled.password);
      await page.getByLabel('Password', { exact: true }).press('Enter');
      await expect(page.getByRole('alert')).toContainText('Sign-in failed'); await blank();
      await page.getByLabel('Identifier', { exact: true }).fill('');
      await page.screenshot({ path: '/tmp/mod001-559-browser/disabled-denied.png', fullPage: true });
    });
    phase = 'concurrent genuine pre-revocation response';
    const concurrent = b.staff[0];
    await run('concurrent old real HTTP200 cannot restore settings after owner revocation', async () => {
      let release, received = false, settled = false, transportFailed = false;
      const held = new Promise(resolve => { release = resolve; });
      const pattern = '**/api/v1/settings';
      await page.route(pattern, async route => {
        try {
          const response = await route.fetch();
          assert.equal(response.status(), 200); received = true;
          await held; await route.fulfill({ response });
        } catch { transportFailed = true; } finally { settled = true; }
      });
      try {
        await login(concurrent);
        await expect.poll(() => received, { timeout: 15000 }).toBe(true);
        await request(`/roles/${concurrent.role.id}`, { token: b.token, method: 'PATCH', body: {
          name: concurrent.role.name, permissions: [], confirmPassword: b.password,
        } });
        await request('/settings', { token: concurrent.token, status: 403 });
        assert.deepEqual((await request('/me', { token: concurrent.token })).data.permissions, []);
        const delivered = page.waitForResponse(response => response.url() === `${origin}/api/v1/settings`);
        release(); await (await delivered).finished(); await expect.poll(() => settled).toBe(true);
        assert.equal(transportFailed, false);
        // Initially blank is insufficient: watch every frame after real response completion.
        const stayedBlank = await page.evaluate(async () => {
          const end = performance.now() + 5000;
          do {
            if (document.querySelector('[data-settings-magic-general="business"] input')?.value !== '') return false;
            await new Promise(resolve => requestAnimationFrame(resolve));
          } while (performance.now() < end);
          return true;
        });
        assert.equal(stayedBlank, true, 'Old real response must remain hidden throughout 5-second observation');
      } finally { release(); await expect.poll(() => settled).toBe(true); await page.unroute(pattern); }
    });
    assert.deepEqual(writes, []); assert.deepEqual(errors, []);
    await context.close();
  } finally { await browser?.close(); await server.close(); }
  gaps.push('DB-wide SELECT/ledger/stock invariance: no supplied approved read-only PG credential; API projections only');
  for (const gap of gaps) console.log(`BLOCKED ${gap}`);
  console.log(`RESULT ${results.filter(item => item.result === 'PASS').length} PASS / ${failures.length} RED / ${gaps.length} BLOCKED`);
  process.exitCode = failures.length ? 1 : gaps.length ? 2 : 0;
}
main().catch(error => { console.error(`BLOCKED ${phase}${error.safeDiagnostic ? `: ${error.safeDiagnostic}` : ''}; no response bodies or credentials logged`); process.exitCode = 1; });
