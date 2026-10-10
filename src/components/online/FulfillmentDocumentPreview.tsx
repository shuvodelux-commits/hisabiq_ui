import React from 'react';
import {Printer} from 'lucide-react';
import {taka} from '../../utils/currency';
import {orderTotals,lineTotal,type OnlineOrder} from '../../onlineSales/onlineStore';

export type FulfillmentDocument='Order confirmation'|'Packing list'|'Delivery challan';
export const documentTitles:FulfillmentDocument[]=['Order confirmation','Packing list','Delivery challan'];
export function FulfillmentDocumentPreview({order,kind}:{order:OnlineOrder;kind:FulfillmentDocument}){
 const totals=orderTotals(order),showAmounts=kind==='Order confirmation';
 return <div id="fulfillment-print-document" className="space-y-4 rounded-lg border border-border bg-card p-4 text-sm text-ink">
  <div className="flex justify-between gap-4 border-b border-border pb-3">
   <div><h3 className="text-lg font-bold text-ink">HisabIQ</h3><p className="font-bn text-xs text-ink-500">ব্যবসার অর্ডার ডকুমেন্ট</p></div>
   <div className="text-right"><strong>{kind}</strong><p className="text-xs">{order.number}</p>
    <p className="text-[11px] text-ink-500">Printed: {new Date().toLocaleDateString('en-GB',{timeZone:'Asia/Dhaka'})}</p></div>
  </div>
  <div className="grid gap-3 text-xs sm:grid-cols-2">
   <div><p className="font-semibold">Ship to · প্রাপক</p><p>{order.customerName}</p><p>{order.phone}</p><p>{order.address}</p></div>
   <div><p className="font-semibold">Fulfillment</p><p>Source: {order.channel}</p>
    <p>Courier: {order.courier??'Not assigned'}</p><p>Tracking: {order.tracking??'—'}</p>
    <p>Order state: {order.stage}</p></div>
  </div>
  <table className="w-full border-collapse text-xs">
   <thead><tr className="border-b border-border text-left">
    <th className="py-2">#</th><th>Product / description</th>
    <th className="text-right">Quantity</th>{showAmounts&&<><th className="text-right">Unit price</th><th className="text-right">Line total</th></>}
   </tr></thead>
   <tbody>{order.lines.map((l,i)=><tr key={l.id} className="border-b border-border/60">
    <td className="py-2">{i+1}</td><td>{l.name}</td><td className="text-right">{l.quantity} {l.unit}{l.secondaryQuantity?' '+l.secondaryQuantity+' small units':''}</td>
    {showAmounts&&<><td className="text-right">{taka(l.price)}</td><td className="text-right">{taka(lineTotal(l))}</td></>}
   </tr>)}</tbody>
  </table>
  {showAmounts&&<div className="ml-auto max-w-xs space-y-1 text-right text-xs">
   <p>Goods: {taka(totals.items)}</p><p>Discount: {taka(totals.discount)}</p>
   <p>Delivery charge: {taka(totals.delivery)}</p>
   <p className="border-t border-border pt-1 text-sm font-bold">Total: {taka(totals.grand)}</p>
   <p>Advance (seller preview): {taka(totals.advance)}</p>
   <p>Balance / COD planned: {taka(totals.cod)}</p>
  </div>}
  {kind==='Packing list'&&<p className="text-xs text-ink-500">Pick, count and pack items. This is not a financial invoice. Packed by: __________________</p>}
  {kind==='Delivery challan'&&<div className="space-y-3 pt-4 text-xs">
   <p>Parcel handed to / courier: __________________________________</p>
   <p>Handover date: __________________ Signature: __________________</p>
   <p>Receiver name: __________________ Signature: __________________</p>
  </div>}
  <p className="border-t border-border pt-2 text-[11px] text-ink-500">
   {kind==='Order confirmation'?'Order confirmation only; a Sales invoice is generated separately by POS.':
    kind==='Delivery challan'?'Delivery challan only — not a sales invoice or courier waybill.':
    'Packing checklist only — no financial figures, payment or stock posting.'}
  </p>
 </div>;
}
export function printFulfillment(kind:FulfillmentDocument){
 const node=document.getElementById('fulfillment-print-document');
 if(!node)throw new Error('Print document is not visible.');
 const old=node.getAttribute('data-print-kind');node.setAttribute('data-print-kind',kind);
 window.print();
 if(old===null)node.removeAttribute('data-print-kind');else node.setAttribute('data-print-kind',old);
}
export const fulfillmentPrintCss=`@media print {
 body * { visibility: hidden !important; }
 #fulfillment-print-document, #fulfillment-print-document * {visibility:visible !important;}
 #fulfillment-print-document {position:fixed !important;inset:0 !important;width:100% !important;
  border:none !important;background:white !important;color:black !important;padding:16mm !important;}
 @page {size:A4;margin:0;}
}`;
