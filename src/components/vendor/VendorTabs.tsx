import {matchesSearch as fuzzyMatch} from '../../utils/fuzzySearch';
import {useEffect,useId,useMemo,useState} from 'react';
import {Plus,Printer} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '../Button';
import {Input} from '../Input';
import {AppSelect} from '../AppSelect';
import {PartyAvatar} from '../PartyAvatar';
import {AppDateRangePicker} from '../AppDateRangePicker';
import {VendorCorrectionDialog} from '../parties/VendorCorrectionDialog';
import {VendorStatementDialog} from '../parties/VendorStatementDialog';
import {VendorGoodsEditor} from './VendorGoodsEditor';
import {VendorSourceWorkspace} from './VendorSourceWorkspace';
import {VendorPaymentsWorkspace} from './VendorPaymentsWorkspace';
import {PurchaseEditor} from '../../pages/PurchaseEditor';
import {projectVendorPartyProfile} from '../../vendor/vendorPartyProjection';
import {sourceOutstanding} from '../../vendor/vendorModel';
import {dispatchVendorPreview} from '../../vendor/vendorPreviewStore';
import {vendorWorkTabs,type VendorWorkTab} from '../../vendor/vendorRoute';
import {type IsoRange} from '../../utils/dateRange';
import {taka} from '../../utils/currency';
import type {Purchase,Party} from '../../types/erp';
import type {VendorLedgerEvent,VendorPreviewState,VendorSide} from '../../vendor/vendorTypes';

type Props={party:Party;snapshot:VendorPreviewState;purchases:Purchase[];
 tab:VendorWorkTab;onTabChange:(tab:VendorWorkTab,sourceId?:string)=>void;sourceId:string|null;onDirtyChange:(dirty:boolean)=>void;onEditVendor:()=>void};
const labels:Record<VendorWorkTab,{english:string;bn:string;button?:string}>={
 ledger:{english:'Ledger',bn:'হিসাব',button:'Print Ledger'},
 taken:{english:'Taken',bn:'নেওয়া পণ্য',button:'Take Products'},
 given:{english:'Given',bn:'দেওয়া পণ্য',button:'Give Products'},
 purchases:{english:'Purchases',bn:'ক্রয়'},
 payments:{english:'Payments',bn:'পেমেন্ট'}
};
const money=(v:number)=>taka(v/100);
export function VendorTabs({party,snapshot,purchases,tab,onTabChange,sourceId,onDirtyChange,onEditVendor}:Props){
 const base=useId().replace(/:/g,'');
 const [range,setRange]=useState<IsoRange>({from:'',to:''});
 const [query,setQuery]=useState('');
 const [side,setSide]=useState<VendorSide>('payable');
 const [editingTaken,setEditingTaken]=useState(false);
 const [hasUnsavedGoods,setHasUnsavedGoods]=useState(false);
 const updateDirty=(value:boolean)=>{setHasUnsavedGoods(value);onDirtyChange(value);};
 const [editingGiven,setEditingGiven]=useState(false);
 const [purchaseOpened,setPurchaseOpened]=useState(tab==='purchases');

 const [purchaseRevision,setPurchaseRevision]=useState(0);
 useEffect(()=>{if(tab==='purchases')setPurchaseOpened(true);},[tab]);
 const [statementOpen,setStatementOpen]=useState(false);

 const [correctSource,setCorrectSource]=useState<string|null>(null);
 const [correctEvent,setCorrectEvent]=useState<string|null>(null);
 const checkedRange=Boolean(range.from)===Boolean(range.to)?range:{from:'',to:''};
 const profile=useMemo(()=>projectVendorPartyProfile(snapshot,purchases,party.id,checkedRange),
  [snapshot,purchases,party.id,range.from,range.to,purchaseRevision]);
 const activeSources=snapshot.sources.filter(s=>s.vendorPartyId===party.id&&s.status==='Active');
 const taken=activeSources.filter(s=>s.sourceKind==='sourcing');
 const given=activeSources.filter(s=>s.sourceKind==='issue');
 const unpricedMemos=profile.summary.priceNotSetCount;
 const payable=profile.summary.takenDuePaisa;
 const receivable=profile.summary.givenDuePaisa;
 const unpricedSource=taken.find(s=>sourceOutstanding(snapshot,s.id).unpricedBaseQty>0);
 const payableSource=taken.find(s=>(sourceOutstanding(snapshot,s.id).monetaryDuePaisa??0)>0);
 const receivableSource=given.find(s=>(sourceOutstanding(snapshot,s.id).monetaryDuePaisa??0)>0);
 const statement=side==='payable'?profile.takenStatement:profile.givenStatement;
 const ledgerRows=statement.rows.filter(e=>fuzzyMatch(query,[e.reference,e.description]));

 const selectTab=(next:VendorWorkTab,selectedSourceId?:string)=>{
  if(next!==tab&&hasUnsavedGoods&&!window.confirm('Unsaved products will be lost. Switch tabs?'))return;
  if(next!==tab&&hasUnsavedGoods){updateDirty(false);setEditingTaken(false);setEditingGiven(false);}
  onTabChange(next,selectedSourceId);
 };
 const primary=()=>{
  if(tab==='ledger'){setStatementOpen(true);return;}
  if(tab==='taken'){setEditingTaken(true);return;}
  if(tab==='given'){setEditingGiven(true);return;}
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
  setPurchaseRevision(n=>n+1);onDirtyChange(false);
 };
 const openGoods=(mode:'taken'|'given')=>{
  if(mode!==tab&&hasUnsavedGoods&&!window.confirm('Unsaved products will be lost. Switch tabs?'))return;
  if(mode!==tab&&hasUnsavedGoods)updateDirty(false);
  setEditingTaken(mode==='taken');
  setEditingGiven(mode==='given');
  onTabChange(mode);
 };
 return <div className="min-w-0 rounded-xl border border-border bg-card shadow-card" role="region" aria-label="Selected Vendor work">
  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
   <div className="flex min-w-0 flex-1 items-start gap-3">
    <PartyAvatar name={party.name} color={party.avatarColor} image={party.image} size={52}/>
    <div className="min-w-0">
     <h2 className="truncate text-lg font-semibold text-ink">{party.name}
      {party.nameBn&&<span className="ml-2 font-bn text-sm font-normal text-ink-500">{party.nameBn}</span>}</h2>
     <p className="mt-0.5 text-xs text-ink-500">{party.phone} · {party.area}</p>
     <span className="mt-1 inline-flex rounded-md bg-teal-50 px-1.5 py-0.5 text-[11px] font-medium text-teal-700 dark:bg-teal-900/20 dark:text-teal-200">Vendor · ভেন্ডর</span>
    </div>
   </div>
   <div className="grid shrink-0 grid-cols-2 gap-2" aria-label="Vendor balances, kept separate">
    <div className="min-w-[122px] rounded-lg bg-ink-50/70 px-3 py-2">
     <p className="text-[11px] text-ink-500">You owe · দেনা</p>
     <p className={'whitespace-nowrap text-lg font-semibold '+(payable>0?'text-danger':'text-ink')}>{money(payable)}</p>
    </div>
    <div className="min-w-[122px] rounded-lg bg-ink-50/70 px-3 py-2">
     <p className="text-[11px] text-ink-500">Vendor owes · পাওনা</p>
     <p className={'whitespace-nowrap text-lg font-semibold '+(receivable>0?'text-teal-700 dark:text-teal-300':'text-ink')}>{money(receivable)}</p>
    </div>
   </div>
  </div>
  <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2" role="group" aria-label="Vendor quick actions">
   <Button type="button" size="sm" onClick={()=>openGoods('taken')}><Plus className="size-4"/> Take products</Button>
   <Button type="button" size="sm" variant="outline" onClick={()=>openGoods('given')}>Give products</Button>
   {unpricedMemos>0&&<Button type="button" size="sm" variant="outline"
    onClick={()=>selectTab('taken',unpricedSource?.id)}>Set price · দাম ঠিক করুন</Button>}
   {payable>0&&<Button type="button" size="sm" variant="outline"
    onClick={()=>selectTab(payableSource?'taken':'ledger',payableSource?.id)}>Pay / return</Button>}
   {receivable>0&&<Button type="button" size="sm" variant="outline"
    onClick={()=>selectTab(receivableSource?'given':'ledger',receivableSource?.id)}>Receive settlement</Button>}
   <Button type="button" size="sm" variant="outline" onClick={()=>selectTab('purchases')}>New purchase</Button>
   <Button type="button" size="sm" variant="outline" onClick={()=>setStatementOpen(true)}><Printer className="size-4"/> Print statement</Button>
   <Button type="button" size="sm" variant="outline" onClick={onEditVendor}>Edit Vendor · তথ্য বদলান</Button>
  </div>
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-ink-50/30 px-3 py-2 text-xs">
   {unpricedMemos>0
    ?<p className="text-warning"><strong>Price not set ({unpricedMemos})</strong> · Unpriced goods are not counted as a money due.</p>
    :<p className="text-ink-500">{payable>0?'Pay or return taken products to settle.':'No unpriced goods.'}</p>}
   <button type="button" onClick={()=>selectTab('purchases')}
    className="text-left text-ink-600 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500">
    Purchase due · ক্রয়ের বাকি <strong className="text-ink">{money(profile.summary.purchaseDuePaisa)}</strong> · View Purchases
   </button>
  </div>
  <div className="overflow-x-auto border-b border-border scrollbar-thin">
   <div className="grid grid-cols-5 gap-0 px-1 sm:flex sm:min-w-max sm:gap-2 sm:px-3" role="tablist" aria-label="Vendor work tabs">
    {vendorWorkTabs.map((key,index)=><button type="button" key={key}
     id={base+'-'+key} role="tab" aria-selected={tab===key} aria-controls={base+'-panel'} tabIndex={tab===key?0:-1}
     className={'erp-tab min-w-0 px-1 py-3 text-xs sm:px-3 sm:text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-teal-500 '+(tab===key?'erp-tab-active border-b-2 border-teal-600 text-ink':'text-ink-500')}
     onClick={()=>selectTab(key)} onKeyDown={e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      e.preventDefault();
      const next=e.key==='Home'?0:e.key==='End'?vendorWorkTabs.length-1:
       (index+(e.key==='ArrowRight'?1:-1)+vendorWorkTabs.length)%vendorWorkTabs.length;
      selectTab(vendorWorkTabs[next]);
      e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
     }}>{labels[key].english} <span className="block sm:inline font-bn text-[10px] sm:text-[11px] text-ink-400">{labels[key].bn}</span></button>)}
   </div>
  </div>
  <section id={base+'-panel'} role="tabpanel" aria-labelledby={base+'-'+tab} className="min-w-0">
   {(tab==='ledger'||tab==='taken'||tab==='given')&&<div className="flex justify-end border-b border-border px-3 py-2">
     <Button type="button" size="sm" variant={tab==='ledger'?'outline':undefined} onClick={primary}>
      {tab==='ledger'?<Printer className="size-4"/>:<Plus className="size-4"/>}
      {labels[tab].button}
     </Button>
    </div>}
    <div className="p-3 sm:p-4">
    {tab==='ledger'&&<>
     <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="min-w-[195px]"><AppSelect label="Vendor balance side" value={side}
        onChange={value=>setSide(value as VendorSide)}
        options={[{value:'payable',label:'Taken · You owe'},{value:'receivable',label:'Given · Vendor owes'}]}/></div>
      <AppDateRangePicker value={range} onChange={setRange} label="Vendor ledger date range"/>
      {Boolean(range.from)!==Boolean(range.to)&&<span className="text-xs text-warning">Choose both dates to filter</span>}
      <Input className="w-full sm:ml-auto sm:w-56" value={query} onChange={e=>setQuery(e.target.value)}
       aria-label="Search Vendor ledger" placeholder="Search reference or note"/>
     </div>
     {(statement.rows.length>0||statement.openingPaisa!==0)&&<div className="mb-2 flex flex-wrap justify-between gap-2 bg-ink-50 px-3 py-2 text-xs text-ink-600">
      <span>Opening: {money(statement.openingPaisa)}</span>
      <span>Increased: {money(statement.periodIncreasePaisa)}</span>
      <span>Decreased: {money(statement.periodDecreasePaisa)}</span>
     </div>}
     <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-xs">
      <thead><tr className="border-b border-border bg-ink-50">
       {['Date','Details','Increase','Decrease','Running','Actions'].map(x=><th key={x} className="p-2 text-left">{x}</th>)}
      </tr></thead><tbody>
      {ledgerRows.map(e=>
       <tr key={e.id} className="border-b border-border/70"><td className="p-2 text-ink-500">{e.date}</td>
        <td className="p-2 font-medium text-ink">{e.reference??e.kind}<p className="font-normal text-ink-500">{e.description}</p></td>
        <td className="p-2 text-right">{e.deltaPaisa>0?money(e.deltaPaisa):'—'}</td>
        <td className="p-2 text-right">{e.deltaPaisa<0?money(-e.deltaPaisa):'—'}</td>
        <td className="p-2 text-right font-semibold">{money(e.runningPaisa)}</td>
        <td className="p-2 text-right"><Button size="sm" variant="ghost" onClick={()=>review(e)}>Review</Button></td>
       </tr>)}
       {ledgerRows.length===0&&<tr><td colSpan={6} className="p-6 text-center text-ink-500">No transactions in this view.</td></tr>}
      </tbody></table></div>
     {side==='payable'&&profile.takenStatement.unpricedSources.length>0&&
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-warning-bg p-3 text-xs text-warning">
       <span>{profile.takenStatement.unpricedSources.length} source(s) with <strong>Price not set</strong>. No money due is added until pricing.</span>
       <Button type="button" size="sm" variant="outline" onClick={()=>selectTab('taken')}>Open Taken · নেওয়া পণ্য</Button>
      </div>}
     {profile.activity.filter(item=>item.bucket===(side==='payable'?'vendor-payable':'vendor-receivable')
       &&item.moneyPaisa===null
       &&fuzzyMatch(query,[item.reference,item.description])).length>0&&
      <div className="mt-3 rounded-lg border border-border">
       <h4 className="border-b border-border bg-ink-50 px-3 py-2 text-xs font-semibold text-ink">
        Records without a money amount · দাম ঠিক হয়নি / সংশোধন
       </h4>
       {profile.activity.filter(item=>item.bucket===(side==='payable'?'vendor-payable':'vendor-receivable')
         &&item.moneyPaisa===null
         &&fuzzyMatch(query,[item.reference,item.description])).map(item=>
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
        onSaved={()=>{tab==='taken'?setEditingTaken(false):setEditingGiven(false);toast.success('Products saved · Preview only');}}/>
      </div>}
      <VendorSourceWorkspace key={tab+'-'+(sourceId??'')} mode={tab} sources={tab==='taken'?taken:given}
        snapshot={snapshot} sourceId={sourceId} onCorrect={setCorrectSource}/>
     </>}
     {(tab==='purchases'||purchaseOpened)&&<div className={tab==='purchases'?'space-y-4':'hidden'} aria-hidden={tab!=='purchases'}>
      <div onChangeCapture={()=>onDirtyChange(true)}>
        <PurchaseEditor key={purchaseRevision} embedded active={tab==='purchases'}
          initialSupplierId={party.id} lockedSupplierId={party.id} onCompleted={savePurchase}
          onCancel={()=>{setPurchaseRevision(n=>n+1);onDirtyChange(false);}}/>
      </div>
      <details className="overflow-hidden rounded-lg border border-border">
       <summary className="cursor-pointer bg-ink-50/40 px-3 py-2 text-sm font-semibold text-ink">
        Previous Purchases · আগের ক্রয় ({purchases.length})
       </summary>
        <div className="border-b border-border bg-ink-50/40 px-3 py-2 text-sm font-semibold text-ink">Previous purchases · আগের ক্রয়</div>
        <div className="divide-y divide-border">
          {purchases.map(p=><div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 p-3 text-xs">
            <div className="min-w-0"><strong className="text-ink">{p.ref}</strong><p className="truncate text-ink-500">{p.date} · {p.items}</p></div>
            <strong className="text-ink">{taka(p.total)}</strong>
            <span className="text-ink-500">{p.total>p.paid?'Due '+taka(p.total-p.paid):'Paid'}</span>
          </div>)}
          {!purchases.length&&<p className="p-6 text-center text-sm text-ink-500">No purchases from this Vendor yet.</p>}
        </div>
      </details>
     </div>}
     {tab==='payments'&&<>
      <VendorPaymentsWorkspace state={snapshot} sources={activeSources} sourceId={sourceId}/>
      {profile.summary.purchaseDuePaisa>0&&<p className="mt-3 rounded-md bg-ink-50 p-3 text-xs text-ink-500">
       Ordinary Purchase due {money(profile.summary.purchaseDuePaisa)} stays linked to its Purchase invoice.
      </p>}
     </>}
   </div>
  </section>

  <VendorCorrectionDialog source={snapshot.sources.find(s=>s.id===correctSource)??null}
   event={snapshot.events.find(e=>e.id===correctEvent)??null} state={snapshot}
   onClose={()=>{setCorrectEvent(null);setCorrectSource(null);}}
   onReviewEvent={review} onBackToSource={()=>setCorrectEvent(null)}/>
  <VendorStatementDialog open={statementOpen} onClose={()=>setStatementOpen(false)}
   party={party} state={snapshot} range={checkedRange}/>
   </div>;
}
