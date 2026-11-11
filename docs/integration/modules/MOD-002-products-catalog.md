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
