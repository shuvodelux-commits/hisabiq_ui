/**
 * Test-only Vite browser entry. Not imported by the production AppShell.
 * Exercises the real SessionStore + React dialog, not preview financial fixtures.
 */
import '../src/index.css';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SessionProvider, useSession } from '../src/integration/SessionProvider.tsx';
import { TenantSettingsProvider } from '../src/settings/TenantSettingsProvider.tsx';
import {
  ConnectedMoneyAccountActionDialog,
  type ConnectedMoneyAccountSelection,
} from '../src/components/finance/FinanceRecordDialogs.tsx';
import type { ServerMoneyAccount } from '../src/integration/accounts.ts';

const accountA: ServerMoneyAccount = {
  id: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  name: 'Shared account name',
  type: 'BANK',
  holderName: null,
  reference: null,
  isDrawer: false,
  status: 'ACTIVE',
  balanceMinor: 100500,
  openingAmountMinor: 100000,
  openingDate: '2026-01-01',
  version: 1,
};
const accountB: ServerMoneyAccount = {
  ...accountA,
  id: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
  balanceMinor: 230000,
};

function Controls() {
  const { mode, snapshot, store } = useSession();
  const [selected, setSelected] = useState<'A' | 'B'>('A');
  const [pinned, setPinned] = useState<ConnectedMoneyAccountSelection | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState('');

  const selection: ConnectedMoneyAccountSelection | null = pinned && stale
    ? pinned
    : snapshot.status === 'authenticated'
      ? {
          tenantId: snapshot.tenantId,
          userId: snapshot.userId,
          epoch: snapshot.epoch,
          account: selected === 'A' ? accountA : accountB,
        }
      : null;

  function safe(action: () => Promise<void>) {
    void action().catch(cause => setError(String(cause)));
  }
  return (
    <main>
      <nav aria-label="Statement runtime test controls">
        <button type="button" id="login-a" onClick={() => {
          setStale(false); setSelected('A'); safe(() => store.loginWithPassword('tenant-a', 'pw'));
        }}>Login tenant A</button>
        <button type="button" id="refresh" onClick={() => safe(() => store.refresh())}>Refresh token</button>
        <button type="button" id="account-b" onClick={() => setSelected('B')}>Select B</button>
        <button type="button" id="account-a" onClick={() => setSelected('A')}>Select A</button>
        <button type="button" id="pin-old" onClick={() => {
          setPinned(selection); setStale(true);
        }}>Pin old selection</button>
        <button type="button" id="logout" onClick={() => safe(() => store.logout())}>Logout</button>
        <button type="button" id="login-b" onClick={() => {
          setStale(false); setSelected('A'); safe(() => store.loginWithPassword('tenant-b', 'pw'));
        }}>Login tenant B</button>
        <button type="button" id="try-old" onClick={() => setStale(true)}>Try old tenant selection</button>
        <button type="button" id="restore-selection" onClick={() => setStale(false)}>Restore selection</button>
      </nav>
      <p id="session-state" data-mode={mode} data-status={snapshot.status}
        data-tenant={snapshot.status === 'authenticated' ? snapshot.tenantId : ''}
        data-epoch={snapshot.epoch}>{snapshot.status}</p>
      <p id="test-error">{error}</p>
      <ConnectedMoneyAccountActionDialog selection={selection} onClose={() => setSelected('A')} />
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing runtime test root');
createRoot(root).render(
  <React.StrictMode>
    <SessionProvider mode="connected">
      <TenantSettingsProvider>
        <Controls />
      </TenantSettingsProvider>
    </SessionProvider>
  </React.StrictMode>,
);
