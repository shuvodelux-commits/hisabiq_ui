import {reverseFinancePreview} from '../data/financePreviewStore';
import {useTenantSettings} from '../settings/TenantSettingsProvider';
import {sourceDeleteAuthority} from '../deletion/authority';
import {SourceDeleteAction} from '../deletion/SourceDeleteAction';
import { MotionTabList, MotionTabIndicator } from '../motion/MotionTabList';
import {matchesSearch as fuzzyMatch} from '../utils/fuzzySearch';
import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  Filter,
  Pencil,
  Power,
  RotateCcw,
  CircleDollarSign,
  Landmark,
  Plus,
  RefreshCw,
  Search,
  Settings,
  UserRoundCog,
  WalletCards
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/Dialog';
import { FormSelect } from '../components/FormSelect';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { CounterWorkspace } from '../components/finance/CounterWorkspace';
import { financePreviewRelationshipSummary, getFinancePreviewSnapshot, subscribeFinancePreview, updateFinancePreview } from '../data/financePreviewStore';
import { FinanceAccountActionDialog, FinancePeopleManagerDialog, FinanceTransactionActionDialog, FinanceTransferActionDialog, ConnectedMoneyAccountActionDialog, type ConnectedMoneyAccountSelection } from '../components/finance/FinanceRecordDialogs';
import { ChequeDialog } from '../components/finance/ChequeDialogs';
import { ChequeActionDialog } from '../components/finance/ChequeActionDialog';
import { CashSessionDetailsDialog } from '../components/finance/CashSessionDetailsDialog';
import { FinancePaymentSplitEditor, type FinancePaymentDraft } from '../components/finance/FinancePaymentSplitEditor';
import { financeAccountIdentityLabel, transferAccountId, transferAccountLabel } from '../utils/accountTransferIdentity';
import { normalizeFinancePaymentSplits, financePaymentSplitsAreValid, financePaymentDraftTotal } from '../utils/financePaymentDrafts';
import { StatusBadge } from '../components/StatusBadge';
import { RowActionMenu } from '../components/layout/RowActionMenu';
import { AnimatedAdvancedFilters } from '../components/layout/AnimatedAdvancedFilters';
import { ActionMenuItem, ActionMenuDivider } from '../components/layout/ActionMenu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { useCashSession } from '../contexts/CashSessionContext';
import { useSession } from '../integration/SessionProvider.tsx';
import { readMoneyAccounts, type ServerMoneyAccount, type ServerMoneyAccountList } from '../integration/accounts.ts';
import { ApiError } from '../integration/errors.ts';
import {
  accountTransfers as seedTransfers,
  cashSessions as sampleCashSessions,
  financePersonOptionLabel,
  financeAccounts as seedAccounts,
  financeTransactions as seedTransactions,
  type AccountTransfer,
  type FinanceAccount,
  type FinanceAccountType,
  type FinancePerson,
  type FinancePersonRole,
  type FinanceTransaction,
  type FinanceTransactionType,
  type CashSessionRecord
} from '../data/financeAccounts';
import { cheques as seedCheques, type ChequeRecord, type ChequeStatus } from '../data/cheques';
import { taka } from '../utils/currency';
import { chequeMoneyAccount, renameChequeAccountReferences } from '../utils/chequeAccount';
import {businessToday,formatDay} from '../utils/dateRange';
import { chequeLifecycleActions } from '../utils/moduleUiActions';
import { AmountInWordsDisplay } from '../components/AmountInWordsDisplay';
import {useUiCopy} from '../i18n/useUiCopy';
import {financeLabel} from '../i18n/financeCopy';

type Tab = 'overview' | 'transactions' | 'counter' | 'accounts' | 'cheques' | 'cash';

const financeTypeMeta: Record<FinanceTransactionType, {
  role?: FinancePersonRole;
  account?: FinanceTransaction['relationship'];
  direction: FinanceTransaction['direction'];
  opening?: boolean;
}> = {
  'Owner Credit': { role: 'Owner', account: 'Owner Balance', direction: 'in' },
  'Owner Debit': { role: 'Owner', account: 'Owner Balance', direction: 'out' },
  'Lender Credit': { role: 'Lender', account: 'Lender Balance', direction: 'in' },
  'Lender Debit': { role: 'Lender', account: 'Lender Balance', direction: 'out' },
  'Borrower Debit': { role: 'Borrower', account: 'Borrower Balance', direction: 'out' },
  'Borrower Credit': { role: 'Borrower', account: 'Borrower Balance', direction: 'in' },
  'Opening Owner Capital': { role: 'Owner', account: 'Owner Balance', direction: 'none', opening: true },
  'Opening Loan': { role: 'Lender', account: 'Lender Balance', direction: 'none', opening: true },
  'Opening Borrower Loan': { role: 'Borrower', account: 'Borrower Balance', direction: 'none', opening: true },
  'Manual Bank Entry': { direction: 'in' },
  Transfer: { direction: 'none' }
};

const financeTypeOptions: FinanceTransactionType[] = [
  'Lender Credit',
  'Lender Debit',
  'Borrower Debit',
  'Borrower Credit',
  'Owner Credit',
  'Owner Debit',
  'Opening Owner Capital',
  'Opening Loan',
  'Opening Borrower Loan'
];

function transactionTone(transaction: FinanceTransaction) {
  if (transaction.status === 'Reversed') return 'neutral' as const;
  if (transaction.direction === 'in') return 'success' as const;
  if (transaction.direction === 'out') return 'warning' as const;
  return 'info' as const;
}

function TransactionDialog({
  open,
  accounts,
  people,
  nextId,
  onOpenChange,
  onSave, onAddPerson, onUpdatePerson
}: {
  open: boolean;
  accounts: FinanceAccount[];
  people: FinancePerson[];
  nextId: string;
  onOpenChange: (open: boolean) => void;
  onSave: (transaction: FinanceTransaction) => void;
  onAddPerson: (person: FinancePerson) => void;
  onUpdatePerson: (person: FinancePerson) => void;
}) {
  const {text,language,showHelper}=useUiCopy();
  const [type, setType] = useState<FinanceTransactionType>('Lender Credit');
  const [personId, setPersonId] = useState(() => people.find(item => item.status === 'Active' && item.roles.includes('Lender'))?.id ?? '');
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [paymentRows, setPaymentRows] = useState<FinancePaymentDraft[]>([{
    id: 'finance-payment-1',
    method: 'Cash',
    accountId: accounts.find((item) => item.status === 'Active' && (item.type === 'Cash' || item.type === 'Petty Cash'))?.id ?? '',
    amount: ''
  }]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => businessToday());
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [backdateReason, setBackdateReason] = useState('');
  const [reviewFinance, setReviewFinance] = useState(false);
  useEffect(() => {
    if (open) {
      setDate(businessToday());
      setBackdateReason('');
    }
  }, [open]);
  useEffect(() => setReviewFinance(false), [type, personId, paymentRows, amount, date, reference, note, backdateReason, open, people]);

  const meta = financeTypeMeta[type];
  const rolePeople = people.filter((item) => item.status === 'Active' && (!meta.role || item.roles.includes(meta.role)));
  const isOpening = !!meta.opening;
  const selectedPerson = rolePeople.find((item) => item.id === personId);
  const isBackdated = date < businessToday();
  // For cash/bank transactions, payment sources are the single source of truth.
  // Opening balances have no payment sources and retain an editable amount.
  const transactionAmount = isOpening ? Number(amount) : financePaymentDraftTotal(paymentRows);
  const displayAmount = Number.isFinite(transactionAmount) ? transactionAmount : 0;
  const paymentSplits = normalizeFinancePaymentSplits(paymentRows, accounts, displayAmount);
  const paymentTotal = paymentSplits.reduce((sum, item) => sum + item.amount, 0);

  const save = () => {
    const value = transactionAmount;
    if (!Number.isFinite(value) || value <= 0) {
      toast.error(isOpening
        ? text('Enter an amount','টাকার পরিমাণ লিখুন')
        : text('Enter valid amounts in payment sources','টাকার মাধ্যমগুলোতে সঠিক টাকা লিখুন'));
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > businessToday()) {
      toast.error(text('Select today or an earlier valid date','আজ বা আগের সঠিক তারিখ দিন'));
      return;
    }
    if (isBackdated && !backdateReason.trim()) {
      toast.error(text('Backdated transactions require a reason','আগের তারিখের লেনদেনের কারণ লিখুন'));
      return;
    }
    if (!selectedPerson) {
      toast.error(text('Select a finance person','মালিক, ঋণদাতা বা ঋণগ্রহীতা বাছুন'));
      return;
    }
    if (!isOpening && !financePaymentSplitsAreValid(paymentRows, accounts, value)) {
      toast.error(text('Enter valid payment sources that add up to the transaction amount','সব মাধ্যমের সঠিক টাকা লিখুন। যোগফল লেনদেনের টাকার সমান হতে হবে।'));
      return;
    }
    if (!reviewFinance) {setReviewFinance(true);return;}
    const firstPayment = paymentSplits[0];

    onSave({
      id: nextId,
      date: formatDay(date),
      type,
      relationship: meta.account,
      party: selectedPerson.name,
      partyId: selectedPerson.id,
      method: isOpening ? undefined : firstPayment?.method,
      account: isOpening ? undefined : firstPayment?.account,
      accountId: isOpening ? undefined : firstPayment?.accountId,
      paymentAccounts: isOpening ? undefined : paymentSplits,
      amount: value,
      direction: meta.direction,
      reference: reference || undefined,
      note: [note, isBackdated ? `Backdate: ${backdateReason}` : ''].filter(Boolean).join(' · ') || undefined,
      status: 'Active',
      createdBy: 'Anisur Rahman'
    });
    onOpenChange(false);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{text("New finance transaction","নতুন টাকার লেনদেন")} {showHelper&&<span className="font-bn text-sm font-normal text-ink-500">ব্যবসার হিসাব</span>}</DialogTitle>
          <DialogDescription>
            {text('Owner, lender and borrower balances stay independent. Opening balances never move cash or bank money.','মালিক, ঋণদাতা ও ঋণগ্রহীতার হিসাব আলাদা থাকবে। শুরুর জের দিলে ক্যাশ বা ব্যাংকের টাকা বদলাবে না।')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-medium text-ink sm:col-span-2">
            {text('Transaction type','লেনদেনের ধরন')}
            <FormSelect className="mt-1.5" value={type} onChange={(event) => {
              const next = event.target.value as FinanceTransactionType;
              setType(next);
              const nextMeta = financeTypeMeta[next];
              const firstPerson = people.find((item) => item.status === 'Active' && (!nextMeta.role || item.roles.includes(nextMeta.role)));
              setPersonId(firstPerson?.id ?? '');
            }} options={financeTypeOptions.map(value=>({value,label:financeLabel(language,value)}))} />
            <span className="mt-1 block text-[11px] font-normal text-ink-400">
              {isOpening
                ? text('Opening balance only — no cash, bank or mobile banking movement.','শুধু শুরুর জের — ক্যাশ, ব্যাংক বা মোবাইলে টাকা সরবে না।')
                : meta.direction === 'in'
                  ? text('Money comes into the business.','ব্যবসায় টাকা আসবে।')
                  : text('Money goes out of the business.','ব্যবসা থেকে টাকা যাবে।')}
            </span>
          </label>

          <div className="min-w-0">
            <p id="finance-person-label" className="text-[13px] font-medium text-ink">{text('Finance person','হিসাবের ব্যক্তি')}</p>
            <div className="mt-1.5 flex min-w-0" role="group" aria-labelledby="finance-person-label">
              <FormSelect
                aria-label={text('Finance person','হিসাবের ব্যক্তি')}
                className="min-w-0 flex-1 [&>button]:rounded-r-none"
                value={selectedPerson?.id ?? ''}
                onChange={(event) => setPersonId(event.target.value)}
                options={rolePeople.map((item) => ({value: item.id, label: financePersonOptionLabel(item, rolePeople)}))}
              />
              <button type="button"
                aria-label={text('Manage people','ব্যক্তি যোগ / সংশোধন')}
                title={text('Manage people','ব্যক্তি যোগ / সংশোধন')}
                aria-haspopup="dialog"
                onClick={() => setPeopleOpen(true)}
                className="-ml-px flex h-9 w-11 shrink-0 items-center justify-center rounded-r-md border border-input bg-card text-teal-700 hover:bg-teal-50 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">
                <Settings className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <label className="text-[13px] font-medium text-ink">
            {text('Date','তারিখ')}
            <Input className="mt-1.5" type="date" max={businessToday()} value={date} onChange={(event) => setDate(event.target.value)} />
          </label>

          {isBackdated && (
            <label className="text-[13px] font-medium text-ink sm:col-span-2">
              {text('Reason for backdating','আগের তারিখ দেওয়ার কারণ')} <span className="text-danger">*</span>
              <Input className="mt-1.5" value={backdateReason} onChange={(event) => setBackdateReason(event.target.value)} placeholder={text("Why is this transaction being entered for an earlier date?","আগের তারিখ কেন ব্যবহার করছেন?")} />
            </label>
          )}

          {!isOpening && (
            <FinancePaymentSplitEditor
              accounts={accounts}
              rows={paymentRows}
              onChange={setPaymentRows}
              totalAmount={displayAmount}
            />
          )}

          <label className="text-[13px] font-medium text-ink">
            {text('Amount','টাকা')}
            {!isOpening && <span className="ml-1 text-[11px] font-normal text-ink-500">{text('· Auto total','· স্বয়ংক্রিয় মোট')}</span>}
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
              <Input value={isOpening ? amount : (Number.isFinite(transactionAmount) && transactionAmount > 0 ? String(transactionAmount) : '')}
                onChange={isOpening ? (event) => setAmount(event.target.value.replace(/[^\d.]/g, '')) : undefined}
                readOnly={!isOpening} className={'pl-7 text-right' + (!isOpening ? ' bg-ink-50/40' : '')}
                inputMode={isOpening ? 'decimal' : 'none'} placeholder="0" />
            </div>
          </label>

          <label className="text-[13px] font-medium text-ink">
            {text('Reference no.','নম্বর')}
            <Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} placeholder={text("Optional","ঐচ্ছিক")} />
          </label>

          <label className="text-[13px] font-medium text-ink sm:col-span-2">
            {text('Notes','মন্তব্য')}
            <Input className="mt-1.5" value={note} onChange={(event) => setNote(event.target.value)} placeholder={text("Optional internal note","মন্তব্য (ঐচ্ছিক)")} />
          </label>
        </div>

        <AmountInWordsDisplay amount={displayAmount} />
        {reviewFinance && <section role="status" className="space-y-1 rounded-lg border border-border bg-ink-50 p-3 text-sm">
          <p className="font-semibold">{text('Review finance transaction','লেনদেন যাচাই করুন')}</p>
          <p>{selectedPerson?.name} · {type} · {date}</p><p className="font-semibold">{taka(displayAmount)}</p><AmountInWordsDisplay amount={displayAmount} />
          <p>{text('Payment source total:','মাধ্যমগুলোর মোট:')} {taka(paymentTotal)} · {isOpening?text('Opening balance only','শুধু শুরুর জের'):text('Cash/bank movement','ক্যাশ/ব্যাংকে টাকা আসা-যাওয়া')}</p>
        </section>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{text('Cancel','বাতিল')}</Button>
          <Button onClick={save}>{reviewFinance?text('Confirm finance transaction','লেনদেন নিশ্চিত করুন'):text('Review transaction','লেনদেন যাচাই করুন')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <FinancePeopleManagerDialog open={open && peopleOpen} people={people} initialRole={meta.role} onOpenChange={setPeopleOpen}
      onAdd={(person) => { onAddPerson(person); setPersonId(person.id); setPeopleOpen(false); }} onUpdate={onUpdatePerson} />
    </>
  );
}

function AccountDialog({
  open, initialType = 'Bank',
  onOpenChange,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: FinanceAccount) => void;
  initialType?: FinanceAccountType;
}) {
  const {text,language,showHelper}=useUiCopy();
  const [type, setType] = useState<FinanceAccountType>(initialType);
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [number, setNumber] = useState('');
  const [opening, setOpening] = useState('');

  const save = () => {
    if (!name.trim()) {
      toast.error(text('Enter an account name','হিসাবের নাম লিখুন'));
      return;
    }
    const value = Number(opening);
    if (!Number.isFinite(value) || value < 0) {
      toast.error(text('Enter a valid opening balance','শুরুর জেরের সঠিক পরিমাণ লিখুন'));
      return;
    }
    const id = `acc-${Date.now()}`;
    onSave({
      id,
      name: name.trim(),
      type,
      institution: institution || undefined,
      number: number || undefined,
      openingBalance: value,
      balance: value,
      status: 'Active',
      lastActivity: 'Just now'
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{text("Add account","নতুন হিসাব যোগ করুন")} {showHelper&&<span className="font-bn text-sm font-normal text-ink-500">অ্যাকাউন্ট যোগ করুন</span>}</DialogTitle>
          <DialogDescription>{text('Cash, bank and mobile banking accounts share one simple account list.','ক্যাশ, ব্যাংক ও মোবাইল ব্যাংকিং সব একই তালিকায় থাকবে।')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-medium text-ink">
            {text('Account type','হিসাবের ধরন')}
            <FormSelect className="mt-1.5" value={type} onChange={(event) => setType(event.target.value as FinanceAccountType)} options={(['Cash', 'Petty Cash', 'Bank', 'Mobile Banking'] as const).map(value=>({value,label:financeLabel(language,value)}))} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Account name','হিসাবের নাম')}
            <Input className="mt-1.5" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. City Bank · 3812" />
          </label>
          {(type === 'Bank' || type === 'Mobile Banking') && (
            <>
              <label className="text-[13px] font-medium text-ink">
                {type === 'Bank' ? text('Bank name','ব্যাংকের নাম') : text('Provider','সেবাদাতা')}
                <Input className="mt-1.5" value={institution} onChange={(event) => setInstitution(event.target.value)} placeholder={type === 'Bank' ? 'Bank name' : 'bKash / Nagad / Rocket'} />
              </label>
              <label className="text-[13px] font-medium text-ink">
                {text('Account number','হিসাব নম্বর')}
                <Input className="mt-1.5" value={number} onChange={(event) => setNumber(event.target.value)} placeholder={text("Optional","ঐচ্ছিক")} />
              </label>
            </>
          )}
          <label className="text-[13px] font-medium text-ink sm:col-span-2">
            {text('Opening balance','শুরুর জের')}
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
              <Input value={opening} onChange={(event) => setOpening(event.target.value.replace(/[^\d.]/g, ''))} className="pl-7 text-right" inputMode="decimal" placeholder="0" />
            </div>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{text('Cancel','বাতিল')}</Button>
          <Button onClick={save}>{text('Save account','হিসাব সংরক্ষণ')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({
  open,
  accounts,
  nextId,
  initialFrom,
  onOpenChange,
  onSave
}: {
  open: boolean;
  accounts: FinanceAccount[];
  nextId: string;
  initialFrom?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (transfer: AccountTransfer) => void;
}) {
  const {text}=useUiCopy();
  const active = accounts.filter((item) => item.status === 'Active');
  const [from, setFrom] = useState(active[0]?.id ?? '');
  const [to, setTo] = useState(active[1]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [reviewTransfer, setReviewTransfer] = useState(false);
  React.useEffect(() => setReviewTransfer(false), [from, to, amount, reference, open]);

  React.useEffect(() => {
    if (!open) return;
    const preferred = active.find((item) => item.id === initialFrom)?.id ?? active[0]?.id ?? '';
    setFrom(preferred);
    const other = active.find((item) => item.id !== preferred)?.id ?? '';
    setTo(other);
    setAmount('');
    setReference('');
  }, [open, initialFrom]);

  const save = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      toast.error(text('Enter a transfer amount','কত টাকা সরাবেন লিখুন'));
      return;
    }
    const fromAccount = active.find((item) => item.id === from);
    const toAccount = active.find((item) => item.id === to);
    if (!fromAccount || !toAccount || fromAccount.id === toAccount.id) {
      toast.error(text('Choose two different accounts','দুটি আলাদা হিসাব বাছুন'));
      return;
    }
    if (!reviewTransfer) {setReviewTransfer(true);return;}
    onSave({
      id: nextId,
      date: '06 Oct 2026',
      from: fromAccount.name,
      to: toAccount.name,
      fromAccountId: fromAccount.id,
      toAccountId: toAccount.id,
      amount: value,
      reference: reference || undefined,
      status: 'Completed'
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{text('Transfer between accounts','এক হিসাব থেকে অন্য হিসাবে টাকা সরান')}</DialogTitle>
          <DialogDescription>{text('One transfer creates the matching money-out and money-in movement.','একটি ট্রান্সফারে এক হিসাব থেকে টাকা কমবে, অন্য হিসাবে যোগ হবে।')}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <label className="text-[13px] font-medium text-ink">
            {text('From account','যে হিসাব থেকে')}
            <FormSelect className="mt-1.5" value={from} onChange={(event) => setFrom(event.target.value)} options={active.map((item) => ({ value: item.id, label: financeAccountIdentityLabel(item, active) }))} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('To account','যে হিসাবে')}
            <FormSelect className="mt-1.5" value={to} onChange={(event) => setTo(event.target.value)} options={active.map((item) => ({ value: item.id, label: financeAccountIdentityLabel(item, active) }))} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Amount','টাকা')}
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
              <Input value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} className="pl-7 text-right" inputMode="decimal" placeholder="0" />
            </div>
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Reference / note','নম্বর / মন্তব্য')}
            <Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} placeholder={text("Optional","ঐচ্ছিক")} />
          </label>
        </div>

        <AmountInWordsDisplay amount={Number(amount)||0} />
        {reviewTransfer&&<div role="status" className="rounded-xl border border-border bg-ink-50 p-3 text-sm">
          <p className="font-semibold">{text('Check transfer before recording','টাকা সরানোর আগে হিসাব মিলিয়ে নিন')}</p>
          <p className="mt-1">{financeAccountIdentityLabel(active.find((item) => item.id === from) ?? active[0], active)} → {financeAccountIdentityLabel(active.find((item) => item.id === to) ?? active[1], active)}</p><p className="font-semibold">{taka(Number(amount)||0)}</p><AmountInWordsDisplay amount={Number(amount)||0} />
        </div>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{text('Cancel','বাতিল')}</Button>
          <Button onClick={save}>{reviewTransfer?text('Confirm transfer','টাকা সরানো নিশ্চিত করুন'):text('Review transfer','ট্রান্সফার যাচাই করুন')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FinancePreview({ counterOnly = false, moneyAccountsOnly = false }: { counterOnly?: boolean; moneyAccountsOnly?: boolean } = {}) {
  const {currentAuthority}=useTenantSettings();
  const {text,language,showHelper}=useUiCopy();
  const navigate = useNavigate();
  const { setOpen: setCashDialogOpen, sessionOpen, openingCash, expectedCash, lastCount, history, canView:canViewCash, canStart:canStartCash, canClose:canCloseCash, enabled:cashEnabled, startBlocked, mode: cashMode } = useCashSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeTab = searchParams.get('tab');
  const financeTabs: Tab[] = ['overview','transactions','cheques','cash'];
  const financeTab: Tab = financeTabs.includes(routeTab as Tab) ? routeTab as Tab : 'overview';
  const setTab = (nextTab: Tab) => setSearchParams(current => {
    const next = new URLSearchParams(current);
    if (nextTab === 'overview') next.delete('tab'); else next.set('tab', nextTab);
    return next;
  }, {replace: true});
  const tab: Tab = counterOnly ? 'counter' : moneyAccountsOnly ? 'accounts' : financeTab;
  // Existing saved Finance links remain usable after moving those destinations.
  useEffect(() => {
    if (counterOnly || moneyAccountsOnly) return;
    if (routeTab === 'accounts') navigate('/app/accounts?tab=money-accounts', { replace: true });
    else if (routeTab === 'counter') navigate('/app/counter', { replace: true });
  }, [routeTab, counterOnly, moneyAccountsOnly, navigate]);
  const { accounts, transactions, people } = useSyncExternalStore(subscribeFinancePreview, getFinancePreviewSnapshot);
  const relationshipSummary = financePreviewRelationshipSummary(transactions);
  const setAccounts: React.Dispatch<React.SetStateAction<FinanceAccount[]>> = (change) => updateFinancePreview('accounts', change);
  const setTransactions: React.Dispatch<React.SetStateAction<FinanceTransaction[]>> = (change) => updateFinancePreview('transactions', change);
  const setPeople: React.Dispatch<React.SetStateAction<FinancePerson[]>> = (change) => updateFinancePreview('people', change);
  const reversedTransfers=useRef(new Set<string>());
  const [transfers, setTransfers] = useState<AccountTransfer[]>(() => seedTransfers.map((transfer) => ({
    ...transfer,
    fromAccountId: transferAccountId(transfer, 'from', seedAccounts),
    toAccountId: transferAccountId(transfer, 'to', seedAccounts)
  })));
  const [chequeRecords, setChequeRecords] = useState<ChequeRecord[]>(seedCheques);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [chequeOpen, setChequeOpen] = useState(false);
  const [chequeAction, setChequeAction] = useState<ChequeRecord | null>(null);
  const [chequeActionMode, setChequeActionMode] = useState<'view' | 'edit'>('view');
  const [cashSessionAction, setCashSessionAction] = useState<CashSessionRecord | null>(null);
  const [transferFrom, setTransferFrom] = useState<string | undefined>(undefined);
  const [transactionAction, setTransactionAction] = useState<FinanceTransaction | null>(null);
  const [transactionActionMode, setTransactionActionMode] = useState<'view' | 'edit' | 'reverse'>('view');
  const [accountAction, setAccountAction] = useState<FinanceAccount | null>(null);
  const [accountActionMode, setAccountActionMode] = useState<'ledger' | 'edit' | 'manual' | 'status'>('ledger');
  const [transferAction, setTransferAction] = useState<AccountTransfer | null>(null);
  const [transferActionMode, setTransferActionMode] = useState<'view' | 'reverse'>('view');

  const openTransactionActions = (item: FinanceTransaction, mode: 'view' | 'edit' | 'reverse') => { setTransactionActionMode(mode); setTransactionAction(item); };
  const openAccountActions = (item: FinanceAccount, mode: 'ledger' | 'edit' | 'manual' | 'status') => { setAccountActionMode(mode); setAccountAction(item); };
  const openTransferActions = (item: AccountTransfer, mode: 'view' | 'reverse') => { setTransferActionMode(mode); setTransferAction(item); };
  const openChequeActions = (item: ChequeRecord, mode: 'view' | 'edit') => { setChequeActionMode(mode); setChequeAction(item); };
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All transaction types');
  const [loansFiltersOpen, setLoansFiltersOpen] = useState(false);
  const applyTransactionMovement = (list: FinanceAccount[], transaction: FinanceTransaction, factor = 1) => {
    if (transaction.direction === 'none' || transaction.status === 'Reversed') return list;
    const splits = transaction.paymentAccounts?.length
      ? transaction.paymentAccounts
      : transaction.accountId
        ? [{ method: transaction.method ?? 'Cash', account: transaction.account ?? '', accountId: transaction.accountId, amount: transaction.amount }]
        : [];
    return list.map((account) => {
      const movement = splits.filter((split) => split.accountId === account.id).reduce((sum, split) => sum + split.amount, 0);
      if (!movement) return account;
      const signed = transaction.direction === 'in' ? movement : -movement;
      return { ...account, balance: account.balance + signed * factor, lastActivity: 'Just now' };
    });
  };

  const updateFinanceTransaction = (updated: FinanceTransaction) => {
    const previous = transactions.find((item) => item.id === updated.id);
    if (!previous) return;
    setAccounts((current) => applyTransactionMovement(applyTransactionMovement(current, previous, -1), updated, 1));
    setTransactions((current) => current.map((item) => item.id === updated.id ? updated : item));
    setTransactionActionMode('view');
    setTransactionAction(updated);
    toast.success('Finance transaction updated', { description: updated.id });
  };

  const reverseFinanceTransaction = (transaction: FinanceTransaction, reason:string) => {
    const reversed=reverseFinancePreview(transaction.id,JSON.stringify(transaction),reason,currentAuthority());
    setTransactionActionMode('view');
    setTransactionAction(reversed);
    toast.success('Transaction reversed', { description: transaction.id + ' remains in the audit history' });
  };

  const updateFinanceAccount = (updated: FinanceAccount) => {
    const previous = accounts.find((item) => item.id === updated.id);
    setAccounts((current) => current.map((item) => item.id === updated.id ? updated : item));
    if (previous && previous.name !== updated.name) {
      setTransactions((current) => current.map((item) => ({
        ...item,
        account: item.accountId === updated.id ? updated.name : item.account,
        paymentAccounts: item.paymentAccounts?.map((split) => split.accountId === updated.id ? { ...split, account: updated.name } : split)
      })));
      setChequeRecords((current) => renameChequeAccountReferences(current, accounts, updated, previous.name));
    }
    setAccountActionMode('ledger');
    setAccountAction(updated);
    toast.success('Account updated', { description: updated.name });
  };

  const toggleFinanceAccount = (account: FinanceAccount) => {
    const updated = { ...account, status: account.status === 'Active' ? 'Inactive' as const : 'Active' as const };
    setAccounts((current) => current.map((item) => item.id === account.id ? updated : item));
    setAccountActionMode('ledger');
    setAccountAction(updated);
    toast.success(updated.status === 'Active' ? 'Account activated' : 'Account deactivated', { description: updated.name });
  };

  const addManualAccountEntry = (account: FinanceAccount, direction: 'in' | 'out', amount: number, reference?: string, note?: string) => {
    const transaction: FinanceTransaction = {
      id: 'FIN-M-' + String(Date.now()).slice(-6),
      date: '06 Oct 2026',
      type: 'Manual Bank Entry',
      method: account.type === 'Cash' || account.type === 'Petty Cash' ? 'Cash' : account.type === 'Bank' ? 'Bank' : 'Mobile Banking',
      account: account.name,
      accountId: account.id,
      amount,
      direction,
      reference,
      note,
      status: 'Active',
      createdBy: 'Anisur Rahman'
    };
    setTransactions((current) => [transaction, ...current]);
    setAccounts((current) => applyTransactionMovement(current, transaction, 1));
    setAccountActionMode('ledger');
    setAccountAction((current) => current && current.id === account.id
      ? { ...current, balance: current.balance + (direction === 'in' ? amount : -amount), lastActivity: 'Just now' }
      : current);
    toast.success('Manual account entry recorded', { description: (direction === 'in' ? '+' : '−') + taka(amount) });
  };

  const openTransfer = (account?: FinanceAccount) => {
    setTransferFrom(account?.id);
    setTransferOpen(true);
  };

  const updateCheque = (updated: ChequeRecord) => {
    setChequeRecords((current) => current.map((item) => item.id === updated.id ? updated : item));
    setChequeActionMode('view');
    setChequeAction(updated);
    toast.success('Cheque updated', { description: updated.id });
  };

  const changeChequeStatus = (cheque: ChequeRecord, nextStatus: ChequeStatus, reason?: string) => {
    const source = chequeRecords.find(item => item.id === cheque.id);
    if (!source || source.status !== cheque.status || !chequeLifecycleActions(source).some(action => action.nextStatus === nextStatus)) return false;
    const bankAccount = chequeMoneyAccount(accounts, cheque);
    if (nextStatus === 'Cleared' && !bankAccount) {
      toast.error(text('Choose a valid active bank account before clearing this cheque','চেক ক্লিয়ার করার আগে চালু ব্যাংক হিসাব বাছুন'));
      return false;
    }
    const updated: ChequeRecord = {
      ...cheque,
      status: nextStatus,
      depositAccountId: bankAccount?.id ?? cheque.depositAccountId,
      statusReason: reason,
      statusUpdatedAt: '2026-10-07T16:40:00+06:00',
      statusUpdatedBy: 'Shuvo'
    };
    setChequeRecords((current) => current.map((item) => item.id === cheque.id ? updated : item));
    if (nextStatus === 'Cleared' && cheque.status !== 'Cleared' && cheque.depositAccount) {
      setAccounts((current) => current.map((account) => account.id === bankAccount?.id
        ? { ...account, balance: account.balance + (cheque.direction === 'Received' ? cheque.amount : -cheque.amount), lastActivity: 'Just now' }
        : account));
    }
    setChequeActionMode('view');
    setChequeAction(updated);
    toast.success('Cheque status updated', { description: cheque.id + ' · ' + nextStatus });
    return true;
  };

  const reverseAccountTransfer = (transfer: AccountTransfer, reason:string) => {
    const audit=sourceDeleteAuthority(currentAuthority(),'money',transfer.id,reason);
    const live=transfers.find(t=>t.id===transfer.id);
    if(!live||JSON.stringify(live)!==JSON.stringify(transfer))throw Error('Transfer changed. Reopen source review.');
    if(!transferAccountId(transfer,'from',accounts)||!transferAccountId(transfer,'to',accounts))throw Error('Both original account identities are required.');
    if (transfer.status === 'Reversed'||reversedTransfers.current.has(transfer.id))throw Error('Transfer is already reversed.');
    reversedTransfers.current.add(transfer.id);
    const reversed = { ...transfer, status: 'Reversed' as const, reversal: audit };
    setTransfers((current) => current.map((item) => item.id === transfer.id ? reversed : item));
    setAccounts((current) => current.map((account) => {
      if (account.id === transferAccountId(transfer, 'from', accounts)) return { ...account, balance: account.balance + transfer.amount, lastActivity: 'Just now' };
      if (account.id === transferAccountId(transfer, 'to', accounts)) return { ...account, balance: account.balance - transfer.amount, lastActivity: 'Just now' };
      return account;
    }));
    setTransferActionMode('view');
    setTransferAction(reversed);
    toast.success('Transfer reversed', { description: transfer.id });
  };
  const totalLiquid = accounts.filter((item) => item.status === 'Active').reduce((sum, item) => sum + item.balance, 0);
  const cashBalance = accounts.filter((item) => (item.type === 'Cash' || item.type === 'Petty Cash') && item.status === 'Active').reduce((sum, item) => sum + item.balance, 0);
  const bankBalance = accounts.filter((item) => item.type === 'Bank' && item.status === 'Active').reduce((sum, item) => sum + item.balance, 0);
  const mobileBalance = accounts.filter((item) => item.type === 'Mobile Banking' && item.status === 'Active').reduce((sum, item) => sum + item.balance, 0);

  const filteredTransactions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((item) => {
      const matchesType = typeFilter === 'All transaction types' || item.type === typeFilter;
      const matchesQuery = fuzzyMatch(q,[item.id,item.party,item.type,item.account,item.reference,item.note]);
      return matchesType && matchesQuery;
    });
  }, [transactions, query, typeFilter]);

  const tabs: Array<[Tab, string, string]> = [
    ['overview', text('Overview','সারাংশ'), text('Money position and relationship balances','টাকা ও দেনা-পাওনার হিসাব')],
    ['transactions', text('Loans & Owners','ঋণ ও মালিক'), text('Owner, lender and borrower money','মালিক ও ঋণের হিসাব')],
    ['cheques', text('Cheques','চেক'), text('Received, issued and post-dated cheques','পাওয়া, দেওয়া ও ভবিষ্যৎ তারিখের চেক')],
    ['cash', text('Cash Sessions','ক্যাশ সেশন'), text('Open, close and reconcile cash drawer','ক্যাশ খোলা, বন্ধ ও মেলানো')]
  ];

  const pdcCount = chequeRecords.filter((item) => item.chequeDate > '2026-10-07' && !['Cleared', 'Cancelled', 'Returned', 'Stopped', 'Bounced'].includes(item.status)).length;
  const bouncedCount = chequeRecords.filter((item) => item.status === 'Bounced' || item.status === 'Returned').length;
  const cashSessions=canViewCash?[...history,...(cashMode==='preview'?sampleCashSessions:[])]:[];
  const varianceSessions = cashSessions.filter((item) => item.status === 'Closed' && (item.variance ?? 0) !== 0).length;

  const pendingChequeAmount = chequeRecords
    .filter((item) => !['Cleared', 'Cancelled', 'Returned', 'Stopped', 'Bounced'].includes(item.status))
    .reduce((sum, item) => sum + item.amount, 0);

  const summaryCards = [
    { label: text('Available money','ব্যবহারের টাকা'), value: taka(totalLiquid), sub: text('Cash + bank + mobile banking','ক্যাশ, ব্যাংক ও মোবাইল'), icon: CircleDollarSign },
    { label: text('Cash','ক্যাশ'), value: taka(cashBalance), sub: sessionOpen ? text('Cash session open','ক্যাশ সেশন চালু') : text('Cash session closed','ক্যাশ সেশন বন্ধ'), icon: Banknote },
    { label: text('Bank','ব্যাংক'), value: taka(bankBalance), sub: text('Across active bank accounts','চালু ব্যাংক হিসাবগুলোর মোট'), icon: Landmark },
    { label: text('Mobile banking','মোবাইল ব্যাংকিং'), value: taka(mobileBalance), sub: text('bKash, Nagad and wallets','বিকাশ, নগদ ও অন্যান্য ওয়ালেট'), icon: WalletCards },
    { label: text('Cheques pending','অপেক্ষমাণ চেক'), value: taka(pendingChequeAmount), sub: text('Waiting for clearance','চেকের টাকা জমা হয়নি'), icon: BookOpen },
    { label: text('Lender payable','ঋণদাতাকে দেনা'), value: taka(relationshipSummary.outstandingLoan), sub: text('Money we still need to repay','যত টাকা ফেরত দিতে হবে'), icon: ArrowDownLeft, tone: 'text-danger' },
    { label: text('Borrower receivable','ঋণগ্রহীতার কাছে পাওনা'), value: taka(relationshipSummary.borrowerReceivable), sub: text('Money others still owe us','অন্যের কাছে আমাদের পাওনা'), icon: ArrowUpRight, tone: 'text-teal-700' }
  ];

  return (
    <div className={moneyAccountsOnly ? 'space-y-0' : counterOnly ? 'mx-auto max-w-[1440px] space-y-4' : 'mx-auto max-w-[1440px] space-y-3 sm:space-y-4'}>
      {!moneyAccountsOnly && <PageHeader
        title={counterOnly ? 'Counter' : 'Finance'}
        titleBn={counterOnly ? 'কাউন্টার' : 'টাকা-পয়সা'}
        description={counterOnly ? 'Receive, pay, record expenses, transfer money and manage owner or loan transactions.' : 'Cash, bank, mobile banking, loans, cheques and everyday money movement.'}
        descriptionBn={counterOnly?'ক্রেতা-সরবরাহকারীর টাকা, খরচ, ট্রান্সফার এবং মালিক ও ঋণের হিসাব করুন।':'ক্যাশ, ব্যাংক, ঋণ, চেক ও দৈনিক টাকার হিসাব।'}
        actions={counterOnly ? undefined : (
          <>
            <Button variant="outline" size="sm" onClick={() => setPeopleOpen(true)}>
              <UserRoundCog className="size-4" /> {text('Finance people','হিসাবের ব্যক্তি')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setChequeOpen(true)}>
              <Plus className="size-4" /> {text('New cheque','নতুন চেক')}
            </Button>
            <Button size="sm" onClick={() => setTransactionOpen(true)}>
              <Plus className="size-4" /> {text('New transaction','নতুন লেনদেন')}
            </Button>
          </>
        )}
      />}

      {!counterOnly && !moneyAccountsOnly && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {summaryCards.map(({ label, value, sub, icon: Icon, tone }) => (
          <div key={label} data-finance-kpi="" className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12.5px] text-ink-500">{label}</p>
              <Icon className="size-4 text-helper" />
            </div>
            <p className={`mt-0.5 break-words text-base font-semibold sm:text-lg ${tone ?? 'text-ink'}`}>{value}</p>
            <p className="mt-0.5 text-[10.5px] text-ink-400">{sub}</p>
          </div>
        ))}
      </div>}

      {!counterOnly && !moneyAccountsOnly && (pdcCount > 0 || bouncedCount > 0 || varianceSessions > 0) && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-warning/20 bg-warning/5 p-3">
          <button onClick={() => setTab('cheques')} className="rounded-lg border border-warning/20 bg-card px-3 py-2 text-left hover:bg-warning/5">
            <p className="text-[12px] font-medium text-ink">{pdcCount} post-dated cheque{pdcCount === 1 ? '' : 's'}</p>
            <p className="font-bn text-[10.5px] text-ink-400">পরে জমা দেওয়ার চেক দেখুন</p>
          </button>
          {bouncedCount > 0 && <button onClick={() => setTab('cheques')} className="rounded-lg border border-danger/20 bg-card px-3 py-2 text-left hover:bg-danger/5"><p className="text-[12px] font-medium text-danger">{bouncedCount} cheque issue{bouncedCount === 1 ? '' : 's'}</p><p className="font-bn text-[10.5px] text-ink-400">Bounced / Returned চেক দেখুন</p></button>}
          {varianceSessions > 0 && <button onClick={() => setTab('cash')} className="rounded-lg border border-warning/20 bg-card px-3 py-2 text-left hover:bg-warning/5"><p className="text-[12px] font-medium text-ink">{varianceSessions} cash variance</p><p className="font-bn text-[10.5px] text-ink-400">Short / over যাচাই করুন</p></button>}
        </div>
      )}

      <div className={moneyAccountsOnly ? '' : 'rounded-xl border border-border bg-card shadow-card'}>
        {!counterOnly && !moneyAccountsOnly && <MotionTabList className="flex flex-nowrap gap-1 overflow-x-auto border-b border-border px-3 scrollbar-thin" role="tablist" aria-label="Finance sections"
          onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
            const current = buttons.findIndex((button) => document.activeElement === button);
            if (current < 0) return;
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
              : (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
            event.preventDefault();
            buttons[next]?.focus();
            setTab(tabs[next][0]);
          }}>
          {tabs.map(([id, label, helper]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              tabIndex={tab === id ? 0 : -1}
              title={helper}
              onClick={() => setTab(id)}
              className={`relative min-h-11 shrink-0 rounded-sm px-2.5 py-2.5 text-[13px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 ${
                tab === id ? 'text-ink' : 'text-ink-500 hover:text-ink'
              }`}>
              {label}
            <MotionTabIndicator active={tab === id} /></button>
          ))}
        </MotionTabList>}

        {tab === 'overview' && (
          <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-[1.25fr_1fr]">
            <section className="min-w-0 space-y-3">
              <div className="rounded-xl border border-border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Business relationship balances</p>
                    <p className="text-[11px] text-ink-500">Owner, lender and borrower balances never cross-net.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setTransactionOpen(true)}>
                    <Plus className="size-4" /> Add finance entry
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-px bg-ink-100 md:grid-cols-3">
                  {[
                    ['Owner capital', relationshipSummary.ownerCapital, 'Owner'],
                    ['Owner advance', relationshipSummary.ownerAdvance, 'Owner'],
                    ['Outstanding loan', relationshipSummary.outstandingLoan, 'Lender'],
                    ['Lender credit', relationshipSummary.lenderCredit, 'Lender'],
                    ['Borrower receivable', relationshipSummary.borrowerReceivable, 'Borrower'],
                    ['Borrower credit', relationshipSummary.borrowerCredit, 'Borrower']
                  ].map(([label, value, group]) => (
                    <div key={String(label)} className="bg-card p-3">
                      <p className="text-[11px] text-ink-400">{group}</p>
                      <p className="text-[12.5px] font-medium text-ink">{label}</p>
                      <p className="mt-1 text-base font-semibold text-ink">{taka(Number(value))}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2.5 sm:px-4 sm:py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Recent loans & owner money</p>
                    <p className="text-[11px] text-ink-500">Owner, lender and borrower money stays separate.</p>
                  </div>
                  <button onClick={() => setTab('transactions')} className="text-xs font-medium text-teal-700 hover:underline">View all</button>
                </div>
                <Table scrollRegionLabel={text('Recent loans and owner money','সাম্প্রতিক ঋণ ও মালিকের অর্থ')}>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-9 pl-4 text-xs">{text('Transaction','লেনদেন')}</TableHead>
                      <TableHead className="h-9 text-xs">{text('Party','পক্ষ')}</TableHead>
                      <TableHead className="h-9 text-xs">{text('Account','হিসাব')}</TableHead>
                      <TableHead className="h-9 pr-4 text-right text-xs">{text('Amount','টাকা')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 5).map((item) => (
                      <TableRow key={item.id} className="text-[13px]">
                        <TableCell className="py-2 pl-4">
                          <p className="font-medium text-ink">{item.type}</p>
                          <p data-table-helper="" className="text-[10.5px] text-ink-400">{item.date} · {item.id}</p>
                        </TableCell>
                        <TableCell className="py-2">{item.party ?? '—'}</TableCell>
                        <TableCell className="py-2 text-ink-500">{item.relationship ?? item.account ?? '—'}</TableCell>
                        <TableCell className={`py-2 pr-4 text-right font-semibold ${
                          item.direction === 'in' ? 'text-success' : item.direction === 'out' ? 'text-ink' : 'text-info'
                        }`}>
                          {item.direction === 'in' ? '+' : item.direction === 'out' ? '−' : ''}{taka(item.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            <section className="min-w-0 space-y-3">
              <div className="rounded-lg border border-border p-3 sm:p-4">
                <p className="text-sm font-semibold text-ink">Money Accounts</p>
                <p className="mb-3 text-[11px] text-ink-500">Live balances by money account.</p>
                <div className="space-y-2">
                  {accounts.filter((item) => item.status === 'Active').map((account) => (
                    <button
                      key={account.id}
                      onClick={() => setTab('accounts')}
                      className="flex w-full items-center gap-2.5 rounded-md border border-border px-2.5 py-2 text-left transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        {account.type === 'Cash' ? <Banknote className="size-4" /> : account.type === 'Bank' ? <Landmark className="size-4" /> : <WalletCards className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium text-ink">{account.name}</span>
                        <span className="block text-[10.5px] text-ink-400">{account.type} · {account.lastActivity}</span>
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-ink">{taka(account.balance)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 sm:p-4">
                <p className="text-sm font-semibold text-ink">Quick tools</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { label: 'Counter', helper: 'Receive / pay', icon: BriefcaseBusiness, action: () => navigate('/app/counter') },
                    { label: 'Transfer', helper: 'Between accounts', icon: ArrowLeftRight, action: () => setTransferOpen(true) },
                    { label: 'Reconcile', helper: 'Bank statement', icon: CheckCircle2, action: () => navigate('/app/reconciliation') },
                    { label: 'Daybook', helper: 'All transactions', icon: BookOpen, action: () => navigate('/app/daybook') }
                  ].map(({ label, helper, icon: Icon, action }) => (
                    <button key={label} onClick={action} className="min-h-12 rounded-md border border-border px-2.5 py-2 text-left transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                      <Icon className="size-4 text-teal-700" />
                      <p className="mt-2 text-[12.5px] font-medium text-ink">{label}</p>
                      <p className="text-[10.5px] text-ink-400">{helper}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'transactions' && (
          <>
            <div data-finance-loans-toolbar="" className="-mr-2 grid grid-cols-[minmax(0,1fr)_36px] items-center gap-2 border-b border-border p-3 lg:mr-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,270px)]">
              <div className="relative min-w-0 lg:max-w-md">
                <Search className="pointer-events-none absolute z-10 left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                <Input aria-label={text('Search finance transaction, party or reference','টাকার লেনদেন, নাম বা নম্বর খুঁজুন')}
                  value={query} onChange={(event) => setQuery(event.target.value)} className="pl-8"
                  placeholder={text('Search finance transaction, party or reference','লেনদেন, নাম বা নম্বর খুঁজুন')} />
              </div>
              <Button type="button" variant="outline" size="icon"
                aria-label={text('Advanced filters','আরও ফিল্টার') + (typeFilter !== 'All transaction types' ? ' (1)' : '')}
                aria-controls="finance-loans-advanced-filters" aria-expanded={loansFiltersOpen}
                onClick={() => setLoansFiltersOpen((open) => !open)}
                className={`relative size-9 shrink-0 rounded-md lg:hidden ${typeFilter === 'All transaction types' ? 'text-ink-500' : 'border-teal-500 text-teal-700'}`}>
                <Filter className="size-4" aria-hidden="true" />
                {typeFilter !== 'All transaction types' && <span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-teal-500" />}
              </Button>
              <div className="col-span-2 min-w-0 lg:col-span-1">
                <AnimatedAdvancedFilters id="finance-loans-advanced-filters" open={loansFiltersOpen} className="flex min-w-0 items-center gap-2">
                  <FormSelect aria-label={text('Finance transaction type','টাকার লেনদেনের ধরন')}
                    className="min-w-0 flex-1" value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)} options={['All transaction types', ...financeTypeOptions]} />
                  <Button type="button" variant="outline" size="icon"
                    aria-label={text('Reset filters','ফিল্টার মুছুন')} title={text('Reset all Finance filters','টাকার হিসাবের সব ফিল্টার মুছুন')}
                    onClick={() => {setQuery('');setTypeFilter('All transaction types');}}
                    className="size-9 shrink-0 rounded-md text-ink-500">
                    <RotateCcw className="size-4" aria-hidden="true" />
                  </Button>
                </AnimatedAdvancedFilters>
              </div>
            </div>

            <Table data-finance-loans-table="" scrollRegionLabel={text('Finance loans and owner transactions','ঋণ ও মালিকের লেনদেন')} className="w-full table-fixed lg:table-auto">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 min-w-0 pl-3 pr-1 text-xs lg:hidden">{text('Transaction','লেনদেন')}</TableHead>
                  <TableHead className="hidden h-9 pl-4 text-xs lg:table-cell">{text('Finance transaction','টাকার লেনদেন')}</TableHead>
                  <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Relationship','সম্পর্ক')}</TableHead>
                  <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Party','পক্ষ')}</TableHead>
                  <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Payment','পেমেন্ট')}</TableHead>
                  <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Account','হিসাব')}</TableHead>
                  <TableHead className="h-9 w-[112px] pr-1 text-right text-xs sm:w-[128px] lg:w-auto lg:pr-2">{text('Amount','টাকা')}</TableHead>
                  <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Status','অবস্থা')}</TableHead>
                  <TableHead className="sticky right-0 z-10 h-9 w-[44px] border-l border-border bg-card px-1 text-right text-xs lg:w-14 lg:pr-2"><span className="sr-only lg:not-sr-only">{text('Action','কাজ')}</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((item) => (
                  <TableRow key={item.id} className="text-[13px]">
                    <TableCell data-finance-loans-identity="" className="min-w-0 py-2 pl-3 pr-1 lg:hidden">
                      <span data-finance-loans-ref="" className="block break-all text-[12px] font-semibold leading-tight text-teal-700">{item.id}</span>
                      <span className="mt-0.5 block text-[11px] font-medium leading-tight text-ink">{financeLabel(language,item.type)}</span>
                      <span className="mt-0.5 block truncate text-[10.5px] text-ink-500">{item.date} · {item.party ?? '—'}</span>
                    </TableCell>
                    <TableCell className="hidden py-2 pl-4 lg:table-cell">
                      <p className="font-medium text-ink">{item.type}</p>
                      <p data-table-helper="" className="text-[10.5px] text-ink-400">{item.date} · {item.id}{item.reference ? ` · ${item.reference}` : ''}</p>
                    </TableCell>
                    <TableCell className="hidden py-2 text-ink-600 lg:table-cell">{item.relationship ?? '—'}</TableCell>
                    <TableCell className="hidden py-2 font-medium text-ink lg:table-cell">{item.party ?? '—'}</TableCell>
                    <TableCell className="hidden py-2 text-ink-500 lg:table-cell">{item.paymentAccounts && item.paymentAccounts.length > 1 ? 'Multiple' : item.method ?? 'No money movement'}</TableCell>
                    <TableCell className="hidden py-2 text-ink-500 lg:table-cell">{item.paymentAccounts && item.paymentAccounts.length > 1 ? item.paymentAccounts.map((split) => split.account).join(' + ') : item.account ?? '—'}</TableCell>
                    <TableCell data-finance-loans-amount="" className={`w-[112px] py-2 pr-1 text-right font-semibold sm:w-[128px] lg:w-auto lg:pr-2 ${
                      item.direction === 'in' ? 'text-success' : item.direction === 'out' ? 'text-ink' : 'text-info'
                    }`}>
                      <span className="whitespace-nowrap text-[12px] lg:text-[13px]">{item.direction === 'in' ? '+' : item.direction === 'out' ? '−' : ''}{taka(item.amount)}</span>
                      <span data-finance-loans-status="" className="mt-0.5 block text-[10.5px] font-normal text-ink-500 lg:hidden">{financeLabel(language,item.status)}</span>
                    </TableCell>
                    <TableCell className="hidden py-2 lg:table-cell"><StatusBadge tone={transactionTone(item)} dot>{financeLabel(language,item.status)}</StatusBadge></TableCell>
                    <TableCell className="sticky right-0 z-10 w-[44px] border-l border-border bg-card px-1 py-1 text-right lg:w-14 lg:py-1.5 lg:pr-2">
                      <RowActionMenu label={text('Actions for','কাজ') + ' ' + item.id}>
                        {close => <>
                          <ActionMenuItem icon={Eye} onClick={() => { close(); openTransactionActions(item, 'view'); }}>{text('View transaction','লেনদেন দেখুন')}</ActionMenuItem>
                          {item.status === 'Active' && <>
                            <ActionMenuItem icon={Pencil} onClick={() => { close(); openTransactionActions(item, 'edit'); }}>{text('Edit','সংশোধন')}</ActionMenuItem>
                            <ActionMenuDivider />
                            <ActionMenuItem icon={RotateCcw} tone="destructive" onClick={() => { close(); openTransactionActions(item, 'reverse'); }}>{text('Review reversal','উল্টো করা যাচাই')}</ActionMenuItem>
                          </>}<SourceDeleteAction kind="immutable" onReview={item.status==='Active'?()=>{close();openTransactionActions(item,'reverse');}:undefined}/>
                        </>}
                      </RowActionMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredTransactions.length === 0 && (
              <div data-finance-loans-empty="" className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-4">
                <p className="text-[12px] text-ink-500">{text('No matching finance transactions.','এই ফিল্টারে কোনো লেনদেন পাওয়া যায়নি।')}</p>
                <Button variant="outline" size="sm" onClick={() => {setQuery('');setTypeFilter('All transaction types');}}>{text('Clear filters','ফিল্টার মুছুন')}</Button>
              </div>
            )}
          </>
        )}

        {tab === 'counter' && <CounterWorkspace accounts={accounts} setAccounts={setAccounts} onNewFinanceTransaction={() => setTransactionOpen(true)} onTransfer={({ fromAccountId, toAccountId, amount, date, reference }) => {
          const fromAccount = accounts.find((account) => account.id === fromAccountId);
          const toAccount = accounts.find((account) => account.id === toAccountId);
          if (!fromAccount || !toAccount) return;
          setTransfers((current) => [{
            id: `TRF-${String(42 + current.length - seedTransfers.length).padStart(6, '0')}`,
            date: formatDay(date),
            from: fromAccount.name,
            to: toAccount.name,
            fromAccountId,
            toAccountId,
            amount,
            reference,
            status: 'Completed',
          }, ...current]);
        }} />}

        {tab === 'accounts' && (
          <div className="p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[13px] font-medium text-ink">{text('Money accounts','টাকার হিসাব')}</p>
                <p className="text-[11px] text-ink-500">{text('Cash, bank and mobile banking with opening balance and ledger access.','ক্যাশ, ব্যাংক ও মোবাইল হিসাবের জের ও লেনদেন দেখুন।')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openTransfer()}>
                  <ArrowLeftRight className="size-4" /> {text('Transfer','ট্রান্সফার')}
                </Button>
                <Button size="sm" onClick={() => setAccountOpen(true)}>
                  <Plus className="size-4" /> {text('Add account','হিসাব যোগ করুন')}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {accounts.map((account) => (
                <div key={account.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      {account.type === 'Cash' ? <Banknote className="size-4" /> : account.type === 'Bank' ? <Landmark className="size-4" /> : <WalletCards className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">{account.name}</p>
                      <p className="text-[10.5px] text-ink-400">{financeLabel(language,account.type)}{account.number ? ` · ${account.number}` : ''}</p>
                    </div>
                    <StatusBadge tone={account.status === 'Active' ? 'success' : 'neutral'} dot>{financeLabel(language,account.status)}</StatusBadge>
                  </div>

                  <p className="mt-4 text-2xl font-semibold text-ink">{taka(account.balance)}</p>
                  <div className="mt-1 flex items-center justify-between text-[10.5px] text-ink-400">
                    <span>{text('Opening','শুরুর জের')} {taka(account.openingBalance)}</span>
                    <span>{account.lastActivity}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                    <Button variant="outline" size="sm" onClick={() => openAccountActions(account, 'ledger')}>
                      <BookOpen className="size-4" /> {text('Ledger','খাতা')}
                    </Button>
                    {account.type !== 'Cash' && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/app/reconciliation?account=${encodeURIComponent(account.name)}`)}>
                        <CheckCircle2 className="size-4" /> {text('Reconcile','মিলিয়ে দেখুন')}
                      </Button>
                    )}
                    {(account.type === 'Bank' || account.type === 'Mobile Banking') && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/app/accounts?tab=bank-entry&accountId=${encodeURIComponent(account.id)}`)}>
                        <Landmark className="size-4" /> {text('Bank Entry','ব্যাংক এন্ট্রি')}
                      </Button>
                    )}
                    <RowActionMenu label={text('Actions for','কাজ') + ' ' + account.name} className="ml-auto inline-block" width={230}>
                      {close => <>
                        <ActionMenuItem icon={BookOpen} onClick={() => { close(); openAccountActions(account, 'ledger'); }}>{text('View ledger','খাতা দেখুন')}</ActionMenuItem>
                        <ActionMenuItem icon={Pencil} onClick={() => { close(); openAccountActions(account, 'edit'); }}>{text('Edit account','হিসাব সংশোধন')}</ActionMenuItem>
                        <ActionMenuItem icon={Banknote} onClick={() => { close(); openAccountActions(account, 'manual'); }}>{text('Money in / out','টাকা আসা / যাওয়া')}</ActionMenuItem>
                        <ActionMenuItem icon={ArrowLeftRight} onClick={() => { close(); openTransfer(account); }}>{text('Transfer','টাকা স্থানান্তর')}</ActionMenuItem>
                        {account.type !== 'Cash' && <ActionMenuItem icon={RefreshCw} onClick={() => { close(); navigate(`/app/reconciliation?account=${encodeURIComponent(account.name)}`); }}>{text('Reconcile','মিলিয়ে দেখুন')}</ActionMenuItem>}
                        <ActionMenuDivider />
                        <ActionMenuItem icon={Power} tone={account.status === 'Active' ? 'destructive' : 'neutral'} onClick={() => { close(); openAccountActions(account, 'status'); }}>{text(account.status === 'Active' ? 'Deactivate' : 'Activate', account.status === 'Active' ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন')}</ActionMenuItem><SourceDeleteAction kind="setup"/>
                      </>}
                    </RowActionMenu>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-border">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{text('Transfer history','ট্রান্সফারের ইতিহাস')}</p>
                  <p className="text-[11px] text-ink-500">{text('Transfers between business money accounts.','ব্যবসার এক হিসাব থেকে অন্য হিসাবে টাকা সরানোর ইতিহাস।')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openTransfer()}>
                  <Plus className="size-4" /> {text('New transfer','নতুন ট্রান্সফার')}
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 pl-4 text-xs">{text('Transfer','ট্রান্সফার')}</TableHead>
                    <TableHead className="h-9 text-xs">{text('From','থেকে')}</TableHead>
                    <TableHead className="h-9 text-xs">{text('To','যে হিসাবে')}</TableHead>
                    <TableHead className="h-9 text-right text-xs">{text('Amount','টাকা')}</TableHead>
                    <TableHead className="h-9 text-xs">{text('Status','অবস্থা')}</TableHead>
                    <TableHead className="sticky right-0 z-10 h-9 w-14 min-w-14 border-l border-border bg-card pr-2 text-right text-xs">{text('Action','কাজ')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((item) => (
                    <TableRow key={item.id} className="text-[13px]">
                      <TableCell className="py-2 pl-4">
                        <p className="font-medium text-ink">{item.id}</p>
                        <p data-table-helper="" className="text-[10.5px] text-ink-400">{item.date}{item.reference ? ` · ${item.reference}` : ''}</p>
                      </TableCell>
                      <TableCell className="py-2">{transferAccountLabel(item, 'from', accounts)}</TableCell>
                      <TableCell className="py-2">{transferAccountLabel(item, 'to', accounts)}</TableCell>
                      <TableCell className="py-2 text-right font-semibold">{taka(item.amount)}</TableCell>
                      <TableCell className="py-2"><StatusBadge tone={item.status === 'Completed' ? 'success' : 'neutral'} dot>{financeLabel(language,item.status)}</StatusBadge></TableCell>
                      <TableCell className="sticky right-0 z-10 w-14 min-w-14 border-l border-border bg-card py-1.5 pr-2 text-right">
                        <RowActionMenu label={text('Actions for','কাজ') + ' ' + item.id}>
                          {close => <>
                            <ActionMenuItem icon={Eye} onClick={() => { close(); openTransferActions(item, 'view'); }}>{text('View transfer','ট্রান্সফার দেখুন')}</ActionMenuItem>
                            {item.status === 'Completed' && <>
                              <ActionMenuDivider />
                              <ActionMenuItem icon={RotateCcw} tone="destructive" onClick={() => { close(); openTransferActions(item, 'reverse'); }}>{text('Review reversal','উল্টো করা যাচাই')}</ActionMenuItem>
                            </>}<SourceDeleteAction kind="immutable" onReview={item.status==='Completed'?()=>{close();openTransferActions(item,'reverse');}:undefined}/>
                          </>}
                        </RowActionMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}


        {tab === 'cheques' && (
          <div className="p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[13px] font-medium text-ink">{text('Cheque register','চেকের তালিকা')} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· পাওয়া ও দেওয়া চেক</span>}</p>
                <p className="text-[11px] text-ink-500">{text('Post-dated cheques stay visible. Bank balance changes only when a cheque clears.','ভবিষ্যৎ তারিখের চেক দেখা যাবে। ক্লিয়ার হলেই ব্যাংকের টাকা বদলাবে।')}</p>
              </div>
              <Button size="sm" onClick={() => setChequeOpen(true)}><Plus className="size-4" /> {text('New cheque','নতুন চেক')}</Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 pl-4 text-xs">{text('Cheque','চেক')}</TableHead>
                    <TableHead className="h-9 text-xs">{text('Party','পক্ষ')}</TableHead>
                    <TableHead className="h-9 text-xs">{text('Bank','ব্যাংক')}</TableHead>
                    <TableHead className="h-9 text-xs">{text('Cheque date','চেকের তারিখ')}</TableHead>
                    <TableHead className="h-9 text-xs">{text('Money account','টাকার হিসাব')}</TableHead>
                    <TableHead className="h-9 text-right text-xs">{text('Amount','টাকা')}</TableHead>
                    <TableHead className="h-9 text-xs">{text('Status','অবস্থা')}</TableHead>
                    <TableHead className="sticky right-0 z-10 h-9 w-14 min-w-14 border-l border-border bg-card pr-2 text-right text-xs">{text('Action','কাজ')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chequeRecords.map((cheque) => {
                    const pdc = cheque.chequeDate > '2026-10-07' && cheque.status !== 'Cleared';
                    return (
                      <TableRow key={cheque.id} className="text-[13px]">
                        <TableCell className="py-2 pl-4">
                          <p className="font-medium text-ink">{financeLabel(language,cheque.direction)} · #{cheque.chequeNumber}</p>
                          <p data-table-helper="" className="text-[10.5px] text-ink-400">{cheque.id}{pdc ? ' · PDC' : ''}{cheque.reference ? ' · ' + cheque.reference : ''}</p>
                        </TableCell>
                        <TableCell className="py-2 font-medium text-ink">{cheque.party}</TableCell>
                        <TableCell className="py-2 text-ink-500">{cheque.bank}{cheque.branch ? ' · ' + cheque.branch : ''}</TableCell>
                        <TableCell className="py-2">
                          <p className="text-ink-600">{cheque.chequeDate}</p>
                          {pdc && <p data-table-helper="" className="font-bn text-[10.5px] text-warning">{text('Post-dated cheque','ভবিষ্যৎ তারিখের চেক')}</p>}
                        </TableCell>
                        <TableCell className="py-2 text-ink-500">{cheque.depositAccount || '—'}</TableCell>
                        <TableCell className="py-2 text-right font-semibold">{taka(cheque.amount)}</TableCell>
                        <TableCell className="py-2"><StatusBadge tone={cheque.status === 'Cleared' ? 'success' : cheque.status === 'Bounced' ? 'danger' : pdc ? 'warning' : 'neutral'} dot>{financeLabel(language,cheque.status)}</StatusBadge></TableCell>
                        <TableCell className="sticky right-0 z-10 w-14 min-w-14 border-l border-border bg-card py-1.5 pr-2 text-right">
                          <RowActionMenu label={text('Actions for','কাজ') + ' ' + cheque.id}>
                            {close => <>
                              <ActionMenuItem icon={Eye} onClick={() => { close(); openChequeActions(cheque, 'view'); }}>{text('View cheque','চেক দেখুন')}</ActionMenuItem>
                              {chequeLifecycleActions(cheque).length > 0 && <ActionMenuItem icon={Pencil} onClick={() => { close(); openChequeActions(cheque, 'edit'); }}>{text('Edit cheque','চেক সংশোধন')}</ActionMenuItem>}<SourceDeleteAction reason="Cheque history is retained. Use the eligible cheque lifecycle correction; deletion is not connected."/>
                            </>}
                          </RowActionMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {tab === 'cash' && (
          <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <section className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{text('Current cash session','বর্তমান ক্যাশ সেশন')}</p>
                  <p className="text-[11px] text-ink-500">{text('Drawer accountability without manufacturing balancing entries.','ক্যাশ গুনে মিলান। পার্থক্যের জন্য নিজে থেকে নতুন লেনদেন হবে না।')}</p>
                </div>
                <StatusBadge tone={sessionOpen ? 'success' : 'neutral'} dot>{sessionOpen ? financeLabel(language,'Open') : financeLabel(language,'Closed')}</StatusBadge>
              </div>

              {sessionOpen ? (
                <>
                  <div className="mt-4 rounded-lg bg-ink-50 p-3">
                    <p className="text-[11px] text-ink-400">{text('Current preview session · resets on reload','নমুনা ক্যাশ সেশন · পাতা রিলোড করলে রিসেট হবে')}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10.5px] text-ink-400">{text('Opening cash','শুরুর ক্যাশ')}</p>
                        <p className="text-sm font-semibold text-ink">{taka(openingCash)}</p>
                      </div>
                      <div>
                        <p className="text-[10.5px] text-ink-400">{text('Expected now','এখন থাকার কথা')}</p>
                        <p className="text-sm font-semibold text-ink">{taka(expectedCash)}</p>
                      </div>
                    </div>
                  </div>
                  <Button disabled={!canViewCash} className="mt-3 w-full" onClick={() => setCashDialogOpen(true)}>{text('Count / close cash session','ক্যাশ গুনুন / সেশন বন্ধ করুন')}</Button>
                </>
              ) : (
                <Button disabled={!canStartCash||startBlocked} className="mt-4 w-full" onClick={() => setCashDialogOpen(true)}>{text('Start cash session','ক্যাশ সেশন শুরু করুন')}</Button>
              )}

              {(!cashEnabled||!canViewCash||startBlocked||!canCloseCash)&&<p role="status" className="mt-3 text-xs text-warning">{!cashEnabled?text('Cash sessions are disabled in Settings.','সেটিংসে ক্যাশ সেশন বন্ধ রয়েছে।'):!canViewCash?text('Cash session view permission is required.','ক্যাশ সেশন দেখার অনুমতি প্রয়োজন।'):startBlocked?text('This business date is closed; preview cannot reopen it.','এই ব্যবসার দিন বন্ধ; নমুনায় আবার খোলা যাবে না।'):text('Cash count / close permission is required.','ক্যাশ গোনা / বন্ধ করার অনুমতি প্রয়োজন।')}</p>}
              {lastCount&&<p className="mt-3 text-xs text-ink-600" role="status">{text('Last count:','শেষ গুনেছেন:')} {taka(lastCount.counted)} · {lastCount.closed?financeLabel(language,'Closed'):text('Saved','সংরক্ষিত')}{lastCount.note?' · '+lastCount.note:''}</p>}
              <button disabled={!canViewCash} onClick={() => setCashDialogOpen(true)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-ink-600 hover:bg-ink-50">
                <RefreshCw className="size-3.5" /> {text('Cash reconciliation','ক্যাশ মিলানো')}
              </button>
            </section>

            <section className="min-w-0 rounded-xl border border-border">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-ink">{text('Cash session history','ক্যাশ সেশনের ইতিহাস')}</p>
                <p className="text-[11px] text-ink-500">{text('Expected vs counted cash, with short/over variance kept visible.','হিসাবে থাকার কথা ও গুনে পাওয়া ক্যাশের পার্থক্য দেখা যাবে।')}</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 pl-4 text-xs">{text('Session','সেশন')}</TableHead>
                    <TableHead className="h-9 text-xs">{text('Opened / closed','খোলা / বন্ধ')}</TableHead>
                    <TableHead className="h-9 text-right text-xs">{text('Opening','শুরুর জের')}</TableHead>
                    <TableHead className="h-9 text-right text-xs">{text('Expected','থাকার কথা')}</TableHead>
                    <TableHead className="h-9 text-right text-xs">{text('Counted','গুনে পাওয়া')}</TableHead>
                    <TableHead className="h-9 text-right text-xs">{text('Variance','পার্থক্য')}</TableHead>
                    <TableHead className="h-9 text-xs">{text('Status','অবস্থা')}</TableHead>
                    <TableHead className="sticky right-0 z-10 h-9 w-14 min-w-14 border-l border-border bg-card pr-2 text-right text-xs">{text('Action','কাজ')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashSessions.map((session) => (
                    <TableRow key={session.id} className="text-[13px]">
                      <TableCell className="py-2 pl-4">
                        <p className="font-medium text-ink">{session.id}</p><p className="text-[11px] text-ink-500">{session.preview?text('Current preview','বর্তমান নমুনা'):text('Sample history','নমুনা ইতিহাস')}</p>
                        <p data-table-helper="" className="text-[10.5px] text-ink-400">{session.date}</p>
                      </TableCell>
                      <TableCell className="py-2 text-ink-500">{session.openedAt}{session.closedAt ? ` → ${session.closedAt}` : ' → now'}</TableCell>
                      <TableCell className="py-2 text-right">{taka(session.openingCash)}</TableCell>
                      <TableCell className="py-2 text-right">{taka(session.expectedCash)}</TableCell>
                      <TableCell className="py-2 text-right">{session.countedCash === undefined ? '—' : taka(session.countedCash)}</TableCell>
                      <TableCell className={`py-2 text-right font-medium ${
                        !session.variance ? 'text-success' : session.variance < 0 ? 'text-danger' : 'text-warning'
                      }`}>
                        {session.variance === undefined ? '—' : session.variance === 0 ? taka(0) : `${session.variance > 0 ? '+' : '−'}${taka(Math.abs(session.variance))}`}
                      </TableCell>
                      <TableCell className="py-2">
                        <StatusBadge tone={session.status === 'Open' ? 'success' : session.variance ? 'warning' : 'neutral'} dot>{financeLabel(language,session.status)}</StatusBadge>
                      </TableCell>
                      <TableCell className="sticky right-0 z-10 w-14 min-w-14 border-l border-border bg-card py-1.5 pr-2 text-right">
                        <RowActionMenu label={text('Actions for','কাজ') + ' ' + session.id}>
                          {close => <>
                            <ActionMenuItem icon={Eye} onClick={() => { close(); setCashSessionAction(session); }}>{text('View cash session','ক্যাশ সেশন দেখুন')}</ActionMenuItem>
                            <ActionMenuItem icon={RefreshCw} onClick={() => { close(); navigate(`/app/reconciliation?account=${encodeURIComponent('Main Cash Counter')}&session=${encodeURIComponent(session.id)}`); }}>{text('Reconcile','মিলিয়ে দেখুন')}</ActionMenuItem><SourceDeleteAction kind="immutable"/>
                          </>}
                        </RowActionMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          </div>
        )}
      </div>

      <TransactionDialog
        open={transactionOpen}
        accounts={accounts}
        people={people}
        onAddPerson={person => setPeople(current => [...current, person])}
        onUpdatePerson={person => {setPeople(current => current.map(item => item.id === person.id ? person : item)); setTransactions(current => current.map(item => item.partyId === person.id ? {...item, party:person.name} : item));}}
        nextId={`FIN-${String(189 + transactions.length - seedTransactions.length).padStart(6, '0')}`}
        onOpenChange={setTransactionOpen}
        onSave={(transaction) => {
          setTransactions((current) => [transaction, ...current]);
          setAccounts((current) => applyTransactionMovement(current, transaction, 1));
          toast.success('Finance transaction saved', { description: transaction.type + ' · ' + taka(transaction.amount) });
        }}
      />

      <AccountDialog
        open={accountOpen}
        onOpenChange={setAccountOpen}
        onSave={(account) => {
          setAccounts((current) => [...current, account]);
          toast.success('Account added', { description: account.name });
        }}
      />

      <TransferDialog
        open={transferOpen}
        initialFrom={transferFrom}
        accounts={accounts}
        nextId={`TRF-${String(42 + transfers.length - seedTransfers.length).padStart(6, '0')}`}
        onOpenChange={setTransferOpen}
        onSave={(transfer) => {
          setTransfers((current) => [transfer, ...current]);
          setAccounts((current) => current.map((account) => {
            if (account.id === transfer.fromAccountId) return { ...account, balance: account.balance - transfer.amount, lastActivity: 'Just now' };
            if (account.id === transfer.toAccountId) return { ...account, balance: account.balance + transfer.amount, lastActivity: 'Just now' };
            return account;
          }));
          toast.success('Transfer completed', { description: transferAccountLabel(transfer, 'from', accounts) + ' → ' + transferAccountLabel(transfer, 'to', accounts) + ' · ' + taka(transfer.amount) });
        }}
      />

      <ChequeDialog
        open={chequeOpen}
        accountOptions={accounts.filter((item) => item.status === 'Active' && item.type === 'Bank')}
        onOpenChange={setChequeOpen}
        onSave={(cheque) => {
          setChequeRecords((current) => [cheque, ...current]);
          toast.success('Cheque saved', { description: cheque.direction + ' · ' + taka(cheque.amount) });
        }}
      />

      <FinancePeopleManagerDialog
        open={peopleOpen}
        people={people}
        onOpenChange={setPeopleOpen}
        onAdd={(person) => {
          setPeople((current) => [...current, person]);
          toast.success('Finance person added', { description: person.name + ' · ' + person.roles.join(', ') });
        }}
        onUpdate={(person) => {
          setPeople((current) => current.map((item) => item.id === person.id ? person : item));
          setTransactions((current) => current.map((item) => item.partyId === person.id ? { ...item, party: person.name } : item));
          toast.success('Finance person updated', { description: person.name });
        }}
      />

      <ChequeActionDialog
        cheque={chequeAction}
        initialMode={chequeActionMode}
        accounts={accounts}
        onClose={() => setChequeAction(null)}
        onUpdate={updateCheque}
        onStatus={changeChequeStatus}
      />

      <CashSessionDetailsDialog
        session={canViewCash?cashSessionAction:null}
        onClose={() => setCashSessionAction(null)}
        onReconcile={(session) => navigate(`/app/reconciliation?account=${encodeURIComponent('Main Cash Counter')}&session=${encodeURIComponent(session.id)}`)}
      />

      <FinanceTransactionActionDialog
        transaction={transactionAction}
        initialMode={transactionActionMode}
        accounts={accounts}
        people={people}
        onClose={() => setTransactionAction(null)}
        onUpdate={updateFinanceTransaction}
        onReverse={reverseFinanceTransaction}
      />

      <FinanceAccountActionDialog
        account={accountAction}
        initialMode={accountActionMode}
        accounts={accounts}
        transactions={transactions}
        transfers={transfers}
        onClose={() => setAccountAction(null)}
        onUpdate={updateFinanceAccount}
        onToggleStatus={toggleFinanceAccount}
        onManualEntry={addManualAccountEntry}
        onTransfer={(account) => { setAccountAction(null); openTransfer(account); }}
        onReconcile={(account) => { setAccountAction(null); navigate(`/app/reconciliation?account=${encodeURIComponent(account.name)}`); }}
      />

      <FinanceTransferActionDialog
        transfer={transferAction}
        accounts={accounts}
        initialMode={transferActionMode}
        onClose={() => setTransferAction(null)}
        onReverse={reverseAccountTransfer}
      />
    </div>
  );
}



/** MOD-006 P2-B — AUTHENTICATED READ VIEW ONLY.
 * Not a connected posting route: global ConnectedWorkspaceGate remains closed.
 * Keep the original FinancePreview body and its handlers untouched in preview.
 */
type ConnectedAccountsPage = {
  scope: symbol;
  status: 'loading' | 'ready' | 'permission-denied' | 'error';
  data?: ServerMoneyAccountList;
};

/** Format exact server poisha, never treat a LOAN amount as spendable money. */
function serverMoney(value: number | bigint): string {
  if (typeof value === 'number' && !Number.isSafeInteger(value)) throw new RangeError('Unsafe money value');
  const exact = typeof value === 'bigint' ? value : BigInt(value);
  const magnitude = exact < 0n ? -exact : exact;
  return (exact < 0n ? '−' : '') + '৳' + (magnitude / 100n).toLocaleString('en-IN') +
    (magnitude % 100n === 0n ? '' : '.' + (magnitude % 100n).toString().padStart(2, '0'));
}

function ConnectedMoneyAccountsRead() {
  const { mode, snapshot } = useSession();
  const { text } = useUiCopy();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [retry, setRetry] = useState(0);
  const scope = useMemo(() =>
    mode === 'connected' && snapshot.status === 'authenticated'
      ? Symbol('verified-money-account-list') : null,
    [mode, snapshot, includeInactive, retry]);
  const [page, setPage] = useState<ConnectedAccountsPage | null>(null);
  const [opened, setOpened] = useState<{ scope: symbol; selection: ConnectedMoneyAccountSelection } | null>(null);

  useEffect(() => {
    if (!scope || snapshot.status !== 'authenticated' || mode !== 'connected') return;
    const controller = new AbortController();
    let active = true;
    setPage({ scope, status: 'loading' });
    void readMoneyAccounts(snapshot.accessToken, { includeInactive }, controller.signal).then(
      data => {
        if (!active) return;
        setPage({ scope, status: 'ready', data });
      },
      error => {
        if (!active) return;
        setPage({
          scope,
          status: error instanceof ApiError && error.kind === 'http' && error.status === 403
            ? 'permission-denied' : 'error',
        });
      },
    );
    return () => {
      active = false;
      controller.abort();
    };
  }, [scope, mode, includeInactive, snapshot]);

  // A verified refresh always supplies a NEW SessionStore snapshot object,
  // invalidating this scope *during render* even before effect cleanup runs.
  const current = page?.scope === scope && scope !== null ? page : null;
  const data = current?.status === 'ready' ? current.data : undefined;
  const safeSelection = opened?.scope === scope && data?.accounts.some(
    account => account.id === opened.selection.account.id
  ) ? opened.selection : null;
  const noWrites = text(
    'Read-only server view. Create, edit, money movement, status changes and reconciliation are not connected yet.',
    'শুধু সার্ভারের হিসাব দেখা যাবে। নতুন হিসাব, সংশোধন, টাকা স্থানান্তর, অবস্থা পরিবর্তন ও মিলানোর কাজ এখনো যুক্ত হয়নি।',
  );
  const unavailable = text('Available after verified server integration', 'সার্ভারের যাচাইকৃত সংযোগের পর চালু হবে');

  const selectAccount = (account: ServerMoneyAccount) => {
    if (!scope || snapshot.status !== 'authenticated' || mode !== 'connected') return;
    setOpened({ scope, selection: {
      account,
      tenantId: snapshot.tenantId,
      userId: snapshot.userId,
      epoch: snapshot.epoch,
    } });
  };

  if (!scope) return (
    <section role="status" className="rounded-lg border border-border bg-card p-4 text-sm text-ink-500">
      {text('Sign in to view verified money accounts.', 'যাচাইকৃত টাকার হিসাব দেখতে লগইন করুন।')}
    </section>
  );

  const permitted = data?.accounts ?? [];
  const liquid = permitted.filter(account => account.type !== 'LOAN');
  const loans = permitted.filter(account => account.type === 'LOAN');
  const summary = data ? [
    { label: text('Visible cash', 'দেখার অনুমতি থাকা ক্যাশ'), amount: data.totalCashMinor, icon: Banknote },
    { label: text('Visible bank', 'দেখার অনুমতি থাকা ব্যাংক'), amount: data.totalBankMinor, icon: Landmark },
    { label: text('Visible mobile banking', 'দেখার অনুমতি থাকা মোবাইল ব্যাংকিং'), amount: data.totalMfsMinor, icon: WalletCards },
  ] : [];
  const renderCards = (entries: ServerMoneyAccount[]) => entries.map(account => {
    const loan = account.type === 'LOAN';
    const typeLabel = account.type === 'CASH' ? text('Cash', 'নগদ') :
      account.type === 'BANK' ? text('Bank', 'ব্যাংক') :
      account.type === 'MFS' ? text('Mobile banking', 'মোবাইল ব্যাংকিং') :
      account.balanceMinor > 0
        ? text('Lender overpaid · negative payable', 'ঋণদাতাকে বেশি পরিশোধ · ঋণাত্মক দেনা')
        : text('Lender loan · liability', 'ঋণদাতার পাওনা · দায়');
    const Icon = account.type === 'CASH' ? Banknote : account.type === 'BANK' ? Landmark :
      account.type === 'MFS' ? WalletCards : ArrowDownLeft;
    return (
      <div key={account.id} data-connected-money-account={account.id}
        data-money-account-type={account.type}
        className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-ink">{account.name}</p>
            <p className="text-[10.5px] text-ink-400">{typeLabel}
              {account.isDrawer && ' · ' + text('Cash drawer','ক্যাশ ড্রয়ার')}
              {account.reference && ' · ' + account.reference}
            </p>
            {account.holderName && <p className="truncate text-[10.5px] text-ink-400">{account.holderName}</p>}
          </div>
          <StatusBadge tone={account.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
            {account.status === 'ACTIVE' ? text('Active', 'সক্রিয়') : text('Inactive', 'নিষ্ক্রিয়')}
          </StatusBadge>
        </div>
        <p className={'mt-4 text-2xl font-semibold ' + (loan ? (account.balanceMinor > 0 ? 'text-teal-700' : 'text-danger') : 'text-ink')}>
          {serverMoney(loan ? -BigInt(account.balanceMinor) : account.balanceMinor)}
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[10.5px] text-ink-400">
          <span>{text('Opening', 'শুরুর জের')} {account.openingAmountMinor === null
            ? text('Not recorded', 'দেওয়া নেই') : serverMoney(account.openingAmountMinor)}</span>
          <span>{loan ? text('Not available for payments', 'পেমেন্টে ব্যবহার করা যাবে না') :
            account.openingDate ? text('Opening date:', 'শুরুর তারিখ:') + ' ' + account.openingDate :
              text('Opening date not recorded', 'শুরুর তারিখ দেওয়া নেই')}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm"
            aria-label={text('View ledger for', 'খাতা দেখুন') + ' ' + account.name + ' · ' + account.type + ' · ' + account.id}
            onClick={() => selectAccount(account)}>
            <BookOpen className="size-4" /> {text('Ledger','খাতা')}
          </Button>
          {!loan && account.type !== 'CASH' && (
            <Button variant="outline" size="sm" disabled title={unavailable}>
              <CheckCircle2 className="size-4" /> {text('Reconcile', 'মিলিয়ে দেখুন')}
            </Button>
          )}
          {(account.type === 'BANK' || account.type === 'MFS') && (
            <Button variant="outline" size="sm" disabled title={unavailable}>
              <Landmark className="size-4" /> {text('Bank Entry','ব্যাংক এন্ট্রি')}
            </Button>
          )}
          <RowActionMenu label={text('Actions for', 'কাজ') + ' ' + account.name + ' · ' + account.type + ' · ' + account.id}
            className="ml-auto inline-block" width={230}>
            {close => <>
              <ActionMenuItem icon={BookOpen} onClick={() => { close(); selectAccount(account); }}>
                {text('View ledger', 'খাতা দেখুন')}
              </ActionMenuItem>
              <ActionMenuItem icon={Pencil} disabled title={unavailable}>{text('Edit account','হিসাব সংশোধন')}</ActionMenuItem>
              <ActionMenuItem icon={Banknote} disabled title={unavailable}>{text('Money in / out','টাকা আসা / যাওয়া')}</ActionMenuItem>
              <ActionMenuItem icon={ArrowLeftRight} disabled title={unavailable}>{text('Transfer','টাকা স্থানান্তর')}</ActionMenuItem>
              {!loan && account.type !== 'CASH' &&
                <ActionMenuItem icon={RefreshCw} disabled title={unavailable}>{text('Reconcile','মিলিয়ে দেখুন')}</ActionMenuItem>}
              <ActionMenuDivider />
              <ActionMenuItem icon={Power} disabled title={unavailable}>
                {account.status === 'ACTIVE' ? text('Deactivate','নিষ্ক্রিয় করুন') : text('Activate','সক্রিয় করুন')}
              </ActionMenuItem>
              <ActionMenuItem icon={RotateCcw} disabled title={unavailable}>{text('Delete','মুছুন')}</ActionMenuItem>
            </>}
          </RowActionMenu>
        </div>
      </div>
    );
  });

  return (
    <div data-connected-money-accounts="" className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[13px] font-medium text-ink">{text('Money accounts','টাকার হিসাব')}</p>
          <p className="text-[11px] text-ink-500">
            {text('Verified account balances and server journal. Only accounts your role may view are shown.',
              'যাচাইকৃত সার্ভারের জের ও খাতা। আপনার অনুমতির হিসাবগুলোই দেখানো হয়।')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled title={unavailable}>
            <ArrowLeftRight className="size-4" /> {text('Transfer','ট্রান্সফার')}
          </Button>
          <Button size="sm" disabled title={unavailable}>
            <Plus className="size-4" /> {text('Add account','হিসাব যোগ করুন')}
          </Button>
        </div>
      </div>
      <p className="mb-3 text-[11px] text-ink-500" role="note">{noWrites}</p>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-ink-600">
          <input type="checkbox" checked={includeInactive}
            onChange={event => setIncludeInactive(event.target.checked)}
            className="size-4 accent-teal-600" />
          {text('Include inactive accounts','বন্ধ হিসাবও দেখুন')}
        </label>
        <Button variant="outline" size="sm" onClick={() => setRetry(value => value + 1)}>
          <RefreshCw className="size-4" /> {text('Refresh','আবার আনুন')}
        </Button>
      </div>
      {current?.status === 'permission-denied' ? (
        <p role="alert" className="rounded-md border border-border p-4 text-sm text-danger">
          {text('Account-list permission is required. Ask the business owner for access.',
            'হিসাবের তালিকা দেখার অনুমতি নেই। মালিকের কাছে অনুমতি চান।')}
        </p>
      ) : current?.status === 'error' ? (
        <p role="alert" className="rounded-md border border-border p-4 text-sm text-danger">
          {text('Verified money accounts could not be loaded. Use Refresh; preview balances will not be substituted.',
            'সার্ভার থেকে হিসাব আনা যায়নি। আবার আনুন; নমুনা জের দেখানো হবে না।')}
        </p>
      ) : !data ? (
        <p role="status" className="rounded-md border border-border p-4 text-sm text-ink-500">
          {text('Loading verified money accounts…', 'সার্ভার থেকে যাচাইকৃত টাকার হিসাব আনা হচ্ছে…')}
        </p>
      ) : (
        <>
          <div data-connected-money-summary="" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {summary.map(({label, amount, icon: Icon}) => (
              <div key={label} className="rounded-lg border border-border bg-card px-3 py-2.5">
                <div className="flex items-center justify-between gap-2 text-[12px] text-ink-500">
                  <span>{label}</span><Icon className="size-4" aria-hidden="true" />
                </div>
                <p className="mt-1 text-base font-semibold text-ink">{serverMoney(amount)}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {renderCards(liquid)}
          </div>
          {loans.length > 0 && (
            <section data-connected-money-liabilities="" className="mt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[13px] font-semibold text-ink">{text('Lender balances · payable / overpayment', 'ঋণদাতার জের · দেনা / বেশি পরিশোধ')}</p>
                  <p className="text-[11px] text-ink-500">
                    {text('Net lender payable; negative means overpaid. Never included in liquid money.', 'ঋণদাতার মোট দেনা; ঋণাত্মক হলে বেশি পরিশোধ। ব্যবহারযোগ্য টাকার সঙ্গে যোগ হয় না।')}
                  </p>
                </div>
                <p className="text-sm font-semibold text-danger">{serverMoney(data.totalLoanMinor)}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{renderCards(loans)}</div>
            </section>
          )}
          {permitted.length === 0 && <p className="rounded-lg border border-border p-4 text-sm text-ink-500">
            {text('No permitted accounts to display.', 'দেখার অনুমতি থাকা কোনো হিসাব পাওয়া যায়নি।')}
          </p>}
          <section className="mt-5 rounded-xl border border-border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">{text('Transfer history','ট্রান্সফারের ইতিহাস')}</p>
                <p className="text-[11px] text-ink-500">
                  {text('Transfer history is not connected to a verified server API yet. No sample transfers are displayed.',
                    'ট্রান্সফারের ইতিহাস এখনো সার্ভারের সঙ্গে যুক্ত নয়। কোনো নমুনা ট্রান্সফার দেখানো হচ্ছে না।')}
                </p>
              </div>
              <Button variant="outline" size="sm" disabled title={unavailable}>
                <Plus className="size-4" /> {text('New transfer','নতুন ট্রান্সফার')}
              </Button>
            </div>
          </section>
        </>
      )}
      <ConnectedMoneyAccountActionDialog selection={safeSelection} onClose={() => setOpened(null)} />
    </div>
  );
}

/** All preview behavior, routes and writers remain in the unchanged FinancePreview.
 * Connected other finance routes stay unavailable; P2-B is account reads only.
 */
export function Finance(props: { counterOnly?: boolean; moneyAccountsOnly?: boolean } = {}) {
  const { mode } = useSession();
  if (mode === 'connected') {
    if (props.moneyAccountsOnly) return <ConnectedMoneyAccountsRead />;
    return <main role="status" className="rounded-lg border border-border bg-card p-4 text-sm text-ink-500">
      Connected finance posting and related workspaces are not enabled yet. 
      সার্ভারের টাকার লেনদেন ও সংশ্লিষ্ট কাজ এখনো চালু হয়নি।
    </main>;
  }
  return <FinancePreview {...props} />;
}
