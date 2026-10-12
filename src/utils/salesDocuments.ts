import type { SalesInvoice, SalesReturn } from '../types/erp';
import type { ReceiptPreviewProps } from '../components/brand/ReceiptPreview';
import type { Report } from './reportOutput';

export const invoiceQuantity = (line: SalesInvoice['lines'][number]) =>
  line.quantity.toLowerCase().includes(line.unit.toLowerCase()) ? line.quantity : `${line.quantity} ${line.unit}`;

export function invoiceReceipt(invoice: SalesInvoice): ReceiptPreviewProps {
  return {
    invoice: invoice.invoice, customer: invoice.party === 'Walk-in customer' ? undefined : invoice.party,
    customerPhone: invoice.phone, guardianName: invoice.guardianName, customerAddress: invoice.address,
    lines: invoice.lines.map(line => ({name:line.name,qty:invoiceQuantity(line),price:line.price,total:line.total,serials:line.serials,warranty:line.warranty})),
    subtotal: invoice.subtotal, discount: invoice.discount, rounding: invoice.rounding,
    total: invoice.total, paid: invoice.paid, due: invoice.due,
    method: invoice.payments.length > 1 ? 'Multiple' : invoice.method, dateTime: `${invoice.date}, ${invoice.time}`
  };
}

export function returnDocument(item: SalesReturn): Report {
  return {title:item.id,subtitle:'Sales return source preview',headers:['Field','Value'],rows:[
    ['Date',item.date],['Customer',item.customer],['Original invoices',item.invoices.join(', ')],
    ['Items',item.items],['Return amount',item.amount],['Settlement',item.settlement],
    ['Refund method',item.refundMethod ?? '—'],['Refund account',item.refundAccount ?? '—']
  ]};
}
