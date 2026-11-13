import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  purchaseMoney, purchaseSettlement, purchaseVisibleState,
  type IdentityBoundPurchaseState,
} from '../src/integration/purchases-read-model.ts';

const row = {
  id: '01ARZ3NDEKTSV4RRFFQ69G5FAV', number: 'PUR-1',
  supplierPartyId: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
  supplierName: 'Karim Traders', supplierBillRef: null, businessDate: '2026-11-13',
  dueDate: null, status: 'POSTED' as const, lineCount: 2, overdue: false,
};
test('poisha formatting is exact and never rounds large integers through floating point', () => {
  assert.equal(purchaseMoney(0), '৳0.00');
  assert.equal(purchaseMoney(1), '৳0.01');
  assert.equal(purchaseMoney(500), '৳5.00');
  assert.equal(purchaseMoney(123456789), '৳12,34,567.89');
  assert.equal(purchaseMoney(Number.MAX_SAFE_INTEGER), '৳9,00,71,99,25,47,409.91');
});
test('redacted, null and invalid values are not silently converted to zero', () => {
  assert.equal(purchaseMoney(undefined), '—');
  assert.equal(purchaseMoney(null as any), '—');
  assert.equal(purchaseMoney(NaN), '—');
  assert.equal(purchaseMoney(-1), '—');
  assert.equal(purchaseMoney(0.2), '—');
});
test('purchase status is only inferred from complete authorized monetary fields', () => {
  assert.equal(purchaseSettlement(row), 'HIDDEN');
  assert.equal(purchaseSettlement({ ...row, grandTotalMinor: 10000, paidMinor: 0, dueMinor: 10000 }), 'DUE');
  assert.equal(purchaseSettlement({ ...row, grandTotalMinor: 10000, paidMinor: 2000, dueMinor: 8000 }), 'PARTIAL');
  assert.equal(purchaseSettlement({ ...row, grandTotalMinor: 10000, paidMinor: 10000, dueMinor: 0 }), 'PAID');
  assert.equal(purchaseSettlement({ ...row, status: 'VOIDED' }), 'VOIDED');
  assert.equal(purchaseSettlement({ ...row, paidMinor: 3000, grandTotalMinor: 8000 }), 'HIDDEN');
});
test('stale identity or loading/denied/error state never renders another tenant previous rows', () => {
  const state: IdentityBoundPurchaseState<{ data: string[] }> = {
    key: 'tenant-A:user1:epoch5:tokenA:query', status: 'ready', data: { data: ['A'] },
  };
  assert.deepEqual(purchaseVisibleState(state, state.key), { status: 'ready', data: { data: ['A'] } });
  assert.deepEqual(purchaseVisibleState(state, 'tenant-B:user1:epoch5:tokenB:query'), { status: 'loading', data: null });
  assert.deepEqual(purchaseVisibleState(null, state.key), { status: 'loading', data: null });
  for (const status of ['denied', 'error', 'loading'] as const) {
    assert.deepEqual(purchaseVisibleState({ key: state.key, status, data: null }, state.key),
      { status, data: null });
  }
});
test('connected boundary must render no preview fixture from connected mode', () => {
  const source = readFileSync(new URL('../src/pages/Purchases.tsx', import.meta.url), 'utf8');
  assert.match(source, /export function Purchases\(\)[\s\S]*?mode\s*===\s*['"]connected['"][\s\S]*?<ConnectedPurchasesRead/);
  assert.match(source, /function PreviewPurchases\(\)/);
  assert.match(source, /useState<Purchase\[\]>\(availablePurchases\)/);
  const connected = readFileSync(new URL('../src/components/purchases/ConnectedPurchasesRead.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(connected, /erpDemoStore|availablePurchases|purchaseDraftsPreviewStore|createPreviewPurchase|PurchaseSourceDialog/);
  assert.match(connected, /readPurchases/);
  assert.match(connected, /readPurchase/);
  assert.match(connected, /selected\?\.identity === identity/);
  assert.match(connected, /setRetryVersion\(version => version \+ 1\)/);
  assert.doesNotMatch(connected, /requestJson|method:\s*['"]POST['"]/);
});
