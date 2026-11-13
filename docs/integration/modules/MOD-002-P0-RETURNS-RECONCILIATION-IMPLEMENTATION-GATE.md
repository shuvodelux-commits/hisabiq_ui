# MOD-002 P0-R02 — Source-booked sales and purchase return reconciliation gate

> **PLANNING / P0; NOT IMPLEMENTED; OWNER/ACCOUNTING POLICY APPROVAL REQUIRED.** This is a source-audited, bounded backend remediation contract for the already-open [NestSherERP accounting defect #36](https://github.com/shuvodelux-commits/nestshererp/issues/36). It supersedes any claim that the existing final-return quantity-rounding formula guarantees value reconciliation. **Do not run SQL, write a migration, modify production postings, change a cash setting, ship a code fix or add tests from this document alone.** The existing React Product/POS/Purchase UI and all its functionality remain intact.

**Pinned baseline (2026-11-13, Asia/Dhaka):**
- Frontend source `shuvodelux-commits/hisabiq_ui/main@2b0c6b99bde4985c54b66fccd7d9f7f6a6b921dc`, after merged P0 documentation [PR #381](https://github.com/shuvodelux-commits/hisabiq_ui/pull/381).
- Backend source `shuvodelux-commits/nestshererp/chore/hisabiq-adoption-runtime-a01@0a2cacc7114eb3f67d02f802116397f82965b465`. The range since return-audited `54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a` contains **D08 Party** changes, not return-domain/API/repository changes; this was checked against the GitHub changed-file list. The backend repo's default branch is **not** assumed to contain this adoption head.
- Work tracking: [HisabIQ P0-R02 issue #389](https://github.com/shuvodelux-commits/hisabiq_ui/issues/389), [backend defect #36](https://github.com/shuvodelux-commits/nestshererp/issues/36), [R0 audit with P0 correction](MOD-002-R0-BACKEND-UNIT-PRICING-SOURCE-AUDIT.md), [R1-A policy proposal](MOD-002-R1A-EXACT-PRICING-ROUNDING-DECISION-PROPOSAL.md), [R1-B conditional profile design](MOD-002-R1B-VERSIONED-UNIT-PROFILE-CONTRACT-PROPOSAL.md), [decision register](../DECISIONS.md).

## 1. Verified current pipeline, reuses and blockers

| Real source | Current behavior observed | Classification for scoped repair |
|---|---|---|
| [sales-return domain](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-domain/src/sales/sales-return.ts) | `ReturnableLine` has sold qty, previously returned qty, original net and cost, **not money actually already returned**. `shareOf` rounds each nonfinal slice independently; for final slice subtracts **rounded cumulative qty estimate**, not posted sums. `rejectSalesReturn` rejects total return value zero. | **EXTEND** original source amounts with actual-prior booked monetary information, fix residual and test. Keep signed cash refund/credit rules. |
| [purchase-return domain](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-domain/src/purchasing/purchase-return.ts) | `ReturnableBillLine` has original supplier-billed net, actual lot unit cost and returned qty. `billedShare` repeats final-quantity-estimate logic, and cost allocation uses original unit cost × qty, rounded for each return. | **EXTEND**, but keep supplier billed value distinct from actual inventory lot cost and extra-cost expense adjustments. |
| [sales-return service](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-application/src/returns/create-sales-return-service.ts) | Tenant UOW, authorization, idempotency lookup, **`lockSale` on parent sale**, then `findReturnableInvoice`; currently supplies qty-only history to domain; later computes **exact owned/vendor/lot COGS** and writes source-linked journal + return rows. | **REUSE** lock, authorized source, allocation and idempotency. Make money preflight and actual cost cap part of same posting UOW, not a separate HTTP call. |
| [purchase-return service](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-application/src/returns/create-purchase-return-service.ts) | Tenant UOW, auth and replay; `findReturnableBill` reads qty/lot/cost, but inspected create path has **no explicit parent Purchase row lock** before deriving returnable amount; later writes journal, lot and return. | **BLOCK until verified** that concurrent independent operation IDs cannot both consume same original value/lot. An explicit parent lock or proven equivalent transaction serialization is recommended; do not assume current transaction alone is enough. |
| [sales-return repository](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/adapter-postgres/src/sales-return-repository.ts) | Existing `returnedQty` subquery sums `sales_return_lines.qty` joined to **POSTED / not deleted** `sales_returns`; posted return line already persists `value_minor` and `cost_minor`. Parent sale row lock exists in this repository. | **REUSE posted source rows**; add measured `SUM(srl.value_minor)` and (when meaningful) `SUM(srl.cost_minor)` with the **same posted status/tenant/soft-delete predicate**, returned alongside qty in one consistent transaction. |
| [purchase-return repository](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/adapter-postgres/src/purchase-return-repository.ts) | Existing `returnedQty` sums `purchase_return_lines.qty` joined to **POSTED / not deleted** parent return; row stores original returned monetary `value_minor` and inventory `cost_minor`. `findReturnableBill` includes remaining lot qty. | **ADAPT** with source-booked monetary aggregates + atomic lock/constraint; preserve original bill line/lot valuation and return reversal semantics. |
| [application return ports](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-application/src/returns/sales-return-repository.ts) and [purchase port](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-application/src/returns/purchase-return-repository.ts) | Existing row types expose returned qty, not prior `value_minor`/cost sums. No stored cached returned-money counter is necessary to discover history. | **EXTEND exact interface fields** only; reflect server authority and avoid exposing privileged cost in a redacted React read. |
| [return request contracts](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-contracts/src/returns.ts) | `createSalesReturnRequestSchema`/`createPurchaseReturnRequestSchema` accept arrays of source lines (1–200), with no evident array-level uniqueness predicate for source line IDs. Domain loop checks each line against the *same* previous qty. | **EXTEND validation or deduplication** to reject duplicate `saleLineId` / `purchaseLineId` in a single command; never allow separately validated duplicates to bypass quantity or money caps. |
| [returns API tests](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/apps/api/test/returns.spec.ts) | The existing tests/route coverage file exists. Source scan did not establish a test for the 3-poisha/5-Pcs multi-document over-credit or duplicate-line and concurrent-return cases. | **Future approved tests**, not executed in this documentation task. |
| [frontend POS price snapshots](https://github.com/shuvodelux-commits/hisabiq_ui/blob/2b0c6b99bde4985c54b66fccd7d9f7f6a6b921dc/src/utils/multiUnitTransactions.ts) | Modern unit-map can price Pcs and Box independently; legacy compound path can prorate selected unit's price. These are already documented under MOD-002 R1-A/R1-B. | **PRESERVE** React UI and pre-existing preview/cart semantics; do **not** use this return bug as permission to cut over advanced unit pricing or edit Product schema. |

**QA note on source pin:** The PURCHASE return repository URL above intentionally targets a path whose content has been checked in the backend adopted branch. QA must verify the precise URL SHA matches the source-pair before approving this document; a wrong SHA is a blocking citation error, not acceptable evidence.

## 2. Deterministic defect and why an apparently simple final-return fix is insufficient

**Counterexample A — over-returned value (sales and supplier bill):** A line sold or billed **5 Pcs** at gross 5 poisha, with an allocated 2-poisha discount; **original net = 3 poisha**. Five separate one-Pcs return documents contain successive previously returned quantities `0, 1, 2, 3, 4`. Current `shareOf`/`billedShare` returns `[1, 1, 1, 1, 1]` poisha because each nonfinal share rounds `3/5 →1`, and final share calculates `3−round(3×4/5)=1`. Sum **5 poisha**, exceeding original net **3 poisha** by 2. This counterexample uses the pure integer formula and posted-line field contracts, **not an application E2E or real tenant read**.

**Counterexample B — zero-money positive-quantity return:** For original **5 Pcs, net 2 poisha**, one return of 1 Pcs computes `round(2/5)=0` and is refused by the current `RETURN_HAS_NO_VALUE` rule despite quantity being positive. Whether such source-linked zero-value stock returns should post needs an **owner/accounting decision**; must not invent a cash journal/rounding line or silently mark as free goods. A repaired allocator may legitimately assign `0` to intermediate sub-portion(s); changing the allocator without addressing this means full sequential returns remain impossible for some low-value lines.

**Counterexample C — same-request duplicate:** If an API request repeats one `saleLineId` or `purchaseLineId` twice, current schema permits the array shape and the pure domain validates each draft row against the **same** earlier `qtyReturned`, not against total requested qty in the batch. The service must reject duplicates *before* price, stock or ledger work. A future duplicate-aggregation approach would need explicit source-line merging policy; **rejecting** is the safer minimal contract.

**Counterexample D — purchase concurrency:** Two transaction requests with different operation IDs read the same bill before either return writes. Sale path has an explicit source lock, but the Purchase create path inspected has no corresponding parent-purchase lock, so the exact transactional isolation/lot conditional enforcement must be probed. **This is a lock review gap, not proof that a double post has occurred**. Do not claim existing lot checks are absent without tracing the full writer/DB constraints.

## 3. Candidate minimal value algorithm — proposed for owner/CA approval

Use source-line dimensions; do not aggregate across unrelated invoice lines or tenants:

- `A` = the **original posted** source line's actual net poisha (`saleLines.netAmountMinor` or original billed `purchaseLine.lineTotalMinor - discountShareMinor`), immutable.
- `Q` = original line source qty as scale-3 integer.
- `q` = **previously posted (nonvoided) return qty** for that source line.
- `v` = actual **sum of `return_lines.value_minor` previously POSTED/nondeleted** for that source line under same tenant.
- `r` = newly requested positive qty, with `q+r <= Q`, and no repeated source-line ID in this command.
- Candidate cumulative target `C = roundHalfUp(A × (q+r) / Q)`, except exact full-return `q+r = Q` should target `A` exactly.
- New proposed monetary return `Δ = C − v` (integer poisha). It must satisfy `0 <= Δ <= A−v`. **If `v>A`, `Δ<0` or old source history otherwise violates invariants, FAIL CLOSED** with a reconciliation-required error; do not silently clamp, issue a negative return, rewrite old returns, hide a rounding row, or “repair” historical ledgers in a foreground sale.
- For a full source return where historical earlier amounts are consistent, `newMinor = A−v` exactly. For partial nonfinal, the cumulative target subtracts **actual previously posted values** so multiple return documents sum to the approved original. This is a **proposed** deterministic rule, not a confirmed business policy.

Example for **3 poisha/5 Pcs** under that proposed target:
```text
return #     cumulative qty     cumulative target C     prior booked v     new Δ
1            1/5                 1 poisha                 0                  1
2            2/5                 1 poisha                 1                  0  (policy gate)
3            3/5                 2 poisha                 1                  1
4            4/5                 2 poisha                 2                  0  (policy gate)
5            5/5                 3 poisha                 2                  1
sum                                                                    = 3
```
The **monetary correctness** of this calculation does not automatically make return #2/#4 an allowed **zero-value** movement. Until the owner approves its treatment, the existing refusal may remain as a safe stop, or a specifically approved alternative allocation policy may be selected. Report the tradeoff; do **not** paper over it by billing a positive 1-poisha amount that over-refunds the source.

**Reversal:** `v` and `q` include **POSTED/non-deleted** returns only, including older already-posted transactions with their actual value, and exclude appropriately VOIDED returns. Never subtract a voided return's stored value twice; its reversal journal already compensates the original source. Read the same status snapshot for both previous qty and money.

**Cost:** Do **not** calculate COGS/inventory from the revenue `A`: sales Source returned cost may be reconstructed from exact original consumed lot/source allocation, including vendor/negative origins. The purchase billed return value may be different from actual landed inventory cost because of extra-cost allocation. For each original source line and cost-origin grouping, separately verify actual previously returned `cost_minor` against original source-booked cost and the remaining lot origin, with explicit bounded invariants. The full original source COGS/lot adjustment must reconcile on complete return subject to serial/owned/vendor source constraints. Do not apply a naïve `min(costRemaining, recomputedCost)` adjustment: it may break Inventory/COGS/FIFO valuation. A separate owner-approved cost rounding/valuation contract may be necessary.

## 4. Exact execution seam for a future approved code/test task

**Proposed backend file ownership (must be confirmed before coding; none edited in this PR):**

| Order | Backend file(s) | Expected change/validation |
|---|---|---|
| 1 | `packages/core-domain/src/sales/sales-return.ts`, `packages/core-domain/src/purchasing/purchase-return.ts` | Correct source-valued partial return computation from actual booked previous line value; separate stock cost; validate integer safety, `q+r<=Q`, overcredited historic state, zero-value policy. |
| 2 | `packages/core-application/src/returns/{sales-return,purchase-return}-repository.ts` | Add tenant-scoped previously posted value/cost sums to ReturnableLineRow/ReturnableBillLineRow without adding a mutable counter or changing unrelated relationship APIs. |
| 3 | `packages/adapter-postgres/src/{sales-return,purchase-return}-repository.ts` | Query summed `value_minor`/`cost_minor` on existing return lines with the **same posted + nondeleted** filter as qty, in one source UOW. Assess `FOR UPDATE` on parent Purchase row as with Sale. Verify no RLS/cross-tenant side path, lock order and void semantics. |
| 4 | `packages/core-application/src/returns/create-sales-return-service.ts` and `create-purchase-return-service.ts` | Use money-aware returnable rows, enforce transaction/actor permissions, actual source cap, reject duplicate IDs, preserve existing cash-session/account/PIN/idempotency and credits. Verify source-owned cost/lot reconciliation and reversals. |
| 5 | `packages/core-contracts/src/returns.ts` **only if needed** | Add explicit duplicate-line uniqueness validation while preserving existing wire shape and clients; no unapproved public response fields or frontend redesign. |
| 6 | `packages/core-domain/test/` focused return files and `apps/api/test/returns.spec.ts` **only when explicitly authorized** | Red/green at exact changed SHA on disposable environment; separate Node20/PG16 CI and accounting review; no test execution is claimed in this doc. |

**Likely no new migration** for the P0 *value* repair because posted `sales_return_lines.value_minor` and `purchase_return_lines.value_minor` already exist. This is a source inference, **NOT** a guarantee: full schema/void/return-cost/locking investigation must confirm it before the implementation allowlist is approved. Any later migration must have its own migration-owner reservation, test DB and rollback.

**Source locks and races:** Sale service `lockSale` should remain; Purchase service must serialize all returns against the same original bill (or demonstrate equivalence using DB constraints/locking) *before reading summed posted amounts*. Reversal must obey compatible parent locks and not race new returns or be excluded mid-transaction. Keep one UOW for read/value/stock/journal/return writes; no client side chain and no swallowed retry with a new operation ID.

**Post-approval behavior:** A legacy return with no rounding dispute posts as before; an overcredited historical original source line becomes **reconciliation-required** rather than permitting more credits. Existing posted data is never bulk-edited or silently backfilled. Customer/supplier cash, AR/AP and advances continue their source-owned accounting paths.

## 5. Future test and independent QA matrix (none executed here)

| Test vector | Required invariant |
|---|---|
| 5 units / original 3 poisha | Five single-unit requests **cannot** cumulatively credit >3; either approved zero-value partial movements or explicit safe refusal at relevant step, never an extra poisha |
| 5 units / original 2 poisha | Explicit, user-approved handling for return segment with `Δ=0`; don't manufacture or drop a cash/credit movement |
| 3 units / original ৳100.00 | Multiple partition orders sum exactly to 10000 poisha, no 1-poisha loss/gain |
| 2 units / original 1 poisha; 1000 separate tiny units | Exact integer bounds, safe zero intermediate and overflow rejection |
| Bill discount + extra landed cost | Purchase credit value against **original supplier-billed net**, inventory release at **original lot cost**; no fake supplier receivable for transport |
| Sale with lot + vendor consignment + negative stock | Refills and COGS at original owned/vendor source allocation, exact source value, no double counting |
| Two separate return requests for same sale | Parent sale lock + idempotency/tenant guards prevent extra money/qty |
| Two separate return requests for same purchase | Parent bill lock or equivalent proven serialization prevents double value/lot issue |
| Same source line ID twice in one request | Server rejects before source posting, even if individually each qty would be allowed |
| Return on already fully returned line | Safe refusal without journal/stock writes; neither zero nor negative residual posted |
| Voided previous partial return | Exclude VOIDED value **and qty**, while preserving reversal and history; void/create race serialized |
| Source already historically overcredited | Fail closed, surface reconcile-required review; never retro-edit original return |
| Same operation ID replay/different fingerprint | Exact same result once; no double refund, duplicate stock issue, duplicate audit/outbox |
| Revoked cost-view / cross-tenant source ID | No unauthorized returned cost read/mutation; tenant RLS, same-tenant IDs and current permissions enforced |
| Posting invariants / CI | Source gross/net/discount and customer/supplier ledger, inventory/COGS, journal balancing, daily cash and return totals still reconcile; original React POS and Purchase UI untouched |

**Tests are future acceptance criteria, not passing results.** Before a code/test PR, owner must authorize exact files, Node20/PG16 disposable test target, automated tests and human QA. Existing backend AGENTS older blanket test restrictions do not permit silently running new suites; follow current explicit integration-specific approval gates.

## 6. Owner/accounting decisions and task disposition

| Gate | Recommendation | Status |
|---|---|---|
| P0 money reconciliation | Derive `newMoney` from **cumulative source target minus actual POSTED booked money**, with strict source residual cap and fail-closed on overcredit | **PROPOSED, pending approval** |
| P0 purchase serialization | Parent Purchase row lock and consistent return creation/void lock ordering, without broad migration | **RECOMMENDED, pending design review** |
| P0 duplicate source lines | Reject duplicated return line IDs in each request before any journal or inventory work | **RECOMMENDED, pending approval** |
| Positive quantity with 0 value | Allow explicitly source-linked zero-money stock return *or* defer/refuse until combined; determine journal/COGS and UI wording | **OPEN business/accounting policy** |
| Cost residual / INV-05 | Reconcile original lots and cost origins using actual previously posted cost rather than item sale net; no valuation plugs | **OPEN for independent accounting review** |
| Historic overcredit corrections | Flag and review source-linked, permission-aware correction; no automatic historic adjustment | **OPEN** |
| Source tests, backend code, any migration/deploy | Separate exact-scope owner build approval, disposable environment and independent CA/security QA | **NOT AUTHORIZED by this PR** |

**Execution result of P0-R02:** verified source architecture, established a candidate minimal source-money algorithm and coverage/gate matrix. **No backend code change, automated app tests, PostgreSQL fixture work, tenant data access, migration, deployment or explicit financial policy approval was performed.** Source of truth remains the two live repositories; this document is an implementation proposal to review, not a new ERP engine.
