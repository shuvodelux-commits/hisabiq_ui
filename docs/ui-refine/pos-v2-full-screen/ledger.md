# POS V2 full-screen — three-round GitHub-only UI refine ledger

**Route:** `#/app/pos` · **Draft PR:** [#264](https://github.com/shuvodelux-commits/hisabiq_ui/pull/264)  
**Baseline main SHA:** `e259a6f50ea9f1b88905618b1d75fb841622d6cf` (Expenses #263 merged)  
**Verified implementation SHA:** `998f13d4cffe39394d1d1b5500ac3ac80dc00c80`  
**Reference:** Existing HisabIQ React POS V2, `docs/ui/transaction-cart-design-contract.md`, `docs/design/taste.md`, responsive POS cart tests. This is **GitHub-only ChatGPT-led** review, **not** the original Workflow's independent-model three-agent runner.

## Source and protected behavior

Approved POS V2, with CartTable, CheckoutPanel, ProductCombobox and transaction handlers unchanged except presentation. Preserve multiline quantity/unit conversion, vendor shortage, serial, expiry, warranty, bundle stock, price in unit, discount, split payments, customer/due safeguards, regular/installment, draft, templates, correction and edit/duplicate, Bangla helpers, keyboard shortcuts and review-only posting. **No backend, accounting, storage, permissions or simulated posting changes.**

## C0–C4 evidence

| Check | Head/commit | Screenshot/CI | Observed issues, bounded refinement and results | Design /20 | Audit /20 | /40 |
|---|---|---|---|---|---|---|
| **C0 — baseline** | `18758f37afac4dff2b1ed34c6e8fc3c59fff64d7` | [Baseline screenshots 42063254816](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42063254816) | At 320px Quick Items occupied several vertical rows. At 768px POS rows were 888px inside a 719px content box, clipping full line totals. Screenshots covered default route; richer states added with scoped test harness afterward. | Unscored | Unscored | Unscored |
| **C1 — adapt/density** | `7d14639a176ca34cebf2aa925abc447cd017c1d6` | PR commit; earlier automatic runs superseded by further commits | Replaced stacked eight Quick Items tiles with accessible keyboard-focusable, swipeable single-row horizontal rail. Kept eight source products and one-tap add handlers. Compact layout makes checkout reachable sooner. | Unscored | Unscored | Unscored |
| **C2 — cart geometry** | `6ab9a807ecc524bbb4ff85f81bfa038eaf26d255`, `525689c3f4b2de5ad5c9802c75d717f12480f5d9`, corrected `998f13d4cffe39394d1d1b5500ac3ac80dc00c80` | [Successful screenshot and browser run 42075082639](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42075082639) | Preserved one-line tablet/cart unit and price editor, changed default 710px grid tracks for visible totals. Failed iterations proved that shrinking grid tracks, `100%` and `100cqw` alone could not override old `min-width`. Computed CSS rule audit found `src/index.css` ~line 909 `:root [data-cart-kind="sale"]` forced `min-width: calc(720px + 168px)` at **every** >=768px viewport. Corrected **at source** to apply only to carts containing `[data-multi-quantity]` (preserves wide 3–4-unit editor's one-row horizontal scrolling) and removed temporary ineffective width hacks. Final at 768px: cart content=719px, row=719px, scrollWidth=719px, full total visible; at 1440px: cart content=763px, row=763px. | Unscored | Unscored | Unscored |
| **C3 — checkout clarity/touch** | `f898c70481a780fa2cbc97c041a6c20a1e2bd25d`, corrected `3704f9d351d39640e59f97c380f1a8484101823b` | Initial PR Fast CI caught overly reduced 26px total and failed; corrected 28px mobile / 29px larger. [Passing CI 42075082405](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42075082405). | Real Dhaka business date replaces stale `06 Oct 2026` on POS invoice header, 36px Clear and Quick Add icon controls, calmer payable hierarchy while satisfying existing 28–30px total text contract. Original due without customer validation, split payments, discounts, review and customer details retained. | Unscored | Unscored | Unscored |
| **C4 — closing verification** | `998f13d4cffe39394d1d1b5500ac3ac80dc00c80` | [PR Fast CI success #42075082405](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42075082405) · [Screenshots & Playwright success #42075082639](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42075082639) | **12/12 focused viewport/theme cases passed:** 320/390/768/820/1024/1440px × light/dark. Browser checked cart total glyph bounds, quick products, keyboard-focusable rail, opened customer details, second payment row, unregistered due blocking checkout and no browser exceptions. Screenshot artifact contains **80 real BEFORE/AFTER PNGs**, default + expanded customer + split payments + open search at 320/390/768/1024/1440 light/dark. Manual actual-image review: 768 light/dark and 1440 light; price/total and checkout visible. Static detector `impeccable-engine 0.1.18` exit 0 `[]`, scope `src/pages/Pos.tsx` only. | Unscored | Unscored | Unscored |

### Actual before/after viewport measurements

From authentic artifact PNG dimensions for [run 42075082639](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42075082639):

| Width | Baseline height | Candidate height | Change |
|---|---:|---:|---:|
| 320px | 2516px | 2035px | **481px less vertical content** |
| 390px | 2120px | 1919px | 201px less |
| 768px | 1788px | 1603px | 185px less; total no longer clipped |
| 1024px | 1673px | 1616px | 57px less |
| 1440px | 1123px | 1122px | Practically unchanged desktop height |

Same heights in light and dark. These are screenshot/image measurements; not invoice posting performance measurements.

### Stable issue ledger and C4 fix grades

| ID | Priority | Issue | C4 verdict |
|---|---|---|---|
| POS-R01 | P1 | At 768px a legacy global `:root ... min-width` rule forced 888px row in 719px cart; totals not initially visible | **Fixed** by scoping inherited minimum only to multi-unit editors; browser proves 719px row + readable Total |
| POS-R02 | P2 | Eight Quick Items stacked vertically on phone, delaying checkout | **Fixed**; one accessible horizontal scroll rail, all original actions preserved |
| POS-R03 | P1 | Checkout font reduction initially broke verified 28–30px total hierarchy | **Fixed** by explicit 28px/29px typography, PR Fast CI passing |
| POS-R04 | P2 | Hardcoded October 2026 POS invoice header date | **Fixed** using business calendar `businessToday()` and `formatDay` |
| POS-R05 | P2 | Clear and Quick Add customer icon control heights inconsistent | **Fixed** at 36px in source; automated touch target checks passed |
| POS-R06 | P2 | On ~719px POS cart, the Product name column is around 95px and truncates long names | **Remaining trade-off**: full product name available as title; preserving one-line quantity/unit/price/total keeps the tablet workflow usable; no new product detail popover introduced |
| POS-R07 | P2 | 3–4-unit tablet cart must remain one line and retain edit/price visibility | **Preserved** through selective min-width and horizontal cart scrolling where a genuinely wide multi-unit editor needs it; no claim that all 3/4-unit inputs fit in 719px without scroll |

### Exact evidence and audit limitations

- [PR Fast CI 42075082405](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42075082405) passed TypeScript, ESLint, UI design contract, unit suite, Vite production build, existing POS fast checkout, focused POS 12-case Playwright and compact phone/tablet cart. New permanent POS-specific cart and 100,000 BDT price regression gates were added after this verified implementation run and must also pass the final test-only/documentation head.
- [Screenshots and official detector 42075082639](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42075082639) passed with `impeccable-exit-code.txt=0`, source scope `src/pages/Pos.tsx`, detector JSON `[]`. **No independent model design checkers** ran; do not interpret detector absence as proof of all-component accessibility or assign /40 points.
- The target screen is preview-only. No live money movement, inventory posting, remote offline sync, production vendor allocation or complete account verification is certified by screenshots.
- **Stop criterion:** three bounded scoped UI passes and an evidence-led closing correction. The observed primary tablet Total issue is fixed, targeted Playwright and current screenshot gates pass. Remaining product-name truncation is P2, documented instead of claiming a flawless outcome.
- **Merge gate:** keep [draft PR #264](https://github.com/shuvodelux-commits/hisabiq_ui/pull/264) unmerged until owner approval and final test-only/doc update checks pass.
