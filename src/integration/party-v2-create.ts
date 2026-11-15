import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';
import type { TradingRole, TradingStatus } from './party-reads.ts';

/**
 * MOD-004 T17-R: unmounted, selected-role create-only transport for the
 * backend's approved three trading relationships. Not the seven-role HisabIQ
 * Party editor; historical opening is an independent noncash source document.
 */
export interface PartyV2CreateInput {
  selectedRole: TradingRole;
  name: string;
  roles: TradingRole[];
  phone: string | null;
  address: string | null;
  guardianName: string | null;
  nid: string | null;
  email: string | null;
  notes: string | null;
  customerGroupId: string | null;
  creditLimitMinor: number | null;
}
export interface PartyV2CreateReceipt {
  data: {
    id: string;
    version: number;
    selectedRole: TradingRole;
    status: TradingStatus;
  };
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const roles: readonly TradingRole[] = ['CUSTOMER', 'SUPPLIER', 'VENDOR'];
const requestKeys = [
  'selectedRole', 'name', 'roles', 'phone', 'address',
  'guardianName', 'nid', 'email', 'notes', 'customerGroupId', 'creditLimitMinor',
] as const;
const receiptKeys = ['id', 'version', 'selectedRole', 'status'] as const;
const privateTextLengths = {
  address: 500, guardianName: 200, nid: 60, email: 200, notes: 2000,
} as const;

function invalid(): never {
  throw new ApiError('protocol', 'Party V2 create contract could not be verified');
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exact(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length &&
    keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function role(value: unknown): value is TradingRole {
  return typeof value === 'string' && roles.includes(value as TradingRole);
}
function identifier(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function nullableText(value: unknown, max: number): boolean {
  return value === null || (typeof value === 'string' &&
    value.length <= max && value.trim().length <= max);
}
function positiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
function nonnegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

/** Strict, noncoercing check. No fallback to the legacy V1 create DTO. */
export function verifyPartyV2CreateInput(raw: unknown): PartyV2CreateInput {
  if (!record(raw) || !exact(raw, requestKeys) ||
      !role(raw.selectedRole) || !Array.isArray(raw.roles) ||
      raw.roles.length < 1 || raw.roles.length > 3 ||
      !raw.roles.every(role) || new Set(raw.roles).size !== raw.roles.length ||
      !raw.roles.includes(raw.selectedRole) ||
      typeof raw.name !== 'string' || raw.name.trim().length < 1 ||
      raw.name.trim().length > 200 ||
      !nullableText(raw.phone, 30) ||
      (raw.roles.includes('CUSTOMER') &&
        (typeof raw.phone !== 'string' || raw.phone.trim().length === 0)) ||
      !Object.entries(privateTextLengths).every(([key, max]) =>
        nullableText(raw[key], max)) ||
      !(raw.customerGroupId === null || identifier(raw.customerGroupId)) ||
      !(raw.creditLimitMinor === null || nonnegativeInteger(raw.creditLimitMinor)) ||
      (!raw.roles.includes('CUSTOMER') &&
        (raw.customerGroupId !== null || raw.creditLimitMinor !== null))) return invalid();
  return raw as unknown as PartyV2CreateInput;
}

/** A CREATE receipt cannot be used as a Party GET or an unrestricted ledger. */
export function decodePartyV2CreateReceipt(
  raw: unknown, selected: TradingRole,
): PartyV2CreateReceipt {
  if (!role(selected) || !record(raw) || !exact(raw, ['data']) ||
      !record(raw.data) || !exact(raw.data, receiptKeys) ||
      !identifier(raw.data.id) || !positiveInteger(raw.data.version) ||
      raw.data.selectedRole !== selected ||
      (raw.data.status !== 'ACTIVE' && raw.data.status !== 'INACTIVE')) return invalid();
  return raw as unknown as PartyV2CreateReceipt;
}

/**
 * A single authenticated POST for an already persisted, caller-owned intent.
 * Lost ACKs and timeouts leave outcome unknown: never auto-retry, substitute a
 * new operation ID, mutate preview data or infer a complete Party GET.
 */
export async function createTradingPartyV2(
  accessToken: string,
  operationId: string,
  raw: PartyV2CreateInput,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<PartyV2CreateReceipt> {
  if (typeof accessToken !== 'string' || !accessToken || /\s/.test(accessToken) ||
      !identifier(operationId) || !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < 1 || timeoutMs > 120_000) return invalid();

  const input = verifyPartyV2CreateInput(raw);
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'POST',
      path: '/api/v2/parties',
      accessToken,
      operationId,
      body: input,
      signal: controller.signal,
    }, (response) => decodePartyV2CreateReceipt(response, input.selectedRole));
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
