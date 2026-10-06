import test from 'node:test';
import assert from 'node:assert/strict';
import { toBasePrice, toBaseQuantity } from '../src/utils/productEntry.ts';

test('converts a selling price entered in the larger unit to the base unit price', () => {
  assert.equal(toBasePrice('1550', 'Box', 'Pcs', 'Box', 10), 155);
  assert.equal(toBasePrice('180', 'Gauge', 'Gira', 'Gauge', 16), 11.25);
  assert.equal(toBasePrice('165', 'Pcs', 'Pcs', 'Box', 10), 165);
});

test('converts opening and minimum stock entered in a larger unit to base quantity', () => {
  assert.equal(toBaseQuantity('2', 'Box', 'Pcs', 'Box', 10), 20);
  assert.equal(toBaseQuantity('1.5', 'Box', 'Pcs', 'Box', 10), 15);
  assert.equal(toBaseQuantity('7', 'Pcs', 'Pcs', 'Box', 10), 7);
});
