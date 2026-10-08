import React, { useMemo, useState } from 'react';
import { ArrowDownToLine, Printer, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { FormSelect } from '../FormSelect';
import { AppDateRangePicker } from '../AppDateRangePicker';
import { Input } from '../Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { accountingAccounts } from '../../data/accounting';
import type { LedgerRow, Posting } from '../../types/accounting';
import type { EntryDateView, TerminologyMode } from '../../types/transactions';
import { accountingAccountLabel } from '../../utils/accountingLabels';
import { ledgerForAccount } from '../../utils/accountingProjection';
import { taka } from '../../utils/currency';

function downloadCsv(accountName: string, rows: Array<LedgerRow & { balance: number }>) {
  const data = [
    ['Date', 'Transaction Date', 'Created Date', 'Reference', 'Details', 'Debit', 'Credit', 'Balance'],
    ...rows.map((row) => [row.displayDate, row.transactionDate, row.createdAt.slice(0, 10), row.reference, row.description, row.debit, row.credit, row.balance])
  ].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([data], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = accountName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-ledger.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function LedgerView({
  postings,
  dateView,
  terminologyMode
}: {
  postings: Posting[];
  dateView: EntryDateView;
  terminologyMode: TerminologyMode;
}) {
  const [accountId, setAccountId] = useState('asset-cash');
  const [from, setFrom] = useState('2026-09-01');
  const [to, setTo] = useState('2026-10-31');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<(LedgerRow & { balance: number }) | null>(null);
  const account = accountingAccounts.find((item) => item.id === accountId) ?? accountingAccounts[0];

  const allRows = useMemo(() => ledgerForAccount(accountId, postings, dateView), [accountId, dateView, postings]);
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    let balance = 0;
    return allRows
      .filter((row) => (!from || row.displayDate >= from) && (!to || row.displayDate <= to))
      .filter((row) => !query || [row.reference, row.description, row.postingId].some((value) => value.toLowerCase().includes(query)))
      .map((row) => {
        balance += account.group === 'Asset' || account.group === 'Expense' ? row.debit - row.credit : row.credit - row.debit;
        return { ...row, balance };
      });
  }, [account.group, allRows, from, search, to]);

  const closing = rows.at(-1)?.balance ?? 0;

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-[320px_300px_1fr]">
          <label className="text-[13px] font-medium text-ink">
            Ledger account <span className="font-bn text-[11px] font-normal text-ink-400">· যে হিসাবটি দেখতে চান</span>
            <FormSelect className="mt-1.5" value={account.name} onChange={(event) => {
              const next = accountingAccounts.find((item) => item.name === event.target.value);
              if (next) setAccountId(next.id);
            }} options={accountingAccounts.filter((item) => item.active).map((item) => item.name)} />
          </label>
          <div className="lg:col-span-2">
            <p className="mb-1.5 text-[12px] font-medium text-ink">Date range</p>
            <AppDateRangePicker label="Account ledger date range" value={{ from, to }}
              onChange={(range) => { setFrom(range.from); setTo(range.to); }} />
          </div>
          <label className="text-[12px] font-medium text-ink">
            Search
            <div className="relative mt-1.5"><Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" /><Input className="pl-8" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Reference or details" /></div>
          </label>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2 xl:justify-end">
          <div className="mr-2 text-right"><p className="text-[10.5px] text-ink-400">{dateView === 'transaction' ? 'Transaction Date' : 'Created Date'}</p><p className="text-sm font-semibold text-ink">Balance {closing < 0 ? '−' : ''}{taka(Math.abs(closing))}</p></div>
          <Button variant="outline" size="sm" onClick={() => { downloadCsv(account.name, rows); toast.success('Ledger exported'); }}><ArrowDownToLine className="size-4" /> Export</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="border-b border-border bg-ink-50/40 px-4 py-3">
          <p className="text-sm font-semibold text-ink">{accountingAccountLabel(account, terminologyMode)}</p>
          <p className="font-bn text-[11px] text-ink-400">{account.helperBn}</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 pl-4 text-xs">Date</TableHead>
                <TableHead className="h-9 text-xs">Voucher / Ref</TableHead>
                <TableHead className="h-9 text-xs">Details</TableHead>
                <TableHead className="h-9 text-right text-xs">Debit</TableHead>
                <TableHead className="h-9 text-right text-xs">Credit</TableHead>
                <TableHead className="h-9 pr-4 text-right text-xs">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? rows.map((row) => (
                <TableRow key={`${row.postingId}-${row.reference}-${row.debit}-${row.credit}`} className="cursor-pointer text-[13px]" onClick={() => setSelected(row)}>
                  <TableCell className="py-2 pl-4">{row.displayDate}</TableCell>
                  <TableCell className="py-2 font-medium text-teal-700">{row.reference}</TableCell>
                  <TableCell className="py-2 text-ink-600">{row.description}</TableCell>
                  <TableCell className="py-2 text-right">{row.debit ? taka(row.debit) : '—'}</TableCell>
                  <TableCell className="py-2 text-right">{row.credit ? taka(row.credit) : '—'}</TableCell>
                  <TableCell className="py-2 pr-4 text-right font-medium">{row.balance < 0 ? '−' : ''}{taka(Math.abs(row.balance))}</TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={6} className="py-12 text-center text-sm text-ink-400">No ledger entries match this period.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{selected?.reference}</DialogTitle></DialogHeader>
          {selected && <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-ink-50 p-3"><p className="text-[10.5px] text-ink-400">Transaction Date</p><p className="mt-0.5 text-[12.5px] font-medium">{selected.transactionDate}</p></div>
            <div className="rounded-lg bg-ink-50 p-3"><p className="text-[10.5px] text-ink-400">Created Date</p><p className="mt-0.5 text-[12.5px] font-medium">{selected.createdAt.replace('T', ' ').slice(0, 16)}</p></div>
            <div className="rounded-lg bg-ink-50 p-3"><p className="text-[10.5px] text-ink-400">Debit</p><p className="mt-0.5 text-[12.5px] font-medium">{selected.debit ? taka(selected.debit) : '—'}</p></div>
            <div className="rounded-lg bg-ink-50 p-3"><p className="text-[10.5px] text-ink-400">Credit</p><p className="mt-0.5 text-[12.5px] font-medium">{selected.credit ? taka(selected.credit) : '—'}</p></div>
            <div className="rounded-lg bg-ink-50 p-3 sm:col-span-2"><p className="text-[10.5px] text-ink-400">Details</p><p className="mt-0.5 text-[12.5px] font-medium">{selected.description}</p><p className="mt-1 text-[10.5px] text-ink-400">{selected.postingId}</p></div>
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print</Button><Button onClick={() => setSelected(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

