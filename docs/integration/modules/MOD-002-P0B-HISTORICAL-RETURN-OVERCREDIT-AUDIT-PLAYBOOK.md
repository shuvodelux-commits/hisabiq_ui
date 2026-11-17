# MOD-002 P0-B — Historical partial-return overcredit audit (READ-ONLY DESIGN; NOT EXECUTED)

> **BLOCKED FOR REAL TENANT DATA.** This document is a source-pinned **read-only audit proposal and SQL template**, not an executed report, a production query, permission to access an existing customer database, or authorization to correct accounting entries. No real-tenant or synthetic PostgreSQL query was run while preparing this packet. The user-approved **Option A zero-poisha stock-return behavior** and the forward-looking posted-money repair are already merged in the NestSherERP adoption branch; this task concerns *potential historical differences only*. There is no evidence here that any tenant actually has affected historical records.

**Tracking:** [backend issue #44 — blocked historical audit](https://github.com/shuvodelux-commits/nestshererp/issues/44), [closed original backend bug #36](https://github.com/shuvodelux-commits/nestshererp/issues/36), [merged implementation PR #43](https://github.com/shuvodelux-commits/nestshererp/pull/43), [merged source-to-fix plan PR #396](https://github.com/shuvodelux-commits/hisabiq_ui/pull/396), [current MOD-002 P0-A audit](MOD-002-P0-RETURN-MONETARY-RECONCILIATION-REMEDIATION-PLAN.md). The distinct [MOD-002 R02 gate](https://github.com/shuvodelux-commits/hisabiq_ui/issues/389) concerns *implementation acceptance*, not authorized history inspection.

**Immutable source baseline for this proposal:**
- Backend: [nestshererp adoption at 9b89ae17a82172ff7712b4d1a2bf2106c14527b2](https://github.com/shuvodelux-commits/nestshererp/tree/9b89ae17a82172ff7712b4d1a2bf2106c14527b2), containing merged PR #43.
- Frontend: [hisabiq_ui main at 2dc9293009333583fad19bc500746f2cf9f75e61](https://github.com/shuvodelux-commits/hisabiq_ui/tree/2dc9293009333583fad19bc500746f2cf9f75e61).
- Source of truth: [schema](https://github.com/shuvodelux-commits/nestshererp/blob/9b89ae17a82172ff7712b4d1a2bf2106c14527b2/packages/adapter-postgres/src/schema.ts), [sale return repository](https://github.com/shuvodelux-commits/nestshererp/blob/9b89ae17a82172ff7712b4d1a2bf2106c14527b2/packages/adapter-postgres/src/sales-return-repository.ts), [purchase return repository](https://github.com/shuvodelux-commits/nestshererp/blob/9b89ae17a82172ff7712b4d1a2bf2106c14527b2/packages/adapter-postgres/src/purchase-return-repository.ts), [sales calculation](https://github.com/shuvodelux-commits/nestshererp/blob/9b89ae17a82172ff7712b4d1a2bf2106c14527b2/packages/core-domain/src/sales/sales-return.ts), [purchase calculation](https://github.com/shuvodelux-commits/nestshererp/blob/9b89ae17a82172ff7712b4d1a2bf2106c14527b2/packages/core-domain/src/purchasing/purchase-return.ts), [sales origins](https://github.com/shuvodelux-commits/nestshererp/blob/9b89ae17a82172ff7712b4d1a2bf2106c14527b2/packages/core-application/src/returns/create-sales-return-service.ts), and [migrations 0027](https://github.com/shuvodelux-commits/nestshererp/blob/9b89ae17a82172ff7712b4d1a2bf2106c14527b2/migrations/0027_sales_returns.sql) / [0028](https://github.com/shuvodelux-commits/nestshererp/blob/9b89ae17a82172ff7712b4d1a2bf2106c14527b2/migrations/0028_purchase_returns.sql).

## 1. Scope, source truth and responsibilities

1. **REUSE existing backend facts.** Original sale line quantity, posted net and cost are on sale_lines; original supplier quantity, line gross, allocated discount and actual lot unit cost are on purchase_lines. Do not estimate original net using the current Product price.
2. **REUSE existing posted history.** sales_return_lines and purchase_return_lines contain the real posted quantity, value_minor and cost_minor. Parent sales_returns and purchase_returns control status and soft-delete. Only POSTED and non-deleted parents count toward live returned values; VOIDED parents remain available for audit but do not add to current net returned totals.
3. **EXTEND only an audit *proposal*.** This document proposes two single-tenant, bounded, aggregate-only SELECT templates and synthetic test vectors. It does not add a server API, report page, SQL migration, background task, user permission, or persistent report table.
4. **BLOCKED until owner permission.** Any connection to a real tenant DB or backup, any database scan, deployment, ledger adjustment, or direct customer-level report is outside this work. No change to HisabIQ React UI or to the already merged return behavior.
5. **Do not conflate money with cost.** For sales, source line net is the customer's value, whereas posted original COGS may derive from owned lots, negative stock and/or vendor origin allocations. For purchases, supplier credit is purchase line_total_minor minus discount_share_minor, whereas inventory source cost uses actual_unit_cost and scale-3 quantity, including a distinct landed-cost basis. A cost comparison is a **candidate for CA/source-origin review**, never an automatic discrepancy to settle.
6. **No inferential time classification.** Merge at 2026-11-13 06:31:58 UTC is not proof of the deployment date. A record made after that Git commit may still be from old running code. Do not call a row pre-fix or post-fix without owner-approved **per-environment deployed release and cutover evidence**.
7. **Maintain app-level tenant isolation.** PostgreSQL migrations 0017/0018/0027/0028 enable and FORCE RLS on the relevant source and return tables, with policies bound to app.tenant_id. A server-side non-BYPASSRLS least-privilege identity, parameter-bound tenant filter, and independent tenant authorization are all necessary. RLS alone is not substitute for source-parent joins.
8. **Unresolved parent links need a second, separate aggregate.** The inner joins in the money totals deliberately include only visible same-tenant return parents. They **cannot count** a child row referencing an inaccessible/missing parent; include a separate `NOT EXISTS` check and report those rows separately. If it is nonzero, the source-money counts may be incomplete; halt financial conclusions pending a security/CA review. Also detect `return_line.product_id` mismatch against the original source product, not just source document/lot mismatch.
9. **Existing indexes:** sales_return_lines(tenant_id,sale_line_id), sales_return_lines(tenant_id,return_id,line_no), purchase_return_lines(tenant_id,purchase_line_id), purchase_return_lines(tenant_id,return_id,line_no), plus parent return (tenant_id,sale_id)/(tenant_id,purchase_id). They are present in migrations 0027 and 0028. Verify actual plans, tenant sizes and statement budgets before any authorized execution; avoid unbounded joins and report exports.

## 2. Accounting invariants and report definitions

All quantities are the stored **scale-3 integer**; all return values and original net/credit amounts are **whole poisha**. A cost amount is not the same as a customer refund or supplier credit.

| Audit metric | Definition | Interpretation |
|---|---|---|
| source_lines_checked | Unique original source lines with at least one active POSTED return line within the approved tenant | A population size, **not** an affected count |
| posted_return_rows_checked | Count of active POSTED return-line rows in that population | A workload measure, not a count of separate documents |
| overcredited_sales_line_count | Original sale lines for which SUM(POSTED sales return line value_minor) exceeds sale_lines.net_amount_minor | Candidate real money over-credit relative to immutable sale source |
| overcredited_purchase_line_count | Original purchase lines for which SUM(POSTED supplier return line value_minor) exceeds (purchase_lines.line_total_minor − discount_share_minor) | Candidate billed-credit excess |
| max_excess_poisha | Maximum positive source-line excess value in poisha; 0 if none | **Not** an automatically owed refund/correction |
| out_of_bounds_qty_count | Count of unique original lines whose cumulative POSTED returned qty is negative or greater than originally sold/received | Inventory/source exception requiring investigation |
| source_mismatch_line_count | Unique source-line IDs in visible, active POSTED return rows whose source document/product/lot does not match the return's parent or whose original sale/purchase is missing or not POSTED | **Does not include child rows whose return parent is invisible/missing**; those are counted separately below |
| unresolved_parent_return_rows | Return child rows for the selected tenant whose `return_id` has **no visible, same-tenant parent** (regardless of parent POSTED/VOIDED status) | Candidate wrong-tenant reference, missing parent, or RLS invisibility; **not** proof of orphaned data. Never silently discard them. |
| zero_poisha_positive_qty_count | POSTED return-line rows whose qty is positive and value_minor = 0 | **Legitimate under approved Option A**; never report as fraud or accounting error by itself |
| candidate_cost_review_count | Source lines where cost posted on returns is greater than the available initial source-cost estimate or origin/lot valuation cannot be proved comparable | **Triage only**, not a definitive liability |
| source_head_mismatch_count | Parent return header value differs from the sum of its line values, in a separately reviewed query | Must be validated before concluding a source-line anomaly is complete |

**Quantity and money tests:** for each source line with original Q and posted amount A, calculated R = SUM(active return-line qty) and B = SUM(active return-line value_minor). Flag B > A, R > Q, R < 0, or mismatch. An already overposted history may have B > A while R <= Q. A return of qty > 0 and value = 0 is valid with no extra money, and cost may independently be positive. **Do not net VOIDED and POSTED rows indiscriminately or sum parent document money once for each child line.**

**Cost caution:** the sale line's cost_minor is a source-line COGS starting reference, not proof all returned inventory cost shares are comparable for mixed OWNED/VENDOR allocations. See sale_line_source_allocations, sale_source_allocation_reversals, lot_consumptions and cost adjustments. Purchase actual_unit_cost is expressed as a **scale-4 price** and purchase qty as **scale-3**. The current domain's original full-line stock-cost estimate is round-half-up(actual_unit_cost × qty / 100000). Even if its aggregate differs from historic return cost, check source lot, cost adjustments and valuation identities before escalating. No report should quietly treat source billed value as inventory cost.

## 3. Proposed SQL templates — **NOT EXECUTED**

These are *review-only* SELECT shapes, pinned to the schema above, with a **bound parameter $1 representing a single authorized tenant's exact ID**. They must **never** be copied into a production console as an all-tenants query; do not interpolate tenant IDs into source strings. They do not return source IDs, party names, phones, products, serials, timestamps, or per-document data. Review query plans with qualified database staff and an explicitly approved synthetic target *before* any execution.

**Future controlled execution protocol, subject to separate approval:** verify explicit DB host/name against a strict allowlist and role without SUPERUSER/BYPASSRLS; verify RLS and role privileges; use a new connection with a named synthetic tenant and a parameterized driver; start BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY; set a small LOCAL statement_timeout, lock_timeout, and application_name; set transaction-local app.tenant_id using a bound parameter; run one aggregate at a time, verify the result contains no source identifiers, then ROLLBACK. Disallow COPY, temp persistence, source-level logging, CSV dumps, large work_mem and cross-tenant loops. Never use an admin/superuser connection for these RLS tests.

### 3A. Sales value, quantity, and mismatched source references

~~~sql
-- TEMPLATE ONLY. NOT EXECUTED. $1 = one explicitly authorized tenant ID.
-- The transaction must already be READ ONLY + REPEATABLE READ with app.tenant_id
-- set to exactly the same authorized tenant using a separate parameterized call.
WITH active AS (
  SELECT
    rl.tenant_id, rl.sale_line_id,
    SUM(rl.qty::numeric) AS returned_qty,
    SUM(rl.value_minor::numeric) AS returned_value_minor,
    SUM(rl.cost_minor::numeric) AS returned_cost_minor,
    COUNT(*)::bigint AS return_row_count,
    COUNT(*) FILTER (
      WHERE sl.id IS NULL OR sr.sale_id IS DISTINCT FROM sl.sale_id
         OR rl.product_id IS DISTINCT FROM sl.product_id
         OR s.id IS NULL OR s.status <> 'POSTED' OR s.deleted_at IS NOT NULL
    )::bigint AS mismatched_row_count,
    COUNT(*) FILTER (
      WHERE rl.qty > 0 AND rl.value_minor = 0
    )::bigint AS zero_value_qty_rows
  FROM sales_return_lines rl
  JOIN sales_returns sr
    ON sr.tenant_id = rl.tenant_id AND sr.id = rl.return_id
  LEFT JOIN sale_lines sl
    ON sl.tenant_id = rl.tenant_id AND sl.id = rl.sale_line_id
  LEFT JOIN sales s
    ON s.tenant_id = sl.tenant_id AND s.id = sl.sale_id
  WHERE rl.tenant_id = $1::char(26) AND sr.tenant_id = $1::char(26)
    AND sr.status = 'POSTED' AND sr.deleted_at IS NULL
  GROUP BY rl.tenant_id, rl.sale_line_id
)
SELECT
  COUNT(*)::bigint AS source_lines_checked,
  COALESCE(SUM(a.return_row_count), 0)::bigint AS posted_return_rows_checked,
  COUNT(*) FILTER (
    WHERE sl.id IS NOT NULL AND a.returned_value_minor > sl.net_amount_minor
  )::bigint AS overcredited_sales_line_count,
  COALESCE(MAX(
    CASE WHEN sl.id IS NULL THEN NULL
         ELSE GREATEST(a.returned_value_minor - sl.net_amount_minor, 0)
    END
  ), 0)::numeric AS max_excess_poisha,
  COUNT(*) FILTER (
    WHERE sl.id IS NOT NULL
      AND (a.returned_qty > sl.qty OR a.returned_qty < 0)
  )::bigint AS out_of_bounds_qty_count,
  COUNT(*) FILTER (
    WHERE a.mismatched_row_count > 0
  )::bigint AS source_mismatch_line_count,
  -- Correlated to one tenant only; covers child rows hidden by the INNER JOIN
  -- to the parent above. This is a count of *invisible/missing same-tenant*
  -- parent links, NOT proof of orphans and not a customer-document listing.
  (
    SELECT COUNT(*)::bigint FROM sales_return_lines orphan
    WHERE orphan.tenant_id = $1::char(26)
      AND NOT EXISTS (
        SELECT 1 FROM sales_returns visible_parent
        WHERE visible_parent.tenant_id = orphan.tenant_id
          AND visible_parent.id = orphan.return_id
      )
  ) AS unresolved_parent_return_rows,
  COALESCE(SUM(a.zero_value_qty_rows), 0)::bigint
    AS zero_poisha_positive_qty_count,
  COUNT(*) FILTER (
    WHERE sl.id IS NOT NULL AND a.returned_cost_minor > sl.cost_minor
  )::bigint AS candidate_cost_review_count
FROM active a
LEFT JOIN sale_lines sl
  ON sl.tenant_id = a.tenant_id AND sl.id = a.sale_line_id
WHERE a.tenant_id = $1::char(26);
~~~

### 3B. Supplier billed-credit value, quantity, and candidate lot cost

~~~sql
-- TEMPLATE ONLY. NOT EXECUTED. $1 = the same single authorized tenant ID.
WITH active AS (
  SELECT
    rl.tenant_id, rl.purchase_line_id,
    SUM(rl.qty::numeric) AS returned_qty,
    SUM(rl.value_minor::numeric) AS returned_value_minor,
    SUM(rl.cost_minor::numeric) AS returned_cost_minor,
    COUNT(*)::bigint AS return_row_count,
    COUNT(*) FILTER (
      WHERE pl.id IS NULL OR pr.purchase_id IS DISTINCT FROM pl.purchase_id
         OR rl.product_id IS DISTINCT FROM pl.product_id
         OR p.id IS NULL OR p.status <> 'POSTED' OR p.deleted_at IS NOT NULL
         OR rl.lot_id IS DISTINCT FROM pl.lot_id
    )::bigint AS mismatched_row_count,
    COUNT(*) FILTER (
      WHERE rl.qty > 0 AND rl.value_minor = 0
    )::bigint AS zero_value_qty_rows
  FROM purchase_return_lines rl
  JOIN purchase_returns pr
    ON pr.tenant_id = rl.tenant_id AND pr.id = rl.return_id
  LEFT JOIN purchase_lines pl
    ON pl.tenant_id = rl.tenant_id AND pl.id = rl.purchase_line_id
  LEFT JOIN purchases p
    ON p.tenant_id = pl.tenant_id AND p.id = pl.purchase_id
  WHERE rl.tenant_id = $1::char(26) AND pr.tenant_id = $1::char(26)
    AND pr.status = 'POSTED' AND pr.deleted_at IS NULL
  GROUP BY rl.tenant_id, rl.purchase_line_id
)
SELECT
  COUNT(*)::bigint AS source_lines_checked,
  COALESCE(SUM(a.return_row_count), 0)::bigint AS posted_return_rows_checked,
  COUNT(*) FILTER (
    WHERE pl.id IS NOT NULL
      AND a.returned_value_minor >
          (pl.line_total_minor::numeric - pl.discount_share_minor::numeric)
  )::bigint AS overcredited_purchase_line_count,
  COALESCE(MAX(
    CASE WHEN pl.id IS NULL THEN NULL
         ELSE GREATEST(
           a.returned_value_minor -
           (pl.line_total_minor::numeric - pl.discount_share_minor::numeric), 0
         )
    END
  ), 0)::numeric AS max_excess_poisha,
  COUNT(*) FILTER (
    WHERE pl.id IS NOT NULL
      AND (a.returned_qty > pl.qty OR a.returned_qty < 0)
  )::bigint AS out_of_bounds_qty_count,
  COUNT(*) FILTER (
    WHERE a.mismatched_row_count > 0
  )::bigint AS source_mismatch_line_count,
  (
    SELECT COUNT(*)::bigint FROM purchase_return_lines orphan
    WHERE orphan.tenant_id = $1::char(26)
      AND NOT EXISTS (
        SELECT 1 FROM purchase_returns visible_parent
        WHERE visible_parent.tenant_id = orphan.tenant_id
          AND visible_parent.id = orphan.return_id
      )
  ) AS unresolved_parent_return_rows,
  COALESCE(SUM(a.zero_value_qty_rows), 0)::bigint
    AS zero_poisha_positive_qty_count,
  COUNT(*) FILTER (
    WHERE pl.id IS NOT NULL
      AND a.returned_cost_minor >
        FLOOR(
          (pl.actual_unit_cost::numeric * pl.qty::numeric + 50000::numeric)
          / 100000::numeric
        )
  )::bigint AS candidate_cost_review_count
FROM active a
LEFT JOIN purchase_lines pl
  ON pl.tenant_id = a.tenant_id AND pl.id = a.purchase_line_id
WHERE a.tenant_id = $1::char(26);
~~~

**SQL review notes:** Both queries report **tenant aggregate counts only**. If `unresolved_parent_return_rows > 0`, the visible POSTED-parent population may be incomplete; any financial clearance/conclusion must stop, rather than assuming an INNER JOIN proves that no other child rows exist. The purchase cost estimate intentionally matches the current half-up original full-quantity lotCost formula but does **not** establish a universal cost pool or accounting correction. The aggregation deliberately includes source-mismatched active return lines as separate exceptions instead of silently filtering them out. Parent-total-to-child-total reconciliation is an additional bounded and tenant-scoped *future* query, not performed here. Parent VOIDED rows are excluded from *current posted net*; a separate reversible-history review must inspect their audit trail if an exception is proven.

## 4. Synthetic-only acceptance vectors — proposed, NOT run

| Scenario | Sample source and events | Expected classification |
|---|---|---|
| Normal original full return | 5 Pcs / 3 poisha; [1,0,1,0,1] returned value for five 1-Pcs POSTED documents | 0 overcredit, 0 qty excess; two legal zero-poisha return rows |
| Legacy candidate over-credit | 5 Pcs / 3 poisha; [1,1,1,1,1] returned value, POSTED | One candidate overcredit source line; excess **2 poisha**; quantity remains within Q |
| Supplier mirror | Purchase billed net 3 poisha for 5 Pcs; five 1-poisha POSTED supplier credits | One candidate supplier overcredit line, max excess 2 poisha |
| VOID and repost | One 1-poisha return VOIDED, correctly replaced by a POSTED document | The VOIDED contribution excluded; no mistaken double credit |
| Zero poisha with actual original cost | A valid quantity return has 0 poisha customer/supplier value but costMinor > 0 | Legal value; cost reviewed under its independent source/lot valuation rules |
| Zero poisha without any cost | Original source amount and cost are 0; qty positive | Legitimate Option A case; no fake ledger value |
| Source mismatch / missing original | One POSTED return line points to a source not owned by the return's parent, has the wrong product/lot, or has a missing original | Source mismatch counter increments; cannot be treated as a valid monetary cap |
| Return child parent belongs to another tenant | A synthetic child row for tenant A references a synthetically seeded parent owned by tenant B; foreign key refers to the global parent ID only | Tenant A's `unresolved_parent_return_rows` increments; financial totals do not wrongly claim complete coverage |
| Tenant isolation | Tenant A and tenant B have otherwise identical fixture values | Each authorized RLS session sees **only its own** counts; never a total across tenants |
| Cost-layer difference | Supplier landed cost differs from billed credit due to extra landed charge | No inference of over-credit from inventory cost alone |
| Duplicate original return line | Two POSTED return lines against the same original source line | Both actual amounts contribute to the cap; no distinct-parent-row multiplication |

**Synthetic execution approval boundary:** The owner must first explicitly approve *the exact disposable DB name/container, local binding, synthetic tenant fixture, SQL read-only role, and test command*. Only then may an executor create that disposable PG16 dataset and execute an audited query. This documentation PR does not run SQL, connect to any database, or create fixtures. A request to execute these templates against a snapshot of customer records requires a **separate** privacy/security and tenant-scope authorization after the synthetic stage.

## 4A. Exact synthetic-only execution request — **PROPOSED, NOT APPROVED**

The following scope is proposed for **separate explicit owner authorization**, not inferred from merging this document or the instruction to continue planning. The authorized computer is CachyOS with Podman; it presently has the local `postgres:16-alpine` image. The proposed local port was free when checked, but must be checked **again before running**.

| Required input | Exact proposed value / restriction |
|---|---|
| Physical machine | Existing authorized CachyOS development PC, **not a server** |
| Runtime | Existing cached `docker.io/library/postgres:16-alpine` image, PostgreSQL 16, Podman `--rm` and `--tmpfs /var/lib/postgresql/data:rw,size=512m`; prohibit mounting production volumes, home folders, SSH keys, or cloud credentials |
| Container name | `hisabiq-issue44-synthetic-pg16-20261113` |
| Bind | `127.0.0.1:55544:5432` only; abort if the port or container name is already occupied |
| Disposable database | `hisabiq_issue44_synthetic_20261113` (a new empty database created only in the new container) |
| Test-app role | `hisabiq_audit_probe_44`, **NOSUPERUSER, NOBYPASSRLS**, not table owner, **SELECT only** on the original source and return tables; no INSERT/UPDATE/DELETE, no privileged role membership |
| Privileged fixture loader | A separately scoped, local-only ephemeral setup identity used **only inside this new disposable container** to install exact source migrations and seed synthetic fixtures, not to run aggregate audits |
| Synthetic tenants | Exactly two **fixed fabricated** ULIDs, tenant A = `01H0000000000000000000000A` and tenant B = `01H0000000000000000000000B` (both exactly 26 Crockford-base32 characters); **no customer IDs, exports, logs, backups, or sample data from HisabIQ users** |
| Synthetic return cases | 5 Pcs / 3 poisha correct `[1,0,1,0,1]`; legacy overcredit `[1,1,1,1,1]`; zero-value stock with/without cost; VOIDED ignored; mismatched source/product/lot; cross-tenant child-to-parent reference; independently valued landed-cost difference |
| Read transaction | `BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY`, call `SELECT set_config('app.tenant_id', $1, true)` inside the transaction using the **same bound tenant value** supplied to the audit queries, set `statement_timeout='5s'`, `lock_timeout='1s'` and `work_mem='4MB'`, then **ROLLBACK** |
| Commands to approve | **(1)** a checked `podman run --rm --name hisabiq-issue44-synthetic-pg16-20261113 --tmpfs /var/lib/postgresql/data:rw,size=512m -p 127.0.0.1:55544:5432` with image above and locally generated non-logged secret; **(2)** a Node 20 + PostgreSQL 16 isolated, synthetic-only Vitest/psql harness, **to be authored and reviewed before use**, running **only** the two parameter-bound query templates and their assertions; **(3)** `podman stop hisabiq-issue44-synthetic-pg16-20261113` and verify automatic deletion. No shell command is authorized until the precise finished test source and command are reviewed. |

**Two-stage gate:** First the owner approves the *exact synthetic-only parameters* above and explicitly authorizes preparation of isolated test fixtures and test code on a new branch. The executor then presents the **finished exact test command**, role checks, expected per-tenant counts, and explicit safeguards for approval **before any SQL is run**. Any production, historical tenant clone or snapshot access remains prohibited even if synthetic testing later passes. If role isolation, timeout or tenant pinning cannot be proven, abort the test.

---

## 5. What a safe result can and cannot conclude

If future authorized synthetic execution matches the expected counts, it establishes only that the template computes its designed metrics against synthetic fixtures. It does **not** mean any real customer historical problem exists, or that none exists. Real customer totals must not be inferred from repository commits, issue descriptions, sample calculations, or synthetic reports.

If a future **separately approved** real tenant read finds an excess, first independently reconcile original posted source-line money, return-line and return-parent history, void/repost sequence, currency rounding and correct cost origin. Do not mutate a posted source, bypass a closed period, edit journal lines in place, or compensate without owner/CA approval. Proposed correction is a distinct append-only, source-linked, idempotent adjustment with permission checks, reason/approver, double-entry conservation, stock-origin impact preview, audit/outbox, read-after-write reconciliation and a documented rollback/counter-adjustment policy. Details are intentionally **not specified or implemented** until source evidence exists and the owner approves.

## 6. Exit state and handoff

**This task's successful deliverable is the reviewable, source-linked, tenant-bounded SQL audit design above; status remains BLOCKED for execution.** No application code, schema, UI, migrations, CI, Postgres instance, tenant records or financial postings are changed. An issue/PR merge would approve the **documentation only**. It would not authorize a real historical census, DB connection, backfill, financial correction, deployment, or D16 unit-source/rounding policy.
