import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/**
 * MOD-002 T01A: read only. Source contract:
 * nestshererp packages/core-contracts/src/catalog.ts and CatalogController.list.
 * The existing response is {data:{units,brands,categories,features}}.
 * Legacy entries have only id/name. Future opt-in metadata may include exact
 * server-issued nameBn (all three kinds) and symbol (units only); never infer
 * either from English names, and never send unsupported metadata writes.
 */
export interface ServerCatalogEntry {
  id: string;
  name: string;
  /** Absent on legacy responses; null means explicitly unset. */
  nameBn?: string | null;
}
export interface ServerUnit extends ServerCatalogEntry {
  /** Display-only unit symbol; never a unit ID or conversion factor. */
  symbol?: string | null;
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
  units: ServerUnit[];
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
function catalogEntry(value: unknown, allowed: readonly string[]): value is ServerCatalogEntry {
  return record(value) &&
    Object.keys(value).every(key => allowed.includes(key)) &&
    validId(value.id) && typeof value.name === 'string' &&
    (!Object.hasOwn(value, 'nameBn') ||
      value.nameBn === null || typeof value.nameBn === 'string');
}
function entry(value: unknown): value is ServerCatalogEntry {
  return catalogEntry(value, ['id', 'name', 'nameBn']);
}
function unitEntry(value: unknown): value is ServerUnit {
  return catalogEntry(value, ['id', 'name', 'nameBn', 'symbol']) &&
    record(value) &&
    (!Object.hasOwn(value, 'symbol') ||
      value.symbol === null || typeof value.symbol === 'string');
}
function category(value: unknown): value is ServerCategory {
  return catalogEntry(value, ['id', 'name', 'nameBn', 'parentId']) &&
    record(value) && Object.hasOwn(value, 'parentId') &&
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
      !Array.isArray(data.units) || !data.units.every(unitEntry) ||
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

/**
 * MOD-002 T01B/P1: the EXISTING name-only CatalogController Class M writes.
 *
 * Important: The current legacy WRITE API cannot accept nameBn, symbol,
 * active, a renamed category parent or a rich product draft. A read decoder
 * accepting future fields does NOT authorize writes or imply backend support. These commands must fail closed
 * rather than silently stripping a richer UI field. The original HisabIQ
 * Product Settings and nested Add Product editor are intentionally untouched.
 *
 * There is no server Idempotency-Key contract for these master operations.
 * On a network/timeout ambiguity do NOT retry automatically or claim success.
 * The caller must re-read the catalog, then reconcile by a stable server ID.
 */
export type CatalogKind = 'units' | 'brands' | 'categories';
export type CreateCatalogNameCommand =
  | { kind: 'units' | 'brands'; name: string }
  | { kind: 'categories'; name: string; parentId: string | null };
export type RenameCatalogNameCommand = {
  kind: CatalogKind;
  id: string;
  name: string;
};
export type RemoveCatalogEntryCommand = {
  kind: CatalogKind;
  id: string;
};
export type RemoveCatalogEntryOutcome = 'DELETED' | 'ARCHIVED';
export interface RemoveCatalogEntryEnvelope {
  data: { outcome: RemoveCatalogEntryOutcome };
}

function catalogKind(value: unknown): value is CatalogKind {
  return value === 'units' || value === 'brands' || value === 'categories';
}
function validatedName(value: unknown): string {
  if (typeof value !== 'string') return invalid();
  const name = value.trim();
  if (name.length < 1 || name.length > 120) return invalid();
  return name;
}
function validatedId(value: unknown): string {
  if (!validId(value)) return invalid();
  return value;
}
function validatedKind(value: unknown): CatalogKind {
  if (!catalogKind(value)) return invalid();
  return value;
}
function validateCreateCommand(raw: unknown): { kind: CatalogKind; body: { name: string; parentId?: string | null } } {
  if (!record(raw)) return invalid();
  const kind = validatedKind(raw.kind);
  const name = validatedName(raw.name);
  if (kind === 'categories') {
    if (!keys(raw, ['kind', 'name', 'parentId']) ||
        (raw.parentId !== null && !validId(raw.parentId))) return invalid();
    return { kind, body: { name, parentId: raw.parentId as string | null } };
  }
  if (!keys(raw, ['kind', 'name'])) return invalid();
  return { kind, body: { name } };
}
function validateRenameCommand(raw: unknown): { kind: CatalogKind; id: string; name: string } {
  if (!record(raw) || !keys(raw, ['kind', 'id', 'name'])) return invalid();
  return {
    kind: validatedKind(raw.kind),
    id: validatedId(raw.id),
    name: validatedName(raw.name),
  };
}
function validateRemoveCommand(raw: unknown): { kind: CatalogKind; id: string } {
  if (!record(raw) || !keys(raw, ['kind', 'id'])) return invalid();
  return { kind: validatedKind(raw.kind), id: validatedId(raw.id) };
}

export function decodeRemoveCatalogEntry(raw: unknown): RemoveCatalogEntryEnvelope {
  if (!record(raw) || !keys(raw, ['data']) || !record(raw.data) ||
      !keys(raw.data, ['outcome']) ||
      (raw.data.outcome !== 'DELETED' && raw.data.outcome !== 'ARCHIVED')) return invalid();
  return raw as unknown as RemoveCatalogEntryEnvelope;
}

async function catalogMutation<T>(
  accessToken: string,
  method: 'POST' | 'PATCH',
  path: `/api/v1/${string}`,
  decode: (raw: unknown) => T,
  body?: unknown,
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
    // No automatic retry, no operation ID, no browser preview fallback.
    return await requestJson({
      method,
      path,
      body,
      accessToken,
      signal: controller.signal,
    }, decode);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}

/** Returns the COMPLETE canonical catalog; no locally invented created-ID. */
export async function createCatalogName(
  accessToken: string,
  command: CreateCatalogNameCommand,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerCatalogEnvelope> {
  const { kind, body } = validateCreateCommand(command);
  return catalogMutation(
    accessToken, 'POST', `/api/v1/catalog/${kind}`,
    decodeCatalog, body, signal, timeoutMs,
  );
}

/** Existing category rename is name-only; it never moves the parent. */
export async function renameCatalogName(
  accessToken: string,
  command: RenameCatalogNameCommand,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerCatalogEnvelope> {
  const { kind, id, name } = validateRenameCommand(command);
  return catalogMutation(
    accessToken, 'PATCH', `/api/v1/catalog/${kind}/${id}`,
    decodeCatalog, { name }, signal, timeoutMs,
  );
}

/** A referenced master may be ARCHIVED, not deleted or reactivated. */
export async function removeCatalogEntry(
  accessToken: string,
  command: RemoveCatalogEntryCommand,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<RemoveCatalogEntryEnvelope> {
  const { kind, id } = validateRemoveCommand(command);
  return catalogMutation(
    accessToken, 'POST', `/api/v1/catalog/${kind}/${id}/remove`,
    decodeRemoveCatalogEntry, undefined, signal, timeoutMs,
  );
}