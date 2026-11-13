import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { ApiRequest } from './http.ts';

/** MOD-006 T01-R/P1: read-only existing Nest money account APIs.
 * Direct JSON responses, integer poisha, no UI/session state or mutations.
 * LOAN is a lender liability, never part of spendable cash/bank totals.
 */
export type ServerMoneyAccountType = 'CASH' | 'BANK' | 'MFS' | 'LOAN';
export type ServerMoneyAccountStatus = 'ACTIVE' | 'INACTIVE';

export interface ServerMoneyAccount {
  id: string;
  name: string;
  type: ServerMoneyAccountType;
  holderName: string | null;
  reference: string | null;
  isDrawer: boolean;
  status: ServerMoneyAccountStatus;
  balanceMinor: number;
  openingAmountMinor: number | null;
  openingDate: string | null;
  version: number;
}
export interface ServerMoneyAccountList {
  accounts: ServerMoneyAccount[];
  totalCashMinor: number;
  totalBankMinor: number;
  totalMfsMinor: number;
  totalLoanMinor: number;
}
export interface ServerMoneyAccountStatementRow {
  journalLineId: string;
  businessDate: string;
  createdAt: string;
  sourceType: string;
  sourceNumber: string;
  sourceId: string | null;
  description: string;
  reference: string;
  amountMinor: number;
  debitMinor: number;
  creditMinor: number;
  runningBalanceMinor: number;
}
export interface ServerMoneyAccountStatement {
  accountId: string;
  accountName: string;
  type: ServerMoneyAccountType;
  /** Page/filter opening, not initial setup opening. */
  openingBalanceMinor: number;
  /** Current account balance, not the date-window closing. */
  closingBalanceMinor: number;
  /** Totals on the returned page only. */
  totalInMinor: number;
  totalOutMinor: number;
  rows: ServerMoneyAccountStatementRow[];
  page: { nextCursor: string | null; hasMore: boolean };
}
export interface MoneyAccountListQuery {
  includeInactive?: boolean;
  asOf?: string;
}
export type MoneyAccountStatementKind =
  'ALL' | 'SALE' | 'PURCHASE' | 'EXPENSE' | 'MOVEMENT' | 'OTHER';
export interface MoneyAccountStatementQuery {
  fromDate?: string;
  toDate?: string;
  search?: string;
  kind?: MoneyAccountStatementKind;
  cursor?: string;
  limit?: number;
}

type Path = ApiRequest['path'];
const idPattern = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const types: readonly string[] = ['CASH', 'BANK', 'MFS', 'LOAN'];
const statuses: readonly string[] = ['ACTIVE', 'INACTIVE'];
const kinds: readonly string[] = ['ALL', 'SALE', 'PURCHASE', 'EXPENSE', 'MOVEMENT', 'OTHER'];
const accountKeys = [
  'id','name','type','holderName','reference','isDrawer','status',
  'balanceMinor','openingAmountMinor','openingDate','version',
];
const listKeys = ['accounts','totalCashMinor','totalBankMinor','totalMfsMinor','totalLoanMinor'];
const statementKeys = [
  'accountId','accountName','type','openingBalanceMinor','closingBalanceMinor',
  'totalInMinor','totalOutMinor','rows','page',
];
const rowKeys = [
  'journalLineId','businessDate','createdAt','sourceType','sourceNumber',
  'sourceId','description','reference','amountMinor','debitMinor',
  'creditMinor','runningBalanceMinor',
];
function invalid(): never {
  throw new ApiError('protocol', 'Money account request or response could not be verified');
}
function record(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function keys(v: Record<string, unknown>, required: readonly string[]): boolean {
  return Object.keys(v).length === required.length &&
    required.every(key => Object.prototype.hasOwnProperty.call(v, key));
}
function integer(v: unknown): v is number {
  return typeof v === 'number' && Number.isSafeInteger(v);
}
function id(v: unknown): v is string {
  return typeof v === 'string' && idPattern.test(v);
}
function date(v: unknown): v is string {
  if (typeof v !== 'string' || !datePattern.test(v)) return false;
  const parsed = new Date(v + 'T00:00:00.000Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === v;
}
function nullableText(v: unknown): v is string | null {
  return v === null || typeof v === 'string';
}
function nullableId(v: unknown): v is string | null {
  return v === null || id(v);
}
function nullableDate(v: unknown): v is string | null {
  return v === null || date(v);
}
function account(v: unknown): v is ServerMoneyAccount {
  if (!record(v) || !keys(v, accountKeys)) return false;
  return id(v.id) && typeof v.name === 'string' && types.includes(String(v.type)) &&
    nullableText(v.holderName) && nullableText(v.reference) &&
    typeof v.isDrawer === 'boolean' && statuses.includes(String(v.status)) &&
    integer(v.balanceMinor) &&
    (v.openingAmountMinor === null || (integer(v.openingAmountMinor) && v.openingAmountMinor >= 0)) &&
    nullableDate(v.openingDate) && integer(v.version) && v.version > 0;
}
function row(v: unknown): v is ServerMoneyAccountStatementRow {
  if (!record(v) || !keys(v, rowKeys)) return false;
  return id(v.journalLineId) && date(v.businessDate) &&
    typeof v.createdAt === 'string' && typeof v.sourceType === 'string' &&
    typeof v.sourceNumber === 'string' && nullableId(v.sourceId) &&
    typeof v.description === 'string' && typeof v.reference === 'string' &&
    integer(v.amountMinor) && integer(v.debitMinor) && v.debitMinor >= 0 &&
    integer(v.creditMinor) && v.creditMinor >= 0 && integer(v.runningBalanceMinor) &&
    v.amountMinor === v.debitMinor - v.creditMinor &&
    !(v.debitMinor > 0 && v.creditMinor > 0);
}

export function decodeMoneyAccountList(raw: unknown): ServerMoneyAccountList {
  if (!record(raw) || !keys(raw, listKeys) || !Array.isArray(raw.accounts) ||
      !raw.accounts.every(account) ||
      !integer(raw.totalCashMinor) || !integer(raw.totalBankMinor) ||
      !integer(raw.totalMfsMinor) || !integer(raw.totalLoanMinor)) return invalid();
  return raw as unknown as ServerMoneyAccountList;
}
export function decodeMoneyAccountStatement(raw: unknown): ServerMoneyAccountStatement {
  if (!record(raw) || !keys(raw, statementKeys) ||
      !id(raw.accountId) || typeof raw.accountName !== 'string' ||
      !types.includes(String(raw.type)) ||
      !integer(raw.openingBalanceMinor) || !integer(raw.closingBalanceMinor) ||
      !integer(raw.totalInMinor) || raw.totalInMinor < 0 ||
      !integer(raw.totalOutMinor) || raw.totalOutMinor < 0 ||
      !Array.isArray(raw.rows) || !raw.rows.every(row) ||
      !record(raw.page) || !keys(raw.page, ['nextCursor','hasMore']) ||
      (raw.page.nextCursor !== null && !id(raw.page.nextCursor)) ||
      typeof raw.page.hasMore !== 'boolean' ||
      (raw.page.hasMore && raw.page.nextCursor === null) ||
      (!raw.page.hasMore && raw.page.nextCursor !== null)) return invalid();
  return raw as unknown as ServerMoneyAccountStatement;
}
function listPath(query: MoneyAccountListQuery): Path {
  if (!record(query) || Object.keys(query).some(k => !['includeInactive','asOf'].includes(k))) return invalid();
  const params = new URLSearchParams();
  if (query.includeInactive !== undefined) {
    if (typeof query.includeInactive !== 'boolean') return invalid();
    // z.coerce.boolean() treats string 'false' as true. Omit false entirely.
    if (query.includeInactive) params.set('includeInactive','true');
  }
  if (query.asOf !== undefined) {
    if (!date(query.asOf)) return invalid();
    params.set('asOf', query.asOf);
  }
  return params.size ? ('/api/v1/money/accounts?' + params.toString()) as Path : '/api/v1/money/accounts';
}
function statementPath(accountId: string, query: MoneyAccountStatementQuery): Path {
  if (!id(accountId) || !record(query) ||
      Object.keys(query).some(k => !['fromDate','toDate','search','kind','cursor','limit'].includes(k))) return invalid();
  const params = new URLSearchParams();
  if (query.fromDate !== undefined) {
    if (!date(query.fromDate)) return invalid();
    params.set('fromDate',query.fromDate);
  }
  if (query.toDate !== undefined) {
    if (!date(query.toDate)) return invalid();
    params.set('toDate',query.toDate);
  }
  if (query.fromDate !== undefined && query.toDate !== undefined &&
      query.fromDate > query.toDate) return invalid();
  if (query.search !== undefined) {
    if (typeof query.search !== 'string' || query.search.trim().length > 80) return invalid();
    params.set('search',query.search.trim());
  }
  if (query.kind !== undefined) {
    if (typeof query.kind !== 'string' || !kinds.includes(query.kind)) return invalid();
    params.set('kind',query.kind);
  }
  if (query.cursor !== undefined) {
    if (!id(query.cursor)) return invalid();
    params.set('cursor',query.cursor);
  }
  if (query.limit !== undefined) {
    if (!integer(query.limit) || query.limit < 1 || query.limit > 200) return invalid();
    params.set('limit',String(query.limit));
  }
  const base = '/api/v1/money/accounts/' + accountId + '/statement';
  return (params.size ? base + '?' + params.toString() : base) as Path;
}
async function read<T>(
  accessToken: string,
  path: Path,
  decode: (raw: unknown) => T,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<T> {
  if (!integer(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort',abort,{once:true});
  const timeout = globalThis.setTimeout(abort,timeoutMs);
  try {
    return await requestJson({method:'GET',path,accessToken,signal:controller.signal},decode);
  } finally {
    globalThis.clearTimeout(timeout);
    signal?.removeEventListener('abort',abort);
  }
}
/** Authenticated read without caching; caller owns the tenant/session token. */
export async function readMoneyAccounts(
  accessToken: string,
  query: MoneyAccountListQuery = {},
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerMoneyAccountList> {
  return read(accessToken,listPath(query),decodeMoneyAccountList,signal,timeoutMs);
}
/** Caller must discard stale account/tenant selections after awaiting this read. */
export async function readMoneyAccountStatement(
  accessToken: string,
  accountId: string,
  query: MoneyAccountStatementQuery = {},
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<ServerMoneyAccountStatement> {
  const result = await read(accessToken,statementPath(accountId,query),
    decodeMoneyAccountStatement,signal,timeoutMs);
  if (result.accountId !== accountId) return invalid();
  return result;
}
