# Vendor Sourcing & Two-Way Vendor Ledger — Native Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan **natively** task-by-task. Do **not** use subagent-driven development. Every task includes red/green verification and one reviewable commit. No product implementation until the user approves the written spec and this plan.

**Goal:** Deliver a consistent UI-only Vendor sourcing and two-way Vendor ledger workflow inside existing HisabIQ POS V2 and Party modules, without fake financial posting.

**Architecture:** Keep one Party identity, with a separate Vendor-specific source-linked, two-sided subledger. Pure allocation/reducer/projector functions back a single in-memory demo snapshot and the Party Vendor workspace; the existing POS renders explicit **demo/preview** source simulations. True consignment and authoritative backend operations are out of scope.

**Tech Stack:** React 18, TypeScript, Vite, existing shadcn-style local components, React Router, Node `--experimental-strip-types --test`, Playwright browser scripts, GitHub Actions. No new dependencies required.

**Spec:** `docs/superpowers/specs/2026-10-10-vendor-sourcing-ledger-design.md`.

## Global Constraints

- Work only in `shuvodelux-commits/HisabIQ_ui`; **do not modify** main NestJS `hisabiq` or `sherERP_Mohim` legacy code.
- **Native Superpowers only**; no subagents, no Remote Desktop Commander. Use a clean feature branch from the latest reviewed `main`; do not merge unrelated draft PR #51.
- UI-only design phase: no genuine backend, stock, Sales, customer ledger, cashbook or bankbook posting claims. Every simulation/statement is explicitly labeled `Demo preview — not accounting records`.
- One canonical Party ID; Vendor subaccounts are strictly **separate payable and receivable**, never netted; multi-role Party balances are independent.
- Preserve Magic Patterns design language, approved ERP nav and settings, POS V2 cart reorder, mixed units, serials, keyboard/touch interactions, desktop/tablet/mobile, light/dark themes, bilingual helper text, **no monospaced numeric font**.
- Keep existing static fixture-based pages functioning. Do not migrate the app to a new state management dependency.
- All financial values in integer paisa; normalized base quantities; immutable source links and audit records; operator-facing feedback is accurate, never a success toast for unimplemented posting.
- TDD: a failing behavior test precedes implementation; only report passing tests observed on the exact revision under test.
- No true consignment, commission accounting, drop shipping, vendor advances, cross-role netting or production backend APIs in this plan.
- Reuse `AppDatePicker` / range, Party creation/validation, POS V2 product/unit/cart and existing Party statement style instead of making parallel controls.

## File ownership map and stable interfaces

**Domain (new):**
- `src/vendor/vendorTypes.ts`: `VendorSide`, `VendorSource`, `VendorSettlement`, `VendorLedgerEvent`, `VendorPreviewSale`, `VendorPreviewState`, discriminated `VendorPreviewCommand`, `VendorBalances`.
- `src/vendor/vendorModel.ts`: pure `applyVendorCommand(state: VendorPreviewState, command: VendorPreviewCommand): VendorPreviewState`, `vendorBalances(state, vendorPartyId): VendorBalances`, `sourceOutstanding(state, sourceId): {qty: number; amountPaisa: number}`. All transitions validate before returning new state; throw leaves old state intact.
- `src/vendor/vendorPreviewStore.ts`: `getVendorPreviewSnapshot()`, `subscribeVendorPreview(listener)`, `dispatchVendorPreview(command)`, `resetVendorPreviewForTest()` using existing external-store convention. Demo fixtures are contained here and may link to existing `Party.id`s.
- `src/vendor/vendorStock.ts`: `allocatePosStock(lines: readonly PosStockRequest[], lots: readonly StockLot[], now?: Date): PosStockAllocation[]` where each request is `{key:string; product:Product; requestedBaseQty:number; choice?: SaleStockSource}` and result `{key; productId; ownBaseQty; vendorBaseQty; negativeBaseQty; effectiveBaseQty; availableBeforeBaseQty}`. An explicit Own Stock clamp is a UI action, not a stored `stockSource` mode.
- `src/vendor/vendorLedger.ts`: `projectVendorStatement(state: VendorPreviewState, vendorPartyId: string, side: VendorSide, range: IsoRange): VendorStatement`; `serializeVendorStatementCsv(statement: VendorStatement, vendorName: string): string` (reuse existing Party CSV/print escaping conventions).
- `src/vendor/vendorSalePreview.ts`: `prepareVendorSalePreview(invoiceId: string, allocations: readonly PosStockAllocation[], saleLines: readonly CartLine[]): VendorPreviewSale`, pure typed snapshot. A single `simulate-pos-sale` command records all of that sale's demo Vendor source rows and ledger events in one atomic preview transition.
- `src/vendor/vendorCorrection.ts`: `vendorCorrectionImpact(state, sourceId): {blocked:boolean; reason?:string; linkedSettlements:string[]}` for source edits/reversals. Corrections are append-only audited commands, not direct mutable deletion.

**UI (adapt existing screens):**
- `src/components/parties/VendorWorkspace.tsx`: vendor-specific body inside `PartyDetail` for `relationship==='Vendor'`; retain shared Party header, relationship switch and identity.
- `src/components/parties/VendorActionDialog.tsx`: modal for Pay, Return-to-Vendor, Give Products, Receive Money, Receive Products; extract source selection, product editor and payment split inputs rather than copy finance internals.
- `src/components/parties/VendorStatementDialog.tsx`: payable/receivable statement tabs; date-range and CSV/print based on `PartyStatementDialog`.
- `src/components/pos/StockShortageDialog.tsx`, `src/components/pos/CartTable.tsx`, `src/hooks/usePosCart.ts`, `src/pages/Pos.tsx`: live Party vendor picker, inline create and safe per-product, whole-cart allocations; mock sale source simulation only.
- `src/pages/Parties.tsx`, `src/components/parties/PartyDetail.tsx`, `src/navigation/erpNavigation.ts`: Vendor filtered view and source-linked dialogs.
- `src/types/erp.ts`: compatible optional source snapshot fields on `SaleLine`; do not break current Sale fixtures.

**Tests:**
- New `tests/vendorModel.test.ts`, `tests/vendorStock.test.ts`, `tests/vendorLedger.test.ts`, `tests/vendorSalePreview.test.ts`, `tests/vendorCorrection.test.ts`.
- New `scripts/vendor-workflow-browser.cjs`.
- Add `test:vendor-workflow` to `package.json` and browser regression step to `.github/workflows/ui-check.yml`.

**Existing regression interfaces to protect:** `tests/posStock.test.ts`, `tests/partyLedger.test.ts`, `tests/posQuantity.test.ts`, `tests/transactionCartParity.test.ts`, `scripts/party-browser.cjs`, `scripts/pos-reorder-browser.cjs`, `scripts/compound-quantity-browser.cjs`.

## Review Focus — five high-risk input classes (each pinned to a task)

1. **Repeated product lines / simultaneous negative and vendor resolution:** 4+4 units at stock 5 may reserve only 5 owned; test Task 5.
2. **Existing OVERSOLD debt mixed with positive lots:** net stock 1, positive lots 3, OVERSOLD -2 => vendor shortage 2 for request 3; test Task 5.
3. **Cross-vendor, over-quantity/over-value or duplicate settlement:** reject before state mutation and never double-post; test Tasks 1 and 4.
4. **Backdated transactions and printable running balances:** opening/closing separate by side, stable `date+sequence` order, CSV equals date filter; test Task 3.
5. **Settled sale edited, customer return ambiguity or draft re-open:** require audit reversal/source review; never restore owned stock automatically; test Tasks 7 and 8.

---

## Increment A — Vendor model and Party workspace

### Task 1: Domain types, source-linked commands and atomic in-memory reducer

**Files:** Create `src/vendor/vendorTypes.ts`, `src/vendor/vendorModel.ts`; Test `tests/vendorModel.test.ts`.

**Interfaces:** Produces `VendorPreviewState`, `VendorPreviewCommand`, `applyVendorCommand`, `vendorBalances`, `sourceOutstanding` used by all later tasks. Commands include `record-sourcing`, `issue-goods`, `settle-source`, `reverse-event` and `simulate-pos-sale`; use a discriminated union. Each command carries `operationId`; mutations remain atomic on failure.

- [ ] **Step 1: Write failing tests** in `tests/vendorModel.test.ts`: sourcing of 3 Pcs × 11000 paisa increases only payable by 33000; issuing 2 Pcs × 7000 increases only receivable by 14000; another Party with `Supplier` role remains unaffected; duplicate `operationId` is idempotent; unknown/inactive Party, cross-Vendor source and NaN/negative money fail without changing previous state.
- [ ] **Step 2: Run red test**: `node --experimental-strip-types --test tests/vendorModel.test.ts`. Expected: FAIL because Vendor domain exports do not yet exist.
- [ ] **Step 3: Implement** types and pure reducer. Use integer paisa and source IDs; append one ordered ledger event per economic effect, no use of `Party.balance`; freeze or copy existing state before validating.
- [ ] **Step 4: Run green test**: same command, expected: all new tests pass. Verify invalid input does not change a JSON snapshot of input state.
- [ ] **Step 5: Commit** `git add src/vendor/vendorTypes.ts src/vendor/vendorModel.ts tests/vendorModel.test.ts && git commit -m "feat(vendor): add auditable two-sided preview model"`.

### Task 2: Vendor preview store and fixture provenance

**Files:** Create `src/vendor/vendorPreviewStore.ts`; Test `tests/vendorPreviewStore.test.ts`.

**Interfaces:** Consumes Task 1 reducer. Produces `getVendorPreviewSnapshot(): VendorPreviewState`, `subscribeVendorPreview(listener: () => void): () => void`, `dispatchVendorPreview(command: VendorPreviewCommand): VendorPreviewState`, `resetVendorPreviewForTest(): void`. Read Party master identities from `getPartyPreviewSnapshot()` at command time, not `data/parties` static array.

- [ ] **Step 1: Write failing tests**: snapshot/revision increments exactly once for valid command; no notification on rejection or idempotent retry; subscriptions unsubscribe; seeded examples are marked `demo`, linked to existing Vendor Party IDs; inactive Vendor new transactions blocked but historical source readable.
- [ ] **Step 2: Run red**: `node --experimental-strip-types --test tests/vendorPreviewStore.test.ts`.
- [ ] **Step 3: Implement** simple module store modeled on `src/data/partyPreviewStore.ts`, with a documented demo-only seed and no network/persistent storage. Avoid mutating Party preview financial sources separately.
- [ ] **Step 4: Run green** and `npm test`; expected zero test failures.
- [ ] **Step 5: Commit** `git add src/vendor/vendorPreviewStore.ts tests/vendorPreviewStore.test.ts && git commit -m "feat(vendor): provide demo-only source store"`.

### Task 3: Separate Vendor statements, period balances, CSV and print

**Files:** Create `src/vendor/vendorLedger.ts`, `src/components/parties/VendorStatementDialog.tsx`; Test `tests/vendorLedger.test.ts`.

**Interfaces:** Consumes Tasks 1–2 and `IsoRange` from `src/utils/dateRange.ts`; produces `projectVendorStatement(...)` returning side, opening, rows with running balance, period inflow/outflow and closing, and `serializeVendorStatementCsv(...)`. Use stable date/sequence sorting and same sanitizer/escaping rules as `src/utils/partyStatement.ts`.

- [ ] **Step 1: Write failing tests**: sourcing ৳330/paid ৳200 gives payable ৳130; issued ৳140/received ৳70 gives receivable ৳70; neither side nets with the other; date-range from 2026-10-02 carries 2026-10-01 opening, including same-day tie-break; CSV formula-cell text is escaped and BOM/quotes follow existing export convention.
- [ ] **Step 2: Run red**: `node --experimental-strip-types --test tests/vendorLedger.test.ts`.
- [ ] **Step 3: Implement** source-linked projections and print dialog. Label `Demo preview — not accounting records`; use browser print and real Blob download, no fake `sent to printer` toast. Print both side statements or an explicit selected side, never a net closing balance.
- [ ] **Step 4: Run green** and `npm run build`; expected zero errors.
- [ ] **Step 5: Commit** `git add src/vendor/vendorLedger.ts src/components/parties/VendorStatementDialog.tsx tests/vendorLedger.test.ts && git commit -m "feat(vendor): project two independent dated statements"`.

### Task 4: Vendor Party profile and contextual actions

**Files:** Create `src/components/parties/VendorWorkspace.tsx`, `src/components/parties/VendorActionDialog.tsx`; Modify `src/components/parties/PartyDetail.tsx`, `src/pages/Parties.tsx`, `src/navigation/erpNavigation.ts`; Test `tests/vendorWorkspace.test.ts`, `scripts/vendor-workflow-browser.cjs` (initial assertions).

**Interfaces:** Uses Vendor store and statement from Tasks 2–3. `VendorWorkspace` accepts `{party: Party}` plus callbacks for Edit/Statement/Source actions as necessary; integrates *within* `PartyDetail` without a duplicated Party master form or duplicate generic signed ledger. `VendorActionDialog` accepts `{kind: VendorSettlementKind | 'issue-goods'; vendorPartyId: string; sourceId?: string; open: boolean; onClose: () => void}`.

- [ ] **Step 1: Write failing tests**: `role=Vendor` route filters only Vendor-role Parties, nav has distinct `Suppliers` and `Vendors` children, shared Party header shows two labeled balances, ledger rows show source reference and side; an unavailable permission renders a disabled button with reason; vendor status/relationship switch retains Party ID.
- [ ] **Step 2: Run red**: `node --experimental-strip-types --test tests/vendorWorkspace.test.ts`.
- [ ] **Step 3: Implement** compact Vendor-specific Party body, date range/search, source detail actions; adapt common `PartyDetail` header and themed controls. Provide in-module Pay/Return/Give/Receive dialogs with `preview only` copy. For `Give Products`, reuse `TransactionCartEditor`; for money use current split payment components or extract their common editor rather than copy POS payment logic. Dialog never claims a cash/bankbook write.
- [ ] **Step 4: Run green**, `npm run build`, `npm run test:parties`, `npm run test:party-ledger`, then initial `node scripts/vendor-workflow-browser.cjs`; expected zero failures.
- [ ] **Step 5: Commit** new UI, nav, tests and browser script with `git commit -m "feat(vendor): add contextual Party Vendor workspace"`.

## Increment B — POS sourcing and shared demo sale transaction

### Task 5: Cart-wide shortage allocation with net-stock/oversold protection

**Files:** Create `src/vendor/vendorStock.ts`; Modify `src/utils/posStock.ts` only to reuse/extend existing safe helpers; Test `tests/vendorStock.test.ts`.

**Interfaces:** Implements `allocatePosStock(lines, lots, now)`. The `PosStockRequest` and `PosStockAllocation` types defined in File Ownership map are exported from `vendorStock.ts`. Consumes `SaleStockSource`, `Product`, `StockLot`, `saleAvailableStock`.

- [ ] **Step 1: Write failing tests**: stock 5/request 8 -> Vendor allocation `own=5,vendor=3,negative=0`; Negative allocation `own=5,vendor=0,negative=3`; two repeated lines of 4+4 -> `own=4` and `own=1`, shortage 3; net stock 1 with positive lots 3 and OVERSOLD -2 -> only 1 own, 2 vendor; compound 1 Box 5 Pcs of 12 Pcs/Box -> 17 base units; expired-only stock and Service no-shortage; invalid/stale decisions rejected.
- [ ] **Step 2: Run red**: `node --experimental-strip-types --test tests/vendorStock.test.ts`.
- [ ] **Step 3: Implement** product-keyed allocation across line order; reserve owned base units once, use **net sellable** cap, preserve negative/vendored quantities separately; unit conversion stays in `src/utils/posQuantity.ts`, not reimplemented.
- [ ] **Step 4: Run green** and existing `node --experimental-strip-types --test tests/posStock.test.ts tests/posQuantity.test.ts tests/transactionCartParity.test.ts`; expected zero failures.
- [ ] **Step 5: Commit** `git add src/vendor/vendorStock.ts src/utils/posStock.ts tests/vendorStock.test.ts && git commit -m "fix(pos): allocate own vendor and negative stock across cart"`.

### Task 6: POS Vendor picker, inline Quick Add, source-cost UX and stale decision guards

**Files:** Modify `src/components/pos/StockShortageDialog.tsx`, `src/components/pos/CartTable.tsx`, `src/hooks/usePosCart.ts`, `src/pages/Pos.tsx`; Test `tests/vendorStock.test.ts` and browser cases in `scripts/vendor-workflow-browser.cjs`.

**Interfaces:** Consumes `availableParties()/dispatchPartyPreview({type:'create-party', ...})`, `getPartyPreviewSnapshot()`, Task 5 allocator, existing `SaleStockSource`. Preserve line's `stockSource` until quantity/unit/stock/vendor changes invalidate it. New Vendor Quick Add must create Party with `roles:['Vendor']` (or add Vendor to an existing identity by the normal validated role editor).

- [ ] **Step 1: Extend failing tests**: Vendor list reacts to newly created Party without reloading; party selected by `id`; cost typed in `Box` converts to base `Pcs`; cart/discount/payments/draft remain untouched; changing qty/unit clears stale Vendor/Negative decision; zero owned stock Own option removes line; same product across rows cannot double-spend inventory.
- [ ] **Step 2: Run red browser/unit tests**: `node --experimental-strip-types --test tests/vendorStock.test.ts` and `node scripts/vendor-workflow-browser.cjs` with the established local Vite Playwright harness.
- [ ] **Step 3: Implement** existing modal (not a fork), canonical searchable Party ID picker, inline Party editor, affordable Vendor-cost preview and affected-stock summary; keep keyboard focus/Esc/Enter stable and style via existing theme tokens. Source choices are required before simulated completion when shortage exists.
- [ ] **Step 4: Run green**: focused tests, `npm run test:pos-reorder`, `npm run test:compound-units`, `npm run build`.
- [ ] **Step 5: Commit** `git add src/components/pos/StockShortageDialog.tsx src/components/pos/CartTable.tsx src/hooks/usePosCart.ts src/pages/Pos.tsx tests/vendorStock.test.ts scripts/vendor-workflow-browser.cjs && git commit -m "feat(pos): complete in-cart Vendor sourcing editor"`.

### Task 7: Atomic *demo* sale source simulation (no false business posting)

**Files:** Create `src/vendor/vendorSalePreview.ts`; Modify `src/vendor/vendorTypes.ts`, `src/vendor/vendorModel.ts`, `src/vendor/vendorPreviewStore.ts`, `src/pages/Pos.tsx`, `src/components/parties/VendorWorkspace.tsx`; Test `tests/vendorSalePreview.test.ts` and browser script.

**Interfaces:** `prepareVendorSalePreview(invoiceId, allocations, saleLines)` returns a typed demo sale with explicit `sourceMode:'demo'`; `applyVendorCommand(..., {type:'simulate-pos-sale', operationId, sale})` applies all Vendor sourcing allocations and events as *one* in-memory operation. Vendor workspace `View source` opens that exact preview invoice snapshot in an internal detail sheet.

- [ ] **Step 1: Write failing tests**: 8 sold/5 owned/3 Vendor yields exactly one linked demo sourcing event for ৳330; retry same operation ID leaves records unchanged; invalid second line means no sale/events written; negative mode yields no Vendor payable; changing original price does not rewrite saved historical Vendor cost; POS browser verifies explicit demo-only labels in receipt and Vendor workspace source detail.
- [ ] **Step 2: Run red**: `node --experimental-strip-types --test tests/vendorSalePreview.test.ts`.
- [ ] **Step 3: Implement** pure prepared snapshot and reducer command; display `Preview / Simulate in demo` rather than false completed/posted confirmation on UI-only routes. No customer/supplier Party, sales history, stock or finance authoritative mutation. If mock record exists, label it `Demo simulation` and make it visible through its Vendor source link. Never treat local POS receipt confirmation as a real persisted invoice.
- [ ] **Step 4: Run green**: new test, `npm run build`, `node scripts/vendor-workflow-browser.cjs`; verify no ghost Vendor due after failed/duplicate simulation.
- [ ] **Step 5: Commit** `git add src/vendor/vendorSalePreview.ts src/vendor/vendorTypes.ts src/vendor/vendorModel.ts src/vendor/vendorPreviewStore.ts src/pages/Pos.tsx src/components/parties/VendorWorkspace.tsx tests/vendorSalePreview.test.ts scripts/vendor-workflow-browser.cjs && git commit -m "feat(vendor): link demo POS source to Vendor preview ledger"`.

## Increment C — Settlement, physical exchanges and audit safety

### Task 8: Source-allocated payments, physical returns and goods issue/receipt

**Files:** Modify `src/vendor/vendorTypes.ts`, `src/vendor/vendorModel.ts`, `src/components/parties/VendorActionDialog.tsx`; Test `tests/vendorModel.test.ts`, `tests/vendorSettlements.test.ts`, browser script.

**Interfaces:** `settle-source` command with `sourceId`, `side`, `kind`, `amountPaisa`, optional `baseQty`, `paymentSplits`, `operationId`; use `sourceOutstanding(state, sourceId)` to guard quantities/values. `issue-goods` command with product lines and physical availability. Aggregate payment split amounts equal settled amount exactly in paisa.

- [ ] **Step 1: Write failing tests**: payable 33000 minus paid 20000 minus linked goods return 13000 = 0; issuing 2×7000 then receive 7000 and return one unit 7000 = 0; only physically held owned units can leave; split Cash 12000 + Bank 8000 equals settlement 20000; over-settlement, wrong Vendor, wrong side, wrong source, duplicate operation ID, unavailable stock or one bad memo line reject the *whole* command.
- [ ] **Step 2: Run red**: `node --experimental-strip-types --test tests/vendorSettlements.test.ts`.
- [ ] **Step 3: Implement** grouped multi-product issue memo, physical stock delta recorded only in the *demo* inventory projection, source-allocated settlement and complete reason/provenance. No real bank/cashbook posting; preview text says what was simulated. Disable unsupported advance/automatic netting actions.
- [ ] **Step 4: Run green**: new and existing Vendor tests, `npm run build`, `node scripts/vendor-workflow-browser.cjs`.
- [ ] **Step 5: Commit** `git add src/vendor/vendorTypes.ts src/vendor/vendorModel.ts src/components/parties/VendorActionDialog.tsx tests/vendorModel.test.ts tests/vendorSettlements.test.ts scripts/vendor-workflow-browser.cjs && git commit -m "feat(vendor): simulate sourced payable and issued receivable settlement"`.

### Task 9: Guarded correction, reversal and return ambiguity

**Files:** Create `src/vendor/vendorCorrection.ts`; Modify `src/vendor/vendorModel.ts`, `src/components/parties/VendorWorkspace.tsx`, `src/components/parties/VendorActionDialog.tsx`; Test `tests/vendorCorrection.test.ts`.

**Interfaces:** `vendorCorrectionImpact(state, sourceId)` returns linked settlement IDs and reason; reducer `reverse-event` requires actor + nonempty reason and is idempotent by operation ID. Existing Vendor source snapshots remain audit-visible with inactive/superseded status; render `Needs source review` for ambiguous customer returns.

- [ ] **Step 1: Write failing tests**: corrected sourcing without settlement projects replacement delta once; settled sourcing cannot be edited/deleted until dependent settlements reversed; reversing a payment updates the right side and does not delete audit history; Vendor deactivation preserves historical invoices; ambiguous Vendor-sourced customer return does not add owned stock or erase payable.
- [ ] **Step 2: Run red**: `node --experimental-strip-types --test tests/vendorCorrection.test.ts`.
- [ ] **Step 3: Implement** impact dialog, source-linked correction/reversal with reason and audit record. Reuse existing permission and confirmation patterns; make unavailable actions clearly disabled with explanation. Do not mutate original `salesInvoices` fixture or silently rewrite a posted source.
- [ ] **Step 4: Run green**: new test, `npm test`, `npm run build`, `node scripts/vendor-workflow-browser.cjs`.
- [ ] **Step 5: Commit** `git add src/vendor/vendorCorrection.ts src/vendor/vendorModel.ts src/components/parties/VendorWorkspace.tsx src/components/parties/VendorActionDialog.tsx tests/vendorCorrection.test.ts && git commit -m "feat(vendor): guard corrections and linked returns"`.

### Task 10: Browser regression, accessibility, docs and release gate

**Files:** Modify `scripts/vendor-workflow-browser.cjs`, `package.json`, `.github/workflows/ui-check.yml`; optionally `docs/ui/erp-workflow-audit-2026-10-09.md` with verified Vendor status; Test all Vendor and affected existing suites.

**Interfaces:** `npm run test:vendor-workflow` invokes Vendor Playwright smoke on the standard local server harness. CI on every PR to `main`; do not alter unrelated app route contracts.

- [ ] **Step 1: Add browser assertions**: Vendor role navigation; create Vendor in POS with cart preserved; switch Own/Negative/Vendor; 4+4 stock cap; compound unit cost; both balances, source actions, partial settlement, CSV download and print preview; dark/light contrast, keyboard navigation, mobile viewport, focus restoration; explicit demo copy, no misleading posting toast.
- [ ] **Step 2: Run failing browser test** on a deliberately absent/unimplemented guard and confirm it detects that omission; then wire the final UI/command behavior to satisfy it.
- [ ] **Step 3: Add package script and CI step** for `test:vendor-workflow`, following `test:parties` and `test:pos-reorder` conventions. Document deferred true consignment and backend boundary; do not list Vendor as posted/accounting-ready.
- [ ] **Step 4: Run all gates**: `npm test`; `npm run build`; `npm run check:ui-contract`; `npm run test:vendor-workflow`; `npm run test:pos-reorder`; `npm run test:compound-units`; `npm run test:parties`; `npm run test:party-ledger`; `npm run test:party-settlement`; `npm run test:theme`; `npm run test:erp-navigation`; `npm run test:purchases`. Expected every command exits 0. Read GitHub Actions logs on exact final PR head and fix any failures; do not claim unrun checks pass.
- [ ] **Step 5: Commit** verified changes, push feature branch and open a **draft** PR with scope, screenshots/test evidence, and explicit demo-only constraints. Do not merge automatically; obtain review.

## Additional backend handoff (NOT a UI task)

The real `hisabiq` NestJS repository, once independently approved, must implement transactionally posted `Sale` + `SaleLine` + FIFO lots/oversold + `VendorSource` + payable/receivable subledger + cash/bank/MFS + audit/outbox. Validate all source IDs in authenticated tenant scope, allocate stock under concurrency control, guarantee idempotency with unique tenant+operation key, and reconcile refund/correction chains. **No future work in that backend is authorized by this plan.**

## Native execution handoff and review points

1. **Review this spec + plan first**. No implementation code on the docs-only branch.
2. When approved, create a fresh feature branch from current `main`, not from the Expense PR #51 branch.
3. Execute Tasks 1–4 (Increment A) natively, verify, open a draft PR; then Tasks 5–7 (Increment B); then Tasks 8–10 (Increment C). Dependencies are ordered. If combined into one feature branch for integration, retain commit/checkpoint boundaries.
4. Re-read and compare the current `main` state before every increment; do not overwrite previously merged component/nav/theme updates.
5. Ask for review of the actual UI/demo in Cloudflare/local preview **after** the draft PR CI is green. Merge only after explicit approval.

**Scope reminder:** A passing demo simulation is not a production accounting system. Preserve truthful labels until the backend exists.
