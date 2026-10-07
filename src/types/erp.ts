export type ProductKind = 'Stock' | 'Service';
export type WarrantyDurationUnit = 'Days' | 'Months' | 'Years';
export type WarrantyType = 'Seller' | 'Manufacturer' | 'Service' | 'Replacement';
export type SerialTrackingMode = 'Off' | 'Optional' | 'Required';
export type StockAllocationMethod = 'FIFO' | 'FEFO';

export type ProductWarranty = {
  enabled: boolean;
  duration?: number;
  durationUnit?: WarrantyDurationUnit;
  type?: WarrantyType;
  terms?: string;
};

export type WarrantySnapshot = {
  duration: number;
  durationUnit: WarrantyDurationUnit;
  type: WarrantyType;
  terms?: string;
};

export type ProductExpirySettings = {
  enabled: boolean;
  dateRequired: boolean;
  warningDays: number;
  allocationMethod: StockAllocationMethod;
};

export type OfferDiscountType = 'Percentage' | 'Fixed';
export type ProductOfferStatus = 'Scheduled' | 'Active' | 'Expired' | 'Disabled';

export type ProductOffer = {
  id: string;
  productId: string;
  discountType: OfferDiscountType;
  value: number;
  priceUnit: string;
  startAt: string;
  endAt: string;
  enabled: boolean;
};

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
  kind?: ProductKind;
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
  warranty?: ProductWarranty;
  serialTracking?: SerialTrackingMode;
  expiry?: ProductExpirySettings;
  active: boolean;
};

export type StockLot = {
  id: string;
  productId: string;
  label: string;
  receivedAt: string;
  quantity: number;
  available: number;
  unitCost: number;
  source: 'Opening' | 'Purchase' | 'Adjustment' | 'Return';
  reference?: string;
  batchNumber?: string;
  manufactureDate?: string;
  expiryDate?: string;
  serials?: string[];
  warranty?: WarrantySnapshot;
  lotAllocations?: Array<{ lotId: string; quantity: number }>;
};

export type StockMovementType = 'Opening' | 'Purchase' | 'Sale' | 'Return' | 'Adjustment';

export type StockMovement = {
  id: string;
  productId: string;
  date: string;
  type: StockMovementType;
  quantity: number;
  balance: number;
  reference?: string;
  note?: string;
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

export type PaymentSplit = {
  id: string;
  method: PaymentMethod;
  amount: number;
  account?: string;
};

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

export type SalePayment = PaymentSplit;

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
  refundMethod?: Exclude<PaymentMethod, 'Customer Credit'>;
  refundAccount?: string;
};

export type SalePresetLine = {
  productId: string;
  qty: string;
  secondaryQty?: string;
  unit: string;
  price: number;
};

export type SaleTemplate = {
  id: string;
  name: string;
  customer?: string;
  items: number;
  total: number;
  lastUsed: string;
  lines: SalePresetLine[];
};

export type CustomerCredit = {
  id: string;
  customerId?: string;
  customer: string;
  balance: number;
  source: string;
  updatedAt: string;
};

export type PurchaseInventoryLine = {
  productId: string;
  quantity: number;
  serials?: string[];
  batchNumber?: string;
  manufactureDate?: string;
  expiryDate?: string;
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
  payments?: PaymentSplit[];
  receipt?: string;
  inventoryLines?: PurchaseInventoryLine[];
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
  payments?: PaymentSplit[];
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

export type WarrantyStatus =
  | 'Received'
  | 'Checking'
  | 'Sent to supplier'
  | 'Waiting supplier'
  | 'Received from supplier'
  | 'Ready for customer'
  | 'Resolved'
  | 'Rejected';

export type WarrantyRoute = 'In-house' | 'Supplier' | 'Manufacturer';

export type WarrantyEvent = {
  id: string;
  date: string;
  title: string;
  note?: string;
};

export type WarrantyReplacement = {
  product: string;
  serial?: string;
  givenAt: string;
  returnedAt?: string;
};

export type WarrantyCase = {
  id: string;
  receivedAt: string;
  customer: string;
  customerId?: string;
  phone?: string;
  invoice: string;
  productId: string;
  product: string;
  serial?: string;
  issue: string;
  status: WarrantyStatus;
  route: WarrantyRoute;
  supplier?: string;
  supplierRef?: string;
  expectedDate?: string;
  resolution?: 'Repair' | 'Replace' | 'Refund' | 'Rejected';
  finalReplacement?: {
    product: string;
    serial?: string;
  };
  replacement?: WarrantyReplacement;
  note?: string;
  events: WarrantyEvent[];
};


export type ReconciliationAccount = {
  id: string;
  name: string;
  type: 'Bank' | 'Mobile Banking' | 'Cash';
  balance: number;
  detail?: string;
};

export type ReconciliationStatus = 'Matched' | 'Review' | 'Unmatched' | 'Ignored';

export type StatementTransaction = {
  id: string;
  accountId: string;
  date: string;
  description: string;
  reference?: string;
  amount: number;
  direction: 'in' | 'out';
  status: ReconciliationStatus;
  suggestedErpId?: string;
  matchedErpId?: string;
  confidence?: number;
};

export type ErpReconciliationTransaction = {
  id: string;
  accountId: string;
  date: string;
  type: 'Sale payment' | 'Purchase payment' | 'Expense' | 'Transfer' | 'Customer payment' | 'Other';
  party: string;
  partyId?: string;
  reference: string;
  amount: number;
  direction: 'in' | 'out';
};

export type ReconciliationHistory = {
  id: string;
  accountId: string;
  accountName: string;
  period: string;
  statementFile: string;
  statementClosing: number;
  erpClosing: number;
  matched: number;
  review: number;
  status: 'Completed' | 'In progress';
};
