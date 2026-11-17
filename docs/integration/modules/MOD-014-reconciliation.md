# MOD-014 — Bank statement reconciliation

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000, MOD-006. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-014-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/data/reconciliation.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/reconciliation.ts#L1)
- [src/pages/Reconciliation.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reconciliation.tsx#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/money/reconciliations` | [ReconciliationsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/reconciliations.controller.ts#L60) | `reconciliationListQuerySchema` | `ReconciliationListResponse` | `ReconcileAccountService.list` |
| `GET /api/v1/money/reconciliations/:id` | [ReconciliationsController.workspace](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/reconciliations.controller.ts#L71) | Inline / no body; linked method | `ReconciliationWorkspaceResponse` | `ReconcileAccountService.workspace` |
| `POST /api/v1/money/reconciliations` | [ReconciliationsController.start](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/reconciliations.controller.ts#L79) | `startReconciliationRequestSchema` | `{ data: ReconciliationWorkspaceResponse }` | `ReconcileAccountService.start` |
| `POST /api/v1/money/reconciliations/:id/statement` | [ReconciliationsController.upload](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/reconciliations.controller.ts#L91) | `uploadStatementRequestSchema` | `{ data: StatementPreviewResponse }` | `ImportStatementService.upload` |
| `POST /api/v1/money/reconciliations/:id/statement/confirm` | [ReconciliationsController.confirm](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/reconciliations.controller.ts#L112) | `confirmStatementRequestSchema` | `{ data: ReconciliationWorkspaceResponse }` | `ImportStatementService.confirm` |
| `GET /api/v1/money/reconciliations/:id/statement/:fileId/file` | [ReconciliationsController.file](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/reconciliations.controller.ts#L138) | Inline / no body; linked method | `void` | `ImportStatementService.readFile` |
| `POST /api/v1/money/reconciliations/:id/matches` | [ReconciliationsController.saveMatch](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/reconciliations.controller.ts#L155) | `saveMatchRequestSchema` | `{ data: ReconciliationWorkspaceResponse }` | `ReconcileAccountService.saveMatch` |
| `DELETE /api/v1/money/reconciliations/:id/matches/:matchId` | [ReconciliationsController.removeMatch](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/reconciliations.controller.ts#L170) | Inline / no body; linked method | `{ data: ReconciliationWorkspaceResponse }` | `ReconcileAccountService.removeMatch` |
| `POST /api/v1/money/reconciliations/:id/complete` | [ReconciliationsController.complete](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/reconciliations.controller.ts#L179) | `completeReconciliationRequestSchema` | `{ data: ReconciliationWorkspaceResponse }` | `ReconcileAccountService.complete` |
| `POST /api/v1/money/reconciliations/:id/reopen` | [ReconciliationsController.reopen](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/reconciliations.controller.ts#L200) | `reopenReconciliationRequestSchema` | `{ data: ReconciliationWorkspaceResponse }` | `ReconcileAccountService.reopen` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-014-F01 | Start and load workspace — `Reconciliation` | ADAPT | money/reconciliations; :id | Account/date scope from server; totals independent of client filter. | Workspace mapping incomplete |
| MOD-014-F02 | Upload/inspect/confirm statement and view attachment — `Statement upload` | ADAPT | reconciliations/:id/statement; statement/confirm; statement/:fileId/file | Validate base64/mime/hash/size using actual DTO; no silent PDF parser fallback. | Existing issue10 not itself proof still failing |
| MOD-014-F03 | Match/unmatch/complete/reopen — `Reconciliation match actions` | ADAPT | matches; matches/:matchId; complete; reopen | Version/permission and full balancing; no invented balancing bank entry. | Account source correction routed to owner |

## 5. Proposed architecture and unresolved approval

Use ReconcileAccountService and ImportStatementService. A statement line has one reconciliation ownership; a matched journal row cannot be reused outside supported split-match contract. Verify exact matching schema rather than assuming one-to-one from UI filenames. Failed upload leaves no partial confirmed statement.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D08.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [reconciliation fields](../contracts/reconciliation.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/reconciliation.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/data/reconciliation.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/Reconciliation.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/reconciliation.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-reconciliation.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-reconciliation-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-014-T01: Start and load workspace

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Reconciliation`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `money/reconciliations; :id`. **Gate:** Workspace mapping incomplete.

**Algorithm / expected output:** Account/date scope from server; totals independent of client filter. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-reconciliation.test.ts` case `MOD-014-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-014-T02: Upload/inspect/confirm statement and view attachment

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Statement upload`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `reconciliations/:id/statement; statement/confirm; statement/:fileId/file`. **Gate:** Existing issue10 not itself proof still failing.

**Algorithm / expected output:** Validate base64/mime/hash/size using actual DTO; no silent PDF parser fallback. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-reconciliation.test.ts` case `MOD-014-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-014-T03: Match/unmatch/complete/reopen

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Reconciliation match actions`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `matches; matches/:matchId; complete; reopen`. **Gate:** Account source correction routed to owner.

**Algorithm / expected output:** Version/permission and full balancing; no invented balancing bank entry. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-reconciliation.test.ts` case `MOD-014-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-014-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.

Additional source-verified decision gate: **D18** in DECISIONS.md. No lossful status adapter is permitted.

Detailed supplementary seam: [REC-01](../tasks/SECONDARY_WORKFLOWS.md). This takes priority over generic guidance for that operation.
