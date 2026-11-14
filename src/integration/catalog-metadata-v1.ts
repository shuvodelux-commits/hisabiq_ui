import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/**
 * MOD-002 T02A/P2a — explicitly opt-in catalog metadata-v1 transport.
 *
 * The existing src/integration/catalog.ts remains the legacy authority for
 * name-only catalog commands. Do NOT switch an existing Products UI route to
 * this API until PostgreSQL migration 0055, tenant acceptance and UX parity
 * have been independently verified. Versioned responses are intentionally
 * incompatible with the strict legacy decoder: they require row versions.
 */
export interface CatalogMetadataV1Unit {
  id: string;
  name: string;
  nameBn: string | null;
  symbol: string | null;
  version: number;
}
export interface CatalogMetadataV1Brand {
  id: string;
  name: string;
  nameBn: string | null;
  version: number;
}
export interface CatalogMetadataV1Category {
  id: string;
  name: string;
  nameBn: string | null;
  parentId: string | null;
  version: number;
}
export interface CatalogMetadataV1Features {
  productOffers: boolean;
  expiryTracking: boolean;
  serialTracking: boolean;
  warranty: boolean;
  customerGroups: boolean;
  vendors: boolean;
}
export interface CatalogMetadataV1Envelope {
  data: {
    units: CatalogMetadataV1Unit[];
    brands: CatalogMetadataV1Brand[];
    categories: CatalogMetadataV1Category[];
    features: CatalogMetadataV1Features;
  };
}

export type CatalogMetadataV1PatchCommand =
  | {
      kind: 'units';
      id: string;
      expectedVersion: number;
      nameBn?: string | null;
      symbol?: string | null;
    }
  | {
      kind: 'brands' | 'categories';
      id: string;
      expectedVersion: number;
      nameBn: string | null;
    };


/**
 * MOD-002 T02A/P6d — opt-in one-request full edit, added only after backend P6c.
 * These fields are accepted by the new /full-edit route, not the existing
 * Bengali-only metadata PATCH. Omitted optional values preserve, null clears.
 * No frontend Product Settings screen or session bridge uses this yet.
 */
export type CatalogMetadataV1FullEditCommand =
  | {
      kind: 'units';
      id: string;
      expectedVersion: number;
      name: string;
      nameBn?: string | null;
      symbol?: string | null;
    }
  | {
      kind: 'brands' | 'categories';
      id: string;
      expectedVersion: number;
      name: string;
      nameBn?: string | null;
    };

const ulid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const featureKeys = [
  'productOffers', 'expiryTracking', 'serialTracking',
  'warranty', 'customerGroups', 'vendors',
] as const;
const maxVersion = Number.MAX_SAFE_INTEGER;

function invalid(): never {
  throw new ApiError('protocol', 'Catalog metadata response or request could not be verified');
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  return Object.keys(value).length === expected.length &&
    expected.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function allowedKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every(key => allowed.includes(key));
}
function has(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && ulid.test(value);
}
function validVersion(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) &&
    value >= 1 && value <= maxVersion;
}
function nullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}
function baseEntry(value: unknown, required: readonly string[]): value is Record<string, unknown> {
  return record(value) && exactKeys(value, required) &&
    validId(value.id) && typeof value.name === 'string' &&
    nullableString(value.nameBn) && validVersion(value.version);
}
function unit(value: unknown): value is CatalogMetadataV1Unit {
  return baseEntry(value, ['id', 'name', 'nameBn', 'symbol', 'version']) &&
    nullableString(value.symbol);
}
function brand(value: unknown): value is CatalogMetadataV1Brand {
  return baseEntry(value, ['id', 'name', 'nameBn', 'version']);
}
function category(value: unknown): value is CatalogMetadataV1Category {
  return baseEntry(value, ['id', 'name', 'nameBn', 'parentId', 'version']) &&
    (value.parentId === null || validId(value.parentId));
}
function features(value: unknown): value is CatalogMetadataV1Features {
  return record(value) && exactKeys(value, featureKeys) &&
    featureKeys.every(key => typeof value[key] === 'boolean');
}

/** A strict, separate decoder. No fallback, inferred translation or cache. */
export function decodeCatalogMetadataV1(raw: unknown): CatalogMetadataV1Envelope {
  if (!record(raw) || !exactKeys(raw, ['data']) || !record(raw.data)) return invalid();
  const data = raw.data;
  if (!exactKeys(data, ['units', 'brands', 'categories', 'features']) ||
      !Array.isArray(data.units) || !data.units.every(unit) ||
      !Array.isArray(data.brands) || !data.brands.every(brand) ||
      !Array.isArray(data.categories) || !data.categories.every(category) ||
      !features(data.features)) return invalid();
  return raw as unknown as CatalogMetadataV1Envelope;
}

function nameBn(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') return invalid();
  const normalized = value.normalize('NFC').trim().replace(/\s+/gu, ' ');
  const count = Array.from(normalized).length;
  if (count < 1 || count > 120) return invalid();
  return normalized;
}

function symbol(value: unknown): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') return invalid();
  const normalized = value.normalize('NFC').trim();
  const count = Array.from(normalized).length;
  if (count < 1 || count > 4 || /\s/u.test(normalized)) return invalid();
  return normalized;
}

function validatePatch(raw: unknown): {
  kind: 'units' | 'brands' | 'categories';
  id: string;
  body: Record<string, string | number | null>;
} {
  if (!record(raw) || !validId(raw.id) || !validVersion(raw.expectedVersion) ||
      (raw.kind !== 'units' && raw.kind !== 'brands' && raw.kind !== 'categories')) {
    return invalid();
  }
  const base = ['kind', 'id', 'expectedVersion'];
  const fields = raw.kind === 'units' ? [...base, 'nameBn', 'symbol'] : [...base, 'nameBn'];
  if (!allowedKeys(raw, fields)) return invalid();
  const hasName = has(raw, 'nameBn');
  const hasSymbol = has(raw, 'symbol');
  if (!hasName && !hasSymbol) return invalid();
  if (raw.kind !== 'units' && !hasName) return invalid();

  const body: Record<string, string | number | null> = { expectedVersion: raw.expectedVersion };
  if (hasName) body.nameBn = nameBn(raw.nameBn);
  if (hasSymbol) body.symbol = symbol(raw.symbol);
  return { kind: raw.kind, id: raw.id, body };
}


function englishName(value: unknown): string {
  if (typeof value !== 'string') return invalid();
  // Normalise before applying the server's <=120 UTF-16-unit name bound.
  // The server also collapses internal whitespace before storing a name.
  const normalized = value.normalize('NFC').trim().replace(/\s+/gu, ' ');
  if (normalized.length < 1 || normalized.length > 120 ||
      /[\u0000-\u001f\u007f]/u.test(normalized)) return invalid();
  return normalized;
}

function validateFullEdit(raw: unknown): {
  kind: 'units' | 'brands' | 'categories';
  id: string;
  body: Record<string, string | number | null>;
} {
  if (!record(raw) || !validId(raw.id) || !validVersion(raw.expectedVersion) ||
      (raw.kind !== 'units' && raw.kind !== 'brands' && raw.kind !== 'categories')) {
    return invalid();
  }
  const common = ['kind', 'id', 'expectedVersion', 'name', 'nameBn'];
  const fields = raw.kind === 'units' ? [...common, 'symbol'] : common;
  if (!allowedKeys(raw, fields) || !has(raw, 'name')) return invalid();

  const body: Record<string, string | number | null> = {
    expectedVersion: raw.expectedVersion,
    name: englishName(raw.name),
  };
  if (has(raw, 'nameBn')) body.nameBn = nameBn(raw.nameBn);
  if (has(raw, 'symbol')) {
    if (raw.kind !== 'units') return invalid();
    body.symbol = symbol(raw.symbol);
  }
  return { kind: raw.kind, id: raw.id, body };
}

async function metadataRequest(
  accessToken: string,
  method: 'GET' | 'PATCH',
  path: `/api/v1/${string}`,
  body?: unknown,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<CatalogMetadataV1Envelope> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    // No automatic retry, local optimistic mutation or preview/mock fallback.
    return await requestJson({
      method, path, body, accessToken, signal: controller.signal,
    }, decodeCatalogMetadataV1);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}

/** Not called by any existing catalog UI; a versioned read must be explicit. */
export async function readCatalogMetadataV1(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<CatalogMetadataV1Envelope> {
  return metadataRequest(
    accessToken, 'GET', '/api/v1/catalog/metadata-v1', undefined, signal, timeoutMs,
  );
}

/**
 * Metadata-only PATCH. Omitted keys preserve server state; null clears.
 * A 409 or ambiguous network failure is surfaced to the caller without retry.
 * The UI must re-read and preserve its unsaved form instead of claiming success.
 */
export async function patchCatalogMetadataV1(
  accessToken: string,
  command: CatalogMetadataV1PatchCommand,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<CatalogMetadataV1Envelope> {
  const { kind, id, body } = validatePatch(command);
  return metadataRequest(
    accessToken, 'PATCH', `/api/v1/catalog/metadata-v1/${kind}/${id}`,
    body, signal, timeoutMs,
  );
}

/**
 * Atomic English+Bengali (+optional unit symbol) full edit.
 *
 * Unlike the legacy English-only rename and metadata-only PATCH, this sends a
 * single CAS request. No retries, local optimistic mutation, forged tenant ID,
 * fixture fallback or session bypass is added here. A 409 or lost response
 * must be reconciled by re-reading under a separately verified session.
 */
export async function fullEditCatalogMetadataV1(
  accessToken: string,
  command: CatalogMetadataV1FullEditCommand,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<CatalogMetadataV1Envelope> {
  const { kind, id, body } = validateFullEdit(command);
  return metadataRequest(
    accessToken, 'PATCH', `/api/v1/catalog/metadata-v1/${kind}/${id}/full-edit`,
    body, signal, timeoutMs,
  );
}
