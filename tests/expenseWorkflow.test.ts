import test from 'node:test';
import assert from 'node:assert/strict';
import type {Expense} from '../src/types/erp.ts';
import {expenseCsv,filterExpenseList} from '../src/expenses/expenseWorkflow.ts';

const fixtures:Expense[]=[
 {id:'a',ref:'EXP-001',date:'02 Sep 2026',category:'Transport',payee:'Rahman',note:'Cargo delivery',
  amount:150,paid:150,method:'Cash',payments:[{id:'p1',method:'Cash',amount:100},{id:'p2',method:'bKash',amount:50}]},
 {id:'b',ref:'EXP-002',date:'03 Sep 2026',category:'Utilities',payee:'DESCO',note:'=HYPERLINK("bad")',
  amount:500,paid:0,method:'Bank',recordStatus:'Deleted'}
];

test('Expense filters compose across search, category, payee, split payment and status',()=>{
 assert.deepEqual(filterExpenseList(fixtures,{query:'cargo',category:'Transport',payee:'Rahman',paymentMethod:'bKash',status:'Active'}).map(x=>x.id),['a']);
 assert.deepEqual(filterExpenseList(fixtures,{query:'',category:'Utilities',payee:'DESCO',paymentMethod:'All payment methods',status:'Cancelled'}).map(x=>x.id),['b']);
 assert.deepEqual(filterExpenseList(fixtures,{paymentMethod:'Bank',status:'Active'}),[]);
 assert.equal(filterExpenseList(fixtures,{category:'All categories',status:'All status'}).length,2);
});

test('Expense CSV represents preview records, split payments and spreadsheet-safe values',()=>{
 const csv=expenseCsv(fixtures);
 assert.match(csv,/Expense ref,Date,Category,Payee,Note,Amount,Paid,Payment methods,Status/);
 assert.match(csv,/EXP-001.*Cash \+ bKash,Active/);
 assert.match(csv,/EXP-002.*Cancelled/);
 assert.ok(csv.includes("'=HYPERLINK"));
 assert.ok(!csv.includes(',"=HYPERLINK'));
});
