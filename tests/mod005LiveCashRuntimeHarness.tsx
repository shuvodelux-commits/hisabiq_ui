/**
 * MOD-005 M5-02A: mounted React wired to real Nest through localhost Vite proxy.
 * TEST ONLY. Never imported by the production router or ConnectedWorkspaceGate.
 * No mocked /api/v1 responses, synthetic authenticated state or browser tokens.
 */
import '../src/index.css';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider } from '../src/settings/TenantSettingsProvider.tsx';
import { CashSessionProvider, useCashSession } from '../src/contexts/CashSessionContext.tsx';

function LiveControls() {
  const { store, snapshot } = useSession();
  const cash = useCashSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [outcome, setOutcome] = useState('idle');
  const [sequence, setSequence] = useState(0);
  function execute(label: string, fn: () => Promise<void>) {
    const next = sequence + 1;
    setSequence(next);
    setOutcome('pending:' + label);
    void fn().then(
      () => setOutcome('confirmed:' + label + ':' + next),
      error => setOutcome('failed:' + label + ':' + (error instanceof Error ? error.message : String(error))),
    );
  }

  return <main style={{ padding: 16, fontFamily: 'sans-serif', maxWidth: 760 }}>
    <h1>MOD-005 disposable real-HTTP cash verification</h1>
    <label>Identifier <input id="identifier" value={identifier}
      onChange={event => setIdentifier(event.target.value)} /></label>
    <label>Password <input id="password" type="password" value={password}
      onChange={event => setPassword(event.target.value)} /></label>
    <button id="login" onClick={() => execute('login', () =>
      store.loginWithPassword(identifier, password))}>Real sign in</button>
    <button id="refresh" onClick={() => execute('refresh', () => store.refresh())}>Rotate token</button>
    <button id="logout" onClick={() => execute('logout', () => store.logout())}>Logout</button>
    <button id="read-day" onClick={() => execute('read', () => cash.refresh())}>Read real cash day</button>
    <button id="start" onClick={() => execute('start', async () => {
      await cash.startSession(String(cash.drawerBalance), '', '', cash.revision, '');
    })}>Start real cash day</button>
    <button id="close" onClick={() => execute('close', async () => {
      await cash.saveCount(cash.expectedCash, '', true, cash.revision, '');
    })}>Close real cash day</button>
    <button id="reopen" onClick={() => execute('reopen', () =>
      cash.reopenSession('Closed by mistake in disposable QA'))}>Reopen real cash day</button>
    <p id="auth" data-status={snapshot.status}
      data-tenant={snapshot.status === 'authenticated' ? snapshot.tenantId : ''}
      data-epoch={snapshot.epoch}>{snapshot.status}</p>
    <p id="cash" data-mode={cash.mode}
      data-can-view={String(cash.canView)}
      data-can-start={String(cash.canStart)}
      data-open={String(cash.sessionOpen)}
      data-enabled={String(cash.enabled)}
      data-revision={String(cash.revision)}
      data-date={cash.businessDate}
      data-today={cash.dayStatus?.todaySession?.id ?? ''}
      data-reopen={String(cash.dayStatus?.canReopenToday ?? false)}
      data-history={String(cash.history.length)}>{cash.mode}</p>
    <p id="outcome" role="status">{outcome}</p>
    <p id="cash-error" role="alert">{cash.error ?? ''}</p>
  </main>;
}

const element = document.getElementById('root');
if (!element) throw new Error('Live QA harness root absent');
createRoot(element).render(
  <SessionProvider mode="connected">
    <TenantSettingsProvider>
      <CashSessionProvider><LiveControls /></CashSessionProvider>
    </TenantSettingsProvider>
  </SessionProvider>,
);
