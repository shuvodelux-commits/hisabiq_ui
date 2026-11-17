# Verification contract and disposable runners

These are future authorized-packet commands and acceptance requirements. No application suite, browser stack, database migration or financial operation was executed while preparing this document.

## Runner prerequisites

Backend: repository .nvmrc/engines Node20; pnpm9.15.9; PostgreSQL16 isolated instance, not a separate database in a retained customer instance if test helpers can alter cluster roles. Frontend: Node24, npm ci against package-lock.json as existing PR Fast CI. Keep separate working directories and installs; never rewrite lockfiles to force a common toolchain. Existing React browser scripts use installed Playwright; backend Vue browser tests exercise Vue only.

Record actual source SHAs, environment/runner ID, ephemeral instance/DB identity and URL reference names. The backend helper `apps/api/test/support/database.ts` creates roles/migrates and truncates; `vitest.config.ts` supplies fallback `sher_test`. Both `ADMIN_DATABASE_URL` and `TEST_DATABASE_URL` must be explicitly set to the disposable instance. Before invoking any helper, parse the URLs, resolve host/port/database and compare to the issue's approved isolation record; refuse missing variables, retained/non-test databases or nonmatching instance. A familiar database name alone is not safety proof. Never print password-bearing URLs.

Use tenant A and B, actual generated ULIDs, seeded permissions/roles/units/walk-in/customer/supplier/accounts, FixedClock where applicable. `seedTenant` does not itself provision every default. The runtime application connects with the unprivileged test application role; admin connection is only for that disposable instance's setup. Default license READ_ONLY can mask the business test: use the existing suite's explicit test-only subscription entitlement setting or a signed fixture licence inside this disposable runner; never enable the permissive stub in a live workspace or production.

## Existing repository gates

Backend, from its root:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm typecheck
pnpm test:boundaries
pnpm test:inventory -- --check
git diff --exit-code -- docs/testing/
```

Once the packet explicitly authorizes the scoped tests and disposable setup, focused examples:

```bash
pnpm --filter @sher/api exec vitest run test/products.spec.ts
pnpm --filter @sher/api exec vitest run test/parties.spec.ts
pnpm --filter @sher/api exec vitest run test/cash-day.spec.ts test/settings.spec.ts
pnpm --filter @sher/api exec vitest run test/sales.spec.ts test/purchases.spec.ts test/returns.spec.ts
```

These are existing filenames in the baseline. Select only relevant cases/suites during an increment; final module regression includes required existing gates and appropriate accounting/security suites. Do not skip, weaken assertions, alter test runtime to bypass validation, or treat an unrelated failed gate as passed. Existing backend CI runs full `pnpm test` and `pnpm test:e2e` on disposable services; preserving those jobs does not prove a newly paired React integration.

Frontend, from its root:

```bash
npm ci --no-audit --no-fund
npx tsc --noEmit
npm run lint
npm run check:ui-contract
npm test
npm run build
```

Run existing affected browser scripts (`npm run test:purchases`, `test:parties`, `test:pos-fast-counter`, `test:compound-units`, `test:auth-login`, `test:settings`, and corresponding vendor/finance scripts) against the explicitly selected preview/runtime as those scripts require. They protect existing behavior; add the packet's proposed `scripts/integration-<module>-browser.cjs` for live API behavior. New module-specific mapping tests go under tests as named by the packet. Exact names in CORE_WORKFLOWS take priority over generic generated packet names; do not create duplicate suites with the same purpose.

## Proposed live integration CI (not currently installed)

Frontend-owned `.github/workflows/integration-nest.yml` is coordinator scope. Check out frontend candidate and an explicit compatible backend SHA in separate paths. Use Node20/pnpm9 to build/seed/start Nest against fresh PostgreSQL16; then use Node24/npm for HisabIQ/Playwright. Configure the React development/test gateway so same-origin `/api/v1/` reaches the ephemeral API; credentials never forward to arbitrary origins. Supply test secrets through the job environment only. Run the actual HisabIQ route, not Vue.

Before considering this workflow executable, implement and review exact setup/teardown commands, paired SHA resolution, fixture seeding and health checks; those commands have not been proven here. A workflow file alone is not an activated Cloud environment. Do not authorize broad workflow_dispatch/deployment to compensate for missing runtime evidence. A failed container/health/setup stage means application assertions did not run; never call it a product test failure or pass.

## Minimum accounting/security vectors

| Test case / owning task | Initial state and action | Required effects | Required absence |
|---|---|---|---|
| CAT-READ cost omission | User lacks inventory.cost.view; GET product | permitted public fields only | purchasePriceMinor/stockValueMinor/cost payload keys absent |
| PARTY opening correction | opening AR500000, version1; correct450000 | source version changes, immutable reversal/repost, final AR450000 | original journal not overwritten; stale retry no extra rows |
| CASH start adjustment | drawer100000; counted120000 from BANK | cash+20000/bank-20000; balanced entry; one session | missing counterpart posts nothing |
| CASH close shortage | expected155000; counted154000 with reason | expected155000 immutable; shortage1000 through CASH_SHORT_OVER | no expected-value assignment |
| SALE ordinary | own stock2000, unit cost6000, price10000; qty1000 paid10000 | stock1000, cash+10000, revenue10000, COGS6000; one sale.posted | no normal customer for fully paid guest; no unrelated party changes |
| PURCHASE ordinary | qty2000 ×price5000, discount1000, pay3000 | inventory9000 basis; AP6000; cash-3000; one posted bill | no client total accepted; failure leaves no lot |
| Idempotent lost response | same tenant/action/key/body twice | same source identity and one final financial effect | no second stock movement/journal/audit/outbox |
| Fingerprint conflict | same key, changed quantity/payment | documented idempotency refusal | no mutation |
| Atomic failure | inject repository/audit/outbox failure before commit | surfaced error | no source/journal/stock/payment/operation partial commit |
| Final stock race | two authorized sales of remaining unit, BLOCK policy | one succeeds, other explicit refusal | never oversell despite UOW presence |
| Refund race | returnable2000, concurrent returns1500 each | total returned≤2000 | no duplicated refund/cost restoration |
| Cash outflow race | drawer100000, concurrent outflows70000 each, no-overdraft | at most100000 total | no negative drawer from stale reads |
| Tenant isolation | A uses B product/account/source/session IDs | matching existing not-found boundary | no B rows returned or mutated; no sensitive existence details |
| Permission revocation | render allowed, revoke, submit | server refusal; typed draft kept | no local success/unauthorized entry |
| Date boundary | Dhaka 23:59→00:00, stale token timezone vs current profile | service-authoritative business date and eligible session | no UTC day inference or wrong-day attachment |
| Cash OFF | disable with no open session, ordinary cash operations | journal/movements continue sessionless under D05 | no CASH_DAY_NOT_STARTED merely because OFF |
| Historical party opening, ON/no session | Customer AR500000 against Opening Equity | Successful opening and source audit; no cash change | No session check/create/close or cash movement |
| Historical lender/borrower opening, ON/no session | Lender liability900000 / borrower receivable700000 against Opening Equity, after extension | Historical balance sources posted correctly | No current cash/payment/session mutation |
| Opening followed by actual cash repayment | Opening retained; repayment10000 attempted with ON/no session | Opening succeeds, repayment refused until eligible session | No historical exemption on actual money leg |
| Report exclusion | shared provider changes then navigate Reports | original page/navigation behavior remains | no new report endpoint/calculation |

`assertGoldenInvariants(pool,tenantId)` from existing test support supplements, never replaces, exact expected rows and source/stock/account deltas. Check quantities, money precision, allocations, append-only history and audit actor/source, not just HTTP status. Financial outbox event names and audit actions must be taken from their linked service declarations (SERVICE_INDEX), not invented by the test author.

## UI regression and independent QA

Use existing route/component selectors and semantic labels. Exercise list, open editor, nested Quick Add, selected customer, multi-unit cart, split payment, review/edit/confirm, source action and print preview. Widths320/390/768/820/1440; keyboard/touch; light/dark; English/Bangla. Retain existing CSS breakpoints; the width list is a test matrix, not new breakpoint design. Screenshots demonstrate preservation; they do not verify posted accounting.

Independent reviewer gets exact paired heads, packet revision and evidence, reads connected source beyond diff and reruns authorized focused cases on a fresh disposable fixture. Findings name source path, scenario, expected/actual behavior, severity and reproduction. Builder resolves high-confidence scoped defects; material scope changes return to packet amendment. Owner performs the existing workflow and approves merge. Until that occurs status cannot be DONE.
