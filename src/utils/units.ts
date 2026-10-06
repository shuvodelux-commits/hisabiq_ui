import type { Product } from '../types/erp';

/** "34 Box 2 Pcs" for multi-unit products, "86 Pcs" otherwise */
export function formatStock(product: Product): string {
  const { stock, unit, altUnit } = product;
  if (!altUnit) return `${stock.toLocaleString('en-IN')} ${unit}`;
  const big = Math.floor(stock / altUnit.factor);
  const rest = stock % altUnit.factor;
  if (big === 0) return `${rest} ${unit}`;
  return rest === 0 ? `${big} ${altUnit.unit}` : `${big} ${altUnit.unit} ${rest} ${unit}`;
}

export function unitsFor(product: Product): string[] {
  return product.altUnit ? [product.unit, product.altUnit.unit] : [product.unit];
}

export function priceFor(product: Product, unit: string): number {
  if (product.altUnit && unit === product.altUnit.unit) {
    return product.altUnit.price ?? product.sellPrice * product.altUnit.factor;
  }
  return product.sellPrice;
}

export type StockStatus = 'in' | 'low' | 'out' | 'inactive';

export function stockStatus(product: Product): StockStatus {
  if (!product.active) return 'inactive';
  if (product.stock <= 0) return 'out';
  if (product.stock <= product.minStock) return 'low';
  return 'in';
}