import {posPresentationError} from './presentationCopy';
import React, { useEffect, useMemo, useId, useState, useSyncExternalStore } from 'react';
import { AlertTriangle, PackageCheck, TrendingDown, Truck } from 'lucide-react';
import { Button } from '../Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { AppSelect } from '../AppSelect';
import { Input } from '../Input';
import { getPartyPreviewSnapshot, subscribePartyPreview, dispatchPartyPreview } from '../../data/partyPreviewStore';
import {useUiCopy} from '../../i18n/useUiCopy';
import type { CartLine } from '../../hooks/usePosCart';
import type { SaleStockSource } from '../../types/erp';
import { taka } from '../../utils/currency';
import { formatStock } from '../../utils/units';

type Choice = 'Own' | 'Negative' | 'Vendor';

type StockShortageDialogProps = {
  line: CartLine | null;
  availableBaseQty: number;
  shortageBaseQty: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseOwnStock: () => void;
  /** Bundle parent quantity is clamped in whole Sets, never its internal component count. */
  ownActionHint?:string;
  componentContext?:string;
  onResolve: (source: SaleStockSource) => void;
};

export function StockShortageDialog({ line, availableBaseQty, shortageBaseQty, open, onOpenChange, onUseOwnStock, ownActionHint, componentContext, onResolve }: StockShortageDialogProps) {
  const {text}=useUiCopy();
  const costId=useId();
  const [choice, setChoice] = useState<Choice>('Own');
  const partiesState=useSyncExternalStore(subscribePartyPreview,getPartyPreviewSnapshot);
  const vendors=partiesState.parties.filter(p=>p.roles.includes('Vendor')&&p.status!=='Inactive');
  const [vendorId, setVendorId] = useState('');
  const [newVendorOpen,setNewVendorOpen]=useState(false);
  const [newVendorName,setNewVendorName]=useState('');
  const [newVendorPhone,setNewVendorPhone]=useState('');
  const [newVendorArea,setNewVendorArea]=useState('');
  const [newVendorError,setNewVendorError]=useState('');
  const [vendorCost, setVendorCost] = useState('');

  const factor = line?.product.altUnit && line.unit === line.product.altUnit.unit ? line.product.altUnit.factor : 1;
  const displayUnit = line?.unit ?? '';
  const vendor = vendors.find((item) => item.id === vendorId) ?? null;

  // Bundle componentLine is recreated as an object on parent renders. Never reset
  // the selected Vendor radio when quick-add updates Party preview subscribers.
  const sourceMode=line?.stockSource?.mode;
  const sourceVendorId=line?.stockSource?.mode==='Vendor'?line.stockSource.vendorId:'';
  const sourceUnitCost=line?.stockSource?.mode==='Vendor'?line.stockSource.unitCost:null;
  useEffect(() => {
    if (!open || !line) return;
    setChoice(sourceMode === 'Vendor' ? 'Vendor' : sourceMode === 'Negative' ? 'Negative' : 'Own');
    setVendorId(sourceVendorId);
    setVendorCost(sourceUnitCost!==null && sourceUnitCost!==undefined ? String(sourceUnitCost*factor) : '');
  }, [factor, line?.key, line?.product.id, open, sourceMode, sourceVendorId, sourceUnitCost]);

  const ownStockLabel = useMemo(() => line ? formatStock({ ...line.product, stock: availableBaseQty }) : '', [availableBaseQty, line]);
  if (!line) return null;

  const requestedBaseQty = availableBaseQty + shortageBaseQty;
  const requestedLabel = formatStock({ ...line.product, stock: requestedBaseQty });
  const shortageLabel = formatStock({ ...line.product, stock: shortageBaseQty });
  const pricePending=!vendorCost.trim();
  const costNumber=pricePending?null:Number(vendorCost);
  const validCost=pricePending || (costNumber!==null&&Number.isFinite(costNumber)&&costNumber>0);
  const createVendor=()=>{
    try{
      const known=new Set(partiesState.parties.map(p=>p.id));
      const next=dispatchPartyPreview({type:'create-party',party:{name:newVendorName.trim(),phone:newVendorPhone.trim(),area:newVendorArea.trim(),roles:['Vendor']}});
      const created=next.parties.find(p=>!known.has(p.id));
      if(!created)throw new Error('Could not create Vendor.');
      setVendorId(created.id);setNewVendorOpen(false);setNewVendorName('');setNewVendorPhone('');setNewVendorArea('');setNewVendorError('');
    }catch(e){setNewVendorError(e instanceof Error?e.message:'Cannot add Vendor');}
  };

  const methods:Choice[]=['Own','Negative','Vendor'];
  const onChoiceKey=(event:React.KeyboardEvent<HTMLButtonElement>,current:Choice)=>{
    if(!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
    event.preventDefault();
    const i=methods.indexOf(current);
    const next=event.key==='Home'?0:event.key==='End'?methods.length-1:
      (i+(event.key==='ArrowDown'||event.key==='ArrowRight'?1:-1)+methods.length)%methods.length;
    setChoice(methods[next]);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus();
  };
  const save = () => {
    if (choice === 'Own') return onUseOwnStock();
    if (choice === 'Negative') return onResolve({ mode: 'Negative' });
    if (!vendor || !validCost) return;
    onResolve({ mode: 'Vendor', vendorId: vendor.id, vendorName: vendor.name,
      unitCost: costNumber===null?null:costNumber / factor });
  };

  return (
    <React.Fragment>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent role="dialog" aria-modal="true" aria-label={text('Stock shortage','স্টক কম')} closeLabel={text('Close','বন্ধ করুন')} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{text('Stock shortage','স্টক কম')}</DialogTitle>
          <DialogDescription>
            {componentContext&&<span className="block font-medium">{componentContext}</span>}
            {text(`${line.product.name}: requested ${requestedLabel}, own sellable stock ${ownStockLabel}. Choose how to handle ${shortageLabel} shortage.`,`${line.product.name}: প্রয়োজন ${requestedLabel}, নিজের বিক্রিযোগ্য স্টক ${ownStockLabel}। ${shortageLabel} ঘাটতির ব্যবস্থা বাছুন।`)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2" role="radiogroup" aria-label={text('Stock shortage method','স্টক ঘাটতির ব্যবস্থা')}>
          <button type="button" role="radio" aria-checked={choice==='Own'} tabIndex={choice==='Own'?0:-1} onKeyDown={e=>onChoiceKey(e,'Own')} onClick={() => setChoice('Own')} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${choice === 'Own' ? 'border-teal-400 bg-teal-50/60' : 'border-border hover:bg-ink-50'}`}>
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-teal-700 ring-1 ring-border"><PackageCheck className="size-4" /></span>
            <span>
              <span className="block text-sm font-medium text-ink">{text('Own Stock','নিজের স্টক')}</span>
              <span className="block text-xs text-ink-500">{ownActionHint ?? (availableBaseQty > 0 ? text(`Reduce this line to ${ownStockLabel}.`,`এই লাইনের পরিমাণ ${ownStockLabel} করুন।`) : text('No own stock is available; this removes the line.','নিজের স্টক নেই; এতে লাইনটি সরবে।'))}</span>
            </span>
          </button>

          <button type="button" role="radio" aria-checked={choice==='Negative'} tabIndex={choice==='Negative'?0:-1} onKeyDown={e=>onChoiceKey(e,'Negative')} onClick={() => setChoice('Negative')} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${choice === 'Negative' ? 'border-warning bg-warning-bg/70' : 'border-border hover:bg-ink-50'}`}>
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-warning ring-1 ring-border"><TrendingDown className="size-4" /></span>
            <span>
              <span className="block text-sm font-medium text-ink">{text('Negative Sale','নেগেটিভ বিক্রি')}</span>
              <span className="block text-xs text-ink-500">{text('Complete the sale now; the shortage remains negative until future stock is received.','এখন বিক্রি করুন; নতুন স্টক আসা পর্যন্ত ঘাটতি নেগেটিভ থাকবে।')}</span>
            </span>
          </button>

          <button type="button" role="radio" aria-checked={choice==='Vendor'} tabIndex={choice==='Vendor'?0:-1} onKeyDown={e=>onChoiceKey(e,'Vendor')} onClick={() => setChoice('Vendor')} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${choice === 'Vendor' ? 'border-teal-400 bg-teal-50/60' : 'border-border hover:bg-ink-50'}`}>
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-teal-700 ring-1 ring-border"><Truck className="size-4" /></span>
            <span>
              <span className="block text-sm font-medium text-ink">{text('Vendor','ভেন্ডর থেকে')}</span>
              <span className="block text-xs text-ink-500">{text('Source only the shortage from a nearby Vendor. You can agree the cost later · দাম পরে।','শুধু ঘাটতি কাছের ভেন্ডর থেকে নিন। দাম পরে ঠিক করা যাবে।')}</span>
            </span>
          </button>
        </div>

        {choice === 'Vendor' && (
          <div className="space-y-3 rounded-xl border border-border bg-ink-50/30 p-3">
            <div className="block">
              <span className="mb-1 block text-xs font-medium text-ink-600">{text('Vendor · কাছের দোকান','কাছের ভেন্ডর')}</span>
              <div className="flex gap-1">
                <AppSelect label={text('Vendor','ভেন্ডর')} value={vendorId} onChange={setVendorId}
                  options={vendors.map(item=>({value:item.id,label:item.name}))} placeholder={text('Choose Vendor','ভেন্ডর বাছুন')}/>
                <Button size="sm" variant="outline" aria-label={text('Quick add vendor','নতুন ভেন্ডর যোগ করুন')} onClick={()=>setNewVendorOpen(true)}>{text('+ New','+ নতুন')}</Button>
              </div>
            </div>
            <div>
              <label htmlFor={costId} className="mb-1 block text-xs font-medium text-ink-600">{text(`Vendor cost per ${displayUnit} (optional)`,`প্রতি ${displayUnit} ভেন্ডরের দাম (ঐচ্ছিক)`)}</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-400">৳</span>
                <Input id={costId} aria-invalid={!validCost} aria-describedby={!validCost?costId+'-error':pricePending?costId+'-hint':undefined} value={vendorCost} onChange={(event) => setVendorCost(event.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" placeholder={text('Leave blank — price pending','দাম পরে — ফাঁকা রাখুন')} className="pl-7 text-right" />
              </div>
              {pricePending?<p id={costId+'-hint'} className="mt-1 text-[11px] font-medium text-warning">{text('Price pending · দাম পরে নির্ধারণ — record quantity now, settle with Vendor later.','দাম পরে নির্ধারণ — এখন পরিমাণ রাখুন, ভেন্ডরের সাথে পরে হিসাব করুন।')}</p>
                :validCost&&costNumber!==null&&factor>1?<p className="mt-1 text-[11px] text-ink-500">{taka(costNumber)} / {displayUnit} = {taka(costNumber / factor)} / {line.product.unit}</p>:null}
              {!validCost&&<p id={costId+'-error'} role="alert" className="mt-1 text-xs text-danger">{text('Enter a positive cost or leave blank for pending price.','শূন্যের বেশি দাম দিন অথবা দাম পরে ঠিক করতে ফাঁকা রাখুন।')}</p>}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-ink-50 p-2.5 text-xs text-ink-500">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
          {componentContext ? text('This choice applies only to this package component. Changing the Set quantity will clear its selection.','এটি শুধু এই প্যাকেজের পণ্যের জন্য। Set এর পরিমাণ বদলালে এই বাছাই মুছবে।') : text('This choice applies only to this cart line. Changing quantity or unit asks you to review the shortage again.','এটি শুধু এই লাইনের জন্য। পরিমাণ বা একক বদলালে ঘাটতি আবার যাচাই করুন।')}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{text('Cancel','বাতিল')}</Button>
          <Button onClick={save} disabled={choice === 'Vendor' && (!vendor || !validCost)}>
            {choice === 'Own' ? text('Use own stock','নিজের স্টক নিন') : choice === 'Negative' ? text('Allow negative sale','নেগেটিভ বিক্রি করুন') : text('Use vendor','ভেন্ডর থেকে নিন')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
      <Dialog open={newVendorOpen} onOpenChange={v=>{setNewVendorOpen(v);if(!v)setNewVendorError('');}}>
        <DialogContent role="dialog" aria-label={text('Quick add Vendor','নতুন ভেন্ডর যোগ করুন')} closeLabel={text('Close','বন্ধ করুন')} className="sm:max-w-md">
          <DialogHeader><DialogTitle>{text('Add Vendor','নতুন ভেন্ডর')}</DialogTitle>
           <DialogDescription>{text('Create the nearby shop here. Your cart and payments stay unchanged.','এখানে কাছের দোকান যোগ করুন। কার্ট ও পেমেন্ট একই থাকবে।')}</DialogDescription></DialogHeader>
          <form onSubmit={e=>{e.preventDefault();createVendor();}} className="space-y-3">
            <label className="block text-xs font-medium text-ink">{text('Vendor name *','ভেন্ডরের নাম *')}
              <Input aria-label={text('New Vendor name','নতুন ভেন্ডরের নাম')} value={newVendorName} onChange={e=>setNewVendorName(e.target.value)} required/></label>
            <label className="block text-xs font-medium text-ink">{text('Phone','ফোন')}
              <Input aria-label={text('New Vendor phone','নতুন ভেন্ডরের ফোন')} value={newVendorPhone} onChange={e=>setNewVendorPhone(e.target.value)}/></label>
            <label className="block text-xs font-medium text-ink">{text('Area','এলাকা')}
              <Input aria-label={text('New Vendor area','নতুন ভেন্ডরের এলাকা')} value={newVendorArea} onChange={e=>setNewVendorArea(e.target.value)}/></label>
            {newVendorError&&<p role="alert" className="text-xs text-danger">{posPresentationError(newVendorError,text)}</p>}
            <DialogFooter><Button type="button" variant="outline" onClick={()=>setNewVendorOpen(false)}>{text('Cancel','বাতিল')}</Button>
              <Button type="submit">{text('Add & select Vendor','ভেন্ডর যোগ করে বাছুন')}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
