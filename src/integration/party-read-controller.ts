import { ApiError, type ApiErrorKind } from './errors.ts';
import {
  readTradingParties,
  readTradingPartyLedger,
  type TradingLedger,
  type TradingLedgerQuery,
  type TradingPartyList,
  type TradingPartyQuery,
  type TradingRole,
} from './party-reads.ts';
import {
  projectTradingDirectoryPage,
  projectTradingRoleLedger,
  tradingRoleForUi,
  type TradingDirectoryPage,
  type TradingRoleLedgerView,
  type UiPartyRelationship,
} from './party-read-model.ts';
import type { SessionSnapshot, SessionStore } from './session.ts';

/**
 * MOD-004 T04-R: not mounted in React. The connected-workspace gate remains
 * closed until full seven-role financial and write contracts are approved.
 *
 * Transport strictly uses verified SessionStore credentials and never passes
 * a caller-provided tenant ID. Every request is independently role-scoped.
 * Selected-role net figures remain net, not D08 gross due/advance balances.
 */
export interface TradingPartyReadTransport {
  list(
    accessToken: string,
    role: TradingRole,
    query: TradingPartyQuery,
    signal: AbortSignal,
  ): Promise<TradingPartyList>;
  ledger(
    accessToken: string,
    partyId: string,
    role: TradingRole,
    query: TradingLedgerQuery,
    signal: AbortSignal,
  ): Promise<TradingLedger>;
}

const defaultTransport: TradingPartyReadTransport = {
  list: (token, role, query, signal) => readTradingParties(token, role, query, signal),
  ledger: (token, partyId, role, query, signal) =>
    readTradingPartyLedger(token, partyId, role, query, signal),
};

type ReadKind = 'directory' | 'ledger';
type ReadyState =
  | { readonly status: 'directory'; readonly value: TradingDirectoryPage }
  | { readonly status: 'ledger'; readonly value: TradingRoleLedgerView };

export type PartyReadSnapshot =
  | { readonly status: 'idle' }
  | {
    readonly status: 'loading';
    readonly kind: ReadKind;
    readonly role: TradingRole;
    readonly partyId: string | null;
  }
  | ReadyState
  | {
    readonly status: 'error';
    readonly kind: ReadKind;
    readonly role: TradingRole;
    readonly partyId: string | null;
    readonly errorKind: ApiErrorKind;
    readonly httpStatus: number | null;
  };

type Authentication = Extract<SessionSnapshot, { status: 'authenticated' }>;
type PartySession = Pick<SessionStore, 'getSnapshot' | 'subscribe'>;

function sameAuthentication(
  expected: Authentication,
  actual: SessionSnapshot,
): actual is Authentication {
  return actual.status === 'authenticated' &&
    expected.epoch === actual.epoch &&
    expected.tenantId === actual.tenantId &&
    expected.userId === actual.userId &&
    expected.accessToken === actual.accessToken;
}

function protocol(): ApiError {
  return new ApiError('protocol', 'Verified Party session and trading relationship required');
}

/**
 * A single selected directory OR ledger read at a time.
 * Invalidation aborts the request and discards results even when a broken
 * network mock/provider ignores AbortSignal. No retry, polling, cache or
 * preview-store dependencies; no financial mutation methods exist.
 */
export class TradingPartyReadController {
  private state: PartyReadSnapshot = { status: 'idle' };
  private readonly listeners = new Set<() => void>();
  private readonly unsubscribeSession: () => void;
  private controller: AbortController | null = null;
  private authentication: Authentication | null = null;
  private generation = 0;
  private disposed = false;

  constructor(
    private readonly session: PartySession,
    private readonly transport: TradingPartyReadTransport = defaultTransport,
  ) {
    this.unsubscribeSession = session.subscribe(() => {
      if (this.authentication !== null &&
          !sameAuthentication(this.authentication, this.session.getSnapshot())) {
        this.clear();
      }
    });
  }

  getSnapshot = (): PartyReadSnapshot => this.state;

  subscribe = (listener: () => void): (() => void) => {
    if (this.disposed) return () => undefined;
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private publish(next: PartyReadSnapshot): void {
    if (this.disposed) return;
    this.state = next;
    for (const listener of this.listeners) listener();
  }

  private invalidate(): void {
    this.generation += 1;
    this.controller?.abort();
    this.controller = null;
    this.authentication = null;
  }

  /** Drop all Party data immediately on sign-out, lock or tenant/user switch. */
  clear(): void {
    this.invalidate();
    this.publish({ status: 'idle' });
  }

  dispose(): void {
    if (this.disposed) return;
    this.invalidate();
    this.unsubscribeSession();
    this.listeners.clear();
    this.state = { status: 'idle' };
    this.disposed = true;
  }

  private current(
    generation: number,
    authentication: Authentication,
    controller: AbortController,
  ): boolean {
    return !this.disposed &&
      this.generation === generation &&
      this.controller === controller &&
      !controller.signal.aborted &&
      sameAuthentication(authentication, this.session.getSnapshot());
  }

  private async execute<T extends ReadyState>(
    relationship: UiPartyRelationship | 'All',
    kind: ReadKind,
    partyId: string | null,
    read: (authentication: Authentication, role: TradingRole, signal: AbortSignal) => Promise<T>,
  ): Promise<T | null> {
    if (this.disposed) throw protocol();

    const role = tradingRoleForUi(relationship);
    const authentication = this.session.getSnapshot();
    if (role === null || authentication.status !== 'authenticated') {
      this.clear();
      throw protocol();
    }

    this.invalidate();
    const controller = new AbortController();
    const generation = this.generation;
    this.controller = controller;
    this.authentication = authentication;
    this.publish({ status: 'loading', kind, role, partyId });

    try {
      const ready = await read(authentication, role, controller.signal);
      // Session identity must be rechecked AFTER the awaited response. Merely
      // aborting is insufficient: some transports resolve after abort.
      if (!this.current(generation, authentication, controller)) return null;
      this.publish(ready);
      return ready;
    } catch (error) {
      // No error or stale page may replace a newer role, tenant or session.
      if (!this.current(generation, authentication, controller)) return null;
      const safeError = error instanceof ApiError ? error : null;
      this.publish({
        status: 'error',
        kind,
        role,
        partyId,
        errorKind: safeError?.kind ?? 'network',
        httpStatus: safeError?.status ?? null,
      });
      throw error;
    } finally {
      if (this.controller === controller) this.controller = null;
    }
  }

  async loadDirectory(
    relationship: UiPartyRelationship | 'All',
    query: TradingPartyQuery = {},
  ): Promise<TradingDirectoryPage | null> {
    const result = await this.execute(
      relationship,
      'directory',
      null,
      async (authentication, role, signal) => ({
        status: 'directory' as const,
        value: projectTradingDirectoryPage(role,
          await this.transport.list(authentication.accessToken, role, query, signal)),
      }),
    );
    return result?.value ?? null;
  }

  async loadLedger(
    relationship: UiPartyRelationship | 'All',
    partyId: string,
    query: TradingLedgerQuery = {},
  ): Promise<TradingRoleLedgerView | null> {
    const result = await this.execute(
      relationship,
      'ledger',
      partyId,
      async (authentication, role, signal) => ({
        status: 'ledger' as const,
        value: projectTradingRoleLedger(role, partyId,
          await this.transport.ledger(authentication.accessToken, partyId, role, query, signal)),
      }),
    );
    return result?.value ?? null;
  }
}
