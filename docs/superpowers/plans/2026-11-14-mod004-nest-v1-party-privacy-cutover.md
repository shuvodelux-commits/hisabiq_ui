# MOD-004 SEC-N01 — NestJS Party V1 Privacy Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close direct NestJS V1 Party private-profile and global-history disclosure paths, without any legacy Vue implementation or financial posting changes.

**Architecture:** Keep HisabIQ React on strict V2 permission-projected Party reads. Add a **separately approved** privileged-response authorization gate to legacy V1 endpoints that return raw `PartyResponse`. Authorization lives inside existing Nest application service unit-of-work transactions, before lookup/replay/write, and never modifies the global journal-history deletion safeguard. If legacy clients would break, choose a deliberate Nest rollout/retirement strategy—never add a silent server bypass.

**Tech Stack:** NestJS, TypeScript, Zod, PostgreSQL16/Drizzle, Vitest/Supertest, HisabIQ React 18/Vite (integration contract only).

**Spec:** `docs/superpowers/specs/2026-11-14-mod004-react-nest-party-integration-design.md`, source audit [backend issue #245](https://github.com/shuvodelux-commits/nestshererp/issues/245), owner-approved D08 architectural direction and existing security issues #72/#93/#183.

## Global Constraints

- **Design/approval gate:** This document is **planning only**; do not implement tasks 2–5 before the owner explicitly accepts the V1 compatibility/privilege policy. Approval of architecture PR #569 does not automatically authorize breaking public V1 callers or changing grants.
- Backend implementation would target adoption branch `chore/hisabiq-adoption-runtime-a01`, **not** NestSherERP `main`; pin exact heads immediately before work.
- In scope: `apps/api/src/parties/parties.controller.ts`, `packages/core-application/src/parties/manage-parties-service.ts`, corresponding V1 API tests. In scope only where changed and approved; avoid schema, chart, grants, roles, report logic or journal edits.
- Exclude all `apps/web/**` Vue code, Vue migration, Vue browser tests, and React route activation. Examine old clients for compatibility impact without changing them.
- No privilege auto-grants to Manager/Cashier; existing Owner roles may also lack new grants. Plan rollout accordingly, no production data/migration.
- No post-mutation 403; require privileged disclosure **before** any writer side effect and before idempotency replay payload retrieval. Preserve idempotency fingerprint and source provenance.
- V2 selected role, withheld fields, role balance isolation and existing V1 role-checked ledger/opening routes retain their current correct policies.
- Every code PR must use test-first and **actual** `/super-build`, exact-head isolated signed PostgreSQL16 (non-superuser tenant RLS), Node20 pinned backend CI, independent security/accounting QA, and owner merge permission.

## Review Focus

1. A role-only viewer calls `/api/v1/parties?role=CUSTOMER` and must never receive NID or another relationship's journal-existence flag.
2. A user holding only one of `party.profile.view` and `party.history.global.view` must not receive the raw legacy DTO.
3. A role editor without both disclosure rights must not successfully write and then receive 403; preflight before mutation, audit/outbox and idempotency replay.
4. The delete guard still sees **party-wide** history and prevents deletion after journal posting; no misuse of selected-role statement/empty opening.
5. Breaking V1 callers may prevent live shop operations (including non-HisabIQ clients); safe rollout must be explicitly authorized and observed, not assumed.

---

### Task 1 — Capture contract / compat impact and gain owner approval

**Files:** No app code. Capture source manifest and ADR in this planning document / issue #245.

**Interfaces:** Raw `PartyResponse` in `packages/core-contracts/src/parties.ts`; V1 controller list/get/create/update/setStatus; V2 `PartyReadV2` list/get.

- [x] **Step 1: Map V1 raw response endpoints.** Source: `apps/api/src/parties/parties.controller.ts` exposes `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `POST /:id/status`. These return PartyResponse/PartyListResponse with NID, guardian, address, email, notes, `hasLedgerEntries`; V1 ledger/opening are distinct contracts.
- [x] **Step 2: Map checked source guarantees.** `ManagePartiesService.list/get` require selected trading role VIEW, but not both privacy grants. `create` checks role CREATE and replays stored raw response; `update` has P3A field-delta permissions; `setStatus` uses all affected-role DEACTIVATE. V2 separately projects explicit WITHHELD status.
- [ ] **Step 3: Quantify compatibility impact** from all deployed V1 Party consumers using GitHub code search + access logs where available, including legacy read/write consumers. Do not implement Vue.
- [ ] **Step 4: Choose rollout policy** (preferred: explicit dual-grant privileged V1 bridge with staged warning/deprecation, no auto-grants; alternatively hard disable V1 when safe). Owner approves actual client breakage handling, Owner permissions and rollout date.
- [ ] **Step 5: Pin paired branch-head SHAs and exact file allowlist**, obtain independent accounting/security sign-off.

### Task 2 — Test the raw V1 privilege boundary RED

**Files:**
- Create: `apps/api/test/parties-v1-private-response.spec.ts` (or enhance existing `apps/api/test/parties.spec.ts` if source-precedent requires the latter).
- Reference: `apps/api/test/support/database.ts`, `apps/api/test/support/auth.ts`.

**Interfaces:** Signed access token with role VIEW/action grant and either/both privacy grants. Real API `supertest` requests + disposable PostgreSQL16 non-owner tenant RLS.

- [ ] **Step 1: RED GET tests** `roleOnlyV1ListDenied`, `roleOnlyV1DetailDenied`, `partialPrivilegeV1Denied` (only profile, only global history), `fullPrivilegeV1Allowed` (role-view + both rights), `V2StillWithholds` (role-view without either).
- [ ] **Step 2: RED write tests** `unauthorizedCreateLeavesNoEntityOrIdempotency`, `unauthorizedUpdateLeavesVersionAndAuditUnchanged`, `unauthorizedSetStatusLeavesStateUnchanged`, `deniedReplayDoesNotEchoSensitiveBody`; replay with both granted succeeds once.
- [ ] **Step 3: RED security tests** `dualRoleOtherPostingNoHistoryLeak`, `crossTenantDenied`, `vendorFeatureOff`, `hiddenIdentityIndistinguishable`; use source-created ULIDs not fixture strings.
- [ ] **Step 4: Run tests in isolated disposable PG16**; expected known RED for privacy guards, save exact exit output/commit. A mocked 403 does not count.

### Task 3 — Implement the minimal Nest service gate GREEN

**Files:**
- Modify: `packages/core-application/src/parties/manage-parties-service.ts`.
- Adjust controller **only if justified** by explicit typed/validation behavior; do not make arbitrary DTO changes.

**Interface:** Internal helper `requireRawPartyResponsePrivileges(tx: Tx, ctx: TenantContext): Promise<void>`; no new public API.

- [ ] **Step 1: Add the helper** calling `accessControl.require(tx, ctx, Permission.PARTY_PROFILE_VIEW)` and `accessControl.require(tx, ctx, Permission.PARTY_HISTORY_GLOBAL_VIEW)`.
- [ ] **Step 2: Gate `list` and `get` V1** at earliest transaction boundary, before party lookup/row projection; leave V2 list/get paths unchanged. Do not insert the helper in shared `listFor` without passing an explicit version parameter, as that would accidentally deny V2.
- [ ] **Step 3: Gate `create`, `update`, `setStatus` V1** before idempotency read, Party lookup, DB mutation, audit/outbox. Do **not** put the same new gate in `createWithin` used by imports unless separate entry points actually return raw V1 payload and are in scope; imports need their own contract audit.
- [ ] **Step 4: Run RED suite again**; expected GREEN and no regression in role delta, field edit authorization, stale version, idempotency, opening journal or delete/history.
- [ ] **Step 5: Inspect all raw `toResponse` return paths** other than three known mutations and audit direct HTTP for unguarded echoes. If new paths exist, **stop and amend the scope**, do not declare security closed.

### Task 4 — Execute Super Build + full accounting/security acceptance

**Files:** Test-only changes already declared; no UI or Vue modifications.

- [ ] **Step 1: Real signed two-tenant PG16 test matrix** for all role/grant combinations; opening/ledger isolation and global deletion guard; no writes after 403.
- [ ] **Step 2: Frozen install + `pnpm --filter @sher/api build`, workspace `typecheck`, lint, boundaries, relevant unit/API suites** using exact repository scripts; capture actual exits. No reuse of development DB.
- [ ] **Step 3: Use verified ChatGPT-assisted Super Build `prepare → verify → finalize`** on exact GitHub head/allowlist, keep external receipt; report any skipped/unrun checks explicitly.
- [ ] **Step 4: Verify existing authorized V1 consumers' behavior against approved rollout** or document client breakage acceptance. This does **not** require implementing or testing Vue UI.
- [ ] **Step 5: Request independent Nest security/accounting review** and publish draft PR, with verified CI and explicit owner merge/deploy gate.

## Explicitly unresolved (not implicit implementation decisions)

- Whether to require dual grants for legacy V1 callers, retire V1 now, or introduce a time-bounded privileged compatibility route; all can break some existing clients.
- Whether/how existing Owner tenant roles should receive explicit privacy grants; **no automatic migration** included.
- Whether other V1 endpoints besides the five known PartyResponse-producing routes, especially import responses and exports, also return Party PII/history; inventory and amend before claiming privacy closure.
- If the future seven-role finance source APIs expose Party data, design their versioned permissions separately.
- Existing frontend draft PR #573 is independent and unmerged at the last live check, so this plan must not pretend it has reached `hisabiq_ui/main`.

**This issue produces a reviewed plan and source audit only; no code build, test pass, or server privacy closure is claimed.**
