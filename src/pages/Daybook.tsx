import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowDownToLine, ArrowUpRight, CalendarClock, Printer, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/Dialog';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { Tooltip } from '../components/Tooltip';
import { DaybookActions } from '../components/daybook/DaybookActions';
import { DaybookFilters, type DaybookFilterState } from '../components/daybook/DaybookFilters';
import { TransactionDetailsDialog } from '../components/daybook/TransactionDetailsDialog';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { daybookTransactions } from '../data/daybook';
import type { UnifiedTransaction } from '../types/transactions';
import { taka } from '../utils/currency';
import { cashflowSummary, filterDaybookTransactions } from '../utils/daybook';
import { dateForView } from '../utils/transactionDates';

function statusTone(status: UnifiedTransaction['status']) {
  if (status === 'Posted') return 'success' as const;
  if (status === 'Deleted') return 'danger' as const;
  if (status === 'Draft') return 'warning' as const;
  return 'neutral' as const;
}

export function Daybook() {
  const navigate = useNavigate();
  const { entryDateView, setEntryDateView } = useUserPreferences();
  const [transactions, setTransactions] = useState<UnifiedTransaction[]>(daybookTransactions);
  const [detail, setDetail] = useState<UnifiedTransaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UnifiedTransaction | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [filters, setFilters] = useState<DaybookFilterState>({
    search: '',
    from: '2026-10-07',
    to: '2026-10-07',
    type: 'All types',
    account: 'All accounts',
    user: 'All users',
    status: 'All status'
  });

  const filtered = useMemo(() => filterDaybookTransactions(transactions, {
    ...filters,
    dateView: entryDateView
  }), [entryDateView, filters, transactions]);

  const summary = useMemo(() => cashflowSummary(filtered), [filtered]);

  const goToSource = (transaction: UnifiedTransaction, edit = false) => {
    const route = transaction.sourceRoute || '/app/daybook';
    const query = edit ? `?edit=${encodeURIComponent(transaction.sourceId)}` : `?open=${encodeURIComponent(transaction.sourceId)}`;
    navigate(route + query);
  };

  const printTransaction = (transaction: UnifiedTransaction) => {
    setDetail(transaction);
    requestAnimationFrame(() => window.print());
  };

  const duplicateTransaction = (transaction: UnifiedTransaction) => {
    const route = transaction.sourceRoute || '/app/daybook';
    navigate(`${route}?duplicate=${encodeURIComponent(transaction.sourceId)}`);
  };

  const exportDaybook = () => {
    const rows = filtered.map((transaction) => [
      dateForView(transaction, entryDateView), transaction.type, transaction.reference,
      transaction.party ?? '', transaction.details ?? '', transaction.accounts.join(' + '),
      transaction.moneyIn, transaction.moneyOut, transaction.postedBy, transaction.status
    ]);
    const csv = [['Date', 'Type', 'Reference', 'Party', 'Details', 'Account', 'Money In', 'Money Out', 'Posted by', 'Status'], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'hisabiq-daybook.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Daybook exported');
  };

  const deleteTransaction = () => {
    if (!deleteTarget) return;
    if (!deleteReason.trim()) {
      toast.error('Enter a reason for deleting this transaction');
      return;
    }
    const now = '2026-10-07T15:20:00+06:00';
    setTransactions((current) => current.map((item) =>
      item.id === deleteTarget.id
        ? { ...item, status: 'Deleted', deletedAt: now, deletedBy: 'Shuvo', deleteReason: deleteReason.trim(), updatedAt: now, updatedBy: 'Shuvo' }
        : item
    ));
    setDetail((current) => current?.id === deleteTarget.id ? { ...current, status: 'Deleted', deletedAt: now, deletedBy: 'Shuvo', deleteReason: deleteReason.trim(), updatedAt: now, updatedBy: 'Shuvo' } : current);
    toast.success('Transaction deleted safely', { description: 'History is kept for audit.' });
    setDeleteTarget(null);
    setDeleteReason('');
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Daybook"
        titleBn="দৈনিক লেনদেন"
        description="Find, open, edit and manage all business transactions in one place."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-ink-100 bg-white p-1">
            <button
              onClick={() => setEntryDateView('transaction')}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${entryDateView === 'transaction' ? 'bg-ink text-white' : 'text-ink-500 hover:bg-ink-50'}`}>
              Transaction Date
            </button>
            <button
              onClick={() => setEntryDateView('created')}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${entryDateView === 'created' ? 'bg-ink text-white' : 'text-ink-500 hover:bg-ink-50'}`}>
              Created Date
            </button>
            </div>
            <Button variant="outline" size="sm" onClick={exportDaybook}><ArrowDownToLine className="size-4" /> Export</Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
          <div className="flex items-center justify-between"><p className="text-[12.5px] text-ink-500">Money In <span className="font-bn text-[11px]">· টাকা এসেছে</span></p><ArrowDownLeft className="size-4 text-success" /></div>
          <p className="mt-0.5 text-lg font-semibold text-success">{taka(summary.moneyIn)}</p>
          <p className="text-[10.5px] text-ink-400">Actual money received in this view</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
          <div className="flex items-center justify-between"><p className="text-[12.5px] text-ink-500">Money Out <span className="font-bn text-[11px]">· টাকা গেছে</span></p><ArrowUpRight className="size-4 text-danger" /></div>
          <p className="mt-0.5 text-lg font-semibold text-ink">{taka(summary.moneyOut)}</p>
          <p className="text-[10.5px] text-ink-400">Actual money paid in this view</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
          <div className="flex items-center justify-between"><p className="text-[12.5px] text-ink-500">Net movement</p><WalletCards className="size-4 text-ink-300" /></div>
          <p className={`mt-0.5 text-lg font-semibold ${summary.net < 0 ? 'text-danger' : 'text-ink'}`}>{summary.net < 0 ? '−' : ''}{taka(Math.abs(summary.net))}</p>
          <p className="text-[10.5px] text-ink-400">Internal transfers excluded</p>
        </div>
        <div className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1 text-[12.5px] text-ink-500">Entries <Tooltip content="এই তারিখ বা তারিখের মধ্যে পাওয়া মোট ব্যবসার লেনদেন।" /></p>
            <CalendarClock className="size-4 text-ink-300" />
          </div>
          <p className="mt-0.5 text-lg font-semibold text-ink">{filtered.length}</p>
          <p className="font-bn text-[10.5px] text-ink-400">নির্বাচিত সময়ের লেনদেন</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card">
        <DaybookFilters value={filters} onChange={setFilters} transactions={transactions} dateView={entryDateView} />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 pl-4 text-xs">Date</TableHead>
                <TableHead className="h-9 text-xs">Type</TableHead>
                <TableHead className="h-9 text-xs">No. / Reference</TableHead>
                <TableHead className="h-9 text-xs">Party</TableHead>
                <TableHead className="h-9 text-xs">Details</TableHead>
                <TableHead className="h-9 text-xs">Account</TableHead>
                <TableHead className="h-9 text-right text-xs">Money In</TableHead>
                <TableHead className="h-9 text-right text-xs">Money Out</TableHead>
                <TableHead className="h-9 text-xs">Posted by</TableHead>
                <TableHead className="h-9 text-xs">Status</TableHead>
                <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((transaction) => (
                <TableRow key={transaction.id} className="text-[13px]">
                  <TableCell className="py-2 pl-4">
                    <p className="font-medium text-ink">{dateForView(transaction, entryDateView)}</p>
                    {entryDateView === 'transaction' && transaction.createdAt.slice(0, 10) !== transaction.transactionDate && (
                      <p className="text-[10.5px] text-ink-400">Entered {transaction.createdAt.slice(0, 10)}</p>
                    )}
                  </TableCell>
                  <TableCell className="py-2"><span className="font-medium text-ink">{transaction.type}</span>{!transaction.countsTowardCashflow && <span className="block font-bn text-[10.5px] text-ink-400">নিজের অ্যাকাউন্টে টাকা সরানো</span>}</TableCell>
                  <TableCell className="py-2 font-medium text-teal-700">{transaction.reference}</TableCell>
                  <TableCell className="py-2 text-ink-600">{transaction.party || '—'}</TableCell>
                  <TableCell className="max-w-[230px] py-2"><p className="truncate text-ink-500">{transaction.details || (transaction.due ? `${taka(transaction.due)} due` : '—')}</p>{!!transaction.due && <p className="font-bn text-[10.5px] text-warning">বাকি আছে {taka(transaction.due)}</p>}</TableCell>
                  <TableCell className="max-w-[210px] py-2"><p className="truncate text-ink-500">{transaction.accounts.length > 1 ? transaction.accounts.join(' + ') : transaction.accounts[0] || '—'}</p></TableCell>
                  <TableCell className="py-2 text-right font-medium text-success">{transaction.moneyIn ? taka(transaction.moneyIn) : '—'}</TableCell>
                  <TableCell className="py-2 text-right font-medium text-ink">{transaction.moneyOut ? taka(transaction.moneyOut) : '—'}</TableCell>
                  <TableCell className="py-2"><p className="font-medium text-ink">{transaction.postedBy}</p><p className="text-[10.5px] text-ink-400">{transaction.createdAt.slice(11, 16)}</p></TableCell>
                  <TableCell className="py-2"><StatusBadge tone={statusTone(transaction.status)} dot>{transaction.status}</StatusBadge></TableCell>
                  <TableCell className="py-2 pr-4 text-right">
                    <DaybookActions
                      transaction={transaction}
                      onOpen={setDetail}
                      onEdit={(item) => goToSource(item, true)}
                      onDelete={setDeleteTarget}
                      onGoToSource={(item) => goToSource(item)}
                      onPrint={printTransaction}
                      onDuplicate={duplicateTransaction}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {!filtered.length && (
                <TableRow>
                  <TableCell colSpan={11} className="py-14 text-center">
                    <p className="text-sm font-medium text-ink">No transactions found</p>
                    <p className="mt-1 font-bn text-xs text-ink-400">এই তারিখ বা ফিল্টারে কোনো লেনদেন নেই</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <TransactionDetailsDialog
        transaction={detail}
        onClose={() => setDetail(null)}
        onEdit={(item) => goToSource(item, true)}
        onDelete={(item) => { setDetail(null); setDeleteTarget(item); }}
        onGoToSource={(item) => goToSource(item)}
        onPrint={printTransaction}
        onDuplicate={duplicateTransaction}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete transaction?</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5">
            <p className="text-[13px] font-medium text-danger">{deleteTarget?.type} · {deleteTarget?.reference}</p>
            <p className="mt-1 font-bn text-[11px] text-ink-500">মুছে দিলে টাকা, বাকি ও হিসাবের প্রভাব নিরাপদভাবে বাতিল হবে। আগের ইতিহাস রাখা হবে।</p>
          </div>
          <label className="text-[13px] font-medium text-ink">
            Reason for delete <span className="font-bn text-[11px] font-normal text-ink-400">· কেন মুছছেন</span>
            <Input className="mt-1.5" value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} placeholder="e.g. Wrong transaction entered" />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={deleteTransaction}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
