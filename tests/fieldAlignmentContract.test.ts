import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const css = readFileSync('src/index.css', 'utf8');
const moneyUnit = readFileSync('src/components/MoneyUnitInput.tsx', 'utf8');
const compound = readFileSync('src/components/transactions/CompoundQuantityInput.tsx', 'utf8');

test('joined amount/unit field has one shared height and opt-in outer-shell marker', () => {
  assert.match(moneyUnit, /data-numeric-joined data-field-shell="money-unit"/);
  assert.match(css, /\[data-field-shell="money-unit"\]/);
  assert.match(css, /height:\s*44px/);
  assert.match(css, /button\[role="combobox"\]/);
});

test('touch sizing is applied to joined shells instead of pushing inner controls outside', () => {
  assert.match(css, /@media \(pointer: coarse\)/);
  assert.match(css, /\[data-numeric-joined\]/);
  assert.match(css, /min-height:\s*0\s*!important/);
  assert.match(compound, /data-numeric-joined/);
  assert.match(compound, /data-testid="compound-quantity"/);
});

test('ERP inline controls preserve text alignment while aligning with neighboring fields', () => {
  assert.match(css, /vertical-align:\s*middle/);
  assert.doesNotMatch(css, /\[data-numeric-input\]\s*\{[^}]*text-align:\s*center/);
});
