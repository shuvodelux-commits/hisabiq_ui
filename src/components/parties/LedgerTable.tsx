import React from 'react';
import { FileText, Paperclip, StickyNote } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { StatusBadge, type StatusTone } from '../StatusBadge';
import type { LedgerEntry, LedgerEntryType } from '../../types/erp';
import { formatNumber } from '../../utils/currency';

const typeMeta: Record<LedgerEntryType, {label: string;tone: StatusTone;}> = {
  opening: { label: 'Opening', tone: 'neutral' },
  invoice: { label: 'Invoice', tone: 'teal' },
  payment: { label: 'Payment', tone: 'success' },
  purchase: { label: 'Purchase', tone: 'info' },
  return: { label: 'Return', tone: 'warning' },
  note: { label: 'Note', tone: 'neutral' }
};

type LedgerTableProps = {
  entries: LedgerEntry[];
  onOpenAttachment: (entry: LedgerEntry) => void;
};

export function LedgerTable({ entries, onOpenAttachment }: LedgerTableProps) {
  let running = 0;
  const rows = entries.map((e) => {
    running += e.debit - e.credit;
    return { ...e, balance: running };
  });
  const totalDr = entries.reduce((s, e) => s + e.debit, 0);
  const totalCr = entries.reduce((s, e) => s + e.credit, 0);

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-9 pl-4 text-xs">Date</TableHead>
          <TableHead className="h-9 text-xs">Particulars</TableHead>
          <TableHead className="h-9 text-right text-xs">Debit</TableHead>
          <TableHead className="h-9 text-right text-xs">Credit</TableHead>
          <TableHead className="h-9 pr-4 text-right text-xs">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) =>
        r.type === 'note' ?
        <TableRow key={r.id} className="bg-warning-bg/40 text-[13px] hover:bg-warning-bg/60">
              <TableCell className="py-2 pl-4 align-top text-ink-500">{r.date}</TableCell>
              <TableCell colSpan={4} className="py-2 pr-4">
                <span className="flex items-start gap-2 text-ink-700">
                  <StickyNote className="mt-0.5 size-3.5 shrink-0 text-warning" />
                  {r.description}
                </span>
              </TableCell>
            </TableRow> :

        <TableRow key={r.id} className="text-[13px]">
              <TableCell className="whitespace-nowrap py-2 pl-4 align-top text-ink-500">{r.date}</TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-1.5">
                  <StatusBadge tone={typeMeta[r.type].tone}>{typeMeta[r.type].label}</StatusBadge>
                  {r.ref &&
              <span className="flex items-center gap-1 font-medium text-ink">
                      <FileText className="size-3 text-ink-400" /> {r.ref}
                    </span>
              }
                  {r.attachment &&
              <button
                onClick={() => onOpenAttachment(r)}
                className="flex items-center gap-0.5 rounded px-1 text-[11px] text-teal-700 hover:bg-teal-50"
                aria-label={`Open attachment ${r.attachment.name}`}>
                
                      <Paperclip className="size-3" /> 1
                    </button>
              }
                </div>
                <p className="mt-0.5 max-w-md truncate text-xs text-ink-500">{r.description}</p>
              </TableCell>
              <TableCell className="py-2 text-right align-top tabular-nums text-ink">{r.debit ? formatNumber(r.debit) : '—'}</TableCell>
              <TableCell className="py-2 text-right align-top tabular-nums text-ink">{r.credit ? formatNumber(r.credit) : '—'}</TableCell>
              <TableCell className="py-2 pr-4 text-right align-top tabular-nums font-medium text-ink">
                {formatNumber(Math.abs(r.balance))}
                <span className="ml-1 text-[10.5px] font-normal text-ink-400">{r.balance >= 0 ? 'Dr' : 'Cr'}</span>
              </TableCell>
            </TableRow>

        )}
        <TableRow className="bg-ink-50 font-semibold hover:bg-ink-50">
          <TableCell className="py-2 pl-4 text-[13px]" colSpan={2}>Closing balance</TableCell>
          <TableCell className="py-2 text-right text-[13px] tabular-nums">{formatNumber(totalDr)}</TableCell>
          <TableCell className="py-2 text-right text-[13px] tabular-nums">{formatNumber(totalCr)}</TableCell>
          <TableCell className="py-2 pr-4 text-right text-[13px] tabular-nums">
            ৳{formatNumber(Math.abs(totalDr - totalCr))}
            <span className="ml-1 text-[10.5px] font-normal text-ink-500">{totalDr - totalCr >= 0 ? 'Dr' : 'Cr'}</span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>);

}