# MOD-004 — HisabIQ React ↔ NestJS Party relationships (architecture design proposal)

**Date:** 2026-11-14  
**State:** DRAFT DESIGN / NO IMPLEMENTATION APPROVAL  
**Tracking issue:** [#568](https://github.com/shuvodelux-commits/hisabiq_ui/issues/568)  
**Canonical accounting proposal:** [D08 in DECISIONS.md](../../integration/DECISIONS.md) (merged document, still separately gated)  
**Existing integration packet:** [MOD-004](../../integration/modules/MOD-004-parties-ledgers.md)

## Intent

Connect the existing seven-relationship **HisabIQ React** Party workspace to the existing **NestJS/PostgreSQL** business engine, integrating already-compatible trading functionality first and extending only verified gaps. Preserve the existing compact React UI, bilingual helpers, keyboard/touch interactions, drafts, `All` directory view, source-specific ledgers, optional per-relationship historical openings, and contextual actions.

The owner explicitly excluded the **legacy Vue app** from HisabIQ integration on 2026-11-14. No Vue feature work, Vue consumer migration, Vue E2E or Vue UI redesign belongs in MOD-004. The Nest repository's `apps/web` may remain for its existing purpose. Insecure **Nest APIs** are still a server-side security issue even if the Vue consumers are not migrated.

This document is a **design for approval**, not an executable work order. It changes no application source, permissions, data, migrations, API runtime, UI activation or deployment.

## Approaches reviewed

| Approach | Benefit | Problem | Disposition |
| --- | --- | --- | --- |
| Add four finance values directly to current `partyRoleSchema` and reuse trading Party service | Superficially few code edits | Trading query filters, financial controls, list summary, role permissions, opening and mutation semantics assume Customer/Supplier/Vendor. Could create accidental cross-role disclosure, double posting or wrong account direction. | **Reject** |
| Create unrelated customer/supplier/lender/owner identity records | Simplifies each legacy service | Same real person duplicates across the tenant, breaks `All` identity and contextual workflows, invites inconsistent details/settlement. | **Reject** |
| **One tenant-scoped Party identity with distinct versioned trading and finance relationship families**, each with purpose-built source contracts and subledgers | Reuses existing correct trading behavior, preserves UI identity and clear accounting boundaries | Requires carefully staged contracts, permission map, source ownership, schema and migration design | **Proposed**; needs D08 business/accounting approval |

## Non-negotiable invariants

1. **Party identity is not a balance.** One person/entity can occupy several roles, with independent posting provenance and authorization per relationship.
2. **No silent netting.** Customer receivables do not cancel Supplier payables, Vendor consignment obligations, lender liabilities or borrower receivables. Show gross due/advance separately from role net.
3. **Server source owns accounting.** Sale, purchase, consignment, expense, loan agreement and owner capital/drawing each own their own journal, reference, correction and audit. Never introduce a generic manual Party journal to fake missing APIs.
4. **Historical opening is noncash.** One source-linked opening per appropriate role/component/date or separately proven correction, counterposted to Opening Equity, no money movement or active cash session. Changing a posted value requires reversal/repost and optimistic version checks; zero-clear is a source correction, not a record delete.
5. **Actual money movements use MOD-005 policy.** ON means tracked drawer cash requires an eligible session; OFF allows journaled sessionless cash. Bank/MFS-only, unpaid and historical operations do not acquire a cash-session prerequisite.
6. **Access is exact.** Tenant RLS plus relationship VIEW/EDIT/CREATE/DEACTIVATE, private-profile read and party-wide history/delete grants must be independent. `WITHHELD` is neither `false` nor `null`; never use role-scoped history to authorize a global delete.
7. **No fabricated live UI.** Current React Party screen is preview-driven, and `ConnectedWorkspaceGate` remains authoritative. Existing unmounted V2 read adapters cannot be equated to a full seven-role connected screen.
8. **Money is exact.** Integer poisha on wire, source-linked debit/credit journal balance, durable idempotency for retries/lost acknowledgments, tenant composite FK and non-owner RLS; no floating-point posting or false zero.

## Source-based state and gap boundaries

| Relationship | React UI today | Confirmed Nest current trading contract | Proposed extension / owner |
| --- | --- | --- | --- |
| Customer | Directory, profile, opening, ledger, payment and source actions in preview | V2 permission-aware list/detail; trading ledger/opening and current trade service | Role-safe React read + later create/edit/settlement parity; MOD-004 and sales |
| Supplier | Same identity, distinct Supplier statement/opening and purchase actions | V2 selected-role list/detail, Supplier AP/advance read and opening | Preserve distinct AP/advance and purchase source settlement; MOD-004/MOD-008 |
| Vendor | Taken/given goods, distinct source buckets, Vendor-specific actions | V2 selected trading role and Vendor payable/advance; **not** proven goods-given receivable | Separate consignment/issued-goods recognition and inventory ownership contract; MOD-004/vendor owner |
| Lender | Role, historical opening and loan/repayment preview actions | **Not** in Nest `partyRoleSchema`; money/loan account functionality alone is not seven-role Party API parity | Loan agreement identity/attributed liability and principal/interest allocation; MOD-006 |
| Borrower | Role and historical receivable/loan actions | **Not** in trading Party union | Borrower loan receivable control + agreement attribution, principal and interest policy; MOD-006 |
| Owner | Owner role and opening/capital/drawing context | **Not** in trading Party union; historic `OWNER_CURRENT_ACCOUNT` is not proven equity | Per-owner capital/drawings and classification of existing current account; D08/MOD-006 |
| Payee | Payee identity and expense/contextual actions | **Not** in trading Party union; expense posting may not provide unpaid obligation | Typed expense payables and allocation to Party identity without generic loans; D07/MOD-012 |

**Source anchors:** frontend `src/pages/Parties.tsx`, `src/components/parties/PartyEditorDialog.tsx`, `src/integration/party-reads.ts`, `src/integration/party-read-controller.ts`, `src/integration/ConnectedWorkspaceGate.tsx`; backend adoption `packages/core-contracts/src/parties.ts`, `apps/api/src/parties`, relevant application Party/loan/money services and PostgreSQL adapters. The last two require refreshed service-by-service audits before implementation; document-only architecture **does not assert** every loan/owner/expense endpoint is fully implemented.

## Delivery sequence and ownership

### Stage 0 — Freeze approval boundary and source map (this draft)

- Review both `AGENTS.md`, master plan, MOD-004, D08 and MOD-005/006/D07 dependency files.
- Enumerate **active** React Party action handlers, effects, form validation, source links and responsive/keyboard paths, not merely lexical matches.
- Build exact UI action → typed API → Nest controller → service → repository → journal/source graph, each classified **REUSE / ADAPT / EXTEND / BLOCKED** with live branch SHA.
- Resolve the D08 proposed owner capital/drawings classification, interest and Vendor semantics before their financial writers.
- Request independent accounting/security review of contract and role visibility map. No application changes at this stage.

### Stage 1 — Existing trading-read bridge (bounded, read-only)

- Reuse merged frontend [#552](https://github.com/shuvodelux-commits/hisabiq_ui/pull/552) strict V2 Customer/Supplier/Vendor list/detail transports and session-safe controllers.
- Implement only the separately approved connected route/read adapter slice, verifying tenant/session invalidation, role-only reads, cursor/list summary, historical opening identity and role-scoped ledger.
- Retain the **entire seven-role UI** in preview, maintain explicit connected-mode guards, and never present the three-role subset as full implementation.
- No financial mutation, Vue work or global AppShell gate bypass.

### Stage 2 — Seven-role identity and typed reads

- Propose independent finance relationship memberships linked to shared Party identity, with role-family-aware permissions and tenant composite foreign keys.
- Introduce explicit authorized `All` directory projection. It must not show ungranted memberships or infer financial history from an absent role.
- Define relationship-specific list/detail/statement/opening contracts, exact minor-unit directions, version/revocation and private-profile visibility.
- Obtain exclusive coordinator ownership of common contracts, permissions, schema/migrations and audit/outbox before code.

### Stage 3 — Noncash historical openings and corrections

- Extend the **existing** historical journal owner, not a new money-movement API, to cover approved finance relationships and required gross components.
- Source identity + role + direction + effective date + version + idempotency fingerprint; reversal/repost of corrections including explicit zero-clear.
- Real two-tenant signed PostgreSQL16 acceptance with no cash sessions or cash movements under ON and OFF settings; verify complete journal/audit/outbox consistency and race/idempotent recovery.

### Stage 4 — Finance sources and contextual React actions

- Lender/Borrower loans use typed agreements, attributed principal and independent interest policy.
- Owner uses explicit capital/drawings and legacy classification decisions, with no accidental new debt for owner contribution.
- Payee uses expense liability/source settlement per D07, not untyped vendor AP or unrelated loan.
- Cross-role settlement must be explicit, separately authorized, balanced and auditable; no silent role-to-role setoff.
- Actual Cash/Bank/MFS movements delegate to MOD-005/MOD-006 policy and posting owners. React dialogs use authenticated server results and preserve draft/focus semantics on failure.

### Stage 5 — Server privacy hardening and release

- Design **Nest API** V1 read/write-response lockdown independently of any Vue migration. If a compatibility contract would break other deployed consumers, surface the impact for an explicit server rollout decision; it does not create a Vue-development prerequisite.
- Direct signed raw HTTP negative tests for role-limited views, profile/global history, cross-role metadata, DELETE, status, create/edit echoes and two tenants. Keep backend global history/source-deletion guard correct.
- React → Nest → isolated PostgreSQL16 E2E: mobile/tablet/desktop, keyboard/touch, bilingual, 7 roles, missing/withheld, posted/corrected, session ON/OFF, 401/403/409, aborted/late responses, retry and reconciliation.
- Owner explicitly approves activation and merges after independent review. Never deploy from this design PR.

## Review focus and unresolved decisions

- **Owner funds classification:** Existing `OWNER_CURRENT_ACCOUNT` cannot silently be reclassified as true contributed equity. Resolve capital/drawings policy and opening history with D08.
- **Interest:** Paid lender interest may reuse an existing Expense source if verified; accrued lender interest requires D07 and borrower interest needs separately justified income/recognition. Don't invent interest postings.
- **Vendor meaning:** Current HisabIQ vendor goods taken *and* goods given/issued may not match Nest current payable-only semantics.
- **Gross historical components:** A single signed `balance.netMinor` does not establish gross receivable and advance obligations or the source documents that created them.
- **Permissions and privacy:** Role-specific read is not authorization to see NID or party-wide posted history; global deletion remains server-authoritative.
- **Shared migration ownership:** Finance MOD-006, cash MOD-005, D07 expense, and MOD-004 identity must not concurrently write chart, migration numbers, common Party contracts or ledger writer source files.

## Superpowers and QA contract

Every **future implementation** requires current `/super-build` per `AGENTS.md`, source-pinned isolated GitHub branch, test-first RED→GREEN, exact executable commands/results, full affected suites, Node typecheck/lint/build/boundary checks, signed disposable PostgreSQL16 non-owner RLS and relevant Playwright; independent financial/security code review and explicit merge approval. The ChatGPT-assisted launcher is only a verification harness, not a substitute for real accounting/DB/browser tests. A missing runner is **BLOCKED**, never silently downgraded.

**This draft only produces an architecture proposal and tracking issue.** No tests were run or claimed as part of this documentation-only step.
