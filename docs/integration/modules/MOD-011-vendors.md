# MOD-011 — Vendor stock, settlements and vendor working hubs

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-002, MOD-003, MOD-004, MOD-006, MOD-007, MOD-008. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-011-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/components/vendor/VendorClearDuePanel.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorClearDuePanel.tsx#L1)
- [src/components/vendor/VendorDirectory.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDirectory.tsx#L1)
- [src/components/vendor/VendorDiscardDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorDiscardDialog.tsx#L1)
- [src/components/vendor/VendorGoodsEditor.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorGoodsEditor.tsx#L1)
- [src/components/vendor/VendorMemoPickerDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorMemoPickerDialog.tsx#L1)
- [src/components/vendor/VendorPaymentsWorkspace.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorPaymentsWorkspace.tsx#L1)
- [src/components/vendor/VendorSourceWorkspace.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorSourceWorkspace.tsx#L1)
- [src/components/vendor/VendorTabs.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorTabs.tsx#L1)
- [src/components/vendor/VendorV2Cart.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/vendor/VendorV2Cart.tsx#L1)
- [src/pages/VendorV2.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/VendorV2.tsx#L1)
- [src/pages/Vendors.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Vendors.tsx#L1)
- [src/vendor/vendorActivity.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorActivity.ts#L1)
- [src/vendor/vendorCorrection.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorCorrection.ts#L1)
- [src/vendor/vendorLedger.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorLedger.ts#L1)
- [src/vendor/vendorModel.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorModel.ts#L1)
- [src/vendor/vendorPartyProjection.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorPartyProjection.ts#L1)
- [src/vendor/vendorPreviewStore.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorPreviewStore.ts#L1)
- [src/vendor/vendorRoute.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorRoute.ts#L1)
- [src/vendor/vendorSalePreview.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorSalePreview.ts#L1)
- [src/vendor/vendorStock.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorStock.ts#L1)
- [src/vendor/vendorTypes.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorTypes.ts#L1)
- [src/vendor/vendorV2Pricing.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/vendor/vendorV2Pricing.ts#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `POST /api/v1/vendor-workspace/product-settlements` | [VendorWorkspaceController.settleWithProducts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/vendors/vendor-workspace.controller.ts#L72) | `vendorProductSettlementRequestSchema` | `{ data: VendorProductSettlementResponse }` | `VendorProductSettlementService.create` |
| `GET /api/v1/vendor-workspace/summary/:vendorPartyId` | [VendorWorkspaceController.summary](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/vendors/vendor-workspace.controller.ts#L87) | Inline / no body; linked method | `{ data: VendorWorkspaceSummaryResponse }` | `VendorWorkspaceService.summary` |
| `GET /api/v1/vendor-workspace/activity/:vendorPartyId` | [VendorWorkspaceController.activity](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/vendors/vendor-workspace.controller.ts#L96) | Inline / no body; linked method | `{ data: readonly VendorActivityRow[] }` | `VendorWorkspaceService.activity` |
| `POST /api/v1/vendor-workspace/payments` | [VendorWorkspaceController.pay](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/vendors/vendor-workspace.controller.ts#L126) | `payVendorRequestSchema` | `{ data: VendorMoneyDocumentResponse }` | `VendorMoneyService.pay` |
| `POST /api/v1/vendor-workspace/receipts` | [VendorWorkspaceController.receive](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/vendors/vendor-workspace.controller.ts#L140) | `receiveFromVendorRequestSchema` | `{ data: VendorMoneyDocumentResponse }` | `VendorMoneyService.receive` |
| `POST /api/v1/vendor-workspace/issues` | [VendorWorkspaceController.give](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/vendors/vendor-workspace.controller.ts#L155) | `giveProductsToVendorRequestSchema` | `{ data: SaleResponse  /  VendorProductIssueResponse }` | `VendorIssueService.give` |
| `POST /api/v1/vendor-workspace/issues/returns` | [VendorWorkspaceController.receiveBack](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/vendors/vendor-workspace.controller.ts#L169) | `receiveProductsBackRequestSchema` | `{ data: VendorProductIssueResponse }` | `VendorIssueService.receiveBack` |
| `GET /api/v1/vendor-stock` | [VendorStockController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/vendors/vendors.controller.ts#L40) | Inline / no body; linked method | `{ data: readonly VendorStockReceiptResponse[] }` | `VendorStockService.listReceipts` |
| `GET /api/v1/vendor-stock/settlement/:vendorPartyId` | [VendorStockController.settlement](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/vendors/vendors.controller.ts#L55) | Inline / no body; linked method | `{ data: VendorSettlementResponse }` | `VendorStockService.settlement` |
| `POST /api/v1/vendor-stock` | [VendorStockController.receive](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/vendors/vendors.controller.ts#L64) | `receiveVendorStockRequestSchema` | `{ data: VendorStockReceiptResponse }` | `VendorStockService.receive` |
| `POST /api/v1/vendor-stock/returns` | [VendorStockController.returnStock](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/vendors/vendors.controller.ts#L78) | `returnVendorStockRequestSchema` | `{ data: VendorStockReceiptResponse }` | `VendorStockService.returnStock` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-011-F01 | Vendor profile/summary/activity — `Vendors; VendorV2; vendorPreviewStore` | ADAPT | vendor-workspace/summary/:vendorPartyId; activity | Keep both routes and all contextual next actions; role-specific balances. | Live field mapping NOT VERIFIED |
| MOD-011-F02 | Receive/return consignment stock — `vendor stock dialogs` | ADAPT | vendor-stock; vendor-stock/returns | Vendor stock is not owned inventory/AP; preserve lot/serial provenance. | Origin permission tests required |
| MOD-011-F03 | Pay/receive/give/back/product settlement — `vendorPreviewStore commands` | ADAPT | vendor-workspace payments/receipts/issues/issues/returns/product-settlements | Reuse VendorMoney/Issue/ProductSettlement services; no independent balance writer. | Atomic related purchase via createWithin |
| MOD-011-F04 | Correct/reverse vendor preview actions — `vendor correction dialogs` | EXTEND | Endpoint coverage differs by source | Map each action to actual source correction; preserve unsupported actions until contract exists. | Per-action correction parity incomplete |

## 5. Proposed architecture and unresolved approval

VendorProductSettlementService is the verified composition reference for purchase, serials, landed costs and AR/AP offsets. Do not label every vendor transfer as supplier payment. Cost unknown is null, not zero; provisional profit must remain marked.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D03,D06.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [vendors fields](../contracts/vendors.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/vendors.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/pages/VendorV2.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/Vendors.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/vendors.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-vendors.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-vendors-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-011-T01: Vendor profile/summary/activity

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-002, MOD-003, MOD-004, MOD-006, MOD-007, MOD-008. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Vendors; VendorV2; vendorPreviewStore`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `vendor-workspace/summary/:vendorPartyId; activity`. **Gate:** Live field mapping NOT VERIFIED.

**Algorithm / expected output:** Keep both routes and all contextual next actions; role-specific balances. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-vendors.test.ts` case `MOD-011-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-011-T02: Receive/return consignment stock

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-002, MOD-003, MOD-004, MOD-006, MOD-007, MOD-008. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `vendor stock dialogs`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `vendor-stock; vendor-stock/returns`. **Gate:** Origin permission tests required.

**Algorithm / expected output:** Vendor stock is not owned inventory/AP; preserve lot/serial provenance. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-vendors.test.ts` case `MOD-011-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-011-T03: Pay/receive/give/back/product settlement

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-002, MOD-003, MOD-004, MOD-006, MOD-007, MOD-008. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `vendorPreviewStore commands`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `vendor-workspace payments/receipts/issues/issues/returns/product-settlements`. **Gate:** Atomic related purchase via createWithin.

**Algorithm / expected output:** Reuse VendorMoney/Issue/ProductSettlement services; no independent balance writer. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-vendors.test.ts` case `MOD-011-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-011-T04: Correct/reverse vendor preview actions

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-002, MOD-003, MOD-004, MOD-006, MOD-007, MOD-008. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `vendor correction dialogs`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `Endpoint coverage differs by source`. **Gate:** Per-action correction parity incomplete.

**Algorithm / expected output:** Map each action to actual source correction; preserve unsupported actions until contract exists. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-vendors.test.ts` case `MOD-011-F04 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D03,D06

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-011-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.
