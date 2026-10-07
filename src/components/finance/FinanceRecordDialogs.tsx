import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Pencil, Plus, Power, Printer, RotateCcw, Save, UserRoundCog } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import { StatusBadge } from '../StatusBadge';
import {
  type AccountTransfer,
  type FinanceAccount,
  type FinanceAccountType,
  type FinancePerson,
  type FinancePersonRole,
  type FinanceTransaction,
  type FinanceTransactionType
} from '../../data/financeAccounts';
import { taka } from '../../utils/currency';

const typeMeta: Record<FinanceTransactionType, {
  role?: FinancePersonRole;
  relationship?: FinanceTransaction['relationship'];
  direction: FinanceTransaction['direction'];
  opening?: boolean;
}> = {
  'Owner Credit': { role: 'Owner', relationship: 'Owner Balance', direction: 'in' },
  'Owner Debit': { role: 'Owner', relationship: 'Owner Balance', direction: 'out' },
  'Lender Credit': { role: 'Lender', relationship: 'Lender Balance', direction: 'in' },
  'Lender Debit': { role: 'Lender', relationship: 'Lender Balance', direction: 'out' },
  'Borrower Debit': { role: 'Borrower', relationship: 'Borrower Balance', direction: 'out' },
  'Borrower Credit': { role: 'Borrower', relationship: 'Borrower Balance', direction: 'in' },
  'Opening Owner Capital': { role: 'Owner', relationship: 'Owner Balance', direction: 'none', opening: true },
  'Opening Loan': { role: 'Lender', relationship: 'Lender Balance', direction: 'none', opening: true },
  'Opening Borrower Loan': { role: 'Borrower', relationship: 'Borrower Balance', direction: 'none', opening: true },
  'Manual Bank Entry': { direction: 'in' },
  Transfer: { direction: 'none' }
};

const financeTypeOptions: FinanceTransactionType[] = [
  'Lender Credit', 'Lender Debit', 'Borrower Debit', 'Borrower Credit',
  'Owner Credit', 'Owner Debit', 'Opening Owner Capital', 'Opening Loan', 'Opening Borrower Loan'
];

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-ink-50/40 px-3 py-2.5">
      <p className="text-[10.5px] uppercase tracking-wide text-ink-400">{label}</p>
      <div className="mt-0.5 text-[13px] font-medium text-ink">{children || '—'}</div>
    </div>
  );
}

export function FinanceTransactionActionDialog({
  transaction, accounts, people, onClose, onUpdate, onReverse
}: {
  transaction: FinanceTransaction | null;
  accounts: FinanceAccount[];
  people: FinancePerson[];
  onClose: () => void;
  onUpdate: (transaction: FinanceTransaction) => void;
  onReverse: (transaction: FinanceTransaction) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmReverse, setConfirmReverse] = useState(false);
  const [type, setType] = useState<FinanceTransactionType>('Lender Credit');
  const [partyId, setPartyId] = useState('');
  const [method, setMethod] = useState<'Cash' | 'Bank' | 'Mobile Banking'>('Cash');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!transaction) return;
    setEditing(false);
    setConfirmReverse(false);
    setType(transaction.type);
    setPartyId(transaction.partyId || '');
    setMethod(transaction.method || 'Cash');
    setAccountId(transaction.accountId || '');
    setAmount(String(transaction.amount));
    setReference(transaction.reference || '');
    setNote(transaction.note || '');
  }, [transaction]);

  if (!transaction) return null;

  const meta = typeMeta[type];
  const opening = !!meta.opening;
  const peopleOptions = people.filter((person) => person.status === 'Active' && (!meta.role || person.roles.includes(meta.role)));
  const selectedPerson = peopleOptions.find((person) => person.id === partyId) || peopleOptions[0];
  const accountOptions = accounts.filter((account) =>
    account.status === 'Active' &&
    (method === 'Cash' ? account.type === 'Cash' : method === 'Bank' ? account.type === 'Bank' : account.type === 'Mobile Banking')
  );
  const selectedAccount = accountOptions.find((account) => account.id === accountId) || accountOptions[0];

  const save = () => {
    const value = parseFloat(amount) || 0;
    if (!value) return toast.error('Enter a valid amount');
    if (meta.role && !selectedPerson) return toast.error('Select a finance person');
    if (!opening && !selectedAccount) return toast.error('Select an account');
    onUpdate({
      ...transaction,
      type,
      relationship: meta.relationship,
      party: selectedPerson?.name,
      partyId: selectedPerson?.id,
      method: opening ? undefined : method,
      account: opening ? undefined : selectedAccount?.name,
      accountId: opening ? undefined : selectedAccount?.id,
      amount: value,
      direction: meta.direction,
      reference: reference.trim() || undefined,
      note: note.trim() || undefined
    });
    setEditing(false);
  };

  return (
    <Dialog open={!!transaction} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit finance transaction' : transaction.type}</DialogTitle>
          <DialogDescription>{transaction.id} · {transaction.date} · created by {transaction.createdBy}</DialogDescription>
        </DialogHeader>

        {editing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[13px] font-medium text-ink sm:col-span-2">
              Transaction type
              <FormSelect className="mt-1.5" value={type} options={financeTypeOptions} onChange={(event) => {
                const next = event.target.value as FinanceTransactionType;
                setType(next);
                const nextMeta = typeMeta[next];
                setPartyId(people.find((person) => person.status === 'Active' && (!nextMeta.role || person.roles.includes(nextMeta.role)))?.id || '');
              }} />
            </label>

            <label className="text-[13px] font-medium text-ink">
              Finance person
              <FormSelect className="mt-1.5" value={selectedPerson?.id || ''} options={peopleOptions.map((person) => person.id)} onChange={(event) => setPartyId(event.target.value)} />
              <span className="mt-1 block text-[11px] font-normal text-ink-400">{selectedPerson?.name || 'No eligible person'}</span>
            </label>

            <label className="text-[13px] font-medium text-ink">
              Amount
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
                <Input className="pl-7 text-right" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} />
              </div>
            </label>

            {!opening && <>
              <label className="text-[13px] font-medium text-ink">
                Payment method
                <FormSelect className="mt-1.5" value={method} options={['Cash', 'Petty Cash', 'Bank', 'Mobile Banking']} onChange={(event) => {
                  const next = event.target.value as typeof method;
                  setMethod(next);
                  setAccountId(accounts.find((account) =>
                    account.status === 'Active' &&
                    (next === 'Cash' ? account.type === 'Cash' : next === 'Bank' ? account.type === 'Bank' : account.type === 'Mobile Banking')
                  )?.id || '');
                }} />
              </label>
              <label className="text-[13px] font-medium text-ink">
                Account
                <FormSelect className="mt-1.5" value={selectedAccount?.id || ''} options={accountOptions.map((account) => account.id)} onChange={(event) => setAccountId(event.target.value)} />
                <span className="mt-1 block text-[11px] font-normal text-ink-400">{selectedAccount?.name || 'No active account'}</span>
              </label>
            </>}

            <label className="text-[13px] font-medium text-ink">
              Reference
              <Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Optional" />
            </label>
            <label className="text-[13px] font-medium text-ink">
              Note
              <Input className="mt-1.5" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" />
            </label>
          </div>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Relationship">{transaction.relationship}</Detail>
              <Detail label="Party">{transaction.party}</Detail>
              <Detail label="Amount">{(transaction.direction === 'in' ? '+' : transaction.direction === 'out' ? '−' : '') + taka(transaction.amount)}</Detail>
              <Detail label="Payment method">{transaction.method || 'No money movement'}</Detail>
              <Detail label="Account">{transaction.account}</Detail>
              <Detail label="Status"><StatusBadge tone={transaction.status === 'Active' ? 'success' : 'neutral'} dot>{transaction.status}</StatusBadge></Detail>
              <Detail label="Reference">{transaction.reference}</Detail>
              <Detail label="Notes">{transaction.note}</Detail>
              <Detail label="Created by">{transaction.createdBy}</Detail>
            </div>
            {confirmReverse && (
              <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5">
                <p className="text-[13px] font-medium text-danger">Reverse this transaction?</p>
                <p className="mt-0.5 text-[11px] text-ink-500">The audit record remains visible and the related money movement is restored.</p>
              </div>
            )}
          </>
        )}

        <DialogFooter>
          {editing ? <>
            <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={save}><Save className="size-4" /> Save changes</Button>
          </> : confirmReverse ? <>
            <Button variant="outline" onClick={() => setConfirmReverse(false)}>Keep transaction</Button>
            <Button onClick={() => { onReverse(transaction); setConfirmReverse(false); }}><RotateCcw className="size-4" /> Confirm reverse</Button>
          </> : <>
            <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
            {transaction.status === 'Active' && <>
              <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="size-4" /> Edit</Button>
              <Button variant="outline" onClick={() => setConfirmReverse(true)}><RotateCcw className="size-4" /> Reverse</Button>
            </>}
            <Button onClick={onClose}>Close</Button>
          </>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FinanceAccountActionDialog({
  account, transactions, transfers, onClose, onUpdate, onToggleStatus, onManualEntry
}: {
  account: FinanceAccount | null;
  transactions: FinanceTransaction[];
  transfers: AccountTransfer[];
  onClose: () => void;
  onUpdate: (account: FinanceAccount) => void;
  onToggleStatus: (account: FinanceAccount) => void;
  onManualEntry: (account: FinanceAccount, direction: 'in' | 'out', amount: number, reference?: string, note?: string) => void;
}) {
  const [mode, setMode] = useState<'ledger' | 'edit' | 'manual'>('ledger');
  const [confirmStatus, setConfirmStatus] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<FinanceAccountType>('Bank');
  const [institution, setInstitution] = useState('');
  const [number, setNumber] = useState('');
  const [manualDirection, setManualDirection] = useState<'in' | 'out'>('in');
  const [manualAmount, setManualAmount] = useState('');
  const [manualReference, setManualReference] = useState('');
  const [manualNote, setManualNote] = useState('');

  useEffect(() => {
    if (!account) return;
    setMode('ledger');
    setConfirmStatus(false);
    setName(account.name);
    setType(account.type);
    setInstitution(account.institution || '');
    setNumber(account.number || '');
    setManualDirection('in');
    setManualAmount('');
    setManualReference('');
    setManualNote('');
  }, [account]);

  const ledgerRows = useMemo(() => {
    if (!account) return [];
    const rows = transactions.filter((item) => item.accountId === account.id || item.account === account.name).map((item) => ({
      id: item.id, date: item.date, label: item.type, amount: item.amount, direction: item.direction, reference: item.reference || ''
    }));
    const transferRows = transfers.filter((item) => item.from === account.name || item.to === account.name).map((item) => ({
      id: item.id,
      date: item.date,
      label: item.from === account.name ? 'Transfer to ' + item.to : 'Transfer from ' + item.from,
      amount: item.amount,
      direction: item.from === account.name ? 'out' as const : 'in' as const,
      reference: item.reference || ''
    }));
    return [...rows, ...transferRows].slice(0, 8);
  }, [account, transactions, transfers]);

  if (!account) return null;

  const saveEdit = () => {
    if (!name.trim()) return toast.error('Account name is required');
    onUpdate({ ...account, name: name.trim(), type, institution: institution.trim() || undefined, number: number.trim() || undefined });
    setMode('ledger');
  };

  const saveManual = () => {
    const value = parseFloat(manualAmount) || 0;
    if (!value) return toast.error('Enter a valid amount');
    onManualEntry(account, manualDirection, value, manualReference.trim() || undefined, manualNote.trim() || undefined);
    setManualAmount('');
    setManualReference('');
    setManualNote('');
    setMode('ledger');
  };

  return (
    <Dialog open={!!account} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{account.name}</DialogTitle>
          <DialogDescription>{account.type}{account.number ? ' · ' + account.number : ''} · current balance {taka(account.balance)}</DialogDescription>
        </DialogHeader>

        {mode === 'ledger' && <>
          <div className="grid gap-2 sm:grid-cols-3">
            <Detail label="Current balance">{taka(account.balance)}</Detail>
            <Detail label="Opening balance">{taka(account.openingBalance)}</Detail>
            <Detail label="Status"><StatusBadge tone={account.status === 'Active' ? 'success' : 'neutral'} dot>{account.status}</StatusBadge></Detail>
          </div>
          <div className="overflow-hidden rounded-xl border border-ink-100">
            <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/50 px-3 py-2.5">
              <div>
                <p className="text-[13px] font-medium text-ink">Recent ledger</p>
                <p className="text-[10.5px] text-ink-400">Finance entries and account transfers linked here.</p>
              </div>
              <BookOpen className="size-4 text-ink-300" />
            </div>
            <div className="divide-y divide-ink-100">
              {ledgerRows.length ? ledgerRows.map((row) => (
                <div key={row.id} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] font-medium text-ink">{row.label}</p>
                    <p className="text-[10.5px] text-ink-400">{row.date} · {row.id}{row.reference ? ' · ' + row.reference : ''}</p>
                  </div>
                  <p className={'text-[12.5px] font-semibold ' + (row.direction === 'in' ? 'text-success' : row.direction === 'out' ? 'text-ink' : 'text-info')}>
                    {(row.direction === 'in' ? '+' : row.direction === 'out' ? '−' : '') + taka(row.amount)}
                  </p>
                </div>
              )) : <p className="px-3 py-8 text-center text-sm text-ink-400">No ledger entries yet.</p>}
            </div>
          </div>
          {confirmStatus && (
            <div className="rounded-lg border border-warning/20 bg-warning/5 px-3 py-2.5">
              <p className="text-[13px] font-medium text-ink">{account.status === 'Active' ? 'Deactivate' : 'Activate'} this account?</p>
              <p className="mt-0.5 text-[11px] text-ink-500">History remains intact. Inactive accounts disappear from new payment selections.</p>
            </div>
          )}
        </>}

        {mode === 'edit' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[13px] font-medium text-ink">
              Account type
              <FormSelect className="mt-1.5" value={type} options={['Cash', 'Petty Cash', 'Bank', 'Mobile Banking']} onChange={(event) => setType(event.target.value as FinanceAccountType)} />
            </label>
            <label className="text-[13px] font-medium text-ink">
              Account name
              <Input className="mt-1.5" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            {type !== 'Cash' && <>
              <label className="text-[13px] font-medium text-ink">
                {type === 'Bank' ? 'Bank name' : type === 'Mobile Banking' ? 'Provider' : 'Label'}
                <Input className="mt-1.5" value={institution} onChange={(event) => setInstitution(event.target.value)} />
              </label>
              <label className="text-[13px] font-medium text-ink">
                Account number
                <Input className="mt-1.5" value={number} onChange={(event) => setNumber(event.target.value)} />
              </label>
            </>}
            <div className="sm:col-span-2 rounded-lg bg-ink-50 px-3 py-2 text-[11px] text-ink-500">
              Opening balance is historical setup. Use Manual Entry for a real correction.
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[13px] font-medium text-ink">
              Direction
              <FormSelect className="mt-1.5" value={manualDirection} options={['in', 'out']} onChange={(event) => setManualDirection(event.target.value as 'in' | 'out')} />
              <span className="mt-1 block text-[11px] font-normal text-ink-400">{manualDirection === 'in' ? 'Adds to the account.' : 'Subtracts from the account.'}</span>
            </label>
            <label className="text-[13px] font-medium text-ink">
              Amount
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
                <Input className="pl-7 text-right" inputMode="decimal" value={manualAmount} onChange={(event) => setManualAmount(event.target.value.replace(/[^\d.]/g, ''))} />
              </div>
            </label>
            <label className="text-[13px] font-medium text-ink">
              Reference
              <Input className="mt-1.5" value={manualReference} onChange={(event) => setManualReference(event.target.value)} placeholder="Optional" />
            </label>
            <label className="text-[13px] font-medium text-ink">
              Description / note
              <Input className="mt-1.5" value={manualNote} onChange={(event) => setManualNote(event.target.value)} placeholder="Why is this entry needed?" />
            </label>
          </div>
        )}

        <DialogFooter>
          {mode === 'ledger' && !confirmStatus && <>
            <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
            <Button variant="outline" onClick={() => setMode('manual')}><Plus className="size-4" /> Manual entry</Button>
            <Button variant="outline" onClick={() => setMode('edit')}><Pencil className="size-4" /> Edit</Button>
            <Button variant="outline" onClick={() => setConfirmStatus(true)}><Power className="size-4" /> {account.status === 'Active' ? 'Deactivate' : 'Activate'}</Button>
            <Button onClick={onClose}>Close</Button>
          </>}
          {mode === 'ledger' && confirmStatus && <>
            <Button variant="outline" onClick={() => setConfirmStatus(false)}>Cancel</Button>
            <Button onClick={() => { onToggleStatus(account); setConfirmStatus(false); }}>Confirm {account.status === 'Active' ? 'deactivate' : 'activate'}</Button>
          </>}
          {mode === 'edit' && <>
            <Button variant="outline" onClick={() => setMode('ledger')}>Cancel</Button>
            <Button onClick={saveEdit}><Save className="size-4" /> Save changes</Button>
          </>}
          {mode === 'manual' && <>
            <Button variant="outline" onClick={() => setMode('ledger')}>Cancel</Button>
            <Button onClick={saveManual}>Record entry</Button>
          </>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FinanceTransferActionDialog({
  transfer, onClose, onReverse
}: {
  transfer: AccountTransfer | null;
  onClose: () => void;
  onReverse: (transfer: AccountTransfer) => void;
}) {
  const [confirmReverse, setConfirmReverse] = useState(false);
  useEffect(() => setConfirmReverse(false), [transfer]);
  if (!transfer) return null;

  return (
    <Dialog open={!!transfer} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Account transfer</DialogTitle>
          <DialogDescription>{transfer.id} · {transfer.date}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          <Detail label="From">{transfer.from}</Detail>
          <Detail label="To">{transfer.to}</Detail>
          <Detail label="Amount">{taka(transfer.amount)}</Detail>
          <Detail label="Status"><StatusBadge tone={transfer.status === 'Completed' ? 'success' : 'neutral'} dot>{transfer.status}</StatusBadge></Detail>
          <div className="sm:col-span-2"><Detail label="Reference">{transfer.reference}</Detail></div>
        </div>
        {confirmReverse && (
          <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5">
            <p className="text-[13px] font-medium text-danger">Reverse this transfer?</p>
            <p className="mt-0.5 text-[11px] text-ink-500">Both account balances are restored while the audit record stays visible.</p>
          </div>
        )}
        <DialogFooter>
          {confirmReverse ? <>
            <Button variant="outline" onClick={() => setConfirmReverse(false)}>Keep transfer</Button>
            <Button onClick={() => { onReverse(transfer); setConfirmReverse(false); }}><RotateCcw className="size-4" /> Confirm reverse</Button>
          </> : <>
            <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
            {transfer.status === 'Completed' && <Button variant="outline" onClick={() => setConfirmReverse(true)}><RotateCcw className="size-4" /> Reverse</Button>}
            <Button onClick={onClose}>Close</Button>
          </>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FinancePeopleManagerDialog({
  open, people, onOpenChange, onAdd, onUpdate
}: {
  open: boolean;
  people: FinancePerson[];
  onOpenChange: (open: boolean) => void;
  onAdd: (person: FinancePerson) => void;
  onUpdate: (person: FinancePerson) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [roles, setRoles] = useState<FinancePersonRole[]>(['Lender']);

  const reset = () => {
    setEditingId(null);
    setName('');
    setPhone('');
    setDescription('');
    setRoles(['Lender']);
  };

  useEffect(() => { if (!open) reset(); }, [open]);

  const editing = people.find((person) => person.id === editingId);
  const startEdit = (person: FinancePerson) => {
    setEditingId(person.id);
    setName(person.name);
    setPhone(person.phone || '');
    setDescription(person.description || '');
    setRoles(person.roles);
  };
  const toggleRole = (role: FinancePersonRole) => {
    setRoles((current) => current.includes(role) ? current.filter((item) => item !== role) : [...current, role]);
  };
  const save = () => {
    if (!name.trim() || !roles.length) return toast.error('Enter a name and choose at least one role');
    if (editing) {
      onUpdate({ ...editing, name: name.trim(), phone: phone.trim() || undefined, description: description.trim() || undefined, roles });
    } else {
      onAdd({ id: 'fp-' + Date.now(), name: name.trim(), phone: phone.trim() || undefined, description: description.trim() || undefined, roles, status: 'Active' });
    }
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle><UserRoundCog className="mr-2 inline size-4" />Finance people</DialogTitle>
          <DialogDescription>Manage Owner, Lender and Borrower roles without cross-netting balances.</DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-ink-100">
          <div className="grid gap-2 border-b border-ink-100 bg-ink-50/60 p-3 md:grid-cols-2">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" />
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" />
            <Input className="md:col-span-2" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description / relationship note" />
            <div className="flex flex-wrap gap-1.5 md:col-span-2">
              {(['Owner', 'Lender', 'Borrower'] as FinancePersonRole[]).map((role) => (
                <button key={role} type="button" onClick={() => toggleRole(role)}
                  className={'rounded-md border px-2 py-1 text-xs font-medium ' + (roles.includes(role) ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-ink-100 bg-white text-ink-500')}>
                  {role}
                </button>
              ))}
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button onClick={save}>{editing ? <Save className="size-4" /> : <Plus className="size-4" />} {editing ? 'Save person' : 'Add person'}</Button>
              {editing && <Button variant="outline" onClick={reset}>Cancel edit</Button>}
            </div>
          </div>

          <div className="max-h-80 divide-y divide-ink-100 overflow-auto">
            {people.map((person) => (
              <div key={person.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink-50 text-xs font-semibold text-ink-600">
                  {person.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{person.name}</p>
                  <p className="text-[10.5px] text-ink-400">{person.phone || 'No phone'}{person.description ? ' · ' + person.description : ''}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {person.roles.map((role) => <StatusBadge key={role} tone="neutral">{role}</StatusBadge>)}
                  <StatusBadge tone={person.status === 'Active' ? 'success' : 'neutral'} dot>{person.status}</StatusBadge>
                </div>
                <Button variant="outline" size="sm" onClick={() => startEdit(person)}><Pencil className="size-3.5" /> Edit</Button>
                <Button variant="outline" size="sm" onClick={() => onUpdate({ ...person, status: person.status === 'Active' ? 'Inactive' : 'Active' })}>
                  <Power className="size-3.5" /> {person.status === 'Active' ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter><Button onClick={() => onOpenChange(false)}>Done</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
