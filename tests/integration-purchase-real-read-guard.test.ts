import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const runner = fileURLToPath(new URL('../scripts/connected-purchase-real-read-browser.cjs', import.meta.url));
const fixture = fileURLToPath(new URL('./fixtures/connected-purchase-real-read.tsx', import.meta.url));
function source(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}
function refuses(env: Record<string, string>, expected: RegExp): void {
  const result = spawnSync(process.execPath, [runner], {
    env: { PATH: process.env.PATH ?? '', ...env },
    encoding: 'utf8', timeout: 8000,
  });
  assert.notEqual(result.status, 0, 'unapproved test must never pass');
  assert.match(result.stderr, expected);
  assert.doesNotMatch(result.stderr, /Bearer |Authorization:|postgres:\/\/|JWT_SECRET/);
}
test('R09PUR-01 has a dedicated GET-only real Nest+PG browser runner', () => {
  assert.ok(existsSync(runner));
  assert.match(source(runner), /disposable-pg16-purchase-read-only/);
  assert.match(source(runner), /hisabiq-mod009-purchase-read-pg16/);
  assert.match(source(runner), /hisabiq_mod009_purchase_read_598/);
});
test('R09PUR-02 denies unapproved executable runs before opening browser', () => {
  refuses({}, /explicit disposable purchase read-only acknowledgement is missing/);
});
test('R09PUR-03 pins dedicated local Nest API and refuses arbitrary origin', () => {
  refuses({ HISABIQ_R09_PURCHASE_ACK: 'disposable-pg16-purchase-read-only',
    HISABIQ_R09_PURCHASE_API_ORIGIN: 'https://example.org' },
  /isolated purchase test API origin is required/);
});
test('R09PUR-04 refuses unrelated PostgreSQL container/database', () => {
  refuses({ HISABIQ_R09_PURCHASE_ACK: 'disposable-pg16-purchase-read-only',
    HISABIQ_R09_PURCHASE_API_ORIGIN: 'http://127.0.0.1:3294',
    HISABIQ_R09_PURCHASE_PG_CONTAINER: 'prod-db',
    HISABIQ_R09_PURCHASE_PG_DB: 'prod' },
  /dedicated disposable purchase PG16 identity mismatch/);
});
test('R09PUR-05 enforces actual signed A/B identity and source purchase isolation', () => {
  const script = source(runner);
  assert.match(script, /'purchase\.bill\.view'/);
  assert.match(script, /'purchase\.return\.create'/);
  assert.match(script, /'purchase\.return\.view'/);
  assert.match(script, /B cannot inspect A purchase/);
  assert.match(script, /A cannot inspect B purchase/);
  assert.match(script, /assert\.notEqual\(results\.a\.row\.supplierName, results\.b\.row\.supplierName/);
  assert.doesNotMatch(script, /getByText\(rowA\.number\)\.count/);
});
test('R09PUR-06 all forwarded business requests must be local GETs', () => {
  const script = source(runner);
  assert.match(script, /assert\.equal\(method, 'GET'/);
  assert.match(script, /method: 'GET', redirect: 'error'/);
  assert.match(script, /only known purchase read routes/);
  assert.doesNotMatch(script, /(?:createPurchaseReturn|voidPurchaseReturn|postJournal)\s*\(/);
});
test('R09PUR-07 renders the existing connected Purchases component in a test-only fixture', () => {
  const jsx = source(fixture);
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(jsx, /SessionProvider mode="connected"/);
  assert.match(jsx, /TenantSettingsProvider/);
  assert.match(jsx, /MemoryRouter/);
  assert.match(jsx, /<Purchases\s*\/>/);
  assert.match(app, /ConnectedWorkspaceGate/);
  assert.doesNotMatch(app, /connected-purchase-real-read/);
});
test('R09PUR-08 browser covers desktop, tablet, phone and unauthorized return tabs', () => {
  const script = source(runner);
  for (const width of [1280, 768, 390]) {
    assert.match(script, new RegExp('exercise\\(browser, ' + width + ', preflightRecords\\)'));
  }
  assert.match(script, /data-purchase-returnable-table/);
  assert.match(script, /data-purchase-return-history-table/);
  assert.match(script, /getByText\(rowA\.supplierName\)\.count/);
  assert.match(script, /data-purchases-table/);
});

test('R09PUR-09 responsive supplier assertion must inspect visible rows, not hidden copies', () => {
  const script = source(runner);
  for (const who of ['A', 'B']) {
    assert.match(script, new RegExp('table\\.getByText\\(row' + who +
      '\\.supplierName\\)\\.filter\\(\\{ visible: true \\}\\)\\.first\\(\\)\\.waitFor\\(\\)'));
  }
  assert.doesNotMatch(script, /table\.getByText\(row[AB]\.supplierName\)\.first\(\)\.waitFor\(\)/);
});

test('R09PUR-10 Vite readiness waits for the React, Purchases and CSS responses', () => {
  const script = source(runner);
  for (const path of ['/tests/fixtures/connected-purchase-real-read.tsx',
    '/src/pages/Purchases.tsx', '/src/index.css']) {
    assert.ok(script.includes(path), 'warmup resource missing: ' + path);
  }
  assert.match(script, /await response\.arrayBuffer\(\)/);
  assert.match(script, /redirect: 'error'/);
  assert.match(script, /if \(ready\) return child/);
  assert.doesNotMatch(script, /status === 200\)\s*return child/);
});
test('R09PUR-11 browser failure identifies only a safe viewport and stage', () => {
  const script = source(runner);
  assert.match(script, /R09_PURCHASE_BROWSER_PHASE_RED/);
  assert.match(script, /const stage = \{/);
  assert.match(script, /stage\.value = 'navigation'/);
  assert.match(script, /stage\.value = 'tenant-b'/);
  assert.doesNotMatch(script, /console\.(?:error|log)\([^;\n]*(?:e\.message|e\.stack|people\[.*\]\.token)/);
});


test('R09PUR-12 real preflight must reject anonymous and forged bearer identity', () => {
  const script = source(runner);
  assert.match(script, /async function negativeReadPreflight\(/);
  assert.ok(script.includes("assert.equal((await get('/api/v1/me')).status, 401)"));
  assert.ok(script.includes("assert.equal((await get('/api/v1/me', forged.join('.'))).status, 401)"));
  assert.match(script, /await negativeReadPreflight\(\)/);
});
test('R09PUR-13 missing source, cross-tenant returnable and B permission fail closed', () => {
  const script = source(runner);
  assert.ok(script.includes("const missing = '00000000000000000000000000'"));
  assert.ok(script.includes("assert.equal((await get('/api/v1/purchases/' + missing, people.a.token)).status, 404)"));
  assert.ok(script.includes("assert.equal((await get('/api/v1/purchase-returns/returnable/' + missing, people.a.token)).status, 404)"));
  assert.ok(script.includes("assert.equal((await get('/api/v1/purchase-returns/returnable/' + people.b.purchaseId, people.a.token)).status, 404)"));
  assert.ok(script.includes("assert.equal((await get('/api/v1/purchase-returns/returnable/' + people.b.purchaseId, people.b.token)).status, 403)"));
});

test('R09PUR-14 requires a genuine expired tenant A JWT before real GET acceptance', () => {
  const script = source(runner);
  assert.match(script, /HISABIQ_R09_PURCHASE_EXPIRED_JWT_A/);
  assert.match(script, /expired\.sub === people\.a\.userId/);
  assert.match(script, /expired\.tid === people\.a\.tenantId/);
  assert.match(script, /expired\.exp < Math\.floor\(Date\.now\(\) \/ 1000\)/);
  assert.match(script, /assert\.equal\(\(await get\('\/api\/v1\/me', expiredToken\)\)\.status, 401\)/);
  assert.match(script, /assert\.equal\(\(await get\('\/api\/v1\/purchases\?limit=25', expiredToken\)\)\.status, 401\)/);
});
test('R09PUR-15 expired bearer login cannot reveal purchases in rendered session', () => {
  const script = source(runner);
  const jsx = source(fixture);
  assert.match(jsx, /data-purchase-real-login-expired/);
  assert.match(script, /stage\.value = 'expired-login'/);
  assert.match(script, /getByText\('failed:expired'\)\.waitFor\(\)/);
  assert.match(script, /getByText\('Session:signed-out'\)\.waitFor\(\)/);
  assert.match(script, /data-purchases-table.*count\(\)/);
  assert.match(script, /path === '\/api\/v1\/me'/);
  assert.match(script, /path === '\/api\/v1\/auth\/logout'/);
  assert.match(script, /assert\.equal\(method, 'GET'/);
});

test('R09PUR-16 synthetic malformed list uses verified real A GET then fails protocol closed', () => {
  const script = source(runner);
  assert.match(script, /async function exerciseMalformedPurchaseList\(/);
  assert.match(script, /faults\.injectMalformedList && who === 'a'/);
  assert.match(script, /response\.status === 200 && Array\.isArray\(response\.data\?\.data\)/);
  assert.match(script, /JSON\.stringify\(\{ data: \{ malformed: true \} \}\)/);
  assert.match(script, /assert\.ok\(faults\.injected >= 1,/);
});
test('R09PUR-17 malformed-list UI displays no preview purchases at each viewport', () => {
  const script = source(runner);
  assert.match(script, /Could not verify purchases from the server\. No preview data was loaded\./);
  assert.match(script, /await page\.locator\('\[data-purchases-table\]'\)\.count\(\)/);
  assert.match(script, /assert\.deepEqual\(violations, \[\]\)/);
  for (const width of [1280, 768, 390]) {
    assert.ok(script.includes('exerciseMalformedPurchaseList(browser, ' + width + ', preflightRecords)'));
  }
});
