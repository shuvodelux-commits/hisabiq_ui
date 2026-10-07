import React from 'react';
import { Search } from 'lucide-react';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import type { AuditSourceRecord } from '../../types/audit';

export type AuditFilterState = {
  search: string;
  from: string;
  to: string;
  source: string;
  status: string;
};

export function AuditFilters({
  value,
  onChange,
  records
}: {
  value: AuditFilterState;
  onChange: (value: AuditFilterState) => void;
  records: AuditSourceRecord[];
}) {
  const sources = Array.from(new Set(records.map((item) => item.source)));
  const patch = (next: Partial<AuditFilterState>) => onChange({ ...value, ...next });
  return (
    <div className="flex flex-col gap-2 border-b border-ink-100 p-3 xl:flex-row xl:items-center">
      <div className="relative min-w-0 flex-1 xl:max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
        <Input className="pl-8" value={value.search} onChange={(event) => patch({ search: event.target.value })} placeholder="Search invoice, voucher, party or reference" />
      </div>
      <Input className="xl:w-36" type="date" value={value.from} onChange={(event) => patch({ from: event.target.value })} aria-label="From date" />
      <Input className="xl:w-36" type="date" value={value.to} onChange={(event) => patch({ to: event.target.value })} aria-label="To date" />
      <FormSelect className="xl:w-44" value={value.source} onChange={(event) => patch({ source: event.target.value })} options={['All sources', ...sources]} />
      <FormSelect className="xl:w-36" value={value.status} onChange={(event) => patch({ status: event.target.value })} options={['All status', 'Posted', 'Deleted']} />
    </div>
  );
}
