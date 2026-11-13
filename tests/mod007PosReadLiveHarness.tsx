/**
 * MOD-007 P0D — QA ONLY: real SessionStore -> Nest/PG16 POS read transport.
 * Intentionally outside App.tsx, AppShell, POS V2 and ConnectedWorkspaceGate.
 * Never use this test harness as a production product/cart/standing UI.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../src/integration/SessionProvider.tsx';
import {
  readPosProducts, readPosCustomers, readPosCustomerStanding,
} from '../src/integration/sales.ts';
import type {
  ServerPosProduct, ServerCustomerDirectoryEntry, ServerCustomerStanding,
} from '../src/integration/saleMapping.ts';

type View = {
  epoch: number | null;
  pending: boolean;
  products: ServerPosProduct[];
  customers: ServerCustomerDirectoryEntry[];
  standing: ServerCustomerStanding | null;
  nextCursor: string | null;
  error: string;
};
const empty = (): View => ({
  epoch: null, pending: false, products: [], customers: [],
  standing: null, nextCursor: null, error: '',
});

function LiveReadControls() {
  const { snapshot, store } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [actionResult, setActionResult] = useState('');
  const [query, setQuery] = useState('wire');
  const [view, setView] = useState<View>(empty);
  const nextRequest = useRef<AbortController | null>(null);

  // Every identity/session epoch change hides old rows synchronously at render;
  // effect cleanup also aborts a slower response from an earlier tenant.
  useEffect(() => {
    const controller = new AbortController();
    nextRequest.current?.abort();
    nextRequest.current = null;
    setView(empty());
    if (snapshot.status !== 'authenticated') return () => controller.abort();
    const { accessToken, epoch } = snapshot;
    setView({ ...empty(), epoch, pending: true });
    void (async () => {
      try {
        const [products, customers] = await Promise.all([
          readPosProducts(accessToken, {
            rankingMode: 'GLOBAL_V2', search: query, limit: 2,
          }, controller.signal),
          readPosCustomers(accessToken, { search: 'Karim', limit: 50 }, controller.signal),
        ]);
        const first = customers.data[0];
        const standing = first
          ? (await readPosCustomerStanding(accessToken, first.id, controller.signal)).data
          : null;
        const current = store.getSnapshot();
        if (controller.signal.aborted || current.status !== 'authenticated' ||
            current.epoch !== epoch) return;
        setView({
          epoch, pending: false, products: products.items,
          customers: customers.data, standing,
          nextCursor: products.nextCursor, error: '',
        });
      } catch (error) {
        const current = store.getSnapshot();
        if (controller.signal.aborted || current.status !== 'authenticated' ||
            current.epoch !== epoch) return;
        setView({ ...empty(), epoch, error: String(error) });
      }
    })();
    return () => {
      controller.abort();
      nextRequest.current?.abort();
      nextRequest.current = null;
    };
  }, [snapshot.status, snapshot.epoch, store, query]);

  function action(work: () => Promise<void>): void {
    setActionResult('pending');
    void work().then(() => setActionResult('confirmed'), error => {
      setActionResult('failed: ' + String(error));
    });
  }

  function more(): void {
    if (snapshot.status !== 'authenticated' ||
        snapshot.epoch !== view.epoch || !view.nextCursor || view.pending) return;
    const { epoch, accessToken } = snapshot;
    nextRequest.current?.abort();
    const controller = new AbortController();
    nextRequest.current = controller;
    setView(prev => ({ ...prev, pending: true }));
    void readPosProducts(accessToken, {
      rankingMode: 'GLOBAL_V2', search: query,
      limit: 2, cursor: view.nextCursor,
    }, controller.signal).then(response => {
      const current = store.getSnapshot();
      if (controller.signal.aborted || current.status !== 'authenticated' ||
          current.epoch !== epoch) return;
      setView(prev => ({
        ...prev, pending: false,
        products: [...prev.products, ...response.items],
        nextCursor: response.nextCursor, error: '',
      }));
    }, error => {
      const current = store.getSnapshot();
      if (controller.signal.aborted || current.status !== 'authenticated' ||
          current.epoch !== epoch) return;
      setView(prev => ({ ...prev, pending: false, error: String(error) }));
    });
  }

  const authenticated = snapshot.status === 'authenticated';
  const visible = authenticated && view.epoch === snapshot.epoch;
  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '100%', overflowWrap: 'anywhere' }}>
      <h1>MOD-007 read-only PG16 browser acceptance — QA ONLY</h1>
      <section aria-label="Test-only login controls">
        <label htmlFor="p0d-identifier">Test identifier</label>
        <input id="p0d-identifier" value={identifier} onChange={e => setIdentifier(e.target.value)} />
        <label htmlFor="p0d-password">Test password</label>
        <input id="p0d-password" type="password" value={password}
          onChange={e => setPassword(e.target.value)} />
        <button id="p0d-login" type="button"
          onClick={() => action(() => store.loginWithPassword(identifier, password))}>Login</button>
        <button id="p0d-refresh" type="button"
          onClick={() => action(() => store.refresh())}>Refresh</button>
        <button id="p0d-logout" type="button"
          onClick={() => action(() => store.logout())}>Logout</button>
        <label htmlFor="p0d-search">Product query</label>
        <input id="p0d-search" value={query} onChange={e => setQuery(e.target.value)} />
        <p id="p0d-session" data-status={snapshot.status}
          data-epoch={snapshot.epoch}
          data-tenant={authenticated ? snapshot.tenantId : ''}>{snapshot.status}</p>
        <p id="p0d-result">{actionResult}</p>
      </section>
      <section id="p0d-products" aria-label="Server products"
        data-ready={visible && !view.pending && !view.error ? 'yes' : 'no'}>
        {visible && view.error ? <p role="alert" id="p0d-error">{view.error}</p> : null}
        {visible && !view.error ? (
          <>
            {view.products.map(item => (
              <p key={item.id} data-p0d-product={item.id}
                data-p0d-stock={item.stockStatus}
                data-p0d-cost-present={Object.prototype.hasOwnProperty.call(item, 'purchasePriceMinor') ? 'yes' : 'no'}>
                {item.name} | {item.unitName} | {item.sellingPriceMinor} poisha
              </p>
            ))}
            <button id="p0d-more" type="button"
              disabled={!view.nextCursor || view.pending} onClick={more}>More products</button>
          </>
        ) : null}
      </section>
      <section id="p0d-customers" aria-label="Server customer directory">
        {visible && !view.error ? view.customers.map(item => (
          <p key={item.id} data-p0d-customer={item.id}>{item.name} | {item.roles.join(',')}</p>
        )) : null}
      </section>
      <section id="p0d-standing" aria-label="Server customer standing">
        {visible && !view.error && view.standing ? (
          <p data-p0d-standing={view.standing.partyId ?? ''}>
            due {view.standing.dueMinor} poisha; advance {view.standing.advanceMinor} poisha
          </p>
        ) : null}
      </section>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('P0D QA-only root missing');
createRoot(root).render(
  <SessionProvider mode="connected">
    <LiveReadControls />
  </SessionProvider>,
);
