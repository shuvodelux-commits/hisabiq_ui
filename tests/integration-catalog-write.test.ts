import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  createCatalogName, renameCatalogName, removeCatalogEntry,
} from '../src/integration/catalog.ts';

const origin = 'https://hisabiq.test';
const categoryId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const parentId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const brandId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const catalog = {
  data: {
    units: [{ id: unitId, name: 'Feet' }],
    brands: [{ id: brandId, name: 'RFL' }],
    categories: [{ id: categoryId, name: 'Electrical', parentId }],
    features: {
      productOffers: true, expiryTracking: true, serialTracking: true,
      warranty: true, customerGroups: false, vendors: false,
    },
  },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}

async function withFetch(fake: typeof fetch, task: () => Promise<void>): Promise<void> {
  const previousFetch = globalThis.fetch;
  const previousWindow = (globalThis as any).window;
  const previousLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await task(); } finally {
    (globalThis as any).fetch = previousFetch;
    if (previousWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = previousWindow;
    if (previousLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = previousLocation;
  }
}

test('name-only Unit and Brand creates use exact auth POST and full catalog envelope', async () => {
  const expected = [
    { path: '/api/v1/catalog/units', body: { name: 'Gauge' } },
    { path: '/api/v1/catalog/brands', body: { name: 'RFL' } },
  ];
  let calls = 0;
  await withFetch((async (url, options) => {
    const next = expected[calls++]!;
    assert.equal(String(url), origin + next.path);
    assert.equal(options?.method, 'POST');
    assert.equal(options?.redirect, 'error');
    assert.equal(options?.credentials, 'omit');
    assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer tenant-A');
    assert.equal(new Headers(options?.headers).get('Idempotency-Key'), null);
    assert.deepEqual(JSON.parse(String(options?.body)), next.body);
    return json(catalog);
  }) as typeof fetch, async () => {
    assert.deepEqual(await createCatalogName('tenant-A', { kind: 'units', name: '  Gauge  ' }), catalog);
    assert.deepEqual(await createCatalogName('tenant-A', { kind: 'brands', name: 'RFL' }), catalog);
  });
  assert.equal(calls, 2);
});

test('category create preserves explicit nullable parent, never guesses level or moves existing category', async () => {
  const bodies = [
    { name: 'Electrical', parentId: null },
    { name: 'Plumbing', parentId },
  ];
  let calls = 0;
  await withFetch((async (url, options) => {
    assert.equal(String(url), origin + '/api/v1/catalog/categories');
    assert.equal(options?.method, 'POST');
    assert.deepEqual(JSON.parse(String(options?.body)), bodies[calls++]);
    return json(catalog);
  }) as typeof fetch, async () => {
    await createCatalogName('tenant-A', { kind: 'categories', name: 'Electrical', parentId: null });
    await createCatalogName('tenant-A', { kind: 'categories', name: 'Plumbing', parentId });
  });
  assert.equal(calls, 2);
});

test('all three renames use stable ULID, PATCH {name} only and return new whole catalog', async () => {
  const commands = [
    { kind: 'units' as const, id: unitId, name: 'Gauge' },
    { kind: 'brands' as const, id: brandId, name: 'RFL Industries' },
    { kind: 'categories' as const, id: categoryId, name: 'Electrical Goods' },
  ];
  let calls = 0;
  await withFetch((async (url, options) => {
    const command = commands[calls++]!;
    assert.equal(String(url), origin + '/api/v1/catalog/' + command.kind + '/' + command.id);
    assert.equal(options?.method, 'PATCH');
    assert.deepEqual(JSON.parse(String(options?.body)), { name: command.name });
    return json(catalog);
  }) as typeof fetch, async () => {
    for (const command of commands) assert.deepEqual(await renameCatalogName('tenant-A', command), catalog);
  });
  assert.equal(calls, commands.length);
});

test('remove issues an explicit POST action and validates DELETED versus ARCHIVED', async () => {
  let calls = 0;
  const commands = [
    { kind: 'units' as const, id: unitId },
    { kind: 'brands' as const, id: brandId },
    { kind: 'categories' as const, id: categoryId },
  ];
  await withFetch((async (url, options) => {
    const command = commands[calls]!;
    assert.equal(String(url), origin + '/api/v1/catalog/' + command.kind + '/' + command.id + '/remove');
    assert.equal(options?.method, 'POST');
    assert.equal(options?.body, undefined);
    calls++;
    return json({ data: { outcome: calls === 2 ? 'ARCHIVED' : 'DELETED' } });
  }) as typeof fetch, async () => {
    assert.deepEqual(await removeCatalogEntry('tenant-A', commands[0]!), { data: { outcome: 'DELETED' } });
    assert.deepEqual(await removeCatalogEntry('tenant-A', commands[1]!), { data: { outcome: 'ARCHIVED' } });
    assert.deepEqual(await removeCatalogEntry('tenant-A', commands[2]!), { data: { outcome: 'DELETED' } });
  });
  assert.equal(calls, 3);
});

test('validation refuses rich Bengali/symbol/active commands rather than silently losing fields', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(catalog); }) as typeof fetch, async () => {
    const invalid = [
      () => createCatalogName('tenant-A', { kind: 'units', name: 'Gauge', nameBn: 'গেজ' } as any),
      () => createCatalogName('tenant-A', { kind: 'units', name: 'Gauge', symbol: 'Gg' } as any),
      () => createCatalogName('tenant-A', { kind: 'brands', name: 'RFL', active: true } as any),
      () => createCatalogName('tenant-A', { kind: 'categories', name: 'Electrical' } as any),
      () => createCatalogName('tenant-A', { kind: 'units', name: '' }),
      () => createCatalogName('tenant-A', { kind: 'units', name: 'x'.repeat(121) }),
      () => createCatalogName('tenant-A', { kind: 'units', name: 'Gauge', parentId: null } as any),
      () => createCatalogName('tenant-A', { kind: 'categories', name: 'Test', parentId: 'not-an-id' }),
      () => renameCatalogName('tenant-A', { kind: 'categories', id: categoryId, name: 'New', parentId } as any),
      () => renameCatalogName('tenant-A', { kind: 'units', id: 'bad/../id', name: 'New' }),
      () => removeCatalogEntry('tenant-A', { kind: 'categories', id: 'bad?x=y' }),
    ];
    for (const action of invalid) {
      await assert.rejects(action(), (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    }
  });
  assert.equal(calls, 0);
});

test('duplicate name/permission/foreign tenant errors propagate without automatic retry', async () => {
  for (const status of [400, 401, 403, 404, 409, 503]) {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: {
        code: status === 409 ? 'ALREADY_EXISTS' : 'REFUSED',
        message: 'Catalog change denied', details: {}, traceId: 'trace-catalog',
      } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(createCatalogName('tenant-A', { kind: 'units', name: 'Feet' }),
        (error: unknown) => error instanceof ApiError && error.kind === 'http' && error.status === status);
      await assert.rejects(renameCatalogName('tenant-A', { kind: 'units', id: unitId, name: 'Feet' }),
        (error: unknown) => error instanceof ApiError && error.kind === 'http' && error.status === status);
      await assert.rejects(removeCatalogEntry('tenant-A', { kind: 'units', id: unitId }),
        (error: unknown) => error instanceof ApiError && error.kind === 'http' && error.status === status);
    });
    assert.equal(calls, 3);
  }
});

test('unsupported/malformed success envelopes fail closed, never claim a saved catalog', async () => {
  const bad = [
    null,
    {},
    { data: { ...catalog.data, units: [{ name: 'no id' }] } },
    { data: { ...catalog.data, features: { ...catalog.data.features, warranty: 'yes' } } },
    { data: { outcome: 'REMOVED' } },
    { data: { outcome: 'ARCHIVED', version: 1 } },
    { data: { outcome: null } },
  ];
  for (let i = 0; i < bad.length; i++) {
    await withFetch((async () => json(bad[i])) as typeof fetch, async () => {
      const action = i < 4
        ? createCatalogName('token', { kind: 'brands', name: 'RFL' })
        : removeCatalogEntry('token', { kind: 'brands', id: brandId });
      await assert.rejects(action, (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  }
});

test('network ambiguity, cancellation and timeout do not retry a catalog POST', async () => {
  for (const mode of ['network', 'abort', 'timeout']) {
    let calls = 0;
    const controller = new AbortController();
    await withFetch((async (_url, options) => {
      calls++;
      if (mode === 'network') throw new TypeError('Unknown commit outcome');
      return await new Promise<Response>((_resolve, reject) => {
        if (options?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
        options?.signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')), { once: true });
        if (mode === 'abort') controller.abort();
      });
    }) as typeof fetch, async () => {
      await assert.rejects(createCatalogName('token-A', { kind: 'units', name: 'New' },
        controller.signal, mode === 'timeout' ? 5 : 5000),
      (error: unknown) => error instanceof ApiError && error.kind === 'network');
    });
    assert.equal(calls, 1);
  }
});

test('separate tenant bearer credentials and different server IDs are never cached or inferred', async () => {
  const seen: string[] = [];
  const b = { data: { ...catalog.data, units: [{ id: parentId, name: 'Feet' }] } };
  await withFetch((async (_url, options) => {
    const token = new Headers(options?.headers).get('Authorization') ?? '';
    seen.push(token);
    return json(token === 'Bearer token-A' ? catalog : b);
  }) as typeof fetch, async () => {
    const aResponse = await createCatalogName('token-A', { kind: 'units', name: 'Feet' });
    const bResponse = await createCatalogName('token-B', { kind: 'units', name: 'Feet' });
    assert.equal(aResponse.data.units[0]?.id, unitId);
    assert.equal(bResponse.data.units[0]?.id, parentId);
  });
  assert.deepEqual(seen, ['Bearer token-A','Bearer token-B']);
});
