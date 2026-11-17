/**
 * Disposable MOD-005 lifecycle QA only. This never enters App.tsx.
 * All requests use real verified SessionProvider/CashSessionProvider and Nest.
 */
import '../src/index.css';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider } from '../src/settings/TenantSettingsProvider.tsx';
import { CashSessionProvider, useCashSession } from '../src/contexts/CashSessionContext.tsx';

function ManualCashQA() {
  const { store, snapshot } = useSession();
  const cash = useCashSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [opening, setOpening] = useState('');
  const [counted, setCounted] = useState('');
  const [note, setNote] = useState('Disposable test cash count');
  const [outcome, setOutcome] = useState('Ready');
  const [sequence, setSequence] = useState(0);
  const execute = (label: string, action: () => Promise<void>) => {
    const serial = sequence + 1;
    setSequence(serial);
    setOutcome('Working: ' + label);
    void Promise.resolve().then(action)
      .then(() => setOutcome('PASS: ' + label + ' #' + serial))
      .catch((error: unknown) => setOutcome('FAIL: ' + label + ' — ' +
        (error instanceof Error ? error.message : String(error))));
  };
  const asCash = (value: string, fallback: number): number => {
    if (!value.trim()) return fallback;
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 ||
        Math.abs(Math.round(number * 100) - number * 100) > 1e-7) {
      throw new Error('Enter a valid nonnegative amount with at most two decimal places');
    }
    return number;
  };
  const authenticated = snapshot.status === 'authenticated';
  const session = cash.dayStatus?.todaySession;
  return <main style={{ maxWidth: 740, margin: '20px auto', padding: 20, fontFamily: 'sans-serif' }}>
    <h1>HisabIQ Cash Session — Disposable QA</h1>
    <p><strong>Test database only.</strong> This is not the production ERP. Financial changes here are allowed solely on a fresh disposable test tenant.</p>
    <section>
      <h2>1. Sign in</h2>
      <label>Test identifier <input id="identifier" autoComplete="username" value={identifier}
        onChange={e => setIdentifier(e.target.value)} /></label>
      <label>Test password <input id="password" type="password" autoComplete="current-password"
        value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button id="login" onClick={() => execute('Sign in', () => store.loginWithPassword(identifier, password))}>Sign in</button>
      <button id="refresh" onClick={() => execute('Refresh token', () => store.refresh())}>Refresh token</button>
      <button id="logout" onClick={() => execute('Log out', () => store.logout())}>Log out</button>
      <p id="auth" data-status={snapshot.status} data-tenant={authenticated ? snapshot.tenantId : ''}>
        Identity: {snapshot.status}{authenticated ? ' / ' + snapshot.tenantId : ''}
      </p>
    </section>
    <section>
      <h2>2. Server-backed cash state</h2>
      <button id="read-day" onClick={() => execute('Read day', () => cash.refresh())}>Refresh cash day</button>
      <p id="cash" data-mode={cash.mode} data-open={String(cash.sessionOpen)}
        data-date={cash.businessDate} data-today={session?.id ?? ''}
        data-can-start={String(cash.canStart)} data-can-close={String(cash.canClose)}
        data-reopen={String(cash.dayStatus?.canReopenToday ?? false)}
        data-enabled={String(cash.enabled)}>
        Mode: {cash.mode} | Enabled: {String(cash.enabled)} | Date: {cash.businessDate || '—'}
      </p>
      <p>Drawer balance: BDT {cash.drawerBalance.toFixed(2)} |
        Expected counted: BDT {cash.expectedCash.toFixed(2)}</p>
      <p>Session: {session ? session.status + ' / ' + session.id : 'No session'} |
        Version: {cash.revision}</p>
      <p>Start allowed: {String(cash.canStart)} | Close allowed: {String(cash.canClose)} |
        Reopen allowed: {String(cash.dayStatus?.canReopenToday ?? false)}</p>
      {cash.error ? <p role="alert" id="cash-error">{cash.error}</p> : null}
    </section>
    <section>
      <h2>3. Test cash lifecycle</h2>
      <label>Opening cash (BDT)
        <input id="opening" type="number" min="0" step="0.01" placeholder={String(cash.drawerBalance)}
          value={opening} onChange={e => setOpening(e.target.value)} />
      </label>
      <button id="start" disabled={!authenticated || !cash.canStart || cash.busy}
        onClick={() => execute('Start cash day', async () =>
          cash.startSession(String(asCash(opening, cash.drawerBalance)), '', 'Disposable QA', cash.revision, ''))}>
        Start cash day
      </button>
      <label>Counted cash (BDT)
        <input id="counted" type="number" min="0" step="0.01" placeholder={String(cash.expectedCash)}
          value={counted} onChange={e => setCounted(e.target.value)} />
      </label>
      <label>Reason / note
        <input id="note" value={note} onChange={e => setNote(e.target.value)} />
      </label>
      <button id="close" disabled={!authenticated || !cash.canClose || cash.busy}
        onClick={() => execute('Count and close cash day', async () =>
          cash.saveCount(asCash(counted, cash.expectedCash), note, true, cash.revision, ''))}>
        Count and close cash day
      </button>
      <button id="reopen" disabled={!authenticated || !cash.dayStatus?.canReopenToday || cash.busy}
        onClick={() => execute('Reopen cash day', () => cash.reopenSession(note))}>
        Reopen cash day
      </button>
      <p id="outcome" role="status">{outcome}</p>
    </section>
  </main>;
}
const element = document.getElementById('root');
if (!element) throw new Error('Lifecycle QA root not found');
createRoot(element).render(<SessionProvider mode="connected">
  <TenantSettingsProvider>
    <CashSessionProvider><ManualCashQA /></CashSessionProvider>
  </TenantSettingsProvider>
</SessionProvider>);
