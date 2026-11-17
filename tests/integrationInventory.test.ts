import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { decodeInventoryOverview, decodeInventoryLotPage, decodeInventoryAdjustments,
  readInventoryOverview, readInventoryLots, readInventoryAdjustments } from '../src/integration/inventory.ts';

const origin = 'https://hisabiq-inventory.test';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const otherId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const lotId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const sourceId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const locationId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const stock = { productId, productName: 'Wire', productStatus: 'ACTIVE', baseUnitName: 'Feet',
  tracksExpiry: false, locationId, locationName: 'Main store', qtyOnHand: 3500,
  minStockQty: 1000, stockStatus: 'IN_STOCK' };
const movement = { id: sourceId, productId, productName: 'Wire', locationName: 'Main store',
  lotId, qty: 1500, direction: 'IN', sourceType: 'PURCHASE',
  sourceId, sourceNumber: 'PUR-42', businessDate: '2026-11-11',
  createdAt: '2026-11-11T09:00:00.000Z' };
const overview = { data: { stock: [stock], movements: [movement] } };
const lot = { id: lotId, productId, productName: 'Wire', locationId, locationName: 'Main store',
  ownerType: 'OWNED', sourceType: 'PURCHASE', sourceId, sourceNumber: 'PUR-42',
  qtyReceived: 5000, qtyRemaining: 3500, expiryDate: null,
  status: 'OPEN', businessDate: '2026-11-11' };
const lotPage = { data: { data: [lot], page: { nextCursor: lotId, hasMore: true },
  valuationMethod: 'FIFO',
  expiry: { expiredCount: 0, soonCount: 0, missingCount: 1, warnDays: 30 } } };
const adjustment = { id: sourceId, number: 'ADJ-3', productId, productName: 'Wire',
  locationName: 'Main store', qtyDelta: -500, direction: 'OUT', qty: 500,
  reason: 'DAMAGE', note: null, businessDate: '2026-11-12',
  createdAt: '2026-11-12T10:00:00.000Z', createdByName: 'Owner' };

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
}
async function withFetch(fake: typeof fetch, action: () => Promise<void>): Promise<void> {
  const prevFetch = globalThis.fetch, prevWindow = (globalThis as any).window;
  const prevLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await action(); } finally {
    (globalThis as any).fetch = prevFetch;
    if (prevWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = prevWindow;
    if (prevLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = prevLocation;
  }
}

test('overview sends authenticated bounded read, keeps scale-3 quantities and omits cost', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    const u = new URL(String(url));
    assert.equal(u.pathname, '/api/v1/inventory');
    assert.equal(u.searchParams.get('productId'), productId);
    assert.equal(u.searchParams.get('fromDate'), '2026-11-01');
    assert.equal(u.searchParams.get('toDate'), '2026-11-13');
    assert.equal(u.searchParams.get('limit'), '500');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-A');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json(overview);
  }) as typeof fetch, async () => {
    const result = await readInventoryOverview('tenant-A', {
      productId, fromDate: '2026-11-01', toDate: '2026-11-13', limit: 500,
    });
    assert.equal(result.data.stock[0]?.qtyOnHand, 3500);
    assert.equal(result.data.movements[0]?.qty, 1500);
    assert.equal(result.data.movements[0]?.sourceId, sourceId);
    assert.equal(Object.hasOwn(result.data.stock[0]!, 'valueMinor'), false);
    assert.equal(Object.hasOwn(result.data.movements[0]!, 'unitCost'), false);
  });
  assert.equal(calls, 1);
});

test('lots preserve nested keyset page, expiry summary and source provenance', async () => {
  await withFetch((async (url, init) => {
    const u = new URL(String(url));
    assert.equal(u.pathname, '/api/v1/inventory/lots');
    for (const [key, value] of Object.entries({
      productId, expiringOnly: 'true', expiry: 'MISSING', status: 'OPEN',
      cursor: lotId, limit: '100', sort: 'expiryDate', direction: 'ASC',
    })) assert.equal(u.searchParams.get(key), value, key);
    assert.equal(init?.method, 'GET');
    return json(lotPage);
  }) as typeof fetch, async () => {
    const r = await readInventoryLots('tenant-A', { productId, expiringOnly: true,
      expiry: 'MISSING', status: 'OPEN', cursor: lotId, limit: 100,
      sort: 'expiryDate', direction: 'ASC' });
    assert.equal(r.data.page.nextCursor, lotId);
    assert.equal(r.data.page.hasMore, true);
    assert.equal(r.data.valuationMethod, 'FIFO');
    assert.equal(r.data.expiry?.missingCount, 1);
    assert.equal(r.data.data[0]?.sourceNumber, 'PUR-42');
    assert.equal(r.data.data[0]?.qtyRemaining, 3500);
    assert.equal(Object.hasOwn(r.data.data[0]!, 'actualUnitCost'), false);
    assert.equal(Object.hasOwn(r.data.expiry!, 'expiredValueMinor'), false);
  });
});

test('false expiringOnly is omitted, no server coercion surprise', async () => {
  await withFetch((async (url) => {
    assert.equal(String(url), origin + '/api/v1/inventory/lots');
    return json({ data: { data: [], page: { nextCursor: null, hasMore: false },
      valuationMethod: 'AVERAGE' } });
  }) as typeof fetch, async () => {
    const r = await readInventoryLots('token', { expiringOnly: false });
    assert.equal(r.data.valuationMethod, 'AVERAGE');
    assert.equal(Object.hasOwn(r.data, 'expiry'), false);
  });
});

test('adjustment history preserves signed delta, note, actor and optional cost', async () => {
  await withFetch((async (url, init) => {
    const u = new URL(String(url));
    assert.equal(u.pathname, '/api/v1/inventory/adjustments');
    assert.equal(u.searchParams.get('productId'), productId);
    assert.equal(u.searchParams.get('limit'), '20');
    assert.equal(init?.method, 'GET');
    return json({ data: [adjustment] });
  }) as typeof fetch, async () => {
    const r = await readInventoryAdjustments('token', { productId, limit: 20 });
    assert.equal(r.data[0]?.qtyDelta, -500);
    assert.equal(r.data[0]?.reason, 'DAMAGE');
    assert.equal(r.data[0]?.createdByName, 'Owner');
    assert.equal(Object.hasOwn(r.data[0]!, 'valueMinor'), false);
  });
});

test('authorized cost fields retain exact values including zero', () => {
  const a = decodeInventoryOverview({ data: { stock: [{ ...stock, valueMinor: 0 }],
    movements: [{ ...movement, unitCost: 123456 }] } });
  const b = decodeInventoryLotPage({ data: { ...lotPage.data,
    data: [{ ...lot, purchaseUnitCost: 500000, actualUnitCost: 499001,
      landedCostTotal: 120, valueMinor: 7000 }],
    expiry: { ...lotPage.data.expiry, expiredValueMinor: 0 } } });
  const c = decodeInventoryAdjustments({ data: [{ ...adjustment, valueMinor: -500 }] });
  assert.equal(a.data.stock[0]?.valueMinor, 0);
  assert.equal(a.data.movements[0]?.unitCost, 123456);
  assert.equal(b.data.data[0]?.actualUnitCost, 499001);
  assert.equal(b.data.expiry?.expiredValueMinor, 0);
  assert.equal(c.data[0]?.valueMinor, -500);
});

test('strict response decoders reject unknown keys, bad IDs, dates, money and enums', () => {
  const invalid: Array<() => unknown> = [
    () => decodeInventoryOverview({ stock: [stock], movements: [movement] }),
    () => decodeInventoryOverview({ ...overview, page: {} }),
    () => decodeInventoryOverview({ data: { ...overview.data, rogue: true } }),
    () => decodeInventoryOverview({ data: { ...overview.data,
      stock: [{ ...stock, productId: 'preview-id' }] } }),
    () => decodeInventoryOverview({ data: { ...overview.data,
      stock: [{ ...stock, valueMinor: Number.MAX_SAFE_INTEGER + 1 }] } }),
    () => decodeInventoryOverview({ data: { ...overview.data,
      stock: [{ ...stock, qtyOnHand: 3.5 }] } }),
    () => decodeInventoryOverview({ data: { ...overview.data,
      movements: [{ ...movement, businessDate: '2026-02-30' }] } }),
    () => decodeInventoryLotPage({ ...lotPage.data }),
    () => decodeInventoryLotPage({ data: { ...lotPage.data, page: { hasMore: true } } }),
    () => decodeInventoryLotPage({ data: { ...lotPage.data, valuationMethod: 'LIFO' } }),
    () => decodeInventoryLotPage({ data: { ...lotPage.data, data: [{ ...lot, ownerType: 'OTHER' }] } }),
    () => decodeInventoryLotPage({ data: { ...lotPage.data, data: [{ ...lot, unitCost: 120 }] } }),
    () => decodeInventoryLotPage({ data: { ...lotPage.data,
      expiry: { ...lotPage.data.expiry, warnDays: -1 } } }),
    () => decodeInventoryAdjustments({ data: [{ ...adjustment, reason: 'PERSONAL_USE' }] }),
    () => decodeInventoryAdjustments({ data: [{ ...adjustment, valueMinor: '500' }] }),
    () => decodeInventoryAdjustments({ data: [adjustment], extra: true }),
  ];
  for (const run of invalid) {
    assert.throws(run, (e: any) => e instanceof ApiError && e.kind === 'protocol');
  }
});

test('invalid and extra query keys fail before making any request', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(overview); }) as typeof fetch, async () => {
    const bad: Array<() => Promise<unknown>> = [
      () => readInventoryOverview('token', { productId: 'demo-id' }),
      () => readInventoryOverview('token', { limit: 0 }),
      () => readInventoryOverview('token', { limit: 501 }),
      () => readInventoryOverview('token', { limit: 1.5 }),
      () => readInventoryOverview('token', { fromDate: '2026-02-30' }),
      () => readInventoryOverview('token', { fromDate: '2026-12-02', toDate: '2026-11-01' }),
      () => readInventoryOverview('token', { foo: 1 } as any),
      () => readInventoryLots('token', { cursor: '../unsafe' }),
      () => readInventoryLots('token', { expiringOnly: 'false' as any }),
      () => readInventoryLots('token', { expiry: 'TODAY' as any }),
      () => readInventoryLots('token', { status: 'VOID' as any }),
      () => readInventoryLots('token', { sort: 'valueMinor' as any }),
      () => readInventoryLots('token', { direction: 'UP' as any }),
      () => readInventoryLots('token', { limit: 101 }),
      () => readInventoryLots('token', { rogue: true } as any),
      () => readInventoryAdjustments('token', { toDate: '2026-13-01' }),
    ];
    for (const run of bad) await assert.rejects(run,
      (e: any) => e instanceof ApiError && e.kind === 'protocol');
  });
  assert.equal(calls, 0);
});

test('tenant-specific bearer and cost fields are not cached or blended', async () => {
  const tokens: string[] = [];
  await withFetch((async (_url, init) => {
    const auth = new Headers(init?.headers).get('Authorization') ?? '';
    tokens.push(auth);
    return json(auth === 'Bearer A'
      ? { data: { stock: [{ ...stock, valueMinor: 200 }], movements: [movement] } }
      : { data: { stock: [{ ...stock, productId: otherId }], movements: [] } });
  }) as typeof fetch, async () => {
    const a = await readInventoryOverview('A');
    const b = await readInventoryOverview('B');
    assert.equal(a.data.stock[0]?.valueMinor, 200);
    assert.equal(b.data.stock[0]?.productId, otherId);
    assert.equal(Object.hasOwn(b.data.stock[0]!, 'valueMinor'), false);
  });
  assert.deepEqual(tokens, ['Bearer A', 'Bearer B']);
});

for (const status of [401, 403, 503]) {
  test('HTTP ' + status + ' refuses inventory without fallback or retry', async () => {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: { code: 'DENIED', message: 'Denied',
        details: {}, traceId: 'test' } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(readInventoryLots('token'),
        (e: any) => e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
    assert.equal(calls, 1);
  });
}

test('offline, unexpected MIME, corrupt JSON and malformed 200 are refused', async () => {
  const cases: Array<{ fake: typeof fetch; kind: string }> = [
    { fake: (async () => { throw new Error('offline'); }) as typeof fetch, kind: 'network' },
    { fake: (async () => new Response('OK', {
      headers: { 'content-type': 'text/html' } })) as typeof fetch, kind: 'protocol' },
    { fake: (async () => new Response('{broken', {
      headers: { 'content-type': 'application/json' } })) as typeof fetch, kind: 'protocol' },
    { fake: (async () => json({ data: { stock: [] } })) as typeof fetch, kind: 'protocol' },
  ];
  for (const { fake, kind } of cases) {
    await withFetch(fake, async () => {
      await assert.rejects(readInventoryOverview('token'),
        (e: any) => e instanceof ApiError && e.kind === kind);
    });
  }
});

test('aborted GET drops late response even when fetch ignores abort', async () => {
  const controller = new AbortController();
  let calls = 0;
  await withFetch((async () => {
    calls++;
    controller.abort();
    return json(lotPage);
  }) as typeof fetch, async () => {
    await assert.rejects(readInventoryLots('token', {}, controller.signal),
      (e: any) => e instanceof ApiError && e.kind === 'network');
  });
  assert.equal(calls, 1);
});

test('already aborted request sends no fetch', async () => {
  const controller = new AbortController();
  controller.abort();
  let calls = 0;
  await withFetch((async () => { calls++; return json(overview); }) as typeof fetch, async () => {
    await assert.rejects(readInventoryOverview('token', {}, controller.signal),
      (e: any) => e instanceof ApiError && e.kind === 'network');
  });
  assert.equal(calls, 0);
});
