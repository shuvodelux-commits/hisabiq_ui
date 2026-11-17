# MOD-006 Money Accounts 320px width correction

Issue: https://github.com/shuvodelux-commits/hisabiq_ui/issues/420

## Source evidence
- Real React → Nest → disposable PostgreSQL16 test found 320px viewport vs 351px document width in connected Money Accounts.
- Four account cards with recorded `openingDate` expanded to 333px; a no-opening card stayed at 271px. Account summary and test login controls fit.
- The connected cards are in `src/pages/Finance.tsx`, within `ConnectedMoneyAccountsRead`. The single-column default grid lacks a zero-minimum explicit track; row content may supply an oversized min-content width.

## Narrow approved continuation
Owner said **“merged and continue”**, following prior P2-C test dispatch. Correct only the connected read-only account-card responsive layout. Existing preview UI, finance routes, original handlers, colors, texts, account types, signed loan amounts, journal, disabled financial actions and bilingual meanings must remain intact.

Allowed changed paths: this brief, `src/pages/Finance.tsx` in the connected Money Accounts portion **only**, and a new `tests/mod006MoneyAccount320Responsive.test.ts` source safety guard. Branch `fix/mod006-money-account-320-overflow-420` based on `main@ef4e040f14322a3af5aa86a2c31feb71d5b97521`. Existing QA branches PR #421 and backend PR #49 remain separate and unmerged; no direct editing/merging of those test branches without checking their status.

## Verification
- Reuse real test-only P2-C browser harness; run against fresh disposable PG16 + Nest after changes. No mocked account HTTP success in live acceptance.
- Measure 320, 390, 768, 1440 px, both themes and Bangla/English, with a recorded opening date and a missing one. Validate no horizontal document overflow; preserve all card actions and accessible descriptions.
- Focused safety test and full repo unit, TypeScript, lint, UI contract, Vite build, exact-head CI, independent review. Do not accept #412 until all live browser gates succeed.

## Explicit blocked effects
Never change `App.tsx`, `ConnectedWorkspaceGate.tsx`, cash session, posting handlers, backend, schema/migrations or permissions; no production finances or retained database manipulation. Keep the candidate fix isolated, with draft PR and source checks before merge.
