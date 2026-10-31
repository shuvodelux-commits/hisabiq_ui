import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, BookOpen, CheckCircle2, Landmark, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import { AmountInWordsDisplay } from '../AmountInWordsDisplay';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import { financeAccounts } from '../../data/financeAccounts';
import { businessToday } from '../../utils/dateRange';
import { taka } from '../../utils/currency';
import {
  BANK_ENTRY_TYPES, bankEntryImpact, bankEntryMeta, toBankEntryPayload, validateBankEntry,
  type BankEntryDraft, type BankEntryType
} from '../../utils/bankEntry';
import {
  getBankEntryBootstrap, getBankEntryLedger, recordBankEntry,
  type BankAccountOption, type BankLedgerEntry
} from '../../services/bankEntryApi';
import { useUiCopy } from '../../i18n/useUiCopy';

const today = () => businessToday();

function emptyDraft(accountId = ''): BankEntryDraft {
  return {
    bankAccountId: accountId,
    entryType: 'Bank Charge',
    amount: '',
    date: today(),
    direction: 'debit',
    reference: '',
    description: '',
    notes: '',
    backdatedReason: ''
  };
}

const demoAccounts: BankAccountOption[] = financeAccounts
  .filter((account) => account.status === 'Active' && (account.type === 'Bank' || account.type === 'Mobile Banking'))
  .map((account) => ({
    id: account.id, name: account.name, bankName: account.institution ?? '',
    currentBalance: account.balance, type: account.type as 'Bank' | 'Mobile Banking'
  }));

const fieldClass = 'block text-[12.5px] font-medium text-ink';

export function BankEntryTab({ variant = 'accounts', initialAccountId }: { variant?: 'accounts' | 'counter'; initialAccountId?: string } = {}) {
  const navigate = useNavigate();
  const inCounter = variant === 'counter';
  const { text, showHelper } = useUiCopy();
  const [accounts, setAccounts] = useState<BankAccountOption[]>(demoAccounts);
  const [connected, setConnected] = useState(false);
  const [activeCashSession, setActiveCashSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [formError, setFormError] = useState('');
  const [draft, setDraft] = useState<BankEntryDraft>(() => emptyDraft(initialAccountId));
  const [review, setReview] = useState(false);
  const [ledger, setLedger] = useState<BankLedgerEntry[]>([]);
  const [ledgerError, setLedgerError] = useState('');

  const update = <K extends keyof BankEntryDraft>(key: K, value: BankEntryDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setReview(false);
    setFormError('');
  };

  const loadBootstrap = async () => {
    setLoading(true);
    try {
      const result = await getBankEntryBootstrap();
      setConnected(true);
      setActiveCashSession(result.activeCashSession);
      setLoadError('');
      setAccounts(result.accounts);
      setDraft((current) => ({
        ...current,
        bankAccountId: result.accounts.some((account) => account.id === current.bankAccountId)
          ? current.bankAccountId : result.accounts[0]?.id ?? ''
      }));
    } catch (error) {
      setConnected(false);
      setAccounts(demoAccounts);
      setActiveCashSession(false);
      setLedger([]);
      setLoadError(error instanceof Error ? error.message : 'Could not connect to Bank API.');
      setDraft((current) => ({
        ...current,
        bankAccountId: demoAccounts.some((account) => account.id === current.bankAccountId)
          ? current.bankAccountId : demoAccounts[0]?.id ?? ''
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadBootstrap(); }, []);
  // Honor an account selected from its Money Accounts card, even after bootstrap.
  useEffect(() => {
    if (!initialAccountId || !accounts.some(account => account.id === initialAccountId)) return;
    setDraft(current => current.bankAccountId === initialAccountId ? current : { ...current, bankAccountId: initialAccountId });
  }, [initialAccountId, accounts]);

  useEffect(() => {
    if (!connected || !draft.bankAccountId) { setLedger([]); return; }
    let cancelled = false;
    setLedgerError('');
    void getBankEntryLedger(draft.bankAccountId)
      .then((result) => { if (!cancelled) setLedger(result.entries); })
      .catch((error) => { if (!cancelled) setLedgerError(error instanceof Error ? error.message : 'Could not load bank ledger.'); });
    return () => { cancelled = true; };
  }, [connected, draft.bankAccountId]);

  const meta = bankEntryMeta(draft.entryType);
  const selectedAccount = accounts.find((account) => account.id === draft.bankAccountId);
  const amount = Number(draft.amount) || 0;
  const impact = useMemo(
    () => bankEntryImpact(draft.entryType, amount, draft.direction),
    [draft.entryType, draft.direction, amount]
  );
  const bouncedCheque = meta.cheque;
  const isBackdated = draft.date < today();
  const requiresSession = connected && !activeCashSession;
  const bankBalance = selectedAccount?.currentBalance ?? 0;

  const reviewEntry = () => {
    const issue = validateBankEntry(draft, today(), connected ? activeCashSession : true);
    if (issue) { setFormError(issue); return; }
    setFormError('');
    setReview(true);
  };

  const submitEntry = async () => {
    if (!connected || saving) return;
    const issue = validateBankEntry(draft, today(), activeCashSession);
    if (issue) { setFormError(issue); setReview(false); return; }
    setSaving(true);
    try {
      await recordBankEntry(toBankEntryPayload(draft));
      toast.success(text('Bank entry recorded','ব্যাংকের এন্ট্রি সংরক্ষণ হয়েছে'), {
        description: text('Check your bank ledger for the updated balance.','ব্যাংকের খাতায় নতুন জের মিলিয়ে নিন।')
      });
      setReview(false);
      setDraft(emptyDraft(draft.bankAccountId));
      const [bootstrap, latestLedger] = await Promise.all([
        getBankEntryBootstrap(), getBankEntryLedger(draft.bankAccountId)
      ]);
      setAccounts(bootstrap.accounts);
      setActiveCashSession(bootstrap.activeCashSession);
      setLedger(latestLedger.entries);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Bank entry was not recorded.');
      setReview(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={inCounter ? 'space-y-4' : 'space-y-3 p-3 sm:p-4'} aria-label="Bank Entry workspace">
      {!inCounter && (
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-ink">{text('Record a Bank Entry','ব্যাংকের এন্ট্রি করুন')}</p>
          <p className="mt-0.5 text-[11px] text-ink-400">
            {text('For bank charges, interest, cash movements and verified adjustments.','ব্যাংক চার্জ, সুদ, ক্যাশ জমা বা হিসাব সংশোধনের জন্য।')}
          </p>
        </div>
        <Button size="sm" variant="outline" disabled={loading || saving} onClick={() => { void loadBootstrap(); }}>
          <RefreshCw className="size-3.5" /> {text('Refresh','রিফ্রেশ')}
        </Button>
      </div>
      )}

      {!connected && (
        <div role="status" className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-[12px] text-ink-700">
          <strong>{text('UI Preview · Read only','শুধু দেখার নমুনা')}</strong>
          <p className="mt-1">{text('Sample bank accounts are shown. Recording is disabled until the authenticated BanijjIQ bank API is connected.','ব্যাংক API সংযুক্ত না থাকলে আসল এন্ট্রি করা যাবে না।')}</p>
          {loadError && <p className="mt-1 text-[11px] text-ink-400">{loadError}</p>}
        </div>
      )}
      {requiresSession && (
        <div role="status" className="rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-[12px] text-ink-700">
          {text('An active POS Cash Session is required by the current bank API. Start Day in POS before recording.','ব্যাংক এন্ট্রির আগে POS থেকে Start Day করুন।')}
        </div>
      )}

      <div className={inCounter
        ? 'grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]'
        : 'grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(255px,0.9fr)]'}>
        <section className={inCounter ? 'min-w-0' : 'rounded-lg border border-border p-3 sm:p-4'} aria-label="Bank entry form">
          {formError && <p role="alert" className="mb-3 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-[12px] text-danger">{formError}</p>}
          {review && !inCounter ? (
            <div className="space-y-3" aria-label="Review bank entry">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-teal-700" />
                <p className="text-[13px] font-semibold">{text('Review before recording','সংরক্ষণের আগে যাচাই করুন')}</p>
              </div>
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {([
                  [text('Bank account','ব্যাংক হিসাব'), selectedAccount?.name ?? '—'],
                  [text('Entry type','এন্ট্রির ধরন'), meta.label],
                  [text('Amount','টাকা'), taka(amount)],
                  [text('Entry date','তারিখ'), draft.date],
                  [text('Reference','রেফারেন্স'), draft.reference || '—'],
                  [text('Description','বিবরণ'), draft.description || meta.label]
                ] as const).map(([label, value]) => (
                  <div key={label} className="rounded-md border border-border px-3 py-2">
                    <dt className="text-[11px] text-ink-400">{label}</dt>
                    <dd className="mt-1 text-[12.5px] font-medium text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
              {!connected && <p className="text-[11px] text-ink-500">{text('Preview only; no transaction can be posted here.','এটি শুধু নমুনা, কোনো লেনদেন জমা হবে না।')}</p>}
              <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
                <Button variant="outline" size="sm" onClick={() => setReview(false)}>{text('Edit','সংশোধন')}</Button>
                <Button size="sm" disabled={!connected || saving} onClick={() => { void submitEntry(); }}>
                  {saving ? text('Recording…','সংরক্ষণ হচ্ছে…') : text('Confirm & Record','নিশ্চিত করে সংরক্ষণ')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className={inCounter ? 'space-y-4' : 'grid gap-3 sm:grid-cols-2'}>
                <div className={inCounter
                  ? 'grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2'
                  : 'contents'}>
                <label className={fieldClass}>
                  {text('Bank account','ব্যাংক হিসাব')} *
                  <FormSelect className="mt-1.5" value={draft.bankAccountId} disabled={loading}
                    options={accounts.map((account) => ({ value: account.id, label: account.name + (account.bankName ? ' — ' + account.bankName : '') }))}
                    onChange={(event) => update('bankAccountId', event.target.value)} />
                </label>
                <label className={fieldClass}>
                  {text('Entry type','এন্ট্রির ধরন')} *
                  <FormSelect className="mt-1.5" value={draft.entryType}
                    options={BANK_ENTRY_TYPES.map((item) => ({ value: item.key, label: item.label }))}
                    onChange={(event) => update('entryType', event.target.value as BankEntryType)} />
                  {showHelper && <span className="mt-1 block font-bn text-[11px] font-normal text-ink-400">{meta.helperBn}</span>}
                </label>
                <label className={fieldClass}>
                  {text('Amount','টাকা')} *
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-ink-400">৳</span>
                    <Input className="pl-7 text-right" inputMode="decimal" value={draft.amount}
                      onChange={(event) => update('amount', event.target.value.replace(/[^\d.]/g, ''))} placeholder="0.00" />
                  </div>
                </label>
                <label className={fieldClass}>
                  {text('Entry date','এন্ট্রির তারিখ')} *
                  <Input className="mt-1.5" type="date" max={today()} value={draft.date}
                    onChange={(event) => update('date', event.target.value)} />
                </label>

                {meta.direction === 'either' && (
                  <label className={fieldClass}>
                    {text('Direction','টাকা আসা / যাওয়া')} *
                    <FormSelect className="mt-1.5" value={draft.direction}
                      options={[{ value: 'credit', label: text('Money In','টাকা জমা') }, { value: 'debit', label: text('Money Out','টাকা খরচ') }]}
                      onChange={(event) => update('direction', event.target.value as 'credit' | 'debit')} />
                  </label>
                )}
                </div>
                <div className={inCounter ? 'rounded-xl border border-border bg-card p-4' : 'contents'}>
                  {inCounter && <h3 className="mb-3 text-sm font-semibold">{text('Reference / details (optional)','রেফারেন্স / বিবরণ')}</h3>}
                  <div className={inCounter ? 'grid gap-3 sm:grid-cols-2' : 'contents'}>
                <label className={fieldClass}>
                  {text('Reference','রেফারেন্স')}
                  <Input className="mt-1.5" value={draft.reference}
                    placeholder={text('Cheque no. / bank advice','চেক / ব্যাংক রেফারেন্স')}
                    onChange={(event) => update('reference', event.target.value)} />
                </label>
                <label className={fieldClass + ' sm:col-span-2'}>
                  {text('Description','বিবরণ')}
                  <Input className="mt-1.5" value={draft.description} placeholder={meta.label}
                    onChange={(event) => update('description', event.target.value)} />
                </label>
                <label className={fieldClass + ' sm:col-span-2'}>
                  {text('Notes','মন্তব্য')}{draft.entryType === 'Bank Adjustment' ? ' *' : ''}
                  <Input className="mt-1.5" value={draft.notes}
                    placeholder={draft.entryType === 'Bank Adjustment' ? text('Why does the bank balance need correction?','হিসাব কেন সংশোধন করছেন?') : text('Optional','ঐচ্ছিক')}
                    onChange={(event) => update('notes', event.target.value)} />
                </label>
                {isBackdated && (
                  <label className={fieldClass + ' sm:col-span-2'}>
                    {text('Reason for backdating','পেছনের তারিখের কারণ')} *
                    <Input className="mt-1.5" value={draft.backdatedReason}
                      onChange={(event) => update('backdatedReason', event.target.value)} />
                  </label>
                )}
                  </div>
                </div>
              </div>

              {bouncedCheque && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-warning/30 bg-warning/5 p-3">
                  <p className="max-w-[430px] text-[12px] text-ink-600">
                    {text('Returned cheques must be reversed from the original cheque to update customer/supplier dues. Manual bank posting is disabled for this type.','ফেরত চেক মূল চেক থেকে সংশোধন করতে হবে, যাতে পার্টির হিসাব ঠিক থাকে।')}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/app/finance')}>
                    {text('Open Cheques','চেক দেখুন')}
                  </Button>
                </div>
              )}
              {meta.cashMovement && (
                <div className="flex items-center gap-2 rounded-md border border-border bg-ink-50 px-3 py-2 text-[12px] text-ink-600">
                  <ArrowLeftRight className="size-4 text-teal-700" />
                  {draft.entryType === 'Cash Deposit' ? text('Cash Drawer → Bank','ক্যাশ থেকে ব্যাংকে') : text('Bank → Cash Drawer','ব্যাংক থেকে ক্যাশে')}
                  <span className="ml-auto text-[11px] text-ink-400">{text('Linked cash entry','ক্যাশের মিলিত এন্ট্রি')}</span>
                </div>
              )}
              <div className={inCounter ? 'flex justify-end gap-2' : 'flex flex-wrap justify-end gap-2 border-t border-border pt-3'}>
                <Button variant="outline" size="sm" onClick={() => { setDraft(emptyDraft(draft.bankAccountId)); setFormError(''); }}>
                  {text('Clear','মুছুন')}
                </Button>
                {!inCounter && (
                  <Button size="sm" disabled={saving || loading || !accounts.length || bouncedCheque} onClick={reviewEntry}>
                    {text('Review entry','এন্ট্রি যাচাই করুন')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>

        <aside className={inCounter
          ? 'h-fit rounded-xl border border-border bg-card p-4 xl:sticky xl:top-4'
          : 'rounded-lg border border-border bg-ink-50/40 p-3 sm:p-4'}>
          {inCounter ? (
            <>
              <h3 className="mb-3 text-sm font-semibold text-ink">{text('Transaction summary','লেনদেনের সারাংশ')}</h3>
              <p className="text-xs text-ink-500">{text('Total amount','মোট টাকা')}</p>
              <p className="text-2xl font-semibold text-ink" aria-live="polite">{taka(amount)}</p>
              <AmountInWordsDisplay amount={Math.max(0, amount)} />
              <div className="mt-4 space-y-2 border-t border-border pt-3 text-sm">
                <div className="flex justify-between gap-2"><span className="text-ink-500">{text('Bank account','ব্যাংক হিসাব')}</span><strong className="max-w-[60%] text-right">{selectedAccount?.name ?? '—'}</strong></div>
                <div className="flex justify-between gap-2"><span className="text-ink-500">{text('Entry type','এন্ট্রির ধরন')}</span><strong className="max-w-[60%] text-right">{meta.label}</strong></div>
                <div className="flex justify-between gap-2"><span className="text-ink-500">{text('Current balance','বর্তমান জের')}</span><strong>{taka(bankBalance)}</strong></div>
                <div className="flex justify-between gap-2 border-t border-border pt-2"><span className="text-ink-500">{text('Balance after','পরে জের')}</span><strong className={impact.bankDelta < 0 ? 'text-danger' : 'text-success'}>{taka(bankBalance + impact.bankDelta)}</strong></div>
                {meta.cashMovement && (
                  <div className="flex justify-between gap-2"><span className="text-ink-500">{text('Cash change','ক্যাশ পরিবর্তন')}</span><strong>{impact.cashDelta < 0 ? '−' : '+'}{taka(Math.abs(impact.cashDelta))}</strong></div>
                )}
              </div>
              {!connected && <p className="mt-3 text-xs text-ink-500">{text('Preview only; no real bank entry can be posted.','শুধু নমুনা; আসল ব্যাংক এন্ট্রি করা যাবে না।')}</p>}
              <Button className="mt-4 w-full" disabled={loading || saving || amount <= 0 || bouncedCheque || !accounts.length} onClick={reviewEntry}>
                {text('Review bank entry','ব্যাংক এন্ট্রি যাচাই করুন')}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
                <Landmark className="size-4 text-teal-700" /> {text('Balance preview','জেরের নমুনা')}
              </div>
              <p className="mt-1 text-[11px] text-ink-400">{selectedAccount?.name || text('Select bank account','ব্যাংক বাছুন')}</p>
              <p className={`mt-3 text-2xl font-semibold ${impact.bankDelta >= 0 ? 'text-success' : 'text-danger'}`}>
                {impact.bankDelta >= 0 ? '+' : '−'}{taka(Math.abs(impact.bankDelta))}
              </p>
              <div className="mt-3 divide-y divide-border border-t border-border">
                <div className="flex justify-between gap-3 py-2 text-[12px]"><span className="text-ink-500">{text('Current bank balance','বর্তমান ব্যাংক জের')}</span><strong>{taka(bankBalance)}</strong></div>
                <div className="flex justify-between gap-3 py-2 text-[12px]"><span className="text-ink-500">{text('After entry','এন্ট্রির পরে')}</span><strong>{taka(bankBalance + impact.bankDelta)}</strong></div>
                {meta.cashMovement && <div className="flex justify-between gap-3 py-2 text-[12px]"><span className="text-ink-500">{text('Cash movement','ক্যাশ পরিবর্তন')}</span><strong>{impact.cashDelta >= 0 ? '+' : '−'}{taka(Math.abs(impact.cashDelta))}</strong></div>}
                <div className="flex justify-between gap-3 py-2 text-[12px]"><span className="text-ink-500">{text('Entry category','এন্ট্রির ধরন')}</span><strong className="text-right">{meta.label}</strong></div>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
                {connected
                  ? text('Amounts are previews until Confirm & Record. Check bank ledger after posting.','নিশ্চিত করার আগে জের বদলাবে না।')
                  : text('These are sample account balances; no real ERP transaction is created.','নমুনা হিসাব দেখানো হচ্ছে; আসল লেনদেন হবে না।')}
              </p>
            </>
          )}
        </aside>
      </div>

      {!inCounter && connected && !!selectedAccount && (
        <section className="overflow-hidden rounded-lg border border-border" aria-label="Recent bank ledger">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-2 text-[12.5px] font-semibold text-ink">
              <BookOpen className="size-4 text-teal-700" /> {text('Recent Bank Ledger','সাম্প্রতিক ব্যাংক খাতা')}
            </div>
            <span className="text-[11px] text-ink-400">{selectedAccount.name}</span>
          </div>
          {ledgerError && <p role="alert" className="px-3 py-2 text-xs text-danger">{ledgerError}</p>}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[530px] text-left text-[12px]">
              <thead className="bg-ink-50 text-[11px] text-ink-500">
                <tr><th className="p-2.5">Date</th><th className="p-2.5">Type / Reference</th><th className="p-2.5 text-right">Money Out</th><th className="p-2.5 text-right">Money In</th><th className="p-2.5 text-right">Balance</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledger.slice(0, 8).map((item) => (
                  <tr key={item.entryId}>
                    <td className="p-2.5">{item.date}</td>
                    <td className="p-2.5"><span className="font-medium">{item.type}</span><span className="ml-2 text-ink-400">{item.reference}</span></td>
                    <td className="p-2.5 text-right text-danger">{item.debit ? taka(item.debit) : '—'}</td>
                    <td className="p-2.5 text-right text-success">{item.credit ? taka(item.credit) : '—'}</td>
                    <td className="p-2.5 text-right font-semibold">{taka(item.balance)}</td>
                  </tr>
                ))}
                {!ledger.length && <tr><td colSpan={5} className="p-5 text-center text-ink-400">{text('No bank entries found.','ব্যাংকের কোনো এন্ট্রি নেই।')}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Dialog open={inCounter && review} onOpenChange={(open) => { if (!open) setReview(false); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{text('Confirm bank entry','ব্যাংক এন্ট্রি নিশ্চিত করুন')}</DialogTitle>
            <DialogDescription>{text('Review the bank, amount and balance before recording.','সংরক্ষণের আগে ব্যাংক, টাকা ও জের মিলিয়ে নিন।')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-border bg-ink-50 p-4">
              <p className="text-xs text-ink-500">{text('Total amount','মোট টাকা')}</p>
              <p className="text-2xl font-semibold text-ink">{taka(amount)}</p>
              <AmountInWordsDisplay amount={Math.max(0, amount)} />
            </div>
            <div className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex justify-between gap-2"><span>{text('Bank account','ব্যাংক হিসাব')}</span><strong className="text-right">{selectedAccount?.name ?? '—'}</strong></div>
              <div className="flex justify-between gap-2"><span>{text('Entry type','এন্ট্রির ধরন')}</span><strong className="text-right">{meta.label}</strong></div>
              <div className="flex justify-between gap-2"><span>{text('Date','তারিখ')}</span><strong>{draft.date}</strong></div>
              <div className="flex justify-between gap-2"><span>{text('Reference','রেফারেন্স')}</span><strong>{draft.reference || '—'}</strong></div>
              <div className="flex justify-between gap-2 border-t border-border pt-2"><span>{text('Balance after','পরে জের')}</span><strong>{taka(bankBalance + impact.bankDelta)}</strong></div>
            </div>
            {!connected && <p role="status" className="text-xs text-ink-500">{text('Read-only preview. Connect the authenticated bank API to record a transaction.','শুধু নমুনা। আসল লেনদেনের জন্য ব্যাংক API সংযুক্ত করুন।')}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setReview(false)}>{text('Edit details','সংশোধন করুন')}</Button>
              <Button disabled={!connected || saving || bouncedCheque} onClick={() => { void submitEntry(); }}>
                <CheckCircle2 className="size-4" /> {saving ? text('Recording…','সংরক্ষণ হচ্ছে…') : text('Confirm & record','নিশ্চিত করে লিখুন')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
