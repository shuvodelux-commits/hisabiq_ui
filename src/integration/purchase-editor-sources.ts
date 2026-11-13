import { ApiError } from './errors.ts';
import { readProduct, readProducts } from './products.ts';
import type { ServerProduct, ServerProductList } from './products.ts';
import { readPurchaseSupplier, readPurchaseSuppliers } from './purchase-suppliers.ts';
import type { PurchaseSupplierList, ServerPurchaseSupplier } from './purchase-suppliers.ts';
import type { PurchaseDraftSources } from './purchase-draft-editor.ts';
import type { SessionSnapshot } from './session.ts';

/**
 * MOD-008 P4A: read-only, tenant-scoped, API-confirmed source identities for
 * a future connected Purchase Editor. This DOES NOT hydrate the existing
 * preview product/party models or assert advanced unit/price parity.
 *
 * Product/party DTOs omit tenantId: their provenance is the Nest server's
 * signed JWT tenant guard + PostgreSQL tenant/RLS predicates. Never insert
 * IDs from URL parameters, local storage, preview ERP stores or another token.
 */
export interface PurchaseSourceSelection {
  readonly supplierId: string; // '' is allowed on an unfinished draft
  readonly productIds: readonly string[];
}
export interface PurchaseSourceChoicesQuery {
  readonly search?: string;
  readonly supplierCursor?: string;
  readonly productCursor?: string;
  readonly limit?: number;
}
export interface PurchaseEditorSourceChoices {
  readonly identity: string;
  readonly suppliers: PurchaseSupplierList;
  readonly products: ServerProductList;
  readonly supplierHasMore: boolean;
  readonly productHasMore: boolean;
}
export interface ResolvedPurchaseEditorSources {
  /** Opaque fingerprint for UI caller to compare against the current session. */
  readonly identity: string;
  readonly sources: PurchaseDraftSources;
  readonly supplier: ServerPurchaseSupplier | null;
  readonly products: ReadonlyMap<string, ServerProduct>;
}

const ULID = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const MAX_SELECTED_PRODUCTS = 500;
const MAX_PARALLEL_DETAIL_READS = 5;
const REQUIRED_PERMISSIONS = [
  'purchase.bill.create',
  'inventory.cost.view',
  'party.supplier.view',
  'catalog.product.view',
] as const;

function invalid(message = 'Purchase Editor source identity could not be verified'): never {
  throw new ApiError('protocol', message);
}
function validId(value: unknown): value is string {
  return typeof value === 'string' && ULID.test(value);
}
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function purchaseSourceIdentity(session: SessionSnapshot): string {
  if (!session || session.status !== 'authenticated' ||
      !validId(session.tenantId) || !validId(session.userId) ||
      !Number.isSafeInteger(session.epoch) || session.epoch < 0 ||
      typeof session.accessToken !== 'string' || !session.accessToken ||
      /\s/.test(session.accessToken) || !Array.isArray(session.permissions) ||
      !REQUIRED_PERMISSIONS.every(permission => session.permissions.includes(permission))) {
    return invalid('Verified purchase, supplier, product and cost access is required');
  }
  // Never log or persist this opaque identity: bearer rotation is deliberately
  // part of the key, preventing stale response reuse after reauthentication.
  return JSON.stringify([session.tenantId, session.userId, session.epoch, session.accessToken]);
}

function token(session: SessionSnapshot): string {
  purchaseSourceIdentity(session);
  if (session.status !== 'authenticated') return invalid();
  return session.accessToken;
}
function verifiedSupplier(value: ServerPurchaseSupplier, expected?: string): ServerPurchaseSupplier {
  if (!validId(value?.id) || (expected !== undefined && value.id !== expected) ||
      value.status !== 'ACTIVE' || value.isSystemReserved ||
      !value.roles.includes('SUPPLIER') || !value.name.trim()) {
    return invalid('Supplier no longer has an active verified supplier role');
  }
  return value;
}
function verifiedProduct(value: ServerProduct, expected?: string): ServerProduct {
  if (!validId(value?.id) || (expected !== undefined && value.id !== expected) ||
      value.status !== 'ACTIVE' ||
      !Object.prototype.hasOwnProperty.call(value, 'purchasePriceMinor') ||
      !Number.isSafeInteger(value.purchasePriceMinor) ||
      (value.purchasePriceMinor ?? -1) < 0 ||
      (value.conversion !== null &&
        (value.conversion.unitId === value.baseUnitId ||
          value.conversion.unitName === value.baseUnitName))) {
    return invalid('Product is inactive or cost/unit source is incomplete');
  }
  return value;
}

/**
 * Load one real, bounded server page of supplier/product choices. A pagination
 * cursor is kept visible; never imply that a page enumerates all products.
 */
export async function readPurchaseEditorSourceChoices(
  session: SessionSnapshot,
  query: PurchaseSourceChoicesQuery = {},
  signal?: AbortSignal,
): Promise<PurchaseEditorSourceChoices> {
  const identity = purchaseSourceIdentity(session);
  if (signal?.aborted) return invalid('Purchase source request was cancelled');
  const accessToken = token(session);
  if (!object(query) ||
      Object.keys(query).some(key => !['search','supplierCursor','productCursor','limit'].includes(key))) return invalid();
  const rawLimit: unknown = query.limit;
  if (rawLimit !== undefined && (typeof rawLimit !== 'number' ||
      !Number.isSafeInteger(rawLimit))) return invalid();
  const limit = typeof rawLimit === 'number' ? rawLimit : 50;
  if (limit < 1 || limit > 200 ||
      (query.search !== undefined && (typeof query.search !== 'string' ||
        query.search.length > 120)) ||
      (query.supplierCursor !== undefined && !validId(query.supplierCursor)) ||
      (query.productCursor !== undefined && !validId(query.productCursor))) return invalid();
  const [suppliers, products] = await Promise.all([
    readPurchaseSuppliers(accessToken, {
      ...(query.search !== undefined ? { search: query.search } : {}),
      ...(query.supplierCursor ? { cursor: query.supplierCursor } : {}),
      status: 'ACTIVE', limit,
    }, signal),
    readProducts(accessToken, {
      ...(query.search !== undefined ? { search: query.search } : {}),
      ...(query.productCursor ? { cursor: query.productCursor } : {}),
      status: 'ACTIVE', limit,
    }, signal),
  ]);
  if (signal?.aborted || suppliers.data.length > limit || products.data.length > limit ||
      new Set(products.data.map(value => value.id)).size !== products.data.length ||
      suppliers.data.some(value => value.status !== 'ACTIVE') ||
      products.data.some(value => value.status !== 'ACTIVE') ||
      products.page.hasMore !== (products.page.nextCursor !== null)) return invalid();

  suppliers.data.forEach(row => verifiedSupplier(row));
  products.data.forEach(row => verifiedProduct(row));
  return {
    identity,
    suppliers, products,
    supplierHasMore: suppliers.page.hasMore,
    productHasMore: products.page.hasMore,
  };
}

/**
 * Resolve exact selected server IDs for PurchaseDraftSources. Detail reads,
 * rather than a single partial page, prevent a selected item from being
 * incorrectly treated as unknown when it falls outside the first 50 results.
 *
 * Fail the ENTIRE resolution on one missing/denied/inactive/redacted source.
 * The caller must compare result.identity with purchaseSourceIdentity(current
 * session) before using it; a logout/tenant switch invalidates its outcome.
 *
 * This validates source existence only; it is NOT sufficient to confirm or
 * post an inventory purchase. The server lacks the full HisabIQ D03 unit chain.
 */
export async function resolvePurchaseEditorSources(
  session: SessionSnapshot,
  selection: PurchaseSourceSelection,
  signal?: AbortSignal,
): Promise<ResolvedPurchaseEditorSources> {
  const identity = purchaseSourceIdentity(session);
  if (signal?.aborted) return invalid('Purchase source request was cancelled');
  const accessToken = token(session);
  if (!object(selection) ||
      Object.keys(selection).some(key => key !== 'supplierId' && key !== 'productIds') ||
      typeof selection.supplierId !== 'string' ||
      (selection.supplierId !== '' && !validId(selection.supplierId)) ||
      !Array.isArray(selection.productIds) ||
      selection.productIds.length > MAX_SELECTED_PRODUCTS ||
      !selection.productIds.every(validId) ||
      new Set(selection.productIds).size !== selection.productIds.length) return invalid();

  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const result = new Map<string, ServerProduct>();
  let next = 0;
  try {
    async function worker(): Promise<void> {
      while (next < selection.productIds.length && !controller.signal.aborted) {
        const productId = selection.productIds[next++]!;
        const response = await readProduct(accessToken, productId, controller.signal);
        const product = verifiedProduct(response.data, productId);
        result.set(productId, product);
      }
    }
    const jobs: Promise<unknown>[] = [];
    if (selection.supplierId) {
      const supplierId = selection.supplierId;
      jobs.push(readPurchaseSupplier(accessToken, supplierId, controller.signal)
        .then(response => verifiedSupplier(response.data, supplierId)));
    }
    const workerCount = Math.min(MAX_PARALLEL_DETAIL_READS, selection.productIds.length);
    for (let index = 0; index < workerCount; index++) jobs.push(worker());
    const outcome = await Promise.all(jobs);
    if (controller.signal.aborted || result.size !== selection.productIds.length) return invalid();
    const supplier = (selection.supplierId ? outcome[0] : null) as ServerPurchaseSupplier | null;
    const sourceMap: PurchaseDraftSources = {
      tenantId: session.status === 'authenticated' ? session.tenantId : invalid(),
      productIds: new Set(result.keys()),
      supplierNames: supplier === null ? new Map() : new Map([[supplier.id, supplier.name]]),
    };
    return { identity, sources: sourceMap, supplier, products: result };
  } catch (error) {
    controller.abort();
    throw error;
  } finally {
    signal?.removeEventListener('abort', abort);
  }
}
