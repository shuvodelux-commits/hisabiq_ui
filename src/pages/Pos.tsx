import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy, FileClock, FileText, Keyboard, Pencil, Printer, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../components/Dialog';
import { CartTable } from '../components/pos/CartTable';
import { CheckoutPanel } from '../components/pos/CheckoutPanel';
import { DraftsMenu } from '../components/pos/DraftsMenu';
import { ProductThumb } from '../components/ProductThumb';
import { ReceiptPreview, type ReceiptLine } from '../components/brand/ReceiptPreview';
import { makePosPaymentRow, usePosCart, type CartLine, type PosPaymentRow } from '../hooks/usePosCart';
import { products } from '../data/products';
import { saleTemplates, salesDrafts, salesInvoices, type SalesDraft } from '../data/sales';
import { parties } from '../data/parties';
import { taka } from '../utils/currency';
import { compoundLineTotal, formatCompoundQuantity, parseCompoundQuantity } from '../utils/posQuantity';
import type { SalePresetLine, SalesInvoice } from '../types/erp';

type CompletedSale = {
  invoice: string;
  customer?: string;
  customerPhone?: string;
  guardianName?: string;
  customerAddress?: string;
  lines: ReceiptLine[];
  subtotal: number;
  discount: number;
  rounding: number;
  total: number;
  paid: number;
  due: number;
  method: string;
};

const quickItems = products.filter((p) => p.active).slice(0, 8);

function cartFromPreset(lines: SalePresetLine[]): CartLine[] {
  return lines.flatMap((sourceLine, index) => {
    const product = products.find((item) => item.id === sourceLine.productId);
    if (!product) return [];
    const unit = sourceLine.unit === product.altUnit?.unit ? sourceLine.unit : product.unit;
    return [{
      key: `preset-${sourceLine.productId}-${index}`,
      product,
      qty: sourceLine.qty,
      secondaryQty: sourceLine.secondaryQty ?? '',
      unit,
      price: String(sourceLine.price)
    }];
  });
}

function paymentsFromInvoice(invoice: SalesInvoice): PosPaymentRow[] {
  if (invoice.payments.length > 0) {
    return invoice.payments.map((payment, index) => ({
      ...makePosPaymentRow(index, payment.method),
      account: payment.account ?? makePosPaymentRow(index, payment.method).account,
      amount: String(payment.amount)
    }));
  }
  if (invoice.paid > 0) {
    return [{ ...makePosPaymentRow(0, invoice.method), amount: String(invoice.paid) }];
  }
  return [makePosPaymentRow()];
}

function paymentsFromDraft(draft: SalesDraft): PosPaymentRow[] {
  if (!draft.payments?.length) return [makePosPaymentRow()];
  return draft.payments.map((payment, index) => ({
    ...makePosPaymentRow(index, payment.method),
    account: payment.account ?? makePosPaymentRow(index, payment.method).account,
    amount: String(payment.amount)
  }));
}

function cartFromInvoice(invoice: SalesInvoice): CartLine[] {
  return invoice.lines.flatMap((sourceLine) => {
    const product = products.find((item) => item.id === sourceLine.productId);
    if (!product) return [];

    if (product.altUnit) {
      const parsed = parseCompoundQuantity(sourceLine.quantity, product.altUnit.unit, product.unit);
      if (parsed.usesAlternate) {
        return [{
          key: `source-${sourceLine.id}`,
          product,
          qty: parsed.primaryQty,
          secondaryQty: parsed.secondaryQty,
          unit: product.altUnit.unit,
          price: String(sourceLine.price * product.altUnit.factor)
        }];
      }
    }

    return [{
      key: `source-${sourceLine.id}`,
      product,
      qty: String(sourceLine.returnableQuantity ?? (parseFloat(sourceLine.quantity) || 1)),
      secondaryQty: '',
      unit: product.unit,
      price: String(sourceLine.price)
    }];
  });
}

export function Pos() {
  const cart = usePosCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceMode = searchParams.get('mode');
  const sourceInvoiceNo = searchParams.get('invoice');
  const sourceDraftId = searchParams.get('draft');
  const sourceTemplateId = searchParams.get('template');
  const sourceInvoice = salesInvoices.find((sale) => sale.invoice === sourceInvoiceNo) ?? null;
  const sourceDraft = salesDrafts.find((draft) => draft.id === sourceDraftId) ?? null;
  const sourceTemplate = saleTemplates.find((template) => template.id === sourceTemplateId) ?? null;
  const editing = sourceMode === 'edit' && !!sourceInvoice;
  const duplicating = sourceMode === 'duplicate' && !!sourceInvoice;
  const continuingDraft = sourceMode === 'continue-draft' && !!sourceDraft;
  const editingDraft = sourceMode === 'edit-draft' && !!sourceDraft;
  const duplicatingDraft = sourceMode === 'duplicate-draft' && !!sourceDraft;
  const draftContext = continuingDraft || editingDraft || duplicatingDraft;
  const templateContext = sourceMode === 'template' && !!sourceTemplate;
  const loadedSource = useRef<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const paidRef = useRef<HTMLInputElement>(null);
  const [invoiceNo, setInvoiceNo] = useState(242);
  const [drafts, setDrafts] = useState<SalesDraft[]>(salesDrafts);
  const [completed, setCompleted] = useState<CompletedSale | null>(null);
  const invoice = editing && sourceInvoice ? sourceInvoice.invoice : `INV-${String(invoiceNo).padStart(6, '0')}`;
  const pageTitle = editing
    ? 'Edit sale'
    : duplicating
      ? 'Duplicate sale'
      : editingDraft
        ? 'Edit draft'
        : duplicatingDraft
          ? 'Duplicate draft'
          : continuingDraft
            ? 'Continue draft'
            : templateContext
              ? 'Template sale'
              : 'New sale';
  const pageTitleBn = editing
    ? 'বিক্রি সম্পাদনা'
    : duplicating
      ? 'বিক্রি কপি'
      : editingDraft
        ? 'খসড়া সম্পাদনা'
        : duplicatingDraft
          ? 'খসড়া কপি'
          : continuingDraft
            ? 'খসড়া চালিয়ে যান'
            : templateContext
              ? 'টেমপ্লেট বিক্রি'
              : 'নতুন বিক্রি';

  useEffect(() => {
    if (!sourceInvoice || (!editing && !duplicating)) {
      if ((!sourceDraft || !draftContext) && (!sourceTemplate || !templateContext)) loadedSource.current = null;
      return;
    }
    const sourceKey = `${sourceMode}:${sourceInvoice.invoice}`;
    if (loadedSource.current === sourceKey) return;
    loadedSource.current = sourceKey;
    cart.setLines(cartFromInvoice(sourceInvoice));
    const sourceParty = sourceInvoice.partyId ? parties.find((party) => party.id === sourceInvoice.partyId) ?? null : null;
    cart.setCustomer(sourceParty);
    cart.setCustomerDetails({
      name: sourceInvoice.party === 'Walk-in customer' ? '' : sourceInvoice.party,
      phone: sourceInvoice.phone ?? sourceParty?.phone ?? '',
      guardianName: sourceInvoice.guardianName ?? '',
      address: sourceInvoice.address ?? sourceParty?.area ?? ''
    });
    cart.setDiscount(sourceInvoice.discount ? String(sourceInvoice.discount) : '');
    cart.setDiscountMode('amount');
    cart.setPayments(editing ? paymentsFromInvoice(sourceInvoice) : [makePosPaymentRow()]);
  }, [cart.setCustomer, cart.setCustomerDetails, cart.setDiscount, cart.setDiscountMode, cart.setLines, cart.setPayments, draftContext, duplicating, editing, sourceDraft, sourceInvoice, sourceMode, sourceTemplate, templateContext]);

  useEffect(() => {
    if (!sourceDraft || !draftContext) return;
    const sourceKey = `${sourceMode}:${sourceDraft.id}`;
    if (loadedSource.current === sourceKey) return;
    loadedSource.current = sourceKey;
    cart.setLines(cartFromPreset(sourceDraft.lines));
    const sourceParty = parties.find((party) => party.name === sourceDraft.customer) ?? null;
    cart.setCustomer(sourceParty);
    cart.setCustomerDetails(sourceDraft.customerDetails ?? {
      name: sourceDraft.customer ?? sourceParty?.name ?? '',
      phone: sourceParty?.phone ?? '',
      guardianName: '',
      address: sourceParty?.area ?? ''
    });
    cart.setDiscount('');
    cart.setDiscountMode('amount');
    cart.setPayments(duplicatingDraft ? [makePosPaymentRow()] : paymentsFromDraft(sourceDraft));
  }, [cart.setCustomer, cart.setCustomerDetails, cart.setDiscount, cart.setDiscountMode, cart.setLines, cart.setPayments, draftContext, duplicatingDraft, sourceDraft, sourceMode]);

  useEffect(() => {
    if (!sourceTemplate || !templateContext) return;
    const sourceKey = `${sourceMode}:${sourceTemplate.id}`;
    if (loadedSource.current === sourceKey) return;
    loadedSource.current = sourceKey;
    cart.setLines(cartFromPreset(sourceTemplate.lines));
    const sourceParty = parties.find((party) => party.name === sourceTemplate.customer) ?? null;
    cart.setCustomer(sourceParty);
    cart.setCustomerDetails({
      name: sourceTemplate.customer ?? sourceParty?.name ?? '',
      phone: sourceParty?.phone ?? '',
      guardianName: '',
      address: sourceParty?.area ?? ''
    });
    cart.setDiscount('');
    cart.setDiscountMode('amount');
    cart.setPayments([makePosPaymentRow()]);
  }, [cart.setCustomer, cart.setCustomerDetails, cart.setDiscount, cart.setDiscountMode, cart.setLines, cart.setPayments, sourceMode, sourceTemplate, templateContext]);

  const complete = () => {
    const t = cart.totals;
    const hasCreditCustomer = Boolean(cart.customer || (cart.customerDetails.name.trim() && cart.customerDetails.phone.trim()));
    if (t.total === 0 || (t.due > 0 && !hasCreditCustomer)) return;
    const activePayments = cart.payments.filter((payment) => (parseFloat(payment.amount) || 0) > 0);
    setCompleted({
      invoice,
      customer: cart.customerDetails.name.trim() || cart.customer?.name || undefined,
      customerPhone: cart.customerDetails.phone.trim() || undefined,
      guardianName: cart.customerDetails.guardianName.trim() || undefined,
      customerAddress: cart.customerDetails.address.trim() || undefined,
      lines: cart.lines.map((l) => {
        const factor = l.product.altUnit && l.unit === l.product.altUnit.unit ? l.product.altUnit.factor : 1;
        return {
          name: l.product.name,
          qty: formatCompoundQuantity(l.qty, l.unit, l.secondaryQty, l.product.unit),
          price: parseFloat(l.price) || 0,
          total: compoundLineTotal(l.qty, l.secondaryQty, factor, l.price)
        };
      }),
      subtotal: t.subtotal,
      discount: t.discountAmt,
      rounding: t.rounding,
      total: t.total,
      paid: Math.min(t.paidNum, t.total),
      due: t.due,
      method: activePayments.length > 1 ? 'Multiple' : activePayments[0]?.method ?? 'Cash'
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'F8') {
        e.preventDefault();
        paidRef.current?.focus();
      } else if (e.key === 'F9') {
        e.preventDefault();
        complete();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const holdCurrent = () => {
    setDrafts((d) => [
    ...d,
    {
      id: `d${Date.now()}`,
      label: `Draft #${16 + d.length - 2}`,
      customer: cart.customerDetails.name.trim() || cart.customer?.name,
      customerDetails: { ...cart.customerDetails },
      payments: cart.payments
        .filter((payment) => (parseFloat(payment.amount) || 0) > 0)
        .map((payment) => ({
          id: payment.id,
          method: payment.method,
          amount: parseFloat(payment.amount),
          account: payment.account
        })),
      items: cart.lines.length,
      total: cart.totals.total,
      savedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      lines: cart.lines.map((line) => ({
        productId: line.product.id,
        qty: line.qty,
        secondaryQty: line.secondaryQty,
        unit: line.unit,
        price: parseFloat(line.price) || 0
      }))
    }]
    );
    cart.reset();
    toast.success('Sale held as draft');
  };

  const resume = (d: SalesDraft) => {
    cart.setLines(cartFromPreset(d.lines));
    const sourceParty = parties.find((party) => party.name === d.customer) ?? null;
    cart.setCustomer(sourceParty);
    cart.setCustomerDetails(d.customerDetails ?? {
      name: d.customer ?? sourceParty?.name ?? '',
      phone: sourceParty?.phone ?? '',
      guardianName: '',
      address: sourceParty?.area ?? ''
    });
    cart.setPayments(paymentsFromDraft(d));
    setDrafts((ds) => ds.filter((x) => x.id !== d.id));
    toast(`${d.label} resumed`);
  };

  const newSale = () => {
    setCompleted(null);
    cart.reset();
    setInvoiceNo((n) => n + 1);
    if (editing || duplicating || draftContext || templateContext) navigate('/app/pos', { replace: true });
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{pageTitle}</h1>
          <span className="font-bn text-sm text-ink-500">{pageTitleBn}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 rounded-lg border border-ink-100 bg-white px-3 py-1.5 text-[11.5px] text-ink-500 md:flex">
            <Keyboard className="size-3.5" aria-hidden="true" />
            {[
            ['F2', 'Search'],
            ['Enter', 'Next'],
            ['F8', 'Paid'],
            ['F9', 'Complete']].
            map(([k, l]) =>
            <span key={k} className="flex items-center gap-1">
                <kbd className="rounded border border-ink-200 bg-ink-50 px-1 text-[10px] text-ink-600">{k}</kbd> {l}
              </span>
            )}
          </div>
          <DraftsMenu
            drafts={drafts}
            canSave={cart.lines.length > 0}
            onSave={holdCurrent}
            onResume={resume}
            onDelete={(id) => setDrafts((ds) => ds.filter((d) => d.id !== id))} />
          
        </div>
      </div>

      {sourceInvoice && (editing || duplicating) && (
        <div className="flex flex-col gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-[13px] text-teal-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-teal-700 ring-1 ring-teal-100">
              {editing ? <Pencil className="size-3.5" /> : <Copy className="size-3.5" />}
            </span>
            <div>
              <p className="font-medium">{editing ? `Editing ${sourceInvoice.invoice}` : `Duplicating ${sourceInvoice.invoice}`}</p>
              <p className="text-[11px] text-teal-700/80">
                {sourceInvoice.party} · {sourceInvoice.items} lines · {editing ? 'saving updates the original invoice' : 'saving creates a new invoice'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-white" onClick={() => navigate('/app/sales')}>
            <ArrowLeft className="size-4" /> Back to sales
          </Button>
        </div>
      )}

      {sourceDraft && draftContext && (
        <div className="flex flex-col gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-[13px] text-teal-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-teal-700 ring-1 ring-teal-100">
              {duplicatingDraft ? <Copy className="size-3.5" /> : editingDraft ? <Pencil className="size-3.5" /> : <FileClock className="size-3.5" />}
            </span>
            <div>
              <p className="font-medium">
                {duplicatingDraft ? `Duplicating ${sourceDraft.label}` : editingDraft ? `Editing ${sourceDraft.label}` : `Continuing ${sourceDraft.label}`}
              </p>
              <p className="text-[11px] text-teal-700/80">
                {sourceDraft.customer ?? 'Walk-in customer'} · {sourceDraft.items} items · saved {sourceDraft.savedAt}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-white" onClick={() => navigate('/app/sales')}>
            <ArrowLeft className="size-4" /> Back to sales
          </Button>
        </div>
      )}

      {sourceTemplate && templateContext && (
        <div className="flex flex-col gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-[13px] text-teal-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-white text-teal-700 ring-1 ring-teal-100">
              <FileText className="size-3.5" />
            </span>
            <div>
              <p className="font-medium">Using template · {sourceTemplate.name}</p>
              <p className="text-[11px] text-teal-700/80">
                {sourceTemplate.customer ?? 'Any customer'} · {sourceTemplate.items} items · last used {sourceTemplate.lastUsed}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-white" onClick={() => navigate('/app/sales')}>
            <ArrowLeft className="size-4" /> Back to sales
          </Button>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-4">
          <CartTable
            lines={cart.lines}
            lastAdded={cart.lastAdded}
            onAdd={cart.addProduct}
            onUpdate={cart.updateLine}
            onRemove={cart.removeLine}
            searchRef={searchRef} />
          

          <section aria-labelledby="quick-items">
            <div className="mb-2 flex items-center justify-between">
              <h2 id="quick-items" className="text-sm font-semibold text-ink">
                Quick items <span className="font-bn font-normal text-ink-500">· দ্রুত যোগ</span>
              </h2>
              <span className="text-xs text-ink-500">Tap to add · touch friendly</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {quickItems.map((p) =>
              <button
                key={p.id}
                onClick={() => cart.addProduct(p)}
                className="group flex items-center gap-2.5 rounded-xl border border-ink-100 bg-white p-2.5 text-left shadow-card transition-colors hover:border-teal-300 hover:bg-teal-50/40 active:scale-[0.99]">
                
                  <ProductThumb src={p.image} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{p.name}</span>
                    <span className="block text-xs text-ink-500">
                      {taka(p.sellPrice, p.sellPrice % 1 ? 2 : 0)}/{p.unit}
                    </span>
                  </span>
                  <Plus className="size-4 text-ink-300 group-hover:text-teal-600" aria-hidden="true" />
                </button>
              )}
            </div>
          </section>
        </div>

        <CheckoutPanel
          invoice={invoice}
          totals={cart.totals}
          customer={cart.customer}
          onCustomer={cart.setCustomer}
          customerDetails={cart.customerDetails}
          onCustomerDetails={cart.setCustomerDetails}
          discount={cart.discount}
          onDiscount={cart.setDiscount}
          discountMode={cart.discountMode}
          onDiscountMode={cart.setDiscountMode}
          payments={cart.payments}
          onPayments={cart.setPayments}
          onComplete={complete}
          onClear={cart.reset}
          paidRef={paidRef}
          completeLabel={editing ? 'Update sale' : 'Complete sale'} />
        
      </div>

      <Dialog open={!!completed} onOpenChange={(open) => {
        if (open) return;
        if (editing) {
          setCompleted(null);
          navigate('/app/sales');
          return;
        }
        newSale();
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-success" /> {editing ? 'Sale updated' : 'Sale completed'}
            </DialogTitle>
            <DialogDescription>
              {completed?.invoice} · {taka(completed?.total ?? 0)}
              {completed && completed.due > 0 ? ` · ${taka(completed.due)} added to ${completed.customer}’s ledger` : ' · fully paid'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[52vh] overflow-auto rounded-lg bg-ink-50 py-4 scrollbar-thin">
            {completed && <ReceiptPreview {...completed} />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => toast.success('Sent to printer', { description: 'Thermal printer · 80mm' })}>
              <Printer className="size-4" /> Print receipt
            </Button>
            <Button onClick={() => {
              if (editing) {
                setCompleted(null);
                navigate('/app/sales');
                return;
              }
              newSale();
            }}>
              {editing ? <ArrowLeft className="size-4" /> : <Plus className="size-4" />}
              {editing ? 'Back to sales' : 'New sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

}