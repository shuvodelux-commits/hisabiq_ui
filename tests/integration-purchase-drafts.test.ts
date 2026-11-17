import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '../src/integration/errors.ts';
import {
  createPurchaseDraft,
  decodePurchaseDraft,
  decodePurchaseDraftList,
  readPurchaseDraft,
  readPurchaseDrafts,
  recyclePurchaseDraft,
  restorePurchaseDraft,
  updatePurchaseDraft,
} from '../src/integration/purchase-drafts.ts';

const origin = 'https://hisabiq-drafts.test';
const id = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const cart = {
  supplierId: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
  date: '2026-11-13',
  backdateReason: '',
  referenceNo: 'BILL-42',
  notes: 'multi-unit, multiple payment, saved without posting',
  lines: [{ id: 'p1', unitParts: [{ unit: 'Box', quantity: 2 }, { unit: 'Pcs', quantity: 3 }], price: '100.25' }],
  payments: [{ id: 'cash1', method: 'Cash', amount: '80.10' }, { id: 'mfs1', method: 'MFS', amount: '120.40' }],
  discountMode: 'percent',
  discount: '2.5',
  photos: [],
};
const operationId = '01ARZ3NDEKTSV4RRFFQ69G5FB0';
const payload = {
  label: 'Incomplete supplier invoice',
  supplierName: 'Rahman Traders',
  itemCount: 1,
  grandTotalMinor: 20050,
  cart,
};
const createPayload = { ...payload, operationId };
const draft = {
  ...payload,
  id,
  businessDate: '2026-11-13',
  savedAt: '2026-11-13T05:00:00.000Z',
  createdAt: '2026-11-13T04:30:00.000Z',
  version: 1,
  deletedAt: null,
  recoverableUntilEpochMs: null,
};
const removedTime = '2026-11-13T07:00:00.000Z';
const removed = {
  ...draft,
  version: 3,
  deletedAt: removedTime,
  recoverableUntilEpochMs: Date.parse(removedTime) + 30 * 86_400_000,
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
async function withFetch(fake: typeof fetch, action: () => Promise<void>): Promise<void> {
  const previousFetch = globalThis.fetch;
  const previousWindow = (globalThis as any).window;
  const previousLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await action(); }
  finally {
    (globalThis as any).fetch = previousFetch;
    if (previousWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = previousWindow;
    if (previousLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = previousLocation;
  }
}
const protocol = (error: unknown): boolean => error instanceof ApiError && error.kind === 'protocol';

test('list and detail read only authenticated tenant endpoints and decode server payload', async () => {
  const calls: string[] = [];
  await withFetch((async (url, options) => {
    const u = String(url);
    calls.push(u);
    assert.equal(options?.method, 'GET');
    assert.equal(options?.body, undefined);
    assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer tenant-user-A');
    assert.equal(new Headers(options?.headers).has('Idempotency-Key'), false);
    assert.equal(options?.credentials, 'omit');
    return u.endsWith('/' + id) ? json({ data: draft }) : json({ data: [draft] });
  }) as typeof fetch, async () => {
    assert.deepEqual((await readPurchaseDrafts('tenant-user-A')).data, [draft]);
    assert.deepEqual((await readPurchaseDrafts('tenant-user-A', 'deleted')).data, [draft]);
    assert.deepEqual((await readPurchaseDraft('tenant-user-A', id)).data.cart, cart);
  });
  assert.deepEqual(calls, [
    origin + '/api/v1/purchases/drafts',
    origin + '/api/v1/purchases/drafts?state=deleted',
    origin + '/api/v1/purchases/drafts/' + id,
  ]);
});

test('create transmits opaque multi-unit/cart/payment snapshot exactly, no preview store or posting', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/purchases/drafts');
    assert.equal(init?.method, 'POST');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer user1');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    assert.deepEqual(JSON.parse(String(init?.body)), createPayload);
    return json({ data: draft }, 201);
  }) as typeof fetch, async () => {
    const returned = await createPurchaseDraft('user1', createPayload);
    assert.deepEqual(returned.data, draft);
    assert.deepEqual(returned.data.cart.lines, cart.lines);
    assert.deepEqual(returned.data.cart.payments, cart.payments);
  });
  assert.equal(calls, 1);
});

test('versioned update, recycle and recovery each send exactly one explicit action', async () => {
  const calls: { method: string | undefined; path: string; body: unknown }[] = [];
  await withFetch((async (url, init) => {
    const { pathname } = new URL(String(url));
    const method = init?.method;
    const body = JSON.parse(String(init?.body));
    calls.push({ method, path: pathname, body });
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer user1');
    return json({ data: method === 'DELETE' ? removed :
      method === 'PUT' ? { ...draft, version: 2 } : { ...draft, version: 4 } });
  }) as typeof fetch, async () => {
    assert.equal((await updatePurchaseDraft('user1', id, { ...payload, expectedVersion: 1 })).data.version, 2);
    assert.equal((await recyclePurchaseDraft('user1', id, { expectedVersion: 2 })).data.deletedAt, removedTime);
    assert.equal((await restorePurchaseDraft('user1', id, { expectedVersion: 3 })).data.version, 4);
  });
  assert.deepEqual(calls, [
    { method: 'PUT', path: '/api/v1/purchases/drafts/' + id, body: { ...payload, expectedVersion: 1 } },
    { method: 'DELETE', path: '/api/v1/purchases/drafts/' + id, body: { expectedVersion: 2 } },
    { method: 'POST', path: '/api/v1/purchases/drafts/' + id + '/restore', body: { expectedVersion: 3 } },
  ]);
});

test('server 409 stale version propagates without retry, draft loss or preview fallback', async () => {
  let calls = 0;
  await withFetch((async () => {
    calls++;
    return json({ error: { code: 'CONFLICT_STALE_VERSION', message: 'Reload the draft',
      details: {}, traceId: 'trace-1' } }, 409);
  }) as typeof fetch, async () => {
    await assert.rejects(updatePurchaseDraft('user1', id, { ...payload, expectedVersion: 1 }),
      (error: unknown) => error instanceof ApiError && error.kind === 'http' &&
        error.status === 409 && error.code === 'CONFLICT_STALE_VERSION');
  });
  assert.equal(calls, 1);
});

test('rejected permissions and offline first-create are not retried', async () => {
  for (const kind of ['forbidden', 'unauthenticated', 'offline']) {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      if (kind === 'offline') throw new TypeError('Network unavailable');
      const status = kind === 'forbidden' ? 403 : 401;
      return json({ error: { code: 'PERMISSION_DENIED', message: 'Not allowed', details: {}, traceId: 't-1' } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(createPurchaseDraft('T', createPayload),
        (error: unknown) => error instanceof ApiError && (
          error.kind === 'network' || error.kind === 'http'));
    });
    assert.equal(calls, 1);
  }
});

test('unspecified or unsafe fields, inline attachment bytes and lossy JSON reject before network', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: draft }); }) as typeof fetch, async () => {
    const circular: any = {}; circular.self = circular;
    for (const input of [
      { ...createPayload, tenantId: 'other-tenant' },
      { ...createPayload, operationId: '' },
      { ...createPayload, operationId: 'preview-operation' },
      { ...createPayload, operationId: 'A'.repeat(26) },
      { ...payload },
      { ...createPayload, grandTotalMinor: 200.5 },
      { ...createPayload, label: '' },
      { ...createPayload, itemCount: 501 },
      { ...createPayload, supplierName: ' a ' },
      { ...createPayload, cart: { photos: ['data:image/png;base64,AAAA'] } },
      { ...createPayload, cart: { lines: [{ id: 'l', price: undefined }] } },
      { ...createPayload, cart: { something: BigInt(5) } },
      { ...createPayload, cart: circular },
      { ...createPayload, cart: { lines: [{ something: () => 'oops' }] } },
      { ...createPayload, cart: Object.fromEntries([['__proto__', { isAdmin: true }]]) },
      { ...createPayload, cart: { notes: 'a'.repeat(120_001) } },
    ]) await assert.rejects(createPurchaseDraft('T', input as any), protocol);

    for (const action of [
      () => readPurchaseDraft('T', 'wrong-id'),
      () => readPurchaseDrafts('T', 'archived' as any),
      () => updatePurchaseDraft('T', id, { ...payload, expectedVersion: 0 }),
      () => recyclePurchaseDraft('T', id, { expectedVersion: -1 }),
      () => restorePurchaseDraft('T', '../wrong', { expectedVersion: 1 }),
      () => createPurchaseDraft('', createPayload),
      () => createPurchaseDraft('T', createPayload, undefined, 0),
    ]) await assert.rejects(action(), protocol);
  });
  assert.equal(calls, 0);
});

test('malformed, redacted or unexpected response shapes fail closed for all six endpoints', async () => {
  const invalidRows = [
    { ...draft, grandTotalMinor: '20050' },
    { ...draft, version: 0 },
    { ...draft, extra: true },
    { ...draft, recoverableUntilEpochMs: 123 },
    { ...removed, recoverableUntilEpochMs: removed.recoverableUntilEpochMs - 1 },
    { ...draft, cart: { photo: 'data:image/jpeg;base64,AA' } },
    { ...draft, businessDate: '2026-13-51' },
    { ...draft, createdAt: 'not-date' },
  ];
  for (const invalid of invalidRows) {
    assert.throws(() => decodePurchaseDraft({ data: invalid }), protocol);
    assert.throws(() => decodePurchaseDraftList({ data: [invalid] }), protocol);
  }
  assert.throws(() => decodePurchaseDraft({ data: draft, extra: true }), protocol);
  assert.throws(() => decodePurchaseDraftList({ data: [draft], total: 1 }), protocol);
  assert.deepEqual(decodePurchaseDraftList({ data: [] }).data, []);
});

test('aborting a pending read propagates once and does not fall back to preview state', async () => {
  const controller = new AbortController();
  let calls = 0;
  await withFetch((async (_url, init) => {
    calls++;
    return new Promise<Response>((_resolve, reject) => {
      if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      controller.abort();
    });
  }) as typeof fetch, async () => {
    await assert.rejects(readPurchaseDrafts('T', 'active', controller.signal, 5),
      (error: unknown) => error instanceof ApiError && error.kind === 'network');
  });
  assert.equal(calls, 1);
});


test('stable create operation is transmitted in body on each explicit retry; 409 does not retry itself', async () => {
  const sent: unknown[] = [];
  await withFetch((async (_url, init) => {
    sent.push(JSON.parse(String(init?.body)));
    if (sent.length === 1) throw new TypeError('Lost response after possible server commit');
    if (sent.length === 2) return json({ data: draft }, 201);
    return json({ error: { code: 'IDEMPOTENCY_KEY_REUSED',
      message: 'Operation key used for a different create request', details: {}, traceId: 'trace' } }, 409);
  }) as typeof fetch, async () => {
    await assert.rejects(createPurchaseDraft('user1', createPayload),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
    assert.equal(sent.length, 1, 'an uncertain POST is never automatically retried');
    const recovered = await createPurchaseDraft('user1', createPayload);
    assert.equal(recovered.data.id, id);
    await assert.rejects(createPurchaseDraft('user1', { ...createPayload, label: 'Different' }),
      (e: unknown) => e instanceof ApiError && e.kind === 'http' &&
        e.status === 409 && e.code === 'IDEMPOTENCY_KEY_REUSED');
  });
  assert.equal(sent.length, 3);
  assert.deepEqual(sent[0], sent[1]);
  assert.deepEqual(sent[0], createPayload);
  assert.equal((sent[0] as Record<string, unknown>).operationId, operationId);
});
