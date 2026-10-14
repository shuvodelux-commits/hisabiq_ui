import React,{useEffect,useMemo,useRef,useState} from 'react';
import {ArrowLeft,CheckCircle2,ChevronRight,Search} from 'lucide-react';
import {Button} from '../Button';
import {StatusBadge} from '../StatusBadge';
import {Input} from '../Input';
import {AppSelect} from '../AppSelect';
import {VendorActionDialog} from '../parties/VendorActionDialog';
import {VendorClearDuePanel} from './VendorClearDuePanel';
import {dispatchVendorPreview,getVendorPreviewSnapshot} from '../../vendor/vendorPreviewStore';
import {sourceOutstanding} from '../../vendor/vendorModel';
import {products} from '../../data/products';
import {businessToday} from '../../utils/dateRange';
import {taka} from '../../utils/currency';
import type {VendorSource,VendorPreviewState} from '../../vendor/vendorTypes';

type Props={
  mode:'taken'|'given';sources:VendorSource[];snapshot:VendorPreviewState;
  sourceId:string|null;onCorrect:(sourceId:string)=>void;
};
const money=(paisa:number)=>taka(paisa/100);
const memoKey=(source:VendorSource)=>source.memoId||source.sourceInvoiceId||source.reference||source.id;
const productName=(s:VendorSource)=>products.find(p=>p.id===s.productId)?.name??s.productId;
const outstanding=(state:VendorPreviewState,s:VendorSource)=>sourceOutstanding(state,s.id);
const requiresAction=(state:VendorPreviewState,s:VendorSource)=>{
  const due=outstanding(state,s);
  return due.unpricedBaseQty>0||(due.monetaryDuePaisa??0)>0;
};

/** Price is optional when goods are taken. Convert the agreed price to the product base unit. */
function VendorPriceForm({source}: {source:VendorSource}){
  const product=products.find(p=>p.id===source.productId);
  const [unit,setUnit]=useState(product?.altUnit?.unit??product?.unit??'');
  const [price,setPrice]=useState('');
  const [error,setError]=useState('');
  const factor=product?.altUnit?.unit===unit?product.altUnit.factor:1;
  const remaining=outstanding(getVendorPreviewSnapshot(),source).unpricedBaseQty;
  const submit=(event:React.FormEvent)=>{
    event.preventDefault();setError('');
    try{
      const amount=Number(price);
      if(!price.trim()||!Number.isFinite(amount)||amount<=0)throw new Error('Enter the agreed unit cost.');
      const basePaisa=Math.round(amount*100/factor);
      if(!Number.isSafeInteger(basePaisa)||basePaisa<=0)throw new Error('Cost is too small for the selected unit.');
      const state=getVendorPreviewSnapshot();
      dispatchVendorPreview({
        type:'set-source-price',operationId:'vendor-price-'+source.id+'-'+state.revision,
        vendorPartyId:source.vendorPartyId,sourceId:source.id,date:businessToday(),
        unitCostBasePaisa:basePaisa,reason:'Agreed price confirmed in Vendor workplace'
      });
      
    }catch(e){setError(e instanceof Error?e.message:'Could not set Vendor cost.');}
  };
  return <form aria-label="Set Vendor price" onSubmit={submit}
    className="space-y-3 rounded-lg border border-warning/30 bg-warning-bg/30 p-3">
    <div>
      <h4 className="text-sm font-semibold text-ink">Set Price · দাম ঠিক করুন</h4>
      <p className="mt-1 text-xs text-ink-500">You already took these products. Enter the cost when the Vendor confirms it. Unpriced goods do not create a money due.</p>
    </div>
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-end gap-2">
      <div>
        <span className="mb-1 block text-xs font-medium text-ink-600">Price in · কোন এককে</span>
        <AppSelect label="Vendor price unit" value={unit}
          onChange={setUnit} options={[product?.unit??'',...(product?.altUnit?[product.altUnit.unit]:[])].filter(Boolean)}/>
      </div>
      <label className="text-xs font-medium text-ink-600">Cost per {unit} · মূল্য
        <Input className="mt-1" inputMode="decimal" aria-label={'Agreed cost per '+unit}
          value={price} onChange={e=>setPrice(e.target.value)} placeholder="৳0.00"/>
      </label>
    </div>
    <p className="text-xs text-ink-500">Unreturned: {remaining} {product?.unit??'units'}
      {price.trim()&&Number(price)>0?' · Estimated due: '+money(Math.round(remaining*Number(price)*100/factor)):''}</p>
    {error&&<p role="alert" className="text-xs text-danger">{error}</p>}
    <Button type="submit" size="sm">Confirm Vendor Price</Button>
  </form>;
}

export function VendorSourceWorkspace({mode,sources,snapshot,sourceId,onCorrect}:Props){
  const [search,setSearch]=useState('');
  const [needsActionOnly,setNeedsActionOnly]=useState(false);
  const [selectedId,setSelectedId]=useState<string|null>(sourceId);
  const [showMemos,setShowMemos]=useState(false);
  const detailRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(sourceId){setSelectedId(sourceId);setShowMemos(false);}},[sourceId]);
  const chooseSource=(id:string)=>{setSelectedId(id);setShowMemos(false);requestAnimationFrame(()=>detailRef.current?.focus());};
  const [givenAction,setGivenAction]=useState<'receive-money'|'receive-goods'>('receive-money');
  const groups=useMemo(()=>{
    const map=new Map<string,VendorSource[]>();
    sources.forEach(s=>{
      const key=memoKey(s);
      map.set(key,[...(map.get(key)??[]),s]);
    });
    return Array.from(map.entries()).map(([key,lines])=>({
      key,lines,needsAction:lines.some(s=>requiresAction(snapshot,s)),
      unpriced:lines.some(s=>outstanding(snapshot,s).unpricedBaseQty>0),
      duePaisa:lines.reduce((sum,s)=>sum+(outstanding(snapshot,s).monetaryDuePaisa??0),0),
      date:lines[0].date
    })).sort((a,b)=>Number(b.needsAction)-Number(a.needsAction)||b.date.localeCompare(a.date));
  },[sources,snapshot]);
  const shown=groups.filter(g=>(!needsActionOnly||g.needsAction)&&
    (!search.trim()||g.key.toLowerCase().includes(search.trim().toLowerCase())||
      g.lines.some(s=>productName(s).toLowerCase().includes(search.trim().toLowerCase()))));
  const selected=sources.find(s=>s.id===selectedId)??groups.find(g=>g.needsAction)?.lines.find(s=>requiresAction(snapshot,s))
    ??groups[0]?.lines[0]??null;
  const currentGroup=selected?groups.find(g=>g.lines.some(s=>s.id===selected.id)):null;
  const pending=selected?outstanding(snapshot,selected):null;
  const canSettle=Boolean(pending&&(pending.unpricedBaseQty>0||(pending.monetaryDuePaisa??0)>0));
  const product=selected?products.find(p=>p.id===selected.productId):undefined;
  return <section role="region" aria-label={mode==='taken'?'Taken product workplace':'Given product workplace'}
    className="grid min-w-0 gap-3 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.15fr)] lg:items-start">
    <Button type="button" variant="outline" className="min-h-11 w-full lg:hidden" onClick={()=>setShowMemos(!showMemos)} aria-expanded={showMemos}>
      <ArrowLeft className="size-4"/>{showMemos?'Back to selected memo · মেমোতে ফিরুন':`Choose another memo · মেমো বাছুন (${groups.length})`}
    </Button>
    <div className={(showMemos?'block':'hidden')+' min-w-0 overflow-hidden rounded-lg border border-border bg-card lg:block'}>
      <div className="border-b border-border p-3">
        <h4 className="text-sm font-semibold text-ink">
          {mode==='taken'?'Taken Memos · নেওয়া মেমো':'Given Memos · দেওয়া মেমো'}
          <span className="ml-2 text-xs font-normal text-ink-500">({groups.length})</span>
        </h4>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[160px] flex-1">
            <Search className="pointer-events-none absolute z-10 left-2.5 top-2.5 size-4 text-ink-400"/>
            <Input aria-label="Search Vendor source invoices" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Invoice, memo or product" className="pl-8"/>
          </div>
          <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-ink-600">
            <input type="checkbox" checked={needsActionOnly} onChange={e=>setNeedsActionOnly(e.target.checked)}
              className="accent-teal-600"/> Pending only
          </label>
        </div>
      </div>
      <div className="max-h-[650px] divide-y divide-border overflow-y-auto">
        {shown.map(g=>{
          const active=g.lines.some(s=>s.id===selected?.id);
          return <button type="button" key={g.key}
            onClick={()=>chooseSource(g.lines.find(s=>requiresAction(snapshot,s))?.id??g.lines[0].id)}
            aria-pressed={active}
            className={'flex w-full items-center gap-2 px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-teal-500 '+(active?'bg-teal-50/60 dark:bg-teal-900/20':'hover:bg-ink-50')}>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink">
                <span className="truncate">{g.key}</span>
                {g.unpriced?<StatusBadge tone="warning">Price Pending</StatusBadge>:
                  g.needsAction?<StatusBadge tone="danger">Due</StatusBadge>:
                  <StatusBadge tone="success">Settled</StatusBadge>}
              </span>
              <span className="mt-1 block text-xs text-ink-500">{g.date} · {g.lines.map(s=>productName(s)).join(', ')}</span>
              <span className="mt-1 block text-[11px] text-ink-500">{g.lines.length} {g.lines.length===1?'product':'products'}</span>
            </span>
            <span className="shrink-0 text-right text-xs font-semibold text-ink">
              {g.unpriced&&!g.duePaisa?'—':money(g.duePaisa)}
              {g.unpriced&&g.duePaisa>0&&<span className="block text-[11px] font-normal text-warning">+ Price Pending</span>}
            </span>
            <ChevronRight className="size-4 shrink-0 text-ink-400"/>
          </button>;
        })}
        {!shown.length&&<p className="px-3 py-9 text-center text-sm text-ink-500">
          {sources.length?'No matching memos. Clear the search or filter.':'No vendor goods recorded yet.'}
        </p>}
      </div>
    </div>
    <div ref={detailRef} tabIndex={-1} aria-label="Selected Vendor memo" className={(showMemos?'hidden':'block')+' min-w-0 outline-none lg:block lg:sticky lg:top-16'}>
      {selected?<div className="min-w-0 rounded-lg border border-border bg-card p-4 shadow-card sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-ink">
              {mode==='taken'?'Settle Memo · হিসাব মেটান':'Receive Settlement · পাওনা নিন'}
            </h4>
            <p className="mt-1 truncate text-xs text-ink-500">{selected.reference??selected.id} · {selected.date}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={()=>onCorrect(selected.id)}>Correct</Button>
        </div>
        {currentGroup&&currentGroup.lines.length>1&&<div className="flex flex-wrap gap-1.5 border-b border-border py-3">
          {currentGroup.lines.map(s=><button type="button" key={s.id} aria-pressed={selected.id===s.id}
            onClick={()=>setSelectedId(s.id)}
            className={'rounded-md border px-2.5 py-1.5 text-xs '+(selected.id===s.id?'border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-200':'border-border text-ink-600 hover:bg-ink-50')}>
            {productName(s)}</button>)}
        </div>}
        <div className="my-3 grid grid-cols-2 gap-3 rounded-lg border border-border bg-ink-50/50 p-3 text-xs sm:grid-cols-3">
          <div><span className="block text-ink-500">Product · পণ্য</span><strong className="text-ink">{product?.name??selected.productId}</strong></div>
          <div><span className="block text-ink-500">Quantity · পরিমাণ</span><strong className="text-ink">{selected.baseQty} {product?.unit??'units'}</strong></div>
          <div><span className="block text-ink-500">{mode==='taken'?'You Owe · দেনা':'Vendor Owes · পাওনা'}</span><strong className="text-ink">{pending?.monetaryDuePaisa===null?'Price not set':money(pending?.monetaryDuePaisa??0)}</strong></div>
        </div>
        {mode==='taken'? <div className="space-y-3">
          {pending&&pending.unpricedBaseQty>0&&<VendorPriceForm key={selected.id} source={selected}/>}
          {canSettle?<VendorClearDuePanel key={selected.id+'-'+snapshot.revision} source={selected}
            onClose={()=>undefined} hideClose/>:
            <p className="flex items-center gap-2 rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
              <CheckCircle2 className="size-4 text-teal-600"/> This memo is settled. Use Correct to review earlier changes.</p>}
        </div>:<div className="space-y-3">
          {canSettle&&selected.unitCostBasePaisa!==null?<div>
            <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Vendor receiving method">
              <Button type="button" size="sm" variant={givenAction==='receive-money'?undefined:'outline'}
                onClick={()=>setGivenAction('receive-money')}>Receive Money · টাকা নিন</Button>
              <Button type="button" size="sm" variant={givenAction==='receive-goods'?undefined:'outline'}
                onClick={()=>setGivenAction('receive-goods')}>Receive Products · পণ্য ফেরত নিন</Button>
            </div>
            <VendorActionDialog key={selected.id+givenAction+snapshot.revision} inline source={selected}
              mode={givenAction} onClose={()=>undefined}/>
          </div>:<p className="flex items-center gap-2 rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
            <CheckCircle2 className="size-4 text-teal-600"/> This Vendor memo has no remaining due.</p>}
        </div>}
      </div>:<div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-ink-500">
        Choose a memo to record its settlement.</div>}
    </div>
  </section>;
}
