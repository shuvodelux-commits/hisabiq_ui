import type { FinanceAccount } from '../data/financeAccounts.ts';

/** Legacy cheque records store a name: reject missing, inactive or ambiguous accounts. */
export function chequeMoneyAccount(accounts: FinanceAccount[], name?: string) {
  const matches = accounts.filter(account => account.name === name && account.type === 'Bank' && account.status === 'Active');
  return matches.length === 1 ? matches[0] : undefined;
}
