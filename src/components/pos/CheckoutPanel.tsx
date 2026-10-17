import {NumericInput} from '../NumericInput';
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
import { AmountInWordsDisplay } from '../AmountInWordsDisplay';
import { useUiCopy } from '../../i18n/useUiCopy';
import { InstallmentTermsPanel, type InstallmentTerms } from './InstallmentTermsPanel';

type Totals = {
  subtotal: number;
  discountAmt: number;
  total: number;
  rounding: number;
  roundingLabel?: string;
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
  completeRef?: React.RefObject<HTMLButtonElement>;
  installment?: InstallmentTerms;
};

const methods: PosPaymentMethod[] = ['Cash', 'Bank', 'bKash', 'Nagad', 'Card', 'Customer Credit'];

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
  const { language, text, word, showHelper } = useUiCopy();
  const hasCreditCustomer = Boolean(customer || (customerDetails.name.trim() && customerDetails.phone.trim()));
  const dueWithoutCustomer = totals.due > 0 && !hasCreditCustomer && totals.total > 0;
  const quick = [500, 1000, 2000, 5000].filter((n) => n >= totals.total * 0.2);
  const [customerDetailsOpen,setCustomerDetailsOpen] = React.useState(false);

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
    <aside data-pos-checkout aria-label={text('Sale checkout','বিক্রির টাকা নিন')} className="flex min-w-0 flex-col rounded-xl border border-border bg-card shadow-card">
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">{props.invoice}</p>
            <p className="text-[11px] text-ink-500">06 Oct 2026 · Counter 1</p>
          </div>
          <button onClick={props.onClear} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-500 hover:bg-danger-bg hover:text-danger">
            <Trash2 className="size-3.5" /> {word("clear")}
          </button>
        </div>

        <CustomerPicker value={customer} onChange={props.onCustomer} />
        {props.installment && <div role="group" aria-label={text('Sale type','বিক্রির ধরন')}
          className="grid grid-cols-2 gap-1 rounded-lg bg-ink-50 p-1">
          {(['Regular','Installment'] as const).map(mode=><button
            key={mode} type="button" aria-pressed={props.installment?.mode===mode}
            onClick={()=>props.installment?.onModeChange(mode)}
            className={'h-9 rounded-md text-[12px] font-medium transition-colors '+(props.installment?.mode===mode?'bg-card text-teal-700 shadow-card':'text-ink-500 hover:text-ink')}>
            {mode==='Regular'?text('Regular sale','সাধারণ বিক্রি'):text('Installment sale','কিস্তিতে বিক্রি')}
          </button>)}
        </div>}
        {customer&&<button type="button" onClick={()=>setCustomerDetailsOpen(open=>!open)}
          className="self-start text-[11px] font-medium text-teal-700 hover:underline">
          {customerDetailsOpen?text('Hide customer details','ক্রেতার তথ্য লুকান'):text('Edit customer details','ক্রেতার তথ্য বদলান')}
        </button>}


        {(!customer || customerDetailsOpen) && <div className="rounded-lg bg-ink-50/70 p-2.5">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-400">
            {word("invoiceCustomer")} {showHelper && <span className="font-bn normal-case tracking-normal">· কাস্টমার তথ্য</span>}
          </p>
          <div data-pos-customer-fields className="grid gap-2 sm:grid-cols-2">
            <Input
              value={customerDetails.name}
              onChange={(event) => updateDetails({ name: event.target.value })}
              placeholder={word("customerName")}
              aria-label={word("customerName")}
              className="h-8"
            />
            <Input
              value={customerDetails.phone}
              onChange={(event) => updateDetails({ phone: event.target.value })}
              placeholder={word("phone")}
              aria-label={word("customerPhone")}
              className="h-8"
            />
            <Input
              value={customerDetails.guardianName}
              onChange={(event) => updateDetails({ guardianName: event.target.value })}
              placeholder={word("guardianName")}
              aria-label={word("guardianName")}
              className="h-8"
            />
            <Input
              value={customerDetails.address}
              onChange={(event) => updateDetails({ address: event.target.value })}
              placeholder={word("address")}
              aria-label={word("customerAddress")}
              className="h-8"
            />
          </div>
          <p className="mt-1.5 text-[10.5px] text-ink-400">
            {word("customerOptional")}
          </p>
        </div>}
      </div>

      <div className="space-y-2 p-4">
        <Row label={text(`Subtotal · ${totals.itemCount} items`, `পণ্যের মোট · ${totals.itemCount}টি`)} value={taka(totals.subtotal, totals.subtotal % 1 ? 2 : 0)} />
        <div className="flex items-center justify-between gap-3 text-sm text-ink-700">
          <span>{word("discount")}</span>
          <div className="flex items-center gap-1">
            <div className="flex h-8 rounded-md bg-ink-50 p-0.5" role="radiogroup" aria-label={word("discount")}>
              {(['amount', 'percent'] as DiscountMode[]).map((mode) => (
                <button
                  key={mode}
                  role="radio"
                  aria-checked={discountMode === mode}
                  onClick={() => props.onDiscountMode(mode)}
                  className={`w-7 rounded text-xs font-medium ${discountMode === mode ? 'bg-card text-ink shadow-card' : 'text-ink-500'}`}>
                  {mode === 'amount' ? '৳' : '%'}
                </button>
              ))}
            </div>
            <NumericInput
              aria-label={word("discount")}
              value={props.discount}
              onChange={(event) => props.onDiscount(event.target.value.replace(/[^\d.]/g, ''))}
              placeholder="0"
              inputMode="decimal"
              className="h-8 w-24 rounded-md border border-border px-2 text-right text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>
        {totals.discountAmt > 0 && <Row muted label={word("discountApplied")} value={`−${taka(totals.discountAmt, totals.discountAmt % 1 ? 2 : 0)}`} />}
        <Row muted label={language === "Bangla" ? (totals.roundingLabel ? "রাউন্ডিং" : word("rounding")) : (totals.roundingLabel || word("rounding"))} value={`${totals.rounding >= 0 ? '+' : '−'}৳${formatNumber(Math.abs(totals.rounding), totals.rounding % 1 ? 2 : 0)}`} />
      </div>

      <div className="mx-4 rounded-xl bg-inverse px-4 py-3.5 text-white">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-[#B7C2CF]">
            {word("totalPayable")} {showHelper && <span className="font-bn">· মোট</span>}
          </span>
        </div>
        <p className="mt-0.5 text-right text-[34px] font-semibold leading-tight tracking-tight">{taka(totals.total)}</p>
        <AmountInWordsDisplay amount={totals.total} variant="inverse" />
      </div>

      {props.installment?.mode==='Installment' && <div className="px-4 pt-4">
        <InstallmentTermsPanel terms={props.installment}
          invoiceTotalPaisa={Math.round(totals.total*100)}
          paidPaisa={Math.round(totals.paidNum*100)}/>
      </div>}
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-ink">{word("payments")} {showHelper && <span className="font-bn text-xs font-normal text-ink-500">· পেমেন্ট</span>}</p>
            <p className="text-[10.5px] text-ink-400">{word("paymentHint")}</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => props.onPayments((rows) => [...rows, makePosPaymentRow(rows.length)])}>
            <Plus className="size-3.5" /> {word("add")}
          </Button>
        </div>

        <div className="space-y-2">
          {payments.map((payment, index) => (
            <div key={payment.id} className="rounded-lg border border-border bg-ink-50/40 p-2">
              <div className="grid grid-cols-[92px_minmax(0,1fr)_28px] gap-1.5">
                <FormSelect
                  value={payment.method}
                  onChange={(event) => changeMethod(payment.id, event.target.value as PosPaymentMethod)}
                  options={methods.map(method => ({ value: method, label: text(method, method === "Cash" ? "ক্যাশ" : method === "Bank" ? "ব্যাংক" : method === "Card" ? "কার্ড" : method === "Customer Credit" ? "ক্রেতার বাকি" : method) }))}
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
                  className="flex size-9 items-center justify-center rounded-md text-helper hover:bg-danger-bg hover:text-danger disabled:opacity-30"
                  aria-label={text(`Remove payment ${index + 1}`, `পেমেন্ট ${index + 1} সরান`)}>
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
                    aria-label={text(`Payment amount ${index + 1}`, `পেমেন্টের পরিমাণ ${index + 1}`)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fillRemaining(payment.id)}
                  className="h-9 rounded-md border border-border bg-card px-2 text-[10.5px] font-medium text-teal-700 hover:bg-teal-50">
                  {word("remaining")}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {props.installment?.mode!=='Installment' && <button onClick={() => setSinglePayment(totals.total)} className="h-8 rounded-md border border-teal-200 bg-teal-50 px-2.5 text-xs font-medium text-teal-800 hover:bg-teal-100">
            {word("exact")}
          </button>}
          {quick.map((amount) => (
            <button key={amount} onClick={() => setSinglePayment(amount, 'Cash')} className="h-8 rounded-md border border-border px-2.5 text-xs font-medium text-ink-700 hover:bg-ink-50">
              ৳{formatNumber(amount)}
            </button>
          ))}
        </div>

        <div className="space-y-1.5 rounded-lg bg-ink-50 p-3">
          <Row label={word("paid")} value={<span className="font-medium">{taka(totals.paidNum)}</span>} />
          <Row label={word("changeToReturn")} value={<span className={totals.change > 0 ? 'font-semibold text-success' : ''}>{taka(totals.change)}</span>} />
          <Row label={<span>{word("due")} {showHelper && <span className="font-bn text-xs text-ink-500">বাকি</span>}</span>} value={<span className={totals.due > 0 ? 'font-semibold text-danger' : ''}>{taka(totals.due)}</span>} />
        </div>

        {dueWithoutCustomer && (
          <p className="flex items-start gap-2 rounded-lg bg-warning-bg p-2.5 text-xs text-warning">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            {text("Enter customer name + phone, or select an existing customer, to record", "বাকি রাখতে ক্রেতার নাম ও ফোন দিন অথবা আগের ক্রেতা বাছুন। বাকি টাকা:")} {taka(totals.due)} {language !== "Bangla" && "as due."}
          </p>
        )}

        <Button
          ref={props.completeRef}
          onClick={props.onComplete}
          disabled={totals.total === 0 || dueWithoutCustomer || (props.installment?.mode==='Installment' && !customer)}
          className="h-12 w-full text-[15px] font-semibold disabled:bg-ink-100 disabled:text-ink-600 disabled:opacity-100">
          {props.completeLabel ?? word('completeSale')} · {taka(totals.total)}
          <kbd className="ml-1 rounded border border-primary-foreground/40 px-1.5 text-[10px] font-medium">F9</kbd>
        </Button>
      </div>
    </aside>
  );
}

