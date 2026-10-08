import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search } from 'lucide-react';
import { ProductThumb } from '../ProductThumb';
import type { Product } from '../../types/erp';
import { taka } from '../../utils/currency';
import { formatStock } from '../../utils/units';

type Props = {
  products: Product[];
  onAdd: (product: Product) => void;
  onCreate: () => void;
};

type PopupPosition = { top: number; left: number; width: number; maxHeight: number };
const MARGIN = 8;
const GAP = 6;

/** POS-style floating product picker, outside the scrollable cart. */
export const PurchaseProductSearch = forwardRef<HTMLInputElement, Props>(function PurchaseProductSearch(
  { products, onAdd, onCreate }, ref
) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<PopupPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  }, [ref]);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return products.filter((p) => p.active && p.kind !== 'Service' &&
      (!q || [p.name, p.nameBn ?? '', p.sku ?? '', p.category].some((value) =>
        value.toLocaleLowerCase().includes(q)))).slice(0, 10);
  }, [products, query]);

  const choose = (product: Product) => {
    onAdd(product);
    setQuery('');
    setActive(0);
    setOpen(false);
  };

  const updatePosition = useCallback(() => {
    if (!open || !inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const width = Math.min(Math.max(rect.width, 560), viewportWidth - MARGIN * 2);
    const left = Math.max(MARGIN, Math.min(rect.left, viewportWidth - width - MARGIN));
    const preferredHeight = Math.min(popupRef.current?.scrollHeight ?? 360, viewportHeight - MARGIN * 2);
    const below = viewportHeight - rect.bottom - GAP - MARGIN;
    const above = rect.top - GAP - MARGIN;
    const opensUp = preferredHeight > below && above > below;
    const preferredTop = opensUp ? rect.top - GAP - preferredHeight : rect.bottom + GAP;
    const top = Math.max(MARGIN, Math.min(preferredTop, viewportHeight - preferredHeight - MARGIN));
    const next = { top, left, width, maxHeight: Math.max(120, viewportHeight - MARGIN * 2) };
    setPosition((current) => current && Object.keys(next).every(
      (key) => current[key as keyof PopupPosition] === next[key as keyof PopupPosition]
    ) ? current : next);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) { setPosition(null); return; }
    updatePosition();
    const frame = window.requestAnimationFrame(updatePosition);
    return () => window.cancelAnimationFrame(frame);
  }, [open, results.length, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const outsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popupRef.current?.contains(target)) setOpen(false);
    };
    const outsideFocus = (event: FocusEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popupRef.current?.contains(target)) setOpen(false);
    };
    const movePopup = () => updatePosition();
    document.addEventListener('pointerdown', outsidePointer);
    document.addEventListener('focusin', outsideFocus);
    window.addEventListener('resize', movePopup);
    window.addEventListener('scroll', movePopup, true);
    return () => {
      document.removeEventListener('pointerdown', outsidePointer);
      document.removeEventListener('focusin', outsideFocus);
      window.removeEventListener('resize', movePopup);
      window.removeEventListener('scroll', movePopup, true);
    };
  }, [open, updatePosition]);

  const popup = typeof document !== 'undefined' && open
    ? createPortal(
      <div ref={popupRef} className="fixed z-[110] overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-pop scrollbar-thin"
        style={{
          top: position?.top ?? 0,
          left: position?.left ?? 0,
          width: position?.width ?? Math.min(560, window.innerWidth - MARGIN * 2),
          maxHeight: position?.maxHeight ?? 'calc(100vh - 16px)',
          visibility: position ? 'visible' : 'hidden'
        }}>
        <div id="purchase-product-options" role="listbox" aria-label="Purchase product suggestions">
          {results.map((product, index) => (
            <button key={product.id} id={'purchase-product-' + product.id}
              type="button" role="option" aria-selected={active === index}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(product)}
              className={'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-teal-50 ' + (active === index ? 'bg-teal-50' : '')}>
              <ProductThumb src={product.image} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink">{product.name}</span>
                <span className="block truncate text-[11px] text-ink-500"><span className="font-bn">{product.nameBn}</span>{product.nameBn ? ' · ' : ''}{product.category} · Stock {formatStock(product)}</span>
              </span>
              <span className="shrink-0 text-right text-xs font-medium text-ink-600">{taka(product.purchasePrice)}
                <span className="block text-[10px] font-normal text-ink-400">/{product.unit}</span>
              </span>
            </button>
          ))}
          {results.length === 0 && <p className="px-3 py-3 text-[12px] text-ink-500">No matching product. Create it without leaving this purchase.</p>}
        </div>
        <button type="button" onMouseDown={(event) => event.preventDefault()}
          onClick={() => { setOpen(false); onCreate(); }}
          className="mt-1 flex w-full items-center gap-2 rounded-md border-t border-border px-3 py-2 text-left text-[13px] font-medium text-teal-700 hover:bg-teal-50">
          <Plus className="size-4" /> Create new product {query.trim() ? '· ' + query.trim() : ''}
        </button>
      </div>, document.body
    ) : null;

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-teal-600" aria-hidden="true" />
      <input ref={setInputRef} role="combobox" aria-label="Search product to add to purchase"
        aria-expanded={open} aria-controls="purchase-product-options" aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? 'purchase-product-' + results[active].id : undefined}
        value={query}
        placeholder="Add product… name or বাংলা"
        onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
          if (event.key === 'ArrowDown') {
            event.preventDefault(); setOpen(true); setActive((index) => Math.min(index + 1, Math.max(0, results.length - 1)));
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault(); setOpen(true); setActive((index) => Math.max(0, index - 1));
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            if (results[active]) choose(results[active]);
            else if (query.trim()) { setOpen(false); onCreate(); }
          }
        }}
        className="h-10 w-full rounded-lg border border-dashed border-teal-400 bg-teal-50/40 pl-8 pr-12 text-[13px] text-ink placeholder:text-ink-500 focus:border-solid focus:border-teal-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-ink-200 bg-card px-1.5 text-[10px] text-ink-500">F2</kbd>
      {popup}
    </div>
  );
});
