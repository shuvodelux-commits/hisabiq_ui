# Expenses UI refine — reconcile three-round pilot with current main

**Route:** `#/app/expenses`  
**Source:** `src/pages/Expenses.tsx`  
**Reference:** PR #243 (`refine/expenses-github-pilot-3round`), C0–C4 Expenses pilot ledger; current approved Daybook/Sales responsive Filter and Action rules.  
**Baseline:** Current `main` after PR #262; do not assume pilot merge landed on `main`.

## Owner direction
Reconcile the original Expenses pilot's compact, keyboard-friendly controls with the latest HisabIQ UI. Retain all newer shared action-menu semantics, Sabab motion, and actual app permissions/handlers. Refine, not redesign.

## Scope and invariants
- Preserve all four Expenses tabs (Expense list, Categories, Payees, Reports), source preview/data, reports/date ranges, filters, receipt preview, category and payee actions, print/export, correction/cancellation dialogs, active/deactivated constraints and original bilingual text.
- No edits to backend, accounting, payment, inventory, business storage, user permissions or other modules.
- Keep `ActionMenuList/Item/Divider` and actual `FloatingPanel` workflows from current `main`; never restore older generic menu markup.
- Follow real current design rules: 36px standard controls, 0.375rem radii, Ink/Teal, no monospaced numerals, accessible keyboard/touch, light/dark and Bangla.
- No date control exists for the Expenses list; do not invent one. Preserve Reports' existing date-range filter.

## Acceptance checks
1. Four underline tabs stay on one row at 320px; first and Reports are fully visible; ArrowLeft/Right, Home/End and roving tab focus work.
2. Phone/tablet: Search + 36px outlined funnel Filter. The existing four secondary filters start collapsed, retain selections when hidden and expose a selected-filter indicator; desktop displays them without an extra Filter toggle.
3. Reset uses a compact outlined RotateCcw icon adjacent to the last status dropdown, retaining the existing full query/category/payee/method/status reset. Export remains visible and functional.
4. Expense, Category, Payee table Actions remain reachable before horizontal scrolling, use current icon-first menus and full protected handlers. Complete `EXP-...` references stay readable at 320px.
5. Check 320/390/768/820/1024/1440px, light/dark, expanded filters, open menus, keyboard, scroll, print/export and preview-only warnings.
6. Run TypeScript, lint, UI contract, unit, build, target Playwright, pinned official Impeccable mechanical scan and C0–C4 ledger; record actual limits and outcomes. Keep PR draft for owner approval.

## Review protocol
GitHub-only ChatGPT-led Impeccable-guided review; native independent-model `/ui-refine-loop` runner unavailable here. C0 baseline then three bounded check/fix rounds if actionable, C4 closing evaluation. Do not invent independent design/audit scores.
