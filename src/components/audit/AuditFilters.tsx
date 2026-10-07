import React from 'react';
import { Search } from 'lucide-react';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import type { EntryDateView } from '../../types/transactions';
import type { AuditSourceRecord } from '../../types/audit';

export type AuditFilterState = {
  search: string;
  from: string;
  to: string;
  source: string;
  party: string;
  account: string;
  postedBy: string;
  changedBy: string;
  status: string;
  changed: string;
};

export function AuditFilters({
  value,
  onChange,
  records,
  changedByOptions,
  dateView
}: {
  value: AuditFilterState;
  onChange: (value: AuditFilterState) => void;
  records: AuditSourceRecord[];
  changedByOptions: string[];
  dateView: EntryDateView;
}) {
  const sources = Array.from(new Set(records.map((item) => item.source))).sort();
  const parties = Array.from(new Set(records.map((item) => item.party).filter(Boolean) as string[])).sort();
  const accounts = Array.from(new Set(records.flatMap((item) => [
    ...(item.paymentAccounts ?? []).map((payment) => payment.account),
    item.fromAccount,
    item.toAccount
  ].filter(Boolean) as string[]))).sort();
  const postedBy = Array.from(new Set(records.map((item) => item.postedBy))).sort();
  const patch = (next: Partial<AuditFilterState>) => onChange({ ...value, ...next });

  const quickDate = (from: string, to = from) => patch({ from, to });

  return (
    <div className="space-y-2 border-b border-ink-100 p-3">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1 xl:max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input className="pl-8" value={value.search} onChange={(event) => patch({ search: event.target.value })} placeholder="Search invoice, voucher, party, account, reference or amount" />
        </div>
        <div className="flex gap-1 rounded-lg border border-ink-100 bg-white p-1">
          <button type="button" onClick={() => quickDate('2026-10-07')} className="rounded-md px-2 py-1 text-[10.5px] font-medium text-ink-600 hover:bg-ink-50">Today</button>
          <button type="button" onClick={() => quickDate('2026-10-06')} className="rounded-md px-2 py-1 text-[10.5px] font-medium text-ink-600 hover:bg-ink-50">Yesterday</button>
          <button type="button" onClick={() => quickDate('2026-10-01', '2026-10-31')} className="rounded-md px-2 py-1 text-[10.5px] font-medium text-ink-600 hover:bg-ink-50">This month</button>
        </div>
        <Input className="xl:w-36" type="date" value={value.from} onChange={(event) => patch({ from: event.target.value })} aria-label="From date" />
        <Input className="xl:w-36" type="date" value={value.to} onChange={(event) => patch({ to: event.target.value })} aria-label="To date" />
        <span className="whitespace-nowrap text-[10.5px] text-ink-400">{dateView === 'transaction' ? 'Transaction Date' : 'Created Date'}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <FormSelect className="w-44" value={value.source} onChange={(event) => patch({ source: event.target.value })} options={['All sources', ...sources]} />
        <FormSelect className="w-44" value={value.party} onChange={(event) => patch({ party: event.target.value })} options={['All parties', ...parties]} />
        <FormSelect className="w-52" value={value.account} onChange={(event) => patch({ account: event.target.value })} options={['All accounts', ...accounts]} />
        <FormSelect className="w-40" value={value.postedBy} onChange={(event) => patch({ postedBy: event.target.value })} options={['All posters', ...postedBy]} />
        <FormSelect className="w-40" value={value.changedBy} onChange={(event) => patch({ changedBy: event.target.value })} options={['All changers', ...changedByOptions]} />
        <FormSelect className="w-36" value={value.status} onChange={(event) => patch({ status: event.target.value })} options={['All status', 'Posted', 'Deleted']} />
        <FormSelect className="w-40" value={value.changed} onChange={(event) => patch({ changed: event.target.value })} options={['Changed or not', 'Changed', 'Unchanged']} />
        <button type="button" onClick={() => onChange({
          search: '', from: '2026-10-01', to: '2026-10-07', source: 'All sources',
          party: 'All parties', account: 'All accounts', postedBy: 'All posters',
          changedBy: 'All changers', status: 'All status', changed: 'Changed or not'
        })} className="px-2 py-1 text-[11px] font-medium text-ink-400 hover:text-ink">Reset</button>
      </div>
    </div>
  );
}
