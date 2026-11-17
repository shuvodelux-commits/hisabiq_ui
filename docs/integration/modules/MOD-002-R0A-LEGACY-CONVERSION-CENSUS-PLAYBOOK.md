# MOD-002/R0-A — Tenant-safe historical unit-conversion census playbook

> **Status: NOT EXECUTED / AWAITING SEPARATE SNAPSHOT AUTHORIZATION.** This document specifies how an approved operator could perform a **read-only, tenant-scoped** aggregate census on an **authorized disposable non-production PostgreSQL snapshot**. It is **not** permission to access a real tenant DB, restore a customer backup, run any SQL now, export catalog rows, change schema, enable advanced Product posting or approve R1-A financial rules. All figures in this document are expected test examples, not observed tenant counts.

**Source pair as of 2026-11-13 (Asia/Dhaka):**
- HisabIQ UI: `shuvodelux-commits/hisabiq_ui@d10b41caefe13156e789ad58ee9e91692f1b74e9`, after [merged R1-B PR #370](https://github.com/shuvodelux-commits/hisabiq_ui/pull/370).
- Nest adoption: `shuvodelux-commits/nestshererp@54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a`. Source facts below are from this adopted revision. **No connection to any database was made**.

**Depends on:** [R0 caller audit](MOD-002-R0-BACKEND-UNIT-PRICING-SOURCE-AUDIT.md), [R1-A pricing decision proposal](MOD-002-R1A-EXACT-PRICING-ROUNDING-DECISION-PROPOSAL.md), [R1-B conditional structural proposal](MOD-002-R1B-VERSIONED-UNIT-PROFILE-CONTRACT-PROPOSAL.md), [D03 advanced Product gap](MOD-002-ADVANCED-PRODUCT-CONTRACT-D03-REVIEW.md), [DECISIONS](../DECISIONS.md), [REVIEW](../REVIEW.md). Tracking [issue #373](https://github.com/shuvodelux-commits/hisabiq_ui/issues/373).

## 1. What the migrations actually establish

| Immutable source | Fact proven by repository text | What it **cannot** prove |
|---|---|---|
| [`migrations/0007_catalog_foundations.sql`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/migrations/0007_catalog_foundations.sql) | `units` has global ID, tenant owner, soft-delete and forced tenant RLS. | Whether historic tenant units are active, renamed, valid, orphaned or cross-linked. |
| [`migrations/0008_products.sql`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/migrations/0008_products.sql) | `products` and `product_unit_conversions` have `tenant_id`, soft-delete, forced RLS. Legacy rows have `product_id, unit_id, factor_qty`; `factor_qty` is **scale-3 quantity of base units per legacy conversion unit**. An active-row partial uniqueness index is declared for `(tenant_id, product_id, unit_id)`; positive factor constraint. | Actual installed migration state, rows, foreign-key tenant ownership or present schema drift. Global `REFERENCES products(id)`/`units(id)` does not by itself check the referenced row's tenant matches the child row. |
| [`migrations/0010_product_unit_conversion.sql`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/migrations/0010_product_unit_conversion.sql) | Adds one current `products.conversion_unit_id`/`conversion_factor_qty` pair, requires both-or-neither and non-self positive factor. **Only one-active-legacy-row groups** were backfilled; table deliberately retained. Multiple active historic rows were not projected to one arbitrary alternative. | Whether a particular database ran the migration, kept archived data, or has 2+ row products in practice. |
| [`packages/adapter-postgres/src/product-repository.ts`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/adapter-postgres/src/product-repository.ts) | Current active product read/update uses the **single pair on products**, not the legacy table. | That obsolete table is empty or safe to drop; raw SQL/old releases, old backup payloads and customer-facing history could exist. |
| [`packages/adapter-postgres/src/database.ts`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/adapter-postgres/src/database.ts) and [`unit-of-work.ts`](https://github.com/shuvodelux-commits/nestshererp/blob/54eb8fd1bd4e9ca7e8a389a8b299615b39c6535a/packages/adapter-postgres/src/unit-of-work.ts) | Application scopes transactions using transaction-local `app.tenant_id` for RLS. | That an arbitrary external PostgreSQL client has correct tenant context. Diagnostic queries must set and verify it explicitly. |

**Design boundary:** historical `factor_qty=20000` means **20 base units**, not "20 immediately smaller units" unless the previous order was independently confirmed. When legacy rows say `Box=20 base`, `Carton=240 base`, the numbers imply a ratio 12 **mathematically**, but do **not** establish intended UI display order, labels, default sell unit, buy/sell prices or any historical priced transaction component.

## 2. Who may run the census and where

The following four gates are **all mandatory** before a later execution. As of this PR, each remains **NOT AUTHORIZED**:

1. **Owner permission:** explicit approval naming a disposable snapshot source, logical tenant scope and a designated operator. "Next", merging this document or an issue comment cannot substitute.
2. **Data controller/security permission:** lawful snapshot provenance, limited use, retention/disposal and access audit. Keep copy in an approved private testing environment; do **not** fetch/download tenant data to ChatGPT, GitHub artifacts, PR comments, terminal paste or logs.
3. **DBA preflight:** PostgreSQL schema/version and migration state independently verified, PostgreSQL role without SUPERUSER or BYPASSRLS, RLS not disabled, ability to use transaction-local tenant scope and `BEGIN ... READ ONLY`. Do not use production connection strings, managed production read replicas or backup endpoints merely because queries are read-only.
4. **Scope and outcome:** approved aggregate-only inspection, no raw product/unit names, prices, IDs, serials, parties, user IDs, invoice or stock/financial amounts in issue/PR output. If tenant count is small enough to identify a business, further suppress or coarsen categories before sharing.

### Execution conditions

| Topic | Required guardrail |
|---|---|
| Environment | Isolated restored **non-production** PostgreSQL snapshot; explicit connection identity and disposable DB identifier privately verified by operator |
| Privilege | Least-privilege role, not schema owner/superuser/BYPASSRLS; **FORCE RLS** must remain effective |
| Transaction | Repeatable Read + READ ONLY; no service app or job worker modifying this disposable copy during evidence collection |
| Tenant | One specifically authorized tenant at a time; `app.tenant_id` set **locally inside that transaction**, verified before every SELECT batch |
| Output | Aggregates only, under a small-count suppression policy; row-level anomalies stay private with the authorized data steward |
| Abort | Any missing migration/table, absent tenant session, RLS bypass, wrong database, unexpected privileges, inconsistent totals, query error or nonaggregate output |
| Retention | Snapshot and private raw evidence disposed according to authorization; GitHub receives **redacted aggregates and decision blockers only** |

**Important:** A user with global database visibility can defeat RLS even when `app.tenant_id` is populated. Merely calling `set_config` **is not a security proof**. The operator must independently inspect effective privileges, role attributes and **actual RLS behavior on disposable fixtures**. This document contains templates, **not** a self-verifying security harness.

## 3. Proposed SQL templates — READ ONLY, NOT RUN

The templates below are PostgreSQL SQL intended **only for an approved operator** on the separately authorized disposable snapshot. Parameter syntax `:'tenant_ulid'` is **psql** variable quoting: an approved operator would supply a properly validated 26-character tenant ULID out of band. Do not paste real tenant identifiers into issues. The snippets are intentionally in one transaction. **Do not blindly execute them as a shell script.** The operator must pause after the preflight and verify role, tenant, schema and server identity privately.

### 3.1 Preflight: no bypass, transaction-local tenant

```sql
-- ONLY after written owner + security authorization on a verified disposable DB.
-- This is a template, not proof that the target is non-production.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;

-- psql's :'tenant_ulid' safely quotes the already validated parameter as data.
SELECT set_config('app.tenant_id', :'tenant_ulid', true);

SELECT
  current_user AS executing_role,
  current_setting('transaction_read_only') AS read_only,
  current_setting('row_security') AS row_security,
  current_setting('app.tenant_id', true) AS scoped_tenant,
  (SELECT rolsuper FROM pg_roles WHERE rolname = current_user) AS is_superuser,
  (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user) AS can_bypass_rls,
  to_regclass('public.units') IS NOT NULL AS has_units,
  to_regclass('public.products') IS NOT NULL AS has_products,
  to_regclass('public.product_unit_conversions') IS NOT NULL AS has_legacy_conversions;

-- STOP before further queries if role/scope/read-only/RLS/schema identity fails.
-- Do not continue merely because SELECT succeeded.
```

Expected guardrails: `read_only=on`, `row_security=on`, `is_superuser=false`, `can_bypass_rls=false`, `scoped_tenant` matches the **approved** ULID, and all expected tables exist. `row_security=on` is an additional check, **not** proof a role cannot bypass RLS. Review installed policies and dependencies privately. Do not use `SET ROLE`, `ALTER ROLE`, `DISABLE ROW LEVEL SECURITY`, `COPY`, file export or any write/DDL operation.

### 3.2 Product distribution by number of active legacy rules

```sql
WITH rules_per_product AS (
  SELECT
    c.product_id,
    COUNT(*) FILTER (WHERE c.deleted_at IS NULL) AS active_rules,
    COUNT(*) FILTER (WHERE c.deleted_at IS NOT NULL) AS archived_rules
  FROM product_unit_conversions c
  WHERE c.tenant_id = current_setting('app.tenant_id', true)::char(26)
  GROUP BY c.product_id
)
SELECT
  COUNT(*) AS live_products,
  COUNT(*) FILTER (WHERE COALESCE(r.active_rules, 0) = 0) AS live_products_with_zero_rules,
  COUNT(*) FILTER (WHERE COALESCE(r.active_rules, 0) = 1) AS live_products_with_one_rule,
  COUNT(*) FILTER (WHERE COALESCE(r.active_rules, 0) >= 2) AS live_products_with_multiple_rules,
  COUNT(*) FILTER (WHERE p.conversion_unit_id IS NOT NULL) AS live_products_with_current_pair,
  COALESCE(SUM(r.archived_rules), 0) AS archived_rule_rows_for_live_products
FROM products p
LEFT JOIN rules_per_product r ON r.product_id = p.id
WHERE p.tenant_id = current_setting('app.tenant_id', true)::char(26)
  AND p.deleted_at IS NULL;
```

**Required invariant:** `zero + one + multiple = live_products`. This counts **live Product masters**; it does **not** count orphaned rule rows against deleted masters. Those require a separate visibility/archival check below. No IDs/names/prices should be returned.

### 3.3 Drift between promoted one-rule pair and legacy row

```sql
WITH one_live_rule AS (
  SELECT
    c.product_id,
    MIN(c.unit_id) AS only_unit_id,
    MIN(c.factor_qty) AS only_factor_qty
  FROM product_unit_conversions c
  WHERE c.tenant_id = current_setting('app.tenant_id', true)::char(26)
    AND c.deleted_at IS NULL
  GROUP BY c.product_id
  HAVING COUNT(*) = 1
)
SELECT
  COUNT(*) AS one_rule_currently_live_products,
  COUNT(*) FILTER (
    WHERE p.conversion_unit_id IS NULL
       OR p.conversion_factor_qty IS NULL
  ) AS missing_current_pair,
  COUNT(*) FILTER (
    WHERE p.conversion_unit_id IS DISTINCT FROM r.only_unit_id
       OR p.conversion_factor_qty IS DISTINCT FROM r.only_factor_qty
  ) AS current_pair_not_equal_to_one_legacy_row,
  COUNT(*) FILTER (WHERE p.base_unit_id = r.only_unit_id) AS self_conversion_legacy_rule,
  COUNT(*) FILTER (WHERE r.only_factor_qty <= 0) AS invalid_factor_rule
FROM one_live_rule r
JOIN products p ON p.id = r.product_id
  AND p.tenant_id = current_setting('app.tenant_id', true)::char(26)
WHERE p.deleted_at IS NULL;
```

**Interpretation limit:** differences **do not automatically imply corruption**. A current Product may have been intentionally edited after migration `0010`, which stopped writing the old table. Treat mismatch as **review-needed historical divergence**, not authority to overwrite a current Product or to backfill its price/unit chain.

### 3.4 Referential visibility, soft deletes, self-conversions and duplicate active rules

```sql
WITH rows_in_scope AS (
  SELECT
    c.id, c.product_id, c.unit_id, c.deleted_at,
    c.factor_qty, p.id AS visible_product_id,
    p.base_unit_id, p.deleted_at AS product_deleted_at,
    u.id AS visible_unit_id, u.deleted_at AS unit_deleted_at
  FROM product_unit_conversions c
  LEFT JOIN products p
    ON p.id = c.product_id AND p.tenant_id = c.tenant_id
  LEFT JOIN units u
    ON u.id = c.unit_id AND u.tenant_id = c.tenant_id
  WHERE c.tenant_id = current_setting('app.tenant_id', true)::char(26)
)
SELECT
  COUNT(*) AS all_legacy_rows,
  COUNT(*) FILTER (WHERE deleted_at IS NULL) AS active_legacy_rows,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) AS archived_legacy_rows,
  COUNT(*) FILTER (WHERE visible_product_id IS NULL) AS product_not_visible_in_tenant,
  COUNT(*) FILTER (WHERE visible_unit_id IS NULL) AS unit_not_visible_in_tenant,
  COUNT(*) FILTER (WHERE product_deleted_at IS NOT NULL) AS rows_on_deleted_product,
  COUNT(*) FILTER (WHERE unit_deleted_at IS NOT NULL) AS rows_on_deleted_unit,
  COUNT(*) FILTER (
    WHERE base_unit_id IS NOT NULL AND unit_id = base_unit_id
  ) AS self_conversion_rows,
  COUNT(*) FILTER (WHERE factor_qty <= 0) AS nonpositive_factor_rows
FROM rows_in_scope;

WITH duplicate_live AS (
  SELECT c.product_id, c.unit_id
  FROM product_unit_conversions c
  WHERE c.tenant_id = current_setting('app.tenant_id', true)::char(26)
    AND c.deleted_at IS NULL
  GROUP BY c.product_id, c.unit_id
  HAVING COUNT(*) > 1
)
SELECT COUNT(*) AS duplicate_live_product_unit_groups
FROM duplicate_live;
```

A result labeled `not_visible_in_tenant` is **not** proof of an actual orphan: a globally existing foreign-key target in another tenant will be invisible under RLS and a same-tenant join, while a target removed by schema drift may also be missing. Do **not** bypass RLS to investigate in this workflow. Such anomalies need an explicitly authorized security DBA review with separate evidence handling. In an intact deployment, the active uniqueness index and positive-factor constraint would normally rule out corresponding anomalies; a nonzero count may indicate schema/migration drift and **must halt migration design**.

### 3.5 Optional current single-pair ownership check

```sql
SELECT
  COUNT(*) FILTER (
    WHERE p.conversion_unit_id IS NOT NULL AND u.id IS NULL
  ) AS current_conversion_unit_not_visible_in_tenant,
  COUNT(*) FILTER (
    WHERE p.base_unit_id IS NOT NULL AND bu.id IS NULL
  ) AS base_unit_not_visible_in_tenant,
  COUNT(*) FILTER (
    WHERE (p.conversion_unit_id IS NULL) <>
          (p.conversion_factor_qty IS NULL)
  ) AS current_pair_half_populated,
  COUNT(*) FILTER (
    WHERE p.conversion_unit_id IS NOT NULL
      AND p.base_unit_id = p.conversion_unit_id
  ) AS current_pair_self_conversion
FROM products p
LEFT JOIN units u
  ON u.id = p.conversion_unit_id AND u.tenant_id = p.tenant_id
LEFT JOIN units bu
  ON bu.id = p.base_unit_id AND bu.tenant_id = p.tenant_id
WHERE p.tenant_id = current_setting('app.tenant_id', true)::char(26)
  AND p.deleted_at IS NULL;
```

**Expected on schema-conforming data:** a current pair half-populated or self-referential should be constrained away by `0010`, but the actual deployed schema must be independently validated. The scoped `units` joins are essential: a globally valid ULID alone does not establish same-tenant ownership.

### 3.6 End the read-only evidence session

```sql
ROLLBACK;
```

This closes the read-only transaction and removes the transaction-local tenant setting. There is **no `COMMIT` step and no data mutation**. Another tenant requires a separately authorized, isolated session/transaction and must not reuse one tenant's in-memory evidence as a basis for another.

## 4. Redacted result contract and disposition

The later authorized operator's GitHub handoff, **if approved**, must not contain actual tenant/product/unit IDs, business/product names, prices, stock, serials, credentials, connection strings or raw SQL query output with identifying dimensions. Provide a de-identified per-snapshot *summary* such as:

| Field | Meaning / allowed report |
|---|---|
| `snapshot_authorization` | Private authorization reference or sanitized approval status, no secret path |
| `source_backend_sha` | Exact reviewed adoption commit and installed migration signatures |
| `scope` | Number of explicitly authorized tenants; small-number suppression if necessary |
| `counts_zero_one_multi` | Aggregated distribution only, or `WITHHELD` when business-identifiable |
| `archived_rows` | Aggregate deleted-row count/range with privacy threshold |
| `single_pair_mismatches` | Aggregate affected-row count; note legitimate post-0010 edits may explain mismatches |
| `cross_tenant_visibility_anomalies` | `NONE` / `INVESTIGATION_REQUIRED` / `WITHHELD`; **never** assert actual cross-tenant linkage on scoped joins alone |
| `schema_constraint_drift` | Zero / nonzero aggregate and required DBA review; no raw referenced IDs |
| `data_migration_risk` | `READY_FOR_OWNER_REVIEW`, `MANUAL_UNIT_MAPPING_REQUIRED`, `SECURITY_BLOCK` or `UNKNOWN` |
| `data_disposal_proof` | Private operator confirmation per authorized policy; no customer data in comments |

**Disposition categories (not automatic actions):**
- **No active old rule:** keep base/current pair intact; no arbitrary conversion inferred from archival table.
- **Exactly one old rule matches current pair:** candidate legacy compatibility, but check same-tenant unit and whether current Product was subsequently edited.
- **One old row conflicts with current pair:** preserve both as evidence, determine whether current data is intentional; do not overwrite.
- **Two or more old rows:** preserve all; cannot infer original ordering, unit-specific prices or intent from base-relative factors alone. Candidate for **manual mapping** and immutable profile revision after approval.
- **Archived/deleted rows:** preserve history; do not undelete without a separate decision.
- **Referential visibility mismatch, duplicate active rule, invalid factor or absent migration:** **stop**; security/data stewardship investigation before schema work.

**Never promote:** historical factor-to-base values cannot be equated with adjacent-unit factors; current purchase/selling prices cannot be calculated from unknown old multi-unit prices; Product master cannot post opening stock; R1-A rounding/precision options remain open. Source amount/return snapshots are immutable even if the Product unit profile is later corrected.

## 5. Synthetic fixtures for independent verification (future work)

Build synthetic disposable tenant fixtures **only under a separately approved verification task**. These rows are mathematical examples, not known production data:

| Fixture | Legacy active rows | Current pair | Required classification |
|---|---|---|---|
| `synthetic_zero` | None | Null | Zero-rule Product; no conversion inferred |
| `synthetic_one_match` | Box →20 Pcs (`factor_qty=20000`) | Box /20000 | One-row match |
| `synthetic_one_edited` | Box →20 Pcs | Pipe /different factor | Historical mismatch; do not auto-repair |
| `synthetic_multi` | Box →20 Pcs, Carton →240 Pcs | Null | Two+ old rows; manual unit ordering/intent review |
| `synthetic_deleted_rule` | One archived Box row | Null | Archived count separate from live |
| `synthetic_soft_deleted_product` | Active old Box row | Product deleted | Not included in live Product distribution; counted in scoped archival/visibility |
| `synthetic_self` | Same as Product base unit (possible in old shape) | Null | Unsafe legacy self conversion |
| `synthetic_unit_wrong_tenant` | Legacy rule references another tenant's globally valid unit ID | N/A | Scoped join reports *unit not visible*, never reveals other tenant |
| `synthetic_factor_conflict` | Invalid or duplicate active row (requires deliberately altered **disposable** constraints) | N/A | Abort and investigate schema drift |

Future fixture setup/teardown is a **different** authorized DB-test task; do not turn a documentation-only PR into actual SQL fixture writes. Negative fixtures may require a disposable *altered* schema and are not permitted on a restored customer snapshot.

## 6. Decision gate to R1-B final contract and R2 implementation

| Prerequisite | Status at this PR | Owner/accounting/security action |
|---|---|---|
| R1-A exact chosen-unit price/qty precision, rounding stage, positive sub-poisha, discount/component returns | **OPEN** | Explicit owner choice and independent accounting reconciliation; merged proposal PR #366 is not that approval |
| R0-A real historic-row census | **NOT RUN / NOT AUTHORIZED** | Explicitly approve a disposable non-production snapshot and operator; run/privately review sanitized aggregates |
| R1-B relational unit-profile design | **PROPOSED** in merged PR #370 | Choose immutable revision strategy after reviewing R0-A data and R1-A policy; no new migration number yet |
| Cross-tenant FK and RLS migration tests | **NOT RUN** | Separate security-owned additive schema work with composite owner enforcement and isolated DB |
| R2 schema migration, R3 Product API, R4 sale/purchase source segments, R5 frontend cutover | **BLOCKED** | Exact approved owner/CA design, environment, tests, rollback and human merge gate |
| Product hard Delete | **BLOCKED** by [backend issue #32](https://github.com/shuvodelux-commits/nestshererp/issues/32) | Independent referenced-document guard before connecting frontend Delete |

**Completion claimed in this R0-A documentation task:** produced a source-cited, tenant-aware read-only census and security review plan; **did not obtain snapshot access, inspect any tenant records, execute SQL, write application code, run DB tests, approve price policy or migrate a table**.

**Next actionable owner decision:** first approve/revise R1-A's financial policy; separately authorize a specific non-production snapshot census if historical migration readiness is needed. These approvals are distinct. Until they are received, follow the integration-first compatible Product path and preserve all advanced UI fields untouched.
