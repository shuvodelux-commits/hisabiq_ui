import {
  decodeCatalogMetadataV1,
  type CatalogMetadataV1Brand,
  type CatalogMetadataV1Category,
  type CatalogMetadataV1Envelope,
  type CatalogMetadataV1Unit,
} from './catalog-metadata-v1.ts';

/**
 * MOD-002 T02A/P5c — an unmounted, connected-only Product Settings projection.
 *
 * Strict metadata-v1 GET includes active English/Bengali catalog masters,
 * symbols, stable IDs and optimistic versions. It does NOT include product
 * usage, reversible Active/Inactive state, a unit's Base/Compound-ready
 * classification or product defaults. Those must never be inferred from
 * fixtures, local preview state or a missing field.
 *
 * A projection is NOT a permission, migration, deployment or UX-parity gate.
 * A future connected screen must use CatalogMetadataSessionBridge for every
 * request and must not mount the complete editor while blockers remain.
 */

export type CatalogSettingsGapCode =
  | 'ATOMIC_FULL_NAME_EDIT_MISSING'
  | 'REVERSIBLE_STATUS_TOGGLE_MISSING'
  | 'ARCHIVED_MASTER_READ_MISSING'
  | 'USAGE_COUNTS_MISSING'
  | 'UNIT_CLASSIFICATION_MISSING'
  | 'CATEGORY_PARENT_EDITOR_MISSING'
  | 'PRODUCT_DEFAULTS_SEPARATE';

export interface CatalogSettingsGap {
  readonly code: CatalogSettingsGapCode;
  readonly reason: string;
}

export interface ConnectedCatalogBase {
  readonly id: string;
  readonly name: string;
  readonly nameBn: string | null;
  readonly version: number;
  /** The metadata-v1 response does not expose a usage count. Never display 0. */
  readonly usageCount: null;
  /** GET filters archived records; it does not provide a reversible status. */
  readonly active: null;
}

export interface ConnectedCatalogUnit extends ConnectedCatalogBase {
  readonly symbol: string | null;
  /** Cannot be derived from the catalog label or unit symbol. */
  readonly unitKind: null;
}

export interface ConnectedCatalogBrand extends ConnectedCatalogBase {}

export interface ConnectedCatalogCategory extends ConnectedCatalogBase {
  readonly parentId: string | null;
  /** Unresolved parent IDs are preserved rather than guessed or discarded. */
  readonly parentState: 'root' | 'present' | 'unresolved';
}

export interface ConnectedProductSettingsProjection {
  readonly source: 'catalog-metadata-v1';
  readonly completeness: 'partial';
  readonly units: readonly ConnectedCatalogUnit[];
  readonly brands: readonly ConnectedCatalogBrand[];
  readonly categories: readonly ConnectedCatalogCategory[];
  /** API contracts exist, but are not a tenant deployment/permission approval. */
  readonly contracts: Readonly<{
    readonly versionedRead: true;
    readonly atomicBilingualCreate: true;
    readonly bengaliMetadataPatch: true;
    readonly atomicEnglishAndBengaliEdit: false;
    readonly reversibleActivation: false;
    readonly productUsageCounts: false;
    readonly unitClassification: false;
  }>;
  /**
   * Fail closed. Existing ProductSettings edit/toggle actions are NOT
   * represented faithfully by this metadata API. Do not swap its UI source.
   */
  readonly canMountFullConnectedEditor: false;
  readonly blockers: readonly CatalogSettingsGap[];
}

const GAP_DEFINITIONS: readonly CatalogSettingsGap[] = Object.freeze([
  Object.freeze({
    code: 'ATOMIC_FULL_NAME_EDIT_MISSING',
    reason: 'The current edit dialog saves English and Bengali names together; metadata-v1 PATCH cannot rename English, and two independent writes could partially save.',
  }),
  Object.freeze({
    code: 'REVERSIBLE_STATUS_TOGGLE_MISSING',
    reason: 'Product Settings toggles Active/Inactive; legacy remove may archive or delete and is not a reversible toggle.',
  }),
  Object.freeze({
    code: 'ARCHIVED_MASTER_READ_MISSING',
    reason: 'Versioned metadata GET lists only non-archived masters and does not return the inactive roster.',
  }),
  Object.freeze({
    code: 'USAGE_COUNTS_MISSING',
    reason: 'The metadata GET has no usage/product counts; unknown is not zero.',
  }),
  Object.freeze({
    code: 'UNIT_CLASSIFICATION_MISSING',
    reason: 'Base versus Compound-ready cannot be established from a name or display-only symbol.',
  }),
  Object.freeze({
    code: 'CATEGORY_PARENT_EDITOR_MISSING',
    reason: 'The current category add form has no parent ID selection; backend subcategory creates require an explicit stable parent ID.',
  }),
  Object.freeze({
    code: 'PRODUCT_DEFAULTS_SEPARATE',
    reason: 'Business product defaults come from TenantSettingsProvider, not from metadata-v1 catalog features.',
  }),
]);

const CONTRACTS = Object.freeze({
  versionedRead: true,
  atomicBilingualCreate: true,
  bengaliMetadataPatch: true,
  atomicEnglishAndBengaliEdit: false,
  reversibleActivation: false,
  productUsageCounts: false,
  unitClassification: false,
} as const);

function base(row: CatalogMetadataV1Unit | CatalogMetadataV1Brand | CatalogMetadataV1Category): ConnectedCatalogBase {
  return {
    id: row.id,
    name: row.name,
    nameBn: row.nameBn,
    version: row.version,
    usageCount: null,
    active: null,
  };
}

/**
 * Pure, tenant-cache-free adapter. Always re-validate a caller-supplied
 * envelope using the existing strict versioned decoder. It cannot receive
 * an arbitrary tenant ID, create local IDs, write or mutate preview state.
 */
export function projectConnectedProductSettings(
  raw: unknown,
): ConnectedProductSettingsProjection {
  const envelope: CatalogMetadataV1Envelope = decodeCatalogMetadataV1(raw);
  const catalog = envelope.data;
  const categoryIds = new Set(catalog.categories.map(row => row.id));

  const units = Object.freeze(catalog.units.map(row =>
    Object.freeze({ ...base(row), symbol: row.symbol, unitKind: null })));
  const brands = Object.freeze(catalog.brands.map(row =>
    Object.freeze(base(row))));
  const categories = Object.freeze(catalog.categories.map(row =>
    Object.freeze({
      ...base(row),
      parentId: row.parentId,
      parentState: row.parentId === null ? 'root'
        : categoryIds.has(row.parentId) ? 'present' : 'unresolved',
    } as ConnectedCatalogCategory)));

  return Object.freeze({
    source: 'catalog-metadata-v1',
    completeness: 'partial',
    units,
    brands,
    categories,
    contracts: CONTRACTS,
    canMountFullConnectedEditor: false,
    blockers: GAP_DEFINITIONS,
  });
}
