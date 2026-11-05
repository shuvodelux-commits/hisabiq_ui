# Shared floating panel — Sabab-sourced refine brief

**Route:** `#/app/dashboard` (global header appearance, calculator, notifications, account).
**Target:** `src/components/layout/FloatingPanel.tsx` and focused GitHub Playwright verification.
**Reference:** Magic Patterns Sabab SIS `kecprgln6zfkctsc37g2to`, active artifact `0fdd761a-0c9e-4e22-9d6b-4fb248e73b14`, `components/common/Popover.tsx`, `utils/motion.ts`.
**GitHub:** `shuvodelux-commits/hisabiq_ui`, branching from merged `main` after PR #248.

## Goal
Copy Sabab's purposeful popover motion and reliable one-open-at-a-time behavior into the existing HisabIQ shared FloatingPanel. **Do not change the visible menu structure, labels, workflows, or the approved navigation.** Reuse existing Framer Motion and the HisabIQ Ink/Teal theme.

## Source behavior to port
- Menus animate from `opacity: 0, scale: 0.97, y: -4` (or `y: 4` when flipped upward).
- Entrance `0.14s` with `[0.22,1,0.36,1]`; exit `0.09s`, scale `0.98` with `[0.4,0,1,1]`.
- Reduced-motion disables motion durations. Only one global panel open; opening a second closes the first.
- Escape restores focus to the opener, outside pointer closes, navigation closes, and placement stays clamped to viewport.

## Existing HisabIQ behavior to preserve
- Existing trigger-render API, `role="dialog"`, calculator input and keyboard, clickable notifications, ThemePicker radio states, user account actions, 36px controls, 0.375rem control radius and 12px panel radius, current token-based light/dark palettes, scroll position preservation, bilingual text.
- Existing viewport clamp, upward flip and fixed-position body portal. Do not copy Sabab's school-specific data or convert complex calculator/dialog content into a menu-only role.
- POS V2, purchase, finance, stock and authentication remain untouched.

## Acceptance
1. Playwright red first for popover concurrency + motion metadata; green after scoped implementation.
2. Playwright verifies Appearance/Calculator/Notifications on 320/390/768/1024/1440 and both themes; overlay stays within viewport and offscreen content is scrollable.
3. Opening another panel closes the first; Escape returns focus, outside touch/click closes; menu controls remain actionable.
4. Reduced motion uses 0 durations while normal motion uses source-exact .14/.09s transitions.
5. Automatic screenshots capture before/after **open Appearance and open Calculator**, not dashboard-only states. Impeccable source detector targets FloatingPanel.
6. GitHub checks: TS, lint, UI contract, unit, production build and focused Playwright. Record C0–C4 in evidence ledger, 3 bounded passes with evidence-based stop, no fictional model-agent score.
7. Draft PR remains unmerged pending owner approval. No deploy.
