import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import type { FinanceAccount, FinancePaymentSplit } from '../../data/financeAccounts';
import { taka } from '../../utils/currency';

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
  return rows.map((row, index) => {
    const account = accounts.find((item) => item.id === row.accountId);
    return {
      method: row.method,
      account: account?.name ?? '',
      accountId: account?.id ?? '',
      amount: parseFloat(row.amount) || (rows.length === 1 && index === 0 ? totalFallback : 0)
    };
  }).filter((row) => row.accountId && row.amount > 0);
}

export function FinancePaymentSplitEditor({
  accounts,
  rows,
  onChange,
  totalAmount
}: {
  accounts: FinanceAccount[];
  rows: FinancePaymentDraft[];
  onChange: (rows: FinancePaymentDraft[]) => void;
  totalAmount: number;
}) {
  const normalized = normalizeFinancePaymentSplits(rows, accounts, totalAmount);
  const splitTotal = normalized.reduce((sum, row) => sum + row.amount, 0);

  const add = () => {
    const method: FinancePaymentDraft['method'] = 'Cash';
    onChange([...rows, {
      id: 'finance-payment-' + Date.now(),
      method,
      accountId: accountsForFinanceMethod(accounts, method)[0]?.id ?? '',
      amount: ''
    }]);
  };

  return (
    <div className="rounded-xl border border-border sm:col-span-2">
      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
        <div>
          <p className="text-[12.5px] font-semibold text-ink">Payment sources</p>
          <p className="font-bn text-[10.5px] text-ink-400">Cash + Bank + Mobile Banking একসাথে ব্যবহার করা যাবে</p>
        </div>
        <Button variant="outline" size="sm" onClick={add}><Plus className="size-3.5" /> Add</Button>
      </div>
      <div className="space-y-2 p-3">
        {rows.map((row) => {
          const available = accountsForFinanceMethod(accounts, row.method);
          const selected = available.find((item) => item.id === row.accountId) ?? available[0];
          return (
            <div key={row.id} className="grid gap-2 sm:grid-cols-[130px_1fr_120px_32px]">
              <FormSelect
                value={row.method}
                onChange={(event) => {
                  const method = event.target.value as FinancePaymentDraft['method'];
                  const first = accountsForFinanceMethod(accounts, method)[0];
                  onChange(rows.map((item) => item.id === row.id ? { ...item, method, accountId: first?.id ?? '' } : item));
                }}
                options={['Cash', 'Bank', 'Mobile Banking']}
              />
              <FormSelect
                value={selected?.name ?? ''}
                onChange={(event) => {
                  const account = available.find((item) => item.name === event.target.value);
                  onChange(rows.map((item) => item.id === row.id ? { ...item, accountId: account?.id ?? '' } : item));
                }}
                options={available.map((item) => item.name)}
              />
              <Input
                className="text-right"
                inputMode="decimal"
                value={row.amount}
                onChange={(event) => onChange(rows.map((item) => item.id === row.id ? { ...item, amount: event.target.value.replace(/[^\d.]/g, '') } : item))}
                placeholder={rows.length === 1 ? String(totalAmount || 0) : '0'}
              />
              <button
                type="button"
                disabled={rows.length === 1}
                onClick={() => onChange(rows.filter((item) => item.id !== row.id))}
                className="flex size-8 items-center justify-center rounded-md text-ink-400 hover:bg-danger/5 hover:text-danger disabled:opacity-30"
                aria-label="Remove payment source">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
        <div className="flex items-center justify-between border-t border-border pt-2 text-[11px]">
          <span className="text-ink-400">Split total</span>
          <span className={Math.abs(splitTotal - totalAmount) < 0.001 ? 'font-medium text-success' : 'font-medium text-warning'}>{taka(splitTotal)}</span>
        </div>
      </div>
    </div>
  );
}

