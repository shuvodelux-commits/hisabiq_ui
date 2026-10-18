import {matchesSearch as fuzzyMatch} from '../../utils/fuzzySearch';
import {useEffect,useState} from 'react';
import {CheckCircle2,ChevronDown,Search} from 'lucide-react';
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
 const shown=due.filter(s=>fuzzyMatch(search,[s.reference,s.productId,products.find(p=>p.id===s.productId)?.name]));
 const selected=due.find(s=>s.id===selectedId)??due[0]??null;
 const outstanding=selected?sourceOutstanding(state,selected.id):null;
 const unsettled=sources.filter(s=>s.sourceKind==='sourcing'&&
  sourceOutstanding(state,s.id).unpricedBaseQty>0).length;
 return <section aria-label="Vendor payments workspace" className="min-w-0">
  <div className="min-w-0 rounded-lg border border-border bg-card">
   <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2.5">
    <h4 className="text-sm font-semibold text-ink">Outstanding Memos · বাকি মেমো
      <span className="ml-1.5 text-xs font-normal text-ink-500">({due.length})</span>
    </h4>
    <Button type="button" size="sm" variant="outline" aria-expanded={showInvoices}
      onClick={()=>setShowInvoices(open=>!open)}>
      {showInvoices?'Back to payment · পেমেন্টে ফিরুন':'Choose another memo · মেমো বাছুন'}
      <ChevronDown className={'size-4 transition-transform '+(showInvoices?'rotate-180':'')}/>
    </Button>
   </div>
   {showInvoices&&<div aria-label="Choose payment memo" className="min-w-0">
    <div className="relative border-b border-border p-3">
     <Search className="pointer-events-none absolute left-5 top-1/2 z-10 size-4 -translate-y-1/2 text-ink-400"/>
     <Input aria-label="Search Vendor payment invoices" value={search} onChange={e=>setSearch(e.target.value)}
       placeholder="Search invoice or product" className="pl-8"/>
    </div>
    <div className="max-h-56 divide-y divide-border overflow-y-auto">
     {shown.map(s=>{
      const product=products.find(p=>p.id===s.productId);
      const amount=sourceOutstanding(state,s.id).monetaryDuePaisa??0;
      return <button type="button" key={s.id} aria-pressed={selected?.id===s.id}
       onClick={()=>{setSelectedId(s.id);setShowInvoices(false);}}
       className={'flex w-full min-w-0 items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-teal-500 '+
       (selected?.id===s.id?'bg-teal-50/60 dark:bg-teal-900/20':'hover:bg-ink-50')}>
       <span className="min-w-0 flex-1"><strong className="block truncate text-xs text-ink">{s.reference??s.id}</strong>
        <span className="mt-0.5 block truncate text-xs text-ink-500">{product?.name??s.productId} · {s.date} · {s.sourceKind==='sourcing'?'To pay':'To receive'}</span>
       </span><strong className="shrink-0 text-sm text-ink">{money(amount)}</strong>
      </button>;
     })}
     {!shown.length&&<p className="p-6 text-center text-xs text-ink-500">
       {due.length?'No matching invoices.':'No priced outstanding money dues.'}</p>}
    </div>
   </div>}
   {!showInvoices&&<div className="min-w-0 space-y-3 p-3 sm:p-4">
    {selected?<>
     <div>
      <h4 className="text-sm font-semibold text-ink">{selected.sourceKind==='sourcing'?'Pay Vendor · টাকা দিন':'Receive Money · টাকা নিন'}</h4>
      <p className="mt-0.5 text-xs text-ink-500">{selected.reference??selected.id} · {products.find(p=>p.id===selected.productId)?.name??selected.productId}</p>
     </div>
     <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-ink-50/60 px-3 py-2 text-xs">
      <span className="text-ink-500">Remaining due · বাকি</span>
      <strong className="text-base text-ink">{money(outstanding?.monetaryDuePaisa??0)}</strong>
     </div>
     <VendorActionDialog key={selected.id+'-'+state.revision} inline source={selected}
      mode={selected.sourceKind==='sourcing'?'pay':'receive-money'} onClose={()=>undefined}/>
    </>:<div className="flex flex-col items-center justify-center gap-2 py-6 text-center text-xs text-ink-500">
      <CheckCircle2 className="size-6 text-teal-600"/><strong className="text-sm text-ink">No outstanding payments</strong>
      <p>All known Vendor money dues are settled.</p>
    </div>}
    {unsettled>0&&<p className="border-t border-border pt-2 text-xs text-warning">
     {unsettled} memo(s) need a price. Set it in Taken before paying.
    </p>}
   </div>}
  </div>
 </section>;
}
