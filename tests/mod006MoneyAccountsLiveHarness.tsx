/** MOD-006 P2-C QA ONLY: actual live Nest/PG via Vite same-origin proxy.
 * Deliberately not connected to App.tsx, AppShell or ConnectedWorkspaceGate.
 * This component must never be included in a production route.
 */
import '../src/index.css';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { SessionProvider, useSession } from '../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider, useTenantSettings } from '../src/settings/TenantSettingsProvider.tsx';
import { Finance } from '../src/pages/Finance.tsx';

function LiveControls() {
  const { snapshot, store } = useSession();
  const { personal, updatePersonal } = useTenantSettings();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  function run(work: () => Promise<void>): void {
    void work().then(() => setResult('confirmed'), error => setResult('failed: ' + String(error)));
  }
  return (
    <>
      <section id="p2c-fixture-controls" aria-label="Test-only live authentication">
        <label htmlFor="p2c-identifier">Test login identifier</label>
        <input id="p2c-identifier" value={identifier} onChange={e => setIdentifier(e.target.value)} />
        <label htmlFor="p2c-password">Test password</label>
        <input id="p2c-password" type="password" value={password}
          onChange={e => setPassword(e.target.value)} />
        <button type="button" id="p2c-login" onClick={() =>
          run(() => store.loginWithPassword(identifier, password))}>Login</button>
        <button type="button" id="p2c-refresh" onClick={() =>
          run(() => store.refresh())}>Refresh bearer</button>
        <button type="button" id="p2c-logout" onClick={() =>
          run(() => store.logout())}>Logout</button>
        <button type="button" id="p2c-language" onClick={() =>
          updatePersonal({ language: personal.language === 'Bangla' ? 'English' : 'Bangla' })}>
          Change language
        </button>
        <p id="p2c-auth" data-status={snapshot.status}
          data-tenant={snapshot.status === 'authenticated' ? snapshot.tenantId : ''}
          data-epoch={snapshot.epoch}>{snapshot.status}</p>
        <p id="p2c-result">{result}</p>
      </section>
      <Finance moneyAccountsOnly />
    </>
  );
}
const root = document.getElementById('root');
if (!root) throw new Error('P2-C QA only root missing');
createRoot(root).render(
  <SessionProvider mode="connected">
    <TenantSettingsProvider>
      <HashRouter><LiveControls /></HashRouter>
    </TenantSettingsProvider>
  </SessionProvider>,
);
