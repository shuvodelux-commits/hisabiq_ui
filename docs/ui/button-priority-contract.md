# HisabIQ action priority and control-size contract

**Status:** UI design contract for the React/shadcn-style ERP. **Reference:** [approved Magic Patterns design](https://www.magicpatterns.com/c/ufqg1kwzfxmsvtkmzxqx4d). This contract governs visual hierarchy, not transaction permission or posting logic.

## Principle

**Same action role → same appearance, rather than all buttons being equal size.**
Choose by the user's task, frequency, location, risk, and screen density. The approved Ink/Teal/Mint palette, Geist/Hind Siliguri text, thin borders, focus halo and rounded corners remain unchanged. Do not create a second Button library.

| Role | Shared Button API | Nominal control height | Typical use |
| --- | --- | --- | --- |
| Prominent contextual/page action | `size="lg"`, default/teal | 44px | New Sale, Receive Payment, Post/Complete Sale, Pay Vendor, Finish Return, Confirm finance action |
| Standard supporting action | default (omit `size`) | 36px | More, Filters, Columns, Save/Cancel when noncritical, import/export, Print |
| Compact inline/table action | `size="sm"` | 32px (36–40px if explicitly needed) | Apply to Invoice, Edit, View, row menu, table pagination |
| Icon-only | `size="icon"` / established icon variant | context-specific | More dots, clear, stepper, narrow toolbar |
| Critical/destructive | **Not a size**; use destructive treatment and confirmation | 36–44px by workflow importance | Delete, reverse, permanently cancel; never make red action prominent just because it is dangerous |

The **PageHeader action context** automatically promotes its default-variant primary action to 44px and its supporting outline actions to at least 36px. Phones use a 40px visual primary header control to preserve layout; the compact row and icon controls are excluded. For meaningful in-module primary actions, explicitly select `size="lg"`; do not rely on visual color alone.

## Priority decision

1. **Frequency:** Is this the main thing the user came here to do (e.g. new sale, receive payment)? Prominent.
2. **Context and density:** Page header / prominent section can be large. Table and ledger rows should remain compact.
3. **Risk:** Confirm financial posting with clear copy, disabled/validation states, and review. Danger is not a reason to make a destructive button huge.
4. **Placement:** One clear primary action per action group; supporting actions use outline or ghost. Do not have several equally prominent CTAs in one toolbar.
5. **Responsive and localization:** Bangla label wrapping and tablet horizontal space determine layout. Keep compact mobile tables dense; **do not add a blanket 44px min-height to every row/control**. Touch targets must remain usable through row/touch-specific treatments.
6. **State consistency:** Hover, keyboard focus, disabled, loading, validation and theme states must come from the existing shared primitives.
7. **Composition:** Joined numeric steppers, POS/purchase carts, and bespoke receipt entry fields keep their approved transaction geometry.

## Where the contract is implemented

- `src/components/Button.tsx`: existing shared shadcn-style wrapper.
- `src/components/PageHeader.tsx`: marks page-action context.
- `src/index.css`: defines priority-based heights and scoped dialog actions.
- `src/theme.css`: existing palette and focus tokens.
- `src/pages/Sales.tsx`, `src/components/parties/PartyDetailResponsive.tsx`, `src/pages/Finance.tsx`, `src/pages/Reconciliation.tsx`: explicit high-frequency contextual actions.
- Other pages using `PageHeader` inherit its hierarchy without local CSS.

## Audit scope and limitations

Initial source survey covered the main ERP page modules (Dashboard, POS, Sales, Products, Parties, Purchases, Purchase Editor, Finance, Expenses, Accounts, Daybook, Online Sales, Quotations, Reconciliation, Vendors, Warranty, Reports, Audit Ledger, Notifications) plus representative Party, POS, Purchase, Sales and product form components. Main observed divergence: multiple primary actions used `size="sm"`; CSS previously imposed broad minimum heights; native `<button>` row controls are also locally styled. Shared PageHeader sizing and the principal contextual cases are corrected in the accompanying PR. The native-button inventory and the remaining module-local exceptions are reported by `npm run check:button-priority` for follow-up, not falsely declared pixel-perfect.

**Verification required before merge:** `npm run build`, `npm run check:ui-contract`, `npm run test:magic-controls`; visually inspect 390px, tablet and desktop in light/dark and English/Bangla. Specifically verify compact Party/Sales rows, POS and Purchase carts, joined numeric fields, modal footer alignment and keyboard focus. Neither the source audit nor a green unit check certifies visual parity.
