# Magic Patterns Settings — Phase 1 visual and accessibility review

**Review date:** 8 November 2026  
**Branch / PR:** `refine/settings-magic-replacement-github` / [draft PR #272](https://github.com/shuvodelux-commits/hisabiq_ui/pull/272)  
**Reference design:** Magic Patterns editor `t6q3mxi6nhuak3qjvx8cwn`, pinned artifact `238f01b4-0e3b-4eda-aac5-6d542fbf85cd`  
**Release decision:** **HOLD Phase 1 approval** until the remaining visual reference and keyboard-accessibility checks are resolved.

## Method and evidence

1. Retrieved the actual GitHub Actions screenshot ZIP. Its original capture covered **Interface & workflows only**, despite the green screenshot workflow. This is a coverage gap, not evidence of parity across the Settings app.
2. Extended `.github/workflows/ui-refine-chatgpt.yml` to call the existing Settings Playwright suite with `SETTINGS_SCREENSHOT_DIR`. It now captures **Users & roles, Data & backup, Logged-in devices, Staff activity, and Offline selling** in light and dark at **320, 390, 768, 1024 and 1440px** (50 specialized screenshots), in addition to the workflow's 20 baseline-vs-PR Interface screenshots.
3. Reviewed light/dark rendered screenshots and the current code of the shared Settings UI, Magic components and the theme. Checked actual foreground/background pairs, not colors in isolation. Current `src/theme.css` specifies dark foreground `237 243 250`, muted text `177 190 208`, dark card `20 38 59` and light card `255 255 255`.
4. Compared the port's visible feature groups, headings, controls and demo effects against the pinned original `pages/settings/*.tsx` sources. **No rendered original Magic Patterns screenshot at matching viewports was available.** Therefore screenshot-to-source **pixel-level parity cannot be certified** by this review.

GitHub review evidence: [Screenshot workflow run](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42473673523). Later runs include the contrast fixes. Source files and committed browser tests remain in PR #272.

## Confirmed visual findings and corrective work

| ID | Priority | Finding / evidence | Action |
| --- | --- | --- | --- |
| V-01 | **High** | On the rendered 1440px dark Interface screenshot, `bg-white` combined with dark-mode `text-ink` produced **1.12:1** title contrast. Muted text on white was **1.88:1**. Normal text requires **4.5:1** under the project's dark-mode AA goal and WCAG 2.2 AA 1.4.3. | Changed the Interface card to semantic `bg-card`. Token-pair contrast becomes **13.72:1** for the primary text. |
| V-02 | **High** | Rendered dark Offline selling actions used the shared outline-button `bg-white`, producing pale text on white. This also affects dialogs and backup controls used elsewhere. | Shared Magic `Ui.Button` outline now uses `bg-card` (light mode stays white). Text/token contrast becomes **10.71:1** for `text-ink-700`. |
| V-03 | High | Other hard-coded white editing surfaces were found in Interface ModuleSelector and Invoice Studio / DesignGallery. They inherit dark-mode foreground tokens. | Changed editing surfaces to `bg-card`. Printed document previews are deliberately kept white but wrapped with `theme-light` so their paper text is dark (**17.52:1** token-pair contrast). |
| V-04 | Evidence gap | The automatic before/after screenshot job originally rendered `#/app/settings/interface` only; a green workflow was misread as a broad visual-parity result. | Added specialized Settings screenshot capture at all five viewports and both themes to GitHub Actions. |
| V-05 | Source-parity blocker | The rendered Magic Patterns **reference** at matching states and viewports has not been captured, so exact spacing, typography, overlays, and breakpoint fidelity cannot be scored against source images. | Obtain matched original design screenshots or an authorized read-only preview for the source; compare them manually before approving pixel parity. |

**Review scope:** The above dark-contrast fixes intentionally preserve the original light theme by switching only hard-coded white surfaces to theme-token surfaces. None changes data persistence, permission boundaries or live device authorization. The print/receipt paper exception explicitly preserves white-paper output.

## Accessibility review (seven separate subjects)

The project's existing **36px shared control height**, global focus-visible ring and dark-mode AA palette are the applicable family conventions. Where a requirement is not explicitly stated, WCAG 2.2 AA is the external review reference, **not** a claim of overall conformance.

| Subject | Evidence and disposition |
| --- | --- |
| **1. Contrast** | Confirmed V-01–V-03 failures on the first captured dark-mode build. Theme-aware corrective code has been committed and Playwright tests added for Interface title, active Offline outline action, and white Invoice preview text. Automated checks do **not** measure every pixel, label, or interactive state. |
| **2. Focus** | Shared theme `:focus-visible` draws a 2px outline. **Fixed in the follow-up:** shared Magic `Modal` now focuses the explicit preferred control (Owner PIN when present, otherwise its first control) and restores focus to the original trigger after Escape or Cancel. Playwright verified both PIN and Team dialogs. Other modal variants still require a complete keyboard and screen-reader sweep. |
| **3. Keyboard reach/order** | Buttons, links, checkboxes and inputs use native controls. **Fixed in the follow-up:** the topmost shared Magic modal traps Tab and Shift+Tab, redirects stray focus from behind the dialog, and closes on Escape unless a menu/listbox is active. The PIN dialog wrap and Escape-to-trigger behavior passed Playwright. Remaining non-Settings modals were not evaluated. |
| **4. Labels and errors** | Source search and Offline numeric controls have accessible names. **Fixed in the follow-up:** Owner PIN now connects its validation text via stable `aria-describedby` and `aria-errormessage`, sets `aria-invalid`, announces an error with `role="alert"`, and retains focus on invalid submission. These DOM and focus states passed Playwright; spoken announcements in a real screen reader remain unverified. |
| **5. Text alternatives** | Icon-only close and action-menu controls include an accessible name; source preview status badges carry explanatory text as well as color. Some individual icons and route labels rely on their adjacent visible text. The complete screen-reader announcement order remains untested. |
| **6. Target size** | Most shared source buttons and fields are 36px high and primary workflow actions are 48px, above WCAG 2.2 AA 2.5.8's general 24px criterion. Some inline links and segmented controls have different geometry/exceptions; final rendered target-size sampling remains to be done. |
| **7. Structure** | Activity uses an ordered list, device/sync history uses semantic tables, cards have headings and dialogs use a dialog role/name. Some short Bangla helper spans rely on font styling without an explicit `lang="bn"`; check the family convention and screen-reader pronunciation as a separate language review. |

## Responsive & interaction evidence

- Playwright browser coverage includes **320 / 390 / 768 / 1024 / 1440px**, both light and dark screenshots for the five specialized pages.
- Settings smoke asserts no whole-page horizontal scrolling on those pages. Users & roles, Logged-in devices and Offline sync history use **independently scrollable tables** at narrow widths.
- Local-only demo changes, PIN length validation, offline handover after simulated sync, activity filters, backups, and reload resets were tested; this **does not validate a production offline-sync or accounting implementation**.
- No real tenant/session API was connected, no invoices were posted, and no PR was merged.

## Follow-up: modal keyboard safety resolved (8 November 2026)

The next one-screen review task addressed the two confirmed accessibility blockers without redesigning the source Magic Patterns dialogs:

- `src/settings/magic/invoice/Ui.tsx`: capture the opener before auto-focused children mount; preserve preferred initial focus, contain Tab/Shift+Tab and stray focus within the topmost modal, handle Escape, and restore the activating control on unmount.
- `src/settings/magic/security/PinConfirmDialog.tsx`: mark the PIN input as initial-focus target, associate stable helper/error IDs, announce invalid input through an alert, retain focus, and prevent duplicate Enter submission.
- `scripts/settings-magic-browser.cjs`: add automated keyboard focus-wrap, Escape return, Cancel return, initial PIN focus, invalid/error relationship, and alert assertions.

**Validation:** The code commit `b0c1117` passed all three GitHub workflows: PR Fast CI (including Settings browser tests), Authentication UI Preview, and UI refine screenshots. This removes the *identified implementation blockers* but does not certify WCAG conformance or exact Magic Patterns pixel parity. A human screen-reader test and matched reference screenshot comparison are still open.

## Exit gates before Phase 1 approval

- [x] Capture implementation-side light/dark evidence for all five specialized Settings pages at five viewports.
- [x] Implement semantic dark theme surfaces for known unreadable cards/buttons and paper preview.
- [x] Add explicit foreground/background contrast tests for representative high-risk controls.
- [x] Validate the contrast-fix screenshots and the follow-up code commit `b0c1117` across PR Fast CI, Authentication UI Preview and UI refinement screenshots. All passed.
- [x] Fix and test shared Magic modal initial/return focus, keyboard containment, Escape, and Owner PIN error association (code commit `b0c1117`).
- [ ] Compare **matched** original Magic Patterns screenshots with implementation across source states, including modal and dropdown open states.
- [ ] Have a human review low-literacy readability, Bangla typography, touch targets and horizontal-table discoverability.

**Do not** mark the complete Settings redesign as WCAG-conformant or pixel-identical based solely on green automation. The criteria beyond the seven subjects reviewed here were not assessed, and visual reference coverage remains incomplete.
