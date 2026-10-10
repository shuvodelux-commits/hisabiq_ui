import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Button} from '../Button';
import {Input} from '../Input';
import {AppDatePicker} from '../AppDateRangePicker';
import {PurchaseCart} from '../purchases/PurchaseCart';
import {AddProductDialog} from '../products/AddProductDialog';
import {availableProducts,createPreviewProduct} from '../../data/erpDemoStore';
import {businessToday} from '../../utils/dateRange';
import {dispatchVendorPreview,getVendorPreviewSnapshot} from '../../vendor/vendorPreviewStore';
import {makeVendorCartLine,makeVendorSourceInputs} from '../../vendor/vendorCartAdapter';
import {lineAmount,rounded,switchPurchaseUnit,type PurchaseCartLine} from '../../utils/purchaseCart';
import {taka} from '../../utils/currency';
import type {Product} from '../../types/erp';

type Props={partyId:string;mode:'taken'|'given';onSaved:()=>void;onCancel:()=>void;onDirtyChange:(dirty:boolean)=>void};

/**
 * Vendor product movements use the same PurchaseCart component and two-column
 * transaction layout as Purchases. Only memo validation/posting differs.
 */
export function VendorGoodsEditor({partyId,mode,onSaved,onCancel,onDirtyChange}:Props){
 const [catalog,setCatalog]=useState(()=>availableProducts().filter(p=>p.kind!=='Service'));
 const [rows,setRows]=useState<PurchaseCartLine[]>([]);
 const [date,setDate]=useState(businessToday());
 const [memo,setMemo]=useState('');
 const [error,setError]=useState('');
 const [addingProduct,setAddingProduct]=useState(false);
 const [lastAdded,setLastAdded]=useState<string|null>(null);
 const searchRef=useRef<HTMLInputElement>(null);
 const qtyRefs=useRef<Record<string,HTMLInputElement|null>>({});
 const smallRefs=useRef<Record<string,HTMLInputElement|null>>({});
 const costRefs=useRef<Record<string,HTMLInputElement|null>>({});
 const lotPriceRefs=useRef<Record<string,HTMLInputElement|null>>({});
 const received=mode==='taken';
 const total=useMemo(()=>rounded(rows.reduce((sum,row)=>sum+lineAmount(row),0)),[rows]);
 const unpricedCount=rows.filter(row=>!row.cost.trim()).length;

 useEffect(()=>{
  if(!lastAdded)return;
  qtyRefs.current[lastAdded]?.focus();
  qtyRefs.current[lastAdded]?.select();
 },[lastAdded,rows.length]);

 const dirty=()=>{onDirtyChange(true);setError('');};
 const add=(p:Product)=>{
  const next=makeVendorCartLine(p);
  setRows(current=>[...current,next]);
  setLastAdded(next.id);
  dirty();
 };
 const change=(id:string,patch:Partial<PurchaseCartLine>)=>{
  setRows(current=>current.map(line=>line.id===id?{...line,...patch}:line));
  dirty();
 };
 const selectCostUnit=(line:PurchaseCartLine,unit:string)=>{
  setRows(current=>current.map(row=>row.id===line.id?switchPurchaseUnit(row,unit):row));
  dirty();
 };
 const close=()=>{onDirtyChange(false);onCancel();};
 const save=(event:React.FormEvent)=>{
  event.preventDefault();
  try{
   const snapshot=getVendorPreviewSnapshot();
   const operationId='vendor-'+mode+'-'+partyId+'-'+snapshot.revision;
   const reference=memo.trim()||((received?'V-TK-':'V-GV-')+String(snapshot.revision+1).padStart(4,'0'));
   const sources=makeVendorSourceInputs(rows,mode,operationId,date);
   dispatchVendorPreview({
    type:received?'record-sourcing-memo':'issue-goods-memo',
    operationId,vendorPartyId:partyId,memoId:operationId,date,reference,sources
   });
   onDirtyChange(false);
   onSaved();
  }catch(e){setError(e instanceof Error?e.message:'Cannot save products.');}
 };

 return <form aria-label={received?'Receive products editor':'Issue products editor'} onSubmit={save}
  className="space-y-3">
  <div className="flex flex-wrap items-center justify-between gap-2">
   <div><h3 className="text-sm font-semibold text-ink">{received?'Receive Products · পণ্য নিন':'Issue Products · পণ্য দিন'}</h3>
    <p className="text-xs text-ink-500">Preview only · real stock and money are unchanged</p></div>
   <Button type="button" size="sm" variant="outline" onClick={close}>Close</Button>
  </div>
  <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
   <div className="min-w-0">
    <PurchaseCart variant={received?'vendor-received':'vendor-issued'}
     lines={rows} products={catalog} searchRef={searchRef}
     qtyRefs={qtyRefs} smallRefs={smallRefs} costRefs={costRefs} lotPriceRefs={lotPriceRefs}
     onAdd={add} onCreate={()=>setAddingProduct(true)} onUpdate={change}
     onRemove={id=>{setRows(items=>items.filter(line=>line.id!==id));dirty();}}
     onCostUnitChange={selectCostUnit}/>
   </div>
   <aside className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-card lg:sticky lg:top-4">
    <div className="space-y-3 border-b border-border p-4">
     <div><h4 className="text-[13px] font-semibold text-ink">Vendor transaction details</h4>
      <p className="text-xs text-ink-500">সোর্সিং পণ্যের তথ্য</p></div>
     <label className="block text-xs font-medium text-ink">Memo / reference
      <Input className="mt-1" aria-label="Vendor memo reference" value={memo}
       onChange={e=>{setMemo(e.target.value);dirty();}} placeholder="Auto if empty"/>
     </label>
     <div className="text-xs font-medium text-ink">Date · তারিখ
      <AppDatePicker label="Vendor memo date" value={date} onChange={value=>{setDate(value);dirty();}}/>
     </div>
    </div>
    <div className="space-y-3 p-4">
     <div className="flex items-center justify-between text-xs text-ink-600">
      <span>Product lines</span><strong className="text-ink">{rows.length}</strong>
     </div>
     {unpricedCount>0&&<div className="flex items-center justify-between text-xs text-warning">
      <span>Price not set · দাম ঠিক হয়নি</span><strong>{unpricedCount}</strong>
     </div>}
     <div className="rounded-xl bg-inverse p-4 text-white">
      <p className="text-xs text-[#B7C2CF]">{received?'Agreed Purchase Cost · ঠিক করা দাম':'Amount Receivable · পাওনা'}</p>
      <p className="mt-1 text-right text-3xl font-semibold">{taka(total)}</p>
      {unpricedCount>0&&<p className="mt-1 text-right text-xs text-[#B7C2CF]">Plus {unpricedCount} unpriced product{unpricedCount===1?'':'s'}</p>}
     </div>
     {error&&<p role="alert" className="rounded-md bg-danger-bg p-2 text-xs text-danger">{error}</p>}
     <Button type="submit" className="w-full" size="sm">Save {received?'Received':'Issued'} Products</Button>
    </div>
   </aside>
  </div>
  <AddProductDialog open={addingProduct} onOpenChange={setAddingProduct}
   existingSerials={[]} onSave={p=>{createPreviewProduct(p);setCatalog(items=>[...items,p]);add(p);setAddingProduct(false);}}/>
 </form>;
}
