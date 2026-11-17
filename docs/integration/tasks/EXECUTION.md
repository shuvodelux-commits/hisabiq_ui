# Concurrent module ownership and ChatGPT-operated Super Build procedure

> **Binding owner override, 2026-11-13:** every HisabIQ engineering build must **actually use the installed `/super-build` skill**, via either merged ChatGPT-assisted `super-build-chatgpt.py` or a verified native Codex **Sol 6.1 Medium** executor. If neither is available, stop rather than substitute an informal manual build. **Write and execute comprehensive automated tests for every affected business rule and applicable scenario.** No prior no-test instruction survives for HisabIQ. Missing, blocked or failing required scenarios mean **NOT MERGE-READY**, regardless of static build or CI success. Read both AGENTS.md files for full precedence, coverage matrix and isolated-DB requirements.

The detailed per-function and per-state test matrix, exact-SHA evidence, missing-case blocker rules, independent Super QA and Super Review gates are defined in [Mandatory Super Build and scenario-testing policy](SUPER_BUILD_TEST_POLICY.md).

Revision 2 ordering is governed by [integrate then extend](../HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md) and [cash transaction classification](CASH_SESSION_POLICY.md). Stage A compatible integration precedes Stage B missing backend capabilities; no UI removal or fake posting. Historical opening balances do not require a cash session.

This document prepares future implementation. It authorizes no worker startup, issue mutation, database initialization, merge or deployment in this planning session.

## Coordinator-owned dispatch record

Use GitHub Project [#2](https://github.com/users/shuvodelux-commits/projects/2) and actual issue/PR/worktree state. **Owner override (2026-11-13): run multiple independent module builds simultaneously when safe; there is NO fixed requirement or ceiling of exactly five chats.** Each chat owns one approved task, named ChatGPT session/executor, separate GitHub branch/worktree and disposable DB. Coordinator verifies resource capacity, live claims, dependencies and shared-file ownership before each concurrent start. A single legacy headless runner with `max_workers:1` cannot be treated as multi-worker without a verified configuration change, but separately authorized ChatGPT+Remote Desktop Commander sessions do not need to use that runner. Builder, QA and human reviewer remain separate roles; no automatic merge/deploy.

| Chat slot | First packet | Preparation allowed | Build dependency | Initial reservation |
|---|---|---|---|---|
| 1 | MOD-001 settings/team | Independent remaining compatible read/permission slices | Accepted foundation and exact MOD-001 packet | Coordinator must check live claim |
| 2 | MOD-002 products/catalog | Continue already scoped Catalog/Product tasks | Accepted catalogue heads; no rich-field loss | Existing Building claim may occupy this lane |
| 3 | MOD-004 parties | [Backend P0 ledger isolation #28](https://github.com/shuvodelux-commits/nestshererp/issues/28) | Role-scoped read test/contract; no finance write or shared migration | Separate runner/claim required |
| 4 | MOD-005 cash sessions | Reconcile PR #282 and approved backend ON/OFF | Own settings/session policy and locks exclusively; no duplicated cash adapter | Separate runner/claim required |
| 5 | MOD-006 accounts/finance | Compatible account read integration only | Accepted foundation/account head; D08 write paths remain gated | Separate runner/claim required |

The five entries above are **examples only**, not a quota or required number. Start fewer or more concurrently according to actual independent session capacity, accepted dependency heads, nonoverlapping source ownership and disposable test resources. Each chat takes one scoped issue at a time. A parallel chat never obtains automatic authority over another module's merge, financial posting or migration.

Every dispatch issue must contain: module/task ID; plan file and revision commit; 10–15 sentence frontend/backend comparison and outcome; dated owner approval and chosen executor; unique owner session ID; repository/base branch/full SHA; branch/worktree; related frontend/backend PR pair; dependency heads; exact allowed files; coordinator-owned shared files and reserved migration number; disposable database identity/port; verification commands, standing test authorization and complete scenario matrix; acceptance criteria; rollback; remaining blockers; draft PR/evidence/resume action.

An assignee or label cannot implement a distributed lock. The coordinator reconciles actual active workers, issue comments, PR head and worktree evidence before confirming reservation. Competing claims pause dispatch; never force-release or delete another session's worktree. A stale-looking comment is insufficient evidence of abandonment.

## Concurrent-lane execution invariants (owner override, 2026-11-13)

- **Capacity:** no arbitrary fixed number of chats or modules. Concurrent tasks are bounded by *actual* available executors, memory/CPU, isolated workspaces, database ports, conflict-free file ownership, dependencies and safe QA throughput. A Project 2 Building claim must identify an actual uniquely assigned session; no builder self-promotes. A headless runner configured for one may host only one until its own verified capacity changes, while separate ChatGPT+Desktop Commander sessions remain independently coordinated.
- **Isolation:** unique branch and worktree per task. Each test runner uses its own disposable PostgreSQL database/container and verifies the database target before fixtures/migrations; never share a mutable test DB between builds. CI must be pinned to each pair of frontend/backend commits.
- **Ownership:** coordinator assigns exact allowed paths and a cross-repo ownership map before dispatch. Exclusive global writers for shared HTTP/session helpers, Party/Finance types, backend contract exports, controller/module providers, schema/migration numbers, permissions/settings and cash-session locking. Conflicting tasks wait for the owner to publish an accepted shared contract, but unrelated work may proceed.
- **Accounting dependencies:** MOD-004 trading ledger isolation may be a separate read-only slice; MOD-005 owns cash-session ON/OFF/locking; MOD-006 owns lender/borrower/owner finance posting; D07/MOD-012 owns expense-payable treatment. Multiple jobs may run simultaneously, but no payment/finance workflow is activated until its required server contract, session policy, schema and reconciliation tests are accepted. Historical openings remain session-free.
- **Concurrency evidence:** before adding any additional Building claim, inspect all current Project #2 Building tasks, active local/remote sessions, target shared files and any unmerged PR's actual head. No claims of idle capacity based only on stale comments. The coordinator alone assigns/releases reservations and handles conflicting merges serially.
- **Runtime configuration:** the historical `.claude/super-board/configs/hisabiq-nest-adoption.json` was located in `/home/shoaib/Projects/hisabiq-a01b-check` (an older local worktree); it has `host:codex`, `worker_backend:workflow`, `max_workers:1`, and is not present at the documented GitHub path in the current repository. **Do not invoke or change it for ChatGPT mode.** Confirm any future active runner configuration separately. Multiple independently controlled ChatGPT+Desktop Commander sessions do not mean a single native runner can spawn them.
- **Safety:** GitHub branches and draft PRs only; no direct commits to main, auto-merges, production deploy, retained DB writes, broad queue draining, mass resource changes or parallel schema migration. Independent accounting/security QA remains mandatory per actual candidate SHA.

## Required Super Build workflows (merged ChatGPT adapter or verified Codex)

Backend [PR #35](https://github.com/shuvodelux-commits/nestshererp/pull/35) is **MERGED** and its `.agents/bin/super-build-chatgpt.py` is available on the NestSherERP adoption branch. Its [ChatGPT-assisted guide](https://github.com/shuvodelux-commits/nestshererp/blob/chore/hisabiq-adoption-runtime-a01/.agents/skills/super-build/references/chatgpt-assisted.md) documents `prepare → verify → finalize`. Read the actual `.agents/skills/super-build/SKILL.md` before any task, not merely a copied checklist. The adapter validates source origin, approved issue, paired SHAs, exact file allowlist, isolated worktree and permitted static checks. Its receipt is evidence of **that verification only**, not business acceptance, database tests, native ChatGPT host support or permission to merge.

**Execution route A: ChatGPT-assisted.** ChatGPT writes task-scoped source and tests in GitHub first, then operates the actual Super Build adapter through authorized Remote Desktop Commander, runs the task's separately authorized isolated real PostgreSQL and Playwright/business suites, captures exact-head results and creates a draft PR for independent QA. The prior manual-checklist fallback is **REVOKED**. Use the accepted source-pinned launcher or stop as BLOCKED.

**Execution route B: verified native Codex.** If the installed `/super-build` can genuinely execute with the selected **Codex Sol 6.1 Medium** model/reasoning configuration and the owner-authorized runner, it may perform the same isolated approved issue with TDD, business scenario tests and draft PR handoff. Verify its true host/model support rather than assuming a label is selectable. The ChatGPT adapter must never be presented as launching Codex. Fake host detection, silent agent substitution, spawning a whole Ready queue and bypassing test/financial controls are prohibited.

**Testing is mandatory for both routes.** The issue's executable scenario-to-test matrix includes every applicable success/denial, boundary, monetary rounding, multilevel-unit price, cash-session ON/OFF, tenant/role, missing source, idempotency/retry, version/concurrency, error/rollback, source-linked correction, stock and journal effect, zero-posting draft and keyboard/touch/mobile browser path. Run real API/PG/RLS and browser tests wherever the behavior requires them; mocked transport and static checks alone cannot establish correctness. Include all test files, commands, exact exit statuses, CI runs and blockers in the draft PR. Fix failing coverage on GitHub and rerun **a new exact-head Super Build verification**. No unrun required scenario is silently marked passing.

## Shared-file ownership and conflict rules

Coordinator serializes: frontend `src/App.tsx`, `src/types/erp.ts`, `src/integration/{http,session,operation,decimal,errors}.ts`, shared cart/picker changes; backend `packages/core-contracts/src/index.ts`, `permissions.ts`, `settings.ts`, `packages/core-application/src/index.ts`, adapter `schema.ts`, migration files, API module provider wiring and CI workflows. Resource/task-specific files belong to that issue's worker only. An allowlist of a whole `src/` directory is invalid.

Two repositories require linked PRs and a compatibility order. Additive server contract first; frontend begins using it only after the approved server head is available to the authorized runner. A draft PR can test against a pinned paired backend head without claiming that head is merged. Do not merge either automatically. If a source contract changes, pause its dependent packet, update mapping/test vectors, have the coordinator rebase/resolve, and reverify; do not add speculative fallback parsing to accept incompatible meanings.

On interrupted build: record exact head, dirty paths, last command, uncertain database effects and operation IDs, held reservation and resume instruction. Keep worktree/data intact for coordinator reconciliation. If a POST outcome is unknown, do not reset its identity or rerun it under a new key. Resume only after verifying current owner, baseline and prior evidence. Release capacity with a deliberate handoff; do not run crash recovery across the other four chats.

## Mandatory Super Build implementation procedure

1. **Reconcile and reserve:** read both AGENTS.md files and actual `/super-build` skill, approved issue, dependencies, project claims, exact frontend/backend SHAs, scope/file allowlist and exclusive ownership. Select and verify one supported executor: ChatGPT-assisted adapter or native Codex Sol 6.1 Medium.
2. **Test matrix before implementation:** enumerate every relevant business action and state, success/failure, boundary, permission, tenant scope, concurrency, retry, money/stock/journal effect and UX path; map each to meaningful executable automated tests, including regression cases for bug fixes. Do not invent unsupported backend semantics; blocked contracts stay blocked.
3. **Implement test-first on GitHub:** create an isolated approved issue branch; add failing test/reproduction where practical, then minimally implement the behavior, retaining frontend/UI parity and full financial provenance. This is a standing owner authorization to write test files for HisabIQ, superseding historical R-0 restrictions.
4. **Execute the skill and independent acceptance:** run the actual source-pinned Super Build launcher/host in a unique isolated worktree. For ChatGPT-assisted: `python3 .agents/bin/super-build-chatgpt.py prepare ...`, `verify --receipt ... --check install|build|typecheck|lint|boundaries` as applicable, then `finalize --receipt ...`. Run targeted test suites and, where required, genuine Nest/API/PostgreSQL/RLS/concurrency and Playwright browser scenarios against a newly provisioned, task-owned disposable database/identity. The adapter's v1 static presets **do not** execute these business/DB/browser tests for you. Keep command/CI outputs and identify any skips or blockers.
5. **Fail closed and reverify:** never bypass a refused QA-identity creation, use another worker's DB, fake a host/model, or report PASS for an unrun check. Missing tools/test data/permissions or failed required cases means BLOCKED and **NOT MERGE-READY**. Fix in GitHub; use exact new pinned SHA and Super Build receipt before claiming verified.
6. **Draft PR / independent QA:** publish branch-only changes in a draft PR with source SHAs, actual skill invocation and receipt, test matrix and per-case results, CI evidence and known blockers. Preserve UI, split payments, conversion/cash source behavior and integration scope. The reviewer and owner decide merge; no auto-deployment, direct main commits, production data access or unauthorized schema migration. Parallel execution remains limited by actual independent session and resource capacity, not five fixed chats.

**Earlier historical pilot:** Backend PR #33 verified Parties API 32/32 with disposable PG; backend merged PR #35 tested the ChatGPT-assisted adapter 13/13 and a real GitHub exact-head pilot. These earlier tests are evidence of their own commits only, **not** evidence that a subsequent HisabIQ business scenario passed.

## Reusable conversation prompt

```text
Implement only <MOD-ID>/<TASK-ID> from the approved GitHub packet at
<repo/path + immutable plan commit>. Read its global rules and linked contracts.

Issue: <real issue URL>. Approved revision: <plan SHA>. Owner approval: <link>.
Chosen execution environment: <runner ID/method>. Session owner: <unique ID>.
Frontend baseline: <repo/branch/full SHA>. Backend baseline: <repo/branch/full SHA>.
Allowed writes: <exact paths>. Shared-file owner: <coordinator/session>.
Dependencies: <accepted heads/PRs>. Disposable DB: <identity/host/port, no secrets>.
Verification: <actual Super Build route, full scenario-to-test matrix, exact commands>.

First reconcile issue comments, actual PR heads, verified board/runner capacity (target
actual concurrent session capacity and unique claims per 2026-11-13 owner override),
coordinator reservation, nonoverlapping shared-file ownership, real checkout and the
source symbols named by the packet.
Show the frontend/backend comparison if this approved revision has not already
received its 10–15 sentence overview and environment approval. Do not demand a
second START when the existing approval covers this revision/environment.

For ChatGPT use the REAL source-pinned /super-build ChatGPT-assisted adapter
prepare -> verify -> finalize, plus independently executed targeted real-PG and
browser/business tests. Alternatively use verified native /super-build via Codex
Sol 6.1 Medium. Never claim manual-only verification satisfies Super Build or
that a fake host/model is running. Do not drain Ready, take another chat's module,
alter worker capacity or install tools silently.
A connector-only session must use the named runner for execution or report BLOCKED.

Preserve every existing HisabIQ page, component, compact style, Bangla/English,
keyboard/touch flow, drafts, unit chain and source-context action. No Reports work.
Use the specified controller/use case/repository and exact money/quantity rules.
Do not invent missing DTOs, business decisions, endpoints or fallback success; WRITE AND RUN real tests for every applicable business rule and scenario.
If source/contract differs, stop that task and report the concrete conflict.

Write every applicable meaningful behavior/scenario test first, run it against the disposable
fixture, implement the smallest source change, verify exact effects and rollback,
then use the actual Super Build skill and run the full mandated scenario matrix plus repository gates. Never initialize retained development
or production data. Evidence must identify both repo SHAs and actual runner.

Open linked draft PR(s), include acceptance evidence and source-action trace,
request independent scoped QA on the exact heads, fix verified defects within
scope, and hand the result to the owner for review. No merge or deployment.
```

## Draft PR evidence contract

Problem/result; module/task and approved packet revision; actual changed paths and shared ownership; paired source SHAs; exact UI→request→service→repository→transaction→response→UI→test trace; command exits and runner/database identity; before/after open-state screenshots where UI touched; journal/stock/source assertions for monetary flows; independent QA head and remaining findings; unimplemented acceptance items; manual walkthrough; rollback. A partial PR says Refs issue and states incomplete work; it never claims Closes/Done. Humans approve every merge.
