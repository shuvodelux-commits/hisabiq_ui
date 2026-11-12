import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { readTenantSettings } from '../src/integration/settings-team.ts';

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
