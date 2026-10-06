import React from 'react';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import { CustomerPicker } from './CustomerPicker';
import type {
  DiscountMode,
  PosCustomerDetails,
  PosPaymentMethod,
  PosPaymentRow
} from '../../hooks/usePosCart';
import {
  makePosPaymentRow,
  posPaymentAccountsByMethod
} from '../../hooks/usePosCart';
import type { Party } from '../../types/erp';
import { formatNumber, taka } from '../../utils/currency';

type Totals = {
  subtotal: number;
  discountAmt: number;
  total: number;
  rounding: number;
  paidNum: number;
  due: number;
  change: number;
  itemCount: number;
};

type CheckoutPanelProps = {
  invoice: string;
  totals: Totals;
  customer: Party | null;
  onCustomer: (p: Party | null) => void;
  customerDetails: PosCustomerDetails;
  onCustomerDetails: (details: PosCustomerDetails) => void;
  discount: string;
  onDiscount: (v: string) => void;
  discountMode: DiscountMode;
  onDiscountMode: (m: DiscountMode) => void;
  payments: PosPaymentRow[];
  onPayments: React.Dispatch<React.SetStateAction<PosPaymentRow[]>>;
  onComplete: () => void;
  onClear: () => void;
  paidRef: React.RefObject<HTMLInputElement>;
  completeLabel?: string;
};

const methods: PosPaymentMethod[] = ['Cash', 'Bank', 'bKash', 'Nagad', 'Card'];

function Row({ label, value, muted = false }: { label: React.ReactNode; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 text-sm ${muted ? 'text-ink-500' : 'text-ink-700'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function CheckoutPanel(props: CheckoutPanelProps) {
  const { totals, customer, customerDetails, discountMode, payments } = props;
  const hasCreditCustomer = Boolean(customer || (customerDetails.name.trim() && customerDetails.phone.trim()));
  const dueWithoutCustomer = totals.due > 0 && !hasCreditCustomer && totals.total > 0;
  const quick = [500, 1000, 2000, 5000].filter((n) => n >= totals.total * 0.2);

  const updatePayment = (id: string, patch: Partial<PosPaymentRow>) => {
    props.onPayments((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const changeMethod = (id: string, method: PosPaymentMethod) => {
    props.onPayments((rows) => rows.map((row) => row.id === id ? {
      ...row,
      method,
      account: posPaymentAccountsByMethod[method][0]
    } : row));
  };

  const setSinglePayment = (amount: number, method: PosPaymentMethod = payments[0]?.method ?? 'Cash') => {
    props.onPayments([{
      ...makePosPaymentRow(0, method),
      account: payments[0]?.method === method ? payments[0].account : posPaymentAccountsByMethod[method][0],
      amount: String(amount)
    }]);
  };

  const fillRemaining = (rowId: string) => {
    const otherPaid = payments
      .filter((payment) => payment.id !== rowId)
      .reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    updatePayment(rowId, { amount: String(Math.max(totals.total - otherPaid, 0)) });
  };

  const updateDetails = (patch: Partial<PosCustomerDetails>) => {
    props.onCustomerDetails({ ...customerDetails, ...patch });
  };

  return (
    <aside className="flex flex-col rounded-xl border border-ink-100 bg-white shadow-card xl:sticky xl:top-[72px]">
      <div className="space-y-3 border-b border-ink-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">{props.invoice}</p>
            <p className="text-[11px] text-ink-500">06 Oct 2026 · Counter 1</p>
          </div>
          <button onClick={props.onClear} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-500 hover:bg-danger-bg hover:text-danger">
            <Trash2 className="size-3.5" /> Clear
          </button>
        </div>

        <CustomerPicker value={customer} onChange={props.onCustomer} />

        <div className="rounded-lg bg-ink-50/70 p-2.5">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-400">
            Invoice customer details <span className="font-bn normal-case tracking-normal">· কাস্টমার তথ্য</span>
          </p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Input
              value={customerDetails.name}
              onChange={(event) => updateDetails({ name: event.target.value })}
              placeholder="Customer name"
              aria-label="Customer name"
              className="h-8"
            />
            <Input
              value={customerDetails.phone}
              onChange={(event) => updateDetails({ phone: event.target.value })}
              placeholder="Phone"
              aria-label="Customer phone"
              className="h-8"
            />
            <Input
              value={customerDetails.guardianName}
              onChange={(event) => updateDetails({ guardianName: event.target.value })}
              placeholder="Guardian name"
              aria-label="Guardian name"
              className="h-8"
            />
            <Input
              value={customerDetails.address}
              onChange={(event) => updateDetails({ address: event.target.value })}
              placeholder="Address"
              aria-label="Customer address"
              className="h-8"
            />
          </div>
          <p className="mt-1.5 text-[10.5px] text-ink-400">
            Fully paid walk-in sales can keep these as invoice-only details; no customer account is required.
          </p>
        </div>
      </div>

      <div className="space-y-2 p-4">
        <Row label={`Subtotal · ${totals.itemCount} items`} value={taka(totals.subtotal, totals.subtotal % 1 ? 2 : 0)} />
        <div className="flex items-center justify-between gap-3 text-sm text-ink-700">
          <span>Discount</span>
          <div className="flex items-center gap-1">
            <div className="flex h-8 rounded-md bg-ink-50 p-0.5" role="radiogroup" aria-label="Discount type">
              {(['amount', 'percent'] as DiscountMode[]).map((mode) => (
                <button
                  key={mode}
                  role="radio"
                  aria-checked={discountMode === mode}
                  onClick={() => props.onDiscountMode(mode)}
                  className={`w-7 rounded text-xs font-medium ${discountMode === mode ? 'bg-white text-ink shadow-card' : 'text-ink-500'}`}>
                  {mode === 'amount' ? '৳' : '%'}
                </button>
              ))}
            </div>
            <input
              aria-label="Discount"
              value={props.discount}
              onChange={(event) => props.onDiscount(event.target.value.replace(/[^\d.]/g, ''))}
              placeholder="0"
              inputMode="decimal"
              className="h-8 w-24 rounded-md border border-ink-100 px-2 text-right text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>
        {totals.discountAmt > 0 && <Row muted label="Discount applied" value={`−${taka(totals.discountAmt, totals.discountAmt % 1 ? 2 : 0)}`} />}
        <Row muted label="Rounding (to ৳5)" value={`${totals.rounding >= 0 ? '+' : '−'}৳${formatNumber(Math.abs(totals.rounding), totals.rounding % 1 ? 2 : 0)}`} />
      </div>

      <div className="mx-4 rounded-xl bg-ink px-4 py-3.5 text-white">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-ink-300">
            Total payable <span className="font-bn">· মোট</span>
          </span>
        </div>
        <p className="mt-0.5 text-right text-[34px] font-semibold leading-tight tracking-tight">{taka(totals.total)}</p>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-ink">Payments <span className="font-bn text-xs font-normal text-ink-500">· পেমেন্ট</span></p>
            <p className="text-[10.5px] text-ink-400">Use one or multiple sources.</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => props.onPayments((rows) => [...rows, makePosPaymentRow(rows.length)])}>
            <Plus className="size-3.5" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          {payments.map((payment, index) => (
            <div key={payment.id} className="rounded-lg border border-ink-100 bg-ink-50/40 p-2">
              <div className="grid grid-cols-[92px_minmax(0,1fr)_28px] gap-1.5">
                <FormSelect
                  value={payment.method}
                  onChange={(event) => changeMethod(payment.id, event.target.value as PosPaymentMethod)}
                  options={methods}
                />
                <FormSelect
                  value={payment.account}
                  onChange={(event) => updatePayment(payment.id, { account: event.target.value })}
                  options={posPaymentAccountsByMethod[payment.method]}
                />
                <button
                  type="button"
                  disabled={payments.length === 1}
                  onClick={() => props.onPayments((rows) => rows.filter((row) => row.id !== payment.id))}
                  className="flex size-9 items-center justify-center rounded-md text-ink-300 hover:bg-danger-bg hover:text-danger disabled:opacity-30"
                  aria-label={`Remove payment ${index + 1}`}>
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="relative min-w-0 flex-1">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
                  <Input
                    ref={index === 0 ? props.paidRef : undefined}
                    value={payment.amount}
                    onChange={(event) => updatePayment(payment.id, { amount: event.target.value.replace(/[^\d.]/g, '') })}
                    onKeyDown={(event) => event.key === 'Enter' && props.onComplete()}
                    inputMode="decimal"
                    placeholder="0"
                    className="h-9 pl-7 text-right font-medium"
                    aria-label={`Payment amount ${index + 1}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fillRemaining(payment.id)}
                  className="h-9 rounded-md border border-ink-100 bg-white px-2 text-[10.5px] font-medium text-teal-700 hover:bg-teal-50">
                  Remaining
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setSinglePayment(totals.total)} className="h-8 rounded-md border border-teal-200 bg-teal-50 px-2.5 text-xs font-medium text-teal-800 hover:bg-teal-100">
            Exact
          </button>
          {quick.map((amount) => (
            <button key={amount} onClick={() => setSinglePayment(amount, 'Cash')} className="h-8 rounded-md border border-ink-100 px-2.5 text-xs font-medium text-ink-700 hover:bg-ink-50">
              ৳{formatNumber(amount)}
            </button>
          ))}
        </div>

        <div className="space-y-1.5 rounded-lg bg-ink-50 p-3">
          <Row label="Paid" value={<span className="font-medium">{taka(totals.paidNum)}</span>} />
          <Row label="Change to return" value={<span className={totals.change > 0 ? 'font-semibold text-success' : ''}>{taka(totals.change)}</span>} />
          <Row label={<span>Due <span className="font-bn text-xs text-ink-500">বাকি</span></span>} value={<span className={totals.due > 0 ? 'font-semibold text-danger' : ''}>{taka(totals.due)}</span>} />
        </div>

        {dueWithoutCustomer && (
          <p className="flex items-start gap-2 rounded-lg bg-warning-bg p-2.5 text-xs text-warning">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            Enter customer name + phone, or select an existing customer, to record {taka(totals.due)} as due.
          </p>
        )}

        <Button
          onClick={props.onComplete}
          disabled={totals.total === 0 || dueWithoutCustomer}
          className="h-12 w-full text-[15px] font-semibold">
          {props.completeLabel ?? 'Complete sale'} · {taka(totals.total)}
          <kbd className="ml-1 rounded bg-white/15 px-1.5 text-[10px] font-medium">F9</kbd>
        </Button>
      </div>
    </aside>
  );
}
