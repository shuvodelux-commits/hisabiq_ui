# HisabIQ ERP — component size consistency audit
**Date:** 2026-10-23  · **Scope:** existing React UI (source inspection) · **Design authority:** current HisabIQ and approved Magic Patterns, **not** a new button hierarchy.

## Verdict

The inconsistency is not isolated to the Sales page. There were three independent sources of drift:

1. **Shared primitive mismatch:** exported shadcn `Input` defaults to `h-8` (32px), while `AppSelect`, `SearchSelect`, `AppDateRangePicker`, and `NumericInput` use `h-9` (36px). Any form mixing these could render mismatched fields without choosing any local height.
2. **Touch escalation mismatch:** existing `@media(pointer: coarse)` rules expand standalone inputs and comboboxes to at least 44px, but the numeric input's outer `data-numeric-input` shell previously remained at 36px. The 44px inner input is explicitly suppressed, so the shell can appear short next to other fields.
3. **Screen-specific context mismatch:** Product editor already uses `--ctl-h: 40px` (44px on coarse/mobile), but its AppSelect triggers could remain h-9/36px; the Party ledger phone search and filter buttons are 40px, while the date/type selectors inherited 44px touch minimums.

These are specific source findings, not inferred screenshot pixel measurements. The 22-route screenshot/browser validation script was written but **not executed in this environment**.

## Source survey

Inspected all 21 `src/pages` modules, representative component-level forms/toolbars and existing `src/index.css`, `src/theme.css`, shadcn primitives, and existing field alignment scripts. A page with no direct `Input` may still render subcomponents containing input controls. The risk labels below describe **the propensity for sizing inconsistencies from mixed primitives**, not a measured failure count.

| ERP section | Source-level risk | Reason / location |
| --- | --- | --- |
| Sales / Returns / Credit | **High** | 13 direct Inputs, 14 FormSelect usages, plus compact h-8/h-9 overrides, separate Sales mobile/desktop toolbar; shared input mismatch was systematic |
| Finance / Counter | **High** | 12 direct Inputs, 6 FormSelect instances and multiple input/dialog contexts; touch numeric shells differed |
| Online Sales / Quotations | **High** | Online Sales has 20 Inputs and 10 AppSelect; Quotations mixes Input, AppSelect and date controls |
| Products / Add Product | **High** | Normal form 40/44px by token; dropdown triggers previously 36px; compound units intentionally have special shells |
| Parties / Ledger | **High on phone**, moderate desktop | 40px phone search + controls alongside 44px touched selects; actions deliberately compact |
| Warranty | **High** | Nine Inputs, eight FormSelect controls and AppSelect in detailed intake/claim forms |
| Purchases / Purchase Editor | Moderate–high | Purchase listing mixes Input and FormSelect; payment panel and cart have deliberate local sizes; preserve checkout geometry |
| Expenses | Moderate | Three Inputs, four FormSelect controls; form/header differences |
| Reconciliation | Moderate | Four Inputs, two FormSelect and one AppSelect; specialized match workflow |
| Reports / Audit Ledger / Daybook | Lower direct risk | Fewer direct mixed form controls in root modules; nested dialogs still require runtime inspection |
| Accounts / Dashboard / Vendors / Notifications | Lower to moderate | Fewer directly mixed controls; Notifications has inputs and several selectors |
| POS V2 | Protected/special | Bespoke cart, searchable product control, multi-unit numeric steps. Do not globally flatten row heights |

## Adopted control sizing

| Context | Height | Notes |
| --- | --- | --- |
| Ordinary desktop ERP text/search/select/date/numeric fields | **36px** | Central shared default; explicit `h-8`, `h-10`, etc. remain intentional |
| Touch-first standalone form fields | **44px minimum** | Aligned text/select/numeric; excludes compact and cart internals |
| Product editor desktop | **40px** | Existing `--ctl-h` from approved Product form; all field types must share it |
| Product editor phone / coarse pointer | **44px** | Existing approved form contract |
| Party ledger filters on phone | **40px** | Explicit local exception for compact ledger toolbar, all peer controls align |
| Joined amount/unit | One outer shell | 36px standard desktop, 44px touch, Product form's 40/44px token; no internal double border/ring |
| POS, purchase cart, small inline table controls | Explicit original sizes | Do not expand via broad CSS |

**Buttons:** user explicitly reverted the new size hierarchy. All button sizes and variants remain as on `main`. The rejected button-priority PR #197 stays closed; PR #198 contains only input and control sizing/focus work.

## Changes in PR #198

- Shared `Input`: apply h-9 by default and retain caller-provided explicit height utilities.
- Mark intentionally compact 28–32px fields to prevent coarse-pointer min-height from expanding them.
- `NumericInput`: grow standalone outer shell with text/select on touch, not joined fields or POS/cart/compact controls.
- Product form: use existing `--ctl-h` for dropdown/search/date field triggers as well as Input and NumericInput.
- Party ledger: align phone search, dropdown/date and controls to 40px.
- Retain prior focus/validation parity changes: teal border/mint focus, error styling, single focus halo for joined amount/unit.
- Do **not** modify page flow, accounting semantics, data sources, component button sizes or cart density.

## Verification and remaining risk

- Existing: `npm run check:ui-contract`, `npm run test:field-alignment`, `npm run build`.
- New read-only browser audit: `npm run test:field-size-parity` checks **22 routes at 390, 768, and 1440px**, samples the Product editor and classifies each control by its actual height, expected context and explicit exceptions. Export JSON through `FIELD_SIZE_REPORT=/tmp/hisabiq-size-report.json`.
- Required manual validation: desktop/tablet/mobile screenshots for Sales, Finance, Purchases, Product editor, Party ledger, POS, Warranty and Quotations; English / Bangla; light / dark. Include browser text-size changes, focused fields and expanded dropdowns.
- **Not yet tested in a running browser:** the source-only review cannot guarantee pixel-level consistency across every nested modal or responsive state. The browser test has been committed but not run. If it reports exceptions, repair the individual components; do not respond with another blanket 44px rule.

## Prevention

Any newly added Input-like component must declare its context: normal 36px, touch 44px, Product form token, ledger phone 40px or explicitly compact. Do not put a locally styled 32px Input next to a default 36px select unless the row's density calls for it. Reuse existing primitives instead of copying Magic Patterns prototype markup.
