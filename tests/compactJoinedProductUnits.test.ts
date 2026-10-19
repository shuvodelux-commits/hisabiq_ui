import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const field = readFileSync(new URL('../src/components/MoneyUnitInput.tsx', import.meta.url), 'utf8');
const form = readFileSync(new URL('../src/components/products/AddProductDialog.tsx', import.meta.url), 'utf8');

test('product conversion rows repeat compact joined quantity and unit controls', () => {
  assert.match(form, /data-product-unit-relationship[\s\S]*?<QuantityUnitInput compact readOnlyAmount[\s\S]*?<QuantityUnitInput compact[\s\S]*?value=\{row\.quantity\}/);
  assert.match(form, /unitRows\.map\(\(row, index\)/);
  assert.match(form, /Add another unit/);
  assert.match(form, /setUnitRows\(previous => \[/);
  assert.match(form, /unitRelations: isStock && multiUnit/);
  assert.match(form, /resolveUnitChain\(configuredRelations\)/);
  assert.match(form, /Manage Units/);
});

test('joined unit editor uses HisabIQ portal dropdown, compact stepper and one outer border', () => {
  assert.match(field, /data-numeric-joined/);
  assert.match(field, /stepperCompact=\{compact && !readOnlyAmount\}/);
  assert.match(field, /readOnly=\{readOnlyAmount\}/);
  assert.match(field, /<AppSelect /);
  assert.match(field, /w-\[86px\]/);
  assert.match(form, /resolveUnitChain\(configuredRelations\)/);
  assert.match(form, /Add another unit/);
  assert.match(form, /unitRelations: isStock && multiUnit/);
});
