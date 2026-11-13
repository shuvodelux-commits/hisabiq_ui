import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { useUiCopy } from '../../i18n/useUiCopy';
import { useSession } from '../../integration/SessionProvider.tsx';
import { ApiError } from '../../integration/errors.ts';
import { purchaseMoney } from '../../integration/purchases-read-model.ts';
import {
  readSalesReturnHistory,
  type SalesReturnReason,
  type ServerSalesReturnHistory,
} from '../../integration/sales-return-history.ts';
import {
  formatSalesHistoryQuantity,
  salesHistoryVisibleState,
  type SalesHistoryReadState,
} from '../../integration/sales-return-history-read-model.ts';

/**
 * MOD-009 R09-SHISTORY-05: future connected Sales / Returns tab content.
 *
 * DO NOT MOUNT into Sales.tsx, App.tsx or AppShell until MOD-007 source-bound
 * workspace activation and Sales list contracts are separately accepted.
 *
 * This deliberately does not import salesPreviewStore or share preview data.
 * GET /api/v1/sales-returns requires sales.return.view, not return-create.
 * Posted value, cash refunded and customer credit are separate historical facts:
 * do not infer an allocation of the remainder, a live balance or COGS here.
 */
export function ConnectedSalesReturnHistoryPanel() {
  const { text } = useUiCopy();
  const { mode, snapshot } = useSession();
  const [page, setPage] = useState<{ identity: string; cursor: string | null }>({
    identity: '', cursor: null,
  });
  const [revision, setRevision] = useState(0);
  const [history, setHistory] = useState<SalesHistoryReadState<ServerSalesReturnHistory> | null>(null);

  const authenticated = mode === 'connected' && snapshot.status === 'authenticated';
  const token = authenticated ? snapshot.accessToken : null;
  const allowed = authenticated && snapshot.permissions.includes('sales.return.view');
  const identity = authenticated
    ? [snapshot.tenantId, snapshot.userId, snapshot.epoch, snapshot.accessToken].join(':')
    : [mode, snapshot.status, snapshot.epoch].join(':');
  // A cursor from another verified tenant/session is never sent for this one.
  const historyCursor = page.identity === identity ? page.cursor : null;
  const historyKey = [identity, 'sales-return-history', historyCursor ?? 'first', revision].join(':');
  const visible = salesHistoryVisibleState(history, historyKey);

  useEffect(() => {
    if (!authenticated || !allowed || token === null) return;
    const controller = new AbortController();
    setHistory({ key: historyKey, status: 'loading', data: null });
    void readSalesReturnHistory(token, { cursor: historyCursor, limit: 20 }, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) setHistory({ key: historyKey, status: 'ready', data });
      }).catch(error => {
        if (!controller.signal.aborted) setHistory({
          key: historyKey,
          status: error instanceof ApiError && (error.status === 401 || error.status === 403)
            ? 'denied' : 'error',
          data: null,
        });
      });
    return () => controller.abort();
  }, [authenticated, allowed, token, historyCursor, historyKey]);

  const rows = authenticated && allowed && visible.status === 'ready'
    ? visible.data?.returns ?? [] : [];

  const reasonNames: Record<SalesReturnReason, [string, string]> = {
    DAMAGED: ['Damaged', 'নষ্ট পণ্য'],
    WRONG_ITEM: ['Wrong item', 'ভুল পণ্য'],
    CHANGED_MIND: ['Changed mind', 'মত পরিবর্তন'],
    EXTRA_QUANTITY: ['Extra quantity', 'অতিরিক্ত পরিমাণ'],
    OTHER: ['Other', 'অন্যান্য'],
  };

  return (
    <section data-connected-sales-return-history="" className="rounded-md border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">
            {text('Sales return history', 'বিক্রি ফেরতের ইতিহাস')}
          </h2>
          <p className="text-xs text-ink-500">
            {text('Server-recorded returns, read-only', 'সার্ভারে সংরক্ষিত ফেরত, শুধু দেখার জন্য')}
          </p>
        </div>
        {allowed && (
          <Button type="button" size="sm" variant="outline"
            onClick={() => setRevision(value => value + 1)}>
            <RotateCcw aria-hidden className="size-4" />
            {text('Refresh', 'আবার দেখুন')}
          </Button>
        )}
      </div>
      <div className="space-y-3 p-4">
        {!authenticated ? (
          <p role="alert" className="text-sm text-danger">
            {text('A verified connected session is required to view sales returns.',
              'বিক্রি ফেরত দেখতে যাচাইকৃত সংযুক্ত সেশন প্রয়োজন।')}
          </p>
        ) : !allowed ? (
          <p role="alert" className="text-sm text-danger">
            {text('You do not have permission to view sales return history.',
              'বিক্রি ফেরতের ইতিহাস দেখার অনুমতি নেই।')}
          </p>
        ) : (
          <>
            {visible.status === 'loading' && (
              <p role="status" aria-live="polite" className="text-sm text-ink-500">
                {text('Loading verified sales returns…', 'যাচাইকৃত বিক্রি ফেরতের তথ্য আনা হচ্ছে…')}
              </p>
            )}
            {(visible.status === 'denied' || visible.status === 'error') && (
              <p role="alert" className="text-sm text-danger">
                {visible.status === 'denied'
                  ? text('Your session is not authorized to read these returns.',
                    'এই সেশনে ফেরতের তথ্য দেখার অনুমতি নেই।')
                  : text('Could not verify return history. No preview data was shown.',
                    'ফেরতের তথ্য যাচাই করা যায়নি। কোনো নমুনা তথ্য দেখানো হয়নি।')}
              </p>
            )}
            {visible.status === 'ready' && visible.data && (
              <>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-500">
                  <span>
                    {text('Return value recorded', 'সংরক্ষিত ফেরতের মূল্য')}:&nbsp;
                    <strong className="text-ink">{purchaseMoney(visible.data.totalValueMinor)}</strong>
                  </span>
                  <span>
                    {text('Refund recorded', 'সংরক্ষিত টাকা ফেরত')}:&nbsp;
                    <strong className="text-ink">{purchaseMoney(visible.data.totalRefundMinor)}</strong>
                  </span>
                </div>
                {rows.length === 0 ? (
                  <p role="status" className="rounded-md border border-border p-4 text-sm text-ink-500">
                    {text('No verified sales returns on this page.',
                      'এই পৃষ্ঠায় কোনো যাচাইকৃত বিক্রি ফেরত নেই।')}
                  </p>
                ) : (
                  <Table data-sales-return-history-table=""
                    scrollRegionLabel={text('Sales returns history table', 'বিক্রি ফেরতের ইতিহাসের তালিকা')}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-9 text-xs">{text('Return / invoice', 'ফেরত / চালান')}</TableHead>
                        <TableHead className="h-9 text-xs">{text('Customer', 'ক্রেতা')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Return value', 'ফেরতের মূল্য')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Money refunded', 'টাকা ফেরত')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Customer credit', 'ক্রেতার জমা')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map(item => (
                        <TableRow key={item.id} className="text-[13px]">
                          <TableCell className="py-2">
                            <span className="block font-medium text-ink">{item.number}</span>
                            <span data-table-helper="" className="block text-[11px] text-ink-500">
                              {item.saleNumber} · {item.businessDate}
                            </span>
                            <span data-table-helper="" className="block text-[11px] text-ink-500">
                              {text(...reasonNames[item.reason])}
                            </span>
                            {item.lines.map(line => (
                              <span key={line.id} data-table-helper="" className="block text-[11px] text-ink-500">
                                {line.productName} · {formatSalesHistoryQuantity(line.qty)} {line.unitName}
                              </span>
                            ))}
                          </TableCell>
                          <TableCell className="py-2">{item.customerName}</TableCell>
                          <TableCell className="py-2 text-right">{purchaseMoney(item.returnValueMinor)}</TableCell>
                          <TableCell className="py-2 text-right">
                            {purchaseMoney(item.refundMinor)}
                            {item.refundAccountName && (
                              <span data-table-helper="" className="block text-[11px] text-ink-500">
                                {item.refundAccountName}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-2 text-right">{purchaseMoney(item.creditMinor)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
                  <Button type="button" size="sm" variant="outline"
                    disabled={historyCursor === null}
                    onClick={() => setPage({ identity, cursor: null })}>
                    {text('First page', 'প্রথম পৃষ্ঠা')}
                  </Button>
                  <Button type="button" size="sm" variant="outline"
                    disabled={!visible.data.nextCursor}
                    onClick={() => setPage({ identity, cursor: visible.data?.nextCursor ?? null })}>
                    {text('Next', 'পরবর্তী')}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
        <p className="text-xs text-ink-500">
          {text('This list cannot establish whether a return was subsequently voided. Refund, credit, outstanding-due adjustment and stock posting are not available here.',
            'কোনো ফেরত পরে বাতিল হয়েছে কি না এই তালিকা নিশ্চিত করে না। এখানে টাকা ফেরত, জমা, বকেয়া সমন্বয় বা স্টক পোস্ট করা যায় না।')}
        </p>
      </div>
    </section>
  );
}
