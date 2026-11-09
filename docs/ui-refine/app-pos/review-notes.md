# POS review notes

Same HisabIQ POS V2, cleaner details: desktop totals/remove fit, compact phone identity and large amounts, joined quantity readability, keyboard/IME-safe search, field/error associations, language preference, and reduced motion. Existing `Pos`, `CartTable`, `ProductCombobox`, `CheckoutPanel`, `CustomerPicker`, `NumericInput`, `CompoundQuantityInput`, `MultiUnitQuantityInput`, Button/Input/AppSelect/FormSelect/Dialog and review dialog are retained.

Shared exceptions are opt-in: `ProductCombobox.posKeyboardSafety/localizeMetadata`, `CustomerPicker.guardComposition`, `MultiUnitQuantityInput.readableValues`, optional `Dialog.closeLabel`, optional review amount language/close label. Their old defaults remain. `src/index.css` changes target POS/sale cart. Inventory regenerated for Dialog's X import. `.eslintrc.cjs` excludes only pinned upstream super-board runtime after recursive initialization exposed 58 vendor-global baseline errors; it does not waive authored source.

No hooks, installment domain, data store, utility/calculator, settings, navigation or shell source changed. Source callbacks, method/account values, unit keys/conversions, serial/expiry/warranty/stock rules, original invoice/draft/template identity and financial preview disclosures remain. [Independent regression assessment](evidence/regression-review.json) separates source conclusions, recorded tests and fresh reruns.

The owner flagged a mid-image header in an older scrolled full-page large-value capture. Live measurements and the final header/capture guards assert header top=0 before/after checkout scrolling and reset at 320/390/768/1024/1440 in both themes. Original script full-page captures reset nested scrolls; opened/scrolled states use actual viewport images. No shell styling change was made to hide a screenshot artifact.

Remaining P1: supported dense three/four-unit desktop carts still put totals/remove beyond the initial horizontal viewport; routine desktop fit is fixed. P2: the dense selected-unit trigger shows P… instead of a full short symbol. Both remain open after the bounded three rounds.

Remaining P2: two reachable installment collection validation messages (manual allocation and future payment date) still fall back to English in Bangla. This partially improved existing presentation gap remains disclosed; no fourth fix round. Existing missing-product Quick Add debt remains. Unknown external/domain messages preserve their factual source. Physical print, real posting, real device keyboard and exhaustive accessibility/zoom checks remain unverified.

Original EricTechPro/super-board skill revision d0b7d5a6850614ca809477c1af43d5d7da408726; official Impeccable 4.8.0 / engine 0.1.18. Specialized Workflow runner and humanizer unavailable: documented fresh independent-agent fallback and plain prose were used. Round-3 fixer report is explicitly a coordinator reconstruction from saved source/log/capture evidence following the runtime reconnect. It is not a fresh visual assessment.

Selected PNGs are byte-for-byte copies with SHA-256 in [manifest](evidence/screenshot-manifest.json). Eight original-script before/after views show desktop/phone in both themes; supplemental images expose open search, dialogs, joined units, responsive/large/header states. Full evidence matrices list further runtime captures; those are not all committed. Fresh closing design and finish reviews supply visual conclusions separately.

Existing overlapping draft #264 remains untouched and must be reviewed as an alternative, not blindly stacked. The owner requested a single new draft PR for this target; publication is coordinator-owned. No merge/deploy or backend posting is authorized by this review.

Final visual score: **32/40** (16 design +16 audit). [Finish review](evidence/finish-review.json): 13 fixed, 1 partial, no verified new regression. Its broad copy-fixed verdict covers sampled captures; the source audit verifies the allocation/date exceptions, so language coverage is partially fixed overall. Stop after three rounds; no extra fix pass or hidden issue suppression.
