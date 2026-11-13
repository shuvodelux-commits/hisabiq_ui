import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { ApiRequest } from './http.ts';

/**
 * MOD-009 R09-HISTORY-03: immutable-source supplier return history, GET only.
 *
 * Backend: PurchaseReturnsController.list -> PurchaseReturnQueryService.list,
 * authorized by purchase.return.view. The response is UNWRAPPED: it is not a
 * { data } envelope. No settlement, balance, lot or journal is computed here.
 */
export interface ServerPurchaseReturnLine {
  id: string;
  purchaseLineId: string;
  productId: string;
  productName: string;
  unitName: string;
  qty: number;          // base quantity, scale 3 integer
  valueMinor: number;   // integer poisha already posted
}
export type ServerPurchaseReturnReason =
  | 'DAMAGED' | 'WRONG_ITEM' | 'CHANGED_MIND' | 'EXTRA_QUANTITY' | 'OTHER';
export interface ServerPurchaseReturn {
  id: string;
  number: string;
  purchaseId: string;
  purchaseNumber: string;
  supplierPartyId: string;
  supplierName: string;
  businessDate: string;
  reason: ServerPurchaseReturnReason;
  note: string | null;
  returnValueMinor: number;
  receivedMinor: number;
  creditMinor: number;
  receiptAccountCode: string | null;
  receiptAccountName: string | null;
  lines: ServerPurchaseReturnLine[];
  createdAt: string;
}
export interface ServerPurchaseReturnHistory {
  returns: ServerPurchaseReturn[];
  nextCursor: string | null;
  totalValueMinor: number;
  totalReceivedMinor: number;
}
export interface PurchaseReturnHistoryQuery {
  cursor?: string | null;
  limit?: number;
}

const ulid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const reasons = new Set<ServerPurchaseReturnReason>([
  'DAMAGED', 'WRONG_ITEM', 'CHANGED_MIND', 'EXTRA_QUANTITY', 'OTHER',
]);
const returnFields = [
  'id', 'number', 'purchaseId', 'purchaseNumber', 'supplierPartyId',
  'supplierName', 'businessDate', 'reason', 'note',
  'returnValueMinor', 'receivedMinor', 'creditMinor',
  'receiptAccountCode', 'receiptAccountName', 'lines', 'createdAt',
] as const;
const lineFields = [
  'id', 'purchaseLineId', 'productId', 'productName', 'unitName',
  'qty', 'valueMinor',
] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Invalid purchase return history response or request');
}
function record(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}
function exact(x: unknown, keys: readonly string[]): x is Record<string, unknown> {
  return record(x) && Object.keys(x).length === keys.length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(x, key));
}
function id(x: unknown): x is string {
  return typeof x === 'string' && ulid.test(x);
}
function text(x: unknown): x is string { return typeof x === 'string'; }
function nullableText(x: unknown): x is string | null {
  return x === null || text(x);
}
function nonnegativeInt(x: unknown): x is number {
  return typeof x === 'number' && Number.isSafeInteger(x) && x >= 0;
}
function date(x: unknown): x is string {
  if (typeof x !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const d = new Date(x + 'T00:00:00.000Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === x;
}
function timestamp(x: unknown): x is string {
  return typeof x === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(x) &&
    Number.isFinite(Date.parse(x));
}
function cursor(x: unknown): x is string {
  if (typeof x !== 'string' || x.length < 1 || x.length > 1024) return false;
  return !/[\u0000-\u001f\u007f]/.test(x);
}
function line(x: unknown): x is ServerPurchaseReturnLine {
  return exact(x, lineFields) && id(x.id) && id(x.purchaseLineId) && id(x.productId) &&
    text(x.productName) && text(x.unitName) &&
    nonnegativeInt(x.qty) && x.qty > 0 && nonnegativeInt(x.valueMinor);
}
function entry(x: unknown): x is ServerPurchaseReturn {
  if (!exact(x, returnFields) ||
      !id(x.id) || !text(x.number) ||
      !id(x.purchaseId) || !text(x.purchaseNumber) ||
      !id(x.supplierPartyId) || !text(x.supplierName) ||
      !date(x.businessDate) || !reasons.has(x.reason as ServerPurchaseReturnReason) ||
      !nullableText(x.note) ||
      !nonnegativeInt(x.returnValueMinor) ||
      !nonnegativeInt(x.receivedMinor) || x.receivedMinor > x.returnValueMinor ||
      !nonnegativeInt(x.creditMinor) || x.creditMinor > x.returnValueMinor ||
      !nullableText(x.receiptAccountCode) || !nullableText(x.receiptAccountName) ||
      !timestamp(x.createdAt) || !Array.isArray(x.lines)) return false;

  const ids = new Set<string>();
  const sourceIds = new Set<string>();
  for (const value of x.lines) {
    if (!line(value) || ids.has(value.id) || sourceIds.has(value.purchaseLineId)) return false;
    ids.add(value.id);
    sourceIds.add(value.purchaseLineId);
  }
  return true;
}

/** Fails closed on unexpected schema/identity: never substitutes sample history. */
export function decodePurchaseReturnHistory(raw: unknown): ServerPurchaseReturnHistory {
  if (!exact(raw, ['returns', 'nextCursor', 'totalValueMinor', 'totalReceivedMinor']) ||
      !Array.isArray(raw.returns) ||
      !(raw.nextCursor === null || cursor(raw.nextCursor)) ||
      !nonnegativeInt(raw.totalValueMinor) ||
      !nonnegativeInt(raw.totalReceivedMinor)) return invalid();
  const ids = new Set<string>();
  for (const item of raw.returns) {
    if (!entry(item) || ids.has(item.id)) return invalid();
    ids.add(item.id);
  }
  return raw as unknown as ServerPurchaseReturnHistory;
}

/**
 * Query is intentionally cursor/limit only. No posting and no global cache.
 * Fetching another page is a new authenticated GET; callers own their identity
 * and request epoch and must discard stale/aborted answers.
 */
export async function readPurchaseReturnHistory(
  accessToken: string,
  query: PurchaseReturnHistoryQuery = {},
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerPurchaseReturnHistory> {
  if (typeof accessToken !== 'string' || !accessToken.trim() || /\s/.test(accessToken) ||
      !record(query) ||
      Object.keys(query).some(key => key !== 'cursor' && key !== 'limit') ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const limit = query.limit ?? 20;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) return invalid();
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (query.cursor !== undefined && query.cursor !== null) {
    if (!cursor(query.cursor)) return invalid();
    params.set('cursor', query.cursor);
  }
  const path = ('/api/v1/purchase-returns?' + params.toString()) as ApiRequest['path'];
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'GET', path, accessToken, signal: controller.signal,
    }, decodePurchaseReturnHistory);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
