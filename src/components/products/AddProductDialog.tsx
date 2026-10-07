import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { Switch } from '../Switch';
import { FormSelect } from '../FormSelect';
import { PhotoUploader } from './PhotoUploader';
import { productCategories } from '../../data/products';
import type {
  Product,
  ProductKind,
  SerialTrackingMode,
  StockAllocationMethod,
  WarrantyDurationUnit,
  WarrantyType
} from '../../types/erp';
import { taka } from '../../utils/currency';
import { toBasePrice, toBaseQuantity } from '../../utils/productEntry';
import { duplicateSerials, normalizeSerials, requiredSerialCount } from '../../utils/productFeatures';

export type ProductOpeningMeta = {
  serials: string[];
  batchNumber?: string;
  manufactureDate?: string;
  expiryDate?: string;
};

type AddProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Product, opening?: ProductOpeningMeta) => void;
  initialProduct?: Product | null;
  existingSerials?: string[];
};

const baseUnits = ['Pcs', 'Gira', 'Kg', 'Feet', 'Bag', 'Coil', 'Pair', 'Litre'];
const serialModes: SerialTrackingMode[] = ['Off', 'Optional', 'Required'];
const warrantyUnits: WarrantyDurationUnit[] = ['Days', 'Months', 'Years'];
const warrantyTypes: WarrantyType[] = ['Seller', 'Manufacturer', 'Service', 'Replacement'];
const allocationMethods: StockAllocationMethod[] = ['FIFO', 'FEFO'];

function Field({ label, bn, children, hint }: {label: string;bn?: string;children: React.ReactNode;hint?: string;}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1.5 text-[13px] font-medium text-ink">
        {label}
        {bn && <span className="font-bn text-[11px] font-normal text-ink-400">· {bn}</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}

function MoneyInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
      <Input {...props} inputMode="decimal" className="pl-7 text-right" />
    </div>
  );
}

function SettingHeader({ title, bn, hint, checked, onCheckedChange }: {
  title: string;
  bn: string;
  hint: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[13px] font-medium text-ink">{title} <span className="font-bn text-[11px] font-normal text-ink-400">· {bn}</span></p>
        <p className="text-xs text-ink-500">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  );
}

export function AddProductDialog({ open, onOpenChange, onSave, initialProduct = null, existingSerials = [] }: AddProductDialogProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [kind, setKind] = useState<ProductKind>('Stock');
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [unit, setUnit] = useState('Gira');
  const [sell, setSell] = useState('');
  const [sellUnit, setSellUnit] = useState('Gira');
  const [buy, setBuy] = useState('');
  const [buyUnit, setBuyUnit] = useState('Gira');
  const [advanced, setAdvanced] = useState(true);
  const [multiUnit, setMultiUnit] = useState(true);
  const [altUnit, setAltUnit] = useState('Gauge');
  const [factor, setFactor] = useState('16');
  const [altPrice, setAltPrice] = useState('');
  const [openingQty, setOpeningQty] = useState('');
  const [openingUnit, setOpeningUnit] = useState('Gauge');
  const [minQty, setMinQty] = useState('');
  const [minUnit, setMinUnit] = useState('Gauge');
  const [barcode, setBarcode] = useState('');

  const [warrantyEnabled, setWarrantyEnabled] = useState(false);
  const [warrantyDuration, setWarrantyDuration] = useState('12');
  const [warrantyDurationUnit, setWarrantyDurationUnit] = useState<WarrantyDurationUnit>('Months');
  const [warrantyType, setWarrantyType] = useState<WarrantyType>('Seller');
  const [warrantyTerms, setWarrantyTerms] = useState('');

  const [serialTracking, setSerialTracking] = useState<SerialTrackingMode>('Off');
  const [openingSerialText, setOpeningSerialText] = useState('');

  const [expiryEnabled, setExpiryEnabled] = useState(false);
  const [expiryDateRequired, setExpiryDateRequired] = useState(false);
  const [expiryWarningDays, setExpiryWarningDays] = useState('30');
  const [allocationMethod, setAllocationMethod] = useState<StockAllocationMethod>('FIFO');
  const [batchNumber, setBatchNumber] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [error, setError] = useState('');

  const isStock = kind === 'Stock';
  const units = isStock && multiUnit && altUnit ? [altUnit, unit] : [unit];
  const f = parseFloat(factor) || 1;
  const selectedSellUnit = units.includes(sellUnit) ? sellUnit : unit;
  const selectedBuyUnit = units.includes(buyUnit) ? buyUnit : unit;
  const normalizedAltUnit = isStock && multiUnit && altUnit ? altUnit : undefined;
  const stockToBase = (qty: string, selectedUnit: string) => toBaseQuantity(qty, selectedUnit, unit, normalizedAltUnit, f);
  const priceToBase = (amount: string, selectedUnit: string) => toBasePrice(amount, selectedUnit, unit, normalizedAltUnit, f);
  const sellNum = parseFloat(sell) || 0;
  const buyNum = parseFloat(buy) || 0;
  const sellBase = priceToBase(sell, selectedSellUnit);
  const buyBase = isStock ? priceToBase(buy, selectedBuyUnit) : buyNum;
  const margin = sellBase > 0 && buyBase > 0 ? (sellBase - buyBase) / sellBase * 100 : null;
  const autoAltSell = sellBase > 0 && multiUnit ? sellBase * f : 0;
  const openingBaseQty = isStock ? stockToBase(openingQty, openingUnit) : 0;
  const openingSerials = normalizeSerials(openingSerialText);
  const openingSerialDuplicates = duplicateSerials(openingSerials, existingSerials);
  const requiredOpeningSerials = !initialProduct ? requiredSerialCount({
    id: 'draft', name: name, sku: barcode, category, unit, stock: openingBaseQty, minStock: 0,
    sellPrice: sellBase, purchasePrice: buyBase, active: true, serialTracking, kind
  }, openingBaseQty) : 0;

  const resetForm = () => {
    setPhotos([]);
    setKind('Stock');
    setName('');
    setNameBn('');
    setCategory('Hardware');
    setUnit('Gira');
    setSell('');
    setSellUnit('Gira');
    setBuy('');
    setBuyUnit('Gira');
    setAdvanced(true);
    setMultiUnit(true);
    setAltUnit('Gauge');
    setFactor('16');
    setAltPrice('');
    setOpeningQty('');
    setOpeningUnit('Gauge');
    setMinQty('');
    setMinUnit('Gauge');
    setBarcode('');
    setWarrantyEnabled(false);
    setWarrantyDuration('12');
    setWarrantyDurationUnit('Months');
    setWarrantyType('Seller');
    setWarrantyTerms('');
    setSerialTracking('Off');
    setOpeningSerialText('');
    setExpiryEnabled(false);
    setExpiryDateRequired(false);
    setExpiryWarningDays('30');
    setAllocationMethod('FIFO');
    setBatchNumber('');
    setManufactureDate('');
    setExpiryDate('');
    setError('');
  };

  useEffect(() => {
    if (!open) return;
    if (!initialProduct) {
      resetForm();
      return;
    }

    const productKind = initialProduct.kind ?? 'Stock';
    setPhotos(initialProduct.image ? [initialProduct.image] : []);
    setKind(productKind);
    setName(initialProduct.name);
    setNameBn(initialProduct.nameBn ?? '');
    setCategory(initialProduct.category);
    setUnit(initialProduct.unit);
    setSell(String(initialProduct.sellPrice));
    setSellUnit(initialProduct.unit);
    setBuy(String(initialProduct.purchasePrice));
    setBuyUnit(initialProduct.unit);
    setMultiUnit(productKind === 'Stock' && Boolean(initialProduct.altUnit));
    setAltUnit(initialProduct.altUnit?.unit ?? '');
    setFactor(String(initialProduct.altUnit?.factor ?? 1));
    setAltPrice(initialProduct.altUnit?.price ? String(initialProduct.altUnit.price) : '');
    setOpeningQty('');
    setOpeningUnit(initialProduct.unit);
    setMinQty(String(initialProduct.minStock));
    setMinUnit(initialProduct.unit);
    setBarcode(initialProduct.sku);
    setWarrantyEnabled(Boolean(initialProduct.warranty?.enabled));
    setWarrantyDuration(String(initialProduct.warranty?.duration ?? 12));
    setWarrantyDurationUnit(initialProduct.warranty?.durationUnit ?? 'Months');
    setWarrantyType(initialProduct.warranty?.type ?? 'Seller');
    setWarrantyTerms(initialProduct.warranty?.terms ?? '');
    setSerialTracking(productKind === 'Stock' ? initialProduct.serialTracking ?? 'Off' : 'Off');
    setOpeningSerialText('');
    setExpiryEnabled(productKind === 'Stock' && Boolean(initialProduct.expiry?.enabled));
    setExpiryDateRequired(initialProduct.expiry?.dateRequired ?? false);
    setExpiryWarningDays(String(initialProduct.expiry?.warningDays ?? 30));
    setAllocationMethod(initialProduct.expiry?.allocationMethod ?? 'FIFO');
    setBatchNumber('');
    setManufactureDate('');
    setExpiryDate('');
    setAdvanced(true);
    setError('');
  }, [open, initialProduct]);

  const changeKind = (next: ProductKind) => {
    setKind(next);
    if (next === 'Service') {
      setCategory('Service');
      setUnit('Service');
      setSellUnit('Service');
      setBuyUnit('Service');
      setMultiUnit(false);
      setSerialTracking('Off');
      setExpiryEnabled(false);
    } else if (unit === 'Service') {
      if (category === 'Service') setCategory('Hardware');
      setUnit('Pcs');
      setSellUnit('Pcs');
      setBuyUnit('Pcs');
    }
  };

  const save = () => {
    if (!name.trim()) return setError('Product name is required.');
    if (!sellNum) return setError('Enter a selling price.');

    if (warrantyEnabled && (!(parseFloat(warrantyDuration) > 0) || !warrantyType)) {
      return setError('Enter a valid warranty duration and type.');
    }

    if (!initialProduct && isStock && serialTracking !== 'Off') {
      if (serialTracking === 'Required' && !Number.isInteger(openingBaseQty)) return setError('Required serial tracking needs a whole base-unit quantity.');
      if (openingSerialDuplicates.length) return setError(`Duplicate serial: ${openingSerialDuplicates[0]}`);
      if (serialTracking === 'Required' && openingSerials.length !== requiredOpeningSerials) {
        return setError(`Required serial tracking needs ${requiredOpeningSerials} unique serials for ${openingBaseQty} ${unit}.`);
      }
    }

    if (!initialProduct && isStock && expiryEnabled && openingBaseQty > 0 && expiryDateRequired && !expiryDate) {
      return setError('Expiry date is required for opening stock.');
    }
    if (manufactureDate && expiryDate && expiryDate <= manufactureDate) {
      return setError('Expiry date must be after manufacture date.');
    }

    const product: Product = {
      id: initialProduct?.id ?? `p${Date.now()}`,
      kind,
      name: name.trim(),
      nameBn: nameBn.trim() || undefined,
      sku: barcode || `${category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`,
      category,
      image: photos[0],
      unit,
      altUnit: isStock && multiUnit && altUnit ? { unit: altUnit, factor: f, price: parseFloat(altPrice) || undefined } : undefined,
      stock: initialProduct ? initialProduct.stock : openingBaseQty,
      minStock: isStock ? stockToBase(minQty, minUnit) : 0,
      sellPrice: sellBase,
      purchasePrice: buyBase,
      warranty: {
        enabled: warrantyEnabled,
        duration: warrantyEnabled ? parseFloat(warrantyDuration) : undefined,
        durationUnit: warrantyEnabled ? warrantyDurationUnit : undefined,
        type: warrantyEnabled ? warrantyType : undefined,
        terms: warrantyEnabled ? warrantyTerms.trim() || undefined : undefined
      },
      serialTracking: isStock ? serialTracking : 'Off',
      expiry: isStock ? {
        enabled: expiryEnabled,
        dateRequired: expiryEnabled && expiryDateRequired,
        warningDays: expiryEnabled ? Math.max(0, parseInt(expiryWarningDays) || 0) : 0,
        allocationMethod: expiryEnabled ? allocationMethod : 'FIFO'
      } : undefined,
      active: initialProduct?.active ?? true
    };

    const opening: ProductOpeningMeta | undefined = !initialProduct && isStock && openingBaseQty > 0 ? {
      serials: openingSerials,
      batchNumber: expiryEnabled ? batchNumber.trim() || undefined : undefined,
      manufactureDate: expiryEnabled ? manufactureDate || undefined : undefined,
      expiryDate: expiryEnabled ? expiryDate || undefined : undefined
    } : undefined;

    onSave(product, opening);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl scrollbar-thin">
        <DialogHeader>
          <DialogTitle>
            {initialProduct ? 'Edit product' : 'Add product'} <span className="font-bn text-sm font-normal text-ink-500">· {initialProduct ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য'}</span>
          </DialogTitle>
          <DialogDescription>{initialProduct ? 'Update product settings. Stock corrections remain in Adjust stock.' : 'Only name and selling price are required. Optional controls stay in Advanced.'}</DialogDescription>
        </DialogHeader>

        <section className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Basic</p>
          <Field label="Photos" bn="ছবি">
            <PhotoUploader photos={photos} onChange={setPhotos} hint="Up to 4 photos. The first one appears in POS and lists." />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Product type" bn="ধরন" hint={initialProduct ? 'Product type is fixed after creation.' : 'Stock products track inventory; services do not.'}>
              <FormSelect value={kind} disabled={Boolean(initialProduct)} onChange={(e) => changeKind(e.target.value as ProductKind)} options={['Stock', 'Service']} />
            </Field>
            <Field label="Category" bn="ক্যাটাগরি">
              <FormSelect value={category} onChange={(e) => setCategory(e.target.value)} options={productCategories.filter((c) => c !== 'All')} />
            </Field>
            <Field label="Product name" bn="নাম">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={isStock ? 'e.g. LED Bulb 12W' : 'e.g. Ceiling Fan Installation'} autoFocus />
            </Field>
            <Field label="Bangla name" bn="বাংলা নাম (ঐচ্ছিক)">
              <Input value={nameBn} onChange={(e) => setNameBn(e.target.value)} placeholder={isStock ? 'এলইডি বাল্ব ১২ ওয়াট' : 'সিলিং ফ্যান ইনস্টলেশন'} className="font-bn" />
            </Field>
            {isStock && <Field label="Base unit" bn="ছোট একক" hint="Smallest unit used for stock and serial counts.">
              <FormSelect value={unit} onChange={(e) => {
                const next = e.target.value;
                if (sellUnit === unit) setSellUnit(next);
                if (buyUnit === unit) setBuyUnit(next);
                setUnit(next);
              }} options={baseUnits} />
            </Field>}
            <Field label="Selling price" bn="বিক্রয় মূল্য" hint={sellNum && selectedSellUnit !== unit ? `${taka(sellNum)} / ${selectedSellUnit} → ${taka(sellBase)} / ${unit} automatically` : 'Normal selling price is preserved; offers are managed separately.'}>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1"><MoneyInput value={sell} onChange={(e) => setSell(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" /></div>
                <FormSelect value={selectedSellUnit} onChange={(e) => setSellUnit(e.target.value)} options={units} className="w-28 shrink-0" />
              </div>
            </Field>
            <Field label={isStock ? 'Purchase price' : 'Service cost'} bn={isStock ? 'ক্রয় মূল্য' : 'সেবা খরচ'} hint="Optional internal cost.">
              <div className="flex gap-2">
                <div className="min-w-0 flex-1"><MoneyInput value={buy} onChange={(e) => setBuy(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" /></div>
                {isStock && <FormSelect value={selectedBuyUnit} onChange={(e) => setBuyUnit(e.target.value)} options={units} className="w-28 shrink-0" />}
              </div>
            </Field>
          </div>
          {margin !== null && <p className={`text-xs ${margin < 0 ? 'text-danger' : 'text-ink-500'}`}>Margin {margin.toFixed(1)}% · profit {taka(sellBase - buyBase)} per {unit}</p>}
        </section>

        <section className="rounded-xl border border-border">
          <button type="button" onClick={() => setAdvanced((value) => !value)} aria-expanded={advanced} className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span>
              <span className="block text-sm font-semibold text-ink">Advanced <span className="font-bn text-[11px] font-normal text-ink-400">· উন্নত সেটিংস</span></span>
              <span className="block text-xs text-ink-500">Units, stock, warranty, serial tracking and expiry</span>
            </span>
            <ChevronDown className={`size-4 text-ink-400 transition-transform ${advanced ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {advanced && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="space-y-5 border-t border-border p-4">
                {isStock && <>
                  <SettingHeader title="Sell in a larger unit too" bn="বড় এককে বিক্রি" hint="e.g. Box/Pcs or Gauge/Gira" checked={multiUnit} onCheckedChange={(checked) => {
                    if (!checked) {
                      if (sellUnit === altUnit) setSellUnit(unit);
                      if (buyUnit === altUnit) setBuyUnit(unit);
                    }
                    setMultiUnit(checked);
                  }} />
                  {multiUnit && <div className="rounded-lg bg-teal-50/60 p-3">
                    <div className="flex flex-wrap items-center gap-2 text-[15px] text-ink">
                      <span className="font-medium">1</span>
                      <Input value={altUnit} onChange={(e) => setAltUnit(e.target.value)} className="h-9 w-28 bg-card font-medium" aria-label="Larger unit" />
                      <span className="text-ink-500">=</span>
                      <Input value={factor} onChange={(e) => setFactor(e.target.value.replace(/[^\d.]/g, ''))} className="h-9 w-20 bg-card text-right font-medium" inputMode="decimal" aria-label="Conversion factor" />
                      <span className="font-medium">{unit}</span>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-teal-800"><Info className="size-3.5" />POS can sell in either unit; stock remains in {unit}.</p>
                    {selectedSellUnit === unit && <div className="mt-3 max-w-xs">
                      <Field label={`Custom selling price / ${altUnit || 'unit'}`} hint={autoAltSell ? `Auto ${taka(autoAltSell)} / ${altUnit}` : 'Optional override'}>
                        <MoneyInput value={altPrice} onChange={(e) => setAltPrice(e.target.value.replace(/[^\d.]/g, ''))} placeholder={autoAltSell ? String(autoAltSell) : '0'} />
                      </Field>
                    </div>}
                  </div>}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {!initialProduct && <Field label="Opening stock" bn="শুরুর স্টক">
                      <div className="flex gap-2">
                        <Input value={openingQty} onChange={(e) => setOpeningQty(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" className="text-right" inputMode="decimal" />
                        <FormSelect value={units.includes(openingUnit) ? openingUnit : unit} onChange={(e) => setOpeningUnit(e.target.value)} options={units} className="w-28 shrink-0" />
                      </div>
                    </Field>}
                    <Field label="Minimum stock" bn="সর্বনিম্ন স্টক">
                      <div className="flex gap-2">
                        <Input value={minQty} onChange={(e) => setMinQty(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" className="text-right" inputMode="decimal" />
                        <FormSelect value={units.includes(minUnit) ? minUnit : unit} onChange={(e) => setMinUnit(e.target.value)} options={units} className="w-28 shrink-0" />
                      </div>
                    </Field>
                  </div>
                </>}

                <div className="border-t border-border pt-4">
                  <SettingHeader title="Warranty" bn="ওয়ারেন্টি" hint="Independent from serial tracking; claims stay in the Warranty module." checked={warrantyEnabled} onCheckedChange={setWarrantyEnabled} />
                  {warrantyEnabled && <div className="mt-3 grid gap-3 rounded-lg bg-ink-50/60 p-3 sm:grid-cols-2">
                    <Field label="Duration" bn="সময়কাল">
                      <div className="flex gap-2">
                        <Input value={warrantyDuration} onChange={(e) => setWarrantyDuration(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" className="text-right" />
                        <FormSelect value={warrantyDurationUnit} onChange={(e) => setWarrantyDurationUnit(e.target.value as WarrantyDurationUnit)} options={warrantyUnits} className="w-32 shrink-0" />
                      </div>
                    </Field>
                    <Field label="Warranty type" bn="ধরন">
                      <FormSelect value={warrantyType} onChange={(e) => setWarrantyType(e.target.value as WarrantyType)} options={warrantyTypes} />
                    </Field>
                    <Field label="Terms" bn="শর্তাবলি" hint="This text is snapshotted onto each sold invoice item." >
                      <textarea value={warrantyTerms} onChange={(e) => setWarrantyTerms(e.target.value)} placeholder="Coverage, exclusions, required documents…" className="min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:col-span-2" />
                    </Field>
                  </div>}
                </div>

                {isStock && <div className="border-t border-border pt-4">
                  <p className="text-[13px] font-medium text-ink">Serial Tracking <span className="font-bn text-[11px] font-normal text-ink-400">· সিরিয়াল নম্বর</span></p>
                  <p className="mb-3 text-xs text-ink-500">Choose independently from warranty.</p>
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-ink-50 p-1">
                    {serialModes.map((mode) => <button key={mode} type="button" onClick={() => setSerialTracking(mode)} className={`rounded-md px-2 py-2 text-xs font-medium ${serialTracking === mode ? 'bg-card text-ink shadow-card' : 'text-ink-500'}`}>{mode}</button>)}
                  </div>
                  {!initialProduct && serialTracking !== 'Off' && openingBaseQty > 0 && <div className="mt-3 rounded-lg border border-border p-3">
                    <Field label="Opening stock serials" bn="শুরুর সিরিয়াল" hint="Type, scan or paste. Separate by new line, comma or semicolon.">
                      <textarea value={openingSerialText} onChange={(e) => setOpeningSerialText(e.target.value)} placeholder={"GV34-1001\nGV34-1002"} className="min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
                    </Field>
                    <p className={`mt-2 text-xs ${serialTracking === 'Required' && openingSerials.length !== requiredOpeningSerials ? 'text-warning' : 'text-ink-500'}`}>
                      {openingSerials.length} serials entered{serialTracking === 'Required' ? ` · ${requiredOpeningSerials} required` : ' · optional'}{openingSerialDuplicates.length ? ` · duplicate: ${openingSerialDuplicates[0]}` : ''}
                    </p>
                  </div>}
                </div>}

                {isStock && <div className="border-t border-border pt-4">
                  <SettingHeader title="Expiry tracking" bn="মেয়াদ" hint="Track batch/manufacture/expiry per stock lot and optionally allocate FEFO." checked={expiryEnabled} onCheckedChange={setExpiryEnabled} />
                  {expiryEnabled && <div className="mt-3 space-y-3 rounded-lg bg-ink-50/60 p-3">
                    <div className="flex items-center justify-between gap-3 rounded-md bg-card px-3 py-2">
                      <span className="text-[13px] text-ink">Expiry date required <span className="font-bn text-[11px] text-ink-400">· মেয়াদ তারিখ আবশ্যক</span></span>
                      <Switch checked={expiryDateRequired} onCheckedChange={setExpiryDateRequired} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Warning days" bn="আগে সতর্কতা"><Input value={expiryWarningDays} onChange={(e) => setExpiryWarningDays(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" className="text-right" /></Field>
                      <Field label="Allocation" bn="স্টক নির্বাচন"><FormSelect value={allocationMethod} onChange={(e) => setAllocationMethod(e.target.value as StockAllocationMethod)} options={allocationMethods} /></Field>
                    </div>
                    {!initialProduct && openingBaseQty > 0 && <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-3">
                      <Field label="Batch no." bn="ব্যাচ"><Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder="Optional" /></Field>
                      <Field label="Manufacture date" bn="উৎপাদন"><Input type="date" value={manufactureDate} onChange={(e) => setManufactureDate(e.target.value)} /></Field>
                      <Field label="Expiry date" bn="মেয়াদ"><Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} /></Field>
                    </div>}
                  </div>}
                </div>}

                <div className="border-t border-border pt-4">
                  <Field label="Barcode / SKU" bn="বারকোড"><Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Auto-generated if empty" /></Field>
                </div>
              </div>
            </motion.div>}
          </AnimatePresence>
        </section>

        {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>{initialProduct ? 'Save changes' : 'Save product'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

