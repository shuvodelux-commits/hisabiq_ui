import {businessToday} from '../utils/dateRange';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Keyboard, Save, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { QuickAddSelect } from '../components/QuickAddSelect';
import { PhotoUploader } from '../components/products/PhotoUploader';
import { AddProductDialog, type ProductOpeningMeta } from '../components/products/AddProductDialog';
import { PurchaseCart } from '../components/purchases/PurchaseCart';
import { PurchaseDraftsMenu } from '../components/purchases/PurchaseDraftsMenu';
import { getPurchaseDrafts, subscribePurchaseDrafts, savePurchaseDraft, deletePurchaseDraft, type PurchaseDraft, type PurchaseDraftInput } from '../data/purchaseDraftsPreviewStore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/Dialog';
import { TransactionReviewDialog } from '../components/TransactionReviewDialog';
import { PurchasePaymentPanel, makePurchasePaymentRow, type PurchasePaymentRow } from '../components/purchases/PurchasePaymentPanel';
import { useTenantSettings } from '../settings/TenantSettingsProvider';
import { calculatePurchaseCheckout, type PurchaseDiscountMode } from '../utils/purchaseCheckout';
import { stockLots } from '../data/productInventory';
import { salesInvoices } from '../data/sales';
import { purchases as seedPurchases } from '../data/purchases';
import { availableParties, availableProducts, availableStockLots, availablePurchases, createPreviewParty, createPreviewProduct, createPreviewPurchase } from '../data/erpDemoStore';
import type { Party, PaymentSplit, Product, Purchase } from '../types/erp';
import { taka } from '../utils/currency';
import { duplicateSerials, normalizeSerials, requiredSerialCount } from '../utils/productFeatures';
import { amountOf, rounded, baseQty, baseCost, lineAmount, describeQty, lotBaseSellPrice, makePurchaseLine, switchPurchaseUnit, type PurchaseCartLine } from '../utils/purchaseCart';
import {purchaseSupplierGuard} from '../utils/purchaseSupplierGuard';

type Line = PurchaseCartLine;

const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = businessToday;
type PurchaseEditorProps={initialPurchase?:Purchase;onSaveSource?:(purchase:Purchase)=>void;initialSupplierId?:string;lockedSupplierId?:string;embedded?:boolean;active?:boolean;onCompleted?:(purchase:Purchase)=>void;onCancel?:()=>void};
export function PurchaseEditor({initialPurchase,onSaveSource,initialSupplierId,lockedSupplierId,embedded=false,active=true,onCompleted,onCancel}:PurchaseEditorProps={}) {
  const navigate = useNavigate();
  const { state: settingsState } = useTenantSettings();
  const [products, setProducts] = useState(() => availableProducts().filter((product) => product.kind !== 'Service'));
  const [suppliers, setSuppliers] = useState(() => availableParties().filter((party) => party.roles.includes('Supplier') || party.roles.includes('Vendor')));
  const [supplierId, setSupplierId] = useState(initialPurchase?.supplierId??initialSupplierId??'');
  const [date, setDate] = useState(()=>initialPurchase?.businessDate??todayISO());
  const [backdateReason, setBackdateReason] = useState('');
  const [referenceNo, setReferenceNo] = useState(initialPurchase?.memoNo??'');
  const [notes, setNotes] = useState(initialPurchase?.notes??'');
  const [lines, setLines] = useState<Line[]>(()=>structuredClone(initialPurchase?.cartSnapshot??[]));
  const [payments, setPayments] = useState<PurchasePaymentRow[]>(()=>initialPurchase?.payments?.length?initialPurchase.payments.map(p=>({...p,method:p.method as PurchasePaymentRow["method"],account:p.account??"",amount:String(p.amount)})):[makePurchasePaymentRow()]);
  const [discount, setDiscount] = useState(String(initialPurchase?.discount??''));
  const [discountMode, setDiscountMode] = useState<PurchaseDiscountMode>('amount');
  const [photos, setPhotos] = useState<string[]>(()=>initialPurchase?.receipt?[initialPurchase.receipt]:[]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [reviewPurchaseOpen, setReviewPurchaseOpen] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<PurchaseDraft | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const savedSignature = useRef('');
  const allDrafts = useSyncExternalStore(subscribePurchaseDrafts, getPurchaseDrafts, getPurchaseDrafts);
  const draftEnabled = !embedded && !initialPurchase && !lockedSupplierId && !onSaveSource;
  const drafts = allDrafts.filter(d => d.tenantId === settingsState.tenantId);
  const [lastAdded, setLastAdded] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const qtyRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const smallRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const costRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const lotPriceRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const paymentAmountRef = useRef<HTMLInputElement>(null);

  const supplier = suppliers.find((party) => party.id === supplierId);
  const purchaseRef = initialPurchase?.ref ?? 'PUR-' + String(119 + availablePurchases().length - seedPurchases.length).padStart(6, '0');
  const subtotal = useMemo(() => rounded(lines.reduce((sum, line) => sum + lineAmount(line), 0)), [lines]);
  const totals = calculatePurchaseCheckout(subtotal, discount, discountMode, initialPurchase?.roundingRule??settingsState.sections.sales.rounding, payments);
  const { total, due, excess } = totals;
  const paid = totals.paidNum;

  const draftValues: PurchaseDraftInput = {
    tenantId: settingsState.tenantId,
    supplierId, supplierName: supplier?.name ?? '', date, backdateReason,
    referenceNo, notes, lines, payments, discount, discountMode, photos, total,
  };
  const draftSignature = JSON.stringify(draftValues);
  const hasDraftContent = Boolean(supplierId || lines.length || referenceNo.trim() || notes.trim() || photos.length ||
    payments.some(payment => Number(payment.amount) > 0));
  const unsavedDraft = draftEnabled && hasDraftContent && draftSignature !== savedSignature.current;

  const saveDraft = (): boolean => {
    if (!draftEnabled || !hasDraftContent) return false;
    try {
      const draft = savePurchaseDraft(draftValues, activeDraftId);
      setActiveDraftId(draft.id);
      savedSignature.current = draftSignature;
      toast.success('Purchase draft saved', { description: 'No stock, supplier due or cash was posted.' });
      return true;
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : 'Unable to save draft.');
      return false;
    }
  };
  const applyDraft = (draft: PurchaseDraft) => {
    if (draft.tenantId !== settingsState.tenantId) return;
    setSupplierId(draft.supplierId);
    setDate(draft.date);
    setBackdateReason(draft.backdateReason);
    setReferenceNo(draft.referenceNo);
    setNotes(draft.notes);
    setLines(structuredClone(draft.lines));
    setPayments(structuredClone(draft.payments));
    setDiscount(draft.discount);
    setDiscountMode(draft.discountMode);
    setPhotos(structuredClone(draft.photos));
    setActiveDraftId(draft.id);
    savedSignature.current = JSON.stringify({
      tenantId: draft.tenantId, supplierId: draft.supplierId, supplierName: draft.supplierName,
      date: draft.date, backdateReason: draft.backdateReason, referenceNo: draft.referenceNo,
      notes: draft.notes, lines: draft.lines, payments: draft.payments, discount: draft.discount,
      discountMode: draft.discountMode, photos: draft.photos, total: draft.total,
    });
    setLastAdded('');
    setError('');
    setReviewPurchaseOpen(false);
    toast.success('Purchase draft resumed');
  };
  const resumeDraft = (draft: PurchaseDraft) => {
    if (unsavedDraft && activeDraftId !== draft.id) setPendingDraft(draft);
    else applyDraft(draft);
  };
  const exitEditor = () => {
    if (onCancel) onCancel();
    else navigate('/app/purchases');
  };
  const requestExit = () => {
    if (unsavedDraft) setLeaveOpen(true);
    else exitEditor();
  };
  useEffect(() => {
    if (!unsavedDraft) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [unsavedDraft]);

  useEffect(() => {
    if (!lastAdded) return;
    qtyRefs.current[lastAdded]?.focus();
    qtyRefs.current[lastAdded]?.select();
  }, [lastAdded]);

  const addProduct = (product: Product) => {
    const added = makePurchaseLine(product);
    setLines((current) => [...current, added]);
    setLastAdded(added.id);
    setError('');
  };
  const updateLine = (id: string, patch: Partial<Line>) => setLines((current) => current.map((line) => line.id === id ? { ...line, ...patch } : line));
  const selectCostUnit = (line: Line, unit: string) => {
    setLines((current) => current.map((item) =>
      item.id === line.id ? switchPurchaseUnit(item, unit) : item));
  };

  const addSupplier = (name: string, phone: string, area: string) => {
    const party: Party = {
      id: 'qs-' + uid(), name, phone, area, roles: ['Supplier'],
      balance: 0, lastActivity: 'Just now', avatarColor: '#0D7C74'
    };
    createPreviewParty(party);
    setSuppliers((current) => [...current, party]);
    setSupplierId(party.id);
    setError('');
    toast.success('Supplier added and selected');
  };

  const addCreatedProduct = (product: Product, opening?: ProductOpeningMeta) => {
    createPreviewProduct(product, opening);
    if (product.kind !== 'Service') {
      setProducts((current) => [...current, product]);
      addProduct(product);
      toast.success('New product added to the purchase cart');
    } else {
      toast('Service created; only stock products can be purchased here');
    }
    setProductDialogOpen(false);
  };

  const validate = (): string | null => {
    if (!supplier) return 'Select or quick-add a supplier.';
    const wrongSupplier=purchaseSupplierGuard(supplier.id,lockedSupplierId);
    if(wrongSupplier)return wrongSupplier;
    if (!date) return 'Select a purchase date.';
    if (!initialPurchase && date < todayISO() && !backdateReason.trim()) return 'Add a reason for backdating this purchase.';
    if (lines.length === 0) return 'Add at least one product to the cart.';
    if (lines.some((line) => baseQty(line) <= 0)) return 'All purchase products need a quantity greater than zero.';
    if (lines.some((line) => !Number.isFinite(Number(line.cost)) || Number(line.cost) <= 0)) return 'Enter a valid purchase cost for every product.';
    if (lines.some((line) => !(lotBaseSellPrice(line) > 0))) return 'Enter a valid lot selling price for every product.';
    if (excess > 0) return 'Payments exceed the purchase total by ' + taka(excess) + '.';

    const existingSerials = [
      ...availableStockLots().filter(lot=>lot.reference!==initialPurchase?.ref).flatMap((lot) => lot.serials ?? []),
      ...salesInvoices.flatMap((invoice) => invoice.lines.flatMap((line) => line.serials ?? []))
    ];
    const seen: string[] = [];
    for (const line of lines) {
      const serials = normalizeSerials(line.serialText);
      const duplicate = duplicateSerials(serials, [...existingSerials, ...seen]);
      if (duplicate.length) return line.product.name + ': duplicate serial ' + duplicate[0] + '.';
      const required = requiredSerialCount(line.product, baseQty(line));
      if (required > 0 && !Number.isInteger(baseQty(line))) return line.product.name + ': serial-tracked stock requires a whole base-unit quantity.';
      if (required > 0 && serials.length !== required) return line.product.name + ': ' + required + ' unique serials required (' + serials.length + ' entered).';
      if (serials.length > baseQty(line)) return line.product.name + ': more serials than purchased units.';
      if (line.product.expiry?.enabled && line.product.expiry.dateRequired && !line.expiryDate) return line.product.name + ': expiry date is required.';
      if (line.manufactureDate && line.expiryDate && line.expiryDate <= line.manufactureDate) return line.product.name + ': expiry must be later than manufacture.';
      seen.push(...serials);
    }
    return null;
  };

  const save = () => {
    const message = validate();
    if (message) { setError(message); toast.error(message); return; }
    if (!supplier) return;
    const paymentSplits: PaymentSplit[] = payments.filter((row) => amountOf(row.amount) > 0).map((row) => ({
      id: row.id, method: row.method, account: row.account, amount: rounded(amountOf(row.amount))
    }));
    const purchase: Purchase = {
      ...initialPurchase,
      id: initialPurchase?.id??'pu-' + uid(),
      businessDate:date,roundingRule:initialPurchase?.roundingRule??settingsState.sections.sales.rounding,
      sourceRevision:initialPurchase?.sourceRevision??0,cartSnapshot:structuredClone(lines),
      ref: purchaseRef,
      date: new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      supplierId: supplier.id, supplier: supplier.name,
      items: lines.map((line) => line.product.name + ' · ' + describeQty(line)).join(', '),
      total, paid: rounded(paid), payments: paymentSplits,
      subtotal, discount: totals.discountAmt, rounding: totals.rounding,
      receipt: photos[0], memoNo: referenceNo.trim() || undefined,
      notes: notes.trim() || undefined,
      backdateReason: backdateReason.trim() || undefined,
      inventoryLines: lines.map((line) => ({
        productId: line.product.id, quantity: baseQty(line),
        unitCost: baseCost(line),
        lotSellingPrice: lotBaseSellPrice(line),
        serials: normalizeSerials(line.serialText).length ? normalizeSerials(line.serialText) : undefined,
        batchNumber: line.batchNumber.trim() || undefined,
        manufactureDate: line.manufactureDate || undefined,
        expiryDate: line.expiryDate || undefined
      }))
    };
    if(onSaveSource){onSaveSource(purchase);return;}
    try{createPreviewPurchase(purchase);}catch(e){setError(e instanceof Error?e.message:"Invalid purchase.");return;}
    if (activeDraftId) deletePurchaseDraft(activeDraftId);
    savedSignature.current = draftSignature;
    toast.success(purchase.ref + ' saved', { description: due > 0 ? taka(due) + ' payable to ' + supplier.name : 'Fully paid' });
    if(onCompleted)onCompleted(purchase);
    else navigate('/app/purchases');
  };

  const requestReview=()=>{
    const message=validate();
    if(message){setError(message);toast.error(message);return;}
    setError('');setReviewPurchaseOpen(true);
  };

  // Shortcuts mirror the POS workflow; dialogs retain their own keyboard handling.
  useEffect(() => {
    const handlePurchaseShortcuts = (event: KeyboardEvent) => {
      if (!active || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      const dialogOpen = Array.from(document.querySelectorAll('[data-slot="dialog-content"]'))
        .some((node) => (node as HTMLElement).getClientRects().length > 0);
      if (dialogOpen) return;
      if (event.key === 'F2') {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === 'F8') {
        event.preventDefault();
        paymentAmountRef.current?.focus();
        paymentAmountRef.current?.select();
      } else if (event.key === 'F9') {
        event.preventDefault();
        requestReview();
      }
    };
    window.addEventListener('keydown', handlePurchaseShortcuts);
    return () => window.removeEventListener('keydown', handlePurchaseShortcuts);
  });

  return (
    <div data-purchase-workspace className="purchase-workspace mx-auto max-w-[1440px] min-w-0 space-y-3 pb-8">
      {!embedded && <PageHeader
        compact
        title="New purchase" titleBn="নতুন ক্রয়"
        actions={<>
          <div className="hidden items-center gap-2 rounded-md border border-border bg-card px-2 py-1 text-[11px] text-ink-500 lg:flex"
            aria-label="Purchase keyboard shortcuts">
            <Keyboard className="size-3.5" aria-hidden="true" />
            {([['F2', 'Search'], ['Enter', 'Next'], ['F8', 'Paid'], ['F9', 'Review']] as const).map(([key, label]) => (
              <span key={key} className="flex items-center gap-1"><kbd className="rounded border border-ink-200 bg-ink-50 px-1 text-[10px]">{key}</kbd> {label}</span>
            ))}
          </div>
          {draftEnabled && <PurchaseDraftsMenu drafts={drafts} onResume={resumeDraft}
            onDelete={id => { deletePurchaseDraft(id); if (activeDraftId === id) { setActiveDraftId(null); savedSignature.current = ''; } }} />}
          <Button type="button" variant="outline" size="sm" onClick={requestExit}>
            <ArrowLeft className="size-4" /> Purchases
          </Button>
        </>}
      />}

      <div data-purchase-layout className="min-w-0 space-y-3">
        <section data-purchase-details aria-labelledby="purchase-details-title"
          className="rounded-xl border border-border bg-card px-3 py-3 shadow-card md:px-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 id="purchase-details-title" className="text-[13px] font-semibold text-ink">
              Supplier & purchase <span className="font-bn text-[11px] font-normal text-ink-500">· সরবরাহকারী ও ক্রয়</span>
            </h2>
            <span className="shrink-0 rounded-md bg-ink-50 px-2 py-1 text-[11px] text-ink-600">{purchaseRef}</span>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div data-purchase-supplier-field className="flex min-w-0 flex-col gap-1 sm:col-span-2 lg:col-span-1">
              <label className="block min-h-5 text-[12px] font-medium leading-5 text-ink" id="purchase-supplier-label">
                Supplier <span className="font-bn font-normal text-ink-500">· সরবরাহকারী</span> <span className="text-danger">*</span>
              </label>
              <div className="min-w-0">
                {(lockedSupplierId || initialPurchase) ?
                  <div className="flex h-9 min-w-0 items-center rounded-md border border-border bg-ink-50 px-3 text-[13px] text-ink">
                    <span className="min-w-0 truncate">{supplier?.name ?? 'Selected supplier'}</span>
                    <span className="ml-2 shrink-0 text-[11px] text-ink-500">· Original supplier</span>
                  </div> :
                  <QuickAddSelect label="Supplier" value={supplier?.name ?? ''}
                    options={['Select supplier', ...suppliers.map((party) => party.name)]}
                    onChange={(value) => setSupplierId(suppliers.find((party) => party.name === value)?.id ?? '')}
                    onCreate={addSupplier} showContact placeholder="Supplier or business name" />
                }
              </div>
            </div>
            <label data-purchase-date-field className="flex min-w-0 flex-col gap-1 text-[12px] font-medium text-ink">
              <span className="block min-h-5 leading-5">Purchase date <span className="text-danger">*</span></span>
              <Input className="h-9 w-full min-w-0" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
            <label data-purchase-reference-field className="flex min-w-0 flex-col gap-1 text-[12px] font-medium text-ink">
              <span className="block min-h-5 leading-5">Reference <span className="font-normal text-ink-500">· optional</span></span>
              <Input className="h-9 w-full min-w-0" value={referenceNo} onChange={(event) => setReferenceNo(event.target.value)}
                placeholder="Bill / challan no." />
            </label>
            {date && date < todayISO() && (
              <label className="block min-w-0 text-[12px] font-medium text-ink sm:col-span-2 lg:col-span-3">
                Backdate reason <span className="text-danger">*</span>
                <Input className="mt-1" value={backdateReason} onChange={(event) => setBackdateReason(event.target.value)}
                  placeholder="Reason for entering an earlier purchase" />
              </label>
            )}
          </div>
        </section>

        <PurchaseCart
          lines={lines}
          products={products}
          searchRef={searchRef}
          qtyRefs={qtyRefs}
          smallRefs={smallRefs}
          costRefs={costRefs}
          lotPriceRefs={lotPriceRefs}
          onAdd={addProduct}
          onCreate={() => setProductDialogOpen(true)}
          onUpdate={updateLine}
          onRemove={(id) => setLines((current) => current.filter((line) => line.id !== id))}
          onCostUnitChange={selectCostUnit}
        />

        <aside data-purchase-checkout className="min-w-0 space-y-2">
          <PurchasePaymentPanel
            totals={totals}
            itemCount={lines.length}
            discount={discount}
            discountMode={discountMode}
            onDiscount={setDiscount}
            onDiscountMode={setDiscountMode}
            payments={payments}
            onPayments={setPayments}
            paidRef={paymentAmountRef}
            actionLabel={initialPurchase ? "Review correction" : undefined}
            hideAction
            additionalDetails={
              <div data-purchase-additional className="min-w-0">
                <div data-purchase-note-attachment-row className="grid min-w-0 grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_232px]">
                  <div className="min-w-0">
                    <label htmlFor="purchase-notes" className="block text-[12px] font-medium leading-5 text-ink">
                      Notes <span className="font-normal text-ink-500">· optional</span>
                    </label>
                    <textarea id="purchase-notes" rows={4} value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Delivery, discount or other details"
                      className="mt-1 block h-28 w-full min-w-0 resize-none overflow-y-auto rounded-md border border-input bg-card px-3 py-2 text-[13px] font-normal leading-5 text-ink outline-none placeholder:text-ink-400 focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    <p className="mt-1 text-[11px] text-ink-500">Receipt (optional): challan or payment slip</p>
                  </div>
                  <div data-purchase-receipt className="min-w-0">
                    <p className="text-[12px] font-medium leading-5 text-ink">Add receipt <span className="font-normal text-ink-500">· optional</span></p>
                    <div className="mt-1">
                      <PhotoUploader square photos={photos} onChange={setPhotos} max={2}
                        label="Attach supplier bill or receipt" />
                    </div>
                  </div>
                </div>
              </div>
            }
            onComplete={requestReview}
          />
          {error && <div role="alert" className="rounded-md border border-danger/20 bg-danger-bg p-3 text-[12px] text-danger">{error}</div>}
          <div data-purchase-review-actions className="flex flex-wrap items-center justify-end gap-2 border-t border-border py-3">
            <Button type="button" variant="ghost" size="sm" onClick={requestExit}
              className="mr-auto h-10 text-[12px] text-ink-500">
              Cancel
            </Button>
            {draftEnabled && <Button type="button" data-purchase-save-draft variant="outline"
              disabled={!hasDraftContent} onClick={saveDraft}
              className="h-10 rounded-full px-4 text-[13px] font-medium">
              <Save className="size-4" aria-hidden="true"/> Save draft
            </Button>}
            <Button type="button" data-purchase-review-action
              disabled={total <= 0 || excess > 0} onClick={requestReview}
              className="h-10 rounded-full bg-ink px-4 text-[13px] font-medium text-white hover:bg-ink/90">
              {initialPurchase ? 'Review correction' : 'Review purchase'}
              <ArrowRight className="size-4" aria-hidden="true"/>
            </Button>
          </div>
          <p className="text-right text-[11px] text-ink-500">
            Preview only · Drafts remain in this session until refresh.
          </p>
        </aside>
      </div>

      <Dialog open={!!pendingDraft} onOpenChange={value => { if (!value) setPendingDraft(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resume another draft?</DialogTitle>
            <DialogDescription>Unsaved changes in this Purchase will be replaced. Save this draft first to keep them.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingDraft(null)}>Stay here</Button>
            <Button type="button" onClick={() => { if (pendingDraft) applyDraft(pendingDraft); setPendingDraft(null); }}>Discard changes & resume</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave this purchase?</DialogTitle>
            <DialogDescription>Save an unfinished purchase as a draft, or discard your changes.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLeaveOpen(false)}>Stay here</Button>
            <Button type="button" variant="outline" onClick={() => { setLeaveOpen(false); exitEditor(); }}>Discard</Button>
            <Button type="button" onClick={() => { if (saveDraft()) { setLeaveOpen(false); exitEditor(); } }}>Save draft & leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TransactionReviewDialog open={reviewPurchaseOpen} onClose={() => setReviewPurchaseOpen(false)}
        onConfirm={() => {setReviewPurchaseOpen(false);save();}}
        title={initialPurchase ? 'Review purchase correction' : 'Review purchase'} amount={total}
        confirmLabel={initialPurchase ? 'Confirm correction preview' : 'Confirm purchase preview'}
        details={[
          {label:'Supplier',value:supplier?.name ?? 'Select supplier'},
          {label:'Products',value:String(lines.length)+' lines'},
          {label:'Paid',value:taka(paid)},
          {label:'Due',value:taka(due)}
        ]}/>
      <AddProductDialog open={productDialogOpen} onOpenChange={setProductDialogOpen} onSave={addCreatedProduct}
        existingSerials={[...stockLots.flatMap((lot) => lot.serials ?? []), ...salesInvoices.flatMap((invoice) => invoice.lines.flatMap((line) => line.serials ?? []))]} />
    </div>
  );
}
