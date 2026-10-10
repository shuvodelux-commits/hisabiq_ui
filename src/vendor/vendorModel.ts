import type {
 VendorBalances, VendorLedgerEvent, VendorPreviewCommand, VendorPreviewState,
 VendorSource, VendorSourceInput, VendorOutstanding, VendorSide
} from './vendorTypes.ts';

const goodDate=(date:string)=>/^\d{4}-\d\d-\d\d$/.test(date)
 && !Number.isNaN(Date.parse(date+'T12:00:00Z'))
 && new Date(date+'T12:00:00Z').toISOString().slice(0,10)===date;
const money=(n:number,label:string)=>{
 if(!Number.isSafeInteger(n)||n<0)throw new Error(label+' must be nonnegative integer paisa.');
 return n;
};
const qty=(n:number)=>{
 if(!Number.isFinite(n)||n<=0)throw new Error('Source quantity must be positive.');
 return n;
};
const extended=(state:VendorPreviewState,operationId:string)=>{
 if(!operationId.trim())throw new Error('Operation ID is required.');
 if(state.operations.includes(operationId))return null;
 return {parties:state.parties, sources:[...state.sources],
   settlements:[...state.settlements],events:[...state.events],
   openings:[...state.openings],sales:[...state.sales],
   operations:[...state.operations,operationId],revision:state.revision+1};
};
function ensureVendor(state:VendorPreviewState,id:string):void {
 const party=state.parties.find(p=>p.id===id);
 if(!party||!party.roles.includes('Vendor'))throw new Error('Party must have Vendor role.');
 if(party.status==='Inactive')throw new Error('Vendor inactive.');
}
function amountFor(quantity:number,unitCostBasePaisa:number):number {
 money(unitCostBasePaisa,'Vendor cost');
 const total=Math.round(quantity*unitCostBasePaisa);
 if(!Number.isSafeInteger(total)||Math.abs(total-quantity*unitCostBasePaisa)>1e-6)
  throw new Error('Vendor cost must convert into valid integer paisa.');
 return total;
}
function source(state:VendorPreviewState,vendorPartyId:string,kind:'sourcing'|'issue',input:VendorSourceInput):VendorSource {
 if(!input.id.trim()||state.sources.some(s=>s.id===input.id))throw new Error('Duplicate or missing source ID.');
 if(!input.productId.trim())throw new Error('Product is required.');
 const baseQty=qty(input.baseQty);
 if(!goodDate(input.date))throw new Error('Invalid source date.');
 if(kind==='issue'&&input.unitCostBasePaisa===null)throw new Error('Goods issued to Vendor need an agreed cost.');
 const cost=input.unitCostBasePaisa;
 const sourceAmountPaisa=cost===null?null:amountFor(baseQty,cost);
 return {id:input.id,vendorPartyId,sourceKind:kind,productId:input.productId,
  baseQty,unitCostBasePaisa:cost,sourceAmountPaisa,
  pricingStatus:cost===null?'unpriced':'priced',
  date:input.date,reference:input.reference,sourceInvoiceId:input.sourceInvoiceId,
  sourceSaleLineId:input.sourceSaleLineId,memoId:input.memoId,status:'Active'};
}
function event(state:VendorPreviewState,s:VendorSource,operationId:string):VendorLedgerEvent {
 return {id:'vendor-event:'+operationId,vendorPartyId:s.vendorPartyId,
 side:s.sourceKind==='sourcing'?'payable':'receivable',
 kind:s.sourceKind,date:s.date,sequence:state.events.length+1,
 sourceId:s.id,reference:s.reference,deltaPaisa:s.sourceAmountPaisa??0,
 operationId,status:'Active',description:s.sourceAmountPaisa===null
 ?'Price pending · unpriced sourced quantity':'Linked '+s.sourceKind};
}
/** Pure single-command transition: validates every input before producing a new snapshot. */
export function applyVendorCommand(state:VendorPreviewState,cmd:VendorPreviewCommand):VendorPreviewState {
 if(state.operations.includes(cmd.operationId))return state;
 if(!cmd.operationId.trim())throw new Error('Operation ID is required.');
 if(cmd.type==='simulate-pos-sale'){
  if(!cmd.sale.id.trim()||!cmd.sale.invoiceId.trim()||cmd.sale.sourceMode!=='demo')
   throw new Error('A linked demo sale and invoice are required.');
  if(state.sales.some(s=>s.invoiceId===cmd.sale.invoiceId))
   throw new Error('This demo invoice already has a Vendor simulation.');
  const next=extended(state,cmd.operationId)!;
  for(const row of cmd.sources){
   ensureVendor(next,row.vendorPartyId);
   if(row.source.sourceInvoiceId!==cmd.sale.invoiceId)
    throw new Error('Vendor source must link the same demo invoice.');
   const linked=source(next,row.vendorPartyId,'sourcing',row.source);
   next.sources.push(linked);
   next.events.push({...event(next,linked,cmd.operationId),id:'vendor-event:'+cmd.operationId+':'+linked.id,
      sequence:next.events.length+1});
  }
  if(cmd.sale.sourceIds.length!==cmd.sources.length||
     cmd.sale.sourceIds.some((id,i)=>id!==cmd.sources[i].source.id))
   throw new Error('Demo invoice and source allocations differ.');
  next.sales.push({...cmd.sale});
  return next;
 }
 ensureVendor(state,cmd.vendorPartyId);
 if(cmd.type==='record-sourcing'||cmd.type==='issue-goods'){
  const kind=cmd.type==='record-sourcing'?'sourcing':'issue';
  const added=source(state,cmd.vendorPartyId,kind,cmd.source);
  const next=extended(state,cmd.operationId)!;
  next.sources.push(added);
  next.events.push(event(state,added,cmd.operationId));
  return next;
 }
 if(cmd.type==='set-opening'){
  money(cmd.amountPaisa,'Opening amount');
  if(!goodDate(cmd.date))throw new Error('Invalid opening date.');
  if(state.openings.some(o=>o.vendorPartyId===cmd.vendorPartyId&&o.side===cmd.side))
   throw new Error('Opening exists; correct using an audited replacement.');
  const next=extended(state,cmd.operationId)!;
  next.openings.push({id:'vendor-opening:'+cmd.operationId,vendorPartyId:cmd.vendorPartyId,
   side:cmd.side,openingAmountPaisa:cmd.amountPaisa,date:cmd.date,
   reason:cmd.reason,operationId:cmd.operationId});
  next.events.push({id:'vendor-event:'+cmd.operationId,vendorPartyId:cmd.vendorPartyId,
   side:cmd.side,kind:'opening',date:cmd.date,sequence:state.events.length+1,
   deltaPaisa:cmd.amountPaisa,description:'Opening balance (non-cash)',
   operationId:cmd.operationId,status:'Active'});
  return next;
 }
 throw new Error('Vendor '+cmd.type+' is not available in this preview increment.');
}
export function sourceOutstanding(state:VendorPreviewState,sourceId:string):VendorOutstanding {
 const s=state.sources.find(row=>row.id===sourceId&&row.status==='Active');
 if(!s)throw new Error('Vendor source not found.');
 const rows=state.settlements.filter(row=>row.status==='Active'&&row.allocations.some(a=>a.sourceId===sourceId));
 const returnedBaseQty=rows.filter(row=>row.kind==='return-to-vendor'||row.kind==='receive-goods')
   .flatMap(row=>row.allocations.filter(a=>a.sourceId===sourceId).map(a=>a.baseQty??0))
   .reduce((a,b)=>a+b,0);
 const remaining=Math.max(0,s.baseQty-returnedBaseQty);
 const priced=s.unitCostBasePaisa!==null;
 const discountedReturn=priced?Math.round(returnedBaseQty*s.unitCostBasePaisa!):0;
 const settledCash=rows.filter(row=>row.kind==='pay'||row.kind==='receive-money')
 .flatMap(row=>row.allocations.filter(a=>a.sourceId===sourceId).map(a=>a.amountPaisa??0))
 .reduce((a,b)=>a+b,0);
 const due=priced?Math.max(0,s.sourceAmountPaisa!-discountedReturn-settledCash):null;
 return {unpricedBaseQty:priced?0:remaining,pricedBaseQty:priced?remaining:0,
 returnedBaseQty,monetaryDuePaisa:due};
}
export function vendorBalances(state:VendorPreviewState,vendorPartyId:string):VendorBalances {
 const rows=state.events.filter(e=>e.vendorPartyId===vendorPartyId&&e.status==='Active');
 const side=(side:VendorSide)=>rows.filter(e=>e.side===side).reduce((sum,e)=>sum+e.deltaPaisa,0);
 const unpriced=state.sources.filter(s=>s.vendorPartyId===vendorPartyId&&s.status==='Active'
   &&s.sourceKind==='sourcing').map(s=>sourceOutstanding(state,s.id))
   .filter(s=>s.unpricedBaseQty>0);
 return {knownPayablePaisa:side('payable'),knownReceivablePaisa:side('receivable'),
  unpricedSourceBaseQty:unpriced.reduce((a,b)=>a+b.unpricedBaseQty,0),
  unpricedSourceCount:unpriced.length};
}
