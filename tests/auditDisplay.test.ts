import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFieldLabel, formatAuditValue } from '../src/utils/auditDisplay.ts';

test('non-money quantities never display as taka', () => {
  assert.equal(formatAuditValue('quantity', 5), '5');
  assert.equal(formatAuditValue('quantity', 3.125), '3.125');
  assert.equal(formatAuditValue('returnedQuantity', 2), '2');
});

test('money fields retain the taka symbol and Bangladeshi grouping', () => {
  assert.equal(formatAuditValue('amount', 125400), '৳1,25,400');
  assert.equal(formatAuditValue('paid', 12.5), '৳12.50');
  assert.equal(formatAuditValue('cogs', 1200), '৳1,200');
});

test('payment change history shows account and amount for each split', () => {
  const value = [
    { account: 'Main Cash Counter', amount: 6000 },
    { account: 'bKash Business · 412', amount: 1500.25 }
  ];
  assert.equal(formatAuditValue('paymentAccounts', value),
    'Main Cash Counter · ৳6,000 + bKash Business · 412 · ৳1,500.25');
});

test('missing values and unknown object values remain readable', () => {
  assert.equal(formatAuditValue('party', null), '—');
  assert.equal(formatAuditValue('note', ''), '—');
  assert.equal(formatAuditValue('paymentAccounts', []), '—');
  assert.notEqual(formatAuditValue('extra', { before: 1 }), '[object Object]');
});

test('field labels use plain English instead of internal names', () => {
  assert.equal(auditFieldLabel('paymentAccounts'), 'Payment accounts');
  assert.equal(auditFieldLabel('partyId'), 'Party ID');
  assert.equal(auditFieldLabel('quantity'), 'Quantity');
});
