import React, { useMemo, useState } from 'react';
import { Download, MoreHorizontal, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { ProductThumb } from '../components/ProductThumb';
import { StatusBadge, type StatusTone } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { AddProductDialog } from '../components/products/AddProductDialog';
import { FloatingPanel } from '../components/layout/FloatingPanel';
import { ProductSettings } from '../components/products/ProductSettings';
import { productCategories, products as seed } from '../data/products';
import type { Product } from '../types/erp';
import { formatStock, stockStatus, type StockStatus } from '../utils/units';
import { taka } from '../utils/currency';

const statusMeta: Record<StockStatus, {label: string;tone: StatusTone;}> = {
  in: { label: 'In stock', tone: 'success' },
  low: { label: 'Low stock', tone: 'warning' },
  out: { label: 'Out of stock', tone: 'danger' },
  inactive: { label: 'Inactive', tone: 'neutral' }
};

type StockFilter = 'all' | 'low' | 'out';
function ProductActions({
  product,
  onDuplicate,
  onToggle
}: {
  product: Product;
  onDuplicate: () => void;
  onToggle: () => void;
}) {
  return (
    <FloatingPanel
      label={`Actions for ${product.name}`}
      width={190}
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={`Actions for ${product.name}`}
          className="rounded-md p-1 text-ink-400 hover:bg-ink-50 hover:text-ink">
          <MoreHorizontal className="size-4" />
        </button>
      )}>
      {(close) => (
        <div className="py-1">
          <button
            type="button"
            onClick={() => { close(); toast(`Edit product · ${product.name}`); }}
            className="w-full px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
            Edit product
          </button>
          <button
            type="button"
            onClick={() => { close(); toast(`Adjust stock · ${product.name}`); }}
            className="w-full px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
            Adjust stock
          </button>
          <button
            type="button"
            onClick={() => { close(); onDuplicate(); }}
            className="w-full px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
            Duplicate
          </button>
          <button
            type="button"
            onClick={() => { close(); onToggle(); }}
            className="w-full px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
            {product.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )}
    </FloatingPanel>
  );
}

type ProductView = 'list' | 'settings';

export function Products() {
  const [view, setView] = useState<ProductView>('list');
  const [list, setList] = useState<Product[]>(seed);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      const s = stockStatus(p);
      if (stockFilter === 'low' && s !== 'low') return false;
      if (stockFilter === 'out' && s !== 'out') return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.nameBn ?? '').includes(q);
    });
  }, [list, query, category, stockFilter]);

  const stockValue = list.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
  const lowCount = list.filter((p) => stockStatus(p) === 'low').length;
  const outCount = list.filter((p) => stockStatus(p) === 'out').length;

  const summary = [
  { label: 'Products', value: String(list.length), sub: `${list.filter((p) => p.active).length} active` },
  { label: 'Stock value', value: taka(stockValue), sub: 'At purchase price' },
  { label: 'Low stock', value: String(lowCount), sub: 'Below minimum', tone: 'text-warning' },
  { label: 'Out of stock', value: String(outCount), sub: 'Needs reorder', tone: 'text-danger' }];


  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Products"
        titleBn="পণ্য তালিকা"
        description={view === 'list' ? 'Stock, units and prices for everything you sell.' : 'Categories, units, brands and defaults used across the product module.'}
        actions={view === 'list' ? (
          <>
            <Button variant="outline" size="sm" onClick={() => toast('Exported products.xlsx')}>
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" /> Add product
            </Button>
          </>
        ) : undefined} />
      

      <div className="flex flex-nowrap gap-1 overflow-x-auto border-b border-ink-100 scrollbar-thin" role="tablist">
        {([
          ['list', 'Product list', 'পণ্য তালিকা'],
          ['settings', 'Product settings', 'পণ্য সেটিংস']
        ] as Array<[ProductView, string, string]>).map(([id, label, bn]) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={`-mb-px flex shrink-0 items-baseline gap-1.5 border-b-2 px-2.5 py-2.5 text-[13px] font-medium ${view === id ? 'border-teal-600 text-ink' : 'border-transparent text-ink-500 hover:text-ink'}`}>
            {label} <span className="font-bn text-[10.5px] font-normal text-ink-400">· {bn}</span>
          </button>
        ))}
      </div>

      {view === 'list' && (
        <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) =>
        <div key={s.label} className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
            <p className="text-[12.5px] text-ink-500">{s.label}</p>
            <p className={`mt-0.5 text-lg font-semibold ${s.tone ?? 'text-ink'}`}>{s.value}</p>
            <p className="text-[11px] text-ink-400">{s.sub}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, বাংলা, SKU…"
              aria-label="Search products"
              className="h-8 w-full rounded-md border border-ink-100 pl-8 pr-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
            
          </div>
          <div className="flex flex-wrap gap-1">
            {productCategories.map((c) =>
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`h-8 rounded-md px-2.5 text-xs font-medium transition-colors ${
              category === c ? 'bg-ink text-white' : 'text-ink-600 hover:bg-ink-50'}`
              }>
              
                {c}
              </button>
            )}
          </div>
          <div className="ml-auto flex rounded-md bg-ink-50 p-0.5" role="radiogroup" aria-label="Stock filter">
            {(
            [
            ['all', 'All stock'],
            ['low', `Low (${lowCount})`],
            ['out', `Out (${outCount})`]] as
            [StockFilter, string][]).
            map(([id, label]) =>
            <button
              key={id}
              role="radio"
              aria-checked={stockFilter === id}
              onClick={() => setStockFilter(id)}
              className={`h-7 rounded px-2.5 text-xs font-medium ${stockFilter === id ? 'bg-white text-ink shadow-card' : 'text-ink-500'}`}>
              
                {label}
              </button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 w-10 pl-4 text-xs">#</TableHead>
              <TableHead className="h-9 text-xs">Product</TableHead>
              <TableHead className="h-9 text-xs">Category</TableHead>
              <TableHead className="h-9 text-right text-xs">Stock</TableHead>
              <TableHead className="h-9 text-xs">Unit</TableHead>
              <TableHead className="h-9 text-right text-xs">Purchase</TableHead>
              <TableHead className="h-9 text-right text-xs">Selling</TableHead>
              <TableHead className="h-9 text-xs">Status</TableHead>
              <TableHead className="h-9 w-10 pr-4"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p, i) => {
              const s = stockStatus(p);
              return (
                <TableRow key={p.id} className="text-[13px]">
                  <TableCell className="py-2 pl-4 text-ink-400">{i + 1}.</TableCell>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2.5">
                      <ProductThumb src={p.image} size={34} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">{p.name}</p>
                        <p className="truncate text-[11px] text-ink-500">
                          {p.nameBn && <span className="font-bn">{p.nameBn}</span>}
                          {p.nameBn ? ' · ' : ''}{p.sku}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 text-ink-600">{p.category}</TableCell>
                  <TableCell className={`py-2 text-right font-medium ${s === 'low' ? 'text-warning' : s === 'out' ? 'text-danger' : 'text-ink'}`}>
                    {formatStock(p)}
                    <span className="block text-[11px] font-normal text-ink-400">min {formatStock({ ...p, stock: p.minStock })}</span>
                  </TableCell>
                  <TableCell className="py-2 text-ink-600">
                    {p.altUnit ?
                    <span>
                        {p.altUnit.unit} / {p.unit}
                        <span className="block text-[11px] text-ink-400">1 {p.altUnit.unit} = {p.altUnit.factor} {p.unit}</span>
                      </span> :

                    p.unit
                    }
                  </TableCell>
                  <TableCell className="py-2 text-right text-ink-600">
                    {taka(p.purchasePrice, p.purchasePrice % 1 ? 2 : 0)}
                  </TableCell>
                  <TableCell className="py-2 text-right font-medium text-ink">
                    {taka(p.sellPrice, p.sellPrice % 1 ? 2 : 0)}
                    <span className="font-normal text-ink-400">/{p.unit}</span>
                    {p.altUnit &&
                    <span className="block text-[11px] font-normal text-ink-500">
                        {taka(p.altUnit.price ?? p.sellPrice * p.altUnit.factor)}/{p.altUnit.unit}
                      </span>
                    }
                  </TableCell>
                  <TableCell className="py-2">
                    <StatusBadge tone={statusMeta[s].tone} dot>{statusMeta[s].label}</StatusBadge>
                  </TableCell>
                  <TableCell className="py-2 pr-4">
                    <ProductActions
                      product={p}
                      onDuplicate={() => {
                        const copy = { ...p, id: `p${Date.now()}`, name: `${p.name} Copy`, sku: `${p.sku}-COPY` };
                        setList((items) => [copy, ...items]);
                        toast.success(`${p.name} duplicated`);
                      }}
                      onToggle={() => setList((items) => items.map((item) => item.id === p.id ? { ...item, active: !item.active } : item))}
                    />
                  </TableCell>
                </TableRow>);

            })}
          </TableBody>
        </Table>

        {filtered.length === 0 &&
        <div className="px-4 py-10 text-center">
            <p className="font-medium text-ink">No products match</p>
            <p className="mt-1 text-sm text-ink-500">Try another search or clear filters.</p>
            <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setQuery('');
              setCategory('All');
              setStockFilter('all');
            }}>
            
              Clear filters
            </Button>
          </div>
        }

        <div className="flex items-center justify-between border-t border-ink-100 px-4 py-2.5 text-xs text-ink-500">
          <span>
            Showing {filtered.length} of {list.length} products
          </span>
          <span>Prices include VAT where applicable</span>
        </div>
      </div>

        </>
      )}

      {view === 'settings' && (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card">
          <ProductSettings />
        </div>
      )}

      <AddProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={(p) => {
          setList((l) => [p, ...l]);
          setDialogOpen(false);
          toast.success(`${p.name} added`, { description: p.altUnit ? `1 ${p.altUnit.unit} = ${p.altUnit.factor} ${p.unit}` : undefined });
        }} />
      
    </div>);

}