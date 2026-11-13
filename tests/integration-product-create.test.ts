import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { createSimpleProduct } from '../src/integration/product-create.ts';

const origin = 'https://hisabiq.test';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const secondaryUnitId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const operationId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';

const simpleInput = {
  name: 'Copper wire',
  baseUnitId: unitId,
  purchasePriceMinor: 800,
  sellingPriceMinor: 1050,
  minStockQty: 5000,
  brandId: null, categoryId: null,
  sku: 'WIRE-100', barcode: null, description: null,
  defaultDiscountType: null, defaultDiscountValue: null,
  offerEnabled: false, offerPriceMinor: null,
  offerStartDate: null, offerEndDate: null,
  tracksExpiry: false, tracksSerial: false,
  conversionUnitId: null, conversionFactorQty: null,
  usualSupplierId: null, minOrderQty: null,
  warrantyMonths: null, supplierWarrantyMonths: null,
};

const product = {
  id: productId,
  name: 'Copper wire', displayName: 'Copper wire',
  brandId: null, brandName: null, categoryId: null, categoryName: null,
  parentCategoryName: null, sku: 'WIRE-100', barcode: null, description: null,
  baseUnitId: unitId, baseUnitName: 'Feet',
  sellingPriceMinor: 1050, minStockQty: 5000, status: 'ACTIVE',
  defaultDiscountType: null, defaultDiscountValue: null,
  offerEnabled: false, offerPriceMinor: null,
  offerStartDate: null, offerEndDate: null, offerLive: false,
  hasImage: false, tracksExpiry: false, tracksSerial: false,
  conversion: null, stockQty: 0, stockStatus: 'ZERO_STOCK',
  hasStockHistory: false, usualSupplierId: null, usualSupplierName: null,
  minOrderQty: null, warrantyMonths: null, supplierWarrantyMonths: null,
  version: 1,
};
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, run: () => Promise<void>): Promise<void> {
  const previousFetch = globalThis.fetch;
  const previousWindow = (globalThis as any).window;
  const previousLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await run(); }
  finally {
    (globalThis as any).fetch = previousFetch;
    if (previousWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = previousWindow;
    if (previousLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = previousLocation;
  }
}

test('simple create sends exact 24-field legacy body and immutable operation key', async () => {
  let requests = 0;
  await withFetch((async (url, init) => {
    requests++;
    assert.equal(String(url), origin + '/api/v1/products');
    assert.equal(init?.method, 'POST');
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer verified-tenant-A');
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), operationId);
    assert.deepEqual(JSON.parse(String(init?.body)), simpleInput);
    assert.equal(Object.keys(JSON.parse(String(init?.body))).length, 24);
    return json({ data: product });
  }) as typeof fetch, async () => {
    const result = await createSimpleProduct('verified-tenant-A', operationId, simpleInput);
    assert.equal(result.data.id, productId);
    assert.equal(result.data.version, 1);
    assert.equal(Object.hasOwn(result.data, 'purchasePriceMinor'), false);
    assert.equal(Object.hasOwn(result.data, 'stockValueMinor'), false);
  });
  assert.equal(requests, 1);
});

test('server-authorized cost fields remain exact integer minor units, never fabricated', async () => {
  await withFetch((async () => json({ data: {
    ...product, purchasePriceMinor: 800, stockValueMinor: 16000,
  } })) as typeof fetch, async () => {
    const response = await createSimpleProduct('cost-authorized', operationId, simpleInput);
    assert.equal(response.data.purchasePriceMinor, 800);
    assert.equal(response.data.stockValueMinor, 16000);
  });
});

test('exact one-alt conversion passes unchanged; no client math or price scaling', async () => {
  const converted = {
    ...simpleInput, conversionUnitId: secondaryUnitId, conversionFactorQty: 20000,
  };
  await withFetch((async (_url, init) => {
    assert.deepEqual(JSON.parse(String(init?.body)), converted);
    return json({ data: product });
  }) as typeof fetch, async () => {
    await createSimpleProduct('verified-tenant-A', operationId, converted);
  });
});

test('rejects all rich ProductDraft and metadata shapes instead of silently flattening them', async () => {
  const extras = [
    { nameBn: 'তামার তার' },
    { kind: 'Bundle' },
    { unitLevels: [{ unit: 'Box', factor: '20', price: '850' }] },
    { serialTracking: 'Required' },
    { openingQty: '5' },
    { offers: [] },
    { photos: ['local-preview-url'] },
    { useDefaultPriceForAllLots: true },
    { purchaseUnitPrices: [20] },
    { version: 3 },
  ];
  let requests = 0;
  await withFetch((async () => { requests++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const extra of extras) {
        await assert.rejects(
          createSimpleProduct('token', operationId, { ...simpleInput, ...extra } as any),
          (error: unknown) => error instanceof ApiError && error.kind === 'protocol',
        );
      }
    });
  assert.equal(requests, 0);
});

test('rejects incomplete legacy command before transport, including omitted formerly optional fields', async () => {
  let requests = 0;
  await withFetch((async () => { requests++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const key of Object.keys(simpleInput)) {
        const partial: any = { ...simpleInput };
        delete partial[key];
        await assert.rejects(createSimpleProduct('token', operationId, partial),
          (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
      }
    });
  assert.equal(requests, 0);
});

test('rejects invalid operation ID, unit ID, category/brand/supplier and protected control keys', async () => {
  const invalids: unknown[] = [
    { ...simpleInput, baseUnitId: 'bad' },
    { ...simpleInput, brandId: 'another-tenant' },
    { ...simpleInput, categoryId: '' },
    { ...simpleInput, usualSupplierId: 'wrong' },
    { ...simpleInput, id: productId },
    { ...simpleInput, stockQty: 12000 },
  ];
  let requests = 0;
  await withFetch((async () => { requests++; return json({ data: product }); }) as typeof fetch,
    async () => {
      await assert.rejects(createSimpleProduct('token', 'not-ulid', simpleInput), ApiError);
      for (const value of invalids) {
        await assert.rejects(createSimpleProduct('token', operationId, value as any), ApiError);
      }
    });
  assert.equal(requests, 0);
});

test('rejects fractional, unsafe, negative money and quantity without rounding', async () => {
  const invalids = [
    { purchasePriceMinor: 1.01 },
    { sellingPriceMinor: -1 },
    { sellingPriceMinor: Number.MAX_SAFE_INTEGER + 1 },
    { minStockQty: 0.001 },
    { minStockQty: -1 },
    { purchasePriceMinor: Number.POSITIVE_INFINITY },
    { purchasePriceMinor: '850' },
    { defaultDiscountValue: 0.5 },
    { offerPriceMinor: -5 },
  ];
  let requests = 0;
  await withFetch((async () => { requests++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const invalid of invalids) {
        await assert.rejects(
          createSimpleProduct('token', operationId, { ...simpleInput, ...invalid } as any), ApiError);
      }
    });
  assert.equal(requests, 0);
});

test('rejects conversion mismatches, duplicate base unit, invalid warranty and date', async () => {
  const invalids = [
    { conversionUnitId: secondaryUnitId },
    { conversionFactorQty: 20000 },
    { conversionUnitId: unitId, conversionFactorQty: 20000 },
    { conversionUnitId: secondaryUnitId, conversionFactorQty: -1000 },
    { conversionUnitId: secondaryUnitId, conversionFactorQty: 2000.1 },
    { warrantyMonths: 601 },
    { supplierWarrantyMonths: 0 },
    { minOrderQty: -1 },
    { offerStartDate: '2027/01/01' },
    { defaultDiscountType: 'RATE' },
    { defaultDiscountType: 'PERCENTAGE', defaultDiscountValue: null },
  ];
  await withFetch((async () => { throw new Error('must not send invalid write'); }) as typeof fetch,
    async () => {
      for (const invalid of invalids) {
        await assert.rejects(
          createSimpleProduct('token', operationId, { ...simpleInput, ...invalid } as any), ApiError);
      }
    });
});

test('server error envelope 401/403/404/409/5xx preserved with single attempt', async () => {
  for (const status of [401, 403, 404, 409, 503]) {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: {
        code: 'REFUSED', message: 'Create refused', details: {}, traceId: 'test-trace',
      } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(
        createSimpleProduct('tenant-A', operationId, simpleInput),
        (error: unknown) => error instanceof ApiError &&
          error.kind === 'http' && error.status === status,
      );
    });
    assert.equal(calls, 1);
  }
});

test('unexpected extra product response, missing fields and malformed envelope fail closed', async () => {
  for (const response of [
    { data: { ...product, stockValueMinor: null } },
    { data: { ...product, id: 'wrong' } },
    { data: { ...product, unexpected: 'drop' } },
    { data: { ...product, version: null } },
    { ok: true, data: product },
  ]) {
    await withFetch((async () => json(response)) as typeof fetch,
      async () => assert.rejects(
        createSimpleProduct('tenant-A', operationId, simpleInput),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol',
      ));
  }
});

test('unknown network write response does not cause automatic POST replay', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; throw new TypeError('response lost'); }) as typeof fetch,
    async () => assert.rejects(
      createSimpleProduct('tenant-A', operationId, simpleInput),
      (error: unknown) => error instanceof ApiError && error.kind === 'network',
    ));
  assert.equal(calls, 1);
});

test('bounded abort/timeout leaves outcome unconfirmed and never automatically retries', async () => {
  let calls = 0;
  await withFetch((async (_url, init) => {
    calls++;
    return new Promise<Response>((_resolve, reject) => {
      if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
      init?.signal?.addEventListener('abort',
        () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
  }) as typeof fetch, async () => {
    await assert.rejects(
      createSimpleProduct('tenant-A', operationId, simpleInput, undefined, 5),
      (error: unknown) => error instanceof ApiError && error.kind === 'network',
    );
  });
  assert.equal(calls, 1);
});

test('two distinct tenant bearer/intent contexts have no shared in-memory product cache', async () => {
  const seen: string[] = [];
  await withFetch((async (_url, init) => {
    seen.push([
      new Headers(init?.headers).get('Authorization'),
      new Headers(init?.headers).get('Idempotency-Key'),
    ].join(':'));
    return json({ data: product });
  }) as typeof fetch, async () => {
    const secondId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
    await createSimpleProduct('tenant-A', operationId, simpleInput);
    await createSimpleProduct('tenant-B', secondId, simpleInput);
  });
  assert.deepEqual(seen, [
    'Bearer tenant-A:' + operationId,
    'Bearer tenant-B:01ARZ3NDEKTSV4RRFFQ69G5FAZ',
  ]);
});
