# MOD-002 — Advanced Product contract (D03/D16) | source-audited design proposal

> **Status: PROPOSED — NOT APPROVED FOR IMPLEMENTATION.** Planning document only. No migration, API, React form binding, deployment, or active tenant operations are authorized by this document. This is **not** the finished implementation contract. The decisions in §10 and proof obligations in §9 must be resolved first.

**Owner direction:** integrate existing compatible NestSherERP APIs first; extend missing semantics afterward, without removing any HisabIQ functionality.

**Immutable review pair (2026-11-13, Asia/Dhaka):** frontend \`shuvodelux-commits/hisabiq_ui@d42e3b573c96dcbd1b3d74f50a703d459d8cfd15\`; backend adopted branch \`shuvodelux-commits/nestshererp@d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75\`. Future engineers must rebase this evidence if either changes.

**Companion material:** [MOD-002 plan](MOD-002-products-catalog.md), [field mapping](../contracts/UI_FIELD_MAPPING.md), [proposed extensions](../contracts/EXTENSIONS.md), [decision register](../DECISIONS.md), [critical review](../REVIEW.md), and the two repositories' AGENTS.md. Existing [backend issue #32](https://github.com/shuvodelux-commits/nestshererp/issues/32) blocks *Product deletion* separately.

## 1. Verified source and non-equivalences

| Proven current source | Verified behavior | Consequence for a connected implementation |
|---|---|---|
| [\`ProductDraft\`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/d42e3b573c96dcbd1b3d74f50a703d459d8cfd15/src/types/productForm.ts) | Contains \`kind\`, \`nameBn\`, smallest \`unit\`, \`unitLevels[]\` ordered outward, \`buy/sell\` with entered-unit selectors, per-level custom purchase/sell strings, stock unit preferences, warranty mode, serial mode, expiry policy, opening metadata and \`photos[]\` | The 24-field legacy product body is not a lossless map; **never feed the whole draft to the simple create/edit adapters** |
| [\`Product\` UI domain](https://github.com/shuvodelux-commits/hisabiq_ui/blob/d42e3b573c96dcbd1b3d74f50a703d459d8cfd15/src/types/erp.ts) | Stock / Service / Bundle, \`unitRelations[]\`, \`unitSellPrices\`, \`unitPurchasePrices\`, \`stockViewUnit\`, \`images[]\`; serial Off/Optional/Required; warranty Days/Months/Years | Explicit storage/action choices required; no coercion of Optional→Required or Service→stock |
| [\`productDraft.ts\`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/d42e3b573c96dcbd1b3d74f50a703d459d8cfd15/src/utils/productDraft.ts) and [\`unitChain.ts\`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/d42e3b573c96dcbd1b3d74f50a703d459d8cfd15/src/utils/unitChain.ts) | Smallest unit holds stock; each larger unit is relative to the preceding level; preview computes via JS \`Number\`. Custom price validator accepts **up to four decimal places**. Saved product unit relation edits are currently guarded rather than blindly rewritten. | Backend must use exact integer/rational arithmetic and preserve immutable document snapshots; preview \`Number\` is **not financial authority** |
| [\`UnitPricesPanel\`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/d42e3b573c96dcbd1b3d74f50a703d459d8cfd15/src/components/products/form/UnitPricesPanel.tsx) | Custom **buy** and **sell** prices exist separately for each unit; a blank means use automatic conversion; an entered value overrides only that unit | Null/absent override differs from explicit \`0\`; price of Box/Carton cannot be overwritten by Piece×factor |
| [\`productUnits.ts\`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/d42e3b573c96dcbd1b3d74f50a703d459d8cfd15/src/data/productUnits.ts) | English/Bangla display names, symbols, legacy aliases; historical wording snapshot helper | Names/symbols must not be used as unit identity; reuse separate EXT-02 nameBn/symbol design |
| [Nest product DTO](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/core-contracts/src/products.ts) | Strict full \`SaveProductRequest\`: one alternate \`conversionUnitId\`/\`conversionFactorQty\`, base-unit \`purchasePriceMinor\`/\`sellingPriceMinor\` integers, \`tracksSerial\` boolean, \`warrantyMonths\` and single offer fields; update adds positive \`version\` | Existing simple read/create/edit APIs may coexist, but cannot silently accept a rich draft |
| [Nest product service](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/core-application/src/catalog/manage-products-service.ts) | PRODUCT_CREATE/EDIT, stock-independent product metadata, optimistic edit version; permission-aware omission of cost, idempotent Create replay cost permission corrected by merged backend PR #30 | Any advanced extension must retain role-scoped cost redaction even on replay, conflict/version guard and audit/outbox behavior |
| [Nest schema](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/adapter-postgres/src/schema.ts) / [product repository](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/adapter-postgres/src/product-repository.ts) | \`products\` has one alternate conversion pair, base prices in whole poisha, base stock minimum scale-3; a separate \`product_unit_conversions\` table also exists, but current product repository lookup reads the columns on \`products\` | Audit existing conversion table's real callers, uniqueness and data before choosing to extend it or add ordered version rows. **Do not create parallel contradictory authorities** |
| [Nest sale line](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/core-contracts/src/sales.ts) / [purchase line](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/core-contracts/src/purchasing.ts) | Both currently accept \`productId\`, base \`qty\` (scale 3) and integer \`unitPriceMinor\`, without a complete selected-unit/price profile and immutable input snapshot | A product-only API extension cannot safely activate POS/Purchase multi-unit writes; transaction extensions and D16 price policy are mandatory |

These are source-derived facts, not approval of any proposed table, wire field, endpoint or rounding policy below.

## 2. Objective and inviolable invariants

**D03 objective:** one product may have a naturally ordered unit chain with distinct *chosen* purchase and selling prices per selected unit, while inventory still changes only in its smallest, canonical stock unit. Do not blend service items or bundles into ordinary stock rows. Names, labels, categories, prices and unit relations may change in master data only without rewriting a posted historical transaction.

**D16 objective:** the server determines exact amount and posting, and preserves the actual user-entered selected unit and price in a durable line snapshot. Money postings remain in legal whole-poisha minor units; fractional intermediate amounts and the rounding rule require explicit design, not implicit JavaScript floating point.

Non-negotiable:
- Stable **tenant-owned IDs** for products and catalog units; no ID lookup solely from translated labels, SKU, symbol, or preview record \`p...\`.
- Unit chain: unique unit IDs, one smallest base, no cycle, each relative factor greater than one, deterministic order and positive cumulative factor. The current UI permits factor numbers; acceptable fractional precision and representability remain subject to D16.
- Master **custom price present** is distinct from **custom price absent**. A present zero may mean an explicitly free selling/cost price; whether a zero sale is allowed is separately validated by the owner’s product/pricing rules. Never convert absent to zero.
- Prices entered for Box/Gauge/Carton/Pipe are independent. Automatic conversions only apply when the *particular* override is absent.
- Current sale, purchase, return, bundle component and offline draft preserve the selected unit, entered quantity, price source, factor and amount with no later reinterpretation using a changed product master.
- \`COST_VIEW\` and write permissions apply at **read, create, update and idempotent replay time**; omitted confidential cost is not a zero price. Non-cost-viewing editors must not reconstruct and resubmit a full confidential price field from a cost-redacted GET.
- Product creation and product pricing are **Class M master writes**. Opening stock, lot receipt, serial allocations, inventory movement and their journal entries are separate **Class T source-owned transactions**; an empty or failed opening-stock command must never leave a false stocked product in the UI.
- Legacy products, imports, POS/Purchase clients, historical invoices and accounting stay readable throughout add/backfill/cutover; all storage remains tenant-isolated with RLS and audit/outbox.

## 3. Proposed versioned product aggregate (NOT a live wire DTO)

**Proposed division (requires approval):**

| Concern | Proposed authoritative representation | Legacy compatibility / restriction |
|---|---|---|
| Master identity | \`productId\`, tenant ID from authenticated context, \`version\`, \`kind\`, \`name\`, \`nameBn\`, \`sku\`, real \`brandId\`/\`categoryId\`, catalog-backed \`baseUnitId\` | \`nameBn\`/unit \`nameBn\`/symbol in existing proposed EXT-02; no description-field hack |
| Unit chain | \`unitProfileVersion\` with ordered \`levels[]\`: stable \`unitId\`, \`position\`, adjacent smaller \`unitId\`, exact \`factorToSmaller\` **as decimal string or rational**, plus server-computed exact \`factorToBase\` | Existing \`conversionUnitId\`/\`conversionFactorQty\` support zero or one alternate only; do not pretend two is full parity |
| Product prices | For each catalog \`unitId\`, optional \`sellOverride\` and \`purchaseOverride\` as exact decimal **strings**, with separate explicit \`null\` for automatic; each price tagged with \`currency='BDT'\`, \`scale\`/precision policy and product/profile version | Legacy base whole-poisha prices retained only where **exactly representable**. If derived base value is not whole-poisha, require advanced read/write; never silently round when backfilling legacy fields |
| Entry defaults | Persist desired \`sellUnitId\`, \`buyUnitId\`, \`stockViewUnitId\`, \`minStockUnitId\` as references to units in the profile; authoritative inventory is always base quantity | Frontend local display preference may be per user; decide separately before persisting a global preference |
| Serial, expiry, warranty | Keep \`serialTracking: Off/Optional/Required\`, warranty enabled/duration unit/type/terms, expiry required/warning/allocation and lot policy as **distinct explicitly versioned metadata** | D04 / service policy design is **not finished**. Do not map Optional→boolean true, Days→zero Months, or FEFO→FIFO |
| Pricing/offer metadata | Product default and optional priced-unit offers; \`useDefaultPriceForAllLots\` precedence explicit | Existing Nest one-offer fields do not encode scheduled \`ProductOffer[]\`; advanced offer lifecycle remains separate |
| Photos | Keep existing gallery/cover UI intact; design durable per-photo record and cover selection separately | Merged thumbnail POST/DELETE transport supports **one** image only; not gallery parity |
| Stock opening | Separate authorized \`openStock\` command referencing saved product and the intended captured unit, opening lot/expiry/serial data, with one durable operation ID | Do **not** send \`openingQty\` as product master metadata or run two public writes and call the sequence atomic |

**Open contract selection:** The old Nest \`/api/v1/products\` schema is \`.strict()\`; do not pass additional keys to it. Choose either an explicitly versioned new command path/representation or a versioned discriminator that cannot accidentally change existing clients. No actual new route, number, migration filename, table or DTO is approved here. Read side must distinguish \`legacySimple\` from \`advanced\` (or provide an equivalent typed discriminator) so the frontend never projects rich fields into an apparently complete legacy editor.

**Edit lock:** Existing UI prevents changing stored unit relations casually. For a product with stock/history/open carts, reject direct in-place unit-chain changes; if future change is allowed, create a **new profile revision**, keep every posted document attached to its original revision, validate stock migration and support old offline revisions. This is proposed, not authorization for rewriting existing stock.

## 4. Field-by-field UI preservation matrix

| Existing input / behavior | Server contract or ownership | Release state |
|---|---|---|
| \`kind\` Stock / Service / Bundle | Explicit type, distinct accounting and stock lifecycle | **D04/D09 blocked** for Service/Bundle implementation |
| \`name\`, \`nameBn\`, brand, category | Product name + proposed bilingual field; tenant-owned catalog IDs | **EXT-02 proposal** for bilingual |
| \`unit\`, \`multiUnit\`, \`unitLevels[].unit/factor/id\` | Canonical catalog IDs, ordered exact unit profile, stable editor keys distinct from DB IDs | **D03 proposal** |
| \`unitLevels[].price\`, \`unitLevels[].purchasePrice\`, \`basePrice\`, \`basePurchasePrice\` | Independent entered unit price overrides, \`null\` means auto | **D03/D16** |
| \`buy\`, \`buyUnit\`, \`sell\`, \`sellUnit\` | Actual entered amount, chosen priced unit, canonical price source; no derived base price coercion | **D16** |
| \`stockViewUnit\`, \`openingQty\`, \`openingUnit\`, \`minQty\`, \`minUnit\` | Display preference; separately authorized opening stock; minStock in canonical base quantity | **D03 + stock-opening task**, no master stock write |
| \`useDefaultPriceForAllLots\` | Explicit product/lot override precedence | **D04** |
| \`warrantyEnabled/Duration/DurationUnit/Type/Terms\` | Lossless typed warranty, Days/Months/Years with service/replacement policy | **D04** |
| \`serialTracking\`, \`openingSerialText\` | Off/Optional/Required; opening serials in owned stock-opening transaction | **D04 + stock-opening** |
| \`expiryEnabled\`, \`expiryDateRequired\`, \`expiryWarningDays\`, \`allocationMethod\` | Per-product expiry/FEFO policies | **D04** |
| \`batchNumber\`, \`manufactureDate\`, \`expiryDate\` | Lot/receiving/opening metadata, not product master attributes | **D06/stock-opening** |
| \`barcode\`, \`photos[]\` | Barcode master; gallery separate from cover thumbnail | Barcode REUSE; gallery **BLOCKED** |
| Product offer array, lot price overrides and historic receipts | Dedicated versioned offer + immutable transaction source pricing | **D04/D16** |
| Saved product \`version\` | Backend optimistic version; must survive read→edit | Legacy adapter already merged; rich editor remains blocked |

The mapping is a **loss-prevention register**, not permission to add all these fields in one migration. The existing Add Product field ordering, inline Category/Brand/Unit creation, help text, mobile inputs, draft preservation and keyboard/touch interactions must be preserved.

## 5. Exact units, quantities, and price arithmetic — decisions still needed

### 5.1 Representation proposal

1. Accept user-entered decimal strings, **not JSON floats**, for each conversion and price. Parse with a decimal/rational parser into checked integers (or NUMERIC with explicit scale and error on overflow). Reject exponent notation, negatives where forbidden, embedded units, NaN/Infinity, partial conversions and duplicate unit identities.
2. The existing UI validates custom price to **four decimal places in BDT**. A proposed advanced price format could retain 4 dp verbatim; **approval needed** whether this is the permanent maximum and whether values below one poisha are allowed as unit prices.
3. Existing backend quantities are **base-unit ×1000 integers**. To post, multiply selected quantity by cumulative exact factor, then require an exactly representable base quantity at scale3. If not representable, refuse with a field-level explanation; never silently round stock.
4. Money in audit/journal/invoice totals remains integer **poisha**; if an intermediate extended line amount has sub-poisha precision, the approved D16 rounding policy must define exactly **where** and **how** it rounds and how discount/refund allocations reconcile. Do not use JavaScript \`Number.toFixed\` or Math.round in domain/accounting writes.
5. Store whether each explicit unit price was entered vs derived, together with the profile revision used to quote it. For sale/purchase, the **entered unit price actually accepted at posting** is authoritative; no lookups of today's price during return or audit.
6. Never permit a cost-blind user to set or infer a restricted purchase-price override using merely a displayed selling price. Consider separately field-scoped PATCH for authorized safe metadata changes, with optimistic version; do not weaken cost filtering to satisfy old full-body PATCH.

**Demonstration fixtures** (conceptual examples, not hardcoded tariff):
- \`1 Box = 20 Pcs\`, \`1 Carton = 12 Box\` → \`1 Carton = 240 Pcs\`. \`1 Box + 5 Pcs\` allocates \`25 Pcs\`, exact stock quantity \`25000\` at scale3.
- \`1 Gauge = 16 Gira\`; \`1 Pipe = 20 Feet\`. These relationships are **per product**, never global conversion for all catalog items named Gauge/Pipe.
- Set \`Pcs sell=৳12.50\`, \`Box sell=৳232.25\`, \`Carton sell=৳2,600.00\`. The Box price is **৳232.25**, not \`20×12.50=৳250\`; \`Carton\` is not \`12×232.25\` by default. Purchase overrides are independent from these sell overrides.
- If \`Carton\` custom sell override is absent, deriving it must use the **defined default pricing rule** and exact arithmetic; which available override acts as the fallback must be made unambiguous in the D16 decision (current UI derives from the regular/base selling price, not necessarily from the nearest priced parent).
- \`৳0.0001\` per entered unit currently fits the UI custom-price decimal shape but is **below one poisha**. A full or fractional sale may produce a sub-poisha amount. This fixture must refuse or follow an explicitly approved line-level rounding rule; it must never be silently truncated to \`0\` in the master.

### 5.2 Rounding/return examples that must be signed off

| Vector | Required invariant | Still-open decision |
|---|---|---|
| Fractional unit quantities at scale3 × price at up to 4 dp BDT | Deterministic integer poisha at final ledger boundary | Price precision, line rounding mode and stage |
| Three separately priced units sold on one invoice | Extended total equals posted sum after explicitly allocated discounts, no hidden balancing entry | Line vs invoice vs tax rounding order |
| Partial return from an old Box sale after Box factor/price is edited | Refund and restored base quantity use **original sale-line snapshot**, never current master | Discount allocation and residual rounding strategy |
| Purchase lot cost per Box and stock consumed as Pcs | Cost layers and sale COGS use original received cost and quantity, no master-price retroactive valuation | Fractional per-base cost representation |
| Offline sale made under product unit revision A, synced after revision B | Check authorized device, replay safety, and revision conflict deterministically; never reinterpret silently | Revision expiration and conflict UX, Needs Review only when truly exceptional |

## 6. Durable history and storage options (proposal, no migration)

**Mandatory source audit before choosing:** the \`product_unit_conversions\` table already exists, but current product repository exposes only \`products.conversionUnitId\`/\`conversionFactorQty\`. Investigate whether the table has other writers/readers, its live rows, RLS, uniqueness and tenancy, and any import/backfill assumptions. Do not create a second active source of conversion truth.

| Option | Benefit | Risk / recommendation |
|---|---|---|
| **A: Extend existing per-product conversion table with ordered positions, adjacent factors, profile revision; add per-unit prices** | Reuses an existing tenant-owned table | Only correct if one source of truth and historical versioning can be layered without breaking old readers; **first inspect all callers** |
| **B: New immutable unit-profile revision + ordered level and price rows, with read-through legacy projection** | Clean history, stable revision references on invoices and offline commands | Additional tables/migrations and synchronization; recommended **only if A cannot safely preserve history** |
| **C: JSON blob on products** | Small apparent migration | Poor referential checks, exact numeric validation and revision linking; **not recommended** |

All accepted options must define:
- Tenant ID + product ID on each row, matching catalog-unit tenant and same-tenant FK/RLS; unique active \`(tenant,product,unit)\`, ordered positions, revision-bound immutability and no circular chain.
- Prices stored as canonical exact decimals or scaled bigint, with explicit scale/range, separate sell and purchase overrides, nullable for auto. Do **not** store only a derived base-unit poisha price when it is unrepresentable.
- A single product version optimistic lock and transactional replacement/new revision; audit \`before/after\` that is permission-safe; outbox event for every effective profile change.
- Legacy projection contract: zero or one conversion can be exposed to legacy API **only if exact and truthful**; otherwise indicate unsupported advanced product, not silently choose the largest level and discard other prices. Legacy full-body update of advanced product must be refused before it could overwrite unknown fields.
- Original sale/purchase/return/quote line snapshots: source line ID, product/unit stable IDs, unit display names (English/Bangla at posting), chosen quantity and scale, \`factorToBase\` or revision link plus frozen value, base quantity, entered price and its scale/source, discounts and integer posted line total; snapshots immutable after posting.
- Migration support: additive schema first, dual-read with explicit compatibility tag, legacy backfill preserving original values, invariant checks, no mutation of historical accounting, explicit rollout gate, and rollback where old clients can still read safe legacy products. Never downgrade a rich product by deleting its unit levels or per-unit overrides.

**No migration ID, table name, DDL, new API route or automatic deployment is approved.**

## 7. Proposed ownership and transaction boundaries

1. **Catalog masters (Class A):** EXT-02 supplies unit Bengali names/symbols and product \`nameBn\`. IDs are authoritative, display aliases are for humans. Quick-Add inside the form must preserve the half-filled draft and select the resulting ID.
2. **Product master (Class M):** authenticated create/update validates product kind, category/brand/unit ownership, complete profile, exact decimals, serial/expiry feature entitlements, current role and product version, writes product/profile/audit/outbox in **one UOW**, and returns the authoritative version. Idempotent create replay must recompute cost visibility per current caller, including role revocation and cross-user same-tenant keys.
3. **Opening stock (Class T):** after persisted product creation, a separately owned and authorized opening command handles stock, lot, serials, expiry/manufacture/batch, movement, valuation and journal atomically. This is **not** currently a promise of cross-endpoint atomicity. If the UX requires one all-or-nothing Save+Opening, define a composed server use case using \`createWithin\` + stock-opening within **one UOW** before activating it; do not chain two public POSTs and claim atomic success.
4. **Sale/Purchase/Return Class T:** post against a validated immutable unit profile revision, calculate server-authoritative base qty and selected-unit price, persist snapshots and correctly lock inventory/serial allocations. A return references the original posted line, with exact original amount allocations, not current unit configuration.
5. **Image/gallery:** existing single-thumbnail adapter remains isolated; gallery migration is a distinct metadata/file lifecycle and must not be improvised in this issue.
6. **Service and Bundle:** separate stock/account semantics and immutable bundle recipe versions are mandatory; not covered by a Stock-only profile command.

**Unknown outcomes:** keep original operation ID, draft and operation state; reconcile with server before any explicit resubmission. No fake preview success, silent retry, or partial compensation in the browser.

## 8. Compatibility and cutover stages

| Stage | Deliverable | Exit gate |
|---|---|---|
| R0 — source audit | Exact caller graph for conversion table, purchase/sale line pricing, product edit and price visibility; enumerate existing rows/indexes and test fixtures | Approved field/action and dependency matrix |
| R1 — D16/D03 decision | Signed precision/rounding/default/fraction policy and unit history strategy, full versioned request/response | Architectural, accounting and product-owner review |
| R2 — storage preparation | Approved additive migration, RLS/check/FK, tenant backfill and fallback; no legacy data loss | Disposable PG16 migration/reversal fixtures, dual-read tests |
| R3 — server master | Advanced Stock product create/read/versioned edit, catalog EXT-02, cost-view protections, audit/outbox and concurrency; legacy simple endpoints unchanged | RBAC/revocation, idempotency, property-based price/chain tests |
| R4 — transaction snapshots | Sale/Purchase/Return selected-unit snapshot, server calculations, stock/lot valuation and offline replay version handling | Full accounting reconciliation and double-commit/race tests |
| R5 — form integration | Connect current compact Add/Edit Product unchanged visually; Quick Add, multilingual, mobile/keyboard, full validation and draft recovery | Real React→Nest→PG16 Playwright tests + no fake preview/zero-stock regression |
| R6 — adjacent features | D04 warranty/serial/expiry, services, bundles, scheduled offers, gallery and lot pricing, each scoped separately | Owner decisions + independently complete specification and tests |

No stage here is a blanket approval for implementation. R1 cannot be skipped merely because the simple-product API adapters merged.

## 9. Required negative / concurrency / migration verification

A subsequent implementation PR must evidence:
1. Same product Pcs/Box/Carton chain round-trip **by stable unit IDs and exact factors**; duplicate ID, cyclic relationship, disconnected levels, invalid decimal factor and cross-tenant unit rejected.
2. Independent sell/buy override round-trip including explicit 0 versus null/auto, below-poisha case and overflow; no float approximation or silent truncation.
3. Chosen unit sell and purchase price correct after factor change; old posted invoice and return remain identical and their source snapshots still render original bilingual unit wording.
4. Product type boundaries: Service does not move stock; Bundle does not decrement a phantom Set and must reference immutable components; unsupported kinds blocked until implemented.
5. Cost-sensitive read/initial create/idempotent replay and update: same-tenant other user without \`COST_VIEW\`, role revoke, different tenant; no cost fields or orphan response leaks, no price-zero overwrite from missing data.
6. Old single-unit/one-alternate API still behaves unchanged; rich product cannot be lossily rewritten by old PATCH or CSV import; old unknown fields are refused rather than dropped.
7. Two concurrent product edits with same version: one winner, deterministic conflict for stale writer; invalid change/audit/outbox failure rolls back entire UOW.
8. Cross-tenant unit/master/price foreign-key and RLS under unprivileged application role; malformed attempts do not create partial rows.
9. Stock opening failure/serial duplicate/expiry validation leaves no partial stock movement or financial journal; product creation outcome is accurately distinguished from opening completion.
10. Multi-line sales, split quantity, discount and partial returns reconcile exact integer posted totals and inventory/COGS; currency rounding tie tests use policy selected in R1.
11. Offline single authorized POS device accepts revisioned drafts; old revision conflict is deterministic with Pending/Synced standard states and Needs Review only for true exceptions.
12. Additive migration backfills legacy catalog and old conversion rows without changing product price or posting; rollback refuses a data-destructive downgrade after advanced rows exist.
13. Production-like perf with indexed tenant+product reads, preloaded unit profile in POS combobox, no N+1, and proof that 100K-tenant growth does not require one global lock.
14. UI screenshot + keyboard/touch + Bangla helper coverage and no hidden field elimination, with both a single-unit and 4-level product.

Tests must use disposable databases, explicit test authorization, and immutable CI heads; none are claimed as already executed by **this design-only document**.

## 10. Decisions/blockers for owner and independent accounting review

| ID | Proposed default to review | Status |
|---|---|---|
| **D03-A** ordered chain | Use stable catalog unit IDs, smallest stock unit, exact cumulative factor, independent sell/buy overrides and revisioned profile history | **Proposed**, needs R0 table/caller audit |
| **D03-B** unit profile edit | Lock already-used relations by default; allow future changes only through revisioned transformation with source-stable historic records | **Proposed**, stock migration contract needed |
| **D16-A** custom price scale | Preserve at least existing UI **four decimal places BDT** exactly; decide permissible upper precision and sub-poisha behavior explicitly | **OPEN** — financial signoff |
| **D16-B** rounding | Propose a single deterministic server-controlled rounding algorithm and residual allocation for partial returns; no implied JavaScript mode | **OPEN** — owner/accounting signoff |
| **D16-C** automatic default fallback | Current UI auto-converts regular/base price when a unit has no explicit override; preserve that unless owner intentionally changes rule | **Proposed**, verify procurement/sale consumers |
| **D04-A** metadata | Off/Optional/Required serial state; Days/Months/Years and warranty type/terms; per-product expiry/warning/FEFO; lot price override rules | **OPEN** — separate completed contract |
| **D04-B** non-stock kinds | Service and Bundle require distinct posting/revision semantics; no stock-product coercion | **BLOCKED** pending service/bundle design |
| **EXT-02** Bengali names and symbols | Reuse existing additive catalog/product proposal; preserve historical English/Bangla unit snapshots | **Proposed**, not schema-ready |
| **UI activation** | Require full rich read/write contract, expense-free unit edit safety and accounting-correct transactions before connecting Add/Edit form | **BLOCKED** |

**What the owner is approving at this stage:** review of a gap analysis and a proposed direction. **What the owner is not approving:** a route, migration, arbitrary precision/rounding rule, service/bundle product implementation, product hard deletion, or live Product form cutover.

## 11. Next specifically bounded GitHub implementation packets (after design decisions)

1. **MOD-002/R0 — backend source audit, read-only:** inspect actual \`product_unit_conversions\` data/callers and sale/purchase/returns/lot costing, write exact file/column/permission graph; no migration.
2. **MOD-002/R1 — approved D03/D16 decision record:** freeze exact DTO, price precision and rounding/return algorithm, storage strategy, version compatibility and error codes; independent CA-level review.
3. **MOD-002/R2 — additive backend schema + PG16 tests:** only after R1 owner approval, with detailed file allowlist, rollback/tenant isolation and backfill acceptance.
4. **MOD-002/R3 — source-owned Product aggregate:** integrate catalog names, profile, independent prices with permission/version protections; no frontend cutover.
5. **MOD-002/R4 — accounting/stock snapshots:** extend POS, purchases and returns together where source-linked reconciliation demands it; cannot claim multi-unit complete before this.
6. **MOD-002/R5 — preserve and connect current React form:** only after R2–R4 pass; no redesign or lost input.

**Planning PR acceptance:** this document, precise source links and unchanged baseline only. A distinct worker, owner review and PR are required for every implementation packet.
