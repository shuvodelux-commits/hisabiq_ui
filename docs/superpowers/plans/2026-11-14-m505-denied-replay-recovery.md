# M5-05 denied-replay recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent a denied confirmation from discarding an original cash operation that could already have committed after a lost HTTP acknowledgement.

**Architecture:** Preserve an ambiguity bit alongside the existing tenant/epoch-scoped pending ULID, body/sender and fingerprint in CashSessionProvider. Classify definite first-refusals separately from ambiguous or repeatedly denied requests, never silently replay or create a new financial intent. Keep the UI unchanged.

**Tech Stack:** React + TypeScript, existing `ApiError`, Node 24 test runner, existing Vite/Playwright mounted-provider harness and a disposable Nest/PostgreSQL16 when resources permit.

**Spec:** `docs/superpowers/specs/2026-11-14-m505-denied-replay-recovery-design.md` and GitHub issue #557.

## Global Constraints

- Source base must match `shuvodelux-commits/hisabiq_ui@6aa089ef8a0748bf140ae35ae537b42da3fca22c`; re-evaluate if `main` advances.
- Change only the existing cash-session provider, focused tests and test-only harness; preserve UI, bilingual components, business behavior, ledger and API contracts.
- Original operation ULID, sender and fingerprint are immutable across an uncertain retry. No network replay without a user action.
- A first definitive 4xx may clear a pending operation; a 4xx after an ambiguous outcome must NOT clear it.
- Never use an existing development database or another worker's test port. Remain draft/unmerged pending independent accounting/security and full backend negative acceptance.
- Use true TDD, existing source's test runner, exact-head ChatGPT-assisted Super Build 5/5, CI evidence and an explicit QA matrix.

## Review Focus
- Access-token refresh midway through an inflight request: stale async result must not unblock another operation.
- An original request committed but its confirmation gets HTTP 401/403: retain ULID and prohibit Close/new intent until genuine acknowledgement.
- First-attempt definitive 401/403 before any ambiguous send: no indefinite lock; no cash/ledger posting.
- Same ULID returns 409 after uncertainty: retain original key and require operator reconciliation rather than force a new key.
- Different trusted tenant/user/epoch, Cash Session OFF and hard reload: never replay other identity; clearly mark unresolved reconciliation in release gate.

---

### Task 1: Reproduce and specify ambiguity transitions

**Files:**
- Create: `src/contexts/cashPendingFailure.ts`
- Create: `tests/mod005CashDeniedReplay.test.ts`
- Modify: `src/contexts/CashSessionContext.tsx` (only after RED)

**Interfaces:**
- Produces: `shouldClearPendingCashAfterFailure(caught: unknown, alreadyUncertain: boolean): boolean` and `isDefinitiveCashRefusal(caught: unknown): boolean`.

- [ ] **Step 1: Write tests first.** Assert after network uncertainty then 401/403/409/400/404/422 the pending must be retained; first definitive rejection clears; first network/5xx does not clear. Tests invoke actual exported classification behavior, not source-text grep.
- [ ] **Step 2: RED.** Run `node --experimental-strip-types --test tests/mod005CashDeniedReplay.test.ts`. Expected: fails because new classifier does not exist.
- [ ] **Step 3: Implement small classifier only.** Use the existing real `ApiError` type; do not change production catch yet.
- [ ] **Step 4: GREEN.** Same test command expected exit 0.
- [ ] **Step 5: Commit only when integrated below and full source verification passes.**

### Task 2: Integrate into the real provider

**Files:**
- Modify: `src/contexts/CashSessionContext.tsx`
- Test: `tests/mod005CashDeniedReplay.test.ts` and `tests/mod005CashP0Safety.test.ts`

**Interfaces:**
- Consumes: Task 1 helper and the existing `PendingOperation {identity,fingerprint,id,send}`.
- Produces: same API plus `uncertain:boolean` retained across attempts for same trusted identity.

- [ ] **Step 1: RED integration contract.** Add assertions to focused tests for frozen original sender and preserved uncertainty when prior token snapshot becomes stale. Run tests and observe expected failure.
- [ ] **Step 2: Minimal provider change.** Allocate pending only once for an original intent, preserve captured sender/id, mark uncertainty on a non-definitive/stale request result, preserve ambiguous intent on later HTTP denial, clear only after genuine acknowledgement/first definitive denial. Preserve existing identity abort behavior.
- [ ] **Step 3: GREEN.** Run focused tests; expected exit 0 and no regressions.
- [ ] **Step 4: Verify connected/preview behavior is unchanged for unrelated actions.**

### Task 3: Mounted React denial proof + review handoff

**Files:**
- Optionally add narrow test-only browser case to `tests/mod005CashP0RuntimeHarness.tsx` and a new `scripts/mod005-denied-replay-browser.cjs` if a safe runner exists.
- Existing targeted suites and Super Build receipt are independent proofs, not replacements for real Nest/Postgres.

- [ ] **Step 1: Execute mounted-provider actual React test for 401/403 after a simulated lost ACK, including token refresh, original-ID confirmation, different-intent denial, 390px and desktop. Label controlled-HTTP tests truthfully.**
- [ ] **Step 2: Run `node --experimental-strip-types --test tests/mod005CashDeniedReplay.test.ts tests/mod005CashP0Safety.test.ts tests/cashSessionConnectedContext.test.ts tests/mod005LostAckProxy.test.ts`, `npm run check:ui-contract`, full `npm run build`, TypeScript and lint with explicit exit codes.**
- [ ] **Step 3: Commit to exclusive issue branch, push source, execute exact-head `.agents/bin/super-build-chatgpt.py prepare→verify→finalize` (five checks), and create a draft PR, not merge.**
- [ ] **Step 4: Annotate issue #557 and release gate #405 with each executed and unexecuted negative case. Real PG16/RLS and hard reload remain NOT VERIFIED if unavailable.**

**Execution method:** ChatGPT inline, issue #557, owner's already established GitHub + authorized Remote Desktop Commander workflow. No native headless Codex/Claude dispatcher.
