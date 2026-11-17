# Settings Migration Inventory and PR #274 Review — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a verified, exhaustive legacy-to-new Settings control inventory and an evidence-backed acceptance/blocker review of PR #274, without changing product behavior.

**Architecture:** The existing typed `settingsFields` catalogue is the canonical source for ordinary business fields; the historical specialized Settings components are the second source for specialized workflows. Store the audit as a human-readable Markdown matrix with verifiable canonical IDs. A narrow Node test checks inventory coverage and provenance; the PR review inspects producer → stored value → actual consumer separately, so a displayed or saved switch is not mistakenly called enforced.

**Tech Stack:** GitHub-only workflow; React/TypeScript repository, Node 24+, Node built-in test runner, pnpm and existing Playwright / GitHub Actions checks. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-09-settings-functional-migration-design.md` (approved design in draft [PR #275](https://github.com/shuvodelux-commits/hisabiq_ui/pull/275)).

## Global Constraints

- One task/PR at a time. No product-source edits, backend changes, PR merges, schema migrations, invoice data edits, or UX redesign in this audit task.
- Preserve compact Magic Patterns Settings UI, canonical `TenantSettingsProvider` and existing business settings keys.
- Reference three distinct states: legacy before #272 at `c27f6d724148eab3396af2c446932e736ccdb7f3`, `main` at the time of execution, and PR #274 at its actual reviewed head SHA (do not assume the old SHA remains current).
- At plan creation, #274 was draft/open at `053f2ceb29fff556eed06461575dc9cbb650e92c` and #275 was draft/open at `539bd87e677c5089341fc0d4748b56932e412e61`. Recheck, do not quietly overwrite or merge either branch.
- Existing `src/settings/fields.ts` contains **60 ordinary business field descriptors** across `business`, `sales`, `products`, `purchases`, `money`, `invoices`, `notifications`. Recalculate if source changes; changes require explicit evidence, not a silently corrected count.
- Record five separate statuses per control: `displayed`, `editable`, `persistent`, `consumed`, `enforced`. Allowed values: `yes`, `no`, `partial`, `unverified`, `n/a`. Treat production authorization as unimplemented unless a real server-side check exists.
- Status provenance must say whether evidence came from source reading, existing automated test, or an actually executed browser test. Green CI does not automatically prove domain behavior.
- The UI-only settings provider saves for demo business `t1` in local browser storage; it is not authenticated multi-tenant persistence.
- No monospaced numbers, no design changes, no duplicate Settings stores or new settings framework.

## Files and Ownership

| File | Change | Responsibility |
| --- | --- | --- |
| `docs/settings/functional-migration-matrix.md` | Create | Primary auditable ordinary + specialized control matrix, consumer evidence and priority |
| `tests/settingsMigrationMatrix.test.ts` | Create | Contract guard for catalogue coverage, unique IDs, mandatory evidence and valid status values |
| `docs/settings/pr274-functional-readiness-review.md` | Create | Two-axis review: standards/architecture vs. original user-requested functional completeness; severity + exact code/test evidence |
| `src/settings/fields.ts`, `src/settings/model.ts`, `src/settings/TenantSettingsProvider.tsx` | Read only | Existing keys, validation, persistence and permissions |
| `src/settings/TenantSettingsPage.tsx`, `src/settings/ModuleSettingsEntry.tsx`, `src/settings/magic/*` | Read only | Main/new UI routing and PR #274 adapter surfaces |
| `scripts/settings-magic-browser.cjs`, `scripts/auth-settings-browser.cjs`, `tests/tenantSettings.test.ts` | Read only | Existing verified assertions, not inferred guarantees |

Historical specialists to inspect: `TeamSettings.tsx`, `EmployeeDirectory.tsx`, `DataSettings.tsx`, `SettingsSqlBackup.tsx`, `SettingsActivity.tsx`, `DraftRecovery.tsx`, `DocumentDesignSettings.tsx`, `OutputDesignSettings.tsx`, `FinancialTerminologySettings.tsx`, `CommerceSettingsPanels.tsx`, `InterfaceSettings.tsx` and `AccountSecuritySettings.tsx`.

## Review Focus

Five cases likely to mislead a shop user or regress on migration; Task 1 tests/review must explicitly trace each:

1. **Phone hidden with credit due:** optional Phone visibility may be off, but customer identification required for a new credit sale must remain available; trace `CheckoutPanel` and POS submit checks.
2. **Settings changed in another browser tab:** the revision guard must reject stale writes and retain a useful draft; trace `LiveSettingsSection` and `TenantSettingsProvider`.
3. **Invoice reset/defaults:** resetting visible invoice options must not erase nested numbering, invoice designs or ledger/report profiles; trace adapter and legacy design handlers.
4. **Data recovery claims:** `Settings backup` is not an ERP database backup; Magic Data/Staff Activity and Sessions may still use synthetic data; label these separately.
5. **Permissions and unsaved navigation:** a visual permission toggle does not create real authorization; embedded old editors and new Magic navigation must not silently discard pending edits.

---

## Task 1: Produce the audit matrix, automated coverage guard and PR #274 findings

**Files:**
- Create: `docs/settings/functional-migration-matrix.md`
- Create: `tests/settingsMigrationMatrix.test.ts`
- Create: `docs/settings/pr274-functional-readiness-review.md`
- Do not modify `src/**` or existing Settings browser tests.

**Interfaces:**
- Consumes: `settingsFields: Partial<Record<BusinessSection, SettingField[]>>` from `src/settings/fields.ts`; historical pre-#272 specialist files and current `model.ts` / `TenantSettingsProvider`.
- Produces: stable matrix row identifiers `<section>.<fieldKey>` for ordinary fields and `<section>.<specialistId>` for specialized workflows; evidence-backed five-state ledger and prioritized PR #274 review conclusions.

- [ ] **Step 1 — Pin and document evidence.** Fetch current `main` SHA and PR #274 base/head/status/changed-file list and workflow conclusions. Compare `main`, the pinned historical commit and #274 head; record all three actual SHAs and review date at the top of both docs. Do not accidentally label an unmerged PR change as current-main behavior.

- [ ] **Step 2 — Write failing inventory-coverage tests.** Create `tests/settingsMigrationMatrix.test.ts` with Node `node:test` and `node:assert/strict`; import `settingsFields` from `../src/settings/fields.ts` and parse the Markdown matrix rows from `../docs/settings/functional-migration-matrix.md`. Check that every ordinary `section.field.key` occurs **exactly once**, that the baseline has 60 descriptors unless the pinned source proves otherwise, that each row supplies a legacy source reference, `main` state, PR #274 state, consumer path or explicit `none found`, readiness classification and all five valid statuses. Check specialized minimum IDs: `team.employees`, `team.roles`, `data.settingsJsonBackup`, `data.encryptedSettingsSnapshot`, `data.deletedSalesDrafts`, `activity.settingsChanges`, `invoices.documentDesign`, `invoices.numbering`, `invoices.ledgerReportProfiles`, `financialTerminology.khataLabels`, `interface.moduleColumns`, `security.accountSecurity`. Check duplicate IDs and blank required evidence. Verify test itself never treats a file path as proof of a consumer.

- [ ] **Step 3 — Run red test first.** Run `node --experimental-strip-types --test tests/settingsMigrationMatrix.test.ts`. Expected: **FAIL** because the required matrix document or complete row coverage does not yet exist. Do not satisfy the test by hardcoding an incomplete list of keys.

- [ ] **Step 4 — Populate 60 ordinary field rows.** Create `docs/settings/functional-migration-matrix.md` with a parseable table using columns `Kind | ID | EN / BN label | Historical source | Main route/behavior | PR274 route/behavior | Actual consumer or none found | Displayed | Editable | Persistent | Consumed | Enforced | Readiness | Priority | Verification/evidence`. Use `ordinary` for the 60 keys; for each key inspect both old and current settings files plus any actual UI/transaction consumer. Distinguish provider persistence from the consumer respecting that setting. Allowed readiness labels: `browser-working`, `preview-only`, `backend-required`, `unsupported`, `unverified`. Unknown facts stay `unverified`, not guessed.

- [ ] **Step 5 — Populate specialized workflow rows.** Under the same table/schema, add `specialized` rows for the minimum IDs from Step 2 and other meaningful legacy controls: role assignment/impact/last owner, record recovery and settings activity, CSV import preview, receipt/document designs, Business regional/VAT preferences, personal theme/language/density/date, interface controls, demo security/PIN, sessions/offline/notifications. Distinguish historical *working browser-only* flows from *historical previews* and from new Magic features with no historical equivalent.

- [ ] **Step 6 — Run green contract tests.** Repeat `node --experimental-strip-types --test tests/settingsMigrationMatrix.test.ts`. Expected: **PASS** for all field coverage, specialized minimum, unique IDs, complete status columns and evidence assertions. If historical source changed relative to the pinned SHA, record and investigate rather than silently updating baseline.

- [ ] **Step 7 — Perform the two-axis PR #274 review.** Inspect the actual PR patch and affected callers for `TenantSettingsPage.tsx`, `LiveSettingsSection.tsx`, `CheckoutPanel.tsx`, `PurchaseEditor.tsx`, both changed browser scripts and any generated docs. Write `docs/settings/pr274-functional-readiness-review.md` with **separate** sections: (A) standards and implementation risks; (B) original feature-restoration/spec gaps. Every confirmed finding must include priority `P0/P1/P2`, exact file and line/range at reviewed head, reproduction/test evidence, expected behavior and safe remediation. Specifically evaluate nested invoice preservation, optional field safety for credit sale, potential double dirty-navigation guards and outdated preview notices. Missing server contracts are tracked but must not be misreported as newly introduced regressions.

- [ ] **Step 8 — Verify real consumer evidence.** On the **PR #274 head**, inspect or run existing `pnpm run test:settings`, `pnpm run test:auth-settings`, `pnpm run test:purchases` (if relevant and runnable); verify tests actually assert persist → reload → observed POS/Purchase UI rather than only toggled DOM state. Record exact run URLs/conclusions where GitHub CI was used; mark manual/browser assertions `unverified` if not run. For invoice and security claims, use source-level inspection if browser verification is unavailable; do not invent test results.

- [ ] **Step 9 — Run repository guardrails.** Run `pnpm test`, `pnpm run check:ui-contract` and `pnpm run build` on the audit branch where available. Run `node --experimental-strip-types --test tests/settingsMigrationMatrix.test.ts` and check that the diff changes only the three audit/test files. Record failures and environmental limits explicitly instead of promising a pass.

- [ ] **Step 10 — Commit and request review.** Commit with `docs(settings): inventory legacy controls and review PR 274 readiness`. Open **one draft audit PR**. If design PR #275 remains unmerged, base the audit branch on the approved design commit and target #275 until it lands, then retarget to `main`; do not silently create a PR missing its required design spec. Include the count, blocked/restored/preview classifications and the five most critical confirmed issues. Request owner review; **do not merge #274, #275 or the audit PR automatically**.

### Task 1 Definition of Done

- All historical ordinary settings fields appear exactly once in a documented, verified matrix.
- All high-value specialized legacy workflows have separate audit entries; the 12 specified minimum IDs are present.
- No saved-only toggle is recorded as `enforced=yes` without evidence from a real consumer/enforcement boundary.
- PR #274 findings distinguish test-proven restorations, partial integrations, preview-only actions and production/backend gaps.
- At least the five Review Focus cases have traceable source/test evidence or an explicit `unverified` status.
- One reviewable GitHub draft audit PR exists, with **no product UI/source changes**.
- Owner can choose the safe #274 merge/repair disposition and approve the **next** functional task (Data & Backup). That next task is **not** part of this plan.

## Self-review checklist (must run before handoff)

- [ ] Spec coverage: design §4 and §5A covered by matrix statuses, source/consumer mapping and acceptance gates.
- [ ] Scope: this plan implements **only** the first inventory/reconciliation task, not Data & Backup or Team repairs.
- [ ] Test red/green: required contract test fails before document and passes afterward.
- [ ] Types/IDs: ordinary IDs match `settingsFields`; specialized IDs are explicitly enumerated and cannot collide.
- [ ] Provenance: every claim is tied to a pinned ref, source location, test result, or clearly marked unverified fact.
- [ ] No misleading wording: local storage ≠ server, hidden field ≠ revoked permission, UI preview ≠ production enforcement.
