import { ApiError } from './errors.ts';
import { parseScaledInput } from './decimal.ts';
import { readPurchaseDraft } from './purchase-drafts.ts';
import { decodePurchaseEditorDraft } from './purchase-draft-editor.ts';
import {
  purchaseSourceIdentity,
  resolvePurchaseEditorSources,
} from './purchase-editor-sources.ts';
import type { ResolvedPurchaseEditorSources } from './purchase-editor-sources.ts';
import type { ServerProduct } from './products.ts';
import type { SessionSnapshot } from './session.ts';
import type { ResolvedPurchaseEditorDraft } from './purchase-draft-editor.ts';
import type { PurchaseCartLine } from '../utils/purchaseCart.ts';

/**
 * MOD-008 DRAFT-P4B: lossless, read-only connected Purchase Draft resume.
 *
 * Do not mount preview PurchaseEditor using this result: that editor initializes
 * fixture product/party stores and writes preview purchase postings. The Nest
 * ProductResponse only models one optional unit conversion and a base-unit
 * poisha price; it CANNOT authorize HisabIQ independent multilevel unit prices,
 * serial/lot/expiry policies, payment splits or a real purchase confirmation.
 *
 * The returned historical editor is kept byte-semantically intact by P2's
 * snapshot decoder, with fresh server source identities in a separate object.
 * Neither draft source nor read-only comparison is accounting authority.
 */
export type PurchaseResumeReviewCode =
  | 'PRODUCT_NAME_CHANGED'
  | 'BASE_UNIT_CHANGED'
  | 'ALTERNATE_UNIT_CHANGED'
  | 'PRODUCT_COST_CHANGED'
  | 'ADVANCED_UNITS_UNVERIFIED'
  | 'INDEPENDENT_PRICES_UNVERIFIED'
  | 'SERIAL_OR_EXPIRY_POLICY_UNVERIFIED'
  | 'LOT_FIELDS_UNVERIFIED';

export interface PurchaseResumeLineReview {
  readonly lineId: string;
  readonly productId: string;
  readonly codes: readonly PurchaseResumeReviewCode[];
}

export interface ConnectedPurchaseResumeReadOnly {
  /** Includes bearer rotation: never persist or log, always compare to live session. */
  readonly identity: string;
  readonly draft: ResolvedPurchaseEditorDraft;
  readonly sources: ResolvedPurchaseEditorSources;
  readonly lineReviews: readonly PurchaseResumeLineReview[];
  readonly paymentAccountsVerified: false;
  readonly serverAdvancedUnitsVerified: false;
  readonly canEdit: false;
  readonly canPost: false;
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const SCHEMA = 'hisabiq.purchase-editor.draft.v1';
const ROOT_CART_KEYS = ['schema', 'tenantId', 'editor'] as const;

function invalid(message = 'Purchase draft could not be safely reopened'): never {
  throw new ApiError('protocol', message);
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  return Object.keys(value).length === expected.length &&
    expected.every(key => Object.prototype.hasOwnProperty.call(value, key));
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function unchanged(identity: string, currentSession: () => SessionSnapshot, signal?: AbortSignal): void {
  if (signal?.aborted || purchaseSourceIdentity(currentSession()) !== identity) {
    invalid('The connected account or business changed while reopening this draft');
  }
}

/** A consumed result must also be checked immediately before rendering. */
export function connectedPurchaseResumeIsCurrent(
  resolved: ConnectedPurchaseResumeReadOnly | null,
  current: SessionSnapshot,
): boolean {
  if (!resolved) return false;
  try { return resolved.identity === purchaseSourceIdentity(current); }
  catch { return false; }
}

/**
 * Extract only source IDs from a verified server transport row before
 * requesting their details. Stored product objects, prices and unit factors
 * are untrusted historical draft data, never used as authority for POST.
 */
export function extractPurchaseDraftSourceSelection(
  cart: unknown,
  tenantId: string,
): { supplierId: string; productIds: string[] } {
  if (!validId(tenantId) || !record(cart) ||
      !exactKeys(cart, ROOT_CART_KEYS) ||
      cart.schema !== SCHEMA || cart.tenantId !== tenantId ||
      !record(cart.editor)) return invalid('Stored purchase draft has an incompatible source schema');
  const editor = cart.editor;
  if (editor.tenantId !== tenantId || typeof editor.supplierId !== 'string' ||
      (editor.supplierId !== '' && !validId(editor.supplierId)) ||
      !Array.isArray(editor.lines) || editor.lines.length > 500 ||
      !Array.isArray(editor.photos) || editor.photos.length !== 0) {
    return invalid('Stored draft has invalid source IDs or unstaged attachments');
  }

  const ids = new Set<string>();
  const lineIds = new Set<string>();
  for (const line of editor.lines) {
    if (!record(line) || !record(line.product) || !validId(line.product.id) ||
        typeof line.id !== 'string' || !line.id || lineIds.has(line.id)) {
      return invalid('Stored draft has invalid or repeated purchase line identities');
    }
    lineIds.add(line.id);
    ids.add(line.product.id);
  }
  return { supplierId: editor.supplierId, productIds: [...ids] };
}
function costDiffers(archived: unknown, server: ServerProduct): boolean {
  // This is a review flag, NOT a monetary comparison for posting. A stored
  // four-decimal cost cannot be silently rounded into the server's poisha.
  if (typeof archived !== 'number' || !Number.isFinite(archived) ||
      !Number.isSafeInteger(server.purchasePriceMinor)) return true;
  try {
    return parseScaledInput(String(archived), 2) !== server.purchasePriceMinor;
  } catch { return true; }
}
function reviewLine(line: PurchaseCartLine, server: ServerProduct): PurchaseResumeLineReview {
  const saved = line.product;
  const flags = new Set<PurchaseResumeReviewCode>();
  if (saved.name !== server.name) flags.add('PRODUCT_NAME_CHANGED');
  if (saved.unit !== server.baseUnitName) flags.add('BASE_UNIT_CHANGED');
  if (costDiffers(saved.purchasePrice, server)) flags.add('PRODUCT_COST_CHANGED');

  // factorQty is a server integer in scale 3 (e.g. 20000 => 20 Feet).
  // These are *comparison* flags only; never replace entered units or prices.
  if (saved.altUnit) {
    if (!server.conversion ||
        saved.altUnit.unit !== server.conversion.unitName ||
        !Number.isFinite(saved.altUnit.factor) ||
        saved.altUnit.factor * 1000 !== server.conversion.factorQty) {
      flags.add('ALTERNATE_UNIT_CHANGED');
    }
  } else if (server.conversion) {
    flags.add('ALTERNATE_UNIT_CHANGED');
  }

  if (saved.unitRelations?.length || line.unitQuantities) {
    flags.add('ADVANCED_UNITS_UNVERIFIED');
  }
  if (saved.unitPurchasePrices || saved.unitSellPrices ||
      line.costUnit !== saved.unit || (line.lotSellUnit !== saved.unit &&
        line.lotSellPrice.trim() !== '')) {
    flags.add('INDEPENDENT_PRICES_UNVERIFIED');
  }
  if (server.tracksSerial || server.tracksExpiry ||
      (saved.serialTracking && saved.serialTracking !== 'Off') ||
      saved.expiry?.enabled) {
    flags.add('SERIAL_OR_EXPIRY_POLICY_UNVERIFIED');
  }
  if (line.serialText || line.batchNumber || line.manufactureDate ||
      line.expiryDate || line.lotSellPrice) {
    flags.add('LOT_FIELDS_UNVERIFIED');
  }
  return { lineId: line.id, productId: saved.id, codes: [...flags] };
}

/**
 * One strict draft GET followed by exact source detail GETs only.
 *
 * Use a live session getter, not a captured snapshot, to detect switches
 * during the awaits; the caller must also compare identity at render time.
 * An invalid/deleted/foreign/preview draft must never trigger source probes.
 * No writes, cache, automatic retry, fixture reads or amount recalculation.
 */
export async function reopenConnectedPurchaseDraftReadOnly(
  currentSession: () => SessionSnapshot,
  draftId: string,
  signal?: AbortSignal,
): Promise<ConnectedPurchaseResumeReadOnly> {
  if (typeof currentSession !== 'function') return invalid();
  const initial = currentSession();
  const identity = purchaseSourceIdentity(initial);
  if (initial.status !== 'authenticated' || !validId(draftId) || signal?.aborted) {
    return invalid('A verified active purchase draft ID is required');
  }

  const { data: saved } = await readPurchaseDraft(initial.accessToken, draftId, signal);
  unchanged(identity, currentSession, signal);
  if (saved.deletedAt !== null || saved.id !== draftId) {
    return invalid('Deleted or mismatched purchase draft cannot be reopened');
  }

  const selection = extractPurchaseDraftSourceSelection(saved.cart, initial.tenantId);
  const sources = await resolvePurchaseEditorSources(initial, selection, signal);
  unchanged(identity, currentSession, signal);
  if (sources.identity !== identity) return invalid('Source verification used another connected identity');

  const draft = decodePurchaseEditorDraft(initial, sources.sources, saved);
  if (draft.deletedAt !== null || draft.id !== draftId) return invalid();
  const lineReviews = draft.editor.lines.map(line => {
    const product = sources.products.get(line.product.id);
    if (!product) return invalid('A draft product has no verified server source');
    return reviewLine(line, product);
  });
  unchanged(identity, currentSession, signal);
  return {
    identity, draft, sources, lineReviews,
    paymentAccountsVerified: false,
    serverAdvancedUnitsVerified: false,
    canEdit: false, canPost: false,
  };
}
