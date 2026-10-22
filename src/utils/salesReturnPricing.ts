/** Pure negotiated Sales Return quote. Historical source allocation stays unchanged. */
export type HistoricalReturnPlan={
 amount:number;unitPrice:number|null;quantity:number;issues:readonly string[];
};
export type ReturnPriceQuote={
 historicalSourceAmountPaisa:number;agreedReturnAmountPaisa:number;priceDifferencePaisa:number;
 compensationExpensePaisa:number;negativeAdjustmentPaisa:number;effectiveUnitPrice:number|null;
 overridden:boolean;issues:string[];
};
const numericPrice=/^(?:\d+(?:\.\d{0,6})?|\.\d{1,6})$/;
export function quoteReturnPrice(plan:HistoricalReturnPlan,rawPrice?:string):ReturnPriceQuote {
 const issues=[...plan.issues];
 const historic=plan.amount;
 if(!Number.isFinite(historic)||historic<0||!Number.isSafeInteger(Math.round(historic*100))||
  plan.unitPrice===null||!Number.isFinite(plan.unitPrice)||plan.unitPrice<0||
  !Number.isFinite(plan.quantity)||plan.quantity<0)
   issues.push('Original invoice net unit price or quantity is not verifiable.');
 const raw=rawPrice?.trim();
 let negotiated=plan.unitPrice;
 if(rawPrice!==undefined){
  if(!raw||!numericPrice.test(raw)||!Number.isFinite(Number(raw))||Number(raw)<0)
    issues.push('Enter a valid nonnegative return unit price (maximum 6 decimals).');
  else negotiated=Number(raw);
 }
 const sameDisplay=rawPrice===undefined||(negotiated!==null&&plan.unitPrice!==null&&
   Math.abs(negotiated-Number(plan.unitPrice.toFixed(6)))<0.0000005);
 const overridden=!sameDisplay;
 const historicalSourceAmountPaisa=Number.isFinite(historic)?Math.round(historic*100):0;
 let agreedReturnAmountPaisa=historicalSourceAmountPaisa;
 if(overridden&&!issues.length&&negotiated!==null){
  agreedReturnAmountPaisa=Math.round(negotiated*plan.quantity*100);
  if(!Number.isSafeInteger(agreedReturnAmountPaisa))issues.push('Return amount is too large.');
 }
 const priceDifferencePaisa=agreedReturnAmountPaisa-historicalSourceAmountPaisa;
 return {historicalSourceAmountPaisa,agreedReturnAmountPaisa,priceDifferencePaisa,
  compensationExpensePaisa:Math.max(0,priceDifferencePaisa),
  negativeAdjustmentPaisa:Math.min(0,priceDifferencePaisa),
  effectiveUnitPrice:negotiated,overridden,issues};
}
