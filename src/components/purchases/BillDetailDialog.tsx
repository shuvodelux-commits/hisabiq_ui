import { Link } from 'react-router-dom';
import { ExternalLink, FileImage, HandCoins } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { StatusBadge } from '../StatusBadge';
import type { PaymentSplit } from '../../types/erp';
import { taka } from '../../utils/currency';
import { PhotoUploader } from '../products/PhotoUploader';
import { printReport } from '../../utils/reportOutput';

export type BillDetail = {
  ref: string;
  date: string;
  party: string;
  partyId?: string;
  description: string;
  category?: string;
  total: number;
  paid: number;
  payments?: PaymentSplit[];
  receipt?: string;
  cancelled?: boolean;
};

export function BillDetailDialog({ bill, onClose, onPay, onEdit, onReceiptChange, history = [] }: {bill: BillDetail | null;onClose: () => void;onPay?: () => void;onEdit?: () => void;onReceiptChange?: (receipt?: string) => void;history?: string[];}) {
  const due = bill ? bill.total - bill.paid : 0;
  return (
    <Dialog open={!!bill} onOpenChange={(o) => !o && onClose()}>
      <DialogContent role="dialog" aria-label="Bill details" className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        {bill &&
        <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {bill.ref}
                {bill.cancelled ? <StatusBadge tone="neutral">Cancelled</StatusBadge> : due === 0 ? <StatusBadge tone="success" dot>Paid</StatusBadge> : bill.paid > 0 ? <StatusBadge tone="warning" dot>Partial</StatusBadge> : <StatusBadge tone="danger" dot>Due</StatusBadge>}
              </DialogTitle>
              <DialogDescription>{bill.date}{bill.category ? ` · ${bill.category}` : ''}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-[1fr_240px]">
              <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-lg border border-border bg-ink-50">
                {bill.receipt ?
              <img src={bill.receipt} alt={`Receipt for ${bill.ref}`} className="max-h-[50vh] w-full object-contain" /> :

              <div className="p-6 text-center text-sm text-ink-500">
                    <FileImage className="mx-auto mb-2 size-8 text-helper" />
                    No receipt attached
                    {!onReceiptChange && <p className="mt-2 text-xs">Receipt upload requires backend integration.</p>}
                  </div>
              }
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-ink-500">Party</p>
                  {bill.partyId ?
                <Link to={`/app/parties?id=${bill.partyId}`} className="inline-flex items-center gap-1 font-medium text-teal-700 hover:underline">
                      {bill.party} <ExternalLink className="size-3" />
                    </Link> :

                <p className="font-medium text-ink">{bill.party}</p>
                }
                </div>
                <div>
                  <p className="text-xs text-ink-500">Details</p>
                  <p className="text-ink-700">{bill.description}</p>
                </div>
                <div className="space-y-1.5 rounded-lg bg-ink-50 p-3">
                  <p className="flex justify-between"><span className="text-ink-500">Total</span><span className="font-medium">{taka(bill.total)}</span></p>
                  <p className="flex justify-between"><span className="text-ink-500">Paid</span><span>{taka(bill.paid)}</span></p>
                  <p className="flex justify-between border-t border-ink-200 pt-1.5 font-semibold"><span>Due</span><span className={due > 0 ? 'text-danger' : 'text-success'}>{taka(due)}</span></p>
                </div>
                {bill.payments && bill.payments.length > 0 && (
                  <div className="rounded-lg border border-border">
                    <p className="border-b border-border px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink-400">Payments</p>
                    <div className="divide-y divide-border">
                      {bill.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between gap-3 px-3 py-2 text-[12px]">
                          <div className="min-w-0">
                            <p className="font-medium text-ink">{payment.method}</p>
                            <p className="truncate text-[10.5px] text-ink-400">{payment.account ?? 'Default account'}</p>
                          </div>
                          <span className="font-medium text-ink">{taka(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {onReceiptChange && !bill.cancelled && <PhotoUploader photos={bill.receipt ? [bill.receipt] : []} max={1} label="Attach receipt" onChange={photos => onReceiptChange(photos[0])} hint="Receipt stays in this browser session preview." />}
            {!!history.length && <section aria-label="Expense preview history" className="rounded-lg border border-border p-3 text-xs"><p className="mb-2 font-semibold text-ink">Preview history</p>{history.map((entry, i) => <p key={i} className="text-ink-600">{entry}</p>)}</section>}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                if (!printReport({ title: bill.ref, subtitle: bill.cancelled ? 'Cancelled expense preview' : 'Bill preview', headers: ['Field', 'Value'], rows: [['Date', bill.date], ['Party', bill.party], ['Details', bill.description], ['Total', taka(bill.total)], ['Paid', taka(bill.paid)], ['Due', taka(due)]] })) toast.error('Allow the print popup and try again.');
              }}>Print</Button>
              {onEdit && !bill.cancelled && <Button variant="outline" onClick={onEdit}>Correct expense</Button>}
              <Button variant="outline" onClick={onClose}>Close</Button>
              {due > 0 && !bill.cancelled &&
            <Button
              disabled={!onPay} title={!onPay ? 'Source-linked bill payment requires integration.' : undefined}
              onClick={onPay}>
              
                  <HandCoins className="size-4" /> Pay {taka(due)}
                </Button>
            }
            </DialogFooter>
            {due > 0 && !onPay && !bill.cancelled && <p className="text-xs text-ink-500">Source-linked bill payment requires integration. No payment has been recorded.</p>}
          </>
        }
      </DialogContent>
    </Dialog>);

}
