import test from 'node:test';
import assert from 'node:assert/strict';
import {getSalesPreviewSnapshot,subscribeSalesPreview,commitSalesReturnPreview} from '../src/data/salesPreviewStore.ts';
import type {SalesReturn} from '../src/types/erp.ts';

test('one preview batch event updates returns and linked credit in one notification',()=>{
 const prior=getSalesPreviewSnapshot();
 const id='preview-idempotent-test-1';
 const memo:SalesReturn={id,date:'22 Oct 2026',customer:'Test Customer',invoices:['INV-1'],items:'Tape',amount:120,settlement:'Customer credit'};
 let fired=0;const unsubscribe=subscribeSalesPreview(()=>fired++);
 const result=commitSalesReturnPreview({commandId:id,expected:prior,returns:[memo,...prior.returns],
  invoices:prior.invoices,credits:prior.credits});
 unsubscribe();
 assert.equal(result.id,id);
 assert.equal(fired,1);
 assert.equal(getSalesPreviewSnapshot().returns[0].id,id);
 assert.throws(()=>commitSalesReturnPreview({commandId:id,expected:prior,returns:[memo,...prior.returns],
  invoices:prior.invoices,credits:prior.credits}),/already recorded/);
});
test('stale return preview mutation is rejected before writing any array',()=>{
 const now=getSalesPreviewSnapshot();
 const wrong={...now};
 const before=getSalesPreviewSnapshot();
 assert.throws(()=>commitSalesReturnPreview({commandId:'different',expected:wrong,
  invoices:now.invoices,returns:now.returns,credits:now.credits}),/changed/);
 assert.equal(getSalesPreviewSnapshot(),before);
});
