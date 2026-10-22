import type {SalesReturn} from '../types/erp.ts';

export type ReturnCompensationRecord={
 id:string;sourceReturnId:string;invoiceRefs:string[];customerId?:string;
 customerName:string;expenseAmountPaisa:number;
 category:'Customer Compensation';date:string;createdAt:string;
};

/** Read-only expense projection from a source-linked return: NEVER a second payout. */
export function deriveReturnCompensation(returns:readonly SalesReturn[]):ReturnCompensationRecord[]{
 const seen=new Set<string>();
 const expenses:ReturnCompensationRecord[]=[];
 for(const item of returns){
  if(seen.has(item.id)||item.recordStatus==='Deleted')continue;
  seen.add(item.id);
  const derived=(item.lineReturns??[]).reduce((sum,line)=>sum+Math.max(0,line.priceDifferencePaisa??0),0);
  const recorded=item.compensationExpensePaisa??derived;
  if(!Number.isSafeInteger(recorded)||recorded<0||
    (item.compensationExpensePaisa!==undefined&&
     item.lineReturns?.some(line=>line.priceDifferencePaisa!==undefined)&&
     recorded!==derived))
   throw new Error('Return compensation audit does not reconcile: '+item.id);
  if(!recorded)continue;
  expenses.push({
   id:'expense-compensation-'+item.id,
   sourceReturnId:item.id,invoiceRefs:[...item.invoices],
   ...(item.customerId?{customerId:item.customerId}:{}),
   customerName:item.customer,expenseAmountPaisa:recorded,
   category:'Customer Compensation',date:item.date,createdAt:item.createdAt??item.date
  });
 }
 return expenses;
}
