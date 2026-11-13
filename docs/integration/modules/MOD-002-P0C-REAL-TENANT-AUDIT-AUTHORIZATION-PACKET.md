# MOD-002 P0-C — Real-tenant historical return audit: authorization and reconciliation gates

**Status: PROPOSAL / NOT AUTHORIZED FOR REAL DATA.** Scope: one tenant at a time, read-only accounting evidence; no application build, UI work, data scan, production connection, backup export, SQL execution, financial posting, migration, correction, or deployment is approved by this document. [Backend issue #44](https://github.com/shuvodelux-commits/nestshererp/issues/44) remains OPEN and **Blocked**. Draft PR review does not open an execution gate.

## 1. Source-backed facts and non-claims

- Canonical query definitions are in [MOD-002 P0-B historical return audit playbook](MOD-002-P0B-HISTORICAL-RETURN-OVERCREDIT-AUDIT-PLAYBOOK.md), merged through frontend [PR #404](https://github.com/shuvodelux-commits/hisabiq_ui/pull/404) and [PR #407](https://github.com/shuvodelux-commits/hisabiq_ui/pull/407). That playbook defines tenant aggregate-only SELECT shapes, not a production auditor.
- Backend adoption [PR #43](https://github.com/shuvodelux-commits/nestshererp/pull/43) fixed *future* posted-return monetary allocation, preserving legitimate positive-quantity, zero-poisha returns. This does not establish that old customer history is correct or incorrect.
- The synthetic-only fixture [backend PR #47](https://github.com/shuvodelux-commits/nestshererp/pull/47) and migration-path fix [PR #48](https://github.com/shuvodelux-commits/nestshererp/pull/48) were merged into adoption. The **last specifically approved and actually SQL-tested backend SHA** was d9f874001a17aec757649b07974a76cc9d0e4df8: on 2026-11-13 the disposable PostgreSQL 16 test reported **5/5 passing, exit 0**, two fabricated tenants only, with container and port removed afterward. No real tenant was audited.
- At drafting, the *then-current* backend adoption branch pointed to 22b6fbf534a1c69419d1630599a9d4a055af7614, which differs from the synthetic-tested SHA; frontend main was ef4e040f14322a3af5aa86a2c31feb71d5b97521. Reverify both heads, affected source files, schema migrations, and deployed release before future use. Passing test results at an older SHA do not certify intervening backend changes.
- Source schema: NestSherERP migrations 0017_purchases.sql, 0018_sales.sql, 0027_sales_returns.sql, 0028_purchase_returns.sql and adapter-postgres return repositories. Original sale line net is **sale_lines.net_amount_minor**; original purchase billed net is **purchase_lines.line_total_minor minus discount_share_minor**. Return-line value and cost are separate facts. Quantity is scale-3, money is whole poisha, purchase actual_unit_cost is scale-4.
- Journal/reversal linkage must be verified independently in the backend sales-return and purchase-return repositories, money repository, and journal_entries/journal_lines; posted return headers and lines alone cannot prove balances. Git commit time is **not** a deployment or pre-fix cutover timestamp.
- There is **no evidence** from the synthetic-only test that any real tenant has overcredited, correctly credited, or otherwise affected historical records.

## 2. Scope classification — no change to financial production behavior

| Area | Decision | Implication |
|---|---|---|
| Existing posted source and return line aggregates | **REUSE — review-only** | May serve as *candidate screening* after a separate, explicit real-data authorization |
| Tenant identity, database target, release/cutover proof | **BLOCKED** | Owner and platform DBA must supply verified, specific scope; never infer from current git head or user location |
| Read-only access and review of row-level security | **ADAPT / PREPARE ONLY** | Need a dedicated audited identity, external tenant authorization, least privilege and approved data environment |
| Return header-to-line and journal/reversal reconciliation | **EXTEND PLAN — not implemented** | These independent, bounded queries need review and synthetic tests before any real-data use |
| Source-level, party-level evidence and accounting adjustments | **BLOCKED** | Later separate owner/privacy/CA decision; no direct edits or automatic liability calculation |
| Existing HisabIQ React UI, backend posting, app roles, migrations | **PRESERVE** | No UI changes, source writes, migration, deployment or tests against live tenant data in this packet |

## 3. Mandatory owner-and-DBA authorization record

Before **any** operation involving a real tenant database or even a tenant backup, create a private, access-controlled record with all of the following; the public GitHub PR/issue contains only an opaque approval reference, never credentials, real tenant IDs, PII or query result particulars.

1. **Tenant and right to inspect:** one exact tenant ULID, verified business/owner authorization, proof that the request is permitted for that tenant, and named authorized operators.
2. **Environment allowlist:** exact environment, immutable DB instance identity, database name, hostname/port fingerprint, production vs read replica vs customer-data backup, and network path. No fallback/default connection string. A restored customer backup is **real customer data**, not synthetic and needs the same authorization.
3. **Purpose and boundaries:** specifically historical sales returns and/or purchase returns; minimum necessary period or explicitly approved all-history aggregate census; approved scope of tables and metrics. The existing P0-B aggregates lack a *date predicate*, so they cannot truthfully claim to audit a bounded date window without revising and retesting the SQL.
4. **Source and release evidence:** actual deployed build identifier, per-environment last-old/new release timestamps with uncertainty, database schema version, and observed return writing paths including offline-sync versions. If unverifiable, label periods **UNKNOWN**, never “pre-fix” or “post-fix”.
5. **Data privacy and retention:** permitted aggregate output, destination, encryption/access permissions, minimum retention/deletion date and secure incident channel. Restrict even small counts from public GitHub; never export raw rows without a new separate approval.
6. **Approvals:** owner permission for one exact environment and tenant, DBA/security review of role and query plan, and accounting/CA approval of interpretation rules. Pin reviewed query hash, source/backend Git SHA, command, and a non-PII approval reference. The precise command and execution window are a **second, independent gate** after this plan.

**Current authorization values: NOT PROVIDED / NOT APPROVED.** No tenant, date window, DB URL, credentials, replica, exported snapshot or query plan is assumed. Work stops here until these are deliberately supplied and reviewed.

## 4. Production-safe access design: still unimplemented

- **Prefer** an approved read-only replica or secured investigative snapshot where practical, but obtain real-data authorization first. Check replica lag, restore point, schema compatibility, foreign keys, and snapshot consistency. Do not imply replicas guarantee perfectly consistent data without a verified snapshot boundary.
- A platform DBA must independently provision or attest a short-lived **non-owner, NOSUPERUSER, NOBYPASSRLS, SELECT-only** account. Review membership/inheritance, default privileges, search_path, extension privileges, ability to create objects, database connection limits and actual allowed tables. **Creating or changing a role is DDL** and requires its own approval; it is not authorized by a “read-only audit” instruction.
- The application policy compares tenant_id to a custom session GUC, app.tenant_id. **A tenant GUC is not proof of authorization:** it can be set by a database login. Bind it to the externally authorized tenant in a trusted execution service, never accept a client-supplied tenant ID without platform membership validation. Verify RLS is enabled/forced and the audit role cannot bypass it.
- Supply the *same* authorized tenant as a driver-bound parameter and transaction-local app.tenant_id, with every join scoped by tenant_id. Reject SQL templates without bound tenant filters and reject return parent mismatches, inaccessible parents, or missing source links.
- One statement family per **BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY**; use LOCAL statement_timeout and lock_timeout, application_name, bounded work_mem; rollback on success or failure. Prohibit SELECT * of PII, COPY, temp persistence, multi-tenant loops, files, DML, DDL, data exports and connection reuse across tenants.
- Plan for resource impact: on authorized environment first review **EXPLAIN without ANALYZE** and indexed join shapes under DBA supervision; cap runtime and cancel on threshold. **EXPLAIN is itself a real-data environment interaction** requiring authorization. Do not run EXPLAIN ANALYZE or full SQL on production merely to estimate cost.
- Record only a non-PII audit event: approval reference, query SHA, environment alias, chosen scope fingerprint, runtime, row-count metrics or restricted result reference, reviewer and outcome. Avoid SQL bind values and DB passwords in shell history, CI output or shared logs. Immediately revoke time-limited access following the approved audit.

## 5. Proposed exact inspection sequence — each step independently gated

**Gate A — documentation now (THIS PR):** review this packet and mark planning accepted. No real-data operations.

**Gate B — access/cutover/SQL review (NOT AUTHORIZED):** gather the six private fields above; inventory live source schema and actual deployed cutover; DBA/security/CA check query semantics, RLS, permissions, execution plan and privacy. Review any revised query with synthetic fixture tests only under a separately scoped authorization.

**Gate C — first real-tenant aggregate census (NOT AUTHORIZED):** only after a separate owner approval of **one pinned executable command**, one tenant and one environment, perform the existing P0-B sales and purchase *aggregate-only* queries. No return document IDs, names, phone numbers, product names, invoice rows, serials or transaction dates in output. Monitor/rollback; record immutable scope and redacted results privately.

**Gate D — accounting completeness (NOT AUTHORIZED):** before asserting a “clean” census, separately prove same-tenant header-to-child totals, posted vs voided/reversal treatment, settlement vs refund/payment flow, source-document continuity, journal-to-return reconciliation and double-entry balance, movement/cost-origin trail and missing/inaccessible links. Design these **additional** queries and tests for review; the synthetic 5/5 pass does not exercise this end-to-end cross-system audit.

**Gate E — targeted evidence / corrective decision (NOT AUTHORIZED):** if exceptions exist, ask for a new privacy/CA approval before source-level detail. Reconcile original sale/purchase, return document, cash/bank/MFS or credit settlement, journal entry, stock move, lot and subsequent void/reversal at the correct effective dates. Prepare a documented *append-only, source-linked* correction proposal with separately approved amounts. Never rewrite posted source amounts, quietly net a voided return, create duplicate liabilities or automatically pay/refund based on candidate aggregates.

If any required evidence is absent, **STOP: INCONCLUSIVE**, not “passed”.

## 6. Exception taxonomy and decision boundaries

| Code | Candidate condition | Action / interpretation |
|---|---|---|
| MONEY-S | Sum of active POSTED sales return-line value exceeds source sale line net | Candidate customer value overcredit; confirm header, journal, settlement and void history before conclusions |
| MONEY-P | Sum of active POSTED purchase return-line value exceeds source billed net after line discount | Candidate supplier-credit excess; do not count landed costs as supplier credit |
| QTY | Cumulative active returned quantity exceeds original line qty or negative invariant | Investigate stock reversals and source identity |
| SRC | Return-line source document, original product, purchase lot, or source status mismatch | Halt source-line clearance until independently reconciled |
| PARENT | Return child references no visible same-tenant parent | Halt aggregate completeness; may be wrong-tenant reference or RLS invisibility, not necessarily orphan |
| HDR | Return header value/cost/settlement inconsistent with its children | **Additional reviewed query required**; not proved by existing P0-B aggregates |
| JOURNAL | Missing, duplicate or unequal journal/reversal/settlement posting | **Additional reviewed query required**; no balance clearance without it |
| STOCK-COST | Return inventory cost differs from reliable origin allocation/lot valuation | Cost and valuation investigation, not automatic money overcredit |
| ZERO | Positive quantity with zero-poisha return value | Explicitly legitimate Option A unless independent contradictory evidence exists |
| CUTOVER-UNKNOWN | Actual deployed writer/fix timestamp unproven or offline writer mixed | Never label records old/new by Git merge timestamp alone |

**Aggregate verdicts:** (1) **SCREENING_EXCEPTION** with restricted counts; (2) **SCREENING_NO_EXCEPTION** only for the tested value/qty/link metrics, **not** accounting clearance; (3) **INCONCLUSIVE** when missing links, incomplete schema, access/replica proof, unresolved RLS role facts, insufficient period evidence, or query errors. **ACCOUNTING_CLEARED** may be asserted only after Gate D independent reconciliation and CA signoff, with scope explicitly named. No real-tenant verdict exists yet.

## 7. Safe deliverables and exit criteria

- This task delivers **this draft authorization packet only**, linked to backend issue #44. It does not modify backend code, add an endpoint, execute a test, connect to PostgreSQL or alter the HisabIQ UI.
- Reviewer checks: correspondence to approved P0-B aggregates and tested synthetic SHA, no invented tenant/time window/release, no inline credentials or personal records, explicit separation of monetary value vs inventory cost, independent header/journal/void review, exactly one externally authorized tenant, no accidental approval of SQL execution.
- Next owner decision: **approve this planning packet only**. Afterward the owner can authorize a narrowly scoped, separate **non-executing access/SQL review** with named environment and tenant in a private channel. Any real-data execution requires a further explicit permission for its exact command and source revision. Real-tenant data and any ledger correction remain **Blocked** on issue #44.
