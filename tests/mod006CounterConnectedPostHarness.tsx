/** MOD-006 T02-F1: isolated REAL signed React→Nest→PG16 financial acceptance.
 * Never import this into App, the Counter workspace, or a production route.
 * Accounts and Party are verified by server GET; only Nest writes the journal.
 */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useSession, SessionProvider } from '../src/integration/SessionProvider.tsx';
import { readMoneyAccounts } from '../src/integration/accounts.ts';
import {
  recordConnectedBankCounterSettlement,
} from '../src/integration/connected-counter-settlement.ts';
import type { CounterSingleSettlementDraft } from '../src/integration/counter-single-account.ts';

function Harness() {
  const { store, snapshot } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [partyId, setPartyId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [operationId, setOperationId] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState({ status: 'idle', paymentId: '', balance: '', partyBalance: '', message: '' });
  const authenticated = snapshot.status === 'authenticated';

  async function execute(action: 'LOGIN' | 'LOGOUT' | 'POST' | 'DISCOUNT' | 'SPLIT') {
    if (busy) return;
    setBusy(true);
    setResult({ status: 'running', paymentId: '', balance: '', partyBalance: '', message: '' });
    try {
      if (action === 'LOGIN') {
        await store.loginWithPassword(identifier, password);
        setResult(prev => ({ ...prev, status: 'authenticated' }));
      } else if (action === 'LOGOUT') {
        await store.logout();
        setResult(prev => ({ ...prev, status: 'signed-out' }));
      } else {
        const current = store.getSnapshot();
        if (current.status !== 'authenticated') throw Error('verified session required');
        const list = await readMoneyAccounts(current.accessToken, {});
        const selected = list.accounts.find(account => account.id === accountId);
        if (!selected) throw Error('real BANK source account unavailable');
        const tender = { method: 'Bank' as const, account: selected, amount: '23.50' };
        const draft: CounterSingleSettlementDraft = {
          kind: 'CUSTOMER_RECEIPT',
          partyId, operationId,
          sources: action === 'SPLIT' ? [tender, tender] : [tender],
          ...(action === 'DISCOUNT' ? { discount: '1.00' } : {}),
        };
        const posted = await recordConnectedBankCounterSettlement(store, draft);
        setResult({
          status: 'posted',
          paymentId: posted.payment.data.id,
          balance: String(posted.account.balanceMinor),
          partyBalance: String(posted.party.balance.netMinor),
          message: posted.scope.tenantId,
        });
      }
    } catch (error) {
      setResult({
        status: 'error', paymentId: '', balance: '', partyBalance: '',
        message: error instanceof Error ? error.message : 'unknown error',
      });
    } finally {
      setBusy(false);
    }
  }
  return (
    <main aria-label="T02-F1 disposable signed Counter test only">
      <label htmlFor="t02f-identifier">Disposable login</label>
      <input id="t02f-identifier" value={identifier} onChange={e => setIdentifier(e.target.value)} />
      <label htmlFor="t02f-password">Disposable password</label>
      <input id="t02f-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button id="t02f-login" type="button" onClick={() => void execute('LOGIN')} disabled={busy}>Login</button>
      <button id="t02f-logout" type="button" onClick={() => void execute('LOGOUT')} disabled={busy || !authenticated}>Logout</button>
      <label htmlFor="t02f-party">Real customer Party ULID</label>
      <input id="t02f-party" value={partyId} onChange={e => setPartyId(e.target.value)} />
      <label htmlFor="t02f-account">Real BANK account ULID</label>
      <input id="t02f-account" value={accountId} onChange={e => setAccountId(e.target.value)} />
      <label htmlFor="t02f-operation">Persistent operation ULID</label>
      <input id="t02f-operation" value={operationId} onChange={e => setOperationId(e.target.value)} />
      <button id="t02f-post" type="button" disabled={busy || !authenticated}
        onClick={() => void execute('POST')}>Post one BANK customer receipt</button>
      <button id="t02f-discount" type="button" disabled={busy || !authenticated}
        onClick={() => void execute('DISCOUNT')}>Reject unsupported discount</button>
      <button id="t02f-split" type="button" disabled={busy || !authenticated}
        onClick={() => void execute('SPLIT')}>Reject unsupported split</button>
      <output id="t02f-session" data-status={snapshot.status}
        data-tenant={authenticated ? snapshot.tenantId : ''}>{snapshot.status}</output>
      <output id="t02f-result" data-status={result.status} data-payment-id={result.paymentId}
        data-bank-balance={result.balance} data-party-balance={result.partyBalance}>
        {result.message}
      </output>
    </main>
  );
}
const root = document.getElementById('root');
if (!root) throw Error('Missing isolated T02-F1 test root');
createRoot(root).render(<SessionProvider mode="connected"><Harness /></SessionProvider>);
