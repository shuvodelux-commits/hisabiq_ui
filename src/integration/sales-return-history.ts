import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { ApiRequest } from './http.ts';

/**
 * MOD-009 R09-SHISTORY-04: read-only, UNMOUNTED posted sales-return history.
 *
 * This is the existing GET /api/v1/sales-returns contract, guarded by
 * sales.return.view on the Nest backend. Unlike GET /returnable/:saleId, it
 * does not require sales.return.create. No preview store, posting, automatic
 * retry, cash/credit settlement, source-unit reconstruction or global cache.
 *
 * Monetary fields are integer poisha from persisted source transactions.
 * Quantities are positive integer base-unit amounts at scale 3.
 * refundMinor + creditMinor need not equal returnValueMinor: some value may
 * have been applied to the original customer's outstanding due.
 */
export interface ServerSalesReturnLine {
  id: string;
  saleLineId: string;
  productId: string;
  productName: string;
  unitName: string;
  qty: number;
  valueMinor: number;
}
export type SalesReturnReason =
  | 'DAMAGED' | 'WRONG_ITEM' | 'CHANGED_MIND' | 'EXTRA_QUANTITY' | 'OTHER';
export interface ServerSalesReturn {
  id: string;
  number: string;
  saleId: string;
  saleNumber: string;
  partyId: string;
  customerName: string;
  businessDate: string;
  reason: SalesReturnReason;
  note: string | null;
  returnValueMinor: number;
  refundMinor: number;
  creditMinor: number;
  refundAccountCode: string | null;
  refundAccountName: string | null;
  approvedByName: string | null;
  lines: ServerSalesReturnLine[];
  createdAt: string;
}
export interface ServerSalesReturnHistory {
  returns: ServerSalesReturn[];
  nextCursor: string | null;
  totalValueMinor: number;
  totalRefundMinor: number;
}
export interface SalesReturnHistoryQuery {
  cursor?: string | null;
  limit?: number;
}

const ulid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const reasons = new Set<SalesReturnReason>([
  'DAMAGED', 'WRONG_ITEM', 'CHANGED_MIND', 'EXTRA_QUANTITY', 'OTHER',
]);
const returnFields = [
  'id', 'number', 'saleId', 'saleNumber', 'partyId', 'customerName',
  'businessDate', 'reason', 'note', 'returnValueMinor', 'refundMinor',
  'creditMinor', 'refundAccountCode', 'refundAccountName',
  'approvedByName', 'lines', 'createdAt',
] as const;
const lineFields = [
  'id', 'saleLineId', 'productId', 'productName', 'unitName',
  'qty', 'valueMinor',
] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Invalid sales-return history response or request');
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exact(value: unknown, fields: readonly string[]): value is Record<string, unknown> {
  return record(value) && Object.keys(value).length === fields.length &&
    fields.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function id(value: unknown): value is string {
  return typeof value === 'string' && ulid.test(value);
}
function text(value: unknown): value is string { return typeof value === 'string'; }
function nullableText(value: unknown): value is string | null {
  return value === null || text(value);
}
function amount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function businessDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
function timestamp(value: unknown): value is string {
  return typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value) &&
    Number.isFinite(Date.parse(value));
}
function cursor(value: unknown): value is string {
  if (typeof value !== 'string' || value.length < 1 || value.length > 1024) return false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value.charCodeAt(index);
    if (char < 32 || char === 127) return false;
  }
  return true;
}
function decodeLine(value: unknown): value is ServerSalesReturnLine {
  return exact(value, lineFields) &&
    id(value.id) && id(value.saleLineId) && id(value.productId) &&
    text(value.productName) && text(value.unitName) &&
    amount(value.qty) && value.qty > 0 && amount(value.valueMinor);
}
function decodeEntry(value: unknown): value is ServerSalesReturn {
  if (!exact(value, returnFields) ||
      !id(value.id) || !text(value.number) ||
      !id(value.saleId) || !text(value.saleNumber) ||
      !id(value.partyId) || !text(value.customerName) ||
      !businessDate(value.businessDate) ||
      !reasons.has(value.reason as SalesReturnReason) ||
      !nullableText(value.note) ||
      !amount(value.returnValueMinor) || !amount(value.refundMinor) ||
      value.refundMinor > value.returnValueMinor ||
      !amount(value.creditMinor) || value.creditMinor > value.returnValueMinor - value.refundMinor ||
      !nullableText(value.refundAccountCode) ||
      !nullableText(value.refundAccountName) ||
      !nullableText(value.approvedByName) ||
      !timestamp(value.createdAt) || !Array.isArray(value.lines)) return false;
  const lineIds = new Set<string>();
  const sourceIds = new Set<string>();
  for (const line of value.lines) {
    if (!decodeLine(line) || lineIds.has(line.id) || sourceIds.has(line.saleLineId)) return false;
    lineIds.add(line.id);
    sourceIds.add(line.saleLineId);
  }
  return true;
}

/** Preserve the backend's exact unwrapped response; never substitute preview data. */
export function decodeSalesReturnHistory(raw: unknown): ServerSalesReturnHistory {
  if (!exact(raw, ['returns', 'nextCursor', 'totalValueMinor', 'totalRefundMinor']) ||
      !Array.isArray(raw.returns) ||
      !(raw.nextCursor === null || cursor(raw.nextCursor)) ||
      !amount(raw.totalValueMinor) || !amount(raw.totalRefundMinor) ||
      raw.totalRefundMinor > raw.totalValueMinor) return invalid();
  const returnIds = new Set<string>();
  for (const item of raw.returns) {
    if (!decodeEntry(item) || returnIds.has(item.id)) return invalid();
    returnIds.add(item.id);
  }
  return raw as unknown as ServerSalesReturnHistory;
}

/** Authenticated GET-only source read; consumers own identity and session-epoch state. */
export async function readSalesReturnHistory(
  accessToken: string,
  query: SalesReturnHistoryQuery = {},
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerSalesReturnHistory> {
  if (typeof accessToken !== 'string' || !accessToken.trim() || /\s/.test(accessToken) ||
      !record(query) ||
      Object.keys(query).some(key => key !== 'cursor' && key !== 'limit') ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const limit = query.limit ?? 20;
  if (typeof limit !== 'number' || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) return invalid();
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  if (query.cursor !== undefined && query.cursor !== null) {
    if (!cursor(query.cursor)) return invalid();
    params.set('cursor', query.cursor);
  }
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'GET',
      path: ('/api/v1/sales-returns?' + params.toString()) as ApiRequest['path'],
      accessToken,
      signal: controller.signal,
    }, decodeSalesReturnHistory);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
