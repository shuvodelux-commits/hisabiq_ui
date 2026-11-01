import { taka } from './currency.ts';

const labels: Record<string, string> = {
  transactionDate: 'Transaction Date',
  reference: 'Reference',
  party: 'Party / Person',
  partyId: 'Party ID',
  amount: 'Amount',
  paid: 'Paid',
  due: 'Due',
  cogs: 'Cost of goods',
  paymentAccounts: 'Payment accounts',
  quantity: 'Quantity',
  returnedQuantity: 'Already returned',
  description: 'Description',
  note: 'Internal note',
  expenseAccountId: 'Expense category',
  debitAccountId: 'Debit account',
  creditAccountId: 'Credit account',
  fromAccount: 'From account',
  toAccount: 'To account',
  status: 'Status'
};

const moneyFields = new Set(['amount', 'paid', 'due', 'cogs']);

export function auditFieldLabel(field: string): string {
  return labels[field] ?? field.replace(/([a-z])([A-Z])/g, '$1 $2');
}

/** UI-only formatting; never changes the values used by the audit engine. */
export function formatAuditValue(field: string, value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';

  if (field === 'paymentAccounts' && Array.isArray(value)) {
    const rows = value.map((item) => {
      if (!item || typeof item !== 'object') return String(item);
      const payment = item as { account?: unknown; amount?: unknown };
      const account = typeof payment.account === 'string' ? payment.account : 'Account';
      const amount = typeof payment.amount === 'number' && Number.isFinite(payment.amount)
        ? ' · ' + taka(payment.amount) : '';
      return account + amount;
    });
    return rows.join(' + ') || '—';
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '—';
    return moneyFields.has(field)
      ? taka(value)
      : value.toLocaleString('en-IN', { maximumFractionDigits: 12 });
  }

  if (Array.isArray(value)) {
    return value.map((item) => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(', ') || '—';
  }

  if (typeof value === 'object') return JSON.stringify(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}
