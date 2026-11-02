# HisabIQ Expenses · GitHub-only Impeccable three-round pilot

## Scope
- Route: `#/app/expenses`
- Primary source: `src/pages/Expenses.tsx`
- Existing dialogs, parties, stores, shared styles, Table, Button, FormSelect and design tokens remain authoritative.
- Base: setup PR #242 at `f4ce8744c22df506a0d46f6fccc399596cc2cf3d`. This avoids merging an unapproved infrastructure PR to main.

## Owner direction
Improve existing Expenses page in the original HisabIQ compact blue ERP; prioritize real visual defects at desktop/tablet/mobile, touch and keyboard, light/dark, Bangla compatibility, and actions. **Do not redesign** or alter financial/accounting, source, auth, preview store semantics, export or reporting logic.

## Evidence and acceptance gates
1. C0: inspect 320/390/768/1024/1440 light/dark screenshots + independently executed Impeccable source-detector artifact from GitHub's automatic PR workflow.
2. C1–C3: typed P0–P3 findings, route Impeccable methods, `polish` last, one scoped source commit per round, pass PR CI + relevant Expenses Playwright interaction suites, inspect fresh screenshots and compare to C0.
3. C4: final independent-style review of evidence, grades `fixed`/`partial`/`not-fixed`; disclose unavailable independent AI agent runtimes, authentic screenshot coverage, stop reason and remaining defects.
4. Never fabricate scores, screenshots, test results or post-backed mutations. Keep draft PR; owner approval required before merge or deploy.

## Preview data
Use existing repository demonstration data only; browser session edits are **not real backend posting**.
