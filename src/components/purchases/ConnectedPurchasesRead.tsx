import { useEffect, useState } from 'react';
import { Search, Eye, Plus, RotateCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../Button';
import { Input } from '../Input';
import { FormSelect } from '../FormSelect';
import { PageHeader } from '../PageHeader';
import { StatusBadge } from '../StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import { useUiCopy } from '../../i18n/useUiCopy';
import { useSession } from '../../integration/SessionProvider.tsx';
import { ApiError } from '../../integration/errors.ts';
import {
  readPurchase, readPurchases,
  type ServerPurchaseEnvelope,
  type ServerPurchaseList,
  type ServerPurchaseListRow,
} from '../../integration/purchases.ts';
import {
  purchaseMoney, purchaseSettlement, purchaseVisibleState,
  type IdentityBoundPurchaseState,
} from '../../integration/purchases-read-model.ts';

type PurchaseTab = 'purchases' | 'return' | 'return-history';
const allowedTab = (value: string | null): PurchaseTab =>
  value === 'return' || value === 'return-history' ? value : 'purchases';
const reportError = (error: unknown): 'denied' | 'error' =>
  error instanceof ApiError && (error.status === 401 || error.status === 403) ? 'denied' : 'error';

function Settlement({ row }: { row: ServerPurchaseListRow }) {
  const { text } = useUiCopy();
  const value = purchaseSettlement(row);
  if (value === 'VOIDED') return <StatusBadge tone="neutral">{text('Voided', 'বাতিল')}</StatusBadge>;
  if (value === 'HIDDEN') return <span aria-label={text('Cost hidden', 'মূল্য দেখার অনুমতি নেই')}>—</span>;
  if (value === 'PAID') return <StatusBadge tone="success" dot>{text('Paid', 'পরিশোধ')}</StatusBadge>;
  if (value === 'PARTIAL') return <StatusBadge tone="warning" dot>{text('Partial', 'আংশিক')}</StatusBadge>;
  return <StatusBadge tone="danger" dot>{text('Due', 'বাকি')}</StatusBadge>;
}

/**
 * Connected view is a separate React component from PreviewPurchases.
 * Neither this file nor any of its dependencies reads the preview ERP store.
 *
 * Important: ConnectedWorkspaceGate currently prevents /app from mounting
 * for connected users; THIS component does not override that global gate.
 * It becomes reachable only in a later approved workspace activation task.
 */
export function ConnectedPurchasesRead() {
  const { text } = useUiCopy();
  const { mode, snapshot } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = allowedTab(searchParams.get('tab'));
  const chooseTab = (next: PurchaseTab) => {
    setSearchParams(previous => {
      const params = new URLSearchParams(previous);
      if (next === 'purchases') params.delete('tab');
      else params.set('tab', next);
      return params;
    }, { replace: true });
  };
  const [search, setSearch] = useState(() => (searchParams.get('q') ?? '').slice(0, 80));
  const [settlement, setSettlement] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [cursor, setCursor] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ identity: string; id: string } | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const [list, setList] = useState<IdentityBoundPurchaseState<ServerPurchaseList> | null>(null);
  const [detail, setDetail] = useState<IdentityBoundPurchaseState<ServerPurchaseEnvelope> | null>(null);

  const authenticated = mode === 'connected' && snapshot.status === 'authenticated';
  const token = authenticated ? snapshot.accessToken : null;
  const allowed = authenticated && snapshot.permissions.includes('purchase.bill.view');
  const identity = authenticated
    ? [snapshot.tenantId, snapshot.userId, snapshot.epoch, snapshot.accessToken].join(':')
    : [mode, snapshot.status, snapshot.epoch].join(':');
  const selectedId = selected?.identity === identity ? selected.id : null;
  const listKey = [identity, 'list', search.trim(), settlement, cursor ?? 'first', retryVersion].join(':');
  const detailKey = [identity, 'detail', selectedId ?? 'none'].join(':');
  const visibleList = purchaseVisibleState(list, listKey);
  const visibleDetail = purchaseVisibleState(detail, detailKey);

  useEffect(() => {
    if (!authenticated || token === null) return;
    if (!allowed) {
      setList({ key: listKey, status: 'denied', data: null });
      return;
    }
    const controller = new AbortController();
    setList({ key: listKey, status: 'loading', data: null });
    void readPurchases(token, {
      ...(search.trim() ? { search: search.trim() } : {}),
      settlement,
      ...(cursor ? { cursor } : {}),
      limit: 25,
    }, controller.signal).then(data => {
      if (!controller.signal.aborted) setList({ key: listKey, status: 'ready', data });
    }).catch(error => {
      if (!controller.signal.aborted) setList({ key: listKey, status: reportError(error), data: null });
    });
    return () => controller.abort();
  }, [authenticated, token, allowed, listKey, search, settlement, cursor]);

  useEffect(() => {
    if (!authenticated || !allowed || token === null || selectedId === null) return;
    const controller = new AbortController();
    setDetail({ key: detailKey, status: 'loading', data: null });
    void readPurchase(token, selectedId, controller.signal).then(data => {
      if (!controller.signal.aborted) setDetail({ key: detailKey, status: 'ready', data });
    }).catch(error => {
      if (!controller.signal.aborted) setDetail({ key: detailKey, status: reportError(error), data: null });
    });
    return () => controller.abort();
  }, [authenticated, allowed, token, detailKey, selectedId]);

  const updateSearch = (value: string) => { setSearch(value.slice(0, 80)); setCursor(null); };
  const updateSettlement = (value: string) => {
    if (value !== 'ALL' && value !== 'PAID' && value !== 'UNPAID') return;
    setSettlement(value);
    setCursor(null);
  };
  const reset = () => { setSearch(''); setSettlement('ALL'); setCursor(null); };
  const rows = authenticated && allowed && visibleList.status === 'ready'
    ? visibleList.data?.data ?? [] : [];
  const summary = authenticated && allowed && visibleList.status === 'ready'
    ? visibleList.data?.summary : null;
  const currentDetail = authenticated && allowed && selectedId &&
    visibleDetail.status === 'ready' ? visibleDetail.data?.data : null;
  const blocked = !authenticated || !allowed;
  const errorText = !authenticated
    ? text('Your connected session must be verified to read purchases.', 'ক্রয় দেখতে যাচাইকৃত সেশন লাগবে।')
    : !allowed || visibleList.status === 'denied'
      ? text('You do not have permission to view purchase bills.', 'ক্রয় বিল দেখার অনুমতি নেই।')
      : text('Could not verify purchases from the server. No preview data was loaded.', 'সার্ভার থেকে ক্রয় যাচাই করা যায়নি। কোনো নমুনা তথ্য দেখানো হয়নি।');

  const tabs: [PurchaseTab, string][] = [
    ['purchases', text('Purchases', 'ক্রয়')],
    ['return', text('Purchase return', 'ক্রয় ফেরত')],
    ['return-history', text('Return history', 'ফেরতের ইতিহাস')],
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Purchases" titleBn="ক্রয়"
        description="Purchase stock, manage supplier bills, update purchases and handle purchase returns."
        descriptionBn="পণ্য কেনা, সরবরাহকারীর বিল ও ফেরত দেখুন।"
        actions={<>
          <Button variant="outline" size="sm" disabled title={text('Supplier ledger integration is pending.', 'সরবরাহকারীর খাতা এখনও সংযুক্ত নয়।')}>
            {text('Supplier ledger', 'সরবরাহকারীর খাতা')}
          </Button>
          <Button size="sm" disabled title={text('Server purchase confirmation is not connected.', 'সার্ভারের ক্রয় নিশ্চিতকরণ এখনও সংযুক্ত নয়।')}>
            <Plus className="size-4" /> {text('New purchase', 'নতুন ক্রয়')}
          </Button>
        </>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [text('Purchase total', 'ক্রয়ের মোট'), purchaseMoney(summary?.periodTotalMinor)],
          [text('Due to suppliers', 'সরবরাহকারীর দেনা'), purchaseMoney(summary?.unpaidTotalMinor)],
          [text('Overdue', 'মেয়াদোত্তীর্ণ দেনা'), purchaseMoney(summary?.overdueTotalMinor)],
          [text('Purchase invoices', 'ক্রয় বিল'), summary?.purchaseCount?.toString() ?? '—'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
            <p className="text-[12.5px] text-ink-500">{label}</p>
            <p className="mt-0.5 text-lg font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <div role="tablist" aria-label={text('Purchase sections', 'ক্রয় বিভাগ')} className="flex flex-wrap gap-1 border-b border-border px-3">
          {tabs.map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={tab === value}
              className={'px-2.5 py-2.5 text-[13px] font-medium ' +
                (tab === value ? 'border-b-2 border-teal-600 text-ink' : 'text-ink-500 hover:text-ink')}
              onClick={() => chooseTab(value)}>{label}</button>
          ))}
        </div>
        {tab !== 'purchases' ? (
          <div className="p-5 text-sm text-ink-500" role="status">
            {text('Purchase returns are not connected to the server yet. No preview transactions are shown.',
              'ক্রয় ফেরত এখনও সার্ভারে সংযুক্ত নয়। এখানে কোনো নমুনা লেনদেন দেখানো হয় না।')}
          </div>
        ) : (
          <>
            <div data-purchases-filterbar="" className="grid grid-cols-[minmax(0,1fr)_160px_36px] items-center gap-2 border-b border-border p-3 max-[450px]:grid-cols-[minmax(0,1fr)_120px_36px]">
              <div className="relative min-w-0">
                <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                <Input className="pl-8" aria-label={text('Search purchases', 'ক্রয় খুঁজুন')}
                  placeholder={text('Purchase ID or supplier', 'ক্রয় নম্বর বা সরবরাহকারী')}
                  value={search} onChange={e => updateSearch(e.target.value)} />
              </div>
              <FormSelect aria-label={text('Purchase settlement', 'ক্রয়ের পরিশোধ অবস্থা')}
                value={settlement} onChange={e => updateSettlement(e.target.value)}
                options={[
                  { value: 'ALL', label: text('All status', 'সব অবস্থা') },
                  { value: 'PAID', label: text('Paid', 'পরিশোধ') },
                  { value: 'UNPAID', label: text('Due / partial', 'বাকি / আংশিক') },
                ]} />
              <Button type="button" variant="outline" size="icon" aria-label={text('Reset filters', 'ফিল্টার মুছুন')}
                className="size-9" onClick={reset}><RotateCcw className="size-4" /></Button>
            </div>
            {(blocked || visibleList.status === 'denied' || visibleList.status === 'error') && (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4 text-sm text-danger">
                <span>{errorText}</span>
                {!blocked && visibleList.status === 'error' &&
                  <Button variant="outline" size="sm" onClick={() => setRetryVersion(version => version + 1)}>
                    {text('Retry', 'আবার চেষ্টা করুন')}
                  </Button>}
              </div>
            )}
            {!blocked && visibleList.status === 'loading' && <p role="status" className="p-4 text-sm text-ink-500">
              {text('Loading verified purchases…', 'যাচাইকৃত ক্রয় আনা হচ্ছে…')}
            </p>}
            {!blocked && visibleList.status === 'ready' && (
              <>
                <Table data-purchases-table="" className="table-fixed md:table-auto" scrollRegionLabel={text('Purchases table', 'ক্রয়ের তালিকা')}>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="h-9 pl-3 pr-1 text-xs md:px-4">{text('Purchase', 'ক্রয়')}</TableHead>
                      <TableHead className="hidden h-9 text-xs md:table-cell">{text('Supplier', 'সরবরাহকারী')}</TableHead>
                      <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Items', 'পণ্য')}</TableHead>
                      <TableHead className="h-9 text-right text-xs">{text('Total', 'মোট')}</TableHead>
                      <TableHead className="hidden h-9 text-right text-xs md:table-cell">{text('Paid', 'পরিশোধ')}</TableHead>
                      <TableHead className="hidden h-9 text-right text-xs md:table-cell">{text('Due', 'বাকি')}</TableHead>
                      <TableHead className="hidden h-9 text-xs lg:table-cell">{text('Status', 'অবস্থা')}</TableHead>
                      <TableHead className="h-9 text-right text-xs">{text('Action', 'কাজ')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(row => (
                      <TableRow key={row.id} className="text-[13px]">
                        <TableCell className="py-2 pl-3 pr-1 md:px-4">
                          <span className="block font-medium text-ink">{row.number}</span>
                          <span data-table-helper="" className="block text-[11px] text-ink-400">{row.businessDate}</span>
                          <span className="block text-xs text-teal-700 md:hidden">{row.supplierName}</span>
                        </TableCell>
                        <TableCell className="hidden py-2 md:table-cell">{row.supplierName}</TableCell>
                        <TableCell className="hidden py-2 lg:table-cell">{row.lineCount}</TableCell>
                        <TableCell className="py-2 text-right font-medium">{purchaseMoney(row.grandTotalMinor)}</TableCell>
                        <TableCell className="hidden py-2 text-right md:table-cell">{purchaseMoney(row.paidMinor)}</TableCell>
                        <TableCell className="hidden py-2 text-right md:table-cell">{purchaseMoney(row.dueMinor)}</TableCell>
                        <TableCell className="hidden py-2 lg:table-cell"><Settlement row={row} /></TableCell>
                        <TableCell className="py-2 pr-3 text-right">
                          <Button type="button" variant="ghost" size="sm"
                            aria-label={text('View bill', 'বিল দেখুন') + ' ' + row.number}
                            onClick={() => setSelected({ identity, id: row.id })}>
                            <Eye aria-hidden className="size-4" />
                            <span className="sr-only">{text('View bill', 'বিল দেখুন')}</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {rows.length === 0 && <TableRow><TableCell colSpan={8} className="p-5 text-center text-sm text-ink-500">
                      {text('No verified purchases match these filters.', 'এই ফিল্টারে কোনো যাচাইকৃত ক্রয় পাওয়া যায়নি।')}
                    </TableCell></TableRow>}
                  </TableBody>
                </Table>
                <div className="flex justify-end gap-2 border-t border-border p-3">
                  <Button variant="outline" size="sm" disabled={cursor === null} onClick={() => setCursor(null)}>
                    {text('First page', 'প্রথম পৃষ্ঠা')}
                  </Button>
                  <Button variant="outline" size="sm" disabled={!visibleList.data?.page.nextCursor}
                    onClick={() => setCursor(visibleList.data?.page.nextCursor ?? null)}>
                    {text('Next', 'পরবর্তী')}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Dialog open={selectedId !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent role="dialog" aria-label={text('Purchase bill details', 'ক্রয় বিলের বিবরণ')}
          className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentDetail?.number ?? text('Purchase bill', 'ক্রয় বিল')}</DialogTitle>
            <DialogDescription>{currentDetail
              ? [currentDetail.businessDate, currentDetail.supplierName].join(' · ')
              : text('Reading source bill…', 'মূল বিল যাচাই করা হচ্ছে…')}</DialogDescription>
          </DialogHeader>
          {selectedId && !blocked && visibleDetail.status === 'loading' &&
            <p role="status" className="text-sm text-ink-500">{text('Loading verified bill…', 'যাচাইকৃত বিল আনা হচ্ছে…')}</p>}
          {selectedId && (blocked || visibleDetail.status === 'denied' || visibleDetail.status === 'error') &&
            <p role="alert" className="text-sm text-danger">{text('Could not verify this bill. No preview bill was displayed.',
              'এই বিল যাচাই করা যায়নি। কোনো নমুনা বিল দেখানো হয়নি।')}</p>}
          {currentDetail && (
            <div className="space-y-3 text-sm">
              <p>{text('Supplier', 'সরবরাহকারী')}: <strong>{currentDetail.supplierName}</strong></p>
              {currentDetail.supplierBillRef &&
                <p>{text('Supplier reference', 'সরবরাহকারীর রেফারেন্স')}: {currentDetail.supplierBillRef}</p>}
              <div className="grid grid-cols-3 gap-2 rounded-md border border-border p-3">
                <div>{text('Total', 'মোট')}<p className="font-semibold">{purchaseMoney(currentDetail.grandTotalMinor)}</p></div>
                <div>{text('Paid', 'পরিশোধ')}<p className="font-semibold">{purchaseMoney(currentDetail.paidMinor)}</p></div>
                <div>{text('Due', 'বাকি')}<p className="font-semibold">{purchaseMoney(currentDetail.dueMinor)}</p></div>
              </div>
              <div className="divide-y divide-border rounded-md border border-border">
                {currentDetail.lines.map(line => (
                  <div key={line.id} className="flex flex-wrap items-start justify-between gap-2 p-3 text-xs">
                    <div><p className="font-medium text-ink">{line.productName}</p>
                      <p className="text-ink-500">{line.qty / 1000} {line.unitName}
                        {line.expiryDate ? ' · ' + text('Expiry', 'মেয়াদ') + ': ' + line.expiryDate : ''}</p>
                    </div>
                    <div className="text-right">{purchaseMoney(line.lineTotalMinor)}</div>
                  </div>
                ))}
              </div>
              {currentDetail.payments && currentDetail.payments.length > 0 && (
                <section className="rounded-md border border-border">
                  <h3 className="border-b border-border px-3 py-2 font-medium">{text('Payments', 'পরিশোধ')}</h3>
                  {currentDetail.payments.map(payment => (
                    <div key={payment.id} className="flex justify-between gap-2 px-3 py-2 text-xs">
                      <span>{payment.number} · {payment.accountName}</span>
                      <span>{purchaseMoney(payment.amountMinor)}</span>
                    </div>
                  ))}
                </section>
              )}
              <p className="text-xs text-ink-500">{text('This is a read-only server bill. Posting, payment and correction require separate integration.',
                'এটি সার্ভারের শুধু দেখার বিল। নতুন ক্রয়, পরিশোধ ও সংশোধন আলাদা সংযোগে হবে।')}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
