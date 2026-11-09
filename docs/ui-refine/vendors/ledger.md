# Vendors UI refinement — C0–C4 ledger

**Target:** `#/app/vendors`; `src/pages/Vendors.tsx`, `src/components/vendor/{VendorDirectory,VendorTabs}.tsx`. **Draft PR:** [#268](https://github.com/shuvodelux-commits/hisabiq_ui/pull/268). Three bounded GitHub-only source-edit rounds; the original independent Workflow and fresh reviewer agents were unavailable, so no independent /40 design score is claimed.

| Stage | Issue | Finding / correction | Verification |
| --- | --- | --- | --- |
| C0 baseline | VEN-01 P1 | Vendor search has no clear button; 32px desktop input breaks 36px standard; no filter recovery from empty results | Source inspected on main; main-vs-PR screenshot workflow in draft PR |
| C1 adapt/distill | VEN-01 P1 | Search standardized to 36px, explicit accessible X clear; empty-result filter recovery, tighter directory rows and chips | Source committed `bc8a3f3e1d`; focused browser regression added |
| C2 layout/polish | VEN-02 P2 | Vendor balance cards, avatar and quick actions occupy excessive vertical space | Tightened header/cards/actions, kept all due/receivable and unpriced semantics, preserved mobile More actions; `e05a8fd142` |
| C3 polish/harden | VEN-03 P2 | Vendor picker and desktop sidebar spacing could be tighter while retaining the same split layout | Responsive width/spacing refinement, preserve existing selection/deep links; `22da9a86e2` |
| C4 closing | VEN-01–03 | GitHub CI, official pinned Impeccable mechanical scan, main-vs-PR screenshot matrix, focused existing vendor route/layout and new search/filter browser checks | **Pending final workflow evidence at initial ledger creation.** No unverified scores or green claims. |

**Protected behavior:** vendor goods Taken/Given, pricing, unpriced memos, payable/receivable, purchase invoices, settlement, payment, ledger, corrections, unsaved-change confirmation, search/filter/selection, and preview-only posting. No backend, accounting or inventory changes.

**Test plan:** TypeScript, ESLint, UI contract, full unit suite, production build; existing Vendor module and responsive Party-style layout browser tests plus new 320/390/768/1024/1440 × light/dark search/clear/filter test. Screenshot workflow captures main vs PR; official Impeccable source detector is *not* an independent visual critique. Actual PNG pixels not directly available for inspection in this connector; owner must inspect and approve. **No merge or deployment.**
