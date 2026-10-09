# HisabIQ UI — Mandatory Agent Rules

This file applies to the entire repository, all pages, PRs, and AI-generated UI changes. Read [UI Design & Transaction Cart Contract](docs/ui/transaction-cart-design-contract.md) **before** modifying any screen, reusable component, or product transaction workflow.

## Non-negotiable design authority
1. **Magic Patterns export and existing HisabIQ design tokens are the visual authority.** Use existing React/TypeScript and shared shadcn-style primitives (`Input`, `Button`, `Dialog`, `AppSelect`, themed date controls, etc.). Never create a competing design system or one-off field styling when a shared primitive exists.
2. **POS V2 cart is the behavioral and visual authority for every product-transaction cart**: Sales/POS, Purchases, Quotations/Estimates, Online Sales, Sales/Purchase Returns, Opening Stock, replacement/service parts, stock movement and future modules.
3. **Import and reuse actual shared components and helpers.** Never copy/paste a page-local approximation of POS `Add product`, inline cart editor, searchable dropdown, unit switch, quick-add, split payments or product rows. If a context differs, extend a reusable component with semantic variants (`sale | purchase | quote | online | return`) and callbacks, not forked markup.
4. **Product selection must be searchable** (not a plain `AppSelect`/`FormSelect` listing products): one input/dropdown assembly; supports Bangla and English names, keyboard Up/Down/Enter/Escape, touch selection, focus return, clearable query, stock/price/unit/category, and a shared **Quick Add Product** path. Keep the add-product entry position consistent with the approved POS inline-cart pattern; do not move it to a different location per module.
5. **Every editable cart uses shared interaction rules** for line numbering, quantity, compound large+small units (e.g. `2 Box 5 Pcs`, `1 Gauge 12 Gira`), price in selected unit, line total, contextual row actions, reorder when applicable, discount and accurate preview amounts. Keep user-input source unit, conversion, keyboard/touch behavior and errors consistent. No monospaced numbers.
6. **Context-specific business rules may differ; visuals and controls must not.** Purchase price/lot/supplier differ from Selling price/stock/customer; Quotation is non-posting; Online order uses delivery/COD; Returns validate prior quantities. POS is the reference **UI**, not a license to reuse wrong finance/stock posting logic.
7. **Payment-capable flows** use the POS-style multiple Cash/Bank/MFS rows, conditional account selectors, total/Paid/Due, discount and rounding; source-specific permissions and accounting remain correct. Quotations do not accept real payments by default; if they show deposit terms, distinguish planned from actually received.
8. **Forms, filters and overlays**: use shared inputs, search combobox where search is needed, select for short fixed lists, shared popovers, Dialog/AlertDialog, compact Tables, accessible labels/focus/validation, standard color tokens in light and dark, Bangla helpers. Date spans use the shared date-range picker. Do not manually style arbitrary native selects/dropdowns to imitate shadcn.
9. **No cosmetic-only functionality.** Menus, dialogs, actions, empty states, buttons and modals must work at the intended UI-preview level. Never imply stock, payment, customer ledger, courier or SMS posting without real backend integration.
10. **Before PR review**, compare changed flows side-by-side with POS V2 and Purchase Cart at desktop and mobile sizes, keyboard and touch, light and dark. Verify search, addition, quick create, unit selection, quantity and price, reorder where applicable, payment, errors, keyboard focus and print order. Add/update Playwright tests.

## Known divergences — not approved precedent
- POS `src/components/pos/{CartTable,ProductCombobox}.tsx` is current reference.
- Purchases `src/components/purchases/{PurchaseCart,PurchaseProductSearch}.tsx` follows POS style but duplicates some picker logic; consolidate into shared primitives, **do not duplicate it again**.
- Draft PRs for Quotations and Online Sales initially use page-local `AppSelect` product pickers and different cart rows. These are **migration debt**, not reusable patterns. See [migration inventory](docs/ui/transaction-cart-design-contract.md#existing-gap-inventory-and-migration-order).
- Source code must be the same **component family**, not just similar CSS. If missing, build/refactor a shared component before shipping a new product entry screen.

## PR acceptance
- Explicitly name which shared cart/picker/input/quick-add components were reused. List and justify any exceptions; do not silently create new patterns.
- Add regression tests; document any pre-existing legacy exceptions in the contract and remove them as part of migration.
- CI runs `npm run check:ui-contract`. It blocks new page-local product dropdowns while grandfathering only currently identified draft-page violations. Do not expand the exception allowlist to make new work pass.
- Keep changes KISS. No mass visual redesign of unrelated pages in a feature PR. Do not merge without user approval.
