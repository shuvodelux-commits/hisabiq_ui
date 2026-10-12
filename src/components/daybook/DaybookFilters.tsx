import { Search } from 'lucide-react';
import { AppSelect } from '../AppSelect';
import { AppDateRangePicker } from '../AppDateRangePicker';
import { datePreset } from '../../utils/dateRange';
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


  return (
    <div className="space-y-2 border-b border-border p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute z-10 left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input value={value.search} onChange={(event) => set('search', event.target.value)} className="pl-8" placeholder="Search transaction, party, reference or amount" />
        </div>
        <AppDateRangePicker label="Daybook date range" className="w-full sm:w-[265px]"
          value={{ from: value.from, to: value.to }}
          onChange={({ from, to }) => onChange({ ...value, from, to })} />
        <span className="whitespace-nowrap text-[10.5px] text-ink-400">
          {dateView === 'transaction' ? 'Transaction Date · যে তারিখের লেনদেন' : 'Created Date · যেদিন এন্ট্রি হয়েছে'}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <AppSelect label="Transaction type" className="w-40" value={value.type} onChange={(type) => set('type', type)} options={['All types', ...types]} />
        <AppSelect label="Account" className="w-44" value={value.account} onChange={(account) => set('account', account)} options={['All accounts', ...accounts]} />
        <AppSelect label="Posted by" className="w-36" value={value.user} onChange={(user) => set('user', user)} options={['All users', ...users]} />
        <AppSelect label="Status" className="w-36" value={value.status} onChange={(status) => set('status', status)} options={['All status', 'Posted', 'Draft', 'Deleted', 'Reversed']} />
        <button type="button" onClick={() => onChange({ search: '', ...datePreset('Today'), type: 'All types', account: 'All accounts', user: 'All users', status: 'All status' })} className="px-2 py-1 text-[11px] font-medium text-ink-400 hover:text-ink">Reset</button>
      </div>
    </div>
  );
}

