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

## C4 — closing verification
**Open at time of this ledger entry.** Verify Fast CI, official Impeccable output, actual before/after opened-state screenshots and focused browser test, then give `fixed/partial/not-fixed` grades. Never invent independence, scores, tests, visual proof or production deployment.

## Protected behavior
Sales invoice details, payments, returns, drafts/templates, product quantities, customer ledgers, exports/print, columns, search, language and authentication unchanged. Draft PR only; no merge, deploy or backend edits.
