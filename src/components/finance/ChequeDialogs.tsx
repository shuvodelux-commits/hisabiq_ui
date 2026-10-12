import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import type { ChequeDirection, ChequeRecord, ChequeStatus } from '../../data/cheques';

export function ChequeDialog({
  open,
  onOpenChange,
  onSave,
  accountOptions = []
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (cheque: ChequeRecord) => void;
  accountOptions?: string[];
}) {
  const [direction, setDirection] = useState<ChequeDirection>('Received');
  const [chequeNumber, setChequeNumber] = useState('');
  const [bank, setBank] = useState('');
  const [branch, setBranch] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [party, setParty] = useState('');
  const [amount, setAmount] = useState('');
  const [entryDate, setEntryDate] = useState('2026-10-07');
  const [chequeDate, setChequeDate] = useState('2026-10-07');
  const [depositAccount, setDepositAccount] = useState('');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [attachment, setAttachment] = useState('');

  const save = () => {
    const value = parseFloat(amount) || 0;
    if (!chequeNumber.trim() || !bank.trim() || !party.trim() || !value) {
      toast.error('Cheque number, bank, party and amount are required');
      return;
    }
    const status: ChequeStatus = direction === 'Received' ? 'Received' : 'Issued';
    onSave({
      id: `CHQ-${String(Date.now()).slice(-6)}`,
      direction,
      chequeNumber: chequeNumber.trim(),
      bank: bank.trim(),
      branch: branch.trim() || undefined,
      accountHolder: accountHolder.trim() || undefined,
      amount: value,
      party: party.trim(),
      receivedOrIssuedDate: entryDate,
      chequeDate,
      depositAccount: depositAccount.trim() || undefined,
      reference: reference.trim() || undefined,
      note: note.trim() || undefined,
      attachment: attachment || undefined,
      status,
      createdAt: '2026-10-07T15:30:00+06:00',
      postedBy: 'Shuvo'
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New cheque <span className="font-bn text-sm font-normal text-ink-500">· নতুন চেক</span></DialogTitle>
          <DialogDescription>Record received or issued cheques. Bank balance changes only after the cheque clears.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-medium text-ink">
            Cheque type <span className="font-bn text-[11px] font-normal text-ink-400">· চেক পেয়েছি নাকি দিয়েছি</span>
            <FormSelect className="mt-1.5" value={direction} onChange={(event) => setDirection(event.target.value as ChequeDirection)} options={['Received', 'Issued']} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            Cheque number
            <Input className="mt-1.5" value={chequeNumber} onChange={(event) => setChequeNumber(event.target.value)} placeholder="e.g. 458923" />
          </label>
          <label className="text-[13px] font-medium text-ink">
            Bank
            <Input className="mt-1.5" value={bank} onChange={(event) => setBank(event.target.value)} placeholder="Bank name" />
          </label>
          <label className="text-[13px] font-medium text-ink">
            Branch
            <Input className="mt-1.5" value={branch} onChange={(event) => setBranch(event.target.value)} placeholder="Optional" />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {direction === 'Received' ? 'Received from' : 'Issued to'} <span className="font-bn text-[11px] font-normal text-ink-400">· {direction === 'Received' ? 'কার কাছ থেকে পেয়েছি' : 'কাকে দিয়েছি'}</span>
            <Input className="mt-1.5" value={party} onChange={(event) => setParty(event.target.value)} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            Account holder
            <Input className="mt-1.5" value={accountHolder} onChange={(event) => setAccountHolder(event.target.value)} placeholder="Optional" />
          </label>
          <label className="text-[13px] font-medium text-ink">
            Amount
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
              <Input className="pl-7 text-right" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} placeholder="0" />
            </div>
          </label>
          <label className="text-[13px] font-medium text-ink">
            Cheque date <span className="font-bn text-[11px] font-normal text-ink-400">· চেকে লেখা তারিখ</span>
            <Input className="mt-1.5" type="date" value={chequeDate} onChange={(event) => setChequeDate(event.target.value)} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {direction === 'Received' ? 'Received date' : 'Issued date'}
            <Input className="mt-1.5" type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            Bank / Money Account
            {accountOptions.length ? <FormSelect className="mt-1.5" value={depositAccount || accountOptions[0]} onChange={(event) => setDepositAccount(event.target.value)} options={accountOptions} /> : <Input className="mt-1.5" value={depositAccount} onChange={(event) => setDepositAccount(event.target.value)} placeholder="e.g. Dutch-Bangla Bank · 4582" />}
          </label>
          <label className="text-[13px] font-medium text-ink">
            Reference
            <Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Invoice / bill / note" />
          </label>
          <label className="text-[13px] font-medium text-ink">
            Note
            <Input className="mt-1.5" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" />
          </label>
          <label className="text-[13px] font-medium text-ink sm:col-span-2">
            Attachment <span className="font-bn text-[11px] font-normal text-ink-400">· চেকের ছবি বা PDF</span>
            <Input className="mt-1.5" type="file" accept="image/*,.pdf" onChange={(event) => setAttachment(event.target.files?.[0]?.name ?? '')} />
            {attachment && <span className="mt-1 block text-[10.5px] text-ink-400">{attachment}</span>}
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save}>Save cheque</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
