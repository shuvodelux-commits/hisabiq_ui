import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  prepareSaleDraftCreate,
  submitPreparedSaleDraftCreate,
} from '../src/integration/sale-draft-intent.ts';

const origin = 'https://hisabiq-connected-draft-intent.test';
const tenantId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const userId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FB1';
const otherProduct = '01ARZ3NDEKTSV4RRFFQ69G5FB2';
const customerId = '01ARZ3NDEKTSV4RRFFQ69G5FB3';
const otherTenant = '01ARZ3NDEKTSV4RRFFQ69G5FB4';
const draftId = '01ARZ3NDEKTSV4RRFFQ69G5FB5';
const session = {
  status: 'authenticated' as const, epoch: 11, accessToken: 'a-secure-auth-token',
  tenantId, userId, timezone: 'Asia/Dhaka', username: 'seller@example.test',
  displayName: 'Cashier', roleName: 'Owner', businessName: 'Test tenant A',
  permissions: ['sale.invoice.create'], features: [],
  persistence: 'memory' as const,
};
const sources = {
  tenantId,
  productIds: new Set([productId]),
  customerIds: new Set([customerId]),
};
const cart = {
  schema: 'hisabiq.connected.pos.draft.v1',
  sourceTenantId: tenantId,
  customerId,
  lines: [{
    productId, qty: '2', secondaryQty: '5',
    unitQuantities: { Box: '2', Pcs: '5' },
    unit: 'Box', price: '220.75',
    serials: ['SN-105'], warranty: { months: 12 },
    bundleSources: { component: 'Own' },
  }],
  payments: [{ method: 'Cash', amount: '80.20' }, { method: 'bKash', amount: '140.55' }],
  installment: { count: 3, schedule: [{ dueDate: '2027-01-01', amount: 12075 }] },
};
const payload = {
  label: 'Held electrical sale', customerName: 'Rahman Traders',
  itemCount: 1, grandTotalMinor: 22075, cart,
};
const created = { ...payload, id: draftId,
  businessDate: '2026-11-15', savedAt: '2026-11-15T01:30:00.000Z' };
const protocol = (e: unknown) => e instanceof ApiError && e.kind === 'protocol';
const network = (e: unknown) => e instanceof ApiError && e.kind === 'network';
function json(value: unknown, status = 201): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, task: () => Promise<void>) {
  const host = globalThis as unknown as { fetch: typeof fetch; window?: unknown; location?: unknown };
  const saved = { fetch: host.fetch, window: host.window, location: host.location };
  host.fetch = fake; host.window = { location: { origin } }; host.location = { origin };
  try { await task(); } finally {
    host.fetch = saved.fetch;
    if (saved.window === undefined) delete host.window; else host.window = saved.window;
    if (saved.location === undefined) delete host.location; else host.location = saved.location;
  }
}

test('M7-03 intent is an opaque memory-only handle with canonical secure ULID', () => {
  const handle = prepareSaleDraftCreate(session, payload, sources);
  assert.match(handle.operationId, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  assert.deepEqual(Object.keys(handle), ['operationId']);
  assert.equal(Object.isFrozen(handle), true);
  assert.ok(!JSON.stringify(handle).includes(session.accessToken));
  assert.ok(!JSON.stringify(handle).includes(tenantId));
  const independent = prepareSaleDraftCreate(session, payload, sources);
  assert.notEqual(handle.operationId, independent.operationId);
});

test('M7-03 preparation fails closed on signed-out, preview and permissionless sessions', () => {
  const invalid: unknown[] = [
    { status: 'preview', epoch: 0 },
    { status: 'signed-out', epoch: 11 },
    { ...session, permissions: [] },
    { ...session, permissions: ['sale.invoice.view'] },
    { ...session, tenantId: 'demo-tenant' },
    { ...session, userId: 'fixture-user' },
    { ...session, epoch: -1 },
    { ...session, epoch: 1.5 },
    { ...session, accessToken: 'bad token' },
  ];
  for (const candidate of invalid)
    assert.throws(() => prepareSaleDraftCreate(candidate as never, payload, sources), protocol);
});

test('M7-03 source verification refuses preview and foreign tenant products/customers before any POST', () => {
  const wrong = [
    { ...cart, schema: 'hisabiq.preview.pos.v2' },
    { ...cart, sourceTenantId: otherTenant },
    { ...cart, customerId: otherProduct },
    { ...cart, customerId: 'preview-party-1' },
    { ...cart, lines: [{ ...cart.lines[0], productId: 'p1' }] },
    { ...cart, lines: [{ ...cart.lines[0], productId: otherProduct }] },
    { ...cart, lines: [] },
    { ...cart, lines: 'not array' },
  ];
  for (const bad of wrong) assert.throws(() =>
    prepareSaleDraftCreate(session, { ...payload, cart: bad }, sources), protocol);
  assert.throws(() => prepareSaleDraftCreate(session, payload,
    { ...sources, tenantId: otherTenant }), protocol);
  assert.throws(() => prepareSaleDraftCreate(session, payload,
    { ...sources, productIds: new Set([otherProduct]) }), protocol);
  assert.throws(() => prepareSaleDraftCreate(session, payload,
    { ...sources, customerIds: new Set([otherProduct]) }), protocol);
});

test('M7-03 preparing a snapshot never trusts a claimed product or customer from an unverified source list', () => {
  const valid = prepareSaleDraftCreate(session, payload, sources);
  assert.match(valid.operationId, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  assert.throws(() => prepareSaleDraftCreate(session, { ...payload, itemCount: 2 }, sources), protocol);
  assert.throws(() => prepareSaleDraftCreate(session, { ...payload, itemCount: 0 }, sources), protocol);
});

test('M7-03 source mutation after prepare cannot change a single byte of submitted cart or operation key', async () => {
  const mutable = structuredClone(payload);
  const intended = structuredClone(payload);
  const handle = prepareSaleDraftCreate(session, mutable, sources);
  mutable.label = 'Changed later';
  mutable.cart.lines[0]!.price = '0';
  mutable.cart.payments[0]!.amount = '9999999';
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/sales/drafts');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer ' + session.accessToken);
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), handle.operationId);
    assert.deepEqual(JSON.parse(String(init?.body)), intended);
    return json({ data: created });
  }) as typeof fetch, async () => {
    assert.equal((await submitPreparedSaleDraftCreate(session, handle)).data.id, draftId);
  });
  assert.equal(calls, 1);
});

test('M7-03 after lost acknowledgement deliberate replay uses exactly the same operation ID and serialized payload', async () => {
  const handle = prepareSaleDraftCreate(session, payload, sources);
  const requests: { key: string | null; body: string }[] = [];
  await withFetch((async (_url, init) => {
    requests.push({
      key: new Headers(init?.headers).get('Idempotency-Key'), body: String(init?.body),
    });
    if (requests.length === 1) throw new Error('ACK lost after commit');
    return json({ data: created });
  }) as typeof fetch, async () => {
    await assert.rejects(submitPreparedSaleDraftCreate(session, handle), network);
    assert.equal((await submitPreparedSaleDraftCreate(session, handle)).data.id, draftId);
  });
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[0], requests[1]);
  assert.equal(requests[0]?.key, handle.operationId);
});

test('M7-03 identity change, permission revocation or forged handle refuses before fetch', async () => {
  const handle = prepareSaleDraftCreate(session, payload, sources);
  const changedSessions = [
    { ...session, tenantId: otherTenant },
    { ...session, userId: otherProduct },
    { ...session, epoch: session.epoch + 1 },
    { ...session, accessToken: session.accessToken + 'rotated' },
    { ...session, permissions: [] },
    { ...session, status: 'signed-out' },
  ];
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: created }); }) as typeof fetch, async () => {
    for (const changed of changedSessions) {
      await assert.rejects(submitPreparedSaleDraftCreate(changed as never, handle), protocol);
    }
    await assert.rejects(submitPreparedSaleDraftCreate(session,
      Object.freeze({ operationId: handle.operationId })), protocol);
  });
  assert.equal(calls, 0);
});

test('M7-03 concurrent same-handle submissions do not cause duplicate HTTP writes', async () => {
  const handle = prepareSaleDraftCreate(session, payload, sources);
  let release!: (result: Response) => void;
  const reply = new Promise<Response>(resolve => { release = resolve; });
  let calls = 0;
  await withFetch((async () => { calls++; return reply; }) as typeof fetch, async () => {
    const first = submitPreparedSaleDraftCreate(session, handle);
    await assert.rejects(submitPreparedSaleDraftCreate(session, handle), protocol);
    release(json({ data: created }));
    await first;
  });
  assert.equal(calls, 1);
});

test('M7-03 HTTP 403 leaves same intent retriable only after permission remains verified', async () => {
  const handle = prepareSaleDraftCreate(session, payload, sources);
  let calls = 0;
  await withFetch((async () => {
    calls++;
    return json({ error: { code: 'AUTH_FORBIDDEN', message: 'Access denied',
      details: {}, traceId: 'trace-draft' } }, 403);
  }) as typeof fetch, async () => {
    await assert.rejects(submitPreparedSaleDraftCreate(session, handle),
      (e: unknown) => e instanceof ApiError && e.kind === 'http' && e.status === 403);
    await assert.rejects(submitPreparedSaleDraftCreate({ ...session, permissions: [] }, handle), protocol);
  });
  assert.equal(calls, 1);
});
