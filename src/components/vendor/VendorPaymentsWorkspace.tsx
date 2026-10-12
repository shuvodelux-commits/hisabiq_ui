import {useEffect,useState} from 'react';
import {CheckCircle2,Search} from 'lucide-react';
import {Button} from '../Button';
import {Input} from '../Input';
import {VendorActionDialog} from '../parties/VendorActionDialog';
import {sourceOutstanding} from '../../vendor/vendorModel';
import {products} from '../../data/products';
import {taka} from '../../utils/currency';
import type {VendorPreviewState,VendorSource} from '../../vendor/vendorTypes';

type Props={state:VendorPreviewState;sources:VendorSource[];sourceId?:string|null};
const money=(paisa:number)=>taka(paisa/100);

/** Selecting a pending source reveals the shared money form in place — no second modal or amount entry. */
export function VendorPaymentsWorkspace({state,sources,sourceId}:Props){
 const [showInvoices,setShowInvoices]=useState(false);
 useEffect(()=>{if(sourceId){setSelectedId(sourceId);setShowInvoices(false);}},[sourceId]);
 const [search,setSearch]=useState('');
 const [selectedId,setSelectedId]=useState<string|null>(sourceId??null);
 const due=sources.filter(s=>s.unitCostBasePaisa!==null&&
  (sourceOutstanding(state,s.id).monetaryDuePaisa??0)>0);
 const shown=due.filter(s=>(s.reference+' '+s.productId+' '+
  (products.find(p=>p.id===s.productId)?.name??'')).toLowerCase().includes(search.trim().toLowerCase()));
 const selected=due.find(s=>s.id===selectedId)??due[0]??null;
 const outstanding=selected?sourceOutstanding(state,selected.id):null;
 const unsettled=sources.filter(s=>s.sourceKind==='sourcing'&&
  sourceOutstanding(state,s.id).unpricedBaseQty>0).length;
 return <section aria-label="Vendor payments workspace"
   className="grid min-w-0 gap-3 lg:grid-cols-[minmax(260px,0.82fr)_minmax(0,1.18fr)] lg:items-start">
   <Button type="button" variant="outline" className="min-h-11 w-full lg:hidden" aria-expanded={showInvoices} onClick={()=>setShowInvoices(!showInvoices)}>{showInvoices?'Back to payment · পেমেন্টে ফিরুন':`Choose another memo · মেমো বাছুন (${due.length})`}</Button>
   <div className={(showInvoices?'block':'hidden')+' min-w-0 overflow-hidden rounded-lg border border-border bg-card lg:block'}>
    <div className="border-b border-border p-3">
     <h4 className="text-sm font-semibold text-ink">Outstanding invoices · বাকি মেমো</h4>
     <p className="mt-1 text-xs text-ink-500">Choose a memo to record payment.</p>
     <div className="relative mt-3"><Search className="pointer-events-none absolute z-10 left-2.5 top-2.5 size-4 text-ink-400"/>
      <Input aria-label="Search Vendor payment invoices" value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Search invoice or product" className="pl-8"/>
     </div>
    </div>
    <div className="max-h-[340px] divide-y divide-border overflow-y-auto">
     {shown.map(s=>{
      const product=products.find(p=>p.id===s.productId);
      const amount=sourceOutstanding(state,s.id).monetaryDuePaisa??0;
      return <button type="button" key={s.id} aria-pressed={selected?.id===s.id}
       onClick={()=>{setSelectedId(s.id);setShowInvoices(false);}}
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
    {unsettled>0&&<p className="border-t border-border px-3 py-2 text-xs text-ink-500">
     {unsettled} memo(s) need a price. Set it in Taken.
    </p>}
   </div>
   <div className={(showInvoices?'hidden':'block')+' min-w-0 rounded-lg border border-border bg-card p-4 shadow-card sm:p-5 lg:block'}>
    {selected?<div>
     <div className="border-b border-border pb-3">
      <h4 className="text-sm font-semibold text-ink">{selected.sourceKind==='sourcing'?'Pay Vendor · টাকা দিন':'Receive Money · টাকা নিন'}</h4>
      <p className="mt-1 text-xs text-ink-500">{selected.reference??selected.id} · {products.find(p=>p.id===selected.productId)?.name??selected.productId}</p>
     </div>
     <div className="my-3 flex items-center justify-between rounded-lg border border-border bg-ink-50/50 p-3 text-xs">
      <span className="text-ink-500">Due · বাকি</span>
      <strong className="text-lg text-ink">{money(outstanding?.monetaryDuePaisa??0)}</strong>
     </div>
     <VendorActionDialog key={selected.id+'-'+state.revision} inline source={selected}
       mode={selected.sourceKind==='sourcing'?'pay':'receive-money'} onClose={()=>undefined}/>
    </div>:<div className="flex min-h-52 flex-col items-center justify-center gap-2 text-center text-xs text-ink-500">
      <CheckCircle2 className="size-7 text-teal-600"/><strong className="text-sm text-ink">No outstanding payments</strong>
      <p>All known Vendor money dues are settled.</p>
    </div>}
   </div>
  </section>;
}
