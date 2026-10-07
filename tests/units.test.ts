import test from 'node:test';
import assert from 'node:assert/strict';
import { formatStock } from '../src/utils/units.ts';
import type { Product } from '../src/types/erp.ts';

const product: Product = {
  id: 'test',
  name: 'Test product',
  sku: 'TEST-1',
  category: 'Hardware',
  unit: 'Pcs',
  altUnit: { unit: 'Box', factor: 10 },
  stock: 25,
  minStock: 0,
  sellPrice: 10,
  purchasePrice: 8,
  active: true
};

test('formats positive compound stock', () => {
  assert.equal(formatStock(product), '2 Box 5 Pcs');
});

test('formats negative compound stock without awkward floor division', () => {
  assert.equal(formatStock({ ...product, stock: -5 }), '-5 Pcs');
  assert.equal(formatStock({ ...product, stock: -25 }), '-2 Box 5 Pcs');
});


test('respects base-unit stock view preference', () => {
  assert.equal(formatStock({ ...product, stockViewUnit: 'Pcs' }), '25 Pcs');
});

test('keeps compound stock when larger unit is the preferred view', () => {
  assert.equal(formatStock({ ...product, stockViewUnit: 'Box' }), '2 Box 5 Pcs');
});
