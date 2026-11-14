import test from 'node:test';
import assert from 'node:assert/strict';

import { CatalogMetadataSessionBridge } from '../src/integration/catalog-metadata-session.ts';
import { ApiError } from '../src/integration/errors.ts';
import type { SessionSnapshot } from '../src/integration/session.ts';

const origin = 'https://hisabiq.test';
const tenantA = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const tenantB = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const userA = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const brandId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const categoryId = '01ARZ3NDEKTSV4RRFFQ69G5FB0';
const rights = [
  'catalog.product.view', 'catalog.unit.manage',
  'catalog.brand.manage', 'catalog.category.manage',
];
const signed = (overrides: Record<string, unknown> = {}): SessionSnapshot => ({
  status: 'authenticated', epoch: 7, tenantId: tenantA, userId: userA,
  timezone: 'Asia/Dhaka', username: 'owner', displayName: 'Owner',
  roleName: 'Owner', businessName: 'Karim Hardware',
  accessToken: 'access-A', permissions: [...rights], features: [],
  persistence: 'memory', ...overrides,
} as SessionSnapshot);
class FakeStore {
  private current: SessionSnapshot;
  private listeners = new Set<() => void>();
  constructor(source: SessionSnapshot) { this.current = source; }
  getSnapshot = (): SessionSnapshot => this.current;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  change(next: SessionSnapshot): void {
    this.current = next;
    for (const notify of this.listeners) notify();
  }
  get listenerCount(): number { return this.listeners.size; }
}
const features = {
  productOffers: false, expiryTracking: false, serialTracking: false,
  warranty: false, customerGroups: false, vendors: false,
};
const catalog = {
  data: {
    units: [{ id: unitId, name: 'Gauge', nameBn: 'গেজ', symbol: 'Gg', version: 1 }],
    brands: [{ id: brandId, name: 'Local', nameBn: null, version: 1 }],
    categories: [{ id: categoryId, name: 'Electrical', nameBn: null, parentId: null, version: 1 }],
    features,
  },
};
const updated = {
  data: {
    ...catalog.data,
    units: [{ id: unitId, name: 'New Gauge', nameBn: 'নতুন গেজ', symbol: 'NG', version: 2 }],
  },
};
function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, action: () => Promise<void>): Promise<void> {
  const prior = globalThis.fetch;
  const priorWindow = (globalThis as any).window;
  const priorLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await action(); }
  finally {
    globalThis.fetch = prior;
    if (priorWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = priorWindow;
    if (priorLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = priorLocation;
  }
}
const unitChange = {
  kind: 'units' as const, id: unitId, expectedVersion: 1,
  name: ' New  Gauge ', nameBn: ' নতুন  গেজ ', symbol: ' NG ',
};
const brandChange = {
  kind: 'brands' as const, id: brandId, expectedVersion: 1,
  name: 'Acme', nameBn: 'অ্যাকমি',
};
const categoryChange = {
  kind: 'categories' as const, id: categoryId, expectedVersion: 1,
  name: 'Electrical Parts', nameBn: null,
};

test('P6e: unsigned, preview, locked and authenticating sessions refuse edit before fetch', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(catalog); }) as typeof fetch, async () => {
    for (const state of [
      { status: 'preview', epoch: 0 },
      { status: 'signed-out', epoch: 8 },
      { status: 'locked', epoch: 9, reason: 'inactivity', persistence: 'memory' },
      { status: 'authenticating', epoch: 9 },
    ] as SessionSnapshot[]) {
      const store = new FakeStore(state);
      const bridge = new CatalogMetadataSessionBridge(store);
      await assert.rejects(bridge.fullEdit(unitChange),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
      assert.equal(bridge.isReadReady(), false);
      assert.equal(store.listenerCount, 0);
    }
  });
  assert.equal(calls, 0);
});

test('P6e: full edit requires a successful current-tenant metadata read before any PATCH', async () => {
  let calls = 0;
  const store = new FakeStore(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  await withFetch((async () => { calls++; return json(catalog); }) as typeof fetch, async () => {
    await assert.rejects(bridge.fullEdit(unitChange),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    assert.equal(calls, 0);
    await bridge.read();
    assert.equal(bridge.isReadReady(), true);
    assert.equal(calls, 1);
  });
  assert.equal(store.listenerCount, 0);
});

test('P6e: one authenticated versioned full-edit request is atomic; backend response is authoritative', async () => {
  const store = new FakeStore(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  const paths: string[] = [];
  const methods: string[] = [];
  let writeBody: unknown;
  await withFetch((async (url, init) => {
    paths.push(new URL(String(url)).pathname);
    methods.push(init?.method ?? '');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer access-A');
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    if (init?.method === 'PATCH') {
      writeBody = JSON.parse(String(init?.body));
      return json(updated);
    }
    return json(catalog);
  }) as typeof fetch, async () => {
    await bridge.read();
    assert.deepEqual(await bridge.fullEdit(unitChange), updated);
    assert.equal(bridge.isReadReady(), true);
  });
  assert.deepEqual(paths, [
    '/api/v1/catalog/metadata-v1',
    '/api/v1/catalog/metadata-v1/units/' + unitId + '/full-edit',
  ]);
  assert.deepEqual(methods, ['GET', 'PATCH']);
  assert.deepEqual(writeBody, {
    expectedVersion: 1, name: 'New Gauge', nameBn: 'নতুন গেজ', symbol: 'NG',
  });
  assert.equal(store.listenerCount, 0);
});

test('P6e: brand/category full-edit uses distinct opt-in URLs and retains omission/null semantics', async () => {
  const store = new FakeStore(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  const routes: string[] = [];
  const bodies: unknown[] = [];
  await withFetch((async (url, init) => {
    if (init?.method === 'GET') return json(catalog);
    routes.push(new URL(String(url)).pathname);
    bodies.push(JSON.parse(String(init?.body)));
    return json(catalog);
  }) as typeof fetch, async () => {
    await bridge.read();
    await bridge.fullEdit(brandChange);
    await bridge.fullEdit(categoryChange);
  });
  assert.deepEqual(routes, [
    '/api/v1/catalog/metadata-v1/brands/' + brandId + '/full-edit',
    '/api/v1/catalog/metadata-v1/categories/' + categoryId + '/full-edit',
  ]);
  assert.deepEqual(bodies, [
    { expectedVersion: 1, name: 'Acme', nameBn: 'অ্যাকমি' },
    { expectedVersion: 1, name: 'Electrical Parts', nameBn: null },
  ]);
  assert.equal(store.listenerCount, 0);
});

test('P6e: per-kind permission is checked after preflight, without a rejected HTTP write', async () => {
  for (const [command, expectedPermission] of [
    [unitChange, 'catalog.unit.manage'],
    [brandChange, 'catalog.brand.manage'],
    [categoryChange, 'catalog.category.manage'],
  ] as const) {
    let calls = 0;
    const store = new FakeStore(signed({ permissions: ['catalog.product.view'] }));
    const bridge = new CatalogMetadataSessionBridge(store);
    await withFetch((async () => { calls++; return json(catalog); }) as typeof fetch, async () => {
      await bridge.read();
      await assert.rejects(bridge.fullEdit(command),
        (e: unknown) => e instanceof ApiError && e.status === 403
          && e.code === 'PERMISSION_DENIED');
      assert.equal(calls, 1, 'Missing ' + expectedPermission + ' must not send PATCH');
    });
    assert.equal(store.listenerCount, 0);
  }
});

test('P6e: switching tenant during a non-aborting full edit discards late success', async () => {
  const store = new FakeStore(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  let settle!: (response: Response) => void;
  let entering!: () => void;
  const entered = new Promise<void>(resolve => { entering = resolve; });
  let signal: AbortSignal | null = null;
  let calls = 0;
  await withFetch((async (_url, init) => {
    calls++;
    if (init?.method === 'GET') return json(catalog);
    signal = init?.signal ?? null;
    entering();
    return new Promise<Response>(resolve => { settle = resolve; });
  }) as typeof fetch, async () => {
    await bridge.read();
    const pending = bridge.fullEdit(unitChange);
    await entered;
    store.change(signed({ tenantId: tenantB, epoch: 8, accessToken: 'access-B' }));
    assert.equal(signal?.aborted, true);
    settle(json(updated)); // network/proxy ignored AbortSignal, must not expose it
    await assert.rejects(pending,
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol'
        && /changed/.test(e.message));
    assert.equal(bridge.isReadReady(), false);
  });
  assert.equal(calls, 2);
  assert.equal(store.listenerCount, 0);
});

test('P6e: token rotation and epoch change invalidate a prepared full edit', async () => {
  for (const changed of [
    { accessToken: 'rotated' },
    { epoch: 8 },
    { userId: tenantB },
  ]) {
    let calls = 0;
    const store = new FakeStore(signed());
    const bridge = new CatalogMetadataSessionBridge(store);
    await withFetch((async () => { calls++; return json(catalog); }) as typeof fetch, async () => {
      await bridge.read();
      store.change(signed(changed));
      assert.equal(bridge.isReadReady(), false);
      await assert.rejects(bridge.fullEdit(unitChange),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
      assert.equal(calls, 1);
    });
    assert.equal(store.listenerCount, 0);
  }
});

test('P6e: stale/denied/missing/server errors require a fresh read, never an automatic retry', async () => {
  for (const status of [403, 404, 409, 500, 503]) {
    let reads = 0;
    let writes = 0;
    const bridge = new CatalogMetadataSessionBridge(new FakeStore(signed()));
    await withFetch((async (_url, init) => {
      if (init?.method === 'GET') { reads++; return json(catalog); }
      writes++;
      if (writes === 1) return json({ error: {
        code: status === 409 ? 'CONFLICT_STALE_VERSION' : 'DENIED',
        message: 'Cannot edit', details: {}, traceId: 'safe-trace',
      } }, status);
      return json(updated);
    }) as typeof fetch, async () => {
      await bridge.read();
      await assert.rejects(bridge.fullEdit(unitChange),
        (e: unknown) => e instanceof ApiError && e.kind === 'http'
          && e.status === status);
      assert.equal(bridge.isReadReady(), false);
      await assert.rejects(bridge.fullEdit(unitChange),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
      assert.equal(writes, 1, 'Never retry on HTTP ' + status);
      await bridge.read();
      assert.deepEqual(await bridge.fullEdit(unitChange), updated);
      assert.equal(writes, 2);
    });
    assert.equal(reads, 2);
  }
});

test('P6e: lost write response is ambiguous, invalidates preflight and never retries', async () => {
  const bridge = new CatalogMetadataSessionBridge(new FakeStore(signed()));
  let reads = 0;
  let writes = 0;
  await withFetch((async (_url, init) => {
    if (init?.method === 'GET') { reads++; return json(catalog); }
    writes++;
    throw new Error('Connection lost after backend might have committed');
  }) as typeof fetch, async () => {
    await bridge.read();
    await assert.rejects(bridge.fullEdit(unitChange),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
    assert.equal(bridge.isReadReady(), false);
    await assert.rejects(bridge.fullEdit(unitChange),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  });
  assert.equal(reads, 1);
  assert.equal(writes, 1);
});

test('P6e: caller abort rejects once and releases all session listeners', async () => {
  const store = new FakeStore(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  let writes = 0;
  await withFetch((async (_url, init) => {
    if (init?.method === 'GET') return json(catalog);
    writes++;
    return new Promise<Response>((_resolve, reject) => {
      if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
      init?.signal?.addEventListener('abort', () =>
        reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
  }) as typeof fetch, async () => {
    await bridge.read();
    const controller = new AbortController();
    const pending = bridge.fullEdit(unitChange, controller.signal);
    controller.abort();
    await assert.rejects(pending,
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
    assert.equal(bridge.isReadReady(), false);
  });
  assert.equal(writes, 1);
  assert.equal(store.listenerCount, 0);
});
