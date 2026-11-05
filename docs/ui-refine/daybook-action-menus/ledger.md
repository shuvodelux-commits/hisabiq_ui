# Daybook row action menus — GitHub-only UI-refine-loop ledger

**Target:** `#/app/daybook` → Daybook three-dot row actions.
**Source of truth:** `main` at `b77e682ab0649fbb33b1922e3861241dde04992f`, following Cloudflare build fix PR #251.
**Code scope:** `src/components/layout/ActionMenu.tsx`, `src/components/daybook/DaybookActions.tsx`; generated design source inventory; targeted Playwright and screenshot state support.
**Approved taste:** `docs/design/taste.md` (ERP row/action dropdown menus), `docs/ui/HISABIQ-DESIGN-GUIDE.md`.
**PR:** [#252](https://github.com/shuvodelux-commits/hisabiq_ui/pull/252) (draft).
**Method:** ChatGPT-led GitHub-only C0–C4; independent official Impeccable **source detector**, not the original independent-model /ui-refine-loop runtime. No claimed /40 model-agent score.

| Check | Head / evidence | Detector / scores | Issues and outcomes | Tests |
| --- | --- | --- | --- | --- |
| **C0 baseline / RED** | `7764a921`; [run 41956652686](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41956652686) | Unscored | Open-menu baseline captured. Daybook row trigger had `p-1.5` around a 16px glyph (about 28px); no `aria-expanded`. The Playwright contract failed at the absent `data-action-menu-trigger` marker, as designed. | Screenshot job failed at the *intentional* test-first assertion; 20 before/after PNG pairs were still uploaded. |
| **C1 source changes** | `de854303`; [CI 41957043893](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41957043893); [screenshots 41957043803](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41957043803) | Unscored | Added reusable opt-in 36px `ActionMenuTrigger`, keyboard boundary correction and bilingual Daybook labels; preserved all callbacks/permission guards. CI found an unsynchronized generated component inventory. Browser test attempted to pointer-click the second row through the first menu overlay; changed that test to keyboard activation, not app behavior. | C1 CI and screenshot workflow failed for the recorded, correctable reasons. |
| **C2 contract synchronization + GREEN** | `3e877fc7`; [CI 41957887661](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41957887661); [Playwright 41957887722](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41957887722) | Official pinned detector exit **0**, JSON `[]`; unscored visual/audit | Updated `docs/ui/design-system.json` with actual shared export and moved Lucide usage (removed old Daybook `MoreHorizontal` source, added shared ActionMenu source). Re-ran original workflows. | **Both GitHub checks SUCCESS** at code head. All 10 Playwright viewport/theme configurations PASS. |
| **C3 evidence-only check** | Same `3e877fc7` / same passing runs | Clean detector; no invented third checker model | Reviewed 320 light, 390 dark and 1440 light actual open-menu pixels and complete 20-pair before/after file comparison. 13 changed pairs, 7 pixel-identical; all 10 open-menu states changed with controlled 36px action affordance. No actionable new P0/P1 supported a speculative third code edit. | No-change pass; baseline vs candidate both checked. |
| **C4 closing review** | Same verified head / source | Not scored as official independent /40 | See outcome grades below. No additional scoped fixes required. Owner approval pending. | Final CI and Playwright success; pending merge/deployment deliberately not performed. |

## Issue register and final grades

- **DA-01 (P2, compact touch affordance) — Fixed.** New row action trigger uses shared 36px icon-control geometry. Playwright checks measured at least 35×35 across all viewport/theme combinations.
- **DA-02 (P1, accessibility) — Fixed.** `aria-expanded` and `aria-haspopup=dialog` reflect state. Escape returns focus to its exact row trigger. Outside click closes. Focus ring visible. Ten Playwright cases pass.
- **DA-03 (P2, keyboard menu movement) — Fixed at source and partly behavior-verified.** `ArrowUp` with no currently active item selects the last enabled option; ArrowDown/Home/End and boundary wrapping tested on opened menus.
- **DA-04 (P2, localization) — Fixed at source.** Daybook menu action labels now use existing `useUiCopy` English/Bangla helper. Full independent Bangla switching/copy screenshot was *not* executed by the targeted ten-case test.
- **DA-05 (P1, financial integrity) — Protected.** Existing transaction action availability, handlers, destinations, source review, print, duplicate and reversal call paths are unchanged. Playwright only opens/closes/navigates menu focus; **no production accounting posting is claimed**.

## Authentic evidence

- **Final Playwright screenshots:** [Actions run 41957887722](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41957887722) — artifact `ui-refine-chatgpt-shots-pr-252-41957887722`. **40 PNGs**: 20 before + 20 after at 320, 390, 768, 1024 and 1440px, light/dark, default Daybook + actual **open** row menu.
- **Focused interaction log:** `daybook-action-menu-playwright.log`, 10 passed viewport/theme cases. Covers 36px trigger, expanded state, actions, keyboard focus, menu placement, Escape/focus return, second-row keyboard switch and outside click.
- **Official Impeccable source detector:** `impeccable-detector.json=[]`, exit `0`; scope `src/components/layout/ActionMenu.tsx`. This is a static source detector, **not** rendered screenshot certification.
- **Fast CI:** [41957887661](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41957887661) — TypeScript, lint, design contract, unit suite, Vite production build and relevant browser regressions successful.

## Stop reason and limitations

The C2 and C3 evidence checks found no remaining supported P0/P1 defect. Stop early under the documented no-speculative-fix rule; **C3 was an evidence-only check**, not a fabricated independent subagent/fixer round. C4 closing review completed. Static screenshots show the settled menu and cannot independently prove animation timing (not altered here). Dark/light and responsive checks passed; localization-specific runtime screenshot remains a future optional check.

**Status: draft PR, unmerged and not deployed. The owner must approve the merge.**

## Owner-approved compact mobile follow-up (2026-11-05)

The owner explicitly approved a compact dark-mode Daybook mockup requiring **search and date always visible, one square Filter button for secondary controls, and immediately visible three-dot row actions without sideways scrolling**. This extends the original Daybook action-menu scope; it is not a retroactive claim that other ERP modules were changed.

| Pass | Evidence | Findings and resolution |
| --- | --- | --- |
| **M0 approved reference** | Owner-provided 320-ish mobile screenshot and subsequently approved revised mockup; original PR C0 screenshots | Original Daybook showed all four dropdowns inline; action column was offscreen behind wide table. Test-first mobile contract was committed before implementation, although its initial GitHub run was cancelled by subsequent pushes, so no separate red execution is claimed. |
| **M1 functional correction** | [GitHub CI 41963260865](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41963260865), [Playwright 41963261458](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41963261458) | Advanced type/account/user/status controls moved behind a 36px icon on screens narrower than 1024px. Search/date remain visible, desktop filters unchanged, existing filter state/Reset preserved. One mobile four-column table with sticky right action replaces the clipped horizontal presentation. Both runs passed; screenshots caught overly close date/type text and an ellipsized 320px reference. |
| **M2 visual repair** | [Screenshot 41963926578](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41963926578), [CI 41963926503](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41963926503) | Date/type widths corrected, `Customer Payment` wraps rather than overlapping; outlined vertical three-dot trigger matches owner mockup. Both checks passed; 320px reference still needed extra width. |
| **M3 reference integrity** | Code head `fe0bab40adf8557ed0c691bf0993878ceafb7350`, [focused Playwright + screenshots 41964508638](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41964508638) | Rebalanced 320px Date/Type columns to show **EXP-000062 in full** without scrolling. New Playwright assertion checks rendered reference `scrollWidth <= clientWidth` at mobile sizes. 10 responsive layout cases and 10 row-menu cases passed; official pinned Impeccable source detector exit 0, JSON `[]`. |
| **M4 closing review** | [Fast CI 41964508642](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41964508642) · [Playwright 41964508638](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41964508638) | Both workflows **SUCCESS** on the same source head. Artifact `ui-refine-chatgpt-shots-pr-252-41964508638`: **52 real PNGs** / **26 before-after pairs**, default and open row-menu (5 widths × 2 themes), expanded mobile advanced-filter state (320/390/768 light/dark). All 26 pairs differ as expected. Visually inspected 320 light and 390 dark layouts and expanded filter state; no supported P0/P1. No model-agent `/40` score is invented. |

### Universal requirements captured for future modules

The owner-approved behavior is permanently documented in `docs/ui/UI-REFINEMENT-RULES.md` and `docs/design/taste.md`: below 1024px collapse advanced dropdowns behind a small square Filter icon, keep search/date accessible and applied filter values intact, and always keep the row `⋮` button onscreen; render compact columns for phone layouts while retaining full desktop information. The rule is **universal for future refinements**, but this PR **implements it only in Daybook**. Other modules require separate scoped reviews.

**Preserved:** original Daybook search/date query parameters, reset, export/print, source navigations, duplicate, edit/delete review and permissions, finance ledger data and app navigation. No backend or transaction posting changes. Static screenshots prove settled geometry only, not temporal motion (untouched here). Final documentation commit may trigger extra checks. **Draft PR; no owner merge authorization inferred from approving the mockup.**
