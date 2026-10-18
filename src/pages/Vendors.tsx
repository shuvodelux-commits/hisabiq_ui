import {useMemo,useState,useSyncExternalStore} from 'react';
import {useSearchParams} from 'react-router-dom';
import {ChevronDown,Plus} from 'lucide-react';
import {toast} from 'sonner';
import {PageHeader} from '../components/PageHeader';
import {Button} from '../components/Button';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '../components/Dialog';
import {PartyAvatar} from '../components/PartyAvatar';
import {useUiCopy} from '../i18n/useUiCopy';
import {PartyEditorDialog} from '../components/parties/PartyEditorDialog';
import {isPartyOpening} from '../utils/partyOpening';
import type {Party} from '../types/erp';
import type {PartyDraft,PartyOpeningPayload} from '../types/partyLedger';
import {VendorDirectory,type VendorDirectoryFilter} from '../components/vendor/VendorDirectory';
import {VendorDiscardDialog} from '../components/vendor/VendorDiscardDialog';
import {VendorTabs} from '../components/vendor/VendorTabs';
import {availableParties,availablePurchases} from '../data/erpDemoStore';
import {getPartyPreviewSnapshot,subscribePartyPreview,dispatchPartyPreview} from '../data/partyPreviewStore';
import {getVendorPreviewSnapshot,subscribeVendorPreview} from '../vendor/vendorPreviewStore';
import {sourceOutstanding,vendorBalances} from '../vendor/vendorModel';
import {filterVendors,resolveVendorView,type VendorWorkTab} from '../vendor/vendorRoute';

export function Vendors(){
 const {text}=useUiCopy();
 const [params,setParams]=useSearchParams();
 const [pickerOpen,setPickerOpen]=useState(false);
 const partyState=useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);
 const snapshot=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);
 const all=availableParties();
 const vendors=all.filter(p=>p.roles.includes('Vendor'));
 const view=resolveVendorView(params.toString(),vendors);
 // Preserve Parties' desktop master-detail proportions; phones open the same directory in a chooser.
 // On first visit, select the first Vendor without rewriting incoming deep links.
 const party=vendors.find(p=>p.id===view.partyId)??vendors[0]??null;
 const [query,setQuery]=useState('');
 const [filter,setFilter]=useState<VendorDirectoryFilter>('all');
 const results=useMemo(()=>filterVendors(vendors,query),[vendors,query]);
 const [dirty,setDirty]=useState(false);
 const [pendingChange,setPendingChange]=useState<{id:string|null;tab?:VendorWorkTab;sourceId?:string}|null>(null);
 const [editing,setEditing]=useState<Party|null|undefined>(undefined);
 const applyChange=(nextId:string|null,tab?:VendorWorkTab,sourceId?:string)=>{
  if(party?.id!==nextId)setDirty(false);
  if(!nextId){setParams({});return true;}
  const q=new URLSearchParams({partyId:nextId});
  if(tab)q.set('tab',tab);
  if(sourceId)q.set('sourceId',sourceId);
  setParams(q);
  return true;
 };
 const change=(nextId:string|null,tab?:VendorWorkTab,sourceId?:string)=>{
  if(party?.id!==nextId&&dirty){setPendingChange({id:nextId,tab,sourceId});return false;}
  return applyChange(nextId,tab,sourceId);
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
   setFilter('all');setQuery('');change(existing.id);
   return;
  }
  const old=new Set(all.map(p=>p.id));
  const updated=dispatchPartyPreview({type:'create-party',party:{
   ...draft,roles:Array.from(new Set([...draft.roles,'Vendor'])),name:draft.name.trim()
  },openings});
  const created=updated.parties.find(p=>!old.has(p.id));
  if(created){setFilter('all');setQuery('');change(created.id);}
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
  if(change(id,filter==='receive'?'given':filter==='needs-price'?'taken':needPrice||dueSource?'taken':'ledger',
   filter==='receive'?dueSource?.id:needPrice?.id??dueSource?.id))setPickerOpen(false);
 };
 return <div className="mx-auto max-w-[1440px] min-w-0 space-y-4" role="region" aria-label="Vendor module">
  <PageHeader title="Vendor" titleBn="ভেন্ডর লেনদেন"
   description="Goods taken and given, purchases, settlement and ledger · UI preview only"
   descriptionBn="পণ্য নেওয়া-দেওয়া, দাম, পাওনা-দেনা ও হিসাব · শুধু প্রিভিউ"
   actions={<Button type="button" size="sm" onClick={()=>setEditing(null)}><Plus className="size-4"/> {text('Add Vendor','ভেন্ডর যোগ করুন')}</Button>}/>
  {party&&<button type="button" data-testid="mobile-vendor-picker" aria-haspopup="dialog" aria-expanded={pickerOpen}
   onClick={()=>setPickerOpen(true)}
   className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 lg:hidden">
    <PartyAvatar name={party.name} color={party.avatarColor} image={party.image} size={36}/>
    <span className="min-w-0 flex-1">
     <span className="block truncate text-sm font-semibold text-ink">{party.name}</span>
     <span className="block truncate text-xs text-ink-500">{party.phone} · {text('Selected Vendor','বাছা ভেন্ডর')}</span>
    </span>
    <span className="shrink-0 text-xs font-semibold text-teal-700 dark:text-teal-300">{text('Change Vendor','ভেন্ডর বদলান')}</span>
    <ChevronDown className="size-4 shrink-0 text-ink-500" aria-hidden="true"/>
   </button>}
  <div className="grid min-w-0 gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
   <div className="hidden min-w-0 lg:block">
    <VendorDirectory rows={rows} shown={shown}
     selectedId={party?.id??''} query={query} onQuery={setQuery}
     filter={filter} onFilter={setFilter} onSelect={selectVendor}/>
   </div>
   {party?<VendorTabs key={party.id} party={party} snapshot={snapshot}
     purchases={availablePurchases().filter(p=>p.supplierId===party.id)}
     tab={view.tab} onTabChange={(tab,sourceId)=>change(party.id,tab,sourceId)}
     sourceId={params.get('sourceId')} onDirtyChange={setDirty}
     onEditVendor={()=>setEditing(party)}/>:
    <section className="flex min-h-[320px] items-center justify-center rounded-xl border border-border bg-card p-8 text-center text-sm text-ink-500">
      No Vendors yet. Choose Add Vendor above to create the first one.
    </section>}
  </div>
  <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
   <DialogContent aria-label={text('Choose Vendor','ভেন্ডর বাছুন')} className="max-h-[92dvh] w-[calc(100vw-1.25rem)] max-w-lg overflow-hidden p-0">
    <DialogHeader className="px-4 pt-4">
     <DialogTitle>{text('Choose Vendor','ভেন্ডর বাছুন')}</DialogTitle>
     <DialogDescription>{text('Search by name or phone, then select a Vendor.','নাম বা ফোন দিয়ে খুঁজে ভেন্ডর বাছুন।')}</DialogDescription>
    </DialogHeader>
    <VendorDirectory rows={rows} shown={shown} compact autoFocusSearch
     selectedId={party?.id??''} query={query} onQuery={setQuery}
     filter={filter} onFilter={setFilter} onSelect={selectVendor}/>
   </DialogContent>
  </Dialog>
  <VendorDiscardDialog open={pendingChange!==null} onCancel={()=>setPendingChange(null)}
   onDiscard={()=>{
    if(!pendingChange)return;
    applyChange(pendingChange.id,pendingChange.tab,pendingChange.sourceId);
    setPendingChange(null);setPickerOpen(false);
   }}/>
  <PartyEditorDialog open={editing!==undefined} party={editing} defaultRole="Vendor"
   existingOpenings={editing?.id?partyState.sources.filter(source=>source.partyId===editing.id&&source.status==='Active'&&isPartyOpening(source)):[]}
   onClose={()=>setEditing(undefined)} onSave={saveVendor}/>
 </div>;
}
