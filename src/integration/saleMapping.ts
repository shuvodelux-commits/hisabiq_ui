import { ApiError } from './errors.ts';

/**
 * MOD-007 M7-01b1: wire-only POS and customer read models.
 *
 * These are the CURRENT Nest adoption API shapes, not HisabIQ cart Product/Party
 * objects. In particular, no multi-unit conversion chain or independent price
 * can be inferred from a POS product's base-unit price.
 */
export type ServerPosStockStatus =
  'IN_STOCK' | 'LOW_STOCK' | 'ZERO_STOCK' | 'NEGATIVE_STOCK';
export type ServerNegativeStockPolicy = 'BLOCK' | 'WARN' | 'ALLOW';
/** Legacy is ID-keyset; GLOBAL_V2 is rank-keyset, without a new cart model. */
export type ServerPosPaginationMode = 'LEGACY' | 'GLOBAL_V2';

export interface ServerPosProduct {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  brandName: string | null;
  categoryName: string | null;
  unitName: string;
  sellingPriceMinor: number;
  groupPriceMinor: number | null;
  qtyOnHand: number;
  sellableOwnedQty: number;
  minStockQty: number;
  stockStatus: ServerPosStockStatus;
  hasImage: boolean;
  tracksSerial: boolean;
  searchText: string;
  /** Permission-redacted by the server: key absent without inventory.cost.view. */
  purchasePriceMinor?: number;
}

export interface ServerPosProductList {
  items: ServerPosProduct[];
  nextCursor: string | null;
  negativeStockPolicy: ServerNegativeStockPolicy;
}

export type ServerTradingRole = 'CUSTOMER' | 'SUPPLIER' | 'VENDOR';
export type ServerPartyStatus = 'ACTIVE' | 'INACTIVE';
export type ServerBalanceDirection = 'RECEIVABLE' | 'PAYABLE' | 'SETTLED';

export interface ServerCustomerBalance {
  netMinor: number;
  direction: ServerBalanceDirection;
  outstandingMinor: number;
  advanceMinor: number;
}

export interface ServerCustomerDirectoryEntry {
  id: string;
  name: string;
  roles: ServerTradingRole[];
  phone: string | null;
  address: string | null;
  guardianName: string | null;
  nid: string | null;
  email: string | null;
  notes: string | null;
  customerGroupId: string | null;
  customerGroupName: string | null;
  creditLimitMinor: number | null;
  status: ServerPartyStatus;
  isSystemReserved: boolean;
  version: number;
  balance: ServerCustomerBalance;
  hasLedgerEntries: boolean;
}

export interface ServerCustomerDirectory {
  data: ServerCustomerDirectoryEntry[];
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

export interface ServerOpenCustomerInvoice {
  id: string;
  number: string;
  businessDate: string;
  dueDate: string | null;
  grandTotalMinor: number;
  outstandingMinor: number;
}

export interface ServerCustomerStanding {
  partyId: string | null;
  name: string | null;
  phone: string | null;
  /** Journal-derived, independent quantities in integer poisha. */
  dueMinor: number;
  advanceMinor: number;
  creditLimitMinor: number | null;
  openInvoices: ServerOpenCustomerInvoice[];
}
export interface ServerCustomerStandingEnvelope {
  data: ServerCustomerStanding;
}

const ID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
// The backend uses v2.<score>.<product ULID>.<query fingerprint> (24 hex).
const RANKED_POS_CURSOR = /^v2\.([0-9]{1,4})\.([0-7][0-9A-HJKMNP-TV-Z]{25})\.([a-f0-9]{24})$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const stockStatuses: readonly string[] = ['IN_STOCK', 'LOW_STOCK', 'ZERO_STOCK', 'NEGATIVE_STOCK'];
const negativePolicies: readonly string[] = ['BLOCK', 'WARN', 'ALLOW'];
const partyRoles: readonly string[] = ['CUSTOMER', 'SUPPLIER', 'VENDOR'];
const directions: readonly string[] = ['RECEIVABLE', 'PAYABLE', 'SETTLED'];
const partyStatuses: readonly string[] = ['ACTIVE', 'INACTIVE'];

function invalid(): never {
  throw new ApiError('protocol', 'POS read request or response could not be verified');
}
function record(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === 'object' && !Array.isArray(x);
}
function exact(x: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []): boolean {
  return required.every(key => Object.prototype.hasOwnProperty.call(x, key)) &&
    Object.keys(x).every(key => required.includes(key) || optional.includes(key));
}
function int(x: unknown): x is number {
  return typeof x === 'number' && Number.isSafeInteger(x);
}
function nonnegative(x: unknown): x is number {
  return int(x) && x >= 0;
}
function id(x: unknown): x is string {
  return typeof x === 'string' && ID.test(x);
}
function nullableId(x: unknown): x is string | null {
  return x === null || id(x);
}
function nullableText(x: unknown): x is string | null {
  return x === null || typeof x === 'string';
}
function day(x: unknown): x is string {
  if (typeof x !== 'string' || !DAY.test(x)) return false;
  const [year, month, date] = x.split('-').map(Number);
  return year >= 1 && year <= 9999 && month >= 1 && month <= 12 &&
    date >= 1 && date <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}

const posKeys = [
  'id', 'name', 'sku', 'barcode', 'brandName', 'categoryName', 'unitName',
  'sellingPriceMinor', 'groupPriceMinor', 'qtyOnHand', 'sellableOwnedQty',
  'minStockQty', 'stockStatus', 'hasImage', 'tracksSerial', 'searchText',
];
function posProduct(x: unknown): x is ServerPosProduct {
  return record(x) && exact(x, posKeys, ['purchasePriceMinor']) &&
    id(x.id) && typeof x.name === 'string' &&
    nullableText(x.sku) && nullableText(x.barcode) &&
    nullableText(x.brandName) && nullableText(x.categoryName) &&
    typeof x.unitName === 'string' && int(x.sellingPriceMinor) &&
    (x.groupPriceMinor === null || int(x.groupPriceMinor)) &&
    int(x.qtyOnHand) && nonnegative(x.sellableOwnedQty) &&
    int(x.minStockQty) && stockStatuses.includes(String(x.stockStatus)) &&
    typeof x.hasImage === 'boolean' && typeof x.tracksSerial === 'boolean' &&
    typeof x.searchText === 'string' &&
    (!Object.prototype.hasOwnProperty.call(x, 'purchasePriceMinor') ||
      int(x.purchasePriceMinor));
}
export function decodePosProducts(raw: unknown): ServerPosProductList {
  if (!record(raw) || !exact(raw, ['items', 'nextCursor', 'negativeStockPolicy']) ||
      !Array.isArray(raw.items) || !raw.items.every(posProduct) ||
      !(raw.nextCursor === null || typeof raw.nextCursor === 'string') ||
      !negativePolicies.includes(String(raw.negativeStockPolicy))) return invalid();
  return raw as unknown as ServerPosProductList;
}

/** Only checks *wire shape*. Server owns tenant, filter and fingerprint authority. */
export function isCanonicalPosCursor(
  cursor: unknown,
  mode: ServerPosPaginationMode,
): cursor is string {
  if (typeof cursor !== 'string' || cursor.length > 120) return false;
  if (mode === 'LEGACY') return id(cursor);
  if (mode !== 'GLOBAL_V2') return false;
  const match = RANKED_POS_CURSOR.exec(cursor);
  if (match === null) return false;
  const score = Number(match[1]);
  return Number.isSafeInteger(score) && score >= 0 && score <= 1010;
}

/** Bind the returned cursor's *format* to the caller's requested API mode. */
export function decodePosProductsForMode(
  raw: unknown,
  mode: ServerPosPaginationMode,
): ServerPosProductList {
  const products = decodePosProducts(raw);
  if (products.nextCursor !== null && !isCanonicalPosCursor(products.nextCursor, mode)) {
    return invalid();
  }
  return products;
}

const balanceKeys = ['netMinor', 'direction', 'outstandingMinor', 'advanceMinor'];
function balance(x: unknown): x is ServerCustomerBalance {
  return record(x) && exact(x, balanceKeys) &&
    int(x.netMinor) && directions.includes(String(x.direction)) &&
    nonnegative(x.outstandingMinor) && nonnegative(x.advanceMinor);
}
const partyKeys = [
  'id', 'name', 'roles', 'phone', 'address', 'guardianName', 'nid', 'email',
  'notes', 'customerGroupId', 'customerGroupName', 'creditLimitMinor',
  'status', 'isSystemReserved', 'version', 'balance', 'hasLedgerEntries',
];
function customer(x: unknown): x is ServerCustomerDirectoryEntry {
  return record(x) && exact(x, partyKeys) &&
    id(x.id) && typeof x.name === 'string' &&
    Array.isArray(x.roles) && x.roles.includes('CUSTOMER') &&
    x.roles.every(role => partyRoles.includes(String(role))) &&
    nullableText(x.phone) && nullableText(x.address) &&
    nullableText(x.guardianName) && nullableText(x.nid) &&
    nullableText(x.email) && nullableText(x.notes) &&
    nullableId(x.customerGroupId) && nullableText(x.customerGroupName) &&
    (x.creditLimitMinor === null || int(x.creditLimitMinor)) &&
    partyStatuses.includes(String(x.status)) &&
    typeof x.isSystemReserved === 'boolean' &&
    int(x.version) && x.version >= 0 && balance(x.balance) &&
    typeof x.hasLedgerEntries === 'boolean';
}
const summaryKeys = [
  'total', 'active', 'inactive', 'ungrouped', 'totalOutstandingMinor',
  'totalAdvanceMinor', 'overCreditLimit',
];
function summary(x: unknown): boolean {
  return record(x) && exact(x, summaryKeys) &&
    summaryKeys.every(key => nonnegative(x[key]));
}
export function decodeCustomerDirectory(raw: unknown): ServerCustomerDirectory {
  if (!record(raw) || !exact(raw, ['data', 'page', 'summary']) ||
      !Array.isArray(raw.data) || !raw.data.every(customer) ||
      !record(raw.page) || !exact(raw.page, ['nextCursor', 'hasMore']) ||
      !nullableId(raw.page.nextCursor) || typeof raw.page.hasMore !== 'boolean' ||
      !summary(raw.summary)) return invalid();
  return raw as unknown as ServerCustomerDirectory;
}

const openInvoiceKeys = [
  'id', 'number', 'businessDate', 'dueDate', 'grandTotalMinor', 'outstandingMinor',
];
function openInvoice(x: unknown): x is ServerOpenCustomerInvoice {
  return record(x) && exact(x, openInvoiceKeys) &&
    id(x.id) && typeof x.number === 'string' &&
    day(x.businessDate) && (x.dueDate === null || day(x.dueDate)) &&
    int(x.grandTotalMinor) && int(x.outstandingMinor);
}
const standingKeys = [
  'partyId', 'name', 'phone', 'dueMinor', 'advanceMinor', 'creditLimitMinor', 'openInvoices',
];
export function decodeCustomerStanding(raw: unknown): ServerCustomerStandingEnvelope {
  if (!record(raw) || !exact(raw, ['data']) || !record(raw.data) ||
      !exact(raw.data, standingKeys) ||
      !nullableId(raw.data.partyId) ||
      !nullableText(raw.data.name) || !nullableText(raw.data.phone) ||
      !int(raw.data.dueMinor) || !int(raw.data.advanceMinor) ||
      !(raw.data.creditLimitMinor === null || int(raw.data.creditLimitMinor)) ||
      !Array.isArray(raw.data.openInvoices) ||
      !raw.data.openInvoices.every(openInvoice)) return invalid();
  return raw as unknown as ServerCustomerStandingEnvelope;
}

export function isCanonicalPosPartyId(value: unknown): value is string {
  return id(value);
}


/** Non-posting Nest sale drafts: metadata is server-owned; cart stays opaque JSON. */
export interface ServerSaleDraft {
  id: string;
  label: string;
  customerName: string | null;
  itemCount: number;
  grandTotalMinor: number;
  businessDate: string;
  savedAt: string;
  cart: Record<string, unknown>;
}
export interface ServerSaleDraftsEnvelope {
  data: ServerSaleDraft[];
}

const saleDraftKeys = [
  'id', 'label', 'customerName', 'itemCount', 'grandTotalMinor',
  'businessDate', 'savedAt', 'cart',
];

/** The service serializes Date.toISOString(), including three-digit UTC milliseconds. */
function draftTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/.exec(value);
  return match !== null && day(match[1]) &&
    Number(match[2]) < 24 && Number(match[3]) < 60 && Number(match[4]) < 60 &&
    Number.isFinite(Date.parse(value));
}

/**
 * Assert JSON-compatible shape without parsing/pricing/rewriting opaque cart fields.
 * In production requestJson has already JSON-parsed the response; the check also
 * rejects non-JSON fixtures, prototypes, sparse arrays and cycles in direct calls.
 */
function draftJsonCart(value: unknown): value is Record<string, unknown> {
  if (!record(value) ||
      (Object.getPrototypeOf(value) !== Object.prototype &&
       Object.getPrototypeOf(value) !== null)) return false;
  const remaining: unknown[] = [value];
  const seen = new WeakSet<object>();
  while (remaining.length > 0) {
    const next = remaining.pop();
    if (next === null || typeof next === 'string' || typeof next === 'boolean') continue;
    if (typeof next === 'number') {
      if (!Number.isFinite(next)) return false;
      continue;
    }
    if (typeof next !== 'object' || seen.has(next)) return false;
    seen.add(next);
    if (Object.getOwnPropertySymbols(next).length !== 0) return false;
    if (Array.isArray(next)) {
      if (Object.keys(next).length !== next.length) return false;
      for (let i = 0; i < next.length; i++) {
        const part = Object.getOwnPropertyDescriptor(next, String(i));
        if (!part || !('value' in part)) return false;
        remaining.push(part.value);
      }
    } else if (record(next) &&
      (Object.getPrototypeOf(next) === Object.prototype ||
       Object.getPrototypeOf(next) === null)) {
      for (const key of Object.keys(next)) {
        const part = Object.getOwnPropertyDescriptor(next, key);
        if (!part || !('value' in part)) return false;
        remaining.push(part.value);
      }
    } else return false;
  }
  return true;
}

/** Strict GET /api/v1/sales/drafts envelope, never a POS cart or invoice. */
export function decodeSaleDrafts(raw: unknown): ServerSaleDraftsEnvelope {
  if (!record(raw) || !exact(raw, ['data']) || !Array.isArray(raw.data) ||
      !raw.data.every(row =>
        record(row) && exact(row, saleDraftKeys) &&
        id(row.id) && typeof row.label === 'string' &&
        row.label.trim().length > 0 && row.label.length <= 80 &&
        nullableText(row.customerName) &&
        (row.customerName === null || row.customerName.length <= 120) &&
        nonnegative(row.itemCount) && row.itemCount <= 500 &&
        nonnegative(row.grandTotalMinor) &&
        day(row.businessDate) && draftTimestamp(row.savedAt) &&
        draftJsonCart(row.cart))) return invalid();
  return raw as unknown as ServerSaleDraftsEnvelope;
}
