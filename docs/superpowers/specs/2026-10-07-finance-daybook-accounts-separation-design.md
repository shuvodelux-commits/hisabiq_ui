# HisabIQ Finance, Daybook & Accounts Separation — Design Specification

Date: 2026-10-07  
Status: Approved conversational design; implementation not yet approved  
Scope: UI/UX architecture for `hisabiq_ui`

## 1. Goal

Separate the current combined Finance & Accounts area into three simple modules that match how Bangladeshi SMB users think about their work:

- **Finance · টাকা-পয়সা** — where money is and how it moves.
- **Daybook · দৈনিক লেনদেন** — one place to find and manage all business transactions.
- **Accounts · হিসাব** — bookkeeping, vouchers, ledgers, trial balance and financial statements.

The design must follow HisabIQ's core rule: **Keep It Simple.** Normal users should not need accounting knowledge to operate daily workflows.

## 2. Information architecture

Sidebar order:

1. Dashboard
2. POS / New Sale
3. Sales
4. Warranty
5. Products
6. Parties & Ledger
7. Purchases
8. Expenses
9. **Finance · টাকা-পয়সা**
10. **Daybook · দৈনিক লেনদেন**
11. **Accounts · হিসাব**
12. Reconciliation
13. Reports

The old **Finance & Accounts** combined entry is removed.

### Module ownership

| Module | Owns |
|---|---|
| Sales | Sales, returns, invoice payment workflows |
| Purchases | Purchases, purchase returns, supplier payment workflows |
| Expenses | Expense records |
| Finance | Money accounts, generic receive/pay, transfers, owners, lenders, borrowers, cheques, cash sessions |
| Daybook | Finding, opening and managing existing business transactions |
| Accounts | Accounting representation, vouchers, ledgers and financial statements |
| Reconciliation | Bank/cash statement reconciliation |

Daybook is a control surface, not a second owner of business logic. Every transaction keeps one source of truth.

## 3. Language and terminology

### 3.1 Primary language rule

- Main UI labels use familiar professional English.
- Bangla helper text uses natural, conversational Bangla.
- Do not use difficult textbook Bangla when a plain explanation is clearer.
- Short Bangla helpers appear inline.
- Long explanations use the existing Tooltip component.

Examples:

- **Finance** · টাকা-পয়সা
- **Daybook** · দৈনিক লেনদেন
- **Accounts** · হিসাব
- **Posted by** · কে এন্ট্রি করেছেন
- **Customer Due** · গ্রাহকের কাছ থেকে পাবো
- **Supplier Due** · সাপ্লায়ারকে দিতে হবে
- **Profit & Loss** · কত লাভ বা ক্ষতি হয়েছে

### 3.2 Replace unfamiliar accounting jargon

Keep familiar terms where useful, but replace words ordinary users commonly do not use.

| Avoid as primary UI | Use |
|---|---|
| Drawings | Owner Withdrawal |
| Contra Voucher | Account Transfer |
| Journal Voucher | Adjustment Entry |
| Accounts Receivable | Customer Due in Simple mode |
| Accounts Payable | Supplier Due in Simple mode |
| Narration | Description |
| Particulars | Details |
| Reversal | Undo Transaction / Delete effect internally |
| General Ledger | Ledger where context is clear |

### 3.3 Voucher naming

Keep commonly understood voucher terms:

- **Receipt Voucher**
- **Payment Voucher**

Replace unfamiliar voucher names:

- **Account Transfer** instead of Contra Voucher
- **Adjustment Entry** instead of Journal Voucher

## 4. Per-user terminology mode

Each user can choose their own terminology. Admin cannot lock this choice.

Setting:

- **Simple** · সহজ ব্যবসার ভাষা — default
- **Accounting** · হিসাবরক্ষণের ভাষা

The preference belongs to the user account, not the browser/device.

Changing terminology changes display wording only. It must never change data, permissions, posting rules or calculations.

### Simple mode

Prefer context-aware language:

- Money In
- Money Out
- Received
- Paid
- Customer Due
- Supplier Due
- Owner Withdrawal
- Account Transfer
- Adjustment Entry

### Accounting mode

Expose formal accounting terms where meaningful:

- Debit
- Credit
- Accounts Receivable
- Accounts Payable
- accounting-side balances and posting details

Common operational actions remain familiar in both modes. For example, **Account Transfer** remains Account Transfer even in Accounting mode; accounting details may show Debit/Credit underneath.

### Debit/Credit rule

Do not globally translate Debit to Money In or Credit to Money Out. That mapping is only valid for some account types.

- Finance, Sales, Purchases, Daybook and ordinary workflows use context-aware terms.
- Trial Balance, Ledger and advanced Adjustment Entry may show Debit/Credit.
- Bangla tooltip/helper explains the effect simply for that specific context.

## 5. Finance module

Purpose: answer **"Where is the money and how is it moving?"**

Tabs:

1. Overview
2. Money Accounts
3. Counter
4. Loans & Owners
5. Cheques
6. Cash Sessions

Transfers are available from Counter and Money Account actions instead of requiring a separate full module tab.

### 5.1 Overview

Summary cards:

- Available Money
- Cash
- Bank
- Mobile Banking
- Cheques Awaiting Clearance
- Money We Owe
- Money Others Owe Us

Also show:

- Today's Money In
- Today's Money Out
- Net movement
- Money-account balances
- actionable alerts such as cheque due, bounced cheque, cash shortage, reconciliation needed, loan payment due

### 5.2 Money Accounts · টাকার অ্যাকাউন্ট

Rename the current Finance "Accounts" concept to **Money Accounts** to avoid confusion with the Accounts module.

Supported types:

- Cash
- Petty Cash
- Bank
- Mobile Banking

Mobile banking providers may include:

- bKash
- Nagad
- Rocket
- Upay
- Other

Actions:

- View ledger
- Money in
- Money out
- Transfer
- Reconcile
- Edit
- Deactivate

### 5.3 Counter

Four primary actions:

- Receive
- Pay
- Expense
- Transfer

Examples:

Receive:
- Customer payment
- Loan received
- Owner investment
- Borrower repayment
- Other income

Pay:
- Supplier payment
- Loan repayment
- Owner withdrawal
- Give borrower money
- Other payment

Transfer:
- Cash → Bank
- Bank → bKash
- bKash → Nagad
- Bank → Petty Cash

Internal transfers never create income or expense.

### 5.4 Loans & Owners

Keep Owner, Lender and Borrower balances separate.

Owner:
- capital invested
- owner withdrawal
- owner advance
- repayment to owner

Lender:
- money borrowed
- additional borrowing
- repayment
- current amount to repay

Borrower:
- money given
- repayment received
- current amount to receive

Borrower money is separate from Customer Due.

### 5.5 Cheques

First-class Bangladesh-focused cheque register.

Cheque Received:
- cheque number
- bank
- branch
- account holder
- amount
- received from
- received date
- cheque date
- deposit account
- reference
- attachment
- note

Statuses:
- Received
- Deposited
- Cleared
- Bounced
- Cancelled
- Returned

Cheque Issued statuses:
- Issued
- Presented
- Cleared
- Cancelled
- Stopped
- Returned/Bounced

Post-dated cheques are marked **PDC · পরে জমা দেওয়ার চেক** and can create upcoming alerts.

A received cheque does not increase bank balance until it is cleared.

### 5.6 Cash Sessions

Keep the current cash-session concept:

- Opening cash
- Expected cash
- Counted cash
- Short/over
- Cash in
- Cash out
- User/cashier
- Open/close time
- Notes

A variance is shown clearly but does not automatically create a balancing transaction.

## 6. Daybook module

Purpose: answer **"What business transactions happened?"**

Daybook is the single global transaction list. Finance and Accounts may show small recent-activity sections but must not grow duplicate "all transactions" tables.

Daybook does not create new transactions.

### 6.1 Included transactions

Include business transactions that change at least one of:

- money
- stock value
- customer/supplier balance
- owner/lender/borrower balance
- accounting records

Examples:

- sale
- sale return
- customer payment
- customer refund
- purchase
- purchase return
- supplier payment
- expense
- other income
- generic finance receive/pay
- account transfer
- owner investment
- owner withdrawal
- loan received
- loan repayment
- borrower money given/received
- cheque movement
- financially relevant stock adjustment
- Receipt Voucher
- Payment Voucher
- Adjustment Entry

Do not include general activity such as product edits, warranty status changes, settings changes or draft saves.

### 6.2 Table

Recommended compact columns:

- Date
- Type
- No. / Reference
- Party
- Details
- Account
- **Money In**
- **Money Out**
- Posted by
- Status
- Action

Default date filter: **Today**.

Minimal filters:

- Search
- Date
- Type
- Account
- User
- Status

Quick dates:
- Today
- Yesterday
- This week
- This month
- Custom

### 6.3 Money In / Money Out semantics

These columns show **actual money movement only**.

Credit sale:
- Money In: —
- Money Out: —
- show Due status/helper

Partially paid sale:
- Money In = amount actually received
- unpaid amount remains Due

Credit purchase:
- both money columns blank until payment occurs

Expense paid immediately:
- Money Out = actual paid amount

Return:
- if no refund occurs, both blank
- refund to customer = actual refunded amount under Money Out
- supplier refund received = actual received amount under Money In

### 6.4 Internal transfers

For Cash → DBBL ৳25,000:

- Money In = ৳25,000
- Money Out = ৳25,000
- mark as **Internal Transfer · নিজের অ্যাকাউন্টে টাকা সরানো**

Internal transfers are excluded from Daybook business Money In/Money Out summary totals so they do not appear as income or expense.

### 6.5 Multiple payment methods

A transaction paid through multiple accounts remains **one Daybook row**.

Example:
- Cash ৳8,000
- bKash ৳7,000
- DBBL ৳5,000

Daybook:
- Account: Cash + bKash + DBBL
- Money In: ৳20,000

Opening the transaction shows the payment breakdown.

### 6.6 Posted by and audit display

Daybook shows the real person who performed the business action.

Example:
- Posted by: Rahim

If accounting records were generated automatically, details may also show:
- Accounting posting: System

Do not show System as the main Posted by value when a user caused the transaction.

Open details should show:

- Posted by
- Posted at
- Last edited by
- Last edited at
- Deleted by, if deleted
- Deleted at, if deleted
- Delete reason, if applicable

### 6.7 Actions

Every Daybook row uses the standard `⋯` action pattern.

Primary actions:

- Open
- Edit
- Delete

Contextual secondary actions may include:

- Print
- Duplicate
- Go to source

Do not overload menus with unnecessary actions.

### 6.8 Open

Open shows a consistent transaction-detail surface in Daybook, but reuses source-specific details where needed.

It does not create a second business-rule implementation.

### 6.9 Edit

Edit opens the original module's editor:

- Sale → POS/Sales editor
- Purchase → Purchase editor
- Expense → Expense editor
- Customer/Supplier payment → relevant payment editor
- Transfer → Finance editor
- Receipt/Payment Voucher → Accounts editor
- Adjustment Entry → Accounts editor

After saving, Daybook reflects the updated source transaction.

### 6.10 Delete

The UI says **Delete**.

Internally, posted financial transactions use safe reversal/soft-delete semantics. Never hard-delete posted financial history.

If safe:
- remove/undo effects on money balances
- party balances
- stock
- due status
- accounting postings
- linked derived totals

If dependent activity exists, keep Delete visible but block the action with a clear explanation.

Examples:

- "This sale has a Return. Delete the Return first."
- "This invoice has a Payment. Fix or delete that Payment first."

Deleted transactions are hidden from the normal view but available through:
- Status → Deleted

Deleted rows retain audit information.

### 6.11 Permissions

Daybook has one dedicated permission:

- **View Daybook**

Open/Edit/Delete permission is inherited from the source module.

Examples:

- user can view Sales but cannot edit → Daybook Open only
- user can edit Sales → Daybook Edit available
- user lacks Sales delete permission → Daybook Delete unavailable/disabled according to the common action pattern

Do not create duplicate Daybook Edit/Delete permissions.

## 7. Accounts module

Purpose: answer **"What do the books say?"**

Tabs:

1. Overview
2. Vouchers
3. Ledger
4. Trial Balance
5. Statements
6. Chart of Accounts

Daybook is not inside Accounts.

### 7.1 Overview

Keep simple:

- Profit
- Customer Due / Accounts Receivable according to terminology mode
- Supplier Due / Accounts Payable according to terminology mode
- Assets
- Liabilities

Shortcuts:
- Vouchers
- Ledger
- Trial Balance
- Profit & Loss
- Balance Sheet

### 7.2 Automatic posting

Normal users work in Sales, Purchases, Expenses and Finance. HisabIQ automatically creates accounting effects.

Example cash sale ৳1,000 with COGS ৳700:

- Cash Dr ৳1,000
- Sales Cr ৳1,000
- COGS Dr ৳700
- Inventory Cr ৳700

These accounting lines are not entered manually during normal selling.

### 7.3 Vouchers

User-facing types:

- Receipt Voucher
- Payment Voucher
- Account Transfer
- Adjustment Entry

Normal Receipt/Payment forms stay simple. Advanced accounting details may be progressively disclosed.

### 7.4 Ledger

Choose an account and show:

- Date
- Voucher
- Details
- Debit
- Credit
- Balance

In Simple mode, use friendlier context-specific wording where possible. In inherently accounting reports, Debit/Credit remain available with simple Bangla helpers/tooltips.

### 7.5 Trial Balance

Keep official accounting terms:

- Account
- Debit
- Credit

Bangla helper/tooltip explains simply that this screen checks whether the accounting sides match.

Show:
- Total Debit
- Total Credit
- Balanced / Needs review

### 7.6 Statements

Profit & Loss:
- Income
- Cost of Goods Sold
- Gross Profit
- Expenses
- Net Profit

Balance Sheet:
- Assets
- Liabilities
- Equity
- Assets = Liabilities + Equity validation

### 7.7 Chart of Accounts

Provide a sensible Bangladesh-SMB default chart. Users do not build accounting structure from zero.

Top groups:
- Assets
- Liabilities
- Equity
- Income
- Expenses

Include common accounts for:
- Cash
- Bank
- Mobile Banking
- Customer Due
- Inventory
- Supplier Due
- Loans
- Owner Capital
- Owner Withdrawal
- Sales
- Service Income
- Cost of Goods Sold
- Rent
- Salary
- Electricity
- Transport
- Delivery
- Mobile/Internet
- Repair
- Bank charge
- MFS charge
- Discount
- Miscellaneous expense

Custom accounts remain possible but are not the primary workflow.

## 8. Reconciliation

Reconciliation remains a separate sidebar module.

Finance Money Accounts provide a **Reconcile** action that opens the Reconciliation module with the selected account context.

Do not duplicate bank-statement reconciliation inside Finance or Accounts.

## 9. Permissions and roles

Normal cashier:
- operational Finance actions according to permission
- View Daybook if granted
- no manual Adjustment Entry by default

Manager:
- broader Finance access
- view accounting reports
- common vouchers if permitted

Accountant/Admin:
- Chart of Accounts
- Adjustment Entry
- opening balances
- accounting reports
- accounting terminology mode available, but still a personal preference

Terminology preference is never admin-locked.

## 10. Editing, deletion and audit integrity

Draft records may be edited/deleted normally according to permissions.

Posted financial records:
- use user-facing **Edit** and **Delete**
- preserve audit integrity internally
- corrections/reversals must keep books, balances and stock consistent
- retain who created, edited and deleted the transaction and when

Avoid exposing accounting implementation jargon to ordinary users.

## 11. Opening balances

Provide a guided opening-balance workflow rather than requiring manual journals.

Supported opening values:

- Cash
- Bank
- Mobile Banking
- Customer Due
- Supplier Due
- Inventory
- Loans
- Owner Capital

HisabIQ creates the necessary accounting representation internally.

## 12. VAT / Tax scope

This UI phase may prepare account categories such as:

- VAT Payable
- Input VAT / VAT Receivable
- Tax Payable
- Withholding Tax

Do not claim full Bangladesh/NBR compliance in this phase. Mushak forms, BIN/TIN flows and statutory returns require a separate requirements/design phase.

## 13. UX constraints

- Follow the existing Magic Patterns HisabIQ visual language.
- Use the shared 2px teal `.erp-tab-active` indicator for underline tabs.
- Use existing dialogs, tooltips, tables, action menus and FloatingPanel patterns.
- Keep tables compact.
- Keep numeric values right-aligned.
- Avoid monospaced digits.
- Short Bangla helpers inline; long helpers in tooltips.
- Tooltips must be keyboard accessible and must never contain information required to complete a transaction.
- Do not duplicate source-module business rules inside Daybook.
- Prefer progressive disclosure over exposing accounting complexity by default.

## 14. Implementation slices

Implementation should proceed in dependency order:

1. Navigation and clean module split
2. Shared terminology preference and context-aware labels
3. Finance restructure
4. Daybook unified transaction model and list
5. Daybook Open/Edit/Delete routing and audit presentation
6. Cheque register
7. Accounting data model and posting representation
8. Accounts vouchers and ledger
9. Trial Balance
10. Profit & Loss and Balance Sheet
11. Opening balances and safe correction/reversal flows
12. Full UI/Playwright verification, build, preview and merge

## 15. Acceptance criteria

The design is successful when:

1. A normal user can operate Sales, Purchases, Expenses, Finance and Daybook without understanding Debit/Credit.
2. An accountant can switch their own terminology to Accounting and see formal terms where useful.
3. Daybook can find every business transaction and show the real user who posted it.
4. Daybook Open uses a consistent details experience.
5. Daybook Edit routes to the original module editor.
6. Daybook Delete safely undoes effects and preserves audit history.
7. Credit sales/purchases do not appear as Money In/Out until money actually moves.
8. Partial payments show only actual movement.
9. Internal transfers show both directions on the row but do not inflate business Money In/Out totals.
10. Multiple payment sources remain one Daybook transaction with a breakdown in details.
11. Finance contains money operations, not accounting reports.
12. Accounts contains accounting representation and reports, not a duplicate Daybook.
13. Reconciliation remains a separate specialized module.
14. The same underlying transaction is never copied into independent competing sources of truth.

### End-to-end acceptance scenario

A user sells goods, receives part of the payment through bKash, leaves the remainder due, and later receives the balance through Bank.

Expected:

- Sales owns the invoice.
- Finance balances reflect only actual receipts.
- Daybook shows actual Money In for each real payment and the real user who posted it.
- The unpaid amount appears as Due until paid.
- Accounts receives the correct automatic accounting representation.
- Ledger and Trial Balance remain consistent.
- Profit & Loss reflects revenue and COGS correctly.
- Balance Sheet remains balanced.
- Editing or deleting an eligible source transaction updates all dependent views consistently without hard-deleting audit history.
