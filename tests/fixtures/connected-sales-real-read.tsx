import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider } from '../../src/settings/TenantSettingsProvider.tsx';
import { ConnectedSalesReadWorkspace } from '../../src/components/sales/ConnectedSalesReadWorkspace.tsx';
import '../../src/index.css';

/**
 * R09-SALES-REAL-READ-12 — TEST ENTRY ONLY; not a connected production route.
 *
 * Browser runner stubs ONLY auth/login with pre-signed disposable-tenant JWTs.
 * The SessionStore's GET /me plus all Sales and return GETs go to REAL Nest/PG.
 * No product creation, sale, return, cash, inventory, journal or refund POST.
 * Never import this fixture into src/App.tsx or ConnectedWorkspaceGate.
 */
function RealNestSalesReadFixture() {
  const { snapshot, store } = useSession();
  const [result, setResult] = useState('ready');

  const select = (who: 'a' | 'b') => {
    setResult('loading:' + who);
    void store.loginWithPassword('r09-real-read-' + who, 'test-only-password')
      .then(() => setResult('success:' + who))
      .catch(() => setResult('failed:' + who));
  };

  return (
    <main className="mx-auto max-w-[1440px] space-y-4 p-3">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold">Disposable Nest/PG Sales GET-only acceptance</h1>
        <button type="button" data-real-login-a="" onClick={() => select('a')}>
          Sign in disposable tenant A
        </button>
        <button type="button" data-real-login-b="" onClick={() => select('b')}>
          Sign in disposable tenant B
        </button>
      </header>
      <output data-real-login-result="" aria-live="polite">{result}</output>
      <p data-real-session="">
        {snapshot.status === 'authenticated'
          ? 'Verified:' + snapshot.businessName
          : 'Session:' + snapshot.status}
      </p>
      <ConnectedSalesReadWorkspace />
      <p data-real-read-boundary="" className="text-xs text-ink-500">
        TEST ONLY: genuine signed-token Nest/PostgreSQL reads;
        bootstrapped disposable auth fixture; financial/stock writes prohibited.
      </p>
    </main>
  );
}
export { RealNestSalesReadFixture };

const root = document.getElementById('root');
if (!root) throw Error('Isolated Sales real-read fixture root missing');
createRoot(root).render(
  <SessionProvider mode="connected">
    <TenantSettingsProvider>
      <RealNestSalesReadFixture />
    </TenantSettingsProvider>
  </SessionProvider>,
);
