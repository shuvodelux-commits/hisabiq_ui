# HisabIQ mobile navigation drawer — scoped refine brief

**Route for baseline:** `#/app/dashboard`
**Primary source:** `src/components/layout/TopBar.tsx`
**Regression test:** `scripts/sidebar-interaction-browser.cjs`
**Source of truth:** GitHub `main`, base commit `97638b268ca02a6e432e853c653ff0fc8de8040e`.
**Reference:** Sabab School SIS animated drawer, used only as an interaction reference.

## Goal

Make the mobile ERP navigation open and close smoothly without changing the established HisabIQ UI, its controls, hierarchy, bilingual labels, module ordering or any business functionality.

## Protected behavior

- Existing sidebar menu `ErpNavMenu`; desktop sidebar unaffected.
- Keyboard Escape closes the drawer, focus returns to the trigger and Tab focus is contained while open.
- Background body scrolling remains locked while the drawer is open.
- Navigation and change to desktop close the mobile drawer.
- Mobile width stays `min(87vw, 320px)`; all phone and tablet breakpoints retain the current design.
- Bangla, English, light/dark mode and cash/transaction behavior unchanged.
- Existing `MOTION_MS.sidebar` and `MOTION_EASE` tokens apply; reduced-motion users see no animation.

## Acceptance

1. Drawer opens and closes with a subtle 220ms slide + overlay fade, using existing Framer Motion dependency.
2. `prefers-reduced-motion: reduce` removes transition durations.
3. Existing keyboard, touch, focus, Escape and scroll-lock behavior stays intact.
4. No new horizontal overflow at 320/390/768/1024 and 1440px; light and dark modes remain readable.
5. GitHub CI: TypeScript, ESLint, UI contract, unit tests, build and sidebar Playwright regression.
6. Automatic C0 main vs PR screenshots and official Impeccable source-detector results examined; module-open state separately tested.
7. Draft PR remains unmerged pending owner approval.

## Review evidence

Use `.github/skills/github-only-ui-refine/THREE-ROUND-PROTOCOL.md` for C0, C1–C3, C4 and an evidence ledger. Do not invent screenshots, run status or design scores. The default dashboard screenshot shows the drawer **closed**; only a separate opened-drawer browser test/screenshot can establish the drawer's visual behavior.
