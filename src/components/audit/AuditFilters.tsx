import { Filter, RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';
import { AppSelect } from '../AppSelect';
import { AppDateRangePicker } from '../AppDateRangePicker';
import { datePreset } from '../../utils/dateRange';
import { Input } from '../Input';
import { Button } from '../Button';
import {useUiCopy} from '../../i18n/useUiCopy';
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
  const {text}=useUiCopy();
  const [showMore, setShowMore] = useState(false);
  const activeAdvancedCount = [
    value.source !== 'All sources', value.status !== 'All status',
    value.party !== 'All parties', value.account !== 'All accounts',
    value.postedBy !== 'All posters', value.changedBy !== 'All changers',
    value.changed !== 'Changed or not'
  ].filter(Boolean).length;
  const sourceBn:Record<string,string>={sale:'বিক্রি',purchase:'ক্রয়',expense:'খরচ',transfer:'হিসাবে টাকা সরানো',finance:'টাকার লেনদেন','customer-payment':'ক্রেতার টাকা','supplier-payment':'সরবরাহকারীকে টাকা','receipt-voucher':'টাকা জমার ভাউচার','payment-voucher':'টাকা দেওয়ার ভাউচার',adjustment:'সমন্বয়','opening-balance':'প্রারম্ভিক জের'};
  const sources = Array.from(new Set(records.map((item) => item.source))).sort();
  const parties = Array.from(new Set(records.map((item) => item.party).filter(Boolean) as string[])).sort();
  const accounts = Array.from(new Set(records.flatMap((item) => [
    ...(item.paymentAccounts ?? []).map((payment) => payment.account),
    item.fromAccount,
    item.toAccount
  ].filter(Boolean) as string[]))).sort();
  const postedBy = Array.from(new Set(records.map((item) => item.postedBy))).sort();
  const patch = (next: Partial<AuditFilterState>) => onChange({ ...value, ...next });


  const resetFilters = () => onChange({
    search: '', ...datePreset('This month'), source: 'All sources',
    party: 'All parties', account: 'All accounts', postedBy: 'All posters',
    changedBy: 'All changers', status: 'All status', changed: 'Changed or not'
  });
  const filterToggle = (visibility: string) => (
    <Button type="button" variant="outline" size="icon"
      data-audit-filter-toggle=""
      aria-label={text('Advanced filters','আরও ফিল্টার') + (activeAdvancedCount ? ' (' + activeAdvancedCount + ')' : '')}
      aria-expanded={showMore} aria-controls="audit-more-filters"
      onClick={() => setShowMore((current) => !current)}
      className={'relative size-9 shrink-0 rounded-md ' + visibility + ' ' +
        (activeAdvancedCount ? 'border-teal-500 text-teal-700' : 'text-ink-500')}>
      <Filter className="size-4" aria-hidden="true" />
      {activeAdvancedCount > 0 && <span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-teal-500" />}
    </Button>
  );

  return (
    <div className="space-y-2 border-b border-border p-3">
      <div data-audit-filter-bar="" className="-mr-2 grid grid-cols-[minmax(0,1fr)_36px] items-center gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,265px)_36px] lg:mr-0 lg:grid-cols-[minmax(0,1fr)_265px]">
        <div className="relative min-w-0 lg:max-w-md">
          <Search className="pointer-events-none absolute z-10 left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <Input aria-label={text('Search audit transactions','অডিট লেনদেন খুঁজুন')}
            value={value.search} onChange={(event) => patch({ search: event.target.value })}
            className="pl-8" placeholder={text('Search invoice, voucher, party, account, reference or amount','বিল, ভাউচার, নাম, হিসাব, নম্বর বা টাকা খুঁজুন')} />
        </div>
        {filterToggle('md:hidden')}
        <div data-audit-date="" className="col-span-2 min-w-0 md:col-span-1">
          <AppDateRangePicker label={text(
            dateView === 'transaction' ? 'Audit transaction date range' : 'Audit created date range',
            dateView === 'transaction' ? 'লেনদেনের তারিখ' : 'লেখার তারিখ'
          )} className="w-full" value={{ from: value.from, to: value.to }}
            onChange={(range) => patch(range)} />
        </div>
        {filterToggle('hidden md:inline-flex lg:hidden')}
      </div>

      <div id="audit-more-filters" data-audit-advanced-filters=""
        className={(showMore ? 'grid ' : 'hidden ') + 'grid-cols-1 gap-2 min-[360px]:grid-cols-2 md:grid-cols-4 lg:grid xl:grid-cols-7'}>
        <AppSelect label={text('Party','পক্ষ')} className="min-w-0" value={value.party} onChange={(next) => patch({ party: next })} options={[{value:'All parties',label:text('All parties','সব পক্ষ')},...parties]} />
        <AppSelect label={text('Account','হিসাব')} className="min-w-0" value={value.account} onChange={(next) => patch({ account: next })} options={[{value:'All accounts',label:text('All accounts','সব হিসাব')},...accounts]} />
        <AppSelect label={text('Posted by','যিনি লিখেছেন')} className="min-w-0" value={value.postedBy} onChange={(next) => patch({ postedBy: next })} options={[{value:'All posters',label:text('All posters','সব ব্যবহারকারী')},...postedBy]} />
        <AppSelect label={text('Changed by','যিনি বদলেছেন')} className="min-w-0" value={value.changedBy} onChange={(next) => patch({ changedBy: next })} options={[{value:'All changers',label:text('All changers','সব সংশোধনকারী')},...changedByOptions]} />
        <AppSelect label={text('Changed','সংশোধিত')} className="min-w-0" value={value.changed} onChange={(next) => patch({ changed: next })} options={['Changed or not','Changed','Unchanged'].map(v=>({value:v,label:text(v,v==='Changed or not'?'সব লেনদেন':v==='Changed'?'বদলানো হয়েছে':'বদলানো হয়নি')}))} />
        <AppSelect label={text('Source','লেনদেনের উৎস')} className="min-w-0" value={value.source} onChange={(next) => patch({ source: next })} options={[{value:'All sources',label:text('All sources','সব উৎস')},...sources.map(v=>({value:v,label:text(v,sourceBn[v]??v)}))]} />
        <div data-audit-status-reset="" className="flex min-w-0 items-center gap-2 min-[360px]:col-span-2 md:col-span-1">
          <AppSelect label={text('Status','অবস্থা')} className="min-w-0 flex-1" value={value.status} onChange={(next) => patch({ status: next })} options={['All status','Posted','Deleted'].map(v=>({value:v,label:text(v,v==='All status'?'সব অবস্থা':v==='Posted'?'লেখা হয়েছে':'মুছে ফেলা')}))} />
          <Button type="button" variant="outline" size="icon" onClick={resetFilters}
            aria-label={text('Reset filters','ফিল্টার মুছুন')} title={text('Reset all filters','সব ফিল্টার মুছুন')}
            className="size-9 shrink-0 rounded-md text-ink-500">
            <RotateCcw className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
