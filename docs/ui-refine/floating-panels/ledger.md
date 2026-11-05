# Shared Floating Panels — GitHub-only UI-refine-loop evidence ledger

**Scope:** `#/app/dashboard`, `src/components/layout/FloatingPanel.tsx`. Header Appearance, Calculator, Notifications and User menu retain original visual structure and handlers.
**Reference:** Magic Patterns Sabab SIS `kecprgln6zfkctsc37g2to`, `components/common/Popover.tsx` and `utils/motion.ts`.
**Execution:** GitHub-only ChatGPT-led /ui-refine-loop equivalent, with actual Playwright screenshots, official pinned Impeccable **source detector**, and human-written review. Not the original multi-agent Workflow.

**Base:** main after merged PR #248, commit `83ce89e4ea1481c39a61586719de981f8d98c318`.
**Final code SHA:** `25dbae9ac0c5aba209a06d22aeb31c8faf6074a3`.

| Check | Source SHA | Run / artifact | Source detector | Design /20 | Audit /20 | Composite | Evidence & findings | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C0 baseline + red TDD | `a4ee4e41` (test-only) | [Playwright run 41939772208](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41939772208) | Not used to score baseline | unscored | unscored | unscored | Real 30 before/after pairs on unchanged source. Focused test fails at `FloatingPanel` missing `data-floating-panel-motion` and Sabab behavior contract. Failure is expected and verified from GitHub log. | RED as expected |
| C1 source port | `00f7240d` | [Fast CI run 41940355443](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41940355443) | Not graded | unscored | unscored | unscored | Exact Sabab entry (0.14s, opacity/scale/y) and exit (0.09s) copied with reduced-motion; keyboard-only one-open event and route close. New touch listener typed `MouseEvent` only, causing real TypeScript TS2769 error. | FAIL; proceed to correction |
| C2 corrected type + verification | `25dbae9a` | [Screenshots 41940513229](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41940513229), [Fast CI 41940513300](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41940513300) | Exit `0`, JSON `[]`, scope `FloatingPanel.tsx` | unscored | unscored | unscored | Typed shared outside handler `MouseEvent | TouchEvent`. Target Playwright 6 configurations passed incl normal/reduced motion, one-open keyboard behavior, Escape focus restoration, route closure, viewport clamp. Full CI success. **30/30 before-after states pixel-identical** (10 dashboard, 10 appearance, 10 calculator; 5 widths × 2 themes). | PASS |
| C3 evidence-only review | same `25dbae9a` | same verified runs | clean | unscored | unscored | unscored | Reinspect 320 dark calculator, 390 light appearance, 768 dark calculator, 1440 light appearance and all image pair pixel differences. No additional evidenced P0/P1 requires code changes; no speculative third fix made. | No-change review; second P0/P1-free check |
| C4 closing review | same `25dbae9a` | same verified runs | clean | unscored | unscored | unscored | See closing grades below. Owner approval pending. | Draft remains unmerged |

## Stable issues and closing grade

- **FP-01 (P2, animation fidelity)** — Prior simple `scale:0.98` and `easeOut` replaced by Sabab menu's exact directional entry/exit variants. **Fixed at source** and actual normal/reduced-motion interactions pass; full temporal motion frames not recorded.
- **FP-02 (P1, simultaneous panels)** — Keyboard-only Enter could open Calculator while Appearance remained. Uses a global coordinated open event. **Fixed**, Playwright confirms Appearance leaves DOM when Calculator opens.
- **FP-03 (P1, stale global menus after route change)** — Existing panel stayed open when navigating within persistent header. Added `useLocation()` close. **Fixed**, Playwright confirms closure on `#/app/products`.
- **FP-04 (P1, touch event TypeScript error)** — First implementation used `(event: MouseEvent)` for `touchstart`. Corrected to union type. **Fixed** in C2, full TypeScript/CI green.

## Final verification

- **Fast CI 41940513300:** TypeScript, ESLint, UI design contract, unit tests, Vite build, sidebar+module tab smoke, shared-dialog+overlay accessibility **success**. Scope-specific tests skipped by workflow are not claimed.
- **Screenshot & detector 41940513229:** **success**. `ui-refine-chatgpt-shots-pr-249-41940513229` includes 60 PNG images (30 before + 30 after), manifest, HTML compare and `floating-panels-playwright.log`. Detector reports `[]` and exit `0`.
- **Viewport/theme matrix:** 320/390/768/1024/1440 in light/dark, including open Appearance and Calculator; 30 matched pairs have identical settled pixels. No observed clipping in inspected states.
- **Interaction matrix:** 320 light reduced; 390 dark reduced; 390 light normal; 768 light normal; 1024 dark normal; 1440 light normal — all six logged PASS.
- **Remaining:** Static images verify settled appearance only. Exact Sabab timing/parameters verified in source; not measured frame by frame by video. No standalone production posting/back-end implied. No independent model-agent /40 score.

**Stop reason:** C2 and C3 checks had no further actionable P0/P1; further code edits would be speculative. C3 performed an evidence-only check rather than pretending a third fix commit. C4 closed the review. **No merge/deploy until explicit owner approval.**
