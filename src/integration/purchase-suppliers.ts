import { ApiError } from './errors.ts';
import { requestJson, type ApiRequest } from './http.ts';
import {
  decodeTradingPartyList, decodeTradingPartyDetail, type TradingParty,
} from './party-reads.ts';

/**
 * MOD-008 P-SEC-S01: read-only, role-required Nest Party V2 Supplier transport.
 * The verified V2 wire must be decoded before projecting only Purchase fields.
 * Never return private profile/history, expose other role memberships or
 * invent balances from unrelated Customer postings.
 */
export type PurchaseSupplierRole = 'SUPPLIER';
export type PurchaseSupplierStatus = 'ACTIVE' | 'INACTIVE';
export interface PurchaseSupplierBalance {
  netMinor: number;
  direction: 'RECEIVABLE' | 'PAYABLE' | 'SETTLED';
  outstandingMinor: number;
  advanceMinor: number;
}
export interface ServerPurchaseSupplier {
  id: string;
  name: string;
  roles: ['SUPPLIER'];
  phone: string | null;
  status: PurchaseSupplierStatus;
  isSystemReserved: boolean;
  version: number;
  balance: PurchaseSupplierBalance;
}
export interface PurchaseSupplierQuery {
  search?: string;
  status?: PurchaseSupplierStatus;
  cursor?: string;
  limit?: number;
}
export interface PurchaseSupplierList {
  data: ServerPurchaseSupplier[];
  page: { nextCursor: string | null; hasMore: boolean };
  summary: {
    total: number;
    active: number;
    inactive: number;
    ungrouped: null;
    totalOutstandingMinor: number;
    totalAdvanceMinor: number;
    overCreditLimit: number;
  };
}
export interface PurchaseSupplierEnvelope { data: ServerPurchaseSupplier }

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const BALANCE_FIELDS = ['netMinor','direction','outstandingMinor','advanceMinor'] as const;
const QUERY_FIELDS = ['search','status','cursor','limit'] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Authenticated supplier source could not be verified');
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exact(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function integer(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}
function nonnegative(value: unknown): value is number {
  return integer(value) && value >= 0;
}
function balance(value: unknown): value is PurchaseSupplierBalance {
  if (!record(value) || !exact(value, BALANCE_FIELDS) ||
      !integer(value.netMinor) ||
      !nonnegative(value.outstandingMinor) || !nonnegative(value.advanceMinor)) return false;
  if (value.direction === 'RECEIVABLE') {
    return value.netMinor > 0 && value.outstandingMinor === value.netMinor &&
      value.advanceMinor === 0;
  }
  if (value.direction === 'PAYABLE') {
    return value.netMinor < 0 && value.advanceMinor === -value.netMinor &&
      value.outstandingMinor === 0;
  }
  return value.direction === 'SETTLED' && value.netMinor === 0 &&
    value.outstandingMinor === 0 && value.advanceMinor === 0;
}
/** The V2 verifier validates source shape; projection prevents echoing PII. */
function projectSupplier(value: TradingParty): ServerPurchaseSupplier {
  // Preserve the original Supplier accounting direction and poisha invariants.
  if (value.name !== value.name.trim() || !balance(value.balance)) return invalid();
  return {
    id: value.id,
    name: value.name,
    roles: ['SUPPLIER'],
    phone: value.phone,
    status: value.status,
    isSystemReserved: value.isSystemReserved,
    version: value.version,
    balance: {
      netMinor: value.balance.netMinor,
      direction: value.balance.direction,
      outstandingMinor: value.balance.outstandingMinor,
      advanceMinor: value.balance.advanceMinor,
    },
  };
}
export function decodePurchaseSupplier(raw: unknown): PurchaseSupplierEnvelope {
  const checked = decodeTradingPartyDetail(raw, 'SUPPLIER');
  return { data: projectSupplier(checked.data) };
}
export function decodePurchaseSupplierList(raw: unknown): PurchaseSupplierList {
  const checked = decodeTradingPartyList(raw, 'SUPPLIER');
  if (checked.summary.ungrouped !== null) return invalid();
  return {
    data: checked.data.map(projectSupplier),
    page: {
      nextCursor: checked.page.nextCursor, hasMore: checked.page.hasMore,
    },
    summary: {
      total: checked.summary.total,
      active: checked.summary.active,
      inactive: checked.summary.inactive,
      ungrouped: null,
      totalOutstandingMinor: checked.summary.totalOutstandingMinor,
      totalAdvanceMinor: checked.summary.totalAdvanceMinor,
      overCreditLimit: checked.summary.overCreditLimit,
    },
  };
}

function queryPath(query: PurchaseSupplierQuery): ApiRequest['path'] {
  if (!record(query) || Object.keys(query).some(key => !QUERY_FIELDS.includes(key as typeof QUERY_FIELDS[number]))) return invalid();
  const params = new URLSearchParams();
  params.set('role', 'SUPPLIER');
  for (const key of QUERY_FIELDS) {
    const value = query[key];
    if (value === undefined) continue;
    if (key === 'search') {
      if (typeof value !== 'string' || value.length > 120) return invalid();
      params.set(key, value.trim());
    } else if (key === 'status') {
      if (value !== 'ACTIVE' && value !== 'INACTIVE') return invalid();
      params.set(key, value);
    } else if (key === 'cursor') {
      if (!validId(value)) return invalid();
      params.set(key, value);
    } else {
      if (!integer(value) || value < 1 || value > 200) return invalid();
      params.set(key, String(value));
    }
  }
  return `/api/v2/parties?${params.toString()}`;
}
async function read<T>(
  accessToken: string,
  path: ApiRequest['path'],
  decode: (raw: unknown) => T,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<T> {
  if (typeof accessToken !== 'string' || !accessToken ||
      /\s/.test(accessToken) || !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'GET', path, accessToken, signal: controller.signal,
    }, decode);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}

/** One strict bearer-token GET; no preview fallback, cross-tenant cache or retry. */
export async function readPurchaseSuppliers(
  accessToken: string,
  query: PurchaseSupplierQuery = {},
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<PurchaseSupplierList> {
  return read(accessToken, queryPath(query), decodePurchaseSupplierList, signal, timeoutMs);
}

/** Role filter stays explicit even on detail, so CUSTOMER-only is not a supplier. */
export function readPurchaseSupplier(
  accessToken: string,
  supplierId: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<PurchaseSupplierEnvelope> {
  if (!validId(supplierId)) return Promise.reject(new ApiError('protocol', 'Invalid supplier ID'));
  return read(accessToken,
    `/api/v2/parties/${supplierId}?role=SUPPLIER`,
    decodePurchaseSupplier, signal, timeoutMs);
}
