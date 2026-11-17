/**
 * M5-01a: existing NestSherERP cash-day contract, adapted from PR #282.
 *
 * This adapter has NO session state and NEVER reads browser storage. The caller
 * must supply the access token from the current verified SessionSnapshot and
 * abort its requests when tenant/session epoch changes. The original React
 * preview CashSessionStore must never be called after a connected API failure.
 */
import { requestJson } from '../integration/http.ts';
import { parseScaledInput } from '../integration/decimal.ts';
import { isOperationId } from '../integration/operation.ts';
import { readTenantSettings } from '../integration/settings-team.ts';

export type CashClose = {
  id: string;
  status: 'ACTIVE' | 'SUPERSEDED';
  openingAmountMinor: number;
  cashInMinor: number;
  cashOutMinor: number;
  expectedClosingMinor: number;
  countedClosingMinor: number;
  differenceMinor: number;
  differenceKind: 'MATCHED' | 'SHORT' | 'OVER';
  differenceReason: string | null;
  reopenReason: string | null;
  closedAt: string;
  closedByName: string | null;
  supersededAt: string | null;
};
export type CashDaySession = {
  id: string;
  number: string;
  accountId: string;
  accountName: string;
  businessDate: string;
  status: 'OPEN' | 'CLOSED';
  openingAmountMinor: number;
  previousClosingMinor: number | null;
  cashInMinor: number;
  cashOutMinor: number;
  expectedClosingMinor: number;
  openedAt: string;
  openedByName: string | null;
  closes: CashClose[];
  version: number;
};
export type CashDayStatus = {
  enabled: boolean;
  drawerAccountId: string | null;
  businessDate: string;
  todaySession: CashDaySession | null;
  blockedByDate: string | null;
  blockedSession: CashDaySession | null;
  previousClosingMinor: number | null;
  drawerBalanceMinor: number;
  canReopenToday: boolean;
};
export type DailyCashRow = {
  sessionId: string;
  businessDate: string;
  status: 'OPEN' | 'CLOSED';
  openingAmountMinor: number;
  cashInMinor: number;
  cashOutMinor: number;
  expectedClosingMinor: number | null;
  countedClosingMinor: number | null;
  differenceMinor: number | null;
  differenceKind: 'MATCHED' | 'SHORT' | 'OVER' | null;
  differenceReason: string | null;
  wasReopened: boolean;
};
export type DailyCashResult = {
  rows: DailyCashRow[];
  page: { nextCursor: string | null; hasMore: boolean };
};
export type MoneyAccount = {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'MFS' | 'LOAN';
  isDrawer: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  balanceMinor: number;
  openingAmountMinor: number | null;
  openingDate: string | null;
  holderName: string | null;
  reference: string | null;
  version: number;
};
export type CashSettings = { values: Record<string, string> };
export type CashSettingSave = { data: CashSettings; warnings?: unknown[] };

const ulid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
function obj(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Unexpected cash API response');
  }
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== 'string') throw new TypeError('Expected string');
  return value;
}
function nullableText(value: unknown): string | null {
  return value === null ? null : text(value);
}
function id(value: unknown): string {
  const result = text(value);
  if (!ulid.test(result)) throw new TypeError('Expected canonical ULID');
  return result;
}
function date(value: unknown): string {
  const result = text(value);
  if (!dateFormat.test(result)) throw new TypeError('Expected business date');
  return result;
}
function minor(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new TypeError('Expected exact integer poisha');
  }
  return value;
}
function nullableMinor(value: unknown): number | null {
  return value === null ? null : minor(value);
}
function bool(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new TypeError('Expected boolean');
  return value;
}
function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new TypeError('Invalid cash API status');
  }
  return value as T;
}
function nullableId(value: unknown): string | null {
  return value === null ? null : id(value);
}
const dayStates = ['OPEN', 'CLOSED'] as const;
const closeStates = ['ACTIVE', 'SUPERSEDED'] as const;
const differenceStates = ['MATCHED', 'SHORT', 'OVER'] as const;

function close(raw: unknown): CashClose {
  const v = obj(raw);
  return {
    id: id(v.id), status: oneOf(v.status, closeStates),
    openingAmountMinor: minor(v.openingAmountMinor),
    cashInMinor: minor(v.cashInMinor), cashOutMinor: minor(v.cashOutMinor),
    expectedClosingMinor: minor(v.expectedClosingMinor),
    countedClosingMinor: minor(v.countedClosingMinor),
    differenceMinor: minor(v.differenceMinor),
    differenceKind: oneOf(v.differenceKind, differenceStates),
    differenceReason: nullableText(v.differenceReason),
    reopenReason: nullableText(v.reopenReason), closedAt: text(v.closedAt),
    closedByName: nullableText(v.closedByName),
    supersededAt: nullableText(v.supersededAt),
  };
}
function session(raw: unknown): CashDaySession {
  const v = obj(raw);
  if (!Array.isArray(v.closes)) throw new TypeError('Cash closes required');
  const version = minor(v.version);
  if (version < 1) throw new TypeError('Invalid cash version');
  return {
    id: id(v.id), number: text(v.number),
    accountId: id(v.accountId), accountName: text(v.accountName),
    businessDate: date(v.businessDate), status: oneOf(v.status, dayStates),
    openingAmountMinor: minor(v.openingAmountMinor),
    previousClosingMinor: nullableMinor(v.previousClosingMinor),
    cashInMinor: minor(v.cashInMinor), cashOutMinor: minor(v.cashOutMinor),
    expectedClosingMinor: minor(v.expectedClosingMinor),
    openedAt: text(v.openedAt), openedByName: nullableText(v.openedByName),
    closes: v.closes.map(close), version,
  };
}
function nullableSession(raw: unknown): CashDaySession | null {
  return raw === null ? null : session(raw);
}
function decodeDayStatus(raw: unknown): CashDayStatus {
  const v = obj(raw);
  return {
    enabled: bool(v.enabled), drawerAccountId: nullableId(v.drawerAccountId),
    businessDate: date(v.businessDate),
    todaySession: nullableSession(v.todaySession),
    blockedByDate: v.blockedByDate === null ? null : date(v.blockedByDate),
    blockedSession: nullableSession(v.blockedSession),
    previousClosingMinor: nullableMinor(v.previousClosingMinor),
    drawerBalanceMinor: minor(v.drawerBalanceMinor),
    canReopenToday: bool(v.canReopenToday),
  };
}
function decodeHistory(raw: unknown): DailyCashResult {
  const v = obj(raw);
  if (!Array.isArray(v.rows)) throw new TypeError('Cash history required');
  const page = obj(v.page);
  return {
    rows: v.rows.map((raw): DailyCashRow => {
      const row = obj(raw);
      return {
        sessionId: id(row.sessionId), businessDate: date(row.businessDate),
        status: oneOf(row.status, dayStates),
        openingAmountMinor: minor(row.openingAmountMinor),
        cashInMinor: minor(row.cashInMinor), cashOutMinor: minor(row.cashOutMinor),
        expectedClosingMinor: nullableMinor(row.expectedClosingMinor),
        countedClosingMinor: nullableMinor(row.countedClosingMinor),
        differenceMinor: nullableMinor(row.differenceMinor),
        differenceKind: row.differenceKind === null
          ? null : oneOf(row.differenceKind, differenceStates),
        differenceReason: nullableText(row.differenceReason),
        wasReopened: bool(row.wasReopened),
      };
    }),
    page: {
      nextCursor: nullableText(page.nextCursor),
      hasMore: bool(page.hasMore),
    },
  };
}
function decodeAccounts(raw: unknown): MoneyAccount[] {
  const v = obj(raw);
  if (!Array.isArray(v.accounts)) throw new TypeError('Cash accounts required');
  // Validate the whole list envelope; loans must not inflate bank figures.
  minor(v.totalCashMinor); minor(v.totalBankMinor);
  minor(v.totalMfsMinor); minor(v.totalLoanMinor);
  return v.accounts.map(raw => {
    const item = obj(raw);
    const version = minor(item.version);
    if (version < 1) throw new TypeError('Invalid money account version');
    return {
      id: id(item.id), name: text(item.name),
      type: oneOf(item.type, ['CASH', 'BANK', 'MFS', 'LOAN'] as const),
      isDrawer: bool(item.isDrawer),
      status: oneOf(item.status, ['ACTIVE', 'INACTIVE'] as const),
      balanceMinor: minor(item.balanceMinor),
      openingAmountMinor: nullableMinor(item.openingAmountMinor),
      openingDate: item.openingDate === null ? null : date(item.openingDate),
      holderName: nullableText(item.holderName),
      reference: nullableText(item.reference),
      version,
    };
  });
}
function decodeMutation(raw: unknown): CashDaySession {
  const v = obj(raw);
  return session(v.data);
}
function decodeSettingSave(raw: unknown): CashSettings {
  const v = obj(raw);
  const data = obj(v.data);
  const values = obj(data.values);
  if (!Object.values(values).every(value => typeof value === 'string')) {
    throw new TypeError('Invalid setting values');
  }
  if (!['on', 'off'].includes(values.cash_session_enabled as string)) {
    throw new TypeError('No confirmed cash-session setting');
  }
  return { values: values as Record<string, string> };
}
function validMinor(value: number): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError('Cash amount must be exact nonnegative integer poisha');
  }
}
function validOperation(value: string): void {
  if (!isOperationId(value)) throw new TypeError('Invalid cash mutation operation ID');
}
function validDate(value: string): void {
  date(value);
}

/** Convert typed Bangla/English text without floating-point arithmetic. */
export function cashToMinor(value: string): number {
  const amount = parseScaledInput(value, 2);
  validMinor(amount);
  return amount;
}

/** Never caches or retries a read, and never substitutes preview data. */
export function fetchCashDay(accessToken: string, signal?: AbortSignal): Promise<CashDayStatus> {
  return requestJson({
    method: 'GET', path: '/api/v1/money/day', accessToken, signal,
  }, decodeDayStatus);
}
export function fetchCashHistory(accessToken: string, signal?: AbortSignal): Promise<DailyCashResult> {
  return requestJson({
    method: 'GET', path: '/api/v1/money/daily-cash?limit=50',
    accessToken, signal,
  }, decodeHistory);
}
export function fetchCashAccounts(accessToken: string, signal?: AbortSignal): Promise<MoneyAccount[]> {
  return requestJson({
    method: 'GET', path: '/api/v1/money/accounts',
    accessToken, signal,
  }, decodeAccounts);
}
export type StartCashDayInput = {
  businessDate: string; openingAmountMinor: number;
  counterpartAccountCode: string | null; note: string | null;
  operationId: string;
};
export function startCashDay(
  accessToken: string, input: StartCashDayInput, signal?: AbortSignal,
): Promise<CashDaySession> {
  validOperation(input.operationId);
  validDate(input.businessDate);
  validMinor(input.openingAmountMinor);
  return requestJson({
    method: 'POST', path: '/api/v1/money/day/start',
    accessToken, operationId: input.operationId, body: input, signal,
  }, decodeMutation);
}
export type CloseCashDayInput = {
  countedClosingMinor: number; reason: string | null; operationId: string;
};
export function closeCashDay(
  accessToken: string, sessionId: string, input: CloseCashDayInput,
  signal?: AbortSignal,
): Promise<CashDaySession> {
  id(sessionId); validOperation(input.operationId);
  validMinor(input.countedClosingMinor);
  return requestJson({
    method: 'POST', path: `/api/v1/money/day/${sessionId}/close`,
    accessToken, operationId: input.operationId, body: input, signal,
  }, decodeMutation);
}
export type ReopenCashDayInput = { reason: string; operationId: string };
export function reopenCashDay(
  accessToken: string, sessionId: string, input: ReopenCashDayInput,
  signal?: AbortSignal,
): Promise<CashDaySession> {
  id(sessionId); validOperation(input.operationId);
  if (!input.reason.trim()) throw new TypeError('Cash reopen reason required');
  return requestJson({
    method: 'POST', path: `/api/v1/money/day/${sessionId}/reopen`,
    accessToken, operationId: input.operationId, body: input, signal,
  }, decodeMutation);
}
export async function fetchCashSettings(
  accessToken: string, signal?: AbortSignal,
): Promise<CashSettings> {
  const result = await readTenantSettings(accessToken, signal);
  return { values: result.data.values };
}
export function saveCashEnabled(
  accessToken: string, enabled: boolean, signal?: AbortSignal,
): Promise<CashSettings> {
  if (typeof enabled !== 'boolean') throw new TypeError('Cash setting must be a boolean');
  return requestJson({
    method: 'POST', path: '/api/v1/settings/value',
    accessToken, body: { key: 'cash_session_enabled', value: enabled ? 'on' : 'off' },
    signal,
  }, decodeSettingSave);
}
