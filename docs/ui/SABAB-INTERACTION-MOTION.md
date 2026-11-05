# HisabIQ — Sabab SIS Interaction Motion Standard

Source reference: Sabab SIS Magic Patterns artifact `0fdd761a-0c9e-4e22-9d6b-4fb248e73b14` in [the Sabab design](https://www.magicpatterns.com/c/kecprgln6zfkctsc37g2to). Checked `utils/motion.ts`, `components/layout/AppShell.tsx`, `components/common/Segmented.tsx`, `components/common/RowActions.tsx`, and `components/common/Popover.tsx`. The Sabab `components/ui/Select.tsx` and `Switch.tsx` artifact files were empty: don't claim their implementation was copied.

## When to animate
- **Every shared theme-aware dropdown:** `AppSelect` and its `FormSelect` adapter use opacity + 0.97-to-1 scale + 4px rise (140ms). `SearchSelect`, `QuickAddSelect`, and `FloatingPanel` already animate; avoid animating them twice.
- **Date dropdown/calendar popups:** `AppDateRangePicker`, `AppDatePicker`, `AppMonthYearPicker` use the same popup motion and retain viewport fitting, keyboard date control and original selected values.
- **Shared on/off switches:** `src/components/Switch.tsx` retains a real focusable checkbox, checked/onCheckedChange/onChange, defaultChecked, disabled, labelling, and both 32px/24px track sizes. Thumb glides with Sabab-derived spring stiffness 520, damping 38, mass .7; controlled and uncontrolled switches should behave identically to existing implementation.
- **Segmented switches:** Daybook Transaction/Created Date switch and shared Products SegmentedControl use the Sabab selected-thumb `layoutId` spring with arrow/Home/End navigation where supported. Preserve existing typography and modules' real choices.
- **Advanced filter reveals:** animate opacity and 4px reveal (180ms in, 120ms out) while preserving the toggle's `aria-controls`, filter state, focus and responsive desktop-visible behavior. Begin with Daybook, adopt in other modules only after evaluating their existing implementation.
- **Module entry:** ERP AppShell uses the Sabab 10px rise and 280ms fade, keyed by top-level module path; **not** on every URL search or tab query change.
- **Reduced motion:** for `prefers-reduced-motion: reduce`, remove positional travel and make reveal/open transitions instant; no flashing, no delayed access to controls.

## Safety / UX constraints
1. Never animate financial values, account calculations, invoice rows or table layout, and never delay a payment/save/reversal confirmation.
2. Animate transform/opacity only. Never animate dropdown height, width or sticky column geometry; viewport clamping takes priority over effects.
3. Preserve role=combobox/listbox/option, role=switch on settings proxy, button focus return, Escape, Enter/Space, pointer and keyboard selection, both Bangla and English.
4. Keep original HisabIQ token colors, 36px field controls, shared border radius, dark theme and proportional numeric typography. Motion is enhancement, not redesign.
5. Never wrap an already-animated popup with a second transition or introduce a second global navigation animation.
6. Native browser `<select>` popup animations cannot be guaranteed. Use the app's existing shared theme-aware selects rather than substituting a new library without reviewing API and accessibility.
7. A one-off custom popup/switch outside these shared primitives needs its own source and regression review before claiming global coverage.

## Required test matrix
- At 320/390/768/1024/1440px with light/dark, check popup viewport bounds, no scroll overflow, status/Reset positions, role semantics, Tab/Arrow/Enter/Escape, reduced motion and focus return.
- Observe **real intermediary frames** with normal motion; in reduced mode, no transform travel or opacity flashing. Static screenshots cannot prove timing.
- Check creation/edit/selection does not alter business logic and settings toggles can be switched back without posting or saving changes.
- Run TypeScript, lint, design inventory contract, unit suite, Vite production build, focused Playwright, and prior Daybook/Sales/Products tests. Record findings and stop at a safe draft PR.

**Current source milestone:** this document accompanies the global shared-control change in PR #260. It does not assert every custom dropdown implementation in every third-party or future module was individually modified.
