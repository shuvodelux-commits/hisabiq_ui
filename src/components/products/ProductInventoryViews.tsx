import React, { useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Button } from '../Button';
import { StatusBadge, type StatusTone } from '../StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import type { Product, StockLot, StockMovement, StockMovementType } from '../../types/erp';
import { taka } from '../../utils/currency';
import { formatStock } from '../../utils/units';
import { lotExpiryState } from '../../utils/productFeatures';

function productById(products: Product[], id: string) {
  return products.find((product) => product.id === id);
}

function ProductFilterSelect({
  products,
  value,
  onChange
}: {
  products: Product[];
  value: string;
  onChange: (productId: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full appearance-none rounded-md border border-input bg-white pl-3 pr-8 text-sm text-ink shadow-xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        aria-label="Filter inventory by product">
        <option value="">All products</option>
        {products.filter((product) => product.kind !== 'Service').map((product) => (
          <option key={product.id} value={product.id}>{product.name}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
    </div>
  );
}

export function StockLotsView({
  products,
  lots,
  productFilter,
  onProductFilter,
  onAdjust
}: {
  products: Product[];
  lots: StockLot[];
  productFilter: string;
  onProductFilter: (productId: string) => void;
  onAdjust: (product: Product) => void;
}) {
  const filtered = useMemo(
    () => lots.filter((lot) => !productFilter || lot.productId === productFilter),
    [lots, productFilter]
  );
  const availableLots = filtered.filter((lot) => lot.available > 0);
  const value = availableLots.reduce((sum, lot) => sum + lot.available * lot.unitCost, 0);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
          <p className="text-xs text-ink-500">Available lots</p>
          <p className="mt-0.5 text-lg font-semibold text-ink">{availableLots.length}</p>
          <p className="text-[11px] text-ink-400">Lots with remaining stock</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
          <p className="text-xs text-ink-500">Lot stock value</p>
          <p className="mt-0.5 text-lg font-semibold text-ink">{taka(value, value % 1 ? 2 : 0)}</p>
          <p className="text-[11px] text-ink-400">At lot purchase cost</p>
        </div>
        <div className="col-span-2 rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card lg:col-span-1">
          <p className="text-xs text-ink-500">Selected product</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-ink">
            {productFilter ? productById(products, productFilter)?.name ?? 'Unknown' : 'All products'}
          </p>
          <p className="text-[11px] text-ink-400">Filter lots by product</p>
        </div>
      </div>

      <div className="rounded-xl border border-ink-100 bg-white shadow-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-3">
          <div className="min-w-[220px] flex-1 sm:max-w-sm">
            <ProductFilterSelect products={products} value={productFilter} onChange={onProductFilter} />
          </div>
          {productFilter && (
            <Button variant="outline" size="sm" onClick={() => onProductFilter('')}>Clear product</Button>
          )}
          {productFilter && productById(products, productFilter) && (
            <Button size="sm" onClick={() => onAdjust(productById(products, productFilter)!)}>
              Adjust stock
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 text-xs">Source / lot</TableHead>
              <TableHead className="h-9 text-xs">Product</TableHead>
              <TableHead className="h-9 text-xs">Received</TableHead>
              <TableHead className="h-9 text-right text-xs">Qty in</TableHead>
              <TableHead className="h-9 text-right text-xs">Available</TableHead>
              <TableHead className="h-9 text-right text-xs">Unit cost</TableHead>
              <TableHead className="h-9 text-right text-xs">Value</TableHead>
              <TableHead className="h-9 text-xs">Lot details</TableHead>
              <TableHead className="h-9 text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lot) => {
              const product = productById(products, lot.productId);
              if (!product) return null;
              const lotValue = lot.available * lot.unitCost;
              const expiryState = lotExpiryState(lot, product.expiry?.warningDays ?? 0);
              return (
                <TableRow key={lot.id} className="text-[13px]">
                  <TableCell className="py-2">
                    <p className="font-medium text-ink">{lot.label}</p>
                    {lot.reference && <p className="text-[11px] text-ink-400">{lot.reference}</p>}
                  </TableCell>
                  <TableCell className="py-2">
                    <p className="font-medium text-ink">{product.name}</p>
                    {product.nameBn && <p className="font-bn text-[11px] text-ink-400">{product.nameBn}</p>}
                  </TableCell>
                  <TableCell className="py-2 text-ink-600">{lot.receivedAt}</TableCell>
                  <TableCell className="py-2 text-right text-ink-600">{formatStock({ ...product, stock: lot.quantity })}</TableCell>
                  <TableCell className="py-2 text-right font-medium text-ink">{formatStock({ ...product, stock: lot.available })}</TableCell>
                  <TableCell className="py-2 text-right text-ink-600">{taka(lot.unitCost, lot.unitCost % 1 ? 2 : 0)}/{product.unit}</TableCell>
                  <TableCell className="py-2 text-right font-medium text-ink">{taka(lotValue, lotValue % 1 ? 2 : 0)}</TableCell>
                  <TableCell className="py-2">
                    <p className="text-ink-600">{lot.batchNumber ? `Batch ${lot.batchNumber}` : 'No batch'}</p>
                    <p className="text-[11px] text-ink-400">{lot.expiryDate ? `Exp ${lot.expiryDate}` : 'No expiry'}{lot.serials?.length ? ` · ${lot.serials.length} serials` : ''}</p>
                  </TableCell>
                  <TableCell className="py-2">
                    <StatusBadge tone={lot.available <= 0 ? 'neutral' : expiryState === 'Expired' ? 'danger' : expiryState === 'Expiring soon' ? 'warning' : 'success'} dot>
                      {lot.available <= 0 ? 'Depleted' : expiryState === 'No expiry' ? 'Open' : expiryState}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filtered.length === 0 && <p className="px-4 py-10 text-center text-sm text-ink-500">No stock lots match this product.</p>}
      </div>
    </div>
  );
}

const movementTone: Record<StockMovementType, StatusTone> = {
  Opening: 'neutral',
  Purchase: 'teal',
  Sale: 'info',
  Return: 'success',
  Adjustment: 'warning'
};

export function StockHistoryView({
  products,
  movements,
  productFilter,
  onProductFilter
}: {
  products: Product[];
  movements: StockMovement[];
  productFilter: string;
  onProductFilter: (productId: string) => void;
}) {
  const filtered = useMemo(
    () => movements
      .filter((movement) => !productFilter || movement.productId === productFilter)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date)),
    [movements, productFilter]
  );

  return (
    <div className="rounded-xl border border-ink-100 bg-white shadow-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-3">
        <div className="relative flex-1 text-sm text-ink-500">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <div className="h-9 rounded-md border border-ink-100 pl-8 pr-3 leading-9">Stock movement audit trail</div>
        </div>
        <div className="w-full sm:w-64">
          <ProductFilterSelect products={products} value={productFilter} onChange={onProductFilter} />
        </div>
        {productFilter && <Button variant="outline" size="sm" onClick={() => onProductFilter('')}>Clear</Button>}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-9 text-xs">Date</TableHead>
            <TableHead className="h-9 text-xs">Product</TableHead>
            <TableHead className="h-9 text-xs">Movement</TableHead>
            <TableHead className="h-9 text-right text-xs">Quantity</TableHead>
            <TableHead className="h-9 text-right text-xs">Balance</TableHead>
            <TableHead className="h-9 text-xs">Reference</TableHead>
            <TableHead className="h-9 text-xs">Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((movement) => {
            const product = productById(products, movement.productId);
            if (!product) return null;
            const absolute = Math.abs(movement.quantity);
            return (
              <TableRow key={movement.id} className="text-[13px]">
                <TableCell className="py-2 text-ink-600">{movement.date}</TableCell>
                <TableCell className="py-2">
                  <p className="font-medium text-ink">{product.name}</p>
                  {product.nameBn && <p className="font-bn text-[11px] text-ink-400">{product.nameBn}</p>}
                </TableCell>
                <TableCell className="py-2"><StatusBadge tone={movementTone[movement.type]}>{movement.type}</StatusBadge></TableCell>
                <TableCell className={`py-2 text-right font-medium ${movement.quantity < 0 ? 'text-danger' : 'text-success'}`}>
                  {movement.quantity > 0 ? '+' : movement.quantity < 0 ? '−' : ''}{formatStock({ ...product, stock: absolute })}
                </TableCell>
                <TableCell className="py-2 text-right font-medium text-ink">{formatStock({ ...product, stock: movement.balance })}</TableCell>
                <TableCell className="py-2 text-ink-600">{movement.reference ?? '—'}</TableCell>
                <TableCell className="max-w-[260px] py-2 text-ink-500">{movement.note ?? '—'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {filtered.length === 0 && <p className="px-4 py-10 text-center text-sm text-ink-500">No stock movements match this product.</p>}
    </div>
  );
}
