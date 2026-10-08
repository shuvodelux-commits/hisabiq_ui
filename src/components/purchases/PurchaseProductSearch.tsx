import React, { forwardRef, useMemo, useState } from 'react';
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

export const PurchaseProductSearch = forwardRef<HTMLInputElement, Props>(function PurchaseProductSearch({ products, onAdd, onCreate }, ref) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return products.filter((p) => p.active && p.kind !== 'Service' && (
      !q || [p.name, p.nameBn ?? '', p.sku, p.category].some((text) => text.toLocaleLowerCase().includes(q))
    )).slice(0, 10);
  }, [products, query]);

  const choose = (product: Product) => {
    onAdd(product);
    setQuery('');
    setActive(0);
    setOpen(false);
  };

  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
      <input
        ref={ref}
        role="combobox"
        aria-label="Search product to add to purchase"
        aria-expanded={open}
        aria-controls="purchase-product-options"
        aria-autocomplete="list"
        value={query}
        placeholder="Search product name, Bangla name or SKU · পণ্য খুঁজুন"
        onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)}
        onBlur={(event) => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node)) setOpen(false); }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
          if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, results.length - 1)); }
          if (event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); setActive((i) => Math.max(i - 1, 0)); }
          if (event.key === 'Enter') {
            event.preventDefault();
            if (results.length) choose(results[Math.min(active, results.length - 1)]);
            else onCreate();
          }
        }}
        className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-[13px] text-ink focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      />
      {open && (
        <div id="purchase-product-options" role="listbox" className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-pop">
          {results.map((product, index) => (
            <button
              key={product.id}
              type="button"
              role="option"
              aria-selected={active === index}
              onPointerDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => choose(product)}
              className={'flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-teal-50 ' + (active === index ? 'bg-teal-50' : '')}>
              <ProductThumb src={product.image} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-ink">{product.name}</span>
                <span className="block truncate text-[11px] text-ink-500"><span className="font-bn">{product.nameBn}</span>{product.nameBn ? ' · ' : ''}{product.category} · Stock {formatStock(product)}</span>
              </span>
              <span className="shrink-0 text-right text-xs font-medium text-ink-600">{taka(product.purchasePrice)}<span className="block text-[10px] font-normal text-ink-400">/{product.unit}</span></span>
            </button>
          ))}
          {results.length === 0 && <p className="px-3 py-3 text-xs text-ink-500">No product found. Add it without leaving this purchase.</p>}
          <button type="button" onPointerDown={(event) => event.preventDefault()} onClick={() => { setOpen(false); onCreate(); }}
            className="mt-1 flex w-full items-center gap-2 rounded-md border-t border-border px-2 py-2 text-left text-[13px] font-medium text-teal-700 hover:bg-teal-50">
            <Plus className="size-4" /> Create new product {query.trim() ? 'for ' + query.trim() : ''}
          </button>
        </div>
      )}
    </div>
  );
});
