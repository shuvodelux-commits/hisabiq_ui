import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  decodeHistoricalPartyOpening,
  type HistoricalPartyOpeningEnvelope,
} from '../src/integration/party-reads.ts';
import {
  projectTradingHistoricalOpening,
} from '../src/integration/party-read-model.ts';
import {
  TradingPartyReadController,
  type TradingPartyReadTransport,
} from '../src/integration/party-read-controller.ts';
import type { SessionSnapshot } from '../src/integration/session.ts';

const partyId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const openingId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const customerDoc = {
  id: openingId, number: 'OPN-000144', role: 'CUSTOMER',
  direction: 'RECEIVABLE', amountMinor: 500_000,
  businessDate: '2026-01-01', version: 2,
} as const;
const supplierDoc = {
  ...customerDoc, role: 'SUPPLIER', direction: 'PAYABLE',
  amountMinor: 300_000,
} as const;
const verified = {
  status: 'authenticated', epoch: 1, tenantId: 'tenant-A',
  userId: 'user-A', accessToken: 'token-for-A',
  timezone: 'Asia/Dhaka', username: 'cashier',
  displayName: 'Cashier', roleName: 'Cashier',
  businessName: 'Hardware A', permissions: [], features: [],
  persistence: 'memory',
} as const satisfies SessionSnapshot;

class SessionFixture {
  private state: SessionSnapshot = verified;
  private readonly listeners = new Set<() => void>();
  getSnapshot = (): SessionSnapshot => this.state;
  subscribe = (fn: () => void): (() => void) => {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  };
  set(next: SessionSnapshot): void {
    this.state = next;
    for (const fn of this.listeners) fn();
  }
}

function openingTransport(
  get: TradingPartyReadTransport['opening'],
): TradingPartyReadTransport {
  return {
    list: async () => { throw Error('Directory access not authorized by opening test'); },
    ledger: async () => { throw Error('Ledger access not authorized by opening test'); },
    opening: get,
  };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((ok, fail) => {
    resolve = ok; reject = fail;
  });
  return { promise, resolve, reject };
}

test('historical opening preserves exact posted source and positive integer poisha', () => {
  const view = projectTradingHistoricalOpening('CUSTOMER', partyId, { data: customerDoc });
  assert.deepEqual(view, {
    partyId, selectedRole: 'CUSTOMER',
    opening: {
      openingId,
      sourceNumber: 'OPN-000144',
      direction: 'RECEIVABLE',
      amountMinor: 500_000,
      businessDate: '2026-01-01',
      version: 2,
    },
  });
  assert.equal('cashSessionId' in view, false);
  assert.equal('bankAccountId' in view, false);
  assert.equal('ledgerOpeningNet' in view, false);
  assert.equal('balance' in view, false);
});

test('a valid missing historical opening is a document-null result, not an invented zero', () => {
  assert.deepEqual(projectTradingHistoricalOpening('SUPPLIER', partyId, { data: null }), {
    partyId,
    selectedRole: 'SUPPLIER',
    opening: null,
  });
  assert.equal(projectTradingHistoricalOpening('CUSTOMER', partyId, {
    data: customerDoc,
  }).opening?.amountMinor, 500_000);
});

test('strict server role/source/date/amount contract is enforced before projection', () => {
  const badPayloads: unknown[] = [
    { data: { ...customerDoc, role: 'SUPPLIER' } },
    { data: { ...customerDoc, role: 'BORROWER' } },
    { data: { ...customerDoc, id: 'preview-opening' } },
    { data: { ...customerDoc, amountMinor: 0 } },
    { data: { ...customerDoc, amountMinor: 10.5 } },
    { data: { ...customerDoc, amountMinor: -100 } },
    { data: { ...customerDoc, businessDate: '2026-02-30' } },
    { data: { ...customerDoc, version: 0 } },
    { data: { ...customerDoc, cashSessionId: 'session-x' } },
    { data: null, balanceMinor: 0 },
    { opening: customerDoc },
  ];
  for (const raw of badPayloads) {
    assert.throws(() => projectTradingHistoricalOpening(
      'CUSTOMER', partyId, raw as HistoricalPartyOpeningEnvelope,
    ), ApiError);
  }
  assert.throws(() => projectTradingHistoricalOpening(
    'CUSTOMER', 'preview-party', { data: customerDoc },
  ), ApiError);
  assert.throws(() => decodeHistoricalPartyOpening({ data: customerDoc }, 'OWNER' as 'CUSTOMER'), ApiError);
});

test('one authenticated role-specific GET and posted source projection, no cash-session input', async () => {
  const session = new SessionFixture();
  const calls: unknown[] = [];
  const reader = new TradingPartyReadController(session, openingTransport(
    async (token, id, role, signal) => {
      calls.push({ token, id, role, signalAborted: signal.aborted });
      return { data: customerDoc };
    },
  ));
  const changes: string[] = [];
  reader.subscribe(() => changes.push(reader.getSnapshot().status));
  const opening = await reader.loadHistoricalOpening('Customer', partyId);
  assert.deepEqual(calls, [{
    token: 'token-for-A', id: partyId, role: 'CUSTOMER', signalAborted: false,
  }]);
  assert.equal(opening?.opening?.openingId, openingId);
  assert.equal(opening?.opening?.direction, 'RECEIVABLE');
  assert.deepEqual(changes, ['loading', 'opening']);
  assert.equal(JSON.stringify(reader.getSnapshot()).includes('token-for-A'), false);
  assert.equal((reader as unknown as Record<string, unknown>).postOpening, undefined);
  assert.equal((reader as unknown as Record<string, unknown>).recordCash, undefined);
  reader.dispose();
});

test('successful response data:null remains distinguishable from an aborted/stale null', async () => {
  const session = new SessionFixture();
  const reader = new TradingPartyReadController(session,
    openingTransport(async () => ({ data: null })));
  const result = await reader.loadHistoricalOpening('Customer', partyId);
  assert.ok(result !== null);
  assert.deepEqual(result?.opening, null);
  assert.equal(reader.getSnapshot().status, 'opening');
  reader.dispose();
});

test('unsupported All and finance roles are rejected without any request', async () => {
  const session = new SessionFixture();
  let count = 0;
  const reader = new TradingPartyReadController(session, openingTransport(async () => {
    count += 1;
    return { data: customerDoc };
  }));
  for (const role of ['All', 'Lender', 'Borrower', 'Owner', 'Payee'] as const) {
    await assert.rejects(reader.loadHistoricalOpening(role, partyId), ApiError);
    assert.equal(reader.getSnapshot().status, 'idle');
  }
  assert.equal(count, 0);
  reader.dispose();
});

test('one Party identity may have separately posted Customer and Supplier openings', async () => {
  const session = new SessionFixture();
  const reader = new TradingPartyReadController(session, openingTransport(
    async (_token, _id, role) => ({
      data: role === 'SUPPLIER' ? supplierDoc : customerDoc,
    }),
  ));
  const customer = await reader.loadHistoricalOpening('Customer', partyId);
  const supplier = await reader.loadHistoricalOpening('Supplier', partyId);
  assert.equal(customer?.partyId, supplier?.partyId);
  assert.equal(customer?.opening?.amountMinor, 500_000);
  assert.equal(supplier?.opening?.amountMinor, 300_000);
  assert.equal(customer?.opening?.direction, 'RECEIVABLE');
  assert.equal(supplier?.opening?.direction, 'PAYABLE');
  assert.equal('allRolesOpeningMinor' in (supplier ?? {}), false);
  reader.dispose();
});

test('role switch aborts pending opening and discards its late successful payload', async () => {
  const session = new SessionFixture();
  const old = deferred<HistoricalPartyOpeningEnvelope>();
  let oldSignal: AbortSignal | null = null;
  const reader = new TradingPartyReadController(session, openingTransport(
    async (_token, _id, role, signal) => {
      if (role === 'CUSTOMER') {
        oldSignal = signal;
        return old.promise;
      }
      return { data: supplierDoc };
    },
  ));
  const previous = reader.loadHistoricalOpening('Customer', partyId);
  const latest = await reader.loadHistoricalOpening('Supplier', partyId);
  assert.equal(oldSignal?.aborted, true);
  old.resolve({ data: customerDoc });
  assert.equal(await previous, null);
  assert.equal(latest?.selectedRole, 'SUPPLIER');
  assert.equal(reader.getSnapshot().status, 'opening');
  reader.dispose();
});

test('late opening error cannot overwrite a newer successful role selection', async () => {
  const session = new SessionFixture();
  const old = deferred<HistoricalPartyOpeningEnvelope>();
  const reader = new TradingPartyReadController(session, openingTransport(
    async (_token, _id, role) => role === 'CUSTOMER'
      ? old.promise
      : { data: supplierDoc },
  ));
  const first = reader.loadHistoricalOpening('Customer', partyId);
  const newer = await reader.loadHistoricalOpening('Supplier', partyId);
  old.reject(new ApiError('http', 'Denied Supplier Details', { status: 403 }));
  assert.equal(await first, null);
  assert.equal(newer?.opening?.amountMinor, 300_000);
  assert.equal(reader.getSnapshot().status, 'opening');
  reader.dispose();
});

test('tenant/epoch change aborts opening and clears sensitive source immediately', async () => {
  const session = new SessionFixture();
  const late = deferred<HistoricalPartyOpeningEnvelope>();
  let aborted: AbortSignal | null = null;
  const reader = new TradingPartyReadController(session, openingTransport(
    async (_token, _id, _role, signal) => {
      aborted = signal;
      return late.promise;
    },
  ));
  const first = reader.loadHistoricalOpening('Customer', partyId);
  session.set({ ...verified, epoch: 2, tenantId: 'tenant-B', accessToken: 'token-for-B' });
  assert.equal(reader.getSnapshot().status, 'idle');
  assert.equal(aborted?.aborted, true);
  late.resolve({ data: customerDoc });
  assert.equal(await first, null);
  reader.dispose();
});

test('lock and signout invalidate previously loaded opening source', async () => {
  const session = new SessionFixture();
  const reader = new TradingPartyReadController(session,
    openingTransport(async () => ({ data: customerDoc })));
  await reader.loadHistoricalOpening('Customer', partyId);
  assert.equal(reader.getSnapshot().status, 'opening');
  session.set({ status: 'locked', epoch: 2, reason: 'inactivity', persistence: 'memory' });
  assert.deepEqual(reader.getSnapshot(), { status: 'idle' });
  await assert.rejects(reader.loadHistoricalOpening('Customer', partyId), ApiError);
  session.set({ status: 'signed-out', epoch: 3 });
  await assert.rejects(reader.loadHistoricalOpening('Customer', partyId), ApiError);
  reader.dispose();
});

test('403, 404 and network errors fail closed without cached opening or secret message', async () => {
  const errors = [
    new ApiError('http', 'PRIVATE 403', { status: 403 }),
    new ApiError('http', 'PRIVATE 404', { status: 404 }),
    new ApiError('network', 'PRIVATE offline'),
  ];
  for (const error of errors) {
    const session = new SessionFixture();
    let fail = false;
    const reader = new TradingPartyReadController(session, openingTransport(async () => {
      if (fail) throw error;
      return { data: customerDoc };
    }));
    await reader.loadHistoricalOpening('Customer', partyId);
    fail = true;
    await assert.rejects(reader.loadHistoricalOpening('Customer', partyId), e => e === error);
    const state = reader.getSnapshot();
    assert.equal(state.status, 'error');
    const encoded = JSON.stringify(state);
    assert.equal(encoded.includes('OPN-000144'), false);
    assert.equal(encoded.includes('PRIVATE'), false);
    if (state.status === 'error') {
      assert.equal(state.errorKind, error.kind);
      assert.equal(state.httpStatus, error.status ?? null);
    }
    reader.dispose();
  }
});

test('invalid Party id or source cannot become a successful historical opening', async () => {
  const session = new SessionFixture();
  const reader = new TradingPartyReadController(session,
    openingTransport(async () => ({ data: { ...customerDoc, role: 'SUPPLIER' } })));
  await assert.rejects(reader.loadHistoricalOpening('Customer', partyId), ApiError);
  assert.equal(reader.getSnapshot().status, 'error');
  await assert.rejects(reader.loadHistoricalOpening('Customer', 'fake-preview-id'), ApiError);
  reader.dispose();
});
