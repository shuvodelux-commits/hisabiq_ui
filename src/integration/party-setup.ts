import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/**
 * MOD-004 T02-R: the server-authoritative Party form setup snapshot.
 *
 * Source: Nest adoption PartyGroupsController GET /api/v1/party-setup and
 * packages/core-contracts/src/parties.ts partySetupResponseSchema.
 *
 * This adapter is deliberately UNMOUNTED. The existing seven-role React
 * Party editor continues operating in preview mode until the full connected
 * relationship/financial contract and route gates are approved.
 */
export interface ServerCustomerGroup {
  id: string;
  name: string;
}
export interface ServerPartyFieldVisibility {
  address: boolean;
  guardianName: boolean;
  nid: boolean;
  email: boolean;
  notes: boolean;
}
export interface ServerPartySetup {
  groups: ServerCustomerGroup[];
  features: {
    customerGroups: boolean;
    vendors: boolean;
  };
  fields: ServerPartyFieldVisibility;
}
export interface ServerPartySetupEnvelope {
  data: ServerPartySetup;
}

const ulid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const featureKeys = ['customerGroups', 'vendors'] as const;
const fieldKeys = ['address', 'guardianName', 'nid', 'email', 'notes'] as const;

function invalid(): never {
  throw new ApiError('protocol', 'Party setup response or request could not be verified');
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exact(value: Record<string, unknown>, names: readonly string[]): boolean {
  return Object.keys(value).length === names.length &&
    names.every(name => Object.prototype.hasOwnProperty.call(value, name));
}
function flags(value: unknown, keys: readonly string[]): boolean {
  return record(value) && exact(value, keys) &&
    keys.every(key => typeof value[key] === 'boolean');
}
function group(value: unknown): value is ServerCustomerGroup {
  return record(value) && exact(value, ['id', 'name']) &&
    typeof value.id === 'string' && ulid.test(value.id) &&
    typeof value.name === 'string' &&
    value.name.length >= 1 && value.name.length <= 120 &&
    value.name === value.name.trim();
}

/** Fail closed rather than silently inventing form settings or empty groups. */
export function decodePartySetup(raw: unknown): ServerPartySetupEnvelope {
  if (!record(raw) || !exact(raw, ['data']) || !record(raw.data)) return invalid();
  const value = raw.data;
  if (!exact(value, ['groups', 'features', 'fields']) ||
      !Array.isArray(value.groups) || !value.groups.every(group) ||
      !flags(value.features, featureKeys) || !flags(value.fields, fieldKeys)) return invalid();

  const groups = value.groups as ServerCustomerGroup[];
  if (new Set(groups.map(entry => entry.id)).size !== groups.length ||
      (value.features as ServerPartySetup['features']).customerGroups === false &&
      groups.length > 0) return invalid();

  return raw as unknown as ServerPartySetupEnvelope;
}

/**
 * One authenticated same-origin GET. No tenant supplied by the browser, local
 * cache, automatic retry, fixture fallback, idempotency key or mutation.
 * The caller must bind completion to the current session epoch/tenant and
 * abort any request after a session switch.
 */
export async function readPartySetup(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerPartySetupEnvelope> {
  if (typeof accessToken !== 'string' || !accessToken || /\s/.test(accessToken) ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();

  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'GET',
      path: '/api/v1/party-setup',
      accessToken,
      signal: controller.signal,
    }, decodePartySetup);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
