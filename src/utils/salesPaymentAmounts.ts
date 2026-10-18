import { posMoney } from './posCheckoutValidation.ts';

/** Reject malformed money in any row; never silently sum a numeric prefix. */
export function salesPaymentTotal(rows:readonly {amount:string}[]):number {
  let totalPaisa=0;
  for(const row of rows){
    const amount=posMoney(row.amount);
    if(!Number.isFinite(amount))return NaN;
    totalPaisa+=Math.round(amount*100);
    if(!Number.isSafeInteger(totalPaisa))return NaN;
  }
  return totalPaisa/100;
}
