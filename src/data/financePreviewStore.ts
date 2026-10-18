import type { SetStateAction } from 'react';
import {
  financeAccounts as seedAccounts,
  financeTransactions as seedTransactions,
  financePeople as seedPeople,
  type FinanceAccount,
  type FinanceTransaction,
  type FinancePerson
} from './financeAccounts.ts';

/** Shared in-memory finance preview for both /app/finance and /app/counter.
 *  This does not post to a bank or backend; page navigation must not discard a
 *  transaction that was confirmed in the Counter preview.
 */
type FinancePreviewState = {
  accounts: FinanceAccount[];
  transactions: FinanceTransaction[];
  people: FinancePerson[];
};
const fresh = (): FinancePreviewState => ({
  accounts: seedAccounts.map(account => ({ ...account })),
  transactions: seedTransactions.map(transaction => ({
    ...transaction,
    paymentAccounts: transaction.paymentAccounts?.map(payment => ({ ...payment }))
  })),
  people: seedPeople.map(person => ({ ...person, roles: [...person.roles] }))
});

let state = fresh();
const listeners = new Set<() => void>();
export const getFinancePreviewSnapshot = (): FinancePreviewState => state;
export const subscribeFinancePreview = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
export function updateFinancePreview<K extends keyof FinancePreviewState>(
  key: K,
  change: SetStateAction<FinancePreviewState[K]>
): void {
  const current = state[key];
  const next = typeof change === 'function'
    ? (change as (previous: FinancePreviewState[K]) => FinancePreviewState[K])(current)
    : change;
  if (Object.is(current, next)) return;
  state = { ...state, [key]: next };
  listeners.forEach(listener => listener());
}
export function resetFinancePreviewForTest(): void {
  state = fresh();
  listeners.forEach(listener => listener());
}
