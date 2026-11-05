# Sales invoice list — Daybook-approved compact refinement

**Target route:** `#/app/sales` (verified in `src/App.tsx`).
**Scope:** `src/pages/Sales.tsx`, `src/components/sales/SalesMobileLayout.tsx`, `src/components/sales/SalesWideToolbar.tsx`, their focused UI tests and this review ledger.

## Owner direction (2026-11-05)
The refined Daybook is the approved model for dense yet calm HisabIQ module UIs. Apply its compact filter/actions alignment and no-wasted-row Reset pattern to the **Sales invoice list** without rebuilding or restyling the rest of Sales. References: Daybook PR #252 and `docs/ui/RESPONSIVE-FILTER-ACTION-PATTERN.md` on that PR branch.

## Observed Sales differences (source inspection)
- Sales has search + Customer/Status/Payment filters, but no date selector in this toolbar. Do not invent one.
- Current phone Filter button is text-wide and shares a row with list actions; its Clear filters sits in a separate results row.
- Current wide layout collapses the advanced filter controls and has no direct compact Reset next to Status.
- Row actions are owned by `InvoiceActions`; retain every command, permission and footer placement.

## Acceptance
1. Phone: searchable, compact toolbar with a single 36px square Filter icon aligned with the row action's right edge where geometrically possible. Keep Column preferences and Export accessible, and keep result count visible.
2. Tablet: avoid wrapping or redundant bars; maintain search, filter and list actions.
3. Desktop: efficient search and dropdown layout with no wasted Reset row; protect original columns and table density.
4. Group Status + 36px outlined RotateCcw Reset icon in the same horizontal row across responsive states. Reset must clear query, customer, payment and status; preserve result count and keyboard access. The existing no-results Clear filters may remain as a recovery action.
5. Keep original Sales previews, returns, payments, drafts/templates, column settings, export, permissions, route state, Bangla/English, dark mode, responsive views and accounting behavior.
6. Run independent GitHub PR Fast CI and real Playwright light/dark screenshots at 320/390/768/820/1024/1440, including open filters and invoice actions. Use the official pinned Impeccable **source detector**, and record outcomes without inventing agent scores.

GitHub-only ChatGPT-led C0–C4 refinement; no original parallel model agents, no merge or deploy without owner approval.
