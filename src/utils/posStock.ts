import type { Product, StockLot } from '../types/erp';
import { productStockBreakdown } from './productFeatures';

export function saleAvailableStock(product: Product, lots: StockLot[], now = new Date()): number {
  if (product.kind === 'Service') return Number.POSITIVE_INFINITY;
  if (product.expiry?.enabled) return Math.max(0, productStockBreakdown(product, lots, now).sellable);
  return Math.max(0, product.stock);
}

export function saleStockShortage(product: Product, lots: StockLot[], requestedBaseQty: number, now = new Date()): number {
  if (product.kind === 'Service') return 0;
  return Math.max(0, requestedBaseQty - saleAvailableStock(product, lots, now));
}

export function quantityFromBaseStock(baseQty: number, factor: number, useAlternateUnit: boolean) {
  const safe = Math.max(0, baseQty);
  if (!useAlternateUnit || factor <= 1) {
    return { qty: String(safe), secondaryQty: '' };
  }
  const primary = Math.floor(safe / factor);
  const secondary = safe - primary * factor;
  return {
    qty: String(primary),
    secondaryQty: secondary > 0 ? String(secondary) : ''
  };
}

export function blendedVendorUnitCost(
  requestedBaseQty: number,
  availableOwnStock: number,
  ownUnitCost: number,
  vendorUnitCost: number
): number {
  if (requestedBaseQty <= 0) return ownUnitCost;
  const ownQty = Math.min(Math.max(availableOwnStock, 0), requestedBaseQty);
  const vendorQty = Math.max(0, requestedBaseQty - ownQty);
  return (ownQty * ownUnitCost + vendorQty * vendorUnitCost) / requestedBaseQty;
}
