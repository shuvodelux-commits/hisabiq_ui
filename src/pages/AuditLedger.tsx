import React, { useMemo, useState } from 'react';
import { Eye, MoreHorizontal, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../components/Dialog';
import { Input } from '../components/Input';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { FloatingPanel } from '../components/layout/FloatingPanel';
import { AuditDetailsDialog } from '../components/audit/AuditDetailsDialog';
import { AuditEditDialog } from '../components/audit/AuditEditDialog';
import { AuditFilters, type AuditFilterState } from '../components/audit/AuditFilters';
import { auditSourceRecords } from '../data/auditLedger';
import type { AuditSourceRecord } from '../types/audit';
import { applyDelete, auditTimelineFor, createAuditState } from '../utils/auditEngine';
import { taka } from '../utils/currency';
import { auditActionAvailability, demoPermissions } from '../utils/permissions';

function accountLabel(source: AuditSourceRecord) {
  if (source.source === 'transfer') return [source.fromAccount, source.toAccount].filter(Boolean).join(' → ');
  if (source.paymentAccounts?.length) return source.paymentAccounts.map((item) => item.account).join(' + ');
  return '—';
}

function sourceLabel(source: AuditSourceRecord) {
  const labels: Record<string, string> = {
    sale: 'Sales',
    'customer-payment': 'Sales / Party',
    purchase: 'Purchases',
    'supplier-payment': 'Purchases / Party',
    expense: 'Expenses',
    transfer: 'Finance',
    finance: 'Finance',
    'receipt-voucher': 'Accounts',
    'payment-voucher': 'Accounts',
    adjustment: 'Accounts'
  };
  return labels[source.source] ?? source.source;
}

export function AuditLedger() {
  const [state, setState] = useState(() => createAuditState(auditSourceRecords));
  const [filters, setFilters] = useState<AuditFilterState>({
    search: '',
    from: '2026-09-01',
    to: '2026-10-07',
    source: 'All sources',
    status: 'All status'
  });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return state.sources.filter((source) => {
      const matchesSearch = !query || [
        source.reference,
        source.party,
        source.description,
        source.postedBy,
        source.source,
        String(source.amount)
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
      const matchesDate = (!filters.from || source.transactionDate >= filters.from) && (!filters.to || source.transactionDate <= filters.to);
      const matchesSource = filters.source === 'All sources' || source.source === filters.source;
      const matchesStatus = filters.status === 'All status' || source.status === filters.status;
      return matchesSearch && matchesDate && matchesSource && matchesStatus;
    });
  }, [filters, state.sources]);

  const detail = detailId ? state.sources.find((item) => item.id === detailId) ?? null : null;
  const editSource = editId ? state.sources.find((item) => item.id === editId) ?? null : null;
  const deleteSource = deleteId ? state.sources.find((item) => item.id === deleteId) ?? null : null;
  const detailEvents = detail ? auditTimelineFor(state, detail.id) : [];
  const detailPosting = detail ? state.postings.find((item) => item.sourceId === detail.id) : undefined;

  const changedCount = new Set(state.auditEvents.filter((event) => event.type === 'Edited').map((event) => event.sourceId)).size;
  const deletedCount = state.sources.filter((item) => item.status === 'Deleted').length;
  const postedCount = state.sources.filter((item) => item.status === 'Posted').length;

  const requestEdit = (source: AuditSourceRecord) => {
    setDetailId(null);
    setEditId(source.id);
  };

  const requestDelete = (source: AuditSourceRecord) => {
    setDetailId(null);
    setDeleteReason('');
    setDeleteId(source.id);
  };

  const confirmDelete = () => {
    if (!deleteSource) return;
    if (!deleteReason.trim()) return toast.error('Enter a reason for deleting this transaction');
    try {
      const next = applyDelete({
        sourceId: deleteSource.id,
        reason: deleteReason,
        user: 'Shuvo',
        at: '2026-10-07T15:45:00+06:00'
      }, state);
      setState(next);
      setDeleteId(null);
      setDeleteReason('');
      toast.success('Transaction deleted safely', { description: 'The full balanced posting was undone and audit history was kept.' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete transaction');
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title="Audit Ledger"
        titleBn="হিসাব যাচাই"
        description="Review who posted a transaction, inspect its accounting effect, and safely correct posted records."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Posted records', String(postedCount), 'বর্তমানে চালু লেনদেন'],
          ['Changed records', String(changedCount), 'যেসব লেনদেন ঠিক করা হয়েছে'],
          ['Deleted records', String(deletedCount), 'ইতিহাস রেখে মুছে দেওয়া'],
          ['Audit events', String(state.auditEvents.length), 'সব পরিবর্তনের ইতিহাস']
        ].map(([label, value, helper]) => (
          <div key={label} className="rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-card">
            <p className="text-[12.5px] text-ink-500">{label}</p>
            <p className="mt-0.5 text-lg font-semibold text-ink">{value}</p>
            <p className="font-bn text-[10.5px] text-ink-400">{helper}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-card">
        <AuditFilters value={filters} onChange={setFilters} records={state.sources} />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 pl-4 text-xs">Transaction Date</TableHead>
                <TableHead className="h-9 text-xs">Created Date</TableHead>
                <TableHead className="h-9 text-xs">Type / Reference</TableHead>
                <TableHead className="h-9 text-xs">Party / Person</TableHead>
                <TableHead className="h-9 text-xs">Source</TableHead>
                <TableHead className="h-9 text-xs">Account / Payment</TableHead>
                <TableHead className="h-9 text-right text-xs">Amount</TableHead>
                <TableHead className="h-9 text-xs">Posted by</TableHead>
                <TableHead className="h-9 text-xs">Last changed by</TableHead>
                <TableHead className="h-9 text-xs">Status</TableHead>
                <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((source) => {
                const timeline = auditTimelineFor(state, source.id);
                const lastChange = timeline[0];
                const availability = auditActionAvailability(source.source, demoPermissions);
                return (
                  <TableRow key={source.id} className="text-[13px]">
                    <TableCell className="py-2 pl-4 font-medium text-ink">{source.transactionDate}</TableCell>
                    <TableCell className="py-2 text-ink-500">{source.createdAt.slice(0, 10)}</TableCell>
                    <TableCell className="py-2">
                      <p className="font-medium text-ink">{source.reference}</p>
                      <p className="text-[10.5px] text-ink-400">{source.source === 'adjustment' ? 'Adjustment Entry' : source.source.replaceAll('-', ' ')}</p>
                    </TableCell>
                    <TableCell className="py-2 text-ink-600">{source.party || '—'}</TableCell>
                    <TableCell className="py-2 text-ink-500">{sourceLabel(source)}</TableCell>
                    <TableCell className="max-w-[220px] py-2"><p className="truncate text-ink-500">{accountLabel(source)}</p></TableCell>
                    <TableCell className="py-2 text-right font-semibold text-ink">{taka(source.amount)}</TableCell>
                    <TableCell className="py-2"><p className="font-medium text-ink">{source.postedBy}</p><p className="text-[10.5px] text-ink-400">{source.createdAt.slice(11, 16)}</p></TableCell>
                    <TableCell className="py-2 text-ink-500">{lastChange?.user || '—'}</TableCell>
                    <TableCell className="py-2"><StatusBadge tone={source.status === 'Posted' ? 'success' : 'neutral'} dot>{source.status}</StatusBadge></TableCell>
                    <TableCell className="py-2 pr-4 text-right">
                      <FloatingPanel
                        label={'Audit actions for ' + source.reference}
                        width={190}
                        trigger={({ toggle }) => (
                          <button onClick={toggle} className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink" aria-label={'Actions for ' + source.reference}>
                            <MoreHorizontal className="size-4" />
                          </button>
                        )}>
                        {(close) => (
                          <div className="py-1">
                            {availability.view && <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-ink-700 hover:bg-ink-50" onClick={() => { close(); setDetailId(source.id); }}><Eye className="size-3.5" /> Open</button>}
                            {source.status === 'Posted' && availability.correct && <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-ink-700 hover:bg-ink-50" onClick={() => { close(); requestEdit(source); }}><Pencil className="size-3.5" /> Correct</button>}
                            {source.status === 'Posted' && availability.delete && <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12.5px] text-danger hover:bg-danger/5" onClick={() => { close(); requestDelete(source); }}><Trash2 className="size-3.5" /> Delete</button>}
                          </div>
                        )}
                      </FloatingPanel>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!filtered.length && (
                <TableRow>
                  <TableCell colSpan={11} className="py-14 text-center">
                    <ShieldCheck className="mx-auto size-5 text-ink-300" />
                    <p className="mt-2 text-sm font-medium text-ink">No audit records found</p>
                    <p className="mt-1 font-bn text-xs text-ink-400">এই ফিল্টারে কোনো লেনদেন নেই</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AuditDetailsDialog
        source={detail}
        posting={detailPosting}
        events={detailEvents}
        onClose={() => setDetailId(null)}
        onEdit={requestEdit}
        onDelete={requestDelete}
      />

      <AuditEditDialog
        source={editSource}
        state={state}
        onClose={() => setEditId(null)}
        onApply={(next) => {
          setState(next);
          setEditId(null);
        }}
      />

      <Dialog open={!!deleteSource} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete complete transaction?</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2.5">
            <p className="text-[13px] font-medium text-danger">{deleteSource?.reference} · {deleteSource ? taka(deleteSource.amount) : ''}</p>
            <p className="mt-1 font-bn text-[11px] text-ink-500">এক পাশের Debit/Credit আলাদা করে মুছবে না। পুরো লেনদেনের প্রভাব একসাথে বাতিল হবে এবং ইতিহাস থাকবে।</p>
          </div>
          <label className="text-[13px] font-medium text-ink">
            Reason for delete <span className="font-bn text-[11px] font-normal text-ink-400">· কেন মুছছেন</span>
            <Input className="mt-1.5" value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} placeholder="e.g. Duplicate transaction" />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
