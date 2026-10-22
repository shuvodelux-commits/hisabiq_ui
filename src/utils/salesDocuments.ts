import type { SalesInvoice, SalesReturn } from '../types/erp';
import type { ReceiptPreviewProps } from '../components/brand/ReceiptPreview';
import type { Report } from './reportOutput';
import type {UiLanguage} from '../i18n/uiCopy';
import {documentLabel,documentMethod} from '../i18n/documentCopy.ts';

export const invoiceQuantity = (line: SalesInvoice['lines'][number]) =>
  line.quantity.toLowerCase().includes(line.unit.toLowerCase()) ? line.quantity : `${line.quantity} ${line.unit}`;

export function invoiceReceipt(invoice: SalesInvoice, language?: UiLanguage): ReceiptPreviewProps {
  return {
    language,
    invoice: invoice.invoice, customer: invoice.party === 'Walk-in customer' ? undefined : invoice.party,
    customerPhone: invoice.phone, guardianName: invoice.guardianName, customerAddress: invoice.address,
    lines: invoice.lines.map(line => ({name:line.name,qty:invoiceQuantity(line),price:line.price,total:line.total,serials:line.serials,warranty:line.warranty,bundleSnapshot:line.bundleSnapshot})),
    subtotal: invoice.subtotal, discount: invoice.discount, rounding: invoice.rounding,
    total: invoice.total, paid: invoice.paid, due: invoice.due,
    payments:invoice.payments.map(payment=>({...payment})),
    method: invoice.payments.length > 1 ? 'Multiple' : invoice.method, dateTime: `${invoice.date}, ${invoice.time}`
  };
}

export function returnDocument(item: SalesReturn, language:UiLanguage='English + Bangla'): Report {
  const label=(english:string)=>documentLabel(language,english);
  const auditRows=(item.lineReturns??[]).map((line,index)=>{
    const units=line.unitQuantities
      ?Object.entries(line.unitQuantities).filter(([,quantity])=>Number(quantity)>0)
       .map(([unit,quantity])=>quantity+' '+unit).join(' ')
      :line.quantity+' '+(line.sourceBaseUnit??'');
    const original=line.historicalSourceAmountPaisa===undefined?line.amount:line.historicalSourceAmountPaisa/100;
    const agreed=line.agreedReturnAmountPaisa===undefined?line.amount:line.agreedReturnAmountPaisa/100;
    const adjust=line.priceDifferencePaisa===undefined?'':'; adjustment '+line.priceDifferencePaisa/100;
    const reason=line.adjustmentReason?'; reason '+line.adjustmentReason:'';
    return [label('Returned item')+' '+(index+1),line.invoiceId+'/'+line.lineId+' · '+units+
      '; historical '+original+'; agreed '+agreed+adjust+reason] as [string,string];
  });
  return {title:item.id,language,subtitle:label('Sales return source preview'),
    headers:[label('Field'),label('Value')],rows:[
    [label('Date'),item.date],[label('Customer'),item.customer],[label('Original invoices'),item.invoices.join(', ')],
    [label('Items'),item.items],...auditRows,
    ...(item.compensationExpensePaisa?[[label('Customer Compensation Expense'),item.compensationExpensePaisa/100],
      [label('Linked expense reference'),'EXP-'+item.id]]:[]),
    ...(item.negativeAdjustmentPaisa?[[label('Return Price Adjustment'),item.negativeAdjustmentPaisa/100]]:[]),
    [label('Return amount'),item.amount],[label('Settlement'),documentLabel(language,item.settlement)],
    [label('Refund method'),item.refundMethod ? documentMethod(language,item.refundMethod) : '—'],
    [label('Refund account'),item.refundAccount ?? '—']
  ]};
}
