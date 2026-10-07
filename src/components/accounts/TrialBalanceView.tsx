import React from 'react';
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
  const result = trialBalance(postings);
  const rowById = new Map(result.rows.map((row) => [row.accountId, row]));
  const balanced = Math.abs(result.totalDebit - result.totalCredit) < 0.01;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Trial Balance</p>
          <p className="font-bn text-[11px] text-ink-400">সব হিসাবের দুই পাশ ঠিকমতো মিলছে কি না</p>
        </div>
        <StatusBadge tone={balanced ? 'success' : 'danger'} dot>{balanced ? 'Balanced' : 'Needs review'}</StatusBadge>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 pl-4 text-xs">Code</TableHead>
              <TableHead className="h-9 text-xs">Account</TableHead>
              <TableHead className="h-9 text-xs">Group</TableHead>
              <TableHead className="h-9 text-right text-xs">
                <span className="inline-flex items-center justify-end gap-1">Debit <Tooltip content="এই রিপোর্টে হিসাবের Debit পাশে যত টাকা আছে। দৈনন্দিন কাজে Money In/Out ব্যবহার করুন।" /></span>
              </TableHead>
              <TableHead className="h-9 pr-4 text-right text-xs">
                <span className="inline-flex items-center justify-end gap-1">Credit <Tooltip content="এই রিপোর্টে হিসাবের Credit পাশে যত টাকা আছে। দৈনন্দিন কাজে Money In/Out ব্যবহার করুন।" /></span>
              </TableHead>
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
    </div>
  );
}
