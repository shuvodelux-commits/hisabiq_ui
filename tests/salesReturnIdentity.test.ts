import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBdMobile,suggestReturnInvoices,findReturnCustomerCandidates,validateReturnCustomerChoice} from '../src/utils/salesReturnIdentity.ts';
import type {SalesInvoice,Party} from '../src/types/erp.ts';

const invoice=(id:string,phone?:string,partyId?:string):SalesInvoice=>({
 id,invoice:'INV-'+id,party:partyId?'Registered':'Walk-in customer',partyId,phone,date:'01 Oct 2026',time:'10:00 AM',items:0,total:0,paid:0,method:'Cash',
 lines:[],status:'Paid',discount:0,rounding:0,subtotal:0,due:0,payments:[],salesperson:'Anis'
});
const party=(id:string,phone:string):Party=>({id,name:'Rahim '+id,phone,roles:['Customer'],area:'',balance:0,lastActivity:'',avatarColor:'#ccc'});
test('Bangladesh phone normalization is strict and +880 and 01 compare equal',()=>{
 assert.equal(normalizeBdMobile('01712345678'),'01712345678');
 assert.equal(normalizeBdMobile('+8801712345678'),'01712345678');
 assert.equal(normalizeBdMobile('880 171 234 5678'),'01712345678');
 for(const bad of ['','01234567890','017','01700000000','N/A','abc','017000','017123456789']){
  assert.equal(normalizeBdMobile(bad),null,bad);
 }
});
test('same phone suggests walk-in invoices without auto-selecting registered people',()=>{
 const a=invoice('a','01712345678'),b=invoice('b','+8801712345678'),c=invoice('c','01712345678','cust-9'),d=invoice('d','01998765432');
 const suggestions=suggestReturnInvoices(a,[a,b,c,d]);
 assert.deepEqual(suggestions.map(x=>x.id),['b']);
});
test('shared phone exposes all identities for explicit confirmation',()=>{
 const a=party('one','01712345678'),b=party('two','+8801712345678');
 const candidates=findReturnCustomerCandidates('01712345678',[a,b]);
 assert.deepEqual(candidates.map(x=>x.id),['one','two']);
 assert.ok(validateReturnCustomerChoice([invoice('a','01712345678')],{kind:'none'},[a,b],true).length);
 assert.deepEqual(validateReturnCustomerChoice([invoice('a','01712345678')],{kind:'existing',customerId:'one'},[a,b],true),[]);
 assert.deepEqual(validateReturnCustomerChoice([invoice('a','01712345678')],{kind:'none'},[a,b],false),[]);
});
