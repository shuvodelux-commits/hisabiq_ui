# HisabIQ Settings and SaaS UI Planning Package

**Date:** 25 October 2026 (Asia/Dhaka).  
**Status:** Written for review; UI design/implementation and backend execution have not started.

## Read in this order

1. [Final owner decisions](../specs/2026-10-25-hisabiq-approved-business-model-decisions.md), sections 10–12.
2. [Shared UI design and backend requirements](../specs/2026-10-25-hisabiq-settings-saas-ui-backend-design.md).
3. [Tenant Settings and ERP experience UI plan](2026-10-25-hisabiq-settings-erp-experience-ui.md).
4. [SaaS tenant Control Center UI plan](2026-10-25-hisabiq-saas-control-center-ui.md).

## Execution order

| Stage | Deliverable | Prerequisite / stop point |
|---|---|---|
| A | Shared types, catalog, resolver and preview ports | Settings Task 1; preserve existing state |
| B | Tenant settings and real module consumers | Settings Tasks 2–6; Basic/Medium/Premium verified independently |
| C | Recycle Bin and tenant support consent | Settings Tasks 7–8; safe draft adapter only, no financial resurrection |
| D | SaaS workspace/configuration/grants/history | SaaS Tasks 1–4; same contracts and actual shared preview settings |
| E | SaaS-only diagnostic samples | SaaS Tasks 5–6; no real collector or private payloads |
| F | Combined review | Both plans' final browser tasks; no merge/deployment |
| Later | ByabsIQ backend | Separate approval and execution plan based on shared spec section 8 |

The two UI plans share contracts and fixtures; do not run competing edits to those shared files concurrently. Each task has an independent verification and review gate. Native sequential execution fits the existing shared state; this package does not select or authorize an execution method.

## Final interface policy

- **Basic:** simple essential screens, standard module navigation and complete standard routes to essential work.
- **Medium / Pro:** connected records and contextual actions; selected operational columns; no full Premium breakdowns.
- **Premium / Plus:** full implemented rich UI and precise optional settings, subject to role rights and quotas.
- Recovery and required financial/security/history access remain available independently of interface richness.
- Tenant technical logs appear only in authorized SaaS diagnostics.

Counter's additional experience inclusion is not silently decided; the preview uses Basic plus existing explicit benefits until the owner confirms the production catalog.

## Main screens

- Tenant: Interface & workflows, module column/detail/link controls, scoped changes/review/reset, Recycle Bin and restore conflict states, support consent and Recent changes.
- SaaS tenant: Overview, Configuration, Features & Limits, Members, Support Access, Diagnostics and History; existing billing/SMS/services links retained.
- Future backend: session-derived effective access, persistent scoped preferences, commercial grants/expiry, domain-safe recovery, consented support commands, redacted diagnostics and access audit.

## Validation of this planning work

Existing source paths, routes, package scripts and backend boundaries were inspected. A fresh builder review identified scope-reset/inheritance and Medium-column ambiguities; the shared contract now explicitly defines RESET/removal of overrides, scoped snapshots, descriptor value schemas, server time/version metadata and Medium's payment-method/brand columns as planner defaults. A second check confirmed these fixes and identified a missing customer-safe proposal reason; that field is now part of proposal, consent and future HTTP contracts.

No new merchant research, runtime verification, production security certification or backend readiness is claimed. Execution must refresh repository instructions and file drift, preserve the approved design and run the checks specified in each task.
