import { useTenantSettings } from '../settings/TenantSettingsProvider';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy, FileClock, FileText, Keyboard, Pencil, Printer, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '../components/Dialog';
import { CartTable } from '../components/pos/CartTable';
import { CheckoutPanel } from '../components/pos/CheckoutPanel';
import { TransactionReviewDialog } from '../components/TransactionReviewDialog';
import { DraftsMenu } from '../components/pos/DraftsMenu';
import { ProductThumb } from '../components/ProductThumb';
import { ReceiptPreview, type ReceiptLine, type ReceiptBranding } from '../components/brand/ReceiptPreview';
import { makePosPaymentRow, usePosCart, type CartLine, type PosPaymentRow } from '../hooks/usePosCart';
import { products } from '../data/products';
import {getOnlineSnapshot,orderTotals,preparePosHandoff} from '../onlineSales/onlineStore';
import { stockLots } from '../data/productInventory';
import { productOffers } from '../data/productOffers';
import { saleTemplates, salesDrafts, salesInvoices, type SalesDraft } from '../data/sales';
import { parties } from '../data/parties';
import { taka } from '../utils/currency';
import { compoundBaseQuantity, compoundLineTotal, formatCompoundQuantity, parseCompoundQuantity } from '../utils/posQuantity';
import { activeOfferFor, allocateLotQuantity, duplicateSerials, effectivePriceForUnit, productStockBreakdown, requiredSerialCount, warrantySnapshot } from '../utils/productFeatures';
import { blendedVendorUnitCost } from '../utils/posStock';
import {allocatePosStock} from '../vendor/vendorStock';
import {prepareVendorSalePreview} from '../vendor/vendorSalePreview';
import {dispatchVendorPreview} from '../vendor/vendorPreviewStore';
import type { SaleLine, SalePresetLine, SalesInvoice } from '../types/erp';

type CompletedSale = {
  invoice: string;
  customer?: string;
  customerPhone?: string;
  guardianName?: string;
  customerAddress?: string;
  lines: Array<ReceiptLine & Pick<SaleLine, 'productId' | 'unit' | 'returnableQuantity' | 'unitCost' | 'serials' | 'warranty' | 'lotAllocations' | 'stockSource'>>;
  subtotal: number;
  discount: number;
  rounding: number;
  branding?: ReceiptBranding;
  total: number;
  paid: number;
  due: number;
  method: string;
};

const quickItems = products.filter((p) => p.active && (p.kind === 'Service' || !p.expiry?.enabled || productStockBreakdown(p, stockLots).sellable > 0)).slice(0, 8);

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
      price: String(sourceLine.price),
      serials: sourceLine.serials ?? [],
      stockSource: sourceLine.stockSource
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

function cartFromInvoice(invoice: SalesInvoice, preserveHistorical = false): CartLine[] {
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
          price: String(sourceLine.price * product.altUnit.factor),
          serials: preserveHistorical ? sourceLine.serials ?? [] : [],
          stockSource: preserveHistorical ? sourceLine.stockSource : undefined,
          historicalWarranty: preserveHistorical ? sourceLine.warranty : undefined,
          historicalUnitCost: preserveHistorical ? sourceLine.unitCost : undefined
        }];
      }
    }

    return [{
      key: `source-${sourceLine.id}`,
      product,
      qty: String(sourceLine.returnableQuantity ?? (parseFloat(sourceLine.quantity) || 1)),
      secondaryQty: '',
      unit: product.unit,
      price: String(sourceLine.price),
      serials: preserveHistorical ? sourceLine.serials ?? [] : [],
      stockSource: preserveHistorical ? sourceLine.stockSource : undefined,
      historicalWarranty: preserveHistorical ? sourceLine.warranty : undefined,
      historicalUnitCost: preserveHistorical ? sourceLine.unitCost : undefined
    }];
  });
}

export function Pos() {
  const { state: settingsState } = useTenantSettings();
  const cart = usePosCart();
  const navigate = useNavigate();
  const location = useLocation();
  const incomingState = location.state as {hisabiqSource?:string;orderId?:string}|null;
  const incomingOrderId = incomingState?.hisabiqSource==='online-order'?incomingState.orderId:undefined;
  const handoffOrder = incomingOrderId?getOnlineSnapshot().orders.find(o=>o.id===incomingOrderId):undefined;
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
  const [reviewSaleOpen, setReviewSaleOpen] = useState(false);
  const [demoVendorInvoice,setDemoVendorInvoice]=useState<string|null>(null);
  const invoice = editing && sourceInvoice ? sourceInvoice.invoice : `INV-${String(invoiceNo).padStart(6, '0')}`;
  const pageTitle = handoffOrder?'Online order · POS preview':editing
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
  const pageTitleBn = handoffOrder?'অনলাইন অর্ডার':editing
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
      if ((!sourceDraft || !draftContext) && (!sourceTemplate || !templateContext) && !incomingOrderId) loadedSource.current = null;
      return;
    }
    const sourceKey = `${sourceMode}:${sourceInvoice.invoice}`;
    if (loadedSource.current === sourceKey) return;
    loadedSource.current = sourceKey;
    cart.setLines(cartFromInvoice(sourceInvoice, editing));
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

  useEffect(() => {
    if(!incomingOrderId)return;
    const sourceKey='online-order:'+incomingOrderId;
    if(loadedSource.current===sourceKey)return;
    try{
      const handoff=preparePosHandoff(incomingOrderId,products);
      loadedSource.current=sourceKey;
      cart.setLines(handoff.lines.map(l=>{
        const product=products.find(p=>p.id===l.productId)!;
        return {key:l.key,product,qty:l.qty,secondaryQty:l.secondaryQty,
          unit:l.unit,price:l.price,serials:[]};
      }));
      const matchingParty=handoff.partyId?parties.find(p=>p.id===handoff.partyId)??null:null;
      cart.setCustomer(matchingParty);
      cart.setCustomerDetails({name:handoff.customerName,phone:handoff.phone,guardianName:'',address:handoff.address});
      cart.setDiscount(handoff.discount?String(handoff.discount):'');
      cart.setDiscountMode('amount');
      cart.setPayments([makePosPaymentRow()]);
    }catch(e){toast.error(e instanceof Error?e.message:'Online order handoff unavailable.');navigate('/app/online-sales',{replace:true,state:null});}
  },[incomingOrderId,cart.setCustomer,cart.setCustomerDetails,cart.setDiscount,cart.setDiscountMode,cart.setLines,cart.setPayments,navigate]);

  const complete = () => {
    const t = cart.totals;
    const hasCreditCustomer = Boolean(cart.customer || (cart.customerDetails.name.trim() && cart.customerDetails.phone.trim()));
    if (t.total === 0 || (t.due > 0 && !hasCreditCustomer)) return;

    const allocated=allocatePosStock(cart.lines.map(l=>({key:l.key,product:l.product,
      requestedBaseQty:compoundBaseQuantity(l.qty,l.secondaryQty,
       l.product.altUnit&&l.unit===l.product.altUnit.unit?l.product.altUnit.factor:1),
      choice:l.stockSource})),stockLots);
    const unresolvedShortageLine=cart.lines.find((_,i)=>allocated[i]?.needsSourceBaseQty>0);
    if (unresolvedShortageLine) {
      const shortage=allocated.find(a=>a.key===unresolvedShortageLine.key)?.needsSourceBaseQty??0;
      toast.error('Choose stock shortage handling', {
        description: `${unresolvedShortageLine.product.name}: resolve ${shortage} ${unresolvedShortageLine.product.unit} shortage before completing the sale.`
      });
      return;
    }

    const fractionalRequiredLine = cart.lines.find((line) => {
      const factor = line.product.altUnit && line.unit === line.product.altUnit.unit ? line.product.altUnit.factor : 1;
      const baseQty = compoundBaseQuantity(line.qty, line.secondaryQty, factor);
      return line.product.serialTracking === 'Required' && !Number.isInteger(baseQty);
    });
    if (fractionalRequiredLine) {
      toast.error('Whole quantity required', { description: `${fractionalRequiredLine.product.name} uses Required serial tracking.` });
      return;
    }

    const soldOutsideEditedInvoice = salesInvoices
      .filter((invoiceItem) => !editing || invoiceItem.invoice !== sourceInvoice?.invoice)
      .flatMap((invoiceItem) => invoiceItem.lines.flatMap((line) => line.serials ?? []));
    const reusedSoldSerial = cart.lines.flatMap((line) => line.serials).find((serial) => soldOutsideEditedInvoice.includes(serial));
    if (reusedSoldSerial) {
      toast.error('Serial already sold', { description: reusedSoldSerial });
      return;
    }

    const allSelectedSerials = cart.lines.flatMap((line) => line.serials);
    const duplicateSelected = duplicateSerials(allSelectedSerials);
    if (duplicateSelected.length) {
      toast.error('Duplicate serial selected', { description: duplicateSelected[0] });
      return;
    }

    const tooManySerialsLine = cart.lines.find((line) => {
      const factor = line.product.altUnit && line.unit === line.product.altUnit.unit ? line.product.altUnit.factor : 1;
      const baseQty = compoundBaseQuantity(line.qty, line.secondaryQty, factor);
      return line.serials.length > Math.ceil(baseQty);
    });
    if (tooManySerialsLine) {
      toast.error('Too many serials selected', { description: `${tooManySerialsLine.product.name}: reduce serials or increase quantity.` });
      return;
    }

    const missingSerialLine = cart.lines.find((line) => {
      const factor = line.product.altUnit && line.unit === line.product.altUnit.unit ? line.product.altUnit.factor : 1;
      const baseQty = compoundBaseQuantity(line.qty, line.secondaryQty, factor);
      const required = requiredSerialCount(line.product, baseQty);
      return required > 0 && line.serials.length !== required;
    });
    if (missingSerialLine) {
      const factor = missingSerialLine.product.altUnit && missingSerialLine.unit === missingSerialLine.product.altUnit.unit ? missingSerialLine.product.altUnit.factor : 1;
      const required = requiredSerialCount(missingSerialLine.product, compoundBaseQuantity(missingSerialLine.qty, missingSerialLine.secondaryQty, factor));
      toast.error('Serial numbers required', { description: `${missingSerialLine.product.name}: ${missingSerialLine.serials.length}/${required} selected` });
      return;
    }
    const activePayments = cart.payments.filter((payment) => (parseFloat(payment.amount) || 0) > 0);
    const remainingLots=stockLots.map(lot=>({...lot}));
    setCompleted({
      invoice,
      customer: cart.customerDetails.name.trim() || cart.customer?.name || undefined,
      customerPhone: cart.customerDetails.phone.trim() || undefined,
      guardianName: cart.customerDetails.guardianName.trim() || undefined,
      customerAddress: cart.customerDetails.address.trim() || undefined,
      lines: cart.lines.map((l,index) => {
        const factor = l.product.altUnit && l.unit === l.product.altUnit.unit ? l.product.altUnit.factor : 1;
        const baseQty = compoundBaseQuantity(l.qty, l.secondaryQty, factor);
        const ownBaseQty=allocated[index]?.ownBaseQty??0;
        const shortage=Math.max(0,baseQty-ownBaseQty);
        const vendorBlendedCost = l.stockSource?.mode === 'Vendor' && l.stockSource.unitCost!==null
          ? blendedVendorUnitCost(baseQty,ownBaseQty,l.product.purchasePrice,l.stockSource.unitCost)
          : undefined;
        const allocatedLots=l.product.kind==='Service'?undefined:allocateLotQuantity(l.product,remainingLots,ownBaseQty).allocations;
        for(const consumed of allocatedLots??[]){
          const lot=remainingLots.find(item=>item.id===consumed.lotId);
          if(lot)lot.available=Math.max(0,lot.available-consumed.quantity);
        }
        return {
          productId: l.product.id,
          name: l.product.name,
          unit: l.product.unit,
          returnableQuantity: baseQty,
          qty: formatCompoundQuantity(l.qty, l.unit, l.secondaryQty, l.product.unit),
          price: parseFloat(l.price) || 0,
          total: compoundLineTotal(l.qty, l.secondaryQty, factor, l.price),
          unitCost: l.stockSource?.mode==='Vendor' && l.stockSource.unitCost===null
            ? undefined : vendorBlendedCost ?? (editing ? (l.historicalUnitCost ?? l.product.purchasePrice) : l.product.purchasePrice),
          serials: l.serials,
          warranty: editing ? (l.historicalWarranty ?? warrantySnapshot(l.product)) : warrantySnapshot(l.product),
          stockSource: shortage > 0 ? l.stockSource : undefined,
          lotAllocations: allocatedLots
        };
      }),
      subtotal: t.subtotal,
      discount: t.discountAmt,
      rounding: t.rounding,
      branding: { ...settingsState.sections.business, showLogo: settingsState.sections.invoices.showLogo, footer: settingsState.sections.invoices.footer },
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
        if (!reviewSaleOpen) setReviewSaleOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const simulateVendorSources=()=>{
    if(!completed || editing || demoVendorInvoice===completed.invoice)return;
    try{
      const allocations=allocatePosStock(cart.lines.map(l=>({key:l.key,product:l.product,
       requestedBaseQty:compoundBaseQuantity(l.qty,l.secondaryQty,
        l.product.altUnit&&l.unit===l.product.altUnit.unit?l.product.altUnit.factor:1),
       choice:l.stockSource})),stockLots);
      const prepared=prepareVendorSalePreview(completed.invoice,allocations,cart.lines);
      if(!prepared.sources.length)throw new Error('No Vendor sourced shortage to simulate.');
      dispatchVendorPreview({type:'simulate-pos-sale',operationId:'vendor-demo:'+completed.invoice,
       sale:prepared.sale,sources:prepared.sources});
      setDemoVendorInvoice(completed.invoice);
      toast.success('Vendor source added to demo preview',{description:'Open Vendor Party to view Price pending. No real ledger, stock or cash posting.'});
    }catch(error){toast.error(error instanceof Error?error.message:'Demo source could not be saved.');}
  };

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
        price: parseFloat(line.price) || 0,
        serials: line.serials,
        stockSource: line.stockSource
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
    setCompleted(null);setDemoVendorInvoice(null);
    cart.reset();
    setInvoiceNo((n) => n + 1);
    if (editing || duplicating || draftContext || templateContext || incomingOrderId) navigate('/app/pos', { replace: true, state: null });
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  return (
    <div className="pos-screen mx-auto max-w-[1440px] min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold tracking-tight">{pageTitle}</h1>
          <span className="font-bn text-sm text-ink-500">{pageTitleBn}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 rounded-lg border border-border bg-card px-3 py-1.5 text-[11.5px] text-ink-500 md:flex">
            <Keyboard className="size-3.5" aria-hidden="true" />
            {[
            ['F2', 'Search'],
            ['Enter', 'Next'],
            ['F8', 'Paid'],
            ['F9', 'Preview']].
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

      {handoffOrder && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-teal-300 bg-teal-50 p-3 text-sm text-teal-900 dark:bg-teal-900/20 dark:text-teal-200">
          <div>
            <p className="font-semibold">Prefilled from online order {handoffOrder.number} · POS preview only</p>
            <p className="mt-1 text-xs">
              Goods and quoted discount were copied. Delivery charge {orderTotals(handoffOrder).delivery}
              and advance {orderTotals(handoffOrder).advance} are <strong>NOT automatically added</strong>
              to POS item totals or payment rows. Verify each amount and inventory before completing a sale.
            </p>
            <p className="mt-1 text-xs">No Sales invoice, stock deduction or Party ledger posting is linked by this handoff.</p>
          </div>
          <Button size="sm" variant="outline" onClick={()=>navigate('/app/online-sales')}>Back to online orders</Button>
        </div>
      )}
      {sourceInvoice && (editing || duplicating) && (
        <div className="flex flex-col gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-[13px] text-teal-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-card text-teal-700 ring-1 ring-teal-100">
              {editing ? <Pencil className="size-3.5" /> : <Copy className="size-3.5" />}
            </span>
            <div>
              <p className="font-medium">{editing ? `Editing ${sourceInvoice.invoice}` : `Duplicating ${sourceInvoice.invoice}`}</p>
              <p className="text-[11px] text-teal-700/80">
                {sourceInvoice.party} · {sourceInvoice.items} lines · {editing ? 'saving updates the original invoice' : 'saving creates a new invoice'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-card" onClick={() => navigate('/app/sales')}>
            <ArrowLeft className="size-4" /> Back to sales
          </Button>
        </div>
      )}

      {sourceDraft && draftContext && (
        <div className="flex flex-col gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-[13px] text-teal-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-card text-teal-700 ring-1 ring-teal-100">
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
          <Button variant="outline" size="sm" className="bg-card" onClick={() => navigate('/app/sales')}>
            <ArrowLeft className="size-4" /> Back to sales
          </Button>
        </div>
      )}

      {sourceTemplate && templateContext && (
        <div className="flex flex-col gap-2 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-[13px] text-teal-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-card text-teal-700 ring-1 ring-teal-100">
              <FileText className="size-3.5" />
            </span>
            <div>
              <p className="font-medium">Using template · {sourceTemplate.name}</p>
              <p className="text-[11px] text-teal-700/80">
                {sourceTemplate.customer ?? 'Any customer'} · {sourceTemplate.items} items · last used {sourceTemplate.lastUsed}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-card" onClick={() => navigate('/app/sales')}>
            <ArrowLeft className="size-4" /> Back to sales
          </Button>
        </div>
      )}

      <div data-pos-layout className="pos-columns grid min-w-0 grid-cols-1 gap-4">
        <div className="min-w-0 space-y-4">
          <CartTable
            lines={cart.lines}
            lastAdded={cart.lastAdded}
            onAdd={cart.addProduct}
            onUpdate={cart.updateLine}
            onRemove={cart.removeLine}
            onReorder={cart.reorderLines}
            onMove={cart.moveLine}
            searchRef={searchRef} />
          

          <section aria-labelledby="quick-items">
            <div className="mb-2 flex items-center justify-between">
              <h2 id="quick-items" className="text-sm font-semibold text-ink">
                Quick items <span className="font-bn font-normal text-ink-500">· দ্রুত যোগ</span>
              </h2>
              <span className="text-xs text-ink-500">Tap to add · touch friendly</span>
            </div>
            <div className="grid grid-cols-1 gap-2 min-[375px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {quickItems.map((p) =>
              <button
                key={p.id}
                onClick={() => cart.addProduct(p)}
                className="group flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5 text-left shadow-card transition-colors hover:border-teal-300 hover:bg-teal-50/40 active:scale-[0.99]">
                
                  <ProductThumb src={p.image} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-ink">{p.name}</span>
                    <span className="flex flex-wrap gap-x-1 text-xs text-ink-500">
                      {(() => {
                        const offer = activeOfferFor(p.id, productOffers);
                        const displayUnit = p.stockViewUnit ?? p.altUnit?.unit ?? p.unit;
                        const normalPrice = effectivePriceForUnit(p, undefined, displayUnit);
                        const price = effectivePriceForUnit(p, offer, displayUnit);
                        return <>{offer && <span className="text-[10px] text-ink-400 line-through">{taka(normalPrice)}</span>}<span>{taka(price, price % 1 ? 2 : 0)}/{displayUnit}</span></>;
                      })()}
                    </span>
                  </span>
                  <Plus className="size-4 text-helper group-hover:text-teal-600" aria-hidden="true" />
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
          onComplete={() => setReviewSaleOpen(true)}
          onClear={cart.reset}
          paidRef={paidRef}
          completeLabel={editing ? 'Preview sale update' : 'Preview sale'} />
        
      </div>

      <TransactionReviewDialog open={reviewSaleOpen} onClose={() => setReviewSaleOpen(false)}
        onConfirm={() => {setReviewSaleOpen(false);complete();}}
        title={editing ? 'Review sale update' : 'Review sale'} amount={cart.totals.total}
        confirmLabel={editing ? 'Confirm sale preview update' : 'Confirm sale preview'}
        details={[
          {label:'Customer',value:cart.customer?.name || cart.customerDetails.name || 'Walk-in customer'},
          {label:'Products',value:String(cart.lines.length)+' lines'},
          {label:'Paid',value:taka(cart.totals.paidNum)},
          {label:'Due',value:taka(cart.totals.due)}
        ]}/>
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
              <CheckCircle2 className="size-5 text-teal-600" /> {editing ? 'Sale update preview' : 'Sale preview · Not posted'}
            </DialogTitle>
            <DialogDescription>
              {completed?.invoice} · {taka(completed?.total ?? 0)}
              {completed && completed.due > 0 ? ` · Due ${taka(completed.due)} (not posted to ledger)` : ' · fully paid in preview'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[52vh] overflow-auto rounded-lg bg-ink-50 py-4 scrollbar-thin">
            {completed && <ReceiptPreview {...completed} />}
          </div>
          <DialogFooter>
            {completed?.lines.some(l=>l.stockSource?.mode==='Vendor')&&
              <Button variant="outline" onClick={simulateVendorSources}
                disabled={!!demoVendorInvoice||editing}
                title={editing?'Historical source updates are not enabled in the UI preview':
                  demoVendorInvoice?'Demo source already recorded':'Simulate source quantity for Vendor workspace; no backend posting'}>
                {demoVendorInvoice?'Vendor source in demo':'Simulate Vendor source'}
              </Button>}
            <Button variant="outline" onClick={() => window.print()}>
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
