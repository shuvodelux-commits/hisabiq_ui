# Party Ledger UI refinement — C0–C4 evidence ledger

**Date:** 2026-11-05  
**PR:** #261  
**Route:** `#/app/parties?id=c1&role=Customer` (verified real preview Customer, no synthetic posting)  
**Scope:** existing desktop and responsive Party Ledger toolbars; shared 36px row-action trigger; sticky row action in desktop/tablet ledger tables; source-correct test changes only.  
**Baseline main:** `63116c69ac31c08968aa0640371a2e031b0a0d15`  
**Final tested UI head:** `10a37538506077704dda8915e59fee27121597d6`

## Evidence

- [Final PR Fast CI 42004775994](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42004775994): **SUCCESS** — TypeScript, ESLint, UI contract, 851 unit tests, Vite production build and Party directory/ledger regression.
- [Final screenshots and focused Playwright 42004776004](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42004776004): **SUCCESS** — `party-ledger-daybook-playwright.log` reports **12/12** scenarios at 320/390/768/820/1024/1440 × light/dark. Assertions cover keyboard Tab order, visible and hidden advanced filters, selection and reset, print statement, 36px triggers, source rows, touch viewport, opening and closing `⋮` action, focus return, sticky action at scrollLeft=0, and Filter/action right-edge alignment on phone and tablet.
- **60 PNGs** (30 baseline and 30 changed): default selected Customer ledger, expanded filter and actual open Action menu at 320/390/768/1024/1440 in light/dark. Artifact `ui-refine-chatgpt-shots-pr-261-42004776004`. Actual 320px light, 768px dark and 1024px light states were inspected; 320 shows Date on its own row, with clearly aligned funnel and row actions; tablet has Search → Date → Filter. Screenshot image evidence is not a temporal animation test.
- **Official pinned Impeccable source detector:** `impeccable-engine 0.1.18`; scope `src/components/parties/PartyLedgerToolbarResponsive.tsx`; exit code **0** and `[]` findings. This is a mechanical static source scan, *not* an independent AI design-review score or proof of full rendered accessibility.
- **Independent subagents:** not executed. This is the GitHub-only ChatGPT-led Impeccable-guided review, not the original Workflow runtime. **Numeric design/audit /40 scores unscored** rather than invented.

## Bounded check/fix progression

| Check | Evidence / source | Observed issue and correction | Review |
|---|---|---|---|
| **C0** | [Baseline screenshots run 42000882182](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42000882182) on `c1fe721f` | P1 `PTY-01`: Date hidden in mobile advanced filters; P2 `PTY-02`: Filter consumes extra mobile space; P1 `PTY-03`: row action not consistently reachable on narrow desktop workspace; P2 `PTY-04`: legacy small horizontal action trigger vs approved 36px vertical menu. | Baseline recorded |
| **C1** | Commits `da2aa67`, `fc1a9df`, `400244b`, `9e6cbd0`, `4d1dd2f` | Adapt/align responsive Search, Date and Filter; preserve exact choice/print/row handlers; reuse shared trigger and pin tablet table actions. Generated icon metadata synchronized. | Source implemented; further tests found issues |
| **C2** | Commits `3920567`, `edf1ea6`, `7dab68b`, `4ca6a1a`, `c8f5c15` | Correct screenshot comparison so BOTH main and PR capture selected customer; remove brittle hidden-duplicate invoice assertion; replace obsolete wide-button test expectations, preserving 36px canonical controls. Intermediate runs failed and were corrected, not claimed green. | Source/unit checks repaired |
| **C3** | Commit `9c84136`, `f6687af`, then `a9df269`, `10a3753`; [final checks 42004775994](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42004775994) + [42004776004](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42004776004) | P1 `PTY-03`: at 1024px main desktop table was missing initial-viewport row action. Sticky right header and cell added. P2 `PTY-05`: 320px Filter right edge at x303 vs row action x291; changed phone-only margin, leaving tablet geometry intact. Added actual bounds check. | **All final regression checks green** |
| **C4** | Tested UI head `10a3753`, official detector `[]`; real image review + 12/12 Playwright | Confirmed fixed `PTY-01` Date always visible, `PTY-02` compact toolbar, `PTY-03` initial-viewport Actions, `PTY-04` reused accessible trigger, `PTY-05` edge alignment. No new P0/P1 found in inspected states. | Closing review complete — draft only |

## Retained functionality and known limits

- Preserved all Party roles and independent Customer/Supplier/Vendor/Lender/Borrower/Owner/Payee balances, supplier-payable vs vendor-receivable separation, debit/credit/closing/running balances, source references, payment/refund/edit/reverse permissions, vendor workspaces, history, print and statement date filtering; no financial state mutations under a UI refinement.
- The 1024px desktop Party profile is naturally dense in a side-by-side workspace; the broader profile/header typography was deliberately not redesigned. At intermediate widths some ledger columns require horizontal scrolling, but sticky `⋮` remains in viewport. This scoped work is **not** evidence of a complete Party module redesign or live backend posting.
- The screenshot artifact includes 320/390/768/1024/1440; the additional 820px case is browser-tested (no screenshot). Only the real selected Customer ledger was visually captured; other roles were protected by existing regression/unit tests rather than an exhaustive separate screenshot matrix.
- PR #261 must remain **draft and unmerged** until the owner explicitly approves this new Party Ledger PR. Documentation-only ledger commits may retrigger checks; substantive UI head evidence is pinned to the passing source SHA above.
