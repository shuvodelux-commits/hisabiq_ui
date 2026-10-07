import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import type { Product, StockLot } from '../../types/erp';
import { taka } from '../../utils/currency';
import { formatStock } from '../../utils/units';
import { toBaseQuantity } from '../../utils/productEntry';

type StockAdjustmentMode = 'Add stock' | 'Remove stock' | 'Set exact stock';

export type StockAdjustmentResult = {
  newStock: number;
  delta: number;
  reason: string;
  note: string;
};

export function ProductDetailsDialog({
  product,
  lots,
  open,
  onOpenChange
}: {
  product: Product | null;
  lots: StockLot[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!product) return null;
  const productLots = lots.filter((lot) => lot.productId === product.id && lot.available > 0);
  const stockValue = product.stock * product.purchasePrice;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            {product.nameBn && <span className="font-bn">{product.nameBn} · </span>}
            {product.sku} · {product.category}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-ink-100 p-3">
            <p className="text-xs text-ink-500">Current stock</p>
            <p className="mt-1 text-base font-semibold text-ink">{formatStock(product)}</p>
            <p className="mt-0.5 text-[11px] text-ink-400">Minimum {formatStock({ ...product, stock: product.minStock })}</p>
          </div>
          <div className="rounded-lg border border-ink-100 p-3">
            <p className="text-xs text-ink-500">Stock value</p>
            <p className="mt-1 text-base font-semibold text-ink">{taka(stockValue, stockValue % 1 ? 2 : 0)}</p>
            <p className="mt-0.5 text-[11px] text-ink-400">At purchase price</p>
          </div>
          <div className="rounded-lg border border-ink-100 p-3">
            <p className="text-xs text-ink-500">Purchase / Selling</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {taka(product.purchasePrice, product.purchasePrice % 1 ? 2 : 0)} / {taka(product.sellPrice, product.sellPrice % 1 ? 2 : 0)}
            </p>
            <p className="mt-0.5 text-[11px] text-ink-400">Per {product.unit}</p>
          </div>
          <div className="rounded-lg border border-ink-100 p-3">
            <p className="text-xs text-ink-500">Units</p>
            <p className="mt-1 text-sm font-semibold text-ink">
              {product.altUnit ? `${product.altUnit.unit} / ${product.unit}` : product.unit}
            </p>
            {product.altUnit && <p className="mt-0.5 text-[11px] text-ink-400">1 {product.altUnit.unit} = {product.altUnit.factor} {product.unit}</p>}
          </div>
        </div>

        <div className="rounded-lg border border-ink-100">
          <div className="border-b border-ink-100 px-3 py-2.5">
            <p className="text-[13px] font-semibold text-ink">Available stock lots</p>
          </div>
          <div className="divide-y divide-ink-100">
            {productLots.slice(0, 4).map((lot) => (
              <div key={lot.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px]">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{lot.label}</p>
                  <p className="text-[11px] text-ink-400">{lot.receivedAt}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-ink">{formatStock({ ...product, stock: lot.available })}</p>
                  <p className="text-[11px] text-ink-400">{taka(lot.unitCost)}/{product.unit}</p>
                </div>
              </div>
            ))}
            {productLots.length === 0 && <p className="px-3 py-5 text-center text-sm text-ink-500">No available lots.</p>}
          </div>
        </div>

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
    return toBaseQuantity(
      quantity,
      selectedUnit,
      product.unit,
      product.altUnit?.unit,
      product.altUnit?.factor ?? 1
    );
  }, [product, quantity, selectedUnit]);

  if (!product) return null;

  const previewStock =
    mode === 'Add stock'
      ? product.stock + baseQty
      : mode === 'Remove stock'
        ? product.stock - baseQty
        : baseQty;

  const save = () => {
    if (!baseQty && mode !== 'Set exact stock') {
      setError('Enter a quantity.');
      return;
    }
    if (previewStock < 0) {
      setError('This adjustment would make stock negative. Use Set exact stock if you need a manual correction.');
      return;
    }

    onSave({
      newStock: previewStock,
      delta: previewStock - product.stock,
      reason,
      note: note.trim()
    });
    setQuantity('');
    setNote('');
    setError('');
    setMode('Add stock');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust stock <span className="font-bn text-sm font-normal text-ink-500">স্টক সমন্বয়</span></DialogTitle>
          <DialogDescription>{product.name} · Current {formatStock(product)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-ink-50 p-1">
            {(['Add stock', 'Remove stock', 'Set exact stock'] as StockAdjustmentMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => { setMode(item); setError(''); }}
                className={`rounded-md px-2 py-2 text-xs font-medium ${mode === item ? 'bg-white text-ink shadow-card' : 'text-ink-500 hover:text-ink'}`}>
                {item}
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">Quantity <span className="font-bn text-[11px] font-normal text-ink-400">পরিমাণ</span></label>
            <div className="flex gap-2">
              <Input
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value.replace(/[^\d.]/g, '')); setError(''); }}
                inputMode="decimal"
                placeholder="0"
                className="text-right"
                autoFocus
              />
              <FormSelect value={selectedUnit} onChange={(e) => setUnit(e.target.value)} options={units} className="w-32 shrink-0" />
            </div>
            {product.altUnit && selectedUnit !== product.unit && quantity && (
              <p className="mt-1 text-xs text-ink-500">{quantity} {selectedUnit} = {baseQty} {product.unit}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">Reason</label>
            <FormSelect
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              options={['Count correction', 'Damage / loss', 'Found stock', 'Personal use', 'Data correction', 'Other']}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">Note <span className="text-xs font-normal text-ink-400">optional</span></label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why is this stock being adjusted?" />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2.5 text-sm">
            <span className="text-ink-600">Stock after adjustment</span>
            <span className="font-semibold text-ink">{formatStock({ ...product, stock: Math.max(0, previewStock) })}</span>
          </div>

          {error && <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save adjustment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
