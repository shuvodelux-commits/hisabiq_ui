# MOD-006 — Accounts, Counter, transfers, capital, loans and bank entries

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000, MOD-001. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-006-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/components/finance/CashSessionDetailsDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/finance/CashSessionDetailsDialog.tsx#L1)
- [src/components/finance/CashSessionSpecimen.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/finance/CashSessionSpecimen.tsx#L1)
- [src/components/finance/ChequeActionDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/finance/ChequeActionDialog.tsx#L1)
- [src/components/finance/ChequeDialogs.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/finance/ChequeDialogs.tsx#L1)
- [src/components/finance/CounterWorkspace.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/finance/CounterWorkspace.tsx#L1)
- [src/components/finance/FinancePaymentSplitEditor.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/finance/FinancePaymentSplitEditor.tsx#L1)
- [src/components/finance/FinanceRecordDialogs.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/finance/FinanceRecordDialogs.tsx#L1)
- [src/data/cheques.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/cheques.ts#L1)
- [src/data/finance.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/finance.ts#L1)
- [src/data/financeAccounts.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/financeAccounts.ts#L1)
- [src/data/financePreviewStore.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/financePreviewStore.ts#L1)
- [src/pages/Accounts.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Accounts.tsx#L1)
- [src/pages/Finance.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Finance.tsx#L1)
- [src/services/bankEntryApi.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/services/bankEntryApi.ts#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/money/accounts` | [AccountsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/accounts.controller.ts#L51) | `accountListQuerySchema` | `MoneyAccountListResponse` | `ManageAccountsService.list` |
| `GET /api/v1/money/accounts/:id/statement` | [AccountsController.statement](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/accounts.controller.ts#L70) | `accountStatementQuerySchema` | `AccountStatementResponse` | `DailyCashService.statement` |
| `POST /api/v1/money/accounts` | [AccountsController.create](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/accounts.controller.ts#L82) | `createMoneyAccountRequestSchema` | `{ data: MoneyAccountResponse }` | `ManageAccountsService.create` |
| `PATCH /api/v1/money/accounts/:id` | [AccountsController.update](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/accounts.controller.ts#L94) | `updateMoneyAccountRequestSchema` | `{ data: MoneyAccountResponse }` | `ManageAccountsService.update` |
| `POST /api/v1/money/accounts/:id/deactivate` | [AccountsController.deactivate](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/accounts.controller.ts#L110) | `accountVersionRequestSchema` | `{ data: MoneyAccountResponse }` | `ManageAccountsService.deactivate` |
| `GET /api/v1/money/day` | [CashSessionsController.day](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L56) | Inline / no body; linked method | `DayStatusResponse` | `CashSessionService.status` |
| `GET /api/v1/money/daily-cash` | [CashSessionsController.history](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L61) | `dailyCashQuerySchema` | `DailyCashResponse` | `DailyCashService.history` |
| `POST /api/v1/money/day/start` | [CashSessionsController.start](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L69) | `startDayRequestSchema` | `{ data: CashSessionResponse }` | `CashSessionService.startDay` |
| `POST /api/v1/money/day/:id/close` | [CashSessionsController.close](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L80) | `closeDayRequestSchema` | `{ data: CashSessionResponse }` | `CashSessionService.closeDay` |
| `POST /api/v1/money/day/:id/reopen` | [CashSessionsController.reopen](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L93) | `reopenDayRequestSchema` | `{ data: CashSessionResponse }` | `CashSessionService.reopenDay` |
| `GET /api/v1/money/movements` | [CashSessionsController.listMovements](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L109) | `moneyMovementListQuerySchema` | `MoneyMovementListResponse` | `MoneyMovementsService.list` |
| `POST /api/v1/money/movements` | [CashSessionsController.record](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L120) | `recordCashMovementRequestSchema` | `{ data: CashMovementResponse }` | `CashMovementService.record` |
| `PATCH /api/v1/money/movements/:id` | [CashSessionsController.correctMovement](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L135) | `correctCashMovementRequestSchema` | `{ data: { ok: true } }` | `CashMovementService.correct` |
| `POST /api/v1/money/movements/:id/void` | [CashSessionsController.voidMovement](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L148) | `voidDocumentRequestSchema` | `{ data: { ok: true } }` | `CashMovementService.void` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-006-F01 | Accounts list/create/edit/deactivate/statement — `Accounts; finance account forms` | ADAPT | money/accounts; :id/statement; :id/deactivate | AccountCode derived from actual account type; source version mandatory on updates. | Account read can precede cash setup |
| MOD-006-F02 | Counter receive/pay and expense — `Finance counterOnly` | ADAPT | customer-payments; suppliers/payments; expenses | Use action-specific adapter; never a generic cash movement for trading settlement. | Requires MOD-004/007/008/012 per action |
| MOD-006-F03 | Transfers and owner capital — `Finance transfer handlers` | ADAPT | POST money/movements | Exact from/to account codes, businessDate, amountMinor, kind, operationId. Both sides post once. | CASH OFF prerequisite |
| MOD-006-F04 | Bank Entry and cheque lifecycle — `bankEntryApi.recordBankEntry; cheque dialogs` | EXTEND | Old /api/bank/* has no matching Nest route | Replace obsolete client only after each BankEntryType maps to an existing authorized posting or a complete proposed contract. | Bank entry semantic matrix incomplete |
| MOD-006-F05 | Lending, borrowing, interest and people — `Finance relationship preview` | EXTEND | LOAN_RECEIVED/LOAN_REPAYMENT cover only part | No mapping from money given as loan to money borrowed; financial relationship identity requires D08. | D08 |

## 5. Proposed architecture and unresolved approval

Current bankRequest expects {ok:true}, whereas Nest uses several envelopes and {error:{...}}. Do not merely rename its URL. MFS is account metadata but journal account code resolves through accountCodeFor; do not manufacture MFS:<id>. An expense paid to a supplier is not a supplier debt settlement unless the user selected that action.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D05,D08.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [money fields](../contracts/money.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/accounts-counter-finance.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/data/cheques.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/finance.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/financeAccounts.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/data/financePreviewStore.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/Accounts.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/pages/Finance.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/services/bankEntryApi.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/accounts-counter-finance.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-accounts-counter-finance.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-accounts-counter-finance-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-006-T01: Accounts list/create/edit/deactivate/statement

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Accounts; finance account forms`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `money/accounts; :id/statement; :id/deactivate`. **Gate:** Account read can precede cash setup.

**Algorithm / expected output:** AccountCode derived from actual account type; source version mandatory on updates. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-accounts-counter-finance.test.ts` case `MOD-006-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-006-T02: Counter receive/pay and expense

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Finance counterOnly`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `customer-payments; suppliers/payments; expenses`. **Gate:** Requires MOD-004/007/008/012 per action.

**Algorithm / expected output:** Use action-specific adapter; never a generic cash movement for trading settlement. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-accounts-counter-finance.test.ts` case `MOD-006-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-006-T03: Transfers and owner capital

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Finance transfer handlers`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `POST money/movements`. **Gate:** CASH OFF prerequisite.

**Algorithm / expected output:** Exact from/to account codes, businessDate, amountMinor, kind, operationId. Both sides post once. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-accounts-counter-finance.test.ts` case `MOD-006-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-006-T04: Bank Entry and cheque lifecycle

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `bankEntryApi.recordBankEntry; cheque dialogs`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `Old /api/bank/* has no matching Nest route`. **Gate:** Bank entry semantic matrix incomplete.

**Algorithm / expected output:** Replace obsolete client only after each BankEntryType maps to an existing authorized posting or a complete proposed contract. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-accounts-counter-finance.test.ts` case `MOD-006-F04 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-006-T05: Lending, borrowing, interest and people

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Finance relationship preview`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `LOAN_RECEIVED/LOAN_REPAYMENT cover only part`. **Gate:** D08.

**Algorithm / expected output:** No mapping from money given as loan to money borrowed; financial relationship identity requires D08. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-accounts-counter-finance.test.ts` case `MOD-006-F05 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D05,D08

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-006-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.

Detailed supplementary seam: [ACC-01](../tasks/SECONDARY_WORKFLOWS.md). This takes priority over generic guidance for that operation.

## Revision 2 requirement precedence

[Integrate existing capabilities first, then extend missing UI parity](../HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md). [Cash-session classification](../tasks/CASH_SESSION_POLICY.md): historical opening balances, including lender/borrower openings, do not require an active session; actual tracked-cash movements do when ON, and OFF permits ordinary sessionless cash transactions. Do not add a cash check to historical openings or treat a credit/unpaid document as a cash payment. All existing UI features remain in scope; unsupported normal workflows keep their Stage B extension tasks and cannot be declared complete after compatible-slice integration alone.
