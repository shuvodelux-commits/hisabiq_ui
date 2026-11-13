import { ApiError } from './errors.ts';
import { parseScaledInput } from './decimal.ts';
import {
  createPurchaseDraft,
  readPurchaseDraft,
  readPurchaseDrafts,
  recyclePurchaseDraft,
  restorePurchaseDraft,
  updatePurchaseDraft,
} from './purchase-drafts.ts';
import type {
  CreatePurchaseDraftPayload,
  PurchaseDraftPayload,
  ServerPurchaseDraft,
} from './purchase-drafts.ts';
import type { SessionSnapshot } from './session.ts';
import type { PurchaseDraftInput } from '../data/purchaseDraftsPreviewStore.ts';

/**
 * MOD-008 DRAFT-P2 — exact editor snapshot bridge, NOT workspace activation.
 *
 * Only a verified connected session and real tenant-scoped server source IDs
 * can cross this boundary. A preview PurchaseEditor ('t1', fixture products)
 * cannot call this bridge successfully. Never post a purchase from a draft.
 */
export type ConnectedPurchaseSession = Extract<SessionSnapshot, { status: 'authenticated' }>;
export interface PurchaseDraftSources {
  /** Must originate from authenticated connected product/party reads for this tenant. */
  readonly tenantId: string;
  readonly productIds: ReadonlySet<string>;
  readonly supplierNames: ReadonlyMap<string, string>;
}

/**
 * Opaque, memory-only create intent. Only an operation ULID is public; the
 * authenticated source identity and exact draft payload live in a private
 * WeakMap. Neither JWT nor editor data is persisted in browser storage.
 *
 * A lost response must NOT result in a new intent. Retain this handle until
 * confirmed, or block new creates pending an audited server reconciliation.
 */
export interface PreparedPurchaseDraftCreate {
  readonly operationId: string;
}

export interface ResolvedPurchaseEditorDraft {
  readonly id: string;
  readonly version: number;
  readonly savedAt: string;
  readonly deletedAt: string | null;
  readonly recoverableUntilEpochMs: number | null;
  readonly editor: PurchaseDraftInput;
}

const EDITOR_SCHEMA = 'hisabiq.purchase-editor.draft.v1';
const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const EDITOR_KEYS = [
  'tenantId', 'supplierId', 'supplierName', 'date', 'backdateReason',
  'referenceNo', 'notes', 'lines', 'payments', 'discount',
  'discountMode', 'photos', 'total',
];
const MAX_BYTES = 120_000;
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const preparedCreates = new WeakMap<PreparedPurchaseDraftCreate, {
  readonly identity: string;
  readonly serialized: string;
}>();

function currentDraftIdentity(session: ConnectedPurchaseSession): string {
  if (session.status !== 'authenticated' || !validId(session.tenantId) ||
      !validId(session.userId) || !Number.isSafeInteger(session.epoch) ||
      session.epoch < 0 || !session.accessToken) return refuse();
  // The token remains only in a private in-memory WeakMap, never the handle.
  return JSON.stringify([
    session.tenantId, session.userId, session.epoch, session.accessToken,
  ]);
}

/** 48-bit millisecond timestamp + 80 cryptographically random bits. */
function generateCreateOperationId(): string {
  if (!globalThis.crypto?.getRandomValues) return refuse('Secure creation ID generator is unavailable.');
  let clock = Date.now();
  if (!Number.isSafeInteger(clock) || clock < 0 || clock >= 2 ** 48) {
    return refuse('Device clock cannot generate a safe purchase draft ID.');
  }
  const result = Array<string>(10);
  for (let index = 9; index >= 0; index -= 1) {
    result[index] = CROCKFORD.charAt(clock % 32);
    clock = Math.floor(clock / 32);
  }
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(10));
  let bits = 0;
  let buffer = 0;
  let random = '';
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      random += CROCKFORD[(buffer >>> bits) & 31];
      buffer &= (1 << bits) - 1;
    }
  }
  const operationId = result.join('') + random;
  if (!validId(operationId)) return refuse('Purchase draft creation ID could not be verified.');
  return operationId;
}

function refuse(message = 'Purchase draft cannot be verified for this business.'): never {
  throw new ApiError('protocol', message);
}
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exact(value: Record<string, unknown>, fields: readonly string[]): boolean {
  return Object.keys(value).length === fields.length &&
    fields.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function validDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  return year > 0 && month >= 1 && month <= 12 && day >= 1 &&
    day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}
function authorized(session: ConnectedPurchaseSession, sources: PurchaseDraftSources): void {
  if (session.status !== 'authenticated' || !validId(session.tenantId) ||
      !validId(session.userId) || session.tenantId !== sources.tenantId ||
      !session.accessToken || !session.permissions.includes('purchase.bill.create') ||
      !session.permissions.includes('inventory.cost.view') ||
      !(sources.productIds instanceof Set) ||
      !(sources.supplierNames instanceof Map)) {
    refuse('Verified purchasing and cost access is required before saving drafts.');
  }
}

/**
 * JSONB has no undefined type. Remove *only optional object properties* with
 * undefined values; fail on all other lossy JSON (holes, functions, Symbols,
 * cycles, non-finite numbers, Date, untrusted prototypes and inline data URLs).
 * No source values are reinterpreted as financial authority.
 */
function safeJson(value: unknown): unknown {
  const seen = new Set<object>();
  let visited = 0;
  function visit(current: unknown, depth: number): unknown {
    visited += 1;
    if (visited > 20_000 || depth > 50) return refuse('Purchase draft exceeds supported JSON limits.');
    if (current === null || typeof current === 'boolean' || typeof current === 'string') {
      if (typeof current === 'string' && /^data:/i.test(current)) {
        return refuse('Receipt photos must be staged in server storage before saving online.');
      }
      return current;
    }
    if (typeof current === 'number') {
      if (!Number.isFinite(current)) return refuse('Invalid numeric value in draft.');
      return current;
    }
    if (typeof current !== 'object' || seen.has(current)) return refuse('Unsupported value in draft.');
    seen.add(current);
    let result: unknown;
    if (Array.isArray(current)) {
      if (Object.keys(current).length !== current.length ||
          Object.getOwnPropertySymbols(current).length !== 0) {
        return refuse('Draft contains a sparse or decorated list.');
      }
      result = current.map(entry => visit(entry, depth + 1));
    } else {
      const prototype = Object.getPrototypeOf(current);
      if (prototype !== Object.prototype && prototype !== null ||
          Object.getOwnPropertySymbols(current).length !== 0) {
        return refuse('Unsupported object in draft.');
      }
      const copy: Record<string, unknown> = {};
      for (const [key, entry] of Object.entries(current)) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          return refuse('Invalid draft property.');
        }
        if (entry !== undefined) copy[key] = visit(entry, depth + 1);
        else if (depth <= 1) return refuse('A required draft field is missing.');
      }
      result = copy;
    }
    seen.delete(current);
    return result;
  }
  const normalized = visit(value, 0);
  if (JSON.stringify(normalized).length > MAX_BYTES) refuse('Purchase draft is too large.');
  return normalized;
}

function editorFields(raw: unknown): raw is PurchaseDraftInput {
  return object(raw) && exact(raw, EDITOR_KEYS) &&
    typeof raw.tenantId === 'string' && typeof raw.supplierId === 'string' &&
    typeof raw.supplierName === 'string' && validDay(raw.date) &&
    typeof raw.backdateReason === 'string' &&
    typeof raw.referenceNo === 'string' && typeof raw.notes === 'string' &&
    Array.isArray(raw.lines) && Array.isArray(raw.payments) &&
    typeof raw.discount === 'string' &&
    (raw.discountMode === 'percent' || raw.discountMode === 'amount') &&
    Array.isArray(raw.photos) && typeof raw.total === 'number' &&
    Number.isFinite(raw.total) && raw.total >= 0;
}
function displayLabel(editor: PurchaseDraftInput): string {
  return (editor.referenceNo.trim() || editor.supplierName.trim() ||
    'Unfinished purchase').slice(0, 80);
}
function amountMinor(total: number): number {
  try {
    const minor = parseScaledInput(String(total), 2);
    if (minor >= 0) return minor;
  } catch { /* User-visible validation below. */ }
  return refuse('Purchase draft total must have at most two decimal places.');
}

/**
 * Serialize the exact existing PurchaseEditor draft, rejecting fixture IDs and
 * incomplete connected source lists. The server's cart is opaque and cannot
 * be used as proof of ownership or current stock when posting a real invoice.
 */
export function encodePurchaseEditorDraft(
  session: ConnectedPurchaseSession,
  sources: PurchaseDraftSources,
  input: PurchaseDraftInput,
): PurchaseDraftPayload {
  authorized(session, sources);
  if (!editorFields(input) || input.tenantId !== session.tenantId ||
      input.photos.length !== 0 || input.lines.length > 500 ||
      input.lines.some(line => !object(line) || !object(line.product) ||
        !validId(line.product.id) || !sources.productIds.has(line.product.id) ||
        typeof line.id !== 'string' || !line.id) ||
      new Set(input.lines.map(line => line.id)).size !== input.lines.length ||
      (input.supplierId !== '' &&
        (!validId(input.supplierId) || !sources.supplierNames.has(input.supplierId))) ||
      (input.supplierId === '' && input.supplierName !== '') ||
      (input.supplierId !== '' &&
        input.supplierName !== sources.supplierNames.get(input.supplierId))) {
    return refuse('Draft contains an unknown supplier, product, or unsupported receipt photo.');
  }

  // Explicit canonicalization of nested optional undefined properties; all
  // supplied multi-unit quantities, serial/batch fields and payments remain.
  const copy = safeJson(input);
  if (!editorFields(copy)) return refuse('Purchase draft changed during serialization.');
  const cart: Record<string, unknown> = {
    schema: EDITOR_SCHEMA,
    tenantId: session.tenantId,
    editor: copy,
  };
  if (JSON.stringify(cart).length > MAX_BYTES) return refuse('Purchase draft is too large.');
  return {
    label: displayLabel(copy),
    supplierName: copy.supplierName || null,
    itemCount: copy.lines.length,
    grandTotalMinor: amountMinor(copy.total),
    cart,
  };
}

/** JSONB object-key order is not stable; compare semantic JSON values. */
function ordered(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(ordered).join(',') + ']';
  if (object(value)) return '{' + Object.keys(value).sort().map(key =>
    JSON.stringify(key) + ':' + ordered(value[key])).join(',') + '}';
  return JSON.stringify(value);
}

/**
 * Prepare exactly one new-draft intent before sending an HTTP request.
 * Retain this object through ambiguous network failures; never generate a
 * second operation ID for the same original draft creation.
 */
export function preparePurchaseEditorDraftCreate(
  session: ConnectedPurchaseSession,
  sources: PurchaseDraftSources,
  editor: PurchaseDraftInput,
): PreparedPurchaseDraftCreate {
  const payload = encodePurchaseEditorDraft(session, sources, editor);
  const identity = currentDraftIdentity(session);
  const intent = Object.freeze({ operationId: generateCreateOperationId() });
  preparedCreates.set(intent, { identity, serialized: JSON.stringify(payload) });
  return intent;
}

/**
 * Read/restore only after verifying current session/tenant and LIVE server
 * source IDs. Do not hydrate preview stores or trust serialized product data
 * for a subsequent financial posting.
 */
export function decodePurchaseEditorDraft(
  session: ConnectedPurchaseSession,
  sources: PurchaseDraftSources,
  saved: ServerPurchaseDraft,
): ResolvedPurchaseEditorDraft {
  authorized(session, sources);
  if (!object(saved) || !validId(saved.id) || !Number.isSafeInteger(saved.version) ||
      saved.version < 1 || !object(saved.cart) ||
      !exact(saved.cart, ['schema', 'tenantId', 'editor']) ||
      saved.cart.schema !== EDITOR_SCHEMA || saved.cart.tenantId !== session.tenantId ||
      !editorFields(saved.cart.editor)) {
    return refuse('Stored purchase draft has an incompatible editor snapshot.');
  }
  const editor = saved.cart.editor;
  const projected = encodePurchaseEditorDraft(session, sources, editor);
  if (saved.label !== projected.label ||
      saved.supplierName !== projected.supplierName ||
      saved.itemCount !== projected.itemCount ||
      saved.grandTotalMinor !== projected.grandTotalMinor ||
      ordered(saved.cart) !== ordered(projected.cart)) {
    return refuse('Stored draft details differ from the current editor snapshot.');
  }
  return {
    id: saved.id,
    version: saved.version,
    savedAt: saved.savedAt,
    deletedAt: saved.deletedAt,
    recoverableUntilEpochMs: saved.recoverableUntilEpochMs,
    editor: structuredClone(editor),
  };
}

export async function listPurchaseEditorDrafts(
  session: ConnectedPurchaseSession,
  sources: PurchaseDraftSources,
  state: 'active' | 'deleted' = 'active',
  signal?: AbortSignal,
): Promise<readonly ResolvedPurchaseEditorDraft[]> {
  authorized(session, sources);
  const response = await readPurchaseDrafts(session.accessToken, state, signal);
  return response.data.map(item => decodePurchaseEditorDraft(session, sources, item));
}
export async function loadPurchaseEditorDraft(
  session: ConnectedPurchaseSession,
  sources: PurchaseDraftSources,
  id: string,
  signal?: AbortSignal,
): Promise<ResolvedPurchaseEditorDraft> {
  authorized(session, sources);
  const response = await readPurchaseDraft(session.accessToken, id, signal);
  return decodePurchaseEditorDraft(session, sources, response.data);
}
export async function savePurchaseEditorDraft(
  session: ConnectedPurchaseSession,
  sources: PurchaseDraftSources,
  editor: PurchaseDraftInput,
  existing?: { id: string; version: number } | null,
  signal?: AbortSignal,
  createIntent?: PreparedPurchaseDraftCreate,
): Promise<ResolvedPurchaseEditorDraft> {
  const payload = encodePurchaseEditorDraft(session, sources, editor);
  if (existing && createIntent) return refuse('Draft update cannot reuse a new-create operation ID.');
  let response;
  if (existing) {
    response = await updatePurchaseDraft(session.accessToken, existing.id,
      { ...payload, expectedVersion: existing.version }, signal);
  } else {
    if (!createIntent || !validId(createIntent.operationId)) {
      return refuse('Prepare a stable Purchase Draft creation intent before saving.');
    }
    const savedIntent = preparedCreates.get(createIntent);
    if (!savedIntent || savedIntent.identity !== currentDraftIdentity(session) ||
        ordered(payload) !== ordered(JSON.parse(savedIntent.serialized))) {
      return refuse('Creation intent is stale or the draft content has changed.');
    }
    const original = JSON.parse(savedIntent.serialized) as PurchaseDraftPayload;
    const createBody: CreatePurchaseDraftPayload = {
      ...original, operationId: createIntent.operationId,
    };
    // Exactly one HTTP request per caller action; retain intent even after a
    // timeout/abort/409, and do not create a substitute document.
    response = await createPurchaseDraft(session.accessToken, createBody, signal);
  }
  if (existing && (response.data.id !== existing.id ||
      response.data.version !== existing.version + 1)) {
    return refuse('Saved purchase draft version was not verified.');
  }
  return decodePurchaseEditorDraft(session, sources, response.data);
}
export async function recyclePurchaseEditorDraft(
  session: ConnectedPurchaseSession,
  sources: PurchaseDraftSources,
  current: { id: string; version: number },
  signal?: AbortSignal,
): Promise<ResolvedPurchaseEditorDraft> {
  authorized(session, sources);
  const { data } = await recyclePurchaseDraft(session.accessToken, current.id,
    { expectedVersion: current.version }, signal);
  if (data.id !== current.id || data.version !== current.version + 1 ||
      data.deletedAt === null) return refuse('Draft deletion was not verified.');
  return decodePurchaseEditorDraft(session, sources, data);
}
export async function restorePurchaseEditorDraft(
  session: ConnectedPurchaseSession,
  sources: PurchaseDraftSources,
  current: { id: string; version: number },
  signal?: AbortSignal,
): Promise<ResolvedPurchaseEditorDraft> {
  authorized(session, sources);
  const { data } = await restorePurchaseDraft(session.accessToken, current.id,
    { expectedVersion: current.version }, signal);
  if (data.id !== current.id || data.version !== current.version + 1 ||
      data.deletedAt !== null) return refuse('Draft restoration was not verified.');
  return decodePurchaseEditorDraft(session, sources, data);
}
