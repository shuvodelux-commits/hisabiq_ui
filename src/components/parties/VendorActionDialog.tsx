import React,{useEffect,useState} from 'react';
import {Button} from '../Button';
import {Input} from '../Input';
import {FinancePaymentSplitEditor,type FinancePaymentDraft} from '../finance/FinancePaymentSplitEditor';
import {vendorPaymentSplits} from '../../vendor/vendorPaymentAdapter';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '../Dialog';
import {taka} from '../../utils/currency';
import {businessToday} from '../../utils/dateRange';
import {financeAccounts} from '../../data/financeAccounts';
import {dispatchVendorPreview,getVendorPreviewSnapshot} from '../../vendor/vendorPreviewStore';
import {sourceOutstanding} from '../../vendor/vendorModel';
import type {VendorSource,VendorSettlementKind} from '../../vendor/vendorTypes';
import {products} from '../../data/products';

export type VendorActionMode='details'|'quote'|'pay'|'return'|'receive-money'|'receive-goods';
type Props={source:VendorSource|null;mode?:VendorActionMode;onClose:()=>void;onSaved?:()=>void;embedded?:boolean};
const accounts=financeAccounts.filter(a=>a.status==='Active'&&['Cash','Bank','Mobile Banking'].includes(a.type));
const toPaisa=(value:string,label:string):number=>{
 const n=Number(value);
 if(!value.trim()||!Number.isFinite(n)||n<=0||!Number.isSafeInteger(Math.round(n*100))
   ||Math.abs(n-Math.round(n*100)/100)>0.0000001)
  throw new Error(label+' must be positive with at most two decimal places.');
 return Math.round(n*100);
};
export function VendorActionDialog({source,mode='details',onClose,onSaved,embedded=false}:Props){
 const product=products.find(p=>p.id===source?.productId);
 const [price,setPrice]=useState('');
 const [amount,setAmount]=useState('');
 const [qty,setQty]=useState('');
 const [splits,setSplits]=useState<FinancePaymentDraft[]>([{id:'primary',method:'Cash',accountId:'acc-cash',amount:''}]);
 const [error,setError]=useState('');
 useEffect(()=>{setPrice('');setAmount('');setQty('');setSplits([{id:'primary',method:'Cash',accountId:'acc-cash',amount:''}]);setError('');},
  [source?.id,mode]);
 const submit=()=>{
  if(!source)return;
  try{
   const state=getVendorPreviewSnapshot();
   const op='vendor-'+mode+'-'+source.id+'-'+state.revision;
   if(mode==='quote'){
    const unitCostBasePaisa=toPaisa(price,'Vendor unit cost');
    dispatchVendorPreview({type:'set-source-price',operationId:op,vendorPartyId:source.vendorPartyId,
     sourceId:source.id,unitCostBasePaisa,date:businessToday(),reason:'Agreed Vendor price'});
   }else if(['pay','receive-money','return','receive-goods'].includes(mode)){
    const moneyAction=mode==='pay'||mode==='receive-money';
    const count=moneyAction?undefined:Number(qty);
    if(!moneyAction&&(!Number.isFinite(count)||count!>0))
     throw new Error('Return matching quantity must be positive.');
    const pricePaisa=source.unitCostBasePaisa;
    const paidPaisa=moneyAction?toPaisa(amount,'Payment amount'):null;
    const returnPaisa=moneyAction?null:pricePaisa===null?null:Math.round(count!*pricePaisa);
    const rows=moneyAction?vendorPaymentSplits(splits,accounts,paidPaisa!):undefined;
    const kind:VendorSettlementKind=mode==='return'?'return-to-vendor':mode==='receive-goods'?'receive-goods':mode;
    dispatchVendorPreview({type:'settle-source',operationId:op,vendorPartyId:source.vendorPartyId,
     side:kind==='pay'||kind==='return-to-vendor'?'payable':'receivable',
     kind,date:businessToday(),amountPaisa:paidPaisa??returnPaisa,
     allocations:[{sourceId:source.id,amountPaisa:paidPaisa??returnPaisa,baseQty:count}],
     paymentSplits:rows,reason:moneyAction?'Demo money settlement':'Matching products handed over in demo'});
   }
   (onSaved??onClose)();
  }catch(err){setError(err instanceof Error?err.message:'Vendor action failed.');}
 };
 const isReadOnly=mode==='details';
 const title=isReadOnly?'Vendor Product Details':
  mode==='quote'?'Set Price · দাম ঠিক করুন':
  mode==='pay'?'Make Payment · টাকা দিন':mode==='return'?'Return Products':
  mode==='receive-money'?'Receive Payment':'Receive Returned Products';
 const outstanding=source?sourceOutstanding(getVendorPreviewSnapshot(),source.id):null;
 const content=<>
   <DialogHeader>
    <DialogTitle>{title}</DialogTitle>
    <DialogDescription>Demo preview — not accounting records, real cashbook or posted inventory.</DialogDescription>
   </DialogHeader>
   {source&&<div className="space-y-3 text-sm">
     <dl className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-ink-50/30 p-3 text-xs">
      <div><dt className="text-ink-500">Vendor source</dt><dd className="font-semibold text-ink">{source.reference??source.id}</dd></div>
      <div><dt className="text-ink-500">Date</dt><dd>{source.date}</dd></div>
      <div><dt className="text-ink-500">Product</dt><dd>{product?.name??source.productId}</dd></div>
      <div><dt className="text-ink-500">Source quantity</dt><dd>{source.baseQty} {product?.unit??'units'}</dd></div>
      <div><dt className="text-ink-500">Unit cost</dt><dd>{source.unitCostBasePaisa===null?'Price not set':taka(source.unitCostBasePaisa/100)}</dd></div>
      <div><dt className="text-ink-500">Known remaining</dt><dd>{outstanding?.monetaryDuePaisa===null?'Price not set':taka((outstanding?.monetaryDuePaisa??0)/100)}</dd></div>
      <div><dt className="text-ink-500">Unpriced quantity</dt><dd>{outstanding?.unpricedBaseQty??0} {product?.unit??'units'}</dd></div>
      <div><dt className="text-ink-500">Goods already returned</dt><dd>{outstanding?.returnedBaseQty??0} {product?.unit??'units'}</dd></div>
     </dl>
     {mode==='quote'&&<label className="block space-y-1 text-xs font-medium text-ink">
      Vendor cost per {product?.unit??'base unit'} · নির্ধারিত মূল্য
      <Input aria-label={'Vendor cost per '+(product?.unit??'base unit')} value={price} inputMode="decimal" onChange={e=>setPrice(e.target.value)}/>
      <span className="block text-[11px] font-normal text-ink-500">Applies only to the {outstanding?.unpricedBaseQty??0} unreturned source units.</span>
     </label>}
     {(mode==='pay'||mode==='receive-money')&&<>
      <label className="block space-y-1 text-xs font-medium text-ink">
       Amount (৳)
       <Input aria-label={mode==='pay'?'Pay amount':'Receive amount'} value={amount} inputMode="decimal" onChange={e=>{setAmount(e.target.value);if(splits.length===1)setSplits([{...splits[0],amount:e.target.value}]);}}/>
      </label>
      <FinancePaymentSplitEditor accounts={accounts} rows={splits}
       onChange={setSplits} totalAmount={Number(amount)||0}
       amountAriaLabel={index=>'Split amount '+(index+1)}/>
     </>}
     {(mode==='return'||mode==='receive-goods')&&<label className="block space-y-1 text-xs font-medium text-ink">
      Matching product quantity · ফেরত পণ্য
      <Input aria-label="Return matching quantity" value={qty} inputMode="decimal" onChange={e=>setQty(e.target.value)}/>
      <span className="block text-[11px] font-normal text-ink-500">Must match {product?.name??source.productId}. Owned stock must be available to give back.</span>
     </label>}
     {error&&<p role="alert" className="text-xs text-danger">{error}</p>}
    </div>}
   <div className="flex justify-end gap-2">
    <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
    {!isReadOnly&&<Button size="sm" onClick={submit}>
     {mode==='quote'?'Confirm price in demo':mode==='pay'?'Record demo payment':
      mode==='return'?'Record demo return':mode==='receive-money'?'Record demo receipt':'Record demo goods receipt'}
    </Button>}
   </div>

 </>;
 if(embedded)return <section data-testid="vendor-inline-source-action" aria-label="Vendor source action"
  className="space-y-3 text-sm">{content}</section>;
 return <Dialog open={!!source} onOpenChange={v=>!v&&onClose()}>
  <DialogContent role="dialog" aria-label={isReadOnly?'Vendor source details':'Vendor settlement'}
   className="max-h-[92vh] overflow-y-auto sm:max-w-md">{content}</DialogContent>
 </Dialog>;
}
