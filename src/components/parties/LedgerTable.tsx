import { Paperclip, StickyNote, ArrowDownLeft, ArrowUpRight, FileText, BookOpen, RefreshCcw, HandCoins, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { PartyLedgerRowActions } from './PartyLedgerRowActions';
import { Button } from '../Button';
import type { LedgerStatement, PartyAction, PartyLedgerRow } from '../../types/partyLedger';
import { formatMoneyNumber } from '../../utils/currency';
import { ledgerImpact, type LedgerImpact } from '../../utils/partyLedgerImpact';
import { useUiCopy } from '../../i18n/useUiCopy';
import { partyLedgerSourceLabel, partyLedgerCaption } from '../../i18n/partyLedgerCopy';
import { partyLedgerImpactText } from '../../i18n/partyFinancialCopy';
import type { UiLanguage } from '../../i18n/uiCopy';

type ActionAvailability = { action: PartyAction; enabled: boolean; reason?: string };
type Row = LedgerStatement['rows'][number];
type Props = {
  statement: LedgerStatement;
  visibleRows: Row[];
  actionsForRow: (row: PartyLedgerRow) => ActionAvailability[];
  onAction: (action: PartyAction, row: PartyLedgerRow) => void;
  onOpenAttachment: (row: PartyLedgerRow) => void;
};

const impactTone: Record<LedgerImpact['kind'], string> = {
  in: 'text-emerald-700 dark:text-emerald-400',
  out: 'text-rose-700 dark:text-rose-400',
  due: 'text-sky-700 dark:text-sky-400',
  adjustment: 'text-amber-700 dark:text-amber-400',
  opening: 'text-ink-600',
  neutral: 'text-ink-500'
};

function LedgerAmount({ row, value, language }: { row: PartyLedgerRow; value: number; language: UiLanguage }) {
  if (!value) return <span className="text-ink-400">—</span>;
  const info = ledgerImpact(row);
  if (info.kind === 'neutral') return <span className="font-semibold text-ink">{formatMoneyNumber(value)}</span>;
  const Icon = info.kind === 'in' ? ArrowDownLeft : info.kind === 'out' ? ArrowUpRight :
    info.kind === 'due' ? FileText : info.kind === 'opening' ? BookOpen : RefreshCcw;
  const impactLabel = partyLedgerImpactText(language, info.label);
  return <div className={'flex flex-col items-end gap-0.5 ' + impactTone[info.kind]}>
    <span data-testid="ledger-money-value" aria-label={impactLabel} title={impactLabel}
      className="inline-flex max-w-full items-center justify-end gap-1 font-semibold leading-tight">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="break-words">{formatMoneyNumber(value)}</span>
    </span>
    <span data-testid="ledger-impact-caption" className="text-right text-[10px] font-normal leading-tight">
      {partyLedgerCaption(language, row, info.label, info.kind)}
    </span>
  </div>;
}

function LedgerTypeIcon({ row }: { row: PartyLedgerRow }) {
  const Icon = row.source === 'note' ? StickyNote : row.source === 'opening' ? BookOpen :
    row.source === 'sale' || row.source === 'purchase' ? FileText :
    row.source.includes('return') || row.source.includes('refund') ? RefreshCcw : HandCoins;
  return <Icon className="size-4 shrink-0 text-ink-400" aria-hidden="true" />;
}

export function LedgerTable({ statement, visibleRows, actionsForRow, onAction, onOpenAttachment }: Props) {
  const { text, language } = useUiCopy();
  const balance = (value: number) => formatMoneyNumber(Math.abs(value)) + ' ' + (value >= 0 ? 'Dr' : 'Cr');

  const summary = <div className="grid grid-cols-3 gap-2 bg-ink-50/70 px-4 py-3 lg:flex lg:flex-wrap lg:gap-x-8 lg:gap-y-1 lg:py-2.5" aria-label={text('Ledger summary', 'খাতার সারসংক্ষেপ')}>
    {[
      [text('Opening balance', 'শুরুর জের'), balance(statement.openingBalance)],
      [text('Period debit', 'এই সময়ের ডেবিট'), formatMoneyNumber(statement.periodDebit)],
      [text('Period credit', 'এই সময়ের ক্রেডিট'), formatMoneyNumber(statement.periodCredit)]
    ].map(([label, value]) => <div key={label} className="min-w-0 lg:flex lg:items-baseline lg:gap-2">
      <p className="text-xs text-ink-500">{label}</p>
      <strong className="block break-words text-[13px] font-semibold text-ink">{value}</strong>
    </div>)}
  </div>;

  return <div className="min-w-0">
    <div className="hidden lg:block">{summary}</div>

    <div className="hidden min-w-0 overflow-x-auto lg:block">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="whitespace-nowrap pl-5 text-xs">{text('Date', 'তারিখ')}</TableHead>
            <TableHead className="text-xs">{text('Particulars', 'বিবরণ')}</TableHead>
            <TableHead className="text-right text-xs">{text('Debit', 'ডেবিট')}</TableHead>
            <TableHead className="text-right text-xs">{text('Credit', 'ক্রেডিট')}</TableHead>
            <TableHead className="text-right text-xs">{text('Balance', 'জের')}</TableHead>
            <TableHead className="pr-4 text-right text-xs">{text('Actions', 'কাজ')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRows.map(row => <TableRow key={row.id} className="align-top text-[13px]">
            <TableCell className="whitespace-nowrap pl-5 py-3 text-xs text-ink-500">{row.date}</TableCell>
            <TableCell className="min-w-[170px] py-3">
              <div className="flex items-center gap-2">
                <LedgerTypeIcon row={row} />
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">{row.reference || partyLedgerSourceLabel(language, row.source)}</span>
                  <span className="block text-xs text-ink-500">{partyLedgerSourceLabel(language, row.source)}</span>
                </span>
                {row.attachment && <button type="button" aria-label={text('Open attachment', 'সংযুক্ত ফাইল খুলুন') + ' ' + row.attachment.name}
                  className="rounded p-1 text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500"
                  onClick={() => onOpenAttachment(row)}><Paperclip className="size-4" /></button>}
              </div>
              {row.description && <p className="mt-1 line-clamp-2 max-w-md text-xs text-ink-500" title={row.description}>{row.description}</p>}
            </TableCell>
            <TableCell className="py-3 text-right"><LedgerAmount row={row} value={row.debit} language={language} /></TableCell>
            <TableCell className="py-3 text-right"><LedgerAmount row={row} value={row.credit} language={language} /></TableCell>
            <TableCell className="whitespace-nowrap py-3 text-right font-semibold text-ink">{balance(row.runningBalance)}</TableCell>
            <TableCell className="py-2 pr-3 text-right">
              <div className="flex items-center justify-end gap-1">
                <Button size="sm" variant="ghost" className="text-teal-700" onClick={() => onAction('view', row)}>{text('View', 'দেখুন')}</Button>
                <PartyLedgerRowActions row={row} actions={actionsForRow(row)} onAction={onAction} />
              </div>
            </TableCell>
          </TableRow>)}
          {!visibleRows.length && <TableRow><TableCell colSpan={6} className="p-8 text-center text-sm text-ink-500">
            {text('No transactions match these filters.', 'এই ফিল্টারে কোনো লেনদেন নেই।')}
          </TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>

    <ul className="divide-y divide-border lg:hidden" aria-label={text('Transactions', 'লেনদেন')}>
      {visibleRows.map(row => {
        const amount = row.debit || row.credit;
        const side = row.debit ? text('Debit', 'ডেবিট') : row.credit ? text('Credit', 'ক্রেডিট') : '';
        return <li key={row.id} className="min-w-0 px-4 py-3.5">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-1.5 text-xs text-ink-500">
                <LedgerTypeIcon row={row} />
                <span>{partyLedgerSourceLabel(language, row.source)}</span>
                <span aria-hidden="true">·</span>
                <span className="shrink-0">{row.date}</span>
              </div>
              <p className="mt-1 break-words text-[15px] font-semibold leading-tight text-ink">
                {row.reference || row.description || partyLedgerSourceLabel(language, row.source)}
              </p>
            </div>
            {amount !== 0 && <div className="min-w-0 shrink-0 text-right">
              <div className="text-[15px]"><LedgerAmount row={row} value={amount} language={language} /></div>
              <p className="mt-0.5 text-xs text-ink-500">{side}</p>
            </div>}
          </div>
          {row.description && row.description !== row.reference && <p className="mt-1 line-clamp-2 break-words text-[13px] leading-snug text-ink-500">{row.description}</p>}
          <div className="mt-3 flex min-w-0 items-center justify-between gap-2">
            <p className="min-w-0 break-words text-xs text-ink-500">{text('Balance', 'জের')} <strong className="font-semibold text-ink">{balance(row.runningBalance)}</strong></p>
            <div className="flex shrink-0 items-center gap-1">
              {row.attachment && <button type="button" className="min-h-9 rounded p-2 text-teal-700" aria-label={text('Open attachment', 'সংযুক্ত ফাইল খুলুন') + ' ' + row.attachment.name}
                onClick={() => onOpenAttachment(row)}><Paperclip className="size-4" /></button>}
              <Button size="sm" className="min-h-9" onClick={() => onAction('view', row)}>
                {text('View', 'দেখুন')} <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
              <PartyLedgerRowActions row={row} actions={actionsForRow(row)} onAction={onAction} />
            </div>
          </div>
        </li>;
      })}
      {!visibleRows.length && <li className="p-8 text-center text-sm text-ink-500">
        {text('No transactions match these filters.', 'এই ফিল্টারে কোনো লেনদেন নেই।')}
      </li>}
    </ul>

    <div className="border-t border-border lg:hidden">{summary}</div>
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-ink-50 px-4 py-3 text-sm">
      <strong>{text('Closing balance', 'শেষ জের')}</strong>
      <strong className="break-words text-right text-[15px]">{balance(statement.closingBalance)}</strong>
    </div>
  </div>;
}
