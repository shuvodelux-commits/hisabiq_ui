import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import { loginPassword, loginPin, refreshSession, logoutSession, readMyAccess } from '../src/integration/auth.ts';

const origin = 'https://hisabiq.test';
const userId = '01JCCQ8MTS8SZ9G3HVJ8D3A7AA';
const tenantId = '01JCCQ8MTS8SZ9G3HVJ8D3A7AB';
const loginEnvelope = {
  data: {
    accessToken: 'access-token-1',
    refreshToken: 'refresh-token-1',
    user: { id: userId, username: 'rahim' },
  },
};
const accessEnvelope = {
  data: {
    tenantId,
    timezone: 'Asia/Dhaka',
    user: { id: userId, username: 'rahim', displayName: 'Rahim', roleName: 'Owner' },
    businessName: 'Rahim Store',
    permissions: ['sales.sale.view', 'sales.sale.create'],
    features: ['cash_sessions'],
  },
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

async function withFetch(fake: typeof fetch, run: () => Promise<void>): Promise<void> {
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

function assertRequest(url: URL | RequestInfo, init: RequestInit | undefined, path: string, body?: unknown): void {
  assert.equal(String(url), `${origin}${path}`);
  assert.equal(init?.method, body === undefined ? 'GET' : 'POST');
  assert.equal(init?.redirect, 'error');
  if (body !== undefined) assert.deepEqual(JSON.parse(String(init?.body)), body);
}

test('password login posts the Nest body without bearer and returns the full envelope', async () => {
  await withFetch((async (url, init) => {
    assertRequest(url, init, '/api/v1/auth/login', { identifier: '01712345678', password: 'correct password' });
    assert.equal(new Headers(init?.headers).has('Authorization'), false);
    return json(loginEnvelope);
  }) as typeof fetch, async () => {
    assert.deepEqual(await loginPassword('01712345678', 'correct password'), loginEnvelope);
  });
});

test('PIN login posts prior refresh credential and PIN without bearer', async () => {
  await withFetch((async (url, init) => {
    assertRequest(url, init, '/api/v1/auth/login/pin', { refreshToken: 'refresh-before-pin', pin: '123456' });
    assert.equal(new Headers(init?.headers).has('Authorization'), false);
    return json(loginEnvelope);
  }) as typeof fetch, async () => {
    assert.deepEqual(await loginPin('refresh-before-pin', '123456'), loginEnvelope);
  });
});

test('refresh posts the rotating credential without bearer and retains full envelope', async () => {
  await withFetch((async (url, init) => {
    assertRequest(url, init, '/api/v1/auth/refresh', { refreshToken: 'refresh-before-rotation' });
    assert.equal(new Headers(init?.headers).has('Authorization'), false);
    return json(loginEnvelope);
  }) as typeof fetch, async () => {
    assert.deepEqual(await refreshSession('refresh-before-rotation'), loginEnvelope);
  });
});

test('logout posts refresh credential without bearer and returns void on 204', async () => {
  await withFetch((async (url, init) => {
    assertRequest(url, init, '/api/v1/auth/logout', { refreshToken: 'refresh-to-revoke' });
    assert.equal(new Headers(init?.headers).has('Authorization'), false);
    return new Response(null, { status: 204 });
  }) as typeof fetch, async () => {
    assert.equal(await logoutSession('refresh-to-revoke'), undefined);
  });
});

test('/me sends only explicit bearer and returns the full authoritative envelope', async () => {
  await withFetch((async (url, init) => {
    assertRequest(url, init, '/api/v1/me');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer access-for-me');
    assert.equal(init?.body, undefined);
    return json(accessEnvelope);
  }) as typeof fetch, async () => {
    assert.deepEqual(await readMyAccess('access-for-me'), accessEnvelope);
  });
});

test('auth adapters pass caller AbortSignal through to fetch', async () => {
  const controller = new AbortController();
  await withFetch((async (_url, init) => {
    assert.equal(init?.signal, controller.signal);
    return json(loginEnvelope);
  }) as typeof fetch, async () => {
    assert.deepEqual(await loginPassword('01712345678', 'password', controller.signal), loginEnvelope);
  });
});

test('malformed login envelope, tokens and user ULID are protocol errors before any storage write', async () => {
  const malformed = [
    loginEnvelope.data,
    { data: null },
    { data: { ...loginEnvelope.data, accessToken: '' } },
    { data: { ...loginEnvelope.data, accessToken: '   ' } },
    { data: { ...loginEnvelope.data, accessToken: 'access token' } },
    { data: { ...loginEnvelope.data, accessToken: 'abc\n123' } },
    { data: { ...loginEnvelope.data, refreshToken: 'refresh\tbad' } },
    { data: { ...loginEnvelope.data, refreshToken: '' } },
    { data: { ...loginEnvelope.data, user: { ...loginEnvelope.data.user, id: 'not-a-ulid' } } },
    { data: { ...loginEnvelope.data, user: { ...loginEnvelope.data.user, id: '8' + userId.slice(1) } } },
  ];
  const previousStorage = (globalThis as any).sessionStorage;
  let writes = 0;
  (globalThis as any).sessionStorage = { setItem: () => { writes += 1; } };
  try {
    for (const body of malformed) {
      await withFetch((async () => json(body)) as typeof fetch, async () => {
        await assert.rejects(loginPassword('01712345678', 'password'),
          (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
      });
    }
    assert.equal(writes, 0);
  } finally {
    if (previousStorage === undefined) delete (globalThis as any).sessionStorage;
    else (globalThis as any).sessionStorage = previousStorage;
  }
});

test('refresh and PIN reject malformed login responses too', async () => {
  const malformed = { data: { ...loginEnvelope.data, refreshToken: null } };
  await withFetch((async () => json(malformed)) as typeof fetch, async () => {
    for (const call of [() => refreshSession('prior'), () => loginPin('prior', '123456')]) {
      await assert.rejects(call(), (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    }
  });
});

test('/me rejects missing or invalid canonical tenant and user ULIDs', async () => {
  const bad = [
    { ...accessEnvelope.data, tenantId: undefined },
    { ...accessEnvelope.data, tenantId: 'not-a-ulid' },
    { ...accessEnvelope.data, tenantId: '8' + tenantId.slice(1) },
    { ...accessEnvelope.data, user: { ...accessEnvelope.data.user, id: 'not-a-ulid' } },
  ];
  for (const data of bad) {
    await withFetch((async () => json({ data })) as typeof fetch, async () => {
      await assert.rejects(readMyAccess('access'), (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  }
});

test('/me accepts real IANA timezone and rejects unknown timezone', async () => {
  await withFetch((async () => json({ data: { ...accessEnvelope.data, timezone: 'America/New_York' } })) as typeof fetch, async () => {
    assert.equal((await readMyAccess('access')).data.timezone, 'America/New_York');
  });
  for (const timezone of ['', 'GMT', 'Mars/Olympus', 'Asia/Not_Dhaka', 6]) {
    await withFetch((async () => json({ data: { ...accessEnvelope.data, timezone } })) as typeof fetch, async () => {
      await assert.rejects(readMyAccess('access'), (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  }
});

test('/me rejects malformed permission and feature arrays and malformed envelope', async () => {
  const bad = [
    accessEnvelope.data,
    { data: null },
    { data: { ...accessEnvelope.data, permissions: 'sales.sale.view' } },
    { data: { ...accessEnvelope.data, permissions: ['sales.sale.view', 7] } },
    { data: { ...accessEnvelope.data, features: null } },
    { data: { ...accessEnvelope.data, features: ['cash_sessions', false] } },
  ];
  for (const body of bad) {
    await withFetch((async () => json(body)) as typeof fetch, async () => {
      await assert.rejects(readMyAccess('access'), (error: unknown) => error instanceof ApiError && error.kind === 'protocol');
    });
  }
});

test('401 and 403 Nest errors preserve status, code, message, details and traceId', async () => {
  for (const [status, code, call] of [
    [401, 'UNAUTHENTICATED', () => readMyAccess('expired')],
    [403, 'FORBIDDEN', () => loginPin('revoked', '123456')],
  ] as const) {
    const body = { error: { code, message: `Denied ${status}`, details: { reason: 'credential' }, traceId: `trace-${status}` } };
    await withFetch((async () => json(body, status)) as typeof fetch, async () => {
      await assert.rejects(call(), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.kind, 'http');
        assert.equal(error.status, status);
        assert.equal(error.code, code);
        assert.equal(error.message, `Denied ${status}`);
        assert.deepEqual(error.details, { reason: 'credential' });
        assert.equal(error.traceId, `trace-${status}`);
        return true;
      });
    });
  }
});
