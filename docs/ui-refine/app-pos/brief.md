# POS V2 refinement

Route: `#/app/pos`. Base: `de33350ea48d7d0c1040b0895b227310cbd484a6`.

Preserve the approved compact HisabIQ POS V2, blue/teal tokens, universal radius, 36px ordinary controls, 48px terminal CTA, bilingual typography and every business workflow. Same interface, cleaner details. No backend, accounting, stock, data model, Settings, Tenant Management, Reports, navigation or unrelated changes.

Reuse `Pos`, `CartTable`, `ProductCombobox`, `CheckoutPanel`, `CustomerPicker`, `NumericInput`, `CompoundQuantityInput`, `MultiUnitQuantityInput`, Button, Input, AppSelect and existing dialogs. Scope: POS presentation, narrowly scoped POS CSS, and focused browser regression. Shared changes require opt-in preserving existing consumers.

Priorities: readable keyboard/touch product search and popup placement; aligned compact cart with complete prices and totals; one joined horizontal 2–4 unit field with existing short symbols; clear customer/payment/due/action hierarchy; fully readable large BDT values; phone/tablet/desktop and theme parity; focus, validation and English/Bangla.

Protected: Enter product → quantity → search; conversions and selected-unit prices; shortage/serial/warranty/expiry; reorder/print order; draft/edit/duplicate; customers; split payments; returns/due; invoice calculators and state/navigation.

C0 visible defect: desktop cart columns exceed their container, clipping totals/remove until horizontal scroll. Reviewers will rank remaining pixel/source defects independently.

Execution: original EricTechPro/super-board ui-refine-loop pinned at d0b7d5a; official Impeccable 4.8.0 engine. No specialized Workflow tool: documented fresh-agent fallback (independent design reviewer + detector, then checker, then fixer); three bounded fix rounds with closing check and fresh finish/regression review, subject to original stop rules. No humanizer installed: plain prose fallback. System Chromium `/usr/bin/chromium` verified via Playwright; original shooting script receives a temporary launch adapter, with no screenshot fabrication.

Evidence: original script round-0/round-1/round-2/round-3 at 1440/390 in both themes, section crops/comparison sheets; actual open search and layout checks at 320/390/768/820/1024/1440, portrait/landscape, all three language preferences, reduced motion/touch, large amounts, keyboard flow and supported real preview data. No fabricated sign-in/dense fixture.

Gates each round: TypeScript, lint, UI contract/design guide sync, unit tests, production build, focused Playwright interactions. Unsafe/failing changes revert. Final independent visual and regression review; one draft PR with actual screenshots, scores, checks and remaining issues. Never merge/deploy.

## Owner scope clarification during the run

Review every POS-owned subsection and dropdown; cover multiple product additions and a genuine three-unit product added through supported UI. The workflow matrix must name tested actions and remaining limitations. Preserve all earlier business/scope restrictions; this does not authorize backend or accounting changes.

Every screenshot must verify HisabIQ logo/top-bar position. The owner marked a mid-document header in a scrolled full-page large-value capture. Live probe at 320/390/768/1024/1440 in both themes measured header top=0 initially, after checkout scroll and after reset. Fix capture scroll handling, retain actual viewport images for opened/scrolled interaction states, and assert the header remains at viewport top. Change shell presentation only if a live defect reproduces; do not restyle navigation to correct a capture artifact. Actual metadata: `header-position.json` in run evidence.
