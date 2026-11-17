# Settings Data & Backup Functional Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or subagent-driven-development) and TDD; one task per review gate.

**Goal:** Make Magic Settings → Data & Backup a functioning **settings-only** export/review/restore experience, preserve existing encrypted settings SQL snapshot and 30-day session draft recovery, and remove the misleading demo Reset workflow.

**Architecture:** Keep the Magic Data page's `SettingCard` and compact tab navigation. Use the existing typed `TenantSettingsProvider` as the only storage/authorization authority. Reuse `SettingsSqlBackup`, `DraftRecovery` and existing `parseSettings` rules; never add a second settings store, execute SQL or mutate sales/stock. Reconnect existing CSV *preview* and contextual export links without creating a real import.

**Tech Stack:** React TypeScript, existing Tailwind/shadcn-style UI and Magic Patterns styling, Node/Playwright, GitHub CI.

**Spec:** `docs/superpowers/specs/2026-11-09-settings-functional-migration-design.md` §5B (approved owner 2026-11-09). Audit: `docs/settings/pr274-functional-readiness-review.md` (draft PR #276).

## Global Constraints
- Stack the draft feature PR on `fix/settings-restore-live-controls` at pinned SHA `fc9780ded7217dcdd2d60eb645e691ae332f7b79`, because PR #274 has not been merged. Do not merge automatically or quietly target `main` missing dependencies.
- UI source of truth: Magic Settings layout; retain compact bilingual text, 36px controls, keyboard and touch.
- Scope settings **only**. Exports are explicitly NOT full ERP data backups; preserve posted sales, stock, payments and ledger.
- Validate maximum JSON size 1 MB, exact business ID, complete typed settings fields, review of changed sections, owner/import permission and expected revision. Never execute uploaded SQL; AES secret is never persisted.
- Recycle Bin is for 30-day eligible, **current-session** deleted sales *drafts*, no posted record resurrection.
- Restore must distinguish persisted-to-browser from memory-only when browser storage fails. Never claim server sync.
- Preserve existing Product CSV mapping preview as nonposting and existing Product/Sales/Daybook export links.

## Review Focus
1. Wrong-tenant JSON must show an error and never open Restore.
2. Edited and saved settings must be restored from a reviewed JSON snapshot, survive reload, and leave transaction data untouched.
3. A stale review must reject a later write without overriding the saved settings.
4. Lack of import/export permission must disable those operations, not just hide actions.
5. Encrypted SQL restore with bad secret/format must fail; draft recovery remains session-scoped and nonposting.

## Task 1 — Migrate Data & Backup inside Magic page
**Files:** `scripts/settings-magic-browser.cjs` (test); `src/settings/magic/DataSettings.tsx` (implementation); `src/settings/TenantSettingsPage.tsx` (only if prop changes); `src/settings/TenantSettingsProvider.tsx` (only if restore success reporting requires it); original `DataSettings.tsx`, `SettingsSqlBackup.tsx`, `DraftRecovery.tsx` read-only unless essential.

- [ ] **RED test:** Replace old Magic demo-only assertions in `scripts/settings-magic-browser.cjs` with E2E: export a real settings JSON, verify no sales/stock, reject foreign business, review and restore modified business name, reload, restore original state, verify encrypted SQL card and 30-day draft recycle and CSV preview links.
- [ ] Run `npm run test:settings-library` in GitHub Actions on a first red commit; verify it fails for the original demo UI (not setup).
- [ ] **GREEN implementation:** wire the existing Magic tabs and card to `useTenantSettings` + `parseSettings` + `canManage`, and mount/reuse `SettingsSqlBackup` + `DraftRecovery`. Remove fake Reset demo action. Retain compact card/tabs and explicit safe labels.
- [ ] Verify save/restore handles storage failure explicitly (memory-only, no false 'saved').
- [ ] Run Settings E2E; inspect CI error output; fix only task-scope regressions.
- [ ] Re-run all PR CI commands: TypeScript, ESLint, UI contract, unit suite, Vite build and auth/settings smoke.
- [ ] Review the resulting diff against this spec, write clear limitations in draft PR, do not merge or make server enforcement claims.

**Definition of done:** real settings-only JSON export/review/restore from the current Magic Data screen, default files validated; encrypted settings snapshot and session draft recovery visible, bogus reset removed, data stays safe, tests pass at exact reviewed HEAD.