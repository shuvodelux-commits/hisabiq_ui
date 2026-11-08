# Settings Magic Patterns — source-fidelity and rendered-implementation audit

**Reviewed:** 8 November 2026  
**Source of truth:** Original Magic Patterns [Settings design](https://www.magicpatterns.com/c/t6q3mxi6nhuak3qjvx8cwn), pinned artifact `238f01b4-0e3b-4eda-aac5-6d542fbf85cd` (301 source files).  
**Implementation:** [Draft PR #272](https://github.com/shuvodelux-commits/hisabiq_ui/pull/272), commit `e3c65fa` at audit start.  
**Release decision:** **HOLD exact visual-parity approval**. Source-code structural checks are substantially complete, but a matched *rendered Magic Patterns reference* was not available through the connected design's read-only source API or public editor URL.

## What was actually compared

- Read original source components through the connected Magic Patterns design, not an unrelated older export. The user's October `magic-patterns.zip` is an older ERP export **without these Settings screens** and is not a suitable rendering baseline.
- Read corresponding GitHub implementation files on the unmerged PR branch, compared source/port visible static labels, JSX component presence, and Settings sections/field keys.
- Extracted and visually inspected the latest rendered implementation screenshots from the passing [GitHub Actions screenshot run #42475867268](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42475867268). The artifact contains **50 implementation screenshots** for five specialized pages at **320, 390, 768, 1024 and 1440 CSS-pixel widths** in **light and dark** themes. The workflow also captures Interface & workflows baseline/PR screenshots at those widths/themes.
- Examined contact sheets covering the five specialized pages in light/dark and at all five widths. This validates presentation, layout continuity and visible controls *in the implementation only*.
- The Magic Patterns connector returned source code, not images of the actual Magic design at corresponding route, viewport, theme and dialog state. The public `/c/` editor URL could not be rendered through available read-only access. **No side-by-side source-image pixel-diff, similarity score or claim of pixel identity is possible yet.**

## Screen-by-screen source comparison

The label counts below are a **simple, non-exhaustive extraction of static visible text and JSX labels**, not a pixel similarity score and not a complete behavioral test. A label can match while its component layout differs, and dynamic text may not be counted.

| Original source screen → GitHub route | Static text anchors located in port | Implementation light/dark responsive evidence | Finding |
| --- | ---: | --- | --- |
| Settings home → `/app/settings` | 21 / 21 | Additional implementation screenshot at 1440px | Source content present; exact image comparison outstanding |
| Interface & workflows → `/app/settings/interface` | 28 / 32 | 5 widths × 2 themes, before/after | Four deliberate text substitutions: scope labels and save/review wording to avoid falsely claiming persistence |
| Users & roles → `/app/settings/team` | 18 / 19 | 5 widths × 2 themes | Source role table/dialog controls retained; prototype warning replaced with explicit UI-only notice |
| Data & backup → `/app/settings/data` | 23 / 24 | 5 widths × 2 themes | Both tabs and confirmation dialogs retained; warning updated to avoid implying real backup operations |
| Logged-in devices → `/app/settings/sessions` | 46 / 46 | 5 widths × 2 themes | Source list/filter/action/PIN controls present; synthetic sessions prevent real revocation |
| Staff activity → `/app/settings/activity` | 28 / 28 | 5 widths × 2 themes | Source audit filters, timeline, expandable changes, export/print controls present; local sample events |
| Offline selling → `/app/settings/offline` | 60 / 60 | 5 widths × 2 themes | Source device/handover/sync/test-sale UI present; single demo device, no live POS writes |
| Invoice Studio → `/app/settings/invoices` | 32 / 32 | Browser tests and shared screenshot evidence, **not** its own full 5-width visual capture | Six template choices, paper/language, brand, content toggles and preview preserved |

**General field inventory:** The original `data/settingsSections.ts` defines 18 Settings sections and **37 unique general-setting field keys**; the port's `sourceFields.ts` includes **all 37 unique keys**, with no missing or extra keys by key-name comparison. This does not by itself prove identical field states or validation.

**Source component structures:** `DataSettings`, `SessionsPage`, `ActivityPage`, `OfflinePage`, `InvoiceStudio`, and Settings nav retain their major components and core source labels. Source native inputs were adapted to shared HisabIQ input/select components for clear buttons, accessibility and theme consistency. Changed demo notices intentionally distinguish preview actions from real operations.

## Findings, by impact

| ID | Impact | Source-grounded finding | Required disposition |
| --- | --- | --- | --- |
| **P-01** | **High — interaction parity gap** | Original `components/settings/GeneralSettingsSection.tsx` has a `Before you save` modal with plain-language warnings for `lockDate`, `invoicePrefix` and `costMethod`; its primary controls are `Go back` and `Yes, save`. The port `src/settings/magic/GeneralSettingsSection.tsx` validates a preview draft and shows feedback, **but never opens this source confirmation modal**. | Implement a **preview-only** warning dialog with the original warnings and no tenant persistence. Keep honest UI-only messaging; do not re-enable production saving. Verify source dialog keyboard behavior. |
| **P-02** | **Intentional, approved safety deviation** | Source general/personal settings and some prototype actions update a demo store, sometimes immediately. The port intentionally uses local, nonpersistent draft state, a preview-only SaveBar, disabled live record navigation and nonverifying PIN prompts. Some source labels are replaced by explicit preview labels. | Keep this boundary through Phase 1; link to actual APIs only after design and security review. Do not mislabel it as a pixel defect. |
| **P-03** | **Medium — mobile usability issue inherited from source** | At **320 and 390px**, the Settings directory is horizontally scrollable. Screenshots show early tabs (e.g. Business profile, Names & Khata) while the active deep-linked section can be out of view. Both original `components/settings/SettingsNav.tsx` and the port use `overflow-x-auto` without `scrollIntoView` for the selected item. | Preserve current design until approved; consider auto-scrolling the active item into view without altering order, labels or page layout. Regression-test direct navigation to deep sections. |
| **P-04** | **Visual reference blocker** | Actual rendered original Magic Patterns UI images for matching states were not available; code and implementation screenshots cannot prove exact geometry, typography or pixel parity. | Obtain original design screenshots for the same five widths, both themes, and open-state overlays; align fonts, seed data and selected tabs before image diffs. |
| **P-05** | **Evidence coverage gap** | The 50-image specialized-page screenshot artifact does **not** cover all 18 general Settings section routes and Invoice Studio at every viewport/theme. The `before/after` screenshot set covers Interface; before is the GitHub baseline, **not the Magic Patterns original**. | Expand route-based screenshot capture after the matching reference is available; do not count GitHub baseline images as source-original images. |

### Existing passed checks (not equivalent to pixel parity)

- PR Fast CI, TypeScript, ESLint, production build, Settings Playwright functional flows and 5-width horizontal-overflow assertions passed at the prior checkpoint.
- Authentication UI Preview and Settings screenshot workflows passed.
- Dark-mode contrast defects found earlier were corrected. Shared Settings modal initial focus, keyboard containment/return and PIN error association were independently tested.
- These assertions cover selected DOM/layout/accessibility properties; **WCAG conformance and screen-reader speech fidelity are not fully certified.**

## Exact-reference comparison protocol

When the original Magic Patterns UI can be rendered without modifying the source, capture each matching route in a fixed browser viewport at 320, 390, 768, 1024 and 1440px with an equivalent height, in light and dark. Match browser zoom (100%), fonts, role/permissions, sample data, the selected section, and dark-mode state; also capture open modals, dropdowns and selected tabs. Save named source images separately from the GitHub implementation images, compare the same pair visually (and via pixel-diff only when environments match), and record changes by screen and severity.

### Current decision

**Do not merge PR #272 or declare Phase 1 pixel parity.** The source-faithful port is far along structurally, but issue P-01 must be resolved for complete source interaction coverage; P-03 should be dispositioned for low-literacy mobile use; and the rendered source reference required for P-04 is missing.

**One next implementation task:** Add the source `Before you save` warning modal to generic Settings **as a UI-local, nonpersisting preview**, with browser tests. This does not authorize any backend connection or deployment.
