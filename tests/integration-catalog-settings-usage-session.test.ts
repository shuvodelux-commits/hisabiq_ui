import test from 'node:test';
import assert from 'node:assert/strict';

import { CatalogMetadataSessionBridge } from '../src/integration/catalog-metadata-session.ts';
import { ApiError } from '../src/integration/errors.ts';
import type { SessionSnapshot } from '../src/integration/session.ts';

const origin = 'https://hisabiq.test';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const brandId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const categoryId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const tenantA = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const tenantB = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const userA = '01ARZ3NDEKTSV4RRFFQ69G5FB0';
const rights = ['catalog.product.view', 'catalog.unit.manage'];
const signed = (overrides: Record<string, unknown> = {}): SessionSnapshot => ({
  status: 'authenticated', epoch: 8, tenantId: tenantA, userId: userA,
  timezone: 'Asia/Dhaka', username: 'owner', displayName: 'Owner',
  roleName: 'Owner', businessName: 'Karim Hardware',
  accessToken: 'access-A', permissions: [...rights], features: [],
  persistence: 'memory', ...overrides,
} as SessionSnapshot);

class Store {
  private current: SessionSnapshot;
  private listeners = new Set<() => void>();
  constructor(initial: SessionSnapshot) { this.current = initial; }
  getSnapshot = (): SessionSnapshot => this.current;
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };
  change(next: SessionSnapshot): void {
    this.current = next;
    for (const listener of this.listeners) listener();
  }
  get listenerCount(): number { return this.listeners.size; }
}
const catalog = { data: {
  units: [{ id: unitId, name: 'Foot', nameBn: 'ফুট', symbol: 'ft', version: 1 }],
  brands: [{ id: brandId, name: 'Vision', nameBn: null, version: 1 }],
  categories: [{ id: categoryId, name: 'Electrical', nameBn: null, parentId: null, version: 1 }],
  features: {
    productOffers: false, expiryTracking: false, serialTracking: false,
    warranty: false, customerGroups: false, vendors: false,
  },
} };
const usage = { data: {
  units: [{ id: unitId, productCount: 2 }],
  brands: [{ id: brandId, productCount: 0 }],
  categories: [{ id: categoryId, directProductCount: 1, subtreeProductCount: 2, parentState: 'root' }],
  unresolved: { unitIds: [], brandIds: [], categoryIds: [], parentIds: [] },
} };

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, action: () => Promise<void>): Promise<void> {
  const original = globalThis.fetch;
  const originalWindow = (globalThis as any).window;
  const originalLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await action(); }
  finally {
    globalThis.fetch = original;
    if (originalWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = originalWindow;
    if (originalLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = originalLocation;
  }
}
function protocol(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'protocol';
}
const paths: string[] = [];
async function readMetadata(bridge: CatalogMetadataSessionBridge): Promise<void> {
  await bridge.read();
}

test('P7d: unsigned/preview/locked/authenticating cannot read usage or leak a credential', async () => {
  let requests = 0;
  await withFetch((async () => { requests++; return json(usage); }) as typeof fetch, async () => {
    for (const source of [
      { status: 'preview', epoch: 0 },
      { status: 'signed-out', epoch: 1 },
      { status: 'locked', epoch: 2, reason: 'inactivity', persistence: 'memory' },
      { status: 'authenticating', epoch: 3 },
    ] as SessionSnapshot[]) {
      const store = new Store(source);
      const bridge = new CatalogMetadataSessionBridge(store);
      await assert.rejects(bridge.readUsage(), protocol);
      assert.equal(store.listenerCount, 0);
    }
  });
  assert.equal(requests, 0);
});

test('P7d: PRODUCT_VIEW and verified same-session metadata preflight mandatory, then one exact signed GET', async () => {
  let requests = 0;
  const store = new Store(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  await withFetch((async (url, init) => {
    requests++;
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer access-A');
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    const path = new URL(String(url)).pathname;
    paths.push(path);
    return json(path.endsWith('settings-usage-v1') ? usage : catalog);
  }) as typeof fetch, async () => {
    await assert.rejects(bridge.readUsage(), protocol);
    assert.equal(requests, 0);
    await readMetadata(bridge);
    assert.equal(bridge.isReadReady(), true);
    assert.deepEqual(await bridge.readUsage(), usage);
    assert.equal(bridge.isReadReady(), true);
  });
  assert.deepEqual(paths.splice(0), ['/api/v1/catalog/metadata-v1', '/api/v1/catalog/settings-usage-v1']);
  assert.equal(requests, 2);
  assert.equal(store.listenerCount, 0);
});

test('P7d: absent or revoked PRODUCT_VIEW refuses usage before fetch even after a valid preflight', async () => {
  let calls = 0;
  await withFetch((async (_url, _init) => { calls++; return json(catalog); }) as typeof fetch, async () => {
    const store = new Store(signed({ permissions: [] }));
    const bridge = new CatalogMetadataSessionBridge(store);
    await assert.rejects(bridge.readUsage(), (e: unknown) =>
      e instanceof ApiError && e.kind === 'http' && e.status === 403);
    assert.equal(calls, 0);
    store.change(signed());
    await bridge.read();
    store.change(signed({ permissions: [] }));
    await assert.rejects(bridge.readUsage(), (e: unknown) =>
      e instanceof ApiError && e.kind === 'http' && e.status === 403);
    assert.equal(calls, 1);
  });
});

test('P7d: count response from a switched tenant/user/epoch/token is rejected despite a proxy ignoring abort', async () => {
  const switches = [
    { tenantId: tenantB }, { userId: unitId }, { epoch: 9 }, { accessToken: 'refresh-token' },
  ];
  for (const switchTo of switches) {
    const store = new Store(signed());
    const bridge = new CatalogMetadataSessionBridge(store);
    let usageSignal: AbortSignal | undefined;
    await withFetch((async (url, init) => {
      if (String(url).endsWith('/metadata-v1')) return json(catalog);
      usageSignal = init?.signal ?? undefined;
      store.change(signed(switchTo));
      return json(usage); // simulated stale success ignoring abort
    }) as typeof fetch, async () => {
      await bridge.read();
      await assert.rejects(bridge.readUsage(), protocol);
      assert.equal(usageSignal?.aborted, true);
      assert.equal(bridge.isReadReady(), false);
    });
    assert.equal(store.listenerCount, 0);
  }
});

test('P7d: same-principal role revocation during request rejects late counts and revokes preflight', async () => {
  const store = new Store(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  let countRequests = 0;
  await withFetch((async (url) => {
    if (String(url).endsWith('/metadata-v1')) return json(catalog);
    countRequests++;
    // Same tenant, user, token and epoch; ONLY the live role changed.
    store.change(signed({ permissions: [] }));
    return json(usage); // Simulates a proxy delivering a late 200.
  }) as typeof fetch, async () => {
    await bridge.read();
    await assert.rejects(bridge.readUsage(), (e: unknown) =>
      e instanceof ApiError && e.kind === 'http' && e.status === 403);
    assert.equal(bridge.isReadReady(), false);
  });
  assert.equal(countRequests, 1);
  assert.equal(store.listenerCount, 0);
});

test('P7d: external abort rejects usage and no response reaches a later session', async () => {
  const store = new Store(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  const signal = new AbortController();
  let requests = 0;
  await withFetch((async (url) => {
    requests++;
    if (String(url).endsWith('/metadata-v1')) return json(catalog);
    signal.abort();
    return json(usage);
  }) as typeof fetch, async () => {
    await bridge.read();
    await assert.rejects(bridge.readUsage(signal.signal), (e: unknown) =>
      e instanceof ApiError);
    assert.equal(bridge.isReadReady(), false);
    assert.equal(requests, 2);
  });
  assert.equal(store.listenerCount, 0);
});

test('P7d: failure/403/network resets metadata preflight and cannot retry count without a new metadata GET', async () => {
  for (const kind of ['http403', 'network', 'invalid'] as const) {
    const store = new Store(signed());
    const bridge = new CatalogMetadataSessionBridge(store);
    let calls = 0;
    await withFetch((async (url) => {
      calls++;
      if (String(url).endsWith('/metadata-v1')) return json(catalog);
      if (kind === 'http403') return json({
        error: { code: 'PERMISSION_DENIED', message: 'Denied', details: {}, traceId: 'trace' },
      }, 403);
      if (kind === 'invalid') return json({ data: { units: null } });
      throw new Error('Connection reset');
    }) as typeof fetch, async () => {
      await bridge.read();
      await assert.rejects(bridge.readUsage(), (e: unknown) => e instanceof ApiError);
      assert.equal(bridge.isReadReady(), false);
      await assert.rejects(bridge.readUsage(), protocol);
      assert.equal(calls, 2);
    });
    assert.equal(store.listenerCount, 0);
  }
});

test('P7d: successful usage read retains readiness for the already-tested fullEdit path', async () => {
  const store = new Store(signed());
  const bridge = new CatalogMetadataSessionBridge(store);
  const routes: string[] = [];
  await withFetch((async (url, init) => {
    const path = new URL(String(url)).pathname;
    routes.push(path);
    if (path.endsWith('settings-usage-v1')) return json(usage);
    if (init?.method === 'PATCH') return json(catalog);
    return json(catalog);
  }) as typeof fetch, async () => {
    await bridge.read();
    await bridge.readUsage();
    assert.equal(bridge.isReadReady(), true);
    await bridge.fullEdit({ kind: 'units', id: unitId, expectedVersion: 1, name: 'Feet' });
  });
  assert.deepEqual(routes, [
    '/api/v1/catalog/metadata-v1', '/api/v1/catalog/settings-usage-v1',
    '/api/v1/catalog/metadata-v1/units/' + unitId + '/full-edit',
  ]);
  assert.equal(store.listenerCount, 0);
});
