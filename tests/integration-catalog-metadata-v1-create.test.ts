import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '../src/integration/errors.ts';
import { decodeCatalogMetadataV1 } from '../src/integration/catalog-metadata-v1.ts';
import {
  createCatalogMetadataV1,
  validateCatalogMetadataV1Create,
} from '../src/integration/catalog-metadata-v1-create.ts';

const origin = 'https://hisabiq.test';
const parentId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const features = {
  productOffers: true, expiryTracking: false, serialTracking: false,
  warranty: true, customerGroups: false, vendors: true,
};
const snapshot = {
  data: {
    units: [{ id: unitId, name: 'Gauge', nameBn: 'গেজ', symbol: 'Gg', version: 1 }],
    brands: [],
    categories: [{ id: parentId, name: 'Electrical', nameBn: null, parentId: null, version: 1 }],
    features,
  },
};

function json(value: unknown, status = 201): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, action: () => Promise<void>): Promise<void> {
  const originalFetch = globalThis.fetch;
  const originalWindow = (globalThis as any).window;
  const originalLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await action(); }
  finally {
    (globalThis as any).fetch = originalFetch;
    if (originalWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = originalWindow;
    if (originalLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = originalLocation;
  }
}

test('create unit POST sends name/Bengali/symbol together once and returns strict versioned catalog', async () => {
  let requests = 0;
  await withFetch((async (url, init) => {
    requests++;
    assert.equal(String(url), origin + '/api/v1/catalog/metadata-v1/units');
    assert.equal(init?.method, 'POST');
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-A');
    assert.deepEqual(JSON.parse(String(init?.body)), {
      name: 'Gauge', nameBn: 'গেজ তার', symbol: 'Gg',
    });
    return json(snapshot);
  }) as typeof fetch, async () => {
    const result = await createCatalogMetadataV1('tenant-A', {
      kind: 'units', name: ' Gauge ', nameBn: '  গেজ   তার ', symbol: ' Gg ',
    });
    assert.deepEqual(result, decodeCatalogMetadataV1(snapshot));
  });
  assert.equal(requests, 1);
});

test('brand omits unspecified metadata and category requires explicit null or ULID parent', async () => {
  const paths: string[] = [];
  const bodies: unknown[] = [];
  await withFetch((async (url, init) => {
    paths.push(new URL(String(url)).pathname);
    bodies.push(JSON.parse(String(init?.body)));
    return json(snapshot);
  }) as typeof fetch, async () => {
    await createCatalogMetadataV1('tenant-A', { kind: 'brands', name: ' Local ' });
    await createCatalogMetadataV1('tenant-A', {
      kind: 'categories', name: 'Electrical', parentId: null, nameBn: null,
    });
    await createCatalogMetadataV1('tenant-A', {
      kind: 'categories', name: 'Wire', parentId, nameBn: 'তারের ধরন',
    });
  });
  assert.deepEqual(paths, [
    '/api/v1/catalog/metadata-v1/brands',
    '/api/v1/catalog/metadata-v1/categories',
    '/api/v1/catalog/metadata-v1/categories',
  ]);
  assert.deepEqual(bodies, [
    { name: 'Local' },
    { name: 'Electrical', nameBn: null, parentId: null },
    { name: 'Wire', nameBn: 'তারের ধরন', parentId },
  ]);
});

test('undefined metadata is not silently rewritten to null and unknown fields fail closed', async () => {
  const invalid = [
    { kind: 'units', name: '' },
    { kind: 'units', name: ' '.repeat(3) },
    { kind: 'units', name: 'X'.repeat(121) },
    { kind: 'units', name: 'Gauge', nameBn: '' },
    { kind: 'units', name: 'Gauge', nameBn: undefined },
    { kind: 'units', name: 'Gauge', symbol: undefined },
    { kind: 'units', name: 'Gauge', symbol: 'A B' },
    { kind: 'units', name: 'Gauge', symbol: 'ABCDE' },
    { kind: 'units', name: 'Gauge', symbol: '' },
    { kind: 'units', name: 'Gauge', id: unitId },
    { kind: 'units', name: 'Gauge', tenantId: parentId },
    { kind: 'units', name: 'Gauge', createdBy: parentId },
    { kind: 'units', name: 'Gauge', version: 1 },
    { kind: 'units', name: 'Gauge', operationId: parentId },
    { kind: 'brands', name: 'Local', symbol: 'X' },
    { kind: 'categories', name: 'Wire' },
    { kind: 'categories', name: 'Wire', parentId: undefined },
    { kind: 'categories', name: 'Wire', parentId: 'foreign' },
    { kind: 'categories', name: 'Wire', parentId: 'a'.repeat(26) },
    { kind: 'categories', name: 'Wire', parentId: parentId, symbol: 'X' },
    { kind: 'other', name: 'Gauge' },
  ];
  let requests = 0;
  await withFetch((async () => { requests++; return json(snapshot); }) as typeof fetch, async () => {
    for (const command of invalid) {
      assert.throws(() => validateCatalogMetadataV1Create(command),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
      await assert.rejects(
        createCatalogMetadataV1('tenant-A', command as any),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol',
      );
    }
  });
  assert.equal(requests, 0);
});

test('nullable unit symbol and Bengali metadata retain null; omitted optional fields stay omitted', () => {
  assert.deepEqual(validateCatalogMetadataV1Create({
    kind: 'units', name: 'Piece', nameBn: null, symbol: null,
  }), { kind: 'units', body: { name: 'Piece', nameBn: null, symbol: null } });
  assert.deepEqual(validateCatalogMetadataV1Create({
    kind: 'units', name: 'Piece',
  }), { kind: 'units', body: { name: 'Piece' } });
});

test('HTTP errors, connection failure and invalid server catalog are not retried or treated as success', async () => {
  for (const status of [401, 403, 404, 409, 422, 503]) {
    let requests = 0;
    await withFetch((async () => {
      requests++;
      return json({ error: {
        code: 'DENIED', message: 'Rejected', details: {}, traceId: 'trace-id',
      } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(
        createCatalogMetadataV1('tenant-A', { kind: 'brands', name: 'Local' }),
        (e: unknown) => e instanceof ApiError && e.kind === 'http' && e.status === status,
      );
    });
    assert.equal(requests, 1);
  }
  let requests = 0;
  await withFetch((async () => {
    requests++;
    throw new Error('Connection lost after request may have reached server');
  }) as typeof fetch, async () => {
    await assert.rejects(
      createCatalogMetadataV1('tenant-A', { kind: 'units', name: 'Piece' }),
      (e: unknown) => e instanceof ApiError && e.kind === 'network',
    );
  });
  assert.equal(requests, 1);

  await withFetch((async () => json({
    data: { ...snapshot.data, units: [{ ...snapshot.data.units[0], version: undefined }] },
  })) as typeof fetch, async () => {
    await assert.rejects(
      createCatalogMetadataV1('tenant-A', { kind: 'units', name: 'Piece' }),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol',
    );
  });
});

test('external abort and deadline remain single-attempt without fallback', async () => {
  const abort = new AbortController();
  abort.abort();
  let requests = 0;
  await withFetch((async (_url, init) => {
    requests++;
    if (init?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });
  }) as typeof fetch, async () => {
    await assert.rejects(
      createCatalogMetadataV1('tenant-A', { kind: 'brands', name: 'Local' }, abort.signal),
      (e: unknown) => e instanceof ApiError && e.kind === 'network',
    );
    await assert.rejects(
      createCatalogMetadataV1('tenant-A', { kind: 'brands', name: 'Local' }, undefined, 5),
      (e: unknown) => e instanceof ApiError && e.kind === 'network',
    );
  });
  assert.equal(requests, 2);
});
