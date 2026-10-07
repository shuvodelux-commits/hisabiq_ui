import React, { useMemo, useState } from 'react';
import { FormSelect } from '../FormSelect';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { accountingAccounts } from '../../data/accounting';
import type { Posting } from '../../types/accounting';
import type { EntryDateView, TerminologyMode } from '../../types/transactions';
import { accountingAccountLabel } from '../../utils/accountingLabels';
import { ledgerForAccount } from '../../utils/accountingProjection';
import { taka } from '../../utils/currency';

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
  const account = accountingAccounts.find((item) => item.id === accountId) ?? accountingAccounts[0];
  const rows = useMemo(() => ledgerForAccount(accountId, postings, dateView), [accountId, dateView, postings]);
  const closing = rows.reduce((sum, row) => sum + row.debit - row.credit, 0);

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <label className="text-[13px] font-medium text-ink sm:w-[380px]">
          Ledger account <span className="font-bn text-[11px] font-normal text-ink-400">· যে হিসাবটি দেখতে চান</span>
          <FormSelect
            className="mt-1.5"
            value={account.name}
            onChange={(event) => {
              const next = accountingAccounts.find((item) => item.name === event.target.value);
              if (next) setAccountId(next.id);
            }}
            options={accountingAccounts.filter((item) => item.active).map((item) => item.name)}
          />
        </label>
        <div className="text-right">
          <p className="text-[10.5px] text-ink-400">{dateView === 'transaction' ? 'Transaction Date' : 'Created Date'}</p>
          <p className="text-sm font-semibold text-ink">Balance {closing < 0 ? '−' : ''}{taka(Math.abs(closing))}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100">
        <div className="border-b border-ink-100 bg-ink-50/40 px-4 py-3">
          <p className="text-sm font-semibold text-ink">{accountingAccountLabel(account, terminologyMode)}</p>
          <p className="font-bn text-[11px] text-ink-400">{account.helperBn}</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 pl-4 text-xs">Date</TableHead>
              <TableHead className="h-9 text-xs">Voucher / Ref</TableHead>
              <TableHead className="h-9 text-xs">Details</TableHead>
              <TableHead className="h-9 text-right text-xs">Debit</TableHead>
              <TableHead className="h-9 pr-4 text-right text-xs">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? rows.map((row) => (
              <TableRow key={`${row.postingId}-${row.reference}-${row.debit}-${row.credit}`} className="text-[13px]">
                <TableCell className="py-2 pl-4">{row.displayDate}</TableCell>
                <TableCell className="py-2 font-medium text-teal-700">{row.reference}</TableCell>
                <TableCell className="py-2 text-ink-600">{row.description}</TableCell>
                <TableCell className="py-2 text-right">{row.debit ? taka(row.debit) : '—'}</TableCell>
                <TableCell className="py-2 pr-4 text-right">{row.credit ? taka(row.credit) : '—'}</TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5} className="py-12 text-center text-sm text-ink-400">No ledger entries yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
