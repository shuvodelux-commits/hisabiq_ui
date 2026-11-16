/** MOD-006 T02-G2 — isolated CASH ON/OFF source-owned POST acceptance ONLY.
 * NEVER import into CounterWorkspace, Finance, App or a production route.
 * Calls the reusable, still-unmounted signed Counter coordinator; Nest alone
 * rechecks Cash Day policy inside the financial transaction.
 */
import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useSession, SessionProvider } from '../src/integration/SessionProvider.tsx';
import { readMoneyAccounts } from '../src/integration/accounts.ts';
import { recordConnectedCounterSettlement } from '../src/integration/connected-counter-settlement.ts';
import type { CounterSingleSettlementDraft } from '../src/integration/counter-single-account.ts';

type Action = 'LOGIN' | 'LOGOUT' | 'POST';
type Kind = 'CUSTOMER_RECEIPT' | 'SUPPLIER_PAYMENT';
interface TestResult {
  status: 'idle' | 'running' | 'error' | 'posted' | 'authenticated' | 'signed-out';
  completed: number;
  paymentId: string; balance: string; partyBalance: string; mode: string; sessionId: string;
  message: string;
}
const idle: TestResult = {
  status: 'idle', completed: 0, paymentId: '', balance: '', partyBalance: '',
  mode: '', sessionId: '', message: '',
};
function CashHarness() {
  const { store, snapshot } = useSession();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [partyId, setPartyId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [operationId, setOperationId] = useState('');
  const [kind, setKind] = useState<Kind>('CUSTOMER_RECEIPT');
  const [amount, setAmount] = useState('23.50');
  const [busy, setBusy] = useState(false);
  const sequence = useRef(0);
  const [result, setResult] = useState<TestResult>(idle);
  const signed = snapshot.status === 'authenticated';

  async function execute(action: Action): Promise<void> {
    if (busy) return;
    const completed = ++sequence.current;
    setBusy(true);
    setResult({ ...idle, status: 'running' });
    try {
      if (action === 'LOGIN') {
        await store.loginWithPassword(identifier, password);
        setResult({ ...idle, completed, status: 'authenticated' });
      } else if (action === 'LOGOUT') {
        await store.logout();
        setResult({ ...idle, completed, status: 'signed-out' });
      } else {
        const captured = store.getSnapshot();
        if (captured.status !== 'authenticated') throw Error('Authenticated signed session required');
        // This QA-only component supplies just a real account selection.
        // The reusable production coordinator verifies /me, Party, account and
        // Cash Session ON/OFF; it alone decides when a financial POST may occur.
        const money = await readMoneyAccounts(captured.accessToken, {});
        const account = money.accounts.find(item =>
          item.id === accountId && item.type === 'CASH' && item.status === 'ACTIVE');
        if (!account) throw Error('Active source-owned CASH account required');
        const updated = store.getSnapshot();
        if (updated.status !== 'authenticated' ||
            updated.tenantId !== captured.tenantId ||
            updated.userId !== captured.userId ||
            updated.epoch !== captured.epoch ||
            updated.accessToken !== captured.accessToken) {
          throw Error('Cash session identity changed before coordinator');
        }
        const draft: CounterSingleSettlementDraft = {
          kind, partyId, operationId,
          sources: [{ method: 'Cash', account, amount }],
        };
        const posted = await recordConnectedCounterSettlement(store, draft);
        if (!posted.cashDay) throw Error('Signed source Cash Day result required');
        setResult({
          status: 'posted', completed, paymentId: posted.payment.data.id,
          balance: String(posted.account.balanceMinor),
          partyBalance: String(posted.party.balance.netMinor),
          mode: posted.cashDay.mode, sessionId: posted.cashDay.sessionId ?? '',
          message: posted.scope.tenantId,
        });
      }
    } catch (error) {
      setResult({
        ...idle, completed, status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setBusy(false);
    }
  }
  return <main aria-label="MOD-006 G2 disposable signed CASH browser acceptance">
    <label htmlFor="g2-identifier">Disposable login</label>
    <input id="g2-identifier" value={identifier} onChange={e => setIdentifier(e.target.value)} />
    <label htmlFor="g2-password">Disposable password</label>
    <input id="g2-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
    <button id="g2-login" type="button" disabled={busy} onClick={() => void execute('LOGIN')}>Login</button>
    <button id="g2-logout" type="button" disabled={!signed || busy}
      onClick={() => void execute('LOGOUT')}>Logout</button>
    <label htmlFor="g2-kind">Payment kind</label>
    <select id="g2-kind" value={kind} onChange={e => setKind(e.target.value as Kind)}>
      <option value="CUSTOMER_RECEIPT">Customer receipt</option>
      <option value="SUPPLIER_PAYMENT">Supplier payment</option>
    </select>
    <label htmlFor="g2-party">Real Party ID</label>
    <input id="g2-party" value={partyId} onChange={e => setPartyId(e.target.value)} />
    <label htmlFor="g2-account">Real CASH account ID</label>
    <input id="g2-account" value={accountId} onChange={e => setAccountId(e.target.value)} />
    <label htmlFor="g2-operation">Persistent operation ULID</label>
    <input id="g2-operation" value={operationId} onChange={e => setOperationId(e.target.value)} />
    <label htmlFor="g2-amount">Exact taka amount</label>
    <input id="g2-amount" value={amount} onChange={e => setAmount(e.target.value)} />
    <button id="g2-post" type="button" disabled={busy || !signed}
      onClick={() => void execute('POST')}>Verify Cash Day and post source-owned settlement</button>
    <output id="g2-session" data-status={snapshot.status}
      data-tenant={signed ? snapshot.tenantId : ''}>{snapshot.status}</output>
    <output id="g2-result" data-status={result.status} data-completed={result.completed}
      data-payment-id={result.paymentId} data-cash-balance={result.balance}
      data-party-balance={result.partyBalance} data-mode={result.mode}
      data-session-id={result.sessionId}>{result.message}</output>
  </main>;
}
const root = document.getElementById('root');
if (!root) throw Error('G2 isolated fixture root absent');
createRoot(root).render(<SessionProvider mode="connected"><CashHarness /></SessionProvider>);
