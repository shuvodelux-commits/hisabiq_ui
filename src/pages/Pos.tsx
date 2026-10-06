import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy, Keyboard, Pencil, Printer, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../components/Dialog';
import { CartTable } from '../components/pos/CartTable';
import { CheckoutPanel } from '../components/pos/CheckoutPanel';
import { DraftsMenu } from '../components/pos/DraftsMenu';
import { ProductThumb } from '../components/ProductThumb';
import { ReceiptPreview, type ReceiptLine } from '../components/brand/ReceiptPreview';
import { demoCart, usePosCart, type CartLine } from '../hooks/usePosCart';
import { products } from '../data/products';
import { salesDrafts, salesInvoices, type SalesDraft } from '../data/sales';
import { parties } from '../data/parties';
import { taka } from '../utils/currency';
import { priceFor } from '../utils/units';
import type { SalesInvoice } from '../types/erp';

type CompletedSale = {
  invoice: string;
  customer?: string;
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

function cartFromInvoice(invoice: SalesInvoice): CartLine[] {
  return invoice.lines.flatMap((sourceLine) => {
    const product = products.find((item) => item.id === sourceLine.productId);
    if (!product) return [];
    const alternateUnit = product.altUnit?.unit;
    const hasAlternate = Boolean(alternateUnit && sourceLine.quantity.includes(alternateUnit));
    const hasBase = sourceLine.quantity.includes(product.unit);
    const unit = hasAlternate && !hasBase && alternateUnit ? alternateUnit : product.unit;
    const qty = unit === product.unit
      ? String(sourceLine.returnableQuantity ?? (parseFloat(sourceLine.quantity) || 1))
      : String(parseFloat(sourceLine.quantity) || 1);
    return [{
      key: `source-${sourceLine.id}`,
      product,
      qty,
      unit,
      price: String(priceFor(product, unit))
    }];
  });
}

export function Pos() {
  const cart = usePosCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceMode = searchParams.get('mode');
  const sourceInvoiceNo = searchParams.get('invoice');
  const sourceInvoice = salesInvoices.find((sale) => sale.invoice === sourceInvoiceNo) ?? null;
  const editing = sourceMode === 'edit' && !!sourceInvoice;
  const duplicating = sourceMode === 'duplicate' && !!sourceInvoice;
  const loadedSource = useRef<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const paidRef = useRef<HTMLInputElement>(null);
  const [invoiceNo, setInvoiceNo] = useState(242);
  const [drafts, setDrafts] = useState<SalesDraft[]>(salesDrafts);
  const [completed, setCompleted] = useState<CompletedSale | null>(null);
  const invoice = editing && sourceInvoice ? sourceInvoice.invoice : `INV-${String(invoiceNo).padStart(6, '0')}`;
  const pageTitle = editing ? 'Edit sale' : duplicating ? 'Duplicate sale' : 'New sale';
  const pageTitleBn = editing ? 'বিক্রি সম্পাদনা' : duplicating ? 'বিক্রি কপি' : 'নতুন বিক্রি';

  useEffect(() => {
    if (!sourceInvoice || (!editing && !duplicating)) {
      loadedSource.current = null;
      return;
    }
    const sourceKey = `${sourceMode}:${sourceInvoice.invoice}`;
    if (loadedSource.current === sourceKey) return;
    loadedSource.current = sourceKey;
    cart.setLines(cartFromInvoice(sourceInvoice));
    cart.setCustomer(sourceInvoice.partyId ? parties.find((party) => party.id === sourceInvoice.partyId) ?? null : null);
    cart.setDiscount(sourceInvoice.discount ? String(sourceInvoice.discount) : '');
    cart.setDiscountMode('amount');
    cart.setMethod(sourceInvoice.method);
    cart.setPaid(editing && sourceInvoice.paid ? String(sourceInvoice.paid) : '');
  }, [cart.setCustomer, cart.setDiscount, cart.setDiscountMode, cart.setLines, cart.setMethod, cart.setPaid, duplicating, editing, sourceInvoice, sourceMode]);

  const complete = () => {
    const t = cart.totals;
    if (t.total === 0 || t.due > 0 && !cart.customer) return;
    setCompleted({
      invoice,
      customer: cart.customer?.name,
      lines: cart.lines.map((l) => ({
        name: l.product.name,
        qty: `${l.qty} ${l.unit}`,
        price: parseFloat(l.price) || 0,
        total: (parseFloat(l.qty) || 0) * (parseFloat(l.price) || 0)
      })),
      subtotal: t.subtotal,
      discount: t.discountAmt,
      rounding: t.rounding,
      total: t.total,
      paid: Math.min(t.paidNum, t.total),
      due: t.due,
      method: cart.method
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
      customer: cart.customer?.name,
      items: cart.lines.length,
      total: cart.totals.total,
      savedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }]
    );
    cart.reset();
    toast.success('Sale held as draft');
  };

  const resume = (d: SalesDraft) => {
    cart.setLines(demoCart());
    cart.setCustomer(parties.find((p) => p.name === d.customer) ?? null);
    setDrafts((ds) => ds.filter((x) => x.id !== d.id));
    toast(`${d.label} resumed`);
  };

  const newSale = () => {
    setCompleted(null);
    cart.reset();
    setInvoiceNo((n) => n + 1);
    if (editing || duplicating) navigate('/app/pos', { replace: true });
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
                    <span className="block text-xs tabular-nums text-ink-500">
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
          discount={cart.discount}
          onDiscount={cart.setDiscount}
          discountMode={cart.discountMode}
          onDiscountMode={cart.setDiscountMode}
          paid={cart.paid}
          onPaid={cart.setPaid}
          method={cart.method}
          onMethod={cart.setMethod}
          onComplete={complete}
          onClear={cart.reset}
          paidRef={paidRef}
          completeLabel={editing ? 'Update sale' : 'Complete sale'} />
        
      </div>

      <Dialog open={!!completed} onOpenChange={(o) => !o && newSale()}>
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