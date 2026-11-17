/**
 * MOD-001 T04-W/P2: one-field local draft model for server-authoritative
 * invoice settings. This is NOT a preview design/entitlement state store.
 */
import type { SessionSnapshot } from '../../../integration/session.ts';
import type {
  ServerInvoiceSettings,
  ServerInvoicePreferenceField,
} from '../../../integration/invoice-settings.ts';

export interface InvoiceChoice {
  field: ServerInvoicePreferenceField;
  value: string | boolean;
}
export const editableBooleanFields = [
  'showLogo', 'showCustomerBlock', 'showDiscount',
  'showPaymentBreakdown', 'showDue', 'showAmountInWords',
] as const;

/** /me identity and token epoch are mandatory; URL/demo names have no authority. */
export function verifiedInvoiceEditorIdentity(
  mode: 'preview' | 'connected',
  snapshot: SessionSnapshot,
): string | null {
  const ulid = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
  if (mode !== 'connected' || snapshot.status !== 'authenticated' ||
      !ulid.test(snapshot.tenantId) || !ulid.test(snapshot.userId) ||
      !Number.isSafeInteger(snapshot.epoch) || snapshot.epoch < 0 ||
      !snapshot.accessToken) return null;
  // Never render this key in HTML, logs or responses: it includes the token to
  // force a fresh editor even when credentials rotate in the same epoch.
  return [snapshot.tenantId, snapshot.userId, snapshot.epoch, snapshot.accessToken].join(':');
}

function accepted(field: unknown, value: unknown): field is ServerInvoicePreferenceField {
  if (field === 'language') return value === 'EN' || value === 'BN';
  if (field === 'defaultTemplate') return value === 'A4' || value === 'THERMAL_80';
  if (field === 'thermalPaper') return value === '58mm' || value === '80mm';
  return typeof field === 'string' &&
    (editableBooleanFields as readonly string[]).includes(field) &&
    typeof value === 'boolean';
}

/** One pending field only, with explicit Save/Discard between different fields. */
export function stageInvoiceChoice(
  saved: ServerInvoiceSettings,
  current: InvoiceChoice | null,
  field: unknown,
  value: unknown,
): InvoiceChoice | null {
  if (!accepted(field, value)) return current;
  if (current && current.field !== field) return current;
  if (Object.is(saved[field], value)) return null;
  return { field, value: value as string | boolean };
}

export function canSaveInvoiceChoice(
  current: InvoiceChoice | null,
  canWrite: boolean,
  saving: boolean,
  needsRefresh: boolean,
): boolean {
  return current !== null && canWrite && !saving && !needsRefresh;
}

/** A server confirmation must belong to the same still-active verified user. */
export function confirmInvoiceChoice(
  activeIdentity: string,
  requestIdentity: string,
  pending: InvoiceChoice | null,
  fullServerResponse: ServerInvoiceSettings,
): ServerInvoiceSettings | null {
  if (!activeIdentity || activeIdentity !== requestIdentity || !pending ||
      !Object.is(fullServerResponse[pending.field], pending.value)) return null;
  return fullServerResponse;
}
