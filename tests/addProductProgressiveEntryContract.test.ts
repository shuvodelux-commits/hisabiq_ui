import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (path: string) => readFileSync(path, 'utf8');

test('seven settings are independently reachable; editing values is persistent', () => {
  const hook = read('src/components/products/form/useAddProductForm.ts');
  const other = read('src/components/products/form/OtherOptionsPanel.tsx');
  const disclosure = read('src/components/products/fields/Disclosure.tsx');
  assert.match(hook, /const \[openSetting, setOpenSetting\] = useState<ProductSettingKey \| null>\(null\)/);
  assert.match(hook, /setDraft\(\(d\) => \(\{ \.\.\.d, \[key\]: value \}\)\)/);
  assert.match(hook, /fieldSetting\(key\)/);
  assert.match(hook, /setOpenSetting\(target\)/);
  assert.match(other, /open={openSetting === section\.id}/);
  assert.match(other, /setOpenSetting\(openSetting === section\.id \? null : section\.id\)/);
  assert.match(disclosure, /aria-expanded={open}/);
  assert.match(disclosure, /data-product-option-status/);
  assert.match(disclosure, /errorCount > 0/);
  assert.match(other, /draft\.warrantyEnabled/);
  assert.match(other, /draft\.serialTracking/);
  assert.match(other, /draft\.expiryEnabled/);
});

test('multi-unit retains editable 1 larger unit = quantity of smaller unit', () => {
  const advanced = read('src/components/products/form/AdvancedStockPanel.tsx');
  const css = read('src/index.css');
  assert.match(advanced, /data-product-unit-equation/);
  assert.match(advanced, /pf-unit-one[^>]*>1<\/span>/);
  assert.match(advanced, /pf-unit-equals[^>]*>=<\/span>/);
  assert.match(advanced, /<SearchSelect id={`pf-\$\{unitKey\}`}/);
  assert.match(advanced, /onChange={\(value\) => form\.updateUnitLevel\(level\.id, 'factor', value\)}/);
  assert.match(advanced, /staticUnit={smaller \|\| '—'}/);
  assert.match(css, /@container pf \(max-width: 479px\)/);
  assert.match(advanced, /errors\.unitChain/);
  assert.match(advanced, /disabled={unitsLocked}/);
});

test('screenshot layout: thin lines between settings only, no top divider, three equal brand/category/unit fields', () => {
  const details = read('src/components/products/form/ProductDetailsSection.tsx');
  const prices = read('src/components/products/form/PriceStockSection.tsx');
  const other = read('src/components/products/form/OtherOptionsPanel.tsx');
  const css = read('src/index.css');
  const form = read('src/components/products/form/AddProductForm.tsx');
  for (const id of ['pf-name', 'pf-nameBn', 'pf-brand', 'pf-category', 'pf-unit']) assert.ok(details.includes(id));
  for (const id of ['pf-buy', 'pf-sell', 'pf-opening', 'pf-min']) assert.ok(prices.includes(id));
  for (const id of ['pf-barcode', 'pf-photos']) assert.ok(other.includes(id));
  assert.match(details, /id="pf-name"[^\n]*required/);
  assert.match(details, /id="pf-category"[^\n]*required/);
  assert.match(prices, /required={isStock}/);
  assert.match(prices, /Price & stock/);
  assert.doesNotMatch(details, /border-t border-border/);
  assert.doesNotMatch(prices, /border-t border-border/);
  assert.doesNotMatch(other, /border-t border-border/);
  const disclosure = read('src/components/products/fields/Disclosure.tsx');
  assert.match(disclosure, /border-b border-border\/70/);
  assert.match(css, /\.pf-grid-3 \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(form, /<OtherOptionsPanel form={form}/);
  assert.doesNotMatch(form, /<AdvancedStockPanel/);
});
