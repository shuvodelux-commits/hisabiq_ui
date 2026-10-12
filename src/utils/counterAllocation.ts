import type {PartySourceRecord} from '../types/partyLedger';

/** Open sale balances in paisa. Unassigned payments always settle oldest debts first.
 * Explicit invoice payments settle that invoice; any remaining credit is applied FIFO.
 * This is a UI preview projection; the shared party ledger remains authoritative for net due.
 */
export type CounterOpenInvoice={id:string;reference:string;date:string;due:number;description:string;opening:boolean};
export function counterOpenInvoices(sources:readonly PartySourceRecord[],partyId:string,asOf:string):CounterOpenInvoice[]{
 const events=sources.filter(s=>s.partyId===partyId&&s.relationship==='Customer'&&s.status==='Active'&&s.date<=asOf)
  .sort((a,b)=>a.date.localeCompare(b.date)||a.sequence-b.sequence||a.id.localeCompare(b.id));
 type Row=CounterOpenInvoice & {remaining:number};
 const invoices:Row[]=[];
 let advance=0;
 const settle=(money:number,target?:string)=>{
  let left=money;
  const selected=target?invoices.find(r=>r.id===target||r.reference===target):undefined;
  const ordered=selected?[selected,...invoices.filter(r=>r!==selected)]:invoices;
  for(const row of ordered){
   if(left<=0)break;
   const paid=Math.min(row.remaining,left);
   row.remaining-=paid;left-=paid;
  }
  advance+=left;
 };
 for(const event of events){
  if(event.kind==='sale'||event.kind==='opening'&&event.debit>0){
   const due=Math.max(0,Math.round(event.debit*100));
   const row:Row={id:event.id,reference:event.reference||'Opening balance',date:event.date,
     description:event.description,due:due/100,remaining:due,opening:event.kind==='opening'};
   const applied=Math.min(advance,row.remaining);row.remaining-=applied;advance-=applied;
   invoices.push(row);
  }else if(event.kind==='customer-payment'||event.kind==='sale-return'||event.kind==='customer-credit-apply'
       ||event.kind==='opening'&&event.credit>0){
   settle(Math.max(0,Math.round(event.credit*100)),event.invoiceId);
  }else if(event.kind==='customer-credit-refund'){
   // A returned advance is not a payment against an invoice.
   advance=Math.max(0,advance-Math.round(event.debit*100));
  }
 }
 return invoices.filter(row=>row.remaining>0).map(({remaining,...row})=>({...row,due:remaining/100}));
}
export function counterAllocateOldest(invoices:readonly CounterOpenInvoice[],amount:number){
 let remaining=Math.max(0,Math.round(amount*100));
 return invoices.map(invoice=>{
  const applied=Math.min(Math.round(invoice.due*100),remaining);remaining-=applied;
  return {invoice:invoice.reference,amount:applied/100};
 }).filter(item=>item.amount>0);
}
