import { ApiError } from './errors.ts';
import { readMoneyAccounts, type ServerMoneyAccount } from './accounts.ts';
import { readTradingParty, type TradingParty, type TradingRole } from './party-reads.ts';
import type { CounterSettlementKind } from './counter-single-account.ts';
import type { SessionStore, SessionSnapshot } from './session.ts';

/**
 * MOD-006 T02-A: a READ-ONLY, UNMOUNTED preflight.
 *
 * Only the authenticated SessionStore supplies tenant, user, bearer and epoch.
 * Nest still owns real authorization, Cash Session eligibility, period locks,
 * account lineage and every final financial posting decision.
 *
 * Never use this result to silently unlock split tenders, post money, mutate
 * balances, or substitute preview Party/account state.
 */
export interface ConnectedCounterPreflight {
  readonly scope: {
    readonly tenantId: string;
    readonly userId: string;
    readonly epoch: number;
  };
  readonly party: TradingParty;
  readonly account: ServerMoneyAccount;
  /** CASH still requires the server's Cash Session ON/OFF eligibility check. */
  readonly requiresCashSessionVerification: boolean;
}

type SessionReader = Pick<SessionStore, 'getSnapshot' | 'subscribe' | 'revalidateAccess'>;

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const REQUIREMENTS: Record<CounterSettlementKind, {
  role: TradingRole;
  permissions: readonly string[];
}> = {
  CUSTOMER_RECEIPT: {
    role: 'CUSTOMER',
    permissions: ['party.customer.view', 'sale.payment.record'],
  },
  SUPPLIER_PAYMENT: {
    role: 'SUPPLIER',
    permissions: ['party.supplier.view', 'purchase.payment.record'],
  },
};

function denied(message = 'Connected Counter selection cannot be verified'): never {
  throw new ApiError('protocol', message);
}

function authenticated(value: SessionSnapshot): value is Extract<SessionSnapshot, { status: 'authenticated' }> {
  return value.status === 'authenticated' &&
    ULID.test(value.tenantId) && ULID.test(value.userId) &&
    Number.isSafeInteger(value.epoch) &&
    typeof value.accessToken === 'string' && !!value.accessToken &&
    !/\s/.test(value.accessToken) && Array.isArray(value.permissions);
}

function sameScope(
  current: SessionSnapshot,
  captured: Extract<SessionSnapshot, { status: 'authenticated' }>,
): boolean {
  return authenticated(current) &&
    current.tenantId === captured.tenantId &&
    current.userId === captured.userId &&
    current.epoch === captured.epoch &&
    current.accessToken === captured.accessToken &&
    current.permissions.length === captured.permissions.length &&
    current.permissions.every((permission, index) => permission === captured.permissions[index]);
}

function accountViewPermission(type: ServerMoneyAccount['type']): string {
  if (type === 'CASH') return 'cash.account.view';
  if (type === 'BANK' || type === 'MFS') return 'bank.account.view';
  return denied('Loan accounts cannot be used for ordinary Counter settlements');
}

/**
 * The caller must use the original verified session, not a manually assembled
 * token/tenant pair. No payment is sent by this function. Resource reads and
 * returning the result are guarded against an asynchronous tenant/user/epoch
 * switch or permission revocation. The server independently checks again on
 * the eventual money-writing POST.
 */
export async function resolveConnectedCounterPreflight(
  session: SessionReader,
  kind: CounterSettlementKind,
  partyId: string,
  accountId: string,
  signal?: AbortSignal,
): Promise<ConnectedCounterPreflight> {
  if (!session || typeof session.getSnapshot !== 'function' ||
      typeof session.subscribe !== 'function' ||
      typeof session.revalidateAccess !== 'function' ||
      !Object.prototype.hasOwnProperty.call(REQUIREMENTS, kind) ||
      typeof partyId !== 'string' || !ULID.test(partyId) ||
      typeof accountId !== 'string' || !ULID.test(accountId)) return denied();

  const before = session.getSnapshot();
  if (!authenticated(before)) return denied('A verified, unlocked session is required');

  // SessionStore verifies the signed /me identity and current role privileges.
  await session.revalidateAccess();
  const captured = session.getSnapshot();
  if (!sameScope(captured, before)) return denied('Counter session changed during verification');

  const requirement = REQUIREMENTS[kind];
  if (!requirement || !requirement.permissions.every(permission =>
    captured.permissions.includes(permission))) {
    return denied('Counter payment permission is missing');
  }

  const controller = new AbortController();
  let stale = false;
  const onScopeChange = () => {
    if (!sameScope(session.getSnapshot(), captured)) {
      stale = true;
      controller.abort();
    }
  };
  const abort = () => controller.abort();
  const unsubscribe = session.subscribe(onScopeChange);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  try {
    onScopeChange();
    if (stale) return denied('Counter session is no longer current');
    if (controller.signal.aborted) throw new ApiError('network', 'Counter verification was cancelled');

    const [list, detail] = await Promise.all([
      readMoneyAccounts(captured.accessToken, {}, controller.signal),
      readTradingParty(captured.accessToken, partyId, requirement.role, controller.signal),
    ]);

    onScopeChange();
    if (stale || controller.signal.aborted) return denied('Counter session changed during resource read');

    const selected = list.accounts.find(account => account.id === accountId);
    if (!selected || selected.status !== 'ACTIVE' ||
        (selected.type !== 'CASH' && selected.type !== 'BANK' && selected.type !== 'MFS')) {
      return denied('A verified active money account is required');
    }
    if (!captured.permissions.includes(accountViewPermission(selected.type))) {
      return denied('Money account view permission is missing');
    }

    const tradingParty = detail.data;
    if (tradingParty.id !== partyId || tradingParty.readRole !== requirement.role ||
        !tradingParty.roles.includes(requirement.role) ||
        tradingParty.status !== 'ACTIVE' || tradingParty.isSystemReserved) {
      return denied('An active trading Party with the correct role is required');
    }
    onScopeChange();
    if (stale || controller.signal.aborted) return denied('Counter session changed during verification');

    return {
      scope: Object.freeze({
        tenantId: captured.tenantId,
        userId: captured.userId,
        epoch: captured.epoch,
      }),
      party: tradingParty,
      account: selected,
      requiresCashSessionVerification: selected.type === 'CASH',
    };
  } catch (error) {
    if (stale) return denied('Counter session is no longer current');
    throw error;
  } finally {
    controller.abort();
    unsubscribe();
    signal?.removeEventListener('abort', abort);
  }
}
