import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/**
 * MOD-002 P8c-T0 — standalone, READ-ONLY catalog lifecycle-v1 transport.
 *
 * This is NOT connected to Product Settings or a SessionStore. Callers must
 * separately establish a signed, current tenant session before using its token.
 * No local cache, optimistic write, retry, preview fallback, status PATCH or
 * legacy catalog fallback. An error never becomes a fabricated empty roster.
 */
export type CatalogLifecycleV1Kind = 'unit' | 'brand' | 'category';
export type CatalogLifecycleV1State = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

interface CatalogLifecycleV1Base {
  id: string;
  name: string;
  nameBn: string | null;
  version: number;
  state: CatalogLifecycleV1State;
  archivedAt: string | null;
}

export interface CatalogLifecycleV1Unit extends CatalogLifecycleV1Base {
  symbol: string | null;
}
export interface CatalogLifecycleV1Brand extends CatalogLifecycleV1Base {}
export interface CatalogLifecycleV1Category extends CatalogLifecycleV1Base {
  parentId: string | null;
}

interface EntryForKind {
  unit: CatalogLifecycleV1Unit;
  brand: CatalogLifecycleV1Brand;
  category: CatalogLifecycleV1Category;
}
export interface CatalogLifecycleV1Roster<K extends CatalogLifecycleV1Kind> {
  data: {
    kind: K;
    entries: EntryForKind[K][];
  };
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const shared = ['id', 'name', 'nameBn', 'version', 'state', 'archivedAt'] as const;
const rowKeys = {
  unit: [...shared, 'symbol'],
  brand: [...shared],
  category: [...shared, 'parentId'],
} as const;
const endpoint = {
  unit: '/api/v1/catalog/lifecycle-v1/units',
  brand: '/api/v1/catalog/lifecycle-v1/brands',
  category: '/api/v1/catalog/lifecycle-v1/categories',
} as const;

function invalid(): never {
  throw new ApiError('protocol', 'Catalog lifecycle response or request could not be verified');
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function nullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}
function validVersion(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1;
}

/** Strict offset-bearing timestamp; do not silently repair impossible dates. */
function validTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month < 1 || month > 12 || day < 1 || day > days[month - 1]! ||
      hour > 23 || minute > 59 || second > 59) return false;
  return Number.isFinite(Date.parse(value));
}

function validEntry(raw: unknown, kind: CatalogLifecycleV1Kind): boolean {
  if (!record(raw) || !exactKeys(raw, rowKeys[kind]) ||
      !validId(raw.id) || typeof raw.name !== 'string' || raw.name.length === 0 ||
      !nullableString(raw.nameBn) || !validVersion(raw.version)) return false;
  if (raw.state !== 'ACTIVE' && raw.state !== 'INACTIVE' && raw.state !== 'ARCHIVED')
    return false;
  // Archived and nonarchived are distinct states; never infer archive from isActive.
  if (raw.state === 'ARCHIVED') {
    if (!validTimestamp(raw.archivedAt)) return false;
  } else if (raw.archivedAt !== null) return false;
  if (kind === 'unit') return nullableString(raw.symbol);
  if (kind === 'category') return raw.parentId === null || validId(raw.parentId);
  return true;
}

/** Exact wire schema, including kind, row shape, state and duplicate protection. */
export function decodeCatalogLifecycleV1<K extends CatalogLifecycleV1Kind>(
  raw: unknown,
  expectedKind: K,
): CatalogLifecycleV1Roster<K> {
  if (expectedKind !== 'unit' && expectedKind !== 'brand' && expectedKind !== 'category')
    return invalid();
  if (!record(raw) || !exactKeys(raw, ['data']) ||
      !record(raw.data) || !exactKeys(raw.data, ['kind', 'entries']) ||
      raw.data.kind !== expectedKind || !Array.isArray(raw.data.entries)) return invalid();

  const seen = new Set<string>();
  for (const entry of raw.data.entries) {
    if (!validEntry(entry, expectedKind)) return invalid();
    const id = (entry as { id: string }).id;
    if (seen.has(id)) return invalid();
    seen.add(id);
  }
  return raw as unknown as CatalogLifecycleV1Roster<K>;
}

async function readCatalogLifecycleV1<K extends CatalogLifecycleV1Kind>(
  accessToken: string,
  kind: K,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<CatalogLifecycleV1Roster<K>> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000 ||
      typeof accessToken !== 'string' || accessToken.length === 0 || /\s/u.test(accessToken))
    return invalid();

  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);

  try {
    if (controller.signal.aborted)
      throw new ApiError('network', 'Catalog lifecycle read cancelled');
    const result = await requestJson({
      method: 'GET',
      path: endpoint[kind],
      accessToken,
      signal: controller.signal,
    }, raw => decodeCatalogLifecycleV1(raw, kind));
    // Proxies/test transports can ignore AbortSignal; refuse their stale reply.
    if (controller.signal.aborted)
      throw new ApiError('network', 'Catalog lifecycle read cancelled');
    if (result === undefined) return invalid();
    return result;
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
    controller.abort();
  }
}

export function readCatalogLifecycleV1Units(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<CatalogLifecycleV1Roster<'unit'>> {
  return readCatalogLifecycleV1(accessToken, 'unit', signal, timeoutMs);
}
export function readCatalogLifecycleV1Brands(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<CatalogLifecycleV1Roster<'brand'>> {
  return readCatalogLifecycleV1(accessToken, 'brand', signal, timeoutMs);
}
export function readCatalogLifecycleV1Categories(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<CatalogLifecycleV1Roster<'category'>> {
  return readCatalogLifecycleV1(accessToken, 'category', signal, timeoutMs);
}
