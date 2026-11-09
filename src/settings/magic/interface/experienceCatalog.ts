import type { CapabilityDescriptor, PlanCode, PreviewActor, PreviewRoleId } from './experienceTypes';

export const CATALOG_VERSION = 1;

export const experienceModules = [
  { id: 'sales', label: 'Sales', labelBn: 'বিক্রয়', route: '/app/sales' },
  { id: 'parties', label: 'Party ledger', labelBn: 'পার্টি খাতা', route: '/app/parties' },
  { id: 'products', label: 'Products & stock', labelBn: 'পণ্য ও মজুত', route: '/app/products' },
  { id: 'purchases', label: 'Purchases & expenses', labelBn: 'ক্রয় ও খরচ', route: '/app/purchases' },
  { id: 'dashboard', label: 'Dashboard', labelBn: 'ড্যাশবোর্ড', route: '/app/dashboard' },
  { id: 'finance', label: 'Finance & daybook', labelBn: 'হিসাব ও দৈনিক খাতা', route: '/app/finance' },
] as const;

const both: CapabilityDescriptor['scopes'] = ['tenant', 'user'];
const bool = { kind: 'boolean' } as const;

/** Literal capability registry. Essential columns are a protected baseline and are not listed here. */
export const capabilityCatalog: CapabilityDescriptor[] = [
  // Sales
  { key: 'sales.links.customerLedger', module: 'sales', label: 'Customer name opens ledger', labelBn: 'গ্রাহকের নামে ক্লিক করলে খাতা খুলবে', minimumTier: 'CONNECTED', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: true, valueSchema: bool, group: 'links', helper: 'Jump from an invoice to the customer’s full ledger.', consumer: 'Sales › Invoice history › Customer cell', basicRoute: 'Parties & Ledger › search the customer' },
  { key: 'sales.actions.receivePayment', module: 'sales', label: 'Receive payment from an invoice', labelBn: 'বিল থেকে সরাসরি টাকা গ্রহণ', minimumTier: 'CONNECTED', defaultValue: true, domain: 'workflow', scopes: both, requires: [], implemented: true, valueSchema: bool, group: 'links', helper: 'Adds “Money in” to each due invoice and its detail window.', consumer: 'Sales › row actions + invoice detail', basicRoute: 'Sales › Receive payment (top of page)' },
  { key: 'sales.columns.paymentMethod', module: 'sales', label: 'Payment method', labelBn: 'পেমেন্ট মাধ্যম', minimumTier: 'CONNECTED', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: true, valueSchema: bool, group: 'columns', helper: 'Cash, bKash, Bank… or “Split” when more than one.', consumer: 'Sales › Invoice history › Payment column' },
  { key: 'sales.columns.items', module: 'sales', label: 'Items on the invoice', labelBn: 'বিলের পণ্য', minimumTier: 'RICH', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: true, valueSchema: bool, group: 'columns', helper: 'First items of each invoice, so you rarely need to open it.', consumer: 'Sales › Invoice history › Items column' },
  { key: 'sales.columns.paymentBreakdown', module: 'sales', label: 'Payment split', labelBn: 'পেমেন্ট ভাগ', minimumTier: 'RICH', defaultValue: false, domain: 'presentation', scopes: both, requires: ['sales.columns.paymentMethod'], implemented: true, valueSchema: bool, group: 'columns', helper: 'Each method and amount when a customer paid in parts.', advanced: true, consumer: 'Sales › Invoice history › Payment split column' },
  { key: 'sales.columns.profit', module: 'sales', label: 'Gross profit', labelBn: 'মোট লাভ', minimumTier: 'RICH', defaultValue: false, domain: 'presentation', scopes: both, requires: [], implemented: true, valueSchema: bool, sensitivePermission: 'view.profit', group: 'columns', helper: 'Profit per invoice where purchase cost is known.', advanced: true, consumer: 'Sales › Invoice history › Profit column' },
  // Party ledger
  { key: 'parties.links.invoice', module: 'parties', label: 'Reference opens the document', labelBn: 'রেফারেন্সে ক্লিক করলে বিল খুলবে', minimumTier: 'CONNECTED', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: true, valueSchema: bool, group: 'links', helper: 'Invoice, bill and receipt numbers open the original document.', consumer: 'Parties › Ledger › Particulars reference', basicRoute: 'Sales › search the invoice number' },
  { key: 'parties.ledger.items', module: 'parties', label: 'Item lines under each entry', labelBn: 'প্রতিটি এন্ট্রির পণ্য', minimumTier: 'RICH', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: true, valueSchema: bool, group: 'details', helper: 'Shows quantity and price for each item inside the ledger.', consumer: 'Parties › Ledger › Particulars' },
  { key: 'parties.ledger.expandedDetails', module: 'parties', label: 'Expandable rows', labelBn: 'বিস্তারিত দেখার সারি', minimumTier: 'RICH', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: true, valueSchema: bool, group: 'details', helper: 'Open a row to see method, attachment and balance change.', advanced: true, consumer: 'Parties › Ledger › row expansion' },
  { key: 'parties.ledger.directionIcons', module: 'parties', label: 'Money in / out arrows', labelBn: 'টাকা আসা/যাওয়ার চিহ্ন', minimumTier: 'RICH', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: true, valueSchema: bool, group: 'details', helper: 'Visual cue beside payments. Debit/credit stay readable without it.', advanced: true, consumer: 'Parties › Ledger › Debit/Credit cells' },
  // Products
  { key: 'products.columns.brand', module: 'products', label: 'Brand', labelBn: 'ব্র্যান্ড', minimumTier: 'CONNECTED', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: false, valueSchema: bool, group: 'columns', helper: 'Brand next to category.', consumer: 'Not in this preview (products have no brand field yet)' },
  { key: 'products.columns.stockValue', module: 'products', label: 'Stock value', labelBn: 'মজুতের মূল্য', minimumTier: 'RICH', defaultValue: false, domain: 'presentation', scopes: both, requires: [], implemented: true, valueSchema: bool, sensitivePermission: 'view.cost', group: 'columns', helper: 'Stock × purchase price for each product.', consumer: 'Products › table › Stock value column' },
  { key: 'products.links.stockHistory', module: 'products', label: 'Stock opens movement history', labelBn: 'মজুত ইতিহাস', minimumTier: 'CONNECTED', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: false, valueSchema: bool, group: 'links', helper: 'Product stock opens its movement history.', consumer: 'Not in this preview (no stock-movement screen yet)' },
  // Purchases
  { key: 'purchases.links.supplierLedger', module: 'purchases', label: 'Supplier name opens ledger', labelBn: 'সরবরাহকারীর নামে ক্লিক করলে খাতা খুলবে', minimumTier: 'CONNECTED', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: true, valueSchema: bool, group: 'links', helper: 'Supplier and payee names open their ledger.', consumer: 'Purchases › Supplier cell; Expenses › Paid to cell', basicRoute: 'Parties & Ledger › search the supplier' },
  // Not yet wired — kept in the registry, never advertised as live
  { key: 'dashboard.details.breakdowns', module: 'dashboard', label: 'Metric breakdowns', labelBn: 'মেট্রিক বিশ্লেষণ', minimumTier: 'RICH', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: false, valueSchema: bool, group: 'details', helper: 'Expanded optional metrics.', consumer: 'Not in this preview' },
  { key: 'finance.links.sourceDocument', module: 'finance', label: 'Entry opens its source', labelBn: 'মূল নথি খুলুন', minimumTier: 'CONNECTED', defaultValue: true, domain: 'presentation', scopes: both, requires: [], implemented: false, valueSchema: bool, group: 'links', helper: 'Optional shortcut from a finance entry to its source.', consumer: 'Not in this preview (Finance is a reference page)' },
];

/** Essential baseline columns stay fixed; optional ones follow the resolver. */
export const moduleColumns: Record<string, { essential: string[]; optional: { key: string; column: string; tablet: boolean }[] }> = {
  sales: {
    essential: ['Invoice', 'Customer', 'Date', 'Total', 'Paid', 'Due', 'Status'],
    optional: [
      { key: 'sales.columns.paymentMethod', column: 'Payment', tablet: true },
      { key: 'sales.columns.items', column: 'Items', tablet: false },
      { key: 'sales.columns.paymentBreakdown', column: 'Payment split', tablet: false },
      { key: 'sales.columns.profit', column: 'Profit', tablet: false },
    ],
  },
  products: {
    essential: ['Product', 'Category', 'Stock', 'Unit', 'Purchase', 'Selling', 'Status'],
    optional: [
      { key: 'products.columns.brand', column: 'Brand', tablet: true },
      { key: 'products.columns.stockValue', column: 'Stock value', tablet: false },
    ],
  },
  parties: { essential: ['Date', 'Particulars', 'Debit', 'Credit', 'Balance'], optional: [] },
  purchases: { essential: ['Bill', 'Supplier', 'Items', 'Receipt', 'Total', 'Paid', 'Due', 'Status'], optional: [] },
};

export const planCatalog: { code: PlanCode; label: string; ownerName: string; price: string; tierLabel: string; summary: string }[] = [
  { code: 'FREE', label: 'Free', ownerName: 'Basic', price: '৳0', tierLabel: 'Simple', summary: 'Simple screens with essential information.' },
  { code: 'COUNTER', label: 'Counter', ownerName: 'Counter', price: '৳199 / month', tierLabel: 'Simple + counter benefits', summary: 'Simple screens plus templates, batch print and barcodes.' },
  { code: 'PRO', label: 'Pro', ownerName: 'Medium', price: '৳399 / month', tierLabel: 'Connected', summary: 'Record links and quick actions between modules.' },
  { code: 'PLUS', label: 'Plus', ownerName: 'Premium', price: '৳599 / month', tierLabel: 'Connected + detailed', summary: 'Everything in Pro plus item, payment and value details.' },
];

export const previewActors: Record<PreviewRoleId, PreviewActor> = {
  owner: { roleId: 'owner', actorId: 'ST-01', name: 'Md. Anisur Rahman', roleLabel: 'Owner', permissions: ['view.profit', 'view.cost', 'settings.business', 'recovery.master', 'support.consent'] },
  cashier: { roleId: 'cashier', actorId: 'ST-02', name: 'Sabbir (Cashier)', roleLabel: 'Cashier', permissions: [] },
};

export const actorNameById = (id: string) => Object.values(previewActors).find((a) => a.actorId === id)?.name ?? id;
