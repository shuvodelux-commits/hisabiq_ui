import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import { accountingAccounts, voucherLabels } from '../../data/accounting';
import type { AccountingSourceTransaction, VoucherType } from '../../types/accounting';

const voucherTypes: VoucherType[] = ['receipt', 'payment', 'transfer', 'adjustment'];
const moneyAccounts = accountingAccounts.filter((account) => ['asset-cash', 'asset-bank', 'asset-mfs'].includes(account.id));
const nonMoneyAccounts = accountingAccounts.filter((account) => !moneyAccounts.some((money) => money.id === account.id));

export function VoucherDialog({
  open,
  onOpenChange,
  onSave
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (source: AccountingSourceTransaction) => void;
}) {
  const [type, setType] = useState<VoucherType>('receipt');
  const [date, setDate] = useState('2026-10-07');
  const [moneyAccount, setMoneyAccount] = useState(moneyAccounts[0]?.name ?? '');
  const [otherAccount, setOtherAccount] = useState(nonMoneyAccounts[0]?.name ?? '');
  const [toMoneyAccount, setToMoneyAccount] = useState(moneyAccounts[1]?.name ?? moneyAccounts[0]?.name ?? '');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');

  const other = useMemo(() => accountingAccounts.find((account) => account.name === otherAccount), [otherAccount]);
  const money = useMemo(() => accountingAccounts.find((account) => account.name === moneyAccount), [moneyAccount]);
  const toMoney = useMemo(() => accountingAccounts.find((account) => account.name === toMoneyAccount), [toMoneyAccount]);

  const save = () => {
    const value = parseFloat(amount) || 0;
    if (!value) return toast.error('Enter an amount');
    if (!description.trim()) return toast.error('Enter a description');
    const common = {
      id: `voucher-${Date.now()}`,
      reference: reference.trim() || `${voucherLabels[type].label.slice(0, 2).toUpperCase()}-${String(Date.now()).slice(-6)}`,
      transactionDate: date,
      createdAt: '2026-10-07T15:45:00+06:00',
      postedBy: 'Shuvo',
      amount: value,
      paid: value,
      due: 0,
      description: description.trim()
    } as const;

    if (type === 'transfer') {
      if (!money || !toMoney || money.id === toMoney.id) return toast.error('Choose two different money accounts');
      onSave({ ...common, source: 'transfer', fromAccount: money.name, toAccount: toMoney.name });
    } else if (type === 'receipt') {
      onSave({
        ...common,
        source: 'receipt-voucher',
        paymentAccounts: [{ account: money?.name ?? 'Main Cash Counter', amount: value }],
        creditAccountId: other?.id ?? 'income-other'
      });
    } else if (type === 'payment') {
      onSave({
        ...common,
        source: 'payment-voucher',
        paymentAccounts: [{ account: money?.name ?? 'Main Cash Counter', amount: value }],
        debitAccountId: other?.id ?? 'expense-misc'
      });
    } else {
      if (!money || !other) return toast.error('Choose both accounts');
      onSave({
        ...common,
        source: 'adjustment',
        lines: [
          { accountId: other.id, debit: value, credit: 0 },
          { accountId: money.id, debit: 0, credit: value }
        ]
      });
    }
    setAmount('');
    setReference('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New voucher <span className="font-bn text-sm font-normal text-ink-500">· নতুন ভাউচার</span></DialogTitle>
          <DialogDescription>Keep everyday entries simple. Accounting details stay balanced automatically.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-medium text-ink">
            Type
            <FormSelect className="mt-1.5" value={type} onChange={(event) => setType(event.target.value as VoucherType)} options={voucherTypes.map((item) => voucherLabels[item].label)} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            Transaction Date <span className="font-bn text-[11px] font-normal text-ink-400">· যে তারিখের লেনদেন</span>
            <Input className="mt-1.5" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>

          {type === 'transfer' ? (
            <>
              <label className="text-[13px] font-medium text-ink">
                From account <span className="font-bn text-[11px] font-normal text-ink-400">· যে অ্যাকাউন্ট থেকে</span>
                <FormSelect className="mt-1.5" value={moneyAccount} onChange={(event) => setMoneyAccount(event.target.value)} options={moneyAccounts.map((account) => account.name)} />
              </label>
              <label className="text-[13px] font-medium text-ink">
                To account <span className="font-bn text-[11px] font-normal text-ink-400">· যে অ্যাকাউন্টে</span>
                <FormSelect className="mt-1.5" value={toMoneyAccount} onChange={(event) => setToMoneyAccount(event.target.value)} options={moneyAccounts.map((account) => account.name)} />
              </label>
            </>
          ) : (
            <>
              <label className="text-[13px] font-medium text-ink">
                Money account
                <FormSelect className="mt-1.5" value={moneyAccount} onChange={(event) => setMoneyAccount(event.target.value)} options={moneyAccounts.map((account) => account.name)} />
              </label>
              <label className="text-[13px] font-medium text-ink">
                {type === 'receipt' ? 'Received for' : type === 'payment' ? 'Paid for' : 'Other account'}
                <FormSelect className="mt-1.5" value={otherAccount} onChange={(event) => setOtherAccount(event.target.value)} options={nonMoneyAccounts.map((account) => account.name)} />
              </label>
            </>
          )}

          <label className="text-[13px] font-medium text-ink">
            Amount
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
              <Input className="pl-7 text-right" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} placeholder="0" />
            </div>
          </label>
          <label className="text-[13px] font-medium text-ink">
            Reference
            <Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Optional" />
          </label>
          <label className="text-[13px] font-medium text-ink sm:col-span-2">
            Description <span className="font-bn text-[11px] font-normal text-ink-400">· কেন এই এন্ট্রি হচ্ছে</span>
            <Input className="mt-1.5" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Post voucher</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
