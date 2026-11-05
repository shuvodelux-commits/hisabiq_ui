import { useState } from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';
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
  transactions
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

  // Two breakpoint-specific instances keep keyboard tab order identical to visual order:
  // phone Search → Filter → Date; tablet Search → Date → Filter.
  // Exactly one filter button is visible at any viewport; both share one state.
  const filterToggle = (visibility: string) => (
    <Button type="button" variant="outline" size="icon"
      aria-label={text('Advanced filters','আরও ফিল্টার') + (activeAdvancedCount ? ' (' + activeAdvancedCount + ')' : '')}
      aria-expanded={mobileFiltersOpen} aria-controls="daybook-advanced-filters"
      onClick={() => setMobileFiltersOpen(open => !open)}
      className={'relative size-9 shrink-0 rounded-md ' + visibility + ' ' +
        (activeAdvancedCount ? 'border-teal-500 text-teal-700' : 'text-ink-500')}>
      <Filter className="size-4" aria-hidden="true" />
      {activeAdvancedCount > 0 && <span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-teal-500" />}
    </Button>
  );

  return (
    <div className="space-y-2 border-b border-border p-3">
      <div data-daybook-filter-bar="" className="-mr-2 grid grid-cols-[minmax(0,1fr)_36px] items-center gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,265px)_36px] lg:mr-0 lg:grid-cols-[minmax(0,1fr)_265px]">
        <div className="relative min-w-0 lg:max-w-md">
          <Search className="pointer-events-none absolute z-10 left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input aria-label={text('Search transaction, party, reference or amount','লেনদেন, নাম, নম্বর বা টাকা খুঁজুন')}
            value={value.search} onChange={(event) => set('search', event.target.value)}
            className="pl-8" placeholder={text('Search transaction, party, reference or amount','লেনদেন, নাম, নম্বর বা টাকা খুঁজুন')} />
        </div>
        {filterToggle('md:hidden')}
        <AppDateRangePicker label={text('Daybook date range','দৈনিক খাতার তারিখ')} className="col-span-2 w-full md:col-span-1"
          value={{ from: value.from, to: value.to }}
          onChange={({ from, to }) => onChange({ ...value, from, to })} />
        {filterToggle('hidden md:inline-flex lg:hidden')}
      </div>
      <div id="daybook-advanced-filters" className={(mobileFiltersOpen ? 'grid ' : 'hidden ') + 'grid-cols-1 gap-2 min-[360px]:grid-cols-2 md:grid-cols-4 lg:grid'}>
        <AppSelect label={text('Transaction type','লেনদেনের ধরন')} className="min-w-0" value={value.type} onChange={(type) => set('type', type)} options={[{value:'All types',label:text('All types','সব ধরন')},...types.map(v=>({value:v,label:text(v,typeBn[v]??v)}))]} />
        <AppSelect label={text('Account','হিসাব')} className="min-w-0" value={value.account} onChange={(account) => set('account', account)} options={[{value:'All accounts',label:text('All accounts','সব হিসাব')},...accounts]} />
        <AppSelect label={text('Posted by','যিনি লিখেছেন')} className="min-w-0" value={value.user} onChange={(user) => set('user', user)} options={[{value:'All users',label:text('All users','সব ব্যবহারকারী')},...users]} />
        <div className="flex min-w-0 items-center gap-2">
          <AppSelect label={text('Status','অবস্থা')} className="min-w-0 flex-1" value={value.status} onChange={(status) => set('status', status)} options={['All status', 'Posted', 'Draft', 'Deleted', 'Reversed'].map(v=>({value:v,label:text(v,v==='All status'?'সব অবস্থা':v==='Posted'?'লেখা হয়েছে':v==='Draft'?'খসড়া':v==='Deleted'?'মুছে ফেলা':'উল্টো হিসাব')}))} />
          <Button type="button" variant="outline" size="icon"
            aria-label={text('Reset filters','ফিল্টার মুছুন')}
            title={text('Reset all filters','সব ফিল্টার মুছুন')}
            onClick={() => onChange({ search: '', ...datePreset('Today'), type: 'All types', account: 'All accounts', user: 'All users', status: 'All status' })}
            className="size-9 shrink-0 rounded-md text-ink-500">
            <RotateCcw className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
