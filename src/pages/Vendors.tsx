import {useMemo,useState,useSyncExternalStore} from 'react';
import {useSearchParams} from 'react-router-dom';
import {ArrowLeft,Plus} from 'lucide-react';
import {toast} from 'sonner';
import {PageHeader} from '../components/PageHeader';
import {Button} from '../components/Button';
import {PartyEditorDialog} from '../components/parties/PartyEditorDialog';
import {isPartyOpening} from '../utils/partyOpening';
import type {Party} from '../types/erp';
import type {PartyDraft,PartyOpeningPayload} from '../types/partyLedger';
import {VendorDirectory,type VendorDirectoryFilter} from '../components/vendor/VendorDirectory';
import {VendorTabs} from '../components/vendor/VendorTabs';
import {availableParties,availablePurchases} from '../data/erpDemoStore';
import {getPartyPreviewSnapshot,subscribePartyPreview,dispatchPartyPreview} from '../data/partyPreviewStore';
import {getVendorPreviewSnapshot,subscribeVendorPreview} from '../vendor/vendorPreviewStore';
import {sourceOutstanding,vendorBalances} from '../vendor/vendorModel';
import {filterVendors,resolveVendorView,type VendorWorkTab} from '../vendor/vendorRoute';

export function Vendors(){
 const [params,setParams]=useSearchParams();
 const partyState=useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);
 const snapshot=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);
 const all=availableParties();
 const vendors=all.filter(p=>p.roles.includes('Vendor'));
 const view=resolveVendorView(params.toString(),vendors);
 // Match Parties: the directory stays visible while the selected record opens beside it.
 // On first visit, select the first Vendor without rewriting incoming deep links.
 const party=vendors.find(p=>p.id===view.partyId)??vendors[0]??null;
 const [showMobileDetail,setShowMobileDetail]=useState(Boolean(params.get('partyId')));
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState<VendorDirectoryFilter>('all');
 const results=useMemo(()=>filterVendors(vendors,query),[vendors,query]);
 const [dirty,setDirty]=useState(false);
 const [editing,setEditing]=useState<Party|null|undefined>(undefined);
 const change=(nextId:string|null,tab?:VendorWorkTab,sourceId?:string)=>{
  if(party?.id!==nextId&&dirty&&typeof window!=='undefined'&&!window.confirm('You have unsaved products. Leave without saving?'))return;
  if(party?.id!==nextId)setDirty(false);
  if(!nextId){setParams({});return;}
  const q=new URLSearchParams({partyId:nextId});
  if(tab)q.set('tab',tab);
  if(sourceId)q.set('sourceId',sourceId);
  setParams(q);
 };
 const saveVendor=(draft:PartyDraft,openings:Omit<PartyOpeningPayload,'partyId'>[])=>{
  if(editing){
   dispatchPartyPreview({type:'update-party',id:editing.id,
    patch:{...draft,roles:Array.from(new Set([...draft.roles,'Vendor']))},openings});
   toast.success('Vendor updated in preview');
   return;
  }
  const key=draft.phone.replace(/\D/g,'');
  const existing=all.find(p=>(key&&p.phone.replace(/\D/g,'')===key)
   ||p.name.trim().toLocaleLowerCase()===draft.name.trim().toLocaleLowerCase());
  if(existing){
   if(!existing.roles.includes('Vendor')){
    dispatchPartyPreview({type:'update-party',id:existing.id,patch:{roles:[...existing.roles,'Vendor']},openings});
    toast.success('Vendor role added to existing Party (preview)');
   }else toast.info('Vendor already exists. Opened existing record.');
   setFilter('all');setQuery('');change(existing.id);setShowMobileDetail(true);
   return;
  }
  const old=new Set(all.map(p=>p.id));
  const updated=dispatchPartyPreview({type:'create-party',party:{
   ...draft,roles:Array.from(new Set([...draft.roles,'Vendor'])),name:draft.name.trim()
  },openings});
  const created=updated.parties.find(p=>!old.has(p.id));
  if(created){setFilter('all');setQuery('');change(created.id);setShowMobileDetail(true);}
  toast.success('Vendor created in preview');
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
  setShowMobileDetail(true);
 };
 return <div className="mx-auto max-w-[1440px] min-w-0 space-y-4" role="region" aria-label="Vendor module">
  <PageHeader title="Vendor" titleBn="ভেন্ডর লেনদেন"
   description="Goods taken and given, purchases, settlement and ledger · UI preview only"
   descriptionBn="পণ্য নেওয়া-দেওয়া, দাম, পাওনা-দেনা ও হিসাব · শুধু প্রিভিউ"
   actions={<Button type="button" size="sm" onClick={()=>setEditing(null)}><Plus className="size-4"/> Add Vendor</Button>}/>
  <div className="grid min-w-0 gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
   <div className={showMobileDetail?'hidden min-w-0 sm:block':'min-w-0'}>
    <VendorDirectory rows={rows} shown={shown}
     selectedId={party?.id??''} query={query} onQuery={setQuery}
     filter={filter} onFilter={setFilter} onSelect={selectVendor}/>
   </div>
   {party?<div className={showMobileDetail?'min-w-0':'hidden min-w-0 sm:block'}>
     <div className="mb-2 sm:hidden">
      <Button type="button" size="sm" variant="outline" onClick={()=>setShowMobileDetail(false)}>
       <ArrowLeft className="size-4"/> All Vendors · সব ভেন্ডর
      </Button>
     </div>
     <VendorTabs key={party.id} party={party} snapshot={snapshot}
      purchases={availablePurchases().filter(p=>p.supplierId===party.id)}
      tab={view.tab} onTabChange={(tab,sourceId)=>change(party.id,tab,sourceId)}
      sourceId={params.get('sourceId')} onDirtyChange={setDirty}
      onEditVendor={()=>setEditing(party)}/>
    </div>:
    <section className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card p-8 text-center text-sm text-ink-500">
      No Vendors yet. Choose Add Vendor above to create the first one.
    </section>}
  </div>
  <PartyEditorDialog open={editing!==undefined} party={editing} defaultRole="Vendor"
   existingOpenings={editing?.id?partyState.sources.filter(source=>source.partyId===editing.id&&source.status==='Active'&&isPartyOpening(source)):[]}
   onClose={()=>setEditing(undefined)} onSave={saveVendor}/>
 </div>;
}
