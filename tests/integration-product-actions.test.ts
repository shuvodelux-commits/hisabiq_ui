import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { setProductStatus, generateProductBarcode } from '../src/integration/products.ts';

const origin = 'https://hisabiq.test';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const product = {
  id: productId,
  name: 'Copper wire', displayName: 'Copper wire',
  brandId: null, brandName: null, categoryId: null, categoryName: null,
  parentCategoryName: null, sku: null, barcode: null, description: null,
  baseUnitId: unitId, baseUnitName: 'Feet', sellingPriceMinor: 1050,
  minStockQty: 0, status: 'ACTIVE',
  defaultDiscountType: null, defaultDiscountValue: null,
  offerEnabled: false, offerPriceMinor: null, offerStartDate: null,
  offerEndDate: null, offerLive: false,
  hasImage: false, tracksExpiry: false, tracksSerial: false,
  conversion: null, stockQty: 0, stockStatus: 'ZERO_STOCK',
  hasStockHistory: false, usualSupplierId: null, usualSupplierName: null,
  minOrderQty: null, warrantyMonths: null, supplierWarrantyMonths: null,
  version: 1,
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, action: () => Promise<void>): Promise<void> {
  const previousFetch = globalThis.fetch;
  const previousWindow = (globalThis as any).window;
  const previousLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await action(); }
  finally {
    (globalThis as any).fetch = previousFetch;
    if (previousWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = previousWindow;
    if (previousLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = previousLocation;
  }
}

test('status POST sends exact ACTIVE/INACTIVE body, bearer, no operation id, and decodes product', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/products/' + productId + '/status');
    assert.equal(init?.method, 'POST');
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer verified-owner');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    assert.deepEqual(JSON.parse(String(init?.body)), { status: calls === 1 ? 'INACTIVE' : 'ACTIVE' });
    return json({ data: { ...product, status: calls === 1 ? 'INACTIVE' : 'ACTIVE' } });
  }) as typeof fetch, async () => {
    const inactive = await setProductStatus('verified-owner', productId, 'INACTIVE');
    assert.equal(inactive.data.status, 'INACTIVE');
    assert.equal(Object.hasOwn(inactive.data, 'purchasePriceMinor'), false);
    assert.equal(Object.hasOwn(inactive.data, 'stockValueMinor'), false);
    const active = await setProductStatus('verified-owner', productId, 'ACTIVE');
    assert.equal(active.data.status, 'ACTIVE');
  });
  assert.equal(calls, 2);
});

test('generate barcode POST is bodyless and receives only exact server-generated result', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/products/' + productId + '/barcode');
    assert.equal(init?.method, 'POST');
    assert.equal(init?.body, undefined);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer verified-owner');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json({ data: { barcode: '8901234567890' } });
  }) as typeof fetch, async () => {
    const result = await generateProductBarcode('verified-owner', productId);
    assert.deepEqual(result, { data: { barcode: '8901234567890' } });
  });
  assert.equal(calls, 1);
});

test('rejects untrusted product IDs and statuses before sending a request', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: product }); }) as typeof fetch, async () => {
    await assert.rejects(setProductStatus('token', '../foreign', 'ACTIVE'), ApiError);
    await assert.rejects(setProductStatus('token', productId, 'ARCHIVED' as any), ApiError);
    await assert.rejects(setProductStatus('token', productId, 'active' as any), ApiError);
    await assert.rejects(generateProductBarcode('token', 'bad-id'), ApiError);
    await assert.rejects(generateProductBarcode('token', productId, undefined, 0), ApiError);
    assert.equal(calls, 0);
  });
});

test('malformed product and barcode envelopes fail closed without preview success', async () => {
  for (const body of [
    { data: { ...product, purchasePriceMinor: null } },
    { data: { ...product, unexpected: 1 } },
    { data: { ...product, version: '1' } },
  ]) {
    await withFetch((async () => json(body)) as typeof fetch, async () => {
      await assert.rejects(setProductStatus('token', productId, 'INACTIVE'),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  }
  for (const body of [
    { data: { barcode: 123 } },
    { data: { barcode: '123', another: true } },
    { data: { barcode: '123' }, meta: {} },
    { barcode: '123' },
  ]) {
    await withFetch((async () => json(body)) as typeof fetch, async () => {
      await assert.rejects(generateProductBarcode('token', productId),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  }
});

for (const status of [401, 403, 404, 409, 503]) {
  test('HTTP ' + status + ' fails closed on both Product actions and never retries', async () => {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: {
        code: 'REFUSED', message: 'Server refused operation',
        details: {}, traceId: 'test-trace',
      } }, status);
    }) as typeof fetch, async () => {
      for (const act of [
        () => setProductStatus('tenant-A', productId, 'ACTIVE'),
        () => generateProductBarcode('tenant-A', productId),
      ]) {
        await assert.rejects(act(), (error: unknown) => {
          assert.ok(error instanceof ApiError);
          assert.equal(error.kind, 'http');
          assert.equal(error.status, status);
          return true;
        });
      }
    });
    assert.equal(calls, 2);
  });
}

test('ambiguous network errors never trigger a blind second POST', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; throw new TypeError('offline after POST'); }) as typeof fetch,
    async () => {
      await assert.rejects(setProductStatus('tenant-A', productId, 'INACTIVE'),
        (error: unknown) => error instanceof ApiError && error.kind === 'network');
      await assert.rejects(generateProductBarcode('tenant-A', productId),
        (error: unknown) => error instanceof ApiError && error.kind === 'network');
    });
  assert.equal(calls, 2);
});

test('abort and timeout propagate without repeating side-effecting requests', async () => {
  for (const action of [
    (signal: AbortSignal) => setProductStatus('tenant-A', productId, 'INACTIVE', signal, 5),
    (signal: AbortSignal) => generateProductBarcode('tenant-A', productId, signal, 5),
  ]) {
    let calls = 0;
    await withFetch((async (_url, init) => {
      calls++;
      return new Promise<Response>((_resolve, reject) => {
        if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
        init?.signal?.addEventListener('abort',
          () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      });
    }) as typeof fetch, async () => {
      await assert.rejects(action(new AbortController().signal),
        (error: unknown) => error instanceof ApiError && error.kind === 'network');
    });
    assert.equal(calls, 1);
  }
});

test('two independent bearer contexts never share a status result or cache', async () => {
  const seen: string[] = [];
  await withFetch((async (_url, init) => {
    const authorization = new Headers(init?.headers).get('Authorization') ?? '';
    seen.push(authorization);
    return json({ data: {
      ...product,
      status: authorization === 'Bearer tenant-A' ? 'ACTIVE' : 'INACTIVE',
    } });
  }) as typeof fetch, async () => {
    const first = await setProductStatus('tenant-A', productId, 'ACTIVE');
    const second = await setProductStatus('tenant-B', productId, 'INACTIVE');
    assert.equal(first.data.status, 'ACTIVE');
    assert.equal(second.data.status, 'INACTIVE');
  });
  assert.deepEqual(seen, ['Bearer tenant-A', 'Bearer tenant-B']);
});
