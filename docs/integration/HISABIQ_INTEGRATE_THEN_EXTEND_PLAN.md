# HisabIQ — integrate existing backend first, then extend it to full UI parity

**Revision 2, 2026-11-11.** Owner-requested planning amendment. [Master blueprint](HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [cash policy](tasks/CASH_SESSION_POLICY.md) · [original code evidence](evidence/GITHUB_STATE.md).

**Goal:** first connect existing HisabIQ React workflows to working NestSherERP capabilities, then implement the missing backend capabilities required by HisabIQ_UI. Keep one Nest application/domain/posting engine and the current HisabIQ design. A missing backend feature becomes an extension task, never a reason to delete its UI.

**Status:** revised product direction confirmed; code/tasks still require the existing module approval process. This amendment does not authorize ERP implementation or turn all draft packets into complete execution specifications. No code, database, issue, PR or board changes were made to implement it.

## 1. Confirmed decisions from this conversation

1. Historical opening balances do not need an active cash session. This explicitly includes party, lender and borrower openings. They establish historical receivable/payable/principal and do not represent a new cash payment.
2. Actual tracked-cash receipts/payments require an eligible open session while the cash-session setting is ON. The owning transaction decides whether cash actually moves; merely posting a journal does not decide that.
3. Tenant settings can turn the cash-session feature OFF. Ordinary cash operations then remain available and journaled without a session. Bank/MFS-only transactions and non-cash actions do not require a drawer session.
4. Integrate currently compatible backend functionality first. Then develop the capabilities that HisabIQ_UI already has and NestSherERP lacks, within that backend.
5. Preserve the existing UI and all functionality throughout development. No parallel Vue product, unrelated backend or final-state reduction to whatever the old API happens to support.
6. HisabIQ is freedom-oriented: users may combine supported business relationships, quantities, units, prices, payments, dates and corrections in practical ways. Restrictive legacy business assumptions must be reviewed against HisabIQ requirements rather than copied automatically.

Only policy intent has been confirmed here. Exact missing business outcomes such as recognizing an online sale at dispatch vs delivery are not invented by this amendment.

## 2. What freedom means in implementation

| Area | Required practical freedom | Accounting/source behavior that remains exact |
|---|---|---|
| People | Same identity can be customer, supplier, vendor, lender, borrower, payee or owner where relevant | Independent relationship balances and source records; no forced duplicate person or accidental role netting |
| Opening balances | Enter existing debt/advance/principal without operating today's cash drawer | Explicit opening source and Opening Equity counterpart; no fictitious receipt/payment |
| Units | Buy in one unit, sell in another, enter mixed units and retain independent prices per unit | Exact base quantity, entered-unit/price snapshots, stable master IDs and historical conversion |
| Prices | Negotiate sale prices/discounts, use independent bundle price, lot selling price or product override | Server recomputes reviewed amount; cost, revenue and discount remain traceable |
| Payments | Cash, Bank, MFS, multiple accounts, unpaid/partial/full payment and later settlement | Each real account leg posts once; sum/allocation equals actual payment; cash gate only where applicable |
| Credit/advances | Credit sale, customer advance, supplier advance and later allocation | No advance falsely classified as revenue or an ordinary cash method |
| Finance | Historical loan openings, new lending/borrowing and principal settlements | Lender liability and borrower receivable distinct; current money movement separated from opening |
| Stock | Own, vendor and explicitly permitted negative stock; serial/expiry where configured | Source provenance, exact allocation/cost and tenant policy; no invented inventory |
| Corrections | Fix wrong amount/date/party/account; returns, refunds and source-linked reversal | Preserve posted history, original close figures and audit; corrected result is inspectable |
| Workflow | Drafts, duplicate/template reuse, nested quick-add, contextual actions and configurable cash session | No accidental posting from a draft or partial HTTP chain |
| Offline | One authorized offline POS writer plus other online devices | Pending/Synced normally; exceptional Needs Review, no duplicate posting |

Use settings/permissions/explicit confirmation for supported business choices instead of hardcoded page restrictions. Do not add a setting for every implementation detail. Existing enum/validation constraints that protect exact arithmetic or identity are retained; existing **business** restrictions that contradict approved HisabIQ behavior become documented adaptation tasks. For example, a backend single-payment DTO does not justify deleting payment rows, and a three-role party enum does not justify excluding borrowers.

“Everything possible” is implemented through combinations of supported source operations and configurable business policies. It is not implemented through arbitrary unbalanced journal input, silent data changes, or a generic bypass button. The UI keeps familiar business actions, not database/account-code implementation details.

## 3. Stage A — integrate existing compatible capabilities

Work one approved vertical slice at a time. For each module show the owner: what the UI currently does, what the backend actually does, which exact interactions can connect now, and which interactions need Stage B. Use real source SHAs, existing endpoints and actual service/repository behavior.

| Order | Integration slice | Reuse now where behavior matches | Explicit hold for Stage B |
|---|---|---|---|
| A01 | Shared transport, password/PIN identity, permissions/features and tenant workspace | Existing auth/login/me/refresh/logout, strict response/error adapters, same-origin API | Full Google phone-verification, missing session/tenant UX; proposed bootstrap additions are separately scoped prerequisites |
| A02 | Read existing settings, catalogs, product/party/account lists and real source identities | Existing settings/catalog/products/parties/money accounts reads, cost omission and cursor filters | Unmapped settings, extra roles, Bengali/unit metadata and advanced pricing |
| A03 | Compatible masters and historical openings | Existing category/brand/unit/product CRUD subcases; customer/supplier supported openings/corrections | All-role directory parity, finance relationship openings and full rich product create/edit |
| A04 | Operational document read paths and compatible transactions | Sales/purchase detail, exact compatible posting subcases, existing customer/supplier settlements, source returns/corrections | Multi-unit/rounding/split/credit/batch/serial behaviors not actually representable by current DTOs |
| A05 | Cash-session existing lifecycle and connected settings surface | Start/status/count-close/reopen/history where current backend matches, after coordinating existing PRs | Shared optional-session policy and any incorrect gate from the classification matrix |
| A06 | Inventory, vendor, warranty, reconciliation and operational Daybook/search/Dashboard reads | Existing owning services and source links, verified equivalent actions | State/metadata/correction gaps; trend/insight data excluded with Reports |

A0x is a sequencing group, not a giant PR. Each real issue is a small testable operation with exact paths. Dependencies can reorder read-only substeps: account identity can be integrated before party payment; source detail can be wired before its mutation. No broad redesign or duplicate business service is part of Stage A.

Minimal additive compatibility changes needed for safe identity/transport are named separately (for example EXT-01 tenant bootstrap). They do not become permission to develop the six missing business modules during initial integration. If a prerequisite cannot be satisfied from an existing endpoint, record that dependency and complete its scoped amendment rather than inventing client authority.

### Stage A acceptance and feature preservation

- Real reads and supported actions use real ULIDs and server results; fixture IDs/balances never mix into live accounting.
- Preview remains an explicit separate workspace/mode. API error never causes a live transaction to fall back to local preview success.
- Every current control, page, tab and dialog remains. An action whose backend is absent retains its draft and has a clear integration status in development. That is temporary, not acceptance of permanently disabling the feature.
- A module can be **INTEGRATED COMPATIBLE SLICES** without being **FULL UI PARITY**. Do not release it as complete if its normal UI still offers unsupported financial actions.
- Do not submit split purchase as only the first payment, installment as a plain invoice, bundle as an ordinary stock item, unpaid expense as only its paid amount, or COD delivery as a display-only courier note.
- Confirmed server result precedes draft consumption, print completion or success notification. Failed/uncertain outcomes preserve operation identity and the entire form.
- Dedicated Reports and Analytics remain excluded. Existing report UI/navigation stays intact; operational Dashboard remains included.

## 4. Stage B — extend the same backend for missing HisabIQ functionality

Stage B begins after Stage A's shared foundation and compatible integration contracts are established. It is not necessary to leave a dependent module half-wired while unrelated modules finish: after the integration baseline is accepted, extend modules in the dependency order below, and bring each extended workflow to full UI parity before its final acceptance.

Recommended extension order: cash policy and historical finance relationship foundations → exact multilevel units/prices → split purchase/receiving → unpaid expenses/settlements → bundles → installments → online orders/COD. Source correction/returns, attachments, language snapshots and settings parity are included alongside the feature that owns them, not forgotten as later polish. Approval and worker capacity remain one active builder.

### B01 — transaction-aware optional cash sessions and historical finance openings

Read [CASH_SESSION_POLICY.md](tasks/CASH_SESSION_POLICY.md). No new cash check in ManagePartiesService opening methods. Reuse its source/equity/audit patterns for new lender/borrower historical opening services. Adapt existing actual-payment callers to a shared policy that respects ON/OFF and real drawer participation. Coordinate pending PR16 and PR282 rather than rebuilding their same files independently.

**Finance model proposal:** one party identity with independent finance relationship records. Lender principal maps to liability; borrower principal maps to receivable. Existing `LOAN:<accountId>` is liability-only and cannot be reused as borrower asset by reversing a label. Add an explicit borrower-receivable account family or an equally explicit approved account mapping; record the chart-of-accounts amendment before coding. Both historical opening sources use Opening Equity. New loan receipt/issue and later repayments/collections are separate current-money source operations. Extra relationship directions/advances are represented explicitly, not silently coerced.

**Proposed file responsibility:** existing `parties/manage-parties-service.ts` only for existing openings; new `core-application/src/finance/finance-relationship-service.ts`, `finance-relationship-repository.ts`, domain finance opening/settlement functions and contracts `finance-relationships.ts`; PostgreSQL relation/opening repository and reserved migration; existing Finance/Party UI adapters. These paths are proposals, not existing files. Reuse Money/UnitOfWork/permissions/numbering/audit/outbox; no parallel accounting engine.

**Acceptance:** with no cash session, lender opening900000 poisha and borrower opening700000 both succeed with no cash change. A subsequent cash repayment10000 requires a session while ON, succeeds sessionless while OFF, and reduces only the correct liability/receivable source balance. Changing opening500000→450000 preserves the old journal and creates an auditable correction. A person with both lender and customer balances is still one identity with separate views.

### B02 — multilevel units and independent pricing

**Frontend behavior to preserve:** `Product.unitRelations`, unitSellPrices/unitPurchasePrices, mixed quantity input in one cart row, short unit symbols/Bangla names, selected purchase/sale unit and print snapshots. Existing source `src/utils/unitChain.ts::resolveUnitChain`, `productUnits`, `productUnitFactor`, `quantityToStockUnit` and actual cart helpers are the behavior evidence; the backend must recompute with exact arithmetic.

**Chosen direction:** stable ordered unit IDs and exact rational relationships to the base unit; independent per-unit selling/purchase prices; immutable entered-unit/price and conversion snapshots per posted line. One canonical stock quantity remains in the smallest unit. No duplicate stock per unit. Rational arithmetic avoids a base price rounded to whole poisha destroying a valid independently priced box/carton.

A line transmits its entered quantity components and pricing basis, not an authoritative line total. Server validates unit membership/recipe version, converts exact base quantity and computes monetary line gross from the entered-unit price with one defined domain rounding boundary. Persist the pricing basis and server gross so returns/corrections do not infer them from today's product master. If quantity cannot be represented at the existing scale3, return a specific validation error until a separately reviewed precision extension exists; never truncate stock.

**Task breakdown:** B02.1 unit names/symbols/Bangla metadata and stable IDs (EXT-02); B02.2 versioned product unit chain/prices and legacy single-conversion projection; B02.3 exact sale/purchase line pricing and snapshots; B02.4 return/quotation/bundle/draft adapters and historical print snapshots. Each has its own contract tests and small PR. Existing single-unit clients retain their old request path until explicitly migrated.

**Files:** core-contracts catalog/products/sales/purchasing/returns; domain catalog/unit-conversion and transaction total functions; application product/sale/purchase/return services; repository interfaces/PostgreSQL schema/reserved migrations; frontend unit adapters and existing cart handlers. Do not alter compact row markup to compensate for backend limits.

**Acceptance:** 1Carton=12Box, 1Box=20Pcs; input1Carton2Box3Pcs yields283Pcs and exact stock decrement. A box of3Pcs priced100 poisha stays100 per box, not99 after base-price rounding. Changing today's conversion/price/unit wording cannot change an old invoice or its return. Display 3–4 levels in the existing one-line editor at tablet widths as current UI supports.

### B03 — split purchase payments and complete receiving

**Current gap:** CreatePurchaseRequest paidMinor/paidAccountCode accepts one initial account; HisabIQ confirm includes several payments, serials, batch/manufacture date, lot selling price, discount/rounding, photos and a draft. Use EXT-03 as starting point, then complete its missing repository/provider manifest.

**Chosen behavior:** one confirmed purchase is one atomic application transaction. Payments are an array of real account identities and exact positive amounts; unpaid/partial/full are all valid per UI. Resolve and aggregate repeated-account outflows before validation. Inventory lots/serials, supplier payable, payments, source allocations, journal, audit/outbox and idempotency response commit together. A failed bank/serial leg rolls back everything. Never emulate this with purchase POST followed by several payment/serial HTTP requests.

Lot selling price is optional; absent uses the product default. Explicit product override uses its default for all lots. Purchasing receipt/serial/provenance snapshots remain on the original source. Correcting a purchase uses source version and reversal/repost; not in-place loss of the prior bill. Any previous payment/returned/sold quantity impacts are resolved through existing correction rules, made explicit in the contract.

**Tasks:** B03.1 additive payments contract + legacy compatibility; B03.2 createWithin multi-account posting and rollback; B03.3 receiving metadata/serial composition/lot pricing; B03.4 attachment ownership and upload/confirm lifecycle; B03.5 source correction/return/draft completion. Reserved migrations and exact new method signatures are written in the approved task packet before a builder starts.

**Acceptance:** bill9000 poisha, cash2000+bank1000 → due6000, correct inventory value, both account legs once. Without eligible session when ON, cash leg prevents the whole bill from posting. OFF allows both with sessionless cash. Bank-leg failure creates no bill/lot/serial/payment. Retrying lost response returns same bill identity. Draft is consumed only after confirmed result.

### B04 — unpaid/partial expenses and later settlements

**Current UI:** expense amount/paid/payments/payee/category/receipt and source corrections already exist. `savePreviewExpense` validates paid≤amount, exact split total, account on every paid row and a correction reason. Preserve these choices.

**Accounting proposal:** recognize the full expense at entry; money accounts are credited only for actual payments, and the unpaid amount is credited to a dedicated **Expense Payable** control account, attributed to the payee/source. This is an explicit proposed chart-of-accounts addition, not an existing supported code. Do not misuse trade AP unless the owner explicitly chooses a unified model after reviewing its effects. Identity can be an existing party/employee/payee; nested quick-add creates required identity in the owning transaction without losing the draft.

Later settlement debits Expense Payable and credits selected cash/bank/MFS accounts, allocating to actual expense source(s). No second expense recognition. If amount0 paid on creation, do not resolve a payment account or require a cash session. If payments are bank-only, no drawer gate. Paid-over-expense remains the current UI validation; a genuine payee advance, where required by the UI, is a separate explicit advance source rather than a negative expense.

**Tasks:** B04.1 expense/payee/liability contract and chart amendment; B04.2 full/unpaid/partial create; B04.3 later split settlements/source allocations; B04.4 correction/void/refund and receipt attachment; B04.5 contextual entry from Counter/Party/Expense. Reuse existing ManageExpensesService as owner and expose in-transaction settlement composition; no second generic writer.

**Proposed source scope:** core-contracts expenses and approved account codes; core-domain expenses posting/settlement; core-application expenses/manage-expenses-service + expense-repository + new owning settlement use case; adapter expense repository/schema/reserved migrations; existing Expense/Counter/Party adapters. New API/schema must be complete in the B04 packet before implementation.

**Acceptance:** expense10000, unpaid: DR Expense10000 / CR Expense Payable10000, no cash/session change. Later cash3000+bank2000: due5000, payable reduces5000, expense remains10000. Correct/reverse retains prior entries and allocations; concurrent settlements cannot exceed outstanding liability. ON/OFF affects only actual cash payment legs.

### B05 — virtual bundles with immutable recipe versions

**Preserve:** one invoice/cart line for the bundle, independent bundle price, fixed stock-component recipe, immutable revisions after edits and original sale-time recipe evidence. Use existing `src/bundles` validation/pricing/cart/return/handoff helpers as behavior evidence.

**Chosen backend model:** virtual parent product plus immutable recipe versions and component rows. Selling a bundle locks the required stock/serial sources for all components and posts through the existing sale writer in the same UOW. Parent receives revenue once; component allocations receive cost/stock effects; no phantom Set inventory and no additional component revenue. Components can participate in the same permitted stock-source choices the existing UI supports; source/negative/serial policy remains authoritative.

**Tasks:** B05.1 recipe create/edit/revision repository and DTOs; B05.2 owning sale composition with immutable snapshots; B05.3 full/partial supported return allocation and original cost restoration; B05.4 quotation/online/draft stale-recipe review. Historical rows use saved recipe, price and component source allocations. Do not automatically upgrade a draft's old recipe without the existing review/confirmation behavior.

**Acceptance:** recipe1 consists of2Pcs A +1Pcs B, bundle price15000. Sale2 bundles reduces A by4Pcs and B by2Pcs, revenue30000 once. Editing recipe2 affects future sales only. Return of one old bundle uses recipe1 and original lots/discount allocation. Partial component returns follow the current supported UI's explicit settlement allocation; the exact source algorithm must be specified before that subtask is approved, not guessed by a builder.

### B06 — installment agreements, collections and lifecycle

**Preserve:** negotiated invoice amount, down payment, editable weekly/monthly schedule, manual row edits, reschedule, receipts/reversals, early settlement and return adjustment where existing UI supports them. Existing `src/installments/schedule.ts` supplies concrete rules:1–120 rows, strictly increasing valid dates, positive integer poisha, month-end anchoring, manual amounts preserved and exact remaining-total reconciliation. No need to ask the owner to redesign those confirmed UI behaviors.

**Chosen backend direction:** one posted sale/receivable plus a versioned agreement/schedule and allocations of actual customer receipts. The schedule does not post revenue repeatedly. Principal/negotiated total comes from the existing reviewed UI; do not introduce automatic interest, late fees or compounding that the UI did not request. Any explicit existing charge/discount control gets a separate verified posting rule in its task contract.

**Tasks:** B06.1 exact schedule generator/validator and server preview; B06.2 atomic sale+agreement+downpayment; B06.3 receipt allocation and outstanding read; B06.4 reschedule history and controlled reallocation; B06.5 receipt reversal/return/settlement with immutable lifecycle. Each monetary receipt uses the same cash policy and owning payment service composition; no duplicate receivable or duplicate installment receipt.

**Acceptance:** remaining10000 poisha over3 rows gives3333,3333,3334; manual row edits survive rebalancing. Jan31 monthly anchor produces Feb28 and Mar31 in a non-leap year. Agreement total100000/downpayment20000 leaves scheduled80000. Collection10000 reduces receivable/schedule outstanding once, creates no new sale/revenue. Reschedule preserves paid allocation history. Cash collection needs session ON, historical opening agreement/principal entry without actual cash does not.

### B07 — online orders, fulfillment and COD clearing

**Preserve:** current order/lead channels, stages, courier/tracking, payment modes, partial/full advance, delivery charges, COD collection/fee/payout, failed delivery/return and one-time POS handoff. Existing `src/onlineSales/onlineStore.ts` is workflow evidence. Existing invoice presentation courier fields are not an order/COD engine.

**Chosen accounting architecture:** operational order state + source-linked sale/stock event + courier clearing account/receivable + explicit payout/fee sources. Do not treat courier-held cash as shop drawer cash. Payment collected by courier affects clearing; the later remittance into shop Cash/Bank is a separate real account movement. A remittance into tracked cash requires session ON; bank-only remittance does not. Customer advances remain liabilities until allocated to the sale.

**One business decision still needs confirmation:** which order event posts the actual sale/stock effect (dispatch or delivery). The current UI's placeholder/nonposting workflow does not establish revenue recognition. Proposed operational default for review: dispatch creates the sale and source-tracked stock-out; failed/returned deliveries reverse through source returns; delivery/COD settlement does not post revenue again. This is a proposal, not an approved accounting fact. Stock reservation before dispatch and invoicing at a different stage must be explicit rather than inferred from stage labels.

**Tasks:** B07.1 order/lead/draft stage contract and versioning; B07.2 chosen sale/stock trigger and idempotent conversion; B07.3 customer advance and courier clearing/fees/remittance; B07.4 failed delivery/return/settlement correction; B07.5 actual courier/SMS integration only after provider/auth/webhook specification. A status update or repeated courier callback must not duplicate inventory, revenue or collection. No actual provider messages in planning.

**Acceptance:** if COD receivable100000 and courier fee1000, remit99000 to Bank: clearing goes to0; bank+99000, courier expense1000, no second revenue or drawer session. Cash remittance has the same economics with policy-gated cash. Returned/failed order reverses only posted source effects, not an unposted draft. Replayed payout/callback is idempotent and provider-signed when provider integration is enabled.

## 5. Remaining UI parity belongs to the extension backlog

The six named gaps are not the entire missing-feature list. Retain the existing23 module packets and source census for settings/team/invoice preferences, multi-role parties, customer credit/advances, loan relationships, bank/cheque lifecycle, batches/returns/corrections, vendor state actions, warranty temporary replacement/stages, reconciliation Ignored/source edits, import templates, attachments, notifications, offline/recovery and SaaS controls. Each gets the same A-compatible/B-extension disposition and source-owning implementation contract. Dedicated Reports remain out of this phase.

Do not replace unknown contracts with generic CRUD or route all business actions through one generic finance mutation. A repeated action from Party/Counter/Daybook/Invoice must call the same owning backend use case with context preserved. Freedom comes from composing correct operations, not duplicating writers per screen.

## 6. One-module review and execution process

1. Compare current frontend and backend at the issue's actual immutable baselines.
2. Mark every action REUSE/ADAPT/EXTEND/BUILD/PRESERVE with no hidden feature removal.
3. Show10–15 plain-English sentences covering available frontend, available backend, result, remaining gap, affected files and chosen runtime; obtain the existing one approval for that concrete module revision.
4. Stage A tasks connect compatible behavior; Stage B tasks add the approved domain/contract/schema deltas and reconnect the existing handler.
5. Test the source workflow on disposable data; preserve all current UI regression behavior. A transaction test asserts real journal/stock/account/source effects, not just HTTP200.
6. One active Super Build worker, independent scoped QA, draft PR(s), exact paired heads and evidence. Owner reviews and explicitly approves merge. No global queue draining or five-worker start.

## 7. Acceptance labels and next planning work

Use **DISCOVERED → INTEGRATION SPECIFIED → COMPATIBLE SLICES INTEGRATED → EXTENSION SPECIFIED → FULL UI PARITY → QA/OWNER ACCEPTED**. These are planning/status meanings, not new configured GitHub Project columns. Retain existing board columns and record these milestones in the issue.

The next **planning** increment is the full cash-policy caller/provider/correction manifest, followed by exact multilevel pricing/quantity contract. The next **implementation** increment, after approval, is Stage A foundation/current-capability integration. This amendment requests neither an immediate cash-code patch nor immediate implementation of all missing features.

This revision resolves the owner's transaction classification and sequencing direction. Original blueprint completeness gaps remain truthfully tracked in REVIEW.md until every task has its exact DTOs, files, algorithms and test fixtures.
