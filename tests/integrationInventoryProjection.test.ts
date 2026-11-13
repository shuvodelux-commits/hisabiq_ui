import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import type {
  InventoryOverviewEnvelope, InventoryLotPageEnvelope,
  InventoryAdjustmentsEnvelope,
} from '../src/integration/inventory.ts';
import type { ServerProduct, ServerProductList } from '../src/integration/products.ts';
import { projectInventoryPresentation } from '../src/integration/inventory-projection.ts';

const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const unknownId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const primaryLocation = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const secondLocation = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const sourceId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const lotId = '01ARZ3NDEKTSV4RRFFQ69G5FB0';
const scope = 'tenant-A/session-v7';

const product: ServerProduct = {
  id: productId, name: 'Copper wire', displayName: 'Copper wire', brandId: null,
  brandName: null, categoryId: null, categoryName: null, parentCategoryName: null,
  sku: 'COP-1', barcode: null, description: null, baseUnitId: primaryLocation,
  baseUnitName: 'Feet', sellingPriceMinor: 1200, minStockQty: 1000,
  status: 'ACTIVE', defaultDiscountType: null, defaultDiscountValue: null,
  offerEnabled: false, offerPriceMinor: null, offerStartDate: null, offerEndDate: null,
  offerLive: false, hasImage: false, tracksExpiry: false, tracksSerial: false,
  conversion: null, stockQty: 9000, stockStatus: 'IN_STOCK', hasStockHistory: true,
  usualSupplierId: null, usualSupplierName: null, minOrderQty: null,
  warrantyMonths: null, supplierWarrantyMonths: null, version: 3,
};
const products: ServerProductList = {
  data: [product], page: { nextCursor: null, hasMore: false },
  summary: { total: 1, active: 1, inactive: 0, withoutBarcode: 1 },
};
const stock = {
  productId, productName: 'Copper wire', productStatus: 'ACTIVE' as const,
  baseUnitName: 'Feet', tracksExpiry: false,
  locationId: primaryLocation, locationName: 'Main',
  qtyOnHand: 4500, minStockQty: 1000, stockStatus: 'LOW_STOCK' as const,
};
const movement = {
  id: sourceId, productId, productName: 'Copper wire', locationName: 'Main',
  lotId, qty: 2500, direction: 'OUT' as const, sourceType: 'SALE',
  sourceId, sourceNumber: 'SAL-2', businessDate: '2026-11-13',
  createdAt: '2026-11-13T10:00:00.000Z',
};
const overview: InventoryOverviewEnvelope = { data: { stock: [stock], movements: [movement] } };
const lot = {
  id: lotId, productId, productName: 'Copper wire', locationId: primaryLocation,
  locationName: 'Main', ownerType: 'OWNED' as const, sourceType: 'PURCHASE',
  sourceId, sourceNumber: 'PUR-99', qtyReceived: 5500, qtyRemaining: 4500,
  expiryDate: null, status: 'OPEN' as const, businessDate: '2026-11-10',
};
const lots: InventoryLotPageEnvelope = {
  data: {
    data: [lot], page: { nextCursor: lotId, hasMore: true },
    valuationMethod: 'FIFO', expiry: {
      expiredCount: 0, soonCount: 0, missingCount: 1, warnDays: 30,
    },
  },
};
const adjustment = {
  id: sourceId, number: 'ADJ-101', productId, productName: 'Copper wire',
  locationName: 'Main', qtyDelta: -1000, direction: 'OUT' as const, qty: 1000,
  reason: 'DAMAGE' as const, note: 'Cracked', businessDate: '2026-11-13',
  createdAt: '2026-11-13T10:00:00.000Z', createdByName: 'Owner',
};
const adjustments: InventoryAdjustmentsEnvelope = { data: [adjustment] };
function scoped<T>(value: T, id = scope): { scope: string; value: T } {
  return { scope: id, value };
}

test('stock remains authoritative per location and base scale-3, with separate product state', () => {
  const input: InventoryOverviewEnvelope = {
    data: { ...overview.data, stock: [
      { ...stock, valueMinor: 0 },
      { ...stock, locationId: secondLocation, locationName: 'Back room',
        qtyOnHand: 1000, stockStatus: 'OUT_STOCK' as never },
    ] },
  };
  // Adjust the second status to a real server enum, keeping product status independent.
  input.data.stock[1]!.stockStatus = 'NEGATIVE_STOCK';
  const result = projectInventoryPresentation({
    scope, inventory: scoped(input), products: scoped(products),
  });
  assert.equal(result.stock.state, 'loaded');
  if (result.stock.state !== 'loaded') return;
  assert.equal(result.stock.rows.length, 2);
  assert.equal(result.stock.rows[0]?.source.qtyOnHand, 4500);
  assert.equal(result.stock.rows[1]?.source.qtyOnHand, 1000);
  assert.equal(result.stock.rows[0]?.source.stockStatus, 'LOW_STOCK');
  assert.equal(result.stock.rows[0]?.product.state, 'matched');
  assert.equal(result.stock.rows[0]?.duplicateLocation, false);
  assert.equal(result.stock.rows[0]?.statusMismatch, false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.stock.rows[0]?.source, 'valueMinor'), true);
  assert.equal(result.stock.rows[0]?.source.valueMinor, 0);
  assert.equal(Object.prototype.hasOwnProperty.call(result.stock.rows[1]?.source, 'valueMinor'), false);
  assert.equal('totalValueMinor' in result, false);
  assert.equal('totalQty' in result, false);
});

test('unresolved catalog identity stays unresolved; never match a display name', () => {
  const input: InventoryOverviewEnvelope = {
    data: { stock: [{ ...stock, productId: unknownId }], movements: [] },
  };
  const result = projectInventoryPresentation({
    scope, inventory: scoped(input), products: scoped(products),
  });
  assert.equal(result.stock.state, 'loaded');
  if (result.stock.state !== 'loaded') return;
  assert.deepEqual(result.stock.rows[0]?.product, {
    state: 'unresolved', reason: 'not-in-provided-products',
  });
  assert.equal(result.stock.rows[0]?.source.productName, 'Copper wire');
});

test('duplicate product identities are ambiguous; duplicate stock-location keys are flagged, not summed', () => {
  const result = projectInventoryPresentation({
    scope, products: scoped({ ...products, data: [product, { ...product, name: 'conflict' }] }),
    inventory: scoped({ data: { stock: [stock, { ...stock, qtyOnHand: -2000 }], movements: [] } }),
  });
  assert.equal(result.stock.state, 'loaded');
  if (result.stock.state !== 'loaded') return;
  assert.equal(result.stock.rows.length, 2);
  assert.equal(result.stock.rows[0]?.product.state, 'ambiguous');
  assert.equal(result.stock.rows[0]?.duplicateLocation, true);
  assert.equal(result.stock.rows[1]?.duplicateLocation, true);
  assert.equal(result.stock.rows[1]?.source.qtyOnHand, -2000);
});

test('unit/status mismatches are flagged without changing backend values', () => {
  const result = projectInventoryPresentation({
    scope, inventory: scoped({ data: { stock: [{ ...stock,
      baseUnitName: 'Pcs', productStatus: 'INACTIVE' }], movements: [] } }),
    products: scoped(products),
  });
  assert.equal(result.stock.state, 'loaded');
  if (result.stock.state !== 'loaded') return;
  assert.equal(result.stock.rows[0]?.unitMismatch, true);
  assert.equal(result.stock.rows[0]?.statusMismatch, true);
  assert.equal(result.stock.rows[0]?.source.baseUnitName, 'Pcs');
  assert.equal(result.stock.rows[0]?.source.productStatus, 'INACTIVE');
  assert.equal(result.stock.rows[0]?.product.state, 'matched');
});

test('lots retain separate OWNED/VENDOR, costs, immutable source IDs, cursor and availability gaps', () => {
  const result = projectInventoryPresentation({
    scope, products: scoped(products),
    lots: scoped({ data: { ...lots.data, data: [
      { ...lot, actualUnitCost: 0, valueMinor: 0 },
      { ...lot, id: unknownId, ownerType: 'VENDOR', locationId: secondLocation,
        qtyRemaining: 2000, status: 'CLOSED', expiryDate: '2026-12-31' },
    ] } }),
  });
  assert.equal(result.lots.state, 'loaded');
  if (result.lots.state !== 'loaded') return;
  assert.equal(result.lots.rows[0]?.source.ownerType, 'OWNED');
  assert.equal(result.lots.rows[1]?.source.ownerType, 'VENDOR');
  assert.equal(result.lots.rows[1]?.source.locationId, secondLocation);
  assert.equal(result.lots.rows[0]?.source.sourceId, sourceId);
  assert.equal(result.lots.rows[0]?.source.actualUnitCost, 0);
  assert.equal(Object.prototype.hasOwnProperty.call(result.lots.rows[1]?.source, 'actualUnitCost'), false);
  assert.equal(result.lots.page.hasMore, true);
  assert.equal(result.lots.page.nextCursor, lotId);
  assert.equal(result.lots.valuationMethod, 'FIFO');
  assert.equal(result.lots.expiry?.missingCount, 1);
  assert.deepEqual(result.lots.rows[0]?.batchNumber, { state: 'unavailable', reason: 'not-in-api' });
  assert.deepEqual(result.lots.rows[0]?.manufactureDate, { state: 'unavailable', reason: 'not-in-api' });
  assert.deepEqual(result.lots.rows[0]?.serials, { state: 'unavailable', reason: 'not-in-api' });
  assert.deepEqual(result.lots.rows[0]?.lotSalePriceMinor, { state: 'unavailable', reason: 'not-in-api' });
  assert.equal('ownedQty' in result.lots, false);
  assert.equal('totalLotValue' in result.lots, false);
});

test('movements retain source, signed direction and no invented historical running balances or notes', () => {
  const result = projectInventoryPresentation({
    scope, inventory: scoped(overview), products: scoped(products),
  });
  assert.equal(result.movements.state, 'loaded');
  if (result.movements.state !== 'loaded') return;
  const row = result.movements.rows[0]!;
  assert.equal(result.movements.coverage, 'bounded');
  assert.equal(row.source.direction, 'OUT');
  assert.equal(row.source.qty, 2500);
  assert.equal(row.source.sourceType, 'SALE');
  assert.equal(row.source.sourceNumber, 'SAL-2');
  assert.deepEqual(row.runningBalance, { state: 'unavailable', reason: 'not-in-api' });
  assert.deepEqual(row.note, { state: 'unavailable', reason: 'not-in-api' });
  assert.equal('balance' in row.source, false);
  assert.equal('note' in row.source, false);
});

test('adjustments preserve server signed delta and note, without inferred valuation', () => {
  const result = projectInventoryPresentation({
    scope, adjustments: scoped(adjustments), products: scoped(products),
  });
  assert.equal(result.adjustments.state, 'loaded');
  if (result.adjustments.state !== 'loaded') return;
  assert.equal(result.adjustments.coverage, 'bounded');
  assert.equal(result.adjustments.rows[0]?.source.qtyDelta, -1000);
  assert.equal(result.adjustments.rows[0]?.source.note, 'Cracked');
  assert.equal(Object.prototype.hasOwnProperty.call(result.adjustments.rows[0]?.source, 'valueMinor'), false);
});

test('catalog page incomplete is represented as partial, not proof that other products are absent', () => {
  const result = projectInventoryPresentation({
    scope, inventory: scoped({ data: { stock: [{ ...stock, productId: unknownId }], movements: [] } }),
    products: scoped({ ...products, page: { nextCursor: unknownId, hasMore: true } }),
  });
  assert.equal(result.catalog.state, 'partial');
  assert.equal(result.stock.state, 'loaded');
  if (result.stock.state !== 'loaded') return;
  assert.equal(result.stock.rows[0]?.product.state, 'unresolved');
});

test('not-loaded input is distinct from a loaded empty response', () => {
  const nothing = projectInventoryPresentation({ scope });
  assert.equal(nothing.catalog.state, 'not-loaded');
  assert.equal(nothing.stock.state, 'not-loaded');
  assert.equal(nothing.lots.state, 'not-loaded');
  assert.equal(nothing.movements.state, 'not-loaded');
  assert.equal(nothing.adjustments.state, 'not-loaded');
  const empty = projectInventoryPresentation({
    scope, inventory: scoped({ data: { stock: [], movements: [] } }),
    lots: scoped({ data: { data: [], page: { nextCursor: null, hasMore: false },
      valuationMethod: 'AVERAGE' } }),
    adjustments: scoped({ data: [] }),
  });
  assert.equal(empty.stock.state, 'loaded');
  assert.equal(empty.movements.state, 'loaded');
  assert.equal(empty.lots.state, 'loaded');
  assert.equal(empty.adjustments.state, 'loaded');
  if (empty.lots.state === 'loaded') assert.equal(Object.prototype.hasOwnProperty.call(empty.lots, 'expiry'), false);
});

test('different caller-auth contexts cannot be assembled; no network requests are performed', () => {
  for (const key of ['products', 'inventory', 'lots', 'adjustments'] as const) {
    const input = { scope, products: scoped(products), inventory: scoped(overview),
      lots: scoped(lots), adjustments: scoped(adjustments) };
    (input as any)[key] = scoped((input as any)[key].value, 'tenant-B/session-v3');
    assert.throws(() => projectInventoryPresentation(input),
      (e: any) => e instanceof ApiError && e.kind === 'protocol');
  }
  for (const bad of ['', '  ', 'tenant-A\nsession']) {
    assert.throws(() => projectInventoryPresentation({ scope: bad }),
      (e: any) => e instanceof ApiError && e.kind === 'protocol');
  }
});

test('large safe integers and raw immutability (no floating point pricing or stock recomputation)', () => {
  const big = Number.MAX_SAFE_INTEGER;
  const input = { scope,
    inventory: scoped({ data: { stock: [{ ...stock, qtyOnHand: big }], movements: [movement] } }),
    products: scoped(products), lots: scoped(lots), adjustments: scoped(adjustments) };
  const before = JSON.stringify(input);
  const result = projectInventoryPresentation(input);
  assert.equal(result.stock.state, 'loaded');
  if (result.stock.state === 'loaded') assert.equal(result.stock.rows[0]?.source.qtyOnHand, big);
  assert.equal(JSON.stringify(input), before);
  assert.notStrictEqual(result.stock.state === 'loaded' && result.stock.rows[0]?.source,
    input.inventory.value.data.stock[0]);
  assert.equal('amountMinor' in result, false);
});
