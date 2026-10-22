import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveReturnCompensation} from '../src/utils/returnCompensation.ts';
import type {SalesReturn} from '../src/types/erp.ts';
const row=(delta:number):SalesReturn=>({id:'RTN-8',date:'22 Oct 2026',customer:'Walk-in customer',invoices:['INV-1'],items:'Tape',
 amount:(20000+delta)/100,settlement:'Customer credit',compensationExpensePaisa:Math.max(0,delta),
 lineReturns:[{invoiceId:'sale-1',lineId:'l1',quantity:2,amount:200,serials:[],historicalSourceAmountPaisa:20000,agreedReturnAmountPaisa:20000+delta,priceDifferencePaisa:delta}]});
test('records positive refund difference as one source-linked expense, not second payment',()=>{
 const result=deriveReturnCompensation([row(4000)]);
 assert.equal(result.length,1);
 assert.equal(result[0].expenseAmountPaisa,4000);
 assert.equal(result[0].sourceReturnId,'RTN-8');
 assert.equal(result[0].category,'Customer Compensation');
 assert.equal(result[0].invoiceRefs[0],'INV-1');
 assert.equal('paymentAccounts' in result[0],false);
});
test('below-historical price changes are not compensation expenses',()=>{
 assert.deepEqual(deriveReturnCompensation([row(-2000)]),[]);
});
test('reject mismatching compensation totals rather than inventing expense',()=>{
 assert.throws(()=>deriveReturnCompensation([{...row(4000),compensationExpensePaisa:2000}]),/compensation/i);
});
test('duplicate memo reference cannot double recognize compensation',()=>{
 assert.equal(deriveReturnCompensation([row(4000),row(4000)]).length,1);
});
