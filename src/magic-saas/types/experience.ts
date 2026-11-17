/**
 * Shared ERP experience contract (Settings ↔ modules ↔ SaaS Control Center).
 * Mirrors spec §4 / §4.1 of 2026-10-25-hisabiq-settings-saas-ui-backend-design.md.
 * Fields marked "UI metadata" are additive presentation fields proposed for the catalog;
 * they never affect access decisions.
 */

export type PlanCode = 'FREE' | 'COUNTER' | 'PRO' | 'PLUS';
export type ExperienceTier = 'BASIC' | 'CONNECTED' | 'RICH';
export type SettingScope = { kind: 'tenant' } | { kind: 'user'; userId: string };
export type SettingValue = boolean | string | number;
export type Denial = 'PLAN_REQUIRED' | 'ROLE_DENIED' | 'DEPENDENCY_OFF' | 'NOT_IMPLEMENTED' | 'ACCOUNT_RESTRICTED';

export type AccessDecision = {
  available: boolean;
  enabled: boolean;
  reason: Denial | null;
  source: 'default' | 'tenant' | 'user' | 'grant';
};

export type CapabilityGroup = 'columns' | 'details' | 'links';

export type CapabilityDescriptor = {
  key: string;
  module: string;
  label: string;
  labelBn: string;
  minimumTier: ExperienceTier;
  defaultValue: SettingValue;
  domain: 'presentation' | 'workflow';
  scopes: SettingScope['kind'][];
  requires: string[];
  implemented: boolean;
  valueSchema: { kind: 'boolean' } | { kind: 'enum'; options: string[] } | { kind: 'integer'; min: number; max: number };
  sensitivePermission?: string;
  /** UI metadata: section heading in Interface & workflows */
  group: CapabilityGroup;
  /** UI metadata: one-line plain explanation */
  helper: string;
  /** UI metadata: rare control, shown inside the single Advanced disclosure */
  advanced?: boolean;
  /** UI metadata: where the setting is consumed (shown in architecture docs, not to merchants) */
  consumer: string;
  /** UI metadata: the standard route that still works without this capability */
  basicRoute?: string;
};

export type ExperienceSnapshot = {
  tenantId: string;
  actorId: string;
  planCode: PlanCode;
  revision: number;
  serverNow: string;
  catalogVersion: number;
  contractVersion: 1;
  scope: SettingScope;
  overrides: Record<string, SettingValue>;
  descriptors: CapabilityDescriptor[];
  values: Record<string, SettingValue>;
  decisions: Record<string, AccessDecision>;
};

export type SettingChange =
  | { op: 'SET'; key: string; scope: SettingScope; value: SettingValue }
  | { op: 'RESET'; key: string; scope: SettingScope };

export type SaveSettingsCommand = { operationId: string; expectedRevision: number; changes: SettingChange[] };

export type SaveResult =
  | { ok: true; snapshot: ExperienceSnapshot }
  | { ok: false; code: 'CONFLICT' | 'FORBIDDEN' | 'VALIDATION'; message: string };

export type Viewport = 'mobile' | 'tablet' | 'desktop';

/* ---------- Recovery (spec §4.1) ---------- */

export type RecoveryRecordType = 'SALE_DRAFT' | 'QUOTATION_DRAFT' | 'TEMPLATE' | 'NOTE' | 'UNUSED_PRODUCT' | 'UNUSED_PARTY';

export type RecoveryRecord = {
  id: string;
  tenantId: string;
  recordType: RecoveryRecordType;
  recordId: string;
  label: string;
  deletedAt: string;
  deletedBy: string;
  recoverUntil: string;
  revision: number;
  state: 'DELETED' | 'RESTORED';
  canRestore: boolean;
  reason: string | null;
  /** Proposed additive field: why Restore is blocked, using the restore error vocabulary */
  blockCode?: 'CONFLICT' | 'FORBIDDEN' | 'EXPIRED' | 'VALIDATION' | null;
};

export type RecoveryQuery = { search?: string; recordType?: RecoveryRecordType; cursor?: string; limit?: number };
export type RecoveryPage = { items: RecoveryRecord[]; nextCursor: string | null; serverNow: string };
export type RestoreResult =
  | { ok: true; record: RecoveryRecord }
  | { ok: false; code: 'CONFLICT' | 'FORBIDDEN' | 'EXPIRED' | 'VALIDATION'; message: string };

/* ---------- Support configuration consent (spec §4.1) ---------- */

export type ConfigurationRequest = {
  id: string;
  tenantId: string;
  ticketId: string;
  reason: string;
  staffId: string;
  staffName: string;
  target: SettingScope;
  changes: SettingChange[];
  expectedSettingsRevision: number;
  revision: number;
  status: 'REQUESTED' | 'APPROVED' | 'DECLINED' | 'REVOKED' | 'EXPIRED' | 'APPLIED';
  approvedBy: string | null;
  expiresAt: string | null;
  operationId: string | null;
};

/** Customer-visible configuration history (owner saves, support applies and Undo) */
export type ConfigurationChangeRecord = {
  id: string;
  at: string;
  actorName: string;
  source: 'owner' | 'user' | 'support' | 'undo';
  requestId: string | null;
  scope: SettingScope;
  items: { key: string; before: SettingValue | null; after: SettingValue | null }[];
  revision: number;
  undoneAt: string | null;
};

export type SupportTicket = { id: string; subject: string; status: 'Open' | 'Waiting on you' | 'Resolved' | 'Closed'; updatedAt: string };

export type PreviewRoleId = 'owner' | 'cashier';
export type PreviewActor = { roleId: PreviewRoleId; actorId: string; name: string; roleLabel: string; permissions: string[] };
