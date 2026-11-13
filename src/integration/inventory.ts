import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/**
 * MOD-003 T01-R/P1: strict tenant-authenticated inventory read adapter.
 * Server quantity fields are base units scaled by 1000; cost fields remain
 * optional and are never synthesized for users lacking COST_VIEW.
 */
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'ZERO_STOCK' | 'NEGATIVE_STOCK';
export type AdjustmentReason = 'DAMAGE' | 'RECOUNT' | 'THEFT_LOSS' | 'OTHER';

export interface InventoryStockRow {
  productId: string; productName: string; productStatus: 'ACTIVE' | 'INACTIVE';
  baseUnitName: string; tracksExpiry: boolean;
  locationId: string | null; locationName: string | null;
  qtyOnHand: number; minStockQty: number; stockStatus: StockStatus;
  valueMinor?: number;
}
export interface InventoryMovement {
  id: string; productId: string; productName: string; locationName: string;
  lotId: string | null; qty: number; direction: 'IN' | 'OUT';
  sourceType: string; sourceId: string; sourceNumber: string;
  businessDate: string; createdAt: string; unitCost?: number;
}
export interface InventoryOverviewEnvelope {
  data: { stock: InventoryStockRow[]; movements: InventoryMovement[] };
}
export interface InventoryLot {
  id: string; productId: string; productName: string;
  locationId: string; locationName: string; ownerType: 'OWNED' | 'VENDOR';
  sourceType: string; sourceId: string; sourceNumber: string;
  qtyReceived: number; qtyRemaining: number;
  expiryDate: string | null; status: 'OPEN' | 'CLOSED'; businessDate: string;
  purchaseUnitCost?: number; actualUnitCost?: number;
  landedCostTotal?: number; valueMinor?: number;
}
export interface InventoryExpirySummary {
  expiredCount: number; expiredValueMinor?: number;
  soonCount: number; missingCount: number; warnDays: number;
}
export interface InventoryLotPageEnvelope {
  data: {
    data: InventoryLot[];
    page: { nextCursor: string | null; hasMore: boolean };
    valuationMethod: 'FIFO' | 'AVERAGE';
    expiry?: InventoryExpirySummary;
  };
}
export interface InventoryAdjustmentRow {
  id: string; number: string; productId: string; productName: string;
  locationName: string; qtyDelta: number; direction: 'IN' | 'OUT';
  qty: number; reason: AdjustmentReason; note: string | null;
  businessDate: string; createdAt: string; createdByName: string;
  valueMinor?: number;
}
export interface InventoryAdjustmentsEnvelope { data: InventoryAdjustmentRow[] }

export interface InventoryReportQuery {
  fromDate?: string; toDate?: string; productId?: string; limit?: number;
}
export interface InventoryLotsQuery {
  productId?: string; expiringOnly?: boolean;
  expiry?: 'EXPIRED' | 'SOON' | 'MISSING';
  status?: 'OPEN' | 'CLOSED'; cursor?: string;
  limit?: number; sort?: 'businessDate' | 'expiryDate' | 'qtyReceived' | 'qtyRemaining' | 'status';
  direction?: 'ASC' | 'DESC';
}

const ulid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const reportKeys = ['fromDate', 'toDate', 'productId', 'limit'] as const;
const lotKeys = ['productId', 'expiringOnly', 'expiry', 'status', 'cursor', 'limit', 'sort', 'direction'] as const;
const stockStates = ['IN_STOCK', 'LOW_STOCK', 'ZERO_STOCK', 'NEGATIVE_STOCK'] as const;
const sorts = ['businessDate', 'expiryDate', 'qtyReceived', 'qtyRemaining', 'status'] as const;
const adjustmentReasons = ['DAMAGE', 'RECOUNT', 'THEFT_LOSS', 'OTHER'] as const;

function invalid(): never { throw new ApiError('protocol', 'Inventory request or response could not be verified'); }
function record(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === 'object' && raw !== null && !Array.isArray(raw);
}
function exact(raw: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []): boolean {
  return required.every(k => Object.prototype.hasOwnProperty.call(raw, k)) &&
    Object.keys(raw).every(k => required.includes(k) || optional.includes(k));
}
function text(raw: unknown): raw is string { return typeof raw === 'string'; }
function id(raw: unknown): raw is string { return text(raw) && ulid.test(raw); }
function nullableId(raw: unknown): boolean { return raw === null || id(raw); }
function integer(raw: unknown): raw is number { return typeof raw === 'number' && Number.isSafeInteger(raw); }
function optionalInt(raw: Record<string, unknown>, key: string): boolean {
  return !Object.prototype.hasOwnProperty.call(raw, key) || integer(raw[key]);
}
function oneOf(raw: unknown, choices: readonly string[]): boolean { return text(raw) && choices.includes(raw); }
function date(raw: unknown): raw is string {
  return text(raw) && /^\d{4}-\d{2}-\d{2}$/.test(raw) &&
    !Number.isNaN(Date.parse(raw + 'T00:00:00Z')) &&
    new Date(raw + 'T00:00:00Z').toISOString().slice(0, 10) === raw;
}
function nullableDate(raw: unknown): boolean { return raw === null || date(raw); }

function stockRow(raw: unknown): raw is InventoryStockRow {
  if (!record(raw) || !exact(raw, [
    'productId', 'productName', 'productStatus', 'baseUnitName', 'tracksExpiry',
    'locationId', 'locationName', 'qtyOnHand', 'minStockQty', 'stockStatus',
  ], ['valueMinor'])) return false;
  return id(raw.productId) && text(raw.productName) &&
    oneOf(raw.productStatus, ['ACTIVE', 'INACTIVE']) && text(raw.baseUnitName) &&
    typeof raw.tracksExpiry === 'boolean' && nullableId(raw.locationId) &&
    (raw.locationName === null || text(raw.locationName)) &&
    integer(raw.qtyOnHand) && integer(raw.minStockQty) &&
    oneOf(raw.stockStatus, stockStates) && optionalInt(raw, 'valueMinor');
}
function movement(raw: unknown): raw is InventoryMovement {
  if (!record(raw) || !exact(raw, [
    'id', 'productId', 'productName', 'locationName', 'lotId', 'qty',
    'direction', 'sourceType', 'sourceId', 'sourceNumber', 'businessDate', 'createdAt',
  ], ['unitCost'])) return false;
  return id(raw.id) && id(raw.productId) && text(raw.productName) && text(raw.locationName) &&
    nullableId(raw.lotId) && integer(raw.qty) && oneOf(raw.direction, ['IN', 'OUT']) &&
    text(raw.sourceType) && id(raw.sourceId) && text(raw.sourceNumber) &&
    date(raw.businessDate) && text(raw.createdAt) && optionalInt(raw, 'unitCost');
}
function lot(raw: unknown): raw is InventoryLot {
  if (!record(raw) || !exact(raw, [
    'id', 'productId', 'productName', 'locationId', 'locationName', 'ownerType',
    'sourceType', 'sourceId', 'sourceNumber', 'qtyReceived', 'qtyRemaining',
    'expiryDate', 'status', 'businessDate',
  ], ['purchaseUnitCost', 'actualUnitCost', 'landedCostTotal', 'valueMinor'])) return false;
  return id(raw.id) && id(raw.productId) && text(raw.productName) &&
    id(raw.locationId) && text(raw.locationName) &&
    oneOf(raw.ownerType, ['OWNED', 'VENDOR']) && text(raw.sourceType) &&
    id(raw.sourceId) && text(raw.sourceNumber) &&
    integer(raw.qtyReceived) && integer(raw.qtyRemaining) &&
    nullableDate(raw.expiryDate) && oneOf(raw.status, ['OPEN', 'CLOSED']) &&
    date(raw.businessDate) &&
    ['purchaseUnitCost', 'actualUnitCost', 'landedCostTotal', 'valueMinor'].every(k => optionalInt(raw, k));
}
function expirySummary(raw: unknown): raw is InventoryExpirySummary {
  if (!record(raw) || !exact(raw, [
    'expiredCount', 'soonCount', 'missingCount', 'warnDays',
  ], ['expiredValueMinor'])) return false;
  return ['expiredCount', 'soonCount', 'missingCount', 'warnDays']
    .every(k => integer(raw[k]) && (raw[k] as number) >= 0) &&
    optionalInt(raw, 'expiredValueMinor');
}
function adjustment(raw: unknown): raw is InventoryAdjustmentRow {
  if (!record(raw) || !exact(raw, [
    'id', 'number', 'productId', 'productName', 'locationName', 'qtyDelta',
    'direction', 'qty', 'reason', 'note', 'businessDate', 'createdAt', 'createdByName',
  ], ['valueMinor'])) return false;
  return id(raw.id) && text(raw.number) && id(raw.productId) &&
    text(raw.productName) && text(raw.locationName) && integer(raw.qtyDelta) &&
    oneOf(raw.direction, ['IN', 'OUT']) && integer(raw.qty) &&
    oneOf(raw.reason, adjustmentReasons) &&
    (raw.note === null || text(raw.note)) &&
    date(raw.businessDate) && text(raw.createdAt) && text(raw.createdByName) &&
    optionalInt(raw, 'valueMinor');
}

export function decodeInventoryOverview(raw: unknown): InventoryOverviewEnvelope {
  if (!record(raw) || !exact(raw, ['data']) || !record(raw.data) ||
      !exact(raw.data, ['stock', 'movements']) ||
      !Array.isArray(raw.data.stock) || !raw.data.stock.every(stockRow) ||
      !Array.isArray(raw.data.movements) || !raw.data.movements.every(movement)) return invalid();
  return raw as unknown as InventoryOverviewEnvelope;
}
export function decodeInventoryLotPage(raw: unknown): InventoryLotPageEnvelope {
  if (!record(raw) || !exact(raw, ['data']) || !record(raw.data) ||
      !exact(raw.data, ['data', 'page', 'valuationMethod'], ['expiry']) ||
      !Array.isArray(raw.data.data) || !raw.data.data.every(lot) ||
      !record(raw.data.page) || !exact(raw.data.page, ['nextCursor', 'hasMore']) ||
      !nullableId(raw.data.page.nextCursor) ||
      typeof raw.data.page.hasMore !== 'boolean' ||
      !oneOf(raw.data.valuationMethod, ['FIFO', 'AVERAGE']) ||
      (Object.prototype.hasOwnProperty.call(raw.data, 'expiry') && !expirySummary(raw.data.expiry))) return invalid();
  return raw as unknown as InventoryLotPageEnvelope;
}
export function decodeInventoryAdjustments(raw: unknown): InventoryAdjustmentsEnvelope {
  if (!record(raw) || !exact(raw, ['data']) || !Array.isArray(raw.data) ||
      !raw.data.every(adjustment)) return invalid();
  return raw as unknown as InventoryAdjustmentsEnvelope;
}

function queryInput(query: unknown, allowed: readonly string[]): Record<string, unknown> {
  if (!record(query) || Object.keys(query).some(k => !allowed.includes(k))) return invalid();
  return query;
}
function reportPath(base: string, query: InventoryReportQuery): Parameters<typeof requestJson>[0]['path'] {
  const input = queryInput(query, reportKeys);
  const params = new URLSearchParams();
  for (const key of reportKeys) {
    const value = input[key];
    if (value === undefined) continue;
    if (key === 'productId') {
      if (!id(value)) return invalid();
    } else if (key === 'limit') {
      if (!integer(value) || value < 1 || value > 500) return invalid();
    } else if (!date(value)) return invalid();
    params.set(key, String(value));
  }
  if (input.fromDate !== undefined && input.toDate !== undefined &&
      String(input.fromDate) > String(input.toDate)) return invalid();
  const suffix = params.toString();
  return (suffix ? base + '?' + suffix : base) as Parameters<typeof requestJson>[0]['path'];
}
function lotPath(query: InventoryLotsQuery): Parameters<typeof requestJson>[0]['path'] {
  const input = queryInput(query, lotKeys);
  const params = new URLSearchParams();
  for (const key of lotKeys) {
    const value = input[key];
    if (value === undefined) continue;
    if (key === 'productId' || key === 'cursor') {
      if (!id(value)) return invalid();
    } else if (key === 'expiringOnly') {
      if (typeof value !== 'boolean') return invalid();
      // Backend boolean coercion treats the string "false" as true. Omit false.
      if (!value) continue;
    } else if (key === 'expiry') {
      if (!oneOf(value, ['EXPIRED', 'SOON', 'MISSING'])) return invalid();
    } else if (key === 'status') {
      if (!oneOf(value, ['OPEN', 'CLOSED'])) return invalid();
    } else if (key === 'sort') {
      if (!oneOf(value, sorts)) return invalid();
    } else if (key === 'direction') {
      if (!oneOf(value, ['ASC', 'DESC'])) return invalid();
    } else if (key === 'limit') {
      if (!integer(value) || value < 1 || value > 100) return invalid();
    }
    params.set(key, String(value));
  }
  const suffix = params.toString();
  return (suffix ? '/api/v1/inventory/lots?' + suffix : '/api/v1/inventory/lots') as Parameters<typeof requestJson>[0]['path'];
}

/** No response caching, financial retry, local stock math or preview fallback. */
async function read<T>(accessToken: string, path: Parameters<typeof requestJson>[0]['path'],
  decode: (raw: unknown) => T, signal?: AbortSignal, timeoutMs = 12_000): Promise<T> {
  if (!integer(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  if (signal?.aborted) throw new ApiError('network', 'Inventory request cancelled');
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) abort();
  const deadline = setTimeout(abort, timeoutMs);
  try {
    if (controller.signal.aborted) throw new ApiError('network', 'Inventory request cancelled');
    const result = await requestJson({
      method: 'GET', path, accessToken, signal: controller.signal,
    }, decode);
    if (controller.signal.aborted) throw new ApiError('network', 'Inventory request cancelled');
    return result;
  } finally {
    clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
export async function readInventoryOverview(accessToken: string, query: InventoryReportQuery = {},
  signal?: AbortSignal, timeoutMs?: number): Promise<InventoryOverviewEnvelope> {
  return read(accessToken, reportPath('/api/v1/inventory', query), decodeInventoryOverview, signal, timeoutMs);
}
export async function readInventoryLots(accessToken: string, query: InventoryLotsQuery = {},
  signal?: AbortSignal, timeoutMs?: number): Promise<InventoryLotPageEnvelope> {
  return read(accessToken, lotPath(query), decodeInventoryLotPage, signal, timeoutMs);
}
export async function readInventoryAdjustments(accessToken: string, query: InventoryReportQuery = {},
  signal?: AbortSignal, timeoutMs?: number): Promise<InventoryAdjustmentsEnvelope> {
  return read(accessToken, reportPath('/api/v1/inventory/adjustments', query),
    decodeInventoryAdjustments, signal, timeoutMs);
}
