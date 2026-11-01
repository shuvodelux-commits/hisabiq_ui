import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const view = readFileSync('src/components/accounts/LedgerView.tsx', 'utf8');
const toolbarStart = view.indexOf('Keep account, dates, search, export and print on one desktop row.');
const tableStart = view.indexOf('      <div className="overflow-hidden rounded-xl border border-border">', toolbarStart);
const toolbar = view.slice(toolbarStart, tableStart);
const headerEnd = view.indexOf('        <div className="overflow-x-auto">', tableStart);
const ledgerHeader = view.slice(tableStart, headerEnd);

test('account, date range, search, Export and Print share a compact desktop toolbar row', () => {
  assert.ok(toolbarStart !== -1 && tableStart > toolbarStart, 'ledger toolbar markup found');
  assert.match(toolbar, /xl:grid-cols-\[minmax\(170px,1fr\)_minmax\(225px,1\.25fr\)_minmax\(165px,1fr\)_max-content_max-content\]/);
  const controls = [
    toolbar.indexOf('<AppSelect'),
    toolbar.indexOf('<AppDateRangePicker'),
    toolbar.indexOf('<Input'),
    toolbar.indexOf('<ArrowDownToLine'),
    toolbar.indexOf('<Printer')
  ];
  assert.ok(controls.every((position, index) => position >= 0 && (!index || position > controls[index - 1])));
  assert.doesNotMatch(toolbar, /aria-live="polite"|ledger-closing-balance|\{closing < 0/);
});

test('closing balance and date mode are right-aligned in the ledger card header, not beside Export', () => {
  assert.ok(headerEnd > tableStart, 'ledger table header found');
  assert.match(ledgerHeader, /flex-col gap-2.*sm:flex-row sm:items-center sm:justify-between/);
  assert.match(ledgerHeader, /accountingAccountLabel\(account, terminologyMode\)/);
  assert.match(ledgerHeader, /data-testid="ledger-closing-balance"/);
  assert.match(ledgerHeader, /className="shrink-0 text-left sm:text-right" aria-live="polite"/);
  assert.match(ledgerHeader, /dateView === 'transaction' \? 'Transaction Date' : 'Created Date'/);
  assert.match(ledgerHeader, /\{text\('Balance','জের'\)\} \{closing < 0 \? '−' : ''\}\{taka\(Math.abs\(closing\)\)\}/);
});

test('smaller screens reflow filters and the header without clipping', () => {
  assert.match(toolbar, /grid-cols-1/);
  assert.match(toolbar, /sm:grid-cols-2/);
  assert.match(toolbar, /md:grid-cols-\[/);
  assert.doesNotMatch(toolbar, /overflow-hidden/);
  assert.match(ledgerHeader, /flex-col gap-2/);
});

test('compact layout preserves selection, search, date filters, balance calculation, export and print', () => {
  assert.match(toolbar, /setAccountId\(next\.id\)/);
  assert.match(toolbar, /setFrom\(range\.from\); setTo\(range\.to\)/);
  assert.match(toolbar, /onChange=\{\(event\) => setSearch\(event\.target\.value\)\}/);
  assert.match(toolbar, /downloadCsv\(account\.name, rows\)/);
  assert.match(toolbar, /onClick=\{printLedger\}/);
  assert.match(toolbar, /aria-label=\{text\('Search account ledger'/);
  assert.match(toolbar, /label=\{text\('Ledger account'/);
  assert.match(toolbar, /label=\{text\('Account ledger date range'/);
  assert.match(view, /const closing = rows\.at\(-1\)\?\.balance \?\? 0;/);
});
