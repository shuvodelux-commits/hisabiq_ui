import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { updateSimpleProduct } from '../src/integration/product-update.ts';

const origin = 'https://hisabiq.test';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const otherUnitId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';

const input = {
  name: 'Copper wire', baseUnitId: unitId,
  purchasePriceMinor: 800, sellingPriceMinor: 1050, minStockQty: 5000,
  brandId: null, categoryId: null, sku: 'WIRE-100', barcode: null, description: null,
  defaultDiscountType: null, defaultDiscountValue: null,
  offerEnabled: false, offerPriceMinor: null,
  offerStartDate: null, offerEndDate: null, tracksExpiry: false, tracksSerial: false,
  conversionUnitId: null, conversionFactorQty: null,
  usualSupplierId: null, minOrderQty: null,
  warrantyMonths: null, supplierWarrantyMonths: null,
  version: 3,
} as const;

const product = {
  id: productId,
  name: 'Copper wire', displayName: 'Copper wire',
  brandId: null, brandName: null, categoryId: null, categoryName: null,
  parentCategoryName: null, sku: 'WIRE-100', barcode: null, description: null,
  baseUnitId: unitId, baseUnitName: 'Feet', sellingPriceMinor: 1050, minStockQty: 5000,
  status: 'ACTIVE', defaultDiscountType: null, defaultDiscountValue: null,
  offerEnabled: false, offerPriceMinor: null, offerStartDate: null,
  offerEndDate: null, offerLive: false,
  hasImage: false, tracksExpiry: false, tracksSerial: false,
  conversion: null, stockQty: 0, stockStatus: 'ZERO_STOCK',
  hasStockHistory: false, usualSupplierId: null, usualSupplierName: null,
  minOrderQty: null, warrantyMonths: null, supplierWarrantyMonths: null,
  version: 4,
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, work: () => Promise<void>): Promise<void> {
  const oldFetch = globalThis.fetch;
  const oldWindow = (globalThis as any).window;
  const oldLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await work(); } finally {
    (globalThis as any).fetch = oldFetch;
    if (oldWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = oldWindow;
    if (oldLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = oldLocation;
  }
}

test('PATCH sends EXACT 25-field full legacy body and original optimistic version', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/products/' + productId);
    assert.equal(init?.method, 'PATCH');
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer verified-editor');
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), null);
    const body = JSON.parse(String(init?.body));
    assert.deepEqual(body, input);
    assert.equal(Object.keys(body).length, 25);
    return json({ data: product });
  }) as typeof fetch, async () => {
    const response = await updateSimpleProduct('verified-editor', productId, input);
    assert.equal(response.data.id, productId);
    assert.equal(response.data.version, 4);
    assert.equal(Object.hasOwn(response.data, 'purchasePriceMinor'), false);
    assert.equal(Object.hasOwn(response.data, 'stockValueMinor'), false);
  });
  assert.equal(calls, 1);
});

test('authorized cost response is accepted exactly; update does not round minor units', async () => {
  await withFetch((async (_url, init) => {
    assert.equal(JSON.parse(String(init?.body)).purchasePriceMinor, 801);
    return json({ data: { ...product, purchasePriceMinor: 801, stockValueMinor: 16000 } });
  }) as typeof fetch, async () => {
    const result = await updateSimpleProduct('cost-authorized', productId, {
      ...input, purchasePriceMinor: 801,
    });
    assert.equal(result.data.purchasePriceMinor, 801);
    assert.equal(result.data.stockValueMinor, 16000);
  });
});

test('legacy one-alternative conversion is transmitted unchanged; no client price scaling', async () => {
  const command = { ...input, conversionUnitId: otherUnitId, conversionFactorQty: 20_000 };
  await withFetch((async (_url, init) => {
    assert.deepEqual(JSON.parse(String(init?.body)), command);
    return json({ data: product });
  }) as typeof fetch, async () => {
    await updateSimpleProduct('editor', productId, command);
  });
});

test('rejects every advanced ProductDraft or server-controlled property, not drop extra keys', async () => {
  const advanced: unknown[] = [
    { nameBn: 'তামার তার' }, { kind: 'Service' },
    { unitLevels: [{ unit: 'Coil', factor: '20', price: '400' }] },
    { openingQty: '10' }, { openingSerialText: 'S123' },
    { serialTracking: 'Required' }, { warrantyDurationUnit: 'days' },
    { photos: ['preview'] }, { offers: [{ price: '20' }] },
    { id: productId }, { stockQty: 1000 }, { status: 'ACTIVE' },
    { purchaseUnitPrices: [] }, { versionId: 'old' },
  ];
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const rich of advanced) {
        await assert.rejects(
          updateSimpleProduct('editor', productId, { ...input, ...rich } as any),
          (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
      }
    });
  assert.equal(calls, 0);
});

test('rejects ANY missing simple field or version before sending a request', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const key of Object.keys(input)) {
        const missing: any = { ...input };
        delete missing[key];
        await assert.rejects(updateSimpleProduct('editor', productId, missing),
          (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
      }
    });
  assert.equal(calls, 0);
});

test('rejects stale/invalid optimistic version types; never synthesize a new version', async () => {
  const versions = [0, -1, -50, 0.1, 2.5, '3', null, undefined, false, NaN, Infinity,
    Number.MAX_SAFE_INTEGER + 1];
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const version of versions) {
        await assert.rejects(
          updateSimpleProduct('editor', productId, { ...input, version } as any),
          (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
      }
      await assert.rejects(updateSimpleProduct('editor', productId, null as any), ApiError);
      await assert.rejects(updateSimpleProduct('editor', productId, [] as any), ApiError);
    });
  assert.equal(calls, 0);
});

test('rejects path traversal, foreign IDs and unsupported timeout values locally', async () => {
  const ids = ['', 'not-ulid', '../wrong', productId + '/barcode'];
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const id of ids) await assert.rejects(
        updateSimpleProduct('editor', id, input),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
      for (const timeout of [0, -1, 1.5, 120001, Infinity]) await assert.rejects(
        updateSimpleProduct('editor', productId, input, undefined, timeout),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  assert.equal(calls, 0);
});

test('rejects invalid amounts, conversion, master ID, warranty, discount and date without rounding', async () => {
  const invalids = [
    { purchasePriceMinor: 0.5 }, { purchasePriceMinor: -1 },
    { sellingPriceMinor: Number.MAX_SAFE_INTEGER + 1 },
    { sellingPriceMinor: '1000' }, { minStockQty: 0.001 },
    { categoryId: 'wrong' }, { brandId: '' }, { baseUnitId: 'bad' },
    { conversionUnitId: otherUnitId }, { conversionFactorQty: 20_000 },
    { conversionUnitId: unitId, conversionFactorQty: 20_000 },
    { warrantyMonths: 601 }, { minOrderQty: -1 },
    { defaultDiscountType: 'RATE' },
    { defaultDiscountType: 'PERCENTAGE', defaultDiscountValue: null },
    { offerStartDate: '2027/05/01' },
  ];
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const extra of invalids) {
        await assert.rejects(
          updateSimpleProduct('editor', productId, { ...input, ...extra } as any),
          (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
      }
    });
  assert.equal(calls, 0);
});

test('server stale version 409 and unauthorized/foreign 401/403/404/503 preserve one attempt', async () => {
  for (const status of [401, 403, 404, 409, 503]) {
    let calls = 0;
    await withFetch((async (_url, init) => {
      calls++;
      assert.equal(JSON.parse(String(init?.body)).version, 3);
      return json({ error: {
        code: status === 409 ? 'CONFLICT_STALE_VERSION' : 'REFUSED',
        message: 'Refused to update', details: {}, traceId: 'edit-trace',
      } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(
        updateSimpleProduct('editor', productId, input),
        (error: unknown) => error instanceof ApiError &&
          error.kind === 'http' && error.status === status);
    });
    assert.equal(calls, 1);
  }
});

test('malformed product success is NOT reported as a saved edit', async () => {
  const invalids = [
    { data: { ...product, purchasePriceMinor: null } },
    { data: { ...product, stockValueMinor: '100' } },
    { data: { ...product, version: null } },
    { data: { ...product, id: 'bad' } },
    { data: { ...product, notAProperty: 'extra' } },
    { ok: true, data: product },
  ];
  for (const body of invalids) {
    await withFetch((async () => json(body)) as typeof fetch, async () => {
      await assert.rejects(
        updateSimpleProduct('editor', productId, input),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  }
});

test('unknown network result never automatically repeats PATCH or reports a new version', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; throw new TypeError('response lost'); }) as typeof fetch,
    async () => {
      await assert.rejects(updateSimpleProduct('editor', productId, input),
        (error: unknown) => error instanceof ApiError && error.kind === 'network');
    });
  assert.equal(calls, 1);
});

test('timeout and caller abort are unconfirmed, with no retry', async () => {
  for (const mode of ['timeout', 'abort']) {
    let calls = 0;
    const caller = new AbortController();
    await withFetch((async (_url, init) => {
      calls++;
      return new Promise<Response>((_resolve, reject) => {
        if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
        init?.signal?.addEventListener('abort',
          () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
        if (mode === 'abort') caller.abort();
      });
    }) as typeof fetch, async () => {
      await assert.rejects(
        updateSimpleProduct('editor', productId, input,
          caller.signal, mode === 'timeout' ? 5 : 1000),
        (error: unknown) => error instanceof ApiError && error.kind === 'network');
    });
    assert.equal(calls, 1);
  }
});

test('two authorized bearer contexts never share responses or a stale optimistic version', async () => {
  const seen: string[] = [];
  await withFetch((async (_url, init) => {
    const auth = new Headers(init?.headers).get('Authorization') ?? '';
    seen.push(auth + ':v' + JSON.parse(String(init?.body)).version);
    return json({ data: { ...product, version: auth === 'Bearer editor-A' ? 4 : 10 } });
  }) as typeof fetch, async () => {
    const first = await updateSimpleProduct('editor-A', productId, input);
    const second = await updateSimpleProduct('editor-B', productId, { ...input, version: 9 });
    assert.equal(first.data.version, 4);
    assert.equal(second.data.version, 10);
  });
  assert.deepEqual(seen, ['Bearer editor-A:v3', 'Bearer editor-B:v9']);
});
