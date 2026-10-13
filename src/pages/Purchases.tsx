import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '../components/Dialog';
import {PurchaseSourceDialog} from '../components/purchases/PurchaseSourceDialog';
import {purchasePosition,sourceEditable,sourceReturnable} from '../utils/purchaseSource';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowDownToLine,
  FileText,
  MoreHorizontal,
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
import { StatusBadge } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { BillDetailDialog, type BillDetail } from '../components/purchases/BillDetailDialog';
import { availablePurchases, availablePurchaseEvents } from '../data/erpDemoStore';
import type { Purchase } from '../types/erp';
import { taka } from '../utils/currency';
import { FloatingPanel } from '../components/layout/FloatingPanel';
import { printReport, downloadReport } from '../utils/reportOutput';
import { availableProducts } from '../data/erpDemoStore';

type Tab = 'purchases' | 'return' | 'return-history';

const sampleReturnHistory = [
  { id: 'PR-000028', date: '29 Sep 2026', purchase: 'PUR-000117', supplier: 'Bismillah Steel House', items: 'MS Angle 1.5" · 45 Kg', amount: 4410, method: 'Supplier credit' },
  { id: 'PR-000027', date: '24 Sep 2026', purchase: 'PUR-000115', supplier: 'Hossain Electric', items: 'Ceiling Fan Regulator · 2 Pcs', amount: 510, method: 'Cash refund' },
  { id: 'PR-000026', date: '18 Sep 2026', purchase: 'PUR-000114', supplier: 'Bismillah Steel House', items: 'GI Wire 14 SWG · 12 Kg', amount: 1512, method: 'Supplier credit' }
];

function PayStatus({ total, paid }: { total: number; paid: number }) {
  if (paid >= total) return <StatusBadge tone="success" dot>Paid</StatusBadge>;
  if (paid > 0) return <StatusBadge tone="warning" dot>Partial</StatusBadge>;
  return <StatusBadge tone="danger" dot>Due</StatusBadge>;
}

function ReceiptThumb({ src, onClick }: { src?: string; onClick: () => void }) {
  if (!src) return <span className="text-xs text-helper">—</span>;
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="group relative block size-8 overflow-hidden rounded-md border border-border"
      aria-label="View receipt">
      <img src={src} alt="" className="h-full w-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-inverse/40 opacity-0 transition-opacity group-hover:opacity-100">
        <Paperclip className="size-3 text-white" />
      </span>
    </button>
  );
}

export function Purchases() {
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
  const updated=(p:Purchase)=>{setPurchases(availablePurchases());setEvents(availablePurchaseEvents());setReturnPurchase(p);setSourceAction(null);toast.success('Purchase preview saved',{description:'Source history retained; backend posting is not connected.'});};
  const [detail, setDetail] = useState<BillDetail | null>(null);
  const routeQuery=searchParams.get('q') ?? '';
  const [query, setQuery] = useState(routeQuery);
  useEffect(()=>setQuery(routeQuery),[routeQuery]);
  const [returnQuery, setReturnQuery] = useState('');
  const [returnPurchase, setReturnPurchase] = useState<Purchase | null>(null);
  const [supplierFilter, setSupplierFilter] = useState('All suppliers');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [returnError, setReturnError] = useState('');
  const openBill = (p: Purchase) => setDetail({ref: p.ref, date: p.date, party: p.supplier, partyId: p.supplierId, description: p.items, total: position(p).total, paid: position(p).paid, payments: p.payments, receipt: p.receipt});
  const resetFilters = () => { setQuery(''); setSupplierFilter('All suppliers'); setStatusFilter('All status'); };
  const printPurchase = (p: Purchase) => { if (!printReport({title: p.ref, subtitle: 'Purchase bill preview', headers: ['Field', 'Value'], rows: [['Date',p.date],['Supplier',p.supplier],['Items',p.items],['Total',p.total],['Paid',p.paid],['Due',p.total-p.paid]]})) toast.error('Allow the print popup and try again.'); };
  const reviewReturn = (p: Purchase) => { setReturnPurchase(p); setReturnQuery(p.ref); setReturnError(''); chooseTab('return'); };

  const filteredPurchases = useMemo(() => purchases.filter(p => {
    const q = query.trim().toLocaleLowerCase();
    const status = position(p).paid >= position(p).total ? 'Paid' : position(p).paid > 0 ? 'Partial' : 'Due';
    return (supplierFilter === 'All suppliers' || p.supplier === supplierFilter)
      && (statusFilter === 'All status' || status === statusFilter)
      && (!q || [p.ref,p.supplier,p.items,p.date].some(value => value.toLocaleLowerCase().includes(q)));
  }), [purchases,events,query,supplierFilter,statusFilter]);

  const purchaseTotal = purchases.reduce((sum, p) => sum + position(p).total, 0);
  const paidTotal = purchases.reduce((sum, p) => sum + position(p).paid, 0);
  const supplierDue = purchaseTotal - paidTotal;
  const returnsTotal = returnHistory.reduce((sum, item) => sum + item.amount, 0);

  const summary = [
    { label: 'Purchase total', value: taka(purchaseTotal), sub: `${purchases.length} purchase invoices` },
    { label: 'Due to suppliers', value: taka(supplierDue), sub: 'Supplier payable · দেনা', tone: 'text-danger' },
    { label: 'Paid total', value: taka(paidTotal), sub: 'Cash, bank & mobile' },
    { label: 'Preview returns', value: taka(returnsTotal), sub: `${returnHistory.length} preview / sample memos`, tone: 'text-warning' }
  ];

  const selectReturnPurchase = () => {
    const q = returnQuery.trim().toLocaleLowerCase();
    setReturnPurchase(null);
    if (!q) { setReturnError('Enter the purchase reference or supplier name.'); return; }
    const exact = purchases.find(p => p.ref.toLocaleLowerCase() === q);
    const matches = exact ? [exact] : purchases.filter(p => p.ref.toLocaleLowerCase().includes(q) || p.supplier.toLocaleLowerCase().includes(q));
    if (!matches.length) { setReturnError('No purchase found. Check the reference.'); return; }
    if (matches.length > 1) { setReturnError('Several purchases match. Enter the exact purchase reference.'); return; }
    setReturnError(''); setReturnPurchase(matches[0]);
  };

  const tabs: Array<[Tab, string, string]> = [
    ['purchases', 'Purchases', 'Purchase list & management'],
    ['return', 'Purchase return', 'Review original purchase and return data'],
    ['return-history', 'Return history', 'Sample return history']
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
              <FileText className="size-4" /> Supplier ledger
            </Button>
            <Button size="sm" onClick={() => navigate('/app/purchases/new')}>
              <Plus className="size-4" /> New purchase
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
        <div className="flex flex-wrap gap-1 border-b border-border px-3" role="tablist">
          {tabs.map(([id, label, helper]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => chooseTab(id)}
              title={helper}
              className={`flex items-center gap-1.5 px-2.5 py-2.5 text-[13px] font-medium ${
                tab === id ? 'erp-tab-active text-ink' : 'text-ink-500 hover:text-ink'
              }`}>
              {label}
              {id === 'purchases' && (
                <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{purchases.length}</span>
              )}
              {id === 'return-history' && (
                <span className="rounded bg-ink-50 px-1.5 text-[10.5px] text-ink-500">{returnHistory.length}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'purchases' && (
          <>
            <div className="flex flex-col gap-2 border-b border-border p-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1 sm:max-w-md">
                <Search className="pointer-events-none absolute z-10 left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
                <Input
                  aria-label="Search purchases"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8"
                  placeholder="Search purchase ID, supplier or product"
                />
              </div>
              <FormSelect aria-label="Purchase supplier filter" className="w-full sm:w-40" value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} options={['All suppliers', ...Array.from(new Set(purchases.map(p => p.supplier)))]} />
              <FormSelect aria-label="Purchase status filter" className="w-full sm:w-36" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} options={['All status', 'Paid', 'Partial', 'Due']} />
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">Purchase</TableHead>
                  <TableHead className="h-9 text-xs">Supplier</TableHead>
                  <TableHead className="h-9 text-xs">Items</TableHead>
                  <TableHead className="h-9 text-xs">Memo</TableHead>
                  <TableHead className="h-9 text-right text-xs">Total</TableHead>
                  <TableHead className="h-9 text-right text-xs">Paid</TableHead>
                  <TableHead className="h-9 text-right text-xs">Due</TableHead>
                  <TableHead className="h-9 text-xs">Status</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((p) => {
                  const open = () => openBill(p);
                  return (
                    <TableRow key={p.id} className="cursor-pointer text-[13px]" onClick={open}>
                      <TableCell className="py-2 pl-4">
                        <span className="font-medium text-ink">{p.ref}</span>
                        <span className="block text-[11px] text-ink-400">{p.date}</span>
                      </TableCell>
                      <TableCell className="py-2">
                        <Link
                          to={`/app/parties?id=${p.supplierId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-teal-700 hover:underline">
                          {p.supplier}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[260px] truncate py-2 text-ink-600">{p.items}</TableCell>
                      <TableCell className="py-2"><ReceiptThumb src={p.receipt} onClick={open} /></TableCell>
                      <TableCell className="py-2 text-right font-medium">{taka(position(p).total)}</TableCell>
                      <TableCell className="py-2 text-right text-ink-600">{taka(position(p).paid)}</TableCell>
                      <TableCell className={`py-2 text-right ${position(p).due > 0 ? 'font-medium text-danger' : 'text-ink-400'}`}>
                        {position(p).due > 0 ? taka(position(p).due) : '—'}
                      </TableCell>
                      <TableCell className="py-2"><PayStatus total={position(p).total} paid={position(p).paid} /></TableCell>
                      <TableCell className="py-2 pr-4 text-right">
                        <div onClick={e => e.stopPropagation()}>
                          <FloatingPanel label={`Actions for ${p.ref}`} width={190} trigger={({toggle}) => <button onClick={toggle} className="rounded-md p-1.5 text-ink-500 hover:bg-ink-50" aria-label={`Actions for ${p.ref}`}><MoreHorizontal className="size-4" /></button>}>
                            {close => <div className="p-1 text-left text-xs">
                              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {close();openBill(p);}}>View bill</Button>
                              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {close();printPurchase(p);}}>Print bill</Button>
                              <Button variant="ghost" size="sm" className="w-full justify-start" disabled={!sourceEditable(p)||events.some(e=>e.purchaseId===p.id&&e.kind!=='correction')} title="Complete original snapshots and no later allocations required" onClick={()=>{close();setSourceAction({purchase:p,mode:'correction'});}}>Correct purchase</Button>
                              <Button variant="ghost" size="sm" className="w-full justify-start" disabled={!sourceEditable(p)||position(p).due<=0} title="Payment needs a complete source bill with supplier due" onClick={()=>{close();setSourceAction({purchase:p,mode:'payment'});}}>Pay due</Button>
                              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => {close();reviewReturn(p);}}>Review return</Button>
                              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={()=>{close();setHistorySource(p);}}>Source history</Button>
                            </div>}
                          </FloatingPanel>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!filteredPurchases.length && <TableRow><TableCell colSpan={9} className="py-8 text-center text-sm text-ink-500">No purchases match these filters. <button onClick={resetFilters} className="text-teal-700 underline">Reset filters</button></TableCell></TableRow>}
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
                    <h3 className="text-sm font-semibold text-ink">Find original purchase</h3>
                    <p className="text-xs text-ink-500">Search by Purchase ID or supplier name.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Input
                    value={returnQuery}
                    onChange={(e) => setReturnQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && selectReturnPurchase()}
                    aria-label="Find purchase reference"
                    placeholder="PUR-000117 or supplier name"
                  />
                  <Button className="w-full" onClick={selectReturnPurchase}>
                    <Search className="size-4" /> Find purchase
                  </Button>
                  {returnError && <p role="alert" className="text-xs text-danger">{returnError}</p>}
                </div>
                <div className="mt-4 border-t border-border pt-3 text-xs text-ink-500">
                  Returns need original item prices, historical units and remaining returnable quantities. No refund or stock movement is posted in this source review.
                </div>
              </div>

              <div role="region" aria-label="Purchase return source" className="min-w-0 rounded-xl border border-border bg-card">
                {!returnPurchase ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                    <Undo2 className="mb-3 size-8 text-helper" />
                    <p className="text-sm font-medium text-ink">No purchase selected</p>
                    <p className="mt-1 max-w-md text-xs text-ink-500">
                      Enter a purchase reference to review its source. Never calculate a refund from a bill summary.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink">{returnPurchase.ref}</p>
                        <p className="text-xs text-ink-500">{returnPurchase.supplier} · {returnPurchase.date}</p>
                      </div>
                      <StatusBadge tone="teal">Source review</StatusBadge>
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="text-sm text-ink">{returnPurchase.items}</p>
                      <dl className="grid grid-cols-3 gap-2 rounded-lg bg-ink-50 p-3 text-xs">
                        <div><dt className="text-ink-500">Bill total</dt><dd className="font-semibold">{taka(returnPurchase.total)}</dd></div>
                        <div><dt className="text-ink-500">Paid</dt><dd>{taka(returnPurchase.paid)}</dd></div>
                        <div><dt className="text-ink-500">Due</dt><dd>{taka(returnPurchase.total-returnPurchase.paid)}</dd></div>
                      </dl>
                      {!!returnPurchase.inventoryLines?.length && <section aria-label="Purchase source item snapshots" className="space-y-2 rounded-lg border border-border p-3 text-xs">
                        <h4 className="font-semibold text-ink">Original item snapshots</h4>
                        {returnPurchase.inventoryLines.map((line,i) => <div key={i} className="flex flex-wrap justify-between gap-2 border-t border-border pt-2">
                          <span>{availableProducts().find(p => p.id === line.productId)?.name ?? line.productId}</span>
                          <span>{line.quantity} base units · cost {line.unitCost === undefined ? 'not available' : taka(line.unitCost)} per base unit</span>
                        </div>)}
                      </section>}
                      {sourceReturnable(returnPurchase)?<Button onClick={()=>setSourceAction({purchase:returnPurchase,mode:'return'})}>Choose return quantities</Button>:                      <div role="status" className="rounded-lg border border-border bg-warning-bg p-3 text-xs text-ink-700">
                        <p className="font-semibold">Return quantities unavailable · ফেরতযোগ্য পরিমাণ নেই</p>
                        <p className="mt-1">Check the original bill and previous returns first. Summary-only bills and tracked-stock returns need verified original units, serials/batches and allocation data from integration.</p>
                        <p className="mt-1">No return, refund or supplier credit has been recorded.</p>
                      </div>}
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="outline" onClick={() => setReturnPurchase(null)}>Choose another purchase</Button>
                        <Button onClick={() => openBill(returnPurchase)}>View original bill</Button>
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
                <p className="text-[13px] font-medium text-ink">Purchase return history</p>
                <p className="text-[11px] text-ink-500">Preview and sample history · refunds and source purchases. Not live accounting records.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadReport('hisabiq-purchase-return-preview.csv', ['Reference','Date','Purchase','Supplier','Items','Amount','Method'], returnHistory.map(item => [item.id,item.date,item.purchase,item.supplier,item.items,item.amount,item.method]))}>
                <ArrowDownToLine className="size-4" /> Export
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 pl-4 text-xs">Return</TableHead>
                  <TableHead className="h-9 text-xs">Purchase</TableHead>
                  <TableHead className="h-9 text-xs">Supplier</TableHead>
                  <TableHead className="h-9 text-xs">Returned items</TableHead>
                  <TableHead className="h-9 text-xs">Refund method</TableHead>
                  <TableHead className="h-9 pr-4 text-right text-xs">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnHistory.map((item) => (
                  <TableRow key={item.id} className="text-[13px]">
                    <TableCell className="py-2 pl-4">
                      <span className="font-medium text-ink">{item.id}</span>
                      <span className="block text-[11px] text-ink-400">{item.date}</span>
                    </TableCell>
                    <TableCell className="py-2 text-teal-700">{item.purchase}</TableCell>
                    <TableCell className="py-2">{item.supplier}</TableCell>
                    <TableCell className="max-w-[280px] truncate py-2 text-ink-600">{item.items}</TableCell>
                    <TableCell className="py-2">
                      <StatusBadge tone={item.method === 'Cash refund' ? 'success' : 'neutral'}>{item.method}</StatusBadge>
                    </TableCell>
                    <TableCell className="py-2 pr-4 text-right font-medium">{taka(item.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>

      {sourceAction&&<PurchaseSourceDialog key={sourceAction.purchase.id+'-'+sourceAction.purchase.sourceRevision+'-'+sourceAction.mode} purchase={sourceAction.purchase} mode={sourceAction.mode} onClose={()=>setSourceAction(null)} onSaved={updated}/>}
      {historySource&&<Dialog open onOpenChange={value=>!value&&setHistorySource(null)}><DialogContent role="dialog" aria-modal="true" aria-label="Purchase source history" className="space-y-2 rounded-xl border border-border bg-card p-4 text-sm text-ink">
        <DialogHeader><DialogTitle>Source history · {historySource.ref}</DialogTitle><DialogDescription>UI preview source changes; backend posting is not connected.</DialogDescription></DialogHeader>
        <p>Supplier credit {taka(position(historySource).credit)} · Returns {taka(position(historySource).returned)}</p>
        {events.filter(e=>e.purchaseId===historySource.id).map(e=><p key={e.id}>{e.date} · {e.kind} · {e.reason} · {taka(e.amount)} {e.kind==='return'?' · '+e.settlement:''}</p>)}
        {!events.some(e=>e.purchaseId===historySource.id)&&<p>No changes recorded in this preview.</p>}
        <Button onClick={()=>setHistorySource(null)}>Close history</Button>
      </DialogContent></Dialog>}
      <BillDetailDialog bill={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

