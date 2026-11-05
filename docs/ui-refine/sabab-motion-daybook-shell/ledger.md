# Sabab motion — Daybook + shared ERP controls: C0–C4 evidence ledger

**Reference:** Sabab SIS Magic Patterns editor kecprgln6zfkctsc37g2to, artifact 0fdd761a-0c9e-4e22-9d6b-4fb248e73b14. Actual inspected files: `utils/motion.ts`, `components/layout/AppShell.tsx`, `components/common/Segmented.tsx`, `components/common/RowActions.tsx`, `components/common/Popover.tsx`. Sabab `components/ui/Select.tsx` and `Switch.tsx` contain no source; this implementation uses observed Sabab motion vocabulary, not a falsely claimed direct copy.

**Repo:** shuvodelux-commits/hisabiq_ui. **PR:** #260. **Source of truth:** GitHub. **Verification app HEAD:** `390f474e1580fe5aa1e8c7f014fda5c41ca3cd2a`.

## C0 — baseline
- Daybook advanced filter section toggled abruptly with CSS `hidden/grid`.
- Daybook Transaction Date / Created Date used immediate active-background switching.
- Shared `AppSelect`, `AppDateRangePicker`, `AppMonthYearPicker` opened without an entrance/exit effect.
- Design-system `Switch` thumb used a basic CSS transform. Product SegmentedControl had instant selection highlights.
- AppShell rendered the module `Outlet` directly without source-matched module entrance.
- Existing `SearchSelect`, `QuickAddSelect`, `FloatingPanel`, sidebar and underline tabs already animated. Their animation was not duplicated.

## C1 — source-aligned motion tokens and Daybook
- Added `src/motion/sababMotion.ts`: source-aligned ease `[.22,1,.36,1]`, 120/180/260ms durations, 10px/280ms module entrance and -4px/180ms filter reveal (120ms exit).
- `AnimatedAdvancedFilters` is a shared, reduced-motion-aware component. Daybook adopts it while maintaining all advanced filter options, status/reset controls, responsive breakpoints and URL-backed filter state.
- AppShell uses a module-keyed entry; search or query changes inside the same module do not restart the animation.
- `AnimatedSegmentedSwitch` uses the same spring from Sabab Segmented: stiffness 520, damping 38, mass .7. It replaces only Daybook's two-option date selector, preserving semantic selected state and keyboard arrows.

## C2 — shared controls ERP-wide
- `AppSelect` uses Sabab-style popup scale/opacity/4px movement for `AppSelect` and `FormSelect` consumers.
- The real calendars `AppDateRangePicker`, `AppDatePicker`, `AppMonthYearPicker` animate popup entrance/exit without changing internal date selection logic or viewport positioning.
- Shared `Switch` retains native checkbox input, label, controlled/uncontrolled checked, callback contracts, names and both track sizes; thumb moves with the same spring. Settings, VAT and Products Switch consumers use it.
- Products SegmentedControl shares the Sabab spring thumb, so Product/Service and other existing segmented options gain smooth selected-state travel without altered values.
- Already-animated menus and SearchSelect/QuickAddSelect are left unchanged. Native OS select popups and one-off custom controls outside the inspected primitives are not claimed to have been modified.
- Generated `docs/ui/design-system.json` and `src/data/designGuide.json` synchronized.

## C3 — real interaction checks
- `scripts/sabab-motion-daybook-browser.cjs`: **10/10 cases passed** at 320/390/768/1024/1440px, two themes, checking actual intermediary frames for filter reveal and module entrance, plus zero positional motion in reduced-motion mode.
- `scripts/sabab-shared-controls-browser.cjs`: **5/5 cases passed** at 320/390/768/1024/1440px (light/dark sampled, normal and reduced modes): Daybook date segment, AppSelect popup and Escape focus, calendar Cancel behavior, Settings Switch toggle/restore.
- [Actual screenshot and focused Playwright run 41999455095](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41999455095): **SUCCESS**. Captured 80 real PNGs (40 main, 40 PR) of default/expanded Daybook filters, open Account dropdown and selected Created Date across 320/390/768/1024/1440px light/dark. Actual 320-light dropdown/filter and 768-light dropdown/date screenshots visually reviewed. Static PNGs establish layout, while browser logs establish animation.
- Official pinned Impeccable **mechanical source detector** reported `[]` findings, engine `impeccable-engine 0.1.18`. This is not an independent design agent critique.

## C4 — final outcome
- [PR Fast CI run 41999316858](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41999316858): **SUCCESS**. TypeScript, ESLint, design guide contract, unit suite, production build and repository browser regressions passed.
- **Fixed / verified:** shared dropdown and calendar entrances, 36px switch thumb, Product segmented spring, Daybook date indicator, Daybook filter reveal, ERP module entry, reduced-motion handling.
- **Preserved:** exact business state and API, Daybook/ERP routes, menus, invoice/ledger transactions, localization, Action visibility, field sizing, search, date choice and focus.
- **Scope limitation:** This establishes animation for **shared application primitives** and the scoped Daybook/Products segmented components. It does not certify uninspected third-party/native dropdowns or every one-off module overlay.
- **Process limitation:** GitHub-only, ChatGPT-led review plus real Playwright and the mechanical Impeccable detector; the original independent-agent `/ui-refine-loop` runner was not invoked, so no unsupported scoring.

**Stop:** all target tests and broad CI green; draft PR stays unmerged pending user approval. No deploy, accounting, permission or backend changes.
