# MOD-004 T10-R — Authenticated Party capability revocation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Immediately clear session-bound Party read data and in-flight responses when authenticated access capabilities change even if tenant/user/token/epoch stay constant.

**Architecture:** Preserve the existing `TradingPartyReadController` and Nest V2 transport. Extend only the existing `sameAuthentication` identity equivalence to check effective permissions, feature grants, and role name; keep React Party page and connected gate unchanged.

**Tech Stack:** React 18, TypeScript, Node 24 test runner, Nest V2 API (unchanged).

**Spec:** `docs/superpowers/specs/2026-11-14-mod004-react-nest-party-integration-design.md`; GitHub issue #571; D08 decision/Party scopes remain independent.

## Global Constraints

- Work in isolated GitHub branch/worktree; only `src/integration/party-read-controller.ts`, `tests/integration-party-read-controller.test.ts` and this plan.
- No Vue app, backend writes, schema/migration, runtime UI mounting, route/AppShell gate or local preview store mutation.
- Request remains fail-closed. Nest RLS/permissions remain the authorization authority, UI merely drops stale presentations.
- Run TDD RED then GREEN. Do not claim that a mock transport is a real PostgreSQL security test.
- Exact-head ChatGPT-assisted `/super-build` per `AGENTS.md`, with frozen offline npm verification, full Node tests, static/CI and independent review. Draft PR only.

## Review Focus

1. Same token and epoch but role permission removed: previously loaded Party data must vanish immediately, not merely on next request.
2. A pending HTTP call that ignores AbortSignal may not re-publish a Party after privileges change.
3. Equivalent permission/feature arrays reordered must not spuriously clear data.
4. A silent session update must still be detected when the promise settles.
5. Feature or roleName change must invalidate stale Party state without accidentally reusing preview data.

---

### Task 1: Reproduce missing capability invalidation

**Files**
- Modify: `tests/integration-party-read-controller.test.ts`

**Interfaces:** Existing `FakeSession.set`, `setSilently`, `reader()`, and `TradingPartyReadController`.

- [ ] **Step 1: Write failing tests.** Append cases named `capability revocation drops previously visible Party read data on same token`, `capability change aborts pending request even if transport ignores abort`, `silent permission change cannot publish late Party response`, `equivalent reordered capabilities remain stable while changed features and role invalidate`.
- [ ] **Step 2: Observe RED.** On isolated checkout of test-only GitHub commit, run `node --experimental-strip-types --test tests/integration-party-read-controller.test.ts`. Expected: new tests fail because sameAuthentication currently compares only `status, epoch, tenantId, userId, accessToken`. Existing tests stay green; capture exact exit and failures.
- [ ] **Step 3: Commit RED test source** with GitHub, preserving the failing SHA for audit.

### Task 2: Implement minimal equivalence and verify GREEN

**Files**
- Modify: `src/integration/party-read-controller.ts`

**Interfaces:** Extend private `sameAuthentication(expected: Authentication, actual: SessionSnapshot): actual is Authentication` and optional internal helper `sameStringSet`; public controller method signatures unchanged.

- [ ] **Step 1: Compare effective `permissions` and `features` as order-independent sets** plus `roleName`, while preserving all previous exact epoch/tenant/user/token checks. Do not retain any new session or Party caches.
- [ ] **Step 2: Observe GREEN.** Run `node --experimental-strip-types --test tests/integration-party-read-controller.test.ts`; expected all tests pass. If failure, debug source not weaken expected outcomes.
- [ ] **Step 3: Run full frontend `npm test` and local `tsc --noEmit`; expected exit 0.**
- [ ] **Step 4: Run full lint/UI-contract/Vite build; expected exit 0** and check no modified UI/route/product/backend files.
- [ ] **Step 5: Verify immutable GitHub head through approved ChatGPT-assisted Super Build `prepare → verify install/build/typecheck/lint/boundaries → finalize`.** Expected state `verified` and 5/5 latest checks passed.
- [ ] **Step 6: Open draft GitHub PR #571**, include RED→GREEN logs, tests, changed filenames, exact SHAs and limitations. Leave merge, deployment and React connected activation to separate approval.

## Review & handoff

Independent reviewer validates no feature regression or route mount, chosen capability semantics, auth/RLS boundaries and early/late invalidation. If no independent subagent is available, explicitly label author self-review and request human reviewer before merge.
