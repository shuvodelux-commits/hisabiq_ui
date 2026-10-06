import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Keyboard, Printer, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../components/Dialog';
import { CartTable } from '../components/pos/CartTable';
import { CheckoutPanel } from '../components/pos/CheckoutPanel';
import { DraftsMenu } from '../components/pos/DraftsMenu';
import { ProductThumb } from '../components/ProductThumb';
import { ReceiptPreview, type ReceiptLine } from '../components/brand/ReceiptPreview';
import { demoCart, usePosCart } from '../hooks/usePosCart';
import { products } from '../data/products';
import { salesDrafts, type SalesDraft } from '../data/sales';
import { parties } from '../data/parties';
import { taka } from '../utils/currency';

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

export function Pos() {
  const cart = usePosCart();
  const searchRef = useRef<HTMLInputElement>(null);
  const paidRef = useRef<HTMLInputElement>(null);
  const [invoiceNo, setInvoiceNo] = useState(242);
  const [drafts, setDrafts] = useState<SalesDraft[]>(salesDrafts);
  const [completed, setCompleted] = useState<CompletedSale | null>(null);
  const invoice = `INV-${String(invoiceNo).padStart(6, '0')}`;

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
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold tracking-tight">New sale</h1>
          <span className="font-bn text-sm text-ink-500">নতুন বিক্রি</span>
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
          paidRef={paidRef} />
        
      </div>

      <Dialog open={!!completed} onOpenChange={(o) => !o && newSale()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-success" /> Sale completed
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
            <Button onClick={newSale}>
              <Plus className="size-4" /> New sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

}