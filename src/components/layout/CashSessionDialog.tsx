import React, { useMemo, useState } from 'react';
import { Lock, Unlock, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { useCashSession } from '../../contexts/CashSessionContext';
import { denominations } from '../../data/finance';
import { formatNumber, taka } from '../../utils/currency';

const expected = 48250;
const summary = [
{ label: 'Opening float', value: 5000 },
{ label: 'Cash sales', value: 38610 },
{ label: 'Receipts from parties', value: 7820 },
{ label: 'Cash expenses', value: -3180 }];


export function CashSessionDialog() {
  const { open, setOpen, sessionOpen, setSessionOpen } = useCashSession();
  const [counts, setCounts] = useState<Record<number, string>>({ 1000: '38', 500: '15', 200: '6', 100: '12', 50: '4', 20: '5', 10: '3' });
  const [note, setNote] = useState('');
  const [float, setFloat] = useState('5000');

  const counted = useMemo(
    () => denominations.reduce((sum, d) => sum + d * (parseInt(counts[d] || '0', 10) || 0), 0),
    [counts]
  );
  const diff = counted - expected;

  const close = () => {
    setSessionOpen(false);
    setOpen(false);
    toast.success('Cash session closed', { description: `Counted ${taka(counted)} · ${diff === 0 ? 'Balanced' : diff > 0 ? `Over ${taka(diff)}` : `Short ${taka(-diff)}`}` });
  };

  if (!sessionOpen) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Open cash session</DialogTitle>
            <DialogDescription>
              Count the drawer before the first sale. <span className="font-bn">ক্যাশ গুনে সেশন শুরু করুন।</span>
            </DialogDescription>
          </DialogHeader>
          <label className="block text-sm font-medium text-ink">
            Opening float
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">৳</span>
              <Input value={float} onChange={(e) => setFloat(e.target.value.replace(/\D/g, ''))} className="pl-7 text-right" inputMode="numeric" />
            </div>
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                setSessionOpen(true);
                setOpen(false);
                toast.success('Cash session opened', { description: `Float ${taka(parseInt(float || '0', 10))}` });
              }}>
              
              <Unlock className="size-4" /> Open session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>);

  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="size-4 text-teal-600" /> Cash reconciliation
            <span className="font-bn text-sm font-normal text-ink-500">ক্যাশ মিলানো</span>
          </DialogTitle>
          <DialogDescription>Session CS-0274 · opened 9:02 AM by Anis · Counter 1</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-[1fr_220px]">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-400">Count drawer</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {denominations.map((d) => {
                const n = parseInt(counts[d] || '0', 10) || 0;
                return (
                  <div key={d} className="flex items-center gap-2 text-sm">
                    <span className="w-12 text-right font-medium text-ink">৳{d}</span>
                    <span className="text-ink-400">×</span>
                    <Input
                      aria-label={`Count of ৳${d} notes`}
                      value={counts[d] ?? ''}
                      onChange={(e) => setCounts({ ...counts, [d]: e.target.value.replace(/\D/g, '') })}
                      className="h-8 w-16 text-right"
                      inputMode="numeric"
                      placeholder="0" />
                    
                    <span className="flex-1 text-right tabular-nums text-ink-600">{formatNumber(d * n)}</span>
                  </div>);

              })}
            </div>
          </div>

          <div className="space-y-3 rounded-lg bg-ink-50 p-3 text-sm">
            {summary.map((s) =>
            <div key={s.label} className="flex justify-between gap-2">
                <span className="text-ink-500">{s.label}</span>
                <span className="tabular-nums text-ink">{taka(s.value)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink-200 pt-2 font-medium">
              <span>Expected</span>
              <span className="tabular-nums">{taka(expected)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Counted</span>
              <span className="tabular-nums">{taka(counted)}</span>
            </div>
            <div
              className={`flex justify-between rounded-md px-2 py-1.5 font-semibold ${
              diff === 0 ? 'bg-success-bg text-success' : diff > 0 ? 'bg-info-bg text-info' : 'bg-danger-bg text-danger'}`
              }>
              
              <span>{diff === 0 ? 'Balanced' : diff > 0 ? 'Over' : 'Short'}</span>
              <span className="tabular-nums">{taka(Math.abs(diff))}</span>
            </div>
          </div>
        </div>

        <label className="block text-sm font-medium text-ink">
          Note <span className="font-normal text-ink-400">(optional)</span>
          <Input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1.5" placeholder="e.g. ৳50 given as change from personal cash" />
        </label>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              toast.success('Count saved', { description: `Counted ${taka(counted)}` });
            }}>
            
            Save count
          </Button>
          <Button onClick={close}>
            <Lock className="size-4" /> Close session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}