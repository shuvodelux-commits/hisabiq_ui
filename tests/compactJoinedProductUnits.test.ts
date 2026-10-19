import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const field = readFileSync(new URL('../src/components/MoneyUnitInput.tsx', import.meta.url), 'utf8');
const form = readFileSync(new URL('../src/components/products/AddProductDialog.tsx', import.meta.url), 'utf8');

test('product conversion rows use two compact joined quantity and unit controls', () => {
  const row = form.match(/data-product-unit-relationship[\s\S]*?<\/div>/)?.[0];
  assert.ok(row, 'a unit relationship should use the shared joined field shell');
  assert.match(row, /<QuantityUnitInput compact readOnlyAmount/);
  assert.match(row, /<QuantityUnitInput compact[\s\S]*?value=\{factor\}/);
  assert.doesNotMatch(row, /<Input /, 'do not use a separate numeric field alongside a unit selector');
});

test('joined unit editor uses HisabIQ portal dropdown, compact stepper and one outer border', () => {
  assert.match(field, /data-numeric-joined/);
  assert.match(field, /stepperCompact=\{compact\}/);
  assert.match(field, /readOnly=\{readOnlyAmount\}/);
  assert.match(field, /<AppSelect /);
  assert.match(field, /w-\[86px\]/);
  assert.match(form, /Number\(factor\) <= 1/);
});
