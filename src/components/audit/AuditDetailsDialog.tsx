import React, { useMemo } from 'react';
import { ExternalLink, Pencil, Printer, Trash2 } from 'lucide-react';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { StatusBadge } from '../StatusBadge';
import { accountingAccounts } from '../../data/accounting';
import type { AuditEvent, AuditSourceRecord } from '../../types/audit';
import type { Posting } from '../../types/accounting';
import { taka } from '../../utils/currency';
import { AuditTimeline } from './AuditTimeline';
import { auditActionAvailability, demoPermissions } from '../../utils/permissions';

function Detail({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return <div className="rounded-lg bg-ink-50 px-3 py-2.5"><p className="text-[10.5px] text-ink-400">{label}{helper ? <span className="font-bn"> · {helper}</span> : null}</p><div className="mt-0.5 text-[12.5px] font-medium text-ink">{children}</div></div>;
}

export function AuditDetailsDialog({
  source,
  posting,
  events,
  onClose,
  onEdit,
  onDelete,
  onGoToSource
}: {
  source: AuditSourceRecord | null;
  posting?: Posting;
  events: readonly AuditEvent[];
  onClose: () => void;
  onEdit: (source: AuditSourceRecord) => void;
  onDelete: (source: AuditSourceRecord) => void;
  onGoToSource: (source: AuditSourceRecord) => void;
}) {
  const accountMap = useMemo(() => new Map(accountingAccounts.map((item) => [item.id, item.name])), []);
  if (!source) return null;
  const lastEvent = events[0];
  const availability = auditActionAvailability(source.source, demoPermissions);
  const hasReturnDependency = source.source === 'sale' && (source.returnedQuantity ?? 0) > 0;

  return (
    <Dialog open={!!source} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{source.reference} <StatusBadge tone={source.status === 'Posted' ? 'success' : 'neutral'} dot>{source.status}</StatusBadge></DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Transaction Date" helper="যে তারিখের লেনদেন">{source.transactionDate}</Detail>
          <Detail label="Created Date" helper="যেদিন এন্ট্রি হয়েছে">{source.createdAt.slice(0, 10)}</Detail>
          <Detail label="Posted by">{source.postedBy}</Detail>
          <Detail label="Posted at">{source.createdAt.replace('T', ' ').slice(0, 16)}</Detail>
          <Detail label="Party / Person">{source.party || '—'}</Detail>
          <Detail label="Amount">{taka(source.amount)}</Detail>
          <Detail label="Paid">{source.paid ? taka(source.paid) : '—'}</Detail>
          <Detail label="Due">{source.due ? taka(source.due) : '—'}</Detail>
          <Detail label="Source">{source.source.replaceAll('-', ' ')}</Detail>
          <Detail label="Reference">{source.reference}</Detail>
          <Detail label="Last changed by">{lastEvent?.user || '—'}</Detail>
          <Detail label="Last changed at">{lastEvent?.at?.replace('T', ' ').slice(0, 16) || '—'}</Detail>
          {source.quantity !== undefined && <Detail label="Quantity">{source.quantity}</Detail>}
          {source.returnedQuantity !== undefined && <Detail label="Already returned">{source.returnedQuantity}</Detail>}
          {source.fromAccount && <Detail label="From account">{source.fromAccount}</Detail>}
          {source.toAccount && <Detail label="To account">{source.toAccount}</Detail>}
        </div>

        {(source.description || source.note) && (
          <div className="grid gap-2 sm:grid-cols-2">
            {source.description && <div className="rounded-lg border border-ink-100 px-3 py-2.5"><p className="text-[10.5px] text-ink-400">Description</p><p className="mt-0.5 text-[12.5px] text-ink-700">{source.description}</p></div>}
            {source.note && <div className="rounded-lg border border-ink-100 px-3 py-2.5"><p className="text-[10.5px] text-ink-400">Internal note</p><p className="mt-0.5 text-[12.5px] text-ink-700">{source.note}</p></div>}
          </div>
        )}

        {hasReturnDependency && (
          <div className="rounded-xl border border-warning/20 bg-warning/5 px-3 py-2.5">
            <p className="text-[12.5px] font-semibold text-ink">Linked return blocks complete Delete</p>
            <p className="mt-1 font-bn text-[10.5px] text-ink-500">এই Sale থেকে {source.returnedQuantity}টি পণ্য Return হয়েছে। Sale মুছতে হলে আগে Return ঠিক বা মুছতে হবে। অন্য নিরাপদ correction করা যাবে।</p>
          </div>
        )}

        {!!source.paymentAccounts?.length && (
          <div className="rounded-xl border border-ink-100">
            <div className="border-b border-ink-100 px-3 py-2.5"><p className="text-[12.5px] font-semibold text-ink">Payment / Money Accounts</p><p className="font-bn text-[10.5px] text-ink-400">কোন অ্যাকাউন্টে কত টাকার প্রভাব</p></div>
            <div className="divide-y divide-ink-100">
              {source.paymentAccounts.map((payment, index) => (
                <div key={index} className="flex items-center justify-between px-3 py-2 text-[12px]"><span className="text-ink-600">{payment.account}</span><span className="font-medium text-ink">{taka(payment.amount)}</span></div>
              ))}
            </div>
          </div>
        )}

        {posting && (
          <div className="rounded-xl border border-ink-100">
            <div className="flex items-center justify-between border-b border-ink-100 px-3 py-2.5">
              <div><p className="text-[12.5px] font-semibold text-ink">Accounting posting</p><p className="font-bn text-[10.5px] text-ink-400">এই লেনদেন থেকে তৈরি হিসাব — এক পাশ আলাদা করে পরিবর্তন করা যাবে না</p></div>
              <StatusBadge tone={posting.status === 'Posted' ? 'success' : 'neutral'}>{posting.status}</StatusBadge>
            </div>
            <div className="divide-y divide-ink-100">
              {posting.lines.map((line, index) => (
                <div key={index} className="grid grid-cols-[1fr_110px_110px] gap-2 px-3 py-2 text-[12px]">
                  <span className="text-ink-600">{accountMap.get(line.accountId) || line.accountId}</span>
                  <span className="text-right text-ink-500">{line.debit ? 'Debit ' + taka(line.debit) : '—'}</span>
                  <span className="text-right text-ink-500">{line.credit ? 'Credit ' + taka(line.credit) : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-[12.5px] font-semibold text-ink">Audit history <span className="font-bn text-[10.5px] font-normal text-ink-400">· কে কী পরিবর্তন করেছেন</span></p>
          <AuditTimeline events={events} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
          <Button variant="outline" onClick={() => onGoToSource(source)}><ExternalLink className="size-4" /> Go to source</Button>
          {source.status === 'Posted' && availability.correct && <Button variant="outline" onClick={() => onEdit(source)}><Pencil className="size-4" /> Correct</Button>}
          {source.status === 'Posted' && availability.delete && <Button variant="outline" onClick={() => onDelete(source)}><Trash2 className="size-4" /> Delete</Button>}
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
