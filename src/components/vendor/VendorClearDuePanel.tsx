import React,{useRef,useState} from 'react';
import {Plus,Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '../Button';
import {Input} from '../Input';
import {AppSelect} from '../AppSelect';
import {financeAccounts} from '../../data/financeAccounts';
import {businessToday} from '../../utils/dateRange';
import {taka} from '../../utils/currency';
import {getVendorPreviewSnapshot,dispatchVendorPreview} from '../../vendor/vendorPreviewStore';
import {sourceOutstanding} from '../../vendor/vendorModel';
import {products} from '../../data/products';
import type {VendorSource} from '../../vendor/vendorTypes';

type Split={id:string;accountId:string;amount:string};
type Props={source:VendorSource;onClose:()=>void;onSaved?:()=>void};
const accounts=financeAccounts.filter(x=>x.status==='Active'&&['Cash','Bank','Mobile Banking'].includes(x.type));
const toPaisa=(s:string):number=>{
 if(!s.trim())return 0;
 const n=Number(s);const cents=Math.round(n*100);
 if(!Number.isFinite(n)||n<0||!Number.isSafeInteger(cents)||Math.abs(n-cents/100)>1e-7)
  throw new Error('Use a valid money amount with up to two decimal places.');
 return cents;
};
export function VendorClearDuePanel({source,onClose,onSaved}:Props){
 const [splits,setSplits]=useState<Split[]>([{id:'s1',accountId:accounts[0]?.id??'',amount:''}]);
 const nextId=useRef(1);
 const [returnQty,setReturnQty]=useState('');
 const [reason,setReason]=useState('');
 const [error,setError]=useState('');
 const outstanding=sourceOutstanding(getVendorPreviewSnapshot(),source.id);
 const product=products.find(p=>p.id===source.productId);
 const cash=splits.reduce((sum,row)=>sum+(Number(row.amount)||0),0);
 const goods=Number(returnQty)||0;
 const goodsValue=source.unitCostBasePaisa===null?0:goods*source.unitCostBasePaisa/100;
 const due=outstanding.monetaryDuePaisa===null?null:outstanding.monetaryDuePaisa/100;
 const save=(event:React.FormEvent)=>{
  event.preventDefault();setError('');
  try{
   if(!Number.isFinite(goods)||goods<0)throw new Error('Enter a valid return quantity.');
   const paymentSplits=splits.filter(s=>s.amount.trim()).map(s=>{
    const a=accounts.find(x=>x.id===s.accountId);
    if(!a)throw new Error('Choose the account the money came from.');
    return {id:s.id,accountId:a.id,method:a.type as 'Cash'|'Bank'|'Mobile Banking',
     amountPaisa:toPaisa(s.amount)};
   });
   const cashPaisa=paymentSplits.reduce((sum,x)=>sum+x.amountPaisa,0);
   const state=getVendorPreviewSnapshot();
   dispatchVendorPreview({type:'clear-source-due',operationId:'vendor-clear-'+source.id+'-'+state.revision,
    vendorPartyId:source.vendorPartyId,sourceId:source.id,date:businessToday(),
    cashPaisa,returnBaseQty:goods,paymentSplits,reason:reason.trim()||undefined});
   toast.success('Due updated in preview · no real money or stock posted');
   (onSaved??onClose)();
  }catch(e){setError(e instanceof Error?e.message:'Could not clear the due.');}
 };
 return <form onSubmit={save} aria-label="Record Vendor Settlement" className="space-y-4">
  <div className="flex flex-wrap justify-between gap-2"><div>
   <h4 className="font-semibold text-ink">Record Settlement · বাকি মেটান</h4>
   <p className="text-xs text-ink-500">{source.reference??source.id} · {product?.name??source.productId}</p>
  </div><Button size="sm" variant="outline" type="button" onClick={onClose}>Close</Button></div>
  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
   <div className="flex min-h-16 flex-col justify-between rounded-lg bg-ink-50 p-3">
    <p className="text-ink-500">Amount Due</p><strong className="text-sm">{due===null?'Price not set':taka(due)}</strong></div>
   <div className="flex min-h-16 flex-col justify-between rounded-lg bg-ink-50 p-3">
    <p className="text-ink-500">Products Outstanding</p><strong className="text-sm">{source.baseQty-outstanding.returnedBaseQty} {product?.unit??'units'}</strong></div>
   <div className="col-span-2 flex min-h-16 flex-col justify-between rounded-lg bg-ink-50 p-3 sm:col-span-1">
    <p className="text-ink-500">Balance After Settlement</p><strong className="text-sm">{due===null?'Price not set':taka(Math.max(0,due-cash-goodsValue))}</strong></div>
  </div>
  <div className="grid items-start gap-4 lg:grid-cols-2">
   <section className="min-w-0">
    <div className="mb-2 flex min-h-8 items-center justify-between gap-2">
     <strong className="text-xs text-ink">Make Payment · টাকা দিন</strong>
     <Button type="button" size="sm" variant="ghost" onClick={()=>setSplits(rows=>[...rows,{id:'s'+(++nextId.current),accountId:accounts[0]?.id??'',amount:''}])}><Plus className="size-3"/> Account</Button>
    </div>
    <div className="space-y-2">
     {splits.map((row,i)=><div key={row.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_100px_auto] items-center gap-2">
      <AppSelect label={'Payment account '+(i+1)} value={row.accountId}
       options={accounts.map(a=>({value:a.id,label:a.name}))}
       onChange={value=>setSplits(rows=>rows.map(s=>s.id===row.id?{...s,accountId:value}:s))}/>
      <Input aria-label={'Money from account '+(i+1)} className="h-9 min-w-0 text-right" inputMode="decimal"
       value={row.amount} placeholder="৳0"
       onChange={e=>setSplits(rows=>rows.map(s=>s.id===row.id?{...s,amount:e.target.value}:s))}/>
      {splits.length>1?
       <Button type="button" size="sm" variant="ghost" aria-label={'Remove payment account '+(i+1)}
        onClick={()=>setSplits(rows=>rows.filter(s=>s.id!==row.id))}><Trash2 className="size-3"/></Button>:
       <span className="w-0" aria-hidden="true"/>}
     </div>)}
    </div>
   </section>
   <section className="min-w-0">
    <div className="mb-2 flex min-h-8 items-center">
     <strong className="text-xs text-ink">Return Products · পণ্য ফেরত দিন</strong>
    </div>
    <label className="block text-xs text-ink-500">Quantity in {product?.unit??'units'}
     <Input className="mt-1 h-9 w-full" aria-label="Products to return" inputMode="decimal" value={returnQty}
      onChange={e=>setReturnQty(e.target.value)} placeholder="0"/></label>
    <p className="mt-2 text-[11px] text-ink-500">Must be the same product. Return stock is checked before saving.</p>
   </section>
  </div>
  <label className="block text-xs text-ink-500">Note · optional
   <Input className="mt-1" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Why was this due cleared?"/></label>
  {source.unitCostBasePaisa===null&&<p className="text-xs text-warning">Price not set. You can return products now; set the price before paying money.</p>}
  {error&&<p role="alert" className="rounded-lg bg-danger-bg p-2 text-xs text-danger">{error}</p>}
  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
   <span className="text-xs text-ink-500">Money: {taka(cash)} · Products: {goods} · Demo only</span>
   <Button size="sm" type="submit">Save Settlement</Button>
  </div>
 </form>;
}
