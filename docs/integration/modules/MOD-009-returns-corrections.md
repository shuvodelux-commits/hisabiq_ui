# MOD-009 — Sales/purchase returns, source corrections and transaction dates

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-007, MOD-008. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-009-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/components/audit/AuditDetailsDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditDetailsDialog.tsx#L1)
- [src/components/audit/AuditEditDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L1)
- [src/components/audit/AuditFilters.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L1)
- [src/components/audit/AuditTimeline.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditTimeline.tsx#L1)
- [src/components/audit/ImpactPreview.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/ImpactPreview.tsx#L1)
- [src/components/purchases/BillDetailDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/BillDetailDialog.tsx#L1)
- [src/components/purchases/BillDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/BillDialog.tsx#L1)
- [src/components/purchases/PurchaseCart.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/PurchaseCart.tsx#L1)
- [src/components/purchases/PurchaseDraftsMenu.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/PurchaseDraftsMenu.tsx#L1)
- [src/components/purchases/PurchasePaymentPanel.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/PurchasePaymentPanel.tsx#L1)
- [src/components/purchases/PurchaseSourceDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/purchases/PurchaseSourceDialog.tsx#L1)
- [src/components/sales/SalesMobileLayout.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/sales/SalesMobileLayout.tsx#L1)
- [src/components/sales/SalesWideToolbar.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/sales/SalesWideToolbar.tsx#L1)
- [src/pages/Purchases.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Purchases.tsx#L1)
- [src/pages/Sales.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Sales.tsx#L1)
- [src/utils/purchaseSource.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/purchaseSource.ts#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/corrections/transaction-date/:documentType/:documentId` | [CorrectionsController.context](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/corrections/corrections.controller.ts#L33) | `redatableDocumentSchema` | `{ data: TransactionDateContext }` | `ChangeTransactionDateService.describe` |
| `POST /api/v1/corrections/transaction-date` | [CorrectionsController.change](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/corrections/corrections.controller.ts#L45) | `changeTransactionDateRequestSchema` | `{ data: ChangeTransactionDateResponse }` | `ChangeTransactionDateService.change` |
| `GET /api/v1/purchase-returns/returnable/:purchaseId` | [PurchaseReturnsController.returnable](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/returns/purchase-returns.controller.ts#L35) | Inline / no body; linked method | `{ data: ReturnableBillResponse }` | `PurchaseReturnQueryService.returnable` |
| `GET /api/v1/purchase-returns` | [PurchaseReturnsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/returns/purchase-returns.controller.ts#L43) | Inline / no body; linked method | `PurchaseReturnListResponse` | `PurchaseReturnQueryService.list` |
| `POST /api/v1/purchase-returns` | [PurchaseReturnsController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/returns/purchase-returns.controller.ts#L59) | `createPurchaseReturnRequestSchema` | `{ data: PurchaseReturnResponse }` | `CreatePurchaseReturnService.create` |
| `POST /api/v1/purchase-returns/:id/void` | [PurchaseReturnsController.void](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/returns/purchase-returns.controller.ts#L95) | `voidDocumentRequestSchema` | `{ data: { ok: true } }` | `CreatePurchaseReturnService.void` |
| `GET /api/v1/sales-returns/returnable/:saleId` | [SalesReturnsController.returnable](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/returns/sales-returns.controller.ts#L37) | Inline / no body; linked method | `{ data: ReturnableInvoiceResponse }` | `SalesReturnQueryService.returnable` |
| `GET /api/v1/sales-returns` | [SalesReturnsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/returns/sales-returns.controller.ts#L45) | Inline / no body; linked method | `SalesReturnListResponse` | `SalesReturnQueryService.list` |
| `POST /api/v1/sales-returns` | [SalesReturnsController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/returns/sales-returns.controller.ts#L61) | `createSalesReturnRequestSchema` | `{ data: SalesReturnResponse }` | `CreateSalesReturnService.create` |
| `POST /api/v1/sales-returns/:id/void` | [SalesReturnsController.void](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/returns/sales-returns.controller.ts#L103) | `voidDocumentRequestSchema` | `{ data: { ok: true } }` | `CreateSalesReturnService.void` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-009-F01 | Single-invoice sales return/refund — `Sales return dialog` | ADAPT | sales-returns/returnable/:saleId; sales-returns | Fetch returnable IDs; server apportions discounts/cost; refund limits and PIN authoritative. | RETURN |
| MOD-009-F02 | Purchase return — `Purchase return dialog` | ADAPT | purchase-returns/returnable/:purchaseId; purchase-returns | Use original lots/cost, supplier credit/refund rules, no fresh purchase valuation. | RETURN |
| MOD-009-F03 | Void, correction and date changes from any hub — `Source review dialogs` | ADAPT | owning void/cancel endpoints; corrections/transaction-date | One owning source mutation; audit reason; no ledger projection mutation. | CORE_WORKFLOWS |
| MOD-009-F04 | Multi-invoice batch and bundle returns — `Sales batch-return UI` | EXTEND | No verified atomic batch contract | One all-or-nothing composed UOW is required; retain original UI selection and settlement. | D09 and batch contract |

## 5. Proposed architecture and unresolved approval

No posted history deletion. Test cumulative and concurrent return caps, exact remainder, role/date restrictions, source-linked rollback and original cost/serial restoration. A changed product recipe or conversion must not change a historical return.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D09.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [returns fields](../contracts/returns.md)
- [transaction-date fields](../contracts/transaction-date.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/returns-corrections.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/pages/Purchases.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/Sales.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/utils/purchaseSource.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/returns-corrections.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-returns-corrections.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-returns-corrections-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-009-T01: Single-invoice sales return/refund

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-007, MOD-008. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Sales return dialog`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `sales-returns/returnable/:saleId; sales-returns`. **Gate:** RETURN.

**Algorithm / expected output:** Fetch returnable IDs; server apportions discounts/cost; refund limits and PIN authoritative. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-returns-corrections.test.ts` case `MOD-009-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-009-T02: Purchase return

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-007, MOD-008. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Purchase return dialog`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `purchase-returns/returnable/:purchaseId; purchase-returns`. **Gate:** RETURN.

**Algorithm / expected output:** Use original lots/cost, supplier credit/refund rules, no fresh purchase valuation. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-returns-corrections.test.ts` case `MOD-009-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-009-T03: Void, correction and date changes from any hub

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-007, MOD-008. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Source review dialogs`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `owning void/cancel endpoints; corrections/transaction-date`. **Gate:** CORE_WORKFLOWS.

**Algorithm / expected output:** One owning source mutation; audit reason; no ledger projection mutation. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-returns-corrections.test.ts` case `MOD-009-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-009-T04: Multi-invoice batch and bundle returns

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-007, MOD-008. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Sales batch-return UI`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `No verified atomic batch contract`. **Gate:** D09 and batch contract.

**Algorithm / expected output:** One all-or-nothing composed UOW is required; retain original UI selection and settlement. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-returns-corrections.test.ts` case `MOD-009-F04 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D09

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-009-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.


---

## 19. Source-verified MOD-009 approval amendment — 2026-11-13 (PROPOSED, NOT BUILD APPROVAL)

### 19.1 Snapshot, constraints and review confidence

- Frontend: shuvodelux-commits/hisabiq_ui, main @ 77a7dc2ec44b2e42b2bc3abdb4cbb07004f5a17b.
- Backend: shuvodelux-commits/nestshererp, chore/hisabiq-adoption-runtime-a01 @ de65cf99f425906a04e2e9e54eec919abb568bd4.
- Files read: both root AGENTS.md; the master integration blueprint, staged plan, REVIEW, DECISIONS, EXECUTION, CORE_WORKFLOWS, CASH_SESSION_POLICY, this module packet; current frontend actions and relevant backend controllers, return/domain services, PostgreSQL repositories and transaction-date service/contract.
- This is a static GitHub code/contract review. No React↔Nest runtime, RLS/tenant integration, real PostgreSQL race test, browser screenshot or independent QA has been executed. Do not reclassify these as passing.
- The earlier section 1 baselines and source census remain historical. This amendment is pinned to the newer SHAs above and takes precedence for proposed readiness findings, without changing owner-approved master/shared files.
- Documentation-only edit of this exact packet is authorized; implementation, database, other packets, merge, deployment and build reservation are not.

### 19.2 Source-to-owning-operation map

| Frontend entry and actual behavior at frontend head | Owning backend operation at backend head | Classification and explicit gap |
|---|---|---|
| Sales.tsx invoice row Return items; invoice detail Return; Sales return tab single-invoice selection | GET /api/v1/sales-returns/returnable/:saleId → SalesReturnQueryService.returnable, POST /api/v1/sales-returns → CreateSalesReturnService.create | ADAPT only when stable source/line ULIDs, historical pricing/units, source-activity guard, settlement and cash policy work. Do not copy frontend totals. |
| Sales.tsx return tab selects multiple invoice IDs; one completeReturn mutates local returns, invoices and customer credits | No verified atomic multi-invoice sales-return operation | BLOCKED EXTEND. Do not loop POST /sales-returns or emulate transactionality in the browser. |
| Sales.tsx bundleReturnChoices, planBundleReturn and bundle preview gate | No verified durable bundle-component return contract; current source backend consumes ordinary sale lines and stock-origin allocations | BLOCKED by D09/MOD-019 and corresponding accepted MOD-007 sale-time component snapshots; never downgrade bundle to an ordinary product return. |
| Sales.tsx Customer credit refund and credit application | Not a sales-return create: these are settlements of an existing CUSTOMER_ADVANCE liability, with possible invoice allocation | BLOCKED pending source-owned advance/receipt/refund contract and MOD-006/MOD-007 allocation approval; never create a synthetic sales return or just decrement UI credit. |
| Sales.tsx return history View/Print/Customer ledger/Start another return/Delete affordance | GET /sales-returns; source detail/read path to be confirmed; POST /sales-returns/:id/void → CreateSalesReturnService.void | ADAPT read/action routing; Delete must become source-owned void with version/reason and reversal constraints, not erasure. Preserve print and source links. |
| Sales invoice Delete control (currently disabled with explanatory source-deletion reason) and any invoice correction | POST /api/v1/sales/:id/cancel → sale cancellation service; POST /api/v1/sales with correctionOf and correctionVersion → CreateSaleService | ADAPT/BLOCKED depending on linked returns, stock, settlements, periods and source version. A general Daybook/Audit delete cannot bypass the sale writer. |
| Purchases.tsx purchase row Review return, return tab Choose return quantities, PurchaseSourceDialog mode=return | GET /api/v1/purchase-returns/returnable/:purchaseId → PurchaseReturnQueryService.returnable, POST /api/v1/purchase-returns → CreatePurchaseReturnService.create | ADAPT only after purchase return lot locking/stock-cap fix, stable line IDs, settlement/payment choice and historical snapshot parity. The current mode=return uses mutatePreviewPurchase. |
| Purchases.tsx PurchaseSourceDialog mode=correction via embedded PurchaseEditor | POST /api/v1/purchases with correctionOf → CreatePurchaseService; purchase void POST /api/v1/purchases/:id/void → VoidPurchaseService | BLOCKED until expected source/correction version and dependent lot, serial, payment, return effects are fully guarded; existing purchase create contract has correctionOf but no explicit correctionVersion field. |
| Purchases.tsx PurchaseSourceDialog mode=payment | POST /api/v1/suppliers/payments → PaySupplierService.pay; PATCH /suppliers/payments/:id and POST /suppliers/payments/:id/void for owning corrections | MOD-008-owned settlement, not a purchase-return proxy. Split payment atomicity and cash policy must be accepted first. |
| Purchases.tsx return history, source history, source return Delete controls | GET /purchase-returns and source detail (not yet traced); POST /purchase-returns/:id/void → CreatePurchaseReturnService.void | ADAPT after immutable history/stock-availability guard, version/reason and uncertain-outcome plan. Sample return-history references do not identify real server rows. |
| Parties.tsx/Party Ledger source rows, source edit/reverse, customer-credit refund, opening correction | GET /api/v1/parties/:id/ledger → PartyLedgerService; then dispatch by immutable source type and ID to sale/purchase/receipt/supplier-payment/return/party-opening owner | Current handlers dispatch local preview actions (refund-credit, edit-source-payment, reverse-source); BLOCKED until each owning route and role-scoped settlement allocation is mapped. Do not update party-ledger projections directly. |
| Daybook.tsx source details Edit/Delete/Go to source | GET daybook source reference → validated sourceType/sourceId → owning source detail and correction/void service; monetary-date changes use ChangeTransactionDateService where eligible | Existing Edit redirects by printable reference to AuditLedger preview; Delete dialog explicitly says reversal unavailable. Must resolve real ULID and type. Neither a text reference nor a demo audit row is proof of identity. |
| AuditLedger.tsx and AuditEditDialog.tsx Correct/Delete, editable date/quantity/party/amount/payment account | Owning sale/purchase/expense/customer receipt/supplier payment/cash movement/return service for content edits; ChangeTransactionDateService for eligible date-only moves | Current applyCorrection/applyDelete modify audit preview state; no universal correction HTTP endpoint. Split fields by real source owner; unsupported patches remain visibly unavailable in live mode, not silently dropped. |
| Source details across Sales/Purchases/Party/Daybook/Audit | Return create/void, sale cancel/correct, purchase void/correct, receipt/payment correct/void, party opening correct; GET /api/v1/corrections/transaction-date/:documentType/:documentId and POST /api/v1/corrections/transaction-date | Date-only endpoint supports exactly EXPENSE, CUSTOMER_RECEIPT, SUPPLIER_PAYMENT, CASH_MOVEMENT. Sale/purchase stock-bearing date changes are their own correction workflows and are NOT valid input to this endpoint. |

Frontend evidence (current head): src/pages/Sales.tsx, src/pages/Purchases.tsx, src/components/purchases/PurchaseSourceDialog.tsx, src/utils/purchaseSource.ts, src/pages/Parties.tsx, src/pages/Daybook.tsx, src/pages/AuditLedger.tsx and src/components/audit/AuditEditDialog.tsx. Backend evidence: apps/api/src/returns/{sales-returns,purchase-returns}.controller.ts; apps/api/src/{sales,purchasing,corrections,parties} controllers, packages/core-application/src/returns/*, packages/core-contracts/src/{returns,transaction-date,sales,purchasing}.ts. Verify exact consumer lines again at dispatch SHA.

### 19.3 Critical issues discovered in current implementation

**R09-01 — purchase-return race (P0):** CreatePurchaseReturnService.create reads findReturnableBill without locking the purchase. PostgresPurchaseReturnRepository.findReturnableBill selects the purchase, line return totals and lot qty without FOR UPDATE; postPurchaseReturn subtracts lot qty with no nonnegative/expected-version predicate. Two transactions may both pass prechecks on the same lot/line. Required: acquire tenant-scoped parent purchase lock, lock relevant inventory lots/cost positions in canonical order, re-read posted return sums and lot balances under those locks; use guarded decrement with affected-row assertion (qty_remaining >= requested, version/tenant), and transaction rollback on failure. Tests must prove at most one winning over-cap mutation.

**R09-02 — partial-return rounding conservation (P0):** Both domain functions shareOf (sales) and billedShare (purchase) claim the final return receives the exact remainder, but compute the final amount from quantity-prorated historic totals rather than the **sum of actual previously posted return-line values**. For 3 identical units with line net amount 10000 poisha, first and second separate 1000-scale3 returns each value 3333, and the last calculated as 10000 minus rounded 2/3 (6667) gives 3333: total posted 9999, not 10000. Fix the pure calculation contract to use persisted cumulative returned value per source line (or a mathematically equivalent, consistently allocated cumulative target), locked with quantity and immutable original net/discount/rounding snapshots. Both value and actual historical cost must reconcile exactly at the final permitted return. Add positive/negative amounts and fractional-quantity cases.

**R09-03 — duplicate source lines (P0):** The return domain validators compare each requested line's qty individually to the remaining cap, but have no observed duplicate sourceLineId rejection before summing. Two entries naming the same original line can bypass per-line caps and/or over-credit. Explicitly reject duplicate line IDs and duplicate serial IDs across the entire request and batch; aggregate and lock capacities before any write.

**R09-04 — historical unit snapshots (P0):** The current returnable repositories join product base unit name from today's products/baseUnitId rather than a verified immutable sale/purchase transaction unit snapshot. Preserve original entered unit ID/version/name, compound-unit input and conversion, original invoice quantity/base quantity, price basis, bill/line discounts, rounding allocation, lot-level actual cost, source allocations and serialized-unit ownership; do not derive them from today's catalog or bundle recipe. Historical records missing sufficient provenance need an explicit nonposting Needs Review outcome, never an invented conversion/cost.

**R09-05 — noncash vs cash settlement (P0):** Existing single-return DTOs use refundMinor/refundAccountCode (sale) and receivedMinor/receiptAccountCode (purchase), with 0 meaning noncash. Backend credit first reduces dues on the *same source invoice/bill*, then posts CUSTOMER_ADVANCE/SUPPLIER_ADVANCE; the UI also offers explicit Customer credit, Adjust due, Cash refund, supplier credit and multi-account payment rows. Map each choice losslessly. A zero refund does not create bank/cash movement, while a positive physical refund/receipt must record the chosen real account, permissions and cash-session policy. A request for refund on an unpaid sale or to force all value into customer credit despite existing source due requires explicit product/accounting decision; current semantics must not be silently changed. Refunding existing customer advance is a separate command, not a new goods return.

**R09-06 — source/activity versions and unknown outcomes (P0):** Return POST already requires Idempotency-Key (26-character operation ID), fingerprints body and replays completed response; returnable reads and POST body do not carry a source return-activity version. Parent sale lock protects some races but does not tell stale UI selection from newer return/allocation; purchase has weaker locks. The transaction-date POST has expected document version but no dedicated idempotency key in its current schema/controller; return-void/correction endpoint replay safety likewise needs verification. Amend contract with durable operation identity and result lookup for all high-impact mutations, plus source version **and** an activity/capacity revision that increments when dependent returns, allocations or corrections change. Retrying uncertain outcomes uses exactly the original operation ID and unchanged payload, not a fresh ID; if a legacy route lacks this mechanism, preserve the draft and reconcile authoritatively before retrying.

**R09-07 — date scope and immutable creation time (P0):** ChangeTransactionDateService reverts an eligible money document and reposts identical journal lines/settlement allocations in one UOW; it preserves created_at, validates earliest allocated source and drawer-session date, and requires locked-period step-up/acknowledgement. It is intentionally restricted to four non-stock document types. Never route sale, purchase, sale return, purchase return or an arbitrary audit patch through it without separately specified stock/source/date algorithm. Date changes must not reset a cash-session identity, posted close or reconciliation provenance.

**R09-08 — linked reverse/void side effects (P0):** Both return void services append reversing journal/stock movements with reason/version; sale-return void checks that returned lots/serials have not moved. Reverse or correct an invoice only after examining dependent return, receipt, allocation, installment, bundle-component and close-period links. Reject impossible partial reversal with a typed reason; never delete posted rows, rewrite report projections, rebuild history from current product price or reuse a consumed operation ID for a different intent.

### 19.4 Exact proposed contract amendments — approval required

These are intentionally NEW specifications, not claims about existing endpoints.

| Amendment | Required additive contract/behavior | Ownership and gate |
|---|---|---|
| A09-01 source identity | Returnable GET delivers immutable sourceId/sourceLineId, sourceVersion, returnActivityVersion, original paid/allocated values, available qty and immutable entered-unit/discount/cost/serial/origin snapshots. Return create carries expectedSourceVersion and expectedReturnActivityVersion. | Shared contract, sale/purchase/return repos; coordinator reservation; MOD-007/008 accepted source storage. |
| A09-02 exact arithmetic | Domain functions accept historical posted returned quantity and **posted returned net/cost amounts** per source line; compute incremental value from a consistent cumulative rule and assert full-return conservation. No local UI value becomes authoritative. | Domain sales-return.ts, purchase-return.ts; adapter historical sums; golden tests. |
| A09-03 concurrency | Tenant-scoped ordered locks on invoice/bill, original lines/activity, lots, serials, settlement allocations, stock positions and outgoing drawer account; guarded updates/unique constraints and a true rollback boundary. No split transaction. | PostgreSQL return adapters/services; cash-policy owner coordinates lock order. |
| A09-04 settlement choices | Explicit adjustment allocation(s) to original source due, remaining advance, and separately optional actual refund/receipt account legs (Cash/Bank/MFS), with calculated totals and account/session provenance. Validate that every declared leg has a source and unique account allocation; restrict refund to allowed previously paid/unallocated value if that policy is approved. | Existing return services/domain plus joint D08/MOD-006 financial posting decision. Existing one-account DTO cannot silently represent multi-account UI. |
| A09-05 sale batch | Proposed NEW atomic POST /api/v1/sales-returns/batches (path provisional; coordinator must approve). One Idempotency-Key; body includes ordered source invoices with expectedSourceVersion/expectedReturnActivityVersion, immutable saleLine IDs and qty/serial picks, one common reason/date plus per-source settlement allocations and refund account legs. Result includes one batch ID, child return IDs, exact per-source values, posting/audit refs, activity versions and replay outcome. No endpoint exists at current head. | D09 + MOD-007 + shared contracts + single composed application UOW. BLOCKED. |
| A09-06 bundle | A batch source line can reference an immutable bundleSaleLineId, recipeVersion and component source allocation IDs, partial returned sets/qty, exact lot/serial/restock/disposal choices and line-level price/cost allocation; reject component totals not backed by sale-time snapshot. Each selected set must restore original historical components, not current recipe. | D09 / MOD-019 / MOD-007. BLOCKED until bundle sale-time persistence accepted. |
| A09-07 operation result | Durable operation record/fingerprint/result for create, batch, source corrections, date changes and void where not already supported; GET/status reconciliation by operationId or strictly authoritative document+audit query; duplicate same key/body returns prior result, same key/different body rejects. No new key after timeout. | Shared operation contract/ports under exclusive coordinator ownership. BLOCKED on any existing command lacking safe replay. |
| A09-08 source correction | Typed source-specific correction commands with expectedVersion, reason, source/return dependencies, reversal and replacement posting in one UOW. Preserve source link, original allocations and creation timestamp; purchase correction needs explicit correctionVersion guard, sale already has correctionVersion. Money date-only change retains its narrow existing endpoint. | MOD-007/008 owns sale/purchase writer schema; MOD-009 owns action dispatch, not their packets. |
| A09-09 period/security | Permission at commit, step-up where mandated, both source and target period checks, source/settlement-date ordering, original closed drawer preservation, foreign-tenant 404, no PIN persisted or logged, no historical-opening exemption for actual refund. | MOD-005 CASH-P04/P05 accepted, MOD-006 relationship, period/security owner. |
| A09-10 reads and audit | Return/void/source detail reads expose real immutable backend ULIDs, source reference, original and corrected/reversed posting chain, version, reason, operation status, actual settlement legs and discrepancies; Daybook/Party/Audit are derived read models only. | MOD-015 and MOD-009 read adapters; no direct projection edits. |

Proposed batch server algorithm: validate/normalize/fingerprint exactly once; open tenant-scoped UOW; require permission and period; lock all selected source documents in ascending immutable ID order and the relevant lines, lots, source activity, serials and settlement/drawer rows in documented canonical order; re-read all versions/caps/allocations; validate every bundle component and accounting leg; derive historical amounts/cost and all source return documents; post all documents, inventory movements, balanced journals, settlement allocations, audit/outbox and durable operation result; commit once. Any failing source causes zero posted children. The handler must not internally loop through publicly exposed transaction-owning services that each commit independently.

### 19.5 Error and uncertain-outcome protocol

- Prior to POST, retain exact original draft, selected source/line IDs, expected versions, normalized serialized body and stable operation ID. UI Preview and live POST are separate modes; a live failure never falls back to preview mutations.
- Validation/cap/permission/period/foreign-tenant failure: show typed error, preserve user choices and operation ID for inspection, do not consume draft or print success.
- Stale version/activity: fetch authoritative source and settlement facts, show changes to the user; a genuinely revised command is a **new confirmed intent with a new ID**, never an automatic blind replacement.
- Timeout, connection reset, tab resume or HTTP 5xx after POST: outcome is UNKNOWN, not failure. Query authoritative operation status or replay the **same key and byte-equivalent semantic payload** only on a confirmed idempotent endpoint. Do not create new refund, duplicate customer credit, or print/close as success before reconciliation.
- Existing date-change/void endpoints without verified operation replay: reconcile posted document version, audit event and reversal/repost first; do not blindly resubmit after unknown response. A future approved durable operation-result amendment should close this gap.
- Success: replace preview source state with actual server response, invalidate Sales/Purchases/Party/Daybook/returnable/stock/account/credit reads scoped to tenant+actor+session epoch, retain audit history; only then clear draft and enable print.

### 19.6 Dependency handoff, exact future allowlists and exclusive ownership

No change to MOD-007 or MOD-008 packets in this documentation PR. Accept their concrete tested paired SHA/contracts first: invoice immutable line/discount/unit/cost/source allocations; purchase serial/lot/split-settlement and correction version; source-owned sale cancel and purchase void. Other required accepted seams: MOD-000/FND auth/tenant/operation transport; MOD-002/003 historical multilevel units; MOD-004/006 role-scoped party and finance settlement; MOD-005 cash-session ON/OFF including return callers and date changes; D09/MOD-019 bundle source snapshots; MOD-015 source read routing; MOD-022 period policy. MOD-018 installment allocations may be relevant when original sale uses installments; do not void an active schedule by projection edit.

**This documentation revision's sole allowed write:** docs/integration/modules/MOD-009-returns-corrections.md on isolated documentation branch. Everything else is READ ONLY. Future proposed task-specific paths (NOT YET ALLOWED; coordinator must split/reserve exactly):

- FE T01: src/pages/Sales.tsx; src/utils/salesReturn.ts; src/integration/returns.ts (proposed); tests/integration-returns-corrections.test.ts (proposed); scripts/integration-returns-corrections-browser.cjs (proposed).
- FE T02: src/pages/Purchases.tsx; src/components/purchases/PurchaseSourceDialog.tsx; src/utils/purchaseSource.ts; src/integration/returns.ts. Do not write PurchaseEditor or purchase service until MOD-008 explicitly hands off.
- FE T03: src/pages/Parties.tsx; src/pages/Daybook.tsx; src/pages/AuditLedger.tsx; src/components/audit/AuditEditDialog.tsx; src/components/audit/AuditDetailsDialog.tsx; src/integration/corrections.ts (proposed). Preserve all route and action affordances. MOD-015 owns its own read-model packet.
- FE T04: src/pages/Sales.tsx; src/bundles/bundleReturn.ts; src/integration/returns.ts. Requires accepted immutable bundle contract before any write.
- BE existing services to inspect/reserve narrowly: packages/core-application/src/returns/create-sales-return-service.ts; create-purchase-return-service.ts; packages/core-domain/src/sales/sales-return.ts; packages/core-domain/src/purchasing/purchase-return.ts; packages/adapter-postgres/src/sales-return-repository.ts; purchase-return-repository.ts; apps/api/src/returns/{sales-returns,purchase-returns}.controller.ts; return query services and repository ports.
- Shared coordination ONLY, no MOD-009 unilateral writes: packages/core-contracts/src/{returns,transaction-date,sales,purchasing}.ts and index.ts; packages/core-application/src/index.ts; adapter schema.ts, migrations, provider wiring, permission enums, cash payment account resolver, global HTTP/operation helpers, core unit types and invoice/cart shared components.
- Date-only paths packages/core-application/src/corrections/change-transaction-date-service.ts, packages/adapter-postgres/src/document-redate-repository.ts, apps/api/src/corrections/corrections.controller.ts are read scope until a separate coordinator-approved replay/period/cash owner amendment exists.

No broad src/ globs, speculative migration number, issue number, source owner or live build slot. No automatic implementation start, unreviewed common file, merge or deployment.

### 19.7 Accounting and concurrency acceptance vectors (must run after approval)

| ID | Fixture and action (minor money units, qty scale3) | Mandatory exact outcome |
|---|---|---|
| V09-01 | Sale line sold qty3000, net10000, actual historical cost7000; three separate returns qty1000 each | Combined return value exactly10000 and inventory/COGS restoration exactly7000, irrespective of current price/unit/conversion. Assert no stranded poisha and correct historical lot allocations. |
| V09-02 | Sale qty3000, previously returned1000; attempt qty2500 | Validation refusal, zero newly committed journal, stock, money, credit or audit CREATE rows. |
| V09-03 | Sale remaining2000; two concurrent distinct operation IDs each return1500 | At most one successful1500; no over-return, double serial restoration or double refund. Retry winner's same ID/body returns same result. |
| V09-04 | Same sourceLineId twice in one return payload, each qty1000 against one returnable1000 | Reject full command; no posting or duplicate rounding/serial allocation. Same serial ID twice also rejected. |
| V09-05 | Sale net10000, paid3000, due7000; return value4000, refund0 | Reduce this sale AR by4000, remaining due3000, cash0, no new payment session, original invoice lines untouched. |
| V09-06 | Sale net10000 fully paid, return value4000, refund0 | CUSTOMER_ADVANCE increases4000 (after any authorized source allocation); zero cash movement. Subsequent separate advance refund must not create another goods return. |
| V09-07 | Sale return value4000, actual refund1000 on designated drawer, residual credit3000 | Exactly one outgoing drawer movement1000 and residual credit allocated to source due then customer advance; ON requires eligible OPEN session; OFF allows sessionless journaled cash; bank-only needs no drawer session. Unpaid-source cash refund policy must be explicitly accepted before allowing that scenario. |
| V09-08 | Purchase bill net9000, paid3000, due6000; return supplier credit4000; original lot stock cost4500 including landed cost | AP reduces4000 to2000, physical cash0, inventory decreases4500 and STOCK_ADJUSTMENT recognizes500; no new sales costs or fresh purchase valuation. |
| V09-09 | Purchase return value4000, supplier actually pays shop1000, remaining credit3000 | One actual receipt leg1000 and 3000 source-AP reduction/advance as applicable; drawer ON/OFF gate by account; all legs in one UOW. |
| V09-10 | Purchase lot remaining1000; two concurrent return requests for1000; independent sale consumes same lot concurrently | At most one stock-consuming winner; lot never negative; failed transaction has no posted return, journal, audit or outbox. |
| V09-11 | Historical sale serial X and purchase lot cost; product unit renamed and bundle recipe edited later | Return matches original serial provenance, historical compound unit, original discount and lot cost; current catalog/recipe does not change amount or stock components. |
| V09-12 | Return already posted; someone sold/moved the restored serial/stock; request return void with correct version | Typed refusal with zero reversals; after valid return void, original return remains VOIDED with audit/reversal journal and original history readable. |
| V09-13 | Batch selects two invoices; second lacks qty/version/permission, first valid | Entire batch fails: zero child returns, zero cash, credit, journal, stock or outbox; retained same operation ID and full UI selection. |
| V09-14 | Two bundles from recipe version1 (2A+1B per set), current recipe version2; return one old set | Restore 2A+1B to their original component lots/serial identities and historical costs; invoice price allocation reconciles exactly; no version2 components used. |
| V09-15 | Same return operation ID replay same body, altered body, network timeout, refresh after POST | Same body yields original durable result once; changed body refused; unknown outcome preserves ID/draft and never makes a second payment. |
| V09-16 | Customer receipt dated Nov10 with allocation to Nov09 invoice; move to Nov11 | Original journal reversed on Nov10, identical journal and allocations reposted Nov11, created_at unchanged; derived Daybook and party ledger reconcile. New date before Nov09 refused. |
| V09-17 | Closed-period date change, password step-up incorrect, user lacks role, future date, drawer tied to counted closed session | All invalid moves rejected with zero posting; permitted locked-month move requires explicit acknowledgement+password and retains audit/reconciliation history. OFF setting does not erase session provenance. |
| V09-18 | Tenant A legitimate sale/purchase/return IDs submitted by tenant B; revoked user permission after modal load | 404/authorization denial according to tenant policy, no data disclosure or state change; audit follows existing security rules. |
| V09-19 | Return/correction UI open and backend POST fails or times out | All tabs, actions, Bengali labels, original line selection, unit quantities, serials, bundle choices and focused draft remain; no preview mutation/success toast/print. |
| V09-20 | Ledger/Daybook/Audit source row with printable ref equal to unrelated preview record | Source dispatch requires verified immutable source type+ID; no unrelated document modified and no direct ledger/projection update. |

Required runtime evidence: focused domain tests, repository concurrency tests on disposable PostgreSQL with separate connections, tenant RLS/permission/period/cash policy tests, React mapping/unknown-outcome tests and browser parity at 320/390/768/820/1440 in light/dark. Run actual repo lint, typecheck, boundaries, test, build and relevant Playwright gates; report command/exit per pinned pair of SHAs, not pre-existing claims.

### 19.8 Approval and dispatch status

**Recommendation: approve this amendment for review as a documentation proposal only, not the live module build.** T01 single-sale return remains conditional on historical/source version and refund/cash semantics; T02 purchase return is P0-blocked by lot locking; T03 source correction and date split is conditional on per-source routing, correction versions and idempotent unknown-outcome policy; T04 batch/bundle remains BLOCKED by D09 and a composed atomic contract. D09 bundle partial-return choices, cash-refund priority on unpaid source, and forcing customer/supplier advance instead of source due require owner business approval only after the existing source/UI intent has been precisely reconciled. Other missing locks/schema/methods are engineering amendments to be designed, not outsourced as user guesswork. Coordinator must confirm accepted dependency SHAs, Project #2/build reservation, paired PR ownership and exact allowed files before any implementation. A doc-only PR and this review are neither a build claim nor independent QA.
