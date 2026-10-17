import type { FinanceAccount } from '../data/financeAccounts.ts';
import type { ChequeRecord } from '../data/cheques.ts';

/** Prefer the persisted account ID; accept a legacy display name only when it is unique. */
export function resolveChequeAccount(accounts: FinanceAccount[], cheque: Pick<ChequeRecord, 'depositAccount' | 'depositAccountId'>, activeOnly = false) {
  const matches = cheque.depositAccountId
    ? accounts.filter(account => account.id === cheque.depositAccountId)
    : accounts.filter(account => account.name === cheque.depositAccount);
  const eligible = matches.filter(account => account.type === 'Bank' && (!activeOnly || account.status === 'Active'));
  return eligible.length === 1 ? eligible[0] : undefined;
}

/** Clearing requires a uniquely identified active bank account. */
export function chequeMoneyAccount(accounts: FinanceAccount[], cheque: Pick<ChequeRecord, 'depositAccount' | 'depositAccountId'>) {
  return resolveChequeAccount(accounts, cheque, true);
}

/** Rename only cheque records known to belong to this account. Ambiguous legacy names stay untouched. */
export function renameChequeAccountReferences(
  cheques: ChequeRecord[],
  accountsBeforeUpdate: FinanceAccount[],
  account: FinanceAccount,
  previousName: string
) {
  const legacyNameIsUnique = accountsBeforeUpdate.filter(item => item.name === previousName && item.type === 'Bank').length === 1;
  return cheques.map(cheque => {
    const isLinkedById = cheque.depositAccountId === account.id;
    const isUniqueLegacyLink = !cheque.depositAccountId && legacyNameIsUnique && cheque.depositAccount === previousName;
    return isLinkedById || isUniqueLegacyLink
      ? { ...cheque, depositAccountId: account.id, depositAccount: account.name }
      : cheque;
  });
}
