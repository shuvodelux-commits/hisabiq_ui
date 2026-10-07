import React from 'react';
import { StatusBadge } from '../StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { accountingAccounts } from '../../data/accounting';
import type { TerminologyMode } from '../../types/transactions';
import { accountingAccountLabel } from '../../utils/accountingLabels';

export function ChartOfAccountsView({ terminologyMode }: { terminologyMode: TerminologyMode }) {
  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-sm font-semibold text-ink">Chart of Accounts</p>
        <p className="font-bn text-[11px] text-ink-400">ব্যবসার সব হিসাবের খাত</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-ink-100">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 pl-4 text-xs">Code</TableHead>
              <TableHead className="h-9 text-xs">Account</TableHead>
              <TableHead className="h-9 text-xs">Group</TableHead>
              <TableHead className="h-9 text-xs">Parent</TableHead>
              <TableHead className="h-9 pr-4 text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accountingAccounts.map((account) => (
              <TableRow key={account.id} className="text-[13px]">
                <TableCell className="py-2 pl-4 text-ink-500">{account.code}</TableCell>
                <TableCell className="py-2">
                  <p className="font-medium text-ink">{accountingAccountLabel(account, terminologyMode)}</p>
                  <p className="font-bn text-[10.5px] text-ink-400">{account.helperBn}</p>
                </TableCell>
                <TableCell className="py-2 text-ink-600">{account.group}</TableCell>
                <TableCell className="py-2 text-ink-500">{account.parent}</TableCell>
                <TableCell className="py-2 pr-4"><StatusBadge tone={account.active ? 'success' : 'neutral'} dot>{account.active ? 'Active' : 'Inactive'}</StatusBadge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
