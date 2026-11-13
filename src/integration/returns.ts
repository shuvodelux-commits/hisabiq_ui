import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { ApiRequest } from './http.ts';

/**
 * MOD-009 R09-GET-01: read-only original-document returnability.
 *
 * These are source facts, NOT a refund/credit preview or posting contract.
 * The Nest endpoints currently require SALES_RETURN_CREATE and
 * PURCHASE_RETURN_CREATE respectively, even for GET. No client-side
 * permission substitution, optimistic mutation, preview fallback or caching.
 *
 * Quantities use scale-3 integers, money integer poisha, and the supplier's
 * actualUnitCost uses the backend's scale-4 integer cost.
 */

export interface ReturnableSaleSerial {
  id: string;
  serialNo: string;
  sourceType: 'OWNED' | 'VENDOR';
  vendorPartyId: string | null;
}
export interface ReturnableSaleLine {
  saleLineId: string;
  productId: string;
  productName: string;
  unitName: string;
  qtySold: number;
  qtyReturned: number;
  valueReturnedMinor: number;
  qtyReturnable: number;
  unitPriceMinor: number;
  netAmountMinor: number;
  returnable: boolean;
  tracksSerial: boolean;
  serials: ReturnableSaleSerial[];
}
export interface ReturnableSale {
  saleId: string;
  number: string;
  businessDate: string;
  customerName: string;
  customerPhone: string | null;
  customerAddress: string | null;
  customerGuardianName: string | null;
  partyId: string;
  isWalkIn: boolean;
  grandTotalMinor: number;
  dueMinor: number;
  lines: ReturnableSaleLine[];
  refundLimit: {
    perReturnMinor: number | null;
    perDayMinor: number | null;
    usedTodayMinor: number;
  };
}
export interface ReturnableSaleEnvelope { data: ReturnableSale }

export interface ReturnablePurchaseLine {
  purchaseLineId: string;
  productId: string;
  productName: string;
  unitName: string;
  lotId: string;
  qtyReceived: number;
  qtyReturned: number;
  valueReturnedMinor: number;
  costReturnedMinor: number;
  qtyReturnable: number;
  qtyRemainingInLot: number;
  billedNetMinor: number;
  actualUnitCost: number;
}
export interface ReturnablePurchase {
  purchaseId: string;
  number: string;
  businessDate: string;
  supplierName: string;
  supplierPartyId: string;
  grandTotalMinor: number;
  outstandingMinor: number;
  lines: ReturnablePurchaseLine[];
}
export interface ReturnablePurchaseEnvelope { data: ReturnablePurchase }

const ulid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const saleFields = [
  'saleId', 'number', 'businessDate', 'customerName', 'customerPhone',
  'customerAddress', 'customerGuardianName', 'partyId', 'isWalkIn',
  'grandTotalMinor', 'dueMinor', 'lines', 'refundLimit',
] as const;
const saleLineFields = [
  'saleLineId', 'productId', 'productName', 'unitName',
  'qtySold', 'qtyReturned', 'valueReturnedMinor', 'qtyReturnable',
  'unitPriceMinor', 'netAmountMinor', 'returnable', 'tracksSerial', 'serials',
] as const;
const purchaseFields = [
  'purchaseId', 'number', 'businessDate', 'supplierName',
  'supplierPartyId', 'grandTotalMinor', 'outstandingMinor', 'lines',
] as const;
const purchaseLineFields = [
  'purchaseLineId', 'productId', 'productName', 'unitName', 'lotId',
  'qtyReceived', 'qtyReturned', 'valueReturnedMinor', 'costReturnedMinor',
  'qtyReturnable', 'qtyRemainingInLot', 'billedNetMinor', 'actualUnitCost',
] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Invalid returnable source response or request');
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exact(value: unknown, expected: readonly string[]): value is Record<string, unknown> {
  return record(value) && Object.keys(value).length === expected.length &&
    expected.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function id(value: unknown): value is string {
  return typeof value === 'string' && ulid.test(value);
}
function text(value: unknown): value is string {
  return typeof value === 'string';
}
function optionalText(value: unknown): value is string | null {
  return value === null || text(value);
}
function integer(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}
function amount(value: unknown): value is number {
  return integer(value) && value >= 0;
}
function optionalAmount(value: unknown): value is number | null {
  return value === null || amount(value);
}
function date(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function saleLine(value: unknown, serialIds: Set<string>): value is ReturnableSaleLine {
  if (!exact(value, saleLineFields) || !id(value.saleLineId) || !id(value.productId) ||
      !text(value.productName) || !text(value.unitName) ||
      !amount(value.qtySold) || value.qtySold === 0 ||
      !amount(value.qtyReturned) || value.qtyReturned > value.qtySold ||
      !amount(value.qtyReturnable) || value.qtyReturnable !== value.qtySold - value.qtyReturned ||
      !amount(value.valueReturnedMinor) || !amount(value.unitPriceMinor) ||
      !amount(value.netAmountMinor) || value.valueReturnedMinor > value.netAmountMinor ||
      typeof value.returnable !== 'boolean' || typeof value.tracksSerial !== 'boolean' ||
      !Array.isArray(value.serials)) return false;
  for (const serial of value.serials) {
    if (!exact(serial, ['id', 'serialNo', 'sourceType', 'vendorPartyId']) ||
        !id(serial.id) || !text(serial.serialNo) ||
        (serial.sourceType !== 'OWNED' && serial.sourceType !== 'VENDOR') ||
        (serial.vendorPartyId !== null && !id(serial.vendorPartyId)) ||
        serialIds.has(serial.id)) return false;
    serialIds.add(serial.id);
  }
  return true;
}
function purchaseLine(value: unknown): value is ReturnablePurchaseLine {
  if (!exact(value, purchaseLineFields) || !id(value.purchaseLineId) ||
      !id(value.productId) || !id(value.lotId) ||
      !text(value.productName) || !text(value.unitName) ||
      !amount(value.qtyReceived) || value.qtyReceived === 0 ||
      !amount(value.qtyReturned) || value.qtyReturned > value.qtyReceived ||
      !amount(value.qtyReturnable) || value.qtyReturnable !== value.qtyReceived - value.qtyReturned ||
      !amount(value.qtyRemainingInLot) || !amount(value.billedNetMinor) ||
      !amount(value.valueReturnedMinor) || value.valueReturnedMinor > value.billedNetMinor ||
      !amount(value.costReturnedMinor) || !amount(value.actualUnitCost)) return false;
  return true;
}

/** Strictly preserve the server's exact envelope; fail closed on history corruption. */
export function decodeReturnableSale(raw: unknown): ReturnableSaleEnvelope {
  if (!exact(raw, ['data']) || !exact(raw.data, saleFields)) return invalid();
  const data = raw.data;
  if (!id(data.saleId) || !text(data.number) || !date(data.businessDate) ||
      !text(data.customerName) || !optionalText(data.customerPhone) ||
      !optionalText(data.customerAddress) || !optionalText(data.customerGuardianName) ||
      !id(data.partyId) || typeof data.isWalkIn !== 'boolean' ||
      !amount(data.grandTotalMinor) || !integer(data.dueMinor) ||
      !Array.isArray(data.lines) ||
      !exact(data.refundLimit, ['perReturnMinor', 'perDayMinor', 'usedTodayMinor']) ||
      !optionalAmount(data.refundLimit.perReturnMinor) ||
      !optionalAmount(data.refundLimit.perDayMinor) ||
      !amount(data.refundLimit.usedTodayMinor)) return invalid();
  const lineIds = new Set<string>();
  const serialIds = new Set<string>();
  for (const line of data.lines) {
    if (!saleLine(line, serialIds) || lineIds.has(line.saleLineId)) return invalid();
    lineIds.add(line.saleLineId);
  }
  return raw as unknown as ReturnableSaleEnvelope;
}
export function decodeReturnablePurchase(raw: unknown): ReturnablePurchaseEnvelope {
  if (!exact(raw, ['data']) || !exact(raw.data, purchaseFields)) return invalid();
  const data = raw.data;
  if (!id(data.purchaseId) || !text(data.number) || !date(data.businessDate) ||
      !text(data.supplierName) || !id(data.supplierPartyId) ||
      !amount(data.grandTotalMinor) || !integer(data.outstandingMinor) ||
      !Array.isArray(data.lines)) return invalid();
  const lineIds = new Set<string>();
  for (const line of data.lines) {
    if (!purchaseLine(line) || lineIds.has(line.purchaseLineId)) return invalid();
    lineIds.add(line.purchaseLineId);
  }
  return raw as unknown as ReturnablePurchaseEnvelope;
}

/** Use the shared authenticated same-origin transport; never store an answer. */
async function read<T>(
  accessToken: string, path: ApiRequest['path'],
  decoder: (raw: unknown) => T,
  signal?: AbortSignal, timeoutMs = 12_000,
): Promise<T> {
  if (typeof accessToken !== 'string' || !accessToken.trim() ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'GET', path, accessToken, signal: controller.signal,
    }, decoder);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}

/** Source ID and response ID must agree; a stale tenant/source response is never substituted. */
export async function readReturnableSale(
  accessToken: string, saleId: string, signal?: AbortSignal, timeoutMs?: number,
): Promise<ReturnableSaleEnvelope> {
  if (!id(saleId)) return invalid();
  return read(accessToken,
    ('/api/v1/sales-returns/returnable/' + saleId) as ApiRequest['path'],
    (raw) => {
      const envelope = decodeReturnableSale(raw);
      if (envelope.data.saleId !== saleId) return invalid();
      return envelope;
    }, signal, timeoutMs);
}
export async function readReturnablePurchase(
  accessToken: string, purchaseId: string, signal?: AbortSignal, timeoutMs?: number,
): Promise<ReturnablePurchaseEnvelope> {
  if (!id(purchaseId)) return invalid();
  return read(accessToken,
    ('/api/v1/purchase-returns/returnable/' + purchaseId) as ApiRequest['path'],
    (raw) => {
      const envelope = decodeReturnablePurchase(raw);
      if (envelope.data.purchaseId !== purchaseId) return invalid();
      return envelope;
    }, signal, timeoutMs);
}
