import { useEffect, useMemo, useState } from 'react';
import { Plus, ScanLine, Tag } from 'lucide-react';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import { StatusBadge, type StatusTone } from '../StatusBadge';
import { Switch } from '../Switch';
import type {
  OfferDiscountType,
  Product,
  ProductOffer,
  ProductOfferStatus,
  StockLot,
  StockMovement
} from '../../types/erp';
import { taka } from '../../utils/currency';
import { formatStock } from '../../utils/units';
import { toBaseQuantity } from '../../utils/productEntry';
import {
  duplicateSerials,
  lotExpiryState,
  normalizeSerials,
  offerStatus,
  productStockBreakdown,
  requiredSerialCount,
  validateOffer
} from '../../utils/productFeatures';

type StockAdjustmentMode = 'Add stock' | 'Remove stock' | 'Set exact stock';

export type StockAdjustmentResult = {
  newStock: number;
  delta: number;
  reason: string;
  note: string;
};

type DetailsTab = 'overview' | 'inventory' | 'lots' | 'offers' | 'history';

const offerTone: Record<ProductOfferStatus, StatusTone> = {
  Scheduled: 'info',
  Active: 'success',
  Expired: 'neutral',
  Disabled: 'warning'
};

function priceForOfferUnit(product: Product, unit: string) {
  if (product.altUnit && unit === product.altUnit.unit) {
    return product.altUnit.price ?? product.sellPrice * product.altUnit.factor;
  }
  return product.sellPrice;
}

function offerEffectiveInUnit(product: Product, offer: ProductOffer) {
  const normal = priceForOfferUnit(product, offer.priceUnit);
  return offer.discountType === 'Percentage'
    ? Math.max(0, normal * (1 - offer.value / 100))
    : Math.max(0, normal - offer.value);
}

export function ProductDetailsDialog({
  product,
  lots,
  offers,
  movements,
  open,
  onOpenChange,
  onAdjust,
  onAddLot,
  onManageOffers
}: {
  product: Product | null;
  lots: StockLot[];
  offers: ProductOffer[];
  movements: StockMovement[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdjust: (product: Product) => void;
  onAddLot: (product: Product) => void;
  onManageOffers: (product: Product) => void;
}) {
  const [tab, setTab] = useState<DetailsTab>('overview');

  useEffect(() => {
    if (open) setTab('overview');
  }, [open, product?.id]);

  if (!product) return null;
  const isStock = product.kind !== 'Service';
  const productLots = lots.filter((lot) => lot.productId === product.id);
  const productOffers = offers.filter((offer) => offer.productId === product.id);
  const productMovements = movements.filter((movement) => movement.productId === product.id);
  const stock = productStockBreakdown(product, lots);
  const stockValue = product.stock * product.purchasePrice;
  const tabs: Array<[DetailsTab, string, string]> = isStock
    ? [
        ['overview', 'Overview', 'সারাংশ'],
        ['inventory', 'Inventory', 'ইনভেন্টরি'],
        ['lots', 'Lots & Serials', 'লট ও সিরিয়াল'],
        ['offers', 'Offers', 'অফার'],
        ['history', 'History', 'হিস্ট্রি']
      ]
    : [
        ['overview', 'Overview', 'সারাংশ'],
        ['offers', 'Offers', 'অফার'],
        ['history', 'History', 'হিস্ট্রি']
      ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {product.name}
            <StatusBadge tone={product.active ? 'success' : 'neutral'}>{product.active ? 'Active' : 'Inactive'}</StatusBadge>
            {product.kind === 'Service' && <StatusBadge tone="info">Service</StatusBadge>}
          </DialogTitle>
          <DialogDescription>
            {product.nameBn && <span className="font-bn">{product.nameBn} · </span>}
            {product.sku} · {product.category}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 overflow-x-auto border-b border-border" role="tablist">
          {tabs.map(([id, label, bn]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`shrink-0 px-2.5 py-2 text-[12.5px] font-medium ${tab === id ? 'erp-tab-active text-ink' : 'text-ink-500 hover:text-ink'}`}>
              {label} <span className="font-bn text-[10px] font-normal text-ink-400">· {bn}</span>
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {isStock && <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-ink-500">On hand</p>
                <p className="mt-1 text-base font-semibold text-ink">{formatStock(product)}</p>
                <p className="text-[11px] text-ink-400">Recorded stock</p>
              </div>}
              {isStock && <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-ink-500">Stock value</p>
                <p className="mt-1 text-base font-semibold text-ink">{taka(stockValue, stockValue % 1 ? 2 : 0)}</p>
                <p className="text-[11px] text-ink-400">At purchase price</p>
              </div>}
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-ink-500">Normal selling price</p>
                <p className="mt-1 text-base font-semibold text-ink">{taka(product.sellPrice)}/{product.unit}</p>
                <p className="text-[11px] text-ink-400">Offers never overwrite this price</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-ink-500">Product type</p>
                <p className="mt-1 text-base font-semibold text-ink">{product.kind ?? 'Stock'}</p>
                <p className="text-[11px] text-ink-400">{product.category}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border p-3">
                <p className="text-[13px] font-semibold text-ink">Warranty <span className="font-bn text-[11px] font-normal text-ink-400">· ওয়ারেন্টি</span></p>
                {product.warranty?.enabled ? (
                  <div className="mt-2 space-y-1 text-[12.5px]">
                    <p><span className="text-ink-400">Coverage:</span> <span className="font-medium text-ink">{product.warranty.duration} {product.warranty.durationUnit}</span></p>
                    <p><span className="text-ink-400">Type:</span> <span className="font-medium text-ink">{product.warranty.type}</span></p>
                    <p className="rounded-lg bg-ink-50 p-2 text-ink-600">{product.warranty.terms || 'No additional terms.'}</p>
                    <p className="text-[11px] text-ink-400">Warranty is snapshotted when sold. Claims are processed in the Warranty module.</p>
                  </div>
                ) : <p className="mt-2 text-sm text-ink-500">Warranty is off.</p>}
              </div>

              <div className="rounded-xl border border-border p-3">
                <p className="text-[13px] font-semibold text-ink">{isStock ? 'Tracking' : 'Service settings'} <span className="font-bn text-[11px] font-normal text-ink-400">· ট্র্যাকিং</span></p>
                {isStock ? (
                  <div className="mt-2 space-y-2 text-[12.5px]">
                    <div className="flex justify-between gap-3"><span className="text-ink-500">Serial tracking</span><span className="font-medium">{product.serialTracking ?? 'Off'}</span></div>
                    <div className="flex justify-between gap-3"><span className="text-ink-500">Expiry tracking</span><span className="font-medium">{product.expiry?.enabled ? 'On' : 'Off'}</span></div>
                    {product.expiry?.enabled && <>
                      <div className="flex justify-between gap-3"><span className="text-ink-500">Expiry required</span><span className="font-medium">{product.expiry.dateRequired ? 'Yes' : 'No'}</span></div>
                      <div className="flex justify-between gap-3"><span className="text-ink-500">Warning</span><span className="font-medium">{product.expiry.warningDays} days</span></div>
                      <div className="flex justify-between gap-3"><span className="text-ink-500">Allocation</span><span className="font-medium">{product.expiry.allocationMethod}</span></div>
                    </>}
                  </div>
                ) : <p className="mt-2 text-sm text-ink-500">No inventory or serial tracking for service products.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === 'inventory' && isStock && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ['On Hand', stock.onHand, 'All inventory including expired'],
                ['Sellable', stock.sellable, 'Available for normal POS sales'],
                ['Expiring Soon', stock.expiringSoon, `Within ${product.expiry?.warningDays ?? 0} days`],
                ['Expired', stock.expired, 'Visible but blocked from normal sale']
              ].map(([label, value, hint]) => (
                <div key={String(label)} className="rounded-lg border border-border p-3">
                  <p className="text-xs text-ink-500">{label}</p>
                  <p className={`mt-1 text-base font-semibold ${label === 'Expired' && Number(value) > 0 ? 'text-danger' : label === 'Expiring Soon' && Number(value) > 0 ? 'text-warning' : 'text-ink'}`}>
                    {formatStock({ ...product, stock: Number(value) })}
                  </p>
                  <p className="text-[11px] text-ink-400">{hint}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onAdjust(product)}>Adjust stock</Button>
              <Button size="sm" variant="outline" onClick={() => onAddLot(product)}><Plus className="size-4" /> Add stock lot</Button>
            </div>
          </div>
        )}

        {tab === 'lots' && isStock && (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <div>
                <p className="text-[13px] font-semibold text-ink">Lots & Serials <span className="font-bn text-[11px] font-normal text-ink-400">· লট ও সিরিয়াল</span></p>
                <p className="text-[11px] text-ink-400">{productLots.length} lots · {productLots.reduce((sum, lot) => sum + (lot.serials?.length ?? 0), 0)} serials recorded</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onAddLot(product)}><Plus className="size-3.5" /> Add lot</Button>
            </div>
            <div className="divide-y divide-border">
              {productLots.map((lot) => {
                const expiry = lotExpiryState(lot, product.expiry?.warningDays ?? 0);
                return <div key={lot.id} className="grid gap-2 px-3 py-3 text-[12.5px] sm:grid-cols-[1.2fr_.8fr_.8fr_1fr]">
                  <div>
                    <p className="font-medium text-ink">{lot.label}</p>
                    <p className="text-[11px] text-ink-400">{lot.batchNumber ? `Batch ${lot.batchNumber} · ` : ''}{lot.receivedAt}</p>
                  </div>
                  <div className="sm:text-right"><p className="font-medium text-ink">{formatStock({ ...product, stock: lot.available })}</p><p className="text-[11px] text-ink-400">available</p></div>
                  <div><StatusBadge tone={expiry === 'Expired' ? 'danger' : expiry === 'Expiring soon' ? 'warning' : expiry === 'Sellable' ? 'success' : 'neutral'}>{expiry}</StatusBadge><p className="mt-1 text-[11px] text-ink-400">{lot.expiryDate ?? 'No expiry date'}</p></div>
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{lot.serials?.length ?? 0} serials</p>
                    <p className="truncate text-[11px] text-ink-400">{lot.serials?.slice(0, 3).join(', ') || 'No serials'}</p>
                  </div>
                </div>;
              })}
              {!productLots.length && <p className="px-3 py-8 text-center text-sm text-ink-500">No stock lots yet.</p>}
            </div>
          </div>
        )}

        {tab === 'offers' && (
          <div className="rounded-xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <div>
                <p className="text-[13px] font-semibold text-ink">Offers <span className="font-bn text-[11px] font-normal text-ink-400">· অফার</span></p>
                <p className="text-[11px] text-ink-400">Normal price remains {taka(product.sellPrice)}/{product.unit}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onManageOffers(product)}><Tag className="size-3.5" /> Manage offers</Button>
            </div>
            <div className="divide-y divide-border">
              {productOffers.map((offer) => {
                const status = offerStatus(offer);
                const normal = priceForOfferUnit(product, offer.priceUnit);
                const effective = offerEffectiveInUnit(product, offer);
                return <div key={offer.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-[12.5px]">
                  <div>
                    <div className="flex items-center gap-2"><p className="font-medium text-ink">{offer.discountType === 'Percentage' ? `${offer.value}% off` : `${taka(offer.value)} off / ${offer.priceUnit}`}</p><StatusBadge tone={offerTone[status]}>{status}</StatusBadge></div>
                    <p className="mt-0.5 text-[11px] text-ink-400">{offer.startAt.replace('T', ' ')} → {offer.endAt.replace('T', ' ')}</p>
                  </div>
                  <div className="text-right"><p className="text-ink-400 line-through">{taka(normal)}/{offer.priceUnit}</p><p className="font-semibold text-teal-700">{taka(effective)}/{offer.priceUnit}</p></div>
                </div>;
              })}
              {!productOffers.length && <div className="px-3 py-8 text-center"><p className="text-sm text-ink-500">No offers for this product.</p><Button size="sm" variant="outline" className="mt-2" onClick={() => onManageOffers(product)}>Create offer</Button></div>}
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="border-b border-border px-3 py-2.5"><p className="text-[13px] font-semibold text-ink">History <span className="font-bn text-[11px] font-normal text-ink-400">· হিস্ট্রি</span></p></div>
            <div className="divide-y divide-border">
              {productMovements.map((movement) => <div key={movement.id} className="grid grid-cols-[90px_1fr_auto] gap-3 px-3 py-2.5 text-[12.5px]">
                <span className="text-ink-400">{movement.date}</span>
                <span><span className="font-medium text-ink">{movement.type}</span><span className="block text-[11px] text-ink-400">{movement.reference ?? movement.note ?? '—'}</span></span>
                <span className={`text-right font-medium ${movement.quantity < 0 ? 'text-danger' : 'text-success'}`}>{movement.quantity > 0 ? '+' : ''}{movement.quantity} {product.unit}</span>
              </div>)}
              {!productMovements.length && <p className="px-3 py-8 text-center text-sm text-ink-500">{isStock ? 'No inventory history yet.' : 'No service activity history yet.'}</p>}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StockAdjustmentDialog({
  product,
  open,
  onOpenChange,
  onSave
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (result: StockAdjustmentResult) => void;
}) {
  const [mode, setMode] = useState<StockAdjustmentMode>('Add stock');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [reason, setReason] = useState('Count correction');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setMode('Add stock');
    setQuantity('');
    setUnit(product?.unit ?? '');
    setReason('Count correction');
    setNote('');
    setError('');
  }, [open, product?.id]);

  const units = product?.altUnit ? [product.altUnit.unit, product.unit] : product ? [product.unit] : [];
  const selectedUnit = units.includes(unit) ? unit : product?.unit ?? '';
  const baseQty = useMemo(() => {
    if (!product) return 0;
    return toBaseQuantity(quantity, selectedUnit, product.unit, product.altUnit?.unit, product.altUnit?.factor ?? 1);
  }, [product, quantity, selectedUnit]);

  if (!product || product.kind === 'Service') return null;

  const previewStock = mode === 'Add stock' ? product.stock + baseQty : mode === 'Remove stock' ? product.stock - baseQty : baseQty;

  const save = () => {
    if (!quantity.trim()) return setError('Enter a quantity.');
    const delta = previewStock - product.stock;
    if (delta > 0 && product.serialTracking === 'Required') {
      return setError('Add positive stock through Add stock lot so required serial numbers can be recorded.');
    }
    if (delta > 0 && product.expiry?.enabled && product.expiry.dateRequired) {
      return setError('Add positive stock through Add stock lot so batch and expiry dates can be recorded.');
    }
    onSave({ newStock: previewStock, delta, reason, note: note.trim() });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust stock <span className="font-bn text-sm font-normal text-ink-500">· স্টক সমন্বয়</span></DialogTitle>
          <DialogDescription>{product.name} · Current {formatStock(product)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-ink-50 p-1">
            {(['Add stock', 'Remove stock', 'Set exact stock'] as StockAdjustmentMode[]).map((item) => <button key={item} type="button" onClick={() => { setMode(item); setError(''); }} className={`rounded-md px-2 py-2 text-xs font-medium ${mode === item ? 'bg-card text-ink shadow-card' : 'text-ink-500 hover:text-ink'}`}>{item}</button>)}
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">Quantity <span className="font-bn text-[11px] font-normal text-ink-400">· পরিমাণ</span></label>
            <div className="flex gap-2">
              <Input value={quantity} onChange={(e) => { const cleaned = mode === 'Set exact stock' ? e.target.value.replace(/[^\d.-]/g, '') : e.target.value.replace(/[^\d.]/g, ''); setQuantity(cleaned); setError(''); }} inputMode="decimal" placeholder="0" className="text-right" autoFocus />
              <FormSelect value={selectedUnit} onChange={(e) => setUnit(e.target.value)} options={units} className="w-32 shrink-0" />
            </div>
          </div>
          <div><label className="mb-1.5 block text-[13px] font-medium text-ink">Reason</label><FormSelect value={reason} onChange={(e) => setReason(e.target.value)} options={['Count correction', 'Damage / loss', 'Found stock', 'Personal use', 'Data correction', 'Other']} /></div>
          <div><label className="mb-1.5 block text-[13px] font-medium text-ink">Note <span className="text-xs font-normal text-ink-400">optional</span></label><Input value={note} onChange={(e) => setNote(e.target.value)} /></div>
          <div className="flex items-center justify-between rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2.5 text-sm"><span className="text-ink-600">Stock after adjustment</span><span className="font-semibold text-ink">{formatStock({ ...product, stock: previewStock })}</span></div>
          {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={save}>Save adjustment</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StockLotDialog({
  product,
  existingLots,
  soldSerials,
  open,
  onOpenChange,
  onSave
}: {
  product: Product | null;
  existingLots: StockLot[];
  soldSerials: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (lot: StockLot) => void;
}) {
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [reference, setReference] = useState('');
  const [batch, setBatch] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [serialText, setSerialText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setQuantity('');
    setUnit(product?.unit ?? '');
    setUnitCost(product ? String(product.purchasePrice) : '');
    setReference('');
    setBatch('');
    setManufactureDate('');
    setExpiryDate('');
    setSerialText('');
    setError('');
  }, [open, product?.id]);

  if (!product || product.kind === 'Service') return null;
  const units = product.altUnit ? [product.altUnit.unit, product.unit] : [product.unit];
  const selectedUnit = units.includes(unit) ? unit : product.unit;
  const baseQty = toBaseQuantity(quantity, selectedUnit, product.unit, product.altUnit?.unit, product.altUnit?.factor ?? 1);
  const serials = normalizeSerials(serialText);
  const existingSerials = [...existingLots.flatMap((lot) => lot.serials ?? []), ...soldSerials];
  const duplicates = duplicateSerials(serials, existingSerials);
  const required = requiredSerialCount(product, baseQty);

  const save = () => {
    if (!(baseQty > 0)) return setError('Enter a quantity.');
    if (product.serialTracking === 'Required' && !Number.isInteger(baseQty)) return setError('Required serial tracking needs a whole base-unit quantity.');
    if (duplicates.length) return setError(`Duplicate serial: ${duplicates[0]}`);
    if (product.serialTracking === 'Required' && serials.length !== required) return setError(`${required} unique serials are required for this lot.`);
    if (product.expiry?.enabled && product.expiry.dateRequired && !expiryDate) return setError('Expiry date is required for this product.');
    if (manufactureDate && expiryDate && expiryDate <= manufactureDate) return setError('Expiry date must be after manufacture date.');

    onSave({
      id: `lot-${product.id}-${Date.now()}`,
      productId: product.id,
      label: reference.trim() ? `Purchase #${reference.trim()}` : 'Purchase intake',
      receivedAt: new Date().toISOString().slice(0, 10),
      quantity: baseQty,
      available: baseQty,
      unitCost: parseFloat(unitCost) || product.purchasePrice,
      source: 'Purchase',
      reference: reference.trim() || undefined,
      batchNumber: batch.trim() || undefined,
      manufactureDate: manufactureDate || undefined,
      expiryDate: expiryDate || undefined,
      serials: serials.length ? serials : undefined
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl scrollbar-thin">
        <DialogHeader><DialogTitle>Add stock lot <span className="font-bn text-sm font-normal text-ink-500">· নতুন স্টক লট</span></DialogTitle><DialogDescription>{product.name} · purchase/opening intake details</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[13px] font-medium text-ink">Quantity <span className="font-bn text-[11px] text-ink-400">· পরিমাণ</span><div className="mt-1.5 flex gap-2"><Input value={quantity} onChange={(e) => setQuantity(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" className="text-right" /><FormSelect value={selectedUnit} onChange={(e) => setUnit(e.target.value)} options={units} className="w-28 shrink-0" /></div></label>
            <label className="text-[13px] font-medium text-ink">Unit cost <span className="font-bn text-[11px] text-ink-400">· ক্রয় মূল্য</span><Input className="mt-1.5 text-right" value={unitCost} onChange={(e) => setUnitCost(e.target.value.replace(/[^\d.]/g, ''))} /></label>
            <label className="text-[13px] font-medium text-ink">Purchase ref. <span className="font-bn text-[11px] text-ink-400">· রেফারেন্স</span><Input className="mt-1.5" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="PUR-1049" /></label>
            {product.expiry?.enabled && <label className="text-[13px] font-medium text-ink">Batch number <span className="font-bn text-[11px] text-ink-400">· ব্যাচ</span><Input className="mt-1.5" value={batch} onChange={(e) => setBatch(e.target.value)} /></label>}
            {product.expiry?.enabled && <label className="text-[13px] font-medium text-ink">Manufacture date <span className="font-bn text-[11px] text-ink-400">· উৎপাদন</span><Input className="mt-1.5" type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} /></label>}
            {product.expiry?.enabled && <label className="text-[13px] font-medium text-ink">Expiry date <span className="font-bn text-[11px] text-ink-400">· মেয়াদ</span><Input className="mt-1.5" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} /></label>}
          </div>

          {(product.serialTracking ?? 'Off') !== 'Off' && <div className="rounded-xl border border-border p-3">
            <div className="flex items-center gap-2"><ScanLine className="size-4 text-teal-700" /><p className="text-[13px] font-medium text-ink">Serials <span className="font-bn text-[11px] text-ink-400">· সিরিয়াল নম্বর</span></p></div>
            <p className="mt-1 text-xs text-ink-500">Type, scan or paste serials separated by line, comma or semicolon.</p>
            <textarea value={serialText} onChange={(e) => setSerialText(e.target.value)} className="mt-2 min-h-28 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" placeholder={"SN-001\nSN-002"} />
            <p className={`mt-1.5 text-xs ${duplicates.length || (product.serialTracking === 'Required' && serials.length !== required) ? 'text-warning' : 'text-ink-500'}`}>
              {serials.length} entered{product.serialTracking === 'Required' ? ` · ${required} required` : ' · optional'}{duplicates.length ? ` · duplicate: ${duplicates[0]}` : ''}
            </p>
          </div>}

          {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={save}>Add lot</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ManageOffersDialog({
  product,
  offers,
  open,
  onOpenChange,
  onSaveOffers
}: {
  product: Product | null;
  offers: ProductOffer[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveOffers: (offers: ProductOffer[]) => void;
}) {
  const [drafts, setDrafts] = useState<ProductOffer[]>([]);
  const [editing, setEditing] = useState<ProductOffer | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !product) return;
    setDrafts(offers.filter((offer) => offer.productId === product.id));
    setEditing(null);
    setError('');
  }, [open, product?.id, offers]);

  if (!product) return null;
  const priceUnits = product.altUnit ? [product.unit, product.altUnit.unit] : [product.unit];

  const startNew = () => {
    const start = '2026-10-07T09:00';
    const end = '2026-10-14T23:59';
    setEditing({
      id: `offer-${product.id}-${Date.now()}`,
      productId: product.id,
      discountType: 'Percentage',
      value: 10,
      priceUnit: product.unit,
      startAt: start,
      endAt: end,
      enabled: true
    });
    setError('');
  };

  const saveDraft = () => {
    if (!editing) return;
    const problem = validateOffer(product, editing, drafts);
    if (problem) return setError(problem);
    setDrafts((items) => {
      const exists = items.some((offer) => offer.id === editing.id);
      return exists ? items.map((offer) => offer.id === editing.id ? editing : offer) : [editing, ...items];
    });
    setEditing(null);
    setError('');
  };

  const persist = () => {
    onSaveOffers(drafts);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl scrollbar-thin">
        <DialogHeader><DialogTitle>Manage Offers <span className="font-bn text-sm font-normal text-ink-500">· অফার ব্যবস্থাপনা</span></DialogTitle><DialogDescription>{product.name} · normal price {taka(product.sellPrice)}/{product.unit}</DialogDescription></DialogHeader>

        <div className="space-y-3">
          {drafts.map((offer) => {
            const status = offerStatus(offer);
            return <button key={offer.id} type="button" onClick={() => { setEditing(offer); setError(''); }} className="flex w-full items-center justify-between gap-3 rounded-xl border border-border p-3 text-left hover:bg-ink-50">
              <div><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium text-ink">{offer.discountType === 'Percentage' ? `${offer.value}% discount` : `${taka(offer.value)} / ${offer.priceUnit} discount`}</span><StatusBadge tone={offerTone[status]}>{status}</StatusBadge></div><p className="mt-1 text-[11px] text-ink-400">{offer.startAt.replace('T', ' ')} → {offer.endAt.replace('T', ' ')}</p></div>
              <div className="text-right"><p className="text-[11px] text-ink-400 line-through">{taka(priceForOfferUnit(product, offer.priceUnit))}/{offer.priceUnit}</p><p className="text-sm font-semibold text-teal-700">{taka(offerEffectiveInUnit(product, offer))}/{offer.priceUnit}</p></div>
            </button>;
          })}
          {!drafts.length && <div className="rounded-xl border border-dashed border-ink-200 px-4 py-8 text-center"><p className="text-sm font-medium text-ink">No offers yet</p><p className="mt-1 text-xs text-ink-500">Create a scheduled or active discount without changing the normal selling price.</p></div>}

          {editing && <div className="space-y-3 rounded-xl border border-teal-200 bg-teal-50/30 p-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[13px] font-medium text-ink">Discount type<FormSelect className="mt-1.5" value={editing.discountType} onChange={(e) => setEditing({ ...editing, discountType: e.target.value as OfferDiscountType })} options={['Percentage', 'Fixed']} /></label>
              <label className="text-[13px] font-medium text-ink">Discount value<div className="mt-1.5 flex gap-2"><Input value={String(editing.value)} onChange={(e) => setEditing({ ...editing, value: parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0 })} inputMode="decimal" className="text-right" />{editing.discountType === 'Fixed' && <FormSelect value={editing.priceUnit} onChange={(e) => setEditing({ ...editing, priceUnit: e.target.value })} options={priceUnits} className="w-28 shrink-0" />}</div>{editing.discountType === 'Fixed' && <p className="mt-1 text-[11px] text-ink-400">Fixed discount is per {editing.priceUnit}.</p>}</label>
              <label className="text-[13px] font-medium text-ink">Start date & time<Input className="mt-1.5" type="datetime-local" value={editing.startAt} onChange={(e) => setEditing({ ...editing, startAt: e.target.value })} /></label>
              <label className="text-[13px] font-medium text-ink">End date & time<Input className="mt-1.5" type="datetime-local" value={editing.endAt} onChange={(e) => setEditing({ ...editing, endAt: e.target.value })} /></label>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-card px-3 py-2"><span className="text-[13px] text-ink">Enabled</span><Switch checked={editing.enabled} onCheckedChange={(enabled) => setEditing({ ...editing, enabled })} /></div>
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-card p-3 text-center text-xs"><div><p className="text-ink-400">Normal</p><p className="mt-1 font-semibold">{taka(priceForOfferUnit(product, editing.priceUnit))}/{editing.priceUnit}</p></div><div><p className="text-ink-400">Effective</p><p className="mt-1 font-semibold text-teal-700">{taka(offerEffectiveInUnit(product, editing))}/{editing.priceUnit}</p></div></div>
            {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>}
            <div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button size="sm" onClick={saveDraft}>Save offer</Button></div>
          </div>}
        </div>

        <DialogFooter className="flex-wrap">
          <Button variant="outline" onClick={startNew}><Plus className="size-4" /> New offer</Button>
          <Button onClick={persist}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

