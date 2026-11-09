import type { ErpActivity, SetupStep, Tenant, TenantSettings } from '../types/saas';

const defaults: TenantSettings = { invoicePrefix: 'INV', language: 'English + Bangla', lockMinutes: 30, smsSender: '', allowNegativeStock: false, dueReminders: true };

const allSetup: Record<SetupStep, boolean> = { profile: true, invoice: true, product: true, openingStock: true, firstSale: true, firstPurchase: true, cashSession: true, moneyAccounts: true, team: true };
const setupUpTo = (done: SetupStep[]): Record<SetupStep, boolean> => Object.fromEntries((Object.keys(allSetup) as SetupStep[]).map((k) => [k, done.includes(k)])) as Record<SetupStep, boolean>;

const erp = (p: Partial<ErpActivity>): ErpActivity => ({
  productCount: 0, lastSaleAt: null, salesThisWeek: 0, salesLastWeek: 0, avgDailySales: 0, openCashSessions: 0, unreconciledAccounts: 0, negativeStock: 0, failedSms30d: 0,
  setup: allSetup, modules: {}, smsByEvent: {}, ...p,
});

const owner = (name: string, phone: string, lastSeen: string) => ({ id: 'M-1', name, role: 'Owner' as const, phone, status: 'Active' as const, lastSeen });

export const seedTenants: Tenant[] = [
  {
    id: 'T-1001', name: 'Nawabpur Hardware House', owner: 'Anisur Rahman', phone: '01711-234567', email: 'anis@nawabpurhw.com.bd', district: 'Dhaka', businessType: 'Hardware',
    planCode: 'PLUS', status: 'Active', account: 'Active', invite: 'Accepted', expiresAt: '2026-11-18', createdAt: '2025-12-02', lastActive: '2026-10-25T10:12:00+06:00', userLimit: 5,
    smsAvailable: 1340, smsReserved: 60, storageUsedMb: 2380, storageLimitMb: 10240, monthlyInvoices: 642,
    settings: { ...defaults, smsSender: 'NAWABPUR HW' },
    members: [
      owner('Anisur Rahman', '01711-234567', '2026-10-25T10:12:00+06:00'),
      { id: 'M-2', name: 'Rumana Akter', role: 'Manager', phone: '01819-445210', status: 'Active', lastSeen: '2026-10-25T09:40:00+06:00' },
      { id: 'M-3', name: 'Sabbir Hossain', role: 'Sales', phone: '01922-118803', status: 'Active', lastSeen: '2026-10-24T20:05:00+06:00' },
    ],
    erp: erp({
      productCount: 16420, lastSaleAt: '2026-10-25T10:05:00+06:00', salesThisWeek: 168, salesLastWeek: 152, avgDailySales: 24, openCashSessions: 1, unreconciledAccounts: 1, negativeStock: 3,
      failedSms30d: 4,
      modules: { pos: { uses30d: 640, locked: 0 }, sales: { uses30d: 410, locked: 0 }, quotations: { uses30d: 38, locked: 0 }, purchases: { uses30d: 96, locked: 0 }, products: { uses30d: 220, locked: 0 }, parties: { uses30d: 310, locked: 0 }, expenses: { uses30d: 44, locked: 0 }, finance: { uses30d: 60, locked: 0 }, accounts: { uses30d: 12, locked: 0 }, warranty: { uses30d: 0, locked: 0 }, reports: { uses30d: 85, locked: 0 } },
      smsByEvent: { dueReminder: 640, saleReceipt: 520, lowStock: 40, otp: 22, campaign: 60 },
    }),
    scheduledChange: null, reminders: [],
  },
  {
    id: 'T-1002', name: 'Rahman Hardware', owner: 'Mizanur Rahman', phone: '01712-556677', email: 'mizan.rahman@gmail.com', district: 'Narayanganj', businessType: 'Hardware',
    planCode: 'PRO', status: 'Active', account: 'Active', invite: 'Accepted', expiresAt: '2026-10-29', createdAt: '2026-03-11', lastActive: '2026-10-25T08:55:00+06:00', userLimit: 3,
    smsAvailable: 210, smsReserved: 0, storageUsedMb: 920, storageLimitMb: 5120, monthlyInvoices: 288,
    settings: { ...defaults, invoicePrefix: 'RH' },
    members: [owner('Mizanur Rahman', '01712-556677', '2026-10-25T08:55:00+06:00'), { id: 'M-2', name: 'Jewel Mia', role: 'Sales', phone: '01633-102938', status: 'Active', lastSeen: '2026-10-24T19:10:00+06:00' }],
    erp: erp({
      productCount: 8650, lastSaleAt: '2026-10-25T08:50:00+06:00', salesThisWeek: 71, salesLastWeek: 74, avgDailySales: 10, openCashSessions: 0, unreconciledAccounts: 0, negativeStock: 0,
      modules: { pos: { uses30d: 280, locked: 0 }, sales: { uses30d: 120, locked: 0 }, purchases: { uses30d: 40, locked: 0 }, products: { uses30d: 90, locked: 0 }, parties: { uses30d: 150, locked: 0 }, expenses: { uses30d: 18, locked: 0 }, finance: { uses30d: 0, locked: 0 }, reports: { uses30d: 22, locked: 0 }, warranty: { uses30d: 14, locked: 0 }, quotations: { uses30d: 0, locked: 0 } },
      smsByEvent: { dueReminder: 90 },
    }),
    scheduledChange: null, reminders: [],
  },
  {
    id: 'T-1003', name: 'Karim Traders', owner: 'Abdul Karim', phone: '01815-998877', email: 'karimtraders.ctg@gmail.com', district: 'Chattogram', businessType: 'Wholesale',
    planCode: 'COUNTER', status: 'Grace', account: 'Active', invite: 'Accepted', expiresAt: '2026-10-22', createdAt: '2026-01-20', lastActive: '2026-10-24T17:30:00+06:00', userLimit: 2,
    smsAvailable: 0, smsReserved: 0, storageUsedMb: 610, storageLimitMb: 2048, monthlyInvoices: 175,
    settings: { ...defaults },
    members: [owner('Abdul Karim', '01815-998877', '2026-10-24T17:30:00+06:00')],
    erp: erp({
      productCount: 1740, lastSaleAt: '2026-10-24T17:20:00+06:00', salesThisWeek: 30, salesLastWeek: 46, avgDailySales: 6, openCashSessions: 2, unreconciledAccounts: 2, negativeStock: 11, failedSms30d: 0,
      setup: setupUpTo(['profile', 'invoice', 'product', 'openingStock', 'firstSale', 'firstPurchase', 'cashSession']),
      modules: { pos: { uses30d: 160, locked: 0 }, sales: { uses30d: 40, locked: 0 }, purchases: { uses30d: 30, locked: 0 }, products: { uses30d: 60, locked: 0 }, parties: { uses30d: 70, locked: 0 }, reports: { uses30d: 9, locked: 6 }, quotations: { uses30d: 0, locked: 12 } },
    }),
    scheduledChange: null, reminders: [{ at: '2026-10-23T10:00:00+06:00', channel: 'SMS', template: 'Grace day 1', by: 'System' }],
  },
  {
    id: 'T-1004', name: 'Shapla Pharmacy', owner: 'Nasrin Akter', phone: '01556-778899', email: 'shapla.pharma@gmail.com', district: 'Rajshahi', businessType: 'Pharmacy',
    planCode: 'FREE', status: 'Active', account: 'Active', invite: 'Accepted', expiresAt: null, createdAt: '2026-09-28', lastActive: '2026-10-23T21:02:00+06:00', userLimit: 1,
    smsAvailable: 0, smsReserved: 0, storageUsedMb: 84, storageLimitMb: 512, monthlyInvoices: 96,
    settings: { ...defaults },
    members: [owner('Nasrin Akter', '01556-778899', '2026-10-23T21:02:00+06:00')],
    erp: erp({
      productCount: 462, lastSaleAt: '2026-10-23T20:58:00+06:00', salesThisWeek: 22, salesLastWeek: 25, avgDailySales: 4, negativeStock: 0,
      setup: setupUpTo(['profile', 'invoice', 'product', 'openingStock', 'firstSale', 'moneyAccounts']),
      modules: { pos: { uses30d: 96, locked: 0 }, products: { uses30d: 44, locked: 0 }, parties: { uses30d: 12, locked: 0 }, reports: { uses30d: 4, locked: 9 }, purchases: { uses30d: 0, locked: 0 } },
    }),
    scheduledChange: null, reminders: [],
  },
  {
    id: 'T-1005', name: 'Chittagong Electric Mart', owner: 'Faruk Hossain', phone: '01911-334455', email: 'faruk.cem@gmail.com', district: 'Chattogram', businessType: 'Electronics',
    planCode: 'PRO', status: 'Trial', account: 'Active', invite: 'Accepted', expiresAt: '2026-11-02', createdAt: '2026-10-19', lastActive: '2026-10-25T09:20:00+06:00', userLimit: 3,
    smsAvailable: 50, smsReserved: 0, storageUsedMb: 40, storageLimitMb: 5120, monthlyInvoices: 31,
    settings: { ...defaults, invoicePrefix: 'CEM' },
    members: [owner('Faruk Hossain', '01911-334455', '2026-10-25T09:20:00+06:00'), { id: 'M-2', name: 'Shila Rani', role: 'Sales', phone: '01744-998812', status: 'Active', lastSeen: '2026-10-24T18:44:00+06:00' }],
    erp: erp({
      productCount: 310, lastSaleAt: '2026-10-25T09:10:00+06:00', salesThisWeek: 24, salesLastWeek: 7, avgDailySales: 3,
      setup: setupUpTo(['profile', 'product', 'firstSale', 'team']),
      modules: { pos: { uses30d: 31, locked: 0 }, products: { uses30d: 40, locked: 0 }, sales: { uses30d: 6, locked: 0 }, warranty: { uses30d: 0, locked: 4 } },
    }),
    scheduledChange: null, reminders: [],
  },
  {
    id: 'T-1006', name: 'Sylhet Tiles & Sanitary', owner: 'Rubel Ahmed', phone: '01718-667788', email: 'rubel.tiles@gmail.com', district: 'Sylhet', businessType: 'Hardware',
    planCode: 'FREE', status: 'Expired', account: 'Active', invite: 'Accepted', expiresAt: '2026-10-10', createdAt: '2025-10-10', lastActive: '2026-10-21T12:15:00+06:00', userLimit: 1,
    smsAvailable: 120, smsReserved: 0, storageUsedMb: 1860, storageLimitMb: 512, monthlyInvoices: 0,
    settings: { ...defaults, smsSender: 'SYLHETTILES' },
    members: [owner('Rubel Ahmed', '01718-667788', '2026-10-21T12:15:00+06:00'), { id: 'M-2', name: 'Kamal Uddin', role: 'Manager', phone: '01822-556611', status: 'Disabled', lastSeen: '2026-10-09T16:00:00+06:00' }],
    erp: erp({
      productCount: 2310, lastSaleAt: '2026-10-19T13:00:00+06:00', salesThisWeek: 0, salesLastWeek: 12, avgDailySales: 9, openCashSessions: 1, unreconciledAccounts: 1,
      modules: { pos: { uses30d: 70, locked: 0 }, sales: { uses30d: 20, locked: 8 }, reports: { uses30d: 3, locked: 14 }, warranty: { uses30d: 18, locked: 0 } },
    }),
    scheduledChange: null, reminders: [{ at: '2026-10-11T10:00:00+06:00', channel: 'SMS', template: 'Plan ended', by: 'System' }],
    expiryNote: 'Plus ended 10 Oct 2026. Records are kept read-and-write on Free. Warranty (purchased) stays active until 31 Dec 2026. Extra users were paused.',
  },
  {
    id: 'T-1007', name: 'Bismillah Cloth Store', owner: 'Hasan Mahmud', phone: '01677-445566', email: 'bismillah.cloth@gmail.com', district: 'Khulna', businessType: 'Clothing',
    planCode: 'COUNTER', status: 'Active', account: 'Suspended', invite: 'Accepted', expiresAt: '2026-11-05', createdAt: '2026-05-14', lastActive: '2026-10-18T13:40:00+06:00', userLimit: 2,
    smsAvailable: 0, smsReserved: 0, storageUsedMb: 330, storageLimitMb: 2048, monthlyInvoices: 0,
    settings: { ...defaults },
    members: [owner('Hasan Mahmud', '01677-445566', '2026-10-18T13:40:00+06:00')],
    erp: erp({ productCount: 880, lastSaleAt: '2026-10-18T13:30:00+06:00', avgDailySales: 7, salesLastWeek: 18, modules: { pos: { uses30d: 90, locked: 0 }, products: { uses30d: 12, locked: 0 } } }),
    scheduledChange: null, reminders: [],
  },
  {
    id: 'T-1008', name: 'Mayer Doa Grocery', owner: 'Jahangir Alam', phone: '01755-120934', email: 'mayerdoa.grocery@gmail.com', district: 'Dhaka', businessType: 'Grocery',
    planCode: 'FREE', status: 'Active', account: 'Active', invite: 'Accepted', expiresAt: null, createdAt: '2026-06-02', lastActive: '2026-10-25T07:45:00+06:00', userLimit: 1,
    smsAvailable: 40, smsReserved: 0, storageUsedMb: 210, storageLimitMb: 512, monthlyInvoices: 940,
    settings: { ...defaults },
    members: [owner('Jahangir Alam', '01755-120934', '2026-10-25T07:45:00+06:00')],
    erp: erp({
      productCount: 471, lastSaleAt: '2026-10-25T07:40:00+06:00', salesThisWeek: 260, salesLastWeek: 231, avgDailySales: 34,
      setup: setupUpTo(['profile', 'invoice', 'product', 'openingStock', 'firstSale', 'firstPurchase', 'cashSession', 'moneyAccounts']),
      modules: { pos: { uses30d: 940, locked: 0 }, products: { uses30d: 60, locked: 0 }, parties: { uses30d: 210, locked: 0 }, purchases: { uses30d: 30, locked: 0 }, reports: { uses30d: 18, locked: 21 } },
      smsByEvent: { dueReminder: 60 },
    }),
    scheduledChange: null, reminders: [],
  },
  {
    id: 'T-1009', name: 'Lazz Pharma Point', owner: 'Dr. Sharmin Sultana', phone: '01733-889012', email: 'lazzpharmapoint@gmail.com', district: 'Gazipur', businessType: 'Pharmacy',
    planCode: 'PRO', status: 'Trial', account: 'Active', invite: 'Accepted', expiresAt: '2026-10-28', createdAt: '2026-10-14', lastActive: '2026-10-19T11:10:00+06:00', userLimit: 3,
    smsAvailable: 50, smsReserved: 0, storageUsedMb: 12, storageLimitMb: 5120, monthlyInvoices: 3,
    settings: { ...defaults },
    members: [owner('Dr. Sharmin Sultana', '01733-889012', '2026-10-19T11:10:00+06:00')],
    erp: erp({ productCount: 18, lastSaleAt: '2026-10-17T12:00:00+06:00', salesThisWeek: 0, salesLastWeek: 3, avgDailySales: 1, setup: setupUpTo(['profile', 'product']), modules: { products: { uses30d: 9, locked: 0 }, pos: { uses30d: 3, locked: 0 } } }),
    scheduledChange: null, reminders: [],
  },
  {
    id: 'T-1010', name: 'Digital Zone Electronics', owner: 'Sohel Rana', phone: '01821-447700', email: 'sohel.dz@gmail.com', district: 'Bogura', businessType: 'Electronics',
    planCode: 'COUNTER', status: 'Active', account: 'Active', invite: 'Accepted', expiresAt: '2026-11-21', createdAt: '2026-04-08', lastActive: '2026-10-25T10:00:00+06:00', userLimit: 2,
    smsAvailable: 380, smsReserved: 0, storageUsedMb: 760, storageLimitMb: 2048, monthlyInvoices: 312,
    settings: { ...defaults, invoicePrefix: 'DZ' },
    members: [owner('Sohel Rana', '01821-447700', '2026-10-25T10:00:00+06:00'), { id: 'M-2', name: 'Anika Tabassum', role: 'Sales', phone: '01988-221155', status: 'Active', lastSeen: '2026-10-25T09:55:00+06:00' }],
    erp: erp({
      productCount: 1830, lastSaleAt: '2026-10-25T09:58:00+06:00', salesThisWeek: 80, salesLastWeek: 76, avgDailySales: 11, negativeStock: 1,
      modules: { pos: { uses30d: 300, locked: 0 }, sales: { uses30d: 60, locked: 0 }, products: { uses30d: 120, locked: 0 }, parties: { uses30d: 90, locked: 0 }, purchases: { uses30d: 28, locked: 0 }, warranty: { uses30d: 0, locked: 26 }, reports: { uses30d: 15, locked: 5 } },
      smsByEvent: { saleReceipt: 240, dueReminder: 70 },
    }),
    scheduledChange: { kind: 'PLAN', planCode: 'PRO', at: '2026-11-21', by: 'Owner (self-serve)' }, reminders: [],
  },
  {
    id: 'T-1011', name: 'Padma Wholesale', owner: 'Golam Mostofa', phone: '01914-660021', email: 'padma.wholesale@gmail.com', district: 'Rajshahi', businessType: 'Wholesale',
    planCode: 'PLUS', status: 'Active', account: 'Active', invite: 'Accepted', expiresAt: '2026-11-01', createdAt: '2025-11-01', lastActive: '2026-10-25T09:00:00+06:00', userLimit: 5,
    smsAvailable: 90, smsReserved: 0, storageUsedMb: 3100, storageLimitMb: 10240, monthlyInvoices: 512,
    settings: { ...defaults, invoicePrefix: 'PW' },
    members: [
      owner('Golam Mostofa', '01914-660021', '2026-10-25T09:00:00+06:00'),
      { id: 'M-2', name: 'Rakib Hasan', role: 'Manager', phone: '01710-339922', status: 'Active', lastSeen: '2026-10-25T08:20:00+06:00' },
      { id: 'M-3', name: 'Mitu Akter', role: 'Sales', phone: '01611-998877', status: 'Active', lastSeen: '2026-10-24T19:00:00+06:00' },
      { id: 'M-4', name: 'Hridoy Das', role: 'Sales', phone: '01512-445566', status: 'Active', lastSeen: '2026-10-24T18:00:00+06:00' },
      { id: 'M-5', name: 'Sadia Islam', role: 'Viewer', phone: '01818-223344', status: 'Active', lastSeen: '2026-10-20T10:00:00+06:00' },
    ],
    erp: erp({
      productCount: 17100, lastSaleAt: '2026-10-25T08:55:00+06:00', salesThisWeek: 92, salesLastWeek: 140, avgDailySales: 19, unreconciledAccounts: 3, negativeStock: 6, failedSms30d: 12,
      modules: { pos: { uses30d: 210, locked: 0 }, sales: { uses30d: 300, locked: 0 }, quotations: { uses30d: 70, locked: 0 }, purchases: { uses30d: 110, locked: 0 }, products: { uses30d: 180, locked: 0 }, parties: { uses30d: 260, locked: 0 }, finance: { uses30d: 40, locked: 0 }, accounts: { uses30d: 0, locked: 0 }, warranty: { uses30d: 0, locked: 0 }, reports: { uses30d: 30, locked: 0 } },
      smsByEvent: { dueReminder: 410, saleReceipt: 120, lowStock: 30 },
    }),
    scheduledChange: { kind: 'CANCEL', at: '2026-11-01', by: 'Owner (self-serve)' }, reminders: [],
  },
  {
    id: 'T-1012', name: 'Fresh Mart Mirpur', owner: 'Tahmina Begum', phone: '01799-554433', email: 'freshmart.mirpur@gmail.com', district: 'Dhaka', businessType: 'Grocery',
    planCode: 'PRO', status: 'Trial', account: 'Provisioning', invite: 'Pending', expiresAt: '2026-11-08', createdAt: '2026-10-25', lastActive: '2026-10-25T09:30:00+06:00', userLimit: 3,
    smsAvailable: 0, smsReserved: 0, storageUsedMb: 0, storageLimitMb: 512, monthlyInvoices: 0,
    settings: { ...defaults },
    members: [owner('Tahmina Begum', '01799-554433', '2026-10-25T09:30:00+06:00')],
    erp: erp({ setup: setupUpTo([]) }),
    scheduledChange: null, reminders: [],
  },
];
