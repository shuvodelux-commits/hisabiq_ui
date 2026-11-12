import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/**
 * MOD-002 T01A — authenticated read-only Nest product endpoints.
 * Source: packages/core-contracts/src/products.ts and ProductsController
 * at nestshererp adoption 2005609f4e367ceabd1e2ac4a9aee18444c9314a.
 *
 * This is the LEGACY simple product representation, not an advanced unit
 * profile. Do not flatten the existing HisabIQ multi-unit cart or send writes.
 */
export type ServerProductStatus = 'ACTIVE' | 'INACTIVE';
export type ServerProductStockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'ZERO_STOCK' | 'NEGATIVE_STOCK';
export type ServerProductDiscount = 'FIXED_AMOUNT' | 'PERCENTAGE';

export interface ServerProductConversion {
  unitId: string;
  unitName: string;
  factorQty: number; // Server scale-3 integer, never a JS quantity in base units
}
export interface ServerProduct {
  id: string;
  name: string;
  displayName: string;
  brandId: string | null;
  brandName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  parentCategoryName: string | null;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  baseUnitId: string;
  baseUnitName: string;
  sellingPriceMinor: number; // Poisha, per base unit
  /** Server must omit this key without inventory.cost.view; null and zero differ. */
  purchasePriceMinor?: number;
  minStockQty: number; // Base unit quantity scale 3
  status: ServerProductStatus;
  defaultDiscountType: ServerProductDiscount | null;
  defaultDiscountValue: number | null;
  offerEnabled: boolean;
  offerPriceMinor: number | null;
  offerStartDate: string | null; // Tenant-local YYYY-MM-DD; not a UTC instant
  offerEndDate: string | null;
  offerLive: boolean;
  hasImage: boolean;
  tracksExpiry: boolean;
  tracksSerial: boolean;
  conversion: ServerProductConversion | null;
  stockQty: number; // Base unit quantity scale 3, may be negative
  /** Server must omit this key without inventory.cost.view. */
  stockValueMinor?: number;
  stockStatus: ServerProductStockStatus;
  hasStockHistory: boolean;
  usualSupplierId: string | null;
  usualSupplierName: string | null;
  minOrderQty: number | null;
  warrantyMonths: number | null;
  supplierWarrantyMonths: number | null;
  version: number;
}
export interface ServerProductSummary {
  total: number;
  active: number;
  inactive: number;
  withoutBarcode: number;
}
export interface ServerProductList {
  data: ServerProduct[];
  page: { nextCursor: string | null; hasMore: boolean };
  summary: ServerProductSummary;
}
export interface ServerProductEnvelope { data: ServerProduct }

export interface ServerProductQuery {
  search?: string;
  brandId?: string;
  categoryId?: string;
  status?: ServerProductStatus;
  cursor?: string;
  limit?: number;
  sort?: 'name' | 'barcode' | 'categoryName' | 'unitName' | 'sellingPrice' |
    'purchasePrice' | 'minStockQty' | 'status';
  direction?: 'ASC' | 'DESC';
}

const ulid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const date = /^\d{4}-\d{2}-\d{2}$/;
const required = [
  'id','name','displayName','brandId','brandName','categoryId','categoryName',
  'parentCategoryName','sku','barcode','description','baseUnitId','baseUnitName',
  'sellingPriceMinor','minStockQty','status','defaultDiscountType','defaultDiscountValue',
  'offerEnabled','offerPriceMinor','offerStartDate','offerEndDate','offerLive',
  'hasImage','tracksExpiry','tracksSerial','conversion','stockQty','stockStatus',
  'hasStockHistory','usualSupplierId','usualSupplierName','minOrderQty',
  'warrantyMonths','supplierWarrantyMonths','version',
] as const;
const optional = ['purchasePriceMinor', 'stockValueMinor'] as const;
const nullableText = [
  'brandName','categoryName','parentCategoryName','sku','barcode','description',
  'usualSupplierName',
] as const;
const nullableId = ['brandId','categoryId','usualSupplierId'] as const;
const nullableInteger = [
  'defaultDiscountValue','offerPriceMinor','minOrderQty','warrantyMonths',
  'supplierWarrantyMonths',
] as const;
const flags = [
  'offerEnabled','offerLive','hasImage','tracksExpiry','tracksSerial','hasStockHistory',
] as const;
const queryFields = [
  'search','brandId','categoryId','status','cursor','limit','sort','direction',
] as const;
const sorts = [
  'name','barcode','categoryName','unitName','sellingPrice','purchasePrice',
  'minStockQty','status',
] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Products response or request could not be verified');
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function requiredKeys(value: Record<string, unknown>): boolean {
  const allowed: readonly string[] = [...required, ...optional];
  return required.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
    Object.keys(value).every(key => allowed.includes(key));
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && ulid.test(value);
}
function nullableIdValue(value: unknown): boolean {
  return value === null || validId(value);
}
function nullableTextValue(value: unknown): boolean {
  return value === null || typeof value === 'string';
}
function integer(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}
function nullableInt(value: unknown): boolean {
  return value === null || integer(value);
}
function nullableDate(value: unknown): boolean {
  return value === null || (typeof value === 'string' && date.test(value));
}
function conversion(value: unknown): value is ServerProductConversion {
  return record(value) && exactKeys(value, ['unitId','unitName','factorQty']) &&
    validId(value.unitId) && typeof value.unitName === 'string' &&
    integer(value.factorQty) && value.factorQty > 0;
}
function product(value: unknown): value is ServerProduct {
  if (!record(value) || !requiredKeys(value)) return false;
  return validId(value.id) && validId(value.baseUnitId) &&
    typeof value.name === 'string' &&
    typeof value.displayName === 'string' &&
    typeof value.baseUnitName === 'string' &&
    nullableId.every(key => nullableIdValue(value[key])) &&
    nullableText.every(key => nullableTextValue(value[key])) &&
    integer(value.sellingPriceMinor) && integer(value.minStockQty) &&
    integer(value.stockQty) && integer(value.version) && value.version >= 0 &&
    optional.every(key => !Object.prototype.hasOwnProperty.call(value, key) || integer(value[key])) &&
    nullableInteger.every(key => nullableInt(value[key])) &&
    flags.every(key => typeof value[key] === 'boolean') &&
    (value.status === 'ACTIVE' || value.status === 'INACTIVE') &&
    (value.defaultDiscountType === null ||
      value.defaultDiscountType === 'FIXED_AMOUNT' ||
      value.defaultDiscountType === 'PERCENTAGE') &&
    nullableDate(value.offerStartDate) && nullableDate(value.offerEndDate) &&
    (value.conversion === null || conversion(value.conversion)) &&
    ['IN_STOCK','LOW_STOCK','ZERO_STOCK','NEGATIVE_STOCK'].includes(String(value.stockStatus));
}

export function decodeProduct(raw: unknown): ServerProductEnvelope {
  if (!record(raw) || !exactKeys(raw, ['data']) || !product(raw.data)) return invalid();
  return raw as unknown as ServerProductEnvelope;
}
export function decodeProductList(raw: unknown): ServerProductList {
  if (!record(raw) || !exactKeys(raw, ['data','page','summary']) ||
      !Array.isArray(raw.data) || !raw.data.every(product) ||
      !record(raw.page) || !exactKeys(raw.page, ['nextCursor','hasMore']) ||
      (raw.page.nextCursor !== null && !validId(raw.page.nextCursor)) ||
      typeof raw.page.hasMore !== 'boolean' ||
      !record(raw.summary) ||
      !exactKeys(raw.summary, ['total','active','inactive','withoutBarcode']) ||
      !Object.values(raw.summary).every(value => integer(value) && value >= 0)) return invalid();
  return raw as unknown as ServerProductList;
}

/** Only the strict Nest ProductQuery allowlist is permitted; no implicit stock filter. */
function queryPath(query: ServerProductQuery): `/api/v1/${string}` {
  if (!record(query) || Object.keys(query).some(key => !queryFields.includes(key as typeof queryFields[number]))) {
    return invalid();
  }
  const params = new URLSearchParams();
  for (const key of queryFields) {
    const value: unknown = query[key];
    if (value === undefined) continue;
    if (key === 'search') {
      if (typeof value !== 'string' || value.trim().length > 120) return invalid();
      params.set(key, value.trim());
    } else if (key === 'limit') {
      if (!integer(value) || value < 1 || value > 200) return invalid();
      params.set(key, String(value));
    } else if (key === 'status') {
      if (value !== 'ACTIVE' && value !== 'INACTIVE') return invalid();
      params.set(key, value);
    } else if (key === 'sort') {
      if (typeof value !== 'string' || !sorts.includes(value as typeof sorts[number])) return invalid();
      params.set(key, value);
    } else if (key === 'direction') {
      if (value !== 'ASC' && value !== 'DESC') return invalid();
      params.set(key, value);
    } else {
      if (!validId(value)) return invalid();
      params.set(key, value);
    }
  }
  const suffix = params.toString();
  return suffix ? `/api/v1/products?${suffix}` : '/api/v1/products';
}

async function read<T>(
  accessToken: string,
  path: `/api/v1/${string}`,
  decode: (raw: unknown) => T,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<T> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'GET',
      path,
      accessToken,
      signal: controller.signal,
    }, decode);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}

/** No in-memory cache; each call is scoped to the caller's verified access token. */
export function readProducts(
  accessToken: string,
  query: ServerProductQuery = {},
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerProductList> {
  return read(accessToken, queryPath(query), decodeProductList, signal, timeoutMs);
}

export function readProduct(
  accessToken: string,
  productId: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerProductEnvelope> {
  if (!validId(productId)) return Promise.reject(new ApiError('protocol', 'Invalid product ID'));
  return read(accessToken, `/api/v1/products/${productId}`, decodeProduct, signal, timeoutMs);
}
