import { useState } from 'react';
import { Button } from '../Button';
import { StatusBadge, type StatusTone } from '../StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import type {
  InventoryPresentation,
  InventoryStockPresentation,
  InventoryMovementPresentation,
  InventoryLotPresentation,
  InventoryAdjustmentPresentation,
  ProductReference,
} from '../../integration/inventory-projection.ts';
import type { UiLanguage } from '../../i18n/uiCopy.ts';
import { formatNumber, taka } from '../../utils/currency.ts';

/**
 * MOD-003 T01-R/P2B1 — UNMOUNTED read-only adapter presentation.
 * Accept only an already authenticated/decoded, scope-keyed projection.
 * No preview data, fetch, inventory sum, document writer or AppShell route.
 *
 * This prop boundary is a UI safety mask, not a replacement for backend RLS.
 * The owning caller must bind expectedScope to tenant/user/session epoch.
 */
export interface ConnectedInventoryReadPanelProps {
  presentation: InventoryPresentation | null;
  expectedScope: string | null;
  state: 'ready' | 'loading' | 'permission-denied' | 'error';
  language?: UiLanguage;
}

type Section = 'stock' | 'lots' | 'movements' | 'adjustments';
const sections: Section[] = ['stock', 'lots', 'movements', 'adjustments'];
const words: Record<string, string> = {
  'Inventory overview': 'স্টকের সারাংশ',
  'Authenticated read-only view': 'যাচাইকৃত শুধু-পড়ার তথ্য',
  Stock: 'স্টক', Lots: 'লট', Movements: 'স্টক চলাচল',
  Adjustments: 'স্টক সংশোধন', Product: 'পণ্য', Location: 'অবস্থান',
  Quantity: 'পরিমাণ', Status: 'অবস্থা', Value: 'মূল্য',
  'Source / lot': 'উৎস / লট', 'Owner type': 'মালিকানা',
  Received: 'পাওয়ার পরিমাণ', Remaining: 'অবশিষ্ট', Expiry: 'মেয়াদ',
  'Unit cost': 'একক মূল্য', 'Lot value': 'লট মূল্য',
  Date: 'তারিখ', Direction: 'দিক', Reference: 'রেফারেন্স',
  Reason: 'কারণ', Note: 'নোট', 'Running balance': 'চলতি ব্যালেন্স',
  'Not provided by API': 'এপিআইতে নেই',
  'No rows in this response': 'এই উত্তরে কোনো তথ্য নেই',
  'Loading authenticated inventory…': 'যাচাইকৃত স্টক লোড হচ্ছে…',
  'Permission denied': 'অনুমতি নেই',
  'Cannot load inventory': 'স্টক লোড করা যায়নি',
  'Session changed — inventory hidden': 'সেশন বদলেছে — স্টকের তথ্য লুকানো',
  'Waiting for verified inventory': 'যাচাইকৃত স্টকের অপেক্ষায়',
  'Costs not supplied': 'খরচের তথ্য দেওয়া হয়নি',
  'Source-backed records; not an inventory total': 'উৎসের তথ্য; মোট স্টক নয়',
  'More lot pages exist': 'আরও লটের পৃষ্ঠা আছে',
  'This is a filtered keyset page, not all stock': 'এটি ফিল্টার করা পৃষ্ঠা, মোট স্টক নয়',
  'Movement history is bounded; not a running balance': 'চলাচলের তথ্য সীমিত; চলতি ব্যালেন্স নয়',
  'Adjustment history is bounded': 'স্টক সংশোধনের ইতিহাস সীমিত',
  'Product not in supplied catalog page': 'দেওয়া ক্যাটালগ পৃষ্ঠায় পণ্য নেই',
  'Duplicate location row': 'একই অবস্থানের একাধিক সারি',
  'Unit mismatch': 'এককে অমিল', 'Status mismatch': 'অবস্থায় অমিল',
  'No expiry': 'মেয়াদ নেই', Open: 'চালু', Closed: 'বন্ধ',
  'Owned stock': 'নিজস্ব স্টক', 'Vendor stock': 'বিক্রেতার স্টক',
  'Date / reference': 'তারিখ / রেফারেন্স',
  'Batch, serials, lot selling price and manufacture date are unavailable':
    'ব্যাচ, সিরিয়াল, লট বিক্রয়মূল্য ও উৎপাদনের তারিখ পাওয়া যায়নি',
};
function translate(language: UiLanguage, english: string): string {
  const bangla = words[english] ?? english;
  return language === 'Bangla' ? bangla
    : language === 'English + Bangla' && bangla !== english
      ? english + ' · ' + bangla : english;
}
function quantity(value: number): string {
  // The API supplies an integer scaled by 1000, not an editor quantity.
  return (value / 1000).toLocaleString('en-IN', { maximumFractionDigits: 3 });
}
function money(minor: number): string {
  return taka(minor / 100, minor % 100 === 0 ? 0 : 2);
}
function productLabel(reference: ProductReference, fallback: string, language: UiLanguage): string {
  return reference.state === 'matched' ? reference.product.displayName
    : fallback || translate(language, 'Product not in supplied catalog page');
}
function costAvailable<T extends { valueMinor?: number }>(rows: readonly { source: T }[]): boolean {
  return rows.some(row => typeof row.source.valueMinor === 'number');
}
function stockTone(status: string): StatusTone {
  return status === 'IN_STOCK' ? 'success' :
    status === 'LOW_STOCK' ? 'warning' :
      status === 'ZERO_STOCK' || status === 'NEGATIVE_STOCK' ? 'danger' : 'neutral';
}
function ReadState({ message }: { message: string }) {
  return <div role="status" className="rounded-md border border-border bg-card px-4 py-8 text-center text-sm text-ink-500">
    {message}
  </div>;
}
function CoverageNote({ children }: { children: React.ReactNode }) {
  return <p data-table-helper="" className="mt-2 text-[11px] leading-4 text-ink-500">{children}</p>;
}
function StockTable({ rows, language }: { rows: InventoryStockPresentation[]; language: UiLanguage }) {
  const tr = (english: string) => translate(language, english);
  if (!rows.length) return <ReadState message={tr('No rows in this response')} />;
  const showCost = costAvailable(rows);
  return <>
    <div className="overflow-x-auto rounded-md border border-border">
      <Table scrollRegionLabel={tr('Stock')}>
        <TableHeader><TableRow>
          <TableHead className="h-9 text-xs">{tr('Product')}</TableHead>
          <TableHead className="h-9 text-xs">{tr('Location')}</TableHead>
          <TableHead className="h-9 text-right text-xs">{tr('Quantity')}</TableHead>
          <TableHead className="h-9 text-xs">{tr('Status')}</TableHead>
          {showCost && <TableHead className="h-9 text-right text-xs">{tr('Value')}</TableHead>}
        </TableRow></TableHeader>
        <TableBody>{rows.map((row, index) => <TableRow key={row.source.productId + ':' + (row.source.locationId ?? 'none') + ':' + index}
          data-product-id={row.source.productId} data-location-id={row.source.locationId ?? ''} className="text-[13px]">
          <TableCell className="py-2">
            <span className="font-medium text-ink">{productLabel(row.product, row.source.productName, language)}</span>
            {row.product.state !== 'matched' && <span data-table-helper="" className="block text-[11px] text-ink-500">{tr('Product not in supplied catalog page')}</span>}
            {row.duplicateLocation && <StatusBadge tone="warning">{tr('Duplicate location row')}</StatusBadge>}
            {row.unitMismatch && <StatusBadge tone="warning">{tr('Unit mismatch')}</StatusBadge>}
            {row.statusMismatch && <StatusBadge tone="warning">{tr('Status mismatch')}</StatusBadge>}
          </TableCell>
          <TableCell className="py-2">{row.source.locationName ?? '—'}</TableCell>
          <TableCell className="py-2 text-right">{quantity(row.source.qtyOnHand)} {row.source.baseUnitName}</TableCell>
          <TableCell className="py-2"><StatusBadge tone={stockTone(row.source.stockStatus)}>{row.source.stockStatus.replaceAll('_', ' ')}</StatusBadge></TableCell>
          {showCost && <TableCell className="py-2 text-right">
            {typeof row.source.valueMinor === 'number' ? money(row.source.valueMinor) : '—'}
          </TableCell>}
        </TableRow>)}</TableBody>
      </Table>
    </div>
    <CoverageNote>{tr('Source-backed records; not an inventory total')}{!showCost ? ' · ' + tr('Costs not supplied') : ''}</CoverageNote>
  </>;
}
function LotsTable({ rows, page, language }: {
  rows: InventoryLotPresentation[];
  page: { nextCursor: string | null; hasMore: boolean };
  language: UiLanguage;
}) {
  const tr = (english: string) => translate(language, english);
  const showCost = rows.some(row => typeof row.source.valueMinor === 'number' ||
    typeof row.source.actualUnitCost === 'number' || typeof row.source.purchaseUnitCost === 'number');
  return <>
    {rows.length ? <div className="overflow-x-auto rounded-md border border-border">
      <Table scrollRegionLabel={tr('Lots')}><TableHeader><TableRow>
        <TableHead className="h-9 text-xs">{tr('Source / lot')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Product')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Location')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Owner type')}</TableHead>
        <TableHead className="h-9 text-right text-xs">{tr('Received')}</TableHead>
        <TableHead className="h-9 text-right text-xs">{tr('Remaining')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Expiry')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Status')}</TableHead>
        {showCost && <TableHead className="h-9 text-right text-xs">{tr('Unit cost')}</TableHead>}
        {showCost && <TableHead className="h-9 text-right text-xs">{tr('Lot value')}</TableHead>}
      </TableRow></TableHeader><TableBody>
        {rows.map(row => <TableRow key={row.source.id} data-lot-id={row.source.id} data-owner-type={row.source.ownerType} className="text-[13px]">
          <TableCell className="py-2"><span className="font-medium text-ink">{row.source.sourceNumber}</span>
            <span data-table-helper="" className="block text-[11px] text-ink-500">{row.source.sourceType} · {row.source.id}</span>
          </TableCell>
          <TableCell className="py-2">{productLabel(row.product, row.source.productName, language)}</TableCell>
          <TableCell className="py-2">{row.source.locationName}</TableCell>
          <TableCell className="py-2">{row.source.ownerType === 'OWNED' ? tr('Owned stock') : tr('Vendor stock')}</TableCell>
          <TableCell className="py-2 text-right">{quantity(row.source.qtyReceived)}</TableCell>
          <TableCell className="py-2 text-right font-medium">{quantity(row.source.qtyRemaining)}</TableCell>
          <TableCell className="py-2">{row.source.expiryDate ?? tr('No expiry')}</TableCell>
          <TableCell className="py-2"><StatusBadge tone={row.source.status === 'OPEN' ? 'success' : 'neutral'}>{tr(row.source.status === 'OPEN' ? 'Open' : 'Closed')}</StatusBadge></TableCell>
          {showCost && <TableCell className="py-2 text-right">{typeof row.source.actualUnitCost === 'number' ? money(row.source.actualUnitCost)
            : typeof row.source.purchaseUnitCost === 'number' ? money(row.source.purchaseUnitCost) : '—'}</TableCell>}
          {showCost && <TableCell className="py-2 text-right">{typeof row.source.valueMinor === 'number' ? money(row.source.valueMinor) : '—'}</TableCell>}
        </TableRow>)}
      </TableBody></Table>
    </div> : <ReadState message={tr('No rows in this response')} />}
    <CoverageNote>{tr('This is a filtered keyset page, not all stock')}
      {page.hasMore ? ' · ' + tr('More lot pages exist') : ''}
      {' · ' + tr('Batch, serials, lot selling price and manufacture date are unavailable')}
      {!showCost ? ' · ' + tr('Costs not supplied') : ''}</CoverageNote>
    <div data-page-has-more={String(page.hasMore)}
      data-next-cursor={page.nextCursor ?? ''} className="sr-only">
      {page.hasMore ? tr('More lot pages exist') : tr('This is a filtered keyset page, not all stock')}
    </div>
  </>;
}
function MovementsTable({ rows, language }: { rows: InventoryMovementPresentation[]; language: UiLanguage }) {
  const tr = (english: string) => translate(language, english);
  if (!rows.length) return <ReadState message={tr('No rows in this response')} />;
  return <>
    <div className="overflow-x-auto rounded-md border border-border">
      <Table scrollRegionLabel={tr('Movements')}><TableHeader><TableRow>
        <TableHead className="h-9 text-xs">{tr('Date')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Product')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Location')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Direction')}</TableHead>
        <TableHead className="h-9 text-right text-xs">{tr('Quantity')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Reference')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Running balance')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Note')}</TableHead>
      </TableRow></TableHeader><TableBody>{rows.map(row =>
        <TableRow key={row.source.id} data-movement-id={row.source.id} className="text-[13px]">
          <TableCell className="py-2">{row.source.businessDate}</TableCell>
          <TableCell className="py-2">{productLabel(row.product, row.source.productName, language)}</TableCell>
          <TableCell className="py-2">{row.source.locationName}</TableCell>
          <TableCell className="py-2"><StatusBadge tone={row.source.direction === 'IN' ? 'success' : 'warning'}>{row.source.direction}</StatusBadge></TableCell>
          <TableCell className="py-2 text-right">{row.source.direction === 'OUT' ? '−' : '+'}{quantity(row.source.qty)}</TableCell>
          <TableCell className="py-2">{row.source.sourceNumber}
            <span data-table-helper="" className="block text-[11px] text-ink-500">{row.source.sourceType} · {row.source.sourceId}</span></TableCell>
          <TableCell className="py-2 text-ink-500">{tr('Not provided by API')}</TableCell>
          <TableCell className="py-2 text-ink-500">{tr('Not provided by API')}</TableCell>
        </TableRow>)}</TableBody></Table>
    </div>
    <CoverageNote>{tr('Movement history is bounded; not a running balance')}</CoverageNote>
  </>;
}
function AdjustmentsTable({ rows, language }: { rows: InventoryAdjustmentPresentation[]; language: UiLanguage }) {
  const tr = (english: string) => translate(language, english);
  if (!rows.length) return <ReadState message={tr('No rows in this response')} />;
  const showCost = costAvailable(rows);
  return <>
    <div className="overflow-x-auto rounded-md border border-border">
      <Table scrollRegionLabel={tr('Adjustments')}><TableHeader><TableRow>
        <TableHead className="h-9 text-xs">{tr('Date')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Product')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Location')}</TableHead>
        <TableHead className="h-9 text-right text-xs">{tr('Quantity')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Reason')}</TableHead>
        <TableHead className="h-9 text-xs">{tr('Reference')}</TableHead>
        {showCost && <TableHead className="h-9 text-right text-xs">{tr('Value')}</TableHead>}
      </TableRow></TableHeader><TableBody>{rows.map(row =>
        <TableRow key={row.source.id} data-adjustment-id={row.source.id} className="text-[13px]">
          <TableCell className="py-2">{row.source.businessDate}</TableCell>
          <TableCell className="py-2">{productLabel(row.product, row.source.productName, language)}</TableCell>
          <TableCell className="py-2">{row.source.locationName}</TableCell>
          <TableCell className="py-2 text-right">{row.source.qtyDelta > 0 ? '+' : ''}{quantity(row.source.qtyDelta)}</TableCell>
          <TableCell className="py-2">{row.source.reason}</TableCell>
          <TableCell className="py-2">{row.source.number}</TableCell>
          {showCost && <TableCell className="py-2 text-right">{typeof row.source.valueMinor === 'number' ? money(row.source.valueMinor) : '—'}</TableCell>}
        </TableRow>)}</TableBody></Table>
    </div>
    <CoverageNote>{tr('Adjustment history is bounded')}{!showCost ? ' · ' + tr('Costs not supplied') : ''}</CoverageNote>
  </>;
}
export function ConnectedInventoryReadPanel({
  presentation, expectedScope, state, language = 'English + Bangla',
}: ConnectedInventoryReadPanelProps) {
  const [tab, setTab] = useState<Section>('stock');
  const tr = (english: string) => translate(language, english);
  const scopeValid = typeof expectedScope === 'string' && expectedScope.trim() === expectedScope &&
    expectedScope.split('/').length === 3 && !/\s/.test(expectedScope) &&
    expectedScope.split('/').every(part => part.length > 0);
  const visible = state === 'ready' && scopeValid && presentation?.scope === expectedScope
    ? presentation : null;
  const viewState = state === 'permission-denied' ? 'denied'
    : state === 'error' ? 'error'
      : state === 'loading' ? 'loading'
        : visible === null ? 'stale' : 'ready';

  const selected = visible?.[tab];
  const titleId = 'mod003-p2b1-inventory-title';
  return <section aria-labelledby={titleId} data-mod003-panel=""
    data-view-state={viewState} data-active-tab={tab}
    data-scope={visible?.scope ?? ''} className="w-full min-w-0 space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 id={titleId} className="text-[18px] font-semibold leading-6 text-ink">{tr('Inventory overview')}</h2>
        <p className="text-[12px] text-ink-500">{tr('Authenticated read-only view')}</p>
      </div>
      {visible && <StatusBadge tone="teal">{tr('Source-backed records; not an inventory total')}</StatusBadge>}
    </div>
    {visible && <div role="tablist" aria-label={tr('Inventory overview')}
      className="flex flex-wrap gap-1 border-b border-border">
      {sections.map(section => <Button key={section} type="button" size="sm" variant="ghost"
        role="tab" id={'mod003-tab-' + section}
        aria-selected={tab === section} aria-controls="mod003-inventory-content"
        className={'rounded-none border-b-2 px-3 text-[13px] ' +
          (tab === section ? 'border-primary text-primary' : 'border-transparent text-ink-600')}
        onClick={() => setTab(section)}>{tr(section[0].toUpperCase() + section.slice(1))}</Button>)}
    </div>}
    {!visible ? <ReadState message={viewState === 'denied' ? tr('Permission denied')
      : viewState === 'error' ? tr('Cannot load inventory')
        : viewState === 'loading' ? tr('Loading authenticated inventory…')
          : state === 'ready' && presentation === null ? tr('Waiting for verified inventory')
            : tr('Session changed — inventory hidden')} /> : (
      <div id="mod003-inventory-content" role="tabpanel" aria-labelledby={'mod003-tab-' + tab}>
        {selected?.state === 'not-loaded' ? <ReadState message={tr('Waiting for verified inventory')} />
          : tab === 'stock' && visible.stock.state === 'loaded'
            ? <StockTable rows={visible.stock.rows} language={language} />
            : tab === 'lots' && visible.lots.state === 'loaded'
              ? <LotsTable rows={visible.lots.rows} page={visible.lots.page} language={language} />
              : tab === 'movements' && visible.movements.state === 'loaded'
                ? <MovementsTable rows={visible.movements.rows} language={language} />
                : tab === 'adjustments' && visible.adjustments.state === 'loaded'
                  ? <AdjustmentsTable rows={visible.adjustments.rows} language={language} />
                  : <ReadState message={tr('Waiting for verified inventory')} />}
      </div>)}
  </section>;
}
