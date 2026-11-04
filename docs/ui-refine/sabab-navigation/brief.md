# HisabIQ navigation — direct Sabab port / UI-refine-loop

**Source (exact):** Magic Patterns Sabab SIS editor `kecprgln6zfkctsc37g2to`, artifact `0fdd761a-0c9e-4e22-9d6b-4fb248e73b14`, files `components/layout/{NavTree,Sidebar,TopBar,TopNavStrip,MobileDrawer,AppShell}.tsx`, `utils/motion.ts`, `data/navigation.ts`.
**Target:** `#/app/dashboard` and all `#/app/*` ERP navigation surfaces.
**Source of truth:** GitHub `shuvodelux-commits/hisabiq_ui` current main. No other local source.

## Approved owner direction

Directly port Sabab's **navigation presentation and exact motion**, not an invented visual concept:
- desktop group-labelled sidebar with **active-only** child sublinks and 0.18s Framer Motion selection;
- top horizontal swipeable module strip at below-lg widths, edge arrows, arrow-chevron submenu and viewport-clamped Framer Motion popover;
- mobile sidebar **spring 380/40/0.9**, backdrop **fade 0.22s**, swipe-close threshold -80px or velocity -400px/s;
- simple top row: search, New Sale shortcut, theme, calculator, notifications, account;
- preserve existing HisabIQ logo, Ink/Teal tokens, 36px controls, 0.375rem button radius, Geist/Hind Siliguri, role-permitted nav, route/query-based tabs, bilingual labels, Ctrl+B and Ctrl+K, global search behavior and all transaction logic.

## Exclusions

Do not copy Sabab's school-specific roles, permissions, academic data, prototype toasts or page transitions. Do not copy the screenshots' clipping/truncated titles. No backend/accounting changes. No new animation library.

## Acceptance

1. New desktop side nav and mobile/tablet top strip mirror Sabab navigation patterns.
2. Every navigation target derives from existing `erpNavigation` and passes `getVisibleNavigation/resolveNavLocation` checks; no inaccessible route links.
3. At 320/390/768/1024/1440px and light/dark: no horizontal overflow, popover clipping or disappearing actions.
4. Keyboard, touch, hover, Escape, outside click, Tab, focus return, Ctrl+B, Ctrl+K, route transitions, and the spring/overlay exit verified.
5. Write failing regression tests first; run TypeScript, lint, UI contract, unit, build and navigation Playwright tests. `/ui-refine-loop` three rounds C1-C3 + C4 when evidence is available; never claim unperformed rounds.
6. GitHub PR-only with automatic Playwright screenshots in default and navigation-open states; official Impeccable detector; published ledger with actual evidence.
7. Draft PR. Owner approves merge, one module at a time.
