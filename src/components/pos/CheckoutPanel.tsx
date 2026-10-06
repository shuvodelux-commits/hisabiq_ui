import React from 'react';
import { AlertTriangle, Banknote, CreditCard, Smartphone, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { CustomerPicker } from './CustomerPicker';
import type { DiscountMode } from '../../hooks/usePosCart';
import type { Party, PaymentMethod } from '../../types/erp';
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
  discount: string;
  onDiscount: (v: string) => void;
  discountMode: DiscountMode;
  onDiscountMode: (m: DiscountMode) => void;
  paid: string;
  onPaid: (v: string) => void;
  method: PaymentMethod;
  onMethod: (m: PaymentMethod) => void;
  onComplete: () => void;
  onClear: () => void;
  paidRef: React.RefObject<HTMLInputElement>;
  completeLabel?: string;
};

const methods: {id: PaymentMethod;icon: React.ElementType;}[] = [
{ id: 'Cash', icon: Banknote },
{ id: 'bKash', icon: Smartphone },
{ id: 'Nagad', icon: Smartphone },
{ id: 'Card', icon: CreditCard }];


function Row({ label, value, muted = false }: {label: React.ReactNode;value: React.ReactNode;muted?: boolean;}) {
  return (
    <div className={`flex items-center justify-between gap-3 text-sm ${muted ? 'text-ink-500' : 'text-ink-700'}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>);

}

export function CheckoutPanel(props: CheckoutPanelProps) {
  const { totals, customer, discountMode, method } = props;
  const dueWithoutCustomer = totals.due > 0 && !customer && totals.total > 0;
  const quick = [500, 1000, 2000, 5000].filter((n) => n >= totals.total * 0.2);

  return (
    <aside className="flex flex-col rounded-xl border border-ink-100 bg-white shadow-card xl:sticky xl:top-[72px]">
      <div className="space-y-3 border-b border-ink-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">{props.invoice}</p>
            <p className="text-[11px] text-ink-500">01 Oct 2026 · Counter 1</p>
          </div>
          <button onClick={props.onClear} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-500 hover:bg-danger-bg hover:text-danger">
            <Trash2 className="size-3.5" /> Clear
          </button>
        </div>
        <CustomerPicker value={customer} onChange={props.onCustomer} />
      </div>

      <div className="space-y-2 p-4">
        <Row label={`Subtotal · ${totals.itemCount} items`} value={taka(totals.subtotal, totals.subtotal % 1 ? 2 : 0)} />
        <div className="flex items-center justify-between gap-3 text-sm text-ink-700">
          <span>Discount</span>
          <div className="flex items-center gap-1">
            <div className="flex h-8 rounded-md bg-ink-50 p-0.5" role="radiogroup" aria-label="Discount type">
              {(['amount', 'percent'] as DiscountMode[]).map((m) =>
              <button
                key={m}
                role="radio"
                aria-checked={discountMode === m}
                onClick={() => props.onDiscountMode(m)}
                className={`w-7 rounded text-xs font-medium ${discountMode === m ? 'bg-white text-ink shadow-card' : 'text-ink-500'}`}>
                
                  {m === 'amount' ? '৳' : '%'}
                </button>
              )}
            </div>
            <input
              aria-label="Discount"
              value={props.discount}
              onChange={(e) => props.onDiscount(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="0"
              inputMode="decimal"
              className="h-8 w-24 rounded-md border border-ink-100 px-2 text-right text-sm tabular-nums focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
            
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
        <p className="mt-0.5 text-right text-[34px] font-semibold leading-tight tabular-nums tracking-tight">{taka(totals.total)}</p>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Payment method">
          {methods.map(({ id, icon: Icon }) =>
          <button
            key={id}
            role="radio"
            aria-checked={method === id}
            onClick={() => props.onMethod(id)}
            className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg border text-[11.5px] font-medium transition-colors ${
            method === id ? 'border-teal-500 bg-teal-50 text-teal-800 ring-1 ring-teal-500' : 'border-ink-100 text-ink-600 hover:bg-ink-50'}`
            }>
            
              <Icon className="size-4" /> {id}
            </button>
          )}
        </div>

        <label className="block">
          <span className="flex items-center justify-between text-sm font-medium text-ink">
            Paid <span className="font-bn text-xs font-normal text-ink-500">পরিশোধ</span>
          </span>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-ink-400">৳</span>
            <input
              ref={props.paidRef}
              value={props.paid}
              onChange={(e) => props.onPaid(e.target.value.replace(/[^\d.]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && props.onComplete()}
              inputMode="decimal"
              placeholder="0"
              className="h-12 w-full rounded-lg border border-ink-200 pl-8 pr-3 text-right text-xl font-semibold tabular-nums text-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
            
          </div>
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => props.onPaid(String(totals.total))} className="h-8 rounded-md border border-teal-200 bg-teal-50 px-2.5 text-xs font-medium text-teal-800 hover:bg-teal-100">
            Exact
          </button>
          {quick.map((n) =>
          <button key={n} onClick={() => props.onPaid(String(n))} className="h-8 rounded-md border border-ink-100 px-2.5 text-xs font-medium tabular-nums text-ink-700 hover:bg-ink-50">
              ৳{formatNumber(n)}
            </button>
          )}
        </div>

        <div className="space-y-1.5 rounded-lg bg-ink-50 p-3">
          <Row label="Change to return" value={<span className={totals.change > 0 ? 'font-semibold text-success' : ''}>{taka(totals.change)}</span>} />
          <Row label={<span>Due <span className="font-bn text-xs text-ink-500">বাকি</span></span>} value={<span className={totals.due > 0 ? 'font-semibold text-danger' : ''}>{taka(totals.due)}</span>} />
        </div>

        {dueWithoutCustomer &&
        <p className="flex items-start gap-2 rounded-lg bg-warning-bg p-2.5 text-xs text-warning">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            Select a customer to record ৳{formatNumber(totals.due)} as due. Walk-in sales must be fully paid.
          </p>
        }

        <Button
          onClick={props.onComplete}
          disabled={totals.total === 0 || dueWithoutCustomer}
          className="h-12 w-full text-[15px] font-semibold">
          
          {props.completeLabel ?? 'Complete sale'} · {taka(totals.total)}
          <kbd className="ml-1 rounded bg-white/15 px-1.5 text-[10px] font-medium">F9</kbd>
        </Button>
      </div>
    </aside>);

}