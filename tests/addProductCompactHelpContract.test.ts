import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = (path: string) => readFileSync(path, 'utf8');

test('Add Product retains required field markers and help behind compact tooltip controls', () => {
  const field = source('src/components/products/fields/FormField.tsx');
  const details = source('src/components/products/form/ProductDetailsSection.tsx');
  const prices = source('src/components/products/form/PriceStockSection.tsx');
  assert.match(field, /optional && !required/);
  assert.match(field, /text-danger/);
  assert.match(field, /<Tooltip content={help}/);
  assert.match(details, /id="pf-name"[^\n]*required/);
  for (const id of ['pf-nameBn', 'pf-brand', 'pf-category', 'pf-unit']) assert.ok(details.includes(id));
  assert.match(details, /id="pf-category"[^\n]*required/);
  assert.match(details, /en="Unit"[\s\S]*?required[\s\S]*?error={errors\.unit}/);
  for (const id of ['pf-buy', 'pf-opening', 'pf-min']) assert.ok(prices.includes('id="'+id+'"'));
  assert.match(prices, /required={isStock}/);
  assert.match(prices, /id="pf-sell"[\s\S]*?required[\s\S]*?help=/);
});

test('one minimal additional settings list contains all seven direct options and no nested disclosures', () => {
  const other = source('src/components/products/form/OtherOptionsPanel.tsx');
  const disclosure = source('src/components/products/fields/Disclosure.tsx');
  const units = source('src/components/products/form/AdvancedStockPanel.tsx');
  const unitPrices = source('src/components/products/form/UnitPricesPanel.tsx');
  const bar = source('src/components/products/form/ActionBar.tsx');
  for (const name of ['Multiple units', 'Unit prices', 'Warranty', 'Serial numbers', 'Expiry & batch', 'Barcode / SKU', 'Photos']) {
    assert.ok(other.includes(name), name + ' visible as a direct setting');
  }
  assert.match(other, /data-product-additional-settings/);
  assert.match(other, /border-t border-border/);
  assert.match(disclosure, /data-product-settings-row/);
  assert.match(disclosure, /aria-expanded={open}/);
  assert.doesNotMatch(disclosure, /border-t border-border|divide-y|<hr/);
  assert.doesNotMatch(units, /<Disclosure|<details/);
  assert.doesNotMatch(other, /<details|Other options|Advanced stock/);
  assert.match(unitPrices, /<MoneyUnitInput/);
  assert.match(bar, /onClick={onCancel}/);
});

test('warranty, serial and expiry keep existing conditional controls and live validation', () => {
  const warranty = source('src/components/products/form/WarrantySettings.tsx');
  const serial = source('src/components/products/form/SerialSettings.tsx');
  const expiry = source('src/components/products/form/ExpirySettings.tsx');
  const toggle = source('src/components/products/fields/ToggleRow.tsx');
  const other = source('src/components/products/form/OtherOptionsPanel.tsx');
  const unitPrice = source('src/components/products/form/UnitPricesPanel.tsx');
  assert.match(toggle, /<Tooltip interactive compact content={help}/);
  assert.match(warranty, /help={t\('Separate from serial numbers/);
  assert.match(warranty, /draft\.warrantyEnabled/);
  assert.match(serial, /aria-live="polite"/);
  assert.match(expiry, /draft\.expiryEnabled/);
  assert.match(expiry, /help={t\(allocation\.hintEn, allocation\.hintBn\)}/);
  assert.match(other, /draft\.multiUnit \? \[/);
  assert.match(unitPrice, /basePrice|basePurchasePrice/);
});

test('field tooltip remains keyboard interactive and outside the field label', () => {
  const tooltip = source('src/components/Tooltip.tsx');
  const field = source('src/components/products/fields/FormField.tsx');
  assert.match(tooltip, /onClick={show}/);
  assert.match(tooltip, /onFocus={show}/);
  assert.match(tooltip, /event\.key==='Escape'/);
  assert.ok(field.indexOf('</label>') < field.indexOf('<Tooltip'));
});
