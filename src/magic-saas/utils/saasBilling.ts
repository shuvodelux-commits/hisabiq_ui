import type { PaymentOrder, PlatformSettings, StatementLine } from '../types/saas';
import { NOW, addDays } from './saas';

export type InvoiceStatus = 'Issued' | 'Proof submitted' | 'Part paid' | 'Overdue' | 'Paid' | 'Refunded' | 'Voided';

export const dueDate = (o: PaymentOrder) => addDays(o.createdAt, 3);

export function invoiceStatus(o: PaymentOrder): InvoiceStatus {
  if (o.state === 'VOIDED') return 'Voided';
  if (o.state === 'REFUNDED') return 'Refunded';
  if (o.state === 'ACTIVATION_PENDING' || o.state === 'COMPLETED' || o.state === 'REFUND_PENDING') return 'Paid';
  if (o.state === 'VERIFICATION_PENDING') return 'Proof submitted';
  if ((o.paidAmount ?? 0) > 0) return 'Part paid';
  return dueDate(o) < NOW ? 'Overdue' : 'Issued';
}

export const invoiceTone: Record<InvoiceStatus, 'neutral' | 'warning' | 'danger' | 'success' | 'ink' | 'info'> = {
  Issued: 'neutral',
  'Proof submitted': 'info',
  'Part paid': 'warning',
  Overdue: 'danger',
  Paid: 'success',
  Refunded: 'ink',
  Voided: 'ink',
};

export function invoiceKind(o: PaymentOrder): string {
  return o.kind === 'SUBSCRIPTION' ? 'Subscription' : o.kind === 'SMS' ? 'SMS' : o.kind === 'SERVICE' ? 'Service' : 'Other · add-on';
}

export const balanceDue = (o: PaymentOrder) => (o.state === 'PAYMENT_PENDING' || o.state === 'VERIFICATION_PENDING' || o.state === 'FAILED' ? o.total - (o.paidAmount ?? 0) : 0);

export type Check = { level: 'ok' | 'warning' | 'error'; text: string };

/** Bangladesh mobile-money and bank checks against the HisabIQ collection statement. */
export function paymentChecks(o: PaymentOrder, statement: StatementLine[], orders: PaymentOrder[], settings: PlatformSettings): { checks: Check[]; line: StatementLine | null } {
  const checks: Check[] = [];
  const line = statement.find((l) => l.trx === o.reference) ?? null;
  if (!o.reference) checks.push({ level: 'error', text: 'No transaction ID submitted yet.' });
  else if (!line) checks.push({ level: 'error', text: `TRX ${o.reference} not found in any HisabIQ collection statement. The owner may have paid a different number.` });
  else {
    const account = settings.collectionAccounts.find((a) => a.number === line.account);
    checks.push({ level: 'ok', text: `Found in ${account?.label ?? line.method} (${line.account}) at ${line.at.slice(11, 16)}.` });
    if (line.method !== o.method) checks.push({ level: 'error', text: `Paid by ${line.method}, but the invoice says ${o.method}.` });
    const due = o.total - (o.paidAmount ?? 0);
    if (line.amount < due) checks.push({ level: 'warning', text: `Received ৳${line.amount}, invoice balance is ৳${due}. Only a part payment — benefits stay off.` });
    else if (line.amount > due) checks.push({ level: 'warning', text: `Received ৳${line.amount}, more than the ৳${due} due. Refund or credit the difference.` });
    else checks.push({ level: 'ok', text: `Amount ৳${line.amount} matches.` });
    if (o.payer && line.sender !== o.payer) checks.push({ level: 'warning', text: `Sent from ${line.sender}, owner said ${o.payer}. Confirm with the owner.` });
    else if (o.payer) checks.push({ level: 'ok', text: `Sender ${line.sender} matches.` });
  }
  const used = orders.find((x) => x.id !== o.id && x.reference && x.reference === o.reference && x.method === o.method && ['ACTIVATION_PENDING', 'COMPLETED', 'REFUND_PENDING', 'REFUNDED'].includes(x.state));
  if (used) checks.push({ level: 'error', text: `TRX already used for ${used.id}. Reject and ask for the correct transaction.` });
  else {
    const twin = orders.find((x) => x.id !== o.id && x.reference && x.reference === o.reference && x.method === o.method && x.state === 'VERIFICATION_PENDING');
    if (twin) checks.push({ level: 'warning', text: `Same TRX also submitted on ${twin.id}. Only one can be verified.` });
  }
  if (o.evidence && !line) checks.push({ level: 'warning', text: 'Screenshot attached, but a screenshot alone never proves payment.' });
  return { checks, line };
}
