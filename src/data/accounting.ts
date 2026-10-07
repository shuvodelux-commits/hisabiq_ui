export type AccountingGroup = 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
export type VoucherType = 'Receipt' | 'Payment' | 'Contra' | 'Journal';

export type AccountingAccount = {
  id: string;
  code: string;
  name: string;
  nameBn: string;
  group: AccountingGroup;
  parent: string;
  debit: number;
  credit: number;
  active: boolean;
};

export type VoucherLine = {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
};

export type AccountingVoucher = {
  id: string;
  date: string;
  type: VoucherType;
  reference?: string;
  narration: string;
  source: string;
  status: 'Posted' | 'Draft' | 'Reversed';
  createdBy: string;
  lines: VoucherLine[];
};

export const accountingAccounts: AccountingAccount[] = [
  { id: 'a-cash', code: '1010', name: 'Cash in Hand', nameBn: 'নগদ টাকা', group: 'Asset', parent: 'Cash & Bank', debit: 48250, credit: 0, active: true },
  { id: 'a-bank', code: '1020', name: 'Bank Accounts', nameBn: 'ব্যাংক হিসাব', group: 'Asset', parent: 'Cash & Bank', debit: 301150, credit: 0, active: true },
  { id: 'a-mfs', code: '1030', name: 'Mobile Financial Services', nameBn: 'মোবাইল ব্যাংকিং', group: 'Asset', parent: 'Cash & Bank', debit: 52200, credit: 0, active: true },
  { id: 'a-ar', code: '1100', name: 'Accounts Receivable', nameBn: 'গ্রাহকের বাকি', group: 'Asset', parent: 'Current Assets', debit: 32640, credit: 0, active: true },
  { id: 'a-inventory', code: '1200', name: 'Inventory', nameBn: 'মজুদ পণ্য', group: 'Asset', parent: 'Current Assets', debit: 534800, credit: 0, active: true },
  { id: 'a-borrower', code: '1300', name: 'Borrower Receivable', nameBn: 'ধার দেওয়া টাকা', group: 'Asset', parent: 'Other Receivables', debit: 15000, credit: 0, active: true },
  { id: 'a-ap', code: '2010', name: 'Accounts Payable', nameBn: 'সাপ্লায়ারের পাওনা', group: 'Liability', parent: 'Current Liabilities', debit: 0, credit: 184250, active: true },
  { id: 'a-loan', code: '2100', name: 'Loans Payable', nameBn: 'ঋণ / ধার', group: 'Liability', parent: 'Borrowings', debit: 0, credit: 60000, active: true },
  { id: 'a-vat', code: '2200', name: 'VAT / Tax Payable', nameBn: 'ভ্যাট / ট্যাক্স প্রদেয়', group: 'Liability', parent: 'Statutory Dues', debit: 0, credit: 12400, active: true },
  { id: 'a-capital', code: '3010', name: 'Owner Capital', nameBn: 'মালিকের মূলধন', group: 'Equity', parent: 'Equity', debit: 0, credit: 325000, active: true },
  { id: 'a-drawings', code: '3020', name: 'Owner Drawings', nameBn: 'মালিকের উত্তোলন', group: 'Equity', parent: 'Equity', debit: 22000, credit: 0, active: true },
  { id: 'a-sales', code: '4010', name: 'Sales Revenue', nameBn: 'বিক্রয় আয়', group: 'Income', parent: 'Revenue', debit: 0, credit: 59160, active: true },
  { id: 'a-other-income', code: '4020', name: 'Other Income', nameBn: 'অন্যান্য আয়', group: 'Income', parent: 'Revenue', debit: 0, credit: 3200, active: true },
  { id: 'a-cogs', code: '5010', name: 'Cost of Goods Sold', nameBn: 'বিক্রীত পণ্যের খরচ', group: 'Expense', parent: 'Direct Cost', debit: 43280, credit: 0, active: true },
  { id: 'a-rent', code: '6010', name: 'Shop Rent', nameBn: 'দোকান ভাড়া', group: 'Expense', parent: 'Operating Expenses', debit: 18000, credit: 0, active: true },
  { id: 'a-salary', code: '6020', name: 'Salary & Wages', nameBn: 'বেতন ও মজুরি', group: 'Expense', parent: 'Operating Expenses', debit: 14500, credit: 0, active: true },
  { id: 'a-utility', code: '6030', name: 'Electricity & Utility', nameBn: 'বিদ্যুৎ ও ইউটিলিটি', group: 'Expense', parent: 'Operating Expenses', debit: 4650, credit: 0, active: true },
  { id: 'a-transport', code: '6040', name: 'Transport & Delivery', nameBn: 'পরিবহন ও ডেলিভারি', group: 'Expense', parent: 'Operating Expenses', debit: 3850, credit: 0, active: true },
  { id: 'a-discount', code: '6050', name: 'Sales Discount', nameBn: 'বিক্রয় ছাড়', group: 'Expense', parent: 'Selling Expenses', debit: 1250, credit: 0, active: true }
];

export const accountingVouchers: AccountingVoucher[] = [
  {
    id: 'RV-000184', date: '07 Oct 2026', type: 'Receipt', reference: 'INV-000241',
    narration: 'Customer payment received from Rahman Hardware', source: 'Sales', status: 'Posted', createdBy: 'Anis',
    lines: [
      { id: 'vl-1', accountId: 'a-bank', debit: 15000, credit: 0 },
      { id: 'vl-2', accountId: 'a-ar', debit: 0, credit: 15000 }
    ]
  },
  {
    id: 'PV-000121', date: '07 Oct 2026', type: 'Payment', reference: 'PUR-000088',
    narration: 'Supplier payment to Karim Traders', source: 'Purchases', status: 'Posted', createdBy: 'Anis',
    lines: [
      { id: 'vl-3', accountId: 'a-ap', debit: 12000, credit: 0 },
      { id: 'vl-4', accountId: 'a-bank', debit: 0, credit: 12000 }
    ]
  },
  {
    id: 'CV-000041', date: '06 Oct 2026', type: 'Contra', reference: 'TRF-000041',
    narration: 'Cash deposited to Dutch-Bangla Bank', source: 'Finance', status: 'Posted', createdBy: 'Anis',
    lines: [
      { id: 'vl-5', accountId: 'a-bank', debit: 25000, credit: 0 },
      { id: 'vl-6', accountId: 'a-cash', debit: 0, credit: 25000 }
    ]
  },
  {
    id: 'JV-000019', date: '06 Oct 2026', type: 'Journal', reference: 'ADJ-1006',
    narration: 'Month-end utility accrual adjustment', source: 'Accounts', status: 'Posted', createdBy: 'Rafiq',
    lines: [
      { id: 'vl-7', accountId: 'a-utility', debit: 1650, credit: 0 },
      { id: 'vl-8', accountId: 'a-ap', debit: 0, credit: 1650 }
    ]
  },
  {
    id: 'PV-000120', date: '05 Oct 2026', type: 'Payment', reference: 'EXP-000229',
    narration: 'Shop electricity bill paid from bKash', source: 'Expenses', status: 'Posted', createdBy: 'Anis',
    lines: [
      { id: 'vl-9', accountId: 'a-utility', debit: 3000, credit: 0 },
      { id: 'vl-10', accountId: 'a-mfs', debit: 0, credit: 3000 }
    ]
  },
  {
    id: 'RV-000183', date: '05 Oct 2026', type: 'Receipt', reference: 'FIN-000188',
    narration: 'Additional owner capital deposited to bank', source: 'Finance', status: 'Posted', createdBy: 'Anis',
    lines: [
      { id: 'vl-11', accountId: 'a-bank', debit: 50000, credit: 0 },
      { id: 'vl-12', accountId: 'a-capital', debit: 0, credit: 50000 }
    ]
  }
];
