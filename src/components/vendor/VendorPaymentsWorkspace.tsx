import React,{useState} from 'react';
import {Button} from '../Button';
import {Input} from '../Input';
import {VendorMasterDetailLayout} from './VendorMasterDetailLayout';
import {VendorSourceActionForm} from './VendorSourceActionForm';
import {sourceOutstanding} from '../../vendor/vendorModel';
import {products} from '../../data/products';
import {taka} from '../../utils/currency';
import type {VendorPaymentIntent} from '../../vendor/vendorRoute';
import type {Purchase} from '../../types/erp';
import type {VendorPreviewState,VendorSource,VendorLedgerEvent} from '../../vendor/vendorTypes';

type Props={
 partyId:string;snapshot:VendorPreviewState;sources:readonly VendorSource[];
 purchases:readonly Purchase[];sourceId:string|null;intent?:VendorPaymentIntent|null;
 onOpenPurchases:()=>void;onReview:(event:VendorLedgerEvent)=>void;
};
export function VendorPaymentsWorkspace({partyId,snapshot,sources,purchases,sourceId,intent,onOpenPurchases,onReview}:Props){
 const [search,setSearch]=useState('');
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [ignoreLink,setIgnoreLink]=useState(false);
 const [dismissed,setDismissed]=useState(false);
 const [selectedHistory,setSelectedHistory]=useState<string|null>(null);
 const all=sources.filter(s=>s.vendorPartyId===partyId&&s.status==='Active');
 const outstanding=all.filter(s=>s.unitCostBasePaisa!==null&&(sourceOutstanding(snapshot,s.id).monetaryDuePaisa??0)>0);
 const incoming=outstanding.filter(s=>s.sourceKind==='issue');
 const outgoing=outstanding.filter(s=>s.sourceKind==='sourcing');
 const candidates=intent==='receive'?incoming:intent==='make'?outgoing:outgoing.length?outgoing:incoming;
 const explicit=(selectedId??(!ignoreLink?sourceId:null));
 const selected=outstanding.find(s=>s.id===explicit&&(!intent||(intent==='make'?s.sourceKind==='sourcing':s.sourceKind==='issue')))
   ??candidates[0]??null;
 const history=snapshot.settlements.filter(s=>s.vendorPartyId===partyId&&s.status==='Active'
  &&(s.kind==='pay'||s.kind==='receive-money'||s.kind==='pay-and-return'));
 const purchaseDue=purchases.filter(p=>p.supplierId===partyId).reduce((sum,p)=>sum+Math.max(0,p.total-p.paid),0);
 const searchMatch=(s:VendorSource)=>{
  const p=products.find(p=>p.id===s.productId);
  return [s.reference??s.id,p?.name??'',s.date]
   .some(t=>t.toLowerCase().includes(search.toLowerCase().trim()));
 };
 const rows=(kind:'sourcing'|'issue')=>(kind==='sourcing'?outgoing:incoming).filter(searchMatch).map(s=>{
  const out=sourceOutstanding(snapshot,s.id);
  return <button key={s.id} type="button" aria-pressed={selected?.id===s.id&&!selectedHistory}
   onClick={()=>{setSelectedId(s.id);setSelectedHistory(null);setDismissed(false);}}
   className={'block w-full px-3 py-2.5 text-left hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-teal-500 '+(selected?.id===s.id&&!selectedHistory?'bg-teal-50/70 dark:bg-teal-900/20':'')}>
   <strong className="block text-xs text-ink">{s.reference??s.id}</strong>
   <span className="block truncate text-[11px] text-ink-500">{products.find(p=>p.id===s.productId)?.name??s.productId} · {s.date}</span>
   <span className="block text-xs font-semibold text-ink">{taka((out.monetaryDuePaisa??0)/100)}</span>
  </button>;
 });
 const list=<section aria-label="Vendor payable and receivable records" className="rounded-lg border border-border bg-card">
  <div className="border-b border-border px-3 py-2.5">
   <h4 className="text-xs font-semibold text-ink">Outstanding Bills & Payments · <span className="font-bn font-normal text-ink-500">টাকা লেনদেন</span></h4>
   <Input className="mt-2" aria-label="Search Vendor payment records" value={search}
    onChange={e=>setSearch(e.target.value)} placeholder="Find reference or product"/>
  </div>
  <div className="max-h-[min(70vh,700px)] overflow-y-auto">
   <div className="border-b border-border bg-ink-50 px-3 py-2 text-[11px] font-semibold">Make Payment · Amount Payable ({outgoing.length})</div>
   <div className="divide-y divide-border">{rows('sourcing')}</div>
   <div className="border-b border-t border-border bg-ink-50 px-3 py-2 text-[11px] font-semibold">Receive Payment · Amount Receivable ({incoming.length})</div>
   <div className="divide-y divide-border">{rows('issue')}</div>
   <div className="border-b border-t border-border bg-ink-50 px-3 py-2 text-[11px] font-semibold">Payment History ({history.length})</div>
   <div className="divide-y divide-border">{history.map(h=><button type="button" key={h.id}
    className="block w-full px-3 py-2 text-left text-xs hover:bg-ink-50"
    onClick={()=>{setSelectedHistory(h.id);setDismissed(true);}}>
    <strong className="block text-ink">{h.kind==='receive-money'?'Payment Received':'Payment Made'} · {taka((h.amountPaisa??0)/100)}</strong>
    <span className="text-ink-500">{h.date} · {h.allocations[0]?.sourceId??'Vendor'}</span>
   </button>)}</div>
   {outstanding.length===0&&history.length===0&&<p className="p-4 text-xs text-ink-500">No outstanding Vendor payments.</p>}
  </div>
 </section>;
 const due=selected?sourceOutstanding(snapshot,selected.id).monetaryDuePaisa??0:0;
 const selectedSettlement=history.find(h=>h.id===selectedHistory);
 const detail=<section aria-label="Vendor payment workspace" className="rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4">
  {selectedSettlement?<div className="space-y-3 text-xs">
    <h4 className="text-sm font-semibold text-ink">Payment History</h4>
    <p>{selectedSettlement.date} · {selectedSettlement.kind==='receive-money'?'Payment Received':'Payment Made'}</p>
    <p className="font-semibold">{taka((selectedSettlement.amountPaisa??0)/100)}</p>
    <Button size="sm" variant="outline" onClick={()=>{
     const e=snapshot.events.find(e=>e.operationId===selectedSettlement.operationId&&e.kind==='settlement');
     if(e)onReview(e);
    }}>Review Transaction</Button>
   </div>:
   selected&&due>0?<div className="space-y-3">
    <div><h4 className="text-sm font-semibold text-ink">{selected.sourceKind==='sourcing'?'Make Payment':'Receive Payment'}</h4>
     <p className="mt-1 text-xs text-ink-500">{selected.reference??selected.id} · {products.find(p=>p.id===selected.productId)?.name??selected.productId}</p></div>
    <div className="rounded-lg bg-ink-50 p-3 text-xs"><span>Outstanding amount</span><strong className="ml-2">{taka(due/100)}</strong></div>
    {!dismissed&&<VendorSourceActionForm key={selected.id} source={selected}
     mode={selected.sourceKind==='sourcing'?'pay':'receive-money'}
     onCancel={()=>setDismissed(true)}
     onSaved={()=>{setSelectedId(null);setIgnoreLink(true);setDismissed(false);}}/>}
    {dismissed&&<Button size="sm" variant="outline" onClick={()=>setDismissed(false)}>Open Payment</Button>}
   </div>:
   <p className="p-6 text-center text-xs text-ink-500">No priced Vendor balance requires payment. Set the product price first when it is still unknown.</p>}
  {purchaseDue>0&&<div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-ink-50 p-3 text-xs">
   <span>Ordinary Purchase Due · {taka(purchaseDue)} (separate account)</span>
   <Button size="sm" variant="outline" onClick={onOpenPurchases}>View Purchases</Button>
  </div>}
 </section>;
 return <VendorMasterDetailLayout testId="vendor-payments-workspace" list={list} detail={detail}/>;
}
