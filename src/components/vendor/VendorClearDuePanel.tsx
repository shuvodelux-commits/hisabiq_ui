import React,{useState} from 'react';
import {FinancePaymentSplitEditor,type FinancePaymentDraft} from '../finance/FinancePaymentSplitEditor';
import {vendorPaymentSplits} from '../../vendor/vendorPaymentAdapter';
import {toast} from 'sonner';
import {Button} from '../Button';
import {Input} from '../Input';
import {financeAccounts} from '../../data/financeAccounts';
import {businessToday} from '../../utils/dateRange';
import {taka} from '../../utils/currency';
import {getVendorPreviewSnapshot,dispatchVendorPreview} from '../../vendor/vendorPreviewStore';
import {sourceOutstanding} from '../../vendor/vendorModel';
import {products} from '../../data/products';
import type {VendorSource} from '../../vendor/vendorTypes';

type Props={source:VendorSource;onClose:()=>void;onSaved?:()=>void};
const accounts=financeAccounts.filter(a=>a.status==='Active'&&['Cash','Petty Cash','Bank','Mobile Banking'].includes(a.type));
export function VendorClearDuePanel({source,onClose,onSaved}:Props){
 const [splits,setSplits]=useState<FinancePaymentDraft[]>([{id:'s1',method:'Cash',accountId:accounts[0]?.id??'',amount:''}]);
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
   const filled=splits.filter(row=>row.amount.trim());
   if(filled.length>0&&filled.length!==splits.length)throw new Error('Complete or remove empty payment splits.');
   const cashPaisa=filled.reduce((sum,row)=>sum+Math.round(Number(row.amount)*100),0);
   const paymentSplits=filled.length?vendorPaymentSplits(filled,accounts,cashPaisa):[];
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
  <div className="space-y-3">
   <div className="min-w-0">
    <p className="mb-2 text-xs font-semibold text-ink">Make Payment · টাকা দিন</p>
    <FinancePaymentSplitEditor accounts={accounts} rows={splits} onChange={setSplits}
     totalAmount={cash} amountAriaLabel={index=>'Money from account '+(index+1)}/>
   </div>
   <label className="block text-xs text-ink-500">Return Products · পণ্য ফেরত দিন
    <Input className="mt-1 h-9 w-full" aria-label="Products to return"
     inputMode="decimal" value={returnQty} onChange={e=>setReturnQty(e.target.value)} placeholder="0"/>
    <span className="mt-1 block text-[11px] text-ink-500">Quantity in {product?.unit??'units'} · Must be the same product</span>
   </label>
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
