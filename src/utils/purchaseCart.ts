import type { Product } from '../types/erp';

/** The purchase cart retains the entered display unit while storing base-unit snapshots. */
export type PurchaseCartLine = {
  id: string;
  product: Product;
  bigQty: string;
  smallQty: string;
  cost: string;
  costUnit: string;
  lotSellPrice: string;
  lotSellUnit: string;
  detailsOpen: boolean;
  serialText: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
};

export const amountOf = (value: string): number => Math.max(0, Number(value) || 0);
export const rounded = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
export const conversion = (product: Product): number => product.altUnit?.factor || 1;

export function baseQty(line: PurchaseCartLine): number {
  return amountOf(line.bigQty) * (line.product.altUnit ? conversion(line.product) : 0) + amountOf(line.smallQty);
}

export function priceInUnit(basePrice: number, product: Product, unit: string): number {
  return basePrice * (product.altUnit?.unit === unit ? conversion(product) : 1);
}

export function baseCost(line: PurchaseCartLine): number {
  return amountOf(line.cost) / (line.product.altUnit?.unit === line.costUnit ? conversion(line.product) : 1);
}

export function lotBaseSellPrice(line: PurchaseCartLine): number {
  return amountOf(line.lotSellPrice) / (line.product.altUnit?.unit === line.lotSellUnit ? conversion(line.product) : 1);
}

export function lineAmount(line: PurchaseCartLine): number {
  return rounded(baseQty(line) * baseCost(line));
}

export function describeQty(line: PurchaseCartLine): string {
  const big = amountOf(line.bigQty), small = amountOf(line.smallQty);
  const parts: string[] = [];
  if (line.product.altUnit && big > 0) parts.push(big + ' ' + line.product.altUnit.unit);
  if (small > 0) parts.push(small + ' ' + line.product.unit);
  return parts.join(' ') || '0 ' + line.product.unit;
}

export function makePurchaseLine(product: Product): PurchaseCartLine {
  const useLarge = Boolean(product.altUnit);
  const unit = product.altUnit?.unit ?? product.unit;
  return {
    id: 'line-' + Math.random().toString(36).slice(2, 11),
    product, bigQty: useLarge ? '1' : '0', smallQty: useLarge ? '0' : '1',
    costUnit: unit, cost: String(rounded(priceInUnit(product.purchasePrice, product, unit))),
    lotSellUnit: unit, lotSellPrice: String(rounded(priceInUnit(product.sellPrice, product, unit))),
    detailsOpen: (product.serialTracking !== undefined && product.serialTracking !== 'Off') ||
      Boolean(product.expiry?.enabled),
    serialText: '', batchNumber: '', manufactureDate: '', expiryDate: ''
  };
}

/**
 * Switch the purchase row like POS (one base-unit input, compound large-unit input).
 * Preserve the purchased base-unit quantity and per-base-unit cost; never rewrite lot pricing.
 */
export function switchPurchaseUnit(line: PurchaseCartLine, nextUnit: string): PurchaseCartLine {
  const { product } = line;
  if (nextUnit === line.costUnit || ![product.unit, product.altUnit?.unit].includes(nextUnit)) return line;
  if (!product.altUnit) return line;

  const quantity = baseQty(line);
  const unitCost = baseCost(line);
  const bigSelected = nextUnit === product.altUnit.unit;
  const large = bigSelected ? Math.floor(quantity / conversion(product)) : 0;
  const small = bigSelected
    ? Number((quantity - large * conversion(product)).toFixed(4))
    : quantity;

  return {
    ...line,
    costUnit: nextUnit,
    bigQty: String(large),
    smallQty: String(small),
    cost: line.cost.trim() === '' ? '' : String(Math.round(priceInUnit(unitCost, product, nextUnit) * 10000) / 10000)
  };
}
