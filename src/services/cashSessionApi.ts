/**
 * NestSherERP cash-day contract adapter.
 *
 * HisabIQ_UI is still a standalone preview. It cannot create an identity or
 * grant permissions. Connected mode is entered only when an actual NestSherERP
 * bearer token already exists (the same key used by bankEntryApi). The server
 * always validates tenant, permissions, account and date.
 *
 * Route /api/v1 through the application's same-origin API gateway to the
 * authorized NestSherERP service. No cross-origin token forwarding or fake
 * success responses are permitted.
 */
export type CashClose = {
  id: string;
  status: 'ACTIVE' | 'SUPERSEDED';
  countedClosingMinor: number;
  expectedClosingMinor: number;
  differenceMinor: number;
  differenceReason: string | null;
  closedAt: string;
  reopenReason: string | null;
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
};
export type MoneyAccountsResult = { accounts: MoneyAccount[] };
export type CashSettings = { values: Record<string, string> };
export type CashSettingSave = { data: CashSettings; warnings: Array<{ code: string; message: string }> };

const TOKEN_KEY = 'shererp_auth_token';

export function hasCashSessionCredentials(): boolean {
  try {
    return Boolean(window.localStorage.getItem(TOKEN_KEY));
  } catch {
    return false;
  }
}

function token(): string {
  try {
    const saved = window.localStorage.getItem(TOKEN_KEY);
    if (saved) return saved;
  } catch { /* Unavailable storage is not authentication. */ }
  throw new Error('Sign in to the connected ERP before changing real cash sessions.');
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token()}`,
      ...init.headers,
    },
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const body = payload as { error?: { message?: string; code?: string } | string; message?: string } | null;
    const message =
      typeof body?.error === 'string' ? body.error
        : typeof body?.error === 'object' && body.error?.message ? body.error.message
          : body?.message ?? `Cash service rejected the request (HTTP ${response.status}).`;
    if (response.status === 401) throw new Error('Your ERP session has expired. Sign in again.');
    if (response.status === 403) throw new Error(`Access denied: ${message}`);
    throw new Error(message);
  }
  if (!payload || typeof payload !== 'object') throw new Error('Unexpected cash-service response.');
  // NestSherERP GET status/history are unwrapped; mutation/settings endpoints
  // use { data: ... }. Accept exactly those documented shapes.
  return payload as T;
}

function mutation<T>(path: string, body: Record<string, unknown>): Promise<{ data: T }> {
  return request<{ data: T }>(path, { method: 'POST', body: JSON.stringify(body) });
}

/** A valid 26-character idempotency key, reused by callers on retries. */
export function cashOperationId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  return Array.from(bytes, (value) => alphabet[value & 31]).join('') +
    Array.from(bytes.slice(0, 10), (value) => alphabet[(value >>> 3) & 31]).join('');
}

export function cashToMinor(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isSafeInteger(Math.round(amount * 100)) ||
      Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001) {
    throw new Error('Enter a valid non-negative cash amount (up to two decimal places).');
  }
  return Math.round(amount * 100);
}

export async function fetchCashDay(): Promise<CashDayStatus> {
  const status = await request<CashDayStatus>('/api/v1/money/day');
  if (typeof status.enabled !== 'boolean' || typeof status.businessDate !== 'string') {
    throw new Error('Unexpected cash-day status from the ERP.');
  }
  return status;
}

export async function fetchCashHistory(): Promise<DailyCashResult> {
  const history = await request<DailyCashResult>('/api/v1/money/daily-cash?limit=50');
  if (!Array.isArray(history.rows)) throw new Error('Unexpected cash-session history.');
  return history;
}

export async function fetchCashAccounts(): Promise<MoneyAccount[]> {
  const value = await request<MoneyAccountsResult>('/api/v1/money/accounts');
  if (!Array.isArray(value.accounts)) throw new Error('Could not read money accounts.');
  return value.accounts;
}

export async function startCashDay(input: {
  businessDate: string;
  openingAmountMinor: number;
  counterpartAccountCode: string | null;
  note: string | null;
  operationId: string;
}): Promise<CashDaySession> {
  const value = await mutation<CashDaySession>('/api/v1/money/day/start', input);
  if (!value.data?.id) throw new Error('No confirmed cash session was returned.');
  return value.data;
}

export async function closeCashDay(sessionId: string, input: {
  countedClosingMinor: number;
  reason: string | null;
  operationId: string;
}): Promise<CashDaySession> {
  const value = await mutation<CashDaySession>(`/api/v1/money/day/${encodeURIComponent(sessionId)}/close`, input);
  if (!value.data?.id) throw new Error('No confirmed cash close was returned.');
  return value.data;
}

export async function reopenCashDay(sessionId: string, input: {
  reason: string;
  operationId: string;
}): Promise<CashDaySession> {
  const value = await mutation<CashDaySession>(`/api/v1/money/day/${encodeURIComponent(sessionId)}/reopen`, input);
  if (!value.data?.id) throw new Error('No confirmed reopened session was returned.');
  return value.data;
}

export async function fetchCashSettings(): Promise<CashSettings> {
  const value = await request<{ data: CashSettings }>('/api/v1/settings');
  if (!value.data?.values) throw new Error('No server-backed settings were returned.');
  return value.data;
}

export async function saveCashEnabled(enabled: boolean): Promise<CashSettings> {
  const result = await mutation<CashSettings>('/api/v1/settings/value', {
    key: 'cash_session_enabled',
    value: enabled ? 'on' : 'off',
  }) as CashSettingSave;
  if (!result.data?.values) throw new Error('Cash-session setting was not confirmed by the ERP.');
  return result.data;
}
