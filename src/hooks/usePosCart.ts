import { useMemo, useState } from 'react';
import { products } from '../data/products';
import type { Party, PaymentMethod, Product } from '../types/erp';
import { priceFor } from '../utils/units';
import { roundTo } from '../utils/currency';

export type CartLine = {
  key: string;
  product: Product;
  qty: string;
  unit: string;
  price: string;
};

export type DiscountMode = 'amount' | 'percent';
export type PosPaymentMethod = Exclude<PaymentMethod, 'Customer Credit'>;

export type PosPaymentRow = {
  id: string;
  method: PosPaymentMethod;
  account: string;
  amount: string;
};

export type PosCustomerDetails = {
  name: string;
  phone: string;
  guardianName: string;
  address: string;
};

export const posPaymentAccountsByMethod: Record<PosPaymentMethod, string[]> = {
  Cash: ['Cash counter'],
  Bank: ['Dutch-Bangla Bank · 4582'],
  Card: ['Dutch-Bangla Bank · 4582'],
  bKash: ['bKash Business · 01711•••412'],
  Nagad: ['Nagad Merchant · 01819•••771']
};

let seq = 0;
const nextKey = () => `line-${++seq}`;

export function makePosPaymentRow(seedIndex = 0, method: PosPaymentMethod = 'Cash'): PosPaymentRow {
  return {
    id: `pos-pay-${Date.now()}-${seedIndex}`,
    method,
    account: posPaymentAccountsByMethod[method][0],
    amount: ''
  };
}

function line(product: Product, qty: number, unit?: string): CartLine {
  const u = unit ?? product.unit;
  return { key: nextKey(), product, qty: String(qty), unit: u, price: String(priceFor(product, u)) };
}

const byId = (id: string) => products.find((p) => p.id === id) as Product;

export const demoCart = (): CartLine[] => [
  line(byId('p1'), 4),
  line(byId('p2'), 2, 'Box'),
  line(byId('p5'), 3, 'Gauge')
];

const emptyCustomerDetails = (): PosCustomerDetails => ({
  name: '',
  phone: '',
  guardianName: '',
  address: ''
});

export function usePosCart() {
  const [lines, setLines] = useState<CartLine[]>(demoCart);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [discountMode, setDiscountMode] = useState<DiscountMode>('amount');
  const [discount, setDiscount] = useState('');
  const [payments, setPayments] = useState<PosPaymentRow[]>([makePosPaymentRow()]);
  const [customer, setCustomerState] = useState<Party | null>(null);
  const [customerDetails, setCustomerDetails] = useState<PosCustomerDetails>(emptyCustomerDetails);

  const setCustomer = (party: Party | null) => {
    setCustomerState(party);
    if (party) {
      setCustomerDetails({
        name: party.name,
        phone: party.phone,
        guardianName: '',
        address: party.area
      });
    } else {
      setCustomerDetails(emptyCustomerDetails());
    }
  };

  const addProduct = (product: Product) => {
    const existing = lines.find((l) => l.product.id === product.id && l.unit === product.unit);
    if (existing) {
      setLines((ls) =>
        ls.map((l) => l.key === existing.key ? { ...l, qty: String((parseFloat(l.qty) || 0) + 1) } : l)
      );
      setLastAdded(existing.key);
      return;
    }
    const l = line(product, 1);
    setLines((ls) => [...ls, l]);
    setLastAdded(l.key);
  };

  const updateLine = (key: string, patch: Partial<Pick<CartLine, 'qty' | 'unit' | 'price'>>) => {
    setLines((ls) =>
      ls.map((l) => {
        if (l.key !== key) return l;
        const next = { ...l, ...patch };
        if (patch.unit && patch.unit !== l.unit) next.price = String(priceFor(l.product, patch.unit));
        return next;
      })
    );
  };

  const removeLine = (key: string) => setLines((ls) => ls.filter((l) => l.key !== key));

  const reset = () => {
    setLines([]);
    setDiscount('');
    setPayments([makePosPaymentRow()]);
    setCustomerState(null);
    setCustomerDetails(emptyCustomerDetails());
  };

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + (parseFloat(l.qty) || 0) * (parseFloat(l.price) || 0), 0);
    const d = parseFloat(discount) || 0;
    const discountAmt = Math.min(subtotal, discountMode === 'percent' ? subtotal * d / 100 : d);
    const net = subtotal - discountAmt;
    const total = net > 0 ? roundTo(net, 5) : 0;
    const rounding = total - net;
    const paidNum = payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
    const due = Math.max(0, total - paidNum);
    const change = Math.max(0, paidNum - total);
    const itemCount = lines.length;
    return { subtotal, discountAmt, net, total, rounding, paidNum, due, change, itemCount };
  }, [lines, discount, discountMode, payments]);

  return {
    lines,
    setLines,
    lastAdded,
    addProduct,
    updateLine,
    removeLine,
    reset,
    discount,
    setDiscount,
    discountMode,
    setDiscountMode,
    payments,
    setPayments,
    customer,
    setCustomer,
    customerDetails,
    setCustomerDetails,
    totals
  };
}
