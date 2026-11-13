import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  TradingPartyReadController,
  type TradingPartyReadTransport,
} from '../src/integration/party-read-controller.ts';
import type { TradingPartyDetail } from '../src/integration/party-reads.ts';
import type { SessionSnapshot } from '../src/integration/session.ts';

const id = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const otherId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const customer: TradingPartyDetail = {
  data: {
    id, name: 'Shared Identity', roles: ['CUSTOMER', 'SUPPLIER'],
    phone: '01712345678',
    address: 'PRIVATE street',
    guardianName: 'PRIVATE guardian',
    nid: 'PRIVATE national identifier',
    email: 'PRIVATE@example.invalid',
    notes: 'PRIVATE note',
    customerGroupId: null,
    customerGroupName: 'Retail',
    creditLimitMinor: 800_000,
    status: 'ACTIVE',
    isSystemReserved: false,
    version: 3,
    hasLedgerEntries: true,
    balance: {
      netMinor: 500_000,
      direction: 'RECEIVABLE',
      outstandingMinor: 500_000,
      advanceMinor: 0,
    },
  },
};
const supplier: TradingPartyDetail = {
  data: {
    ...customer.data,
    customerGroupId: null,
    customerGroupName: null,
    creditLimitMinor: null,
    balance: {
      netMinor: -300_000,
      direction: 'PAYABLE',
      outstandingMinor: 0,
      advanceMinor: 300_000,
    },
  },
};
const authenticated = {
  status: 'authenticated', epoch: 1, tenantId: 'tenant-A',
  userId: 'user-A', accessToken: 'secret-A',
  timezone: 'Asia/Dhaka', username: 'owner',
  displayName: 'Owner', roleName: 'Owner',
  businessName: 'Shop A', permissions: ['customer.view'],
  features: [], persistence: 'memory',
} as const satisfies SessionSnapshot;

class SessionFixture {
  private snapshot: SessionSnapshot = authenticated;
  private readonly observers = new Set<() => void>();

  getSnapshot = (): SessionSnapshot => this.snapshot;
  subscribe = (listener: () => void): (() => void) => {
    this.observers.add(listener);
    return () => { this.observers.delete(listener); };
  };
  set(next: SessionSnapshot): void {
    this.snapshot = next;
    for (const listener of this.observers) listener();
  }
  setSilently(next: SessionSnapshot): void {
    this.snapshot = next;
  }
  get subscribers(): number { return this.observers.size; }
}

function fakeTransport(
  detail: NonNullable<TradingPartyReadTransport['detail']>,
): TradingPartyReadTransport {
  return {
    list: async () => { throw Error('Unexpected Party list'); },
    detail,
    opening: async () => { throw Error('Unexpected Party opening'); },
    ledger: async () => { throw Error('Unexpected Party ledger'); },
    setup: async () => { throw Error('Unexpected Party setup'); },
  };
}

function deferred<T>() {
  let resolve!: (result: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

test('detail GET pins authentication, exact Party ID and selected trading role', async () => {
  const session = new SessionFixture();
  const seen: unknown[] = [];
  const reader = new TradingPartyReadController(session, fakeTransport(
    async (token, partyId, role, signal) => {
      seen.push({ token, partyId, role, aborted: signal.aborted });
      return customer;
    },
  ));
  const states: string[] = [];
  reader.subscribe(() => states.push(reader.getSnapshot().status));
  const value = await reader.loadPartyDetail('Customer', id);
  assert.deepEqual(seen, [{
    token: 'secret-A', partyId: id, role: 'CUSTOMER', aborted: false,
  }]);
  assert.equal(value?.item.partyId, id);
  assert.equal(value?.selectedRole, 'CUSTOMER');
  assert.equal(value?.item.net.signedMinor, 500_000);
  assert.deepEqual(states, ['loading', 'detail']);
  assert.equal(JSON.stringify(reader.getSnapshot()).includes('secret-A'), false);
  reader.dispose();
});

test('detail presentation strips identity PII and party-wide relationship history flag', async () => {
  const session = new SessionFixture();
  const reader = new TradingPartyReadController(session,
    fakeTransport(async () => customer));
  const view = await reader.loadPartyDetail('Customer', id);
  assert.equal(view?.item.name, 'Shared Identity');
  assert.equal(view?.item.customerCreditLimitMinor, 800_000);
  const json = JSON.stringify(view);
  assert.equal(json.includes('PRIVATE'), false);
  assert.equal(json.includes('hasLedgerEntries'), false);
  assert.equal(json.includes('guardianName'), false);
  assert.equal(json.includes('nid'), false);
  assert.equal(json.includes('notes'), false);
  assert.equal(json.includes('email'), false);
  reader.dispose();
});

test('one identity has independent Customer and Supplier detail nets', async () => {
  const session = new SessionFixture();
  const reader = new TradingPartyReadController(session,
    fakeTransport(async (_token, _id, role) =>
      role === 'SUPPLIER' ? supplier : customer));
  const c = await reader.loadPartyDetail('Customer', id);
  const s = await reader.loadPartyDetail('Supplier', id);
  assert.equal(c?.item.partyId, s?.item.partyId);
  assert.equal(c?.item.net.signedMinor, 500_000);
  assert.equal(s?.item.net.signedMinor, -300_000);
  assert.equal(s?.item.customerCreditLimitMinor, null);
  assert.equal(s?.item.customerGroupName, null);
  assert.equal('allRelationshipBalance' in (s?.item ?? {}), false);
  reader.dispose();
});

test('valid but WRONG Party identity returned by backend is rejected before publication', async () => {
  const session = new SessionFixture();
  const reader = new TradingPartyReadController(session,
    fakeTransport(async () => ({
      data: { ...customer.data, id: otherId, name: 'PRIVATE OTHER PARTY' },
    })));
  await assert.rejects(reader.loadPartyDetail('Customer', id), (error: unknown) =>
    error instanceof ApiError && error.kind === 'protocol');
  const snapshot = JSON.stringify(reader.getSnapshot());
  assert.equal(reader.getSnapshot().status, 'error');
  assert.equal(snapshot.includes('PRIVATE'), false);
  assert.equal(snapshot.includes(otherId), false);
  reader.dispose();
});

test('incorrect selected relationship or private role cannot become a detail success', async () => {
  const session = new SessionFixture();
  const reader = new TradingPartyReadController(session,
    fakeTransport(async () => ({
      data: { ...customer.data, roles: ['CUSTOMER'] },
    })));
  await assert.rejects(reader.loadPartyDetail('Supplier', id), ApiError);
  assert.equal(reader.getSnapshot().status, 'error');
  reader.dispose();
});

test('bad Party ID and unsupported financial/All relationships make no GET', async () => {
  const session = new SessionFixture();
  let calls = 0;
  const reader = new TradingPartyReadController(session,
    fakeTransport(async () => { calls++; return customer; }));
  for (const partyId of ['', 'demo-party-1', otherId.toLowerCase(), '../../admin']) {
    await assert.rejects(reader.loadPartyDetail('Customer', partyId), ApiError);
    assert.equal(reader.getSnapshot().status, 'idle');
  }
  for (const role of ['All', 'Lender', 'Borrower', 'Owner', 'Payee'] as const) {
    await assert.rejects(reader.loadPartyDetail(role, id), ApiError);
    assert.equal(reader.getSnapshot().status, 'idle');
  }
  assert.equal(calls, 0);
  reader.dispose();
});

test('missing method on an injected mock fails closed rather than using real network', async () => {
  const session = new SessionFixture();
  const reader = new TradingPartyReadController(session, {
    list: async () => { throw Error('unexpected list'); },
    ledger: async () => { throw Error('unexpected ledger'); },
    opening: async () => { throw Error('unexpected opening'); },
    // detail method deliberately omitted
  });
  await assert.rejects(reader.loadPartyDetail('Customer', id), (error: unknown) =>
    error instanceof ApiError && error.kind === 'protocol');
  assert.equal(reader.getSnapshot().status, 'error');
  reader.dispose();
});

test('rapid selection switch aborts an old detail GET and drops late success', async () => {
  const session = new SessionFixture();
  const pending = deferred<TradingPartyDetail>();
  let oldSignal: AbortSignal | null = null;
  const reader = new TradingPartyReadController(session, fakeTransport(
    async (_token, _partyId, role, signal) => {
      if (role === 'CUSTOMER') {
        oldSignal = signal;
        return pending.promise;
      }
      return supplier;
    },
  ));
  const old = reader.loadPartyDetail('Customer', id);
  const newer = await reader.loadPartyDetail('Supplier', id);
  assert.equal(oldSignal?.aborted, true);
  pending.resolve(customer);
  assert.equal(await old, null);
  assert.equal(newer?.selectedRole, 'SUPPLIER');
  assert.equal(reader.getSnapshot().status, 'detail');
  reader.dispose();
});

test('late 403 from previous selection cannot erase current detail', async () => {
  const session = new SessionFixture();
  const pending = deferred<TradingPartyDetail>();
  const reader = new TradingPartyReadController(session, fakeTransport(
    async (_token, _id, role) =>
      role === 'CUSTOMER' ? pending.promise : supplier,
  ));
  const first = reader.loadPartyDetail('Customer', id);
  const second = await reader.loadPartyDetail('Supplier', id);
  pending.reject(new ApiError('http', 'PRIVATE denial', { status: 403 }));
  assert.equal(await first, null);
  assert.equal(second?.item.net.signedMinor, -300_000);
  assert.equal(reader.getSnapshot().status, 'detail');
  reader.dispose();
});

test('tenant/user/epoch switch cancels pending detail and clears private state', async () => {
  const session = new SessionFixture();
  const pending = deferred<TradingPartyDetail>();
  let signal: AbortSignal | null = null;
  const reader = new TradingPartyReadController(session, fakeTransport(
    async (_token, _partyId, _role, received) => {
      signal = received;
      return pending.promise;
    },
  ));
  const previous = reader.loadPartyDetail('Customer', id);
  session.set({
    ...authenticated, epoch: 2, tenantId: 'tenant-B',
    userId: 'user-B', accessToken: 'secret-B',
  });
  assert.equal(reader.getSnapshot().status, 'idle');
  assert.equal(signal?.aborted, true);
  pending.resolve(customer);
  assert.equal(await previous, null);
  reader.dispose();
});

test('silent refresh/session change prevents stale result and clears loading', async () => {
  const session = new SessionFixture();
  const pending = deferred<TradingPartyDetail>();
  const reader = new TradingPartyReadController(session,
    fakeTransport(async () => pending.promise));
  const previous = reader.loadPartyDetail('Customer', id);
  session.setSilently({ ...authenticated, epoch: 3, accessToken: 'other-token' });
  pending.resolve(customer);
  assert.equal(await previous, null);
  assert.deepEqual(reader.getSnapshot(), { status: 'idle' });
  reader.dispose();
});

test('401/403/404/503/protocol failures never retain a previous detail or raw error', async () => {
  const errors = [
    new ApiError('http', 'PRIVATE unauthorized', { status: 401 }),
    new ApiError('http', 'PRIVATE forbidden', { status: 403 }),
    new ApiError('http', 'PRIVATE not found', { status: 404 }),
    new ApiError('http', 'PRIVATE unavailable', { status: 503 }),
    new ApiError('protocol', 'PRIVATE invalid data'),
    new ApiError('network', 'PRIVATE offline'),
  ];
  for (const error of errors) {
    const session = new SessionFixture();
    let fail = false;
    const reader = new TradingPartyReadController(session,
      fakeTransport(async () => {
        if (fail) throw error;
        return customer;
      }));
    await reader.loadPartyDetail('Customer', id);
    fail = true;
    await assert.rejects(reader.loadPartyDetail('Customer', id), err => err === error);
    const snapshot = reader.getSnapshot();
    assert.equal(snapshot.status, 'error');
    if (snapshot.status === 'error') {
      assert.equal(snapshot.errorKind, error.kind);
      assert.equal(snapshot.httpStatus, error.status ?? null);
    }
    assert.equal(JSON.stringify(snapshot).includes('PRIVATE'), false);
    assert.equal(JSON.stringify(snapshot).includes('Shared Identity'), false);
    reader.dispose();
  }
});

test('sign-out and inactivity lock prevent detail GET and drop prior result', async () => {
  const session = new SessionFixture();
  let calls = 0;
  const reader = new TradingPartyReadController(session, fakeTransport(
    async () => { calls++; return customer; },
  ));
  await reader.loadPartyDetail('Customer', id);
  session.set({ status: 'locked', epoch: 2, reason: 'inactivity', persistence: 'memory' });
  assert.equal(reader.getSnapshot().status, 'idle');
  await assert.rejects(reader.loadPartyDetail('Customer', id), ApiError);
  session.set({ status: 'signed-out', epoch: 3 });
  await assert.rejects(reader.loadPartyDetail('Customer', id), ApiError);
  assert.equal(calls, 1);
  reader.dispose();
});

test('disposal cancels pending detail, unsubscribes and forbids resurrection', async () => {
  const session = new SessionFixture();
  const pending = deferred<TradingPartyDetail>();
  let signal: AbortSignal | null = null;
  const reader = new TradingPartyReadController(session, fakeTransport(
    async (_token, _id, _role, received) => {
      signal = received;
      return pending.promise;
    },
  ));
  const detail = reader.loadPartyDetail('Customer', id);
  reader.dispose();
  assert.equal(signal?.aborted, true);
  assert.equal(session.subscribers, 0);
  pending.resolve(customer);
  assert.equal(await detail, null);
  assert.deepEqual(reader.getSnapshot(), { status: 'idle' });
  await assert.rejects(reader.loadPartyDetail('Customer', id), ApiError);
});
