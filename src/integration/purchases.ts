import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { ApiRequest } from './http.ts';

/** MOD-008 T01-R/P1: current Nest GET-only purchasing contract; no posting or preview fallback. */
export interface ServerPurchaseQuery {
  search?: string;
  supplierPartyId?: string;
  fromDate?: string;
  toDate?: string;
  settlement?: 'ALL' | 'UNPAID' | 'PAID';
  cursor?: string;
  limit?: number;
}
export type ServerPurchaseStatus = 'POSTED' | 'VOIDED';
export interface ServerPurchaseListRow {
  id: string;
  number: string;
  supplierPartyId: string;
  supplierName: string;
  supplierBillRef: string | null;
  businessDate: string;
  dueDate: string | null;
  status: ServerPurchaseStatus;
  lineCount: number;
  overdue: boolean;
  grandTotalMinor?: number;
  paidMinor?: number;
  dueMinor?: number;
}
export interface ServerPurchaseSummary {
  purchaseCount: number;
  periodTotalMinor?: number;
  unpaidTotalMinor?: number;
  overdueTotalMinor?: number;
}
export interface ServerPurchaseList {
  data: ServerPurchaseListRow[];
  page: { nextCursor: string | null };
  summary: ServerPurchaseSummary;
}
export interface ServerPurchaseLine {
  id: string;
  productId: string;
  productName: string;
  unitName: string;
  qty: number;             // canonical base quantity, scale 3
  expiryDate: string | null;
  lotId: string;
  unitPriceMinor?: number; // poisha per base unit
  lineTotalMinor?: number;
  discountShareMinor?: number;
  extraCostShareMinor?: number;
  actualUnitCost?: number; // scale 4
}
export interface ServerPurchasePayment {
  id: string;
  number: string;
  businessDate: string;
  accountName: string;
  amountMinor: number;
}
export interface ServerPurchaseLandedCost {
  id: string;
  category: 'TRANSPORT' | 'LABOUR' | 'LOADING' | 'DELIVERY' | 'CUSTOMS' | 'OTHER';
  method: 'BY_VALUE' | 'BY_QTY' | 'MANUAL';
  amountMinor: number;
  inventoryShareMinor: number;
  cogsShareMinor: number;
  businessDate: string;
  addedLater: boolean;
  description: string | null;
  allocations: { purchaseLineId: string; amountMinor: number }[];
}
export interface ServerPurchase {
  id: string;
  number: string;
  version: number;
  supplierPartyId: string;
  supplierName: string;
  supplierBillRef: string | null;
  businessDate: string;
  dueDate: string | null;
  status: ServerPurchaseStatus;
  notes: string | null;
  lines: ServerPurchaseLine[];
  warnings: string[];
  createdAt: string;
  itemsTotalMinor?: number;
  discountMinor?: number;
  extraCostMinor?: number;
  landedCosts?: ServerPurchaseLandedCost[];
  grandTotalMinor?: number;
  paidMinor?: number;
  dueMinor?: number;
  paidAccountCode?: string | null;
  paidAccountName?: string | null;
  payments?: ServerPurchasePayment[];
}
export interface ServerPurchaseEnvelope { data: ServerPurchase }

const ulid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const rowKeys = ['id','number','supplierPartyId','supplierName','supplierBillRef',
  'businessDate','dueDate','status','lineCount','overdue'] as const;
const rowAmounts = ['grandTotalMinor','paidMinor','dueMinor'] as const;
const lineKeys = ['id','productId','productName','unitName','qty','expiryDate','lotId'] as const;
const lineAmounts = ['unitPriceMinor','lineTotalMinor','discountShareMinor',
  'extraCostShareMinor','actualUnitCost'] as const;
const detailKeys = ['id','number','version','supplierPartyId','supplierName','supplierBillRef',
  'businessDate','dueDate','status','notes','lines','warnings','createdAt'] as const;
const detailOptionals = ['itemsTotalMinor','discountMinor','extraCostMinor','landedCosts',
  'grandTotalMinor','paidMinor','dueMinor','paidAccountCode','paidAccountName','payments'] as const;
const detailAmounts = ['itemsTotalMinor','discountMinor','extraCostMinor',
  'grandTotalMinor','paidMinor','dueMinor'] as const;
const queryKeys = ['search','supplierPartyId','fromDate','toDate',
  'settlement','cursor','limit'] as const;
const categories = ['TRANSPORT','LABOUR','LOADING','DELIVERY','CUSTOMS','OTHER'];
const methods = ['BY_VALUE','BY_QTY','MANUAL'];

function invalid(): never {
  throw new ApiError('protocol', 'Purchase response or request could not be verified');
}
function record(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}
function exact(x: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []): boolean {
  return required.every(k => Object.prototype.hasOwnProperty.call(x, k)) &&
    Object.keys(x).every(k => required.includes(k) || optional.includes(k));
}
function int(x: unknown): x is number {
  return typeof x === 'number' && Number.isSafeInteger(x);
}
function money(x: unknown): boolean { return int(x) && x >= 0; }
function id(x: unknown): x is string { return typeof x === 'string' && ulid.test(x); }
function day(x: unknown): x is string {
  if (typeof x !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const [year, month, date] = x.split('-').map(Number);
  return year >= 1 && month >= 1 && month <= 12 && date >= 1 &&
    new Date(Date.UTC(year, month, 0)).getUTCDate() >= date;
}
function nullableDate(x: unknown): boolean { return x === null || day(x); }
function nullableText(x: unknown): boolean { return x === null || typeof x === 'string'; }
function purchaseStatus(x: unknown): boolean { return x === 'POSTED' || x === 'VOIDED'; }
function optionalMoney(x: Record<string, unknown>, fields: readonly string[]): boolean {
  return fields.every(k => !Object.prototype.hasOwnProperty.call(x, k) || money(x[k]));
}
function row(x: unknown): x is ServerPurchaseListRow {
  return record(x) && exact(x, rowKeys, rowAmounts) &&
    id(x.id) && id(x.supplierPartyId) && typeof x.number === 'string' &&
    typeof x.supplierName === 'string' && nullableText(x.supplierBillRef) &&
    day(x.businessDate) && nullableDate(x.dueDate) && purchaseStatus(x.status) &&
    money(x.lineCount) && typeof x.overdue === 'boolean' &&
    optionalMoney(x, rowAmounts);
}
function line(x: unknown): x is ServerPurchaseLine {
  return record(x) && exact(x, lineKeys, lineAmounts) &&
    id(x.id) && id(x.productId) && id(x.lotId) &&
    typeof x.productName === 'string' && typeof x.unitName === 'string' &&
    int(x.qty) && nullableDate(x.expiryDate) &&
    optionalMoney(x, lineAmounts);
}
function payment(x: unknown): x is ServerPurchasePayment {
  return record(x) && exact(x, ['id','number','businessDate','accountName','amountMinor']) &&
    id(x.id) && typeof x.number === 'string' && day(x.businessDate) &&
    typeof x.accountName === 'string' && money(x.amountMinor);
}
function allocation(x: unknown): boolean {
  return record(x) && exact(x, ['purchaseLineId','amountMinor']) &&
    id(x.purchaseLineId) && money(x.amountMinor);
}
function landed(x: unknown): x is ServerPurchaseLandedCost {
  return record(x) && exact(x, ['id','category','method','amountMinor',
    'inventoryShareMinor','cogsShareMinor','businessDate','addedLater',
    'description','allocations']) && id(x.id) &&
    categories.includes(String(x.category)) && methods.includes(String(x.method)) &&
    money(x.amountMinor) && money(x.inventoryShareMinor) && money(x.cogsShareMinor) &&
    day(x.businessDate) && typeof x.addedLater === 'boolean' &&
    nullableText(x.description) && Array.isArray(x.allocations) && x.allocations.every(allocation);
}
function purchase(x: unknown): x is ServerPurchase {
  if (!record(x) || !exact(x, detailKeys, detailOptionals) ||
    !id(x.id) || !id(x.supplierPartyId) || typeof x.number !== 'string' ||
    !money(x.version) || typeof x.supplierName !== 'string' ||
    !nullableText(x.supplierBillRef) || !day(x.businessDate) ||
    !nullableDate(x.dueDate) || !purchaseStatus(x.status) || !nullableText(x.notes) ||
    !Array.isArray(x.lines) || !x.lines.every(line) ||
    !Array.isArray(x.warnings) || !x.warnings.every(v => typeof v === 'string') ||
    typeof x.createdAt !== 'string' || !Number.isFinite(Date.parse(x.createdAt))) return false;
  return optionalMoney(x, detailAmounts) &&
    ['paidAccountCode','paidAccountName'].every(k =>
      !Object.prototype.hasOwnProperty.call(x, k) || nullableText(x[k])) &&
    (!Object.prototype.hasOwnProperty.call(x, 'landedCosts') ||
      (Array.isArray(x.landedCosts) && x.landedCosts.every(landed))) &&
    (!Object.prototype.hasOwnProperty.call(x, 'payments') ||
      (Array.isArray(x.payments) && x.payments.every(payment)));
}
export function decodePurchaseList(raw: unknown): ServerPurchaseList {
  if (!record(raw) || !exact(raw, ['data','page','summary']) ||
    !Array.isArray(raw.data) || !raw.data.every(row) ||
    !record(raw.page) || !exact(raw.page, ['nextCursor']) ||
    (raw.page.nextCursor !== null && !id(raw.page.nextCursor)) ||
    !record(raw.summary) ||
    !exact(raw.summary, ['purchaseCount'],
      ['periodTotalMinor','unpaidTotalMinor','overdueTotalMinor']) ||
    !money(raw.summary.purchaseCount) ||
    !optionalMoney(raw.summary, ['periodTotalMinor','unpaidTotalMinor','overdueTotalMinor'])) return invalid();
  return raw as unknown as ServerPurchaseList;
}
export function decodePurchase(raw: unknown): ServerPurchaseEnvelope {
  if (!record(raw) || !exact(raw, ['data']) || !purchase(raw.data)) return invalid();
  return raw as unknown as ServerPurchaseEnvelope;
}
function queryPath(query: ServerPurchaseQuery): ApiRequest['path'] {
  if (!record(query) || Object.keys(query).some(k =>
      !queryKeys.includes(k as typeof queryKeys[number]))) return invalid();
  const params = new URLSearchParams();
  for (const key of queryKeys) {
    const value: unknown = query[key];
    if (value === undefined) continue;
    if (key === 'search') {
      if (typeof value !== 'string' || value.trim().length > 80) return invalid();
      params.set(key, value.trim());
    } else if (key === 'supplierPartyId' || key === 'cursor') {
      if (!id(value)) return invalid();
      params.set(key, value);
    } else if (key === 'fromDate' || key === 'toDate') {
      if (!day(value)) return invalid();
      params.set(key, value);
    } else if (key === 'settlement') {
      if (value !== 'ALL' && value !== 'UNPAID' && value !== 'PAID') return invalid();
      params.set(key, value);
    } else if (key === 'limit') {
      if (!int(value) || value < 1 || value > 100) return invalid();
      params.set(key, String(value));
    }
  }
  const suffix = params.toString();
  return (suffix ? '/api/v1/purchases?' + suffix : '/api/v1/purchases') as ApiRequest['path'];
}
async function read<T>(
  accessToken: string,
  path: ApiRequest['path'],
  decode: (raw: unknown) => T,
  signal?: AbortSignal,
  timeoutMs = 12_000,
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
    }, decode);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}

/** No implicit mutation, retry, preview source or global cache. */
export function readPurchases(
  accessToken: string,
  query: ServerPurchaseQuery = {},
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerPurchaseList> {
  return read(accessToken, queryPath(query), decodePurchaseList, signal, timeoutMs);
}
export function readPurchase(
  accessToken: string,
  purchaseId: string,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerPurchaseEnvelope> {
  if (!id(purchaseId)) return Promise.reject(new ApiError('protocol', 'Invalid purchase ID'));
  return read(accessToken, ('/api/v1/purchases/' + purchaseId) as ApiRequest['path'],
    decodePurchase, signal, timeoutMs);
}
