import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/**
 * MOD-008 DRAFT-P4A: purchase-owned read-only supplier source transport.
 *
 * Exact Nest authority:
 *   packages/core-contracts/src/parties.ts (partyResponseSchema,
 *     partyListResponseSchema, partyQuerySchema)
 *   apps/api/src/parties/parties.controller.ts
 *
 * Do not weaken role=SUPPLIER, synthesize fixture IDs, treat a role-scoped
 * financial balance as a writable form field, or cache across tenants.
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
  roles: ('CUSTOMER' | 'SUPPLIER' | 'VENDOR')[];
  phone: string | null;
  address: string | null;
  guardianName: string | null;
  nid: string | null;
  email: string | null;
  notes: string | null;
  customerGroupId: string | null;
  customerGroupName: string | null;
  creditLimitMinor: number | null;
  status: PurchaseSupplierStatus;
  isSystemReserved: boolean;
  version: number;
  balance: PurchaseSupplierBalance;
  hasLedgerEntries: boolean;
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
    ungrouped: number;
    totalOutstandingMinor: number;
    totalAdvanceMinor: number;
    overCreditLimit: number;
  };
}
export interface PurchaseSupplierEnvelope { data: ServerPurchaseSupplier }

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const FIELDS = [
  'id','name','roles','phone','address','guardianName','nid','email',
  'notes','customerGroupId','customerGroupName','creditLimitMinor',
  'status','isSystemReserved','version','balance','hasLedgerEntries',
] as const;
const NULL_TEXT = ['phone','address','guardianName','nid','email','notes','customerGroupName'] as const;
const BALANCE_FIELDS = ['netMinor','direction','outstandingMinor','advanceMinor'] as const;
const SUMMARY_FIELDS = [
  'total','active','inactive','ungrouped','totalOutstandingMinor',
  'totalAdvanceMinor','overCreditLimit',
] as const;
const QUERY_FIELDS = ['search','status','cursor','limit'] as const;
const ROLES = ['CUSTOMER','SUPPLIER','VENDOR'] as const;

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
function nullableText(value: unknown): boolean {
  return value === null || typeof value === 'string';
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
function supplier(value: unknown): value is ServerPurchaseSupplier {
  return record(value) && exact(value, FIELDS) &&
    validId(value.id) && typeof value.name === 'string' &&
    value.name.trim().length > 0 && value.name === value.name.trim() &&
    Array.isArray(value.roles) && value.roles.length > 0 &&
    value.roles.length <= 3 &&
    value.roles.every(role => ROLES.includes(role)) &&
    new Set(value.roles).size === value.roles.length &&
    NULL_TEXT.every(key => nullableText(value[key])) &&
    (value.customerGroupId === null || validId(value.customerGroupId)) &&
    (value.creditLimitMinor === null || nonnegative(value.creditLimitMinor)) &&
    (value.status === 'ACTIVE' || value.status === 'INACTIVE') &&
    typeof value.isSystemReserved === 'boolean' &&
    integer(value.version) && value.version >= 0 &&
    balance(value.balance) && typeof value.hasLedgerEntries === 'boolean';
}
function summary(value: unknown): boolean {
  return record(value) && exact(value, SUMMARY_FIELDS) &&
    SUMMARY_FIELDS.every(key => nonnegative(value[key]));
}
export function decodePurchaseSupplier(raw: unknown): PurchaseSupplierEnvelope {
  if (!record(raw) || !exact(raw, ['data']) || !supplier(raw.data)) return invalid();
  return raw as unknown as PurchaseSupplierEnvelope;
}
export function decodePurchaseSupplierList(raw: unknown): PurchaseSupplierList {
  if (!record(raw) || !exact(raw, ['data','page','summary']) ||
      !Array.isArray(raw.data) || raw.data.length > 200 ||
      !raw.data.every(supplier) || !record(raw.page) ||
      !exact(raw.page, ['nextCursor','hasMore']) ||
      (raw.page.nextCursor !== null && !validId(raw.page.nextCursor)) ||
      typeof raw.page.hasMore !== 'boolean' ||
      (raw.page.hasMore !== (raw.page.nextCursor !== null)) ||
      !summary(raw.summary) ||
      new Set(raw.data.map((entry: ServerPurchaseSupplier) => entry.id)).size !== raw.data.length) return invalid();
  return raw as unknown as PurchaseSupplierList;
}

function queryPath(query: PurchaseSupplierQuery): `/api/v1/${string}` {
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
  return `/api/v1/parties?${params.toString()}`;
}
async function read<T>(
  accessToken: string,
  path: `/api/v1/${string}`,
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
    `/api/v1/parties/${supplierId}?role=SUPPLIER`,
    decodePurchaseSupplier, signal, timeoutMs);
}
