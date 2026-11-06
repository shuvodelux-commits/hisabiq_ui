# POS V2 full-screen refinement — three-round brief

**Verified route:** `#/app/pos`  
**Primary source:** `src/pages/Pos.tsx`  
**Primary components:** `src/components/pos/{CartTable,CheckoutPanel,CustomerPicker,ProductCombobox}.tsx`  
**Design:** Existing compact HisabIQ Ink/Teal React UI (Geist + Hind Siliguri), shared controls, light/dark, one-line multi-unit quantity on tablets.

## Goal

A cohesive, *non-redesign* three-round UI-refine-loop for the **actual POS V2 screen**, focused on compact scanability and customer/payment usability at phone (320/390), tablet portrait (768), tablet interior/landscape (820/1024) and desktop (1440). Preserve the live current `main` baseline and independently tested POS workflows. User specifically requested **the next recommended task** after Expenses #263, not another generic global polish.

## Protected workflows (P0, non-negotiable)

- Product search combobox, fuzzy name/SKU, keyboard F2, Enter → quantity → next product, optional quick item addition, cart reorder/removal, unit/price/discount calculations, 3–4 unit one-line tablet editing, shortage/lot/serial/expiry/warranty/bundle/vendor behavior.
- Customer selection, quick add, invoice name/phone/guardian/address details, due/credit/advance, source-linked customer ledger, installment/regular modes.
- Multiple payment rows, method/account selector and remaining/exact/quick amount actions, due/paid/change in correct currency, checkout validation and F9 review.
- Drafts, templates, duplicate/edit/continue, online handoff, existing POS preview-only accounting policies and permission checks.
- Original 36px common controls and 48px terminal sale action, no monospaced numbers; no new posting, backend, storage, auth, navigation or shared design redesign.

## Candidate audit focus (verify screenshots before choosing changes)

1. **C0 source and pixel audit:** real responsive layout, cart width and placement, keyboard shortcut strip, checkout-first scanning, header/quick items density; inspect empty and product-added states, customer details expanded, payments, dark mode.
2. **C1 — adapt/layout:** fix the highest-priority observed responsive header/cart issue, without changing cart or transaction logic.
3. **C2 — clarify/typeset:** improve observed customer/payment/totals readability, preserving split payment and credit safeguards.
4. **C3 — harden/polish:** fix actual remaining tablet/phone clipping and keyboard/touch issues from C1–C2 checks only; no speculative cosmetic edits.
5. **C4 closing audit:** before/after screenshot comparisons + real Playwright interaction assertions + TypeScript/lint/UI contract/unit/build, official pinned Impeccable mechanical source scan and issue verdict ledger.

## Evidence and exit

Automatic GitHub screenshots default at 320/390/768/1024/1440 in both themes. Add real opened customer/details, payment rows, product-added cart and dialogs to comparison harness as needed, and 820px in focused browser tests. Annotate limitations if runtime/artifacts aren't inspectable; do not invent independent agent /40 scores. One **draft PR**, explicitly held for owner merge approval.
