# Daybook row action menus — GitHub-only UI refinement

**Owner direction:** One module at a time. Existing compact HisabIQ appearance; improve focus, touch and menu consistency, not workflows.
**Route:** `#/app/daybook`
**Source:** `src/components/daybook/DaybookActions.tsx`, shared `src/components/layout/ActionMenu.tsx`, existing `FloatingPanel.tsx`.
**Base:** GitHub main after PR #251 merge `b77e682ab0649fbb33b1922e3861241dde04992f`.
**Reference:** existing `docs/design/taste.md` "ERP row/action dropdown menus"; `docs/ui/HISABIQ-DESIGN-GUIDE.md`, `AGENTS.md`.
**Not in scope:** PR #250 dialogs, financial posting, edit/delete behavior, permissions, backend, new visual design.

## Baseline findings to verify in real Playwright

- Daybook three-dot trigger uses `p-1.5` around a 16px icon (28px), inconsistent with HisabIQ's standard 36px icon controls; missing `aria-expanded` on the trigger.
- The shared `ActionMenuList` has keyboard navigation but an initial `ArrowUp` from unfocused state selects the second-to-last item because the current index is `-1`. Test first before changing.
- Daybook menu labels are English-only where the existing UI supports English and Bangla; do not change action semantics or permissions.

## Acceptance

1. Introduce or reuse shared 36px accessible row action trigger; migrate **Daybook only** as opt-in, no ERP-wide regression.
2. `aria-expanded` reflects real open state, 36px tap target, visible focus ring, correct accessible label for each transaction.
3. ArrowDown, ArrowUp, Home and End correctly focus visible enabled actions without triggering any operation.
4. Escape closes and returns focus to the same row trigger; click outside closes; opening another row closes the previous.
5. Menu within viewport at 320/390/768/1024/1440px, light and dark; danger action visually separate, no lost commands or posting changes.
6. Test-first Playwright RED then GREEN; capture **open Daybook row menu** before/after screenshots, not only default Daybook; record C0–C4 issue/evidence ledger.
7. Complete GitHub CI TypeScript, ESLint, design contract, unit, build, Playwright and official Impeccable source detector. No unsupported independent AI-agent claims.
8. Draft PR only until explicit owner approval.
