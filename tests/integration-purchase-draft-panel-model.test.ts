import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ApiError } from '../src/integration/errors.ts';
import {
  purchaseDraftPanelIdentity,
  purchaseDraftPanelReadKey,
  visiblePurchaseDraftPanelState,
  verifyPurchaseDraftListState,
  verifyPurchaseDraftTransition,
} from '../src/integration/purchase-draft-panel-model.ts';
import type { SessionSnapshot } from '../src/integration/session.ts';
import type { ServerPurchaseDraft } from '../src/integration/purchase-drafts.ts';

const tenant = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const user = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const draftId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const recovery = '2026-11-13T08:00:00.000Z';
const row: ServerPurchaseDraft = {
  id: draftId, label: 'Supplier bill', supplierName: 'Rahman Traders',
  itemCount: 2, grandTotalMinor: 12345, cart: {
    schema: 'hisabiq.purchase-editor.draft.v1', lines: [],
  },
  version: 1, businessDate: '2026-11-13',
  savedAt: '2026-11-13T07:00:00.000Z',
  createdAt: '2026-11-13T06:00:00.000Z',
  deletedAt: null, recoverableUntilEpochMs: null,
};
function session(overrides: Record<string, unknown> = {}): SessionSnapshot {
  return {
    status: 'authenticated', tenantId: tenant, userId: user, epoch: 3,
    accessToken: 'opaque-bearer', timezone: 'Asia/Dhaka',
    username: 'owner', displayName: 'Owner', roleName: 'Owner',
    businessName: 'Hardware',
    permissions: ['purchase.bill.create', 'inventory.cost.view'],
    features: [], persistence: 'memory',
    ...overrides,
  } as SessionSnapshot;
}
const protocol = (error: unknown): boolean =>
  error instanceof ApiError && error.kind === 'protocol';

test('preview, locked, unauthenticated and role-denied clients never get a draft bearer context', () => {
  assert.equal(purchaseDraftPanelIdentity('preview', session()), null);
  for (const snapshot of [
    { status: 'preview', epoch: 0 },
    { status: 'signed-out', epoch: 1 },
    { status: 'authenticating', epoch: 2 },
    { status: 'locked', reason: 'inactivity', epoch: 3, persistence: 'memory' },
  ]) assert.equal(purchaseDraftPanelIdentity('connected', snapshot as SessionSnapshot), null);
  for (const changed of [
    { tenantId: 't1' },
    { userId: 'preview-user' },
    { accessToken: '' },
    { accessToken: 'bad token' },
    { permissions: ['purchase.bill.create'] },
    { permissions: ['inventory.cost.view'] },
    { permissions: [] },
  ]) assert.equal(purchaseDraftPanelIdentity('connected', session(changed)), null);
});

test('real session identity keys include tenant, user, auth epoch and bearer rotation', () => {
  const first = purchaseDraftPanelIdentity('connected', session())!;
  assert.equal(first.accessToken, 'opaque-bearer');
  for (const changed of [
    { tenantId: user }, { userId: tenant }, { epoch: 4 }, { accessToken: 'rotated' },
  ]) {
    const other = purchaseDraftPanelIdentity('connected', session(changed))!;
    assert.notEqual(other.key, first.key);
  }
  const old = purchaseDraftPanelReadKey(first.key, 'active', 0);
  const afterReload = purchaseDraftPanelReadKey(first.key, 'active', 1);
  const deleted = purchaseDraftPanelReadKey(first.key, 'deleted', 0);
  assert.notEqual(old, afterReload);
  assert.notEqual(old, deleted);
  assert.throws(() => purchaseDraftPanelReadKey(first.key, 'bad' as any, 0), protocol);
});

test('a stale request, another tenant, switched filter or failed request cannot render old rows', () => {
  const id = purchaseDraftPanelIdentity('connected', session())!.key;
  const key = purchaseDraftPanelReadKey(id, 'active', 0);
  const ready = {key, status:'ready' as const, data:[row]};
  assert.equal(visiblePurchaseDraftPanelState(ready, key).data?.[0]?.id, draftId);
  for (const alternative of [
    purchaseDraftPanelReadKey(id, 'active', 1),
    purchaseDraftPanelReadKey(id, 'deleted', 0),
    purchaseDraftPanelReadKey(purchaseDraftPanelIdentity('connected',
      session({tenantId:user}))!.key, 'active', 0),
  ]) {
    const other = visiblePurchaseDraftPanelState(ready, alternative);
    assert.equal(other.data, null);
    assert.equal(other.status, 'loading');
  }
  assert.equal(visiblePurchaseDraftPanelState(null, key).data, null);
  assert.equal(visiblePurchaseDraftPanelState(
    {key,status:'denied',data:null},key).data,null);
});

test('list state must match selected Active / Recycle Bin filter and contain distinct versions', () => {
  const deleted: ServerPurchaseDraft = {
    ...row, version:2, deletedAt:recovery,
    recoverableUntilEpochMs:Date.parse(recovery)+30*86_400_000,
  };
  assert.equal(verifyPurchaseDraftListState([row], 'active')[0], row);
  assert.equal(verifyPurchaseDraftListState([deleted], 'deleted')[0], deleted);
  assert.throws(() => verifyPurchaseDraftListState([deleted], 'active'), protocol);
  assert.throws(() => verifyPurchaseDraftListState([row], 'deleted'), protocol);
  assert.throws(() => verifyPurchaseDraftListState([row,row], 'active'), protocol);
  assert.throws(() => verifyPurchaseDraftListState(
    Array.from({length:101}, (_,i)=>({...row,id:String(i).padStart(26,'0')})), 'active'), protocol);
});

test('only versioned confirmed delete/restore can advance UI state', () => {
  const deleted: ServerPurchaseDraft = {
    ...row, version:2, deletedAt:recovery,
    recoverableUntilEpochMs:Date.parse(recovery)+30*86_400_000,
  };
  assert.equal(verifyPurchaseDraftTransition(row,deleted,'recycle'),deleted);
  assert.equal(verifyPurchaseDraftTransition(deleted,{...row,version:3},'restore').version,3);
  for (const after of [
    {...deleted,id:user},
    {...deleted,version:1},
    {...deleted,version:4},
    {...deleted,deletedAt:null},
    {...deleted,recoverableUntilEpochMs:null},
  ]) assert.throws(() => verifyPurchaseDraftTransition(row,after,'recycle'),protocol);
  assert.throws(() => verifyPurchaseDraftTransition(deleted,deleted,'restore'),protocol);
  assert.throws(() => verifyPurchaseDraftTransition(deleted,{
    ...row,version:3,recoverableUntilEpochMs:Date.parse(recovery)+30*86_400_000,
  },'restore'),protocol);
});

test('draft management is mounted only in connected Purchases, not preview or workspace gate', () => {
  const purchases = readFileSync(new URL('../src/pages/Purchases.tsx',import.meta.url),'utf8');
  const gate = readFileSync(new URL('../src/integration/ConnectedWorkspaceGate.tsx',import.meta.url),'utf8');
  const start = purchases.indexOf('function ConnectedPurchasesRead()');
  const finish = purchases.indexOf('function PreviewPurchases(');
  assert.ok(start >= 0 && finish > start);
  assert.match(purchases.slice(start,finish), /<ConnectedPurchaseDraftsPanel\s*\/>/);
  assert.doesNotMatch(purchases.slice(finish), /<ConnectedPurchaseDraftsPanel\s*\/>/);
  assert.match(gate, /workspace=pending/);
  assert.match(gate, /snapshot.status === 'authenticated'/);
});
