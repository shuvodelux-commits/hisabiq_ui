# MOD-000 — Authentication, application shell and integration foundation

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** None. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-000-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/App.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/App.tsx#L1)
- [src/components/layout/ActionMenu.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ActionMenu.tsx#L1)
- [src/components/layout/AnimatedAdvancedFilters.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/AnimatedAdvancedFilters.tsx#L1)
- [src/components/layout/AnimatedSegmentedSwitch.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/AnimatedSegmentedSwitch.tsx#L1)
- [src/components/layout/AppShell.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/AppShell.tsx#L1)
- [src/components/layout/Calculator.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Calculator.tsx#L1)
- [src/components/layout/CashSessionDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/CashSessionDialog.tsx#L1)
- [src/components/layout/ErpNavMenu.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ErpNavMenu.tsx#L1)
- [src/components/layout/FloatingPanel.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/FloatingPanel.tsx#L1)
- [src/components/layout/GlobalSearchBox.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/GlobalSearchBox.tsx#L1)
- [src/components/layout/PageBoundary.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/PageBoundary.tsx#L1)
- [src/components/layout/RowActionMenu.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/RowActionMenu.tsx#L1)
- [src/components/layout/SababTopNavStrip.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SababTopNavStrip.tsx#L1)
- [src/components/layout/Sidebar.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/Sidebar.tsx#L1)
- [src/components/layout/SidebarTrigger.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/SidebarTrigger.tsx#L1)
- [src/components/layout/ThemePicker.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/ThemePicker.tsx#L1)
- [src/components/layout/TopBar.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/components/layout/TopBar.tsx#L1)
- [src/contexts/CashSessionContext.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/CashSessionContext.tsx#L1)
- [src/contexts/ThemeContext.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/ThemeContext.tsx#L1)
- [src/contexts/UserPreferencesContext.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/contexts/UserPreferencesContext.tsx#L1)
- [src/features/auth/AuthFlowPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthFlowPage.tsx#L1)
- [src/features/auth/AuthLayout.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/AuthLayout.tsx#L1)
- [src/features/auth/LoginPreviewPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/features/auth/LoginPreviewPage.tsx#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/dashboard/summary` | [DashboardController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/dashboard.controller.ts#L16) | Inline / no body; linked method | `{ data: DashboardSummaryResponse }` | `GetDashboardSummaryService.execute` |
| `POST /api/v1/auth/login` | [LoginController.withPassword](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/login.controller.ts#L27) | `loginWithPasswordRequestSchema` | `{ data: LoginResponse }` | `LoginService.withPassword` |
| `POST /api/v1/auth/login/google` | [LoginController.withGoogle](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/login.controller.ts#L35) | `loginWithGoogleRequestSchema` | `{ data: LoginResponse }` | `LoginService.withGoogle` |
| `POST /api/v1/auth/login/pin` | [LoginController.withPin](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/login.controller.ts#L43) | `loginWithPinRequestSchema` | `{ data: LoginResponse }` | `LoginService.withPin` |
| `POST /api/v1/auth/refresh` | [LoginController.refresh](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/login.controller.ts#L51) | `refreshRequestSchema` | `{ data: LoginResponse }` | `LoginService.refresh` |
| `POST /api/v1/auth/logout` | [LoginController.logout](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/login.controller.ts#L60) | `refreshRequestSchema` | `void` | `LoginService.logout` |
| `GET /api/v1/me` | [MeController.get](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/me.controller.ts#L21) | Inline / no body; linked method | `{ data: MyAccessResponse }` | `GetMyAccessService.execute` |
| `POST /api/v1/auth/password/otp` | [PasswordRecoveryController.sendOtp](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/password-recovery.controller.ts#L31) | `requestPasswordResetRequestSchema` | `{ data: RequestPasswordResetResponse }` | `RequestPasswordResetService.execute` |
| `POST /api/v1/auth/password/reset` | [PasswordRecoveryController.resetPassword](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/password-recovery.controller.ts#L40) | `resetPasswordRequestSchema` | `void` | `ResetPasswordService.execute` |
| `POST /api/v1/auth/registration/otp` | [RegistrationController.sendOtp](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/registration.controller.ts#L46) | `requestSignupOtpRequestSchema` | `{ data: RequestSignupOtpResponse }` | `RequestSignupOtpService.execute` |
| `POST /api/v1/auth/registration/otp/verify` | [RegistrationController.verify](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/registration.controller.ts#L55) | `verifySignupOtpRequestSchema` | `{ data: { verified: true } }` | `VerifySignupOtpService.execute` |
| `POST /api/v1/auth/registration` | [RegistrationController.register](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/registration.controller.ts#L64) | `completeRegistrationRequestSchema` | `{ data: RegistrationResponse }` | `CompleteRegistrationService.execute` |
| `POST /api/v1/auth/registration/google` | [RegistrationController.registerWithGoogle](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/registration.controller.ts#L72) | `registerWithGoogleRequestSchema` | `{ data: RegistrationResponse }` | `RegisterWithGoogleService.execute` |
| `GET /api/v1/settings/security` | [SecurityController.read](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/security.controller.ts#L30) | Inline / no body; linked method | `{ data: SecuritySettingsResponse }` | `ChangeCredentialsService.read` |
| `POST /api/v1/settings/security/password` | [SecurityController.changePassword](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/security.controller.ts#L35) | `changePasswordRequestSchema` | `void` | `ChangeCredentialsService.changePassword` |
| `POST /api/v1/settings/security/pin` | [SecurityController.changePin](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/security.controller.ts#L43) | `changePinRequestSchema` | `void` | `ChangeCredentialsService.changePin` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-000-F01 | Password and PIN login — `LoginPreviewScreen.submit` | ADAPT | POST auth/login; auth/login/pin; GET me | Preserve phone/PIN validation and focus. Await real session before live routes; PIN alone never authorizes. | FND-02 |
| MOD-000-F02 | Signup, recovery and Google sign-in — `src/features/auth/` | EXTEND | auth/registration/*; auth/password/* | Recovery reuses exact OTP flow; phone verification and Google setup require D13. No demo OTP in production. | D13 |
| MOD-000-F03 | Transport, tenant switch, operation and decimal boundaries — `src/integration/ (PROPOSED)` | BUILD | Endpoint-specific envelopes | Use FOUNDATION signatures; do not overwrite unrelated layout/provider state. | FND-01/FND-03 |
| MOD-000-F04 | Navigation, search launch, calculator and design-system route — `src/components/layout/; src/pages/BrandGuide.tsx` | PRESERVE | Presentation only | Retain all links/shortcuts/theme controls; do not treat UI permissions as server authority. | No new UI |

## 5. Proposed architecture and unresolved approval

Use FOUNDATION.md. There is no production login in the pinned HisabIQ auth screen: submit clears secrets and opens a preview notice. The shell route guard must never change the current presentation. Frontend API gateway/deployment readiness is NOT VERIFIED.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D13.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [auth fields](../contracts/auth.md)
- [errors fields](../contracts/errors.md)
- [permissions fields](../contracts/permissions.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/foundation-auth.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/App.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/foundation-auth.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-foundation-auth.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-foundation-auth-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-000-T01: Password and PIN login

**State:** PLANNED — awaiting scoped approval. **Depends on:** foundation source baseline. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `LoginPreviewScreen.submit`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `POST auth/login; auth/login/pin; GET me`. **Gate:** FND-02.

**Algorithm / expected output:** Preserve phone/PIN validation and focus. Await real session before live routes; PIN alone never authorizes. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-foundation-auth.test.ts` case `MOD-000-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-000-T02: Signup, recovery and Google sign-in

**State:** BLOCKED — contract amendment required. **Depends on:** foundation source baseline. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `src/features/auth/`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `auth/registration/*; auth/password/*`. **Gate:** D13.

**Algorithm / expected output:** Recovery reuses exact OTP flow; phone verification and Google setup require D13. No demo OTP in production. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-foundation-auth.test.ts` case `MOD-000-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-000-T03: Transport, tenant switch, operation and decimal boundaries

**State:** BLOCKED — contract amendment required. **Depends on:** foundation source baseline. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `src/integration/ (PROPOSED)`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `Endpoint-specific envelopes`. **Gate:** FND-01/FND-03.

**Algorithm / expected output:** Use FOUNDATION signatures; do not overwrite unrelated layout/provider state. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-foundation-auth.test.ts` case `MOD-000-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-000-T04: Navigation, search launch, calculator and design-system route

**State:** PRESERVE — no new backend integration. **Depends on:** foundation source baseline. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `src/components/layout/; src/pages/BrandGuide.tsx`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `Presentation only`. **Gate:** No new UI.

**Algorithm / expected output:** Retain all links/shortcuts/theme controls; do not treat UI permissions as server authority. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-foundation-auth.test.ts` case `MOD-000-F04 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D13

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-000-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.

## Revision 3 bounded execution packet

[MOD-000-A](MOD-000-FOUNDATION_EXECUTION_SPEC.md) replaces generic planning tasks for the explicitly scoped integration foundation. Full signup/Google/recovery and persistent multi-device trust remain future increments; the whole broad module is not marked DONE.
