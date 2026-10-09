import type {Product,StockLot,StockMovement} from '../types/erp.ts';
import type {ImportResult} from '../import/importTypes.ts';
import type {ProductImportPlan} from '../import/productImport.ts';
import {products as seedProducts} from './products.ts';
import {stockLots as seedLots,stockMovements as seedMovements} from './productInventory.ts';

export type ProductImportPreviewSnapshot={
 revision:number;appliedSessionIds:readonly string[];
 products:readonly Product[];lots:readonly StockLot[];movements:readonly StockMovement[];
};
/** Design-preview module singleton, never a tenant or server data source. */
let snapshot:ProductImportPreviewSnapshot={
 revision:0,appliedSessionIds:[],products:seedProducts.map(p=>({...p})),
 lots:seedLots.map(l=>({...l})),movements:seedMovements.map(m=>({...m}))
};
const listeners=new Set<()=>void>();
const results=new Map<string,ImportResult>();
export const getProductImportPreviewSnapshot=():ProductImportPreviewSnapshot=>snapshot;
export function subscribeProductImportPreview(listener:()=>void):()=>void {
 listeners.add(listener);return ()=>{listeners.delete(listener);};
}
function publish(next:ProductImportPreviewSnapshot):void {
 snapshot=next;for(const listener of listeners)listener();
}
const skuKey=(sku:string)=>sku.trim().toLocaleUpperCase();
/** Single, validated all-or-nothing write. No mutation or notification on failure. */
export function commitProductImportPreview(plan:ProductImportPlan):ImportResult {
 const prior=results.get(plan.sessionId);if(prior)return prior;
 if(!plan.sessionId.trim())throw new Error('An import session ID is required.');
 if(plan.baseRevision!==snapshot.revision)throw new Error('Product preview changed. Reopen Review before importing.');
 if(plan.issues.some(issue=>issue.severity==='error'))throw new Error('Resolve or skip invalid product rows before importing.');
 if(!plan.creates.length&&!plan.updates.length)throw new Error('No products selected to import.');
 const products=snapshot.products.map(p=>({...p}));
 const lots=snapshot.lots.map(l=>({...l,serials:l.serials?[...l.serials]:undefined}));
 const movements=snapshot.movements.map(m=>({...m}));
 const skus=new Set(products.map(p=>skuKey(p.sku)));
 const ids=new Set(products.map(p=>p.id));
 const lotIds=new Set(lots.map(l=>l.id));
 const movementIds=new Set(movements.map(m=>m.id));
 const serials=new Set(lots.flatMap(l=>l.serials??[]).map(s=>s.trim().toLowerCase()));
 const rows=new Set<number>();
 for(const entry of plan.creates){
  if(rows.has(entry.sourceRow))throw new Error('Duplicate source row in import.');
  rows.add(entry.sourceRow);
  const product=entry.product;
  const sku=skuKey(product.sku);
  if(!sku||skus.has(sku)||ids.has(product.id))throw new Error('Duplicate product ID or SKU: '+product.sku);
  if(!product.name.trim()||!Number.isFinite(product.sellPrice)||product.sellPrice<=0||!Number.isFinite(product.purchasePrice)||product.purchasePrice<0)throw new Error('Invalid product master data.');
  if(!Number.isFinite(product.stock)||product.stock<0||!Number.isFinite(product.minStock)||product.minStock<0)throw new Error('Invalid stock quantity.');
  if(product.altUnit&&(!Number.isFinite(product.altUnit.factor)||product.altUnit.factor<=0||product.altUnit.unit===product.unit))throw new Error('Invalid unit conversion.');
  const lot=entry.openingLot,movement=entry.openingMovement;
  if(Boolean(lot)!==Boolean(movement))throw new Error('Opening lot and movement must be paired.');
  if(product.kind==='Service'&&(product.stock||lot||movement))throw new Error('A service cannot have opening stock.');
  if(product.stock>0&&!lot)throw new Error('Opening stock requires one lot and one movement.');
  if(product.stock===0&&(lot||movement))throw new Error('Zero opening stock must not generate a lot.');
  if(lot&&movement){
   if(lotIds.has(lot.id)||movementIds.has(movement.id))throw new Error('Duplicate opening inventory ID.');
   if(lot.productId!==product.id||movement.productId!==product.id||
      lot.source!=='Opening'||movement.type!=='Opening'||lot.receivedAt!==movement.date||
      lot.quantity!==product.stock||lot.available!==product.stock||
      movement.quantity!==product.stock||movement.balance!==product.stock||
      lot.reference!==movement.reference||!Number.isFinite(lot.unitCost)||lot.unitCost<0)
    throw new Error('Opening stock lot/movement mismatch.');
   for(const value of lot.serials??[]){
    const serial=value.trim().toLowerCase();
    if(!serial||serials.has(serial))throw new Error('Duplicate opening serial: '+value);
    serials.add(serial);
   }
   lotIds.add(lot.id);movementIds.add(movement.id);
   lots.unshift({...lot,serials:lot.serials?[...lot.serials]:undefined});
   movements.unshift({...movement});
  }
  skus.add(sku);ids.add(product.id);products.unshift({...product});
 }
 const allowed=new Set(['name','nameBn','category','brand','sellPrice','purchasePrice','minStock','active']);
 for(const entry of plan.updates){
  if(rows.has(entry.sourceRow))throw new Error('Duplicate source row in import.');
  rows.add(entry.sourceRow);
  const index=products.findIndex(product=>product.id===entry.productId);
  if(index<0)throw new Error('Update product no longer exists.');
  if(Object.keys(entry.patch).some(key=>!allowed.has(key)))throw new Error('Unsafe product master update.');
  const patch=entry.patch;
  if(patch.sellPrice!==undefined&&(!Number.isFinite(patch.sellPrice)||patch.sellPrice<=0))throw new Error('Invalid updated selling price.');
  if(patch.purchasePrice!==undefined&&(!Number.isFinite(patch.purchasePrice)||patch.purchasePrice<0))throw new Error('Invalid updated purchase price.');
  if(patch.minStock!==undefined&&(!Number.isFinite(patch.minStock)||patch.minStock<0))throw new Error('Invalid updated minimum stock.');
  products[index]={...products[index],...patch};
 }
 const result:ImportResult={sessionId:plan.sessionId,created:plan.creates.length,masterUpdated:plan.updates.length,
  roleAdded:0,openingSources:0,openingLots:plan.creates.filter(c=>Boolean(c.openingLot)).length,
  skipped:plan.skipped,rejected:0,errors:[]};
 publish({revision:snapshot.revision+1,appliedSessionIds:[...snapshot.appliedSessionIds,plan.sessionId],products,lots,movements});
 results.set(plan.sessionId,result);
 return result;
}
/** The manual Add/Edit screen shares the same Product projection as bulk imports. */
export function upsertProductPreview(product:Product,lot?:StockLot,movement?:StockMovement):void {
 const products=snapshot.products.filter(p=>p.id!==product.id);
 if(products.some(p=>skuKey(p.sku)===skuKey(product.sku)))throw new Error('Product SKU already exists.');
 if(Boolean(lot)!==Boolean(movement))throw new Error('Opening lot and movement must be paired.');
 if(lot&&(lot.productId!==product.id||movement?.productId!==product.id))throw new Error('Opening reference mismatch.');
 publish({revision:snapshot.revision+1,appliedSessionIds:snapshot.appliedSessionIds,
  products:[{...product},...products],lots:lot?[{...lot},...snapshot.lots]:snapshot.lots,
  movements:movement?[{...movement},...snapshot.movements]:snapshot.movements});
}
/** Keep stock corrections and manually received lots visible after Product-page navigation. */
export function updateProductInventoryPreview(product:Product,lots:readonly StockLot[],movements:readonly StockMovement[]):void {
 const products=snapshot.products.map(p=>p.id===product.id?{...product}:p);
 if(!products.some(p=>p.id===product.id))throw new Error('Product does not exist.');
 publish({revision:snapshot.revision+1,appliedSessionIds:snapshot.appliedSessionIds,
  products,lots:[...lots],movements:[...movements]});
}
