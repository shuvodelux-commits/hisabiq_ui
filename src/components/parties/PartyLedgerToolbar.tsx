import React from 'react';
import { Printer, Search, X } from 'lucide-react';
import { AppDateRangePicker } from '../AppDateRangePicker';
import { AppSelect } from '../AppSelect';
import { Button } from '../Button';
import { Input } from '../Input';
import type { IsoRange } from '../../utils/dateRange';

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
export function PartyLedgerToolbar({range,onRange,kind,onKind,query,onQuery,pageSize,onPageSize,onStatement,onReset}:Props){
  return <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
    <AppDateRangePicker label="Party ledger date range" value={range} onChange={onRange}/>
    <AppSelect compact label="Transaction type" value={kind} onChange={onKind} options={kinds}/>
    <div className="relative min-w-[150px] flex-1">
      <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-ink-400"/>
      <Input aria-label="Search ledger transactions" value={query} onChange={event=>onQuery(event.target.value)}
        placeholder="Search reference or note" className="pl-8"/>
    </div>
    <AppSelect compact label="Rows per page" value={String(pageSize)} options={['10','25','50','100']}
      onChange={value=>onPageSize(Number(value))}/>
    <Button size="sm" variant="outline" onClick={onReset} title="Clear filters"><X className="size-3.5"/> Clear filters</Button>
    <Button size="sm" variant="outline" onClick={onStatement}><Printer className="size-3.5"/> Print statement</Button>
  </div>;
}
