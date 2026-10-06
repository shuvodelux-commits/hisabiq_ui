import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { FormSelect } from '../FormSelect';
import { PhotoUploader } from '../products/PhotoUploader';
import { parties } from '../../data/parties';
import { expenseCategories } from '../../data/purchases';
import type { Expense, PaymentMethod, Purchase } from '../../types/erp';
import { taka } from '../../utils/currency';

type BillDialogProps = {
  mode: 'purchase' | 'expense';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextRef: string;
  onSavePurchase: (p: Purchase) => void;
  onSaveExpense: (e: Expense) => void;
};

const suppliers = parties.filter((p) => p.roles.some((r) => r === 'Supplier' || r === 'Vendor'));
const payees = parties.filter((p) => p.roles.some((r) => r === 'Payee' || r === 'Vendor'));
const methods: PaymentMethod[] = ['Cash', 'bKash', 'Nagad', 'Bank', 'Card'];

export function BillDialog({ mode, open, onOpenChange, nextRef, onSavePurchase, onSaveExpense }: BillDialogProps) {
  const [party, setParty] = useState(mode === 'purchase' ? suppliers[0].name : payees[0].name);
  const [category, setCategory] = useState(expenseCategories[2]);
  const [items, setItems] = useState('');
  const [total, setTotal] = useState('');
  const [paid, setPaid] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');

  const totalNum = parseFloat(total) || 0;
  const paidNum = Math.min(parseFloat(paid) || 0, totalNum);
  const due = totalNum - paidNum;
  const list = mode === 'purchase' ? suppliers : payees;

  const save = () => {
    if (!totalNum) return setError('Enter the bill amount.');
    const p = list.find((x) => x.name === party);
    if (mode === 'purchase') {
      onSavePurchase({
        id: `pu${Date.now()}`,
        ref: nextRef,
        date: '01 Oct 2026',
        supplierId: p?.id ?? '',
        supplier: party,
        items: items || 'Items not itemised',
        total: totalNum,
        paid: paidNum,
        receipt: photos[0]
      });
    } else {
      onSaveExpense({
        id: `e${Date.now()}`,
        ref: nextRef,
        date: '01 Oct 2026',
        category,
        payee: party,
        payeeId: p?.id,
        note: items,
        amount: totalNum,
        paid: paidNum,
        method,
        receipt: photos[0]
      });
    }
    setItems('');
    setTotal('');
    setPaid('');
    setPhotos([]);
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'purchase' ? 'Record purchase' : 'Add expense'}{' '}
            <span className="font-bn text-sm font-normal text-ink-500">{mode === 'purchase' ? 'ক্রয়' : 'খরচ'}</span>
          </DialogTitle>
          <DialogDescription>{nextRef} · 01 Oct 2026 · Snap the memo so it’s never lost.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[13px] font-medium text-ink">
            {mode === 'purchase' ? 'Supplier' : 'Paid to'}
            <FormSelect className="mt-1.5" value={party} onChange={(e) => setParty(e.target.value)} options={list.map((x) => x.name)} />
          </label>
          {mode === 'expense' ?
          <label className="block text-[13px] font-medium text-ink">
              Category
              <FormSelect className="mt-1.5" value={category} onChange={(e) => setCategory(e.target.value)} options={expenseCategories} />
            </label> :

          <label className="block text-[13px] font-medium text-ink">
              Payment method
              <FormSelect className="mt-1.5" value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)} options={methods} />
            </label>
          }
          <label className="block text-[13px] font-medium text-ink sm:col-span-2">
            {mode === 'purchase' ? 'Items' : 'Note'}
            <Input className="mt-1.5" value={items} onChange={(e) => setItems(e.target.value)} placeholder={mode === 'purchase' ? 'e.g. PVC Pipe 1" × 80 Pcs' : 'e.g. Van fare, Bangshal → shop'} />
          </label>
          <label className="block text-[13px] font-medium text-ink">
            Bill amount
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
              <Input value={total} onChange={(e) => setTotal(e.target.value.replace(/[^\d.]/g, ''))} className="pl-7 text-right tabular-nums" inputMode="decimal" placeholder="0" />
            </div>
          </label>
          <label className="block text-[13px] font-medium text-ink">
            Paid now
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
              <Input value={paid} onChange={(e) => setPaid(e.target.value.replace(/[^\d.]/g, ''))} className="pl-7 text-right tabular-nums" inputMode="decimal" placeholder="0" />
            </div>
          </label>
        </div>

        {totalNum > 0 &&
        <div className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-2 text-sm">
            <span className="text-ink-500">{due > 0 ? `Due to ${party}` : 'Fully paid'}</span>
            <span className={`font-semibold tabular-nums ${due > 0 ? 'text-danger' : 'text-success'}`}>{taka(due)}</span>
          </div>
        }

        <div>
          <p className="mb-1.5 text-[13px] font-medium text-ink">Receipt photo <span className="font-normal text-ink-400">· রসিদের ছবি</span></p>
          <PhotoUploader photos={photos} onChange={setPhotos} max={2} label="Attach" hint="JPG or PNG. Memo, cash receipt or delivery challan." />
        </div>

        {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save {mode}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}