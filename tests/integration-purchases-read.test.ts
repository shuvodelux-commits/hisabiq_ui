import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { readPurchase, readPurchases } from '../src/integration/purchases.ts';

const origin = 'https://hisabiq-purchases.test';
const purchaseId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const supplierId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const lineId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const lotId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const row = {
  id: purchaseId, number: 'PUR-000001', supplierPartyId: supplierId,
  supplierName: 'Karim Traders', supplierBillRef: null, businessDate: '2026-11-12',
  dueDate: null, status: 'POSTED', lineCount: 1, overdue: false,
};
const authorizedRow = { ...row, grandTotalMinor: 9000, paidMinor: 3000, dueMinor: 6000 };
const line = {
  id: lineId, productId, productName: 'Wire', unitName: 'Feet',
  qty: 2000, expiryDate: null, lotId,
};
const authorizedLine = {
  ...line, unitPriceMinor: 5000, lineTotalMinor: 10000,
  discountShareMinor: 1000, extraCostShareMinor: 0, actualUnitCost: 450000,
};
const detail = {
  id: purchaseId, number: 'PUR-000001', version: 1, supplierPartyId: supplierId,
  supplierName: 'Karim Traders', supplierBillRef: null, businessDate: '2026-11-12',
  dueDate: null, status: 'POSTED', notes: null, lines: [line],
  warnings: [], createdAt: '2026-11-12T10:00:00.000Z',
};
const authorizedDetail = {
  ...detail, lines: [authorizedLine], itemsTotalMinor: 10000,
  discountMinor: 1000, extraCostMinor: 0, grandTotalMinor: 9000,
  paidMinor: 3000, dueMinor: 6000, paidAccountCode: 'CASH:' + supplierId,
  paidAccountName: 'Drawer', payments: [], landedCosts: [],
};
const list = {
  data: [row], page: { nextCursor: null },
  summary: { purchaseCount: 1 },
};
const authorizedList = {
  data: [authorizedRow], page: { nextCursor: purchaseId },
  summary: { purchaseCount: 1, periodTotalMinor: 9000, unpaidTotalMinor: 6000, overdueTotalMinor: 0 },
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

test('purchase list GET sends only accepted query, bearer and no mutation', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    const parsed = new URL(String(url));
    assert.equal(parsed.pathname, '/api/v1/purchases');
    assert.equal(parsed.searchParams.get('supplierPartyId'), supplierId);
    assert.equal(parsed.searchParams.get('search'), 'wire');
    assert.equal(parsed.searchParams.get('settlement'), 'UNPAID');
    assert.equal(parsed.searchParams.get('fromDate'), '2026-11-01');
    assert.equal(parsed.searchParams.get('toDate'), '2026-11-13');
    assert.equal(parsed.searchParams.get('cursor'), purchaseId);
    assert.equal(parsed.searchParams.get('limit'), '25');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer user-A');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json(authorizedList);
  }) as typeof fetch, async () => {
    const result = await readPurchases('user-A', {
      supplierPartyId: supplierId, search: ' wire ', settlement: 'UNPAID',
      fromDate: '2026-11-01', toDate: '2026-11-13', cursor: purchaseId, limit: 25,
    });
    assert.deepEqual(result, authorizedList);
  });
  assert.equal(calls, 1);
});

test('permission-redacted list/detail amounts remain absent, not zero', async () => {
  await withFetch((async (url) =>
    String(url).endsWith(purchaseId) ? json({ data: detail }) : json(list)) as typeof fetch, async () => {
    const rows = await readPurchases('reader');
    const source = await readPurchase('reader', purchaseId);
    assert.equal(Object.hasOwn(rows.data[0]!, 'grandTotalMinor'), false);
    assert.equal(Object.hasOwn(rows.summary, 'periodTotalMinor'), false);
    assert.equal(Object.hasOwn(source.data, 'paidMinor'), false);
    assert.equal(Object.hasOwn(source.data.lines[0]!, 'unitPriceMinor'), false);
  });
});

test('authorized detail retains exact poisha, scale-3 stock qty, source version and payments', async () => {
  await withFetch((async (url, init) => {
    assert.equal(String(url), origin + '/api/v1/purchases/' + purchaseId);
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer cost-viewer');
    return json({ data: authorizedDetail });
  }) as typeof fetch, async () => {
    const { data } = await readPurchase('cost-viewer', purchaseId);
    assert.equal(data.version, 1);
    assert.equal(data.lines[0]?.qty, 2000);
    assert.equal(data.lines[0]?.actualUnitCost, 450000);
    assert.equal(data.paidMinor, 3000);
    assert.equal(data.dueMinor, 6000);
    assert.deepEqual(data.payments, []);
  });
});

test('two bearer contexts are independent and never reuse another tenant cost fields', async () => {
  const tokens: string[] = [];
  await withFetch((async (_url, init) => {
    const token = new Headers(init?.headers).get('Authorization') ?? '';
    tokens.push(token);
    return json(token === 'Bearer A' ? authorizedList : list);
  }) as typeof fetch, async () => {
    const a = await readPurchases('A');
    const b = await readPurchases('B');
    assert.equal(a.data[0]?.paidMinor, 3000);
    assert.equal(Object.hasOwn(b.data[0]!, 'paidMinor'), false);
  });
  assert.deepEqual(tokens, ['Bearer A', 'Bearer B']);
});

test('unexpected keys, missing keys and malformed nested monetary fields fail closed', async () => {
  const invalid = [
    { ...list, page: {} },
    { ...list, data: [{ ...row, paidMinor: null }] },
    { ...list, data: [{ ...row, status: 'DRAFT' }] },
    { ...list, data: [{ ...row, qty: 'fake' }] },
    { ...list, summary: { purchaseCount: 1, unpaidTotalMinor: '6000' } },
    { ...list, summary: { purchaseCount: 1, unexpected: 'ignored' } },
    { data: { ...detail, lines: [{ ...line, actualUnitCost: null }] } },
    { data: { ...detail, landedCosts: [{ id: lotId, category: 'TRANSPORT', method: 'BY_VALUE', amountMinor: 200, inventoryShareMinor: 200, cogsShareMinor: 0, businessDate: '2026-11-12', addedLater: false, description: null, allocations: [{ purchaseLineId: lineId, amountMinor: '200' }] }] } },
    { data: { ...detail, version: 1.2 } },
    { data: { ...detail, unknownAmount: 0 } },
  ];
  for (let i = 0; i < invalid.length; i++) {
    await withFetch((async () => json(invalid[i])) as typeof fetch, async () => {
      await assert.rejects(i < 6 ? readPurchases('A') : readPurchase('A', purchaseId),
        (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    });
  }
});

test('invalid query and source ID reject before transport and do not create fake financial actions', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(list); }) as typeof fetch, async () => {
    for (const action of [
      () => readPurchase('A', '../other'),
      () => readPurchases('A', { limit: 101 }),
      () => readPurchases('A', { settlement: 'PARTIAL' as any }),
      () => readPurchases('A', { supplierPartyId: 's-1' }),
      () => readPurchases('A', { extra: 'bad' } as any),
      () => readPurchases('A', { search: 'x'.repeat(81) }),
      () => readPurchases('A', { fromDate: '2026-13-80' }),
      () => readPurchases('', {}),
    ]) await assert.rejects(action(), (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
    assert.equal(calls, 0);
  });
});

for (const status of [401, 403, 404, 503]) {
  test('HTTP ' + status + ' refuses purchase reads without mutation/retry/mock fallback', async () => {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: { code: 'DENIED', message: 'Denied', details: {}, traceId: 'one' } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(readPurchases('A'), (e: unknown) =>
        e instanceof ApiError && e.kind === 'http' && e.status === status);
      await assert.rejects(readPurchase('A', purchaseId), (e: unknown) =>
        e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
    assert.equal(calls, 2);
  });
}

test('abort/timeout/network error propagate without retry and without preview fallback', async () => {
  for (const reason of ['abort', 'timeout', 'offline']) {
    let calls = 0;
    const controller = new AbortController();
    await withFetch((async (_url, init) => {
      calls++;
      if (reason === 'offline') throw new TypeError('Offline');
      return await new Promise<Response>((_resolve, reject) => {
        if (init?.signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
        if (reason === 'abort') controller.abort();
      });
    }) as typeof fetch, async () => {
      await assert.rejects(
        readPurchases('A', {}, controller.signal, 5),
        (e: unknown) => e instanceof ApiError && e.kind === 'network',
      );
    });
    assert.equal(calls, 1);
  }
});
