import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '../src/integration/errors.ts';
import {
  decodeCatalogSettingsUsageV1,
  readCatalogSettingsUsageV1,
} from '../src/integration/catalog-settings-usage-v1.ts';

const origin = 'https://hisabiq.example';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const brandId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const categoryId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const missingId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const parentId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';

const accepted = {
  data: {
    units: [{ id: unitId, productCount: 2 }],
    brands: [{ id: brandId, productCount: 0 }],
    categories: [
      { id: categoryId, directProductCount: 1, subtreeProductCount: 3, parentState: 'root' },
    ],
    unresolved: {
      unitIds: [missingId], brandIds: [], categoryIds: [], parentIds: [parentId],
    },
  },
};

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, task: () => Promise<void>): Promise<void> {
  const originalFetch = globalThis.fetch;
  const originalWindow = (globalThis as any).window;
  const originalLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await task(); }
  finally {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = originalWindow;
    if (originalLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = originalLocation;
  }
}
function isProtocol(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'protocol';
}
function copy(): typeof accepted {
  return structuredClone(accepted);
}

test('P7c: strict versionless count snapshot preserves zero, nonzero, inactive use and unresolved warnings', () => {
  assert.deepEqual(decodeCatalogSettingsUsageV1(accepted), accepted);
  const zero = copy();
  zero.data.units[0]!.productCount = 0;
  zero.data.categories[0]!.directProductCount = 0;
  zero.data.categories[0]!.subtreeProductCount = 0;
  zero.data.categories[0]!.parentState = 'unresolved';
  assert.deepEqual(decodeCatalogSettingsUsageV1(zero), zero);
});

test('P7c: one authenticated read-only GET, exact path, no body, credentials or idempotency key', async () => {
  let requests = 0;
  await withFetch((async (url, init) => {
    requests++;
    assert.equal(String(url), origin + '/api/v1/catalog/settings-usage-v1');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer signed-tenant-token');
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), null);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    return json(accepted);
  }) as typeof fetch, async () => {
    assert.deepEqual(await readCatalogSettingsUsageV1('signed-tenant-token'), accepted);
  });
  assert.equal(requests, 1);
});

test('P7c: rejects malformed master shape, unknown/missing keys and invalid counts (never partial values)', () => {
  const cases: unknown[] = [
    null, {}, [], { data: null }, { data: {} },
    { ...copy(), extra: 1 },
    { data: { ...copy().data, products: [] } },
    { data: { ...copy().data, unresolved: undefined } },
    { data: { ...copy().data, units: {} } },
    { data: { ...copy().data, brands: [{ id: brandId, productCount: -1 }] } },
    { data: { ...copy().data, units: [{ id: unitId, productCount: 1.5 }] } },
    { data: { ...copy().data, units: [{ id: unitId, productCount: '3' }] } },
    { data: { ...copy().data, units: [{ id: unitId, productCount: Number.MAX_SAFE_INTEGER + 1 }] } },
    { data: { ...copy().data, categories: [{ id: categoryId, directProductCount: 2,
      subtreeProductCount: 1, parentState: 'root' }] } },
    { data: { ...copy().data, categories: [{ id: categoryId, directProductCount: 0,
      subtreeProductCount: 1, parentState: 'invalid' }] } },
    { data: { ...copy().data, categories: [{ id: categoryId, directProductCount: 0,
      subtreeProductCount: 1, parentState: 'present', injected: true }] } },
    { data: { ...copy().data, unresolved: { ...copy().data.unresolved, parentIds: ['wrong-id'] } } },
  ];
  for (const raw of cases) {
    assert.throws(() => decodeCatalogSettingsUsageV1(raw), isProtocol);
  }
});

test('P7c: duplicate master IDs and duplicate unresolved references fail closed', () => {
  const a = copy();
  a.data.units.push({ id: unitId, productCount: 9 });
  const b = copy();
  b.data.unresolved.unitIds.push(missingId);
  const c = copy();
  c.data.brands.push({ id: brandId, productCount: 2 });
  for (const v of [a, b, c]) assert.throws(() => decodeCatalogSettingsUsageV1(v), isProtocol);
});

test('P7c: HTTP 401, 403 and 5xx remain HTTP errors with correct statuses, never fallback', async () => {
  for (const status of [401, 403, 503]) {
    let count = 0;
    await withFetch((async () => {
      count++;
      return json({ error: { code: status === 403 ? 'PERMISSION_DENIED' : 'REJECTED',
        message: 'Access denied', details: {}, traceId: 'test-trace' } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(readCatalogSettingsUsageV1('token'), (error: unknown) =>
        error instanceof ApiError && error.kind === 'http' && error.status === status);
    });
    assert.equal(count, 1);
  }
});

test('P7c: invalid JSON, 204 and HTML success are rejected without a legacy read', async () => {
  const bad: Response[] = [
    new Response(null, { status: 204 }),
    new Response('<p>ok</p>', { status: 200, headers: { 'content-type': 'text/html' } }),
    new Response('{bad', { status: 200, headers: { 'content-type': 'application/json' } }),
  ];
  for (const response of bad) {
    let count = 0;
    await withFetch((async () => { count++; return response; }) as typeof fetch, async () => {
      await assert.rejects(readCatalogSettingsUsageV1('token'), isProtocol);
    });
    assert.equal(count, 1);
  }
});

test('P7c: no request for pre-aborted signal or invalid timeout, even if fetch mock ignores abort', async () => {
  let count = 0;
  const signal = new AbortController();
  signal.abort();
  await withFetch((async () => { count++; return json(accepted); }) as typeof fetch, async () => {
    await assert.rejects(readCatalogSettingsUsageV1('token', signal.signal), (e: unknown) => e instanceof ApiError);
    for (const limit of [0, -1, 120001, 1.5, Number.NaN]) {
      await assert.rejects(readCatalogSettingsUsageV1('token', undefined, limit), isProtocol);
    }
  });
  assert.equal(count, 0);
});

test('P7c: abort during transport rejects a stale result even if a proxy ignores AbortSignal', async () => {
  const signal = new AbortController();
  await withFetch((async () => {
    signal.abort();
    return json(accepted);
  }) as typeof fetch, async () => {
    await assert.rejects(readCatalogSettingsUsageV1('token', signal.signal), (error: unknown) =>
      error instanceof ApiError);
  });
});

test('P7c: timeout aborts the GET, surfaces an error, and never retries', async () => {
  let count = 0;
  await withFetch((async (_url, init) => {
    count++;
    return await new Promise<Response>((_resolve, reject) => {
      if (init?.signal?.aborted) return reject(new Error('aborted'));
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    });
  }) as typeof fetch, async () => {
    await assert.rejects(readCatalogSettingsUsageV1('token', undefined, 5), (error: unknown) =>
      error instanceof ApiError && error.kind === 'network');
  });
  assert.equal(count, 1);
});

test('P7c: network errors do not trigger a second GET, mock fallback or a local count cache', async () => {
  let count = 0;
  await withFetch((async () => {
    count++;
    throw new Error('connection reset');
  }) as typeof fetch, async () => {
    await assert.rejects(readCatalogSettingsUsageV1('token'), (error: unknown) =>
      error instanceof ApiError && error.kind === 'network');
  });
  assert.equal(count, 1);
});
