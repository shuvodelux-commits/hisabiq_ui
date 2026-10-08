import React, { useEffect, useState } from 'react';
import { Check, HandCoins } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { AppDatePicker } from '../AppDateRangePicker';
import { AppSelect } from '../AppSelect';
import { FinancePaymentSplitEditor, type FinancePaymentDraft } from '../finance/FinancePaymentSplitEditor';
import { financeAccounts } from '../../data/financeAccounts';
import { businessToday } from '../../utils/dateRange';
import { customerSettlementAsOf, supplierSettlementAsOf } from '../../utils/partySettlement';
import type { PartySourceRecord, PartyPaymentPayload } from '../../types/partyLedger';
import type { Party } from '../../types/erp';
import { taka } from '../../utils/currency';

type Props = { open:boolean; party:Party; relationship:'Customer'|'Supplier'; sources:readonly PartySourceRecord[];
  onClose:()=>void; onSubmit:(payload:PartyPaymentPayload)=>void };
const initial=():FinancePaymentDraft[]=>[{id:'initial',method:'Cash',accountId:'acc-cash',amount:''}];
export function PartyPaymentDialog({open,party,relationship,sources,onClose,onSubmit}:Props) {
  const [date,setDate]=useState(businessToday());
  const [amount,setAmount]=useState('');
  const [discount,setDiscount]=useState('');
  const [reason,setReason]=useState('');
  const [invoiceId,setInvoiceId]=useState('');
  const [splits,setSplits]=useState<FinancePaymentDraft[]>(initial);
  const [review,setReview]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{if(open){setDate(businessToday());setAmount('');setDiscount('');setReason('');
    setInvoiceId('');setSplits(initial());setReview(false);setError('');}},[open,party.id,relationship]);
  let due=0,credit=0;
  try {
    const result=relationship==='Customer'
      ?customerSettlementAsOf(sources,party.id,date)
      :supplierSettlementAsOf(sources,party.id,date);
    due=result.invoiceDue;credit=result.refundableCredit;
  }catch { /* Business date is checked again when confirming. */ }
  const net=Number(amount)||0,rebate=Number(discount)||0;
  const invoiceKind=relationship==='Customer'?'sale':'purchase';
  const invoiceOptions=[{value:'',label:'Auto-allocate (oldest outstanding)'},
    ...sources.filter(x=>x.partyId===party.id&&x.relationship===relationship&&x.kind===invoiceKind
      &&x.status==='Active'&&x.date<=date).map(x=>({value:x.reference||x.id,label:(x.reference||x.id)+' · '+taka(relationship==='Customer'?x.debit:x.credit)}))];
  const submit=()=>{
    setError('');
    const paymentSplits=splits.map(row=>({id:row.id,method:row.method,accountId:row.accountId,
      amount:row.amount.trim()===''&&splits.length===1?net:Number(row.amount)}));
    const payload:PartyPaymentPayload={partyId:party.id,relationship,date,amount:net,discount:rebate,
      reason:reason.trim(),invoiceId:invoiceId||undefined,splits:paymentSplits};
    if(!review){
      if(net<=0||!Number.isFinite(net)){setError('Enter a payment amount.');return;}
      if(rebate&&(!reason.trim()||rebate>due)){setError('Discount requires a reason and cannot exceed due.');return;}
      if(paymentSplits.some(row=>!Number.isFinite(row.amount)||row.amount<=0)||
        Math.abs(paymentSplits.reduce((sum,row)=>sum+row.amount,0)-net)>0.001){
        setError('Payment rows must add up to the entered cash amount.');return;
      }
      setReview(true);return;
    }
    try{onSubmit(payload);onClose();}catch(e){setError(e instanceof Error?e.message:'Cannot record payment.');setReview(false);}
  };
  const action=relationship==='Customer'?'Receive payment':'Pay supplier';
  return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>
    <DialogContent role="dialog" aria-modal="true" aria-label="Party payment" className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader><DialogTitle>{action} <span className="font-bn text-sm font-normal text-ink-500">পেমেন্ট</span></DialogTitle>
        <DialogDescription>Record a verified split payment in this browser preview. No bank transfer or real accounting posting occurs.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2 rounded-lg bg-ink-50 p-3">
          <div><p className="text-xs text-ink-500">{relationship} · {party.phone}</p><p className="font-semibold">{party.name}</p></div>
          <div className="text-right"><p className="text-xs text-ink-500">Outstanding due as of date</p><p className="font-semibold">{taka(due)}</p>
            {credit>0&&<p className="text-xs text-teal-700">Refundable credit {taka(credit)}</p>}</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-medium text-ink-700">Payment date
            <AppDatePicker label="Payment date" value={date} onChange={value=>{setDate(value);setReview(false);}}/>
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-700">Amount received/paid
            <div className="flex gap-1"><Input aria-label="Payment amount" inputMode="decimal" value={amount} onChange={event=>{
              const next=event.target.value;setAmount(next);setReview(false);
              if(splits.length===1)setSplits(previous=>previous.map(item=>({...item,amount:next})));
            }} placeholder="0.00"/>
              <Button size="sm" variant="outline" onClick={()=>{const n=String(Math.max(0,due-rebate));setAmount(n);if(splits.length===1)setSplits(previous=>previous.map(item=>({...item,amount:n})));setReview(false);}}>Full</Button>
            </div>
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-700">Discount / adjustment
            <Input aria-label="Payment discount" value={discount} inputMode="decimal" onChange={event=>{setDiscount(event.target.value);setReview(false);}} placeholder="0"/>
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-700">Invoice / bill allocation
            <AppSelect label="Invoice selection" value={invoiceId} options={invoiceOptions} onChange={value=>{setInvoiceId(value);setReview(false);}}/>
          </label>
        </div>
        {(rebate>0||reason)&&<label className="block space-y-1 text-xs font-medium text-ink-700">Reason / note
          <Input aria-label="Payment reason" value={reason} onChange={event=>{setReason(event.target.value);setReview(false);}} placeholder="Required when discount is applied"/>
        </label>}
        <FinancePaymentSplitEditor accounts={financeAccounts} rows={splits} onChange={value=>{setSplits(value);setReview(false);}} totalAmount={net}/>
        {review&&<div className="rounded-lg border border-teal-300 bg-teal-50 p-3 text-xs text-teal-800" role="status">
          <p className="font-semibold">Review before recording</p>
          <p>{action} · {party.name} · {date}</p>
          <p>Cash movement {taka(net)} · Discount {taka(rebate)} · Due after {taka(Math.max(0,due-net-rebate))}</p>
          <p className="mt-1">Confirm records one auditable preview source. No banking transaction will occur.</p>
        </div>}
        {error&&<p role="alert" className="rounded-md bg-danger-bg p-2 text-xs text-danger">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit}>{review?<><Check className="size-4"/> Confirm {action.toLowerCase()}</>:<><HandCoins className="size-4"/> Review payment</>}</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
