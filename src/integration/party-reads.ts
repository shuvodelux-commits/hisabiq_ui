import { ApiError } from './errors.ts';
import { requestJson, type ApiRequest } from './http.ts';

/**
 * MOD-004 T01-R: authenticated, unmounted, read-only trading-party transport.
 * Source: Nest adoption parties/party-ledger contracts and controller, after
 * D08 P0-L01/L02/L03. This cannot model Lender/Borrower/Owner/Payee.
 * Never map a role-specific net as gross debit/credit components or preview data.
 */
export type TradingRole = 'CUSTOMER' | 'SUPPLIER' | 'VENDOR';
export type TradingStatus = 'ACTIVE' | 'INACTIVE';
export type BalanceDirection = 'RECEIVABLE' | 'PAYABLE' | 'SETTLED';
export interface RoleBalance {
  netMinor: number;
  direction: BalanceDirection;
  outstandingMinor: number;
  advanceMinor: number;
}
export interface TradingParty {
  id: string;
  name: string;
  roles: TradingRole[];
  phone: string | null;
  address: string | null;
  guardianName: string | null;
  nid: string | null;
  email: string | null;
  notes: string | null;
  customerGroupId: string | null;
  customerGroupName: string | null;
  creditLimitMinor: number | null;
  status: TradingStatus;
  isSystemReserved: boolean;
  version: number;
  balance: RoleBalance;
  hasLedgerEntries: boolean;
}
export interface TradingPartyList {
  data: TradingParty[];
  page: { nextCursor: string | null; hasMore: boolean };
  summary: {
    total: number;
    active: number;
    inactive: number;
    /** Null is required on Supplier/Vendor lists: Customer group count is not applicable. */
    ungrouped: number | null;
    totalOutstandingMinor: number;
    totalAdvanceMinor: number;
    overCreditLimit: number;
  };
}
export interface TradingPartyDetail { data: TradingParty }
export interface HistoricalPartyOpening {
  id: string;
  number: string;
  role: TradingRole;
  direction: 'RECEIVABLE' | 'PAYABLE';
  amountMinor: number;
  businessDate: string;
  version: number;
}
export interface HistoricalPartyOpeningEnvelope { data: HistoricalPartyOpening | null }
export interface TradingLedgerRow {
  journalEntryId: string;
  journalLineId: string;
  businessDate: string;
  sourceDocumentType: string;
  sourceDocumentId: string;
  sourceNumber: string;
  account: string;
  amountMinor: number;
  debitMinor: number;
  creditMinor: number;
  runningBalanceMinor: number;
}
export interface TradingLedger {
  partyId: string;
  partyName: string;
  openingBalance: RoleBalance;
  rows: TradingLedgerRow[];
  closingBalance: RoleBalance;
  totalDebitMinor: number;
  totalCreditMinor: number;
  page: { nextCursor: string | null; hasMore: boolean };
}
export interface TradingPartyQuery {
  search?: string;
  groupId?: string;
  status?: TradingStatus;
  cursor?: string;
  limit?: number;
  sort?: 'name' | 'phone' | 'groupName' | 'creditLimit' | 'status' | 'balance';
  direction?: 'ASC' | 'DESC';
}
export interface TradingLedgerQuery {
  fromDate?: string;
  toDate?: string;
  cursor?: string;
  limit?: number;
}
const roles: readonly TradingRole[] = ['CUSTOMER', 'SUPPLIER', 'VENDOR'];
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const partyKeys = [
  'id', 'name', 'roles', 'phone', 'address', 'guardianName', 'nid', 'email',
  'notes', 'customerGroupId', 'customerGroupName', 'creditLimitMinor',
  'status', 'isSystemReserved', 'version', 'balance', 'hasLedgerEntries',
] as const;
const optionalTextKeys = [
  'phone', 'address', 'guardianName', 'nid', 'email', 'notes', 'customerGroupName',
] as const;
const balanceKeys = ['netMinor', 'direction', 'outstandingMinor', 'advanceMinor'] as const;
const summaryKeys = [
  'total', 'active', 'inactive', 'ungrouped',
  'totalOutstandingMinor', 'totalAdvanceMinor', 'overCreditLimit',
] as const;
const ledgerRowKeys = [
  'journalEntryId', 'journalLineId', 'businessDate', 'sourceDocumentType',
  'sourceDocumentId', 'sourceNumber', 'account', 'amountMinor', 'debitMinor',
  'creditMinor', 'runningBalanceMinor',
] as const;
const listQueryKeys = [
  'search', 'groupId', 'status', 'cursor', 'limit', 'sort', 'direction',
] as const;
const ledgerQueryKeys = ['fromDate', 'toDate', 'cursor', 'limit'] as const;
const roleAccounts: Record<TradingRole, readonly string[]> = {
  CUSTOMER: ['AR', 'CUSTOMER_ADVANCE'],
  SUPPLIER: ['AP', 'SUPPLIER_ADVANCE'],
  VENDOR: ['VENDOR_PAYABLE', 'VENDOR_ADVANCE'],
};

function invalid(): never {
  throw new ApiError('protocol', 'Trading Party response or request could not be verified');
}
function record(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}
function exact(v: Record<string, unknown>, expected: readonly string[]): boolean {
  return Object.keys(v).length === expected.length &&
    expected.every(k => Object.prototype.hasOwnProperty.call(v, k));
}
function id(v: unknown): v is string {
  return typeof v === 'string' && ULID.test(v);
}
function safe(v: unknown): v is number {
  return typeof v === 'number' && Number.isSafeInteger(v);
}
function natural(v: unknown): v is number {
  return safe(v) && v >= 0;
}
function positive(v: unknown): v is number {
  return safe(v) && v > 0;
}
function role(v: unknown): v is TradingRole {
  return typeof v === 'string' && roles.includes(v as TradingRole);
}
function date(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + 'T00:00:00Z');
  return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v;
}
function balance(v: unknown): v is RoleBalance {
  if (!record(v) || !exact(v, balanceKeys) || !safe(v.netMinor) ||
      !natural(v.outstandingMinor) || !natural(v.advanceMinor)) return false;
  if (v.direction === 'RECEIVABLE') return v.netMinor > 0 &&
    v.outstandingMinor === v.netMinor && v.advanceMinor === 0;
  if (v.direction === 'PAYABLE') return v.netMinor < 0 &&
    v.outstandingMinor === 0 && v.advanceMinor === -v.netMinor;
  return v.direction === 'SETTLED' && v.netMinor === 0 &&
    v.outstandingMinor === 0 && v.advanceMinor === 0;
}
function party(v: unknown, selected: TradingRole): v is TradingParty {
  return record(v) && exact(v, partyKeys) && id(v.id) &&
    typeof v.name === 'string' && v.name.trim().length > 0 &&
    Array.isArray(v.roles) && v.roles.length >= 1 && v.roles.length <= 3 &&
    v.roles.every(role) && new Set(v.roles).size === v.roles.length &&
    v.roles.includes(selected) && optionalTextKeys.every(k =>
      v[k] === null || typeof v[k] === 'string') &&
    (v.customerGroupId === null || id(v.customerGroupId)) &&
    (v.creditLimitMinor === null || natural(v.creditLimitMinor)) &&
    // The server must not disclose Customer-only fields in other-role reads.
    (selected === 'CUSTOMER' || (v.customerGroupId === null &&
      v.customerGroupName === null && v.creditLimitMinor === null)) &&
    (v.status === 'ACTIVE' || v.status === 'INACTIVE') &&
    typeof v.isSystemReserved === 'boolean' &&
    natural(v.version) && balance(v.balance) && typeof v.hasLedgerEntries === 'boolean';
}
function page(v: unknown): v is TradingPartyList['page'] {
  return record(v) && exact(v, ['nextCursor', 'hasMore']) &&
    (v.nextCursor === null || id(v.nextCursor)) &&
    typeof v.hasMore === 'boolean' && v.hasMore === (v.nextCursor !== null);
}
function summary(v: unknown, selected: TradingRole): v is TradingPartyList['summary'] {
  return record(v) && exact(v, summaryKeys) &&
    summaryKeys.filter(k => k !== 'ungrouped').every(k => natural(v[k])) &&
    (selected === 'CUSTOMER' ? natural(v.ungrouped) : v.ungrouped === null);
}
function ledgerRow(v: unknown, selected: TradingRole): v is TradingLedgerRow {
  return record(v) && exact(v, ledgerRowKeys) &&
    id(v.journalEntryId) && id(v.journalLineId) && date(v.businessDate) &&
    typeof v.sourceDocumentType === 'string' &&
    typeof v.sourceDocumentId === 'string' && id(v.sourceDocumentId) &&
    typeof v.sourceNumber === 'string' &&
    typeof v.account === 'string' && roleAccounts[selected].includes(v.account) &&
    safe(v.amountMinor) && natural(v.debitMinor) && natural(v.creditMinor) &&
    safe(v.runningBalanceMinor) &&
    (v.debitMinor === 0 || v.creditMinor === 0) &&
    v.amountMinor === v.debitMinor - v.creditMinor;
}

/** Strict decoders ensure the selected role is also present in the reply. */
export function decodeTradingPartyList(raw: unknown, selected: TradingRole): TradingPartyList {
  if (!role(selected) || !record(raw) || !exact(raw, ['data', 'page', 'summary']) ||
      !Array.isArray(raw.data) || raw.data.length > 200 ||
      !raw.data.every(v => party(v, selected)) ||
      new Set(raw.data.map((v: TradingParty) => v.id)).size !== raw.data.length ||
      !page(raw.page) || !summary(raw.summary, selected)) return invalid();
  return raw as unknown as TradingPartyList;
}
export function decodeTradingPartyDetail(raw: unknown, selected: TradingRole): TradingPartyDetail {
  if (!role(selected) || !record(raw) || !exact(raw, ['data']) ||
      !party(raw.data, selected)) return invalid();
  return raw as unknown as TradingPartyDetail;
}
export function decodeHistoricalPartyOpening(
  raw: unknown,
  selected: TradingRole,
): HistoricalPartyOpeningEnvelope {
  if (!role(selected) || !record(raw) || !exact(raw, ['data'])) return invalid();
  const v = raw.data;
  if (v === null) return raw as unknown as HistoricalPartyOpeningEnvelope;
  if (!record(v) || !exact(v, [
    'id', 'number', 'role', 'direction', 'amountMinor', 'businessDate', 'version',
  ]) || !id(v.id) || typeof v.number !== 'string' || v.role !== selected ||
      (v.direction !== 'RECEIVABLE' && v.direction !== 'PAYABLE') ||
      !positive(v.amountMinor) || !date(v.businessDate) || !positive(v.version)) return invalid();
  return raw as unknown as HistoricalPartyOpeningEnvelope;
}
export function decodeTradingLedger(raw: unknown, selected: TradingRole, partyId: string): TradingLedger {
  if (!role(selected) || !id(partyId) || !record(raw) || !exact(raw, [
    'partyId', 'partyName', 'openingBalance', 'rows', 'closingBalance',
    'totalDebitMinor', 'totalCreditMinor', 'page',
  ]) || raw.partyId !== partyId || typeof raw.partyName !== 'string' ||
    !balance(raw.openingBalance) || !balance(raw.closingBalance) ||
    !Array.isArray(raw.rows) || raw.rows.length > 200 ||
    !raw.rows.every(v => ledgerRow(v, selected)) ||
    new Set(raw.rows.map((v: TradingLedgerRow) => v.journalLineId)).size !== raw.rows.length ||
    !natural(raw.totalDebitMinor) || !natural(raw.totalCreditMinor) ||
    !page(raw.page)) return invalid();
  return raw as unknown as TradingLedger;
}
function checkedRole(selected: TradingRole): TradingRole {
  if (!role(selected)) return invalid();
  return selected;
}
function checkedId(value: unknown): string {
  if (!id(value)) return invalid();
  return value;
}
function queryValues(
  raw: unknown,
  keys: readonly string[],
): Record<string, unknown> {
  if (!record(raw) || Object.keys(raw).some(k => !keys.includes(k))) return invalid();
  return raw;
}
function checkedLimit(v: unknown): string {
  if (!positive(v) || (v as number) > 200) return invalid();
  return String(v);
}
function listPath(selected: TradingRole, query: TradingPartyQuery): ApiRequest['path'] {
  const input = queryValues(query, listQueryKeys);
  // Fail closed before HTTP instead of probing Customer-only group and credit data.
  if (selected !== 'CUSTOMER' && (input.groupId !== undefined ||
      input.sort === 'groupName' || input.sort === 'creditLimit')) return invalid();
  const params = new URLSearchParams({ role: checkedRole(selected) });
  for (const key of listQueryKeys) {
    const v = input[key];
    if (v === undefined) continue;
    if (key === 'search') {
      if (typeof v !== 'string' || v.trim().length > 120) return invalid();
      params.set(key, v.trim());
    } else if (key === 'groupId' || key === 'cursor') {
      params.set(key, checkedId(v));
    } else if (key === 'status') {
      if (v !== 'ACTIVE' && v !== 'INACTIVE') return invalid();
      params.set(key, v);
    } else if (key === 'limit') params.set(key, checkedLimit(v));
    else if (key === 'sort') {
      if (!['name', 'phone', 'groupName', 'creditLimit', 'status', 'balance'].includes(String(v))) return invalid();
      params.set(key, String(v));
    } else {
      if (v !== 'ASC' && v !== 'DESC') return invalid();
      params.set(key, v);
    }
  }
  return ('/api/v1/parties?' + params.toString()) as ApiRequest['path'];
}
function ledgerPath(
  partyId: string,
  selected: TradingRole,
  query: TradingLedgerQuery,
): ApiRequest['path'] {
  const input = queryValues(query, ledgerQueryKeys);
  const params = new URLSearchParams({ role: checkedRole(selected) });
  if (input.fromDate !== undefined && !date(input.fromDate)) return invalid();
  if (input.toDate !== undefined && !date(input.toDate)) return invalid();
  if (typeof input.fromDate === 'string' && typeof input.toDate === 'string' &&
      input.fromDate > input.toDate) return invalid();
  for (const key of ledgerQueryKeys) {
    const v = input[key];
    if (v === undefined) continue;
    if (key === 'cursor') params.set(key, checkedId(v));
    else if (key === 'limit') params.set(key, checkedLimit(v));
    else params.set(key, v as string);
  }
  return ('/api/v1/parties/' + checkedId(partyId) + '/ledger?' +
    params.toString()) as ApiRequest['path'];
}
async function read<T>(
  accessToken: string,
  path: ApiRequest['path'],
  decode: (value: unknown) => T,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<T> {
  if (typeof accessToken !== 'string' || !accessToken || /\s/.test(accessToken) ||
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
/** No fixture fallback, local cache, auto retry, money mutation or UI mounting. */
export async function readTradingParties(
  token: string, selected: TradingRole, query: TradingPartyQuery = {},
  signal?: AbortSignal, timeoutMs?: number,
): Promise<TradingPartyList> {
  return read(token, listPath(selected, query), raw => decodeTradingPartyList(raw, selected), signal, timeoutMs);
}
export async function readTradingParty(
  token: string, partyId: string, selected: TradingRole,
  signal?: AbortSignal, timeoutMs?: number,
): Promise<TradingPartyDetail> {
  const path = ('/api/v1/parties/' + checkedId(partyId) +
    '?role=' + checkedRole(selected)) as ApiRequest['path'];
  return read(token, path, raw => decodeTradingPartyDetail(raw, selected), signal, timeoutMs);
}
export async function readHistoricalPartyOpening(
  token: string, partyId: string, selected: TradingRole,
  signal?: AbortSignal, timeoutMs?: number,
): Promise<HistoricalPartyOpeningEnvelope> {
  const path = ('/api/v1/parties/' + checkedId(partyId) +
    '/opening?role=' + checkedRole(selected)) as ApiRequest['path'];
  return read(token, path, raw => decodeHistoricalPartyOpening(raw, selected), signal, timeoutMs);
}
export async function readTradingPartyLedger(
  token: string, partyId: string, selected: TradingRole,
  query: TradingLedgerQuery = {}, signal?: AbortSignal, timeoutMs?: number,
): Promise<TradingLedger> {
  return read(token, ledgerPath(partyId, selected, query),
    raw => decodeTradingLedger(raw, selected, partyId), signal, timeoutMs);
}
