import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  normalizeSaleDraftPayload, saveSaleDraft, readSaleDraft, updateSaleDraft,
  decodeSaleDraftDetail, decodeSavedSaleDraft,
} from '../src/integration/sale-draft-writes.ts';

const origin = 'https://hisabiq-draft-write.test';
const draftId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const otherId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const operationId = '01ARZ3NDEKTSV4RRFFQ69G5FB0';
const tenantId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FB1';
const cart = {
  schema: 'hisabiq.connected.pos.draft.v1',
  sourceTenantId: tenantId,
  customerId: null,
  lines: [{
    productId, qty: '1', secondaryQty: '12', unit: 'Gauge',
    unitQuantities: { Gauge: '1', Gira: '12' },
    unitSnapshot: { sellingPrices: { Gauge: 235.35, Gira: 14.5 } },
    price: '235.35', serials: ['SN-A101'],
    warranty: { duration: 18, unit: 'months' }, expiry: '2027-09-01',
    bundleSources: { component: 'OWN' },
  }],
  payments: [{ method: 'Cash', amount: '100.10' }, { method: 'bKash', amount: '80.20' }],
  installment: { count: 3, schedule: [{ dueDate: '2026-12-01', amount: 15010 }] },
};
const payload = {
  label: 'Pending counter sale', customerName: 'Rahman Hardware',
  itemCount: 1, grandTotalMinor: 45030, cart,
};
const created = { ...payload, id: draftId, businessDate: '2026-11-15',
  savedAt: '2026-11-15T01:20:30.000Z' };
const detail = { ...created, version: 2, updatedAt: '2026-11-15T01:25:30.000Z' };
const protocol = (e: unknown) => e instanceof ApiError && e.kind === 'protocol';
function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(
  fake: typeof fetch,
  task: () => Promise<void>,
): Promise<void> {
  const host = globalThis as unknown as { fetch: typeof fetch; window?: unknown; location?: unknown };
  const before = { fetch: host.fetch, window: host.window, location: host.location };
  host.fetch = fake;
  host.window = { location: { origin } };
  host.location = { origin };
  try { await task(); }
  finally {
    host.fetch = before.fetch;
    if (before.window === undefined) delete host.window; else host.window = before.window;
    if (before.location === undefined) delete host.location; else host.location = before.location;
  }
}

test('M7-03 create uses exactly one same-origin POST with authenticated ULID header and full opaque cart', async () => {
  let count = 0;
  await withFetch((async (url, init) => {
    count++;
    assert.equal(String(url), origin + '/api/v1/sales/drafts');
    assert.equal(init?.method, 'POST');
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-A');
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), operationId);
    assert.deepEqual(JSON.parse(String(init?.body)), payload);
    return json({ data: created }, 201);
  }) as typeof fetch, async () => {
    assert.deepEqual((await saveSaleDraft('tenant-A', payload, operationId)).data, created);
  });
  assert.equal(count, 1);
});

test('M7-03 detail GET preserves server ID, version and exact frozen cart', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/sales/drafts/' + draftId);
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json({ data: detail });
  }) as typeof fetch, async () => {
    const received = await readSaleDraft('tenant-A', draftId);
    assert.equal(received.data.version, 2);
    assert.deepEqual(received.data.cart, cart);
    assert.equal(received.data.id, draftId);
  });
  assert.equal(calls, 1);
});

test('M7-03 PUT preserves original server draft ID and requires exact optimistic version', async () => {
  let count = 0;
  await withFetch((async (url, init) => {
    count++;
    assert.equal(String(url), origin + '/api/v1/sales/drafts/' + draftId);
    assert.equal(init?.method, 'PUT');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    assert.deepEqual(JSON.parse(String(init?.body)), { ...payload, expectedVersion: 2 });
    return json({ data: { ...detail, version: 3, updatedAt: '2026-11-15T01:30:30.000Z' } });
  }) as typeof fetch, async () => {
    const result = await updateSaleDraft('tenant-A', draftId, { ...payload, expectedVersion: 2 });
    assert.equal(result.data.version, 3);
    assert.equal(result.data.id, draftId);
  });
  assert.equal(count, 1);
});

test('M7-03 guards payload JSON source against functions, getters, prototype keys, sparse arrays and cycles', async () => {
  const cycle: Record<string, unknown> = {}; cycle['self'] = cycle;
  const sparse = new Array(2); sparse[0] = { productId };
  const getter = Object.defineProperty({}, 'danger', { enumerable: true, get() { throw Error('not executed'); } });
  const badCarts: unknown[] = [
    null, [], { x: undefined }, { x: Number.NaN }, { x: Number.POSITIVE_INFINITY },
    { x: BigInt(1) }, { x: Symbol('x') }, { x: () => true },
    { x: sparse }, { x: getter }, cycle,
    JSON.parse('{"__proto__":{"admin":true}}'), { x: 'data:image/png;base64,abcd' },
    { x: { value: 'x'.repeat(120_001) } },
  ];
  for (const bad of badCarts) {
    assert.throws(() => normalizeSaleDraftPayload({ ...payload, cart: bad } as never), protocol);
  }
  assert.deepEqual(normalizeSaleDraftPayload(payload), payload);
});

test('M7-03 rejects unsafe labels, money, item bounds, ID, key, version and unauthorized token before fetch', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: created }); }) as typeof fetch, async () => {
    const badInputs = [
      { ...payload, label: '' },
      { ...payload, label: 'x'.repeat(81) },
      { ...payload, itemCount: -1 },
      { ...payload, itemCount: 501 },
      { ...payload, itemCount: 1.5 },
      { ...payload, grandTotalMinor: -1 },
      { ...payload, grandTotalMinor: 1.5 },
      { ...payload, grandTotalMinor: Number.MAX_SAFE_INTEGER + 1 },
      { ...payload, customerName: 'x'.repeat(121) },
      { ...payload, unknown: 'extra' },
    ];
    for (const bad of badInputs) {
      await assert.rejects(saveSaleDraft('tenant-A', bad as never, operationId), protocol);
    }
    for (const run of [
      () => saveSaleDraft('', payload, operationId),
      () => saveSaleDraft('two words', payload, operationId),
      () => saveSaleDraft('tenant-A', payload, 'not-ulid'),
      () => readSaleDraft('tenant-A', 'draft-1'),
      () => updateSaleDraft('tenant-A', draftId, { ...payload, expectedVersion: 0 }),
      () => updateSaleDraft('tenant-A', draftId, { ...payload, expectedVersion: 2.1 }),
      () => updateSaleDraft('tenant-A', draftId, { ...payload, expectedVersion: 2_147_483_647 }),
      () => updateSaleDraft('tenant-A', 'fixture-id', { ...payload, expectedVersion: 1 }),
      () => saveSaleDraft('tenant-A', payload, operationId, undefined, -1),
    ]) await assert.rejects(run(), protocol);
  });
  assert.equal(calls, 0);
});

test('M7-03 strict response decoding rejects wrong envelope, extra fields, malformed timestamp and non-ULID', () => {
  assert.deepEqual(decodeSavedSaleDraft({ data: created }).data, created);
  assert.deepEqual(decodeSaleDraftDetail({ data: detail }).data, detail);
  const wrong: unknown[] = [
    created, { data: { ...created, extra: 'x' } },
    { data: { ...created, id: 'demo-12' } },
    { data: { ...created, savedAt: 'invalid' } },
    { data: { ...created, grandTotalMinor: Infinity } },
    { data: { ...created, cart: { x: undefined } } },
  ];
  for (const item of wrong) assert.throws(() => decodeSavedSaleDraft(item), protocol);
  const badDetails: unknown[] = [
    { data: created },
    { data: { ...detail, extra: 1 } },
    { data: { ...detail, version: 0 } },
    { data: { ...detail, version: 1.5 } },
    { data: { ...detail, updatedAt: '2026-11-15' } },
  ];
  for (const item of badDetails) assert.throws(() => decodeSaleDraftDetail(item), protocol);
});

test('M7-03 mismatched detail/update ID or stale version is not treated as successful edit', async () => {
  await withFetch((async () => json({ data: { ...detail, id: otherId } })) as typeof fetch, async () => {
    await assert.rejects(readSaleDraft('tenant-A', draftId), protocol);
    await assert.rejects(updateSaleDraft('tenant-A', draftId, { ...payload, expectedVersion: 1 }), protocol);
  });
  await withFetch((async () => json({ data: detail })) as typeof fetch, async () => {
    await assert.rejects(updateSaleDraft('tenant-A', draftId, { ...payload, expectedVersion: 2 }), protocol);
  });
});

test('M7-03 401/403/409/500 and offline preserve errors, send only one request, never retry or fallback', async () => {
  for (const status of [401, 403, 409, 500]) {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: { code: 'CONFLICT_STALE_VERSION', message: 'Cannot update',
        details: {}, traceId: 'trace-sale-draft' } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(saveSaleDraft('tenant-A', payload, operationId),
        (e: unknown) => e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
    assert.equal(calls, 1);
  }
  let calls = 0;
  await withFetch((async () => { calls++; throw new Error('lost-ack'); }) as typeof fetch, async () => {
    await assert.rejects(saveSaleDraft('tenant-A', payload, operationId),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
  });
  assert.equal(calls, 1);
});

test('M7-03 cart mutation after request start cannot change serialized operation intent', async () => {
  const mutable = structuredClone(payload);
  let release!: (response: Response) => void;
  const reply = new Promise<Response>(resolve => { release = resolve; });
  let sent: unknown;
  await withFetch((async (_url, init) => {
    sent = JSON.parse(String(init?.body));
    return reply;
  }) as typeof fetch, async () => {
    const flight = saveSaleDraft('tenant-A', mutable, operationId);
    mutable.cart.lines[0]!.price = '0';
    mutable.cart.payments[0]!.amount = '9999';
    release(json({ data: created }, 201));
    await flight;
  });
  assert.deepEqual(sent, payload);
});

test('M7-03 aborted request is refused without network dispatch', async () => {
  let count = 0;
  const controller = new AbortController(); controller.abort();
  await withFetch((async () => { count++; return json({ data: created }); }) as typeof fetch, async () => {
    await assert.rejects(saveSaleDraft('tenant-A', payload, operationId, controller.signal),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
  });
  assert.equal(count, 0);
});
