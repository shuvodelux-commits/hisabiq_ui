import type { Announcement, Article, DataRequest, MessageTemplate, Nudge, PlatformSettings, ServiceOrder, Ticket } from '../types/saas';
import type { SetupStep, ErpModule, SmsEvent, BusinessType } from '../types/saas';

export const seedTickets: Ticket[] = [
  {
    id: 'TCK-1044', tenantId: 'T-1009', subject: 'How do I add opening stock for medicines with expiry?', priority: 'Normal', status: 'Open', assignee: '', channel: 'WhatsApp',
    createdAt: '2026-10-25T08:10:00+06:00', updatedAt: '2026-10-25T08:10:00+06:00', slaDueAt: '2026-10-25T12:10:00+06:00',
    replies: [{ id: 'R-1', at: '2026-10-25T08:10:00+06:00', by: 'Dr. Sharmin Sultana', kind: 'owner', text: 'আমি ঔষধের মেয়াদসহ ওপেনিং স্টক কীভাবে দিব? ট্রায়াল শেষ হওয়ার আগে সেটআপ করতে চাই।' }],
  },
  {
    id: 'TCK-1042', tenantId: 'T-1001', subject: 'Sales staff can’t open customer ledger from invoice', priority: 'Normal', status: 'Open', assignee: 'Rafiq Islam', channel: 'In-app',
    createdAt: '2026-10-25T09:30:00+06:00', updatedAt: '2026-10-25T09:50:00+06:00', slaDueAt: '2026-10-25T17:30:00+06:00',
    replies: [
      { id: 'R-1', at: '2026-10-25T09:30:00+06:00', by: 'Anisur Rahman', kind: 'owner', text: 'Sabbir can’t click the customer name on invoices.' },
      { id: 'R-2', at: '2026-10-25T09:48:00+06:00', by: 'Rafiq Islam', kind: 'internal', text: 'Record links are off for Sales role. Needs owner consent — sent SA-77.' },
      { id: 'R-3', at: '2026-10-25T09:50:00+06:00', by: 'Rafiq Islam', kind: 'public', text: 'We’ve sent you a one-time approval in Settings › Support. Approve it and Sabbir will see the links.' },
    ],
  },
  {
    id: 'TCK-1039', tenantId: 'T-1002', subject: 'bKash payment sent, plan not renewed', priority: 'High', status: 'Open', assignee: 'Tania Sultana', channel: 'Phone',
    createdAt: '2026-10-25T09:08:00+06:00', updatedAt: '2026-10-25T09:10:00+06:00', slaDueAt: '2026-10-25T10:08:00+06:00',
    replies: [{ id: 'R-1', at: '2026-10-25T09:08:00+06:00', by: 'Mizanur Rahman', kind: 'owner', text: 'Paid ৳319 by bKash this morning, still shows expiring on 29 Oct.' }],
  },
  {
    id: 'TCK-1036', tenantId: 'T-1011', subject: 'Due reminder SMS not reaching customers', priority: 'High', status: 'Open', assignee: 'Shakil Hasan', channel: 'Phone',
    createdAt: '2026-10-25T07:30:00+06:00', updatedAt: '2026-10-25T07:45:00+06:00', slaDueAt: '2026-10-25T11:30:00+06:00',
    replies: [
      { id: 'R-1', at: '2026-10-25T07:30:00+06:00', by: 'Golam Mostofa', kind: 'owner', text: 'Customers say they did not get due reminders today.' },
      { id: 'R-2', at: '2026-10-25T07:45:00+06:00', by: 'Shakil Hasan', kind: 'internal', text: 'Alpha SMS degraded. 2 failed — ask Messaging to retry via SSL.' },
    ],
  },
  {
    id: 'TCK-1031', tenantId: 'T-1003', subject: 'Invoice prefix should be KT', priority: 'Low', status: 'Waiting', assignee: 'Rafiq Islam', channel: 'In-app',
    createdAt: '2026-10-22T13:40:00+06:00', updatedAt: '2026-10-25T10:20:00+06:00', slaDueAt: '2026-10-26T13:40:00+06:00',
    replies: [{ id: 'R-1', at: '2026-10-22T13:40:00+06:00', by: 'Abdul Karim', kind: 'owner', text: 'Please change invoice numbers to start with KT.' }],
  },
  {
    id: 'TCK-1020', tenantId: 'T-1006', subject: 'What happens to my data after Plus ends?', priority: 'Normal', status: 'Resolved', assignee: 'Rafiq Islam', channel: 'In-app',
    createdAt: '2026-10-11T10:00:00+06:00', updatedAt: '2026-10-11T11:00:00+06:00', slaDueAt: '2026-10-11T18:00:00+06:00',
    replies: [
      { id: 'R-1', at: '2026-10-11T10:00:00+06:00', by: 'Rubel Ahmed', kind: 'owner', text: 'Will I lose my sales history?' },
      { id: 'R-2', at: '2026-10-11T11:00:00+06:00', by: 'Rafiq Islam', kind: 'public', text: 'No. Every record stays. You are on Free now; renew any time to get Plus screens back.' },
    ],
  },
];

export const seedServices: ServiceOrder[] = [
  { id: 'SV-118', tenantId: 'T-1009', title: 'Guided setup call', packageId: 'PKG-SVC-CALL', quoteBdt: 399, state: 'REQUESTED', assignee: '', scheduledAt: null, requestedAt: '2026-10-25T08:20:00+06:00', notes: 'Pharmacy — needs expiry & FEFO setup before trial ends 28 Oct.' },
  { id: 'SV-117', tenantId: 'T-1005', title: 'Data import', packageId: 'PKG-SVC-IMPORT', quoteBdt: 999, state: 'QUOTED', assignee: 'Sumaiya Akter', scheduledAt: null, requestedAt: '2026-10-23T12:00:00+06:00', notes: '1,200 electronics SKUs with serial numbers in Excel.' },
  { id: 'SV-115', tenantId: 'T-1001', title: 'Full onboarding (new branch staff)', packageId: 'PKG-SVC-FULL', quoteBdt: 2500, state: 'SCHEDULED', assignee: 'Sumaiya Akter', scheduledAt: '2026-10-27T11:00:00+06:00', requestedAt: '2026-10-18T10:00:00+06:00', notes: 'Train 2 new sales staff on POS and returns.' },
  { id: 'SV-110', tenantId: 'T-1008', title: 'Data import', packageId: 'PKG-SVC-IMPORT', quoteBdt: 999, state: 'IN_PROGRESS', assignee: 'Sumaiya Akter', scheduledAt: '2026-10-24T15:00:00+06:00', requestedAt: '2026-10-15T10:00:00+06:00', notes: 'Grocery items with multi-unit (carton/piece).' },
  { id: 'SV-102', tenantId: 'T-1004', title: 'Data import', packageId: 'PKG-SVC-IMPORT', quoteBdt: 999, state: 'COMPLETED', assignee: 'Sumaiya Akter', scheduledAt: '2026-10-03T11:00:00+06:00', requestedAt: '2026-10-01T19:00:00+06:00', notes: '462 medicines imported with expiry.' },
];

export const seedArticles: Article[] = [
  { id: 'KB-21', title: 'Pay your HisabIQ bill with bKash, Nagad or Rocket', titleBn: 'বিকাশ/নগদ/রকেটে বিল পরিশোধ', category: 'Billing', visibility: 'Public', status: 'Published', body: 'Send money to the HisabIQ merchant number, then enter the TRX ID in Plan & billing. Your plan renews after we match it to our statement — usually within 2 hours.', updatedAt: '2026-10-10', updatedBy: 'Farhana Kabir', views: 1840 },
  { id: 'KB-18', title: 'Set up opening stock with expiry dates (pharmacy)', titleBn: 'মেয়াদসহ ওপেনিং স্টক', category: 'Products', visibility: 'Public', status: 'Published', body: 'Turn on Expiry tracking in Settings › Products and choose FEFO. Then add opening stock per batch with its expiry date.', updatedAt: '2026-09-22', updatedBy: 'Shakil Hasan', views: 620 },
  { id: 'KB-15', title: 'Close your cash session at day end', titleBn: 'দিনশেষে ক্যাশ সেশন বন্ধ', category: 'Finance', visibility: 'Public', status: 'Published', body: 'Count notes by denomination, compare with expected cash and record any shortage before closing.', updatedAt: '2026-09-01', updatedBy: 'Shakil Hasan', views: 910 },
  { id: 'KB-12', title: 'Verifying mobile payments: duplicate TRX checklist', titleBn: 'ডুপ্লিকেট TRX যাচাই', category: 'Internal · Billing', visibility: 'Internal', status: 'Published', body: 'Never verify from screenshot alone. Match TRX, amount and sender against the statement. Reused TRX → reject and ask for the correct one.', updatedAt: '2026-10-05', updatedBy: 'Farhana Kabir', views: 64 },
  { id: 'KB-24', title: 'Multi-unit products: carton, dozen and piece', titleBn: 'মাল্টি-ইউনিট পণ্য', category: 'Products', visibility: 'Public', status: 'Draft', body: 'Draft — explain unit chains and selling price per unit.', updatedAt: '2026-10-24', updatedBy: 'Shakil Hasan', views: 0 },
];

export const seedAnnouncements: Announcement[] = [
  { id: 'AN-9', title: 'Pujo offer: 20% off Pro until 31 Oct', body: 'Use code PUJO20 in Plan & billing.', channel: 'In-app', plans: ['FREE', 'COUNTER'], tenantIds: [], state: 'DELIVERED', scheduledAt: '2026-10-05T10:00:00+06:00', createdBy: 'Nusrat Jahan', reach: 412 },
  { id: 'AN-10', title: 'Scheduled maintenance 27 Oct, 2–3 AM', body: 'HisabIQ will be read-only for up to one hour. Your data is safe.', channel: 'In-app + SMS', plans: ['FREE', 'COUNTER', 'PRO', 'PLUS'], tenantIds: [], state: 'SCHEDULED', scheduledAt: '2026-10-26T20:00:00+06:00', createdBy: 'Nusrat Jahan', reach: 0 },
  { id: 'AN-11', title: 'New: Reports Plus for 7 days at ৳99', body: 'Try profit and cash-forecast reports for a week.', channel: 'In-app', plans: ['FREE', 'COUNTER'], tenantIds: [], state: 'DRAFT', scheduledAt: '2026-11-01T10:00:00+06:00', createdBy: 'Nusrat Jahan', reach: 0 },
];

export const seedTemplates: MessageTemplate[] = [
  { id: 'TPL-RENEW', name: 'Renewal in 3 days', purpose: 'Renewal', channel: 'SMS', text: 'HisabIQ: আপনার {plan} প্ল্যান {date} তারিখে শেষ হবে। বিকাশ/নগদে রিনিউ করুন — সব ডেটা নিরাপদ থাকবে।' },
  { id: 'TPL-GRACE', name: 'Grace period reminder', purpose: 'Grace', channel: 'SMS', text: 'HisabIQ: {business}, your {plan} plan ended. You have {days} grace days. Renew to keep {plan} screens. Your records are safe.' },
  { id: 'TPL-UPGRADE', name: 'Near plan limit', purpose: 'Upgrade', channel: 'In-app', text: 'You are using {used} of {limit} {what}. {suggested} gives you {newLimit} for ৳{diff} more per month.' },
  { id: 'TPL-SETUP', name: 'Finish setup', purpose: 'Setup', channel: 'In-app', text: 'You are {pct}% set up. Next: {nextStep}. Want help? Book a guided setup call for ৳399.' },
];

export const seedNudges: Nudge[] = [
  { id: 'NG-12', tenantId: 'T-1010', templateId: 'TPL-UPGRADE', at: '2026-10-12T10:00:00+06:00', by: 'Farhana Kabir', outcome: 'Upgraded' },
  { id: 'NG-11', tenantId: 'T-1004', templateId: 'TPL-UPGRADE', at: '2026-10-18T10:00:00+06:00', by: 'Farhana Kabir', outcome: 'Sent' },
  { id: 'NG-10', tenantId: 'T-1002', templateId: 'TPL-RENEW', at: '2026-10-22T10:00:00+06:00', by: 'System', outcome: 'Renewed' },
];

export const seedDataRequests: DataRequest[] = [
  { id: 'DR-14', tenantId: 'T-1006', kind: 'EXPORT', state: 'CONSENTED', detail: 'Full Excel export of sales, purchases and parties (2025–26).', requestedAt: '2026-10-23T11:00:00+06:00', dueAt: '2026-10-26', handledBy: null },
  { id: 'DR-13', tenantId: 'T-1001', kind: 'RESTORE', state: 'REQUESTED', detail: 'Restore invoice INV-000198 deleted by mistake (in recycle bin).', requestedAt: '2026-10-25T08:45:00+06:00', dueAt: '2026-10-26', handledBy: null },
  { id: 'DR-11', tenantId: 'T-1007', kind: 'CLOSURE', state: 'REQUESTED', detail: 'Owner asked to close the account. Retention: books kept 90 days, then deleted after second confirmation.', requestedAt: '2026-10-20T10:00:00+06:00', dueAt: '2026-11-19', handledBy: null },
  { id: 'DR-9', tenantId: 'T-1002', kind: 'EXPORT', state: 'COMPLETED', detail: 'Party ledger export for auditor.', requestedAt: '2026-10-02T10:00:00+06:00', dueAt: '2026-10-05', handledBy: 'Shakil Hasan' },
];

export const seedPlatformSettings: PlatformSettings = {
  timezone: 'Asia/Dhaka (UTC+6)',
  currency: 'BDT (৳)',
  graceDays: 7,
  releaseOnFailedSms: true,
  collectionAccounts: [
    { id: 'CA-1', method: 'bKash', label: 'bKash merchant', number: '01847-000111', active: true },
    { id: 'CA-2', method: 'Nagad', label: 'Nagad merchant', number: '01847-000222', active: true },
    { id: 'CA-3', method: 'Rocket', label: 'Rocket biller', number: '01847-000333', active: true },
    { id: 'CA-4', method: 'Bank transfer', label: 'DBBL current account', number: '1071100045632', active: true },
  ],
};

/* ---------------- ERP vocabulary for signals ---------------- */
export const setupSteps: { key: SetupStep; label: string; bn: string }[] = [
  { key: 'profile', label: 'Business profile & logo', bn: 'প্রোফাইল' },
  { key: 'invoice', label: 'Invoice design & paper size', bn: 'ইনভয়েস ডিজাইন' },
  { key: 'product', label: 'First product added', bn: 'প্রথম পণ্য' },
  { key: 'openingStock', label: 'Opening stock entered', bn: 'ওপেনিং স্টক' },
  { key: 'firstSale', label: 'First POS sale', bn: 'প্রথম বিক্রি' },
  { key: 'firstPurchase', label: 'First purchase bill', bn: 'প্রথম ক্রয়' },
  { key: 'cashSession', label: 'Cash session opened & closed', bn: 'ক্যাশ সেশন' },
  { key: 'moneyAccounts', label: 'Money accounts (Cash/bKash/Nagad/Bank)', bn: 'মানি অ্যাকাউন্ট' },
  { key: 'team', label: 'Team invited', bn: 'টিম' },
];

export const erpModules: { key: ErpModule; label: string; feature: string | null }[] = [
  { key: 'pos', label: 'POS', feature: null },
  { key: 'sales', label: 'Sales', feature: null },
  { key: 'quotations', label: 'Quotations', feature: 'sales.quotations' },
  { key: 'onlineSales', label: 'Online sales', feature: 'sales.online' },
  { key: 'purchases', label: 'Purchases', feature: null },
  { key: 'products', label: 'Products', feature: null },
  { key: 'parties', label: 'Parties', feature: null },
  { key: 'expenses', label: 'Expenses', feature: null },
  { key: 'finance', label: 'Finance', feature: null },
  { key: 'accounts', label: 'Accounts & reconciliation', feature: 'finance.reconciliation' },
  { key: 'warranty', label: 'Warranty', feature: 'warranty.claims' },
  { key: 'reports', label: 'Reports (Medium/Premium/Plus)', feature: 'reports.medium' },
];

export const smsEvents: { key: SmsEvent; label: string }[] = [
  { key: 'dueReminder', label: 'Due reminders' },
  { key: 'saleReceipt', label: 'Sale receipts' },
  { key: 'lowStock', label: 'Low-stock alerts' },
  { key: 'otp', label: 'Login OTP' },
  { key: 'campaign', label: 'Campaigns' },
];

export const businessTypes: { type: BusinessType; defaults: string }[] = [
  { type: 'Grocery', defaults: 'Multi-unit (carton/piece), fast POS, due reminders' },
  { type: 'Pharmacy', defaults: 'Expiry tracking, FEFO allocation, batch numbers' },
  { type: 'Hardware', defaults: 'Multi-unit (bundle/feet), customer credit, quotations' },
  { type: 'Electronics', defaults: 'Serial numbers, warranty months, warranty claims' },
  { type: 'Clothing', defaults: 'Size/colour variants, return days, barcode labels' },
  { type: 'Wholesale', defaults: 'Party credit limits, quotations, delivery challan' },
];

/** ERP settings staff can request through owner-approved Support access. */
export const erpSettingChoices: { section: string; label: string; options: string[]; current: (t: { settings: { invoicePrefix: string; dueReminders: boolean; allowNegativeStock: boolean; language: string } }) => string; sensitive?: boolean }[] = [
  { section: 'Invoices', label: 'Invoices › Prefix', options: [], current: (t) => t.settings.invoicePrefix },
  { section: 'Invoices', label: 'Invoices › Paper size', options: ['A4', '80 mm', '58 mm'], current: () => '80 mm' },
  { section: 'Sales', label: 'Sales › Discount limit', options: ['0%', '5%', '10%', '15%'], current: () => '5%' },
  { section: 'Sales', label: 'Sales › Return days', options: ['0', '3', '7', '15'], current: () => '7' },
  { section: 'Products', label: 'Products › Stock allocation', options: ['FIFO', 'FEFO'], current: () => 'FIFO' },
  { section: 'Products', label: 'Products › Allow negative stock', options: ['On', 'Off'], current: (t) => (t.settings.allowNegativeStock ? 'On' : 'Off') },
  { section: 'Products', label: 'Products › Expiry tracking', options: ['On', 'Off'], current: () => 'Off' },
  { section: 'Money', label: 'Money › Lock date', options: ['None', '30 Sep 2026', '15 Oct 2026'], current: () => 'None', sensitive: true },
  { section: 'Money', label: 'Money › Cash session required', options: ['On', 'Off'], current: () => 'On', sensitive: true },
  { section: 'Notifications', label: 'Notifications › Due reminders', options: ['On', 'Off'], current: (t) => (t.settings.dueReminders ? 'On' : 'Off') },
  { section: 'Notifications', label: 'Notifications › Channel', options: ['In-app', 'In-app + SMS'], current: () => 'In-app + SMS' },
  { section: 'Interface', label: 'Interface › Sales record links', options: ['On', 'Off'], current: () => 'Off' },
  { section: 'General', label: 'General › Language', options: ['English + Bangla', 'English', 'Bangla'], current: (t) => t.settings.language },
];
