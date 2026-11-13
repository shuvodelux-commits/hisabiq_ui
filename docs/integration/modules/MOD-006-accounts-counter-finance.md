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

---

## Revision 3 — source-head-verified MOD-006 approval amendment (2026-11-12)

**Status:** documentation-only scope review; **NOT APPROVED FOR CODE**. This section updates and qualifies ``2–18 where they are too broad or pinned to superseded SHAs. It does not amend the approved master policy, create a new API, approve D08 or authorize schema/account-code changes.

### R3.1 Verified source heads, authority and readiness

| Repository | Ref inspected | Verified commit |
|---|---|---|
| `shuvodelux-commits/hisabiq_ui` | `main` | `cae993afb27996ab78ba8a295e5d872993e45e85` |
| `shuvodelux-commits/nestshererp` | `chore/hisabiq-adoption-runtime-a01` | `e2a0a486d6d36cddd51ba58eece83c83c9f2ee69` |

Read both repositories' `AGENTS.md` and frontend `docs/integration/{HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md,HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md,REVIEW.md,tasks/EXECUTION.md,tasks/CASH_SESSION_POLICY.md,DECISIONS.md}`. Existing packet ```3 source SHA labels belong to an earlier evidence pass and **must not** be treated as the verified live heads. Contract inspection was read-only. No runtime suite, PostgreSQL instance, Project reservation or live PR readiness is claimed here. The master and review explicitly keep the whole module PLANNED / BLOCKED. Only a separately approved foundation slice has build approval; that does not extend to MOD-006.

**Approval overview (12 sentences).** MOD-006 should proceed as a staged integration design rather than immediate backend implementation. Money-account management and source-ledger statements already have usable Nest contracts. Bank/MFS identity must resolve to the existing canonical account code and must never be constructed from a display label. Customer and supplier Counter settlements are distinct source documents and must not be rewritten as cash transfers. Current standalone settlement DTOs cannot atomically carry the complete Counter split-and-discount experience. Ordinary transfers and owner injections/withdrawals can use existing movement contracts for compatible one-leg cases. The backend LOAN account is a lender liability, not an asset owed by a borrower. Historical lender and borrower openings are noncash journal sources against Opening Equity and do not require drawer sessions. Present-day lending, borrowing and settlements follow the MOD-005 ON/OFF rule only when the tracked drawer participates. Finance identity must reuse MOD-004's canonical person identity, without duplicating a party table or its posting services. Every BankEntryType and cheque state needs source-aware mapping before replacing the legacy bank client. No implementation, schema amendment, shared-file edit, merge or deployment is authorized until the outstanding contracts, D08 choices and coordinator reservation are approved.

### R3.2 Exact live frontend action census and backend ownership

| Frontend source / action | Current behavior | Existing Nest seam | Proposed disposition / no-loss rule |
|---|---|---|---|
| `src/pages/Finance.tsx`, `moneyAccountsOnly`, account create/edit/status, `src/components/finance/FinanceRecordDialogs.tsx` | `financePreviewStore` and local balances; has reactivate toggle, account details and manual account entry | `AccountsController` → `ManageAccountsService` → `MoneyRepository` | **ADAPT** create/edit/deactivate and ledger, **EXTEND** reactivate and unmatched account metadata, **BLOCK** manual unclassified one-sided money write |
| `src/pages/Accounts.tsx` / `Finance.tsx` Money Accounts and statement UI | Accounting projection and finance fixtures; entry into Bank Entry; print/export | `AccountsController.list/statement` → `DailyCashService.statement` | **ADAPT** selected real account ID, date/search/kind/cursor, real source rows and display money; preserve all tabs, vouchers, statements, keyboard and print controls; separate broader accounting report cutover |
| `src/components/finance/CounterWorkspace.tsx` Customer Receive | `dispatchPartyPreview(record-payment)` with `partyId`, invoice or oldest allocation, optional discount/reason, cash/bank/MFS `splits[]` | `CustomerPaymentsController` → `ReceiveCustomerPaymentService` | **ADAPT** single-account no-discount supported case only after source/version semantics checked; **EXTEND** one atomic split + discount/allocation writer; coordinate with MOD-004 and MOD-007 |
| Same Counter / Supplier Pay | Same multi-leg preview settlement, supplier invoice or oldest-first | `SupplierPaymentsController` → `PaySupplierService` | **ADAPT** supported single account; **EXTEND** mixed tender and noncash adjustment; coordinate MOD-004/MOD-008 |
| Same Counter / Expense | `savePreviewExpense`, paid in full, multiple accounts, free-form category label | `ExpensesController` → `ManageExpensesService` | **ADAPT** exact existing category ID, paid-in-full one account; **EXTEND** atomic split/unpaid/partial per MOD-012/D07; no trade AP posting merely because payee is a supplier |
| Same Counter / Bank Transfer | Selected distinct `from/to` account IDs, money in taka, review, local balance +/- | `CashSessionsController.record` → `CashMovementService.record` | **ADAPT** `TRANSFER`; resolve canonical codes and validate current account types/tenant; no UI balance mutation in live mode |
| Same Counter / Bank Entry; `src/components/accounts/BankEntryTab.tsx` | 7 old `BankEntryType` labels, custom bank bootstrap/ledger/POST, legacy token and `{ok:true}` | No Nest `/api/bank/*` routes | **BLOCK direct replacement**; use per-type authority matrix in R3.4 |
| `src/pages/Finance.tsx` owner/lender/borrower create/edit/reverse, `FinancePaymentSplitEditor`, `FinanceRecordDialogs` | `Owner Credit/Debit`, `Lender Credit/Debit`, `Borrower Debit/Credit`, opening owner/lender/borrower, multiple payment legs, finance person identity | `CashMovementService` `OWNER_INJECTION` / `OWNER_WITHDRAWAL` / `LOAN_RECEIVED` / `LOAN_REPAYMENT` for compatible single movements; `ManageAccountsService` LOAN opening (liability-only) | **ADAPT** narrow owner / lender-liability one-account subcase; **EXTEND/BLOCK** person-linked relationship ledgers, borrower receivable, multi-leg settlement, interest and openings |
| `src/pages/Finance.tsx` transfer reversal/edit | Local `reverseAccountTransfer` + journal-like preview changes | `PATCH /money/movements/:id` and `POST /money/movements/:id/void` | **ADAPT** server source correction/void by persisted movement ID and version, original audited reversal; not arbitrary subtraction from client balance |
| `src/pages/Finance.tsx` cheque create/status/edit/print, `ChequeDialogs`, `ChequeActionDialog` | `chequeRecords` preview; Received/Issued → Deposited/Presented → Cleared/Bounced/Returned/Cancelled/Stopped; preview bank balance updates only at Cleared | **No verified cheque controller, aggregate, repository or lifecycle contract on inspected backend tree** | **EXTEND/BLOCK** source-linked cheque lifecycle with clear-once and bounce/correction accounting, no premature bank balance mutation; preserve print and attachment placeholder |

**UI/identity split:** A finance person may have multiple roles; canonical person/party identity belongs to MOD-004, with permissioned finance relationship links under MOD-006. Do **not** assign borrower a `SUPPLIER` role, lender a `CUSTOMER` role or create a second `finance_people` identity model with independent name/phone deduplication. Account IDs, party IDs, relationship IDs, source document IDs and session IDs have different lifetimes; never substitute fixture IDs.

### R3.3 Verified wire contracts, field conversions and semantic restrictions

**Accounts.** `GET /api/v1/money/accounts?includeInactive=&asOf=` responds directly with `{accounts,totalCashMinor,totalBankMinor,totalMfsMinor,totalLoanMinor}`. `GET /api/v1/money/accounts/:id/statement` accepts `fromDate,toDate,search,kind(ALL|SALE|PURCHASE|EXPENSE|MOVEMENT|OTHER),cursor,limit(1..200)` and returns direct `AccountStatementResponse` with canonical journal lines, totals, running balance and page. `POST /api/v1/money/accounts` body is the strict `createMoneyAccountRequestSchema`: `name(1..80),type(CASH|BANK|MFS|LOAN),holderName(null|string max80),reference(null|string max64),isDrawer(default false),openingAmountMinor(integer >=0),openingDate(date|null),operationId(ULID)`. `PATCH /api/v1/money/accounts/:id` uses the **full** same account fields plus `version>0` instead of `operationId`; `POST /:id/deactivate` body `{version>0}`. These writes return `{data:MoneyAccountResponse}`; views return direct objects, not legacy `{ok:true}`. Creation with positive opening posts account/`OPENING_EQUITY` in the same UOW, with no current payment. Update opening is a versioned correction, not a direct balance patch; deactivation is soft and refused at nonzero balance. Existing account-status API has **no reactivate route**; React's toggle requires a proposed versioned reactivation contract or is blocked in live mode, not hidden from the UI.

Frontend `Cash` and `Petty Cash` both have current backend type `CASH`: preserve purpose distinction in presentation but do not store it in `reference` or invent a backend field. `Bank` → `BANK`; `Mobile Banking` → `MFS`. `LOAN` is *not* spendable and must not appear in Counter cash/bank selectors. Persist `holderName` only when it truly means account holder; `reference` is at most 64 chars and may hold an actual account reference when approved, not an institution+branch+number blob. Frontend-specific institution, account number, category/purpose, status reactivation and other metadata without semantically equivalent fields require explicit extension or remain a clearly labeled incomplete live workflow. Account balance is `balanceMinor` from journal, converted *only at display boundary*. Money in user entry remains a string until exact scale-2 validation; convert to safe integer poisha, never `Math.round(Number(raw)*100)` for wire authority. Stable account list version is required on edits. Selected account statement must reject stale cross-account/cross-tenant responses.

**Canonical accounting code:** backend `accountCodeFor(type,id)` maps `CASH`→`CASH:<id>`; both `BANK` and `MFS`→`BANK:<id>`; `LOAN`→`LOAN:<id>`. Never send `MFS:<id>`, a display name, a user-made `LOAN` account as a borrower asset, or an arbitrary fixed account. Verify money movement `resolveSide` rejects a mismatched caller prefix even when it extracts a valid ID; canonicalization must not silently accept a spoofed side or silently substitute a different account type.

**Trading Counter receipts.** `POST /api/v1/customer-payments`, `Idempotency-Key: <ULID>`, strict body `{customerPartyId,accountCode,amountMinor>0,saleIds:ULID[] (empty oldest-first),businessDate?,note?}` → `{data:CustomerReceiptResponse}`. `GET /api/v1/customers/:id/standing` → `{data:CustomerStandingResponse}`. `POST /api/v1/suppliers/payments`, same idempotency header, strict body `{supplierPartyId,amountMinor>0,accountCode,businessDate?,note?,purchaseId:ULID|null}` → `{data:SupplierPaymentResponse}`. `GET /api/v1/suppliers/:id/due` → `{data:SupplierDueResponse}`. One UI split row can map to a single `accountCode`; `paymentAccounts[]`, `discountMinor` / discountReason, multi-invoice explicit allocation and pure noncash settlement do **not** fit those DTOs. A UI invoice ID must be the real sale/purchase ULID, not an invoice number or preview source ID. The complete multi-leg settlement must be one **new approved owning service/UOW** with atomic account legs, due/advance/discount lines, allocations, audit/outbox and idempotency. Do not chain existing POSTs: partial success would corrupt both account and party balances. An expense paid to a supplier is not the supplier debt settlement unless the selected action is Pay Supplier.

**Expense Counter.** `POST /api/v1/expenses`, `Idempotency-Key: <ULID>`, strict body `{categoryId:ULID,amountMinor>0,accountCode,payeePartyId:null|ULID,note:null|string,businessDate?,backdateReason:null|string}` → `{data:ExpenseResponse}`. This is paid **in full**, from **one** account. The UI's free-form category text must resolve to an existing or explicitly created category ID; D07/MOD-012 owns future accrued/partial/settled expenses, not MOD-006. Existing source correction `PATCH /expenses/:id`, void `POST /expenses/:id/void` stay in owning expense service.

**Generic transfers and owner/current lender movements.** `POST /api/v1/money/movements` strict body `{kind,fromAccountCode,toAccountCode,amountMinor>0,businessDate,reference<=64|null,note<=500|null,operationId:ULID}` → `{data:CashMovementResponse}`. Valid `kind` is `TRANSFER|OWNER_INJECTION|OWNER_WITHDRAWAL|LOAN_RECEIVED|LOAN_REPAYMENT`, **not** public `OPENING_ADJUSTMENT`. From is credited, to is debited, one journal document. `TRANSFER` = canonical money account A → B (not equal), including CASH↔BANK/MFS and BANK↔BANK/MFS. `OWNER_INJECTION` = `OWNER_CURRENT_ACCOUNT` → selected money account. `OWNER_WITHDRAWAL` = selected money account → `OWNER_CURRENT_ACCOUNT`. `LOAN_RECEIVED` = backend lender-liability `LOAN:<accountId>` → selected money account; `LOAN_REPAYMENT` = selected money account → `LOAN:<accountId>`. Loan-side permissions are distinct (`loan.movement.record`); owner has `owner.capital.record`; transfer has `cash.movement.record`. Do not allow `LOAN` on ordinary transfer or owner movement. `GET /api/v1/money/movements?group=ALL|TRANSFER|OWNER|LOAN&accountId=&fromDate=&toDate=&search=&cursor=&limit=` is a read-only movement history, not a trading source ledger. `PATCH /api/v1/money/movements/:id` accepts a full corrected movement body plus `version` and `reason` (no create operationId). `POST /api/v1/money/movements/:id/void` body `{version,reason(3..300 chars)}`; preserve reversal, number, prior journal and audit. Backdated/period correction constraints remain server-owned.

**Owner, lender, borrower, interest:** Backend `LOAN` account and `LOAN:<id>` account code are explicitly **lender liability** with credit balance. UI `Lender Credit` corresponds to new principal borrowed, `Lender Debit` to repayment. UI `Borrower Debit` means a **new receivable from borrower** (DR borrower receivable / CR money asset), `Borrower Credit` means collection (DR money asset / CR borrower receivable), *not* reversal of a liability label. Historical lender opening is DR `OPENING_EQUITY` / CR lender liability. Historical borrower opening is DR proposed borrower-loan-receivable account / CR `OPENING_EQUITY`. Current `LOAN` opening via `ManageAccountsService` is account-only and does not constitute full finance person/relationship opening. Historical owner-capital opening cannot be posted as a current `OWNER_INJECTION` or double-count money account openings; its equity-classification semantics require an explicit source contract/approval. Principal and interest must be separate journal lines/sources; backend loan movement comments treat interest as a separately recorded expense, but no combined amortization/interest-income finance contract exists. For multi-account principal payments and linked finance person statements, propose a single finance settlement service and explicit borrower asset-family/chart amendment after D08 approval. Do not add a new chart member, migration or finance person table in this packet.

### R3.4 Exhaustive BankEntryType decision table

Frontend definition: `src/utils/bankEntry.ts`. Its `credit` means **money into the selected bank**, and `debit` means **money out**; these are not journal DR/CR labels. The current client `src/services/bankEntryApi.ts` calls `/api/bank/ledger/bootstrap`, `/api/bank/manual-entry` and `/api/bank/ledger`, using a legacy localStorage token and `{ok:true}`; none is a matched Nest controller route or response envelope. BankEntryTab today incorrectly requires a POS session even for bank-only actions. The new adapter must use FND session/HTTP/errors, Nest response decoders, canonical IDs, account statement reads and each source writer, with no preview fallback after live POST failure.

| Existing BankEntryType | Direction & desired journals (amount m) | Existing authenticated route? | Decision and missing contract |
|---|---|---|---|
| `Bank Charge` | Out of BANK; DR `EXPENSE:<approvedCategoryId>` m / CR `BANK:<id>` m | **Conditional** `POST /api/v1/expenses` | **ADAPT** only as a paid expense with real fee category ID, single bank account, correct source/category/permissions and reference/note policy; no raw transfer-to-expense |
| `Interest Received` | Into BANK; DR `BANK:<id>` m / CR **bank interest income** m | **No** matching income posting contract | **BLOCK** pending approved income account/category and source+reversal contract; never `OWNER_INJECTION`, SALES or negative expense |
| `Cheque Bounced (Received)` | Linked incoming cheque fails; if uncleared, no bank posting; if formerly cleared, restore relevant AR/settlement and reverse bank receipt | **No** cheque source route | **BLOCK** direct Bank Entry; route to linked cheque lifecycle, mandatory original receipt/invoice identity |
| `Cheque Bounced (Issued)` | Linked issued cheque fails; if uncleared, no bank posting; if formerly cleared, restore relevant payable/settlement and reverse bank payment | **No** cheque source route | **BLOCK** direct Bank Entry; route to linked cheque lifecycle, mandatory original payee/source identity |
| `Cash Deposit` | Bank in, drawer/safe out; DR `BANK:<id>` m / CR `CASH:<id>` m | **Yes** `POST /api/v1/money/movements` `TRANSFER` | **ADAPT** with explicit actual cash source ID; MOD-005 session when tracked drawer ON, OFF or untracked safe no session |
| `Cash Withdrawal` | Bank out, drawer/safe in; DR `CASH:<id>` m / CR `BANK:<id>` m | **Yes** `POST /api/v1/money/movements` `TRANSFER` | **ADAPT** with explicit actual cash destination ID, same drawer rule; no bank-only session gate |
| `Bank Adjustment` | Bank in/out needs known, *authorized* counteraccount or source correction | **No** free-form bank adjustment endpoint | **BLOCK** generic form; use versioned correction of a known underlying source where possible, otherwise define audited classified adjustment/reconciliation source and approved counterpart, never arbitrary `OPENING_EQUITY` or `ROUNDING` |

**Form fidelity:** Preserve bank-entry selection, backdate reason, date, direction, amount-in-words, reference, description, notes, review, ledger and retry state. `reference` length 150 in old UI exceeds movement max64; validate/extend explicitly, not silent truncate or encode into notes. Bank entry `description` (500 chars) has no generic movement equivalent, and `backdatedReason` is not a field on `recordCashMovementRequestSchema`; preserve as an explicit source reason policy and period rule, not an invented DTO field. Cheque bounce types remain visible with a useful link to the corresponding cheque until their lifecycle is supported. No bank account changes without verified journal source and response.

### R3.5 Cheque lifecycle contract to design (proposed, NOT EXISTING)

Use a tenant-owned cheque aggregate with stable ULID, version, direction Received/Issued, cheque number, bank/branch/account holder, value in poisha, cheque date and received/issued date, real party/source relationship, chosen settlement account, reference/note, attachment metadata and status/audit history. Initial record and status-only transitions before clearance must be **memorandum actions without bank journal postings**; UI already communicates “balance updates at clearance”. Received → Deposited → Cleared, Issued → Presented → Cleared, and Bounced/Returned/Cancelled/Stopped transitions require a separately reviewed transition table with reason and permission; do not assume every status is reversible or terminal identically for both directions.

Proposed endpoints, **not present in Nest branch**: `POST /api/v1/cheques` (idempotent create), `GET /api/v1/cheques` and `GET /:id`, `PATCH /:id` (optimistic version), `POST /:id/transitions` with `{expectedVersion,action,reason,settlementSourceId?,bankAccountId?,operationId}`, and an attachment endpoint compatible with the approved storage plan. On Cleared, in the **same UOW**, create exactly one authorized receipt/payment or finance settlement document, allocate party invoice/due where applicable, post bank leg once, and update cheque state+audit+idempotency. A bounced, returned or stopped **uncleared** cheque causes no bank balance change. A cheque invalidated **after a real clearance** must use the original source's correction/void and restore the correct receivable/payable/advance, with immutable journal and counted-session preservation. No standalone journal at cheque creation, no manual bank bounce entry and no duplicate settlement from status retries. Receipt/payment cash policy applies to the **actual cleared bank leg** only (no drawer); an independent subsequent cash refund/recovery is a different operation and can require a drawer session. File names visible in the existing preview are not evidence of binary upload; backend attachment persistence is a separate approved contract.

### R3.6 MOD-004 / MOD-005 dependency and decision boundary

- **MOD-000:** real tenant/session epoch, authorized HTTP, exact poisha/ULID, strict errors, idempotency and no fake fallback; only approved foundation slice has build approval.
- **MOD-001:** effective account/settings/permission flags and read cache invalidation; account visibility and cash enablement must be server-confirmed.
- **MOD-004:** canonical person/party ID, customer/supplier role balances, openings and ledger source allocation ownership. MOD-006 may reference that identity and own a distinct relationship record/ledger; must not fork `ManagePartiesService` or establish parallel finance person deduplication.
- **MOD-005 (owner of policy):** tenant cash lock, account `isDrawer` re-read, effective `cash_session_enabled` ON/OFF, same-business-date eligible OPEN session, `CASH_DAY_NOT_STARTED` server reason, correction/reversal provenance. MOD-006 must consume this **shared policy**, not write its own session checks. Current `resolvePaymentAccount`/`CashMovementService` unconditional checks remain implementation gaps, not current compliance.
- **MOD-007/008:** customer sales/purchase source allocations and settlement receipt semantics; Counter must invoke their approved underlying services without duplicating posting. **MOD-012:** expense accrual/split/settlement and bank charge expense-category policy. **MOD-014:** bank reconciliation consumes posted journal lines, never directly invents a balancing movement.
- **Decision D08:** approve borrower receivable chart family, relationship identity/cardinality, opening correction/cutover, owner-capital opening, interest earned/paid categories, principal-overpayment/advance semantics and finance-person vs account structure. No user-facing UI deletion is a permitted alternative.

MOD-005 semantics for each command: historical party/lender/borrower opening or its noncash correction → NO SESSION. Present-day tracked-drawer cash movement while ON → eligible same-date OPEN session; OFF → post normally with `sessionId:null`; bank/MFS-only, non-drawer safe and noncash source → no session. A backdated receipt is *not* an opening. A cash+bank split is all-or-none. No public `historical`/`skipSession` bypass flag. Reversals of posted cash do not delete old close records. The frontend must retain draft/operation ID on `CASH_DAY_NOT_STARTED` or unknown HTTP outcome.

### R3.7 Proposed missing contracts and approval gates (not routes to invoke)

| Missing contract | Proposed source-owned capability and minimum fields | Gate |
|---|---|---|
| Finance relationship | Link canonical `partyId` + relationship kind `OWNER|LENDER|BORROWER`, active/inactive, principal ledger account ID, version and tenant, with distinct owner/liability/receivable semantics; verified role permissions, cross-tenant validation and identity reuse | D08 + MOD-004 approval |
| Finance historical opening | Dedicated relationship opening `{relationshipId,direction/amountMinor,businessDate,reason?,operationId}`, no payment account, journal ↔ `OPENING_EQUITY`, versioned reverse/repost correction, source number/audit; no session | D08 + chart/account audit approval |
| Finance current settlement | `{relationshipId,kind,principalMinor,interestMinor?,paymentLegs:[{accountId,amountMinor}],businessDate,reference?,note?,operationId}`, owner/loan/borr direction validated, principal vs interest, no double posting, atomic UOW, linked source, versioned correction | D08 + MOD-005; no new route until design approved |
| Customer/supplier Counter split + settlement | Existing customer/supplier source service extension: `{partyId,selectedSourceId|null,allocationMode,legs:[{accountId,amountMinor}],discountMinor,discountReason,expectedSourceVersion?,businessDate,operationId}`; cash sum and discounted due effects separate, atomic journal/allocation | MOD-004/007/008 + D05; precise DTO, interest/advance rules and editor tests required |
| Expense split/accrual | Paid/unpaid amounts, payment legs, outstanding liability and subsequent settlement, versioned source corrections; existing paid-one-account path preserved | D07 + MOD-012 |
| Reactivate account | Versioned source-controlled status transition; verify balance/drawer uniqueness, permissions, no import of past post to active session | MOD-001 settings + MOD-005, approval |
| Interest received and manual bank adjustment | Explicit approved interest-income and classified adjustment account/source, counterparty/source reference, reason/permissions, correction, audit/idempotency and reconciliation effect | Chart amendment + accounting owner approval |
| Cheque lifecycle | Status-transition graph, source allocation, clearing/return/reversal UOW, cheque attachment and reconciliation link; preserve UI statuses and print | MOD-004/007/008/014 + D08 where finance linked |

These are **design signatures**, not implemented endpoints and not a license for a builder to invent Zod or SQL fields. Each blocked line needs a follow-up exact request/response schema, DB/RLS/lock design, migration number, service+repository test contract, approved file allowlist and owner decision before implementation.

### R3.8 Bounded task order and file ownership

| Task | Stage | Allowed future module paths, once individually approved/reserved | Do not modify |
|---|---|---|---|
| `MOD-006-T01` | Stage A read + compatible account CRUD/statement | `src/integration/accounts.ts` (per `tasks/SECONDARY_WORKFLOWS.md` ACC-01), `src/pages/Finance.tsx` Money Accounts handlers, `src/pages/Accounts.tsx` account route/state, `src/components/finance/FinanceRecordDialogs.tsx` relevant account dialog, **exact new test paths assigned by coordinator** | Backend money services/schema, global `src/types/erp.ts`, shared HTTP |
| `MOD-006-T02` | Stage A narrow single-tender Counter source settlements | Proposed `src/integration/counter-settlements.ts`, `src/components/finance/CounterWorkspace.tsx`; only chosen source-linked handlers and approved tests | Shared MOD-004 ledger model/posting, sale/purchase services, expense writer |
| `MOD-006-T03` | Stage A transfer/owner/lender-liability compatible one-leg | Proposed `src/integration/finance-movements.ts`, `src/pages/Finance.tsx` exact transfer/owner handlers, `FinanceRecordDialogs.tsx` relevant editors | `cash-movement-service.ts`, account codes, cash policy until coordinator assignment |
| `MOD-006-T04` | Stage B bank entry and cheque | Proposed `src/integration/bank-entries.ts` and `src/integration/cheques.ts`, `src/services/bankEntryApi.ts` replacement **only** after type parity, `src/components/accounts/BankEntryTab.tsx`, `ChequeDialogs.tsx`, `ChequeActionDialog.tsx`; backend controller/service/repository/schema reserved separately | Direct URL-only replacement; generic posting; shared schema before explicit approval |
| `MOD-006-T05` | Stage B finance relationships/openings/current settlement | Proposed `src/integration/finance-relationships.ts`, Finance people/split components and authorized backend finance service+repository+contract paths after D08 | MOD-004 party identity/posting, MOD-005 policy ownership, fixed accounts before chart approval |

This replaces the earlier generic proposed `src/integration/accounts-counter-finance.ts` with **nonoverlapping resource adapters**, aligning ACC-01 with `src/integration/accounts.ts`. Actual test filenames and backend paths are **UNRESERVED / PROPOSED** until each task receives a coordinator manifest. Frontend `src/pages/Finance.tsx`, `src/data/financePreviewStore.ts` and `src/data/financeAccounts.ts` are shared across tasks; reserve the exact owner and nonoverlapping symbol range before work. Backend shared `core-contracts`, `core-domain/accounting/account.ts`, `core-application/*/index.ts`, `apps/api/src/money/money.module.ts`, `adapter-postgres/schema.ts`, migrations, provider setup and CI belong to coordinator-owned tasks only. The docs-only packet edit authorizes none of these writes. Under `tasks/EXECUTION.md`, only **one active builder** may run; other chats prepare plans/evidence. Approved backend additive contract lands/test-pins first, then React client adoption; no auto-merge, deployment or Project-lock-by-comment.

### R3.9 Accounting / rollback vectors — proposed verification against disposable PostgreSQL 16

All amounts are **poisha**, and signs below describe positive journal debit/credit; tests should assert exact journal line/source count, tenant, version, audit, idempotency and zero partial side effects. **These are specifications, not tests run.**

| ID | Preconditions / operation | Expected journal / source | Rollback and session assertion |
|---|---|---|---|
| A01 | Create BANK opening 100000; later current bank receipt 25000; supplier payment 30000 | Opening DR BANK100000 / CR OPENING_EQUITY100000; receipt DR BANK25000 / CR AR25000; supplier DR AP30000 / CR BANK30000; closing bank95000 | Only one account opening; no session for opening or bank-only legs; statement rows and totals authoritative |
| A02 | Account rename and stale-version edit | No change to prior journals, balance or ID | Stale version conflict, draft preserved; cross-tenant account does not leak; nonzero deactivate rejected; zero deactivate preserves history |
| M01 | Transfer CASH drawer → BANK, 25000 | DR BANK25000 / CR CASH25000, one movement document | ON no same-day OPEN session → no source/line/balance; OFF → once, null session; ON eligible → once linked |
| M02 | BANK A → MFS B, 25000 | DR BANK:B25000 / CR BANK:A25000 (MFS code uses BANK) | No session in ON/OFF; identical or inactive account rejected; fail both legs, no half-transfer |
| M03 | Owner injects 40000 to BANK; owner withdraws 10000 | Injection DR BANK40000 / CR OWNER_CURRENT_ACCOUNT40000; withdrawal DR OWNER_CURRENT_ACCOUNT10000 / CR BANK10000 | No trading party ledger; one source each; permission check; duplicate operation ID no extra posting |
| M04 | Lender loan account receives 50000 to CASH | DR CASH50000 / CR LOAN:lender50000 | Principal liability increases, not liquid total; ON tracked cash requires session; OFF null session |
| M05 | Lender opening 900000, no cash | DR OPENING_EQUITY900000 / CR loan liability900000 | Succeeds ON with no session; must not inject money; distinct finance relationship source still needs extension |
| M06 | Borrower opening 700000, no cash | DR **borrower receivable**700000 / CR OPENING_EQUITY700000 | Must not use `LOAN:lender` or AR trading balance; blocked until account family/contract approved |
| M07 | Business lends 150000 by BANK; borrower later repays 25000 to BANK | Lend DR borrower receivable150000 / CR BANK150000; collect DR BANK25000 / CR borrower receivable25000 | No loan liability or trading AR change; borrower ledger outstanding125000; blocked new finance writer |
| M08 | Backdated lender repayment of 10000 paid from tracked CASH | DR lender loan liability10000 / CR CASH10000 | Still current payment, not opening; ON no eligible session → whole rollback; OFF post without session |
| S01 | Counter receives customer 20000 by CASH + 30000 BANK, gives discount 5000 on due55000 | DR CASH20000 + DR BANK30000 + DR approved discount/settlement account5000 / CR AR55000, one receipt/allocation source | ON no session → all legs including bank/discount rolled back; OFF/eligible ON all-or-none; discount noncash, source permission/approval required |
| S02 | Counter pays supplier 25000 BANK on billed AP25000 | DR AP25000 / CR BANK25000, source payment allocates selected purchase or oldest-first | No drawer session; if source changed, stale/conflict leaves no money movement |
| E01 | Counter paid expense 30000 from BANK | DR EXPENSE:category30000 / CR BANK30000, one expense source | Unpaid/partial/split cannot be submitted as full-paid via old DTO; no generic supplier settlement |
| B01 | Bank charge 500 BANK | DR EXPENSE:fee500 / CR BANK500, original expense source | Only if category and exact single-pay expense validated; no session; otherwise block |
| B02 | Bank interest earned 1000 BANK | DR BANK1000 / CR approved interest-income account1000 | Block until income account/source exists; NEVER owner injection |
| B03 | Cash Deposit 20000 and Cash Withdrawal 8000 | Deposit DR BANK20000 / CR CASH20000; withdrawal DR CASH8000 / CR BANK8000 | Drawer ON gate only when isDrawer true; no session for bank-only; corrected source reversal preserved |
| C01 | Create incoming cheque 40000, deposit, then clear once | Before clearing no journal/bank delta; clearing DR BANK40000 / CR selected customer receivable40000 via linked receipt/source | Duplicate clearance/key/version conflict → no duplicate money; cheque identity/source assigned once |
| C02 | Incoming uncleared cheque bounces; issued uncleared cheque stopped | Status+audit only, no money journal | No fake bank debit/credit and no party due change if none posted |
| C03 | A previously cleared linked cheque bounces | Owning receipt/payment source reversal restores exact AR/AP/advance and bank via audited correction | Preserve prior journal/close history; no blind opposite generic movement; blocked until reversal contract |
| R01 | Void/correct movement, source version stale, foreign ID or closed period | Valid correction writes reverse/repost with same source identity; invalid case none | Reason mandatory where contract requires; prior row/audit immutable; concurrent POST same operationId one effect |
| R02 | Cash OFF→ON switch with in-flight posting, timezone or drawer change | Deterministic policy resolution under tenant lock, source journal once | No OFF movement attached to later session; no old closed expected total rewritten; not testable until MOD-005 policy approved |
| R03 | Split 10000 CASH + 15000 BANK, ON without session | No journal, no source, no payment allocation | All-or-none UOW; client keeps same operation ID and all draft fields |

**Required harness:** contract/unit tests for validators, poisha decoding, all seven BankEntryType dispositions, cheque graph and account-code canonicalization; backend integration tests for journal/source, permissions, RLS, idempotency, stale version and crash/rollback; React→Nest→disposable PostgreSQL 16 Playwright flows and screenshot comparison for Accounts, Counter, Finance, Bank Entry and Cheques (desktop/tablet/mobile), both language helpers and cash ON/OFF. Existing backend `apps/api/test/cash-day.spec.ts`, `parties.spec.ts`, `sales.spec.ts`, `purchases.spec.ts`, `expenses`-covered specs, `corrections.spec.ts` and future cheque/finance tests must run at pinned paired heads. Do not claim coverage from frontend preview unit tests or Nest Vue E2E alone.

### R3.10 Readiness and owner decision checklist

- **Ready to specify for individual Stage A approval:** real account identity/list/statement; compatible account create/update/deactivate; bank/MFS/CASH source-code mapping; owner injections/withdrawals and authorized transfers; narrowly supported one-account supplier/customer/expense postings; lender-liability single-leg movements. Actual live **cash-sensitive writes remain blocked until MOD-005 policy**. Account reactivate and extra UI metadata remain gaps.
- **BLOCKED / Stage B:** full Counter split+discount/allocation parity, partial/unpaid expenses, person-linked owner/lender/borrower statements and historical finance openings, borrower receivable account, mixed principal/interest and multi-account finance movements, interest income, free-form bank adjustments, every cheque create/clear/bounce/reversal/attachment contract.
- **Required D08 owner sign-off:** canonical relationship identity and borrower account classification; owner capital historical treatment; loan principal vs interest rules and any interest earned account; allowance for advances, overpayment and correction. Architecture agent must first present an explicit proposed accounting chart and test impacts. D05 classification is already confirmed; do **not** ask owner again whether historical openings require sessions.
- **Coordinator next gate:** reconcile current MOD-000 and MOD-005 PR/issue heads, assign one exact task file allowlist and backend paired SHA, reserve worker and any shared code/schema ownership, attach the approved contract/decision, then allow TDD on disposable DB. This amendment alone **does not** reserve or start a worker.
- **No UI removal:** retain Accounts/Counter/Finance routes, typography, compact dialogs, bilingual helpers, split editor, invoice selection, cheque statuses, review confirmations, printing, account ledger and cash-session controls. For unavailable connected writes, explain the precise missing contract, preserve draft, and never mutate preview data as if live. No merge/deployment or schema migrations before explicit approval.


---

## Revision 4 — MOD-006-T01-R read-only account integration handoff (2026-11-12)

**Status: READY FOR REVIEW, NOT BUILD-APPROVED.** This document-only slice plans GET account list and selected account statement, not account creation/edit/status, cash/finance transactions, Bank Entry or other Accounting screens. It is subordinate to MOD-000 accepted identity/transport, MOD-001 permission/settings reads, the one-worker coordinator rule in `tasks/EXECUTION.md`, and owner approval. It does not reserve capacity. Current inspected source heads: frontend `bd888d1a3dd48cb61370a53a3f6bcdee463302ce` and backend adoption `e2a0a486d6d36cddd51ba58eece83c83c9f2ee69`; revalidate both before dispatch. Tracking: [MOD-006 issue #296](https://github.com/shuvodelux-commits/hisabiq_ui/issues/296), [program queue #294](https://github.com/shuvodelux-commits/hisabiq_ui/issues/294).

### T01-R source chain and exact API

Frontend route `/app/accounts?tab=money-accounts` renders `Finance moneyAccountsOnly` through `src/pages/Accounts.tsx`. `src/pages/Finance.tsx` currently selects accounts from `financePreviewStore`, displays local card balances and passes account + preview transactions/transfers to `FinanceAccountActionDialog`, whose recent ledger can fall back to matching account **names**. This is preview behavior, not live ledger authority. Preserve the Accounts general vouchers, chart, trial, full statements, print and export surfaces: a money-account journal statement is not a universal Accounting report.

- `GET /api/v1/money/accounts` with optional `includeInactive` and `asOf=YYYY-MM-DD` → **direct** `MoneyAccountListResponse` containing `accounts[]` and `totalCashMinor,totalBankMinor,totalMfsMinor,totalLoanMinor`. Backend: `AccountsController.list` → `ManageAccountsService.list` → tenant-scoped repository/journal rollup and permission filtering.
- `GET /api/v1/money/accounts/:id/statement` with optional `fromDate,toDate,search,kind,cursor,limit` → **direct** `AccountStatementResponse`. `kind` is `ALL|SALE|PURCHASE|EXPENSE|MOVEMENT|OTHER`, `search` max80 chars, `limit` 1..200. Backend: `AccountsController.statement` → `DailyCashService.statement` → journal lines and running balances.
- No `{data:...}` / `{ok:true}` envelope for either GET. Use approved MOD-000 FND transport/auth, strict validation and tenant epoch, not the legacy bank client. With existing Zod `z.coerce.boolean()`, omit `includeInactive` if false rather than transmitting a truthy string `false`; send true explicitly only when required.

### T01-R field-to-view mapping (no backend schema changes)

| UI account field / behavior | Existing server authority | Translation or nonparity |
|---|---|---|
| `id` | `MoneyAccountResponse.id` ULID | Exact persistent account identity; never preview `acc-*` or display-name identity |
| `name` | `name` | Direct; duplicate names distinguish by actual reference or stable ID |
| `type` | `CASH/BANK/MFS/LOAN` | Cash→Cash, Bank→Bank, MFS→Mobile Banking. `CASH` cannot distinguish existing UI `Petty Cash`; do not infer a purpose from label. `LOAN` is lender liability, never spendable money |
| `institution` | **No exact field** | `holderName` means holder, not bank name/provider. Missing metadata remains explicit gap |
| `number` | `reference` only if semantically approved | Never infer number from account name or silently relabel a reference as a bank number |
| `balance` | `balanceMinor` | Integer poisha, authoritative server journal; convert exactly at presentation boundary, never update by summing preview rows |
| `openingBalance` | `openingAmountMinor` nullable, `openingDate` nullable | Preserve null/unknown; no zero fabrication or date default |
| `status` | `ACTIVE/INACTIVE` | Direct enum translation; permission-filtered missing account is not inactive |
| `lastActivity` | **No matching account list field** | Only derive from verified statement rows if available; do not show invented “Just now” |
| Drawer/version | `isDrawer`, `version` | Preserve for future approval-controlled actions; no local permission inference |
| Liquid totals | `totalCashMinor,totalBankMinor,totalMfsMinor` | Server aggregate; never add `totalLoanMinor` into available cash/bank |
| Statement header | `accountId,accountName,type,openingBalanceMinor,closingBalanceMinor,totalInMinor,totalOutMinor` | Server totals and ID must match selected current account/session epoch |
| Statement row | `journalLineId,businessDate,createdAt,sourceType,sourceNumber,sourceId,description,reference,amountMinor,debitMinor,creditMinor,runningBalanceMinor` | Stable journal-line ID, nullable source ID and server running balance; never recompute from paginated subset |
| Statement page | `page.nextCursor,hasMore` | Server cursor and filtering, no fake full ledger from local preview |

Account card status and selected statement must be identity/epoch scoped. A late response for account A must not appear beneath selected B. Missing or forbidden account must not leak a previous account's rows, total or print/export data. Connected failures cannot silently fall back to preview fixtures; deliberate preview is an independent mode. A valid zero-row statement with historical opening is not an API error. Permission-omitted loan accounts and bank settings must remain omitted in all linked selectors and exports.

### T01-R bounded ownership and excluded writes

| Path | Proposed ownership |
|---|---|
| `src/integration/accounts.ts` | **CREATE after approval:** named account-list and account-statement GET adapters consuming existing FND HTTP and session, strict decoders, safe amount formatting and cancellation |
| `src/pages/Finance.tsx` | **MODIFY after reservation:** only account-card/list read consumption and selected account identity, no transfer, Counter, loan, cheque, cash or modal write behavior |
| `src/components/finance/FinanceRecordDialogs.tsx` | **MODIFY after reservation:** selected-account recent-ledger read presentation only, no edit/manual/status write changes |
| `src/pages/Accounts.tsx` | **INSPECT ONLY**, current `Finance moneyAccountsOnly` route likely sufficient; do not modify voucher/trial/general ledger |
| `src/data/financeAccounts.ts` / `financePreviewStore.ts` | **INSPECT ONLY**; unchanged preview behavior stays preview-only |
| Shared `src/integration/http.ts`, session, permissions, `src/types/erp.ts`, backend `money` services/contracts, `core-domain/accounting/account.ts`, schema, migrations and CI | **NO WRITES** from this slice; coordinator owns shared changes |

All proposed file modifications are **not an allowed-write manifest** until coordinator assigns exact paths/symbol boundaries. Existing account create form captures opening money but **no opening date** (`Finance.tsx:AccountDialog`), while `createMoneyAccountRequestSchema` requires a date for positive opening; `institution` and `number` also lack exact backend storage. Thus T01 write integration must not silently default historical date to today, encode provider in holderName or drop fields. Preserve Add Account, Edit, Activate/Deactivate, Money in/out, Transfer, Bank Entry, statement and print controls visually and in preview; no connected mutation may falsely report success before its separately approved write source is in place.

### T01-R proposed acceptance vectors (not executed)

| Test | Expected server/frontend assertion |
|---|---|
| R01 List identities | Server-direct envelope, real tenant-scoped ULIDs; permission-filtered types; no preview IDs/balances |
| R02 Duplicate names | Account A and B can display same name, but selecting B opens only B's exact ID and journal |
| R03 Asynchronous selection | A→B selection before A GET finishes, tenant/session switch, logout: no stale or cross-tenant response or export |
| R04 Journal totals | Opening BANK 100000 poisha + receipt 25000 − supplier payment 30000 → server closing 95000 and exact source rows; GET makes no new journal |
| R05 Pagination/filter | `kind`/date/search/cursor filter on server, not only loaded page; running balance stays authoritative |
| R06 Nulls | Zero-row valid opening, nullable opening amount/source ID, unknown last activity: no synthetic zero, source or date |
| R07 Access/error | Unauthorized/foreign account, non-Liquid LOAN, malformed envelope, timeout and aborted GET preserve honest live state; no preview fallback |
| R08 Display regression | Original compact cards, responsive mobile/tablet, bilingual helpers, keyboard, account selection, Bank Entry launch and print affordance preserved |
| R09 Read-only guarantee | No account create/update/deactivate, no movement, journal, audit or cash session mutation; valid tests use React→Nest→disposable PG16 with authenticated tenants |
| R10 Query coercion | `includeInactive=true` vs omitted controlled behavior; do not send string `false` expecting false coercion |

### T01-R approval overview (12 sentences)

MOD-006-T01-R is proposed as a read-only Stage A account integration slice. It will reuse NestSherERP's authenticated money-account list and statement GET endpoints rather than inventing new finance services. HisabIQ's account cards, existing ledger dialog, routes and bilingual compact UI remain unchanged in appearance. Account selection and statement queries will use persisted ULIDs instead of fixture IDs or duplicate account names. Server journal balances, openings, totals and running rows will be authoritative, with money converted from integer poisha only for display. Account visibility will continue to respect backend permissions, features and the current tenant identity. Late responses, logout, account switches and permission changes must never display stale or cross-tenant financial information. The frontend's distinct Petty Cash label and bank-provider metadata lack exact backend fields and will not be silently guessed or discarded. Account creation, editing, deactivation, reactivation, manual entries, transfers and all posting actions are excluded from this slice. The backend's positive opening-balance date requirement will be addressed in a later separately approved account-write task instead of inventing a date now. Verification will use unit/contract and React-to-Nest integration tests with disposable PostgreSQL 16, including negative authorization and UI-preservation checks. Implementation may start only after MOD-000/MOD-001 acceptance, owner approval of this scope and executor, and the coordinator's verified single-worker file reservation; merge and deployment remain manual.

**Dispatch gate:** exact paired accepted heads, MOD-000/001 dependencies, per-slice 10–15 sentence owner approval and chosen environment, one verified GitHub Project #2 BUILD worker reservation, exact shared-file allowlist, named tests and disposable PG16. Then only a scoped draft PR with actual verification exits and independent QA, **no automatic merge/deployment**. T01-W account writes and T02..T05 remain separately blocked.


---

## Revision 5 — T01-R current-head reconciliation and D08 no-regression gate (2026-11-13)

**Scope unchanged:** this is a **documentation-only amendment to draft PR #297**, not an implementation approval or rewrite of `R4. Existing `R4 read-only T01-R still excludes account writes, Counter, cash policy, loans, transfers, cheque and bank posting. This revision supersedes older source-head snapshots and the specific statement-total assumptions below where they conflict with verified source. Read-only account GET APIs remain stable.

### R5.1 Reverified immutable references and dependency status

| Authority | Observed head / evidence | Implication for T01-R |
|---|---|---|
| HisabIQ React `main` | `8409f5e28621ffd38e1e0c8c9ae9d03d6412af7d` | `src/pages/Accounts.tsx`, `src/pages/Finance.tsx` and the existing compact finance dialog still govern presentation. `Accounts.tsx` now derives tab selection directly from URL query; do not add another duplicate tab state. |
| NestSherERP adoption branch | `54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a` | `apps/api/src/money/accounts.controller.ts`, `packages/core-contracts/src/money.ts`, `manage-accounts-service.ts` and `daily-cash-service.ts` retain the existing account GET routes and strict response shapes. |
| MOD-000 foundation | Backend [issue #17](https://github.com/shuvodelux-commits/nestshererp/issues/17) **closed** with F0-01…F0-07 accepted engineering handoff; [final evidence](https://github.com/shuvodelux-commits/nestshererp/issues/17#issuecomment-6819672498) | The earlier `R4` “MOD-000 incomplete” observation is historical. The connected AppShell is still deliberately gated; FND authorization is not permission to activate finance writes. |
| MOD-001 | Scoped Settings/Team/Invoice PRs accepted, with [queue checkpoint](https://github.com/shuvodelux-commits/hisabiq_ui/issues/294#issuecomment-6832995198) stating *whole-module acceptance remains incomplete* | Do not mark MOD-001 complete merely from closed read/write subtask issues. Obtain coordinator's accepted T01-R read prerequisites and authority from precise scopes. |
| D08 finance identity | [Draft PR #292](https://github.com/shuvodelux-commits/hisabiq_ui/pull/292), head `93b744b9bed70af092a69bd9c89b3b81285d112f`, **unapproved proposal** | Future classified owner entries and borrower funds depend on explicit sign-off; do not implement changes in T01-R. |
| MOD-004 role isolation | [Backend draft PR #33](https://github.com/shuvodelux-commits/nestshererp/pull/33) and [issue #28](https://github.com/shuvodelux-commits/nestshererp/issues/28) | Active independently scoped party ledger work; leave its five backend paths and worker reservation untouched. No account-list read should accidentally reuse its party-wide ledger authority. |
| Cash sessions | [Frontend PR #282](https://github.com/shuvodelux-commits/hisabiq_ui/pull/282) open; MOD-005 cash ON/OFF policy still separately gated | T01-R GETs post no money, require no cash session, and must not interpret an account list request as starting or closing a day. |

**Read-path status:** ready for owner/coordinator review of the already drafted `R4` T01-R subset; **not** ready for an executable build until exact acceptance of MOD-001 prerequisites, explicit scope/environment approval, live exclusive Project #2 reservation and allowed paths/tests. Source heads above are observations, not a paired execution lock or proof of free capacity. Existing MOD-002/004 workers and finance PRs must not be displaced.

### R5.2 Statement field semantics — correction to prevent wrong totals

Reinspected backend `DailyCashService.statement` (unchanged at observed head). Its implementation calls `listStatementLines` and `sumStatementBefore` with the requested filters and cursor; sets `openingBalanceMinor` from the repository's prior-line sum; increments running balance across **only the returned page**; and adds `totalInMinor` and `totalOutMinor` from **only page rows**, after `slice(0,limit)`. It sets `closingBalanceMinor = account.balanceMinor` from the account rollup, **not** from the selected page's last running balance and **not** an independently proven as-of date-window closing. Thus the API names must not be displayed as “entire filtered date-period inflow/outflow” or “period closing”, especially when paginated or when `toDate` precedes today.

| Field | Verified meaning in existing service | UI and QA rule |
|---|---|---|
| `openingBalanceMinor` | Repository sum before the selected filtered/cursor position | Treat as *page statement opening*, not the account's immutable go-live opening; test filtered/cursor semantics |
| `rows[].runningBalanceMinor` | Opening + preceding signed rows *on this returned page* | Render the server row value; do not re-sum all preview rows; verify cross-page continuity |
| `totalInMinor` / `totalOutMinor` | **Returned page** positives/negatives | Label explicitly “shown entries” if surfaced; never represent as whole filtered period totals |
| `closingBalanceMinor` | Current authoritative account balance in `findAccountById` | Label current account balance, not as-of/period closing; test `toDate` in the past |
| `GET /money/accounts?asOf=YYYY-MM-DD` balances | Account-list balances at selected as-of (backend service documented intent) | Separate list as-of filter from statement's current account closing; do not silently assert they are the same period result |

**Contract gap:** a true period total/period-closing summary across all pages requires a separately reviewed read-projection extension with explicit `periodOpeningMinor,periodInMinor,periodOutMinor,periodClosingMinor` or equivalent; **no new backend endpoint or field is authorized by T01-R**. Existing Account Ledger dialog can display current balance and statement page rows correctly, but must not fabricate a period summary or imply that loaded pages comprise all movements.

### R5.3 D08 proposal compatibility — not an approved account-model change

The latest D08 draft challenges two older MOD-006 assumptions:
1. `OWNER_CURRENT_ACCOUNT` is a legacy owner-current classification, **not established owner equity**. D08 proposes separate shared `OWNER_CAPITAL` and `OWNER_DRAWINGS` controls and per-owner journal attribution, retaining unreconciled historical current-account balances until evidence supports reclassification. Existing `OWNER_INJECTION`/`OWNER_WITHDRAWAL` endpoint journals remain real v1 semantics, but must **not** be relabeled as fully classified capital/drawings for connected HisabIQ.
2. D08 now proposes **one fixed `BORROWER_LOAN_RECEIVABLE` asset control** with mandatory per-loan-agreement attribution, instead of an earlier parameterized borrower GL family. This is an **unapproved draft choice**, not a live chart member. The existing `LOAN:<id>` family remains a lender liability; no borrower receivable may be mapped to it or to customer-trade AR.

Neither proposal changes the approved read-only T01-R account DTO: the existing `LOAN` account is still excluded from spendable money totals, and `totalLoanMinor` is a liability summary. Do not build any D08 prototype, alter fixed account codes, edit schema, add finance people, create finance opening journals, or retrofit owner movement codes under this T01-R task. After D08 owner decision, revise later **T03/T05** designs and test matrices explicitly, then obtain bounded implementation authorization.

### R5.4 Read-only coordinator dispatch evidence checklist (future, not completed here)

- [ ] Coordinator records accepted dependency SHA pair, actual authorized runner, exactly one Project #2 BUILD worker and shared-page ownership after reconciling active MOD-004 work. Chat messages or issue labels alone do not reserve it.
- [ ] Owner approves the existing twelve-sentence `R4` T01-R review scope and chosen environment, or a changed scope gets a new bounded overview. Existing unchanged approval need not be repeated.
- [ ] Reserve only `src/integration/accounts.ts` plus named account **read** call sites in `src/pages/Finance.tsx` and `src/components/finance/FinanceRecordDialogs.tsx`, and exact test files. `src/pages/Accounts.tsx`, account preview stores, shared HTTP/session/auth and backend remain read-only unless separately reserved.
- [ ] Adapter uses current FND authenticated transport and tenant/epoch abort handling; strict success decoding and fail-closed authorization. No `{data:...}` wrapper expectation on list/statement GET; no bearer-token lookup inside account component; no legacy `/api/bank` fallback.
- [ ] Accepted test suite includes **two-tenant** identity and permission isolation, duplicate names, status/type/loan visibility, nullable openings, stale account A→B, logout/tenant switch, `includeInactive` omitted/true (never string `false`), server pagination, page-only total semantics and backdated `toDate` mismatch, plus selected-page/print privacy.
- [ ] Assert zero writes to account, money, journal, cash sessions, settlements or audit from both GET paths; disposable PostgreSQL16 for end-to-end financial reads; UI screenshot comparison at 390/768/1440px and bilingual keyboard/touch behavior. Tests remain **specified**, not executed in this packet.
- [ ] Connected AppShell gate stays closed until separately approved integration activation; preview mode remains deliberate and independent, no live error triggers fake fixture success. Post-PR exact diff, test exit codes, QA and owner-controlled merge/deployment required.

**Decision requested before any code:** separately approve **MOD-006-T01-R read-only accounts list + statement integration** as the next scoped task once its MOD-001 prerequisite and coordinator-exclusive runner are confirmed. Other MOD-006 tasks are not implicitly approved.
