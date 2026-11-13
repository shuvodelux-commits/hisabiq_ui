import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { useUiCopy } from '../../i18n/useUiCopy';
import { useSession } from '../../integration/SessionProvider.tsx';
import { ApiError } from '../../integration/errors.ts';
import { purchaseMoney } from '../../integration/purchases-read-model.ts';
import { readReturnableSale, type ReturnableSaleEnvelope } from '../../integration/returns.ts';
import {
  formatSalesHistoryQuantity,
  salesHistoryVisibleState,
  type SalesHistoryReadState,
} from '../../integration/sales-return-history-read-model.ts';

/**
 * MOD-009 R09-SOURCE-06 — source-linked, read-only review of one genuine sale.
 *
 * UNMOUNTED: only a future, separately accepted connected Sales selector may
 * pass a real backend saleId. Never pass preview-generated invoice references.
 * This does not bypass ConnectedWorkspaceGate and never posts refunds, credits,
 * inventory moves, journal entries or return commands.
 *
 * Backend GET /api/v1/sales-returns/returnable/:saleId currently requires
 * sales.return.create, despite this panel being GET-only. No permission alias.
 */
export function ConnectedSalesReturnSourceReview({ saleId }: { saleId: string | null }) {
  const { text } = useUiCopy();
  const { mode, snapshot } = useSession();
  const [revision, setRevision] = useState(0);
  const [sourceResult, setSourceResult] = useState<SalesHistoryReadState<ReturnableSaleEnvelope> | null>(null);

  const authenticated = mode === 'connected' && snapshot.status === 'authenticated';
  const token = authenticated ? snapshot.accessToken : null;
  const canReview = authenticated && snapshot.permissions.includes('sales.return.create');
  const identity = authenticated
    ? [snapshot.tenantId, snapshot.userId, snapshot.epoch, snapshot.accessToken].join(':')
    : [mode, snapshot.status, snapshot.epoch].join(':');
  const sourceKey = [identity, 'sale-returnable', saleId ?? 'none', revision].join(':');
  // This guard also masks stale answers synchronously before the effect cleanup.
  const visible = salesHistoryVisibleState(sourceResult, sourceKey);

  useEffect(() => {
    if (!authenticated || !canReview || token === null || saleId === null) return;
    const controller = new AbortController();
    setSourceResult({ key: sourceKey, status: 'loading', data: null });
    void readReturnableSale(token, saleId, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) {
          setSourceResult({ key: sourceKey, status: 'ready', data });
        }
      }).catch(error => {
        if (!controller.signal.aborted) {
          setSourceResult({
            key: sourceKey,
            status: error instanceof ApiError && (error.status === 401 || error.status === 403)
              ? 'denied' : 'error',
            data: null,
          });
        }
      });
    return () => controller.abort();
  }, [authenticated, canReview, token, saleId, sourceKey]);

  const data = authenticated && canReview && saleId !== null && visible.status === 'ready'
    ? visible.data?.data : null;

  return (
    <section data-connected-sales-return-source-review=""
      className="rounded-md border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">
            {text('Original sale return review', 'মূল বিক্রি ফেরতের যাচাই')}
          </h2>
          <p className="text-xs text-ink-500">
            {text('Original invoice facts from the server · read-only',
              'সার্ভারের মূল চালানের তথ্য · শুধু দেখার জন্য')}
          </p>
        </div>
        {authenticated && canReview && saleId !== null && (
          <Button type="button" variant="outline" size="sm"
            onClick={() => setRevision(value => value + 1)}>
            <RotateCcw aria-hidden className="size-4" />
            {text('Refresh source', 'মূল তথ্য আবার দেখুন')}
          </Button>
        )}
      </div>
      <div className="space-y-3 p-4">
        {!authenticated ? (
          <p role="alert" className="text-sm text-danger">
            {text('A verified connected session is required to review sale sources.',
              'মূল বিক্রি যাচাই করতে সংযুক্ত ও যাচাইকৃত সেশন প্রয়োজন।')}
          </p>
        ) : !canReview ? (
          <p role="alert" className="text-sm text-danger">
            {text('Your role does not allow sale-return source review.',
              'আপনার ভূমিকায় বিক্রি ফেরতের মূল তথ্য যাচাইয়ের অনুমতি নেই।')}
          </p>
        ) : saleId === null ? (
          <p role="status" className="text-sm text-ink-500">
            {text('Choose a posted server invoice to inspect its original returnable lines.',
              'মূল ফেরতযোগ্য পণ্য দেখতে সার্ভারের পোস্ট করা চালান নির্বাচন করুন।')}
          </p>
        ) : (
          <>
            {visible.status === 'loading' && (
              <p role="status" aria-live="polite" className="text-sm text-ink-500">
                {text('Checking original invoice and prior returns…',
                  'মূল চালান ও আগের ফেরত যাচাই করা হচ্ছে…')}
              </p>
            )}
            {(visible.status === 'denied' || visible.status === 'error') && (
              <p role="alert" className="text-sm text-danger">
                {visible.status === 'denied'
                  ? text('Not authorized to inspect this original sale.',
                    'এই মূল বিক্রির তথ্য দেখার অনুমতি নেই।')
                  : text('Could not verify this sale from the server. No sample data was loaded.',
                    'সার্ভার থেকে এই বিক্রি যাচাই করা যায়নি। কোনো নমুনা তথ্য দেখানো হয়নি।')}
              </p>
            )}
            {data && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{data.number}</p>
                    <p className="text-xs text-ink-500">{data.customerName} · {data.businessDate}</p>
                    <p className="text-xs text-ink-500">
                      {data.isWalkIn
                        ? text('Walk-in sale', 'সরাসরি বিক্রি')
                        : text('Registered customer', 'নিবন্ধিত ক্রেতা')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink-500">{text('Original sale total', 'মূল বিক্রির মোট')}</p>
                    <p className="font-semibold text-ink">{purchaseMoney(data.grandTotalMinor)}</p>
                  </div>
                </div>
                {data.lines.length === 0 ? (
                  <p role="status" className="rounded-md border border-border p-4 text-sm text-ink-500">
                    {text('No source lines were returned for this invoice.',
                      'এই চালানের কোনো মূল পণ্যের সারি পাওয়া যায়নি।')}
                  </p>
                ) : (
                  <Table data-sales-return-source-table=""
                    scrollRegionLabel={text('Original sale return quantities', 'মূল বিক্রির ফেরত পরিমাণ')}>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="h-9 text-xs">{text('Original product', 'মূল পণ্য')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Sold', 'বিক্রি')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Already returned', 'আগেই ফেরত')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Unreturned', 'ফেরত বাকি')}</TableHead>
                        <TableHead className="h-9 text-right text-xs">{text('Previously returned value', 'আগের ফেরতের মূল্য')}</TableHead>
                        <TableHead className="h-9 text-xs">{text('Source eligibility', 'মূল উৎস অনুমোদিত')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.lines.map(line => (
                        <TableRow key={line.saleLineId} className="text-[13px]">
                          <TableCell className="py-2">
                            <span className="font-medium text-ink">{line.productName}</span>
                            <span data-table-helper="" className="block text-[11px] text-ink-500">{line.unitName}</span>
                            {line.serials.map(serial => (
                              <span key={serial.id} data-table-helper=""
                                className="block break-all text-[11px] text-ink-500">
                                {text('Serial', 'সিরিয়াল')}: {serial.serialNo} · {serial.sourceType}
                              </span>
                            ))}
                          </TableCell>
                          <TableCell className="py-2 text-right">{formatSalesHistoryQuantity(line.qtySold)}</TableCell>
                          <TableCell className="py-2 text-right">{formatSalesHistoryQuantity(line.qtyReturned)}</TableCell>
                          <TableCell className="py-2 text-right">{formatSalesHistoryQuantity(line.qtyReturnable)}</TableCell>
                          <TableCell className="py-2 text-right">{purchaseMoney(line.valueReturnedMinor)}</TableCell>
                          <TableCell className="py-2">
                            {line.returnable && line.qtyReturnable > 0
                              ? text('Reviewable', 'যাচাইযোগ্য')
                              : text('Not available', 'ফেরত সম্ভব নয়')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <p className="text-xs text-ink-500">
                  {text('These are server-source quantities and prior returned values, not a refund quote. Consignment and serial restrictions, return approval, stock restoration and final settlement must be verified by the posting service.',
                    'এগুলো সার্ভারের মূল পরিমাণ ও আগের ফেরতের মূল্য, টাকা ফেরতের প্রস্তাব নয়। কনসাইনমেন্ট, সিরিয়াল, অনুমোদন, স্টক ও চূড়ান্ত নিষ্পত্তি পোস্টিং সার্ভার যাচাই করবে।')}
                </p>
              </>
            )}
          </>
        )}
        <p className="text-xs text-ink-500">
          {text('This review cannot create, approve, refund, credit, void or post a return.',
            'এই যাচাই থেকে ফেরত তৈরি, অনুমোদন, টাকা বা জমা ফেরত, বাতিল অথবা পোস্ট করা যায় না।')}
        </p>
      </div>
    </section>
  );
}
