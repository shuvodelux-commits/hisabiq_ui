# Cash-session policy and backend extension plan

**Revision 2 — owner clarification, 2026-11-11.** This document supersedes earlier blanket wording about requiring an active session for a financial transaction. It records product requirements and a proposed backend design; it does not authorize implementation, migrations or merge.

## Confirmed requirement

A historical opening is the amount already owed or owned when a business starts keeping records in HisabIQ. Entering that balance does not mean cash moved now. Opening customer/supplier/vendor balances and opening lender/borrower principal therefore do **not** require an active cash session. An ordinary current transaction that actually receives or pays session-tracked cash requires an active eligible session when the tenant's cash-session feature is ON. When the feature is OFF, those ordinary cash transactions remain possible without a session. Their normal accounting, permissions, source linkage and audit still apply.

Opening lender/borrower support is required backend work; the current partyRoleSchema does not implement those finance relationships. It must not be presented as existing merely because this policy is confirmed. Existing customer/supplier openings already use a session-free Opening Equity posting.

**Implementation scope assumption:** retain the backend's existing designated-drawer scope (`account.isDrawer`). Bank/MFS-only transactions and non-drawer accounts do not become session-gated merely because a journal is posted. A transfer touching the tracked drawer is gated. Multiple independently tracked drawers are a separate future capability; do not silently turn the current single-drawer service into a tenant-wide bank-payment lock.

## Transaction classification matrix

| Business action | Accounting meaning | Session ON | Session OFF | Authoritative path |
|---|---|---|---|---|
| Opening customer receivable | Existing customer debt; AR versus Opening Equity | No session | No session | ManagePartiesService.setOpening/createWithin |
| Opening customer advance | Existing customer credit; Customer Advance versus Opening Equity | No session | No session | Existing party opening writer |
| Opening supplier payable/advance | Existing trade balance versus Opening Equity | No session | No session | Existing party opening writer |
| Opening vendor balance | Existing vendor relationship balance, not a new payment | No session | No session | Existing supported directions; additional UI directions need explicit adaptation |
| Opening lender balance | Principal already owed to lender; loan liability versus Opening Equity | No session | No session | Proposed finance relationship opening service |
| Opening borrower balance | Principal already owed by borrower; loan receivable versus Opening Equity | No session | No session | Proposed finance relationship opening service |
| Correct a historical party/loan opening, with no cash settlement | Reverse/repost opening balance only | No session | No session | Owning opening correction, version and audit |
| Opening stock, stock count or non-cash stock adjustment | Inventory/value correction without a cash payment | No session | No session | Inventory owning service |
| Credit sale with no payment | Revenue/receivable and stock; no cash received | No session | No session | CreateSaleService |
| Unpaid purchase | Inventory/payable; no cash paid | No session | No session | CreatePurchaseService |
| Unpaid expense | Expense/payable; no cash paid | No session | No session | Proposed accrued-expense writer |
| Quotation, draft, schedule edit, notes or master-data edit | No actual cash movement | No session | No session | Owning non-cash action |
| Cash sale / customer receipt / cash installment collection | Actual cash enters tracked drawer | Eligible OPEN session required | Allowed, no session link | Existing receipt/sale writer with shared policy |
| Cash purchase/supplier payment/expense payment | Actual cash leaves tracked drawer | Eligible OPEN session required | Allowed, no session link | Existing/extended owning writer |
| New cash loan received / loan repayment / money lent / borrower collection | Actual cash movement, regardless of Lender/Borrower label | Eligible OPEN session required | Allowed, no session link | Finance movement/settlement writer |
| Cash refund, vendor payment/receipt or warranty cash recovery | Actual cash movement | Eligible OPEN session required | Allowed, no session link | Return/vendor/warranty source writer |
| Transfer Cash↔Bank/MFS or cash owner injection/withdrawal | Actual tracked cash movement | Eligible OPEN session required | Allowed, no session link | CashMovementService |
| Bank↔Bank/MFS, bank-only sale/payment or loan settlement | Actual money movement outside tracked drawer | No cash session | No cash session | Source writer; account permissions still apply |
| Split payment containing cash plus Bank/MFS | Each leg has its own account; one atomic business operation | Cash leg requires eligible session; whole action rolls back if absent | All legs allowed; cash leg has null sessionId | One composed owning transaction |
| Start/count/close/reopen cash session | Drawer lifecycle | Existing lifecycle rules | Cannot create a live session while feature is OFF | CashSessionService |

A transaction's business date being old does not make it an opening. A backdated receipt/payment remains an actual receipt/payment and cannot bypass the policy by sending `historical:true`. An opening record has a dedicated source type, counterpart and correction path; an ordinary receipt cannot be disguised as an opening from the POS or payment DTO.

## Source evidence and current gaps

- `packages/core-domain/src/parties/opening-balance.ts::openingBalancePosting`: customer receivable uses AR; customer payable Customer Advance; supplier receivable Supplier Advance; supplier payable AP; counterpart Opening Equity. There is no cash account or cash session in that posting.
- `packages/core-application/src/parties/manage-parties-service.ts::setOpening`, `correctOpening`, private `postOpening`: reuse existing permission, period, idempotency, version, journal/audit/outbox behavior. Do not add a cash-session check here.
- `money/manage-accounts-service.ts::postOpening` already distinguishes account opening from movement and credits LOAN liability for a historical loan. This does not supply a complete borrower relationship UI/backend contract.
- `purchasing/payment-account.ts::resolvePaymentAccount`: non-drawer account returns null sessionId; designated drawer currently demands an open session without checking feature OFF.
- `money/cash-movement-service.ts`: record/correct/void checks need policy alignment. Its `assertDrawerOpenFor` currently treats a CASH prefix as sufficient; resolve the actual account's isDrawer status rather than assuming every cash account is the tracked drawer.
- `corrections/change-transaction-date-service.ts`: retain the original session/date linkage rules. Switching feature OFF is not permission to rewrite a counted historical session.
- Open backend PR16 adds `SettingsRepository.lockTenant` and setting-history safeguards, but is unmerged at SHA913fedc7e9919cce72a81af5a2131ff3a05fad96. It does not fix ordinary OFF-mode payment paths. Frontend PR282 is also unmerged. Both were rechecked during this revision.

## Proposed backend policy boundary

**CREATE:** `packages/core-application/src/money/cash-session-policy.ts`, exported through the existing application index. This is one cohesive business policy, not a generic transaction framework. No new npm dependency.

```ts
// PROPOSED; transport clients do not submit this internal input directly.
export type CashSessionEffect =
  | { kind: 'NO_CURRENT_CASH_MOVEMENT' }
  | { kind: 'CURRENT_MONEY_MOVEMENT'; accountIds: readonly string[];
      postingBusinessDate: string };

export type CashSessionResolution = {
  sessionId: string | null;
  effectiveMode: 'ON' | 'OFF' | 'NOT_APPLICABLE';
};

export class CashSessionPolicy {
  // Existing SettingsRepository + MoneyRepository + Clock are constructor dependencies.
  resolve(tx: Tx, ctx: TenantContext,
    effect: CashSessionEffect): Promise<CashSessionResolution>;
}
```

An owning server service chooses the effect from its command and validated accounts. There is **no** public bypass field. Historical opening services remain session-free and must not unnecessarily call the cash policy. The NO_CURRENT_CASH_MOVEMENT branch exists for mixed owning flows whose validated payment list is empty; it is not a replacement for source-specific opening validation.

Algorithm for actual money movements:

1. Validate permission/source/account ownership under the owning UOW. Determine real involved accounts from repository rows, never account labels or caller flags.
2. If no involved account is the designated drawer, return NOT_APPLICABLE and null; do not require or fabricate a session for Bank/MFS.
3. Acquire the same transaction-scoped tenant lock used for cash-setting transitions and Start/Reopen. Use the approved `SettingsRepository.lockTenant` implementation once its PR is accepted; until then the task depends on a separately reviewed lock contract. Do not add a competing lock.
4. Re-read account state/isDrawer and effective cash_session_enabled **after** the lock, using existing `effectiveSettings`/`isFeatureOn`; this closes the read-before-lock race with drawer/profile/settings changes.
5. OFF: return null sessionId, effectiveMode OFF. Continue ordinary account/period/balance validation and journal posting. Do not attach the payment to an older or future session.
6. ON: resolve the eligible open drawer session. Require its business date to match the posting cash date. If absent/wrong day, throw existing VALIDATION_FAILED with details.reason CASH_DAY_NOT_STARTED so the UI can open its existing Start Cash dialog without losing the draft.
7. The owning UOW posts all validated money legs, documents and allocations, audit/outbox and idempotency response together. The policy never writes journals itself. Aggregate repeated-account outflows and apply the appropriate existing balance/locking rule; no duplicate cash accounting.

Lock order for new drawer mutations: tenant cash-policy lock → real account/source locks → stock/source allocations as required by the owning service → posting/audit/outbox. Resolve and document any existing inverse ordering before code. Do not hold a database lock while waiting for a user count/dialog.

Tenant lock serialization applies to cash-setting/profile/drawer changes and drawer posting. It does not become a reason to serialize all tenant reads or historical non-cash openings. A role permission is rechecked by the owning service; local frontend permission state is not authoritative.

## Source/correction rules

Opening 50,000 taka owed to a lender is a historical liability, not new borrowed cash. Paying that lender1,000 taka now is a separate settlement: cash leg requires a session when ON. Same rule for borrowers: opening receivable is historical, receiving cash now is a real receipt. Display both in one relationship workspace with distinct source records.

A historical opening correction with no cash movement does not start, close or change a cash session. If the user also settles money, represent it as a separate linked current payment/receipt owned by the settlement service. A composed UI action may perform both in one UOW, but must show both effects and apply cash policy to the settlement only. Historical money-account opening corrections that touch the tracked drawer need their existing opening/close impact rules traced separately; do not generalize party-opening exemption into permission to rewrite closed cash expectations.

A correction/void that reverses a real cash movement is not automatically a historical-opening exemption. Distinguish correcting source facts from paying/refunding cash now. Preserve existing immutable close/session linkage. An adjustment affecting a counted prior session must use the approved source correction/reversal process, with explicit impact preview and reason, rather than deleting or relinking old money rows. Feature OFF never removes historical session provenance from previously posted rows.

## Setting transition behavior

- The tenant setting remains cash_session_enabled with on/off values and server-confirmed state.
- OFF permits ordinary transactions while keeping cash accounts, balances, movements, permissions and audit operational.
- Do not silently close an OPEN session when turning OFF. Reuse the reviewed transition guard; the user closes/counts it through the existing flow first.
- Retain previously closed session records and superseded closes; they remain readable after OFF when authorized.
- Preserve the existing candidate safeguards for re-enabling after OFF intervals until their amendment is explicitly reviewed. Those safeguards determine eligible start dates; no previous OFF-period transactions may appear in a later session's expected close.
- Default remains existing effective ON, unless the owner later changes the tenant default. Do not change it merely because this rule is configurable.

## Atomic backend work packets

| Task | Exact ownership | Required result and verification |
|---|---|---|
| CASH-P01 | Documentation/contract amendment only | This classification matrix approved; no blanket session rule in new tasks |
| CASH-P02 | Existing PR16 scope | Reconcile/accept reviewed tenant locking and setting-history safeguards before dependent code; do not assume merge |
| CASH-P03 | New cash-session-policy.ts; application index; policy-focused tests | Existing permission-aware account reads, ON/OFF/no-drawer resolution; no public bypass input |
| CASH-P04 | payment-account.ts plus its ten existing callers and their provider/fixture wiring | All actual drawer payment/receipt paths use policy; compatible return type retained; noncash and historical openings unchanged |
| CASH-P05 | cash-movement-service.ts; change-transaction-date-service.ts; relevant provider/tests | Record/correct/void and date changes use actual source/drawer semantics; closed-history invariants retained |
| CASH-P06 | Existing cashSessionApi/provider/dialog/settings integration | Start prompt only on eligible live cash requirement; OFF does not block ordinary payment; no fake success or local-only real setting |
| CASH-P07 | MOD-004/MOD-006 finance relationship extension | Historical lender/borrower openings without session, followed by separate current receipt/payment; balanced opening and settlement journals |

For P04, source-verified callers of resolvePaymentAccount are under core-application/src: `sales/create-sale-service.ts`, `sales/receive-payment-service.ts`, `purchasing/create-purchase-service.ts`, `purchasing/pay-supplier-service.ts`, `purchasing/landed-cost-service.ts`, `expenses/manage-expenses-service.ts`, `returns/create-sales-return-service.ts`, `returns/create-purchase-return-service.ts`, `warranty/warranty-service.ts`, `vendors/vendor-money-service.ts`. Before each task, its packet must list exact Nest provider files, direct constructor callers/mocks and tests affected by adding the policy dependency. That file manifest is remaining implementation-spec work, not delegated architectural choice.

## Required tests and acceptance numbers

Tests proposed in existing backend party/cash/settings/sales/purchases/returns specs plus focused `cash-session-policy` unit tests and finance relationship integration tests. Use disposable PostgreSQL and the global verification contract. All are planned, not run.

| Case | Expected journal/source result | Session expectation |
|---|---|---|
| ON, no session, customer opening receivable500000 poisha | DR AR500000 / CR Opening Equity500000; one source | Success; zero cash-session/movement change |
| ON, no session, supplier payable300000 | DR Opening Equity300000 / CR AP300000 | Success; no cash check |
| ON, no session, lender opening900000 | DR Opening Equity900000 / CR lender loan liability900000 | Success after finance extension; no cash/session change |
| ON, no session, borrower opening700000 | DR borrower loan receivable700000 / CR Opening Equity700000 | Success after finance extension |
| Correct customer opening500000→450000 | Retain old journal, append correction, net AR450000 | No session required |
| ON, no session, credit sale with payments[] | AR/revenue/stock as source rule | No cash-session refusal |
| ON, no session, bank-only payment25000 | Bank and source ledger change only | Success; no cash session required |
| ON, no session, tracked cash payment25000 | No document/journal/stock/payment mutation | CASH_DAY_NOT_STARTED |
| ON, eligible session, same cash payment25000 | Exactly one payment/journal effect | Links to that session |
| OFF, no session, same cash payment25000 | Exactly one payment/journal effect; normal checks | sessionId null |
| Split cash10000 + bank15000, ON without session | Whole action rolls back, including bank leg | No partial payment |
| Same split with OFF or eligible ON session | Both legs once, exact total25000 | Link only actual tracked cash leg as schema permits |
| Historical opening then cash lender repayment10000, ON/no session | Opening remains; repayment adds nothing | Repayment requires session |
| Fake historical flag on ordinary receipt | Reject unknown DTO/bypass input | Cannot evade gating |
| Non-drawer safe, bank/MFS, or empty payment list | Existing authorized semantics | No drawer falsely inferred from CASH prefix |
| Concurrent OFF/start/post, profile timezone change, midnight | Serial authoritative decision, no ambiguous association | No OFF movement attached to later session |
| Opening/correction and foreign tenant IDs | Existing source validation/period/version/tenant rules | Exemption grants no extra permission |

Definition of Done: every row matches source behavior across all cash entry points; UI intact; mandatory and optional modes verified; historical openings post no current cash; no previously counted expectation rewritten; independent QA reviews exact source head; owner approves merge. This policy amendment resolves classification intent; it does not declare the full original ERP blueprint complete.
