import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cashToMinor, fetchCashDay, fetchCashHistory, fetchCashAccounts,
  startCashDay, closeCashDay, reopenCashDay, saveCashEnabled,
} from '../src/services/cashSessionApi.ts';
import { generateOperationId, isOperationId } from '../src/integration/operation.ts';

const tenantId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const today = '2026-11-13';
const session = {
  id: tenantId, number: 'DAY-1', accountId: tenantId, accountName: 'Drawer',
  businessDate: today, status: 'OPEN', openingAmountMinor: 1000,
  previousClosingMinor: null, cashInMinor: 0, cashOutMinor: 0,
  expectedClosingMinor: 1000, openedAt: '2026-11-13T03:00:00.000Z',
  openedByName: 'Owner', closes: [], version: 1,
};
const status = {
  enabled: true, drawerAccountId: tenantId, businessDate: today,
  todaySession: session, blockedByDate: null, blockedSession: null,
  previousClosingMinor: null, drawerBalanceMinor: 1000, canReopenToday: false,
};
const history = {
  rows: [{
    sessionId: tenantId, businessDate: today, status: 'CLOSED',
    openingAmountMinor: 1000, cashInMinor: 500, cashOutMinor: 200,
    expectedClosingMinor: 1300, countedClosingMinor: 1300, differenceMinor: 0,
    differenceKind: 'MATCHED', differenceReason: null, wasReopened: false,
  }],
  page: { nextCursor: null, hasMore: false },
};
const account = {
  id: tenantId, name: 'Drawer', type: 'CASH', isDrawer: true, status: 'ACTIVE',
  balanceMinor: 1000, openingAmountMinor: 0, openingDate: null, version: 1,
  holderName: null, reference: null,
};
const settings = {
  businessName: 'Shop', timezone: 'Asia/Dhaka',
  supportedTimezones: ['Asia/Dhaka'],
  catalogue: [{
    key: 'cash_session_enabled', group: 'cash', label: 'Cash Sessions',
    detail: 'Track the drawer', kind: 'TOGGLE', options: ['on', 'off'],
    defaultValue: 'off', requires: [], stepUp: false, consumedBy: 'cash', inEffect: true,
  }],
  values: { cash_session_enabled: 'on' },
};
const response = (body: unknown, code = 200) =>
  new Response(JSON.stringify(body), {
    status: code, headers: { 'content-type': 'application/json' },
  });

async function fakeTransport(
  handler: (path: string, init: RequestInit) => Promise<Response> | Response,
  run: () => Promise<void>,
): Promise<void> {
  const oldFetch = globalThis.fetch;
  const oldWindow = globalThis.window;
  try {
    globalThis.window = { location: { origin: 'https://hisabiq.test' },
      localStorage: { getItem: () => 'obsolete-token' } } as unknown as Window & typeof globalThis;
    globalThis.fetch = async (input, init) => handler(
      new URL(String(input)).pathname + new URL(String(input)).search,
      init ?? {},
    );
    await run();
  } finally {
    globalThis.window = oldWindow;
    globalThis.fetch = oldFetch;
  }
}

test('monetary input uses exact poisha and canonical operation ULID', () => {
  assert.equal(cashToMinor('400.25'), 40025);
  assert.equal(cashToMinor('৪০০.২৫'), 40025);
  assert.equal(cashToMinor('0'), 0);
  for (const invalid of ['-1', '12.345', '1e3', 'NaN', '90071992547410']) {
    assert.throws(() => cashToMinor(invalid));
  }
  const id = generateOperationId();
  assert.equal(isOperationId(id), true);
});

test('missing verified token cannot send a request; localStorage is ignored', async () => {
  let calls = 0;
  await fakeTransport(() => { calls += 1; return response(status); }, async () => {
    await assert.rejects(fetchCashDay(''));
    await assert.rejects(startCashDay('', {
      businessDate: today, openingAmountMinor: 1000,
      counterpartAccountCode: null, note: null, operationId: generateOperationId(),
    }));
  });
  assert.equal(calls, 0);
});

test('reads backend day, history and accounts through verified bearer', async () => {
  const paths: string[] = [];
  await fakeTransport((path, init) => {
    paths.push(path);
    assert.equal(new Headers(init.headers).get('Authorization'), 'Bearer verified-token');
    if (path.endsWith('/money/day')) return response(status);
    if (path.includes('/daily-cash')) return response(history);
    if (path.endsWith('/money/accounts')) return response({
      accounts: [account], totalCashMinor: 1000, totalBankMinor: 0,
      totalMfsMinor: 0, totalLoanMinor: 0,
    });
    return response({}, 404);
  }, async () => {
    assert.deepEqual(await fetchCashDay('verified-token'), status);
    assert.deepEqual((await fetchCashHistory('verified-token')).rows, history.rows);
    assert.deepEqual(await fetchCashAccounts('verified-token'), [account]);
  });
  assert.deepEqual(paths, [
    '/api/v1/money/day',
    '/api/v1/money/daily-cash?limit=50',
    '/api/v1/money/accounts',
  ]);
});

test('start close reopen reuse supplied idempotency key and require posted acknowledgements', async () => {
  const operationId = generateOperationId();
  const paths: string[] = [];
  await fakeTransport((path, init) => {
    paths.push(path);
    assert.equal(init.method, 'POST');
    const headers = new Headers(init.headers);
    assert.equal(headers.get('Authorization'), 'Bearer verified-token');
    assert.equal(headers.get('Idempotency-Key'), operationId);
    assert.equal(JSON.parse(String(init.body)).operationId, operationId);
    return response({ data: session });
  }, async () => {
    assert.equal((await startCashDay('verified-token', {
      businessDate: today, openingAmountMinor: 1000,
      counterpartAccountCode: null, note: null, operationId,
    })).id, tenantId);
    assert.equal((await closeCashDay('verified-token', tenantId, {
      countedClosingMinor: 1000, reason: null, operationId,
    })).status, 'OPEN');
    assert.equal((await reopenCashDay('verified-token', tenantId, {
      reason: 'Wrong close', operationId,
    })).id, tenantId);
  });
  assert.deepEqual(paths, [
    '/api/v1/money/day/start',
    '/api/v1/money/day/' + tenantId + '/close',
    '/api/v1/money/day/' + tenantId + '/reopen',
  ]);
});

test('cash setting toggle uses server-acknowledged values and never local defaults', async () => {
  await fakeTransport((path, init) => {
    assert.equal(path, '/api/v1/settings/value');
    assert.equal(new Headers(init.headers).get('Authorization'), 'Bearer verified-token');
    assert.deepEqual(JSON.parse(String(init.body)), {
      key: 'cash_session_enabled', value: 'off',
    });
    return response({ data: { ...settings, values: { cash_session_enabled: 'off' } }, warnings: [] });
  }, async () => {
    const result = await saveCashEnabled('verified-token', false);
    assert.equal(result.values.cash_session_enabled, 'off');
  });
});

test('malformed success, revoked authorization and unknown POST outcome never fake success or retry', async () => {
  let calls = 0;
  await fakeTransport(() => { calls += 1; return response({ enabled: true }); }, async () => {
    await assert.rejects(fetchCashDay('verified-token'));
  });
  await fakeTransport(() => {
    calls += 1;
    return response({ error: {
      code: 'PERMISSION_DENIED', message: 'Not allowed', details: {}, traceId: 'trace-1',
    } }, 403);
  }, async () => {
    await assert.rejects(startCashDay('verified-token', {
      businessDate: today, openingAmountMinor: 1000,
      counterpartAccountCode: null, note: null, operationId: generateOperationId(),
    }));
  });
  await fakeTransport(() => {
    calls += 1;
    throw new Error('Offline: uncertain response');
  }, async () => {
    await assert.rejects(closeCashDay('verified-token', tenantId, {
      countedClosingMinor: 1000, reason: null, operationId: generateOperationId(),
    }));
  });
  assert.equal(calls, 3);
});
