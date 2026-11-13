/**
 * Connected Sales Return History presentation facts, isolated from preview stores.
 * Money is formatted by the existing integer-poisha purchaseMoney helper in the
 * view; source quantities are scale-3 integers and require exact decimal display.
 */
export type SalesHistoryReadStatus = 'loading' | 'ready' | 'denied' | 'error';
export type SalesHistoryReadState<T> =
  | { key: string; status: 'ready'; data: T }
  | { key: string; status: 'loading' | 'denied' | 'error'; data: null };

/**
 * Never display a previous tenant, user, epoch, token, cursor or refresh result.
 * This guard runs synchronously at render time, even before effect cleanup.
 */
export function salesHistoryVisibleState<T>(
  state: SalesHistoryReadState<T> | null,
  currentKey: string,
): { status: SalesHistoryReadStatus; data: T | null } {
  if (!state || state.key !== currentKey) return { status: 'loading', data: null };
  if (state.status !== 'ready') return { status: state.status, data: null };
  return { status: 'ready', data: state.data };
}

/** Scale-3 base quantity, exact even for the largest JSON safe integer. */
export function formatSalesHistoryQuantity(scaled: number): string {
  if (!Number.isSafeInteger(scaled) || scaled < 0) return '—';
  const value = BigInt(scaled);
  const whole = (value / 1000n).toLocaleString('en-IN');
  const fraction = (value % 1000n).toString().padStart(3, '0').replace(/0+$/, '');
  return fraction ? whole + '.' + fraction : whole;
}
