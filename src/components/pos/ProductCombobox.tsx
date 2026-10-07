import React, { forwardRef, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ProductThumb } from '../ProductThumb';
import { products } from '../../data/products';
import { stockLots } from '../../data/productInventory';
import { productOffers } from '../../data/productOffers';
import { formatStock, stockStatus } from '../../utils/units';
import { taka } from '../../utils/currency';
import type { Product } from '../../types/erp';
import { activeOfferFor, effectivePriceForUnit, productStockBreakdown } from '../../utils/productFeatures';

type ProductComboboxProps = {
  onSelect: (product: Product) => void;
};

export const ProductCombobox = forwardRef<HTMLInputElement, ProductComboboxProps>(function ProductCombobox(
{ onSelect },
ref)
{
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => p.active && (p.kind === 'Service' || !p.expiry?.enabled || productStockBreakdown(p, stockLots).sellable > 0));
    if (!q) return list.slice(0, 8);
    return list.
    filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.nameBn ?? '').includes(q)).
    slice(0, 8);
  }, [query]);

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
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-teal-600" aria-hidden="true" />
      <input
        ref={ref}
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
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        placeholder="Add product… name or বাংলা"
        className="h-10 w-full rounded-lg border border-dashed border-teal-400 bg-teal-50/40 pl-8 pr-12 text-sm text-ink placeholder:text-ink-500 focus:border-solid focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
      
      <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-ink-200 bg-white px-1.5 text-[10px] text-ink-500">
        F2
      </kbd>
      {open && results.length > 0 &&
      <ul
        id="pos-product-list"
        role="listbox"
        className="absolute left-0 top-full z-40 mt-1 max-h-80 w-[min(560px,90vw)] overflow-auto rounded-xl border border-ink-100 bg-white p-1 shadow-pop">
        
          {results.map((p, i) => {
          const status = stockStatus(p);
          const activeOffer = activeOfferFor(p.id, productOffers);
          const effectivePrice = effectivePriceForUnit(p, activeOffer, p.unit);
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
                    {activeOffer && <span className="mr-1 text-[10px] font-normal text-ink-400 line-through">{taka(p.sellPrice)}</span>}
                    {taka(effectivePrice, effectivePrice % 1 ? 2 : 0)}
                    <span className="font-normal text-ink-400">/{p.unit}</span>
                  </p>
                  <p className={`text-[11px] ${status === 'low' || status === 'out' ? 'text-danger' : 'text-ink-500'}`}>
                    {p.kind === 'Service' ? 'Service' : p.expiry?.enabled ? `Sellable ${formatStock({ ...p, stock: breakdown?.sellable ?? 0 })}` : status === 'out' ? 'Out of stock' : formatStock(p)}
                  </p>
                </div>
              </li>);

        })}
        </ul>
      }
    </div>);

});