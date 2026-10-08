import React from 'react';
import { Search } from 'lucide-react';
import { AppSelect } from '../AppSelect';
import { AppDateRangePicker } from '../AppDateRangePicker';
import { datePreset } from '../../utils/dateRange';
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


  return (
    <div className="space-y-2 border-b border-border p-3">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1 xl:max-w-md">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input className="pl-8" value={value.search} onChange={(event) => patch({ search: event.target.value })} placeholder="Search invoice, voucher, party, account, reference or amount" />
        </div>
        <AppDateRangePicker label="Audit date range" className="w-full sm:w-[265px]"
          value={{ from: value.from, to: value.to }} onChange={(range) => patch(range)} />
        <span className="whitespace-nowrap text-[10.5px] text-ink-400">{dateView === 'transaction' ? 'Transaction Date' : 'Created Date'}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <AppSelect label="Source" className="w-44" value={value.source} onChange={(next) => patch({ source: next })} options={['All sources', ...sources]} />
        <AppSelect label="Party" className="w-44" value={value.party} onChange={(next) => patch({ party: next })} options={['All parties', ...parties]} />
        <AppSelect label="Account" className="w-52" value={value.account} onChange={(next) => patch({ account: next })} options={['All accounts', ...accounts]} />
        <AppSelect label="Posted by" className="w-40" value={value.postedBy} onChange={(next) => patch({ postedBy: next })} options={['All posters', ...postedBy]} />
        <AppSelect label="Changed by" className="w-40" value={value.changedBy} onChange={(next) => patch({ changedBy: next })} options={['All changers', ...changedByOptions]} />
        <AppSelect label="Status" className="w-36" value={value.status} onChange={(next) => patch({ status: next })} options={['All status', 'Posted', 'Deleted']} />
        <AppSelect label="Changed" className="w-40" value={value.changed} onChange={(next) => patch({ changed: next })} options={['Changed or not', 'Changed', 'Unchanged']} />
        <button type="button" onClick={() => onChange({
          search: '', ...datePreset('This month'), source: 'All sources',
          party: 'All parties', account: 'All accounts', postedBy: 'All posters',
          changedBy: 'All changers', status: 'All status', changed: 'Changed or not'
        })} className="px-2 py-1 text-[11px] font-medium text-ink-400 hover:text-ink">Reset</button>
      </div>
    </div>
  );
}

