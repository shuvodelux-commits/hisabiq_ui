import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import { decodeProduct, type ServerProductEnvelope } from './products.ts';

/**
 * MOD-002 T01B/P3: legacy SIMPLE create only.
 *
 * The actual HisabIQ ProductDraft contains richer product kind, bilingual
 * names, independent multilevel unit prices, serial/warranty/expiry policies,
 * offers, lots and opening stock. Never map that draft to this strict legacy
 * DTO: unknown or absent keys fail closed rather than silently disappearing.
 *
 * This endpoint does not open stock, post journals or activate the React form.
 * Advanced product writes need a separately approved versioned server contract.
 */
export interface ServerSimpleProductCreateInput {
  name: string;
  baseUnitId: string;
  purchasePriceMinor: number;
  sellingPriceMinor: number;
  minStockQty: number;
  brandId: string | null;
  categoryId: string | null;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  defaultDiscountType: 'FIXED_AMOUNT' | 'PERCENTAGE' | null;
  defaultDiscountValue: number | null;
  offerEnabled: boolean;
  offerPriceMinor: number | null;
  offerStartDate: string | null;
  offerEndDate: string | null;
  tracksExpiry: boolean;
  tracksSerial: boolean;
  conversionUnitId: string | null;
  conversionFactorQty: number | null;
  usualSupplierId: string | null;
  minOrderQty: number | null;
  warrantyMonths: number | null;
  supplierWarrantyMonths: number | null;
}

const allowedKeys = [
  'name', 'baseUnitId', 'purchasePriceMinor', 'sellingPriceMinor', 'minStockQty',
  'brandId', 'categoryId', 'sku', 'barcode', 'description',
  'defaultDiscountType', 'defaultDiscountValue',
  'offerEnabled', 'offerPriceMinor', 'offerStartDate', 'offerEndDate',
  'tracksExpiry', 'tracksSerial', 'conversionUnitId', 'conversionFactorQty',
  'usualSupplierId', 'minOrderQty', 'warrantyMonths', 'supplierWarrantyMonths',
] as const;
const ulidPattern = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const dayPattern = /^\d{4}-\d{2}-\d{2}$/;

function invalid(): never {
  throw new ApiError('protocol', 'Simple product command is invalid or requires the advanced product contract');
}
function isRecord(raw: unknown): raw is Record<string, unknown> {
  return raw !== null && typeof raw === 'object' && !Array.isArray(raw);
}
function isUlid(value: unknown): value is string {
  return typeof value === 'string' && ulidPattern.test(value);
}
function isOptionalId(value: unknown): boolean {
  return value === null || isUlid(value);
}
function isSafeNonnegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function isOptionalPositiveInteger(value: unknown, max = Number.MAX_SAFE_INTEGER): boolean {
  return value === null || (isSafeNonnegativeInteger(value) && value > 0 && value <= max);
}
function isOptionalNonnegativeInteger(value: unknown): boolean {
  return value === null || isSafeNonnegativeInteger(value);
}
function isOptionalText(value: unknown, max: number): boolean {
  return value === null || (typeof value === 'string' && value.length <= max);
}
function isOptionalDay(value: unknown): boolean {
  return value === null || (typeof value === 'string' && dayPattern.test(value));
}

export function verifySimpleCreate(raw: unknown): ServerSimpleProductCreateInput {
  if (!isRecord(raw) || Object.keys(raw).length !== allowedKeys.length ||
      !allowedKeys.every(key => Object.prototype.hasOwnProperty.call(raw, key))) return invalid();

  // Validate every field; no implicit defaulting, stripping or coercion to the
  // single-conversion, whole-poisha legacy server request contract.
  if (typeof raw.name !== 'string' || raw.name.trim().length < 1 ||
      raw.name.trim().length > 200 || raw.name !== raw.name.trim() ||
      !isUlid(raw.baseUnitId) ||
      !isSafeNonnegativeInteger(raw.purchasePriceMinor) ||
      !isSafeNonnegativeInteger(raw.sellingPriceMinor) ||
      !isSafeNonnegativeInteger(raw.minStockQty) ||
      !isOptionalId(raw.brandId) || !isOptionalId(raw.categoryId) ||
      !isOptionalText(raw.sku, 60) || !isOptionalText(raw.barcode, 60) ||
      !isOptionalText(raw.description, 2000) ||
      (raw.defaultDiscountType !== null &&
       raw.defaultDiscountType !== 'FIXED_AMOUNT' &&
       raw.defaultDiscountType !== 'PERCENTAGE') ||
      !isOptionalNonnegativeInteger(raw.defaultDiscountValue) ||
      (raw.defaultDiscountType === null) !== (raw.defaultDiscountValue === null) ||
      typeof raw.offerEnabled !== 'boolean' ||
      !isOptionalNonnegativeInteger(raw.offerPriceMinor) ||
      !isOptionalDay(raw.offerStartDate) || !isOptionalDay(raw.offerEndDate) ||
      typeof raw.tracksExpiry !== 'boolean' ||
      typeof raw.tracksSerial !== 'boolean' ||
      !isOptionalId(raw.conversionUnitId) ||
      !isOptionalPositiveInteger(raw.conversionFactorQty) ||
      (raw.conversionUnitId === null) !== (raw.conversionFactorQty === null) ||
      (raw.conversionUnitId !== null && raw.conversionUnitId === raw.baseUnitId) ||
      !isOptionalId(raw.usualSupplierId) ||
      !isOptionalPositiveInteger(raw.minOrderQty) ||
      !isOptionalPositiveInteger(raw.warrantyMonths, 600) ||
      !isOptionalPositiveInteger(raw.supplierWarrantyMonths, 600)) return invalid();

  return raw as unknown as ServerSimpleProductCreateInput;
}

/**
 * Submit a caller-verified SIMPLE product only.
 * The operationId must come from a durable, uniquely identified create intent.
 * If the response is lost, keep the intent/draft unconfirmed and reconcile
 * server state before any explicit same-operationId recovery. Never silently
 * replay, generate a replacement operationId, or claim a preview success.
 */
export async function createSimpleProduct(
  accessToken: string,
  operationId: string,
  input: ServerSimpleProductCreateInput,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerProductEnvelope> {
  if (!isUlid(operationId) || !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const complete = verifySimpleCreate(input);
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'POST',
      path: '/api/v1/products',
      accessToken,
      operationId,
      body: complete,
      signal: controller.signal,
    }, decodeProduct);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
