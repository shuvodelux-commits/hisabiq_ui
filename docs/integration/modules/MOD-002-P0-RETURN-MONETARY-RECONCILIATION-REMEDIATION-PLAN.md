# MOD-002 P0-A — Posted-money reconciliation for repeated sales and purchase returns

> **STATUS UPDATE — IMPLEMENTED IN ADOPTION BRANCH, 2026-11-13.** This document preserves the original **pre-implementation source audit and proposal** for traceability. Its statements that zero-poisha returns were undecided and coding blocked describe the **historical planning state**, not current authorization or source. The owner subsequently **approved Option A**; the scoped fix was merged in [NestSherERP PR #43](https://github.com/shuvodelux-commits/nestshererp/pull/43) at [commit 9b89ae17a82172ff7712b4d1a2bf2106c14527b2](https://github.com/shuvodelux-commits/nestshererp/commit/9b89ae17a82172ff7712b4d1a2bf2106c14527b2). **Not deployed. No existing tenant data inspected or corrected.**

### As-built outcome (supersedes original stage gates below)

- **Owner-approved Option A:** A positive-quantity source return may have **zero poisha** of incremental customer refund/supplier credit. Return document, stock/lot movement and audit/outbox still post. Real original cost movements produce a **balanced** journal. If both return monetary value and source cost are zero, no fake journal header or zero-amount journal line is inserted.
- **Actual booked money:** New return value uses the cumulative source-line entitlement minus values already **actually posted** in prior non-voided return lines (not independently rounded prior-quantity guesses). For five pieces sold for three poisha, separate one-piece returns allocate **[1,0,1,0,1]**, totalling exactly three. Historically over-credited sources fail closed, pending a separate audited correction.
- **Source cost and concurrency:** Sales retain exact original lot/vendor allocation cost, separate from customer refund. Supplier bill credit and lot inventory valuation are reconciled independently. A signed stock-adjustment balancing line handles genuine differences. Sale/purchase source locks serialize create and void; purchase lot decrements enforce atomic remaining-stock checks.
- **UI preservation:** HisabIQ React UI remains unchanged. Two existing *backend legacy Vue* return dialogs use additive posted-history contract fields and permit zero-money stock returns without redesign. No schema migration or new return-money columns.
- **Verification on final code PR head cf92fa8fa5eb3f2872629d4bd8a56d4aa3461ef3:** Node 20.20.2 **178/178 domain tests**, Node 20.20.2 + dedicated disposable PostgreSQL 16 **12/12 return API tests**, scoped build/workspace typecheck/lint/boundary and diff checks all passed. Pull-request CI verify/acceptance passed. The separate post-merge adoption-branch CI was still in progress at the first check.
- **Still unapproved:** production deployment; customer DB scans, historical reconciliation, backfill or monetary repair; advanced D16 independent unit-pricing/component source accounting. The original immutable source links below intentionally reference the *pre-fix* code for diagnosis.

---

> **HISTORICAL PRE-APPROVAL SNAPSHOT: SOURCE-VERIFIED IMPLEMENTATION PROPOSAL.** This plan addresses the repeated partial-return monetary over-credit problem documented in [backend issue #36](https://github.com/shuvodelux-commits/nestshererp/issues/36). The affected source return-line tables **already store posted value and cost in poisha**. A no-new-column repair appears feasible, subject to source-cost and accounting validation. No implementation, DB query, test suite, migration, production correction, or UI change is authorized by publishing this document. The zero-poisha policy was **OPEN when originally drafted**, but Option A was subsequently approved and implemented as stated above.

**Source pair, 2026-11-13 Asia/Dhaka:** HisabIQ frontend main at 8385d5f8f4954e95b3a5a873ec820b890874eef1; Nest backend adoption branch at 0a2cacc7114eb3f67d02f802116397f82965b465. The backend commits after 54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a changed D08 Party ledger files, not the return source reviewed here. Re-verify the precise pair before implementing.

**Tracking:** [frontend issue #395](https://github.com/shuvodelux-commits/hisabiq_ui/issues/395), [backend defect #36](https://github.com/shuvodelux-commits/nestshererp/issues/36), [merged P0 docs correction PR #381](https://github.com/shuvodelux-commits/hisabiq_ui/pull/381), [R0 audit](MOD-002-R0-BACKEND-UNIT-PRICING-SOURCE-AUDIT.md), [R1-A proposed pricing](MOD-002-R1A-EXACT-PRICING-ROUNDING-DECISION-PROPOSAL.md), [R1-B proposed source snapshot](MOD-002-R1B-VERSIONED-UNIT-PROFILE-CONTRACT-PROPOSAL.md), [decision register](../DECISIONS.md).

## 1. Present source ownership and exact delta

| Component | Verified existing behavior | Remediation scope |
|---|---|---|
| [Sales return domain](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-domain/src/sales/sales-return.ts) | The shareOf method rounds each non-final quantity fraction independently. The final return subtracts a **rounded prior-quantity estimate**, not the value **actually booked** on previous returns. The same defect can affect the line cost. | Add real previously posted line value/cost to ReturnableLine and implement independently reviewed cumulative entitlement minus actual booked money; preserve source-net and source-cost basis. |
| [Purchase return domain](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-domain/src/purchasing/purchase-return.ts) | billedShare uses the same final quantity-estimate pattern; lotCost separately rounds actual unit cost times quantity. | Reconcile actual prior billed value and landed inventory cost, without pretending those are the same monetary pool. |
| [Sales application service](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-application/src/returns/create-sales-return-service.ts) | A transaction UOW, role check, operation ID replay, **lockSale** before reading the invoice, source lot and vendor-origin logic, refund/cash-session policy, audit and outbox already exist. Only qtyReturned is passed as past return history. | Preserve everything above; include actual prior posted money and a strict shared-source cap in the same locked UOW, before posting. |
| [Purchase application service](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-application/src/returns/create-purchase-return-service.ts) | A transaction UOW, role/idempotency and source-bill read exist; **no matching source purchase parent lock is visible in its create method before findReturnableBill**. | Inspect complete lock ordering and add a tenant-scoped purchase lock before aggregate reads and stock movement, after independent backend/DB review. |
| [Sales return repository and port](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/adapter-postgres/src/sales-return-repository.ts) / [port](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-application/src/returns/sales-return-repository.ts) | posted active prior return quantity is calculated as an SQL SUM of sales_return_lines joined to sales_returns with POSTED status and non-deleted parent; original source sale line net/cost is read. | Add source-line-scoped SQL aggregates of **posted prior value_minor and cost_minor**, in the same returnable read and tenant scope. Avoid mutable cached return counters. |
| [Purchase return repository and port](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/adapter-postgres/src/purchase-return-repository.ts) / [port](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/core-application/src/returns/purchase-return-repository.ts) | Returned qty is summed from posted active purchase returns; original billed net is purchase line total less discount share, inventory value uses purchase source actualUnitCost. | Add posted prior value/cost aggregates; inspect lot/cost origin and matching original valuation cap. |
| [Stored return lines](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/packages/adapter-postgres/src/schema.ts) | salesReturnLines and purchaseReturnLines each already contain original source-line ID, qty, **valueMinor**, **costMinor**, return ID and tenant ID. | No new monetary history columns proven necessary. Actual installed schema and indices must be verified in disposable PG16. |
| [HTTP/API tests](https://github.com/shuvodelux-commits/nestshererp/blob/0a2cacc7114eb3f67d02f802116397f82965b465/apps/api/test/returns.spec.ts) | Existing tests cover ordinary creation, quantity over-return and permissions; repeated tiny-money partial returns and same-parent concurrency are not visibly exercised. | Add focused pure domain and HTTP/PG16 tests after owner approves implementation and fixtures. |

**REUSE:** Existing UI, source net values, cost origin, cash drawer conditional policy, role checks, operation idempotency and audit/outbox. **ADAPT:** Domain calculation, repository read projections and application inputs. **EXTEND:** Purchase parent lock, regression and concurrency tests. **HISTORICALLY BLOCKED:** Zero-value return posting was later approved and implemented in backend PR #43; manual correction of historic overcredits and advanced D16 independently priced component returns remain unapproved.

## 2. Reproducible arithmetic, not a claim about any tenant

A five-piece source line with **3 poisha net after discount** has original scale3 qty of 5000 and netAmountMinor of 3. Five separate one-Pcs returns each have qty 1000. For every non-final return, current shareOf returns half-up-rounded (3 × 1000 ÷ 5000) = **1 poisha**. On the final return it computes 3 − half-up-rounded (3 × 4000 ÷ 5000) = **1 poisha**. Hence the successive posted values can be **[1,1,1,1,1]**, totaling **5 poisha**, although the original line was **3 poisha**.

This is an exact integer reproduction of the visible source algorithm. It is **not proof that real customer data contains affected transactions**. The same structural error is present in purchase-return billedShare. A 2-poisha/5-piece line can produce a **zero-value** one-piece return that the current RETURN_HAS_NO_VALUE guard rejects. Do not cure that by manufacturing an extra poisha.

## 3. Immutable accounting invariants and candidate corrected arithmetic

For each **original source line ID**, define:

- Q = original base-quantity integer at scale3; A = original posted net or billed value in integer poisha.
- C = original **source-comparable** cost pool in poisha (sale booked source COGS or supplier's original posted landed cost). Do not infer C from current master selling/buying price.
- r = actual sum of previously POSTED, non-deleted return-line quantities; B = actual sum of their posted valueMinor; K = sum of their booked costMinor, with source-origin comparability confirmed.
- q = proposed positive return base quantity, checked against remaining original qty and actual lot/source availability.

**Hard caps:** 0 <= r <= Q; 0 < q <= Q − r; 0 <= B <= A; 0 <= K <= C (only with the correct source-origin pool); 0 <= newValue <= A − B; 0 <= newCost <= C − K. On full return the correctly booked totals must reconcile to A and C. If existing history violates these caps, **stop and require a separate, audited correction process**; do not secretly reprice an old return, delete a journal, or force a negative value.

**Candidate deterministic allocation, requiring CA approval:**

- On a **non-final** return, target cumulative value T = roundHalfUp(A × (r + q) / Q), calculated with BigInt and existing positive tie direction. New value = T − B, where B is **the actual previously POSTED money**, not a rounded estimate based on r.
- On the **final** return (r + q = Q), new value = A − B, provided the same source and stock/cost invariants hold.
- Apply a separately verified analogous cumulative rule for a **comparable actual source-cost pool**. Purchase landed valuation, supplier billed amount, sale original COGS, vendor-owned source allocations and refund/received cash are different accounting concepts; never collapse them.
- If T − B is negative, report source history inconsistency and **fail closed**. If it is exactly zero for a positive-stock quantity, **do not post** under today's existing prohibition; owner must approve the complete stock-only/zero-money journal/return mode before such a request can succeed.
- Reject duplicate original source-line IDs within a single request or normalize them **before** checking totals: testing each duplicate independently against the same source remaining qty can otherwise bypass the cap.

**Illustrative prefix targets:** For A=3 poisha and Q=5 Pcs, cumulative [1,1,2,2,3] => incremental **[1,0,1,0,1]**; total 3. For A=2 and Q=5, cumulative [0,1,1,2,2] => [0,1,0,1,0]; total 2. For A=10000 and Q=3, cumulative [3333,6667,10000] => [3333,3334,3333]; total 10000. These are proposed money allocations, **not permission to post zero-value stock movements**. If partial returns are blocked on zero amounts, do not claim full 5-Pcs return parity.

A simpler clamp of rounded per-return value to remaining source value might prevent an over-credit but changes partition fairness and leaves zero-value residual stocks. It is an alternative for owner/CA review, **not** an implicit authorized fix.

## 4. Proposed atomic implementation contract — no migration authorized

1. **Read path**: In each Postgres return repository, aggregate SUM(qty), SUM(value_minor), SUM(cost_minor) over *only POSTED, non-deleted* return parents for each source sale_line_id or purchase_line_id. Enforce return child tenant, parent tenant, source line tenant and source-document matching, not just globally unique ULIDs. Keep RLS and explicit tenant predicates. COALESCE absent history to zero and validate safe integer conversion. Do not sum parent document totals per joined child or multiply joins.
2. **Lock path**: Keep sales SELECT FOR UPDATE on sale parent before reading aggregate/history. Introduce an equivalent **purchase parent lock** and align parent→line→lot/cost-state order with purchase posting, purchase return void and cancellation to avoid stale reads/deadlocks. Every writer that can alter cumulative returned values must obey the same serialized source lock, or a transaction-level race remains.
3. **Type path**: Add actualPreviouslyReturnedValueMinor and actualPreviouslyReturnedCostMinor (names illustrative) in existing returnable repository ports/domain types. Do not change exported public DTOs until preview/bilingual UX requirements and authorization are reviewed. The browser's old quantity-only domain preview cannot independently prove final money; server POST remains authoritative and must provide conflict/reload when changed by another device.
4. **Domain path**: Replace the quantity-only prior money estimate with a monotone cumulative entitlement minus **actually booked** return values, validate caps and duplicate IDs, handle zero-valued proposed line under explicitly chosen policy. Preserve existing original price source, stock movements, vendor allocation and actual lot cost.
5. **Write path**: Compute and validate while holding the parent lock, before journal, inventory lot and payment mutation; retain UOW rollback, permissions, idempotency fingerprint/replay, audit/outbox, and cash-session ON/OFF settings. Existing sales and purchase return lines already persist true new valueMinor/costMinor and source line ID. No fake balancing adjustment, no extra hidden money, no UI deletion.
6. **Old data**: The fix does not retroactively repair history; over-booked B>A or K>C cases must be flagged and blocked from further return posting. Any tenant-data query or reconciliation requires distinct authorization and privacy-safe evidence. Never rewrite posted source docs during create.

**Proposed later backend file ownership** (not this planning PR's write scope): packages/core-domain/src/sales/sales-return.ts; packages/core-domain/src/purchasing/purchase-return.ts; packages/core-application/src/returns/create-sales-return-service.ts; packages/core-application/src/returns/create-purchase-return-service.ts; packages/core-application/src/returns/sales-return-repository.ts; packages/core-application/src/returns/purchase-return-repository.ts; packages/adapter-postgres/src/sales-return-repository.ts; packages/adapter-postgres/src/purchase-return-repository.ts; corresponding approved pure/API tests. Keep contract barrels, schema/migrations, permission/cash helpers and other modules coordinator-owned. No test runner or DB assigned until implementation approval.

## 5. Regression test matrix (NOT run in this doc PR)

| Test | Must demonstrate |
|---|---|
| **RED 3-poisha / 5 Pcs** | Current algorithm can distribute 5 poisha across five one-piece return docs, exceeding 3; the code fix then refuses any excess and conserves booked value. |
| **2-poisha / 5 Pcs** | Explicitly document the zero-money positive-quantity policy; no false 1-poisha refund or unauthorized stock movement. |
| **10000-poisha / 3 Pcs** | Exact original value after fully returned split partitions; no stranded or duplicated minor units. |
| **Discounted line** | Use original line net after sale/bill discounts, not list price/current Product price. |
| **Both cost channels** | COGS / inventory / FIFO lot value and vendor-owned source allocation reconcile independently from customer refund or supplier credit; no current average-cost repricing. |
| **Already over-posted history** | Existing B>A or K>C fails closed; no automatic data alteration or new excess settlement. |
| **Void/re-post/replay** | VOIDED prior return excluded; POSTED totals authoritative; repeat same operationId idempotent, changed fingerprint refused, new operationId respects latest committed parent. |
| **Duplicate source line** | Multiple entries for same source line do not bypass quantity or monetary limits. |
| **Two writers simultaneously** | Same sale and same purchase return source, each with separate operationId: parent locking and source re-read prevent over-credit and negative lot stock. |
| **Tenant and roles** | Cross-tenant source/return/lot references fail; cost permission and original financial access unchanged. |
| **Cash sessions and offline** | Cash refund needs eligible session only when feature ON; OFF permits authorized normal cash; Bank/MFS and credit-only remain as approved; one offline POS authorized per tenant, stale read preview triggers deterministic review. |

**Future test environment:** exact approved GitHub branch head; Node20 authoritative CI; dedicated isolated disposable PostgreSQL16 database/container per worker, verified DB target before test schema/fixtures, no production or real tenant backup, API returns spec and pure domain tests. First verify RED on original head, then GREEN on candidate, TypeScript build/typecheck/lint, source stock/ledger invariants, permissions/tenant isolation, concurrency and rollback. Record actual command exits and screenshots only if UI touched. No claim of tests run here.

## 6. Owner/CA decisions and stage gates

| Gate | Candidate direction | Status |
|---|---|---|
| **P0 containment** | Enforce cumulative posted-source money cap; fail closed on prior over-credit/negative residual; reuse existing value_minor/cost_minor history; purchase source lock | **IMPLEMENTED IN BACKEND PR #43; NOT DEPLOYED** |
| **Zero-money, positive-qty return** | Option A: explicitly supported quantity-only source return with balanced inventory/COGS, audit and proper UI; Option B: fail closed and request quantity grouping until value is positive (can make tiny whole-line returns impractical) | **RESOLVED: OPTION A OWNER-APPROVED AND IMPLEMENTED IN PR #43** |
| **Source cost pool** | Confirm original sales COGS/vendor source-lot, purchase landed-lot vs supplier billed net; account for actual previously returned cost | **INDEPENDENT BACKEND/CA REVIEW REQUIRED** |
| **Historic already-posted anomalies** | Detect only under separate authorized privacy-safe census; append-only audited correction workflow if proven | **NO DB ACCESS OR REPAIR AUTHORIZED** |
| **D16 independent component return policy** | Immutable selected unit, original segment cost/net/discount, exact quantity/price and return provenance | **STILL OPEN** |
| **Actual backend P0 code/tests** | Separate approved issue/branch, exclusive path ownership, isolated PG16, final PR and QA before human merge | **IMPLEMENTED, TESTED AND MERGED IN BACKEND PR #43; NOT DEPLOYED** |

**Historical proposed rollout (superseded):** The owner subsequently approved Option A; backend PR #43 implemented source-booked value containment and correctly journaled zero-poisha stock returns together. Existing histories already over-posted still fail closed and require a separately authorized audit/correction. Neither stage is a substitute for D16 multi-unit price/return decisions or a tenant migration.

**Rollback:** keep all historical return rows, source journals, audit/outbox and stock movements. An approved code rollback must not silently drop source booked-money constraints once new returns are posted. No destructive migration, cash/finance source revaluation or automatic repair.

**Conclusion:** The backend provides enough posted return-line money fields to plan this P0 remediation without claiming new DB storage, but safe release depends on parent transaction locking, actual source-cost identity, zero-value behavior and independent accounting/security acceptance. **This is documentation only.**
