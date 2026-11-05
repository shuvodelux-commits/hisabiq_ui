# Party Ledger — Daybook-aligned compact responsive polish

**Date:** 2026-11-05
**Route:** `#/app/parties` (review selected Customer `?id=c1&role=Customer`, plus Vendor roles).
**Base SHA:** `63116c69ac31c08968aa0640371a2e031b0a0d15`.
**Approved source:** Daybook's `src/components/daybook/DaybookFilters.tsx` and `docs/ui/RESPONSIVE-FILTER-ACTION-PATTERN.md`; Party Ledger is otherwise its own approved layout, **not** permission to redesign the Party workspace.

## Target scope
- `src/components/parties/PartyLedgerToolbarResponsive.tsx`: 320–767 phone Search → square 36px Filter on first line; Date second line; 768–1023 tablet Search → Date → Filter on a single line, matching real keyboard focus order. Transaction Type, Rows and Reset remain available in a collapsed secondary filter group. Applied values persist, `aria-expanded`/`aria-controls` and an active indicator remain accessible.
- `src/components/parties/PartyLedgerToolbar.tsx`: make desktop Search → Date readable first, preserve Type, Rows and Print; place compact 36px icon-only Reset adjacent to last select rather than a separate text-heavy reset.
- `src/components/parties/PartyLedgerRowActions.tsx`: reuse the actual approved `ActionMenuTrigger` (36px vertical `⋮`) while preserving source action/permission mapping and FloatingPanel.
- `src/components/parties/LedgerTableResponsive.tsx`: keep tablet row action reachable without horizontal scroll by pinning its rightmost Actions cell; mobile card continues to show reference, amount, running balance and action without losing source details.
- Focused Playwright regression and optional screenshot harness with selected Customer ledger, expanded filters, and opened real row menu.

## Non-negotiable protections
- Keep split Customer/Vendor/Lender/Borrower/Owner/Payee balances and independent vendor receivable/payable ledgers; never net roles.
- No changes to statement range validation, running balance math, debit/credit, source history, permissions, reverse/correction, payment, note, print, invoice routes or posting.
- Preserve the existing PartyDetailAdaptive desktop workspace, Party tabs, directory, source dialogs, Party financial actions and the Party module's dark/light + Bangla typography.
- Reuse `AppDateRangePicker`, `AppSelect`, `Input`, `Button`, `FloatingPanel`, and `ActionMenuTrigger`; avoid new design-system branches.
- Standard controls 36px, radius 0.375rem, compact tables and proportional digits; visible row action + focus return at 320/390/768/820/1024/1440.

## Verification plan
- C0 baseline from GitHub on a draft PR; add RED Playwright assertions before UI code changes.
- Three bounded check/fix rounds C1/C2/C3, followed by C4 closing review. Screenshot default, expanded filter, and opened action at each standard viewport in both themes; include a real selected ledger state. Inspect actual images, report missing evidence.
- Green gates: typecheck, lint, `check:ui-contract`, unit suite, build, Party browser smoke + new targeted Playwright; official pinned Impeccable source detector.
- Draft PR only; owner approval required before merging.
