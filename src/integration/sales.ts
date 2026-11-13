import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { ApiRequest } from './http.ts';
import {
  decodeCustomerDirectory,
  decodeCustomerStanding,
  decodeSaleDrafts,
  decodePosProductsForMode,
  isCanonicalPosCursor,
  isCanonicalPosPartyId,
} from './saleMapping.ts';
import type {
  ServerCustomerDirectory,
  ServerCustomerStandingEnvelope,
  ServerSaleDraftsEnvelope,
  ServerPosProductList,
  ServerPosStockStatus,
} from './saleMapping.ts';

/**
 * MOD-007 M7-01b1: GET-only Nest adoption read adapters.
 * Unmounted by design. No POS/Product/Party preview-to-live projection, mutation,
 * retry, local cache, idempotency key or tenant identity supplied by the browser.
 */
export interface PosProductQuery {
  search?: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string;
  stockStatus?: ServerPosStockStatus;
  customerPartyId?: string;
  /** Explicit opt-in; omission preserves the v1 ID-keyset contract. */
  rankingMode?: 'GLOBAL_V2';
  cursor?: string;
  limit?: number;
}

export interface CustomerDirectoryQuery {
  search?: string;
  cursor?: string;
  limit?: number;
}

const allowedPosQuery = [
  'search', 'barcode', 'categoryId', 'brandId', 'stockStatus',
  'customerPartyId', 'rankingMode', 'cursor', 'limit',
] as const;
const allowedDirectoryQuery = ['search', 'cursor', 'limit'] as const;
const allowedStatuses: readonly string[] = [
  'IN_STOCK', 'LOW_STOCK', 'ZERO_STOCK', 'NEGATIVE_STOCK',
];

function invalid(): never {
  throw new ApiError('protocol', 'POS read request or response could not be verified');
}
function record(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}
function queryFields(x: unknown, allowed: readonly string[]): x is Record<string, unknown> {
  return record(x) && Object.keys(x).every(key => allowed.includes(key));
}
function textParam(value: unknown, maxLength: number): string {
  if (typeof value !== 'string' || value.trim().length > maxLength) return invalid();
  return value.trim();
}
function limitParam(value: unknown, max: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1 || value > max) return invalid();
  return value;
}
function canonicalId(value: unknown): string {
  if (!isCanonicalPosPartyId(value)) return invalid();
  return value;
}

function posQueryPath(query: PosProductQuery): ApiRequest['path'] {
  if (!queryFields(query, allowedPosQuery)) return invalid();
  if (query.rankingMode !== undefined && query.rankingMode !== 'GLOBAL_V2') return invalid();
  if (query.cursor !== undefined &&
      !isCanonicalPosCursor(query.cursor, query.rankingMode ?? 'LEGACY')) return invalid();
  const params = new URLSearchParams();
  for (const key of allowedPosQuery) {
    const value: unknown = query[key];
    if (value === undefined) continue;
    if (key === 'search' || key === 'barcode') {
      params.set(key, textParam(value, key === 'search' ? 120 : 64));
    } else if (key === 'cursor') {
      params.set(key, textParam(value, 120));
    } else if (key === 'rankingMode') {
      params.set(key, 'GLOBAL_V2');
    } else if (key === 'limit') {
      params.set(key, String(limitParam(value, 100)));
    } else if (key === 'stockStatus') {
      if (!allowedStatuses.includes(String(value))) return invalid();
      params.set(key, String(value));
    } else {
      params.set(key, canonicalId(value));
    }
  }
  const suffix = params.toString();
  return (suffix ? '/api/v1/sales/pos-products?' + suffix : '/api/v1/sales/pos-products') as ApiRequest['path'];
}

function directoryPath(query: CustomerDirectoryQuery): ApiRequest['path'] {
  if (!queryFields(query, allowedDirectoryQuery)) return invalid();
  const params = new URLSearchParams();
  params.set('role', 'CUSTOMER');
  params.set('status', 'ACTIVE');
  for (const key of allowedDirectoryQuery) {
    const value: unknown = query[key];
    if (value === undefined) continue;
    if (key === 'search') params.set(key, textParam(value, 120));
    else if (key === 'cursor') params.set(key, canonicalId(value));
    else params.set(key, String(limitParam(value, 200)));
  }
  return ('/api/v1/parties?' + params.toString()) as ApiRequest['path'];
}

/**
 * Uses the same same-origin bearer transport as MOD-000.
 * Callers must bind completion to their current verified session epoch and
 * abort on tenant/session changes; the adapter itself holds no UI state.
 */
async function read<T>(
  accessToken: string,
  path: ApiRequest['path'],
  decode: (value: unknown) => T,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<T> {
  if (typeof accessToken !== 'string' || !accessToken || /\s/.test(accessToken) ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) throw new ApiError('network', 'Network request failed');
  signal?.addEventListener('abort', abort, { once: true });
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

export async function readPosProducts(
  accessToken: string,
  query: PosProductQuery = {},
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerPosProductList> {
  // Decode after validation with the same explicit mode as the outbound GET.
  // Never accept an ID cursor as a ranked cursor (or vice versa).
  return read(accessToken, posQueryPath(query),
    raw => decodePosProductsForMode(raw, query.rankingMode ?? 'LEGACY'),
    signal, timeoutMs);
}

export async function readPosCustomers(
  accessToken: string,
  query: CustomerDirectoryQuery = {},
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerCustomerDirectory> {
  return read(accessToken, directoryPath(query), decodeCustomerDirectory, signal, timeoutMs);
}

export async function readPosCustomerStanding(
  accessToken: string,
  partyId: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerCustomerStandingEnvelope> {
  const id = canonicalId(partyId);
  return read(accessToken, ('/api/v1/customers/' + id + '/standing') as ApiRequest['path'], (raw) => {
    const envelope = decodeCustomerStanding(raw);
    if (envelope.data.partyId !== id) return invalid();
    return envelope;
  }, signal, timeoutMs);
}


/**
 * M7-02A: GET-only opaque sale drafts. No preview-store mount, cart projection,
 * posting, update, delete, reservation or retry. Caller owns session epoch.
 */
export async function readSaleDrafts(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerSaleDraftsEnvelope> {
  return read(accessToken, '/api/v1/sales/drafts', decodeSaleDrafts, signal, timeoutMs);
}
