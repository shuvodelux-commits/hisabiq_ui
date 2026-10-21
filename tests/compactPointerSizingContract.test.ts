import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');

test('coarse pointer sizes standalone actions instead of every native ERP button', () => {
  const css = read('src/index.css');
  const start = css.indexOf('/* Coarse-pointer sizing belongs');
  const end = css.indexOf('/* ERP field centering', start);
  assert.ok(start !== -1 && end > start, 'scoped touch rule exists');
  const rule = css.slice(start, end);

  assert.match(rule, /\.hisabiq-button:not\(\[data-compact-control\]\)/);
  assert.match(rule, /button\[role="combobox"\]:not\(\[data-compact-control\]\)/);
  assert.match(rule, /:not\(\:where\(td input, th input, \[data-numeric-joined\] input\)\)/);
  assert.doesNotMatch(rule, /\.erp-workspace button:not\(/);
  assert.doesNotMatch(rule, /\[data-dialog-root\] button:not\(/);
  assert.match(css, /\[data-cart-row\] input, \[data-cart-row\] button \{ min-height: 44px; \}/, 'cart touch sizing remains');
});

test('Sales table ledger link explicitly keeps compact inline sizing and navigation', () => {
  const source = read('src/pages/Sales.tsx');
  const start = source.indexOf("filtered.map((invoice) => (");
  const link = source.indexOf('data-compact-control', start);
  assert.ok(start !== -1 && link > start, 'Sales row marks linked customer as compact');
  const surrounding = source.slice(link - 180, link + 270);
  assert.match(surrounding, /button[\s\S]*data-compact-control/);
  assert.match(surrounding, /event\.stopPropagation\(\); navigate\(/);
  assert.match(surrounding, /leading-5 text-teal-700/);
  assert.match(source.slice(link, link + 700), /invoice\.phone/, 'phone stays next to customer link');
});

test('clear input remains a compact native button, not a primary action', () => {
  const source = read('src/components/Input.tsx');
  assert.match(source, /<button type="button" aria-label=\{'Clear '/);
  assert.match(source, /size-7 -translate-y-1\/2/);
});
