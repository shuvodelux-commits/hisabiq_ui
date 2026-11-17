import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../src/integration/errors.ts';
import {
  isDefinitiveCashRefusal,
  shouldClearPendingCashAfterFailure,
} from '../src/contexts/cashPendingFailure.ts';

const denied = (status: number) =>
  new ApiError('http', `Cash operation refused (${status})`, { status });

test('first explicit HTTP denial may clear an operation never known to have posted', () => {
  for (const status of [400, 401, 403, 404, 409, 422]) {
    assert.equal(isDefinitiveCashRefusal(denied(status)), true, `HTTP ${status}`);
    assert.equal(shouldClearPendingCashAfterFailure(denied(status), false), true,
      `first-refusal HTTP ${status} may clear the pending intent`);
  }
});

test('denied replay after an ambiguous original never discards the original ULID', () => {
  for (const status of [400, 401, 403, 404, 409, 422]) {
    assert.equal(shouldClearPendingCashAfterFailure(denied(status), true), false,
      `HTTP ${status} after lost acknowledgement must retain original intent`);
  }
});

test('network, abort, protocol and server errors remain ambiguous even on first attempt', () => {
  const possibleCommit = [
    new ApiError('network', 'Network request failed'),
    new ApiError('protocol', 'Invalid API response'),
    denied(500), denied(502), denied(503), denied(429),
    new DOMException('Aborted', 'AbortError'),
    new Error('Connection closed'),
  ];
  for (const error of possibleCommit) {
    assert.equal(isDefinitiveCashRefusal(error), false);
    assert.equal(shouldClearPendingCashAfterFailure(error, false), false);
    assert.equal(shouldClearPendingCashAfterFailure(error, true), false);
  }
});

test('a plain Error or invalid status cannot prove a prior transaction did not post', () => {
  assert.equal(shouldClearPendingCashAfterFailure(new Error('Unknown failure'), false), false);
  assert.equal(shouldClearPendingCashAfterFailure(denied(0), false), false);
  assert.equal(shouldClearPendingCashAfterFailure(denied(401), true), false);
});
