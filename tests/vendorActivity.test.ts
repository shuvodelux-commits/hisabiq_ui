import test from 'node:test';
import assert from 'node:assert/strict';
import {applyVendorCommand} from '../src/vendor/vendorModel.ts';
import {projectVendorActivity} from '../src/vendor/vendorActivity.ts';
import type {VendorPreviewState} from '../src/vendor/vendorTypes.ts';
import type {Purchase} from '../src/types/erp.ts';
const fresh=():VendorPreviewState=>({parties:[{id:'v1',roles:['Vendor'],status:'Active'}],sources:[],
 settlements:[],events:[],openings:[],sales:[],operations:[],revision:0,inventory:{p1:8}});
const bought={id:'pu-1',ref:'PUR-111',date:'10 Oct 2026',supplierId:'v1',supplier:'Nearby Shop',
 items:'Pipe 10 Pcs',total:2000,paid:1200} as Purchase;
test('unpriced Vendor sourcing remains visible in All Activity with no fabricated zero amount',()=>{
 let s=applyVendorCommand(fresh(),{type:'record-sourcing',operationId:'borrow',
  vendorPartyId:'v1',source:{id:'src1',productId:'p1',baseQty:3,
  unitCostBasePaisa:null,date:'2026-10-09',reference:'INV-9'}});
 const rows=projectVendorActivity(s,'v1',[],{from:'',to:''});
 assert.equal(rows.length,1);
 assert.equal(rows[0].kind,'sourcing');
 assert.equal(rows[0].moneyPaisa,null);
 assert.equal(rows[0].bucket,'vendor-payable');
 assert.equal(rows[0].description.includes('Price pending'),true);
 s=applyVendorCommand(s,{type:'reverse-event',operationId:'reverse',
  vendorPartyId:'v1',eventId:'vendor-event:borrow',actor:'Demo',reason:'Wrong sale source',date:'2026-10-10'});
 const audit=projectVendorActivity(s,'v1',[],{from:'',to:''});
 assert.equal(audit.length,2);
 assert.equal(audit.filter(r=>r.kind==='reversal').length,1);
 assert.equal(audit.find(r=>r.kind==='sourcing')?.reversed,true);
 assert.ok(audit.every(r=>r.moneyPaisa===null));
});
test('same Vendor Party shows ordinary Purchase as separate bucket without netting Vendor sourced debt',()=>{
 const s=applyVendorCommand(fresh(),{type:'record-sourcing',operationId:'priced',
 vendorPartyId:'v1',source:{id:'src1',productId:'p1',baseQty:2,
 unitCostBasePaisa:10000,date:'2026-10-09'}});
 const rows=projectVendorActivity(s,'v1',[bought],{from:'',to:''});
 assert.equal(rows.length,3);
 assert.equal(rows.filter(r=>r.bucket==='vendor-payable').length,1);
 assert.equal(rows.filter(r=>r.bucket==='supplier-purchase').length,2);
 assert.equal(rows.find(r=>r.kind==='purchase')?.moneyPaisa,200000);
 assert.equal(rows.find(r=>r.kind==='purchase-payment')?.moneyPaisa,-120000);
 assert.equal(rows.find(r=>r.kind==='sourcing')?.moneyPaisa,20000);
});
test('date filters apply to purchase and sources without hiding previous-date audit history',()=>{
 const s=applyVendorCommand(fresh(),{type:'record-sourcing',operationId:'borrow',
  vendorPartyId:'v1',source:{id:'src1',productId:'p1',baseQty:3,
   unitCostBasePaisa:null,date:'2026-10-09'}});
 assert.deepEqual(projectVendorActivity(s,'v1',[bought],{from:'2026-10-10',to:'2026-10-10'})
   .map(row=>row.kind),['purchase','purchase-payment']);
 assert.equal(projectVendorActivity(s,'v1',[{...bought,supplierId:'s1'}],{from:'',to:''}).length,1);
});
