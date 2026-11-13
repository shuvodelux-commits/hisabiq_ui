# HisabIQ × NestSherERP Code-Level Integration Blueprint

**Revision:** 2026-11-11, evidence draft 3 — MOD-000-A foundation specification added. **Status: evidence draft; full blueprint partially blocked. MOD-000-A alone is owner-approved; execution is blocked/unreserved.**

**Goal:** connect the existing HisabIQ React product to the existing NestSherERP application/domain/PostgreSQL implementation while retaining every existing UI workflow. This package distinguishes source-verified reuse from proposed engineering changes and unresolved product decisions. It is not a claim that every feature has a complete executable specification: see the failed completeness gates in [REVIEW.md](REVIEW.md). An unresolved packet must not be handed to a lower-reasoning builder as ready.

**Architecture:** separate repositories remain separate. React keeps its components, routes and interaction state. Typed resource adapters call the existing Nest API. Nest controllers validate; existing application services own authorization, transactions and business decisions; domain services own arithmetic; PostgreSQL adapters own persistence. No BanijjIQ backend, Vue migration, new ERP engine, database-per-plan migration or deployment is included.

**Stack:** frontend React 18 / TypeScript / Vite / existing Tailwind primitives, Node 24 and npm lockfile as in its CI; backend NestJS / Zod / Drizzle / PostgreSQL 16, Node 20 and pnpm 9.15.9 as pinned in its repository. Do not apply the user's local pnpm version to either lockfile.

**Specification authority:** the supplied “HISABIQ × NESTSHERERP — CODE-LEVEL INTEGRATION IMPLEMENTATION BLUEPRINT” request. Its explicit requested document paths override older repository prohibitions on additional Markdown. It authorizes test specifications, not running suites or migrations during this planning session. Future packet approval must include its named verification scope; the old no-test rule cannot silently invalidate an explicitly approved test-driven packet.

## Foundation increment ready for scope review

[MOD-000-A execution specification](modules/MOD-000-FOUNDATION_EXECUTION_SPEC.md) supplies the first bounded build packet: password/PIN identity, additive tenant bootstrap, shared transport, tab-scoped sessions, preview/live isolation, exact value/intent helpers and disposable CI requirements. It preserves existing four-digit backend credentials while supporting HisabIQ six-digit PINs. Status: owner-approved for GitHub source changes and GitHub Actions with disposable PostgreSQL 16; see [the execution handoff](MOD-000-EXECUTION-CONTRACT.md) and [issue 17](https://github.com/shuvodelux-commits/nestshererp/issues/17). No build has started. It does not mark all authentication or business modules ready.

## Owner amendment — integrate first, extend second

The owner clarified that historical party/lender/borrower opening balances require **no active cash session**. Only an actual payment/receipt through a session-tracked drawer requires an eligible OPEN session while the cash-session feature is ON; OFF permits ordinary sessionless cash operations. Bank/MFS-only and non-cash actions do not acquire a drawer requirement merely because they create a journal. Existing party opening services already use Opening Equity without cash/session posting; missing lender/borrower opening support must follow that classification.

Read the [cash-session policy and backend task plan](tasks/CASH_SESSION_POLICY.md) for the exact transaction matrix, shared policy algorithm, source/correction distinctions, ON/OFF behavior and test vectors. This supersedes any broader session-gating wording in earlier drafts.

Read the [integrate-then-extend plan](HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md): Stage A connects existing semantically compatible backend capabilities; Stage B extends this same backend for full HisabIQ UI parity, including multilevel pricing, split purchase receiving, unpaid expenses, virtual bundles, installments, online/COD and other discovered gaps. Supported integration slices may proceed before all advanced extensions, but no module is declared complete while its ordinary UI actions still lack real backend support. Preserve all UI; do not replace unsupported actions with fake posting or a lossful adapter.

HisabIQ's product direction is flexible business workflows: multiple relationships per identity, mixed units/independent prices, unpaid/partial/split settlements, drafts and source-safe corrections. Legacy Nest business restrictions are reviewed against these requirements rather than copied automatically. This amendment confirms requirements and planning direction; only the separately approved MOD-000-A increment is authorized for implementation. The complete original blueprint remains unfinished.

## Source baselines

| Source | Branch | Immutable SHA | Interpretation |
|---|---|---|---|
| [HisabIQ UI](https://github.com/shuvodelux-commits/hisabiq_ui) | main | `176bb1a3e8f42eef192ea3098074ac5c8a214261` | Frontend source of truth inspected here |
| [NestSherERP adoption](https://github.com/shuvodelux-commits/nestshererp/tree/1643dac059e568407bba2fff38a990268dfe28fe) | chore/hisabiq-adoption-runtime-a01 | `1643dac059e568407bba2fff38a990268dfe28fe` | Backend working baseline named by checked-in board configuration |
| NestSherERP default | main | `b1bad29961a968829be622dc812d476773e6db78` | Older implementation; not interchangeable with adoption branch |
| [Frontend PR 282](https://github.com/shuvodelux-commits/hisabiq_ui/pull/282) | feat/cash-session-api-adoption-a01 | `62b6576842252fdd94a3f42e625c89e64fcaa792` | OPEN, not merged; cash integration candidate, not baseline |
| [Backend PR 16](https://github.com/shuvodelux-commits/nestshererp/pull/16) | issue-14-cash-session-safeguard | `913fedc7e9919cce72a81af5a2131ff3a05fad96` | OPEN DRAFT; setting transition safeguards, not baseline |

Read [GitHub snapshot](evidence/GITHUB_STATE.md) before assigning work. Source locations in this package are pinned to these SHAs. An implementer may rebase onto later approved commits only after comparing the listed paths and updating the packet's baseline; never blindly copy guidance against a changed contract. The attached Magic Patterns ZIP is not substituted for the current GitHub frontend. The source census was read-only. Subsequent documentation publication created draft PRs and an issue handoff; no application code, suites, database operations or worker dispatch are claimed.

## Evidence and its limits

- [Every frontend Route declaration](evidence/FRONTEND_ROUTES.md), including auth, settings, tenant portal, control centre, redirects and the design system.
- [Existing API catalogue](evidence/API_CATALOGUE.md): 277 HTTP declarations across the tenant API and control plane; includes excluded reports and internal-management routes for inventory only. Presence is not proof of a correct or externally suitable capability.
- [Existing database tables and migrations](evidence/DATABASE_INDEX.md): 90 Drizzle declarations in the tenant schema and 53 migration files. The control plane has separate persistence.
- Per-module source-action censuses record current state, handlers and event bindings with exact source lines. These are **static candidates**, not independently validated workflow contracts; duplicated/legacy/unreachable components can occur.
- Contract files index actual Zod field declarations; inherited and multiline schema expressions remain authoritative at their immutable source links.
- [Source hash manifest](evidence/source-manifest.json) identifies examined trees. Hashing/enumerating a file is not semantic review of that file.
- `NOT VERIFIED` means exactly that: runtime behavior, production wiring, Project v2 live reservations, external provider credentials and many secondary action traces have not been proven. Existing CI claims from PR bodies are attributed claims, not tests run here.

## Non-negotiable preservation contract

Keep App.tsx routes, sidebar/tab order, component hierarchy, compact tables, dialogs/drawers, Bangla/English wording, focus return, keyboard shortcuts, touch interaction, mobile/tablet breakpoints, POS V2 cart, multi-unit inputs, drafts, source-context actions and print layouts. Retain 36px standard controls, existing 48px terminal CTAs, 0.375rem shared radii and proportional numerals. Do not import Vue markup or tokens.

Backend insufficiency is not permission to delete, hide permanently, simplify or fake a feature. Local preview workflows stay available in explicit preview mode. A connected workspace must never mix real balances with seeded transactions or announce real posting after a local mutation. Until every financial action in a surface has real parity, that surface's production cutover is blocked; preserving a preview is not completing integration. An unavailable real action may show an honest reason, but this is a temporary implementation state, not acceptance of feature removal.

Read the existing frontend design guide and transaction-cart contract before implementation. Preserve existing product masters inline edit-on-hover/focus and Bangla unit names. Operational Dashboard stays in scope. Dedicated `/app/reports`, `/saas/reports`, analytics/insights and report generation remain unchanged and excluded. An existing `/api/v1/dashboard/cards` read is operational reuse even though its implementation lives under `reporting`; do not build new analytics endpoints to populate missing trend graphs in this phase.

## Architecture decisions proposed by this blueprint

1. **One HTTP transport, named resource adapters.** Create `src/integration/http.ts`, `session.ts`, `errors.ts`, `operation.ts`, `decimal.ts` and resource adapters. Do not import the Vue API client; reuse its behavior as a reference, not its runtime coupling. [Foundation contract](tasks/FOUNDATION.md) defines signatures and failure paths.
2. **Explicit connected/preview state.** `AppSession` is the only live identity authority. Local `TenantSettingsProvider`/RBAC are presentation and preview state only. Authentication is validated by `/api/v1/me`; a localStorage token's presence is not proof. Never infer a tenant from `t1`, a route parameter or a data fixture.
3. **Wire units stay exact.** Money uses integer poisha, quantity integer thousandths, unit cost integer ten-thousandths. Keep raw input text until validated. Render major-unit numbers only at the presentation boundary. [Field map](contracts/UI_FIELD_MAPPING.md) states mismatches, defaults and preservation rules.
4. **Existing services remain sole writers.** Product/party createWithin, purchase createWithin, sale create, receipt/payment, returns and correction services are reused. Do not compose several public posting HTTP requests as a substitute for one atomic UI action.
5. **Server arithmetic wins.** A preview total may be displayed immediately; the posted receipt, due, inventory, account and ledger refresh from the confirmed server response. Never PATCH a balance. Any mismatch between reviewed and server-computed value must be explained before confirming a materially different sale, using the existing review dialog.
6. **No lossful adapters.** Multi-unit prices, Bengali master data, bundle recipes, installments, unpaid expenses and online COD cannot be encoded into notes or silently discarded. Extension requirements below are release prerequisites, not optional polish.
7. **Separate contract and schema ownership.** A coordinator owns shared transport, `src/types/erp.ts`, permissions, shared backend exports, schema/migrations and CI changes. Module builders receive exact approved paths. No independent migration numbering or simultaneous edits to shared files.
8. **Backward compatibility.** Extend the existing API additively where the meaning is identical. New endpoint proposals must include a full schema, permission, idempotency, transaction, error and test contract before build. This package deliberately does not invent contracts for unresolved business models.
9. **No bulk fixture migration.** Seed IDs (`p1`, `s241`, `acc-cash`) are not ULIDs. Do not submit them, invent matching IDs or infer identity by label. Actual business data migration requires a separately reviewed import mapping and dry run.
10. **Human approvals are not inferred.** This is a design proposal. Existing cash issue approval applies only to that issue's actual scope. Every new module needs its frontend/backend comparison and 10–15 sentence overview, selected executor and approval of a concrete packet.

## Accounting and persistence rules

`PostgresUnitOfWork.run` sets transaction-local tenant context; the connected application must use an unprivileged role with RLS. Never use the superuser to demonstrate isolation. Application services enforce permissions regardless of rendered controls. Foreign-tenant entity lookups must not expose existence; match existing 404 behavior.

Class T mutations commit document, journal, stock, audit, outbox and durable operation record in one transaction. Class S identity and Class M master/configuration mutations use their existing smaller service paths. Reuse `Money`, `Qty`, `UnitCost`, `divideRoundHalfUp`, `allocateLargestRemainder`, `PeriodGuard`, `AuditWriter`, `Outbox`, `NumberingService` and `IdempotencyStore`. Rounding occurs once at the defined domain boundary. No JS floating-point multiplication is a posting authority.

Posted history is immutable: reverse/repost with source linkage and version, never replace journal lines or hard-delete a posted record. Returns reference original line IDs and quantities/allocations; the final returnable unit carries the remainder. A fully paid guest sale does not create an ordinary customer; retained advance or due requires identity as the existing service specifies. Customer and supplier balances stay role-specific; a net zero must not conceal simultaneous payable and receivable amounts.

An operation ID is created once for a confirmed intent. Transport timeout preserves that ID and payload. New business intent uses a new ID. Some existing endpoints take the ID in a header; cash mutations take it in the body; corrections use versions. Do not standardize them by guessing. A fingerprint mismatch is an error, not permission to retry with a new key. Existing pre-read idempotency and unique indexes do **not** by themselves prove simultaneous retries return the same response; concurrency tests are mandatory before cutover.

Lock stock positions/cost layers, source invoices/return capacity and outgoing cash balances in a consistent order before read-modify-write. Verify the existing adapter actually supplies the lock: a UOW does not imply serializable isolation. The current code visibly locks certain sales document reads, but broad last-stock and cash-outflow concurrency behavior is NOT VERIFIED. See [release blockers](REVIEW.md).

Business date is a `YYYY-MM-DD` in the tenant timezone; timestamps are instants. Obtain current business date from server state, not formatted fixture dates. Preserve immutable `created_at`. Never infer business date from `toISOString().slice(0,10)` around Dhaka midnight.

## Module execution index

The following table is generated from the packet registry; every packet has the 18 required sections. **A section's existence does not mean its blocked feature contracts are complete.**

| Module | Dependencies | Decisions | Status |
|---|---|---|---|
| [MOD-000: Authentication, application shell and integration foundation](modules/MOD-000-foundation-auth.md) | — | D13 | PLANNED / BLOCKED |
| [MOD-001: Tenant settings, teams, invoice preferences and permissions](modules/MOD-001-settings-team.md) | MOD-000 | D02,D04,D13 | PLANNED / BLOCKED |
| [MOD-002: Products, units, categories, brands, prices and offers](modules/MOD-002-products-catalog.md) | MOD-000, MOD-001 | D03,D04,D16 | PLANNED / BLOCKED |
| [MOD-003: Inventory, opening stock, adjustments, lots and imports](modules/MOD-003-inventory-imports.md) | MOD-000, MOD-002 | D03,D04,D06 | PLANNED / BLOCKED |
| [MOD-004: Parties, role ledgers, openings and contextual payments](modules/MOD-004-parties-ledgers.md) | MOD-000, MOD-001, MOD-006 | D08 | PLANNED / BLOCKED |
| [MOD-005: Optional cash sessions and daily cash history](modules/MOD-005-cash-sessions.md) | MOD-000, MOD-001, MOD-006 | D02,D05 | PLANNED / BLOCKED |
| [MOD-006: Accounts, Counter, transfers, capital, loans and bank entries](modules/MOD-006-accounts-counter-finance.md) | MOD-000, MOD-001 | D05,D08 | PLANNED / BLOCKED |
| [MOD-007: POS, sales history, drafts, invoice output and customer credit](modules/MOD-007-pos-sales.md) | MOD-000, MOD-002, MOD-003, MOD-004, MOD-005, MOD-006 | D03,D04,D09,D16 | PLANNED / BLOCKED |
| [MOD-008: Purchases, drafts, corrections, supplier orders and planner](modules/MOD-008-purchases-planner.md) | MOD-000, MOD-002, MOD-003, MOD-004, MOD-005, MOD-006 | D03,D06,D16 | PLANNED / BLOCKED |
| [MOD-009: Sales/purchase returns, source corrections and transaction dates](modules/MOD-009-returns-corrections.md) | MOD-007, MOD-008 | D09 | PLANNED / BLOCKED |
| [MOD-010: Quotations and conversion handoff](modules/MOD-010-quotations.md) | MOD-000, MOD-002, MOD-004, MOD-007 | D11 | PLANNED / BLOCKED |
| [MOD-011: Vendor stock, settlements and vendor working hubs](modules/MOD-011-vendors.md) | MOD-002, MOD-003, MOD-004, MOD-006, MOD-007, MOD-008 | D03,D06 | PLANNED / BLOCKED |
| [MOD-012: Expenses, payees, categories, partial payments and receipts](modules/MOD-012-expenses.md) | MOD-000, MOD-004, MOD-006 | D07,D08 | PLANNED / BLOCKED |
| [MOD-013: Warranty claims, serial lifecycle and service work](modules/MOD-013-warranty-serials.md) | MOD-002, MOD-003, MOD-007, MOD-008 | D04 | PLANNED / BLOCKED |
| [MOD-014: Bank statement reconciliation](modules/MOD-014-reconciliation.md) | MOD-000, MOD-006 | D08 | PLANNED / BLOCKED |
| [MOD-015: Daybook, operational audit ledger and source actions](modules/MOD-015-daybook-audit.md) | MOD-007, MOD-008, MOD-009, MOD-012 | Trace/approval gates | PLANNED / BLOCKED |
| [MOD-016: Operational Dashboard and global search](modules/MOD-016-dashboard-search.md) | MOD-000, MOD-002, MOD-004, MOD-007, MOD-008, MOD-006 | D15 | PLANNED / BLOCKED |
| [MOD-017: Online sales, leads, fulfillment, COD and notifications](modules/MOD-017-online-notifications.md) | MOD-002, MOD-004, MOD-006, MOD-007, MOD-010 | D10,D12 | PLANNED / BLOCKED |
| [MOD-018: Installment sales, schedule, receipts and lifecycle](modules/MOD-018-installments.md) | MOD-004, MOD-006, MOD-007, MOD-009 | D09 | PLANNED / BLOCKED |
| [MOD-019: Virtual bundles and immutable recipe history](modules/MOD-019-bundles.md) | MOD-002, MOD-003, MOD-007, MOD-009 | D09 | PLANNED / BLOCKED |
| [MOD-020: Offline device authorization, synchronization, drafts and recycle bin](modules/MOD-020-offline-recovery.md) | MOD-000, MOD-001, MOD-007, MOD-008, MOD-009 | D14 | PLANNED / BLOCKED |
| [MOD-021: Tenant subscription/support portal and SaaS control centre](modules/MOD-021-saas-platform.md) | MOD-000 | D12 | PLANNED / BLOCKED |
| [MOD-022: Data backup, account security, sessions and accounting periods](modules/MOD-022-backup-security-periods.md) | MOD-000, MOD-001 | D13,D14 | PLANNED / BLOCKED |

## Dependency and cutover order

Foundation/auth → settings and account identity → product/catalog + party identity → inventory + cash semantics → purchase receiving → POS posting → payments/returns/corrections → vendor/expense/warranty/reconciliation → operational Dashboard/Daybook/search. Bundles, installment, online/COD, SaaS billing and restoration stay on their own dependency chains. Offline financial replay waits until online contracts are stable and reproduces the same application services; it cannot be implemented as queued arbitrary HTTP requests.

Use read-only data integration slices before mutations where useful, but a module is not complete until its UI actions are connected. Shared type changes precede all consumers and have one owner. Cutover is per coherent workflow, not per random button. Never replace a page's local store with a live list while its edit/delete/payment handlers still mutate fixtures.

## Five conversations and Super Board

[Execution contract and reusable prompt](tasks/EXECUTION.md) are binding for future build sessions. **Owner override 2026-11-13:** up to **five independently approved active module build sessions** may run in parallel, each with unique issue, GitHub branch/worktree, authorized runner and disposable database. Shared contracts/schema/migrations, cash-policy provider files and merge decisions remain serialized by the coordinator; effective runtime capacity must be verified before dispatch. First prepared packets: MOD-000 foundation, MOD-001 settings, MOD-002 catalog, MOD-004 parties, MOD-005 cash. These have dependencies and are not five parallel builds. After completion the five slots can take later packets. No module was reserved, assigned or started here.

The previously documented `.claude/super-board/configs/hisabiq-nest-adoption.json` (claimed `max_workers:1`) was **not found at its referenced GitHub path or known local checkout** during the 2026-11-13 review. Target capacity is now five independent workers by owner instruction, **not** proof that a shared runner has been configured accordingly. Coordinator must locate/verify the active config and runner semantics before claiming >1 worker on that runner; keep human merge policy, controlled test databases and no automatic migrations. That 400 number is an auto-merge policy threshold, not proof of a hard PR-size limit; keep small increments and retain human review for all. Live board reservations and activated runner state are NOT VERIFIED. The GitHub connector has no Project v2 reservation operation exposed here. Do not claim comments implement a distributed lock.

## Verification and release acceptance

See [VERIFICATION.md](tasks/VERIFICATION.md), [core workflow contracts](tasks/CORE_WORKFLOWS.md), [additional existing-service traces](tasks/SECONDARY_WORKFLOWS.md) and [additive contract proposals](contracts/EXTENSIONS.md). No run is called passing until actual output is attached for exact source SHAs. UI preview tests do not prove live API/accounting behavior, and backend Vue E2E does not prove HisabIQ React behavior. Add real React→Nest→disposable PostgreSQL paths in addition to existing suites. Maintain reports regression checks when shared code changes, but implement no reports work.

No production or retained development database may be used for initialization, truncation or migrations. Existing API test helpers truncate and fall back to `sher_test`; explicitly bind isolated URLs and verify the target before every run. Runners and secret references must be recorded in the issue, not secrets copied into this document.

## Approval decisions and exact remaining gaps

[DECISIONS.md](DECISIONS.md) records recommendations and the missing owner decisions. [REVIEW.md](REVIEW.md) records the second-pass findings and failed gates. Those are intentional stop signs, not instructions for a builder to improvise. Complete each blocked contract in a planning amendment before assigning the corresponding code task. No merger, database migration or deployment is authorized by this document; parallel build dispatch still requires verified per-issue approval, executor, distinct workspaces, current dependencies and runner capacity as defined in tasks/EXECUTION.md.
