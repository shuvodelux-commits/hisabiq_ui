# Source-safe Delete action coverage

Task 2 of the approved [recovery/delete/cash plan](../superpowers/plans/2026-11-10-recycle-delete-cash-session.md). This is an in-memory UI preview. Reload resets stores; no server authorization, durable audit, ledger posting, refund or stock reversal is claimed.

All additions compose `ActionMenuItem`, `RowActionMenu`/`FloatingPanel`, `Dialog`, `Input` and existing source review components. Disabled Delete reasons are text in the open menu, with `aria-describedby`, rather than tooltip-only instructions. Source review confirmations resolve current tenant/active actor/module authority again. Existing recovery adapters and their historical-use guards remain authoritative.

| Actual surface / action | Delete outcome and source owner | Preserved alternative / limit |
| --- | --- | --- |
| Sales invoice desktop/mobile actions (`Sales`) | Disabled: invoice store has no audited original sale reversal command | Return items, payment, edit, print remain. Never connect display invoice number to unrelated Audit Ledger sample |
| Sales return action menu | Disabled: reversal needs linked credit/refund and stock review, no owning command | View/print and start another return |
| Sales customer credit menu | Disabled derived balance; no credit row deletion | Apply/refund through source workflows |
| Sales/POS drafts/templates | Existing Task 1 adapter → same recovery service | Original identities; Undo and restore use same authority/eligibility guards |
| Purchases bill menu | Disabled: no purchase cancellation command; allocations, returns and lots require joint reversal | Existing source correction, payment, return and source history |
| Purchase return history (`Purchases`) | Disabled: no return reversal command for stock + supplier credit/refund allocations | History remains immutable; no financial display-row removal |
| Purchase drafts | Existing Task 1 recovery command | Posting consumption remains separate from deletion |
| Expenses row Delete / Cancel | Same original expense cancellation review and reason field | Retains original source/amounts, cancellation audit actor/reason, rejects stale review; totals exclude cancelled source. No refund/backend posting |
| Expense category menu | Disabled: setup recovery deferred | Edit and deactivate retained |
| Expense payee menu | Task 1 party adapter only if full cross-role history permits | Used/sample identities blocked with reason; deactivate retained |
| Finance transaction Delete / Review reversal | Same original transaction review; required reason and atomic `reverseFinancePreview` command | Current tenant/active actor/money grant, exact revision, original account identities/payment total; original source plus reversal metadata retained, one observable notification, repeat reversal rejected. Transfer-type rows require owning transfer review |
| Finance transfer Delete / Review reversal | Same original transfer review; required reason and current authority; both original accounts must resolve | Keeps source and actor/reason/time; reverses local account effects only. Transfers remain existing page-local preview state |
| Finance accounts | Disabled setup recovery | Edit, ledger, money in/out, transfer, deactivate |
| Finance cheques | Disabled; no source-safe delete, cheque lifecycle retained | Existing eligible cheque edit/lifecycle correction |
| Finance cash session history | Disabled immutable history | View/reconcile; Task 3 session implementation is separate |
| Accounts vouchers menu / voucher detail | Original active manual voucher → whole-source impact/reason review | Complete local balanced posting excluded from projections, source/amounts/reason/current actor retained. Nonmanual source rows blocked; never delete one debit/credit side |
| Accounts chart of accounts | Disabled setup recovery | Edit/deactivate; no setup permanent deletion |
| Accounts ledger row details | Disabled derived-row Delete | Ledger details/print; no independently deleted debit/credit projection |
| Audit Ledger original sample source menu/details | Existing full-source `validateDelete` / `applyDelete`, reason/impact and current actor/module check | Linked returns block sale reversal; explicitly local sample sources, disconnected from invoice/purchase stores. Audit timeline events have no mutation action |
| Daybook row Delete | Disabled: no verified original command | Existing source viewing; reference-only sample Audit delete route removed, including detail-review fallback |
| Party ledger (`PartyLedgerRowActions`) | Existing verified `party-payment:`, `party-refund:`, `party-finance:` identities → owning reasoned reversal | Current source-role module authority, original source guards/audit actor; all unsupported/legacy/return/credit/opening/vendor projection rows show disabled Delete explanation. Finance retains Reverse vocabulary too |
| Parties master / notes | Task 1 recovery adapter | All-role history/dependency eligibility retained; notes restore to same party |
| Vendor selected memo (`VendorSourceWorkspace`) | Delete → existing `VendorCorrectionDialog` in Reverse source mode | Real source/event identity, current purchases authority/actor, existing dependency/settlement/pricing blockers and impact/reason review; no independent ledger balance removal |
| Vendor desktop ledger event actions | Delete → same owning event reversal review, current actor retained | Reversal events disabled immutable. Mobile existing Review opens same owning review; no mobile-specific projection mutation |
| Products/services/bundles master | Task 1 eligibility and recovery adapters | Used/history/incomplete-history blocks deletion, deactivation retained |
| Product categories/brands/units (`ProductSettings`) | Disabled setup recovery, including unused setup | Removed old permanent removal callbacks; edit/deactivate retained |
| Product stock history (`ProductInventoryViews`) | Disabled: derived movement has no original stock source reversal command | Quantity/balance/history unchanged; stock adjustment remains an explicit new operation |
| Stock lots view | No destructive row menu exists; no lot deletion introduced | Read-only lot history and existing stock adjustment flow; source command absent |
| Online draft orders | Task 1 recovery adapter | Draft identity/lifecycle preserved |
| Online progressed order desktop/mobile/detail actions | Disabled: progressed lifecycle requires cancellation/return; no source delete | Existing stage transitions, courier/COD flows retained |
| Quotations detail action menu | Draft → existing Task 1 recovery confirmation; published/accepted/progressed blocked | Lifecycle history retained; list View leads to same contextual detail |
| Warranty row menu | Disabled: stock/service history lacks safe delete command | Existing rejection/stage/replacement lifecycle retained |
| Reconciliation completed-history row menu | Disabled immutable history | Details; new correction operation required |
| Reports / trial balance / statements | No destructive record menu exists; no projection mutation added | Existing source drilldowns/print/export remain; source-specific Delete belongs to owning surface above |

## Permission and preview boundaries

Source authority uses the existing settings/team grants: sales, purchases, business (party master), and money (expense, finance, accounting). It does not invent an employee-wide financial delete permission. Current actor is re-read on confirmation, and tenant must match these `t1` preview source stores. Existing legacy domain commands remain callable by other pre-existing preview paths; these UI guards are not server enforcement.

Finance transactions are shared with Counter and reverse atomically through the existing finance store. Transfer history remains the existing page-local model; this slice does not introduce a second transfer or accounting store. Vendor uses its original correction engine, including original source/event IDs and linked settlement/price checks. Audit Ledger is an isolated sample ledger; matching references do not resolve actual operational sources.

Working shared action specimen: Brand Guide → component library → overlays → Source delete specimen. It exercises owning review, disabled projection/setup and immutable reasons using the actual shared controls.
