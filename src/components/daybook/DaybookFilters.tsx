import { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { AppSelect } from '../AppSelect';
import { AppDateRangePicker } from '../AppDateRangePicker';
import { Button } from '../Button';
import { datePreset } from '../../utils/dateRange';
import { Input } from '../Input';
import {useUiCopy} from '../../i18n/useUiCopy';
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
  const {text}=useUiCopy();
  const [mobileFiltersOpen,setMobileFiltersOpen]=useState(false);
  const typeBn:Record<string,string>={'Sale':'বিক্রি','Purchase':'ক্রয়','Expense':'খরচ','Receipt':'টাকা পাওয়া','Payment':'টাকা দেওয়া','Transfer':'টাকা স্থানান্তর','Cash session':'ক্যাশ সেশন'};
  const types = Array.from(new Set(transactions.map((item) => item.type))).sort();
  const accounts = Array.from(new Set(transactions.flatMap((item) => item.accounts))).sort();
  const users = Array.from(new Set(transactions.map((item) => item.postedBy))).sort();
  const set = (key: keyof DaybookFilterState, next: string) => onChange({ ...value, [key]: next });
  const activeAdvancedCount=[
    value.type !== 'All types',
    value.account !== 'All accounts',
    value.user !== 'All users',
    value.status !== 'All status'
  ].filter(Boolean).length;

  return (
    <div className="space-y-2 border-b border-border p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <div className="flex min-w-0 items-center gap-2 lg:flex-1">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search className="pointer-events-none absolute z-10 left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
            <Input aria-label={text('Search transaction, party, reference or amount','লেনদেন, নাম, নম্বর বা টাকা খুঁজুন')}
              value={value.search} onChange={(event) => set('search', event.target.value)}
              className="pl-8" placeholder={text('Search transaction, party, reference or amount','লেনদেন, নাম, নম্বর বা টাকা খুঁজুন')} />
          </div>
          <Button type="button" variant="outline" size="icon"
            aria-label={text('Advanced filters','আরও ফিল্টার') + (activeAdvancedCount ? ' (' + activeAdvancedCount + ')' : '')}
            aria-expanded={mobileFiltersOpen} aria-controls="daybook-advanced-filters"
            onClick={() => setMobileFiltersOpen(open => !open)}
            className={'relative size-9 shrink-0 rounded-md lg:hidden ' +
              (activeAdvancedCount ? 'border-teal-500 text-teal-700' : 'text-ink-500')}>
            <Filter className="size-4" aria-hidden="true" />
            {activeAdvancedCount > 0 && <span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-teal-500" />}
          </Button>
        </div>
        <AppDateRangePicker label={text('Daybook date range','দৈনিক খাতার তারিখ')} className="w-full lg:w-[265px]"
          value={{ from: value.from, to: value.to }}
          onChange={({ from, to }) => onChange({ ...value, from, to })} />
        <span className="hidden whitespace-nowrap text-[10.5px] text-ink-400 lg:block">
          {dateView === 'transaction' ? text('Transaction Date · যে তারিখের লেনদেন','লেনদেনের তারিখ') : text('Created Date · যেদিন এন্ট্রি হয়েছে','লেখার তারিখ')}
        </span>
      </div>
      <div id="daybook-advanced-filters" className={(mobileFiltersOpen ? 'flex ' : 'hidden ') + 'flex-wrap items-center gap-2 lg:flex'}>
        <AppSelect label={text('Transaction type','লেনদেনের ধরন')} className="min-w-[128px] flex-1 sm:w-40 lg:flex-none" value={value.type} onChange={(type) => set('type', type)} options={[{value:'All types',label:text('All types','সব ধরন')},...types.map(v=>({value:v,label:text(v,typeBn[v]??v)}))]} />
        <AppSelect label={text('Account','হিসাব')} className="min-w-[128px] flex-1 sm:w-44 lg:flex-none" value={value.account} onChange={(account) => set('account', account)} options={[{value:'All accounts',label:text('All accounts','সব হিসাব')},...accounts]} />
        <AppSelect label={text('Posted by','যিনি লিখেছেন')} className="min-w-[128px] flex-1 sm:w-36 lg:flex-none" value={value.user} onChange={(user) => set('user', user)} options={[{value:'All users',label:text('All users','সব ব্যবহারকারী')},...users]} />
        <AppSelect label={text('Status','অবস্থা')} className="min-w-[128px] flex-1 sm:w-36 lg:flex-none" value={value.status} onChange={(status) => set('status', status)} options={['All status', 'Posted', 'Draft', 'Deleted', 'Reversed'].map(v=>({value:v,label:text(v,v==='All status'?'সব অবস্থা':v==='Posted'?'লেখা হয়েছে':v==='Draft'?'খসড়া':v==='Deleted'?'মুছে ফেলা':'উল্টো হিসাব')}))} />
        <button type="button" onClick={() => onChange({ search: '', ...datePreset('Today'), type: 'All types', account: 'All accounts', user: 'All users', status: 'All status' })}
          className="min-h-9 rounded-md px-2 text-[11px] font-medium text-ink-400 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">{text('Reset','ফিল্টার মুছুন')}</button>
      </div>
    </div>
  );
}
