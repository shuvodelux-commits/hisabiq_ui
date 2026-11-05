import { useState } from 'react';
import { Filter, Printer, RotateCcw, Search } from 'lucide-react';
import { AppDateRangePicker } from '../AppDateRangePicker';
import { AppSelect } from '../AppSelect';
import { Button } from '../Button';
import { Input } from '../Input';
import type { IsoRange } from '../../utils/dateRange';
import {useUiCopy} from '../../i18n/useUiCopy';

type Props={
  range:IsoRange; onRange:(range:IsoRange)=>void;
  kind:string; onKind:(value:string)=>void;
  query:string; onQuery:(value:string)=>void;
  pageSize:number; onPageSize:(value:number)=>void;
  onStatement:()=>void; onReset:()=>void;
};
const kinds=[
  {value:'All types',label:'All transactions'},
  {value:'sale',label:'Sales'},
  {value:'purchase',label:'Purchases'},
  {value:'customer-payment',label:'Customer payments'},
  {value:'supplier-payment',label:'Supplier payments'},
  {value:'finance',label:'Finance'},
  {value:'opening',label:'Opening balance'},
  {value:'note',label:'Notes'}
];
export function PartyLedgerToolbarResponsive({range,onRange,kind,onKind,query,onQuery,pageSize,onPageSize,onStatement,onReset}:Props){
  const {text}=useUiCopy();
  const [filtersOpen,setFiltersOpen]=useState(false);
  const activeAdvancedCount=Number(kind!=='All types')+Number(pageSize!==25);
  const bn:Record<string,string>={'All transactions':'সব লেনদেন',Sales:'বিক্রি',Purchases:'ক্রয়','Customer payments':'ক্রেতার টাকা','Supplier payments':'সরবরাহকারীকে টাকা',Finance:'টাকার লেনদেন','Opening balance':'শুরুর জের',Notes:'মন্তব্য'};
  // Same source-backed responsive filter hierarchy as the owner's Daybook.
  // Separate visible toggles preserve DOM Tab order: phone Search→Filter→Date,
  // tablet Search→Date→Filter. One is visible at any viewport.
  const filterToggle=(visibility:string)=><Button type="button" size="icon" variant="outline"
    data-party-ledger-filter-toggle=""
    data-active-filters={activeAdvancedCount>0?'true':'false'}
    aria-label={text('Advanced filters','আরও ফিল্টার')+(activeAdvancedCount?' ('+activeAdvancedCount+')':'')}
    aria-expanded={filtersOpen} aria-controls="party-ledger-filters"
    onClick={()=>setFiltersOpen(open=>!open)}
    className={'relative size-9 shrink-0 rounded-md '+visibility+' '+(activeAdvancedCount?'border-teal-500 text-teal-700':'text-ink-500')}>
    <Filter className="size-4" aria-hidden="true"/>
    {activeAdvancedCount>0&&<span aria-hidden="true" className="absolute right-1 top-1 size-1.5 rounded-full bg-teal-500"/>}
  </Button>;

  return <div data-party-ledger-toolbar="" data-hisabiq-field-group="party-ledger"
    className="min-w-0 space-y-2 border-b border-border px-3 py-2">
    <div data-party-ledger-primary="" className="-mr-2 grid grid-cols-[minmax(0,1fr)_36px] items-center gap-2 md:grid-cols-[minmax(0,1fr)_minmax(0,245px)_36px]">
      <div className="relative min-w-0">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true"/>
        <Input aria-label={text('Search ledger transactions','খাতার লেনদেন খুঁজুন')} value={query}
          onChange={event=>onQuery(event.target.value)}
          placeholder={text('Search reference or note','নম্বর বা মন্তব্য খুঁজুন')} className="w-full pl-8"/>
      </div>
      {filterToggle('md:hidden')}
      <AppDateRangePicker label={text('Party ledger date range','পক্ষের খাতার তারিখ')} value={range} onChange={onRange}
        className="col-span-2 w-full md:col-span-1"/>
      {filterToggle('hidden md:inline-flex')}
    </div>
    <div id="party-ledger-filters" className={(filtersOpen?'grid ':'hidden ')+
      'grid-cols-1 gap-2 min-[360px]:grid-cols-2 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]'}>
      <AppSelect label={text('Transaction type','লেনদেনের ধরন')} className="min-w-0"
        value={kind} onChange={onKind}
        options={kinds.map(item=>({...item,label:text(item.label,bn[item.label]??item.label)}))}/>
      <div className="flex min-w-0 items-center gap-2">
        <AppSelect menuStyle="rows" className="min-w-0 flex-1" label={text('Rows per page','প্রতি পাতায়')}
          value={String(pageSize)} options={['5','10','25','50','100']}
          onChange={value=>onPageSize(Number(value))}/>
        <Button type="button" size="icon" variant="outline" data-ledger-filter-action="" onClick={onReset}
          aria-label={text('Clear filters','ফিল্টার মুছুন')} title={text('Clear filters','ফিল্টার মুছুন')}
          className="size-9 shrink-0 rounded-md text-ink-500">
          <RotateCcw className="size-4" aria-hidden="true"/>
        </Button>
      </div>
      <Button type="button" size="sm" variant="outline" data-ledger-filter-action="" onClick={onStatement}
        className="min-[360px]:col-span-2 md:col-span-1 md:justify-self-end">
        <Printer className="size-4" aria-hidden="true"/>{text('Print statement','হিসাব প্রিন্ট')}
      </Button>
    </div>
  </div>;
}
