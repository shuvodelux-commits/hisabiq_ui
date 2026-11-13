import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { ApiRequest } from './http.ts';

/**
 * MOD-009 R09-SALE-LIST-07 — UNMOUNTED original Sales invoice list GET.
 *
 * Backend source: SalesController.list -> SaleQueryService.list under sale.view.
 * The response is UNWRAPPED: { items, nextCursor, totals }, not { data }.
 * All money is server-recorded integer poisha. Due and aggregate values
 * are preserved as signed integers; no invented paid/return/credit status.
 *
 * Source of truth is the authenticated server, NOT the existing Sales preview.
 * Never use these read models as a command or an accounting calculation.
 */
export type ServerSaleOrigin = 'ONLINE' | 'OFFLINE';
export type ServerSaleStatus = 'POSTED' | 'VOIDED';
export type ServerSaleAgeing = 'NOT_DUE' | 'D1_30' | 'D31_60' | 'D61_90' | 'D90_PLUS';

export interface ServerSalesInvoiceRow {
  originMode: ServerSaleOrigin;
  id: string;
  number: string;
  partyId: string;
  customerName: string;
  customerPhone: string | null;
  businessDate: string;
  dueDate: string | null;
  status: ServerSaleStatus;
  grandTotalMinor: number;
  paidMinor: number;
  dueMinor: number;
  ageing: ServerSaleAgeing;
}
export interface ServerSalesInvoices {
  items: ServerSalesInvoiceRow[];
  nextCursor: string | null;
  totals: {
    salesMinor: number;
    receivedMinor: number;
    dueMinor: number;
    invoiceCount: number;
  };
}
export interface SalesInvoicesQuery {
  search?: string;
  partyId?: string;
  fromDate?: string;
  toDate?: string;
  unpaidOnly?: boolean;
  origin?: 'ALL' | ServerSaleOrigin;
  cursor?: string;
  limit?: number;
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const origins = new Set<ServerSaleOrigin>(['ONLINE', 'OFFLINE']);
const statuses = new Set<ServerSaleStatus>(['POSTED', 'VOIDED']);
const ageing = new Set<ServerSaleAgeing>(['NOT_DUE', 'D1_30', 'D31_60', 'D61_90', 'D90_PLUS']);
const allowedQuery = [
  'search', 'partyId', 'fromDate', 'toDate', 'unpaidOnly', 'origin', 'cursor', 'limit',
] as const;
const rowFields = [
  'originMode', 'id', 'number', 'partyId', 'customerName',
  'customerPhone', 'businessDate', 'dueDate', 'status',
  'grandTotalMinor', 'paidMinor', 'dueMinor', 'ageing',
] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Invalid server Sales invoices response or request');
}
function record(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}
function exact(x: unknown, keys: readonly string[]): x is Record<string, unknown> {
  return record(x) && Object.keys(x).length === keys.length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(x, key));
}
function id(x: unknown): x is string {
  return typeof x === 'string' && ULID.test(x);
}
function integer(x: unknown): x is number {
  return typeof x === 'number' && Number.isSafeInteger(x);
}
function day(x: unknown): x is string {
  if (typeof x !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const date = new Date(x + 'T00:00:00.000Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === x;
}
function row(x: unknown): x is ServerSalesInvoiceRow {
  return exact(x, rowFields) &&
    origins.has(x.originMode as ServerSaleOrigin) && id(x.id) &&
    typeof x.number === 'string' && id(x.partyId) &&
    typeof x.customerName === 'string' &&
    (x.customerPhone === null || typeof x.customerPhone === 'string') &&
    day(x.businessDate) && (x.dueDate === null || day(x.dueDate)) &&
    statuses.has(x.status as ServerSaleStatus) &&
    integer(x.grandTotalMinor) && integer(x.paidMinor) && integer(x.dueMinor) &&
    ageing.has(x.ageing as ServerSaleAgeing);
}

/** Fails closed on unexpected response fields, duplicate IDs and unsafe amounts. */
export function decodeSalesInvoices(raw: unknown): ServerSalesInvoices {
  if (!exact(raw, ['items', 'nextCursor', 'totals']) ||
      !Array.isArray(raw.items) ||
      !(raw.nextCursor === null || id(raw.nextCursor)) ||
      !exact(raw.totals, ['salesMinor', 'receivedMinor', 'dueMinor', 'invoiceCount']) ||
      !integer(raw.totals.salesMinor) || !integer(raw.totals.receivedMinor) ||
      !integer(raw.totals.dueMinor) ||
      !integer(raw.totals.invoiceCount) || raw.totals.invoiceCount < 0) return invalid();

  const seen = new Set<string>();
  for (const item of raw.items) {
    if (!row(item) || seen.has(item.id)) return invalid();
    seen.add(item.id);
  }
  return raw as unknown as ServerSalesInvoices;
}

function salesListPath(query: SalesInvoicesQuery): ApiRequest['path'] {
  if (!record(query) || Object.keys(query).some(key => !allowedQuery.includes(key as typeof allowedQuery[number]))) return invalid();
  const params = new URLSearchParams();
  if (query.search !== undefined) {
    if (typeof query.search !== 'string' || query.search.trim().length > 64) return invalid();
    params.set('search', query.search.trim());
  }
  if (query.partyId !== undefined) {
    if (!id(query.partyId)) return invalid();
    params.set('partyId', query.partyId);
  }
  for (const key of ['fromDate', 'toDate'] as const) {
    if (query[key] !== undefined) {
      if (!day(query[key])) return invalid();
      params.set(key, query[key]);
    }
  }
  if (query.unpaidOnly !== undefined) {
    if (typeof query.unpaidOnly !== 'boolean') return invalid();
    // Backend currently uses z.coerce.boolean(): the string "false" becomes true.
    // Omission is the only safe representation of false for this endpoint.
    if (query.unpaidOnly) params.set('unpaidOnly', 'true');
  }
  const selectedOrigin: unknown = query.origin;
  if (selectedOrigin !== undefined) {
    if (selectedOrigin !== 'ALL' && selectedOrigin !== 'ONLINE' && selectedOrigin !== 'OFFLINE') return invalid();
    params.set('origin', selectedOrigin);
  }
  if (query.cursor !== undefined) {
    if (!id(query.cursor)) return invalid();
    params.set('cursor', query.cursor);
  }
  const limit = query.limit ?? 20;
  if (typeof limit !== 'number' || !Number.isSafeInteger(limit) || limit < 1 || limit > 200) return invalid();
  params.set('limit', String(limit));
  return ('/api/v1/sales?' + params.toString()) as ApiRequest['path'];
}

/**
 * Authenticated GET only; no cache, sample rows, mutation or stored credentials.
 * The future consumer must bind response visibility to its verified tenant,
 * user, token, epoch, filter and cursor and cancel on identity changes.
 */
export async function readSalesInvoices(
  accessToken: string,
  query: SalesInvoicesQuery = {},
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerSalesInvoices> {
  if (typeof accessToken !== 'string' || !accessToken.trim() || /\s/.test(accessToken) ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const path = salesListPath(query);
  if (signal?.aborted) throw new ApiError('network', 'Sales invoice request was aborted');
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'GET', path, accessToken, signal: controller.signal,
    }, decodeSalesInvoices);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
