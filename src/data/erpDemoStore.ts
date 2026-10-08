import type { Party, Product, Purchase } from '../types/erp';
import { purchases as seedPurchases, expenseCategories } from './purchases';
import { parties as seedParties } from './parties';
import { products as seedProducts, productCategories } from './products';

/** Design-preview state only: no network posting or cross-tenant persistence. */
const createdProducts: Product[] = [];
const createdProductCategories: string[] = [];
const createdParties: Party[] = [];
const createdCategories: string[] = [];
const createdPurchases: Purchase[] = [];

export const availableProducts = () => [...seedProducts, ...createdProducts];
export const availableProductCategories = () => [...productCategories, ...createdProductCategories];
export const availableParties = () => [...seedParties, ...createdParties];
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
