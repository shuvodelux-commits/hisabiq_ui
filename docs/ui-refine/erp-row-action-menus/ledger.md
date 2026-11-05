# ERP row Action menus — C0–C4 verification ledger

**Reference:** Daybook / Audit Ledger icon-first `FloatingPanel + ActionMenuList` design. **PR:** #255. **Route for generic screenshots:** `#/app/finance`. **Current verified implementation HEAD:** `1e77ef897208ad936524b9feed24b1fd795ca362`.

**Review mode:** ChatGPT-led GitHub-only source, real Playwright and official pinned Impeccable *mechanical source detector*. Not the original parallel-model `/ui-refine-loop`; no invented /40 assessment or isolated review score.

## C0 — source inspection and baseline
- **Already consistent:** Audit Ledger, Daybook (latest approved design on PR #252), Sales, Products, Purchases, Expenses, Party Ledger, Warranty and Accounts entries use existing `FloatingPanel` and `ActionMenuList` with a Lucide icon per action.
- **Exceptions identified:** Finance transactions, money accounts, transfers, cheques, cash sessions and Reconciliation history used `⋮` to launch large detail/action dialogs directly. This prevented scanning the available commands before opening a heavy editor.
- Baseline source: `src/pages/Finance.tsx`, `src/pages/Reconciliation.tsx`, existing Finance/Cheque/Cash Session dialogs and the original `src/components/layout/FloatingPanel.tsx` / `ActionMenu.tsx`.
- Original Finance opened modal screenshot at 320px light (baseline in screenshot artifact below) compared directly with compact dropdown in candidate.

## C1 — shared standard trigger and safe dialog modes
- New `src/components/layout/RowActionMenu.tsx`: built **only** on shared `Button`, `FloatingPanel`, `ActionMenuList`. Exactly 36px trigger, semantic name/expanded state, icons/13px text and existing Escape/focus return.
- Existing Finance Transaction/Account/Transfer and Cheque dialogs receive optional `initialMode`. The row menu's View/Edit/Review reversal/Account entry/Status operations route to these existing dialogs. The popup **never directly mutates money or stock**; reversals and status changes still require the original confirmation step.
- No change to authorization or accounting functions.

## C2 — route coverage and responsive Action column
- `Finance.tsx` now exposes menus for Finance transactions, Money Accounts, transfers, cheques and cash sessions; role-appropriate menu items reuse original handlers.
- `Reconciliation.tsx` history `⋮` now opens a single Open details menu item, which opens its original detail dialog.
- In Finance/Reconciliation tables, Action headers/cells remain sticky at the right edge, with a quiet border and card background, to preserve touch access on narrow screens. Other information columns remain available by scrolling.
- No other ERP pages were redesigned; they already use the shared menu primitive.

## C3 — source inventory, accessible interactions and test harness
- `scripts/erp-row-action-menu-browser.cjs`: 16 real Playwright scenarios (Finance transactions at 320/390/768/1024/1440 in both themes, plus cheques, cash, Accounts money accounts and Reconciliation History). Checks 36px trigger, visible menu items, viewport clamping, arrows/Home/End, Escape/focus return, and the original details dialog after selecting View. Does not confirm a transaction or mutate amounts.
- `scripts/ui-refine-chatgpt-shots.cjs` captures Finance `⋮` opened state on both main and PR (before is a large modal; after is icon-first dropdown) in five responsive widths and light/dark; normal default route captures remain.
- The generated design-system inventory and guide component count were synchronized for the new RowActionMenu.

## C4 — verified results and finish grades

- [GitHub PR Fast CI run 41980534850](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41980534850) **SUCCESS**: TypeScript, ESLint, generated guide/UI design contract, unit suite, Vite build and repository browser regressions.
- [UI screenshot and Playwright run 41980535410](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41980535410) **SUCCESS**: 40 actual screenshots (20 main + 20 PR) of the default and opened Finance action states at 320/390/768/1024/1440px, light/dark; targeted Playwright `16/16` passed, including Finance, Accounts and Reconciliation.
- **Official pinned Impeccable detector** on `src/components/layout/RowActionMenu.tsx`: exit code **0**, JSON **`[]`**. This is static source detection, **not** an independent AI review or a rendered accessibility certification.
- **Visually reviewed actual images:** 320px light and 768px dark show full icon-first menu within the viewport; 1440px light shows clean right-edge positioning. No new popup clipping seen in those inspected states. Full set captured; only cited images actually inspected visually.
- **Grades:** (F01) Finance direct modal instead of menu — **fixed**; (F02) Money Accounts/Cheque/Cash/Transfer `⋮` same menu family — **fixed**; (F03) Reconciliation historical `⋮` — **fixed**; (F04) 36px trigger, Escape/arrow/Tab interactions — **fixed**; (F05) mobile Action viewport reachability — **fixed** in covered cases; (F06) untouched module-specific action ordering/permissions — **retained** by using existing handlers and opt-in shared component.
- **Limitations:** No assertion that every future or hidden route has been individually exercised. A one-item Reconciliation menu adds one click intentionally to make its `⋮` behavior explicit. Existing modules already using the shared menu were not bulk rewritten. Screenshot evidence is static; animations were not changed.

**Stop:** bounded source/visual passes and final independent mechanical scanner succeeded. No reason for speculative changes. PR #255 remains draft and unmerged for owner review. No deployment or persistence changes.
