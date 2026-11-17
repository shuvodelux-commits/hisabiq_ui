import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceDeleteErrorCopy} from '../src/deletion/errorCopy.ts';
const bangla=(_en:string,bn:string)=>bn;
test('source delete errors use readable Bangla for reason, authority and stale sources',()=>{
 for(const message of ['Enter a reason for the source cancellation or reversal.','Current actor lacks permission for this module.','Recovery permission denied. Settings session is unavailable.','Source belongs to another business tenant.','Transaction changed or reversed. Reopen source review.','Transfer changed. Reopen source review.','Expense changed. Reopen the source review.','Source changed. Reopen review.']){
  assert.match(sourceDeleteErrorCopy(new Error(message),bangla),/[\u0980-\u09ff]/);
  assert.equal(sourceDeleteErrorCopy(new Error(message),(en)=>en),message);
 }
 assert.match(sourceDeleteErrorCopy(new Error('unexpected internal detail'),bangla),/[\u0980-\u09ff]/);
});
test('each owning source deletion review localizes caught validation errors',()=>{
 for(const file of ['src/components/finance/FinanceRecordDialogs.tsx','src/pages/Expenses.tsx','src/pages/AuditLedger.tsx','src/components/accounts/VoucherActionDialog.tsx','src/components/parties/VendorCorrectionDialog.tsx','src/components/parties/PartyTransactionDialog.tsx']){
  assert.match(readFileSync(file,'utf8'),/sourceDeleteErrorCopy\((?:e|error),\s*text(?:\)|,)/,file);
 }
});

test('owning Party reversal preserves its existing domain translations as fallback',()=>{
 const fallback=(message:string)=>message==='Refund exceeds available verified credit.'?'যাচাই করা ফেরতযোগ্য জমার চেয়ে বেশি টাকা ফেরত দেওয়া যাবে না।':message;
 assert.equal(sourceDeleteErrorCopy(new Error('Refund exceeds available verified credit.'),bangla,fallback),fallback('Refund exceeds available verified credit.'));
 assert.equal(sourceDeleteErrorCopy(new Error('Current actor lacks permission for this module.'),bangla,fallback),'এই মডিউলে বর্তমান ব্যবহারকারীর অনুমতি নেই।');
});
