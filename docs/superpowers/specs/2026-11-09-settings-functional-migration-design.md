# HisabIQ Settings — Functional Migration Design
**Status:** Proposed for owner review, 2026-11-09. Design only; no product-code changes authorized by this document.

## 1. Intent
Keep the approved compact Magic Patterns Settings presentation and restore **all valuable existing HisabIQ settings functionality**. A control is complete only when it renders, saves, survives reload, affects its documented ERP consumer and—where it is a policy—is enforced at the appropriate boundary. The old Settings UI is a behavior reference, not a screen to bring back wholesale.

This design covers the GitHub-first React/TypeScript + Tailwind/shadcn UI project. It does **not** claim a production backend, real tenant isolation, SMS provider, session revocation, account security or immutable server audit trail.

## 2. Pinned evidence and migration boundary
- Historical functional baseline: `c27f6d724148eab3396af2c446932e736ccdb7f3` (before PR #272), especially `src/settings/TenantSettingsPage.tsx`, `TeamSettings.tsx`, `EmployeeDirectory.tsx`, `DataSettings.tsx`, `SettingsSqlBackup.tsx`, `SettingsActivity.tsx`, `DraftRecovery.tsx`, `DocumentDesignSettings.tsx`, `OutputDesignSettings.tsx` and `FinancialTerminologySettings.tsx`.
- Accepted visual shell on `main` at audit: `e73e83d01f8e6237a7a74ce0a6db72e45d6292f4`; Magic Patterns UI merge PR #272.
- In-flight restoration: [PR #274](https://github.com/shuvodelux-commits/hisabiq_ui/pull/274), head `053f2ceb29fff556eed06461575dc9cbb650e92c`; **OPEN DRAFT, NOT MERGED** when this design was written. It reconnects many ordinary settings fields, POS Guardian/Phone/Address, purchase memo/attachment visibility, legacy module column settings, and older document editors inside the new shell. Review its implementation; do not treat a green CI check as a claim of complete business enforcement.
- Existing project requirements: `docs/settings/final-settings-roadmap.md`, `docs/settings/implementation-status.md`, `docs/settings/README.md`, and `docs/ui-refine/settings-magic-replacement/brief.md`. The Magic replacement brief explicitly separated the UI-first phase from its later functional reconnection.
- The pre-redesign `settingsFields` catalogue has **60 ordinary business fields** across Business, Sales, Products, Purchases, Money, Invoices and Notifications; specialized editors add many more capabilities. This count is the historical catalogue, **not** a count of currently enforced settings.

## 3. Design approaches
1. **Revert to the old Settings screens:** quickest way to regain some behaviors, but discards the approved new navigation and repeats the redesign.
2. **Copy every old form below the new form:** quickest partial patch, but duplicates controls, creates two Save flows and confuses small-shop users.
3. **Selected: Incremental single-source functional migration:** keep the new Settings shell, retain one canonical typed settings provider, adapt old business logic to the new components and remove the corresponding UI-only duplicate when a real adapter is verified. Takes multiple bounded PRs, but preserves correctness, visual consistency and long-term maintainability.

No additional generic settings framework and no second source of truth. Use existing `TenantSettingsProvider`, `settingsFields`, `model.ts` and domain-specific components wherever appropriate.

## 4. Non-negotiable functional contract
Every field or module-specific control has one registry entry identifying:
- Route/group; English/Bangla labels; canonical settings key and scope (personal, business, device, supported record override).
- Permission needed to **view** and **edit**; sensitive financial data requires permission filtering, not merely a hidden column.
- Existing source behavior and exact consumer(s), with source file/function.
- **Five independent statuses:** displayed, editable, persistent, consumed, and enforced (each with automated test evidence). No status inferred from another.
- Honest readiness: `working in browser preview`, `requires backend`, `visual demonstration` or `not supported`. Unconnected policy switches must not imply active enforcement.
- Migration/compatibility behavior, especially if PR #274 has already stored a value.

One saved business setting must have the same result whether reached from central Settings or a module's Settings entry. No duplicated `localStorage` schema or parallel Magic demonstration state for live settings. Domain-specific actions may remain in their existing pages, reached by a compact Settings link.

Changes must not rewrite historical accounting transactions, posted stock movements, previously issued invoice IDs or captured receipt snapshots.

## 5. Workstreams and acceptance criteria

### A. Baseline inventory and PR #274 reconciliation (first gate)
- Produce `docs/settings/functional-migration-matrix.md` listing all 60 ordinary fields **plus** specialized Team, Data, Audit, Recovery, Document, Security, Interface and Finance terminology controls, with the five statuses and exact consumers.
- Rebase/reconcile against the actual current `main` and open PR #274; review its Restore Defaults, revision handling, nested invoices, advanced disclosure, unsaved navigation and permission enforcement.
- For each ordinary field, classify: directly affects a consumer; saved-only preview; intentionally future/backend; or obsolete/duplicate. Unsupported active policy switches must not silently masquerade as working.
- Acceptance: explicit inventory coverage, owner-approved missing-feature priorities, tests for the critical baseline (Settings → save → reload → actual target screen), and no unauthorized merge.

### B. Data & Backup: restore real **settings-only** workflows (first functional delivery)
- Retain the new Data & Backup page layout/tabs. Integrate the proven original **settings JSON export and validated restore**, business-ID matching, section-change review, authorized owner confirmation, revision-conflict rejection and storage-failure feedback.
- Reuse encrypted SQL-format **settings snapshot** import/export from `SettingsSqlBackup.tsx` if compatible with the canonical model. Never execute uploaded SQL or call this a full ERP database backup.
- Show contextual Product/Daybook export links; preserve Product CSV mapping as a clearly named **preview**, not a real import.
- Re-expose `DraftRecovery.tsx` for eligible **session-store sales drafts** with 30-day eligibility, current-session limitation, permissions and no financial posting. Do not imply cross-device recovery.
- Replace Magic simulated restore/reset buttons with real settings-only workflows or explicitly disabled/unavailable states. No bulk business data deletion.
- Acceptance: export → import → review → restore → reload matches expected settings; wrong tenant, malformed/oversized backup, stale revision, unauthorized role and wrong encryption key rejected; transactions/stock unchanged; draft recovery test on supported session store.

### C. Users & Roles: reconnect existing client-side role editor
- Preserve compact Magic Users & Roles cards/table. Adapt existing `TeamSettings.tsx`, `EmployeeDirectory.tsx`, `rbac.ts` and `TenantSettingsProvider` rather than implement a second staff preview store.
- Support employee name/email, active state, multiple roles, role capability grouping, custom roles, permission-impact preview, protected last-active-owner constraint, owner-only grants, assigned-role deletion refusal, search/filter/date/columns and Save/Discard with revision conflicts.
- No actual invitation, password/PIN reset or server access revocation until authenticated backend APIs exist; name them as previews or disable them.
- Acceptance: saved role/employee changes survive reload in this UI, effective client permissions update, no role escalation/last-owner deletion, no client preview falsely claims production security.

### D. Settings history and eligible Recycle Bin
- Show the real `state.events` Settings activity with date/person/section filters; preserve recorded before/after change summaries without leaking secrets.
- Keep broader staff activity distinct: the existing Magic Staff Activity dataset is synthetic. Either label it as a demo or leave it disabled until real business event data exists.
- Surface session-only Sales draft recovery in Data & Backup, not as a promise of permanent deleted-record recovery.
- Acceptance: one successful settings change creates one event; no-op does not create a change event; audit filter shows the actual event; no sample rows counted as real events; sensitive information redacted.

### E. Invoice Studio and output profiles
- Replace the disconnected Magic Invoice Studio draft with an adapter to the existing `sections.invoices` canonical profiles, numbering, document design, receipt rendering and actual supported print path.
- Preserve invoice design features from `DocumentDesignSettings.tsx` and `OutputDesignSettings.tsx`: paper/language, compact/classic/standard, business pad alignment when supported, logo/footer, legal/required content, serial/warranty, signature/terms, margin/offset and separate ledger/report profiles.
- Keep historical immutable snapshots where present; reconstructed copies must be labelled. Do not edit the original issued record.
- Display the current saved profile in preview and generate print using the same profile, with real A4/80 mm/58 mm limitations clearly surfaced.
- Acceptance: select/edit → save → reload → same actual invoice/statement rendering; no hidden mandatory amount/reference; Bangla text and multi-unit long names; past invoice untouched.

### F. Real module consumers and policy readiness
- **Sales/POS:** default payment and rounding plus Guardian, Phone and Address visibility; verify barcode availability, shortage policy, discount/price override and return windows without claiming backend authorization.
- **Products:** defaults in Add Product; unit/brand/category canonical editors, serial/warranty/expiry, stock warnings, FIFO/FEFO support only where the stock engine truly supports it.
- **Purchases:** memo and receipt attachments; payment-account default; do not say approval, backdating and cost allocation are enforced unless the actual create/edit/return path blocks or computes them correctly.
- **Money/Finance:** account defaults, cash session visibility/closing and adjustment/posting lock; server-enforced locks remain blocked/unavailable until backend.
- **Notifications:** local preference state versus actual in-app event delivery, SMS provider, plan credits and schedule; no fake notification send.
- **Names & Khata/Interface:** keep shared financial terminology/column order; Sales/Products table columns are already connected, broader per-module capability switches are still previews until consumed.
- Acceptance per field: change a toggle or value in central Settings, save, reload, observe corresponding real module behavior; edit from module Settings and confirm same canonical value. Tests include due-sale mandatory identification, multi-unit stock, cashier access and sensitive cost/profit data.

### G. UX consolidation and final verification
- **One design:** current Magic navigation, compact hierarchy, familiar 36px controls and 0.375rem default radius, Geist/Hind Siliguri, bilingual helpers, no monospaced numbers; no wholesale redesign.
- **One editor:** replace demo-only form with canonical form **within** current layout. Avoid keeping one functional form hidden below a misleading demo.
- Restore field-level bilingual search with Advanced expand-and-focus, precise read-only/help labels, explicit Save/Discard/Restore (personal changes may auto-save), screen-specific unsaved navigation guard, keyboard/ESC/focus management.
- Responsive 320, 390, 768, 1024 and 1440px; light/dark; mouse, touch and keyboard. No horizontal overflow or hidden essential actions.
- Preserve component snapshots, title and route aliases, and module Back context.
- Full QA gate: TypeScript, lint, unit tests, transactional accounting tests, Playwright desktop/tablet/phone, screenshots, security review and user visual approval before each squash merge.

## 6. Scope and release decisions
- **In scope now:** honest, reliable **browser-preview** Settings functional parity using existing React state and session stores, with tests and change-review UX.
- **Not delivered by this migration:** authenticated tenant/member isolation, protected network APIs, server-side RBAC, immutable audit logs, actual remote sessions, OTP/PIN storage, SMS sending, database backups, subscription enforcement or cross-device offline authorization. These require separate backend contracts and server acceptance.
- Do not reintroduce demo employee selectors in the primary Settings UI as if they were authenticated users. Preserve permission-check tests without calling browser fixture `t1` secure tenant isolation.
- Do not remove current Magic pages silently: when removing a preview-only control, keep its useful design in the canonical form or mark it unimplemented with a clear reason.
- Do not merge PR #274 or subsequent PRs automatically. Its three passing checks establish build/browser health, not full product completeness.

## 7. Delivery sequence and ownership
**One task/PR at a time, GitHub source of truth.** Each independently testable PR should use Superpowers brainstorming/design (if scope changes), writing-plans, test-driven-development, verification-before-completion, code-review and finishing-a-development-branch. PR template must identify exact Settings field consumers, before/after functionality and screenshots, and distinguish browser-only behavior from server enforcement.

Proposed sequence:
1. Functional migration matrix + review/reconcile PR #274.
2. Restore Data & Backup settings-only export/restore and session Recycle Bin.
3. Restore live client-side Users & Roles and safeguards.
4. Connect actual Settings change history.
5. Canonical invoice/ledger/report profiles in the new Invoice Studio.
6. Remaining module-by-module consumers/policy truth labels in small PRs.
7. Remove duplicate/preview-only Settings editors and finish UX/accessibility + regression acceptance.

**Release condition:** Every legacy valuable control is either (a) working and observed at a real consumer, (b) explicitly identified as backend-dependent/unavailable, or (c) intentionally retired with a documented reason. Visual completion is not functional completion.

## 8. Owner approval gate
This document approves **no code changes** by itself. Confirm the scope/priorities and visual invariants first. Then create the task-level Superpowers implementation plan(s), starting with the matrix/PR #274 review, and only execute approved tasks.
