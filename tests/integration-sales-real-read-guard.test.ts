import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const runner = fileURLToPath(new URL('../scripts/connected-sales-real-read-browser.cjs', import.meta.url));
const script = readFileSync(runner, 'utf8');
const fixture = readFileSync(new URL('./fixtures/connected-sales-real-read.tsx', import.meta.url), 'utf8');

function refused(variables: Record<string, string>, message: RegExp) {
  const result = spawnSync(process.execPath, [runner], {
    env: { PATH: process.env.PATH || '', ...variables },
    encoding: 'utf8',
    timeout: 10_000,
  });
  assert.notEqual(result.status, 0, 'unapproved real read runner must fail closed');
  assert.match(result.stderr, message);
  assert.doesNotMatch(result.stderr, /Bearer |Authorization:|postgres:\/\/|secret/i,
    'even refused runs must not disclose bearer or database secret');
}

test('R09REAL-01 refuses a real browser/PG run without explicit disposable acknowledgement', () => {
  refused({}, /explicit disposable-PG16 read-only acknowledgement is missing/);
});

test('R09REAL-02 refuses real or arbitrary host/API origin before inspecting PG', () => {
  refused({
    HISABIQ_R09_REAL_READ_ACK: 'disposable-pg16-read-only',
    HISABIQ_R09_REAL_API_ORIGIN: 'https://public.example',
  }, /API origin must be the pinned localhost disposable test port/);
});

test('R09REAL-03 refuses any unreserved database/container identity', () => {
  refused({
    HISABIQ_R09_REAL_READ_ACK: 'disposable-pg16-read-only',
    HISABIQ_R09_REAL_API_ORIGIN: 'http://127.0.0.1:3293',
    HISABIQ_R09_REAL_PG_CONTAINER: 'production-pg',
    HISABIQ_R09_REAL_PG_DB: 'erp',
  }, /dedicated disposable PostgreSQL identity mismatch/);
});

test('R09REAL-04 refuses unknown tenant/sale/token before starting Vite or Podman', () => {
  refused({
    HISABIQ_R09_REAL_READ_ACK: 'disposable-pg16-read-only',
    HISABIQ_R09_REAL_API_ORIGIN: 'http://127.0.0.1:3293',
    HISABIQ_R09_REAL_PG_CONTAINER: 'hisabiq-mod009-read-pg16',
    HISABIQ_R09_REAL_PG_DB: 'hisabiq_mod009_sales_read_12',
  }, /valid seeded tenant, user and sale ULIDs are required/);
});

test('R09REAL-05 all server business operations are guarded to GET and localhost', () => {
  assert.match(script, /const API = 'http:\/\/127\.0\.0\.1:3293'/);
  assert.match(script, /const CONTAINER = 'hisabiq-mod009-read-pg16'/);
  assert.match(script, /const DATABASE = 'hisabiq_mod009_sales_read_12'/);
  assert.match(script, /assert\.equal\(method, 'GET', 'no business mutation may reach Nest'\)/);
  assert.match(script, /method: 'GET', redirect: 'error'/);
  assert.match(script, /allowedGet\(path\)/);
  assert.match(script, /validateDisposablePodman\(\)/);
  assert.doesNotMatch(script, /(?:createSale|createSalesReturn|postSale|updateStock|saveJournal)\s*\(/);
});

test('R09REAL-06 two actual JWT/tenant identities and role/RLS barriers must be proven', () => {
  assert.match(script, /\/api\/v1\/me/);
  assert.match(script, /GET returnability|returnability GET/);
  assert.match(script, /'B cannot see A source invoice'/);
  assert.match(script, /'A cannot see B source invoice'/);
  assert.match(script, /'B cannot read returnability without return\.create'/);
  assert.match(script, /'B cannot read history without return\.view'/);
  assert.match(script, /'costs redacted for role without inventory\.cost\.view'/);
  assert.match(script, /'POSTED'/);
});

test('R09REAL-07 actual React session provider is rendered in test-only HTML, not in App', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../src/pages/Sales.tsx', import.meta.url), 'utf8');
  assert.match(fixture, /SessionProvider mode="connected"/);
  assert.match(fixture, /TenantSettingsProvider/);
  assert.match(fixture, /ConnectedSalesReadWorkspace/);
  assert.match(app, /ConnectedWorkspaceGate/);
  assert.doesNotMatch(app, /connected-sales-real-read/);
  assert.doesNotMatch(page, /connected-sales-real-read/);
});

test('R09REAL-08 browser checks desktop/mobile, source and role changes, without auth claims', () => {
  assert.match(script, /exercise\(browser, 1280, preflightRecords\)/);
  assert.match(script, /exercise\(browser, 390, preflightRecords\)/);
  assert.match(script, /returnable\//);
  assert.match(script, /return-history GET restricted to authorized role A/);
  assert.match(script, /assert\.equal\(readCalls\.some\(row => row\.who === 'b'/);
  assert.match(script, /auth\/login.*method === 'POST'/);
  assert.match(fixture, /bootstrapped disposable auth fixture/);
});
