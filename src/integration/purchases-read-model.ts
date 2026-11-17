import type { ServerPurchaseListRow } from './purchases.ts';

/**
 * Purchase list display projection only.
 * Server poisha, not frontend floating point, is authoritative.
 * Missing cost data means permission redaction, NOT a zero balance.
 */
export function purchaseMoney(minor: number | null | undefined): string {
  if (!Number.isSafeInteger(minor) || minor === undefined || minor === null || minor < 0) return '—';
  const value = BigInt(minor);
  const whole = (value / 100n).toString();
  const fraction = (value % 100n).toString().padStart(2, '0');
  const head = whole.slice(0, -3);
  const groupedHead = head.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const integral = head ? groupedHead + ',' + whole.slice(-3) : whole;
  return '৳' + integral + '.' + fraction;
}

export type PurchaseSettlement = 'PAID' | 'PARTIAL' | 'DUE' | 'VOIDED' | 'HIDDEN';
export function purchaseSettlement(row: ServerPurchaseListRow): PurchaseSettlement {
  if (row.status === 'VOIDED') return 'VOIDED';
  if (row.grandTotalMinor === undefined || row.paidMinor === undefined ||
      row.dueMinor === undefined) return 'HIDDEN';
  if (row.dueMinor === 0) return 'PAID';
  if (row.paidMinor > 0) return 'PARTIAL';
  return 'DUE';
}

/**
 * React state is only renderable when it belongs to the current verified
 * tenant/user/epoch/token AND the current filter/pagination request.
 * Even before useEffect cleanup runs, the old account's data is invisible.
 */
export type PurchaseReadStatus = 'loading' | 'ready' | 'denied' | 'error';
export type IdentityBoundPurchaseState<T> =
  | { key: string; status: 'ready'; data: T }
  | { key: string; status: 'loading' | 'denied' | 'error'; data: null };

export function purchaseVisibleState<T>(
  state: IdentityBoundPurchaseState<T> | null,
  currentKey: string,
): { status: PurchaseReadStatus; data: T | null } {
  if (!state || state.key !== currentKey) return { status: 'loading', data: null };
  if (state.status !== 'ready') return { status: state.status, data: null };
  return { status: 'ready', data: state.data };
}
