import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  decodeCatalogMetadataV1,
  patchCatalogMetadataV1,
  readCatalogMetadataV1,
} from '../src/integration/catalog-metadata-v1.ts';
import { decodeCatalog } from '../src/integration/catalog.ts';

const origin = 'https://hisabiq.test';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const brandId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const categoryId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const features = {
  productOffers: true,
  expiryTracking: true,
  serialTracking: false,
  warranty: true,
  customerGroups: false,
  vendors: true,
};
const metadata = {
  data: {
    units: [{ id: unitId, name: 'Gauge', nameBn: 'গেজ', symbol: 'Gg', version: 3 }],
    brands: [{ id: brandId, name: 'Local', nameBn: null, version: 1 }],
    categories: [{ id: categoryId, name: 'Electrical', nameBn: 'ইলেকট্রিক', parentId: null, version: 8 }],
    features,
  },
};
const legacy = {
  data: {
    units: [{ id: unitId, name: 'Gauge' }],
    brands: [{ id: brandId, name: 'Local' }],
    categories: [{ id: categoryId, name: 'Electrical', parentId: null }],
    features,
  },
};

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, action: () => Promise<void>): Promise<void> {
  const oldFetch = globalThis.fetch;
  const oldWindow = (globalThis as any).window;
  const oldLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await action(); }
  finally {
    (globalThis as any).fetch = oldFetch;
    if (oldWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = oldWindow;
    if (oldLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = oldLocation;
  }
}

test('versioned decoder requires explicit null metadata and positive row versions', () => {
  assert.deepEqual(decodeCatalogMetadataV1(metadata), metadata);
  assert.equal(decodeCatalogMetadataV1(metadata).data.units[0]?.symbol, 'Gg');
  // The legacy response shape is not silently upgraded.
  assert.deepEqual(decodeCatalog(legacy), legacy);
  assert.throws(() => decodeCatalog(metadata), (e: unknown) =>
    e instanceof ApiError && e.kind === 'protocol');
  assert.throws(() => decodeCatalogMetadataV1(legacy), (e: unknown) =>
    e instanceof ApiError && e.kind === 'protocol');
});

test('decoder rejects unknown fields, absent nulls, bad IDs, malformed versions and wrong type', () => {
  const invalid = [
    { ...metadata, data: { ...metadata.data, units: [{ ...metadata.data.units[0], version: 0 }] } },
    { ...metadata, data: { ...metadata.data, units: [{ ...metadata.data.units[0], version: 1.5 }] } },
    { ...metadata, data: { ...metadata.data, units: [{ ...metadata.data.units[0], version: '3' }] } },
    { ...metadata, data: { ...metadata.data, units: [{ ...metadata.data.units[0], nameBn: undefined }] } },
    { ...metadata, data: { ...metadata.data, units: [{ ...metadata.data.units[0], symbol: undefined }] } },
    { ...metadata, data: { ...metadata.data, brands: [{ ...metadata.data.brands[0], symbol: 'X' }] } },
    { ...metadata, data: { ...metadata.data, categories: [{ ...metadata.data.categories[0], parentId: 'foreign' }] } },
    { ...metadata, data: { ...metadata.data, features: { ...features, vendors: 'true' } } },
    { ...metadata, extra: 'unexpected' },
  ];
  for (const item of invalid) {
    assert.throws(() => decodeCatalogMetadataV1(item),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  }
});

test('authenticated GET uses versioned path without retries, cache or legacy fallback', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/catalog/metadata-v1');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-A');
    return json(metadata);
  }) as typeof fetch, async () => {
    assert.deepEqual(await readCatalogMetadataV1('tenant-A'), metadata);
  });
  assert.equal(calls, 1);
});

test('unit PATCH normalizes Bengali name and symbol but preserves missing fields', async () => {
  const requests: unknown[] = [];
  await withFetch((async (url, init) => {
    assert.equal(String(url), origin + '/api/v1/catalog/metadata-v1/units/' + unitId);
    assert.equal(init?.method, 'PATCH');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer editor');
    requests.push(JSON.parse(String(init?.body)));
    return json(metadata);
  }) as typeof fetch, async () => {
    await patchCatalogMetadataV1('editor', { kind: 'units', id: unitId,
      expectedVersion: 3, nameBn: '  গে\u0307জ  ', symbol: ' Gg ' });
    await patchCatalogMetadataV1('editor', { kind: 'units', id: unitId,
      expectedVersion: 3, symbol: null });
    await patchCatalogMetadataV1('editor', { kind: 'units', id: unitId,
      expectedVersion: 3, nameBn: null });
  });
  assert.deepEqual(requests, [
    { expectedVersion: 3, nameBn: 'গে\u0307জ', symbol: 'Gg' },
    { expectedVersion: 3, symbol: null },
    { expectedVersion: 3, nameBn: null },
  ]);
});

test('brand/category PATCH only sends nameBn; null is explicit clear', async () => {
  const paths: string[] = [];
  const bodies: unknown[] = [];
  await withFetch((async (url, init) => {
    paths.push(new URL(String(url)).pathname);
    bodies.push(JSON.parse(String(init?.body)));
    return json(metadata);
  }) as typeof fetch, async () => {
    await patchCatalogMetadataV1('token-A', {
      kind: 'brands', id: brandId, expectedVersion: 1, nameBn: ' লোকাল   ব্র্যান্ড ',
    });
    await patchCatalogMetadataV1('token-A', {
      kind: 'categories', id: categoryId, expectedVersion: 8, nameBn: null,
    });
  });
  assert.deepEqual(paths, [
    '/api/v1/catalog/metadata-v1/brands/' + brandId,
    '/api/v1/catalog/metadata-v1/categories/' + categoryId,
  ]);
  assert.deepEqual(bodies, [
    { expectedVersion: 1, nameBn: 'লোকাল ব্র্যান্ড' },
    { expectedVersion: 8, nameBn: null },
  ]);
});

test('invalid write semantics reject before transport and never turn undefined into clear', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(metadata); }) as typeof fetch, async () => {
    const invalid = [
      { kind: 'units', id: unitId, expectedVersion: 3 },
      { kind: 'units', id: unitId, expectedVersion: 3, nameBn: undefined },
      { kind: 'units', id: unitId, expectedVersion: 3, nameBn: '' },
      { kind: 'units', id: unitId, expectedVersion: 3, nameBn: ' '.repeat(20) },
      { kind: 'units', id: unitId, expectedVersion: 3, symbol: 'a b' },
      { kind: 'units', id: unitId, expectedVersion: 3, symbol: 'abcde' },
      { kind: 'units', id: unitId, expectedVersion: 3, symbol: undefined },
      { kind: 'brands', id: brandId, expectedVersion: 3, symbol: 'X', nameBn: 'লোকাল' },
      { kind: 'categories', id: categoryId, expectedVersion: 3 },
      { kind: 'categories', id: categoryId, expectedVersion: 0, nameBn: null },
      { kind: 'categories', id: '../foreign', expectedVersion: 3, nameBn: null },
      { kind: 'brands', id: brandId, expectedVersion: 3, nameBn: 'x'.repeat(121) },
      { kind: 'units', id: unitId, expectedVersion: 3, nameBn: null, unexpected: 1 },
    ];
    for (const bad of invalid) {
      await assert.rejects(
        patchCatalogMetadataV1('token-A', bad as any),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol',
      );
    }
  });
  assert.equal(calls, 0);
});

test('conflict, denied, unavailable and lost responses never retry or claim success', async () => {
  for (const status of [401, 403, 404, 409, 503]) {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: {
        code: 'REFUSED', message: 'Refused', details: {}, traceId: 'verified-trace',
      } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(
        patchCatalogMetadataV1('tenant-A',
          { kind: 'units', id: unitId, expectedVersion: 3, symbol: 'GG' }),
        (e: unknown) => e instanceof ApiError && e.kind === 'http' && e.status === status,
      );
    });
    assert.equal(calls, 1);
  }
  let calls = 0;
  await withFetch((async () => { calls++; throw new Error('offline'); }) as typeof fetch, async () => {
    await assert.rejects(
      patchCatalogMetadataV1('tenant-A',
        { kind: 'units', id: unitId, expectedVersion: 3, nameBn: 'গেজ' }),
      (e: unknown) => e instanceof ApiError && e.kind === 'network',
    );
  });
  assert.equal(calls, 1);
});

test('timeout aborts without retrying a versioned GET', async () => {
  let calls = 0;
  await withFetch((async (_url, init) => {
    calls++;
    return new Promise<Response>((_resolve, reject) => {
      if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
  }) as typeof fetch, async () => {
    await assert.rejects(readCatalogMetadataV1('tenant-A', undefined, 5),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
  });
  assert.equal(calls, 1);
});
