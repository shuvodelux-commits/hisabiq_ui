/**
 * MOD-003 P2B0 — TEST ONLY, unmounted Vite entrypoint.
 * Real SessionStore -> strict React inventory GET adapters -> Nest/PG16.
 * Do not import from App.tsx or mount preview Products, AppShell or stock writers.
 */
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../src/integration/SessionProvider.tsx';
import { readProducts } from '../src/integration/products.ts';
import {
  readInventoryOverview, readInventoryLots, readInventoryAdjustments,
} from '../src/integration/inventory.ts';
import { projectInventoryPresentation } from '../src/integration/inventory-projection.ts';
import { ConnectedInventoryReadPanel } from '../src/components/products/ConnectedInventoryReadPanel.tsx';
import type { UiLanguage } from '../src/i18n/uiCopy.ts';
import '../src/index.css';

type ReadState =
  | { state: 'unloaded' | 'loading'; data?: never }
  | { state: 'loaded'; data: ReturnType<typeof projectInventoryPresentation> }
  | { state: 'failed'; error: string };

function InventoryProbe() {
  const { snapshot, store } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('idle');
  const [read, setRead] = useState<ReadState>({ state: 'unloaded' });
  const [foreignId, setForeignId] = useState('');
  const [language, setLanguage] = useState<UiLanguage>('English');
  const [foreignResult, setForeignResult] = useState('idle');

  useEffect(() => {
    // Never retain the prior tenant's stock or a prior epoch's cost-bearing data.
    setRead({ state: snapshot.status === 'authenticated' ? 'loading' : 'unloaded' });
    setForeignResult('idle');
    if (snapshot.status !== 'authenticated') return;

    const { tenantId, userId, epoch, accessToken } = snapshot;
    const controller = new AbortController();
    const scope = tenantId + '/' + userId + '/' + String(epoch);
    async function load() {
      try {
        // Each response is read with the same verified credential and request
        // signal. Server remains the identity, valuation and stock authority.
        const [products, inventory, adjustments] = await Promise.all([
          readProducts(accessToken, { limit: 50 }, controller.signal),
          readInventoryOverview(accessToken, {}, controller.signal),
          readInventoryAdjustments(accessToken, {}, controller.signal),
        ]);
        const productId = products.data[0]?.id;
        const lots = productId === undefined
          ? await readInventoryLots(accessToken, { limit: 1 }, controller.signal)
          : await readInventoryLots(accessToken, {
            productId, limit: 1, sort: 'businessDate',
          }, controller.signal);
        const data = projectInventoryPresentation({
          scope,
          products: { scope, value: products },
          inventory: { scope, value: inventory },
          lots: { scope, value: lots },
          adjustments: { scope, value: adjustments },
        });
        if (!controller.signal.aborted) setRead({ state: 'loaded', data });
      } catch (error) {
        if (!controller.signal.aborted) {
          const kind = typeof error === 'object' && error !== null && 'status' in error
            ? 'HTTP_' + String((error as { status?: number }).status)
            : 'protocol_or_network';
          setRead({ state: 'failed', error: kind });
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [snapshot]);

  // Render-time scope guard: useEffect cleanup runs *after* React's commit.
  // Never display a previous tenant/user/epoch's cost-bearing projection even
  // for one frame while a new verified session is becoming active.
  const currentScope = snapshot.status === 'authenticated'
    ? snapshot.tenantId + '/' + snapshot.userId + '/' + String(snapshot.epoch)
    : null;
  const visibleData = read.state === 'loaded' && read.data.scope === currentScope
    ? read.data : null;
  const visibleStatus = currentScope === null ? 'unloaded'
    : visibleData !== null ? 'loaded'
    : read.state === 'failed' ? 'failed' : 'loading';

  // A failed LOT_VIEW read is an explicit permission refusal, not an
  // empty inventory; never display any previously authorized table on it.
  const panelState = snapshot.status !== 'authenticated' || visibleStatus === 'loading' ||
    visibleStatus === 'unloaded' ? 'loading'
    : visibleStatus === 'failed' ? read.state === 'failed' && read.error === 'HTTP_403'
      ? 'permission-denied' : 'error'
      : 'ready';

  function login(): void {
    setAuthMessage('loading');
    void store.loginWithPassword(identifier, password)
      .then(() => setAuthMessage('done'), () => setAuthMessage('rejected'));
  }

  function foreignLot(): void {
    if (snapshot.status !== 'authenticated') return;
    setForeignResult('loading');
    void readInventoryLots(snapshot.accessToken, { productId: foreignId })
      .then(value => setForeignResult('HTTP_200:' + value.data.data.length),
        error => setForeignResult('HTTP_' + String(error?.status ?? 'unknown')));
  }

  return (
    <main>
      <h1>MOD-003 P2B0 — disposable authenticated inventory read acceptance only</h1>
      <label htmlFor="p2b0-identifier">Test-only identifier</label>
      <input id="p2b0-identifier" value={identifier} onChange={e => setIdentifier(e.target.value)} />
      <label htmlFor="p2b0-password">Test-only password</label>
      <input id="p2b0-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="button" id="p2b0-login" onClick={login}>Login</button>
      <button type="button" id="p2b0-logout" onClick={() => {
        setAuthMessage('logging-out');
        void store.logout().then(() => setAuthMessage('signed-out'),
          () => setAuthMessage('logout-refused'));
      }}>Logout</button>
      <p id="p2b0-auth-message">{authMessage}</p>
      <p id="p2b0-identity"
        data-status={snapshot.status}
        data-tenant={snapshot.status === 'authenticated' ? snapshot.tenantId : ''}
        data-user={snapshot.status === 'authenticated' ? snapshot.userId : ''}
        data-epoch={snapshot.epoch}>
        {snapshot.status}
      </p>
      <section id="p2b0-read"
        data-status={visibleStatus}
        data-tenant={visibleData?.scope.split('/')[0] ?? ''}>
        {visibleData !== null
          ? <pre id="p2b0-projection" className="block max-w-full overflow-x-auto">{JSON.stringify(visibleData)}</pre>
          : <p id="p2b0-read-status">{read.state === 'failed' && visibleStatus === 'failed'
            ? read.error : visibleStatus}</p>}
      </section>
      <label htmlFor="p2b2-language">Test-only panel language</label>
      <select id="p2b2-language" value={language}
        onChange={event => setLanguage(event.target.value as UiLanguage)}>
        <option value="English">English</option>
        <option value="Bangla">Bangla</option>
        <option value="English + Bangla">English + Bangla</option>
      </select>
      <div id="p2b2-real-panel">
        <ConnectedInventoryReadPanel
          presentation={visibleData}
          expectedScope={currentScope}
          state={panelState}
          language={language}
        />
      </div>
      <label htmlFor="p2b0-foreign">Foreign product ID (negative test)</label>
      <input id="p2b0-foreign" value={foreignId} onChange={e => setForeignId(e.target.value)} />
      <button type="button" id="p2b0-foreign-check"
        disabled={snapshot.status !== 'authenticated'} onClick={foreignLot}>
        Check foreign lots
      </button>
      <output id="p2b0-foreign-result">{foreignResult}</output>
    </main>
  );
}

const root = document.getElementById('root');
if (root === null) throw new Error('MOD-003 P2B0 test-only root is missing');
createRoot(root).render(
  <SessionProvider mode="connected"><InventoryProbe /></SessionProvider>,
);
