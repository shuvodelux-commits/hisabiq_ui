import test from 'node:test';
import assert from 'node:assert/strict';
import { applyVendorCommand, sourceOutstanding, vendorBalances } from '../src/vendor/vendorModel.ts';
import type { VendorPreviewState } from '../src/vendor/vendorTypes.ts';

function fresh(): VendorPreviewState {
 return {parties:[
  {id:'v1',roles:['Vendor'],status:'Active'},
  {id:'v2',roles:['Vendor','Supplier'],status:'Active'},
  {id:'v3',roles:['Vendor'],status:'Inactive'},
  {id:'s1',roles:['Supplier'],status:'Active'}
 ],sources:[],settlements:[],events:[],openings:[],sales:[],operations:[],revision:0};
}
const sourcing=(operationId:string,vendorPartyId='v1',cost:number|null=null)=>({
 type:'record-sourcing' as const,operationId,vendorPartyId,
 source:{id:'source-'+operationId,productId:'p1',baseQty:3,date:'2026-10-10',
 unitCostBasePaisa:cost,reference:'INV-123'}
});
test('unpriced POS sourcing records quantity but no fabricated payable',()=>{
 const state=applyVendorCommand(fresh(),sourcing('unpriced'));
 const b=vendorBalances(state,'v1');
 assert.equal(b.knownPayablePaisa,0);
 assert.equal(b.unpricedSourceBaseQty,3);
 assert.equal(b.unpricedSourceCount,1);
 assert.equal(state.sources[0].unitCostBasePaisa,null);
 assert.equal(state.sources[0].sourceAmountPaisa,null);
 assert.equal(sourceOutstanding(state,'source-unpriced').unpricedBaseQty,3);
 assert.equal(sourceOutstanding(state,'source-unpriced').monetaryDuePaisa,null);
});
test('known sourcing creates payable and leaves other Vendor roles separate',()=>{
 const s=applyVendorCommand(fresh(),sourcing('priced','v2',11000));
 assert.equal(vendorBalances(s,'v2').knownPayablePaisa,33000);
 assert.equal(vendorBalances(s,'v2').knownReceivablePaisa,0);
 assert.equal(vendorBalances(s,'v1').knownPayablePaisa,0);
 assert.equal(s.sources[0].sourceAmountPaisa,33000);
});
test('goods issued to Vendor creates receivable only',()=>{
 const state=applyVendorCommand(fresh(),{type:'issue-goods',operationId:'give-1',vendorPartyId:'v1',source:{
 id:'issue-1',productId:'p2',baseQty:2,unitCostBasePaisa:7000,date:'2026-10-10',reference:'V-MEMO-1'}});
 assert.equal(vendorBalances(state,'v1').knownReceivablePaisa,14000);
 assert.equal(vendorBalances(state,'v1').knownPayablePaisa,0);
});
test('opening Vendor payable and receivable never net',()=>{
 let s=applyVendorCommand(fresh(),{type:'set-opening',operationId:'open-1',vendorPartyId:'v1',side:'payable',amountPaisa:50000,date:'2026-10-01'});
 s=applyVendorCommand(s,{type:'set-opening',operationId:'open-2',vendorPartyId:'v1',side:'receivable',amountPaisa:12000,date:'2026-10-01'});
 assert.equal(vendorBalances(s,'v1').knownPayablePaisa,50000);
 assert.equal(vendorBalances(s,'v1').knownReceivablePaisa,12000);
});
test('operation retry is idempotent without revision or notifications',()=>{
 const a=applyVendorCommand(fresh(),sourcing('retry', 'v1',11000));
 assert.equal(applyVendorCommand(a,sourcing('retry','v1',11000)),a);
 assert.equal(a.revision,1);
 assert.equal(a.events.length,1);
});
test('invalid Vendor, duplicate source or bad cost reject atomically',()=>{
 const s=fresh(),before=JSON.stringify(s);
 assert.throws(()=>applyVendorCommand(s,sourcing('bad','s1',11000)),/Vendor role/i);
 assert.throws(()=>applyVendorCommand(s,sourcing('inactive','v3',11000)),/inactive/i);
 assert.throws(()=>applyVendorCommand(s,sourcing('nan','v1',NaN)),/cost/i);
 assert.throws(()=>applyVendorCommand(s,sourcing('negative','v1',-1)),/cost/i);
 assert.throws(()=>applyVendorCommand(s,{...sourcing('qty'),source:{...sourcing('qty').source,baseQty:0}}),/quantity/i);
 assert.equal(JSON.stringify(s),before);
 const done=applyVendorCommand(s,sourcing('once'));
 assert.throws(()=>applyVendorCommand(done,{...sourcing('another'),source:{...sourcing('another').source,id:'source-once'}}),/source/i);
});
