/** MOD-004 T21-R (#672): V2 Party mutations require a real minimal receipt. */
import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '../src/integration/errors.ts';
import { requestJson } from '../src/integration/http.ts';
import { createTradingPartyV2 } from '../src/integration/party-v2-create.ts';
import { editTradingPartyNamePhoneV2 } from '../src/integration/party-v2-edit.ts';
import { setTradingPartyStatusV2 } from '../src/integration/party-v2-status.ts';

const origin = 'https://hisabiq-mod004-204.test';
const partyId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const operationId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const createBody = {
  selectedRole: 'CUSTOMER' as const,
  name: 'নতুন ক্রেতা', roles: ['CUSTOMER'] as Array<'CUSTOMER'>,
  phone: '01712345678', address: null, guardianName: null,
  nid: null, email: null, notes: null, customerGroupId: null,
  creditLimitMinor: null,
};
const editBody = { selectedRole: 'SUPPLIER' as const, version: 1, name: 'নাম সংশোধন', phone: null };
const statusBody = { selectedRole: 'CUSTOMER' as const, version: 2, status: 'INACTIVE' as const };

async function withFetch(fake: typeof fetch, run: () => Promise<void>): Promise<void> {
  const previousFetch = globalThis.fetch;
  const previousWindow = (globalThis as any).window;
  const previousLocation = (globalThis as any).location;
  (globalThis as any).fetch = fake;
  (globalThis as any).window = { location: { origin } };
  (globalThis as any).location = { origin };
  try { await run(); }
  finally {
    (globalThis as any).fetch = previousFetch;
    if (previousWindow === undefined) delete (globalThis as any).window;
    else (globalThis as any).window = previousWindow;
    if (previousLocation === undefined) delete (globalThis as any).location;
    else (globalThis as any).location = previousLocation;
  }
}
function protocol(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'protocol';
}
function noContent(): Response {
  return new Response(null, { status: 204 });
}

test('V2 Party CREATE rejects HTTP 204 missing receipt, keeping the original intent and one request', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls += 1;
    assert.equal(String(url), origin + '/api/v2/parties');
    assert.equal(init?.method, 'POST');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-A');
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), operationId);
    assert.deepEqual(JSON.parse(String(init?.body)), createBody);
    return noContent();
  }) as typeof fetch, async () => {
    await assert.rejects(createTradingPartyV2('tenant-A', operationId, createBody), protocol);
  });
  assert.equal(calls, 1);
});

test('V2 Party name/phone PATCH rejects HTTP 204 and never retries or adds idempotency key', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls += 1;
    assert.equal(String(url), origin + '/api/v2/parties/' + partyId);
    assert.equal(init?.method, 'PATCH');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-B');
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), null);
    assert.deepEqual(JSON.parse(String(init?.body)), editBody);
    return noContent();
  }) as typeof fetch, async () => {
    await assert.rejects(editTradingPartyNamePhoneV2('tenant-B', partyId, editBody), protocol);
  });
  assert.equal(calls, 1);
});

test('V2 identity-wide status rejects HTTP 204 for both mutation and possible no-op', async () => {
  for (const version of [2, 3]) {
    let calls = 0;
    await withFetch((async (url, init) => {
      calls += 1;
      assert.equal(String(url), origin + '/api/v2/parties/' + partyId + '/status');
      assert.equal(init?.method, 'POST');
      assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-C');
      assert.equal(new Headers(init?.headers).get('Idempotency-Key'), null);
      assert.deepEqual(JSON.parse(String(init?.body)), { ...statusBody, version });
      return noContent();
    }) as typeof fetch, async () => {
      await assert.rejects(setTradingPartyStatusV2(
        'tenant-C', partyId, { ...statusBody, version },
      ), protocol);
    });
    assert.equal(calls, 1);
  }
});

test('raw V2 write response 204 never calls its decoder and cannot return a false success', async () => {
  let calls = 0;
  let decoded = false;
  await withFetch((async () => { calls += 1; return noContent(); }) as typeof fetch, async () => {
    await assert.rejects(requestJson({
      method: 'POST', path: '/api/v2/parties/' + partyId + '/status',
      accessToken: 'tenant-C', body: statusBody,
    }, () => { decoded = true; return { incorrectlyAccepted: true }; }), protocol);
  });
  assert.equal(calls, 1);
  assert.equal(decoded, false);
});

test('legacy V1 DELETE and logout POST retain their valid 204 void response semantics', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls += 1;
    assert.equal(new URL(String(url)).origin, origin);
    assert.ok(String(url).startsWith(origin + '/api/v1/'));
    assert.ok(init?.method === 'DELETE' || init?.method === 'POST');
    return noContent();
  }) as typeof fetch, async () => {
    for (const input of [
      { method: 'DELETE' as const, path: '/api/v1/parties/' + partyId as `/api/v1/${string}` },
      { method: 'POST' as const, path: '/api/v1/auth/logout' as const },
    ]) {
      let decoded = false;
      const result = await requestJson(input, () => { decoded = true; return 'incorrect'; });
      assert.equal(result, undefined);
      assert.equal(decoded, false);
    }
  });
  assert.equal(calls, 2);
});
