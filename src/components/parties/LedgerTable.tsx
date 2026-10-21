import { PartyClosingBalance } from './PartyClosingBalance';
import { StickyNote, ArrowDownLeft, ArrowUpRight, FileText, BookOpen, RefreshCcw } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { PartyLedgerSourceBadge, PartyLedgerAttachment } from './PartyLedgerIndicators';
import { PartyLedgerRowActions } from './PartyLedgerRowActions';
import type { LedgerStatement, PartyAction, PartyLedgerRow } from '../../types/partyLedger';
import { formatMoneyNumber } from '../../utils/currency';
import { ledgerImpact, type LedgerImpact } from '../../utils/partyLedgerImpact';
import {useUiCopy} from '../../i18n/useUiCopy';
import {partyLedgerSourceLabel,partyLedgerCaption} from '../../i18n/partyLedgerCopy';
import {partyLedgerImpactText} from '../../i18n/partyFinancialCopy';
import type {UiLanguage} from '../../i18n/uiCopy';

type ActionAvailability={action:PartyAction;enabled:boolean;reason?:string};
type Row=LedgerStatement['rows'][number];
type Props={
  statement:LedgerStatement;
  visibleRows:Row[];
  actionsForRow:(row:PartyLedgerRow)=>ActionAvailability[];
  onAction:(action:PartyAction,row:PartyLedgerRow)=>void;
  onOpenAttachment:(row:PartyLedgerRow)=>void;
};
const impactTone:Record<LedgerImpact['kind'],string>={
 in:'text-emerald-700 dark:text-emerald-400',
 out:'text-rose-700 dark:text-rose-400',
 due:'text-sky-700 dark:text-sky-400',
 adjustment:'text-amber-700 dark:text-amber-400',
 opening:'text-ink-600',
 neutral:'text-ink-500'
};
/** Show the icon beside the posted amount and its explanation directly underneath.
 * Debit and credit retain their accounting meaning; these colors describe the
 * transaction's economic impact, not the sign of an account column.
 */
function LedgerAmount({row,value,language}:{row:PartyLedgerRow;value:number;language:UiLanguage}){
 if(!value)return <span className="text-ink-400">—</span>;
 const info=ledgerImpact(row);
 if(info.kind==='neutral')return <span className="font-medium text-ink">{formatMoneyNumber(value)}</span>;
 const Icon=info.kind==='in'?ArrowDownLeft:info.kind==='out'?ArrowUpRight:
  info.kind==='due'?FileText:info.kind==='opening'?BookOpen:RefreshCcw;
 const visibleCaption=partyLedgerCaption(language,row,info.label,info.kind);
 const impactLabel=partyLedgerImpactText(language,info.label);
 return <div className={`flex flex-col items-end gap-0.5 ${impactTone[info.kind]}`}>
   <span data-testid="ledger-money-value" aria-label={impactLabel} title={impactLabel}
      className="inline-flex items-center justify-end gap-1 whitespace-nowrap font-semibold leading-tight">
     <Icon className="size-3.5 shrink-0" aria-hidden="true"/>
     <span>{formatMoneyNumber(value)}</span>
   </span>
   <span data-testid="ledger-impact-caption" className="whitespace-nowrap text-[10px] font-normal leading-tight">
     {visibleCaption}
   </span>
 </div>;
}

export function LedgerTable({statement,visibleRows,actionsForRow,onAction,onOpenAttachment}:Props){
  const {text,language}=useUiCopy();
  return <div>
    <div className="flex flex-wrap justify-between gap-3 border-b border-border bg-ink-50/50 px-4 py-2 text-xs">
      <div><span className="text-ink-500">{text('Opening balance','শুরুর জের')} </span><strong>{formatMoneyNumber(Math.abs(statement.openingBalance))} {statement.openingBalance>=0?'Dr':'Cr'}</strong></div>
      <div><span className="text-ink-500">{text('Period debit','এই সময়ের ডেবিট')} </span><strong>{formatMoneyNumber(statement.periodDebit)}</strong></div>
      <div><span className="text-ink-500">{text('Period credit','এই সময়ের ক্রেডিট')} </span><strong>{formatMoneyNumber(statement.periodCredit)}</strong></div>
    </div>
    <div className="hidden w-full overflow-x-auto sm:block">
      <Table>
        <TableHeader><TableRow className="hover:bg-transparent">
          <TableHead className="pl-4 text-xs">{text('Date','তারিখ')}</TableHead><TableHead className="text-xs">{text('Particulars','বিবরণ')}</TableHead>
          <TableHead className="text-right text-xs">{text('Debit','ডেবিট')}</TableHead><TableHead className="text-right text-xs">{text('Credit','ক্রেডিট')}</TableHead>
          <TableHead className="text-right text-xs">{text('Running','চলতি জের')}</TableHead><TableHead className="pr-4 text-right text-xs">{text('Actions','কাজ')}</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {visibleRows.map(row=><TableRow key={row.id} className="cursor-pointer text-[13px] hover:bg-ink-50/60"
            tabIndex={0} aria-label={text('View transaction','লেনদেন দেখুন') + ' ' + (row.reference || row.id)}
            onClick={event => {
              if ((event.target as HTMLElement).closest('button,a,[role="menu"]')) return;
              onAction('view',row);
            }}
            onKeyDown={event => {
              if (event.target !== event.currentTarget) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();onAction('view',row);
              }
            }}>
            <TableCell className="whitespace-nowrap pl-4 text-xs text-ink-500">{row.date}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                {row.source==='note'&&<StickyNote className="size-3.5 text-warning"/>}
                <PartyLedgerSourceBadge source={row.source} label={partyLedgerSourceLabel(language,row.source)}/>
                {row.reference&&<span className="font-medium text-ink">{row.reference}</span>}
                {row.attachment&&<span title={row.attachment.name}><PartyLedgerAttachment attachment={row.attachment}
                  label={text('Open attachment','সংযুক্ত ফাইল খুলুন')}
                  onClick={()=>onOpenAttachment(row)}/></span>}
              </div>
              <p className="mt-0.5 max-w-md truncate text-xs text-ink-500" title={row.description}>{row.description}</p>
            </TableCell>
            <TableCell className="text-right align-middle"><LedgerAmount row={row} value={row.debit} language={language}/></TableCell>
            <TableCell className="text-right align-middle"><LedgerAmount row={row} value={row.credit} language={language}/></TableCell>
            <TableCell className="text-right font-medium">{formatMoneyNumber(Math.abs(row.runningBalance))} <span className="text-[10px] text-ink-500">{row.runningBalance>=0?'Dr':'Cr'}</span></TableCell>
            <TableCell className="pr-4 text-right"><PartyLedgerRowActions row={row} actions={actionsForRow(row)} onAction={onAction}/></TableCell>
          </TableRow>)}
          {!visibleRows.length&&<TableRow><TableCell colSpan={6} className="p-8 text-center text-xs text-ink-500">{text('No transactions match these filters.','এই ফিল্টারে কোনো লেনদেন নেই।')}</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
    <div className="space-y-2 p-3 sm:hidden">
      {visibleRows.map(row=><div key={row.id} className="rounded-lg border border-border p-3">
        <div className="flex items-center justify-between gap-2"><span className="text-xs text-ink-500">{row.date}</span><PartyLedgerRowActions row={row} actions={actionsForRow(row)} onAction={onAction}/></div>
        <div className="mt-1 flex flex-wrap gap-1"><PartyLedgerSourceBadge source={row.source} label={partyLedgerSourceLabel(language,row.source)}/>{row.reference&&<span className="text-xs font-medium">{row.reference}</span>}{row.attachment&&<PartyLedgerAttachment attachment={row.attachment}
                  label={text('Open attachment','সংযুক্ত ফাইল খুলুন')} onClick={()=>onOpenAttachment(row)}/>}</div>
        <p className="my-2 break-words text-xs text-ink-600">{row.description}</p>
        <div className="grid grid-cols-3 gap-2 text-right text-xs">
          <div><p className="mb-1 text-ink-500">{text('Debit','ডেবিট')}</p><LedgerAmount row={row} value={row.debit} language={language}/></div>
          <div><p className="mb-1 text-ink-500">{text('Credit','ক্রেডিট')}</p><LedgerAmount row={row} value={row.credit} language={language}/></div>
          <div><p className="text-ink-500">{text('Balance','জের')}</p><strong>{formatMoneyNumber(Math.abs(row.runningBalance))}</strong></div>
        </div>
      </div>)}
      {!visibleRows.length&&<p className="py-8 text-center text-xs text-ink-500">{text('No transactions match these filters.','এই ফিল্টারে কোনো লেনদেন নেই।')}</p>}
    </div>
    <PartyClosingBalance balance={statement.closingBalance} relationship={statement.relationship} compact />
  </div>;
}
