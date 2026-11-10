import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from 'react';
import { useTenantSettings } from '../settings/TenantSettingsProvider';
import {
  cashOperationId, cashToMinor, closeCashDay, fetchCashAccounts, fetchCashDay,
  fetchCashHistory, hasCashSessionCredentials, reopenCashDay, startCashDay,
  type CashDaySession, type CashDayStatus, type DailyCashRow, type MoneyAccount,
} from '../services/cashSessionApi';

type CashCount = { counted: number; expected: number; note: string; savedAt: string; closed: boolean };
type CashMode = 'preview' | 'loading' | 'connected' | 'error';
type CashSessionContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  sessionOpen: boolean;
  enabled: boolean;
  openingCash: number;
  expectedCash: number;
  sampleMovements: boolean;
  mode: CashMode;
  busy: boolean;
  error: string | null;
  dayStatus: CashDayStatus | null;
  activeSession: CashDaySession | null;
  history: DailyCashRow[];
  accounts: MoneyAccount[];
  startSession: (opening: number, counterpart?: string | null, note?: string) => Promise<void>;
  saveCount: (counted: number, note: string, close: boolean) => Promise<void>;
  reopenSession: (reason: string) => Promise<void>;
  refresh: () => Promise<void>;
  lastCount: CashCount | null;
};

const CashSessionContext = createContext<CashSessionContextValue | null>(null);
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Cash service request failed.';

/**
 * The existing UI preview remains available without real authentication.
 * A token enters connected mode only after the server validates it by fetching
 * the authoritative day status. Never fall back to simulated posting on API
 * failure or reuse the preview's sample amounts as real ledger figures.
 */
export function CashSessionProvider({ children }: { children: ReactNode }) {
  const { state } = useTenantSettings();
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewOpening, setPreviewOpening] = useState(5000);
  const [previewMovements, setPreviewMovements] = useState(true);
  const [lastCount, setLastCount] = useState<CashCount | null>(null);
  const [mode, setMode] = useState<CashMode>(() => hasCashSessionCredentials() ? 'loading' : 'preview');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const pendingOperation = useRef<{ fingerprint: string; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dayStatus, setDayStatus] = useState<CashDayStatus | null>(null);
  const [history, setHistory] = useState<DailyCashRow[]>([]);
  const [accounts, setAccounts] = useState<MoneyAccount[]>([]);

  const refresh = useCallback(async () => {
    if (!hasCashSessionCredentials()) {
      setMode('preview');
      setDayStatus(null);
      setHistory([]);
      setAccounts([]);
      setError(null);
      return;
    }
    try {
      const status = await fetchCashDay();
      setDayStatus(status);
      setMode('connected');
      setError(null);
      const [historyResult, accountsResult] = await Promise.allSettled([
        fetchCashHistory(), fetchCashAccounts(),
      ]);
      if (historyResult.status === 'fulfilled') setHistory(historyResult.value.rows);
      else setError(`Could not refresh cash history: ${errorMessage(historyResult.reason)}`);
      if (accountsResult.status === 'fulfilled') setAccounts(accountsResult.value);
      else setAccounts([]); // Owner funding remains available even without account-list access.
    } catch (caught) {
      setMode('error');
      setDayStatus(null);
      setError(errorMessage(caught));
      throw caught;
    }
  }, []);

  useEffect(() => {
    void refresh().catch(() => {/* The UI shows the server error and Retry control. */});
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'shererp_auth_token') void refresh().catch(caught => setError(errorMessage(caught)));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const activeSession = mode === 'connected'
    ? dayStatus?.blockedSession ?? dayStatus?.todaySession ?? null
    : null;
  const enabled = mode === 'connected' ? Boolean(dayStatus?.enabled)
    : mode === 'preview' ? state.sections.money.cashSession : false;
  const sessionOpen = mode === 'preview' ? previewOpen
    : enabled && activeSession?.status === 'OPEN';
  const openingCash = mode === 'preview' ? previewOpening
    : (activeSession?.openingAmountMinor ?? 0) / 100;
  const expectedCash = mode === 'preview'
    ? previewOpening + (previewMovements ? 38610 + 7820 - 3180 : 0)
    : (activeSession?.expectedClosingMinor ?? 0) / 100;
  const sampleMovements = mode === 'preview' && previewMovements;

  const operationIdFor = (fingerprint: string) => {
    if (pendingOperation.current?.fingerprint !== fingerprint) {
      pendingOperation.current = { fingerprint, id: cashOperationId() };
    }
    return pendingOperation.current.id;
  };
  const runMutation = async (fingerprint: string, operation: (id: string) => Promise<CashDaySession>) => {
    if (busyRef.current) throw new Error('A cash operation is already running.');
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await operation(operationIdFor(fingerprint));
      pendingOperation.current = null;
      setLastCount(null);
      // Confirm the posted session immediately, even if a subsequent status GET fails.
      setDayStatus(previous => previous === null ? previous : {
        ...previous,
        todaySession: result.businessDate === previous.businessDate ? result : previous.todaySession,
        blockedSession: result.businessDate !== previous.businessDate && result.status === 'OPEN'
          ? result : null,
        blockedByDate: result.businessDate !== previous.businessDate && result.status === 'OPEN'
          ? result.businessDate : null,
      });
      try {
        await refresh();
      } catch {
        setError('Cash operation succeeded, but refreshing the day failed. Retry to load server status.');
      }
    } catch (caught) {
      setError(errorMessage(caught));
      throw caught;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const startSession = async (opening: number, counterpart: string | null = null, note = '') => {
    if (mode === 'preview') {
      if (!Number.isFinite(opening) || opening < 0) throw new Error('Invalid opening amount.');
      setPreviewOpening(opening);
      setPreviewMovements(false);
      setPreviewOpen(true);
      setLastCount(null);
      return;
    }
    if (mode !== 'connected' || !dayStatus?.enabled) throw new Error('Cash sessions are not available for this business.');
    const amountMinor = cashToMinor(opening);
    if (amountMinor !== dayStatus.drawerBalanceMinor && !counterpart) {
      throw new Error('Select the source or destination of the opening-cash difference.');
    }
    const input = {
      businessDate: dayStatus.businessDate,
      openingAmountMinor: amountMinor,
      counterpartAccountCode: amountMinor === dayStatus.drawerBalanceMinor ? null : counterpart,
      note: note.trim() || null,
    };
    await runMutation(`start:${JSON.stringify(input)}`,
      operationId => startCashDay({ ...input, operationId }));
  };

  const saveCount = async (counted: number, note: string, close: boolean) => {
    if (!Number.isFinite(counted) || counted < 0 || !sessionOpen) throw new Error('No open cash session.');
    if (!close || mode === 'preview') {
      if (close && counted !== expectedCash && !note.trim()) throw new Error('Explain the difference before closing.');
      setLastCount({ counted, expected: expectedCash, note: note.trim(), savedAt: new Date().toISOString(), closed: close });
      if (close) setPreviewOpen(false);
      return;
    }
    if (mode !== 'connected' || !activeSession) throw new Error('No confirmed cash day.');
    const countedClosingMinor = cashToMinor(counted);
    if (countedClosingMinor !== activeSession.expectedClosingMinor && !note.trim()) {
      throw new Error('Explain the cash shortage or surplus before closing.');
    }
    const input = { countedClosingMinor, reason: note.trim() || null };
    await runMutation(`close:${activeSession.id}:${JSON.stringify(input)}`,
      operationId => closeCashDay(activeSession.id, { ...input, operationId }));
  };

  const reopenSession = async (reason: string) => {
    if (mode !== 'connected' || !dayStatus?.todaySession || !dayStatus.canReopenToday) {
      throw new Error('This day cannot be reopened by this account.');
    }
    if (!reason.trim()) throw new Error('Explain why the day should be reopened.');
    const sessionId = dayStatus.todaySession.id;
    const input = { reason: reason.trim() };
    await runMutation(`reopen:${sessionId}:${JSON.stringify(input)}`,
      operationId => reopenCashDay(sessionId, { ...input, operationId }));
  };

  return (
    <CashSessionContext.Provider value={{
      open, setOpen, sessionOpen, enabled, openingCash, expectedCash,
      sampleMovements, mode, busy, error, dayStatus, activeSession, history,
      accounts, startSession, saveCount, reopenSession, refresh, lastCount,
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
