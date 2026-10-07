import React, { useEffect, useState } from 'react';
import { Paperclip, Pencil, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { Input } from '../Input';
import { StatusBadge } from '../StatusBadge';
import type { ChequeRecord, ChequeStatus } from '../../data/cheques';
import { chequeLifecycleActions, type ChequeLifecycleAction } from '../../utils/moduleUiActions';
import { taka } from '../../utils/currency';

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-lg bg-ink-50 px-3 py-2.5"><p className="text-[10.5px] text-ink-400">{label}</p><div className="mt-0.5 text-[12.5px] font-medium text-ink">{children}</div></div>;
}

export function ChequeActionDialog({
  cheque,
  onClose,
  onUpdate,
  onStatus
}: {
  cheque: ChequeRecord | null;
  onClose: () => void;
  onUpdate: (cheque: ChequeRecord) => void;
  onStatus: (cheque: ChequeRecord, nextStatus: ChequeStatus, reason?: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [pendingAction, setPendingAction] = useState<ChequeLifecycleAction | null>(null);
  const [reason, setReason] = useState('');
  const [bank, setBank] = useState('');
  const [branch, setBranch] = useState('');
  const [party, setParty] = useState('');
  const [chequeDate, setChequeDate] = useState('');
  const [depositAccount, setDepositAccount] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!cheque) return;
    setEditing(false);
    setPendingAction(null);
    setReason('');
    setBank(cheque.bank);
    setBranch(cheque.branch ?? '');
    setParty(cheque.party);
    setChequeDate(cheque.chequeDate);
    setDepositAccount(cheque.depositAccount ?? '');
    setReference(cheque.reference ?? '');
    setNote(cheque.note ?? '');
  }, [cheque]);

  if (!cheque) return null;
  const actions = chequeLifecycleActions({ direction: cheque.direction, status: cheque.status });
  const terminal = actions.length === 0;

  const save = () => {
    if (!bank.trim() || !party.trim() || !chequeDate) return toast.error('Bank, party and cheque date are required');
    onUpdate({
      ...cheque,
      bank: bank.trim(),
      branch: branch.trim() || undefined,
      party: party.trim(),
      chequeDate,
      depositAccount: depositAccount.trim() || undefined,
      reference: reference.trim() || undefined,
      note: note.trim() || undefined
    });
    setEditing(false);
  };

  const confirmStatus = () => {
    if (!pendingAction) return;
    if (pendingAction.reasonRequired && !reason.trim()) return toast.error('Enter a reason for this cheque status');
    onStatus(cheque, pendingAction.nextStatus, reason.trim() || undefined);
    setPendingAction(null);
    setReason('');
  };

  return (
    <Dialog open={!!cheque} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cheque #{cheque.chequeNumber} <StatusBadge tone={cheque.status === 'Cleared' ? 'success' : ['Bounced', 'Returned', 'Stopped', 'Cancelled'].includes(cheque.status) ? 'danger' : 'neutral'} dot>{cheque.status}</StatusBadge></DialogTitle>
        </DialogHeader>

        {editing ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-[13px] font-medium text-ink">Bank<Input className="mt-1.5" value={bank} onChange={(event) => setBank(event.target.value)} /></label>
            <label className="text-[13px] font-medium text-ink">Branch<Input className="mt-1.5" value={branch} onChange={(event) => setBranch(event.target.value)} /></label>
            <label className="text-[13px] font-medium text-ink">Party<Input className="mt-1.5" value={party} onChange={(event) => setParty(event.target.value)} /></label>
            <label className="text-[13px] font-medium text-ink">Cheque date<Input className="mt-1.5" type="date" value={chequeDate} onChange={(event) => setChequeDate(event.target.value)} /></label>
            <label className="text-[13px] font-medium text-ink">Money account<Input className="mt-1.5" value={depositAccount} onChange={(event) => setDepositAccount(event.target.value)} placeholder="Bank account used on clearance" /></label>
            <label className="text-[13px] font-medium text-ink">Reference<Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} /></label>
            <label className="text-[13px] font-medium text-ink sm:col-span-2">Note<Input className="mt-1.5" value={note} onChange={(event) => setNote(event.target.value)} /></label>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Detail label="Direction">{cheque.direction}</Detail>
              <Detail label="Amount">{taka(cheque.amount)}</Detail>
              <Detail label="Bank">{cheque.bank}{cheque.branch ? ' · ' + cheque.branch : ''}</Detail>
              <Detail label="Party">{cheque.party}</Detail>
              <Detail label="Received / issued">{cheque.receivedOrIssuedDate}</Detail>
              <Detail label="Cheque date">{cheque.chequeDate}</Detail>
              <Detail label="Money account">{cheque.depositAccount || '—'}</Detail>
              <Detail label="Reference">{cheque.reference || '—'}</Detail>
            </div>

            {(cheque.attachment || cheque.note) && <div className="grid gap-2 sm:grid-cols-2">
              {cheque.attachment && <div className="rounded-lg border border-ink-100 px-3 py-2.5"><p className="text-[10.5px] text-ink-400">Attachment</p><p className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-ink"><Paperclip className="size-3.5" /> {cheque.attachment}</p></div>}
              {cheque.note && <div className="rounded-lg border border-ink-100 px-3 py-2.5"><p className="text-[10.5px] text-ink-400">Note</p><p className="mt-1 text-[12px] text-ink-700">{cheque.note}</p></div>}
            </div>}

            {cheque.statusUpdatedBy && <div className="rounded-lg bg-ink-50 px-3 py-2 text-[10.5px] text-ink-500">Last status changed by {cheque.statusUpdatedBy} · {cheque.statusUpdatedAt?.replace('T', ' ').slice(0, 16)}{cheque.statusReason ? ' · ' + cheque.statusReason : ''}</div>}

            {!terminal && !pendingAction && <div className="rounded-xl border border-ink-100 p-3">
              <p className="text-[12.5px] font-semibold text-ink">Next cheque action</p>
              <p className="mt-0.5 font-bn text-[10.5px] text-ink-400">Cleared না হওয়া পর্যন্ত Bank balance বদলাবে না</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {actions.map((item) => <Button key={item.id} variant="outline" size="sm" onClick={() => setPendingAction(item)}>{item.label}</Button>)}
              </div>
            </div>}

            {pendingAction && <div className="rounded-xl border border-warning/20 bg-warning/5 p-3">
              <p className="text-[12.5px] font-semibold text-ink">{pendingAction.label}?</p>
              <p className="mt-0.5 text-[11px] text-ink-500">Status will become <strong>{pendingAction.nextStatus}</strong>{pendingAction.nextStatus === 'Cleared' ? '. Money account balance will update now.' : '.'}</p>
              {pendingAction.reasonRequired && <label className="mt-3 block text-[12px] font-medium text-ink">Reason <span className="font-bn font-normal text-ink-400">· কারণ</span><Input className="mt-1.5" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Why is this status changing?" /></label>}
            </div>}
          </div>
        )}

        <DialogFooter>
          {editing ? <><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button><Button onClick={save}>Save cheque</Button></> :
            pendingAction ? <><Button variant="outline" onClick={() => { setPendingAction(null); setReason(''); }}>Back</Button><Button onClick={confirmStatus}>Confirm {pendingAction.nextStatus}</Button></> :
            <><Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print</Button>{!terminal && <Button variant="outline" onClick={() => setEditing(true)}><Pencil className="size-4" /> Edit</Button>}<Button onClick={onClose}>Close</Button></>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
