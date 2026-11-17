import { ApiError } from './errors.ts';
import type { SessionSnapshot } from './session.ts';
import {
  normalizeSaleDraftPayload,
  saveSaleDraft,
} from './sale-draft-writes.ts';
import type {
  SaleDraftPayload,
  SavedSaleDraftEnvelope,
} from './sale-draft-writes.ts';

/**
 * MOD-007 M7-03: a prepared sale is not an invoice and never posts money,
 * inventory, customer balances or journals.
 *
 * This module is intentionally NOT connected to preview POS or the router.
 * Once the real tenant-backed cart exists it can prepare an immutable save
 * intent, keep the same operation key through a lost reply, and clear only on
 * a separately verified server response.
 */
type Authenticated = Extract<SessionSnapshot, { status: 'authenticated' }>;

export interface ConnectedSaleDraftSources {
  /** Verified active tenant that owns both supplied source directories. */
  readonly tenantId: string;
  readonly productIds: ReadonlySet<string>;
  readonly customerIds: ReadonlySet<string>;
}

/** Exposes no token, tenant, cart, password, local persistence or user data. */
export interface PreparedSaleDraftCreate {
  readonly operationId: string;
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CART_SCHEMA = 'hisabiq.connected.pos.draft.v1';
const SALE_CREATE_PERMISSION = 'sale.invoice.create';

type PrivateIntent = {
  identity: string;
  operationId: string;
  serialized: string;
};
const privateIntents = new WeakMap<PreparedSaleDraftCreate, PrivateIntent>();
const requestsInFlight = new WeakSet<PreparedSaleDraftCreate>();

function deny(): never {
  throw new ApiError('protocol', 'Connected Sales Draft intent could not be verified');
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function plain(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null);
}
function sessionIdentity(value: SessionSnapshot): string {
  if (value.status !== 'authenticated' ||
    !validId(value.tenantId) || !validId(value.userId) ||
    !Number.isSafeInteger(value.epoch) || value.epoch < 0 ||
    !value.accessToken || /\s/.test(value.accessToken) ||
    !Array.isArray(value.permissions) ||
    !value.permissions.includes(SALE_CREATE_PERMISSION)) return deny();

  // Account identity/epoch/token must all match. Nothing goes into browser
  // storage, logs or into the externally visible handle.
  return JSON.stringify([value.tenantId, value.userId, value.epoch, value.accessToken]);
}

function verifySources(
  session: Authenticated,
  payload: SaleDraftPayload,
  sources: ConnectedSaleDraftSources,
): void {
  if (!sources || sources.tenantId !== session.tenantId ||
    !(sources.productIds instanceof Set) ||
    !(sources.customerIds instanceof Set)) return deny();
  const cart = payload.cart;
  if (cart.schema !== CART_SCHEMA || cart.sourceTenantId !== session.tenantId ||
    !Array.isArray(cart.lines) ||
    cart.lines.length !== payload.itemCount) return deny();

  const customerId = cart.customerId;
  if (customerId !== null &&
    (!validId(customerId) || !sources.customerIds.has(customerId))) return deny();

  for (const line of cart.lines) {
    if (!plain(line) || !validId(line.productId) ||
      !sources.productIds.has(line.productId)) return deny();
  }
}

/** Canonical 26-character Crockford ULID: 48-bit time and 80-bit CSPRNG. */
function newOperationId(): string {
  if (!globalThis.crypto?.getRandomValues) return deny();
  let milliseconds = Date.now();
  if (!Number.isSafeInteger(milliseconds) ||
    milliseconds < 0 || milliseconds >= 2 ** 48) return deny();

  const timestamp = Array<string>(10);
  for (let index = 9; index >= 0; index--) {
    timestamp[index] = CROCKFORD.charAt(milliseconds % 32);
    milliseconds = Math.floor(milliseconds / 32);
  }

  const randomBytes = globalThis.crypto.getRandomValues(new Uint8Array(10));
  let buffer = 0;
  let available = 0;
  let randomness = '';
  for (const byte of randomBytes) {
    buffer = (buffer << 8) | byte;
    available += 8;
    while (available >= 5) {
      available -= 5;
      randomness += CROCKFORD.charAt((buffer >>> available) & 31);
      buffer &= (1 << available) - 1;
    }
  }
  const operationId = timestamp.join('') + randomness;
  if (!validId(operationId)) return deny();
  return operationId;
}

/**
 * Prepare only from an authenticated tenant's verified product/customer
 * sources. This blocks the current preview-only IDs (p1, t1 etc.) from being
 * promoted to a live draft. Other cart fields stay opaque for exact replay.
 */
export function prepareSaleDraftCreate(
  session: SessionSnapshot,
  input: SaleDraftPayload,
  sources: ConnectedSaleDraftSources,
): PreparedSaleDraftCreate {
  const identity = sessionIdentity(session);
  if (session.status !== 'authenticated') return deny();
  const payload = normalizeSaleDraftPayload(input);
  verifySources(session, payload, sources);

  const operationId = newOperationId();
  const handle = Object.freeze({ operationId });
  privateIntents.set(handle, {
    identity,
    operationId,
    serialized: JSON.stringify(payload),
  });
  return handle;
}

/**
 * Each explicit call sends at most one POST. Unknown/lost outcomes leave the
 * original weak-map handle intact, ready for a deliberate same-key retry.
 * A second in-flight submit is blocked rather than double-clicking the write.
 */
export async function submitPreparedSaleDraftCreate(
  session: SessionSnapshot,
  handle: PreparedSaleDraftCreate,
  signal?: AbortSignal,
  timeoutMs?: number,
): Promise<SavedSaleDraftEnvelope> {
  const identity = sessionIdentity(session);
  if (session.status !== 'authenticated' ||
    !handle || typeof handle !== 'object') return deny();

  const prepared = privateIntents.get(handle);
  if (!prepared || prepared.identity !== identity ||
    prepared.operationId !== handle.operationId ||
    requestsInFlight.has(handle)) return deny();

  requestsInFlight.add(handle);
  try {
    return await saveSaleDraft(
      session.accessToken,
      JSON.parse(prepared.serialized) as SaleDraftPayload,
      prepared.operationId,
      signal,
      timeoutMs,
    );
  } finally {
    requestsInFlight.delete(handle);
  }
}
