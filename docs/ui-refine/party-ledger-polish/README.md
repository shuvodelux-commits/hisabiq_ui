# Party Ledger polish evidence

Three bounded original ui-refine-loop rounds preserve the existing Party workspace. Tested code `d1de6a9`, base main `de33350`. Independent score progression: **28/40 →29/40 →30/40 →33/40**. Fresh finish review grades13 unique fixes fixed (14 claimed occurrences), no partial/not-fixed or introduced regressions.

**The broad browser suite remains RED:151 passed /2 failed across153 cases.** Both320px Vendor settlement overflow failures reproduce identically on pristine baseline. This draft is ready for human review of the bounded patch, not merge approval or complete browser acceptance.

- [Brief](brief.md): approved scope, component reuse and protected behavior.
- [Ledger](ledger.md): actual rounds, independent scores, interruption recovery and check disposition.
- [Workflow matrix](workflow-coverage.md) and [final coverage](final-coverage.md): tested actions and truthful inherited/unsupported limits.
- [Manifest](evidence-manifest.json): source paths, tested revisions and SHA-256 hashes for curated artifacts.
- `before-*` /`after-*`: original1440px desktop and390px mobile light/dark captures, copied by the pinned original `pr-shots.sh`.
- `states/`:320/390/768/1024 captures, collapsed/expanded filters, actual menus/calendars, dialogs/errors, long money/notes and baseline Vendor failure pairs.
- `output/`: actual statement PDFs and CSV downloads.
- `evidence/reviews/`, `evidence/browser/`, `evidence/checks/`: saved assessments, exact browser reports and command logs.

Fresh code gates pass: TypeScript, authored lint, UI contracts,851 tests, build and guide synchronization. Authored lint excludes only the pinned upstream `vendor/super-board/**`; unchanged default lint reports58 inherited errors. Dedicated dialog accessibility36/36 and layout252/252 supplement the broad result without erasing its failures.

Reproduce the broad run with `PARTY_LEDGER_URL=http://127.0.0.1:4311 PARTY_LEDGER_LABEL=final PARTY_LEDGER_EVIDENCE=/tmp/party-ledger-evidence node scripts/party-ledger-polish-browser.cjs` from the worktree with its preview running. The focused round1/2/3 and dialog-layout browser scripts retain their own environment options and exact saved reports.

Known inherited limits remain: crossing1024px loses financial-dialog drafts; direct existing-source/browserBack loses search; Bangla-digit payment input is rejected by the unchanged parser; some Vendor Receive Money journeys lack a priced memo;1024px identity is cramped. No genuine async loading/network-failure fixture exists. Safe local preview operations do not certify real banking/accounting, APIs or physical devices/assistive technology.

The original skill `d0b7d5a` used its documented fresh-agent fallback because Workflow was unavailable. Impeccable source `e89e3ada`, engine0.1.18; optional humanizer absent. Recovery/isolation caveats are explicit in the ledger and raw review JSON. No merge or deployment.
