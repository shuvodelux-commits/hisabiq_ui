import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/**
 * MOD-002 T01A: read only. Source contract:
 * nestshererp packages/core-contracts/src/catalog.ts and CatalogController.list.
 * The existing response is {data:{units,brands,categories,features}}.
 * Unsupported Bengali labels and symbols are NOT inferred from English names.
 */
export interface ServerCatalogEntry {
  id: string;
  name: string;
}
export interface ServerCategory extends ServerCatalogEntry {
  parentId: string | null;
}
export interface ServerCatalogFeatures {
  productOffers: boolean;
  expiryTracking: boolean;
  serialTracking: boolean;
  warranty: boolean;
  customerGroups: boolean;
  vendors: boolean;
}
export interface ServerCatalog {
  units: ServerCatalogEntry[];
  brands: ServerCatalogEntry[];
  categories: ServerCategory[];
  features: ServerCatalogFeatures;
}
export interface ServerCatalogEnvelope {
  data: ServerCatalog;
}

const ulid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const featureKeys = [
  'productOffers', 'expiryTracking', 'serialTracking',
  'warranty', 'customerGroups', 'vendors',
] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Catalog response could not be verified');
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  return Object.keys(value).length === expected.length &&
    expected.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && ulid.test(value);
}
function entry(value: unknown): value is ServerCatalogEntry {
  return record(value) && keys(value, ['id', 'name']) &&
    validId(value.id) && typeof value.name === 'string';
}
function category(value: unknown): value is ServerCategory {
  return record(value) && keys(value, ['id', 'name', 'parentId']) &&
    validId(value.id) && typeof value.name === 'string' &&
    (value.parentId === null || validId(value.parentId));
}
function features(value: unknown): value is ServerCatalogFeatures {
  return record(value) && keys(value, featureKeys) &&
    featureKeys.every(key => typeof value[key] === 'boolean');
}

/** Reject extra/missing keys rather than accidentally displaying partial mock-like state. */
export function decodeCatalog(raw: unknown): ServerCatalogEnvelope {
  if (!record(raw) || !keys(raw, ['data']) || !record(raw.data)) return invalid();
  const data = raw.data;
  if (!keys(data, ['units', 'brands', 'categories', 'features']) ||
      !Array.isArray(data.units) || !data.units.every(entry) ||
      !Array.isArray(data.brands) || !data.brands.every(entry) ||
      !Array.isArray(data.categories) || !data.categories.every(category) ||
      !features(data.features)) return invalid();
  return raw as unknown as ServerCatalogEnvelope;
}

/** One authorized GET; no global cache, mutation, fixture fallback or retry. */
export async function readCatalog(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerCatalogEnvelope> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'GET',
      path: '/api/v1/catalog',
      accessToken,
      signal: controller.signal,
    }, decodeCatalog);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
