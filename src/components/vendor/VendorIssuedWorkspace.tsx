import React,{useState} from 'react';
import {toast} from 'sonner';
import {Button} from '../Button';
import {Input} from '../Input';
import {VendorGoodsEditor} from './VendorGoodsEditor';
import {VendorMasterDetailLayout} from './VendorMasterDetailLayout';
import {VendorSourceActionForm} from './VendorSourceActionForm';
import {selectVendorSource} from '../../vendor/vendorWorkspaceSelection';
import {sourceOutstanding} from '../../vendor/vendorModel';
import {products} from '../../data/products';
import {taka} from '../../utils/currency';
import type {VendorPreviewState,VendorSource} from '../../vendor/vendorTypes';
import type {VendorActionMode} from '../parties/VendorActionDialog';

type Props={
 partyId:string;snapshot:VendorPreviewState;sources:readonly VendorSource[];
 sourceId:string|null;editing:boolean;onEditingChange:(editing:boolean)=>void;
 onDirtyChange:(dirty:boolean)=>void;dirty:boolean;
 onAction:(source:VendorSource,mode:VendorActionMode)=>void;
 onCorrect:(sourceId:string)=>void;
};
export function VendorIssuedWorkspace({
 partyId,snapshot,sources,sourceId,editing,onEditingChange,onDirtyChange,dirty,onAction,onCorrect
}:Props){
 const [search,setSearch]=useState('');
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [ignoreLink,setIgnoreLink]=useState(false);
 const [action,setAction]=useState<'receive-money'|'receive-goods'|null>(null);
 const [dismissed,setDismissed]=useState(false);
 const selected=selectVendorSource(sources,snapshot,partyId,'issue',
  selectedId??(ignoreLink?null:sourceId));
 const outstanding=selected?sourceOutstanding(snapshot,selected.id):null;
 const amountDue=outstanding?.monetaryDuePaisa??0;
 const goodsOut=selected?selected.baseQty-(outstanding?.returnedBaseQty??0):0;
 const canReceive=Boolean(selected?.unitCostBasePaisa!==null&&amountDue>0);
 const canReturn=Boolean(goodsOut>0&&amountDue>0);
 const activeAction=action??(canReceive?'receive-money':null);
 const matching=sources.filter(s=>{
  const p=products.find(p=>p.id===s.productId);
  return [s.reference??s.id,p?.name??'',s.date].some(t=>t.toLowerCase().includes(search.toLowerCase().trim()));
 });
 const select=(id:string)=>{
  if(editing&&dirty&&!window.confirm('Leave the unsaved product issue?'))return;
  if(editing)onDirtyChange(false);
  onEditingChange(false);setSelectedId(id);setIgnoreLink(true);setAction(null);setDismissed(false);
 };
 const list=<section data-testid="vendor-issued-list" aria-label="Issued memos" className="min-w-0 rounded-lg border border-border bg-card">
  <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
   <h4 className="text-xs font-semibold text-ink">Issued memos <span className="font-bn font-normal text-ink-500">· প্রদানকৃত পণ্য</span></h4>
   <span className="text-xs text-ink-500">{sources.length} records</span>
  </div>
  <div className="border-b border-border px-3 py-2">
   <Input aria-label="Search issued memos" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search memo or product"/>
  </div>
  <div className="max-h-[min(70vh,700px)] divide-y divide-border overflow-y-auto">
   {matching.map(s=>{
    const p=products.find(p=>p.id===s.productId);
    const out=sourceOutstanding(snapshot,s.id);
    const due=out.monetaryDuePaisa??0;
    const active=!editing&&selected?.id===s.id;
    return <button type="button" key={s.id} aria-pressed={active} onClick={()=>select(s.id)}
     className={'block w-full px-3 py-3 text-left hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-teal-500 '+(active?'bg-teal-50/70 dark:bg-teal-900/20':'')}>
     <strong className="block truncate text-xs text-ink">{s.reference??s.id} · {p?.name??s.productId}</strong>
     <span className="mt-1 block text-[11px] text-ink-500">{s.date} · {s.baseQty-out.returnedBaseQty} {p?.unit??'units'} outstanding</span>
     <span className="mt-1 block text-xs font-medium text-ink">{due>0?taka(due/100)+' receivable':'Settled'}</span>
    </button>;
   })}
   {!matching.length&&<p className="p-8 text-center text-xs text-ink-500">{sources.length?'No matching issued memos.':'No issued products yet.'}</p>}
  </div>
 </section>;
 const detail=<section data-testid="vendor-issued-detail" aria-label="Issued products workspace" className="min-w-0 rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4">
  {editing?
   <VendorGoodsEditor partyId={partyId} mode="given" onDirtyChange={onDirtyChange}
    onCancel={()=>{onEditingChange(false);onDirtyChange(false);}}
    onSaved={()=>{onEditingChange(false);onDirtyChange(false);toast.success('Products saved in demo preview');}}/>:
   selected?
   <div className="space-y-3">
    <div><h4 className="text-sm font-semibold text-ink">{selected.reference??selected.id} · {products.find(p=>p.id===selected.productId)?.name??selected.productId}</h4>
     <p className="text-xs text-ink-500">{selected.date} · Products Issued</p></div>
    <div className="grid grid-cols-2 gap-2 text-xs">
     <div className="rounded-lg bg-ink-50 p-3"><p className="text-ink-500">Amount Receivable</p><strong>{taka(amountDue/100)}</strong></div>
     <div className="rounded-lg bg-ink-50 p-3"><p className="text-ink-500">Products Outstanding</p><strong>{goodsOut} {products.find(p=>p.id===selected.productId)?.unit??'units'}</strong></div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
     <Button size="sm" variant={activeAction==='receive-money'&&!dismissed?'default':'outline'}
      disabled={!canReceive} onClick={()=>{setAction('receive-money');setDismissed(false);}}>Receive Payment</Button>
     <Button size="sm" variant={activeAction==='receive-goods'&&!dismissed?'default':'outline'}
      disabled={!canReturn} onClick={()=>{setAction('receive-goods');setDismissed(false);}}>Receive Returned Products</Button>
     <Button size="sm" variant="ghost" onClick={()=>onAction(selected,'details')}>View details</Button>
     <Button size="sm" variant="ghost" onClick={()=>onCorrect(selected.id)}>Correct</Button>
    </div>
    {activeAction&&!dismissed&&(activeAction==='receive-money'?canReceive:canReturn)?
     <VendorSourceActionForm key={selected.id+'-'+activeAction} source={selected}
      mode={activeAction} onCancel={()=>setDismissed(true)}
      onSaved={()=>{setSelectedId(null);setIgnoreLink(true);setAction(null);setDismissed(false);}}/>:
     <p className="rounded-lg bg-ink-50 p-3 text-xs text-ink-500">
      {amountDue===0?'No outstanding balance. This memo remains available for review.':'Select an action to record money or matching returned products.'}
     </p>}
   </div>:
   <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
    <p className="text-sm text-ink-500">No issued memo selected.</p>
    <Button size="sm" onClick={()=>onEditingChange(true)}>Issue Products</Button>
   </div>}
 </section>;
 return <VendorMasterDetailLayout testId="vendor-issued-workspace" list={list} detail={detail} editingFullWidth={editing}/>;
}
