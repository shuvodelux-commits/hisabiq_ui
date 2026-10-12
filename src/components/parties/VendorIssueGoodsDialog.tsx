import React,{useMemo,useState} from 'react';
import {Plus,Trash2} from 'lucide-react';
import {Button} from '../Button';
import {Input} from '../Input';
import {AppSelect} from '../AppSelect';
import {AppDatePicker} from '../AppDateRangePicker';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from '../Dialog';
import {CompoundQuantityInput} from '../transactions/CompoundQuantityInput';
import {availableProducts} from '../../data/erpDemoStore';
import {businessToday} from '../../utils/dateRange';
import {compoundBaseQuantity} from '../../utils/posQuantity';
import {taka} from '../../utils/currency';
import {dispatchVendorPreview,getVendorPreviewSnapshot} from '../../vendor/vendorPreviewStore';
import type {Product} from '../../types/erp';

type Line={key:string;productId:string;unit:string;qty:string;smallQty:string;cost:string};
type Props={open:boolean;vendorPartyId:string;vendorName:string;onClose:()=>void};
const empty=(key:string):Line=>({key,productId:'',unit:'',qty:'1',smallQty:'',cost:''});
export function VendorIssueGoodsDialog({open,vendorPartyId,vendorName,onClose}:Props){
 const [lines,setLines]=useState<Line[]>([empty('item-1')]);
 const [date,setDate]=useState(businessToday());
 const [memo,setMemo]=useState('');
 const [error,setError]=useState('');
 const [counter,setCounter]=useState(2);
 const catalog=useMemo(()=>availableProducts().filter(p=>p.kind!=='Service'),[open]);
 const products=new Map(catalog.map(p=>[p.id,p] as const));
 const update=(key:string,patch:Partial<Line>)=>{setLines(prev=>prev.map(l=>l.key===key?{...l,...patch}:l));setError('');};
 const reset=()=>{setLines([empty('item-1')]);setDate(businessToday());setMemo('');setError('');setCounter(2);};
 const close=()=>{reset();onClose();};
 const total=lines.reduce((sum,line)=>{
  const p=products.get(line.productId);
  if(!p)return sum;
  const factor=p.altUnit&&line.unit===p.altUnit.unit?p.altUnit.factor:1;
  const base=compoundBaseQuantity(line.qty,line.smallQty,factor);
  return sum+base*(Number(line.cost)||0)/factor;
 },0);
 const submit=(event:React.FormEvent)=>{
  event.preventDefault();
  try{
   if(!lines.length)throw new Error('Add at least one product.');
   const state=getVendorPreviewSnapshot();
   const operationId='vendor-issued-memo:'+vendorPartyId+':'+state.revision;
   const reference=memo.trim()||'V-ISS-'+String(state.revision+1).padStart(4,'0');
   const sources=lines.map((line,i)=>{
    const p:Product|undefined=products.get(line.productId);
    if(!p)throw new Error('Choose a product on every row.');
    const factor=p.altUnit&&line.unit===p.altUnit.unit?p.altUnit.factor:1;
    const baseQty=compoundBaseQuantity(line.qty,line.smallQty,factor);
    const costNumber=Number(line.cost);
    if(!Number.isFinite(baseQty)||baseQty<=0)throw new Error(p.name+': quantity must be positive.');
    if(!line.cost.trim()||!Number.isFinite(costNumber)||costNumber<=0)
     throw new Error(p.name+': enter an agreed unit value.');
    const unitCostBasePaisa=Math.round(costNumber*100/factor);
    if(unitCostBasePaisa<=0||!Number.isSafeInteger(unitCostBasePaisa))
     throw new Error(p.name+': unit price is too small for this conversion.');
    return {id:operationId+':'+i,productId:p.id,baseQty,unitCostBasePaisa,date};
   });
   dispatchVendorPreview({type:'issue-goods-memo',vendorPartyId,operationId,memoId:operationId,
    date,reference,sources});
   close();
  }catch(e){setError(e instanceof Error?e.message:'Cannot record demo goods issue');}
 };
 return <Dialog open={open} onOpenChange={v=>!v&&close()}>
  <DialogContent role="dialog" aria-modal="true" aria-label="Give products to Vendor"
   className="max-h-[94vh] w-[min(96vw,800px)] max-w-[800px] overflow-y-auto">
   <DialogHeader>
    <DialogTitle>Give products · {vendorName} <span className="font-bn text-sm font-normal text-ink-500">· পণ্য প্রদান</span></DialogTitle>
    <DialogDescription>One multi-product Vendor memo, creating receivable only. Stock movement is a demo preview.</DialogDescription>
   </DialogHeader>
   <form onSubmit={submit} className="space-y-3">
    <div className="flex flex-wrap gap-3">
     <label className="min-w-0 flex-1 text-xs font-medium text-ink">Memo / reference
      <Input aria-label="Vendor issue reference" value={memo} onChange={e=>setMemo(e.target.value)} placeholder="Auto-generated if empty"/>
     </label>
     <div className="text-xs font-medium text-ink">Date <AppDatePicker label="Vendor issue date" value={date} onChange={setDate}/></div>
    </div>
    <div className="space-y-2">
     {lines.map((line,i)=>{
      const product=products.get(line.productId);
      const own=product?getVendorPreviewSnapshot().inventory?.[product.id]??product.stock:0;
      return <div key={line.key} className="rounded-lg border border-border bg-card p-2.5">
       <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-medium text-ink-500">{i+1}.</span>
        <div className="min-w-0 flex-1">
         <AppSelect label={'Issue product '+(i+1)} value={line.productId} placeholder="Select a product"
          options={catalog.map(p=>({value:p.id,label:p.name}))}
          onChange={id=>{const p=products.get(id);update(line.key,{productId:id,unit:p?.altUnit?.unit??p?.unit??'',qty:'1',smallQty:'',cost:''});}}/>
        </div>
        <Button type="button" variant="ghost" size="sm" aria-label={'Remove issue line '+(i+1)}
         onClick={()=>setLines(prev=>prev.filter(l=>l.key!==line.key))}><Trash2 className="size-4"/></Button>
       </div>
       {product&&<div className="grid gap-2 sm:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
         <span className="mb-1 block text-[11px] text-ink-500">Quantity · স্টক {own} {product.unit}</span>
         <CompoundQuantityInput product={product} unit={line.unit} primary={line.qty}
          secondary={line.smallQty} onPrimaryChange={value=>update(line.key,{qty:value})}
          onSecondaryChange={value=>update(line.key,{smallQty:value})}
          primaryLabel={'Issue quantity for '+product.name} secondaryLabel={'Small quantity for '+product.name}/>
        </div>
        <div>
         <span className="mb-1 block text-[11px] text-ink-500">Price in</span>
         <AppSelect label={'Issue unit '+(i+1)} value={line.unit} onChange={unit=>update(line.key,{unit,smallQty:'',cost:''})}
          options={[product.unit,...(product.altUnit?[product.altUnit.unit]:[])]}/>
        </div>
        <label className="text-[11px] text-ink-500">Agreed cost / {line.unit}
         <Input aria-label={'Agreed cost for '+product.name} inputMode="decimal" value={line.cost}
          onChange={e=>update(line.key,{cost:e.target.value})} placeholder="৳"/>
        </label>
       </div>}
      </div>;
     })}
     <Button type="button" variant="outline" size="sm" onClick={()=>{setLines(prev=>[...prev,empty('item-'+counter)]);setCounter(v=>v+1);}}>
      <Plus className="size-4"/> Add another product</Button>
    </div>
    {error&&<p role="alert" className="rounded-md bg-danger-bg p-2 text-xs text-danger">{error}</p>}
    <div className="flex flex-wrap items-center justify-between border-t border-border pt-3">
     <p className="text-xs text-ink-500">Agreed receivable <strong className="ml-1 text-base text-ink">{taka(total)}</strong>
      <span className="ml-2">· Demo only</span></p>
     <DialogFooter className="gap-2"><Button type="button" size="sm" variant="outline" onClick={close}>Cancel</Button>
      <Button type="submit" size="sm">Record issue memo</Button></DialogFooter>
    </div>
   </form>
  </DialogContent>
 </Dialog>;
}
