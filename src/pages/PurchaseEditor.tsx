import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PackagePlus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { FormSelect } from '../components/FormSelect';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { ProductThumb } from '../components/ProductThumb';
import { QuickAddSelect } from '../components/QuickAddSelect';
import { PhotoUploader } from '../components/products/PhotoUploader';
import { AddProductDialog } from '../components/products/AddProductDialog';
import { PurchaseProductSearch } from '../components/purchases/PurchaseProductSearch';
import { stockLots } from '../data/productInventory';
import { salesInvoices } from '../data/sales';
import { purchases as seedPurchases } from '../data/purchases';
import { availableParties, availableProducts, availablePurchases, createPreviewParty, createPreviewProduct, createPreviewPurchase } from '../data/erpDemoStore';
import type { Party, PaymentMethod, PaymentSplit, Product, Purchase } from '../types/erp';
import { taka } from '../utils/currency';
import { formatStock } from '../utils/units';
import { duplicateSerials, normalizeSerials, requiredSerialCount } from '../utils/productFeatures';

type Method = Exclude<PaymentMethod, 'Customer Credit'>;
type PaymentRow = { id: string; method: Method; account: string; amount: string };
type Line = {
  id: string; product: Product; bigQty: string; smallQty: string;
  cost: string; costUnit: string; serialText: string;
  batchNumber: string; manufactureDate: string; expiryDate: string;
};

const methods: Method[] = ['Cash', 'Bank', 'bKash', 'Nagad', 'Card'];
const accounts: Record<Method, string[]> = {
  Cash: ['Cash counter'], Bank: ['Dutch-Bangla Bank · 4582'],
  Card: ['Dutch-Bangla Bank · 4582'],
  bKash: ['bKash Business · 01711•••412'],
  Nagad: ['Nagad Merchant · 01819•••771']
};
const uid = () => Math.random().toString(36).slice(2, 10);
const amountOf = (value: string) => Math.max(0, Number(value) || 0);
const rounded = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const todayISO = () => {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};
const paymentRow = (): PaymentRow => ({ id: uid(), method: 'Cash', account: accounts.Cash[0], amount: '' });
const conversion = (product: Product) => product.altUnit?.factor || 1;
const baseQty = (line: Line) => amountOf(line.bigQty) * (line.product.altUnit ? conversion(line.product) : 0) + amountOf(line.smallQty);
const baseCost = (line: Line) => amountOf(line.cost) / (line.product.altUnit?.unit === line.costUnit ? conversion(line.product) : 1);
const lineAmount = (line: Line) => rounded(baseQty(line) * baseCost(line));
const describeQty = (line: Line) => {
  const big = amountOf(line.bigQty), small = amountOf(line.smallQty);
  const parts = [];
  if (line.product.altUnit && big > 0) parts.push(big + ' ' + line.product.altUnit.unit);
  if (small > 0) parts.push(small + ' ' + line.product.unit);
  return parts.join(' ') || '0 ' + line.product.unit;
};
const newLine = (product: Product): Line => ({
  id: uid(), product, bigQty: product.altUnit ? '1' : '0', smallQty: product.altUnit ? '0' : '1',
  costUnit: product.altUnit?.unit ?? product.unit,
  cost: String(rounded(product.purchasePrice * conversion(product))),
  serialText: '', batchNumber: '', manufactureDate: '', expiryDate: ''
});

export function PurchaseEditor() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => availableProducts().filter((product) => product.kind !== 'Service'));
  const [suppliers, setSuppliers] = useState(() => availableParties().filter((party) => party.roles.includes('Supplier') || party.roles.includes('Vendor')));
  const [supplierId, setSupplierId] = useState('');
  const [date, setDate] = useState(todayISO);
  const [backdateReason, setBackdateReason] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([paymentRow()]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [lastAdded, setLastAdded] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const qtyRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const smallRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const costRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const supplier = suppliers.find((party) => party.id === supplierId);
  const purchaseRef = 'PUR-' + String(119 + availablePurchases().length - seedPurchases.length).padStart(6, '0');
  const total = useMemo(() => rounded(lines.reduce((sum, line) => sum + lineAmount(line), 0)), [lines]);
  const paid = rounded(payments.reduce((sum, row) => sum + amountOf(row.amount), 0));
  const due = Math.max(0, rounded(total - paid));
  const excess = Math.max(0, rounded(paid - total));

  useEffect(() => {
    if (!lastAdded) return;
    qtyRefs.current[lastAdded]?.focus();
    qtyRefs.current[lastAdded]?.select();
  }, [lastAdded]);

  const addProduct = (product: Product) => {
    const added = newLine(product);
    setLines((current) => [...current, added]);
    setLastAdded(added.id);
    setError('');
  };
  const updateLine = (id: string, patch: Partial<Line>) => setLines((current) => current.map((line) => line.id === id ? { ...line, ...patch } : line));
  const updatePayment = (id: string, patch: Partial<PaymentRow>) => setPayments((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  const selectCostUnit = (line: Line, unit: string) => {
    const converted = baseCost(line) * (line.product.altUnit?.unit === unit ? conversion(line.product) : 1);
    updateLine(line.id, { costUnit: unit, cost: String(Math.round(converted * 10000) / 10000) });
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

  const addCreatedProduct = (product: Product) => {
    createPreviewProduct(product);
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
    if (!date) return 'Select a purchase date.';
    if (date < todayISO() && !backdateReason.trim()) return 'Add a reason for backdating this purchase.';
    if (lines.length === 0) return 'Add at least one product to the cart.';
    if (lines.some((line) => baseQty(line) <= 0)) return 'All purchase products need a quantity greater than zero.';
    if (lines.some((line) => !Number.isFinite(Number(line.cost)) || Number(line.cost) <= 0)) return 'Enter a valid purchase cost for every product.';
    if (excess > 0) return 'Payments exceed the purchase total by ' + taka(excess) + '.';

    const existingSerials = [
      ...stockLots.flatMap((lot) => lot.serials ?? []),
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
      id: 'pu-' + uid(),
      ref: purchaseRef,
      date: new Date(date + 'T12:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      supplierId: supplier.id, supplier: supplier.name,
      items: lines.map((line) => line.product.name + ' · ' + describeQty(line)).join(', '),
      total, paid: rounded(paid), payments: paymentSplits,
      receipt: photos[0], memoNo: referenceNo.trim() || undefined,
      notes: notes.trim() || undefined,
      backdateReason: backdateReason.trim() || undefined,
      inventoryLines: lines.map((line) => ({
        productId: line.product.id, quantity: baseQty(line),
        unitCost: baseCost(line),
        serials: normalizeSerials(line.serialText).length ? normalizeSerials(line.serialText) : undefined,
        batchNumber: line.batchNumber.trim() || undefined,
        manufactureDate: line.manufactureDate || undefined,
        expiryDate: line.expiryDate || undefined
      }))
    };
    createPreviewPurchase(purchase);
    toast.success(purchase.ref + ' saved', { description: due > 0 ? taka(due) + ' payable to ' + supplier.name : 'Fully paid' });
    navigate('/app/purchases');
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 pb-8">
      <PageHeader
        title="New purchase" titleBn="নতুন ক্রয়"
        description={purchaseRef + ' · Add products like a POS cart, then choose payment sources.'}
        actions={<Button variant="outline" size="sm" onClick={() => navigate('/app/purchases')}><ArrowLeft className="size-4" /> Purchases</Button>}
      />

      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div><p className="text-[13px] font-semibold text-ink">Purchase details</p><p className="font-bn text-[11px] text-ink-400">সরবরাহকারী ও ক্রয়ের তথ্য</p></div>
          <span className="rounded-md bg-ink-50 px-2 py-1 text-xs font-medium text-ink-600">{purchaseRef}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="block min-w-0 text-[12px] font-medium text-ink lg:col-span-2">
            Supplier <span className="font-bn font-normal text-ink-400">· সরবরাহকারী</span> <span className="text-danger">*</span>
            <div className="mt-1">
              <QuickAddSelect label="Supplier" value={supplier?.name ?? ''} options={['Select supplier', ...suppliers.map((party) => party.name)]}
                onChange={(value) => setSupplierId(suppliers.find((party) => party.name === value)?.id ?? '')}
                onCreate={addSupplier} showContact placeholder="Supplier or business name" />
            </div>
          </div>
          <label className="block text-[12px] font-medium text-ink">Purchase date <span className="text-danger">*</span>
            <Input className="mt-1" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="block text-[12px] font-medium text-ink">Supplier memo no. <span className="font-normal text-ink-400">· optional</span>
            <Input className="mt-1" value={referenceNo} onChange={(event) => setReferenceNo(event.target.value)} placeholder="Supplier bill / challan" />
          </label>
          {date && date < todayISO() && (
            <label className="block text-[12px] font-medium text-ink sm:col-span-2 lg:col-span-4">Backdate reason <span className="text-danger">*</span>
              <Input className="mt-1" value={backdateReason} onChange={(event) => setBackdateReason(event.target.value)} placeholder="Reason for entering an earlier purchase" />
            </label>
          )}
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-xl border border-border bg-card shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div><p className="text-[13px] font-semibold text-ink">Purchase cart <span className="font-bn text-[11px] font-normal text-ink-400">· পণ্য তালিকা</span></p>
                <p className="text-[11px] text-ink-500">Search → quantity → cost → next product. Large and small units stay together.</p></div>
              <Button size="sm" variant="outline" onClick={() => setProductDialogOpen(true)}><PackagePlus className="size-4" /> New product</Button>
            </div>
            <div className="flex gap-2 border-b border-border bg-teal-50/35 p-3">
              <PurchaseProductSearch ref={searchRef} products={products} onAdd={addProduct} onCreate={() => setProductDialogOpen(true)} />
            </div>
            {lines.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center px-4 py-6 text-center">
                <PackagePlus className="mb-2 size-7 text-ink-300" />
                <p className="text-[13px] font-medium text-ink">Your purchase cart is empty</p>
                <p className="font-bn mt-1 text-[12px] text-ink-500">উপরে পণ্য খুঁজুন অথবা নতুন পণ্য যোগ করুন</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {lines.map((line, index) => (
                  <div key={line.id} className="p-3">
                    <div className="grid gap-2 xl:grid-cols-[minmax(180px,1fr)_minmax(170px,1fr)_142px_98px_28px] xl:items-end">
                      <div className="flex min-w-0 items-center gap-2.5 self-center">
                        <span className="w-5 shrink-0 text-right text-xs text-ink-400">{index + 1}.</span>
                        <ProductThumb src={line.product.image} size={34} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-ink">{line.product.name}</p>
                          <p className="truncate text-[11px] text-ink-500"><span className="font-bn">{line.product.nameBn}</span> · {line.product.category} · Stock {formatStock(line.product)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] font-medium text-ink-500">Quantity <span className="font-bn">· পরিমাণ</span></p>
                        <div className="flex gap-1">
                          {line.product.altUnit && (
                            <div className="flex min-w-0 flex-1 items-center rounded-md border border-input bg-card focus-within:ring-2 focus-within:ring-teal-500/20">
                              <input ref={(node) => { qtyRefs.current[line.id] = node; }} aria-label={line.product.altUnit.unit + ' quantity for ' + line.product.name}
                                inputMode="decimal" value={line.bigQty}
                                onChange={(event) => updateLine(line.id, { bigQty: event.target.value.replace(/[^0-9.]/g, '') })}
                                onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); smallRefs.current[line.id]?.focus(); smallRefs.current[line.id]?.select(); } }}
                                className="h-9 w-full min-w-0 bg-transparent px-2 text-right text-sm text-ink outline-none" />
                              <span className="shrink-0 pr-2 text-[10px] text-ink-500">{line.product.altUnit.unit}</span>
                            </div>
                          )}
                          <div className="flex min-w-0 flex-1 items-center rounded-md border border-input bg-card focus-within:ring-2 focus-within:ring-teal-500/20">
                            <input ref={(node) => { smallRefs.current[line.id] = node; if (!line.product.altUnit) qtyRefs.current[line.id] = node; }}
                              aria-label={line.product.unit + ' quantity for ' + line.product.name}
                              inputMode="decimal" value={line.smallQty}
                              onChange={(event) => updateLine(line.id, { smallQty: event.target.value.replace(/[^0-9.]/g, '') })}
                              onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); costRefs.current[line.id]?.focus(); costRefs.current[line.id]?.select(); } }}
                              className="h-9 w-full min-w-0 bg-transparent px-2 text-right text-sm text-ink outline-none" />
                            <span className="shrink-0 pr-2 text-[10px] text-ink-500">{line.product.unit}</span>
                          </div>
                        </div>
                        <p className="mt-1 truncate text-[10px] text-ink-400">{describeQty(line)} = {baseQty(line)} {line.product.unit}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-[11px] font-medium text-ink-500">Cost per unit</p>
                        <div className="flex gap-1">
                          <Input ref={(node) => { costRefs.current[line.id] = node; }} aria-label={'Purchase cost for ' + line.product.name}
                            value={line.cost} inputMode="decimal"
                            onChange={(event) => updateLine(line.id, { cost: event.target.value.replace(/[^0-9.]/g, '') })}
                            onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); searchRef.current?.focus(); } }}
                            className="min-w-0 flex-1 text-right" />
                          <FormSelect className="w-[76px] shrink-0 [&>select]:px-1.5 [&>select]:pr-6 [&>select]:text-xs" value={line.costUnit}
                            onChange={(event) => selectCostUnit(line, event.target.value)}
                            options={line.product.altUnit ? [line.product.altUnit.unit, line.product.unit] : [line.product.unit]} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="mb-1 text-[11px] font-medium text-ink-500">Total</p>
                        <p className="flex h-9 items-center justify-end text-[13px] font-semibold text-ink">{taka(lineAmount(line))}</p>
                      </div>
                      <button type="button" aria-label={'Remove ' + line.product.name} onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}
                        className="flex size-8 items-center justify-center rounded-md text-ink-400 hover:bg-danger-bg hover:text-danger"><Trash2 className="size-4" /></button>
                    </div>
                    {((line.product.serialTracking ?? 'Off') !== 'Off' || line.product.expiry?.enabled) && (
                      <div className="mt-3 rounded-lg border border-border bg-ink-50/50 p-3">
                        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-500">Tracking details <span className="font-bn normal-case tracking-normal">· সিরিয়াল / মেয়াদ</span></p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {line.product.serialTracking && line.product.serialTracking !== 'Off' && (
                            <label className="text-[12px] font-medium text-ink">Serial numbers {line.product.serialTracking === 'Required' ? '*' : '(optional)'}
                              <textarea className="mt-1 min-h-20 w-full rounded-md border border-input bg-card p-2 text-xs" value={line.serialText}
                                onChange={(event) => updateLine(line.id, { serialText: event.target.value })} placeholder="One per line, or scan / paste" />
                              <span className="mt-1 block text-[11px] font-normal text-ink-400">{normalizeSerials(line.serialText).length} entered · {requiredSerialCount(line.product, baseQty(line))} required</span>
                            </label>
                          )}
                          {line.product.expiry?.enabled && (
                            <div className="grid grid-cols-2 gap-2">
                              <label className="text-[12px] text-ink">Batch<Input className="mt-1" value={line.batchNumber} onChange={(event) => updateLine(line.id, { batchNumber: event.target.value })} /></label>
                              <label className="text-[12px] text-ink">Manufactured<Input type="date" className="mt-1" value={line.manufactureDate} onChange={(event) => updateLine(line.id, { manufactureDate: event.target.value })} /></label>
                              <label className="col-span-2 text-[12px] text-ink">Expiry date {line.product.expiry.dateRequired && '*'}
                                <Input type="date" className="mt-1" value={line.expiryDate} onChange={(event) => updateLine(line.id, { expiryDate: event.target.value })} /></label>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 border-t border-border bg-ink-50/50 px-4 py-2.5 text-xs text-ink-500">
              <span>{lines.length} product line{lines.length === 1 ? '' : 's'}</span><span className="font-semibold text-ink">Subtotal · {taka(total)}</span>
            </div>
          </section>
          <section className="rounded-xl border border-border bg-card p-4 shadow-card">
            <p className="mb-3 text-[13px] font-semibold text-ink">Supplier memo & notes <span className="font-bn text-[11px] font-normal text-ink-400">· রসিদের ছবি</span></p>
            <label className="mb-3 block text-[12px] font-medium text-ink">Notes
              <Input className="mt-1" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Delivery, discount or other details (optional)" />
            </label>
            <PhotoUploader photos={photos} onChange={setPhotos} max={2} label="Attach" hint="Supplier memo, delivery challan or payment receipt · images for the UI preview" />
          </section>
        </div>

        <aside className="min-w-0 space-y-4 lg:sticky lg:top-4">
          <section className="rounded-xl border border-border bg-card shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
              <div><p className="text-[13px] font-semibold text-ink">Payment <span className="font-bn text-[11px] font-normal text-ink-400">· পেমেন্ট</span></p><p className="text-[11px] text-ink-500">Multiple payment sources supported</p></div>
              <Button size="sm" variant="outline" onClick={() => setPayments([{ ...paymentRow(), amount: String(total), method: payments[0]?.method ?? 'Cash', account: payments[0]?.account ?? accounts.Cash[0] }])} disabled={total <= 0}>Pay full</Button>
            </div>
            <div className="divide-y divide-border">
              {payments.map((row, index) => (
                <div key={row.id} className="space-y-2 p-3">
                  <div className="flex items-center justify-between text-[11px] font-medium text-ink-500"><span>Source {index + 1}</span>
                    <button type="button" disabled={payments.length === 1} onClick={() => setPayments((current) => current.filter((entry) => entry.id !== row.id))}
                      className="text-ink-400 hover:text-danger disabled:opacity-25" aria-label={'Remove payment source ' + (index + 1)}><Trash2 className="size-3.5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-[11px] text-ink-500">Method
                      <FormSelect className="mt-1" value={row.method} options={methods} onChange={(event) => {
                        const method = event.target.value as Method;
                        updatePayment(row.id, { method, account: accounts[method][0] });
                      }} />
                    </label>
                    <label className="text-[11px] text-ink-500">Paid amount
                      <Input className="mt-1 text-right" inputMode="decimal" placeholder="0" value={row.amount}
                        onChange={(event) => updatePayment(row.id, { amount: event.target.value.replace(/[^0-9.]/g, '') })} />
                    </label>
                  </div>
                  <label className="block text-[11px] text-ink-500">Account
                    <FormSelect className="mt-1" value={row.account} options={accounts[row.method]} onChange={(event) => updatePayment(row.id, { account: event.target.value })} />
                  </label>
                </div>
              ))}
            </div>
            <div className="border-t border-border p-3"><Button variant="outline" size="sm" className="w-full" onClick={() => setPayments((current) => [...current, paymentRow()])}><Plus className="size-4" /> Add payment source</Button></div>
            <div className="space-y-2 border-t border-border bg-ink-50/50 p-4 text-[13px]">
              <div className="flex justify-between text-ink-500"><span>Purchase total</span><span className="font-semibold text-ink">{taka(total)}</span></div>
              <div className="flex justify-between text-ink-500"><span>Paid</span><span className="font-medium text-ink">{taka(paid)}</span></div>
              <div className="flex justify-between border-t border-border pt-2"><span className={excess ? 'text-danger' : 'font-medium text-ink'}>{excess ? 'Overpayment' : 'Supplier due · বাকি'}</span>
                <span className={'font-semibold ' + (excess ? 'text-danger' : due ? 'text-warning' : 'text-success')}>{taka(excess || due)}</span></div>
            </div>
          </section>
          {error && <div role="alert" className="rounded-md border border-danger/20 bg-danger-bg p-3 text-[12px] text-danger">{error}</div>}
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={() => navigate('/app/purchases')}>Cancel</Button>
            <Button className="flex-[1.5]" onClick={save} disabled={lines.length === 0}><Plus className="size-4" /> Complete purchase</Button>
          </div>
          <p className="text-center text-[11px] text-ink-400">UI preview: entries and quick-add records remain in memory until refresh; backend posting is not connected.</p>
        </aside>
      </div>

      <AddProductDialog open={productDialogOpen} onOpenChange={setProductDialogOpen} onSave={addCreatedProduct}
        existingSerials={[...stockLots.flatMap((lot) => lot.serials ?? []), ...salesInvoices.flatMap((invoice) => invoice.lines.flatMap((line) => line.serials ?? []))]} />
    </div>
  );
}
