# POS checks

Reviewed source: `a510661b84f638e281a12ad73989c59bde08eb0b`; baseline: `de33350ea48d7d0c1040b0895b227310cbd484a6`. Evidence-only commits do not change the tested application source.

| Required gate | Recorded round 3 result | Evidence |
| --- | --- | --- |
| `npx tsc --noEmit` | Pass | [types](evidence/round-3-types.log) |
| `npm run lint` | Pass; 0 errors, 248 existing warnings | [lint](evidence/round-3-lint.log) |
| `npm run check:ui-contract` | Pass; includes guide sync | [contract](evidence/round-3-contract.log) |
| `CI=1 npm test` | 851 passed, 0 failed/skipped | [unit tests](evidence/round-3-tests.log) |
| `npm run build` | Pass; existing large-chunk warning | [build](evidence/round-3-build.log) |

[Fourteen browser suites](evidence/round-3-browser-results.json) record exit 0 at the source freeze: keyboard, price visibility, responsive cart, layout/units, fast counter, customers/templates, reorder/receipt order, expanded POS workflows, installment POS/payment/lifecycle, vendor, bundle, product combobox motion. [Final capture rerun](evidence/round-3-final-evidence.json) records all seven capture commands exit 0 and source a510661. The recorded full gate set was verified from saved logs, not independently rerun by the final regression reviewer.

Fresh independent keyboard rerun also passed using system Chromium. Fresh independent expanded workflow rerun passed all 96 journeys across six theme/language combinations. Its result is recorded in [regression review](evidence/regression-review.json). Initial sandbox launch errors occurred before browser execution; approved execution outside that sandbox resolves them.

Official Impeccable 4.8.0 / engine 0.1.18 ran. C4 detector exit 2 contains three approved Geist-font false positives, zero verified detector defects. Detector output is not a WCAG certificate. See [closing audit](evidence/c4-audit.json).
