# Mandatory Super Build and scenario-testing policy

Owner decision: **2026-11-13**, applies to **all newly implemented or changed functionality** in `shuvodelux-commits/hisabiq_ui` (React) and `shuvodelux-commits/nestshererp` (NestJS/legacy Vue), including integration, security fixes, financial systems, and regressions.

**Priority:** This is the owner's explicit authorization to **write and run automated tests for every affected functionality and scenario**. It supersedes older NestSherERP `AGENTS.md` / `AI_CODING_INSTRUCTIONS.md` clauses saying “never write test files” or “never run test suites”, plus any narrower legacy module-test limitation. Preserve all existing security, accounting, role/tenant, UI and human-merge constraints. Never treat this permission to test as permission to run destructive commands on real data.

## 1. Mandatory build workflow — `/super-build`

1. **Plan and approve:** Read current `AGENTS.md`, canonical module packet, exact GitHub source, open PRs, dependencies, permissions and current owner decisions. Compare frontend/back end and classify REUSE / ADAPT / EXTEND / BLOCKED in the required 10–15 sentence overview. Owner approval controls the *implementation scope*, not the test obligation.
2. **Curate one issue:** Every changed behavior must be attached to a scoped GitHub issue/Ready card with acceptance criteria, explicit scenario matrix, evidence requirements, allowed files, exact source/base SHAs, owner/executor and isolated worktree/database reservations. Never commandeer another agent's worktree, changes or migration allocation.
3. **Load and follow the installed Builder skill:** Canonical installed NestSherERP skill is `.agents/skills/super-build/SKILL.md`; use its **Ready → Building → QA**, test-first, simplest-safe-solution and draft-PR procedures. In a supported native Super Board host, execute the actual Builder lane/`/super-build --only N` or the configured `/super-board` workflow. Do **not** confuse Super Build with a generic implementation prompt.
4. **ChatGPT host limitation:** ChatGPT cannot invoke the native Claude/Codex slash command or headless dispatcher. In the owner's approved ChatGPT + GitHub + Remote Desktop Commander environment, **read the actual skill and follow its process** using the merged ChatGPT-assisted launcher `.agents/bin/super-build-chatgpt.py` (`prepare → verify → finalize`), which was delivered by backend PR #35, wherever its reviewed preconditions are satisfied. Author tests and source on GitHub first, verify an **exact, clean commit** using the authorized remote computer, then open a draft PR. The adapter checks only fixed build/typecheck/lint/boundary presets; PostgreSQL, browser, and full-suite tests run **separately** in isolated environments. Never claim that the native slash command ran when only the assisted process ran. If the required runner/skill or verification is unavailable, report **BLOCKED** instead of marking work verified.
5. **Independent QA and review:** Run the `/super-qa` test-gap and adversarial workflow (or independently execute its actual checklist where native invocation is unavailable), then `/super-review` for security, specs and accounting, including rerunning the recorded tests. A passing Builder job alone is **not** QA completion. Super Build itself **never merges**; use the current human-authorized merge gate and exact-head checks.

## 2. Write a test for **every affected functionality and every applicable scenario**

Before coding, inventory **every user action, state transition, API operation, data write, emitted side effect and contract field** touched by the ticket. Build a table with **one explicit scenario per row**. Required columns:

| ID | Function / path / action | Actor + permission | Tenant + state / feature flags | Inputs + boundary / failure condition | Expected response + durable side effects | Automated test file + case | Run SHA + result |
|---|---|---|---|---|---|---|---|

For each behavior, enumerate and cover all relevant partitions; don't assume a happy-path test represents the whole function:

- **Core paths:** create, read/list/detail, update, deactivate/reactivate, delete, search/filter/sort/pagination, print/export, confirm/cancel, undo/correction, retries, drafts and error states.
- **Validation and bounds:** normal, empty/null/undefined, missing/invalid, whitespace and Bangla/English, duplicates, min/max and just-outside-limit, rounding/precision, stale version, nonexistent records and malformed identifiers.
- **Authorization/privacy:** owner/admin/cashier/custom roles with allowed/forbidden actions, revoked grants, direct URL/API probes, **tenant A vs tenant B**, dual-role Parties, fields hidden by policy, mutation responses, bulk/import, replay, export and error-side-channel protection.
- **Settings and state:** each relevant feature ON/OFF, enabled/disabled, active/inactive, open/closed/locked, selected/unselected, populated/empty, positive/negative/zero balances, previous-period data and historical compatibility.
- **Financial and inventory invariants:** source document linkage, exact integer poisha arithmetic, balanced double-entry postings, posting once, partial/split payments, cash-session ON/OFF and required active drawer, **historical openings without a cash session**, reversal/correction without rewriting posted history, negative/shortage stock, multi-unit conversion, tax/discount/whole-taka rounding and tenant/role account separation **as applicable to the changed flow**.
- **Concurrency and resilience:** duplicate clicks, idempotency replay and changed-payload replay, concurrent edits, competing writes, retries after network interruption, rollback/no partial posting, outbox/audit consistency, migration/rollback safety and crash recovery when relevant.
- **UI and integration:** each visible button/menu/modal/filter/keyboard focus path, desktop and small mobile, mouse/touch/keyboard, accessibility, light/dark, English/Bangla, loading/empty/error states, frontend↔backend DTO decoding, regression against existing Magic Patterns/HisabIQ compact UI and no fake posting effects.
- **Offline only where supported:** one authorized offline POS device, local Pending/Synced/Needs Review transitions, repeat submission, server-side conflict and reconnect/retry without double journals.

**“Every scenario” means every documented, identified, reachable and materially relevant input/state/role partition for the approved behavior, with explicitly reviewed combinatorial coverage for high-risk interactions.** It does not mean asserting an impossible proof over infinitely many potential states. Enumerate pairwise combinations for low-risk dimensions; test all high-risk combinations where permissions, money, tenant isolation or data loss interact. An untested applicable case is **OPEN/BLOCKED**, never silently omitted or labeled “passed”. Non-applicable rows need a short reason, not a guessed pass.

## 3. Test-first, run all necessary levels, and verify exact evidence

1. **RED:** write focused failing test(s) demonstrating the missing behavior or bug; record what failed and why. Do not weaken existing assertions, remove fields, skip cases, suppress failures or change expected accounting outcomes merely to make a build green.
2. **GREEN:** implement the smallest safe production change consistent with approved UX, security and accounting invariants. Preserve frontend UI, routes, existing features and source histories.
3. **REFACTOR:** run targeted tests, affected module suite, then broader repository regression suites and static gates (`build`, `typecheck`, `lint`, `test:boundaries`, applicable contract checks), on the **exact PR HEAD**.
4. **Database and API:** use only disposable, isolated PostgreSQL 16 test databases/containers and proper signed API requests. Exercise real tenant RLS, errors, concurrent/idempotent posting and persisted journal/stock effects. Protect dev/prod data; do not reuse another module's mutable test DB. Reuse a verified clean task-specific test workspace where safe to avoid disk exhaustion.
5. **Frontend E2E:** for any changed reachable UI behavior run Playwright against real mocked/isolated integration as specified, including keyboard/touch and narrow viewport, bilingual labels and before/after screenshots when visually changed. Passing tests for an **unmounted** UI integration client do not prove a live screen works.
6. **Cross-repo:** pin both frontend and backend commit SHAs and verify all affected decoders/API contracts and real flows. Do not claim compatibility based only on TypeScript types.
7. **Test completion:** independent QA inspects the scenario inventory against source and diff, finds missing branches and adds negative/regression cases. Security reviewer checks disclosure/write paths; accounting reviewer verifies invariants and no source-free or double posting.

## 4. Hard acceptance / merge gates

A draft PR must include:
- Linked issue, owner approval, exact branch/head/base SHAs, allowed files and owner of any shared contract or migration.
- Scenario matrix **covering each affected functionality/action**, with test IDs and actual command, exact tested SHA, environment, exit code, results, skipped cases and logs/screenshots where needed.
- Separate evidence for automated unit, integration/API, PostgreSQL16, E2E, tenant/RLS, security/permission and financial/inventory cases **when applicable**, plus existing regressions and why any category is not applicable.
- Explicit defects/gaps: **FAILED**, **SKIPPED**, **NOT RUN**, **NOT APPLICABLE** (reason), **BLOCKED**; never count skipped as passed. No fabricated result, invented coverage percentage or “all scenarios pass” assertion without traceable cases.
- Independent Super QA test-gap pass, Super Review pass, current-head GitHub CI pass and explicit owner merge instruction. Changes after review void stale evidence and require revalidation.

**No merge, production deployment, migration or activation** solely from a Builder completion, a draft PR, a local focused test or this governance policy. If test infrastructure cannot run an applicable critical scenario, **hold the release** and record the missing check. Document-only changes with no runtime behavior need factual doc/link validation but do not require fictional application tests.

## 5. Required handoff language

Report **implemented**, **tests authored**, **tests actually executed**, **pass/fail/skipped counts**, **remaining scenarios**, and **merge/deploy state** separately. “Tested” always names a command, actual output and exact Git SHA. When an automated test is technically unavailable, describe it as not run rather than implying a pass.

For the currently open Party security T09C work, apply this policy first to [backend issue #98](https://github.com/shuvodelux-commits/nestshererp/issues/98) / [draft PR #99](https://github.com/shuvodelux-commits/nestshererp/pull/99). It is a **bounded regression test**, not authorization to change unresolved Party profile/permission policy from [issue #93](https://github.com/shuvodelux-commits/nestshererp/issues/93). Keep the party-global posted-history delete guard intact.
