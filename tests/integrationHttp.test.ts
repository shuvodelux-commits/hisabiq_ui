import test from 'node:test';
import assert from 'node:assert/strict';
import { readIntegrationMode } from '../src/integration/config.ts';
import { ApiError } from '../src/integration/errors.ts';
import { requestJson } from '../src/integration/http.ts';

const origin = 'https://hisabiq.test';

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

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function failIfFetched(): typeof fetch {
  return (async () => { throw new Error('fetch must not be called'); }) as typeof fetch;
}

test('integration mode defaults to preview and rejects invalid configuration without storage or network', async () => {
  const previousStorage = (globalThis as any).localStorage;
  (globalThis as any).localStorage = new Proxy({}, { get: () => { throw new Error('storage read'); } });
  try {
    await withFetch(failIfFetched(), async () => {
      assert.equal(readIntegrationMode(undefined), 'preview');
      assert.equal(readIntegrationMode('preview'), 'preview');
      assert.equal(readIntegrationMode('connected'), 'connected');
      for (const value of ['', 'Preview', 'live', ' connected ']) {
        assert.throws(() => readIntegrationMode(value), /invalid|mode|configuration/i);
      }
    });
  } finally {
    if (previousStorage === undefined) delete (globalThis as any).localStorage;
    else (globalThis as any).localStorage = previousStorage;
  }
});

test('requestJson gives the decoder the complete day status envelope', async () => {
  const envelope = { data: { date: '2026-11-12', status: 'OPEN' } };
  await withFetch((async (url, init) => {
    assert.equal(String(url), `${origin}/api/v1/daybook/status`);
    assert.equal(init?.method, 'GET');
    assert.equal(init?.redirect, 'error');
    return json(envelope);
  }) as typeof fetch, async () => {
    const result = await requestJson({ method: 'GET', path: '/api/v1/daybook/status' }, raw => {
      assert.deepEqual(raw, envelope);
      return raw;
    });
    assert.deepEqual(result, envelope);
  });
});

test('requestJson preserves list, page and summary instead of globally unwrapping data', async () => {
  const envelope = { data: [{ id: '01' }], page: { cursor: 'next', hasMore: true }, summary: { total: 7 } };
  await withFetch((async () => json(envelope)) as typeof fetch, async () => {
    assert.deepEqual(await requestJson({ method: 'GET', path: '/api/v1/parties' }, raw => raw), envelope);
  });
});

test('204 returns void without parsing or calling the decoder', async () => {
  await withFetch((async () => new Response(null, { status: 204 })) as typeof fetch, async () => {
    let decoded = false;
    const result = await requestJson({ method: 'POST', path: '/api/v1/auth/logout' }, () => {
      decoded = true;
      throw new Error('decoder called');
    });
    assert.equal(result, undefined);
    assert.equal(decoded, false);
  });
});

test('HTML 200 is a protocol error and never reaches the endpoint decoder', async () => {
  await withFetch((async () => new Response('<html>login</html>', { status: 200, headers: { 'content-type': 'text/html' } })) as typeof fetch, async () => {
    let decoded = false;
    await assert.rejects(requestJson({ method: 'GET', path: '/api/v1/me' }, () => {
      decoded = true;
      return null;
    }), (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    assert.equal(decoded, false);
  });
});

test('HTTP error keeps status, code, message, details and traceId', async () => {
  const body = { error: { code: 'PERIOD_CLOSED', message: 'Day is closed', details: { reason: 'closed day' }, traceId: 'trace-409' } };
  await withFetch((async () => json(body, 409)) as typeof fetch, async () => {
    await assert.rejects(requestJson({ method: 'POST', path: '/api/v1/daybook/close' }, raw => raw), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.kind, 'http');
      assert.equal(error.status, 409);
      assert.equal(error.code, 'PERIOD_CLOSED');
      assert.equal(error.message, 'Day is closed');
      assert.deepEqual(error.details, { reason: 'closed day' });
      assert.equal(error.traceId, 'trace-409');
      return true;
    });
  });
});

test('malformed HTTP errors retain status but use a static safe message', async () => {
  for (const response of [
    new Response('<script>secret-token</script>', { status: 500, headers: { 'content-type': 'text/html' } }),
    json({ error: { message: 'secret-token', details: ['not-a-record'] } }, 500),
  ]) {
    await withFetch((async () => response) as typeof fetch, async () => {
      await assert.rejects(requestJson({ method: 'GET', path: '/api/v1/me' }, raw => raw), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.kind, 'http');
        assert.equal(error.status, 500);
        assert.doesNotMatch(error.message, /secret-token|script/i);
        assert.equal(error.code, undefined);
        assert.equal(error.traceId, undefined);
        return true;
      });
    });
  }
});

test('only same-origin api/v1 paths are accepted before fetch', async () => {
  const invalid = [
    'https://hisabiq.test/api/v1/me', 'https://foreign.test/api/v1/me',
    '//foreign.test/api/v1/me', '/api/v2/me', '/api/v1',
    '/api/v1/../me', '/api/v1/%2e%2e/me', '/api/v1/%2F%2E%2E/me',
    '/api/v1/me#fragment', '/api/v1/me\\other', '/api/v1/me\nother',
    '/api/v1/me%00',
  ];
  await withFetch(failIfFetched(), async () => {
    for (const path of invalid) {
      await assert.rejects(requestJson({ method: 'GET', path: path as `/api/v1/${string}` }, raw => raw),
        (error: unknown) => error instanceof ApiError && error.kind === 'protocol', path);
    }
  });
});

test('fetch is instructed to refuse redirects and explicit auth and operation ID are forwarded once', async () => {
  await withFetch((async (url, init) => {
    assert.equal(String(url), `${origin}/api/v1/sales`);
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.method, 'POST');
    const headers = new Headers(init?.headers);
    assert.equal(headers.get('Authorization'), 'Bearer access-123');
    assert.equal(headers.get('Idempotency-Key'), '01JCCQ8MTS8SZ9G3HVJ8D3A7AA');
    assert.deepEqual(JSON.parse(String(init?.body)), { amount: 125 });
    return json({ data: { id: 'sale-1' } });
  }) as typeof fetch, async () => {
    assert.deepEqual(await requestJson({ method: 'POST', path: '/api/v1/sales', body: { amount: 125 }, accessToken: 'access-123', operationId: '01JCCQ8MTS8SZ9G3HVJ8D3A7AA' }, raw => raw), { data: { id: 'sale-1' } });
  });
});

test('conflicting caller Authorization header is rejected before fetch', async () => {
  await withFetch(failIfFetched(), async () => {
    await assert.rejects(requestJson({ method: 'GET', path: '/api/v1/me', accessToken: 'right', headers: { Authorization: 'Bearer wrong' } } as any, raw => raw),
      (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
  });
});

test('POST timeout or abort is a network error with exactly one fetch and unchanged operation ID', async () => {
  let calls = 0;
  const controller = new AbortController();
  await withFetch((async (_url, init) => {
    calls += 1;
    assert.equal(init?.signal, controller.signal);
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), '01JCCQ8MTS8SZ9G3HVJ8D3A7AA');
    throw new DOMException('The operation was aborted', 'AbortError');
  }) as typeof fetch, async () => {
    await assert.rejects(requestJson({ method: 'POST', path: '/api/v1/sales', body: { amount: 125 }, operationId: '01JCCQ8MTS8SZ9G3HVJ8D3A7AA', signal: controller.signal }, raw => raw),
      (error: unknown) => error instanceof ApiError && error.kind === 'network');
    assert.equal(calls, 1);
  });
});

test('a caller AbortSignal is passed through without replacing it', async () => {
  const controller = new AbortController();
  await withFetch((async (_url, init) => {
    assert.equal(init?.signal, controller.signal);
    controller.abort();
    throw new DOMException('Aborted', 'AbortError');
  }) as typeof fetch, async () => {
    await assert.rejects(requestJson({ method: 'GET', path: '/api/v1/me', signal: controller.signal }, raw => raw),
      (error: unknown) => error instanceof ApiError && error.kind === 'network');
    assert.equal(controller.signal.aborted, true);
  });
});
