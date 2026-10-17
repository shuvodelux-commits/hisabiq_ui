import type {Product,SaleStockSource,StockLot} from '../types/erp.ts';
import {allocatableLots} from '../utils/productFeatures.ts';
import {allocatePosStock} from '../vendor/vendorStock.ts';
import type {BundleComponentDemand} from './bundleCart.ts';

export type ComponentSourceKey = string;
/** Keyed by source cart line AND physical component; choices never authorize other lines. */
export const componentSourceKey=(lineKey:string,productId:string):ComponentSourceKey=>lineKey+':'+productId;
export type ComponentChoices={
 sources?:Readonly<Record<ComponentSourceKey,SaleStockSource>>;
 serials?:Readonly<Record<ComponentSourceKey,readonly string[]>>;
 soldSerials?:readonly string[];
};
export type FulfillmentRow={
 sourceLineKey:string;componentProductId:string;requiredBaseQty:number;ownBaseQty:number;
 shortageBaseQty:number;vendorBaseQty:number;negativeBaseQty:number;source?:SaleStockSource;
};
/**
 * Pure preview only. Uses the same net-stock reservation as POS and real eligible
 * purchase/opening lots. Never modifies a lot, issues a serial or posts an invoice.
 */
export function planComponentFulfillment(
 demands:readonly BundleComponentDemand[],catalog:readonly Product[],lots:readonly StockLot[],
 choices:ComponentChoices={},now:Date=new Date()
):{
 rows:readonly FulfillmentRow[];
 allocations:readonly {sourceLineKey:string;productId:string;lotId:string;quantity:number;unitCost:number}[];
 serialAllocations:readonly {sourceLineKey:string;productId:string;lotId:string;serial:string}[];
 errors:readonly string[];
 estimatedCostKnown:boolean;
}{
 const errors:string[]=[];
 const rows:FulfillmentRow[]=[];
 const sourceFor=(d:BundleComponentDemand)=>choices.sources?.[componentSourceKey(d.sourceLineKey,d.componentProductId)];
 const requestKeys=new Set<string>();
 for(const d of demands){
  const k=componentSourceKey(d.sourceLineKey,d.componentProductId);
  if(requestKeys.has(k))errors.push('Duplicate component cart demand: '+k);
  requestKeys.add(k);
  const p=catalog.find(x=>x.id===d.componentProductId);
  if(!p||p.kind==='Bundle'||p.kind==='Service'||!p.active)
   errors.push('Missing or inactive Stock component: '+d.componentProductId);
  if(!Number.isFinite(d.requiredBaseQty)||d.requiredBaseQty<=0)
   errors.push('Invalid component quantity: '+k);
  const source=sourceFor(d);
  if(source?.mode==='Vendor'&&(!source.vendorId.trim()||!source.vendorName.trim()||
   (source.unitCost!==null&&(!Number.isFinite(source.unitCost)||source.unitCost<=0))))
   errors.push('Choose a valid Vendor and cost or leave the cost pending: '+k);
 }
 if(errors.length)return {rows:[],allocations:[],serialAllocations:[],errors,estimatedCostKnown:false};
 const plans=allocatePosStock(demands.map(d=>({
  key:componentSourceKey(d.sourceLineKey,d.componentProductId),
  product:catalog.find(p=>p.id===d.componentProductId)!,
  requestedBaseQty:d.requiredBaseQty,
  choice:sourceFor(d)
 })),[...lots],now);
 const reserved=new Map<string,number>();
 const usedSerials=new Set((choices.soldSerials??[]).map(s=>s.toLocaleLowerCase()));
 const allocations:{sourceLineKey:string;productId:string;lotId:string;quantity:number;unitCost:number}[]=[];
 const serialAllocations:{sourceLineKey:string;productId:string;lotId:string;serial:string}[]=[];
 let estimatedCostKnown=true;
 for(const [i,d] of demands.entries()){
  const p=catalog.find(p=>p.id===d.componentProductId)!;
  const plan=plans[i],source=sourceFor(d),key=componentSourceKey(d.sourceLineKey,d.componentProductId);
  const shortageBaseQty=Math.max(0,d.requiredBaseQty-plan.ownBaseQty);
  const row:FulfillmentRow={
   sourceLineKey:d.sourceLineKey,componentProductId:d.componentProductId,requiredBaseQty:d.requiredBaseQty,
   ownBaseQty:plan.ownBaseQty,shortageBaseQty,vendorBaseQty:plan.vendorBaseQty,
   negativeBaseQty:plan.negativeBaseQty,...(source?{source}:{})
  };
  rows.push(row);
  if(plan.needsSourceBaseQty>1e-7)errors.push('Component stock shortage: '+p.name+' · '+plan.needsSourceBaseQty);
  if(source?.mode==='Vendor'&&source.unitCost===null&&shortageBaseQty>0)estimatedCostKnown=false;
  if(source?.mode==='Negative'&&shortageBaseQty>0)estimatedCostKnown=false;
  const expected=plan.ownBaseQty;
  const chosen=choices.serials?.[key]??[];
  const seenHere=new Set<string>();
  if(p.serialTracking==='Required'){
   if(!Number.isInteger(expected)||chosen.length!==expected)
    errors.push('Required component serials: '+p.name+' · '+chosen.length+'/'+expected);
   if(shortageBaseQty>1e-7)errors.push('Serial-required component cannot use unassigned Negative or Vendor units: '+p.name);
  }
  if(chosen.length>Math.ceil(expected)||chosen.some(serial=>!serial.trim())){
   errors.push('Too many or empty selected serials: '+p.name);
  }
  const productLots=allocatableLots(p,[...lots],now);
  const serialTakes=new Map<string,number>();
  for(const serial of chosen){
   const lower=serial.trim().toLocaleLowerCase();
   if(seenHere.has(lower)||usedSerials.has(lower)){errors.push('Duplicate or previously sold component serial: '+serial);continue;}
   seenHere.add(lower);
   const lot=productLots.find(lot=>lot.serials?.some(s=>s.trim().toLocaleLowerCase()===lower)&&
    lot.available-(reserved.get(lot.id)??0)-(serialTakes.get(lot.id)??0)>0);
   if(!lot){errors.push('Unstocked, expired or already allocated component serial: '+serial);continue;}
   if(!Number.isFinite(lot.unitCost)||lot.unitCost<0)errors.push('Unknown component lot cost: '+p.name);
   serialTakes.set(lot.id,(serialTakes.get(lot.id)??0)+1);
   serialAllocations.push({sourceLineKey:d.sourceLineKey,productId:p.id,lotId:lot.id,serial});
   usedSerials.add(lower);
  }
  let left=Math.max(0,expected);
  // Allocate selected serials to their actual lots before filling non-serial units.
  for(const [lotId,quantity] of serialTakes){
   const lot=productLots.find(l=>l.id===lotId)!;
   allocations.push({sourceLineKey:d.sourceLineKey,productId:p.id,lotId,quantity,unitCost:lot.unitCost});
   reserved.set(lotId,(reserved.get(lotId)??0)+quantity);
   left-=quantity;
  }
  for(const lot of productLots){
   if(left<=1e-7)break;
   const physical=Math.max(0,lot.available-(reserved.get(lot.id)??0));
   const take=Math.min(left,physical);
   if(take<=0)continue;
   if(!Number.isFinite(lot.unitCost)||lot.unitCost<0){errors.push('Unknown component lot cost: '+p.name);break;}
   allocations.push({sourceLineKey:d.sourceLineKey,productId:p.id,lotId:lot.id,quantity:take,unitCost:lot.unitCost});
   reserved.set(lot.id,(reserved.get(lot.id)??0)+take);
   left-=take;
  }
  if(left>1e-7)errors.push('Own lot stock changed or serial allocation unavailable: '+p.name);
 }
 // A single failure voids all draft reservations; return never implies stock was posted.
 if(errors.length)return {rows,allocations:[],serialAllocations:[],errors,estimatedCostKnown:false};
 return {rows,allocations,serialAllocations,errors:[],estimatedCostKnown};
}

/** Max whole bundle Sets after keeping every other cart line's demand unchanged. */
export function maxAffordableBundleSets(
 lineKey:string,demands:readonly BundleComponentDemand[],catalog:readonly Product[],
 lots:readonly StockLot[],now:Date=new Date()
):number{
 const own=demands.filter(d=>d.sourceLineKey===lineKey&&d.bundleProductId);
 const sets=own[0]?.bundleSets;
 if(!sets||!Number.isSafeInteger(sets)||sets<1||own.some(d=>d.bundleSets!==sets))return 0;
 let cap=sets;
 for(const part of own){
  const p=catalog.find(x=>x.id===part.componentProductId);
  if(!p)return 0;
  const available=Math.max(0,Math.min(p.stock,
   allocatableLots(p,[...lots],now).reduce((s,lot)=>s+lot.available,0)));
  const others=demands.filter(d=>d.sourceLineKey!==lineKey&&d.componentProductId===p.id)
   .reduce((s,d)=>s+d.requiredBaseQty,0);
  if(others>available+1e-7)return 0;
  const perSet=part.requiredBaseQty/sets;
  if(!Number.isFinite(perSet)||perSet<=0)return 0;
  cap=Math.min(cap,Math.floor((available-others)/perSet+1e-9));
 }
 return Math.max(0,cap);
}
