# Sales invoice list — GitHub-only UI refine review ledger

**Route:** `#/app/sales`. **Reference:** Owner-approved Daybook PR #252, including aligned Filter/row Action and inline Status/Reset. **Target PR:** #253. **Mode:** ChatGPT + GitHub-only; the original independent-agent /ui-refine-loop runner is unavailable. No numerical independent-agent /40 score is claimed.

## C0 — source and visual baseline
- `src/pages/Sales.tsx`: existing Search/Customer/Status/Payment filters, no date selector in Sales invoice list, phone `SalesMobileToolbar` with text-heavy Filter and a conditional standalone Clear filters area, desktop `SalesWideToolbar` collapsed by default.
- `src/components/sales/SalesMobileLayout.tsx`, `SalesWideToolbar.tsx`, `sales-mobile.css` and the actual shared Table/ActionMenu were reviewed.
- [Baseline GitHub screenshot run 41974896566](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41974896566) passed with initial branch identical to `main`.
- UI direction: Daybook-level compactness, touch/keyboard, 36px controls, no wasted Reset row, no redesign. Preserve original modules, transaction processing, print/export and settings.

## C1 — filter layout and Reset
- Source changes: `SalesMobileLayout.tsx`, `SalesWideToolbar.tsx`, `Sales.tsx`.
- Mobile: square Filter placed at right of first row; list actions retained; active state dot; results count kept without duplicate full-row clear action.
- Tablet: Search, list actions and rightmost square Filter; expanded Customer, Payment, Status+Reset in a compact grid.
- Desktop: existing filters visible below Search and table actions; status and `RotateCcw` are adjacent, not in a new row.
- Original filter reset semantics retained: clears search and returns customer, payment, status to All.
- [Actual Playwright baseline/after run 41975236753](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41975236753) succeeded, and the official pinned Impeccable source detector returned JSON `[]` (mechanical scan only). Opened actual 320-light, 390-dark, 768-light, 1024-light and 1440-light PNGs from the downloadable artifact. The narrow desktop/tablet table clipped the Action column, a real P1 finding; no claim of fully fixed layout in C1.
- Initial Fast CI on C1 failed `check:ui-contract` due to regenerated design icon inventory files, not TypeScript/lint. Regeneration was addressed in subsequent commits.

## C2 — table action reachability
- `Sales.tsx`: pin the Action column to the scrolling table's right edge only for the Sales invoice list; label its keyboard-scrollable region.
- Preserve every invoice `InvoiceActions` callback, financial posting behavior and visible table column.
- Need final Playwright geometry and screenshot confirmation at 768/820/1024 after this change; do not assume a sticky source class alone proves behavior.

## C3 — focused tests, generated inventory and open-state evidence
- Added `scripts/sales-daybook-refine-browser.cjs` with 320/390/768/820/1024/1440px light/dark checks: one Filter icon, 36px bounds, Action reachability/edge alignment, Status+Reset geometry, keyboard reset clears query and status, no runtime exception.
- `scripts/ui-refine-chatgpt-shots.cjs` uses the PR's opt-in Sales state to execute the browser script and capture opened Filter and invoice Action states alongside default before/after views.
- Synchronized generated `docs/ui/design-system.json`, `src/data/designGuide.json`, `src/data/designIconComponents.ts` for new actual Lucide imports. No design-guide rules changed.
- Latest quality checks and screenshots must be read from the final PR head; passing status is not assumed.

## C4 — closing verification (2026-11-05)

**Verified implementation head:** `e62aa19abbaf6cdc16b44803b7ee068978c188c5`.

- [Fast CI run 41976768724](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41976768724): **SUCCESS**. TypeScript, ESLint, design-inventory/UI contract, unit tests, production build and repository browser smoke gates passed.
- [Screenshots + targeted Playwright run 41976762630](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41976762630): **SUCCESS**. 60 actual PNGs (30 before, 30 after) cover default Sales, expanded filters and opened invoice actions at 320/390/768/1024/1440px in light/dark. 820px also covered in targeted Playwright. Focused responsive checks passed **12/12**. The preceding run 41976339683 failed because its test selected an intentionally hidden responsive duplicate; the next commit corrected the test selector, not application logic.
- Pinned official Impeccable **source detector** exit **0**, findings `[]`. This is a mechanical source scan, not independent design critique or an accessibility certificate.
- Real 320/390 phone, 768 tablet and 1024 desktop open-state screenshots inspected: Status + Reset share one line, Filter is compact, Action remains reachable. A long `Part returned` status badge can be partly obscured by sticky Action on intermediate widths until table scroll; remaining **P2** visual limitation.

### Finish grades

| Finding | Grade | Evidence |
|---|---|---|
| F01 compact 36px Filter and accessible active indicator | **fixed** | 12/12 browser cases and responsive screenshots |
| F02 36px Reset directly beside Status, preserves original reset semantics | **fixed** | Keyboard Reset and same-line geometry checks |
| F03 invoice Action stays viewport-reachable | **fixed** | Browser bounds, sticky column and opened action screenshots |
| F04 no redundant mobile Clear filters row | **fixed** | Source and phone screenshots |
| F05 long Status badge fully visible without scrolling at 768/1024 | **partial** | Screenshot shows occasional clipping beside sticky Action |

**Mode/stop:** C0 source baseline → bounded C1–C3 implementation/test fixes → C4 closing review. GitHub-only ChatGPT-led Impeccable review, **not** the native independent-agent runner, so no unsupported /40 scoring. Verified checks were on the code head above; this final evidence-only ledger commit may retrigger GitHub checks. PR remains **draft and unmerged**, no backend, accounting, payment, inventory or deployment changes.

## Protected behavior
Sales invoice details, payments, returns, drafts/templates, product quantities, customer ledgers, exports/print, columns, search, language and authentication unchanged. Draft PR only; no merge, deploy or backend edits.
