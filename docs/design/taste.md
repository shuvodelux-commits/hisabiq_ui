# HisabIQ_UI — taste and direction

This is the HisabIQ-specific taste file consumed by `/ui-refine-loop`. It extends the upstream neutral rubric, never replaces `AGENTS.md` or `docs/ui/HISABIQ-DESIGN-GUIDE.md`. The existing approved React UI is the source of truth. A target-specific direction is appended after the skill's brief interview; do not infer new brand choices from this file.

## Direction

### Project-wide default (until a target-specific block is approved)

- **Goal:** Make an existing ERP screen easier to scan and faster to use without changing the workflow.
- **Direction:** Same look, cleaner, calmer, compact and purposeful. Human-friendly, not templated or promotional.
- **Keep:** HisabIQ_UI original React + shadcn components, blue/teal semantic palette and dark theme, Geist and Hind Siliguri, compact tables, one primary action, underline tabs, bilingual helpers, one-line POS rows on tablets, keyboard and touch interactions, existing source-linked financial behavior.
- **Avoid:** Redesigns, new layouts/component families, gradients, glowing cards, decorative emoji/icons, oversized padding, fake metrics, duplicated help text, hidden essential actions, shortened Bengali at the cost of clarity, fabricated backend updates or toasts.
- **Users:** Bangladeshi shop owners and counter operators, including first-time software users, using small Android phones, tablets and desktop keyboards.
- **Reference:** Approved HisabIQ_UI Dashboard, Products table, Party Ledger, POS V2 and Purchase Cart components. Inspect actual source files before choosing changes.

### Target-specific direction

### #/app/audit-ledger — compact and touch-friendly refinement (2026-11-01)

- **Goal:** Make audit records, their source, status and actions easier to find on phones without extra scrolling or accidental taps.
- **Direction:** Same existing HisabIQ layout; remove filter clutter, tighten spacing and make row actions reachable.
- **Keep:** All 7 filter controls and Reset, date switching, export, print, counts, table columns, read/correct/delete and audit history; original theme tokens and bilingual terms.
- **Avoid:** Deleting data fields, changing the posted/changed/deleted semantics, inventing transaction posting, adding a new design system or hiding essential records.
- **Users:** Shop owners reviewing a transaction quickly on a phone or at the counter.
- **Reference:** The existing Audit Ledger and approved Products/Party Ledger action controls.


For each request, add a separate `### <route or component>` block with the user's actual goal, acceptable scope, and protected interactions. Explicit user decisions take precedence over the defaults above.

## Taste rules

| ID | Rule |
|---|---|
| T1 | **Existing UI is binding.** No rebuild, no fresh component family, no new brand system. The latest owner decision and repository design guide outrank generic polish.
| T2 | **Job first.** Show customer/product, current stock/balance/amount and the next action before decorative summaries.
| T3 | **Semantic colors only.** Use theme tokens for selected, receivable, payable, warning and danger. Pair color with text; preserve contrast in dark mode.
| T4 | **Compact scale.** Shared ordinary inputs/buttons are 36px; explicit major transaction-completion CTA is 48px only where the documented contract calls for it. All standalone buttons/fields use the shared 0.375rem radius token.
| T5 | **Alignment and readability.** 13px data, 12px table headings, 11px helpers; right-align numeric money values; use proportional digits; avoid clipped Bangla vowel marks.
| T6 | **Real device sizes.** Check 320/390px phones, 768/1024px tablets and 1440px desktop. Tablet POS products must remain one line using approved multi-unit symbols.
| T7 | **Keyboard + touch.** Preserve Enter/Escape/arrow-navigation, focus return, touch target usability, scroll, overlays and dropdown positioning.
| T8 | **Subtract before adding.** Remove duplicate instructions, decorative surfaces, unnecessary clicks, unused cards and bulky headers.
| T9 | **Plain helpful language.** Clear English and contextual Bangla helpers; use familiar shop terms and concise, precise errors. No fake authority, action or financial posting claim.
| T10 | **Prove every change.** Before/after snapshots, real interactions, theme/language matrix, responsive checks and focused tests. A screenshot alone does not verify a button works.
| T11 | **Financial correctness is outside visual discretion.** Never change totals, stock, ledger posting, permissions, stored data or source correction semantics under a UI-only polish request.
| T12 | **Shared-component leverage.** Use the existing Button/Input/FormSelect/dialog/table/cart/Quick Add components. A local lookalike is not a refinement.
| T13 | **Quiet humanized personality.** Warm, precise microcopy and meaningful visual feedback; no gradients, ornamental animation, AI sparkle, excessive icon badges, long helper paragraphs or marketing language.
| T14 | **GitHub-only review gate.** Refine work goes to an isolated branch and draft PR. Preserve approved UI, report tests, no merge or deployment without owner approval.

## Anti-pattern checklist

- Oversized cards/padding, multilevel cards, colored banner overload and ornamental icons.
- Duplicate primary actions, magic toast-only actions, fake payments/ledger changes.
- Raw colors ignoring theme tokens, mismatched button radii/sizes, per-page copied form primitives.
- Nonfunctional filters, lost draft state, weak focus behavior, overflowing Android screens.
- Repetitive bilingual copy or unnatural Bangla translation.
- Changing layout unrelated to the named target or altering business logic for visual convenience.

## Score and acceptance

Use the upstream design /20 + audit /20 score and problem ledger when the executor supports it; mark rubric-only scores honestly if Impeccable is missing. Never declare a visual change successful without the required tests and proof. Owner signs off on visual direction and merges.

### /#/app/products — compact, clear and touch-friendly refinement (2026-11-02)

- **Goal:** Improve compactness, clarity, touch usability and visual polish for shopkeepers while preserving the existing Products UI and functionality.
- **Direction:** Same UI, cleaner and more compact; make comparative table scrolling and routine actions reachable on small phones. Keep the existing data table and desktop hierarchy.
- **Scope:** `src/pages/Products.tsx`; existing product-specific components only with a stated need and compatible defaults; focused tests. No global contracts or business/data changes.
- **Keep:** Search, category/stock filters, column preferences, every row action, all tabs and editors, Bangla/English, light/dark, shared Button/Input/Table/FloatingPanel, 13/12/11 table roles, 36px ordinary controls and 0.375rem control radius.
- **Avoid:** Replacing the table, hiding essential data/actions, decorative content, stock/pricing/accounting/persistence/auth/backend changes. No push, PR, merge or deployment during this execution; the coordinator handles publication after evidence review.
- **Evidence:** Real round-0 desktop/phone captures in both themes; fresh independent Impeccable assessments and browser validation at 320/390/768/1024/1440px guide bounded changes.


### /#/app — ERP row/action dropdown menus (2026-11-02)

- **Visual reference:** User-supplied action menu screenshot, used only for the icon-first rows, quiet dividers, and red destructive items. Do not imitate external app chrome.
- **Direction:** Keep the original HisabIQ FloatingPanel, theme tokens, bilingual labels, and permissions; style its row actions through one shared, opt-in ActionMenu primitive rather than changing all selectors or dialogs.
- **Group order:** View/open/edit; work/transaction/history/print; state operations; destructive delete/cancel/reverse/reject at the end behind a divider. Do not show an empty group divider.
- **Appearance:** One left Lucide icon per action, 13px menu text, at least 40px touch rows, 0.375rem item radius, neutral text for ordinary actions and theme-aware danger red only for destructive actions.
- **Interactions:** Maintain original callbacks, disabled reasons, pointer positioning, Escape focus return, ArrowUp/ArrowDown and Home/End movement, and mobile scrollability. Do not modify finance or inventory posting logic.
- **Review:** Three bounded source/visual passes, real before/after light/dark screenshots, tests, and GitHub draft PR only. Distinguish independent Impeccable scoring from a manual pass if agent tooling is unavailable.


### #/app/* navigation shell — direct Sabab source port (2026-11-05)

- **Reference:** Magic Patterns Sabab SIS `kecprgln6zfkctsc37g2to`, actual `NavTree`, `TopNavStrip`, `MobileDrawer`, `TopBar`, `Sidebar`, `utils/motion.ts`.
- **Owner direction:** Copy Sabab's sidebar and mobile/tablet top module strip, active-only sublinks, popover, drawer spring **380/40/0.9** and overlay fade **0.22s**; then wire HisabIQ's navigation and settings. Do not guess motion values.
- **Protect:** HisabIQ logo, brands/tokens, 36px action controls, RTL-safe Bangla text, `erpNavigation` routing permissions, POS/Counter/Finance accounting, global search, Ctrl+B/Ctrl+K, keyboard and touch accessibility.
- **Verification:** `docs/ui/UI-REFINEMENT-RULES.md`; real Playwright screenshots including the **opened** drawer and top submenu at 320/390/768/1024/1440, both themes; Impeccable audit and honest C0-C4 ledger.
- **Scope:** Navigation only. Remaining modules preserve their approved layouts until individually requested.

### Project-wide mobile filter and table action rule (approved 2026-11-05)

- **Compact responsive filter layout:** **Phone <768px:** Search + 36px square Filter icon on row 1; Date on row 2. **Tablet 768–1023px:** Search → Date → Filter on **one horizontal row**, without clipping or excessive gaps. **Desktop ≥1024px:** Search → Date inline, advanced dropdown filters visible below (Filter icon hidden). Below 1024px advanced dropdowns start collapsed; keep applied values, Reset, and an active-filter indicator. Keyboard focus follows the visible order.
- **Remove redundant date help text:** Do not repeat "Transaction Date · ..." beside the picker when date-mode tabs already communicate it; retain meaningful accessibility labels and mode-switch functionality.
- **Always-visible row actions:** At 320px and wider, the per-row `⋮` button must stay in the viewport without any horizontal scrolling. Use compact visible mobile columns and/or a sticky-right action column; details remain available through the source row menu. Audit Ledger and the owner's approved compact Daybook mockup are the reference.
- **Proof in every future UI refinement:** Capture mobile filters collapsed/expanded, table action at scrollLeft=0, open menu, dark/light, 320/390/768, focus/keyboard/touch and menu placement. Preserve all columns on desktop and never remove real filter or accounting behavior.

See `docs/ui/RESPONSIVE-FILTER-ACTION-PATTERN.md` for the module-by-module implementation checklist, including Playwright evidence at each breakpoint.

- **Final filter-row polish (approved 2026-11-05):** Align the phone/tablet square Filter button's right edge with the table's always-visible rightmost `⋮` action. Put a small outlined `RotateCcw` Reset icon **beside All status**, not on its own row; keep its existing full reset behavior, bilingual tooltip/ARIA label and keyboard/touch accessibility. Validate with Playwright at all responsive widths. Apply to other modules in individually reviewed PRs, not a mass rewrite.

### #/app/accounts — compact overview and reachable voucher actions (2026-11-06)

- **Goal:** Make the existing Accounts overview and voucher history easier to scan and operate on 320px phones through desktops.
- **Direction:** Same approved HisabIQ UI, compact but information-rich. Use approved Daybook/Audit row-action and Party Ledger underline conventions.
- **Scope:** `src/pages/Accounts.tsx` only, focused browser tests and generated design inventory when source imports change. Do not redesign or modify reused Finance/Money Accounts, Ledger, Trial Balance, Statements or Chart of Accounts.
- **Keep:** All accounting totals and source postings, URL-synced tabs, English-only navigation tab labels, simple/accounting terminology mode, date preference, opening balances, voucher create/correct/delete/duplicate, export, full reference, status, Bangla helpers, amount in words where already provided and all modal confirmation paths.
- **Accessibility:** 36px row action always visible at scrollLeft=0 on phones, full voucher reference, touch targets, keyboard focus/Escape return, light/dark and 320/390/768/1024/1440 widths. Never introduce fake posting or silent state changes.
- **Proof:** GitHub-only C0-C4 ledger and authentic screenshot + Playwright check; mechanical Impeccable source detector is not an independent AI visual review. Owner must approve draft PR before merge.

### #/app/finance — Finance Loans & Owners compact refinement (2026-11-06)

- **Goal:** Make the existing Finance money overview and Loans & Owners transaction list easier to scan and operate on phones, tablets and keyboards. No redesign.
- **Direction:** Same HisabIQ blue/teal/Ink theme, dense financial summaries, bilingual helper text, proportional money digits, calm focus cues. Copy the approved Daybook funnel/filter/reset and row-action pattern only for the Finance Transactions tab.
- **Scope:** `src/pages/Finance.tsx` Finance Overview and Loans & Owners; focused Playwright script, CI registration and generated icon inventory only. All shared Counter and Accounts Money Accounts interfaces keep their current UI and posting behavior.
- **Keep:** All seven KPIs, Loan/Owner/Bank/Cash/Mobile money meanings, Cheques and Cash Sessions tabs, original source IDs, account/transfer/finance dialogs and edits, reversal review, URL tab state, Finance People, payment splits, source-ledger relationships, permission handlers, theme, Bangla and keyboard/touch.
- **Responsive acceptance:** 320–767 Search+36px funnel Filter; 768–1023 Search+Filter on one row; desktop Search+type filter+Reset inline. Hide only the secondary type selector below 1024 until expanded; do not hide applied filter state. No new date filter. Full FIN transaction ID, amount, status and sticky action visible without horizontal scroll below 1024; preserve the rich desktop table.
- **Review:** Three bounded GitHub-only passes, C0/C4 screenshot and official mechanical detector evidence. Real menu/detail screenshots at 320/390/768/1024/1440, light/dark; no invented /40 score or claim of separate agent visual review. Draft PR only; owner approves merge.
