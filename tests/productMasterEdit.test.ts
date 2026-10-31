import test from 'node:test';
import assert from 'node:assert/strict';
import { productUnitKey, validateMasterRename, validateUnitRename } from '../src/utils/productMasterEdit.ts';

test('renaming a category trims whitespace and rejects duplicate or empty labels', () => {
  assert.equal(validateMasterRename('Plumbing', ' Water fittings ', ['Plumbing', 'Electrical'], 'category'), 'Water fittings');
  assert.throws(() => validateMasterRename('Plumbing', 'electrical', ['Plumbing', 'Electrical'], 'category'), /already exists/);
  assert.throws(() => validateMasterRename('Plumbing', '  ', ['Plumbing'], 'category'), /Enter/);
  assert.throws(() => validateMasterRename('Missing', 'Other', ['Plumbing'], 'category'), /no longer exists/);
});

test('editing unit symbols preserves stable stock and invoice unit keys', () => {
  const units = [
    { name: 'Piece', value: 'Pcs', symbol: 'pcs', aliases: ['Pieces'] },
    { name: 'Gauge', value: 'Gauge', symbol: 'Gg' },
    { name: 'Box', symbol: 'Box' }
  ];
  assert.deepEqual(validateUnitRename('Gauge', 'Gauge', 'GG', units), { name: 'Gauge', symbol: 'GG' });
  assert.equal(productUnitKey(units[1]), 'Gauge');
  assert.throws(() => validateUnitRename('Gauge', 'Boxes', 'Box', units), /already used/);
  assert.throws(() => validateUnitRename('Gauge', 'Gauge', 'TooLong', units), /short unit symbol/);
  assert.throws(() => validateUnitRename('Gauge', ' ', 'GG', units), /Enter a unit name/);
});
