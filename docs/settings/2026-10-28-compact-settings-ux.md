# Compact Settings UX

Approved by the user on 28 October 2026 after reviewing the JPG concept. The existing Magic Patterns guide and actual shared components remain the visual authority; the image is a concept, not a pixel specification. This scope is Settings and its embedded module editors.

## Interaction contract

- One named task directory, familiar Lucide line icons and short English/Bangla labels. No Simple/Advanced selector, hidden mode-only controls, employee impersonation selector in the normal header, or generic Advanced bucket. Legacy mode values remain valid in storage and have no visibility effect.
- Desktop keeps the normal ERP shell and a 220px Party-style Settings directory. Small screens open the same directory from a labelled button. Real peer views in documents, employees and data keep underline tabs.
- All existing business fields remain in the typed model. Task groups cover them once; document-design fields delegate to the existing document editor. Shop details are in one form. Product warranty/expiry dependent values remain intact while disabled, with a visible explanation.
- One optional Help action shows field explanations. Labels remain visible; Bangla mode does not repeat English beneath each label. Option translation changes display only, never stored enum values or account names.
- Save and Cancel sit at the end of the form. There is no floating panel obscuring phone fields. Unsaved navigation supports Save and continue / Discard and continue / Keep editing. Changes that need review also require review on Save and continue.
- Keep revision checks, owner/employee permissions, input validation, backup integrity and existing integration consumers. Save failures retain drafts. Personal storage failure must report session-only persistence.
- Financial names are preset-first with an explicit name editor. Account meanings, debit/credit amounts and ledger order stay source-correct. Data tasks separate backup, record files, draft recovery and history. Existing SQL/JSON tools remain available.
- A visible UI-preview entry explains local persistence and disconnected policies. Demo actor selection lives there for permission review. Authentication and SMS remain explicitly previews.

## Actual shared sources

| Element | Source |
| --- | --- |
| Page title, panels | `components/PageHeader.tsx`, `components/Panel.tsx` |
| Inputs, buttons, switches, selects | Existing `components/{Input,Button,Switch,AppSelect}.tsx` through Settings adapters |
| Settings dialogs | Existing `components/Dialog.tsx` family; replaces native Settings dialogs so select/calendar portals remain usable |
| Lock date / date selection | Existing `AppDatePicker` in `components/AppDateRangePicker.tsx`; adds optional connected label, description and disabled props |
| Section/task navigation | `SettingsDirectory.tsx`, existing `SettingsTabs.tsx` and `MotionTabList` |
| Data & document workflows | Existing backup/recovery/activity, financial-name, invoice/output-design, employee and security editors |

No new component, icon or motion dependency. No cart/picker/payment changes. Controls stay 36px; existing Products table roles remain 13/12/11. The user-approved Settings rule takes precedence over older generic Advanced guidance.

## Acceptance evidence

`tests/settingsExperience.test.ts` protects complete field coverage, section-specific dependencies and stable option values. Existing settings model, RBAC, migration and document tests remain applicable.

`test:settings-compact` checks all 13 sections at 1440px Bangla/light, 390px Bangla/light and 768px bilingual/dark, legacy Simple/Advanced stored preferences, 36px controls, no page overflow, save/cancel/reload, invalid input, field search, dependent controls, guarded review and read-only permissions. `test:settings-responsive` uses this suite because the former scrollable section-tab strip was removed.

The existing broad Settings browser suite retains POS/product integration, employee/role changes, last-owner protection, JSON restore/import preview, stale tabs and unavailable browser storage. Library tests retain date controls, employee filters/columns, activity and encrypted SQL recovery. These tests verify preview behavior, not authenticated backend posting.

## Validation and authority notes — 28 October 2026

This is an ordinary extension of the existing HisabIQ/Magic Patterns visual system. `docs/ui/HISABIQ-DESIGN-GUIDE.md` chapter 29 contains the approved scoped Settings override; it and the actual shared sources above remain authoritative. No tokens, component families or visual identity were replaced, and no competing `DESIGN.md` or design sidecar was introduced. Earlier Settings navigation notes describe prior implementations; this contract and chapter 29 govern the compact directory.

Validation passed: 786 unit tests, TypeScript, production build, UI contract guard and design-guide generator `--check`; the broad Settings browser suite covered 49 states. The compact suite covered all 13 sections across the three viewport/language/theme combinations above, including legacy stored modes and Bangla backup password/error/restore copy and role permission/review/action copy while preserving permission codes. Settings library (including SQL recovery and employee filters), hub, redesign domains/navigation guards/print, and auth-settings browser checks also passed. Evidence is recorded under `.impeccable/review/`.

The finish review's initial visual sample covered the Shop screens. Its final ship verdict explicitly covers the two corrected Bangla-copy findings in backup/restore and role review; it is not whole-ERP certification. The detector reported no findings. These checks establish the tested local UI-preview behavior only.
