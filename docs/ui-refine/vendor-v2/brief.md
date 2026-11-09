# Vendor V2 — approved design and implementation brief

**Owner decision (2026-11-06):** Add a new Vendor V2 without deleting or changing the old Vendor workspace. Source: GitHub `shuvodelux-commits/hisabiq_ui`, account `shuvodelux@gmail.com`.

## Visual authority
Use the existing Party Ledger workspace exactly as the source for the two-column directory/detail arrangement, selection, 3 underline tabs, compact typography and bilingual helpers. Use the actual POS V2 `ProductCombobox`, `MultiUnitQuantityInput`, `CompoundQuantityInput`, theme primitives and Purchase Cart patterns for an inline **multiple-product** cart. Do not paste custom HTML/CSS from the chat preview: rebuild through the existing shared React components.

## Routes and scope
- Preserve `#/app/vendors` as Vendor V1.
- Add an opt-in `#/app/vendors-v2` with a clearly visible V1/V2 switch, retaining current Vendor V1 and its data.
- New UI files under `src/pages/VendorV2.tsx` and `src/components/vendor/VendorV2Cart.tsx` (and tests). Only minimal route/navigation hooks in existing files.
- A source-linked Vendor memo may have multiple product lines and multi-unit quantities. The Vendor model is UI-only preview, **not backend accounting**.
- Outright Purchase uses the actual Purchase editor; outright Sale uses POS V2. Never create duplicate posting logic inside Vendor V2.

## KISS requirements
- Party directory on left, selected Vendor details to right, responsive mobile picker.
- Tabs: Ledger / Taken / Given. Primary actions: Take Goods, Give Goods. Contextual Settle and Price Pending. Regular Purchase/Sale under More.
- For Take/Give use a wide purchase-style inline cart with existing searchable product quick-add and 1–4 linked unit fields on one line. Quantity is converted only once using the existing unit profile. Unknown cost must be explicit and excluded from known payable/receivable.
- Keep original price, settlement, audit, and stock functions; no cosmetic financial postings.
- Light/dark, keyboard, touch, 320/390/768/1024/1440, Bangla/English. Standard 36px controls and 0.375rem radius.

## Acceptance & evidence
- Add precise UI-level tests for route access, V1 preservation, multi-line multi-unit goods, price pending, partial settlement entry points, quick product/vendor add, and genuine Purchase/POS navigation.
- Run typecheck, lint, UI contract, unit tests, build, and relevant Playwright scripts; do not invent outcomes.
- Run GitHub-only Impeccable source detector and UI-refine baseline/fix/closing checks where runtime and screenshots are accessible. If fresh isolated reviewer agents, 3 rounds or actual screenshot pixels cannot run, label unverified honestly.
- Draft PR only. **No merge or deploy without explicit approval.**
