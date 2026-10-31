# Finance and Accounts Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Place Money Accounts within Accounts, with contextual Bank Entry and Accounts-owned Reconciliation; remove duplicated Finance tabs while preserving the existing money-account design and transactional logic.

**Architecture:** Reuse the existing Finance Money Accounts card workspace through an embedded mode in Accounts instead of duplicating data or UI. Make sidebar destinations agree with tab ordering and preserve old query deep links using redirect navigation.

**Tech Stack:** React, TypeScript, React Router, shadcn UI, Node tests and Playwright, GitHub PR CI.

**Spec:** docs/superpowers/specs/2026-10-31-finance-accounts-navigation-design.md

## Global Constraints
- Keep original card markup, controls, dialogs, preview data and business logic.
- English-only Accounts tab labels; Bangla help stays inside content.
- The Counter and Daybook remain separate modules.
- No new dependencies; no database changes; never auto-merge.

## Review Focus
- Old Finance Money Accounts/Counter URLs redirect without losing navigability.
- Account cards show unchanged balance/ledger/transfer and retain account identity.
- Bank Entry selected account from a card remains selected after API bootstrap, or falls back safely when unavailable.
- Sidebar and tabs stay synchronized at 1440, 768 and 390 px.
- Reconciliation and Audit remain under Accounts, while Cash Session links preserve their reference context.

---

### Task 1: Canonical navigation contracts

**Files:** Modify `src/navigation/erpNavigation.ts`; test `tests/erpNavigation.test.ts`, `scripts/navigation-order-browser.cjs`.

**Interfaces:** Existing `erpNavigation` and `resolveNavLocation` return canonical group and child IDs.

- [ ] Add failing navigation and hierarchy tests that assert Finance has four tabs and Accounts has seven in-page destinations followed by Reconciliation and Audit; Daybook and Counter remain top-level.
- [ ] Run tests to verify red on previous hierarchy.
- [ ] Change sidebar navigation destinations to the approved layout, maintaining unique children and original route paths.
- [ ] Run tests and commit.

### Task 2: Money Accounts in Accounts without card redesign

**Files:** Modify `src/pages/Finance.tsx`, `src/pages/Accounts.tsx`.

**Interfaces:** `Finance({counterOnly?: boolean; moneyAccountsOnly?: boolean})` embeds the existing Money Accounts tab content; Accounts adds `money-accounts` to its tab state and renders the embedded view.

- [ ] Add browser tests for Accounts → Money Accounts card, Ledger, Transfer, Bank Entry action and Finance without Money Accounts or Counter tabs.
- [ ] Verify failing against old pages.
- [ ] Implement embedded mode, route legacy Finance tab links, and preserve existing contexts and dialogs.
- [ ] Run tests and commit.

### Task 3: Contextual Bank Entry and final responsive checks

**Files:** Modify `src/components/accounts/BankEntryTab.tsx`, `src/pages/Accounts.tsx`, `scripts/bangla-accounting-browser.cjs`, `tests/accountsEnglishOnlyTabs.test.ts`.

**Interfaces:** `BankEntryTab({variant?: 'accounts'|'counter'; initialAccountId?: string})` chooses matching available account before falling back; Accounts `?tab=bank-entry&accountId=...` renders this contextual view with return action.

- [ ] Add failing tests for account preselection, legacy Bank Entry deep link, Accounts English tabs in all languages and direct money-account actions.
- [ ] Verify red, then implement minimal preselection and contextual Back to Money Accounts behavior.
- [ ] Run full unit, contract, build, and Playwright suites in PR CI and commit.
