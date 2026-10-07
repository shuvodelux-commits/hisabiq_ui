import React, { useMemo, useState } from 'react';
import { ArrowDownToLine, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Input } from '../Input';
import { StatusBadge } from '../StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { Tooltip } from '../Tooltip';
import { accountingAccounts } from '../../data/accounting';
import type { Posting } from '../../types/accounting';
import type { TerminologyMode } from '../../types/transactions';
import { accountingAccountLabel } from '../../utils/accountingLabels';
import { trialBalance } from '../../utils/accountingProjection';
import { taka } from '../../utils/currency';

export function TrialBalanceView({ postings, terminologyMode }: { postings: Posting[]; terminologyMode: TerminologyMode }) {
  const [asOf, setAsOf] = useState('2026-10-31');
  const periodPostings = useMemo(() => postings.filter((item) => item.transactionDate <= asOf), [asOf, postings]);
  const result = useMemo(() => trialBalance(periodPostings), [periodPostings]);
  const rowById = new Map(result.rows.map((row) => [row.accountId, row]));
  const balanced = Math.abs(result.totalDebit - result.totalCredit) < 0.01;

  const exportCsv = () => {
    const rows = result.rows.map((row) => {
      const account = accountingAccounts.find((item) => item.id === row.accountId);
      return [account?.code ?? '', account?.name ?? row.accountId, account?.group ?? '', row.debit, row.credit];
    });
    const csv = [['Code', 'Account', 'Group', 'Debit', 'Credit'], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trial-balance-' + asOf + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Trial Balance exported');
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">Trial Balance</p>
          <p className="font-bn text-[11px] text-ink-400">সব হিসাবের দুই পাশ ঠিকমতো মিলছে কি না</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-[11px] font-medium text-ink">As of <span className="font-bn font-normal text-ink-400">· এই তারিখ পর্যন্ত</span><Input className="mt-1 w-40" type="date" value={asOf} onChange={(event) => setAsOf(event.target.value)} /></label>
          <Button variant="outline" size="sm" onClick={exportCsv}><ArrowDownToLine className="size-4" /> Export</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
          <StatusBadge tone={balanced ? 'success' : 'danger'} dot>{balanced ? 'Balanced' : 'Needs review'}</StatusBadge>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 sm:max-w-lg">
        <div className="rounded-lg bg-ink-50 px-3 py-2"><p className="text-[10.5px] text-ink-400">Total Debit</p><p className="text-sm font-semibold text-ink">{taka(result.totalDebit)}</p></div>
        <div className="rounded-lg bg-ink-50 px-3 py-2"><p className="text-[10.5px] text-ink-400">Total Credit</p><p className="text-sm font-semibold text-ink">{taka(result.totalCredit)}</p></div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 pl-4 text-xs">Code</TableHead>
              <TableHead className="h-9 text-xs">Account</TableHead>
              <TableHead className="h-9 text-xs">Group</TableHead>
              <TableHead className="h-9 text-right text-xs"><span className="inline-flex items-center justify-end gap-1">Debit <Tooltip content="এই রিপোর্টে হিসাবের Debit পাশে যত টাকা আছে। দৈনন্দিন কাজে Money In/Out ব্যবহার করুন।" /></span></TableHead>
              <TableHead className="h-9 pr-4 text-right text-xs"><span className="inline-flex items-center justify-end gap-1">Credit <Tooltip content="এই রিপোর্টে হিসাবের Credit পাশে যত টাকা আছে। দৈনন্দিন কাজে Money In/Out ব্যবহার করুন।" /></span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountingAccounts.map((account) => {
              const row = rowById.get(account.id);
              if (!row) return null;
              return (
                <TableRow key={account.id} className="text-[13px]">
                  <TableCell className="py-2 pl-4 text-ink-500">{account.code}</TableCell>
                  <TableCell className="py-2"><p className="font-medium text-ink">{accountingAccountLabel(account, terminologyMode)}</p><p className="font-bn text-[10.5px] text-ink-400">{account.helperBn}</p></TableCell>
                  <TableCell className="py-2 text-ink-500">{account.group}</TableCell>
                  <TableCell className="py-2 text-right">{row.debit ? taka(row.debit) : '—'}</TableCell>
                  <TableCell className="py-2 pr-4 text-right">{row.credit ? taka(row.credit) : '—'}</TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-ink-50/60 text-[13px] font-semibold hover:bg-ink-50/60">
              <TableCell colSpan={3} className="py-2 pl-4">Total</TableCell>
              <TableCell className="py-2 text-right">{taka(result.totalDebit)}</TableCell>
              <TableCell className="py-2 pr-4 text-right">{taka(result.totalCredit)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <p className="mt-2 text-right text-[10.5px] text-ink-400">Period calculations always use Transaction Date.</p>
    </div>
  );
}
