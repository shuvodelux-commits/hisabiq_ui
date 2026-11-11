# MOD-022 — Data backup, account security, sessions and accounting periods

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000, MOD-001. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-022-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/settings/AccountSecuritySettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/AccountSecuritySettings.tsx#L1)
- [src/settings/DataSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DataSettings.tsx#L1)
- [src/settings/SettingsSqlBackup.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/SettingsSqlBackup.tsx#L1)
- [src/settings/magic/DataSettings.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/DataSettings.tsx#L1)
- [src/settings/magic/security/ActivityPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/ActivityPage.tsx#L1)
- [src/settings/magic/security/OfflinePage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L1)
- [src/settings/magic/security/PinConfirmDialog.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/PinConfirmDialog.tsx#L1)
- [src/settings/magic/security/RowActions.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/RowActions.tsx#L1)
- [src/settings/magic/security/SessionsPage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsPage.tsx#L1)
- [src/settings/magic/security/SessionsUi.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/SessionsUi.tsx#L1)
- [src/settings/magic/security/StatTile.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/StatTile.tsx#L1)
- [src/settings/magic/security/activityPreview.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/activityPreview.ts#L1)
- [src/settings/magic/security/offlinePreview.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/offlinePreview.ts#L1)
- [src/settings/magic/security/sessionPreview.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/sessionPreview.ts#L1)
- [src/settings/sqlBackup.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/sqlBackup.ts#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/backup/status` | [BackupController.status](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/backup/backup.controller.ts#L57) | Inline / no body; linked method | `{ data: BackupStatusResponse }` | `BackupService.status` |
| `POST /api/v1/backup/export` | [BackupController.export](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/backup/backup.controller.ts#L69) | `exportBackupRequestSchema` | `void` | `BackupService.exportNow` |
| `POST /api/v1/backup/inspect` | [BackupController.inspect](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/backup/backup.controller.ts#L83) | `inspectArchiveRequestSchema` | `{ data: ArchivePreviewResponse }` | `RestoreService.inspect` |
| `POST /api/v1/backup/restore` | [BackupController.restore](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/backup/backup.controller.ts#L101) | `restoreBackupRequestSchema` | `{ data: RestoreResultResponse }` | `RestoreService.restore` |
| `POST /api/v1/backup/reset` | [BackupController.reset](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/backup/backup.controller.ts#L120) | `resetBusinessRequestSchema` | `{ data: ResetResultResponse }` | `ResetBusinessService.reset` |
| `POST /api/v1/backup/secret` | [BackupController.replaceSecret](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/backup/backup.controller.ts#L140) | `replaceBackupSecretRequestSchema` | `{ data: { configured: true } }` | `BackupService.replaceSecret` |
| `POST /api/v1/license` | [LicenseController.install](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/backup/license.controller.ts#L43) | `licenseInstallRequestSchema` | `LicenseInstallResponse` | `LicenseInstallService.install` |
| `GET /api/v1/license` | [LicenseController.status](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/backup/license.controller.ts#L56) | Inline / no body; linked method | `LicenseStatusResponse` | `LicenseStatusService.status` |
| `GET /api/v1/license/notice` | [LicenseController.notice](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/backup/license.controller.ts#L68) | Inline / no body; linked method | `LicenseNotice` | `LicenseStatusService.notice` |
| `GET /api/v1/periods` | [PeriodsController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/periods/periods.controller.ts#L19) | Inline / no body; linked method | `PeriodListResponse` | `ManagePeriodsService.list` |
| `POST /api/v1/periods/close` | [PeriodsController.close](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/periods/periods.controller.ts#L24) | `closePeriodRequestSchema` | `{ data: PeriodResponse }` | `ManagePeriodsService.close` |
| `GET /api/v1/settings/security` | [SecurityController.read](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/security.controller.ts#L30) | Inline / no body; linked method | `{ data: SecuritySettingsResponse }` | `ChangeCredentialsService.read` |
| `POST /api/v1/settings/security/password` | [SecurityController.changePassword](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/security.controller.ts#L35) | `changePasswordRequestSchema` | `void` | `ChangeCredentialsService.changePassword` |
| `POST /api/v1/settings/security/pin` | [SecurityController.changePin](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/registration/security.controller.ts#L43) | `changePinRequestSchema` | `void` | `ChangeCredentialsService.changePin` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-022-F01 | Credential change and permitted security activity — `AccountSecuritySettings; security pages` | ADAPT | settings/security; password; pin; audit-events | Current-secret checks are server-owned; no secrets in audit or optimistic success. | Session-list/revoke parity NOT VERIFIED |
| MOD-022-F02 | Export, inspect, restore, reset and backup-secret rotation — `DataSettings; SettingsSqlBackup` | EXTEND | backup/status/export/inspect/restore/reset/secret | Backend archive format and SaaS deployment adapter must match; never execute frontend SQL export on a real shared DB. | D14 |
| MOD-022-F03 | Close accounting period — `Period setting entry NOT VERIFIED` | ADAPT | periods; periods/close | Closed period rejects mutations; backend has no period reopen route. Preserve UI and escalate unsupported reopen. | No existing UI entry assumed |

## 5. Proposed architecture and unresolved approval

Backup restore/reset are destructive operations not authorized here. Proposed tests must use entirely disposable tenant/database data, test corrupt and wrong-secret archives and require scope confirmation. A new period screen is not authorized by an endpoint inventory.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D13,D14.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [backup fields](../contracts/backup.md)
- [auth fields](../contracts/auth.md)
- [periods fields](../contracts/periods.md)
- [license-key fields](../contracts/license-key.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/backup-security-periods.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/settings/AccountSecuritySettings.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/settings/DataSettings.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/settings/SettingsSqlBackup.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/settings/magic/DataSettings.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/settings/sqlBackup.ts` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/backup-security-periods.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-backup-security-periods.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-backup-security-periods-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-022-T01: Credential change and permitted security activity

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `AccountSecuritySettings; security pages`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `settings/security; password; pin; audit-events`. **Gate:** Session-list/revoke parity NOT VERIFIED.

**Algorithm / expected output:** Current-secret checks are server-owned; no secrets in audit or optimistic success. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-backup-security-periods.test.ts` case `MOD-022-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-022-T02: Export, inspect, restore, reset and backup-secret rotation

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `DataSettings; SettingsSqlBackup`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `backup/status/export/inspect/restore/reset/secret`. **Gate:** D14.

**Algorithm / expected output:** Backend archive format and SaaS deployment adapter must match; never execute frontend SQL export on a real shared DB. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-backup-security-periods.test.ts` case `MOD-022-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-022-T03: Close accounting period

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Period setting entry NOT VERIFIED`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `periods; periods/close`. **Gate:** No existing UI entry assumed.

**Algorithm / expected output:** Closed period rejects mutations; backend has no period reopen route. Preserve UI and escalate unsupported reopen. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-backup-security-periods.test.ts` case `MOD-022-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D13,D14

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-022-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.
