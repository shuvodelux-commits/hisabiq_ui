# HisabIQ Settings — **FULL Magic Patterns UI replacement (UI-first)**

## Authoritative instruction — supersedes earlier partial migration approach
**Owner correction (7 November 2026):** Copy and replace the **entire** existing HisabIQ Settings UI with the approved Magic Patterns design **first**. Only **after the complete visual replacement** should production-specific actions, validation, permission checks and tenant persistence be reconnected.

- Approved Magic editor: https://www.magicpatterns.com/c/t6q3mxi6nhuak3qjvx8cwn
- Pinned active source artifact: `238f01b4-0e3b-4eda-aac5-6d542fbf85cd`
- GitHub: `shuvodelux-commits/hisabiq_ui`, Draft PR #272
- Do not substitute the older 2026-10-02 `magic-patterns.zip` for the current editor source.
- **Visual authority:** Magic Patterns. **Integration authority (later phase):** HisabIQ's data model/security/validation.
- No redesign, polishing, simplifying, rearranging, or retrofitting the Magic UI to preserve old Settings forms.
- Do not reintroduce old Settings forms into the new UI. Necessary business logic will connect through *headless hooks/adapters* after UI replacement.

## Phase 1 — complete UI copy and route replacement (first, no production reconnection)
1. Read and inventory the source files for `SettingsWorkbench`, `SettingsHome`, `SettingsNav`, `GeneralSettingsSection`, `SaveBar`, `SettingCard`, all specialized Settings screens and shared styling.
2. Copy the source layout, visual hierarchy, content arrangement, interactive controls, tabs, modals, tables, previews, selected/empty/disabled/loading states and responsive layouts **for every source Settings route**.
3. Keep the existing React/TypeScript app, app shell, HashRouter and route paths. Replace only the Settings **rendered UI**. Do not rewrite unrelated ERP modules.
4. Make all preview-only controls clearly distinguishable from real actions until connected. **No pretend save, server operations, fake OTP/PIN, real SMS, destructive restore, tenant switching or session revocation.** UI-local interactions may demonstrate draft states; never imply that an external mutation succeeded.
5. Use all UI source controls even where HisabIQ has no existing setting. **Do not disable or remove them just because they lack a backend mapping**; display the intended Magic UI interactions without operational claims, and log their connector requirements. Disable *only actions whose execution would falsely signal a completed or security-sensitive change*.
6. Hide the old Settings presentation (including nested legacy panels) from every replaced route; do **not** drop old tenant/business logic/data in this phase. Retain it separately for later headless adapters.
7. Match the approved source in light/dark and 320, 390, 768, 1024, 1440px screenshots. Source visual parity, not comparison against the old HisabIQ Settings UI, is the acceptance gate.

### Page-by-page inventory (all are in the source)
**GeneralSettingsSection:** Business profile; Names & Khata; Sales & POS; Products & stock; Purchases; Money & accounts; Notifications & SMS; Personal preferences; Account & security.

**Dedicated pages/components:** Settings home, search, setup tasks/wizard and left navigation; Interface & workflows; Invoice Studio and document numbering; Users & roles; Data & backup; Logged-in devices; Staff activity; Offline selling; Support; Plan & billing. Include their source dialogs, previews and empty states.

| Original Magic source | Visual route/component |
|---|---|
| `pages/SettingsWorkbench.tsx` | Entire Settings shell / all route selection |
| `pages/settings/SettingsHome.tsx`, `data/settingsTasks.ts`, `components/settings/SetupWizard.tsx` | Home, task search and guided setup |
| `components/settings/SettingsNav.tsx`, `data/settingsSections.ts` | Navigation, labels, section order and fields |
| `components/settings/GeneralSettingsSection.tsx` | Full generic form UI, source fields, advanced fields and preview behavior |
| `components/settings/SaveBar.tsx`, `SettingCard.tsx`, `KhataPreview.tsx` | Draft toolbar, card chrome, Khata preview |
| `components/settings/invoice/InvoiceStudio.tsx`, `DesignGallery.tsx` | Full source invoice designs and preview interactions |
| `components/settings/InterfaceSettings.tsx` (+ selectors/previews) | Interface page and all subcontrols |
| `components/settings/TeamSettings.tsx` | Complete team tables, role views and dialogs |
| `components/settings/DataSettings.tsx` | Tabs, import/restore/backup visual workflows |
| `pages/settings/SessionsPage.tsx`, `ActivityPage.tsx`, `OfflinePage.tsx` | Dedicated security/offline UI |
| `components/settings/PlanSettings.tsx` and support source | Billing / support UI |

**Phase-1 pass requires every route above**, not a few screens wrapped around the legacy forms. No per-module "source-inspired" substitutes.

## Phase 2 — reconnect HisabIQ functionality (only after Phase 1 visual sign-off)
Use thin headless adapters for:
- `TenantSettingsProvider` reads, optimistic drafts, save/review/discard and concurrency control
- RBAC and owner permissions, sessions, activity audit and trusted/offline device authorization
- Business details and branding; VAT/regional preferences; POS/stock/purchase policy
- Invoice renderer, numbering and print; report configuration; backup/import/restore and security checks
- SMS, subscription, employee management and server-backed flows

Where a Magic UI control has no business implementation, **record a functionality gap to implement**. Do **not** suppress that piece of the approved UI or call it unrelated.

## Current PR #272 status — NOT YET ACCEPTED
The 49 previous commits primarily migrated the outer Settings shell and a few inner panels while leaving many existing HisabIQ forms in place. Their CI results validate code stability **but do not certify full Magic visual parity**. Earlier phrases such as "Business Profile complete", "Sales & POS complete" and "Invoices complete" describe partial integration passes only and **must not be used as Phase-1 acceptance evidence**.

Acceptance gate: **zero old Settings JSX rendered** across the source routes; every Magic source page represented, verified responsive, screenshot-reviewed, and no fake functional claims. Only then begin functionality reconnection.

## Operational constraints
Work in GitHub Draft PR #272. No merge, deploy, backend changes or production auth/financial mutations without explicit approval. Run TypeScript, ESLint, UI contract, unit, production build and Settings browser tests; treat checks against obsolete old Settings layouts as migration tests requiring revision, not as authority to retain those layouts.
