# MOD-005 — Optional cash sessions and daily cash history

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000, MOD-001, MOD-006. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-005-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/components/finance/CashSessionDetailsDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/finance/CashSessionDetailsDialog.tsx#L1)
- [src/components/layout/CashSessionDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L1)
- [src/contexts/CashSessionContext.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/CashSessionContext.tsx#L1)
- [src/finance/cashSession.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/finance/cashSession.ts#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/money/day` | [CashSessionsController.day](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L56) | Inline / no body; linked method | `DayStatusResponse` | `CashSessionService.status` |
| `GET /api/v1/money/daily-cash` | [CashSessionsController.history](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L61) | `dailyCashQuerySchema` | `DailyCashResponse` | `DailyCashService.history` |
| `POST /api/v1/money/day/start` | [CashSessionsController.start](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L69) | `startDayRequestSchema` | `{ data: CashSessionResponse }` | `CashSessionService.startDay` |
| `POST /api/v1/money/day/:id/close` | [CashSessionsController.close](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L80) | `closeDayRequestSchema` | `{ data: CashSessionResponse }` | `CashSessionService.closeDay` |
| `POST /api/v1/money/day/:id/reopen` | [CashSessionsController.reopen](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L93) | `reopenDayRequestSchema` | `{ data: CashSessionResponse }` | `CashSessionService.reopenDay` |
| `GET /api/v1/money/movements` | [CashSessionsController.listMovements](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L109) | `moneyMovementListQuerySchema` | `MoneyMovementListResponse` | `MoneyMovementsService.list` |
| `POST /api/v1/money/movements` | [CashSessionsController.record](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L120) | `recordCashMovementRequestSchema` | `{ data: CashMovementResponse }` | `CashMovementService.record` |
| `PATCH /api/v1/money/movements/:id` | [CashSessionsController.correctMovement](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L135) | `correctCashMovementRequestSchema` | `{ data: { ok: true } }` | `CashMovementService.correct` |
| `POST /api/v1/money/movements/:id/void` | [CashSessionsController.voidMovement](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/money/cash-sessions.controller.ts#L148) | `voidDocumentRequestSchema` | `{ data: { ok: true } }` | `CashMovementService.void` |
| `GET /api/v1/settings` | [SettingsController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/settings/settings.controller.ts#L27) | Inline / no body; linked method | `{ data: SettingsResponse }` | `ManageSettingsService.get` |
| `POST /api/v1/settings/value` | [SettingsController.setValue](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/settings/settings.controller.ts#L32) | `updateSettingRequestSchema` | `{ data: SettingsResponse; warnings: readonly { code: string; message: string }[] }` | `ManageSettingsService.updateSetting` |
| `PATCH /api/v1/settings/business` | [SettingsController.setBusinessProfile](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/settings/settings.controller.ts#L53) | `updateBusinessProfileRequestSchema` | `{ data: SettingsResponse }` | `ManageSettingsService.updateBusinessProfile` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-005-F01 | Start session and previous-day blocking — `CashSessionProvider.startSession` | ADAPT | money/day; money/day/start | Use server business date/drawer balance/blockedSession, named counterpart and stable operation ID. | CASH-START |
| MOD-005-F02 | Count, close, reopen and history — `CashSessionProvider.saveCount` | ADAPT | money/day/:id/close; :id/reopen; daily-cash | Local count draft is not server close; keep all superseded close history. | CASH-CLOSE |
| MOD-005-F03 | Settings ON/OFF and safe money posting without sessions — `money.cashSession` | EXTEND | settings/value; shared drawer writers | PR16 setting guards do not fix OFF money posting. Serialize settings/posting/start consistently. | D05 |

## 5. Proposed architecture and unresolved approval

Do not start from scratch over PR282. Check issue281 and backend issue14/PR16 first. Setting metadata says inEffect:false despite session service reading it. Current resolvePaymentAccount and CashMovementService.record omit OFF logic. Cutover fails until exact no-session semantics are implemented and tested.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D02,D05.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [money fields](../contracts/money.md)
- [settings fields](../contracts/settings.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/cash-sessions.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/components/finance/CashSessionDetailsDialog.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/components/layout/CashSessionDialog.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/contexts/CashSessionContext.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/finance/cashSession.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/cash-sessions.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-cash-sessions.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-cash-sessions-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-005-T01: Start session and previous-day blocking

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `CashSessionProvider.startSession`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `money/day; money/day/start`. **Gate:** CASH-START.

**Algorithm / expected output:** Use server business date/drawer balance/blockedSession, named counterpart and stable operation ID. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-cash-sessions.test.ts` case `MOD-005-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-005-T02: Count, close, reopen and history

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `CashSessionProvider.saveCount`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `money/day/:id/close; :id/reopen; daily-cash`. **Gate:** CASH-CLOSE.

**Algorithm / expected output:** Local count draft is not server close; keep all superseded close history. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-cash-sessions.test.ts` case `MOD-005-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-005-T03: Settings ON/OFF and safe money posting without sessions

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-001, MOD-006. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `money.cashSession`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `settings/value; shared drawer writers`. **Gate:** D05.

**Algorithm / expected output:** PR16 setting guards do not fix OFF money posting. Serialize settings/posting/start consistently. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-cash-sessions.test.ts` case `MOD-005-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D02,D05

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-005-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.

## Revision 2 requirement precedence

[Integrate existing capabilities first, then extend missing UI parity](../HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md). [Cash-session classification](../tasks/CASH_SESSION_POLICY.md): historical opening balances, including lender/borrower openings, do not require an active session; actual tracked-cash movements do when ON, and OFF permits ordinary sessionless cash transactions. Do not add a cash check to historical openings or treat a credit/unpaid document as a cash payment. All existing UI features remain in scope; unsupported normal workflows keep their Stage B extension tasks and cannot be declared complete after compatible-slice integration alone.

---

## Revision 3 — source-reconciled MOD-005 approval packet (2026-11-11)

**Precedence:** this amendment supersedes the preceding packet's unverified proposed duplicate `src/integration/cash-sessions.ts` and `tests/integration-cash-sessions.test.ts` work wherever the existing PR #282 already implements the same scope. The older sections remain as provenance, not permission to build parallel implementations. **Status:** DOCS-ONLY PROPOSAL; MOD-005 backend extension is NOT APPROVED, NOT RESERVED, NOT BUILDING, NOT QA-PASSED. Source verification below is at the immutable refs stated; none of the candidate PRs is merged. The source-action census and review remain evidence, not complete execution authorization.

### R3.1 — Reconciled GitHub facts and reusable candidates

| Item | Verified state, head and result | Reuse/decision |
|---|---|---|
| [UI issue #281](https://github.com/shuvodelux-commits/hisabiq_ui/issues/281) | OPEN; owner approved *existing cash-session UI/API adoption* on 2026-11-10; no issue comments | Scope approval for that integration, **not** new caller-wide policy/finance extensions |
| [UI PR #282](https://github.com/shuvodelux-commits/hisabiq_ui/pull/282) | OPEN, unmerged; **GitHub draft flag false** although body calls itself draft; `62b6576842252fdd94a3f42e625c89e64fcaa792` from `feat/cash-session-api-adoption-a01`; 10 changed files | REUSE the existing typed `src/services/cashSessionApi.ts`, `CashSessionContext`, cash dialog, Finance history and Settings toggle; do not make a rival transport/provider/dialog |
| UI PR #282 CI | PR Fast CI run 42838224176 success, authentication-preview run 42838224096 success; screenshot-refinement checks skipped; new 1440×900/390×844 light/dark cash browser smoke uses **mocked API** and seeded token | Frontend contract/preview evidence only; no real authentication, gateway, Nest/PostgreSQL posting or independent browser acceptance proved |
| [Backend issue #14](https://github.com/shuvodelux-commits/nestshererp/issues/14) | OPEN; owner design policy approved in comment #6791796559; verification scope #6792004965; BUILD authorized later in comment #6793227178 | Do not reimplement safeguards as another issue or take its worker scope |
| [Backend PR #16](https://github.com/shuvodelux-commits/nestshererp/pull/16) | OPEN **DRAFT**, unmerged; `913fedc7e9919cce72a81af5a2131ff3a05fad96` from `issue-14-cash-session-safeguard`, base `1643dac059e568407bba2fff38a990268dfe28fe`; exactly nine approved files | REUSE `SettingsRepository.lockTenant`, `cashSessionHistory` and `lockCashSessionPolicy`; do not write overlapping files before human acceptance/coordinator serialization |
| Backend PR #16 QA | Builder reports Node20.20.2/pnpm9.15.9 build/typecheck/lint/boundaries PASS and 57/57 isolated tests (cash-day22, settings20, audit15) on disposable PostgreSQL `127.0.0.1:55442`; CI run 43008264196 success; independent read-only QA reviewed 5/5 AC at head and reported PASS | QA **did not rerun** builder tests; medium coverage gaps: equal-timestamp audit ambiguity and profile-save/Start race; 496 changed lines exceed 400-line auto-merge cap, so human review only |
| Historical backend base | `chore/hisabiq-adoption-runtime-a01` at `1643dac059e568407bba2fff38a990268dfe28fe` | Baseline for comparison; PR #16 cannot be assumed merged |
| Original frontend baseline | `main` source `176bb1a3e8f42eef192ea3098074ac5c8a214261` in source evidence; PR #282 is a separate candidate | Obtain current main SHA at future dispatch; never assume a stale pinned head is current |

Existing UI PR #282 uses `GET /api/v1/money/day`, `POST /api/v1/money/day/start`, `POST /api/v1/money/day/:id/close`, `POST /api/v1/money/day/:id/reopen`, `GET /api/v1/money/daily-cash`, `GET /api/v1/money/accounts`, `GET /api/v1/settings` and `POST /api/v1/settings/value`; use the current Nest response envelopes, poisha integer amounts and a stable 26-character mutation operation ID. Connected mode requires a real server-validated token and same-origin `/api/v1` gateway; the present HisabIQ login is preview only. A token in `shererp_auth_token` is not token issuance. Failed or uncertain money POSTs retain draft and operation identity; do not fall back to preview success. PR #282's setting preflight is defense in depth, not the backend invariant.

### R3.2 — Twelve-sentence owner approval overview (PROPOSED; not approval)

1. MOD-005 will preserve the existing HisabIQ React cash-session dialog, Finance history, settings UI, preview behavior, keyboard/touch interactions and bilingual text.
2. Its compatible Stage A lifecycle will reuse the existing Nest day, daily-cash, account and settings endpoints rather than create another cash-session application.
3. Frontend issue #281 and PR #282 supply an existing UI/API candidate that must be reviewed, not reimplemented.
4. Backend issue #14 and draft PR #16 supply the setting, timezone, OFF-interval and Start/Reopen locking safeguards pending human acceptance.
5. Stage B will add one transaction-aware application policy for the **designated drawer** and make all actual receipt, payment, transfer and correction callers obey it.
6. Historical customer, supplier, vendor, lender and borrower openings will remain session-free balanced opening journals rather than new cash transactions.
7. When enabled, an actual tracked-drawer movement will require a matching eligible OPEN business-date session, while Bank/MFS-only, non-drawer and unpaid actions will not.
8. When disabled, legitimate tracked-drawer transactions will continue through the ordinary permissioned journal with `sessionId: null` and no fabricated daily count.
9. ON/OFF, Start/Reopen, drawer posting and affected close/account/profile transitions must use a consistent tenant-scoped locking and date policy.
10. Source corrections, reversals, reopening and counted closes will retain all historical journal, close, audit and source identities without silent edits or relinking.
11. The first build depends on approved foundation authentication/transport, settings/timezone and authoritative money-account/drawer contracts, with lender/borrower relationship persistence separately owned by MOD-004/MOD-006.
12. Only a future approved, coordinator-reserved, test-isolated increment may edit application files, and independent QA plus human review must precede any merge or deployment.

### R3.3 — Lifecycle and UI/backend parity

| Action | Existing state / exact backend contract | Intended disposition and mandatory edge behavior |
|---|---|---|
| Status | `GET /api/v1/money/day` → `DayStatusResponse`: `enabled`, `drawerAccountId`, `businessDate`, `todaySession`, `blockedSession`/`blockedByDate`, previous close, ledger drawer balance, `canReopenToday`; PR #282 `CashSessionContext` reads it | REUSE/ADAPT; server-authoritative tenant date, drawer and previous unclosed day; an API error is an error, not a simulated successful session; OFF currently has null today/blocked session view fields, **not deleted history** |
| Start | `POST /api/v1/money/day/start` with business date, counted opening in integer minor units, counterpart account if opening differs from actual drawer ledger, note and operationId | REUSE PR #282; ON and no conflicting/previous unclosed day; refuse future or OFF-interval/backdated ineligible dates; validate source/counterpart and retain typed amount on refusal; no automatic start and no count invented |
| Count/close | `POST /api/v1/money/day/:id/close` with `countedClosingMinor`, variance reason and operationId; backend derives expected and journals shortage/overage | REUSE; require physical count even when expected is known; reason required on difference; atomic close/audit; keep closing figure and variance immutable; ensure concurrent new drawer post cannot slip between expected count and close |
| Count draft | PR #282 `saveCount` supports local/device draft; backend has **no count-draft endpoint** | Preserve as explicitly DEVICE-ONLY; do not describe it as server-saved or invent a request |
| Reopen | `POST /api/v1/money/day/:id/reopen`, reason and operationId | REUSE PR #282/PR #16; only authorized same current business day after a close; reverses adjustment with new source, marks prior close SUPERSEDED rather than deleting it; use shared lock and OFF-interval eligibility |
| History | `GET /api/v1/money/daily-cash` with cursor/limit; Finance history/detail surfaces; close records contain ACTIVE/SUPERSEDED provenance | REUSE; pagination and source figures from server; show historical days despite current OFF mode, never mix preview seed rows into connected history; no overwriting counted figures |
| Setting | `GET /api/v1/settings` and `POST /api/v1/settings/value` with `cash_session_enabled: on/off`; existing UI setting | ADAPT backend-only policy for payment paths; only commit UI toggle after server confirmation; no local-only connected setting; preserve current effective default ON; metadata catalogue `inEffect:false` is inconsistent and a separately scoped Settings task, **excluded** from PR #16 |
| Other cash activity | Existing POS/purchase/receipts, Finance movements and corrections remain distinct writers | EXTEND their existing owning use cases; start prompt only for genuine `CASH_DAY_NOT_STARTED` drawer gating, preserving draft, not for bank-only/noncash or historical opening |

### R3.4 — Authoritative cash classification

| Business operation | Session ON | Session OFF | Source/account rule |
|---|---|---|---|
| Customer receivable/advance or supplier payable/advance opening; supported vendor opening | **No session** | No session | Existing `ManagePartiesService.postOpening/setOpening/correctOpening` and `openingBalancePosting`; Opening Equity counterparty, no drawer movement |
| Historical lender liability/borrower receivable opening and noncash correction | **No session** | No session | **Future MOD-004/MOD-006 relationship services**, not yet present in trading-party API; Opening Equity, no loan cash received or lent |
| Money-account opening/retag/correction | **Separate account policy review** | Separate review | Existing `ManageAccountsService.postOpening` changes account balance; do **not** generalize party exemption to changing counted drawer expectations |
| Stock opening/count, draft, quotation, schedule edit, note, credit sale, unpaid purchase/expense | No session | No session | No real current money leg; source, AR/AP/inventory/expense posting still enforced when applicable |
| Sale/receipt/installment or vendor/purchase-return cash receipt; cash borrower collection | **Eligible OPEN day required** | Journal normally, `sessionId:null` | Actual validated designated `isDrawer` incoming leg; no balance-outflow check on inbound receipt |
| Supplier payment, purchase cash-paid leg, landed cost, expense, refund, vendor payout, loan repayment/loan disbursement | **Eligible OPEN day required** | Journal normally, `sessionId:null` | Actual outgoing designated drawer leg; preserve CASH balance and permissions |
| Owner injection/withdrawal and cash↔bank/MFS transfer | **Eligible OPEN day required** | Journal normally, `sessionId:null` | Actual tracked drawer touched, independently of source label |
| Bank↔Bank/MFS, Bank/MFS-only payment, non-drawer cash account | No session | No session | Check actual tenant account `isDrawer`, not `CASH:` prefix, still validate permissions/period/funds |
| Split Cash+Bank/MFS | Whole source operation refuses if ON lacks OPEN day | Both legs journal atomically; cash `sessionId:null` | Cash leg only session-associated when ON; never post a bank leg before a cash refusal |
| Real cash movement dated earlier or DTO labelled `historical` | **Cannot bypass policy** | Allowed only under ordinary period/correction rules | Only dedicated opening source type is an opening; never trust a caller's boolean |
| Correct/void posted cash movement; return/refund that creates current cash | Depends on actual current drawer impact and approved correction date | Normal correction with null *new* session link where appropriate | Immutable original source/session/close provenance, version/period/reversal, mandatory reason |

### R3.5 — Complete baseline direct-caller trace (10 service files; existing implementation)

The common boundary is `packages/core-application/src/purchasing/payment-account.ts::resolvePaymentAccount` (baseline lines 49–124). It resolves account IDs against tenant repository, requires account visibility, rejects inactive accounts, protects CASH outflow exceeding balance, returns `sessionId:null` for `!isDrawer`, but **unconditionally demands OPEN session for `isDrawer` even when setting OFF**. Keep its existing response type `{code,name,sessionId}` and optional `outflowMinor` argument; add the shared policy dependency through explicitly reserved provider wiring and source-level tests. The baseline has the following **ten** direct importing service files; several contain two call sites, not just one:

| Existing direct caller | Current action and helper call site | Future affected Nest provider / functional boundary |
|---|---|---|
| `sales/create-sale-service.ts` | `create` loop over actual `command.payments` at ~269; credit sale with empty payments bypasses helper, each payment row has its own `sessionId` | `apps/api/src/sales/sales.module.ts`; preserve sale header/payment-row consistency and exact split |
| `sales/receive-payment-service.ts` | customer receive ~150 and customer receipt correction ~342 | Same sales module; receipt is inbound, correction creates source-linked effect |
| `purchasing/create-purchase-service.ts` | `paidMinor>0` purchase ~416; paid=0 bypasses helper | `apps/api/src/purchasing/purchasing.module.ts`; legacy one-account paid DTO is **not** the UI's split-purchase contract |
| `purchasing/pay-supplier-service.ts` | supplier payment correction ~188 and new supplier settlement ~361; outflow passed | Same purchasing module; preserve oldest-first vs bill allocation |
| `purchasing/landed-cost-service.ts` | paid landed cost ~243; null account becomes payable | Same purchasing module, including composition from vendor settlement |
| `expenses/manage-expenses-service.ts` | paid expense ~141 and expense correction ~358 | `apps/api/src/expenses/expenses.module.ts`; existing API paid-only, unpaid/partial expense is a separate Stage B contract |
| `returns/create-sales-return-service.ts` | actual cash refund ~417; zero refund bypasses helper | `apps/api/src/returns/returns.module.ts`; preserve return/refund caps |
| `returns/create-purchase-return-service.ts` | actual supplier refund receipt ~271; zero receipt bypasses helper | Same returns module; preserve returned-stock/source caps |
| `warranty/warranty-service.ts` | money recovery account supplied ~299; absent account is noncash | `apps/api/src/warranty/warranty.module.ts`; only real money recovery requires drawer policy |
| `vendors/vendor-money-service.ts` | vendor payout ~173 and vendor receipt ~346; payment vs inbound receipt | `apps/api/src/vendors/vendors.module.ts`; do not duplicate the nested customer-payment writer |

**Independent movement/correction seams outside those ten imports:** `packages/core-application/src/money/cash-movement-service.ts::record` (open check ~181), `::correct` (~401) and `::void`/`assertDrawerOpenFor` (~301/~506–523). `void` currently treats **any** `CASH:` journal line as tracked drawer and checks only whether *some* session is open; this is incorrect when CASH account `isDrawer=false` and insufficient to protect posting/correction date. `packages/core-application/src/corrections/change-transaction-date-service.ts` derives original `drawerSessionDate` and reuses `sessionId` for redated documents; preserve exact session/date source history and never silently relink a counted day. Existing party opening sources `core-domain/src/parties/opening-balance.ts` and `parties/manage-parties-service.ts` are **read-only reuse**, not new cash policy callers. Audit other delegated/indirect calls through the ten owning services before expanding writes.

### R3.6 — Shared policy, setting transitions and serialization

**Proposed internal application contract only (no new HTTP endpoint, public client bypass flag, migration or second posting engine):**

```ts
type CashSessionEffect =
  | { kind: 'NO_CURRENT_CASH_MOVEMENT' }
  | { kind: 'CURRENT_MONEY_MOVEMENT'; accountIds: readonly string[]; postingBusinessDate: string };
type CashSessionResolution = {
  sessionId: string | null;
  effectiveMode: 'ON' | 'OFF' | 'NOT_APPLICABLE';
};
// CashSessionPolicy.resolve(tx, ctx, effect) uses existing SettingsRepository,
// MoneyRepository, tenant/clock and the accepted PR #16 locking helper.
```

1. Owning UOW authorizes the command, validates real sources/accounts and resolves payment legs by tenant-owned IDs. No `historical`, `skipCashSession` or trust-me flag is accepted from HTTP.
2. No current money movement (including zero payment rows) skips policy; non-drawer-only account IDs resolve `NOT_APPLICABLE` and null session.
3. For a candidate drawer movement, acquire the **same tenant-scoped PostgreSQL row lock** introduced by PR #16 (`SettingsRepository.lockTenant` and `lockCashSessionPolicy`), not another lock.
4. After the lock re-read authoritative tenant timezone/business date, historical OFF intervals, actual account state and `isDrawer`, effective `cash_session_enabled`, and session; then apply existing permission/period/balance guards. Resolve any pre-lock account read, source lock and transaction lock-order inversions **before** BUILD.
5. If OFF, continue source-owned, exactly-once ordinary journal with null session link, even for tracked cash. If ON, require an actual OPEN eligible session for the **posting cash business date** and designated drawer; reject missing/mismatched/ineligible day with `VALIDATION_FAILED` detail `reason:CASH_DAY_NOT_STARTED` where compatible. Do not attach an OFF-period movement to a later OPEN day.
6. The source-owning application UOW posts journal, allocations, inventory when relevant, movement rows, audit, outbox and idempotency response atomically; aggregate repeated account outflows and reject an entire mixed payment if any leg fails.
7. Intended lock order: tenant cash-policy lock → re-resolved account/source locks → stock/allocation locks → journal/audit/outbox. No lock remains open during a cashier's physical count dialog. A future implementer must prove this order is compatible with existing source locks rather than silently changing other modules.

**Transitions (reuse PR #16 after human acceptance):** ON→OFF refuses any OPEN day for the same tenant and makes **no setting or history write**; no automatic close. Closed/no-open day may turn OFF. OFF→ON is refused on the tenant's same business date even with no cash movement; a later eligible business date is allowed. Start on any date containing an OFF interval, including backdating, is refused. Setting, Start and Reopen share the lock; business profile timezone saves also use it and audit replay reconstructs prior timezone. Ambiguous/missing setting audit fails closed, not assumed enabled. Default remains ON. OFF does not delete closed/superseded days or ordinary journal history. Idempotency/key reuse and foreign-tenant refusal still apply.

**Additional concurrency seam requiring source-level proof:** `CashSessionService.closeDay` in PR #16 still invokes `requireSessionsEnabled` rather than `lockCashSessionPolicy`, while the new drawer policy will lock the tenant. Verify a close/post race and, if a shared lock is required, reserve the existing `cash-session-service.ts` **after PR #16 integration** for a separately approved close serialization slice; never edit its PR head concurrently. Likewise `ManageAccountsService` changes `isDrawer`, account openings and profile state must not race a validated drawer write. The proposed common lock must cover eligible drawer retag/deactivation and close posting, or explicitly prove an equivalent existing serialization; coordinate these with MOD-006/account ownership. A view-only status read is not a substitute for this write-path lock.

**Corrections:** party/lender/borrower *historical opening* corrections never call the cash policy; source reversal/repost goes against Opening Equity and maintains original entry and correction audit. Corrections/voids/refunds that **change actual cash now** go through the applicable policy and posting-date/period rules; no old close gets recalculated or deleted by toggling OFF. A closed-day movement may require a linked prior-period/current adjustment and impact preview rather than reopening an earlier counted close. `ChangeTransactionDateService` must preserve originally linked source/session identity and avoid an OFF setting becoming an unrestricted redate bypass. Actual borrower/lender repayment is a **new settlement**, separate from the historical principal opening; the current backend's `LOAN:<id>` represents a lender liability only and is not an implemented borrower receivable.

### R3.7 — Strict proposed incremental file allowlists (NOT granted write permissions)

**This revision's entire actual write scope:** frontend `docs/integration/modules/MOD-005-cash-sessions.md` only, on a unique docs branch and draft PR. No application code, schema, migrations, tests, CI or other documents changed. Later slices require **new** owner approval, exact base/head SHAs, approved test/runner, coordinator worker and shared-file reservation; the lists below identify bounded proposed candidates, not permission to edit them now.

| Proposed follow-up | Exact candidate source/test paths only | Required gate / shared owner |
|---|---|---|
| M5-01 adopt lifecycle | Existing UI PR #282 **only**: the ten paths enumerated on that PR; no new `src/integration/cash-sessions.ts`, context, dialog or lifecycle endpoint | Human reviews PR #282; align foundation authentication/gateway, explicit preview/live isolation, usable screenshot acceptance. No competing build |
| M5-02 safeguard | Existing backend PR #16 **only**: `FUNCTION_MAP.md`; `apps/api/src/settings/settings.module.ts`; `apps/api/test/{audit,cash-day,settings}.spec.ts`; `packages/adapter-postgres/src/settings-repository.ts`; `packages/core-application/src/{money/cash-session-service.ts,settings/manage-settings-service.ts,settings/settings-repository.ts}` | Reuse tested QA candidate; human/manual review/merge first; shared settings files remain with #14 until released |
| M5-03 shared resolver policy | CREATE `packages/core-application/src/money/cash-session-policy.ts`; MODIFY `packages/core-application/src/index.ts`; TEST `apps/api/test/cash-day.spec.ts` and `apps/api/test/settings.spec.ts` | Coordinator owns shared application export, test files; no new providers until exact constructor/fixture manifest approved; reuses PR #16 lock |
| M5-04a sales receipt paths | `packages/core-application/src/purchasing/payment-account.ts`; `packages/core-application/src/sales/create-sale-service.ts`; `packages/core-application/src/sales/receive-payment-service.ts`; `apps/api/src/sales/sales.module.ts`; `apps/api/test/sales.spec.ts` | Single owner of shared resolver; update its deps once, then freeze helper for downstream slices; inspect direct class constructors and fixture deps prior to execution |
| M5-04b purchasing paths | `packages/core-application/src/purchasing/{create-purchase-service.ts,pay-supplier-service.ts,landed-cost-service.ts}`; `apps/api/src/purchasing/purchasing.module.ts`; `apps/api/test/purchases.spec.ts` | Uses already updated resolver; do not rewrite helper or implement unsupported UI split purchase within this task; inspect vendor composition and fixtures |
| M5-04c expenses/returns | `packages/core-application/src/expenses/manage-expenses-service.ts`; `packages/core-application/src/returns/{create-sales-return-service.ts,create-purchase-return-service.ts}`; `apps/api/src/expenses/expenses.module.ts`; `apps/api/src/returns/returns.module.ts`; `apps/api/test/returns.spec.ts`; `apps/api/test/cash-day.spec.ts` | Existing paid-only expense behavior stays; unpaid expense contract elsewhere; return zero-refund sources remain ungated |
| M5-04d warranty/vendors | `packages/core-application/src/warranty/warranty-service.ts`; `packages/core-application/src/vendors/vendor-money-service.ts`; `apps/api/src/warranty/warranty.module.ts`; `apps/api/src/vendors/vendors.module.ts`; `apps/api/test/cash-day.spec.ts` | Provider/constructor/fixtures must first be enumerated; add a named focused test file only after separate allowlist approval, not by guessing an existing spec |
| M5-05 movements/corrections | `packages/core-application/src/money/cash-movement-service.ts`; `packages/core-application/src/corrections/change-transaction-date-service.ts`; `apps/api/src/money/money.module.ts`; `apps/api/src/corrections/corrections.module.ts`; `apps/api/test/cash-day.spec.ts`; `apps/api/test/corrections.spec.ts` | Correct tracked-drawer detection, placement-date and closed-history preservation; provider edits only if constructor must change |
| M5-06 close/drawer concurrency review | READ `packages/core-application/src/money/cash-session-service.ts` and `packages/core-application/src/money/manage-accounts-service.ts`, `apps/api/src/money/money.module.ts`, `apps/api/test/cash-day.spec.ts`; any WRITE requires a *separate precise coordinator reservation after PR #16* | Do not overlap issue #14, account/MOD-006 worker or shared test. Explicitly approve additional files only after source-level lock trace |
| M5-07 frontend dependency alignment | READ/reuse `src/services/cashSessionApi.ts`, `src/contexts/CashSessionContext.tsx`, `src/components/layout/CashSessionDialog.tsx`, `src/settings/TenantSettingsPage.tsx`, `src/pages/Finance.tsx` from PR #282 | Touch only exact future approved handler subset once MOD-000-A identity/HTTP is accepted; no UI redesign or new fake token |
| M5-08 historical finance relationships | **Other module / backend issue #15**, coordinated with MOD-004/MOD-006; no MOD-005 write allowance | Lender/borrower opening/settlement persistence and account type need their own accepted DTO/storage/journal/migration packet; no pretending `LOAN` liability covers borrower assets |
| Settings catalogue metadata | READ `packages/core-contracts/src/settings.ts` (CASH_SESSION_ENABLED `inEffect:false`) | Separate owner-approved MOD-001 setting descriptor correction after confirming intended semantics; expressly not part of PR #16 or present docs PR |

Before M5-04a–d dispatch, the coordinator must finish the remaining **exhaustive** constructor/`new Service`/mock/fixture wiring search across the permitted repositories and write the concrete paths into that task's dispatch issue; this is a *blocking planning action*, not builder discretion. The same physical `apps/api/test/cash-day.spec.ts` and other shared files cannot be edited by simultaneous tasks. All application file lists above are candidates for separate sequential PRs; whole directories, aliases or globs are never a blanket write permission.

### R3.8 — Required ON/OFF regression vectors (PROPOSED / NOT RUN)

| # | Setup/action | Expected source, money and session result |
|---|---|---|
| V01 | ON; no session; customer historical AR opening 500000 poisha | DR AR500000, CR Opening Equity500000; no money or session mutation |
| V02 | ON; no session; supplier payable opening 300000 | DR Opening Equity300000, CR AP300000; no drawer check |
| V03 | ON; no session; future approved lender liability opening 900000 | DR Opening Equity900000, CR lender liability900000; no session; **requires MOD-004/MOD-006** |
| V04 | ON; no session; future approved borrower receivable opening 700000 | DR borrower receivable700000, CR Opening Equity700000; no session; **requires finance extension** |
| V05 | Correct customer opening 500000→450000 | Append reversal/repost; net AR450000, old source/audit retained, no cash-session change |
| V06 | ON; no session; credit sale/payments[] and unpaid purchase | Allowed source/journal/stock effects; **zero** cash leg; no cash-day refusal |
| V07 | ON; no session; Bank/MFS-only receipt/payment 25000 | Success, one bank/MFS journal source, null session |
| V08 | ON; no session; non-drawer CASH account or bank↔MFS transfer | Allowed by own permissions/funds; no false `CASH:` prefix gate |
| V09 | ON; no session; designated-drawer payment/receipt 25000 | `CASH_DAY_NOT_STARTED`; **zero** document/journal/allocation/stock mutation |
| V10 | ON; eligible OPEN same-day drawer session; same actual movement 25000 | Exactly one journal/source/payment, valid session link |
| V11 | OFF; no session; designated-drawer movement 25000 | Exactly one normal balanced source/journal, `sessionId:null`, funds/period checks unchanged |
| V12 | Split drawer 10000 + bank 15000, ON/no session | Whole transaction refuses, bank leg/stock/source not partially posted |
| V13 | Same split, ON with eligible day; then OFF with no day | Both legs exactly once, only ON tracked-drawer leg linked; OFF cash leg null |
| V14 | Opening lender/borrower then real cash settlement10000 | Opening remains sessionless; later settlement requires session ON, not OFF; no second revenue/principal opening |
| V15 | Attempt ordinary receipt with fake `historical:true`/foreign account | Reject bypass/foreign account and all posting; tenant isolation |
| V16 | ON→OFF with OPEN day | Refuse atomically; setting, open day, journal and audit unchanged |
| V17 | Count+close then ON→OFF | Physical counted close/reason persists; OFF succeeds, history still visible |
| V18 | OFF→ON same tenant date (even zero activity); then next eligible date | Same date refuses; later day succeeds; Start on any OFF-interval date refuses |
| V19 | Concurrent Start/setting OFF/drawer post, including midnight timezone edge | Tenant-lock serial order; no OFF posting linked to a later or closed day; no duplicate/partial journal |
| V20 | Concurrent close/post and account drawer retag/deactivate | One deterministic counted expected result or safe refusal; never attach posting after close; requires source-level gap proof |
| V21 | Reopen current closed day with reason; attempt earlier date/feature OFF | Current eligible authorized case succeeds with SUPERSEDED old close and new reversal; earlier/OFF refuses; history unchanged |
| V22 | Correct/void drawer movement after counted close; prior-period redate | Source-linked correction only, required reason/period/version, no mutation of prior close figures/session provenance |
| V23 | Missing drawer, permissions revoked, foreign tenant, idempotent retry/altered operation | Precise refusal/no writes; identical retry does not double count; different body reusing key refuses |
| V24 | Equal-timestamp settings history or concurrent timezone-profile save/Start | Audit ambiguity must fail closed; coordinated time/date decision and explicit focused tests close PR #16 QA's medium coverage gap in a *later approved task* |
| V25 | Connected UI 401/403, network timeout/unknown POST, no token and mocked-vs-real mode | Preserve entered count/payment/source draft and operation ID; never preview-post from live failure; device-only saved count explicitly labelled |
| V26 | History OFF and 320/390 phone, 768/820 tablet, 1440 desktop, dark/light/Bangla/keyboard | Historical closes remain accessible; no fixture rows leak into live history; existing dialog, responsive UI and navigation unchanged |

Golden verification must inspect **journal lines, session links, source version, account rollup, audit/outbox, stock when applicable** using RLS-isolated tenants; HTTP 200 or screenshot alone is insufficient. Proposed focused checks after approval: backend `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test:boundaries` and only the exact named Vitest suites approved for that task on **a freshly verified disposable PostgreSQL target**; frontend TypeScript/ESLint/design contract/unit/build/selected Playwright and actual React→Nest→disposable DB integration. Existing run outputs belong to PR #16/#282 only; **none** of the vectors above has been executed as a MOD-005 extension test in this documentation pass.

### R3.9 — Dependencies, worker boundary and completion gate

- **Foundation MOD-000-A / issue #17:** real auth/token exchange, tenant identity/timezone, shared same-origin HTTP, reliable mutation identity and preview/live isolation; already approved as its *own* task but not a completed backend cutover. Connected cash QA must not authenticate by merely seeding localStorage.
- **Settings MOD-001:** current effective `cash_session_enabled`, protected toggle permissions and auditable setting history; PR #16 setting transition/lock contract must be accepted before relying on it. Catalogue `inEffect` discrepancy is a separate review and may not silently remove enforcement.
- **Money accounts MOD-006:** designated `isDrawer`, actual tenant-owned account identities, account opening vs physical day count, funded outflows, deactivation/retag serialization and authoritative timezone/profile; read locks from real account rows, not code prefixes or UI flags.
- **Finance MOD-004/MOD-006 / issue #15:** lender/borrower historical opening and later settlement are distinct sources; do not steal its files or treat a nonexistent borrower persistence feature as already integrated.
- **Coordinator D02/worker:** GitHub Project #2, live claims, approved PR heads, actual selected runner/worktree, unique owner/session, one-worker limit and shared-file ownership must be verified and reserved; comments/assignees are not atomic reservations. Do not remove another worker's files. Current doc drafting does not reserve a build worker.
- **Remaining D05 acceptance blockers:** settle PR #16 human merge gate; source-prove close/post/drawer-change lock compatibility; enumerate full provider/constructor/fixture manifests; authorize precise subtask tests and disposable DB; close equal-timestamp/profile-race test gaps separately. UI PR #282 is not marked draft by GitHub metadata and needs normal reviewer correction/reconciliation; mock-backed UI CI is not real end-to-end QA.
- **Acceptance:** (a) approved 10–15 sentence owner overview/environment; (b) separate exact per-task allowlist and coordinator reservation; (c) accepted dependency SHAs; (d) test and source accounting matrix against disposable DB; (e) actual browser responsive/authenticated UI regression; (f) independent QA on paired SHA; (g) explicit human approval of each merge. No application changes, migrations, automatic merge, deployment, production/retained-data tests or forced queue dispatch are authorized by this document.
