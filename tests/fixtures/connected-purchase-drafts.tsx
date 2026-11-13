import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider } from '../../src/settings/TenantSettingsProvider.tsx';
import { ConnectedPurchaseDraftsPanel } from '../../src/components/purchases/ConnectedPurchaseDraftsPanel.tsx';
import '../../src/index.css';

/**
 * Test-only mount, never imported by the app's index.html/App router or built
 * Worker assets. Uses the real SessionStore and connected providers; authentication
 * and source reads are intercepted by the browser fixture's fake Nest server.
 * The production ConnectedWorkspaceGate remains unchanged and closed.
 */
function ConnectedDraftFixture() {
  const { snapshot, store } = useSession();
  const [error, setError] = useState('');
  const authenticate = (identifier: string) => {
    setError('');
    void store.loginWithPassword(identifier, 'test-password').catch(reason => {
      setError(reason instanceof Error ? reason.message : String(reason));
    });
  };
  return (
    <TenantSettingsProvider>
      <main className="mx-auto min-h-screen w-full max-w-3xl space-y-3 bg-background p-3 text-ink">
        <header className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
          <button type="button" onClick={() => authenticate('owner-a')}
            data-test-login-a="" className="rounded-md border border-border px-2 py-2 text-sm">
            Sign in A
          </button>
          <button type="button" onClick={() => authenticate('owner-b')}
            data-test-login-b="" className="rounded-md border border-border px-2 py-2 text-sm">
            Sign in B
          </button>
          <button type="button" onClick={() => authenticate('restricted')}
            data-test-login-restricted="" className="rounded-md border border-border px-2 py-2 text-sm">
            Sign in restricted
          </button>
          <button type="button" onClick={() => void store.logout()}
            data-test-logout="" className="rounded-md border border-border px-2 py-2 text-sm">
            Sign out
          </button>
        </header>
        <p className="text-xs" data-test-session-status="">
          {snapshot.status === 'authenticated'
            ? 'Verified: ' + snapshot.businessName
            : 'Session: ' + snapshot.status}
        </p>
        {error && <p role="alert" data-test-login-error="">{error}</p>}
        <ConnectedPurchaseDraftsPanel />
      </main>
    </TenantSettingsProvider>
  );
}

const root = document.getElementById('root');
if (!root) throw Error('Connected draft fixture root is required');
createRoot(root).render(
  <SessionProvider mode="connected">
    <ConnectedDraftFixture />
  </SessionProvider>,
);
