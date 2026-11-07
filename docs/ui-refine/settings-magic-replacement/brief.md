# Settings UI replacement — Magic Patterns source-first brief

## Approval and reference
Owner request (2026-11-07): replace the existing HisabIQ ERP Settings UI with the exact source design from https://www.magicpatterns.com/c/t6q3mxi6nhuak3qjvx8cwn — **do not redesign**.
Latest editor artifact at time of inspection: `238f01b4-0e3b-4eda-aac5-6d542fbf85cd`.

Reference source: `pages/SettingsWorkbench.tsx`, `pages/settings/SettingsHome.tsx`, `components/settings/SettingsNav.tsx`, `data/settingsSections.ts`, `data/settingsTasks.ts`, and the settings subcomponents. The 2026-10-02 uploaded starter ZIP is older than the current editor and **not** the replacement source.

## Integration constraints
- The existing GitHub frontend uses HashRouter and `src/settings/TenantSettingsPage.tsx`; the Magic Patterns sample uses BrowserRouter and in-memory Demo/Experience/Security providers.
- Preserve the **approved Magic Patterns Settings layout, typography, navigation and cards**. No new visual design.
- Keep existing GitHub `TenantSettingsProvider`, permission-checked edits, guards for dirty forms, invoice / company / POS settings and support/sales routes. Never replace these with prototype-only fake save/toast logic.
- Keep ERP AppShell, sidebar, header, other modules and backend untouched.
- Adapt references to HashRouter and available Settings sections; identify any sample-only functionality explicitly rather than silently presenting it as live.
- Work only in this branch. Do not merge or deploy without approval.

## Acceptance checks
- Route `#/app/settings` loads the Magic Patterns Settings home, task cards, search and left Settings navigation.
- Section links render existing working controls and persist through TenantSettingsProvider; loading/reloading retain saved settings.
- Dirty-form navigation prompts continue to work.
- English/Bangla, 320/390/768/1024/1440 viewport checks, dark and light, keyboard, focus and touch checks.
- Run `npx tsc --noEmit`, `npm run lint`, `npm run check:ui-contract`, `CI=1 npm test`, `npm run build` and focused Settings Playwright checks.
- GitHub CI screenshot/Impeccable workflow may provide evidence if locally unavailable; do not claim it passed before reviewing results.

## Notes
This is a source-code-driven **replacement**, not a three-round discretionary visual polish. No shared global design-token restyling. Pure prototype state and unsupported screens must not replace the existing working tenant settings.