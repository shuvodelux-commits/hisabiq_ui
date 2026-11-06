import test from 'node:test';
import assert from 'node:assert/strict';
import {applyVendorCommand,sourceOutstanding,vendorBalances} from '../src/vendor/vendorModel.ts';
import {freezeUnitProfile,unitQuantitiesBase} from '../src/utils/multiUnitTransactions.ts';
import {productUnits,productUnitFactor} from '../src/utils/unitChain.ts';
import type {VendorPreviewState} from '../src/vendor/vendorTypes.ts';
import type {Product} from '../src/types/erp.ts';

const fresh=():VendorPreviewState=>({
 parties:[{id:'nearby',roles:['Vendor'],status:'Active'}],
 sources:[],settlements:[],events:[],openings:[],sales:[],operations:[],revision:0,
 inventory:{p1:300,p2:20}
});
const p:Product={
 id:'p1',name:'Bolts',sku:'P1',kind:'Stock',category:'Hardware',
 unit:'Pcs',stock:300,minStock:0,active:true,
 sellPrice:25,purchasePrice:15,altUnit:{unit:'Bag',factor:180},
 unitRelations:[{leftUnit:'Bag',rightUnit:'Box',quantity:12},{leftUnit:'Box',rightUnit:'Pcs',quantity:15}]
};

test('V2 cart uses one shared conversion profile for 3-unit quantities and selected price unit',()=>{
 assert.deepEqual(productUnits(p),['Bag','Box','Pcs']);
 const quantity=unitQuantitiesBase(freezeUnitProfile(p),{Bag:'1',Box:'2',Pcs:'5'});
 assert.equal(quantity,215);
 assert.equal(productUnitFactor(p,'Box'),15);
 assert.equal(quantity*150/15,2150,'Every line has one canonical base quantity');
});

test('V2 given memo may opt into unknown price without inventing receivable',()=>{
 const state=applyVendorCommand(fresh(),{
  type:'issue-goods-memo',operationId:'v2-given',vendorPartyId:'nearby',memoId:'V2-G1',
  date:'2026-11-06',allowUnpriced:true,sources:[
   {id:'source-1',productId:'p1',baseQty:5,unitCostBasePaisa:null,date:'2026-11-06'},
   {id:'source-2',productId:'p2',baseQty:2,unitCostBasePaisa:3500,date:'2026-11-06'}
  ]
 });
 assert.equal(state.sources.length,2);
 assert.equal(state.inventory?.p1,295);
 assert.equal(state.inventory?.p2,18);
 assert.equal(vendorBalances(state,'nearby').knownReceivablePaisa,7000);
 assert.equal(sourceOutstanding(state,'source-1').unpricedBaseQty,5);
 assert.equal(sourceOutstanding(state,'source-1').monetaryDuePaisa,null);
 assert.equal(sourceOutstanding(state,'source-2').monetaryDuePaisa,7000);
 const priced=applyVendorCommand(state,{type:'set-source-price',operationId:'v2-given-price',
  vendorPartyId:'nearby',sourceId:'source-1',date:'2026-11-06',unitCostBasePaisa:1200});
 assert.equal(vendorBalances(priced,'nearby').knownReceivablePaisa,13000);
 assert.equal(vendorBalances(priced,'nearby').knownPayablePaisa,0);
 assert.equal(sourceOutstanding(priced,'source-1').monetaryDuePaisa,6000);
 assert.equal(priced.events.at(-1)?.side,'receivable');
});

test('V1 still requires price when goods are issued without explicit V2 opt-in',()=>{
 const base=fresh();
 assert.throws(()=>applyVendorCommand(base,{type:'issue-goods-memo',operationId:'v1-given',vendorPartyId:'nearby',
  memoId:'G1',date:'2026-11-06',sources:[{id:'source-1',productId:'p1',baseQty:5,
   unitCostBasePaisa:null,date:'2026-11-06'}]}),/agreed cost/i);
 assert.equal(JSON.stringify(base),JSON.stringify(fresh()),'Rejected commands never mutate original preview state');
});

test('multiple taken lines with pending price do not become cash liabilities',()=>{
 const state=applyVendorCommand(fresh(),{type:'record-sourcing-memo',operationId:'v2-taken',vendorPartyId:'nearby',
  memoId:'V2-T1',date:'2026-11-06',sources:[
  {id:'a',productId:'p1',baseQty:215,unitCostBasePaisa:null,date:'2026-11-06'},
  {id:'b',productId:'p2',baseQty:2,unitCostBasePaisa:2500,date:'2026-11-06'}
 ]});
 assert.equal(state.sources.length,2);
 assert.equal(vendorBalances(state,'nearby').knownPayablePaisa,5000);
 assert.equal(sourceOutstanding(state,'a').unpricedBaseQty,215);
});
