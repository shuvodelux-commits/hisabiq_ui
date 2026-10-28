import test from 'node:test';
import assert from 'node:assert/strict';
import type { Product, StockLot } from '../src/types/erp.ts';
import { sellingPriceForStockLot, resolveLotSalePrice } from '../src/utils/lotSellingPrice.ts';

const product: Product = {
  id: 'p-lot', kind: 'Stock', name: 'LED Bulb', sku: 'LED-12',
  category: 'Electrical', unit: 'Pcs', altUnit: { unit: 'Box', factor: 10, price: 1440 },
  stock: 30, minStock: 0, sellPrice: 150, purchasePrice: 120, active: true
};
const lot = (id: string, source: StockLot['source'], quantity: number, sellingPrice?: number, receivedAt = '2026-10-01'): StockLot => ({
  id, productId: product.id, label: id, receivedAt, quantity, available: quantity,
  unitCost: 120, source, ...(sellingPrice === undefined ? {} : {sellingPrice})
});

test('opening stock always inherits product default, regardless of a stale lot price', () => {
  assert.equal(sellingPriceForStockLot(product, lot('open', 'Opening', 10), 'Pcs'), 150);
  assert.equal(sellingPriceForStockLot(product, lot('legacy-open', 'Opening', 10, 170), 'Pcs'), 150);
  assert.equal(sellingPriceForStockLot(product, lot('open', 'Opening', 10), 'Box'), 1440);
});

test('purchase lot price is optional, and does not mutate the master selling price', () => {
  assert.equal(sellingPriceForStockLot(product, lot('purchase', 'Purchase', 20, 175), 'Pcs'), 175);
  assert.equal(sellingPriceForStockLot(product, lot('purchase', 'Purchase', 20, 175), 'Box'), 1750);
  assert.equal(sellingPriceForStockLot(product, lot('purchase', 'Purchase', 20), 'Pcs'), 150);
  assert.equal(sellingPriceForStockLot(product, lot('purchase', 'Purchase', 20), 'Box'), 1440);
  assert.equal(product.sellPrice, 150);
});

test('product-level override wins without deleting existing lot prices', () => {
  const selected = {...product, useDefaultPriceForAllLots: true};
  const purchased = lot('purchase', 'Purchase', 20, 175);
  assert.equal(sellingPriceForStockLot(selected, purchased, 'Pcs'), 150);
  assert.equal(sellingPriceForStockLot(selected, purchased, 'Box'), 1440);
  assert.equal(purchased.sellingPrice, 175);
  assert.equal(sellingPriceForStockLot({...selected, useDefaultPriceForAllLots: false}, purchased, 'Pcs'), 175);
});

test('POS chooses allocated lot price; a mixed-price line is explicitly flagged', () => {
  const lots = [lot('old', 'Opening', 10), lot('new', 'Purchase', 20, 175, '2026-10-15')];
  assert.deepEqual(resolveLotSalePrice(product, 'Pcs', 5, lots), {price:150, mixed:false, source:'product'});
  assert.deepEqual(resolveLotSalePrice(product, 'Pcs', 12, lots), {price:150, mixed:true, source:'product'});
  assert.deepEqual(resolveLotSalePrice(product, 'Pcs', 5, [lots[1]]), {price:175, mixed:false, source:'lot'});
  assert.deepEqual(resolveLotSalePrice({...product, useDefaultPriceForAllLots:true}, 'Pcs', 12, lots), {price:150, mixed:false, source:'product'});
});

test('multi-unit prices stay custom when a purchase lot inherits product default', () => {
  const purchased = lot('new', 'Purchase', 10);
  assert.equal(sellingPriceForStockLot(product, purchased, 'Box'), 1440);
  assert.equal(sellingPriceForStockLot(product, lot('different', 'Purchase', 10, 175), 'Box'), 1750);
});
