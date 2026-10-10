import test from 'node:test';
import assert from 'node:assert/strict';
import { makeVendorCartLine, makeVendorSourceInputs } from '../src/vendor/vendorCartAdapter.ts';
import { switchPurchaseUnit } from '../src/utils/purchaseCart.ts';

const box = {
  id:'bulb',name:'LED Bulb 12W',sku:'LED',category:'Electrical',
  unit:'Pcs',altUnit:{unit:'Box',factor:10},stock:20,minStock:0,
  purchasePrice:128,sellPrice:165,active:true
};

test('receiving products uses a purchase cart line without pre-filling a purchase cost',()=>{
  const line=makeVendorCartLine(box);
  assert.equal(line.cost,'');
  assert.equal(line.costUnit,'Box');
  assert.equal(line.lotSellPrice,'');
  const inputs=makeVendorSourceInputs([{...line,bigQty:'1',smallQty:'5'}],'taken','op-receive','2026-10-10');
  assert.equal(inputs[0].baseQty,15);
  assert.equal(inputs[0].unitCostBasePaisa,null);
});

test('changing compound units preserves pending vendor purchase cost',()=>{
  const line=makeVendorCartLine(box);
  const pcs=switchPurchaseUnit({...line,bigQty:'2',smallQty:'5'},'Pcs');
  assert.equal(pcs.cost,'');
  assert.equal(makeVendorSourceInputs([pcs],'taken','op','2026-10-10')[0].baseQty,25);
});

test('issued products require an agreed unit price',()=>{
  const line=makeVendorCartLine(box);
  assert.throws(()=>makeVendorSourceInputs([line],'given','op','2026-10-10'),/agreed price/i);
});

test('issued products use the shared compound-unit cost conversion',()=>{
  const line={...makeVendorCartLine(box),bigQty:'1',smallQty:'5',cost:'1500'};
  const inputs=makeVendorSourceInputs([line],'given','op-issue','2026-10-10');
  assert.deepEqual(inputs[0],{
    id:'op-issue:0',productId:box.id,baseQty:15,unitCostBasePaisa:15000,date:'2026-10-10'
  });
});

test('invalid and negative product quantities cannot be saved',()=>{
  const line=makeVendorCartLine(box);
  assert.throws(()=>makeVendorSourceInputs([{...line,bigQty:'-1',smallQty:'5'}],'taken','op','2026-10-10'),/quantity/i);
  assert.throws(()=>makeVendorSourceInputs([{...line,bigQty:'0',smallQty:'0'}],'taken','op','2026-10-10'),/quantity/i);
  assert.throws(()=>makeVendorSourceInputs([],'taken','op','2026-10-10'),/at least one product/i);
});
