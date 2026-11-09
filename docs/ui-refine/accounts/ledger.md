# Accounts UI refinement — C0 to C4 evidence ledger

**Target:** `#/app/accounts` · `src/pages/Accounts.tsx` · 2026-11-06  
**Branch:** `refine/accounts-compact-github-20261106` · **PR:** [#266](https://github.com/shuvodelux-commits/hisabiq_ui/pull/266) (DRAFT; never auto-merge).  
**Execution:** GitHub-only ChatGPT-led three bounded source-edit passes; original Workflow/independent model agents unavailable. The pinned official Impeccable *mechanical source detector* is part of the screenshot job and is not an independent AI critique. **No independently validated /20 or /40 visual grade is claimed.** The connector reports screenshot artifacts but does not expose their pixels for direct visual judgment here.

## Checks, risks and changes

| Check | Source stage | Evidenced observation | Status |
| --- | --- | --- | --- |
| C0 | `735f68c432` | [Baseline screenshot + official detector workflow #42163794657](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42163794657); declared Accounts route and code inspected | Screenshot workflow SUCCESS, no model visual score |
| C1 | `db1159617d` | `ACC-01` responsive mobile voucher identity, full reference, date/type, amount/status and shared 36px sticky-right row action; existing detail callback retained | Source committed. Intermediate workflow runs canceled by later pushes; **not independently accepted at this SHA** |
| C2 | `0f2badacff` | `ACC-02` compact overview cards, recent entries open original detail dialog, more efficient quick-action controls | Source committed. Intermediate workflow runs canceled by later pushes |
| C3 | `15b5d59a7d` and follow-up fixes | `ACC-03` underline-tab keyboard focus, English-only tab labels; code, CI contract and generated icon source inventory corrected; Playwright checks introduced | Source committed. Earlier Fast CI uncovered tab test regression; corrected on subsequent source heads |
| C4 | `3aa65bab6c` (final verified application+test revision) | [Screenshot + official detector workflow #42167571730](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42167571730); [Fast CI workflow #42167571552](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42167571552) | Both workflows **SUCCESS**. TypeScript, ESLint, UI contract, 851/851 unit tests, Vite build, navigation and Accounts browser **10/10** light/dark journeys; 40 real interaction PNGs uploaded |

## Issue ledger (stable IDs)

| ID | Priority | Type / Impeccable approach | Source and result |
| --- | --- | --- | --- |
| ACC-01 | P1 | responsive / adapt → harden → polish | Source risk from original 8-column wide voucher list and far-right action on narrow phones. Introduced 3-column compact view (<1024px), full transaction reference, amount and accessible pinned action; 320/390/768 light/dark browser geometry **passed** |
| ACC-02 | P2 | spacing-hierarchy / distill → layout → polish | KPI spacing, recent entry density and quick-actions compacted while keeping all figures and commands; recent rows now open the existing details dialog |
| ACC-03 | P1 | accessibility / harden → polish | Added ArrowLeft/Right, Home/End and focus styling to English-only underline tabs; early browser runs exposed a test expecting Vouchers after one arrow instead of two (intervening Money Accounts tab); corrected to test actual sequence. Final keyboard-focus checks **passed** |
| ACC-04 | P2 | drift / extract → polish | Replaced page-local ellipsis action with approved shared `ActionMenuTrigger`. Re-synced generated design inventory; existing `FloatingPanel` and item callback retained |

## Proof and limitations

- The Actions screenshot workflow compares main vs PR at **320, 390, 768, 1024 and 1440px**, light/dark, and runs the pinned source detector. Successful workflow ≠ independent screenshot inspection or exhaustive accessibility certification.
- The targeted `scripts/accounts-refine-browser.cjs` exercises **10 viewport/theme journeys** and attempts **40 actual UI-state screenshots**: overview, vouchers, opened menu and opened voucher detail. Final [Fast CI #42167571552](https://github.com/shuvodelux-commits/hisabiq_ui/actions/runs/42167571552) **SUCCESS**: 10/10 viewport/theme journeys and 40 authentic PNGs uploaded in artifact `accounts-refine-704533dd26b81a18b597327210fbcd8da8511c32`. Early failures reflected the incorrect one-arrow expectation and then a genuine 320px amount/action overlap fixed with mobile table sizing; desktop amount visibility is verified after table scroll.
- Source/editor changes are scoped to Accounts. Ancillary files: focused browser test; PR CI registration; generated icon inventory; `docs/design/taste.md`; this brief and ledger.
- **No backend/accounting projection, source transaction amounts, opening balance logic, posting, authentication, inventory, persistence, deployment or business data changed.** Existing UI data is preview/sample-backed; do not represent interactions as production posting.
- **Stop reason:** Three bounded code passes plus C4 closing source/CI review completed. Both final GitHub Actions workflows passed at source SHA `3aa65bab6c`. **Independent visual verdict and /40 scores remain unscored** because the chat cannot directly inspect artifact pixels or run separate model agents. **Do not merge until owner visual review and explicit approval.**

> This ledger intentionally records CI failures/cancellations, source-only changes and unavailable independent reviewer capabilities. Do not upgrade any check to “passed” or any fix to “fixed” without real evidence.
