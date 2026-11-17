# FINANCE WT-2 — Whole-taka source attribution, journal, and return decision packet

> **DRAFT FINANCIAL DESIGN; NO NEW ACCOUNTING DECISION OR EXECUTABLE POSTING PERMISSION.** This document is a choice-and-acceptance packet for independent owner + accounting + Nest/PostgreSQL security review. It changes no sale, purchase, return, POS, money, database, migration, API, cash-session, journal, audit, or offline-writer behavior.

## 1. Evidence, scope and approved authority

**Reviewed source pins (2026-11-13):**

- [HisabIQ UI main @ dabb396](https://github.com/shuvodelux-commits/hisabiq_ui/tree/dabb396f78a8d85edb01a2dc9e82091f1e8bbc14) — existing React POS V2 and advanced multilevel independent unit pricing retained; merged [R1-C whole-taka × advanced-units bridge](MOD-002-R1C-WHOLE-TAKA-ADVANCED-UNITS-RECONCILIATION-BRIDGE.md).
- [NestSherERP backend adoption @ 4c274d](https://github.com/shuvodelux-commits/nestshererp/tree/4c274d04dc9fb5d26f19621968062f0deed44387) — current posting and return source; [backend whole-taka helper PR #54](https://github.com/shuvodelux-commits/nestshererp/pull/54) **merged** as \`759022572231a25a7b7d96ca3f3a7c7aa228fa85\`.
- [Owner-approved financial boundary #55](https://github.com/shuvodelux-commits/nestshererp/issues/55) — **nearest whole ৳1 ONCE** on the final **NEW** sale/supplier invoice obligation **after** line/bill discounts, preserving exact internal integer poisha and frozen historic documents. Do not infer per-line taka rounding, posting implementation or permission to rewrite historical source.
- [Pure whole-taka preflight PR #63](https://github.com/shuvodelux-commits/nestshererp/pull/63) — at this document's drafting, **DRAFT, unmerged**, with a pure \`sourceNetMinor / roundedObligationMinor / signed roundingDeltaMinor\` diagnostic and nine local arithmetic tests; parent helper #54 has merged. Even if #63 merges, it does **not** update live postings.
- [Frontend new-document preview PR #437](https://github.com/shuvodelux-commits/hisabiq_ui/pull/437) — **DRAFT, unmerged** at audit; do **not** activate if backend journals still post fractional invoice obligations.
- [MOD-002 R1-A pending decisions](MOD-002-R1A-EXACT-PRICING-ROUNDING-DECISION-PROPOSAL.md), [R1-B immutable priced-unit revision concept](MOD-002-R1B-VERSIONED-UNIT-PROFILE-CONTRACT-PROPOSAL.md), [R0-A legacy conversion census](MOD-002-R0A-LEGACY-CONVERSION-CENSUS-PLAYBOOK.md), and return source [backend issue #36](https://github.com/shuvodelux-commits/nestshererp/issues/36).

**Observed current domain behavior** (not an approval of future behavior):

| Existing backend domain source | Actual calculation | Gap for owner #55 |
| --- | --- | --- |
| [Sale totals and journal](https://github.com/shuvodelux-commits/nestshererp/blob/4c274d04dc9fb5d26f19621968062f0deed44387/packages/core-domain/src/sales/sale.ts) | \`saleTotals\` allocates bill discount by largest remainder in poisha; \`salePosting\` debits real cash/bank and AR for gross settlement and credits SALES by **the same currently unrounded** grand total, separately posting COGS/INVENTORY/vendor liabilities | Must freeze new header obligation, source attribution and financial delta **without** changing cost, stock or advance semantics |
| [Purchase costs and journal](https://github.com/shuvodelux-commits/nestshererp/blob/4c274d04dc9fb5d26f19621968062f0deed44387/packages/core-domain/src/purchasing/purchase.ts) | Spread discounts and extra costs, compute scale-4 actual unit cost and lot stock value. Its existing signed \`roundingMinor = grandTotalMinor - inventoryValueMinor\` balances INVENTORY vs supplier bill | **Existing ROUNDING is an inventory valuation residual**, which is different from newly required final invoice-settlement delta. Preserve and identify both; don't round stock/unit cost |
| [Sales return source logic](https://github.com/shuvodelux-commits/nestshererp/blob/4c274d04dc9fb5d26f19621968062f0deed44387/packages/core-domain/src/sales/sales-return.ts) and [purchase return](https://github.com/shuvodelux-commits/nestshererp/blob/4c274d04dc9fb5d26f19621968062f0deed44387/packages/core-domain/src/purchasing/purchase-return.ts) | Source lines carry \`valueReturnedMinor\` and \`costReturnedMinor\` **already posted**; cumulative entitlement subtracts actual booked money. Positive stock qty with zero incremental monetary value can be valid | Return **which** frozen line/segment monetary source: posted payable attribution, economic source value, plus attributable rounding reversal and lot-cost origin |
| [Closed internal chart of accounts](https://github.com/shuvodelux-commits/nestshererp/blob/4c274d04dc9fb5d26f19621968062f0deed44387/packages/core-domain/src/accounting/account.ts) | Fixed account \`ROUNDING\` already exists; a new account must be explicit spec change, not incidental implementation | Owner/CA must choose debit/credit interpretation and reason/source metadata; no phantom extra SALES or INVENTORY adjustment |

## 2. Distinct monetary identities: proposed terminology, NOT deployed fields

A future transaction may need **three independent layers** that cannot overwrite one another:

1. **Source economic amounts, exact poisha** — \`sourceLineEconomicNetMinor\` after price, line discount and allocated bill discount; cumulative original source quantity and lot cost retained. \`sourceNetMinor = sum(sourceLineEconomicNetMinor)\`.
2. **New whole-taka customer/supplier obligation** — \`postedObligationMinor = roundWholeTakaMinor(sourceNetMinor)\` **once**, only for eligible *new* documents and only after all discounts; \`invoiceSettlementRoundingDeltaMinor = postedObligationMinor - sourceNetMinor\`.
3. **Source-linked payable/return attribution** — candidate \`sourceLineSettlementRoundingShareMinor\` such that \`sum(shares) = invoiceSettlementRoundingDeltaMinor\` and \`sourceLineAttributedObligationMinor = sourceLineEconomicNetMinor + sourceLineSettlementRoundingShareMinor\`, with \`sum(attributed) = postedObligationMinor\`. The correct segment-level allocation is **not approved**.

**Versioning requirement, pending schema approval:** freeze \`roundingPolicyVersion\` and immutable original line/selected-unit pricing source on each new posted document; keep untouched legacy documents' frozen poisha amounts and old No-round/৳5 behaviors. An old offline writer lacking the new policy/segment identity must fail closed for new postings rather than emitting ambiguous fractional obligations.

**Conservation requirements** for an accepted future implementation:

- Source arithmetic and unit/lot cost remain exact; no binary floating-point or reinterpretation of four-decimal Product unit rates.
- New \`postedObligationMinor % 100 === 0\`; \`sum(sourceLineAttributedObligationMinor) === postedObligationMinor\`; \`sum(segmentAttributedMinor) === sourceLineAttributedObligationMinor\` if independently priced Box/Pcs segments exist.
- \`sum(sourceLineEconomicNetMinor) + sum(sourceLineSettlementRoundingShareMinor) === postedObligationMinor\`; report both shares and original sources, not a single irrecoverable total.
- Journal debit and credit totals equal exactly; financial settlement, customer/supplier due, split paid, change/advance and source returns use the **same frozen obligation**.
- Inventory/lot and cost of goods sold remain independent of the **settlement** rounding delta; pre-existing **purchase valuation rounding** remains separately reconstructible.
- Any return/reversal is source-capped by original actual posted monetary share and historically booked credits, with serial/expiry/owned/vendor stock and associated lot costs handled by stock source. A **positive-qty, ৳0 monetary** return remains valid under owner #55 Option A.
- A positive economic new invoice that rounds to ৳0 is an **OPEN new-sale policy**, not permission to auto-post free goods (the zero-return approval does not decide this).
- Every tenant, role, cost-visibility, source idempotency, cash-session ON/OFF and old-token/offline acceptance rule must be enforced on the server.

## 3. Owner/CA decision: how should the signed final delta post?

All examples here are **design vectors**, not tests of current sale/purchase posting. Debit/credit for \`ROUNDING\` is proposed, not yet signed.

| Alternative | Sales journal for a rounded header | Advantages | Risks / decision |
| --- | --- | --- | --- |
| **A — Transparent separate settlement ROUNDING bridge (review candidate)** | Credit SALES by the **economic** source net; use signed ROUNDING counterline to reconcile cash/AR's **rounded** payable. Freeze settlement-attributed source shares separately for returns. | Reports original selling value and separately auditable rounding effects; supports lossless original-price return and independent cost basis | Requires reason-tagged ROUNDING and reversal rules, two monetary source interpretations, stable line/segment allocation and reports avoiding double count. **NOT APPROVED.** |
| **B — Allocate delta entirely into sales revenue/line share** | Credit SALES by rounded header; no settlement ROUNDING journal, although original economic value and header delta can be kept in auditable metadata | Simple sales journal and source line net sums | Obscures separately approved rounding difference in revenue and may violate owner #55's requirement for **explicit accounting difference**. Requires CA+owner exception; **NOT APPROVED**. |
| **REJECT — Charge whole taka per priced component** | Round Box/Pcs prices independently before discount | None: breaks owner policy | Produces wrong header, return cap and discount results |
| **REJECT — Book full delta into INVENTORY/COGS** | Alter inventory cost or vendor COGS to force payable | None: changes stock economics | Violates INV/value integrity and true margin |
| **REJECT — Round displayed total only** | Frontend says whole taka; backend posts fractional poisha | None: splits authorities | Customer ledger, receipts, due, journal and reconciliation diverge |

**Worked sale vector (Option A, illustration only).** One Box at ৳232.25 and 5 Pcs at ৳12.50 = **৳294.75** gross. After **৳10.40** authorized discount, economic net is **৳284.35 (28,435 poisha)**. Final obligation **৳284 (28,400 poisha)**; signed delta is **−35 poisha**. For **৳200 cash paid** and **৳84 due**, a *candidate* journal is **DR CASH 20,000; DR AR 8,400; DR ROUNDING 35; CR SALES 28,435**, balancing **28,435** on both sides. The COGS and owned/vendor inventory postings are independent. **This is NOT the currently implemented journal.** If a new return later reverses that source, the original economic and settlement delta shares must be undone together rather than repricing from current Product rates.

**Worked purchase vector (Option A, illustration only).** Suppose purchase original economic source is **28,435 poisha** and preserved actual lot INVENTORY valuation **28,429 poisha**. Existing purchase valuation residual **+6 poisha** is needed to reconcile *raw* supplier bill to lot valuation. New invoice-level settlement delta **−35 poisha** is **another** reason. With **20,000 poisha paid** and **8,400 poisha AP**, candidate postings are **DR INVENTORY 28,429; DR ROUNDING [VALUATION] 6; CR ROUNDING [SETTLEMENT] 35; CR CASH 20,000; CR AP 8,400**. The two ROUNDING postings net to −29 but **must remain separately source-explainable** and never rewrite the lot unit cost. This is a journal *alternative requiring independent review*, not current behavior.

**Unapproved source allocation rule** under Option A: distributing the −35 poisha header delta across original priced lines/segments could use weighted largest remainder with a stable immutable source ID tie-break, ensuring no negative net line and total delta conservation. Another policy may be preferable for mixed/zero-value segments. **Do not implement either silently.** Owner/CA must choose the allocation granularity (sale line, priced component or both), sign treatment, minimal-line charge/zero case, tie-break and source snapshot.

## 4. Returns, tender and historical identity — distinct source capabilities

- **Partial and repeated return:** source return entitlement must use **posted attributed obligation**, not the **current** Product selling price, and must subtract **actual previously booked source credit** inside the same tenant-locked source unit of work. Keep the economic/settlement rounding split for future reversals if Option A is chosen. At full valid return, aggregate customer monetary credit must exactly equal the original frozen attributable share; do not credit ৳1 five times against a five-piece source originally worth only ৳3.
- **Zero-৳ positive-qty return:** correctly reverses authorized stock/lot/COGS where applicable even if monetary credit and cash refund are zero. Do not block by old \`RETURN_HAS_NO_VALUE\` or invent a positive settlement to make the receipt look normal.
- **Payments and split tender:** server must verify each *new* settlement source and sum of CASH/BANK/MFS/advance against the frozen rounded obligation; reflect overpayment in change or advance rather than silently revising sale price. Preserve cash session ON/OFF: tracked drawer cash requires an active eligible session when ON; historical opening balances never do.
- **Legacy source:** an old invoice posted at **৳100.35** stays ৳100.35 (with historical receipt/return rules); no global new round-to-৳1 conversion, rebalance, or rent of old journal. Reverse exactly its original journal version/amount and source, not a re-created new-policy sale.
- **Offline POS:** one pre-authorized offline writer per business. Persist policy/version/profile ID and original staged priced-unit components; old or mismatched writer rejects on server with an explicit Needs Review case, without guessing a new source snapshot.
- **Idempotency and tenancy:** same operation ID+source+request should replay exactly one posted obligation/journal/return, not recompute rounding on changed catalog prices. A token from tenant B cannot reference tenant A source line, profile or inventory lot. Cost blind users must never receive purchase price, lot cost or hidden adjustment detail.

## 5. Finite acceptance matrix before Phase 2 implementation is authorized

| Test family | Required demonstration in isolated authorized environment | Gate |
| --- | --- | --- |
| Rounding boundaries | ৳100.49→৳100; ৳100.50→৳101; negative reversal symmetric; invoice discount applied first | Owner whole-taka policy |
| Mixed unit source | Independent Box and Pcs price, exact frozen quantities/rates, correct source cost/lot stock | D16/R1-B still open |
| Source line/header totals | Economic source sum, signed delta, attributed source sum and rounded header all conserve | CA delta allocation choice |
| Sale journal | SALES/ROUNDING/AR/cash/advance/COGS/inventory/vendor payable signed journal sums balance | CA Option A/B choice |
| Purchase journal | Cost valuation residual and customer/supplier settlement residual independently explainable | CA two-reason ROUNDING choice |
| Split tender and session | CASH/BANK/MFS/advance, due/overpayment; active cash session ON/OFF unchanged | MOD-005/006 |
| Partial/full return | 5× split returned over 5 calls and one-call full return; actual prior credits, 0 monetary incremental with stock, no overcredit | D16 source attribution / backend #36 |
| Permission/tenant | Cost redaction, foreign-source 404, revoked roles, wrong tenant and stale epoch, negative stock/owned/vendor | Security |
| Historic/void | Immutable old poisha invoice; source journal reversal, no re-round; exact replay/idempotency | Finance |
| Offline writer | Old writer rejected, new writer frozen policy/profile, deduplicated synced operation | Offline |
| Accuracy/performance | BigInt overflow/limit, high line count, rounding properties, DB lock order and duplicate retry | QA/DBA |
| Cross-repo browser | Actual React connected checkout to Nest→disposable PG16 across POS, purchase, returns, payment | Only after Phase2 posting |

**Do not misstate prior testing:** backend #54 and preflight #63 are **pure helper tests**. Real React→Nest→PG16 MOD-007 P0D exercises **GET-only** product/standing, *not* a posted sale/purchase. There is **no completed** whole-taka live posting, cross-repo settlement test or independently priced profile cutover shown here.

## 6. Ordered implementation/rollout plan requiring further approvals

1. **Decision A (CA + owner):** approve whether settlement \`ROUNDING\` belongs to an auditable separate journal posting, and the source line/segment allocation formula with tie-breaks, negative/zero cases and explicit reason IDs. Commit choice to issue #55 / D16 register. **This document does not choose it.**
2. **Decision B (CA + owner):** approve VAT/tax applicability (if any), partial-return fraction rules, whole-taka refund/payment limits, zero-valued new sales, and historical mixed-policy reversal semantics.
3. **Design/freeze next schema and DTO:** versioned monetary source, source line/unit profile IDs, original pricing, discount shares, settlement shares, exact lot/cost source and signed journal reason; verify backward-compatible read/write API and one-authorized-offline-device policy.
4. **Implementation sequencing:** sale source/journal + receipt/due → purchase valuation/settlement + AP → source-linked return/void and tender → legacy compatibility → optional advanced-unit read/write and complete POS V2 UI activation. No co-editing shared posting files among parallel workers.
5. **Independent negative QA:** exact pinned GitHub SHAs, isolated unprivileged PostgreSQL16 with tenant RLS, source/lot locks, journal property invariants and attack/denial paths; comprehensive Playwright only after backend is verified. Require full CI and accountant/security signoff.
6. **Rollout/rollback:** separate owner merge/deploy consent, new-writer version gate, no historical rewrite, feature flag and monitoring. If postings already happened, rollback by disabling future writes, **never** dropping source revision/allocations or rewriting existing posted ledger lines.

**Handoff:** [owner finance policy #55](https://github.com/shuvodelux-commits/nestshererp/issues/55), [FINANCE WT-2 issue #475](https://github.com/shuvodelux-commits/hisabiq_ui/issues/475), [MOD-002 R1-C](MOD-002-R1C-WHOLE-TAKA-ADVANCED-UNITS-RECONCILIATION-BRIDGE.md). This one-file packet is source analysis **only**: no runtime, tests, database, code, migration or production operation were performed for this document.
