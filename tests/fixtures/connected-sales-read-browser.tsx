import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider } from '../../src/settings/TenantSettingsProvider.tsx';
import { ConnectedSalesReadWorkspace } from '../../src/components/sales/ConnectedSalesReadWorkspace.tsx';
import '../../src/index.css';

/**
 * MOD-009 R09-SALES-BROWSER-QA-11. This source is referenced only by a
 * non-production test fixture HTML. It does not mount into App.tsx or bypass
 * ConnectedWorkspaceGate; every API response is intercepted by Playwright.
 */
function MockOnlySalesBrowserFixture() {
  const { snapshot, store } = useSession();
  const [result, setResult] = useState('ready');
  const login = (who: 'a' | 'b' | 'd') => {
    setResult('loading:' + who);
    void store.loginWithPassword('r09-qa-' + who, 'test-only-password')
      .then(() => setResult('success:' + who))
      .catch(() => setResult('failed:' + who));
  };

  return (
    <main className="mx-auto max-w-[1440px] space-y-4 p-3">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">Mock-only Sales GET browser QA</h1>
        <button type="button" data-qa-login-a="" onClick={() => login('a')}>Sign in tenant A</button>
        <button type="button" data-qa-login-b="" onClick={() => login('b')}>Sign in tenant B</button>
        <button type="button" data-qa-login-d="" onClick={() => login('d')}>Sign in history-only role D</button>
      </header>
      <output data-qa-login-result="" aria-live="polite">{result}</output>
      <p data-qa-session="">
        {snapshot.status === 'authenticated'
          ? 'Verified:' + snapshot.businessName
          : 'Session:' + snapshot.status}
      </p>
      <ConnectedSalesReadWorkspace />
      <p data-qa-no-posting="" className="text-xs text-ink-500">
        Test fixture: stubbed authenticated GET responses only. Not a real PostgreSQL/Nest test.
      </p>
    </main>
  );
}
const root = document.getElementById('root');
if (!root) throw Error('Isolated Sales browser fixture root missing');
createRoot(root).render(
  <SessionProvider mode="connected">
    <TenantSettingsProvider>
      <MockOnlySalesBrowserFixture />
    </TenantSettingsProvider>
  </SessionProvider>,
);
