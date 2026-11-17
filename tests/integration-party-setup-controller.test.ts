import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  TradingPartyReadController,
  type TradingPartyReadTransport,
} from '../src/integration/party-read-controller.ts';
import type { ServerPartySetupEnvelope } from '../src/integration/party-setup.ts';
import type { SessionSnapshot } from '../src/integration/session.ts';

const groupId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const setup: ServerPartySetupEnvelope = {
  data: {
    groups: [{ id: groupId, name: 'Retail' }],
    features: { customerGroups: true, vendors: false },
    fields: {
      address: true, guardianName: false, nid: false,
      email: true, notes: false,
    },
  },
};
const authenticated = {
  status: 'authenticated', epoch: 1, tenantId: 'tenant-A',
  userId: 'user-A', accessToken: 'secret-A',
  timezone: 'Asia/Dhaka', username: 'cashier',
  displayName: 'Cashier A', roleName: 'Cashier',
  businessName: 'Shop A', permissions: [], features: [],
  persistence: 'memory',
} as const satisfies SessionSnapshot;

class FakeSession {
  private state: SessionSnapshot = authenticated;
  private listeners = new Set<() => void>();
  getSnapshot = (): SessionSnapshot => this.state;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  set(next: SessionSnapshot): void {
    this.state = next;
    for (const listener of this.listeners) listener();
  }
  setSilently(next: SessionSnapshot): void { this.state = next; }
  get subscribers(): number { return this.listeners.size; }
}

function transport(
  get: NonNullable<TradingPartyReadTransport['setup']>,
): TradingPartyReadTransport {
  return {
    list: async () => { throw new Error('Unexpected Party list request'); },
    ledger: async () => { throw new Error('Unexpected Party ledger request'); },
    opening: async () => { throw new Error('Unexpected opening request'); },
    setup: get,
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

test('setup reads current authenticated bearer identity; no tenant input or mutation', async () => {
  const session = new FakeSession();
  const seen: unknown[] = [];
  const reader = new TradingPartyReadController(session, transport(
    async (token, signal) => {
      seen.push({ token, aborted: signal.aborted });
      return setup;
    },
  ));
  const stateChanges: string[] = [];
  reader.subscribe(() => stateChanges.push(reader.getSnapshot().status));
  const view = await reader.loadPartySetup();
  assert.deepEqual(seen, [{ token: 'secret-A', aborted: false }]);
  assert.deepEqual(view, setup.data);
  assert.deepEqual(stateChanges, ['loading', 'setup']);
  assert.equal('tenantId' in (view ?? {}), false);
  assert.equal(JSON.stringify(reader.getSnapshot()).includes('secret-A'), false);
  assert.equal(JSON.stringify(reader.getSnapshot()).includes('cashSession'), false);
  reader.dispose();
});

test('server-controlled feature/field flags are preserved without enabling vendor or finance routes', async () => {
  const session = new FakeSession();
  const reader = new TradingPartyReadController(session, transport(async () => setup));
  const result = await reader.loadPartySetup();
  assert.deepEqual(result?.groups, [{ id: groupId, name: 'Retail' }]);
  assert.equal(result?.features.vendors, false);
  assert.equal(result?.fields.guardianName, false);
  assert.equal(result?.fields.address, true);
  assert.equal('lender' in (result?.features ?? {}), false);
  reader.dispose();
});

test('customer-groups OFF with empty groups is a valid setup, not a fixture fallback', async () => {
  const session = new FakeSession();
  const off: ServerPartySetupEnvelope = {
    data: {
      ...setup.data,
      features: { ...setup.data.features, customerGroups: false },
      groups: [],
    },
  };
  const reader = new TradingPartyReadController(session, transport(async () => off));
  assert.deepEqual((await reader.loadPartySetup())?.groups, []);
  assert.equal(reader.getSnapshot().status, 'setup');
  reader.dispose();
});

test('malformed groups, fields or feature-off group leaks fail closed at controller boundary', async () => {
  const invalid = [
    { data: { ...setup.data, groups: [{ id: 'fake', name: 'Retail' }] } },
    { data: { ...setup.data, fields: { ...setup.data.fields, nid: 'yes' } } },
    { data: { ...setup.data, features: { customerGroups: false, vendors: true } } },
    { data: setup.data, role: 'OWNER' },
  ];
  for (const response of invalid) {
    const reader = new TradingPartyReadController(new FakeSession(),
      transport(async () => response as ServerPartySetupEnvelope));
    await assert.rejects(reader.loadPartySetup(), ApiError);
    assert.equal(reader.getSnapshot().status, 'error');
    assert.equal(JSON.stringify(reader.getSnapshot()).includes('Retail'), false);
    reader.dispose();
  }
});

test('setup GET canceled by tenant/user/epoch change cannot publish a stale response', async () => {
  const session = new FakeSession();
  const pending = deferred<ServerPartySetupEnvelope>();
  let signal: AbortSignal | null = null;
  const reader = new TradingPartyReadController(session, transport(async (_token, abort) => {
    signal = abort;
    return pending.promise;
  }));
  const request = reader.loadPartySetup();
  session.set({
    ...authenticated, epoch: 2, tenantId: 'tenant-B',
    userId: 'user-B', accessToken: 'secret-B',
  });
  assert.equal(signal?.aborted, true);
  assert.equal(reader.getSnapshot().status, 'idle');
  pending.resolve(setup);
  assert.equal(await request, null);
  assert.equal(reader.getSnapshot().status, 'idle');
  reader.dispose();
});

test('a second setup selection aborts first, ignoring stale success', async () => {
  const session = new FakeSession();
  const first = deferred<ServerPartySetupEnvelope>();
  let count = 0;
  let firstSignal: AbortSignal | null = null;
  const reader = new TradingPartyReadController(session, transport(
    async (_token, signal) => {
      count++;
      if (count === 1) { firstSignal = signal; return first.promise; }
      return { data: { ...setup.data, groups: [] } };
    },
  ));
  const previous = reader.loadPartySetup();
  const latest = await reader.loadPartySetup();
  assert.equal(firstSignal?.aborted, true);
  first.resolve(setup);
  assert.equal(await previous, null);
  assert.deepEqual(latest?.groups, []);
  assert.equal(reader.getSnapshot().status, 'setup');
  reader.dispose();
});

test('a stale 403 cannot overwrite newer setup result or leak private error text', async () => {
  const session = new FakeSession();
  const first = deferred<ServerPartySetupEnvelope>();
  let count = 0;
  const reader = new TradingPartyReadController(session, transport(async () => {
    count++;
    return count === 1 ? first.promise : setup;
  }));
  const previous = reader.loadPartySetup();
  const current = await reader.loadPartySetup();
  first.reject(new ApiError('http', 'private permission failure', { status: 403 }));
  assert.equal(await previous, null);
  assert.deepEqual(current, setup.data);
  assert.equal(reader.getSnapshot().status, 'setup');
  assert.equal(JSON.stringify(reader.getSnapshot()).includes('private'), false);
  reader.dispose();
});

test('403/404/offline responses never preserve a previous successful setup snapshot', async () => {
  for (const error of [
    new ApiError('http', 'PRIVATE denied', { status: 403 }),
    new ApiError('http', 'PRIVATE missing', { status: 404 }),
    new ApiError('network', 'PRIVATE offline'),
    new ApiError('protocol', 'PRIVATE bad envelope'),
  ]) {
    const session = new FakeSession();
    let fail = false;
    const reader = new TradingPartyReadController(session, transport(async () => {
      if (fail) throw error;
      return setup;
    }));
    await reader.loadPartySetup();
    fail = true;
    await assert.rejects(reader.loadPartySetup(), (e: unknown) => e === error);
    const value = reader.getSnapshot();
    assert.equal(value.status, 'error');
    assert.equal(JSON.stringify(value).includes('Retail'), false);
    assert.equal(JSON.stringify(value).includes('PRIVATE'), false);
    if (value.status === 'error') {
      assert.equal(value.errorKind, error.kind);
      assert.equal(value.httpStatus, error.status ?? null);
      assert.equal(value.role, null);
    }
    reader.dispose();
  }
});

test('signed-out and locked states cannot call Party setup API', async () => {
  const session = new FakeSession();
  let called = 0;
  const reader = new TradingPartyReadController(session, transport(async () => {
    called++;
    return setup;
  }));
  await reader.loadPartySetup();
  session.set({ status: 'locked', epoch: 2, reason: 'inactivity', persistence: 'memory' });
  assert.equal(reader.getSnapshot().status, 'idle');
  await assert.rejects(reader.loadPartySetup(), ApiError);
  session.set({ status: 'signed-out', epoch: 3 });
  await assert.rejects(reader.loadPartySetup(), ApiError);
  assert.equal(called, 1);
  reader.dispose();
});

test('silent session token switch discards late setup and clears loading safely', async () => {
  const session = new FakeSession();
  const pending = deferred<ServerPartySetupEnvelope>();
  const reader = new TradingPartyReadController(session, transport(async () => pending.promise));
  const previous = reader.loadPartySetup();
  session.setSilently({ ...authenticated, epoch: 3, accessToken: 'new-token' });
  pending.resolve(setup);
  assert.equal(await previous, null);
  assert.deepEqual(reader.getSnapshot(), { status: 'idle' });
  reader.dispose();
});

test('no retry/cache, disposal prevents resurrection and unsubscribes session', async () => {
  const session = new FakeSession();
  const first = deferred<ServerPartySetupEnvelope>();
  let called = 0;
  let signal: AbortSignal | null = null;
  const reader = new TradingPartyReadController(session, transport(async (_token, abort) => {
    called++;
    signal = abort;
    return called === 1 ? setup : first.promise;
  }));
  await reader.loadPartySetup();
  const late = reader.loadPartySetup();
  reader.dispose();
  assert.equal(signal?.aborted, true);
  assert.equal(session.subscribers, 0);
  first.resolve(setup);
  assert.equal(await late, null);
  assert.equal(reader.getSnapshot().status, 'idle');
  assert.equal(called, 2);
  await assert.rejects(reader.loadPartySetup(), ApiError);
});


test('custom transport missing setup fails closed without silently invoking network', async () => {
  const session = new FakeSession();
  const controller = new TradingPartyReadController(session, {
    list: async () => { throw new Error('Unexpected directory'); },
    ledger: async () => { throw new Error('Unexpected ledger'); },
    opening: async () => { throw new Error('Unexpected historical opening'); },
    // setup is intentionally absent; never use defaultTransport as fallback.
  });
  await assert.rejects(controller.loadPartySetup(), (error: unknown) =>
    error instanceof ApiError && error.kind === 'protocol');
  const snapshot = controller.getSnapshot();
  assert.equal(snapshot.status, 'error');
  if (snapshot.status === 'error') {
    assert.equal(snapshot.errorKind, 'protocol');
    assert.equal(snapshot.role, null);
  }
  controller.dispose();
});
