# Finance · Loans & Owners refinement (2026-11-06)

**Route:** `#/app/finance` (transactions via `?tab=transactions`).

**Requested process:** Three bounded passes of the repository's GitHub-only /ui-refine-loop process, with C0 baseline and C4 closing verification. Existing HisabIQ design is binding; no redesign.

**Scoped implementation:** `src/pages/Finance.tsx`, focused browser test and CI wiring. `Finance` is shared by Counter and Accounts Money Accounts, so all new presentation treatments must be guarded by `!counterOnly && !moneyAccountsOnly` or limited to the `transactions` and `overview` branches.

**Direction and reference:** Use Daybook's `src/components/daybook/DaybookFilters.tsx`, `src/pages/Daybook.tsx`, `AnimatedAdvancedFilters`, `RowActionMenu`, and original Ink/Teal, bilingual/underline table conventions. Compact, calm, scannable, information-rich, human-friendly.

**C1 (adapt / harden):** At 320/390/768px show complete Finance transaction ID, meaningful context, amount, status, and right-edge 36px row Actions without sideways scrolling. Preserve original full columns at desktop; keep dialog/edit/reverse options and finance source semantics.

**C2 (distill / layout):** On phones Search+one square funnel Filter on row 1; type filter and Reset collapsible but remain functional. Tablet Search+Filter one row, desktop Search+type filter+Reset. Existing duplicated secondary action buttons may be removed only when their header versions remain fully accessible. No new date selector; do not invent transaction filters or accounting changes.

**C3 (typeset / polish):** Tighten Finance overview KPI and section rhythm without hiding figures, preserve Bangla names/labels, theme AA, no monospaced digits, keyboard/touch/reset/menu focus and empty-filter recovery. Use existing shared primitives.

**Protected workflows:** Finance Overview, Loans & Owners, Cheques, Cash Sessions, Counter, Accounts Money Accounts; account creation/transfer, finance-people manager, transaction creation/review, payment splits, edit/reverse, cheque actions, cash session, and routes `/app/counter`, `/app/accounts`. All money, source data, relationships, state, status, cash/bank balances, opening balances and projections remain unchanged.

**Evidence:** C0 baseline & before/after screenshots at 320/390/768/1024/1440, light/dark; expanded and collapsed filter, open row action and dialog, true keyboard focus/scroll/bounds assertions; `npx tsc --noEmit`, lint, UI contract, 851+ unit tests, Vite build and focused Playwright. Pinned mechanical detector is not an independent AI review; if original sub-agent/runtime or visual inspection is unavailable, explicitly disclose and do not invent /40 scores.

**Release:** GitHub PR only, draft, never merge or deploy without owner approval.
