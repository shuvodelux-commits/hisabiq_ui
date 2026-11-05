# Shared Dialog Sabab Motion — GitHub UI-refine-loop Evidence

**Route:** `#/app/expenses` · Add Expense dialog.
**UI scope:** `src/components/Dialog.tsx` (not expense/payment logic).
**Reference:** Sabab SIS Magic Patterns `kecprgln6zfkctsc37g2to`, `components/ui/Dialog.tsx`, `utils/motion.ts`.
**Execution mode:** GitHub-only ChatGPT-led UI-refine-loop, not independent original parallel-model agents.
**Main baseline:** PR #249 merge commit `7460d2ab437be7575e471ba11796f5f3cc53fab6`.
**Verified code SHA:** `1689cc1672901e962557d1766d0b54f4903a8412`, updated source-contract test SHA `9c5d8cd7ab63eaa736336ae044662c5fd15977db`.

## C0–C4 check ledger

| Check | Source / run | Detector | Visual scores | Findings and outcome |
| --- | --- | --- | --- | --- |
| **C0 baseline + RED** | [Screenshot & focused Playwright 41943726707](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41943726707) | No scored assessment | Unscored | Real Expenses Add Expense dialog opened, test **failed as designed** because `data-dialog-entry="sabab"` absent. This verifies prior entrance differs from approved Sabab reference. |
| **C1 source port** | [Screenshots 41944161808](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41944161808) · [Fast CI 41944161763](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41944161763) | Pinned official detector exit 0, JSON `[]` | Unscored | Exact source entry: opacity 0→1, **CSS individual scale** .96→1, translateY 8→0, **180ms**, cubic-bezier(.22,1,.36,1), backdrop 180ms. Previous unit test hard-coded old Magic Patterns marginTop easing, so Fast CI failed on an obsolete source assertion (not a runtime failure). |
| **C2 corrected contract + GREEN** | [Fast CI 41944428819](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41944428819) · [Screenshot 41944428654](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41944428654) | Pinned detector success | Unscored | Old unit assertion updated **without dropping** focus/scroll/form guarantees. Full Fast CI success: TypeScript, lint, UI contract, unit, Vite build, shared dialogs, sidebar and related browser regressions. Focused Playwright six configurations passed in run 41944161808: 320/390/768/1024/1440 plus dark and reduced-motion. |
| **C3 evidence-only review** | Same C2 code; no additional change | Clean detector | Unscored | 20/20 before-after settled PNG pairs from [run 41944161808](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/41944161808) pixel-identical, including 10 **open Add Expense dialogs** (5 widths × 2 themes). No screenshot P0/P1 justified another code change. Not falsely described as a third fixer commit. |
| **C4 final review** | C2 successful head | Clean | Unscored | Panel remains centered, same colors/content, Escape/focus return/scroll lock unchanged. Closing remains immediate as before; no exit timer delays transactions. No new business logic, posting, auth or backend code. |

## Issue register and grades

- **DG-01 (P2):** Entrance diverged from Sabab reference. **Fixed** at source; browser confirms 180ms keyframe and reduced-motion behavior.
- **DG-02 (P1 prevention):** Motion must not override Tailwind's fixed `translate(-50%, -50%)` centering. **Protected**: individual CSS `scale` / `translate` keyframes, 20 matched images.
- **DG-03 (P1 prevention):** Focus restoration and scroll locking must not regress. **Protected**, source contract plus targeted six-case Playwright.
- **DG-04 (P1):** Test required obsolete `marginTop:[24,0]` + previous bezier. **Fixed**: updated source-contract tests preserve existing behavior assertions.

## Honest limitations
- The referenced Sabab `dialogVariants` also has a **0.12s exit**; the current HisabIQ controlled DesignDialog closes immediately. Introducing exit-hold state could delay confirmation callbacks or change focus handling. **Not copied in this scope**; explicitly out of scope, not presented as verified.
- Static screenshots verify settled pixels, not the whole temporal rendering; Playwright checked animation duration/visibility and reduced-motion. This is not a frame-by-frame recording.
- The official Impeccable source detector is **mechanical**, not a score from independent model agents. No unsupported /40 number is assigned.
- Existing expense UI preview is not a server posting flow.

**Stop reason:** C2 and C3 review found no further actionable P0/P1. The requested protocol's early-stop rule applies; C4 closing check recorded. PR remains draft pending owner merge approval.
