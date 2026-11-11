# Decisions and blocked contracts

Rows distinguish confirmed product direction, engineering work and remaining business choices. The owner cash-policy and integrate-first/extend-second amendment is authoritative; D05 classification is confirmed. No row asks an implementation agent to choose architecture. Existing behavior is preserved until a decision and its implementation contract are approved.

| ID | Verified discrepancy / missing decision | Proposed direction | Exact prerequisite |
|---|---|---|---|
| D01 | Backend main is much older than adoption branch | Use the pinned adoption branch for all backend packets | Confirm module baseline at dispatch; do not merge adoption into main in planning |
| D02 | Open frontend cash/settings/POS PRs overlap future work | Reuse approved merged changes; revise packets after each relevant merge | Owner selects PR disposition; no blanket cherry-pick |
| D03 | Frontend unit chain and per-unit prices exceed backend single conversion | Store ordered stable unit IDs, exact factors and independent prices; freeze line display snapshots | Approve additive catalog/transaction schema amendment in EXTENSIONS.md before product/POS cutover |
| D04 | Backend lacks Bengali product names/unit symbols; richer warranty and serial modes differ | Add explicit fields, never notes/description encoding; preserve optional serial semantics | Decide day-based warranty policy and service-item accounting; then finish schema and transition tests |
| D05 | **Owner clarified:** historical party/lender/borrower openings do not require sessions; actual tracked cash does when ON; OFF permits ordinary cash operations | Classification confirmed in CASH_SESSION_POLICY; reuse existing party opening path; extend lender/borrower support and shared drawer policy | Complete caller/provider/lock/correction implementation manifest; preserve PR16 safeguards and source history |
| D06 | Purchase UI supports split accounts, lot selling prices, serials and batch/manufacture date in one confirm | Extend existing purchase writer to validate and persist them in one transaction | Approve contract; verify source correction version and serial composition; no client-side chain of payments |
| D07 | Expense UI supports unpaid/partial and multiple methods; backend records immediate paid expense | Add expense liability and subsequent settlements while preserving full-paid behavior | Owner approves liability account, payment allocation and correction/reversal behavior; closed account chart cannot be extended silently |
| D08 | UI includes Lender/Borrower/Payee/Owner; backend partyRoleSchema only has three trading roles | Separate finance relationships from trading role balances; do not pretend Borrower is Supplier | Owner approves account/relationship mapping, interest handling and opening/correction rules |
| D09 | POS has bundles and installments absent from backend contracts/services | Reuse sale writer with immutable bundle component allocations; installment schedule is separate from posted revenue | Approve bundle partial-return allocation and installment pricing/interest/late-fee policy before complete DTO/migration design |
| D10 | Online order/COD workflow has no equivalent complete backend lifecycle | Preserve stages and one-time conversion; introduce courier clearing only after its recognition rule is approved | Decide whether sale/stock posts at dispatch or delivery, failed delivery and fees/refunds; then fully specify contract |
| D11 | Backend quotation create/list/detail does not cover UI edit/status/duplicate/delete; sale input linkage is not consumed by inspected CreateSaleService | Add durable source transition/version and one conversion link inside sale transaction | Confirm accepted quote edits/expiry rules; match current preview behavior; block silent no-op sourceQuotationId |
| D12 | SaaS React centre is billing/support/subscriptions; Nest control plane primarily manages installations/licences/support operations | Keep separate platform identity and API origin; map only semantically matching operations | Billing provider, plan entitlement policy, refund recognition and provider integrations need approved specifications |
| D13 | Real auth API exists; frontend auth is preview, Google signup permits no phone/password/PIN | Password/PIN first, server-validated trusted device; phone-verified Google flow requires backend extension | Approve token persistence/session UX and required phone verification before live Google/signup cutover |
| D14 | General recycle restore and frontend SQL backup format differ from backend archive/reset model | Source-owned restore; never undelete journal lines or execute uploaded SQL in a shared tenant DB | Decide deploy mode, recovery scope and retention; backend restore adapters not assumed safe for SaaS shared DB |
| D15 | Dashboard has 14-day trends/cashflow charts; existing dashboard/cards is fixed operational metrics | Reuse present cards/recent sales; keep existing chart UI while report calculations remain excluded | Owner clarifies whether trend data belongs to the later Reports phase; no new report endpoints in this phase |
| D16 | Frontend sales rounding and alternate unit prices can change a posted total vs backend precision | Exact server calculation and immutable unit/price snapshot; show existing review dialog on discrepancy | Approve rounding/price precision reconciliation before monetary cutover; no hidden balancing line |

| D17 | HisabIQ warranty states include Waiting supplier, Received from supplier and Ready for customer; backend has a different smaller state machine | Preserve lossless service-stage metadata and existing transition guards | Complete status/action/settlement matrix; do not map several states to one and lose the round trip |
| D18 | Reconciliation UI has Matched/Review/Unmatched/Ignored, while backend match and document states differ | Source identity and backend matching decisions stay authoritative | Define each UI action, especially Ignored and editable ERP source, against backend semantics before live cutover |

All proposed new storage needs tenant ownership, RLS, forward/backward compatibility, migration fixtures and a separate migration authorization. No migration number has been reserved and no migration is executable from this planning package. Closed account chart changes, deployment activation and any real data migration remain outside this session.

## Revision 2 owner direction

See [integrate then extend](HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md) and [cash matrix](tasks/CASH_SESSION_POLICY.md). Opening party/lender/borrower balances are historical and session-free. Current tracked-cash settlements remain gated when ON and allowed sessionless when OFF. Stage A integrates compatible existing services; Stage B develops missing UI parity. Flexible business workflows are a product requirement; exact new APIs/storage remain proposed until their implementation packets are complete.

## D08 — Proposed finance relationship/account identity decision contract (2026-11-12)

**Decision status: PROPOSED FOR OWNER REVIEW; NOT APPROVED.** The owner approved the MOD-004 plan *revision* in [PR #288](https://github.com/shuvodelux-commits/hisabiq_ui/pull/288), not the new D08 finance-account design, schema amendments, chart extension, endpoint implementation, worker slot, merge, or data migration. This section refines the existing D08 row without changing its blocked state.

**Live source baseline at audit:** HisabIQ frontend main cae993afb27996ab78ba8a295e5d872993e45e85; NestSherERP backend adoption branch chore/hisabiq-adoption-runtime-a01 at e2a0a486d6d36cddd51ba58eece83c83c9f2ee69. Backend main is not the adoption authority. PR #288 head 0b9f97ccc3266bd2821de008dfd89b56a94201f2 remains an independent open draft. These are review snapshots; re-check both heads and accepted dependency revisions at dispatch.

### D08.1 Owner approval overview — 12 sentences

1. Keep the entire HisabIQ React Parties and Finance UI, including the seven existing relationship labels and opening/settlement dialogs.
2. Keep a single tenant-scoped party identity, even when one person is simultaneously Customer, Supplier, Vendor, Lender, Borrower, Owner, and Payee.
3. Existing backend party-role validation contains only CUSTOMER, SUPPLIER, and VENDOR, so a finance relationship must not be coerced into a trading role.
4. Existing LOAN:{accountId} is a **lender liability**, never a borrower receivable or a spendable cash/bank account.
5. Prefer a separate borrower loan-receivable account family and link each lender/borrower account or obligation to the real party identity.
6. Reuse the existing OWNER_CURRENT_ACCOUNT as the aggregate owner-equity/current-account control while requiring source-level per-owner attribution and a relationship-scoped subledger.
7. A Payee relationship identifies a recipient; it creates no liability until an actual expense payable or another separately approved source document exists.
8. Historical Lender, Borrower, and Owner openings are balanced against OPENING_EQUITY, cause no money movement, and never require an active cash session.
9. Current receipts, disbursements, injections, drawings, and repayments post to real validated Cash/Bank/MFS accounts and follow the shared MOD-005 drawer policy.
10. Relationship ledgers, balances, queries, and permissions must be scoped by *both* party identity and relationship, with no cross-role netting or any-role data leakage.
11. Initial finance principal handling will be separate from interest; do not capitalize interest or recognize borrowing/lending income through an invented journal category.
12. This documentation proposal authorizes no coding, migration, test run, worker reservation, deployment, financial mutation, or merge without the later bounded implementation approval.

### D08.2 Source-grounded existing state versus proposed extensions

| Concern | Source-verified current capability | D08 proposed disposition |
|---|---|---|
| Trading party | Backend packages/core-contracts/src/parties.ts defines CUSTOMER/SUPPLIER/VENDOR; trading role openings are journaled | **REUSE** unchanged trading-role contract; **EXTEND** a distinct finance relationship set rather than broadening trading enums indiscriminately |
| Frontend relationships | src/types/erp.ts exposes seven PartyRole values; src/components/parties/PartyFinanceDialog.tsx offers Owner/Lender/Borrower movement and opening choices, split payment rows | **PRESERVE** existing UI and adapt only backend-facing mapping after approval |
| Lender liability | packages/core-domain/src/accounting/account.ts defines parameterized LOAN; ManageAccountsService can open loan account against Opening Equity; CashMovementService has LOAN_RECEIVED/LOAN_REPAYMENT | **REUSE** liability posting semantics; **EXTEND** link to a specific party/obligation, source-specific statement and safe corrections |
| Borrower asset | No BORROWER_LOAN_RECEIVABLE code in the closed chart and no corresponding current-movement kind | **PROPOSE** non-money, loan-specific BORROWER_LOAN_RECEIVABLE:{loanId} account family; chart amendment required |
| Owner | Fixed OWNER_CURRENT_ACCOUNT and injection/withdrawal movements already exist; current movement DTO does not bind an owner person | **REUSE** control account, **EXTEND** party attribution and owner relationship ledger; no duplicate owner-controlled aggregate |
| Payee | Expense flows may use payeePartyId; three-role party enum has no PAYEE | **EXTEND** identity membership/reference; **BLOCK** accrued payable until D07 contract |
| Role ledger safety | MOD-004 source audit found backend PartyLedgerService.ledger accepts partyId without a requested relationship and authorizes when *any* related role is allowed | **P0 BLOCK** role-scoped query + permission before any seven-role live ledger cutover |
| Cash policy | Existing backend payment/movement callers still have unqualified open-session checks, despite owner-confirmed OFF behavior | **DEPEND** on MOD-005 shared server-side policy and locking; never add per-module bypass |

Source anchors: frontend src/utils/partyFinance.ts, src/types/partyLedger.ts, src/components/parties/partyRoleActions.ts; backend packages/core-domain/src/accounting/account.ts, packages/core-contracts/src/parties.ts and src/money.ts, packages/core-application/src/money/manage-accounts-service.ts and cash-movement-service.ts; approved MOD-004 amendment §19; cash policy tasks/CASH_SESSION_POLICY.md.

### D08.3 Canonical identity and relationship model (proposal)

- **Party** remains one tenant-owned identity with stable ID and person/business details. Never duplicate the same person into separate Lender and Customer rows just to get a ledger.
- **Relationship membership** is a separate tenant-owned, versioned set of CUSTOMER, SUPPLIER, VENDOR, LENDER, BORROWER, OWNER, PAYEE. Membership flags are not balances; finance membership does not permit a trading-party posting. Preserve the current trading roles wire format during incremental adoption and add an explicit relationship projection for the seven-role UI.
- **Money obligation link** associates (tenantId, partyId, relationship, obligationId, accountId, lifecycleStatus). LENDER can own multiple existing LOAN accounts/agreements; BORROWER can own multiple distinct loan receivables. An obligation/account may be attributed to only one owning party and one finance relationship inside its tenant. A role summary is the sum of *that relationship's* linked obligations, not all journal lines with the same partyId.
- **Owner attribution** uses OWNER_CURRENT_ACCOUNT together with an immutable source association (owner partyId plus OWNER relationship) on each posted owner-capital/drawing/opening source. A single fixed owner control account is permitted only if the server can reconcile its aggregate to per-owner subledgers; never assign the whole account to one arbitrary owner or let a different relationship's line enter the owner's statement.
- **Payee membership** can reference an Expense payeePartyId without creating debit/credit. If D07 later adds Expense Payable, the actual expense source and payable attribution—not the Payee flag—create that obligation. A Payee who is also Supplier keeps the two liabilities separate by source/control-account.
- **Read isolation**: every relationship balance/statement request checks tenant, membership and permission for the requested relationship, limits source/account families to that relationship, and includes opening and correction provenance. Forbidden role data must not appear in totals, pagination, filters, exports, or source links. Never authorize a CUSTOMER ledger with a SUPPLIER permission merely because both belong to the same party.
- **Relationship removal** may deactivate future use, but cannot erase an identity, source journal, repayment, audit, role history, or active obligation. Hard-delete or reassignment of an account with posted entries is prohibited.

### D08.4 Control accounts and journal matrix

Amounts below are **integer poisha**; all journals must balance exactly. Named account code for BORROWER is a **proposed closed-chart amendment**, not a currently supported account.

| Relationship / action | Debit | Credit | Classification |
|---|---|---|---|
| Existing Customer opening receivable | AR (party + CUSTOMER) | OPENING_EQUITY | Existing trading opening; no cash session |
| Existing Supplier opening payable | OPENING_EQUITY | AP (party + SUPPLIER) | Existing trading opening; no cash session |
| Lender historical principal payable | OPENING_EQUITY | LOAN:{lenderAccountId} | Existing loan-account opening posting reusable only with new verified party link; no session |
| Borrower historical principal receivable | BORROWER_LOAN_RECEIVABLE:{loanId} | OPENING_EQUITY | New asset family and source; no session |
| Owner historical contributed capital | OPENING_EQUITY | OWNER_CURRENT_ACCOUNT (attributed owner party) | Proposed historical owner opening; no session |
| Current loan received from Lender | Validated money account(s) | Linked LOAN liability | Existing principal intent, new party link/split composition; MOD-005 cash policy |
| Current principal repaid to Lender | Linked LOAN liability | Validated money account(s) | Existing repayment intent, new party link/split composition; MOD-005 policy |
| Current money lent to Borrower | Linked BORROWER_LOAN_RECEIVABLE | Validated money account(s) | New current lending source; MOD-005 policy |
| Current principal collected from Borrower | Validated money account(s) | Linked BORROWER_LOAN_RECEIVABLE | New current collection source; MOD-005 policy |
| Owner injection / drawing | Money / OWNER_CURRENT_ACCOUNT respectively | OWNER_CURRENT_ACCOUNT / money respectively | Existing movement intent, proposed owner source attribution; MOD-005 policy |
| Payee selected with no unpaid source | No entry | No entry | Pure identity reference |
| Approved unpaid Expense to Payee (D07 only) | Real EXPENSE category | Separate approved Expense Payable control | NOT YET AUTHORIZED; not a supplier or loan opening |

For existing trading roles, preserve both directions already supported by opening-balance.ts: Customer receivable/advance and Supplier payable/advance; Vendor currently payable-only. Vendor receivable remains a distinct unresolved contract; do not silently route it into Borrower or Supplier. For Owner, source direction is contribution credit / drawing debit; this does not change profit/loss. A Lender credit balance and Borrower debit balance remain distinct even if the same party owns both roles.

**Interest boundary (proposed):** Existing CashMovementService documentation expressly treats Lender loan movement as principal-only and says lender interest is an Expense, not principal. Attribute any separately paid lender interest to a genuine expense source with lender/payee linkage, subject to Expense module D07 if partial/unpaid. Borrower interest received has no verified approved income code or recognition contract; keep it **BLOCKED** pending a separate explicit chart, tax/recognition and correction decision. Do not add interest to principal, manufacture sales revenue, or silently label it a loan repayment. No automatic accrual, interest schedule, compounding, late fee, or rate calculation is authorized by D08.

### D08.5 Proposed command and wire boundaries (not implemented)

**Shared types:** PartyIdentityId = validated existing party ULID; RelationshipType = seven-value discriminator; ObligationId = distinct per-loan ULID; MoneyLeg = (server-validated tenant-owned accountId, Cash/Bank/MFS method, positive amountMinor). The UI can keep display values in taka but must convert to exact minor units at the transport boundary. Server-generated source IDs, tenant IDs and authoritative account codes must never be accepted unchecked from the browser.

| Candidate API operation | Proposed minimal required fields | Owner / invariant |
|---|---|---|
| GET party relationships/role-scoped balances | partyId; relationship filter; optional asOf | MOD-004 reader + MOD-006 finance projection; permission-scoped |
| PUT/PATCH party finance membership | partyId, relationship, expectedPartyVersion, operationId | MOD-004 identity UOW; no journal for membership alone |
| GET role ledger | partyId, relationship, date range, cursor/page | Source-linked, permission-scoped ledger; no all-role net |
| Create finance historical opening | partyId, relationship, obligationId where loan-based, amountMinor > 0, businessDate, source note, operationId | MOD-004 identity + MOD-006 account source, one UOW; Opening Equity only |
| Correct/clear historical opening | openingSourceId, expectedVersion, replacement amountMinor >= 0, businessDate, reason, operationId | Reverse original immutable journal and post replacement if positive; zero is reversal-only; retain audit and lock periods |
| Receive/repay/lend/collect/inject/draw | partyId, relationship, exact kind, obligationId when loan-based, businessDate, source reference/note, moneyLegs[], amountMinor, operationId | MOD-006 source owner, one UOW; exact split sum, permission, no overdraft/over-repayment, MOD-005 cash policy |
| Correct/void current movement | sourceId, expectedVersion, reason, replacement payload or void intent, operationId | Same source owner; immutable reversal/repost, period guard, drawer provenance and MOD-005 locking |

Routes and full Zod schema placement are **proposed**, not asserted as existing endpoints. Keep existing trading party endpoints and single-account finance writer for already supported actions; extend application commands at the owner seam rather than create a competing generic journal endpoint. A single multi-leg finance action must post **one** business source and one balanced UOW; never emulate split payments with several browser POSTs. Negative or zero transfer legs are invalid; opening clear-to-zero is a specific audited correction, not a zero posting.

**Historical opening uniqueness:** Trading: one active opening per (tenant, party, trading role) under its existing domain rules. Lender/Borrower: one active historical opening per (tenant, party, relationship, obligation/account) so two distinct loan agreements can have distinct go-live principals. Owner: one initial capital opening per (tenant, party, OWNER) unless an explicitly versioned new source type is approved. Ensure a LOAN account opened through ManageAccountsService cannot be separately opened again by a party-link creation; link existing accounts only after reconciling original account-opening source, or create/link/open atomically in the approved single writer.

### D08.6 Security, reconciliation, migration and shared ownership gates

1. **Closed chart remains unchanged now.** BORROWER_LOAN_RECEIVABLE:{loanId} requires explicit owner acceptance of a new parameterized asset family, accounting category, source mapping, reporting effects and migration. Do not add it under CASH/BANK/MFS or relabel existing LOAN.
2. **No identity inference from names.** Existing anonymous LOAN accounts and OWNER_CURRENT_ACCOUNT postings cannot be assigned to a person by holderName, memo, phone, or UI label. Reconcile verified account source documents before linking; unmatched historical aggregate remains visible with an explicit unattributed state, not fabricated per-party history.
3. **Tenant security.** New membership/link/obligation rows require tenant foreign keys, matching ownership checks, uniqueness, appropriate unprivileged PostgreSQL RLS, cross-tenant rejection, versioned updates and source-level permissions. Existing OWNER_CAPITAL_RECORD and LOAN_MOVEMENT_RECORD permission branches need review; Borrower lending/collection requires an explicit permission decision rather than borrowing Supplier access.
4. **Finance permission leak is P0.** MOD-004 cannot enable the existing partyId-only ledger reader as a role ledger. Implement requested relationship scoping at service/repository/pagination and protect joined document details, export/print, balances and search.
5. **Historical noncash vs actual money.** Opening, correction and membership changes never call Start Day, a cash movement or a drawer session. For actual money legs, only a server-resolved designated drawer CASH leg requires an eligible OPEN session when setting ON; OFF accepts sessionless legitimate money posting; Bank/MFS-only and unpaid sources do not require a cash session. MOD-005 owns setting transition, lock ordering and session provenance.
6. **No duplicate source.** Idempotency key/operationId plus unique document lineage must prevent retry posting, multiple finance relationship openings on the same obligation, or double recording from existing ManageAccountsService and new Party Finance UI. Corrections reverse/repost under source owners; closed period and session rules still apply.
7. **Period and overdraft safeguards.** Guard original and target periods, reason for corrections, stale versions, permission changes, duplicate requests, inactive accounts and principal repayment greater than actual outstanding principal. No cross-obligation collection, automatic interest netting or money-account-negative workaround.
8. **Contracts and migrator owned centrally.** Coordinator reserves any shared contract/schema/migration files and serialized migration number. MOD-004 owns identity/UI and role ledger safety, MOD-006 owns new finance obligation and posting algorithms, MOD-005 owns cash session policy/locks, MOD-007/D07 owns accrued Expense Payable and Payee payable sourcing. MOD-000/001 supply foundation/auth/settings.
9. **Preserve UI parity.** All seven labels, split payment rows, review step, Bangla helpers, ledger context, notes/attachments and existing navigation persist. An unsupported live writer stays clearly preview-only or disabled with a reason; never report success or fall back to fixture posting after a failed server mutation.
10. **Rollback and migrations.** Future schema changes require additive/dual-read sequencing, backfill and reconciliation proof, feature-gated rollout, reserved migration, disposable DB fixtures and explicit rollback plan. This documentation creates no schema or data operation.

### D08.7 Proposed verification vectors — future authorization required

| ID | Case | Expected accounting or security result |
|---|---|---|
| D08-V01 | One tenant party is Customer + Supplier + Lender + Borrower + Owner + Payee | One partyId; independent role views and balances, no netting |
| D08-V02 | Caller can see Customer but not Lender ledger | Lender query/rollup/source detail denied; no balances leaked |
| D08-V03 | Lender opening 900000 minor, no session, ON | Dr Opening Equity 900000; Cr linked LOAN 900000; zero cash/session movement |
| D08-V04 | Borrower opening 700000 minor, no session, ON | Dr linked Borrower Receivable 700000; Cr Opening Equity 700000; zero cash movement |
| D08-V05 | Owner opening 300000 minor, no session, ON | Dr Opening Equity 300000; Cr attributed Owner Current 300000 |
| D08-V06 | Same party Lender and Borrower with separate agreements | No sign-netting; each obligation has separate source/account and running balance |
| D08-V07 | Two separate loans with same lender | Two obligation links; correct relationship aggregate and drill down |
| D08-V08 | Existing LOAN account has historical opening | Linking party never creates a duplicate Opening Equity journal |
| D08-V09 | Correct opening 900000 -> 750000 | Old source and reversal preserved; new balance 750000; both periods guarded |
| D08-V10 | Clear opening to zero | Source remains in audit, reversal-only, no zero-value journal or deletion |
| D08-V11 | Principal borrower collection 150000 across Cash + Bank, ON/no drawer | Refuse whole command atomically; no money/loan posting |
| D08-V12 | Same collection after eligible session opened or OFF | One source and balanced UOW; correct split amounts and drawer provenance |
| D08-V13 | Bank/MFS-only principal settlement with ON/no session | Allowed; no forced drawer association |
| D08-V14 | Unauthorized or cross-tenant party/account/loan ID | Refused before any journal, with no role detail leak |
| D08-V15 | Replayed operationId / stale correction version | Exactly-once posting or conflict; no duplicated principal |
| D08-V16 | Payee selected without payable expense source | No journal, liability or invented balance |
| D08-V17 | Lender interest submitted as principal | Refused or source-classified separately; principal unchanged |
| D08-V18 | Borrower interest requested without approved income contract | Explicitly blocked; not posted to loan principal or Sales |
| D08-V19 | Multiple owners inject/draw | Each owner subledger reconciles to OWNER_CURRENT_ACCOUNT aggregate |
| D08-V20 | Original transaction tied to closed cash session | Correction honors MOD-005 immutable close/period and provenance policy |

**Not executed.** These are planned checks for disposable tenants and independent accounting/security QA after a coordinator-assigned build slot and authorized test scope, not a passing-test claim.

### D08.8 Proposed owner decision and dispatch boundary

**Recommended D08 decisions for approval:** (A) Keep one party identity plus separate seven-way relationship membership; preserve existing trading roles on their current wire. (B) Keep LOAN per lender agreement as a liability, add a distinct non-money BORROWER_LOAN_RECEIVABLE per borrower loan agreement under an explicitly approved chart amendment. (C) Reuse aggregate OWNER_CURRENT_ACCOUNT with mandatory per-owner source/ledger attribution and reconciliation. (D) Treat Payee as identity-only until an actual D07-approved payable source. (E) Record opening principal only against Opening Equity with no cash session; allow source-safe reversal-only correction to zero. (F) Restrict initial loan flows to principal; lender interest belongs to Expenses and borrower interest waits for a separate income/recognition decision. (G) Implement relationship-scoped permissions and provenance before live ledger/settlement cutover. (H) Keep all cash-session behavior under MOD-005; no hidden feature bypass.

**Documentation-only allowlist:** this file, docs/integration/DECISIONS.md, on its own GitHub draft branch. No AGENTS.md, other module packet, application code, backend, shared contract, chart, migration, CI/workflow file, financial record, test, deployment or production operation changed by this proposal.

**Owner approval requested:** approve or amend recommendations A–H above as the D08 **account-identity specification**. This is separate from PR #288 MOD-004 plan approval. Even after D08 approval, implementation needs prerequisite heads, exact DTO/schema amendment ownership, coordinator-reserved exclusive build slot, executor/environment confirmation, bounded verification authorization and later human review/merge; a GitHub comment does not reserve a worker.

