/** MOD-006 T02-H1: isolated browser-only signed read-only Counter acceptance.
 * The actual global ConnectedWorkspaceGate remains CLOSED. This fixture cannot
 * create a payment draft, dispatch preview stores or mount a financial writer.
 */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider } from '../src/settings/TenantSettingsProvider.tsx';
import { ConnectedCounterReadWorkspace } from '../src/components/finance/ConnectedCounterReadWorkspace.tsx';

function SignedReadHarness() {
  const { store, snapshot } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const signed = snapshot.status === 'authenticated';
  async function login() {
    setStatus('pending');
    try {
      await store.loginWithPassword(identifier, password);
      setStatus('authenticated');
    } catch (error) {
      setStatus(error instanceof Error ? 'error:' + error.message : 'error');
    }
  }
  async function logout() {
    await store.logout();
    setStatus('signed-out');
  }
  return <main data-h1-isolated-browser-only="">
    <div className="sr-only">Isolated signed Counter read acceptance test only</div>
    <label htmlFor="h1-identifier">Disposable identifier</label>
    <input id="h1-identifier" value={identifier} onChange={e => setIdentifier(e.target.value)}/>
    <label htmlFor="h1-password">Disposable password</label>
    <input id="h1-password" type="password" value={password}
      onChange={e => setPassword(e.target.value)}/>
    <button type="button" id="h1-login" onClick={() => void login()}>Sign in</button>
    <button type="button" id="h1-logout" disabled={!signed}
      onClick={() => void logout()}>Sign out</button>
    <output id="h1-session" data-status={snapshot.status}
      data-tenant={signed ? snapshot.tenantId : ''} data-result={status}>
      {snapshot.status}
    </output>
    <ConnectedCounterReadWorkspace />
  </main>;
}
const root = document.getElementById('root');
if (!root) throw Error('Missing isolated read-only test root');
createRoot(root).render(
  <SessionProvider mode="connected">
    <TenantSettingsProvider><SignedReadHarness /></TenantSettingsProvider>
  </SessionProvider>,
);
