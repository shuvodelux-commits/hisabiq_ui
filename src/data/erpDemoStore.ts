import type { LedgerEntry, Party, Product, Purchase } from '../types/erp';
import { purchases as seedPurchases, expenseCategories } from './purchases';
import { parties as seedParties, ledgerEntries as seedLedgerEntries } from './parties';
import { products as seedProducts, productCategories } from './products';

/** Design-preview state only: no network posting or cross-tenant persistence. */
const createdProducts: Product[] = [];
const createdProductCategories: string[] = [];
const createdParties: Party[] = [];
const createdCategories: string[] = [];
const createdPurchases: Purchase[] = [];

export const availableProducts = () => [...seedProducts, ...createdProducts].map((product) => ({
  ...product,
  stock: product.stock + createdPurchases.reduce((sum, purchase) =>
    sum + (purchase.inventoryLines ?? []).filter((line) => line.productId === product.id).reduce((qty, line) => qty + line.quantity, 0), 0)
}));
export const availableProductCategories = () => [...productCategories, ...createdProductCategories];
export const availableParties = () => [...seedParties, ...createdParties].map((party) => ({
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

export function createPreviewProductCategory(category: string) {
  if (!availableProductCategories().some((item) => item.toLowerCase() === category.toLowerCase())) createdProductCategories.push(category);
}
export function createPreviewProduct(product: Product) {
  if (!availableProducts().some((item) => item.id === product.id)) createdProducts.push(product);
}
export function createPreviewParty(party: Party) {
  if (!availableParties().some((item) => item.id === party.id)) createdParties.push(party);
}
export function createPreviewExpenseCategory(category: string) {
  if (!availableExpenseCategories().some((item) => item.toLowerCase() === category.toLowerCase())) createdCategories.push(category);
}
export function createPreviewPurchase(purchase: Purchase) {
  if (!availablePurchases().some((item) => item.id === purchase.id)) createdPurchases.unshift(purchase);
}
