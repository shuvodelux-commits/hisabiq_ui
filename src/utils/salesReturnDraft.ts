import type {SaleLine,SalesInvoice,SalesReturn} from '../types/erp.ts';
import {unitQuantitiesBase} from './multiUnitTransactions.ts';
import {planOrdinaryReturn} from './salesReturn.ts';
import {quoteReturnPrice,type ReturnPriceQuote} from './salesReturnPricing.ts';

export type ReturnLineInput={
 invoiceId:string;lineId:string;quantity?:string;unitQuantities?:Record<string,string>;
 serials:string[];reason:string;rawReturnUnitPrice?:string;aboveHistoricalReason?:string;
};
export type ReturnQuotedLine={
 invoiceId:string;lineId:string;quantity:number;unitQuantities?:Record<string,string>;
 serials:string[];reason:string;historicalSourceAmountPaisa:number;
 agreedReturnAmountPaisa:number;priceDifferencePaisa:number;
 effectiveUnitPrice:number|null;priceWasOverridden:boolean;
 adjustmentReason?:string;
};
export type ReturnDraftQuote={
 lines:ReturnQuotedLine[];historicalPaisa:number;agreedPaisa:number;
 compensationPaisa:number;negativeAdjustmentPaisa:number;selectedDuePaisa:number;issues:string[];
};
export const returnLineKey=(invoiceId:string,lineId:string)=>JSON.stringify([invoiceId,lineId]);
const simpleDecimal=/^(?:\d+(?:\.\d{1,6})?|\.\d{1,6})$/;

/** Do not recover missing historic ratios from the mutable current Product catalog. */
export function returnBaseQuantity(line:SaleLine,input:ReturnLineInput):{quantity:number;issues:string[]}{
 const issues:string[]=[];
 if(input.unitQuantities){
  if(!Object.values(input.unitQuantities).some(value=>value.trim()&&Number(value)>0))return {quantity:0,issues:[]};
  const profile=line.unitSnapshot;
  if(!profile||!profile.factors?.[profile.baseUnit]||profile.baseUnit!==line.unit){
   issues.push('Historical unit conversion is unavailable for this invoice.');
   return {quantity:0,issues};
  }
  try {
   const quantity=unitQuantitiesBase(profile,input.unitQuantities);
   if(!Number.isFinite(quantity)||quantity<0||!Number.isFinite(quantity*1e6)||
      Math.abs(quantity*1e6-Math.round(quantity*1e6))>0.0001)
    issues.push('Invalid historic multi-unit return quantity.');
   return {quantity,issues};
  }catch(error){
   issues.push(error instanceof Error?error.message:'Invalid historic unit quantities.');
   return {quantity:0,issues};
  }
 }
 const raw=(input.quantity??'').trim();
 if(!raw)return {quantity:0,issues};
 if(!simpleDecimal.test(raw)||!Number.isFinite(Number(raw)))issues.push('Enter a valid return quantity.');
 return {quantity:issues.length?0:Number(raw),issues};
}
export function buildReturnPreview(input:{
 invoiceIds:readonly string[];lines:readonly ReturnLineInput[];
 invoices:readonly SalesInvoice[];returns:readonly SalesReturn[];
 settlement:SalesReturn['settlement'];
}):ReturnDraftQuote {
 const issues:string[]=[];const lines:ReturnQuotedLine[]=[];
 const selected=new Set(input.invoiceIds);
 if(!selected.size)issues.push('Select at least one invoice.');
 const invoices=new Map(input.invoices.map(i=>[i.id,i]));
 let historicalPaisa=0,agreedPaisa=0,compensationPaisa=0,negativeAdjustmentPaisa=0,selectedDuePaisa=0;
 for(const invoiceId of selected){
  const invoice=invoices.get(invoiceId);
  if(!invoice){issues.push('A selected source invoice is missing.');continue;}
  selectedDuePaisa+=Math.round(invoice.due*100);
 }
 const used=new Set<string>();
 for(const row of input.lines){
  const key=returnLineKey(row.invoiceId,row.lineId);
  if(used.has(key)){issues.push('A return item was added twice.');continue;}
  used.add(key);
  const source=invoices.get(row.invoiceId);
  const line=source?.lines.find(l=>l.id===row.lineId);
  if(!source||!selected.has(row.invoiceId)||!line){issues.push('Return item does not belong to selected invoice.');continue;}
  if(line.bundleSnapshot){issues.push('Bundle returns remain preview-only.');continue;}
  const base=returnBaseQuantity(line,row);
  if(base.issues.length){issues.push(...base.issues);continue;}
  if(base.quantity===0)continue;
  const plan=planOrdinaryReturn(source,line,String(base.quantity),row.serials,input.returns);
  if(plan.issues.length){issues.push(...plan.issues);continue;}
  const quote:ReturnPriceQuote=quoteReturnPrice(plan,row.rawReturnUnitPrice);
  if(quote.issues.length){issues.push(...quote.issues);continue;}
  if(quote.priceDifferencePaisa>0&&!row.aboveHistoricalReason?.trim()){
   issues.push('Explain why return price exceeds historical net price.');continue;
  }
  const q:ReturnQuotedLine={invoiceId:source.id,lineId:line.id,quantity:base.quantity,
    ...(row.unitQuantities?{unitQuantities:{...row.unitQuantities}}:{}),
    serials:[...row.serials],reason:row.reason,
    historicalSourceAmountPaisa:quote.historicalSourceAmountPaisa,
    agreedReturnAmountPaisa:quote.agreedReturnAmountPaisa,
    priceDifferencePaisa:quote.priceDifferencePaisa,
    effectiveUnitPrice:quote.effectiveUnitPrice,
    priceWasOverridden:quote.overridden,
    ...(row.aboveHistoricalReason?.trim()?{adjustmentReason:row.aboveHistoricalReason.trim()}: {})
  };
  lines.push(q);
  historicalPaisa+=q.historicalSourceAmountPaisa;
  agreedPaisa+=q.agreedReturnAmountPaisa;
  compensationPaisa+=quote.compensationExpensePaisa;
  negativeAdjustmentPaisa+=quote.negativeAdjustmentPaisa;
 }
 if(!lines.length&&!issues.length)issues.push('Enter a positive quantity for at least one return item.');
 if([historicalPaisa,agreedPaisa,compensationPaisa,negativeAdjustmentPaisa,selectedDuePaisa].some(n=>!Number.isSafeInteger(n)))issues.push('Return amount exceeds currency limits.');
 return {lines,historicalPaisa,agreedPaisa,compensationPaisa,negativeAdjustmentPaisa,selectedDuePaisa,issues};
}
