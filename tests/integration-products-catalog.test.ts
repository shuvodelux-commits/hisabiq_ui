import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { readCatalog } from '../src/integration/catalog.ts';
import { readProduct, readProducts } from '../src/integration/products.ts';

const origin = 'https://hisabiq.test';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const otherProductId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';

const product = {
  id: productId,
  name: 'Electric wire',
  displayName: 'Electric wire',
  brandId: null,
  brandName: null,
  categoryId: null,
  categoryName: null,
  parentCategoryName: null,
  sku: 'WIRE-100',
  barcode: null,
  description: null,
  baseUnitId: unitId,
  baseUnitName: 'Feet',
  sellingPriceMinor: 1250,
  minStockQty: 1000,
  status: 'ACTIVE',
  defaultDiscountType: null,
  defaultDiscountValue: null,
  offerEnabled: false,
  offerPriceMinor: null,
  offerStartDate: null,
  offerEndDate: null,
  offerLive: false,
  hasImage: false,
  tracksExpiry: false,
  tracksSerial: false,
  conversion: null,
  stockQty: 25000,
  stockStatus: 'IN_STOCK',
  hasStockHistory: true,
  usualSupplierId: null,
  usualSupplierName: null,
  minOrderQty: null,
  warrantyMonths: null,
  supplierWarrantyMonths: null,
  version: 3,
};
const productList = {
  data: [product],
  page: { nextCursor: null, hasMore: false },
  summary: { total: 1, active: 1, inactive: 0, withoutBarcode: 1 },
};
const catalogue = {
  data: {
    units: [{ id: unitId, name: 'Feet' }],
    brands: [{ id: otherProductId, name: 'Generic' }],
    categories: [{ id: productId, name: 'Electrical', parentId: null }],
    features: {
      productOffers: true,
      expiryTracking: true,
      serialTracking: false,
      warranty: true,
      customerGroups: false,
      vendors: true,
    },
  },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

async function withFetch(fake: typeof fetch, run: () => Promise<void>): Promise<void> {
  const oldFetch = globalThis.fetch;
  const oldWindow = (globalThis as any).window;
  const oldLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try {
    await run();
  } finally {
    (globalThis as any).fetch = oldFetch;
    if (oldWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = oldWindow;
    if (oldLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = oldLocation;
  }
}

test('catalog GET reads the canonical envelope and real IDs/feature gates without a mutation', async () => {
  let requests = 0;
  await withFetch((async (url, init) => {
    requests++;
    assert.equal(String(url), origin + '/api/v1/catalog');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer verified-A');
    return json(catalogue);
  }) as typeof fetch, async () => {
    const result = await readCatalog('verified-A');
    assert.deepEqual(result, catalogue);
    assert.equal(result.data.units[0]?.id, unitId);
    assert.equal(result.data.features.serialTracking, false);
  });
  assert.equal(requests, 1);
});

test('product list GET preserves server keyset pagination, order/filter semantics and summary', async () => {
  let requests = 0;
  await withFetch((async (url, init) => {
    requests++;
    const value = new URL(String(url));
    assert.equal(value.pathname, '/api/v1/products');
    assert.equal(value.searchParams.get('search'), 'wire');
    assert.equal(value.searchParams.get('sort'), 'name');
    assert.equal(value.searchParams.get('direction'), 'ASC');
    assert.equal(value.searchParams.get('limit'), '25');
    assert.equal(value.searchParams.get('categoryId'), productId);
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer token-A');
    return json({ ...productList, page: { nextCursor: otherProductId, hasMore: true } });
  }) as typeof fetch, async () => {
    const result = await readProducts('token-A', {
      search: 'wire', sort: 'name', direction: 'ASC', limit: 25, categoryId: productId,
    });
    assert.equal(result.page.nextCursor, otherProductId);
    assert.equal(result.page.hasMore, true);
    assert.equal(result.summary.total, 1);
    assert.equal(result.data[0]?.sellingPriceMinor, 1250);
  });
  assert.equal(requests, 1);
});

test('product detail GET preserves version and optional cost field absence', async () => {
  await withFetch((async (url, init) => {
    assert.equal(String(url), origin + '/api/v1/products/' + productId);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer without-cost');
    return json({ data: product });
  }) as typeof fetch, async () => {
    const response = await readProduct('without-cost', productId);
    assert.equal(response.data.version, 3);
    assert.equal(Object.hasOwn(response.data, 'purchasePriceMinor'), false);
    assert.equal(Object.hasOwn(response.data, 'stockValueMinor'), false);
  });
});

test('authorized cost fields are retained exactly; never invented or converted to zero', async () => {
  const authorized = { ...product, purchasePriceMinor: 620, stockValueMinor: 15500 };
  await withFetch((async () => json({ ...productList, data: [authorized] })) as typeof fetch, async () => {
    const response = await readProducts('cost-viewer');
    assert.equal(response.data[0]?.purchasePriceMinor, 620);
    assert.equal(response.data[0]?.stockValueMinor, 15500);
  });
});

test('two verified bearer contexts never receive cached data or price fields from another tenant', async () => {
  const tokens: string[] = [];
  await withFetch((async (_url, init) => {
    const token = new Headers(init?.headers).get('Authorization') ?? '';
    tokens.push(token);
    return json(token === 'Bearer tenant-A'
      ? { ...productList, data: [{ ...product, purchasePriceMinor: 620, stockValueMinor: 15500 }] }
      : { ...productList, data: [{ ...product, id: otherProductId }] });
  }) as typeof fetch, async () => {
    const a = await readProducts('tenant-A');
    const b = await readProducts('tenant-B');
    assert.equal(a.data[0]?.id, productId);
    assert.equal(a.data[0]?.purchasePriceMinor, 620);
    assert.equal(b.data[0]?.id, otherProductId);
    assert.equal(Object.hasOwn(b.data[0]!, 'purchasePriceMinor'), false);
  });
  assert.deepEqual(tokens, ['Bearer tenant-A', 'Bearer tenant-B']);
});

for (const status of [401, 403, 404, 503]) {
  test('HTTP ' + status + ' fails closed on product/catalog GET without retry or preview fallback', async () => {
    let requests = 0;
    await withFetch((async () => {
      requests++;
      return json({ error: {
        code: 'REFUSED', message: 'Request denied', details: {}, traceId: 'test-request',
      } }, status);
    }) as typeof fetch, async () => {
      for (const action of [
        () => readCatalog('token-A'),
        () => readProduct('token-A', productId),
        () => readProducts('token-A'),
      ]) {
        await assert.rejects(action(), (error: unknown) => {
          assert.ok(error instanceof ApiError);
          assert.equal(error.kind, 'http');
          assert.equal(error.status, status);
          return true;
        });
      }
    });
    assert.equal(requests, 3);
  });
}

test('malformed nested records, extra fields, missing summary and unsafe costs fail closed', async () => {
  const invalid = [
    { ...productList, data: [{ ...product, purchasePriceMinor: null }] },
    { ...productList, data: [{ ...product, stockQty: 1.2 }] },
    { ...productList, data: [{ ...product, status: 'ARCHIVED' }] },
    { ...productList, data: [{ ...product, unexpected: 'ignored?' }] },
    { ...productList, summary: undefined },
    { ...productList, page: { hasMore: true, nextCursor: 'invalid' } },
    { ...catalogue, data: { ...catalogue.data, features: { ...catalogue.data.features, warranty: 'true' } } },
    { ...catalogue, data: { ...catalogue.data, units: [{ id: unitId, name: 'Feet', price: 1 }] } },
  ];
  for (let index = 0; index < invalid.length; index++) {
    await withFetch((async () => json(invalid[index])) as typeof fetch, async () => {
      await assert.rejects(index < 6 ? readProducts('token-A') : readCatalog('token-A'),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  }
});

test('unapproved filters and foreign/invalid product IDs fail before transport', async () => {
  let requests = 0;
  await withFetch((async () => { requests++; return json(productList); }) as typeof fetch, async () => {
    await assert.rejects(readProduct('token-A', '../foreign'), ApiError);
    await assert.rejects(readProducts('token-A', { limit: 0 }), ApiError);
    await assert.rejects(readProducts('token-A', { sort: 'stockQty' as any }), ApiError);
    assert.equal(requests, 0);
  });
});

test('abort, bounded timeout and offline error propagate with zero retries', async () => {
  for (const action of [
    (signal?: AbortSignal, timeoutMs?: number) => readCatalog('token-A', signal, timeoutMs),
    (signal?: AbortSignal, timeoutMs?: number) => readProducts('token-A', {}, signal, timeoutMs),
    (signal?: AbortSignal, timeoutMs?: number) => readProduct('token-A', productId, signal, timeoutMs),
  ]) {
    let calls = 0;
    await withFetch((async (_url, init) => {
      calls++;
      return new Promise<Response>((_resolve, reject) => {
        if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      });
    }) as typeof fetch, async () => {
      await assert.rejects(action(undefined, 5), (error: unknown) =>
        error instanceof ApiError && error.kind === 'network');
    });
    assert.equal(calls, 1);
  }
});
