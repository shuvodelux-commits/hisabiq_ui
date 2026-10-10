# Vendor Sourcing & Two-Way Vendor Ledger — Design Specification

**Date:** 2026-10-10  
**Project:** `HisabIQ_ui` (UI/design-only repo; not the NestJS `hisabiq` backend)  
**Status:** Reviewable specification; implementation NOT authorized by this document alone  
**Decision:** Vendor sourcing and Vendor ledger in v1; true consignment postponed as an optional advanced feature.  
**Execution preference:** Native Superpowers (no subagents).  
**Design authority:** Existing Magic Patterns export and adopted HisabIQ shadcn-like components, compact information-rich bilingual UI, light/dark tokens, and POS V2 interaction contract.

## 1. User intent and measurable result

An SMB cashier facing insufficient stock must finish a normal POS workflow without moving to another module: sell only owned stock, record an intentional negative sale, or source the shortage from a Vendor. The shop owner must then review and settle Vendor payables or receivables from the **same Vendor Party profile** (money, physical goods, partial settlements, source invoice, date-filtered ledger, print/export, correction/reversal). Existing multi-unit entry (`Box/Pcs`, `Gauge/Gira`) and existing cart/draft state must survive Quick Add.

Success means: the cashier can see and choose an explicit, correct shortage action; a Vendor can be created inline without losing the cart; the Vendor profile shows independent payables and receivables; every simulated obligation/settlement has a traceable source and changes only the appropriate balance; all interfaces explicitly say **preview/demo** until a real transactional backend is connected.

## 2. Alternatives considered

1. **Copy the legacy Vendor top-level module** — faster screen port, but duplicates the existing Party master, permissions, ledger and design system. **Rejected.**
2. **One Vendor relationship with a net signed Party balance** — smallest data model, but payable and receivable cancel deceptively, including on multi-role Parties. **Rejected.**
3. **One canonical Party ID with two Vendor subaccounts and source-linked operational records** — modest additional domain logic, reuses existing Party UI, keeps audit/accounting semantics explicit. **Selected.**

Do **not** equate Vendor sourcing with true consignment. In this scope, the missing units are sourced from another shop at a negotiated cost for a specific sale; they are not recorded as owned stock. Later true consignment would require vendor-owned physical lots, custody/ownership, agreement, commission/principal distinction, stock-on-hand vs owned-stock availability and independent valuation.

## 3. Verified existing code and legacy reference

Current `main` files inspected:

- `src/components/pos/StockShortageDialog.tsx`: Own/Negative/Vendor choices; static `parties` vendor list; vendor cost; per-line decision.
- `src/components/pos/CartTable.tsx`: shortage chip/modal, compound quantity, reorder, serials.
- `src/hooks/usePosCart.ts`: line `stockSource`; clears choice after quantity/unit changes.
- `src/utils/posStock.ts`: stock availability, shortfall and blended vendor cost; currently per-line, not an authoritative cart-wide reservation.
- `src/pages/Pos.tsx`: produces a `CompletedSale` receipt/dialog from fixture data **without persisted sale/stock/vendor/cash/customer posting**.
- `src/types/erp.ts`: `PartyRole` already includes Vendor, `SaleStockSource` records Negative/Vendor, `SaleLine.stockSource`, `StockLot` quantities in base unit.
- `src/pages/Parties.tsx`, `src/components/parties/PartyDetail.tsx`, `src/data/partyPreviewStore.ts`: Party-centric layout and in-memory audited preview, but Vendor-specific two-sided settlement is absent.
- `src/types/partyLedger.ts`, `src/utils/partyLedger.ts`: signed single-relationship statement. **Do not try to net Vendor's two balances through it.**
- `src/components/parties/PartyStatementDialog.tsx`: working date-filtered CSV/print conventions to reuse.
- `src/navigation/erpNavigation.ts`: Parties & Ledger group currently labels a child `Suppliers & Vendors` even though the child filters `role=Supplier`; add a distinct Vendors child and make Suppliers accurate, without a new top-level module.

Legacy source of truth for feature *behavior*, not frontend styling: `sherERP_Mohim/Vendors.gs`, `Sales.gs`, `SalesManagement.gs`, `StockLots.gs`, `vendors.html`, `vendorWorkspace.html`, `NET_STOCK_VENDOR_SHORTAGE_FIX_REPORT.md`, and `tests/vendor_multi_product_memo_regressions.test.js`.

The legacy model links `VENDOR_SOURCING` to a sale and separates `Current Due` and `Current Receivable`, with Pay, Return to Vendor, Give Goods, Receive Money and Receive Goods. Preserve these meanings, but strengthen cross-document correction consistency rather than silently rewriting source records.

## 4. Information architecture and UX

**Route:** `/app/parties?role=Vendor`, or `/app/parties?id=<partyId>&role=Vendor` for a selected profile. A Party may simultaneously be Supplier and Vendor; relationship switching stays inside its profile. Vendors is a child of Parties & Ledger, not a new top-level module.

**Workspace summary:** Vendor name, Bangla name, phone/address, active status, Edit; two independent cards:
- **You owe vendor / দেনা** — payable balance.
- **Vendor owes you / পাওনা** — receivable balance.
Never print only one signed net number as Vendor balance. Include outstanding sourced units and issued units as secondary indicators when available.

**Action strip:** Pay Vendor, Return Goods, Give Products, Receive Money, Receive Products, Ledger Statement; compact visible primary actions plus an accessible actions menu on narrow screens. Actions open dialogs/drawers in-place; no context-destroying redirect. User can open an original POS invoice within a source-detail sheet; if navigating, preserve Party ID, relationship, date range, search and tab in return state.

**Workspace tabs:** Ledger (default), Sourced Sales / Payables, Goods Issued / Receivables, Settlements. One combined history may display a `Side` column (`Payable` or `Receivable`) with **side-specific running balances**. Date-range picker, search, status/type selector, page size, clear filters, Print/CSV and row actions. Print/export carry actual filtered rows, opening balance and closing balance *per side*; no fabricated print success toast. Debit/credit directional styles are subtle plus textual `Money out`, `Money in`, `Goods out`, `Goods in` labels; never rely only on colors.

**POS shortage modal:** Three radio-card choices: Own Stock (clamp entire line; zero removes), Negative Sale (shortage becomes an outstanding negative-stock obligation), Source from Vendor (only the shortage sourced; own available portion retained). Show requested, remaining sellable, shortage, vendor, cost per selected unit, converted base-unit cost, vendor quantity, payable amount and estimated gross margin where reliable. Inline `+ New Vendor` uses existing Party creation workflow/validation and returns to the same open cart/modal, auto-selecting new Vendor by **ID**, not name. Searchable vendor picker uses canonical Party preview store (active Vendor role), not frozen fixture list. On any quantity, unit, supplier, inventory revision or price-affecting edit, revalidate the selection. Do not preselect a Vendor automatically.

**Interaction contract:** shadcn-style app Select/Combobox, Popover, Dialog, AppDatePicker/range and POS V2 compound cart; keyboard Enter, Esc, focus restore; touch-friendly; responsive at phone/tablet; accessible disabled reasons; dark theme uses tokens, no hardcoded `blue-50` as an unsafely contrasting base; no monospaced digit fonts. English primary + short Bangla helpers.

## 5. Domain model and data ownership

Retain one canonical `Party.id` and `Party.roles[]`. Do **not** create a `Vendors` master table in the UI. Vendor-specific information is an independent operational subledger, keyed by `vendorPartyId`, and not merged into the generic single signed `Party.balance`.

Suggested `src/vendor/vendorTypes.ts` interfaces:

- `VendorSide = 'payable' | 'receivable'`.
- `VendorSourceKind = 'sourcing' | 'issue'`; each `VendorSource` carries `id`, `vendorPartyId`, `sourceKind`, `sourceInvoiceId?`, `sourceSaleLineId?`, `memoId?`, `productId`, `baseQty`, `unitCostBasePaisa`, `sourceAmountPaisa`, `date`, `status` and immutable counterparty snapshots.
- `VendorSettlementKind = 'pay' | 'return-to-vendor' | 'receive-money' | 'receive-goods'`; each settlement has `id`, `sourceId`, `vendorPartyId`, `side`, `date`, `baseQty?`, `amountPaisa`, `paymentSplits?`, `reason?`, `status`. Use source allocations if one payment settles several obligations.
- `VendorLedgerEvent` carries `eventId`, `sourceId`, `reference`, `vendorPartyId`, `side`, `eventKind`, `date`, `sequence`, `deltaPaisa`, `stockDeltaBase?`, `actor`, `operationId`, `status`, correction reference. Append-only/audited semantics for corrections; no silent mutation of financial history.
- `VendorPreviewState` includes source records, settlements, events, and **clearly demo-only** POS source snapshots and simulated inventory deltas. Preview state is in-memory and not multi-tenant persistent. Backend integration later must take tenant identity exclusively from the authenticated session, never a caller-supplied tenant ID.

All money arithmetic uses integer paisa; all quantities use normalized finite positive base units and an explicit unit conversion. Preserve presentation units separately for display. Preserve original owned lot cost and vendor cost separately (`ownLotAllocations`, `vendorSourcedQty`, `vendorUnitCostBasePaisa`), not only the existing blended `SaleLine.unitCost` average. Source IDs, not display names, are ledger join keys.

Keep `src/types/erp.ts` compatible with `SaleStockSource`, adding optional source metadata where necessary. Existing static Sale fixtures continue to render. Legacy fixture rows are unverified, read-only and never auto-mapped to settled or refundable Vendor obligations.

### Balance formula and settlement semantics

- **Payable** = payable opening + sourcing obligations - cash/bank/MFS paid - value of linked physical returns - authorized adjustments. This is **what we owe the Vendor**.
- **Receivable** = receivable opening + goods issued to Vendor - money received - value of goods returned to us - authorized adjustments. This is **what Vendor owes us**.
- A sourcing line produces exactly one payable obligation for vendor-sourced units, not the entire sale quantity.
- Goods given to the Vendor reduce owned physical stock and create a receivable; goods returned from Vendor restore owned stock and reduce the receivable.
- Return goods *to* Vendor consumes genuine physically available **owned** stock and reduces a **linked payable**. It is not a sale return and may not manufacture negative stock.
- A Vendor payment/receipt may split across Cash, Bank and MFS using existing split editor. Preview ledger records show what would change; **no cashbook/bankbook transfer is claimed without backend posting**.
- Source allocations constrain `sum(settledQty) <= sourceQty` and `sum(settledValue) <= remaining source amount`. V1 disallows overpayment/unexplained vendor advances; implement advance credit only under a later explicit design.
- Two Vendor sides cannot silently net, even when the same Party also has Supplier or Customer roles. An inter-side offset would require a distinct authorized, audited action outside v1.

### Concrete worked examples

**Vendor sourcing:** Own sellable = 5 Pcs, customer requests 8 Pcs, Vendor supplies 3 Pcs at ৳110/Pcs. Customer sale quantity = 8 Pcs; own-stock out = 5; Vendor-sourced qty = 3; payable = **৳330**; Vendor-sourced 3 never enters owned inventory. Pay ৳200 -> payable ৳130; hand over only verified on-hand owned goods worth ৳130 against that sourcing -> payable zero, with stock out once.

**Negative Sale:** Same 5/8 situation; own-stock goes down by 8, resulting net -3; vendor payable remains zero. A later purchase of 6 changes net owned stock from -3 to +3, reconciling the existing deficit exactly once. FIFO/lot availability must respect net stock, especially when positive lots coexist with old `OVERSOLD` debt.

**Vendor issued stock:** Give Vendor 2 Pcs worth ৳70 each from physically owned inventory -> own stock -2, receivable ৳140. Receive ৳70 cash and 1 Pcs at linked value ৳70 -> receivable zero; returned physical piece increases owned stock +1 once.

For an ambiguous customer return on a Vendor-sourced sale, ask whether goods returned to us physically, returned to the Vendor, or refunded without stock receipt. Do **not** automatically add all returned units to owned inventory or reverse payable; show `Needs source review` until explicitly resolved.

## 6. Source allocation, stock and validation invariants

The product's net sellable stock is the authoritative *cap*; sum of positive lots alone is not authoritative when negative lots exist. For identical product on several cart lines, reserve own stock **cart-wide in stable line order**; do not allow each line independently to claim all 5 available pieces.

For each sale line in normalized base units:
- `requested = ownAllocated + vendorSourced + negativeSourced`.
- `ownAllocated <= remainingNetSellableOwnStock`; all allocations non-negative.
- Vendor mode: `vendorSourced = requested - ownAllocated`, `negativeSourced = 0`.
- Negative mode: `negativeSourced = requested - ownAllocated`, `vendorSourced = 0`.
- Own mode clamps to `ownAllocated` (zero -> remove line), then rechecks subsequent lines in the cart.
- Each product's aggregate owned allocation is <= currently owned sellable stock; reserved vendor units do not decrement owned stock; deliberate negative units decrement its net balance exactly once.
- Expiry/serial requirements remain enforced and services never show stock shortage.
- A change in cart quantity/unit, Vendor identity/cost, stock revision, or a preexisting sale edit invalidates stale sourcing, which the user must review.
- Active Vendor role required; status `Inactive` cannot be newly selected. Historical records retain snapshots if master data later changes.

A refund or invoice correction after sourced goods are paid/returned must be blocked until conflicting linked settlements are reversed, with a reviewable impact preview and reason. Source operations must be atomic/idempotent in the eventual backend; preview reducer should reproduce the same validation and single-command atomic state update where possible.

## 7. UI-preview boundary and backend handoff

**Current constraint:** This repo renders preview fixtures. `Pos.complete()` builds a receipt dialog, not an authoritative sale. Do NOT put an apparently posted Vendor payable next to an invoice that was not even saved, and do NOT reuse misleading `Sale completed` / `added to ledger` text for unposted operations.

For the UI phase:
1. Introduce a pure Vendor command reducer and in-memory `VendorPreviewStore` with revision, operation ID and atomic **simulation**. Seed internally consistent Vendor source/settlement examples.
2. A POS `Preview transaction` action prepares a combined sale+source allocation snapshot, validates, and, only on a clearly labeled `Simulate in demo` action, records a **demo-only** source and matching Vendor ledger event. Make the preview invoice accessible in Vendor source detail; never claim Sales/Party/Finance or persistent stock were posted. Simulation mutations must be contained in a single preview snapshot so sourcing is not orphaned by a failed sale command.
3. Vendor workspace actions operate on this same preview state. Ledger print/export is allowed but prominently marked `Demo preview — not accounting records`.
4. In final backend integration (separate project), a NestJS command transaction must atomically persist invoice, allocations, stock/oversold, Vendor sourcing/obligation, payments and cash/bank effects; implement tenant-scoped queries, idempotency, audit/outbox and single-row/lot reservation protection. UI may then switch to `Posted` labels only after a confirmed server response.

The UI prototype must not pretend to be the production backend. No Google Sheets or legacy Apps Script code is imported.

## 8. Source corrections, deletion and permissions

- Ledger actions: View source, Print source, Correct, Reverse. A correction creates a reasoned audited replacement/supersession and projects only the active event. No hard deletion of linked financial history.
- Protect used Vendors: can deactivate for future sourcing; cannot delete a Party/Vendor role while an obligation, settlement, stock issue or historical referenced record needs it. Historical source snapshots remain intact.
- Permissions: cashier may choose a permitted active Vendor and propose sourcing; permission to adjust historical cost/source, issue stock, pay/receive funds, reverse or export financial history is distinct and explicitly checked. Do not offer clickable no-op actions.
- Optional role access restriction and backdated transaction reason/authorization remain consistent with existing Party finance patterns.
- Security boundary: `vendorPartyId` must belong to the current tenant, and a source must belong to the same Vendor; UI validation mirrors rules, server enforces them on backend integration.

## 9. Acceptance scenarios and failure behavior

1. Given own stock 5 Pcs and a cart of 8 Pcs, each of Own / Negative / Vendor yields the expected distinct allocation/side effects.
2. Given two lines for the same product (4 + 4), total own allocation is <= 5 and shortage is 3, not two independent 4-unit reservations.
3. Vendor sourcing creates demo source + payable exactly once by operation ID; retry neither repeats ledger nor changes amount.
4. Vendor created inline with Vendor role is selected by ID; cart, payments, price, unit, keyboard focus and draft remain intact.
5. A Payable ₱330-equivalent in integer paisa, pay ৳200 then return value ৳130 reaches exactly zero; receiving a Vendor payment never changes payable.
6. A Receivable ৳140, receive ৳70 plus one returned piece valued ৳70 reaches zero, with one restock.
7. Invalid cross-vendor source, inactive vendor, over-settlement, unknown product, negative/non-finite cost, expired-only stock, stale revision and duplicate operation ID are rejected without partial writes.
8. Editing a sourced sale with downstream settlement requires reversal first. A customer return cannot invent stock or silently alter vendor payable.
9. Date-filtered Vendor statement shows separate opening/closing per side and CSV/print matches visible filters.
10. Desktop/mobile, keyboard/touch, all English/Bangla helpers, light/dark contrast, no mono digits, POS reorder and multi-unit functionality remain intact.
11. Browser copy and dialogs explicitly say `Preview`/ `Demo`; no fake real-payment/stock/print success.
12. Sales, Purchase, Party ledger, Expense PR #51, Settings/nav and existing UI contracts continue passing.

## 10. Non-goals and delivery decomposition

**Excluded v1:** true consignment warehouse/custody, commission agreements, drop-shipment logistics, multi-warehouse intercompany transfer, auto-netting of payable/receivable, arbitrary Vendor advances, full GL/COGS backend posting, SMS reminders, PDF statement OCR. These are separate designs.

**Increment A — Vendor domain + two-way workspace:** types, pure source/settlement projection, preview store, role-specific Party UI, source-linked actions, two-column balances, statement/print. Independently reviewable with seeded preview transactions.

**Increment B — POS shortage integration + accurate demo sale/sourcing:** cart-wide allocator, dynamic Vendor picker + Quick Add, explicit source cost/mixed allocation, demo transaction simulation/receipt/source link, focused POS regressions.

**Increment C — Vendor returns/corrections + regression hardening:** stock issue/return simulations, partial settlements, guarded corrections/reversals, broader end-to-end checks. Each increment has its own independent tests/commits; preserve the existing POS V2 and Party architecture.

**Future backend contract:** NestJS repository/adapter infrastructure belongs to the main `hisabiq` repo, not this UI/design repo; undertake only with separate authorization and production accounting tests.

## 11. References and review checklist

- Current UI: `src/components/pos/StockShortageDialog.tsx`, `src/pages/Pos.tsx`, `src/pages/Parties.tsx`, `src/utils/partyLedger.ts`.
- Legacy: `sherERP_Mohim/Vendors.gs`, `Sales.gs`, `StockLots.gs`, `NET_STOCK_VENDOR_SHORTAGE_FIX_REPORT.md`.
- Related `HisabIQ_ui` issue: #47 Party workflow; draft PR #51 Expense work is **not** a dependency and must not be merged as part of this design.

**Before implementation:** User reviews this spec and the companion plan, approves Native execution, and chooses first increment. Do not implement or merge feature code based only on this document.
