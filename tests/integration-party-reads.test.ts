import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  decodeTradingPartyList,
  decodeTradingPartyDetail,
  decodeHistoricalPartyOpening,
  decodeTradingLedger,
  readTradingParties,
  readTradingParty,
  readHistoricalPartyOpening,
  readTradingPartyLedger,
} from '../src/integration/party-reads.ts';

const origin = 'https://hisabiq-mod004.test';
const partyId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const secondId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const entryId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const lineId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const sourceId = '01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const received = { netMinor: 500000, direction: 'RECEIVABLE', outstandingMinor: 500000, advanceMinor: 0 };
const payable = { netMinor: -300000, direction: 'PAYABLE', outstandingMinor: 0, advanceMinor: 300000 };
const zero = { netMinor: 0, direction: 'SETTLED', outstandingMinor: 0, advanceMinor: 0 };
const party = {
  id: partyId, name: 'Karim Electrical', roles: ['CUSTOMER', 'SUPPLIER'],
  readRole: 'CUSTOMER', phone: '01712345678',
  customerGroupId: null, customerGroupName: null,
  creditLimitMinor: 800000, status: 'ACTIVE', isSystemReserved: false, version: 2,
  balance: received, profile: { state: 'WITHHELD' }, globalHistory: { state: 'WITHHELD' },
};
const supplier = { ...party, readRole: 'SUPPLIER', balance: payable,
  customerGroupId: null, customerGroupName: null, creditLimitMinor: null };
const summary = {
  total: 1, active: 1, inactive: 0, ungrouped: 1,
  totalOutstandingMinor: 500000, totalAdvanceMinor: 0, overCreditLimit: 0,
};
const partyList = {
  data: [party], page: { nextCursor: null, hasMore: false }, summary,
};
const opening = {
  id: sourceId, number: 'OPN-000001', role: 'CUSTOMER',
  direction: 'RECEIVABLE', amountMinor: 500000,
  businessDate: '2026-01-01', version: 1,
};
const row = {
  journalEntryId: entryId, journalLineId: lineId,
  businessDate: '2026-01-01', sourceDocumentType: 'OPENING_BALANCE',
  sourceDocumentId: sourceId, sourceNumber: 'OPN-000001',
  account: 'AR', amountMinor: 500000, debitMinor: 500000,
  creditMinor: 0, runningBalanceMinor: 500000,
};
const ledger = {
  partyId, partyName: 'Karim Electrical', openingBalance: zero,
  rows: [row], closingBalance: received,
  totalDebitMinor: 500000, totalCreditMinor: 0,
  page: { nextCursor: null, hasMore: false },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(mock: typeof fetch, run: () => Promise<void>): Promise<void> {
  const oldFetch = globalThis.fetch;
  const oldWindow = (globalThis as any).window;
  const oldLocation = (globalThis as any).location;
  (globalThis as any).fetch = mock;
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

test('P3B-R RED: V2 WITHHELD list/detail and selected-role transport, no V1 fallback', async () => {
  const row = { ...party };
  const payload = { ...partyList, data: [row] };
  assert.equal(decodeTradingPartyList(payload, 'CUSTOMER').data[0]?.profile.state, 'WITHHELD');
  assert.equal(decodeTradingPartyDetail({ data: row }, 'CUSTOMER').data.globalHistory.state, 'WITHHELD');
  const paths: string[] = [];
  await withFetch((async (url) => {
    paths.push(new URL(String(url)).pathname);
    return json(paths.length === 1 ? payload : { data: row });
  }) as typeof fetch, async () => {
    await readTradingParties('role-reader', 'CUSTOMER');
    await readTradingParty('role-reader', partyId, 'CUSTOMER');
  });
  assert.deepEqual(paths, ['/api/v2/parties', '/api/v2/parties/' + partyId]);
});

test('trading Party list sends an explicit CUSTOMER role with allowlisted filter/sort/cursor and bearer GET', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    const u = new URL(String(url));
    assert.equal(u.origin, origin);
    assert.equal(u.pathname, '/api/v2/parties');
    assert.equal(u.searchParams.get('role'), 'CUSTOMER');
    assert.equal(u.searchParams.get('search'), 'Karim');
    assert.equal(u.searchParams.get('status'), 'ACTIVE');
    assert.equal(u.searchParams.get('groupId'), secondId);
    assert.equal(u.searchParams.get('sort'), 'balance');
    assert.equal(u.searchParams.get('direction'), 'DESC');
    assert.equal(u.searchParams.get('cursor'), secondId);
    assert.equal(u.searchParams.get('limit'), '25');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer role-reader');
    assert.equal(new Headers(init?.headers).has('Idempotency-Key'), false);
    return json(partyList);
  }) as typeof fetch, async () => {
    const result = await readTradingParties('role-reader', 'CUSTOMER', {
      search: ' Karim ', groupId: secondId, status: 'ACTIVE',
      sort: 'balance', direction: 'DESC', cursor: secondId, limit: 25,
    });
    assert.equal(result.data[0]?.balance.netMinor, 500000);
    assert.equal(result.summary.totalOutstandingMinor, 500000);
  });
  assert.equal(calls, 1);
});

test('multi-role identity gives independent CUSTOMER and SUPPLIER detail without cross-netting', async () => {
  const requests: string[] = [];
  await withFetch((async (url, init) => {
    requests.push(String(url));
    assert.equal(init?.method, 'GET');
    return json({ data: String(url).includes('SUPPLIER') ? supplier : party });
  }) as typeof fetch, async () => {
    const customer = await readTradingParty('A', partyId, 'CUSTOMER');
    const supplierDetail = await readTradingParty('A', partyId, 'SUPPLIER');
    assert.equal(customer.data.balance.netMinor, 500000);
    assert.equal(supplierDetail.data.balance.netMinor, -300000);
    assert.equal(customer.data.id, supplierDetail.data.id);
    assert.deepEqual(customer.data.roles, ['CUSTOMER', 'SUPPLIER']);
  });
  assert.deepEqual(requests, [
    origin + '/api/v2/parties/' + partyId + '?role=CUSTOMER',
    origin + '/api/v2/parties/' + partyId + '?role=SUPPLIER',
  ]);
});

test('historical opening is a nullable exact-role GET with no session or payment leg', async () => {
  await withFetch((async (url, init) => {
    assert.equal(String(url), origin + '/api/v2/parties/' + partyId + '/opening?role=CUSTOMER');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    return json({ data: opening });
  }) as typeof fetch, async () => {
    const actual = await readHistoricalPartyOpening('A', partyId, 'CUSTOMER');
    assert.equal(actual.data?.amountMinor, 500000);
    assert.equal(actual.data?.businessDate, '2026-01-01');
    assert.equal(Object.hasOwn(actual.data!, 'sessionId'), false);
  });
  await withFetch((async () => json({ data: null })) as typeof fetch, async () => {
    assert.equal((await readHistoricalPartyOpening('A', partyId, 'CUSTOMER')).data, null);
  });
});


test('V2 historical opening only queries one selected role and never falls back to V1 on denial', async () => {
  for (const [status, code] of [
    [401, 'UNAUTHORIZED'],
    [403, 'PERMISSION_DENIED'],
    [403, 'FEATURE_DISABLED'],
    [404, 'NOT_FOUND'],
    [503, 'SERVICE_UNAVAILABLE'],
  ] as const) {
    const urls: string[] = [];
    await withFetch((async (url, init) => {
      urls.push(String(url));
      assert.equal(init?.method, 'GET');
      assert.equal(init?.body, undefined);
      assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer A');
      return json({
        error: {
          code, message: 'Selected opening not available',
          details: {}, traceId: '01ARZ3NDEKTSV4RRFFQ69G5FAX',
        },
      }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(
        readHistoricalPartyOpening('A', partyId, 'SUPPLIER'),
        (error: unknown) => error instanceof ApiError &&
          error.kind === 'http' && error.status === status,
      );
    });
    assert.deepEqual(urls, [origin + '/api/v2/parties/' + partyId + '/opening?role=SUPPLIER']);
  }
});

test('V2 opening keeps true null absence, rejects private extra fields, and passes AbortSignal', async () => {
  const signal = new AbortController().signal;
  await withFetch((async (url, init) => {
    assert.equal(String(url), origin + '/api/v2/parties/' + partyId + '/opening?role=VENDOR');
    assert.equal(init?.signal, signal);
    return json({ data: null });
  }) as typeof fetch, async () => {
    assert.deepEqual(await readHistoricalPartyOpening('A', partyId, 'VENDOR', signal), { data: null });
  });
  let fetched = 0;
  await withFetch((async () => {
    fetched += 1;
    return json({ data: { ...opening, nid: 'private-field' } });
  }) as typeof fetch, async () => {
    await assert.rejects(
      readHistoricalPartyOpening('A', partyId, 'CUSTOMER'),
      (error: unknown) => error instanceof ApiError && error.kind === 'protocol',
    );
  });
  assert.equal(fetched, 1);
});


test('ledger sends role/date/cursor and returns source-linked integer-poisha lines', async () => {
  await withFetch((async (url, init) => {
    const u = new URL(String(url));
    assert.equal(u.pathname, '/api/v2/parties/' + partyId + '/ledger');
    assert.equal(u.searchParams.get('role'), 'CUSTOMER');
    assert.equal(u.searchParams.get('fromDate'), '2026-01-01');
    assert.equal(u.searchParams.get('toDate'), '2026-11-13');
    assert.equal(u.searchParams.get('cursor'), secondId);
    assert.equal(u.searchParams.get('limit'), '25');
    assert.equal(init?.method, 'GET');
    return json(ledger);
  }) as typeof fetch, async () => {
    const actual = await readTradingPartyLedger('A', partyId, 'CUSTOMER', {
      fromDate: '2026-01-01', toDate: '2026-11-13', cursor: secondId, limit: 25,
    });
    assert.equal(actual.rows[0]?.amountMinor, 500000);
    assert.equal(actual.rows[0]?.journalLineId, lineId);
    assert.equal(actual.closingBalance.netMinor, 500000);
    assert.equal(actual.totalCreditMinor, 0);
  });
});


test('V2 ledger denial, hidden identity and server errors never retry legacy V1', async () => {
  for (const status of [403, 404, 503]) {
    const urls: string[] = [];
    await withFetch((async (url, init) => {
      urls.push(String(url));
      assert.equal(init?.method, 'GET');
      assert.equal(init?.body, undefined);
      return json({
        error: { code: status === 403 ? 'PERMISSION_DENIED' : status === 404 ? 'NOT_FOUND' : 'SERVICE_UNAVAILABLE',
          message: 'No Party ledger is available', details: {}, traceId: '01ARZ3NDEKTSV4RRFFQ69G5FAX' },
      }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(
        readTradingPartyLedger('A', partyId, 'SUPPLIER'),
        (error: unknown) => error instanceof ApiError && error.kind === 'http' && error.status === status,
      );
    });
    assert.deepEqual(urls, [origin + '/api/v2/parties/' + partyId + '/ledger?role=SUPPLIER']);
  }
});


test('Supplier/Vendor ledger must use their own control account family, never AR', () => {
  const supplierLedger = {
    ...ledger, openingBalance: zero, closingBalance: payable,
    rows: [{ ...row, account: 'AP', amountMinor: -300000, debitMinor: 0,
      creditMinor: 300000, runningBalanceMinor: -300000 }],
    totalDebitMinor: 0, totalCreditMinor: 300000,
  };
  assert.equal(decodeTradingLedger(supplierLedger, 'SUPPLIER', partyId).rows[0]?.account, 'AP');
  assert.throws(() => decodeTradingLedger(supplierLedger, 'CUSTOMER', partyId), ApiError);
  const vendorLedger = {
    ...supplierLedger, rows: [{ ...supplierLedger.rows[0], account: 'VENDOR_PAYABLE' }],
  };
  assert.equal(decodeTradingLedger(vendorLedger, 'VENDOR', partyId).rows[0]?.account, 'VENDOR_PAYABLE');
  assert.throws(() => decodeTradingLedger(vendorLedger, 'SUPPLIER', partyId), ApiError);
});

test('invalid role, IDs, filters and date range reject locally without any API request', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(partyList); }) as typeof fetch, async () => {
    const bad = [
      () => readTradingParties('A', 'All' as any),
      () => readTradingParties('A', 'LENDER' as any),
      () => readTradingParties('A', 'CUSTOMER', { sort: 'amountMinor' as any }),
      () => readTradingParties('A', 'CUSTOMER', { query: 'x' } as any),
      () => readTradingParties('A', 'CUSTOMER', { limit: 201 }),
      () => readTradingParties('A', 'CUSTOMER', { cursor: '../supplier' }),
      () => readTradingParties('A', 'CUSTOMER', { search: 'x'.repeat(121) }),
      () => readTradingParty('A', 'demo-1', 'CUSTOMER'),
      () => readHistoricalPartyOpening('A', partyId, 'BORROWER' as any),
      () => readTradingPartyLedger('A', partyId, 'CUSTOMER', { fromDate: '2026-02-30' }),
      () => readTradingPartyLedger('A', partyId, 'CUSTOMER', { fromDate: '2026-02-01', toDate: '2026-01-31' }),
      () => readTradingPartyLedger('A', partyId, 'CUSTOMER', { extra: 'unsafe' } as any),
      () => readTradingPartyLedger('', partyId, 'CUSTOMER'),
    ];
    for (const action of bad) await assert.rejects(action(),
      (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  });
  assert.equal(calls, 0);
});

test('response decoders fail closed on cross-role identity, wrong ledger party, bad posting data and extra fields', () => {
  const invalidList = [
    { ...partyList, data: [{ ...party, roles: ['SUPPLIER'] }] },
    { ...partyList, data: [{ ...party, balance: { ...received, netMinor: -1 } }] },
    { ...partyList, data: [{ ...party, balance: { ...received, netMinor: 1.5 } }] },
    { ...partyList, data: [{ ...party, id: 'preview-1' }] },
    { ...partyList, data: [{ ...party, roles: ['CUSTOMER', 'LENDER'] }] },
    { ...partyList, data: [{ ...party, globalHistory: { state: 'VISIBLE', hasLedgerEntries: null } }] },
    { ...partyList, data: [{ ...party, readRole: 'SUPPLIER' }] },
    { ...partyList, data: [{ ...party, profile: { state: 'WITHHELD', data: { nid: 'leak' } } }] },
    { ...partyList, data: [{ ...party, profile: { state: 'VISIBLE' } }] },
    { ...partyList, data: [{ ...party, profile: { state: 'VISIBLE', data: {
      address: null, guardianName: null, nid: null, email: null, notes: null, extra: 'leak',
    } } }] },
    { ...partyList, data: [{ ...party, address: 'raw-v1-bypass' }] },
    { ...partyList, data: [{ ...party, globalHistory: { state: 'WITHHELD', hasLedgerEntries: false } }] },
    { ...partyList, summary: { ...summary, totalAdvanceMinor: -1 } },
    { ...partyList, page: { nextCursor: secondId, hasMore: false } },
    { ...partyList, data: [party, party] },
  ];
  for (const bad of invalidList) assert.throws(() => decodeTradingPartyList(bad, 'CUSTOMER'), ApiError);
  assert.throws(() => decodeTradingPartyDetail({ data: { ...party, extra: 1 } }, 'CUSTOMER'), ApiError);
  assert.throws(() => decodeTradingPartyDetail({ data: party }, 'VENDOR'), ApiError);
  assert.throws(() => decodeHistoricalPartyOpening({ data: { ...opening, role: 'SUPPLIER' } }, 'CUSTOMER'), ApiError);
  assert.throws(() => decodeHistoricalPartyOpening({ data: { ...opening, amountMinor: 0 } }, 'CUSTOMER'), ApiError);
  assert.throws(() => decodeHistoricalPartyOpening({ data: { ...opening, businessDate: '2026-02-30' } }, 'CUSTOMER'), ApiError);
  for (const bad of [
    { ...ledger, partyId: secondId },
    { ...ledger, rows: [{ ...row, account: 'AP' }] },
    { ...ledger, rows: [{ ...row, amountMinor: 500001 }] },
    { ...ledger, rows: [{ ...row, creditMinor: 100 }] },
    { ...ledger, rows: [{ ...row, runningBalanceMinor: Number.MAX_SAFE_INTEGER + 1 }] },
    { ...ledger, rows: [{ ...row, businessDate: '2026-02-30' }] },
    { ...ledger, rows: [row, row] },
    { ...ledger, totalDebitMinor: -1 },
    { ...ledger, extra: 123 },
  ]) assert.throws(() => decodeTradingLedger(bad, 'CUSTOMER', partyId), ApiError);
});

test('V2 nested sensitive states validate visible and withheld without coercion', () => {
  const revealed = {
    ...party,
    profile: { state: 'VISIBLE', data: {
      address: 'PRIVATE street', guardianName: null, nid: 'PRIVATE NID',
      email: null, notes: 'PRIVATE note',
    } },
    globalHistory: { state: 'VISIBLE', hasLedgerEntries: true },
  };
  const visible = decodeTradingPartyDetail({ data: revealed }, 'CUSTOMER').data;
  assert.equal(visible.profile.state, 'VISIBLE');
  assert.equal(visible.globalHistory.state, 'VISIBLE');
  assert.equal(JSON.stringify(visible).includes('PRIVATE NID'), true);
  const withheld = decodeTradingPartyDetail({ data: party }, 'CUSTOMER').data;
  assert.deepEqual(withheld.profile, { state: 'WITHHELD' });
  assert.deepEqual(withheld.globalHistory, { state: 'WITHHELD' });
  assert.equal(Object.hasOwn(withheld, 'hasLedgerEntries'), false);
  assert.throws(() => decodeTradingPartyDetail({
    data: { ...party, profile: { state: 'VISIBLE', data: { nid: 'incomplete' } } },
  }, 'CUSTOMER'), ApiError);
  assert.throws(() => decodeTradingPartyDetail({
    data: { ...party, globalHistory: { state: 'WITHHELD', hasLedgerEntries: false } },
  }, 'CUSTOMER'), ApiError);
});

test('distinct bearer tokens produce independent reads without process cache or fixture fallback', async () => {
  const tokens: string[] = [];
  await withFetch((async (_url, init) => {
    const token = new Headers(init?.headers).get('Authorization') || '';
    tokens.push(token);
    return json(token === 'Bearer A' ? partyList : {
      ...partyList, data: [], summary: { ...summary, total: 0, active: 0,
        ungrouped: 0, totalOutstandingMinor: 0 },
    });
  }) as typeof fetch, async () => {
    assert.equal((await readTradingParties('A', 'CUSTOMER')).data.length, 1);
    assert.equal((await readTradingParties('B', 'CUSTOMER')).data.length, 0);
  });
  assert.deepEqual(tokens, ['Bearer A', 'Bearer B']);
});

for (const code of [401, 403, 404, 503]) {
  test('HTTP ' + code + ' never retries or fabricates Party/opening/ledger data', async () => {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: { code: 'DENIED', message: 'Denied', details: {}, traceId: 'a' } }, code);
    }) as typeof fetch, async () => {
      for (const action of [
        () => readTradingParties('A', 'CUSTOMER'),
        () => readTradingParty('A', partyId, 'CUSTOMER'),
        () => readHistoricalPartyOpening('A', partyId, 'CUSTOMER'),
        () => readTradingPartyLedger('A', partyId, 'CUSTOMER'),
      ]) await assert.rejects(action(), (e: unknown) =>
        e instanceof ApiError && e.kind === 'http' && e.status === code);
    });
    assert.equal(calls, 4);
  });
}

test('abort, offline network and timeouts refuse read without automatic retry', async () => {
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
      await assert.rejects(readTradingParties('A', 'CUSTOMER', {}, controller.signal, 5),
        (e: unknown) => e instanceof ApiError && e.kind === 'network');
    });
    assert.equal(calls, 1);
  }
});


test('non-Customer Party contract uses null for group count and refuses Customer metadata', async () => {
  const supplierList = {
    ...partyList, data: [supplier], summary: { ...summary, ungrouped: null },
  };
  assert.equal(decodeTradingPartyList(supplierList, 'SUPPLIER').summary.ungrouped, null);
  assert.equal(decodeTradingPartyDetail({ data: supplier }, 'SUPPLIER').data.creditLimitMinor, null);
  assert.throws(
    () => decodeTradingPartyList({ ...supplierList, summary }, 'SUPPLIER'), ApiError,
  );
  assert.throws(
    () => decodeTradingPartyList({
      ...supplierList, data: [{ ...supplier, creditLimitMinor: 50 }],
    }, 'SUPPLIER'), ApiError,
  );
  assert.throws(
    () => decodeTradingPartyDetail({
      data: { ...supplier, customerGroupName: 'Private customer group' },
    }, 'SUPPLIER'), ApiError,
  );
  assert.throws(
    () => decodeTradingPartyList({
      ...partyList, summary: { ...summary, ungrouped: null },
    }, 'CUSTOMER'), ApiError,
  );
  let calls = 0;
  await withFetch((async () => {
    calls++;
    return json(supplierList);
  }) as typeof fetch, async () => {
    assert.equal((await readTradingParties('A', 'SUPPLIER')).summary.ungrouped, null);
    for (const query of [
      { groupId: partyId }, { sort: 'groupName' as const }, { sort: 'creditLimit' as const },
    ]) {
      await assert.rejects(readTradingParties('A', 'SUPPLIER', query), ApiError);
    }
  });
  assert.equal(calls, 1, 'invalid cross-role query probes must not make HTTP calls');
});
