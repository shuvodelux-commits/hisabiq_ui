import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  decodeCustomerDirectory,
  decodeCustomerStanding,
  decodeSaleDrafts,
  decodePosProducts,
  decodePosProductsForMode,
  isCanonicalPosCursor,
} from '../src/integration/saleMapping.ts';
import {
  readPosProducts,
  readPosCustomers,
  readPosCustomerStanding,
  readSaleDrafts,
} from '../src/integration/sales.ts';

const origin = 'https://hisabiq-m7.test';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const otherProductId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const customerId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const otherCustomerId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const invoiceId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const globalV2Cursor = 'v2.1010.' + productId + '.0123456789abcdef01234567';

const product = {
  id: productId,
  name: 'Electric wire',
  sku: 'WIRE-100',
  barcode: '9870000123',
  brandName: 'Super',
  categoryName: 'Electrical',
  unitName: 'Feet',
  sellingPriceMinor: 1250,
  groupPriceMinor: null,
  qtyOnHand: 24000,
  sellableOwnedQty: 24000,
  minStockQty: 1000,
  stockStatus: 'IN_STOCK',
  hasImage: false,
  tracksSerial: false,
  searchText: 'electric wire super wire-100',
};
const products = {
  items: [product],
  nextCursor: null,
  negativeStockPolicy: 'BLOCK',
};
const party = {
  id: customerId,
  name: 'Karim Traders',
  roles: ['CUSTOMER', 'SUPPLIER'],
  phone: null,
  address: null,
  guardianName: null,
  nid: null,
  email: null,
  notes: null,
  customerGroupId: null,
  customerGroupName: null,
  creditLimitMinor: null,
  status: 'ACTIVE',
  isSystemReserved: false,
  version: 1,
  balance: {
    netMinor: 2000,
    direction: 'RECEIVABLE',
    outstandingMinor: 2000,
    advanceMinor: 0,
  },
  hasLedgerEntries: true,
};
const directory = {
  data: [party],
  page: { nextCursor: null, hasMore: false },
  summary: {
    total: 1,
    active: 1,
    inactive: 0,
    ungrouped: 1,
    totalOutstandingMinor: 2000,
    totalAdvanceMinor: 0,
    overCreditLimit: 0,
  },
};
const standing = {
  data: {
    partyId: customerId,
    name: 'Karim Traders',
    phone: null,
    dueMinor: 10000,
    advanceMinor: 1250,
    creditLimitMinor: null,
    openInvoices: [{
      id: invoiceId,
      number: 'SAL-00001',
      businessDate: '2026-11-01',
      dueDate: null,
      grandTotalMinor: 30000,
      outstandingMinor: 10000,
    }],
  },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(fake: typeof fetch, action: () => Promise<void>): Promise<void> {
  const prevFetch = globalThis.fetch;
  const prevWindow = (globalThis as unknown as Record<string, unknown>).window;
  const prevLocation = (globalThis as unknown as Record<string, unknown>).location;
  (globalThis as unknown as Record<string, unknown>).fetch = fake;
  (globalThis as unknown as Record<string, unknown>).window = { location: { origin } };
  (globalThis as unknown as Record<string, unknown>).location = { origin };
  try { await action(); }
  finally {
    (globalThis as unknown as Record<string, unknown>).fetch = prevFetch;
    if (prevWindow === undefined) delete (globalThis as unknown as Record<string, unknown>).window;
    else (globalThis as unknown as Record<string, unknown>).window = prevWindow;
    if (prevLocation === undefined) delete (globalThis as unknown as Record<string, unknown>).location;
    else (globalThis as unknown as Record<string, unknown>).location = prevLocation;
  }
}

test('POS list is a bare response, preserves base-unit stock/price and absent cost', () => {
  const result = decodePosProducts(products);
  assert.equal(result.items[0]?.unitName, 'Feet');
  assert.equal(result.items[0]?.sellingPriceMinor, 1250);
  assert.equal(result.items[0]?.qtyOnHand, 24000);
  assert.equal(Object.hasOwn(result.items[0], 'purchasePriceMinor'), false);
  assert.equal(Object.hasOwn(result.items[0], 'unitRelations'), false);
  assert.equal(Object.hasOwn(result.items[0], 'unitSellPrices'), false);
});

test('allowed POS scan/query filters are URL encoded, GET only, and use caller bearer', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    const parsed = new URL(String(url));
    assert.equal(parsed.origin, origin);
    assert.equal(parsed.pathname, '/api/v1/sales/pos-products');
    assert.equal(parsed.searchParams.get('search'), 'wire');
    assert.equal(parsed.searchParams.get('barcode'), '9870000123');
    assert.equal(parsed.searchParams.get('categoryId'), productId);
    assert.equal(parsed.searchParams.get('brandId'), otherProductId);
    assert.equal(parsed.searchParams.get('stockStatus'), 'ZERO_STOCK');
    assert.equal(parsed.searchParams.get('customerPartyId'), customerId);
    assert.equal(parsed.searchParams.get('cursor'), productId);
    assert.equal(parsed.searchParams.get('rankingMode'), null);
    assert.equal(parsed.searchParams.get('limit'), '100');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer verified-A');
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), null);
    return json({ ...products, items: [{ ...product, stockStatus: 'ZERO_STOCK',
      qtyOnHand: 0, sellableOwnedQty: 0 }], nextCursor: otherProductId,
      negativeStockPolicy: 'WARN' });
  }) as typeof fetch, async () => {
    const result = await readPosProducts('verified-A', {
      search: ' wire ', barcode: '9870000123', categoryId: productId,
      brandId: otherProductId, stockStatus: 'ZERO_STOCK',
      customerPartyId: customerId, cursor: productId, limit: 100,
    });
    assert.equal(result.nextCursor, otherProductId);
    assert.equal(result.items[0]?.stockStatus, 'ZERO_STOCK');
    assert.equal(result.negativeStockPolicy, 'WARN');
  });
  assert.equal(calls, 1);
});

test('GLOBAL_V2 explicitly serializes ranked GET, preserving bearer, cost redaction and bare list', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    const parsed = new URL(String(url));
    assert.equal(parsed.pathname, '/api/v1/sales/pos-products');
    assert.equal(parsed.searchParams.get('rankingMode'), 'GLOBAL_V2');
    assert.equal(parsed.searchParams.get('cursor'), globalV2Cursor);
    assert.equal(parsed.searchParams.get('search'), 'মরিচ 200');
    assert.equal(parsed.searchParams.get('stockStatus'), 'LOW_STOCK');
    assert.equal(parsed.searchParams.get('limit'), '2');
    assert.equal(parsed.searchParams.has('tenantId'), false);
    assert.equal(parsed.searchParams.has('role'), false);
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer cashier-A');
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), null);
    return json({ ...products, nextCursor: globalV2Cursor });
  }) as typeof fetch, async () => {
    const result = await readPosProducts('cashier-A', {
      rankingMode: 'GLOBAL_V2', cursor: globalV2Cursor,
      search: ' মরিচ 200 ', stockStatus: 'LOW_STOCK', limit: 2,
    });
    assert.equal(result.nextCursor, globalV2Cursor);
    assert.equal(result.items[0]?.sellingPriceMinor, 1250);
    assert.equal(Object.hasOwn(result.items[0], 'purchasePriceMinor'), false);
    assert.equal(Object.hasOwn(result.items[0], 'unitSellPrices'), false);
  });
  assert.equal(calls, 1);
});

test('mode-aware POS decoder accepts only current pagination shape (not an auth proof)', () => {
  assert.equal(isCanonicalPosCursor(productId, 'LEGACY'), true);
  assert.equal(isCanonicalPosCursor(globalV2Cursor, 'GLOBAL_V2'), true);
  assert.equal(isCanonicalPosCursor(productId, 'GLOBAL_V2'), false);
  assert.equal(isCanonicalPosCursor(globalV2Cursor, 'LEGACY'), false);
  assert.equal(decodePosProductsForMode({ ...products, nextCursor: productId }, 'LEGACY').nextCursor, productId);
  assert.equal(decodePosProductsForMode({ ...products, nextCursor: globalV2Cursor }, 'GLOBAL_V2').nextCursor,
    globalV2Cursor);
  assert.equal(decodePosProductsForMode(products, 'GLOBAL_V2').nextCursor, null);
  for (const cursor of [
    productId,
    'v2.invalid',
    globalV2Cursor.replace('1010.', '1011.'),
    globalV2Cursor.replace(/.$/, 'G'),
    globalV2Cursor.replace(productId, 'p1'),
    globalV2Cursor.toUpperCase(),
    'v2.1010.' + productId + '.' + '0'.repeat(121),
  ]) {
    assert.throws(() => decodePosProductsForMode({ ...products, nextCursor: cursor }, 'GLOBAL_V2'),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  }
  for (const cursor of [globalV2Cursor, '../wrong', '', productId.toLowerCase()]) {
    assert.throws(() => decodePosProductsForMode({ ...products, nextCursor: cursor }, 'LEGACY'),
      ApiError);
  }
});

test('mixed v1/v2 cursor request or response fails without fallback and no extra GET', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(products); }) as typeof fetch, async () => {
    const attempts = [
      () => readPosProducts('A', { cursor: globalV2Cursor }),
      () => readPosProducts('A', { rankingMode: 'GLOBAL_V2', cursor: productId }),
      () => readPosProducts('A', { rankingMode: 'LEGACY' } as never),
      () => readPosProducts('A', { rankingMode: 'global_v2' } as never),
      () => readPosProducts('A', { rankingMode: 'GLOBAL_V2', cursor: 'v2.1011.' + productId + '.0123456789abcdef01234567' }),
      () => readPosProducts('A', { rankingMode: 'GLOBAL_V2', cursor: 'v2.invalid' }),
    ];
    for (const request of attempts) {
      await assert.rejects(request, (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    }
  });
  assert.equal(calls, 0);

  const rawIdResponse: typeof fetch = async () => {
    calls++;
    return json({ ...products, nextCursor: productId });
  };
  await withFetch(rawIdResponse, async () => {
    await assert.rejects(readPosProducts('A', { rankingMode: 'GLOBAL_V2' }),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  });
  const rankedResponse: typeof fetch = async () => {
    calls++;
    return json({ ...products, nextCursor: globalV2Cursor });
  };
  await withFetch(rankedResponse, async () => {
    await assert.rejects(readPosProducts('A'),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  });
  assert.equal(calls, 2);
});

test('one missing purchase-price key is not reinterpreted as zero or inherited from a prior token', async () => {
  const tokens: string[] = [];
  await withFetch((async (_url, init) => {
    const token = new Headers(init?.headers).get('Authorization') ?? '';
    tokens.push(token);
    return json(token === 'Bearer cost-reader'
      ? { ...products, items: [{ ...product, purchasePriceMinor: 625 }] }
      : { ...products, items: [{ ...product, id: otherProductId }] });
  }) as typeof fetch, async () => {
    const a = await readPosProducts('cost-reader');
    const b = await readPosProducts('cashier');
    assert.equal(a.items[0]?.purchasePriceMinor, 625);
    assert.equal(b.items[0]?.id, otherProductId);
    assert.equal(Object.hasOwn(b.items[0], 'purchasePriceMinor'), false);
  });
  assert.deepEqual(tokens, ['Bearer cost-reader', 'Bearer cashier']);
});

test('POS decoder fails closed on wrappers, unknown fields, unsafe amounts and invalid policy', () => {
  for (const bad of [
    { data: products },
    { ...products, page: { nextCursor: null } },
    { ...products, negativeStockPolicy: 'IGNORE' },
    { ...products, items: [{ ...product, qtyOnHand: 0.5 }] },
    { ...products, items: [{ ...product, sellableOwnedQty: -1 }] },
    { ...products, items: [{ ...product, sellingPriceMinor: Number.MAX_SAFE_INTEGER + 1 }] },
    { ...products, items: [{ ...product, purchasePriceMinor: null }] },
    { ...products, items: [{ ...product, unitSellPrices: { Box: 100 } }] },
    { ...products, items: [{ ...product, id: 'p1' }] },
    { ...products, nextCursor: 12 },
  ]) assert.throws(() => decodePosProducts(bad), ApiError);
});

test('customer directory forces role=CUSTOMER and active status, reads real identity', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    const parsed = new URL(String(url));
    assert.equal(parsed.pathname, '/api/v1/parties');
    assert.equal(parsed.searchParams.get('role'), 'CUSTOMER');
    assert.equal(parsed.searchParams.get('status'), 'ACTIVE');
    assert.equal(parsed.searchParams.get('search'), 'Karim');
    assert.equal(parsed.searchParams.get('cursor'), customerId);
    assert.equal(parsed.searchParams.get('limit'), '50');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    return json(directory);
  }) as typeof fetch, async () => {
    const result = await readPosCustomers('verified-A', {
      search: ' Karim ', cursor: customerId, limit: 50,
    });
    assert.equal(result.data[0]?.id, customerId);
    assert.equal(result.data[0]?.roles.includes('SUPPLIER'), true);
    assert.equal(result.data[0]?.phone, null);
    assert.equal(result.data[0]?.balance.netMinor, 2000);
    assert.equal(result.summary.totalAdvanceMinor, 0);
  });
  assert.equal(calls, 1);
});

test('customer directory rejects vendor-only, malformed roles, nested balances and extra fields', () => {
  for (const bad of [
    { ...directory, data: [{ ...party, roles: ['SUPPLIER'] }] },
    { ...directory, data: [{ ...party, roles: ['CUSTOMER', 'BORROWER'] }] },
    { ...directory, data: [{ ...party, phone: 12345 }] },
    { ...directory, data: [{ ...party, id: 'demo-party' }] },
    { ...directory, data: [{ ...party, balance: { ...party.balance, netMinor: 1.5 } }] },
    { ...directory, data: [{ ...party, lastActivity: 'today' }] },
    { ...directory, page: { nextCursor: '../wrong', hasMore: true } },
    { ...directory, summary: { ...directory.summary, totalAdvanceMinor: -1 } },
  ]) assert.throws(() => decodeCustomerDirectory(bad), ApiError);
});

test('customer standing is journal-derived server truth, not invoice recomputation or cash', async () => {
  await withFetch((async (url, init) => {
    assert.equal(String(url), origin + '/api/v1/customers/' + customerId + '/standing');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    return json(standing);
  }) as typeof fetch, async () => {
    const result = await readPosCustomerStanding('verified-A', customerId);
    assert.equal(result.data.dueMinor, 10000);
    assert.equal(result.data.advanceMinor, 1250);
    assert.equal(result.data.openInvoices[0]?.outstandingMinor, 10000);
    assert.equal(Object.hasOwn(result.data, 'paymentMethod'), false);
    assert.equal(result.data.creditLimitMinor, null);
  });
});

test('standing response must belong to exactly the requested party, never another token or a walk-in null', async () => {
  for (const partyId of [otherCustomerId, null]) {
    await withFetch((async () => json({ data: { ...standing.data, partyId } })) as typeof fetch, async () => {
      await assert.rejects(readPosCustomerStanding('verified-A', customerId),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    });
  }
});

test('standing decoder rejects extra fields, unsafe poisha, wrong invoice date and malformed nested record', () => {
  for (const bad of [
    { ...standing, unexpected: 1 },
    { data: { ...standing.data, dueMinor: 2.5 } },
    { data: { ...standing.data, advanceMinor: Number.MAX_SAFE_INTEGER + 2 } },
    { data: { ...standing.data, openInvoices: [{ ...standing.data.openInvoices[0], dueDate: '2026-02-30' }] } },
    { data: { ...standing.data, openInvoices: [{ ...standing.data.openInvoices[0], amountMinor: 100 }] } },
    { data: { ...standing.data, creditLimitMinor: '2000' } },
  ]) assert.throws(() => decodeCustomerStanding(bad), ApiError);
});

test('invalid queries, fake IDs, unsupported roles and invalid bearer fail before GET', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(products); }) as typeof fetch, async () => {
    const attempts = [
      () => readPosProducts('A', { limit: 0 }),
      () => readPosProducts('A', { limit: 101 }),
      () => readPosProducts('A', { limit: 1.5 }),
      () => readPosProducts('A', { stockStatus: 'ALL' as never }),
      () => readPosProducts('A', { barcode: 'x'.repeat(65) }),
      () => readPosProducts('A', { categoryId: 'bad' }),
      () => readPosProducts('A', { role: 'SUPPLIER' } as never),
      () => readPosProducts('A', { tenantId: customerId } as never),
      () => readPosCustomers('A', { cursor: 'local-id' }),
      () => readPosCustomers('A', { limit: 201 }),
      () => readPosCustomers('A', { role: 'VENDOR' } as never),
      () => readPosCustomerStanding('A', '../wrong'),
      () => readPosCustomerStanding('A', 'walk-in'),
      () => readPosProducts(''),
      () => readPosProducts('with space'),
    ];
    for (const action of attempts) await assert.rejects(action,
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  });
  assert.equal(calls, 0);
});

for (const status of [401, 403, 404, 503]) {
  test('HTTP ' + status + ' blocks POS and customer reads without retry or preview fallback', async () => {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: { code: 'DENIED', message: 'Denied',
        details: {}, traceId: 'trace-1' } }, status);
    }) as typeof fetch, async () => {
      for (const action of [
        () => readPosProducts('A'),
        () => readPosCustomers('A'),
        () => readPosCustomerStanding('A', customerId),
      ]) {
        await assert.rejects(action, (e: unknown) =>
          e instanceof ApiError && e.kind === 'http' && e.status === status);
      }
    });
    assert.equal(calls, 3);
  });
}

test('offline error, external abort, bounded timeout and zero retries', async () => {
  for (const reader of [
    (signal?: AbortSignal, timeoutMs?: number) => readPosProducts('A', {}, signal, timeoutMs),
    (signal?: AbortSignal, timeoutMs?: number) => readPosCustomers('A', {}, signal, timeoutMs),
    (signal?: AbortSignal, timeoutMs?: number) => readPosCustomerStanding('A', customerId, signal, timeoutMs),
  ]) {
    let calls = 0;
    await withFetch((async (_url, init) => {
      calls++;
      return new Promise<Response>((_resolve, reject) => {
        if (init?.signal?.aborted) reject(new DOMException('Aborted', 'AbortError'));
        else init?.signal?.addEventListener('abort',
          () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      });
    }) as typeof fetch, async () => {
      const controller = new AbortController();
      const pending = reader(controller.signal, 1000);
      controller.abort();
      await assert.rejects(pending, (e: unknown) =>
        e instanceof ApiError && e.kind === 'network');
      await assert.rejects(reader(undefined, 5), (e: unknown) =>
        e instanceof ApiError && e.kind === 'network');
      await assert.rejects(reader(undefined, -5), (e: unknown) =>
        e instanceof ApiError && e.kind === 'protocol');
    });
    assert.equal(calls, 2);
    await withFetch((async () => { throw new TypeError('offline'); }) as typeof fetch, async () => {
      await assert.rejects(reader(), (e: unknown) =>
        e instanceof ApiError && e.kind === 'network');
    });
  }
});


/** M7-02A: unmounted, GET-only sale draft reads; cart is opaque, never posted. */
const opaqueSaleDraftCart = {
  customerId,
  customerDetails: { name: 'করিম ট্রেডার্স', guardianName: 'মতিন', phone: '01711111111' },
  discountMode: 'percent',
  discount: '7.125',
  payments: [{ method: 'bKash', amount: '100', account: 'merchant-1' }],
  lines: [{
    productId, qty: '1', unit: 'Carton',
    unitQuantities: { Carton: '1', Box: '2', Pcs: '3' },
    unitSnapshot: { revision: 4, prices: [{ unit: 'Box', value: '200.1250' }] },
    serials: ['SN-001'], stockSource: 'VENDOR',
    bundleRevision: 3, bundleSources: [{ productId: otherProductId, qty: '2' }],
  }],
  installment: { count: 6, firstDueDate: '2026-12-13' },
  futureServerField: { preserved: [null, true, 12.125, 'বাংলা'] },
};
const saleDraftRow = {
  id: productId,
  label: 'Draft #27',
  customerName: 'করিম ট্রেডার্স',
  itemCount: 1,
  grandTotalMinor: 40125,
  businessDate: '2026-11-13',
  savedAt: '2026-11-13T09:24:10.321Z',
  cart: opaqueSaleDraftCart,
};

test('sale draft decoder preserves opaque nested cart and server-owned minor amounts without projection', () => {
  const raw = { data: [saleDraftRow, {
    ...saleDraftRow, id: otherProductId, customerName: null,
    itemCount: 0, grandTotalMinor: 0, cart: {},
  }] };
  const decoded = decodeSaleDrafts(raw);
  assert.strictEqual(decoded, raw);
  assert.strictEqual(decoded.data[0]?.cart, opaqueSaleDraftCart);
  assert.deepEqual(decoded.data[0]?.cart.lines[0]?.unitQuantities,
    { Carton: '1', Box: '2', Pcs: '3' });
  assert.equal(decoded.data[0]?.grandTotalMinor, 40125);
  assert.equal(decoded.data[1]?.grandTotalMinor, 0);
  assert.equal(Object.hasOwn(decoded.data[0], 'posted'), false);
  assert.deepEqual(decodeSaleDrafts({ data: [] }), { data: [] });
});

test('sale draft decoder rejects malformed envelope, IDs, dates, minor values and metadata', () => {
  for (const bad of [
    [], {}, { data: [] , nextCursor: null }, { data: {} },
    { data: [{ ...saleDraftRow, id: 'draft-1' }] },
    { data: [{ ...saleDraftRow, label: 42 }] },
    { data: [{ ...saleDraftRow, customerName: 123 }] },
    { data: [{ ...saleDraftRow, itemCount: -1 }] },
    { data: [{ ...saleDraftRow, itemCount: 0.3 }] },
    { data: [{ ...saleDraftRow, itemCount: Number.MAX_SAFE_INTEGER + 1 }] },
    { data: [{ ...saleDraftRow, grandTotalMinor: -1 }] },
    { data: [{ ...saleDraftRow, grandTotalMinor: 1.5 }] },
    { data: [{ ...saleDraftRow, grandTotalMinor: Number.MAX_SAFE_INTEGER + 1 }] },
    { data: [{ ...saleDraftRow, businessDate: '2026-02-30' }] },
    { data: [{ ...saleDraftRow, businessDate: '2026-11-31' }] },
    { data: [{ ...saleDraftRow, savedAt: 'Today' }] },
    { data: [{ ...saleDraftRow, savedAt: '2026-02-30T09:24:10.321Z' }] },
    { data: [{ ...saleDraftRow, savedAt: '2026-11-13T25:24:10.321Z' }] },
    { data: [{ ...saleDraftRow, savedAt: '2026-11-13T09:61:10.321Z' }] },
    { data: [{ ...saleDraftRow, unexpectedPermission: 'SALE_ADMIN' }] },
  ]) {
    assert.throws(() => decodeSaleDrafts(bad),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  }
});

test('sale draft decoder rejects invalid or non-JSON cart without transforming it', () => {
  const circular: Record<string, unknown> = {};
  circular.self = circular;
  for (const cart of [
    [], null, 'cart', 1, new Date('2026-11-13T00:00:00.000Z'),
    { x: undefined }, { x: Infinity }, { x: NaN }, { x: () => 123 },
    { x: [1, undefined] }, { x: [1, , 2] }, circular,
  ]) {
    assert.throws(() => decodeSaleDrafts({ data: [{ ...saleDraftRow, cart }] }), ApiError);
  }
});

test('sale draft GET uses exact authenticated endpoint and never writes or projects preview records', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    const parsed = new URL(String(url));
    assert.equal(parsed.origin, origin);
    assert.equal(parsed.pathname, '/api/v1/sales/drafts');
    assert.equal(parsed.search, '');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer cashier-A');
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), null);
    return json({ data: [saleDraftRow] });
  }) as typeof fetch, async () => {
    const res = await readSaleDrafts('cashier-A');
    assert.equal(res.data.length, 1);
    assert.deepEqual(res.data[0]?.cart, opaqueSaleDraftCart);
    assert.equal(res.data[0]?.savedAt, '2026-11-13T09:24:10.321Z');
    assert.equal(Object.hasOwn(res.data[0], 'unitPrices'), false);
  });
  assert.equal(calls, 1);
});

test('sale draft GET is stateless per bearer, rejects invalid token before network and never retries', async () => {
  let calls = 0;
  await withFetch((async (_url, init) => {
    calls++;
    const bearer = new Headers(init?.headers).get('Authorization');
    return json({ data: bearer === 'Bearer tenant-A' ? [saleDraftRow] : [] });
  }) as typeof fetch, async () => {
    const a = await readSaleDrafts('tenant-A');
    const b = await readSaleDrafts('tenant-B');
    assert.equal(a.data.length, 1);
    assert.deepEqual(b.data, []);
    for (const badToken of ['', 'bad token']) {
      await assert.rejects(readSaleDrafts(badToken),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    }
  });
  assert.equal(calls, 2);
});

for (const status of [401, 403, 404, 503]) {
  test('sale draft HTTP ' + status + ' refuses without fallback/retry', async () => {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: { code: 'DENIED', message: 'Denied',
        details: {}, traceId: 'trace-draft' } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(readSaleDrafts('cashier-A'),
        (e: unknown) => e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
    assert.equal(calls, 1);
  });
}

test('sale draft GET fails closed on corrupt payload, abort, timeout and offline network', async () => {
  await withFetch((async () => json({ data: [{ ...saleDraftRow, cart: [] }] })) as typeof fetch,
    async () => {
      await assert.rejects(readSaleDrafts('cashier-A'),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    });
  let calls = 0;
  await withFetch((async (_url, init) => {
    calls++;
    return new Promise<Response>((_resolve, reject) => {
      if (init?.signal?.aborted) reject(new DOMException('Aborted', 'AbortError'));
      else init?.signal?.addEventListener('abort',
        () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
  }) as typeof fetch, async () => {
    const abort = new AbortController();
    const pending = readSaleDrafts('cashier-A', abort.signal, 1000);
    abort.abort();
    await assert.rejects(pending, (e: unknown) => e instanceof ApiError && e.kind === 'network');
    await assert.rejects(readSaleDrafts('cashier-A', undefined, 5),
      (e: unknown) => e instanceof ApiError && e.kind === 'network');
    await assert.rejects(readSaleDrafts('cashier-A', undefined, 0),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  });
  assert.equal(calls, 2);
  await withFetch((async () => { throw new TypeError('offline'); }) as typeof fetch,
    async () => {
      await assert.rejects(readSaleDrafts('cashier-A'),
        (e: unknown) => e instanceof ApiError && e.kind === 'network');
    });
});
