import type { ServerSalesInvoiceRow } from './sales-invoices.ts';

/** Only a response keyed to the current tenant, user, token, permissions and request is visible. */
export type SalesInvoiceReadStatus = 'loading' | 'ready' | 'denied' | 'error';
export type SalesInvoiceReadState<T> =
  | { key: string; status: 'ready'; data: T }
  | { key: string; status: 'loading' | 'denied' | 'error'; data: null };

export function salesInvoiceVisibleState<T>(
  state: SalesInvoiceReadState<T> | null,
  key: string,
): { status: SalesInvoiceReadStatus; data: T | null } {
  if (!state || state.key !== key) return { status: 'loading', data: null };
  return state.status === 'ready'
    ? { status: 'ready', data: state.data }
    : { status: state.status, data: null };
}

export interface SalesInvoiceSelection {
  listKey: string;
  id: string;
}

/** An ID selected on a different filter/page/session can never open a new source. */
export function salesInvoiceSelectedId(
  selected: SalesInvoiceSelection | null,
  currentListKey: string,
  verifiedRows: readonly ServerSalesInvoiceRow[],
): string | null {
  return selected?.listKey === currentListKey &&
    verifiedRows.some(row => row.id === selected.id)
    ? selected.id : null;
}

/**
 * Exact server minor-unit amount, including signed dues and safe-integer extremes.
 * Uses proportional fonts; no JavaScript floating-point division or rounded totals.
 */
export function formatSalesInvoiceMoney(minor: number | null | undefined): string {
  if (minor === null || minor === undefined || !Number.isSafeInteger(minor)) return '—';
  const signed = BigInt(minor);
  const absolute = signed < 0n ? -signed : signed;
  const whole = (absolute / 100n).toLocaleString('en-IN');
  const paisa = (absolute % 100n).toString().padStart(2, '0');
  return (signed < 0n ? '−' : '') + '৳' + whole + '.' + paisa;
}
