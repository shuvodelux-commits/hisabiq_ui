import type { BankEntryPayload, BankEntryType } from '../utils/bankEntry';

export type BankAccountOption = {
  id: string;
  name: string;
  bankName: string;
  currentBalance: number;
  type: 'Bank' | 'Mobile Banking';
};

export type BankBootstrap = {
  ok: true;
  accounts: BankAccountOption[];
  entryTypes: Array<{ key: BankEntryType; label: string; direction: string; contra: string | null }>;
  activeCashSession: boolean;
};

export type BankLedgerEntry = {
  entryId: string;
  date: string;
  type: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
};

async function bankRequest<T>(path: string, options?: RequestInit): Promise<T> {
  // Matches the existing BanijjIQ token contract. No credentials are written
  // or invented by the standalone HisabIQ UI preview.
  const token = window.localStorage.getItem('shererp_auth_token');
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options?.headers
    }
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || data.ok !== true) {
    const message = typeof data?.error === 'string' ? data.error
      : response.status === 401 ? 'Sign in to the connected ERP to record a bank entry.'
      : 'Bank API is unavailable in this standalone UI preview.';
    throw new Error(message);
  }
  return data as T;
}

export function getBankEntryBootstrap(): Promise<BankBootstrap> {
  return bankRequest('/api/bank/ledger/bootstrap');
}

export function recordBankEntry(payload: BankEntryPayload): Promise<{ ok: true; bankAccountId: string; newBalance: number }> {
  return bankRequest('/api/bank/manual-entry', { method: 'POST', body: JSON.stringify(payload) });
}

export function getBankEntryLedger(accountId: string): Promise<{ ok: true; entries: BankLedgerEntry[] }> {
  return bankRequest(`/api/bank/ledger?bankAccountId=${encodeURIComponent(accountId)}&limit=50`);
}
