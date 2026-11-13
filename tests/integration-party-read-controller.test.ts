import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  TradingPartyReadController,
  type TradingPartyReadTransport,
} from '../src/integration/party-read-controller.ts';
import type {
  TradingLedger,
  TradingPartyList,
} from '../src/integration/party-reads.ts';
import type { SessionSnapshot } from '../src/integration/session.ts';

const partyId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const lineId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const entryId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const sourceId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const positive = {
  netMinor: 500_000, direction: 'RECEIVABLE',
  outstandingMinor: 500_000, advanceMinor: 0,
} as const;
const negative = {
  netMinor: -300_000, direction: 'PAYABLE',
  outstandingMinor: 0, advanceMinor: 300_000,
} as const;
const zero = {
  netMinor: 0, direction: 'SETTLED',
  outstandingMinor: 0, advanceMinor: 0,
} as const;
const customerList: TradingPartyList = {
  data: [{
    id: partyId, name: 'One Identity', roles: ['CUSTOMER', 'SUPPLIER'],
    phone: '01712345678', address: 'Hidden', guardianName: 'Private',
    nid: '1234567890', email: 'secret@example.test', notes: 'Sensitive',
    customerGroupId: null, customerGroupName: null, creditLimitMinor: 500_000,
    status: 'ACTIVE', isSystemReserved: false, version: 1,
    balance: positive, hasLedgerEntries: true,
  }],
  summary: {
    total: 2, active: 2, inactive: 0, ungrouped: 2,
    totalOutstandingMinor: 500_000, totalAdvanceMinor: 0, overCreditLimit: 0,
  },
  page: { nextCursor: null, hasMore: false },
};
const supplierList: TradingPartyList = {
  ...customerList,
  data: [{ ...customerList.data[0]!, balance: negative,
    customerGroupId: null, customerGroupName: null, creditLimitMinor: null }],
  summary: { ...customerList.summary, ungrouped: null,
    totalOutstandingMinor: 0, totalAdvanceMinor: 300_000 },
};
const customerLedger: TradingLedger = {
  partyId,
  partyName: 'One Identity',
  openingBalance: zero,
  closingBalance: positive,
  rows: [{
    journalEntryId: entryId, journalLineId: lineId,
    businessDate: '2026-01-01', sourceDocumentType: 'OPENING_BALANCE',
    sourceDocumentId: sourceId, sourceNumber: 'OPN-000001',
    account: 'AR', amountMinor: 500_000, debitMinor: 500_000,
    creditMinor: 0, runningBalanceMinor: 500_000,
  }],
  totalDebitMinor: 500_000, totalCreditMinor: 0,
  page: { nextCursor: null, hasMore: false },
};

const authenticated = {
  status: 'authenticated',
  epoch: 1,
  tenantId: 'tenant-A',
  userId: 'user-A',
  accessToken: 'secret-access-A',
  timezone: 'Asia/Dhaka',
  username: 'a',
  displayName: 'User A',
  roleName: 'Cashier',
  businessName: 'Shop A',
  permissions: ['customer.view'],
  features: [],
  persistence: 'memory',
} as const satisfies SessionSnapshot;

class FakeSession {
  private state: SessionSnapshot = authenticated;
  private readonly listeners = new Set<() => void>();
  getSnapshot = (): SessionSnapshot => this.state;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  set(value: SessionSnapshot): void {
    this.state = value;
    for (const listener of this.listeners) listener();
  }
  setSilently(value: SessionSnapshot): void { this.state = value; }
  get subscriberCount(): number { return this.listeners.size; }
}

function reader(overrides: Partial<TradingPartyReadTransport> = {}): TradingPartyReadTransport {
  return {
    list: async () => customerList,
    ledger: async () => customerLedger,
    opening: async () => ({ data: null }),
    ...overrides,
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test('directory reads one explicit authenticated role and preserves role-scoped poisha net', async () => {
  const store = new FakeSession();
  const seen: unknown[] = [];
  const controller = new TradingPartyReadController(store, reader({
    list: async (token, role, query, signal) => {
      seen.push({ token, role, query, aborted: signal.aborted });
      return customerList;
    },
  }));
  const snapshots: string[] = [];
  controller.subscribe(() => snapshots.push(controller.getSnapshot().status));
  const result = await controller.loadDirectory('Customer', { search: 'Electrical', limit: 20 });
  assert.deepEqual(seen, [{
    token: 'secret-access-A', role: 'CUSTOMER',
    query: { search: 'Electrical', limit: 20 }, aborted: false,
  }]);
  assert.equal(result?.items[0]?.net.signedMinor, 500_000);
  assert.equal(result?.selectedRoleSummary.total, 2);
  assert.deepEqual(snapshots, ['loading', 'directory']);
  const exposed = JSON.stringify(controller.getSnapshot());
  assert.equal(exposed.includes('secret-access-A'), false);
  assert.equal(exposed.includes('1234567890'), false);
  assert.equal(exposed.includes('hasLedgerEntries'), false);
  controller.dispose();
});

test('Supplier list remains independent of the same Customer identity and strips customer-only fields', async () => {
  const store = new FakeSession();
  const controller = new TradingPartyReadController(store, reader({
    list: async (_token, role) => role === 'SUPPLIER' ? supplierList : customerList,
  }));
  const customer = await controller.loadDirectory('Customer');
  const supplier = await controller.loadDirectory('Supplier');
  assert.equal(customer?.items[0]?.partyId, supplier?.items[0]?.partyId);
  assert.equal(customer?.items[0]?.net.signedMinor, 500_000);
  assert.equal(supplier?.items[0]?.net.signedMinor, -300_000);
  assert.equal(supplier?.items[0]?.customerCreditLimitMinor, null);
  assert.equal(supplier?.selectedRoleSummary.negativeNetMagnitudeTotalMinor, 300_000);
  assert.equal('allRoleBalance' in (controller.getSnapshot() ?? {}), false);
  controller.dispose();
});

test('ledger is explicitly party-and-role-scoped and keeps original journal provenance', async () => {
  const store = new FakeSession();
  const calls: unknown[] = [];
  const controller = new TradingPartyReadController(store, reader({
    ledger: async (token, id, role, query) => {
      calls.push({ token, id, role, query });
      return customerLedger;
    },
  }));
  const value = await controller.loadLedger('Customer', partyId, { fromDate: '2026-01-01' });
  assert.deepEqual(calls, [{
    token: 'secret-access-A', id: partyId, role: 'CUSTOMER',
    query: { fromDate: '2026-01-01' },
  }]);
  assert.equal(value?.rows[0]?.controlAccount, 'AR');
  assert.equal(value?.rows[0]?.journalLineId, lineId);
  assert.equal(value?.rows[0]?.sourceDocumentId, sourceId);
  assert.equal(value?.serverClosingNet.signedMinor, 500_000);
  assert.equal('canReverse' in (value?.rows[0] ?? {}), false);
  controller.dispose();
});

test('All and four unimplemented finance relationships fail closed with no HTTP call', async () => {
  const store = new FakeSession();
  let calls = 0;
  const controller = new TradingPartyReadController(store, reader({
    list: async () => { calls++; return customerList; },
  }));
  await controller.loadDirectory('Customer');
  for (const relationship of ['All', 'Lender', 'Borrower', 'Owner', 'Payee'] as const) {
    await assert.rejects(controller.loadDirectory(relationship), (e: unknown) =>
      e instanceof ApiError && e.kind === 'protocol');
    assert.equal(controller.getSnapshot().status, 'idle');
  }
  assert.equal(calls, 1);
  controller.dispose();
});

test('signed-out and locked sessions cannot make reads and clear any prior data', async () => {
  const store = new FakeSession();
  const controller = new TradingPartyReadController(store, reader());
  await controller.loadDirectory('Customer');
  store.set({ status: 'locked', epoch: 2, reason: 'inactivity', persistence: 'memory' });
  assert.equal(controller.getSnapshot().status, 'idle');
  await assert.rejects(controller.loadDirectory('Customer'), ApiError);
  store.set({ status: 'signed-out', epoch: 3 });
  await assert.rejects(controller.loadLedger('Customer', partyId), ApiError);
  assert.equal(controller.getSnapshot().status, 'idle');
  controller.dispose();
});

test('role switch aborts previous list and never publishes its late successful result', async () => {
  const store = new FakeSession();
  const pending = deferred<TradingPartyList>();
  let earlierSignal: AbortSignal | null = null;
  const controller = new TradingPartyReadController(store, reader({
    list: async (_token, role, _query, signal) => {
      if (role === 'CUSTOMER') { earlierSignal = signal; return pending.promise; }
      return supplierList;
    },
  }));
  const states: string[] = [];
  controller.subscribe(() => states.push(controller.getSnapshot().status));
  const earlier = controller.loadDirectory('Customer');
  const latest = await controller.loadDirectory('Supplier');
  assert.equal(earlierSignal?.aborted, true);
  pending.resolve(customerList);
  assert.equal(await earlier, null);
  assert.equal(latest?.selectedRole, 'SUPPLIER');
  assert.equal(controller.getSnapshot().status, 'directory');
  assert.equal((controller.getSnapshot() as {value?: {selectedRole: string}}).value?.selectedRole, 'SUPPLIER');
  assert.deepEqual(states, ['loading', 'loading', 'directory']);
  controller.dispose();
});

test('stale error from previous role cannot overwrite later successful data', async () => {
  const store = new FakeSession();
  const delayed = deferred<TradingPartyList>();
  const controller = new TradingPartyReadController(store, reader({
    list: async (_token, role) => role === 'CUSTOMER' ? delayed.promise : supplierList,
  }));
  const previous = controller.loadDirectory('Customer');
  const current = await controller.loadDirectory('Supplier');
  delayed.reject(new ApiError('http', 'Denied', { status: 403 }));
  assert.equal(await previous, null);
  assert.equal(current?.selectedRole, 'SUPPLIER');
  assert.equal(controller.getSnapshot().status, 'directory');
  controller.dispose();
});

test('tenant/user or token epoch switch clears visible records before any stale completion', async () => {
  const store = new FakeSession();
  const deferredList = deferred<TradingPartyList>();
  let signal: AbortSignal | null = null;
  const tokens: string[] = [];
  const controller = new TradingPartyReadController(store, reader({
    list: async (token, _role, _query, abort) => {
      tokens.push(token);
      signal = abort;
      return token === 'secret-access-A' ? deferredList.promise : supplierList;
    },
  }));
  const first = controller.loadDirectory('Customer');
  store.set({
    ...authenticated, epoch: 2, tenantId: 'tenant-B', userId: 'user-B',
    accessToken: 'secret-access-B',
  });
  assert.equal(signal?.aborted, true);
  assert.equal(controller.getSnapshot().status, 'idle');
  deferredList.resolve(customerList);
  assert.equal(await first, null);
  const second = await controller.loadDirectory('Supplier');
  assert.equal(second?.items[0]?.net.signedMinor, -300_000);
  assert.deepEqual(tokens, ['secret-access-A', 'secret-access-B']);
  controller.dispose();
});

test('post-request session change invalidates data even if session forgot to notify listeners', async () => {
  const store = new FakeSession();
  const pending = deferred<TradingPartyList>();
  const controller = new TradingPartyReadController(store, reader({
    list: async () => pending.promise,
  }));
  const request = controller.loadDirectory('Customer');
  store.setSilently({ ...authenticated, epoch: 3, accessToken: 'rotated' });
  pending.resolve(customerList);
  assert.equal(await request, null);
  assert.notEqual(controller.getSnapshot().status, 'directory');
  controller.dispose();
});

test('403 and network/protocol failures never fall back to cached or preview directory', async () => {
  for (const error of [
    new ApiError('http', 'Permission denied', { status: 403 }),
    new ApiError('network', 'Offline'),
    new ApiError('protocol', 'Invalid payload'),
  ]) {
    const store = new FakeSession();
    let fail = false;
    const controller = new TradingPartyReadController(store, reader({
      list: async () => { if (fail) throw error; return customerList; },
    }));
    await controller.loadDirectory('Customer');
    fail = true;
    await assert.rejects(controller.loadDirectory('Customer'), e => e === error);
    const state = controller.getSnapshot();
    assert.equal(state.status, 'error');
    if (state.status === 'error') {
      assert.equal(state.errorKind, error.kind);
      assert.equal(state.httpStatus, error.status ?? null);
    }
    assert.equal(JSON.stringify(state).includes('One Identity'), false);
    assert.equal(JSON.stringify(state).includes('Permission denied'), false);
    controller.dispose();
  }
});

test('two successive reads always re-fetch; no cross-token or previous-page cache', async () => {
  const store = new FakeSession();
  let calls = 0;
  const controller = new TradingPartyReadController(store, reader({
    list: async () => { calls++; return customerList; },
  }));
  await controller.loadDirectory('Customer');
  await controller.loadDirectory('Customer');
  assert.equal(calls, 2);
  controller.dispose();
});

test('dispose cancels pending reads, drops subscriptions, and prevents later publication', async () => {
  const store = new FakeSession();
  const pending = deferred<TradingPartyList>();
  let signal: AbortSignal | null = null;
  const controller = new TradingPartyReadController(store, reader({
    list: async (_token, _role, _query, abort) => { signal = abort; return pending.promise; },
  }));
  let notifications = 0;
  controller.subscribe(() => { notifications++; });
  const requested = controller.loadDirectory('Customer');
  const before = notifications;
  controller.dispose();
  assert.equal(signal?.aborted, true);
  assert.equal(store.subscriberCount, 0);
  pending.resolve(customerList);
  assert.equal(await requested, null);
  assert.equal(controller.getSnapshot().status, 'idle');
  assert.equal(notifications, before);
  await assert.rejects(controller.loadDirectory('Customer'), ApiError);
});

test('role-invalid or party-ID-invalid ledger read fails before exposing unverified data', async () => {
  const store = new FakeSession();
  const controller = new TradingPartyReadController(store, reader());
  await assert.rejects(controller.loadLedger('Borrower', partyId), ApiError);
  await assert.rejects(controller.loadLedger('Customer', 'fake-preview-party'), ApiError);
  const state = controller.getSnapshot();
  assert.equal(state.status, 'error');
  if (state.status === 'error') assert.equal(state.errorKind, 'protocol');
  controller.dispose();
});
