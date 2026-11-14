# MOD-001 #549 — Connected-only Settings route security design and execution

> **For agentic workers:** use the approved Super Build ChatGPT-assisted workflow, test first, preserve Magic Patterns preview UI. This page is the accepted design and execution checklist for GitHub #549.

**Goal:** Permit verified signed-in tenants to access only real Business Settings and Users/Roles from the existing React workspace, without mounting preview AppShell or any unintegrated ERP.

**Architecture:** Use one connected-only branch of the existing /app route, selected by integrationMode. This branch renders an isolated TenantSettingsProvider and a restricted navigation directly into the existing Magic Business and Team components. Preview mode retains the original ConnectedWorkspaceGate→AppShell route and all legacy navigation unchanged.

**Tech:** React 18, React Router HashRouter, SessionProvider and /me permissions, NestSherERP V1 Settings/Users/Roles, Vite, Chromium/Playwright and disposable PostgreSQL 16.

**Source pins:** frontend main 4a8c5bfc27aa18ebfbf52046d3ee63e70c938cad; backend adoption 476cefcdecad55873ee33bd182f12943fb4b1127. Re-pin if source changes.

## Scope and constraints

- **REUSE** SessionProvider, TenantSettingsProvider, Magic GeneralSettingsSection and Magic TeamSettings. These already use server-owned GETs, grant checks, epoch guards and abortable reads.
- **ADAPT** only src/App.tsx so connected /app renders the new safe boundary, while all preview paths still mount original AppShell. Use route path checking, never match a generic business URL to a preview page.
- **BUILD** src/integration/ConnectedSettingsWorkspace.tsx: verified authenticated identity, fail-closed permission checks, safe navigation restricted to business/team, existing source controls, clear unavailable states for unsupported settings, keyboard access, bilingual labels, no preview backups or fake save actions. Connected-only navigation is approved by owner 2026-11-15.
- **NO CHANGE** to src/settings/TenantSettingsPage.tsx, SettingsNav.tsx, AppShell.tsx, backend, API contracts, DB or global router guard; preserve their preview behavior and existing layout. No CashSessionProvider is mounted in connected mode.
- **GENERATED OUTPUTS ONLY:** docs/ui/design-system.json and src/data/designGuide.json must be synchronized after introducing one new TSX component; the existing checked-in generator produces +1 component inventory entry. No source redesign or manual edits to those outputs. Required to pass the UI contract; recorded in #549 before generation.
- **BLOCK** preview dashboard, POS, finance, purchases, stock, subscriptions, SaaS and any /app route not explicitly allowed. Do not authorize by preview actorId or canManage().
- **WARN/DO NOT ASSUME** 3-second /me watcher production cadence is approved. Server permission checks are the authoritative security barrier. Real background-tab/throttle timing has no hard guarantee.
- Each production or browser check is distinct from CI's mock-only acceptance. Do not call any mock-only check "real two-tenant QA".
- Draft PR only. No merge or deployment. Independent reviewer and remaining #560/#574/#548 release gates apply.

## Test-first task checklist

- [ ] Commit failing new scripts/mod001-connected-settings-route-browser.cjs, checking the actual route isolation, only supported navigation, permission guards and mounted browser without a session.
- [ ] Observe RED on the exact approved main SHA.
- [ ] Implement connected-only branch of /app in src/App.tsx.
- [ ] Implement approved safe connected-only navigation, server-snapshot/permission handling and existing Magic components in src/integration/ConnectedSettingsWorkspace.tsx.
- [ ] Verify GREEN: TypeScript, lint, UI contract, full npm test, production build, targeted browser checks and existing preview Settings/Auth.
- [ ] Run actual React→Nest→fresh PostgreSQL16 with A/B authenticated tenants and revoked restricted staff; prove RLS, zero preview data, no cross-tenant reads and fail-closed routes. Mark BLOCKED if unavailable.
- [ ] Run ChatGPT-assisted Super Build prepare→verify→finalize against exact GitHub head and allowlist.
- [ ] Open draft PR under #549 and obtain independent QA/security review. Never merge or deploy without separate approval.

## Review focus

1. An authenticated staff member lacking Settings grants must never see business fields or team rows.
2. A remote role revoke or tenant switch must invalidate an already-mounted page and held GET.
3. Disconnected/locked/offline sessions must not reuse preview business names or cached users.
4. Unsupported settings and ERP URLs must never mount AppShell, CashSessionProvider, navigation or fixture data.
5. Focus, 320px/390px/1440px, Bangla helper labels and unsaved draft navigation must remain usable.
