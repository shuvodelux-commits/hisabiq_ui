# Dialogs and confirmation interactions — Sabab-inspired focused UI refine

**Source of truth:** GitHub `main` after PR #249, merge `7460d2ab437be7575e471ba11796f5f3cc53fab6`.
**Reference:** Magic Patterns Sabab SIS editor `kecprgln6zfkctsc37g2to` actual `components/ui/Dialog.tsx` and `utils/motion.ts`.
**Target:** existing `src/components/Dialog.tsx` with current design-system `DesignDialog/DesignContent` preserved.
**Representative route:** `#/app/expenses`, button `Add expense`, dialog `Add expense`.
**Authority:** `docs/ui/UI-REFINEMENT-RULES.md`, `AGENTS.md`, `docs/ui/HISABIQ-DESIGN-GUIDE.md`.

## Direction
Copy Sabab's **exact entry motion** while retaining HisabIQ's positioning, shell, focus/trap and accessibility:
- panel entry 0.18s with easing `[0.22,1,0.36,1]`: opacity 0→1, scale .96→1, vertical movement 8px→0;
- backdrop fade .18s;
- reduced motion: immediate entrance;
- centered panel must remain centered. Existing DesignContent uses translate(-50%, -50%); never override the transform as doing so shifts dialogs.
- Sabab exit is 0.12s, scale .98, y4, but HisabIQ's existing controlled DesignDialog unmounts immediately; **do not introduce delayed onOpenChange or delayed transaction completion just to animate exit**. Assess separately in this scoped PR and disclose any limitation, not guess.

## Must preserve
All existing dialog content, close X, error handling, Escape, Focus return, Tab containment, nested popovers, body scroll locking, data ownership, 36px buttons, translations, mobile max-height and scroll. Keep all accounting/expense save logic unchanged.

## Test-driven and evidence gates
1. Define focused Playwright behavior **before implementation**; verify failing motion-contract test on main.
2. Playwright light/dark and phone/tablet/desktop, with Add Expense dialog OPEN, checks viewport, controls, Escape, focus return and reduced-motion behavior. Validate source-exact panel entry keyframes without replacing the centering transform.
3. GitHub-only `/ui-refine-loop` C0 → C1/C2/C3 bounded → C4 closing; document actual evidence and early-stop reason if no defects remain.
4. Real GitHub screenshots: default + open dialog at 320/390/768/1024/1440px in two themes, official pinned Impeccable source detector, full Fast CI (tsc, lint, contract, unit, build, browser regression).
5. One draft PR; no merge/deployment before owner approval. Avoid broad redesign or unnecessary changes.
