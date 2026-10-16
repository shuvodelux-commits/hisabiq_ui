import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import type { ChequeDirection, ChequeRecord, ChequeStatus } from '../../data/cheques';
import {useUiCopy} from '../../i18n/useUiCopy';

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
  const {text,showHelper}=useUiCopy();
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
    const value = Number(amount);
    if (!chequeNumber.trim() || !bank.trim() || !party.trim() || !Number.isFinite(value) || value <= 0) {
      toast.error(text('Cheque number, bank, party and amount are required','চেক নম্বর, ব্যাংক, পক্ষের নাম ও টাকা লিখুন'));
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
      depositAccount: (depositAccount || accountOptions[0])?.trim() || undefined,
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
          <DialogTitle>{text("New cheque","নতুন চেক")} {showHelper&&<span className="font-bn text-sm font-normal text-ink-500">· নতুন চেক</span>}</DialogTitle>
          <DialogDescription>{text('Record received or issued cheques. Bank balance changes only after the cheque clears.','পাওয়া বা দেওয়া চেক লিখুন। চেকের টাকা ক্লিয়ার হলেই ব্যাংকের জের বদলাবে।')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] font-medium text-ink">
            {text('Cheque type','চেকের ধরন')} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· চেক পেয়েছি নাকি দিয়েছি</span>}
            <FormSelect className="mt-1.5" value={direction} onChange={(event) => setDirection(event.target.value as ChequeDirection)} options={['Received','Issued'].map(value=>({value,label:text(value,value==='Received'?'পেয়েছি':'দিয়েছি')}))} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Cheque number','চেক নম্বর')}
            <Input className="mt-1.5" value={chequeNumber} onChange={(event) => setChequeNumber(event.target.value)} placeholder="e.g. 458923" />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Bank','ব্যাংক')}
            <Input className="mt-1.5" value={bank} onChange={(event) => setBank(event.target.value)} placeholder={text("Bank name","ব্যাংকের নাম")} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Branch','শাখা')}
            <Input className="mt-1.5" value={branch} onChange={(event) => setBranch(event.target.value)} placeholder={text("Optional","ঐচ্ছিক")} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {direction === 'Received' ? text('Received from','কার কাছ থেকে পেয়েছি') : text('Issued to','কাকে দিয়েছি')} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· {direction === 'Received' ? 'কার কাছ থেকে পেয়েছি' : 'কাকে দিয়েছি'}</span>}
            <Input className="mt-1.5" value={party} onChange={(event) => setParty(event.target.value)} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Account holder','হিসাবের মালিক')}
            <Input className="mt-1.5" value={accountHolder} onChange={(event) => setAccountHolder(event.target.value)} placeholder={text("Optional","ঐচ্ছিক")} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Amount','টাকা')}
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
              <Input className="pl-7 text-right" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ''))} placeholder="0" />
            </div>
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Cheque date','চেকের তারিখ')} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· চেকে লেখা তারিখ</span>}
            <Input className="mt-1.5" type="date" value={chequeDate} onChange={(event) => setChequeDate(event.target.value)} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {direction === 'Received' ? text('Received date','পাওয়ার তারিখ') : text('Issued date','দেওয়ার তারিখ')}
            <Input className="mt-1.5" type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Bank / Money Account','ব্যাংক / টাকার হিসাব')}
            {accountOptions.length ? <FormSelect className="mt-1.5" value={depositAccount || accountOptions[0]} onChange={(event) => setDepositAccount(event.target.value)} options={accountOptions} /> : <Input className="mt-1.5" value={depositAccount} onChange={(event) => setDepositAccount(event.target.value)} placeholder="e.g. Dutch-Bangla Bank · 4582" />}
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Reference','রেফারেন্স')}
            <Input className="mt-1.5" value={reference} onChange={(event) => setReference(event.target.value)} placeholder={text("Invoice / bill / note","বিল / রেফারেন্স / মন্তব্য")} />
          </label>
          <label className="text-[13px] font-medium text-ink">
            {text('Note','মন্তব্য')}
            <Input className="mt-1.5" value={note} onChange={(event) => setNote(event.target.value)} placeholder={text("Optional","ঐচ্ছিক")} />
          </label>
          <label className="text-[13px] font-medium text-ink sm:col-span-2">
            {text('Attachment','ফাইল')} {showHelper&&<span className="font-bn text-[11px] font-normal text-ink-400">· চেকের ছবি বা PDF</span>}
            <Input className="mt-1.5" type="file" accept="image/*,.pdf" onChange={(event) => setAttachment(event.target.files?.[0]?.name ?? '')} />
            {attachment && <span className="mt-1 block text-[10.5px] text-ink-400">{attachment}</span>}
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{text('Cancel','বাতিল')}</Button>
          <Button onClick={save}>{text('Save cheque','চেক সংরক্ষণ')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
