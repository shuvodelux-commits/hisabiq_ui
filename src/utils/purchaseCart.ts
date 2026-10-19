import type { Product } from '../types/erp';
import {productUnitFactor} from './unitChain';
import {unitsFor} from './units';

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
export const selectedConversion = (line: PurchaseCartLine) => productUnitFactor(line.product, line.costUnit) || 1;

export function baseQty(line: PurchaseCartLine): number {
  return amountOf(line.bigQty) * (selectedConversion(line) > 1 ? selectedConversion(line) : 0) + amountOf(line.smallQty);
}

export function priceInUnit(basePrice: number, product: Product, unit: string): number {
  return basePrice * (productUnitFactor(product, unit) || 1);
}

export function baseCost(line: PurchaseCartLine): number {
  return amountOf(line.cost) / selectedConversion(line);
}

export function lotBaseSellPrice(line: PurchaseCartLine): number {
  return amountOf(line.lotSellPrice) / (productUnitFactor(line.product, line.lotSellUnit) || 1);
}

export function lineAmount(line: PurchaseCartLine): number {
  return rounded(baseQty(line) * baseCost(line));
}

export function describeQty(line: PurchaseCartLine): string {
  const big = amountOf(line.bigQty), small = amountOf(line.smallQty);
  const parts: string[] = [];
  if (selectedConversion(line) > 1 && big > 0) parts.push(big + ' ' + line.costUnit);
  if (small > 0) parts.push(small + ' ' + line.product.unit);
  return parts.join(' ') || '0 ' + line.product.unit;
}

export function makePurchaseLine(product: Product): PurchaseCartLine {
  const unit = product.stockViewUnit && unitsFor(product).includes(product.stockViewUnit)
    ? product.stockViewUnit : product.altUnit?.unit ?? product.unit;
  const useLarge = (productUnitFactor(product, unit) || 1) > 1;
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
  if (nextUnit === line.costUnit || !unitsFor(product).includes(nextUnit)) return line;

  const quantity = baseQty(line);
  const unitCost = baseCost(line);
  const factor = productUnitFactor(product, nextUnit) || 1;
  const bigSelected = factor > 1;
  const large = bigSelected ? Math.floor((quantity + 1e-9) / factor) : 0;
  const small = bigSelected
    ? Number((quantity - large * factor).toPrecision(12))
    : quantity;

  return {
    ...line,
    costUnit: nextUnit,
    bigQty: String(large),
    smallQty: String(small),
    cost: String(Math.round(priceInUnit(unitCost, product, nextUnit) * 10000) / 10000)
  };
}
