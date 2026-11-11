# MOD-003 — Inventory, opening stock, adjustments, lots and imports

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000, MOD-002. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-003-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/components/products/ProductInventoryDialogs.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L1)
- [src/components/products/ProductInventoryViews.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L1)
- [src/data/productImportPreviewStore.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productImportPreviewStore.ts#L1)
- [src/data/productInventory.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productInventory.ts#L1)
- [src/import/columnMapping.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/columnMapping.ts#L1)
- [src/import/fieldSchemas.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/fieldSchemas.ts#L1)
- [src/import/fileReader.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/fileReader.ts#L1)
- [src/import/importTemplates.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/importTemplates.ts#L1)
- [src/import/importTypes.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/importTypes.ts#L1)
- [src/import/partyImport.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/partyImport.ts#L1)
- [src/import/productImport.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/productImport.ts#L1)
- [src/import/safeXlsx.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/import/safeXlsx.ts#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `POST /api/v1/imports/preview` | [ImportsController.preview](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/imports/imports.controller.ts#L20) | `importRequestSchema` | `{ data: ImportPreviewResponse }` | `ImportDataService.preview` |
| `POST /api/v1/imports` | [ImportsController.commit](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/imports/imports.controller.ts#L32) | `importRequestSchema` | `{ data: ImportResultResponse }` | `ImportDataService.commit` |
| `GET /api/v1/inventory/lots` | [InventoryLotsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/inventory-lots.controller.ts#L19) | `inventoryLotsQuerySchema` | `{ data: InventoryLotPage }` | `ManageInventoryService.lots` |
| `PUT /api/v1/inventory/lots/:id/expiry` | [InventoryLotsController.setExpiry](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/inventory-lots.controller.ts#L33) | `setLotExpiryRequestSchema` | `void` | `ManageInventoryService.setLotExpiry` |
| `GET /api/v1/inventory/valuation` | [InventoryValuationController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/inventory-valuation.controller.ts#L13) | Inline / no body; linked method | `{ data: InventoryValuationResponse }` | `ManageInventoryService.valuation` |
| `GET /api/v1/inventory` | [InventoryController.overview](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/inventory.controller.ts#L23) | `inventoryReportQuerySchema` | `{ data: InventoryOverviewResponse }` | `ManageInventoryService.overview` |
| `GET /api/v1/inventory/adjustments` | [InventoryController.adjustments](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/inventory.controller.ts#L30) | `inventoryReportQuerySchema` | `{ data: readonly StockAdjustmentRow[] }` | `ManageInventoryService.adjustments` |
| `GET /api/v1/inventory/cost-adjustments` | [InventoryController.costAdjustments](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/inventory.controller.ts#L37) | `inventoryReportQuerySchema` | `{ data: readonly CostAdjustmentRow[] }` | `ManageInventoryService.costAdjustments` |
| `POST /api/v1/inventory/adjustments` | [InventoryController.adjust](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/inventory.controller.ts#L44) | `adjustStockRequestSchema` | `{ data: StockAdjustmentResponse }` | `ManageInventoryService.adjustStock` |
| `GET /api/v1/inventory/openings/:id` | [InventoryController.openingDetail](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/inventory.controller.ts#L51) | Inline / no body; linked method | `{ data: OpeningStockResponse }` | `ManageInventoryService.opening` |
| `POST /api/v1/inventory/openings` | [InventoryController.opening](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/inventory.controller.ts#L57) | `recordOpeningStockRequestSchema` | `{ data: OpeningStockResponse }` | `ManageInventoryService.recordOpening` |
| `POST /api/v1/inventory/adjustments/:id/void` | [InventoryController.voidAdjustment](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/inventory.controller.ts#L68) | `voidDocumentRequestSchema` | `{ data: { ok: true } }` | `ManageInventoryService.voidAdjustment` |
| `GET /api/v1/stock-counts` | [StockCountsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/stock-counts.controller.ts#L20) | Inline / no body; linked method | `{ data: readonly StockCountResponse[] }` | `StockCountService.list` |
| `POST /api/v1/stock-counts` | [StockCountsController.post](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/inventory/stock-counts.controller.ts#L29) | `postStockCountRequestSchema` | `{ data: StockCountResponse }` | `StockCountService.post` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-003-F01 | Read stock, lots, movements and adjustment history — `ProductInventoryViews; stockLots` | ADAPT | inventory; inventory/lots; inventory/adjustments | Read server quantity and cost permission; no local stock recomputation from partial pages. | Readonly cutover only after product IDs |
| MOD-003-F02 | Opening and stock adjustment — `ProductInventoryDialogs` | ADAPT | inventory/openings; inventory/adjustments | ManageInventoryService.recordOpening/adjustStock are sole writers; each opening is one per product. | Atomic create+opening contract unresolved |
| MOD-003-F03 | Count sheet and expiry updates — `Inventory dialogs` | ADAPT | stock-counts; inventory/lots/:id/expiry | Keep expiry validations and source linkage; count posts all deltas in one UOW. | UI trace NOT VERIFIED for stock count |
| MOD-003-F04 | Excel/CSV product and party import — `productImportPreviewStore; import wizard` | EXTEND | imports/preview; imports | Backend guided CSV is preview then whole-file atomic commit; preserve Excel parsing/mapping and per-cell errors. | Template/duplicate policy mapping incomplete |

## 5. Proposed architecture and unresolved approval

ImportDataService reuses ManageProductsService.createWithin, ManagePartiesService.createWithin and ManageInventoryService.recordOpeningWithin. Preview must write zero rows. Upload/import is not restore. Exact UI workbook columns need mapping to backend IMPORT_COLUMNS, including Bengali/unit fields; mark unsupported rows before confirm rather than drop cells.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D03,D04,D06.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [inventory fields](../contracts/inventory.md)
- [imports fields](../contracts/imports.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/inventory-imports.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/components/products/ProductInventoryDialogs.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/components/products/ProductInventoryViews.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/productImportPreviewStore.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/productInventory.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/inventory-imports.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-inventory-imports.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-inventory-imports-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-003-T01: Read stock, lots, movements and adjustment history

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-002. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `ProductInventoryViews; stockLots`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `inventory; inventory/lots; inventory/adjustments`. **Gate:** Readonly cutover only after product IDs.

**Algorithm / expected output:** Read server quantity and cost permission; no local stock recomputation from partial pages. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-inventory-imports.test.ts` case `MOD-003-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-003-T02: Opening and stock adjustment

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-002. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `ProductInventoryDialogs`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `inventory/openings; inventory/adjustments`. **Gate:** Atomic create+opening contract unresolved.

**Algorithm / expected output:** ManageInventoryService.recordOpening/adjustStock are sole writers; each opening is one per product. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-inventory-imports.test.ts` case `MOD-003-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-003-T03: Count sheet and expiry updates

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-002. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Inventory dialogs`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `stock-counts; inventory/lots/:id/expiry`. **Gate:** UI trace NOT VERIFIED for stock count.

**Algorithm / expected output:** Keep expiry validations and source linkage; count posts all deltas in one UOW. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-inventory-imports.test.ts` case `MOD-003-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-003-T04: Excel/CSV product and party import

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-002. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `productImportPreviewStore; import wizard`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `imports/preview; imports`. **Gate:** Template/duplicate policy mapping incomplete.

**Algorithm / expected output:** Backend guided CSV is preview then whole-file atomic commit; preserve Excel parsing/mapping and per-cell errors. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-inventory-imports.test.ts` case `MOD-003-F04 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D03,D04,D06

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-003-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.
