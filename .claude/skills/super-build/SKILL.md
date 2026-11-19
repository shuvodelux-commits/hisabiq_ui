---
name: super-build
description: Safely execute one explicitly authorized HisabIQ GitHub Project #2 issue using native Codex GPT-6.1-Sol Medium, a clean source-pinned worktree, TDD and a human-approved draft PR.
---

# HisabIQ: single-issue native Codex Super Build

**Scope:** HisabIQ frontend repository `shuvodelux-commits/hisabiq_ui`. This is a
small Codex-native builder integration, **not** the vendored legacy standalone
board dispatcher. Never enumerate or dispatch all Ready cards. Never replace
existing Magic Patterns React components or financial behavior.

## Mandatory preflight

1. Read current `AGENTS.md`, the assigned issue, all issue comments and the
   exact frontend/back-end sources. Confirm scope/approval and classify
   REUSE / ADAPT / EXTEND / BLOCK in the issue before writing code.
2. Read **live GitHub Project #2** and verify that the single requested card
   is an open Issue in the correct repository, in **Ready**, with no duplicate
   worker, `loop:in-progress`, halted or human-gated label. A **Blocked** card
   is a STOP, even if a supplied JSON copy claims Ready.
3. Check `df -h /`, active workers, clean worktrees, full SHAs, exact origin
   and the accepted backend source/QA pin. Reuse safe existing test resources;
   stop rather than multiply checkouts when disk is below the agreed threshold.
4. Use `.claude/super-board/configs/hisabiq-ui-mod001.json` (Project #2,
   frontend `main`, one worker, human merge). The source-pinned vendor
   helper references in `.claude/bin` are required; do not fetch
   unreviewed remote scripts dynamically.
5. Use **only** the verified NestSherERP native Codex single-card guard and
   build lane, not an older global standalone skill. It requires explicit
   `gpt-6.1-sol` and `model_reasoning_effort=medium` in the actual
   `codex exec` arguments. Confirm that guard/lane code and CLI match the
   audited adoption-source files before running.
6. For **--only 548**, preserve accepted immutable Nest QA pin
   `57585270eda42f89748bbd01b134a5e1ed805f6b` until separately reviewed.
   Invoke the backend-owned guard with `--only 548`, exact
   `--frontend-sha`, `--backend-sha`, `--backend-runtime-root`,
   `--repo-root`, and `--config`
   arguments. Do not substitute latest adoption HEAD, backend main, or a
   different local checkout for its required source pair.
7. Fail closed if the guard, vendor helper, lock, login, role, source pin,
   runner, live board or real worker access is absent. Do not forge an
   authorization or waive a required test to complete a ticket.

## Build and verification

- One issue, one branch, one worker; tests-first RED → GREEN → refactor.
- Keep source changes within the exact reviewed issue file allowlist. For
  #548 this is **test-only** Invoice Studio logo acceptance; do not edit
  React UI, backend, finance, auth, migrations or global feature flags.
- Full TypeScript, ESLint, UI contract, unit, build and relevant Playwright
  checks are mandatory. Real two-tenant React→Nest→disposable PostgreSQL16
  checks must be executed and recorded for any claim of live logo acceptance.
- The backend remains **read-only** to this frontend tooling/QA task; do not edit its services, schemas, migrations or deployment settings.
- Production `VITE_CONNECTED_INVOICE_LOGO_WRITES` remains OFF. A test-scoped
  override cannot authorize a production setting change.
- Record actual commands, exit codes, exact frontend/backend SHAs, CI links,
  negative cases and unresolved gates. Mocks are not signed API/PG16 evidence.
- Submit a **draft PR** for independent Super QA and Super Review. **No merge**,
  deployment, backend edits or Project Done transition without explicit owner
  approval. Never represent a partial/preflight run as a successful build.
