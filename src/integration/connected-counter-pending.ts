/**
 * MOD-006 H3A: browser-origin write-ahead interlock for uncertain Counter POSTs.
 *
 * This is NOT a server reconciliation record or a cross-device posting lock.
 * Store ONLY opaque operation identity; never persist tokens, Parties, amounts
 * or payment request bodies. An unresolved marker has NO automatic expiry.
 * The server currently has no read-only by-operation resolution endpoint:
 * never interpret an absent marker or a browser refresh as financial proof.
 */
export const COUNTER_PENDING_PREFIX = 'hisabiq.connected.counter.pending.v1.';
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;

export interface PendingCounterStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export interface PendingCounterScope {
  readonly tenantId: string;
  readonly userId: string;
}
export type PendingCounterKind = 'CUSTOMER_RECEIPT' | 'SUPPLIER_PAYMENT';
export interface PendingCounterRecord extends PendingCounterScope {
  readonly version: 1;
  readonly operationId: string;
  readonly kind: PendingCounterKind;
  readonly createdAt: number;
}
export type PendingCounterStatus =
  | { readonly state: 'clear' }
  | { readonly state: 'pending'; readonly record: PendingCounterRecord }
  | { readonly state: 'blocked'; readonly reason: 'unavailable' | 'invalid' };

const exact = (value: object, keys: string[]): boolean => {
  const own = Object.keys(value);
  return own.length === keys.length && keys.every(key => own.includes(key));
};
function validScope(scope: PendingCounterScope): boolean {
  return scope !== null && typeof scope === 'object' &&
    ULID.test(scope.tenantId) && ULID.test(scope.userId);
}
function isRecord(value: unknown, scope: PendingCounterScope): value is PendingCounterRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    exact(value, ['version','tenantId','userId','operationId','kind','createdAt']) &&
    (value as PendingCounterRecord).version === 1 &&
    (value as PendingCounterRecord).tenantId === scope.tenantId &&
    (value as PendingCounterRecord).userId === scope.userId &&
    ULID.test((value as PendingCounterRecord).operationId) &&
    (['CUSTOMER_RECEIPT','SUPPLIER_PAYMENT'] as const).includes(
      (value as PendingCounterRecord).kind,
    ) &&
    Number.isSafeInteger((value as PendingCounterRecord).createdAt) &&
    (value as PendingCounterRecord).createdAt >= 0;
}
function blocked(message: string): never {
  throw Error('Connected Counter payment is locked: ' + message);
}

/** Namespaced to an authenticated tenant + user; no access token/PII in key. */
export function pendingCounterKey(scope: PendingCounterScope): string {
  if (!validScope(scope)) return blocked('signed scope is not verified');
  return COUNTER_PENDING_PREFIX + scope.tenantId + '.' + scope.userId;
}
export function browserPendingCounterStorage(): PendingCounterStorage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}
export function readPendingCounterOperation(
  storage: PendingCounterStorage | null,
  scope: PendingCounterScope,
): PendingCounterStatus {
  if (!validScope(scope)) return { state: 'blocked', reason: 'invalid' };
  if (!storage) return { state: 'blocked', reason: 'unavailable' };
  try {
    const raw = storage.getItem(pendingCounterKey(scope));
    if (raw === null) return { state: 'clear' };
    const value: unknown = JSON.parse(raw);
    return isRecord(value,scope)
      ? { state: 'pending', record: value }
      : { state: 'blocked', reason: 'invalid' };
  } catch {
    return { state: 'blocked', reason: 'unavailable' };
  }
}
/**
 * Write synchronously BEFORE the source POST and read it back. If storage
 * refuses, is corrupted, or a previous payment exists, no financial POST.
 */
export function reservePendingCounterOperation(
  storage: PendingCounterStorage | null,
  scope: PendingCounterScope,
  operationId: string,
  kind: PendingCounterKind,
  createdAt = Date.now(),
): PendingCounterRecord {
  if (!ULID.test(operationId) ||
      (kind !== 'CUSTOMER_RECEIPT' && kind !== 'SUPPLIER_PAYMENT') ||
      !Number.isSafeInteger(createdAt) || createdAt < 0) {
    return blocked('invalid source operation identity');
  }
  const current = readPendingCounterOperation(storage,scope);
  if (current.state !== 'clear' || !storage) return blocked('prior operation unresolved or storage unavailable');
  const record: PendingCounterRecord = {
    version: 1, tenantId: scope.tenantId, userId: scope.userId,
    operationId, kind, createdAt,
  };
  try {
    storage.setItem(pendingCounterKey(scope), JSON.stringify(record));
  } catch {
    return blocked('cannot retain original operation before posting');
  }
  const readBack = readPendingCounterOperation(storage,scope);
  if (readBack.state !== 'pending' ||
      readBack.record.operationId !== operationId ||
      readBack.record.kind !== kind ||
      readBack.record.createdAt !== createdAt) {
    return blocked('original operation could not be verified in storage');
  }
  return record;
}
/**
 * A caller may invoke ONLY after authenticated Nest source confirmation and
 * reread, or a definitively rejected operation. Never invoke on timeout, lost
 * response, 5xx, session loss, missing read-only lookup or a manual guess.
 */
export function clearVerifiedCounterOperation(
  storage: PendingCounterStorage | null,
  scope: PendingCounterScope,
  operationId: string,
): true {
  const current = readPendingCounterOperation(storage,scope);
  if (current.state !== 'pending' || current.record.operationId !== operationId ||
      !storage) return blocked('original operation does not match pending record');
  try {
    storage.removeItem(pendingCounterKey(scope));
  } catch {
    return blocked('cannot verify clearing of source-confirmed operation');
  }
  if (readPendingCounterOperation(storage,scope).state !== 'clear') {
    return blocked('source-confirmed operation could not be cleared');
  }
  return true;
}
