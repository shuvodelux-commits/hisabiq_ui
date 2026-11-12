import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScaledInput } from '../src/integration/decimal.ts';

test('BDT decimal input converts to integer poisha without floating-point rounding', () => {
  assert.equal(parseScaledInput('1250.75', 2), 125075);
  assert.equal(parseScaledInput('0.01', 2), 1);
  assert.equal(parseScaledInput('0', 2), 0);
  assert.equal(parseScaledInput('0.00', 2), 0);
  assert.equal(parseScaledInput('-1250.75', 2), -125075);
});

test('Bangla digits normalize to exactly the same scale', () => {
  assert.equal(parseScaledInput('০.১২', 2), 12);
  assert.equal(parseScaledInput('১২৫০.৭৫', 2), 125075);
  assert.equal(parseScaledInput(' -০.১২ ', 2), -12);
  assert.equal(parseScaledInput('১.০০০১', 4), 10001);
});

test('common decimal input normalization supports leading and trailing decimal points', () => {
  assert.equal(parseScaledInput('.5', 2), 50);
  assert.equal(parseScaledInput('1.', 2), 100);
  assert.equal(parseScaledInput('-.5', 2), -50);
  assert.equal(parseScaledInput(' 1. ', 3), 1000);
});

test('quantity scale 3 and unit-cost scale 4 remain independent', () => {
  assert.equal(parseScaledInput('0.001', 3), 1);
  assert.equal(parseScaledInput('1.234', 3), 1234);
  assert.equal(parseScaledInput('0.0001', 4), 1);
  assert.equal(parseScaledInput('1.2345', 4), 12345);
  assert.equal(parseScaledInput('1', 4), 10000);
});

test('precision overflow refuses to round or silently truncate', () => {
  for (const [value, scale] of [
    ['1.005', 2], ['0.001', 2], ['.0001', 3], ['12.34567', 4],
  ] as const) {
    assert.throws(() => parseScaledInput(value, scale), /decimal|precision|places|invalid/i);
  }
});

test('formatted, exponential, non-finite and ambiguous inputs are rejected', () => {
  for (const value of [
    '', ' ', '.', '-', '+2', '1,200.50', '1e3', '1E+5', 'Infinity', 'NaN',
    '1 000.00', '1.2.3', '1-2', '0x10', '١.٢', '১২,০০০.৫', '1\n2',
  ]) {
    assert.throws(() => parseScaledInput(value, 2), undefined, value);
  }
});

test('MAX_SAFE_INTEGER poisha boundary is exact in both signs', () => {
  assert.equal(parseScaledInput('90071992547409.91', 2), Number.MAX_SAFE_INTEGER);
  assert.equal(parseScaledInput('-90071992547409.91', 2), Number.MIN_SAFE_INTEGER);
  assert.throws(() => parseScaledInput('90071992547409.92', 2), /large|safe|range/i);
  assert.throws(() => parseScaledInput('-90071992547409.92', 2), /large|safe|range/i);
  assert.throws(() => parseScaledInput('9007199254740992', 2), /large|safe|range/i);
});

test('huge input is handled as integer and rejected without float loss', () => {
  assert.throws(() => parseScaledInput('999999999999999999999999.99', 2), /large|safe|range/i);
  assert.equal(parseScaledInput('9007199254740.991', 3), Number.MAX_SAFE_INTEGER);
});
