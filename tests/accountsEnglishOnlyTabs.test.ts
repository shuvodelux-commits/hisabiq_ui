import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/pages/Accounts.tsx', 'utf8');
const navStart = source.indexOf('// Compact English-only tab labels; Bangla guidance remains inside each panel.');
const navEnd = source.indexOf('  ];', navStart);
const tabDeclaration = source.slice(navStart, navEnd + 4);
const stripStart = source.indexOf('<MotionTabList');
const stripEnd = source.indexOf('</MotionTabList>', stripStart);
const tabStrip = source.slice(stripStart, stripEnd);

test('Accounts & Vouchers tabs have seven English-only labels in their original order', () => {
  assert.ok(navStart >= 0 && stripStart >= 0 && stripEnd > stripStart);
  const labels = [...tabDeclaration.matchAll(/\['([^']+)', '([^']+)'\]/g)].map((match) => [match[1], match[2]]);
  assert.deepEqual(labels, [
    ['overview', 'Overview'],
    ['vouchers', 'Vouchers'],
    ['ledger', 'Ledger'],
    ['trial', 'Trial Balance'],
    ['statements', 'Statements'],
    ['chart', 'Chart of Accounts'],
    ['bank-entry', 'Bank Entry']
  ]);
  assert.doesNotMatch(tabDeclaration, /text\(|[\u0980-\u09FF]/u);
});

test('only the navigation helper labels are removed, while the existing underline and selection remain', () => {
  assert.match(tabStrip, /tabs\.map\(\(\[id, label\]\) =>/);
  assert.match(tabStrip, /role="tab"/);
  assert.match(tabStrip, /aria-selected=\{tab === id\}/);
  assert.match(tabStrip, /onClick=\{\(\) => chooseTab\(id\)\}/);
  assert.match(tabStrip, /<MotionTabIndicator active=\{tab === id\}/);
  assert.doesNotMatch(tabStrip, /showHelper|font-bn|\{helper\}|text\(/);
});

test('Bangla helper copy remains in the voucher content and financial cards', () => {
  assert.match(source, /কোথা থেকে হিসাব এসেছে এবং কে এন্ট্রি করেছেন/);
  assert.match(source, /text\('Vouchers & postings','ভাউচার ও হিসাব এন্ট্রি'\)/);
  assert.match(source, /helper: 'সব খরচের পর লাভ'/);
  assert.match(source, /font-bn text-\[10\.5px\] text-ink-400">\{helper\}/);
});
