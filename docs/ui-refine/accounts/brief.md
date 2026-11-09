# Accounts UI refinement · 2026-11-06

- **Route:** `#/app/accounts`; vouchers state via existing `?tab=vouchers` tab selection.
- **Source scope:** `src/pages/Accounts.tsx`. Focus the native Accounts Overview and Vouchers views, not the reused `Finance moneyAccountsOnly` or separate Ledger/Trial/Statements components.
- **Reference:** existing approved Daybook/Audit compact row-action pattern, Party Ledger underline tabs, HisabIQ typography and blue/teal tokens. Same UI, better compactness and reach.
- **Owner request:** next module using full `/ui-refine-loop`, **3 rounds** without redesign.
- **C1 / adapt + harden:** On 320–390px phone, voucher date, full reference, amount, status and 36px action button should be reachable at scrollLeft=0. Preserve all columns on wide desktop; no new filters or invented date controls.
- **C2 / distill + layout:** Overview summary, recent entries and four quick accounting choices become compact, readable, aligned and consistently responsive while keeping all values/actions.
- **C3 / clarify + polish:** Clear tab/action focus cues, preserve user preference, actionable voucher detail and keyboard/touch operation; responsive regression verification.
- **Protected:** All 8 internal tab states, URL tab sync, simple/accounting terminology toggle, open balance, export, receipt/payment/transfer/adjustment voucher, duplicate/correct/delete/details/source navigation, review dialogs, date-view setting, postings, trial/balance sheet, Money Accounts, Bank Entry, colors, Bangla helpers, light/dark.
- **Never edit:** accounting projection, persistence, finance posting, auth, POS, inventory, backend, account balances or source data for appearance. No fake posting.
- **Acceptance:** GitHub draft PR; before/after 320/390/768/1024/1440 light/dark; real opened voucher row menu/detail screenshots & browser assertions; TypeScript, ESLint, UI-contract, unit, build, targeted browser and official pinned Impeccable detector; honest C0–C4 ledger and limitations.
- **Execution mode:** Original Workflow and independent model subagents unavailable. Use documented GitHub-only ChatGPT-led protocol with official *mechanical* Impeccable detector, not a claim of upstream independent /40 grades.
- **Release gate:** Leave PR draft; do not merge or deploy without explicit owner approval.
