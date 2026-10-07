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
import type { Product } from '../../types/erp';
import { taka } from '../../utils/currency';
import { toBasePrice, toBaseQuantity } from '../../utils/productEntry';

type AddProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (product: Product) => void;
  initialProduct?: Product | null;
};

const baseUnits = ['Pcs', 'Gira', 'Kg', 'Feet', 'Bag', 'Coil', 'Pair', 'Litre'];

function Field({ label, bn, children, hint }: {label: string;bn?: string;children: React.ReactNode;hint?: string;}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1.5 text-[13px] font-medium text-ink">
        {label}
        {bn && <span className="font-bn text-[11px] font-normal text-ink-400">{bn}</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>);

}

function MoneyInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
      <Input {...props} inputMode="decimal" className="pl-7 text-right" />
    </div>);

}

export function AddProductDialog({ open, onOpenChange, onSave, initialProduct = null }: AddProductDialogProps) {
  const [photos, setPhotos] = useState<string[]>([]);
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
  const [error, setError] = useState('');

  const units = multiUnit && altUnit ? [altUnit, unit] : [unit];
  const f = parseFloat(factor) || 1;
  const selectedSellUnit = units.includes(sellUnit) ? sellUnit : unit;
  const selectedBuyUnit = units.includes(buyUnit) ? buyUnit : unit;
  const normalizedAltUnit = multiUnit && altUnit ? altUnit : undefined;
  const stockToBase = (qty: string, selectedUnit: string) => toBaseQuantity(qty, selectedUnit, unit, normalizedAltUnit, f);
  const priceToBase = (amount: string, selectedUnit: string) => toBasePrice(amount, selectedUnit, unit, normalizedAltUnit, f);
  const sellNum = parseFloat(sell) || 0;
  const buyNum = parseFloat(buy) || 0;
  const sellBase = priceToBase(sell, selectedSellUnit);
  const buyBase = priceToBase(buy, selectedBuyUnit);
  const margin = sellBase > 0 && buyBase > 0 ? (sellBase - buyBase) / sellBase * 100 : null;
  const autoAltSell = sellBase > 0 && multiUnit ? sellBase * f : 0;

  const resetForm = () => {
    setPhotos([]);
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
    setError('');
  };



  useEffect(() => {
    if (!open) return;
    if (!initialProduct) {
      resetForm();
      return;
    }

    setPhotos(initialProduct.image ? [initialProduct.image] : []);
    setName(initialProduct.name);
    setNameBn(initialProduct.nameBn ?? '');
    setCategory(initialProduct.category);
    setUnit(initialProduct.unit);
    setSell(String(initialProduct.sellPrice));
    setSellUnit(initialProduct.unit);
    setBuy(String(initialProduct.purchasePrice));
    setBuyUnit(initialProduct.unit);
    setMultiUnit(Boolean(initialProduct.altUnit));
    setAltUnit(initialProduct.altUnit?.unit ?? '');
    setFactor(String(initialProduct.altUnit?.factor ?? 1));
    setAltPrice(initialProduct.altUnit?.price ? String(initialProduct.altUnit.price) : '');
    setOpeningQty('');
    setOpeningUnit(initialProduct.unit);
    setMinQty(String(initialProduct.minStock));
    setMinUnit(initialProduct.unit);
    setBarcode(initialProduct.sku);
    setAdvanced(true);
    setError('');
  }, [open, initialProduct]);

  const save = () => {
    if (!name.trim()) return setError('Product name is required.');
    if (!sellNum) return setError('Enter a selling price.');
    onSave({
      id: initialProduct?.id ?? `p${Date.now()}`,
      name: name.trim(),
      nameBn: nameBn.trim() || undefined,
      sku: barcode || `${category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`,
      category,
      image: photos[0],
      unit,
      altUnit: multiUnit && altUnit ? { unit: altUnit, factor: f, price: parseFloat(altPrice) || undefined } : undefined,
      stock: initialProduct ? initialProduct.stock : stockToBase(openingQty, openingUnit),
      minStock: stockToBase(minQty, minUnit),
      sellPrice: sellBase,
      purchasePrice: buyBase,
      active: true
    });
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl scrollbar-thin">
        <DialogHeader>
          <DialogTitle>
            {initialProduct ? 'Edit product' : 'Add product'} <span className="font-bn text-sm font-normal text-ink-500">{initialProduct ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য'}</span>
          </DialogTitle>
          <DialogDescription>{initialProduct ? 'Update product details. Use Adjust stock for stock corrections.' : 'Only name and selling price are required. Everything else can be added later.'}</DialogDescription>
        </DialogHeader>

        <section className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-400">Basic</p>
          <Field label="Photos" bn="ছবি">
            <PhotoUploader photos={photos} onChange={setPhotos} hint="Up to 4 photos. The first one appears in POS and lists." />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Product name" bn="নাম">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder='e.g. Wire Mesh Net 4 ft' autoFocus />
            </Field>
            <Field label="Bangla name" bn="বাংলা নাম (ঐচ্ছিক)">
              <Input value={nameBn} onChange={(e) => setNameBn(e.target.value)} placeholder="তারের নেট ৪ ফুট" className="font-bn" />
            </Field>
            <Field label="Category" bn="ক্যাটাগরি">
              <FormSelect value={category} onChange={(e) => setCategory(e.target.value)} options={productCategories.filter((c) => c !== 'All')} />
            </Field>
            <Field label="Base unit" bn="ছোট একক" hint="The smallest unit you sell in.">
              <FormSelect value={unit} onChange={(e) => {
                const next = e.target.value;
                if (sellUnit === unit) setSellUnit(next);
                if (buyUnit === unit) setBuyUnit(next);
                setUnit(next);
              }} options={baseUnits} />
            </Field>
            <Field label="Selling price" bn="বিক্রয় মূল্য" hint={sellNum && selectedSellUnit !== unit ? `${taka(sellNum, sellNum % 1 ? 2 : 0)} / ${selectedSellUnit} → ${taka(sellBase, sellBase % 1 ? 2 : 0)} / ${unit} automatically` : 'Enter the price in whichever configured unit you normally use. HisabIQ converts it automatically.'}>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1"><MoneyInput value={sell} onChange={(e) => setSell(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" /></div>
                <FormSelect value={selectedSellUnit} onChange={(e) => setSellUnit(e.target.value)} options={units} className="w-28 shrink-0" />
              </div>
            </Field>
            <Field label="Purchase price" bn="ক্রয় মূল্য" hint={buyNum && selectedBuyUnit !== unit ? `${taka(buyNum, buyNum % 1 ? 2 : 0)} / ${selectedBuyUnit} → ${taka(buyBase, buyBase % 1 ? 2 : 0)} / ${unit} automatically` : 'Optional. Choose the unit used on the supplier memo; HisabIQ converts it automatically.'}>
              <div className="flex gap-2">
                <div className="min-w-0 flex-1"><MoneyInput value={buy} onChange={(e) => setBuy(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" /></div>
                <FormSelect value={selectedBuyUnit} onChange={(e) => setBuyUnit(e.target.value)} options={units} className="w-28 shrink-0" />
              </div>
            </Field>
          </div>
          {margin !== null &&
          <p className={`text-xs ${margin < 0 ? 'text-danger' : 'text-ink-500'}`}>
              Margin {margin.toFixed(1)}% · profit {taka(sellBase - buyBase, (sellBase - buyBase) % 1 ? 2 : 0)} per {unit}
            </p>
          }
        </section>

        <section className="rounded-xl border border-ink-100">
          <button
            type="button"
            onClick={() => setAdvanced((a) => !a)}
            aria-expanded={advanced}
            className="flex w-full items-center justify-between px-4 py-3 text-left">
            
            <span>
              <span className="block text-sm font-semibold text-ink">Advanced <span className="font-bn text-[11px] font-normal text-ink-400">· উন্নত সেটিংস</span></span>
              <span className="block text-xs text-ink-500">Multiple units, opening stock, minimum stock, barcode</span>
            </span>
            <ChevronDown className={`size-4 text-ink-400 transition-transform ${advanced ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence initial={false}>
            {advanced &&
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden">
              
                <div className="space-y-4 border-t border-ink-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-medium text-ink">Sell in a larger unit too <span className="font-bn text-[11px] font-normal text-ink-400">· বড় এককে বিক্রি</span></p>
                      <p className="text-xs text-ink-500">e.g. Box and Pcs, or Gauge and Gira</p>
                    </div>
                    <Switch checked={multiUnit} onCheckedChange={(checked) => {
                      if (!checked) {
                        if (sellUnit === altUnit) setSellUnit(unit);
                        if (buyUnit === altUnit) setBuyUnit(unit);
                      }
                      setMultiUnit(checked);
                    }} aria-label="Enable larger unit" />
                  </div>

                  {multiUnit &&
                <div className="rounded-lg bg-teal-50/60 p-3">
                      <div className="flex flex-wrap items-center gap-2 text-[15px] text-ink">
                        <span className="font-medium">1</span>
                        <Input
                      aria-label="Larger unit name"
                      value={altUnit}
                      onChange={(e) => {
                        const next = e.target.value;
                        if (sellUnit === altUnit) setSellUnit(next);
                        if (buyUnit === altUnit) setBuyUnit(next);
                        setAltUnit(next);
                      }}
                      className="h-9 w-28 bg-white font-medium" />
                    
                        <span className="text-ink-500">=</span>
                        <Input
                      aria-label="Conversion factor"
                      value={factor}
                      onChange={(e) => setFactor(e.target.value.replace(/[^\d.]/g, ''))}
                      className="h-9 w-20 bg-white text-right font-medium"
                      inputMode="decimal" />
                    
                        <span className="font-medium">{unit}</span>
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-teal-800">
                        <Info className="size-3.5" />
                        Reads as “1 {altUnit || '…'} = {factor || '…'} {unit}”. POS lets cashiers pick either unit per line.
                      </p>
                      {selectedSellUnit === unit ?
                      <div className="mt-3 max-w-xs">
                          <Field label={`Custom selling price / ${altUnit || 'unit'}`} hint={autoAltSell ? `Auto ${taka(autoAltSell, autoAltSell % 1 ? 2 : 0)} / ${altUnit || 'unit'}. Leave empty to keep automatic conversion.` : 'Optional override. Leave empty to use automatic conversion.'}>
                            <MoneyInput value={altPrice} onChange={(e) => setAltPrice(e.target.value.replace(/[^\d.]/g, ''))} placeholder={autoAltSell ? String(autoAltSell) : '0'} />
                          </Field>
                        </div> :
                      <p className="mt-3 rounded-md border border-teal-100 bg-white/70 px-3 py-2 text-xs text-teal-800">
                          Selling price is already entered in {selectedSellUnit}. No extra larger-unit price is required.
                        </p>
                      }
                    </div>
                }

                  <div className="grid gap-3 sm:grid-cols-2">
                    {!initialProduct && <Field label="Opening stock" bn="শুরুর স্টক">
                      <div className="flex gap-2">
                        <Input value={openingQty} onChange={(e) => setOpeningQty(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" className="text-right" inputMode="decimal" />
                        <FormSelect value={units.includes(openingUnit) ? openingUnit : unit} onChange={(e) => setOpeningUnit(e.target.value)} options={units} className="w-28 shrink-0" />
                      </div>
                    </Field>}
                    <Field label="Minimum stock" bn="সর্বনিম্ন স্টক" hint="We’ll alert you when stock falls below this.">
                      <div className="flex gap-2">
                        <Input value={minQty} onChange={(e) => setMinQty(e.target.value.replace(/[^\d.]/g, ''))} placeholder="0" className="text-right" inputMode="decimal" />
                        <FormSelect value={units.includes(minUnit) ? minUnit : unit} onChange={(e) => setMinUnit(e.target.value)} options={units} className="w-28 shrink-0" />
                      </div>
                    </Field>
                    <Field label="Barcode / SKU" bn="বারকোড">
                      <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Auto-generated if empty" />
                    </Field>
                  </div>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </section>

        {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>{initialProduct ? 'Save changes' : 'Save product'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}