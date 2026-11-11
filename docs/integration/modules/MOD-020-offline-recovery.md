# MOD-020 — Offline device authorization, synchronization, drafts and recycle bin

[Master rules](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md) · [Core workflows](../tasks/CORE_WORKFLOWS.md) · [Verification](../tasks/VERIFICATION.md)

## 1. Module identification

**Dependencies:** MOD-000, MOD-001, MOD-007, MOD-008, MOD-009. **Maturity:** frontend preview/partial candidates; backend varies per feature. **Source baseline:** frontend `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend `1643dac059e568407bba2fff38a990268dfe28fe`. **Status:** PLANNED, approval absent; blocked features explicitly marked.

## 2. Current frontend

[Source action/state census](../evidence/MOD-020-source-actions.md) identifies exact existing files and line anchors. It is a lexical inventory, not proof that every event has been traced. Source references below distinguish active pages from reusable/legacy components.

- [src/pages/RecycleBin.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/RecycleBin.tsx#L1)
- [src/recovery/adapters.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/adapters.ts#L1)
- [src/recovery/authority.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/authority.ts#L1)
- [src/recovery/copy.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/copy.ts#L1)
- [src/recovery/display.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/display.ts#L1)
- [src/recovery/model.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/model.ts#L1)
- [src/recovery/store.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/store.ts#L1)
- [src/recovery/useRecoveryContext.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/useRecoveryContext.ts#L1)
- [src/recovery/useRecoveryDelete.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/recovery/useRecoveryDelete.tsx#L1)
- [src/settings/DraftRecovery.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/DraftRecovery.tsx#L1)
- [src/settings/magic/security/OfflinePage.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/settings/magic/security/OfflinePage.tsx#L1)

## 3. Current backend

Existing controller declarations and exact service calls for this module:

| Method / route | Source | Request schema | Response | Service |
|---|---|---|---|---|
| `GET /api/v1/offline/status` | [DevicesController.status](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L52) | Inline / no body; linked method | `{ data: OfflineStatusResponse }` | `OfflineStatusService.status` |
| `GET /api/v1/offline/devices` | [DevicesController.list](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L60) | Inline / no body; linked method | `DeviceListResponse` | `ManageDevicesService.list` |
| `POST /api/v1/offline/devices/register` | [DevicesController.register](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L68) | `registerDeviceRequestSchema` | `{ data: DeviceResponse }` | `OfflineStatusService.register` |
| `POST /api/v1/offline/devices/request` | [DevicesController.request](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L85) | Inline / no body; linked method | `{ data: DeviceResponse }` | `OfflineStatusService.requestOfflineWrite` |
| `POST /api/v1/offline/devices/gate` | [DevicesController.gate](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L93) | `reportGateRequestSchema` | `{ data: DeviceResponse }` | `OfflineStatusService.reportGate` |
| `POST /api/v1/offline/devices/approve` | [DevicesController.approve](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L112) | `approveDeviceRequestSchema` | `{ data: DeviceResponse }` | `ManageDevicesService.approve` |
| `POST /api/v1/offline/devices/rename` | [DevicesController.rename](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L130) | `renameDeviceRequestSchema` | `{ data: DeviceResponse }` | `ManageDevicesService.rename` |
| `POST /api/v1/offline/devices/revoke` | [DevicesController.revoke](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L148) | `revokeDeviceRequestSchema` | `{ data: DeviceResponse }` | `ManageDevicesService.revoke` |
| `POST /api/v1/offline/devices/force-revoke` | [DevicesController.forceRevoke](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L166) | `forceRevokeDeviceRequestSchema` | `{ data: DeviceResponse }` | `ManageDevicesService.forceRevoke` |
| `POST /api/v1/offline/devices/replace-writer` | [DevicesController.replaceWriter](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L185) | `replaceWriterRequestSchema` | `{ data: DeviceResponse }` | `ManageDevicesService.replaceWriter` |
| `GET /api/v1/offline/snapshot` | [DevicesController.snapshot](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L213) | Inline / no body; linked method | `{ data: OfflineSnapshotResponse }` | `SnapshotService.build` |
| `POST /api/v1/offline/snapshot/report` | [DevicesController.reportSnapshot](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L229) | `reportSnapshotRequestSchema` | `{ data: DeviceResponse }` | `OfflineStatusService.reportSnapshot` |
| `GET /api/v1/offline/:id/offline-users` | [DevicesController.offlineUsers](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L256) | Inline / no body; linked method | `{ data: DeviceUsersResponse }` | `ManageDevicesService.offlineUsers` |
| `PUT /api/v1/offline/:id/offline-users` | [DevicesController.setOfflineUsers](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/devices/devices.controller.ts#L265) | `setDeviceUsersRequestSchema` | `{ data: DeviceUsersResponse }` | `ManageDevicesService.setOfflineUsers` |
| `POST /api/v1/sync/push` | [SyncController.push](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/sync/sync.controller.ts#L57) | `syncPushRequestSchema` | `SyncPushResponse` | `ReplayService.push` |
| `GET /api/v1/sync/pull` | [SyncController.pull](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/sync/sync.controller.ts#L67) | `syncPullQuerySchema` | `SyncPullResponse` | `SyncReadService.pull` |
| `GET /api/v1/sync/status` | [SyncController.status](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/sync/sync.controller.ts#L81) | Inline / no body; linked method | `SyncStatusResponse` | `SyncReadService.status` |
| `GET /api/v1/sync/conflicts` | [SyncController.conflictList](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/sync/sync.controller.ts#L86) | `syncConflictListQuerySchema` | `{ data: readonly SyncConflictResponse[] }` | `SyncReadService.conflicts` |
| `POST /api/v1/sync/conflicts/:id/resolve` | [SyncController.resolve](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/apps/api/src/sync/sync.controller.ts#L103) | `resolveSyncConflictRequestSchema` | `{ data: SyncConflictResponse }` | `ResolveConflictService.resolve` |

## 4. Feature parity matrix

| Feature ID | Existing interaction / symbol | Disposition | API or gap | Preservation / exact behavior | Gate |
|---|---|---|---|---|---|
| MOD-020-F01 | One authorized offline writer — `OfflinePage; offlinePreview` | ADAPT | offline/status; offline/devices/*; snapshot | Reuse DB unique active/draining capability rule; no second offline writer per tenant. | React offline runtime not yet traced |
| MOD-020-F02 | Replay pending operations and exceptional review — `Offline pending state` | ADAPT | sync/push; pull; status; conflicts | Use actual signed/snapshotted replay contract and shared services; ordinary labels Pending/Synced. | Full React OPFS adapter adoption incomplete |
| MOD-020-F03 | Recycle delete/restore and draft recovery — `recoveryStore; useRecoveryDelete` | EXTEND | No universal restore endpoint | Source-specific archive/draft recovery only. Never reverse a posted ledger by undeleting its projection. | D14 |

## 5. Proposed architecture and unresolved approval

Migration0041 enforces one writer while ACTIVE or DRAINING. Existing adapter-sqlite-wasm does not mean React is connected to it. Preserve current local drafts; do not enqueue arbitrary network requests with stale credentials. Conflicts require typed source resolution, not last-write-wins balances.

No architecture in this packet is falsely labelled owner-approved. Owner decision references: D14.

## 6. API contract catalogue

The table in §3 is normative for existing transport shapes. Exact Zod fields/defaults are indexed below; read inherited schemas at the pinned source. Inline query/body validation in controllers is part of the contract. [UI field map](../contracts/UI_FIELD_MAPPING.md) states conversions and unsupported fields. FND-01 defines error envelope, abort handling and no-fallback behavior. This packet proposes no unspecified new HTTP endpoint. BUILD/EXTEND items without a complete contract are **BLOCKED**, not permission to invent one.

- [devices fields](../contracts/devices.md)
- [sync fields](../contracts/sync.md)

## 7. Database integration

Reuse source-owned repositories listed in the [database/service evidence](../evidence/SERVICE_INDEX.md) and [schema/migrations](../evidence/DATABASE_INDEX.md). Confirm the service method’s actual repository calls, tenant predicates, locking, audit and outbox before enabling writes. One UOW per business mutation; no independent React balance/stock writes. Class T operations preserve journal/stock/source idempotency; Class M/S do not invent accounting effects. **Runtime isolation/concurrency is NOT VERIFIED.** New schema required by blocked fields must be separately approved and reserved; no migration is allowed from this packet yet.

## 8. Frontend integration instructions

Use FND transport and a typed resource adapter (proposed owner file `src/integration/offline-recovery.ts`; use more specific existing name from CORE_WORKFLOWS if provided there). Modify only the handlers named in §4 after approved field mapping; preserve markup, current state initialization in preview, dialogs and keyboard handlers. Live read/mutation results go to a tenant/user/session-epoch-scoped cache. Successful POST updates from the actual response and invalidates related reads. Failed/unknown POST retains the entire draft and operation ID. No component may silently call a preview mutation after a server error.

## 9. Backend implementation instructions

For REUSE/ADAPT actions, do not add a new controller/service merely to fit UI names. Use the §3 application method and its domain function, existing errors and repository. Check its permission calls, version/idempotency path and transaction before treating it as sufficient. For EXTEND/BUILD actions, implement **only after** the linked decision has a complete typed request/response, source algorithm, storage and negative/concurrency test amendment. Unlisted business behavior is NOT VERIFIED.

## 10. File-by-file change manifest

| Path | Operation | Responsibility |
|---|---|---|
| `src/pages/RecycleBin.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/settings/DraftRecovery.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/settings/magic/security/OfflinePage.tsx` | INSPECT; MODIFY only after task allowlist | Existing surface/handler; keep presentation |
| `src/integration/offline-recovery.ts` | CREATE, PROPOSED | Resource transport/mapping; FND dependency |
| `tests/integration-offline-recovery.test.ts` | CREATE, PROPOSED | Mapping/async failure tests |
| `scripts/integration-offline-recovery-browser.cjs` | CREATE, PROPOSED | Existing UI against test API |
| Backend files linked in §3 | REUSE unless amendment specifies MODIFY | No implicit backend write allowance |

The census is a read scope, **not an allowed-write glob**. Exact child paths for blocked tasks are unassigned; those tasks fail the build-readiness gate. Coordinator reserves shared files before any task.

## 11. Ordered atomic tasks

### MOD-020-T01: One authorized offline writer

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001, MOD-007, MOD-008, MOD-009. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `OfflinePage; offlinePreview`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `offline/status; offline/devices/*; snapshot`. **Gate:** React offline runtime not yet traced.

**Algorithm / expected output:** Reuse DB unique active/draining capability rule; no second offline writer per tenant. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-offline-recovery.test.ts` case `MOD-020-F01 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-020-T02: Replay pending operations and exceptional review

**State:** PLANNED — awaiting scoped approval. **Depends on:** MOD-000, MOD-001, MOD-007, MOD-008, MOD-009. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `Offline pending state`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `sync/push; pull; status; conflicts`. **Gate:** Full React OPFS adapter adoption incomplete.

**Algorithm / expected output:** Use actual signed/snapshotted replay contract and shared services; ordinary labels Pending/Synced. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-offline-recovery.test.ts` case `MOD-020-F02 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

**Sequence:** write the approved failing behavior test → run focused test against disposable data → modify only named handler/adapter/service → rerun focused test → check unchanged UI behaviors → draft PR with source SHA and real evidence. If the behavior/contract is unresolved, stop at planning amendment, not at stub code. **Recovery:** revert the task’s code commit before rollout; any posted financial effect must be reversed by its owning service, never by database deletion.
### MOD-020-T03: Recycle delete/restore and draft recovery

**State:** BLOCKED — contract amendment required. **Depends on:** MOD-000, MOD-001, MOD-007, MOD-008, MOD-009. **Issue:** UNASSIGNED; do not create a fictitious number. **Required source:** §2/§3 and `recoveryStore; useRecoveryDelete`. **Allowed writes:** no writes until coordinator records exact subset from §10. **Contract:** `No universal restore endpoint`. **Gate:** D14.

**Algorithm / expected output:** Source-specific archive/draft recovery only. Never reverse a posted ledger by undeleting its projection. Apply the corresponding detailed workflow in CORE_WORKFLOWS or FOUNDATION where referenced. Otherwise this is an inventory task requiring a specification amendment before code; it is not an executable task disguised as complete.

**Tests before code:** `tests/integration-offline-recovery.test.ts` case `MOD-020-F03 preserves draft on failure`; exact positive/negative accounting assertions from the detailed workflow or approved amendment. Live browser case uses existing route and control selectors from source; no replacement screen. Fixture tenant A and B with distinct actual ULIDs; no fixture string ID submitted to the server.

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

D14

Refer to [DECISIONS](../DECISIONS.md) and [REVIEW](../REVIEW.md). Missing active UI-to-service-to-table trace is a specification blocker. Do not infer it from a filename. No migration or external provider is activated.

## 17. Super Build execution contract

Issue UNASSIGNED except existing cash work explicitly recorded in GitHub snapshot. Owner session UNRESERVED. Branch proposed `integration/mod-020-<task>` from current approved baseline; actual base SHA and allowed paths recorded at dispatch. Coordinator owns shared types/contracts/schema/migrations and verifies capacity=1. A GitHub-only chat cannot claim shell/browser execution; hand off to a named runner. Draft PR, exact test/command outputs and independent QA required. Human merges only. See [execution prompt](../tasks/EXECUTION.md).

## 18. Completion status

**PLANNED / PARTIALLY BLOCKED.** NOT STARTED, NOT APPROVED, NOT BUILDING, NOT QA-PASSED, NOT DONE. For an entirely unsupported module, BLOCKED until full contracts and owner decisions exist.
