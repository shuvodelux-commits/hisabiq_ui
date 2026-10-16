import type { FinanceAccount, FinancePaymentSplit } from '../data/financeAccounts';

export type FinancePaymentDraft = {
  id: string;
  method: 'Cash' | 'Bank' | 'Mobile Banking';
  accountId: string;
  amount: string;
};

export function accountsForFinanceMethod(accounts: FinanceAccount[], method: FinancePaymentDraft['method']) {
  return accounts.filter((account) => {
    if (account.status !== 'Active') return false;
    if (method === 'Cash') return account.type === 'Cash' || account.type === 'Petty Cash';
    if (method === 'Bank') return account.type === 'Bank';
    return account.type === 'Mobile Banking';
  });
}

export function normalizeFinancePaymentSplits(
  rows: FinancePaymentDraft[],
  accounts: FinanceAccount[],
  totalFallback: number
): FinancePaymentSplit[] {
  return rows.map((row) => {
    const account = accounts.find((item) => item.id === row.accountId);
    return {
      method: row.method,
      account: account?.name ?? '',
      accountId: account?.id ?? '',
      amount: row.amount.trim() === '' && rows.length === 1 ? totalFallback : Number(row.amount)
    };
  }).filter((row) => row.accountId && Number.isFinite(row.amount) && row.amount > 0);
}

/** Every entered row must survive normalization and match the draft total. */
export function financePaymentSplitsAreValid(rows: FinancePaymentDraft[], accounts: FinanceAccount[], total: number): boolean {
  const normalized = normalizeFinancePaymentSplits(rows, accounts, total);
  return Number.isFinite(total) && total > 0 && rows.length > 0 && normalized.length === rows.length
    && Math.abs(normalized.reduce((sum, row) => sum + row.amount, 0) - total) <= 0.001;
}

