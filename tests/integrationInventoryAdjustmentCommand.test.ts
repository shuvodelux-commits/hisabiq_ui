import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  decodeInventoryAdjustmentResponse,
  submitInventoryAdjustment,
  validateInventoryAdjustmentCommand,
} from '../src/integration/inventory-adjustment-command.ts';

const origin = 'https://hisabiq-inventory.test';
const productId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const locationId = '01ARZ3NDEKTSV4RRFFQ69G5FAW';
const adjustmentId = '01ARZ3NDEKTSV4RRFFQ69G5FAX';
const operationId = '01ARZ3NDEKTSV4RRFFQ69G5FAY';
const command = {
  productId, qtyDelta: -1250, reason: 'DAMAGE', note: 'Damaged wire',
  businessDate: '2026-11-16',
};
const record = {
  id: adjustmentId, number: 'ADJ-008', productId, productName: 'Copper wire',
  locationId, locationName: 'Main store', qtyDelta: -1250,
  direction: 'OUT', qty: 1250, reason: 'DAMAGE', note: 'Damaged wire',
  businessDate: '2026-11-16', qtyOnHandAfter: 3750,
};
const response = { data: record };
function json(value: unknown, status = 201): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { 'content-type': 'application/json' },
  });
}
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
  assert.ok(error instanceof ApiError);
  assert.equal(error.kind, 'protocol');
  return true;
}

test('signed scale-3 DAMAGE sends exact scoped POST, one caller-owned operation key and decodes sourced document', async () => {
  let calls = 0;
  await withFetch((async (url, init) => {
    calls++;
    assert.equal(String(url), origin + '/api/v1/inventory/adjustments');
    assert.equal(init?.method, 'POST');
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer tenant-owner');
    assert.equal(new Headers(init?.headers).get('Idempotency-Key'), operationId);
    assert.equal(new Headers(init?.headers).get('Content-Type'), 'application/json');
    assert.deepEqual(JSON.parse(String(init?.body)), command);
    return json(response);
  }) as typeof fetch, async () => {
    const result = await submitInventoryAdjustment('tenant-owner', operationId, command);
    assert.equal(result.data.id, adjustmentId);
    assert.equal(result.data.productId, productId);
    assert.equal(result.data.locationId, locationId);
    assert.equal(result.data.qtyDelta, -1250);
    assert.equal(result.data.qtyOnHandAfter, 3750);
    assert.equal(result.data.direction, 'OUT');
    assert.equal(result.data.number, 'ADJ-008');
    assert.equal(Object.hasOwn(result.data, 'valueMinor'), false);
    assert.deepEqual(command, {
      productId, qtyDelta: -1250, reason: 'DAMAGE', note: 'Damaged wire',
      businessDate: '2026-11-16',
    });
  });
  assert.equal(calls, 1);
});

test('positive RECOUNT and zero valued cost preserve server facts, including cost exactly zero', async () => {
  const input = { productId, qtyDelta: 1250, reason: 'RECOUNT', note: null };
  const server = { ...record, qtyDelta: 1250, qty: 1250, direction: 'IN',
    reason: 'RECOUNT', note: null, valueMinor: 0 };
  await withFetch((async (_url, init) => {
    assert.deepEqual(JSON.parse(String(init?.body)), input);
    return json({ data: server });
  }) as typeof fetch, async () => {
    const result = await submitInventoryAdjustment('tenant-owner', operationId, input);
    assert.equal(result.data.direction, 'IN');
    assert.equal(result.data.valueMinor, 0);
    assert.equal(Object.hasOwn(result.data, 'businessDate'), true);
  });
});

test('command schema is strict: reject invalid fields, units, zero, non-ULID, dates and currencies before fetch', async () => {
  const invalid: unknown[] = [
    null, [], {}, { ...command, productId: 'tenant-other' },
    { ...command, qtyDelta: 0 }, { ...command, qtyDelta: 0.5 },
    { ...command, qtyDelta: '1500' }, { ...command, qtyDelta: Number.MAX_SAFE_INTEGER + 1 },
    { ...command, qtyDelta: Number.POSITIVE_INFINITY },
    { ...command, reason: 'SET_EXACT' }, { ...command, reason: 'Other' },
    { ...command, note: 13 }, { ...command, note: 'x'.repeat(501) },
    { ...command, businessDate: '2026-02-30' }, { ...command, businessDate: '2026-11-16T00:00Z' },
    { ...command, businessDate: null }, { ...command, note: undefined },
    { ...command, lotId: locationId }, { ...command, serialNumbers: ['S1'] },
    { ...command, amountMinor: 500 }, { ...command, ownerType: 'VENDOR' },
    { ...command, exactStock: 1500 }, { ...command, mode: 'Set exact stock' },
  ];
  let calls = 0;
  await withFetch((async () => { calls++; return json(response); }) as typeof fetch, async () => {
    for (const bad of invalid) {
      await assert.rejects(submitInventoryAdjustment('token', operationId, bad), protocol);
    }
  });
  assert.equal(calls, 0);
});

test('command validation snapshots allowed payload and does not silently invent a business date', () => {
  const before = { productId, qtyDelta: 1000, reason: 'OTHER', note: null };
  const validated = validateInventoryAdjustmentCommand(before);
  assert.deepEqual(validated, before);
  assert.equal(Object.hasOwn(validated, 'businessDate'), false);
  assert.notEqual(validated, before);
});

test('bad bearer, operation ULID and timeout are rejected without POST', async () => {
  let calls = 0;
  await withFetch((async () => { calls++; return json(response); }) as typeof fetch, async () => {
    await assert.rejects(submitInventoryAdjustment('bad bearer', operationId, command), protocol);
    await assert.rejects(submitInventoryAdjustment('', operationId, command), protocol);
    await assert.rejects(submitInventoryAdjustment('token', 'uuid-not-ulid', command), protocol);
    await assert.rejects(submitInventoryAdjustment('token', operationId, command, undefined, 0), protocol);
    await assert.rejects(submitInventoryAdjustment('token', operationId, command, undefined, NaN), protocol);
  });
  assert.equal(calls, 0);
});

test('reject untrusted source envelopes, cost leakage, inconsistent quantity/reason or foreign product', () => {
  const bad: unknown[] = [
    record, { ...response, meta: {} }, { data: { ...record, extra: 'secret' } },
    { data: { ...record, productId: locationId } },
    { data: { ...record, qtyDelta: -1000 } },
    { data: { ...record, reason: 'OTHER' } },
    { data: { ...record, direction: 'IN' } },
    { data: { ...record, qty: 1000 } },
    { data: { ...record, locationId: 'not-ulid' } },
    { data: { ...record, id: 'fake' } },
    { data: { ...record, valueMinor: null } },
    { data: { ...record, valueMinor: 2.5 } },
    { data: { ...record, valueMinor: '500' } },
    { data: { ...record, qtyOnHandAfter: Number.NaN } },
    { data: { ...record, businessDate: '2026-13-01' } },
    { data: { ...record, note: undefined } },
  ];
  for (const body of bad) {
    assert.throws(() => decodeInventoryAdjustmentResponse(body, command), protocol);
  }
});

test('HTTP 401/403/404/409/422/500 preserve one response and never silently fallback to preview or retry', async () => {
  for (const status of [401, 403, 404, 409, 422, 500]) {
    let calls = 0;
    await withFetch((async () => {
      calls++;
      return json({ error: { code: 'REJECTED', message: 'Not authorized to adjust',
        details: {}, traceId: 'trace-real' } }, status);
    }) as typeof fetch, async () => {
      await assert.rejects(submitInventoryAdjustment('tenant-A', operationId, command), (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.kind, 'http');
        assert.equal(error.status, status);
        assert.equal(error.code, 'REJECTED');
        return true;
      });
    });
    assert.equal(calls, 1);
  }
});

test('lost ACK and explicit same-key replay use same immutable request; no automatic retry or new identity', async () => {
  const seen: Array<{ id: string | null; body: unknown }> = [];
  await withFetch((async (_url, init) => {
    seen.push({ id: new Headers(init?.headers).get('Idempotency-Key'), body: JSON.parse(String(init?.body)) });
    if (seen.length === 1) throw new TypeError('ACK lost after server commit');
    return json(response);
  }) as typeof fetch, async () => {
    await assert.rejects(submitInventoryAdjustment('token', operationId, command),
      (error: unknown) => error instanceof ApiError && error.kind === 'network');
    const replay = await submitInventoryAdjustment('token', operationId, command);
    assert.equal(replay.data.id, adjustmentId);
  });
  assert.equal(seen.length, 2);
  assert.deepEqual(seen[0], seen[1]);
  assert.equal(seen[0]?.id, operationId);
});

test('reusing operation ID with changed command exposes server conflict and never invents another key', async () => {
  const seen: string[] = [];
  await withFetch((async (_url, init) => {
    seen.push(new Headers(init?.headers).get('Idempotency-Key') ?? '');
    return json({ error: { code: 'IDEMPOTENCY_CONFLICT', message: 'Changed payload',
      details: {}, traceId: 'conflict-trace' } }, 409);
  }) as typeof fetch, async () => {
    await assert.rejects(submitInventoryAdjustment('token', operationId,
      { ...command, qtyDelta: -1000 }), (error: unknown) =>
        error instanceof ApiError && error.kind === 'http' && error.status === 409);
  });
  assert.deepEqual(seen, [operationId]);
});

test('abort/timeout fail as unknown network outcome, without hidden second POST', async () => {
  const controller = new AbortController();
  let calls = 0;
  await withFetch((async (_url, init) => {
    calls++;
    return new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () =>
        reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
  }) as typeof fetch, async () => {
    await assert.rejects(submitInventoryAdjustment('token', operationId, command, undefined, 5),
      (error: unknown) => error instanceof ApiError && error.kind === 'network');
    controller.abort();
    await assert.rejects(submitInventoryAdjustment('token', operationId, command, controller.signal),
      (error: unknown) => error instanceof ApiError && error.kind === 'network');
  });
  assert.equal(calls, 1);
});
