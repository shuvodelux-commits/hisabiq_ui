# HisabIQ — responsive filters, toolbars and always-reachable row actions

**Approved:** 2026-11-05 (mobile Daybook review; approved tablet follow-up).
**Implementation exemplar:** `src/components/daybook/DaybookFilters.tsx`, `src/pages/Daybook.tsx`, `src/components/layout/ActionMenu.tsx`.
**Source of truth:** `docs/ui/UI-REFINEMENT-RULES.md`, `docs/design/taste.md`.
**Status:** mandatory UI-refinement acceptance pattern for eligible HisabIQ table, history, report and ledger modules. **Do not mass-edit modules.** Apply during each separately scoped and approved draft PR.

## Responsive layout contract

| Width | Primary filter bar order | Secondary filters | Row-action behavior |
| --- | --- | --- | --- |
| **320–767px (phone)** | Row 1: **Search → square Filter**. Row 2: **Date/date range** (if applicable) | Collapsed by default, opened by Filter icon; all choices and Reset remain | **`⋮` always visible** at right with no sideways scroll; compact key columns and a preserved full reference |
| **768–1023px (tablet)** | **Search → Date/date range → square Filter**, on **one horizontal line** | Collapsed by default, opened by Filter icon | Rightmost `⋮` always reachable without sideways scrolling |
| **1024px+ (desktop)** | **Search → Date/date range**, on one line; no redundant right-side text | Existing full filter controls visible; Filter icon hidden | Retain approved rich desktop table columns and row menu |

For a module without a date selector, omit only the date control; never invent a date requirement. Respect existing module-specific selections, URL state, and authorization. If a third visible toolbar control (e.g. view switch) has a specific approved location, preserve it and test the available width.

## Layout and interaction rules

- Use compact **36×36px**, **0.375rem-radius** outlined icon controls, existing Lucide glyphs, and HisabIQ Ink/Teal tokens. A Filter button has a useful English/Bangla accessible name, `aria-expanded`, `aria-controls`, and a subtle active-filter marker while selections apply.
- **Preserve keyboard focus order** as rendered: phone Search → Filter → Date, tablet Search → Date → Filter, desktop Search → Date. Responsive conditional rendering or breakpoint-specific visible controls may be required; CSS `order` alone must not make tab order contradict visual order. Never leave two visible Filter buttons.
- Keep the search input keyboard focusable, date/calendar usable, filters intact and active after collapsing, and reset behavior unchanged. Do not lose a selected filter on hide or resize.
- Do not repeat a date-mode helper such as **"Transaction Date · যে তারিখের লেনদেন"** beside the date control when top tabs or the control already make the selected date mode explicit. Keep an accessible name and any genuinely necessary helper.
- Reuse the standard `ActionMenu`/`FloatingPanel` for table/ledger rows. Sticky-right or responsive compact tables must keep a 36px `⋮` **inside the viewport without horizontal scrolling**, with valid popover positioning, Escape focus return, and full commands/permissions.
- Keep *complete transaction references* (e.g. `EXP-000062`, `CP-000091`) readable in mobile tables; wrap non-critical type/party strings rather than overlapping or clipping IDs. Desktop should retain all original columns.
- Co-locate **Settings** with existing toolbar actions (e.g. beside Print) when that position has been approved for a module, rather than creating a separate mostly-empty row. Preserve the original settings component and avoid duplicates. This is a per-module opt-in; do not change unrelated header consumers without a design review.
- Maintain bilingual English/Bangla text, touch targets, contrast, keyboard support, reduced motion, dark mode and 320px minimum width. Avoid duplicating page helper text or removing transaction information.

## Per-module refinement checklist

For each future module with search/date/filter/table elements:

1. Inspect the existing source and actual screenshots before writing code. Keep the module's routes, permission rules, transaction logic, print/export, state and filters unchanged.
2. Identify whether it has primary Search, Date, secondary filters, and per-row actions. Map them to the table above; omit controls the module does not have.
3. Add focused Playwright assertions **before the fix**, checking visible order, single-line tablet geometry, *keyboard Tab order*, one visible Filter button, collapsed/expanded states, no redundant date helper, row `⋮` viewport reachability, complete transaction references, and protected actions.
4. Capture **both light/dark at 320, 390, 768, 1024, 1440px**, plus a tablet interior width such as **820px** for interactions. Capture default, expanded Filter, and **open row menu** states; screenshots of closed elements are insufficient.
5. Run `/ui-refine-loop` GitHub-only C0 baseline → bounded C1–C3 fixes → C4 closing review, lint, types, tests, build, the official pinned Impeccable source detector, and Playwright comparisons. Record all actual failures and passes in the `docs/ui-refine/<module>/ledger.md`.
6. Inspect the real images for layout gaps, 320px clipping, overlapping labels and actions, empty rows, visual hierarchy and light/dark readability. Resolve actionable regressions; do not invent checks or model scores.
7. Keep the module's draft PR **unmerged** until explicitly approved. Repeat one module at a time; examples include Sales, Purchases, Parties, Products, Finance and Reports, but no other module is modified by this documentation.

## Daybook acceptance evidence

- The approved Daybook tablet order is Search (1), Date (2), square Filter (3).
- Daybook's date-mode toggle in the page header remains; its former trailing in-filter-bar helper was redundant and is removed.
- The Daybook 3-dot row menu remains reachable on narrow phones, and the same menu actions and source links are retained.
- Focused test: `scripts/daybook-mobile-layout-browser.cjs`.
- PR: [#252](https://github.com/shuvodelux-commits/hisabiq_ui/pull/252) (draft until separately approved).

This is a UI contract for future refinements, **not authorization** to rewrite every module or to change posting and accounting behavior.
