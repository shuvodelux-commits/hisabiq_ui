import {AlertTriangle,CheckCircle2} from 'lucide-react';
import {Button} from './Button';
import {Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle} from './Dialog';
import {taka} from '../utils/currency';
import {amountInWords} from '../utils/amountInWords';

export function TransactionReviewDialog({open,onClose,onConfirm,title,amount,details,confirmLabel='Confirm transaction',note}:{
 open:boolean;onClose:()=>void;onConfirm:()=>void;title:string;amount:number;
 details:ReadonlyArray<{label:string;value:string}>;confirmLabel?:string;note?:string;
}){
 return <Dialog open={open} onOpenChange={next=>{if(!next)onClose();}}>
  <DialogContent role="dialog" aria-label={title} className="max-h-[92vh] overflow-y-auto sm:max-w-md">
   <DialogHeader><DialogTitle>{title}</DialogTitle>
    <DialogDescription>Verify the details below. Choose Edit to correct a mistake before confirming.</DialogDescription></DialogHeader>
   <div className="space-y-3">
    <div className="rounded-xl border border-border bg-ink-50 p-4">
     <p className="text-xs text-ink-500">Transaction amount</p>
     <p className="mt-1 text-2xl font-semibold text-ink">{taka(amount)}</p>
     <p className="mt-1 text-xs leading-5 text-ink-600">{amountInWords(amount)}</p>
    </div>
    <dl className="divide-y divide-border rounded-xl border border-border px-3">
     {details.map(item=><div className="flex justify-between gap-4 py-2 text-sm" key={item.label}>
      <dt className="text-ink-500">{item.label}</dt><dd className="text-right font-medium text-ink">{item.value}</dd>
     </div>)}
    </dl>
    <p className="flex items-start gap-2 text-xs text-ink-500"><AlertTriangle className="size-4 shrink-0 text-warning"/>
     {note??'This is a preview. No real backend accounting or banking transaction is posted.'}</p>
    <DialogFooter>
     <Button variant="outline" onClick={onClose}>Edit details</Button>
     <Button onClick={onConfirm}><CheckCircle2 className="size-4"/>{confirmLabel}</Button>
    </DialogFooter>
   </div>
  </DialogContent>
 </Dialog>;
}
