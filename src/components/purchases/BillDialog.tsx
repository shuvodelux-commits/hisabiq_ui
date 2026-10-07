import React, { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { FormSelect } from '../FormSelect';
import { PhotoUploader } from '../products/PhotoUploader';
import { parties } from '../../data/parties';
import { products } from '../../data/products';
import { stockLots } from '../../data/productInventory';
import { salesInvoices } from '../../data/sales';
import { expenseCategories } from '../../data/purchases';
import type { Expense, PaymentMethod, PaymentSplit, Product, Purchase } from '../../types/erp';
import { taka } from '../../utils/currency';
import { duplicateSerials, normalizeSerials, requiredSerialCount } from '../../utils/productFeatures';

type BillDialogProps = {
  mode: 'purchase' | 'expense';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextRef: string;
  onSavePurchase: (p: Purchase) => void;
  onSaveExpense: (e: Expense) => void;
};

type PurchaseLine = {
  id: string;
  productId: string;
  bigQty: string;
  smallQty: string;
  unitCost: string;
  serialText: string;
  batchNumber: string;
  manufactureDate: string;
  expiryDate: string;
};

type StandardPaymentMethod = Exclude<PaymentMethod, 'Customer Credit'>;

type PaymentRow = {
  id: string;
  method: StandardPaymentMethod;
  account: string;
  amount: string;
};

const suppliers = parties.filter((p) => p.roles.some((r) => r === 'Supplier' || r === 'Vendor'));
const payees = parties.filter((p) => p.roles.some((r) => r === 'Payee' || r === 'Vendor'));
const methods: StandardPaymentMethod[] = ['Cash', 'bKash', 'Nagad', 'Bank', 'Card'];
const accountsByMethod: Record<StandardPaymentMethod, string[]> = {
  Cash: ['Cash counter'],
  Bank: ['Dutch-Bangla Bank · 4582'],
  Card: ['Dutch-Bangla Bank · 4582'],
  bKash: ['bKash Business · 01711•••412'],
  Nagad: ['Nagad Merchant · 01819•••771']
};
const today = '2026-10-07';
const stockProducts = products.filter((product) => product.kind !== 'Service');

function productFor(line: PurchaseLine): Product {
  return stockProducts.find((product) => product.id === line.productId) ?? stockProducts[0];
}

function lineBaseQty(line: PurchaseLine): number {
  const product = productFor(line);
  const big = parseFloat(line.bigQty) || 0;
  const small = parseFloat(line.smallQty) || 0;
  return product.altUnit ? big * product.altUnit.factor + small : small;
}

function lineTotal(line: PurchaseLine): number {
  return lineBaseQty(line) * (parseFloat(line.unitCost) || 0);
}

function quantityLabel(line: PurchaseLine): string {
  const product = productFor(line);
  const big = parseFloat(line.bigQty) || 0;
  const small = parseFloat(line.smallQty) || 0;
  if (!product.altUnit) return `${small || 0} ${product.unit}`;
  const parts: string[] = [];
  if (big) parts.push(`${big} ${product.altUnit.unit}`);
  if (small) parts.push(`${small} ${product.unit}`);
  return parts.length ? parts.join(' ') : `0 ${product.unit}`;
}

function newPaymentRow(seedIndex = 0, method: StandardPaymentMethod = 'Cash'): PaymentRow {
  return {
    id: `payment-${Date.now()}-${seedIndex}`,
    method,
    account: accountsByMethod[method][0],
    amount: ''
  };
}

function newLine(seedIndex = 1): PurchaseLine {
  const product = stockProducts[seedIndex % stockProducts.length];
  return {
    id: `line-${Date.now()}-${seedIndex}`,
    productId: product.id,
    bigQty: product.altUnit ? '1' : '',
    smallQty: product.altUnit ? '0' : '1',
    unitCost: String(product.purchasePrice),
    serialText: '',
    batchNumber: '',
    manufactureDate: '',
    expiryDate: ''
  };
}

export function BillDialog({ mode, open, onOpenChange, nextRef, onSavePurchase, onSaveExpense }: BillDialogProps) {
  const [party, setParty] = useState(mode === 'purchase' ? suppliers[0].name : payees[0].name);
  const [category, setCategory] = useState(expenseCategories[2]);
  const [date, setDate] = useState(today);
  const [backdateReason, setBackdateReason] = useState('');
  const [description, setDescription] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([newPaymentRow()]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [lines, setLines] = useState<PurchaseLine[]>([newLine()]);
  const [error, setError] = useState('');

  const isBackdated = date !== today;
  const list = mode === 'purchase' ? suppliers : payees;
  const purchaseTotal = useMemo(() => lines.reduce((sum, line) => sum + lineTotal(line), 0), [lines]);
  const totalNum = mode === 'purchase' ? purchaseTotal : parseFloat(amount) || 0;
  const paymentTotal = paymentRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
  const paidNum = Math.min(paymentTotal, totalNum);
  const due = Math.max(totalNum - paidNum, 0);
  const overpaid = Math.max(paymentTotal - totalNum, 0);

  const updatePayment = (id: string, patch: Partial<PaymentRow>) => {
    setPaymentRows((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const changePaymentMethod = (id: string, method: StandardPaymentMethod) => {
    setPaymentRows((rows) => rows.map((row) => row.id === id ? {
      ...row,
      method,
      account: accountsByMethod[method][0]
    } : row));
  };

  const paymentSplits: PaymentSplit[] = paymentRows
    .filter((row) => (parseFloat(row.amount) || 0) > 0)
    .map((row) => ({
      id: row.id,
      method: row.method,
      amount: parseFloat(row.amount),
      ...(row.account ? { account: row.account } : {})
    }));

  const updateLine = (id: string, patch: Partial<PurchaseLine>) => {
    setLines((current) => current.map((line) => line.id === id ? { ...line, ...patch } : line));
  };

  const changeLineProduct = (id: string, name: string) => {
    const product = stockProducts.find((item) => item.name === name) ?? stockProducts[0];
    setLines((current) =>
      current.map((line) =>
        line.id === id
          ? {
              ...line,
              productId: product.id,
              bigQty: product.altUnit ? '1' : '',
              smallQty: product.altUnit ? '0' : '1',
              unitCost: String(product.purchasePrice),
              serialText: '',
              batchNumber: '',
              manufactureDate: '',
              expiryDate: ''
            }
          : line
      )
    );
  };

  const reset = () => {
    setDate(today);
    setBackdateReason('');
    setDescription('');
    setReferenceNo('');
    setNotes('');
    setAmount('');
    setPaymentRows([newPaymentRow()]);
    setPhotos([]);
    setLines([newLine()]);
    setError('');
  };

  const save = () => {
    if (!totalNum) {
      setError(mode === 'purchase' ? 'Add at least one purchase item with quantity and cost.' : 'Enter the expense amount.');
      return;
    }
    if (isBackdated && !backdateReason.trim()) {
      setError('Enter a reason for the backdated transaction.');
      return;
    }
    if (paymentTotal > totalNum) {
      setError(`Payments exceed the transaction total by ${taka(paymentTotal - totalNum)}.`);
      return;
    }

    const selectedParty = list.find((item) => item.name === party);
    if (mode === 'purchase') {
      const existingSerials = [
        ...stockLots.flatMap((lot) => lot.serials ?? []),
        ...salesInvoices.flatMap((invoice) => invoice.lines.flatMap((line) => line.serials ?? []))
      ];
      const enteredAcrossLines: string[] = [];
      for (const line of lines.filter((item) => lineBaseQty(item) > 0)) {
        const product = productFor(line);
        const serials = normalizeSerials(line.serialText);
        const duplicate = duplicateSerials(serials, [...existingSerials, ...enteredAcrossLines]);
        if (duplicate.length) {
          setError(`${product.name}: duplicate serial ${duplicate[0]}.`);
          return;
        }
        const required = requiredSerialCount(product, lineBaseQty(line));
        if (required > 0 && !Number.isInteger(lineBaseQty(line))) {
          setError(`${product.name}: Required serial tracking needs a whole base-unit quantity.`);
          return;
        }
        if (required > 0 && serials.length !== required) {
          setError(`${product.name}: ${required} unique serials required, ${serials.length} entered.`);
          return;
        }
        if (product.expiry?.enabled && product.expiry.dateRequired && !line.expiryDate) {
          setError(`${product.name}: expiry date is required.`);
          return;
        }
        if (line.manufactureDate && line.expiryDate && line.expiryDate <= line.manufactureDate) {
          setError(`${product.name}: expiry date must be after manufacture date.`);
          return;
        }
        enteredAcrossLines.push(...serials);
      }
      const items = lines
        .filter((line) => lineBaseQty(line) > 0)
        .map((line) => `${productFor(line).name} · ${quantityLabel(line)}`)
        .join(', ');

      onSavePurchase({
        id: `pu${Date.now()}`,
        ref: nextRef,
        date: date === today ? '07 Oct 2026' : date,
        supplierId: selectedParty?.id ?? '',
        supplier: party,
        items: items || 'Items not itemised',
        total: totalNum,
        paid: paidNum,
        payments: paymentSplits,
        receipt: photos[0],
        inventoryLines: lines
          .filter((line) => lineBaseQty(line) > 0)
          .map((line) => ({
            productId: line.productId,
            quantity: lineBaseQty(line),
            serials: normalizeSerials(line.serialText).length ? normalizeSerials(line.serialText) : undefined,
            batchNumber: line.batchNumber.trim() || undefined,
            manufactureDate: line.manufactureDate || undefined,
            expiryDate: line.expiryDate || undefined
          }))
      });
    } else {
      const combinedNote = [description, referenceNo ? `Ref: ${referenceNo}` : '', notes].filter(Boolean).join(' · ');
      onSaveExpense({
        id: `e${Date.now()}`,
        ref: nextRef,
        date: date === today ? '07 Oct 2026' : date,
        category,
        payee: party,
        payeeId: selectedParty?.id,
        note: combinedNote || 'Expense',
        amount: totalNum,
        paid: paidNum,
        method: paymentSplits[0]?.method ?? 'Cash',
        payments: paymentSplits,
        receipt: photos[0]
      });
    }

    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={mode === 'purchase' ? 'max-h-[92vh] overflow-y-auto sm:max-w-4xl scrollbar-thin' : 'max-h-[92vh] overflow-y-auto sm:max-w-2xl scrollbar-thin'}>
        <DialogHeader>
          <DialogTitle>
            {mode === 'purchase' ? 'New purchase' : 'Add expense'}{' '}
            <span className="font-bn text-sm font-normal text-ink-500">{mode === 'purchase' ? 'ক্রয়' : 'খরচ'}</span>
          </DialogTitle>
          <DialogDescription>
            {nextRef} · Keep the operational detail from the legacy ERP, presented in the HisabIQ design system.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-[13px] font-medium text-ink">
            {mode === 'purchase' ? 'Supplier' : 'Payee'}
            <div className="mt-1.5 flex">
              <FormSelect
                className="min-w-0 flex-1 [&>select]:rounded-r-none"
                value={party}
                onChange={(event) => setParty(event.target.value)}
                options={list.map((item) => item.name)}
              />
              <button
                type="button"
                className="-ml-px flex size-9 shrink-0 items-center justify-center rounded-r-md border border-input bg-card text-teal-700 hover:bg-teal-50"
                onClick={() => toast(mode === 'purchase' ? 'Add supplier' : 'Add payee')}>
                <Plus className="size-4" />
                <span className="sr-only">{mode === 'purchase' ? 'Add supplier' : 'Add payee'}</span>
              </button>
            </div>
          </label>

          <label className="block text-[13px] font-medium text-ink">
            {mode === 'purchase' ? 'Purchase date' : 'Expense date'}
            <Input className="mt-1.5" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>

          {isBackdated && (
            <label className="block text-[13px] font-medium text-ink sm:col-span-2">
              Reason for backdating <span className="text-danger">*</span>
              <Input
                className="mt-1.5"
                value={backdateReason}
                onChange={(event) => setBackdateReason(event.target.value)}
                placeholder="Why is this transaction being entered with an earlier date?"
              />
            </label>
          )}
        </div>

        {mode === 'purchase' ? (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border bg-ink-50/60 px-3 py-2">
              <div>
                <p className="text-[13px] font-medium text-ink">Products</p>
                <p className="text-[11px] text-ink-500">Purchase in large + small units where a conversion exists.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setLines((current) => [...current, newLine(current.length + 1)])}>
                <Plus className="size-4" /> Add product
              </Button>
            </div>

            <div className="divide-y divide-border">
              {lines.map((line, index) => {
                const product = productFor(line);
                const total = lineTotal(line);
                return (
                  <div key={line.id} className="grid gap-2 p-3 lg:grid-cols-[1.7fr_1.25fr_120px_120px_32px] lg:items-end">
                    <label className="text-[12px] font-medium text-ink">
                      {index + 1}. Product
                      <FormSelect
                        className="mt-1"
                        value={product.name}
                        onChange={(event) => changeLineProduct(line.id, event.target.value)}
                        options={stockProducts.filter((item) => item.active).map((item) => item.name)}
                      />
                    </label>

                    <div>
                      <p className="text-[12px] font-medium text-ink">Quantity</p>
                      <div className="mt-1 flex gap-1.5">
                        {product.altUnit && (
                          <div className="relative min-w-0 flex-1">
                            <Input
                              value={line.bigQty}
                              onChange={(event) => updateLine(line.id, { bigQty: event.target.value.replace(/[^\d.]/g, '') })}
                              inputMode="decimal"
                              className="pr-14 text-right"
                            />
                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-ink-400">{product.altUnit.unit}</span>
                          </div>
                        )}
                        <div className="relative min-w-0 flex-1">
                          <Input
                            value={line.smallQty}
                            onChange={(event) => updateLine(line.id, { smallQty: event.target.value.replace(/[^\d.]/g, '') })}
                            inputMode="decimal"
                            className="pr-12 text-right"
                          />
                          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-ink-400">{product.unit}</span>
                        </div>
                      </div>
                    </div>

                    <label className="text-[12px] font-medium text-ink">
                      Unit cost
                      <div className="relative mt-1">
                        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-400">৳</span>
                        <Input
                          value={line.unitCost}
                          onChange={(event) => updateLine(line.id, { unitCost: event.target.value.replace(/[^\d.]/g, '') })}
                          inputMode="decimal"
                          className="pl-6 text-right"
                        />
                      </div>
                    </label>

                    <div className="text-right">
                      <p className="text-[12px] font-medium text-ink">Line total</p>
                      <p className="mt-2 h-9 py-2 text-[13px] font-semibold text-ink">{taka(total)}</p>
                    </div>

                    <button
                      type="button"
                      disabled={lines.length === 1}
                      className="mb-0.5 flex size-8 items-center justify-center rounded-md text-ink-400 hover:bg-danger-bg hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
                      onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}>
                      <Trash2 className="size-4" />
                      <span className="sr-only">Remove line</span>
                    </button>

                    {((product.serialTracking ?? 'Off') !== 'Off' || product.expiry?.enabled) && (
                      <div className="rounded-lg border border-border bg-ink-50/40 p-2.5 lg:col-span-5">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-400">Tracking details <span className="font-bn normal-case tracking-normal">· সিরিয়াল / মেয়াদ</span></p>
                        <div className="grid gap-2 md:grid-cols-2">
                          {(product.serialTracking ?? 'Off') !== 'Off' && (
                            <label className="text-[12px] font-medium text-ink">
                              Serials
                              <textarea
                                value={line.serialText}
                                onChange={(event) => updateLine(line.id, { serialText: event.target.value })}
                                placeholder="Scan, type or paste serials"
                                className="mt-1 min-h-20 w-full rounded-md border border-input bg-card px-2.5 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                              />
                              <span className="mt-1 block text-[11px] font-normal text-ink-400">
                                {normalizeSerials(line.serialText).length} entered{product.serialTracking === 'Required' ? ` · ${requiredSerialCount(product, lineBaseQty(line))} required` : ' · optional'}
                              </span>
                            </label>
                          )}
                          {product.expiry?.enabled && (
                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-[12px] font-medium text-ink">Batch<Input className="mt-1" value={line.batchNumber} onChange={(event) => updateLine(line.id, { batchNumber: event.target.value })} /></label>
                              <label className="text-[12px] font-medium text-ink">Manufacture<Input className="mt-1" type="date" value={line.manufactureDate} onChange={(event) => updateLine(line.id, { manufactureDate: event.target.value })} /></label>
                              <label className="col-span-2 text-[12px] font-medium text-ink">Expiry {product.expiry.dateRequired && <span className="text-danger">*</span>}<Input className="mt-1" type="date" value={line.expiryDate} onChange={(event) => updateLine(line.id, { expiryDate: event.target.value })} /></label>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border bg-ink-50/60 px-3 py-2">
              <span className="text-xs text-ink-500">{lines.length} product line{lines.length === 1 ? '' : 's'}</span>
              <span className="text-sm font-semibold text-ink">Purchase total · {taka(purchaseTotal)}</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[13px] font-medium text-ink">
              Expense category
              <div className="mt-1.5 flex">
                <FormSelect
                  className="min-w-0 flex-1 [&>select]:rounded-r-none"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  options={expenseCategories}
                />
                <button
                  type="button"
                  className="-ml-px flex size-9 shrink-0 items-center justify-center rounded-r-md border border-input bg-card text-teal-700 hover:bg-teal-50"
                  onClick={() => toast('Manage expense categories')}>
                  <Plus className="size-4" />
                  <span className="sr-only">Manage categories</span>
                </button>
              </div>
            </label>

            <label className="block text-[13px] font-medium text-ink">
              Amount
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
                <Input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))}
                  className="pl-7 text-right"
                  inputMode="decimal"
                  placeholder="0"
                />
              </div>
            </label>

            <label className="block text-[13px] font-medium text-ink sm:col-span-2">
              Description / remarks
              <Input
                className="mt-1.5"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="e.g. Pickup — Bangshal to shop (3 trips)"
              />
            </label>

            <label className="block text-[13px] font-medium text-ink">
              Reference no.
              <Input className="mt-1.5" value={referenceNo} onChange={(event) => setReferenceNo(event.target.value)} placeholder="Optional bill, voucher or memo no." />
            </label>

            <label className="block text-[13px] font-medium text-ink">
              Notes
              <Input className="mt-1.5" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional internal note" />
            </label>
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-ink-50/60 px-3 py-2">
            <div>
              <p className="text-[13px] font-medium text-ink">
                Payments <span className="font-bn text-[11px] font-normal text-ink-400">· পেমেন্ট</span>
              </p>
              <p className="text-[11px] text-ink-500">Use one or multiple payment sources for this transaction.</p>
            </div>
            <div className="flex gap-2">
              {totalNum > 0 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setPaymentRows([{
                    ...newPaymentRow(0, paymentRows[0]?.method ?? 'Cash'),
                    account: paymentRows[0]?.account ?? accountsByMethod[paymentRows[0]?.method ?? 'Cash'][0],
                    amount: String(totalNum)
                  }])}>
                  Pay full
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setPaymentRows((rows) => [...rows, newPaymentRow(rows.length)])}>
                <Plus className="size-4" /> Add source
              </Button>
            </div>
          </div>

          <div className="divide-y divide-border">
            {paymentRows.map((row, index) => (
              <div key={row.id} className="grid gap-2 p-3 sm:grid-cols-[140px_minmax(0,1fr)_140px_32px] sm:items-end">
                <label className="text-[12px] font-medium text-ink">
                  {index + 1}. Method
                  <FormSelect
                    className="mt-1"
                    value={row.method}
                    onChange={(event) => changePaymentMethod(row.id, event.target.value as StandardPaymentMethod)}
                    options={methods}
                  />
                </label>

                <label className="text-[12px] font-medium text-ink">
                  Account
                  <FormSelect
                    className="mt-1"
                    value={row.account}
                    onChange={(event) => updatePayment(row.id, { account: event.target.value })}
                    options={accountsByMethod[row.method]}
                  />
                </label>

                <label className="text-[12px] font-medium text-ink">
                  Amount
                  <div className="relative mt-1">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-400">৳</span>
                    <Input
                      value={row.amount}
                      onChange={(event) => updatePayment(row.id, { amount: event.target.value.replace(/[^\d.]/g, '') })}
                      inputMode="decimal"
                      className="pl-6 text-right"
                      placeholder="0"
                    />
                  </div>
                </label>

                <button
                  type="button"
                  disabled={paymentRows.length === 1}
                  onClick={() => setPaymentRows((rows) => rows.filter((item) => item.id !== row.id))}
                  className="mb-0.5 flex size-8 items-center justify-center rounded-md text-ink-400 hover:bg-danger-bg hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Remove payment source ${index + 1}`}>
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-px border-t border-border bg-ink-100 text-center text-[12px]">
            <div className="bg-ink-50 px-3 py-2">
              <p className="text-ink-400">Total</p>
              <p className="mt-0.5 font-semibold text-ink">{taka(totalNum)}</p>
            </div>
            <div className="bg-ink-50 px-3 py-2">
              <p className="text-ink-400">Paid</p>
              <p className="mt-0.5 font-semibold text-ink">{taka(paymentTotal)}</p>
            </div>
            <div className="bg-ink-50 px-3 py-2">
              <p className="text-ink-400">{overpaid > 0 ? 'Over' : 'Due'}</p>
              <p className={`mt-0.5 font-semibold ${overpaid > 0 || due > 0 ? 'text-danger' : 'text-success'}`}>
                {taka(overpaid > 0 ? overpaid : due)}
              </p>
            </div>
          </div>
        </section>

        {mode === 'purchase' && (
          <label className="block text-[13px] font-medium text-ink">
            Notes
            <Input className="mt-1.5" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Supplier memo note, delivery note or internal remark" />
          </label>
        )}

        {totalNum > 0 && due > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-warning-bg px-3 py-2 text-sm">
            <span className="text-warning">{mode === 'purchase' ? `Due to ${party}` : 'Unpaid expense amount'}</span>
            <span className="font-semibold text-warning">{taka(due)}</span>
          </div>
        )}

        <div>
          <p className="mb-1.5 text-[13px] font-medium text-ink">
            {mode === 'purchase' ? 'Supplier memo / receipt' : 'Expense receipt'}{' '}
            <span className="font-normal text-ink-400">· রসিদের ছবি</span>
          </p>
          <PhotoUploader
            photos={photos}
            onChange={setPhotos}
            max={2}
            label="Attach"
            hint={mode === 'purchase' ? 'Supplier memo, cash receipt or delivery challan.' : 'Bill, voucher or payment receipt.'}
          />
        </div>

        {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>{mode === 'purchase' ? 'Complete purchase' : 'Save expense'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

