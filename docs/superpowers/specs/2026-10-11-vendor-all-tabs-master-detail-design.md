# HisabIQ Vendor: Five-Tab Master–Detail UX — Design Specification

**Date:** 2026-10-11  
**Status:** In-chat design approved; this written specification awaits owner review  
**Repository:** `shuvodelux-commits/hisabiq_ui` (UI preview, not the main HisabIQ backend)  
**Foundation:** PR #61 (vendor terminology) → PR #62 (actual shared PurchaseCart) → PR #63 (Received split workspace). This specification extends that work.  
**Supersedes:** Only the five-tab *layout and interaction* details in the earlier 2026-10-10 Vendor workspace design. Existing domain constraints, canonical Party identity, source-linked ledger and top-level Vendor navigation remain.

## 1. Purpose and success criteria

Local shopkeepers must complete day-to-day work with a Vendor without hopping between pages or repeatedly opening large editors. Reuse the approved **Received invoices left / selected task right** interaction in the other Vendor tabs, with exceptions for dense Purchase entry and Ledger reading.

- One canonical Vendor (Party) identity and one accounting/source transaction per action.
- Five existing tabs remain: **Ledger | Products Received | Products Issued | Purchases | Payments**, with concise Bangla helper labels.
- On desktop, list/record selection is immediate; there is no mandatory "Record Settlement" click to reveal the right panel. On phones the list precedes the working panel.
- **Do not copy MagicPath-generated React.** Reuse the current GitHub code, existing shadcn/theme primitives, PurchaseCart, PurchaseEditor, and finance controls.
- **Keep it simple:** minimum clicks and form fields, aligned dense inputs, keyboard and touch operation, one primary contextual action, no fake buttons.

## 2. Architecture and component boundaries

The current `src/components/vendor/VendorTabs.tsx` is ~394 lines and coordinates five unrelated bodies. Keep it responsible for common Vendor header, four status cards, tabs, context, deep links and unsaved-navigation guard. Delegate individual tab body composition to small components under `src/components/vendor/`:

- `VendorReceivedWorkspace`: move the approved PR #63 split UI into a focused component without changing the canonical Received behavior.
- `VendorIssuedWorkspace`: reuse list/detail pattern, selecting an issued memo on the left, displaying collect-money/receive-goods actions on the right.
- `VendorPurchasesWorkspace`: read-only selected Purchase summary beside compact Purchase list, with the existing `PurchaseEditor` occupying full width for **Buy Products**.
- `VendorPaymentsWorkspace`: balances and payable/receivable source list (plus history) on the left; source-specific Vendor payment form on the right.
- `VendorLedgerWorkspace`: keep the **full-width ledger table** until an item is selected, then provide a compact details/correction inspector or existing dialog without compromising numeric columns.
- A small shared `VendorMasterDetailLayout` may provide the **40% / 60% desktop grid**, stack order, accessibility and overflow handling; it must contain no financial logic. Do not create a broad, configurable form framework.

Use the **existing** `VendorGoodsEditor` with `PurchaseCart` and its vendor adapter for received/issued products. Use the **existing** `PurchaseEditor` for purchases; do not fork or recreate its cart, supplier memo, discounts or multiple-payment panel. Retain `VendorClearDuePanel`, `VendorActionDialog`, `VendorCorrectionDialog`, `VendorStatementDialog` and `projectVendorPartyProfile` as the underlying workflows.

### Payment-component constraint

`PartyPaymentDialog` currently accepts **Customer | Supplier only**, and its underlying Customer/Supplier settlement logic must **not** be applied to Vendor merely by passing a different label. Vendor payment posting stays with `dispatchVendorPreview` and the existing `settle-source` / `clear-source-due` commands. Extract a reusable vendor source-action **form body** from `VendorActionDialog` for embedding in the right panel, while keeping the existing dialog as a wrapper for callers that need a modal. Use `FinancePaymentSplitEditor` (and its typed `FinancePaymentDraft`) wherever compatible, with a single explicit conversion/validation adapter to the Vendor command's integer-paisa `paymentSplits`; never maintain two similar splitting UIs or issue duplicate transactions.

The Party → Vendor Account and top-level Vendor workspace should launch the **same** Vendor source-linked payment operation, with correct direction and source preselection; they must not generate independent Party/Supplier payment entries.

## 3. Shared interaction contract

### Selection and navigation

- Desktop breakpoint: use the existing `lg` layout convention from PR #63; **40% list / 60% panel** for tab bodies that support it. Keep one visible working panel.
- First render selects the **first actionable record**. Prefer records with outstanding money or product returns; if none, select the first existing record as a read-only detail. An unpriced received memo is actionable for price-setting and product return, **not** for payment. Never create a false zero due.
- Honor `partyId`, `tab`, and valid `sourceId` deep links. A source identifier must belong to the selected Vendor and the current tab's source kind; invalid or closed sources fall back safely.
- Clicking an item changes the selected panel immediately. Preserve search/date filters and scroll position when possible; make selection obvious with a subtle row state and `aria-pressed` or equivalent.
- Changing Vendor or tab resets transient editor context; warn before discarding dirty cart/payment drafts. After successful save, clear the submitted form, refresh the relevant source/summary from the canonical preview store, and select the next actionable record if the previous one has no remaining obligation.
- When a filtered list is empty, explain why and expose a clear useful next step. Completed records remain browseable; no forced payment editor for already settled records.
- Keyboard: Arrow/Enter navigation or clear focusable list rows, Escape/back/cancel behavior, no unexpected submission, existing F2/Enter purchase-cart flow unchanged. Buttons have accessible names and minimum usable touch targets.
- Mobile (< `lg`): **list above detail**, single-column forms, no horizontal overflow for ordinary controls; dense PurchaseCart/Ledger tables may use their existing managed horizontal scrolling.
- Date filters, status, search, and select must use the existing themed controls; no custom native dark-theme color exceptions. Do not introduce monospaced digits.

### Layout

- Vendor header and four summary cards remain compact. Financial summary links select appropriate tabs; purchases remain a separate payable bucket.
- Avoid a redundant per-tab heading/toolbar row where the tab title and actions are already visible in the upper strip.
- For settlement/payment grids, align label heights, select/input heights, amount columns and note rows; total/remaining balance stays visible near Save. Bangla helper text is secondary and never causes controls to misalign.
- Inline record details and routine actions; use dialogs only for confirmations, guarded corrections or the existing detail-wrapper when appropriate.

## 4. Tab-by-tab design

### A. Products Received — preserve PR #63, polish only

**Left:** searchable received memo/invoice records showing reference, product, date, outstanding base quantity and one of **Price not set**, **Amount payable**, or **Settled**. Active selection clearly highlighted. Set Price, More, correction and return remain contextual.

**Right:** automatically selected memo uses the actual `VendorClearDuePanel`, showing Amount Due, Products Outstanding, Balance After Settlement, split-account money payment, matched product return quantity, note, and Save. If the memo is unpriced, allow product return or set price but disallow pretending its cost is zero. After settlement, reselect the next outstanding memo.

**Primary Receive Products:** swap to the existing `VendorGoodsEditor mode="taken"` / `PurchaseCart variant="vendor-received"`; span the **full content width** while editing, then return to the list/details view after save/cancel. Do not shrink the dense cart into 60%.

### B. Products Issued

**Left:** issued goods memos with product, date, quantity still out and **Amount Receivable / Settled**; search, status and selection.

**Right:** source details (quantity and receivable), with clear **Receive Payment** and **Receive Returned Products** actions. Choose one embedded action body at a time; use the existing `VendorActionDialog` action handler or extracted reusable form body, preserving partial receipts and stock validation. After successful completion, show updated outstanding values; an already settled memo is read-only but still has View/Correct where permitted.

**Primary Issue Products:** display `VendorGoodsEditor mode="given"` using the **existing shared PurchaseCart** at full width. Its agreed selling/transfer price and stock validation remain mandatory as currently implemented.

### C. Purchases

**Left:** Vendor-filtered Purchase invoices with date, reference, total, paid amount, due/paid state and search. Use the existing `purchases` data already supplied to VendorTabs; do not generate a second Purchase record.

**Right:** selected Purchase **read-only detail**: existing reference, line overview where available, totals, paid/due, memo, and only actions actually supported by the existing Purchase module. Do not create a second payment, purchase-return or editing implementation; supported operations must call the same original Purchase workflow. If an action is not connected, show information rather than a button that does nothing.

**Primary Buy Products:** reuse existing `PurchaseEditor embedded initialSupplierId={party.id} lockedSupplierId={party.id}` in full-width mode, preserving product Quick Add, multi-units, serial handling, payments, discounts, rounding and receipt attachment.

**Critical accounting boundary:** ordinary Purchase dues/payments belong to **Purchase** records, never silently to Vendor sourcing payables. `profile.summary.purchaseDuePaisa` must remain distinct from `takenDuePaisa`.

### D. Payments

**Left:** grouped selection for **Payables** (received source), **Receivables** (issued source) and **History**. Each outstanding row states source reference, direction, amount and status; include ordinary Purchase dues in a separate visibly labeled group or link to the original Purchase workflow, **never** auto-allocate to Vendor source payment.

**Right:** the selected source displays one appropriately directed action: **Make Payment** for payable source, **Receive Payment** for receivable source; both reuse the same shared Vendor action/finance split controls and source-linked commands. Include account selection, split amount(s), current due, optional note, review/confirmation and remaining due. No amount entry for unknown-price source until price has been agreed.

**Action launch from Party:** preserve the exact intended money direction and source. Existing `PartyDetail` shortcuts currently redirect into the Vendor payments tab without direction: the implementation must correct that ambiguity by selecting the proper section/source rather than posting arbitrary money. When there is no qualifying source, show a clear empty state; do not silently choose a different bucket.

**History:** show recorded Vendor settlements with source-link and reversal/correction review; no duplicate posting when opening a history row.

### E. Ledger

Use the **current full-width compact Vendor ledger**, not a permanently narrow 40%-width table. Its upper tab/header area contains **Print Ledger** and **More** so the empty extra heading row can be removed. The first content row contains balance-side selector (**Amount Payable / Amount Receivable**), date range and search, then summary and right-aligned numeric table columns.

Selecting or reviewing a row opens a contextual inspector beside/over the table, or retains existing `VendorCorrectionDialog` where the full-width table would otherwise become unreadable. Preserve View, Edit/Correct, Reverse and audit history affordances from current working workflows; no unimplemented action buttons.

**Do not net two balances:** payable and receivable running statements are separate projections from `projectVendorPartyProfile`. Unknown-cost source records stay explicitly unpriced, never fake ৳0, and are accessible via their original memo.

**Opening Balance** management is a **Party → Vendor Account** action using the existing `PartyOpeningDialog` presentation. The current `VendorTabs` ledger's separate inline "You owe opening / Vendor owes opening" buttons must be retired. The Vendor preview and Party ledgers must not acquire two independent openings: adapt the existing Vendor opening command at the one Party entry point, or block final merge until the single-source opening path is verified. This UX redesign does not introduce a new accounting source.

## 5. Data rules and guardrails

- This repo is a **UI preview**. Do not change NestJS/backend APIs, tenant rules, production inventory or banking behavior.
- Reuse the existing `VendorSource`, `VendorPreviewState`, `VendorSettlement`, `VendorLedgerEvent`, `VendorPartyProfile` and `Purchase` types. Do not migrate `sourceKind: 'sourcing'|'issue'` or existing tab URL keys `taken`/`given`; visible English remains **Products Received / Products Issued**.
- Vendor receivable and payable are different directions; ordinary Purchase due is a separate bucket.
- Internally, money is integer paisa, source quantity is in base units, and unknown unit costs are `null`; no implicit zero/negative/float money conversion.
- Keep Vendor source-linked payment validation, settlement allocation, return stock validation and idempotency exactly as currently modeled. Forms may be extracted, but command logic must not be duplicated.
- Protect dirty edits when switching rows, tabs, Vendors or opening full-width carts.
- Preview should state that no real cash/stock is posted; never show a successful payment before the canonical preview store accepts it.

## 6. Existing code to reuse; anticipated focused changes

| Area | Existing files / behavior |
| --- | --- |
| Tab shell, route/deep links | `src/components/vendor/VendorTabs.tsx`; `src/vendor/vendorRoute.ts` |
| Received source settlement | `src/components/vendor/VendorClearDuePanel.tsx` (PR #63) |
| Issued actions, reusable form body | `src/components/parties/VendorActionDialog.tsx` |
| Canonical cart and editors | `src/components/vendor/VendorGoodsEditor.tsx`; `src/components/purchases/PurchaseCart.tsx`; `src/pages/PurchaseEditor.tsx` |
| Shared finance controls | `src/components/finance/FinancePaymentSplitEditor.tsx` and existing account/selector primitives |
| Party account and opening | `src/components/parties/PartyDetail.tsx`; `src/components/parties/PartyOpeningDialog.tsx` |
| Source and read-only projections | `src/vendor/vendorModel.ts`, `vendorPreviewStore.ts`, `vendorPartyProjection.ts`, `vendorActivity.ts`, `vendorLedger.ts` |
| Statements and corrections | `VendorStatementDialog.tsx`, `VendorCorrectionDialog.tsx` |

Do not add new top-level routes, change sidebar categories, or alter Purchase module layout. Organize extracted components by tab responsibility rather than building a generic ERP page builder.

## 7. Test and acceptance criteria

Implementation uses **red/green TDD** for each tab, followed by full CI. Add small browser tests under `scripts/` (or extend existing Vendor scripts) using the real shared components, not static mockups.

1. **Received regression:** first outstanding selection, source switching, settlement save resets the form, full-width canonical PurchaseCart when receiving, unpriced goods stay unpriced, desktop/mobile geometry.
2. **Issued:** list/detail split, select a second memo, **Receive Payment** source and direction are correct, receive matching returned goods, issue cart remains the real PurchaseCart, no payment for settled rows.
3. **Purchases:** only selected Vendor invoices appear, Purchase paid/due display matches source records, **Buy Products** mounts the actual PurchaseEditor at full width, mixed-unit discount/split payment flow unchanged.
4. **Payments:** source-linked money-in/money-out, multiple account splits sum correctly, validation of unknown price/overpayment, unique operation, correct Party deep-link direction, original Purchase due never mixed into Vendor sourcing.
5. **Ledger:** full-width numeric readability, balance-side changes running totals without netting, date/search controls, selected event actions, Print Ledger in top toolbar, unpriced history visible, opening only via Party.
6. **Navigation/responsive:** 1280–1440 desktop split, 390px phone stack, no control overflow, focus/keyboard flow, unsaved draft guard, invalid source links, empty, filtered and fully settled cases, light/dark contrast.

Suggested verification commands (CI equivalent may use its own runner): `npm test`, `npm run build`, `npm run test:vendor-workflow`, `npm run test:vendor-goods`, `npm run test:vendor-evening`, `npm run test:vendor-party-profile`, `npm run test:purchase` (confirm exact script before execution), plus full GitHub UI Check.

## 8. Delivery sequence and exclusions

Dependencies first: **PR #61 → #62 → #63**, then implement and review the five-tab extension as a separate stacked PR. Avoid merging stale branches out of order. Prefer **Native Superpowers implementation** with test-first per tab, because all tabs share source selection and payment adapters; execution mode is confirmed after the implementation plan review.

1. Extract/reuse the PR #63 Received shell with no behavior regressions.
2. Implement Issued using the shared selection/detail and source-action form.
3. Implement Purchases without changing PurchaseEditor.
4. Implement Payments with shared Vendor source-linked finance adapter; fix Party launch context.
5. Polish Ledger/Party opening link, responsive behavior and full regression suite.

Not part of this scope: redesigning POS or PurchaseCart, backend integration, true consignment accounting, creating new purchase-return semantics, settlement model migration, generic Vendor/Supplier balance netting, or generating replacement UI from MagicPath.
