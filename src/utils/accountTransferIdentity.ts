import type { AccountTransfer, FinanceAccount } from '../data/financeAccounts';

export type TransferEndpoint = 'from' | 'to';

export function financeAccountIdentityLabel(account: FinanceAccount, accounts: FinanceAccount[]): string {
  const sameName = accounts.filter((item) => item.name === account.name);
  if (sameName.length < 2) return account.name;
  const numberIsUnique = !!account.number && sameName.filter((item) => item.number === account.number).length === 1;
  const identity = numberIsUnique ? account.number : account.id;
  return `${account.name} · ${identity}`;
}

/** Prefer a stored account ID. Resolve legacy names only when they identify one account. */
export function transferAccountId(
  transfer: AccountTransfer,
  endpoint: TransferEndpoint,
  accounts: FinanceAccount[]
): string | undefined {
  const id = endpoint === 'from' ? transfer.fromAccountId : transfer.toAccountId;
  if (id) return accounts.some((account) => account.id === id) ? id : undefined;
  const name = endpoint === 'from' ? transfer.from : transfer.to;
  const matches = accounts.filter((account) => account.name === name);
  return matches.length === 1 ? matches[0].id : undefined;
}

/** Current account names follow stable IDs; unresolved legacy rows keep their stored labels. */
export function transferAccountName(
  transfer: AccountTransfer,
  endpoint: TransferEndpoint,
  accounts: FinanceAccount[]
): string {
  const name = endpoint === 'from' ? transfer.from : transfer.to;
  const id = transferAccountId(transfer, endpoint, accounts);
  return accounts.find((account) => account.id === id)?.name ?? name;
}

export function transferAccountLabel(
  transfer: AccountTransfer,
  endpoint: TransferEndpoint,
  accounts: FinanceAccount[]
): string {
  const id = transferAccountId(transfer, endpoint, accounts);
  const account = accounts.find((item) => item.id === id);
  return account ? financeAccountIdentityLabel(account, accounts) : transferAccountName(transfer, endpoint, accounts);
}

