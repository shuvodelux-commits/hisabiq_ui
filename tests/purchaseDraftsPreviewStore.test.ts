import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPurchaseDrafts, savePurchaseDraft, deletePurchaseDraft, subscribePurchaseDrafts,
  type PurchaseDraftInput,
} from '../src/data/purchaseDraftsPreviewStore.ts';

const makeDraft = (tenantId = 'test-tenant'): PurchaseDraftInput => ({
  tenantId, supplierId: '', supplierName: '', date: '2026-10-31',
  backdateReason: '', referenceNo: 'CH-100', notes: 'Delivery pending',
  lines: [], payments: [{ id: 'pay-1', method: 'Cash', account: 'Cash', amount: '0' }],
  discount: '', discountMode: 'amount', photos: ['data:image/png;base64,AA=='], total: 0,
});

test('Purchase drafts save without requiring posting validation and update the same ID', () => {
  let updates = 0;
  const unsubscribe = subscribePurchaseDrafts(() => { updates++; });
  const first = savePurchaseDraft(makeDraft());
  assert.ok(first.id.startsWith('pd-'));
  assert.equal(getPurchaseDrafts().length, 1);
  assert.equal(first.supplierId, '', 'incomplete supplier is allowed in a draft');
  assert.equal(first.payments[0].amount, '0');
  const changed = { ...makeDraft(), notes: 'Deliver next week', discount: '15' };
  const saved = savePurchaseDraft(changed, first.id);
  assert.equal(saved.id, first.id);
  assert.equal(getPurchaseDrafts().length, 1);
  assert.equal(getPurchaseDrafts()[0].notes, 'Deliver next week');
  assert.equal(getPurchaseDrafts()[0].discount, '15');
  assert.ok(updates >= 2);
  deletePurchaseDraft(first.id);
  assert.equal(getPurchaseDrafts().length, 0);
  unsubscribe();
});

test('Purchase draft snapshots are copied and tenant updates cannot cross businesses', () => {
  const input = makeDraft('tenant-a');
  const draft = savePurchaseDraft(input);
  input.photos[0] = 'changed';
  assert.equal(getPurchaseDrafts()[0].photos[0], 'data:image/png;base64,AA==');
  assert.throws(() => savePurchaseDraft(makeDraft('tenant-b'), draft.id), /no longer exists/);
  assert.equal(getPurchaseDrafts().length, 1);
  deletePurchaseDraft(draft.id);
  deletePurchaseDraft(draft.id);
  assert.equal(getPurchaseDrafts().length, 0);
});
