import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  financePreviewRelationshipSummary,
  getFinancePreviewSnapshot,
  resetFinancePreviewForTest,
  subscribeFinancePreview,
  updateFinancePreview
} from '../src/data/financePreviewStore.ts';

test('Counter opens the existing Finance transaction dialog rather than a second form', () => {
  const counter = readFileSync('src/components/finance/CounterWorkspace.tsx', 'utf8');
  const finance = readFileSync('src/pages/Finance.tsx', 'utf8');
  assert.match(counter, /text\('Finance transaction','মালিক ও ঋণের টাকা'\)/);
  assert.match(counter, /aria-haspopup="dialog" onClick=\{onNewFinanceTransaction\}/);
  assert.match(finance, /onNewFinanceTransaction=\{\(\) => setTransactionOpen\(true\)\}/);
  assert.match(finance, /<TransactionDialog[\s\S]*?onSave=\{\(transaction\) => \{/);
  assert.match(finance, /applyTransactionMovement\(current, transaction, 1\)/);
});

test('Counter and Finance navigation share a single subscribed finance preview state', () => {
  resetFinancePreviewForTest();
  let notifications = 0;
  const unsubscribe = subscribeFinancePreview(() => { notifications++; });
  try {
    const before = getFinancePreviewSnapshot();
    const baseline = financePreviewRelationshipSummary(before.transactions);
    const cash = before.accounts.find(account => account.id === 'acc-cash');
    assert.ok(cash);
    const transaction = {
      ...before.transactions[0],
      id: 'FIN-COUNTER-TEST',
      type: 'Lender Credit' as const,
      partyId: 'fp2',
      party: 'Hafizur Rahman',
      amount: 175,
      direction: 'in' as const,
      accountId: 'acc-cash',
      account: cash.name,
      paymentAccounts: [{ method: 'Cash' as const, accountId: cash.id, account: cash.name, amount: 175 }]
    };
    updateFinancePreview('transactions', current => [transaction, ...current]);
    updateFinancePreview('accounts', current =>
      current.map(account => account.id === cash.id ? { ...account, balance: account.balance + transaction.amount } : account));
    const after = getFinancePreviewSnapshot();
    assert.equal(after.transactions[0].id, 'FIN-COUNTER-TEST');
    assert.equal(financePreviewRelationshipSummary(after.transactions).outstandingLoan, baseline.outstandingLoan + 175);
    assert.equal(after.accounts.find(account => account.id === cash.id)?.balance, cash.balance + 175);
    assert.equal(after.people.find(person => person.id === 'fp2')?.name, 'Hafizur Rahman');
    assert.equal(notifications, 2);
    assert.equal(before.transactions.some(row => row.id === transaction.id), false);
    // Opening relationship balances do not move cash/bank by themselves.
    const opening = { ...transaction, id: 'FIN-OPENING-TEST', type: 'Opening Loan' as const, direction: 'none' as const };
    const nextSummary = financePreviewRelationshipSummary([opening, ...after.transactions]);
    assert.equal(nextSummary.outstandingLoan, baseline.outstandingLoan + 350);
    assert.equal(getFinancePreviewSnapshot().accounts.find(account => account.id === cash.id)?.balance, cash.balance + 175);
  } finally {
    unsubscribe();
    resetFinancePreviewForTest();
  }
});
