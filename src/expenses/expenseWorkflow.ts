import type {Expense} from '../types/erp.ts';

export type ExpenseFilters={
 query?:string;
 category?:string;
 payee?:string;
 paymentMethod?:string;
 status?:string;
};

/** Expense records here are UI preview data, not posted ledger events. */
export const expenseStatus=(expense:Expense):'Active'|'Cancelled'=>
 expense.recordStatus==='Deleted'?'Cancelled':'Active';

export function expensePaymentMethods(expense:Expense):string[]{
 if(expense.payments?.length)return expense.payments.map(payment=>payment.method);
 return expense.paid>0?[expense.method]:[];
}

export function filterExpenseList(expenses:readonly Expense[],filters:ExpenseFilters={}):Expense[]{
 const query=(filters.query??'').trim().toLocaleLowerCase();
 const category=filters.category, payee=filters.payee, paymentMethod=filters.paymentMethod, status=filters.status;
 return expenses.filter(expense=>{
  if(category&&category!=='All categories'&&expense.category!==category)return false;
  if(payee&&payee!=='All payees'&&expense.payee!==payee)return false;
  const methods=expensePaymentMethods(expense);
  if(paymentMethod&&paymentMethod!=='All payment methods'&&!methods.includes(paymentMethod))return false;
  if(status&&status!=='All status'&&expenseStatus(expense)!==status)return false;
  return !query||[
   expense.ref,expense.date,expense.category,expense.payee,expense.note,
   ...methods
  ].some(value=>value.toLocaleLowerCase().includes(query));
 });
}

function csvCell(value:string|number):string{
 let text=String(value??'');
 // Prevent spreadsheet formula evaluation on CSV import, even with leading whitespace.
 if(/^[\s]*[=+@\-]/.test(text))text="'"+text;
 return /[",\r\n]/.test(text)?'"'+text.replaceAll('"','""')+'"':text;
}

export function expenseCsv(expenses:readonly Expense[]):string{
 const rows:(string|number)[][]=[
  ['Expense ref','Date','Category','Payee','Note','Amount','Paid','Payment methods','Status'],
  ...expenses.map(expense=>[
   expense.ref,expense.date,expense.category,expense.payee,expense.note,
   expense.amount,expense.paid,expensePaymentMethods(expense).join(' + '),expenseStatus(expense)
  ])
 ];
 return '\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
