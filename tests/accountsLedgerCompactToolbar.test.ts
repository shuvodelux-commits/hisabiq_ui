import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const view = readFileSync('src/components/accounts/LedgerView.tsx', 'utf8');
const toolbarStart = view.indexOf('One toolbar row on laptop/desktop');
const tableStart = view.indexOf('      <div className="overflow-hidden rounded-xl border border-border">', toolbarStart);
const toolbar = view.slice(toolbarStart, tableStart);

test('ledger filters, balance, Export and Print occupy one desktop toolbar row', () => {
  assert.ok(toolbarStart !== -1 && tableStart > toolbarStart, 'ledger toolbar markup found');
  assert.match(toolbar, /xl:grid-cols-\[minmax\(170px,1fr\)_minmax\(225px,1\.25fr\)_minmax\(165px,1fr\)_max-content_max-content_max-content\]/);
  assert.deepEqual([
    toolbar.indexOf('<AppSelect'),
    toolbar.indexOf('<AppDateRangePicker'),
    toolbar.indexOf('<Input'),
    toolbar.indexOf('aria-live="polite"'),
    toolbar.indexOf("<ArrowDownToLine"),
    toolbar.indexOf("<Printer")
  ].every((position, index, arr) => position >= 0 && (!index || position > arr[index - 1])), true);
});

test('smaller screens reflow the same controls instead of clipping them', () => {
  assert.match(toolbar, /grid-cols-1/);
  assert.match(toolbar, /sm:grid-cols-2/);
  assert.match(toolbar, /md:grid-cols-\[/);
  assert.doesNotMatch(toolbar, /overflow-hidden/);
});

test('compact layout preserves the ledger filter and output behavior', () => {
  assert.match(toolbar, /setAccountId\(next\.id\)/);
  assert.match(toolbar, /setFrom\(range\.from\); setTo\(range\.to\)/);
  assert.match(toolbar, /onChange=\{\(event\) => setSearch\(event\.target\.value\)\}/);
  assert.match(toolbar, /downloadCsv\(account\.name, rows\)/);
  assert.match(toolbar, /onClick=\{printLedger\}/);
  assert.match(toolbar, /aria-label=\{text\('Search account ledger'/);
  assert.match(toolbar, /label=\{text\('Ledger account'/);
  assert.match(toolbar, /label=\{text\('Account ledger date range'/);
});
