import {scheduleDifferencePaisa,validateScheduleRows,type InstallmentScheduleRow} from '../installments/schedule.ts';
import {validateInstallmentDraft} from '../installments/validateDraft.ts';

export type PreviewInstallmentAgreement={
  id:string;invoiceReference:string;customerId:string;customerName:string;
  createdAt:string;operationId:string;totalPaisa:number;downPaymentPaisa:number;
  schedule:InstallmentScheduleRow[];
  lineSnapshot:{key:string;productId:string;amountPaisa:number}[];
  paymentSnapshot:{method:string;account:string;amountPaisa:number}[];
};
export type InstallmentPreviewInput=Omit<PreviewInstallmentAgreement,'id'|'createdAt'>;
let sequence=0;
const records:PreviewInstallmentAgreement[]=[];
const clean=(value:string,name:string)=>{
  if(typeof value!=='string'||!value.trim())throw new Error(name+' is required.');
  return value.trim();
};
const paisa=(value:number,name:string)=>{
  if(!Number.isSafeInteger(value)||value<0)throw new Error(name+' must be nonnegative integer paisa.');
  return value;
};
const total=(items:readonly {amountPaisa:number}[],name:string)=>{
  const amount=items.reduce((sum,row)=>sum+paisa(row.amountPaisa,name),0);
  if(!Number.isSafeInteger(amount))throw new Error(name+' exceeds safe money range.');
  return amount;
};

/** In-memory preview-only record; no party, finance, stock or backend source mutations. */
export function recordInstallmentPreview(input:InstallmentPreviewInput):PreviewInstallmentAgreement {
  clean(input.operationId,'Operation ID');
  const oldOperation=records.find(record=>record.operationId===input.operationId);
  if(oldOperation){
    const {id:_id,createdAt:_at,...previous}=oldOperation;
    if(JSON.stringify(previous)!==JSON.stringify(input))throw new Error('Operation already used for different installment details.');
    return structuredClone(oldOperation);
  }
  clean(input.invoiceReference,'Invoice reference');
  clean(input.customerId,'Customer');
  clean(input.customerName,'Customer name');
  paisa(input.totalPaisa,'Total invoice');
  paisa(input.downPaymentPaisa,'Down payment');
  const error=validateInstallmentDraft({customerId:input.customerId,customerName:input.customerName,
    phone:'',totalPaisa:input.totalPaisa,downPaymentPaisa:input.downPaymentPaisa,schedule:input.schedule});
  if(error.length)throw new Error(error[0]);
  if(input.lineSnapshot.length===0||new Set(input.lineSnapshot.map(l=>l.key)).size!==input.lineSnapshot.length)
    throw new Error('Duplicate or missing invoice line identity.');
  if(input.lineSnapshot.some(l=>!l.productId?.trim()))throw new Error('Invoice line product required.');
  if(total(input.lineSnapshot,'Invoice line')!==input.totalPaisa)
    throw new Error('Invoice line prices must reconcile to the agreed invoice total.');
  if(input.paymentSnapshot.some(row=>!row.method.trim()||!row.account.trim()||row.method==='Customer Credit'))
    throw new Error('Choose actual money accounts for the initial payment.');
  if(total(input.paymentSnapshot,'Payment split')!==input.downPaymentPaisa)
    throw new Error('Payment splits must reconcile to the down payment.');
  if(validateScheduleRows(input.schedule).length||scheduleDifferencePaisa(input.schedule,input.totalPaisa-input.downPaymentPaisa)!==0)
    throw new Error('Schedule total must match the remaining balance.');
  if(records.some(record=>record.invoiceReference===input.invoiceReference))
    throw new Error('Invoice already has an installment agreement.');
  const created:PreviewInstallmentAgreement={...structuredClone(input),id:'installment-preview-'+(++sequence),createdAt:new Date().toISOString()};
  records.push(created);
  return structuredClone(created);
}
export function listInstallmentPreviews():PreviewInstallmentAgreement[]{return structuredClone(records);}
export function getInstallmentPreview(id:string):PreviewInstallmentAgreement|undefined{
  const match=records.find(row=>row.id===id);
  return match?structuredClone(match):undefined;
}
export function resetInstallmentPreviewsForTest():void{sequence=0;records.splice(0);}
