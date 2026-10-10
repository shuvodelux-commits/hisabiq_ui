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
   operations:[...state.operations,operationId],revision:state.revision+1,
   inventory:state.inventory?{...state.inventory}:undefined};
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
  pricingStatus:cost===null?'unpriced':'priced',pricedBaseQty:cost===null?undefined:baseQty,
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
 if(cmd.type==='issue-goods-memo'){
  if(!cmd.memoId.trim()||!goodDate(cmd.date)||!cmd.sources.length)
   throw new Error('Valid memo, date and goods lines are required.');
  const next=extended(state,cmd.operationId)!;
  if(!next.inventory)throw new Error('Owned stock preview is unavailable.');
  const seen=new Set<string>();
  const additions:VendorSource[]=[];
  for(const input of cmd.sources){
   if(input.date!==cmd.date)throw new Error('Goods issue date must match memo date.');
   if(seen.has(input.id))throw new Error('Duplicate Vendor memo source ID.');
   seen.add(input.id);
   const linked=source({...next,sources:[...next.sources,...additions]},cmd.vendorPartyId,'issue',
     {...input,memoId:cmd.memoId,reference:cmd.reference??cmd.memoId});
   const balance=next.inventory[linked.productId]??0;
   if(balance<linked.baseQty)throw new Error('Insufficient owned stock to issue goods.');
   next.inventory[linked.productId]=balance-linked.baseQty;
   additions.push(linked);
  }
  for(const linked of additions){
   next.sources.push(linked);
   next.events.push({...event(next,linked,cmd.operationId),
    id:'vendor-event:'+cmd.operationId+':'+linked.id,
    sequence:next.events.length+1});
  }
  return next;
 }
 if(cmd.type==='record-purchase-inventory'){
  if(!cmd.purchaseId.trim()||!cmd.lines.length)throw new Error('Purchase reference and product lines required.');
  const next=extended(state,cmd.operationId)!;
  if(!next.inventory)next.inventory={};
  for(const line of cmd.lines){
   if(!line.productId.trim())throw new Error('Purchase product is required.');
   qty(line.baseQty);
   next.inventory[line.productId]=(next.inventory[line.productId]??0)+line.baseQty;
  }
  return next;
 }
 if(cmd.type==='record-sourcing'||cmd.type==='issue-goods'){
  const kind=cmd.type==='record-sourcing'?'sourcing':'issue';
  const added=source(state,cmd.vendorPartyId,kind,cmd.source);
  const next=extended(state,cmd.operationId)!;
  if(cmd.type==='issue-goods'&&next.inventory){
   const available=next.inventory[added.productId]??0;
   if(available<added.baseQty)throw new Error('Insufficient owned stock to issue goods to Vendor.');
   next.inventory[added.productId]=available-added.baseQty;
  }
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

 if(cmd.type==='set-source-price'){
  if(!goodDate(cmd.date))throw new Error('Invalid price confirmation date.');
  if(!Number.isSafeInteger(cmd.unitCostBasePaisa)||cmd.unitCostBasePaisa<=0)
   throw new Error('Vendor cost must be a positive integer paisa amount.');
  const existing=state.sources.find(s=>s.id===cmd.sourceId&&s.status==='Active');
  if(!existing||existing.vendorPartyId!==cmd.vendorPartyId||existing.sourceKind!=='sourcing')
   throw new Error('Vendor source not found for this Vendor.');
  if(existing.unitCostBasePaisa!==null)throw new Error('Vendor source already priced; reversing a quote needs review.');
  if(cmd.date<existing.date)throw new Error('Price confirmation cannot predate borrowing.');
  const remaining=sourceOutstanding(state,existing.id).unpricedBaseQty;
  if(remaining<=0)throw new Error('Vendor source already closed; no remaining quantity.');
  const amount=amountFor(remaining,cmd.unitCostBasePaisa);
  const next=extended(state,cmd.operationId)!;
  next.sources=next.sources.map(s=>s.id!==existing.id?s:{...s,
    unitCostBasePaisa:cmd.unitCostBasePaisa,sourceAmountPaisa:amount,
    pricedBaseQty:remaining,pricingStatus:'priced'});
  next.events.push({id:'vendor-event:'+cmd.operationId,vendorPartyId:cmd.vendorPartyId,
   side:'payable',kind:'pricing',sourceId:existing.id,reference:existing.reference,
   date:cmd.date,sequence:next.events.length+1,deltaPaisa:amount,operationId:cmd.operationId,
   description:'Vendor price confirmed after sale · demo',status:'Active'});
  return next;
 }
 if(cmd.type==='settle-source'){
  if(!goodDate(cmd.date))throw new Error('Invalid settlement date.');
  const moneyKind=cmd.kind==='pay'||cmd.kind==='receive-money';
  if(!cmd.allocations.length)throw new Error('Choose at least one Vendor source.');
  if((cmd.side==='payable')!==['pay','return-to-vendor'].includes(cmd.kind))
   throw new Error('Vendor settlement side mismatch.');
  if(moneyKind)money(cmd.amountPaisa!,'Payment');
  const seen=new Set<string>();
  let sumPaisa=0;
  const next=extended(state,cmd.operationId)!;
  for(const row of cmd.allocations){
   if(seen.has(row.sourceId))throw new Error('Duplicate Vendor settlement source.');
   seen.add(row.sourceId);
   const linked=state.sources.find(s=>s.id===row.sourceId&&s.status==='Active');
   if(!linked||linked.vendorPartyId!==cmd.vendorPartyId||
      linked.sourceKind!==(cmd.side==='payable'?'sourcing':'issue'))
    throw new Error('Vendor settlement source belongs to a different Vendor or side.');
   if(cmd.date<linked.date)throw new Error('Settlement cannot predate source.');
   const outstanding=sourceOutstanding(state,linked.id);
   if(moneyKind){
    if(linked.unitCostBasePaisa===null)throw new Error('Set Vendor price before paying.');
    const amount=money(row.amountPaisa!,'Payment allocation');
    if(amount<=0||amount>(outstanding.monetaryDuePaisa??0))throw new Error('Payment exceeds source due.');
    if(row.baseQty!==undefined)throw new Error('Cash payment does not return physical goods.');
    sumPaisa+=amount;
   }else{
    const count=qty(row.baseQty??0);
    if(count>linked.baseQty-outstanding.returnedBaseQty)
     throw new Error('Cannot return more stock than sourced.');
    const receivingBack=cmd.kind==='receive-goods';
    const physicallyAvailable=next.inventory?.[linked.productId]??0;
    if(!receivingBack&&physicallyAvailable<count)throw new Error('Insufficient owned stock to return to Vendor.');
    const prePricedReturn=linked.unitCostBasePaisa===null;
    const amount=prePricedReturn?0:amountFor(count,linked.unitCostBasePaisa!);
    if(!prePricedReturn && amount>(outstanding.monetaryDuePaisa??0))
     throw new Error('Return exceeds remaining monetary due.');
    if(row.amountPaisa!==null && row.amountPaisa!==amount)
     throw new Error('Returned goods value must match source unit price.');
    if(next.inventory)next.inventory[linked.productId]=physicallyAvailable+(receivingBack?count:-count);
    sumPaisa+=amount;
    if(prePricedReturn&&count===outstanding.unpricedBaseQty)
     next.sources=next.sources.map(s=>s.id===linked.id?{...s,pricingStatus:'closed'}:s);
   }
  }
  if(moneyKind){
   if(cmd.amountPaisa!==sumPaisa||sumPaisa<=0)throw new Error('Payment split/allocations total mismatch.');
   const splits=cmd.paymentSplits??[];
   if(!splits.length)throw new Error('Choose a payment source.');
   const ids=new Set<string>();
   let tally=0;
   for(const split of splits){
    if(ids.has(split.id))throw new Error('Duplicate payment split.');
    ids.add(split.id);
    if(!split.accountId.trim())throw new Error('Payment account is required.');
    if(!['Cash','Bank','Mobile Banking'].includes(split.method))throw new Error('Invalid payment method.');
    tally+=money(split.amountPaisa,'Payment split');
   }
   if(tally!==sumPaisa)throw new Error('Payment split total mismatch.');
  }
  const settled={id:'vendor-settlement:'+cmd.operationId,vendorPartyId:cmd.vendorPartyId,
   side:cmd.side,kind:cmd.kind,date:cmd.date,amountPaisa:moneyKind?sumPaisa:sumPaisa||null,
   allocations:cmd.allocations.map(a=>({...a})),paymentSplits:cmd.paymentSplits,
   reason:cmd.reason,status:'Active' as const,operationId:cmd.operationId};
  next.settlements.push(settled);
  next.events.push({id:'vendor-event:'+cmd.operationId,vendorPartyId:cmd.vendorPartyId,
    side:cmd.side,kind:'settlement',sourceId:cmd.allocations.length===1?cmd.allocations[0].sourceId:undefined,
    date:cmd.date,sequence:next.events.length+1,deltaPaisa:-sumPaisa,operationId:cmd.operationId,
    description:moneyKind?'Vendor money settlement · demo':'Matching goods returned · demo',
    status:'Active'});
  next.sources=next.sources.map(src=>{
   if(!seen.has(src.id)||src.pricingStatus==='closed')return src;
   const out=sourceOutstanding(next,src.id);
   return out.unpricedBaseQty===0&&out.monetaryDuePaisa===0
     ?{...src,pricingStatus:'closed'}:src;
  });
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
 const beforePricingReturns=priced?Math.max(0,s.baseQty-(s.pricedBaseQty??s.baseQty)):0;
 const afterPricingReturns=priced?Math.max(0,returnedBaseQty-beforePricingReturns):0;
 const discountedReturn=priced?Math.round(afterPricingReturns*s.unitCostBasePaisa!):0;
 const settledCash=rows.filter(row=>row.kind==='pay'||row.kind==='receive-money')
 .flatMap(row=>row.allocations.filter(a=>a.sourceId===sourceId).map(a=>a.amountPaisa??0))
 .reduce((a,b)=>a+b,0);
 const due=priced?Math.max(0,s.sourceAmountPaisa!-discountedReturn-settledCash):null;
 return {unpricedBaseQty:priced?0:remaining,pricedBaseQty:priced?Math.max(0,(s.pricedBaseQty??s.baseQty)-afterPricingReturns):0,
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
