import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import { parties } from '../../data/parties';
import type { AuditSourceRecord, AuditState, CorrectionCommand } from '../../types/audit';
import { applyCorrection, buildImpactPreview, validateCorrection } from '../../utils/auditEngine';
import { ImpactPreview } from './ImpactPreview';

export function AuditEditDialog({
  source,
  state,
  onClose,
  onApply
}: {
  source: AuditSourceRecord | null;
  state: AuditState;
  onClose: () => void;
  onApply: (state: AuditState) => void;
}) {
  const [review, setReview] = useState(false);
  const [date, setDate] = useState('');
  const [partyId, setPartyId] = useState('');
  const [party, setParty] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [payments, setPayments] = useState<Array<{ account: string; amount: string }>>([]);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!source) return;
    setReview(false);
    setDate(source.transactionDate);
    setPartyId(source.partyId ?? '');
    setParty(source.party ?? '');
    setAmount(String(source.amount));
    setDescription(source.description ?? '');
    setQuantity(source.quantity === undefined ? '' : String(source.quantity));
    setPayments((source.paymentAccounts ?? []).map((item) => ({ account: item.account, amount: String(item.amount) })));
    setReason('');
  }, [source]);

  const command = useMemo<CorrectionCommand | null>(() => {
    if (!source) return null;
    const nextPayments = payments
      .map((item) => ({ account: item.account.trim(), amount: parseFloat(item.amount) || 0 }))
      .filter((item) => item.account || item.amount);
    const paid = nextPayments.reduce((sum, item) => sum + item.amount, 0);
    const patch: CorrectionCommand['patch'] = {};
    if (date !== source.transactionDate) patch.transactionDate = date;
    if (partyId && partyId !== source.partyId) patch.partyId = partyId;
    if (party !== (source.party ?? '')) patch.party = party;
    const nextAmount = parseFloat(amount) || 0;
    if (nextAmount !== source.amount) patch.amount = nextAmount;
    if (description !== (source.description ?? '')) patch.description = description;
    if (source.quantity !== undefined && quantity !== '' && Number(quantity) !== source.quantity) patch.quantity = Number(quantity);
    if (JSON.stringify(nextPayments) !== JSON.stringify(source.paymentAccounts ?? [])) {
      patch.paymentAccounts = nextPayments;
      patch.paid = paid;
    }
    return {
      sourceId: source.id,
      patch,
      reason,
      user: 'Shuvo',
      at: '2026-10-07T15:30:00+06:00'
    };
  }, [amount, date, description, party, partyId, payments, quantity, reason, source]);

  const preview = command ? buildImpactPreview(command, state) : { changes: [], impacts: [] };
  const validation = command ? validateCorrection(command, state) : { allowed: false, fieldErrors: {} as Record<string, string> };

  const partyOptions = parties.map((item) => ({ value: item.id, label: item.name }));

  const startReview = () => {
    if (!command || !preview.changes.length) return toast.error('No changes to review');
    if (!validation.allowed) {
      toast.error(Object.values(validation.fieldErrors)[0] || 'Review the highlighted fields');
      return;
    }
    setReview(true);
  };

  const save = () => {
    if (!command) return;
    try {
      onApply(applyCorrection(command, state));
      toast.success('Transaction corrected', { description: source?.reference });
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not apply correction');
    }
  };

  return (
    <Dialog open={!!source} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{review ? 'Review changes' : 'Correct transaction'} <span className="font-bn text-sm font-normal text-ink-400">· হিসাব ঠিক করুন</span></DialogTitle>
        </DialogHeader>

        {!review && source && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-[13px] font-medium text-ink">
                Transaction Date <span className="font-bn text-[11px] font-normal text-ink-400">· যে তারিখের লেনদেন</span>
                <Input className="mt-1.5" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </label>
              <label className="text-[13px] font-medium text-ink">
                Created Date
                <Input className="mt-1.5 bg-ink-50 text-ink-500" value={source.createdAt.slice(0, 10)} readOnly />
                <span className="mt-1 block font-bn text-[10.5px] font-normal text-ink-400">এটি বদলানো যাবে না</span>
              </label>

              {source.partyId ? (
                <label className="text-[13px] font-medium text-ink">
                  Party / Person <span className="font-bn text-[11px] font-normal text-ink-400">· যার সাথে লেনদেন</span>
                  <FormSelect
                    className="mt-1.5"
                    value={partyId}
                    onChange={(event) => {
                      const id = event.target.value;
                      setPartyId(id);
                      setParty(parties.find((item) => item.id === id)?.name ?? party);
                    }}
                    options={partyOptions}
                  />
                </label>
              ) : (
                <label className="text-[13px] font-medium text-ink">
                  Party / Person
                  <Input className="mt-1.5" value={party} onChange={(event) => setParty(event.target.value)} />
                </label>
              )}

              <label className="text-[13px] font-medium text-ink">
                Amount
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
                  <Input className="pl-7 text-right" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} />
                </div>
              </label>

              {source.quantity !== undefined && (
                <label className="text-[13px] font-medium text-ink">
                  Quantity
                  <Input className="mt-1.5 text-right" inputMode="decimal" value={quantity} onChange={(event) => setQuantity(event.target.value.replace(/[^\d.]/g, ''))} />
                  {validation.fieldErrors.quantity && <span className="mt-1 block font-bn text-[10.5px] text-danger">ফেরত দেওয়া পরিমাণের চেয়ে কম করা যাবে না</span>}
                </label>
              )}

              <label className="text-[13px] font-medium text-ink sm:col-span-2">
                Description
                <Input className="mt-1.5" value={description} onChange={(event) => setDescription(event.target.value)} />
              </label>
            </div>

            {(source.paymentAccounts?.length || source.paid > 0) && (
              <div className="rounded-xl border border-ink-100">
                <div className="flex items-center justify-between border-b border-ink-100 px-3 py-2.5">
                  <div>
                    <p className="text-[12.5px] font-semibold text-ink">Payment split</p>
                    <p className="font-bn text-[10.5px] text-ink-400">কোন অ্যাকাউন্ট থেকে কত টাকা গেছে বা এসেছে</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setPayments((current) => [...current, { account: '', amount: '' }])}><Plus className="size-3.5" /> Add</Button>
                </div>
                <div className="space-y-2 p-3">
                  {payments.map((payment, index) => (
                    <div key={index} className="grid grid-cols-[1fr_130px_32px] gap-2">
                      <Input value={payment.account} onChange={(event) => setPayments((current) => current.map((item, i) => i === index ? { ...item, account: event.target.value } : item))} placeholder="Cash / Bank / bKash account" />
                      <Input className="text-right" inputMode="decimal" value={payment.amount} onChange={(event) => setPayments((current) => current.map((item, i) => i === index ? { ...item, amount: event.target.value.replace(/[^\d.]/g, '') } : item))} placeholder="0" />
                      <button type="button" onClick={() => setPayments((current) => current.filter((_, i) => i !== index))} className="flex size-8 items-center justify-center rounded-md text-ink-400 hover:bg-danger/5 hover:text-danger" aria-label="Remove payment"><Trash2 className="size-3.5" /></button>
                    </div>
                  ))}
                  {validation.fieldErrors.paymentAccounts && <p className="font-bn text-[10.5px] text-danger">পেমেন্টের মোট টাকা Paid amount-এর সাথে মিলতে হবে</p>}
                </div>
              </div>
            )}

            <label className="block text-[13px] font-medium text-ink">
              Reason for change <span className="font-bn text-[11px] font-normal text-ink-400">· কেন পরিবর্তন করছেন</span>
              <Input className="mt-1.5" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Wrong date and payment account entered" />
              {validation.fieldErrors._reason && <span className="mt-1 block font-bn text-[10.5px] text-danger">এই পরিবর্তনের কারণ লিখুন</span>}
            </label>
          </div>
        )}

        {review && <ImpactPreview preview={preview} />}

        <DialogFooter>
          {review ? (
            <>
              <Button variant="outline" onClick={() => setReview(false)}>Back</Button>
              <Button onClick={save}>Save changes</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={startReview}>Review changes</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
