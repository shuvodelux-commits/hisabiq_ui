import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  BANK_ENTRY_TYPES, bankEntryImpact, toBankEntryPayload, validateBankEntry,
  type BankEntryDraft
} from '../src/utils/bankEntry.ts';

const today = '2026-10-31';
const draft = (patch: Partial<BankEntryDraft> = {}): BankEntryDraft => ({
  bankAccountId: 'BNK-01',
  entryType: 'Bank Charge',
  amount: '150.00',
  date: today,
  direction: 'debit',
  reference: ' FEE-102 ',
  description: ' Monthly fee ',
  notes: '',
  backdatedReason: '',
  ...patch
});

test('all seven bank entry categories are present with exact backend keys', () => {
  assert.deepEqual(BANK_ENTRY_TYPES.map((entry) => entry.key), [
    'Bank Charge', 'Interest Received', 'Cheque Bounced (Received)',
    'Cheque Bounced (Issued)', 'Cash Deposit', 'Cash Withdrawal', 'Bank Adjustment'
  ]);
  assert.equal(new Set(BANK_ENTRY_TYPES.map((entry) => entry.key)).size, 7);
});

test('fees and interest change bank balance with the correct sign', () => {
  assert.deepEqual(bankEntryImpact('Bank Charge', 150, 'credit'), { direction: 'debit', bankDelta: -150, cashDelta: 0 });
  assert.deepEqual(bankEntryImpact('Interest Received', 75, 'debit'), { direction: 'credit', bankDelta: 75, cashDelta: 0 });
});

test('cash deposits and withdrawals have equal opposite cash movements', () => {
  assert.deepEqual(bankEntryImpact('Cash Deposit', 2500, 'debit'), { direction: 'credit', bankDelta: 2500, cashDelta: -2500 });
  assert.deepEqual(bankEntryImpact('Cash Withdrawal', 2000, 'credit'), { direction: 'debit', bankDelta: -2000, cashDelta: 2000 });
  assert.equal(bankEntryImpact('Cash Deposit', 0, 'credit').cashDelta, 0);
});

test('other adjustments honor explicit direction', () => {
  assert.equal(bankEntryImpact('Bank Adjustment', 200, 'credit').bankDelta, 200);
  assert.equal(bankEntryImpact('Bank Adjustment', 200, 'debit').bankDelta, -200);
});

test('manual cheque bounce is rejected to protect original party accounting', () => {
  assert.match(validateBankEntry(draft({ entryType: 'Cheque Bounced (Received)' }), today, true) ?? '', /Cheques/);
  assert.match(validateBankEntry(draft({ entryType: 'Cheque Bounced (Issued)' }), today, true) ?? '', /Cheques/);
});

test('reject invalid amounts, future dates, backdates without reason and missing cash sessions', () => {
  assert.match(validateBankEntry(draft({ amount: '0' }), today, true) ?? '', /positive/);
  assert.match(validateBankEntry(draft({ amount: '1.239' }), today, true) ?? '', /two decimals/);
  assert.match(validateBankEntry(draft({ amount: 'foo' }), today, true) ?? '', /positive/);
  assert.match(validateBankEntry(draft({ date: '2026-11-01' }), today, true) ?? '', /future/);
  assert.match(validateBankEntry(draft({ date: '2026-10-29' }), today, true) ?? '', /backdated/);
  assert.match(validateBankEntry(draft(), today, false) ?? '', /POS Cash Session/);
});

test('adjustment requires a reason and payload trims input', () => {
  assert.match(validateBankEntry(draft({ entryType: 'Bank Adjustment' }), today, true) ?? '', /Notes/);
  assert.equal(validateBankEntry(draft({ entryType: 'Bank Adjustment', notes: 'Bank statement difference' }), today, true), null);
  assert.equal(validateBankEntry(draft({ date: '2026-10-29', backdatedReason: 'Verified statement' }), today, true), null);
  assert.deepEqual(toBankEntryPayload(draft()), {
    bankAccountId: 'BNK-01', entryType: 'Bank Charge', amount: 150, date: today,
    direction: 'debit', reference: 'FEE-102', description: 'Monthly fee', notes: '', backdatedReason: ''
  });
});

test('bank entry is the final existing Accounts tab and overview markup remains free of new shortcut', () => {
  const code = readFileSync('src/pages/Accounts.tsx', 'utf8');
  assert.match(code, /\['chart',[^\n]+\n\s*\['bank-entry',/);
  assert.match(code, /tab === 'bank-entry' && <BankEntryTab/);
  const overviewStart = code.indexOf("{tab === 'overview' && (");
  const overviewEnd = code.indexOf("{tab === 'vouchers' && (");
  assert.ok(overviewStart > 0 && overviewEnd > overviewStart);
  assert.doesNotMatch(code.slice(overviewStart, overviewEnd), /BankEntryTab|Bank Entry|Bank activities/);
});
