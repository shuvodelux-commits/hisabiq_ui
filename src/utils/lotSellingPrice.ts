import type { Product, ProductOffer, StockLot } from '../types/erp.ts';
import { productUnitFactor } from './unitChain.ts';
import { priceFor } from './units.ts';
import { activeOfferFor, allocateLotQuantity, effectivePriceForUnit } from './productFeatures.ts';

/** Product default is always used for opening stock and when no lot price was explicitly entered. */
export function sellingPriceForStockLot(product: Product, lot: StockLot, unit: string): number {
  if (product.useDefaultPriceForAllLots || lot.source === 'Opening' || lot.sellingPrice === undefined)
    return priceFor(product, unit);
  return lot.sellingPrice * productUnitFactor(product, unit);
}

function offeredPrice(product: Product, unit: string, base: number, offers: ProductOffer[]): number {
  const offer = activeOfferFor(product.id, offers);
  if (!offer) return base;
  if (offer.discountType === 'Percentage') return Math.max(0, base * (1 - offer.value / 100));
  const factor = productUnitFactor(product, unit);
  const offerFactor = productUnitFactor(product, offer.priceUnit);
  return Math.max(0, base - offer.value * factor / offerFactor);
}

/** POS preview's selected unit price, derived from the lots that FIFO/FEFO would allocate.
 * When a line spans differently priced lots it must be reviewed/split; we never silently average prices.
 */
export function resolveLotSalePrice(
  product: Product, unit: string, requestedBaseQty: number, lots: StockLot[], offers: ProductOffer[] = []
): { price: number; mixed: boolean; source: 'product' | 'lot' } {
  const defaultPrice = effectivePriceForUnit(product, activeOfferFor(product.id, offers), unit);
  if (product.kind === 'Bundle' || product.kind === 'Service' || product.useDefaultPriceForAllLots)
    return { price: defaultPrice, mixed: false, source: 'product' };
  const allocation = allocateLotQuantity(product, lots, requestedBaseQty);
  const sources = allocation.allocations.map(({ lotId }) => lots.find(lot => lot.id === lotId)).filter((lot): lot is StockLot => !!lot);
  if (!sources.length) return { price: defaultPrice, mixed: false, source: 'product' };
  const prices = sources.map(lot => offeredPrice(product, unit, sellingPriceForStockLot(product, lot, unit), offers));
  const mixed = prices.some(price => Math.abs(price - prices[0]) > 0.000001);
  const first = sources[0];
  return { price: prices[0], mixed, source: first.source === 'Opening' || first.sellingPrice === undefined ? 'product' : 'lot' };
}
