# MOD-004 — Parties, role ledgers, openings and contextual payments

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000, MOD-001, MOD-006. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-004-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/components/parties/LedgerImpactAmount.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerImpactAmount.tsx#L1)
- [src/components/parties/LedgerTable.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTable.tsx#L1)
- [src/components/parties/LedgerTableResponsive.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/LedgerTableResponsive.tsx#L1)
- [src/components/parties/PartyActionSheet.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyActionSheet.tsx#L1)
- [src/components/parties/PartyAttachmentQuickPreview.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyAttachmentQuickPreview.tsx#L1)
- [src/components/parties/PartyBalanceCard.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyBalanceCard.tsx#L1)
- [src/components/parties/PartyClosingBalance.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyClosingBalance.tsx#L1)
- [src/components/parties/PartyCreditRefundDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyCreditRefundDialog.tsx#L1)
- [src/components/parties/PartyDetail.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetail.tsx#L1)
- [src/components/parties/PartyDetailAdaptive.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailAdaptive.tsx#L1)
- [src/components/parties/PartyDetailResponsive.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDetailResponsive.tsx#L1)
- [src/components/parties/PartyDirectory.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectory.tsx#L1)
- [src/components/parties/PartyDirectoryResponsive.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyDirectoryResponsive.tsx#L1)
- [src/components/parties/PartyEditorDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyEditorDialog.tsx#L1)
- [src/components/parties/PartyExcelImportDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyExcelImportDialog.tsx#L1)
- [src/components/parties/PartyFinanceDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyFinanceDialog.tsx#L1)
- [src/components/parties/PartyImportDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyImportDialog.tsx#L1)
- [src/components/parties/PartyLedgerIndicators.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerIndicators.tsx#L1)
- [src/components/parties/PartyLedgerRowActions.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerRowActions.tsx#L1)
- [src/components/parties/PartyLedgerToolbar.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbar.tsx#L1)
- [src/components/parties/PartyLedgerToolbarResponsive.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyLedgerToolbarResponsive.tsx#L1)
- [src/components/parties/PartyOpeningDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyOpeningDialog.tsx#L1)
- [src/components/parties/PartyPaymentDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyPaymentDialog.tsx#L1)
- [src/components/parties/PartySourceQuickPreview.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartySourceQuickPreview.tsx#L1)
- [src/components/parties/PartyStatementDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyStatementDialog.tsx#L1)
- [src/components/parties/PartyTransactionDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/PartyTransactionDialog.tsx#L1)
- [src/components/parties/RoleBadge.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/RoleBadge.tsx#L1)
- [src/components/parties/VendorActionDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorActionDialog.tsx#L1)
- [src/components/parties/VendorCorrectionDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorCorrectionDialog.tsx#L1)
- [src/components/parties/VendorQuickSettlementDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorQuickSettlementDialog.tsx#L1)
- [src/components/parties/VendorStatementDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/VendorStatementDialog.tsx#L1)
- [src/components/parties/partyRoleActions.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/partyRoleActions.ts#L1)
- [src/components/parties/usePartyContentTabs.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/usePartyContentTabs.ts#L1)
- [src/components/parties/usePartyDialogError.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/usePartyDialogError.ts#L1)
- [src/components/parties/usePartyDirectoryKeyboard.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/parties/usePartyDirectoryKeyboard.ts#L1)
- [src/data/parties.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/parties.ts#L1)
- [src/data/partyFixtureAdapter.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyFixtureAdapter.ts#L1)
- [src/data/partyPreviewStore.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/partyPreviewStore.ts#L1)
- [src/pages/Parties.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Parties.tsx#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/parties` | [PartiesController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/parties.controller.ts#L60) | `partyQuerySchema` | `PartyListResponse` | `ManagePartiesService.list` |
| `GET /api/v1/parties/:id` | [PartiesController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/parties.controller.ts#L68) | Inline / no body; linked method | `{ data: PartyResponse }` | `ManagePartiesService.get` |
| `GET /api/v1/parties/:id/ledger` | [PartiesController.ledger](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/parties.controller.ts#L80) | `partyLedgerQuerySchema` | `PartyLedgerResponse` | `PartyLedgerService.ledger` |
| `POST /api/v1/parties` | [PartiesController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/parties.controller.ts#L92) | `savePartyRequestSchema` | `{ data: PartyResponse }` | `ManagePartiesService.create` |
| `GET /api/v1/parties/:id/opening` | [PartiesController.opening](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/parties.controller.ts#L119) | `partyRoleSchema` | `{ data: PartyOpeningResponse  /  null }` | `ManagePartiesService.getOpening` |
| `POST /api/v1/parties/:id/opening` | [PartiesController.setOpening](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/parties.controller.ts#L137) | `openingBalanceRequestSchema` | `{ data: PartyOpeningResponse }` | `ManagePartiesService.setOpening` |
| `PATCH /api/v1/parties/:id/opening` | [PartiesController.correctOpening](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/parties.controller.ts#L161) | `correctOpeningBalanceRequestSchema` | `{ data: PartyOpeningResponse }` | `ManagePartiesService.correctOpening` |
| `PATCH /api/v1/parties/:id` | [PartiesController.update](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/parties.controller.ts#L186) | `updatePartyRequestSchema` | `{ data: PartyResponse }` | `ManagePartiesService.update` |
| `POST /api/v1/parties/:id/status` | [PartiesController.setStatus](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/parties.controller.ts#L200) | `setPartyStatusRequestSchema` | `{ data: PartyResponse }` | `ManagePartiesService.setStatus` |
| `DELETE /api/v1/parties/:id` | [PartiesController.remove](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/parties.controller.ts#L213) | Inline / no body; linked method | `void` | `ManagePartiesService.deleteParty` |
| `GET /api/v1/party-setup` | [PartyGroupsController.setup](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/party-groups.controller.ts#L36) | Inline / no body; linked method | `{ data: PartySetupResponse }` | `ManagePartyGroupsService.setup` |
| `POST /api/v1/party-setup/groups` | [PartyGroupsController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/party-groups.controller.ts#L41) | `saveCustomerGroupRequestSchema` | `{ data: PartySetupResponse }` | `ManagePartyGroupsService.create` |
| `PATCH /api/v1/party-setup/groups/:id` | [PartyGroupsController.rename](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/party-groups.controller.ts#L51) | `saveCustomerGroupRequestSchema` | `{ data: PartySetupResponse }` | `ManagePartyGroupsService.rename` |
| `DELETE /api/v1/party-setup/groups/:id` | [PartyGroupsController.remove](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/parties/party-groups.controller.ts#L66) | Inline / no body; linked method | `{ data: RemoveCatalogEntryResponse }` | `ManagePartyGroupsService.remove` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-004-F01 | Customer/Supplier/Vendor identity and edit — `Parties.saveParty; PartyEditorDialog` | ADAPT | parties; party-setup | Use stable IDs, role-specific query, versions; all-role global pagination requires extension. | PARTY-SAVE |
| MOD-004-F02 | Opening and correction — `PartyOpeningDialog` | ADAPT | GET/POST/PATCH parties/:id/opening | No balance assignment. Create/adjust one explicit role and retain reversal history. | PARTY-LEDGER |
| MOD-004-F03 | Ledger, receipts, payments, invoice/return navigation — `Parties.handleLedgerAction` | ADAPT | parties/:id/ledger; customer-payments; suppliers/payments | Delegate each source to owning service; retain selected party/role/filter/scroll. | Depends on transaction modules |
| MOD-004-F04 | Owner/Lender/Borrower/Payee, attachments and notes — `PartyFinanceDialog; PartyTransactionDialog` | EXTEND | No matching full trading-party contract | Do not coerce a finance role or free-form note into an unrelated journal operation. | D08 |

## 5. Proposed architecture and unresolved approval

Party role query is mandatory. Balance.netMinor positive is receivable, negative payable; store role-specific identity and do not recompute from current page. Use CORE_WORKFLOWS. Payment UI depends on accounts but party directory read does not: task-level dependencies may be narrower than the full module dependency.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D08.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [parties fields](../contracts/parties.md)
- [party-ledger fields](../contracts/party-ledger.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/parties-ledgers.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/data/parties.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/partyFixtureAdapter.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/partyPreviewStore.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/Parties.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/parties-ledgers.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-parties-ledgers.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-parties-ledgers-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-004-T01: Customer/Supplier/Vendor identity and edit

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Parties.saveParty; PartyEditorDialog`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `parties; party-setup`. **Gate:** PARTY-SAVE.

**Algorithm / expected output:** Use stable IDs, role-specific query, versions; all-role global pagination requires extension. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-parties-ledgers.test.ts` case `MOD-004-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-004-T02: Opening and correction

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `PartyOpeningDialog`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `GET/POST/PATCH parties/:id/opening`. **Gate:** PARTY-LEDGER.

**Algorithm / expected output:** No balance assignment. Create/adjust one explicit role and retain reversal history. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-parties-ledgers.test.ts` case `MOD-004-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-004-T03: Ledger, receipts, payments, invoice/return navigation

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Parties.handleLedgerAction`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `parties/:id/ledger; customer-payments; suppliers/payments`. **Gate:** Depends on transaction modules.

**Algorithm / expected output:** Delegate each source to owning service; retain selected party/role/filter/scroll. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-parties-ledgers.test.ts` case `MOD-004-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-004-T04: Owner/Lender/Borrower/Payee, attachments and notes

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-001, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `PartyFinanceDialog; PartyTransactionDialog`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `No matching full trading-party contract`. **Gate:** D08.

**Algorithm / expected output:** Do not coerce a finance role or free-form note into an unrelated journal operation. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-parties-ledgers.test.ts` case `MOD-004-F04 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D08

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-004-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.

## Revision 2 requirement precedence

[Integrate existing capabilities first, then extend missing UI parity](../HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md). [Cash-session classification](../tasks/CASH_SESSION_POLICY.md): historical opening balances, including lender/borrower openings, do not require an active session; actual tracked-cash movements do when ON, and OFF permits ordinary sessionless cash transactions. Do not add a cash check to historical openings or treat a credit/unpaid document as a cash payment. All existing UI features remain in scope; unsupported normal workflows keep their Stage B extension tasks and cannot be declared complete after compatible-slice integration alone.
