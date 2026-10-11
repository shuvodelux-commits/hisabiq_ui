import React,{useState} from 'react';
import {CheckCircle2,FileText,Search} from 'lucide-react';
import {Button} from '../Button';
import {Input} from '../Input';
import {VendorActionDialog} from '../parties/VendorActionDialog';
import {sourceOutstanding} from '../../vendor/vendorModel';
import {products} from '../../data/products';
import {taka} from '../../utils/currency';
import type {VendorLedgerEvent,VendorPreviewState,VendorSource} from '../../vendor/vendorTypes';

type Props={partyId:string;state:VendorPreviewState;sources:VendorSource[];
 onReview:(event:VendorLedgerEvent)=>void;onOpenTaken:()=>void};
const money=(paisa:number)=>taka(paisa/100);

/** Selecting a pending source reveals the shared money form in place — no second modal or amount entry. */
export function VendorPaymentsWorkspace({partyId,state,sources,onReview,onOpenTaken}:Props){
 const [search,setSearch]=useState('');
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const due=sources.filter(s=>s.unitCostBasePaisa!==null&&
  (sourceOutstanding(state,s.id).monetaryDuePaisa??0)>0);
 const shown=due.filter(s=>(s.reference+' '+s.productId+' '+
  (products.find(p=>p.id===s.productId)?.name??'')).toLowerCase().includes(search.trim().toLowerCase()));
 const selected=due.find(s=>s.id===selectedId)??due[0]??null;
 const outstanding=selected?sourceOutstanding(state,selected.id):null;
 const unsettled=sources.filter(s=>s.sourceKind==='sourcing'&&
  sourceOutstanding(state,s.id).unpricedBaseQty>0).length;
 const settlements=state.settlements.filter(s=>s.vendorPartyId===partyId&&
  (s.kind==='pay'||s.kind==='receive-money')).slice().reverse();
 return <section aria-label="Vendor payments workspace"
   className="grid min-w-0 gap-3 xl:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)] xl:items-start">
   <div className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
    <div className="border-b border-border p-3">
     <h4 className="text-sm font-semibold text-ink">Outstanding invoices · বাকি মেমো</h4>
     <p className="mt-1 text-xs text-ink-500">Choose what you are paying or receiving.</p>
     <div className="relative mt-3"><Search className="absolute left-2.5 top-2.5 size-4 text-ink-400"/>
      <Input aria-label="Search Vendor payment invoices" value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Search invoice or product" className="pl-8"/>
     </div>
    </div>
    <div className="max-h-[340px] divide-y divide-border overflow-y-auto">
     {shown.map(s=>{
      const product=products.find(p=>p.id===s.productId);
      const amount=sourceOutstanding(state,s.id).monetaryDuePaisa??0;
      return <button type="button" key={s.id} aria-pressed={selected?.id===s.id}
       onClick={()=>setSelectedId(s.id)}
       className={'flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-ink-50 '+
       (selected?.id===s.id?'border-l-[3px] border-teal-500 bg-teal-50/60 dark:bg-teal-900/20':'')}>
       <span className="min-w-0 flex-1"><strong className="block truncate text-xs text-ink">{s.reference??s.id}</strong>
        <span className="mt-1 block truncate text-xs text-ink-500">{product?.name??s.productId} · {s.date}</span>
        <span className="mt-1 block text-[11px] text-ink-500">{s.sourceKind==='sourcing'?'Pay Vendor · টাকা দিন':'Receive from Vendor · টাকা নিন'}</span>
       </span><strong className="shrink-0 text-sm text-ink">{money(amount)}</strong>
      </button>;
     })}
     {!shown.length&&<p className="p-7 text-center text-xs text-ink-500">{due.length?'No matching invoices.':'No priced outstanding money dues.'}</p>}
    </div>
    {unsettled>0&&<div className="border-t border-border bg-ink-50/40 p-3 text-xs text-ink-600">
     {unsettled} source(s) still need Vendor pricing.
     <Button type="button" size="sm" variant="ghost" onClick={onOpenTaken}>Set Price in Taken</Button>
    </div>}
    <div className="border-t border-border">
     <div className="flex items-center gap-2 border-b border-border bg-ink-50/40 px-3 py-2 text-xs font-semibold text-ink">
      <FileText className="size-3.5"/> Recent payments
     </div>
     {settlements.slice(0,5).map(s=>{
      const event=state.events.find(e=>e.operationId===s.operationId&&e.kind==='settlement');
      return <div key={s.id} className="flex items-center justify-between gap-3 border-b border-border/70 px-3 py-2 text-xs">
       <span className="text-ink-600">{s.date} · {s.kind==='pay'?'Paid':'Received'}</span>
       <strong>{money(s.amountPaisa??0)}</strong>
       {event&&<Button type="button" size="sm" variant="ghost" onClick={()=>onReview(event)}>Review</Button>}
      </div>;
     })}
     {!settlements.length&&<p className="px-3 py-3 text-xs text-ink-500">No previous Vendor payments.</p>}
    </div>
   </div>
   <div className="min-w-0 rounded-lg border border-border bg-card p-4 shadow-card sm:p-5">
    {selected?<div>
     <div className="border-b border-border pb-3">
      <h4 className="text-sm font-semibold text-ink">{selected.sourceKind==='sourcing'?'Pay Vendor · টাকা দিন':'Receive Money · টাকা নিন'}</h4>
      <p className="mt-1 text-xs text-ink-500">{selected.reference??selected.id} · {products.find(p=>p.id===selected.productId)?.name??selected.productId}</p>
     </div>
     <div className="my-3 grid grid-cols-2 gap-3 rounded-lg border border-border bg-ink-50/50 p-3 text-xs">
      <div><span className="block text-ink-500">Invoice amount due</span><strong className="text-lg text-ink">{money(outstanding?.monetaryDuePaisa??0)}</strong></div>
      <div className="text-right"><span className="block text-ink-500">Direction</span>
       <strong className="text-ink">{selected.sourceKind==='sourcing'?'Money out':'Money in'}</strong>
      </div>
     </div>
     <VendorActionDialog key={selected.id+'-'+state.revision} inline source={selected}
       mode={selected.sourceKind==='sourcing'?'pay':'receive-money'} onClose={()=>{}}/>
    </div>:<div className="flex min-h-52 flex-col items-center justify-center gap-2 text-center text-xs text-ink-500">
      <CheckCircle2 className="size-7 text-teal-600"/><strong className="text-sm text-ink">No outstanding payments</strong>
      <p>All known Vendor money dues are settled.</p>
    </div>}
   </div>
  </section>;
}
