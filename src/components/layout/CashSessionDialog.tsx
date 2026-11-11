import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Lock, Unlock, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { useCashSession } from '../../contexts/CashSessionContext';
import { denominations } from '../../data/finance';
import { formatNumber, taka } from '../../utils/currency';
import {AppSelect} from '../AppSelect';
import {cashCounterparts,parseCashMinor} from '../../finance/cashSession';
import {getFinancePreviewSnapshot,subscribeFinancePreview} from '../../data/financePreviewStore';
import { useUiCopy } from '../../i18n/useUiCopy';

export function CashSessionDialog() {
  const { text, showHelper } = useUiCopy();
  const { open, setOpen, sessionOpen, startSession, saveCount, openingCash, expectedCash:expected, sampleMovements, lastCount, revision, businessDate, sessionDate, previousClosing, drawerBalance, canView, canStart, canClose, enabled, startBlocked } = useCashSession();
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [countMode,setCountMode]=useState<'total'|'notes'>('total');
  const [total,setTotal]=useState('');
  const [note, setNote] = useState('');
  const [float, setFloat] = useState('');
  const [counterpart,setCounterpart]=useState('');
  const [failure,setFailure]=useState('');
  const [reviewedRevision,setReviewedRevision]=useState(revision);
  const [operationId,setOperationId]=useState(()=>crypto.randomUUID());
  const {accounts}=useSyncExternalStore(subscribeFinancePreview,getFinancePreviewSnapshot);
  const openingMinor=parseCashMinor(float);
  const difference=openingMinor===null?0:openingMinor/100-drawerBalance;
  const choices=cashCounterparts(accounts.map(a=>({id:a.id,name:a.name,active:a.status==='Active',drawer:a.id==='acc-cash'})));
  useEffect(()=>{if(open){setFloat('');setCounterpart('');setNote('');setTotal('');setCounts({});setFailure('');setReviewedRevision(revision);setOperationId(crypto.randomUUID());}},[open]);
  const submit=(action:()=>void)=>{try{action();setOpen(false);return true;}catch(error){setFailure(error instanceof Error?error.message:String(error));setReviewedRevision(revision);setOperationId(crypto.randomUUID());return false;}};

  const notesTotal = useMemo(
    () => denominations.reduce((sum, d) => sum + d * (parseInt(counts[d] || '0', 10) || 0), 0),
    [counts]
  );
  const counted=countMode==='notes'?notesTotal:(parseCashMinor(total)??NaN)/100;
  const diff = counted - expected;
  const hasCount=(countMode==='total'?total.trim()!=='':Object.values(counts).some(value=>value!==''))&&Number.isFinite(counted)&&Number.isSafeInteger(Math.round(counted*100))&&counted>=0;
  const summary=[{label:text('Opening cash','শুরুর ক্যাশ'),value:openingCash},...(sampleMovements?[
    {label:text('Cash sales','ক্যাশ বিক্রি'),value:38610},
    {label:text('Customer payments','ক্রেতার টাকা'),value:7820},
    {label:text('Cash expenses','ক্যাশ খরচ'),value:-3180}
  ]:[])];

  const close = () => {
    if(!hasCount||(diff!==0&&!note.trim()))return;
    if(!submit(()=>saveCount(counted,note,true,reviewedRevision,operationId)))return;
    toast.success(text('Cash session closed in preview','নমুনা ক্যাশ সেশন বন্ধ হয়েছে'), {
      description: `${text('Counted','গুনে পাওয়া')} ${taka(counted)} · ${diff === 0 ? text('Balanced','মিলেছে') : diff > 0 ? `${text('Extra','বেশি')} ${taka(diff)}` : `${text('Short','কম')} ${taka(-diff)}`}`
    });
  };

  if(!canView)return <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{text('Cash session unavailable','ক্যাশ সেশন ব্যবহার করা যাবে না')}</DialogTitle><DialogDescription>{text('Enable cash sessions and request cash view permission.','ক্যাশ সেশন চালু করুন এবং দেখার অনুমতি নিন।')}</DialogDescription></DialogHeader><Button onClick={()=>setOpen(false)}>{text('Close','বন্ধ করুন')}</Button></DialogContent></Dialog>;
  if (!sessionOpen) {
    return <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader><DialogTitle>{text('Start cash session','ক্যাশ সেশন শুরু করুন')}</DialogTitle>
          <DialogDescription>{text('UI preview only · resets on reload. No backend posting.','শুধু নমুনা · রিলোড করলে মুছে যাবে। সার্ভারে লেনদেন জমা হবে না।')}</DialogDescription></DialogHeader>
        <p className="text-xs text-ink-500">{text('Business date','ব্যবসার তারিখ')}: {businessDate}</p>
        <p className="rounded-lg bg-ink-50 p-3 text-sm">{previousClosing===null?text('No previous cash session. Initial drawer balance is ৳0.','আগের ক্যাশ সেশন নেই। ড্রয়ারের প্রাথমিক জের ৳০।'):text('Previous actual counted close: ','আগের গুনে পাওয়া শেষ জের: ')+taka(previousClosing)}</p>
        {(!enabled||!canView||!canStart||startBlocked)&&<p role="status" className="text-sm text-warning">{!enabled?text('Cash sessions are disabled in Settings.','সেটিংসে ক্যাশ সেশন বন্ধ রয়েছে।'):startBlocked?text('This business date is closed. Reopening is unavailable in preview.','এই ব্যবসার দিন বন্ধ হয়েছে। নমুনায় আবার খোলা যাবে না।'):text('You do not have permission to start a cash session.','ক্যাশ সেশন শুরুর অনুমতি নেই।')}</p>}
        <label className="block text-sm font-medium text-ink">{text('Opening cash','শুরুর টাকা')}
          <Input aria-label={text('Opening cash','শুরুর টাকা')} autoFocus inputMode="decimal" value={float} onChange={e=>setFloat(e.target.value)} className="mt-1.5 text-right" aria-invalid={float!==''&&openingMinor===null} aria-describedby="cash-opening-help" />
        </label>
        <p id="cash-opening-help" className="text-xs text-ink-500">{text('Count the drawer. Zero is valid; use at most two decimal places.','ড্রয়ারের টাকা গুনুন। শূন্য দেওয়া যাবে; দশমিকের পরে সর্বোচ্চ দুই ঘর।')}</p>
        {float!==''&&openingMinor===null&&<p role="alert" className="text-xs text-danger">{text('Enter a valid amount with at most two decimal places.','সর্বোচ্চ দুই দশমিক ঘরে সঠিক টাকার অঙ্ক দিন।')}</p>}
        {difference!==0&&<div className="space-y-3">
          <p className="text-sm font-medium">{taka(Math.abs(difference))} · {difference>0?text('More than drawer balance','ড্রয়ারের জেরের চেয়ে বেশি'):text('Less than drawer balance','ড্রয়ারের জেরের চেয়ে কম')}</p>
          <AppSelect label={difference>0?text('Where did this cash come from?','এই টাকা কোথা থেকে এসেছে?'):text('Where did this cash go?','এই টাকা কোথায় গেছে?')} value={counterpart} onChange={setCounterpart} placeholder={text('Choose source or destination','উৎস বা গন্তব্য বাছাই করুন')} options={choices.map(a=>({value:a.id,label:a.id==='OWNER_CURRENT_ACCOUNT'?(difference>0?text('Owner put in','মালিক দিয়েছেন'):text('Owner took out','মালিক নিয়েছেন')):(difference>0?text('From ','থেকে '):text('To ','প্রতি '))+a.name}))}/>
          <label className="block text-sm font-medium">{text('Note (optional)','মন্তব্য (ঐচ্ছিক)')}<Input className="mt-1.5" value={note} maxLength={500} onChange={e=>setNote(e.target.value)}/></label>
        </div>}
        {failure&&<p role="alert" className="text-sm text-danger">{text('Could not save. Review your input and try again.','সংরক্ষণ হয়নি। তথ্য যাচাই করে আবার চেষ্টা করুন।')} <span>{failure}</span></p>}
        <DialogFooter><Button variant="outline" onClick={()=>setOpen(false)}>{text('Cancel','বাতিল')}</Button>
          <Button disabled={!canStart||startBlocked||openingMinor===null||(difference!==0&&!counterpart)} onClick={()=>{if(submit(()=>startSession(float,counterpart,note,reviewedRevision,operationId)))toast.success(text('Cash session started in preview','নমুনায় ক্যাশ সেশন শুরু হয়েছে'));}}><Unlock className="size-4"/>{text('Start session','সেশন শুরু করুন')}</Button></DialogFooter>
      </DialogContent></Dialog>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent role="dialog" aria-modal="true" className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <Wallet className="size-4 text-teal-600" /> {text('Cash reconciliation','ক্যাশ মিলানো')}
            {showHelper && <span className="font-bn text-sm font-normal text-ink-500">ক্যাশ মিলানো</span>}
          </DialogTitle>
          <DialogDescription>{text('UI preview only · counts stay until reload; sales and payments are not connected.','শুধু নমুনা · রিলোড করলে গণনার তথ্য মুছে যাবে; বিক্রি ও পেমেন্টের সাথে যুক্ত নয়।')}</DialogDescription>
        </DialogHeader>

        {sessionDate!==businessDate&&<p role="status" className="text-sm text-warning">{text('Earlier cash session is still open. Count and close it before starting a new day.','আগের দিনের ক্যাশ সেশন চালু। নতুন দিন শুরুর আগে গুনে বন্ধ করুন।')} {sessionDate}</p>}
        {!canClose&&<p role="status">{text('Cash count / close permission is required.','ক্যাশ গোনা / বন্ধ করার অনুমতি প্রয়োজন।')}</p>}
        {failure&&<p role="alert" className="text-sm text-danger">{failure}</p>}
        <div className="flex flex-wrap gap-2" role="group" aria-label={text('How to count cash','ক্যাশ গোনার পদ্ধতি')} >
          <Button variant={countMode==='total'?'default':'outline'} aria-pressed={countMode==='total'} onClick={()=>setCountMode('total')}>{text('Enter total','মোট টাকা লিখুন')}{showHelper && <span className="font-bn"> · মোট টাকা</span>}</Button>
          <Button variant={countMode==='notes'?'default':'outline'} aria-pressed={countMode==='notes'} onClick={()=>setCountMode('notes')}>{text('Count notes','নোট গুনুন')}{showHelper && <span className="font-bn"> · নোট গুনুন</span>}</Button>
        </div>
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            {countMode==='total'?<label className="block text-sm font-medium text-ink">{text('Cash counted','হাতে গোনা টাকা')}{showHelper && <span className="font-bn font-normal text-ink-500"> · হাতে গোনা টাকা</span>}
             <Input aria-label={text("Cash counted","হাতে গোনা টাকা")} className="mt-2 h-9 text-right text-lg" inputMode="decimal" value={total} onChange={event=>setTotal(event.target.value)} placeholder="৳0.00"/>
             <span className="mt-2 block text-xs font-normal text-ink-500">{text('Count the cash in your drawer, then enter the total.','ড্রয়ারের টাকা গুনে মোট অঙ্কটি লিখুন।')}</span>
            </label>:<><p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-400">{text('Count drawer','ড্রয়ারের ক্যাশ গুনুন')}</p>
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {denominations.map((d) => {
                const n = parseInt(counts[d] || '0', 10) || 0;
                return (
                  <div key={d} className="flex items-center gap-2 text-sm">
                    <span className="w-12 text-right font-medium text-ink">৳{d}</span>
                    <span className="text-ink-400">×</span>
                    <Input
                      aria-label={`${text("Number of notes","নোটের সংখ্যা")} ৳${d}`}
                      value={counts[d] ?? ''}
                      onChange={(e) => setCounts({ ...counts, [d]: e.target.value.replace(/\D/g, '') })}
                      className="h-9 w-20 text-right"
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
              <span>{text('Expected','থাকার কথা')}{showHelper && ' · থাকার কথা'}</span>
              <span >{taka(expected)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>{text('Counted','গোনা টাকা')}{showHelper && ' · গোনা টাকা'}</span>
              <span>{hasCount ? taka(counted) : '—'}</span>
            </div>
            <div
              className={`flex justify-between rounded-md px-2 py-1.5 font-semibold ${
              !hasCount ? 'bg-ink-50 text-ink-500' : diff === 0 ? 'bg-success-bg text-success' : diff > 0 ? 'bg-info-bg text-info' : 'bg-danger-bg text-danger'}`
              }>
              
              <span>{!hasCount ? text('Enter count','টাকা গুনে লিখুন') : diff === 0 ? text('Balanced','মিলেছে') : diff > 0 ? text('Extra','বেশি') : text('Short','কম')}</span>
              <span>{hasCount ? taka(Math.abs(diff)) : '—'}</span>
            </div>
          </div>
        </div>

        <label className="block text-sm font-medium text-ink">
          {text('Note','মন্তব্য')} <span className="font-normal text-ink-400">{hasCount && diff!==0 ? text('(required to close with a difference)','(পার্থক্য থাকলে বন্ধ করতে কারণ লিখুন)') : text('(optional)','(ঐচ্ছিক)')}</span>
          <Input value={note} onChange={(e) => setNote(e.target.value)} className="mt-1.5" placeholder={text("e.g. ৳50 given as change from personal cash","যেমন: নিজের টাকা থেকে ৳৫০ খুচরা দিয়েছি")} />
        </label>

        {lastCount&&<p role="status" className="text-xs text-ink-500">{text('Last saved count:','শেষ গণনা:')} {taka(lastCount.counted)} · {lastCount.note||text('No note','মন্তব্য নেই')}</p>}
        <DialogFooter>
          <Button disabled={!canClose||!hasCount}
            variant="outline"
            onClick={() => {
              if(!submit(()=>saveCount(counted,note,false,reviewedRevision,operationId)))return;
              toast.success(text('Count saved in preview','নমুনা গণনা সংরক্ষিত'), { description: `${text('Counted','গুনে পাওয়া')} ${taka(counted)}` });
            }}>
            
            {text('Save count','গণনা সংরক্ষণ করুন')}
          </Button>
          <Button disabled={!canClose||!hasCount||(diff!==0&&!note.trim())} onClick={close}>
            <Lock className="size-4" /> {text('Close session','সেশন বন্ধ করুন')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}