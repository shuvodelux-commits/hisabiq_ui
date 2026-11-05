# Purchases list — Daybook-guided UI refinement

**Date:** 2026-11-05  
**Verified route:** `#/app/purchases`  
**Scope:** `src/pages/Purchases.tsx`, a focused Playwright regression script, and narrowly scoped screenshot capture state.

## Approved reference
The owner approved the exact compact Daybook source in `src/components/daybook/DaybookFilters.tsx`, `src/pages/Daybook.tsx` and `src/components/layout/ActionMenu.tsx` (merged PR #252). Apply `docs/ui/RESPONSIVE-FILTER-ACTION-PATTERN.md` and `docs/ui/UI-REFINEMENT-RULES.md` to Purchases, not a redesign.

## Existing Purchases behavior to preserve
- The Purchases / Purchase return / Return history tabs and their URL state; supplier and payment filters, query and reset.
- New Purchase, supplier ledger, bill detail, receipt, print, correction, pay due, review return and source-history operations; keep each handler, permission, source-tracking and preview-only accounting wording.
- Purchases totals and due calculations, original supplier links, no fabricated transaction posting; no change to purchase editor, inventory, settlement or backend.
- Current HisabIQ light/dark tokens, bilingual labels, 13/12/11 table text, 36px ordinary controls, `0.375rem` radius, keyboard/touch and shared FloatingPanel, Input, FormSelect, Table and ActionMenuTrigger.

## Daybook pattern applied only where applicable
- Phone below 768: Search + square 36px Filter in first row; advanced Supplier/Status and reset collapsed by default. **Do not add a date filter**—the current Purchases list has none.
- Tablet 768–1023: same one-line Search + Filter; advanced filters on demand.
- Desktop 1024+: Search, Supplier, Status and adjacent icon-only Reset in one compact toolbar; mobile Filter icon hidden.
- Narrow purchase list: full purchase reference and supplier context remain readable; compact visible total/due and right-edge `⋮` action, with other details retained on desktop and inside existing bill preview. Sticky Action remains usable at horizontal scroll position zero.
- The popup must use existing Daybook-style `ActionMenuTrigger` + `FloatingPanel` and preserve all actions; only its trigger presentation changes.

## Acceptance / evidence
1. Test-first Playwright at 320, 390, 768, 820, 1024 and 1440px in both themes. Verify filter visibility, order, collapse/expand, active indication, reset, row action in viewport without sideways scrolling, focus return, supplier links, mobile readability and every existing workflow entry.
2. Real C0 baseline and before/after screenshots of the default list, expanded filters and actual opened action menu, with source-backed detector results. Use the GitHub-only C0→C1→C2→C3→C4 protocol; never claim original independent parallel agents were run.
3. Run TypeScript, lint, UI contract, unit, production build and focused Purchases Playwright; record actual results and remaining issues in a ledger.
4. Deliver a draft PR for review. Never merge or deploy without explicit approval for this new Purchases PR.
