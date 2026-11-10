import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cashOperationId, cashToMinor, fetchCashDay, fetchCashHistory,
  hasCashSessionCredentials, saveCashEnabled, startCashDay, closeCashDay,
} from '../src/services/cashSessionApi.ts';

test('cash amounts are converted to integer poisha, never rounded away silently', () => {
  assert.equal(cashToMinor(0), 0);
  assert.equal(cashToMinor(400.25), 40025);
  assert.equal(cashToMinor(0.01), 1);
  for (const invalid of [-1, Number.NaN, Number.POSITIVE_INFINITY, 12.345]) {
    assert.throws(() => cashToMinor(invalid), /valid non-negative/);
  }
  const id = cashOperationId();
  assert.match(id, /^[0-9A-HJKMNP-TV-Z]{26}$/);
  assert.notEqual(id, cashOperationId());
});

test('never send a money request without an existing backend bearer token', async () => {
  const savedWindow = globalThis.window;
  const savedFetch = globalThis.fetch;
  let called = false;
  try {
    globalThis.window = { localStorage: { getItem: () => null } } as Window & typeof globalThis;
    globalThis.fetch = async () => { called = true; throw new Error('should not send'); };
    assert.equal(hasCashSessionCredentials(), false);
    await assert.rejects(fetchCashDay(), /Sign in to the connected ERP/);
    assert.equal(called, false);
  } finally {
    globalThis.window = savedWindow;
    globalThis.fetch = savedFetch;
  }
});

test('read endpoints respect unwrapped responses; mutations require actual data acknowledgments', async () => {
  const savedWindow = globalThis.window;
  const savedFetch = globalThis.fetch;
  const calls: Array<{ path: string; method: string; body: unknown }> = [];
  const status = {
    enabled: true,
    drawerAccountId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    businessDate: '2026-11-10',
    todaySession: null,
    blockedByDate: null,
    blockedSession: null,
    previousClosingMinor: 1000,
    drawerBalanceMinor: 1000,
    canReopenToday: false,
  };
  const session = { id: '01ARZ3NDEKTSV4RRFFQ69G5FAV', businessDate: '2026-11-10' };
  try {
    globalThis.window = { localStorage: { getItem: () => 'server-issued-token' } } as Window & typeof globalThis;
    globalThis.fetch = async (input, init) => {
      const path = String(input);
      const headers = init?.headers as Record<string, string>;
      assert.equal(headers?.authorization, 'Bearer server-issued-token');
      const method = init?.method ?? 'GET';
      const body = init?.body ? JSON.parse(String(init.body)) as unknown : null;
      calls.push({ path, method, body });
      const response =
        path.endsWith('/money/day') ? status
        : path.includes('daily-cash') ? { rows: [], page: { nextCursor: null, hasMore: false } }
        : path.endsWith('day/start') ? { data: session }
        : path.includes('/close') ? { data: session }
        : path.endsWith('/settings/value')
          ? { data: { values: { cash_session_enabled: 'off' } }, warnings: [] }
          : null;
      return new Response(JSON.stringify(response), { status: response ? 200 : 404,
        headers: { 'content-type': 'application/json' } });
    };
    assert.equal(hasCashSessionCredentials(), true);
    assert.equal((await fetchCashDay()).drawerBalanceMinor, 1000);
    assert.deepEqual((await fetchCashHistory()).rows, []);
    await startCashDay({
      businessDate: '2026-11-10', openingAmountMinor: 1000,
      counterpartAccountCode: null, note: null, operationId: cashOperationId(),
    });
    await closeCashDay(session.id, {
      countedClosingMinor: 1100, reason: 'Cash counted physically',
      operationId: cashOperationId(),
    });
    const toggled = await saveCashEnabled(false);
    assert.equal(toggled.values.cash_session_enabled, 'off');
    assert.deepEqual(calls.map(call => [call.method, call.path]), [
      ['GET', '/api/v1/money/day'],
      ['GET', '/api/v1/money/daily-cash?limit=50'],
      ['POST', '/api/v1/money/day/start'],
      ['POST', '/api/v1/money/day/' + session.id + '/close'],
      ['POST', '/api/v1/settings/value'],
    ]);
    assert.deepEqual(calls[4]?.body, { key: 'cash_session_enabled', value: 'off' });
  } finally {
    globalThis.window = savedWindow;
    globalThis.fetch = savedFetch;
  }
});

test('server errors block posting instead of falling back to simulated success', async () => {
  const savedWindow = globalThis.window;
  const savedFetch = globalThis.fetch;
  try {
    globalThis.window = { localStorage: { getItem: () => 'expired-token' } } as Window & typeof globalThis;
    globalThis.fetch = async () => new Response(JSON.stringify({
      error: { code: 'PERMISSION_DENIED', message: 'Not allowed' },
    }), { status: 403, headers: { 'content-type': 'application/json' } });
    await assert.rejects(
      startCashDay({
        businessDate: '2026-11-10', openingAmountMinor: 0,
        counterpartAccountCode: null, note: null, operationId: cashOperationId(),
      }),
      /Access denied: Not allowed/,
    );
  } finally {
    globalThis.window = savedWindow;
    globalThis.fetch = savedFetch;
  }
});
