import React from 'react';
import { Printer, RefreshCw } from 'lucide-react';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { StatusBadge } from '../StatusBadge';
import type { CashSessionRecord } from '../../data/financeAccounts';
import { taka } from '../../utils/currency';

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-lg bg-ink-50 px-3 py-2.5"><p className="text-[10.5px] text-ink-400">{label}</p><div className="mt-0.5 text-[12.5px] font-medium text-ink">{children}</div></div>;
}

export function CashSessionDetailsDialog({
  session,
  onClose,
  onReconcile
}: {
  session: CashSessionRecord | null;
  onClose: () => void;
  onReconcile: (session: CashSessionRecord) => void;
}) {
  if (!session) return null;
  const variance = session.variance ?? (session.countedCash === undefined ? undefined : session.countedCash - session.expectedCash);

  return (
    <Dialog open={!!session} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>{session.id} <StatusBadge tone={session.status === 'Open' ? 'success' : variance ? 'warning' : 'neutral'} dot>{session.status}</StatusBadge></DialogTitle></DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Date">{session.date}</Detail>
          <Detail label="Opened">{session.openedAt}</Detail>
          <Detail label="Closed">{session.closedAt || 'Still open'}</Detail>
          <Detail label="Opening cash">{taka(session.openingCash)}</Detail>
          <Detail label="Expected cash">{taka(session.expectedCash)}</Detail>
          <Detail label="Counted cash">{session.countedCash === undefined ? '—' : taka(session.countedCash)}</Detail>
          <Detail label="Variance">{variance === undefined ? '—' : (variance > 0 ? '+' : variance < 0 ? '−' : '') + taka(Math.abs(variance))}</Detail>
          <div className="sm:col-span-2"><Detail label="Note">{session.note || '—'}</Detail></div>
        </div>
        {variance !== undefined && variance !== 0 && <div className="rounded-lg border border-warning/20 bg-warning/5 px-3 py-2.5"><p className="text-[12.5px] font-medium text-ink">Cash variance needs review</p><p className="mt-1 font-bn text-[10.5px] text-ink-500">Short/over নিজে থেকে balancing transaction তৈরি করবে না। Reconciliation-এ যাচাই করুন।</p></div>}
        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>
          <Button variant="outline" onClick={() => onReconcile(session)}><RefreshCw className="size-4" /> Reconcile</Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
