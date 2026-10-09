import React, {useEffect,useRef} from 'react';
import {ArrowDown,ArrowUp,X} from 'lucide-react';
import {ProductCombobox, type ProductPickerMode} from '../pos/ProductCombobox';
import {ProductThumb} from '../ProductThumb';
import {AppSelect} from '../AppSelect';
import {taka} from '../../utils/currency';
import {formatStock} from '../../utils/units';
import type {Product} from '../../types/erp';
import {transactionLineTotal} from '../../utils/transactionLines';

/** POS V2/Magic Patterns visual contract for non-posting transaction cart editors. */
export type EditableTransactionLine={
 id:string;productId:string;name:string;quantity:number;unit:string;price:number;
 secondaryQuantity?:number;unitFactor?:number;
};
type Props<L extends EditableTransactionLine>={
 mode:'quotation'|'online';
 products:readonly Product[];
 lines:L[];
 onAdd:(product:Product)=>void;
 onUpdate:(id:string,patch:Partial<L>)=>void;
 onRemove:(id:string)=>void;
 onMove?:(id:string,delta:number)=>void;
 onCreate?:()=>void;
 locked?:boolean;
};
const grid='grid min-w-[760px] grid-cols-[36px_minmax(200px,1fr)_136px_112px_112px_110px_66px] items-center gap-2';
const input='h-9 w-full rounded-md border border-transparent bg-transparent px-2 text-right text-sm text-ink hover:border-border focus:border-teal-500 focus:bg-card focus:outline-none focus:ring-2 focus:ring-teal-500/20';
/** Same inline add row, compact product thumbnails, themed controls and keyboard flow as POS. */
export function TransactionCartEditor<L extends EditableTransactionLine>({mode,products,lines,onAdd,onUpdate,onRemove,onMove,onCreate,locked=false}:Props<L>){
 const searchRef=useRef<HTMLInputElement>(null);
 const quantityRefs=useRef<Record<string,HTMLInputElement|null>>({});
 const previousCount=useRef(lines.length);
 useEffect(()=>{
  if(lines.length>previousCount.current&&!locked){
   const last=lines[lines.length-1];if(last){quantityRefs.current[last.id]?.focus();quantityRefs.current[last.id]?.select();}
  }
  previousCount.current=lines.length;
 },[lines.length,locked]);
 const inputPrefix=mode==='online'?'Order ':'';
 const productLabel=mode==='online'?'Add online order product':'Add product to quotation';
 const backToProduct=(event:React.KeyboardEvent)=>{
  if(event.key==='Enter'){event.preventDefault();searchRef.current?.focus();}
 };
 return <div data-testid={'transaction-cart-'+mode} className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
  <div className={grid+' border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink-500'}>
   <span className="text-right">#</span><span>Product · পণ্য</span><span className="text-right">Qty · পরিমাণ</span><span>Unit</span>
   <span className="text-right">Price</span><span className="text-right">Amount</span><span className="sr-only">Actions</span>
  </div>
  <div className="divide-y divide-border">
   {lines.map((line,i)=>{
    const product=products.find(p=>p.id===line.productId);
    const large=product?.altUnit&&line.unit===product.altUnit.unit;
    const factor=large?product!.altUnit!.factor:1;
    const canChange=!locked;
    return <div data-testid="transaction-cart-row" key={line.id} className={grid+' px-3 py-1.5 hover:bg-ink-50/40'}>
     <span className="text-right text-sm text-ink-400">{i+1}.</span>
     <div className="flex min-w-0 items-center gap-2.5">
      <ProductThumb size={32} src={product?.image}/>
      <div className="min-w-0"><p className="truncate text-[13px] font-medium text-ink">{line.name}</p>
       <p className="truncate text-[11px] text-ink-500"><span className="font-bn">{product?.nameBn??''}</span>
        {product?.nameBn?' · ':''}{product?.category??'Product'} · {product?formatStock(product):'Saved quote item'}
       </p>
      </div>
     </div>
     <div className="flex min-w-0 items-center gap-1">
      <input ref={node=>{quantityRefs.current[line.id]=node;}} aria-label={inputPrefix+'Quantity row '+(i+1)}
       type="number" min="0" step="any" inputMode="decimal" disabled={!canChange} value={line.quantity}
       onChange={event=>onUpdate(line.id,{quantity:Number(event.target.value)} as Partial<L>)}
       onKeyDown={backToProduct} className={input+' min-w-0 bg-ink-50/50 font-medium'}/>
      {large&&<div className="min-w-0 flex-1">
        <input aria-label={inputPrefix+'Small quantity row '+(i+1)} type="number" min="0" step="any" disabled={!canChange}
         title={'Additional '+product!.unit} value={line.secondaryQuantity??0}
         onChange={event=>onUpdate(line.id,{secondaryQuantity:Number(event.target.value),unitFactor:factor} as Partial<L>)}
         onKeyDown={backToProduct} className={input+' w-full bg-ink-50/50'}/>
        <span className="block text-center text-[10px] text-ink-400">{product!.unit}</span>
      </div>}
     </div>
     <AppSelect label={inputPrefix+'Unit row '+(i+1)} value={line.unit} disabled={!canChange}
      options={product?.altUnit?[product.altUnit.unit,product.unit]:[line.unit]}
      onChange={unit=>{
       const oldFactor=product?.altUnit&&line.unit===product.altUnit.unit?product.altUnit.factor:1;
       const nextFactor=product?.altUnit&&unit===product.altUnit.unit?product.altUnit.factor:1;
       const basePrice=line.price/oldFactor;
       const baseQuantity=line.quantity*oldFactor+(line.secondaryQuantity??0);
       const nextQuantity=nextFactor>1?Math.floor(baseQuantity/nextFactor):baseQuantity;
       const secondary=nextFactor>1?Number((baseQuantity-nextQuantity*nextFactor).toFixed(3)):0;
       onUpdate(line.id,{unit,quantity:Number(nextQuantity.toFixed(3)),secondaryQuantity:secondary,
        unitFactor:nextFactor,price:Number((basePrice*nextFactor).toFixed(4))} as Partial<L>);
      }}/>
     <div className="relative"><span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-ink-400">৳</span>
      <input aria-label={inputPrefix+'Price row '+(i+1)} type="number" min="0" step="any" inputMode="decimal"
       disabled={!canChange} value={line.price} onChange={event=>onUpdate(line.id,{price:Number(event.target.value)} as Partial<L>)}
       onKeyDown={backToProduct} className={input+' pl-5'}/></div>
     <strong className="text-right text-[13px] text-ink">{taka(transactionLineTotal({...line,unitFactor:factor}))}</strong>
     <div className="flex items-center justify-end">
      {onMove&&!locked&&<div className="flex flex-col">
       <button type="button" aria-label={'Move row '+(i+1)+' up'} disabled={i===0} onClick={()=>onMove(line.id,-1)} className="rounded text-ink-500 hover:text-teal-700 disabled:opacity-30"><ArrowUp className="size-3.5"/></button>
       <button type="button" aria-label={'Move row '+(i+1)+' down'} disabled={i===lines.length-1} onClick={()=>onMove(line.id,1)} className="rounded text-ink-500 hover:text-teal-700 disabled:opacity-30"><ArrowDown className="size-3.5"/></button>
      </div>}
      {!locked&&<button type="button" aria-label={'Remove '+line.name} onClick={()=>onRemove(line.id)}
       className="flex size-7 items-center justify-center rounded-md text-ink-400 hover:bg-danger-bg hover:text-danger"><X className="size-4"/></button>}
     </div>
    </div>;
   })}
   {!locked&&<div data-testid="transaction-add-row" className={grid+' bg-teal-50/35 px-3 py-2'}>
    <span className="text-right text-sm text-teal-600">{lines.length+1}.</span>
    <ProductCombobox ref={searchRef} mode={mode} products={products} onSelect={onAdd} onCreate={onCreate?()=>onCreate():undefined} ariaLabel={productLabel}/>
    <span className="text-right text-xs text-ink-400">Qty</span><span className="text-xs text-ink-400">Unit</span>
    <span className="text-right text-xs text-ink-400">Price</span><span className="text-right text-xs text-ink-400">Amount</span><span/>
   </div>}
  </div>
  {!lines.length&&<p className="px-4 py-5 text-center text-xs text-ink-500">Search to add your first product · <span className="font-bn">পণ্য যোগ করুন</span></p>}
 </div>;
}
