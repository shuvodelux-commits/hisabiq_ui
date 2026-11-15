import { ApiError } from './errors.ts';
import { readMoneyAccounts, type ServerMoneyAccount } from './accounts.ts';
import { readTradingParty, type TradingParty } from './party-reads.ts';
import {
  counterTakaToMinor, recordSingleAccountCounterSettlement,
  type CounterSettlementResult, type CounterSingleSettlementDraft,
} from './counter-single-account.ts';
import { resolveConnectedCounterPreflight } from './connected-counter-preflight.ts';
import type { SessionStore, SessionSnapshot } from './session.ts';

/**
 * MOD-006 T02-D: UNMOUNTED, authenticated, single-account Counter coordinator.
 *
 * This is NOT an authorization to activate the connected Counter or financial
 * UI. The existing Nest payment service is the only ledger/journal writer.
 * CASH remains blocked until Cash Session ON/OFF browser+PG acceptance. A POST
 * might commit even when its response, a subsequent GET, or the session is lost.
 * The caller MUST retain the original draft and operationId, reconcile source
 * history, and never invent a second idempotency key to retry.
 */
export interface ConnectedCounterPostedAndRefreshed {
  readonly scope: { readonly tenantId: string; readonly userId: string; readonly epoch: number };
  readonly payment: CounterSettlementResult;
  readonly account: ServerMoneyAccount;
  readonly party: TradingParty;
}
type SessionReader = Pick<SessionStore, 'getSnapshot' | 'subscribe' | 'revalidateAccess'>;
type Authenticated = Extract<SessionSnapshot, { status: 'authenticated' }>;
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

function invalid(message = 'Connected Counter payment could not be verified'): never {
  throw new ApiError('protocol', message);
}
function authenticated(value: SessionSnapshot): value is Authenticated {
  return value.status === 'authenticated' && ULID.test(value.tenantId) &&
    ULID.test(value.userId) && Number.isSafeInteger(value.epoch) &&
    typeof value.accessToken === 'string' && !!value.accessToken &&
    !/\s/.test(value.accessToken) && Array.isArray(value.permissions);
}
function sameSession(current: SessionSnapshot, capture: Authenticated): boolean {
  return authenticated(current) && current.tenantId === capture.tenantId &&
    current.userId === capture.userId && current.epoch === capture.epoch &&
    current.accessToken === capture.accessToken &&
    current.permissions.length === capture.permissions.length &&
    current.permissions.every((p, i) => p === capture.permissions[i]);
}
function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
function checkedDraft(draft: CounterSingleSettlementDraft): {
  accountId: string;
  accountType: 'BANK' | 'MFS';
} {
  if (!draft || typeof draft !== 'object' ||
      (draft.kind !== 'CUSTOMER_RECEIPT' && draft.kind !== 'SUPPLIER_PAYMENT') ||
      typeof draft.partyId !== 'string' || !ULID.test(draft.partyId) ||
      typeof draft.operationId !== 'string' || !ULID.test(draft.operationId) ||
      !Array.isArray(draft.sources) || draft.sources.length !== 1 ||
      (draft.invoiceId !== undefined && draft.invoiceId !== null) ||
      (draft.discount !== undefined && draft.discount !== '' &&
       !/^0+(?:\.0{1,2})?$/.test(draft.discount)) ||
      (draft.discountReason !== undefined && draft.discountReason.trim() !== '') ||
      (draft.businessDate !== undefined && !validDate(draft.businessDate)) ||
      (draft.note !== undefined && draft.note !== null && typeof draft.note !== 'string')) {
    return invalid('Unsupported Counter action, split tender, discount, or invoice allocation');
  }
  const source = draft.sources[0];
  if (!source || !source.account || typeof source.account.id !== 'string' ||
      !ULID.test(source.account.id) || source.account.status !== 'ACTIVE') {
    return invalid('A verified active money account is required');
  }
  if (!((source.method === 'Bank' && source.account.type === 'BANK') ||
        (source.method === 'Mobile Banking' && source.account.type === 'MFS'))) {
    return invalid('Only verified single-account BANK/MFS is enabled; CASH needs session acceptance');
  }
  counterTakaToMinor(source.amount);
  return { accountId: source.account.id, accountType: source.account.type };
}

function mayHavePosted(): never {
  throw new ApiError('protocol',
    'Payment may have posted; reconcile source history before any retry with the original operation ID');
}

/**
 * All GET/POSTs use the original SessionStore token, never preview credentials.
 * Revalidated server sources replace caller account snapshots; no optimistic
 * bookkeeping. A single successful response is followed by independent source
 * reads, but that read must not be treated as another payment operation.
 */
export async function recordConnectedBankCounterSettlement(
  session: SessionReader,
  draft: CounterSingleSettlementDraft,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ConnectedCounterPostedAndRefreshed> {
  const { accountId, accountType } = checkedDraft(draft);
  if (!session || typeof session.getSnapshot !== 'function' ||
      typeof session.subscribe !== 'function' ||
      typeof session.revalidateAccess !== 'function' ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const initial = session.getSnapshot();
  if (!authenticated(initial)) return invalid('Verified, unlocked connected session required');

  const controller = new AbortController();
  let stale = false;
  let posted = false;
  const onChange = () => {
    if (!sameSession(session.getSnapshot(), initial)) {
      stale = true;
      controller.abort();
    }
  };
  const abort = () => controller.abort();
  const unsubscribe = session.subscribe(onChange);
  const timeout = globalThis.setTimeout(abort, timeoutMs);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  try {
    onChange();
    if (stale) return invalid('Counter session changed before verification');
    if (controller.signal.aborted) throw new ApiError('network', 'Counter request aborted');

    const preflight = await resolveConnectedCounterPreflight(
      session, draft.kind, draft.partyId, accountId, controller.signal,
    );
    onChange();
    if (stale || controller.signal.aborted) return invalid('Counter session changed before posting');
    if (preflight.scope.tenantId !== initial.tenantId ||
        preflight.scope.userId !== initial.userId || preflight.scope.epoch !== initial.epoch ||
        preflight.account.type !== accountType ||
        preflight.requiresCashSessionVerification) return invalid();

    // Use only the freshly verified Nest account, not the older UI snapshot.
    const originalTender = draft.sources[0]!;
    const verifiedDraft: CounterSingleSettlementDraft = {
      ...draft,
      sources: [{ ...originalTender, account: preflight.account }],
    };
    const payment = await recordSingleAccountCounterSettlement(
      initial.accessToken, verifiedDraft, controller.signal, timeoutMs,
    );
    posted = true;
    onChange();
    if (stale || controller.signal.aborted) return mayHavePosted();

    // A posted document does not mean it is safe to display a projected balance.
    const role = draft.kind === 'CUSTOMER_RECEIPT' ? 'CUSTOMER' : 'SUPPLIER';
    const [accounts, detail] = await Promise.all([
      readMoneyAccounts(initial.accessToken, {}, controller.signal),
      readTradingParty(initial.accessToken, draft.partyId, role, controller.signal),
    ]);
    onChange();
    if (stale || controller.signal.aborted) return mayHavePosted();
    const account = accounts.accounts.find(a => a.id === accountId);
    const party = detail.data;
    if (!account || account.status !== 'ACTIVE' || account.type !== accountType ||
        party.id !== draft.partyId || party.readRole !== role ||
        !party.roles.includes(role) || party.status !== 'ACTIVE' ||
        party.isSystemReserved) return mayHavePosted();
    return {
      scope: Object.freeze({ tenantId: initial.tenantId, userId: initial.userId, epoch: initial.epoch }),
      payment, account, party,
    };
  } catch (error) {
    if (stale || posted) return mayHavePosted();
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
    controller.abort();
    unsubscribe();
    signal?.removeEventListener('abort', abort);
  }
}
