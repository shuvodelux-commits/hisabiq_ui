# MOD-002/R1-A — Exact multilevel unit pricing and rounding decision proposal

> **STATUS: PROPOSED; OWNER/ACCOUNTING APPROVAL REQUIRED.** This document records a candidate policy, its supporting code, explicit alternatives and negative-test vectors. **Merging this document would not approve the policy, create a backend contract, reserve a migration, change HisabIQ UI or authorize production writes.** The decisions in §8 must be approved separately before R1-B storage design and R2–R5 implementation.

**Source-pair (2026-11-13, Asia/Dhaka):**
- Frontend `shuvodelux-commits/hisabiq_ui@7948c7d0295fe0de0786c72b7bd566f49672b857`, after merged [R0 PR #362](https://github.com/shuvodelux-commits/hisabiq_ui/pull/362).
- Backend `shuvodelux-commits/nestshererp@d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75`, adopted branch `chore/hisabiq-adoption-runtime-a01`; **not** a statement that backend default branch contains these changes.

**Related:** [R0 source audit](MOD-002-R0-BACKEND-UNIT-PRICING-SOURCE-AUDIT.md), [D03/D16 advanced Product proposal](MOD-002-ADVANCED-PRODUCT-CONTRACT-D03-REVIEW.md), [MOD-002 packet](MOD-002-products-catalog.md), [decision register](../DECISIONS.md), [integration field mapping](../contracts/UI_FIELD_MAPPING.md), [extension proposals](../contracts/EXTENSIONS.md), [critical review](../REVIEW.md). This R1-A task is tracked by [issue #364](https://github.com/shuvodelux-commits/hisabiq_ui/issues/364).

## 1. Verified current behavior — do not overwrite working rules

| Source | Verified behavior | Architectural implication |
|---|---|---|
| [HisabIQ ProductDraft](https://github.com/shuvodelux-commits/hisabiq_ui/blob/7948c7d0295fe0de0786c72b7bd566f49672b857/src/types/productForm.ts) / [Product draft validator](https://github.com/shuvodelux-commits/hisabiq_ui/blob/7948c7d0295fe0de0786c72b7bd566f49672b857/src/utils/productDraft.ts) | Ordered larger-unit factors, `buyUnit/sellUnit` and **independent custom buy/sell prices**, decimal strings during input; custom price validator permits **up to 4 fractional BDT digits**; previews use `Number`. | Preserve the typed prices and source unit; client preview cannot be the authority for money or stock. |
| [HisabIQ unit-quantity snapshot](https://github.com/shuvodelux-commits/hisabiq_ui/blob/7948c7d0295fe0de0786c72b7bd566f49672b857/src/utils/multiUnitTransactions.ts) | `UnitQuantityMap` accepts **up to 4 quantity decimals**; per-unit price map and frozen preview profile exist; `unitQuantitiesSaleTotal` sums **separately rounded per-unit components** using browser `Number`/`Math.round`. | Backend **scale-3 base qty** cannot accept every typed 4dp number. Keep preview semantics explicit but replace float arithmetic in authoritative posting. |
| [HisabIQ POS multi-unit](https://github.com/shuvodelux-commits/hisabiq_ui/blob/7948c7d0295fe0de0786c72b7bd566f49672b857/src/utils/posMultiUnit.ts) | New `unitQuantities` path prices units separately, while legacy `qty + secondaryQty` path uses `compoundLineTotal` with **one selected-unit price prorated** to the smaller unit. | **These two UI calculation paths are not always equivalent.** Exact policy and an explicit migration/review dialog are required; do not silently switch legacy drafts to new semantics. |
| [HisabIQ product pricing display](https://github.com/shuvodelux-commits/hisabiq_ui/blob/7948c7d0295fe0de0786c72b7bd566f49672b857/src/components/products/form/UnitPricesPanel.tsx) | Custom purchase and sale prices per unit; missing override derives from the regular/default unit price, not the nearest priced unit. | `null` (automatic) differs from an explicitly stored `0`; custom Box price must not be derived from Pcs. |
| [Nest shared exact arithmetic](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/shared-utils/src/scaled.ts) | `parseScaled` parses decimal text without float rounding; `divideRoundHalfUp` uses BigInt and **ties away from zero**; `allocateLargestRemainder` exactly allocates totals with stable index tie-break. | **Reuse these invariants** as a basis; scale-4 unit price and rational factors are a new, unapproved extension to existing Money(scale2)/Qty(scale3). |
| [Nest sales totals](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/core-domain/src/sales/sale.ts) | Base price in integer poisha × scale-3 base qty, rounded **once** per line, bill discount allocated by largest remainder across line value; source-owned sums. | Proposed advanced component pricing must reconcile with existing **line** net and returnable source amount, not add a hidden rounding adjustment. |
| [Nest purchasing totals](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/core-domain/src/purchasing/purchase.ts) / [landed costs](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/core-domain/src/purchasing/landed-cost.ts) | Discount and extra-cost allocations are source-owned; lot valuation has its own residual reconciliation; backend later updates the **single** master purchase price from the latest bill. | Preserve accounting journal/COGS and correct lot valuation; differentiate configurable per-unit cost, latest supplier price, and actual landed cost. |
| [Nest sale return](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/core-domain/src/sales/sales-return.ts) | Refundable value/COGS based on original posted sale-line net/cost, with **final partial return taking the residual minor units**. | Do not replace working historical-value return logic with current master price. For advanced mixed-price quantities, source segment identity is additionally needed. |
| [Nest legacy conversion](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/core-domain/src/catalog/unit-conversion.ts) | One optional conversion; `pricePerBaseUnit` rounds half-up into whole-poisha base unit and **loses the exact entered alternate-unit price** for cases such as ৳105.05/Pipe → ৳5.25/Feet → ৳105.00/Pipe. | **No lossy map** from 4dp independent per-unit prices to old single-base pricing. Old DTO remains for compatible legacy stock only. |
| [Nest posted sale and purchase lines](https://github.com/shuvodelux-commits/nestshererp/blob/d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75/packages/adapter-postgres/src/schema.ts) | Store whole-poisha total and base qty but no complete entered-unit price, factor or profile-version snapshot. | Adding new metadata must be **additive** and cannot rewrite previously booked invoices. |

All source links are to immutable reviewed commits. **Observed** describes what the repository does; **RECOMMENDED** below is a proposed business/technical policy, not a verified current requirement.

## 2. Candidate policy and its alternatives — open owner decisions

| ID | RECOMMENDED default — NOT APPROVED | Alternative / tradeoff |
|---|---|---|
| **R1A-01 Price precision** | Store every **explicit per-selected-unit price** as an exact decimal with **up to 4 BDT fractional digits**, normalized to an integer **`price4` (BDT ×10,000)** or an equivalent validated decimal string. Whole-poisha invoice/payment/ledger amounts remain unchanged. | Require 2dp per selected unit: simpler, but silently removes an existing UI capability. More than 4dp: new UI/validation policy required. |
| **R1A-02 Representation** | No float in server posting. Parse bounded canonical decimal strings to BigInt (or exactly scaled integers), reject exponent/NaN/Infinity/out-of-range values, and serialize known decimal scale; no implicit `Number.toFixed`. | Decimal/NUMERIC DB arithmetic also valid if rounding/scale/overflow are formally identical; storage is **R1-B**, not decided here. |
| **R1A-03 Input quantity vs stock precision** | Retain **up to 4dp entered quantity** for UI snapshots, convert it with exact factor(s), and **accept only if resulting base qty is exactly representable as scale-3 integer**. Error with original input intact otherwise. | Ban 4dp entered qty outright: breaks UI. Change all stock posting to 4dp: expensive inventory, lots, serials, COGS and offline migration. |
| **R1A-04 Per-unit price semantics** | Each explicitly entered unit *component* uses its own effective sell/purchase price. A missing override uses the exact regular/default-price rate, scaled to that unit. Never prefer nearest custom parent/sibling override unless separately chosen by owner. | Price entire compound quantity at one selected unit rate: matches **legacy POS path**, but differs from new multi-unit map for separately priced Pcs/Box. Needs a clearly marked compatibility behavior for existing drafts. |
| **R1A-05 Rounding stage** | Calculate an exact component extended amount as a rational; **round half-up once per priced component to whole poisha**, then sum components to line gross. Do not round price-to-base first or use an invoice-level balancing row. | Round unrounded component totals once **per combined cart line**, which can differ by 1+ poisha and would change today's unit-map preview semantics. Both need owner review. |
| **R1A-06 Discount allocation** | After priced components are rounded, allocate each **line discount** and **bill discount** across source components by their current effective gross using the existing largest-remainder method, stable position tie-break and exact zero-sum reconciliation. Preserve existing document totals. | Allocate only at combined line level: mathematically okay for total but insufficient to fairly refund just the Pcs component if Box has a different price. |
| **R1A-07 Partial return** | A return of a separately priced component names **original posted segment(s)**, reverses only their remaining base qty, and refunds against their original **net posted segment amount**, with last-segment-return residual allocation. Current single-price legacy returns remain unchanged. | Proportional refund by combined line base quantity: simple, but can refund the wrong amount when Box and Pcs have different unit prices; **not recommended for advanced lines**. |
| **R1A-08 Sub-poisha price** | Allow `৳0.0001` as a valid explicit master unit price (compatible with the UI), but **do not permit a positive-priced posting segment to silently round to zero poisha**. Reject with clear explanation or require an owner-approved minimum-charge/aggregation policy. Explicit `0` remains a distinct field value. | Forbid positive master prices below ৳0.01 or auto-convert them to zero: loses valid pricing for large quantities. |
| **R1A-09 Price source** | Freeze a source tag: default sell/buy, specific unit override, authorized manual line override, negotiated/offer price, or original posted return source. Persist original selected unit ID and exact price + profile revision in source snapshot. | Infer price source from current master on read: changes historic receipt/return semantics. |
| **R1A-10 Purchase cost master** | Separate **configured per-unit purchase override** from **last purchased price** and **actual landed lot cost**. Preserve current source-owned latest-cost update for legacy products only until owner approves advanced precedence. | Auto-overwrite custom Box cost from the latest one-size purchase, which can corrupt explicitly configured costs. |
| **R1A-11 Line/rounding discrepancy** | Server is authoritative; show exact source-calculated amount, price/qty discrepancy and **existing HisabIQ review flow** for approval before posting if preview differs. Never force a total by forging a “rounding adjustment” line. | Silent post-and-correct or frontend-only round: unacceptable for financial correctness. |
| **R1A-12 Compatibility** | Existing product/simple POS/purchase line contracts remain unchanged for legacy-compatible items; advanced records must use explicitly versioned schemas and refuse a destructive legacy full-body edit. | Implicitly map advanced pricing to legacy `purchasePriceMinor/sellingPriceMinor`: lossy, and unsafe when cost-view permission hides purchase cost. |

**Scope limitation:** R1-A does **not** approve an API endpoint, product profile revision schema, immutable source segment table, rounding implementation or migration number. **R1-B** must resolve actual storage and permissions; **R4** must resolve source posting, offline and returns.

## 3. Exact arithmetic proposal — not executable production code

Define:

- `P4` = integer representation of selected-unit price in BDT at 4dp, e.g. `৳232.25` → `2,322,500`.
- `Q4` = selected-unit quantity at 4dp, e.g. `1.5000 Box` → `15,000` (do **not** silently round to scale3).
- `F` = exact rational cumulative number of canonical base units in the selected unit, from the **frozen product profile**. Example `F(Box)=20/1`, `F(Pcs)=1/1`, `F(Carton)=240/1`. Store a bounded numerator/denominator or normalized exact decimal representation; do not multiply floats.
- Base stock scale is **3**: `B3 = (Q4 × F ×1000) ÷10,000`. Accept **only** if its numerator is divisible by its denominator and `B3` fits the backend safe integer / DB range; no stock rounding. Aggregate positive components of a source line to the canonical base qty.
- Selected-unit amount in **poisha**, before rounding: `P4 × Q4 ÷1,000,000` (since `P4/10,000 BDT × Q4/10,000 units ×100 poisha/BDT`). Proposed `grossPoisha = roundHalfUp(P4×Q4, 1,000,000)` **per priced component**, using BigInt. The factor does **not** enter this formula when the component has an explicit price for its own unit.
- If the selected unit has **no override**: derive its exact price as a rational `P4_default × (F_target/F_default)`. Evaluate the entire expression with one final half-up at the component posting boundary; **do not round the rational rate to a synthetic 4dp price before multiplication**. That would reproduce the legacy lost-poisha bug in a new form.
- A unit price stored as `0` is not an omitted override. The normal **positive-priced-but-rounded-to-zero** guard is distinct from explicit free-goods/zero-price rules; legacy sale rejects a zero-value whole invoice, and existing free samples may belong to other source workflows.

**Implementation caution:** These equations specify candidate *domain calculation semantics*. They do not decide PostgreSQL `NUMERIC` vs bigint columns, indexes, API field names, performance limits, or source table shape. Guard both intermediate BigInt limits and final `Number.MAX_SAFE_INTEGER` if interfacing with existing JS `Money`, `Qty` and JSON integer contracts.

### 3.1 Worked single-unit and multi-unit cases

| Test vector | Correct candidate result | Regression protected |
|---|---|---|
| 1 Box = 20 Pcs; 1 Carton = 12 Box | Cumulative `F(Carton)=240 Pcs`; `1 Carton + 2 Box + 5 Pcs =285 Pcs` or `B3=285,000` | Adjacent chains, not a tenant-global “Carton size” |
| 1 Box of custom sell **৳232.25** + 5 Pcs at custom **৳12.50/Pcs** | Box `23,225` poisha + Pcs `6,250` = **৳294.75** gross; base stock issue `25,000` at scale3 | Box need not cost `20×৳12.50=৳250`; different prices must survive |
| 1.5 Box priced **৳105.05/Box** | Exact `৳157.575` → half-up **৳157.58** at component boundary | No intermediate loss from base price rounding |
| 1 Pipe = 20 Feet, regular sell **৳105.05/Pipe**, 5 Feet at automatic price | Exact rational `5/20×৳105.05=৳26.2625` → **৳26.26** | Do **not** store `৳5.25/Feet` first |
| Price **৳0.0001** per Pcs × 1 Pcs | Exact `৳0.0001` rounds to `0` poisha; **recommended refusal** with original price preserved | No implicit free sale or “success” at zero |
| Price **৳0.0001** per Pcs × 100 Pcs | Exact `৳0.01` → **1 poisha** | Master price below one poisha is meaningful at enough quantity |
| Entered **0.0001 Box**, factor 10 Pcs/Box | `0.001 Pcs` → `B3=1`, exact and representable | UI 4dp entered qty may validly yield backend scale3 |
| Entered **0.0001 Box**, factor 3 Pcs/Box | `0.0003 Pcs` → `B3=0.3`, not integer → **refuse** | No silently rounded stock |
| `saleLines` single-unit legacy `unitPriceMinor=1050`, `qty=1500` | `1050×1500/1000=1575` poisha = **৳15.75** | Legacy `Money.multiply(Qty)` unchanged |

**Double-rounding warning:** a 1.5 Box line at ৳105.05 gives ৳157.58 under half-up; a UI can accidentally show ৳157.57 due to float representation or its text formatter. Source value must win, and the user must see an explicit review before committing differing totals.

## 4. A compound price has a compound return problem

The existing two UI paths must not be conflated:
- **Modern unit-map path:** [`unitQuantitiesSaleTotal`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/7948c7d0295fe0de0786c72b7bd566f49672b857/src/utils/multiUnitTransactions.ts) adds separately priced unit components, each currently rounded in browser.
- **Legacy two-box POS path:** [`compoundLineTotal`](https://github.com/shuvodelux-commits/hisabiq_ui/blob/7948c7d0295fe0de0786c72b7bd566f49672b857/src/utils/posQuantity.ts) prices the primary entered unit and **prorates that price** to the secondary base quantity. If Pcs has a separate custom price, these outputs can disagree even with identical base stock qty.

**Return example:** Sale originally records `1 Box @ ৳232.25 + 5 Pcs @ ৳12.50 = ৳294.75`, quantity 25 Pcs. Returning only 5 Pcs *without* discount should credit **৳62.50** against the original Pcs segment, **not** `5/25 ×৳294.75 = ৳58.95`. A single price/total and base qty are not enough to recover original component-level unit pricing. **Recommendation:** preserve an immutable source segment record within each posted line, with stable source segment ID, original selected unit ID, exact entered qty/price, source profile revision, original base qty, posted gross/discount/net, original product/unit labels and current returned quantity. Return request should reference **the appropriate original segment**, plus existing source-origin inventory/serial allocation IDs, not current product custom prices. This requires **separate R4 transaction/return design**; no backend shape is authorized here.

**Discount example (candidate allocation order):**

| Component | Gross | Bill discount allocated* | Original net |
|---|---:|---:|---:|
| 1 Box | ৳232.25 | ৳7.88 | ৳224.37 |
| 5 Pcs | ৳62.50 | ৳2.12 | ৳60.38 |
| Total | **৳294.75** | **৳10.00** | **৳284.75** |

*Allocate 1,000 poisha across weights `23,225` and `6,250` with existing largest-remainder algorithm, tie by source component sequence. On full return of 5 Pcs, proposed refundable value is its original **৳60.38** segment net, not 5/25 of the original discounted line. For partial Pcs returns, keep the **existing** last-partial-return residual principle scoped to that source segment: returning 2 of the 5 Pcs first credits `roundHalfUp(60.38×2/5)=৳24.15`, and returning remaining 3 Pcs credits the exact remainder **৳36.23**. Total Pcs refunds = ৳60.38.

**Accounting constraints:** Source segment sums reconcile to the original posted line `netAmountMinor`; line sums reconcile to the invoice; refund+credit cannot exceed actual source remainder; COGS/owned-vendor origin allocations remain tied to immutable original movement/cost source and **must not** be prorated from today's average. A return across components with different prices and mixed origins needs segment-to-origin mapping with validated base quantities and serials. Segment IDs and allocation order must be stable for idempotency, offline retry and multiple returns. This is a proposed direction, not a claim the current API supports it.

## 5. Legacy compatibility, security and offline correctness

1. **Legacy product price API** remains whole-poisha base price with at most one conversion. Legacy-compatible products may continue using merged GET/Create/Edit adapters. Advanced products must not be serialized through a 24-field body, nor may imports or client edits strip unit price overrides.
2. **Price and cost access:** Unit purchase prices are `inventory.cost.view`-sensitive. Missing unauthorized cost data is **absent**, not `0` or `null`, and creating/editing with cost-blind rights must use safe field-scoped server permissions—not reconstructed full DTO. Recompute current authorization on idempotent replay (same user, another user, revoked permission) and prevent cross-tenant snapshots.
3. **Locked source profile:** For an offline sale draft, freeze product ID, source profile version, exact factor to base, unit identities, selected unit quantity, accepted unit price and any manual override reason; one authorized offline POS device per tenant. On sync, source-owned server checks version, permissions, stock/serial availability, conflict and replay; reject unsupported stale changes without inventing prices. Preserve Pending/Synced and exceptional Needs Review state semantics.
4. **Sales/Purchase and accounting:** Additive metadata **must not rewrite** previously posted invoices, source returns, purchase lots, COGS, journal or customer/supplier balances; existing per-line value and largest-remainder behavior remains authoritative for legacy. Discount/refund rounding source scopes must be proven together.
5. **Master unit changes:** Unit labels/factors after a transaction cannot change historical unit display or refund amount. `nameBn`, symbol and EN label snapshots are separate metadata; use stable IDs and don't reinterpret archived multi-conversion rows from migration `0010`.
6. **Price precedence:** Distinguish default regular unit-price rate, per-unit override, cart manual/negotiated price, active offer, planned installment/courier price, last supplier purchase cost and actual landed lot cost. Do not assume today's master price or current offer should override an already posted source.
7. **No silent rounding row:** If a discrepancy exists between server total and draft preview, use existing review controls. A designed explicit payment rounding/adjustment policy for final settlements, if later authorized, is distinct from the currency precision in item pricing and cannot be an invisible journal plug.

## 6. Proposed verification matrix for later code work (not executed here)

| Category | Required tests and observable result |
|---|---|
| Strict decimals | `12.3456` price accepted exactly; `12.34567`, `1e3`, signed invalid stock qty, NaN, Infinity, separators, locale ambiguity and overflow refused with field messages; zero vs absent preserved |
| Arithmetic property | For rational factors and 4dp prices, BigInt result equals independent high-precision reference; unsigned and negative half-up ties deterministic; no magnitude exceeds safe integer or DB bigint |
| Stock representability | 4dp selected qty that yields exactly 3dp base accepted; nonrepresentable base rejected; no movement/lot/ledger on rejection |
| Independent price | Pcs/Box/Carton custom buy/sell prices round-trip; no accidental base-unit recalc, nearest-unit fallback, last-cost overwrite or supplier leakage |
| Mixed-unit source | Different component prices on one cart line produce sum of separately rounded components with stable source segment IDs; legacy compound path discrepancy shown and reviewed, not silently changed |
| Discount | Multiple segments, tiny totals and repeated line discounts allocate exactly by largest remainder; line totals and invoice totals reconcile; tie-breaking stable even offline |
| Sales return | Refund only original Pcs segment at original net, including partial refunds with final residual; no refund at current price/factor and no over-return; cancellation/source reversal balances money and stock |
| Purchase return | Original bill, lot, landed-cost/discount allocation and selected unit snapshots drive supplier return value, cost layer and stock; no master rewrite |
| Authorization | `COST_VIEW` revoked after draft, another same-tenant principal, cross-tenant unit/product/profile, stale version and idempotent replay do not leak or overwrite cost |
| Race/offline | Two editors same version; offline profile change; repeated operation ID with same/different fingerprint; one device authorization; Needs Review only for truly exceptional conflict |
| Migration | Zero/one/multiple historic `product_unit_conversions` rows, `0010` pair mismatch, legacy readers, safe backfill, rollback refusing destructive downgrade; no old source amount/wording changed |
| End-to-end | Disposable PG16 source-owned line/source segment/return/ledger reconciliation; preserved React Product form/keyboard/mobile/Bangla helpers; explicitly approved before any production activation |

No test or runtime result is claimed by this **documentation-only** proposal.

## 7. Order of future work and strict execution hold

1. **R1-A signoff:** Owner/accounting selects policy for 4dp price, scale-3 base quantity representability, positive sub-poisha-priced segments, component-versus-line rounding, mixed-unit legacy behavior, discount/return source scoping. Update [DECISIONS.md](../DECISIONS.md) in a **separate** owner-approved decision PR when these are actually approved; this proposal alone is not that approval.
2. **R1-B storage/contract architecture:** Based on R0's historical data census (requires separately approved disposable snapshot), freeze one authoritative profile revision, per-unit price fields, source price segments, constraints/RLS/FK and backward-compatible explicit API version/typed discriminator. Product creation/edit and transaction ownership must not overlap.
3. **R2 backend migration:** Additive schema on authorized disposable PG16 with rollback, RLS, tenant/product/unit ownership and legacy preservation tests. Not approved now.
4. **R3 product master:** Exact profile create/read/versioned update, idempotency/revoked cost permissions, audit/outbox. Not approved now.
5. **R4 source transactions:** Exact source component pricing, chosen unit quantity, sale/purchase line snapshots, original line/segment returns, purchase lot/COGS, offline version. Not approved now.
6. **R5 UI binding:** Preserve existing React product form, POS V2 and Purchase carts, bilingual helpers, keyboard/touch, four-decimal input and compact controls; use server calculation/review and full end-to-end proof. Not approved now.

**Safety/scope:** Product hard Delete still blocked by [backend issue #32](https://github.com/shuvodelux-commits/nestshererp/issues/32). D04 warranty/serial/expiry, Service/Bundle, gallery and opening stock require separate complete contracts; do not represent them as solved by R1-A. Do not start a DB, issue SQL against a real tenant, deploy, silently run UI migrations or claim financial posting from this PR.

## 8. Owner/finance decision checklist — approval requested separately

| Decision | Proposed choice for explicit approval | Status |
|---|---|---|
| D16-P1 | **Four decimal BDT unit prices** and stable exact source price, whole-poisha posted totals | **OPEN** |
| D16-Q1 | **Entered qty up to 4dp**, server must validate exact scale-3 canonical stock representability | **OPEN** |
| D16-R1 | **Half-up once per priced unit component**, then sum per line; keep existing legacy whole-poisha source calculation unchanged | **OPEN** |
| D16-D1 | **Largest remainder** discount/landed cost allocation with stable source component ordering and exact total | **OPEN** |
| D16-S1 | **Source segment-specific partial returns**, with last-return residual and original source-priced net/cost | **OPEN** |
| D16-Z1 | Master price as low as `৳0.0001` allowed; **positive component rounding to zero** must be explained/refused absent separately approved free/aggregation policy | **OPEN** |
| D16-C1 | Preserve current multi-unit-map custom-price semantics and **explicitly handle legacy two-box prorating** without changing old draft/invoice history | **OPEN** |
| D16-L1 | Distinguish configured custom unit cost from latest purchase cost and landed lot value | **OPEN** |

**Approval boundary:** Closing/merging the PR containing this review means the proposal was reviewed as documentation. **No decision row becomes “confirmed” until the owner explicitly chooses it and the accounting/architecture reviewer accepts the resulting contract.**
