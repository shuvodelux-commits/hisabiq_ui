# Vendor Sourcing & Two-Way Vendor Ledger — Design Specification

**Date:** 2026-10-10  
**Project:** `HisabIQ_ui` (UI/design-only repo; not the NestJS `hisabiq` backend)  
**Status:** Reviewable specification; implementation NOT authorized by this document alone  
**Decision:** Vendor sourcing and Vendor ledger in v1, including **unpriced at POS / priced or replaced later**, plus normal purchase from the same Party; true consignment postponed as an optional advanced feature.  
**Execution preference:** Native Superpowers (no subagents).  
**Design authority:** Existing Magic Patterns export and adopted HisabIQ shadcn-like components, compact information-rich bilingual UI, light/dark tokens, and POS V2 interaction contract.

## 1. User intent and measurable result

An SMB cashier facing insufficient stock must finish a normal POS workflow without moving to another module: sell only owned stock, record an intentional negative sale, or source the shortage from a nearby Vendor **even when the vendor's cost is unknown**. Local shopkeepers often borrow stock at midday, sell first, then visit the nearby Vendor in the evening to learn the price and either pay, give back the same goods, or combine both settlement methods. Shops also make ordinary product purchases from that same Vendor. The shop owner must then review and settle Vendor payables or receivables from the **same Vendor Party profile** (money, physical goods, partial settlements, source invoice, date-filtered ledger, print/export, correction/reversal). Existing multi-unit entry (`Box/Pcs`, `Gauge/Gira`) and existing cart/draft state must survive Quick Add.

Success means: the cashier can see and choose an explicit, correct shortage action; a Vendor can be created inline without losing the cart; the Vendor profile shows independent payables and receivables; every simulated obligation/settlement has a traceable source and changes only the appropriate balance; all interfaces explicitly say **preview/demo** until a real transactional backend is connected.

## 2. Alternatives considered

1. **Copy the legacy Vendor top-level module** — faster screen port, but duplicates the existing Party master, permissions, ledger and design system. **Rejected.**
2. **One Vendor relationship with a net signed Party balance** — smallest data model, but payable and receivable cancel deceptively, including on multi-role Parties. **Rejected.**
3. **One canonical Party ID with two Vendor subaccounts and source-linked operational records** — modest additional domain logic, reuses existing Party UI, keeps audit/accounting semantics explicit. **Selected.**

Do **not** equate Vendor sourcing with true consignment. In this scope, the missing units are sourced from another shop for a specific sale; their price can be agreed **later**. They are not recorded as owned stock. A sourcing quantity obligation exists immediately even without a numeric payable. Later true consignment would require vendor-owned physical lots, custody/ownership, agreement, commission/principal distinction, stock-on-hand vs owned-stock availability and independent valuation.

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
The two balances are never netted. Never print only one signed net number as Vendor balance. Include outstanding sourced units and issued units as secondary indicators when available.

**Action strip:** Set Price & Settle, Pay Vendor, Return Goods, **Buy Products**, Give Products, Receive Money, Receive Products, Ledger Statement; compact visible primary actions plus an accessible actions menu on narrow screens. Actions open dialogs/drawers in-place; no context-destroying redirect. User can open an original POS invoice within a source-detail sheet; if navigating, preserve Party ID, relationship, date range, search and tab in return state.

**Workspace tabs:** Ledger (default), **Pending Source Settlements**, Sourced Sales / Payables, Goods Issued / Receivables, **Purchases**, Settlements. Pending Source Settlements shows quantity and source invoice even when cost is unknown. Show distinct top-level metrics: **Known Payable ৳**, **Unpriced Source Obligations count/quantity**, **Receivable ৳**; never summarize unpriced obligations as ৳0 or include them as zero-cost in a profit report. One combined history may display a `Side` column (`Payable` or `Receivable`) with **side-specific running balances**. Date-range picker, search, status/type selector, page size, clear filters, Print/CSV and row actions. Print/export carry actual filtered rows, opening balance and closing balance *per side*; no fabricated print success toast. Debit/credit directional styles are subtle plus textual `Money out`, `Money in`, `Goods out`, `Goods in` labels; never rely only on colors.

**POS shortage modal:** Three radio-card choices: Own Stock (clamp entire line; zero removes), Negative Sale (shortage becomes an outstanding negative-stock obligation), Source from Vendor (only the shortage sourced; own available portion retained). Show requested, remaining sellable, shortage, vendor and vendor quantity; **cost per selected unit is optional**. When blank show **Price pending · দাম পরে নির্ধারণ** (no amount/margin, no zero-cost valuation); when given show converted base-unit cost, known payable amount and estimated margin where reliable. Offer 'Save vendor now; settle later' without adding extra mandatory steps to checkout. Inline `+ New Vendor` uses existing Party creation workflow/validation and returns to the same open cart/modal, auto-selecting new Vendor by **ID**, not name. Searchable vendor picker uses canonical Party preview store (active Vendor role), not frozen fixture list. On any quantity, unit, supplier, inventory revision or price-affecting edit, revalidate the selection. Do not preselect a Vendor automatically.

**Interaction contract:** shadcn-style app Select/Combobox, Popover, Dialog, AppDatePicker/range and POS V2 compound cart; keyboard Enter, Esc, focus restore; touch-friendly; responsive at phone/tablet; accessible disabled reasons; dark theme uses tokens, no hardcoded `blue-50` as an unsafely contrasting base; no monospaced digit fonts. English primary + short Bangla helpers.

## 5. Domain model and data ownership

Retain one canonical `Party.id` and `Party.roles[]`. Do **not** create a `Vendors` master table in the UI. Vendor-specific information is an independent operational subledger, keyed by `vendorPartyId`, and not merged into the generic single signed `Party.balance`.

Suggested `src/vendor/vendorTypes.ts` interfaces:

- `VendorSide = 'payable' | 'receivable'`.
- `VendorSourceKind = 'sourcing' | 'issue'`; each `VendorSource` carries `id`, `vendorPartyId`, `sourceKind`, `sourceInvoiceId?`, `sourceSaleLineId?`, `memoId?`, `productId`, `baseQty`, **`unitCostBasePaisa: number | null`**, **`sourceAmountPaisa: number | null`**, `pricingStatus: 'unpriced' | 'partially-priced' | 'priced' | 'closed'`, `date`, `status` and immutable counterparty snapshots. `null` means unknown; **never use numeric zero as the default unknown cost**.
- `VendorSettlementKind = 'pay' | 'return-to-vendor' | 'receive-money' | 'receive-goods'`; each settlement has `id`, `vendorPartyId`, `side`, `date`, `amountPaisa: number | null`, `allocations: {sourceId: string; amountPaisa: number | null; baseQty?: number}[]`, `paymentSplits?`, `reason?`, `status`. One payment may allocate across multiple same-side sources; physical returns must be linked to an original source.
- `VendorOpening` carries `vendorPartyId`, `side`, `openingAmountPaisa`, `date`, `reason`, `operationId`. Enter opening payable and receivable separately, never one ambiguous signed Vendor opening.
- `VendorLedgerEvent` carries `eventId`, `sourceId`, `reference`, `vendorPartyId`, `side`, `eventKind`, `date`, `sequence`, `deltaPaisa`, `stockDeltaBase?`, `actor`, `operationId`, `status`, correction reference. Append-only/audited semantics for corrections; no silent mutation of financial history.
- `VendorPreviewState` includes source records, settlements, events, and **clearly demo-only** POS source snapshots and simulated inventory deltas. Preview state is in-memory and not multi-tenant persistent. Backend integration later must take tenant identity exclusively from the authenticated session, never a caller-supplied tenant ID.

All **known** money arithmetic uses integer paisa; **unknown prices are `null`**, not 0 and not a fabricated payable; all quantities use normalized finite positive base units and an explicit unit conversion. Preserve presentation units separately for display. Preserve original owned lot cost and vendor cost separately (`ownLotAllocations`, `vendorSourcedQty`, `vendorUnitCostBasePaisa`), not only the existing blended `SaleLine.unitCost` average. Source IDs, not display names, are ledger join keys.

Keep `src/types/erp.ts` compatible with `SaleStockSource`, changing the Vendor selection to permit **optional/null `unitCost` until priced**, and adding optional source metadata where necessary. Do not let the existing `blendedVendorUnitCost` imply actual profit before pricing. Existing static Sale fixtures continue to render. Legacy fixture rows are unverified, read-only and never auto-mapped to settled or refundable Vendor obligations.


### Real local-shop workflow: source now, price or replace later

**Non-negotiable POS default:** Select Vendor and quantity; **cost is optional**. A cashier can complete the *UI preview* sale with `pricingStatus: 'unpriced'`. The absence of a price is neither free goods nor a zero-cost purchase. Do not create a valued source ledger debit, numeric vendor payable or claimed gross margin for the unknown portion; keep it in a **Quantity / Price pending** queue with invoice, date, product, base/display units, sourced quantity, quantity remaining, Vendor Party and source action.

**Evening Vendor queue:** From `Parties > Vendors > Pending Settlements`, group today's/older unpriced obligations by Vendor and invoice. Each row has `Set Price & Pay`, `Return Product`, `Split: Return + Pay`, `View Invoice` and `Reasoned Correction`. Enter agreed unit cost or lump total at payment time, with a transparent base-unit conversion and confirmation. Partial return before pricing closes the returned quantity; quote only the remaining units. For cash-settled units, agreed price is required **before or atomically with money settlement**. A partial payment can leave an amount-due on the priced remainder; the app must distinguish **outstanding quantity** from **outstanding monetary amount**, because payment clears a financial obligation without physically returning products.

**Like-for-like replacement:** A vendor accepts matching goods instead of money; require the exact linked product/unit (with serial/batch compatibility where relevant), physical owned stock on hand, and matching returned quantity. The return consumes replacement owned lots exactly once and closes that portion of the source quantity. The sale's missing historical COGS is resolved from the replacement lots' actual cost, where available, rather than fabricated as ৳0. Substitutions, negotiated cross-product offsets, commissions or a change of Vendor require an explicit advanced/adjustment workflow, not implicit v1 behavior.

**Ordinary purchase from same Vendor:** A shop may also **buy stock normally** from the same person. The existing `PurchaseEditor.tsx` already accepts Parties with `Vendor` or `Supplier` role. Reuse Purchase cart, multi-unit prices, discounts, payments, supplier lot handling and invoice snapshots inside Vendor context; a Vendor's **Buy Products** action should open a contextual, prefilled Purchase editor/modal without losing the Party workspace. A normal Purchase increases owned stock and creates a **purchase/supplier payable**, **not** another sourcing obligation. The Party identity is unchanged; provide an in-place explicit Supplier-role addition if accounting presentation needs `Supplier`, rather than silently duplicating Party. A source settlement and a purchase are independent events; **never count a source's cost again as both Vendor payable and Supplier payable**. If stock is purchased to return to a Vendor, record Purchase receipt once and the linked Vendor product return once. When the shopkeeper merely pays for previously sourced/sold units, use `Set Price & Pay`, **not** a new inventory-receiving Purchase.

**Accounting boundary:** Established purchase systems distinguish receiving goods from confirming the later vendor bill. The exact booking of unpriced consumed goods and later valuation needs a policy in the main NestJS backend; in `HisabIQ_ui`, keep monetary valuation pending until agreed, preserve source+replacement cost provenance, and display `COGS pending` rather than reporting free profit. This is not permission to understate actual real-world liabilities in production.

### Balance formula and settlement semantics

- **Known monetary payable** = payable opening + **priced outstanding sourcing obligations** - cash/bank/MFS paid - value of linked physical returns - authorized adjustments. This is the **known amount** we owe the Vendor. **Unpriced source quantities are shown separately**, never folded into this arithmetic as ৳0. Backend posting of an estimated accrual (if required) belongs to a separate accounting policy, not this UI preview.
- **Receivable** = receivable opening + goods issued to Vendor - money received - value of goods returned to us - authorized adjustments. This is **what Vendor owes us**.
- A sourcing line immediately produces exactly one **quantity obligation** for vendor-sourced units, not the entire sale quantity. It produces a **monetary payable only after the Vendor price is agreed** for unsettled units. Returning the same product/unit quantity before pricing can settle its quantity without a monetary payable.
- Goods given to the Vendor reduce owned physical stock and create a receivable; goods returned from Vendor restore owned stock and reduce the receivable.
- Return goods *to* Vendor consumes genuine physically available **owned** stock and reduces the original **quantity obligation** and, if already priced, the matching **linked payable**. Before price confirmation, an agreed like-for-like product return closes the relevant quantity without requiring a unit cost. It is not a sale return and may not manufacture negative stock.
- A Vendor payment/receipt may split across Cash, Bank and MFS using existing split editor. Preview ledger records show what would change; **no cashbook/bankbook transfer is claimed without backend posting**.
- Source allocations constrain `sum(settledQty) <= sourceQty` and, **when priced**, `sum(settledValue) <= remaining source amount`. For a payment across multiple sourcing obligations, show oldest-first suggested allocation and allow explicit manual adjustment before confirming; the sum of allocations must match the payment exactly. V1 disallows overpayment/unexplained vendor advances; implement advance credit only under a later explicit design.
- Two Vendor sides cannot silently net, even when the same Party also has Supplier or Customer roles. An inter-side offset would require a distinct authorized, audited action outside v1.


**Distinguish quantity from financial liability:** A source begins as `unpricedBaseQty` and zero **new known** monetary payable. After the price of its remaining quantity is agreed, it enters priced obligation and can be paid in full/part. A cash settlement clears monetary due but should not be modeled as physically returning goods. A linked like-for-like physical return reduces the open quantity even if its unit cost was never quoted. Source history must show `sourcedBaseQty`, `returnedBaseQty`, `unpricedBaseQty`, `pricedBaseQty`, `cashSettledPaisa`, `monetaryDuePaisa:number|null` independently; projection guards must forbid double settlement by cash plus goods. A fully cash-paid priced sourcing is closed without fabricating an owned stock return. Do not infer COGS until quoted/actual lot replacement cost is available.

**Purchase versus sourcing guard:** Vendor Purchase is a standard **Supplier-purchase-side** document, made under the same Party ID and reused Purchase editor. If the same Party has both roles, show its ordinary purchase payable separately from its ad hoc Vendor sourcing obligations. A purchase of replacement stock may increase own stock once and a linked return of that stock may decrease it once. Selling directly sourced items and then paying the original source must **not** create a Purchase receipt. Do not auto-convert a source into a purchase or reconcile between the two payable subaccounts.

### Concrete worked examples

**Vendor sourcing at unknown cost:** Own sellable = 5 Pcs, customer requests 8 Pcs, Vendor lends 3 Pcs at **price not yet known**. Customer sale quantity = 8 Pcs; own-stock out = 5; Vendor-sourced outstanding = 3 Pcs, **unpriced**; known monetary payable created by this source = **not yet determined** (not ৳0). At night Vendor quotes ৳110/Pcs -> price the 3 outstanding units at **৳330**, then pay ৳200 and return one verified on-hand matching piece valued at ৳110 -> remaining monetary payable ৳20 and remaining unmatched sourced quantity is reconciled by payment. Alternatively return all 3 matching pieces **before any price is quoted**: quantity obligation becomes 0; original sale's actual replacement-stock cost is derived from the consumed owned lots, not written as zero. If all 3 are settled by payment after pricing, Vendor payable reaches 0 with no owned-stock return.

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
- A change in cart quantity/unit, Vendor identity, **nonblank** cost, stock revision, or a preexisting sale edit invalidates stale sourcing, which the user must review. **Blank cost is a valid unknown-price choice**, and deleting an entered cost changes the state back to unpriced with explicit confirmation if needed.
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

- Ledger actions: View source, **Confirm Price**, **Settle with Money / Goods**, Print source, Correct, Reverse. A correction creates a reasoned audited replacement/supersession and projects only the active event. No hard deletion of linked financial history.
- Protect used Vendors: can deactivate for future sourcing; cannot delete a Party/Vendor role while an obligation, settlement, stock issue or historical referenced record needs it. Historical source snapshots remain intact.
- Permissions: cashier may choose a permitted active Vendor and propose sourcing; permission to adjust historical cost/source, issue stock, pay/receive funds, reverse or export financial history is distinct and explicitly checked. Do not offer clickable no-op actions.
- Optional role access restriction and backdated transaction reason/authorization remain consistent with existing Party finance patterns.
- Security boundary: `vendorPartyId` must belong to the current tenant, and a source must belong to the same Vendor; UI validation mirrors rules, server enforces them on backend integration.

## 9. Acceptance scenarios and failure behavior

1. Given own stock 5 Pcs and a cart of 8 Pcs, each of Own / Negative / Vendor yields the expected distinct allocation/side effects.
2. Given two lines for the same product (4 + 4), total own allocation is <= 5 and shortage is 3, not two independent 4-unit reservations.
3. Vendor sourcing creates demo **unpriced quantity source**, with no fabricated monetary payable, exactly once by operation ID; later price confirmation derives known payable for remaining units exactly once; retries never duplicate either event.
4. Vendor created inline with Vendor role is selected by ID; cart, payments, price, unit, keyboard focus and draft remain intact.
5. Cash settlement requires agreed cost (or atomic 'Set Price + Pay'); a 3-unit unpriced source can be returned 3-for-3 without any quoted price; after agreed ৳110/Pcs, pay ৳220 and return one matching item valued at ৳110 -> monetary payable and quantity obligation both reach zero.
6. A Receivable ৳140, receive ৳70 plus one returned piece valued ৳70 reaches zero, with one restock.
7. Invalid cross-vendor source, inactive vendor, over-settlement, unknown product, **explicit negative/non-finite** cost, expired-only stock, stale revision and duplicate operation ID are rejected without partial writes. **Missing/null cost is valid only for unpriced sourcing**, never implicitly an agreed zero-price purchase.
8. Editing a sourced sale with downstream settlement requires reversal first. A customer return cannot invent stock or silently alter vendor payable.
9. Date-filtered Vendor statement shows separate opening/closing per side and CSV/print matches visible filters.
10. Desktop/mobile, keyboard/touch, all English/Bangla helpers, light/dark contrast, no mono digits, POS reorder and multi-unit functionality remain intact.
11. Browser copy and dialogs explicitly say `Preview`/ `Demo`; no fake real-payment/stock/print success.
12. Sales, Purchase, Party ledger, Expense PR #51, Settings/nav and existing UI contracts continue passing.

## 10. Non-goals and delivery decomposition

**Excluded v1:** true consignment warehouse/custody, commission agreements, drop-shipment logistics, multi-warehouse intercompany transfer, auto-netting of payable/receivable, arbitrary Vendor advances, full GL/COGS backend posting, SMS reminders, PDF statement OCR. These are separate designs.

**Increment A — Vendor domain + two-way workspace:** types, pure source/settlement projection, preview store, role-specific Party UI, source-linked actions, two-column balances, statement/print. Independently reviewable with seeded preview transactions.

**Increment B — POS shortage integration + accurate demo sale/sourcing:** cart-wide allocator, dynamic Vendor picker + Quick Add, **optional Vendor price** with 'price pending' badge/mixed allocations, demo transaction simulation/receipt/source link, focused POS regressions.

**Increment C — Evening price, settlements, normal Vendor purchases, corrections and regression hardening:** support unpriced sourcing until evening quote or matching product return, split money/in-kind settlement, contextual Buy Products reusing Purchase editor, physical goods movement simulations, guarded corrections/reversals and broader end-to-end checks. Each increment has its own independent tests/commits; preserve the existing POS V2 and Party architecture.

**Future backend contract:** NestJS repository/adapter infrastructure belongs to the main `hisabiq` repo, not this UI/design repo; undertake only with separate authorization and production accounting tests.

## 11. References and review checklist

- Current UI: `src/components/pos/StockShortageDialog.tsx`, `src/pages/Pos.tsx`, `src/pages/Parties.tsx`, `src/utils/partyLedger.ts`.
- Legacy: `sherERP_Mohim/Vendors.gs`, `Sales.gs`, `StockLots.gs`, `NET_STOCK_VENDOR_SHORTAGE_FIX_REPORT.md`.
- Related `HisabIQ_ui` issue: #47 Party workflow; draft PR #51 Expense work is **not** a dependency and must not be merged as part of this design.

**Before implementation:** User reviews this spec and the companion plan, approves Native execution, and chooses first increment. Do not implement or merge feature code based only on this document.
