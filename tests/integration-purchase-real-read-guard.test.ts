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
