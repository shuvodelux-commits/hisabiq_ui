import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { decodeCatalog } from '../src/integration/catalog.ts';

const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const brandId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const categoryId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';

const features = {
  productOffers: false,
  expiryTracking: true,
  serialTracking: false,
  warranty: true,
  customerGroups: false,
  vendors: false,
};

test('catalog decoder preserves existing exact legacy id/name response', () => {
  const source = { data: {
    units: [{ id: unitId, name: 'Piece' }],
    brands: [{ id: brandId, name: 'Local' }],
    categories: [{ id: categoryId, name: 'Electrical', parentId: null }],
    features,
  } };
  const output = decodeCatalog(source);
  assert.deepEqual(output, source);
  assert.equal(Object.hasOwn(output.data.units[0]!, 'nameBn'), false);
  assert.equal(Object.hasOwn(output.data.units[0]!, 'symbol'), false);
});

test('catalog decoder preserves exact optional Bangla labels and unit symbols', () => {
  const source = { data: {
    units: [
      { id: unitId, name: 'Piece', nameBn: 'পিস', symbol: 'Pcs' },
      { id: brandId, name: 'Gira', nameBn: null, symbol: null },
    ],
    brands: [{ id: brandId, name: 'Local', nameBn: 'লোকাল' }],
    categories: [{ id: categoryId, name: 'Electrical', nameBn: 'ইলেকট্রিক', parentId: null }],
    features,
  } };
  const output = decodeCatalog(source);
  assert.deepEqual(output, source);
  assert.equal(output.data.units[0]?.nameBn, 'পিস');
  assert.equal(output.data.units[0]?.symbol, 'Pcs');
  assert.equal(output.data.brands[0]?.nameBn, 'লোকাল');
  assert.equal(output.data.categories[0]?.nameBn, 'ইলেকট্রিক');
  assert.equal(output.data.units[1]?.symbol, null);
});

test('decoder accepts optional metadata independently without inventing missing fields', () => {
  const source = { data: {
    units: [{ id: unitId, name: 'Box', symbol: 'Bx' }],
    brands: [{ id: brandId, name: 'Brand', nameBn: null }],
    categories: [{ id: categoryId, name: 'Hardware', parentId: null }],
    features,
  } };
  const output = decodeCatalog(source);
  assert.deepEqual(output, source);
  assert.equal(Object.hasOwn(output.data.units[0]!, 'nameBn'), false);
  assert.equal(Object.hasOwn(output.data.categories[0]!, 'nameBn'), false);
});

test('wrong metadata type, unrelated fields and symbol on non-unit fail closed', () => {
  const valid = { data: {
    units: [{ id: unitId, name: 'Piece' }],
    brands: [{ id: brandId, name: 'Local' }],
    categories: [{ id: categoryId, name: 'Electrical', parentId: null }],
    features,
  } };
  const invalid = [
    { ...valid, data: { ...valid.data, units: [{ id: unitId, name: 'Piece', symbol: 1 }] } },
    { ...valid, data: { ...valid.data, units: [{ id: unitId, name: 'Piece', nameBn: false }] } },
    { ...valid, data: { ...valid.data, units: [{ id: unitId, name: 'Piece', unexpected: 'discard?' }] } },
    { ...valid, data: { ...valid.data, brands: [{ id: brandId, name: 'Local', symbol: 'Wrong' }] } },
    { ...valid, data: { ...valid.data, categories: [{ id: categoryId, name: 'Electrical', nameBn: 42, parentId: null }] } },
    { ...valid, data: { ...valid.data, categories: [{ id: categoryId, name: 'Electrical', nameBn: 'বিদ্যুৎ' }] } },
  ];
  for (const candidate of invalid) {
    assert.throws(() => decodeCatalog(candidate),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  }
});
