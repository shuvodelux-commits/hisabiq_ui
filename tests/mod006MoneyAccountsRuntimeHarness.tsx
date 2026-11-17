/** MOD-006 P2-B browser harness. No production router or connected gate is changed.
 * Uses real SessionStore, TenantSettingsProvider, and the named Finance export.
 * All HTTP is mocked by the Playwright caller; no real database is contacted.
 */
import '../src/index.css';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { SessionProvider, useSession } from '../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider, useTenantSettings } from '../src/settings/TenantSettingsProvider.tsx';
import { Finance } from '../src/pages/Finance.tsx';

function TestControls() {
  const { snapshot, store } = useSession();
  const { personal, updatePersonal } = useTenantSettings();
  const [result, setResult] = useState('');
  const act = (task: () => Promise<void>) =>
    void task().then(() => setResult('confirmed'), error => setResult('failed: ' + String(error)));
  return (
    <div>
      <nav aria-label="Test-only session controls" id="test-controls">
        <button type="button" id="login-a" onClick={() => act(() => store.loginWithPassword('tenant-a', 'pw'))}>Login A</button>
        <button type="button" id="login-b" onClick={() => act(() => store.loginWithPassword('tenant-b', 'pw'))}>Login B</button>
        <button type="button" id="refresh-token" onClick={() => act(() => store.refresh())}>Refresh token</button>
        <button type="button" id="lock-session" onClick={() => store.lock()}>Lock session</button>
        <button type="button" id="logout" onClick={() => act(() => store.logout())}>Logout</button>
        <button type="button" id="language" onClick={() =>
          updatePersonal({ language: personal.language === 'Bangla' ? 'English' : 'Bangla' })
        }>Toggle language</button>
      </nav>
      <p id="verified-session" data-status={snapshot.status}
        data-tenant={snapshot.status === 'authenticated' ? snapshot.tenantId : ''}
        data-epoch={snapshot.epoch}>{snapshot.status}</p>
      <p id="language-state">{personal.language}</p>
      <p id="test-operation-result">{result}</p>
      <Finance moneyAccountsOnly />
    </div>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing runtime harness element');
createRoot(root).render(
  // Do not simulate StrictMode remount of a disposable real SessionStore.
  <SessionProvider mode="connected">
    <TenantSettingsProvider>
      <HashRouter><TestControls /></HashRouter>
    </TenantSettingsProvider>
  </SessionProvider>,
);
