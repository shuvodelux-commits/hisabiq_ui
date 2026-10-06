export type UnitConversion = {
  /** Larger unit name, e.g. "Box" or "Gauge" */
  unit: string;
  /** How many base units are in one larger unit */
  factor: number;
  /** Optional explicit selling price for the larger unit */
  price?: number;
};

export type Product = {
  id: string;
  name: string;
  nameBn?: string;
  sku: string;
  category: string;
  image?: string;
  /** Base (smallest) unit, e.g. "Pcs", "Gira", "Kg" */
  unit: string;
  altUnit?: UnitConversion;
  /** Stock in base units */
  stock: number;
  minStock: number;
  sellPrice: number;
  purchasePrice: number;
  active: boolean;
};

export type PartyRole =
'Customer' |
'Supplier' |
'Vendor' |
'Lender' |
'Borrower' |
'Payee' |
'Owner';

export type Party = {
  id: string;
  name: string;
  nameBn?: string;
  roles: PartyRole[];
  phone: string;
  area: string;
  /** Positive = they owe us (receivable). Negative = we owe them (payable). */
  balance: number;
  lastActivity: string;
  avatarColor: string;
  image?: string;
};

export type LedgerEntryType = 'invoice' | 'payment' | 'purchase' | 'return' | 'note' | 'opening';

export type LedgerEntry = {
  id: string;
  partyId: string;
  date: string;
  type: LedgerEntryType;
  ref?: string;
  description: string;
  debit: number;
  credit: number;
  attachment?: {name: string;url?: string;};
};

export type PaymentMethod = 'Cash' | 'bKash' | 'Nagad' | 'Card' | 'Bank' | 'Customer Credit';

export type Sale = {
  id: string;
  invoice: string;
  date: string;
  time: string;
  party: string;
  items: number;
  total: number;
  paid: number;
  method: PaymentMethod;
};

export type SalePayment = {
  id: string;
  method: PaymentMethod;
  amount: number;
  account?: string;
};

export type SaleLine = {
  id: string;
  productId: string;
  name: string;
  /** Human-friendly sold quantity, e.g. "3 Box 2 Pcs". */
  quantity: string;
  /** Base unit used for return/refund calculations. */
  unit: string;
  /** Exact quantity available to return in the base unit. */
  returnableQuantity?: number;
  price: number;
  total: number;
  serials?: string[];
};

export type SalesInvoiceStatus = 'Paid' | 'Partial' | 'Due' | 'Part returned' | 'Returned';

export type SalesInvoice = Sale & {
  partyId?: string;
  phone?: string;
  guardianName?: string;
  address?: string;
  lines: SaleLine[];
  subtotal: number;
  discount: number;
  rounding: number;
  due: number;
  status: SalesInvoiceStatus;
  payments: SalePayment[];
  salesperson: string;
  note?: string;
};

export type SalesReturn = {
  id: string;
  date: string;
  customer: string;
  invoices: string[];
  items: string;
  amount: number;
  settlement: 'Adjust due' | 'Customer credit' | 'Cash refund';
};

export type SaleTemplate = {
  id: string;
  name: string;
  customer?: string;
  items: number;
  total: number;
  lastUsed: string;
};

export type CustomerCredit = {
  id: string;
  customerId?: string;
  customer: string;
  balance: number;
  source: string;
  updatedAt: string;
};

export type Purchase = {
  id: string;
  ref: string;
  date: string;
  supplierId: string;
  supplier: string;
  items: string;
  total: number;
  paid: number;
  receipt?: string;
};

export type Expense = {
  id: string;
  ref: string;
  date: string;
  category: string;
  payee: string;
  payeeId?: string;
  note: string;
  amount: number;
  paid: number;
  method: PaymentMethod;
  receipt?: string;
};

export type DashboardWidgetId =
'today-sales' |
'receivable' |
'payable' |
'cash' |
'gross-profit' |
'low-stock' |
'sales-trend' |
'cashflow' |
'recent-sales' |
'dues';

export type DashboardWidget = {
  id: DashboardWidgetId;
  label: string;
  labelBn: string;
  kind: 'metric' | 'panel';
  visible: boolean;
};