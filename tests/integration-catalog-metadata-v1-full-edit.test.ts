import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  fullEditCatalogMetadataV1,
  patchCatalogMetadataV1,
} from '../src/integration/catalog-metadata-v1.ts';

const origin = 'https://hisabiq.test';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const brandId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const categoryId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const features = {
  productOffers: true, expiryTracking: true, serialTracking: false,
  warranty: true, customerGroups: false, vendors: true,
};
const metadata = {
  data: {
    units: [{ id: unitId, name: 'Gauge New', nameBn: 'গেজ', symbol: 'é', version: 4 }],
    brands: [{ id: brandId, name: 'Acme', nameBn: 'এক্মে', version: 2 }],
    categories: [{ id: categoryId, name: 'Electrical', nameBn: 'বিদ্যুৎ', parentId: null, version: 9 }],
    features,
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

test('P6d: unit full edit is one authenticated opt-in PATCH, NFC-normalized, with no legacy fallback', async () => {
  const sent: unknown[] = [];
  await withFetch((async (url, init) => {
    assert.equal(String(url), origin + '/api/v1/catalog/metadata-v1/units/' + unitId + '/full-edit');
    assert.equal(init?.method, 'PATCH');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-editor');
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), null);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    sent.push(JSON.parse(String(init?.body)));
    return json(metadata);
  }) as typeof fetch, async () => {
    const result = await fullEditCatalogMetadataV1('tenant-editor', {
      kind: 'units', id: unitId, expectedVersion: 3,
      name: '  Gauge    New  ', nameBn: ' গে\u099c  ', symbol: ' e\u0301 ',
    });
    assert.deepEqual(result, metadata);
    assert.equal(result.data.units[0]?.version, 4);
  });
  assert.deepEqual(sent, [{ expectedVersion: 3, name: 'Gauge New', nameBn: 'গেজ', symbol: 'é' }]);
});

test('P6d: each kind uses only its own full-edit route with stable version, never a name-only rename', async () => {
  const routes: string[] = [];
  const payloads: unknown[] = [];
  await withFetch((async (url, init) => {
    routes.push(new URL(String(url)).pathname);
    assert.equal(init?.method, 'PATCH');
    payloads.push(JSON.parse(String(init?.body)));
    return json(metadata);
  }) as typeof fetch, async () => {
    await fullEditCatalogMetadataV1('token-A', {
      kind: 'brands', id: brandId, expectedVersion: 1, name: '  Acme ', nameBn: null,
    });
    await fullEditCatalogMetadataV1('token-A', {
      kind: 'categories', id: categoryId, expectedVersion: 8,
      name: ' Electric ', nameBn: ' বিদ্যুৎ  পণ্য ',
    });
  });
  assert.deepEqual(routes, [
    '/api/v1/catalog/metadata-v1/brands/' + brandId + '/full-edit',
    '/api/v1/catalog/metadata-v1/categories/' + categoryId + '/full-edit',
  ]);
  assert.deepEqual(payloads, [
    { expectedVersion: 1, name: 'Acme', nameBn: null },
    { expectedVersion: 8, name: 'Electric', nameBn: 'বিদ্যুৎ পণ্য' },
  ]);
});

test('P6d: omitted Bengali/symbol fields are omitted; explicit null clears only supplied metadata', async () => {
  const bodies: unknown[] = [];
  await withFetch((async (_url, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    return json(metadata);
  }) as typeof fetch, async () => {
    await fullEditCatalogMetadataV1('token-A', {
      kind: 'units', id: unitId, expectedVersion: 3, name: 'Gauge New',
    });
    await fullEditCatalogMetadataV1('token-A', {
      kind: 'units', id: unitId, expectedVersion: 3, name: 'Gauge New', nameBn: null,
    });
    await fullEditCatalogMetadataV1('token-A', {
      kind: 'units', id: unitId, expectedVersion: 3, name: 'Gauge New', symbol: null,
    });
  });
  assert.deepEqual(bodies, [
    { expectedVersion: 3, name: 'Gauge New' },
    { expectedVersion: 3, name: 'Gauge New', nameBn: null },
    { expectedVersion: 3, name: 'Gauge New', symbol: null },
  ]);
});

test('P6d: invalid full-edit commands fail before HTTP, including forged tenant/parent/status fields', async () => {
  let requests = 0;
  await withFetch((async () => { requests++; return json(metadata); }) as typeof fetch, async () => {
    const valid = { kind: 'units', id: unitId, expectedVersion: 3, name: 'Gauge' };
    const invalid: unknown[] = [
      { ...valid, name: '' },
      { ...valid, name: '  ' },
      { ...valid, name: 3 },
      { ...valid, name: undefined },
      { ...valid, name: 'X'.repeat(121) },
      { ...valid, expectedVersion: 0 },
      { ...valid, expectedVersion: -1 },
      { ...valid, expectedVersion: 1.5 },
      { ...valid, expectedVersion: Number.MAX_SAFE_INTEGER + 1 },
      { ...valid, id: '../other-shop' },
      { ...valid, id: 'bad' },
      { ...valid, kind: 'suppliers' },
      { ...valid, tenantId: 'other' },
      { ...valid, userId: 'other' },
      { ...valid, parentId: categoryId },
      { ...valid, status: 'inactive' },
      { ...valid, active: false },
      { ...valid, unitKind: 'Compound' },
      { ...valid, nameBn: '' },
      { ...valid, nameBn: '  ' },
      { ...valid, nameBn: 'a'.repeat(121) },
      { ...valid, nameBn: undefined },
      { ...valid, symbol: '' },
      { ...valid, symbol: 'e g' },
      { ...valid, symbol: 'ABCDE' },
      { ...valid, symbol: undefined },
      { ...valid, symbol: 3 },
      { ...valid, unexpected: 'ignored?' },
      { ...valid, name: '\u0000' },
      { kind: 'brands', id: brandId, expectedVersion: 1, name: 'Acme', symbol: 'X' },
      { kind: 'categories', id: categoryId, expectedVersion: 1, name: 'Parts', symbol: null },
    ];
    for (const bad of invalid) {
      await assert.rejects(fullEditCatalogMetadataV1('token-A', bad as any), isProtocol);
    }
  });
  assert.equal(requests, 0);
});

test('P6d: strict decoder refuses missing version, surprising metadata, legacy or malformed response', async () => {
  for (const invalid of [
    { ...metadata, data: { ...metadata.data, units: [{ ...metadata.data.units[0], version: 0 }] } },
    { ...metadata, data: { ...metadata.data, brands: [{ ...metadata.data.brands[0], symbol: 'X' }] } },
    { data: { units: [], brands: [], categories: [], features: {} } },
    { ...metadata, unrecognized: 'fixture' },
    { data: { units: [], brands: [], categories: [], features: { ...features, vendors: 'yes' } } },
  ]) {
    let requests = 0;
    await withFetch((async () => { requests++; return json(invalid); }) as typeof fetch, async () => {
      await assert.rejects(fullEditCatalogMetadataV1('token-A', {
        kind: 'units', id: unitId, expectedVersion: 3, name: 'Gauge',
      }), isProtocol);
    });
    assert.equal(requests, 1);
  }
});

test('P6d: 401/403/404/409/500 errors propagate exactly once; no optimistic success', async () => {
  for (const status of [401, 403, 404, 409, 500, 503]) {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: {
        code: status === 409 ? 'CONFLICT_STALE_VERSION' : 'REFUSED',
        message: 'Refused', details: {}, traceId: 'safe-trace',
      } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(fullEditCatalogMetadataV1('token-A', {
        kind: 'brands', id: brandId, expectedVersion: 1, name: 'Acme',
      }), (error: unknown) => error instanceof ApiError && error.kind === 'http'
          && error.status === status && error.code === (status === 409 ? 'CONFLICT_STALE_VERSION' : 'REFUSED'));
    });
    assert.equal(calls, 1);
  }
});

test('P6d: lost response is network failure, never retried or considered a successful save', async () => {
  let calls = 0;
  await withFetch((async () => {
    calls++;
    throw new Error('connection lost after server may have committed');
  }) as typeof fetch, async () => {
    await assert.rejects(fullEditCatalogMetadataV1('token-A', {
      kind: 'categories', id: categoryId, expectedVersion: 8, name: 'Electrical',
    }), (error: unknown) => error instanceof ApiError && error.kind === 'network');
  });
  assert.equal(calls, 1);
});

test('P6d: external AbortSignal and timeout are fail-closed with no auto retry', async () => {
  let calls = 0;
  await withFetch((async (_url, init) => {
    calls++;
    return new Promise<Response>((_resolve, reject) => {
      if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
      init?.signal?.addEventListener('abort', () =>
        reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
  }) as typeof fetch, async () => {
    await assert.rejects(fullEditCatalogMetadataV1('token-A', {
      kind: 'units', id: unitId, expectedVersion: 3, name: 'Gauge',
    }, undefined, 5), (error: unknown) => error instanceof ApiError && error.kind === 'network');
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(fullEditCatalogMetadataV1('token-A', {
      kind: 'units', id: unitId, expectedVersion: 3, name: 'Gauge',
    }, controller.signal), (error: unknown) => error instanceof ApiError && error.kind === 'network');
    await assert.rejects(fullEditCatalogMetadataV1('token-A', {
      kind: 'units', id: unitId, expectedVersion: 3, name: 'Gauge',
    }, undefined, 0), isProtocol);
  });
  assert.equal(calls, 2);
});

test('P6d: opt-in full edit never changes the existing metadata-only PATCH route', async () => {
  const paths: string[] = [];
  await withFetch((async (url, init) => {
    paths.push(new URL(String(url)).pathname);
    return json(metadata);
  }) as typeof fetch, async () => {
    await patchCatalogMetadataV1('token-A', {
      kind: 'units', id: unitId, expectedVersion: 3, symbol: 'A',
    });
    await fullEditCatalogMetadataV1('token-A', {
      kind: 'units', id: unitId, expectedVersion: 3, name: 'Gauge New',
    });
  });
  assert.deepEqual(paths, [
    '/api/v1/catalog/metadata-v1/units/' + unitId,
    '/api/v1/catalog/metadata-v1/units/' + unitId + '/full-edit',
  ]);
});
