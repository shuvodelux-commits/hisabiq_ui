import test from 'node:test';
import assert from 'node:assert/strict';
import {quoteReturnPrice} from '../src/utils/salesReturnPricing.ts';

const source={amount:200,unitPrice:100,quantity:2,issues:[]};
test('historical net return price remains exact when not edited or after reset',()=>{
 const unchanged=quoteReturnPrice(source);
 assert.equal(unchanged.historicalSourceAmountPaisa,20000);
 assert.equal(unchanged.agreedReturnAmountPaisa,20000);
 assert.equal(unchanged.overridden,false);
 const reset=quoteReturnPrice({...source,amount:100/3,unitPrice:100/3,quantity:1});
 assert.equal(reset.agreedReturnAmountPaisa,reset.historicalSourceAmountPaisa);
});
test('fully editable base-unit price splits compensation and negative adjustment',()=>{
 const above=quoteReturnPrice(source,'120');
 assert.equal(above.agreedReturnAmountPaisa,24000);
 assert.equal(above.priceDifferencePaisa,4000);
 assert.equal(above.compensationExpensePaisa,4000);
 assert.equal(above.negativeAdjustmentPaisa,0);
 const below=quoteReturnPrice(source,'90');
 assert.equal(below.agreedReturnAmountPaisa,18000);
 assert.equal(below.compensationExpensePaisa,0);
 assert.equal(below.negativeAdjustmentPaisa,-2000);
 assert.equal(quoteReturnPrice(source,'0').agreedReturnAmountPaisa,0);
});
test('same displayed historical unit price does not trigger the reset link',()=>{
 assert.equal(quoteReturnPrice({...source,unitPrice:33.333333333333336,amount:100/3,quantity:1},'33.333333').overridden,false);
});
test('rejects unsafe return prices and bad historical plans',()=>{
 for(const raw of ['','NaN','Infinity','-1','1e2','12.1234567','-0.01']){
  assert.ok(quoteReturnPrice(source,raw).issues.length,raw);
 }
 assert.ok(quoteReturnPrice({...source,issues:['Historic serial mismatch']},'120').issues.length);
 assert.ok(quoteReturnPrice({...source,unitPrice:null},'120').issues.length);
});
