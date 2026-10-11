import type {FinancePaymentDraft} from '../components/finance/FinancePaymentSplitEditor.tsx';
import type {FinanceAccount} from '../data/financeAccounts.ts';
import type {VendorSettlement} from './vendorTypes.ts';

type VendorSplits=NonNullable<VendorSettlement['paymentSplits']>;

export function vendorPaymentSplits(
 rows:readonly FinancePaymentDraft[],
 accounts:readonly FinanceAccount[],
 expectedPaisa:number
):VendorSplits{
 if(!Number.isSafeInteger(expectedPaisa)||expectedPaisa<=0)
  throw new Error('Payment amount must be positive integer paisa.');
 if(!rows.length)throw new Error('Choose a payment account.');
 const ids=new Set<string>();
 let total=0;
 const output:VendorSplits=rows.map(row=>{
  if(!row.id||ids.has(row.id))throw new Error('Duplicate or missing payment split ID.');
  ids.add(row.id);
  const account=accounts.find(a=>a.id===row.accountId&&a.status==='Active');
  if(!account)throw new Error('Choose an active payment account.');
  const expectedMethod=account.type==='Petty Cash'?'Cash':account.type;
  if(row.method!==expectedMethod)throw new Error('Payment method does not match its account.');
  const value=row.amount.trim();
  if(!/^(?:\d+)(?:\.\d{1,2})?$/.test(value))
   throw new Error('Enter a positive amount with at most two decimal places.');
  const n=Number(value);
  const paisa=Math.round(n*100);
  if(!Number.isFinite(n)||n<=0||!Number.isSafeInteger(paisa))
   throw new Error('Payment amount must be positive and valid.');
  total+=paisa;
  if(!Number.isSafeInteger(total))throw new Error('Payment amount exceeds supported range.');
  return {id:row.id,method:row.method,accountId:account.id,amountPaisa:paisa};
 });
 if(total!==expectedPaisa)throw new Error('Payment splits must match the total amount.');
 return output;
}
