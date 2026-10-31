import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const counter = readFileSync('src/components/finance/CounterWorkspace.tsx', 'utf8');
const accounts = readFileSync('src/pages/Accounts.tsx', 'utf8');
const bank = readFileSync('src/components/accounts/BankEntryTab.tsx', 'utf8');

test('Counter reuses the exact existing Accounts BankEntryTab rather than creating a competing form', () => {
  assert.match(counter, /import \{BankEntryTab\} from '\.\.\/accounts\/BankEntryTab';/);
  assert.match(counter, /bankEntrySelected[\s\S]*?<BankEntryTab \/>/);
  assert.match(accounts, /tab === 'bank-entry' && <BankEntryTab \/>/);
  assert.match(bank, /recordBankEntry\(toBankEntryPayload\(draft\)\)/);
});

test('Bank Entry is a sixth selectable Counter action and current workflows remain available', () => {
  assert.match(counter, /const kinds:Action\[\]=\['Customer Receive','Supplier Pay','Expense','Bank Transfer'\]/);
  assert.match(counter, /lg:grid-cols-6" role="group" aria-label="Counter actions"/);
  assert.match(counter, /aria-pressed=\{bankEntrySelected\}/);
  assert.match(counter, /onClick=\{\(\)=>\{setBankEntrySelected\(true\);setReview\(false\);setQuickAddOpen\(false\);\}\}/);
  assert.match(counter, /Finance transaction/);
  assert.match(counter, /changeType=\(next:Action\)=>\{setBankEntrySelected\(false\);setType\(next\);reset\(\);\}/);
  assert.match(counter, /aria-pressed=\{!bankEntrySelected&&type===item\}/);
  assert.match(counter, /onTransfer\(\{fromAccountId:from,toAccountId:to,amount:total,date,reference:note.trim\(\)\|\|undefined\}\)/);
});

test('Bank Entry selection replaces Counter form without changing the default selected Counter action', () => {
  assert.match(counter, /useState<Action>\('Customer Receive'\)/);
  assert.match(counter, /useState\(false\)/);
  assert.match(counter, /bankEntrySelected\s*\? <div role="region" aria-label=\{text\('Bank Entry','ব্যাংক এন্ট্রি'\)\}><BankEntryTab \/><\/div>\s*: <div className="grid gap-4/);
  assert.match(counter, /text\('Search customer','ক্রেতা খুঁজুন'\)/);
  assert.match(counter, /aria-label=\{text\("Payment source amount","পেমেন্টের টাকা"\)/);
  assert.match(counter, /Transaction summary/);
});

test('Bank API safely refuses unconnected UI previews and prevents duplicate manual cheque reversals', () => {
  assert.match(bank, /disabled=\{!connected \|\| saving\}/);
  assert.match(bank, /bouncedCheque &&/);
  assert.match(bank, /Manual bank posting is disabled for this type\./);
});
