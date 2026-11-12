/* MOD-001 REAL Settings/Team API acceptance against disposable PG16.
 * This is CI-only. It does NOT open the gated connected workspace or use a
 * retained/local/production database. No credentials, tokens or OTP are logged.
 */
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { existsSync } = require('node:fs');
const { spawn, execFileSync } = require('node:child_process');
const { createRequire } = require('node:module');
const { setTimeout: delay } = require('node:timers/promises');

const API_ORIGIN = 'http://127.0.0.1:3000';
const DB_NAME = 'hisabiq_mod001_acceptance_test';
const BACKEND_SHA = '2005609f4e367ceabd1e2ac4a9aee18444c9314a';
const SHOPS = Object.freeze([
  {
    identifier: '01711000321', username: 'mod001_fixture_owner_a',
    businessName: 'MOD001 Fixture Electrical A', password: 'FixtureOnlyPassword123!',
    pin: '123456',
  },
  {
    identifier: '01711000322', username: 'mod001_fixture_owner_b',
    businessName: 'MOD001 Fixture Hardware B', password: 'FixtureOnlyPassword123!',
    pin: '4821',
  },
]);

function verifyDisposableEnvironment() {
  assert.equal(process.env.GITHUB_ACTIONS, 'true', 'Only isolated GitHub Actions runner permitted');
  assert.equal(process.env.CI, 'true', 'CI-only guard');
  assert.equal(process.env.NODE_ENV, 'test', 'Non-production API required');
  assert.equal(process.env.IDENTITY_VERIFIER, 'dev', 'No real SMS or identity verification permitted');
  assert.equal(process.env.SINGLE_TENANT_MODE, 'false', 'Two-tenant test required');
  assert.equal(process.env.ENTITLEMENT_SOURCE, 'subscription');
  assert.equal(process.env.PORT, '3000');
  assert.equal(process.env.WEB_ORIGIN, 'http://127.0.0.1:5173');
  assert.equal(process.env.APPROVED_BACKEND_SHA, BACKEND_SHA);
  assert.match(process.env.APPROVED_FRONTEND_SHA || '', /^[0-9a-f]{40}$/);
  assert.ok((process.env.JWT_SECRET || '').length >= 32);
  assert.ok(process.env.BACKEND_NODE_BIN?.length, 'Backend Node20 interpreter required');
  const roles = [['ADMIN_DATABASE_URL', 'postgres'], ['DATABASE_URL', 'sher_app']];
  for (const [name, username] of roles) {
    const url = new URL(process.env[name] || '');
    assert.equal(url.protocol, 'postgres:');
    assert.equal(url.hostname, '127.0.0.1');
    assert.equal(url.port, '5432');
    assert.equal(url.pathname, '/' + DB_NAME);
    assert.equal(decodeURIComponent(url.username), username);
  }
  const backend = path.resolve(process.env.BACKEND_ROOT || '');
  const frontend = path.resolve(process.env.FRONTEND_ROOT || '');
  assert.ok(existsSync(path.join(backend, 'apps/api/dist/main.js')));
  assert.ok(existsSync(path.join(frontend, 'src/integration/settings-team.ts')));
  const sha = root => execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  assert.equal(sha(backend), BACKEND_SHA, 'Backend must match pinned adoption commit');
  assert.equal(sha(frontend), process.env.APPROVED_FRONTEND_SHA, 'Frontend must match PR candidate');
  console.log('MOD-001 PG16 runner accepted exact pinned SHA pair, isolated CI DB, no production credentials');
  return { backend, frontend };
}

async function initializeDatabase(backend) {
  const backendRequire = createRequire(path.join(backend, 'apps/api/package.json'));
  const { createPool, runMigrations } = backendRequire('@sher/adapter-postgres');
  const admin = createPool(process.env.ADMIN_DATABASE_URL);
  try {
    await admin.query(
      "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sher_app') THEN CREATE ROLE sher_app LOGIN PASSWORD 'sher_app_test'; END IF; END $$"
    );
    await runMigrations(admin, path.join(backend, 'migrations'));
    await admin.query('GRANT USAGE ON SCHEMA public TO sher_app');
    await admin.query('GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA public TO sher_app');
  } finally {
    await admin.end();
  }
  console.log('Disposable PG16 migrated; tenant API operates as unprivileged sher_app role');
}

async function waitForApi(child) {
  for (let n = 0; n < 100; n += 1) {
    if (child.exitCode !== null) throw new Error('Backend exited before /health');
    try {
      const res = await fetch(API_ORIGIN + '/health', { signal: AbortSignal.timeout(900) });
      if (res.status === 200) return;
    } catch { /* API starting */ }
    await delay(300);
  }
  throw new Error('Timed out waiting for disposable Nest /health');
}
async function request(method, endpoint, body, accessToken) {
  const response = await fetch(API_ORIGIN + endpoint, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(9_000),
  });
  const parsed = response.status === 204 ? null : await response.json().catch(() => null);
  return { status: response.status, data: parsed?.data, error: parsed?.error };
}
function expectData(response, status, label) {
  assert.equal(response.status, status, label + ' HTTP status');
  assert.ok(response.data && typeof response.data === 'object', label + ' data envelope');
  return response.data;
}
async function registerFixture(shop) {
  const otp = expectData(
    await request('POST', '/api/v1/auth/registration/otp', { identifier: shop.identifier }),
    200, 'disposable registration challenge',
  );
  assert.match(otp.devCode, /^[0-9]{6}$/, 'dev verifier OTP format');
  const registered = expectData(
    await request('POST', '/api/v1/auth/registration', {
      identifier: shop.identifier, otpCode: otp.devCode, businessName: shop.businessName,
      username: shop.username, password: shop.password, pin: shop.pin,
    }),
    201, 'disposable tenant registration',
  );
  assert.match(registered.tenant.id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  assert.match(registered.user.id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  assert.equal(typeof registered.accessToken, 'string');
  return registered;
}
async function stopChild(child) {
  if (!child || child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([
    new Promise(resolve => child.once('exit', resolve)),
    delay(2500),
  ]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

async function exerciseRealMod001(frontend) {
  // React's current standalone typed integration adapters share the same
  // requestJson transport as mounted UI. The full connected route stays gated.
  globalThis.location = { origin: API_ORIGIN };
  const api = await import(pathToFileURL(path.join(frontend, 'src/integration/settings-team.ts')).href);
  const first = await registerFixture(SHOPS[0]);
  const second = await registerFixture(SHOPS[1]);
  assert.notEqual(first.tenant.id, second.tenant.id);
  const tokenA = first.accessToken;
  const tokenB = second.accessToken;
  const [settingsA, settingsB] = await Promise.all([
    api.readTenantSettings(tokenA), api.readTenantSettings(tokenB),
  ]);
  assert.equal(settingsA.data.businessName, SHOPS[0].businessName);
  assert.equal(settingsB.data.businessName, SHOPS[1].businessName);
  assert.ok(settingsA.data.supportedTimezones.includes(settingsA.data.timezone));
  console.log('T01-R PASS: two authoritative settings GET responses, separate tenant identities');

  const newBusinessName = 'MOD001 Verified Electrical A';
  const changed = await api.updateBusinessProfile(tokenA, settingsA.data, newBusinessName);
  assert.equal(changed.data.businessName, newBusinessName);
  assert.equal(changed.data.timezone, settingsA.data.timezone);
  assert.equal((await api.readTenantSettings(tokenA)).data.businessName, newBusinessName);
  assert.equal((await api.readTenantSettings(tokenB)).data.businessName, SHOPS[1].businessName);
  const invalidBusiness = await request(
    'PATCH', '/api/v1/settings/business', { businessName: 'x', timezone: settingsA.data.timezone }, tokenA,
  );
  assert.ok(invalidBusiness.status >= 400 && invalidBusiness.status < 500, 'Invalid business PATCH refused');
  assert.equal((await api.readTenantSettings(tokenA)).data.businessName, newBusinessName);
  console.log('T01-W/P1 PASS: actual PATCH business → GET persistence, timezone preserved, tenant B isolated, invalid write denied');

  // Fail-closed contract triage: keys and primitive *types* only, never IDs,
  // names, phone, bearer or OTP, to identify any source-to-wire skew.
  const [wireUsers, wireRoles] = await Promise.all([
    request('GET', '/api/v1/users', undefined, tokenA),
    request('GET', '/api/v1/roles', undefined, tokenA),
  ]);
  const shape = (response, arrayKey) => {
    const data = response.data && typeof response.data === 'object' ? response.data : {};
    const array = Array.isArray(data[arrayKey]) ? data[arrayKey] : [];
    const row = array[0] && typeof array[0] === 'object' ? array[0] : {};
    return {
      status: response.status,
      dataFields: Object.keys(data).sort(),
      count: array.length,
      firstRowFields: Object.keys(row).sort(),
      firstRowTypes: Object.fromEntries(Object.entries(row).map(([key, value]) => [
        key, value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value,
      ])),
    };
  };
  console.log('T02-R safe wire shape USERS:', JSON.stringify(shape(wireUsers, 'users')));
  console.log('T02-R safe wire shape ROLES:', JSON.stringify(shape(wireRoles, 'roles')));
  const [usersA, usersB, rolesA, rolesB] = await Promise.all([
    api.readTenantUsers(tokenA), api.readTenantUsers(tokenB),
    api.readTenantRoles(tokenA), api.readTenantRoles(tokenB),
  ]);
  const ownerA = usersA.data.users.find(user => user.id === first.user.id);
  const ownerB = usersB.data.users.find(user => user.id === second.user.id);
  assert.ok(ownerA && ownerB, 'Both server-issued owner ULIDs must exist');
  assert.notEqual(ownerA.id, ownerB.id);
  assert.notEqual(ownerA.roleId, ownerB.roleId, 'Role IDs must be tenant-scoped');
  assert.ok(usersA.data.roles.some(role => role.id === ownerA.roleId));
  assert.ok(rolesA.data.roles.some(role => role.id === ownerA.roleId));
  assert.ok(rolesB.data.roles.some(role => role.id === ownerB.roleId));
  assert.equal(Object.hasOwn(rolesA.data.roles[0], 'cashRefundPerDayMinor'), true, 'Adoption backend role caps are required');
  console.log('T02-R PASS: real user and role GET, server ULIDs, two separate role catalogues');

  const oldRole = ownerA.roleId;
  const oldDisabled = ownerA.disabled;
  const renamed = await api.updateTenantUserDisplayName(tokenA, ownerA, 'MOD001 Renamed Owner A');
  assert.equal(renamed.data.displayName, 'MOD001 Renamed Owner A');
  assert.equal(renamed.data.id, ownerA.id);
  assert.equal(renamed.data.roleId, oldRole);
  assert.equal(renamed.data.disabled, oldDisabled);
  const afterUsersA = await api.readTenantUsers(tokenA);
  const persistedA = afterUsersA.data.users.find(user => user.id === ownerA.id);
  assert.equal(persistedA?.displayName, 'MOD001 Renamed Owner A');
  assert.equal(persistedA?.roleId, oldRole);
  assert.equal(persistedA?.disabled, oldDisabled);
  assert.equal((await api.readTenantUsers(tokenB)).data.users.find(user => user.id === ownerB.id)?.displayName,
    ownerB.displayName);
  console.log('T02-W/P1 PASS: real rename PATCH → GET persistence, unchanged role/status, second tenant isolated');

  const noBearer = await request('GET', '/api/v1/users');
  assert.equal(noBearer.status, 401, 'Missing bearer denied');
  const crossTenant = await request(
    'PATCH', '/api/v1/users/' + ownerA.id,
    { displayName: 'Cross Tenant Attack', roleId: ownerA.roleId },
    tokenB,
  );
  assert.ok(crossTenant.status === 403 || crossTenant.status === 404,
    'Tenant B must not modify tenant A owner');
  assert.equal((await api.readTenantUsers(tokenA)).data.users.find(user => user.id === ownerA.id)?.displayName,
    'MOD001 Renamed Owner A');
  const malformedUser = await request(
    'PATCH', '/api/v1/users/' + ownerA.id, { displayName: 'Bad', roleId: 'Sales' }, tokenA,
  );
  assert.ok(malformedUser.status >= 400 && malformedUser.status < 500, 'Unknown role ID refused');
  console.log('Security PASS: no-token 401, cross-tenant user write refused, invalid role ID refused, real rows unchanged');
  console.log('MOD-001 adapter → live Nest → disposable PG16 acceptance PASSED; connected React workspace gate remains intentionally closed');
}

async function main() {
  const { backend, frontend } = verifyDisposableEnvironment();
  await initializeDatabase(backend);
  let api;
  try {
    api = spawn(process.env.BACKEND_NODE_BIN, [path.join(backend, 'apps/api/dist/main.js')], {
      cwd: path.join(backend, 'apps/api'),
      env: { ...process.env, VITE_HISABIQ_INTEGRATION_MODE: undefined },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    // Suppress all runtime logs: they may contain test-only credentials.
    api.stdout.on('data', () => undefined);
    api.stderr.on('data', () => undefined);
    await waitForApi(api);
    console.log('Disposable Nest API /health healthy');
    await exerciseRealMod001(frontend);
  } finally {
    await stopChild(api);
    console.log('CI-only Nest API stopped; GitHub owns and destroys PostgreSQL16 service');
  }
}
main().catch(error => {
  // The assertion message reports a fixed label, not a request credential.
  console.error('MOD-001 PG16 FAILED:', String(error.message || error).split('\n')[0]);
  process.exitCode = 1;
});
