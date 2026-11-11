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
