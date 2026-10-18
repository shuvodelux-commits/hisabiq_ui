import test from 'node:test';
import assert from 'node:assert/strict';
import { salesPaymentTotal } from '../src/utils/salesPaymentAmounts.ts';

test('Sales split payments reject malformed money rather than taking a numeric prefix', () => {
  for(const bad of ['1..2', '100..50', '1e3', '-1', '1.234', '9'.repeat(400)]) {
    assert.ok(Number.isNaN(salesPaymentTotal([{amount:'100'}, {amount:bad}])), bad);
  }
});
test('Sales split payments preserve valid cash and bank amounts to the paisa', () => {
  assert.equal(salesPaymentTotal([{amount:'1000.25'}, {amount:'4870.50'}]), 5870.75);
  assert.equal(salesPaymentTotal([{amount:'.50'}, {amount:'2'}]), 2.5);
  assert.equal(salesPaymentTotal([{amount:'0'}, {amount:'0'}]), 0);
  assert.equal(salesPaymentTotal([{amount:'100'}, {amount:''}]), 100);
});
