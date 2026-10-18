import {useMemo,useState,useSyncExternalStore} from 'react';
import {useSearchParams} from 'react-router-dom';
import {toast} from 'sonner';
import {PageHeader} from '../components/PageHeader';
import {VendorDirectory,type VendorDirectoryFilter} from '../components/vendor/VendorDirectory';
import {VendorTabs} from '../components/vendor/VendorTabs';
import {availableParties,availablePurchases} from '../data/erpDemoStore';
import {getPartyPreviewSnapshot,subscribePartyPreview,dispatchPartyPreview} from '../data/partyPreviewStore';
import {getVendorPreviewSnapshot,subscribeVendorPreview} from '../vendor/vendorPreviewStore';
import {sourceOutstanding,vendorBalances} from '../vendor/vendorModel';
import {filterVendors,resolveVendorView,type VendorWorkTab} from '../vendor/vendorRoute';

export function Vendors(){
 const [params,setParams]=useSearchParams();
 useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);
 const snapshot=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);
 const all=availableParties();
 const vendors=all.filter(p=>p.roles.includes('Vendor'));
 const view=resolveVendorView(params.toString(),vendors);
 // Match Parties: the directory stays visible while the selected record opens beside it.
 // On first visit, select the first Vendor without rewriting incoming deep links.
 const party=vendors.find(p=>p.id===view.partyId)??vendors[0]??null;
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState<VendorDirectoryFilter>('all');
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
 const shown=rows.filter(({balance})=>filter==='all'
  ||(filter==='needs-price'?balance.unpricedSourceCount>0:filter==='pay'?balance.knownPayablePaisa>0:balance.knownReceivablePaisa>0))
  .sort((a,b)=>Number(b.balance.unpricedSourceCount>0)-Number(a.balance.unpricedSourceCount>0)
   ||b.balance.knownPayablePaisa-a.balance.knownPayablePaisa);
 const selectVendor=(id:string)=>{
  const needPrice=snapshot.sources.find(s=>s.vendorPartyId===id&&s.status==='Active'
   &&s.sourceKind==='sourcing'&&sourceOutstanding(snapshot,s.id).unpricedBaseQty>0);
  const dueSource=snapshot.sources.find(s=>s.vendorPartyId===id&&s.status==='Active'
   &&s.sourceKind===(filter==='receive'?'issue':'sourcing')
   &&(sourceOutstanding(snapshot,s.id).monetaryDuePaisa??0)>0);
  change(id,filter==='receive'?'given':filter==='needs-price'?'taken':needPrice||dueSource?'taken':'ledger',
   filter==='receive'?dueSource?.id:needPrice?.id??dueSource?.id);
 };
 return <div className="mx-auto max-w-[1440px] min-w-0 space-y-4" role="region" aria-label="Vendor module">
  <PageHeader title="Vendor" titleBn="ভেন্ডর লেনদেন"
   description="Goods taken and given, purchases, settlement and ledger · UI preview only"
   descriptionBn="পণ্য নেওয়া-দেওয়া, দাম, পাওনা-দেনা ও হিসাব · শুধু প্রিভিউ"/>
  <div className="grid min-w-0 gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
   <VendorDirectory vendors={vendors} rows={rows} shown={shown}
    selectedId={party?.id??''} query={query} onQuery={setQuery}
    filter={filter} onFilter={setFilter} onSelect={selectVendor} onAddVendor={addVendor}/>
   {party?<VendorTabs key={party.id} party={party} snapshot={snapshot}
     purchases={availablePurchases().filter(p=>p.supplierId===party.id)}
     tab={view.tab} onTabChange={(tab,sourceId)=>change(party.id,tab,sourceId)}
     sourceId={params.get('sourceId')} onDirtyChange={setDirty}/>:
    <section className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card p-8 text-center text-sm text-ink-500">
      No Vendors yet. Add your first Vendor using the directory.
    </section>}
  </div>
 </div>;
}
