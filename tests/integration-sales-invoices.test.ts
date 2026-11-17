import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ApiError } from '../src/integration/errors.ts';
import { decodeSalesInvoices, readSalesInvoices } from '../src/integration/sales-invoices.ts';

const origin = 'https://hisabiq-sales-invoices.test';
const invoiceId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const partyId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const secondId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const row = {
  originMode: 'ONLINE', id: invoiceId, number: 'INV-00120',
  partyId, customerName: 'Customer A', customerPhone: null,
  businessDate: '2026-11-13', dueDate: null, status: 'POSTED',
  grandTotalMinor: 12400, paidMinor: 8000, dueMinor: 4400, ageing: 'NOT_DUE',
};
const page = {
  items: [row], nextCursor: null,
  totals: { salesMinor: 12400, receivedMinor: 8000, dueMinor: 4400, invoiceCount: 1 },
};
const protocol = (e: unknown) => e instanceof ApiError && e.kind === 'protocol';
function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
}
async function withFetch(mock: typeof fetch, task: () => Promise<void>): Promise<void> {
  const host = globalThis as unknown as { fetch: typeof fetch; window?: unknown; location?: unknown };
  const before = { fetch: host.fetch, window: host.window, location: host.location };
  host.fetch = mock;
  host.window = { location: { origin } };
  host.location = { origin };
  try { await task(); } finally {
    host.fetch = before.fetch;
    if (before.window === undefined) delete host.window; else host.window = before.window;
    if (before.location === undefined) delete host.location; else host.location = before.location;
  }
}

test('R09L-01 unwrapped server sale list preserves recorded poisha, IDs, origin and ageing', () => {
  assert.deepEqual(decodeSalesInvoices(page), page);
  assert.equal(decodeSalesInvoices(page).items[0]?.dueMinor, 4400);
  assert.equal(decodeSalesInvoices(page).items[0]?.originMode, 'ONLINE');
  assert.equal(decodeSalesInvoices(page).items[0]?.partyId, partyId);
});

test('R09L-02 same-origin authenticated GET only, with no body or idempotency key', async () => {
  let count = 0;
  await withFetch((async (url, init) => {
    count++;
    assert.equal(String(url), origin + '/api/v1/sales?limit=20');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer cashier-A');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json(page);
  }) as typeof fetch, async () => {
    assert.deepEqual(await readSalesInvoices('cashier-A'), page);
  });
  assert.equal(count, 1);
});

test('R09L-03 authenticated filters encode original server list query, with true unpaidOnly', async () => {
  await withFetch((async (url) => {
    const u = new URL(String(url));
    assert.equal(u.pathname, '/api/v1/sales');
    assert.equal(u.searchParams.get('search'), 'INV 0012 / বৈদ্যুতিক');
    assert.equal(u.searchParams.get('partyId'), partyId);
    assert.equal(u.searchParams.get('fromDate'), '2026-11-01');
    assert.equal(u.searchParams.get('toDate'), '2026-11-30');
    assert.equal(u.searchParams.get('unpaidOnly'), 'true');
    assert.equal(u.searchParams.get('origin'), 'OFFLINE');
    assert.equal(u.searchParams.get('cursor'), invoiceId);
    assert.equal(u.searchParams.get('limit'), '75');
    return json({ ...page, nextCursor: secondId });
  }) as typeof fetch, async () => {
    const data = await readSalesInvoices('cashier-A', {
      search: '  INV 0012 / বৈদ্যুতিক  ', partyId, fromDate: '2026-11-01',
      toDate: '2026-11-30', unpaidOnly: true, origin: 'OFFLINE',
      cursor: invoiceId, limit: 75,
    });
    assert.equal(data.nextCursor, secondId);
  });
});

test('R09L-04 false unpaidOnly is OMITTED due to Nest z.coerce.boolean parsing', async () => {
  await withFetch((async (url) => {
    const u = new URL(String(url));
    assert.equal(u.searchParams.has('unpaidOnly'), false);
    assert.equal(u.searchParams.get('origin'), 'ALL');
    return json(page);
  }) as typeof fetch, async () => {
    await readSalesInvoices('cashier-A', { unpaidOnly: false, origin: 'ALL' });
  });
});

test('R09L-05 voided and synced-offline invoices are preserved without fake payment status', () => {
  const offline = {
    ...row, id: secondId, status: 'VOIDED', originMode: 'OFFLINE',
    dueDate: '2026-11-15', paidMinor: 13500, dueMinor: -1100, ageing: 'D1_30',
  };
  const data = decodeSalesInvoices({
    items: [row, offline], nextCursor: secondId,
    totals: { ...page.totals, invoiceCount: 2, dueMinor: -1100 },
  });
  assert.equal(data.items[1]?.status, 'VOIDED');
  assert.equal(data.items[1]?.originMode, 'OFFLINE');
  assert.equal(data.items[1]?.dueMinor, -1100);
  assert.equal(data.items[1]?.ageing, 'D1_30');
  assert.equal(data.nextCursor, secondId);
});

test('R09L-06 exact list schema rejects fake envelope, missing/unknown keys and bad enums', () => {
  const invalid: unknown[] = [
    { data: page }, { ...page, extra: 1 },
    { ...page, totals: { salesMinor: 100 } },
    { ...page, totals: { ...page.totals, other: 1 } },
    { ...page, items: [{ ...row, extra: true }] },
    { ...page, items: [{ ...row, originMode: 'REVIEW' }] },
    { ...page, items: [{ ...row, ageing: 'OVERDUE' }] },
    { ...page, items: [{ ...row, status: 'DRAFT' }] },
    { ...page, items: [{ ...row, customerPhone: undefined }] },
    { ...page, items: [{ ...row, businessDate: '2026-02-30' }] },
    { ...page, items: [{ ...row, dueDate: '2026-11-31' }] },
    { ...page, nextCursor: 'not-an-id' },
  ];
  for (const raw of invalid) assert.throws(() => decodeSalesInvoices(raw), protocol);
});

test('R09L-07 duplicate IDs, unsafe minor amounts and fractional invoice counts fail closed', () => {
  const bad = [
    { ...page, items: [row, row] },
    { ...page, items: [{ ...row, id: '01xx' }] },
    { ...page, items: [{ ...row, paidMinor: Number.MAX_SAFE_INTEGER + 1 }] },
    { ...page, items: [{ ...row, dueMinor: NaN }] },
    { ...page, totals: { ...page.totals, invoiceCount: -1 } },
    { ...page, totals: { ...page.totals, invoiceCount: 1.5 } },
    { ...page, totals: { ...page.totals, salesMinor: Number.MAX_SAFE_INTEGER + 1 } },
  ];
  for (const raw of bad) assert.throws(() => decodeSalesInvoices(raw), protocol);
});

test('R09L-08 query whitelist, unsafe date/cursor, limit and token fail before fetch', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(page); }) as typeof fetch, async () => {
    for (const run of [
      () => readSalesInvoices(''),
      () => readSalesInvoices('no spaces please'),
      () => readSalesInvoices('a', { limit: 0 }),
      () => readSalesInvoices('a', { limit: 201 }),
      () => readSalesInvoices('a', { cursor: 'random' }),
      () => readSalesInvoices('a', { fromDate: '2026-02-30' }),
      () => readSalesInvoices('a', { partyId: 'not-an-id' }),
      () => readSalesInvoices('a', { origin: 'DRAFT' as 'ONLINE' }),
      () => readSalesInvoices('a', { origin: null } as never),
      () => readSalesInvoices('a', { origin: 7 } as never),
      () => readSalesInvoices('a', { other: true } as never),
      () => readSalesInvoices('a', { search: 'x'.repeat(65) }),
      () => readSalesInvoices('a', {}, undefined, -1),
    ]) await assert.rejects(run(), protocol);
  });
  assert.equal(calls, 0);
});

test('R09L-09 401, 403, 404, malformed 200 and offline do not become sample invoices', async () => {
  for (const status of [401, 403, 404]) {
    await withFetch((async () => json({ error: 'denied' }, status)) as typeof fetch, async () => {
      await assert.rejects(readSalesInvoices('a'), (e: unknown) =>
        e instanceof ApiError && e.kind === 'http' && e.status === status);
    });
  }
  await withFetch((async () => json({ data: page })) as typeof fetch, async () => {
    await assert.rejects(readSalesInvoices('a'), protocol);
  });
  await withFetch((async () => { throw Error('offline'); }) as typeof fetch, async () => {
    await assert.rejects(readSalesInvoices('a'), (e: unknown) => e instanceof ApiError && e.kind === 'network');
  });
});

test('R09L-10 pre-aborted signal cannot fetch data', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(page); }) as typeof fetch, async () => {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(readSalesInvoices('a', {}, controller.signal), (e: unknown) =>
      e instanceof ApiError && e.kind === 'network');
  });
  assert.equal(calls, 0);
});

test('R09L-11 Sales page and the connected workspace remain preview/gated', () => {
  const sales = readFileSync(new URL('../src/pages/Sales.tsx', import.meta.url), 'utf8');
  const gate = readFileSync(new URL('../src/integration/ConnectedWorkspaceGate.tsx', import.meta.url), 'utf8');
  const adapter = readFileSync(new URL('../src/integration/sales-invoices.ts', import.meta.url), 'utf8');
  assert.match(sales, /subscribeSalesPreview/);
  assert.doesNotMatch(sales, /readSalesInvoices/);
  assert.match(gate, /workspace=pending/);
  assert.match(adapter, /method:\s*'GET'/);
  assert.doesNotMatch(adapter, /method:\s*['"](?:POST|PATCH|PUT|DELETE)['"]/);
  assert.doesNotMatch(adapter, /salesPreviewStore|localStorage|sessionStorage|toast\.success/);
});
