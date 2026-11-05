# Audit Ledger — Daybook filter and Action compactness: GitHub-only C0–C4 review

**Route:** `#/app/audit-ledger`. **Approved source reference:** Daybook PR #252 (merged) and `src/components/daybook/DaybookFilters.tsx`. **This PR:** #259. **Mode:** GitHub-only ChatGPT-led UI check, with official pinned Impeccable mechanical source detector. The native independently staffed `/ui-refine-loop` was not run; no /40 agent score is claimed.

## C0 — baseline and issues
- Existing `src/components/audit/AuditFilters.tsx` displayed Search/Date and redundant Date mode helper, with always-visible Source/Status, a **text More filters** button, a text Reset, then additional dropdowns.
- The Audit Ledger header already has the actual Transaction Date / Created Date control.
- On 320px in the captured baseline, the eleven-column table's sticky right Action obscured the primary reference to fragments. The original data and full reference stayed available via row detail, but were visually truncated.
- Protected sources: `AuditLedger.tsx` state/actions, correction and delete preview permission checks, original seven filter fields, reporting/export, date mode and transaction values.

## C1 — correct filters and Reset
- Filter toggle uses the same Lucide `Filter` funnel, 36px outlined square, and active-state dot as Daybook. Phone Search → Filter, Date second row; tablet Search → Date → Filter; desktop advanced filters visible without funnel.
- All seven original secondary dropdowns collapse below 1024px and retain applied state. `RotateCcw` Reset directly follows Status on the same row; resets query and every secondary filter, with the original **This month** date preset. Header date-view setting remains unchanged.
- Removed duplicate date mode helper text; date picker retains its localized accessible name.
- Changes use existing shared `AppSelect`, `Button`, `AppDateRangePicker`, icons and token classes.

## C2 — real rendered screenshot finding and repair
- Initial after screenshot at 320px revealed primary references cropped to `INV` and similar due to the original table width. This **P1** was not considered acceptable even though the Action menu remained visible.
- Fixed only the Audit phone table at widths under 768px to use Date / full Reference with subordinate Party and Source / Amount with Status / sticky `⋮`. Source, account, posting and change columns remain present in DOM but visually hidden on phone and remain accessible via full original row details/menu. From 768px, the original rich table is preserved.
- Added `data-audit-full-reference` and Playwright bounds/overflow checks; visually inspected actual 320px after image showing full `INV-000239`, `EXP-000062`, and others, visible ahead of the sticky Action. Expanded filters at 320px show a compact column ending with Status + Reset. At 768px, Search, Date, Filter share a row and full references remain readable.

## C3 — testing and corrections
- New focused `scripts/audit-compact-filters-browser.cjs`: 12 viewport/theme cases at 320/390/768/820/1024/1440px, verifying compact toggles, 36px shape, expanded/collapsed state, complete reference, sticky Action, Reset + Status geometry, keyboard Reset and unchanged Search.
- Updated original `scripts/audit-refine-browser.cjs` to exercise the new approved filter presentation rather than assert obsolete permanently visible dropdowns and text `More filters`. Its Bangla source assertion still checks the preserved values even when that source column is hidden on phone.
- Updated `tests/banglaPhase4Contract.test.ts` to match unchanged serialized `All status`, `Posted`, `Deleted` filter values regardless of literal comma spacing, instead of weakening the data assertion.
- A first screenshot test used nonexistent CSS class `.lucide-filter`, now checks the actual SVG. No data or visual code changed for that test selector.
- Generated `docs/ui/design-system.json` synchronized for Audit `Filter` and `RotateCcw` icon usages.

## C4 — verified outcome
- **Final verified candidate head:** `a9e3683287786fa5414c0e434c437f84215e3f61`.
- [PR Fast CI 41993354783](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41993354783) **SUCCESS:** TypeScript, lint, UI contract/inventory, unit tests, production build, existing Audit correction/refine browser regressions and other selected browser smoke.
- [Automated before/after screenshots + focused Audit Playwright 41993354700](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41993354700) **SUCCESS**, 12 responsive/light-dark focused cases. PNG snapshots cover default and expanded Audit filter states at 320/390/768/1024/1440px. The 820px interior width is tested interactively. Reviewed screenshots of actual unchanged app presentation at code head `996fd3b2a4e9ab479376476775cba4452ade4f10`; the intervening commits only updated regression tests, not UI source.
- **Impeccable:** Official pinned mechanical source detector in GitHub screenshot workflow, not a parallel AI design reviewer.
- **Grades:** A01 Funnel Filter rather than text button **fixed**; A02 status-adjacent icon Reset **fixed**; A03 phone/tablet/desktop layout **fixed**; A04 full primary phone reference + reachable Action **fixed**; A05 existing seven filters and date state **preserved**; A06 finance/audit correction and posting **untouched**.
- **Scope limitation:** Static screenshots alone do not prove animations or all possible Bangla data lengths; no new product/business rules or backends were changed.

**Stop reason:** Final focused and broad gates green; no supported P0/P1 for this bounded scope. Leave PR **draft/unmerged** for owner review. No deploy.
