# MOD-002 — Products, units, categories, brands, prices and offers

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000, MOD-001. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-002-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/components/products/AddProductDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/AddProductDialog.tsx#L1)
- [src/components/products/BundleEditor.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/BundleEditor.tsx#L1)
- [src/components/products/PhotoUploader.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/PhotoUploader.tsx#L1)
- [src/components/products/ProductInventoryDialogs.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryDialogs.tsx#L1)
- [src/components/products/ProductInventoryViews.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductInventoryViews.tsx#L1)
- [src/components/products/ProductSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/ProductSettings.tsx#L1)
- [src/components/products/fields/Disclosure.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/Disclosure.tsx#L1)
- [src/components/products/fields/FieldMessage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/FieldMessage.tsx#L1)
- [src/components/products/fields/FormField.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/FormField.tsx#L1)
- [src/components/products/fields/KindToggle.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/KindToggle.tsx#L1)
- [src/components/products/fields/LabelText.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/LabelText.tsx#L1)
- [src/components/products/fields/SectionHeading.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/SectionHeading.tsx#L1)
- [src/components/products/fields/SegmentedControl.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/SegmentedControl.tsx#L1)
- [src/components/products/fields/ToggleRow.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/fields/ToggleRow.tsx#L1)
- [src/components/products/form/ActionBar.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ActionBar.tsx#L1)
- [src/components/products/form/AddProductForm.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/AddProductForm.tsx#L1)
- [src/components/products/form/AdvancedStockPanel.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/AdvancedStockPanel.tsx#L1)
- [src/components/products/form/DiscardDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/DiscardDialog.tsx#L1)
- [src/components/products/form/ErrorSummary.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ErrorSummary.tsx#L1)
- [src/components/products/form/ExpirySettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ExpirySettings.tsx#L1)
- [src/components/products/form/OtherOptionsPanel.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/OtherOptionsPanel.tsx#L1)
- [src/components/products/form/PriceStockSection.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/PriceStockSection.tsx#L1)
- [src/components/products/form/ProductDetailsSection.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/ProductDetailsSection.tsx#L1)
- [src/components/products/form/SerialSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/SerialSettings.tsx#L1)
- [src/components/products/form/UnitPricesPanel.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/UnitPricesPanel.tsx#L1)
- [src/components/products/form/WarrantySettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/WarrantySettings.tsx#L1)
- [src/components/products/form/useAddProductForm.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/products/form/useAddProductForm.ts#L1)
- [src/data/productFormOptions.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productFormOptions.ts#L1)
- [src/data/productOffers.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productOffers.ts#L1)
- [src/data/productUnits.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/productUnits.ts#L1)
- [src/data/products.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/products.ts#L1)
- [src/pages/Products.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Products.tsx#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/catalog` | [CatalogController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/catalog.controller.ts#L33) | Inline / no body; linked method | `{ data: CatalogResponse }` | `ManageCatalogService.list` |
| `POST /api/v1/catalog/units` | [CatalogController.createUnit](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/catalog.controller.ts#L38) | `saveUnitRequestSchema` | `{ data: CatalogResponse }` | `ManageCatalogService.createUnit` |
| `PATCH /api/v1/catalog/units/:id` | [CatalogController.renameUnit](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/catalog.controller.ts#L48) | `saveUnitRequestSchema` | `{ data: CatalogResponse }` | `ManageCatalogService.renameUnit` |
| `POST /api/v1/catalog/units/:id/remove` | [CatalogController.removeUnit](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/catalog.controller.ts#L59) | Inline / no body; linked method | `{ data: RemoveCatalogEntryResponse }` | `ManageCatalogService.removeUnit` |
| `POST /api/v1/catalog/brands` | [CatalogController.createBrand](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/catalog.controller.ts#L68) | `saveBrandRequestSchema` | `{ data: CatalogResponse }` | `ManageCatalogService.createBrand` |
| `PATCH /api/v1/catalog/brands/:id` | [CatalogController.renameBrand](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/catalog.controller.ts#L78) | `saveBrandRequestSchema` | `{ data: CatalogResponse }` | `ManageCatalogService.renameBrand` |
| `POST /api/v1/catalog/brands/:id/remove` | [CatalogController.removeBrand](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/catalog.controller.ts#L89) | Inline / no body; linked method | `{ data: RemoveCatalogEntryResponse }` | `ManageCatalogService.removeBrand` |
| `POST /api/v1/catalog/categories` | [CatalogController.createCategory](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/catalog.controller.ts#L98) | `createCategoryRequestSchema` | `{ data: CatalogResponse }` | `ManageCatalogService.createCategory` |
| `PATCH /api/v1/catalog/categories/:id` | [CatalogController.renameCategory](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/catalog.controller.ts#L108) | `renameCategoryRequestSchema` | `{ data: CatalogResponse }` | `ManageCatalogService.renameCategory` |
| `POST /api/v1/catalog/categories/:id/remove` | [CatalogController.removeCategory](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/catalog.controller.ts#L119) | Inline / no body; linked method | `{ data: RemoveCatalogEntryResponse }` | `ManageCatalogService.removeCategory` |
| `GET /api/v1/products` | [ProductsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/products.controller.ts#L53) | `productQuerySchema` | `ProductListResponse` | `ManageProductsService.list` |
| `GET /api/v1/products/:id` | [ProductsController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/products.controller.ts#L66) | Inline / no body; linked method | `{ data: ProductResponse }` | `ManageProductsService.get` |
| `POST /api/v1/products` | [ProductsController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/products.controller.ts#L74) | `saveProductRequestSchema` | `{ data: ProductResponse }` | `ManageProductsService.create` |
| `PATCH /api/v1/products/:id` | [ProductsController.update](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/products.controller.ts#L95) | `updateProductRequestSchema` | `{ data: ProductResponse }` | `ManageProductsService.update` |
| `POST /api/v1/products/:id/status` | [ProductsController.setStatus](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/products.controller.ts#L109) | `setProductStatusRequestSchema` | `{ data: ProductResponse }` | `ManageProductsService.setStatus` |
| `POST /api/v1/products/:id/barcode` | [ProductsController.generateBarcode](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/products.controller.ts#L121) | Inline / no body; linked method | `{ data: GeneratedBarcodeResponse }` | `ManageProductsService.generateBarcode` |
| `DELETE /api/v1/products/:id` | [ProductsController.remove](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/products.controller.ts#L134) | Inline / no body; linked method | `void` | `ManageProductsService.deleteProduct` |
| `GET /api/v1/products/:id/image` | [ProductsController.image](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/products.controller.ts#L148) | Inline / no body; linked method | `void` | `ManageProductsService.image` |
| `POST /api/v1/products/:id/image` | [ProductsController.saveImage](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/products.controller.ts#L162) | `saveProductImageRequestSchema` | `{ data: ProductResponse }` | `ManageProductsService.saveImage` |
| `DELETE /api/v1/products/:id/image` | [ProductsController.removeImage](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/catalog/products.controller.ts#L174) | Inline / no body; linked method | `{ data: ProductResponse }` | `ManageProductsService.saveImage` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-002-F01 | List/search/filter/status/barcode/image — `Products; availableProducts` | ADAPT | products; products/:id/status; :id/barcode; :id/image | Use response summary/keyset page and cost omission; map IDs rather than names. | CAT-READ |
| MOD-002-F02 | Product create/edit and multi-unit form — `useAddProductForm.save` | EXTEND | POST/PATCH products | All Product fields need a persistent mapping; single-conversion adapter is not four-unit parity. | D03/D04 |
| MOD-002-F03 | Inline category/brand/unit create and edit — `useAddProductForm.createUnit/editUnit` | EXTEND | catalog units/brands/categories | Preserve parent form and keyboard; nameBn/symbol require backend addition. | D03 |
| MOD-002-F04 | Offers, serial mode, warranty, expiry and lot price policy — `ProductOffers; Product feature editors` | EXTEND | products SaveProductRequest | One backend product offer is not a list of scheduled offers; optional serial mode is not a boolean. | D04/D16 |

## 5. Proposed architecture and unresolved approval

Use CAT-READ/CAT-SAVE and UI_FIELD_MAPPING. Backend update requires version and full SaveProductRequest. Snapshot historical unit wording and conversions. Do not implement service/bundle products as ordinary stocked products merely because they share a frontend Product type.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D03,D04,D16.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [products fields](../contracts/products.md)
- [catalog fields](../contracts/catalog.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/products-catalog.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/data/productFormOptions.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/productOffers.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/productUnits.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/products.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/Products.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/products-catalog.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-products-catalog.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-products-catalog-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-002-T01: List/search/filter/status/barcode/image

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Products; availableProducts`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `products; products/:id/status; :id/barcode; :id/image`. **Gate:** CAT-READ.

**Algorithm / expected output:** Use response summary/keyset page and cost omission; map IDs rather than names. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-products-catalog.test.ts` case `MOD-002-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-002-T02: Product create/edit and multi-unit form

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `useAddProductForm.save`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `POST/PATCH products`. **Gate:** D03/D04.

**Algorithm / expected output:** All Product fields need a persistent mapping; single-conversion adapter is not four-unit parity. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-products-catalog.test.ts` case `MOD-002-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-002-T03: Inline category/brand/unit create and edit

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `useAddProductForm.createUnit/editUnit`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `catalog units/brands/categories`. **Gate:** D03.

**Algorithm / expected output:** Preserve parent form and keyboard; nameBn/symbol require backend addition. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-products-catalog.test.ts` case `MOD-002-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-002-T04: Offers, serial mode, warranty, expiry and lot price policy

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `ProductOffers; Product feature editors`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `products SaveProductRequest`. **Gate:** D04/D16.

**Algorithm / expected output:** One backend product offer is not a list of scheduled offers; optional serial mode is not a boolean. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-products-catalog.test.ts` case `MOD-002-F04 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D03,D04,D16

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-002-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.

---

## 19. Revision 4: current-head MOD-002 integration amendment — PROPOSED, not build-approved

**Authority and scope (2026-11-11).** This source-checked amendment is the detailed successor to the broad inventory/tasks above, not an implementation authorization. Read ``1–18, the master and staged plans, REVIEW, EXECUTION, CORE_WORKFLOWS, UI_FIELD_MAPPING, EXTENSIONS and VERIFICATION. When a generic task above implies that a narrower feature is ready, the explicit gates and dependencies here take precedence. Do not edit application code or shared contracts under this packet. No migration number, build slot or issue has been assigned; no actual integration tests have been run.

### 19.1. Verified exact SHA pair and source references

| Source | Current checked head | Previously pinned app-code baseline | Comparison |
|---|---|---|---|
| `hisabiq_ui` main | `2e16821ba622192c69e5f5cc83aba93f70ec0638` | `176bb1a3e8f42eef192ea3098074ac5c8a214261` | New main merge publishes integration documentation; audited product source retains pinned application shape |
| `nestshererp` `chore/hisabiq-adoption-runtime-a01` | `74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5` | `1643dac059e568407bba2fff38a990268dfe28fe` | Branch is two commits ahead of pinned baseline; comparison reports only `AGENTS.md` changed |

Inspected frontend evidence: `src/types/{erp,productForm}.ts`, `src/components/products/{ProductSettings,ProductInventoryDialogs}.tsx`, `src/components/products/form/{useAddProductForm,UnitPricesPanel}.tsx`, `src/data/{erpDemoStore,productUnits,productOffers}.ts`, `src/utils/{unitChain,productDraft,multiUnitTransactions,posMultiUnit,posQuantity,lotSellingPrice,productFeatures}.ts`, `src/components/pos/CartTable.tsx` and `src/pages/Products.tsx`. Inspected backend evidence: `packages/core-contracts/src/{catalog,products}.ts`, `packages/core-application/src/catalog/{manage-catalog-service,manage-products-service,catalog-repository,product-repository}.ts`, and `packages/adapter-postgres/src/schema.ts`; the existing `apps/api/src/catalog/{catalog,products}.controller.ts` routes are indexed in `3. Source trace links in ``2–3 and linked evidence remain pinned to the unchanged application SHAs. Any future app-code change requires a new compare and plan revalidation.

### 19.2. Twelve-sentence owner-facing comparison

1. The existing HisabIQ product workflow includes compact listing, full-page create/edit, nested master management, multilingual names, multi-unit pricing, serials, warranty, expiry, lots and multiple offers.
2. NestSherERP already has compatible catalog/product listing, search, basic create/update, status changes, barcode generation and single-image CRUD.
3. Those reads and compatible master operations should integrate first through named adapters while all existing React layout, shortcuts and dialogs remain.
4. Inline category/brand/unit creation and editing must preserve parent drafts, selected master identity, hover/focus controls and keyboard behavior.
5. Backend catalog metadata needs additive Bengali-name and short-symbol fields, including consideration of existing Bengali category/brand editing.
6. Backend product input presently supports one alternate conversion and integer-poisha base-unit prices, not an ordered unit chain with separate unit-level buy/sell prices.
7. A versioned unit profile with stable IDs, exact rational factors and independently priced unit entries is therefore required.
8. Current multilevel carts add separately entered unit components at their respective prices, while current two-unit compound carts prorate the remainder from the selected price.
9. Both algorithms must be represented explicitly in the future server contract without removing the one-line compact quantity editor.
10. Posting must freeze unit labels, conversions, entered components, negotiated rates, applied offers, lot allocations and monetary rounding outcomes against future master changes.
11. Lot price overrides, optional serial mode, detailed warranty/expiry rules, galleries and scheduled offers are extension requirements rather than fields silently discarded by an adapter.
12. Implementation is blocked until the owner accepts this design, MOD-000/MOD-001 dependencies reach accepted heads and the coordinator reserves one build worker with a file allowlist.

### 19.3. Actual Stage A reuse (not a claim of full Product UI parity)

| UI behavior and current source | Exact current API / service | What is safely compatible | Hold or caveat |
|---|---|---|---|
| Product list/search/filter, `Products.tsx` | `GET /api/v1/products` → `ManageProductsService.list` | `search,brandId,categoryId,status,cursor,limit,sort,direction`; `{data,page,summary}`, nextCursor pagination; server-derived stock and counts | UI's local fuzzy/stock filters and multi-unit labels must not be misrepresented as server-equivalent filtering; keep honest client view until exact filter contract |
| Product detail | `GET /api/v1/products/:id` → `get` | Server ULID, version, status, basic fields | `purchasePriceMinor` and `stockValueMinor` may be **absent** for users without `inventory.cost.view`; never display zero as substitution |
| Category/brand/unit list and names | `GET /api/v1/catalog` → `ManageCatalogService.list` | Stable unit/brand/category IDs and feature booleans | Unit short symbol/Bangla name and richer category/brand names absent |
| Nested basic create/rename | `POST`/`PATCH /api/v1/catalog/{units,brands,categories}` → named `ManageCatalogService` methods | Basic `{name}`; category create `{name,parentId}`, category rename `{name}` | Do not issue request until async quick-add and draft-preserving failure/selection by returned ID is implemented; metadata needs EXT-02+ |
| Catalog removal | `POST /api/v1/catalog/{units,brands,categories}/:id/remove` | Response `{data:{outcome:'DELETED'|'ARCHIVED'}}`; referenced masters archived | UI active/inactive toggle/re-activation is **not** equivalent to current removal; separately define reactivation if demanded |
| Simple stock product create/edit | `POST/PATCH /api/v1/products` → `ManageProductsService.create/update` | Only when every presented field can be faithfully encoded; update carries full `SaveProductRequest` plus `version`; 409 preserves form | Never submit rich draft to base-only API by omitting unsupported fields; opening stock is **not** a product field |
| Product status | `POST /api/v1/products/:id/status` | `{status:'ACTIVE'|'INACTIVE'}`, independent from stock | Use actual permission, not local toggle as authorization |
| Barcode | `POST /api/v1/products/:id/barcode` | Server-generated barcode | Re-read product rather than fabricating SKU/barcode |
| Thumbnail | `GET/POST/DELETE /api/v1/products/:id/image` | One authenticated image; POST accepted MIME and base64 limited to 192 KiB string | Existing gallery/photos array needs separate storage; revoke authenticated blob URLs |
| Product deletion | `DELETE /api/v1/products/:id` | Only unused product; used product must deactivate | No historical stock, quotation or sales source removal |
| Existing one offer | `SaveProductRequest.offerEnabled/offerPriceMinor/offerStartDate/offerEndDate` | One simple whole-product priced date-window case only | Not the UI's multi-row scheduled date-time and per-unit fixed/percentage offers |
| Existing warranty/serial/expiry flags | `warrantyMonths,supplierWarrantyMonths,tracksSerial,tracksExpiry` | Only precisely compatible months/required-serial/boolean expiry subsets | Optional serial ≠ Required; days/type/terms and per-product expiry details not representable |

Current catalog feature flags (`productOffers,expiryTracking,serialTracking,warranty`) come from `GET /catalog`. New fields are subject to server settings/permission checks; a feature disabled for new use must not erase historical data or force the UI to silently forget a draft. Canonical responses differ: product list `{data:[],page,summary}`, catalog and product detail/mutations `{data:...}`, deletion may return no body. The adapter must not expect an invented uniform `ok:true` envelope.

### 19.4. Lossless field mapping: UI → existing DTO → extension

| UI source field / action | Existing wire or storage | Exact handling and extension |
|---|---|---|
| `Product.id`, brand/category/unit selection | ULIDs; `brandId/categoryId/baseUnitId` | Store real ID separately from text/symbol; no `p1`, `Pcs` or label as wire identity |
| `name`, `nameBn`, `sku`, `barcode` | `name`; `nameBn` absent; nullable codes | Trim; `nameBn` Unicode null/preserve on omitted edit; never encode in `description` |
| Category/brand edit `nameBn` | name-only catalog response/write | Add optional nullable nameBn in proposed catalog metadata amendment; do not lose UI edit |
| `ProductUnitOption.name/nameBn/symbol` | unit `{id,name}` only | Add nullable nameBn, symbol to contracts/rows; symbols 1–4 nonwhitespace Unicode chars, not IDs; duplicate shorthand permitted, ID disambiguates |
| `kind: Stock/Service/Bundle` | no product kind | Stock is compatible; Service and Bundle remain separate gated task/owners and are never falsely posted as physical stock |
| `unit` and `altUnit` | `baseUnitId`, `conversionUnitId`, `conversionFactorQty` | Only a single alt unit with exact scale-3 factor qualifies for legacy path; a four-level chain is not two-unit parity |
| `unitRelations` / `unitLevels` | `product_unit_conversions` table exists, DTO exposes just one alt | New ordered, versioned profile with ID keys and rational adjacent factors; do not assume this old table already handles a chain |
| `unitSellPrices/unitPurchasePrices`, `basePrice/basePurchasePrice` | `sellingPriceMinor/purchasePriceMinor` base only | Persist **independent** explicit per-unit rates and inherited automatic prices; preserve entered 4-decimal taka rate, not rounded base-unit poisha |
| `stockViewUnit` | absent | Tenant/user display preference by real unit ID; does not create inventory or change base stock |
| `stock`, openingQty, openingSerialText | stockQty read-only, stock-opening service separately | Initial stock + serial/expiry/batch source belongs to MOD-003 atomic opening, not `SaveProductRequest`; never locally increment live stock |
| `minStock` | `minStockQty` scale-3 base qty | Convert to server base qty exactly, reject unrepresentable fractions |
| `active` | `status` ACTIVE/INACTIVE | Explicit enum map and status endpoint |
| `useDefaultPriceForAllLots` | absent | Persist boolean lot-price policy; product policy true overrides every received lot price only at sale price resolution (never alters old postings) |
| `StockLot.sellingPrice` | no lot selling-price column | Optional **base-unit** price in lot/source evidence; null means product default; keep lot unit purchase cost independent |
| `serialTracking` | `tracksSerial:boolean` | Off→false and Required→true are compatible subsets; Optional needs tri-state backend field and validation; never coerce Optional→Required |
| `warranty.duration/unit/type/terms` | customer/supplier months | Months direct; years→months only if valid and semantically equivalent; days/type/terms require typed storage and snapshot at sale |
| `expiry.enabled/dateRequired/warningDays/allocationMethod` | `tracksExpiry:boolean`; lots have `expiryDate` | Add per-product policy fields, preserve FIFO/FEFO and required-date constraints; lot manufacture/batch provenance belongs to receiving |
| `ProductOffer[]` | single `offerPriceMinor`/start/end business dates | Multi-offer table/DTO by stable IDs, per-unit fixed/percent discounts, local start/end datetimes, enabled flag, nonoverlap guard; no flattening |
| `images[]` | one `imageMime/imageBytes` thumbnail | Keep cover thumbnail reuse, gallery needs separate authenticated assets/ownership contract |
| Update `version` | `ProductResponse.version` | Preserve loaded version separately; full-body PATCH with 409 conflict recovery and draft retained |
| Cost visibility | optional `purchasePriceMinor`, `stockValueMinor` | Do not generate zero/missing cost client-side or leak through enriched unit buy-price payloads |

Product settings currently have category/brand/unit quick-add and edit UI; no hover/focus affordance, dialog field, selection, or existing keyboard path may be removed. Product master unit structure is currently locked during edit: any future profile restructuring with stock/history must be a separately approved migration/correction workflow, not a bypass of that guard.

### 19.5. Resolved **proposed** exact-unit representation (D03/D16)

A profile has tenant-owned `productId`, immutable positive integer `revision`, and ordered `levels` from **smallest/base to largest**; level 0's `unitId` equals product `baseUnitId` and its factor is 1. Each larger level records `relativeToPrevious: { numerator: decimal-integer-string, denominator: decimal-integer-string }` with both >0, denominator >0 and ratio >1; normalize by gcd and reject duplicate unit IDs, missing steps, cycles, zero/negative or unsafe factors. Server derives `factorToBase` as a reduced rational product of the ordered adjacent factors. This preserves the UI's `1 Carton = 12 Box; 1 Box = 20 Pcs` without reinterpreting the base, and can represent exact decimal ratios if validated. Do **not** send JS `Number`, binary float, a pre-rounded base factor, or arbitrary user-entered base quantity as posting authority.

**Proposed opt-in product profile DTO (not present today):**

`UnitProfileV1 = { revision: positiveInt, baseUnitId: ULID, levels: [{ unitId: ULID, order: int, factorToPrevious: {numerator: integerString, denominator: integerString}|null, sellingRateTaka4: integerString|null, purchaseRateTaka4: integerString|null, sellingMode: 'EXPLICIT'|'AUTO', purchaseMode: 'EXPLICIT'|'AUTO' }], stockViewUnitId: ULID|null }`.

`AUTO` is a live derived quote from the explicit base/default rate and exact factor, **not a materialized rounded price**; `EXPLICIT` is independent and frozen once used by a source. An explicit zero differs from no override. Rate field `Taka4` is an integer number of 0.0001 BDT (string over JSON to avoid JS safe-integer and BigInt serialization pitfalls); e.g. ৳12.3456 is `"123456"` and ৳0.0001 is `"1"`. Existing price in poisha scale2 is *not* silently substituted for this scale4 rate. Contract validates digits/sign, allowed precision, maximum magnitude and overflow before persistence. The backend may use BigInt, decimal or reduced fractions in domain; no JS float for posting. Existing Money poisha and UnitCost scale4 accounting representations continue at their domain boundaries. If the owner later changes the accepted maximum number of decimal digits, amend the versioned contract first.

**Quantity:** accept entered quantity strings with up to the **currently exposed 4 decimals** per unit, parse exactly; each component has `qtyScaled4` integer. The server computes `baseQtyScaled3 = sum(qtyScaled4 * factorToBase * 1000/10000)` with rational arithmetic. Every result must be an integer representable by the existing scale-3 stock quantity; otherwise return typed `UNIT_QUANTITY_PRECISION_UNSUPPORTED`, preserve draft and post nothing. Do not round, truncate or silently increase stock precision. Enforce uniqueness of unit IDs, profile revision, positive total, stock/serial constraints and server-side safe integer bounds.

**Two distinct posting price modes are mandatory** (confirmed source, not a stylistic preference):

- `COMPOUND_SELECTED_RATE`: current one- or two-level `CompoundQuantityInput` takes the selected unit's negotiated rate and prorates the base-unit remainder using the selected unit factor; compute the **entire extended line gross** using one exact rational and round once to poisha at the domain line-gross boundary. Mirrors `compoundLineTotal`.
- `UNIT_COMPONENT_RATES`: current three-plus level `MultiUnitQuantityInput` uses each entered unit's own independent price, including any edited rate for that unit, and aggregates rounded component amounts. Match `unitQuantitiesSaleTotal`: for each nonzero component, calculate `qty * chosen unit rate` exactly, round half-up to poisha at that component, then sum for line gross. Do not replace with one converted base price. Snapshot each component's exact rate, rounded component gross and order. Identical unit components must be consolidated deterministically before rounding; document and test splitting behavior.

The API must carry the selected mode, ordered quantity components `{unitId,qtyDecimal}[]`, the actual negotiated per-component price rates or selected rate (integer-string `Taka4`), `unitProfileRevision` and a reviewed server quote token/version as needed for changed price/lot/offer. No client-computed grand total is authoritative. The server recomputes price/discount/rounding before confirmation and returns typed mismatch; use the **existing POS review dialog** for changed total rather than inserting a balancing line. Per-line taxes/discounts/bill rounding remain those of the owning sale/purchase services, not a new catalog calculation.

### 19.6. Proposed additive APIs, backward compatibility and storage ownership

**Catalog metadata amendment (EXT-02 expanded):** Keep current `GET /api/v1/catalog` and named POST/PATCH routes. Unit responses gain `nameBn:string|null` and `symbol:string|null` only in an opt-in versioned representation; requests accept optional `nameBn?:string|null` and `symbol?:string|null`; omitted on edit preserves stored value, explicit null clears. Unit Bengali max120, product Bengali max200, symbol 1–4 nonspace; retain existing `name` validation (1–120). Since `ProductSettings` exposes Bengali name editing for brands/categories, separately add nullable `nameBn` to their versioned create/rename/list contracts (do not pretend EXT-02 already did this). The current name-only clients continue to work. No category-parent movement is implied by rename. No automatic catalog reactivation endpoint is asserted to exist.

**Product advanced profile amendment:** Existing simple `POST/PATCH /api/v1/products` stays usable for truly compatible legacy products with its strict `SaveProductRequest` and full update+version; the server offers an explicitly **negotiated** `unit-profile-v1` product read/write variant with typed `unitProfileV1`, `serialTrackingMode`, detailed warranty/expiry, lot-price policy and version, rather than changing the meaning of old integer `sellingPriceMinor`. The coordinator must select the concrete negotiation mechanism (versioned Accept header, new exact route or request format) and publish its complete strict Zod/HTTP/error schemas **before** coding. Until selected and tested, this endpoint detail is a **contract-design gate**, not permission to fabricate a route or header. In legacy mode, advanced products must not be silently downgraded on write; reject an incompatible full-body legacy update with typed `ADVANCED_PRODUCT_REQUIRES_V1`. If legacy read cannot faithfully represent an advanced product, expose an explicit unsupported/upgrade indication instead of a misleading rounded price. The modern React adapter keeps exact advanced profile and cost omission; no old default/empty field clears new data.

**Posted sale/purchase line amendment:** Keep existing `POST /api/v1/sales` and `POST /api/v1/purchases` behavior for legacy clients, but introduce strictly validated versioned advanced line fields only after owning services approve them: `pricingMode`, `unitProfileRevision`, `enteredComponents[]`, rate scale4 fields, original unit/price/lot/offer source identifiers, and review quote/version. A line records exact entered quantities, base conversion, per-component rates, applied discount/offer, net allocation and **display labels in both languages plus short symbols**. Store the server-calculated gross, discount shares, net/COGS and movement quantities independently, using current journal/stock invariants. A sale with multiple priced lots that produces incompatible rates must require **split or explicit review**; never silently average lots. Returns/corrections use frozen original line and source allocation, allocate the last poisha to the final returnable component and keep posted history append-only. No product master edit rewrites historical invoice or return amounts.

**Required proposed PostgreSQL layout (no schema change now):**
- `units`: nullable `name_bn` and `symbol`; `brands`/`categories` nullable `name_bn` if approved; `products` nullable `name_bn`, tri-state serial mode, detailed warranty/expiry fields, `use_default_price_for_all_lots`. Retain existing IDs/columns/default behavior for old rows.
- Versioned `product_unit_profiles` keyed by (tenant, product, revision), ordered `product_unit_profile_levels` with unit IDs and rational adjacent factors, and `product_unit_profile_prices` with explicit/auto mode and exact scale4 rate strings stored as PostgreSQL signed BIGINT/NUMERIC using safe adapter conversion. Add immutable profile version reference to posted source.
- `sale_line_unit_components` and `purchase_line_unit_components` or equivalent source-specific immutable child tables: tenant/source/line/sequence, unitId, entered qty string/scale, price rate, rounded amount, factor snapshot; source-line `unit_snapshot` JSONB captures ordered unit EN/BN/symbol wording, conversions, full pricing/offer/lot context, and a schema version. Never query today's catalog to reconstruct an old print.
- `inventory_lots`: optional lot-selling-price exact base-rate plus batch/manufacture provenance and an explicit effective-price policy; purchase line/lot source owns atomic creation, serial references, stock/valuation, source allocations. Lot unit cost is not a selling rate.
- `product_offers`: tenant/product/offer ID, version, type, amount and unitId, enabled, timezone-resolved effective-from/effective-until instants; schedule list and idempotent audit/outbox. Enabled offers must not overlap for the same product (existing `validateOffer` behavior). Fixed offers apply to their selected price unit; percentage precision and line snapshot must be explicit.
- `product_gallery_assets` or an approved image-resource equivalent for additional images; preserve the current thumbnail as cover/legacy path.

**Migration plan after separate coordinator approval:** reserve migration number; make nullable/additive tables first, deploy dual reads, backfill legacy `baseUnitId + optional conversionUnitId/conversionFactorQty` to version 1 exact profiles, and mark old base `sellingPriceMinor/purchasePriceMinor` as explicit base rate multiplied by 100 (poisha→Taka4) without changing originals. Blank unit metadata remains null and existing invoices remain untouched. Do not backfill history from current product master as “frozen truth.” Server should forbid incompatible legacy updates to advanced profiles, and only then enable modern write path. Rollback must disable new writes and retain existing posted history; never down-migrate with financial information loss. Use actual migrations/tenant RLS/FK/uniqueness strategy only after schema owner reserves file and data plan.

### 19.7. Product rule boundaries and cross-module dependencies

1. `MOD-000` accepted auth, identity, transport, error/operation key and preview/live isolation is required before any connected UI operation. `MOD-001` accepted product feature settings and `/me` permissions are required before enabling editor actions. Existing approval of MOD-000-A alone does **not** approve MOD-002.
2. `MOD-002-T01A`: Stage A read-only catalogs, product list/detail/status metadata and cost omission; preserve current selectors, paging, sort, query, and preview mode. A compatible read slice may be approved independently once its dependencies are accepted.
3. `MOD-002-T01B`: basic master create/rename/remove and simple-product CRUD/status/barcode/cover thumbnail; only after isolated meaningful tests and explicit allowlist. Quick-add awaits returned ID without resetting draft; 409 and lost response never cause preview fallback.
4. `MOD-002-T02A`: EXT-02 multilingual names/symbols plus category/brand Bengali metadata, versioned identity/rename semantics and compatibility.
5. `MOD-002-T02B`: unit-profile D03/D16 exact prices/conversions/legacy projection with stock-history edit guard; coordinator owns shared schema and exported contracts.
6. `MOD-002-T03`: detailed optional serial, product-kind boundary, warranty and expiry policies; product type Stock/Service/Bundle accounting must agree with respective owning modules.
7. `MOD-002-T04`: multi-offer management, nonoverlap and timezone resolution, effective-price snapshot, gallery policy.
8. **Cross-module release gates:** MOD-003 Inventory owns stock opening, receiving lots, expiry/batch, stock adjustments and serial operations; MOD-006 purchasing owns lot selling-price receipt and atomic serial composition; MOD-007 POS/sales and MOD-008 returns (confirm registry IDs at dispatch) own line pricing, posted unit snapshots and return allocations; shared source/draft/print and quotation consumers get regression verification. The exact module numbers of those downstream owners must be rechecked against current registry before issue dispatch. The MOD-002 module is not fully released merely because product list works.

**Lot precedence:** product `useDefaultPriceForAllLots=true` uses current product default unit rate for *new* sales regardless of an older lot price; false uses allocated lot selling price if explicit, otherwise product default. Opening lots always use product default. Active offer applies to the selected effective normal/lot rate subject to its unit; an explicit POS negotiated price is displayed and reviewed as its own chosen override. If one line spans lots with differing effective rates, preserve existing warning and require review/split rather than average. Once sold, freeze actual chosen rate and lot allocations. A product policy change does not reprice prior sales. Updating receipt lot price after downstream sales must use a source-safe correction protocol, not in-place rewrite.

**Warranty:** store unit (Days/Months/Years), positive duration, type (Seller/Manufacturer/Service/Replacement), terms and optional supplier months separately; freeze at sale. Existing backend months-only mapping is valid only for equivalent customer/supplier calendar policies. Service-kind warranty accounting and return/replacement behavior require the owning warranty packet's contract, not a guessed interpretation.

**Serial:** `Off` permits no serial tracking, `Optional` accepts sparse unique serials, `Required` requires one serial per countable base unit; non-countable fractional stock units cannot use required serial. Preserve opening/receiving/sale provenance; two tenants may have independent serials if tenant scoping allows, but duplicates within a tenant must be rejected by actual storage rules. Product master flag alone is not a serial-unit create.

**Expiry:** per-product `dateRequired`, `warningDays` and FIFO/FEFO must be persisted distinctly from lot's actual `expiryDate`; receipt validation rejects expiry≤manufacture date; ensure per-product policy and tenant feature gate. No UTC truncation for business date.

### 19.8. Exact file ownership — read scope is not write authority

**Documentation draft PR allowed now:** **only** `hisabiq_ui/docs/integration/modules/MOD-002-products-catalog.md`. No new MD, shared mappings, other docs, AGENTS, source, tests, workflows, schema or migrations in this draft.

**Future frontend task-local candidates after slot approval:** `src/integration/{products,catalog}.ts` (names from CORE_WORKFLOWS, not duplicate `products-catalog.ts`), `src/pages/Products.tsx`, `src/components/products/form/useAddProductForm.ts`, `src/components/products/ProductSettings.tsx`, `src/components/products/ProductInventoryDialogs.tsx`, `src/components/products/form/UnitPricesPanel.tsx`, `tests/integrationProducts.test.ts`, `scripts/integration-products-browser.cjs`. Coordinator must pick exact files separately per task; do not blanket-allow `src/components/products/**`. Frontend `src/types/{erp,productForm}.ts`, `src/utils/{unitChain,multiUnitTransactions,posMultiUnit,productDraft,lotSellingPrice}.ts`, `src/data/{productUnits,erpDemoStore}.ts`, shared `CartTable`/compound inputs and print code require **coordinator or their owning module** because other chats consume them.

**Future backend task-local candidates:** `packages/core-contracts/src/{catalog,products}.ts`; `packages/core-domain/src/catalog/*` (first resolve exact existing symbols); `packages/core-application/src/catalog/{manage-catalog-service,manage-products-service,catalog-repository,product-repository}.ts`; `packages/adapter-postgres/src/{catalog-repository,product-repository}.ts`; existing `apps/api/src/catalog/{catalog,products}.controller.ts`. Backend `packages/core-contracts/src/{index,permissions,settings}.ts`, `packages/core-application/src/index.ts`, provider/module wiring, `packages/adapter-postgres/src/schema.ts`, every migration, sales/purchase/returns contracts and services, plus CI are **coordinator-owned** and cannot be changed in parallel by this product chat. Verify actual paths/names on reserved heads before allowing anything.

### 19.9. Exact acceptance and negative/concurrency vectors — NOT EXECUTED

| ID | Inputs / setup | Required result / forbidden side effect |
|---|---|---|
| P-CAT-01 | Half-filled 4-unit product draft; create/edit Brand, Unit or Category inline | Server returns stable ID, selection changes by ID; all quantities, purchase/sale rates, warranty, serial text, images and focus preserved; 403/409/network error retains entire draft |
| P-CAT-02 | Unit Gauge, nameBn=গেজ, symbol=Gg; rename to Gge and change Bangla | Same ID, factors, stock, product links remain; old posted invoice label unchanged; no journal/stock; symbol duplicates do not collapse distinct IDs |
| P-CAT-03 | Used category/brand/unit remove | Return ARCHIVED, not history deletion; inactive master unavailable for new links; existing document remains readable; no unsupported fake reactivation |
| P-READ-01 | `inventory.cost.view` revoked after list loads | GET omits cost fields, enriched unit purchase rates and valuation; UI does not invent 0 or leak cached cost; forbidden mutation has no state change |
| P-UNIT-01 | 1 Carton=12 Box, 1 Box=20 Pcs; quantity 1 Carton+2 Box+3 Pcs | Base quantity **283 Pcs = 283000 scale-3**; compact one-line input retained; no quantity lost |
| P-UNIT-02 | Same line, explicit rates Carton ৳950, Box ৳85, Pcs ৳5; UNIT_COMPONENT_RATES | Gross ৳1135.00 = 113500 poisha; changing only Box price must alter only that unit component; NOT (283×one base rate) |
| P-UNIT-03 | 1 Box=3 Pcs, Box rate 100 poisha; enter 1 Box+1 Pcs as COMPOUND_SELECTED_RATE | Exact gross 133⅓ poisha → **133 poisha** after one half-up line boundary; no prior rounding of base rate to 33 poisha as pricing authority |
| P-UNIT-04 | Per-unit exact rate ৳0.0001/Pcs (Taka4="1"), qty 10000 Pcs | Gross 100 poisha, not 0 through pre-rounding; stock 10000000 scale-3 when allowed by fixture |
| P-UNIT-05 | Enter 0.0001 Pcs with factor 1 | BaseQtyScaled3 not integral → `UNIT_QUANTITY_PRECISION_UNSUPPORTED`; no source/stock/journal/audit/outbox; draft retained |
| P-UNIT-06 | Change unit name, Bangla, symbol, factors or prices after selling; then print/return | Old display/amount/line allocation remains byte-for-byte equivalent to frozen snapshot, including remainder assignment; no current master lookup for history |
| P-UNIT-07 | Client A edits profile version 3; client B already committed version 4 | Stale rejection with 409; no partial profile or price overwrites; retain staged fields |
| P-LEGACY-01 | Old client creates/edits simple product via existing full SaveProductRequest | API behavior and poisha prices unchanged; legacy base/one-alt profile backfills exactly; no response shape break without version negotiation |
| P-LEGACY-02 | Old client updates advanced independently priced product | Typed ADVANCED_PRODUCT_REQUIRES_V1 refusal; no dropped price/offer/serial fields or version rollback |
| P-LOT-01 | Product override OFF, lot A 120 poisha/base, lot B 140; new sale spans both | Existing mixed-price warning; explicit review/split before sale; no hidden 130 average |
| P-LOT-02 | Same lots, product override ON, product default 150 poisha/base | New sale uses default 150 while old sale retains its frozen old lot price; opening lot remains product-default policy |
| P-SERIAL-01 | Optional product, 10 countable units, only 3 unique serials supplied | Permitted by optional policy where receiving route supports it; Required with only 3 refuses; duplicate serial refuses atomically |
| P-WARR-01 | 30 Days Service warranty with terms; 2 Years Manufacturer warranty | Full type/unit/terms read/write round-trip and sale snapshot; days cannot silently become “one month” |
| P-EXP-01 | Expiry required, missing date; manufacture≥expiry; FIFO/FEFO choice | Proper validation/refusal and preserved draft; no received stock/serial/journal/lot on failure |
| P-OFFER-01 | Two nonoverlapping date-time offers with different unit discounts | Both persist, status Scheduled/Active/Expired/Disabled resolved at tenant timezone; fixed discount per unit, active offer applied once; overlapping enabled interval rejects |
| P-POST-01 | Identical confirmed operation twice after timeout | Same server document ID/price snapshot and one stock/journal/audit/outbox effect; changed body under same operation ID refused |
| P-TENANT-01 | Tenant A attempts product/unit/lot/offer IDs from tenant B | Not-found boundary and zero B data leakage/mutation; RLS with unprivileged app role |
| P-ATOMIC-01 | Fail second lot/serial or outbox within purchase/sale confirmation | Entire document, profile-linked line, journal, stock, serial, settlement and idempotency effects rollback; no local preview success |

**Regression matrix:** actual React Products form and POS cart at 320/390/768/820/1440 widths; English/Bangla, light/dark, keyboard Enter/Escape/focus return, hover and touch, modal overlays, 36px controls, short symbols and one-line `1 Carton 2 Box 3 Pcs`. Confirm existing `npm run test:compound-units`, POS/Products product tests, TypeScript, lint, UI-contract, build and real React→Nest browser checks. Backend future focused suites `pnpm --filter @sher/api exec vitest run test/products.spec.ts` and catalog/stock/sale/purchase/return cases against **disposable PostgreSQL16 only**, with Node20/pnpm9 backend and Node24/npm frontend. Verify operation ID, 409, 403, 404, two-tenant RLS, no leaking purchase prices, no phantom money/stock and exact rounded allocations. Test names here are planned vectors, not execution evidence. No runner/DB/test environment was started for this plan.

### 19.10. Remaining approval gates and handoff

- **Architectural direction proposed for owner approval:** (A) exact rational ordered units, (B) explicit per-unit rates at 0.0001 BDT scale, (C) component vs two-unit proportional calculation as two versioned modes, (D) immutable posted component/source snapshots, (E) lot default/override precedence, (F) additive legacy-compatible contracts, (G) multi-scheduled offers and serial/warranty/expiry parity.
- **Still not contract-complete for implementation:** precise opt-in version negotiation shape/HTTP status schema, full service/port/adapter provider flow for new profile and offers, database constraints + migration number, exact downstream source-line DTOs/rounding with accounting owner, cost-permission shape for advanced prices, legacy-client advanced-read upgrade response, old data/quote compatibility, product kind and gallery storage, and accepted file reservation. These are architecture tasks, not coding-agent choices. Do not call ``19.5–19.9 implemented, tested or independently reviewed.
- **Dispatch order:** source/decision review → owner signs off proposed pricing/precision/compatibility directions → coordinator finishes concrete endpoint/storage amendments and reserves migration ownership → MOD-000/MOD-001 dependency SHAs accepted → coordinator checks Project active capacity=1, creates real issue, allocates precise files/session/runner → one failing test slice → paired backend additive draft PR → frontend draft PR against pinned backend head → disposable DB/full focused QA + independent review → human merge approval. No worker, database, implementation or merge operation is authorized by this documentation PR.

**Current status: PROPOSED FOR REVIEW / BUILD BLOCKED.** This document changes neither application source nor the number of approved build slots.

