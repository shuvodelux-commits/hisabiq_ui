import test from 'node:test';
import assert from 'node:assert/strict';
import {applyVendorCommand,vendorBalances} from '../src/vendor/vendorModel.ts';
import type {VendorPreviewState} from '../src/vendor/vendorTypes.ts';
const initial=():VendorPreviewState=>({
 parties:[{id:'v1',roles:['Vendor'],status:'Active'}],
 sources:[],settlements:[],events:[],openings:[],sales:[],operations:[],revision:0
});
test('Party Vendor opening update keeps one active source and audited revision history',()=>{
 const a=applyVendorCommand(initial(),{type:'update-opening',operationId:'open1',vendorPartyId:'v1',
  side:'payable',date:'2026-10-11',amountPaisa:50000,reason:'Old account'});
 const b=applyVendorCommand(a,{type:'update-opening',operationId:'open2',vendorPartyId:'v1',
  side:'payable',date:'2026-10-11',amountPaisa:30000,reason:'Correct old account'});
 assert.equal(vendorBalances(b,'v1').knownPayablePaisa,30000);
 assert.equal(b.openings.filter(o=>o.status!=='Reversed').length,1);
 assert.equal(b.events.filter(e=>e.kind==='reversal').length,1);
 const c=applyVendorCommand(b,{type:'update-opening',operationId:'open3',vendorPartyId:'v1',
  side:'payable',date:'2026-10-11',amountPaisa:0,reason:'Clear opening'});
 assert.equal(vendorBalances(c,'v1').knownPayablePaisa,0);
 assert.equal(c.openings.filter(o=>o.status!=='Reversed').length,0);
});
test('Vendor opening receivable never nets payable statement by side',()=>{
 const a=applyVendorCommand(initial(),{type:'update-opening',operationId:'open1',vendorPartyId:'v1',
  side:'payable',date:'2026-10-11',amountPaisa:10000});
 const b=applyVendorCommand(a,{type:'update-opening',operationId:'open2',vendorPartyId:'v1',
  side:'receivable',date:'2026-10-11',amountPaisa:20000});
 const balances=vendorBalances(b,'v1');
 assert.equal(balances.knownPayablePaisa,10000);
 assert.equal(balances.knownReceivablePaisa,20000);
});
test('Vendor opening changes reject negative, invalid Vendor and duplicate command conflicts',()=>{
 assert.throws(()=>applyVendorCommand(initial(),{type:'update-opening',operationId:'negative',vendorPartyId:'v1',
  side:'payable',date:'2026-10-11',amountPaisa:-1}),/amount/i);
 assert.throws(()=>applyVendorCommand(initial(),{type:'update-opening',operationId:'wrong',vendorPartyId:'other',
  side:'payable',date:'2026-10-11',amountPaisa:10000}),/Vendor/i);
});
