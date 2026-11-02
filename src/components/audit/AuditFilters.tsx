import { Search } from 'lucide-react';
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
  const additionalCount = [value.party !== 'All parties', value.account !== 'All accounts', value.postedBy !== 'All posters', value.changedBy !== 'All changers', value.changed !== 'Changed or not'].filter(Boolean).length;
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


  return (
    <div className="space-y-2 border-b border-border p-3">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1 xl:max-w-md">
          <Search className="pointer-events-none absolute z-10 left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          <Input aria-label={text('Search audit transactions','অডিট লেনদেন খুঁজুন')} className="pl-8" value={value.search} onChange={(event) => patch({ search: event.target.value })} placeholder={text("Search invoice, voucher, party, account, reference or amount","বিল, ভাউচার, নাম, হিসাব, নম্বর বা টাকা খুঁজুন")} />
        </div>
        <AppDateRangePicker label={text("Audit date range","যাচাইয়ের তারিখ")} className="w-full sm:w-[265px]"
          value={{ from: value.from, to: value.to }} onChange={(range) => patch(range)} />
        <span className="whitespace-nowrap text-[10.5px] text-ink-400">{text(dateView === 'transaction' ? 'Transaction Date' : 'Created Date',dateView === 'transaction'?'লেনদেনের তারিখ':'লেখার তারিখ')}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AppSelect label={text("Source","লেনদেনের উৎস")} className="min-w-[128px] flex-1 sm:w-44 sm:flex-none" value={value.source} onChange={(next) => patch({ source: next })} options={[{value:'All sources',label:text('All sources','সব উৎস')},...sources.map(s=>({value:s,label:text(s,sourceBn[s]??s)}))]} />
        <AppSelect label={text("Status","অবস্থা")} className="min-w-[116px] flex-1 sm:w-36 sm:flex-none" value={value.status} onChange={(next) => patch({ status: next })} options={['All status', 'Posted', 'Deleted'].map(v=>({value:v,label:text(v,v==='All status'?'সব অবস্থা':v==='Posted'?'লেখা হয়েছে':'মুছে ফেলা')}))} />
        <Button type="button" variant="outline" size="sm" aria-expanded={showMore} aria-controls="audit-more-filters" onClick={() => setShowMore((current) => !current)} className="gap-1.5">
          {text(showMore?'Fewer filters':'More filters',showMore?'কম ফিল্টার':'আরও ফিল্টার')}
          {!!additionalCount && <span className="rounded-md bg-accent px-1.5 text-[11px] text-accent-foreground">{additionalCount}</span>}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange({
          search: '', ...datePreset('This month'), source: 'All sources',
          party: 'All parties', account: 'All accounts', postedBy: 'All posters',
          changedBy: 'All changers', status: 'All status', changed: 'Changed or not'
        })} className="text-ink-500">{text('Reset','ফিল্টার মুছুন')}</Button>
      </div>

      <div id="audit-more-filters" className={showMore ? 'flex flex-wrap gap-2 pt-1' : 'hidden'}>
        <AppSelect label={text("Party","পক্ষ")} className="min-w-[136px] flex-1 sm:w-44 sm:flex-none" value={value.party} onChange={(next) => patch({ party: next })} options={[{value:'All parties',label:text('All parties','সব পক্ষ')},...parties]} />
        <AppSelect label={text("Account","হিসাব")} className="min-w-[136px] flex-1 sm:w-52 sm:flex-none" value={value.account} onChange={(next) => patch({ account: next })} options={[{value:'All accounts',label:text('All accounts','সব হিসাব')},...accounts]} />
        <AppSelect label={text("Posted by","যিনি লিখেছেন")} className="min-w-[136px] flex-1 sm:w-40 sm:flex-none" value={value.postedBy} onChange={(next) => patch({ postedBy: next })} options={[{value:'All posters',label:text('All posters','সব ব্যবহারকারী')},...postedBy]} />
        <AppSelect label={text("Changed by","যিনি বদলেছেন")} className="min-w-[136px] flex-1 sm:w-40 sm:flex-none" value={value.changedBy} onChange={(next) => patch({ changedBy: next })} options={[{value:'All changers',label:text('All changers','সব সংশোধনকারী')},...changedByOptions]} />
        <AppSelect label={text("Changed","সংশোধিত")} className="min-w-[136px] flex-1 sm:w-40 sm:flex-none" value={value.changed} onChange={(next) => patch({ changed: next })} options={['Changed or not', 'Changed', 'Unchanged'].map(v=>({value:v,label:text(v,v==='Changed or not'?'সব লেনদেন':v==='Changed'?'বদলানো হয়েছে':'বদলানো হয়নি')}))} />
      </div>
    </div>
  );
}
