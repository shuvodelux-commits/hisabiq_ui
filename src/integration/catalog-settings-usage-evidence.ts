import { ApiError } from './errors.ts';
import {
  decodeCatalogMetadataV1,
  type CatalogMetadataV1Brand,
  type CatalogMetadataV1Category,
  type CatalogMetadataV1Unit,
} from './catalog-metadata-v1.ts';
import {
  decodeCatalogSettingsUsageV1,
  type CatalogSettingsUsageV1CategoryCount,
  type CatalogSettingsUsageV1Count,
} from './catalog-settings-usage-v1.ts';

/**
 * MOD-002 P7e: NON-ATOMIC, read-only evidence from two independent signed GETs.
 *
 * Neither response carries a shared database snapshot/revision. The caller
 * must separately establish session identity (P7d); this PURE function cannot
 * verify the tenant from the two envelopes. Matched counts are advisory only,
 * never a deletion/archive/reversible-status eligibility check.
 *
 * metadata-v1 lists non-deleted masters; usage-v1 may contain archived rows.
 * An ID outside metadata's roster is NOT proof of archive/inactivity: a write
 * between the two GETs is also possible. Missing counts are unknown, NOT zero.
 */
export type CatalogUsageEvidenceParentState = 'root' | 'present' | 'unresolved';
export type CatalogUsageEvidenceUnit = Readonly<CatalogMetadataV1Unit & {
  productCount: number | null;
  active: null;
  unitKind: null;
}>;
export type CatalogUsageEvidenceBrand = Readonly<CatalogMetadataV1Brand & {
  productCount: number | null;
  active: null;
}>;
export type CatalogUsageEvidenceCategory = Readonly<CatalogMetadataV1Category & {
  directProductCount: number | null;
  subtreeProductCount: number | null;
  parentVisibility: CatalogUsageEvidenceParentState;
  usageParentState: CatalogUsageEvidenceParentState | null;
  active: null;
}>;
export interface CatalogUsageEvidenceIds {
  readonly unitIds: readonly string[];
  readonly brandIds: readonly string[];
  readonly categoryIds: readonly string[];
}
export interface CatalogSettingsUsageEvidence {
  readonly source: 'catalog-metadata-v1+settings-usage-v1';
  readonly completeness: 'partial';
  readonly crossSnapshotConsistency: 'unverified';
  readonly canUseForMutation: false;
  readonly canMountFullConnectedEditor: false;
  readonly units: readonly CatalogUsageEvidenceUnit[];
  readonly brands: readonly CatalogUsageEvidenceBrand[];
  readonly categories: readonly CatalogUsageEvidenceCategory[];
  /** May be archived or changed between the independently obtained GETs. */
  readonly usageIdsOutsideRoster: CatalogUsageEvidenceIds;
  /** Missing from usage GET. This is UNKNOWN, never fabricated zero. */
  readonly usageIdsMissingForRoster: CatalogUsageEvidenceIds;
  /** Preserve orphaned foreign references returned by the backend. */
  readonly unresolved: Readonly<CatalogUsageEvidenceIds & {
    readonly parentIds: readonly string[];
  }>;
  readonly categoryParentMismatches: readonly string[];
}

function requireUniqueMasterIds<T extends { id: string }>(rows: readonly T[]): void {
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.id)) {
      throw new ApiError('protocol', 'Catalog metadata contains duplicate master IDs');
    }
    seen.add(row.id);
  }
}

function freezeIds(
  unitIds: readonly string[],
  brandIds: readonly string[],
  categoryIds: readonly string[],
): CatalogUsageEvidenceIds {
  return Object.freeze({
    unitIds: Object.freeze([...unitIds]),
    brandIds: Object.freeze([...brandIds]),
    categoryIds: Object.freeze([...categoryIds]),
  });
}
function missing<T extends { id: string }>(
  current: readonly T[],
  counts: ReadonlyMap<string, unknown>,
): readonly string[] {
  return current.filter(row => !counts.has(row.id)).map(row => row.id);
}
function outside<T extends { id: string }>(
  counts: readonly T[],
  currentIds: ReadonlySet<string>,
): readonly string[] {
  return counts.filter(row => !currentIds.has(row.id)).map(row => row.id);
}

/**
 * Produces evidence only. This function NEVER invokes a network request,
 * combines different kinds by display name, creates a missing/archived master
 * row, grants an activation flag, or edits Product Settings.
 */
export function reconcileCatalogSettingsUsageEvidence(
  metadataRaw: unknown,
  usageRaw: unknown,
): CatalogSettingsUsageEvidence {
  // Decode BOTH before exposing partial data. Strict upstream decoders check
  // exact wire keys, ULIDs, counts and category relation shapes. The metadata
  // decoder does NOT itself check duplicate master IDs, so we do so here.
  const metadata = decodeCatalogMetadataV1(metadataRaw).data;
  const usage = decodeCatalogSettingsUsageV1(usageRaw).data;
  requireUniqueMasterIds(metadata.units);
  requireUniqueMasterIds(metadata.brands);
  requireUniqueMasterIds(metadata.categories);

  const unitUsage: ReadonlyMap<string, CatalogSettingsUsageV1Count> =
    new Map(usage.units.map(row => [row.id, row]));
  const brandUsage: ReadonlyMap<string, CatalogSettingsUsageV1Count> =
    new Map(usage.brands.map(row => [row.id, row]));
  const categoryUsage: ReadonlyMap<string, CatalogSettingsUsageV1CategoryCount> =
    new Map(usage.categories.map(row => [row.id, row]));

  const unitIds = new Set(metadata.units.map(row => row.id));
  const brandIds = new Set(metadata.brands.map(row => row.id));
  const categoryIds = new Set(metadata.categories.map(row => row.id));

  const units = Object.freeze(metadata.units.map(row =>
    Object.freeze({
      ...row,
      productCount: unitUsage.get(row.id)?.productCount ?? null,
      active: null,
      unitKind: null,
    } as CatalogUsageEvidenceUnit)));

  const brands = Object.freeze(metadata.brands.map(row =>
    Object.freeze({
      ...row,
      productCount: brandUsage.get(row.id)?.productCount ?? null,
      active: null,
    } as CatalogUsageEvidenceBrand)));

  const categoryParentMismatches: string[] = [];
  const categories = Object.freeze(metadata.categories.map(row => {
    const ref = categoryUsage.get(row.id);
    const parentVisibility: CatalogUsageEvidenceParentState = row.parentId === null
      ? 'root' : categoryIds.has(row.parentId) ? 'present' : 'unresolved';
    const usageParentState = ref?.parentState ?? null;
    if (usageParentState !== null && usageParentState !== parentVisibility) {
      categoryParentMismatches.push(row.id);
    }
    return Object.freeze({
      ...row,
      directProductCount: ref?.directProductCount ?? null,
      subtreeProductCount: ref?.subtreeProductCount ?? null,
      parentVisibility,
      usageParentState,
      active: null,
    } as CatalogUsageEvidenceCategory);
  }));

  const usageIdsOutsideRoster = freezeIds(
    outside(usage.units, unitIds),
    outside(usage.brands, brandIds),
    outside(usage.categories, categoryIds),
  );
  const usageIdsMissingForRoster = freezeIds(
    missing(metadata.units, unitUsage),
    missing(metadata.brands, brandUsage),
    missing(metadata.categories, categoryUsage),
  );

  return Object.freeze({
    source: 'catalog-metadata-v1+settings-usage-v1',
    completeness: 'partial',
    crossSnapshotConsistency: 'unverified',
    canUseForMutation: false,
    canMountFullConnectedEditor: false,
    units, brands, categories,
    usageIdsOutsideRoster,
    usageIdsMissingForRoster,
    unresolved: Object.freeze({
      unitIds: Object.freeze([...usage.unresolved.unitIds]),
      brandIds: Object.freeze([...usage.unresolved.brandIds]),
      categoryIds: Object.freeze([...usage.unresolved.categoryIds]),
      parentIds: Object.freeze([...usage.unresolved.parentIds]),
    }),
    categoryParentMismatches: Object.freeze(categoryParentMismatches),
  });
}
