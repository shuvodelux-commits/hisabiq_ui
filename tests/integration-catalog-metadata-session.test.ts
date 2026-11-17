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

const rights = [
  'catalog.product.view', 'catalog.unit.manage',
  'catalog.brand.manage', 'catalog.category.manage',
];
const signed = (overrides: Record<string, unknown> = {}): SessionSnapshot => ({
  status: 'authenticated', epoch: 2, tenantId: tenantA, userId: userA,
  timezone: 'Asia/Dhaka', username: 'owner', displayName: 'Owner',
  roleName: 'Owner', businessName: 'Karim Hardware',
  accessToken: 'access-A', permissions: [...rights], features: [],
  persistence: 'memory', ...overrides,
} as SessionSnapshot);

class FakeStore {
  private listeners = new Set<() => void>();
  private current: SessionSnapshot;
  constructor(current: SessionSnapshot) { this.current = current; }
  getSnapshot = (): SessionSnapshot => this.current;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  change(snapshot: SessionSnapshot): void {
    this.current = snapshot;
    for (const listener of this.listeners) listener();
  }
  get listenerCount(): number { return this.listeners.size; }
}

const data = {
  data: {
    units: [{ id: unitId, name: 'Gauge', nameBn: null, symbol: null, version: 1 }],
    brands: [],
    categories: [],
    features: {
      productOffers: false, expiryTracking: false, serialTracking: false,
      warranty: false, customerGroups: false, vendors: false,
    },
  },
};

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, callback: () => Promise<void>): Promise<void> {
  const originalFetch = globalThis.fetch;
  const originalWindow = (globalThis as any).window;
  const originalLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await callback(); }
  finally {
    (globalThis as any).fetch = originalFetch;
    if (originalWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = originalWindow;
    if (originalLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = originalLocation;
  }
}

test('preview, signed-out, authenticating and locked sessions make zero HTTP requests', async () => {
  let requests = 0;
  await withFetch((async () => { requests++; return json(data); }) as typeof fetch, async () => {
    for (const status of [
      { status: 'preview', epoch: 0 },
      { status: 'signed-out', epoch: 2 },
      { status: 'authenticating', epoch: 3 },
      { status: 'locked', epoch: 5, reason: 'offline', persistence: 'memory' },
    ] as SessionSnapshot[]) {
      const store = new FakeStore(status);
      const bridge = new CatalogMetadataSessionBridge(store);
      await assert.rejects(bridge.read(), (e: unknown) =>
        e instanceof ApiError && e.kind === 'protocol');
      await assert.rejects(bridge.create({ kind: 'units', name: 'Gauge' }), (e: unknown) =>
        e instanceof ApiError && e.kind === 'protocol');
      assert.equal(bridge.isReadReady(), false);
      assert.equal(store.listenerCount, 0);
    }
  });
  assert.equal(requests, 0);
});

test('read must succeed before any create/PATCH; permission refusal happens before HTTP', async () => {
  let requests = 0;
  await withFetch((async (url, init) => {
    requests++;
    assert.equal(String(url), origin + '/api/v1/catalog/metadata-v1');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer access-A');
    return json(data);
  }) as typeof fetch, async () => {
    const store = new FakeStore(signed());
    const bridge = new CatalogMetadataSessionBridge(store);
    await assert.rejects(bridge.create({ kind: 'brands', name: 'Local' }),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    await assert.rejects(bridge.patch({
      kind: 'units', id: unitId, expectedVersion: 1, nameBn: 'গেজ',
    }), (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    assert.equal(requests, 0);
    assert.deepEqual(await bridge.read(), data);
    assert.equal(bridge.isReadReady(), true);
    assert.equal(requests, 1);
    store.change(signed({ permissions: ['catalog.product.view'] }));
    await assert.rejects(bridge.create({ kind: 'brands', name: 'Local' }),
      (e: unknown) => e instanceof ApiError && e.status === 403);
    assert.equal(requests, 1);
  });
});

test('a successful current-session GET gates one authenticated atomic CREATE and versioned PATCH', async () => {
  const methods: string[] = [];
  const paths: string[] = [];
  const store = new FakeStore(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  await withFetch((async (url, init) => {
    methods.push(init?.method ?? '');
    paths.push(new URL(String(url)).pathname);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer access-A');
    if (init?.method === 'POST') {
      assert.deepEqual(JSON.parse(String(init.body)), {
        name: 'Gauge', nameBn: 'গেজ', symbol: 'Gg',
      });
    }
    if (init?.method === 'PATCH') {
      assert.deepEqual(JSON.parse(String(init.body)), {
        expectedVersion: 1, nameBn: 'গেজ',
      });
    }
    return json(data, init?.method === 'POST' ? 201 : 200);
  }) as typeof fetch, async () => {
    await bridge.read();
    await bridge.create({
      kind: 'units', name: 'Gauge', nameBn: 'গেজ', symbol: 'Gg',
    });
    await bridge.patch({
      kind: 'units', id: unitId, expectedVersion: 1, nameBn: 'গেজ',
    });
  });
  assert.deepEqual(methods, ['GET','POST','PATCH']);
  assert.deepEqual(paths, [
    '/api/v1/catalog/metadata-v1',
    '/api/v1/catalog/metadata-v1/units',
    '/api/v1/catalog/metadata-v1/units/' + unitId,
  ]);
  assert.equal(store.listenerCount, 0);
  assert.equal(bridge.isReadReady(), true);
});

test('lock during GET discards even a late response from a fetch that ignores abort', async () => {
  const store = new FakeStore(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  let resolveFetch!: (r: Response) => void;
  let observedSignal: AbortSignal | null = null;
  await withFetch((async (_url, init) => {
    observedSignal = init?.signal ?? null;
    return await new Promise<Response>(resolve => { resolveFetch = resolve; });
  }) as typeof fetch, async () => {
    const pending = bridge.read();
    await Promise.resolve();
    store.change({
      status: 'locked', epoch: 3, reason: 'inactivity', persistence: 'memory',
    });
    assert.equal(observedSignal?.aborted, true);
    resolveFetch(json(data));
    await assert.rejects(pending, (e: unknown) =>
      e instanceof ApiError && e.kind === 'protocol' && /changed/.test(e.message));
  });
  assert.equal(store.listenerCount, 0);
  assert.equal(bridge.isReadReady(), false);
});

test('tenant switch, token refresh and changed epoch revoke a successful preflight', async () => {
  let requests = 0;
  await withFetch((async () => { requests++; return json(data); }) as typeof fetch, async () => {
    const store = new FakeStore(signed());
    const bridge = new CatalogMetadataSessionBridge(store);
    await bridge.read();
    assert.equal(bridge.isReadReady(), true);
    for (const next of [
      signed({ tenantId: tenantB }),
      signed({ accessToken: 'rotated-token' }),
      signed({ epoch: 99 }),
    ]) {
      store.change(next);
      assert.equal(bridge.isReadReady(), false);
      await assert.rejects(
        bridge.create({ kind: 'units', name: 'Piece' }),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol',
      );
    }
  });
  assert.equal(requests, 1);
});

test('changing tenant while a CREATE is in flight prevents its old result being consumed', async () => {
  const store = new FakeStore(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  let resolvePost!: (response: Response) => void;
  let postAbortSignal: AbortSignal | null = null;
  let requests = 0;
  await withFetch((async (_url, init) => {
    requests++;
    if (init?.method === 'GET') return json(data);
    postAbortSignal = init?.signal ?? null;
    return await new Promise<Response>(resolve => { resolvePost = resolve; });
  }) as typeof fetch, async () => {
    await bridge.read();
    const pending = bridge.create({ kind: 'units', name: 'Pipe' });
    await Promise.resolve();
    store.change(signed({ tenantId: tenantB, epoch: 3, accessToken: 'access-B' }));
    assert.equal(postAbortSignal?.aborted, true);
    resolvePost(json(data, 201));
    await assert.rejects(pending, (e: unknown) =>
      e instanceof ApiError && e.kind === 'protocol' && /changed/.test(e.message));
    assert.equal(bridge.isReadReady(), false);
  });
  assert.equal(requests, 2);
  assert.equal(store.listenerCount, 0);
});

test('ambiguous CREATE network failure is single-attempt and requires a new GET', async () => {
  let calls = 0;
  const store = new FakeStore(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  await withFetch((async (_url, init) => {
    calls++;
    if (init?.method === 'GET') return json(data);
    throw new Error('Request may have reached the server');
  }) as typeof fetch, async () => {
    await bridge.read();
    await assert.rejects(
      bridge.create({ kind: 'brands', name: 'Local' }),
      (e: unknown) => e instanceof ApiError && e.kind === 'network',
    );
    assert.equal(bridge.isReadReady(), false);
    await assert.rejects(
      bridge.create({ kind: 'brands', name: 'Local' }),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol',
    );
  });
  assert.equal(calls, 2);
});

test('bad server response does not arm the preflight; backend 403/404 cannot fall back to preview', async () => {
  for (const status of [403,404]) {
    let requests = 0;
    const store = new FakeStore(signed());
    const bridge = new CatalogMetadataSessionBridge(store);
    await withFetch((async () => {
      requests++;
      return json({ error: {
        code: 'DENIED', message: 'Not authorized', details: {}, traceId: 'trace-id',
      } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(bridge.read(), (e: unknown) =>
        e instanceof ApiError && e.kind === 'http' && e.status === status);
      assert.equal(bridge.isReadReady(), false);
      await assert.rejects(bridge.patch({
        kind: 'units', id: unitId, expectedVersion: 1, symbol: 'Pcs',
      }), (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    });
    assert.equal(requests, 1);
  }
});
