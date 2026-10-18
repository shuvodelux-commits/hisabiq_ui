import {CalendarDays,ChevronDown,Info} from 'lucide-react';
import {Button} from '../Button';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from '../Table';
import {taka} from '../../utils/currency';
import {businessToday,formatDay} from '../../utils/dateRange';
import {useUiCopy} from '../../i18n/useUiCopy';
import {projectInstallmentBalance,type InstallmentPaymentPreviewEvent} from '../../installments/collections';
import type {PreviewInstallmentAgreement} from '../../data/installmentPreviewStore';

/** Source-derived read-only preview; receipt allocations never write to real ledger. */
export function InstallmentAgreementPreview({agreement,receipts=[],onReceive}:{
 agreement:PreviewInstallmentAgreement;receipts?:readonly InstallmentPaymentPreviewEvent[];
 onReceive?:()=>void;
}){
 const {text}=useUiCopy();
 const summary=projectInstallmentBalance(agreement,receipts,businessToday());
 return <div className="mt-3 space-y-2">
   <details className="overflow-hidden rounded-xl border border-border bg-card">
     <summary className="flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2.5 text-sm font-medium text-ink">
       <CalendarDays className="size-4 text-teal-700"/>
       <span className="flex-1">{text('Installment schedule','কিস্তির তালিকা')} · {agreement.schedule.length} {text('payments','কিস্তি')}</span>
       <ChevronDown className="size-4 text-ink-500"/>
     </summary>
     <div className="space-y-3 p-3">
       <div className="grid grid-cols-2 gap-3 text-sm">
         <div><p className="text-xs text-ink-500">{text('Agreed price','বিক্রির মোট')}</p>
           <p className="font-semibold text-ink">{taka(agreement.totalPaisa/100)}</p></div>
         <div><p className="text-xs text-ink-500">{text('Down payment','প্রথম জমা')}</p>
           <p className="font-semibold text-ink">{taka(agreement.downPaymentPaisa/100)}</p></div>
       </div>
       <div className="grid grid-cols-2 gap-2 rounded-lg bg-ink-50 p-2.5 text-sm">
         <div><span className="text-xs text-ink-500">{text('Remaining to collect','কিস্তিতে বাকি')}</span>
           <strong className="block text-danger">{taka(summary.totalOutstandingPaisa/100)}</strong></div>
         <div><span className="text-xs text-ink-500">{text('Overdue','সময় পার হয়েছে')}</span>
           <strong className="block text-danger">{taka(summary.overduePaisa/100)}</strong></div>
       </div>
       <div className="overflow-x-auto rounded-lg border border-border">
         <Table scrollRegionLabel={text('Installment payment dates','কিস্তির তারিখ')}>
           <TableHeader><TableRow>
             <TableHead>#</TableHead><TableHead>{text('Due date','তারিখ')}</TableHead>
             <TableHead className="text-right">{text('Paid','জমা')}</TableHead>
             <TableHead className="text-right">{text('Remaining','বাকি')}</TableHead>
             <TableHead>{text('Status','অবস্থা')}</TableHead>
           </TableRow></TableHeader>
           <TableBody>{summary.rows.map((row,index)=><TableRow key={row.id}>
             <TableCell>{index+1}</TableCell>
             <TableCell>{formatDay(row.dueDate)}</TableCell>
             <TableCell className="text-right">{taka(row.paidPaisa/100)}</TableCell>
             <TableCell className="text-right font-medium">{taka(row.outstandingPaisa/100)}</TableCell>
             <TableCell><span className={row.status==='Paid'?'text-success':row.status==='Overdue'?'text-danger':'text-ink-500'}>{row.status}</span></TableCell>
           </TableRow>)}</TableBody>
         </Table>
       </div>
       <div className="space-y-1.5 border-t border-border pt-2">
         <p className="text-xs font-semibold text-ink">{text('Receipt history','জমার ইতিহাস')} · {receipts.length}</p>
         {receipts.length===0&&<p className="text-xs text-ink-500">{text('No installment collection yet.','এখনও কিস্তির টাকা জমা হয়নি।')}</p>}
         {receipts.map((receipt,index)=><div key={receipt.id} className="flex flex-wrap items-center justify-between gap-2 text-xs">
           <span className="text-ink-700">{text('Receipt','রসিদ')} #{index+1} · {formatDay(receipt.date)}</span>
           <span className="font-medium text-ink">{taka(receipt.amountPaisa/100)}</span>
         </div>)}
       </div>
       <p className="flex items-start gap-1.5 text-xs text-ink-500"><Info className="mt-0.5 size-3.5 shrink-0"/>
         {text('Preview only; receipts are not posted to real cash, bank, stock or customer ledger.','শুধু প্রিভিউ; আসল ক্যাশ, ব্যাংক, স্টক বা ক্রেতার খাতায় জমা হয়নি।')}
       </p>
     </div>
   </details>
   {onReceive&&summary.totalOutstandingPaisa>0&&
     <Button size="sm" onClick={onReceive} className="w-full">
       {text('Receive payment','কিস্তির টাকা নিন')}
     </Button>}
 </div>;
}
