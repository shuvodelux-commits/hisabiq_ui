# MOD-008 — Purchases, drafts, corrections, supplier orders and planner

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000, MOD-002, MOD-003, MOD-004, MOD-005, MOD-006. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-008-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/components/purchases/BillDetailDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/BillDetailDialog.tsx#L1)
- [src/components/purchases/BillDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/BillDialog.tsx#L1)
- [src/components/purchases/PurchaseCart.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/PurchaseCart.tsx#L1)
- [src/components/purchases/PurchaseDraftsMenu.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/PurchaseDraftsMenu.tsx#L1)
- [src/components/purchases/PurchasePaymentPanel.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/PurchasePaymentPanel.tsx#L1)
- [src/components/purchases/PurchaseSourceDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/PurchaseSourceDialog.tsx#L1)
- [src/data/purchaseDraftsPreviewStore.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/purchaseDraftsPreviewStore.ts#L1)
- [src/data/purchases.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/purchases.ts#L1)
- [src/pages/PurchaseEditor.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/PurchaseEditor.tsx#L1)
- [src/pages/Purchases.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Purchases.tsx#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/purchase-plans/suggestions` | [PurchasePlansController.suggestions](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchase-plans.controller.ts#L59) | `plannerQuerySchema` | `PlannerResponse` | `PlannerService.plan` |
| `GET /api/v1/purchase-plans` | [PurchasePlansController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchase-plans.controller.ts#L66) | `purchasePlanListQuerySchema` | `PurchasePlanListResponse` | `PurchasePlanService.list` |
| `GET /api/v1/purchase-plans/:id` | [PurchasePlansController.detail](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchase-plans.controller.ts#L76) | Inline / no body; linked method | `{ data: PurchasePlanResponse }` | `PurchasePlanService.detail` |
| `POST /api/v1/purchase-plans` | [PurchasePlansController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchase-plans.controller.ts#L85) | `createPurchasePlanRequestSchema` | `{ data: PurchasePlanResponse }` | `PurchasePlanService.save` |
| `POST /api/v1/purchase-plans/:id` | [PurchasePlansController.update](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchase-plans.controller.ts#L96) | `updatePurchasePlanRequestSchema` | `{ data: PurchasePlanResponse }` | `PurchasePlanService.update` |
| `POST /api/v1/purchase-plans/:id/decide` | [PurchasePlansController.decide](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchase-plans.controller.ts#L111) | `decidePlanRequestSchema` | `{ data: PurchasePlanResponse }` | `PurchasePlanService.decide` |
| `POST /api/v1/purchase-plans/:id/delete` | [PurchasePlansController.remove](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchase-plans.controller.ts#L122) | Inline / no body; linked method | `void` | `PurchasePlanService.remove` |
| `GET /api/v1/supplier-orders` | [SupplierOrdersController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchase-plans.controller.ts#L147) | Inline / no body; linked method | `SupplierOrderListResponse` | `PurchasePlanService.listOrders` |
| `GET /api/v1/supplier-orders/:id` | [SupplierOrdersController.detail](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchase-plans.controller.ts#L161) | Inline / no body; linked method | `{ data: SupplierPurchaseOrderResponse }` | `PurchasePlanService.order` |
| `POST /api/v1/purchases/:purchaseId/landed-costs` | [LandedCostsController.add](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchase-plans.controller.ts#L177) | `addLandedCostRequestSchema` | `{ data: LandedCostResponse }` | `AddLandedCostService.add` |
| `GET /api/v1/purchases` | [PurchasesController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchases.controller.ts#L45) | `purchaseListQuerySchema` | `PurchaseListResponse` | `PurchaseQueryService.list` |
| `GET /api/v1/purchases/:id` | [PurchasesController.detail](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchases.controller.ts#L52) | Inline / no body; linked method | `{ data: PurchaseResponse }` | `PurchaseQueryService.detail` |
| `POST /api/v1/purchases` | [PurchasesController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchases.controller.ts#L61) | `createPurchaseRequestSchema` | `{ data: PurchaseResponse }` | `CreatePurchaseService.create` |
| `POST /api/v1/purchases/:id/void` | [PurchasesController.void](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/purchases.controller.ts#L79) | `voidPurchaseRequestSchema` | `{ data: PurchaseResponse }` | `VoidPurchaseService.void` |
| `GET /api/v1/suppliers/:id/due` | [SupplierPaymentsController.due](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/supplier-payments.controller.ts#L35) | Inline / no body; linked method | `{ data: SupplierDueResponse }` | `PaySupplierService.due` |
| `POST /api/v1/suppliers/payments` | [SupplierPaymentsController.pay](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/supplier-payments.controller.ts#L44) | `paySupplierRequestSchema` | `{ data: SupplierPaymentResponse }` | `PaySupplierService.pay` |
| `PATCH /api/v1/suppliers/payments/:id` | [SupplierPaymentsController.correct](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/supplier-payments.controller.ts#L59) | `correctSupplierPaymentRequestSchema` | `{ data: { ok: true } }` | `PaySupplierService.correct` |
| `POST /api/v1/suppliers/payments/:id/void` | [SupplierPaymentsController.void](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/purchasing/supplier-payments.controller.ts#L74) | `voidDocumentRequestSchema` | `{ data: { ok: true } }` | `PaySupplierService.void` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-008-F01 | Purchase list/detail and drafts — `Purchases; PurchaseEditor.saveDraft` | ADAPT | purchases; local nonposting drafts | Preserve Review/Edit/Confirm, dirty-state and embedded supplier context. | PURCHASE-CONFIRM |
| MOD-008-F02 | Confirm receiving with split payments and lot metadata — `PurchaseEditor.save` | EXTEND | POST purchases | Extend existing createWithin atomically; no multi-request substitute. | D06 |
| MOD-008-F03 | Supplier payment and purchase void/correction — `Purchases sourceAction` | ADAPT | suppliers/payments; purchases/:id/void; POST purchases correctionOf | Lock original, version guard, source-safe reversal; exact correctionVersion extension required. | D06 |
| MOD-008-F04 | Purchase planner, plan decision, supplier orders and landed costs — `Discover active UI entry before build` | ADAPT | purchase-plans; supplier-orders; purchase-landed-costs | Existing backend capability, frontend operational entry trace NOT VERIFIED. No new Reports work. | No new screens without approval |

## 5. Proposed architecture and unresolved approval

Use PURCHASE-CONFIRM. Backend single initial account and separate serial endpoint do not match the current one-click purchase commit. Purchase plans are nonposting until conversion; landed-cost allocation affects stock/sold portions and must reuse AddLandedCostService. Return work belongs to MOD-009.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D03,D06,D16.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [purchasing fields](../contracts/purchasing.md)
- [purchase-plans fields](../contracts/purchase-plans.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/purchases-planner.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/data/purchaseDraftsPreviewStore.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/purchases.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/PurchaseEditor.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/Purchases.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/purchases-planner.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-purchases-planner.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-purchases-planner-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-008-T01: Purchase list/detail and drafts

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-002, MOD-003, MOD-004, MOD-005, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Purchases; PurchaseEditor.saveDraft`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `purchases; local nonposting drafts`. **Gate:** PURCHASE-CONFIRM.

**Algorithm / expected output:** Preserve Review/Edit/Confirm, dirty-state and embedded supplier context. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-purchases-planner.test.ts` case `MOD-008-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-008-T02: Confirm receiving with split payments and lot metadata

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-002, MOD-003, MOD-004, MOD-005, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `PurchaseEditor.save`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `POST purchases`. **Gate:** D06.

**Algorithm / expected output:** Extend existing createWithin atomically; no multi-request substitute. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-purchases-planner.test.ts` case `MOD-008-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-008-T03: Supplier payment and purchase void/correction

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-002, MOD-003, MOD-004, MOD-005, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Purchases sourceAction`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `suppliers/payments; purchases/:id/void; POST purchases correctionOf`. **Gate:** D06.

**Algorithm / expected output:** Lock original, version guard, source-safe reversal; exact correctionVersion extension required. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-purchases-planner.test.ts` case `MOD-008-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-008-T04: Purchase planner, plan decision, supplier orders and landed costs

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-002, MOD-003, MOD-004, MOD-005, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Discover active UI entry before build`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `purchase-plans; supplier-orders; purchase-landed-costs`. **Gate:** No new screens without approval.

**Algorithm / expected output:** Existing backend capability, frontend operational entry trace NOT VERIFIED. No new Reports work. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-purchases-planner.test.ts` case `MOD-008-F04 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.

## 12. Automated test specification

Common fixture/isolation/error suite is [VERIFICATION](../tasks/VERIFICATION.md). CORE_WORKFLOWS supplies exact numeric expectations for the applicable core flow. This packet additionally requires each §4 interaction to be exercised on actual React against Nest: success, validation, permission revoked after load, foreign tenant source, stale version, timeout/retry and failed refresh. GET/read-only cases assert zero mutations; financial cases assert golden invariants and expected absence of unrelated rows. **Gaps:** secondary features without numeric business rules/complete field map are explicitly NOT VERIFIED and cannot pass this section by merely receiving HTTP 200.

## 13. UI preservation checklist

- [ ] Every existing route, tab, row action and dialog in §2 retained; Reports links preserved without integration.
- [ ] Existing Bangla/English names, unit symbols and printed source wording preserved.
- [ ] Keyboard focus/Enter/Escape and nested quick-add return preserve parent draft.
- [ ] 320/390 phone, 768/820 tablet and 1440 desktop: same layout, light/dark and open overlays.
- [ ] No mock number, preview success or partial-page total appears as real data.
- [ ] Unsupported feature still exists in preview and blocks full live cutover, rather than disappearing.

## 14. Security/accounting checklist

- [ ] Server identity and tenant predicates, RLS with unprivileged role; no UI-only authorization.
- [ ] Permissions checked by actual owning service; sensitive fields absent on wire.
- [ ] Class T transaction includes audit/outbox and journal/stock as appropriate.
- [ ] Idempotency replay, altered-body refusal, stale version and simultaneous final-capacity races verified.
- [ ] Immutable history, closed-period rules, source identity and correct money/quantity scales retained.
- [ ] No secrets in diagnostics, previews, audit events or PR evidence.

## 15. Definition of Done

All selected feature contracts complete; exact allowlist approved; dependencies at accepted SHAs; no unknown business rule delegated to builder; specified focused tests and required repo gates pass on the candidate; real React→Nest path verified on disposable PostgreSQL; UI comparison accepted; independent QA reports evidence; human approves merge. Existence of this packet or a green typecheck alone never means DONE.

## 16. Blockers and decisions

D03,D06,D16

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-008-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.

## Revision 2 requirement precedence

[Integrate existing capabilities first, then extend missing UI parity](../HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md). [Cash-session classification](../tasks/CASH_SESSION_POLICY.md): historical opening balances, including lender/borrower openings, do not require an active session; actual tracked-cash movements do when ON, and OFF permits ordinary sessionless cash transactions. Do not add a cash check to historical openings or treat a credit/unpaid document as a cash payment. All existing UI features remain in scope; unsupported normal workflows keep their Stage B extension tasks and cannot be declared complete after compatible-slice integration alone.

## 19. MOD-008 source-verified approval amendment — 2026-11-13

**State: PROPOSED FOR OWNER APPROVAL; documentation only; no execution reservation.** This section supersedes older assumptions in this packet where indicated, without erasing the original source census. The contracts, columns, services and test cases below are *proposals*, not claims of implemented backend behavior. No app code, schema, migration, test or deployment is authorized by this documentation PR.

### 19.1 Revalidated paired source and execution boundary

| Source | Verified full commit SHA | Ref |
| --- | --- | --- |
| Frontend | `d42e3b573c96dcbd1b3d74f50a703d459d8cfd15` | `shuvodelux-commits/hisabiq_ui:main` |
| Backend | `d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75` | `shuvodelux-commits/nestshererp:chore/hisabiq-adoption-runtime-a01` |
| Backend main (not the adoption base) | `b1bad29961a968829be622dc812d476773e6db78` | `nestshererp:main` |

Verified via GitHub branch heads on 2026-11-13; work must repin both SHAs at dispatch because heads can advance. Read both repository `AGENTS.md`, the master, staged plan, `REVIEW.md`, `tasks/EXECUTION.md`, `contracts/EXTENSIONS.md`, `DECISIONS.md`, `tasks/CORE_WORKFLOWS.md` and `contracts/UI_FIELD_MAPPING.md`. Older links to `176bb1a...`/`1643dac...` in §§1–3 are historical evidence, not today's baseline. Stage A read/semantically compatible single-account functionality is not full purchase parity. D03 (exact multilevel units), D06 (atomic receiving/payment and correction), D16 (price precision/rounding), attachment ownership and coordinator reservation remain prerequisites.

**Approval overview — 12 sentences.** (1) MOD-008 connects the current React Purchases workspace to the existing Nest purchasing services without replacing the cart or its Review/Edit/Confirm workflow. (2) The read paths and strictly compatible one-account receipts can reuse the current controllers, but parity cannot be declared until the missing fields are supported. (3) Current purchase drafts are in-memory nonposting previews and must survive failed, unknown or timed-out confirmations. (4) Mixed units and independently entered per-unit costs require server-derived exact base quantities and immutable entered-unit snapshots. (5) The existing one-account `POST /api/v1/purchases` cannot represent the current Cash/Bank/MFS split-payment interface. (6) We propose one class-T `CreatePurchaseService.createWithin` transaction for lots, stock movements, serial units, supplier payable, every payment leg, journal, audit, outbox and idempotency. (7) Blank lot selling prices inherit the product default, while the explicit product-level use-default-for-all-lots flag overrides individual lot prices without rewriting their provenance. (8) Discounts, named landed costs and rounding must reconcile to one server-authoritative payable and balanced journal. (9) Attachments remain staged, authorized and source-linked; the backend must never accept arbitrary preview data URLs as posted receipts. (10) Purchase corrections must lock and version-check the original and must refuse unsafe reversal after linked stock consumption, return or incompatible later settlement. (11) The existing Reports buying/planner entry remains intact, and saved plans/supplier orders reuse current nonposting backend services before any newly approved purchase-workspace UI is considered. (12) Implementation awaits separate owner approval, coordinator ownership/reservation and disposable-database tests; this PR is documentation only.

### 19.2 Source-to-contract delta (no unsupported field may be dropped)

| Existing frontend interaction / evidence | Actual backend at paired SHA | Classification and required contract |
| --- | --- | --- |
| `Purchases.tsx` list/detail, three tabs, row source actions, `BillDetailDialog` | `GET /api/v1/purchases[/:id]`, supplier due query, purchase void and supplier payment services | **REUSE/ADAPT** typed transport and source IDs. Keep tabs, returns, existing print/receipt and permission-redacted amounts. |
| `PurchaseEditor.tsx` Review/Edit/Confirm, F2/F8/F9, `PurchaseCart`, supplier quick-add | `POST /api/v1/purchases` strict `createPurchaseRequestSchema` | **ADAPT** compatible fixture; **BLOCKED** for general cutover pending full receiving contract. No preview success after server error. |
| `PurchaseCartLine.unitQuantities`, costUnit, `unitPurchasePrices`, `lineAmount` | `qty` base ×1000 and `unitPriceMinor` per base unit only | **EXTEND D03/D16** server-owned product chain version, rational factors, entered-unit independent costs and exact line amount. Never silently divide an independent box price into rounded base poisha. |
| `PurchasePaymentPanel` multiple method/account/amount rows, unpaid/partial/full | `paidMinor` plus one `paidAccountCode`; supplier settlement likewise one `amountMinor`/`accountCode` | **EXTEND D06** atomic receipt legs and, for one UI settlement confirmation with multiple rows, an atomic supplier-payment leg extension. Do not send the first account only or chain public HTTP payments. |
| `serialText`, required serial count, duplicate checks | Separate serial workflow and existing `SerialRepository.insertSerialUnits` / `inventory_units` | **EXTEND** compose the serial repository in `createWithin`; source check and unique insert in same transaction. No extra serial POST after purchase. |
| `batchNumber`, `manufactureDate`, `expiryDate` | Expiry on purchase line and lot; batch/manufacture absent | **ADAPT/EXTEND** preserve existing expiry validation and add source-linked batch/manufacture metadata; enforce manufacture before expiry when both supplied. |
| `lotSellPrice` (up to four decimal places), `lotSellUnit` and `useDefaultPriceForAllLots` | No purchase lot-selling-price column; backend product default policy is not represented | **EXTEND/BLOCKED** nullable explicit lot price at scale 4, unit/price snapshot and authoritative product policy supplied by MOD-002/D04. No product selling-price mutation on receiving. |
| `discountMode` amount/percent, `calculatePurchaseCheckout` rounding No/৳1/৳5 | `discountMinor`, landedCosts/extraCostMinor; no bill rounding rule | **ADAPT/EXTEND D16** percentage input becomes exact domain discount amount, server rechecks; distinct signed rounding adjustment, never fake landed cost. |
| `photos[]` and `receipt` | No authenticated purchase attachment reference/upload | **BLOCKED** shared staged-asset owner/storage/scan contract must be approved; preserve photographs locally until stage/commit succeeds. |
| `saveDraft`/`PurchaseDraftsMenu`/`purchaseDraftsPreviewStore` | No server purchase-draft service | **ADAPT** nonposting local drafts, scoped tenant+user+session epoch; optional durable sync is separate contract, never represented as posted. Current recovery registration uses preview tenant `t1` and cannot be reused as a live tenant authority. |
| `PurchaseSourceDialog` correction, due payment and purchase return | `correctionOf` exists but lacks caller `correctionVersion`; `VoidPurchaseService` and `PaySupplierService` exist; purchase return is separately owned | **EXTEND** source version, lock, reason and payment/stock provenance; **MOD-009** owns return composition, source lines and actual settlement. |
| Reports → `Stock & buying` → `Purchase planner` / `ReportAnalysis(screen="buying")` | `GET /purchase-plans/suggestions`; plan save/update/decide; `GET /supplier-orders`; purchase conversion via `supplierOrderId`/`planLineId` | **REUSE/ADAPT** preserve Reports route and downloadable nonposting list; operational saved plan/order action has no verified React implementation. No new screen or Reports/Analytics rewrite from this packet. |

Source proof: `src/pages/{PurchaseEditor,Purchases}.tsx`; `src/components/purchases/{PurchaseCart,PurchasePaymentPanel,PurchaseSourceDialog}.tsx`; `src/utils/{purchaseCart,purchaseCheckout,lotSellingPrice}.ts`; `src/data/purchaseDraftsPreviewStore.ts`; `src/reports/screens.ts`, `src/components/reports/ReportAnalysis.tsx`, `scripts/report-workspace-browser.cjs`; backend `packages/core-contracts/src/{purchasing,purchase-plans}.ts`, `packages/core-application/src/purchasing/*`, `apps/api/src/purchasing/*`, `packages/adapter-postgres/src/{schema,purchase-repository,serial-repository}.ts`. All paths are at §19.1 refs; this is source reading, **not** test execution.

### 19.3 Proposed transport amendment — existing POST, additive legacy compatibility

**Primary mutation (proposed changes to existing `POST /api/v1/purchases`):** retain its header `Idempotency-Key` (canonical ULID), existing supplier/period/dueDate, lines, discount, landedCosts, extraCost, notes, correctionOf and supplierOrderId; response stays `{data: PurchaseResponse}`. A strict Zod branch discriminates **legacy** (`qty` and `unitPriceMinor`, `paidMinor` and `paidAccountCode`) from **advanced**: never accept both price modes or payment modes unless redundant values are exactly zero/null and explicitly allowed by the decoder. Server never trusts client computed grandTotal, stock or payable.

Proposed advanced request fields, using exact named types and bounds:

```ts
type PurchasePaymentLegInput = {
  accountCode: string;       // existing resolved CASH:/BANK:/MFS: account syntax
  amountMinor: number;       // positive safe integer poisha
};                           // 0..10 legs; [] means fully unpaid

type PurchaseEnteredUnitPartInput = {
  unitId: string;            // canonical tenant-scoped ULID in product's unit-chain version
  quantityMilli: number;     // positive integer, scale 3 in this entered unit
  unitPriceTakaX10000: number; // nonnegative safe integer, price per entered unit
};                           // 1..8 parts per line, including mixed Box+Pcs

type PurchaseAdvancedLineInput = {
  productId: string;         // actual ULID, active stock product
  unitParts: PurchaseEnteredUnitPartInput[]; // advanced alternative to qty/unitPriceMinor
  planLineId?: string|null;  // existing
  expiryDate?: string|null;  // existing, ISO calendar date
  manufactureDate?: string|null; // ISO date
  batchNumber?: string|null; // trimmed <=120
  serials?: string[];        // <=500, normalized/unique 1..64 chars within product
  lotSellingPriceTakaX10000?: number|null; // optional explicit base-unit price, >0 if set
  lotSellingUnitId?: string|null; // original entered-unit identity, validation/snapshot
};
type CreatePurchaseAdvancedAdditions = {
  payments?: PurchasePaymentLegInput[];
  roundingRule?: 'NONE'|'TAKA_1'|'TAKA_5';
  backdateReason?: string|null;       // trimmed <=300; policy gated, not ledger bypass
  attachmentAssetIds?: string[];      // <=10 approved staged same-tenant asset ULIDs
  correctionVersion?: number;         // required positive integer iff correctionOf != null
  correctionReason?: string|null;     // required nonblank <=300 iff correctionOf != null
};
```

Validation: `businessDate` uses the actual tenant calendar day and existing period/backdate authority. Resolve every unit part against the server's persisted, versioned D03 unit chain; never accept factors, products, prices, permissions or tenantId from the client as authority. Use BigInt/rational arithmetic and an approved rounding-at-line-boundary policy to derive integer base qty ×1000 and line total in poisha from independent unit prices; reject nonrepresentable stock quantity, overflow and unexpected unit-chain changes rather than silently alter entered cost. If optional `unitParts` are absent, preserve old `qty/unitPriceMinor` semantics. Enforce `sum(payment.amountMinor) <= server grandTotalMinor`, repeated-account aggregation, and no monetary transfer for an empty array. Maintain `discountMinor` as the *authoritative* amount accepted by the server; preserve UI percentage/amount display input and recompute/verify percentage against server item total in an approved preview/mapping contract, rather than trusting an optimistic React total. `roundingRule` changes final payable by a separately posted signed rounding amount, which must be explicitly surfaced in the review; it must not alter the actual lot cost of goods. For any serial-required product, normalized serial count equals whole canonical sellable units and there are no active duplicates.

**Lot policy precedence:** persist `lotSellingPriceTakaX10000 = NULL` when the field is blank; the effective sale price comes from the product's default (including its independent per-unit policy), not a copied numeric zero. For an explicit lot price, store it only on that sourced lot and preserve the entered unit snapshot. If the product's authoritative `useDefaultPriceForAllLots` is true, the product default wins at *selling time* even when the lot has an explicit price; do not erase that explicit historical source price. Opening stock continues to use product default. This flag's server product field/storage belongs to MOD-002/D04 coordinator work and blocks release until implemented/verified. The current EXT-03 suggestion `lotSellingPriceMinor` (poisha) is *insufficient* for frontend's four-decimal input; the approved extension must reconcile on scale-4 price, not truncate it.

**Response (proposed additive fields on `PurchaseResponse`/line):** `roundingRule`, `roundingMinor` (signed), `correctionOfPurchaseId`, `supersededByPurchaseId`, and `initialPaymentLegs: {id,accountCode,accountName,amountMinor,sessionId}[]`; advanced line snapshots `enteredUnitParts: {unitId,unitName,quantityMilli,baseFactorNumerator,baseFactorDenominator,unitPriceTakaX10000,lineAmountMinor}[]`, `batchNumber`, `manufactureDate`, `serials`, `lotSellingPriceTakaX10000` nullable, `effectiveLotPriceSource: 'PRODUCT_DEFAULT'|'LOT'|'PRODUCT_OVERRIDE'`. Attachment descriptors are separate metadata `{assetId,mediaType,filename,sizeBytes}[]` only after authorized finalization. The legacy `paidMinor` is the total initial paid **plus** subsequently allocated payments in the detail projection exactly once, with existing `dueMinor` derived; `paidAccountCode`/name are populated only for the true one-leg legacy case and otherwise null. Do not confuse existing `payments` (later supplier payments) with `initialPaymentLegs`. Money and cost details remain omitted, not zero-filled, without `inventory.cost.view`, including planner costs. Return a source/version and effective dates for safe future correction. Any widening of strict response schemas and legacy clients requires explicit backward-compatibility tests.

**Later supplier settlement (proposed additive extension of existing `POST /api/v1/suppliers/payments`):** accept either old `amountMinor/accountCode` or `paymentLegs: PurchasePaymentLegInput[]` (1..10) with supplierPartyId, purchaseId|null, businessDate and note; never send both as independent amounts. `PaySupplierService.pay` totals the legs and allocates **one** settlement to open source bills, under locks, while inserting all account-credit journal legs and payment-leg rows in one UOW, with no intermediate public HTTP calls. For multi-leg settlements, existing singular `supplier_payments.account_code` and its response become nullable with a versioned additive response `paymentLegs[]`; legacy one-leg calls retain current shape. Correct/void settlement reuses the existing versioned source reversal and reverses its complete leg set. This is an EXTEND gate, not a claim that the current one-account API supports it.

**Attachments:** no existing authenticated purchase-asset endpoint or provider was verified. Propose coordinator-owned tenant/user scoped staged media metadata, content-type/size checks, malware validation, immutable object IDs and upload acknowledgment; the receive DTO takes only **already staged** `attachmentAssetIds` with same-tenant ownership and expiry. Linking/finalizing metadata must be in the purchase UOW; object bytes are never in journal/audit and failed confirmation retains staged assets for bounded retry/cleanup. The staged upload/asset endpoint and provider wiring are **BLOCKED** pending a dedicated reviewed contract; no browser data-URL fallback and no invented existing endpoint.

### 19.4 Exact proposed storage change manifest (not yet a migration)

Coordinate one migration number; only coordinator may edit `packages/adapter-postgres/src/schema.ts` and migration files after approval. Use existing tenantId predicates, RLS, foreign keys and durable unique constraints; preserve old rows and requests. Required additive/modified physical structures:

| Structure | Exact proposed columns/constraints | Reason and owner |
| --- | --- | --- |
| `purchase_payment_legs` **NEW** | `id char(26) PK; tenant_id char(26) NOT NULL; purchase_id char(26) NOT NULL; line_no integer NOT NULL; account_code text NOT NULL; amount_minor bigint NOT NULL CHECK(amount_minor>0); session_id char(26) NULL; created_at timestamptz NOT NULL; created_by char(26) NOT NULL`; unique `(tenant_id,purchase_id,line_no)` and tenant-safe source FK | Initial receipt money origins; `PurchaseRepository.insertPurchase` writes legs under same transaction as journal; sum equals `purchases.paid_minor`. |
| `purchase_line_unit_parts` **NEW** | `id char(26) PK; tenant_id char(26) NOT NULL; purchase_line_id char(26) NOT NULL; part_no int NOT NULL; unit_id char(26) NOT NULL; unit_name_snapshot text NOT NULL; quantity_milli bigint NOT NULL CHECK(>0); factor_numerator bigint NOT NULL CHECK(>0); factor_denominator bigint NOT NULL CHECK(>0); unit_price_taka_x10000 bigint NOT NULL CHECK(>=0); line_amount_minor bigint NOT NULL`; unique `(tenant_id,purchase_line_id,part_no)` | Immutable independent unit/price evidence for receipt, reprint, correction, return. Stock remains one canonical qty in existing purchase_lines/lot. |
| `inventory_lots` **ADD** | `lot_selling_price_taka_x10000 bigint NULL CHECK(>0 when nonnull); batch_number text NULL CHECK(length<=120); manufacture_date date NULL`; retain existing `expiry_date` | Per-source lot price metadata and provenance, no product default overwrite. |
| `purchases` **ADD** | `rounding_rule text NOT NULL DEFAULT 'NONE'; bill_rounding_minor bigint NOT NULL DEFAULT 0; backdate_reason text NULL; correction_of_purchase_id char(26) NULL; superseded_by_purchase_id char(26) NULL; request_fingerprint_sha256 char(64) NULL` | Explicit rounding, source chain and permanent idempotency mismatch detection even when cache expires. Backfill older purchase fingerprints where safely reconstructable; otherwise preserve legacy protection without pretending complete matching. |
| `supplier_payment_legs` **NEW** and `supplier_payments` **MODIFY** | Leg columns mirror purchase legs with `supplier_payment_id` as parent; `supplier_payments.account_code` made nullable for multi-leg rows, with existing single-leg values intact | One source-safe supplier settlement containing real Cash/Bank/MFS origins; payment total remains source amount. |
| `purchase_attachments` **NEW, CONDITIONAL** | `id char(26) PK; tenant_id char(26); purchase_id char(26); asset_id char(26); filename text; media_type text; size_bytes bigint; created_at timestamptz; created_by char(26)`; tenant-safe unique `(tenant_id,purchase_id,asset_id)` | Only after shared approved scanned object-asset repository/ownership exists. Do not create this table prematurely. |
| `inventory_units` **REUSE** | Existing `product_id,serial_no,lot_id,purchase_id,purchase_line_id,received_date,expiry_date,status`; active-serial uniqueness enforced at DB and service | Compose serial inserts; do **not** add duplicate serial text arrays to purchase line rows. |
| Existing `purchase_lines`, `payment_allocations`, `journal_entries/lines`, `stock_movements`, `supplier_purchase_orders` | **REUSE** linked source IDs, line-level cost/discount shares, later supplier payment allocations, journal source, order conversion; add only necessary compound tenant FKs/constraints after migration design | No stock/journal/table reset, no purchase line price substitution, no P&L field in supplier-facing order lines. |

Products' `useDefaultPriceForAllLots` and versioned multilevel unit chains/pricing are **shared MOD-002 / D03 ownership**, not a hidden MOD-008 schema edit. Source-safe purchase returns belong to MOD-009. Reserve both dependencies and pin interface versions before implementing their callers.

### 19.5 Service/transaction plan and reconciliation invariants

**Single authoritative receiving commit:** amend `packages/core-contracts/src/purchasing.ts` → `PurchasesController.create` mapping → `CreatePurchaseCommand/PurchaseLineInput` → `CreatePurchaseService.createWithin` → `purchaseCosts/purchasePosting` → `PurchaseRepository/NewPurchase/NewPurchaseLine` → `PostgresPurchaseRepository.insertPurchase`, composing the existing `SerialRepository` and shared authenticated asset ownership port through the Nest purchasing-module provider. Continue to use one `UnitOfWork.run`, not a coordinator of independently committed HTTP calls.

Ordered algorithm inside that UOW:

1. Validate strict legacy/advanced DTO, normalize identifiers/units/serials/legs, hash the **complete normalized request fingerprint**, including reference, notes, supplierOrderId, correctionOf, correctionVersion, reason, rounding, attachments and all unit/serial/payment input; check operation replay against both idempotency cache and durable unique operation ID + stored fingerprint. Same key with changed body must refuse, not return a different bill.
2. Authorize purchase create/edit and separately payment/financial account access as required; validate true tenant/user context, active supplier/product identities, selected unit chain revisions, source order and approved staged asset ownership; no client-supplied tenant/stock authority.
3. Resolve business day, validate due date/backdate reason, reject future/closed dates as current policy requires; for correction also guard original-period and replacement-period rules.
4. Lock original purchase by tenant/source ID and **client correctionVersion** before any reversal; lock order/version when converting; lock products/stock positions, serial uniqueness sources and affected cash/account balances using approved global lock order.
5. Recompute canonical base quantities and *per-entered-unit* monetary line totals using exact rational/BigInt operations; apply discount allocation and named landed costs to inventory basis; calculate signed invoice rounding separately, payable and due.
6. Validate all batch/manufacture/expiry and tracked-serial counts; detect duplicate serials within request and against active tenant serial rows; validate lot selling price and product-level override policy without changing product master sale price.
7. Resolve each payment account through existing account resolver and the MOD-005 optional cash-session policy; aggregate repeated-account outflows before balance checks; feature ON needs an eligible open designated-drawer session for actual cash, OFF allows ordinary cash without session, bank/MFS-only and unpaid need no session.
8. For corrections, read the original posted journal and leg snapshots, reject sold/reserved/returned serial/lot stock and unsafe downstream dependencies, reverse exactly the source journal/movements and old initial payment legs, and handle later payment allocations only by the guarded rules in §19.6.
9. Insert new purchase and all source lines, conversion snapshots, owned inventory lots/stock movements, serial `inventory_units`, purchase-payment-leg rows, adjustment/rounding and due allocations; convert an eligible supplier order once under the same UOW and verify affected row count.
10. Post one balanced journal: **DR Inventory** for actual inventory cost basis; **DR/CR Rounding** for the signed difference between invoice payable and inventory basis; **CR each payment account** for each actual immediate outflow; **CR Supplier AP** for remaining due. Existing costing residuals must be consolidated with explicit invoice rounding without double rounding or treating discount as a second expense.
11. Append source-linked audit event and outbox message and save durable idempotency response in the same UOW; any rejection, failed insert, audit, outbox or injected payment/serial/attachment failure rolls back every DB write.
12. Return authoritative response and invalidate tenant/user/session-epoch-scoped queries. Only on confirmed response may React consume the draft and close review/navigate; timeout/unknown commit retains all raw user inputs and **the same** operationId for safe replay/reconciliation.

**Reconciliation assertions:** `Σ line gross - discount + included landed cost = inventory cost allocation`, subject only to the documented valuation residual; `invoice payable = inventory cost basis + signed rounding and existing valuation residual`; `payable = Σ immediate payment legs + remaining AP`; `Σ journal amounts = 0`; stock received equals exactly the canonical base quantities of distinct purchase lines; no extra customer/supplier ledger event is silently synthesized from payment rows. Source daybook, party ledger, cash session and inventory are projections of *one* committed source. Payment account aggregation must stop one account with two rows from passing two independent insufficient-funds checks.

**Price updates:** retain current backend last-purchase-cost update and cost warning when authorized; never overwrite product selling-price defaults from lot metadata. Preserve source-entered unit/price snapshots and separate the product policy from an explicit per-lot quote.

### 19.6 Source-safe correction, settlement and returns

**Purchase correction:** Extend current `correctionOf` with required caller `correctionVersion` and nonempty `correctionReason`; use `SELECT ... FOR UPDATE` or equivalent through `PurchaseRepository.findPurchaseForReversal` before optimistic version validation, never the version fetched moments before posting as a substitute for the client's expectation. Current `reverseForCorrection` already checks `qtyRemainingInLot < qty` and reverse/post in one UOW but does not receive a caller correctionVersion; extend it to check purchase-return allocations, reserved/consumed stock, serial lifecycle and sold/claimed units, full original journal, same-supplier identity, linked order and later settlements. It may use existing `reversePurchase`/`movePaymentAllocations` only when the replacement bill can legally carry all prior allocated payments and preserves their source provenance. Reject cases where transferred allocations exceed replacement payable or supplier/order identity differs until a documented supplier-advance/refund allocation policy exists. Client correction carries **the full intended replacement initial payment leg set**; the service reverses original immediate legs and books only these replacement legs, so preserved payments are not paid twice. Reverse/repost source entries under immutable original/extension chain; keep previous numbering/audit/lot/serial provenance. No update-in-place monetary rewrite and no deletion of journal or consumed lots.

**Void:** use existing `POST /purchases/:id/void` (version, reason), not hard delete. Current `VoidPurchaseService` rejects later allocations and sold lots; extend reversal preconditions for returns, reservations, serials and multi-leg cash origins. Closed periods remain guarded; do not circumvent them with client-side date or “opening” flags. Reversals must credit/debit original account legs exactly once and preserve the original historical source.

**Later supplier settlement:** use `GET /suppliers/:id/due` and `POST /suppliers/payments`, with allocation ordering and checked remaining due from server, not local UI arithmetic. A payment can be partial, but an intended single split settlement needs the atomic `PaySupplierService.pay` multi-leg extension in §19.3. Correction/void of payment uses existing versioned endpoints and actual original leg reversal; never mutate party balance or cash sessions directly. Supplier advances and refunds must stay separate liability/asset policy decisions, not disguised negative AP or an overpaid bill.

**Purchase return (MOD-009 dependency, same UI preserved):** `PurchaseSourceDialog` retains its selection/Review/Confirm layout; read authoritative returnable source lines and server-held lot/serial consumption, then call the owning `CreatePurchaseReturnService` through its approved versioned, idempotent source-linked return DTO. One user-confirmed batched return may not fan out into several independent HTTP requests; it needs MOD-009's explicit atomic batch contract and its supplier-credit/cash-refund reconciliation. Link original purchaseLineId/lotId/serial unit IDs, immutable net cost/discount/rounding shares, available quantity and settled/refunded amount. Refuse over-return, duplicate serial, foreign tenant, stale source, sold/reserved lot, invalid refund account and unsafe older-period edits. This packet **does not** change MOD-009 or invent return endpoints.

### 19.7 Planner and supplier-order entry-point trace

**Verified existing React navigation:** the Reports navigation has `Stock & buying` → `Purchase planner` and a `Smart buying` screen (`src/reports/screens.ts`; `src/components/reports/ReportAnalysis.tsx`; `scripts/report-workspace-browser.cjs`). Its report-facing explanatory text says downloaded purchase lists do **not** create supplier orders and that saved plans, supplier orders and receiving are later connected purchasing work. The Purchases workspace at `src/pages/Purchases.tsx` currently has only the tabs `purchases`, `return`, `return-history`; verified `src/purchases/orders.ts` and `orderTypes.ts` do not exist on this main SHA despite older proposed-design references. Accordingly **do not propose a replacement planner or assume active supplier-order UI**. Preserve the Reports route/navigation as-is and investigate integration handoff (read-only deep-link or existing purchase-context action) under an independently approved UX/file reservation; Reports/Analytics live integration is excluded by master instructions.

**Existing backend to reuse:** `GET /api/v1/purchase-plans/suggestions`; plan list/detail/save/update/approve/reject/delete via `PurchasePlansController/PurchasePlanService`; `GET /api/v1/supplier-orders[/:id]`; and `POST /api/v1/purchases` with `supplierOrderId` and line `planLineId` for receipt. A plan is nonposting; approval creates supplier orders; the printable supplier-order response intentionally has no cost, selling price, stock, margin or profit fields. Ensure conversion verifies open status, supplier identity, associated plan line quantities/IDs and one-time conversion under concurrency. `POST /api/v1/purchases/:purchaseId/landed-costs` is for **later** landed costs and legitimately a *separate subsequent financial event*, not a split purchase-confirmation workaround; use `AddLandedCostService` to allocate sold/unsold shares without retroactively overwriting the original invoice.

### 19.8 Ordered implementation dependency gates and exact future write owners

**No implementation work is dispatched by this PR.** When approved, sequence **T01 (compatible reads/drafts, nonposting)** → **T02 (complete D03/D16 units, D06 one-UOW receiving, attachment/provider and lot policy)** → **T03 (versioned purchase/source correction and atomic supplier settlements)** → **T04 (trace-approved planner/order read and conversion handoff)**. T01 may integrate compatible read paths independently but must retain a visible hold for incompatible confirms. T02/T03 are BLOCKED until all new schemas/ports, business rounding, serial/attachment/period policies and tests are specified; a narrow one-account backend green path cannot be called MOD-008 done. T04 reuses nonposting APIs and may be revisited after source entry and permissions are explicitly approved. Required existing upstream: MOD-000 FND/identity/idempotency, MOD-001 cash-session setting, MOD-002 product units/default-price policy, MOD-003 inventory/stock/serial, MOD-004 supplier identity, MOD-005 cash sessions, MOD-006 account identity; MOD-009 owns return batching. Any inter-module shared type or provider has **coordinator-only ownership**.

| Future path (none writable under this documentation PR) | Required task role / owner |
| --- | --- |
| Frontend `src/pages/PurchaseEditor.tsx`, `src/pages/Purchases.tsx`, `src/components/purchases/{PurchaseSourceDialog,PurchasePaymentPanel,PurchaseCart,PurchaseDraftsMenu}.tsx`, `src/data/{purchaseDraftsPreviewStore,purchases}.ts` | Module worker after exact path reservation: adapt handlers, preserve existing React markup/navigation, keyboard, draft and review. Shared `PurchaseCart` and payment primitives also require coordinator signoff. |
| Frontend `src/utils/{purchaseCart,purchaseCheckout,lotSellingPrice}.ts`; CREATE `src/integration/{purchases,purchaseMapping,purchases-planner}.ts`; `tests/integrationPurchaseMapping.test.ts`, `scripts/integration-purchase-browser.cjs` | Module worker for source-specific adapter/mapping/tests only after signoff; reuse foundational transport, server decimal and operation handling. Do not create competing global HTTP layer. |
| Frontend `src/types/erp.ts`, `src/App.tsx`, `src/integration/{http,session,operation,decimal,errors}.ts` and shared product/unit/asset components | Coordinator-owned shared paths; MOD-002/other module interfaces first, with explicit lease/reservation. |
| Backend `packages/core-contracts/src/{purchasing,purchase-plans}.ts`, `packages/core-domain/src/purchasing/purchase.ts`, `packages/core-application/src/purchasing/{create-purchase-service,purchase-repository,purchase-view,pay-supplier-service,payment-account}.ts` | Module worker after reviewed exact DTO, journal/source algorithms, authorized file allowlist and tests. Planner/service paths reused unless defects verified. |
| Backend `packages/adapter-postgres/src/{purchase-repository,serial-repository}.ts`, `packages/core-application/src/inventory/serial-repository.ts` | Module worker only for approved tenant-safe exact repo/serial methods; serial port existing, transaction composition needed. |
| Backend `apps/api/src/purchasing/{purchases.controller,supplier-payments.controller,purchasing.module}.ts` and `packages/core-contracts/src/index.ts`, `packages/core-application/src/index.ts`, `apps/api/src/infrastructure/tokens.ts` | Provider/export/transport integration coordinated on reserved shared API surface; add injection for existing serial repository and approved optional asset provider. |
| Backend `packages/adapter-postgres/src/schema.ts`, all SQL migration numbers/files, shared product unit/policy storage, CI and generated client contracts | **Coordinator only**; no module worker writes until migration index, tenant constraints, deployment compatibility and rollback are reserved. |

At dispatch record task ID/issue, owner approval and exact unchanged scope, branch/head SHAs for both repositories, current Project v2 reservation, worker/session, exact file allowlist, shared-file leases, disposable database, test commands and two linked draft PRs. Checked-in capacity is one worker; a GitHub comment does not reserve a worker. If a peer changes a shared contract, pause and repin. No merge, auto-merge, deployment, production data operation or migration from this packet.

### 19.9 Regression and failure-injection vectors (must fail before code, pass after)

| Vector | Verifiable expected result / negative assertion |
| --- | --- |
| Unpaid purchase, 2 base units @5000 poisha, 1000 discount | Inventory basis 9000; AP 9000; payment legs 0; no cash session request or account movements; balanced journal. |
| Partial single-account compatible receipt | Inventory 9000, cash outflow 3000, AP 6000; server due 6000; no extra SupplierPayment record. |
| Split receipt Cash 2000 + Bank 1000 | ONE purchase, one purchase journal, TWO initial legs, AP 6000; all committed or none. Inject second-account shortfall after first account lookup → no lot, serial, journal, payment, order conversion, audit or outbox. |
| Same Cash account entered twice 2000+3000 with balance 4000 | Reject aggregated outflow 5000; no double-spend; no side effects. |
| Cash policy ON / OFF / noncash | ON requires eligible open drawer for actual cash; OFF permits sessionless cash with normal journal; bank/MFS-only and unpaid are not session-gated; historical opening policy never used as bypass. |
| 1 Box + 5 Pcs with independent unit purchase prices | Preserve both entered unit IDs/prices and ordered quantities; server calculates exact baseQty and money with rational conversion; a nonrepresentable per-base rate is not rounded into a different purchase. |
| Repeated product at two prices/batches | Exactly two source lot IDs with separate costs, batch/expiry/manufacture and optional price; same product stock total sums exactly once. |
| Lot price blank / explicit / product override | Blank saves NULL and uses product default; explicit scale-4 value survives source read; product `useDefaultPriceForAllLots=true` wins at sale preview without deleting explicit lot metadata. |
| Serial required 2 units: 1 or 3 numbers, duplicate within bill, duplicate active tenant, concurrent same serial | Reject all invalid cases atomically; correct exactly two serial rows link to corresponding purchase line and lot; foreign tenant serial not exposed. |
| Manufacture/expiry and permission | manufacture >= expiry, required expiry missing, unsupported expiry, inactive product and unauthorized cost all reject or redact correctly; no stock/journal side effects. |
| 10% discount, ৳1/৳5 rounding, named landed cost | Server preview/confirm agree in poisha; inventory discount shares and landed cost allocate once; signed invoice rounding journal balances; overpayment fails. |
| Attached scan/data/asset | Invalid MIME, too-large/expired/foreign-tenant asset or object-store failure refuses confirm; no leaked URL, no journal photo bytes; unchanged draft/asset retry state. |
| Correction same version / stale / old period / downstream sale or return | Only eligible source reverses and reposts with immutable chain; stale and unsafe cases leave original stock, serials, bank, AP and journal unchanged. |
| Correction after later supplier allocation | Move allocations only if successor same supplier/number, has sufficient payable and source lock passes; otherwise explicit reject, no orphan allocations or hidden advance. |
| Source-aware batched return (MOD-009) | Uses original line/lot/serial IDs, enforces returnable qty and correct due vs refund; an injected later-line failure does not partially post earlier lines. |
| Single supplier due settlement, split later settlement, correct/void | Locked allocation uses current open due; separate debit/credit legs aggregate in ONE journal; versioned correction/void reverses every real source account entry. |
| Planner draft → approval → supplier order → conversion | Plan and supplier order post ZERO stock/AP/journal before purchase; supplier copy exposes zero price/cost fields; purchase confirmation converts only OPEN matching order once; concurrent attempts lose without side effects. |
| Later landed cost after some stock sold | `AddLandedCostService` allocates remaining-stock/COGS shares with correct source journal; no duplicate initial purchase receipt; replays idempotently. |
| Lost POST response / same key changed body / 2 tenants / permission revoked | Same operation ID returns the same committed source, no duplicate lots/payments; altered fingerprint refuses even after cache expiry; tenant B cannot read/mutate tenant A; failed refresh retains posted response and draft state until reconciled. |
| UI parity browser matrix | Existing Review/Edit/Confirm, drafts/resume, quick supplier/product add, search, keyboard F2/F8/F9/Enter/Escape, photos, source dialogs, print, Bangla/English, dark/light, 320/390/768/820/1440 widths survive. |

Run only under **separately approved** execution/verification scope on disposable tenant-isolated PostgreSQL: backend request/contract/domain/UOW tests, PostgreSQL rollback/concurrency (including injected write failures), FE mapping/unit/draft tests, React–Nest browser workflows, TypeScript/lint/UI-contract/build and coordinated source accounting reconciliation. Record actual command exits and screenshots; **none were run for this documentation-only review**. No partial UI substitute counts as an accounting test.

### 19.10 Rollback / interruption / approval gates

**Before rollout:** revert the candidate feature commit/draft PR and leave live preview behavior intact; no database rollback is necessary because this review changes only the packet. **After any future applied migration:** use approved expand/dual-read/deploy/contract compatibility sequencing, keep old columns/legacy DTO until all readers migrate, and perform only separately reviewed non-destructive database forward fixups (never drop posted rows as a rollback). **After a posted purchase:** reverse or correct through the owning financial service with journal/stock/lot/serial/payment provenance, never delete, truncate or manually reset derived balances. An interrupted unknown POST is reconciled with its original operation ID before retry, and its owner session, source SHA, transaction and dirty worktree remain reserved until coordinator handoff.

**Owner decision still required:** approve or amend this precise MOD-008 design and its paired environment; coordinator must then verify prerequisite accepted heads, MOD-002/005/009 boundaries, D03/D06/D16 and asset-contract gaps, shared ownership, one available worker, exact allowed paths and a named test scope. Only afterward may implementation task PRs be prepared. This documentation PR may change **only this module packet** and does not grant approval to code, schema, migrations, deployment or merge.
