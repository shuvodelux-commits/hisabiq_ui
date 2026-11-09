import type { PlanCode } from '../types/experience';
import type {
  AuditEvent,
  Entitlement,
  Feature,
  Offer,
  PaymentOrder,
  Provider,
  RoleDef,
  SaasPackage,
  SaasPermission,
  SenderRequest,
  SmsMessage,
  SmsMove,
  StaffMember,
  StatementLine,
  SupportAccess,
  Tariff,
} from '../types/saas';

export { seedTenants } from './saasTenants';

/* ---------------- Roles (stackable, each assignment has a tenant scope) ---------------- */
const allPermissions: SaasPermission[] = [
  'tenants.view', 'tenants.edit', 'subscriptions.view', 'subscriptions.edit', 'invoices.view', 'invoices.edit', 'payments.view', 'payments.verify', 'payments.refund',
  'plans.view', 'plans.edit', 'plans.publish', 'grants.trial', 'grants.issue', 'sms.view', 'sms.edit', 'sms.configure', 'support.access', 'support.diagnostics',
  'tickets.view', 'tickets.edit', 'tickets.assign', 'services.view', 'services.edit', 'kb.view', 'kb.edit', 'team.view', 'team.edit', 'announcements.view', 'announcements.edit',
  'reports.view', 'reports.export', 'audit.view', 'settings.view', 'settings.edit', 'data.view', 'data.manage',
];

export const roleDefs: RoleDef[] = [
  { id: 'SUPER_ADMIN', label: 'Super Admin', summary: 'Everything, including team and platform settings.', permissions: allPermissions },
  { id: 'OPS_ADMIN', label: 'Operations Admin', summary: 'Businesses, subscriptions, announcements and platform settings.', permissions: ['tenants.view', 'tenants.edit', 'subscriptions.edit', 'grants.trial', 'announcements.edit', 'settings.edit', 'plans.view', 'sms.view', 'reports.view', 'audit.view', 'data.manage', 'tickets.view', 'services.view'] },
  { id: 'FINANCE_MANAGER', label: 'Finance Manager', summary: 'Invoices, refunds and revenue reports.', permissions: ['tenants.view', 'subscriptions.view', 'invoices.edit', 'payments.verify', 'payments.refund', 'plans.view', 'grants.issue', 'reports.export', 'audit.view'] },
  { id: 'PAYMENT_VERIFIER', label: 'Payment Verifier', summary: 'Matches bKash, Nagad, Rocket and bank payments to invoices.', permissions: ['tenants.view', 'invoices.view', 'payments.verify'] },
  { id: 'SUPPORT_LEAD', label: 'Support Lead', summary: 'Assigns tickets, owns support access, diagnostics and the knowledge base.', permissions: ['tenants.view', 'tenants.edit', 'tickets.assign', 'tickets.edit', 'support.access', 'support.diagnostics', 'grants.trial', 'kb.edit', 'data.manage', 'sms.view', 'services.view', 'audit.view'] },
  { id: 'SUPPORT_ENGINEER', label: 'Support Engineer', summary: 'Answers tickets and requests owner-approved changes.', permissions: ['tenants.view', 'tickets.edit', 'support.access', 'support.diagnostics', 'kb.view', 'sms.view'] },
  { id: 'MESSAGING_OPERATOR', label: 'Messaging Operator', summary: 'SMS providers, sender IDs, templates and retries.', permissions: ['tenants.view', 'sms.edit', 'sms.configure', 'announcements.view'] },
  { id: 'SERVICE_COORDINATOR', label: 'Service Coordinator', summary: 'Guided setup and data-import services.', permissions: ['tenants.view', 'services.edit', 'tickets.view'] },
  { id: 'ANALYST', label: 'Analyst / Auditor', summary: 'Read-only everywhere, plus report export and audit.', permissions: [...allPermissions.filter((p) => p.endsWith('.view')), 'reports.export'] },
];

/** Areas whose permissions only apply to all-tenant assignments. */
export const globalOnlyAreas = ['team', 'plans', 'settings', 'announcements', 'reports'];

export const seedStaff: StaffMember[] = [
  { id: 'tanvir', name: 'Tanvir Ahmed', staffId: 'HQ-001', email: 'tanvir@hisabiq.com', phone: '01700-000001', status: 'Active', assignments: [{ roleId: 'SUPER_ADMIN', scope: 'ALL' }], lastActive: '2026-10-25T10:28:00+06:00' },
  { id: 'farhana', name: 'Farhana Kabir', staffId: 'HQ-010', email: 'farhana@hisabiq.com', phone: '01700-000010', status: 'Active', assignments: [{ roleId: 'FINANCE_MANAGER', scope: 'ALL' }, { roleId: 'PAYMENT_VERIFIER', scope: 'ALL' }], lastActive: '2026-10-25T10:20:00+06:00' },
  { id: 'tania', name: 'Tania Sultana', staffId: 'HQ-014', email: 'tania@hisabiq.com', phone: '01700-000014', status: 'Active', assignments: [{ roleId: 'PAYMENT_VERIFIER', scope: 'ALL' }], lastActive: '2026-10-25T10:02:00+06:00' },
  { id: 'nusrat', name: 'Nusrat Jahan', staffId: 'HQ-030', email: 'nusrat@hisabiq.com', phone: '01700-000030', status: 'Active', assignments: [{ roleId: 'OPS_ADMIN', scope: 'ALL' }], lastActive: '2026-10-25T09:44:00+06:00' },
  { id: 'shakil', name: 'Shakil Hasan', staffId: 'HQ-020', email: 'shakil@hisabiq.com', phone: '01700-000020', status: 'Active', assignments: [{ roleId: 'SUPPORT_LEAD', scope: 'ALL' }], lastActive: '2026-10-25T10:15:00+06:00' },
  { id: 'rafiq', name: 'Rafiq Islam', staffId: 'HQ-021', email: 'rafiq@hisabiq.com', phone: '01700-000021', status: 'Active', assignments: [{ roleId: 'SUPPORT_ENGINEER', scope: ['T-1001', 'T-1002', 'T-1003', 'T-1005', 'T-1008', 'T-1012'] }], lastActive: '2026-10-25T09:52:00+06:00' },
  { id: 'mehedi', name: 'Mehedi Hasan', staffId: 'HQ-040', email: 'mehedi@hisabiq.com', phone: '01700-000040', status: 'Active', assignments: [{ roleId: 'MESSAGING_OPERATOR', scope: 'ALL' }], lastActive: '2026-10-25T08:30:00+06:00' },
  { id: 'sumaiya', name: 'Sumaiya Akter', staffId: 'HQ-045', email: 'sumaiya@hisabiq.com', phone: '01700-000045', status: 'Active', assignments: [{ roleId: 'SERVICE_COORDINATOR', scope: 'ALL' }, { roleId: 'SUPPORT_ENGINEER', scope: ['T-1004', 'T-1009'] }], lastActive: '2026-10-25T09:10:00+06:00' },
  { id: 'imran', name: 'Imran Hossain', staffId: 'HQ-041', email: 'imran@hisabiq.com', phone: '01700-000041', status: 'Active', assignments: [{ roleId: 'ANALYST', scope: 'ALL' }], lastActive: '2026-10-24T17:00:00+06:00' },
  { id: 'kamrul', name: 'Kamrul Islam', staffId: 'HQ-012', email: 'kamrul@hisabiq.com', phone: '01700-000012', status: 'Disabled', assignments: [{ roleId: 'PAYMENT_VERIFIER', scope: 'ALL' }], lastActive: '2026-08-30T17:00:00+06:00' },
];

/* ---------------- Feature keys (mapped to ERP modules) ---------------- */
export const featureCatalog: Feature[] = [
  { key: 'core.erp', label: 'Sales, POS, products, parties, purchases', bn: 'মূল কাজ', requires: [], conflicts: [], module: 'pos' },
  { key: 'counter.templates', label: 'Sale templates & batch print', bn: 'টেমপ্লেট', requires: ['core.erp'], conflicts: [] },
  { key: 'counter.barcodes', label: 'Barcode labels', bn: 'বারকোড', requires: ['core.erp'], conflicts: [] },
  { key: 'notifications.sms', label: 'SMS due reminders & receipts', bn: 'এসএমএস নোটিফিকেশন', requires: ['core.erp'], conflicts: [] },
  { key: 'sales.quotations', label: 'Quotations', bn: 'কোটেশন', requires: ['core.erp'], conflicts: [], module: 'quotations' },
  { key: 'sales.online', label: 'Online sales', bn: 'অনলাইন বিক্রি', requires: ['sales.quotations'], conflicts: [], module: 'onlineSales' },
  { key: 'interface.links', label: 'Record links & quick actions', bn: 'রেকর্ড লিংক', requires: ['core.erp'], conflicts: [], level: 'MEDIUM' },
  { key: 'interface.details', label: 'Inline items, payment split, profit', bn: 'বিস্তারিত তথ্য', requires: ['interface.links'], conflicts: [], level: 'PREMIUM' },
  { key: 'reports.medium', label: 'Medium reports', bn: 'রিপোর্ট', requires: ['core.erp'], conflicts: ['reports.premium'], module: 'reports' },
  { key: 'reports.premium', label: 'Premium reports & advisor', bn: 'প্রিমিয়াম রিপোর্ট', requires: ['core.erp'], conflicts: ['reports.medium'], module: 'reports' },
  { key: 'reports.plus', label: 'Reports Plus (add-on)', bn: 'রিপোর্টস প্লাস', requires: ['core.erp'], conflicts: [], module: 'reports' },
  { key: 'warranty.claims', label: 'Warranty management', bn: 'ওয়ারেন্টি', requires: ['core.erp'], conflicts: [], module: 'warranty' },
  { key: 'finance.reconciliation', label: 'Account reconciliation', bn: 'হিসাব মিলানো', requires: ['core.erp'], conflicts: [], module: 'accounts' },
  { key: 'support.priority', label: 'Priority support', bn: 'দ্রুত সাপোর্ট', requires: [], conflicts: [] },
];

export const planFeatures: Record<PlanCode, string[]> = {
  FREE: ['core.erp'],
  COUNTER: ['core.erp', 'counter.templates', 'counter.barcodes', 'notifications.sms'],
  PRO: ['core.erp', 'counter.templates', 'counter.barcodes', 'notifications.sms', 'sales.quotations', 'interface.links', 'reports.medium', 'finance.reconciliation'],
  PLUS: ['core.erp', 'counter.templates', 'counter.barcodes', 'notifications.sms', 'sales.quotations', 'sales.online', 'interface.links', 'interface.details', 'reports.premium', 'finance.reconciliation', 'warranty.claims'],
};

/** Approved catalog limits. */
export const planUserLimit: Record<PlanCode, number> = { FREE: 1, COUNTER: 2, PRO: 3, PLUS: 5 };
export const planProductLimit: Record<PlanCode, number> = { FREE: 500, COUNTER: 2000, PRO: 10000, PLUS: 20000 };
export const planPrice: Record<PlanCode, number> = { FREE: 0, COUNTER: 199, PRO: 399, PLUS: 599 };
export const planOrder: PlanCode[] = ['FREE', 'COUNTER', 'PRO', 'PLUS'];

/* ---------------- Extra entitlements ---------------- */
export const seedEntitlements: Entitlement[] = [
  { id: 'E-301', tenantId: 'T-1001', feature: 'support.priority', source: 'GRANT', scope: 'Business', status: 'Active', startsAt: '2026-10-01', expiresAt: '2026-12-31', ref: 'GR-018', note: 'Complimentary — pilot partner', grantedBy: 'Tanvir Ahmed' },
  { id: 'E-302', tenantId: 'T-1002', feature: 'warranty.claims', source: 'TRIAL', scope: 'Business', status: 'Active', startsAt: '2026-10-20', expiresAt: '2026-11-03', ref: 'TR-044', note: '14-day trial requested by owner', grantedBy: 'Rafiq Islam' },
  { id: 'E-303', tenantId: 'T-1006', feature: 'warranty.claims', source: 'PURCHASE', scope: 'Business', status: 'Active', startsAt: '2026-07-01', expiresAt: '2026-12-31', ref: 'PO-2207', note: 'Warranty module · 6 months (retired package)', grantedBy: 'Payment verified' },
  { id: 'E-304', tenantId: 'T-1004', feature: 'reports.plus', source: 'TRIAL', scope: 'Business', status: 'Expired', startsAt: '2026-10-01', expiresAt: '2026-10-08', ref: 'TR-031', note: 'Complimentary Reports Plus · 7 days', grantedBy: 'Shakil Hasan' },
  { id: 'E-305', tenantId: 'T-1008', feature: 'reports.plus', source: 'PURCHASE', scope: 'Business', status: 'Active', startsAt: '2026-10-20', expiresAt: '2026-10-27', ref: 'PO-2280', note: 'Reports Plus · 7 days', grantedBy: 'Payment verified' },
];

/* ---------------- Catalog: packages (approved catalog) ---------------- */
const base = {
  description: '', passDays: 30, userLimit: 1, storageGb: 1, reports: 'Basic' as const, support: 'Standard' as const, smsCredits: 0, smsGrant: 'ONCE' as const, smsExpiryDays: 365,
  visibility: 'PUBLIC' as const, restrictedTenantIds: [], availableFrom: '2026-01-01', availableTo: null, status: 'ACTIVE' as const, version: 1, updatedBy: 'Tanvir Ahmed', updatedAt: '2026-10-01',
};
const v1 = (price: number, summary = 'Initial publish'): SaasPackage['versions'] => [{ version: 1, at: '2026-10-01', by: 'Tanvir Ahmed', priceBdt: price, summary }];

export const seedPackages: SaasPackage[] = [
  { ...base, id: 'PKG-FREE', kind: 'PLAN', name: 'Free', basePlan: 'FREE', priceBdt: 0, billing: 'MONTHLY', features: planFeatures.FREE, interfaceLevel: 'BASIC', description: 'Essential ERP for one user · 500 products.', storageGb: 0.5, versions: v1(0) },
  { ...base, id: 'PKG-COUNTER', kind: 'PLAN', name: 'Counter', basePlan: 'COUNTER', priceBdt: 199, billing: 'MONTHLY', features: planFeatures.COUNTER, interfaceLevel: 'BASIC', userLimit: 2, storageGb: 2, description: 'Counter tools · 2 users · 2,000 products.', versions: v1(199) },
  { ...base, id: 'PKG-PRO', kind: 'PLAN', name: 'Pro', basePlan: 'PRO', priceBdt: 399, billing: 'MONTHLY', features: planFeatures.PRO, interfaceLevel: 'MEDIUM', userLimit: 3, storageGb: 5, reports: 'Medium', smsCredits: 100, smsGrant: 'EACH_PERIOD', smsExpiryDays: 30, description: 'Connected workflows · 3 users · 10,000 products.', versions: v1(399) },
  { ...base, id: 'PKG-PLUS', kind: 'PLAN', name: 'Plus', basePlan: 'PLUS', priceBdt: 599, billing: 'MONTHLY', features: planFeatures.PLUS, interfaceLevel: 'PREMIUM', userLimit: 5, storageGb: 10, reports: 'Premium', support: 'Priority', smsCredits: 200, smsGrant: 'EACH_PERIOD', smsExpiryDays: 30, description: 'Everything, with detailed information · 5 users · 20,000 products.', version: 2,
    versions: [...v1(549), { version: 2, at: '2026-10-12', by: 'Tanvir Ahmed', priceBdt: 599, summary: 'Price ৳549 → ৳599 for new purchases; existing subscribers keep ৳549 until renewal after 12 Nov' }] },
  { ...base, id: 'PKG-RPLUS-7', kind: 'FEATURE', name: 'Reports Plus · 7 days', basePlan: null, priceBdt: 99, billing: 'PASS', passDays: 7, features: ['reports.plus'], interfaceLevel: 'BASIC', description: 'Profit, buying and cash-forecast reports for a week.', versions: v1(99) },
  { ...base, id: 'PKG-RPLUS-30', kind: 'FEATURE', name: 'Reports Plus · 30 days', basePlan: null, priceBdt: 199, billing: 'PASS', passDays: 30, features: ['reports.plus'], interfaceLevel: 'BASIC', description: 'Profit, buying and cash-forecast reports for a month.', versions: v1(199) },
  { ...base, id: 'PKG-SMS-100', kind: 'SMS', name: 'SMS 100', basePlan: null, priceBdt: 99, billing: 'ONE_TIME', features: [], interfaceLevel: 'BASIC', smsCredits: 100, smsExpiryDays: 365, description: '100 credits · valid 12 months.', versions: v1(99) },
  { ...base, id: 'PKG-SMS-500', kind: 'SMS', name: 'SMS 500', basePlan: null, priceBdt: 399, billing: 'ONE_TIME', features: [], interfaceLevel: 'BASIC', smsCredits: 500, smsExpiryDays: 365, description: '500 credits · valid 12 months.', versions: v1(399) },
  { ...base, id: 'PKG-SMS-2000', kind: 'SMS', name: 'SMS 2,000', basePlan: null, priceBdt: 1499, billing: 'ONE_TIME', features: [], interfaceLevel: 'BASIC', smsCredits: 2000, smsExpiryDays: 365, description: '2,000 credits · valid 12 months.', versions: v1(1499) },
  { ...base, id: 'PKG-SVC-CALL', kind: 'SERVICE', name: 'Guided setup call', basePlan: null, priceBdt: 399, billing: 'ONE_TIME', features: [], interfaceLevel: 'BASIC', description: '45-minute call: business profile, invoice design, cash session.', versions: v1(399) },
  { ...base, id: 'PKG-SVC-IMPORT', kind: 'SERVICE', name: 'Data import', basePlan: null, priceBdt: 999, billing: 'ONE_TIME', features: [], interfaceLevel: 'BASIC', description: 'We import products, parties and opening stock from Excel.', versions: v1(999) },
  { ...base, id: 'PKG-SVC-FULL', kind: 'SERVICE', name: 'Full onboarding', basePlan: null, priceBdt: 1999, billing: 'ONE_TIME', features: [], interfaceLevel: 'BASIC', description: 'Import, setup and staff training. From ৳1,999.', versions: v1(1999) },
  { ...base, id: 'PKG-WARRANTY', kind: 'FEATURE', name: 'Warranty module · 6 months', basePlan: null, priceBdt: 1200, billing: 'PASS', passDays: 180, features: ['warranty.claims'], interfaceLevel: 'BASIC', status: 'ENDED', description: 'Retired. Existing purchases keep their terms.', versions: v1(1200) },
  { ...base, id: 'PKG-PHARMA', kind: 'PLAN', name: 'Pharmacy Starter', basePlan: 'PRO', priceBdt: 299, billing: 'MONTHLY', features: planFeatures.PRO, interfaceLevel: 'MEDIUM', userLimit: 3, storageGb: 3, reports: 'Medium', visibility: 'INVITE', status: 'DRAFT', version: 0, versions: [], description: 'Pro for small pharmacies, invitation only.', updatedBy: 'Nusrat Jahan', updatedAt: '2026-10-24' },
];

/* ---------------- Catalog: offers ---------------- */
const ob = { introPeriods: 1, tenantIds: [], maxRedemptions: null, perBusiness: 1, minPurchase: 0, stackable: false, version: 1, updatedBy: 'Tanvir Ahmed', updatedAt: '2026-10-05' };
const pub = (at: string, summary = 'Published') => [{ version: 1, at, by: 'Tanvir Ahmed', priceBdt: 0, summary }];
export const seedOffers: Offer[] = [
  { ...ob, id: 'OF-PUJO', name: 'Pujo 20% off Pro', type: 'PERCENT', value: 20, packageIds: ['PKG-PRO'], audience: 'ALL', code: 'PUJO20', startsAt: '2026-10-05', endsAt: '2026-10-31', maxRedemptions: 200, status: 'ACTIVE', versions: pub('2026-10-05') },
  { ...ob, id: 'OF-SMSBONUS', name: '100 bonus SMS with 500 pack', type: 'BONUS_SMS', value: 100, packageIds: ['PKG-SMS-500'], audience: 'ALL', code: null, startsAt: '2026-10-01', endsAt: '2026-11-30', status: 'ACTIVE', perBusiness: 2, versions: pub('2026-10-01') },
  { ...ob, id: 'OF-PLUS99', name: 'Plus first month ৳99', type: 'INTRO', value: 99, introPeriods: 1, packageIds: ['PKG-PLUS'], audience: 'NEW', code: null, startsAt: '2026-11-01', endsAt: '2026-12-15', maxRedemptions: 300, status: 'SCHEDULED', versions: pub('2026-10-20', 'Scheduled') },
  { ...ob, id: 'OF-SETUP', name: 'Free data import with Plus', type: 'SETUP', value: 999, packageIds: ['PKG-PLUS'], audience: 'NEW', code: null, startsAt: '2026-11-01', endsAt: '2026-12-31', status: 'DRAFT', version: 0, versions: [], updatedBy: 'Nusrat Jahan', updatedAt: '2026-10-24' },
  { ...ob, id: 'OF-VICTORY', name: 'Victory Day ৳100 off', type: 'FIXED', value: 100, packageIds: ['PKG-PRO', 'PKG-PLUS'], audience: 'EXISTING', code: 'BIJOY100', startsAt: '2025-12-10', endsAt: '2025-12-20', status: 'ENDED', versions: pub('2025-12-09') },
];

/* ---------------- Orders / invoices ---------------- */
const ord = (o: Partial<PaymentOrder> & Pick<PaymentOrder, 'id' | 'tenantId' | 'kind' | 'packageId' | 'terms' | 'listPrice' | 'total' | 'state' | 'createdAt'>): PaymentOrder => ({
  packageVersion: 1, offerId: null, offerCode: null, discount: 0, charges: 0, bonusCredits: 0, method: 'bKash', reference: '', evidence: null, createdBy: 'Business owner', ...o,
});
const planTerms = (code: PlanCode, name: string, sms: number) => ({ name, benefit: `${name} plan · 30 days`, durationDays: 30, smsCredits: sms, features: planFeatures[code], planCode: code });
const smsTerms = (credits: number) => ({ name: `SMS ${credits.toLocaleString('en-IN')}`, benefit: `${credits.toLocaleString('en-IN')} SMS credits · 365 days`, durationDays: 365, smsCredits: credits, features: [], planCode: null });

export const seedOrders: PaymentOrder[] = [
  ord({ id: 'PO-2296', tenantId: 'T-1004', kind: 'SUBSCRIPTION', packageId: 'PKG-COUNTER', terms: planTerms('COUNTER', 'Counter', 0), listPrice: 199, total: 199, method: 'bKash', reference: '4QW81LMZ0P', payer: '01556-778899', evidence: 'bkash-4QW81LMZ0P.jpg', state: 'VERIFICATION_PENDING', createdAt: '2026-10-25T10:02:00+06:00', createdBy: 'Farhana Kabir for owner' }),
  ord({ id: 'PO-2295', tenantId: 'T-1008', kind: 'SUBSCRIPTION', packageId: 'PKG-COUNTER', terms: planTerms('COUNTER', 'Counter', 0), listPrice: 199, total: 199, method: 'bKash', reference: '9KX2M4QP7A', payer: '01755-120934', evidence: 'bkash-9KX2M4QP7A-copy.jpg', state: 'VERIFICATION_PENDING', createdAt: '2026-10-25T09:40:00+06:00' }),
  ord({ id: 'PO-2293', tenantId: 'T-1010', kind: 'SMS', packageId: 'PKG-SMS-500', terms: smsTerms(500), offerId: 'OF-SMSBONUS', listPrice: 399, total: 399, bonusCredits: 100, method: 'Nagad', reference: 'NG7731QX', payer: '01821-447700', evidence: 'nagad-NG7731QX.jpg', state: 'VERIFICATION_PENDING', createdAt: '2026-10-25T09:25:00+06:00' }),
  ord({ id: 'PO-2291', tenantId: 'T-1002', kind: 'SUBSCRIPTION', packageId: 'PKG-PRO', terms: planTerms('PRO', 'Pro', 100), offerId: 'OF-PUJO', offerCode: 'PUJO20', listPrice: 399, discount: 80, total: 319, method: 'bKash', reference: '9KX2M4QP7A', payer: '01712-556677', evidence: 'bkash-9KX2M4QP7A.jpg', state: 'VERIFICATION_PENDING', claimedBy: 'Tania Sultana', createdAt: '2026-10-25T09:05:00+06:00' }),
  ord({ id: 'PO-2290', tenantId: 'T-1003', kind: 'SUBSCRIPTION', packageId: 'PKG-COUNTER', terms: planTerms('COUNTER', 'Counter', 0), listPrice: 199, total: 199, method: 'Nagad', state: 'PAYMENT_PENDING', createdAt: '2026-10-20T18:20:00+06:00' }),
  ord({ id: 'PO-2289', tenantId: 'T-1011', kind: 'SUBSCRIPTION', packageId: 'PKG-PLUS', packageVersion: 1, terms: planTerms('PLUS', 'Plus', 200), listPrice: 549, total: 549, method: 'Bank transfer', state: 'PAYMENT_PENDING', createdAt: '2026-10-24T11:00:00+06:00' }),
  ord({ id: 'PO-2288', tenantId: 'T-1001', kind: 'SMS', packageId: 'PKG-SMS-500', terms: smsTerms(500), offerId: 'OF-SMSBONUS', listPrice: 399, total: 399, bonusCredits: 100, method: 'bKash', reference: '8HT61LQ0ZC', payer: '01711-234567', evidence: 'bkash-8HT61LQ0ZC.jpg', state: 'ACTIVATION_PENDING', verifiedBy: 'Tania Sultana', createdAt: '2026-10-24T15:42:00+06:00' }),
  ord({ id: 'PO-2280', tenantId: 'T-1008', kind: 'FEATURE', packageId: 'PKG-RPLUS-7', terms: { name: 'Reports Plus · 7 days', benefit: 'Reports Plus · 7 days', durationDays: 7, smsCredits: 0, features: ['reports.plus'], planCode: null }, listPrice: 99, total: 99, method: 'bKash', reference: '3RT55PLK9W', payer: '01755-120934', state: 'COMPLETED', verifiedBy: 'Tania Sultana', activatedAt: '2026-10-20T12:00:00+06:00', createdAt: '2026-10-20T11:30:00+06:00' }),
  ord({ id: 'PO-2276', tenantId: 'T-1001', kind: 'SUBSCRIPTION', packageId: 'PKG-PLUS', packageVersion: 1, terms: planTerms('PLUS', 'Plus', 200), listPrice: 549, total: 549, method: 'Bank transfer', reference: 'DBBL-77120', state: 'COMPLETED', verifiedBy: 'Tania Sultana', activatedAt: '2026-10-19T11:02:00+06:00', createdAt: '2026-10-18T16:30:00+06:00' }),
  ord({ id: 'PO-2270', tenantId: 'T-1010', kind: 'SUBSCRIPTION', packageId: 'PKG-COUNTER', terms: planTerms('COUNTER', 'Counter', 0), listPrice: 199, total: 199, method: 'Rocket', reference: 'RK40021987', payer: '01821-447700', state: 'COMPLETED', verifiedBy: 'Farhana Kabir', activatedAt: '2026-10-21T10:00:00+06:00', createdAt: '2026-10-21T09:30:00+06:00' }),
  ord({ id: 'PO-2263', tenantId: 'T-1005', kind: 'SMS', packageId: 'PKG-SMS-500', terms: smsTerms(500), listPrice: 399, total: 399, method: 'bKash', reference: '7ZZ00QWE11', state: 'FAILED', failureReason: 'Reference not found in bKash statement for 21 Oct.', createdAt: '2026-10-21T12:10:00+06:00' }),
  ord({ id: 'PO-2251', tenantId: 'T-1004', kind: 'SERVICE', packageId: 'PKG-SVC-IMPORT', terms: { name: 'Data import', benefit: 'Data import · one-time', durationDays: null, smsCredits: 0, features: [], planCode: null }, listPrice: 999, total: 999, method: 'bKash', reference: '6PL93KDM02', state: 'COMPLETED', verifiedBy: 'Tania Sultana', activatedAt: '2026-10-02T10:00:00+06:00', createdAt: '2026-10-01T19:00:00+06:00' }),
  ord({ id: 'PO-2240', tenantId: 'T-1009', kind: 'SERVICE', packageId: 'PKG-SVC-CALL', terms: { name: 'Guided setup call', benefit: 'Guided setup call · one-time', durationDays: null, smsCredits: 0, features: [], planCode: null }, listPrice: 399, total: 399, method: 'bKash', state: 'VOIDED', voidReason: 'Owner chose to book after trial', createdAt: '2026-10-15T10:00:00+06:00' }),
  ord({ id: 'PO-2207', tenantId: 'T-1006', kind: 'FEATURE', packageId: 'PKG-WARRANTY', terms: { name: 'Warranty module · 6 months', benefit: 'Warranty management · 180 days', durationDays: 180, smsCredits: 0, features: ['warranty.claims'], planCode: null }, listPrice: 1200, total: 1200, method: 'Bank transfer', reference: 'CITY-55102', state: 'COMPLETED', verifiedBy: 'Tania Sultana', activatedAt: '2026-07-01T12:00:00+06:00', createdAt: '2026-06-30T14:00:00+06:00' }),
  ord({ id: 'PO-2199', tenantId: 'T-1002', kind: 'SMS', packageId: 'PKG-SMS-500', terms: smsTerms(500), listPrice: 399, total: 399, method: 'bKash', reference: '5MN20PL8XY', state: 'REFUNDED', verifiedBy: 'Tania Sultana', activatedAt: '2026-09-02T10:00:00+06:00', createdAt: '2026-09-02T09:00:00+06:00', refund: { amount: 399, reason: 'Paid twice by mistake', by: 'Farhana Kabir', at: '2026-09-03T12:00:00+06:00' } }),
];

/** HisabIQ collection-account statement lines (sample). */
export const seedStatement: StatementLine[] = [
  { id: 'ST-1', method: 'bKash', account: '01847-000111', trx: '9KX2M4QP7A', amount: 319, sender: '01712-556677', at: '2026-10-25T09:03:00+06:00' },
  { id: 'ST-2', method: 'Nagad', account: '01847-000222', trx: 'NG7731QX', amount: 349, sender: '01821-447700', at: '2026-10-25T09:22:00+06:00' },
  { id: 'ST-3', method: 'bKash', account: '01847-000111', trx: '8HT61LQ0ZC', amount: 399, sender: '01711-234567', at: '2026-10-24T15:40:00+06:00' },
  { id: 'ST-4', method: 'bKash', account: '01847-000111', trx: '4QW81LMZ0P', amount: 199, sender: '01556-778899', at: '2026-10-25T10:00:00+06:00' },
  { id: 'ST-5', method: 'Rocket', account: '01847-000333', trx: 'RK40021987', amount: 199, sender: '01821-447700', at: '2026-10-21T09:28:00+06:00' },
];

/* ---------------- SMS ---------------- */
export const seedSmsMoves: SmsMove[] = [
  { id: 'SM-1', tenantId: 'T-1001', at: '2026-09-20T10:00:00+06:00', kind: 'PURCHASE', credits: 1000, balance: 1000, ref: 'PO-2140', note: 'SMS 500 ×2', expiresAt: '2027-09-20' },
  { id: 'SM-2', tenantId: 'T-1001', at: '2026-10-19T11:02:00+06:00', kind: 'GRANT', credits: 200, balance: 1200, ref: 'PO-2276', note: 'Plus monthly allowance', expiresAt: '2026-11-18' },
  { id: 'SM-3', tenantId: 'T-1001', at: '2026-10-22T18:00:00+06:00', kind: 'SENT', credits: -84, balance: 1116, ref: 'Due reminders', note: '42 messages · 2 segments each (Bangla)' },
  { id: 'SM-4', tenantId: 'T-1001', at: '2026-10-24T09:00:00+06:00', kind: 'PURCHASE', credits: 350, balance: 1466, ref: 'PO-2238', note: 'Manual top-up', expiresAt: '2027-10-24' },
  { id: 'SM-5', tenantId: 'T-1001', at: '2026-10-25T08:30:00+06:00', kind: 'SENT', credits: -66, balance: 1400, ref: 'Sale receipts', note: '66 messages · 1 segment' },
  { id: 'SM-6', tenantId: 'T-1001', at: '2026-10-25T09:55:00+06:00', kind: 'RESERVE', credits: -60, balance: 1340, ref: 'Campaign CMP-12', note: 'Scheduled for 26 Oct 10:00' },
  { id: 'SM-7', tenantId: 'T-1002', at: '2026-09-02T10:00:00+06:00', kind: 'PURCHASE', credits: 500, balance: 500, ref: 'PO-2199', note: 'SMS 500', expiresAt: '2027-09-02' },
  { id: 'SM-8', tenantId: 'T-1002', at: '2026-09-03T12:00:00+06:00', kind: 'REFUND', credits: -500, balance: 0, ref: 'PO-2199', note: 'Refund — paid twice' },
  { id: 'SM-9', tenantId: 'T-1002', at: '2026-10-01T10:00:00+06:00', kind: 'GRANT', credits: 300, balance: 300, ref: 'Pro allowance', note: 'Pro monthly allowance', expiresAt: '2026-10-31' },
  { id: 'SM-10', tenantId: 'T-1002', at: '2026-10-20T10:00:00+06:00', kind: 'SENT', credits: -90, balance: 210, ref: 'Due reminders', note: '90 messages' },
  { id: 'SM-11', tenantId: 'T-1006', at: '2026-10-10T00:00:00+06:00', kind: 'EXPIRED', credits: -80, balance: 120, ref: 'Plus allowance', note: 'Monthly allowance ended with plan' },
  { id: 'SM-12', tenantId: 'T-1005', at: '2026-10-19T12:00:00+06:00', kind: 'GRANT', credits: 50, balance: 50, ref: 'Trial', note: 'Trial credits', expiresAt: '2026-11-02' },
];

export const seedSmsMessages: SmsMessage[] = [
  { id: 'MSG-901', tenantId: 'T-1001', at: '2026-10-25T08:31:00+06:00', to: '01712-556677', text: 'Thank you for shopping at Nawabpur Hardware. Invoice INV-000241: ৳18,450. Due: ৳4,450.', segments: 1, encoding: 'Unicode', status: 'Delivered', provider: 'SSL Wireless', event: 'saleReceipt' },
  { id: 'MSG-902', tenantId: 'T-1001', at: '2026-10-25T08:34:00+06:00', to: '01815-998877', text: 'প্রিয় গ্রাহক, আপনার বকেয়া ৳১২,৩০০। অনুগ্রহ করে পরিশোধ করুন। — নবাবপুর হার্ডওয়্যার', segments: 2, encoding: 'Unicode', status: 'Sent', provider: 'SSL Wireless', event: 'dueReminder' },
  { id: 'MSG-903', tenantId: 'T-1001', at: '2026-10-25T08:40:00+06:00', to: '01999-000111', text: 'Invoice INV-000242 total 3450 Tk. Thank you.', segments: 1, encoding: 'GSM', status: 'Failed', provider: 'Alpha SMS', event: 'saleReceipt', retries: 1 },
  { id: 'MSG-904', tenantId: 'T-1002', at: '2026-10-20T10:02:00+06:00', to: '01633-102938', text: 'Your due at Rahman Hardware is 2,550 Tk.', segments: 1, encoding: 'GSM', status: 'Delivered', provider: 'SSL Wireless', event: 'dueReminder' },
  { id: 'MSG-905', tenantId: 'T-1011', at: '2026-10-25T07:10:00+06:00', to: '01710-118822', text: 'পদ্মা হোলসেল: আপনার বকেয়া ৳৪৫,২০০। ধন্যবাদ।', segments: 1, encoding: 'Unicode', status: 'Failed', provider: 'Alpha SMS', event: 'dueReminder', retries: 0 },
  { id: 'MSG-906', tenantId: 'T-1011', at: '2026-10-25T07:11:00+06:00', to: '01819-772211', text: 'পদ্মা হোলসেল: আপনার বকেয়া ৳১৮,০০০। ধন্যবাদ।', segments: 1, encoding: 'Unicode', status: 'Failed', provider: 'Alpha SMS', event: 'dueReminder', retries: 0 },
  { id: 'MSG-907', tenantId: 'T-1010', at: '2026-10-25T09:59:00+06:00', to: '01977-332211', text: 'Digital Zone: Invoice DZ-03112 ৳24,500 paid. Warranty 12 months.', segments: 1, encoding: 'Unicode', status: 'Delivered', provider: 'SSL Wireless', event: 'saleReceipt' },
];

export const seedProviders: Provider[] = [
  { id: 'PRV-SSL', name: 'SSL Wireless', status: 'Healthy', deliveryRate: 97.8, latencySec: 4, lastCheck: '2026-10-25T10:25:00+06:00', routes: 'Masking, Non-masking' },
  { id: 'PRV-ALPHA', name: 'Alpha SMS', status: 'Degraded', deliveryRate: 88.1, latencySec: 31, lastCheck: '2026-10-25T10:24:00+06:00', routes: 'Non-masking' },
];

export const seedTariffs: Tariff[] = [
  { id: 'TF-1', providerId: 'PRV-SSL', route: 'Non-masking', costPerSegment: 0.3, confirmed: false, effectiveFrom: '2026-07-01' },
  { id: 'TF-2', providerId: 'PRV-SSL', route: 'Masking', costPerSegment: 0.42, confirmed: false, effectiveFrom: '2026-07-01' },
  { id: 'TF-3', providerId: 'PRV-ALPHA', route: 'Non-masking', costPerSegment: 0.28, confirmed: false, effectiveFrom: '2026-09-01' },
];

export const seedSenders: SenderRequest[] = [
  { id: 'SND-31', tenantId: 'T-1005', sender: 'CTG ELECTRIC', status: 'Pending', submittedAt: '2026-10-23', note: 'Trade licence attached' },
  { id: 'SND-32', tenantId: 'T-1010', sender: 'DIGITALZONE', status: 'Pending', submittedAt: '2026-10-24', note: 'Trade licence attached' },
  { id: 'SND-30', tenantId: 'T-1001', sender: 'NAWABPUR HW', status: 'Approved', submittedAt: '2026-08-11', note: 'Approved by provider 14 Aug' },
  { id: 'SND-28', tenantId: 'T-1002', sender: 'RAHMAN', status: 'Rejected', submittedAt: '2026-09-15', note: 'Too generic — provider asked for a distinct name' },
];

/* ---------------- Support access ---------------- */
export const seedAccess: SupportAccess[] = [
  { id: 'SA-78', tenantId: 'T-1003', ticketId: 'TCK-1031', staffName: 'Rafiq Islam', staffId: 'HQ-021', memberId: null, changes: [{ setting: 'Invoices › Prefix', before: 'INV', after: 'KT' }], reason: 'Owner wants invoices to start with KT.', state: 'APPROVED', requestedAt: '2026-10-25T10:20:00+06:00', expiresAt: '2026-10-25T10:41:00+06:00', decidedBy: 'Abdul Karim' },
  { id: 'SA-77', tenantId: 'T-1001', ticketId: 'TCK-1042', staffName: 'Rafiq Islam', staffId: 'HQ-021', memberId: 'M-3', changes: [{ setting: 'Interface › Sales record links', before: 'Off', after: 'On' }], reason: 'Owner asked for Sabbir to open the ledger from invoices.', state: 'REQUESTED', requestedAt: '2026-10-25T09:52:00+06:00', expiresAt: null },
  { id: 'SA-71', tenantId: 'T-1003', ticketId: 'TCK-1031', staffName: 'Rafiq Islam', staffId: 'HQ-021', memberId: null, changes: [{ setting: 'Invoices › Prefix', before: 'INV', after: 'KT' }], reason: 'Owner wants invoices to start with KT.', state: 'EXPIRED', requestedAt: '2026-10-22T14:00:00+06:00', expiresAt: '2026-10-22T14:15:00+06:00', decidedBy: 'Abdul Karim' },
  { id: 'SA-65', tenantId: 'T-1002', ticketId: 'TCK-1039', staffName: 'Tania Sultana', staffId: 'HQ-014', memberId: null, changes: [{ setting: 'Notifications › Due reminders', before: 'Off', after: 'On' }], reason: 'Turn reminders back on after SMS refund.', state: 'APPLIED', requestedAt: '2026-09-03T12:10:00+06:00', expiresAt: '2026-09-03T12:25:00+06:00', decidedBy: 'Mizanur Rahman' },
];

export const seedAudit: AuditEvent[] = [
  { id: 'AU-10', at: '2026-10-25T10:20:00+06:00', actor: 'Abdul Karim (owner)', tenantId: 'T-1003', action: 'support.access.approved', summary: 'Approved once: Invoices › Prefix INV → KT', detail: 'SA-78' },
  { id: 'AU-9', at: '2026-10-25T09:52:00+06:00', actor: 'Rafiq Islam', tenantId: 'T-1001', action: 'support.access.requested', summary: 'Requested consent: Interface › Sales record links Off → On for Sabbir Hossain', detail: 'TCK-1042' },
  { id: 'AU-8', at: '2026-10-25T09:05:00+06:00', actor: 'Mizanur Rahman (owner)', tenantId: 'T-1002', action: 'payment.submitted', summary: 'Submitted bKash reference 9KX2M4QP7A for PO-2291 (৳319)', detail: 'Screenshot attached — not yet verified' },
  { id: 'AU-7', at: '2026-10-24T16:10:00+06:00', actor: 'Tania Sultana', tenantId: 'T-1001', action: 'payment.verified', summary: 'Verified PO-2288 ৳399 against bKash statement' },
  { id: 'AU-6', at: '2026-10-20T10:00:00+06:00', actor: 'Rafiq Islam', tenantId: 'T-1002', action: 'entitlement.trial.granted', summary: 'Warranty management trial · 14 days', detail: 'TR-044' },
  { id: 'AU-5', at: '2026-10-12T12:00:00+06:00', actor: 'Tanvir Ahmed', tenantId: null, action: 'package.published', summary: 'Plus v2 published: ৳549 → ৳599 for new purchases' },
  { id: 'AU-4', at: '2026-10-10T00:00:00+06:00', actor: 'System', tenantId: 'T-1006', action: 'subscription.expired', summary: 'Plus ended. Now on Free; Warranty purchase still active; 1 user paused' },
  { id: 'AU-3', at: '2026-10-05T10:00:00+06:00', actor: 'Tanvir Ahmed', tenantId: null, action: 'offer.published', summary: 'Pujo 20% off Pro published (code PUJO20)' },
  { id: 'AU-2', at: '2026-10-01T10:00:00+06:00', actor: 'Tanvir Ahmed', tenantId: 'T-1001', action: 'entitlement.grant.issued', summary: 'Complimentary Priority support until 31 Dec 2026', detail: 'Reason: pilot partner' },
];
