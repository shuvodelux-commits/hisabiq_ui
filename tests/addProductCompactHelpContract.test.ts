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
  assert.match(advanced, /help={draft\.multiUnit/);
  assert.match(other, /help={isStock/);
  assert.doesNotMatch(other, /parts\.length \? parts\.join/);
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

test('advanced helpers are on-demand, but live feedback and constraints remain inline', () => {
  const advanced = source('src/components/products/form/AdvancedStockPanel.tsx');
  const warranty = source('src/components/products/form/WarrantySettings.tsx');
  const serial = source('src/components/products/form/SerialSettings.tsx');
  const expiry = source('src/components/products/form/ExpirySettings.tsx');
  const other = source('src/components/products/form/OtherOptionsPanel.tsx');
  const toggle = source('src/components/products/fields/ToggleRow.tsx');
  const header = source('src/components/products/AddProductDialog.tsx');

  assert.match(toggle, /<Tooltip interactive compact content={help}/);
  assert.match(warranty, /help={t\('Separate from serial numbers/);
  assert.match(warranty, /optional[\s\S]*?help={t\('Printed on the invoice/);
  assert.doesNotMatch(serial, /<p className="mt-2 text-\[13px\] text-ink-600">/);
  assert.match(serial, /content={t\(mode\.hintEn, mode\.hintBn\)}/);
  assert.match(serial, /aria-live="polite"/);
  assert.match(expiry, /help={t\(allocation\.hintEn, allocation\.hintBn\)}/);
  assert.match(expiry, /help={t\('Stock can’t come in without an expiry date/);
  assert.doesNotMatch(expiry, /Batch and dates are asked when stock comes in/);
  assert.match(advanced, /<Tooltip interactive compact/);
  assert.match(advanced, /aria-live="polite"/);
  assert.match(advanced, /unitsLocked &&/);
  assert.match(advanced, /errorCount={errorCount}/);
  assert.doesNotMatch(advanced, /hint={level\.purchasePrice \?/);
  assert.match(other, /en="Photos"[\s\S]*?optional[\s\S]*?help=/);
  assert.doesNotMatch(other, /summary={summary}/);
  assert.doesNotMatch(header, /Fill the top part and save/);
});
