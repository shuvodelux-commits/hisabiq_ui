import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const counter = readFileSync('src/components/finance/CounterWorkspace.tsx', 'utf8');
const accounts = readFileSync('src/pages/Accounts.tsx', 'utf8');
const bank = readFileSync('src/components/accounts/BankEntryTab.tsx', 'utf8');

test('Counter uses the Accounts BankEntryTab with a Counter-only presentation variant', () => {
  assert.match(counter, /import \{BankEntryTab\} from '\.\.\/accounts\/BankEntryTab';/);
  assert.ok(counter.includes('<BankEntryTab variant="counter" />'));
  assert.ok(accounts.includes("tab === 'bank-entry' && <BankEntryTab />"));
  assert.ok(bank.includes("variant = 'accounts'"));
  assert.ok(bank.includes("const inCounter = variant === 'counter'"));
  assert.ok(bank.includes('recordBankEntry(toBankEntryPayload(draft))'));
});

test('Counter entry matches the native form and right-side Transaction summary architecture', () => {
  assert.ok(bank.includes("xl:grid-cols-[minmax(0,1fr)_310px]"));
  assert.ok(bank.includes("h-fit rounded-xl border border-border bg-card p-4 xl:sticky xl:top-4"));
  assert.ok(bank.includes("text('Transaction summary','লেনদেনের সারাংশ')"));
  assert.ok(bank.includes('<AmountInWordsDisplay amount={Math.max(0, amount)} />'));
  assert.ok(bank.includes("text('Current balance','বর্তমান জের')"));
  assert.ok(bank.includes("text('Balance after','পরে জের')"));
  assert.ok(bank.includes("text('Review bank entry','ব্যাংক এন্ট্রি যাচাই করুন')"));
  assert.ok(bank.includes('<Dialog open={inCounter && review}'));
  assert.ok(bank.includes('disabled={!connected || saving || bouncedCheque}'));
  assert.ok(bank.includes('{!inCounter && connected && !!selectedAccount && ('));
});

test('Existing Counter actions, defaults, and payment transaction flows are preserved', () => {
  assert.ok(counter.includes("const kinds:Action[]=['Customer Receive','Supplier Pay','Expense','Bank Transfer']"));
  assert.ok(counter.includes('lg:grid-cols-6" role="group" aria-label="Counter actions"'));
  assert.ok(counter.includes("changeType=(next:Action)=>{setBankEntrySelected(false);setType(next);reset();}"));
  assert.ok(counter.includes("useState<Action>('Customer Receive')"));
  assert.ok(counter.includes('aria-pressed={bankEntrySelected}'));
  assert.ok(counter.includes('aria-pressed={!bankEntrySelected&&type===item}'));
  assert.ok(counter.includes('onTransfer({fromAccountId:from,toAccountId:to,amount:total,date,reference:note.trim()||undefined})'));
  assert.ok(counter.includes("text('Finance transaction','মালিক ও ঋণের টাকা')"));
});

test('Shared bank validation and read-only fallback remain active in both entry points', () => {
  assert.ok(bank.includes('validateBankEntry(draft, today(), activeCashSession)'));
  assert.ok(bank.includes('disabled={!connected || saving}'));
  assert.ok(bank.includes('bouncedCheque && ('));
  assert.ok(bank.includes('Manual bank posting is disabled for this type.'));
});
