import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { AlertTriangle, Eye, GripVertical, ScanLine, X } from 'lucide-react';
import { ProductCombobox } from './ProductCombobox';
import { CompoundQuantityInput } from '../transactions/CompoundQuantityInput';
import { ProductThumb } from '../ProductThumb';
import { SerialPickerDialog } from './SerialPickerDialog';
import { StockShortageDialog } from './StockShortageDialog';
import type { CartLine } from '../../hooks/usePosCart';
import type { Product } from '../../types/erp';
import { formatStock, unitsFor } from '../../utils/units';
import { formatNumber, taka } from '../../utils/currency';
import { compoundBaseQuantity, compoundLineTotal, normalizeCompoundQuantity } from '../../utils/posQuantity';
import { stockLots } from '../../data/productInventory';
import { salesInvoices } from '../../data/sales';
import { availableSerials, productStockBreakdown, requiredSerialCount } from '../../utils/productFeatures';
import { quantityFromBaseStock, saleAvailableStock, saleStockShortage } from '../../utils/posStock';

type CartTableProps = {
  lines: CartLine[];
  lastAdded: string | null;
  onAdd: (p: Product) => void;
  onUpdate: (key: string, patch: Partial<Pick<CartLine, 'qty' | 'secondaryQty' | 'unit' | 'price' | 'serials' | 'stockSource'>>) => void;
  onRemove: (key: string) => void;
  onReorder: (orderedKeys: string[]) => void;
  onMove: (key: string, delta: number) => void;
  searchRef: React.RefObject<HTMLInputElement>;
};

const grid = 'grid min-w-[850px] grid-cols-[56px_minmax(180px,1fr)_168px_108px_96px_104px_28px] items-center gap-2';

const cellInput =
'h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-right text-sm text-ink hover:border-border focus:border-teal-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-teal-500/20';

/** Drag only from the handle, leaving numeric inputs and product actions fully interactive. */
function SortableCartRow({
  line, index, count, onMove, children
}: {
  line: CartLine;
  index: number;
  count: number;
  onMove: (key: string, delta: number) => void;
  children: React.ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="div"
      value={line.key}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      data-testid="pos-cart-row"
      data-line-key={line.key}
      className={`${grid} relative bg-card px-3 py-1.5`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.16 }}
      whileDrag={{ zIndex: 20, boxShadow: '0 4px 16px rgba(15, 23, 42, 0.13)' }}
    >
      <div className="flex items-center justify-end gap-1">
        <span className="text-right text-sm text-ink-400">{index + 1}.</span>
        <button
          type="button"
          data-testid="pos-drag-handle"
          aria-label={`Reorder ${line.product.name}, position ${index + 1} of ${count}`}
          aria-keyshortcuts="ArrowUp ArrowDown"
          title="Drag to reorder · use ↑/↓ keys"
          onPointerDown={(event) => controls.start(event)}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
            event.preventDefault();
            event.stopPropagation();
            onMove(line.key, event.key === 'ArrowUp' ? -1 : 1);
          }}
          style={{ touchAction: 'none' }}
          className="flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-ink-400 hover:bg-ink-50 hover:text-teal-700 active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500"
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </button>
      </div>
      {children}
    </Reorder.Item>
  );
}

export function CartTable({ lines, lastAdded, onAdd, onUpdate, onRemove, onReorder, onMove, searchRef }: CartTableProps) {
  const qtyRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const secondaryQtyRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [revealedPurchase, setRevealedPurchase] = useState<string | null>(null);
  const [serialLine, setSerialLine] = useState<CartLine | null>(null);
  const [shortageLine, setShortageLine] = useState<CartLine | null>(null);
  const soldSerials = useMemo(() => salesInvoices.flatMap((invoice) => invoice.lines.flatMap((line) => line.serials ?? [])), []);

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
  const commitSecondary = (line: CartLine, focusSearch: boolean) => {
    const factor = line.product.altUnit && line.unit === line.product.altUnit.unit
      ? line.product.altUnit.factor
      : 1;
    onUpdate(line.key, normalizeCompoundQuantity(line.qty, line.secondaryQty, factor));
    if (focusSearch) searchRef.current?.focus();
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
      <div className={`${grid} border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-ink-400`}>
        <span className="text-right">#</span>
        <span>Product</span>
        <span className="text-right">Quantity</span>
        <span>Price in</span>
        <span className="text-right">Price</span>
        <span className="text-right">Total</span>
        <span className="sr-only">Remove</span>
      </div>

      <div data-testid="pos-cart">
        <Reorder.Group as="div" axis="y" values={lines.map((line) => line.key)} onReorder={onReorder}
          className="divide-y divide-border">
          <AnimatePresence initial={false}>
          {lines.map((l, i) => {
            const factor = l.product.altUnit && l.unit === l.product.altUnit.unit ? l.product.altUnit.factor : 1;
            const baseQty = compoundBaseQuantity(l.qty, l.secondaryQty, factor);
            const lineTotal = compoundLineTotal(l.qty, l.secondaryQty, factor, l.price);
            const purchasePrice = factor > 1 ? l.product.purchasePrice * factor : l.product.purchasePrice;
            const units = unitsFor(l.product);
            const shortage = saleStockShortage(l.product, stockLots, baseQty);
            return (
              <SortableCartRow key={l.key} line={l} index={i} count={lines.length} onMove={onMove}>
                <div className="flex min-w-0 items-center gap-2.5">
                  <ProductThumb src={l.product.image} size={32} />
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium text-ink">{l.product.name}</p>
                    <p className="truncate text-[11px] text-ink-500">
                      {l.product.nameBn && <span className="font-bn">{l.product.nameBn} · </span>}
                      {l.product.category}{l.product.kind === 'Service' ? ' · Service' : l.product.expiry?.enabled ? ` · Sellable ${formatStock({ ...l.product, stock: productStockBreakdown(l.product, stockLots).sellable })}` : ` · Stock ${formatStock(l.product)}`}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      {l.product.serialTracking && l.product.serialTracking !== 'Off' && (
                        <button
                          type="button"
                          onClick={() => setSerialLine(l)}
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium ${
                            (l.product.serialTracking === 'Required' && l.serials.length !== requiredSerialCount(l.product, baseQty)) ||
                            l.serials.length > Math.ceil(baseQty)
                              ? 'bg-warning-bg text-warning'
                              : 'bg-teal-50 text-teal-700'
                          }`}>
                          <ScanLine className="size-3" />
                          Serials {l.serials.length}/{Math.max(requiredSerialCount(l.product, baseQty), Math.ceil(baseQty))}
                        </button>
                      )}
                      {shortage > 0 && (
                        <button
                          type="button"
                          onClick={() => setShortageLine(l)}
                          className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium ${
                            !l.stockSource
                              ? 'bg-danger-bg text-danger'
                              : l.stockSource.mode === 'Negative'
                                ? 'bg-warning-bg text-warning'
                                : 'bg-blue-50 text-blue-700'
                          }`}>
                          <AlertTriangle className="size-3" />
                          {!l.stockSource
                            ? `Short ${formatStock({ ...l.product, stock: shortage })} · choose source`
                            : l.stockSource.mode === 'Negative'
                              ? `Negative sale · ${formatStock({ ...l.product, stock: shortage })}`
                              : `${l.stockSource.vendorName} · ${formatStock({ ...l.product, stock: shortage })}`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <CompoundQuantityInput key={l.unit} product={l.product} unit={l.unit} primary={l.qty} secondary={l.secondaryQty}
                  primaryRef={el=>{qtyRefs.current[l.key]=el;}} secondaryRef={el=>{secondaryQtyRefs.current[l.key]=el;}}
                  primaryLabel={factor>1?`${l.product.altUnit!.unit} quantity for ${l.product.name}`:`Quantity for ${l.product.name}`}
                  secondaryLabel={`${l.product.unit} quantity for ${l.product.name}`}
                  onPrimaryChange={value=>onUpdate(l.key,{qty:value})}
                  onSecondaryChange={value=>onUpdate(l.key,{secondaryQty:value})}
                  onPrimaryEnter={()=>{if(factor>1){secondaryQtyRefs.current[l.key]?.focus();secondaryQtyRefs.current[l.key]?.select();}else searchRef.current?.focus();}}
                  onSecondaryBlur={()=>commitSecondary(l,false)}
                  onSecondaryEnter={()=>commitSecondary(l,true)}/>
                {units.length > 1 ?
                <div className="flex h-9 rounded-md bg-ink-50 p-0.5" role="radiogroup" aria-label="Unit">
                    {units.map((u) =>
                  <button
                    key={u}
                    type="button"
                    role="radio"
                    aria-checked={l.unit === u}
                    onClick={() => onUpdate(l.key, { unit: u })}
                    className={`flex-1 rounded px-1 text-xs font-medium transition-colors ${
                    l.unit === u ? 'bg-card text-ink shadow-card ring-1 ring-primary' : 'text-ink-500 hover:text-ink'}`
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
                    className={`${cellInput} pl-6 pr-7`} />
                  <button
                    type="button"
                    aria-label={`Show purchase price for ${l.product.name}`}
                    aria-pressed={revealedPurchase === l.key}
                    onClick={() => setRevealedPurchase((current) => current === l.key ? null : l.key)}
                    className="absolute right-1.5 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-helper hover:bg-ink-50 hover:text-teal-700">
                    <Eye className="size-3.5" />
                  </button>
                  {revealedPurchase === l.key &&
                  <div className="absolute right-0 top-full z-30 mt-1 whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-[11px] text-ink-600 shadow-pop">
                      Cost {taka(purchasePrice, purchasePrice % 1 ? 2 : 0)}/{l.unit}
                    </div>
                  }
                </div>
                <span className="text-right text-sm font-semibold text-ink">
                  ৳{formatNumber(lineTotal, lineTotal % 1 ? 2 : 0)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(l.key)}
                  aria-label={`Remove ${l.product.name}`}
                  className="flex size-8 items-center justify-center rounded-md text-helper hover:bg-danger-bg hover:text-danger">
                  
                  <X className="size-4" />
                </button>
              </SortableCartRow>);

          })}
          </AnimatePresence>
        </Reorder.Group>
        <div data-testid="pos-add-row" className={`${grid} border-t border-border bg-teal-50/35 px-3 py-2`}>
          <span className="pr-3 text-right text-sm text-teal-600">{lines.length + 1}.</span>
          <ProductCombobox ref={searchRef} onSelect={onAdd} />
          <span className="pr-2 text-right text-sm text-helper">Qty</span>
          <span className="px-2 text-sm text-helper">Unit</span>
          <span className="pr-2 text-right text-sm text-helper">Price</span>
          <span className="text-right text-sm text-helper">Total</span>
          <span />
        </div>

      </div>

      {lines.length === 0 &&
      <p className="border-t border-border px-4 py-6 text-center text-sm text-ink-500">
          Cart is empty. Search above or tap a quick item below. <span className="font-bn">পণ্য যোগ করুন।</span>
        </p>
      }

      {serialLine && (() => {
        const factor = serialLine.product.altUnit && serialLine.unit === serialLine.product.altUnit.unit ? serialLine.product.altUnit.factor : 1;
        const baseQty = compoundBaseQuantity(serialLine.qty, serialLine.secondaryQty, factor);
        const blocked = lines.filter((line) => line.key !== serialLine.key).flatMap((line) => line.serials);
        return (
          <SerialPickerDialog
            product={serialLine.product}
            open
            onOpenChange={(open) => { if (!open) setSerialLine(null); }}
            eligible={[...new Set([...availableSerials(serialLine.product, stockLots).filter((serial) => !soldSerials.includes(serial)), ...serialLine.serials])]}
            selected={serialLine.serials}
            required={requiredSerialCount(serialLine.product, baseQty)}
            maxCount={Math.ceil(baseQty)}
            blocked={blocked}
            onSave={(serials) => {
              onUpdate(serialLine.key, { serials });
              setSerialLine(null);
            }}
          />
        );
      })()}

      {shortageLine && (() => {
        const factor = shortageLine.product.altUnit && shortageLine.unit === shortageLine.product.altUnit.unit ? shortageLine.product.altUnit.factor : 1;
        const baseQty = compoundBaseQuantity(shortageLine.qty, shortageLine.secondaryQty, factor);
        const available = saleAvailableStock(shortageLine.product, stockLots);
        const shortage = saleStockShortage(shortageLine.product, stockLots, baseQty);
        return (
          <StockShortageDialog
            line={shortageLine}
            availableBaseQty={available}
            shortageBaseQty={shortage}
            open
            onOpenChange={(open) => { if (!open) setShortageLine(null); }}
            onUseOwnStock={() => {
              if (available <= 0) {
                onRemove(shortageLine.key);
              } else {
                const useAlternate = Boolean(shortageLine.product.altUnit && shortageLine.unit === shortageLine.product.altUnit.unit);
                onUpdate(shortageLine.key, {
                  ...quantityFromBaseStock(available, factor, useAlternate),
                  stockSource: undefined
                });
              }
              setShortageLine(null);
            }}
            onResolve={(source) => {
              onUpdate(shortageLine.key, { stockSource: source });
              setShortageLine(null);
            }}
          />
        );
      })()}
    </div>);

}
