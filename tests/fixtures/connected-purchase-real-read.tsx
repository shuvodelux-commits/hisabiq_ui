import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider, useSession } from '../../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider } from '../../src/settings/TenantSettingsProvider.tsx';
import { Purchases } from '../../src/pages/Purchases.tsx';
import '../../src/index.css';

/**
 * R09-PURCHASE-REAL-READ — test-only entry, not a production route.
 * Only the synthetic test-login POST is intercepted. GET /me, purchase sources,
 * supplier returnability and history must come from signed, isolated Nest/PG16.
 * No purchase, refund, credit, stock or ledger posting may occur here.
 */
function PurchaseReadFixture() {
  const { snapshot, store } = useSession();
  const [result, setResult] = useState('ready');

  function select(who: 'a' | 'b') {
    setResult('loading:' + who);
    void store.loginWithPassword('r09-purchase-' + who, 'test-only-password')
      .then(() => setResult('success:' + who))
      .catch(() => setResult('failed:' + who));
  }

  return (
    <main className="mx-auto max-w-[1440px] space-y-4 p-3">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-base font-semibold">Disposable purchase-return GET browser QA</h1>
        <button type="button" data-purchase-real-login-a="" onClick={() => select('a')}>
          Sign in disposable purchase tenant A
        </button>
        <button type="button" data-purchase-real-login-b="" onClick={() => select('b')}>
          Sign in disposable purchase tenant B
        </button>
      </header>
      <output data-purchase-real-login-result="" aria-live="polite">{result}</output>
      <p data-purchase-real-session="">
        {snapshot.status === 'authenticated'
          ? 'Verified:' + snapshot.businessName
          : 'Session:' + snapshot.status}
      </p>
      <Purchases />
      <p className="text-xs text-ink-500">
        TEST ONLY: signed Nest/PostgreSQL GET reads, zero business writes.
      </p>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Isolated purchase-read fixture root missing');
createRoot(root).render(
  <MemoryRouter initialEntries={['/purchases']}>
    <SessionProvider mode="connected">
      <TenantSettingsProvider>
        <PurchaseReadFixture />
      </TenantSettingsProvider>
    </SessionProvider>
  </MemoryRouter>,
);
