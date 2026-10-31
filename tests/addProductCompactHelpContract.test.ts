import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = (path: string) => readFileSync(path, 'utf8');

test('Add Product labels distinguish required, optional, and contextual help', () => {
  const field = source('src/components/products/fields/FormField.tsx');
  const details = source('src/components/products/form/ProductDetailsSection.tsx');
  const prices = source('src/components/products/form/PriceStockSection.tsx');

  assert.match(field, /optional && !required/);
  assert.match(field, /text-danger/);
  assert.match(field, /<Tooltip content={help}/);
  assert.match(field, /interactive compact/);
  assert.match(details, /id="pf-name"[^\n]*required/);
  assert.match(details, /id="pf-nameBn"[\s\S]*?optional[\s\S]*?help=/);
  for (const id of ['pf-brand', 'pf-category', 'pf-unit']) {
    assert.match(details, new RegExp('id="'+id+'"[^>]*optional', 's'));
  }
  for (const id of ['pf-buy', 'pf-opening', 'pf-min']) {
    assert.match(prices, new RegExp('id="'+id+'"[^>]*optional', 's'));
  }
  assert.match(prices, /id="pf-sell"[\s\S]*?required[\s\S]*?help=/);
});

test('static descriptions move to help; live calculations and errors remain visible', () => {
  const prices = source('src/components/products/form/PriceStockSection.tsx');
  const details = source('src/components/products/form/ProductDetailsSection.tsx');
  const advanced = source('src/components/products/form/AdvancedStockPanel.tsx');
  const other = source('src/components/products/form/OtherOptionsPanel.tsx');
  const disclosure = source('src/components/products/fields/Disclosure.tsx');
  const bar = source('src/components/products/form/ActionBar.tsx');

  assert.match(prices, /hint={buyEcho \|\| undefined}/);
  assert.match(prices, /hint={sellEcho \|\| undefined}/);
  assert.match(prices, /hint={qtyHint\(draft\.minQty, x\.minUnit\)}/);
  assert.match(details, /hint={form\.unitsLocked \?/);
  assert.match(advanced, /summary = draft\.multiUnit \?/);
  assert.match(other, /parts\.length \? parts\.join/);
  assert.match(disclosure, /summary &&/);
  assert.match(disclosure, /help &&/);
  assert.doesNotMatch(bar, /Only the English name and selling price are required/);
});

test('help tooltip is interactive and not nested inside the field label', () => {
  const tooltip = source('src/components/Tooltip.tsx');
  const field = source('src/components/products/fields/FormField.tsx');
  assert.match(tooltip, /onClick={show}/);
  assert.match(tooltip, /onFocus={show}/);
  assert.match(tooltip, /event\.key==='Escape'/);
  assert.match(tooltip, /before:-inset-1\.5/);
  assert.ok(field.indexOf('</label>') < field.indexOf('<Tooltip'), 'help is outside label');
});
