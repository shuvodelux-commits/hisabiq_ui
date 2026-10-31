# Finance and Accounts Navigation Design

**Approved:** 2026-10-31, HisabIQ React UI.

## Intent
Help low-literacy Bangladeshi shopkeepers find money-account management and bookkeeping under a single Accounts module while keeping Finance about money movement. Preserve the original compact cards, business rules, typography, bilingual helpers, working deep links and responsive layouts.

## User-visible information architecture
- Top-level **Counter**: quick receive/pay/expense/transfer and bank entry; no duplicate Counter tab in Finance.
- Top-level **Finance**: Overview, Loans & Owners, Cheques, Cash Sessions; no Money Accounts tab.
- Top-level **Accounts**: Overview, Money Accounts, Vouchers, Ledger, Trial Balance, Statements, Chart of Accounts, Reconciliation, Audit Ledger. Banking entry belongs with Money Accounts as a contextual action, not a permanent primary tab.
- Top-level **Daybook**: keep independent one-click module.
- Money Accounts cards show original Cash/Bank/Mobile account identity, balances, Ledger/Reconcile, action menu, Transfer and Add Account.
- Reconciliation and Audit retain their existing standalone screens, routed under Accounts navigation; do not rebuild those pages.
- Finance and Counter may link to bank entry/reconciliation actions but should not duplicate the Money Accounts workspace.

## Constraints
- React + shadcn styling remains unchanged.
- Route-aware sidebar and in-page tabs share canonical order; preserve legacy Finance tab query deep links via redirects.
- Bank Entry API/session validations and bank account IDs are preserved; preselect matching account safely, fall back if missing.
- Existing preview ledger, opening balance and money account mutations unchanged.
- Do not claim live bank reconciliations; the current reconciliation page is preview-only.
- No database schema or financial posting logic changes; no merge until separately requested.
