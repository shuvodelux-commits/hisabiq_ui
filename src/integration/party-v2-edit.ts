import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { TradingRole, TradingStatus } from './party-reads.ts';

/**
 * MOD-004 T19-R (#622): unmounted V2 name/phone-only correction.
 * A selected trading role is authorization context, not a role mutation.
 * No V1 fallback, Party form mount, cash/ledger effect, or automatic retry.
 */
export interface PartyV2EditInput {
  selectedRole: TradingRole;
  version: number;
  name: string;
  phone: string | null;
}

export interface PartyV2EditReceipt {
  data: {
    id: string;
    version: number;
    selectedRole: TradingRole;
    status: TradingStatus;
  };
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const roles: readonly TradingRole[] = ['CUSTOMER', 'SUPPLIER', 'VENDOR'];
const inputKeys = ['selectedRole', 'version', 'name', 'phone'] as const;
const receiptKeys = ['id', 'version', 'selectedRole', 'status'] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Party V2 edit contract could not be verified');
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function exact(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function role(value: unknown): value is TradingRole {
  return typeof value === 'string' && roles.includes(value as TradingRole);
}
function positiveSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
function identifier(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}

/** Enforce the exact server PATCH DTO; never accept opening, finance or private fields. */
export function verifyPartyV2EditInput(raw: unknown): PartyV2EditInput {
  if (!record(raw) || !exact(raw, inputKeys) ||
      !role(raw.selectedRole) ||
      !positiveSafeInteger(raw.version) || raw.version === Number.MAX_SAFE_INTEGER ||
      typeof raw.name !== 'string' ||
      raw.name.trim().length < 1 || raw.name.trim().length > 200 ||
      !(raw.phone === null ||
        (typeof raw.phone === 'string' && raw.phone.trim().length <= 30))) return invalid();
  return raw as unknown as PartyV2EditInput;
}

/** A mutation receipt proves only identity/version/status for the selected role. */
export function decodePartyV2EditReceipt(
  raw: unknown,
  requestedId: string,
  selectedRole: TradingRole,
  submittedVersion: number,
): PartyV2EditReceipt {
  if (!identifier(requestedId) || !role(selectedRole) ||
      !positiveSafeInteger(submittedVersion) ||
      submittedVersion === Number.MAX_SAFE_INTEGER ||
      !record(raw) || !exact(raw, ['data']) ||
      !record(raw.data) || !exact(raw.data, receiptKeys) ||
      !identifier(raw.data.id) || raw.data.id !== requestedId ||
      !positiveSafeInteger(raw.data.version) ||
      raw.data.version !== submittedVersion + 1 ||
      raw.data.selectedRole !== selectedRole ||
      (raw.data.status !== 'ACTIVE' && raw.data.status !== 'INACTIVE')) return invalid();
  return raw as unknown as PartyV2EditReceipt;
}

/**
 * One caller-initiated optimistic PATCH. A lost response is UNKNOWN, not a reason
 * to replay: the backend rejects stale versions with 409 and has no PATCH
 * Idempotency-Key. Keep a fresh caller-owned accessToken on each invocation.
 */
export async function editTradingPartyNamePhoneV2(
  accessToken: string,
  partyId: string,
  raw: PartyV2EditInput,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<PartyV2EditReceipt> {
  if (typeof accessToken !== 'string' || !accessToken || /\s/.test(accessToken) ||
      !identifier(partyId) ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();

  const input = verifyPartyV2EditInput(raw);
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'PATCH',
      path: '/api/v2/parties/' + partyId,
      accessToken,
      body: input,
      signal: controller.signal,
    }, response =>
      decodePartyV2EditReceipt(response, partyId, input.selectedRole, input.version));
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
