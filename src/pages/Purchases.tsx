import {RowActionMenu} from '../components/layout/RowActionMenu';
import {SourceDeleteAction} from '../deletion/SourceDeleteAction';
import { MotionTabList, MotionTabIndicator } from '../motion/MotionTabList';
import {matchesSearch as fuzzyMatch} from '../utils/fuzzySearch';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '../components/Dialog';
import {PurchaseSourceDialog} from '../components/purchases/PurchaseSourceDialog';
import {purchasePosition,sourceEditable,sourceReturnable} from '../utils/purchaseSource';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  FileText,
  Filter,
  RotateCcw,
  Paperclip,
  Plus,
  Search,
  Undo2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { FormSelect } from '../components/FormSelect';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import {useUiCopy} from '../i18n/useUiCopy';
import {documentLabel} from '../i18n/documentCopy';
import {purchaseLabel,purchaseReturnMethod} from '../i18n/purchaseCopy';
import { StatusBadge } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { BillDetailDialog, type BillDetail } from '../components/purchases/BillDetailDialog';
import { availablePurchases, availablePurchaseEvents } from '../data/erpDemoStore';
import type { Purchase } from '../types/erp';
import { taka } from '../utils/currency';
import { FloatingPanel } from '../components/layout/FloatingPanel';
import { ActionMenuList, ActionMenuItem, ActionMenuDivider, ActionMenuTrigger } from '../components/layout/ActionMenu';
import { Eye, Printer, Pencil, Banknote, CornerUpLeft, History } from 'lucide-react';
import { printReport, downloadReport } from '../utils/reportOutput';
import { availableProducts } from '../data/erpDemoStore';
import { useSession } from '../integration/SessionProvider.tsx';
import { ApiError } from '../integration/errors.ts';
import { readPurchase, readPurchases, type ServerPurchaseEnvelope, type ServerPurchaseList, type ServerPurchaseListRow } from '../integration/purchases.ts';
import { purchaseMoney, purchaseSettlement, purchaseVisibleState, type IdentityBoundPurchaseState } from '../integration/purchases-read-model.ts';

type Tab = 'purchases' | 'return' | 'return-history';

const sampleReturnHistory = [
  { id: 'PR-000028', date: '29 Sep 2026', purchase: 'PUR-000117', supplier: 'Bismillah Steel House', items: 'MS Angle 1.5" · 45 Kg', amount: 4410, method: 'Supplier credit' },
  { id: 'PR-000027', date: '24 Sep 2026', purchase: 'PUR-000115', supplier: 'Hossain Electric', items: 'Ceiling Fan Regulator · 2 Pcs', amount: 510, method: 'Cash refund' },
  { id: 'PR-000026', date: '18 Sep 2026', purchase: 'PUR-000114', supplier: 'Bismillah Steel House', items: 'GI Wire 14 SWG · 12 Kg', amount: 1512, method: 'Supplier credit' }
];

function PayStatus({ total, paid }: { total: number; paid: number }) {
  const {text}=useUiCopy();
  if (paid >= total) return <StatusBadge tone="success" dot>{text('Paid','পরিশোধ')}</StatusBadge>;
  if (paid > 0) return <StatusBadge tone="warning" dot>{text('Partial','আংশিক')}</StatusBadge>;
  return <StatusBadge tone="danger" dot>{text('Due','বাকি')}</StatusBadge>;
}

function ReceiptThumb({ src, onClick }: { src?: string; onClick: () => void }) {
  const {language}=useUiCopy();
  if (!src) return <span className="text-xs text-helper">—</span>;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group relative block size-8 overflow-hidden rounded-md border border-border"
      aria-label={purchaseLabel(language,'View receipt')}>
      <img src={src} alt="" className="h-full w-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-inverse/40 opacity-0 transition-opacity group-hover:opacity-100">
        <Paperclip className="size-3 text-white" />
      </span>
    </button>
  );
}

/**
 * Keep preview business stores entirely unmounted in connected mode.
 * ConnectedWorkspaceGate remains authoritative for route activation.
 */
export function Purchases() {
  const { mode } = useSession();
  return mode === 'connected' ? <ConnectedPurchasesRead /> : <PreviewPurchases />;
}

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
 * This component never accesses preview ERP stores; PreviewPurchases mounts separately.
 *
 * Important: ConnectedWorkspaceGate currently prevents /app from mounting
 * for connected users; THIS component does not override that global gate.
 * It becomes reachable only in a later approved workspace activation task.
 */
function ConnectedPurchasesRead() {
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

function PreviewPurchases() {
  const {text,language}=useUiCopy();
  const pl=(s:string)=>purchaseLabel(language,s);
  const navigate = useNavigate();
  const [searchParams,setSearchParams]=useSearchParams();
  const routeTab=searchParams.get('tab');
  const [tab,setTab]=useState<Tab>(()=>routeTab==='return'||routeTab==='return-history'?routeTab:'purchases');
  useEffect(()=>{setTab(routeTab==='return'||routeTab==='return-history'?routeTab:'purchases');},[routeTab]);
  const chooseTab=(value:Tab)=>{setTab(value);setSearchParams(current=>{
   const next=new URLSearchParams(current);if(value==='purchases')next.delete('tab');else next.set('tab',value);return next;
  },{replace:true});};
  const [purchases,setPurchases] = useState<Purchase[]>(availablePurchases);
  const [sourceAction,setSourceAction]=useState<{purchase:Purchase;mode:'correction'|'payment'|'return'}|null>(null);
  const [events,setEvents]=useState(availablePurchaseEvents);
  const returnHistory=[...events.filter(e=>e.kind==='return').map(e=>({id:e.id,date:e.date,purchase:e.before.ref,supplier:e.before.supplier,items:(e.lines??[]).map(l=>(e.before.cartSnapshot?.[l.index].product.name??'Product')+' · '+l.quantity+' base units').join(', '),amount:e.amount,method:e.settlement==='cash'?'Refund '+taka(e.refund):'Supplier credit'})),...sampleReturnHistory];
  const [historySource,setHistorySource]=useState<Purchase|null>(null);
  const position=(p:Purchase)=>purchasePosition(p,events);
  const updated=(p:Purchase)=>{setPurchases(availablePurchases());setEvents(availablePurchaseEvents());setReturnPurchase(p);setSourceAction(null);toast.success(text('Purchase preview saved','ক্রয়ের প্রিভিউ সংরক্ষিত'),{description:text('Source history retained; backend posting is not connected.','আগের হিসাবের ইতিহাস আছে। আসল সার্ভারের খাতায় লেখা হয়নি।')});};
  const [detail, setDetail] = useState<BillDetail | null>(null);
  const routeQuery=searchParams.get('q') ?? '';
  const [query, setQuery] = useState(routeQuery);
  useEffect(()=>setQuery(routeQuery),[routeQuery]);
  const [returnQuery, setReturnQuery] = useState('');
  const [returnPurchase, setReturnPurchase] = useState<Purchase | null>(null);
  const [supplierFilter, setSupplierFilter] = useState('All suppliers');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [advancedFiltersOpen,setAdvancedFiltersOpen] = useState(false);
  const activeAdvancedCount = Number(supplierFilter !== 'All suppliers') + Number(statusFilter !== 'All status');
  const [returnError, setReturnError] = useState('');
  const openBill = (p: Purchase) => setDetail({ref: p.ref, date: p.date, party: p.supplier, partyId: p.supplierId, description: p.items, total: position(p).total, paid: position(p).paid, payments: p.payments, receipt: p.receipt});
  const resetFilters = () => { setQuery(''); setSupplierFilter('All suppliers'); setStatusFilter('All status'); };
  const printPurchase = (p: Purchase) => { const label=(s:string)=>documentLabel(language,s); if (!printReport({title:p.ref,language,subtitle:label('Purchase bill preview'),headers:[label('Field'),label('Value')],rows:[[label('Date'),p.date],[label('Supplier'),p.supplier],[label('Items'),p.items],[label('Total'),p.total],[label('Paid'),p.paid],[text('Due','দেনা'),p.total-p.paid]]})) toast.error(text('Allow the print popup and try again.','প্রিন্টের উইন্ডো খুলতে দিন, তারপর আবার চেষ্টা করুন।')); };
  const reviewReturn = (p: Purchase) => { setReturnPurchase(p); setReturnQuery(p.ref); setReturnError(''); chooseTab('return'); };

  const filteredPurchases = useMemo(() => purchases.filter(p => {
    const q = query.trim().toLocaleLowerCase();
    const status = position(p).paid >= position(p).total ? 'Paid' : position(p).paid > 0 ? 'Partial' : 'Due';
    return (supplierFilter === 'All suppliers' || p.supplier === supplierFilter)
      && (statusFilter === 'All status' || status === statusFilter)
      && fuzzyMatch(q,[p.ref,p.supplier,p.items,p.date]);
  }), [purchases,events,query,supplierFilter,statusFilter]);

  const purchaseTotal = purchases.reduce((sum, p) => sum + position(p).total, 0);
  const paidTotal = purchases.reduce((sum, p) => sum + position(p).paid, 0);
  const supplierDue = purchaseTotal - paidTotal;
  const returnsTotal = returnHistory.reduce((sum, item) => sum + item.amount, 0);

  const summary = [
    { label: text('Purchase total','ক্রয়ের মোট'), value: taka(purchaseTotal), sub: text(`${purchases.length} purchase invoices`,`${purchases.length}টি ক্রয় বিল`) },
    { label: text('Due to suppliers','সরবরাহকারীকে দেনা'), value: taka(supplierDue), sub: text('Supplier payable · দেনা','সরবরাহকারীর পাওনা'), tone: 'text-danger' },
    { label: text('Paid total','মোট পরিশোধ'), value: taka(paidTotal), sub: text('Cash, bank & mobile','ক্যাশ, ব্যাংক ও মোবাইল') },
    { label: text('Preview returns','প্রিভিউ ফেরত'), value: taka(returnsTotal), sub: text(`${returnHistory.length} preview / sample memos`,`${returnHistory.length}টি নমুনা/প্রিভিউ ফেরত`), tone: 'text-warning' }
  ];

  const selectReturnPurchase = () => {
    const q = returnQuery.trim().toLocaleLowerCase();
    setReturnPurchase(null);
    if (!q) { setReturnError('Enter the purchase reference or supplier name.'); return; }
    const exact = purchases.find(p => p.ref.toLocaleLowerCase() === q);
    const matches = exact ? [exact] : purchases.filter(p => fuzzyMatch(q,[p.ref,p.supplier]));
    if (!matches.length) { setReturnError('No purchase found. Check the reference.'); return; }
    if (matches.length > 1) { setReturnError('Several purchases match. Enter the exact purchase reference.'); return; }
    setReturnError(''); setReturnPurchase(matches[0]);
  };

  const tabs: Array<[Tab, string, string]> = [
    ['purchases', pl('Purchases'), pl('Purchase list & management')],
    ['return', text('Purchase return','ক্রয় ফেরত'), text('Review original purchase and return data','কেনা পণ্য ফেরতের হিসাব')],
    ['return-history', text('Return history','ফেরতের ইতিহাস'), text('Sample return history','ফেরতের নমুনা ও ইতিহাস')]
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Purchases"
        titleBn="ক্রয়"
        description="Purchase stock, manage supplier bills, update purchases and handle purchase returns."
        descriptionBn="পণ্য কেনা, সরবরাহকারীর বিল ও ফেরত দেখুন।"
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/app/parties')}>
              <FileText className="size-4" /> {text('Supplier ledger','সরবরাহকারীর খাতা')}
            </Button>
            <Button size="sm" onClick={() => navigate('/app/purchases/new')}>
              <Plus className="size-4" /> {text('New purchase','নতুন ক্রয়')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
            <p className="text-[12.5px] text-ink-500">{item.label}</p>
            <p className={`mt-0.5 text-lg font-semibold ${item.tone ?? 'text-ink'}`}>{item.value}</p>
            <p className="font-bn text-[11px] text-ink-400">{item.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card">
        <MotionTabList className="flex flex-wrap gap-1 border-b border-border px-3" role="tablist">
          {tabs.map(([id, label, helper]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => chooseTab(id)}
              title={helper}
              className={`flex items-center gap-1.5 px-2.5 py-2.5 text-[13px] font-medium ${
                tab === id ? 'text-ink' : 'text-ink-500 hover:text-ink'
              }`}>
              {label}
              {id === 'purchases' && (
                <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{purchases.length}</span>
              )}
              {id === 'return-history' && (
                <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{returnHistory.length}</span>
              )}
            <MotionTabIndicator active={tab === id} /></button>
          ))}
        </MotionTabList>

        {tab === 'purchases' && (
          <>
            <div data-purchases-filterbar="" className="border-b border-border p-3">
              <div className="grid grid-cols-[minmax(0,1fr)_36px] items-center gap-2 lg:grid-cols-[minmax(0,1fr)_160px_194px]">
                <div className="relative min-w-0">
                  <Search className="pointer-events-none absolute z-10 left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                  <Input aria-label={pl('Search purchases')} value={query} onChange={(e)=>setQuery(e.target.value)}
                    className="pl-8" placeholder={text('Search purchase ID, supplier or product','ক্রয় নম্বর, সরবরাহকারী বা পণ্য খুঁজুন')} />
                </div>
                <Button type="button" variant="outline" size="icon"
                  aria-label={text('Advanced filters','আরও ফিল্টার') + (activeAdvancedCount ? ' (' + activeAdvancedCount + ')' : '')}
                  aria-expanded={advancedFiltersOpen} aria-controls="purchase-list-advanced-filters"
                  data-active-filters={activeAdvancedCount>0?'true':'false'}
                  onClick={()=>setAdvancedFiltersOpen(open=>!open)}
                  className={'relative size-9 shrink-0 rounded-md lg:hidden ' +
                    (activeAdvancedCount?'border-teal-500 text-teal-700':'text-ink-500')}>
                  <Filter className="size-4" aria-hidden="true" />
                  {activeAdvancedCount>0 && <span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-teal-500" />}
                </Button>
                <div id="purchase-list-advanced-filters"
                  className={(advancedFiltersOpen?'grid ':'hidden ')+'col-span-2 grid-cols-1 gap-2 min-[360px]:grid-cols-2 lg:contents'}>
                  <FormSelect aria-label={pl('Purchase supplier filter')} className="min-w-0 w-full"
                    value={supplierFilter} onChange={e=>setSupplierFilter(e.target.value)}
                    options={[{value:'All suppliers',label:text('All suppliers','সব সরবরাহকারী')},...Array.from(new Set(purchases.map(p=>p.supplier)))]} />
                  <div className="flex min-w-0 items-center gap-2">
                    <FormSelect aria-label={pl('Purchase status filter')} className="min-w-0 flex-1"
                      value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
                      options={['All status','Paid','Partial','Due'].map(v=>({value:v,label:text(v,v==='All status'?'সব অবস্থা':v==='Paid'?'পরিশোধ':v==='Partial'?'আংশিক':'বাকি')}))} />
                    <Button type="button" variant="outline" size="icon" onClick={resetFilters}
                      aria-label={pl('Reset filters')} title={text('Reset all filters','সব ফিল্টার মুছুন')}
                      className="size-9 shrink-0 rounded-md text-ink-500">
                      <RotateCcw className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <Table data-purchases-table="" className="table-fixed md:table-auto" scrollRegionLabel={text('Purchases table','ক্রয়ের তালিকা')}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 w-[136px] pl-3 pr-1 text-xs md:w-auto md:px-4" >{text('Purchase','ক্রয়')}</TableHead>
                  <TableHead className="hidden h-9 text-xs md:table-cell" >{text('Supplier','সরবরাহকারী')}</TableHead>
                  <TableHead className="hidden h-9 text-xs xl:table-cell">{text('Items','পণ্য')}</TableHead>
                  <TableHead className="hidden h-9 text-xs xl:table-cell">{text('Memo','রসিদ')}</TableHead>
                  <TableHead className="h-9 w-[110px] px-1 text-right text-xs md:w-auto md:px-4">{text('Total','মোট')}</TableHead>
                  <TableHead className="hidden h-9 text-right text-xs xl:table-cell">{text('Paid','পরিশোধ')}</TableHead>
                  <TableHead className="hidden h-9 text-right text-xs md:table-cell">{text('Due','দেনা')}</TableHead>
                  <TableHead className="hidden h-9 text-xs md:table-cell">{text('Status','অবস্থা')}</TableHead>
                  <TableHead className="sticky right-0 z-10 h-9 w-12 bg-card pl-0 pr-3 text-right text-xs">{text('Action','কাজ')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((p) => {
                  const open = () => openBill(p);
                  return (
                    <TableRow key={p.id} className="cursor-pointer text-[13px]" onClick={open}>
                      <TableCell className="w-[136px] min-w-0 py-2 pl-3 pr-1 md:w-auto md:px-4">
                        <span className="whitespace-nowrap font-medium text-ink">{p.ref}</span>
                        <span data-table-helper="" className="block text-[11px] text-ink-400">{p.date}</span>
                        <Link to={`/app/parties?id=${p.supplierId}`} onClick={(e)=>e.stopPropagation()}
                          className="mt-1 block max-w-[152px] break-words text-xs font-medium text-teal-700 hover:underline md:hidden">
                          {p.supplier}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden py-2 md:table-cell">
                        <Link
                          to={`/app/parties?id=${p.supplierId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-teal-700 hover:underline">
                          {p.supplier}
                        </Link>
                      </TableCell>
                      <TableCell className="hidden max-w-[260px] truncate py-2 text-ink-600 xl:table-cell">{p.items}</TableCell>
                      <TableCell className="hidden py-2 xl:table-cell"><ReceiptThumb src={p.receipt} onClick={open} /></TableCell>
                      <TableCell className="w-[110px] min-w-0 py-2 pl-1 pr-1 text-right font-medium md:w-auto md:px-4">
                        <span className="whitespace-nowrap">{taka(position(p).total)}</span>
                        <span data-table-helper="" className="block text-[11px] font-normal text-ink-500 md:hidden">
                          {text('Due','দেনা')} {position(p).due > 0 ? taka(position(p).due) : '—'}
                        </span>
                        <span className="mt-0.5 flex justify-end md:hidden"><PayStatus total={position(p).total} paid={position(p).paid} /></span>
                      </TableCell>
                      <TableCell className="hidden py-2 text-right text-ink-600 xl:table-cell">{taka(position(p).paid)}</TableCell>
                      <TableCell className={`hidden py-2 text-right md:table-cell ${position(p).due > 0 ? 'font-medium text-danger' : 'text-ink-400'}`}>
                        {position(p).due > 0 ? taka(position(p).due) : '—'}
                      </TableCell>
                      <TableCell className="hidden py-2 md:table-cell"><PayStatus total={position(p).total} paid={position(p).paid} /></TableCell>
                      <TableCell className="sticky right-0 z-10 w-12 bg-card py-2 pl-0 pr-3 text-right">
                        <div onClick={e=>e.stopPropagation()}>
                          <FloatingPanel label={`${pl("Actions for")} ${p.ref}`} width={190}
                            trigger={({open,toggle})=><ActionMenuTrigger onClick={toggle}
                              label={`${pl("Actions for")} ${p.ref}`} expanded={open} />}>
                            {close => <ActionMenuList>
                              <ActionMenuItem icon={Eye} onClick={() => {close();openBill(p);}}>{text('View bill','বিল দেখুন')}</ActionMenuItem>
                              <ActionMenuItem icon={Printer} onClick={() => {close();printPurchase(p);}}>{text('Print bill','বিল প্রিন্ট')}</ActionMenuItem>
                              <ActionMenuItem icon={Pencil} disabled={!sourceEditable(p)||events.some(e=>e.purchaseId===p.id&&e.kind!=='correction')} title={pl('Complete original snapshots and no later allocations required')} onClick={()=>{close();setSourceAction({purchase:p,mode:'correction'});}}>{text('Correct purchase','ক্রয় সংশোধন')}</ActionMenuItem>
                              <ActionMenuDivider />
                              <ActionMenuItem icon={Banknote} disabled={!sourceEditable(p)||position(p).due<=0} title={pl('Payment needs a complete source bill with supplier due')} onClick={()=>{close();setSourceAction({purchase:p,mode:'payment'});}}>{text('Pay due','বাকি দিন')}</ActionMenuItem>
                              <ActionMenuItem icon={CornerUpLeft} onClick={() => {close();reviewReturn(p);}}>{text('Review return','ফেরত যাচাই')}</ActionMenuItem>
                              <ActionMenuItem icon={History} onClick={()=>{close();setHistorySource(p);}}>{text('Source history','পরিবর্তনের ইতিহাস')}</ActionMenuItem><SourceDeleteAction reason="Purchase cancellation is not connected. Payment allocations, returns and stock lots need a source-owned reversal." reasonBn="ক্রয় বাতিল সংযুক্ত নয়। পেমেন্ট, ফেরত ও স্টক লট একসাথে মূল লেনদেনে উল্টো করতে হবে।"/>
                            </ActionMenuList>}
                          </FloatingPanel>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!filteredPurchases.length && <TableRow><TableCell colSpan={9} className="py-8 text-center text-sm text-ink-500">{text('No purchases match these filters.','কোনো ক্রয় মেলেনি।')} <button onClick={resetFilters} className="text-teal-700 underline">{text('Reset filters','ফিল্টার মুছুন')}</button></TableCell></TableRow>}
              </TableBody>
            </Table>
          </>
        )}

        {tab === 'return' && (
          <div className="p-4">
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <div className="rounded-xl border border-border bg-ink-50/50 p-4">
                <div className="mb-3 flex items-start gap-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Search className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{text('Find original purchase','আগের ক্রয় খুঁজুন')}</h3>
                    <p className="text-xs text-ink-500">{text('Search by Purchase ID or supplier name.','ক্রয় নম্বর বা সরবরাহকারীর নাম দিয়ে খুঁজুন।')}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    value={returnQuery}
                    onChange={(e) => setReturnQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && selectReturnPurchase()}
                    aria-label={text("Find purchase reference","ক্রয় নম্বর খুঁজুন")}
                    placeholder={pl('PUR-000117 or supplier name')}
                  />
                  <Button className="w-full" onClick={selectReturnPurchase}>
                    <Search className="size-4" /> {pl('Find purchase')}
                  </Button>
                  {returnError && <p role="alert" className="text-xs text-danger">{pl(returnError)}</p>}
                </div>
                <div className="mt-4 border-t border-border pt-3 text-xs text-ink-500">
                  {text('Returns need original item prices, historical units and remaining returnable quantities. No refund or stock movement is posted in this source review.','পণ্য ফেরতের জন্য আগের কেনা দাম, একক ও কতটা ফেরত দেওয়া যাবে তা দেখুন। এই প্রিভিউতে আসল টাকা বা স্টক বদলাবে না।')}
                </div>
              </div>

              <div role="region" aria-label={pl('Purchase return source')} className="min-w-0 rounded-xl border border-border bg-card">
                {!returnPurchase ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                    <Undo2 className="mb-3 size-8 text-helper" />
                    <p className="text-sm font-medium text-ink">{text('No purchase selected','কোনো ক্রয় বাছা হয়নি')}</p>
                    <p className="mt-1 max-w-md text-xs text-ink-500">
                      {pl('Enter a purchase reference to review its source. Never calculate a refund from a bill summary.')}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">{returnPurchase.ref}</p>
                        <p className="text-xs text-ink-500">{returnPurchase.supplier} · {returnPurchase.date}</p>
                      </div>
                      <StatusBadge tone="teal">{pl('Source review')}</StatusBadge>
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="text-sm text-ink">{returnPurchase.items}</p>
                      <dl className="grid grid-cols-3 gap-2 rounded-lg bg-ink-50 p-3 text-xs">
                        <div><dt className="text-ink-500">{pl('Bill total')}</dt><dd className="font-semibold">{taka(returnPurchase.total)}</dd></div>
                        <div><dt className="text-ink-500">{pl('Paid')}</dt><dd>{taka(returnPurchase.paid)}</dd></div>
                        <div><dt className="text-ink-500">{pl('Due')}</dt><dd>{taka(returnPurchase.total-returnPurchase.paid)}</dd></div>
                      </dl>
                      {!!returnPurchase.inventoryLines?.length && <section aria-label={pl('Purchase source item snapshots')} className="space-y-2 rounded-lg border border-border p-3 text-xs">
                        <h4 className="font-semibold text-ink">{pl('Original item snapshots')}</h4>
                        {returnPurchase.inventoryLines.map((line,i) => <div key={i} className="flex flex-wrap justify-between gap-2 border-t border-border pt-2">
                          <span>{availableProducts().find(p => p.id === line.productId)?.name ?? line.productId}</span>
                          <span>{line.quantity} {pl('base units')} · {pl('Cost')} {line.unitCost === undefined ? pl('not available') : taka(line.unitCost)} {pl('per base unit')}</span>
                        </div>)}
                      </section>}
                      {sourceReturnable(returnPurchase)?<Button onClick={()=>setSourceAction({purchase:returnPurchase,mode:'return'})}>{pl('Choose return quantities')}</Button>:                      <div role="status" className="rounded-lg border border-border bg-warning-bg p-3 text-xs text-ink-700">
                        <p className="font-semibold">{pl('Return quantities unavailable · ফেরতযোগ্য পরিমাণ নেই')}</p>
                        <p className="mt-1">{pl('Check the original bill and previous returns first. Summary-only bills and tracked-stock returns need verified original units, serials/batches and allocation data from integration.')}</p>
                        <p className="mt-1">{pl('No return, refund or supplier credit has been recorded.')}</p>
                      </div>}
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" onClick={() => setReturnPurchase(null)}>{pl('Choose another purchase')}</Button>
                        <Button onClick={() => openBill(returnPurchase)}>{pl('View original bill')}</Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'return-history' && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-3">
              <div>
                <p className="text-[13px] font-medium text-ink">{pl('Purchase return history')}</p>
                <p className="text-[11px] text-ink-500">{pl('Preview and sample history · refunds and source purchases. Not live accounting records.')}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadReport('hisabiq-purchase-return-preview.csv', ['Reference','Date','Purchase','Supplier','Items','Amount','Method'], returnHistory.map(item => [item.id,item.date,item.purchase,item.supplier,item.items,item.amount,item.method]))}>
                <ArrowDownToLine className="size-4" /> {pl('Export')}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">{pl('Return')}</TableHead>
                  <TableHead className="h-9 text-xs" >{text('Purchase','ক্রয়')}</TableHead>
                  <TableHead className="h-9 text-xs" >{text('Supplier','সরবরাহকারী')}</TableHead>
                  <TableHead className="h-9 text-xs">{pl('Returned items')}</TableHead>
                  <TableHead className="h-9 text-xs">{pl('Refund method')}</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">{pl('Amount')}</TableHead><TableHead>{text('Actions','কাজ')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnHistory.map((item) => (
                  <TableRow key={item.id} className="text-[13px]">
                    <TableCell className="py-2 pl-4">
                      <span className="font-medium text-ink">{item.id}</span>
                      <span data-table-helper="" className="block text-[11px] text-ink-400">{item.date}</span>
                    </TableCell>
                    <TableCell className="py-2 text-teal-700">{item.purchase}</TableCell>
                    <TableCell className="py-2">{item.supplier}</TableCell>
                    <TableCell className="max-w-[280px] truncate py-2 text-ink-600">{item.items}</TableCell>
                    <TableCell className="py-2">
                      <StatusBadge tone={item.method === 'Cash refund' ? 'success' : 'neutral'}>{purchaseReturnMethod(language,item.method)}</StatusBadge>
                    </TableCell>
                    <TableCell className="py-2 pr-4 text-right font-medium">{taka(item.amount)}</TableCell><TableCell><RowActionMenu label={text('Actions for','কাজ')+' '+item.id}>{()=> <SourceDeleteAction reason="Purchase return reversal is not connected. Supplier credit/refund allocations and stock must be reviewed together."/>}</RowActionMenu></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      {sourceAction&&<PurchaseSourceDialog key={sourceAction.purchase.id+'-'+sourceAction.purchase.sourceRevision+'-'+sourceAction.mode} purchase={sourceAction.purchase} mode={sourceAction.mode} onClose={()=>setSourceAction(null)} onSaved={updated}/>}
      {historySource&&<Dialog open onOpenChange={value=>!value&&setHistorySource(null)}><DialogContent role="dialog" aria-modal="true" aria-label={pl('Purchase source history')} className="space-y-2 rounded-xl border border-border bg-card p-4 text-sm text-ink">
        <DialogHeader><DialogTitle>{pl('Source history')} · {historySource.ref}</DialogTitle><DialogDescription>{pl('UI preview source changes; backend posting is not connected.')}</DialogDescription></DialogHeader>
        <p>{pl('Supplier credit')} {taka(position(historySource).credit)} · {pl('Returns')} {taka(position(historySource).returned)}</p>
        {events.filter(e=>e.purchaseId===historySource.id).map(e=><p key={e.id}>{e.date} · {pl(e.kind)} · {e.reason} · {taka(e.amount)} {e.kind==='return'?' · '+pl(e.settlement??''):''}</p>)}
        {!events.some(e=>e.purchaseId===historySource.id)&&<p>{pl('No changes recorded in this preview.')}</p>}
        <Button onClick={()=>setHistorySource(null)}>{pl('Close history')}</Button>
      </DialogContent></Dialog>}
      <BillDetailDialog bill={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

