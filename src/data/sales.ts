import type { Sale, SalesInvoice, SalesReturn, SaleTemplate } from '../types/erp';

export const salesInvoices: SalesInvoice[] = [
  {
    id: 's241',
    invoice: 'INV-000241',
    date: '01 Oct 2026',
    time: '11:42 AM',
    party: 'Rahman Hardware',
    partyId: 'c1',
    phone: '01711-482093',
    guardianName: 'Md. Habib',
    address: '142 Nawabpur Road, Dhaka',
    items: 2,
    subtotal: 25550,
    discount: 0,
    rounding: 0,
    total: 25550,
    paid: 0,
    due: 25550,
    method: 'Cash',
    status: 'Due',
    payments: [],
    salesperson: 'Anis',
    note: 'Payment promised before 10 Oct.',
    lines: [
      { id: 'sl241-1', productId: 'p3', name: 'MS Angle 1.5" × 1.5"', quantity: '220', unit: 'Kg', price: 112, total: 24640 },
      { id: 'sl241-2', productId: 'p9', name: 'Teflon Tape', quantity: '3 Box 6 Pcs', unit: 'Pcs', price: 25, total: 910 }
    ]
  },
  {
    id: 's240',
    invoice: 'INV-000240',
    date: '01 Oct 2026',
    time: '11:05 AM',
    party: 'Walk-in customer',
    items: 3,
    subtotal: 1845,
    discount: 5,
    rounding: 0,
    total: 1840,
    paid: 1840,
    due: 0,
    method: 'Cash',
    status: 'Paid',
    payments: [{ id: 'pay240-1', method: 'Cash', amount: 1840 }],
    salesperson: 'Anis',
    lines: [
      { id: 'sl240-1', productId: 'p7', name: 'Gate Valve ¾"', quantity: '2', unit: 'Pcs', price: 650, total: 1300 },
      { id: 'sl240-2', productId: 'p10', name: 'Paint Brush 2"', quantity: '4', unit: 'Pcs', price: 60, total: 240 },
      { id: 'sl240-3', productId: 'p9', name: 'Teflon Tape', quantity: '12', unit: 'Pcs', price: 25, total: 300 }
    ]
  },
  {
    id: 's239',
    invoice: 'INV-000239',
    date: '01 Oct 2026',
    time: '10:31 AM',
    party: 'Nur Enterprise',
    partyId: 'c4',
    phone: '01815-660372',
    address: 'Keraniganj',
    items: 5,
    subtotal: 9620,
    discount: 0,
    rounding: 0,
    total: 9620,
    paid: 6000,
    due: 3620,
    method: 'bKash',
    status: 'Partial',
    payments: [
      { id: 'pay239-1', method: 'bKash', amount: 4000, account: 'Merchant 01811-000111' },
      { id: 'pay239-2', method: 'Cash', amount: 2000 }
    ],
    salesperson: 'Rafiq',
    lines: [
      { id: 'sl239-1', productId: 'p2', name: 'LED Bulb 12W', quantity: '3 Box 2 Pcs', unit: 'Pcs', price: 165, total: 5280 },
      { id: 'sl239-2', productId: 'p4', name: 'Electric Wire 1.5 rm', quantity: '1', unit: 'Coil', price: 2850, total: 2850 },
      { id: 'sl239-3', productId: 'p10', name: 'Paint Brush 2"', quantity: '1 Dozen', unit: 'Pcs', price: 55, total: 660 },
      { id: 'sl239-4', productId: 'p9', name: 'Teflon Tape', quantity: '1 Box', unit: 'Pcs', price: 23, total: 276 },
      { id: 'sl239-5', productId: 'p11', name: 'Door Hinge 4" (Pair)', quantity: '6', unit: 'Pair', price: 92.33, total: 554 }
    ]
  },
  {
    id: 's238',
    invoice: 'INV-000238',
    date: '01 Oct 2026',
    time: '09:15 AM',
    party: 'Hossain Electric',
    partyId: 'c2',
    phone: '01912-774310',
    address: 'Stadium Market, Dhaka',
    items: 1,
    subtotal: 3450,
    discount: 0,
    rounding: 0,
    total: 3450,
    paid: 0,
    due: 3450,
    method: 'Cash',
    status: 'Part returned',
    payments: [],
    salesperson: 'Anis',
    lines: [
      { id: 'sl238-1', productId: 'p2', name: 'LED Bulb 12W', quantity: '2 Box', unit: 'Pcs', price: 172.5, total: 3450, serials: ['LB12-3001', 'LB12-3002'] }
    ]
  },
  {
    id: 's237',
    invoice: 'INV-000237',
    date: '30 Sep 2026',
    time: '06:48 PM',
    party: 'Walk-in customer',
    items: 2,
    subtotal: 685,
    discount: 0,
    rounding: 0,
    total: 685,
    paid: 685,
    due: 0,
    method: 'Cash',
    status: 'Paid',
    payments: [{ id: 'pay237-1', method: 'Cash', amount: 685 }],
    salesperson: 'Rafiq',
    lines: [
      { id: 'sl237-1', productId: 'p10', name: 'Paint Brush 2"', quantity: '6', unit: 'Pcs', price: 60, total: 360 },
      { id: 'sl237-2', productId: 'p7', name: 'Gate Valve ¾"', quantity: '0.5', unit: 'Pcs', price: 650, total: 325 }
    ]
  },
  {
    id: 's236',
    invoice: 'INV-000236',
    date: '30 Sep 2026',
    time: '05:20 PM',
    party: 'Mim Construction',
    partyId: 'c3',
    phone: '01673-551920',
    address: 'Mirpur 10, Dhaka',
    items: 4,
    subtotal: 18200,
    discount: 0,
    rounding: 0,
    total: 18200,
    paid: 18200,
    due: 0,
    method: 'Bank',
    status: 'Paid',
    payments: [
      { id: 'pay236-1', method: 'Bank', amount: 15000, account: 'DBBL Current' },
      { id: 'pay236-2', method: 'Cash', amount: 3200 }
    ],
    salesperson: 'Anis',
    lines: [
      { id: 'sl236-1', productId: 'p8', name: 'Cement — Shah Special', quantity: '20', unit: 'Bag', price: 540, total: 10800 },
      { id: 'sl236-2', productId: 'p5', name: 'Wire Mesh Net 3 ft', quantity: '24 Gauge 8 Gira', unit: 'Gira', price: 12, total: 4704 },
      { id: 'sl236-3', productId: 'p7', name: 'Gate Valve ¾"', quantity: '3', unit: 'Pcs', price: 650, total: 1950 },
      { id: 'sl236-4', productId: 'p9', name: 'Teflon Tape', quantity: '3 Box', unit: 'Pcs', price: 20.72, total: 746 }
    ]
  }
];

export const recentSales: Sale[] = salesInvoices.map(({ id, invoice, date, time, party, items, total, paid, method }) => ({
  id,
  invoice,
  date: date.replace(' 2026', ''),
  time,
  party,
  items,
  total,
  paid,
  method
}));

export type SalesDraft = {
  id: string;
  label: string;
  customer?: string;
  items: number;
  total: number;
  savedAt: string;
};

export const salesDrafts: SalesDraft[] = [
  { id: 'd1', label: 'Draft #14', customer: 'Mim Construction', items: 6, total: 38450, savedAt: 'Today, 10:12 AM' },
  { id: 'd2', label: 'Draft #15', items: 2, total: 1240, savedAt: 'Today, 11:20 AM' },
  { id: 'd3', label: 'Draft #16', customer: 'Rahman Hardware', items: 4, total: 12680, savedAt: 'Yesterday, 5:42 PM' }
];

export const saleTemplates: SaleTemplate[] = [
  { id: 't1', name: 'Monthly site supply', customer: 'Mim Construction', items: 7, total: 42800, lastUsed: '28 Sep 2026' },
  { id: 't2', name: 'Electric shop restock', customer: 'Nur Enterprise', items: 5, total: 9680, lastUsed: '26 Sep 2026' },
  { id: 't3', name: 'Counter fast sale', items: 3, total: 1840, lastUsed: '01 Oct 2026' }
];

export const salesReturns: SalesReturn[] = [
  {
    id: 'RTN-000014',
    date: '01 Oct 2026',
    customer: 'Hossain Electric',
    invoices: ['INV-000238'],
    items: 'LED Bulb 12W · 2 Pcs',
    amount: 345,
    settlement: 'Adjust due'
  },
  {
    id: 'RTN-000013',
    date: '29 Sep 2026',
    customer: 'Rahman Hardware',
    invoices: ['INV-000221', 'INV-000198'],
    items: 'Gate Valve ¾" · 2 Pcs, Teflon Tape · 1 Box',
    amount: 1580,
    settlement: 'Customer credit'
  },
  {
    id: 'RTN-000012',
    date: '24 Sep 2026',
    customer: 'Walk-in customer',
    invoices: ['INV-000210'],
    items: 'Paint Brush 2" · 1 Pcs',
    amount: 60,
    settlement: 'Cash refund'
  }
];
