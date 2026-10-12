import {useId,useMemo,useState,useSyncExternalStore} from 'react';
import {BookOpen,FileText,MapPin,PackageMinus,Phone,Plus,Printer,Truck} from 'lucide-react';
import {Button} from '../Button';
import {Input} from '../Input';
import {FormSelect} from '../FormSelect';
import {AppDateRangePicker} from '../AppDateRangePicker';
import {AppDatePicker} from '../AppDateRangePicker';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '../Dialog';
import {PartyAvatar} from '../PartyAvatar';
import {RoleBadge} from './RoleBadge';
import {VendorStatementDialog} from './VendorStatementDialog';
import {VendorPurchaseDialog} from './VendorPurchaseDialog';
import {VendorIssueGoodsDialog} from './VendorIssueGoodsDialog';
import {VendorCorrectionDialog} from './VendorCorrectionDialog';
import {availablePurchases} from '../../data/erpDemoStore';
import {VendorActionDialog,type VendorActionMode} from './VendorActionDialog';
import {getVendorPreviewSnapshot,subscribeVendorPreview,dispatchVendorPreview} from '../../vendor/vendorPreviewStore';
import {vendorBalances,sourceOutstanding} from '../../vendor/vendorModel';
import {projectVendorActivity,ordinaryVendorPurchaseDuePaisa} from '../../vendor/vendorActivity';
import {products} from '../../data/products';
import {businessToday,type IsoRange} from '../../utils/dateRange';
import {taka} from '../../utils/currency';
import type {Party,PartyRole} from '../../types/erp';
import type {VendorLedgerEvent,VendorSource,VendorSide} from '../../vendor/vendorTypes';
type Props={party:Party;onEditParty:()=>void;onRoleChange:(role:PartyRole)=>void};
type Tab='activity'|'pending'|'sourcing'|'issued'|'purchases';
export function VendorWorkspace({party,onEditParty,onRoleChange}:Props){
 const snapshot=useSyncExternalStore(subscribeVendorPreview,getVendorPreviewSnapshot);
 const balance=vendorBalances(snapshot,party.id);
 const [tab,setTab]=useState<Tab>('activity');
 const [range,setRange]=useState<IsoRange>({from:'',to:''});
 const [query,setQuery]=useState('');
 const [statementOpen,setStatementOpen]=useState(false);
 const [purchaseOpen,setPurchaseOpen]=useState(false);
 const [issueOpen,setIssueOpen]=useState(false);
 const [purchaseRevision,setPurchaseRevision]=useState(0);
 const tabId=useId().replace(/:/g,'');
 const [detail,setDetail]=useState<VendorSource|null>(null);
 const [actionMode,setActionMode]=useState<VendorActionMode>('details');
 const [correctionSourceId,setCorrectionSourceId]=useState<string|null>(null);
 const [correctionEventId,setCorrectionEventId]=useState<string|null>(null);
 const reviewSource=(id:string)=>{setCorrectionSourceId(id);setCorrectionEventId(null);};
 const reviewEvent=(e:VendorLedgerEvent)=>{
   setCorrectionEventId(e.id);
   const link=e.sourceId??snapshot.settlements.find(s=>s.operationId===e.operationId)?.allocations[0]?.sourceId??null;
   if(link)setCorrectionSourceId(link);
 };
 const closeCorrection=()=>{setCorrectionSourceId(null);setCorrectionEventId(null);};
 const openAction=(source:VendorSource,mode:VendorActionMode)=>{setDetail(source);setActionMode(mode);};
 const [openingSide,setOpeningSide]=useState<VendorSide|null>(null);
 const [openingAmount,setOpeningAmount]=useState('');
 const [openingDate,setOpeningDate]=useState(businessToday());
 const [openingError,setOpeningError]=useState('');
 const known=useMemo(()=>snapshot.sources.filter(s=>s.vendorPartyId===party.id&&s.status==='Active'
  &&(!range.from||s.date>=range.from)&&(!range.to||s.date<=range.to)
  &&[s.reference??'',s.productId,products.find(p=>p.id===s.productId)?.name??'']
   .some(value=>value.toLowerCase().includes(query.trim().toLowerCase()))),[snapshot,party.id,range,query]);
 const pending=known.filter(s=>s.sourceKind==='sourcing'&&sourceOutstanding(snapshot,s.id).unpricedBaseQty>0);
 const sourced=known.filter(s=>s.sourceKind==='sourcing');
 const issued=known.filter(s=>s.sourceKind==='issue');
 const ordinaryPurchases=useMemo(()=>availablePurchases().filter(p=>p.supplierId===party.id),[party.id,purchaseRevision]);
 const purchasePayablePaisa=ordinaryVendorPurchaseDuePaisa(ordinaryPurchases,party.id);
 const allEvents=projectVendorActivity(snapshot,party.id,ordinaryPurchases,range).filter(e=>
  [e.reference,e.description,e.kind].some(v=>v.toLowerCase().includes(query.toLowerCase())));
 const tabs:{key:Tab;label:string;count?:number}[]=[
  {key:'activity',label:'All Activity'},
  {key:'pending',label:'Pending price',count:pending.length},
  {key:'sourcing',label:'Sourced Sales',count:sourced.length},
  {key:'issued',label:'Goods Issued',count:issued.length},
  {key:'purchases',label:'Purchases'}
 ];
 const list=tab==='pending'?pending:tab==='sourcing'?sourced:issued;
 const openBalance=(side:VendorSide)=>{
  setOpeningSide(side);setOpeningAmount('');setOpeningDate(businessToday());setOpeningError('');
 };
 const submitOpening=()=>{
  if(!openingSide)return;
  try{
   const amount=Number(openingAmount);
   if(!Number.isFinite(amount)||amount<0||!Number.isSafeInteger(Math.round(amount*100))
      ||Math.abs(Math.round(amount*100)/100-amount)>0.0000001)throw new Error('Enter a valid amount (up to two decimal places).');
   dispatchVendorPreview({type:'set-opening',vendorPartyId:party.id,side:openingSide,
    amountPaisa:Math.round(amount*100),date:openingDate,
    operationId:'vendor-open-'+party.id+'-'+openingSide+'-'+snapshot.revision});
   setOpeningSide(null);
  }catch(error){setOpeningError(error instanceof Error?error.message:'Cannot save demo opening');}
 };
 return <section aria-label="Vendor workspace" className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-card">
  <div className="flex flex-wrap items-start gap-3 border-b border-border p-4">
   <PartyAvatar name={party.name} color={party.avatarColor} image={party.image} size={48}/>
   <div className="min-w-0 flex-1">
    <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-ink">
      {party.name} {party.nameBn&&<span className="font-bn text-sm font-normal text-ink-500">{party.nameBn}</span>}
    </h2>
    <div className="mt-1 flex flex-wrap gap-2 text-xs text-ink-500">
     <span><Phone className="mr-1 inline size-3"/>{party.phone}</span>
     <span><MapPin className="mr-1 inline size-3"/>{party.area}</span>
     {party.roles.map(role=><RoleBadge key={role} role={role}/>)}
    </div>
    <div className="mt-2 flex flex-wrap items-center gap-2">
     <Button size="sm" variant="outline" onClick={onEditParty}>Edit party</Button>
     {party.roles.length>1&&<div className="min-w-36">
       <FormSelect title="Relationship" value="Vendor" options={party.roles} onChange={e=>onRoleChange(e.target.value as PartyRole)}/>
     </div>}
    </div>
   </div>
   <span className="rounded-lg border border-border bg-ink-50 px-2 py-1 text-[11px] font-medium text-ink-500">Demo preview · no real posting</span>
  </div>
  <div className="grid grid-cols-1 gap-2 border-b border-border p-3 sm:grid-cols-2 lg:grid-cols-4">
   <div className="rounded-lg border border-border bg-ink-50/50 p-3" aria-label="Known payable">
    <p className="text-xs text-ink-500">Known payable · দেনা</p>
    <p className="mt-1 text-xl font-semibold text-ink">{taka(balance.knownPayablePaisa/100)}</p>
    <p className="mt-0.5 text-[11px] text-ink-500">Priced Vendor sourcing only</p>
   </div>
   <div className="rounded-lg border border-warning/25 bg-warning-bg/30 p-3" aria-label="Price pending">
    <p className="text-xs text-ink-500">Price pending · দাম বাকি</p>
    <p className="mt-1 text-xl font-semibold text-ink">{balance.unpricedSourceBaseQty} <span className="text-sm font-normal">base units</span></p>
    <p className="mt-0.5 text-[11px] text-ink-500">{balance.unpricedSourceCount} unsettled sources · Not ৳0</p>
   </div>
   <div className="rounded-lg border border-border bg-ink-50/50 p-3" aria-label="Vendor receivable">
    <p className="text-xs text-ink-500">Vendor receivable · পাওনা</p>
    <p className="mt-1 text-xl font-semibold text-ink">{taka(balance.knownReceivablePaisa/100)}</p>
    <p className="mt-0.5 text-[11px] text-ink-500">Goods issued to Vendor</p>
   </div>
   <div className="rounded-lg border border-border bg-ink-50/50 p-3" aria-label="Purchase payable">
    <p className="text-xs text-ink-500">Purchase payable · ক্রয়ের বাকি</p>
    <p className="mt-1 text-xl font-semibold text-ink">{taka(purchasePayablePaisa/100)}</p>
    <p className="mt-0.5 text-[11px] text-ink-500">Normal Purchases · separate supplier balance</p>
   </div>
  </div>
  <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
   <Button size="sm" onClick={()=>setTab('pending')}>Set price & settle · সন্ধ্যার হিসাব</Button>
   <Button size="sm" variant="outline" onClick={()=>setTab('sourcing')}>Pay Vendor</Button>
   <Button size="sm" variant="outline" onClick={()=>setTab('sourcing')}>Return goods</Button>
   <Button size="sm" variant="outline" onClick={()=>setIssueOpen(true)}><PackageMinus className="size-4"/> Give products</Button>
   <Button size="sm" variant="outline" onClick={()=>setTab('issued')}>Receive money</Button>
   <Button size="sm" variant="outline" onClick={()=>setTab('issued')}>Receive products</Button>
   <Button size="sm" variant="outline" onClick={()=>setPurchaseOpen(true)}><Plus className="size-4"/> Buy products</Button>
   <Button size="sm" variant="outline" onClick={()=>setStatementOpen(true)}><Printer className="size-4"/> Vendor statement</Button>
  </div>
  <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
   <Button size="sm" variant="ghost" onClick={()=>openBalance('payable')}><BookOpen className="size-3.5"/> Payable opening</Button>
   <Button size="sm" variant="ghost" onClick={()=>openBalance('receivable')}><BookOpen className="size-3.5"/> Receivable opening</Button>
   <span className="text-[11px] text-ink-500">Opening amounts are non-cash, preview-only.</span>
  </div>
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
   <div className="flex flex-wrap gap-1" role="tablist" aria-label="Vendor workspace tabs">
    {tabs.map((t,i)=><button type="button" key={t.key} role="tab"
      id={tabId+'-'+t.key} aria-controls={tabId+'-panel'} aria-selected={tab===t.key}
      tabIndex={tab===t.key?0:-1}
      onClick={()=>setTab(t.key)}
      onKeyDown={e=>{
       if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
       e.preventDefault();
       const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:
        (i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
       setTab(tabs[next].key);
       const target=e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next];
       target?.focus();
      }}
      className={'rounded-md px-2.5 py-1.5 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-teal-500 '+(tab===t.key?'bg-ink-100 text-ink':'text-ink-500 hover:bg-ink-50')}>
      {t.label}{t.count!==undefined?' ('+t.count+')':''}</button>)}
   </div>
   <div className="flex flex-wrap items-center gap-2">
    <Input aria-label="Search Vendor activity" value={query} onChange={e=>setQuery(e.target.value)}
     placeholder="Search source…" className="h-9 w-44"/>
    <AppDateRangePicker value={range} onChange={setRange} label="Vendor activity date range"/>
   </div>
  </div>
  <div role="tabpanel" id={tabId+'-panel'} aria-labelledby={tabId+'-'+tab}>
  {tab==='purchases'?<div className="p-3">
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-xs text-ink-500">Ordinary purchases · own inventory, not Vendor-sourced sales</p>
      <Button size="sm" onClick={()=>setPurchaseOpen(true)}><Plus className="size-4"/> Buy products</Button>
    </div>
    {ordinaryPurchases.length?<div className="divide-y divide-border rounded-lg border border-border">
      {ordinaryPurchases.map(p=><div key={p.id} className="flex flex-wrap items-center gap-3 p-3 text-xs">
        <FileText className="size-4 shrink-0 text-ink-400"/>
        <div className="min-w-0 flex-1"><strong className="text-ink">{p.ref}</strong>
          <p className="text-ink-500">{p.date} · {p.items}</p></div>
        <span className="font-semibold text-ink">{taka(p.total)}</span>
        <span className="text-ink-500">{p.paid>=p.total?'Paid':'Due '+taka(p.total-p.paid)}</span>
      </div>)}
    </div>:<p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-ink-500">
      No ordinary purchases recorded for this Vendor.
    </p>}
  </div>:tab==='activity'?<div className="overflow-x-auto">
    <table className="w-full min-w-[570px] text-xs"><thead><tr className="border-b border-border bg-ink-50">
     <th className="p-2 text-left">Date</th><th className="p-2 text-left">Type & source</th>
     <th className="p-2 text-left">Account</th><th className="p-2 text-right">Increases</th>
     <th className="p-2 text-right">Decreases</th><th className="p-2 text-right">Actions</th>
    </tr></thead><tbody>{allEvents.map(e=><tr key={e.id} className="border-b border-border/70">
     <td className="p-2 text-ink-500">{e.date}</td><td className="p-2">{e.reference}
      <p className="text-ink-500">{e.description}
        {e.reversed&&<span className="ml-1 font-medium text-warning">(reversed · historical)</span>}
      </p>
     </td>
     <td className="p-2"><span className={'inline-flex rounded px-2 py-0.5 text-[11px] '+(e.bucket==='vendor-payable'?'bg-warning-bg text-warning':'bg-ink-50 text-ink-600')}>
        {e.bucket==='vendor-payable'?'Vendor sourcing payable':
         e.bucket==='vendor-receivable'?'Vendor receivable':'Supplier purchase'}</span></td>
     <td className="p-2 text-right text-ink">{e.moneyPaisa!==null&&e.moneyPaisa>0?taka(e.moneyPaisa/100):'—'}</td>
     <td className="p-2 text-right text-ink">{e.moneyPaisa!==null&&e.moneyPaisa<0?taka(-e.moneyPaisa/100):'—'}</td>
     <td className="p-2 text-right">
       {e.sourceEventId&&e.kind!=='reversal'&&<Button type="button" size="sm" variant="ghost"
        aria-label={'Review Vendor event '+e.reference}
        onClick={()=>{const original=snapshot.events.find(entry=>entry.id===e.sourceEventId);if(original)reviewEvent(original);}}>
        Review</Button>}
     </td>
    </tr>)}
    {!allEvents.length&&<tr><td colSpan={6} className="p-8 text-center text-ink-500">No Vendor or purchase activity matches these filters.</td></tr>}
    </tbody></table>
    {pending.length>0&&<p className="px-3 py-2 text-xs text-ink-500">Also {pending.length} unpriced source(s) — see Pending price.</p>}
   </div>:<div className="divide-y divide-border">
    {list.map(source=><div key={source.id} className="flex flex-wrap items-center gap-3 px-3 py-3 text-xs">
     <div className="flex size-8 items-center justify-center rounded-lg bg-ink-50">
      {source.sourceKind==='issue'?<PackageMinus className="size-4"/>:<Truck className="size-4"/>}
     </div>
     <div className="min-w-0 flex-1">
      <p className="font-semibold text-ink">{source.reference??source.id}
       <span className="ml-2 font-normal text-ink-500">{source.date}</span></p>
      <p className="text-ink-500">{products.find(p=>p.id===source.productId)?.name??source.productId}
       {' · '+source.baseQty+' '+(products.find(p=>p.id===source.productId)?.unit??'base units')}</p>
     </div>
     <div className="font-medium text-ink">{source.unitCostBasePaisa===null?'Price pending · দাম পরে নির্ধারণ':taka((source.sourceAmountPaisa??0)/100)}</div>
     <div className="flex flex-wrap gap-1">
      {source.sourceKind==='sourcing'&&source.unitCostBasePaisa===null&&
       <Button size="sm" variant="outline" aria-label={'Set price '+(source.reference??source.id)}
        onClick={()=>openAction(source,'quote')}>Set price</Button>}
      {source.sourceKind==='sourcing'&&source.unitCostBasePaisa!==null&&
        (sourceOutstanding(snapshot,source.id).monetaryDuePaisa??0)>0&&
       <Button size="sm" variant="outline" aria-label={'Pay '+(source.reference??source.id)}
        onClick={()=>openAction(source,'pay')}>Pay</Button>}
      {source.sourceKind==='sourcing'&&sourceOutstanding(snapshot,source.id).returnedBaseQty<source.baseQty&&
       (sourceOutstanding(snapshot,source.id).monetaryDuePaisa===null||
        (sourceOutstanding(snapshot,source.id).monetaryDuePaisa??0)>0)&&
       <Button size="sm" variant="outline" aria-label={'Return goods '+(source.reference??source.id)}
        onClick={()=>openAction(source,'return')}>Return goods</Button>}
      {source.sourceKind==='issue'&&(sourceOutstanding(snapshot,source.id).monetaryDuePaisa??0)>0&&<>
       <Button size="sm" variant="outline" aria-label={'Receive money '+(source.reference??source.id)}
        onClick={()=>openAction(source,'receive-money')}>Receive money</Button>
       <Button size="sm" variant="outline" aria-label={'Receive goods '+(source.reference??source.id)}
        onClick={()=>openAction(source,'receive-goods')}>Receive goods</Button>
      </>}
      <Button size="sm" variant="ghost" aria-label={'Correct vendor source '+(source.reference??source.id)}
       onClick={()=>reviewSource(source.id)}>Correct</Button>
      <Button size="sm" variant="outline" aria-label={'View vendor source '+(source.reference??source.id)}
       onClick={()=>openAction(source,'details')}>View source</Button>
     </div>
    </div>)}
    {!list.length&&<div className="p-8 text-center text-sm text-ink-500">No Vendor records match these filters.</div>}
   </div>}
  </div>
  <VendorIssueGoodsDialog open={issueOpen} vendorPartyId={party.id} vendorName={party.name}
    onClose={()=>{setIssueOpen(false);setTab('issued');}}/>
  <VendorPurchaseDialog open={purchaseOpen} vendorPartyId={party.id} vendorName={party.name}
    onClose={()=>setPurchaseOpen(false)} onSaved={()=>{setPurchaseOpen(false);setPurchaseRevision(v=>v+1);setTab('purchases');}}/>
  <VendorCorrectionDialog
    source={snapshot.sources.find(item=>item.id===correctionSourceId)??null}
    event={snapshot.events.find(item=>item.id===correctionEventId)??null}
    state={snapshot} onClose={closeCorrection}
    onReviewEvent={reviewEvent} onBackToSource={()=>setCorrectionEventId(null)}/>
  <VendorStatementDialog open={statementOpen} onClose={()=>setStatementOpen(false)} party={party} state={snapshot} range={range}/>
  <VendorActionDialog source={detail?snapshot.sources.find(s=>s.id===detail.id)??null:null} mode={actionMode} onClose={()=>setDetail(null)}/>
  <Dialog open={!!openingSide} onOpenChange={v=>!v&&setOpeningSide(null)}>
   <DialogContent role="dialog" aria-label="Vendor opening balance" className="sm:max-w-md">
    <DialogHeader><DialogTitle>{openingSide==='payable'?'Vendor payable opening':'Vendor receivable opening'}</DialogTitle>
     <DialogDescription>Non-cash historical balance · Demo preview only. Payable and receivable are separate.</DialogDescription>
    </DialogHeader>
    <label className="space-y-1 text-xs text-ink-500">Amount (৳)
     <Input aria-label="Vendor opening amount" value={openingAmount} onChange={e=>setOpeningAmount(e.target.value)} inputMode="decimal"/>
    </label>
    <div className="space-y-1 text-xs text-ink-500">Opening date
     <AppDatePicker label="Vendor opening date" value={openingDate} onChange={setOpeningDate}/>
    </div>
    {!!openingError&&<p role="alert" className="text-xs text-danger">{openingError}</p>}
    <div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={()=>setOpeningSide(null)}>Cancel</Button>
     <Button size="sm" onClick={submitOpening}>Save demo opening</Button></div>
   </DialogContent>
  </Dialog>
 </section>;
}
