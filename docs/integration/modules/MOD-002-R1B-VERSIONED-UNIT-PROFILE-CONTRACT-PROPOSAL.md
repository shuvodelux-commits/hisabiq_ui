# MOD-002/R1-B — Versioned Product unit profile and source-snapshot contract

> **STATUS: CONDITIONAL ARCHITECTURE PROPOSAL, NOT APPROVED FOR IMPLEMENTATION.** This R1-B candidate compares storage strategies and specifies the minimum lossless API/transaction boundary. It deliberately does **not** choose a migration number, authorize a database read, freeze the D16 accounting policy, change a Product/POS/Purchase API or connect the React UI. **The owner still must explicitly approve R1-A pricing, quantity, rounding and return rules.**

**Pinned repository pair (2026-11-13, Asia/Dhaka):** frontend `shuvodelux-commits/hisabiq_ui@5bd99ad5cb6eb2ba4f8e46fafa3ab2e7b7a064c8`; backend adoption branch `shuvodelux-commits/nestshererp@54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a`. The backend changes after the prior audit at `d2060a7b...` are limited to `.agents/` tooling and `AGENTS.md`, so the previously audited catalog, stock and transaction sources remain unchanged as of this pin. This claim comes from a GitHub commit-file comparison, **not** from running a new backend or production database.

**Companions:** [R1-A proposed pricing decision](MOD-002-R1A-EXACT-PRICING-ROUNDING-DECISION-PROPOSAL.md), [R0 backend caller/source audit](MOD-002-R0-BACKEND-UNIT-PRICING-SOURCE-AUDIT.md), [D03/D16 gap proposal](MOD-002-ADVANCED-PRODUCT-CONTRACT-D03-REVIEW.md), [MOD-002 module packet](MOD-002-products-catalog.md), [decisions](../DECISIONS.md), [field mapping](../contracts/UI_FIELD_MAPPING.md), [extension proposals](../contracts/EXTENSIONS.md) and [review](../REVIEW.md). Tracked by [planning issue #368](https://github.com/shuvodelux-commits/hisabiq_ui/issues/368).

## 1. Source-owned facts and compatibility classification

| Concern | Actual reviewed source | Classification and limit |
|---|---|---|
| Product Add/Edit | [`ProductDraft`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/5bd99ad5cb6eb2ba4f8e46fafa3ab2e7b7a064c8/src/types/productForm.ts), [`productDraft.ts`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/5bd99ad5cb6eb2ba4f8e46fafa3ab2e7b7a064c8/src/utils/productDraft.ts), [`UnitPricesPanel`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/5bd99ad5cb6eb2ba4f8e46fafa3ab2e7b7a064c8/src/components/products/form/UnitPricesPanel.tsx) | **EXTEND backend**, preserve UI: arbitrary ordered unit levels, independent per-unit buy/sell decimal overrides, chosen entered unit, four-decimal-price input, EN/BN metadata and existing Quick Add. Existing simple adapter is only safe for *losslessly representable* products. |
| Multi-unit sale preview | [`multiUnitTransactions.ts`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/5bd99ad5cb6eb2ba4f8e46fafa3ab2e7b7a064c8/src/utils/multiUnitTransactions.ts), [`posMultiUnit.ts`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/5bd99ad5cb6eb2ba4f8e46fafa3ab2e7b7a064c8/src/utils/posMultiUnit.ts) | **ADAPT after R4**: new `unitQuantities` map can price each entered unit separately; legacy `qty/secondaryQty` uses primary-unit prorating. Both are real UI behaviors. Server must not infer one from the other or silently rewrite old drafts. |
| Product DTO | [`products.ts`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/core-contracts/src/products.ts) | **REUSE simple; BLOCK advanced writes**: strict full SaveProductRequest with only one alternate and whole-poisha base purchase/sell prices; `purchasePriceMinor` is absent on read without the cost-view permission. |
| Product service/repository | [`manage-products-service.ts`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/core-application/src/catalog/manage-products-service.ts), [`product-repository.ts`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/adapter-postgres/src/product-repository.ts) | **REUSE** tenant/role checks, product optimistic version, audit/outbox, controlled idempotency replay; **EXTEND** immutable rich profiles and cost-safe patches, never replace the use case with a parallel ERP. |
| Historical conversion table | [migration `0008`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/migrations/0008_products.sql), [migration `0010`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/migrations/0010_product_unit_conversion.sql), [schema](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/adapter-postgres/src/schema.ts) | **REUSE evidence, not a new write source by default**: migration `0010` retained old `product_unit_conversions` rows, copied only one-row products into current `products` pair. Row count and anomalies are **UNKNOWN**. Historical `factor_qty` is factor **to base**, not to adjacent unit. |
| Original sale/purchase money | [sale line schema](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/core-contracts/src/sales.ts), [purchase line schema](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/core-contracts/src/purchasing.ts), [posted tables](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/adapter-postgres/src/schema.ts) | **REUSE existing booked money and base stock**. **BLOCK** advanced multi-unit source posting until original selected unit, profile version and independently priced component snapshots are durable. |
| Returns and current display | [sales-return domain](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/core-domain/src/sales/sales-return.ts), [sale repository](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/adapter-postgres/src/sale-repository.ts), [return repository](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/adapter-postgres/src/sales-return-repository.ts) | **REUSE** original posted net and last-return residual; **EXTEND** per priced component and historical unit-label snapshots. Current product/unit-name joins can display changed master wording. |
| Money and quantity | [`scaled.ts`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/shared-utils/src/scaled.ts), [`unit-conversion.ts`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/core-domain/src/catalog/unit-conversion.ts) | **REUSE BigInt / deterministic half-up / largest remainder**, but the exact D16 policy of four-decimal chosen-unit price/quantity and component-rounding is **still proposed**, not approved. |

No existing `product_unit_profile_revision` database table, `advancedProduct` endpoint, per-unit price override table or sale source-unit segment is claimed to exist.

## 2. R1-B storage options — design recommendation contingent on approvals

| Option | Storage approach | Advantages | Non-negotiable difficulties | Conditional result |
|---|---|---|---|---|
| **A — rehabilitate existing `product_unit_conversions`** | Extend it with revision, ordering and adjacent-factor provenance plus a new independent-price table, while keeping archival rows. | Reuses tenant-scoped table, existing ID and indexes. | Existing rows have **to-base** factor; there is no versioned ordered chain; migration `0010` intentionally stopped writing it. Must avoid mixing archival and live row interpretation; historic consumers/data unknown. | **Possible only after R0-A dataset and complete source-consumer audit**; not selected now. |
| **B — immutable unit-profile revisions (recommended candidate)** | Add immutable revision header, ordered unit-level rows and independent buy/sell price overrides; link active revision from Product. Keep original table read-only/archive until signed backfill/retention plan. | Clear separation of historical decisions and live master, safe offline revision references, stable source snapshot, eliminates competing active conversion truth. | More additive tables and indexes; explicit legacy read-through projection; must make Product update + revision write atomic and block older full-object write on rich products. | **Prefer for review if archival data is nontrivial or historical revisioning is mandatory**, after D16 policy and data census. |
| **C — product JSON blob as authority** | Store whole chain and prices on Product without normalized references. | Fewer apparent tables. | Weak DB referential checks, complex immutable revisions and indexed lookups, easy tenant-unit cross-links, import/edit race. | **Reject as primary source**; optional derived cache only after authoritative relational validation. |

**Design preference, not a schema selection:** B, because stock/ledger integrity needs an immutable profile identity and independently priced unit components. However, the actual old-table occupancy and R1-A financial rules remain unknown, and **there is no authority to create R2 migrations yet**. The R0 source audit did *not* inspect any production records or establish that old rows can be deleted.

## 3. Proposed relational aggregate — logical shape, NOT executable DDL

Names below are **illustrative**, not approved schema identifiers, migration files or Drizzle exports:

**A. Existing Product (Class M):**
- Keep the existing tenant-owned product and its optimistic `product.version`. Introduce a **nullable activeProfileRevisionId**/explicit `capabilities` discriminator only when advanced APIs and legacy rejection paths are ready. Do not overwrite `baseUnitId`, one-alt columns or base prices with lossy values as if advanced pricing could fit.
- Product kind `Stock` is the only candidate for the initial unit-profile aggregate. `Service` and `Bundle` remain explicitly blocked pending their own posting/accounting and immutable recipe designs. Gallery/warranty/serial/expiry and Product Delete are separate work.

**B. Immutable profile revision header:**
- Conceptual fields `profileRevisionId` (ULID), `tenantId`, `productId`, `revisionNumber` (monotone per product), `canonicalBaseUnitId`, `defaultSellUnitId`, `defaultBuyUnitId`, `defaultSellRate`, `defaultBuyRate` (exact amounts in their respective unit), `createdAt/by`, content hash and explicit `status: DRAFT | PUBLISHED` (status model is *proposed*).
- `PUBLISHED` content is **immutable** and may be referenced by sale/purchase/return/offline source docs. Never mutate or cascade-delete its factors or price values. To edit, create a **new revision in the same Product UOW**, atomically advance active revision and increment Product `version` if policy allows. Old revisions remain available.
- Any `DRAFT` must be invisible to posting and to POS read models; deleting an unreferenced draft is not historical data deletion. Content hash is a diagnostic consistency aid, **not a substitute for auth, version or row locks**.

**C. Ordered conversion levels:**
- One entry for the canonical base unit and each larger unit: `tenantId`, `profileRevisionId`, stable catalog `unitId`, `position` (base=0, ordered outward), `adjacentSmallerUnitId` for every larger level, exact positive `factorToAdjacent` and server-computed exact `factorToBase` (rational or approved fixed decimal). The factor for a larger unit is **greater than 1**, each `unitId` occurs once per revision, no cycles or disconnected chain.
- **Important:** historic rows of `product_unit_conversions.factor_qty` in migration `0008` refer **directly to base**. They must not be copied as adjacent factors. Converting multiple old factors to an ordered chain needs a mathematically consistent relationship and **owner validation** when ordering is ambiguous; preserving them as archived evidence is always safer than guessing.

**D. Per-unit independent price overrides:**
- For each revision/unit identity, zero or one `sellOverride` and `purchaseOverride` with an exact typed decimal/scale chosen by D16 policy; **absent/null** means derive automatically from the revision's corresponding regular/default rate and selected unit factor, while **explicit zero** is a real entered override subject to free-goods rules.
- Never derive custom Box cost/sell from another Box price or substitute the newest purchase cost for an explicitly configured cost. Cost `purchaseOverride` and `defaultBuyRate` are **permission-sensitive** and absent on cost-blind reads; they must be protected from unauthorized metadata PATCH.
- Price source needs identity `DEFAULT_DERIVED | UNIT_OVERRIDE | AUTHORIZED_MANUAL | OFFER | SOURCE_RECORDED` at posting; the master can store defaults/overrides but cannot know negotiated manual cart price before sale.

**Indexes/constraints, pending DDL:** Unique active Product pointer; unique `(tenantId,productId,revisionNumber)`, `(tenantId,profileRevisionId,position)`, `(tenantId,profileRevisionId,unitId)`, unique per-unit override identity. Tenant+product and tenant+catalog-unit **composite FK/ownership checks**, not only globally unique ULID assumptions. RLS `ENABLE/FORCE` and tenant-scoped read/write guards for all rows, including publication, outbox and archived profiles. Application validates range, decimal format, factor graph, entitlements and unit selection *inside the same transaction*. No cross-tenant parent/child reference or stale active revision accepted.

**Deliberately unresolved DB details:** `NUMERIC` vs scaled `BIGINT`; max rational denominator/chain depth; how to store sale-price fractions beyond 4dp when a default rate is converted exactly; RLS insert/update policies and privileged migration role; concrete table names; orphan handling; migration sequence; historical row volume. **Do not fill these by assumption.**

## 4. Proposed typed contract semantics — no actual route or DTO approved

### 4.1 Separation by responsibility

| Command/read | Candidate semantic fields | Trust and lifecycle |
|---|---|---|
| **Advanced Product create** | `clientOperationId`, `kind: Stock`, metadata/tenant-owned catalog IDs, base unit ID, full ordered `levels[]`, default priced unit/rate for sell and buy, independent `unitPrices[]`, initial `version` | Server obtains tenant/user/permissions from auth, not body. Single product+profile+audit/outbox UOW, validated before publication. No opening stock posted as a Product master side effect. |
| **Advanced Product read** | `productId`, `version`, `profileRevisionId`, ordered unit IDs and exact adjacent + cumulative factors, price source/override state, labels/IDs and feature-gate markers | Cost fields **omitted entirely** for a cost-blind role; read is typed as cost-redacted vs cost-authorized, never `0` fallback. Incompatible legacy products clearly distinguished. |
| **Advanced Product edit** | Expected `product.version`, active `profileRevisionId`, explicit field-scoped changes + optional full new profile candidate | Cost-blind metadata edits cannot supply/erase purchase prices; cost edits require distinct permission. Stale version, revoked permission and old profile all trigger deterministic conflict. |
| **Catalog unit quick-add/read** | Stable tenant unit IDs, EN and optional BN label and symbol (existing EXT-02 proposal) | Quick-Add preserves existing half-filled React form/keyboard/focus. Symbols/names are **not identity**. Renaming never changes historic posted unit wording. |
| **Sale/Purchase source line extension** | Original profile revision, entered unit component(s), original exact price and frozen factor(s), computed base qty and posted integer poisha net | **BLOCKED** until R1-A and R4 source contract. Product master read alone must never activate multi-unit posting. |
| **Sales/Purchase returns** | Reference original posted **line+priced component ID**, return qty/original allocation and original cost origin | **BLOCKED** until R4 source proof. No querying current Product to recalculate original refund/value or stock conversion. |

**Versioned routing options (NOT decisions):** (i) explicit new versioned Product command endpoint under the existing controller/service ownership; (ii) discriminated API request/response under an approved version/content-type while retaining strict v1. Either must prevent old .strict() clients accidentally losing advanced properties. Do not introduce a route here or change current `products.ts` schemas before the owner approves an endpoint and exact file manifest.

**Legacy compatibility rule:** Existing simple list/detail and single-unit/one-alt adapters continue for products they fully represent. An advanced product must not be made writable by any old full-body PUT/PATCH, CSV import or Quick Add path that cannot round-trip all levels and prices. Decide whether old POS and Purchase clients **refuse** advanced products until R4 or a separately proven compatibility mode can safely post a source-identical line. Do not silently project the largest unit and discard the rest.

### 4.2 Idempotency and optimistic-lock ordering

Inside one Product master UOW:
1. Authenticate, derive the authenticated tenant, verify exact role/permission (including cost and entitlement) and request version/operation ID.
2. Validate canonical input, all stable catalog IDs and same-tenant ownership, unit chain graph, exact numeric/rational constraints, price-null/zero meaning and all referenced defaults. Reject unrepresentable amounts rather than rounding stock.
3. Lock Product/active profile revision (or equivalent optimistic CAS), assert expected version, and check operation ID/request fingerprint **scoped to tenant and actor/permission semantics**; a replay must not return cost fields beyond the *current* caller's authorization.
4. Insert new immutable profile/levels/overrides, update Product active pointer/version atomically, and append required permission-safe audit/outbox records in the same UOW. If audit or outbox fails, roll back *all* associated rows.
5. Return a typed authoritative version and profile ID. The existing React editor should retain draft and use the existing review/conflict UX for stale or unknowable outcomes; never silently retry an ambiguous commit with a different operation ID.

**No Source-T posting** occurs during this Product master UOW unless a *separately approved* composed `createProductWithOpening` use case atomically calls source-owned opening inside that same transaction; two public calls cannot be labeled all-or-nothing.

## 5. Source-priced segments and immutable historical snapshots

**Why Product-only profile revisioning is insufficient:** the modern HisabIQ POS unit-map can sell **1 Box at ৳232.25 + 5 Pcs at ৳12.50** on *one* cart line. Backend sale source currently stores `qty=25 Pcs` at scale3 and a single base price/net per line. From those fields alone a future return of only the 5 Pcs cannot recover the correct original Pcs price (gross ৳62.50) or the original Box price. Legacy proportion-by-base is valid for old **single-priced** lines and must stay unchanged.

**Candidate source hierarchy:**
- One posted **Document** has source ID, tenant, business date, audit/outbox/journal and customer/supplier linkage.
- Each immutable **sale/purchase line** has product ID, canonical **base qty at scale3**, existing posted whole-poisha amounts, source/lot/cost origin and optional original `profileRevisionId` (nullable for legacy).
- Each advanced line holds immutable ordered **priced components**: `segmentId`, original `unitId`, original 4dp entered qty string/scale, factor-to-base frozen rational, computed exact base qty, original per-unit price+source, gross poisha, allocated line/bill discount, posted net, original EN/BN product/unit labels and symbol. Segment net amounts sum to the existing line net; segment base qty sums to line base qty.
- **Origin linkage** maps component-base quantities to owned lot, vendor allocation, negative stock and serial consumption, without breaking existing saleLineSourceAllocations or double-counting stock/COGS. Original inventory cost layers remain source-owned. Source pricing and cost allocation are **distinct** records that must reconcile.
- For a **return**, reference original `segmentId` + source line ID, original profile revision and source allocation; resolve original net/cost residuals and remaining base qty. Use last-return residual behavior scoped to the relevant segment under the eventual approved R1-A policy. Do not reprice from the current Product or repartition a historical segment after the unit profile changed.
- For **purchase receipt**, keep cost unit vs landed cost, original source lot and receiving unit, with frozen component price snapshots. New latest-purchase-cost statistics must not rewrite configured custom unit purchase-price overrides. Purchase Return must use source receipt/lot cost and its actual financial allocations.
- **Historical wording:** current sale/return queries often join `products.name` and `units.name`; `invoice_line_presentation` stores an optional custom display name, not bilingual unit factor. New source snapshots freeze EN/BN unit names, symbol and product-name/display policy *at posting*, keeping old invoices unchanged when catalog names change.

**Critical full-return identities (conditional on rounding approval):**

`sum(segments.grossMinor) = line.grossMinor`

`sum(segments.discountShareMinor) = line.discountShareMinor`

`sum(segments.netMinor) = line.netAmountMinor`

`sum(segments.baseQty3) = line.qty3`

`sum(all returns of a segment.netMinor) = original segment.netMinor` when fully returned, using the existing last-return residual principle. Do not treat customer **cash refund** as necessarily equal to returned **sale value**: credit/due settlement and payout can differ, and stock/COGS reversals follow owned/vended allocation, not cash refund amount.

**Example:** `Box=৳232.25`, `Pcs=৳12.50`; 1 Box +5 Pcs at factor20 yields 25 Pcs of stock depletion and ৳294.75 gross *under the proposed separately priced rule*. A no-discount return of the five Pcs should value that source component at ৳62.50, not a proportional `5/25 × ৳294.75 = ৳58.95`. Existing older single-price lines retain their source-aggregate proportional return algorithm.

## 6. Historical migration, activation and rollback gates (no tenant data touched)

| Phase | Required work and verified output | Block/ownership |
|---|---|---|
| **R0-A archived-row census** | On a **separately authorized disposable non-production snapshot**, count tenant/product rows with 0, 1 and 2+ active historic rules; find inconsistent factors, self/duplicate units, archived/deleted rows, cross-tenant references, pair mismatches and old source references. Produce redacted aggregate results only. | **BLOCKED** until snapshot approval; actual counts unknown, and no production SQL may be initiated from this document. |
| **R1-A accounting policy signoff** | Owner chooses 4dp price/qty, exact canonical representability, half-up component/line rounding, sub-poisha, discount/return segment and old two-box compatibility; independent accounting reviewer verifies reconciliation. | **OPEN**; merged PR #366 is *proposal*, not signoff. |
| **R1-B finalized structural contract** | Choose A/B after census, freeze exact tables/FKs/RLS, source snapshot graph, route/discriminator, DTO, cost-role PATCH, imported legacy mapping, rollback and safety bounds; sign accountable decision record. | **Not yet approved**; today's document is candidate options only. |
| **R2 additive PG16 data layer** | Add schema with no data destruction, tenant composite FK/RLS, immutable revision indexes, idempotent safe legacy backfill; run disposable migrations/reversal/parallel-write tests with exclusive schema owner. | Requires explicit implementation approval and migration lock; no migration number is reserved here. |
| **R3 source-owned Product master** | Advanced Stock create/read/versioned edit + feature flags; retain simple Product and cost-view behavior, audit/outbox, replay safety and full unit/price round-trip. | Must not enable editing advanced product by old DTO. |
| **R4 accounting/stock source posting** | Sale/Purchase/Return selected-unit source segments, cost-origin mapping, discounted partial returns, original historic names, COGS/journal and offline revision replay; independent CA/security QA. | Advanced POS/Purchase posting remains **blocked** until complete source-ledger reconciliation. |
| **R5 existing React UI integration** | Connect *current* Product form/POS V2/Purchase carts, preserve all unit levels/price fields and EN+BN helpers, mobile keyboard/touch, and existing review dialog. | Requires R2–R4 green at exact pins. No UI redesign or simulation of posting. |

**Legacy row migration policy:** append-only/backfill safely, do not delete `product_unit_conversions` or overwrite `products.conversionUnitId/conversionFactorQty` without an approved reversible projection. For 2+ historic rows, old base-relative factors may order mathematically but still do **not** prove a user-intended adjacent chain; flag for review rather than silently constructing one. Product with advanced price/factor that cannot be exactly projected to legacy whole-poisha **must be marked incompatible**, not rounded and edited with old API. Rollback after advanced postings must preserve new revisions and posted source segments or **fail closed**; "roll back by dropping tables" is not permissible.

**Deployment:** separate feature flags and phased dual-read; never expose an advanced Product as sellable through a legacy cart path unless its source-unit history can be posted exactly. Product Create + Opening Stock must not claim atomicity across two separately committed HTTP calls. No production rollout is approved.

## 7. Threats and non-negotiable negative tests for future implementation

- **Tenant ownership:** cross-tenant `productId`, `unitId`, `profileRevisionId`, `segmentId`, `sourceAllocationId`, brand/category and invoice/return refs rejected at domain, DB FK and RLS; same-tenant ID mismatch not accepted merely because an ULID exists.
- **Cost leakage:** cost-blind user sees no `defaultBuyRate` or any `purchaseOverride`; full DTO replay/metadata PATCH cannot zero confidential costs; same-tenant different user, role revoked and idempotent replay redact using **current** permissions; audit/outbox do not leak cost to unauthorized consumers.
- **Unit graph:** no duplicate IDs/cycles/disconnect, factor<=1, unrepresentable cumulative factor, overflow, unknown base/default unit, ambiguous historic factor order, stale product version or profile ID; every rejection leaves no half-written profile.
- **Exact money:** no floats in server math; preserve `null` vs explicit zero; four-decimal and sub-poisha behavior contingent on approved policy; independently priced Pcs/Box/Carton buy/sell round-trip; derived exact rate never rounded in advance to base whole-poisha.
- **Accounting snapshot:** mixed-priced line segment sum equals existing line totals, original source return uses original price/discount/cost with final residual, customer ledger and stock/COGS balanced, purchase landed-cost source preserved, discount tie-break deterministic.
- **Concurrent/source safety:** two writers at same Product version → one winner, old offline single authorized device references original profile safely, stale-profile conflicts are deterministic, duplicated operation ID never doubles stock/financial effects, ambiguous transport does not create a second source transaction.
- **Historical documents:** edited Product/Unit name, unit size, custom price and current purchase latest cost do not alter old document's name, qty, money, return value or booked stock. Legacy sources without an advanced profile remain readable.
- **Migration/rollback:** legacy 0/1/multi historic conversion rows, pair mismatch, partial archived rows, backup/restore, RLS, double-running additive backfill, unsafe old DTO update on advanced product and destructive downgrade all tested.
- **UI regression gate:** existing compact Add/Edit and contextual Quick Add, Bangla helpers, mixed-unit POS, Purchase, serial/expiry/warranty and product photos remain reachable; no fake posting, no visual redesign. Full React→Nest→PG16 E2E must be approved and run in an isolated disposable environment.

These are **future acceptance criteria**, not executed tests in R1-B documentation work. This document contains no executable DDL, Drizzle schema, controller edit, path allowlist for source implementation, deployment command or live migration.

## 8. Decisions required to proceed beyond R1-B

| Decision gate | Proposed direction to review | Status |
|---|---|---|
| **D16: exact price** | R1-A four-decimal selected-unit prices stored exactly, posted whole poisha | **OPEN** — explicit owner/accounting signoff |
| **D16: qty & rounding** | Selected qty up to four decimals, exact base scale3 representability, server half-up once per priced segment, largest-remainder allocation | **OPEN** |
| **D16: returns** | Source-segment-level return and original net/cost + last-return residual for advanced mixed-price lines | **OPEN** |
| **D16: sub-poisha/legacy pricing** | Positive below-poisha rate valid in master; no silent positive zero-poisha posted component; explicit review of old two-box prorating | **OPEN** |
| **D03: historical profile** | Prefer immutable profile revisions rather than reactivating archival conversion table as second writable authority | **CONDITIONAL** on approved row census |
| **D03: exact wire API** | Separate versioned advanced command/read and cost-safe patch; old strict v1 unchanged for compatible products | **UNSPECIFIED**, owner + backend review needed |
| **D03: source snapshot** | Each priced unit component references frozen profile/qty/price and allocations; line remains authoritative booked money and stock | **CONDITIONAL** on D16/R4 |
| **D04/EXT-02** | Reuse additive Bengali names/symbols proposal; warranty/serial/expiry/Service/Bundle and image gallery remain separately specified | **NOT IMPLEMENTED** |
| **Destructive Product Delete** | Do not connect until backend [issue #32](https://github.com/shuvodelux-commits/nestshererp/issues/32) is cleared | **BLOCKED** |

**Approval requested later, not inferred now:** owner first explicitly approves or revises R1-A policies and permits a **non-production** historical conversion-row census. Then a reviewed R1-B final schema/route/permission contract may be prepared. After separate R2 implementation approval, work can move beyond documentation. A generic "Next", issue creation or PR merge cannot authorize destructive financial changes.
