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


---

## 19. Source-verified MOD-004 approval amendment — 2026-11-11 (documentation only)

**Status: PROPOSED / NOT BUILD-APPROVED.** This amendment supersedes any incompatible earlier claim in this packet, but does not change the master plan, REVIEW, DECISIONS, CASH_SESSION_POLICY, code, schema, issue, setting, or production data. It is intended for owner review and coordinator assignment.

**Paired GitHub heads verified with git ls-remote on 2026-11-11:** HisabIQ UI main = **2e16821ba622192c69e5f5cc83aba93f70ec0638**; NestSherERP adoption branch chore/hisabiq-adoption-runtime-a01 = **74bb37f2ae6441689b1ee73f0c7ce51e03bcb1f5**; backend main = **b1bad29961a968829be622dc812d476773e6db78**, reference only. Local UI main was clean at matching HEAD; backend source at the exact adoption head was inspected through a fetched Git object, without checkout or application edits. The older baseline pair in §1 remains historical evidence, not the launch target. These are observation-time heads; the coordinator must reverify before dispatch.

### 19.1 Approval overview (12 sentences)

1. MOD-004 will retain the existing HisabIQ React Parties directory, all seven relationship labels, responsive detail/ledger, contextual actions, imports, notes, attachments, keyboard flow, and bilingual presentation without replacing its components.
2. One tenant-scoped party identity may simultaneously be Customer, Supplier, Vendor, Lender, Borrower, Owner, and Payee, but each relationship retains its own accounting balance and source history.
3. The adoption backend already exposes real party identity create/list/get/update/status/delete, customer-group setup, one-role openings and corrections, and a journal-backed party statement for its three trading roles.
4. Its current party statement and party balance intentionally aggregate **all roles for one party**, so they cannot replace a relationship-specific HisabIQ ledger and present an authorization/financial isolation gap.
5. The existing backend opening writer for Customer/Supplier and payable Vendor posts against Opening Equity with no cash/bank account and no cash-session prerequisite.
6. The frontend permits multiple role openings in one creation, zero-to-clear and a Vendor receivable; the current backend supports one opening in create, refuses zero, and restricts Vendor openings to payable.
7. Its LOAN money-account opening is a historical loan-liability journal, but it does not establish the required identity-linked Lender and Borrower relationship contracts.
8. The existing Owner and loan cash movements can be reused at the account-posting level only after identity mapping, source ownership and MOD-005 cash-session correctness are accepted.
9. Current customer and supplier settlement APIs support a single account leg, while the HisabIQ dialogs show multiple accounts, discount, invoice allocation and source correction/refund actions, so lossless complete settlement needs a composed service.
10. Historical opening and opening correction must remain separate from current money received/paid, never fabricate a receipt/payment or acquire a drawer session.
11. Any actual tracked-drawer settlement follows the ON/OFF tenant setting and eligible-session decision supplied by MOD-005, while Bank/MFS-only and unpaid transactions remain session-free.
12. Implementation will be split into coordinator-approved Stage A reuse and Stage B extensions after exact account identities, role-scoped reads, contracts, tests, migration ownership and a single reserved build worker are approved; this draft changes documentation only.

### 19.2 Source trace and contract evidence

Frontend source of truth: src/pages/Parties.tsx (saveParty, handleLedgerAction, onRecordPayment/onRefundCredit/onRecordFinance/onSetOpening, onEditSourcePayment/onReverseSource); src/types/erp.ts:148-171; src/types/partyLedger.ts:4-87; src/components/parties/{PartyEditorDialog,PartyOpeningDialog,PartyPaymentDialog,PartyFinanceDialog,PartyCreditRefundDialog,PartyTransactionDialog,PartyDetail,PartyDetailResponsive,PartyDetailAdaptive}.tsx; src/components/parties/partyRoleActions.ts; src/data/partyPreviewStore.ts; src/utils/{partyIdentity,partyFinance,partyOpening,partySettlement,partyLedger}.ts; src/vendor/{vendorPreviewStore,vendorPartyProjection,vendorRoute}.ts. In src/pages/Parties.tsx, these write callbacks **currently call dispatchPartyPreview**, not the Nest backend; the preview response/toasts must never be mistaken for persisted accounting.

Backend at the verified adoption head: apps/api/src/parties/{parties.controller,party-groups.controller}.ts; apps/api/src/{sales/customer-payments.controller,purchasing/supplier-payments.controller,money/accounts.controller,expenses/expenses.controller}.ts; packages/core-contracts/src/{parties,party-ledger,sales,purchasing,money,expenses}.ts; packages/core-application/src/parties/{manage-parties-service,party-ledger-service,party-repository}.ts; packages/core-application/src/{sales/receive-payment-service,purchasing/pay-supplier-service,purchasing/payment-account,money/manage-accounts-service,money/cash-movement-service,expenses/manage-expenses-service}.ts; packages/core-domain/src/{parties/opening-balance,accounting/account}.ts; packages/adapter-postgres/src/party-repository.ts.

**Verified severe mismatch:** PartyLedgerService.ledger accepts partyId and date/paging only; it authorizes when the caller may view **any** of the party's roles and invokes PartyRepository.listLedgerLines/sumLedgerBefore by partyId, with no role predicate. Its closingBalance is partyBalanceOf(party.balanceNetMinor), also all-role. A customer-authorized reader may therefore see supplier-role lines when the same identity has two roles; this is both a role-visibility and ledger-segregation blocker, not a UI formatting adjustment. ManagePartiesService.getOpening also authorizes any held party role, not necessarily the requested opening role; require role-specific permission on that read. A generic all-role statement may be separately useful but MUST NOT become the default relationship ledger or sole balance.

### 19.3 Field and action disposition matrix

| Existing UI field/action | Actual backend request/service and shape | Classification | Required mapping, blocker or preservation |
|---|---|---|---|
| Search/role directory, All, loans, owners | GET /api/v1/parties; partyQuerySchema requires role CUSTOMER/SUPPLIER/VENDOR, cursor/limit/sort; ManagePartiesService.list | ADAPT/BLOCKED | Map one trading role losslessly; all-role globally sorted/paged identity-deduplicated directory and finance role filters need server contract. Do not concatenate partial pages or net roles. |
| Select party / change relationship | GET /api/v1/parties/:id; ManagePartiesService.get | ADAPT | Resolve immutable ULID, preserve selected relationship and workspace returnTo; frontend party-preview-* IDs never sent. Require per-relationship viewing authority on its balance. |
| Add/edit person and trading roles | POST /api/v1/parties with Idempotency-Key; PATCH /api/v1/parties/:id with version; ManagePartiesService.create/update | REUSE/ADAPT | name→name, phone blank→null if not Customer, area→address, roles map Customer/Supplier/Vendor to uppercase; populate exact nullable fields (guardianName,nid,email,notes,customerGroupId,creditLimitMinor); status separate. Unsupported nameBn, image/avatar/lastActivity and finance roles are not silently dropped or mapped to a trading role. Backend roles max 3, requires phone for Customer. |
| Quick add / existing identity | frontend quickAddPartyPreview matches normalized name + phone and adds role; backend findCustomerIdByPhone only checks customers | EXTEND | Tenant-scoped identity resolution, ambiguity/conflict response, explicit add-relationship update using version, inactive refusal and draft preservation. No implicit duplicate or arbitrary cross-role phone merge. |
| Activate/deactivate/delete | POST /api/v1/parties/:id/status; DELETE /api/v1/parties/:id via ManagePartiesService | REUSE/ADAPT | Respect isSystemReserved, hasLedgerEntries, version/permissions; posted-history party must deactivate, not hard-delete. Preserve contextual UI recovery action without claiming global recycle restoration. |
| Party groups | GET /api/v1/party-setup; POST/PATCH/DELETE /api/v1/party-setup/groups | REUSE | Existing customerGroupId/master mapping only; never invent finance groups. |
| Create one trading opening | POST /api/v1/parties/:id/opening or optional single opening within POST /parties; openingBalanceRequestSchema | REUSE/ADAPT | relationship→role, side debit→RECEIVABLE, credit→PAYABLE, positive decimal Taka→integer amountMinor using exact decimal parser, date→businessDate. No session, no money account, no payment. |
| Multiple openings at first party save | PartyEditorDialog sends array per role; POST /parties supports at most one opening | EXTEND | One atomic create-with-relationships-and-openings service, or explicit two-phase UI with no false all-done claim; **do not** chain unguarded HTTP posts and declare success. |
| Read/correct existing trading opening | GET /api/v1/parties/:id/opening?role=; PATCH same path with version and Idempotency-Key | REUSE/ADAPT | Correction reverses/reposts original against OPENING_EQUITY, with both periods validated and audit retained; frontend note and zero-to-clear need approved additions. Vendor receivable currently rejected. No cash/session. |
| Relationship ledger / balance card / statement / date range | GET /api/v1/parties/:id/ledger (partyLedgerQuerySchema: fromDate,toDate,cursor,limit; unwrapped response) → PartyLedgerService | **BLOCKED for live role view** | Require server-verified relationship scope, opening brought forward, role-only running/closing, cursor and source identifiers. Current partyId-only net ledger is incompatible. Server source data overrides preview totals. |
| Customer receipt | POST /api/v1/customer-payments; receiveCustomerPaymentRequestSchema; ReceiveCustomerPaymentService | REUSE for single leg, EXTEND for full dialog | customerPartyId, one accountCode, amountMinor, saleIds, businessDate, note; Idempotency-Key. Frontend splits/discount/credit allocation cannot be discarded or posted as multiple independent requests. |
| Supplier settlement | POST /api/v1/suppliers/payments; paySupplierRequestSchema; PaySupplierService | REUSE for single leg, EXTEND for full dialog | supplierPartyId, one accountCode, amountMinor, purchaseId, businessDate, note; Idempotency-Key. Split/rebate and advance/credit rules need explicit composed contract. |
| Source payment correction/void | PATCH /customer-payments/:id and POST /customer-payments/:id/void; PATCH /suppliers/payments/:id and POST /suppliers/payments/:id/void | REUSE/ADAPT | Actual version and reason, owning-service journal reversal/reallocation, correct return envelope: customer correction returns receipt; supplier correction and void return {data:{ok:true}}; reload source. Never DELETE a ledger line. |
| Customer/supplier credit refund | PartyCreditRefundDialog and onRefundCredit preview | BLOCKED | No matching verified credit-refund endpoint in inspected controllers. Source credit eligibility, advances, allocated invoice impact, payment legs, audit and policy need new owner-approved contract. |
| Vendor work/payment/receipt and vendor given/taken | vendorRoute/vendorPartyProjection and PartyDetail vendor actions | EXTEND/BLOCKED | Existing trading Vendor supports role and VENDOR_PAYABLE opening, but vendor-work receivable/payout/receipt is not proven equal to supplier payments. Keep vendor's two sides distinct; source-owning vendor contract required. |
| Owner add capital/drawing | Frontend Owner Credit/Debit → backend CashMovementService OWNER_INJECTION/WITHDRAWAL posts OWNER_CURRENT_ACCOUNT | ADAPT/BLOCKED | Posting primitive exists; person-specific Owner relationship is not represented by fixed account alone. Bind verified party identity and source/owner attribution first. Current movement is money, not historical capital opening. |
| Lender receive/repay | Frontend Lender Credit/Debit → money account LOAN:{id}, CashMovementService LOAN_RECEIVED/REPAYMENT | ADAPT/BLOCKED | Existing LOAN liability account and its non-cash opening exist, but loan account ID is not a verified party relationship ID. Approve one-to-one/one-to-many account linkage, principal rules, repayment allocation and interest treatment. |
| Borrower lend/collect | Frontend Borrower Debit/Credit; no corresponding borrower receivable account/loan movement contract | EXTEND | Separate loan receivable account/subledger with borrower party ID; never represent borrower as LOAN liability or Supplier/Customer. |
| Payee selection | Expenses accepts payeePartyId; ManageExpensesService writes a party-linked expense line | REUSE identity reference, EXTEND relationship ledger | Existing payee reference does not add Payee to partyRoleSchema or create a standalone payable; unpaid/partial payee liability depends on MOD-007/D07. |
| Notes, attachments, import, print and contextual source navigation | Frontend preview notes, purchase receipt attachment, import/dialog and returnTo | ADAPT/EXTEND | Party save notes is one profile field, not independent audit note entries. Document attachments and source metadata need source-owned APIs. Preserve import verification, source links, statement, keyboard and responsive behavior; no fake posting. |

**Transport envelope trap:** list parties returns data/page/summary, ledger returns the PartyLedgerResponse directly, most mutations return {data:...}, and supplier correction/void return {data:{ok:true}}. The adapter must follow each exact response, never assume one universal data wrapper. A successful HTTP response alone does not certify full semantic parity.

### 19.4 Historical openings — journal truth and finance gap

| Role + direction (positive 500000 minor = ৳5,000) | Required historical posting | Current state |
|---|---|---|
| Customer owes business | Dr AR 500000 (party); Cr OPENING_EQUITY 500000 | VERIFIED existing openingBalancePosting |
| Customer paid historical advance | Dr OPENING_EQUITY 500000; Cr CUSTOMER_ADVANCE 500000 (party) | VERIFIED existing |
| Supplier owed by business | Dr OPENING_EQUITY 500000; Cr AP 500000 (party) | VERIFIED existing |
| Supplier holds old advance | Dr SUPPLIER_ADVANCE 500000 (party); Cr OPENING_EQUITY 500000 | VERIFIED existing |
| Vendor owed by business | Dr OPENING_EQUITY 500000; Cr VENDOR_PAYABLE 500000 (party) | VERIFIED existing; opposite direction not accepted |
| Lender principal already owed | Dr OPENING_EQUITY 500000; Cr dedicated lender LOAN liability 500000, linked to party/relationship | LOAN-account opening exists, but party link/role opening missing |
| Borrower principal already due | Dr dedicated BORROWER_LOAN_RECEIVABLE 500000 (linked to borrower); Cr OPENING_EQUITY 500000 | PROPOSED account/relationship contract, no existing matching fixed/parameterized account |
| Owner historical capital | Dr OPENING_EQUITY 500000; Cr party-attributed owner equity/current-capital subledger 500000 | PROPOSED attribution; existing OWNER_CURRENT_ACCOUNT alone is not per owner |
| Payee historical payable | Only when a real independently identified historical obligation exists: Dr OPENING_EQUITY, Cr approved payable subledger | PROPOSED conditional on obligation source/D07; do not generate a liability merely from Payee role |

All historical opening rows are source type OPENING_BALANCE / approved relationship-opening type, **not** current receipt, payment, cash movement, capital injection or loan-received movement. No payment account, cash session ID, synthetic cash row, available-cash change, bank reconciliation row or drawer count may be produced. Business date may be historical but is subject to period locks. Zero means no new opening on initial create; clearing an existing opening requires a separately approved reversal-only correction with version, reason and audit (current trading request rejects amountMinor=0). After any correction, old journal entries remain immutable and the opening document version advances. Distinguish an actual backdated settlement from a historical opening by **source class and accountable event**, not by calendar date alone.

For loan-account openings via ManageAccountsService.postOpening, the account-opening journal already has no partyId. It cannot be reused as the Lender relationship's party ledger until a documented party-account link plus relationship-scoped projection/correction is implemented. Existing account opening may be reused as a single writer only if it becomes source-safe and does not create a second opening when an associated relationship is created.

### 19.5 Required new contracts — proposals, not existing endpoints

**A. Identity and role-scoped reads.** Propose tenant-scoped relationship membership by stable partyId + relationship kind and state/version; preserve the existing party table as identity authority and compatible trading role APIs. Add a globally sorted/paged directory view with deduplicated identities, role-preserving search/status/groups and per-relationship unsigned due/advance; a separate all-role summary cannot subtract one relationship from another. Extend GET /api/v1/parties/:id/ledger with required relationship (or introduce an equivalent explicit role-scoped path) and a role-scoped permission check. Ledger response must carry relationship, economic source family, immutable source ID/type/number, original/correction/void flags, source business date, signed amount, debit/credit, per-role opening-forward/running/closing balance, source action eligibility, and server cursor; keep existing all-party endpoint behavior only for a separately permissioned consolidated view.

**B. Atomic party create with multiple historical openings.** Proposed request fields: profile with server-approved identity fields, relationships[] (distinct enum: CUSTOMER, SUPPLIER, VENDOR, LENDER, BORROWER, OWNER, PAYEE), openings[] of {relationship, direction, amountMinor>0, businessDate, optional note}, Idempotency-Key. Validate role ownership/permission and one opening per relationship; create identity + relationships + openings/journals + audit/outbox in **one** UOW, roll back whole command on any rejected item. Return stable partyId, versions, saved relationships/opening documents and role balance summary. For an existing party, relationship addition requires party expectedVersion, duplicate check and no accidental role removal. Do not broaden current SavePartyRequest silently; version/additive migration contract is separate.

**C. Relationship historical opening/correction.** For missing finance relationships, proposed POST /api/v1/parties/:id/relationship-openings and PATCH /api/v1/parties/:id/relationship-openings/:openingId, with relationship, direction, strictly parsed amountMinor, businessDate, owner-approved reason/note; correction also expectedVersion and idempotency key. Source owner checks tenant, permission, unique opening per relationship/account-identity, original/target periods, and immutable reversal/repost through OPENING_EQUITY. The correction-to-zero contract must explicitly allow reversal-only without fake zero journal. Trading-role paths remain supported. **Not** a frontend POST to /money/movements, and no cash-policy lookup.

**D. Current settlements and finance movements.** Propose source-owned composed command with {partyId, relationship, sourceDocumentIds/allocations, businessDate, operationId, moneyLegs:[{accountId, method, amountMinor}], discountMinor, reason, note, expectedVersion where correcting}. Server resolves account IDs to validated account codes, totals every leg exactly, enforces approved allocation/discount/provenance, calls shared MOD-005 policy on verified designated-drawer legs, and commits one atomic journal/document/allocations/audit/outbox/idempotency result. Lender flows use linked LOAN liability; Borrower uses receivable and repayment; Owner uses attributed equity/current account; Payee settlement only on an actual expense/payable source. Interest and owner distributions must be separately characterized, never folded silently into principal or operating cash. Customer advances/refund must be source-proven and cannot be refunded from unverified historical credit without the approved rule. Corrections invoke the original source writer/version, not a generalized ledger editor.

### 19.6 Backend gap register, priority and owning dependency

| Gap | Severity | Exact missing capability / disposition | Owner / gate |
|---|---|---|---|
| G04-01 | P0 | Existing party ledger nets all trading role balances and grants any-role visibility over all role lines | MOD-004 role-aware repository/query/auth + security QA |
| G04-02 | P0 | No seven-relationship identity/role contract or finance party attribution; max three trading roles | D08 + account-identity design, coordinator schema ownership |
| G04-03 | P0 | Lender party-linked opening and Borrower receivable opening absent; distinct account/equity rules unresolved | D08/MOD-006 money-account identities |
| G04-04 | P0 | Caller-wide cash-session OFF behavior not implemented in resolvePaymentAccount/CashMovementService; actual settlements cannot safely cut over | MOD-005 D05/shared policy and locked settings transition |
| G04-05 | P0 | UI multi-account settlements, discounts, finance splits cannot be represented by one-account customer/supplier request | MOD-005 account policy + transaction-owner composed writers |
| G04-06 | P1 | Atomic multi-relationship opening at first create absent; one opening only; zero-clear/note/finance directions mismatch | MOD-004 opening extension with period/idempotency |
| G04-07 | P1 | Role-specific all-directory pagination and role-specific statement/permission missing | MOD-004 read adapter/contract |
| G04-08 | P1 | Owner fixed account is not per-person; existing LOAN account is not linked to party; Borrower loan account missing | MOD-006 account identity + D08 |
| G04-09 | P1 | Vendor receivable/work settlement not equivalent to VENDOR_PAYABLE opening; payee cannot be added as a role | Vendor module/MOD-007 expense D07 |
| G04-10 | P1 | Credit refund / advance allocation and source reversal require provenance, versions and approved source-specific rules | Sales/purchases/returns and MOD-005 |
| G04-11 | P1 | Preview-only notes, import, attachment, CSV dedup and return-to workflows not fully server-backed | MOD-004 + owning source modules |
| G04-12 | P1 | Frontend store uses floating Taka/fixture IDs; backend requires exact poisha integer and real ULIDs, distinct response envelopes | MOD-000 exact decimal/session adapter |

Account identity prerequisites include: actual tenant-owned CASH/BANK/MFS accountId and immutable accountCode; authoritative isDrawer, status and service-side permissions; linked per-lender LOAN liability identity; new per-borrower loan receivable identity; per-owner subledger attribution; genuine expense payee source; relationship-to-account bridge with no duplicate opening and safe migration/reconciliation. This is not permission to modify the closed account chart, schema, shared contracts or migration files in a module worker branch. Coordinator must approve D08 and reserve migrations/shared files first. MOD-001 settings permission/field visibility, MOD-000 authentication/tenant/transport, MOD-006 account identity and MOD-005 actual-cash policy are hard prerequisites for monetary cutover. Sales/Purchases/Returns/Expenses/Vendor owner services are dependencies for their own contextual actions; directory read-only work can be scoped earlier. Reports/Analytics remain excluded.

### 19.7 MOD-005 handoff: exact cash boundary

- Historical party, lender, borrower and owner capital openings (including correction) call their opening service only; **NO session** ON or OFF; no real cash account leg or cash movement.
- Current receipt/payment, owner injection/drawing, loan received/repayment, lending/collection, vendor settlement, credit refund or source correction affecting the tracked drawer: **ON** requires matching eligible open session; **OFF** posts normally with null sessionId, never attached to old/future session.
- Bank/MFS-only, credit/unpaid transactions, notes, role edits and previews require no drawer session. Split cash+bank is one UOW: an ineligible drawer leg rejects the **entire** command.
- The backend currently checks findOpenSession in packages/core-application/src/purchasing/payment-account.ts::resolvePaymentAccount and CashMovementService.record without effective OFF handling. MOD-005 must supply one shared policy and approved tenant serialization lock to these callers **before** MOD-004 activates current payment flows.
- The MOD-005 coordinator owns the setting transition, isDrawer re-read, lock ordering, sessionId assignment, cash balance checks, closed-day provenance, and caller-wide remediation. MOD-004 owns semantic effect classification and amount/account allocations, not a second session bypass or duplicated locking service.
- No public historical=true / skipCashSession / isOpening bypass flag: only the source-owning server service may classify source events. Backdated money still follows current money rules; OFF does not erase historical session associations.

### 19.8 Proposed future implementation file allowlists (all writes currently forbidden)

**This docs-only PR allowlist = exactly this file: docs/integration/modules/MOD-004-parties-ledgers.md.** No application, backend, migration, CI, AGENTS.md, other Markdown or financial data may change in this PR.

Future T01 identity/list candidate frontend paths: src/pages/Parties.tsx; src/components/parties/PartyEditorDialog.tsx; src/data/partyPreviewStore.ts; src/utils/partyIdentity.ts; proposed src/integration/parties.ts. Candidate backend: apps/api/src/parties/parties.controller.ts; packages/core-application/src/parties/manage-parties-service.ts; packages/core-application/src/parties/party-repository.ts; packages/adapter-postgres/src/party-repository.ts; packages/core-contracts/src/parties.ts (**coordinator-owned**).

Future T02 opening candidate frontend: src/components/parties/PartyOpeningDialog.tsx; src/components/parties/PartyEditorDialog.tsx; src/pages/Parties.tsx; src/integration/parties.ts. Backend: packages/core-domain/src/parties/opening-balance.ts; packages/core-application/src/parties/manage-parties-service.ts; packages/adapter-postgres/src/party-repository.ts; apps/api/src/parties/parties.controller.ts; packages/core-contracts/src/parties.ts (**shared**). Finance schema/migration paths **UNASSIGNED** pending migration owner/number.

Future T03 scoped ledger/settlement candidate frontend: src/pages/Parties.tsx; src/components/parties/PartyDetail.tsx; src/components/parties/PartyDetailResponsive.tsx; src/components/parties/PartyPaymentDialog.tsx; src/components/parties/PartyTransactionDialog.tsx; proposed src/integration/partyLedger.ts. Backend: packages/core-application/src/parties/party-ledger-service.ts; packages/core-application/src/parties/party-repository.ts; packages/adapter-postgres/src/party-repository.ts; packages/core-contracts/src/party-ledger.ts (**shared**); existing sales/receive-payment-service.ts, purchasing/pay-supplier-service.ts and controllers as exact source owners (**coordinator-assigned only**).

Future T04 finance candidate frontend: src/components/parties/PartyFinanceDialog.tsx; src/components/parties/partyRoleActions.ts; src/utils/partyFinance.ts; src/types/partyLedger.ts (**shared UI-type ownership**); src/pages/Parties.tsx. Backend concrete new relationship services, accounts, tables and migration filenames **UNASSIGNED** until D08 and chart decision; money/cash-movement-service.ts and money/manage-accounts-service.ts belong with MOD-005/MOD-006 coordinators, not MOD-004's unilateral patch.

Supporting read-only inspection, **not blanket write access**: src/data/{parties,partyFixtureAdapter,partyPreviewStore}.ts; src/types/erp.ts; src/components/parties/{PartyCreditRefundDialog,PartyLedgerToolbar,LedgerTable,PartyStatementDialog,PartyAttachmentQuickPreview}.tsx; vendor and expense components/services; source corrections, backend contracts and Postgres schema. Shared frontend src/App.tsx, src/types/erp.ts, src/integration/{http,session,operation,decimal,errors}.ts; backend packages/core-contracts/src/index.ts, account codes, core-application index, provider wiring and all migrations require **explicit coordinator reservation**. CORE_WORKFLOWS proposes two adapters (src/integration/parties.ts and partyLedger.ts), whereas original §10 proposes one (src/integration/parties-ledgers.ts): resolve this naming conflict in the coordinator's allowlist; do **not** create both sets by default. Tests proposed only after task-specific authorization: tests/integration-parties-ledgers.test.ts (or named existing test target) and scripts/integration-parties-ledgers-browser.cjs; neither is created here.

### 19.9 Deterministic verification vectors for approval

| ID | Setup / action | Required assertion (future disposable-DB tests, NOT executed here) |
|---|---|---|
| V01 | One party with Customer opening 500000 Dr AR and Supplier opening 300000 Cr AP | Customer receivable=500000 and Supplier payable=300000 independently, not net=200000; UI All does not invent single figure. |
| V02 | Same identity has Customer+Supplier; reader has Customer permission only | Customer ledger exposes no Supplier opening/payment/metadata; access to Supplier ledger denied; all-role view separately privileged. |
| V03 | Customer historical receivable 500000, no session, feature ON | Exactly Dr AR 500000 / Cr OPENING_EQUITY 500000; zero cash movement, zero session association. |
| V04 | Correct opening 500000→450000 with version; replay stale version | Original journal immutable, correction reversal/repost net AR 450000, equity balances, second stale request no new journal. |
| V05 | Customer advance and Supplier advance for same identity | Customer advance liability and Supplier advance asset remain in separate role control accounts; no netting or refund eligibility invented. |
| V06 | Vendor receivable in frontend | Existing backend refuses without change; approved Stage B adds correct vendor asset contract or retains explicit unsupported state without coercion to Supplier. |
| V07 | Lender historical opening 700000 with session ON but no session row | Dr OPENING_EQUITY 700000 / Cr party-linked LOAN liability 700000, no money account movement or session. |
| V08 | Borrower historical opening 300000 | Dr party-linked BORROWER_LOAN_RECEIVABLE 300000 / Cr OPENING_EQUITY 300000, no cash movement and no LOAN liability. |
| V09 | Owner historical capital 400000 for owner A and 100000 for owner B | Independent owner subledger balances; no current owner injection; no cash session. |
| V10 | ON + no eligible drawer session; receive current customer cash 100000 | Entire receipt rejects CASH_DAY_NOT_STARTED; no cash line, receipt, allocation or source row; draft and operation ID retained. |
| V11 | OFF + no open session; receive customer cash 100000 | Exactly one current receipt/journal, sessionId null, account balance increases; repeat same key same effect, different body same key rejected. |
| V12 | ON + Bank/MFS-only current supplier 100000 | No session requirement; exactly one supplier payment and corresponding journal; cash drawer unchanged. |
| V13 | ON + mixed 60000 cash + 40000 bank and missing session | Whole 100000 payment fails with zero source/journal/allocations; no partial bank side posting. |
| V14 | ON + mixed cash/bank with eligible session | One source payment with two persisted legs; total=100000 and exact same source allocations; replay makes no duplicate. |
| V15 | Historical opening edit amount=0 | Existing endpoint rejects; proposed correction-to-zero performs one audited reversal-only, no current payment and no session. |
| V16 | Two initial openings, second invalid/stale foreign-tenant relation | Atomic create rolls back identity and all openings; no partial source or cross-tenant row. |
| V17 | Duplicate name or phone / role add on existing party | Stable identity retained only on verified match with explicit role addition/version; ambiguous match requires selection; inactive/system reserved refused. |
| V18 | Customer receipt/source correction or void | Original posting remains inspectable; linked source/service owns reversal, version, reason and allocation; no direct journal deletion. |
| V19 | Payee expense linked via payeePartyId | Payee identity remains stable, no fictitious loan/customer balance; unpaid expense only posts if independently approved accrued-liability contract exists. |
| V20 | Close session then alter old settled receipt or toggle OFF/ON | Closed-session provenance and immutable close remain; mutation obeys approved MOD-005 correction/impact safeguards, not an unrestricted backdated rewrite. |
| V21 | Foreign-tenant party, opening ID, account ID, source ID, cursor; role permission revoked between load/save | Reject uniformly (404/403 as appropriate); zero mutation and no metadata disclosure. |
| V22 | UI mobile 320/390, tablet 768/820, desktop 1440, light/dark, keyboard; source navigation and failed POST | Retain dialogs, all seven role options, working focus/returnTo/filter/scroll/drafts, accurate preview vs live label, no fake success or fallback. |
| V23 | Ledger date range and cursor page 2 | Opening-forward includes prior entries; role-specific signed running balance and closing balance reconcile to journal even across pages. |
| V24 | Account balance appears insufficient for combined outflows from same account | Aggregate money legs in one UOW; reject insufficient cash without partial posting, preserve idempotency and all balances. |

All amounts are **integer poisha**; 500000 minor = ৳5,000. Test source equality, journal debits=credits, Opening Equity counterparty, source/journal counts, tenant RLS, immutable history, and audit/outbox together. These are specifications, not passing evidence. Future verification requires specifically approved focused tests, backend typecheck/lint/build/boundaries, frontend TS/lint/build/UI-contract, actual React↔Nest browser tests, separate finance/security QA and documented command exits on pinned heads. Use disposable PostgreSQL only; do not use retained shops or initialize production.

### 19.10 Sequence, approvals and explicit non-authorizations

1. **Read-only preparation (this packet):** source/field/action trace and this one-file draft PR only. No application changes, migrations, posting, tests, worker claim, deploy, merge or financial record modification.
2. **Coordinator decision gate:** accept one-identity/separate-relationship balance and permission model; approve D08 loan-receivable/owner attribution/Payee treatment, opening-to-zero policy, vendor receivable/refund provenance, account-identity bridge, and exact phased DTOs; reconcile with MOD-005 cash policy and MOD-006 account sources. Obtain explicit owner approval of a 10–15 sentence scoped overview and executor environment.
3. **Stage A read-only/incremental trading integration:** after MOD-000 transport/session and accepted account identity, use existing real trading party CRUD/groups and compatible one-opening writer. Do not enable current aggregate party ledger as a per-role live ledger. Admit only individually lossless, permission-verified actions; keep other current preview functionality visible and labelled.
4. **Stage B server-first extensions:** relationship-scoped ledger + permission; identity relationship membership; finance historical openings; atomic multi-opening; split settlement/source correction; vendor/payee/attachments/import; additive contract/migration only under coordinator ownership. Live React writer follows approved server head; never fake a single-step atomic operation with separate browser POSTs.
5. **Build dispatch:** board capacity remains one worker; actual coordinator-issued issue/session/reservation, accepted dependency SHAs, exact frontend/backend allowlists and migration number, test authorization and disposable database must be present. This planning branch has no reserved worker.
6. **Verification and release:** tagged test vectors, successful static/browser/financial assertions, independent scoped reviewer against exact candidate heads, linked draft code PRs, rollback and manual review; human approves merge/deploy separately. An owner-approved **plan** does not itself authorize any financial posting, migration or deployment.

**Owner approval decision requested:** approve this MOD-004 *plan revision only*; account-identity design and typed Stage B contracts remain separately gated. Until then: **NOT READY FOR IMPLEMENTATION**.


## 20. D08 current-source reconciliation for documentation merge (2026-11-13)

**Status:** The owner authorized merging the *planning document* because Section 19 is absent from main. This does not authorize backend schema/code changes, financial posting, release cutover, deployment or a migration. Where Section 19 conflicts with this supplement or D08.0 in `../DECISIONS.md`, this supplement and the refined D08 decisions take precedence.

1. **Do not regress current ledger isolation.** In current NestSherERP adoption source, `PartyLedgerService.ledger`, `PartyRepository.listLedgerLines/sumLedgerBefore/sumLedgerTotal/isLedgerCursorInScope` and `ManagePartiesService.getOpening` already check exact trading-role permissions and select role-specific account controls and cursors. Earlier §19.2/§19.6 G04-01 statements describing this CURRENT ledger as indiscriminately all-role are historical and superseded. Remaining work: preserve this invariant, add approved gross components and safe seven-role extensions, test every tenant/filter/cursor/export/source navigation boundary.
2. **New P0 security gap — role mutation:** `ManagePartiesService.update` permits edits based on any one existing role and validates only newly added roles. `PartyRepository.writeRoles` can soft-delete omitted other roles even when the editor has no permission for them, while financial sources remain. Require authorization for each changed existing membership, refuse or safely version deactivation when obligations/history exist, and keep history accessible through explicitly permitted archived relationship reads. A multi-role identity is not permission to mutate every relationship.
3. **New P0 server field-visibility gap:** party-wide `hasLedgerEntries`, private NID/guardian/email/notes and nonselected-role metadata must not leak via role-limited detail/list contracts. Keep the party-wide history test internally for safe deletion. Client filtering alone does not establish security.
4. **Gross historical opening contract:** §19's "one opening per relationship" is insufficient for simultaneous Customer AR and Customer Advance or analogous Supplier/Vendor components. Introduce *per-relationship, per-component* immutable opening source identity and correction/clear semantics; journal entries against OPENING_EQUITY remain noncash/session-free. When linking an existing lender account opening, adopt the evidenced original entry rather than posting another.
5. **Vendor source lanes:** preserve the frontend `goods taken → payable`, `goods given → receivable`, `ordinary Purchase due`, and `unpriced/returns` buckets as separate source contracts and ledger views. Current backend Vendor payable/advance cannot automatically stand in for goods-given receivables. Expense Payee obligations stay with D07; no invented Vendor/Payee liability by relationship membership alone.
6. **Implementation sequencing:** merged frontend PR #483 already adds strict authenticated Party detail-read orchestration without connecting the seven-role page. Treat that read-only slice as reused, not missing. First fix role mutation and server-side information scope; thereafter extend source-backed identity/gross-opening/read contracts under reviewed shared schema ownership. MOD-005 independently owns the single drawer ON/OFF setting, locking and session provenance. Keep existing HisabIQ Party, Vendor and Finance preview workflows visible and unchanged until a full source-backed writer is approved.
7. **Acceptance remains pending:** verify two real disposable tenants and constrained staff roles, role removal with historic debt, inactive member reconciliation, mixed due+advance, missing agreements and ambiguous retries, no-session historical openings, and all existing UI behavior. Section 19 test vectors are plans, not executed evidence.


