import React,{useId,useMemo,useState} from 'react';
import {Link} from 'react-router-dom';
import {Plus,Printer} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '../Button';
import {Input} from '../Input';
import {PartyAvatar} from '../PartyAvatar';
import {AppDateRangePicker} from '../AppDateRangePicker';
import {VendorActionDialog,type VendorActionMode} from '../parties/VendorActionDialog';
import {VendorCorrectionDialog} from '../parties/VendorCorrectionDialog';
import {VendorStatementDialog} from '../parties/VendorStatementDialog';
import {VendorGoodsEditor} from './VendorGoodsEditor';
import {VendorSourceWorkspace} from './VendorSourceWorkspace';
import {PurchaseEditor} from '../../pages/PurchaseEditor';
import {projectVendorPartyProfile} from '../../vendor/vendorPartyProjection';
import {sourceOutstanding} from '../../vendor/vendorModel';
import {dispatchVendorPreview} from '../../vendor/vendorPreviewStore';
import {vendorWorkTabs,type VendorWorkTab} from '../../vendor/vendorRoute';
import {type IsoRange} from '../../utils/dateRange';
import {taka} from '../../utils/currency';
import {products} from '../../data/products';
import type {Purchase,Party} from '../../types/erp';
import type {VendorLedgerEvent,VendorPreviewState,VendorSource,VendorSide} from '../../vendor/vendorTypes';

type Props={party:Party;snapshot:VendorPreviewState;purchases:Purchase[];
 tab:VendorWorkTab;onTabChange:(tab:VendorWorkTab)=>void;sourceId:string|null;onDirtyChange:(dirty:boolean)=>void};
const labels:Record<VendorWorkTab,{english:string;bn:string;button:string}>={
 ledger:{english:'Ledger',bn:'হিসাব',button:'Print Ledger'},
 taken:{english:'Taken',bn:'নেওয়া পণ্য',button:'Take Products'},
 given:{english:'Given',bn:'দেওয়া পণ্য',button:'Give Products'},
 purchases:{english:'Purchases',bn:'কেনাকাটা',button:'Buy Products'},
 payments:{english:'Payments',bn:'টাকা লেনদেন',button:'Record Payment'}
};
const money=(v:number)=>taka(v/100);
export function VendorTabs({party,snapshot,purchases,tab,onTabChange,sourceId,onDirtyChange}:Props){
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
 const due=activeSources.filter(s=>(s.unitCostBasePaisa!==null&&(sourceOutstanding(snapshot,s.id).monetaryDuePaisa??0)>0));

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
  if(tab==='payments'){
   const first=due[0];
   if(first)openAction(first,first.sourceKind==='sourcing'?'pay':'receive-money');
   else toast('No priced amount due. Set a price or choose an earlier payment.');
  }
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
    className="rounded-md border border-border px-3 py-2 text-xs text-ink-600 hover:bg-ink-50">View Party · পার্টি দেখুন</Link>
  </div>
  <div className="grid grid-cols-2 gap-2 border-b border-border p-3 lg:grid-cols-4">
   {([{title:'You owe · দেনা',value:money(profile.summary.takenDuePaisa),target:'taken'},
    {title:'Price not set · দাম ঠিক হয়নি',value:profile.summary.priceNotSetBaseQty+' units',target:'taken'},
    {title:'Vendor owes · পাওনা',value:money(profile.summary.givenDuePaisa),target:'given'},
    {title:'Purchase due · ক্রয়ের বাকি',value:money(profile.summary.purchaseDuePaisa),target:'purchases'}] as const).map(item=>
    <button type="button" key={item.title} onClick={()=>selectTab(item.target)}
     className="min-w-0 rounded-lg border border-border bg-ink-50/40 p-2.5 text-left hover:bg-ink-50">
     <span className="block text-xs text-ink-500">{item.title}</span>
     <strong className="mt-1 block truncate text-lg font-semibold text-ink">{item.value}</strong>
    </button>)}
  </div>
  <div className="overflow-x-auto border-b border-border scrollbar-thin">
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
  <section id={base+'-panel'} role="tabpanel" aria-labelledby={base+'-'+tab} className="min-w-0">
   <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-3">
    <h3 className="text-sm font-semibold text-ink">{labels[tab].english} · <span className="font-bn font-normal text-ink-500">{labels[tab].bn}</span></h3>
    <div className="flex flex-wrap gap-2">
     <Button type="button" size="sm" onClick={primary}>
      {tab==='ledger'?<Printer className="size-4"/>:<Plus className="size-4"/>}
      {labels[tab].button}
     </Button>
    </div>
   </div>
   <div className="p-3 sm:p-4">
    {tab==='ledger'&&<>
     <div className="mb-3 flex flex-wrap items-center gap-2">
      <label className="text-xs text-ink-500">Account
       <select aria-label="Vendor balance side" value={side} onChange={e=>setSide(e.target.value as VendorSide)}
        className="ml-2 rounded-md border border-input bg-card px-2 py-2 text-sm text-ink">
        <option value="payable">Taken · You owe</option><option value="receivable">Given · Vendor owes</option>
       </select></label>
      <AppDateRangePicker value={range} onChange={setRange} label="Vendor ledger date range"/>
      {Boolean(range.from)!==Boolean(range.to)&&<span className="text-xs text-warning">Choose both dates to filter</span>}
      <Input className="w-full sm:ml-auto sm:w-56" value={query} onChange={e=>setQuery(e.target.value)}
       aria-label="Search Vendor ledger" placeholder="Search reference or note"/>
     </div>
     <div className="mb-2 flex flex-wrap justify-between gap-2 bg-ink-50 px-3 py-2 text-xs text-ink-600">
      <span>Opening: {money((side==='payable'?profile.takenStatement:profile.givenStatement).openingPaisa)}</span>
      <span>Increased: {money((side==='payable'?profile.takenStatement:profile.givenStatement).periodIncreasePaisa)}</span>
      <span>Decreased: {money((side==='payable'?profile.takenStatement:profile.givenStatement).periodDecreasePaisa)}</span>
     </div>
     <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-xs">
      <thead><tr className="border-b border-border bg-ink-50">
       {['Date','Details','Increase','Decrease','Running','Actions'].map(x=><th key={x} className="p-2 text-left">{x}</th>)}
      </tr></thead><tbody>
      {(side==='payable'?profile.takenStatement:profile.givenStatement).rows.filter(e=>(e.reference+' '+e.description).toLowerCase().includes(query.toLowerCase())).map(e=>
       <tr key={e.id} className="border-b border-border/70"><td className="p-2 text-ink-500">{e.date}</td>
        <td className="p-2 font-medium text-ink">{e.reference??e.kind}<p className="font-normal text-ink-500">{e.description}</p></td>
        <td className="p-2 text-right">{e.deltaPaisa>0?money(e.deltaPaisa):'—'}</td>
        <td className="p-2 text-right">{e.deltaPaisa<0?money(-e.deltaPaisa):'—'}</td>
        <td className="p-2 text-right font-semibold">{money(e.runningPaisa)}</td>
        <td className="p-2 text-right"><Button size="sm" variant="ghost" onClick={()=>review(e)}>Review</Button></td>
       </tr>)}
      </tbody></table></div>
     {side==='payable'&&profile.takenStatement.unpricedSources.length>0&&<p className="mt-2 text-xs text-ink-500">
      {profile.takenStatement.unpricedSources.length} source(s) with <strong>Price not set</strong>. See Taken tab; no money value has been assigned.</p>}
     {profile.activity.filter(item=>item.bucket===(side==='payable'?'vendor-payable':'vendor-receivable')
       &&item.moneyPaisa===null
       &&(item.reference+' '+item.description).toLowerCase().includes(query.toLowerCase())).length>0&&
      <div className="mt-3 rounded-lg border border-border">
       <h4 className="border-b border-border bg-ink-50 px-3 py-2 text-xs font-semibold text-ink">
        Records without a money amount · দাম ঠিক হয়নি / সংশোধন
       </h4>
       {profile.activity.filter(item=>item.bucket===(side==='payable'?'vendor-payable':'vendor-receivable')
         &&item.moneyPaisa===null
         &&(item.reference+' '+item.description).toLowerCase().includes(query.toLowerCase())).map(item=>
        <div key={item.id} className="flex flex-wrap items-center gap-3 border-b border-border/60 px-3 py-2 text-xs">
         <span className="text-ink-500">{item.date}</span>
         <div className="min-w-0 flex-1"><strong className="text-ink">{item.reference}</strong>
          <p className="text-ink-500">{item.description}</p></div>
         <span className="text-ink-500">No money amount</span>
         {item.sourceEventId&&item.kind!=='reversal'&&
          <Button type="button" size="sm" variant="ghost" onClick={()=>{
           const entry=snapshot.events.find(e=>e.id===item.sourceEventId);if(entry)review(entry);
          }}>Review</Button>}
        </div>)}
      </div>}
    </>}
    {(tab==='taken'||tab==='given')&&<>
      {(tab==='taken'?editingTaken:editingGiven)&&<div className="mb-4">
       <VendorGoodsEditor partyId={party.id} mode={tab} onDirtyChange={updateDirty}
        onCancel={()=>{tab==='taken'?setEditingTaken(false):setEditingGiven(false);updateDirty(false);}}
        onSaved={()=>{tab==='taken'?setEditingTaken(false):setEditingGiven(false);toast.success('Products saved in demo preview');}}/>
      </div>}
      <VendorSourceWorkspace key={tab} mode={tab} sources={tab==='taken'?taken:given}
        snapshot={snapshot} sourceId={sourceId} onCorrect={setCorrectSource}/>
     </>}
     {tab==='purchases'&&<>
     {editingPurchase?<div className="mb-4">
      <PurchaseEditor embedded initialSupplierId={party.id} lockedSupplierId={party.id} onCompleted={savePurchase}
       onCancel={()=>{setEditingPurchase(false);onDirtyChange(false);}}/>
     </div>:null}
     <div className="divide-y divide-border rounded-lg border border-border">
      {purchases.map(p=><div key={p.id} className="flex flex-wrap items-center gap-3 p-3 text-xs">
       <div className="min-w-0 flex-1"><strong>{p.ref}</strong><p className="text-ink-500">{p.date} · {p.items}</p></div>
       <strong>{taka(p.total)}</strong><span className="text-ink-500">{p.total>p.paid?'Due '+taka(p.total-p.paid):'Paid'}</span>
      </div>)}
      {!purchases.length&&<p className="p-8 text-center text-sm text-ink-500">No purchases from this Vendor yet.</p>}
     </div>
    </>}
    {tab==='payments'&&<>
     <p className="mb-3 text-xs text-ink-500">Choose the bill you are paying or receiving money for. Payments remain linked to that record.</p>
     <div className="divide-y divide-border rounded-lg border border-border">
      {due.map(s=>{
       const out=sourceOutstanding(snapshot,s.id);
       return <div key={s.id} className="flex flex-wrap items-center gap-3 p-3 text-xs">
        <div className="min-w-0 flex-1"><strong>{s.reference??s.id}</strong>
         <p className="text-ink-500">{s.sourceKind==='sourcing'?'You owe':'Vendor owes'} · {products.find(p=>p.id===s.productId)?.name??s.productId}</p></div>
        <strong>{money(out.monetaryDuePaisa??0)}</strong>
        <Button size="sm" variant="outline" onClick={()=>openAction(s,s.sourceKind==='sourcing'?'pay':'receive-money')}>
         {s.sourceKind==='sourcing'?'Pay Money':'Receive Money'}</Button>
       </div>;
      })}
      {!due.length&&<p className="p-8 text-center text-sm text-ink-500">No priced amount due. If the price is not set, open Taken first.</p>}
     </div>
     <h4 className="mb-2 mt-5 text-sm font-semibold text-ink">Previous payments · আগের লেনদেন</h4>
     <div className="divide-y divide-border rounded-lg border border-border">
      {snapshot.settlements.filter(s=>s.vendorPartyId===party.id&&(s.kind==='pay'||s.kind==='receive-money')).map(s=>
       <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-3 text-xs">
        <span>{s.date} · {s.kind==='pay'?'Money paid':'Money received'}</span>
        <strong>{money(s.amountPaisa??0)}</strong>
        <span className="text-ink-500">{s.status}</span>
        <Button size="sm" variant="ghost" onClick={()=>{const e=snapshot.events.find(e=>e.operationId===s.operationId&&e.kind==='settlement');if(e)review(e);}}>Review</Button>
       </div>)}
     </div>
     {profile.summary.purchaseDuePaisa>0&&<p className="mt-3 rounded-md bg-ink-50 p-3 text-xs text-ink-500">
      Ordinary Purchase due {money(profile.summary.purchaseDuePaisa)} is separate; pay against the original Purchase bill. No Vendor sourcing payment will be applied automatically.</p>}
    </>}
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
