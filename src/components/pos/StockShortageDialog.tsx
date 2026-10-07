import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, PackageCheck, TrendingDown, Truck } from 'lucide-react';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import { parties } from '../../data/parties';
import type { CartLine } from '../../hooks/usePosCart';
import type { SaleStockSource } from '../../types/erp';
import { taka } from '../../utils/currency';
import { formatStock } from '../../utils/units';

type Choice = 'Own' | 'Negative' | 'Vendor';

type StockShortageDialogProps = {
  line: CartLine | null;
  availableBaseQty: number;
  shortageBaseQty: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseOwnStock: () => void;
  onResolve: (source: SaleStockSource) => void;
};

const vendors = parties.filter((party) => party.roles.includes('Vendor'));

export function StockShortageDialog({
  line,
  availableBaseQty,
  shortageBaseQty,
  open,
  onOpenChange,
  onUseOwnStock,
  onResolve
}: StockShortageDialogProps) {
  const initialChoice: Choice = line?.stockSource?.mode === 'Vendor'
    ? 'Vendor'
    : line?.stockSource?.mode === 'Negative'
      ? 'Negative'
      : 'Own';
  const [choice, setChoice] = useState<Choice>(initialChoice);
  const [vendorId, setVendorId] = useState('');
  const [vendorCost, setVendorCost] = useState('');

  const factor = line?.product.altUnit && line.unit === line.product.altUnit.unit
    ? line.product.altUnit.factor
    : 1;
  const displayUnit = line?.unit ?? '';
  const vendor = vendors.find((item) => item.id === vendorId) ?? null;

  useEffect(() => {
    if (!open || !line) return;
    const source = line.stockSource;
    setChoice(source?.mode === 'Vendor' ? 'Vendor' : source?.mode === 'Negative' ? 'Negative' : 'Own');
    setVendorId(source?.mode === 'Vendor' ? source.vendorId : vendors[0]?.id ?? '');
    setVendorCost(source?.mode === 'Vendor' ? String(source.unitCost * factor) : '');
  }, [factor, line, open]);

  const ownStockLabel = useMemo(() => {
    if (!line) return '';
    return formatStock({ ...line.product, stock: availableBaseQty });
  }, [availableBaseQty, line]);

  if (!line) return null;

  const requestedBaseQty = availableBaseQty + shortageBaseQty;
  const requestedLabel = formatStock({ ...line.product, stock: requestedBaseQty });
  const shortageLabel = formatStock({ ...line.product, stock: shortageBaseQty });
  const costNumber = parseFloat(vendorCost) || 0;

  const save = () => {
    if (choice === 'Own') {
      onUseOwnStock();
      return;
    }
    if (choice === 'Negative') {
      onResolve({ mode: 'Negative' });
      return;
    }
    if (!vendor || costNumber <= 0) return;
    onResolve({
      mode: 'Vendor',
      vendorId: vendor.id,
      vendorName: vendor.name,
      unitCost: costNumber / factor
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Stock shortage <span className="font-bn text-sm font-normal text-ink-500">· স্টক কম</span></DialogTitle>
          <DialogDescription>
            {line.product.name}: requested {requestedLabel}, own sellable stock {ownStockLabel}. Choose how to handle {shortageLabel} shortage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setChoice('Own')}
            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${choice === 'Own' ? 'border-teal-400 bg-teal-50/60' : 'border-ink-100 hover:bg-ink-50'}`}>
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 ring-1 ring-ink-100">
              <PackageCheck className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">Own Stock <span className="font-bn text-xs font-normal text-ink-400">· নিজের স্টক</span></span>
              <span className="block text-xs text-ink-500">{availableBaseQty > 0 ? `Reduce this line to ${ownStockLabel}.` : 'No own stock is available; this removes the line.'}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setChoice('Negative')}
            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${choice === 'Negative' ? 'border-warning bg-warning-bg/70' : 'border-ink-100 hover:bg-ink-50'}`}>
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-warning ring-1 ring-ink-100">
              <TrendingDown className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">Negative Sale <span className="font-bn text-xs font-normal text-ink-400">· নেগেটিভ বিক্রি</span></span>
              <span className="block text-xs text-ink-500">Complete the sale now; the shortage remains negative until future stock is received.</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setChoice('Vendor')}
            className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${choice === 'Vendor' ? 'border-blue-300 bg-blue-50/70' : 'border-ink-100 hover:bg-ink-50'}`}>
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-ink-100">
              <Truck className="size-4" />
            </span>
            <span>
              <span className="block text-sm font-medium text-ink">Vendor <span className="font-bn text-xs font-normal text-ink-400">· ভেন্ডর থেকে</span></span>
              <span className="block text-xs text-ink-500">Source only the shortage from a vendor and record its cost.</span>
            </span>
          </button>
        </div>

        {choice === 'Vendor' && (
          <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-600">Vendor</span>
              <FormSelect value={vendorId} onChange={(event) => setVendorId(event.target.value)} options={vendors.map((item) => item.name)} />
            </label>
            <div>
              <p className="mb-1 text-xs font-medium text-ink-600">Vendor cost per {displayUnit}</p>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
                <Input
                  value={vendorCost}
                  onChange={(event) => setVendorCost(event.target.value.replace(/[^\d.]/g, ''))}
                  inputMode="decimal"
                  placeholder="0"
                  className="pl-7 text-right"
                />
              </div>
              {costNumber > 0 && factor > 1 && (
                <p className="mt-1 text-[11px] text-ink-500">
                  {taka(costNumber)} / {displayUnit} = {taka(costNumber / factor)} / {line.product.unit}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-ink-50 p-2.5 text-xs text-ink-500">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
          This choice applies to this cart line. Changing its quantity or unit asks you to review the shortage again.
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={choice === 'Vendor' && (!vendor || costNumber <= 0)}>
            {choice === 'Own' ? 'Use own stock' : choice === 'Negative' ? 'Allow negative sale' : 'Use vendor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
