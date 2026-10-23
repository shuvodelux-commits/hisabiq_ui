/* Cheap source check: shared input fields keep consistent focus semantics.
   It does not change sizes, page actions, cart layouts or ERP logic. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const fromRoot = name => fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
const css = fromRoot('src/index.css');
const input = fromRoot('src/components/Input.tsx');
const select = fromRoot('src/components/AppSelect.tsx');
const searchable = fromRoot('src/components/SearchSelect.tsx');
const calendar = fromRoot('src/components/AppDateRangePicker.tsx');
const numeric = fromRoot('src/components/NumericInput.tsx');
const joined = fromRoot('src/components/MoneyUnitInput.tsx');

assert.equal((input.match(/data-hisabiq-input=""/g) || []).length, 2,
  'Both clearable and ordinary text fields must use shared input focus styling');
for (const [name, contents, marker] of [
  ['AppSelect', select, 'data-hisabiq-select=""'],
  ['SearchSelect', searchable, 'data-hisabiq-select=""'],
  ['DateRangePicker', calendar, 'data-hisabiq-select=""'],
  ['NumericInput', numeric, 'data-hisabiq-numeric=""'],
  ['MoneyUnitInput', joined, 'data-hisabiq-field-shell=""']
]) {
  assert.ok(contents.includes(marker), name + ' must declare its shared focus surface');
}
assert.match(css, /\[data-hisabiq-input\].*:is\(:focus, :focus-visible\)/,
  'Text fields need the same mouse and keyboard focus state');
assert.match(css, /\[data-hisabiq-numeric\].*focus-within/,
  'Numeric fields need focus-within on their outer shell');
assert.match(css, /\[data-hisabiq-field-shell\].*focus-within/,
  'Joined amount and unit must draw one outer focus ring');
assert.match(css, /\[data-hisabiq-select\].*\[aria-expanded="true"\]/,
  'Open dropdowns must visibly retain focus');
assert.match(css, /\[aria-invalid="true"\]/,
  'Validation error state must remain visible');
assert.match(css, /\[data-cart-row\] input/,
  'The native input exception must preserve compact cart geometry');
// Same Button contract as main: this branch does NOT introduce button priority tiers.
assert.match(css, /\.hisabiq-button\[data-hisabiq-size="sm"\]\s*\{\s*min-height: 36px;/,
  'The prior button size must stay unchanged');
assert.doesNotMatch(css, /\[data-hisabiq-action-context="page"\]/,
  'Reverted button-priority overrides must not return');
console.log('HisabIQ input focus consistency source contract: PASS');
