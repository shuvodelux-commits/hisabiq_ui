# MOD-018 — Installment sales, schedule, receipts and lifecycle

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-004, MOD-006, MOD-007, MOD-009. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-018-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/components/pos/InstallmentAdjustmentDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAdjustmentDialog.tsx#L1)
- [src/components/pos/InstallmentAgreementPreview.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentAgreementPreview.tsx#L1)
- [src/components/pos/InstallmentBreakdownDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentBreakdownDialog.tsx#L1)
- [src/components/pos/InstallmentCustomerQuickAddDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentCustomerQuickAddDialog.tsx#L1)
- [src/components/pos/InstallmentReceiptReversalDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceiptReversalDialog.tsx#L1)
- [src/components/pos/InstallmentReceivePaymentDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentReceivePaymentDialog.tsx#L1)
- [src/components/pos/InstallmentRescheduleDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentRescheduleDialog.tsx#L1)
- [src/components/pos/InstallmentTermsPanel.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/pos/InstallmentTermsPanel.tsx#L1)
- [src/data/installmentPreviewStore.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/installmentPreviewStore.ts#L1)
- [src/installments/adjustments.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/adjustments.ts#L1)
- [src/installments/collections.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/collections.ts#L1)
- [src/installments/historicalLines.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/historicalLines.ts#L1)
- [src/installments/lifecycle.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/lifecycle.ts#L1)
- [src/installments/pricing.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/pricing.ts#L1)
- [src/installments/printLifecycle.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/printLifecycle.ts#L1)
- [src/installments/reversals.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/reversals.ts#L1)
- [src/installments/revisions.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/revisions.ts#L1)
- [src/installments/schedule.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/schedule.ts#L1)
- [src/installments/validateCollection.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/validateCollection.ts#L1)
- [src/installments/validateDraft.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/installments/validateDraft.ts#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| — | No matching complete backend capability identified | NOT VERIFIED / BUILD | Not invented | See blockers |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-018-F01 | Agreement and schedule at sale — `recordInstallmentPreview; InstallmentTermsPanel` | BUILD | No matching current installment DTO/service | Preserve negotiated price and exact scheduled allocation; record revenue once through sale writer. | D09 |
| MOD-018-F02 | Receive installments and reverse receipt — `InstallmentReceivePaymentDialog; InstallmentReceiptReversalDialog` | BUILD | Reuse customer receipt only after explicit schedule-allocation contract | No duplicate revenue; preserve source installment and account payment allocation. | D09 |
| MOD-018-F03 | Reschedule, early settlement and return adjustment — `InstallmentRescheduleDialog; InstallmentAdjustmentDialog` | BUILD | No current complete contract | Immutable lifecycle versions; decide overpayment/fees/discount/returned principal. | D09 |

## 5. Proposed architecture and unresolved approval

UI preview evidence is not approval of an interest or revenue policy. Exact schedule business rules, account use, DTOs, migrations and concurrency locks are still blocked; no builder may implement from this inventory alone.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D09.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.


## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/installments.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/data/installmentPreviewStore.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/installments.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-installments.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-installments-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-018-T01: Agreement and schedule at sale

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-004, MOD-006, MOD-007, MOD-009. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `recordInstallmentPreview; InstallmentTermsPanel`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `No matching current installment DTO/service`. **Gate:** D09.

**Algorithm / expected output:** Preserve negotiated price and exact scheduled allocation; record revenue once through sale writer. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-installments.test.ts` case `MOD-018-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-018-T02: Receive installments and reverse receipt

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-004, MOD-006, MOD-007, MOD-009. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `InstallmentReceivePaymentDialog; InstallmentReceiptReversalDialog`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `Reuse customer receipt only after explicit schedule-allocation contract`. **Gate:** D09.

**Algorithm / expected output:** No duplicate revenue; preserve source installment and account payment allocation. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-installments.test.ts` case `MOD-018-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-018-T03: Reschedule, early settlement and return adjustment

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-004, MOD-006, MOD-007, MOD-009. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `InstallmentRescheduleDialog; InstallmentAdjustmentDialog`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `No current complete contract`. **Gate:** D09.

**Algorithm / expected output:** Immutable lifecycle versions; decide overpayment/fees/discount/returned principal. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-installments.test.ts` case `MOD-018-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-018-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.

## Revision 2 requirement precedence

[Integrate existing capabilities first, then extend missing UI parity](../HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md). [Cash-session classification](../tasks/CASH_SESSION_POLICY.md): historical opening balances, including lender/borrower openings, do not require an active session; actual tracked-cash movements do when ON, and OFF permits ordinary sessionless cash transactions. Do not add a cash check to historical openings or treat a credit/unpaid document as a cash payment. All existing UI features remain in scope; unsupported normal workflows keep their Stage B extension tasks and cannot be declared complete after compatible-slice integration alone.
