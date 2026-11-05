# ERP-wide row action menu consistency — Daybook / Audit reference

**Owner direction:** All ERP screens that expose an `⋮` Action control should show the compact, icon-first, touch-friendly dropdown used in Daybook and Audit Ledger instead of an unexplained one-click action modal. The screenshot supplied by the owner is the visual reference. This is a presentation and navigation refinement, not permission to alter business operations.

**Reference:** `src/components/layout/FloatingPanel.tsx`, `src/components/layout/ActionMenu.tsx`, `src/pages/AuditLedger.tsx`, `src/components/daybook/DaybookActions.tsx` (approved PR #252 also standardizes 36px trigger and accessibility).

**Current source audit:** Products, Purchases, Expenses, Accounts, Party Ledger, Warranty, Sales and Audit mostly already use `FloatingPanel` + icon-first `ActionMenuList`. Finance's Transaction, Account, Transfer, Cheque and Cash Session `⋮` buttons open large action dialogs directly. Reconciliation's `⋮` opens a details dialog immediately. This is the main interaction inconsistency.

**Target scope:**
- Shared `src/components/layout/RowActionMenu.tsx`: 36px square trigger; uses existing `FloatingPanel`, `ActionMenuList` and `ActionMenuItem` primitives, compact 13px/icon-first items, keyboard + touch + focus-return.
- `src/pages/Finance.tsx`: route the five `⋮` surfaces through visible menus; commands open the pre-existing safe details, editor, confirmation flows.
- `src/components/finance/FinanceRecordDialogs.tsx` and `ChequeActionDialog.tsx`: allow the existing protected dialog to start in selected edit/reverse/status mode only after a real menu selection. No direct financial mutation from the popup itself.
- `src/pages/Reconciliation.tsx`: menu presents Open details then reuses the original dialog unchanged.
- Only compatible accessible trigger-size fixes in other modules if warranted by tests; no broad redesign.
- Focused Playwright across phone 320/390, tablet 768/820, desktop 1024/1440 and light/dark; verify actual opened menu geometry and rows, Escape/focus, no sideways scrolling to reach actions, all original commands and confirmation gates.

**Protected:** Finance posting/balances, cheques, cash sessions, reconciliation, permissions, original action names/handlers, all existing main route functionality, original app design and bilingual text.

**Acceptance:** No `⋮` bypasses the menu in scoped screens. Menus remain within viewport and keyboard/touch-reachable; each action still invokes its original workflow safely. Source contract, TypeScript, unit, build and Playwright pass; GitHub draft PR only, no merge/deploy.

**Workflow:** GitHub-only ChatGPT-led C0–C4. The original independent-agent `/ui-refine-loop` is not available here; do not invent separate scores or evidence.
