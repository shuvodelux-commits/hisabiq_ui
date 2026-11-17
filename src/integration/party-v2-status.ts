import { ApiError } from './errors.ts';
import { requestJson, type ApiRequest } from './http.ts';
import type { TradingRole, TradingStatus } from './party-reads.ts';

/**
 * MOD-004 T20-R (#658): unmounted, strict selected-role status transport.
 * Status belongs to the whole Party identity. The backend requires DEACTIVATE
 * authority for every existing relationship; never infer permission from
 * selectedRole or mount the seven-role React preview editor through this file.
 */
export interface PartyV2StatusInput {
  selectedRole: TradingRole;
  version: number;
  status: TradingStatus;
}
export interface PartyV2StatusReceipt {
  data: {
    id: string;
    version: number;
    selectedRole: TradingRole;
    status: TradingStatus;
  };
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const tradingRoles: readonly TradingRole[] = ['CUSTOMER', 'SUPPLIER', 'VENDOR'];
const inputKeys = ['selectedRole', 'version', 'status'] as const;
const receiptKeys = ['id', 'version', 'selectedRole', 'status'] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Party V2 status contract could not be verified');
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function exact(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function role(value: unknown): value is TradingRole {
  return typeof value === 'string' && tradingRoles.includes(value as TradingRole);
}
function identifier(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function version(value: unknown): value is number {
  // A successful mutation increments once, so MAX_SAFE_INTEGER has no valid
  // next version; reject that boundary rather than accepting unsafe numbers.
  return typeof value === 'number' && Number.isSafeInteger(value) &&
    value > 0 && value < Number.MAX_SAFE_INTEGER;
}
function state(value: unknown): value is TradingStatus {
  return value === 'ACTIVE' || value === 'INACTIVE';
}

/** Exact server body: no role membership edits, openings, privacy or money. */
export function verifyPartyV2StatusInput(raw: unknown): PartyV2StatusInput {
  if (!record(raw) || !exact(raw, inputKeys) ||
      !role(raw.selectedRole) || !version(raw.version) ||
      !state(raw.status)) return invalid();
  return raw as unknown as PartyV2StatusInput;
}

/**
 * Backend CAS result:
 * - version = submitted version: authorized same-state no-op (no audit/outbox)
 * - version = submitted + 1: actual identity-wide status change
 * No other version, role, ID, status or wire key may be accepted.
 */
export function decodePartyV2StatusReceipt(
  raw: unknown,
  requestedId: string,
  selectedRole: TradingRole,
  submittedVersion: number,
  requestedStatus: TradingStatus,
): PartyV2StatusReceipt {
  if (!identifier(requestedId) || !role(selectedRole) ||
      !version(submittedVersion) || !state(requestedStatus) ||
      !record(raw) || !exact(raw, ['data']) ||
      !record(raw.data) || !exact(raw.data, receiptKeys) ||
      !identifier(raw.data.id) || raw.data.id !== requestedId ||
      !(typeof raw.data.version === 'number' &&
        Number.isSafeInteger(raw.data.version) && raw.data.version > 0) ||
      (raw.data.version !== submittedVersion &&
        raw.data.version !== submittedVersion + 1) ||
      raw.data.selectedRole !== selectedRole ||
      raw.data.status !== requestedStatus) return invalid();
  return raw as unknown as PartyV2StatusReceipt;
}

/**
 * Exactly one authenticated POST, never Idempotency-Key, V1 fallback or retry.
 * Timeout and lost ACK mean unknown state; caller must explicitly re-read
 * through authorized V2 detail before attempting another versioned write.
 */
export async function setTradingPartyStatusV2(
  accessToken: string,
  partyId: string,
  raw: PartyV2StatusInput,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<PartyV2StatusReceipt> {
  if (typeof accessToken !== 'string' || !accessToken || /\s/.test(accessToken) ||
      !identifier(partyId) || !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < 1 || timeoutMs > 120_000) return invalid();

  const input = verifyPartyV2StatusInput(raw);
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'POST',
      path: ('/api/v2/parties/' + partyId + '/status') as ApiRequest['path'],
      accessToken,
      body: input,
      signal: controller.signal,
    }, response => decodePartyV2StatusReceipt(
      response, partyId, input.selectedRole, input.version, input.status));
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
