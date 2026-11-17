# Second-pass critical review — evidence drafts 1–2

**Result: NOT implementation-ready as a complete ERP blueprint.** The package contains substantial source evidence, core implementation contracts and all module packet headings, but several packets are inventories with blocked design work rather than deterministic execution specifications. They must not be sent to lower-reasoning coding agents as approved build instructions.

This was a second pass by the author. No separate independent reviewer/agent was run, and no independent QA approval is claimed. Future independent implementation QA is specified in VERIFICATION.md.

## Source-verified material findings

| Priority | Finding | Immutable source evidence | Consequence / owning work |
|---|---|---|---|
| P0 | Sessions OFF does not currently make drawer money flows optional | [payment-account.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/purchasing/payment-account.ts#L110); [cash-movement-service.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/money/cash-movement-service.ts#L181) | Complete D05 caller-wide locking/setting behavior; PR16 does not alter these files |
| P0 | One-account purchase DTO cannot represent existing split purchase confirm | [purchasing.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/purchasing.ts#L46); [PurchaseEditor.save](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/PurchaseEditor.tsx#L217) | EXT-03 atomic receiving/payment/serial contract before live purchase cutover |
| P0 | Paid-only expense API cannot represent unpaid/partial/split expense | [expenses.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/expenses.ts#L38); [expense preview writer](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/expensePreviewStore.ts#L26) | Define liability and settlement posting; do not truncate amount to paid portion |
| P0 | Single alternate unit and base-unit poisha pricing do not cover independent multilevel unit prices | [products.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/products.ts#L43); [UI Product model](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/types/erp.ts#L55) | Complete exact price/quantity representation and immutable transaction unit snapshot; no rounding-away unit price |
| P0 | No verified complete bundle/installment/COD backend lifecycle | [bundle/related UI types](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/types/erp.ts#L93), [installment preview store](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/data/installmentPreviewStore.ts), [online store](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/onlineSales/onlineStore.ts) | BUILD packets need full business/event/account/storage contracts; preserving preview is not completion |
| P1 | Current `/me` lacks tenant namespace/timezone | [auth.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/auth.ts#L230) | EXT-01 reads live BusinessProfile and adds explicit fields |
| P1 | Current bank client is for old /api/bank endpoints and ok:true envelope | [bankEntryApi.ts](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/services/bankEntryApi.ts#L32) | Source-by-source BankEntryType mapping, not URL replacement |
| P1 | UI finance roles exceed trading-party enum | [parties.ts](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/parties.ts#L20); [UI PartyRole](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/types/erp.ts#L141) | Complete finance relationship model; never map Borrower to Supplier by convenience |
| P1 | Accepted sourceQuotationId/sourceOrderId do not establish one-time conversion | [CreateSaleService](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-application/src/sales/create-sale-service.ts#L91) and sales schema | Inspected command/service do not consume those properties; establish durable link/version/conversion algorithm |
| P1 | Warranty state machines differ; temporary replacement not established by move DTO | [UI warranty states](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Warranty.tsx#L67); [backend warranty](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/warranty.ts#L85) | D17 lossless state/settlement/temporary-unit amendment |
| P1 | Reconciliation UI states and source editing are not direct backend match enum aliases | [Reconciliation.tsx](https://github.com/shuvodelux-commits/hisabiq_ui/blob/176bb1a3e8f42eef192ea3098074ac5c8a214261/src/pages/Reconciliation.tsx#L269); [backend contract](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/core-contracts/src/reconciliation.ts#L20) | D18 status/action matrix; source correction must use owning document |
| P1 | Several financial concurrency guarantees are not proven | [UOW](https://github.com/shuvodelux-commits/nestshererp/blob/1643dac059e568407bba2fff38a990268dfe28fe/packages/adapter-postgres/src/unit-of-work.ts#L23); adapter locks indexed in SERVICE_INDEX | A transaction is not a last-stock or cash-balance lock. Require race tests and exact lock strategy |

## Blueprint quality gates

| Required gate | Result | Evidence / missing work |
|---|---|---|
| Actual repo, branch and full SHA recorded | PASS | Fresh public clones plus GitHub metadata; unmerged heads separate |
| Existing frontend routes discovered, including Dashboard and SaaS | PASS for route census | FRONTEND_ROUTES plus route coverage table; active flow semantics not implied |
| All non-report frontend functionality semantically inventoried | PARTIAL | 620 files with5537 lexical interaction/state candidates; 214 shared/legacy/unassigned files need consumer classification; count includes reports and reusable code |
| Backend controllers/contracts/schema/migrations inventoried | PASS for static census; PARTIAL for behavior | 277 declarations across tenant/control-plane apps, 90 tenant Drizzle tables,53 migrations; no execution proof |
| Every UI action has complete API→service→repository→transaction trace | FAIL | Core flows and selected secondary seams have traces; several secondary/advanced actions remain inventories |
| Every form/table has complete field-level mapping | FAIL | Core Product/Party/Purchase/POS/Cash mappings supplied; settings/SaaS/finance-relationship and other fields still incomplete |
| Every proposed endpoint has full contract | PASS for no invented new routes | Narrow additive EXT-01/02 contracts; EXT-03/04 explicitly blocked; missing business lifecycles have no fabricated endpoint |
| Every task names exact allowed-write files and behavior | FAIL for blocked tasks | Core tasks specify files; generic packet tasks require coordinator allowlist and design amendment; they are not executable as-is |
| Every important business rule has exact numeric/negative/concurrency tests | PARTIAL | Core vectors explicit; advanced policy/storage contracts and test expectations incomplete |
| Money, security, tenant and historical invariants explicit | PASS at global/core level | Master, CORE_WORKFLOWS, VERIFICATION; per-feature lock behavior still needs proof |
| Dependencies form usable acyclic sequence | PASS structurally | Local graph walk covered23 modules with no cycle; task-level dependency refinement still required |
| Shared-file ownership/conflict recovery specified | PASS for execution policy | EXECUTION; exact future reservations not made |
| Five chats respect one worker and human merges | PASS for policy; NOT VERIFIED live | Checked-in max_workers1; live Project reservation/runner state unavailable |
| Reports/Analytics integration excluded; Dashboard retained | PASS in proposed scope | No report implementation tasks; existing report UI preserved; trend-data gap D15 |
| Existing UI preserved | DESIGN CONSTRAINT VERIFIED; runtime NOT VERIFIED | No application source changed; future regression matrix supplied, not executed |
| Independent second reviewer has approved plan | NOT DONE | Author second-pass only; no independent reviewer claimed |
| Lower-reasoning agent can implement every packet without architectural invention | FAIL | Only fully specified approved slices may be assigned; blocked packets need planning completion |

## Distinguish design work from owner decisions

Do not ask the owner to solve engineering omissions. D01/D02 are baseline/coordination facts; D03 multi-unit persistence, D06 split receiving composition, D11 durable conversion linkage and D05 shared locking need additional architect work against source. D04 warranty/service semantics, D07 accrued-expense accounting, D08 finance relationships, D09 installment fees/partial bundle returns, D10 COD recognition, D12 billing/provider policy, D14 recovery deployment scope and D15 Reports boundary may need business confirmation only where existing confirmed UI/source rules do not decide them. Re-read existing confirmed behavior before asking.

## Required planning amendments before complete-blueprint sign-off

1. Finish the unit/pricing/snapshot model and source trace; independent prices must remain exactly representable. Complete product/service/gallery/offer metadata contracts and tests. EXT-02 only resolves names/symbols, not that entire module.
2. Reconcile cash PRs against the chosen post-review baseline; finish constructor/provider/lock-order and correction/reversal semantics for every drawer writer. Prove OFF paths with exact regression vectors.
3. Complete purchase createWithin/reversal/serial/attachment and split-payment storage/API changes. State every new column and repository method, exact transaction algorithm and all regression fixtures.
4. Write full expense liability/settlement, finance relationships and cheque/bank-entry contracts. Existing generic movement types are not universal finance coverage.
5. Derive all quotation/status/conversion, vendor correction, warranty temporary-replacement and reconciliation status actions from active UI and complete a reversible field/action mapping.
6. Finish bundle, installment, online/COD, notifications, SaaS billing/support and recovery packets with actual business decisions, complete DTOs, tables, source service algorithms and tests. No future builder may invent them.
7. Finish settings field/key/consumer matrix and active Magic-vs-legacy ownership, full import template mapping, operational Dashboard gaps and every shared action's owner. Add exact per-task file manifests instead of broad read scopes.
8. Obtain an independent critical review of the finished packet set and pass the failed gates above. Only then rename this from evidence draft to complete implementation blueprint and begin module approval/dispatch.

## Documentation checks performed

Local read-only/structural checks: pinned source working trees clean; module dependency graph acyclic; packet count23; all required18 section headings checked; relative links and archive integrity checked at packaging. These checks validate document structure, not business completeness. See CHECKS.json for actual counts/results. No test result or deployment readiness is inferred from them.

## Revision 2 change review

Owner confirmed historical opening classification, optional-session behavior and integrate-first/extend-second sequencing. These are now recorded in the master, decision register, relevant module packets and new detailed cash-policy and staged-extension documents. Existing customer/supplier opening code was re-read and already uses Opening Equity with no cash/session path. Lender/borrower history remains an extension, not a falsely claimed existing endpoint. Current backend/frontend branches and PR16/PR282 state were rechecked and still match the pinned source baseline; both PRs remain open/unmerged.

This revision supplies a transaction matrix and plan for every named missing capability; it does not erase the original failed completeness gates. Exact provider/caller write manifests and several complete new DTO/storage/test packets still need architectural work. No independent reviewer, runtime suite or database operation was run. The current revision's documentation structural checks cover references, source paths, packet sections, dependency graph and archive integrity only.

## Revision 3 MOD-000-A scope review

The bounded foundation packet now resolves session storage, no-sample connected routing, refresh/logout races, source/bootstrap fields, decoder/retry ownership, money/ULID utilities, exact task file sets and test-only runner setup. A newly verified gap is PIN_LENGTH4 in backend domain versus six slots in HisabIQ; the proposed additive4/6 policy preserves existing credentials and HisabIQ UI. This is specification work, not source implementation or independent QA. General full-blueprint failed gates remain until the other packets are completed.
