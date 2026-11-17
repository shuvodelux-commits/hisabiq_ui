import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deleteEligibility, requireSourceDelete} from '../src/deletion/policy.ts';

test('used masters and uncertain history never enter recovery',()=>{
 assert.equal(deleteEligibility({kind:'master',used:true,completeHistory:true}).allowed,false);
 assert.equal(deleteEligibility({kind:'master',used:false,completeHistory:false}).allowed,false);
 assert.equal(deleteEligibility({kind:'master',used:false,completeHistory:true}).allowed,true);
});
test('posted sources and projections cannot enter recovery or be blindly deleted',()=>{
 assert.equal(deleteEligibility({kind:'posted'}).allowed,false);
 assert.equal(deleteEligibility({kind:'projection'}).allowed,false);
 assert.equal(deleteEligibility({kind:'setup'}).allowed,false);
 assert.equal(deleteEligibility({kind:'immutable'}).allowed,false);
});
test('source review requires exact identity, command and resolved dependencies',()=>{
 for(const target of [{sourceId:'',safeCommand:true},{sourceId:'source-1',safeCommand:false},{sourceId:'source-1',safeCommand:true,linkedReturns:1}])
  assert.throws(()=>requireSourceDelete({...target,permitted:true,actorId:'actor',reason:'duplicate'}));
 assert.doesNotThrow(()=>requireSourceDelete({sourceId:'source-1',safeCommand:true,permitted:true,actorId:'actor',reason:'duplicate'}));
});
test('confirmation rechecks current actor, module grant and reason',()=>{
 const target={sourceId:'source-1',safeCommand:true,permitted:true,actorId:'actor',reason:'duplicate'};
 for(const patch of [{permitted:false},{actorId:''},{reason:'  '}])assert.throws(()=>requireSourceDelete({...target,...patch}));
});

test('expense cancellation changes its original source once, retains amounts and current actor, rejects stale review',async()=>{
 const {resetExpensePreviewForTest,getExpensePreviewSnapshot,cancelPreviewExpense,attachPreviewExpenseReceipt}=await import('../src/data/expensePreviewStore.ts');
 resetExpensePreviewForTest();
 const original=getExpensePreviewSnapshot().expenses[0];
 const revision=JSON.stringify(original);
 attachPreviewExpenseReceipt(original.id,'data:image/png;base64,review');
 assert.throws(()=>cancelPreviewExpense(original.id,'duplicate','actor-1',revision),/changed/);
 assert.notEqual(getExpensePreviewSnapshot().expenses[0].recordStatus,'Deleted');
 const current=getExpensePreviewSnapshot().expenses.find(e=>e.id===original.id)!;
 cancelPreviewExpense(current.id,'duplicate','actor-1',JSON.stringify(current));
 const after=getExpensePreviewSnapshot();
 assert.equal(after.expenses.find(e=>e.id===original.id)?.amount,original.amount);
 assert.equal(after.expenses.find(e=>e.id===original.id)?.recordStatus,'Deleted');
 assert.equal(after.audit.at(-1)?.actorId,'actor-1');
 assert.equal(after.audit.at(-1)?.reason,'duplicate');
 assert.throws(()=>cancelPreviewExpense(current.id,'again','actor-1'),/active/);
 resetExpensePreviewForTest();
});
test('confirmation uses active tenant actor and current module grant',async()=>{
 const {defaults}=await import('../src/settings/model.ts');
 const {sourceDeleteAuthority}=await import('../src/deletion/authority.ts');
 const state=defaults();
 assert.throws(()=>sourceDeleteAuthority({state:defaults('other-tenant'),actorId:'mahmud'},'money','source-1','duplicate'),/business|tenant/i);
 assert.equal(sourceDeleteAuthority({state,actorId:'mahmud'},'money','source-1','duplicate').actorId,'mahmud');
 assert.throws(()=>sourceDeleteAuthority({state,actorId:'unknown'},'money','source-1','duplicate'),/permission/);
 state.sections.team.employees=state.sections.team.employees.map(e=>e.id==='mahmud'?{...e,active:false}:e);
 assert.throws(()=>sourceDeleteAuthority({state,actorId:'mahmud'},'money','source-1','duplicate'),/permission/);
});
test('original audit sale with linked returns rejects source reversal without altering projections',async()=>{
 const {createAuditState,applyDelete}=await import('../src/utils/auditEngine.ts');
 const source={id:'sale-1',source:'sale' as const,reference:'same-display-ref',transactionDate:'2026-10-07',createdAt:'2026-10-07T10:00:00Z',postedBy:'actor',amount:500,paid:500,due:0,status:'Posted' as const,quantity:2,returnedQuantity:1};
 const state=createAuditState([source]),before=JSON.stringify(state);
 assert.throws(()=>applyDelete({sourceId:source.id,reason:'duplicate',user:'actor',at:new Date().toISOString()},state),/return/i);
 assert.equal(JSON.stringify(state),before);
 assert.throws(()=>applyDelete({sourceId:'same-display-ref',reason:'duplicate',user:'actor',at:new Date().toISOString()},state));
});
test('finance reversal is atomic, retains source identity and reason, and cannot post twice',async()=>{
 const store=await import('../src/data/financePreviewStore.ts');
 const {defaults}=await import('../src/settings/model.ts');
 store.resetFinancePreviewForTest();
 const before=store.getFinancePreviewSnapshot(),source=before.transactions.find(t=>t.direction==='in'&&t.accountId)!;
 let observations=0;
 const off=store.subscribeFinancePreview(()=>{observations++;const state=store.getFinancePreviewSnapshot();assert.equal(state.transactions.find(t=>t.id===source.id)?.status,'Reversed');});
 const after=store.reverseFinancePreview(source.id,JSON.stringify(source),'duplicate',{state:defaults(),actorId:'mahmud'});
 off();
 assert.equal(observations,1);
 assert.equal(after.id,source.id);
 assert.equal(after.reversal?.reason,'duplicate');
 const current=store.getFinancePreviewSnapshot();
 assert.equal(current.accounts.find(a=>a.id===source.accountId)!.balance,before.accounts.find(a=>a.id===source.accountId)!.balance-source.amount);
 assert.throws(()=>store.reverseFinancePreview(source.id,JSON.stringify(source),'again',{state:defaults(),actorId:'mahmud'}));
 assert.equal(store.getFinancePreviewSnapshot(),current);
 store.resetFinancePreviewForTest();
});
