import { useRef, useState } from 'react';
import type { ServerMoneyAccount } from '../../integration/accounts.ts';
import {
  recordConnectedCounterSettlement,
  type ConnectedCounterPostedAndRefreshed,
} from '../../integration/connected-counter-settlement.ts';
import {
  counterTakaToMinor,
  type CounterSingleSettlementDraft,
} from '../../integration/counter-single-account.ts';
import { ApiError } from '../../integration/errors.ts';
import { generateOperationId } from '../../integration/operation.ts';
import type { TradingParty } from '../../integration/party-reads.ts';
import { useSession } from '../../integration/SessionProvider.tsx';
import { useUiCopy } from '../../i18n/useUiCopy';

type Role = 'CUSTOMER' | 'SUPPLIER';
type Review = {
  fingerprint: string;
  identity: string;
  draft: CounterSingleSettlementDraft;
  amountMinor: number;
};
type Phase = 'editing' | 'review' | 'posting' | 'rejected' | 'unknown' | 'done';

export interface ConnectedCounterSinglePaymentProps {
  role: Role;
  party: TradingParty;
  account: ServerMoneyAccount;
  businessDate: string | null;
  cashReady: boolean;
  /** A possibly committed request elsewhere in the same connected scope blocks new writes. */
  locked: boolean;
  onPosted: (value: ConnectedCounterPostedAndRefreshed) => void;
  onUnresolved: (message: string) => void;
}

function permission(role: Role): string {
  return role === 'CUSTOMER' ? 'sale.payment.record' : 'purchase.payment.record';
}
function method(account: ServerMoneyAccount): 'Cash' | 'Bank' | 'Mobile Banking' {
  if (account.type === 'CASH') return 'Cash';
  if (account.type === 'BANK') return 'Bank';
  if (account.type === 'MFS') return 'Mobile Banking';
  throw new ApiError('protocol', 'Loan accounts are not eligible for Counter payments');
}
function signedIdentity(snapshot: ReturnType<ReturnType<typeof useSession>['store']['getSnapshot']>): string | null {
  return snapshot.status === 'authenticated'
    ? [snapshot.tenantId, snapshot.userId, snapshot.epoch,
       snapshot.accessToken, snapshot.permissions.join(',')].join('|')
    : null;
}
function money(minor: number): string {
  if (!Number.isSafeInteger(minor) || minor < 0) throw Error('Invalid amount');
  const amount = BigInt(minor);
  return '৳' + (amount / 100n).toString() + '.' + (amount % 100n).toString().padStart(2, '0');
}
function definitelyRejected(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'http' &&
    (error.status === 400 || error.status === 403 ||
     error.status === 404 || error.status === 422);
}

/** H2: source-owned one-tender review, never a preview-store payment. */
export function ConnectedCounterSinglePayment({
  role, party, account, businessDate, cashReady, locked, onPosted, onUnresolved,
}: ConnectedCounterSinglePaymentProps) {
  const { mode, snapshot, store } = useSession();
  const { text } = useUiCopy();
  const [amount, setAmount] = useState('');
  const [review, setReview] = useState<Review | null>(null);
  const [phase, setPhase] = useState<Phase>('editing');
  const [message, setMessage] = useState('');
  const inFlight = useRef(false);
  const identity = signedIdentity(snapshot);
  const roleValid = party.readRole === role && party.roles.includes(role) &&
    party.status === 'ACTIVE' && !party.isSystemReserved;
  const accountValid = account.status === 'ACTIVE' &&
    (account.type === 'CASH' || account.type === 'BANK' || account.type === 'MFS');
  const authValid = mode === 'connected' && snapshot.status === 'authenticated' &&
    snapshot.permissions.includes(permission(role));
  const sourceReady = account.type !== 'CASH' || (cashReady && !!businessDate);
  const canReview = !!identity && authValid && roleValid && accountValid &&
    sourceReady && !locked && !inFlight.current &&
    phase !== 'unknown' && phase !== 'done' && phase !== 'posting';
  const fingerprint = [role, party.id, account.id, amount].join('|');
  const reviewed = review?.fingerprint === fingerprint &&
    review.identity === identity && canReview ? review : null;

  function changeAmount(next: string) {
    if (phase !== 'editing' && phase !== 'rejected') return;
    if (next.length > 19) return;
    setAmount(next);
    setReview(null);
    setPhase('editing');
    setMessage('');
  }
  function prepareReview() {
    if (!canReview || phase !== 'editing' && phase !== 'rejected') return;
    try {
      const amountMinor = counterTakaToMinor(amount);
      const draft: CounterSingleSettlementDraft = {
        kind: role === 'CUSTOMER' ? 'CUSTOMER_RECEIPT' : 'SUPPLIER_PAYMENT',
        partyId: party.id,
        operationId: generateOperationId(),
        sources: [{ method: method(account), account, amount }],
        ...(account.type === 'CASH' && businessDate ? { businessDate } : {}),
      };
      setReview({ fingerprint, identity: identity!, draft, amountMinor });
      setPhase('review');
      setMessage('');
    } catch {
      setMessage(text(
        'Enter a positive amount with at most two decimals.',
        'শূন্যের বেশি টাকা লিখুন; দশমিকের পরে সর্বোচ্চ দুই ঘর।',
      ));
    }
  }
  async function confirm() {
    if (!reviewed || phase !== 'review' || inFlight.current || locked ||
        signedIdentity(store.getSnapshot()) !== review.identity) return;
    inFlight.current = true; // synchronous guard against double click/touch
    setPhase('posting');
    setMessage('');
    try {
      const source = await recordConnectedCounterSettlement(store, reviewed.draft);
      if (signedIdentity(store.getSnapshot()) !== review.identity) {
        throw new ApiError('protocol', 'Payment may have posted after session change');
      }
      setPhase('done');
      setMessage(source.payment.data.number);
      onPosted(source);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown source response';
      if (definitelyRejected(error)) {
        setPhase('rejected');
        setMessage(reason);
      } else {
        // A timeout, lost HTTP response, 5xx, or failed post-read may have
        // committed. Keep the original operation ID and forbid a fresh POST.
        setPhase('unknown');
        setMessage(reason);
        onUnresolved(reason);
      }
    } finally {
      inFlight.current = false;
    }
  }
  if (mode !== 'connected' || snapshot.status !== 'authenticated') return null;
  return <section data-connected-single-payment="" data-h2-state={phase}
    className="mx-3 mb-4 space-y-3 rounded-lg border border-border bg-card p-3 sm:mx-4 sm:p-4"
    aria-label="Single-source connected Counter payment">
    <header className="space-y-1">
      <h2 className="text-sm font-semibold text-ink">
        {text('Verified single-source payment', 'যাচাই করা এক মাধ্যমের পেমেন্ট')}
      </h2>
      <p className="text-xs text-ink-500">
        {role === 'CUSTOMER'
          ? text('Customer Receive', 'ক্রেতার টাকা নিন')
          : text('Supplier Pay', 'সরবরাহকারীকে টাকা দিন')}
        {' · '}{party.name}{' · '}{account.name} ({account.type})
      </p>
      <p className="text-xs text-ink-500">
        {text('No split, discount or selected invoice allocation in this source contract.',
          'এই সার্ভার চুক্তিতে একাধিক মাধ্যম, ছাড় বা নির্দিষ্ট বিল সমন্বয় নেই।')}
      </p>
    </header>
    <div>
      <label htmlFor="h2-single-payment-amount" className="block text-xs font-semibold">
        {text('Amount in taka', 'টাকার পরিমাণ')}
      </label>
      <input id="h2-single-payment-amount" data-h2-amount="" type="text"
        inputMode="decimal" autoComplete="off" value={amount}
        disabled={!canReview || phase === 'review'}
        onChange={event => changeAmount(event.target.value)}
        placeholder="0.00"
        className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"/>
    </div>
    {!sourceReady && <p role="alert" className="text-xs text-ink-500">
      {text('Cash Day is not verified for this source. Select Bank/MFS or resolve Cash Session.',
        'এই ক্যাশের দিন যাচাই করা যায়নি। ব্যাংক/মোবাইল বাছুন বা ক্যাশ সেশন ঠিক করুন।')}
    </p>}
    {locked && <p role="alert" className="text-xs font-semibold text-danger">
      {text('A previous payment result is uncertain. Reconcile source history before another operation.',
        'আগের পেমেন্টের ফল নিশ্চিত নয়। নতুন লেনদেনের আগে সার্ভারের হিসাব মিলিয়ে নিন।')}
    </p>}
    {(phase === 'editing' || phase === 'rejected') &&
      <button type="button" data-h2-review="" disabled={!canReview}
        onClick={prepareReview}
        className="min-h-12 w-full rounded-md bg-sidebar-primary px-3 text-sm font-semibold text-sidebar-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
        {text('Review single-source payment', 'এক মাধ্যমের পেমেন্ট যাচাই করুন')}
      </button>}
    {review && phase === 'review' && reviewed && <div className="space-y-2 rounded-md border border-border p-3">
      <p className="text-sm font-semibold">
        {text('Review before recording', 'লেখার আগে যাচাই করুন')}
      </p>
      <p className="text-sm">{party.name} · {account.name} · {money(review.amountMinor)}</p>
      <p className="text-xs text-ink-500">
        {text('Only one source POST will be requested using the original operation ID.',
          'মূল অপারেশন আইডি দিয়ে একবারই সার্ভারে পেমেন্ট পাঠানো হবে।')}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => { setReview(null); setPhase('editing'); }}
          className="min-h-12 rounded-md border border-border text-sm">
          {text('Edit', 'সংশোধন')}
        </button>
        <button type="button" data-h2-confirm="" disabled={inFlight.current}
          onClick={() => { void confirm(); }}
          className="min-h-12 rounded-md bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
          {text('Record verified payment', 'যাচাই করা পেমেন্ট লিখুন')}
        </button>
      </div>
    </div>}
    {phase === 'posting' && <p role="status" className="text-sm">
      {text('Server is recording this payment…', 'সার্ভারে পেমেন্ট লেখা হচ্ছে…')}
    </p>}
    {phase === 'rejected' && <p role="alert" className="text-xs text-danger">
      {message}
      {' '}{text('No payment was accepted. Edit and review again.', 'পেমেন্ট গৃহীত হয়নি। সংশোধন করে আবার যাচাই করুন।')}
    </p>}
    {phase === 'unknown' && <p role="alert" className="text-xs font-semibold text-danger" data-h2-unknown="">
      {text('Payment may have posted. Keep the original operation ID and reconcile source history before any retry.',
        'পেমেন্ট লেখা হয়ে থাকতে পারে। মূল অপারেশন আইডি রেখে আবার পাঠানোর আগে সার্ভারের হিসাব মিলিয়ে নিন।')}
      {' '}{message}
    </p>}
    {phase === 'done' && <p role="status" className="text-sm font-medium">
      {text('Server confirmed payment', 'সার্ভারে পেমেন্ট নিশ্চিত হয়েছে')}: {message}
    </p>}
  </section>;
}
