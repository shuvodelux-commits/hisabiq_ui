# Recovery, delete actions and cash session Implementation Plan

> For agentic workers: use superpowers:subagent-driven-development to implement task by task, with task and final review.

**Goal:** Implement the approved recovery, ERP deletion and cash opening workflows.
**Architecture:** Extend the existing preview stores with typed recovery adapters and shared source review entry points. Extend the existing cash provider rather than introducing a parallel state model.
**Tech Stack:** React, TypeScript, Vite, existing HisabIQ primitives and Playwright.
**Spec:** docs/superpowers/specs/2026-11-10-recycle-delete-cash-session-design.md (approved by owner).

## Global Constraints

- This is a functional UI-preview implementation in `hisabiq_ui`, using its actual preview stores.
- Preserve 36px ordinary controls, 13/12/11 table roles, tokens, proportional digits, phone/tablet/desktop behavior, accessible names, focus return, Escape and reduced motion.
- No new dependency is expected.
- Never delete financial projections or claim backend posting from local mutations.

## Review Focus

- Repeat deletion cycles must address a unique deletion, not a stale prior payload.
- Partial bulk restore must preserve each failure and never imply complete success.
- Purchase draft consumption after posting must not create a recovery record.
- Product/party eligibility must inspect historical references, not only zero balance.
- Opening balance differences on the first day still require a source.

### Task 1: Recovery service, UI and recoverable menu actions

**Files:** create src/recovery/model.ts, src/recovery/store.ts, src/components/recycle/RecycleBinList.tsx, src/pages/RecycleBin.tsx; extend src/data/{salesPreviewStore,purchaseDraftsPreviewStore,productImportPreviewStore,partyPreviewStore}.ts, src/quotations/quotePreviewStore.ts, src/onlineSales/onlineStore.ts, relevant pages/menus, src/settings/DraftRecovery.tsx, src/App.tsx and src/navigation/erpNavigation.ts. Test tests/recovery.test.ts and scripts/recycle-bin-browser.cjs.
**Interfaces:** produce typed list/delete/restore/purge commands with tenant/actor/module permission context, revision checks and unique deletion IDs; use source adapter functions to restore original identities. Recovery service subscriptions supply the bin and settings summary.
- [ ] Write failing domain tests for expiry boundary, identity/conflict, unauthorized tenant/actor, repeated cycles, purge, missing dependencies and partial bulk outcomes. Run with node --experimental-strip-types --test tests/recovery.test.ts and observe failure.
- [ ] Implement the service and actual source adapters; wire recoverable menu actions and standalone route. Separate purchase-draft consumption from user deletion. Add English/Bangla UI, filters, details, selection, owner purge confirmation and honest preview copy.
- [ ] Run domain tests plus existing draft/quotation/product/party tests; build; exercise delete→restore in a real browser, themes and small viewport. Fix introduced failures, update guide inventory, commit scoped changes.

### Task 2: ERP-wide source-safe delete policy

**Files:** existing src/pages/{Sales,Purchases,Expenses,Finance,Parties,OnlineSales,Products,Daybook,Accounts,AuditLedger,Vendors,Warranty,Reconciliation}.tsx and their actual action components; create a shared policy/helper only where needed. Test tests/deletePolicy.test.ts and browser script.
**Interfaces:** consume Task 1 recovery commands for eligible records; use existing domain cancellation/reversal/impact-review commands for posted sources. Derived rows resolve actual source identity; unsupported commands remain disabled with a visible explanation.
- [ ] Write failing tests for used masters, posted/projection exclusion, linked-return dependencies and missing safe source commands.
- [ ] Inventory all ERP destructive entry points and implement the approved matrix, preserving contextual filters and role permissions. Retain appropriate lifecycle actions and immutable audit/history. Add a per-action coverage matrix to docs/ui.
- [ ] Run focused tests and browser posted-review/disabled-reason checks. Commit scoped changes.

### Task 3: Start Cash Session and shared history

**Files:** src/contexts/CashSessionContext.tsx, src/components/layout/{CashSessionDialog,TopBar}.tsx, src/components/finance/CashSessionDetailsDialog.tsx, src/pages/Finance.tsx, src/settings/rbac.ts; create src/finance/cashSession.ts and tests/cashSession.test.ts plus scripts/start-cash-session-browser.cjs as needed.
**Interfaces:** session store exposes sessionOpen/openingCash/expectedCash/saveCount compatibly, plus typed start/close/history commands, actor permissions, business date, operation ID and revision checks. Use exact source UI from nestshererp branch chore/hisabiq-adoption-runtime-a01 StartDayDialog.vue/DayStatusChip.vue.
- [ ] Write failing tests for zero/decimal/invalid opening, first-day source, repeat/stale start, enabled setting, prior-day blocking, immutable history and cash formula. Include 20,000+50,000+5,000−3,000−7,000=65,000 expected and 64,500 actual; next-day 64,500/70,000/60,000 cases.
- [ ] Implement blank direct Start flow, conditional source/destination choices excluding inactive/drawer accounts, optional note, existing count/close compatibility and connected preview history. Add cash.daily.view/cash.session.start/cash.session.close grants using existing RBAC. Keep UI-preview boundaries explicit; no offline/reopen/backend expansion.
- [ ] Run tests, build and cash/finance browser regressions in English/Bangla and light/dark, keyboard and phone/tablet/desktop. Commit.

### Task 4: Integration, evidence and draft PR delivery

**Files:** task browser scripts, docs/ui action matrix, generated guide data, PR body file.
**Interfaces:** all task commands and UI flows above.
- [ ] Run npm run check:ui-contract, guide sync check, changed-code type/lint, build and focused domain/browser regressions; retain before/after screenshots and precise outcomes.
- [ ] Review the complete diff independently against the approved spec; fix important findings with regression tests and rerun affected checks.
- [ ] Create feature-branch draft PRs with actual validation evidence and preview limits. Do not merge or deploy.
