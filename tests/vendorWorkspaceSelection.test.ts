import test from 'node:test';
import assert from 'node:assert/strict';
import {selectVendorSource} from '../src/vendor/vendorWorkspaceSelection.ts';
import type {VendorPreviewState,VendorSource} from '../src/vendor/vendorTypes.ts';

const source=(id:string,vendorPartyId:string,sourceKind:'sourcing'|'issue',
 price:number|null,amount:number|null,status:'Active'|'Reversed'='Active'):VendorSource=>({
 id,vendorPartyId,sourceKind,productId:'bulb',baseQty:10,unitCostBasePaisa:price,
 sourceAmountPaisa:amount,pricingStatus:price===null?'unpriced':'priced',
 date:'2026-10-11',status
});
const snapshot=(sources:VendorSource[]):VendorPreviewState=>({
 parties:[{id:'v1',roles:['Vendor']},{id:'v2',roles:['Vendor']}],
 sources,settlements:[],events:[],openings:[],sales:[],operations:[],revision:1
});

test('explicit source must belong to the chosen Vendor and kind',()=>{
 const s=[source('foreign','v2','sourcing',100,1000),source('issued','v1','issue',100,1000),
 source('received','v1','sourcing',100,1000)];
 const state=snapshot(s);
 assert.equal(selectVendorSource(s,state,'v1','sourcing','received')?.id,'received');
 assert.equal(selectVendorSource(s,state,'v1','sourcing','foreign')?.id,'received');
 assert.equal(selectVendorSource(s,state,'v1','sourcing','issued')?.id,'received');
});
test('unpriced outstanding is actionable but settled records are read only fallback',()=>{
 const s=[source('settled','v1','sourcing',100,0),source('unpriced','v1','sourcing',null,null)];
 const state=snapshot(s);
 state.settlements.push({id:'st',vendorPartyId:'v1',side:'payable',kind:'pay',
 date:'2026-10-11',amountPaisa:0,allocations:[{sourceId:'settled',amountPaisa:0}],
 status:'Active',operationId:'op'});
 // State has a zero-amount priced memo, then an unpriced actionable memo.
 assert.equal(selectVendorSource(s,state,'v1','sourcing')?.id,'unpriced');
 assert.equal(selectVendorSource([s[0]],snapshot([s[0]]),'v1','sourcing')?.id,'settled');
});
test('reversed and missing sources are never selected',()=>{
 const s=[source('rev','v1','sourcing',100,1000,'Reversed')];
 assert.equal(selectVendorSource(s,snapshot(s),'v1','sourcing','rev'),null);
 assert.equal(selectVendorSource([],snapshot([]),'v1','issue'),null);
});