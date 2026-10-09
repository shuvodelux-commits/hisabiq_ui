## What changed?
<!-- User-facing behavior and why this is needed. -->

## Design-system compliance — required for UI changes
Read [AGENTS.md](../AGENTS.md) and [Transaction UI Design Contract](../docs/ui/transaction-cart-design-contract.md).

- [ ] Reused existing shared shadcn-style controls, tokens and Magic Patterns visual language.
- [ ] For product lines: reused the approved POS V2 add-product/cart interaction **via shared components**; did not create a page-local `AppSelect`, picker, unit row or quick-add.
- [ ] Preserved the inline Add Product row, English/Bangla search, keyboard/touch entry, large+small units, price-in-unit and meaningful row actions.
- [ ] If flow takes payment: multi-method payment/account/discount and Paid/Due mirror POS layout, while remaining accounting-correct.
- [ ] Verified English+Bangla labels, light+dark fields/popovers/date pickers, compact mobile and desktop, focus and accessible labels.
- [ ] Added/updated tests (including Playwright for visual/interaction changes); `npm run check:ui-contract` passes.
- [ ] No mock UI falsely reports actual stock, money, invoice, SMS or courier posting.

### Shared components and helpers used
<!-- List concrete components, e.g. CartTable / ProductCombobox / PurchaseCart. -->

### Deviations / exceptions
<!-- Explain any deviation and reference explicit user approval. "Looks similar" is not an acceptable reason to fork. -->

### Screens tested
<!-- Desktop/mobile, keyboard/touch, light/dark. -->
