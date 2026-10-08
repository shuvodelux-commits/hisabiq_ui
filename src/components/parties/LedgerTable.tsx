import React from 'react';
import { Paperclip, StickyNote, ArrowDownLeft, ArrowUpRight, FileText, BookOpen, RefreshCcw, Minus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { StatusBadge, type StatusTone } from '../StatusBadge';
import { PartyLedgerRowActions } from './PartyLedgerRowActions';
import type { LedgerStatement, PartyAction, PartyLedgerRow } from '../../types/partyLedger';
import { formatNumber } from '../../utils/currency';
import { ledgerImpact, type LedgerImpact } from '../../utils/partyLedgerImpact';

type ActionAvailability={action:PartyAction;enabled:boolean;reason?:string};
type Row=LedgerStatement['rows'][number];
type Props={
  statement:LedgerStatement;
  visibleRows:Row[];
  actionsForRow:(row:PartyLedgerRow)=>ActionAvailability[];
  onAction:(action:PartyAction,row:PartyLedgerRow)=>void;
  onOpenAttachment:(row:PartyLedgerRow)=>void;
};
const tone=(row:PartyLedgerRow):StatusTone=>{
  const impact=ledgerImpact(row).kind;
  if(impact==='in')return 'success';
  if(impact==='out')return 'danger';
  if(impact==='due')return 'info';
  if(impact==='adjustment')return 'warning';
  return 'neutral';
};
const label=(source:PartyLedgerRow['source'])=>({
  sale:'Invoice',purchase:'Purchase',finance:'Finance',opening:'Opening',
  note:'Note','sale-return':'Sales return','purchase-return':'Purchase return',
  'customer-payment':'Payment','supplier-payment':'Payment',
  'customer-credit-refund':'Credit refund',expense:'Expense'
})[source]??source;
const money=(n:number)=>n?formatNumber(n):'—';
const impactTone:Record<LedgerImpact['kind'],string>={
 in:'text-emerald-700 dark:text-emerald-400',
 out:'text-rose-700 dark:text-rose-400',
 due:'text-sky-700 dark:text-sky-400',
 adjustment:'text-amber-700 dark:text-amber-400',
 opening:'text-ink-600',
 neutral:'text-ink-500'
};
function Impact({row}:{row:PartyLedgerRow}){
 const info=ledgerImpact(row);
 const Icon=info.kind==='in'?ArrowDownLeft:info.kind==='out'?ArrowUpRight:
  info.kind==='due'?FileText:info.kind==='opening'?BookOpen:
  info.kind==='adjustment'?RefreshCcw:Minus;
 return <span className={`inline-flex shrink-0 items-center gap-1 text-[10px] font-medium ${impactTone[info.kind]}`}
   title={info.label} aria-label={info.label}>
   <Icon className="size-3" aria-hidden="true"/>{info.label}
 </span>;
}
const amountClass=(row:PartyLedgerRow,n:number)=>n&&['in','out','due','adjustment'].includes(ledgerImpact(row).kind)
 ?impactTone[ledgerImpact(row).kind]:'text-ink';

export function LedgerTable({statement,visibleRows,actionsForRow,onAction,onOpenAttachment}:Props){
  return <div>
    <div className="flex flex-wrap justify-between gap-3 border-b border-border bg-ink-50/50 px-4 py-2 text-xs">
      <div><span className="text-ink-500">Opening balance </span><strong>{formatNumber(Math.abs(statement.openingBalance))} {statement.openingBalance>=0?'Dr':'Cr'}</strong></div>
      <div><span className="text-ink-500">Period debit </span><strong>{formatNumber(statement.periodDebit)}</strong></div>
      <div><span className="text-ink-500">Period credit </span><strong>{formatNumber(statement.periodCredit)}</strong></div>
    </div>
    <div className="hidden w-full overflow-x-auto sm:block">
      <Table>
        <TableHeader><TableRow className="hover:bg-transparent">
          <TableHead className="pl-4 text-xs">Date</TableHead><TableHead className="text-xs">Particulars</TableHead>
          <TableHead className="text-right text-xs">Debit</TableHead><TableHead className="text-right text-xs">Credit</TableHead>
          <TableHead className="text-right text-xs">Running</TableHead><TableHead className="pr-4 text-right text-xs">Actions</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {visibleRows.map(row=><TableRow key={row.id} className="text-[13px]">
            <TableCell className="whitespace-nowrap pl-4 text-xs text-ink-500">{row.date}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                {row.source==='note'&&<StickyNote className="size-3.5 text-warning"/>}
                <StatusBadge tone={tone(row.source)}>{label(row.source)}</StatusBadge>
                {row.reference&&<span className="font-medium text-ink">{row.reference}</span>}
                <Impact row={row}/>
                {row.attachment&&<button type="button" className="text-teal-700" aria-label={'Open attachment '+row.attachment.name} onClick={()=>onOpenAttachment(row)}><Paperclip className="size-3.5"/></button>}
              </div>
              <p className="mt-0.5 max-w-md truncate text-xs text-ink-500" title={row.description}>{row.description}</p>
            </TableCell>
            <TableCell className={`text-right ${amountClass(row,row.debit)}`}>{money(row.debit)}</TableCell>
            <TableCell className={`text-right ${amountClass(row,row.credit)}`}>{money(row.credit)}</TableCell>
            <TableCell className="text-right font-medium">{formatNumber(Math.abs(row.runningBalance))} <span className="text-[10px] text-ink-500">{row.runningBalance>=0?'Dr':'Cr'}</span></TableCell>
            <TableCell className="pr-4 text-right"><PartyLedgerRowActions row={row} actions={actionsForRow(row)} onAction={onAction}/></TableCell>
          </TableRow>)}
          {!visibleRows.length&&<TableRow><TableCell colSpan={6} className="p-8 text-center text-xs text-ink-500">No transactions match these filters.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
    <div className="space-y-2 p-3 sm:hidden">
      {visibleRows.map(row=><div key={row.id} className="rounded-lg border border-border p-3">
        <div className="flex items-center justify-between gap-2"><span className="text-xs text-ink-500">{row.date}</span><PartyLedgerRowActions row={row} actions={actionsForRow(row)} onAction={onAction}/></div>
        <div className="mt-1 flex flex-wrap gap-1"><StatusBadge tone={tone(row.source)}>{label(row.source)}</StatusBadge>{row.reference&&<span className="text-xs font-medium">{row.reference}</span>}<Impact row={row}/></div>
        <p className="my-2 break-words text-xs text-ink-600">{row.description}</p>
        <div className="grid grid-cols-3 gap-2 text-right text-xs">
          <div><p className="text-ink-500">Debit</p><strong className={amountClass(row,row.debit)}>{money(row.debit)}</strong></div>
          <div><p className="text-ink-500">Credit</p><strong className={amountClass(row,row.credit)}>{money(row.credit)}</strong></div>
          <div><p className="text-ink-500">Balance</p><strong>{formatNumber(Math.abs(row.runningBalance))}</strong></div>
        </div>
      </div>)}
      {!visibleRows.length&&<p className="py-8 text-center text-xs text-ink-500">No transactions match these filters.</p>}
    </div>
    <div className="flex items-center justify-between gap-2 border-t border-border bg-ink-50 px-4 py-3 text-[13px] font-semibold">
      <span>Closing balance</span><span>{formatNumber(Math.abs(statement.closingBalance))} <span className="font-normal text-ink-500">{statement.closingBalance>=0?'Dr':'Cr'}</span></span>
    </div>
  </div>;
}
