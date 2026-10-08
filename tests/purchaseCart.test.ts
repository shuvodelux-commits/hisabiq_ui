import test from 'node:test';
import assert from 'node:assert/strict';
import { baseQty, baseCost, lineAmount, lotBaseSellPrice, makePurchaseLine, priceInUnit } from '../src/utils/purchaseCart.ts';

const box = {
  id: 'p2', name: 'LED Bulb 12W', sku: 'LED', category: 'Electrical',
  unit: 'Pcs', altUnit: { unit: 'Box', factor: 10 }, stock: 20, minStock: 0,
  purchasePrice: 128, sellPrice: 165, active: true
};

test('purchase quantity uses large + small units, like POS', () => {
  const line = { ...makePurchaseLine(box), bigQty: '2', smallQty: '5' };
  assert.equal(baseQty(line), 25);
  assert.equal(lineAmount({ ...line, cost: '1500', costUnit: 'Box' }), 3750);
});
test('lot selling price is independently editable and converts between units', () => {
  const line = { ...makePurchaseLine(box), lotSellPrice: '185', lotSellUnit: 'Pcs' };
  assert.equal(lotBaseSellPrice(line), 185);
  assert.equal(priceInUnit(lotBaseSellPrice(line), box, 'Box'), 1850);
  assert.equal(priceInUnit(baseCost({ ...line, cost: '1500', costUnit: 'Box' }), box, 'Pcs'), 150);
});
test('new purchase lines capture an initial lot selling price without mutating product price', () => {
  const line = makePurchaseLine(box);
  assert.equal(line.lotSellUnit, 'Box');
  assert.equal(line.lotSellPrice, '1650');
  assert.equal(lotBaseSellPrice(line), 165);
  assert.equal(box.sellPrice, 165);
  assert.equal(line.detailsOpen, false);
});
