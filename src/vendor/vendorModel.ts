import type {
 VendorBalances, VendorLedgerEvent, VendorPreviewCommand, VendorPreviewState,
 VendorSource, VendorSourceInput, VendorOutstanding, VendorSide
} from './vendorTypes.ts';
import {vendorCorrectionImpact} from './vendorCorrection.ts';

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
const extended=(state:VendorPreviewState,operationId:string):VendorPreviewState|null=>{
 if(!operationId.trim())throw new Error('Operation ID is required.');
 if(state.operations.includes(operationId))return null;
 return {parties:state.parties, sources:[...state.sources],
   settlements:[...state.settlements],events:[...state.events],
   openings:[...state.openings],sales:[...state.sales],
   operations:[...state.operations,operationId],revision:state.revision+1,
   inventory:state.inventory?{...state.inventory}:undefined,
   operationPayloads:state.operationPayloads?{...state.operationPayloads}:{},
   recordedPurchaseIds:[...(state.recordedPurchaseIds??[])]};
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

const finish=(next:VendorPreviewState,command:VendorPreviewCommand):VendorPreviewState=>{
 next.operationPayloads={...next.operationPayloads,[command.operationId]:JSON.stringify(command)};
 return next;
};
const activeSourceSettlements=(state:VendorPreviewState,sourceId:string)=>
 state.settlements.filter(t=>t.status==='Active'&&t.allocations.some(a=>a.sourceId===sourceId));

/** Appends a compensating audit event; never silently deletes original history. */
function reverseVendorEvent(
 original:VendorPreviewState,next:VendorPreviewState,
 target:VendorLedgerEvent,
 command:{operationId:string;vendorPartyId:string;date:string;reason:string;actor:string}
):void{
 if(!command.reason?.trim())throw new Error('Correction reason is required.');
 if(!command.actor?.trim())throw new Error('Correction actor is required.');
 if(!goodDate(command.date)||command.date<target.date)throw new Error('Invalid reversal date.');
 if(target.vendorPartyId!==command.vendorPartyId)throw new Error('Wrong Vendor for this reversal.');
 if(target.kind==='reversal'||original.events.some(e=>e.kind==='reversal'&&e.reversesEventId===target.id))
  throw new Error('Vendor event is already reversed or cannot reverse a reversal.');
 if(!['settlement','sourcing','issue','pricing','opening'].includes(target.kind))
  throw new Error('Unsupported source event type for reversal.');
 if(target.kind==='settlement'){
  const settlement=original.settlements.find(t=>t.operationId===target.operationId
   &&t.vendorPartyId===command.vendorPartyId&&t.status==='Active');
  if(!settlement)throw new Error('Linked settlement was already reversed.');
  for(const allocation of settlement.allocations){
   const linked=original.sources.find(s=>s.id===allocation.sourceId&&s.status==='Active');
   if(!linked)throw new Error('Linked Vendor source missing: review before reversal.');
   if(settlement.kind==='return-to-vendor'||settlement.kind==='receive-goods'){
    if(!next.inventory)throw new Error('Demo inventory is unavailable for stock reversal.');
    const quantity=allocation.baseQty??0;
    const available=next.inventory[linked.productId]??0;
    const offset=settlement.kind==='return-to-vendor'?quantity:-quantity;
    if(available+offset<0)throw new Error('Cannot reverse goods receipt; owned stock already used.');
    next.inventory[linked.productId]=available+offset;
   }
  }
  next.settlements=next.settlements.map(t=>t.id===settlement.id?{...t,status:'Reversed' as const}:t);
  // Reopen settled sources based on their remaining quantity / money.
  next.sources=next.sources.map(src=>{
   if(!settlement.allocations.some(a=>a.sourceId===src.id)||src.status==='Reversed')return src;
   const remaining=sourceOutstanding(next,src.id);
   const pricingStatus=src.unitCostBasePaisa===null
    ?(remaining.unpricedBaseQty>0?'unpriced':'closed')
    :((remaining.monetaryDuePaisa??0)>0?'priced':'closed');
   return {...src,pricingStatus};
  });
 }else if(target.kind==='opening'){
  const opening=original.openings.find(o=>o.operationId===target.operationId
   &&o.vendorPartyId===command.vendorPartyId&&o.side===target.side&&o.status!=='Reversed');
  if(!opening)throw new Error('Opening balance already reversed.');
  next.openings=next.openings.map(o=>o.id===opening.id?{...o,status:'Reversed' as const}:o);
 }else{
  const linked=original.sources.find(t=>t.id===target.sourceId&&t.vendorPartyId===command.vendorPartyId
   &&t.status==='Active');
  if(!linked)throw new Error('Active Vendor source not found.');
  const dependencies=activeSourceSettlements(original,linked.id);
  if(dependencies.length)throw new Error('Reverse linked settlement(s) before editing or reversing this source.');
  if(target.kind==='pricing'){
   if(linked.unitCostBasePaisa===null)throw new Error('Source price already unconfirmed.');
   next.sources=next.sources.map(t=>t.id===linked.id?{...t,
    unitCostBasePaisa:null,sourceAmountPaisa:null,pricedBaseQty:undefined,
    pricingStatus:sourceOutstanding(original,t.id).returnedBaseQty>=t.baseQty?'closed' as const:'unpriced' as const}:t);
  }else{
   const impact=vendorCorrectionImpact(original,linked.id);
   if(!impact.reversible)throw new Error(impact.blocker??'Source correction is blocked.');
   if(target.kind==='issue'&&next.inventory){
    next.inventory[linked.productId]=(next.inventory[linked.productId]??0)+linked.baseQty;
   }
   next.sources=next.sources.map(t=>t.id===linked.id?{...t,status:'Reversed' as const}:t);
  }
 }
 next.events.push({
  id:'vendor-event:'+command.operationId+':reversal',
  vendorPartyId:command.vendorPartyId,side:target.side,kind:'reversal',
  sourceId:target.sourceId,reference:target.reference,date:command.date,
  sequence:next.events.length+1,deltaPaisa:-target.deltaPaisa,
  operationId:command.operationId,description:'Reversal of '+target.kind+' · '+command.reason.trim(),
  status:'Active',actor:command.actor.trim(),reason:command.reason.trim(),reversesEventId:target.id
 });
}

/** Pure single-command transition: validates every input before producing a new snapshot. */
export function applyVendorCommand(state:VendorPreviewState,cmd:VendorPreviewCommand):VendorPreviewState {
 if(state.operations.includes(cmd.operationId)){
  const prior=state.operationPayloads?.[cmd.operationId];
  if(prior&&prior!==JSON.stringify(cmd))throw new Error('Operation ID conflict: changed Vendor command payload.');
  return state;
 }
 if(!cmd.operationId.trim())throw new Error('Operation ID is required.');
 if(cmd.type==='reverse-event'){
  const target=state.events.find(e=>e.id===cmd.eventId);
  if(!target)throw new Error('Vendor event not found for reversal.');
  const next=extended(state,cmd.operationId)!;
  reverseVendorEvent(state,next,target,cmd);
  return finish(next,cmd);
 }
 if(cmd.type==='correct-source'){
  ensureVendor(state,cmd.vendorPartyId);
  const original=state.sources.find(t=>t.id===cmd.sourceId&&t.vendorPartyId===cmd.vendorPartyId
   &&t.status==='Active');
  if(!original)throw new Error('Active Vendor source not found.');
  const target=state.events.find(e=>e.sourceId===original.id&&e.kind===original.sourceKind
   &&e.vendorPartyId===cmd.vendorPartyId
   &&!state.events.some(r=>r.kind==='reversal'&&r.reversesEventId===e.id));
  if(!target)throw new Error('Original Vendor source audit event missing.');
  if(!cmd.replacement.id||cmd.replacement.id===original.id)
   throw new Error('Correction requires a new source ID.');
  if(original.sourceInvoiceId&&cmd.replacement.productId!==original.productId)
   throw new Error('Linked sale product cannot change during Vendor correction; review the sale invoice first.');
  if(original.sourceInvoiceId && cmd.replacement.sourceInvoiceId
   &&original.sourceInvoiceId!==cmd.replacement.sourceInvoiceId)
   throw new Error('Cannot change the linked sale invoice during source correction.');
  const next=extended(state,cmd.operationId)!;
  reverseVendorEvent(state,next,target,cmd);
  const corrected=source(next,cmd.vendorPartyId,original.sourceKind,{
    ...cmd.replacement,
    sourceInvoiceId:original.sourceInvoiceId??cmd.replacement.sourceInvoiceId,
    sourceSaleLineId:original.sourceSaleLineId??cmd.replacement.sourceSaleLineId
  });
  corrected.correctsSourceId=original.id;
  if(corrected.sourceKind==='issue'&&next.inventory){
   const available=next.inventory[corrected.productId]??0;
   if(available<corrected.baseQty)throw new Error('Insufficient owned stock for corrected Vendor issue.');
   next.inventory[corrected.productId]=available-corrected.baseQty;
  }
  next.sources.push(corrected);
  next.events.push({...event(next,corrected,cmd.operationId),
   id:'vendor-event:'+cmd.operationId+':replacement',
   sequence:next.events.length+1,actor:cmd.actor.trim(),
   reason:cmd.reason.trim(),description:'Corrected '+corrected.sourceKind+' · '+(corrected.reference??corrected.id)});
  return finish(next,cmd);
 }
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
  return finish(next,cmd);
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
  return finish(next,cmd);
 }
 if(cmd.type==='record-purchase-inventory'){
  if(!cmd.purchaseId.trim()||!cmd.lines.length)throw new Error('Purchase reference and product lines required.');
  if(state.recordedPurchaseIds?.includes(cmd.purchaseId))throw new Error('Purchase already received in Vendor demo inventory.');
  const next=extended(state,cmd.operationId)!;
  if(!next.inventory)next.inventory={};
  for(const line of cmd.lines){
   if(!line.productId.trim())throw new Error('Purchase product is required.');
   qty(line.baseQty);
   next.inventory[line.productId]=(next.inventory[line.productId]??0)+line.baseQty;
  }
  next.recordedPurchaseIds!.push(cmd.purchaseId);
  return finish(next,cmd);
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
  return finish(next,cmd);
 }
 if(cmd.type==='set-opening'){
  money(cmd.amountPaisa,'Opening amount');
  if(!goodDate(cmd.date))throw new Error('Invalid opening date.');
  if(state.openings.some(o=>o.vendorPartyId===cmd.vendorPartyId&&o.side===cmd.side&&o.status!=='Reversed'))
   throw new Error('Opening exists; correct using an audited replacement.');
  const next=extended(state,cmd.operationId)!;
  next.openings.push({id:'vendor-opening:'+cmd.operationId,vendorPartyId:cmd.vendorPartyId,
   side:cmd.side,openingAmountPaisa:cmd.amountPaisa,date:cmd.date,
   reason:cmd.reason,operationId:cmd.operationId});
  next.events.push({id:'vendor-event:'+cmd.operationId,vendorPartyId:cmd.vendorPartyId,
   side:cmd.side,kind:'opening',date:cmd.date,sequence:state.events.length+1,
   deltaPaisa:cmd.amountPaisa,description:'Opening balance (non-cash)',
   operationId:cmd.operationId,status:'Active'});
  return finish(next,cmd);
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
    pricedBaseQty:remaining,pricingStatus:'priced' as const});
  next.events.push({id:'vendor-event:'+cmd.operationId,vendorPartyId:cmd.vendorPartyId,
   side:'payable',kind:'pricing',sourceId:existing.id,reference:existing.reference,
   date:cmd.date,sequence:next.events.length+1,deltaPaisa:amount,operationId:cmd.operationId,
   description:'Vendor price confirmed after sale · demo',status:'Active'});
  return finish(next,cmd);
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
     next.sources=next.sources.map(s=>s.id===linked.id?{...s,pricingStatus:'closed' as const}:s);
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
  return finish(next,cmd);
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
