import {useRef,useState} from 'react';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '../Dialog';
import {Button} from '../Button';
import {Input} from '../Input';
import {FormSelect} from '../FormSelect';
import {PurchaseEditor} from '../../pages/PurchaseEditor';
import {PurchaseCart} from './PurchaseCart';
import {PurchasePaymentPanel,makePurchasePaymentRow,type PurchasePaymentRow} from './PurchasePaymentPanel';
import {availablePurchaseEvents,mutatePreviewPurchase} from '../../data/erpDemoStore';
import {purchasePosition,purchaseReturnQuote,returnedQuantity} from '../../utils/purchaseSource';
import {baseQty,switchPurchaseUnit,type PurchaseCartLine} from '../../utils/purchaseCart';
import {calculatePurchaseCheckout} from '../../utils/purchaseCheckout';
import {businessToday} from '../../utils/dateRange';
import {taka} from '../../utils/currency';
import type {Purchase,PaymentSplit} from '../../types/erp';

type Mode='correction'|'payment'|'return';
export function PurchaseSourceDialog({purchase,mode,onClose,onSaved}:{purchase:Purchase;mode:Mode;onClose:()=>void;onSaved:(purchase:Purchase)=>void}){
 const history=availablePurchaseEvents();const position=purchasePosition(purchase,history);
 const [reason,setReason]=useState('');const [date,setDate]=useState(businessToday);const [error,setError]=useState('');
 const [settlement,setSettlement]=useState<'credit'|'cash'>('credit');
 const [payments,setPayments]=useState<PurchasePaymentRow[]>(()=>[makePurchasePaymentRow()]);
 const [lines,setLines]=useState<PurchaseCartLine[]>(()=>structuredClone(purchase.cartSnapshot??[]).map(line=>({...line,bigQty:'0',smallQty:'0',detailsOpen:false})));
 const [proposed,setProposed]=useState<Purchase|null>(null);const [review,setReview]=useState(false);
 const searchRef=useRef<HTMLInputElement>(null),paidRef=useRef<HTMLInputElement>(null);
 const qtyRefs=useRef<Record<string,HTMLInputElement|null>>({}),smallRefs=useRef<Record<string,HTMLInputElement|null>>({}),costRefs=useRef<Record<string,HTMLInputElement|null>>({}),lotPriceRefs=useRef<Record<string,HTMLInputElement|null>>({});
 const requested=lines.map((line,index)=>({index,quantity:baseQty(line)}));
 let quote:{amount:number;dueReduction:number;excess:number}|null=null;let quoteError='';
 if(mode==='return')try{quote=purchaseReturnQuote(purchase,requested,history);}catch(e){quoteError=e instanceof Error?e.message:'Invalid return.';}
 const paymentTotal=payments.reduce((sum,row)=>sum+(Number(row.amount)||0),0);
 const total=mode==='payment'?position.due:settlement==='cash'?quote?.excess??0:0;
 const totals=calculatePurchaseCheckout(total,'','amount','No rounding',payments);
 const splits:PaymentSplit[]=payments.filter(row=>row.amount.trim()).map(row=>({...row,amount:Number(row.amount)}));
 const update=(id:string,patch:Partial<PurchaseCartLine>)=>{setReview(false);setLines(current=>current.map(line=>line.id===id?{...line,...patch}:line));};
 const title=mode==='correction'?'Correct purchase':mode==='payment'?'Pay purchase due':'Return purchase products';
 const beginReview=()=>{
  setError('');if(!reason.trim()){setError('Add a reason or payment reference.');return;}
  if(mode==='return'&&!quote){setError(quoteError);return;}
  if((mode==='payment'||mode==='return'&&settlement==='cash'&&total>0)&&(paymentTotal<=0||Math.abs(paymentTotal-total)>0.000001&&mode==='return'||totals.excess>0)){setError('Enter valid payment sources within the shown amount.');return;}
  setReview(true);
 };
 const confirm=()=>{
  try{
   const operation=mode==='correction'?{kind:'correction' as const,next:proposed!,reason,date:businessToday()}:mode==='payment'?{kind:'payment' as const,payments:splits,reason,date}:{kind:'return' as const,lines:requested,settlement,payments:settlement==='cash'&&(quote?.excess??0)>0?splits:[],reason,date};
   onSaved(mutatePreviewPurchase(purchase,operation));
  }catch(e){setError(e instanceof Error?e.message:'Could not save this preview.');setReview(false);}
 };
 return <Dialog open onOpenChange={value=>!value&&onClose()}><DialogContent role="dialog" aria-modal="true" aria-label={title} className="max-h-[94dvh] w-[min(98vw,1440px)] max-w-[1440px] overflow-y-auto p-3 sm:p-5">
  <DialogHeader><DialogTitle>{title} · {purchase.ref}</DialogTitle><DialogDescription>UI preview only · original bill and audit history are retained. Backend stock, bank and ledger posting is not connected.</DialogDescription></DialogHeader>
  <div className="space-y-3">
   <p className="text-sm text-ink">{purchase.supplier} · Supplier due {taka(position.due)} · Credit {taka(position.credit)}</p>
   <label className="block text-xs font-medium text-ink">Reason / reference · কারণ<Input aria-label="Purchase action reason" value={reason} onChange={e=>{setReason(e.target.value);setReview(false);}}/></label>
   {mode!=='correction'&&<label className="block text-xs font-medium text-ink">Date<Input aria-label="Purchase action date" type="date" value={date} onChange={e=>{setDate(e.target.value);setReview(false);}}/></label>}
   {mode==='correction'&&!review&&<PurchaseEditor embedded initialPurchase={purchase} lockedSupplierId={purchase.supplierId} onCancel={onClose} onSaveSource={next=>{setProposed(next);if(!reason.trim())setError('Add a correction reason.');else{setError('');setReview(true);}}}/>}
   {mode==='return'&&!review&&<>
    <p className="text-xs text-ink-500">Enter only products being returned. Original units/costs are fixed. Discount and rounding are allocated from this bill.</p>
    <div className="space-y-1 text-xs text-ink-500">{purchase.inventoryLines?.map((line,index)=><p key={index}>{purchase.cartSnapshot?.[index].product.name}: remaining {line.quantity-returnedQuantity(purchase.id,index,history)} {purchase.cartSnapshot?.[index].product.unit}</p>)}</div>
    <PurchaseCart sourceLocked lines={lines} products={[]} searchRef={searchRef} qtyRefs={qtyRefs} smallRefs={smallRefs} costRefs={costRefs} lotPriceRefs={lotPriceRefs} onAdd={()=>undefined} onCreate={()=>undefined} onUpdate={update} onRemove={id=>update(id,{bigQty:'0',smallQty:'0'})} onCostUnitChange={(line,unit)=>update(line.id,switchPurchaseUnit(line,unit))}/>
    <label className="block text-xs font-medium text-ink">Return settlement<FormSelect aria-label="Return settlement" value={settlement} options={[{value:'credit',label:'Keep supplier credit'},{value:'cash',label:'Receive refund'}]} onChange={event=>{setSettlement(event.target.value==='cash'?'cash':'credit');setReview(false);}}/></label>
    <p className="text-sm text-ink">Return value {taka(quote?.amount??0)} · Reduces due {taka(quote?.dueReduction??0)} · {settlement==='cash'?'Refund':'Supplier credit'} {taka(quote?.excess??0)}</p>
   </>}
   {!review&&(mode==='payment'||mode==='return'&&settlement==='cash'&&total>0)&&<PurchasePaymentPanel hideDiscount actionLabel="Review payment" totals={totals} itemCount={0} discount="" discountMode="amount" onDiscount={()=>undefined} onDiscountMode={()=>undefined} payments={payments} onPayments={rows=>{setPayments(rows);setReview(false);}} paidRef={paidRef} onComplete={beginReview}/>}
   {!review&&mode==='return'&&<Button onClick={beginReview}>Review return</Button>}
   {review&&<section aria-label="Purchase action impact" className="space-y-3 rounded-xl border border-border bg-ink-50 p-3 text-sm text-ink">
    <h3 className="font-semibold">Review before saving · সেভ করার আগে দেখুন</h3>
    <p>{reason}</p>
    {mode==='correction'?<><p>Total {taka(purchase.total)} → {taka(proposed!.total)} · Paid {taka(purchase.paid)} → {taka(proposed!.paid)}</p><p>Due {taka(position.due)} → {taka(proposed!.total-proposed!.paid)}. Stock quantities and lot costs will follow the corrected source.</p>{proposed!.inventoryLines?.map((line,index)=><p key={index}>{proposed!.cartSnapshot?.[index].product.name}: {purchase.inventoryLines?.[index]?.quantity??0} → {line.quantity} base units · cost {taka(line.unitCost??0)}</p>)}</>:mode==='payment'?<p>Payment {taka(paymentTotal)} · Due {taka(position.due)} → {taka(position.due-paymentTotal)}</p>:<><p>Return {taka(quote!.amount)} · Due reduction {taka(quote!.dueReduction)} · {settlement==='cash'?'Refund':'Credit'} {taka(quote!.excess)}</p>{requested.filter(l=>l.quantity>0).map(l=><p key={l.index}>{purchase.cartSnapshot![l.index].product.name}: {l.quantity} {purchase.cartSnapshot![l.index].product.unit}</p>)}</>}
    <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>setReview(false)}>Back to edit</Button><Button onClick={confirm}>Confirm purchase preview</Button></div>
   </section>}
   {error&&<p role="alert" className="rounded-lg bg-danger-bg p-3 text-sm text-danger">{error}</p>}
   <Button variant="outline" onClick={onClose}>Close</Button>
  </div>
 </DialogContent></Dialog>;
}
