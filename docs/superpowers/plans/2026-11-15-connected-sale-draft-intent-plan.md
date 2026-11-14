# Connected Sales Draft write protocol and intent — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the existing POS V2 a validated, authenticated, session-bound, non-posting Sales Draft save/detail/versioned-update protocol ready for a later live cart adapter.

**Architecture:** Strict DTO/response transport uses the existing same-origin `requestJson` and GET-list validator. An immutable WeakMap handle binds the exact frozen cart JSON and ULID create key to one tenant/user/epoch/token, and requires explicit real source IDs before sending. The global connected route gate and preview POS remain unchanged.

**Tech Stack:** React 19, TypeScript, native Node `node --experimental-strip-types --test`, existing `src/integration/http.ts`, npm lockfile, source-pinned assisted Super Build.

**Spec:** `docs/superpowers/specs/2026-11-15-connected-sale-draft-intent-design.md`

## Global Constraints
- Base `hisabiq_ui/main@4a8c5bfc27aa18ebfbf52046d3ee63e70c938cad`, backend contract PR #221 at `7aa04ede86bb9e4b223b4e84b24cf1c5de78295d` (not merged as of writing).
- Only six named paths in issue #577; no modifications to `Pos.tsx`, `Sales.tsx`, `App.tsx`, `ConnectedWorkspaceGate`, preview data, auth setup or backend.
- No create or update without token, explicit safe payload and stable key/expectedVersion; no automatic retries, no DELETE, no posting or cached financial projections.
- Test failure is a blocker, not silent skip. Preserve old unmounted `readSaleDrafts` and its strict eight-key decoder.
- Code on GitHub branch, verify from detached isolated worktree with mandatory `prepare → install/build/typecheck/lint/boundaries → finalize` and real focused tests, then draft PR. Never merge.

## Review Focus
- In-flight user edits mutate original payload: serialized body/key must remain identical.
- Lost response and deliberate retry: same exact operation header/body, only one fetch per explicit call, no new ID.
- Foreign user, tenant or epoch: fail before request, even if a valid handle leaks.
- Nested cart contains demo product ID, getter, sparse array, NaN, unsafe key or cyclic value: reject before POST.
- Detail/update version, foreign response ID and invalid server timestamps: reject before any UI reconciliation.

---

### Task 1: strict GET detail, POST create and PUT versioned update

**Files:** Create `tests/integration-sale-draft-writes.test.ts`, then `src/integration/sale-draft-writes.ts`.

**Interfaces:** `saveSaleDraft(token,payload,operationId,signal?,timeoutMs?)`, `readSaleDraft(token,id,signal?,timeoutMs?)`, `updateSaleDraft(token,id,payloadWithExpectedVersion,signal?,timeoutMs?)`, `normalizeSaleDraftPayload(payload)`. Reuse `requestJson` and `decodeSaleDrafts`.

- [ ] Write RED tests for valid full cart round-trip, wire headers/paths/counts, nested JSON-clone immutability, invalid body, bad response, 409/offline, and timeout/no retry.
- [ ] Run `node --experimental-strip-types --test tests/integration-sale-draft-writes.test.ts`; verify failure due to missing exports.
- [ ] Implement strict DTO and server decoder, exactly one bounded-timeout `requestJson` call per invocation; code never reads preview stores.
- [ ] Rerun focused test GREEN, check all cases, commit.

### Task 2: memory-only session/source-verified create intent

**Files:** Create `tests/integration-sale-draft-intent.test.ts`, then `src/integration/sale-draft-intent.ts`.

**Interfaces:** `prepareSaleDraftCreate(session,payload,sources): PreparedSaleDraftCreate`, `submitPreparedSaleDraftCreate(session,handle,signal?,timeoutMs?)`, `ConnectedSaleDraftSources`. `SessionSnapshot` from `session.ts`.

- [ ] Write RED tests for stable random ULID and same request replay, identity+permission changes, source tenant/customer/product foreignness, missing schema, immutable payload, and no local/session storage.
- [ ] Run focused test RED due to missing implementation (not broken setup).
- [ ] Implement WeakMap immutable intent, crypto-only ULID generator and provenance validation, no retry or preview source access.
- [ ] Rerun focused and combined suites GREEN; commit.

### Task 3: verification and PR handoff

**Files:** No new product/UI paths. Maintain source pins + review notes in issue and PR.

- [ ] Confirm exactly six changed files, clean detached GitHub head, no test/preview fallback or source surprises.
- [ ] Run exact-head native unit tests and mandatory assisted Super Build install/build/typecheck/lint/boundaries/finalize, retaining truthful check outcomes and recovered retries.
- [ ] Record scenario-to-test matrix, code/CI exit, paired backend/frontend SHAs and unresolved actual UI activation; open draft PR under issue #577 for independent security/API review. No merge or deploy.
