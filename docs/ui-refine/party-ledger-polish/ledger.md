# Party Ledger refinement ledger

Target `#/app/parties` / `party-ledger-daybook`; base main `de33350ea48d7d0c1040b0895b227310cbd484a6`; isolated branch `refine/party-ledger-polish`. Final tested code `d1de6a904755604f878d5578d8d63e59ce3728e8`.

Original EricTechPro/super-board `ui-refine-loop` pinned `d0b7d5a6850614ca809477c1af43d5d7da408726`, using its documented fresh-agent fallback because Workflow was unavailable. Independent design and source-detector agents ran separately, followed by checker/fixer and a fresh finish reviewer. Impeccable source `e89e3ada`, engine `0.1.18`; official detector ran clean. Optional humanizer unavailable; plain-language fallback used. System Chromium supplied real browser evidence.

| Check | Design | Audit | Total | Before comparison | Resulting fix |
|---|---:|---:|---:|---|---|
| C1 baseline | 14/20 | 14/20 | 28/40 | baseline | round1 `5407bbf` |
| C2 after round1 | 15/20 | 14/20 | 29/40 | better | round2 `c7e641d` |
| C3 after round2 | 16/20 | 14/20 | 30/40 | better | round3 `d1de6a9` |
| C4 closing | 17/20 | 16/20 | 33/40 | better | bounded three rounds complete |

Scores are the actual isolated reviewers' judgments, summed without checker rescoring. They are not a WCAG, runtime performance or production accounting certificate. Raw assessments, merge decisions and stable IDs are in `evidence/reviews/`.

## Changes and evidence

- Round1: full large-money reflow, directory keyboard access, clearer dark selected counts, duplicate mobile note/opening text removed. Focused recovery browser16/16 and Daybook 12/12.
- Round2: scoped complete statement print flow, tab/panel keyboard semantics, Reset beside type, shared 36px note actions and proportional Party figures. Actual five-page print evidence includes all32 safe UI-created note rows and exact financial totals.
- Round3: stable validation association/focus with domain-summary fallback, translated row-specific split amount names through compatible optional shared attributes, narrow statement summary containment and keyboard comparative-table scrolling. Late narrow financial-dialog overflow repair is part of this same third round. Final dedicated 36/36 and layout 252/252 across320/390, both themes and all three language modes.
- Final broad browser run: **151 passed /2 failed**,153 cases,14 blocked notes. Both failures are inherited320px light/dark Vendor Pay Vendor dialog overflow326px within288px. Pristine baseline reproduces the same dimensions and geometry. Full browser coverage is not green; the draft retains this issue for review.
- All12 actual CSV/PDF statement cases passed. Main before/after1440/390both themes plus curated320/768/1024, open filters/menu/calendar, errors, financial dialogs, real CSV/PDF outputs and manifest are committed alongside this ledger.

## Checks

Fresh final `evidence/checks/round-3-layout-complete/results.txt` records exit 0 for TypeScript, authored lint, UI contracts,851 unit tests, production build and design-guide synchronization. Authored lint excludes only the pinned upstream `vendor/super-board/**` dependency; unchanged default `npm run lint` reports58 inherited errors there. No lint configuration or exception allowlist was changed. Official closing detector returns `[]`, exit 0. Focused scripts and diff whitespace checks pass.

## Honest recovery and evidence limits

Two interrupted sessions were recovered after the user said Continue. First interruption followed round1's production patch/green checks but preceded commit and original after-image inspection; a fresh recovery fixer verified/retested and completed those steps. Second interruption followed the saved independent round3 design/audit but preceded merged checker/production edits; fresh recovery roles completed the saved handoff. No stopped round was falsely counted complete.

The recovered C3 checker disclosed accidentally reading the prior C2 merged summary; C4 design reviewer read prior C3 design plus stable IDs. Current C4 design/detector remained separated, and the detector read no screenshots. Preserve these limits when describing historical independence.

Earlier fullPage overlay captures triggered a transient1px resize and remounted the existing adaptive workspace. Corrected open-state captures use viewport images, document scroll reset and overlay-survival assertions. Raw superseded harness outcomes remain documented separately from genuine product failures.

Remaining inherited limitations: crossing1024px discards open dialog draft through renderer remount; direct existing-invoice/browserBack loses ledger search, while New invoice/Back to party retains it;320px Vendor settlement overflow remains. The final broad run also records Bangla-digit payment-input rejection through the unchanged parser in all three language modes. No genuine async loading/network-error fixture exists in this synchronous preview. Browser-created sample financial operations are local preview only; no real payment, bank/accounting posting, API/database certification or physical device/assistive-technology claim.

Fresh finish review: **14 claimed occurrences /13 unique fixes fixed,0 partial,0 not-fixed,0 introduced regressions**. The proportional-money issue occurs in two round claims and is counted once in the unique total. Reviewer disposition permits review of this bounded patch with inherited limits disclosed; it does not grant full browser acceptance or merge approval. See `evidence/reviews/finish-review.json`.

Stop reason: three requested fix rounds followed by closing check; no fourth round. No merge or deployment authorized.
