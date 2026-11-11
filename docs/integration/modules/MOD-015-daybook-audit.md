# MOD-015 — Daybook, operational audit ledger and source actions

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-007, MOD-008, MOD-009, MOD-012. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-015-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/components/audit/AuditDetailsDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditDetailsDialog.tsx#L1)
- [src/components/audit/AuditEditDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditEditDialog.tsx#L1)
- [src/components/audit/AuditFilters.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditFilters.tsx#L1)
- [src/components/audit/AuditTimeline.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/AuditTimeline.tsx#L1)
- [src/components/audit/ImpactPreview.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/audit/ImpactPreview.tsx#L1)
- [src/components/daybook/DaybookActions.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookActions.tsx#L1)
- [src/components/daybook/DaybookFilters.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/DaybookFilters.tsx#L1)
- [src/components/daybook/TransactionDetailsDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/daybook/TransactionDetailsDialog.tsx#L1)
- [src/data/auditLedger.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/auditLedger.ts#L1)
- [src/data/daybook.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/daybook.ts#L1)
- [src/pages/AuditLedger.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/AuditLedger.tsx#L1)
- [src/pages/Daybook.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Daybook.tsx#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/audit-events` | [AuditController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/audit/audit.controller.ts#L21) | `auditQuerySchema` | `{ data: AuditListResponse }` | `ListAuditEventsService.list` |
| `GET /api/v1/corrections/transaction-date/:documentType/:documentId` | [CorrectionsController.context](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/corrections/corrections.controller.ts#L33) | `redatableDocumentSchema` | `{ data: TransactionDateContext }` | `ChangeTransactionDateService.describe` |
| `POST /api/v1/corrections/transaction-date` | [CorrectionsController.change](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/corrections/corrections.controller.ts#L45) | `changeTransactionDateRequestSchema` | `{ data: ChangeTransactionDateResponse }` | `ChangeTransactionDateService.change` |
| `GET /api/v1/daybook` | [DaybookController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/daybook/daybook.controller.ts#L30) | `daybookQuerySchema` | `{ data: DaybookResponse }` | `GetDaybookService.execute` |
| `POST /api/v1/daybook/review` | [DaybookController.review](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/daybook/daybook.controller.ts#L37) | `markDayReviewedRequestSchema` | `{ data: DayReview }` | `MarkDayReviewedService.execute` |
| `POST /api/v1/daybook/print` | [DaybookController.print](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/daybook/daybook.controller.ts#L44) | `daybookPrintRequestSchema` | `{ data: { print: DaybookPrint; daybook: DaybookResponse } }` | `PrintDaybookService.execute` |
| `GET /api/v1/daybook/prints` | [DaybookController.history](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/daybook/daybook.controller.ts#L54) | Inline / no body; linked method | `{ data: readonly DaybookPrint[] }` | `PrintDaybookService.history` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-015-F01 | Daybook date/filter/source drilldown — `Daybook` | ADAPT | GET daybook | BusinessDate and createdAt separate; query server totals, never sum only page. | No new report calculations |
| MOD-015-F02 | Review day and print history — `Daybook actions` | ADAPT | POST daybook/review; daybook/print; GET daybook/prints | Reuse existing operational notebook print; preserve existing rendering. | Exact print request schema |
| MOD-015-F03 | Audit events and source correction — `AuditLedger` | ADAPT | GET audit-events; owning correction endpoints | Audit events are append-only; read does not mutate source. No audit-ledger delete. | UI projections differ from raw audit events |

## 5. Proposed architecture and unresolved approval

Operational ledger source action module stays in scope; dedicated multi-page audit report belongs to Reports and is excluded. AuditLedger is not necessarily a direct rendering of raw audit_events; its accounting rows require existing Daybook/source queries. Do not make financial amounts from auth/security audit rows.

No architecture in this packet is falsely labelled owner-approved. No extra business decision listed; implementation still needs module approval.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [daybook fields](../contracts/daybook.md)
- [audit fields](../contracts/audit.md)
- [transaction-date fields](../contracts/transaction-date.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/daybook-audit.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/data/auditLedger.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/daybook.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/AuditLedger.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/Daybook.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/daybook-audit.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-daybook-audit.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-daybook-audit-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-015-T01: Daybook date/filter/source drilldown

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-007, MOD-008, MOD-009, MOD-012. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Daybook`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `GET daybook`. **Gate:** No new report calculations.

**Algorithm / expected output:** BusinessDate and createdAt separate; query server totals, never sum only page. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-daybook-audit.test.ts` case `MOD-015-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-015-T02: Review day and print history

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-007, MOD-008, MOD-009, MOD-012. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Daybook actions`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `POST daybook/review; daybook/print; GET daybook/prints`. **Gate:** Exact print request schema.

**Algorithm / expected output:** Reuse existing operational notebook print; preserve existing rendering. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-daybook-audit.test.ts` case `MOD-015-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-015-T03: Audit events and source correction

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-007, MOD-008, MOD-009, MOD-012. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `AuditLedger`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `GET audit-events; owning correction endpoints`. **Gate:** UI projections differ from raw audit events.

**Algorithm / expected output:** Audit events are append-only; read does not mutate source. No audit-ledger delete. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-daybook-audit.test.ts` case `MOD-015-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

Approval, runner reservation and per-action completeness review outstanding.

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-015-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.

Detailed supplementary seam: [DAY-01](../tasks/SECONDARY_WORKFLOWS.md). This takes priority over generic guidance for that operation.
