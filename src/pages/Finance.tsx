import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Landmark,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  UserRoundCog,
  Wallet,
  WalletCards
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/Dialog';
import { FormSelect } from '../components/FormSelect';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { FinanceAccountActionDialog, FinancePeopleManagerDialog, FinanceTransactionActionDialog, FinanceTransferActionDialog } from '../components/finance/FinanceRecordDialogs';
import { ChequeDialog } from '../components/finance/ChequeDialogs';
import { ChequeActionDialog } from '../components/finance/ChequeActionDialog';
import { CashSessionDetailsDialog } from '../components/finance/CashSessionDetailsDialog';
import { StatusBadge } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { useCashSession } from '../contexts/CashSessionContext';
import {
  accountTransfers as seedTransfers,
  cashSessions,
  financeAccounts as seedAccounts,
  financePeople as seedPeople,
  financeTransactions as seedTransactions,
  relationshipSummary,
  type AccountTransfer,
  type FinanceAccount,
  type FinanceAccountType,
  type FinancePerson,
  type FinancePersonRole,
  type FinanceTransaction,
  type FinanceTransactionType,
  type CashSessionRecord
} from '../data/financeAccounts';
import { expenseCategories } from '../data/purchases';
import { cheques as seedCheques, type ChequeRecord, type ChequeStatus } from '../data/cheques';
import { parties } from '../data/parties';
import { taka } from '../utils/currency';

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

const accountMethods = ['Cash', 'Bank', 'Mobile Banking'] as const;

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
  onSave
}: {
  open: boolean;
  accounts: FinanceAccount[];
  people: FinancePerson[];
  nextId: string;
  onOpenChange: (open: boolean) => void;
  onSave: (transaction: FinanceTransaction) => void;
}) {
  const [type, setType] = useState<FinanceTransactionType>('Lender Credit');
  const [person, setPerson] = useState('');
  const [method, setMethod] = useState<(typeof accountMethods)[number]>('Cash');
  const [account, setAccount] = useState(accounts[0]?.name ?? '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-10-06');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [backdateReason, setBackdateReason] = useState('');

  const meta = financeTypeMeta[type];
  const rolePeople = people.filter((item) => !meta.role || item.roles.includes(meta.role));
  const isOpening = !!meta.opening;
  const matchingAccounts = accounts.filter((item) =>
    method === 'Cash' ? (item.type === 'Cash' || item.type === 'Petty Cash') :
    method === 'Bank' ? item.type === 'Bank' :
    item.type === 'Mobile Banking'
  );
  const selectedPerson = rolePeople.find((item) => item.name === person) ?? rolePeople[0];
  const selectedAccount = matchingAccounts.find((item) => item.name === account) ?? matchingAccounts[0];
  const isBackdated = date !== '2026-10-06';

  const save = () => {
    const value = parseFloat(amount) || 0;
    if (!value) {
      toast.error('Enter an amount');
      return;
    }
    if (isBackdated && !backdateReason.trim()) {
      toast.error('Backdated transactions require a reason');
      return;
    }
    if (!selectedPerson) {
      toast.error('Select a finance person');
      return;
    }

    onSave({
      id: nextId,
      date: date === '2026-10-06' ? '06 Oct 2026' : date,
      type,
      relationship: meta.account,
      party: selectedPerson.name,
      partyId: selectedPerson.id,
      method: isOpening ? undefined : method,
      account: isOpening ? undefined : selectedAccount?.name,
      accountId: isOpening ? undefined : selectedAccount?.id,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New finance transaction <span className="font-bn text-sm font-normal text-ink-500">ব্যবসার হিসাব</span></DialogTitle>
          <DialogDescription>
            Owner, lender and borrower balances stay independent. Opening balances never move cash or bank money.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-medium text-ink sm:col-span-2">
            Transaction type
            <FormSelect className="mt-1.5" value={type} onChange={(event) => {
              const next = event.target.value as FinanceTransactionType;
              setType(next);
              const nextMeta = financeTypeMeta[next];
              const firstPerson = people.find((item) => !nextMeta.role || item.roles.includes(nextMeta.role));
              setPerson(firstPerson?.name ?? '');
            }} options={financeTypeOptions} />
            <span className="mt-1 block text-[11px] font-normal text-ink-400">
              {isOpening
                ? 'Opening balance only — no cash, bank or mobile banking movement.'
                : meta.direction === 'in'
                  ? 'Money comes into the business.'
                  : 'Money goes out of the business.'}
            </span>
          </label>

          <label className="text-[13px] font-medium text-ink">
            Finance person
            <FormSelect
              className="mt-1.5"
              value={selectedPerson?.name ?? ''}
              onChange={(event) => setPerson(event.target.value)}
              options={rolePeople.map((item) => item.name)}
            />
          </label>

          <label className="text-[13px] font-medium text-ink">
            Date
            <Input className="mt-1.5" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>

          {isBackdated && (
            <label className="text-[13px] font-medium text-ink sm:col-span-2">
              Reason for backdating <span className="text-danger">*</span>
              <Input className="mt-1.5" value={backdateReason} onChange={(event) => setBackdateReason(event.target.value)} placeholder="Why is this transaction being entered for an earlier date?" />
            </label>
          )}

          {!isOpening && (
            <>
              <label className="text-[13px] font-medium text-ink">
                Payment method
                <FormSelect className="mt-1.5" value={method} onChange={(event) => {
                  const next = event.target.value as (typeof accountMethods)[number];
                  setMethod(next);
                  const first = accounts.find((item) =>
                    next === 'Cash' ? (item.type === 'Cash' || item.type === 'Petty Cash') :
                    next === 'Bank' ? item.type === 'Bank' :
                    item.type === 'Mobile Banking'
                  );
                  setAccount(first?.name ?? '');
                }} options={[...accountMethods]} />
              </label>
              <label className="text-[13px] font-medium text-ink">
                Account
                <FormSelect
                  className="mt-1.5"
                  value={selectedAccount?.name ?? ''}
                  onChange={(event) => setAccount(event.target.value)}
                  options={matchingAccounts.map((item) => item.name)}
                />
              </label>
            </>
          )}

          <label className="text-[13px] font-medium text-ink">
            Amount
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
              <Input value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} className="pl-7 text-right" inputMode="decimal" placeholder="0" />
            </div>
          </label>

          <label className="text-[13px] font-medium text-ink">
            Reference no.
            <Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Optional" />
          </label>

          <label className="text-[13px] font-medium text-ink sm:col-span-2">
            Notes
            <Input className="mt-1.5" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional internal note" />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AccountDialog({
  open,
  onOpenChange,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (account: FinanceAccount) => void;
}) {
  const [type, setType] = useState<FinanceAccountType>('Bank');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [number, setNumber] = useState('');
  const [opening, setOpening] = useState('');

  const save = () => {
    if (!name.trim()) {
      toast.error('Enter an account name');
      return;
    }
    const id = `acc-${Date.now()}`;
    onSave({
      id,
      name: name.trim(),
      type,
      institution: institution || undefined,
      number: number || undefined,
      openingBalance: parseFloat(opening) || 0,
      balance: parseFloat(opening) || 0,
      status: 'Active',
      lastActivity: 'Just now'
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add account <span className="font-bn text-sm font-normal text-ink-500">অ্যাকাউন্ট যোগ করুন</span></DialogTitle>
          <DialogDescription>Cash, bank and mobile banking accounts share one simple account list.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-medium text-ink">
            Account type
            <FormSelect className="mt-1.5" value={type} onChange={(event) => setType(event.target.value as FinanceAccountType)} options={['Cash', 'Bank', 'Mobile Banking']} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            Account name
            <Input className="mt-1.5" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. City Bank · 3812" />
          </label>
          {type !== 'Cash' && (
            <>
              <label className="text-[13px] font-medium text-ink">
                {type === 'Bank' ? 'Bank name' : 'Provider'}
                <Input className="mt-1.5" value={institution} onChange={(event) => setInstitution(event.target.value)} placeholder={type === 'Bank' ? 'Bank name' : 'bKash / Nagad / Rocket'} />
              </label>
              <label className="text-[13px] font-medium text-ink">
                Account number
                <Input className="mt-1.5" value={number} onChange={(event) => setNumber(event.target.value)} placeholder="Optional" />
              </label>
            </>
          )}
          <label className="text-[13px] font-medium text-ink sm:col-span-2">
            Opening balance
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
              <Input value={opening} onChange={(event) => setOpening(event.target.value.replace(/[^\d.]/g, ''))} className="pl-7 text-right" inputMode="decimal" placeholder="0" />
            </div>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TransferDialog({
  open,
  accounts,
  nextId,
  onOpenChange,
  onSave
}: {
  open: boolean;
  accounts: FinanceAccount[];
  nextId: string;
  onOpenChange: (open: boolean) => void;
  onSave: (transfer: AccountTransfer) => void;
}) {
  const active = accounts.filter((item) => item.status === 'Active');
  const [from, setFrom] = useState(active[0]?.name ?? '');
  const [to, setTo] = useState(active[1]?.name ?? '');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  const save = () => {
    const value = parseFloat(amount) || 0;
    if (!value) {
      toast.error('Enter a transfer amount');
      return;
    }
    if (from === to) {
      toast.error('Choose two different accounts');
      return;
    }
    onSave({
      id: nextId,
      date: '06 Oct 2026',
      from,
      to,
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
          <DialogTitle>Transfer between accounts</DialogTitle>
          <DialogDescription>One transfer creates the matching money-out and money-in movement.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <label className="text-[13px] font-medium text-ink">
            From account
            <FormSelect className="mt-1.5" value={from} onChange={(event) => setFrom(event.target.value)} options={active.map((item) => item.name)} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            To account
            <FormSelect className="mt-1.5" value={to} onChange={(event) => setTo(event.target.value)} options={active.map((item) => item.name)} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            Amount
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
              <Input value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} className="pl-7 text-right" inputMode="decimal" placeholder="0" />
            </div>
          </label>
          <label className="text-[13px] font-medium text-ink">
            Reference / note
            <Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Optional" />
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Transfer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Finance() {
  const navigate = useNavigate();
  const { setOpen: setCashDialogOpen, sessionOpen } = useCashSession();
  const [tab, setTab] = useState<Tab>('overview');
  const [accounts, setAccounts] = useState<FinanceAccount[]>(seedAccounts);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>(seedTransactions);
  const [transfers, setTransfers] = useState<AccountTransfer[]>(seedTransfers);
  const [people, setPeople] = useState<FinancePerson[]>(seedPeople);
  const [chequeRecords, setChequeRecords] = useState<ChequeRecord[]>(seedCheques);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [chequeOpen, setChequeOpen] = useState(false);
  const [chequeAction, setChequeAction] = useState<ChequeRecord | null>(null);
  const [cashSessionAction, setCashSessionAction] = useState<CashSessionRecord | null>(null);
  const [transferFrom, setTransferFrom] = useState<string | undefined>(undefined);
  const [transactionAction, setTransactionAction] = useState<FinanceTransaction | null>(null);
  const [accountAction, setAccountAction] = useState<FinanceAccount | null>(null);
  const [transferAction, setTransferAction] = useState<AccountTransfer | null>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All transaction types');
  const [counterType, setCounterType] = useState<'Customer Receive' | 'Supplier Pay' | 'Expense' | 'Bank Transfer'>('Customer Receive');
  const [counterParty, setCounterParty] = useState('');
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMethod, setCounterMethod] = useState('Cash');
  const [counterAccount, setCounterAccount] = useState(accounts.find((item) => item.type === 'Cash')?.name ?? '');
  const [counterNote, setCounterNote] = useState('');

  const applyTransactionMovement = (list: FinanceAccount[], transaction: FinanceTransaction, factor = 1) => {
    if (!transaction.accountId || transaction.direction === 'none' || transaction.status === 'Reversed') return list;
    const signed = transaction.direction === 'in' ? transaction.amount : -transaction.amount;
    return list.map((account) =>
      account.id === transaction.accountId
        ? { ...account, balance: account.balance + signed * factor, lastActivity: 'Just now' }
        : account
    );
  };

  const updateFinanceTransaction = (updated: FinanceTransaction) => {
    const previous = transactions.find((item) => item.id === updated.id);
    if (!previous) return;
    setAccounts((current) => applyTransactionMovement(applyTransactionMovement(current, previous, -1), updated, 1));
    setTransactions((current) => current.map((item) => item.id === updated.id ? updated : item));
    setTransactionAction(updated);
    toast.success('Finance transaction updated', { description: updated.id });
  };

  const reverseFinanceTransaction = (transaction: FinanceTransaction) => {
    if (transaction.status === 'Reversed') return;
    const reversed = { ...transaction, status: 'Reversed' as const };
    setAccounts((current) => applyTransactionMovement(current, transaction, -1));
    setTransactions((current) => current.map((item) => item.id === transaction.id ? reversed : item));
    setTransactionAction(reversed);
    toast.success('Transaction reversed', { description: transaction.id + ' remains in the audit history' });
  };

  const updateFinanceAccount = (updated: FinanceAccount) => {
    const previous = accounts.find((item) => item.id === updated.id);
    setAccounts((current) => current.map((item) => item.id === updated.id ? updated : item));
    if (previous && previous.name !== updated.name) {
      setTransactions((current) => current.map((item) => item.accountId === updated.id ? { ...item, account: updated.name } : item));
      setTransfers((current) => current.map((item) => ({
        ...item,
        from: item.from === previous.name ? updated.name : item.from,
        to: item.to === previous.name ? updated.name : item.to
      })));
      setChequeRecords((current) => current.map((item) => item.depositAccount === previous.name ? { ...item, depositAccount: updated.name } : item));
    }
    setAccountAction(updated);
    toast.success('Account updated', { description: updated.name });
  };

  const toggleFinanceAccount = (account: FinanceAccount) => {
    const updated = { ...account, status: account.status === 'Active' ? 'Inactive' as const : 'Active' as const };
    setAccounts((current) => current.map((item) => item.id === account.id ? updated : item));
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
    setAccountAction((current) => current && current.id === account.id
      ? { ...current, balance: current.balance + (direction === 'in' ? amount : -amount), lastActivity: 'Just now' }
      : current);
    toast.success('Manual account entry recorded', { description: (direction === 'in' ? '+' : '−') + taka(amount) });
  };

  const openTransfer = (account?: FinanceAccount) => {
    setTransferFrom(account?.name);
    setTransferOpen(true);
  };

  const updateCheque = (updated: ChequeRecord) => {
    setChequeRecords((current) => current.map((item) => item.id === updated.id ? updated : item));
    setChequeAction(updated);
    toast.success('Cheque updated', { description: updated.id });
  };

  const changeChequeStatus = (cheque: ChequeRecord, nextStatus: ChequeStatus, reason?: string) => {
    if (nextStatus === 'Cleared' && !cheque.depositAccount) {
      toast.error('Select the Bank / Money Account before clearing this cheque');
      return;
    }
    const updated: ChequeRecord = {
      ...cheque,
      status: nextStatus,
      statusReason: reason,
      statusUpdatedAt: '2026-10-07T16:40:00+06:00',
      statusUpdatedBy: 'Shuvo'
    };
    setChequeRecords((current) => current.map((item) => item.id === cheque.id ? updated : item));
    if (nextStatus === 'Cleared' && cheque.status !== 'Cleared' && cheque.depositAccount) {
      setAccounts((current) => current.map((account) => account.name === cheque.depositAccount
        ? { ...account, balance: account.balance + (cheque.direction === 'Received' ? cheque.amount : -cheque.amount), lastActivity: 'Just now' }
        : account));
    }
    setChequeAction(updated);
    toast.success('Cheque status updated', { description: cheque.id + ' · ' + nextStatus });
  };

  const reverseAccountTransfer = (transfer: AccountTransfer) => {
    if (transfer.status === 'Reversed') return;
    const reversed = { ...transfer, status: 'Reversed' as const };
    setTransfers((current) => current.map((item) => item.id === transfer.id ? reversed : item));
    setAccounts((current) => current.map((account) => {
      if (account.name === transfer.from) return { ...account, balance: account.balance + transfer.amount, lastActivity: 'Just now' };
      if (account.name === transfer.to) return { ...account, balance: account.balance - transfer.amount, lastActivity: 'Just now' };
      return account;
    }));
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
      const matchesQuery = !q || [item.id, item.party, item.type, item.account, item.reference, item.note]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
      return matchesType && matchesQuery;
    });
  }, [transactions, query, typeFilter]);

  const tabs: Array<[Tab, string, string]> = [
    ['overview', 'Overview', 'Money position and relationship balances'],
    ['accounts', 'Money Accounts', 'Cash, bank, mobile banking and petty cash'],
    ['counter', 'Counter', 'Fast receive, pay, expense and transfer'],
    ['transactions', 'Loans & Owners', 'Owner, lender and borrower money'],
    ['cheques', 'Cheques', 'Received, issued and post-dated cheques'],
    ['cash', 'Cash Sessions', 'Open, close and reconcile cash drawer']
  ];

  const pdcCount = chequeRecords.filter((item) => item.chequeDate > '2026-10-07' && !['Cleared', 'Cancelled', 'Returned', 'Stopped', 'Bounced'].includes(item.status)).length;
  const bouncedCount = chequeRecords.filter((item) => item.status === 'Bounced' || item.status === 'Returned').length;
  const varianceSessions = cashSessions.filter((item) => item.status === 'Closed' && (item.variance ?? 0) !== 0).length;

  const pendingChequeAmount = chequeRecords
    .filter((item) => !['Cleared', 'Cancelled', 'Returned', 'Stopped', 'Bounced'].includes(item.status))
    .reduce((sum, item) => sum + item.amount, 0);

  const summaryCards = [
    { label: 'Available money', value: taka(totalLiquid), sub: 'Cash + bank + mobile banking', icon: CircleDollarSign },
    { label: 'Cash', value: taka(cashBalance), sub: sessionOpen ? 'Cash session open' : 'Cash session closed', icon: Banknote },
    { label: 'Bank', value: taka(bankBalance), sub: 'Across active bank accounts', icon: Landmark },
    { label: 'Mobile banking', value: taka(mobileBalance), sub: 'bKash, Nagad and wallets', icon: WalletCards },
    { label: 'Cheques pending', value: taka(pendingChequeAmount), sub: 'Waiting for clearance', icon: BookOpen },
    { label: 'Lender payable', value: taka(relationshipSummary.outstandingLoan), sub: 'Money we still need to repay', icon: ArrowDownLeft, tone: 'text-danger' },
    { label: 'Borrower receivable', value: taka(relationshipSummary.borrowerReceivable), sub: 'Money others still owe us', icon: ArrowUpRight, tone: 'text-teal-700' }
  ];

  const activeCounterAccounts = accounts.filter((item) => {
    if (counterMethod === 'Cash') return item.type === 'Cash' || item.type === 'Petty Cash';
    if (counterMethod === 'Bank') return item.type === 'Bank';
    return item.type === 'Mobile Banking';
  });

  const counterPartyOptions = counterType === 'Customer Receive'
    ? parties.filter((item) => item.roles.includes('Customer')).map((item) => item.name)
    : counterType === 'Supplier Pay'
      ? parties.filter((item) => item.roles.includes('Supplier')).map((item) => item.name)
      : counterType === 'Expense'
        ? expenseCategories
        : accounts.map((item) => item.name);

  const postCounter = () => {
    const value = parseFloat(counterAmount) || 0;
    if (!value) return toast.error('Enter an amount');

    if (counterType === 'Bank Transfer') {
      const from = counterParty || accounts[0]?.name || '';
      const to = counterAccount;
      if (!from || !to || from === to) return toast.error('Choose two different accounts');
      const transfer: AccountTransfer = {
        id: 'TRF-' + String(42 + transfers.length - seedTransfers.length).padStart(6, '0'),
        date: '06 Oct 2026',
        from,
        to,
        amount: value,
        reference: counterNote || undefined,
        status: 'Completed'
      };
      setTransfers((current) => [transfer, ...current]);
      setAccounts((current) => current.map((account) => {
        if (account.name === from) return { ...account, balance: account.balance - value, lastActivity: 'Just now' };
        if (account.name === to) return { ...account, balance: account.balance + value, lastActivity: 'Just now' };
        return account;
      }));
      toast.success('Account transfer completed', { description: taka(value) + ' · ' + from + ' → ' + to });
    } else {
      const selected = activeCounterAccounts.find((item) => item.name === counterAccount) || activeCounterAccounts[0];
      if (!selected) return toast.error('Select an active account');
      const incoming = counterType === 'Customer Receive';
      setAccounts((current) => current.map((account) =>
        account.id === selected.id
          ? { ...account, balance: account.balance + (incoming ? value : -value), lastActivity: 'Just now' }
          : account
      ));
      const verbs = {
        'Customer Receive': 'Customer payment received',
        'Supplier Pay': 'Supplier payment recorded',
        Expense: 'Expense recorded'
      } as const;
      toast.success(verbs[counterType], { description: taka(value) + ' · ' + (counterParty || counterType) });
    }
    setCounterAmount('');
    setCounterNote('');
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Finance"
        titleBn="টাকা-পয়সা"
        description="Cash, bank, mobile banking, loans, cheques and everyday money movement."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setPeopleOpen(true)}>
              <UserRoundCog className="size-4" /> Finance people
            </Button>
            <Button variant="outline" size="sm" onClick={() => setChequeOpen(true)}>
              <Plus className="size-4" /> New cheque
            </Button>
            <Button size="sm" onClick={() => setTransactionOpen(true)}>
              <Plus className="size-4" /> New transaction
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        {summaryCards.map(({ label, value, sub, icon: Icon, tone }) => (
          <div key={label} className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[12.5px] text-ink-500">{label}</p>
              <Icon className="size-4 text-ink-300" />
            </div>
            <p className={`mt-0.5 text-lg font-semibold ${tone ?? 'text-ink'}`}>{value}</p>
            <p className="mt-0.5 text-[10.5px] text-ink-400">{sub}</p>
          </div>
        ))}
      </div>

      {(pdcCount > 0 || bouncedCount > 0 || varianceSessions > 0) && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-warning/20 bg-warning/5 p-3">
          <button onClick={() => setTab('cheques')} className="rounded-lg border border-warning/20 bg-white px-3 py-2 text-left hover:bg-warning/5">
            <p className="text-[12px] font-medium text-ink">{pdcCount} post-dated cheque{pdcCount === 1 ? '' : 's'}</p>
            <p className="font-bn text-[10.5px] text-ink-400">পরে জমা দেওয়ার চেক দেখুন</p>
          </button>
          {bouncedCount > 0 && <button onClick={() => setTab('cheques')} className="rounded-lg border border-danger/20 bg-white px-3 py-2 text-left hover:bg-danger/5"><p className="text-[12px] font-medium text-danger">{bouncedCount} cheque issue{bouncedCount === 1 ? '' : 's'}</p><p className="font-bn text-[10.5px] text-ink-400">Bounced / Returned চেক দেখুন</p></button>}
          {varianceSessions > 0 && <button onClick={() => setTab('cash')} className="rounded-lg border border-warning/20 bg-white px-3 py-2 text-left hover:bg-warning/5"><p className="text-[12px] font-medium text-ink">{varianceSessions} cash variance</p><p className="font-bn text-[10.5px] text-ink-400">Short / over যাচাই করুন</p></button>}
        </div>
      )}

      <div className="rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="flex flex-wrap gap-1 border-b border-ink-100 px-3" role="tablist">
          {tabs.map(([id, label, helper]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              title={helper}
              onClick={() => setTab(id)}
              className={`px-2.5 py-2.5 text-[13px] font-medium ${
                tab === id ? 'erp-tab-active text-ink' : 'text-ink-500 hover:text-ink'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid gap-4 p-4 xl:grid-cols-[1.25fr_1fr]">
            <section className="space-y-4">
              <div className="rounded-xl border border-ink-100">
                <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
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
                    <div key={String(label)} className="bg-white p-3">
                      <p className="text-[11px] text-ink-400">{group}</p>
                      <p className="text-[12.5px] font-medium text-ink">{label}</p>
                      <p className="mt-1 text-base font-semibold text-ink">{taka(Number(value))}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-ink-100">
                <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Recent loans & owner money</p>
                    <p className="text-[11px] text-ink-500">Owner, lender and borrower money stays separate.</p>
                  </div>
                  <button onClick={() => setTab('transactions')} className="text-xs font-medium text-teal-700 hover:underline">View all</button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-9 pl-4 text-xs">Transaction</TableHead>
                      <TableHead className="h-9 text-xs">Party</TableHead>
                      <TableHead className="h-9 text-xs">Account</TableHead>
                      <TableHead className="h-9 pr-4 text-right text-xs">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 5).map((item) => (
                      <TableRow key={item.id} className="text-[13px]">
                        <TableCell className="py-2 pl-4">
                          <p className="font-medium text-ink">{item.type}</p>
                          <p className="text-[10.5px] text-ink-400">{item.date} · {item.id}</p>
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

            <section className="space-y-4">
              <div className="rounded-xl border border-ink-100 p-4">
                <p className="text-sm font-semibold text-ink">Money Accounts</p>
                <p className="mb-3 text-[11px] text-ink-500">Live balances by money account.</p>
                <div className="space-y-2">
                  {accounts.filter((item) => item.status === 'Active').map((account) => (
                    <button
                      key={account.id}
                      onClick={() => setTab('accounts')}
                      className="flex w-full items-center gap-3 rounded-lg border border-ink-100 px-3 py-2.5 text-left hover:bg-ink-50">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        {account.type === 'Cash' ? <Banknote className="size-4" /> : account.type === 'Bank' ? <Landmark className="size-4" /> : <WalletCards className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-medium text-ink">{account.name}</span>
                        <span className="block text-[10.5px] text-ink-400">{account.type} · {account.lastActivity}</span>
                      </span>
                      <span className="text-[13px] font-semibold text-ink">{taka(account.balance)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-ink-100 p-4">
                <p className="text-sm font-semibold text-ink">Quick tools</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { label: 'Counter', helper: 'Receive / pay', icon: BriefcaseBusiness, action: () => setTab('counter') },
                    { label: 'Transfer', helper: 'Between accounts', icon: ArrowLeftRight, action: () => setTransferOpen(true) },
                    { label: 'Reconcile', helper: 'Bank statement', icon: CheckCircle2, action: () => navigate('/app/reconciliation') },
                    { label: 'Daybook', helper: 'All transactions', icon: BookOpen, action: () => navigate('/app/daybook') }
                  ].map(({ label, helper, icon: Icon, action }) => (
                    <button key={label} onClick={action} className="rounded-lg border border-ink-100 p-3 text-left hover:bg-ink-50">
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
            <div className="flex flex-col gap-2 border-b border-ink-100 p-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1 lg:max-w-md">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-8" placeholder="Search finance transaction, party or reference" />
              </div>
              <FormSelect className="w-full lg:w-48" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} options={['All transaction types', ...financeTypeOptions]} />
              <Button variant="outline" size="sm" onClick={() => setPeopleOpen(true)}>
                <UserRoundCog className="size-4" /> Finance people
              </Button>
              <Button size="sm" onClick={() => setTransactionOpen(true)}>
                <Plus className="size-4" /> New transaction
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">Finance transaction</TableHead>
                  <TableHead className="h-9 text-xs">Relationship</TableHead>
                  <TableHead className="h-9 text-xs">Party</TableHead>
                  <TableHead className="h-9 text-xs">Payment</TableHead>
                  <TableHead className="h-9 text-xs">Account</TableHead>
                  <TableHead className="h-9 text-right text-xs">Amount</TableHead>
                  <TableHead className="h-9 text-xs">Status</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((item) => (
                  <TableRow key={item.id} className="text-[13px]">
                    <TableCell className="py-2 pl-4">
                      <p className="font-medium text-ink">{item.type}</p>
                      <p className="text-[10.5px] text-ink-400">{item.date} · {item.id}{item.reference ? ` · ${item.reference}` : ''}</p>
                    </TableCell>
                    <TableCell className="py-2 text-ink-600">{item.relationship ?? '—'}</TableCell>
                    <TableCell className="py-2 font-medium text-ink">{item.party ?? '—'}</TableCell>
                    <TableCell className="py-2 text-ink-500">{item.method ?? 'No money movement'}</TableCell>
                    <TableCell className="py-2 text-ink-500">{item.account ?? '—'}</TableCell>
                    <TableCell className={`py-2 text-right font-semibold ${
                      item.direction === 'in' ? 'text-success' : item.direction === 'out' ? 'text-ink' : 'text-info'
                    }`}>
                      {item.direction === 'in' ? '+' : item.direction === 'out' ? '−' : ''}{taka(item.amount)}
                    </TableCell>
                    <TableCell className="py-2"><StatusBadge tone={transactionTone(item)} dot>{item.status}</StatusBadge></TableCell>
                    <TableCell className="py-2 pr-4 text-right">
                      <button
                        onClick={() => setTransactionAction(item)}
                        className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink">
                        <MoreHorizontal className="size-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {tab === 'counter' && (
          <div className="mx-auto max-w-4xl p-4">
            <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
              {(['Customer Receive', 'Supplier Pay', 'Expense', 'Bank Transfer'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setCounterType(type);
                    setCounterParty('');
                    setCounterAmount('');
                  }}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    counterType === type ? 'border-teal-200 bg-teal-50' : 'border-ink-100 bg-white hover:bg-ink-50'
                  }`}>
                  <p className={`text-[13px] font-semibold ${counterType === type ? 'text-teal-800' : 'text-ink'}`}>{type}</p>
                  <p className="mt-0.5 text-[10.5px] text-ink-400">
                    {type === 'Customer Receive' ? 'Receive customer money' :
                      type === 'Supplier Pay' ? 'Pay supplier balance' :
                      type === 'Expense' ? 'Quick expense entry' : 'Move money between accounts'}
                  </p>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-ink-100 bg-white p-4">
              <div className="mb-4">
                <p className="text-sm font-semibold text-ink">{counterType}</p>
                <p className="text-[11px] text-ink-500">Quick-entry only. Full history and editing stay in their original modules.</p>
              </div>

              {counterType === 'Bank Transfer' ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-[13px] font-medium text-ink">
                    From account
                    <FormSelect className="mt-1.5" value={counterParty || accounts[0]?.name} onChange={(event) => setCounterParty(event.target.value)} options={accounts.map((item) => item.name)} />
                  </label>
                  <label className="text-[13px] font-medium text-ink">
                    To account
                    <FormSelect className="mt-1.5" value={counterAccount} onChange={(event) => setCounterAccount(event.target.value)} options={accounts.map((item) => item.name)} />
                  </label>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-[13px] font-medium text-ink">
                    {counterType === 'Customer Receive' ? 'Customer' : counterType === 'Supplier Pay' ? 'Supplier' : 'Expense category'}
                    <FormSelect
                      className="mt-1.5"
                      value={counterParty || counterPartyOptions[0] || ''}
                      onChange={(event) => setCounterParty(event.target.value)}
                      options={counterPartyOptions}
                    />
                  </label>
                  {counterType === 'Expense' && (
                    <label className="text-[13px] font-medium text-ink">
                      Payee
                      <FormSelect className="mt-1.5" options={parties.filter((item) => item.roles.includes('Payee') || item.roles.includes('Vendor')).map((item) => item.name)} />
                    </label>
                  )}
                </div>
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-[13px] font-medium text-ink">
                  Amount
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
                    <Input value={counterAmount} onChange={(event) => setCounterAmount(event.target.value.replace(/[^\d.]/g, ''))} className="pl-7 text-right" inputMode="decimal" placeholder="0" />
                  </div>
                </label>

                {counterType !== 'Bank Transfer' && (
                  <label className="text-[13px] font-medium text-ink">
                    Payment method
                    <FormSelect className="mt-1.5" value={counterMethod} onChange={(event) => {
                      const next = event.target.value;
                      setCounterMethod(next);
                      const first = accounts.find((item) =>
                        next === 'Cash' ? (item.type === 'Cash' || item.type === 'Petty Cash') :
                        next === 'Bank' ? item.type === 'Bank' :
                        item.type === 'Mobile Banking'
                      );
                      setCounterAccount(first?.name ?? '');
                    }} options={['Cash', 'Bank', 'Mobile Banking']} />
                  </label>
                )}

                {counterType !== 'Bank Transfer' && (
                  <label className="text-[13px] font-medium text-ink">
                    Account
                    <FormSelect className="mt-1.5" value={counterAccount} onChange={(event) => setCounterAccount(event.target.value)} options={activeCounterAccounts.map((item) => item.name)} />
                  </label>
                )}

                <label className="text-[13px] font-medium text-ink">
                  Note
                  <Input className="mt-1.5" value={counterNote} onChange={(event) => setCounterNote(event.target.value)} placeholder="Optional" />
                </label>
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={postCounter}>
                  {counterType === 'Customer Receive' ? 'Receive' : counterType === 'Supplier Pay' ? 'Pay supplier' : counterType === 'Expense' ? 'Add expense' : 'Transfer'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === 'accounts' && (
          <div className="p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[13px] font-medium text-ink">Money accounts</p>
                <p className="text-[11px] text-ink-500">Cash, bank and mobile banking with opening balance and ledger access.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => openTransfer()}>
                  <ArrowLeftRight className="size-4" /> Transfer
                </Button>
                <Button size="sm" onClick={() => setAccountOpen(true)}>
                  <Plus className="size-4" /> Add account
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {accounts.map((account) => (
                <div key={account.id} className="rounded-xl border border-ink-100 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      {account.type === 'Cash' ? <Banknote className="size-4" /> : account.type === 'Bank' ? <Landmark className="size-4" /> : <WalletCards className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">{account.name}</p>
                      <p className="text-[10.5px] text-ink-400">{account.type}{account.number ? ` · ${account.number}` : ''}</p>
                    </div>
                    <StatusBadge tone={account.status === 'Active' ? 'success' : 'neutral'} dot>{account.status}</StatusBadge>
                  </div>

                  <p className="mt-4 text-2xl font-semibold text-ink">{taka(account.balance)}</p>
                  <div className="mt-1 flex items-center justify-between text-[10.5px] text-ink-400">
                    <span>Opening {taka(account.openingBalance)}</span>
                    <span>{account.lastActivity}</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-100 pt-3">
                    <Button variant="outline" size="sm" onClick={() => setAccountAction(account)}>
                      <BookOpen className="size-4" /> Ledger
                    </Button>
                    {account.type !== 'Cash' && (
                      <Button variant="outline" size="sm" onClick={() => navigate(`/app/reconciliation?account=${encodeURIComponent(account.name)}`)}>
                        <CheckCircle2 className="size-4" /> Reconcile
                      </Button>
                    )}
                    <button
                      onClick={() => setAccountAction(account)}
                      className="ml-auto rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink">
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-ink-100">
              <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Transfer history</p>
                  <p className="text-[11px] text-ink-500">Transfers between business money accounts.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openTransfer()}>
                  <Plus className="size-4" /> New transfer
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 pl-4 text-xs">Transfer</TableHead>
                    <TableHead className="h-9 text-xs">From</TableHead>
                    <TableHead className="h-9 text-xs">To</TableHead>
                    <TableHead className="h-9 text-right text-xs">Amount</TableHead>
                    <TableHead className="h-9 text-xs">Status</TableHead>
                    <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((item) => (
                    <TableRow key={item.id} className="text-[13px]">
                      <TableCell className="py-2 pl-4">
                        <p className="font-medium text-ink">{item.id}</p>
                        <p className="text-[10.5px] text-ink-400">{item.date}{item.reference ? ` · ${item.reference}` : ''}</p>
                      </TableCell>
                      <TableCell className="py-2">{item.from}</TableCell>
                      <TableCell className="py-2">{item.to}</TableCell>
                      <TableCell className="py-2 text-right font-semibold">{taka(item.amount)}</TableCell>
                      <TableCell className="py-2"><StatusBadge tone={item.status === 'Completed' ? 'success' : 'neutral'} dot>{item.status}</StatusBadge></TableCell>
                      <TableCell className="py-2 pr-4 text-right">
                        <button onClick={() => setTransferAction(item)} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink">
                          <MoreHorizontal className="size-4" />
                        </button>
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
                <p className="text-[13px] font-medium text-ink">Cheque register <span className="font-bn text-[11px] font-normal text-ink-400">· পাওয়া ও দেওয়া চেক</span></p>
                <p className="text-[11px] text-ink-500">Post-dated cheques stay visible. Bank balance changes only when a cheque clears.</p>
              </div>
              <Button size="sm" onClick={() => setChequeOpen(true)}><Plus className="size-4" /> New cheque</Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-ink-100">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 pl-4 text-xs">Cheque</TableHead>
                    <TableHead className="h-9 text-xs">Party</TableHead>
                    <TableHead className="h-9 text-xs">Bank</TableHead>
                    <TableHead className="h-9 text-xs">Cheque date</TableHead>
                    <TableHead className="h-9 text-xs">Money account</TableHead>
                    <TableHead className="h-9 text-right text-xs">Amount</TableHead>
                    <TableHead className="h-9 text-xs">Status</TableHead>
                    <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chequeRecords.map((cheque) => {
                    const pdc = cheque.chequeDate > '2026-10-07' && cheque.status !== 'Cleared';
                    return (
                      <TableRow key={cheque.id} className="text-[13px]">
                        <TableCell className="py-2 pl-4">
                          <p className="font-medium text-ink">{cheque.direction} · #{cheque.chequeNumber}</p>
                          <p className="text-[10.5px] text-ink-400">{cheque.id}{pdc ? ' · PDC' : ''}{cheque.reference ? ' · ' + cheque.reference : ''}</p>
                        </TableCell>
                        <TableCell className="py-2 font-medium text-ink">{cheque.party}</TableCell>
                        <TableCell className="py-2 text-ink-500">{cheque.bank}{cheque.branch ? ' · ' + cheque.branch : ''}</TableCell>
                        <TableCell className="py-2">
                          <p className="text-ink-600">{cheque.chequeDate}</p>
                          {pdc && <p className="font-bn text-[10.5px] text-warning">পরে জমা দেওয়ার চেক</p>}
                        </TableCell>
                        <TableCell className="py-2 text-ink-500">{cheque.depositAccount || '—'}</TableCell>
                        <TableCell className="py-2 text-right font-semibold">{taka(cheque.amount)}</TableCell>
                        <TableCell className="py-2"><StatusBadge tone={cheque.status === 'Cleared' ? 'success' : cheque.status === 'Bounced' ? 'danger' : pdc ? 'warning' : 'neutral'} dot>{cheque.status}</StatusBadge></TableCell>
                        <TableCell className="py-2 pr-4 text-right">
                          <button onClick={() => setChequeAction(cheque)} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink" aria-label={'Actions for ' + cheque.id}>
                            <MoreHorizontal className="size-4" />
                          </button>
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
          <div className="grid gap-4 p-4 xl:grid-cols-[360px_1fr]">
            <section className="rounded-xl border border-ink-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Current cash session</p>
                  <p className="text-[11px] text-ink-500">Drawer accountability without manufacturing balancing entries.</p>
                </div>
                <StatusBadge tone={sessionOpen ? 'success' : 'neutral'} dot>{sessionOpen ? 'Open' : 'Closed'}</StatusBadge>
              </div>

              {sessionOpen ? (
                <>
                  <div className="mt-4 rounded-lg bg-ink-50 p-3">
                    <p className="text-[11px] text-ink-400">{cashSessions[0].id} · opened {cashSessions[0].openedAt}</p>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10.5px] text-ink-400">Opening cash</p>
                        <p className="text-sm font-semibold text-ink">{taka(cashSessions[0].openingCash)}</p>
                      </div>
                      <div>
                        <p className="text-[10.5px] text-ink-400">Expected now</p>
                        <p className="text-sm font-semibold text-ink">{taka(cashSessions[0].expectedCash)}</p>
                      </div>
                    </div>
                  </div>
                  <Button className="mt-3 w-full" onClick={() => setCashDialogOpen(true)}>Count / close cash session</Button>
                </>
              ) : (
                <Button className="mt-4 w-full" onClick={() => setCashDialogOpen(true)}>Open cash session</Button>
              )}

              <button onClick={() => navigate('/app/reconciliation')} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-ink-100 py-2 text-xs font-medium text-ink-600 hover:bg-ink-50">
                <RefreshCw className="size-3.5" /> Cash reconciliation
              </button>
            </section>

            <section className="rounded-xl border border-ink-100">
              <div className="border-b border-ink-100 px-4 py-3">
                <p className="text-sm font-semibold text-ink">Cash session history</p>
                <p className="text-[11px] text-ink-500">Expected vs counted cash, with short/over variance kept visible.</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-9 pl-4 text-xs">Session</TableHead>
                    <TableHead className="h-9 text-xs">Opened / closed</TableHead>
                    <TableHead className="h-9 text-right text-xs">Opening</TableHead>
                    <TableHead className="h-9 text-right text-xs">Expected</TableHead>
                    <TableHead className="h-9 text-right text-xs">Counted</TableHead>
                    <TableHead className="h-9 text-right text-xs">Variance</TableHead>
                    <TableHead className="h-9 text-xs">Status</TableHead>
                    <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashSessions.map((session) => (
                    <TableRow key={session.id} className="text-[13px]">
                      <TableCell className="py-2 pl-4">
                        <p className="font-medium text-ink">{session.id}</p>
                        <p className="text-[10.5px] text-ink-400">{session.date}</p>
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
                        <StatusBadge tone={session.status === 'Open' ? 'success' : session.variance ? 'warning' : 'neutral'} dot>{session.status}</StatusBadge>
                      </TableCell>
                      <TableCell className="py-2 pr-4 text-right"><button onClick={() => setCashSessionAction(session)} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink" aria-label={'Actions for ' + session.id}><MoreHorizontal className="size-4" /></button></TableCell>
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
            if (account.name === transfer.from) return { ...account, balance: account.balance - transfer.amount, lastActivity: 'Just now' };
            if (account.name === transfer.to) return { ...account, balance: account.balance + transfer.amount, lastActivity: 'Just now' };
            return account;
          }));
          toast.success('Transfer completed', { description: transfer.from + ' → ' + transfer.to + ' · ' + taka(transfer.amount) });
        }}
      />

      <ChequeDialog
        open={chequeOpen}
        accountOptions={accounts.filter((item) => item.status === 'Active' && item.type === 'Bank').map((item) => item.name)}
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
        onClose={() => setChequeAction(null)}
        onUpdate={updateCheque}
        onStatus={changeChequeStatus}
      />

      <CashSessionDetailsDialog
        session={cashSessionAction}
        onClose={() => setCashSessionAction(null)}
        onReconcile={(session) => navigate(`/app/reconciliation?account=${encodeURIComponent('Main Cash Counter')}&session=${encodeURIComponent(session.id)}`)}
      />

      <FinanceTransactionActionDialog
        transaction={transactionAction}
        accounts={accounts}
        people={people}
        onClose={() => setTransactionAction(null)}
        onUpdate={updateFinanceTransaction}
        onReverse={reverseFinanceTransaction}
      />

      <FinanceAccountActionDialog
        account={accountAction}
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
        onClose={() => setTransferAction(null)}
        onReverse={reverseAccountTransfer}
      />
    </div>
  );
}
