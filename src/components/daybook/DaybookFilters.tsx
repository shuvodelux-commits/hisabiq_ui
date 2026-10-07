import React from 'react';
import { Search } from 'lucide-react';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import type { EntryDateView, UnifiedTransaction } from '../../types/transactions';

export type DaybookFilterState = {
  search: string;
  from: string;
  to: string;
  type: string;
  account: string;
  user: string;
  status: string;
};

export function DaybookFilters({
  value,
  onChange,
  transactions,
  dateView
}: {
  value: DaybookFilterState;
  onChange: (next: DaybookFilterState) => void;
  transactions: UnifiedTransaction[];
  dateView: EntryDateView;
}) {
  const types = Array.from(new Set(transactions.map((item) => item.type))).sort();
  const accounts = Array.from(new Set(transactions.flatMap((item) => item.accounts))).sort();
  const users = Array.from(new Set(transactions.map((item) => item.postedBy))).sort();
  const set = (key: keyof DaybookFilterState, next: string) => onChange({ ...value, [key]: next });

  const quickDate = (from: string, to = from) => onChange({ ...value, from, to });

  return (
    <div className="space-y-2 border-b border-ink-100 p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input value={value.search} onChange={(event) => set('search', event.target.value)} className="pl-8" placeholder="Search transaction, party, reference or amount" />
        </div>
        <label className="flex items-center gap-1.5 text-[11px] text-ink-500">
          From
          <Input type="date" value={value.from} onChange={(event) => set('from', event.target.value)} className="w-[150px]" />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-ink-500">
          To
          <Input type="date" value={value.to} onChange={(event) => set('to', event.target.value)} className="w-[150px]" />
        </label>
        <span className="whitespace-nowrap text-[10.5px] text-ink-400">
          {dateView === 'transaction' ? 'Transaction Date · যে তারিখের লেনদেন' : 'Created Date · যেদিন এন্ট্রি হয়েছে'}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-lg border border-ink-100 bg-white p-1">
          <button type="button" onClick={() => quickDate('2026-10-07')} className="rounded-md px-2 py-1 text-[10.5px] font-medium text-ink-600 hover:bg-ink-50">Today</button>
          <button type="button" onClick={() => quickDate('2026-10-06')} className="rounded-md px-2 py-1 text-[10.5px] font-medium text-ink-600 hover:bg-ink-50">Yesterday</button>
          <button type="button" onClick={() => quickDate('2026-10-05', '2026-10-11')} className="rounded-md px-2 py-1 text-[10.5px] font-medium text-ink-600 hover:bg-ink-50">This week</button>
          <button type="button" onClick={() => quickDate('2026-10-01', '2026-10-31')} className="rounded-md px-2 py-1 text-[10.5px] font-medium text-ink-600 hover:bg-ink-50">This month</button>
        </div>
        <FormSelect className="w-40" value={value.type} onChange={(event) => set('type', event.target.value)} options={['All types', ...types]} />
        <FormSelect className="w-44" value={value.account} onChange={(event) => set('account', event.target.value)} options={['All accounts', ...accounts]} />
        <FormSelect className="w-36" value={value.user} onChange={(event) => set('user', event.target.value)} options={['All users', ...users]} />
        <FormSelect className="w-36" value={value.status} onChange={(event) => set('status', event.target.value)} options={['All status', 'Posted', 'Draft', 'Deleted', 'Reversed']} />
        <button type="button" onClick={() => onChange({ search: '', from: '2026-10-07', to: '2026-10-07', type: 'All types', account: 'All accounts', user: 'All users', status: 'All status' })} className="px-2 py-1 text-[11px] font-medium text-ink-400 hover:text-ink">Reset</button>
      </div>
    </div>
  );
}
