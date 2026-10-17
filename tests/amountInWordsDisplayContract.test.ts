import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const displays = [
 'src/components/finance/CounterWorkspace.tsx',
 'src/components/pos/CheckoutPanel.tsx',
 'src/components/purchases/PurchasePaymentPanel.tsx',
 'src/components/brand/ReceiptPreview.tsx',
 'src/pages/Finance.tsx',
 'src/components/parties/PartyPaymentDialog.tsx',
 'src/components/parties/PartyFinanceDialog.tsx'
];

test('amounts in words reuse prominent display across POS, purchase, Counter, Finance, parties and receipt',()=>{
 for(const path of displays){
  const source=readFileSync(path,'utf8');
  assert.match(source,/AmountInWordsDisplay/,path+' must use shared display');
  assert.doesNotMatch(source,/<(?:p|div)[^>]*>[^<]*\{amountInWords\(/,path+' has a tiny inline amount in words');
 }
});
test('shared amount-in-words component has full-width readable wrapped Bangla in all variants',()=>{
 const source=readFileSync('src/components/AmountInWordsDisplay.tsx','utf8');
 assert.match(source,/min-w-0 max-w-full/);
 assert.match(source,/whitespace-normal break-words/);
 assert.match(source,/font-semibold/);
 assert.match(source,/lang="bn"/);
 assert.match(source,/variant = 'default'/);
 assert.match(source,/variant: 'default' \| 'inverse' \| 'receipt'/);
});
test('black payable cards use contrasting variant; paper receipt retains dedicated readable variant',()=>{
 for(const path of displays.filter(x=>/CheckoutPanel|PurchasePaymentPanel/.test(x))){
  assert.match(readFileSync(path,'utf8'),/variant="inverse"/,path);
 }
 assert.match(readFileSync('src/components/brand/ReceiptPreview.tsx','utf8'),/variant="receipt"/);
});
