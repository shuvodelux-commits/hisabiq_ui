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

---

## 19. Source-verified MOD-003 decision packet — 2026-11-11 (PROPOSED; NO BUILD APPROVAL)

This amendment supplements §§1–18; retain earlier evidence for audit. **Scope:** inventory read, opening stock, signed stock adjustments, lots, provenance, expiry, stock counts, Excel/CSV product and party imports. **Not authorized:** application edits, migrations, database/runtime startup, build reservation, QA-passed claim, merge or deployment. Preserve every current HisabIQ React workflow, bilingual input, mapping, imported-row decision and stock-unit control.

### 19.1 Paired immutable SHAs and evidence level

| Repo and head | Verified 2026-11-11 full SHA | Earlier source baseline / reconciliation |
|---|---|---|
| [hisabiq_ui/main](https://github.com/shuvodelux-commits/hisabiq_ui/tree/2e16821ba622192c69e5f5cc83aba93f70ec0638) | `2e16821ba622192c69e5f5cc83aba93f70ec0638` | Earlier `176bb1a3e8f42eef192ea3098074ac5c8a214261`; GitHub compare = one later documentation change, no `src/` application changes |
| [nestshererp/chore/hisabiq-adoption-runtime-a01](https://github.com/shuvodelux-commits/nestshererp/tree/74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5) | `74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5` | Earlier `1643dac059e568407bba2fff38a990268dfe28fe`; GitHub compare = two later commits without changes to the relevant inventory/import application code |

Reviewed: both AGENTS.md files, master plan, integrate-then-extend plan, REVIEW.md, DECISIONS.md, tasks/EXECUTION.md, existing MOD-003 packet, contracts/{inventory,imports,UI_FIELD_MAPPING}.md, evidence/MOD-003-source-actions.md, SERVICE_INDEX.md, DATABASE_INDEX.md, live React handlers and Nest controllers/application/domain services. **Verification here is source inspection and GitHub diff only**, not an executed browser, PostgreSQL test, endpoint request, independent QA or complete semantic code coverage. Refresh SHA and dependency owner before dispatch.

Representative immutable anchors: [frontend Products handlers](https://github.com/shuvodelux-commits/hisabiq_ui/blob/2e16821ba622192c69e5f5cc83aba93f70ec0638/src/pages/Products.tsx#L230-L325), [adjustment/intake dialogs](https://github.com/shuvodelux-commits/hisabiq_ui/blob/2e16821ba622192c69e5f5cc83aba93f70ec0638/src/components/products/ProductInventoryDialogs.tsx#L338-L524), [import wizard](https://github.com/shuvodelux-commits/hisabiq_ui/blob/2e16821ba622192c69e5f5cc83aba93f70ec0638/src/components/import/ImportWizard.tsx), [inventory controller](https://github.com/shuvodelux-commits/nestshererp/blob/74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5/apps/api/src/inventory/inventory.controller.ts), [inventory service](https://github.com/shuvodelux-commits/nestshererp/blob/74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5/packages/core-application/src/inventory/manage-inventory-service.ts), [stock count service](https://github.com/shuvodelux-commits/nestshererp/blob/74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5/packages/core-application/src/inventory/stock-count-service.ts), [import service](https://github.com/shuvodelux-commits/nestshererp/blob/74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5/packages/core-application/src/imports/import-data-service.ts) and [import column readers](https://github.com/shuvodelux-commits/nestshererp/blob/74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5/packages/core-domain/src/import/templates.ts).

### 19.2 Every active inventory action against actual service ownership

**REUSE** means current backend service is semantically adequate; **ADAPT** means exact UI/DTO and dependency work; **EXTEND** means a contract and owning-service enhancement; **BLOCKED** means no corresponding safe posting yet. Classification does not authorize cutover.

| Existing frontend behavior/source | Actual Nest endpoint → service → repository | Result and disposition |
|---|---|---|
| Product list stock/low/out/status, details stock/value | `GET /api/v1/inventory` → `ManageInventoryService.overview` → `InventoryRepository.listStock/listMovements` | ADAPT reads: stock row is authoritative (`qtyOnHand`, `stockStatus`, optional `valueMinor`); never multiply local `product.stock` by purchasePrice or sum capped movements |
| `Products.openLots`, `StockLotsView` product filter, expiry chips | `GET /api/v1/inventory/lots` → `ManageInventoryService.lots` → `listLots/expirySummary` | REUSE/ADAPT: `productId?`, `expiry?`, `status?`, `cursor?`, `limit` up to 100, sort/direction; preserve owner type and source provenance, hasMore/nextCursor; missing cost fields are not zero |
| `Products.openHistory`, `StockHistoryView` movements/filter | `GET /api/v1/inventory` (`productId/fromDate/toDate/limit`, default 200 max 500) → `ManageInventoryService.overview` → `listMovements` | ADAPT partial list; server movements have `lotId,direction,sourceType,sourceId,sourceNumber,businessDate,createdAt,unitCost?`; complete-history pagination requires EXTEND if UI claims full history |
| Adjustment lists / optional cost history | `GET /api/v1/inventory/adjustments` and `/cost-adjustments` → `ManageInventoryService.adjustments/costAdjustments` | REUSE, filtered bounded read. `PRODUCT_VIEW` for normal history, `COST_VIEW` for cost-adjustments; no client valuation |
| `StockAdjustmentDialog`: Add / Remove / Set exact, reason/note, unit picker; `Products.applyAdjustment` | `POST /api/v1/inventory/adjustments` → `ManageInventoryService.adjustStock/adjustStockWithin` → `InventoryRepository.insertAdjustment` | ADAPT signed qty delta, reason and note; one UOW posts lot changes, balanced journal, audit/outbox. BLOCK stale Set exact and unsupported reason semantics |
| Existing correction/void backend capability | `POST /api/v1/inventory/adjustments/:id/void` → `ManageInventoryService.voidAdjustment` | REUSE stored reversal with `{version,reason}`; do not invent UI action or treat deletion/opposite unsigned local delta as correction |
| New product with initial qty; standalone opening | MOD-002 Product create + `POST /api/v1/inventory/openings`, `GET /inventory/openings/:id` → `ManageInventoryService.recordOpening/recordOpeningWithin/opening` → `insertOpening` | Existing-product single opening REUSE/ADAPT; combined create+opening BLOCKED until one atomic composed service. One opening per product, source-linked Opening Equity journal |
| `StockLotDialog` Add Lot; `Products.addLot` purchase ref, cost, batch, manufacture, expiry and pasted serials | **No generic create-lot endpoint verified**; real purchase/receipt/opening source owns lot and cost | BLOCKED. A fabricated Purchase movement or arbitrary adjustment loses provenance. Coordinate MOD-008 purchases/MOD-013 serial intake; do not remove dialog |
| Lot expiry edit / missing-expiry remediation | `PUT /api/v1/inventory/lots/:id/expiry` → `ManageInventoryService.setLotExpiry` → `setLotExpiry` + audit, HTTP 204 | Backend REUSE, frontend ADAPT only where actual corresponding edit exists. Product must track expiry for non-null date; no version/mfg-date field currently |
| Shelf count list and multi-line posting | `GET /api/v1/stock-counts`, `POST /api/v1/stock-counts` → `StockCountService.list/post` → `ManageInventoryService.adjustStockWithin`/`StockCountRepository.insertCount` | REUSE owner UOW and moved-stock validation. **No active HisabIQ count-sheet UI verified** from source; Set exact is *not* a count sheet. BLOCK cutover until UI owner and cost permission fixed |
| Excel/CSV Upload → Map → Review → Finish for products | `POST /api/v1/imports/preview`, `POST /api/v1/imports` → `ImportDataService.preview/commit` → `ManageProductsService.createWithin` | REUSE create-only canonical CSV subset; ADAPT Excel client parsing, strict headers and errors. UI rich import/update/skip/opening not compatible until EXTEND |
| CSV opening stock for already-existing product | Same import routes `type:OPENING_STOCK` → `ImportDataService.evaluateOpeningStock` → `ManageInventoryService.recordOpeningWithin` | REUSE separate base-unit import within one UOW; cannot represent combined new product+opening until atomic extension |
| Customer/supplier import decisions and legacy party CSV dialog | Same import routes `CUSTOMERS/SUPPLIERS` → `ManagePartiesService.createWithin`; `src/import/partyImport.ts`, `src/components/parties/PartyImportDialog.tsx` | Backend create-only. MOD-003 owns common CSV transport, MOD-004 owns party roles/opening ledger and legacy dialog. Preserve both frontend paths; no file ownership takeover |

**Important active-preview distinction:** `Products.applyAdjustment` changes `list`, locally allocates/depletes `lots`, fabricates IDs/ADJ references, appends movements and toasts; `Products.addLot` fabricates a Purchase lot/movement; `AddProductDialog` save fabricates an opening lot; `commitProductImportPreview` updates an in-memory store. These are preview-only and **not** evidence of posted backend stock. Connected success requires owning service response plus inventory/lot/history refresh; failed/unknown POST keeps the draft, operation identity and source selection. Never recompute stock from a subset of lots or movements.

### 19.3 Exact field/action conversions and permission handling

| UI concept | Existing backend contract | Exact mapping, blocked fields and rules |
|---|---|---|
| Product ID/unit | `productId` ULID, backend `baseUnitName`; backend stock `qtyOnHand` integer scale 3 | MOD-002 must provide real stable product/unit IDs and versioned unit chain. `2.500` base qty → `2500` scale3 exactly; no binary-floating rounding. `2 Box 5 Pcs` at 10 Pcs/Box → `25000`. Multilevel conversions and independent per-unit prices are not current backend parity |
| Current stock, stock value, status | `InventoryStockRow.qtyOnHand`, `stockStatus`, optional `valueMinor` | Server only. Do not post UI stock field on product save, derive from purchasePrice, or interpret omitted cost as zero |
| Opening qty, business date, expiry | `recordOpeningStockRequestSchema` `{productId,qty:int positive,businessDate?,expiryDate:date|null}` plus 26-character `Idempotency-Key` | Manual API uses product purchase price, default location, one opening per product. No manual explicit unit cost, batch number, mfg date, serial array, purchase reference or source/location selector |
| Adjustment Add/Remove | `adjustStockRequestSchema` `{productId,qtyDelta:int signed,reason:enum,note:string|null,businessDate?}` + 26-character key | Add positive, Remove negative, zero refused, no negative overdraft even where POS negative sales allowed; server FIFO lot issue and exact value movement; response `qtyOnHandAfter,valueMinor?` |
| Adjustment Set exact | No standalone atomic set-absolute DTO | UI delta from `product.stock` unsafe if stale. Proposal: compare-and-swap `expectedStockVersion`/live stock or server-side count-like adjustment under same lock. No blind POST of stale local delta |
| Adjustment reason labels | `DAMAGE`, `RECOUNT`, `THEFT_LOSS`, `OTHER` (`OTHER` requires note) | “Count correction”→`RECOUNT`; actual physical damage→`DAMAGE`; theft/loss→`THEFT_LOSS`; “Other”→`OTHER`+note. “Damage / loss” is ambiguous; “Found stock”, “Personal use”, “Data correction” need explicit additive reasons or documented distinct mapping, not unreviewed coercion |
| Lot details | `id,productId,locationId,ownerType,sourceType,sourceId,sourceNumber,qtyReceived,qtyRemaining,expiryDate,businessDate,status` | Preserve source/owner/lot IDs, real received/remaining qty (scale3), nullable expiry and backend FIFO/AVERAGE valuation method. UI `reference/batchNumber/manufactureDate/serials/lot selling price` lack current generic create-lot roundtrip |
| Lot/stock/movement cost | Backend `purchaseUnitCost?`, `actualUnitCost?`, `landedCostTotal?`, `valueMinor?`, `unitCost?` | Redact absent `COST_VIEW`, never fill with 0; backend lot valuation may omit value under AVERAGE. `COST_VIEW` for `/inventory/cost-adjustments`; `PRODUCT_VIEW` for overview/adjustments and `INVENTORY_LOT_VIEW` for lots |
| Expiry update | `PUT /inventory/lots/:id/expiry` body `{expiryDate:YYYY-MM-DD|null}`, response 204 | `PRODUCT_EDIT` permission, `tracksExpiry` requirement, audited change. No version/concurrency precondition or manufacture-date validation supplied by current DTO |
| Stock-count sheet | `{scopeLabel?,note?,lines:[{productId,countedQty:int>=0,systemQty:int}],businessDate?,backdateReason?,acceptMoved?}` with 26-character key | 1..2000 lines; `systemQty` captured from server at count time, server reads live again; `movedProductIds` if changed; explicit `acceptMoved` after user sees conflict; backdate needs `PERIOD_BACKDATE` and reason |
| Import request/preview | `{type:PRODUCTS|CUSTOMERS|SUPPLIERS|OPENING_STOCK,csv:string}`; `{data:{columns,rows:[{rowNumber,values,errors:[{column,message}]}],totalRows,validRows,invalidRows,missingColumns}}` | CSV text <=2M chars and <=2000 rows; source physical row number and backend **column header** must map to UI source sheet/row/field. Missing columns are file-level errors; `Row` errors remain visible |
| Import commit/result | Same `{type,csv}` + 26-character key → `{data:{type,rows,imported}}` | ALL rows or none, one tenant UOW; counts for master updates/skips/roles/opening lots are **not** present, so don't invent a “success” result |

**Business posting:** `recordOpeningWithin`, `adjustStockWithin`, `StockCountService.post` and importer calls to `ManageProductsService.createWithin`/`ManagePartiesService.createWithin` are sole writers. Keep period guard, tenant isolation, idempotency, source document/movement/lot identities, journals, audit/outbox and exact cost allocation. Non-cash opening stock/count/adjustments **do not require** active cash sessions under confirmed policy. Repository serializability, RLS and concurrent posting are **NOT runtime-verified** in this read-only packet.

### 19.4 Excel/CSV field inventory and complete preview→commit trace

Frontend source: `src/components/import/{ImportWizard,ImportUploadStep,ImportMappingStep,ImportReviewStep,ImportFinishStep}.tsx`, `src/import/{fileReader,columnMapping,fieldSchemas,importTemplates,importTypes,productImport,partyImport,safeXlsx}.ts`. UI supports XLSX multiple sheets (select one), CSV, Bangla aliases, editable column mapping, row editing/errors, search/filter, duplicate handling, create/update-master/skip/add-role/reject decisions, error CSV download, and up to **5,000** UI-preview rows; backend supports CSV **2,000** rows and only strict create types. Backend CSV parser handles BOM, CRLF/quoted cells; names and master lookups resolve inside tenant and unknown units/brands/categories/groups are **rejected**, not auto-created.

| Import type | Compatible UI field → exact backend template header | Incompatible or ambiguous |
|---|---|---|
| `PRODUCTS` required | `name`→`Product Name`; `baseUnit`→`Base Unit`; `purchasePrice`→`Purchase Price`; `sellingPrice`→`Selling Price`; `minimumStock`→`Reorder Level` | Prices must be in **base unit** and representable in integer poisha; `minimumStock` base units. `purchasePriceUnit`/`sellingPriceUnit` cannot be discarded |
| `PRODUCTS` optional | `brand`→`Brand`; `category`→`Category`; `sku`→`Product Code` **only if explicitly SKU** | Backend also `Subcategory`, `Barcode`, `Description`, which current UI does not separately map; UI `sku` label “SKU / Barcode” must not silently become two backend identities |
| `CUSTOMERS` | `name`→`Customer Name`; `phone`→`Phone`; `area`→`Address` | Backend additionally supports Guardian, NID, Email, Customer Group, Credit Limit, Notes by explicit mapping. UI `nameBn`, partyId, openingAmount/direction/date/note not representable in this import |
| `SUPPLIERS` | `name`→`Supplier Name`; `phone`→`Phone`; `area`→`Address` | Backend Email/Notes need mapped fields. Backend does not add roles to existing party or record historical payable in this import |
| `OPENING_STOCK` (separate file) | UI product name/SKU when verified → `Product Name`/`Product Code`; openingStock→`Quantity`; openingUnitCost→`Unit Cost`; openingDate→`Opening Date`; expiryDate→`Expiry Date` | Existing product must resolve uniquely; openingStockUnit/openingCostUnit require exact MOD-002 conversion, not naive unit text. Cannot combine new product create with opening in one current CSV request |

**No nonblank field is silently dropped:** product `nameBn,kind,largeUnit,conversionFactor,stockViewUnit,purchasePriceUnit,sellingPriceUnit,largeUnitSellingPrice,minimumStockUnit,openingStock,openingStockUnit,openingDate,openingUnitCost,openingCostUnit,batchNumber,manufactureDate,expiryDate,serialTracking,serialNumbers,warrantyDuration,warrantyDurationUnit,warrantyType`; party `nameBn,partyId,openingAmount,openingDirection,openingDate,openingNote`, plus unsupported roles. Optional **blank** values need no extension. Retain original UI templates and full fields even when connected imports are blocked for nonblank unsupported fields.

**Deterministic proposed workflow (no current code claim):**

1. **Upload/worksheet:** retain existing .xlsx reader and CSV parser, source filename, chosen worksheet, physical row numbers and original cells; no XLSX bytes to backend CSV-only endpoint. Check server limits before connected preview, do not truncate 5,000 to 2,000 without a user-visible split.
2. **Mapping:** preserve user-selected bilingual aliases/column indexes and chosen sheet; normalize to backend canonical header names with safe CSV quoting; include only fields actually mapped and representable, report all **nonblank** unsupported fields as blocking named errors.
3. **Preview:** `POST /imports/preview` with frozen `{type,csv}`; backend supplies `missingColumns`, server `columns`, every row's `rowNumber/values/errors`; map header errors to original field and source sheet, keep backend `Row` errors. Existing backend detects in-file duplicate SKU/barcode, customer phone and opening product, and resolves names within tenant.
4. **Decision/re-preview:** UI row editing, skip/reject, update-master and add-role must invalidate a previous preview. Current backend can only commit **create-only all-valid rows**; skip/update/add-role need an explicit plan/request contract and stable original row identity, rather than silently filtering changed CSV without preserving the error-row mapping.
5. **Commit:** freeze exact previewed CSV bytes, tenant, selected sheet, final decisions and a stable **26-character ULID** (current wizard creates a 36-character randomUUID, not compatible). Commit identical `{type,csv}` and idempotency key; revalidate inside one transaction, write through owning `createWithin/recordOpeningWithin`, audit/outbox only on committed success; preserve same key and bytes after timeout.
6. **Finish/recovery:** server-confirmed response only; refresh authoritative stock/products/lots/parties, not preview mutations. If commit fails or outcome unknown, keep all drafts, source row edits, skip choices, original error download and operation identity. Current response only `rows/imported`: cannot synthesize UI finish metrics `created,masterUpdated,roleAdded,openingSources,openingLots,skipped,rejected`.

**Existing backend preview gap:** `ImportDataService.evaluateOpeningStock` validates CSV syntax/identity/same-file duplicates but does **not** call the opening-service period/one-opening/expiry/valuation checks before marking row clean; a deterministic “valid” preview can therefore fail on commit. Existing commit is atomic as intended, but this preview/commit equivalence requires amendment.

### 19.5 Exact proposed amendments / blockers (NOT APPROVED FOR IMPLEMENTATION)

| ID / severity | Source finding | Proposed amendment, required owner/gate |
|---|---|---|
| C003-01 / P0 | `ImportDataService.commit` fingerprint is `JSON.stringify([type,csv.length])` so different equal-length CSVs under same key can be misclassified as identical; preview and commit not cryptographically bound | Fingerprint full canonical content + type/tenant/decisions; reject same-key changed bytes even if equal length. Define preview digest/epoch or immutable content token, exact expiry/idempotent replay semantics. Use MOD-000 ULID identity; do not invent endpoint before approval |
| C003-02 / P0 | Opening preview resolves identity but not all `recordOpeningWithin` constraints | Extract *read-only* owning opening validation: existing opening, period/future date, positive cost/value, expiry, product status, permissions, tenant; run in preview and again in serialized commit transaction. Return per-cell/row errors; preview creates no stock/journal |
| C003-03 / P0 | Frontend duplicate decisions, skip/update-master/add-role, rich product fields, integrated opening and result counts exceed create-only fixed CSV import | Propose typed per-row actions, immutable original sheet/row identity, collision policy, plan hash, errors, action-count result and owner-service commands. Import all-or-nothing; no client chain of product create + stock + party opening. Coordinate MOD-002 and MOD-004 before DTO/schema detail approval |
| C003-04 / P0 | Product+opening currently previewed together but real product POST + opening POST would be two independent transactions | Compose `ManageProductsService.createWithin` + `ManageInventoryService.recordOpeningWithin` inside one existing UOW/operation; validate product, exact unit/cost snapshot and opening, audit+outbox; rollback both or create neither. MOD-002 owns product master; MOD-003 owns inventory document |
| C003-05 / P0 | No generic source-linked lot intake; UI supports purchase ref, explicit cost, batch/mfg, expiry, serials; expiry PUT lacks stale version guard | Reuse source-owned purchase/receiving writer (MOD-008), serial service (MOD-013), or design a **separately approved** MANUAL_RECEIPT document with real provenance; one transaction. Preserve lot cost/ownership and optional serial. For expiry edits propose version/If-Match and mfg policy after requirements |
| C003-06 / P0 | Unit chain/independent unit prices not in backend single conversion; Set exact computes from locally cached product.stock | MOD-002 ordered stable unit IDs/exact rational scale conversion and immutable unit-price snapshots. Reject non-representable scale3 quantity/poisha price rather than rounding. Set exact must compare server stock/version and calculate within lock/UOW or show conflict |
| C003-07 / P0 review | `StockCountService.post` uses cost-filtered `adjustStockWithin(...).valueMinor ?? 0` to persist count cost totals, potentially causing zero accounting metadata without `COST_VIEW`; `list/detail` expose `shortageValueMinor/surplusValueMinor/line.valueMinor` with `STOCK_COUNT_POST` but no `COST_VIEW` response gate | Internal owning service must provide unredacted transaction cost **only internally**; public stock-count response must omit cost fields without COST_VIEW (schema optionality amended). Source-level risk **not reproduced in runtime**; verify with differential permissions tests before live counts |
| C003-08 / P1 | Six UI reasons vs backend four; movement list capped; lot expiry not versioned; current purchase/lot source data richer | Decide separate Found/Personal use/Data correction semantics or additive reasons; full history cursor if needed; versioned expiry where appropriate; no negative-stock-writeoff policy copied from POS. Define explicit accounting/lock/tenant/permission tests before release |

These entries are **proposals**, not permission to pick hidden business policy, invent API paths, change ledger posting, reserve a migration or redact a field at the frontend only. D03/D04/D06 and existing owning services remain authoritative pending approvals. Current code is not proved broken in a running stack; security/cost observations are **source-level risks**.

### 19.6 Dependencies, file allowlists and execution boundary

**MOD-002 owns:** product create/edit and source IDs, catalog names/IDs, multi-level units and per-unit prices, shared Add Product form, product-kind/serial/expiry policy, version/read-model contracts. MOD-003 does not take these files: `src/components/products/AddProductDialog.tsx`, `src/components/products/form
