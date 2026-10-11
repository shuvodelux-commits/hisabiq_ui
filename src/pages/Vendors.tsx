import React,{useMemo,useState,useSyncExternalStore} from 'react';
import {useSearchParams} from 'react-router-dom';
import {ArrowLeft,Search} from 'lucide-react';
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
import {vendorBalances} from '../vendor/vendorModel';
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
 const totals=(p:Party)=>{
  const v=vendorBalances(snapshot,p.id);
  return {v,waiting:v.unpricedSourceCount};
 };
 return <div className="mx-auto max-w-[1440px] min-w-0 space-y-4" role="region" aria-label="Vendor module">
  <PageHeader title="Vendor" titleBn="ভেন্ডর" description="Take products, give products, pay, and see your Vendor accounts · Preview only" actions={party&&
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
   <div className="grid gap-2 md:grid-cols-2">
    {results.map(p=>{const {v}=totals(p);return <button type="button" key={p.id} onClick={()=>change(p.id)}
     className="flex min-w-0 items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-ink-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">
     <PartyAvatar name={p.name} color={p.avatarColor} image={p.image} size={40}/>
     <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{p.name}</span>
      <span className="block truncate text-xs text-ink-500">{p.phone} · {p.area}</span>
      <span className="block text-[11px] text-ink-500">{v.unpricedSourceCount} price not set</span>
     </span>
     <span className="text-right text-xs text-ink-600"><span className="block">You owe</span>
      <strong className="text-sm text-ink">{taka(v.knownPayablePaisa/100)}</strong></span>
    </button>;})}
   </div>
   {results.length===0&&<p className="py-10 text-center text-sm text-ink-500">No Vendors found. Add one here without leaving the module.</p>}
  </section>:
  <VendorTabs key={party.id} party={party} snapshot={snapshot}
   purchases={availablePurchases().filter(p=>p.supplierId===party.id)}
   tab={view.tab} onTabChange={tab=>change(party.id,tab)}
   sourceId={params.get('sourceId')} onDirtyChange={setDirty}/>}
 </div>;
}
