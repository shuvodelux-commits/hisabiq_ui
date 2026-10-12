import test from 'node:test';
import assert from 'node:assert/strict';
import {amountInWords} from '../src/utils/amountInWords.ts';
import {counterOpenInvoices,counterAllocateOldest} from '../src/utils/counterAllocation.ts';
import type {PartySourceRecord} from '../src/types/partyLedger.ts';

test('Bangladesh amount wording handles lakh, crore, decimal paisa and negative',()=>{
 assert.equal(amountInWords(0),'Zero Taka Only');
 assert.equal(amountInWords(125400.5),'One Lakh Twenty Five Thousand Four Hundred Taka and Fifty Paisa Only');
 assert.equal(amountInWords(10000000),'One Crore Taka Only');
 assert.equal(amountInWords(-12.05),'Minus Twelve Taka and Five Paisa Only');
 assert.equal(amountInWords(Number.NaN),'');
});
const row=(id:string,sequence:number,kind:PartySourceRecord['kind'],debit:number,credit:number,rest:Partial<PartySourceRecord>={}):PartySourceRecord=>({
 id,sequence,kind,debit,credit,partyId:'c1',relationship:'Customer',status:'Active',date:'2026-10-01',description:id,...rest
});
test('oldest due allocation honors existing receipts, targeted invoice and opening balance',()=>{
 const events=[
  row('opening',1,'opening',20,0),
  row('sale-a',2,'sale',100,0,{reference:'INV-A'}),
  row('sale-b',3,'sale',70,0,{reference:'INV-B'}),
  row('cash-oldest',4,'customer-payment',0,50),
  row('cash-selected',5,'customer-payment',0,20,{invoiceId:'INV-B'})
 ];
 const open=counterOpenInvoices(events,'c1','2026-10-12');
 assert.deepEqual(open.map(x=>[x.reference,x.due]),[['INV-A',70],['INV-B',50]]);
 assert.deepEqual(counterAllocateOldest(open,100),[{invoice:'INV-A',amount:70},{invoice:'INV-B',amount:30}]);
});
test('replayed credits do not double allocate and future invoice consumes advance',()=>{
 const events=[row('pay-first',1,'customer-payment',0,25),
  row('sale-after',2,'sale',30,0,{date:'2026-10-02',reference:'INV-NEXT'})];
 const open=counterOpenInvoices(events,'c1','2026-10-12');
 assert.equal(open.length,1);assert.equal(open[0].due,5);
 assert.equal(counterOpenInvoices(events,'c1','2026-10-01').length,0);
});
