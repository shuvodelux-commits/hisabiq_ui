import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  decodeMoneyAccountList,
  decodeMoneyAccountStatement,
  readMoneyAccounts,
  readMoneyAccountStatement,
} from '../src/integration/accounts.ts';

const origin = 'https://hisabiq.test';
const bankA = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const bankB = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const lineId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const sourceId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';

const account = {
  id: bankA,
  name: 'Main Bank',
  type: 'BANK',
  holderName: null,
  reference: null,
  isDrawer: false,
  status: 'ACTIVE',
  balanceMinor: 95000,
  openingAmountMinor: 100000,
  openingDate: '2026-01-01',
  version: 2,
};
const list = {
  accounts: [account, { ...account, id: bankB, name: 'Main Bank', type: 'LOAN', balanceMinor: 55000 }],
  totalCashMinor: 12000,
  totalBankMinor: 95000,
  totalMfsMinor: 8000,
  totalLoanMinor: 55000,
};
const statement = {
  accountId: bankA,
  accountName: 'Main Bank',
  type: 'BANK',
  openingBalanceMinor: 100000,
  closingBalanceMinor: 95000,
  totalInMinor: 25000,
  totalOutMinor: 0,
  rows: [{
    journalLineId: lineId,
    businessDate: '2026-01-03',
    createdAt: '2026-01-03T10:00:00.000Z',
    sourceType: 'CUSTOMER_RECEIPT',
    sourceNumber: 'RCP-123',
    sourceId,
    description: 'Money received',
    reference: 'RCP-123',
    amountMinor: 25000,
    debitMinor: 25000,
    creditMinor: 0,
    runningBalanceMinor: 125000,
  }],
  page: { nextCursor: lineId, hasMore: true },
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
  try { await run(); } finally {
    (globalThis as any).fetch = oldFetch;
    if (oldWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = oldWindow;
    if (oldLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = oldLocation;
  }
}

test('direct account list decodes real ULIDs, nullable openings and separate loan liability totals', () => {
  const result = decodeMoneyAccountList(list);
  assert.equal(result.accounts[0]?.openingAmountMinor, 100000);
  assert.equal(result.accounts[0]?.holderName, null);
  assert.equal(result.accounts[0]?.reference, null);
  assert.equal(result.accounts[1]?.type, 'LOAN');
  assert.equal(result.totalLoanMinor, 55000);
  assert.equal(result.totalBankMinor, 95000);
  assert.equal(Object.hasOwn(result.accounts[0]!, 'institution'), false);
  assert.equal(Object.hasOwn(result.accounts[0]!, 'lastActivity'), false);
});

test('list uses authenticated GET and explicit true/as-of filters, without writing anything', async () => {
  let count = 0;
  await withFetch((async (url, init) => {
    count++;
    const parsed = new URL(String(url));
    assert.equal(parsed.origin, origin);
    assert.equal(parsed.pathname, '/api/v1/money/accounts');
    assert.equal(parsed.searchParams.get('includeInactive'), 'true');
    assert.equal(parsed.searchParams.get('asOf'), '2026-02-01');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer token-A');
    return json(list);
  }) as typeof fetch, async () => {
    const result = await readMoneyAccounts('token-A', { includeInactive: true, asOf: '2026-02-01' });
    assert.equal(result.accounts[0]?.id, bankA);
  });
  assert.equal(count, 1);
});

test('includeInactive false and absent are omitted, never serialized as false', async () => {
  let count = 0;
  await withFetch((async (url, init) => {
    count++;
    assert.equal(String(url), origin + '/api/v1/money/accounts');
    assert.equal(init?.method, 'GET');
    return json({ ...list, accounts: [] });
  }) as typeof fetch, async () => {
    assert.equal((await readMoneyAccounts('token-A', { includeInactive: false })).accounts.length, 0);
    assert.equal((await readMoneyAccounts('token-A')).accounts.length, 0);
  });
  assert.equal(count, 2);
});

test('statement preserves page-local inflow and current balance, never inventing period totals', async () => {
  await withFetch((async (url, init) => {
    const value = new URL(String(url));
    assert.equal(value.pathname, '/api/v1/money/accounts/' + bankA + '/statement');
    assert.equal(value.searchParams.get('fromDate'), '2026-01-01');
    assert.equal(value.searchParams.get('toDate'), '2026-01-10');
    assert.equal(value.searchParams.get('kind'), 'MOVEMENT');
    assert.equal(value.searchParams.get('search'), 'RCP');
    assert.equal(value.searchParams.get('cursor'), lineId);
    assert.equal(value.searchParams.get('limit'), '25');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    return json(statement);
  }) as typeof fetch, async () => {
    const result = await readMoneyAccountStatement('token-A', bankA, {
      fromDate: '2026-01-01', toDate: '2026-01-10', kind: 'MOVEMENT',
      search: ' RCP ', cursor: lineId, limit: 25,
    });
    assert.equal(result.totalInMinor, 25000);
    assert.equal(result.closingBalanceMinor, 95000);
    assert.equal(result.rows[0]?.runningBalanceMinor, 125000);
    assert.equal(result.page.nextCursor, lineId);
    assert.equal(result.page.hasMore, true);
  });
});

test('zero-row statement and nullable source ID are valid', () => {
  const empty = decodeMoneyAccountStatement({ ...statement, rows: [], totalInMinor: 0,
    page: { nextCursor: null, hasMore: false } });
  assert.equal(empty.rows.length, 0);
  const nullable = decodeMoneyAccountStatement({ ...statement, rows: [{ ...statement.rows[0], sourceId: null }] });
  assert.equal(nullable.rows[0]?.sourceId, null);
});

test('invalid IDs and unsupported list/statement queries never issue a network request', async () => {
  let count = 0;
  await withFetch((async () => { count++; return json(list); }) as typeof fetch, async () => {
    for (const bad of [
      () => readMoneyAccountStatement('token-A', 'acc-preview'),
      () => readMoneyAccounts('token-A', { asOf: '2026-02-30' }),
      () => readMoneyAccounts('token-A', { includeInactive: 'false' as any }),
      () => readMoneyAccounts('token-A', { foo: true } as any),
      () => readMoneyAccountStatement('token-A', bankA, { fromDate: '2026-02-01', toDate: '2026-01-01' }),
      () => readMoneyAccountStatement('token-A', bankA, { kind: 'UNKNOWN' as any }),
      () => readMoneyAccountStatement('token-A', bankA, { search: 'x'.repeat(81) }),
      () => readMoneyAccountStatement('token-A', bankA, { limit: 0 }),
      () => readMoneyAccountStatement('token-A', bankA, { limit: 201 }),
      () => readMoneyAccountStatement('token-A', bankA, { limit: 1.5 }),
      () => readMoneyAccountStatement('token-A', bankA, { cursor: '../unsafe' }),
      () => readMoneyAccountStatement('token-A', bankA, { rogue: 1 } as any),
    ]) await assert.rejects(bad, (e: any) => e instanceof ApiError && e.kind === 'protocol');
  });
  assert.equal(count, 0);
});

test('malformed direct response, envelopes, unsafe integers, wrong row signs and extra fields fail closed', () => {
  const invalid = [
    { data: list },
    { ...list, accounts: [{ ...account, id: 'acc-preview' }] },
    { ...list, totalBankMinor: Number.MAX_SAFE_INTEGER + 1 },
    { ...list, accounts: [{ ...account, version: 0 }] },
    { ...list, accounts: [{ ...account, openingDate: '2026-02-30' }] },
    { ...list, accounts: [{ ...account, balanceMinor: 1.1 }] },
    { ...list, accounts: [{ ...account, lastActivity: 'just now' }] },
  ];
  for (const bad of invalid) assert.throws(() => decodeMoneyAccountList(bad), ApiError);
  for (const bad of [
    { data: statement },
    { ...statement, page: { nextCursor: 'bad', hasMore: true } },
    { ...statement, rows: [{ ...statement.rows[0], runningBalanceMinor: Number.MAX_SAFE_INTEGER + 1 }] },
    { ...statement, rows: [{ ...statement.rows[0], creditMinor: 100 }] },
    { ...statement, rows: [{ ...statement.rows[0], journalLineId: 'bad' }] },
    { ...statement, rows: [{ ...statement.rows[0], businessDate: '2026-02-30' }] },
  ]) assert.throws(() => decodeMoneyAccountStatement(bad), ApiError);
});

test('statement cannot return another selected account identity', async () => {
  await withFetch((async () => json({ ...statement, accountId: bankB })) as typeof fetch, async () => {
    await assert.rejects(() => readMoneyAccountStatement('token-A', bankA),
      (error: any) => error instanceof ApiError && error.kind === 'protocol');
  });
});

test('backend permission failure is an HTTP error without fixture fallback', async () => {
  let count = 0;
  await withFetch((async () => {
    count++;
    return json({ error: { code: 'PERMISSION_DENIED', message: 'Not allowed',
      details: {}, traceId: 'trace-1' } }, 403);
  }) as typeof fetch, async () => {
    await assert.rejects(() => readMoneyAccounts('token-without-permission'),
      (error: any) => error instanceof ApiError && error.kind === 'http' &&
        error.status === 403 && error.code === 'PERMISSION_DENIED');
  });
  assert.equal(count, 1);
});

test('different tokens cause independent GET calls with no process-global cache', async () => {
  const tokens: string[] = [];
  await withFetch((async (_url, init) => {
    const auth = new Headers(init?.headers).get('Authorization') ?? '';
    tokens.push(auth);
    return json(auth.endsWith('token-A') ? list : { ...list, accounts: [] });
  }) as typeof fetch, async () => {
    assert.equal((await readMoneyAccounts('token-A')).accounts.length, 2);
    assert.equal((await readMoneyAccounts('token-B')).accounts.length, 0);
  });
  assert.deepEqual(tokens, ['Bearer token-A', 'Bearer token-B']);
});

test('caller cancellation aborts request and never triggers a mutation', async () => {
  const controller = new AbortController();
  await withFetch(((url, init) => new Promise((_resolve, reject) => {
    assert.equal(String(url), origin + '/api/v1/money/accounts');
    assert.equal(init?.method, 'GET');
    init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true });
    controller.abort();
  })) as typeof fetch, async () => {
    await assert.rejects(() => readMoneyAccounts('token-A', {}, controller.signal),
      (e: any) => e instanceof ApiError && e.kind === 'network');
  });
});

test('bounded timeout cancels a hung GET and converts failure into safe ApiError', async () => {
  await withFetch(((url, init) => new Promise((_resolve, reject) => {
    assert.equal(new URL(String(url)).pathname, '/api/v1/money/accounts');
    init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true });
  })) as typeof fetch, async () => {
    await assert.rejects(() => readMoneyAccounts('token-A', {}, undefined, 15),
      (e: any) => e instanceof ApiError && e.kind === 'network');
    await assert.rejects(() => readMoneyAccounts('token-A', {}, undefined, -5),
      (e: any) => e instanceof ApiError && e.kind === 'protocol');
  });
});
