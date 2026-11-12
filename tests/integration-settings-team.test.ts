import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { readTenantSettings, updateBusinessProfile, type ServerSettings } from '../src/integration/settings-team.ts';

const origin = 'https://hisabiq.test';
const descriptor = {
  key: 'cash_session_enabled',
  group: 'Cash',
  label: 'Cash sessions',
  detail: 'Require a tracked cash session',
  kind: 'TOGGLE',
  options: ['on', 'off'],
  defaultValue: 'off',
  requires: [],
  stepUp: false,
  consumedBy: 'cash',
  inEffect: true,
};
const resultA = {
  data: {
    businessName: 'Tenant A Electrical',
    timezone: 'Asia/Dhaka',
    supportedTimezones: ['Asia/Dhaka'],
    catalogue: [descriptor],
    values: { cash_session_enabled: 'off' },
  },
};
const resultB = {
  data: {
    businessName: 'Tenant B Hardware',
    timezone: 'Asia/Dhaka',
    supportedTimezones: ['Asia/Dhaka'],
    catalogue: [descriptor],
    values: { cash_session_enabled: 'on' },
  },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
async function withFetch(
  fake: typeof fetch,
  run: () => Promise<void>,
): Promise<void> {
  const previousFetch = globalThis.fetch;
  const previousWindow = (globalThis as any).window;
  const previousLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try {
    await run();
  } finally {
    (globalThis as any).fetch = previousFetch;
    if (previousWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = previousWindow;
    if (previousLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = previousLocation;
  }
}

test('GET /settings uses only explicit verified bearer; preserves canonical envelope/catalogue; no write', async () => {
  let requests = 0;
  await withFetch((async (url, init) => {
    requests++;
    assert.equal(String(url), origin + '/api/v1/settings');
    assert.equal(init?.method, 'GET');
    assert.equal(init?.body, undefined);
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-A-token');
    return json(resultA);
  }) as typeof fetch, async () => {
    const result = await readTenantSettings('tenant-A-token');
    assert.deepEqual(result, resultA);
  });
  assert.equal(requests, 1);
});

test('tenant identity remains server-owned; separate bearer sessions never reuse a cached response', async () => {
  const seen: string[] = [];
  await withFetch((async (url, init) => {
    assert.equal(String(url), origin + '/api/v1/settings');
    const token = new Headers(init?.headers).get('Authorization');
    assert.ok(token === 'Bearer token-A' || token === 'Bearer token-B');
    seen.push(token);
    return json(token === 'Bearer token-A' ? resultA : resultB);
  }) as typeof fetch, async () => {
    const a = await readTenantSettings('token-A');
    const b = await readTenantSettings('token-B');
    assert.equal(a.data.businessName, 'Tenant A Electrical');
    assert.equal(b.data.businessName, 'Tenant B Hardware');
    assert.equal(a.data.values.cash_session_enabled, 'off');
    assert.equal(b.data.values.cash_session_enabled, 'on');
  });
  assert.deepEqual(seen, ['Bearer token-A', 'Bearer token-B']);
});

for (const code of [401, 403, 503]) {
  test(`HTTP ${code} never falls back to fixture settings, and never retries`, async () => {
    let requests = 0;
    await withFetch((async () => {
      requests++;
      return json({
        error: {
          code: code === 401 ? 'UNAUTHENTICATED' : code === 403 ? 'FORBIDDEN' : 'UNAVAILABLE',
          message: 'Request refused',
          details: {},
          traceId: 'ci-auth-error',
        },
      }, code);
    }) as typeof fetch, async () => {
      await assert.rejects(readTenantSettings('token-A'), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.kind, 'http');
        assert.equal(error.status, code);
        return true;
      });
    });
    assert.equal(requests, 1);
  });
}

test('network failure, abort, and timeout are errors without retries or fake data', async () => {
  for (const reason of ['offline', 'abort']) {
    let calls = 0;
    const controller = new AbortController();
    await withFetch((async (_url, init) => {
      calls++;
      assert.ok(init?.signal instanceof AbortSignal);
      assert.equal(init.signal.aborted, false);
      if (reason === 'abort') {
        controller.abort();
        assert.equal(init.signal.aborted, true, 'caller cancellation reaches network transport');
        throw new DOMException('Abort', 'AbortError');
      }
      throw new TypeError('Network unavailable');
    }) as typeof fetch, async () => {
      await assert.rejects(readTenantSettings('token-A', controller.signal), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.kind, 'network');
        return true;
      });
    });
    assert.equal(calls, 1);
  }
});

test('bounded offline timeout aborts the one real GET rather than retrying', async () => {
  let requests = 0;
  await withFetch((async (_url, init) => {
    requests++;
    assert.ok(init?.signal instanceof AbortSignal);
    return await new Promise<Response>((_resolve, reject) => {
      init.signal.addEventListener('abort', () => {
        reject(new DOMException('Timeout/cancellation', 'AbortError'));
      }, { once: true });
    });
  }) as typeof fetch, async () => {
    await assert.rejects(readTenantSettings('tenant-token', undefined, 5), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.kind, 'network');
      return true;
    });
  });
  assert.equal(requests, 1);
});

test('malformed success envelope, bad catalogue/values, unsupported timezone and HTML fail closed', async () => {
  const invalid: unknown[] = [
    null,
    {},
    { businessName: 'unwrapped' },
    { data: { ...resultA.data, catalogue: [{ ...descriptor, kind: 'WRITER' }] } },
    { data: { ...resultA.data, values: { cash_session_enabled: false } } },
    { data: { ...resultA.data, timezone: 'Not/A_Valid_Zone' } },
    { data: { ...resultA.data, businessName: '' } },
    { data: { ...resultA.data, catalogue: [{ ...descriptor, key: '' }] } },
  ];
  for (const body of invalid) {
    await withFetch((async () => json(body)) as typeof fetch, async () => {
      await assert.rejects(readTenantSettings('token-A'), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.kind, 'protocol');
        return true;
      });
    });
  }
  await withFetch((async () => new Response('<html>Not API</html>', {
    headers: { 'content-type': 'text/html' },
  })) as typeof fetch, async () => {
    await assert.rejects(readTenantSettings('token-A'), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.kind, 'protocol');
      return true;
    });
  });
});

test('redirect cannot silently switch origins or leak authorization', async () => {
  await withFetch((async (_url, init) => {
    assert.equal(init?.redirect, 'error');
    throw new TypeError('Redirect was refused');
  }) as typeof fetch, async () => {
    await assert.rejects(readTenantSettings('token-A'), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.kind, 'network');
      return true;
    });
  });
});


// MOD-001 T01-W/P1: source-matched profile PATCH only. These are intentionally
// red until the approved adapter exists; no cash or generic SettingKey writes.
test('profile PATCH sends only server-verified name/timezone and replaces the complete snapshot', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/settings/business');
    assert.equal(init?.method, 'PATCH');
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.credentials, 'omit');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer verified-A');
    assert.deepEqual(JSON.parse(String(init?.body)), {
      businessName: 'Updated Electrical House',
      timezone: 'Asia/Dhaka',
    });
    return json({ data: { ...resultA.data, businessName: 'Updated Electrical House' } });
  }) as typeof fetch, async () => {
    const saved = await updateBusinessProfile(
      'verified-A', resultA.data as ServerSettings, '  Updated Electrical House  ',
    );
    assert.equal(saved.data.businessName, 'Updated Electrical House');
    assert.deepEqual(saved.data.catalogue, resultA.data.catalogue);
    assert.deepEqual(saved.data.values, resultA.data.values);
  });
  assert.equal(calls, 1);
});

test('profile PATCH refuses invalid names/timezones before making any HTTP request', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(resultA); }) as typeof fetch, async () => {
    for (const name of ['', ' ', 'x', 'x'.repeat(121)]) {
      await assert.rejects(updateBusinessProfile('valid-token', resultA.data as ServerSettings, name));
    }
    const forged = { ...resultA.data, timezone: 'Europe/Paris' } as ServerSettings;
    await assert.rejects(updateBusinessProfile('valid-token', forged, 'Valid Shop'));
    const unsupported = { ...resultA.data, supportedTimezones: ['Europe/Paris'] } as ServerSettings;
    await assert.rejects(updateBusinessProfile('valid-token', unsupported, 'Valid Shop'));
  });
  assert.equal(calls, 0);
});

test('profile PATCH returns errors without retries, fake success or mutated input', async () => {
  for (const status of [401, 403, 422, 500]) {
    let calls = 0;
    await withFetch((async (_url, init) => {
      calls++;
      assert.equal(init?.method, 'PATCH');
      return json({
        error: { code: 'REFUSED', message: 'Save failed', details: {}, traceId: 'save-error' },
      }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(
        updateBusinessProfile('token-A', resultA.data as ServerSettings, 'Valid Business'),
        (error: unknown) => {
          assert.ok(error instanceof ApiError);
          assert.equal(error.kind, 'http');
          assert.equal(error.status, status);
          return true;
        },
      );
    });
    assert.equal(calls, 1);
    assert.equal(resultA.data.businessName, 'Tenant A Electrical');
  }
});

test('profile PATCH rejects malformed success and keeps original server snapshot intact', async () => {
  for (const response of [{ data: { ...resultA.data, values: { cash_session_enabled: false } } },
    { data: { ...resultA.data, timezone: 'bad' } }, { message: 'saved' }]) {
    await withFetch((async () => json(response)) as typeof fetch, async () => {
      await assert.rejects(updateBusinessProfile('token-A', resultA.data as ServerSettings, 'New Name'),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  }
  assert.equal(resultA.data.businessName, 'Tenant A Electrical');
});

test('aborted or timed out profile PATCH remains a single unknown-outcome request', async () => {
  for (const reason of ['abort', 'timeout']) {
    let calls = 0;
    const aborter = new AbortController();
    await withFetch((async (_url, init) => {
      calls++;
      assert.equal(init?.method, 'PATCH');
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
        if (reason === 'abort') aborter.abort();
      });
    }) as typeof fetch, async () => {
      await assert.rejects(
        updateBusinessProfile('token-A', resultA.data as ServerSettings, 'Name Valid', aborter.signal, 5),
        (error: unknown) => error instanceof ApiError && error.kind === 'network',
      );
    });
    assert.equal(calls, 1);
  }
});

test('distinct verified tenant tokens PATCH independently; no POST or fixture fallback', async () => {
  const writes: Record<string, string> = {};
  await withFetch((async (url, init) => {
    assert.equal(String(url), origin + '/api/v1/settings/business');
    assert.equal(init?.method, 'PATCH');
    const token = new Headers(init?.headers).get('Authorization');
    assert.ok(token === 'Bearer token-A' || token === 'Bearer token-B');
    const name = JSON.parse(String(init?.body)).businessName as string;
    writes[token!] = name;
    const base = token === 'Bearer token-A' ? resultA.data : resultB.data;
    return json({ data: { ...base, businessName: name } });
  }) as typeof fetch, async () => {
    const a = await updateBusinessProfile('token-A', resultA.data as ServerSettings, 'Shop A New');
    const b = await updateBusinessProfile('token-B', resultB.data as ServerSettings, 'Shop B New');
    assert.equal(a.data.businessName, 'Shop A New');
    assert.equal(b.data.businessName, 'Shop B New');
    assert.equal(a.data.values.cash_session_enabled, 'off');
    assert.equal(b.data.values.cash_session_enabled, 'on');
  });
  assert.deepEqual(writes, { 'Bearer token-A': 'Shop A New', 'Bearer token-B': 'Shop B New' });
});
