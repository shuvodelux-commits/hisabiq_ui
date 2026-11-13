import { ApiError, type ApiErrorKind } from './errors.ts';
import {
  decodePartySetup,
  readPartySetup,
  type ServerPartySetup,
  type ServerPartySetupEnvelope,
} from './party-setup.ts';
import {
  readTradingParties,
  readTradingParty,
  readTradingPartyLedger,
  readHistoricalPartyOpening,
  type TradingLedger,
  type HistoricalPartyOpeningEnvelope,
  type TradingLedgerQuery,
  type TradingPartyList,
  type TradingPartyDetail,
  type TradingPartyQuery,
  type TradingRole,
} from './party-reads.ts';
import {
  projectTradingDirectoryPage,
  projectTradingPartyDetail,
  projectTradingRoleLedger,
  projectTradingHistoricalOpening,
  tradingRoleForUi,
  type TradingDirectoryPage,
  type TradingPartyReadDetail,
  type TradingRoleLedgerView,
  type TradingHistoricalOpeningView,
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
  /** Optional for legacy injected test mocks; missing means fail closed. */
  detail?(
    accessToken: string,
    partyId: string,
    role: TradingRole,
    signal: AbortSignal,
  ): Promise<TradingPartyDetail>;
  ledger(
    accessToken: string,
    partyId: string,
    role: TradingRole,
    query: TradingLedgerQuery,
    signal: AbortSignal,
  ): Promise<TradingLedger>;
  opening(
    accessToken: string,
    partyId: string,
    role: TradingRole,
    signal: AbortSignal,
  ): Promise<HistoricalPartyOpeningEnvelope>;
  /** Optional only for existing test mocks; the default is a strict GET. */
  setup?(accessToken: string, signal: AbortSignal): Promise<ServerPartySetupEnvelope>;
}

const defaultTransport: TradingPartyReadTransport = {
  list: (token, role, query, signal) => readTradingParties(token, role, query, signal),
  detail: (token, partyId, role, signal) => readTradingParty(token, partyId, role, signal),
  ledger: (token, partyId, role, query, signal) =>
    readTradingPartyLedger(token, partyId, role, query, signal),
  opening: (token, partyId, role, signal) =>
    readHistoricalPartyOpening(token, partyId, role, signal),
  setup: (token, signal) => readPartySetup(token, signal),
};

type ReadKind = 'directory' | 'detail' | 'ledger' | 'opening' | 'setup';
type ReadyState =
  | { readonly status: 'directory'; readonly value: TradingDirectoryPage }
  | { readonly status: 'detail'; readonly value: TradingPartyReadDetail }
  | { readonly status: 'ledger'; readonly value: TradingRoleLedgerView }
  | { readonly status: 'opening'; readonly value: TradingHistoricalOpeningView }
  | { readonly status: 'setup'; readonly value: ServerPartySetup };

export type PartyReadSnapshot =
  | { readonly status: 'idle' }
  | {
    readonly status: 'loading';
    readonly kind: ReadKind;
    readonly role: TradingRole | null;
    readonly partyId: string | null;
  }
  | ReadyState
  | {
    readonly status: 'error';
    readonly kind: ReadKind;
    readonly role: TradingRole | null;
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

  private readonly session: PartySession;
  private readonly transport: TradingPartyReadTransport;

  constructor(
    session: PartySession,
    transport: TradingPartyReadTransport = defaultTransport,
  ) {
    this.session = session;
    this.transport = transport;
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
    kind: Exclude<ReadKind, 'setup'>,
    partyId: string | null,
    read: (authentication: Authentication, role: TradingRole, signal: AbortSignal) => Promise<T>,
  ): Promise<T | null> {
    if (this.disposed) throw protocol();
    const role = tradingRoleForUi(relationship);
    if (role === null) {
      this.clear();
      throw protocol();
    }
    return this.executeAuthenticated(kind, role, partyId,
      (authentication, signal) => read(authentication, role, signal));
  }

  /** Shared identity-bound lifecycle for role reads and role-free form setup. */
  private async executeAuthenticated<T extends ReadyState>(
    kind: ReadKind,
    role: TradingRole | null,
    partyId: string | null,
    read: (authentication: Authentication, signal: AbortSignal) => Promise<T>,
  ): Promise<T | null> {
    if (this.disposed) throw protocol();
    const authentication = this.session.getSnapshot();
    if (authentication.status !== 'authenticated') {
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
      const ready = await read(authentication, controller.signal);
      if (!this.current(generation, authentication, controller)) {
        this.dropUnnotifiedSession(generation, authentication, controller);
        return null;
      }
      this.publish(ready);
      return ready;
    } catch (error) {
      if (!this.current(generation, authentication, controller)) {
        this.dropUnnotifiedSession(generation, authentication, controller);
        return null;
      }
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

  /** A silently changed session must not leave the loading snapshot forever. */
  private dropUnnotifiedSession(
    generation: number,
    authentication: Authentication,
    controller: AbortController,
  ): void {
    if (this.generation === generation &&
        this.controller === controller &&
        !sameAuthentication(authentication, this.session.getSnapshot())) {
      this.clear();
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

  /**
   * One relationship and exact Party identity; never use a party-wide balance.
   * Even when an injected transport returns a structurally valid other Party,
   * reject it before exposing any detail to the connected presentation layer.
   */
  async loadPartyDetail(
    relationship: UiPartyRelationship | 'All',
    partyId: string,
  ): Promise<TradingPartyReadDetail | null> {
    if (typeof partyId !== 'string' ||
        !/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/.test(partyId)) {
      this.clear();
      throw protocol();
    }

    const result = await this.execute(
      relationship,
      'detail',
      partyId,
      async (authentication, role, signal) => {
        // Do not escape an incomplete injected/mock transport to real HTTP.
        if (!this.transport.detail) throw protocol();
        const view = projectTradingPartyDetail(role,
          await this.transport.detail(authentication.accessToken, partyId, role, signal));
        if (view.item.partyId !== partyId) throw protocol();
        return { status: 'detail' as const, value: view };
      },
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


  /**
   * Exact trading-role historical source read; no cash session is involved.
   * On a completed GET with no opening, returns {opening:null}. On an aborted
   * or superseded GET, returns null; on HTTP/protocol failure, throws.
   * The caller must not interpret any of these as a zero opening journal.
   */
  async loadHistoricalOpening(
    relationship: UiPartyRelationship | 'All',
    partyId: string,
  ): Promise<TradingHistoricalOpeningView | null> {
    const result = await this.execute(
      relationship,
      'opening',
      partyId,
      async (authentication, role, signal) => ({
        status: 'opening' as const,
        value: projectTradingHistoricalOpening(role, partyId,
          await this.transport.opening(authentication.accessToken, partyId, role, signal)),
      }),
    );
    return result?.value ?? null;
  }

  /** Session-epoch-safe read of the backend's feature/field/group settings. */
  async loadPartySetup(): Promise<ServerPartySetup | null> {
    const result = await this.executeAuthenticated(
      'setup',
      null,
      null,
      async (authentication, signal) => ({
        status: 'setup' as const,
        // The default transport provides the real GET; injected transports
        // must explicitly provide setup. Never escape a test/mock transport
        // into a live network call if that method is omitted.
        value: decodePartySetup(await (() => {
          if (!this.transport.setup) throw protocol();
          return this.transport.setup(authentication.accessToken, signal);
        })()).data,
      }),
    );
    return result?.value ?? null;
  }
}
