# Party Ledger refinement brief

Requested scope: the existing Party Ledger at `#/app/parties`, three bounded original EricTechPro/super-board ui-refine-loop rounds, using its documented independent-agent fallback. Preserve the approved interface, layout, business workflows and source/accounting behavior. Draft PR only; no merge or deployment.

## Verified entry and baseline

- GitHub main baseline: `de33350ea48d7d0c1040b0895b227310cbd484a6`.
- HashRouter `src/App.tsx` → `src/pages/Parties.tsx` → `PartyDetailAdaptive`; desktop `PartyDetail`, below 1024px `PartyDetailResponsive`. Direct selected customer: `/#/app/parties?id=c1&role=Customer`. Directory and navigation use the same route with role/group context.
- Original upstream skill: `vendor/super-board/skills/ui-refine-loop/SKILL.md`, pinned `d0b7d5a6850614ca809477c1af43d5d7da408726`; `.agents/skills/ui-refine-loop` exposes it. Use the actual original skill, not the GitHub-only replacement.
- Required reading: AGENTS, complete HisabIQ design guide, transaction/cart contract, Party ledger specification and select contract, taste, refinement rules, audit-first standard, responsive filter/action pattern, ERP context-complete workflow and source audit, Daybook audit safety.
- Tooling: critic `impeccable`, pinned source `e89e3ada`, engine `0.1.18` passes probe; Workflow unavailable, independent agent fallback available. System Chromium `/usr/bin/chromium` substitutes for absent Playwright browser-cache binaries. No auth script is needed for the local preview. GitHub connector has repository push permission; CLI token is invalid. Optional humanizer is unavailable; use the original skill's plain-language fallback.

## Source and reused components

Scope: `src/components/parties` presentation/accessibility for ledger, balances, selection, connected payment/finance/opening/refund/correction/statement/preview dialogs; narrowly scoped shared opt-in only if unavoidable. Inspect actual Button, Input, AppSelect, FormSelect, AppDateRangePicker, Dialog, Table, FloatingPanel, ActionMenu, FinancePaymentSplitEditor and existing role-action map. Themes use runtime tokens and `hisabiq-theme`/document dark class. Fonts remain Geist/Hind Siliguri with proportional digits.

No changes to reducers, ledger/settlement/amount calculations, persistence, APIs, permissions, accounting, posting, inventory, POS, Reports, Settings or Tenant Management. Source navigation and return behavior remain intact. Fixtures and safe UI-created preview records are test data only, with no real posting claim.

## Acceptance

1. Real before/after 1440px and 390px light/dark; additional 320, 768, 820 and 1024px with tablet portrait/landscape. Inspect logo/top navigation position and content start in every image.
2. Populated, empty, filtered, filters expanded/collapsed, row dropdown, date picker, dialogs and validation images. Authentic existing fixtures or records created through safe local preview UI; no injected dense dataset.
3. Search → Filter then Date on phone; Search → Date → Filter on tablet; desktop controls expanded. Preserve reset, current Party/role, period, pagination and drafts. Actions reachable at scrollLeft=0. Menus stay in bounds and return focus.
4. Full references, long English/Bangla descriptions, right-aligned complete large BDT amounts, negative/zero balances and current/opening/closing semantics. Keep existing compact layout and universal 36px controls/radii.
5. Test actual keyboard/filter/date/menu/dialog/source/statement/export/print paths and supported role-specific safe preview actions. Record blocked/unsupported paths accurately.
6. Each fresh design reviewer and isolated detector/auditor submits independent evidence; fresh checker merges ranked typed issues; fresh fixer applies appropriate Impeccable references with polish last. Three fix rounds and a closing check; independent finish visual/regression review. No fabricated scores or grades.
7. Green TypeScript, lint, UI contracts, tests and production build per round, plus focused Playwright and guide checks. Revert unsafe/failing changes. One draft PR with evidence, scores, checks and remaining issues.
