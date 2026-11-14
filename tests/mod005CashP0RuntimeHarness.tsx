/** MOD-005 P0 disposable mocked-HTTP mounted React harness.
 * The production AppShell/ConnectedWorkspaceGate is NOT imported or changed.
 */
import '../src/index.css';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider } from '../src/settings/TenantSettingsProvider.tsx';
import { CashSessionProvider, useCashSession } from '../src/contexts/CashSessionContext.tsx';

function TestControls() {
  const { snapshot, store } = useSession();
  const cash = useCashSession();
  const [last, setLast] = useState('');
  const [actionSequence, setActionSequence] = useState(0);
  function act(task: () => Promise<void>) {
    setActionSequence(value => value + 1);
    setLast('pending');
    void task().then(() => setLast('confirmed'), err => setLast('failed: ' + String(err)));
  }
  return (
    <main>
      <button id="login-a" onClick={() => act(() => store.loginWithPassword('cash-tenant-a', 'pw'))}>Login A</button>
      <button id="refresh" onClick={() => act(() => store.refresh())}>Refresh token</button>
      <button id="start" onClick={() => act(async () => {
        await cash.startSession('0', '', '', cash.revision, '');
      })}>Start cash day</button>
      <button id="confirm-previous" onClick={() => act(() => cash.confirmPendingOperation())}>Confirm previous</button>
      <button id="close" onClick={() => act(async () => {
        await cash.saveCount(cash.expectedCash, '', true, cash.revision, '');
      })}>Close real cash day</button>
      <button id="logout" onClick={() => act(() => store.logout())}>Logout</button>
      <p id="auth-status" data-status={snapshot.status}
        data-tenant={snapshot.status === 'authenticated' ? snapshot.tenantId : ''}
        data-epoch={snapshot.epoch}>{snapshot.status}</p>
      <p id="cash-state" data-mode={cash.mode}
        data-access={cash.accountsAccess} data-history-access={cash.historyAccess}
        data-can-view={cash.canView ? 'yes':'no'}
        data-enabled={cash.enabled ? 'yes':'no'}
        data-open={cash.sessionOpen ? 'yes':'no'} data-pending={cash.hasPendingOperation ? 'yes':'no'}
        data-busy={cash.busy ? 'yes':'no'}>{cash.mode}</p>
      <p id="result" data-sequence={actionSequence}>{last}</p>
      <p id="cash-error">{cash.error ?? ''}</p>
    </main>
  );
}
const element = document.getElementById('root');
if (!element) throw new Error('Runtime harness needs #root');
createRoot(element).render(
  <SessionProvider mode="connected">
    <TenantSettingsProvider>
      <CashSessionProvider>
        <TestControls />
      </CashSessionProvider>
    </TenantSettingsProvider>
  </SessionProvider>,
);
