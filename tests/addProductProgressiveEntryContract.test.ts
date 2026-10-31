import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(path, 'utf8');

test('existing multi-unit, warranty and expiry products start compact without losing draft state', () => {
  const hook = read('src/components/products/form/useAddProductForm.ts');
  const disclosure = read('src/components/products/fields/Disclosure.tsx');
  const advanced = read('src/components/products/form/AdvancedStockPanel.tsx');
  const other = read('src/components/products/form/OtherOptionsPanel.tsx');

  assert.match(hook, /const \[advancedOpen, setAdvancedOpen\] = useState\(false\)/);
  assert.match(hook, /const \[otherOpen, setOtherOpen\] = useState\(false\)/);
  assert.match(hook, /sections\.has\('advanced'\)/);
  assert.match(hook, /sections\.has\('other'\)/);
  assert.match(hook, /setAdvancedOpen\(true\)/);
  assert.match(hook, /setOtherOpen\(true\)/);
  assert.match(disclosure, /aria-expanded={open}/);
  assert.match(disclosure, /data-product-option-status/);
  assert.match(disclosure, /errorCount > 0/);
  assert.match(advanced, /status={draft\.multiUnit/);
  assert.match(other, /status={status}/);
  assert.match(other, /draft\.warrantyEnabled/);
  assert.match(other, /draft\.serialTracking !== 'Off'/);
  assert.match(other, /draft\.expiryEnabled/);
});

test('multi-unit input displays an equation without changing source unit conversions', () => {
  const advanced = read('src/components/products/form/AdvancedStockPanel.tsx');
  const css = read('src/index.css');

  assert.match(advanced, /data-product-unit-equation/);
  assert.match(advanced, /pf-unit-one[^>]*>1<\/span>/);
  assert.match(advanced, /pf-unit-equals[^>]*>=<\/span>/);
  assert.match(advanced, /<SearchSelect id={`pf-\$\{unitKey\}`}/);
  assert.match(advanced, /onChange={\(value\) => form\.updateUnitLevel\(level\.id, 'factor', value\)}/);
  assert.match(advanced, /staticUnit={smaller \|\| '—'}/);
  assert.match(css, /@container pf \(max-width: 479px\)/);
  assert.match(css, /\.pf-unit-ratio \{ grid-column: 2; grid-row: 2; \}/);
  assert.match(advanced, /errors\.unitChain/);
  assert.match(advanced, /disabled={unitsLocked}/);
});

test('compact spacing preserves all data fields and explicit required markers', () => {
  const details = read('src/components/products/form/ProductDetailsSection.tsx');
  const prices = read('src/components/products/form/PriceStockSection.tsx');
  const other = read('src/components/products/form/OtherOptionsPanel.tsx');
  const disclosure = read('src/components/products/fields/Disclosure.tsx');

  for (const id of ['pf-name', 'pf-nameBn', 'pf-brand', 'pf-category', 'pf-unit']) assert.ok(details.includes(id));
  for (const id of ['pf-buy', 'pf-sell', 'pf-opening', 'pf-min']) assert.ok(prices.includes(id));
  for (const id of ['pf-barcode', 'pf-photos']) assert.ok(other.includes(id));
  assert.match(details, /id="pf-name"[^\n]*required/);
  assert.match(prices, /id="pf-sell"[\s\S]*?required/);
  assert.match(disclosure, /pb-4 pt-1/);
  assert.match(details, /px-4 py-4 md:px-6 md:py-5/);
  assert.match(prices, /px-4 py-4 md:px-6 md:py-5/);
});
