import test from 'node:test';
import assert from 'node:assert/strict';
import { generateOperationId, isOperationId } from '../src/integration/operation.ts';
import { createIntent, transitionIntent } from '../src/integration/intent.ts';

const tenantId = '01JCCQ8MTS8SZ9G3HVJ8D3A7AC';
const userId = '01JCCQ8MTS8SZ9G3HVJ8D3A7AA';
const scope = { tenantId, userId, action: 'purchase.create' };

function usingRandom(byte: number, run: () => void): void {
  const old = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: { getRandomValues: (array: Uint8Array) => { array.fill(byte); return array; } },
  });
  try { run(); }
  finally {
    if (old) Object.defineProperty(globalThis, 'crypto', old);
    else Reflect.deleteProperty(globalThis, 'crypto');
  }
}

test('the first ULID at epoch 0 with zero bytes is exactly 26 zeros', () => {
  usingRandom(0, () => assert.equal(generateOperationId(0), '00000000000000000000000000'));
});

test('ULIDs use 48-bit timestamp, 80-bit randomness, canonical Crockford alphabet', () => {
  const id = generateOperationId(1);
  assert.equal(id.length, 26);
  assert.match(id, /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/);
  assert.equal(isOperationId(id), true);
  assert.equal(id.slice(0, 10), '0000000001');
});

test('same millisecond and clock rollback remain strictly monotonic', () => {
  const a = generateOperationId(2);
  const b = generateOperationId(2);
  const c = generateOperationId(1);
  assert.ok(a < b && b < c);
  assert.equal(new Set([a, b, c]).size, 3);
});

test('new timestamp resets the randomness, while same-time 80-bit overflow throws', () => {
  usingRandom(255, () => {
    const first = generateOperationId(10);
    assert.ok(first.endsWith('ZZZZZZZZZZZZZZZZ'));
    assert.throws(() => generateOperationId(10), /overflow/i);
  });
  const next = generateOperationId(11);
  assert.ok(isOperationId(next));
  assert.ok(next.startsWith('000000000B'));
});

test('validation rejects malformed and noncanonical IDs', () => {
  const bad = [
    '', 'abc', '01ARZ3NDEKTSV4RRFFQ69G5FA', '81ARZ3NDEKTSV4RRFFQ69G5FAV',
    '01arz3ndektsv4rrffq69g5fav', '01ARZ3NDEKTSV4RRFFQ69G5FAI',
    '01ARZ3NDEKTSV4RRFFQ69G5FAL', '01ARZ3NDEKTSV4RRFFQ69G5FAO',
    '01ARZ3NDEKTSV4RRFFQ69G5FAU', '01ARZ3NDEKTSV4RRFFQ69G5FAVV',
  ];
  for (const id of bad) assert.equal(isOperationId(id), false, id);
  assert.equal(isOperationId('01ARZ3NDEKTSV4RRFFQ69G5FAV'), true);
});

test('ULID timestamps reject negative, fractional, nonfinite and out-of-range values', () => {
  for (const time of [-1, 1.5, Number.NaN, Infinity, 281474976710656]) {
    assert.throws(() => generateOperationId(time), RangeError, String(time));
  }
});

test('intent creation produces a valid ID and never points to caller mutable payload', () => {
  const payload = { lines: [{ item: 'wire', quantity: 2 }], payment: { cash: 250 } };
  const intent = createIntent(scope, payload);
  assert.equal(isOperationId(intent.operationId), true);
  assert.equal(intent.tenantId, tenantId);
  assert.equal(intent.userId, userId);
  assert.equal(intent.action, 'purchase.create');
  assert.equal(intent.state, 'ready');
  payload.lines[0]!.quantity = 9;
  payload.payment.cash = 999;
  assert.deepEqual(intent.payload, { lines: [{ item: 'wire', quantity: 2 }], payment: { cash: 250 } });
  assert.equal(Object.isFrozen(intent.payload), true);
  assert.equal(Object.isFrozen(intent.payload.lines), true);
  assert.equal(Object.isFrozen(intent.payload.lines[0]), true);
});

test('ready→sending→unknown→sending→confirmed reuses one operationId and payload', () => {
  const original = createIntent(scope, { amount: 125075, lines: ['wire'] });
  const sending = transitionIntent(original, 'sending');
  const unknown = transitionIntent(sending, 'unknown');
  const again = transitionIntent(unknown, 'sending');
  const confirmed = transitionIntent(again, 'confirmed');
  for (const intent of [sending, unknown, again, confirmed]) {
    assert.equal(intent.operationId, original.operationId);
    assert.equal(intent.payload, original.payload);
    assert.equal(intent.tenantId, original.tenantId);
    assert.equal(intent.userId, original.userId);
    assert.equal(intent.action, original.action);
  }
});

test('duplicate in-flight or confirmed transitions are idempotent and terminal', () => {
  const original = createIntent(scope, { amount: 100 });
  const sending = transitionIntent(original, 'sending');
  assert.equal(transitionIntent(sending, 'sending'), sending);
  assert.equal(transitionIntent(sending, 'confirmed').state, 'confirmed');
  const confirmed = transitionIntent(sending, 'confirmed');
  assert.equal(transitionIntent(confirmed, 'confirmed'), confirmed);
  assert.throws(() => transitionIntent(confirmed, 'sending'), /transition|confirmed|final|invalid/i);
  assert.throws(() => transitionIntent(original, 'confirmed'), /transition|invalid/i);
  assert.throws(() => transitionIntent(original, 'unknown'), /transition|invalid/i);
});

test('uncertain transaction cannot be abandoned by creating a different retry identity', () => {
  const original = createIntent(scope, { amount: 100 });
  const unknown = transitionIntent(transitionIntent(original, 'sending'), 'unknown');
  const retry = transitionIntent(unknown, 'sending');
  assert.equal(retry.operationId, original.operationId);
  assert.deepEqual(retry.payload, original.payload);
  assert.ok(Object.isFrozen(retry.payload));
});

test('intent rejects invalid identity, missing action and non-JSON payload', () => {
  assert.throws(() => createIntent({ ...scope, tenantId: 'sample' }, { amount: 1 }));
  assert.throws(() => createIntent({ ...scope, userId: 'sample' }, { amount: 1 }));
  assert.throws(() => createIntent({ ...scope, action: '' }, { amount: 1 }));
  assert.throws(() => createIntent(scope, { amount: BigInt(5) }));
  const circular: { value?: unknown } = {};
  circular.value = circular;
  assert.throws(() => createIntent(scope, circular));
  assert.throws(() => createIntent(scope, { amount: Number.POSITIVE_INFINITY }));
  assert.throws(() => createIntent(scope, { value: undefined }));
});

test('ULID maximum timestamp is permitted after all other generation tests', () => {
  usingRandom(0, () => {
    const id = generateOperationId(281474976710655);
    assert.equal(id.slice(0, 10), '7ZZZZZZZZZ');
    assert.equal(isOperationId(id), true);
  });
});
