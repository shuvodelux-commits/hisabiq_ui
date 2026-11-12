import test from 'node:test';
import assert from 'node:assert/strict';
import { SessionStore, SESSION_STORAGE_KEY } from '../src/integration/session.ts';
import { ApiError } from '../src/integration/errors.ts';

const A = '01JCCQ8MTS8SZ9G3HVJ8D3A7AA';
const B = '01JCCQ8MTS8SZ9G3HVJ8D3A7AB';
const TA = '01JCCQ8MTS8SZ9G3HVJ8D3A7AC';
const TB = '01JCCQ8MTS8SZ9G3HVJ8D3A7AD';
const token = (user = A, n = 1) => ({
  data: { accessToken: 'access-' + user + '-' + n, refreshToken: 'refresh-' + user + '-' + n,
    user: { id: user, username: user === A ? 'rahim' : 'karim' } },
});
const who = (user = A) => ({
  data: { tenantId: user === A ? TA : TB, timezone: user === A ? 'Asia/Dhaka' : 'UTC',
    user: { id: user, username: user === A ? 'rahim' : 'karim',
      displayName: user === A ? 'Rahim' : 'Karim', roleName: 'Owner' },
    businessName: user === A ? 'Rahim Store' : 'Karim Store',
    permissions: ['sales.sale.view'], features: ['cash_sessions'] },
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((a, b) => { resolve = a; reject = b; });
  return { promise, resolve, reject };
}
function memoryStorage(initial?: string) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(SESSION_STORAGE_KEY, initial);
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
    removeItem: (key: string) => { data.delete(key); },
  };
}
function fakeClock() {
  let now = 0; let nextId = 1;
  const pending = new Map<number, { at: number; fn: () => void }>();
  const clock = {
    now: () => now,
    setTimeout: (fn: () => void, ms: number) => {
      const id = nextId++; pending.set(id, { at: now + ms, fn }); return id;
    },
    clearTimeout: (id: number) => { pending.delete(id); },
  };
  function advance(ms: number) {
    now += ms;
    for (let limit = 0; limit < 100; limit += 1) {
      const due = [...pending.entries()].filter(([, entry]) => entry.at <= now)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) return;
      pending.delete(due[0]); due[1].fn();
    }
    throw new Error('Timer loop did not settle');
  }
  return { clock, advance };
}
function auth(overrides: Record<string, unknown> = {}) {
  const calls = { login: 0, pin: 0, refresh: 0, me: 0, logout: [] as string[] };
  const api = {
    loginPassword: async (_identifier: string, _password: string, _signal?: AbortSignal) => {
      calls.login += 1; return token();
    },
    loginPin: async (_refresh: string, _pin: string, _signal?: AbortSignal) => {
      calls.pin += 1; return token(A, 3);
    },
    refreshSession: async (_refresh: string, _signal?: AbortSignal) => {
      calls.refresh += 1; return token(A, 2);
    },
    readMyAccess: async (_access: string, _signal?: AbortSignal) => {
      calls.me += 1; return who();
    },
    logoutSession: async (refresh: string, _signal?: AbortSignal) => { calls.logout.push(refresh); },
    ...overrides,
  };
  return { api, calls };
}
const make = (api: object, storage = memoryStorage(), clock = fakeClock().clock) =>
  new SessionStore({ mode: 'connected', api: api as any, storage, clock });

test('preview mode never contacts auth or touches old stored credential', async () => {
  const { api, calls } = auth();
  const storage = memoryStorage(JSON.stringify({ schema: 1, refreshToken: 'old-session' }));
  const store = new SessionStore({ mode: 'preview', api, storage });
  assert.equal(store.getSnapshot().status, 'preview');
  await store.restore();
  assert.equal(store.getSnapshot().status, 'preview');
  assert.equal(calls.refresh, 0);
  assert.equal(calls.me, 0);
  assert.equal(storage.getItem(SESSION_STORAGE_KEY), JSON.stringify({ schema: 1, refreshToken: 'old-session' }));
  store.dispose();
});

test('password login waits for authoritative /me before publishing credentials or tenant', async () => {
  const gate = deferred<ReturnType<typeof who>>();
  const { api, calls } = auth({ readMyAccess: () => { calls.me += 1; return gate.promise; } });
  const storage = memoryStorage(); const store = make(api, storage);
  const operation = store.loginWithPassword('01712345678', 'secret');
  await Promise.resolve(); await Promise.resolve();
  assert.equal(store.getSnapshot().status, 'authenticating');
  assert.equal(storage.getItem(SESSION_STORAGE_KEY), null);
  gate.resolve(who());
  await operation;
  const snapshot = store.getSnapshot();
  assert.equal(snapshot.status, 'authenticated');
  if (snapshot.status !== 'authenticated') throw new Error('auth missing');
  assert.equal(snapshot.userId, A);
  assert.equal(snapshot.tenantId, TA);
  assert.equal(snapshot.timezone, 'Asia/Dhaka');
  assert.equal(snapshot.accessToken, token().data.accessToken);
  assert.deepEqual(snapshot.permissions, ['sales.sale.view']);
  assert.deepEqual(JSON.parse(storage.getItem(SESSION_STORAGE_KEY)!), { schema: 1, refreshToken: token().data.refreshToken });
  assert.equal(calls.me, 1);
  assert.equal('refreshToken' in snapshot, false);
  store.dispose();
});

test('mismatched login and /me users must not authorize a tenant or persist a refresh credential', async () => {
  const { api, calls } = auth({ readMyAccess: async () => who(B) });
  const storage = memoryStorage(); const store = make(api, storage);
  await assert.rejects(store.loginWithPassword('01712345678', 'secret'), (e: unknown) => e instanceof ApiError && e.kind === 'protocol');
  assert.equal(store.getSnapshot().status, 'signed-out');
  assert.equal(storage.getItem(SESSION_STORAGE_KEY), null);
  assert.deepEqual(calls.logout, [token().data.refreshToken]);
  store.dispose();
});

test('failed /me bootstrap revokes the candidate and exposes no user access token', async () => {
  const { api, calls } = auth({ readMyAccess: async () => { throw new ApiError('network', 'connection dropped'); } });
  const store = make(api);
  await assert.rejects(store.loginWithPassword('phone', 'password'));
  assert.equal(store.getSnapshot().status, 'signed-out');
  assert.deepEqual(calls.logout, [token().data.refreshToken]);
  store.dispose();
});

test('late login A cannot overwrite newer signed-in user B', async () => {
  const late = deferred<ReturnType<typeof token>>();
  const { api } = auth({
    loginPassword: (id: string) => id === 'A' ? late.promise : Promise.resolve(token(B)),
    readMyAccess: async (access: string) => access.includes(B) ? who(B) : who(A),
  });
  const store = make(api);
  const first = store.loginWithPassword('A', 'password');
  await Promise.resolve();
  await store.loginWithPassword('B', 'password');
  late.resolve(token(A));
  await first.catch(() => undefined);
  const snapshot = store.getSnapshot();
  assert.equal(snapshot.status, 'authenticated');
  if (snapshot.status === 'authenticated') assert.equal(snapshot.tenantId, TB);
  store.dispose();
});

test('two refresh calls coalesce to one rotating credential and one /me', async () => {
  const gate = deferred<ReturnType<typeof token>>();
  const { api, calls } = auth({ refreshSession: () => { calls.refresh += 1; return gate.promise; } });
  const storage = memoryStorage(); const store = make(api, storage);
  await store.loginWithPassword('phone', 'password');
  const first = store.refresh(); const second = store.refresh();
  await Promise.resolve();
  assert.equal(calls.refresh, 1);
  gate.resolve(token(A, 7));
  await Promise.all([first, second]);
  assert.equal(calls.refresh, 1);
  assert.equal(calls.me, 2);
  assert.deepEqual(JSON.parse(storage.getItem(SESSION_STORAGE_KEY)!), { schema: 1, refreshToken: token(A, 7).data.refreshToken });
  store.dispose();
});

test('refresh refusal 401/403 signs out and never retries an expired credential', async () => {
  for (const status of [401, 403]) {
    const { api, calls } = auth({ refreshSession: async () => { calls.refresh += 1; throw new ApiError('http', 'expired', { status, code: 'UNAUTHENTICATED' }); } });
    const storage = memoryStorage(); const store = make(api, storage);
    await store.loginWithPassword('phone', 'password');
    await assert.rejects(store.refresh());
    assert.equal(calls.refresh, 1);
    assert.equal(store.getSnapshot().status, 'signed-out');
    assert.equal(storage.getItem(SESSION_STORAGE_KEY), null);
    store.dispose();
  }
});

test('network refresh failure preserves private credential but removes access and permissions', async () => {
  const { api } = auth({ refreshSession: async () => { throw new ApiError('network', 'offline'); } });
  const storage = memoryStorage(); const store = make(api, storage);
  await store.loginWithPassword('phone', 'password');
  await assert.rejects(store.refresh());
  const snapshot = store.getSnapshot();
  assert.equal(snapshot.status, 'locked');
  assert.equal('accessToken' in snapshot, false);
  assert.equal('permissions' in snapshot, false);
  assert.ok(storage.getItem(SESSION_STORAGE_KEY)?.includes(token().data.refreshToken));
  store.dispose();
});

test('restore uses only this tab saved refresh token; rotates before next use', async () => {
  const prior = JSON.stringify({ schema: 1, refreshToken: 'prior-tab-token' });
  const storage = memoryStorage(prior);
  const { api, calls } = auth({ refreshSession: async (refresh: string) => {
    calls.refresh += 1; assert.equal(refresh, 'prior-tab-token'); return token(A, 4);
  } });
  const store = make(api, storage);
  await store.restore();
  assert.equal(store.getSnapshot().status, 'authenticated');
  assert.equal(calls.login, 0);
  assert.equal(calls.refresh, 1);
  assert.equal(JSON.parse(storage.getItem(SESSION_STORAGE_KEY)!).refreshToken, token(A, 4).data.refreshToken);
  store.dispose();
});

test('copied tab with rejected refresh signs out; malformed saved value never reaches API', async () => {
  const { api, calls } = auth({ refreshSession: async () => { calls.refresh += 1; throw new ApiError('http', 'revoked', { status: 401 }); } });
  const invalid = memoryStorage('{"schema":2,"refreshToken":"wrong"}');
  const one = make(api, invalid);
  await one.restore();
  assert.equal(calls.refresh, 0);
  assert.equal(one.getSnapshot().status, 'signed-out');
  assert.equal(invalid.getItem(SESSION_STORAGE_KEY), null);
  one.dispose();
  const copied = memoryStorage(JSON.stringify({ schema: 1, refreshToken: 'stale-duplicate-tab' }));
  const two = make(api, copied);
  await two.restore();
  assert.equal(calls.refresh, 1);
  assert.equal(two.getSnapshot().status, 'signed-out');
  assert.equal(copied.getItem(SESSION_STORAGE_KEY), null);
  two.dispose();
});

test('storage blocked retains password login in memory and reports nonpersistent session', async () => {
  const { api } = auth();
  const storage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => { throw new Error('blocked'); } };
  const store = new SessionStore({ mode: 'connected', api, storage });
  await store.loginWithPassword('phone', 'password');
  const snapshot = store.getSnapshot();
  assert.equal(snapshot.status, 'authenticated');
  if (snapshot.status === 'authenticated') assert.equal(snapshot.persistence, 'memory');
  store.dispose();
});

test('PIN requires this tab private credential and exactly six ASCII digits', async () => {
  const { api, calls } = auth();
  const store = make(api);
  await assert.rejects(store.loginWithPin('123456'));
  await assert.rejects(store.loginWithPin('1234'));
  assert.equal(calls.pin, 0);
  await store.loginWithPassword('phone', 'password');
  store.lock();
  await assert.rejects(store.loginWithPin('1234'));
  await assert.rejects(store.loginWithPin('১২৩৪৫৬'));
  assert.equal(calls.pin, 0);
  await store.loginWithPin('123456');
  assert.equal(calls.pin, 1);
  assert.equal(store.getSnapshot().status, 'authenticated');
  store.dispose();
});

test('30 minute idle locks exactly at boundary, activity restarts countdown', async () => {
  const { api } = auth();
  const { clock, advance } = fakeClock();
  const store = make(api, memoryStorage(), clock);
  await store.loginWithPassword('phone', 'password');
  advance(29 * 60_000 + 59_000);
  assert.equal(store.getSnapshot().status, 'authenticated');
  store.recordActivity();
  advance(29 * 60_000 + 59_000);
  assert.equal(store.getSnapshot().status, 'authenticated');
  advance(1_000);
  const locked = store.getSnapshot();
  assert.equal(locked.status, 'locked');
  assert.equal('accessToken' in locked, false);
  assert.equal('permissions' in locked, false);
  store.dispose();
});

test('logout removes identity synchronously and late refresh cannot resurrect it', async () => {
  const gate = deferred<ReturnType<typeof token>>();
  const { api, calls } = auth({ refreshSession: () => { calls.refresh += 1; return gate.promise; } });
  const storage = memoryStorage(); const store = make(api, storage);
  await store.loginWithPassword('phone', 'password');
  const refresh = store.refresh();
  const logout = store.logout();
  assert.equal(store.getSnapshot().status, 'signed-out');
  assert.equal(storage.getItem(SESSION_STORAGE_KEY), null);
  gate.resolve(token(A, 8));
  await Promise.allSettled([refresh, logout]);
  assert.equal(store.getSnapshot().status, 'signed-out');
  assert.equal(storage.getItem(SESSION_STORAGE_KEY), null);
  assert.ok(calls.logout.includes(token().data.refreshToken));
  store.dispose();
});

test('subscribe observes real state changes; dispose aborts stale sign-in', async () => {
  const gate = deferred<ReturnType<typeof token>>();
  const { api } = auth({ loginPassword: (_id: string, _pw: string, signal: AbortSignal) => {
    assert.equal(signal instanceof AbortSignal, true);
    return gate.promise;
  } });
  const store = make(api);
  let notifications = 0;
  const unsubscribe = store.subscribe(() => { notifications++; });
  const login = store.loginWithPassword('phone', 'password');
  assert.equal(store.getSnapshot().status, 'authenticating');
  store.dispose();
  gate.resolve(token());
  await login.catch(() => undefined);
  assert.equal(store.getSnapshot().status === 'authenticated', false);
  assert.ok(notifications > 0);
  unsubscribe();
});

test('offline reload restore remains locked without inventing a verified identity', async () => {
  const storage = memoryStorage(JSON.stringify({ schema: 1, refreshToken: 'saved-tab-refresh' }));
  const { api } = auth({
    refreshSession: async () => { throw new ApiError('network', 'offline'); },
    readMyAccess: async () => { throw new Error('must not bootstrap when refresh fails'); },
  });
  const store = make(api, storage);
  await store.restore();
  const snapshot = store.getSnapshot();
  assert.equal(snapshot.status, 'locked');
  assert.equal('accessToken' in snapshot, false);
  assert.equal('permissions' in snapshot, false);
  assert.equal('userId' in snapshot, false);
  assert.deepEqual(JSON.parse(storage.getItem(SESSION_STORAGE_KEY)!), {
    schema: 1, refreshToken: 'saved-tab-refresh',
  });
  store.dispose();
});

test('new refresh credential survives a temporary /me network failure after server rotation', async () => {
  const requested: string[] = [];
  let seenMe = 0;
  const { api } = auth({
    refreshSession: async (refresh: string) => {
      requested.push(refresh);
      return token(A, requested.length + 1);
    },
    readMyAccess: async () => {
      seenMe += 1;
      if (seenMe === 2) throw new ApiError('network', 'offline bootstrap');
      return who();
    },
  });
  const storage = memoryStorage(); const store = make(api, storage);
  await store.loginWithPassword('phone', 'password');
  await assert.rejects(store.refresh(), (e: unknown) => e instanceof ApiError && e.kind === 'network');
  assert.equal(store.getSnapshot().status, 'locked');
  assert.equal(JSON.parse(storage.getItem(SESSION_STORAGE_KEY)!).refreshToken, token(A, 2).data.refreshToken);
  await store.refresh();
  assert.deepEqual(requested, [token().data.refreshToken, token(A, 2).data.refreshToken]);
  assert.equal(store.getSnapshot().status, 'authenticated');
  store.dispose();
});

test('missing server profile during refresh is a hard sign-out, not a reusable offline lock', async () => {
  let readCount = 0;
  const { api } = auth({
    readMyAccess: async () => {
      readCount += 1;
      if (readCount > 1) throw new ApiError('http', 'Business profile not found', { status: 404, code: 'NOT_FOUND' });
      return who();
    },
  });
  const storage = memoryStorage(); const store = make(api, storage);
  await store.loginWithPassword('phone', 'password');
  await assert.rejects(store.refresh(), (e: unknown) => e instanceof ApiError && e.status === 404);
  assert.equal(store.getSnapshot().status, 'signed-out');
  assert.equal(storage.getItem(SESSION_STORAGE_KEY), null);
  store.dispose();
});
