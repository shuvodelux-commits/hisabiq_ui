import test from 'node:test';
import assert from 'node:assert/strict';
import {vendorPaymentSplits} from '../src/vendor/vendorPaymentAdapter.ts';
import {financeAccounts} from '../src/data/financeAccounts.ts';
import type {FinancePaymentDraft} from '../src/components/finance/FinancePaymentSplitEditor.tsx';

const rows:FinancePaymentDraft[]=[
 {id:'cash',method:'Cash',accountId:'acc-cash',amount:'100.25'},
 {id:'bank',method:'Bank',accountId:'acc-dbl',amount:'200.75'},
 {id:'mobile',method:'Mobile Banking',accountId:'acc-bkash',amount:'50.00'}
];
test('vendor payment splits preserve money as exact integer paisa',()=>{
 const result=vendorPaymentSplits(rows,financeAccounts,35100);
 assert.deepEqual(result.map(s=>s.amountPaisa),[10025,20075,5000]);
 assert.equal(result.reduce((sum,s)=>sum+s.amountPaisa,0),35100);
});
test('reject account method mismatch, missing account, and duplicate split IDs',()=>{
 assert.throws(()=>vendorPaymentSplits([{...rows[0],method:'Bank'}],financeAccounts,10025),/method|account/i);
 assert.throws(()=>vendorPaymentSplits([{...rows[0],accountId:'missing'}],financeAccounts,10025),/account/i);
 assert.throws(()=>vendorPaymentSplits([rows[0],{...rows[1],id:'cash'}],financeAccounts,30100),/duplicate/i);
});
test('reject incomplete, excessive decimal, negative and mismatched payments',()=>{
 for(const value of ['','0','-2','1.123','NaN']){
  assert.throws(()=>vendorPaymentSplits([{...rows[0],amount:value}],financeAccounts,10025),/amount|positive|decimal/i);
 }
 assert.throws(()=>vendorPaymentSplits([rows[0]],financeAccounts,10026),/match/i);
});
test('reject inactive payment account',()=>{
 const accounts=financeAccounts.map(a=>a.id==='acc-cash'?{...a,status:'Inactive' as const}:a);
 assert.throws(()=>vendorPaymentSplits([rows[0]],accounts,10025),/active|account/i);
});