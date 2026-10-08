import type { LedgerEntry, Party, Product, Purchase, StockLot } from '../types/erp';
import { purchases as seedPurchases, expenseCategories } from './purchases';
import { ledgerEntries as seedLedgerEntries } from './parties';
import { dispatchPartyPreview, getPartyPreviewSnapshot } from './partyPreviewStore';
import { products as seedProducts, productCategories } from './products';
import { stockLots as seedLots } from './productInventory';

/** Design-preview state only: no network posting or cross-tenant persistence. */
const createdProducts: Product[] = [];
const createdProductCategories: string[] = [];
const createdProductBrands: string[] = [];
const createdProductUnits: ProductUnitOption[] = [];
const createdCategories: string[] = [];
const createdPurchases: Purchase[] = [];

export const availableProducts = () => [...seedProducts, ...createdProducts].map((product) => ({
  ...product,
  stock: product.stock + createdPurchases.reduce((sum, purchase) =>
    sum + (purchase.inventoryLines ?? []).filter((line) => line.productId === product.id).reduce((qty, line) => qty + line.quantity, 0), 0)
}));
export type ProductUnitOption = { name: string; symbol: string };
const initialProductUnits: ProductUnitOption[] = [
  { name: 'Piece', symbol: 'Pcs' }, { name: 'Gira', symbol: 'Gira' },
  { name: 'Kilogram', symbol: 'Kg' }, { name: 'Feet', symbol: 'Feet' },
  { name: 'Bag', symbol: 'Bag' }, { name: 'Coil', symbol: 'Coil' },
  { name: 'Pair', symbol: 'Pair' }, { name: 'Litre', symbol: 'Litre' },
  { name: 'Box', symbol: 'Box' }, { name: 'Gauge', symbol: 'Gauge' }
];
const seedBrands = ['Generic / No brand', 'RFL', 'Vision', 'Shah Cement'];
const isSame = (left: string, right: string) => left.toLocaleLowerCase() === right.toLocaleLowerCase();
export const availableProductCategories = () => [...productCategories, ...createdProductCategories];
export const availableProductBrands = () => [...seedBrands, ...createdProductBrands];
export const availableProductUnits = (): ProductUnitOption[] => {
  const units = [...initialProductUnits, ...createdProductUnits];
  for (const product of [...seedProducts, ...createdProducts]) {
    for (const symbol of [product.unit, product.altUnit?.unit]) {
      if (symbol && !units.some((item) => isSame(item.symbol, symbol)))
        units.push({ name: symbol, symbol });
    }
  }
  return units;
};
export function createPreviewProductBrand(name: string) {
  const trimmed = name.trim();
  if (trimmed && !availableProductBrands().some((item) => isSame(item, trimmed)))
    createdProductBrands.push(trimmed);
}
export function createPreviewProductUnit(name: string, symbol: string) {
  const cleanedName = name.trim(), cleanedSymbol = (symbol.trim() || cleanedName);
  if (cleanedName && cleanedSymbol && !availableProductUnits().some((item) =>
    isSame(item.name, cleanedName) || isSame(item.symbol, cleanedSymbol)))
    createdProductUnits.push({ name: cleanedName, symbol: cleanedSymbol });
}
export const availableParties = () => getPartyPreviewSnapshot().parties.map((party) => ({
  ...party,
  balance: party.balance - createdPurchases.filter((purchase) => purchase.supplierId === party.id)
    .reduce((sum, purchase) => sum + purchase.total - purchase.paid, 0)
}));
export const availableLedgerEntries = (): LedgerEntry[] => [
  ...seedLedgerEntries,
  ...createdPurchases.flatMap((purchase) => [
    { id: purchase.id + '-bill', partyId: purchase.supplierId, date: purchase.date, type: 'purchase' as const,
      ref: purchase.ref, description: purchase.items, debit: 0, credit: purchase.total },
    ...(purchase.paid > 0 ? [{ id: purchase.id + '-payment', partyId: purchase.supplierId, date: purchase.date,
      type: 'payment' as const, ref: purchase.ref, description: 'Purchase payment', debit: purchase.paid, credit: 0 }] : [])
  ])
];
export const availableExpenseCategories = () => [...expenseCategories, ...createdCategories];
export const availablePurchases = () => [...createdPurchases, ...seedPurchases];

/** Purchase lots in the design preview; in the backend each lot will be posted atomically with its purchase. */
export const availableStockLots = (): StockLot[] => [
  ...createdPurchases.flatMap((purchase) => (purchase.inventoryLines ?? []).map((line, index) => ({
    id: purchase.id + '-lot-' + index,
    productId: line.productId,
    label: 'Purchase lot',
    receivedAt: purchase.date,
    quantity: line.quantity,
    available: line.quantity,
    unitCost: line.unitCost ?? 0,
    sellingPrice: line.lotSellingPrice,
    source: 'Purchase' as const,
    reference: purchase.ref,
    serials: line.serials,
    batchNumber: line.batchNumber,
    manufactureDate: line.manufactureDate,
    expiryDate: line.expiryDate
  }))),
  ...seedLots
];


export function createPreviewProductCategory(category: string) {
  if (!availableProductCategories().some((item) => item.toLowerCase() === category.toLowerCase())) createdProductCategories.push(category);
}
export function createPreviewProduct(product: Product) {
  if (!availableProducts().some((item) => item.id === product.id)) createdProducts.push(product);
}
export function createPreviewParty(party: Party) {
  if (!getPartyPreviewSnapshot().parties.some((item) => item.id === party.id)) {
    dispatchPartyPreview({type:'create-party',party});
  }
}
export function createPreviewExpenseCategory(category: string) {
  if (!availableExpenseCategories().some((item) => item.toLowerCase() === category.toLowerCase())) createdCategories.push(category);
}
export function createPreviewPurchase(purchase: Purchase) {
  if (!availablePurchases().some((item) => item.id === purchase.id)) createdPurchases.unshift(purchase);
}
