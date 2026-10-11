import React,{useMemo,useState,useSyncExternalStore} from 'react';
import {useSearchParams} from 'react-router-dom';
import {ArrowLeft,ChevronRight,Search} from 'lucide-react';
import {toast} from 'sonner';
import {PageHeader} from '../components/PageHeader';
import {Button} from '../components/Button';
import {Input} from '../components/Input';
import {QuickAddSelect} from '../components/QuickAddSelect';
import {PartyAvatar} from '../components/PartyAvatar';
import {VendorTabs} from '../components/vendor/VendorTabs';
import {availableParties,availablePurchases} from '../data/erpDemoStore';
import {getPartyPreviewSnapshot,subscribePartyPreview,dispatchPartyPreview} from '../data/partyPreviewStore';
import {getVendorPreviewSnapshot,subscribeVendorPreview} from '../vendor/vendorPreviewStore';
import {sourceOutstanding,vendorBalances} from '../vendor/vendorModel';
import {filterVendors,resolveVendorView,type VendorWorkTab} from '../vendor/vendorRoute';
import {taka} from '../utils/currency';
import type {Party} from '../types/erp';

export function Vendors(){
 const [params,setParams]=useSearchParams();
 useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);
 const snapshot=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);
 const all=availableParties();
 const vendors=all.filter(p=>p.roles.includes('Vendor'));
 const view=resolveVendorView(params.toString(),vendors);
 const party=view.partyId?vendors.find(p=>p.id===view.partyId)??null:null;
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState<'all'|'needs-price'>('all');
 const results=useMemo(()=>filterVendors(vendors,query),[vendors,query]);
 const [dirty,setDirty]=useState(false);
 const change=(nextId:string|null,tab?:VendorWorkTab,sourceId?:string)=>{
  if(party?.id!==nextId&&dirty&&typeof window!=='undefined'&&!window.confirm('You have unsaved products. Leave without saving?'))return;
  if(party?.id!==nextId)setDirty(false);
  if(!nextId){setParams({});return;}
  const q=new URLSearchParams({partyId:nextId});
  if(tab)q.set('tab',tab);
  if(sourceId)q.set('sourceId',sourceId);
  setParams(q);
 };
 const addVendor=(name:string,phone:string,area:string)=>{
  try{
   const key=phone.replace(/\D/g,'');
   const existing=all.find(p=>(key&&p.phone.replace(/\D/g,'')===key)
    ||p.name.trim().toLocaleLowerCase()===name.trim().toLocaleLowerCase());
   if(existing){
    if(existing.roles.includes('Vendor')){change(existing.id);return;}
    dispatchPartyPreview({type:'update-party',id:existing.id,patch:{roles:[...existing.roles,'Vendor']}});
    change(existing.id);
    toast.success('Vendor role added to existing Party (preview)');
    return;
   }
   const old=new Set(all.map(p=>p.id));
   const updated=dispatchPartyPreview({type:'create-party',party:{
    name,roles:['Vendor'],phone,area
   }});
   const created=updated.parties.find(p=>!old.has(p.id));
   if(created)change(created.id);
   toast.success('Vendor created (preview)');
  }catch(e){toast.error(e instanceof Error?e.message:'Could not add Vendor');}
 };
 const rows=results.map(p=>({p,balance:vendorBalances(snapshot,p.id)}));
 const needsPriceCount=rows.filter(row=>row.balance.unpricedSourceCount>0).length;
 const shown=rows.filter(row=>filter==='all'||row.balance.unpricedSourceCount>0)
  .sort((a,b)=>Number(b.balance.unpricedSourceCount>0)-Number(a.balance.unpricedSourceCount>0)
   ||b.balance.knownPayablePaisa-a.balance.knownPayablePaisa);
 return <div className="mx-auto max-w-[1440px] min-w-0 space-y-4" role="region" aria-label="Vendor module">
  <PageHeader title="Vendor" titleBn="ভেন্ডর" description="Source goods, settle dues, and record purchases · UI preview only" actions={party&&
   <Button type="button" variant="outline" size="sm" onClick={()=>change(null)}><ArrowLeft className="size-4"/> All Vendors</Button>}/>
  {!party? <section className="rounded-xl border border-border bg-card p-4 shadow-card space-y-4">
   <div className="flex flex-wrap items-end justify-between gap-3">
    <div className="min-w-[240px] flex-1">
     <label htmlFor="vendor-module-search" className="mb-1 block text-sm font-medium text-ink">Choose Vendor · ভেন্ডর বাছুন</label>
     <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-ink-400"/>
      <Input id="vendor-module-search" aria-label="Search Vendors" placeholder="Name, phone or area"
       className="pl-9" value={query} onChange={e=>setQuery(e.target.value)}/>
     </div>
    </div>
    <div className="w-full sm:w-[230px]">
     <p className="mb-1 text-xs font-medium text-ink">Quick Add · নতুন ভেন্ডর</p>
     <QuickAddSelect label="Vendor" value="" options={vendors.map(p=>p.name)}
      onChange={name=>{const v=vendors.find(p=>p.name===name);if(v)change(v.id);}}
      onCreate={addVendor} showContact placeholder="Select or add Vendor"/>
    </div>
   </div>
   <div className="flex flex-wrap gap-2" role="group" aria-label="Vendor filter">
    <button type="button" aria-pressed={filter==='all'} onClick={()=>setFilter('all')}
     className={'h-8 rounded-lg border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 '+(filter==='all'?'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-200':'border-border text-ink-600 hover:bg-ink-50')}>
     All ({rows.length})
    </button>
    <button type="button" aria-pressed={filter==='needs-price'} onClick={()=>setFilter('needs-price')}
     className={'h-8 rounded-lg border px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 '+(filter==='needs-price'?'border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-200':'border-border text-ink-600 hover:bg-ink-50')}>
     Needs price ({needsPriceCount})
    </button>
   </div>
   <div className="overflow-hidden rounded-lg border border-border">
    <div className="hidden grid-cols-[40px_minmax(0,1fr)_11rem_9rem_1rem] gap-3 border-b border-border bg-ink-50 px-4 py-2 text-xs text-ink-500 sm:grid">
     <span/><span>Vendor</span><span>You owe · দেনা</span><span>Vendor owes · পাওনা</span><span/>
    </div>
    <div className="divide-y divide-border">
     {shown.map(({p,balance:v})=><button type="button" key={p.id}
       onClick={()=>{
        const needPrice=snapshot.sources.find(s=>s.vendorPartyId===p.id&&s.status==='Active'
         &&s.sourceKind==='sourcing'&&sourceOutstanding(snapshot,s.id).unpricedBaseQty>0);
        change(p.id,needPrice?'taken':undefined,needPrice?.id);
       }}
       className="grid w-full min-w-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-x-3 gap-y-1 px-4 py-3 text-left hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-500 sm:grid-cols-[40px_minmax(0,1fr)_11rem_9rem_1rem]">
       <PartyAvatar name={p.name} color={p.avatarColor} image={p.image} size={40}/>
       <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-ink">{p.name}
         {p.nameBn&&<span className="ml-2 font-bn text-xs font-normal text-ink-500">{p.nameBn}</span>}
        </span>
        <span className="block truncate text-xs text-ink-500">{p.phone} · {p.area}</span>
       </span>
       <span className="col-start-2 min-w-0 text-xs sm:col-start-auto">
        <span className="text-ink-500 sm:hidden">You owe · </span>
        {v.unpricedSourceCount>0&&<span className="mr-1 inline-block rounded-full bg-warning-bg px-2 py-0.5 font-medium text-warning">Price not set ({v.unpricedSourceCount})</span>}
        {(v.knownPayablePaisa>0||v.unpricedSourceCount===0)&&<strong className="whitespace-nowrap text-sm font-semibold text-ink">{taka(v.knownPayablePaisa/100)}</strong>}
       </span>
       <span className="col-start-2 min-w-0 text-xs sm:col-start-auto">
        <span className="text-ink-500 sm:hidden">Vendor owes · </span>
        <strong className="whitespace-nowrap text-sm font-semibold text-ink">{taka(v.knownReceivablePaisa/100)}</strong>
       </span>
       <ChevronRight className="hidden size-4 text-ink-400 sm:block" aria-hidden="true"/>
      </button>)}
    </div>
   </div>
   {shown.length===0&&<p className="py-10 text-center text-sm text-ink-500">{filter==='needs-price'?'No Vendors need a price right now.':'No Vendors found. Add one here without leaving the module.'}</p>}
  </section>:
  <VendorTabs key={party.id} party={party} snapshot={snapshot}
   purchases={availablePurchases().filter(p=>p.supplierId===party.id)}
   tab={view.tab} onTabChange={(tab,sourceId)=>change(party.id,tab,sourceId)}
   sourceId={params.get('sourceId')} onDirtyChange={setDirty}/>}
 </div>;
}
