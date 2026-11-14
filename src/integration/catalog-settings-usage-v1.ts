import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/**
 * MOD-002 P7c — opt-in, read-only Product Settings usage transport.
 *
 * A "used by N products" count is DISTINCT nondeleted product references,
 * including inactive products and base/legacy/multi-unit conversion links.
 * It is NOT stock quantity, sales, conversion rows or a master active flag.
 *
 * This does not import the existing Product Settings UI or session bridge.
 * A caller may use it only after separately verifying the signed tenant
 * session and the backend's rollout/permissions. There is no cache, mock,
 * retry, optimistic update or legacy catalog fallback.
 */
export interface CatalogSettingsUsageV1Count {
  id: string;
  productCount: number;
}
export interface CatalogSettingsUsageV1CategoryCount {
  id: string;
  directProductCount: number;
  subtreeProductCount: number;
  parentState: 'root' | 'present' | 'unresolved';
}
export interface CatalogSettingsUsageV1Envelope {
  data: {
    units: CatalogSettingsUsageV1Count[];
    brands: CatalogSettingsUsageV1Count[];
    categories: CatalogSettingsUsageV1CategoryCount[];
    unresolved: {
      unitIds: string[];
      brandIds: string[];
      categoryIds: string[];
      parentIds: string[];
    };
  };
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const MASTER_KEYS = ['id', 'productCount'] as const;
const CATEGORY_KEYS = [
  'id', 'directProductCount', 'subtreeProductCount', 'parentState',
] as const;
const UNRESOLVED_KEYS = ['unitIds', 'brandIds', 'categoryIds', 'parentIds'] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Catalog usage response or request could not be verified');
}
function record(raw: unknown): raw is Record<string, unknown> {
  return raw !== null && typeof raw === 'object' && !Array.isArray(raw);
}
function exactKeys(raw: Record<string, unknown>, expected: readonly string[]): boolean {
  return Object.keys(raw).length === expected.length &&
    expected.every(key => Object.prototype.hasOwnProperty.call(raw, key));
}
function validId(raw: unknown): raw is string {
  return typeof raw === 'string' && ULID.test(raw);
}
function validCount(raw: unknown): raw is number {
  return typeof raw === 'number' && Number.isSafeInteger(raw) && raw >= 0;
}
function distinctList(
  raw: unknown,
  member: (value: unknown) => boolean,
  idOf: (value: unknown) => string,
): boolean {
  if (!Array.isArray(raw)) return false;
  const seen = new Set<string>();
  for (const value of raw) {
    if (!member(value)) return false;
    const id = idOf(value);
    if (seen.has(id)) return false;
    seen.add(id);
  }
  return true;
}
function countRow(raw: unknown): raw is CatalogSettingsUsageV1Count {
  return record(raw) && exactKeys(raw, MASTER_KEYS) &&
    validId(raw.id) && validCount(raw.productCount);
}
function categoryRow(raw: unknown): raw is CatalogSettingsUsageV1CategoryCount {
  return record(raw) && exactKeys(raw, CATEGORY_KEYS) && validId(raw.id) &&
    validCount(raw.directProductCount) && validCount(raw.subtreeProductCount) &&
    raw.directProductCount <= raw.subtreeProductCount &&
    (raw.parentState === 'root' ||
     raw.parentState === 'present' ||
     raw.parentState === 'unresolved');
}
function idList(raw: unknown): raw is string[] {
  return distinctList(raw, validId, value => value as string);
}
function unresolved(raw: unknown): boolean {
  return record(raw) && exactKeys(raw, UNRESOLVED_KEYS) &&
    UNRESOLVED_KEYS.every(key => idList(raw[key]));
}

/** Reject all protocol drift before exposing any part of a census. */
export function decodeCatalogSettingsUsageV1(raw: unknown): CatalogSettingsUsageV1Envelope {
  if (!record(raw) || !exactKeys(raw, ['data']) || !record(raw.data)) return invalid();
  const data = raw.data;
  if (!exactKeys(data, ['units', 'brands', 'categories', 'unresolved']) ||
    !distinctList(data.units, countRow, value => (value as CatalogSettingsUsageV1Count).id) ||
    !distinctList(data.brands, countRow, value => (value as CatalogSettingsUsageV1Count).id) ||
    !distinctList(data.categories, categoryRow, value => (value as CatalogSettingsUsageV1CategoryCount).id) ||
    !unresolved(data.unresolved)) return invalid();
  return raw as unknown as CatalogSettingsUsageV1Envelope;
}

/**
 * This function is intentionally NOT connected to Product Settings.
 * Keep user and tenant identity in the separately reviewed SessionStore,
 * never accept a caller-chosen tenant ID or manufacture an empty roster.
 */
export async function readCatalogSettingsUsageV1(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<CatalogSettingsUsageV1Envelope> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();

  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    if (controller.signal.aborted) throw new ApiError('network', 'Catalog usage read cancelled');
    // Existing requestJson supplies one same-origin request with strict auth,
    // no credentials, no redirects, and no automatic retry.
    const result = await requestJson({
      method: 'GET',
      path: '/api/v1/catalog/settings-usage-v1',
      accessToken,
      signal: controller.signal,
    }, decodeCatalogSettingsUsageV1);
    // Even a fetch mock/proxy that ignores abort cannot deliver a stale result.
    if (controller.signal.aborted) throw new ApiError('network', 'Catalog usage read cancelled');
    // Shared HTTP utility treats successful 204 as undefined; this endpoint
    // requires a complete JSON census, never an implicit empty snapshot.
    if (result === undefined) return invalid();
    return result;
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
    controller.abort();
  }
}
