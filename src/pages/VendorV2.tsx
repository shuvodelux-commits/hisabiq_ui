import {useMemo,useState,useSyncExternalStore} from 'react';
import {useNavigate,useSearchParams} from 'react-router-dom';
import {ArrowLeft,ChevronDown,Ellipsis,Plus} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {PageHeader} from '../components/PageHeader';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '../components/Dialog';
import {PartyAvatar} from '../components/PartyAvatar';
import {PartyEditorDialog} from '../components/parties/PartyEditorDialog';
import {VendorDirectory,type VendorDirectoryFilter} from '../components/vendor/VendorDirectory';
import {VendorV2Cart} from '../components/vendor/VendorV2Cart';
import {VendorSourceWorkspace} from '../components/vendor/VendorSourceWorkspace';
import {PurchaseEditor} from './PurchaseEditor';
import {availableParties,availableProducts,availablePurchases} from '../data/erpDemoStore';
import {salesInvoices} from '../data/sales';
import {getPartyPreviewSnapshot,subscribePartyPreview,dispatchPartyPreview} from '../data/partyPreviewStore';
import {getVendorPreviewSnapshot,subscribeVendorPreview} from '../vendor/vendorPreviewStore';
import {sourceOutstanding,vendorBalances} from '../vendor/vendorModel';
import {filterVendors} from '../vendor/vendorRoute';
import {isPartyOpening} from '../utils/partyOpening';
import {businessToday} from '../utils/dateRange';
import {taka} from '../utils/currency';
import type {Party} from '../types/erp';
import type {PartyDraft,PartyOpeningPayload} from '../types/partyLedger';
import type {VendorSource} from '../vendor/vendorTypes';

type WorkTab='ledger'|'taken'|'given';
type Editor='taken'|'given'|'purchase'|null;
type DateFilter='today'|'week'|'all';
const dateWithin=(date:string,period:DateFilter)=>{
 if(period==='all')return true;
 const today=businessToday();
 if(period==='today')return date===today;
 const end=new Date(today+'T12:00:00Z');end.setUTCDate(end.getUTCDate()-6);
 return date>=end.toISOString().slice(0,10)&&date<=today;
};
const stillOpen=(snapshot:ReturnType<typeof getVendorPreviewSnapshot>,s:VendorSource)=>{
 const x=sourceOutstanding(snapshot,s.id);
 return x.unpricedBaseQty>0||(x.monetaryDuePaisa??0)>0;
};
const memoKey=(s:VendorSource)=>s.memoId||s.sourceInvoiceId||s.reference||s.id;

export function VendorV2(){
 const navigate=useNavigate();
 const [params,setParams]=useSearchParams();
 const partyState=useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);
 const snapshot=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);
 const vendors=availableParties().filter(p=>p.roles.includes('Vendor')&&p.status!=='Inactive');
 const party=vendors.find(p=>p.id===params.get('partyId'))??vendors[0]??null;
 const [search,setSearch]=useState('');
 const [filter,setFilter]=useState<VendorDirectoryFilter>('all');
 const [picker,setPicker]=useState(false);
 const [editingParty,setEditingParty]=useState<Party|null|undefined>(undefined);
 const [tab,setTab]=useState<WorkTab>('ledger');
 const [editor,setEditor]=useState<Editor>(null);
 const [dirty,setDirty]=useState(false);
 const [more,setMore]=useState(false);
 const [selectedSource,setSelectedSource]=useState<string|null>(null);
 const [query,setQuery]=useState('');
 const [dateFilter,setDateFilter]=useState<DateFilter>('all');
 const [purchaseRevision,setPurchaseRevision]=useState(0);
 const rows=vendors.map(p=>({p,balance:vendorBalances(snapshot,p.id)}));
 const results=filterVendors(vendors,search);
 const shown=rows.filter(row=>results.some(v=>v.id===row.p.id)&&(
  filter==='all'||filter==='needs-price'&&row.balance.unpricedSourceCount>0||
  filter==='pay'&&row.balance.knownPayablePaisa>0||
  filter==='receive'&&row.balance.knownReceivablePaisa>0
 ));
 const balance=party?vendorBalances(snapshot,party.id):null;
 const sources=snapshot.sources.filter(s=>party&&s.vendorPartyId===party.id&&s.status==='Active');
 const pendingPrice=sources.filter(s=>sourceOutstanding(snapshot,s.id).unpricedBaseQty>0).length;
 const pendingGoods=sources.filter(s=>stillOpen(snapshot,s)).length;
 const groups=useMemo(()=>{
  const groups=new Map<string,VendorSource[]>();
  sources.forEach(s=>{const key=memoKey(s);groups.set(key,[...(groups.get(key)||[]),s]);});
  return [...groups].map(([key,lines])=>({
   key,lines,kind:lines[0].sourceKind==='sourcing'?'taken' as const:'given' as const,
   date:lines[0].date,reference:lines[0].reference??key,
   duePaisa:lines.reduce((sum,s)=>sum+(sourceOutstanding(snapshot,s.id).monetaryDuePaisa??0),0),
   pricePending:lines.filter(s=>sourceOutstanding(snapshot,s.id).unpricedBaseQty>0).length,
   open:lines.some(s=>stillOpen(snapshot,s))
  }));
 },[sources,snapshot]);
 const catalog=availableProducts();
 const purchases=useMemo(()=>availablePurchases().filter(p=>party&&p.supplierId===party.id),[party?.id,purchaseRevision]);
 const sales=useMemo(()=>salesInvoices.filter(s=>party&&s.partyId===party.id),[party?.id]);
 const entries=[
  ...groups.map(g=>({id:g.key,date:g.date,type:g.kind==='taken'?'Taken':'Given',title:g.lines.map(s=>catalog.find(p=>p.id===s.productId)?.name??s.productId).join(', '),
   sub:g.lines.length+' products · '+g.reference,amount:g.duePaisa,pricePending:g.pricePending,open:g.open,first:g.lines[0].id,kind:g.kind})),
  ...(tab==='ledger'?purchases.map(p=>({id:p.id,date:p.businessDate??p.date,type:'Purchase',title:p.items,sub:p.ref,
   amount:Math.max(0,p.total-p.paid)*100,pricePending:0,open:p.total>p.paid,first:'',kind:'purchase' as const})):[]),
  ...(tab==='ledger'?sales.map(s=>({id:s.id,date:s.date,type:'Sale',title:s.items,sub:s.invoice,
   amount:Math.max(0,s.due)*100,pricePending:0,open:s.due>0,first:'',kind:'sale' as const})):[])
 ].filter(g=>(tab==='ledger'||g.kind===tab)&&dateWithin(g.date,dateFilter)&&
  [g.title,g.sub,g.type].some(text=>String(text).toLowerCase().includes(query.toLowerCase()))).sort((a,b)=>b.date.localeCompare(a.date));
 const selectParty=(id:string)=>{
  if(dirty&&!window.confirm('Discard unfinished goods cart?'))return;
  setDirty(false);setEditor(null);setSelectedSource(null);setTab('ledger');setPicker(false);setMore(false);setQuery('');
  setParams({partyId:id});
 };
 const changeTab=(next:WorkTab)=>{
  if(dirty&&!window.confirm('Discard unfinished goods cart?'))return;
  setTab(next);setEditor(null);setDirty(false);setSelectedSource(null);
 };
 const openEditor=(next:Editor)=>{
  if(dirty&&editor!==next&&!window.confirm('Discard unfinished goods cart?'))return;
  setEditor(next);setDirty(false);setMore(false);setSelectedSource(null);
 };
 const saveParty=(draft:PartyDraft,openings:Omit<PartyOpeningPayload,'partyId'>[])=>{
  if(editingParty){
   dispatchPartyPreview({type:'update-party',id:editingParty.id,patch:{...draft,roles:[...new Set<Party['roles'][number]>([...draft.roles,'Vendor'])]},openings});
   toast.success('Vendor updated in preview');return;
  }
  const existing=availableParties().find(p=>(draft.phone&&p.phone.replace(/\D/g,'')===draft.phone.replace(/\D/g,''))
   ||p.name.trim().toLowerCase()===draft.name.trim().toLowerCase());
  if(existing){
   if(!existing.roles.includes('Vendor'))dispatchPartyPreview({type:'update-party',id:existing.id,patch:{roles:[...existing.roles,'Vendor' as const]},openings});
   selectParty(existing.id);toast.info('Existing Party selected as Vendor');return;
  }
  const before=new Set(availableParties().map(p=>p.id));
  const next=dispatchPartyPreview({type:'create-party',party:{...draft,roles:[...new Set<Party['roles'][number]>([...draft.roles,'Vendor'])],name:draft.name.trim()},openings});
  const created=next.parties.find(p=>!before.has(p.id));
  if(created)selectParty(created.id);
  toast.success('Vendor added in preview');
 };
 const sell=()=>{
  if(!party)return;
  if(!party.roles.includes('Customer')){
   if(!window.confirm('Add Customer role to '+party.name+' to sell through POS?'))return;
   dispatchPartyPreview({type:'update-party',id:party.id,patch:{roles:[...party.roles,'Customer' as const]},openings:[]});
  }
  navigate('/app/pos?partyId='+encodeURIComponent(party.id));
 };
 const review=(sourceId:string,kind:'taken'|'given')=>{
  setTab(kind);setSelectedSource(sourceId);setEditor(null);
 };
 return <div data-vendor-v2 className="mx-auto max-w-[1440px] min-w-0 space-y-3 pb-8">
  {editor&&party?<>
   {editor==='purchase'?
    <div className="space-y-2"><Button type="button" variant="outline" size="sm" onClick={()=>openEditor(null)}><ArrowLeft className="size-4"/> Vendor workspace</Button>
     <PurchaseEditor key={party.id} initialSupplierId={party.id} lockedSupplierId={party.id} embedded onCompleted={()=>{setPurchaseRevision(n=>n+1);openEditor(null);}} onCancel={()=>openEditor(null)}/></div>:
    <VendorV2Cart key={party.id+editor} partyId={party.id} partyName={party.name} mode={editor}
     onDirtyChange={setDirty} onCancel={()=>openEditor(null)}
     onSaved={()=>{setEditor(null);setDirty(false);setTab(editor==='given'?'given':'taken');toast.success('Vendor goods memo saved in UI preview');}}/>
   }
  </>:<>
  <div className="hidden sm:block">
   <PageHeader compact title="Vendor V2" titleBn="ভেন্ডর লেনদেন"
    description="Goods taken, given and settled · UI preview only"
    actions={<div className="flex items-center gap-2">
     <Button type="button" variant="outline" size="sm" onClick={()=>navigate('/app/vendors'+(party?'?partyId='+encodeURIComponent(party.id):''))}>Vendor V1</Button>
     <Button type="button" size="sm" onClick={()=>setEditingParty(null)}><Plus className="size-4"/> Add Vendor</Button>
    </div>}/>
  </div>
  <div className="flex flex-wrap items-start justify-between gap-2 sm:hidden" aria-label="Vendor V2 mobile page heading">
   <div className="min-w-0"><h1 className="text-lg font-semibold text-ink">Vendor V2</h1>
    <p className="font-bn text-xs text-ink-500">ভেন্ডর লেনদেন</p></div>
   <div className="flex items-center gap-1.5">
    <Button size="sm" variant="outline" onClick={()=>navigate('/app/vendors'+(party?'?partyId='+encodeURIComponent(party.id):''))}>V1</Button>
    <Button size="sm" onClick={()=>setEditingParty(null)}><Plus className="size-4"/> Vendor</Button>
   </div>
  </div>
  <div className="grid min-w-0 gap-3 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[330px_minmax(0,1fr)]">
   <div className="hidden min-w-0 lg:block">
    <VendorDirectory rows={rows} shown={shown} selectedId={party?.id??''} query={search}
     onQuery={setSearch} filter={filter} onFilter={setFilter} onSelect={selectParty}/>
   </div>
   <div className="min-w-0 space-y-3">
    <div className="lg:hidden">
     <Button type="button" size="sm" variant="outline" className="w-full justify-between" onClick={()=>setPicker(true)}>
      {party?.name??'Choose Vendor'} <ChevronDown className="size-4"/></Button>
    </div>
    {party?<section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-card" aria-label="Vendor V2 workspace">
     <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-3">
      <div className="flex min-w-0 items-center gap-3"><PartyAvatar name={party.name} color={party.avatarColor} image={party.image} size={40}/>
       <div className="min-w-0"><h2 className="truncate text-base font-semibold text-ink">{party.name}</h2>
        <p className="text-[11px] text-ink-500">{party.phone} · {party.area}</p></div></div>
      <div className="flex flex-wrap items-center gap-2">
       <Button size="sm" onClick={()=>openEditor('taken')}><Plus className="size-4"/> Take Goods</Button>
       <Button variant="outline" size="sm" onClick={()=>openEditor('given')}><Plus className="size-4"/> Give Goods</Button>
       <div className="relative">
        <Button type="button" size="sm" variant="outline" onClick={()=>setMore(x=>!x)} aria-expanded={more}><Ellipsis className="size-4"/> More</Button>
        {more&&<div className="absolute right-0 top-full z-30 mt-1 min-w-[176px] rounded-md border border-border bg-popover p-1 shadow-lg">
         <button type="button" className="block h-9 w-full rounded px-2 text-left text-xs hover:bg-ink-50" onClick={()=>openEditor('purchase')}>New Purchase</button>
         <button type="button" className="block h-9 w-full rounded px-2 text-left text-xs hover:bg-ink-50" onClick={()=>{setMore(false);sell();}}>New Sale in POS</button>
         <button type="button" className="block h-9 w-full rounded px-2 text-left text-xs hover:bg-ink-50" onClick={()=>{setEditingParty(party);setMore(false);}}>Edit Vendor</button>
         <button type="button" className="block h-9 w-full rounded px-2 text-left text-xs hover:bg-ink-50" onClick={()=>navigate('/app/vendors?partyId='+encodeURIComponent(party.id))}>Open Vendor V1</button>
        </div>}
       </div>
      </div>
     </div>
     <div className="grid grid-cols-2 gap-2 border-b border-border p-3 sm:grid-cols-4" aria-label="Vendor V2 balances">
      <div className="rounded-md bg-ink-50 p-2"><p className="text-[11px] text-ink-500">You owe · দিতে হবে</p>
       <strong className="text-base text-danger">{taka((balance?.knownPayablePaisa??0)/100)}</strong></div>
      <div className="rounded-md bg-ink-50 p-2"><p className="text-[11px] text-ink-500">They owe · পাবেন</p>
       <strong className="text-base text-success">{taka((balance?.knownReceivablePaisa??0)/100)}</strong></div>
      <div className="rounded-md bg-ink-50 p-2"><p className="text-[11px] text-ink-500">Goods pending</p><strong className="text-base text-ink">{pendingGoods}</strong></div>
      <div className="rounded-md bg-ink-50 p-2"><p className="text-[11px] text-ink-500">Price pending</p><strong className="text-base text-warning">{pendingPrice}</strong></div>
     </div>
     <div className="flex gap-4 border-b border-border px-3" role="tablist" aria-label="Vendor V2 tabs">
      {(['ledger','taken','given'] as const).map(k=><button key={k} role="tab" type="button" aria-selected={tab===k}
       className={'h-10 border-b-2 px-1 text-[13px] font-medium capitalize '+(tab===k?'border-primary text-ink':'border-transparent text-ink-500 hover:text-ink')}
       onClick={()=>changeTab(k)}>{k==='ledger'?'Ledger':k==='taken'?'Taken':'Given'}</button>)}
     </div>
     <div className="min-w-0 space-y-3 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
       <h3 className="text-[13px] font-semibold text-ink">{tab==='ledger'?'All activity':tab==='taken'?'Goods collected':'Goods supplied'}</h3>
       <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <Input aria-label="Search Vendor V2 activity" className="w-full sm:w-[175px]" placeholder="Search memo..." value={query} onChange={e=>setQuery(e.target.value)}/>
        <div className="flex items-center gap-1" role="group" aria-label="Date filter">
         {(['today','week','all'] as const).map(k=><Button type="button" key={k} size="sm" variant={dateFilter===k?'default':'outline'}
          onClick={()=>setDateFilter(k)}>{k==='week'?'7 days':k==='today'?'Today':'All'}</Button>)}
        </div>
       </div>
      </div>
      <div className="space-y-2 sm:hidden" aria-label="Vendor V2 mobile activity">
       {entries.map(g=><article key={g.id} className="min-w-0 rounded-md border border-border bg-card p-3">
        <div className="flex min-w-0 items-start justify-between gap-2">
         <div className="min-w-0"><p className="break-words text-[13px] font-medium text-ink">{g.type} · {g.title}</p>
          <p className="mt-1 text-[11px] text-ink-500">{g.date} · {g.sub}</p></div>
         <span className={'shrink-0 text-[11px] font-medium '+(g.pricePending?'text-warning':g.open?'text-danger':'text-success')}>
          {g.pricePending?'Price pending':g.open?'To settle':'Settled'}
         </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 border-t border-border pt-2">
         <span className="text-xs font-semibold text-ink">{g.pricePending?(g.amount?'Known due: '+taka(g.amount/100):'Amount not set'):taka(g.amount/100)}</span>
         {g.first?<Button type="button" size="sm" variant="outline"
          onClick={()=>review(g.first,g.kind==='taken'?'taken':'given')}>{g.open?'Review / Settle':'View'}</Button>:
          <Button type="button" size="sm" variant="outline" onClick={()=>navigate(g.kind==='purchase'?'/app/purchases':'/app/sales')}>View</Button>}
        </div>
       </article>)}
       {!entries.length&&<p className="rounded-md border border-border p-6 text-center text-sm text-ink-500">No matching activity.</p>}
      </div>
      <div className="hidden min-w-0 overflow-x-auto rounded-md border border-border sm:block">
       <table data-erp-table className="w-full min-w-[590px] text-[13px]">
        <thead className="bg-ink-50 text-[12px] text-ink-500"><tr>
         <th className="p-2 text-left font-medium">Date</th><th className="p-2 text-left font-medium">Transaction / Products</th>
         <th className="p-2 text-right font-medium">Outstanding</th><th className="p-2 text-left font-medium">Status</th>
         <th className="p-2 text-right font-medium">Action</th>
        </tr></thead>
        <tbody className="divide-y divide-border">
        {entries.map(g=><tr key={g.id} className="hover:bg-ink-50/60">
         <td className="whitespace-nowrap p-2 text-ink-500">{g.date}</td>
         <td className="p-2"><span className="font-medium text-ink">{g.type} · {g.title}</span>
          <span data-table-helper="" className="block text-[11px] text-ink-500">{g.sub}</span></td>
         <td className="whitespace-nowrap p-2 text-right font-medium text-ink">{g.pricePending?'Price pending'+(g.amount?' + '+taka(g.amount/100):''):taka(g.amount/100)}</td>
         <td className={'whitespace-nowrap p-2 text-[11px] '+(g.pricePending?'text-warning':g.open?'text-danger':'text-success')}>
          {g.pricePending?'Price pending':g.open?'To settle':'Settled'}</td>
         <td className="p-2 text-right">
          {g.first?<button type="button" className="min-h-9 text-xs font-semibold text-primary hover:underline"
           onClick={()=>review(g.first,g.kind==='taken'?'taken':'given')}>{g.open?'Review / Settle':'View'}</button>:
           <Button size="sm" variant="outline" onClick={()=>navigate(g.kind==='purchase'?'/app/purchases':'/app/sales')}>View</Button>}
         </td></tr>)}
        {!entries.length&&<tr><td colSpan={5} className="px-3 py-10 text-center text-sm text-ink-500">No matching activity. Use Take Goods or Give Goods to start.</td></tr>}
        </tbody>
       </table>
      </div>
      {selectedSource&&<div className="space-y-2 border-t border-border pt-3" aria-label="Selected goods memo settlement">
       <div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-ink">Selected goods memo · মেমো</h4>
        <Button type="button" variant="outline" size="sm" onClick={()=>setSelectedSource(null)}>Close</Button></div>
       <VendorSourceWorkspace mode={tab==='given'?'given':'taken'} sources={sources.filter(s=>s.sourceKind===(tab==='given'?'issue':'sourcing'))}
        snapshot={snapshot} sourceId={selectedSource}
        onCorrect={sourceId=>navigate('/app/vendors?partyId='+encodeURIComponent(party.id)+'&tab='+(tab==='given'?'given':'taken')+'&sourceId='+encodeURIComponent(sourceId))}/>
      </div>}
      <p className="text-[11px] text-ink-500">Known goods dues are separate from purchase bills. Unknown prices are not counted as zero.</p>
     </div>
    </section>:<div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-ink-500">Add a Vendor to start exchanging goods.</div>}
   </div>
  </div>
  </>}
  <Dialog open={picker} onOpenChange={setPicker}>
   <DialogContent aria-label="Choose Vendor" className="w-[calc(100vw-1rem)] max-w-md p-0">
    <div className="border-b border-border p-3"><DialogTitle>Choose Vendor · ভেন্ডর বাছুন</DialogTitle>
     <DialogDescription>Search by name or phone.</DialogDescription></div>
    <VendorDirectory picker rows={rows} shown={shown} selectedId={party?.id??''} query={search}
     onQuery={setSearch} filter={filter} onFilter={setFilter} onSelect={selectParty}/>
    <div className="p-3"><Button size="sm" variant="outline" onClick={()=>{setPicker(false);setEditingParty(null);}}><Plus className="size-4"/> Add Vendor</Button></div>
   </DialogContent>
  </Dialog>
  <PartyEditorDialog open={editingParty!==undefined} party={editingParty} defaultRole="Vendor"
   existingOpenings={editingParty?.id?partyState.sources.filter(s=>s.partyId===editingParty.id&&s.status==='Active'&&isPartyOpening(s)):[]}
   onClose={()=>setEditingParty(undefined)} onSave={saveParty}/>
 </div>;
}
