import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  saveSimpleProductThumbnail,
  removeSimpleProductThumbnail,
} from '../src/integration/product-image.ts';

const origin = 'https://hisabiq.test';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const otherProductId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const unitId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const png = Buffer.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1]).toString('base64');
const jpeg = Buffer.from([255,216,255,224,0,16,74,70,73,70,0,1,255,217]).toString('base64');
const webp = Buffer.from([82,73,70,70,10,0,0,0,87,69,66,80,86,80,56,32,0,0,0,0]).toString('base64');
const validInput = { mime: 'image/png', dataBase64: png } as const;

const product = {
  id: productId, name: 'Copper wire', displayName: 'Copper wire',
  brandId: null, brandName: null, categoryId: null, categoryName: null,
  parentCategoryName: null, sku: null, barcode: null, description: null,
  baseUnitId: unitId, baseUnitName: 'Feet', sellingPriceMinor: 1050,
  minStockQty: 5000, status: 'ACTIVE',
  defaultDiscountType: null, defaultDiscountValue: null,
  offerEnabled: false, offerPriceMinor: null, offerStartDate: null,
  offerEndDate: null, offerLive: false, hasImage: true,
  tracksExpiry: false, tracksSerial: false, conversion: null,
  stockQty: 0, stockStatus: 'ZERO_STOCK', hasStockHistory: false,
  usualSupplierId: null, usualSupplierName: null,
  minOrderQty: null, warrantyMonths: null, supplierWarrantyMonths: null,
  version: 4,
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}

async function withFetch(fake: typeof fetch, work: () => Promise<void>): Promise<void> {
  const prevFetch = globalThis.fetch;
  const prevWindow = (globalThis as any).window;
  const prevLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await work(); } finally {
    (globalThis as any).fetch = prevFetch;
    if (prevWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = prevWindow;
    if (prevLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = prevLocation;
  }
}

test('save one image uses exact authenticated POST, strict MIME/base64 body and product response', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/products/' + productId + '/image');
    assert.equal(init?.method, 'POST');
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('Authorization'), 'Bearer verified-editor');
    assert.equal(headers.get('Content-Type'), 'application/json');
    assert.equal(headers.get('Idempotency-Key'), null);
    assert.deepEqual(JSON.parse(String(init?.body)), validInput);
    return json({ data: product });
  }) as typeof fetch, async () => {
    const result = await saveSimpleProductThumbnail('verified-editor', productId, validInput);
    assert.equal(result.data.id, productId);
    assert.equal(result.data.hasImage, true);
    assert.equal(Object.hasOwn(result.data, 'purchasePriceMinor'), false);
    assert.equal(Object.hasOwn(result.data, 'stockValueMinor'), false);
  });
  assert.equal(calls, 1);
});

test('removing legacy thumbnail is a bodyless DELETE that expects complete ProductResponse, NOT product delete', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/products/' + productId + '/image');
    assert.equal(init?.method, 'DELETE');
    assert.equal(init?.body, undefined);
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('Authorization'), 'Bearer verified-editor');
    assert.equal(headers.get('Idempotency-Key'), null);
    assert.equal(headers.get('Content-Type'), null);
    return json({ data: { ...product, hasImage: false } });
  }) as typeof fetch, async () => {
    const result = await removeSimpleProductThumbnail('verified-editor', productId);
    assert.equal(result.data.hasImage, false);
    assert.equal(result.data.id, productId);
  });
  assert.equal(calls, 1);
});

test('PNG, JPEG and WebP signatures stay untouched; no browser recompression or MIME conversion', async () => {
  const inputs = [
    { mime: 'image/png', dataBase64: png },
    { mime: 'image/jpeg', dataBase64: jpeg },
    { mime: 'image/webp', dataBase64: webp },
  ];
  let calls = 0;
  await withFetch((async (_url, init) => {
    assert.deepEqual(JSON.parse(String(init?.body)), inputs[calls++]);
    return json({ data: product });
  }) as typeof fetch, async () => {
    for (const input of inputs) await saveSimpleProductThumbnail('token', productId, input);
  });
  assert.equal(calls, inputs.length);
});

test('refuses gallery, URI, file and all extra/missing keys rather than truncating rich form', async () => {
  const rejected = [
    { ...validInput, photos: ['file:///tmp/photo'] },
    { ...validInput, gallery: [] },
    { ...validInput, altText: 'Copper' },
    { ...validInput, thumbnailUrl: 'https://example.com/image' },
    { ...validInput, file: { name: 'copper.jpg' } },
    { dataBase64: png },
    { mime: 'image/png' },
    {},
    [],
    null,
  ];
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const input of rejected) {
        await assert.rejects(
          saveSimpleProductThumbnail('token', productId, input as any),
          (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
      }
    });
  assert.equal(calls, 0);
});

test('rejects unsupported MIME and mismatched apparent image signatures locally', async () => {
  const invalid = [
    { mime: 'image/svg+xml', dataBase64: png },
    { mime: 'text/html', dataBase64: png },
    { mime: 'IMAGE/PNG', dataBase64: png },
    { mime: 'image/png', dataBase64: jpeg },
    { mime: 'image/jpeg', dataBase64: webp },
    { mime: 'image/webp', dataBase64: png },
    { mime: 'image/png', dataBase64: Buffer.from('<svg><script>hi</script></svg>').toString('base64') },
  ];
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const input of invalid) await assert.rejects(
        saveSimpleProductThumbnail('token', productId, input),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  assert.equal(calls, 0);
});

test('rejects invalid, undersized, oversized or non-canonical base64 before POST', async () => {
  const invalid = [
    '', 'a', 'a'.repeat(15), '%%%/%%%/%%%/%%%%',
    png + '%', png.slice(0, -1), 'A'.repeat(196612),
    'ＡＢＣＤ'.repeat(8), 'AA==AA==', 'AA=A', 'a'.repeat(64),
  ];
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const dataBase64 of invalid) await assert.rejects(
        saveSimpleProductThumbnail('token', productId, { mime: 'image/png', dataBase64 }),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  assert.equal(calls, 0);
});

test('rejects malformed ProductResponse and unexpected 204 on either write', async () => {
  const invalid = [
    { data: { ...product, purchasePriceMinor: null } },
    { data: { ...product, stockValueMinor: '2' } },
    { data: { ...product, id: 'wrong' } },
    { data: { ...product, version: '4' } },
    { data: { ...product, another: 2 } },
    { success: true, data: product },
  ];
  for (const body of invalid) {
    await withFetch((async () => json(body)) as typeof fetch, async () => {
      await assert.rejects(saveSimpleProductThumbnail('token', productId, validInput),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
      await assert.rejects(removeSimpleProductThumbnail('token', productId),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  }
  await withFetch((async () => new Response(null, { status: 204 })) as typeof fetch,
    async () => {
      await assert.rejects(saveSimpleProductThumbnail('token', productId, validInput),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
      await assert.rejects(removeSimpleProductThumbnail('token', productId),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
});

test('each HTTP permission/missing/conflict/size/server error is returned; no retry', async () => {
  for (const status of [400, 401, 403, 404, 409, 413, 503]) {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: {
        code: status === 413 ? 'IMAGE_TOO_LARGE' : 'REFUSED',
        message: 'Image change refused', details: {}, traceId: 'image-trace',
      } }, status);
    }) as typeof fetch, async () => {
      for (const act of [
        () => saveSimpleProductThumbnail('token', productId, validInput),
        () => removeSimpleProductThumbnail('token', productId),
      ]) await assert.rejects(act(), (err: unknown) =>
        err instanceof ApiError && err.kind === 'http' && err.status === status);
    });
    assert.equal(calls, 2);
  }
});

test('rejects path traversal, invalid ULID and invalid timeout for both actions before transport', async () => {
  const invalidIds = ['', 'bad', '../foreign', productId + '/remove', '/api/v1/products'];
  const invalidTimeouts = [0, -1, 1.5, Infinity, 120001];
  let calls = 0;
  await withFetch((async () => { calls++; return json({ data: product }); }) as typeof fetch,
    async () => {
      for (const product of invalidIds) {
        await assert.rejects(saveSimpleProductThumbnail('token', product, validInput), ApiError);
        await assert.rejects(removeSimpleProductThumbnail('token', product), ApiError);
      }
      for (const timeout of invalidTimeouts) {
        await assert.rejects(saveSimpleProductThumbnail('token', productId, validInput, undefined, timeout), ApiError);
        await assert.rejects(removeSimpleProductThumbnail('token', productId, undefined, timeout), ApiError);
      }
    });
  assert.equal(calls, 0);
});

test('network ambiguity on image save/remove never automatically retries', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; throw new TypeError('Response lost'); }) as typeof fetch,
    async () => {
      await assert.rejects(saveSimpleProductThumbnail('token', productId, validInput),
        (err: unknown) => err instanceof ApiError && err.kind === 'network');
      await assert.rejects(removeSimpleProductThumbnail('token', productId),
        (err: unknown) => err instanceof ApiError && err.kind === 'network');
    });
  assert.equal(calls, 2);
});

test('abort and timeout of image writes do not retry or claim a saved state', async () => {
  for (const method of ['save', 'remove']) {
    for (const mode of ['timeout', 'abort']) {
      const signal = new AbortController();
      let calls = 0;
      await withFetch((async (_url, init) => {
        calls++;
        return await new Promise<Response>((_resolve, reject) => {
          if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
          init?.signal?.addEventListener('abort',
            () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
          if (mode === 'abort') signal.abort();
        });
      }) as typeof fetch, async () => {
        const action = method === 'save'
          ? saveSimpleProductThumbnail('token', productId, validInput, signal.signal, mode === 'timeout' ? 5 : 5000)
          : removeSimpleProductThumbnail('token', productId, signal.signal, mode === 'timeout' ? 5 : 5000);
        await assert.rejects(action,
          (err: unknown) => err instanceof ApiError && err.kind === 'network');
      });
      assert.equal(calls, 1);
    }
  }
});

test('two bearer principals and product IDs are never cached or cross-used', async () => {
  const seen: string[] = [];
  await withFetch((async (url, init) => {
    seen.push((new Headers(init?.headers).get('Authorization') ?? '') + ':' + String(url));
    return json({ data: { ...product, id: String(url).includes(otherProductId) ? otherProductId : productId } });
  }) as typeof fetch, async () => {
    const a = await saveSimpleProductThumbnail('tenant-A', productId, validInput);
    const b = await removeSimpleProductThumbnail('tenant-B', otherProductId);
    assert.equal(a.data.id, productId);
    assert.equal(b.data.id, otherProductId);
  });
  assert.deepEqual(seen, [
    'Bearer tenant-A:' + origin + '/api/v1/products/' + productId + '/image',
    'Bearer tenant-B:' + origin + '/api/v1/products/' + otherProductId + '/image',
  ]);
});
