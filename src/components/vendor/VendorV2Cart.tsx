import React,{useMemo,useRef,useState} from 'react';
import {Plus,Trash2,ArrowLeft} from 'lucide-react';
import {Button} from '../Button';
import {Input} from '../Input';
import {AppSelect} from '../AppSelect';
import {AppDatePicker} from '../AppDateRangePicker';
import {ProductCombobox} from '../pos/ProductCombobox';
import {MultiUnitQuantityInput} from '../transactions/MultiUnitQuantityInput';
import {AddProductDialog} from '../products/AddProductDialog';
import {availableProducts,createPreviewProduct} from '../../data/erpDemoStore';
import {businessToday} from '../../utils/dateRange';
import {productUnits,productUnitFactor} from '../../utils/unitChain';
import {freezeUnitProfile,unitQuantitiesBase,type UnitQuantityMap} from '../../utils/multiUnitTransactions';
import {unitSymbol} from '../../data/productUnits';
import {dispatchVendorPreview,getVendorPreviewSnapshot} from '../../vendor/vendorPreviewStore';
import {taka} from '../../utils/currency';
import type {Product} from '../../types/erp';

/** Vendor V2 is a multi-line exchange memo, not a Purchase or POS posting. */
type ExchangeLine={id:string;product:Product;quantities:UnitQuantityMap;priceUnit:string;price:string};
type Props={partyId:string;partyName:string;mode:'taken'|'given';onCancel:()=>void;onSaved:()=>void;onDirtyChange:(dirty:boolean)=>void};
const unique=()=> 'vx-'+Math.random().toString(36).slice(2,11);
const newLine=(product:Product):ExchangeLine=>{
 const units=productUnits(product);
 return {id:unique(),product,quantities:{[units[0]??product.unit]:'1'},priceUnit:units[0]??product.unit,price:''};
};
const converted=(line:ExchangeLine)=>unitQuantitiesBase(freezeUnitProfile(line.product),line.quantities);
const knownAmount=(line:ExchangeLine)=>{
 const factor=productUnitFactor(line.product,line.priceUnit)||1;
 return converted(line)*Number(line.price)/factor;
};

export function VendorV2Cart({partyId,partyName,mode,onCancel,onSaved,onDirtyChange}:Props){
 const [catalog,setCatalog]=useState(()=>availableProducts().filter(p=>p.active&&p.kind!=='Service'&&p.kind!=='Bundle'));
 const [rows,setRows]=useState<ExchangeLine[]>([]);
 const [date,setDate]=useState(businessToday());
 const [reference,setReference]=useState('');
 const [addingProduct,setAddingProduct]=useState(false);
 const [error,setError]=useState('');
 const searchRef=useRef<HTMLInputElement>(null);
 const lastQuantityRef=useRef<HTMLInputElement|null>(null);
 const pendingCount=rows.filter(r=>!r.price.trim()).length;
 const total=useMemo(()=>rows.reduce((sum,row)=>sum+(row.price.trim()?knownAmount(row):0),0),[rows]);
 const dirty=()=>{onDirtyChange(true);setError('');};
 const change=(id:string,patch:Partial<ExchangeLine>)=>{
  setRows(items=>items.map(r=>r.id===id?{...r,...patch}:r));dirty();
 };
 const add=(product:Product)=>{
  setRows(items=>[...items,newLine(product)]);
  dirty();window.requestAnimationFrame(()=>lastQuantityRef.current?.focus());
 };
 const cancel=()=>{onDirtyChange(false);onCancel();};
 const submit=(event:React.FormEvent)=>{
  event.preventDefault();
  try{
   if(!rows.length)throw Error('Add at least one product.');
   const sources=rows.map((row,index)=>{
    const baseQty=converted(row);
    if(!Number.isFinite(baseQty)||baseQty<=0)throw Error('Enter a valid quantity for '+row.product.name+'.');
    const factor=productUnitFactor(row.product,row.priceUnit);
    if(!Number.isFinite(factor)||factor<=0)throw Error('Invalid price unit for '+row.product.name+'.');
    const amount=row.price.trim()?Number(row.price):null;
    if(amount!==null&&(!Number.isFinite(amount)||amount<=0))throw Error('Enter a positive price or leave it blank for '+row.product.name+'.');
    const unitCostBasePaisa=amount===null?null:Math.round(amount*100/factor);
    if(unitCostBasePaisa!==null&&(!Number.isSafeInteger(unitCostBasePaisa)||unitCostBasePaisa<=0))
     throw Error('Price is too small for '+row.product.name+' in '+row.priceUnit+'.');
    return {id:'',productId:row.product.id,baseQty,date,unitCostBasePaisa,index};
   });
   const snapshot=getVendorPreviewSnapshot();
   const operationId='vendor-v2-'+mode+'-'+partyId+'-'+snapshot.revision+'-'+unique();
   dispatchVendorPreview({
    type:mode==='taken'?'record-sourcing-memo':'issue-goods-memo',
    operationId,vendorPartyId:partyId,memoId:operationId,date,
    reference:reference.trim()||((mode==='taken'?'V-TK-':'V-GV-')+String(snapshot.revision+1).padStart(4,'0')),
    sources:sources.map(s=>({id:operationId+':'+s.index,productId:s.productId,baseQty:s.baseQty,date:s.date,unitCostBasePaisa:s.unitCostBasePaisa}))
   });
   onDirtyChange(false);onSaved();
  }catch(e){setError(e instanceof Error?e.message:'Could not save Vendor memo.');}
 };
 return <form onSubmit={submit} aria-label={mode==='taken'?'Vendor V2 take goods cart':'Vendor V2 give goods cart'}
  className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-3 shadow-card sm:p-4" data-vendor-v2-cart>
  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
   <div><h2 className="text-base font-semibold text-ink">{mode==='taken'?'Take Goods · পণ্য নিন':'Give Goods · পণ্য দিন'}</h2>
    <p className="text-xs text-ink-500">{partyName} · Multi-product goods memo · UI preview only</p></div>
   <Button type="button" variant="outline" size="sm" onClick={cancel}><ArrowLeft className="size-4"/> Back to Vendor</Button>
  </div>
  <div className="grid gap-3 sm:grid-cols-2">
   <div className="min-w-0"><label className="mb-1 block text-xs font-medium text-ink">Reference · মেমো</label>
    <Input value={reference} onChange={e=>{setReference(e.target.value);dirty();}} placeholder="Automatically generated" aria-label="Vendor memo reference"/></div>
   <div className="min-w-0"><label className="mb-1 block text-xs font-medium text-ink">Date · তারিখ</label>
    <AppDatePicker label="Goods memo date" value={date} onChange={v=>{setDate(v);dirty();}}/></div>
  </div>
  <section className="min-w-0 overflow-hidden rounded-lg border border-border" aria-label="Exchange products">
   <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2.5">
    <div><h3 className="text-[13px] font-semibold text-ink">Goods cart <span className="font-bn text-[11px] font-normal text-ink-500">· পণ্যের তালিকা</span></h3>
     <p data-table-helper="" className="text-[11px] text-ink-500">Search products and add several lines · F2</p></div>
    <Button type="button" variant="outline" size="sm" onClick={()=>setAddingProduct(true)}><Plus className="size-4"/> New product</Button>
   </div>
   <div className="border-b border-border px-3 py-2" data-vendor-v2-product-search>
    <ProductCombobox ref={searchRef} products={catalog} mode="purchase" onSelect={add} onCreate={()=>setAddingProduct(true)}
     ariaLabel="Search products to add to Vendor V2 cart"/>
   </div>
   <div className="min-w-0 overflow-x-auto">
    <table data-erp-table className="w-full min-w-[740px] border-collapse text-[13px]">
     <thead><tr className="bg-ink-50 text-[12px] text-ink-500">
      <th className="w-9 px-2 py-2 text-right font-medium">#</th>
      <th className="px-2 py-2 text-left font-medium">Product</th>
      <th className="w-[236px] px-2 py-2 text-right font-medium">Quantity · পরিমাণ</th>
      <th className="w-[98px] px-2 py-2 text-left font-medium">Price in</th>
      <th className="w-[114px] px-2 py-2 text-right font-medium">Unit price</th>
      <th className="w-[112px] px-2 py-2 text-right font-medium">Amount</th>
      <th className="w-9 px-2 py-2"><span className="sr-only">Remove</span></th>
     </tr></thead>
     <tbody className="divide-y divide-border">
      {rows.map((r,index)=><tr key={r.id} data-vendor-v2-line>
       <td className="px-2 py-2 text-right text-ink-400">{index+1}.</td>
       <td className="px-2 py-2"><p className="font-medium text-ink">{r.product.name}</p>
        <p data-table-helper="" className="text-[11px] text-ink-500">{r.product.nameBn||r.product.category} · Stock {r.product.stock} {unitSymbol(r.product.unit)}</p></td>
       <td className="px-2 py-2"><MultiUnitQuantityInput product={r.product} quantities={r.quantities}
        primaryRef={index===rows.length-1?node=>{lastQuantityRef.current=node;}:undefined}
        onChange={quantities=>change(r.id,{quantities})}
        onLastEnter={()=>searchRef.current?.focus()}
        label={'Multi-unit quantity for '+r.product.name}/></td>
       <td className="px-2 py-2"><AppSelect label={'Price unit for '+r.product.name} value={r.priceUnit}
        onChange={priceUnit=>change(r.id,{priceUnit,price:''})} options={[...productUnits(r.product)]}/></td>
       <td className="px-2 py-2"><Input aria-label={'Unit price for '+r.product.name} inputMode="decimal"
        className="w-full text-right" placeholder="Pending" value={r.price}
        onChange={e=>change(r.id,{price:e.target.value.replace(/[^\d.]/g,'')})}/></td>
       <td className="px-2 py-2 text-right font-medium whitespace-nowrap">{r.price.trim()?taka(knownAmount(r)):
        <span className="text-[11px] text-warning">Price pending</span>}</td>
       <td className="px-2 py-2"><Button type="button" size="sm" variant="ghost" aria-label={'Remove '+r.product.name}
        onClick={()=>{setRows(items=>items.filter(x=>x.id!==r.id));dirty();}}><Trash2 className="size-4"/></Button></td>
      </tr>)}
      {!rows.length&&<tr><td colSpan={7} className="px-3 py-10 text-center text-sm text-ink-500">Search and add a product to start this memo.</td></tr>}
     </tbody>
    </table>
   </div>
   <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-3 py-3">
    <div className="flex items-center gap-5">
     <div><p data-table-helper="" className="text-[11px] text-ink-500">Products</p><strong className="text-base text-ink">{rows.length}</strong></div>
     <div><p data-table-helper="" className="text-[11px] text-ink-500">Known amount</p><strong className="text-base text-ink">{taka(total)}</strong></div>
     <div><p data-table-helper="" className="text-[11px] text-ink-500">Price pending</p><strong className="text-base text-warning">{pendingCount}</strong></div>
    </div>
    <Button type="submit" data-erp-workflow-action="complete" disabled={!rows.length}>
     Save {mode==='taken'?'Taken':'Given'} Goods</Button>
   </div>
  </section>
  {pendingCount>0&&<p className="text-xs text-warning" role="note">Price not set on {pendingCount} {pendingCount===1?'line':'lines'} · Pending amounts are not treated as zero debt.</p>}
  {error&&<p className="rounded-md bg-danger-bg p-2 text-xs text-danger" role="alert">{error}</p>}
  <AddProductDialog open={addingProduct} onOpenChange={setAddingProduct} existingSerials={[]}
   onSave={(product,opening)=>{createPreviewProduct(product,opening);setCatalog(items=>[...items,product]);add(product);setAddingProduct(false);}}/>
 </form>;
}
