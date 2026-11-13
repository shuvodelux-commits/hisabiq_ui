import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '../src/integration/errors.ts';
import { projectConnectedProductSettings } from '../src/integration/catalog-product-settings-projection.ts';

const id = {
  unit: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  brand: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
  root: '01ARZ3NDEKTSV4RRFFQ69G5FAX',
  child: '01ARZ3NDEKTSV4RRFFQ69G5FAY',
  orphan: '01ARZ3NDEKTSV4RRFFQ69G5FAZ',
  missingParent: '01ARZ3NDEKTSV4RRFFQ69G5FB0',
};
const features = {
  productOffers: true,
  expiryTracking: false,
  serialTracking: true,
  warranty: false,
  customerGroups: true,
  vendors: false,
};
const catalog = () => ({
  data: {
    units: [{
      id: id.unit,
      name: 'Gauge',
      nameBn: 'গেজ',
      symbol: 'Gg',
      version: 9,
    }],
    brands: [{
      id: id.brand,
      name: 'RFL',
      nameBn: null,
      version: 2,
    }],
    categories: [
      { id: id.root, name: 'Electrical', nameBn: null, parentId: null, version: 1 },
      { id: id.child, name: 'Wire', nameBn: 'তার', parentId: id.root, version: 3 },
      { id: id.orphan, name: 'Archived Parent Child', nameBn: null, parentId: id.missingParent, version: 5 },
    ],
    features,
  },
});

test('versioned GET projects only server-grounded IDs, English/Bangla names, symbols and versions', () => {
  const result = projectConnectedProductSettings(catalog());
  assert.equal(result.source, 'catalog-metadata-v1');
  assert.equal(result.completeness, 'partial');
  assert.deepEqual(result.units, [{
    id: id.unit, name: 'Gauge', nameBn: 'গেজ', symbol: 'Gg', version: 9,
    usageCount: null, active: null, unitKind: null,
  }]);
  assert.deepEqual(result.brands, [{
    id: id.brand, name: 'RFL', nameBn: null, version: 2,
    usageCount: null, active: null,
  }]);
});

test('stable category parent IDs remain root, present or unresolved without invented relationships', () => {
  const { categories } = projectConnectedProductSettings(catalog());
  assert.deepEqual(categories.map(row => ({
    id: row.id, parentId: row.parentId, parentState: row.parentState,
  })), [
    { id: id.root, parentId: null, parentState: 'root' },
    { id: id.child, parentId: id.root, parentState: 'present' },
    { id: id.orphan, parentId: id.missingParent, parentState: 'unresolved' },
  ]);
  assert.equal(categories[2]?.name, 'Archived Parent Child');
  assert.equal(categories[2]?.version, 5);
});

test('unknown product usage, reversible status and unit type never turn into zero/active/Base', () => {
  const projected = projectConnectedProductSettings(catalog());
  for (const row of [...projected.units, ...projected.brands, ...projected.categories]) {
    assert.equal(row.usageCount, null);
    assert.equal(row.active, null);
  }
  assert.equal(projected.units[0]?.unitKind, null);
  assert.equal('features' in projected, false);
  assert.equal('defaultUnit' in projected, false);
  assert.equal('tenantId' in projected, false);
});

test('server read support does not grant complete editor, irreversible toggle or atomic English rename', () => {
  const result = projectConnectedProductSettings(catalog());
  assert.equal(result.contracts.versionedRead, true);
  assert.equal(result.contracts.atomicBilingualCreate, true);
  assert.equal(result.contracts.bengaliMetadataPatch, true);
  assert.equal(result.contracts.atomicEnglishAndBengaliEdit, false);
  assert.equal(result.contracts.reversibleActivation, false);
  assert.equal(result.contracts.productUsageCounts, false);
  assert.equal(result.contracts.unitClassification, false);
  assert.equal(result.canMountFullConnectedEditor, false);
  assert.deepEqual(result.blockers.map(x => x.code), [
    'ATOMIC_FULL_NAME_EDIT_MISSING',
    'REVERSIBLE_STATUS_TOGGLE_MISSING',
    'ARCHIVED_MASTER_READ_MISSING',
    'USAGE_COUNTS_MISSING',
    'UNIT_CLASSIFICATION_MISSING',
    'CATEGORY_PARENT_EDITOR_MISSING',
    'PRODUCT_DEFAULTS_SEPARATE',
  ]);
});

test('strict metadata-v1 contract rejects guessed active counts/kinds, extra keys, missing nulls or wrong version', () => {
  const malformed: unknown[] = [
    { data: { ...catalog().data, units: [{ ...catalog().data.units[0], active: true }] } },
    { data: { ...catalog().data, units: [{ ...catalog().data.units[0], usage: 0 }] } },
    { data: { ...catalog().data, units: [{ ...catalog().data.units[0], kind: 'Base' }] } },
    { data: { ...catalog().data, units: [{ ...catalog().data.units[0], version: 0 }] } },
    { data: { ...catalog().data, units: [{ ...catalog().data.units[0], version: 1.5 }] } },
    { data: { ...catalog().data, brands: [{ id: id.brand, name: 'RFL', version: 2 }] } },
    { data: { ...catalog().data, categories: [{ ...catalog().data.categories[0], parentId: 'foreign' }] } },
    { data: { ...catalog().data, brands: [{ ...catalog().data.brands[0], id: 'brand-preview-1' }] } },
    { data: { ...catalog().data, features: { ...features, cashSession: true } } },
  ];
  for (const input of malformed) {
    assert.throws(() => projectConnectedProductSettings(input),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  }
});

test('no shared cache, mutable fixture fallback or caller-controlled projection mutation', () => {
  const firstInput = catalog();
  const first = projectConnectedProductSettings(firstInput);
  firstInput.data.units[0]!.name = 'Changed After Projection';
  assert.equal(first.units[0]?.name, 'Gauge');
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.units), true);
  assert.equal(Object.isFrozen(first.units[0]), true);
  assert.equal(Object.isFrozen(first.blockers), true);
  assert.equal(Object.isFrozen(first.contracts), true);
  const second = projectConnectedProductSettings(catalog());
  assert.notEqual(first, second);
  assert.notEqual(first.units, second.units);
});

test('even an empty valid tenant catalog is incomplete and cannot activate full Product Settings', () => {
  const result = projectConnectedProductSettings({
    data: { units: [], brands: [], categories: [], features },
  });
  assert.deepEqual(result.units, []);
  assert.deepEqual(result.brands, []);
  assert.deepEqual(result.categories, []);
  assert.equal(result.canMountFullConnectedEditor, false);
  assert.equal(result.blockers.length, 7);
});
