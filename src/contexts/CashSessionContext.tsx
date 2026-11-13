import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from 'react';
import { CashSessionStore, type CashAuthority } from '../finance/cashSession';
import { useTenantSettings } from '../settings/TenantSettingsProvider';
import { effectivePermissions } from '../settings/rbac';
import { getFinancePreviewSnapshot } from '../data/financePreviewStore';
import type { CashSessionRecord } from '../data/financeAccounts';
import { businessToday } from '../utils/dateRange';
import { useSession } from '../integration/SessionProvider.tsx';
import { ApiError } from '../integration/errors.ts';
import { generateOperationId } from '../integration/operation.ts';
import {
  cashToMinor, closeCashDay, fetchCashAccounts, fetchCashDay, fetchCashHistory,
  reopenCashDay, startCashDay,
  type CashDaySession, type CashDayStatus, type DailyCashRow, type MoneyAccount,
} from '../services/cashSessionApi.ts';

type CashCount = { counted: number; expected: number; note: string; savedAt: string; closed: boolean };
type CashMode = 'preview' | 'loading' | 'connected' | 'error' | 'locked';
type ServerSnapshot = {
  identity: string;
  day: CashDayStatus;
  history: DailyCashRow[];
  accounts: MoneyAccount[];
};
type PendingOperation = { identity: string; fingerprint: string; id: string };
type CashSessionContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  sessionOpen: boolean;
  openingCash: number;
  expectedCash: number;
  sampleMovements: boolean;
  startSession: (opening: string, counterpart: string, note: string, revision: number, operationId: string) => void | Promise<void>;
  saveCount: (counted: number, note: string, close: boolean, revision: number, operationId: string) => void | Promise<void>;
  lastCount: CashCount | null;
  revision: number;
  businessDate: string;
  sessionDate: string | null;
  previousClosing: number | null;
  drawerBalance: number;
  history: CashSessionRecord[];
  canView: boolean;
  canStart: boolean;
  canClose: boolean;
  enabled: boolean;
  startBlocked: boolean;
  mode: CashMode;
  busy: boolean;
  error: string | null;
  dayStatus: CashDayStatus | null;
  accounts: MoneyAccount[];
  reopenSession: (reason: string) => Promise<void>;
  refresh: () => Promise<void>;
};
const CashSessionContext = createContext<CashSessionContextValue | null>(null);
const message = (error: unknown): string =>
  error instanceof Error ? error.message : 'Could not contact the cash service';

function toHistoryRecord(row: DailyCashRow): CashSessionRecord {
  return {
    id: row.sessionId,
    date: row.businessDate,
    openedAt: row.businessDate,
    openingCash: row.openingAmountMinor / 100,
    expectedCash: (row.expectedClosingMinor ?? 0) / 100,
    countedCash: row.countedClosingMinor === null ? undefined : row.countedClosingMinor / 100,
    variance: row.differenceMinor === null ? undefined : row.differenceMinor / 100,
    status: row.status === 'OPEN' ? 'Open' : 'Closed',
    note: row.differenceReason ?? undefined,
  };
}

/**
 * One provider serves unchanged local preview UI and server-owned connected UI.
 * A trusted SessionSnapshot (not a localStorage key or preview tenant) owns every
 * connected request. Connected failures never run the preview CashSessionStore.
 */
export function CashSessionProvider({ children }: { children: ReactNode }) {
  const { state, actorId, currentAuthority } = useTenantSettings();
  const { mode: integrationMode, snapshot: auth } = useSession();
  const [open, setOpen] = useState(false);
  const storeRef = useRef<{ tenantId: string; store: CashSessionStore }>();
  if (storeRef.current?.tenantId !== state.tenantId) {
    storeRef.current = { tenantId: state.tenantId, store: new CashSessionStore(state.tenantId) };
  }
  const store = storeRef.current.store;
  const [, render] = useState(0);
  const preview = store.snapshot();
  const previewEnabled = state.sections.money.cashSession;
  const previewPermissions = effectivePermissions(state.sections.team, actorId);
  const previewCanView = previewEnabled && previewPermissions.includes('cash.daily.view');
  const previewActive = preview.sessions.find(item => item.status === 'Open');
  const previewLast = preview.sessions.at(-1);
  const previewClosing = previewActive?.previousClosingMinor ??
    (previewLast?.status === 'Closed' ? previewLast.countedMinor ?? null : null);
  const previewHistory: CashSessionRecord[] = previewCanView ? preview.sessions.map(item => ({
    id: item.id, date: item.businessDate, openedAt: item.openedAt, closedAt: item.closedAt,
    openingCash: item.openingMinor / 100, expectedCash: item.expectedMinor / 100,
    countedCash: item.countedMinor === undefined ? undefined : item.countedMinor / 100,
    variance: item.countedMinor === undefined ? undefined : (item.countedMinor - item.expectedMinor) / 100,
    status: item.status, note: item.countNote, openingDifference: item.openingDifferenceMinor / 100,
    openingSource: item.counterpartName ?? undefined, openingSourceId: item.counterpart ?? undefined,
    openingNote: item.openingNote, preview: true,
  })) : [];
  const previewLastCount: CashCount | null =
    previewCanView && previewLast?.countedMinor !== undefined ? {
      counted: previewLast.countedMinor / 100,
      expected: previewLast.expectedMinor / 100,
      note: previewLast.countNote ?? '',
      savedAt: previewLast.countSavedAt ?? '',
      closed: previewLast.status === 'Closed',
    } : null;

  const identity = integrationMode === 'connected' && auth.status === 'authenticated'
    ? `${auth.tenantId}:${auth.userId}:${auth.epoch}` : null;
  const accessToken = integrationMode === 'connected' && auth.status === 'authenticated'
    ? auth.accessToken : null;
  const activeIdentity = useRef<string | null>(identity);
  activeIdentity.current = identity;
  const [server, setServer] = useState<ServerSnapshot | null>(null);
  const current = server?.identity === identity && identity !== null ? server : null;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deviceCount, setDeviceCount] = useState<CashCount | null>(null);
  const mutationBusy = useRef(false);
  const mutationAbort = useRef<AbortController | null>(null);
  const pendingOperation = useRef<PendingOperation | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal): Promise<void> => {
    if (!identity || !accessToken) throw new Error('Sign in to read real cash sessions');
    setLoading(true);
    try {
      const day = await fetchCashDay(accessToken, signal);
      const [history, accounts] = await Promise.all([
        fetchCashHistory(accessToken, signal),
        fetchCashAccounts(accessToken, signal),
      ]);
      if (activeIdentity.current !== identity || signal?.aborted) return;
      setServer({ identity, day, history: history.rows, accounts });
      setError(null);
    } catch (caught) {
      if (activeIdentity.current === identity && !signal?.aborted) {
        setError(message(caught));
      }
      throw caught;
    } finally {
      if (activeIdentity.current === identity) setLoading(false);
    }
  }, [identity, accessToken]);

  useEffect(() => {
    setServer(null);
    setError(null);
    setDeviceCount(null);
    mutationAbort.current?.abort();
    mutationAbort.current = null;
    pendingOperation.current = null;
    mutationBusy.current = false;
    setBusy(false);
    if (!identity) {
      setLoading(false);
      return;
    }
    const abort = new AbortController();
    void refresh(abort.signal).catch(() => undefined);
    return () => abort.abort();
  }, [identity, refresh]);

  const mode: CashMode = integrationMode === 'preview' ? 'preview'
    : !identity ? 'locked'
      : current ? 'connected' : error ? 'error' : 'loading';
  const day = current?.day ?? null;
  const active = day?.blockedSession ?? day?.todaySession ?? null;
  const enabled = integrationMode === 'preview' ? previewEnabled : Boolean(day?.enabled);
  const allowed = integrationMode === 'connected' && auth.status === 'authenticated'
    ? auth.permissions : previewPermissions;
  const canView = mode === 'preview' ? previewCanView
    : mode === 'connected' && allowed.includes('cash.daily.view');
  const canStart = canView && enabled && allowed.includes('cash.session.start');
  const canClose = canView && enabled && allowed.includes('cash.session.close');
  const sessionOpen = mode === 'preview' ? Boolean(previewActive)
    : enabled && active?.status === 'OPEN';
  const businessDate = mode === 'preview' ? businessToday()
    : day?.businessDate ?? (auth.status === 'authenticated' ? '' : '');
  const sessionDate = mode === 'preview' ? previewActive?.businessDate ?? null
    : active?.status === 'OPEN' ? active.businessDate : null;
  const previousClosing = mode === 'preview'
    ? previewClosing === null ? null : previewClosing / 100
    : day?.previousClosingMinor === undefined || day.previousClosingMinor === null
      ? null : day.previousClosingMinor / 100;
  const drawerBalance = mode === 'preview'
    ? (previewClosing ?? 0) / 100 : (day?.drawerBalanceMinor ?? 0) / 100;
  const openingCash = mode === 'preview'
    ? (previewActive?.openingMinor ?? 0) / 100
    : (active?.openingAmountMinor ?? 0) / 100;
  const expectedCash = mode === 'preview'
    ? (previewActive?.expectedMinor ?? 0) / 100
    : (active?.expectedClosingMinor ?? 0) / 100;
  const history = mode === 'preview' ? previewHistory
    : canView ? (current?.history ?? []).map(toHistoryRecord) : [];
  const startBlocked = mode === 'preview'
    ? Boolean(previewLast && previewLast.businessDate === businessDate && previewLast.status === 'Closed')
    : Boolean(day?.blockedByDate || day?.todaySession);

  const authority = (): CashAuthority => {
    const owner = currentAuthority();
    return {
      tenantId: owner.state.tenantId, actorId: owner.actorId,
      enabled: owner.state.sections.money.cashSession,
      permissions: effectivePermissions(owner.state.sections.team, owner.actorId),
    };
  };

  const runMutation = async (
    fingerprint: string,
    send: (operationId: string, token: string, signal: AbortSignal) => Promise<CashDaySession>,
  ): Promise<void> => {
    if (!identity || !accessToken || mode !== 'connected') {
      throw new Error('Verified cash-session access is required');
    }
    if (mutationBusy.current) throw new Error('A cash operation is already in progress');
    if (pendingOperation.current && (pendingOperation.current.identity !== identity ||
      pendingOperation.current.fingerprint !== fingerprint)) {
      throw new Error('A previous cash operation has an unknown outcome. Confirm its result before changing the cash intent.');
    }
    const operationId = pendingOperation.current?.id ?? generateOperationId();
    pendingOperation.current = { identity, fingerprint, id: operationId };
    const controller = new AbortController();
    mutationAbort.current = controller;
    mutationBusy.current = true;
    setBusy(true);
    setError(null);
    try {
      const posted = await send(operationId, accessToken, controller.signal);
      if (activeIdentity.current !== identity || controller.signal.aborted) {
        throw new Error('The authenticated cash session changed during the operation');
      }
      // Server acknowledged the mutation. Discard operation ID only after this.
      pendingOperation.current = null;
      setDeviceCount(null);
      setServer(before => before?.identity === identity ? {
        ...before,
        day: {
          ...before.day,
          todaySession: posted.businessDate === before.day.businessDate
            ? posted : before.day.todaySession,
          blockedSession: posted.businessDate !== before.day.businessDate && posted.status === 'OPEN'
            ? posted : null,
          blockedByDate: posted.businessDate !== before.day.businessDate && posted.status === 'OPEN'
            ? posted.businessDate : null,
        },
      } : before);
      try {
        await refresh();
      } catch {
        if (activeIdentity.current === identity) {
          setError('Cash operation was confirmed, but refreshing its history failed. Use Retry.');
        }
      }
    } catch (caught) {
      // Explicit client errors mean the server refused this intent; uncertain
      // network/server outcomes MUST retain the same idempotency identity.
      if (caught instanceof ApiError && caught.kind === 'http' &&
        [400, 401, 403, 404, 409, 422].includes(caught.status ?? 0) &&
        activeIdentity.current === identity) pendingOperation.current = null;
      if (activeIdentity.current === identity) setError(message(caught));
      throw caught;
    } finally {
      mutationBusy.current = false;
      mutationAbort.current = null;
      if (activeIdentity.current === identity) setBusy(false);
    }
  };

  const startSession: CashSessionContextValue['startSession'] =
    (amount, counterpart, note, revision, operationId) => {
      if (mode === 'preview') {
        store.start(authority(), {
          amount, counterpart, note, revision, operationId, businessDate,
          accounts: getFinancePreviewSnapshot().accounts.map(item => ({
            id: item.id, name: item.name, active: item.status === 'Active',
            drawer: item.id === 'acc-cash',
          })),
        });
        render(value => value + 1);
        return;
      }
      if (!day || !canStart || !businessDate || revision !== (active?.version ?? 0)) {
        throw new Error('Cash day is unavailable or changed. Review and retry.');
      }
      const amountMinor = cashToMinor(amount);
      if (amountMinor !== day.drawerBalanceMinor && !counterpart) {
        throw new Error('Select the source/destination of the cash difference.');
      }
      const input = {
        businessDate: day.businessDate, openingAmountMinor: amountMinor,
        counterpartAccountCode: amountMinor === day.drawerBalanceMinor ? null : counterpart,
        note: note.trim() || null,
      };
      return runMutation(`start:${JSON.stringify(input)}`,
        (id, token, signal) => startCashDay(token, { ...input, operationId: id }, signal));
    };

  const saveCount: CashSessionContextValue['saveCount'] =
    (counted, note, close, revision, operationId) => {
      if (mode === 'preview') {
        store.count(authority(), {
          counted: String(counted), note, close, revision, operationId,
        });
        render(value => value + 1);
        return;
      }
      if (!day || !active || !sessionOpen || revision !== active.version || !canClose) {
        throw new Error('Open cash session changed or permission was revoked.');
      }
      const countedClosingMinor = cashToMinor(String(counted));
      if (!close) {
        setDeviceCount({
          counted, expected: expectedCash, note: note.trim(),
          savedAt: new Date().toISOString(), closed: false,
        });
        return;
      }
      if (countedClosingMinor !== active.expectedClosingMinor && !note.trim()) {
        throw new Error('Explain the shortage or surplus before closing.');
      }
      const input = { countedClosingMinor, reason: note.trim() || null };
      return runMutation(`close:${active.id}:${JSON.stringify(input)}`,
        (id, token, signal) => closeCashDay(token, active.id, { ...input, operationId: id }, signal));
    };

  const reopenSession = async (reason: string): Promise<void> => {
    if (!day || !day.canReopenToday || !day.todaySession || mode !== 'connected') {
      throw new Error('This business day cannot be reopened.');
    }
    if (!reason.trim()) throw new Error('A reopen reason is required');
    const id = day.todaySession.id;
    const input = { reason: reason.trim() };
    return runMutation(`reopen:${id}:${JSON.stringify(input)}`,
      (operationId, token, signal) =>
        reopenCashDay(token, id, { ...input, operationId }, signal));
  };

  return (
    <CashSessionContext.Provider value={{
      open, setOpen, sessionOpen, openingCash, expectedCash,
      sampleMovements: false, startSession, saveCount,
      lastCount: mode === 'preview' ? previewLastCount : deviceCount,
      revision: mode === 'preview' ? preview.revision : active?.version ?? 0,
      businessDate, sessionDate, previousClosing, drawerBalance,
      history, canView, canStart, canClose, enabled, startBlocked,
      mode, busy: busy || loading, error,
      dayStatus: day, accounts: current?.accounts ?? [],
      reopenSession, refresh: async () => refresh(),
    }}>
      {children}
    </CashSessionContext.Provider>
  );
}

export function useCashSession(): CashSessionContextValue {
  const value = useContext(CashSessionContext);
  if (!value) throw new Error('useCashSession must be used inside CashSessionProvider');
  return value;
}
