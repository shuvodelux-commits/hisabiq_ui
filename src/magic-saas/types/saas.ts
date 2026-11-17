import type { PlanCode } from './experience';

/* ---------------- Staff, roles & permissions ---------------- */
export type StaffRole =
  | 'SUPER_ADMIN'
  | 'OPS_ADMIN'
  | 'FINANCE_MANAGER'
  | 'PAYMENT_VERIFIER'
  | 'SUPPORT_LEAD'
  | 'SUPPORT_ENGINEER'
  | 'MESSAGING_OPERATOR'
  | 'SERVICE_COORDINATOR'
  | 'ANALYST';

export type SaasPermission =
  | 'tenants.view' | 'tenants.edit'
  | 'subscriptions.view' | 'subscriptions.edit'
  | 'invoices.view' | 'invoices.edit'
  | 'payments.view' | 'payments.verify' | 'payments.refund'
  | 'plans.view' | 'plans.edit' | 'plans.publish'
  | 'grants.trial' | 'grants.issue'
  | 'sms.view' | 'sms.edit' | 'sms.configure'
  | 'support.access' | 'support.diagnostics'
  | 'tickets.view' | 'tickets.edit' | 'tickets.assign'
  | 'services.view' | 'services.edit'
  | 'kb.view' | 'kb.edit'
  | 'team.view' | 'team.edit'
  | 'announcements.view' | 'announcements.edit'
  | 'reports.view' | 'reports.export'
  | 'audit.view'
  | 'settings.view' | 'settings.edit'
  | 'data.view' | 'data.manage';

export type RoleDef = { id: StaffRole; label: string; summary: string; permissions: SaasPermission[] };
export type Assignment = { roleId: StaffRole; scope: 'ALL' | string[] };
export type StaffMember = { id: string; name: string; staffId: string; email: string; phone: string; status: 'Active' | 'Disabled'; assignments: Assignment[]; lastActive: string };

/* ---------------- Tenants ---------------- */
/** Subscription status. Account access (suspension, archive) is tracked separately in `account`. */
export type TenantStatus = 'Active' | 'Trial' | 'Grace' | 'Expired' | 'Suspended';
export type AccountState = 'Provisioning' | 'Active' | 'Suspended' | 'Archived';

export type Member = {
  id: string;
  name: string;
  role: 'Owner' | 'Manager' | 'Sales' | 'Viewer';
  phone: string;
  status: 'Active' | 'Disabled';
  lastSeen: string;
};

export type TenantSettings = {
  invoicePrefix: string;
  language: 'English + Bangla' | 'English' | 'Bangla';
  lockMinutes: number;
  smsSender: string;
  allowNegativeStock: boolean;
  dueReminders: boolean;
};

export type SetupStep = 'profile' | 'invoice' | 'product' | 'openingStock' | 'firstSale' | 'firstPurchase' | 'cashSession' | 'moneyAccounts' | 'team';
export type ErpModule = 'pos' | 'sales' | 'quotations' | 'onlineSales' | 'purchases' | 'products' | 'parties' | 'expenses' | 'finance' | 'accounts' | 'warranty' | 'reports';
export type SmsEvent = 'dueReminder' | 'saleReceipt' | 'lowStock' | 'otp' | 'campaign';
export type BusinessType = 'Grocery' | 'Pharmacy' | 'Hardware' | 'Electronics' | 'Clothing' | 'Wholesale';

/** Daily ERP usage aggregates (sample data — production needs backend aggregates). */
export type ErpActivity = {
  productCount: number;
  lastSaleAt: string | null;
  salesThisWeek: number;
  salesLastWeek: number;
  avgDailySales: number;
  openCashSessions: number;
  unreconciledAccounts: number;
  negativeStock: number;
  failedSms30d: number;
  setup: Record<SetupStep, boolean>;
  modules: Partial<Record<ErpModule, { uses30d: number; locked: number }>>;
  smsByEvent: Partial<Record<SmsEvent, number>>;
};

export type Reminder = { at: string; channel: 'SMS' | 'In-app'; template: string; by: string };

export type Tenant = {
  id: string;
  name: string;
  owner: string;
  phone: string;
  email: string;
  district: string;
  businessType: BusinessType;
  planCode: PlanCode;
  status: TenantStatus;
  account: AccountState;
  invite: 'Pending' | 'Accepted';
  /** Paid/trial access ends on this date. null = no expiry (Free). */
  expiresAt: string | null;
  createdAt: string;
  lastActive: string;
  userLimit: number;
  smsAvailable: number;
  smsReserved: number;
  storageUsedMb: number;
  storageLimitMb: number;
  monthlyInvoices: number;
  settings: TenantSettings;
  members: Member[];
  erp: ErpActivity;
  scheduledChange: { kind: 'PLAN' | 'CANCEL'; planCode?: PlanCode; at: string; by: string } | null;
  reminders: Reminder[];
  trialExtendedAt?: string;
  /** Set when access ended — explains what changed. */
  expiryNote?: string;
};

/* ---------------- Entitlements ---------------- */
export type EntitlementSource = 'PLAN' | 'PURCHASE' | 'TRIAL' | 'GRANT';
export type EntitlementStatus = 'Active' | 'Scheduled' | 'Expired' | 'Revoked';

export type Entitlement = {
  id: string;
  tenantId: string;
  feature: string;
  source: EntitlementSource;
  scope: 'Business' | 'Member';
  memberId?: string;
  status: EntitlementStatus;
  startsAt: string;
  expiresAt: string | null;
  ref: string;
  note: string;
  grantedBy: string;
};

/* ---------------- Orders / invoices / payments ---------------- */
export type OrderKind = 'SUBSCRIPTION' | 'FEATURE' | 'SMS' | 'SERVICE';
export type OrderState =
  | 'PAYMENT_PENDING'
  | 'VERIFICATION_PENDING'
  | 'ACTIVATION_PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'VOIDED';

export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Bank transfer' | 'Card';

export type PaymentOrder = {
  id: string;
  tenantId: string;
  kind: OrderKind;
  packageId: string;
  packageVersion: number;
  /** Snapshot of the exact terms at purchase time. Never re-read from the live package. */
  terms: { name: string; benefit: string; durationDays: number | null; smsCredits: number; features: string[]; planCode: PlanCode | null };
  offerId: string | null;
  offerCode: string | null;
  listPrice: number;
  discount: number;
  charges: number;
  total: number;
  bonusCredits: number;
  method: PaymentMethod;
  reference: string;
  /** Sender wallet / account number the owner paid from. */
  payer?: string;
  evidence: string | null;
  /** Amount matched so far. A partial payment never grants the benefit. */
  paidAmount?: number;
  state: OrderState;
  createdAt: string;
  createdBy: string;
  claimedBy?: string;
  infoRequest?: string;
  verifiedBy?: string;
  activatedAt?: string;
  failureReason?: string;
  voidReason?: string;
  refund?: { amount: number; reason: string; by: string; at: string };
};

/** A line from a HisabIQ collection-account statement (bKash/Nagad/Rocket/bank). */
export type StatementLine = { id: string; method: PaymentMethod; account: string; trx: string; amount: number; sender: string; at: string };

/* ---------------- SMS ---------------- */
export type SmsMoveKind = 'PURCHASE' | 'BONUS' | 'GRANT' | 'RESERVE' | 'RELEASE' | 'SENT' | 'EXPIRED' | 'REFUND';
export type SmsMove = { id: string; tenantId: string; at: string; kind: SmsMoveKind; credits: number; balance: number; ref: string; note: string; expiresAt?: string | null };

export type SmsMessage = {
  id: string;
  tenantId: string;
  at: string;
  to: string;
  text: string;
  segments: number;
  encoding: 'GSM' | 'Unicode';
  status: 'Queued' | 'Sent' | 'Delivered' | 'Failed';
  provider: string;
  event?: SmsEvent;
  retries?: number;
};

/* ---------------- Catalog ---------------- */
export type PromoStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'ENDED';
export type BillingPeriod = 'MONTHLY' | 'YEARLY' | 'ONE_TIME' | 'PASS';
export type PackageKind = 'PLAN' | 'FEATURE' | 'SMS' | 'SERVICE';
export type InterfaceLevel = 'BASIC' | 'MEDIUM' | 'PREMIUM';

export type Feature = { key: string; label: string; bn: string; requires: string[]; conflicts: string[]; level?: InterfaceLevel; module?: ErpModule };

export type VersionRecord = { version: number; at: string; by: string; priceBdt: number; summary: string };

export type SaasPackage = {
  id: string;
  kind: PackageKind;
  name: string;
  description: string;
  basePlan: PlanCode | null;
  priceBdt: number;
  billing: BillingPeriod;
  passDays: number;
  features: string[];
  interfaceLevel: InterfaceLevel;
  userLimit: number;
  storageGb: number;
  reports: 'Basic' | 'Medium' | 'Premium';
  support: 'Standard' | 'Priority';
  smsCredits: number;
  smsGrant: 'ONCE' | 'EACH_PERIOD';
  smsExpiryDays: number;
  visibility: 'PUBLIC' | 'INVITE' | 'RESTRICTED';
  restrictedTenantIds: string[];
  availableFrom: string;
  availableTo: string | null;
  status: PromoStatus;
  version: number;
  versions: VersionRecord[];
  updatedBy: string;
  updatedAt: string;
};

export type OfferType = 'PERCENT' | 'FIXED' | 'INTRO' | 'TRIAL' | 'BONUS_SMS' | 'SETUP';

export type Offer = {
  id: string;
  name: string;
  type: OfferType;
  /** % for PERCENT, ৳ for FIXED, intro price for INTRO, trial days for TRIAL, credits for BONUS_SMS, ৳ setup value for SETUP */
  value: number;
  introPeriods: number;
  packageIds: string[];
  audience: 'ALL' | 'NEW' | 'EXISTING' | 'SELECTED';
  tenantIds: string[];
  code: string | null;
  startsAt: string;
  endsAt: string;
  maxRedemptions: number | null;
  perBusiness: number;
  minPurchase: number;
  stackable: boolean;
  status: PromoStatus;
  version: number;
  versions: VersionRecord[];
  updatedBy: string;
  updatedAt: string;
};

/* ---------------- Support & operations ---------------- */
export type TicketReply = { id: string; at: string; by: string; kind: 'public' | 'internal' | 'owner'; text: string };
export type Ticket = {
  id: string;
  tenantId: string;
  subject: string;
  priority: 'Low' | 'Normal' | 'High';
  status: 'Open' | 'Waiting' | 'Resolved';
  assignee: string;
  updatedAt: string;
  createdAt: string;
  channel: 'In-app' | 'Phone' | 'WhatsApp';
  slaDueAt: string;
  replies: TicketReply[];
};

export type AccessState = 'REQUESTED' | 'APPROVED' | 'DECLINED' | 'EXPIRED' | 'REVOKED' | 'APPLIED';
export type SupportAccess = {
  id: string;
  tenantId: string;
  ticketId: string;
  staffName: string;
  staffId: string;
  memberId: string | null;
  changes: { setting: string; before: string; after: string }[];
  reason: string;
  state: AccessState;
  requestedAt: string;
  expiresAt: string | null;
  decidedBy?: string;
};

export type ServiceState = 'REQUESTED' | 'QUOTED' | 'APPROVED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ServiceOrder = { id: string; tenantId: string; title: string; packageId: string; quoteBdt: number; state: ServiceState; assignee: string; scheduledAt: string | null; requestedAt: string; notes: string };

export type Article = { id: string; title: string; titleBn: string; category: string; visibility: 'Public' | 'Internal'; status: 'Draft' | 'Published'; body: string; updatedAt: string; updatedBy: string; views: number };

export type AnnouncementState = 'DRAFT' | 'SCHEDULED' | 'DELIVERED' | 'CANCELLED';
export type Announcement = { id: string; title: string; body: string; channel: 'In-app' | 'SMS' | 'In-app + SMS'; plans: PlanCode[]; tenantIds: string[]; state: AnnouncementState; scheduledAt: string; createdBy: string; reach: number };

export type MessageTemplate = { id: string; name: string; purpose: 'Renewal' | 'Grace' | 'Upgrade' | 'Setup' | 'General'; channel: 'SMS' | 'In-app'; text: string };
export type Nudge = { id: string; tenantId: string; templateId: string; at: string; by: string; outcome: 'Sent' | 'Upgraded' | 'Renewed' };

export type DataRequestKind = 'EXPORT' | 'RESTORE' | 'CLOSURE';
export type DataRequestState = 'REQUESTED' | 'CONSENTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';
export type DataRequest = { id: string; tenantId: string; kind: DataRequestKind; state: DataRequestState; detail: string; requestedAt: string; dueAt: string; handledBy: string | null };

export type PlatformSettings = {
  timezone: string;
  currency: string;
  graceDays: number;
  releaseOnFailedSms: boolean;
  collectionAccounts: { id: string; method: PaymentMethod; label: string; number: string; active: boolean }[];
};

export type AuditEvent = { id: string; at: string; actor: string; tenantId: string | null; action: string; summary: string; detail?: string };

export type Result = { ok: true; message: string; id?: string } | { ok: false; message: string };

export type SaasState = {
  tenants: Tenant[];
  entitlements: Entitlement[];
  orders: PaymentOrder[];
  statement: StatementLine[];
  smsMoves: SmsMove[];
  smsMessages: SmsMessage[];
  packages: SaasPackage[];
  offers: Offer[];
  tickets: Ticket[];
  access: SupportAccess[];
  audit: AuditEvent[];
  providers: Provider[];
  tariffs: Tariff[];
  senders: SenderRequest[];
  marginThreshold: number;
  services: ServiceOrder[];
  articles: Article[];
  announcements: Announcement[];
  templates: MessageTemplate[];
  nudges: Nudge[];
  dataRequests: DataRequest[];
  settings: PlatformSettings;
  staff: StaffMember[];
};

export type Provider = { id: string; name: string; status: 'Healthy' | 'Degraded' | 'Down'; deliveryRate: number; latencySec: number; lastCheck: string; routes: string };
export type Tariff = { id: string; providerId: string; route: 'Non-masking' | 'Masking'; costPerSegment: number; confirmed: boolean; effectiveFrom: string };
export type SenderRequest = { id: string; tenantId: string; sender: string; status: 'Pending' | 'Approved' | 'Rejected'; submittedAt: string; note: string };
