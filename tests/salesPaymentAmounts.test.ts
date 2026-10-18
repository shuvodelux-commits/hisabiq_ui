import test from 'node:test';
import assert from 'node:assert/strict';
import {positiveSalesAmount, salesPaymentTotal} from '../src/utils/salesPaymentAmounts.ts';

test('Sales must reject malformed complete money strings, not parse prefixes', () => {
  for (const bad of ['1..2', '100..50', '12.345', '-1', 'Infinity', '1e3', '9'.repeat(400)]) {
    assert.ok(Number.isNaN(positiveSalesAmount(bad)), bad);
    assert.ok(Number.isNaN(salesPaymentTotal([{amount:bad}])), bad);
  }
});
test('valid split amounts use integer paisa and preserve exact totals', () => {
  assert.equal(salesPaymentTotal([{amount:'1000'}, {amount:'4870.50'}]), 5870.5);
  assert.equal(salesPaymentTotal([{amount:'0.10'}, {amount:'0.20'}]), 0.3);
  assert.equal(salesPaymentTotal([{amount:''}, {amount:'15'}]), 15);
  assert.ok(Number.isNaN(salesPaymentTotal([])));
  assert.equal(positiveSalesAmount('0.01'), 0.01);
  assert.ok(Number.isNaN(positiveSalesAmount('0')));
  assert.ok(Number.isNaN(positiveSalesAmount('')));
});
