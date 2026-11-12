import { ApiError } from './errors.ts';
import { requestJson } from './http.ts';

/** NestSherERP packages/core-contracts/src/settings.ts, pinned adoption SHA.
 * T01-R is GET-only. T01-W/P1 adds only the server-profile PATCH. */
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
export async function readTenantSettings(
  accessToken: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerSettingsEnvelope> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) {
    throw new ApiError('protocol', 'Invalid settings request timeout');
  }
  // Use one controller for both tenant-switch cancellation and bounded offline
  // wait. Supported by older browsers without AbortSignal.any/timeout support.
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'GET',
      path: '/api/v1/settings',
      accessToken,
      signal: controller.signal,
    }, decodeServerSettings);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}


/** MOD-001 T01-W/P1: persist only the verified business profile. The Nest API
 * requires name + timezone together. The timezone MUST come from the last
 * authenticated GET; callers cannot substitute a browser-local zone. No
 * generic SettingKey POST, retries, optimistic-concurrency claims or cache.
 * Unknown network outcomes are surfaced so the UI keeps the draft. */
export async function updateBusinessProfile(
  accessToken: string,
  lastVerified: ServerSettings,
  businessName: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<ServerSettingsEnvelope> {
  if (typeof businessName !== 'string' || !Number.isSafeInteger(timeoutMs) ||
      timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const name = businessName.trim();
  if (name.length < 2 || name.length > 120 ||
      !record(lastVerified) || !timezone(lastVerified.timezone) ||
      !Array.isArray(lastVerified.supportedTimezones) ||
      !lastVerified.supportedTimezones.every(timezone) ||
      !lastVerified.supportedTimezones.includes(lastVerified.timezone)) return invalid();

  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'PATCH',
      path: '/api/v1/settings/business',
      accessToken,
      body: { businessName: name, timezone: lastVerified.timezone },
      signal: controller.signal,
    }, decodeServerSettings);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}


// MOD-001 T02-R: NestSherERP user/role listing contracts from immutable adoption.
// Roles and user lists are independently permission-guarded resources. Neither
// carries employee-profile multi-role semantics, credentials or a write action.
export interface ServerUser {
  id: string;
  username: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  roleId: string;
  roleName: string;
  disabled: boolean;
  hasPassword: boolean;
}
export interface ServerRoleSummary { id: string; code: string; name: string }
export interface ServerUsersEnvelope {
  data: { users: ServerUser[]; roles: ServerRoleSummary[] };
}
export interface ServerRole {
  id: string;
  code: string;
  name: string;
  isSystem: boolean;
  locked: boolean;
  permissions: string[];
  userCount: number;
}
export interface ServerPermissionDescriptor {
  code: string;
  group: string;
  label: string;
  detail: string;
}
export interface ServerRolesEnvelope {
  data: { roles: ServerRole[]; catalogue: ServerPermissionDescriptor[] };
}

const teamUlid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).length === keys.length && keys.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function id(value: unknown): value is string {
  return typeof value === 'string' && teamUlid.test(value);
}
function nullableText(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}
function serverUser(value: unknown): value is ServerUser {
  return record(value) &&
    exactKeys(value, ['id','username','displayName','email','phone','roleId','roleName','disabled','hasPassword']) &&
    id(value.id) && nonblank(value.username) && nonblank(value.displayName) &&
    nullableText(value.email) && nullableText(value.phone) &&
    id(value.roleId) && nonblank(value.roleName) &&
    typeof value.disabled === 'boolean' && typeof value.hasPassword === 'boolean';
}
function roleSummary(value: unknown): value is ServerRoleSummary {
  return record(value) && exactKeys(value, ['id','code','name']) &&
    id(value.id) && nonblank(value.code) && nonblank(value.name);
}
function roleDetail(value: unknown): value is ServerRole {
  return record(value) &&
    exactKeys(value, ['id','code','name','isSystem','locked','permissions','userCount']) &&
    id(value.id) && nonblank(value.code) && nonblank(value.name) &&
    typeof value.isSystem === 'boolean' && typeof value.locked === 'boolean' &&
    Array.isArray(value.permissions) && value.permissions.every(nonblank) &&
    Number.isSafeInteger(value.userCount) && (value.userCount as number) >= 0;
}
function permissionDescriptor(value: unknown): value is ServerPermissionDescriptor {
  return record(value) && exactKeys(value, ['code','group','label','detail']) &&
    nonblank(value.code) && typeof value.group === 'string' &&
    typeof value.label === 'string' && typeof value.detail === 'string';
}
function uniqueStrings(items: readonly string[]): boolean {
  return new Set(items).size === items.length;
}
function decodeUsers(raw: unknown): ServerUsersEnvelope {
  if (!record(raw) || !exactKeys(raw, ['data']) || !record(raw.data) ||
      !exactKeys(raw.data, ['users','roles']) ||
      !Array.isArray(raw.data.users) || !raw.data.users.every(serverUser) ||
      !Array.isArray(raw.data.roles) || !raw.data.roles.every(roleSummary) ||
      !uniqueStrings(raw.data.users.map((x: ServerUser) => x.id)) ||
      !uniqueStrings(raw.data.roles.map((x: ServerRoleSummary) => x.id))) return invalid();
  return raw as unknown as ServerUsersEnvelope;
}
function decodeRoles(raw: unknown): ServerRolesEnvelope {
  if (!record(raw) || !exactKeys(raw, ['data']) || !record(raw.data) ||
      !exactKeys(raw.data, ['roles','catalogue']) ||
      !Array.isArray(raw.data.roles) || !raw.data.roles.every(roleDetail) ||
      !Array.isArray(raw.data.catalogue) || !raw.data.catalogue.every(permissionDescriptor) ||
      !uniqueStrings(raw.data.roles.map((x: ServerRole) => x.id)) ||
      !uniqueStrings(raw.data.catalogue.map((x: ServerPermissionDescriptor) => x.code))) return invalid();
  return raw as unknown as ServerRolesEnvelope;
}
async function readTeamResource<T>(
  path: '/api/v1/users' | '/api/v1/roles',
  accessToken: string,
  decode: (raw: unknown) => T,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<T> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({ method: 'GET', path, accessToken, signal: controller.signal }, decode);
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
/** Verified session bearer is mandatory; no tenant ID, cache, fallback or retry. */
export function readTenantUsers(
  accessToken: string, signal?: AbortSignal, timeoutMs?: number,
): Promise<ServerUsersEnvelope> {
  return readTeamResource('/api/v1/users', accessToken, decodeUsers, signal, timeoutMs);
}
/** Separately guarded by user.role.view, not implied by user.account.view. */
export function readTenantRoles(
  accessToken: string, signal?: AbortSignal, timeoutMs?: number,
): Promise<ServerRolesEnvelope> {
  return readTeamResource('/api/v1/roles', accessToken, decodeRoles, signal, timeoutMs);
}


/** T02-W/P1: rename only a previously verified existing Nest login principal.
 * PATCH needs the current server roleId even for an unchanged role; NEVER
 * derive it from Magic "Sales" or send confirmPassword/disabled/permissions.
 * If another editor changed the role since GET, Nest requires step-up and
 * refuses this password-free request rather than silently re-privileging.
 * There is no idempotency or CAS contract: unknown PATCH outcomes are not
 * retried and must leave the UI draft visible until independently verified.
 */
export async function updateTenantUserDisplayName(
  accessToken: string,
  verifiedUser: ServerUser,
  requestedName: string,
  signal?: AbortSignal,
  timeoutMs = 12_000,
): Promise<{ data: ServerUser }> {
  if (!serverUser(verifiedUser) || typeof requestedName !== 'string' ||
      !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) return invalid();
  const displayName = requestedName.trim();
  if (displayName.length < 1 || displayName.length > 120) return invalid();

  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const deadline = globalThis.setTimeout(abort, timeoutMs);
  try {
    return await requestJson({
      method: 'PATCH',
      path: `/api/v1/users/${verifiedUser.id}`,
      accessToken,
      body: { displayName, roleId: verifiedUser.roleId },
      signal: controller.signal,
    }, (raw: unknown) => {
      if (!record(raw) || !exactKeys(raw, ['data']) || !serverUser(raw.data)) return invalid();
      const returned = raw.data;
      if (returned.id !== verifiedUser.id || returned.roleId !== verifiedUser.roleId ||
          returned.displayName !== displayName) return invalid();
      return { data: returned };
    });
  } finally {
    globalThis.clearTimeout(deadline);
    signal?.removeEventListener('abort', abort);
  }
}
