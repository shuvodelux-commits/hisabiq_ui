import React, { useEffect, useState } from 'react';
import { ArrowLeftRight, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { AppDatePicker } from '../AppDateRangePicker';
import { FinancePaymentSplitEditor, type FinancePaymentDraft } from '../finance/FinancePaymentSplitEditor';
import { financeAccounts } from '../../data/financeAccounts';
import { businessToday } from '../../utils/dateRange';
import { customerSettlementAsOf, supplierSettlementAsOf } from '../../utils/partySettlement';
import type { PartySourceRecord, PartyRefundPayload } from '../../types/partyLedger';
import type { Party } from '../../types/erp';
import { taka } from '../../utils/currency';

type Props={open:boolean;party:Party;relationship:'Customer'|'Supplier';sources:readonly PartySourceRecord[];
  onClose:()=>void;onSubmit:(payload:PartyRefundPayload)=>void};
export function PartyCreditRefundDialog({open,party,relationship,sources,onClose,onSubmit}:Props){
  const [date,setDate]=useState(businessToday());
  const [value,setValue]=useState('');
  const [reason,setReason]=useState('');
  const [splits,setSplits]=useState<FinancePaymentDraft[]>([{id:'refund-1',method:'Cash',accountId:'acc-cash',amount:''}]);
  const [review,setReview]=useState(false);
  const [error,setError]=useState('');
  useEffect(()=>{if(open){setDate(businessToday());setValue('');setReason('');setReview(false);setError('');
    setSplits([{id:'refund-1',method:'Cash',accountId:'acc-cash',amount:''}]);}},[open,party.id,relationship]);
  let available=0,unknown=0,advance=0,returned=0;
  try{
    const state=relationship==='Customer'?customerSettlementAsOf(sources,party.id,date):supplierSettlementAsOf(sources,party.id,date);
    available=state.refundableCredit;unknown=state.unverifiedCredit;
    advance=state.cashBackedAdvance;returned=state.returnCredit;
  }catch{/* Invalid date is blocked at confirmation. */}
  const amount=Number(value)||0;
  const refundToCustomer=relationship==='Customer';
  const title=refundToCustomer?'Refund customer credit':'Receive supplier credit refund';
  const submit=()=>{
    setError('');
    const rows=splits.map(row=>({id:row.id,method:row.method,accountId:row.accountId,
      amount:row.amount.trim()===''&&splits.length===1?amount:Number(row.amount)}));
    const payload:PartyRefundPayload={partyId:party.id,relationship,date,amount,reason:reason.trim(),splits:rows};
    if(!review){
      if(!Number.isFinite(amount)||amount<=0||amount>available){setError('Refund amount must be positive and cannot exceed verified available credit on this date.');return;}
      if(!reason.trim()){setError('Enter a refund reason.');return;}
      if(rows.some(r=>!Number.isFinite(r.amount)||r.amount<=0)
        ||Math.abs(rows.reduce((sum,row)=>sum+row.amount,0)-amount)>0.001){
        setError('Select active money accounts and match the refund total.');return;
      }
      setReview(true);return;
    }
    try{onSubmit(payload);onClose();}catch(e){setError(e instanceof Error?e.message:'Refund rejected.');setReview(false);}
  };
  return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>
    <DialogContent role="dialog" aria-modal="true" aria-label="Party credit refund" className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{title} <span className="font-bn text-sm font-normal text-ink-500">ক্রেডিট ফেরত</span></DialogTitle>
        <DialogDescription>Credit availability is recalculated for the selected business date. Refunds only use verified money or return credit.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 text-sm">
        <div className="rounded-lg bg-ink-50 p-3">
          <p className="text-sm font-semibold">{party.name} · {relationship}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div><p className="text-[11px] text-ink-500">Refundable</p><strong>{taka(available)}</strong></div>
            <div><p className="text-[11px] text-ink-500">Cash-backed</p><strong>{taka(advance)}</strong></div>
            <div><p className="text-[11px] text-ink-500">Return credit</p><strong>{taka(returned)}</strong></div>
            <div><p className="text-[11px] text-ink-500">Unverified (blocked)</p><strong>{taka(unknown)}</strong></div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-medium text-ink-700">Refund date
            <AppDatePicker label="Refund date" value={date} onChange={v=>{setDate(v);setReview(false);}}/>
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-700">Amount
            <div className="flex gap-1">
              <Input aria-label="Credit refund amount" inputMode="decimal" value={value} onChange={e=>{
                setValue(e.target.value);setReview(false);
                if(splits.length===1)setSplits(current=>current.map(row=>({...row,amount:e.target.value})));
              }} placeholder="0.00"/>
              <Button size="sm" variant="outline" onClick={()=>{const a=String(available);setValue(a);
                if(splits.length===1)setSplits(current=>current.map(row=>({...row,amount:a})));setReview(false);}}>All</Button>
            </div>
          </label>
        </div>
        <label className="block space-y-1 text-xs font-medium text-ink-700">Reason (required)
          <Input aria-label="Credit refund reason" value={reason} onChange={e=>{setReason(e.target.value);setReview(false);}}
            placeholder="e.g. Returned unspent advance"/>
        </label>
        <FinancePaymentSplitEditor accounts={financeAccounts} rows={splits} onChange={v=>{setSplits(v);setReview(false);}} totalAmount={amount}/>
        <p className="text-xs text-ink-500">{refundToCustomer?'Cash goes out of your business.':'Cash comes into your business.'} This is a preview record only, not a real bank posting.</p>
        {review&&<div role="status" className="rounded-lg border border-teal-300 bg-teal-50 p-3 text-xs text-teal-800">
          <p className="font-semibold">Confirm the refund</p>
          <p>{title} · {date} · {taka(amount)} · Credit remaining {taka(available-amount)}</p>
        </div>}
        {!!error&&<p role="alert" className="rounded-md bg-danger-bg p-2 text-xs text-danger">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!review&&available<=0} onClick={submit}>
            {review?<><Check className="size-4"/> Confirm credit refund</>:<><ArrowLeftRight className="size-4"/> Review refund</>}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
