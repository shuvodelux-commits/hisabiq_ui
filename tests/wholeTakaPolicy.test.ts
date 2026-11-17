import assert from 'node:assert/strict';
import { test } from 'node:test';

import { defaults, parseSettings, roundInvoice, roundNewInvoice } from '../src/settings/model.ts';
import { calculatePurchaseCheckout } from '../src/utils/purchaseCheckout.ts';

test('new tenant uses mandatory nearest-one-taka POS rounding', () => {
  assert.equal(defaults('t1').sections.sales.rounding, 'Nearest ৳1');
  assert.equal(roundNewInvoice(125.49), 125);
  assert.equal(roundNewInvoice(125.50), 126);
  assert.equal(roundNewInvoice(999.9), 1000);
  assert.equal(roundNewInvoice(0.49), 0);
  assert.equal(roundNewInvoice(0.50), 1);
  assert.throws(() => roundNewInvoice(-1), RangeError);
  assert.throws(() => roundNewInvoice(Number.NaN), RangeError);
});

test('existing saved preferences migrate without rewriting posted documents', () => {
  for (const legacy of ['Nearest ৳5', 'No rounding'] as const) {
    const state = defaults('t1');
    state.sections.sales.rounding = legacy;
    const result = parseSettings(JSON.stringify(state), 't1');
    assert.equal(result.recovered, false);
    assert.equal(result.state.sections.sales.rounding, 'Nearest ৳1');
  }
  // Historical purchases must still be validated under the rule frozen when posted.
  assert.equal(roundInvoice(123.49, 'No rounding'), 123.49);
  assert.equal(roundInvoice(123.49, 'Nearest ৳5'), 125);
});

test('new supplier bills apply discounts before whole-taka rounding', () => {
  assert.equal(calculatePurchaseCheckout(125.49, '', 'amount', 'No rounding', []).total, 125);
  assert.equal(calculatePurchaseCheckout(125.50, '', 'amount', 'Nearest ৳5', []).total, 126);
  const bill = calculatePurchaseCheckout(199.90, '10', 'amount', 'No rounding', []);
  assert.equal(bill.net, 189.90);
  assert.equal(bill.total, 190);
  assert.equal(bill.rounding, 0.10);
  assert.equal(bill.roundingLabel, 'Rounding (to ৳1)');
});

test('historical supplier bill totals retain old mode for correction and return checks', () => {
  assert.equal(calculatePurchaseCheckout(125.49, '', 'amount', 'No rounding', [], true).total, 125.49);
  assert.equal(calculatePurchaseCheckout(125.49, '', 'amount', 'Nearest ৳5', [], true).total, 125);
  assert.equal(calculatePurchaseCheckout(125.49, '', 'amount', 'Nearest ৳1', [], true).total, 125);
});
