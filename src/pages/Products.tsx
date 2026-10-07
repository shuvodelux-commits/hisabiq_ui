import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Download, MoreHorizontal, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { ProductThumb } from '../components/ProductThumb';
import { StatusBadge, type StatusTone } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { AddProductDialog, type ProductOpeningMeta } from '../components/products/AddProductDialog';
import { ManageOffersDialog, ProductDetailsDialog, StockAdjustmentDialog, StockLotDialog, type StockAdjustmentResult } from '../components/products/ProductInventoryDialogs';
import { StockHistoryView, StockLotsView } from '../components/products/ProductInventoryViews';
import { FloatingPanel } from '../components/layout/FloatingPanel';
import { ProductSettings } from '../components/products/ProductSettings';
import { productCategories, products as seed } from '../data/products';
import { stockLots as seedLots, stockMovements as seedMovements } from '../data/productInventory';
import { productOffers as seedOffers } from '../data/productOffers';
import { salesInvoices } from '../data/sales';
import type { Product, ProductOffer, StockLot, StockMovement } from '../types/erp';
import { formatStock, stockStatus, type StockStatus } from '../utils/units';
import { taka } from '../utils/currency';

const statusMeta: Record<StockStatus, {label: string;tone: StatusTone;}> = {
  in: { label: 'In stock', tone: 'success' },
  low: { label: 'Low stock', tone: 'warning' },
  out: { label: 'Out of stock', tone: 'danger' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  service: { label: 'Service', tone: 'info' }
};

type StockFilter = 'all' | 'low' | 'out';
type ProductColumn = 'index' | 'product' | 'category' | 'stock' | 'stockValue' | 'unit' | 'purchase' | 'selling' | 'status';

const productColumns: Array<{ id: ProductColumn; label: string }> = [
  { id: 'index', label: '#' },
  { id: 'product', label: 'Product' },
  { id: 'category', label: 'Category' },
  { id: 'stock', label: 'Stock' },
  { id: 'stockValue', label: 'Stock value' },
  { id: 'unit', label: 'Unit' },
  { id: 'purchase', label: 'Purchase' },
  { id: 'selling', label: 'Selling' },
  { id: 'status', label: 'Status' }
];

const defaultVisibleColumns: Record<ProductColumn, boolean> = {
  index: true,
  product: true,
  category: true,
  stock: true,
  stockValue: true,
  unit: true,
  purchase: true,
  selling: true,
  status: true
};

const columnStorageKey = 'hisabiq-products-visible-columns';

function ProductColumnPicker({
  visible,
  onToggle
}: {
  visible: Record<ProductColumn, boolean>;
  onToggle: (column: ProductColumn) => void;
}) {
  return (
    <FloatingPanel
      label="Choose product table columns"
      width={210}
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex h-8 items-center gap-2 rounded-md border border-ink-100 bg-white px-2.5 text-xs font-medium text-ink-700 hover:bg-ink-50">
          Columns
          <ChevronDown className={`size-3.5 text-ink-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}>
      {() => (
        <div className="py-1">
          {productColumns.map((column) => (
            <button
              key={column.id}
              type="button"
              role="menuitemcheckbox"
              aria-checked={visible[column.id]}
              onClick={() => onToggle(column.id)}
              className="flex w-full items-center justify-between gap-4 px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
              <span>{column.label}</span>
              {visible[column.id] && <Check className="size-4 text-ink" />}
            </button>
          ))}
        </div>
      )}
    </FloatingPanel>
  );
}

function ProductActions({
  product,
  onView,
  onEdit,
  onAdjust,
  onAddLot,
  onLots,
  onHistory,
  onOffers,
  onDuplicate,
  onToggle
}: {
  product: Product;
  onView: () => void;
  onEdit: () => void;
  onAdjust: () => void;
  onAddLot: () => void;
  onLots: () => void;
  onHistory: () => void;
  onOffers: () => void;
  onDuplicate: () => void;
  onToggle: () => void;
}) {
  const itemClass = 'w-full px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50';

  return (
    <FloatingPanel
      label={`Actions for ${product.name}`}
      width={210}
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
          <button type="button" onClick={() => { close(); onView(); }} className={itemClass}>View details</button>
          <button type="button" onClick={() => { close(); onEdit(); }} className={itemClass}>Edit product</button>
          {product.kind !== 'Service' && <button type="button" onClick={() => { close(); onAdjust(); }} className={itemClass}>Adjust stock</button>}
          {product.kind !== 'Service' && <button type="button" onClick={() => { close(); onAddLot(); }} className={itemClass}>Add stock lot</button>}
          <button type="button" onClick={() => { close(); onOffers(); }} className={itemClass}>Manage offers</button>
          <div className="my-1 border-t border-ink-100" />
          {product.kind !== 'Service' && <button type="button" onClick={() => { close(); onLots(); }} className={itemClass}>Stock lots & serials</button>}
          <button type="button" onClick={() => { close(); onHistory(); }} className={itemClass}>Product history</button>
          <button
            type="button"
            onClick={() => {
              close();
              void navigator.clipboard?.writeText(product.sku);
              toast.success('SKU copied', { description: product.sku });
            }}
            className={itemClass}>
            Copy SKU / barcode
          </button>
          <div className="my-1 border-t border-ink-100" />
          <button type="button" onClick={() => { close(); onDuplicate(); }} className={itemClass}>Duplicate</button>
          <button type="button" onClick={() => { close(); onToggle(); }} className={itemClass}>
            {product.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )}
    </FloatingPanel>
  );
}

type ProductView = 'list' | 'lots' | 'history' | 'settings';

export function Products() {
  const [view, setView] = useState<ProductView>('list');
  const [list, setList] = useState<Product[]>(seed);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [lotProduct, setLotProduct] = useState<Product | null>(null);
  const [offerProduct, setOfferProduct] = useState<Product | null>(null);
  const [lots, setLots] = useState<StockLot[]>(seedLots);
  const [movements, setMovements] = useState<StockMovement[]>(seedMovements);
  const [offers, setOffers] = useState<ProductOffer[]>(seedOffers);
  const [inventoryProductFilter, setInventoryProductFilter] = useState('');
  const soldSerials = useMemo(() => salesInvoices.flatMap((invoice) => invoice.lines.flatMap((line) => line.serials ?? [])), []);
  const knownSerials = useMemo(() => [...lots.flatMap((lot) => lot.serials ?? []), ...soldSerials], [lots, soldSerials]);
  const [visibleColumns, setVisibleColumns] = useState<Record<ProductColumn, boolean>>(() => {
    if (typeof window === 'undefined') return defaultVisibleColumns;
    try {
      const stored = window.localStorage.getItem(columnStorageKey);
      return stored ? { ...defaultVisibleColumns, ...JSON.parse(stored) } : defaultVisibleColumns;
    } catch {
      return defaultVisibleColumns;
    }
  });

  const toggleColumn = (column: ProductColumn) => {
    setVisibleColumns((current) => {
      const next = { ...current, [column]: !current[column] };
      try {
        window.localStorage.setItem(columnStorageKey, JSON.stringify(next));
      } catch {
        // Keep the current-session preference even when storage is unavailable.
      }
      return next;
    });
  };

  const openLots = (product: Product) => {
    setInventoryProductFilter(product.id);
    setView('lots');
  };

  const openHistory = (product: Product) => {
    setInventoryProductFilter(product.id);
    setView('history');
  };

  const applyAdjustment = (product: Product, result: StockAdjustmentResult) => {
    const today = new Date().toISOString().slice(0, 10);
    const reference = `ADJ-${String(movements.length + 1).padStart(4, '0')}`;

    setList((items) => items.map((item) => item.id === product.id ? { ...item, stock: result.newStock } : item));

    setLots((current) => {
      if (result.delta > 0) {
        const newLot: StockLot = {
          id: `lot-${product.id}-adj-${Date.now()}`,
          productId: product.id,
          label: 'Stock Adjustment',
          receivedAt: today,
          quantity: result.delta,
          available: result.delta,
          unitCost: product.purchasePrice,
          source: 'Adjustment',
          reference
        };
        return [newLot, ...current];
      }

      if (result.delta < 0) {
        let remaining = Math.abs(result.delta);
        return current.map((lot) => {
          if (lot.productId !== product.id || remaining <= 0 || lot.available <= 0) return lot;
          const deduction = Math.min(lot.available, remaining);
          remaining -= deduction;
          return { ...lot, available: lot.available - deduction };
        });
      }

      return current;
    });

    const movement: StockMovement = {
      id: `mov-${product.id}-adj-${Date.now()}`,
      productId: product.id,
      date: today,
      type: 'Adjustment',
      quantity: result.delta,
      balance: result.newStock,
      reference,
      note: result.note ? `${result.reason} · ${result.note}` : result.reason
    };
    setMovements((current) => [movement, ...current]);
    setAdjustProduct(null);
    toast.success('Stock adjusted', { description: `${product.name} · ${formatStock({ ...product, stock: result.newStock })}` });
  };

  const addLot = (product: Product, lot: StockLot) => {
    setLots((current) => [lot, ...current]);
    setList((items) => items.map((item) => item.id === product.id ? { ...item, stock: item.stock + lot.quantity } : item));
    setMovements((current) => [{
      id: `mov-${product.id}-purchase-${Date.now()}`,
      productId: product.id,
      date: lot.receivedAt,
      type: 'Purchase',
      quantity: lot.quantity,
      balance: product.stock + lot.quantity,
      reference: lot.reference,
      note: lot.expiryDate ? `Lot ${lot.batchNumber ?? '—'} · expiry ${lot.expiryDate}` : 'Stock lot received'
    }, ...current]);
    setLotProduct(null);
    toast.success('Stock lot added', { description: `${product.name} · +${formatStock({ ...product, stock: lot.quantity })}` });
  };

  const saveProductOffers = (product: Product, nextProductOffers: ProductOffer[]) => {
    setOffers((current) => [
      ...current.filter((offer) => offer.productId !== product.id),
      ...nextProductOffers
    ]);
    toast.success('Offers updated', { description: product.name });
  };

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
        description={
          view === 'list'
            ? 'Stock, units and prices for everything you sell.'
            : view === 'lots'
              ? 'See where current stock came from and what remains in each lot.'
              : view === 'history'
                ? 'Audit purchases, sales, returns and manual stock adjustments.'
                : 'Categories, units, brands and defaults used across the product module.'
        }
        actions={view === 'list' ? (
          <>
            <Button variant="outline" size="sm" onClick={() => toast('Exported products.xlsx')}>
              <Download className="size-4" /> Export
            </Button>
            <Button size="sm" onClick={() => { setEditingProduct(null); setDialogOpen(true); }}>
              <Plus className="size-4" /> Add product
            </Button>
          </>
        ) : undefined} />
      

      <div className="flex flex-nowrap gap-1 overflow-x-auto border-b border-ink-100 scrollbar-thin" role="tablist">
        {([
          ['list', 'Product list', 'পণ্য তালিকা'],
          ['lots', 'Stock lots', 'স্টক লট'],
          ['history', 'Stock history', 'স্টক হিস্ট্রি'],
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
          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-md bg-ink-50 p-0.5" role="radiogroup" aria-label="Stock filter">
              {(
              [
              ['all', 'All stock'],
              ['low', `Low (${lowCount})`],
              ['out', `Out (${outCount})`]] as
              [StockFilter, string][]).
              map(([id, label]) =>
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={stockFilter === id}
                onClick={() => setStockFilter(id)}
                className={`h-7 rounded px-2.5 text-xs font-medium ${stockFilter === id ? 'bg-white text-ink shadow-card' : 'text-ink-500'}`}>
                
                  {label}
                </button>
              )}
            </div>
            <ProductColumnPicker visible={visibleColumns} onToggle={toggleColumn} />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {visibleColumns.index && <TableHead className="h-9 w-10 pl-4 text-xs">#</TableHead>}
              {visibleColumns.product && <TableHead className="h-9 text-xs">Product</TableHead>}
              {visibleColumns.category && <TableHead className="h-9 text-xs">Category</TableHead>}
              {visibleColumns.stock && <TableHead className="h-9 text-right text-xs">Stock</TableHead>}
              {visibleColumns.stockValue && <TableHead className="h-9 text-right text-xs" title="Stock × purchase price">Stock value</TableHead>}
              {visibleColumns.unit && <TableHead className="h-9 text-xs">Unit</TableHead>}
              {visibleColumns.purchase && <TableHead className="h-9 text-right text-xs">Purchase</TableHead>}
              {visibleColumns.selling && <TableHead className="h-9 text-right text-xs">Selling</TableHead>}
              {visibleColumns.status && <TableHead className="h-9 text-xs">Status</TableHead>}
              <TableHead className="h-9 w-10 pr-4"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p, i) => {
              const s = stockStatus(p);
              const rowStockValue = p.stock * p.purchasePrice;
              return (
                <TableRow key={p.id} className="text-[13px]">
                  {visibleColumns.index && <TableCell className="py-2 pl-4 text-ink-400">{i + 1}.</TableCell>}
                  {visibleColumns.product &&
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
                  </TableCell>}
                  {visibleColumns.category && <TableCell className="py-2 text-ink-600">{p.category}</TableCell>}
                  {visibleColumns.stock &&
                  <TableCell className={`py-2 text-right font-medium ${s === 'low' ? 'text-warning' : s === 'out' ? 'text-danger' : 'text-ink'}`}>
                    {p.kind === 'Service' ? '—' : formatStock(p)}
                    {p.kind !== 'Service' && <span className="block text-[11px] font-normal text-ink-400">min {formatStock({ ...p, stock: p.minStock })}</span>}
                  </TableCell>}
                  {visibleColumns.stockValue &&
                  <TableCell className="py-2 text-right font-medium text-ink">
                    {p.kind === 'Service' ? '—' : taka(rowStockValue, rowStockValue % 1 ? 2 : 0)}
                    {p.kind !== 'Service' && <span className="block text-[11px] font-normal text-ink-400">at purchase price</span>}
                  </TableCell>}
                  {visibleColumns.unit &&
                  <TableCell className="py-2 text-ink-600">
                    {p.altUnit ?
                    <span>
                        {p.altUnit.unit} / {p.unit}
                        <span className="block text-[11px] text-ink-400">1 {p.altUnit.unit} = {p.altUnit.factor} {p.unit}</span>
                      </span> :

                    p.unit
                    }
                  </TableCell>}
                  {visibleColumns.purchase &&
                  <TableCell className="py-2 text-right text-ink-600">
                    {taka(p.purchasePrice, p.purchasePrice % 1 ? 2 : 0)}
                  </TableCell>}
                  {visibleColumns.selling &&
                  <TableCell className="py-2 text-right font-medium text-ink">
                    {taka(p.sellPrice, p.sellPrice % 1 ? 2 : 0)}
                    <span className="font-normal text-ink-400">/{p.unit}</span>
                    {p.altUnit &&
                    <span className="block text-[11px] font-normal text-ink-500">
                        {taka(p.altUnit.price ?? p.sellPrice * p.altUnit.factor)}/{p.altUnit.unit}
                      </span>
                    }
                  </TableCell>}
                  {visibleColumns.status &&
                  <TableCell className="py-2">
                    <StatusBadge tone={statusMeta[s].tone} dot>{statusMeta[s].label}</StatusBadge>
                  </TableCell>}
                  <TableCell className="py-2 pr-4">
                    <ProductActions
                      product={p}
                      onView={() => setDetailsProduct(p)}
                      onEdit={() => { setEditingProduct(p); setDialogOpen(true); }}
                      onAdjust={() => setAdjustProduct(p)}
                      onAddLot={() => setLotProduct(p)}
                      onLots={() => openLots(p)}
                      onHistory={() => openHistory(p)}
                      onOffers={() => setOfferProduct(p)}
                      onDuplicate={() => {
                        const copy = {
                          ...p,
                          id: `p${Date.now()}`,
                          name: `${p.name} Copy`,
                          sku: `${p.sku}-COPY`,
                          stock: 0
                        };
                        setList((items) => [copy, ...items]);
                        toast.success(`${p.name} duplicated`, { description: 'Product settings copied with zero opening stock.' });
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

      {view === 'lots' && (
        <StockLotsView
          products={list}
          lots={lots}
          productFilter={inventoryProductFilter}
          onProductFilter={setInventoryProductFilter}
          onAdjust={setAdjustProduct}
        />
      )}

      {view === 'history' && (
        <StockHistoryView
          products={list}
          movements={movements}
          productFilter={inventoryProductFilter}
          onProductFilter={setInventoryProductFilter}
        />
      )}

      {view === 'settings' && (
        <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card">
          <ProductSettings />
        </div>
      )}

      <AddProductDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingProduct(null);
        }}
        initialProduct={editingProduct}
        existingSerials={knownSerials}
        onSave={(product, opening?: ProductOpeningMeta) => {
          if (editingProduct) {
            setList((items) => items.map((item) => item.id === product.id ? product : item));
            setDetailsProduct((current) => current?.id === product.id ? product : current);
            toast.success(`${product.name} updated`);
          } else {
            setList((items) => [product, ...items]);
            if (product.kind !== 'Service' && product.stock > 0) {
              const today = new Date().toISOString().slice(0, 10);
              const lot: StockLot = {
                id: `lot-${product.id}-opening`,
                productId: product.id,
                label: 'Opening Stock',
                receivedAt: today,
                quantity: product.stock,
                available: product.stock,
                unitCost: product.purchasePrice,
                source: 'Opening',
                serials: opening?.serials.length ? opening.serials : undefined,
                batchNumber: opening?.batchNumber,
                manufactureDate: opening?.manufactureDate,
                expiryDate: opening?.expiryDate
              };
              const movement: StockMovement = {
                id: `mov-${product.id}-opening`,
                productId: product.id,
                date: today,
                type: 'Opening',
                quantity: product.stock,
                balance: product.stock,
                reference: 'Opening Stock',
                note: opening?.expiryDate ? `Opening lot · expiry ${opening.expiryDate}` : 'Opening balance'
              };
              setLots((current) => [lot, ...current]);
              setMovements((current) => [movement, ...current]);
            }
            toast.success(`${product.name} added`, { description: product.kind === 'Service' ? 'Service product' : product.altUnit ? `1 ${product.altUnit.unit} = ${product.altUnit.factor} ${product.unit}` : undefined });
          }
          setDialogOpen(false);
          setEditingProduct(null);
        }} />

      <ProductDetailsDialog
        product={detailsProduct}
        lots={lots}
        offers={offers}
        movements={movements}
        open={Boolean(detailsProduct)}
        onOpenChange={(open) => { if (!open) setDetailsProduct(null); }}
        onAdjust={(product) => { setDetailsProduct(null); setAdjustProduct(product); }}
        onAddLot={(product) => { setDetailsProduct(null); setLotProduct(product); }}
        onManageOffers={(product) => { setDetailsProduct(null); setOfferProduct(product); }}
      />

      <StockAdjustmentDialog
        product={adjustProduct}
        open={Boolean(adjustProduct)}
        onOpenChange={(open) => { if (!open) setAdjustProduct(null); }}
        onSave={(result) => {
          if (adjustProduct) applyAdjustment(adjustProduct, result);
        }}
      />

      <StockLotDialog
        product={lotProduct}
        existingLots={lots}
        soldSerials={soldSerials}
        open={Boolean(lotProduct)}
        onOpenChange={(open) => { if (!open) setLotProduct(null); }}
        onSave={(lot) => { if (lotProduct) addLot(lotProduct, lot); }}
      />

      <ManageOffersDialog
        product={offerProduct}
        offers={offers}
        open={Boolean(offerProduct)}
        onOpenChange={(open) => { if (!open) setOfferProduct(null); }}
        onSaveOffers={(next) => { if (offerProduct) saveProductOffers(offerProduct, next); }}
      />
      
    </div>);

}