# POS workflow evidence

Source `a510661`. [Structured matrix](evidence/round-3-workflow-matrix.json) contains 96 passed results: six combinations of light/dark and English/Bangla/English + Bangla, 390px touch emulation and reduced motion. Each row below is exercised in all six combinations.

| Action group | Recorded result |
| --- | --- |
| search empty/clear and multiple actual adds | Pass |
| serial required count, scan invalid, connected labels/error, select/remove/use | Pass |
| shortage cancel/Own/Negative/Vendor pending cost, nested quick-add cancel | Pass |
| price/cost eye, keyboard reorder and remove | Pass |
| invoice customer details and quick-add cancel preserve cart | Pass |
| payment methods/accounts, split add/remove/remaining/exact, discount error and due customer | Pass |
| hold/resume preserves products and split amount | Pass |
| review confirmation and receipt preview only | Pass |
| edit source context and display date | Pass |
| duplicate source context and display date | Pass |
| continue-draft context preserves original two-line draft | Pass |
| edit-draft context preserves original two-line draft | Pass |
| duplicate-draft context preserves original two-line draft | Pass |
| delete held preview draft preserves active cart | Pass |
| installment terms, shared adjustment select and callback, schedule invalid/cancel | Pass |
| no runtime errors | Pass |

Companion suites cover genuine supported three/four-unit product creation/addition (not an injected dense fixture), selected-unit conversions, all six cart widths 320/390/768/820/1024/1440, templates/customer preview creation, touch and keyboard reorder/receipt order, installment collection/reversal/reschedule/return/settlement previews, vendor and bundle fulfillment, normal/reduced popup motion. Responsive capture evidence adds portrait/landscape 700×320, 844×390, 768×1024, 1024×768, 1024×1366 and 1366×1024.

Missing-product Quick Add is existing migration debt; the POS picker has no creation action wired. Customer/vendor quick-add cancel paths and parent preservation are tested; do not infer a product Quick Add pass. Sale and finance outcomes are browser previews. No real backend, ledger, stock or bank posting, physical printing or physical touchscreen/IME certification is claimed. Expanded manual installment allocation/date error translation remains P2 (see closing audit).
