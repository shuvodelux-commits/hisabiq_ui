import { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowDownToLine, ArrowUpRight, CalendarClock, Printer, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/Dialog';
import {downloadReport,printReport} from '../utils/reportOutput';
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
  const [transactions] = useState<UnifiedTransaction[]>(daybookTransactions);
  const [detail, setDetail] = useState<UnifiedTransaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UnifiedTransaction | null>(null);
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
    if (edit) {
      navigate(`/app/audit-ledger?editRef=${encodeURIComponent(transaction.reference)}`);
      return;
    }
    navigate(transaction.sourceRoute || '/app/daybook');
  };

  const reportHeaders=['Date','Type','Reference','Party','Details','Account','Money in','Money out','Posted by','Status'];
  const reportRow=(transaction:UnifiedTransaction)=>[dateForView(transaction,entryDateView),transaction.type,transaction.reference,transaction.party??'',transaction.details??'',transaction.accounts.join(' + '),transaction.moneyIn,transaction.moneyOut,transaction.postedBy,transaction.status];
  const print=(rows:UnifiedTransaction[],title='Day Book')=>{
    if(!printReport({title,subtitle:`${filters.from||'All dates'} — ${filters.to||'All dates'} · ${entryDateView==='created'?'Created date':'Transaction date'}`,headers:reportHeaders,rows:rows.map(reportRow)}))toast.error('Allow the print preview window, then try again.');
  };
  const printTransaction=(transaction:UnifiedTransaction)=>print([transaction],transaction.reference);

  const duplicateTransaction = (transaction: UnifiedTransaction) => {
    if (transaction.source === 'sale') {
      navigate(`/app/pos?mode=duplicate&invoice=${encodeURIComponent(transaction.reference)}`);
    }
  };

  const exportDaybook=()=>downloadReport('hisabiq-daybook.csv',reportHeaders,filtered.map(reportRow));

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Daybook"
        titleBn="দৈনিক লেনদেন"
        description="Money in and money out · টাকা আসা–যাওয়া. UI preview; review changes at the source."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setEntryDateView('transaction')}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${entryDateView === 'transaction' ? 'bg-inverse text-white' : 'text-ink-500 hover:bg-ink-50'}`}>
              Transaction Date
            </button>
            <button
              onClick={() => setEntryDateView('created')}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${entryDateView === 'created' ? 'bg-inverse text-white' : 'text-ink-500 hover:bg-ink-50'}`}>
              Created Date
            </button>
            </div>
            <Button variant="outline" size="sm" onClick={exportDaybook}><ArrowDownToLine className="size-4" /> Export</Button>
            <Button variant="outline" size="sm" onClick={() => print(filtered)}><Printer className="size-4" /> Print</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
          <div className="flex items-center justify-between"><p className="text-[12.5px] text-ink-500">Money In <span className="font-bn text-[11px]">· টাকা এসেছে</span></p><ArrowDownLeft className="size-4 text-success" /></div>
          <p className="mt-0.5 text-lg font-semibold text-success">{taka(summary.moneyIn)}</p>
          <p className="text-[10.5px] text-ink-400">Actual money received in this view</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
          <div className="flex items-center justify-between"><p className="text-[12.5px] text-ink-500">Money Out <span className="font-bn text-[11px]">· টাকা গেছে</span></p><ArrowUpRight className="size-4 text-danger" /></div>
          <p className="mt-0.5 text-lg font-semibold text-ink">{taka(summary.moneyOut)}</p>
          <p className="text-[10.5px] text-ink-400">Actual money paid in this view</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
          <div className="flex items-center justify-between"><p className="text-[12.5px] text-ink-500">Net movement</p><WalletCards className="size-4 text-helper" /></div>
          <p className={`mt-0.5 text-lg font-semibold ${summary.net < 0 ? 'text-danger' : 'text-ink'}`}>{summary.net < 0 ? '−' : ''}{taka(Math.abs(summary.net))}</p>
          <p className="text-[10.5px] text-ink-400">Internal transfers excluded</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-card">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1 text-[12.5px] text-ink-500">Entries <Tooltip content="এই তারিখ বা তারিখের মধ্যে পাওয়া মোট ব্যবসার লেনদেন।" /></p>
            <CalendarClock className="size-4 text-helper" />
          </div>
          <p className="mt-0.5 text-lg font-semibold text-ink">{filtered.length}</p>
          <p className="font-bn text-[10.5px] text-ink-400">নির্বাচিত সময়ের লেনদেন</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
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
            <DialogTitle>Review source reversal · লেনদেন যাচাই</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5">
            <p className="text-[13px] font-medium text-danger">{deleteTarget?.type} · {deleteTarget?.reference}</p>
            <p className="mt-1 font-bn text-[11px] text-ink-500">দৈনিক খাতা থেকে আলাদা করে লেনদেন মুছবেন না। মূল লেনদেন ও তার প্রভাব যাচাই করুন।</p>
          </div>
          <p className="text-sm text-ink-600">Day Book is a transaction view. Open the source audit to review its full money, due and stock impact. This preview cannot reverse a source by deleting a display row.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button onClick={()=>{if(deleteTarget){navigate(`/app/audit-ledger?openRef=${encodeURIComponent(deleteTarget.reference)}`);setDeleteTarget(null);}}}>Review source audit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

