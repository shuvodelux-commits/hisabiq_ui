# Purchases — Daybook compact filter and action refinement

**Route:** `#/app/purchases`  
**Approved reference:** merged Daybook PR #252 and `docs/ui/RESPONSIVE-FILTER-ACTION-PATTERN.md`  
**Review date:** 2026-11-05  
**C0 main SHA:** `30aab2699dc3201acb48a2f0b1778f005d6542c2`  
**Reviewed UI head:** `7a22a34183092bdaa8ebdbf623945117aa48e742`  
**Workflow:** GitHub-only ChatGPT-led Impeccable check/fix approach; **not** the upstream fresh independent parallel reviewer-agent runtime.

## Evidence and verified commands

- [Final PR Fast CI run 41991601536](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41991601536) — **success**: TypeScript, ESLint, `check:ui-contract`, unit suite, production Vite build, application navigation, and existing Purchases workflow smoke.
- [Final screenshot / Impeccable run 41991601473](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41991601473) — **success**: 60 real PNGs (30 before + 30 after) across 320/390/768/1024/1440 in light/dark, including default, expanded filters, and actual open-row-action states. Artifacts: `ui-refine-chatgpt-shots-pr-256-41991601473`.
- In the screenshot artifact, `purchases-daybook-playwright.log` reports **12/12** responsive/interaction configurations (320/390/768/820/1024/1440 × light/dark). It checks collapsed/expanded filters, active indicator, Reset, keyboard tab/focus return, 36px sizes, right-edge action reachability at scrollLeft=0, full reference, visible mobile amounts and 1024px Due/Status labels.
- Official pinned Impeccable source detector: engine `0.1.18`, scope `src/pages/Purchases.tsx`, exit `0`, JSON `[]` findings. This is **mechanical static source detection only**, not independent AI critique or a substitute for rendered accessibility checks.
- I inspected actual before/after images at 320px light (default, expanded, open popup), 768px dark (all three states), 1024px light and 1440px dark. Dense ERP tables, theme, readability and geometry are materially improved without replacing the original page.

## C0–C4 issue and pass ledger

| Check | Source SHA / CI evidence | Actual check or fix | Stable issue IDs | Status |
|---|---|---|---|---|
| **C0 baseline** | `30aab269` (artifact baseline from run 41991601473) | Mobile had Supplier + Status + Reset stacked above a horizontally overflowing table, with row Actions outside initial viewport; 768px likewise wasted vertical space. Original supplier/payment behavior was the reference to preserve. | PUR-01 (P1 action reachability), PUR-02 (P2 filter density), PUR-03 (P2 trigger consistency) | Baseline documented |
| **C1 — adapt/layout** | `d7c7c453`, `7267d8e0`, `9b0431d8`, later `ac845545`; [CI 41989342131](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41989342131) success | Daybook-shaped 36px Filter on phone/tablet, collapsed Supplier/Status and inline icon Reset, opt-in shared `ActionMenuTrigger`, compact purchase/date/supplier and total/due/status with sticky right Action. Original source actions unchanged. Early CI failure [41988977562](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41988977562) was corrected before green evidence. | PUR-01, PUR-02, PUR-03 | Fixed in source and responsive tests |
| **C2 — harden 320px** | `5f47afea` (overlap test), `597045b0` (fix); [CI 41990296130](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41990296130) success | Reserved enough width to keep the full Purchase total and Due text clear of sticky Actions at 320px. | PUR-04 (P1 amount overlap) | Fixed; final test explicitly compares pixel bounds |
| **C3 — harden 1024px** | `f08f3561` (test), `4a220b2f`, `7a22a341`; [CI 41991601536](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41991601536) success | Retained legible Due + Status at 1024px and full columns at 1280+, with label-edge measurement rather than padded cell-edge estimates. Intermediate screenshot job [41990960842](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41990960842) failed; corrected and final screenshot run passed. | PUR-05 (P1 table label collision) | Fixed by final head |
| **C4 closing review** | `7a22a341`; [screenshots 41991601473](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41991601473), [CI 41991601536](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41991601536) | Re-inspected actual mobile/tablet/desktop light/dark before/after; final 12/12 Playwright and built/typed/tested UI. No new visible P0/P1 found in inspected images. | PUR-01 through PUR-05 | **Fixed**; draft PR remains unmerged |

**Scores:** Unscored. This was a ChatGPT combined source/visual check supported by actual screenshots, CI and an official static detector; no separate fresh reviewer agents or independently calibrated numeric /40 assessment was run. Do not interpret the detector's `[]` as an accessibility certification.

## Preserve and remaining limits

**Preserved:** Purchases, Return, Return History tabs; search and both existing filter values; supplier links; bill preview, print, source correction and history, due/payment/return permission conditions; bilingual text; original UI preview-only accounting disclaimer. No backend, posting, invoice total, inventory or payment mutation was part of this PR. No date filter was introduced: the current Purchases list never had one.

**P2 scope exclusion:** The existing two-row mobile KPI card grid and multiline tab strip still occupy vertical space, as in the approved original page; the owner requested a list/filter refinement, not a page redesign. 320px screenshot still requires vertical page scrolling, but no sideways scroll is required to open row actions. The default screenshots are static; motion timing and actual production posting were not tested. The focused 820px case is Playwright-verified but not included in the screenshot artifact's five standard widths.

**Disposition:** Visual and test review complete for the narrow scope. **Leave PR #256 draft and unmerged until explicit owner merge approval.**
