# MOD-012 — Expenses, payees, categories, partial payments and receipts

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000, MOD-004, MOD-006. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-012-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/data/expensePreviewStore.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/expensePreviewStore.ts#L1)
- [src/pages/Expenses.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Expenses.tsx#L1)
- [src/utils/counterExpensePayment.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/utils/counterExpensePayment.ts#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/expenses` | [ExpensesController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/expenses/expenses.controller.ts#L32) | Inline / no body; linked method | `ExpenseListResponse` | `ManageExpensesService.list` |
| `POST /api/v1/expenses` | [ExpensesController.record](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/expenses/expenses.controller.ts#L48) | `recordExpenseRequestSchema` | `{ data: ExpenseResponse }` | `ManageExpensesService.record` |
| `PATCH /api/v1/expenses/:id` | [ExpensesController.correct](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/expenses/expenses.controller.ts#L80) | `correctExpenseRequestSchema` | `{ data: ExpenseResponse }` | `ManageExpensesService.correct` |
| `POST /api/v1/expenses/:id/void` | [ExpensesController.void](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/expenses/expenses.controller.ts#L115) | `voidDocumentRequestSchema` | `{ data: ExpenseResponse }` | `ManageExpensesService.void` |
| `POST /api/v1/expenses/categories` | [ExpensesController.addCategory](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/expenses/expenses.controller.ts#L135) | `saveExpenseCategoryRequestSchema` | `{ data: ExpenseCategoryResponse }` | `ManageExpensesService.saveCategory` |
| `PUT /api/v1/expenses/categories/:id` | [ExpensesController.renameCategory](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/expenses/expenses.controller.ts#L146) | `saveExpenseCategoryRequestSchema` | `{ data: ExpenseCategoryResponse }` | `ManageExpensesService.saveCategory` |
| `DELETE /api/v1/expenses/categories/:id` | [ExpensesController.archiveCategory](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/expenses/expenses.controller.ts#L157) | Inline / no body; linked method | `void` | `ManageExpensesService.archiveCategory` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-012-F01 | Categories and fully paid single-account expense — `savePreviewExpense; expense editor` | ADAPT | expenses; expenses/categories | Exact amount/account/category/note/date; server CREATE and expense.recorded audit/outbox. | Full-paid compatible subcase only |
| MOD-012-F02 | Unpaid, partial and split payments — `Expense payments and due state` | EXTEND | recordExpenseRequest has one accountCode and immediate amount | Create liability + settlement contract; never post only paid portion as full expense. | D07 |
| MOD-012-F03 | Correction/void — `cancelPreviewExpense` | ADAPT | PATCH expenses/:id; POST :id/void | Version, reason, reversal/repost; retain original history. | Partial-expense correction waits D07 |
| MOD-012-F04 | Receipts, employee/payee and repeated payments — `attachPreviewExpenseReceipt` | EXTEND | No verified matching attachments/payee-role contract | Keep receipt UI; source owner and attachment authorization required. | D07/D08 |

## 5. Proposed architecture and unresolved approval

Existing backend expense is DR EXPENSE:<category> / CR money for full amount. Frontend due is a real product concept; a partially paid expense cannot be coerced to that DTO. Closed chart liability choice must be approved before a migration or implementation task.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D07,D08.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [expenses fields](../contracts/expenses.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/expenses.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/data/expensePreviewStore.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/Expenses.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/utils/counterExpensePayment.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/expenses.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-expenses.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-expenses-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-012-T01: Categories and fully paid single-account expense

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-004, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `savePreviewExpense; expense editor`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `expenses; expenses/categories`. **Gate:** Full-paid compatible subcase only.

**Algorithm / expected output:** Exact amount/account/category/note/date; server CREATE and expense.recorded audit/outbox. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-expenses.test.ts` case `MOD-012-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-012-T02: Unpaid, partial and split payments

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-004, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Expense payments and due state`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `recordExpenseRequest has one accountCode and immediate amount`. **Gate:** D07.

**Algorithm / expected output:** Create liability + settlement contract; never post only paid portion as full expense. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-expenses.test.ts` case `MOD-012-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-012-T03: Correction/void

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-004, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `cancelPreviewExpense`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `PATCH expenses/:id; POST :id/void`. **Gate:** Partial-expense correction waits D07.

**Algorithm / expected output:** Version, reason, reversal/repost; retain original history. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-expenses.test.ts` case `MOD-012-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-012-T04: Receipts, employee/payee and repeated payments

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-004, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `attachPreviewExpenseReceipt`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `No verified matching attachments/payee-role contract`. **Gate:** D07/D08.

**Algorithm / expected output:** Keep receipt UI; source owner and attachment authorization required. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-expenses.test.ts` case `MOD-012-F04 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D07,D08

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-012-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.

## Revision 2 requirement precedence

[Integrate existing capabilities first, then extend missing UI parity](../HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md). [Cash-session classification](../tasks/CASH_SESSION_POLICY.md): historical opening balances, including lender/borrower openings, do not require an active session; actual tracked-cash movements do when ON, and OFF permits ordinary sessionless cash transactions. Do not add a cash check to historical openings or treat a credit/unpaid document as a cash payment. All existing UI features remain in scope; unsupported normal workflows keep their Stage B extension tasks and cannot be declared complete after compatible-slice integration alone.
