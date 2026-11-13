import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { ApiRequest } from './http.ts';

/**
 * MOD-009 R09-SALE-DETAIL-08: GET-only original Sales invoice detail.
 * Unmounted; sale.view is required by the backend. inventory.cost.view
 * separately gates optional costMinor/cogsMinor/profitMinor on the wire.
 *
 * No client calculation or inference of account, profit, refund, cash-session
 * eligibility, balance, source stock or correction amounts is authorized.
 */
export type SaleDetailStatus = 'POSTED' | 'VOIDED';
export type SaleDetailOrigin = 'ONLINE' | 'OFFLINE';
export type SaleDetailAgeing = 'NOT_DUE' | 'D1_30' | 'D31_60' | 'D61_90' | 'D90_PLUS';
export type SaleDetailSource = 'OWN_STOCK' | 'VENDOR_CONSIGNMENT';
export type SaleAllocationSource = 'OWNED' | 'VENDOR' | 'NEGATIVE';

export interface SaleDetailAllocation {
  sourceType: SaleAllocationSource;
  qty: number;
  vendorPartyId: string | null;
  serialUnitIds: string[];
  id: string;
  ownedLotId: string | null;
  vendorStockReceiptId: string | null;
  vendorLotId: string | null;
  inventoryUnitId: string | null;
  serialNo: string | null;
  unitCostUsed: number | null;
}
export interface SaleDetailLine {
  id: string;
  productId: string;
  productName: string;
  displayName: string | null;
  unitName: string;
  qty: number;
  unitPriceMinor: number;
  lineDiscountMinor: number;
  lineTotalMinor: number;
  discountShareMinor: number;
  netAmountMinor: number;
  source: SaleDetailSource;
  vendorPartyId: string | null;
  vendorName: string | null;
  isProvisionalCost: boolean;
  tracksSerial: boolean;
  allocations: SaleDetailAllocation[];
  /** Missing without cost-view permission. Missing never means zero. */
  costMinor?: number;
}
export interface SaleDetailPayment {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'CASH' | 'BANK';
  amountMinor: number;
}
export interface SaleDetailReceipt {
  id: string;
  number: string;
  businessDate: string;
  accountName: string;
  amountMinor: number;
}
export interface SaleDetailPresentation {
  customerDisplayName: string | null;
  customerPhone: string | null;
  customerGuardianName: string | null;
  customerAddress: string | null;
  deliveryAddress: string | null;
  courierName: string | null;
  deliveryInstruction: string | null;
  paymentNote: string | null;
  customLabel1: string | null;
  customValue1: string | null;
  customLabel2: string | null;
  customValue2: string | null;
  customLabel3: string | null;
  customValue3: string | null;
  lineNames: { saleLineId: string; displayName: string }[];
}
export interface ServerSaleDetail {
  id: string;
  number: string;
  partyId: string;
  isWalkIn: boolean;
  customerName: string;
  customerPhone: string | null;
  customerGuardianName: string | null;
  customerAddress: string | null;
  businessDate: string;
  dueDate: string | null;
  status: SaleDetailStatus;
  notes: string | null;
  lines: SaleDetailLine[];
  payments: SaleDetailPayment[];
  itemsTotalMinor: number;
  discountMinor: number;
  grandTotalMinor: number;
  paidMinor: number;
  dueMinor: number;
  changeMinor: number;
  advanceMinor: number;
  ageing: SaleDetailAgeing;
  /** Server's document version; not a client command version. */
  version: number;
  presentation: SaleDetailPresentation | null;
  receipts: SaleDetailReceipt[];
  warnings: string[];
  originMode: SaleDetailOrigin;
  originDeviceName: string | null;
  originDeviceCode: string | null;
  deviceCreatedAt: string | null;
  /** Absent for roles without inventory.cost.view. */
  cogsMinor?: number;
  profitMinor?: number;
}
export interface ServerSaleDetailEnvelope { data: ServerSaleDetail }

const idRe = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const origins = ['ONLINE', 'OFFLINE'] as const;
const statuses = ['POSTED', 'VOIDED'] as const;
const ages = ['NOT_DUE', 'D1_30', 'D31_60', 'D61_90', 'D90_PLUS'] as const;
const sourceTypes = ['OWN_STOCK', 'VENDOR_CONSIGNMENT'] as const;
const allocationTypes = ['OWNED', 'VENDOR', 'NEGATIVE'] as const;
const mainFields = [
  'id', 'number', 'partyId', 'isWalkIn', 'customerName', 'customerPhone',
  'customerGuardianName', 'customerAddress', 'businessDate', 'dueDate',
  'status', 'notes', 'lines', 'payments', 'itemsTotalMinor', 'discountMinor',
  'grandTotalMinor', 'paidMinor', 'dueMinor', 'changeMinor', 'advanceMinor',
  'ageing', 'version', 'presentation', 'receipts', 'warnings',
  'originMode', 'originDeviceName', 'originDeviceCode', 'deviceCreatedAt',
] as const;
const lineFields = [
  'id', 'productId', 'productName', 'displayName', 'unitName', 'qty',
  'unitPriceMinor', 'lineDiscountMinor', 'lineTotalMinor', 'discountShareMinor',
  'netAmountMinor', 'source', 'vendorPartyId', 'vendorName', 'isProvisionalCost',
  'tracksSerial', 'allocations',
] as const;
const allocationFields = [
  'sourceType', 'qty', 'vendorPartyId', 'serialUnitIds', 'id',
  'ownedLotId', 'vendorStockReceiptId', 'vendorLotId',
  'inventoryUnitId', 'serialNo', 'unitCostUsed',
] as const;
const presentationFields = [
  'customerDisplayName', 'customerPhone', 'customerGuardianName',
  'customerAddress', 'deliveryAddress', 'courierName', 'deliveryInstruction',
  'paymentNote', 'customLabel1', 'customValue1', 'customLabel2', 'customValue2',
  'customLabel3', 'customValue3', 'lineNames',
] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Invalid server Sales invoice detail');
}
function rec(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exact(value: unknown, required: readonly string[], optional: readonly string[] = []): value is Record<string, unknown> {
  return rec(value) && required.every(key => Object.prototype.hasOwnProperty.call(value, key)) &&
    Object.keys(value).every(key => required.includes(key) || optional.includes(key));
}
function id(value: unknown): value is string {
  return typeof value === 'string' && idRe.test(value);
}
function nullableId(value: unknown): value is string | null {
  return value === null || id(value);
}
function str(value: unknown): value is string {
  return typeof value === 'string';
}
function nullableStr(value: unknown): value is string | null {
  return value === null || str(value);
}
function safeInt(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}
function day(value: unknown): value is string {
  if (!str(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
function choice(value: unknown, values: readonly string[]): boolean {
  return str(value) && values.includes(value);
}
function integers(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return keys.every(key => safeInt(value[key]));
}
function allocation(value: unknown): value is SaleDetailAllocation {
  if (!exact(value, allocationFields) || !choice(value.sourceType, allocationTypes) ||
      !safeInt(value.qty) || value.qty <= 0 || !nullableId(value.vendorPartyId) ||
      !Array.isArray(value.serialUnitIds) || value.serialUnitIds.length > 200 ||
      !value.serialUnitIds.every(id) || new Set(value.serialUnitIds).size !== value.serialUnitIds.length ||
      !id(value.id) || !nullableId(value.ownedLotId) ||
      !nullableId(value.vendorStockReceiptId) || !nullableId(value.vendorLotId) ||
      !nullableId(value.inventoryUnitId) || !nullableStr(value.serialNo) ||
      !(value.unitCostUsed === null || safeInt(value.unitCostUsed))) return false;
  return true;
}
function line(value: unknown, allocationIds: Set<string>): value is SaleDetailLine {
  if (!exact(value, lineFields, ['costMinor']) || !id(value.id) || !id(value.productId) ||
      !str(value.productName) || !nullableStr(value.displayName) || !str(value.unitName) ||
      !integers(value, ['qty', 'unitPriceMinor', 'lineDiscountMinor', 'lineTotalMinor',
        'discountShareMinor', 'netAmountMinor']) || value.qty <= 0 ||
      !choice(value.source, sourceTypes) || !nullableId(value.vendorPartyId) ||
      !nullableStr(value.vendorName) || typeof value.isProvisionalCost !== 'boolean' ||
      typeof value.tracksSerial !== 'boolean' || !Array.isArray(value.allocations) ||
      ('costMinor' in value && !safeInt(value.costMinor))) return false;
  for (const entry of value.allocations) {
    if (!allocation(entry) || allocationIds.has(entry.id)) return false;
    allocationIds.add(entry.id);
  }
  return true;
}
function payment(value: unknown): value is SaleDetailPayment {
  return exact(value, ['id', 'accountCode', 'accountName', 'accountType', 'amountMinor']) &&
    id(value.id) && str(value.accountCode) && str(value.accountName) &&
    choice(value.accountType, ['CASH', 'BANK']) && safeInt(value.amountMinor);
}
function receipt(value: unknown): value is SaleDetailReceipt {
  return exact(value, ['id', 'number', 'businessDate', 'accountName', 'amountMinor']) &&
    id(value.id) && str(value.number) && day(value.businessDate) &&
    str(value.accountName) && safeInt(value.amountMinor);
}
function presentation(value: unknown): value is SaleDetailPresentation {
  if (!exact(value, presentationFields)) return false;
  for (const key of presentationFields) {
    if (key !== 'lineNames' && !nullableStr(value[key])) return false;
  }
  if (!Array.isArray(value.lineNames) || value.lineNames.length > 200) return false;
  const names = new Set<string>();
  for (const name of value.lineNames) {
    if (!exact(name, ['saleLineId', 'displayName']) || !id(name.saleLineId) ||
        !str(name.displayName) || !name.displayName.trim() ||
        names.has(name.saleLineId)) return false;
    names.add(name.saleLineId);
  }
  return true;
}
/** Validate the exact endpoint envelope, preserving permission-redacted absences. */
export function decodeSalesInvoiceDetail(raw: unknown): ServerSaleDetailEnvelope {
  if (!exact(raw, ['data']) || !exact(raw.data, mainFields, ['cogsMinor', 'profitMinor'])) return invalid();
  const sale = raw.data;
  if (!id(sale.id) || !str(sale.number) || !id(sale.partyId) ||
      typeof sale.isWalkIn !== 'boolean' || !str(sale.customerName) ||
      !nullableStr(sale.customerPhone) || !nullableStr(sale.customerGuardianName) ||
      !nullableStr(sale.customerAddress) || !day(sale.businessDate) ||
      !(sale.dueDate === null || day(sale.dueDate)) ||
      !choice(sale.status, statuses) || !nullableStr(sale.notes) ||
      !Array.isArray(sale.lines) || !Array.isArray(sale.payments) ||
      !integers(sale, ['itemsTotalMinor', 'discountMinor', 'grandTotalMinor',
        'paidMinor', 'dueMinor', 'changeMinor', 'advanceMinor', 'version']) || sale.version < 0 ||
      !choice(sale.ageing, ages) ||
      !(sale.presentation === null || presentation(sale.presentation)) ||
      !Array.isArray(sale.receipts) || !Array.isArray(sale.warnings) ||
      !sale.warnings.every(str) || !choice(sale.originMode, origins) ||
      !nullableStr(sale.originDeviceName) || !nullableStr(sale.originDeviceCode) ||
      !nullableStr(sale.deviceCreatedAt) ||
      ('cogsMinor' in sale && !safeInt(sale.cogsMinor)) ||
      ('profitMinor' in sale && !safeInt(sale.profitMinor))) return invalid();

  const lineIds = new Set<string>();
  const allocationIds = new Set<string>();
  for (const item of sale.lines) {
    if (!line(item, allocationIds) || lineIds.has(item.id)) return invalid();
    lineIds.add(item.id);
  }
  const paymentIds = new Set<string>();
  for (const item of sale.payments) {
    if (!payment(item) || paymentIds.has(item.id)) return invalid();
    paymentIds.add(item.id);
  }
  const receiptIds = new Set<string>();
  for (const item of sale.receipts) {
    if (!receipt(item) || receiptIds.has(item.id)) return invalid();
    receiptIds.add(item.id);
  }
  return raw as unknown as ServerSaleDetailEnvelope;
}

/** One exact server invoice, GET only; no local cache, preview or mutations. */
export async function readSalesInvoiceDetail(
  accessToken: string, saleId: string,
  signal?: AbortSignal, timeoutMs = 12_000,
): Promise<ServerSaleDetailEnvelope> {
  if (typeof accessToken !== 'string' || !accessToken.trim() || /\s/.test(accessToken) ||
      !id(saleId) || !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  if (signal?.aborted) throw new ApiError('network', 'Sales invoice request was aborted');

  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'GET',
      path: ('/api/v1/sales/' + saleId) as ApiRequest['path'],
      accessToken,
      signal: controller.signal,
    }, (value) => {
      const decoded = decodeSalesInvoiceDetail(value);
      if (decoded.data.id !== saleId) return invalid();
      return decoded;
    });
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
