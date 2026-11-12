import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/** NestSherERP packages/core-contracts/src/settings.ts, pinned adoption SHA.
 * This resource intentionally has no mutable settings methods in T01-R. */
export interface ServerSettingDescriptor {
  key: string;
  group: string;
  label: string;
  detail: string;
  kind: 'TOGGLE' | 'CHOICE';
  options: string[];
  defaultValue: string;
  requires: string[];
  stepUp: boolean;
  consumedBy: string;
  inEffect: boolean;
}
export interface ServerSettings {
  businessName: string;
  timezone: string;
  supportedTimezones: string[];
  catalogue: ServerSettingDescriptor[];
  values: Record<string, string>;
}
export interface ServerSettingsEnvelope {
  data: ServerSettings;
}

function record(raw: unknown): raw is Record<string, unknown> {
  return raw !== null && typeof raw === 'object' && !Array.isArray(raw);
}
function nonblank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function strings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}
function timezone(value: unknown): value is string {
  if (!nonblank(value) || (value !== 'UTC' && !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+-]+)+$/.test(value))) {
    return false;
  }
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
function invalid(): never {
  throw new ApiError('protocol', 'Settings response could not be verified');
}
function descriptor(raw: unknown): raw is ServerSettingDescriptor {
  if (!record(raw) || !nonblank(raw.key) || typeof raw.group !== 'string' ||
    typeof raw.label !== 'string' || typeof raw.detail !== 'string' ||
    (raw.kind !== 'TOGGLE' && raw.kind !== 'CHOICE') || !strings(raw.options) ||
    typeof raw.defaultValue !== 'string' || !strings(raw.requires) ||
    typeof raw.stepUp !== 'boolean' || typeof raw.consumedBy !== 'string' ||
    typeof raw.inEffect !== 'boolean') return false;
  return Object.keys(raw).length === 11;
}
function decodeServerSettings(raw: unknown): ServerSettingsEnvelope {
  if (!record(raw) || !record(raw.data) || Object.keys(raw).length !== 1) return invalid();
  const source = raw.data;
  if (!nonblank(source.businessName) || !timezone(source.timezone) ||
    !Array.isArray(source.supportedTimezones) || !source.supportedTimezones.every(timezone) ||
    !source.supportedTimezones.includes(source.timezone) ||
    !Array.isArray(source.catalogue) || !source.catalogue.every(descriptor) ||
    !record(source.values) || Object.values(source.values).some(value => typeof value !== 'string') ||
    Object.keys(source).length !== 5) return invalid();
  const keys = source.catalogue.map(item => (item as ServerSettingDescriptor).key);
  if (new Set(keys).size !== keys.length) return invalid();
  return raw as unknown as ServerSettingsEnvelope;
}

/** Caller must supply the *currently verified* session access token; there is
 * no tenant parameter, fixture fallback, client cache, automatic retry or POST. */
export function readTenantSettings(
  accessToken: string,
  signal?: AbortSignal,
): Promise<ServerSettingsEnvelope> {
  return requestJson({
    method: 'GET',
    path: '/api/v1/settings',
    accessToken,
    signal,
  }, decodeServerSettings);
}
