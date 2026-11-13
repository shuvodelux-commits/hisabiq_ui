import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  decodeCustomerDirectory,
  decodeCustomerStanding,
  decodePosProducts,
} from '../src/integration/saleMapping.ts';
import {
  readPosProducts,
  readPosCustomers,
  readPosCustomerStanding,
} from '../src/integration/sales.ts';

const origin = 'https://hisabiq-m7.test';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const otherProductId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const customerId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const otherCustomerId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const invoiceId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';

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
  const prevWindow = (globalThis as any).window;
  const prevLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await action(); }
  finally {
    (globalThis as any).fetch = prevFetch;
    if (prevWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = prevWindow;
    if (prevLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = prevLocation;
  }
}

test('POS list is a bare response, preserves base-unit stock/price and absent cost', () => {
  const result = decodePosProducts(products);
  assert.equal(result.items[0]?.unitName, 'Feet');
  assert.equal(result.items[0]?.sellingPriceMinor, 1250);
  assert.equal(result.items[0]?.qtyOnHand, 24000);
  assert.equal(Object.hasOwn(result.items[0]!, 'purchasePriceMinor'), false);
  assert.equal(Object.hasOwn(result.items[0]!, 'unitRelations'), false);
  assert.equal(Object.hasOwn(result.items[0]!, 'unitSellPrices'), false);
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
    assert.equal(Object.hasOwn(b.items[0]!, 'purchasePriceMinor'), false);
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
      () => readPosProducts('A', { stockStatus: 'ALL' as any }),
      () => readPosProducts('A', { barcode: 'x'.repeat(65) }),
      () => readPosProducts('A', { categoryId: 'bad' }),
      () => readPosProducts('A', { role: 'SUPPLIER' } as any),
      () => readPosProducts('A', { tenantId: customerId } as any),
      () => readPosCustomers('A', { cursor: 'local-id' }),
      () => readPosCustomers('A', { limit: 201 }),
      () => readPosCustomers('A', { role: 'VENDOR' } as any),
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
