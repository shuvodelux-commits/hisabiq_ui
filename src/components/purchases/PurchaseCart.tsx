import React from 'react';
import { ChevronDown, ChevronUp, PackagePlus, Plus, ScanLine, Search, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import { ProductThumb } from '../ProductThumb';
import { PurchaseProductSearch } from './PurchaseProductSearch';
import { formatStock } from '../../utils/units';
import { taka } from '../../utils/currency';
import { normalizeCompoundQuantity } from '../../utils/posQuantity';
import { normalizeSerials, requiredSerialCount } from '../../utils/productFeatures';
import {
  baseQty, conversion, describeQty, lineAmount, lotBaseSellPrice,
  priceInUnit, rounded, type PurchaseCartLine
} from '../../utils/purchaseCart';
import type { Product } from '../../types/erp';

type Props = {
  lines: PurchaseCartLine[];
  products: Product[];
  searchRef: React.RefObject<HTMLInputElement>;
  qtyRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  smallRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  costRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  onAdd: (product: Product) => void;
  onCreate: () => void;
  onUpdate: (id: string, patch: Partial<PurchaseCartLine>) => void;
  onRemove: (id: string) => void;
  onCostUnitChange: (line: PurchaseCartLine, unit: string) => void;
};

const grid = 'grid min-w-[850px] grid-cols-[24px_minmax(190px,1fr)_172px_90px_122px_110px_28px] items-center gap-2';
const entryInput = 'h-9 w-full min-w-0 rounded-md border border-input bg-card px-2 text-right text-[13px] text-ink outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20';
const unitOptions = (product: Product) => product.altUnit ? [product.unit, product.altUnit.unit] : [product.unit];

export function PurchaseCart({
  lines, products, searchRef, qtyRefs, smallRefs, costRefs, onAdd, onCreate, onUpdate, onRemove, onCostUnitChange
}: Props) {
  const quickItems = products.filter((p) => p.active && p.kind !== 'Service').slice(0, 8);

  const normalizeQty = (line: PurchaseCartLine, moveToSearch: boolean) => {
    if (line.product.altUnit) {
      const normalized = normalizeCompoundQuantity(line.bigQty, line.smallQty, conversion(line.product));
      onUpdate(line.id, { bigQty: normalized.primaryQty, smallQty: normalized.secondaryQty });
    }
    if (moveToSearch) searchRef.current?.focus();
  };

  const changeLotSellUnit = (line: PurchaseCartLine, unit: string) => {
    const inUnit = priceInUnit(lotBaseSellPrice(line), line.product, unit);
    onUpdate(line.id, { lotSellUnit: unit, lotSellPrice: String(Math.round(inUnit * 10000) / 10000) });
  };

  return (
    <>
      <section className="rounded-xl border border-border bg-card shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2.5">
          <div>
            <p className="text-[13px] font-semibold text-ink">Purchase cart <span className="font-bn text-[11px] font-normal text-ink-400">· ক্রয়ের পণ্য</span></p>
            <p className="text-[11px] text-ink-500">Add products inline, same as POS · 2 Box 5 Pcs / 1 Gauge 12 Gira</p>
          </div>
          <Button size="sm" variant="outline" onClick={onCreate}>
            <PackagePlus className="size-4" /> New product <span className="font-bn text-[11px] font-normal">· নতুন পণ্য</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <div className={grid + ' border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-ink-400'}>
            <span className="text-right">#</span><span>Product</span><span className="text-right">Quantity</span>
            <span>Cost in</span><span className="text-right">Unit cost</span><span className="text-right">Total</span><span aria-hidden="true" />
          </div>
          <div data-testid="purchase-cart" className="divide-y divide-border">
            {lines.map((line, index) => {
              const product = line.product;
              const count = normalizeSerials(line.serialText).length;
              const required = requiredSerialCount(product, baseQty(line));
              const showSerials = product.serialTracking !== undefined && product.serialTracking !== 'Off' || Boolean(product.warranty?.enabled);
              const showExpiry = Boolean(product.expiry?.enabled);
              return (
                <div key={line.id} data-testid="purchase-cart-row" className="bg-card">
                  <div className={grid + ' px-3 py-1.5'}>
                    <span className="text-right text-[13px] text-ink-400">{index + 1}.</span>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <ProductThumb src={product.image} size={34} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink">{product.name}</p>
                        <p className="truncate text-[11px] text-ink-500"><span className="font-bn">{product.nameBn}</span>{product.nameBn ? ' · ' : ''}{product.category} · Stock {formatStock(product)}</p>
                        <button
                          type="button"
                          onClick={() => onUpdate(line.id, { detailsOpen: !line.detailsOpen })}
                          aria-label={'Lot details for ' + product.name}
                          aria-expanded={line.detailsOpen}
                          className="mt-1 inline-flex max-w-full items-center gap-1 rounded bg-ink-50 px-1.5 py-0.5 text-[10.5px] text-ink-600 hover:bg-teal-50 hover:text-teal-700">
                          {showSerials ? <ScanLine className="size-3" /> : <ChevronDown className="size-3" />}
                          {showSerials ? 'Serials ' + count + '/' + Math.max(required, Math.ceil(baseQty(line))) + ' · ' : ''}
                          Lot sale {taka(lotBaseSellPrice(line))}/{product.unit}
                          {line.detailsOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex h-9 min-w-0 overflow-hidden rounded-md border border-input focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20">
                      {product.altUnit && (
                        <>
                          <input
                            ref={(node) => { qtyRefs.current[line.id] = node; }}
                            value={line.bigQty}
                            aria-label={product.altUnit.unit + ' quantity for ' + product.name}
                            inputMode="decimal"
                            className="min-w-0 flex-1 bg-transparent px-2 text-right text-[13px] font-medium text-ink outline-none"
                            onChange={(event) => onUpdate(line.id, { bigQty: event.target.value.replace(/[^\d.]/g, '') })}
                            onKeyDown={(event) => {
                              if (event.key !== 'Enter') return;
                              event.preventDefault();
                              smallRefs.current[line.id]?.focus(); smallRefs.current[line.id]?.select();
                            }}
                          />
                          <span className="flex shrink-0 items-center border-r border-border px-1 text-[10px] text-ink-500">{product.altUnit.unit}</span>
                        </>
                      )}
                      <input
                        ref={(node) => { smallRefs.current[line.id] = node; if (!product.altUnit) qtyRefs.current[line.id] = node; }}
                        value={line.smallQty}
                        aria-label={product.unit + ' quantity for ' + product.name}
                        inputMode="decimal"
                        className="min-w-0 flex-1 bg-transparent px-2 text-right text-[13px] font-medium text-ink outline-none"
                        onChange={(event) => onUpdate(line.id, { smallQty: event.target.value.replace(/[^\d.]/g, '') })}
                        onBlur={() => normalizeQty(line, false)}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter') return;
                          event.preventDefault(); normalizeQty(line, false);
                          costRefs.current[line.id]?.focus(); costRefs.current[line.id]?.select();
                        }}
                      />
                      <span className="flex shrink-0 items-center px-1 text-[10px] text-ink-500">{product.unit}</span>
                    </div>
                    <div className="flex min-w-0 items-center gap-1">
                      {unitOptions(product).map((unit) => (
                        <button type="button" key={unit} aria-pressed={line.costUnit === unit}
                          onClick={() => onCostUnitChange(line, unit)}
                          className={'min-w-0 flex-1 rounded-md border px-1.5 py-2 text-[11px] font-medium ' +
                            (line.costUnit === unit ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-border bg-ink-50 text-ink-500 hover:text-ink')}>
                          {unit}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-ink-400">৳</span>
                      <input ref={(node) => { costRefs.current[line.id] = node; }}
                        aria-label={'Purchase cost for ' + product.name} inputMode="decimal" value={line.cost}
                        className={entryInput + ' pl-5'}
                        onChange={(event) => onUpdate(line.id, { cost: event.target.value.replace(/[^\d.]/g, '') })}
                        onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); normalizeQty(line, true); } }} />
                    </div>
                    <span className="text-right text-[13px] font-semibold text-ink">{taka(lineAmount(line))}</span>
                    <button type="button" aria-label={'Remove ' + product.name} onClick={() => onRemove(line.id)}
                      className="flex size-8 items-center justify-center rounded-md text-ink-400 hover:bg-danger-bg hover:text-danger">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  {line.detailsOpen && (
                    <div className="border-t border-border/60 bg-ink-50/50 px-3 py-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[12px] font-semibold text-ink">Purchase lot details <span className="font-bn font-normal text-ink-400">· লটের তথ্য</span></p>
                        <p className="text-[10.5px] text-ink-500">Lot price applies to this batch, not the product's default price</p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="min-w-0">
                          <label className="mb-1 block text-[11px] font-medium text-ink" htmlFor={'lot-sale-' + line.id}>Lot selling price <span className="font-bn text-ink-500">· লট বিক্রয় মূল্য</span></label>
                          <div className="flex gap-1">
                            <Input id={'lot-sale-' + line.id} aria-label={'Lot selling price for ' + product.name}
                              inputMode="decimal" value={line.lotSellPrice} className="min-w-0 flex-1 text-right"
                              onChange={(event) => onUpdate(line.id, { lotSellPrice: event.target.value.replace(/[^\d.]/g, '') })} />
                            <FormSelect className="w-[100px] shrink-0 [&>select]:px-1.5 [&>select]:pr-6 [&>select]:text-xs"
                              value={line.lotSellUnit} options={unitOptions(product)}
                              onChange={(event) => changeLotSellUnit(line, event.target.value)} />
                          </div>
                          <p className="mt-1 text-[10.5px] text-ink-500">Base {taka(lotBaseSellPrice(line))}/{product.unit} · Cost {taka(lineAmount(line))} total</p>
                        </div>
                        <label className="block min-w-0 text-[11px] font-medium text-ink">
                          Batch / lot number <span className="font-bn font-normal text-ink-400">· ব্যাচ</span>
                          <Input className="mt-1" value={line.batchNumber} onChange={(event) => onUpdate(line.id, { batchNumber: event.target.value })}
                            placeholder="Optional supplier batch" />
                        </label>
                        {showExpiry && (
                          <>
                            <label className="block text-[11px] font-medium text-ink">Manufacture date
                              <Input className="mt-1" type="date" value={line.manufactureDate} onChange={(event) => onUpdate(line.id, { manufactureDate: event.target.value })} />
                            </label>
                            <label className="block text-[11px] font-medium text-ink">
                              Expiry date {product.expiry?.dateRequired && <span className="text-danger">*</span>}
                              <Input className="mt-1" type="date" value={line.expiryDate} onChange={(event) => onUpdate(line.id, { expiryDate: event.target.value })} />
                            </label>
                          </>
                        )}
                        {showSerials && (
                          <label className="block text-[11px] font-medium text-ink sm:col-span-2 lg:col-span-3">
                            Warranty / inventory serials <span className="font-bn text-ink-500">· সিরিয়াল নম্বর</span>
                            <textarea
                              aria-label={'Serial numbers for ' + product.name}
                              className="mt-1 min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-xs text-ink outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                              value={line.serialText}
                              placeholder="Scan, type or paste serial numbers · one per line or comma separated"
                              onChange={(event) => onUpdate(line.id, { serialText: event.target.value })}
                            />
                            <span className="mt-1 block text-[11px] font-normal text-ink-500">{count} entered · {required} mandatory · {baseQty(line)} base units purchased</span>
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div data-testid="purchase-add-row" className={grid + ' bg-teal-50/35 px-3 py-2'}>
              <span className="text-right text-[13px] font-medium text-teal-700">{lines.length + 1}.</span>
              <PurchaseProductSearch products={products} ref={searchRef} onAdd={onAdd} onCreate={onCreate} />
              <span className="pr-2 text-right text-[12px] text-ink-400">Qty</span>
              <span className="text-[12px] text-ink-400">Unit</span>
              <span className="text-right text-[12px] text-ink-400">Cost</span>
              <span className="text-right text-[12px] text-ink-400">Total</span><span />
            </div>
          </div>
        </div>
        {lines.length === 0 && <p className="border-t border-border p-5 text-center text-[12px] text-ink-500">Search above or tap a quick item below. <span className="font-bn">পণ্য যোগ করুন।</span></p>}
        <div className="flex items-center justify-between gap-2 border-t border-border bg-ink-50/50 px-3 py-2.5 text-xs text-ink-500">
          <span>{lines.length} product line{lines.length === 1 ? '' : 's'}</span>
          <span className="font-medium text-ink">{lines.length ? describeQty(lines[lines.length - 1]) + ' · ' : ''}Subtotal {taka(rounded(lines.reduce((sum, line) => sum + lineAmount(line), 0)))}</span>
        </div>
      </section>

      <section>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[13px] font-semibold text-ink">Quick items <span className="font-bn text-[11px] font-normal text-ink-400">· দ্রুত যোগ</span></p>
          <span className="text-[11px] text-ink-500">Tap to add · touch friendly</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {quickItems.map((product) => (
            <button key={product.id} type="button" aria-label={'Quick add ' + product.name}
              onClick={() => onAdd(product)}
              className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card p-2.5 text-left shadow-xs transition-colors hover:border-teal-400 hover:bg-teal-50 active:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500">
              <ProductThumb src={product.image} size={36} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-medium text-ink">{product.name}</span>
                <span className="block truncate text-[11px] text-ink-500">{taka(product.purchasePrice)}/{product.unit}</span>
              </span>
              <Plus className="size-4 shrink-0 text-ink-400" />
            </button>
          ))}
        </div>
      </section>
    </>
  );
}
