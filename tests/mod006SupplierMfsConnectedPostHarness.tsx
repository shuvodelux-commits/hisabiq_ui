/** MOD-006 T02-F2: isolated real signed SUPPLIER + MFS QA ONLY.
 * This is never imported by App, Finance or connected Counter routes.
 * The original Nest supplier payment service owns all source and journal writes.
 */
import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useSession, SessionProvider } from '../src/integration/SessionProvider.tsx';
import { readMoneyAccounts } from '../src/integration/accounts.ts';
import { recordConnectedBankCounterSettlement } from '../src/integration/connected-counter-settlement.ts';
import type { CounterSingleSettlementDraft } from '../src/integration/counter-single-account.ts';

type Action = 'LOGIN' | 'LOGOUT' | 'POST' | 'SPLIT' | 'DISCOUNT' | 'CASH' | 'FOREIGN_PARTY';
type Result = { status: string; completed: number; paymentId: string; balance: string; partyBalance: string; message: string };
function Harness() {
  const { snapshot, store } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [partyId, setPartyId] = useState('');
  const [otherPartyId, setOtherPartyId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [operationId, setOperationId] = useState('');
  const [busy, setBusy] = useState(false);
  const sequence = useRef(0);
  const [result, setResult] = useState<Result>({
    status: 'idle', completed: 0, paymentId: '', balance: '', partyBalance: '', message: '',
  });
  const signed = snapshot.status === 'authenticated';

  async function perform(action: Action): Promise<void> {
    if (busy) return;
    const attempt = ++sequence.current;
    setBusy(true);
    setResult({ status: 'running', completed: 0, paymentId: '', balance: '', partyBalance: '', message: '' });
    try {
      if (action === 'LOGIN') {
        await store.loginWithPassword(identifier, password);
        setResult(prev => ({ ...prev, status: 'authenticated', completed: attempt }));
      } else if (action === 'LOGOUT') {
        await store.logout();
        setResult(prev => ({ ...prev, status: 'signed-out', completed: attempt }));
      } else {
        const current = store.getSnapshot();
        if (current.status !== 'authenticated') throw Error('Current signed session required');
        const response = await readMoneyAccounts(current.accessToken, {});
        const selected = response.accounts.find(account => account.id === accountId);
        if (!selected) throw Error('Verified MFS account not found');
        const method = action === 'CASH' ? 'Cash' as const : 'Mobile Banking' as const;
        const tender = { method, account: selected, amount: '200.00' };
        const draft: CounterSingleSettlementDraft = {
          kind: 'SUPPLIER_PAYMENT', partyId: action === 'FOREIGN_PARTY' ? otherPartyId : partyId,
          operationId,
          sources: action === 'SPLIT' ? [tender, tender] : [tender],
          ...(action === 'DISCOUNT' ? { discount: '1.00' } : {}),
        };
        const posted = await recordConnectedBankCounterSettlement(store, draft);
        if (posted.payment.kind !== 'SUPPLIER_PAYMENT') throw Error('Wrong source document kind');
        setResult({
          status: 'posted', completed: attempt,
          paymentId: posted.payment.data.id,
          balance: String(posted.account.balanceMinor),
          partyBalance: String(posted.party.balance.netMinor),
          message: posted.scope.tenantId,
        });
      }
    } catch (error) {
      setResult({
        status: 'error', completed: attempt, paymentId: '', balance: '', partyBalance: '',
        message: error instanceof Error ? error.message : 'Unrecognized error',
      });
    } finally {
      setBusy(false);
    }
  }

  return <main aria-label="T02-F2 disposable supplier MFS acceptance only">
    <label htmlFor="f2-identifier">Disposable login</label>
    <input id="f2-identifier" value={identifier} onChange={e => setIdentifier(e.target.value)} />
    <label htmlFor="f2-password">Disposable password</label>
    <input id="f2-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
    <button id="f2-login" type="button" disabled={busy} onClick={() => void perform('LOGIN')}>Login</button>
    <button id="f2-logout" type="button" disabled={busy || !signed} onClick={() => void perform('LOGOUT')}>Logout</button>
    <label htmlFor="f2-party">Real supplier Party ID</label>
    <input id="f2-party" value={partyId} onChange={e => setPartyId(e.target.value)} />
    <label htmlFor="f2-foreign">Foreign Party ID</label>
    <input id="f2-foreign" value={otherPartyId} onChange={e => setOtherPartyId(e.target.value)} />
    <label htmlFor="f2-account">Real MFS account ID</label>
    <input id="f2-account" value={accountId} onChange={e => setAccountId(e.target.value)} />
    <label htmlFor="f2-operation">Unchanged caller operation ULID</label>
    <input id="f2-operation" value={operationId} onChange={e => setOperationId(e.target.value)} />
    <button id="f2-post" type="button" disabled={busy || !signed}
      onClick={() => void perform('POST')}>Post supplier MFS payment</button>
    <button id="f2-split" type="button" disabled={busy || !signed}
      onClick={() => void perform('SPLIT')}>Reject split</button>
    <button id="f2-discount" type="button" disabled={busy || !signed}
      onClick={() => void perform('DISCOUNT')}>Reject discount</button>
    <button id="f2-cash" type="button" disabled={busy || !signed}
      onClick={() => void perform('CASH')}>Reject CASH mismatch</button>
    <button id="f2-foreign-party" type="button" disabled={busy || !signed}
      onClick={() => void perform('FOREIGN_PARTY')}>Reject foreign supplier</button>
    <output id="f2-session" data-status={snapshot.status}
      data-tenant={signed ? snapshot.tenantId : ''}>{snapshot.status}</output>
    <output id="f2-result" data-status={result.status} data-completed={result.completed}
      data-payment-id={result.paymentId} data-mfs-balance={result.balance}
      data-party-balance={result.partyBalance}>{result.message}</output>
  </main>;
}
const root = document.getElementById('root');
if (!root) throw Error('Isolated T02-F2 fixture root absent');
createRoot(root).render(<SessionProvider mode="connected"><Harness /></SessionProvider>);
