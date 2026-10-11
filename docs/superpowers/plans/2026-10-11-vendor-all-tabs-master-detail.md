# HisabIQ Vendor: Five-Tab Master–Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the approved, compact Vendor Products Received split-workspace behavior to the remaining Vendor tabs without recreating the existing HisabIQ cart, Purchase Editor, accounting model, or payment posting.

**Architecture:** Keep `VendorTabs` as the common header and tab coordinator; extract per-tab views and one small responsive master–detail layout. Reuse the actual `PurchaseCart`, `PurchaseEditor`, `VendorClearDuePanel`, `VendorActionDialog`, `FinancePaymentSplitEditor`, Party opening UI, Vendor preview commands, and ledger projections. Only display/selection/form composition changes; ordinary Purchases remain separate from Vendor sourcing payables.

**Tech Stack:** React + TypeScript + Vite, Tailwind/shadcn-style existing theme primitives, Node built-in test runner, Playwright browser scripts, GitHub Actions UI Check.

**Spec:** `docs/superpowers/specs/2026-10-11-vendor-all-tabs-master-detail-design.md` (approved 2026-10-11).

## Global Constraints

- Source: `shuvodelux-commits/hisabiq_ui`, GitHub account `shuvodelux@gmail.com`; **no MagicPath-generated code**.
- Start from the stacked foundation **PR #61 → PR #62 → PR #63**; do not change `main` or merge these PRs implicitly. Create an implementation feature branch from the tip of PR #63, including this reviewed specification and plan.
- Five visible tabs: **Ledger | Products Received | Products Issued | Purchases | Payments**, with secondary Bangla helper text; preserve URL keys `ledger`, `taken`, `given`, `purchases`, `payments` and existing `sourceKind: 'sourcing'|'issue'`.
- UI-only preview: no NestJS/backend changes, no real money movement or stock posting, no duplicate Party/Vendor ledger records.
- Desktop master–detail list **40% / detail 60%** from `lg` breakpoint; mobile list then detail; dense PurchaseCart and default Ledger are full-width.
- Product receiving may be **unpriced (null)**; never silently substitute ৳0. Monetary amounts use integer paisa; product quantities use base units and current compound conversion.
- Reuse current component inputs, themed date/select/combobox, English/Bangla labels, keyboard/F2/Enter flow, touch targets, and no monospaced digits.
- Source-linked settlements only; do not apply ordinary Purchase dues to Vendor sourcing or issue records. Reject invalid/mismatched selected Vendor, stale source links and overpayment.
- Each task is native/test-first (red → green → commit). Avoid broad POS/Purchase refactors and do not alter `legacy/`.

## Review Focus

These five easily missed inputs must be tested in the owning tasks:

1. **Wrong-Vendor / wrong-kind deep link:** fall back safely without showing another Party's source or posting against it (Task 1 and Task 6).
2. **Unpriced source with payment attempt:** still shown as Price not set; money submission rejected, while product return can proceed when permitted (Tasks 2, 3 and 5).
3. **Wrong/duplicate/rounded payment split:** rejected before posting; exactly one Vendor command with matching total and integer paisa (Task 3).
4. **Dirty cart or payment editor when switching records/tabs/Vendors:** explicit discard confirmation and no hidden partial transaction (Tasks 1, 2, 4 and 7).
5. **Already-settled or empty filtered records:** read-only/no record-payment action; search and selection behave safely on phone and desktop (Tasks 1, 4, 5 and 8).

## File and interface map

| Responsibility | Create or modify |
| --- | --- |
| Shared selection | Create `src/vendor/vendorWorkspaceSelection.ts`; test `tests/vendorWorkspaceSelection.test.ts` |
| Shared responsive presentation | Create `src/components/vendor/VendorMasterDetailLayout.tsx` |
| Existing Received split | Create `src/components/vendor/VendorReceivedWorkspace.tsx`; modify `src/components/vendor/VendorTabs.tsx`; test `scripts/vendor-workflow-browser.cjs` |
| Vendor action form and payment adapter | Create `src/components/vendor/VendorSourceActionForm.tsx`, `src/vendor/vendorPaymentAdapter.ts`; modify `src/components/parties/VendorActionDialog.tsx`; test `tests/vendorPaymentAdapter.test.ts` and `scripts/vendor-context-browser.cjs` |
| Issued split | Create `src/components/vendor/VendorIssuedWorkspace.tsx`; test `scripts/vendor-goods-browser.cjs` |
| Purchase split | Create `src/components/vendor/VendorPurchasesWorkspace.tsx`; test `scripts/vendor-context-browser.cjs` and `scripts/purchase-browser.cjs` |
| Payments split / Party links | Create `src/components/vendor/VendorPaymentsWorkspace.tsx`; modify `src/vendor/vendorRoute.ts`, `src/pages/Vendors.tsx`, `src/components/parties/PartyDetail.tsx`, `src/pages/Parties.tsx`; test `tests/vendorRoute.test.ts`, `scripts/vendor-party-profile-browser.cjs` |
| Ledger + Party opening | Create `src/components/vendor/VendorLedgerWorkspace.tsx`; modify `src/components/vendor/VendorTabs.tsx`, `src/components/parties/PartyDetail.tsx`, `src/pages/Parties.tsx`; test `scripts/vendor-correction-browser.cjs`, `scripts/party-opening-browser.cjs` and `tests/vendorLedger.test.ts` |
| Full verification | Modify `.github/workflows/ui-check.yml` only if adding a new named browser script; existing tests must stay in the CI job |

### Task 1: Select a valid record and reuse the 40/60 shell

**Files:** Create `src/vendor/vendorWorkspaceSelection.ts`, `tests/vendorWorkspaceSelection.test.ts`, `src/components/vendor/VendorMasterDetailLayout.tsx`; modify `scripts/vendor-workflow-browser.cjs`.

**Interfaces:**
- `selectVendorSource(sources:readonly VendorSource[],state:VendorPreviewState,kind:VendorSource['sourceKind'],preferredId?:string|null):VendorSource|null`
- `VendorMasterDetailLayout({list,detail,editingFullWidth=false,testId}:{list:React.ReactNode;detail:React.ReactNode;editingFullWidth?:boolean;testId:string})`

- [ ] **Step 1 — Red test:** Node test: explicit in-Vendor preferred source wins; other Vendor/wrong kind source ID is rejected; first positive amount/unpriced source chosen otherwise; all settled returns first record for read-only details; empty returns `null`. Browser asserts 40/60 desktop layout and mobile list-above-detail.
- [ ] **Step 2 — Verify red:** Run `npm test` and `npm run test:vendor-workflow`; new helper/assertions must fail because interface is absent.
- [ ] **Step 3 — Implement:** Add pure source-selection logic using `sourceOutstanding` and exact Party/kind filter; layout uses existing `lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]` and full-span mode without form logic.
- [ ] **Step 4 — Verify green:** Re-run those commands; assert all new cases and original Received browser steps pass.
- [ ] **Step 5 — Commit:** `git add src/vendor/vendorWorkspaceSelection.ts tests/vendorWorkspaceSelection.test.ts src/components/vendor/VendorMasterDetailLayout.tsx scripts/vendor-workflow-browser.cjs && git commit -m "feat(vendor): add safe record selection and shared split layout"`.

### Task 2: Extract the existing Received workspace without behavior regression

**Files:** Create `src/components/vendor/VendorReceivedWorkspace.tsx`; modify `src/components/vendor/VendorTabs.tsx`, `scripts/vendor-workflow-browser.cjs`, `scripts/vendor-clear-due-browser.cjs`.

**Interfaces:**
- `VendorReceivedWorkspace({partyId,snapshot,sources,sourceId,onDirtyChange}:{partyId:string;snapshot:VendorPreviewState;sources:readonly VendorSource[];sourceId:string|null;onDirtyChange:(dirty:boolean)=>void})`
- Consumes Task 1's `selectVendorSource` and `VendorMasterDetailLayout`; mounts existing `VendorGoodsEditor mode="taken"` and `VendorClearDuePanel` unchanged.

- [ ] **Step 1 — Red test:** Existing Received tab keeps default selected outstanding receipt, changes selection without another modal, keeps known balance vs Price not set distinct, and after settlement selects the next actionable record. New test covers selecting a receipt with unsaved cart and choosing Cancel; cart stays open.
- [ ] **Step 2 — Verify red:** Run `npm run test:vendor-workflow` and `npm run test:vendor-clear-due` against the new test.
- [ ] **Step 3 — Implement:** Move PR #63 markup/state into the dedicated workspace; preserve the same settlement command and selectors. On save, use snapshot update to recalculate outstanding selection; guard unsaved changes and reset form only after accepted dispatch.
- [ ] **Step 4 — Verify green:** Re-run both tests and `npm run test:vendor-evening`. Confirm the canonical `data-testid="purchase-cart"` appears when Receive Products is selected at full width.
- [ ] **Step 5 — Commit:** `git add src/components/vendor/VendorReceivedWorkspace.tsx src/components/vendor/VendorTabs.tsx scripts/vendor-workflow-browser.cjs scripts/vendor-clear-due-browser.cjs && git commit -m "refactor(vendor): isolate approved received-products workspace"`.

### Task 3: Reuse Vendor action form and shared finance split inputs

**Files:** Create `src/vendor/vendorPaymentAdapter.ts`, `tests/vendorPaymentAdapter.test.ts`, `src/components/vendor/VendorSourceActionForm.tsx`; modify `src/components/parties/VendorActionDialog.tsx` and `scripts/vendor-context-browser.cjs`.

**Interfaces:**
- `vendorPaymentSplits(rows:readonly FinancePaymentDraft[],accounts:readonly FinanceAccount[],expectedPaisa:number):NonNullable<VendorSettlement['paymentSplits']>` validates method/account consistency, positive two-decimal amounts, exact sum in integer paisa and unique row IDs. Do **not** let `normalizeFinancePaymentSplits` silently fill a blank row or use floating total fallback.
- `VendorSourceActionForm({source,mode,onSaved,onCancel}:{source:VendorSource;mode:Exclude<VendorActionMode,'details'>;onSaved:()=>void;onCancel?:()=>void})`; the existing dialog wraps this body and keeps its read-only details mode.
- A single submission path dispatches existing `set-source-price` or `settle-source` commands (no new transaction record type).

- [ ] **Step 1 — Red test:** Assert matching Cash/Bank/MFS rows yield exactly the expected integer-paisa split total; wrong account type, missing amount, >2 decimals, duplicate IDs, mismatched sum, negative/NaN values reject; unknown-price payable disallows money while a permitted matching-goods return remains possible.
- [ ] **Step 2 — Verify red:** Run `npm test` and `npm run test:vendor-context`.
- [ ] **Step 3 — Implement:** Extract existing VendorActionDialog action-body and dispatch path; use actual `FinancePaymentSplitEditor`, convert its `FinancePaymentDraft` through the validated Vendor adapter. Keep wrapper modal for existing callers; no Customer/Supplier PartyPaymentDialog coercion.
- [ ] **Step 4 — Verify green:** Re-run above plus `npm run test:vendor-evening`; verify exactly one settlement event and source correct after a confirmed submit.
- [ ] **Step 5 — Commit:** `git add src/vendor/vendorPaymentAdapter.ts tests/vendorPaymentAdapter.test.ts src/components/vendor/VendorSourceActionForm.tsx src/components/parties/VendorActionDialog.tsx scripts/vendor-context-browser.cjs && git commit -m "refactor(vendor): share source actions and finance payment inputs"`.

### Task 4: Products Issued split workspace

**Files:** Create `src/components/vendor/VendorIssuedWorkspace.tsx`; modify `src/components/vendor/VendorTabs.tsx`, `scripts/vendor-goods-browser.cjs`.

**Interfaces:**
- `VendorIssuedWorkspace({partyId,snapshot,sources,sourceId,onDirtyChange}:{partyId:string;snapshot:VendorPreviewState;sources:readonly VendorSource[];sourceId:string|null;onDirtyChange:(dirty:boolean)=>void})`.
- Uses Task 1 selection/layout, Task 3 `VendorSourceActionForm`, and existing `VendorGoodsEditor mode="given"` / real `PurchaseCart`.

- [ ] **Step 1 — Red test:** Desktop issued record list left and selected receivable/returned-product actions right; selecting another issued record updates reference; Receive Payment records correct receivable direction; Receive Returned Products uses matching product and validates stock; settled item offers read-only details. Assert `data-testid="purchase-cart"` on full-width Issue Products action.
- [ ] **Step 2 — Verify red:** Run `npm run test:vendor-goods` and `npm run test:vendor-context` with the new assertions.
- [ ] **Step 3 — Implement:** Add issued list/detail, search and status; selected action toggles the embedded shared form; keep one form at a time. Switching a dirty form requires confirmation; no phantom payable invoice.
- [ ] **Step 4 — Verify green:** Re-run both tests and `npm run test:vendor-correction`.
- [ ] **Step 5 — Commit:** `git add src/components/vendor/VendorIssuedWorkspace.tsx src/components/vendor/VendorTabs.tsx scripts/vendor-goods-browser.cjs && git commit -m "feat(vendor): add issued-products master-detail workspace"`.

### Task 5: Reuse existing Purchase workflow in Purchases tab

**Files:** Create `src/components/vendor/VendorPurchasesWorkspace.tsx`; modify `src/components/vendor/VendorTabs.tsx`, `scripts/vendor-context-browser.cjs`, `scripts/purchase-browser.cjs` only if existing purchase assertions need extending.

**Interfaces:**
- `VendorPurchasesWorkspace({partyId,purchases,onSave,onDirtyChange}:{partyId:string;purchases:readonly Purchase[];onSave:(purchase:Purchase)=>void;onDirtyChange:(dirty:boolean)=>void})`; apply `purchase.supplierId===partyId` filter **within** workspace before selecting/displaying.
- Existing `PurchaseEditor embedded initialSupplierId={partyId} lockedSupplierId={partyId} onCompleted={onSave}` is the **only** editor and gets full width.

- [ ] **Step 1 — Red test:** Only selected Vendor's invoices appear; first outstanding invoice selected, search changes selected detail safely, paid/due amounts match original purchase record; Buy Products renders full-width existing PurchaseEditor and preserves multi-unit, discount and split-payment flow. Completed invoice must not offer a fabricated Pay or Return operation.
- [ ] **Step 2 — Verify red:** Run `npm run test:vendor-context` and `npm run test:purchases`.
- [ ] **Step 3 — Implement:** Add 40/60 read-only Purchase list/details using original Purchase records. Buy Products swaps to existing full-width PurchaseEditor, locked Vendor; retain `savePurchase` projection/idempotency handling in VendorTabs.
- [ ] **Step 4 — Verify green:** Run both scripts, `npm run test:vendor-workflow` and `npm run build`.
- [ ] **Step 5 — Commit:** `git add src/components/vendor/VendorPurchasesWorkspace.tsx src/components/vendor/VendorTabs.tsx scripts/vendor-context-browser.cjs && git commit -m "feat(vendor): reuse PurchaseEditor in vendor purchase workspace"`.

### Task 6: Payments split and accurate Party deep links

**Files:** Create `src/components/vendor/VendorPaymentsWorkspace.tsx`; modify `src/components/vendor/VendorTabs.tsx`, `src/vendor/vendorRoute.ts`, `src/pages/Vendors.tsx`, `src/components/parties/PartyDetail.tsx`, `src/pages/Parties.tsx`, `tests/vendorRoute.test.ts`, `scripts/vendor-party-profile-browser.cjs`, `scripts/vendor-workflow-browser.cjs`.

**Interfaces:**
- `export type VendorPaymentIntent='make'|'receive'` in `src/vendor/vendorRoute.ts`.
- Preserve 3-argument behavior while extending `vendorWorkLink(partyId:string,tab?:VendorWorkTab,sourceId?:string,intent?:VendorPaymentIntent):string`. Add `resolveVendorPaymentIntent(search:string):VendorPaymentIntent|null`. Pass optional intent into `VendorTabs` and then `VendorPaymentsWorkspace`.
- `VendorPaymentsWorkspace({partyId,snapshot,sources,purchases,sourceId,intent}:{partyId:string;snapshot:VendorPreviewState;sources:readonly VendorSource[];purchases:readonly Purchase[];sourceId:string|null;intent?:VendorPaymentIntent|null})` uses Task 3's Vendor source-action body.

- [ ] **Step 1 — Red test:** Party Make Payment deep-links to payable sourcing source; Receive Payment links to issued receivable source; wrong-kind/missing source cannot pay. Two source groups and history are visible. Payment review uses split accounts, correct direction, amount and source reference. Ordinary Purchase due is separate and links to Purchase workflow without auto-posting to Vendor sourcing.
- [ ] **Step 2 — Verify red:** Run `npm test`, `npm run test:vendor-party-profile` and `npm run test:vendor-workflow`.
- [ ] **Step 3 — Implement:** Add source chooser/history left and embedded shared Vendor action form right. Add typed intent to route/Party shortcuts without changing existing route keys. Validate desired side before presenting form; stay on source after save and refresh totals/history from the preview store.
- [ ] **Step 4 — Verify green:** Re-run commands and `npm run test:vendor-evening`, `npm run test:party-ledger`.
- [ ] **Step 5 — Commit:** `git add src/components/vendor/VendorPaymentsWorkspace.tsx src/components/vendor/VendorTabs.tsx src/vendor/vendorRoute.ts src/pages/Vendors.tsx src/components/parties/PartyDetail.tsx src/pages/Parties.tsx tests/vendorRoute.test.ts scripts/vendor-party-profile-browser.cjs scripts/vendor-workflow-browser.cjs && git commit -m "feat(vendor): add source-linked payments workspace and Party intent"`.

### Task 7: Ledger toolbar, transactions and single Party opening balance

**Files:** Create `src/components/vendor/VendorLedgerWorkspace.tsx`; modify `src/components/vendor/VendorTabs.tsx`, `src/components/parties/PartyDetail.tsx`, `src/pages/Parties.tsx`, `scripts/vendor-correction-browser.cjs`, `scripts/party-opening-browser.cjs`, `scripts/party-ledger-browser.cjs`; add unit test to `tests/vendorPartyProjection.test.ts` if this file exists, otherwise create `tests/vendorOpeningAdapter.test.ts`.

**Interfaces:**
- `VendorLedgerWorkspace({profile,snapshot,party,onReview,onPrint}:{profile:VendorPartyProfile;snapshot:VendorPreviewState;party:Party;onReview:(event:VendorLedgerEvent)=>void;onPrint:()=>void})`; preserve balance-side, date-range, query and statement projection without netting payable/receivable.
- Opening action uses **existing** `PartyOpeningDialog` with `relationship="Vendor"`. In `Parties.tsx` route Vendor `onSetOpening` to the existing Vendor preview `set-opening` command, mapping Party `credit`→Vendor `payable` and Party `debit`→Vendor `receivable`. The Vendor opening value displayed for editing must be derived from Vendor preview state, **not** an independent Party opening. Keep Customer/Supplier path unchanged.

- [ ] **Step 1 — Red test:** Full-width default ledger with right-aligned numeric columns, More and Print Ledger beside tabs, no redundant heading row; date/search/side filters work. Unknown cost appears unpriced. Party Vendor opening action opens PartyOpeningDialog, maps both directions into one Vendor opening store; second edit updates instead of creating a duplicate opening and cannot change real cash. Existing Vendor correction/reversal still works.
- [ ] **Step 2 — Verify red:** Run `npm run test:vendor-correction`, `npm run test:party-opening`, `npm run test:party-ledger`.
- [ ] **Step 3 — Implement:** Extract ledger table/toolbar only (do not fork Party LedgerTable into a new accounting table); retain Vendor statements and event review. Remove VendorTabs inline opening form/buttons. In PartyDetail use PartyOpeningDialog; adapt existing opening details from Vendor preview, keep a single source-of-truth command for Vendor opening.
- [ ] **Step 4 — Verify green:** Re-run three scripts, `npm test` and `npm run test:vendor-party-profile`; verify Supplier/Customer opening tests unchanged.
- [ ] **Step 5 — Commit:** `git add src/components/vendor/VendorLedgerWorkspace.tsx src/components/vendor/VendorTabs.tsx src/components/parties/PartyDetail.tsx src/pages/Parties.tsx scripts/vendor-correction-browser.cjs scripts/party-opening-browser.cjs scripts/party-ledger-browser.cjs tests && git commit -m "refactor(vendor): compact ledger and unify Party vendor opening"`.

### Task 8: Final responsive, accessibility and full-regression gate

**Files:** Modify `src/components/vendor/VendorTabs.tsx` (remove unused imports/state), `scripts/vendor-module-browser.cjs`, `scripts/vendor-workflow-browser.cjs`, `scripts/vendor-goods-browser.cjs` and `.github/workflows/ui-check.yml` **only if** a new browser script has been added.

**Interfaces:** No new domain interface. The five tabs and URL/source identities remain stable.

- [ ] **Step 1 — Red test:** Browser at 1440/1280 and 390px checks tab actions, desktop 40/60 list detail, mobile stack, no control overflow, keyboard focus and dirty-cart confirmation; a settled/empty source shows details not Pay, and both light/dark theme passes keep readable outlines.
- [ ] **Step 2 — Verify red:** Run `npm run test:vendor-module` and `npm run test:vendor-workflow` with these assertions; new failing assertions prove the expected UX.
- [ ] **Step 3 — Implement:** Remove duplicate row toolbars and obsolete inline forms, retain themed inputs and top ledger Print controls, fix only regression failures within Vendor UI. Ensure no new generic components or Purchase/POS modifications.
- [ ] **Step 4 — Verify green:** Run `npm run check:ui-contract`, `npm test`, `npm run build`, `npm run test:vendor-module`, `npm run test:vendor-workflow`, `npm run test:vendor-goods`, `npm run test:vendor-clear-due`, `npm run test:vendor-party-profile`, `npm run test:vendor-correction`, `npm run test:vendor-context`, `npm run test:vendor-evening`, `npm run test:purchases`, `npm run test:party-ledger`, `npm run test:party-opening`, `npm run test:theme`. GitHub PR `UI Check` is authoritative for full browser suite. If any test fails, fix and rerun; do not claim CI passed before success.
- [ ] **Step 5 — Commit/PR:** `git add src/components/vendor scripts .github/workflows/ui-check.yml && git commit -m "test(vendor): verify consistent five-tab UX and responsive layout"`. Open a new **draft stacked PR** targeting `feat/vendor-received-split-workspace`; include screenshot comparison in light/dark, link successful CI run, and leave unmerged for user review.

## Execution handoff and acceptance

Native Superpowers execution is preferred, consistent with the user's earlier explicit preference. Do not implement this plan before the owner's plan review.

Final checklist: no MagicPath code; actual PurchaseCart and PurchaseEditor preserved; source-linked Vendor money movements and one opening source; no duplicate posting; 40/60 split on operational tabs; full-width Purchase editor/ledger; responsive mobile; all relevant unit tests/build/CI successful; PRs merged only in order `#61 → #62 → #63 → five-tab PR` after approval.
