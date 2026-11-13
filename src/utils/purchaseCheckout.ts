import { roundInvoice, roundNewInvoice, type SalesSettings } from '../settings/model.ts';

export type PurchaseDiscountMode = 'amount' | 'percent';
export type PurchasePaymentAmount = { id: string; amount: string };

export function paymentRemainder(total: number, payments: PurchasePaymentAmount[], rowId: string): number {
  return Math.max(0, Math.round((total - payments
    .filter((payment) => payment.id !== rowId)
    .reduce((sum, payment) => sum + (Math.max(0, Number(payment.amount)) || 0), 0)) * 100) / 100);
}

export function calculatePurchaseCheckout(
  subtotal: number, discount: string, discountMode: PurchaseDiscountMode,
  rounding: SalesSettings['rounding'], payments: PurchasePaymentAmount[],
  historicalSource = false
) {
  const gross = Math.max(0, subtotal);
  const entered = Math.max(0, Number(discount) || 0);
  const discountAmt = Math.min(gross, discountMode === 'percent' ? gross * Math.min(entered, 100) / 100 : entered);
  const net = Math.max(0, gross - discountAmt);
  // Old posted purchases retain their frozen rounding rule; NEW checkouts use ৳1.
  const total = historicalSource ? roundInvoice(net, rounding) : roundNewInvoice(net);
  const paidNum = Math.round(payments.reduce((sum, payment) =>
    sum + (Math.max(0, Number(payment.amount)) || 0), 0) * 100) / 100;
  return {
    subtotal: gross,
    discountAmt,
    net,
    total,
    rounding: Math.round((total - net) * 100) / 100,
    roundingLabel: historicalSource && rounding === 'No rounding' ? 'Rounding (off)' :
      historicalSource && rounding === 'Nearest ৳5' ? 'Rounding (to ৳5)' : 'Rounding (to ৳1)',
    paidNum,
    due: Math.max(0, Math.round((total - paidNum) * 100) / 100),
    excess: Math.max(0, Math.round((paidNum - total) * 100) / 100)
  };
}
