/**
 * MOD-001 T03-P1 — local presentation preferences only.
 *
 * Never use preview tenant t1, preview actor or the global preview personalKey
 * in an authenticated session. This helper carries no business/financial data
 * and does not confer backend permissions or subscription entitlements.
 */
import { personalDefaults, validPersonal, type PersonalSettings } from './model.ts';
import type { SessionSnapshot } from '../integration/session.ts';

export interface ConnectedPersonalScope {
  tenantId: string;
  userId: string;
  /** Session epoch is for synchronous stale-state masking, not storage identity. */
  epoch: number;
}
export interface PersonalLocalStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
const serverUlid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const personalKeys = new Set(Object.keys(personalDefaults));
function strictPersonal(value: unknown): value is PersonalSettings {
  return validPersonal(value) && Object.keys(value).every(key => personalKeys.has(key));
}

function isServerId(value: unknown): value is string {
  return typeof value === 'string' && serverUlid.test(value);
}

/** No preview, signed-out, locked, transient, or forged short IDs. */
export function connectedPersonalScope(snapshot: SessionSnapshot): ConnectedPersonalScope | null {
  if (snapshot.status !== 'authenticated' ||
      !isServerId(snapshot.tenantId) || !isServerId(snapshot.userId) ||
      !Number.isSafeInteger(snapshot.epoch) || snapshot.epoch < 0) return null;
  return { tenantId: snapshot.tenantId, userId: snapshot.userId, epoch: snapshot.epoch };
}

/** Token refresh/epoch rollover does not lose a signed-in user's own choices. */
export function personalStorageKey(scope: ConnectedPersonalScope): string {
  if (!isServerId(scope.tenantId) || !isServerId(scope.userId) ||
      !Number.isSafeInteger(scope.epoch) || scope.epoch < 0) {
    throw Error('Verified personal preferences identity is required');
  }
  return 'hisabiq-erp-personal-v2:' + scope.tenantId + ':' + scope.userId;
}

/** No fallback to preview personalKey or global terminology/date-view keys. */
export function readConnectedPersonal(
  storage: Pick<PersonalLocalStorage, 'getItem'> | null,
  scope: ConnectedPersonalScope,
): PersonalSettings {
  const key = personalStorageKey(scope);
  try {
    const raw = storage?.getItem(key);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (strictPersonal(parsed)) return { ...personalDefaults, ...parsed };
    }
  } catch { /* Storage is optional; never fall back across identities. */ }
  return { ...personalDefaults };
}

/** Returns true only if the full validated personal choice was actually stored. */
export function writeConnectedPersonal(
  storage: Pick<PersonalLocalStorage, 'setItem'> | null,
  scope: ConnectedPersonalScope,
  value: PersonalSettings,
): boolean {
  const key = personalStorageKey(scope);
  if (!strictPersonal(value)) return false;
  try {
    if (!storage) return false;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
