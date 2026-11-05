# HisabIQ — Audit-first UI Refine Standard & Module Rollout

**Owner-approved references:** [Daybook PR #252](https://github.com/shuvodelux-commits/hisabiq_ui/pull/252), [Sales PR #253](https://github.com/shuvodelux-commits/hisabiq_ui/pull/253), and their source and evidence ledgers. **Scope:** React/TypeScript, Tailwind, shadcn-style HisabIQ_UI, real existing ERP workflows. **Rule:** Audit first, fix one module per draft PR, preserve business logic and never merge automatically.

Read this **after** `AGENTS.md`, `docs/ui/UI-REFINEMENT-RULES.md`, `docs/ui/HISABIQ-DESIGN-GUIDE.md`, `docs/ui/RESPONSIVE-FILTER-ACTION-PATTERN.md` and `docs/design/taste.md`. Do not use this as a substitute for the real code and screenshots.

## A. Proven reference behavior — reproduce source, not an approximation

| UI concern | Daybook — approved source | Sales — approved source | ERP requirement |
| --- | --- | --- | --- |
| Primary search | Search always visible | Search visible on every width | Keep the exact module search semantics, language and keyboard input |
| Date control | Daybook date range visible | No date picker on Sales invoices | Preserve if present; **do not invent Date** |
| Phone (<768px) | Row 1 Search → 36px funnel Filter; Row 2 Date | Search → 36px funnel Filter | Secondary filters collapsed initially |
| Tablet (768–1023px) | Search → Date → Filter on **one line** | Search → Filter, as no date exists | Visible order must match keyboard tab order |
| Desktop (>=1024px) | Full secondary controls visible | Full secondary controls visible | Hide compact Filter toggle when no need |
| Filter glyph | Lucide `Filter` (funnel), not controls/sliders/settings | Same icon in compact mode | **Same funnel icon in all filter toggles**; never replace genuine Settings, adjustments or view preferences |
| Active filters | Subtle active indicator | Subtle active indicator | Accurate applied state after collapse and navigation |
| Reset | `RotateCcw` outlined 36px icon immediately beside Status | Same | No standalone Reset row; preserve every original reset effect, including date defaults and URL state |
| Alignment | Filter right edge aligned with visible row Action | Same | Check real bounding rects; tolerance target <=8px when same page-edge geometry applies |
| Row Action | 36px vertical `⋮`, sticky visible on phone/tablet | Same on invoices, returns and credit | Always reachable with scrollLeft=0, even when other table columns scroll |
| Popup | `ActionMenuTrigger` → `FloatingPanel` → icon-first `ActionMenuList` | Same | Clamp to viewport, keyboard arrows/Home/End, Escape/focus return; retain all commands |
| Typography | 13px data, 12px headings, 11px helpers | Same ERP contract | No monospace numbers, no clipped primary IDs, bilingual readable |
| Density/tokens | 36px universal controls, 0.375rem radius | Same | 48px only dedicated completion CTAs, blue/teal/Ink tokens |

A genuine Settings action still uses the original Settings glyph; a stock-adjustment action must not be relabeled as a Filter. Replace an **actual filter toggle icon** with funnel `Filter`, not every occurrence of `SlidersHorizontal`, `Settings` or `Settings2`. Keep Report/Product-specific controls if they have different semantics, but audit the compact behavior.

## B. UI audit order — every PR begins here

| Priority | Audit first | Required evidence and rejection criteria |
| --- | --- | --- |
| **P0 — behavior/accounting** | Route, correct live control, state/URL, permissions; Create/Save/Edit/Delete, payments, ledgers, stock and return logic | No incorrect posting or disabled permissions; no UI-only fake actions; verify handlers before cosmetic changes |
| **P1 — reachable operations** | At 320/390/768/820 widths check offscreen `⋮`, clipped labels, hidden status, popover outside screen, blocked keyboard/touch, focus traps | Reject any action requiring sideways scroll at scrollLeft=0 or any primary status/ref masked by sticky Action |
| **P1 — filters/reset** | Distinguish true Filter from Settings; values persist when collapsed; effective active count; reset exactly restores module defaults and URL state | Reject reset that clears only the visible subset or leaves stale search/date/state |
| **P2 — responsive toolbar** | Phone Search/Filter (+ Date row); tablet one-row Search/(Date)/Filter; desktop expanded; Filter's right edge aligned with Action | No unnecessary controls/extra bars, duplicate Filter toggle, incorrect visible vs keyboard order |
| **P2 — data clarity & density** | Full invoice/transaction reference, Bangla text, long Party/Status names, right-aligned numbers, empty/partial states | No ellipsis on primary IDs; no hidden money/due/status or overcompressed 320px text |
| **P2 — shared-system consistency** | 36px buttons/inputs, 0.375rem radius, table type sizes, consistent tabs/sidebar order, source component reuse | No new local button/field styling instead of shared primitives |
| **P2 — accessibility** | Tab/Enter/Arrows/Escape, label and title in English/Bangla, active state, focus return, dark AA contrast, reduced motion | Controls usable by keyboard and touch and comprehensible when text cannot be read |
| **P3 — final polish** | Whitespace, hierarchy, repetition, shadows, hover/focus, subtle motion | Refine only after safety, visibility, function and consistency checks pass |

**Fast audit questions:** What job is this screen for? Which action must always be visible? What does Reset actually reset? Which content cannot be truncated? Does a real 320px customer with Bangla text understand the next step? Does tab order match visual order? Does it work on a 768px tablet without losing a status or `⋮`?

## C. Exact responsive/filter/action contract

1. **Funnel only for filters.** Use `Filter` from `lucide-react` for the collapsed **filter toggle**. `Search` remains a search glyph, `Settings2` stays genuine Settings or chart usage, and `SlidersHorizontal` remains legitimate stock adjustments, where appropriate. Prefer a reused shared control over a new per-page approximation. Use one visible toggle only.
2. **36px square filter toggle**: `variant="outline"`, `size="icon"`, `size-9 rounded-md`; `aria-label` in both languages, `aria-expanded`, `aria-controls`, subtle dot when any *secondary* filter is applied. Default collapsed below 1024; no loss of state when closed/resized.
3. **Phone** (320–767): Search and Filter icon on first row, Date on second **only when module has Date**. **Tablet** (768–1023): Search, Date (if present), Filter all one line. **Desktop** (>=1024): Search, Date and advanced filters visible; compact toggle hidden. Keep keyboard order identical to visible order; do not use CSS `order` to make misleading focus order.
4. **Reset**: existing `RotateCcw` icon; outlined 36×36px, same row immediately after **last Status/type dropdown** (or the last secondary filter if no status); accessible `Reset filters / ফিল্টার মুছুন` name/title. Reuse the module's original `resetFilters`/defaults (Daybook Today, Audit This month, etc.); never invent a uniform date preset or silently clear unrelated Settings. Keep no-results recovery links as needed.
5. **Row Actions**: always visible pinned right on small tables, 36px vertical `⋮` from `ActionMenuTrigger`; `FloatingPanel` + icon/label `ActionMenuList`; menu stays in viewport, Escape returns focus. No direct mutation from a popup command that formerly required a confirmation dialog. Account for **sticky-action overlap with the previous column**; compare badge/ref bounding boxes, not only action availability.
6. **Alignment**: on small screens the right edge of Filter matches the right edge of row Action where those surfaces share a content edge (aim <=8px, justify approved exceptions). Inline Reset aligns vertically with its dropdown, even when other fields wrap.
7. **System polish**: consistent layout rhythm, one-line controls where possible, proper Bangla font, no monospace digits, complete transaction IDs, no duplicate explanatory dates, no full-height decorative cards that waste space. Preserve every page's original function and module-specific filters.

## D. Source audit inventory (2026-11-05; code-level observations, not full visual certificates)

| Priority/order | Area / actual source | Observed condition | Next scoped task |
| --- | --- | --- | --- |
| **Reference** | `src/components/daybook/DaybookFilters.tsx` | Funnel Filter, responsive collapse, inline Reset, URL filter state | Reuse behavior; do not reimplement differently |
| **Reference** | `src/pages/Sales.tsx`, `src/components/sales/{SalesMobileLayout,SalesWideToolbar}.tsx` | Compact Funnel, status Reset, Action menus; long `Part returned` tablet status was found partially occluded | Sales-specific [PR #257](https://github.com/shuvodelux-commits/hisabiq_ui/pull/257) addresses clipping; verify before merge |
| **Next** | `src/components/audit/AuditFilters.tsx` | Text **More filters** and text **Reset** in open toolbar; Source/Status always outside More group; duplicate date mode helper | Convert to approved Search/Date/funnel Filter + fully preserved secondary dropdowns + inline Reset |
| **Next** | `src/pages/Purchases.tsx` | Supplier/Status and text Reset always visible | Add small-screen funnel collapse, Reset icon next to Status; preserve purchase review/payment actions |
| **Next** | `src/pages/Expenses.tsx` | Four visible filters plus text Reset, toolbar wraps | Funnel collapse on small screens, Reset icon by Status, preserve Export and expense filters |
| **Next** | `src/pages/Products.tsx` | Category chip strip + stock segmented filters can dominate narrow toolbar | Audit first; keep fast stock selection and category semantics, potentially use a compact funnel |
| **Next** | `src/pages/Reconciliation.tsx` | Reconciliation-specific search/status and text Clear in empty state | Audit selected transaction and status filter UX; preserve matching workflow |
| **Next** | `src/pages/Finance.tsx` | One transaction-type filter, other submodule flows | Add collapse/Reset only if it improves this tab; preserve finance logic |
| **Special** | `src/pages/Reports.tsx` + report toolbar | Dedicated report filter system | Research its own responsive tab/report/period controls first |
| **Review on visit** | Parties, Accounts, POS, Warranty, Counter and other ERP modules | Different page types; not all have a comparable filter bar | Do not invent controls; audit relevant table and action surfaces when that module is targeted |

**This matrix is a code audit, not a statement that every screen has been visually tested.** One module/PR at a time, including its own actual screenshots and keyboard/touch checks.

## E. UI refine loop required evidence — C0 before any edit

1. Read the target route, exact source components, last approved reference code, `AGENTS.md`, design guide, this checklist, module business contracts, and current GitHub PRs to avoid overlapping changes.
2. Write `docs/ui-refine/<module>/brief.md`: real routes, current behavior, known defects ranked P0–P3, scope, protected handler/permission/state, required UI states and no-design-change rule.
3. Capture **baseline** at 320, 390, 768, 820, 1024, 1440px, **light and dark**, using seeded *real* UI preview data; default, expanded filter, open Action, selected and empty states as appropriate. Record long labels and mixed Bangla names.
4. Add Playwright **failing assertions** for the actual defect (when runnable): Filter icon and count, Reset semantics/position, scrollLeft=0 Action visible, Status and ID not overlapped, 36px bounds, keyboard Tab order, Escape/focus return, popup within viewport and no page horizontal overflow. Capture first-run red result honestly.
5. Run C1 targeted fix → C2 responsive/interaction fix → C3 accessibility/visual polish (or early stop with reason) → C4 independent/mechanical check and closing comparison; `polish` last. Never invent parallel agents or /40 scores when original Workflow runtime unavailable.
6. Verify TypeScript, ESLint, UI contract/inventory, unit suite, production build, Playwright light/dark and audit-sensitive business regression. Verify complete screenshots, actual **opened** states and changed functionality. Record `fixed/partial/not fixed` per issue.
7. Draft PR with ledger, comparison, image evidence and risks. **No auto merge, no backend or payments logic modifications**, no claiming deployment.

## F. Suggested per-module rollout, one task at a time

1. Complete Sales tablet status [#257](https://github.com/shuvodelux-commits/hisabiq_ui/pull/257).
2. Audit Ledger Filter/Reset — nearest mismatch to the approved Daybook system.
3. Purchases list filters and Reset, then Expenses.
4. Products (category and stock quick filters need specific design judgment).
5. Reconciliation, Finance and Reports individually, after comparing actual page states.
6. Repeat only for modules that have comparable table-filter interfaces. Refine global shared primitives only when multiple real consumers require the same behavior, with backwards-compatible opt-in and an inventory/regression check.

**Important:** The approved Daybook/Sales changes **are implemented** in those modules. The remaining rows above are a **fix plan**, not claims of code changes already made.
