# Vendor workspace: five simple tabs, no action-button wall
**Design specification — 2026-10-10 · status: for user review**

## 1. Decision and purpose

This supersedes the crowded Vendor page design, **not** the Vendor financial model approved in `2026-10-10-vendor-sourcing-ledger-design.md`. Intended users are Bangladesh shopkeepers on desktop and mobile, often using a keyboard or touch screen. The user approved the concept of five tabs and requested everyday wording throughout the UI. This document is the buildable detail for review before implementing.

**Goal:** From one Vendor's Party profile, complete all Vendor tasks in the relevant tab without navigating to other ERP modules and without opening enormous scrollable dialogs.

Non-negotiables:
- KISS: show one primary action per tab, secondary actions beside the relevant record; hide infrequent actions under a clearly labeled **More** menu.
- Keep **one Party record** with multiple roles (Vendor/Supplier/Payee/etc.). Never require creating a second supplier record for ordinary purchases.
- Preserve four **separate** figures: money you owe for Vendor-taken products, quantity of taken products without a price, money the Vendor owes for goods you gave, and money you owe for ordinary purchases. Never silently offset one against another; unknown price is **not ৳0**.
- Preserve original invoices, settlement links, independent due buckets, audit events and tenant boundaries. Do not claim a demo action posts real inventory, accounts or ledger.
- Show simple English labels with short Bangla helpers; avoid words requiring accounting training. A transaction can be paid/cleared **any time**. Do not mention `evening` anywhere in user-facing copy.

## 2. Screen anatomy and layout

1. **Compact Party header:** avatar, name/Bangla name, phone, location and relationship badge. Top-right **More** menu: Edit Party, switch another role, opening balances, inactive/active where supported. Separate role selector stays discoverable for multi-role people. Demo badge is discreet, not repeated in every label.
2. **Compact money summary:** four clear mini-readouts, with unit-aware **Price not set** quantity/count; monetary readouts each have their own name. Do **not** add these four balances together. Default one line on wide screens and two-up on narrow. Clicking a summary takes user to its relevant tab and filtered rows.
3. **One horizontal underlined tab bar**, following the Party screenshot: **Ledger · হিসাব**, **Taken · নেওয়া পণ্য**, **Given · দেওয়া পণ্য**, **Purchases · কেনাকাটা**, **Payments · টাকা লেনদেন**. Use `tabs variant=line` style; accessible `tablist`, `tab`, `tabpanel`, and arrow-key navigation. Preserve tab on same-Party record updates; reset appropriately on Party change.
4. **One contextual tab toolbar:** tab title + **one primary button** on the right; show search/date-range only where needed; optional More dropdown for print/export/opening/corrections, not a full toolbar of permanent actions.
5. **Tab contents:** compact record rows or POS-style inline editor, not another set of nested modals. Record details may expand inline. Confirmation/correction may use a **small**, accessible dialog, never a wide editor inside a dialog.
6. On narrow screens: tab strip scrolls horizontally without wrapping; header condenses; totals form two columns; editors stack vertically; no page-level horizontal scrollbar, no double scrollbar. Keep touch targets comfortably sized.

**Remove** the current eight-button action toolbar and the separate Opening Balance action row from the Vendor page. Both payable/receivable opening forms are reachable through **More → Opening Balance** (with an explicit direction selector) and remain clearly historical, noncash entries.

## 3. Five-tab responsibility matrix

| Tab | Primary action | Record-area actions and required capabilities |
|---|---|---|
| **Ledger · হিসাব** | **Print Ledger · হিসাব প্রিন্ট** | Filter start/end dates with date-range picker; search; balance at start/end; money in/out visually distinct **and explicitly labelled**; View, Correct, Cancel Entry (audited reverse with reason), CSV export in More; link to original purchase, taken/given memo, payment or sale; include unpriced and reversed items in **Activity**, but do not invent a cash amount for them. |
| **Taken · নেওয়া পণ্য** | **Take Products · পণ্য নিন** | See Vendor goods taken for sales (including POS shortage links) and optionally recorded directly from Vendor; filter **Price not set**, **Money due**, **Cleared** within tab; open record for **Set Price · দাম ঠিক করুন**, **Pay Money · টাকা দিন**, **Return Products · পণ্য ফেরত দিন**, **Clear Due · বাকি মেটান** (money, matching products or both), View Sale, Correct (guarded). Quantity / price / payment can be partial; quote later at any time. |
| **Given · দেওয়া পণ্য** | **Give Products · পণ্য দিন** | Full-width POS-style **give** cart, multi-product memo, compound units, agreed price, product stock availability and unit conversion; record memo; list past memos and balance; per memo **Receive Money · টাকা নিন**, **Get Products Back · পণ্য ফেরত নিন**, partial receipts, View/Correct (guarded). Goods issued create **Vendor owes** not **You owe**. |
| **Purchases · কেনাকাটা** | **Buy Products · পণ্য কিনুন** | Embed existing `PurchaseEditor` **directly in tab** with Vendor already selected; preserve POS-style search/cart, Enter navigation, add product from same screen, brand/category/unit Quick Add, combined-unit quantity, purchase price unit switch, discounts, attachments/supplier receipt, one/multiple payment accounts, due amount. Below or beside editor, ordinary Purchase list with View, Edit/Duplicate (where implemented), Pay Due, Return Products, Refund/adjust, Print. No separate `VendorPurchaseDialog`. Standard owned stock and ordinary Supplier payable remain separate from Taken. |
| **Payments · টাকা লেনদেন** | **Record Payment · টাকা লেনদেন যোগ করুন** | List paid/received transactions, cash/bank/mobile banking, payment account, date/reference, **which record and which balance** they belong to. Payment form chooses **Pay / Receive**, then **Taken / Given / Purchase** due and exact source/invoice; show due before/after; split across multiple accounts; View, Correct/Cancel Entry with reason and compensation. Never create a free-floating, silently netted Vendor balance payment. |

**Do not duplicate a complete payment form in multiple tabs.** Context buttons in Taken, Given and Purchases open the **Payments tab prefilled** with Vendor, balance direction and source. Returning completes inside Vendor workspace; preserve the origin tab/record in a small “Back to Taken/Given/Purchase” link. The Payments tab handles every actual money transfer; Taken and Given can keep a compact **Clear Due** flow for money-plus-physical-stock combined actions that calls the same payment component. Recording a goods-only return stays in Taken or Given because no money moves.

**“Take Products” is distinct from “Buy Products”:** POS-sourced goods are not yet ordinary owned-stock Purchases. Directly taken goods are linked Vendor source records; if no money price was agreed, **Price not set** is visible rather than automatically valuing stock.

## 4. Reuse; do not fork POS or Purchase behavior

- **Purchases:** `src/pages/PurchaseEditor.tsx` already supports `embedded`, `initialSupplierId`, `onCompleted` and `onCancel`. Render within Purchases tab at full available width, not inside `src/components/parties/VendorPurchaseDialog.tsx`. Preserve two-column cart + sticky checkout where width allows, single column on mobile. Do not nest scrollable dialogs or squeeze the 1440px editor into a 500px popup. Show editor only when “Buy Products” is active; existing Purchase list remains visible otherwise. After save, return to the Purchase list and refresh its snapshot. Keep cart draft when user changes tabs; warn before discarding unsaved changes or changing Party.
- **Given:** reuse shared `PurchaseCart`/POS cart **components** and `CompoundQuantityInput` product search, inline rows, keyboard sequence and touch add—not the `PurchaseEditor` posting route (that would create a Supplier purchase) and not the POS sales posting route (that would create a Sale). Extract a common cart row/product picker only as needed, and keep Vendor **issue-goods-memo** in the Vendor domain. Prevent negative owned stock; use agreed Vendor price and unit conversions.
- **Taken:** use the same compact multi-product cart shell where manual source entry is needed, with optional price and date/reference; keep the POS shortage `StockShortageDialog` linked to sale invoice and cart allocations. Never silently duplicate source from POS when revisiting the tab.
- **Payments:** reuse existing payment rows/split selector and account picker across POS, Purchase and Vendor when practical. **Pay**, **Receive** and **Clear Due** must preserve different ledger sides and statuses.
- Prefer shared shadcn-like `Tabs`, `AppSelect`/QuickAdd, date-range, accessible Dialog/AlertDialog, Button, Tooltip and DropdownMenu patterns already used in HisabIQ. Keep theme-token colors rather than new one-off dark-mode shades.

## 5. Essential end-to-end user stories and accounting rules

1. POS has 4 in stock, customer wants 8. Vendor provides 4; sale is linked, Vendor source appears in **Taken**. Vendor price can be unknown until later; no fictional money payable is shown.
2. Shopkeeper agrees price at **any time**; use **Set Price**, then **Clear Due** via one or more money accounts, equivalent own-stock return, or both; partial balances survive and are reflected in **Ledger** and **Payments**. Goods fully returned before pricing can close without inventing price.
3. Shopkeeper gives Vendor products from owned inventory; one memo can contain several different products and mixed compound quantities (e.g. Box+Pcs, Gauge+Gira). **Given** creates Vendor receivable; later Vendor gives money or matching products back, including partial receipts.
4. Same Vendor also sells ordinary products. **Purchases** records normal stock purchase and payment/credit separately; no duplicate Party and no double stock projection. If Purchase due remains, it shows in **Purchase due**, not **Taken due**.
5. Purchase return/refund belongs to Purchases. Never count it as a Vendor sourcing return; credit/refund flows must be represented before implementation is called complete. Existing preview functions may be incomplete here; distinguish UI design from working accounting.
6. Wrong date/amount/product: choose **Correct · সংশোধন** from the relevant row, see related source(s), invoice and payments; an audited reverse requires actor, reason and confirmation. If a linked settlement exists, reverse the dependent payment/return first; original history remains visible. Source-linked customer return needs explicit physical-ownership review, not automatic stock increment.
7. Vendor is also Supplier and/or Payee: Party details retain all relationships; switching role does not lose Vendor tab work. Deactivation does not erase historical statements.

**Audit and integrity invariants:** tenant scope always from authenticated session in backend, never client-supplied IDs; original source/settlement/invoice immutable; positive whole paisa accounting for known values, `null` unknown, no phantom zeros; no implicit cross-side netting; linked idempotent operation and exact duplicate Purchase receipt protection; no claiming backend writes in preview. Existing domain constraints outrank cosmetic layout.

## 6. Plain-language dictionary (English + Bangla)

Use short names consistently in buttons, labels, empty states, toasts, filters, emails/print wherever appropriate; leave technical domain terms in code only.

| Avoid in visible UI | Use in UI |
|---|---|
| Evening settlement, Settlement, Reconciliation | **Clear Due · বাকি মেটান** (when clearing debt); **Pay Money · টাকা দিন** (when paying); **Receive Money · টাকা নিন** (when receiving) |
| Vendor sourcing, Borrowed stock | **Taken Products · নেওয়া পণ্য** |
| Goods issue, Issue memo | **Given Products · দেওয়া পণ্য**; button **Give Products · পণ্য দিন** |
| Confirm Vendor source price | **Set Price · দাম ঠিক করুন** |
| Price pending, Unpriced source | **Price not set · দাম ঠিক হয়নি** |
| Known payable, Vendor sourcing payable | **You owe · আপনার দেনা** (tab context: “Taken products”) |
| Vendor receivable | **Vendor owes · পাওনা** |
| Ordinary purchase payable | **Purchase due · কেনাকাটার বাকি** |
| Balance allocation, Payment allocation | **Which bill? · কোন হিসাবের টাকা?**; **Amount · টাকার পরিমাণ** |
| Reversal, Reverse event | **Cancel Entry · এন্ট্রি বাতিল**; explanation: “Keeps a record of the change”; ask required reason |
| Record issue memo | **Save Given Products · দেওয়া পণ্য সেভ করুন** |
| Source review required | **Check linked sale · বিক্রির হিসাব দেখুন** |
| Paid in / Paid out | **Money received · টাকা পেয়েছেন** / **Money paid · টাকা দিয়েছেন** |

Do **not** replace all domain concepts with “Due”: always show whose debt and which bucket; the Bangla helper should carry the same meaning and be easy to read. Use no “evening” language. Keep numerals natural (no monospaced digits).

## 7. Component / code impact (design scope, not implementation authorization)

- Refactor `src/components/parties/VendorWorkspace.tsx` from button wall + record list into compact header/summary, five horizontal tabs, contextual toolbars, tab-local editor/list states and keyboard navigation.
- Replace modal-first `VendorPurchaseDialog` with conditional `PurchaseEditor` mounted in Purchases tab. Preserve reusable PurchaseEditor props and test no double scrolling / role identity.
- Refactor modal-only `VendorIssueGoodsDialog` into an **inline** `VendorGiveProductsEditor` reusing POS cart controls. Keep the existing Vendor memo reducer and validation.
- Keep `VendorActionDialog` for small source/quote/return confirmation only if needed, but rename all copy, remove default modal as primary workflow, and route financial payments through Payments tab.
- Retain `VendorCorrectionDialog` (reason/impact review) as a **small** destructive-action confirmation; surface through row More menus; do not put 3–5 row buttons on every record.
- Factor accessible reusable `VendorTabs` / Party profile line-tabs shell once stable; **do not** change Customer/Supplier/Lender/Borrower operational behavior in this Vendor slice. A later approved pass can reuse the visual shell with role-specific tabs.
- Reuse existing `src/vendor/vendorModel.ts`, `vendorPreviewStore.ts`, `vendorCorrection.ts`, `vendorActivity.ts` and ordinary Purchase demo store. Never fork or duplicate ledger logic to make tabs work.
- Use theme tokens, current Magic Patterns visual language, current shadcn-style components, consistent dark/light popovers.

## 8. States and accessibility

- **Default:** Vendor opens with **Ledger** selected; if previous role/tab persisted during same Party session, preserve its selection.
- **Empty:** “No taken products yet” + contextual **Take Products** only; “No payments yet” + Record Payment, etc.
- **Incomplete:** unsaved cart/price entry remains while switching Vendor tabs; Party change triggers leave warning.
- **Error:** invalid quantity/price/amount, missing agreed price before cash payment, insufficient stock, wrong vendor/side, duplicate operation/return, related events block correction; error directly near the field, plain-language repair path.
- **Loading/demo:** clear one-time “Preview only · no real stock or money changed”; avoid redundant toast claiming “posted”.
- **Theme:** dark/light dropdowns/selects/date picker use semantic tokens, no off-brand white menus.
- **Keyboard:** left/right/Home/End tab controls, focus returns to invoker on closing dialog; search Add Product → Qty → next row Add Product; F2/F8/F9 scoped to visible embedded Purchase, not globally when other tabs open.
- **Accessibility:** tabs correctly tied to panels, focus ring, aria labels for icon-only buttons, full keyboard access to date range, menus, quantity; clear status beyond color, ≥44px touch targets where practical.
- **Responsive:** mobile 320–430px, tablet and desktop 1024px+, no clipped form/footer, no nested vertical scroll, no horizontal page scrolling. Dense tables can scroll **their own data area** if genuinely necessary.

## 9. Acceptance gate / scope truthfulness

Before claiming “all Vendor work done”, prove:
- All five tabs accessible on mouse, touch and keyboard; each has a clearly scoped action and sensible empty state.
- The giant Purchase modal and toolbar are gone; Purchase cart usable full-width; Give cart matches POS multi-unit semantics; no clipping at mobile width.
- POS shortage → Taken → Set Price → Clear Due (cash, goods, mixed) → Ledger/Payments; Given multi-product → receive money/goods; ordinary Purchase → independent due and stock once.
- Purchase refunds/returns and corrections are either demonstrably working with tests **or explicitly reported as unfinished**; do not present broken placeholders as fully implemented.
- Ledger activity date range, statement export/print, original source links, reversing a payment/return and proper audit history.
- Change in theme or language never makes actions ambiguous; no stale “evening settlement”, “source amount zero”, or raw technical labels in visible UI.
- Run full unit tests, build, UI contract, Vendor/POS/Purchases/Parties/theme/browser regressions. Run GitHub CI on exact PR head. CI currently fails before runner allocation (zero steps); this must be resolved before merge. **No merge/deploy without user approval.**

## 10. Deliberately outside this design

Real NestJS accounting and inventory posting, multi-tenant backend authorization, true consignment, and broad redesign of unrelated modules. These need their own scope and independent approval. This five-tab work changes the **Vendor UI**, not the main `hisabiq` production backend.

**Outstanding handoff:** User approved the five-tab direction in conversation. This written spec needs separate user review/approval before writing the stepwise implementation plan or changing product code.
