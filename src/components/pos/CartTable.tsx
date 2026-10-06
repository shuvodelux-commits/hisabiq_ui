import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ProductCombobox } from './ProductCombobox';
import { ProductThumb } from '../ProductThumb';
import type { CartLine } from '../../hooks/usePosCart';
import type { Product } from '../../types/erp';
import { formatStock, unitsFor } from '../../utils/units';
import { formatNumber } from '../../utils/currency';
import { compoundLineTotal } from '../../utils/posQuantity';

type CartTableProps = {
  lines: CartLine[];
  lastAdded: string | null;
  onAdd: (p: Product) => void;
  onUpdate: (key: string, patch: Partial<Pick<CartLine, 'qty' | 'secondaryQty' | 'unit' | 'price'>>) => void;
  onRemove: (key: string) => void;
  searchRef: React.RefObject<HTMLInputElement>;
};

const grid = 'grid min-w-[820px] grid-cols-[24px_minmax(180px,1fr)_168px_108px_96px_104px_28px] items-center gap-2';

const cellInput =
'h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-right text-sm text-ink hover:border-ink-100 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20';

export function CartTable({ lines, lastAdded, onAdd, onUpdate, onRemove, searchRef }: CartTableProps) {
  const qtyRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (lastAdded) {
      const el = qtyRefs.current[lastAdded];
      el?.focus();
      el?.select();
    }
  }, [lastAdded, lines.length]);

  const backToSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchRef.current?.focus();
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white shadow-card">
      <div className={`${grid} border-b border-ink-100 px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-ink-400`}>
        <span className="text-right">#</span>
        <span>Product</span>
        <span className="text-right">Qty</span>
        <span>Unit</span>
        <span className="text-right">Price</span>
        <span className="text-right">Total</span>
        <span className="sr-only">Remove</span>
      </div>

      <div className="divide-y divide-ink-100">
        <AnimatePresence initial={false}>
          {lines.map((l, i) => {
            const factor = l.product.altUnit && l.unit === l.product.altUnit.unit ? l.product.altUnit.factor : 1;
            const lineTotal = compoundLineTotal(l.qty, l.secondaryQty, factor, l.price);
            const units = unitsFor(l.product);
            return (
              <motion.div
                key={l.key}
                layout
                initial={{ opacity: 0, backgroundColor: '#EAF6F4' }}
                animate={{ opacity: 1, backgroundColor: '#FFFFFF' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className={`${grid} px-3 py-1.5`}>
                
                <span className="text-right text-sm tabular-nums text-ink-400">{i + 1}.</span>
                <div className="flex min-w-0 items-center gap-2.5">
                  <ProductThumb src={l.product.image} size={32} />
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium text-ink">{l.product.name}</p>
                    <p className="truncate text-[11px] text-ink-500">
                      {l.product.nameBn && <span className="font-bn">{l.product.nameBn} · </span>}
                      {l.product.category} · Stock {formatStock(l.product)}
                    </p>
                  </div>
                </div>
                <input
                  ref={(el) => {
                    qtyRefs.current[l.key] = el;
                  }}
                  aria-label={`Quantity for ${l.product.name}`}
                  value={l.qty}
                  inputMode="decimal"
                  onChange={(e) => onUpdate(l.key, { qty: e.target.value.replace(/[^\d.]/g, '') })}
                  onKeyDown={backToSearch}
                  className={`${cellInput} border-ink-100 bg-ink-50/50 font-medium`} />
                
                {units.length > 1 ?
                <div className="flex h-9 rounded-md bg-ink-50 p-0.5" role="radiogroup" aria-label="Unit">
                    {units.map((u) =>
                  <button
                    key={u}
                    role="radio"
                    aria-checked={l.unit === u}
                    onClick={() => onUpdate(l.key, { unit: u })}
                    className={`flex-1 rounded px-1 text-xs font-medium transition-colors ${
                    l.unit === u ? 'bg-white text-ink shadow-card ring-1 ring-ink-100' : 'text-ink-500 hover:text-ink'}`
                    }>
                    
                        {u}
                      </button>
                  )}
                  </div> :

                <span className="px-2 text-sm text-ink-600">{l.unit}</span>
                }
                <div className="relative">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-ink-400">৳</span>
                  <input
                    aria-label={`Price for ${l.product.name}`}
                    value={l.price}
                    inputMode="decimal"
                    onChange={(e) => onUpdate(l.key, { price: e.target.value.replace(/[^\d.]/g, '') })}
                    onKeyDown={backToSearch}
                    className={cellInput} />
                  
                </div>
                <span className="text-right text-sm font-semibold tabular-nums text-ink">
                  ৳{formatNumber(lineTotal, lineTotal % 1 ? 2 : 0)}
                </span>
                <button
                  onClick={() => onRemove(l.key)}
                  aria-label={`Remove ${l.product.name}`}
                  className="flex size-8 items-center justify-center rounded-md text-ink-300 hover:bg-danger-bg hover:text-danger">
                  
                  <X className="size-4" />
                </button>
              </motion.div>);

          })}
        </AnimatePresence>

      </div>

      {lines.length === 0 &&
      <p className="border-t border-ink-100 px-4 py-6 text-center text-sm text-ink-500">
          Cart is empty. Search above or tap a quick item below. <span className="font-bn">পণ্য যোগ করুন।</span>
        </p>
      }
    </div>);

}