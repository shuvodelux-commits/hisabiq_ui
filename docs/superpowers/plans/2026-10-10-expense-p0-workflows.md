# Expense P0 UI Workflow Safety — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task, native execution only.

**Goal:** Eliminate misleading Expense and Bill detail financial actions; make Expense filters, CSV export and in-module category/payee creation genuinely usable.

**Architecture:** Keep the existing React expense preview and BillDialog editor. Add pure testable filter/CSV helpers, wire existing shared themed FormSelect/Dialog/Quick Add operations; do not implement ledger posting. Disable unfinished payment and reversal workflows with explicit reasons.

**Tech Stack:** React 18, TypeScript, shared HisabIQ UI primitives, node:test, Playwright.

**Spec:** docs/superpowers/specs/2026-10-09-erp-kiss-contextual-workflows-design.md; Issue #46.

## Global Constraints
- Original Magic Patterns visual language; compact English with Bangla helper, theme tokens.
- Preview data only; no backend money, ledger or stock posting claims.
- Preserve draft through existing BillDialog QuickAddSelect; no second Expense posting engine.
- Reuse controls, no native select fork or fake success toasts.
- Keep issues #47, #48 and #43 separate.

## Review Focus
- Search plus category/payee/payment/status filters compose without masking selections.
- Export is a real download and sanitizes spreadsheet formula prefixes.
- A new payee/category is available from the same Expense module without route change.
- Existing edit/settle/reversal controls must be disabled with a reason, not success toasts.
- Preview save cannot imply a posted financial transaction.

---

### Task 1: Expense list utilities
**Files:** Create `src/expenses/expenseWorkflow.ts`, `tests/expenseWorkflow.test.ts`.
**Produces:** `filterExpenseList(expenses, filters)`; `expenseCsv(expenses)`.
- [ ] Write filtering and CSV-injection tests.
- [ ] Verify tests fail before implementation.
- [ ] Implement helper with paid/split-payment semantics and exact filters.
- [ ] Verify focused and full node tests pass.

### Task 2: Expense page actions and Quick Add
**Files:** Modify `src/pages/Expenses.tsx`.
**Consumes:** Task 1 functions, existing `createPreviewParty` / `createPreviewExpenseCategory`.
- [ ] Add browser coverage for filtering, export and in-place category/payee creation.
- [ ] Verify browser test fails before production change.
- [ ] Wire four controlled FormSelect filters; live derived totals/reports, honest CSV export.
- [ ] Make category/payee Create dialogs functional with duplicate validation and draft-independent state; reuse current Expense form's own QuickAdd.
- [ ] Replace menu-only toasts with real View or clearly disabled-with-reason actions.
- [ ] Label UI save as local preview, no financial posting.
- [ ] Run Playwright and build.

### Task 3: Remove fake Bill payment action
**Files:** Modify `src/components/purchases/BillDetailDialog.tsx`, add browser assertion.
- [ ] Assert Pay never claims posting without source event.
- [ ] Replace fake Pay and fake attachment actions with visibly unavailable controls and explanations.
- [ ] Run all relevant tests and build.
- [ ] Open draft PR for review; leave Bill settlement, posted reversal, Expense edit/refund and party corrections as follow-up issues.
