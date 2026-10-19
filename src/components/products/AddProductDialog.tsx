import { useTenantSettings } from '../../settings/TenantSettingsProvider';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { Switch } from '../Switch';
import { AppSelect } from '../AppSelect';
import { AppDatePicker } from '../AppDateRangePicker';
import { QuickAddSelect } from '../QuickAddSelect';
import { MoneyUnitInput, QuantityUnitInput } from '../MoneyUnitInput';
import {
  availableProductCategories, availableProductBrands, availableProductUnits,
  createPreviewProductCategory, createPreviewProductBrand, createPreviewProductUnit
} from '../../data/erpDemoStore';
import { PhotoUploader } from './PhotoUploader';
import {useUiCopy} from '../../i18n/useUiCopy';
import {productFormLabel,productFormOptions} from '../../i18n/productFormsCopy';

import type {
  Product,
  ProductKind,
  UnitRelation,
  SerialTrackingMode,
  StockAllocationMethod,
  WarrantyDurationUnit,
  WarrantyType
} from '../../types/erp';
import { taka } from '../../utils/currency';
import { resolveUnitChain } from '../../utils/unitChain';
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

const serialModes: SerialTrackingMode[] = ['Off', 'Optional', 'Required'];
const warrantyUnits: WarrantyDurationUnit[] = ['Days', 'Months', 'Years'];
const warrantyTypes: WarrantyType[] = ['Seller', 'Manufacturer', 'Service', 'Replacement'];
const allocationMethods: StockAllocationMethod[] = ['FIFO', 'FEFO'];
type EditableUnitRelation = Omit<UnitRelation, 'quantity'> & { quantity: string };

function Field({ label, bn, children, hint }: {label: string;bn?: string;children: React.ReactNode;hint?: string;}) {
  const {language,showHelper}=useUiCopy();
  const pl=(english:string)=>productFormLabel(language,english);
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-1.5 text-[13px] font-medium text-ink">
        {pl(label)}
        {showHelper && bn && <span className="font-bn text-[11px] font-normal text-ink-400">· {bn}</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-500">{pl(hint)}</span>}
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
  const {language,showHelper}=useUiCopy();
  const pl=(english:string)=>productFormLabel(language,english);
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[13px] font-medium text-ink">{pl(title)} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· {bn}</span>}</p>
        <p className="text-xs text-ink-500">{pl(hint)}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={pl(title)} />
    </div>
  );
}

export function AddProductDialog({ open, onOpenChange, onSave, initialProduct = null, existingSerials = [] }: AddProductDialogProps) {
  const {language,showHelper}=useUiCopy();
  const pl=(english:string)=>productFormLabel(language,english);
  const { state } = useTenantSettings();
  const defaults = state.sections.products;
  const defaultViewUnit = defaults.defaultUnit === 'Gira' ? 'Gauge' : defaults.defaultUnit;
  const [photos, setPhotos] = useState<string[]>([]);
  const [kind, setKind] = useState<ProductKind>('Stock');
  const [name, setName] = useState('');
  const [nameBn, setNameBn] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [categoryOptions, setCategoryOptions] = useState(availableProductCategories);
  const [brand, setBrand] = useState('Generic / No brand');
  const [brandOptions, setBrandOptions] = useState(availableProductBrands);
  const [unitOptions, setUnitOptions] = useState(availableProductUnits);
  const [addingUnit, setAddingUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitSymbol, setNewUnitSymbol] = useState('');
  const [unit, setUnit] = useState('Gira');
  const [sell, setSell] = useState('');
  const [sellUnit, setSellUnit] = useState('Gira');
  const [buy, setBuy] = useState('');
  const [buyUnit, setBuyUnit] = useState('Gira');
  const [advanced, setAdvanced] = useState(false);
  const [multiUnit, setMultiUnit] = useState(true);
  const [unitRows, setUnitRows] = useState<EditableUnitRelation[]>([
    { leftUnit: 'Gauge', rightUnit: 'Gira', quantity: '16' }
  ]);
  const [altPrice, setAltPrice] = useState('');
  const [customUnitPrices, setCustomUnitPrices] = useState(false);
  const [unitSellPrices, setUnitSellPrices] = useState<Record<string,string>>({});
  const [unitPurchasePrices, setUnitPurchasePrices] = useState<Record<string,string>>({});
  const [stockViewUnit, setStockViewUnit] = useState(defaultViewUnit);
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
  const configuredRelations: UnitRelation[] = unitRows.map(row => ({
    leftUnit: row.leftUnit, rightUnit: row.rightUnit, quantity: Number(row.quantity)
  }));
  let chain: ReturnType<typeof resolveUnitChain> | null = null;
  if (isStock && multiUnit) {
    try { chain = resolveUnitChain(configuredRelations); } catch { /* save displays a precise error */ }
  }
  const altUnit = unitRows[0]?.leftUnit ?? '';
  const displayUnits = [unitRows[0]?.leftUnit, ...unitRows.map(row => row.rightUnit)].filter(Boolean);
  const units = isStock && multiUnit ? [...new Set(displayUnits)] : [unit];
  const stockUnit = chain?.stockUnit ?? unit;
  const f = chain?.factors[altUnit] ?? 1;
  const selectedSellUnit = units.includes(sellUnit) ? sellUnit : stockUnit;
  const selectedBuyUnit = units.includes(buyUnit) ? buyUnit : stockUnit;
  const selectedOpeningUnit = units.includes(openingUnit) ? openingUnit : stockUnit;
  const selectedMinUnit = units.includes(minUnit) ? minUnit : stockUnit;
  const selectedStockViewUnit = units.includes(stockViewUnit) ? stockViewUnit : units[0] ?? stockUnit;
  const unitFactor = (name: string) => chain?.factors[name] ?? (name === stockUnit ? 1 : 0);
  const stockToBase = (qty: string, selectedUnit: string) => (Number(qty) || 0) * (unitFactor(selectedUnit) || 1);
  const priceToBase = (amount: string, selectedUnit: string) => (Number(amount) || 0) / (unitFactor(selectedUnit) || 1);
  const sellNum = parseFloat(sell) || 0;
  const buyNum = parseFloat(buy) || 0;
  const sellBase = priceToBase(sell, selectedSellUnit);
  const buyBase = isStock ? priceToBase(buy, selectedBuyUnit) : buyNum;
  const margin = sellBase > 0 && buyBase > 0 ? (sellBase - buyBase) / sellBase * 100 : null;
  const autoAltSell = sellBase > 0 && multiUnit ? sellBase * f : 0;
  const openingBaseQty = isStock ? stockToBase(openingQty, selectedOpeningUnit) : 0;
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
    setCategoryOptions(availableProductCategories());
    setBrand('Generic / No brand');
    setBrandOptions(availableProductBrands());
    setUnitOptions(availableProductUnits());
    setAddingUnit(false);setNewUnitName('');setNewUnitSymbol('');
    setUnit(defaults.defaultUnit);
    setSell('');
    setSellUnit(defaults.priceEntry === 'Base unit' ? defaults.defaultUnit : defaultViewUnit);
    setBuy('');
    setBuyUnit(defaults.priceEntry === 'Base unit' ? defaults.defaultUnit : defaultViewUnit);
    setAdvanced(false);
    setMultiUnit(defaults.defaultUnit === 'Gira');
    setUnitRows([{ leftUnit: defaults.defaultUnit === 'Gira' ? 'Gauge' : 'Box', rightUnit: defaults.defaultUnit,
      quantity: defaults.defaultUnit === 'Gira' ? '16' : '12' }]);
    setAltPrice('');
    setCustomUnitPrices(false);
    setUnitSellPrices({});setUnitPurchasePrices({});
    setStockViewUnit(defaultViewUnit);
    setOpeningQty('');
    setOpeningUnit(defaults.openingUnit === 'Base unit' ? defaults.defaultUnit : defaultViewUnit);
    setMinQty('');
    setMinUnit(defaults.minimumUnit === 'Base unit' ? defaults.defaultUnit : defaultViewUnit);
    setBarcode('');
    setWarrantyEnabled(defaults.warranty);
    setWarrantyDuration(String(defaults.warrantyMonths));
    setWarrantyDurationUnit('Months');
    setWarrantyType('Seller');
    setWarrantyTerms('');
    setSerialTracking(defaults.serial);
    setOpeningSerialText('');
    setExpiryEnabled(defaults.expiry);
    setExpiryDateRequired(false);
    setExpiryWarningDays(String(defaults.expiryDays));
    setAllocationMethod(defaults.allocation);
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
    setCategoryOptions(availableProductCategories());
    setBrand(initialProduct.brand ?? 'Generic / No brand');
    setBrandOptions(availableProductBrands());
    setUnitOptions(availableProductUnits());
    setAddingUnit(false);setNewUnitName('');setNewUnitSymbol('');
    setUnit(initialProduct.unit);
    setSell(String(initialProduct.sellPrice));
    setSellUnit(initialProduct.unit);
    setBuy(String(initialProduct.purchasePrice));
    setBuyUnit(initialProduct.unit);
    setMultiUnit(productKind === 'Stock' && Boolean(initialProduct.unitRelations?.length || initialProduct.altUnit));
    setUnitRows(initialProduct.unitRelations?.length
      ? initialProduct.unitRelations.map(row => ({ ...row, quantity: String(row.quantity) }))
      : [{ leftUnit: initialProduct.altUnit?.unit ?? 'Box', rightUnit: initialProduct.unit,
           quantity: String(initialProduct.altUnit?.factor ?? 12) }]);
    setAltPrice(initialProduct.altUnit?.price ? String(initialProduct.altUnit.price) : '');
    setUnitSellPrices(Object.fromEntries(Object.entries(initialProduct.unitSellPrices??{}).map(([k,v])=>[k,String(v)])));
    setUnitPurchasePrices(Object.fromEntries(Object.entries(initialProduct.unitPurchasePrices??{}).map(([k,v])=>[k,String(v)])));
    setCustomUnitPrices(Boolean(Object.keys(initialProduct.unitSellPrices??{}).length||Object.keys(initialProduct.unitPurchasePrices??{}).length));
    setStockViewUnit(initialProduct.stockViewUnit ?? initialProduct.altUnit?.unit ?? initialProduct.unit);
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
    setAdvanced(false);
    setError('');
  }, [open, initialProduct]);

  const changePriceUnit = (amount: string, current: string, next: string, setValue: (value: string) => void, setUnitValue: (value: string) => void) => {
    if (amount.trim() && current !== next) {
      const basePrice = priceToBase(amount, current);
      const converted = basePrice * (unitFactor(next) || 1);
      setValue(String(Math.round(converted * 10000) / 10000));
    }
    setUnitValue(next);
  };
  const changeStockUnit = (
    amount: string,
    current: string,
    next: string,
    setValue: (value: string) => void,
    setUnitValue: (unit: string) => void
  ) => {
    const nextValue = (Number(amount) || 0) * (unitFactor(current) || 1) / (unitFactor(next) || 1);
    setValue(amount.trim() ? String(Number(nextValue.toPrecision(12))) : '');
    setUnitValue(next);
  };
  const quickAddUnit = (name: string, symbol: string, select: (symbol: string) => void) => {
    const code = symbol.trim() || name.trim();
    createPreviewProductUnit(name, code);
    setUnitOptions(availableProductUnits());
    select(code);
  };

  const changeKind = (next: ProductKind) => {
    setKind(next);
    if (next === 'Service') {
      setCategory('Service');
      setUnit('Service');
      setSellUnit('Service');
      setBuyUnit('Service');
      setStockViewUnit('Service');
      setMultiUnit(false);
      setSerialTracking('Off');
      setExpiryEnabled(false);
    } else if (unit === 'Service') {
      if (category === 'Service') setCategory('Hardware');
      setUnit('Pcs');
      setSellUnit('Pcs');
      setBuyUnit('Pcs');
      setStockViewUnit('Pcs');
    }
  };

  const save = () => {
    if (!name.trim()) return setError(pl('Product name is required.'));
    if (!sellNum) return setError(pl('Enter a selling price.'));
    if (isStock && multiUnit) {
      try { resolveUnitChain(configuredRelations); }
      catch (cause) { return setError(cause instanceof Error ? cause.message : 'Review unit relationships.'); }
      if(initialProduct && (stockUnit !== initialProduct.unit ||
        JSON.stringify(configuredRelations) !== JSON.stringify(initialProduct.unitRelations ??
         (initialProduct.altUnit?[{leftUnit:initialProduct.altUnit.unit,rightUnit:initialProduct.unit,quantity:initialProduct.altUnit.factor}]:[])))) {
        return setError('Editing saved unit relationships requires reviewed stock and invoice migration.');
      }
    }

    if(customUnitPrices && [...Object.values(unitSellPrices),...Object.values(unitPurchasePrices)].some(value=>
      value.trim() && (!/^(?:\d+)(?:\.\d{1,4})?$/.test(value)||!Number.isFinite(Number(value)))))
      return setError('Enter valid nonnegative unit prices (up to four decimal places).');

    if (warrantyEnabled && (!(parseFloat(warrantyDuration) > 0) || !warrantyType)) {
      return setError(pl('Enter a valid warranty duration and type.'));
    }

    if (!initialProduct && isStock && serialTracking !== 'Off') {
      if (serialTracking === 'Required' && !Number.isInteger(openingBaseQty)) return setError(pl('Required serial tracking needs a whole base-unit quantity.'));
      if (openingSerialDuplicates.length) return setError(`${pl('Duplicate serial:')} ${openingSerialDuplicates[0]}`);
      if (serialTracking === 'Required' && openingSerials.length !== requiredOpeningSerials) {
        return setError(`Required serial tracking needs ${requiredOpeningSerials} unique serials for ${openingBaseQty} ${unit}.`);
      }
    }

    if (!initialProduct && isStock && expiryEnabled && openingBaseQty > 0 && expiryDateRequired && !expiryDate) {
      return setError(pl('Expiry date is required for opening stock.'));
    }
    if (manufactureDate && expiryDate && expiryDate <= manufactureDate) {
      return setError(pl('Expiry date must be after manufacture date.'));
    }

    const product: Product = {
      id: initialProduct?.id ?? `p${Date.now()}`,
      kind,
      name: name.trim(),
      nameBn: nameBn.trim() || undefined,
      sku: barcode || `${category.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`,
      category,
      brand: isStock ? brand : undefined,
      image: photos[0],
      unit: isStock ? stockUnit : unit,
      unitRelations: isStock && multiUnit ? configuredRelations : undefined,
      unitSellPrices: isStock && multiUnit && customUnitPrices ? Object.fromEntries(Object.entries(unitSellPrices).filter(([unit,value])=>units.includes(unit)&&value.trim()).map(([unit,value])=>[unit,Number(value)])) : undefined,
      unitPurchasePrices: isStock && multiUnit && customUnitPrices ? Object.fromEntries(Object.entries(unitPurchasePrices).filter(([unit,value])=>units.includes(unit)&&value.trim()).map(([unit,value])=>[unit,Number(value)])) : undefined,
      // Legacy carts use this flattened largest-to-smallest conversion until all units are supported.
      altUnit: isStock && multiUnit && altUnit ? { unit: altUnit, factor: f, price: parseFloat(altPrice) || undefined } : undefined,
      stock: initialProduct ? initialProduct.stock : openingBaseQty,
      stockViewUnit: isStock ? selectedStockViewUnit : undefined,
      minStock: isStock ? stockToBase(minQty, selectedMinUnit) : 0,
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
            {pl(initialProduct ? 'Edit product' : 'Add product')} {showHelper&&<span className="font-bn text-sm font-normal text-ink-500">· {initialProduct ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য'}</span>}
          </DialogTitle>
          <DialogDescription>{pl(initialProduct ? 'Update product settings. Stock corrections remain in Adjust stock.' : 'Only name and selling price are required. Optional controls stay in Advanced.')}</DialogDescription>
        </DialogHeader>

        <section className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{pl('Basic')}</p>
          <Field label="Photos" bn="ছবি">
            <PhotoUploader photos={photos} onChange={setPhotos} hint={pl("Up to 4 photos. The first one appears in POS and lists.")} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Product type" bn="ধরন" hint={pl(initialProduct ? 'Product type is fixed after creation.' : 'Stock products track inventory; services do not.')}>
              <AppSelect label={pl("Product type")} value={kind} disabled={Boolean(initialProduct)} onChange={(next) => changeKind(next as ProductKind)} options={productFormOptions(language,['Stock', 'Service'])} />
            </Field>
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-ink">{pl("Category")} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· ক্যাটাগরি</span>}</p>
              <QuickAddSelect label={pl("Category")} value={category} options={categoryOptions.filter((c) => c !== 'All')} onChange={setCategory}
                onCreate={(name) => { createPreviewProductCategory(name); setCategoryOptions(availableProductCategories()); setCategory(name); }} />
            </div>
            {isStock && <div className="min-w-0">
              <p className="mb-1.5 text-[13px] font-medium text-ink">{pl("Brand")} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· ব্র্যান্ড</span>}</p>
              <QuickAddSelect label={pl("Brand")} value={brand} options={brandOptions} onChange={setBrand}
                onCreate={(name) => { createPreviewProductBrand(name); setBrandOptions(availableProductBrands()); setBrand(name); }} />
            </div>}
            <Field label="Product name" bn="নাম">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={pl(isStock ? 'e.g. LED Bulb 12W' : 'e.g. Ceiling Fan Installation')} autoFocus />
            </Field>
            <Field label="Bangla name" bn="বাংলা নাম (ঐচ্ছিক)">
              <Input value={nameBn} onChange={(e) => setNameBn(e.target.value)} placeholder={isStock ? 'এলইডি বাল্ব ১২ ওয়াট' : 'সিলিং ফ্যান ইনস্টলেশন'} className="font-bn" />
            </Field>
            {isStock && !multiUnit && <div className="min-w-0">
              <p className="mb-1.5 text-[13px] font-medium text-ink">{pl("Base unit")} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· ছোট একক</span>}</p>
              <QuickAddSelect label={pl("Base unit")} value={unit} options={unitOptions.map((item) => item.symbol)}
                onChange={(next) => {
                  if (sellUnit === unit) setSellUnit(next);
                  if (buyUnit === unit) setBuyUnit(next);
                  if (stockViewUnit === unit) setStockViewUnit(next);
                  setUnit(next);
                }}
                onCreate={(name, _phone, _area, symbol) => quickAddUnit(name, symbol || name, (next) => {
                  if (sellUnit === unit) setSellUnit(next);
                  if (buyUnit === unit) setBuyUnit(next);
                  if (stockViewUnit === unit) setStockViewUnit(next);
                  setUnit(next);
                })} showSymbol placeholder={pl('Unit name, e.g. Meter')} />
              <p className="mt-1 text-xs text-ink-500">{pl('Smallest unit used for stock and serial counts.')}</p>
            </div>}
            <div className="min-w-0">
              <p className="mb-1.5 text-[13px] font-medium text-ink">{pl("Selling price")} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· বিক্রয় মূল্য</span>}</p>
              <MoneyUnitInput label={pl("Selling price")} value={sell} onChange={setSell}
                unit={selectedSellUnit} units={units}
                onUnitChange={(next) => changePriceUnit(sell, selectedSellUnit, next, setSell, setSellUnit)} />
              <p className="mt-1 text-xs text-ink-500">
                {sellNum && selectedSellUnit !== unit ? `${taka(sellNum)} / ${selectedSellUnit} → ${taka(sellBase)} / ${unit} automatically` : pl('Normal selling price; offers are managed separately.')}
              </p>
            </div>
            <div className="min-w-0">
              <p className="mb-1.5 text-[13px] font-medium text-ink">
                {pl(isStock ? 'Purchase price' : 'Service cost')}
                {showHelper&&<span className="font-bn ml-1 text-[11px] font-normal text-ink-400">· {isStock ? 'ক্রয় মূল্য' : 'সেবা খরচ'}</span>}
              </p>
              <MoneyUnitInput label={pl(isStock ? 'Purchase price' : 'Service cost')} value={buy} onChange={setBuy}
                unit={isStock ? selectedBuyUnit : undefined} units={units}
                onUnitChange={isStock ? (next) => changePriceUnit(buy, selectedBuyUnit, next, setBuy, setBuyUnit) : undefined} />
              <p className="mt-1 text-xs text-ink-500">{pl('Optional internal cost.')}</p>
            </div>
          </div>
          {margin !== null && <p className={`text-xs ${margin < 0 ? 'text-danger' : 'text-ink-500'}`}>Margin {margin.toFixed(1)}% · profit {taka(sellBase - buyBase)} per {unit}</p>}
        </section>

        {isStock && <section data-product-units-and-pricing className="rounded-xl border border-border p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-ink">{pl("Units & Pricing")}</h3>
              <p className="text-xs text-ink-500">একক ও দাম · 1 Gauge = 16 Gira</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setAddingUnit(value => !value)}
                className="rounded-md border border-border bg-card px-2 py-1.5 text-xs text-ink hover:bg-ink-50">{pl("Manage Units")}</button>
              <Switch checked={multiUnit} onCheckedChange={setMultiUnit} aria-label={pl("Enable multiple units")} />
            </div>
          </div>
          {addingUnit && <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg bg-ink-50 p-2">
            <Input aria-label="New unit name" value={newUnitName} onChange={event => setNewUnitName(event.target.value)}
              placeholder="Unit name" className="min-w-0 flex-1" />
            <Input aria-label="Unit symbol" value={newUnitSymbol} onChange={event => setNewUnitSymbol(event.target.value)}
              placeholder="Symbol" className="w-20" />
            <Button size="sm" disabled={!newUnitName.trim()} onClick={() => {
              if (!newUnitName.trim()) return;
              quickAddUnit(newUnitName, newUnitSymbol || newUnitName, () => {});
              setNewUnitName('');setNewUnitSymbol('');setAddingUnit(false);
            }}>Add</Button>
          </div>}
          {multiUnit && <div className="rounded-lg bg-teal-50/60 p-2.5 sm:p-3">
            <div className="space-y-2">
              {unitRows.map((row, index) => (
                <div key={index} data-product-unit-relationship className="grid min-w-0 grid-cols-[minmax(0,1fr)_24px] min-[480px]:grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)_24px] items-center gap-1 min-[480px]:gap-1.5">
                  <div className="col-start-1 row-start-1 min-w-0 min-[480px]:col-auto min-[480px]:row-auto"><QuantityUnitInput compact readOnlyAmount
                    label={'Larger unit ' + (index + 1)} value="1" onChange={() => {}}
                    unit={row.leftUnit} units={unitOptions.map(item => item.symbol)}
                    onUnitChange={(next) => {
                      setUnitRows(previous => previous.map((item, i) =>
                        i === index ? { ...item, leftUnit: next } :
                        i === index - 1 ? { ...item, rightUnit: next } : item));
                    }} /></div>
                  <span className="col-start-1 row-start-2 text-center text-sm font-semibold text-ink-500 min-[480px]:col-auto min-[480px]:row-auto" aria-hidden="true">=</span>
                  <div className="col-start-1 row-start-3 min-w-0 min-[480px]:col-auto min-[480px]:row-auto"><QuantityUnitInput compact
                    label={'Smaller unit ' + (index + 1)} value={row.quantity}
                    onChange={value => setUnitRows(previous => previous.map((item, i) =>
                      i === index ? { ...item, quantity: value } : item))}
                    unit={row.rightUnit} units={unitOptions.map(item => item.symbol)}
                    onUnitChange={(next) => {
                      setUnitRows(previous => previous.map((item, i) =>
                        i === index ? { ...item, rightUnit: next } :
                        i === index + 1 ? { ...item, leftUnit: next } : item));
                      if (index === unitRows.length - 1) setUnit(next);
                    }} /></div>
                  {unitRows.length > 1 ?
                    <button type="button" title="Remove relationship" aria-label={'Remove unit relationship ' + (index + 1)}
                      className="col-start-2 row-start-3 flex h-8 w-6 items-center justify-center rounded-md text-ink-500 hover:bg-danger-bg hover:text-danger min-[480px]:col-auto min-[480px]:row-auto"
                      onClick={() => {
                        const rows = unitRows.filter((_, i) => i !== index).map(item => ({ ...item }));
                        for (let i = 1; i < rows.length; i++) rows[i].leftUnit = rows[i-1].rightUnit;
                        setUnitRows(rows);
                        setUnit(rows[rows.length - 1].rightUnit);
                      }}><X className="size-3.5" /></button>
                    : <span aria-hidden="true" />}
                </div>
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <Button size="sm" variant="outline" onClick={() => setUnitRows(previous => [
                ...previous, { leftUnit: previous[previous.length - 1].rightUnit, rightUnit: '', quantity: '' }
              ])}><Plus className="size-3.5" /> {pl("Add another unit")}</Button>
              <span className="text-xs text-ink-600">
                {pl("Base unit")}: <strong>{chain?.stockUnit ?? pl("Complete the units")}</strong>
              </span>
            </div>
            <p className="mt-2 text-xs text-ink-500">{pl("Each new row continues from the smaller unit above. Stock uses only the last unit.")}</p>
            <div className="mt-3 max-w-xs">
              <Field label="Stock / POS view unit" bn="ডিফল্ট দেখানোর একক" hint="Controls stock display and the default POS cart unit.">
                <AppSelect label={pl('Stock / POS view unit')} value={selectedStockViewUnit}
                  onChange={setStockViewUnit} options={units} />
              </Field>
            </div>
            <label className="mt-3 flex cursor-pointer items-start gap-2 text-[13px] font-medium text-ink">
              <input type="checkbox" className="mt-0.5 accent-teal-600" checked={customUnitPrices}
                onChange={event=>setCustomUnitPrices(event.target.checked)} />
              <span>{pl('Set different prices for each unit')}
                <span className="block text-xs font-normal text-ink-500">{pl('Leave blank to use the converted price.')}</span>
              </span>
            </label>
            {customUnitPrices && <div className="mt-2 space-y-1.5 rounded-lg border border-border bg-card p-2">
              {units.map(name=>(
                <div key={name} className="grid grid-cols-[minmax(55px,.7fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-1.5">
                  <span className="truncate text-xs font-medium text-ink" title={name}>{name}</span>
                  <div className="min-w-0"><MoneyInput aria-label={'Purchase price per '+name}
                    value={unitPurchasePrices[name]??''}
                    placeholder={String(Number((buyBase*(unitFactor(name)||1)).toPrecision(8)))}
                    onChange={e=>setUnitPurchasePrices(old=>({...old,[name]:e.target.value.replace(/[^\d.]/g,'')}))}/></div>
                  <div className="min-w-0"><MoneyInput aria-label={'Selling price per '+name}
                    value={unitSellPrices[name]??''}
                    placeholder={String(Number((sellBase*(unitFactor(name)||1)).toPrecision(8)))}
                    onChange={e=>setUnitSellPrices(old=>({...old,[name]:e.target.value.replace(/[^\d.]/g,'')}))}/></div>
                </div>
              ))}
              <p className="text-[11px] text-ink-500">{pl('Purchase / Selling — Auto unless edited')}</p>
            </div>}
            {multiUnit && unitRows.length === 1 && !customUnitPrices && selectedSellUnit === stockUnit && <div className="mt-3 max-w-xs">
              <Field label={'Custom selling price / ' + (altUnit || 'unit')}
                hint={autoAltSell ? 'Auto ' + taka(autoAltSell) + ' / ' + altUnit : 'Optional override'}>
                <MoneyInput value={altPrice} onChange={event => setAltPrice(event.target.value.replace(/[^\d.]/g, ''))}
                  placeholder={autoAltSell ? String(autoAltSell) : '0'} />
              </Field>
            </div>}
          </div>}
        </section>}

        <section className="rounded-xl border border-border">
          <button type="button" onClick={() => setAdvanced((value) => !value)} aria-expanded={advanced} className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span>
              <span className="block text-sm font-semibold text-ink">{pl('Advanced')} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· উন্নত সেটিংস</span>}</span>
              <span className="block text-xs text-ink-500">{pl('Stock, warranty, serial tracking and expiry')}</span>
            </span>
            <ChevronDown className={`size-4 text-ink-400 transition-transform ${advanced ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {advanced && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="space-y-5 border-t border-border p-4">
                {isStock && <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {!initialProduct && <Field label="Opening stock" bn="শুরুর স্টক">
                      <QuantityUnitInput label={pl("Opening stock")} value={openingQty} onChange={setOpeningQty}
                        unit={selectedOpeningUnit} units={units}
                        onUnitChange={(next) => changeStockUnit(openingQty, selectedOpeningUnit, next, setOpeningQty, setOpeningUnit)} />
                    </Field>}
                    <Field label="Minimum stock" bn="সর্বনিম্ন স্টক">
                      <QuantityUnitInput label={pl("Minimum stock")} value={minQty} onChange={setMinQty}
                        unit={selectedMinUnit} units={units}
                        onUnitChange={(next) => changeStockUnit(minQty, selectedMinUnit, next, setMinQty, setMinUnit)} />
                    </Field>
                  </div>
                </>}

                <div className="border-t border-border pt-4">
                  <SettingHeader title="Warranty" bn="ওয়ারেন্টি" hint="Independent from serial tracking; claims stay in the Warranty module." checked={warrantyEnabled} onCheckedChange={setWarrantyEnabled} />
                  {warrantyEnabled && <div className="mt-3 grid gap-3 rounded-lg bg-ink-50/60 p-3 sm:grid-cols-2">
                    <Field label="Duration" bn="সময়কাল">
                      <div className="flex gap-2">
                        <Input value={warrantyDuration} onChange={(e) => setWarrantyDuration(e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" className="text-right" />
                        <AppSelect label={pl("Warranty duration unit")} value={warrantyDurationUnit} onChange={(next) => setWarrantyDurationUnit(next as WarrantyDurationUnit)} options={productFormOptions(language,warrantyUnits)} className="w-32 shrink-0" />
                      </div>
                    </Field>
                    <Field label="Warranty type" bn="ধরন">
                      <AppSelect label={pl("Warranty type")} value={warrantyType} onChange={(next) => setWarrantyType(next as WarrantyType)} options={productFormOptions(language,warrantyTypes)} />
                    </Field>
                    <Field label="Terms" bn="শর্তাবলি" hint="This text is snapshotted onto each sold invoice item." >
                      <textarea value={warrantyTerms} onChange={(e) => setWarrantyTerms(e.target.value)} placeholder="Coverage, exclusions, required documents…" className="min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 sm:col-span-2" />
                    </Field>
                  </div>}
                </div>

                {isStock && <div className="border-t border-border pt-4">
                  <p className="text-[13px] font-medium text-ink">{pl("Serial Tracking")} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· সিরিয়াল নম্বর</span>}</p>
                  <p className="mb-3 text-xs text-ink-500">{pl('Choose independently from warranty.')}</p>
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-ink-50 p-1">
                    {serialModes.map((mode) => <button key={mode} type="button" onClick={() => setSerialTracking(mode)} className={`rounded-md px-2 py-2 text-xs font-medium ${serialTracking === mode ? 'bg-card text-ink shadow-card' : 'text-ink-500'}`}>{pl(mode)}</button>)}
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
                      <span className="text-[13px] text-ink">{pl('Expiry date required')} {showHelper&&<span className="font-bn text-[11px] text-ink-400">· মেয়াদ তারিখ আবশ্যক</span>}</span>
                      <Switch checked={expiryDateRequired} onCheckedChange={setExpiryDateRequired} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Warning days" bn="আগে সতর্কতা"><Input value={expiryWarningDays} onChange={(e) => setExpiryWarningDays(e.target.value.replace(/[^\d]/g, ''))} inputMode="numeric" className="text-right" /></Field>
                      <Field label="Allocation" bn="স্টক নির্বাচন"><AppSelect label={pl("Allocation")} value={allocationMethod} onChange={(next) => setAllocationMethod(next as StockAllocationMethod)} options={productFormOptions(language,allocationMethods)} /></Field>
                    </div>
                    {!initialProduct && openingBaseQty > 0 && <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-3">
                      <Field label="Batch no." bn="ব্যাচ"><Input value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder="Optional" /></Field>
                      <Field label="Manufacture date" bn="উৎপাদন"><AppDatePicker label={pl("Manufacture date")} value={manufactureDate} onChange={setManufactureDate} /></Field>
                      <Field label="Expiry date" bn="মেয়াদ"><AppDatePicker label={pl("Expiry date")} value={expiryDate} onChange={setExpiryDate} /></Field>
                    </div>}
                  </div>}
                </div>}

                <div className="border-t border-border pt-4">
                  <Field label="Barcode / SKU" bn="বারকোড"><Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder={pl("Auto-generated if empty")} /></Field>
                </div>
              </div>
            </motion.div>}
          </AnimatePresence>
        </section>

        {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{pl("Cancel")}</Button>
          <Button onClick={save}>{pl(initialProduct ? 'Save changes' : 'Save product')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

