import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '../src/integration/errors.ts';
import {
  decodeCatalogLifecycleV1,
  readCatalogLifecycleV1Units,
  readCatalogLifecycleV1Brands,
  readCatalogLifecycleV1Categories,
} from '../src/integration/catalog-lifecycle-v1.ts';

const origin = 'https://hisabiq.example';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const brandId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const rootId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const childId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const kinds = ['unit', 'brand', 'category'] as const;
type Kind = typeof kinds[number];

const row = {
  unit: { id: unitId, name: 'Feet', nameBn: 'ফুট', symbol: 'ft', version: 1,
    state: 'ACTIVE', archivedAt: null },
  brand: { id: brandId, name: 'Test Brand', nameBn: null, version: 2,
    state: 'INACTIVE', archivedAt: null },
  category: { id: rootId, name: 'Electrical', nameBn: 'ইলেকট্রিক', parentId: null,
    version: 3, state: 'ARCHIVED', archivedAt: '2026-11-17T06:30:00.000Z' },
};
const endpoint = {
  unit: '/api/v1/catalog/lifecycle-v1/units',
  brand: '/api/v1/catalog/lifecycle-v1/brands',
  category: '/api/v1/catalog/lifecycle-v1/categories',
} as const;
const read = {
  unit: readCatalogLifecycleV1Units,
  brand: readCatalogLifecycleV1Brands,
  category: readCatalogLifecycleV1Categories,
};

function sample(kind: Kind): any {
  return { data: { kind, entries: [structuredClone(row[kind])] } };
}
function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}
function protocol(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'protocol';
}
async function withFetch(fake: typeof fetch, task: () => Promise<void>): Promise<void> {
  const oldFetch = globalThis.fetch;
  const oldWindow = (globalThis as any).window;
  const oldLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await task(); }
  finally {
    globalThis.fetch = oldFetch;
    if (oldWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = oldWindow;
    if (oldLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = oldLocation;
  }
}

test('P8c-T0: all three roster decoders preserve server states, bilingual fields, hierarchy, ID and version', () => {
  for (const kind of kinds) assert.deepEqual(decodeCatalogLifecycleV1(sample(kind), kind), sample(kind));
  const child = sample('category');
  child.data.entries.push({
    id: childId, name: 'Switch', nameBn: null, parentId: rootId, version: 1,
    state: 'ACTIVE', archivedAt: null,
  });
  assert.deepEqual(decodeCatalogLifecycleV1(child, 'category'), child);
  const empty = { data: { kind: 'unit', entries: [] } };
  assert.deepEqual(decodeCatalogLifecycleV1(empty, 'unit'), empty);
});

test('P8c-T0: kind-specific GET has bearer only, exact path, no body, redirects, cookies, retries or idempotency', async () => {
  for (const kind of kinds) {
    let calls = 0;
    await withFetch((async (url, init) => {
      calls++;
      assert.equal(String(url), origin + endpoint[kind]);
      assert.equal(init?.method, 'GET');
      assert.equal(init?.body, undefined);
      assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer signed-session-token');
      assert.equal(new Headers(init?.headers).get('Idempotency-Key'), null);
      assert.equal(init?.credentials, 'omit');
      assert.equal(init?.redirect, 'error');
      return response(sample(kind));
    }) as typeof fetch, async () => {
      assert.deepEqual(await read[kind]('signed-session-token'), sample(kind));
    });
    assert.equal(calls, 1);
  }
});

test('P8c-T0: all three kinds reject cross-kind data, wrong envelope, missing/extra fields and invalid versions', () => {
  for (const kind of kinds) {
    const other = kinds.find(x => x !== kind)!;
    const cases: unknown[] = [
      null, [], {}, { data: null }, { data: {} },
      { ...sample(kind), injected: true },
      { data: { ...sample(kind).data, injected: true } },
      { data: { ...sample(kind).data, kind: other } },
      { data: { ...sample(kind).data, entries: {} } },
    ];
    const rowIssues: Record<string, unknown>[] = [
      { id: 'not-ulid' }, { id: '' }, { id: 1 },
      { name: '' }, { name: 5 }, { nameBn: 8 },
      { version: 0 }, { version: -1 }, { version: 1.5 },
      { version: Number.MAX_SAFE_INTEGER + 1 }, { version: '2' },
      { state: 'REMOVED' }, { state: 'PAUSED' },
      { archivedAt: 'not-time' },
    ];
    for (const issue of rowIssues) {
      const bad = sample(kind);
      bad.data.entries[0] = { ...bad.data.entries[0], ...issue };
      cases.push(bad);
    }
    const added = sample(kind);
    added.data.entries[0].unexpected = 'value';
    cases.push(added);
    const deleted = sample(kind);
    delete deleted.data.entries[0].nameBn;
    cases.push(deleted);
    for (const bad of cases) assert.throws(() => decodeCatalogLifecycleV1(bad, kind), protocol);
  }
});

test('P8c-T0: no invented archived status or timestamp, reject malformed ISO dates, duplicated rows', () => {
  for (const kind of kinds) {
    for (const issue of [
      { state: 'ARCHIVED', archivedAt: null },
      { state: 'INACTIVE', archivedAt: '2026-11-17T06:30:00.000Z' },
      { state: 'ACTIVE', archivedAt: '2026-11-17T06:30:00.000Z' },
      { state: 'ARCHIVED', archivedAt: '2026-02-30T06:30:00.000Z' },
      { state: 'ARCHIVED', archivedAt: '2026-11-17T06:30:00' },
      { state: 'ARCHIVED', archivedAt: '2026-11-17T25:30:00Z' },
    ]) {
      const bad = sample(kind);
      bad.data.entries[0] = { ...bad.data.entries[0], ...issue };
      assert.throws(() => decodeCatalogLifecycleV1(bad, kind), protocol);
    }
    const dup = sample(kind);
    dup.data.entries.push(structuredClone(dup.data.entries[0]));
    assert.throws(() => decodeCatalogLifecycleV1(dup, kind), protocol);
  }
});

test('P8c-T0: optional fields are strict nullable, not missing, false or a fake string', () => {
  const invalids: [Kind, string, unknown][] = [
    ['unit', 'symbol', false], ['unit', 'symbol', undefined],
    ['category', 'parentId', undefined], ['category', 'parentId', 'bad-id'],
    ['category', 'parentId', 123], ['brand', 'nameBn', undefined],
  ];
  for (const [kind, field, value] of invalids) {
    const bad = sample(kind);
    bad.data.entries[0][field] = value;
    assert.throws(() => decodeCatalogLifecycleV1(bad, kind), protocol);
  }
});

test('P8c-T0: HTTP 401/403/404/409/503 stay explicit failures, never success-shaped empty rosters', async () => {
  for (const kind of kinds) for (const status of [401, 403, 404, 409, 503]) {
    let count = 0;
    await withFetch((async () => {
      count++;
      return response({ error: { code: 'DENIED', message: 'Not available',
        details: { reason: 'NO_ACCESS' }, traceId: 'trace-test' } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(read[kind]('token'), (e: unknown) =>
        e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
    assert.equal(count, 1);
  }
});

test('P8c-T0: invalid success JSON, HTML and 204 fail closed with no empty roster fallback', async () => {
  for (const bad of [
    new Response(null, { status: 204 }),
    new Response('<p>ok</p>', { headers: { 'content-type': 'text/html' } }),
    new Response('{invalid', { headers: { 'content-type': 'application/json' } }),
  ]) {
    let count = 0;
    await withFetch((async () => { count++; return bad; }) as typeof fetch, async () => {
      await assert.rejects(readCatalogLifecycleV1Units('token'), protocol);
    });
    assert.equal(count, 1);
  }
});

test('P8c-T0: pre-abort, malformed token, wrong kind and invalid timeout never send a request', async () => {
  let calls = 0;
  const aborted = new AbortController();
  aborted.abort();
  await withFetch((async () => { calls++; return response(sample('unit')); }) as typeof fetch, async () => {
    await assert.rejects(readCatalogLifecycleV1Units('token', aborted.signal), (e: unknown) =>
      e instanceof ApiError && e.kind === 'network');
    for (const timeout of [-1, 0, 1.2, 120001, NaN]) {
      await assert.rejects(readCatalogLifecycleV1Units('token', undefined, timeout), protocol);
    }
    for (const token of ['', 'two words', undefined] as unknown as string[]) {
      await assert.rejects(readCatalogLifecycleV1Units(token), protocol);
    }
  });
  assert.throws(() => decodeCatalogLifecycleV1(sample('unit'), 'bogus' as Kind), protocol);
  assert.equal(calls, 0);
});

test('P8c-T0: later cancellation rejects stale responses even when fetch ignores abort', async () => {
  const aborter = new AbortController();
  await withFetch((async () => {
    aborter.abort();
    return response(sample('brand'));
  }) as typeof fetch, async () => {
    await assert.rejects(readCatalogLifecycleV1Brands('token', aborter.signal),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
  });
});

test('P8c-T0: timeout and network loss make one request only, with no legacy/mock fallback', async () => {
  let calls = 0;
  await withFetch((async (_url, init) => {
    calls++;
    return await new Promise<Response>((_resolve, reject) => {
      if (init?.signal?.aborted) return reject(new Error('aborted'));
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    });
  }) as typeof fetch, async () => {
    await assert.rejects(readCatalogLifecycleV1Categories('token', undefined, 5),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
  });
  assert.equal(calls, 1);
  calls = 0;
  await withFetch((async () => { calls++; throw new Error('connection reset'); }) as typeof fetch,
    async () => {
      await assert.rejects(readCatalogLifecycleV1Categories('token'),
        (e: unknown) => e instanceof ApiError && e.kind === 'network');
    });
  assert.equal(calls, 1);
});
