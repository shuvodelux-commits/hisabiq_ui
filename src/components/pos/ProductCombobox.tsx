import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';
import { ProductThumb } from '../ProductThumb';
import { products } from '../../data/products';
import { stockLots } from '../../data/productInventory';
import { productOffers } from '../../data/productOffers';
import { formatStock, stockStatus, unitsFor } from '../../utils/units';
import { taka } from '../../utils/currency';
import type { Product } from '../../types/erp';
import { activeOfferFor, effectivePriceForUnit, productStockBreakdown } from '../../utils/productFeatures';

type ProductComboboxProps = {
  onSelect: (product: Product) => void;
};

type ListPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  opensUp: boolean;
};

const VIEWPORT_PADDING = 8;
const GAP = 6;
const DESIRED_WIDTH = 560;

export const ProductCombobox = forwardRef<HTMLInputElement, ProductComboboxProps>(function ProductCombobox(
{ onSelect },
ref)
{
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<ListPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => p.active && (p.kind === 'Service' || !p.expiry?.enabled || productStockBreakdown(p, stockLots).sellable > 0));
    if (!q) return list.slice(0, 8);
    return list.
    filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.nameBn ?? '').includes(q)).
    slice(0, 8);
  }, [query]);

  const updatePosition = useCallback(() => {
    if (!open || !inputRef.current) return;

    const triggerRect = inputRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const naturalHeight = listRef.current?.scrollHeight ?? 0;
    const maxViewportHeight = Math.max(120, viewportHeight - VIEWPORT_PADDING * 2);
    const panelHeight = Math.min(naturalHeight || maxViewportHeight, maxViewportHeight);
    const spaceBelow = viewportHeight - triggerRect.bottom - GAP - VIEWPORT_PADDING;
    const spaceAbove = triggerRect.top - GAP - VIEWPORT_PADDING;

    const opensUp = naturalHeight > 0 && naturalHeight > spaceBelow && spaceAbove > spaceBelow;
    const width = Math.min(
      Math.max(triggerRect.width, DESIRED_WIDTH),
      Math.max(0, viewportWidth - VIEWPORT_PADDING * 2)
    );
    const left = Math.min(
      Math.max(VIEWPORT_PADDING, triggerRect.left),
      Math.max(VIEWPORT_PADDING, viewportWidth - width - VIEWPORT_PADDING)
    );

    const preferredTop = opensUp
      ? triggerRect.top - GAP - panelHeight
      : triggerRect.bottom + GAP;

    const top = Math.min(
      Math.max(VIEWPORT_PADDING, preferredTop),
      Math.max(VIEWPORT_PADDING, viewportHeight - panelHeight - VIEWPORT_PADDING)
    );

    setPosition((current) => {
      const next = { top, left, width, maxHeight: maxViewportHeight, opensUp };
      if (
        current &&
        current.top === next.top &&
        current.left === next.left &&
        current.width === next.width &&
        current.maxHeight === next.maxHeight &&
        current.opensUp === next.opensUp
      ) {
        return current;
      }
      return next;
    });
  }, [open]);

  useLayoutEffect(() => {
    if (!open || results.length === 0) {
      setPosition(null);
      return;
    }
    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    return () => window.cancelAnimationFrame(frame);
  }, [open, results.length, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const onViewportChange = () => updatePosition();

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [open, updatePosition]);

  const choose = (p: Product) => {
    onSelect(p);
    setQuery('');
    setActive(0);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const listbox = typeof document !== 'undefined' && open && results.length > 0
    ? createPortal(
        <ul
          ref={listRef}
          id="pos-product-list"
          role="listbox"
          className="fixed z-[110] overflow-y-auto rounded-xl border border-ink-100 bg-white p-1 shadow-pop scrollbar-thin"
          style={{
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            width: position?.width ?? Math.min(DESIRED_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2),
            maxHeight: position?.maxHeight ?? `calc(100vh - ${VIEWPORT_PADDING * 2}px)`,
            visibility: position ? 'visible' : 'hidden'
          }}>
          {results.map((p, i) => {
            const status = stockStatus(p);
            const activeOffer = activeOfferFor(p.id, productOffers);
            const preferredUnit = p.stockViewUnit ?? p.altUnit?.unit ?? p.unit;
            const displayUnit = unitsFor(p).includes(preferredUnit) ? preferredUnit : p.unit;
            const normalPrice = effectivePriceForUnit(p, undefined, displayUnit);
            const effectivePrice = effectivePriceForUnit(p, activeOffer, displayUnit);
            const breakdown = p.kind === 'Service' ? null : productStockBreakdown(p, stockLots);
            return (
              <li
                key={p.id}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(p);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 ${i === active ? 'bg-teal-50' : ''}`}>
                <ProductThumb src={p.image} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{p.name}</p>
                  <p className="truncate text-[11px] text-ink-500">
                    <span className="font-bn">{p.nameBn}</span>{p.nameBn ? ' · ' : ''}{p.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-medium text-ink">
                    {activeOffer && <span className="mr-1 text-[10px] font-normal text-ink-400 line-through">{taka(normalPrice)}</span>}
                    {taka(effectivePrice, effectivePrice % 1 ? 2 : 0)}
                    <span className="font-normal text-ink-400">/{displayUnit}</span>
                  </p>
                  <p className={`text-[11px] ${status === 'low' || status === 'out' ? 'text-danger' : 'text-ink-500'}`}>
                    {p.kind === 'Service' ? 'Service' : p.expiry?.enabled ? `Sellable ${formatStock({ ...p, stock: breakdown?.sellable ?? 0 })}` : status === 'out' ? 'Out of stock' : formatStock(p)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>,
        document.body
      )
    : null;

  return (
    <div ref={rootRef} className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-teal-600" aria-hidden="true" />
      <input
        ref={setInputRef}
        role="combobox"
        aria-expanded={open}
        aria-controls="pos-product-list"
        aria-autocomplete="list"
        aria-label="Add product"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Add product… name or বাংলা"
        className="h-10 w-full rounded-lg border border-dashed border-teal-400 bg-teal-50/40 pl-8 pr-12 text-sm text-ink placeholder:text-ink-500 focus:border-solid focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
      <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-ink-200 bg-white px-1.5 text-[10px] text-ink-500">
        F2
      </kbd>
      {listbox}
    </div>
  );
});
