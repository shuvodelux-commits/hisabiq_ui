import {posMoney} from './posCheckoutValidation.ts';

/** Sales and POS must interpret the entire money input, never a parseFloat prefix. */
export function salesPaymentTotal(rows: readonly {amount: string}[]): number {
  if (!rows.length) return NaN;
  const values = rows.map(row => posMoney(row.amount));
  if (values.some(value => !Number.isFinite(value) || value < 0)) return NaN;
  const paisa = values.reduce((sum, value) => sum + Math.round(value * 100), 0);
  return Number.isSafeInteger(paisa) ? paisa / 100 : NaN;
}

export function positiveSalesAmount(raw: string): number {
  const amount = posMoney(raw);
  return Number.isFinite(amount) && amount > 0 ? amount : NaN;
}
