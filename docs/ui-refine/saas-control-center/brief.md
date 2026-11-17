# SaaS Control Center — ui-refine-loop brief

Target: #/saas/home, with shared Control Center navigation and smoke validation of #/saas/tenants.
Source of truth: GitHub shuvodelux-commits/hisabiq_ui, feature branch feat/magic-saas-control-center, draft PR #278, initial commit 164f9dae. Isolated refinement branch refine/saas-control-center-github-20261109.

## Goal and direction
Same Magic Patterns UI and workflows, cleaner and more reliable; compact and useful on 320/390px Android, tablet and desktop. Preserve all information, search, staff selection, navigation, badges, queue actions and seeded mock-state semantics. No layout redesign, colors or features added. No changes to server/accounting/billing/tenant authorization/persistence/ERP.

## Source scope
- src/magic-saas/components/saas/ControlCenterShell.tsx
- src/magic-saas/components/saas/GlobalSearch.tsx
- src/magic-saas/components/saas/IdentityChip.tsx
- src/magic-saas/pages/saas/home/MyWork.tsx
- SaaS-only display primitives in src/magic-saas/prototype/Ui.tsx and components/saas/SaasBits.tsx strictly for the measured dark-mode contrast issue (outline buttons, panels, metric cards, denial surface). These are not ERP-global primitives.
- Targeted Playwright regression/evidence only; shared application state and business commands protected.

## First-pass audit, baseline C0
P0 CC-01 (confirmed, browser reproduction): navigating directly to #/saas/tenants removes the Control Center navigation and React app. Console reports a React lazy route suspension during synchronous input with no Suspense boundary. Baseline script ran at desktop 1440 and phone 390, light/dark. #/saas/home rendered without page errors; #/saas/tenants failed identically in both themes. Existing PR #278 CI browser test also failed waiting for Control Center navigation.
P1 CC-02 (inspect, not yet fixed): horizontal SaaS navigation at 390px is scrollable, but its overflow affordance and keyboard reach require validation.
P2 CC-03 (inspect, not yet fixed): long task names and verbose action labels compress at 390px; check 320px and text/action collision before editing.
P2 CC-04 (inspect, not yet fixed): dark mode, 36px controls, focus, reduced motion, keyboard search/clear need measured checks.
P3 CC-05: polish only after behaviors and acceptance checks pass.

## Real test and evidence
- Existing npm run test:saas-magic is failing on PR #278; a captured browser pageerror identifies root cause, not a timing-only selector issue.
- C0 baseline screenshots are in .superpowers/saas-refine/baseline-{home,tenants}-{1440,390}-{light,dark}.png; tenant images are intentionally blank crash evidence.
- Run browser smoke, screenshot comparison at 320/390/768/1024/1440, light/dark, and checks TypeScript, lint, design contract, unit tests, build. Screenshot open controls when possible.
- Official Impeccable detection can be run locally; native Codex runner is unavailable due to usage limit. This pass must be labeled MANUAL fallback, not independent fresh-agent reviews.

## Process and safeguards
Three bounded manual refinement passes (function, responsive/interaction, accessibility/polish) followed by closing review, with no invented score. Commit only green fixes. Draft PR against feature branch, not main. No merge, no deployment.
