# PR #274 — Functional Readiness and Code Review
**Review:** 2026-11-09 | **Task:** Task 1 of `docs/superpowers/plans/2026-11-09-settings-migration-inventory-and-pr274-review.md`.

**Immutable comparison:** legacy `c27f6d724148eab3396af2c446932e736ccdb7f3` → new Magic main `e73e83d01f8e6237a7a74ce0a6db72e45d6292f4` → [draft PR #274](https://github.com/shuvodelux-commits/hisabiq_ui/pull/274) head `053f2ceb29fff556eed06461575dc9cbb650e92c` (base `e73e83d01f8e6237a7a74ce0a6db72e45d6292f4`). **PR #274 is not merged.** All conclusions below are specific to these pinned sources, not server or production claims.

## Summary and disposition
**Disposition: repair one confirmed P1 regression before approving PR #274 for merge; keep the new Magic Settings shell.** The PR makes the old provider-backed settings editable again on the Sales, Products, Purchases, Finance and Notifications central routes and restores legacy business/personal/Names interfaces as embedded forms. POS and Purchase real consumers are now verified in browser tests. It does **not** complete the migration, and the remaining security and recovery preview pages must not be passed off as working.

**PR delta:** 8 changed files: `src/settings/magic/LiveSettingsSection.tsx`, `src/settings/TenantSettingsPage.tsx`, `src/components/pos/CheckoutPanel.tsx`, `src/pages/PurchaseEditor.tsx`, `scripts/settings-magic-browser.cjs`, `scripts/auth-settings-browser.cjs`, plus generated `docs/ui/design-system.json` and `src/data/designGuide.json`. The reviewed PR has three passed CI workflows: **PR Fast CI**, **Authentication UI Preview Check**, and **UI refine screenshots for ChatGPT** (the checks prove their own assertions, not domain-wide policy enforcement). Workflow source: [PR #274 checks](https://github.com/shuvodelux-commits/hisabiq_ui/pull/274/checks).

## Axis A — Standards / implementation correctness

### A1 — P1 CONFIRMED: Restoring invoice defaults can make the save impossible after custom prefix
- **Evidence at PR head:** `src/settings/magic/LiveSettingsSection.tsx:72-83` resets nested `numbering.sale.prefix` to `defaults().sections.invoices.prefix`, but does **not** update `draft.prefix`. `src/settings/fields.ts:454-519` exposes 8 invoice fields, **not** the `prefix` key. `src/settings/model.ts:365-369` explicitly requires `numbering.sale.prefix === prefix`.
- **Reproduction:** In the legacy numbering editor change sales invoice prefix from `INV` to `ABC`, save; navigate to `Settings → Invoices` and choose `Restore defaults` on `LiveSettingsSection`, then `Save changes`. Nested prefix becomes `INV` but draft prefix remains `ABC`; save rejects with `Invoice prefix and sales numbering must match.`.
- **Expected:** Restore only fields actually edited by the visible card. Leave hidden numbering/prefix intact; or deliberately reset both fields together in one controlled, clearly previewed operation. Never break document numbering as a side effect of resetting logo/paper/footer.
- **Safe remediation:** Remove the special invoice numbering mutation from this generic restore unless the prefix is a real displayed option; add a red→green regression for customized prefix surviving visible-card Reset, plus explicit old numbering-editor test.
- **Verification status:** Source-logic reproduction confirmed; **not** browser executed in this audit. Must have a targeted automated test before merge.

### A2 — P1 confirmed architectural inconsistency: Two independent invoice editors appear on one page
- **Evidence:** `src/settings/TenantSettingsPage.tsx:1640-1666` renders (1) `MagicInvoiceStudio`, (2) `LiveSettingsSection('invoices')`, (3) expandable legacy `SettingsPageContent('invoices')`. `src/settings/magic/invoice/InvoiceStudio.tsx:23-64` keeps local `draft` and says Save is preview-only. `src/settings/TenantSettingsPage.tsx:1651-1663` exposes provider-backed functional editor below.
- **Impact:** The same business area presents a demo design card and a separate working editor; a shop worker may edit the prominent Studio and not affect the printed invoice. This is clearly labelled a preview, so **not** a false network mutation claim, but it fails the single-editor target.
- **Disposition:** Preserve Magic visual hierarchy and fold canonical invoice design state into it in the dedicated future Invoice Studio task, not a destructive quick rewrite of PR #274.

### A3 — P2 verification gap: Mixed unsaved-navigation guards are not yet proven consistent
- **Evidence:** `src/settings/TenantSettingsPage.tsx:1583-1586` implements the Magic navigation guard for tracked Magic child states; the embedded `SettingsPageContent` also installs document capture, `beforeunload` and history listeners when dirty at `src/settings/TenantSettingsPage.tsx:407-471`. PR #274 mounts embedded forms at `:1610-1611`, `:1637`, `:1663`.
- **Impact:** Both flows should preserve unsaved changes, but no test proves exactly one warning / correct navigation for every embedded editor on click, browser Back and simultaneous nested invoice changes.
- **Required test:** Dirty embedded old invoice-number form → central navigation click → one prompt → Cancel preserves changes; confirmed Leave discards only the intended draft. Repeat Back, then real `LiveSettingsSection` dirty navigation. **Status: unverified risk**, not a confirmed duplicate modal.

### A4 — P2 maintainability: Orphaned preview fallback and repeated save surfaces
- **Evidence:** `TenantSettingsPage.tsx:1615-1624` retains the generic `MagicGeneralSettingsSection` fallback after enumerating the legacy routes and the live adapter routes. `LiveSettingsSection` and embedded `SettingsPageContent` independently save the same invoices model and maintain separate baselines.
- **Impact:** Increases migration complexity. Do not remove code before tests prove no fallback route still relies on it. Final consolidation task owns removal.

## Axis B — Specification / restored business functionality

### B1 — P0: Live Users & Roles settings editor still missing from central Settings
- **Legacy evidence:** `src/settings/TeamSettings.tsx`, `EmployeeDirectory.tsx`, `rbac.ts` supported multiple roles, protected owner, capability editing and role/employee filters in the browser settings model.
- **PR state:** `src/settings/TenantSettingsPage.tsx:1669-1673` still renders `MagicTeamSettings`. `src/settings/magic/TeamSettings.tsx:51-85,117,167` holds a local staff list, and explicitly says edits do not save.
- **Expected:** One provider-backed table/role editor with Save/Discard and effective-permission preview. Production auth/permissions still requires server enforcement; do not claim it now.
- **Acceptance:** Saved employee/role state survives reload in demo browser, last owner cannot be deactivated, permissions cannot be escalated and exposed controls reflect actual client permissions. **Missing; next dedicated workstream**, not silently included in PR #274.

### B2 — P0: Data & Backup restore/recovery still simulated
- **Legacy evidence:** `src/settings/DataSettings.tsx:27-99,228-269` provider-backed JSON settings backup, business-ID validation/review/restore; `SettingsSqlBackup.tsx:9-54` encrypted **settings-only** SQL-format snapshot; `DraftRecovery.tsx:11-87` session Recycle Bin.
- **PR state:** `src/settings/TenantSettingsPage.tsx:1674-1675` mounts `MagicDataSettings`; `src/settings/magic/DataSettings.tsx:1-3,99-168` explicitly says no real setting is restored/downloaded. Header has a **JSON export shortcut**, not a matching restore flow.
- **Expected:** Reuse existing validated provider-backed settings-only workflow in Magic UI. Never claim a full database backup, restore transactions or execute uploaded SQL.
- **Acceptance:** Export → review → restore → reload; wrong business, invalid file, encryption key, stale revision and unauthorized actor rejected. **Missing; highest-priority next implementation after audit.**

### B3 — P0: Actual Settings Activity replaced with synthetic staff data
- **Legacy evidence:** `src/settings/SettingsActivity.tsx:12-48` accepted actual `state.events` and filtered by section/date/person.
- **PR state:** Magic `src/settings/magic/security/ActivityPage.tsx:31-74` loads synthetic dated entries and says they are not audit records. `TenantSettingsPage.tsx:1678-1679` mounts it.
- **Expected:** Separate genuine Settings change history from broader future server Staff Activity. Never export demo activity as tenant audit.
- **Acceptance:** Save business settings → one event shown with correct actor, timestamp and section. **Missing.**

### B4 — P1: Session-only deleted Sales Draft recovery is inaccessible
- **Legacy evidence:** `src/settings/DraftRecovery.tsx:11-87` can recover a session-store deleted Sales draft with permission/expiry checks and does not post money or stock.
- **PR state:** Magic Data has no `DraftRecovery` mount; it provides its own demo Reset flow.
- **Expected:** Show the explicitly *session-only* Recycle Bin under Data & Recovery. Do not imply persistent server recovery. **Missing.**

### B5 — P1: Saved policy switches are not all real ERP consumers
- **Evidence:** `src/settings/fields.ts` defines `sales.{shortage,priceOverride,discountLimit,returnDays}`, `purchases.{approval,backdateDays,costAllocation}`, `money.{lockDate,adjustment}` and notification settings; `src/settings/magic/LiveSettingsSection.tsx:87-109` can save them via provider. `src/hooks/usePosCart.ts:119,199-206` reads **only** payment default and rounding among those sales examples. `src/pages/PurchaseEditor.tsx:37-38,337,384-394` reads only memo/attachment visibility from its section in the inspected implementation. `src/settings/CommerceSettingsPanels.tsx:151` explicitly marks VAT posting as a preview.
- **Expected:** Either actual transactional consumer/permission enforcement, or an honest non-enforced badge with an implementation backlog. A saved-only option is not an active business policy.
- **Classification:** **Broader existing backend debt, not entirely introduced by PR #274**. Treat server authentication, locking, and discount/return authorization as separate server contracts; never claim production rules already exist.

### B6 — P1: Product defaults only partly consumed
- **Evidence:** `src/components/products/AddProductDialog.tsx:31-32` calls `initialProductDraft(state.sections.products)`. `src/utils/productFormInitial.ts:43-49` uses `defaultUnit`, warranty/serial/expiry and allocation defaults but does **not** read `priceEntry`, `openingUnit` or `minimumUnit`. `src/settings/fields.ts:241-337` still exposes those as ordinary settings.
- **Expected:** Consumer audit per field, with supported options reflected in the new-product editor; no claim of parity based on the entire `products` section object being passed into a function.
- **Status:** P1 gap for subsequent product workstream, not a regression newly created by PR #274.

### B7 — P2: Field-specific Settings search and presentation parity not recovered
- **Evidence:** Legacy `TenantSettingsPage.tsx:628-665` has field-level bilingual search and advanced-field focus; embedding it with `hideHeader` omits its original header and Magic Settings Search is primarily navigation/goal oriented. Also old module entry in `src/settings/ModuleSettingsEntry.tsx:75-92` uses `SettingsPageContent` while central uses Magic cards.
- **Expected:** One shared canonical field index and a consistent module-entry UI, retaining existing phone/tablet compact controls. **Not a functional blocker for PR #274**, but required before declaring the full migration finished.

## Five critical review-focus cases

| Case | Evidence | Status / next acceptance |
| --- | --- | --- |
| Phone hidden with due on unregistered customer | `src/components/pos/CheckoutPanel.tsx:80-85`: `customerPhone || (totals.due > 0 && !customer)` | **Guard present in code**. Add E2E: hide Phone, new due sale must still expose phone and prevent invalid identity; not covered in PR #274's focused Guardian test. |
| Concurrent tab edits | `LiveSettingsSection.tsx:28-46,100-105` and `model.ts:588-608` revision handling | **Guard present at save boundary**. Test actual concurrent changes + stale draft + Discard preservation, not only static code. |
| Invoice Restore Defaults does not clobber hidden numbering | `LiveSettingsSection.tsx:72-83` vs `model.ts:368` | **Confirmed code defect A1**, must fix before merge. |
| Data backup/restore terminology and provenance | `magic/DataSettings.tsx:1-3`, Settings header export, historical `SettingsSqlBackup.tsx` | **Explicitly demo**; no full database backup. Reconnect verified settings-only restore later. |
| Permission / unsaved navigation | `TenantSettingsPage.tsx:407-471,1583-1586`, `MagicTeamSettings` preview and client `canManage` | **Not a production authority**; double-guard path **unverified**, needs browser Back/click cases. |

## Verified positive scope from PR #274
- `scripts/settings-magic-browser.cjs:63-100` toggles Guardian in central settings, saves, reloads, navigates to actual POS checkout, verifies its visibility and restores the original setting. This is a **real browser assertion** of an actual UI consumer.
- `scripts/settings-magic-browser.cjs:115-135` hides receipt attachments, navigates to actual Purchase Editor, verifies upload absence, then restores the original preference. This is also a real browser assertion of a UI consumer.
- `scripts/auth-settings-browser.cjs:23-42` validates that old PIN/device actions remain non-mutating **previews** inside the new shell.
- `src/settings/magic/LiveSettingsSection.tsx:25-46,87-109` uses the canonical provider and revision guard rather than a parallel Magic draft store for its defined live sections. No evidence of backend sync is claimed.
- Three CI workflows passed at PR head `053f2ceb29fff556eed06461575dc9cbb650e92c` according to the GitHub Actions runs. [PR #274 checks](https://github.com/shuvodelux-commits/hisabiq_ui/pull/274/checks).

## Task 1 TDD evidence
- **RED gate:** [Audit PR #276](https://github.com/shuvodelux-commits/hisabiq_ui/pull/276) commit `b6165068cb297dc98d5d23bd47185e9d12077662`, GitHub Actions PR Fast CI [run 42569043136](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42569043136), failed in **Unit tests** with ENOENT for the not-yet-created `docs/settings/functional-migration-matrix.md` (expected).
- **GREEN gate:** contract `tests/settingsMigrationMatrix.test.ts` requires 60 ordinary rows, 12 named specialists, unique IDs and separate display/edit/persistence/consumption/enforcement statuses. The follow-up matrix commit is to be verified by subsequent CI; do not call green before run output.
- No product files were changed as part of Task 1. No claimed browser execution beyond reported GitHub Actions results.

## Required decision before PR #274 merge
**Request targeted A1 repair and regression test in PR #274, then rerun Settings CI and screenshot review before merging.** Approve the remaining scope as **partial functional migration**, not a complete conversion. Keep Data & Backup, Users/Roles, Activity, Invoice Studio and module-policy enforcement in their separate, documented follow-up PRs.

### Reviewer limitations
This is a pinned-source inspection and check review, **not** a live financial posting or auth server pen test. A1's logic path is demonstrable from source, but a browser reproduction has not been executed. The user should not treat this document as proof of all individual module consumers. No independent subagent reviewer was available; the final overall PR review should be checked by another engineer or review agent before merge.
