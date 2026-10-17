import {financeAccounts} from '../data/financeAccounts.ts';
import {validateBusinessDate,validatePartySplits} from '../utils/partyPayment.ts';
import {projectInstallmentBalance,type InstallmentPaymentPreviewEvent,type InstallmentReceiptAllocation} from './collections.ts';
import type {PreviewInstallmentAgreement} from '../data/installmentPreviewStore.ts';

export type InstallmentCollectionInput={
 agreement:PreviewInstallmentAgreement;operationId:string;date:string;amountPaisa:number;
 allocations:InstallmentReceiptAllocation[];
 splits:{method:'Cash'|'Bank'|'Mobile Banking';accountId:string;amountPaisa:number}[];
};
/** Validate a single preview receipt, not a Party Ledger or Bank posting instruction. */
export function validateInstallmentCollection(
 input:InstallmentCollectionInput,previous:readonly InstallmentPaymentPreviewEvent[]
):string[]{
 const errors:string[]=[];
 if(!input.agreement?.id)errors.push('Select an installment agreement.');
 if(!input.operationId?.trim())errors.push('Receipt operation ID is required.');
 try{validateBusinessDate(input.date);}catch{errors.push('Choose a valid payment date, not in the future.');}
 if(!Number.isSafeInteger(input.amountPaisa)||input.amountPaisa<=0)
   errors.push('Enter a positive whole-paisa payment amount.');
 if(!input.allocations.length)errors.push('Choose an installment allocation.');
 if(!input.splits.length)errors.push('Choose a payment source.');
 if(errors.length)return errors;
 try{
   validatePartySplits(input.splits.map((split,index)=>({
     id:'installment-split-'+index,method:split.method,accountId:split.accountId,
     amount:split.amountPaisa/100
   })),input.amountPaisa/100,financeAccounts);
 }catch(error){errors.push(error instanceof Error?error.message:'Invalid payment sources.');}
 if(previous.some(event=>event.date>input.date))
   errors.push('Payment date cannot precede a later recorded installment collection.');
 if(errors.length)return errors;
 try{
   const probe:InstallmentPaymentPreviewEvent={id:'validation-'+input.operationId,
     operationId:input.operationId,agreementId:input.agreement.id,
     date:input.date,amountPaisa:input.amountPaisa,allocations:structuredClone(input.allocations),
     splits:structuredClone(input.splits),createdAt:new Date().toISOString()};
   projectInstallmentBalance(input.agreement,[...previous,probe],input.date);
 }catch(error){errors.push(error instanceof Error?error.message:'Invalid installment allocations.');}
 return errors;
}
