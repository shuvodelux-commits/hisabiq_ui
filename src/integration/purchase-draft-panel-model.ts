import { ApiError } from './errors.ts';
import type { SessionSnapshot } from './session.ts';
import type { ServerPurchaseDraft } from './purchase-drafts.ts';

/** MOD-008 P3: connected panel MUST NOT mount preview data or leak cross-session results. */
export type PurchaseDraftFilter = 'active' | 'deleted';
export interface PurchaseDraftPanelIdentity {
  readonly key: string;
  readonly accessToken: string;
}
export type PurchaseDraftPanelReadState =
  | { key: string; status: 'loading' | 'denied' | 'error'; data: null }
  | { key: string; status: 'ready'; data: readonly ServerPurchaseDraft[] };

const id = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
function invalid(): never {
  throw new ApiError('protocol', 'Purchase draft state could not be verified');
}

/**
 * Permissions are only a client-side display gate; the Nest tenant guard,
 * service permission check and PostgreSQL RLS enforce actual authorization.
 */
export function purchaseDraftPanelIdentity(
  mode: 'preview' | 'connected',
  snapshot: SessionSnapshot,
): PurchaseDraftPanelIdentity | null {
  if (mode !== 'connected' || snapshot.status !== 'authenticated' ||
      !id.test(snapshot.tenantId) || !id.test(snapshot.userId) ||
      !snapshot.accessToken || /\s/.test(snapshot.accessToken) ||
      !snapshot.permissions.includes('purchase.bill.create') ||
      !snapshot.permissions.includes('inventory.cost.view')) return null;
  return {
    key: [snapshot.tenantId, snapshot.userId, snapshot.epoch, snapshot.accessToken].join(':'),
    accessToken: snapshot.accessToken,
  };
}
export function purchaseDraftPanelReadKey(
  identity: string,
  filter: PurchaseDraftFilter,
  reload: number,
): string {
  if (!identity || (filter !== 'active' && filter !== 'deleted') ||
      !Number.isSafeInteger(reload) || reload < 0) return invalid();
  return JSON.stringify([identity, filter, reload]);
}

/** Old tenant, switched tab, old request, denied view => zero stale rows. */
export function visiblePurchaseDraftPanelState(
  state: PurchaseDraftPanelReadState | null,
  key: string,
): PurchaseDraftPanelReadState {
  if (!state || state.key !== key) return { key, status: 'loading', data: null };
  return state;
}

export function verifyPurchaseDraftListState(
  rows: readonly ServerPurchaseDraft[],
  filter: PurchaseDraftFilter,
): readonly ServerPurchaseDraft[] {
  if (!Array.isArray(rows) || (filter !== 'active' && filter !== 'deleted') ||
      rows.length > 100 || rows.some(row =>
        filter === 'active' ? row.deletedAt !== null : row.deletedAt === null) ||
      new Set(rows.map(row => row.id)).size !== rows.length) return invalid();
  return rows;
}

/** Never report a destructive operation successful without matching version/ID. */
export function verifyPurchaseDraftTransition(
  before: Pick<ServerPurchaseDraft, 'id' | 'version'>,
  after: ServerPurchaseDraft,
  operation: 'recycle' | 'restore',
): ServerPurchaseDraft {
  if (!id.test(before.id) || !Number.isSafeInteger(before.version) || before.version < 1 ||
      !after || before.id !== after.id || after.version !== before.version + 1 ||
      (operation === 'recycle'
        ? after.deletedAt === null || after.recoverableUntilEpochMs === null
        : after.deletedAt !== null || after.recoverableUntilEpochMs !== null)) return invalid();
  return after;
}
