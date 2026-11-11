# MOD-016 — Operational Dashboard and global search

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000, MOD-002, MOD-004, MOD-007, MOD-008, MOD-006. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-016-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/components/dashboard/CashflowChart.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/CashflowChart.tsx#L1)
- [src/components/dashboard/CustomizeDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/CustomizeDialog.tsx#L1)
- [src/components/dashboard/DuesList.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/DuesList.tsx#L1)
- [src/components/dashboard/MetricCard.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/MetricCard.tsx#L1)
- [src/components/dashboard/RecentSalesTable.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/RecentSalesTable.tsx#L1)
- [src/components/dashboard/SalesTrendChart.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/SalesTrendChart.tsx#L1)
- [src/components/dashboard/WidgetFrame.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/dashboard/WidgetFrame.tsx#L1)
- [src/data/dashboard.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/dashboard.ts#L1)
- [src/hooks/useDashboardLayout.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/hooks/useDashboardLayout.ts#L1)
- [src/pages/Dashboard.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Dashboard.tsx#L1)
- [src/pages/GlobalSearch.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/GlobalSearch.tsx#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/dashboard/summary` | [DashboardController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/dashboard.controller.ts#L16) | Inline / no body; linked method | `{ data: DashboardSummaryResponse }` | `GetDashboardSummaryService.execute` |
| `GET /api/v1/search` | [SearchController.find](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/search/search.controller.ts#L22) | `globalSearchQuerySchema` | `GlobalSearchResponse` | `GlobalSearchService.search` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-016-F01 | Business identity and operational cards — `Dashboard; MetricCard` | ADAPT | dashboard/summary; dashboard/cards | Summary gives businessName only; cards gives permission-filtered figures. Missing permission is not zero. | Operational reuse allowed |
| MOD-016-F02 | Recent sales, dues and source navigation — `RecentSalesTable; DuesList` | ADAPT | dashboard/cards; existing role lists | Keep quick actions and source links; only use data whose meaning matches the widget. | Unmapped dues widget fields blocked |
| MOD-016-F03 | Layout customization and charts — `useDashboardLayout; SalesTrendChart; CashflowChart` | PRESERVE | Local layout; no new report API | Keep widgets/design; no new insights/report endpoint. Clarify trend-data scope. | D15 |
| MOD-016-F04 | Global search and result actions — `GlobalSearch` | ADAPT | GET search | Debounce/abort, tenant/permission-filtered results and original routing; no local fixture fallback. | Backend search types mapped per source |

## 5. Proposed architecture and unresolved approval

DashboardService lives in reporting and reuses ReportRepository; invoking the existing cards endpoint is allowed. Building report infrastructure is not. Never call /dashboard/summary expecting sale/profit metrics.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D15.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [auth fields](../contracts/auth.md)
- [reports fields](../contracts/reports.md)
- [search fields](../contracts/search.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/dashboard-search.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/data/dashboard.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/hooks/useDashboardLayout.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/Dashboard.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/GlobalSearch.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/dashboard-search.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-dashboard-search.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-dashboard-search-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-016-T01: Business identity and operational cards

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-002, MOD-004, MOD-007, MOD-008, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Dashboard; MetricCard`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `dashboard/summary; dashboard/cards`. **Gate:** Operational reuse allowed.

**Algorithm / expected output:** Summary gives businessName only; cards gives permission-filtered figures. Missing permission is not zero. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-dashboard-search.test.ts` case `MOD-016-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-016-T02: Recent sales, dues and source navigation

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-002, MOD-004, MOD-007, MOD-008, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `RecentSalesTable; DuesList`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `dashboard/cards; existing role lists`. **Gate:** Unmapped dues widget fields blocked.

**Algorithm / expected output:** Keep quick actions and source links; only use data whose meaning matches the widget. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-dashboard-search.test.ts` case `MOD-016-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-016-T03: Layout customization and charts

**State:** PRESERVE — no new backend integration. **Depends on:** MOD-000, MOD-002, MOD-004, MOD-007, MOD-008, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `useDashboardLayout; SalesTrendChart; CashflowChart`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `Local layout; no new report API`. **Gate:** D15.

**Algorithm / expected output:** Keep widgets/design; no new insights/report endpoint. Clarify trend-data scope. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-dashboard-search.test.ts` case `MOD-016-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-016-T04: Global search and result actions

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-002, MOD-004, MOD-007, MOD-008, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `GlobalSearch`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `GET search`. **Gate:** Backend search types mapped per source.

**Algorithm / expected output:** Debounce/abort, tenant/permission-filtered results and original routing; no local fixture fallback. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-dashboard-search.test.ts` case `MOD-016-F04 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D15

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-016-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.

Detailed supplementary seam: [DBH-01 / SEARCH-01](../tasks/SECONDARY_WORKFLOWS.md). This takes priority over generic guidance for that operation.
