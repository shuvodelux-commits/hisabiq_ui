import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import { readMoneyAccounts, type ServerMoneyAccount } from './accounts.ts';
import type { SessionSnapshot, SessionStore } from './session.ts';

/**
 * MOD-006 T02-G1: read-only, UNMOUNTED eligibility check for physical CASH.
 *
 * A positive GET decision is NOT a payment authorization. Nest's source-owned
 * writer rechecks the tenant-locked Cash Session setting, account and business
 * date inside its posting transaction. Never substitute this for that check,
 * activate CounterWorkspace, or write a preview balance.
 */
export interface CounterCashDayEligibility {
  readonly scope: { readonly tenantId: string; readonly userId: string; readonly epoch: number };
  readonly account: ServerMoneyAccount;
  readonly businessDate: string;
  readonly mode: 'OPEN' | 'OFF' | 'NON_DRAWER';
  readonly sessionId: string | null;
}
type Reader = Pick<SessionStore, 'getSnapshot' | 'subscribe' | 'revalidateAccess'>;
type Authenticated = Extract<SessionSnapshot, { status: 'authenticated' }>;
type DaySession = { id: string; accountId: string; businessDate: string; status: 'OPEN' | 'CLOSED' };
type Day = {
  enabled: boolean; drawerAccountId: string | null; businessDate: string;
  todaySession: DaySession | null; blockedByDate: string | null;
  blockedSession: DaySession | null;
};
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const KEYS = [
  'enabled', 'drawerAccountId', 'businessDate', 'todaySession', 'blockedByDate',
  'blockedSession', 'previousClosingMinor', 'drawerBalanceMinor', 'canReopenToday',
] as const;
function refused(message = 'Cash Session eligibility could not be verified'): never {
  throw new ApiError('protocol', message);
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function date(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(time.getTime()) && time.toISOString().slice(0, 10) === value;
}
function id(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function nullableId(value: unknown): boolean { return value === null || id(value); }
function nullableDate(value: unknown): boolean { return value === null || date(value); }
function integer(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}
function session(value: unknown): value is DaySession {
  return record(value) && id(value.id) && id(value.accountId) &&
    date(value.businessDate) && (value.status === 'OPEN' || value.status === 'CLOSED');
}
function decodeDay(raw: unknown): Day {
  if (!record(raw) || Object.keys(raw).length !== KEYS.length ||
      !KEYS.every(key => Object.prototype.hasOwnProperty.call(raw, key)) ||
      typeof raw.enabled !== 'boolean' || !nullableId(raw.drawerAccountId) ||
      !date(raw.businessDate) || !nullableDate(raw.blockedByDate) ||
      (raw.todaySession !== null && !session(raw.todaySession)) ||
      (raw.blockedSession !== null && !session(raw.blockedSession)) ||
      (raw.previousClosingMinor !== null && !integer(raw.previousClosingMinor)) ||
      !integer(raw.drawerBalanceMinor) || typeof raw.canReopenToday !== 'boolean') return refused();

  if ((!raw.enabled && (raw.todaySession !== null || raw.blockedByDate !== null ||
                         raw.blockedSession !== null)) ||
      (raw.blockedByDate === null) !== (raw.blockedSession === null) ||
      (raw.blockedByDate !== null && (
        (raw.blockedSession as DaySession).businessDate !== raw.blockedByDate ||
        (raw.blockedSession as DaySession).status !== 'OPEN')) ||
      (raw.todaySession !== null &&
        (raw.todaySession as DaySession).businessDate !== raw.businessDate)) return refused();
  return raw as unknown as Day;
}
function authenticated(s: SessionSnapshot): s is Authenticated {
  return s.status === 'authenticated' && id(s.tenantId) && id(s.userId) &&
    Number.isSafeInteger(s.epoch) && typeof s.accessToken === 'string' &&
    !!s.accessToken && !/\s/.test(s.accessToken) && Array.isArray(s.permissions);
}
function sameSession(next: SessionSnapshot, initial: Authenticated): boolean {
  return authenticated(next) && next.tenantId === initial.tenantId &&
    next.userId === initial.userId && next.epoch === initial.epoch &&
    next.accessToken === initial.accessToken &&
    next.permissions.length === initial.permissions.length &&
    next.permissions.every((item, index) => item === initial.permissions[index]);
}

/**
 * All credentials must come from the existing authenticated SessionStore.
 * Verify fresh Nest /me privileges, real money account and Cash Day via GET.
 * The source-owned Nest POST remains the final gate against policy/TOCTOU races.
 */
export async function resolveConnectedCashSessionEligibility(
  reader: Reader,
  accountId: string,
  businessDate?: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<CounterCashDayEligibility> {
  if (!reader || typeof reader.getSnapshot !== 'function' ||
      typeof reader.subscribe !== 'function' ||
      typeof reader.revalidateAccess !== 'function' || !id(accountId) ||
      (businessDate !== undefined && !date(businessDate)) ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return refused();

  const initial = reader.getSnapshot();
  if (!authenticated(initial)) return refused('Verified and unlocked session is required');
  if (!['cash.account.view', 'cash.daily.view'].every(p => initial.permissions.includes(p))) {
    return refused('Cash account/day read permissions are required');
  }
  if (signal?.aborted) throw new ApiError('network', 'Cash Session verification was cancelled');

  await reader.revalidateAccess();
  const verified = reader.getSnapshot();
  if (!authenticated(verified) || !sameSession(verified, initial)) return refused('Session changed during verification');
  if (!['cash.account.view', 'cash.daily.view'].every(p => verified.permissions.includes(p))) {
    return refused('Cash account/day read permissions are required');
  }

  const controller = new AbortController();
  let stale = false;
  const onChange = () => {
    if (!sameSession(reader.getSnapshot(), verified)) {
      stale = true;
      controller.abort();
    }
  };
  const unsubscribe = reader.subscribe(onChange);
  const abort = () => controller.abort();
  const timeout = globalThis.setTimeout(abort, timeoutMs);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  try {
    onChange();
    if (stale) return refused('Counter session changed before cash verification');
    if (controller.signal.aborted) throw new ApiError('network', 'Cash Session verification cancelled');
    const [money, day] = await Promise.all([
      readMoneyAccounts(verified.accessToken, {}, controller.signal),
      requestJson({ method: 'GET', path: '/api/v1/money/day',
        accessToken: verified.accessToken, signal: controller.signal }, decodeDay),
    ]);
    onChange();
    if (stale) return refused('Counter session changed during Cash Day GET');
    if (controller.signal.aborted) throw new ApiError('network', 'Cash Session verification cancelled');

    const account = money.accounts.find(a => a.id === accountId);
    if (!account || account.type !== 'CASH' || account.status !== 'ACTIVE') {
      return refused('A real, active CASH account is required');
    }
    if (businessDate !== undefined && businessDate !== day.businessDate) {
      return refused('Cash payment business date must match the signed server day');
    }
    if (!account.isDrawer) {
      return Object.freeze({
        scope: Object.freeze({ tenantId: verified.tenantId, userId: verified.userId, epoch: verified.epoch }),
        account, businessDate: day.businessDate, mode: 'NON_DRAWER' as const, sessionId: null,
      });
    }
    if (day.drawerAccountId !== account.id) {
      return refused('The tracked Cash drawer changed; reselect it');
    }
    if (!day.enabled) {
      return Object.freeze({
        scope: Object.freeze({ tenantId: verified.tenantId, userId: verified.userId, epoch: verified.epoch }),
        account, businessDate: day.businessDate, mode: 'OFF' as const, sessionId: null,
      });
    }
    if (day.blockedByDate !== null || !day.todaySession ||
        day.todaySession.status !== 'OPEN' ||
        day.todaySession.accountId !== account.id ||
        day.todaySession.businessDate !== day.businessDate) {
      return refused('Start an eligible Cash Day before posting to the tracked drawer');
    }
    return Object.freeze({
      scope: Object.freeze({ tenantId: verified.tenantId, userId: verified.userId, epoch: verified.epoch }),
      account, businessDate: day.businessDate, mode: 'OPEN' as const, sessionId: day.todaySession.id,
    });
  } catch (error) {
    if (stale) return refused('Counter session is no longer current');
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
    controller.abort();
    unsubscribe();
    signal?.removeEventListener('abort', abort);
  }
}
