import React, { useMemo, useState } from 'react';
import { Lock, Unlock, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { useCashSession } from '../../contexts/CashSessionContext';
import { denominations } from '../../data/finance';
import { formatNumber, taka } from '../../utils/currency';

export function CashSessionDialog() {
  const { open, setOpen, sessionOpen, startSession, saveCount, openingCash, expectedCash:expected, sampleMovements, lastCount } = useCashSession();
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [countMode,setCountMode]=useState<'total'|'notes'>('total');
  const [total,setTotal]=useState('');
  const [note, setNote] = useState('');
  const [float, setFloat] = useState('5000');

  const notesTotal = useMemo(
    () => denominations.reduce((sum, d) => sum + d * (parseInt(counts[d] || '0', 10) || 0), 0),
    [counts]
  );
  const counted=countMode==='notes'?notesTotal:Number(total);
  const diff = counted - expected;
  const hasCount=(countMode==='total'?total.trim()!=='':Object.values(counts).some(value=>value!==''))&&Number.isFinite(counted)&&Number.isSafeInteger(Math.round(counted*100))&&counted>=0;
  const summary=[{label:'Opening cash',value:openingCash},...(sampleMovements?[{label:'Cash sales',value:38610},{label:'Customer payments',value:7820},{label:'Cash expenses',value:-3180}]:[])];

  const close = () => {
    if(!hasCount||(diff!==0&&!note.trim()))return;
    saveCount(counted,note,true);
    setOpen(false);
    toast.success('Cash session closed in preview', { description: `Counted ${taka(counted)} · ${diff === 0 ? 'Balanced' : diff > 0 ? `Over ${taka(diff)}` : `Short ${taka(-diff)}`}` });
  };

  if (!sessionOpen) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent role="dialog" aria-modal="true" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Open cash session</DialogTitle>
            <DialogDescription>
              Preview only; resets on reload. Count the drawer before the first sale. <span className="font-bn">ক্যাশ গুনে সেশন শুরু করুন।</span>
            </DialogDescription>
          </DialogHeader>
          <label className="block text-sm font-medium text-ink">
            Opening cash · শুরুর টাকা
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">৳</span>
              <Input value={float} onChange={(e) => setFloat(e.target.value.replace(/\D/g, ''))} className="pl-7 text-right" inputMode="numeric" />
            </div>
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!float.trim()||!Number.isSafeInteger(Number(float))}
              onClick={() => {
                startSession(Number(float));setCounts({});setTotal('');setNote('');
                setOpen(false);
                toast.success('Cash session opened in preview', { description: `Float ${taka(parseInt(float || '0', 10))}` });
              }}>
              
              <Unlock className="size-4" /> Open session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>);

  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent role="dialog" aria-modal="true" className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <Wallet className="size-4 text-teal-600" /> Cash reconciliation
            <span className="font-bn text-sm font-normal text-ink-500">ক্যাশ মিলানো</span>
          </DialogTitle>
          <DialogDescription>UI preview only · counts stay until reload; sales and payments are not connected.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2" role="group" aria-label="How to count cash">
          <Button variant={countMode==='total'?'default':'outline'} aria-pressed={countMode==='total'} onClick={()=>setCountMode('total')}>Enter total · মোট টাকা</Button>
          <Button variant={countMode==='notes'?'default':'outline'} aria-pressed={countMode==='notes'} onClick={()=>setCountMode('notes')}>Count notes · নোট গুনুন</Button>
        </div>
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            {countMode==='total'?<label className="block text-sm font-medium text-ink">Cash counted · হাতে গোনা টাকা
             <Input aria-label="Cash counted" className="mt-2 h-11 text-right text-lg" inputMode="decimal" value={total} onChange={event=>setTotal(event.target.value)} placeholder="৳0.00"/>
             <span className="mt-2 block text-xs font-normal text-ink-500">Count the cash in your drawer, then enter the total.</span>
            </label>:<><p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-400">Count drawer</p>
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
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
                      className="h-11 w-20 text-right sm:h-9"
                      inputMode="numeric"
                      placeholder="0" />
                    
                    <span className="flex-1 text-right text-ink-600">{formatNumber(d * n)}</span>
                  </div>);

              })}
            </div></>}
          </div>

          <div className="space-y-3 rounded-lg bg-ink-50 p-3 text-sm">
            {summary.map((s) =>
            <div key={s.label} className="flex justify-between gap-2">
                <span className="text-ink-500">{s.label}</span>
                <span className="tabular-nums text-ink">{taka(s.value)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink-200 pt-2 font-medium">
              <span>Expected · থাকার কথা</span>
              <span >{taka(expected)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Counted · গোনা টাকা</span>
              <span >{taka(counted)}</span>
            </div>
            <div
              className={`flex justify-between rounded-md px-2 py-1.5 font-semibold ${
              diff === 0 ? 'bg-success-bg text-success' : diff > 0 ? 'bg-info-bg text-info' : 'bg-danger-bg text-danger'}`
              }>
              
              <span>{!hasCount?'Enter count':diff === 0 ? 'Balanced · মিলেছে' : diff > 0 ? 'Extra · বেশি' : 'Short · কম'}</span>
              <span >{taka(Math.abs(diff))}</span>
            </div>
          </div>
        </div>

        <label className="block text-sm font-medium text-ink">
          Note <span className="font-normal text-ink-400">{diff!==0?'(required to close with a difference)':'(optional)'}</span>
          <Input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1.5" placeholder="e.g. ৳50 given as change from personal cash" />
        </label>

        {lastCount&&<p role="status" className="text-xs text-ink-500">Last saved count: {taka(lastCount.counted)} · {lastCount.note||'No note'}</p>}
        <DialogFooter>
          <Button disabled={!hasCount}
            variant="outline"
            onClick={() => {
              setOpen(false);
              saveCount(counted,note,false);
              toast.success('Count saved in preview', { description: `Counted ${taka(counted)}` });
            }}>
            
            Save count
          </Button>
          <Button disabled={!hasCount||(diff!==0&&!note.trim())} onClick={close}>
            <Lock className="size-4" /> Close session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}