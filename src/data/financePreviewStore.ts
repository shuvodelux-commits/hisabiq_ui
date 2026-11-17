import {sourceDeleteAuthority} from '../deletion/authority.ts';
import type {CurrentAuthority} from '../recovery/authority.ts';
import type { SetStateAction } from 'react';
import {
  financeAccounts as seedAccounts,
  financeTransactions as seedTransactions,
  financePeople as seedPeople,
  relationshipSummary as seedRelationshipSummary,
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

// The baseline relationship cards contain historical balances outside the small
// fixture transaction list. Apply only the net change from the original fixtures,
// so Counter-created and Finance-created entries update the same balance cards.
function relationshipNet(
  transactions: readonly FinanceTransaction[],
  credit: FinanceTransaction['type'],
  debit: FinanceTransaction['type'],
  opening: FinanceTransaction['type']
): number {
  return transactions.reduce((total, transaction) => {
    if (transaction.status === 'Reversed') return total;
    if (transaction.type === credit || transaction.type === opening) return total + transaction.amount;
    if (transaction.type === debit) return total - transaction.amount;
    return total;
  }, 0);
}
export function financePreviewRelationshipSummary(transactions: readonly FinanceTransaction[] = state.transactions) {
  const change = (
    credit: FinanceTransaction['type'],
    debit: FinanceTransaction['type'],
    opening: FinanceTransaction['type']
  ) => relationshipNet(transactions, credit, debit, opening)
    - relationshipNet(seedTransactions, credit, debit, opening);
  return {
    ...seedRelationshipSummary,
    ownerCapital: seedRelationshipSummary.ownerCapital
      + change('Owner Credit', 'Owner Debit', 'Opening Owner Capital'),
    outstandingLoan: seedRelationshipSummary.outstandingLoan
      + change('Lender Credit', 'Lender Debit', 'Opening Loan'),
    borrowerReceivable: seedRelationshipSummary.borrowerReceivable
      + change('Borrower Debit', 'Borrower Credit', 'Opening Borrower Loan')
  };
}

/** Reverse one original finance source and its preview accounts in one notification. */
export function reverseFinancePreview(id:string,expectedRevision:string,reason:string,current:CurrentAuthority):FinanceTransaction {
 const audit=sourceDeleteAuthority(current,'money',id,reason);
 const source=state.transactions.find(t=>t.id===id);
 if(!source||source.status!=='Active'||JSON.stringify(source)!==expectedRevision)throw Error('Transaction changed or reversed. Reopen source review.');
 if(source.type==='Transfer')throw Error('Use the original two-account transfer review.');
 const splits=source.paymentAccounts?.length?source.paymentAccounts:source.accountId?[{accountId:source.accountId,amount:source.amount}]:[];
 if(source.direction!=='none'&&(!splits.length||splits.some(s=>!state.accounts.some(a=>a.id===s.accountId)||!Number.isFinite(s.amount)||s.amount<=0)||Math.abs(splits.reduce((n,s)=>n+s.amount,0)-source.amount)>0.001))throw Error('Complete original payment account identities and amounts are required.');
 const reversed={...source,status:'Reversed' as const,reversal:audit};
 const accounts=state.accounts.map(account=>{
  const amount=splits.filter(s=>s.accountId===account.id).reduce((n,s)=>n+s.amount,0);
  return amount&&source.direction!=='none'?{...account,balance:account.balance+(source.direction==='in'?-amount:amount),lastActivity:'Just now'}:account;
 });
 state={...state,accounts,transactions:state.transactions.map(t=>t.id===id?reversed:t)};
 listeners.forEach(fn=>fn());
 return reversed;
}
