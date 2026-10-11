import React,{useState} from 'react';
import {toast} from 'sonner';
import {Button} from '../Button';
import {Input} from '../Input';
import {VendorGoodsEditor} from './VendorGoodsEditor';
import {VendorClearDuePanel} from './VendorClearDuePanel';
import {VendorMasterDetailLayout} from './VendorMasterDetailLayout';
import {selectVendorSource} from '../../vendor/vendorWorkspaceSelection';
import {sourceOutstanding} from '../../vendor/vendorModel';
import {products} from '../../data/products';
import {taka} from '../../utils/currency';
import type {VendorSource,VendorPreviewState} from '../../vendor/vendorTypes';
import type {VendorActionMode} from '../parties/VendorActionDialog';

type Props={
 partyId:string;snapshot:VendorPreviewState;sources:readonly VendorSource[];
 sourceId:string|null;editing:boolean;onEditingChange:(editing:boolean)=>void;
 onDirtyChange:(dirty:boolean)=>void;dirty:boolean;
 onAction:(source:VendorSource,mode:VendorActionMode)=>void;
 onCorrect:(sourceId:string)=>void;
};
export function VendorReceivedWorkspace({
 partyId,snapshot,sources,sourceId,editing,onEditingChange,onDirtyChange,dirty,onAction,onCorrect
}:Props){
 const [search,setSearch]=useState('');
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [ignoreLink,setIgnoreLink]=useState(false);
 const [dismissed,setDismissed]=useState(false);
 const [revision,setRevision]=useState(0);
 const current=selectVendorSource(sources,snapshot,partyId,'sourcing',
  selectedId??(ignoreLink?null:sourceId));
 const currentOut=current?sourceOutstanding(snapshot,current.id):null;
 const actionable=Boolean(currentOut&&(currentOut.unpricedBaseQty>0||(currentOut.monetaryDuePaisa??0)>0));
 const matches=sources.filter(source=>{
  const product=products.find(p=>p.id===source.productId);
  return [source.reference??source.id,product?.name??'',source.date]
   .some(text=>text.toLowerCase().includes(search.trim().toLowerCase()));
 });
 const select=(id:string)=>{
  if(editing&&dirty&&!window.confirm('Leave the unsaved receipt?'))return;
  if(editing)onDirtyChange(false);
  onEditingChange(false);setSelectedId(id);setIgnoreLink(true);setDismissed(false);
 };
 const list=<section data-testid="vendor-received-memo-list" aria-label="Received invoices"
  className="min-w-0 rounded-lg border border-border bg-card">
  <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
   <h4 className="text-xs font-semibold text-ink">Received invoices <span className="font-bn font-normal text-ink-500">· প্রাপ্ত পণ্য</span></h4>
   <span className="text-xs text-ink-500">{sources.length} records</span>
  </div>
  <div className="border-b border-border px-3 py-2">
   <Input aria-label="Search received invoices" placeholder="Search memo or product"
    value={search} onChange={e=>setSearch(e.target.value)}/>
  </div>
  <div className="max-h-[min(70vh,700px)] divide-y divide-border overflow-y-auto">
   {matches.map(source=>{
    const product=products.find(p=>p.id===source.productId);
    const out=sourceOutstanding(snapshot,source.id);
    const pending=out.unpricedBaseQty>0||(out.monetaryDuePaisa??0)>0;
    const selected=!editing&&!dismissed&&current?.id===source.id;
    return <div key={source.id} className={'flex min-w-0 items-start gap-2 p-2.5 '+(selected?'bg-teal-50/70 dark:bg-teal-900/20':'hover:bg-ink-50/40')}>
     <button type="button" aria-pressed={selected}
      className="min-w-0 flex-1 rounded-md px-1 py-0.5 text-left focus-visible:outline-2 focus-visible:outline-teal-600"
      onClick={()=>select(source.id)}>
      <span className="block truncate text-xs font-semibold text-ink">{source.reference??source.id} · {product?.name??source.productId}</span>
      <span className="mt-1 block text-[11px] text-ink-500">{source.date} · {source.baseQty-out.returnedBaseQty} {product?.unit??'units'} outstanding</span>
      <span className={'mt-1 block text-xs font-medium '+(out.unpricedBaseQty>0?'text-warning':'text-ink')}>
       {out.unpricedBaseQty>0?'Price not set · দাম ঠিক হয়নি':pending?taka((out.monetaryDuePaisa??0)/100)+' due':'Settled'}
      </span>
     </button>
     <div className="flex shrink-0 flex-col items-end gap-1">
      {out.unpricedBaseQty>0&&<Button size="sm" variant="outline" type="button" onClick={()=>onAction(source,'quote')}>Set Price</Button>}
      {pending&&<Button size="sm" variant="outline" type="button" onClick={()=>select(source.id)}>Record Settlement</Button>}
      <details className="relative text-xs"><summary className="cursor-pointer rounded border border-border px-2 py-1">More</summary>
       <div className="absolute right-0 top-full z-20 min-w-36 space-y-1 rounded-lg border border-border bg-card p-2 shadow-lg">
        <Button size="sm" variant="ghost" onClick={()=>onAction(source,'details')}>View details</Button>
        <Button size="sm" variant="ghost" onClick={()=>onAction(source,'return')}>Return Products</Button>
        <Button size="sm" variant="ghost" onClick={()=>onCorrect(source.id)}>Correct</Button>
       </div>
      </details>
     </div>
    </div>;
   })}
   {!matches.length&&<p className="px-3 py-8 text-center text-xs text-ink-500">
    {sources.length?'No matching received invoices.':'No received products yet. Use Receive Products to add the first memo.'}
   </p>}
  </div>
 </section>;
 const detail=<section data-testid="vendor-received-detail" aria-label="Received products workspace"
  className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4">
  {editing?
   <VendorGoodsEditor partyId={partyId} mode="taken" onDirtyChange={onDirtyChange}
    onCancel={()=>{onEditingChange(false);onDirtyChange(false);setDismissed(false);}}
    onSaved={()=>{onEditingChange(false);onDirtyChange(false);setDismissed(false);toast.success('Products saved in demo preview');}}/>:
   current&&actionable&&!dismissed?
   <VendorClearDuePanel key={current.id+'-'+revision} source={current}
    onClose={()=>setDismissed(true)}
    onSaved={()=>{setSelectedId(null);setIgnoreLink(true);setDismissed(false);setRevision(n=>n+1);}}/>:
   current&&!actionable?
   <div className="space-y-3 p-3" aria-label="Settled received invoice">
    <h4 className="text-sm font-semibold text-ink">{current.reference??current.id}</h4>
    <p className="text-sm font-medium text-success">No outstanding balance</p>
    <p className="text-xs text-ink-500">This received invoice is settled. View its details or select another invoice.</p>
    <Button type="button" variant="outline" size="sm" onClick={()=>onAction(current,'details')}>View details</Button>
   </div>:
   <div className="flex min-h-40 flex-col items-center justify-center gap-3 p-5 text-center">
    <p className="text-sm text-ink-500">{current?'Select a received invoice to record a settlement.':'No received invoices yet.'}</p>
    {current?<Button size="sm" onClick={()=>setDismissed(false)}>Open Settlement</Button>:
    <Button size="sm" onClick={()=>onEditingChange(true)}>Receive Products</Button>}
   </div>}
 </section>;
 return <VendorMasterDetailLayout testId="vendor-received-workspace"
  editingFullWidth={editing} list={list} detail={detail}/>;
}
