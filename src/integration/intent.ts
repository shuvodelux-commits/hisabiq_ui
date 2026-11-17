import { generateOperationId, isOperationId } from './operation.ts';

export type IntentState = 'ready' | 'sending' | 'unknown' | 'confirmed';

export type IntentScope = {
  tenantId: string;
  userId: string;
  action: string;
};

export type PendingIntent<T> = {
  readonly operationId: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly action: string;
  readonly payload: T;
  readonly state: IntentState;
};

function immutable<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) immutable(child);
    Object.freeze(value);
  }
  return value;
}

function jsonSnapshot<T>(payload: T): T {
  // Clone once so subsequent edits of the form/cart cannot alter a previously
  // reviewed financial operation. Reject lossy JSON conversions explicitly.
  const json = JSON.stringify(payload, (_key, value: unknown) => {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new TypeError('Non-finite value in financial intent');
    }
    if (value === undefined || typeof value === 'function' ||
        typeof value === 'symbol' || typeof value === 'bigint') {
      throw new TypeError('Non-JSON value in financial intent');
    }
    return value;
  });
  if (typeof json !== 'string') throw new TypeError('Intent payload must be JSON');
  const copy: T = JSON.parse(json) as T;
  return immutable(copy);
}

/**
 * Called once at a reviewed operation boundary; does not post or queue.
 * The caller must retain this object for retries and server reconciliation.
 */
export function createIntent<T>(scope: IntentScope, payload: T): PendingIntent<T> {
  if (!scope || !isOperationId(scope.tenantId) || !isOperationId(scope.userId) ||
      typeof scope.action !== 'string' || scope.action.trim().length === 0) {
    throw new TypeError('Invalid transaction intent scope');
  }
  const snapshot = jsonSnapshot(payload);
  return Object.freeze({
    operationId: generateOperationId(),
    tenantId: scope.tenantId,
    userId: scope.userId,
    action: scope.action,
    payload: snapshot,
    state: 'ready' as const,
  });
}

const ALLOWED_TRANSITIONS: Record<IntentState, readonly IntentState[]> = {
  ready: ['sending'],
  sending: ['unknown', 'confirmed'],
  unknown: ['sending', 'confirmed'],
  confirmed: [],
};

/**
 * The original operationId and immutable payload survive every transition.
 * An uncertain outcome can be resent only after caller-owned reconciliation,
 * using the same operation ID; this function never sends a request.
 */
export function transitionIntent<T>(
  intent: PendingIntent<T>,
  nextState: IntentState,
): PendingIntent<T> {
  if (intent.state === nextState) return intent;
  if (!ALLOWED_TRANSITIONS[intent.state]?.includes(nextState)) {
    throw new RangeError('Invalid intent state transition');
  }
  return Object.freeze({ ...intent, state: nextState });
}
