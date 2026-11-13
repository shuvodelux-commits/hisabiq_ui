import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../Button';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import { StatusBadge } from '../StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { useUiCopy } from '../../i18n/useUiCopy';
import { useSession } from '../../integration/SessionProvider.tsx';
import { ApiError } from '../../integration/errors.ts';
import {
  readSalesInvoices,
  type ServerSalesInvoices,
  type ServerSaleOrigin,
} from '../../integration/sales-invoices.ts';
import {
  readSalesInvoiceDetail,
  type ServerSaleDetailEnvelope,
} from '../../integration/sales-invoice-detail.ts';
import { formatSalesHistoryQuantity } from '../../integration/sales-return-history-read-model.ts';
import {
  formatSalesInvoiceMoney,
  salesInvoiceSelectedId,
  salesInvoiceVisibleState,
  type SalesInvoiceReadState,
  type SalesInvoiceSelection,
} from '../../integration/sales-invoice-read-model.ts';

type SourceFilter = 'ALL' | ServerSaleOrigin;
type DueFilter = 'ALL' | 'UNPAID';
type PageCursor = { scope: string; cursor: string | null };

const readError = (error: unknown): 'denied' | 'error' =>
  error instanceof ApiError && (error.status === 401 || error.status === 403)
    ? 'denied' : 'error';

/**
 * MOD-009 R09-SALES-READ-PANEL-09 — UNMOUNTED connected Sales invoice review.
 *
 * No change to Sales.tsx, App.tsx or ConnectedWorkspaceGate. The current preview
 * Sales page is untouched. Only an approved connected-workspace activation can
 * later mount this separate panel; a verified server invoice ID is mandatory for
 * original detail. NO sale, return, refund, credit, cash, stock or journal writes.
 *
 * Uses Nest sale.view GET list/detail. inventory.cost.view additionally gates
 * any optional cost/profit display; missing server costs never become zero.
 */
export function ConnectedSalesInvoicesPanel({ onReviewReturnable }: {
  onReviewReturnable?: (saleId: string) => void;
}) {
  const { text } = useUiCopy();
  const { mode, snapshot } = useSession();
  const [search, setSearch] = useState('');
  const [source, setSource] = useState<SourceFilter>('ALL');
  const [dueFilter, setDueFilter] = useState<DueFilter>('ALL');
  const [page, setPage] = useState<PageCursor>({ scope: '', cursor: null });
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<SalesInvoiceSelection | null>(null);
  const [list, setList] = useState<SalesInvoiceReadState<ServerSalesInvoices> | null>(null);
  const [detail, setDetail] = useState<SalesInvoiceReadState<ServerSaleDetailEnvelope> | null>(null);

  const authenticated = mode === 'connected' && snapshot.status === 'authenticated';
  const token = authenticated ? snapshot.accessToken : null;
  const allowed = authenticated && snapshot.permissions.includes('sale.view');
  const canViewCost = authenticated && snapshot.permissions.includes('inventory.cost.view');
  // This GET uses sales.return.create, not the separate sales.return.view permission.
  const canReviewReturnable = allowed && snapshot.permissions.includes('sales.return.create');
  const identity = authenticated
    ? JSON.stringify([snapshot.tenantId, snapshot.userId, snapshot.epoch,
      snapshot.accessToken, snapshot.permissions])
    : JSON.stringify([mode, snapshot.status, snapshot.epoch]);
  const scope = JSON.stringify([identity, search.trim(), source, dueFilter]);
  // A cursor from a different filter or authenticated session is never sent.
  const cursor = page.scope === scope ? page.cursor : null;
  const listKey = JSON.stringify([scope, cursor, revision]);
  const visibleList = salesInvoiceVisibleState(list, listKey);
  const rows = authenticated && allowed && visibleList.status === 'ready'
    ? visibleList.data?.items ?? [] : [];
  // Selection cannot outlive its verified list page, even before effect cleanup.
  const selectedId = authenticated && allowed
    ? salesInvoiceSelectedId(selected, listKey, rows) : null;
  const detailKey = JSON.stringify([listKey, selectedId]);
  const visibleDetail = salesInvoiceVisibleState(detail, detailKey);
  const selectedDetail = authenticated && allowed && selectedId !== null &&
    visibleDetail.status === 'ready' ? visibleDetail.data?.data : null;

  useEffect(() => {
    if (!authenticated || !allowed || token === null) return;
    const controller = new AbortController();
    setList({ key: listKey, status: 'loading', data: null });
    void readSalesInvoices(token, {
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(source === 'ALL' ? {} : { origin: source }),
      ...(dueFilter === 'UNPAID' ? { unpaidOnly: true } : {}),
      ...(cursor === null ? {} : { cursor }),
      limit: 20,
    }, controller.signal).then(data => {
      if (!controller.signal.aborted) setList({ key: listKey, status: 'ready', data });
    }).catch(error => {
      if (!controller.signal.aborted) {
        setList({ key: listKey, status: readError(error), data: null });
      }
    });
    return () => controller.abort();
  }, [authenticated, allowed, token, search, source, dueFilter, cursor, listKey]);

  useEffect(() => {
    if (!authenticated || !allowed || token === null || selectedId === null) return;
    const controller = new AbortController();
    setDetail({ key: detailKey, status: 'loading', data: null });
    void readSalesInvoiceDetail(token, selectedId, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setDetail({ key: detailKey, status: 'ready', data });
      }).catch(error => {
        if (!controller.signal.aborted) {
          setDetail({ key: detailKey, status: readError(error), data: null });
        }
      });
    return () => controller.abort();
  }, [authenticated, allowed, token, selectedId, detailKey]);

  const changeSearch = (value: string) => {
    setSearch(value.slice(0, 64));
    setPage({ scope: '', cursor: null });
    setSelected(null);
  };
  const changeSource = (value: string) => {
    if (value !== 'ALL' && value !== 'ONLINE' && value !== 'OFFLINE') return;
    setSource(value);
    setPage({ scope: '', cursor: null });
    setSelected(null);
  };
  const changeDue = (value: string) => {
    if (value !== 'ALL' && value !== 'UNPAID') return;
    setDueFilter(value);
    setPage({ scope: '', cursor: null });
    setSelected(null);
  };
  const refresh = () => {
    setRevision(value => value + 1);
    setSelected(null);
  };
  const firstPage = () => {
    setPage({ scope, cursor: null });
    setSelected(null);
  };
  const nextPage = () => {
    if (visibleList.status !== 'ready' || !visibleList.data?.nextCursor) return;
    setPage({ scope, cursor: visibleList.data.nextCursor });
    setSelected(null);
  };

  return (
    <section data-connected-sales-invoices-panel=""
      className="rounded-md border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">
            {text('Sales invoices', 'বিক্রির চালান')}
          </h2>
          <p className="text-xs text-ink-500">
            {text('Verified server invoices · read-only', 'সার্ভারের যাচাইকৃত চালান · শুধু দেখার জন্য')}
          </p>
        </div>
        {allowed && (
          <Button type="button" variant="outline" size="sm" onClick={refresh}>
            <RotateCcw aria-hidden className="size-4" />
            {text('Refresh', 'আবার দেখুন')}
          </Button>
        )}
      </div>

      <div className="space-y-3 p-4">
        {!authenticated ? (
          <p role="alert" className="text-sm text-danger">
            {text('A verified connected session is required for Sales.',
              'বিক্রির তথ্য দেখতে যাচাইকৃত সংযুক্ত সেশন প্রয়োজন।')}
          </p>
        ) : !allowed ? (
          <p role="alert" className="text-sm text-danger">
            {text('You do not have sale.view permission to inspect invoices.',
              'আপনার বিক্রির চালান দেখার অনুমতি নেই।')}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-[180px] flex-1">
                <Input type="search" value={search} maxLength={64}
                  aria-label={text('Find invoice or customer phone', 'চালান বা ক্রেতার ফোন খুঁজুন')}
                  placeholder={text('Invoice or phone', 'চালান বা ফোন')}
                  clearable onClear={() => changeSearch('')}
                  onChange={event => changeSearch(event.target.value)} />
              </div>
              <FormSelect
                aria-label={text('Sales origin', 'বিক্রির উৎস')}
                value={source}
                onChange={event => changeSource(event.target.value)}
                options={[
                  { value: 'ALL', label: text('All sales', 'সব বিক্রি') },
                  { value: 'ONLINE', label: text('Online entry', 'অনলাইনে এন্ট্রি') },
                  { value: 'OFFLINE', label: text('Offline entry', 'অফলাইনে এন্ট্রি') },
                ]} />
              <FormSelect
                aria-label={text('Payment filter', 'পরিশোধের ফিল্টার')}
                value={dueFilter}
                onChange={event => changeDue(event.target.value)}
                options={[
                  { value: 'ALL', label: text('All invoices', 'সব চালান') },
                  { value: 'UNPAID', label: text('Outstanding only', 'শুধু বকেয়া') },
                ]} />
            </div>
            {visibleList.status === 'loading' && (
              <p role="status" aria-live="polite" className="text-sm text-ink-500">
                {text('Loading verified sales invoices…', 'যাচাইকৃত বিক্রির চালান আনা হচ্ছে…')}
              </p>
            )}
            {(visibleList.status === 'denied' || visibleList.status === 'error') && (
              <p role="alert" className="text-sm text-danger">
                {visibleList.status === 'denied'
                  ? text('This session is not authorized to read these invoices.',
                    'এই সেশনে চালান দেখার অনুমতি নেই।')
                  : text('Could not verify invoices. No preview records were loaded.',
                    'চালান যাচাই করা যায়নি। কোনো নমুনা তথ্য দেখানো হয়নি।')}
              </p>
            )}
            {visibleList.status === 'ready' && visibleList.data && (
              <>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-500">
                  <span>{text('Sales total', 'বিক্রির মোট')}:&nbsp;
                    <strong className="text-ink">{formatSalesInvoiceMoney(visibleList.data.totals.salesMinor)}</strong>
                  </span>
                  <span>{text('Received', 'পাওয়া গেছে')}:&nbsp;
                    <strong className="text-ink">{formatSalesInvoiceMoney(visibleList.data.totals.receivedMinor)}</strong>
                  </span>
                  <span>{text('Outstanding', 'বকেয়া')}:&nbsp;
                    <strong className="text-ink">{formatSalesInvoiceMoney(visibleList.data.totals.dueMinor)}</strong>
                  </span>
                  <span>{text('Invoices', 'চালান')}:&nbsp;
                    <strong className="text-ink">{visibleList.data.totals.invoiceCount}</strong>
                  </span>
                </div>
                {rows.length === 0 ? (
                  <p role="status" className="rounded-md border border-border p-4 text-sm text-ink-500">
                    {text('No verified server invoices match these filters.',
                      'এই ফিল্টারে সার্ভারের কোনো যাচাইকৃত চালান নেই।')}
                  </p>
                ) : (
                  <Table data-connected-sales-invoices-table=""
                    scrollRegionLabel={text('Sales invoice list', 'বিক্রির চালানের তালিকা')}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-9 text-xs">{text('Invoice / date', 'চালান / তারিখ')}</TableHead>
                        <TableHead className="h-9 text-xs">{text('Customer', 'ক্রেতা')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Total', 'মোট')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Paid', 'পরিশোধ')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Due', 'বাকি')}</TableHead>
                        <TableHead className="h-9 text-xs">{text('Status', 'অবস্থা')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('View', 'দেখুন')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map(row => (
                        <TableRow key={row.id} className="text-[13px]">
                          <TableCell className="py-2">
                            <span className="block font-medium text-ink">{row.number}</span>
                            <span data-table-helper="" className="block text-[11px] text-ink-500">
                              {row.businessDate}
                              {row.originMode === 'OFFLINE' &&
                                ' · ' + text('Made offline', 'অফলাইনে তৈরি')}
                            </span>
                          </TableCell>
                          <TableCell className="py-2">
                            <span className="block">{row.customerName}</span>
                            {row.customerPhone && (
                              <span data-table-helper="" className="block text-[11px] text-ink-500">{row.customerPhone}</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2 text-right">{formatSalesInvoiceMoney(row.grandTotalMinor)}</TableCell>
                          <TableCell className="py-2 text-right">{formatSalesInvoiceMoney(row.paidMinor)}</TableCell>
                          <TableCell className="py-2 text-right">{formatSalesInvoiceMoney(row.dueMinor)}</TableCell>
                          <TableCell className="py-2">
                            {row.status === 'VOIDED'
                              ? <StatusBadge tone="neutral">{text('Voided', 'বাতিল')}</StatusBadge>
                              : <StatusBadge tone="success">{text('Posted', 'পোস্ট করা')}</StatusBadge>}
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <Button type="button" size="sm" variant="outline"
                              aria-label={text('View original invoice', 'মূল চালান দেখুন') + ': ' + row.number}
                              onClick={() => setSelected({ listKey, id: row.id })}>
                              {text('View', 'দেখুন')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
                  <Button type="button" size="sm" variant="outline"
                    disabled={cursor === null} onClick={firstPage}>
                    {text('First page', 'প্রথম পৃষ্ঠা')}
                  </Button>
                  <Button type="button" size="sm" variant="outline"
                    disabled={!visibleList.data.nextCursor} onClick={nextPage}>
                    {text('Next', 'পরবর্তী')}
                  </Button>
                </div>
              </>
            )}

            {selectedId !== null && (
              <section data-connected-sales-invoice-detail=""
                aria-label={text('Original invoice detail', 'মূল চালানের বিবরণ')}
                className="space-y-3 rounded-md border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink">
                    {text('Original invoice', 'মূল চালান')}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedDetail && selectedDetail.status === 'POSTED' &&
                      selectedId === selectedDetail.id && canReviewReturnable && onReviewReturnable && (
                        <Button type="button" size="sm" variant="outline"
                          onClick={() => onReviewReturnable(selectedDetail.id)}>
                          {text('Review returnable source', 'ফেরতযোগ্য মূল তথ্য দেখুন')}
                        </Button>
                      )}
                    <Button type="button" size="sm" variant="outline"
                      onClick={() => setSelected(null)}>
                      {text('Close detail', 'বিবরণ বন্ধ করুন')}
                    </Button>
                  </div>
                </div>
                {visibleDetail.status === 'loading' && (
                  <p role="status" className="text-sm text-ink-500">
                    {text('Verifying invoice from the server…', 'সার্ভার থেকে চালান যাচাই হচ্ছে…')}
                  </p>
                )}
                {(visibleDetail.status === 'denied' || visibleDetail.status === 'error') && (
                  <p role="alert" className="text-sm text-danger">
                    {visibleDetail.status === 'denied'
                      ? text('Invoice detail is not authorized.', 'চালানের বিবরণ দেখার অনুমতি নেই।')
                      : text('Could not verify invoice detail. No preview fallback is available.',
                        'চালানের বিবরণ যাচাই করা যায়নি। কোনো নমুনা তথ্য দেখানো হয়নি।')}
                  </p>
                )}
                {selectedDetail && (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <div>
                        <p className="font-semibold text-ink">{selectedDetail.number}</p>
                        <p className="text-xs text-ink-500">
                          {selectedDetail.customerName} · {selectedDetail.businessDate}
                          {selectedDetail.originMode === 'OFFLINE'
                            ? ' · ' + text('Made offline', 'অফলাইনে তৈরি') : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-ink">
                          {formatSalesInvoiceMoney(selectedDetail.grandTotalMinor)}
                        </p>
                        <p className="text-xs text-ink-500">
                          {text('Recorded due', 'সংরক্ষিত বকেয়া')}:&nbsp;
                          {formatSalesInvoiceMoney(selectedDetail.dueMinor)}
                        </p>
                      </div>
                    </div>
                    <Table data-connected-sales-invoice-lines=""
                      scrollRegionLabel={text('Original sold line items', 'মূল বিক্রির পণ্য')}>
                      <TableHeader><TableRow>
                        <TableHead className="h-9 text-xs">{text('Product', 'পণ্য')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Quantity', 'পরিমাণ')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Net value', 'নিট মূল্য')}</TableHead>
                      </TableRow></TableHeader>
                      <TableBody>
                        {selectedDetail.lines.map(line => (
                          <TableRow key={line.id} className="text-[13px]">
                            <TableCell className="py-2">
                              <span className="font-medium text-ink">{line.displayName || line.productName}</span>
                              <span data-table-helper="" className="block text-[11px] text-ink-500">
                                {line.source === 'VENDOR_CONSIGNMENT'
                                  ? text('Vendor consignment', 'বিক্রেতার কনসাইনমেন্ট')
                                  : text('Own stock', 'নিজস্ব স্টক')}
                              </span>
                              {line.allocations.map(allocation => (
                                allocation.serialNo ? (
                                  <span key={allocation.id} data-table-helper=""
                                    className="block text-[11px] text-ink-500">
                                    {text('Serial', 'সিরিয়াল')}: {allocation.serialNo}
                                  </span>
                                ) : null
                              ))}
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              {formatSalesHistoryQuantity(line.qty)} {line.unitName}
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              {formatSalesInvoiceMoney(line.netAmountMinor)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex flex-wrap gap-3 text-xs text-ink-500">
                      {selectedDetail.payments.map(payment => (
                        <span key={payment.id}>
                          {payment.accountName}: {formatSalesInvoiceMoney(payment.amountMinor)}
                        </span>
                      ))}
                      {selectedDetail.receipts.map(receipt => (
                        <span key={receipt.id}>
                          {receipt.number} · {receipt.accountName}:&nbsp;
                          {formatSalesInvoiceMoney(receipt.amountMinor)}
                        </span>
                      ))}
                      {canViewCost && selectedDetail.cogsMinor !== undefined && (
                        <span>{text('Recorded cost', 'সংরক্ষিত খরচ')}:&nbsp;
                          {formatSalesInvoiceMoney(selectedDetail.cogsMinor)}
                        </span>
                      )}
                      {canViewCost && selectedDetail.profitMinor !== undefined && (
                        <span>{text('Recorded profit', 'সংরক্ষিত লাভ')}:&nbsp;
                          {formatSalesInvoiceMoney(selectedDetail.profitMinor)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-500">
                      {text('Payments, receipts, due and profit are separate server facts. This view cannot post sales, receive payments, create returns, refund, credit or change stock.',
                        'পরিশোধ, রসিদ, বকেয়া ও লাভ সার্ভারের পৃথক তথ্য। এখানে বিক্রি, টাকা গ্রহণ, ফেরত, জমা বা স্টক পরিবর্তন করা যায় না।')}
                    </p>
                  </>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </section>
  );
}
