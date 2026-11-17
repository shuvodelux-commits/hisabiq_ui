import { ApiError } from './errors.ts';
import type {
  InventoryOverviewEnvelope,
  InventoryLotPageEnvelope,
  InventoryAdjustmentsEnvelope,
  InventoryStockRow,
  InventoryMovement,
  InventoryLot,
  InventoryAdjustmentRow,
  InventoryExpirySummary,
} from './inventory.ts';
import type { ServerProduct, ServerProductList } from './products.ts';

/**
 * MOD-003 T01-R/P2A — a pure, read-only projection of independently fetched
 * *verified* resource envelopes. The caller must provide a unique auth-context
 * scope for every response and discard all contexts on tenant/token change.
 * Scope keys are NOT a substitute for backend RLS/permissions.
 *
 * This does not adapt data into preview StockLot/StockMovement types. Their
 * running balances, batch/manufacture/serial and sale-price attributes are not
 * in the current Nest read contracts; inventing them is unsafe.
 *
 * All quantities remain server base-unit integers scaled by 1000.
 * Cost fields remain optional and are never derived or defaulted to zero.
 * Bounded movement/adjustment reads and lot pages never imply global totals.
 */

export interface ScopedInventoryRead<T> {
  /** Caller-assigned auth/tenant session scope, never sent as a tenant header. */
  scope: string;
  value: T;
}

export interface InventoryPresentationInput {
  scope: string;
  inventory?: ScopedInventoryRead<InventoryOverviewEnvelope>;
  products?: ScopedInventoryRead<ServerProductList>;
  lots?: ScopedInventoryRead<InventoryLotPageEnvelope>;
  adjustments?: ScopedInventoryRead<InventoryAdjustmentsEnvelope>;
}

export type UnavailableInventoryField = {
  state: 'unavailable';
  reason: 'not-in-api';
};

export type ProductReference =
  | { state: 'unresolved'; reason: 'products-not-loaded' | 'not-in-provided-products' }
  | { state: 'ambiguous'; reason: 'duplicate-product-id' }
  | {
      state: 'matched';
      product: Pick<ServerProduct, 'id' | 'displayName' | 'baseUnitName' | 'status' | 'version'>;
    };

export interface InventoryStockPresentation {
  source: InventoryStockRow;
  product: ProductReference;
  /** Two server rows claim the same product and location; don't aggregate. */
  duplicateLocation: boolean;
  /** Null when product detail is unavailable or ambiguous. */
  unitMismatch: boolean | null;
  statusMismatch: boolean | null;
}
export interface InventoryMovementPresentation {
  source: InventoryMovement;
  product: ProductReference;
  runningBalance: UnavailableInventoryField;
  note: UnavailableInventoryField;
}
export interface InventoryLotPresentation {
  source: InventoryLot;
  product: ProductReference;
  batchNumber: UnavailableInventoryField;
  manufactureDate: UnavailableInventoryField;
  serials: UnavailableInventoryField;
  lotSalePriceMinor: UnavailableInventoryField;
}
export interface InventoryAdjustmentPresentation {
  source: InventoryAdjustmentRow;
  product: ProductReference;
}
export type NotLoaded = { state: 'not-loaded' };
export interface BoundedRows<T> {
  state: 'loaded';
  rows: T[];
  /** The report API limits rows; complete history is not established. */
  coverage: 'bounded';
}
export interface StockRows {
  state: 'loaded';
  rows: InventoryStockPresentation[];
  /** No global completeness/valuation can be inferred from this response. */
  coverage: 'unspecified';
}
export interface LotsPage {
  state: 'loaded';
  rows: InventoryLotPresentation[];
  /** Even hasMore=false covers only this server filter/page. */
  coverage: 'keyset-page';
  page: { nextCursor: string | null; hasMore: boolean };
  valuationMethod: 'FIFO' | 'AVERAGE';
  expiry?: InventoryExpirySummary;
}
export interface InventoryPresentation {
  scope: string;
  /** 'page' does not certify a complete tenant-wide catalog. */
  catalog: { state: 'not-loaded' | 'page' | 'partial' };
  stock: NotLoaded | StockRows;
  movements: NotLoaded | BoundedRows<InventoryMovementPresentation>;
  lots: NotLoaded | LotsPage;
  adjustments: NotLoaded | BoundedRows<InventoryAdjustmentPresentation>;
}

function invalid(): never {
  throw new ApiError('protocol', 'Inventory presentation source or scope could not be verified');
}

function unavailable(): UnavailableInventoryField {
  return { state: 'unavailable', reason: 'not-in-api' };
}

function buildLookup(products?: ServerProductList): (productId: string) => ProductReference {
  if (products === undefined) {
    return () => ({ state: 'unresolved', reason: 'products-not-loaded' });
  }

  // A duplicate ID is not silently resolved to the first or last product.
  const records = new Map<string, ServerProduct | null>();
  for (const product of products.data) {
    if (records.has(product.id)) records.set(product.id, null);
    else records.set(product.id, product);
  }
  return productId => {
    if (!records.has(productId)) {
      return { state: 'unresolved', reason: 'not-in-provided-products' };
    }
    const product = records.get(productId);
    if (product === null || product === undefined) {
      return { state: 'ambiguous', reason: 'duplicate-product-id' };
    }
    return {
      state: 'matched',
      product: {
        id: product.id,
        displayName: product.displayName,
        baseUnitName: product.baseUnitName,
        status: product.status,
        version: product.version,
      },
    };
  };
}

/**
 * Pure projection: does not fetch, write, sum, round, infer a running balance,
 * or promote preview fixtures to real business data.
 */
export function projectInventoryPresentation(input: InventoryPresentationInput): InventoryPresentation {
  const scope = input.scope;
  if (typeof scope !== 'string' || scope.length === 0 || /\s/.test(scope)) return invalid();

  // This catches accidental mixing of responses from different caller auth
  // contexts, but the server must still enforce every actual tenant boundary.
  for (const source of [input.inventory, input.products, input.lots, input.adjustments]) {
    if (source !== undefined && (source.scope !== scope || !source.value)) return invalid();
  }
  const lookup = buildLookup(input.products?.value);
  const inventory = input.inventory?.value;
  const lots = input.lots?.value;
  const adjustments = input.adjustments?.value;

  const occurrences = new Map<string, number>();
  for (const item of inventory?.data.stock ?? []) {
    const key = item.productId + ':' + (item.locationId ?? '(none)');
    occurrences.set(key, (occurrences.get(key) ?? 0) + 1);
  }

  const stock: InventoryPresentation['stock'] = inventory === undefined
    ? { state: 'not-loaded' }
    : {
      state: 'loaded', coverage: 'unspecified',
      rows: inventory.data.stock.map(item => {
        const link = lookup(item.productId);
        return {
          source: { ...item },
          product: link,
          duplicateLocation: (occurrences.get(item.productId + ':' + (item.locationId ?? '(none)')) ?? 0) > 1,
          unitMismatch: link.state === 'matched'
            ? link.product.baseUnitName !== item.baseUnitName : null,
          statusMismatch: link.state === 'matched'
            ? link.product.status !== item.productStatus : null,
        };
      }),
    };

  const movements: InventoryPresentation['movements'] = inventory === undefined
    ? { state: 'not-loaded' }
    : {
      state: 'loaded', coverage: 'bounded',
      rows: inventory.data.movements.map(item => ({
        source: { ...item },
        product: lookup(item.productId),
        runningBalance: unavailable(),
        note: unavailable(),
      })),
    };

  const lotProjection: InventoryPresentation['lots'] = lots === undefined
    ? { state: 'not-loaded' }
    : {
      state: 'loaded', coverage: 'keyset-page',
      page: { ...lots.data.page },
      valuationMethod: lots.data.valuationMethod,
      ...(lots.data.expiry === undefined ? {} : { expiry: { ...lots.data.expiry } }),
      rows: lots.data.data.map(item => ({
        source: { ...item },
        product: lookup(item.productId),
        batchNumber: unavailable(),
        manufactureDate: unavailable(),
        serials: unavailable(),
        lotSalePriceMinor: unavailable(),
      })),
    };

  const adjustmentProjection: InventoryPresentation['adjustments'] = adjustments === undefined
    ? { state: 'not-loaded' }
    : {
      state: 'loaded', coverage: 'bounded',
      rows: adjustments.data.map(item => ({
        source: { ...item },
        product: lookup(item.productId),
      })),
    };

  return {
    scope,
    catalog: {
      state: input.products === undefined ? 'not-loaded'
        : input.products.value.page.hasMore ? 'partial' : 'page',
    },
    stock,
    movements,
    lots: lotProjection,
    adjustments: adjustmentProjection,
  };
}
