import React, { useEffect, useState } from 'react';
import { Check, Landmark } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { AppDatePicker } from '../AppDateRangePicker';
import { AppSelect } from '../AppSelect';
import { FinancePaymentSplitEditor, type FinancePaymentDraft } from '../finance/FinancePaymentSplitEditor';
import { financeAccounts, type FinanceTransactionType } from '../../data/financeAccounts';
import { businessToday } from '../../utils/dateRange';
import { financeTypeMeta, type FinanceRole } from '../../utils/partyFinance';
import { validateBusinessDate, validatePartySplits, toPaisa } from '../../utils/partyPayment';
import type { Party } from '../../types/erp';
import type { PartyFinancePayload, PartyMoneySplit } from '../../types/partyLedger';
import { taka } from '../../utils/currency';

type Props={open:boolean;party:Party;relationship:FinanceRole;onClose:()=>void;onSubmit:(payload:PartyFinancePayload)=>void};
const available:Record<FinanceRole,FinanceTransactionType[]>={
 Owner:['Owner Credit','Owner Debit','Opening Owner Capital'],
 Lender:['Lender Credit','Lender Debit','Opening Loan'],
 Borrower:['Borrower Debit','Borrower Credit','Opening Borrower Loan']
};
const initial=():FinancePaymentDraft[]=>[{id:'cash-1',method:'Cash',accountId:'acc-cash',amount:''}];
export function PartyFinanceDialog({open,party,relationship,onClose,onSubmit}:Props){
 const [type,setType]=useState<FinanceTransactionType>(available[relationship][0]);
 const [date,setDate]=useState(businessToday());
 const [amount,setAmount]=useState('');
 const [splits,setSplits]=useState<FinancePaymentDraft[]>(initial);
 const [reference,setReference]=useState('');
 const [note,setNote]=useState('');
 const [review,setReview]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{
  if(open){setType(available[relationship][0]);setDate(businessToday());setAmount('');
   setSplits(initial());setReference('');setNote('');setReview(false);setError('');}
 },[open,party.id,relationship]);
 const meta=financeTypeMeta[type];
 const opening=!!meta?.opening;
 const money=Number(amount);
 const paymentSplits:PartyMoneySplit[]=opening?[]:splits.map(item=>({
  id:item.id,method:item.method,accountId:item.accountId,amount:Number(item.amount)
 }));
 const changeType=(next:string)=>{setType(next as FinanceTransactionType);setReview(false);setError('');};
 const submit=()=>{
  setError('');
  try{
   validateBusinessDate(date);
   if(!Number.isFinite(money)||toPaisa(money,'Finance amount')<=0)
     throw new Error('Finance amount must be greater than zero.');
   if(!meta||meta.role!==relationship)throw new Error('Invalid finance relationship and type.');
   if(!opening)validatePartySplits(paymentSplits,money);
   if(!review){setReview(true);return;}
   onSubmit({partyId:party.id,relationship,financeType:type,amount:money,date,
    reference:reference.trim()||undefined,note:note.trim()||undefined,splits:paymentSplits});
   onClose();
  }catch(e){setError(e instanceof Error?e.message:'Cannot record finance transaction.');setReview(false);}
 };
 return <Dialog open={open} onOpenChange={next=>!next&&onClose()}>
  <DialogContent role="dialog" aria-modal="true" aria-label="Party finance transaction"
    className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
   <DialogHeader>
    <DialogTitle>Record {relationship.toLowerCase()} finance <span className="font-bn text-sm font-normal text-ink-500">মূলধন / ঋণ</span></DialogTitle>
    <DialogDescription>Choose capital, lending or borrowing entry. This is a business preview, not a real money transfer.</DialogDescription>
   </DialogHeader>
   <div className="space-y-3 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-ink-50 p-3">
      <div><strong>{party.name}</strong><p className="text-xs text-ink-500">{relationship} · {party.phone}</p></div>
      <span className="text-xs text-ink-600">Tenant finance preview</span>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1 text-xs font-medium text-ink-700">Transaction type
        <AppSelect label="Finance transaction type" value={type} onChange={changeType}
          options={available[relationship].map(value=>({value,label:value}))}/>
      </label>
      <label className="space-y-1 text-xs font-medium text-ink-700">Business date
        <AppDatePicker label="Finance transaction date" value={date} onChange={value=>{setDate(value);setReview(false);}}/>
      </label>
      <label className="space-y-1 text-xs font-medium text-ink-700">Amount
        <Input aria-label="Finance amount" inputMode="decimal" value={amount} placeholder="0.00"
          onChange={event=>{const value=event.target.value;setAmount(value);setReview(false);
            if(splits.length===1)setSplits(rows=>rows.map(row=>({...row,amount:value})));}}/>
      </label>
      <label className="space-y-1 text-xs font-medium text-ink-700">Reference (optional)
        <Input aria-label="Finance reference" value={reference} onChange={e=>{setReference(e.target.value);setReview(false);}}/>
      </label>
    </div>
    {opening?<p role="note" className="rounded-lg bg-warning-bg p-3 text-xs text-warning">
      Opening relationship balance only — no cash, bank or mobile account is affected.
    </p>:<FinancePaymentSplitEditor accounts={financeAccounts} rows={splits}
      onChange={rows=>{setSplits(rows);setReview(false);}} totalAmount={Number(amount)||0}/>}
    <label className="block space-y-1 text-xs font-medium text-ink-700">Note
      <Input aria-label="Finance note" value={note} onChange={e=>{setNote(e.target.value);setReview(false);}}/>
    </label>
    {review&&<div role="status" className="rounded-lg border border-teal-300 bg-teal-50 p-3 text-xs text-teal-800">
      <strong>Review finance transaction</strong><p>{party.name} · {type} · {date} · {taka(money)}</p>
      <p>{opening?'Relationship balance only, no money movement':
        (meta?.direction==='in'?'Money into business: ':'Money out of business: ')+taka(money)}</p>
      <p>Changes this one source and adds an audit record in preview only.</p>
    </div>}
    {!!error&&<p role="alert" className="rounded-md bg-danger-bg p-2 text-xs text-danger">{error}</p>}
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button onClick={submit}>{review?<><Check className="size-4"/> Confirm finance transaction</>:
       <><Landmark className="size-4"/> Review finance transaction</>}</Button>
    </div>
   </div>
  </DialogContent>
 </Dialog>;
}
