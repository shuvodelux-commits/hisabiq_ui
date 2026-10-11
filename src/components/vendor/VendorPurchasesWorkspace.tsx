import React,{useState} from 'react';
import {Button} from '../Button';
import {Input} from '../Input';
import {VendorMasterDetailLayout} from './VendorMasterDetailLayout';
import {PurchaseEditor} from '../../pages/PurchaseEditor';
import {taka} from '../../utils/currency';
import type {Purchase} from '../../types/erp';

type Props={
 partyId:string;purchases:readonly Purchase[];
 editing:boolean;onEditingChange:(editing:boolean)=>void;
 onSave:(purchase:Purchase)=>void;onDirtyChange:(dirty:boolean)=>void;
};
export function VendorPurchasesWorkspace({
 partyId,purchases,editing,onEditingChange,onSave,onDirtyChange
}:Props){
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [search,setSearch]=useState('');
 const records=purchases.filter(p=>p.supplierId===partyId);
 const filtered=records.filter(p=>[p.ref,p.date,p.items].some(x=>String(x??'').toLowerCase().includes(search.trim().toLowerCase())));
 const selected=records.find(p=>p.id===selectedId)??records.find(p=>p.total>p.paid)??records[0]??null;
 const list=<section data-testid="vendor-purchases-list" aria-label="Vendor purchase invoices" className="rounded-lg border border-border bg-card">
  <div className="flex justify-between gap-2 border-b border-border px-3 py-2.5">
   <h4 className="text-xs font-semibold text-ink">Purchase invoices · <span className="font-bn font-normal text-ink-500">ক্রয়ের বিল</span></h4>
   <span className="text-xs text-ink-500">{records.length} invoices</span>
  </div>
  <div className="border-b border-border px-3 py-2">
   <Input aria-label="Search Vendor purchases" placeholder="Search invoice or product"
    value={search} onChange={e=>setSearch(e.target.value)}/>
  </div>
  <div className="max-h-[min(70vh,700px)] divide-y divide-border overflow-y-auto">
   {filtered.map(p=><button key={p.id} type="button" aria-pressed={!editing&&p.id===selected?.id}
    onClick={()=>{if(editing&&!window.confirm('Leave the unsaved Purchase form?'))return;
     if(editing){onDirtyChange(false);onEditingChange(false);}setSelectedId(p.id);}}
    className={'block w-full px-3 py-3 text-left hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-teal-500 '+(!editing&&p.id===selected?.id?'bg-teal-50/70 dark:bg-teal-900/20':'')}>
    <strong className="block text-xs text-ink">{p.ref}</strong>
    <span className="mt-1 block truncate text-[11px] text-ink-500">{p.date} · {p.items}</span>
    <span className="mt-1 block text-xs text-ink">{p.total>p.paid?'Due '+taka(Math.max(0,p.total-p.paid)):'Paid'} · {taka(p.total)}</span>
   </button>)}
   {!filtered.length&&<p className="p-8 text-center text-xs text-ink-500">
    {records.length?'No matching Purchase invoices.':'No purchases from this Vendor yet.'}</p>}
  </div>
 </section>;
 const detail=<section data-testid="vendor-purchases-detail" aria-label="Selected Vendor purchase" className="rounded-lg border border-border bg-card p-3 shadow-xs sm:p-4">
  {editing?<PurchaseEditor embedded initialSupplierId={partyId} lockedSupplierId={partyId}
   onCompleted={onSave} onCancel={()=>{onDirtyChange(false);onEditingChange(false);}}/>:
   selected?<div className="space-y-4">
    <div><h4 className="text-sm font-semibold text-ink">{selected.ref} · Purchase Details</h4>
     <p className="mt-1 text-xs text-ink-500">{selected.date} · Original Purchase record</p></div>
    <div className="rounded-lg border border-border p-3 text-xs text-ink-600">
     <span className="font-medium text-ink">Products</span><p className="mt-2">{selected.items}</p>
    </div>
    <div className="grid grid-cols-2 gap-2 text-xs">
     <div className="rounded-lg bg-ink-50 p-3"><p className="text-ink-500">Invoice Total</p><strong>{taka(selected.total)}</strong></div>
     <div className="rounded-lg bg-ink-50 p-3"><p className="text-ink-500">Paid</p><strong>{taka(selected.paid)}</strong></div>
     <div className="col-span-2 flex items-center justify-between rounded-lg bg-ink-50 p-3">
      <span>Purchase Balance Due</span><strong>{taka(Math.max(0,selected.total-selected.paid))}</strong></div>
    </div>
    <p className="text-xs text-ink-500">Purchase payments and returns belong to the original Purchase workflow, not Vendor sourcing.</p>
   </div>:
   <div className="flex min-h-40 flex-col items-center justify-center gap-3 p-5 text-center">
    <p className="text-sm text-ink-500">No purchases from this Vendor yet.</p>
    <Button size="sm" onClick={()=>onEditingChange(true)}>Buy Products</Button>
   </div>}
 </section>;
 return <VendorMasterDetailLayout testId="vendor-purchases-workspace"
  list={list} detail={detail} editingFullWidth={editing}/>;
}
