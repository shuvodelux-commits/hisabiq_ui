import {CalendarDays,ChevronDown,Info} from 'lucide-react';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from '../Table';
import {taka} from '../../utils/currency';
import {formatDay} from '../../utils/dateRange';
import {useUiCopy} from '../../i18n/useUiCopy';
import type {PreviewInstallmentAgreement} from '../../data/installmentPreviewStore';

/** Read-only evidence shown after confirming a UI-only installment sale preview. */
export function InstallmentAgreementPreview({agreement}:{agreement:PreviewInstallmentAgreement}){
  const {text}=useUiCopy();
  return <details className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
    <summary className="flex cursor-pointer items-center gap-2 border-b border-border px-3 py-2.5 text-sm font-medium text-ink">
      <CalendarDays className="size-4 text-teal-700"/>
      <span className="flex-1">{text('Installment schedule','কিস্তির তালিকা')} · {agreement.schedule.length} {text('payments','কিস্তি')}</span>
      <ChevronDown className="size-4 text-ink-500"/>
    </summary>
    <div className="space-y-3 p-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-ink-500">{text('Agreed price','বিক্রির মোট')}</p><p className="font-semibold text-ink">{taka(agreement.totalPaisa/100)}</p></div>
        <div><p className="text-xs text-ink-500">{text('Down payment','আজ জমা')}</p><p className="font-semibold text-ink">{taka(agreement.downPaymentPaisa/100)}</p></div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-ink-50 p-2.5 text-sm">
        <span>{text('Remaining to collect','কিস্তিতে বাকি')}</span>
        <strong className="text-danger">{taka((agreement.totalPaisa-agreement.downPaymentPaisa)/100)}</strong>
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table scrollRegionLabel={text('Installment payment dates','কিস্তির তারিখ')}>
          <TableHeader><TableRow>
            <TableHead>#</TableHead><TableHead>{text('Due date','তারিখ')}</TableHead><TableHead className="text-right">{text('Amount','টাকা')}</TableHead>
          </TableRow></TableHeader>
          <TableBody>{agreement.schedule.map((item,index)=><TableRow key={item.id}>
            <TableCell>{index+1}</TableCell><TableCell>{formatDay(item.dueDate)}</TableCell>
            <TableCell className="text-right font-medium">{taka(item.amountPaisa/100)}</TableCell>
          </TableRow>)}</TableBody>
        </Table>
      </div>
      <p className="flex items-start gap-1.5 text-xs text-ink-500"><Info className="mt-0.5 size-3.5 shrink-0"/>
        {text('Preview only; not posted to real cash, stock or customer ledger.','শুধু প্রিভিউ; আসল ক্যাশ, স্টক বা ক্রেতার খাতায় জমা হয়নি।')}
      </p>
    </div>
  </details>;
}
