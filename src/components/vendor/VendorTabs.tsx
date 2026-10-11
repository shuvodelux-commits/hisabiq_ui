import React,{useId,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {Plus,Printer} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '../Button';
import {PartyAvatar} from '../PartyAvatar';
import {VendorActionDialog,type VendorActionMode} from '../parties/VendorActionDialog';
import {VendorCorrectionDialog} from '../parties/VendorCorrectionDialog';
import {VendorStatementDialog} from '../parties/VendorStatementDialog';
import {VendorGoodsEditor} from './VendorGoodsEditor';
import {VendorReceivedWorkspace} from './VendorReceivedWorkspace';
import {VendorIssuedWorkspace} from './VendorIssuedWorkspace';
import {VendorPurchasesWorkspace} from './VendorPurchasesWorkspace';
import {VendorPaymentsWorkspace} from './VendorPaymentsWorkspace';
import {VendorLedgerWorkspace} from './VendorLedgerWorkspace';
import {projectVendorPartyProfile} from '../../vendor/vendorPartyProjection';
import {dispatchVendorPreview} from '../../vendor/vendorPreviewStore';
import {vendorWorkTabs,type VendorWorkTab,type VendorPaymentIntent} from '../../vendor/vendorRoute';
import type {IsoRange} from '../../utils/dateRange';
import {taka} from '../../utils/currency';
import type {Purchase,Party} from '../../types/erp';
import type {VendorLedgerEvent,VendorPreviewState,VendorSource,VendorSide} from '../../vendor/vendorTypes';

type Props={party:Party;snapshot:VendorPreviewState;purchases:Purchase[];
 tab:VendorWorkTab;onTabChange:(tab:VendorWorkTab)=>void;sourceId:string|null;onDirtyChange:(dirty:boolean)=>void;paymentIntent?:VendorPaymentIntent|null};
const labels:Record<VendorWorkTab,{english:string;bn:string;button:string}>={
 ledger:{english:'Ledger',bn:'হিসাব',button:'Print Ledger'},
 taken:{english:'Products Received',bn:'পণ্য গ্রহণ',button:'Receive Products'},
 given:{english:'Products Issued',bn:'পণ্য প্রদান',button:'Issue Products'},
 purchases:{english:'Purchases',bn:'কেনাকাটা',button:'Buy Products'},
 payments:{english:'Payments',bn:'টাকা লেনদেন',button:'Record Payment'}
};
const money=(v:number)=>taka(v/100);
export function VendorTabs({party,snapshot,purchases,tab,onTabChange,sourceId,onDirtyChange,paymentIntent}:Props){
 const base=useId().replace(/:/g,'');
 const [range,setRange]=useState<IsoRange>({from:'',to:''});
 const [query,setQuery]=useState('');
 const [side,setSide]=useState<VendorSide>('payable');
 const [editingTaken,setEditingTaken]=useState(false);
 const [hasUnsavedGoods,setHasUnsavedGoods]=useState(false);
 const updateDirty=(value:boolean)=>{setHasUnsavedGoods(value);onDirtyChange(value);};
 const [editingGiven,setEditingGiven]=useState(false);
 const [editingPurchase,setEditingPurchase]=useState(false);
 const [purchaseRevision,setPurchaseRevision]=useState(0);
 const [statementOpen,setStatementOpen]=useState(false);
 const [selectedSource,setSelectedSource]=useState<string|null>(sourceId);
 const [actionMode,setActionMode]=useState<VendorActionMode>('details');
 const [correctSource,setCorrectSource]=useState<string|null>(null);
 const [correctEvent,setCorrectEvent]=useState<string|null>(null);
 const checkedRange=Boolean(range.from)===Boolean(range.to)?range:{from:'',to:''};
 const profile=useMemo(()=>projectVendorPartyProfile(snapshot,purchases,party.id,checkedRange),
  [snapshot,purchases,party.id,range.from,range.to,purchaseRevision]);
 const activeSources=snapshot.sources.filter(s=>s.vendorPartyId===party.id&&s.status==='Active');
 const taken=activeSources.filter(s=>s.sourceKind==='sourcing');
 const given=activeSources.filter(s=>s.sourceKind==='issue');
 const selected=selectedSource?snapshot.sources.find(s=>s.id===selectedSource)??null:null;
 const openAction=(s:VendorSource,mode:VendorActionMode)=>{setSelectedSource(s.id);setActionMode(mode);};
 const selectTab=(next:VendorWorkTab)=>{
  if(next!==tab&&hasUnsavedGoods&&!window.confirm('Unsaved products will be lost. Switch tabs?'))return;
  if(next!==tab&&hasUnsavedGoods){updateDirty(false);setEditingTaken(false);setEditingGiven(false);}
  if(next!==tab&&editingPurchase&&!window.confirm('Leave this Purchase form? Unsaved purchase products will be lost.'))return;
  if(next!==tab&&editingPurchase){setEditingPurchase(false);onDirtyChange(false);}
  onTabChange(next);
 };
 const primary=()=>{
  if(tab==='ledger'){setStatementOpen(true);return;}
  if(tab==='taken'){setEditingTaken(true);return;}
  if(tab==='given'){setEditingGiven(true);return;}
  if(tab==='purchases'){setEditingPurchase(true);return;}
 };
 const review=(event:VendorLedgerEvent)=>{
  setCorrectEvent(event.id);
  const id=event.sourceId??snapshot.settlements.find(s=>s.operationId===event.operationId)?.allocations[0]?.sourceId??null;
  setCorrectSource(id);
 };
 const savePurchase=(p:Purchase)=>{
  if(p.supplierId!==party.id){toast.error('Choose the same Vendor before saving.');return;}
  try{
   dispatchVendorPreview({type:'record-purchase-inventory',operationId:'vendor-normal-purchase:'+p.id,
    vendorPartyId:party.id,purchaseId:p.id,lines:(p.inventoryLines??[]).map(l=>({productId:l.productId,baseQty:l.quantity}))});
  }catch(e){toast.error('Purchase created in preview. Stock projection needs review: '+String(e));}
  setPurchaseRevision(n=>n+1);setEditingPurchase(false);onDirtyChange(false);
 };
 return <div className="min-w-0 rounded-xl border border-border bg-card shadow-card" role="region" aria-label="Selected Vendor work">
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
   <div className="flex min-w-0 items-center gap-3"><PartyAvatar name={party.name} color={party.avatarColor} image={party.image} size={46}/>
    <div className="min-w-0"><h2 className="truncate text-lg font-semibold text-ink">{party.name}
     {party.nameBn&&<span className="ml-2 font-bn text-sm font-normal text-ink-500">{party.nameBn}</span>}</h2>
     <p className="text-xs text-ink-500">{party.phone} · {party.area}</p></div></div>
   <Link to={'/app/parties?id='+encodeURIComponent(party.id)+'&role=Vendor'}
    className="rounded-md border border-border px-3 py-2 text-xs text-ink-600 hover:bg-ink-50">Vendor Account · ভেন্ডর হিসাব</Link>
  </div>
  <div className="grid grid-cols-2 gap-2 border-b border-border p-3 lg:grid-cols-4">
   {([{title:'Amount Payable · দেনা',value:money(profile.summary.takenDuePaisa),target:'taken'},
    {title:'Unpriced Products · দাম ঠিক হয়নি',value:profile.summary.priceNotSetBaseQty+' units',target:'taken'},
    {title:'Amount Receivable · পাওনা',value:money(profile.summary.givenDuePaisa),target:'given'},
    {title:'Purchase Balance Due · ক্রয়ের বাকি',value:money(profile.summary.purchaseDuePaisa),target:'purchases'}] as const).map(item=>
    <button type="button" key={item.title} onClick={()=>selectTab(item.target)}
     className="min-w-0 rounded-lg border border-border bg-ink-50/40 p-2.5 text-left hover:bg-ink-50">
     <span className="block text-xs text-ink-500">{item.title}</span>
     <strong className="mt-1 block truncate text-lg font-semibold text-ink">{item.value}</strong>
    </button>)}
  </div>
  <div className="flex min-w-0 items-center justify-between gap-2 border-b border-border">
   <div className="min-w-0 overflow-x-auto scrollbar-thin">
    <div className="flex min-w-max gap-2 px-3" role="tablist" aria-label="Vendor work tabs">
    {vendorWorkTabs.map((key,index)=><button type="button" key={key}
     id={base+'-'+key} role="tab" aria-selected={tab===key} aria-controls={base+'-panel'} tabIndex={tab===key?0:-1}
     className={'erp-tab px-3 py-3 text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-500 '+(tab===key?'erp-tab-active border-b-2 border-teal-600 text-ink':'text-ink-500')}
     onClick={()=>selectTab(key)} onKeyDown={e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      e.preventDefault();
      const next=e.key==='Home'?0:e.key==='End'?vendorWorkTabs.length-1:
       (index+(e.key==='ArrowRight'?1:-1)+vendorWorkTabs.length)%vendorWorkTabs.length;
      selectTab(vendorWorkTabs[next]);
      e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
     }}>{labels[key].english} <span className="font-bn text-[11px] text-ink-400">{labels[key].bn}</span></button>)}
    </div>
   </div>
   <div className="flex shrink-0 items-center gap-1.5 pr-3">
    {tab==='ledger'&&<details className="relative text-xs">
     <summary className="cursor-pointer rounded-md border border-border px-3 py-2">More</summary>
     <div className="absolute right-0 top-full z-20 min-w-40 rounded-lg border border-border bg-card p-2 shadow-lg">
      <Button type="button" variant="ghost" size="sm" onClick={()=>setStatementOpen(true)}>Export Ledger</Button>
     </div>
    </details>}
    {tab!=='payments'&&<Button type="button" size="sm" onClick={primary}>
     {tab==='ledger'?<Printer className="size-4"/>:<Plus className="size-4"/>}
     {labels[tab].button}
    </Button>}
   </div>
  </div>
  <section id={base+'-panel'} role="tabpanel" aria-labelledby={base+'-'+tab} className="min-w-0">
   <div className="p-3 sm:p-4">
    {tab==='ledger'&&<VendorLedgerWorkspace
     profile={profile} snapshot={snapshot} side={side} setSide={setSide}
     range={range} setRange={setRange} query={query} setQuery={setQuery} review={review}/>}
    {tab==='taken'&&<VendorReceivedWorkspace
     partyId={party.id} snapshot={snapshot} sources={taken} sourceId={sourceId}
     editing={editingTaken} onEditingChange={setEditingTaken} dirty={hasUnsavedGoods}
     onDirtyChange={updateDirty} onAction={openAction} onCorrect={setCorrectSource}/>}
    {tab==='given'&&<VendorIssuedWorkspace
     partyId={party.id} snapshot={snapshot} sources={given} sourceId={sourceId}
     editing={editingGiven} onEditingChange={setEditingGiven} dirty={hasUnsavedGoods}
     onDirtyChange={updateDirty} onAction={openAction} onCorrect={setCorrectSource}/>}
    {tab==='purchases'&&<VendorPurchasesWorkspace
     partyId={party.id} purchases={purchases} editing={editingPurchase}
     onEditingChange={setEditingPurchase} onSave={savePurchase} onDirtyChange={onDirtyChange}/>}
    {tab==='payments'&&<VendorPaymentsWorkspace
     partyId={party.id} snapshot={snapshot} sources={activeSources} purchases={purchases}
     sourceId={sourceId} intent={paymentIntent}
     onOpenPurchases={()=>selectTab('purchases')} onReview={review}/>}
   </div>
  </section>
  <VendorActionDialog source={selected} mode={actionMode} onClose={()=>setSelectedSource(null)}/>
  <VendorCorrectionDialog source={snapshot.sources.find(s=>s.id===correctSource)??null}
   event={snapshot.events.find(e=>e.id===correctEvent)??null} state={snapshot}
   onClose={()=>{setCorrectEvent(null);setCorrectSource(null);}}
   onReviewEvent={review} onBackToSource={()=>setCorrectEvent(null)}/>
  <VendorStatementDialog open={statementOpen} onClose={()=>setStatementOpen(false)}
   party={party} state={snapshot} range={checkedRange}/>
 </div>;
}
