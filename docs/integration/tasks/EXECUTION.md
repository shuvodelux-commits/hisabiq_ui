# Concurrent module ownership and ChatGPT-operated Super Build procedure

## Mandatory owner override — /super-build and comprehensive scenario tests (2026-11-13)

**Required for every new or changed functionality in HisabIQ React and NestSherERP:** follow [Mandatory Super Build and scenario-testing policy](SUPER_BUILD_TEST_POLICY.md) before a Builder marks any task done. The owner's new explicit instruction authorizes writing/running automated tests for every applicable case and **supersedes legacy backend instructions forbidding tests**. Each ticket must enumerate all affected actions and meaningful positive/negative/boundary/role/tenant/feature-state/financial/UX cases, implement RED→GREEN tests, run appropriate levels against exact source SHAs, and have independent Super QA test-gap plus Super Review checks. Missing/skipped/untested cases cannot be represented as passes or merged without a visible blocker disposition. This does **not** authorize production deployment, migrations or unsafe test data. The native `/super-build` host is not ChatGPT; use the reviewed **already merged** ChatGPT-assisted adapter in backend PR #35 where available, while following the actual skill procedure and independently running DB/Playwright tests. Never claim native invocation if only an assisted path ran. Existing AGENTS-only environment-reuse PRs #511 (frontend) and #94 (backend) must be coordinated rather than overwritten.

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

Every dispatch issue must contain: module/task ID; plan file and revision commit; 10–15 sentence frontend/backend comparison and outcome; dated owner approval and chosen executor; unique owner session ID; repository/base branch/full SHA; branch/worktree; related frontend/backend PR pair; dependency heads; exact allowed files; coordinator-owned shared files and reserved migration number; disposable database identity/port; verification commands and test authorization; acceptance criteria; rollback; remaining blockers; draft PR/evidence/resume action.

An assignee or label cannot implement a distributed lock. The coordinator reconciles actual active workers, issue comments, PR head and worktree evidence before confirming reservation. Competing claims pause dispatch; never force-release or delete another session's worktree. A stale-looking comment is insufficient evidence of abandonment.

## Concurrent-lane execution invariants (owner override, 2026-11-13)

- **Capacity:** no arbitrary fixed number of chats or modules. Concurrent tasks are bounded by *actual* available executors, memory/CPU, isolated workspaces, database ports, conflict-free file ownership, dependencies and safe QA throughput. A Project 2 Building claim must identify an actual uniquely assigned session; no builder self-promotes. A headless runner configured for one may host only one until its own verified capacity changes, while separate ChatGPT+Desktop Commander sessions remain independently coordinated.
- **Isolation:** unique branch and worktree per task. Each test runner uses its own disposable PostgreSQL database/container and verifies the database target before fixtures/migrations; never share a mutable test DB between builds. CI must be pinned to each pair of frontend/backend commits.
- **Ownership:** coordinator assigns exact allowed paths and a cross-repo ownership map before dispatch. Exclusive global writers for shared HTTP/session helpers, Party/Finance types, backend contract exports, controller/module providers, schema/migration numbers, permissions/settings and cash-session locking. Conflicting tasks wait for the owner to publish an accepted shared contract, but unrelated work may proceed.
- **Accounting dependencies:** MOD-004 trading ledger isolation may be a separate read-only slice; MOD-005 owns cash-session ON/OFF/locking; MOD-006 owns lender/borrower/owner finance posting; D07/MOD-012 owns expense-payable treatment. Multiple jobs may run simultaneously, but no payment/finance workflow is activated until its required server contract, session policy, schema and reconciliation tests are accepted. Historical openings remain session-free.
- **Concurrency evidence:** before adding any additional Building claim, inspect all current Project #2 Building tasks, active local/remote sessions, target shared files and any unmerged PR's actual head. No claims of idle capacity based only on stale comments. The coordinator alone assigns/releases reservations and handles conflicting merges serially.
- **Runtime configuration:** the historical `.claude/super-board/configs/hisabiq-nest-adoption.json` was located in `/home/shoaib/Projects/hisabiq-a01b-check` (an older local worktree); it has `host:codex`, `worker_backend:workflow`, `max_workers:1`, and is not present at the documented GitHub path in the current repository. **Do not invoke or change it for ChatGPT mode.** Confirm any future active runner configuration separately. Multiple independently controlled ChatGPT+Desktop Commander sessions do not mean a single native runner can spawn them.
- **Safety:** GitHub branches and draft PRs only; no direct commits to main, auto-merges, production deploy, retained DB writes, broad queue draining, mass resource changes or parallel schema migration. Independent accounting/security QA remains mandatory per actual candidate SHA.

## Tested ChatGPT-assisted launcher (pending owner merge)

The owner-selected workflow remains **GitHub code and tests first → ChatGPT directs verification using Remote Desktop Commander → GitHub draft PR and independent QA**. The standalone Python workstation launcher in [backend draft PR #35](https://github.com/shuvodelux-commits/nestshererp/pull/35) implements explicit `prepare`, `verify` and `finalize` operations; refer to its [usage guide](https://github.com/shuvodelux-commits/nestshererp/blob/tooling/chatgpt-super-build-assisted-20261113/.agents/skills/super-build/references/chatgpt-assisted.md).

On 2026-11-13 its 13 local-git safety tests passed and its separate real GitHub worktree pilot returned `state: verified` after frozen install, build, typecheck, lint and boundaries. It recorded one initial typecheck failure and the passing retry after build. **The launcher is still draft and must not be treated as a merged dependency.** Use it only once the owner accepts an exact source SHA; until then the tested manual ChatGPT+Desktop Commander checklist remains available. This launcher does not run an AI model, database suite or background job, create PRs, deploy, or merge. The native `/super-build` host still lacks ChatGPT support. Concurrent module chats are not fixed at five; their number is limited by safe resources, dependencies and exclusive file ownership.

## Installed workflow use

Source-inspected bundle paths: `.agents/skills/super-board/SKILL.md`, `.agents/skills/super-build/SKILL.md`, host links under `.claude/` and `.codex/`, `.agents/bin/super-board-lane.sh`, checked-in config `.claude/super-board/configs/hisabiq-nest-adoption.json`.

**Owner-selected executor: ChatGPT, not Codex/Claude.** Read `.agents/skills/super-build/SKILL.md` and its **tested ChatGPT adapter guide** at [backend reference](https://github.com/shuvodelux-commits/nestshererp/blob/tooling/chatgpt-super-build-assisted-20261113/.agents/skills/super-build/references/chatgpt-assisted.md). The separate `super-build-chatgpt.py` launcher is proposed in [backend draft PR #35](https://github.com/shuvodelux-commits/nestshererp/pull/35): it offers explicit `prepare → verify → finalize` via Remote Desktop Commander, but **never** launches a coding model. After owner approval/merge and source-pinned availability, prefer this verified launcher to ad-hoc shell verification; until then, use the documented manual ChatGPT checklist on an authorized branch. ChatGPT alone authors code/tests directly on GitHub, then validates the exact isolated source via the authorized PC. The local native `/super-build` launcher is NOT a ChatGPT host: `super-board-host.sh` returned exit 65 for this host, and the native launchers invoke `claude -p` or `codex exec`. Therefore **do not invoke these launchers, set a fake host flag, or claim a native `/super-build` run succeeded**. This tested workflow is ChatGPT-operated *Super Build procedure*, not native slash-command runtime support. Never drain the whole Ready queue; operate only on the one selected issue.

A ChatGPT chat with both **GitHub connector and authorized Remote Desktop Commander** can execute the *ChatGPT-operated* builder procedure (source via GitHub, isolated local fetch/build/test, draft GitHub PR) without any external coding model. GitHub-only access cannot execute tests and must not be reported as verified build work. Do not copy filled environment files or reuse a retained financial database; verify dedicated disposable database targets before all DB-touching tests.

Recommended role selection after checking availability: stronger reasoning for architecture amendment and accounting/security QA; a capable implementation model for fully specified small adapter tasks. No lower-reasoning agent receives an unresolved accounting task. Required skills are those installed in the issue's executor, checked by readiness tooling: Super Board/Super Build, implementation/TDD, smallest-change guidance, systematic debugging when failing, code/security review, verification before completion. Do not install or upgrade skills as an undocumented module side effect.

## Shared-file ownership and conflict rules

Coordinator serializes: frontend `src/App.tsx`, `src/types/erp.ts`, `src/integration/{http,session,operation,decimal,errors}.ts`, shared cart/picker changes; backend `packages/core-contracts/src/index.ts`, `permissions.ts`, `settings.ts`, `packages/core-application/src/index.ts`, adapter `schema.ts`, migration files, API module provider wiring and CI workflows. Resource/task-specific files belong to that issue's worker only. An allowlist of a whole `src/` directory is invalid.

Two repositories require linked PRs and a compatibility order. Additive server contract first; frontend begins using it only after the approved server head is available to the authorized runner. A draft PR can test against a pinned paired backend head without claiming that head is merged. Do not merge either automatically. If a source contract changes, pause its dependent packet, update mapping/test vectors, have the coordinator rebase/resolve, and reverify; do not add speculative fallback parsing to accept incompatible meanings.

On interrupted build: record exact head, dirty paths, last command, uncertain database effects and operation IDs, held reservation and resume instruction. Keep worktree/data intact for coordinator reconciliation. If a POST outcome is unknown, do not reset its identity or rerun it under a new key. Resume only after verifying current owner, baseline and prior evidence. Release capacity with a deliberate handoff; do not run crash recovery across the other four chats.

## Verified ChatGPT → GitHub → Remote Desktop Commander → GitHub build procedure (2026-11-13)

**Pilot:** [NestSherERP draft PR #33](https://github.com/shuvodelux-commits/nestshererp/pull/33) for D08/MOD-004 trading-ledger isolation; backend initial ref `d2060a7b2c9e2b364b0d0e6d5aad1d077fa76a75`, GitHub pilot head `e403d4ad37d82eccea76294b830ff5cadae1194e`. Tests were run on a dedicated newly created disposable PostgreSQL16 container. Test-first assertion **RED** (HTTP 200 where 400 required), then **GREEN**, 32/32 Parties API tests passed, scoped typechecks and ESLint passed. The test ran under local Node24 (backend declares Node20), so authoritative Node20 CI and independent QA remain separate gates. No Codex/Claude worker or native `/super-build` launcher was invoked. The exact final head contains two comment-only clarification commits following the tested functional head; future CI must still check the final SHA.

1. **Read** both repositories' AGENTS.md, the actual issue, accepted dependencies, skills, exact allowlist, current GitHub refs and Project reservations. Do not assume a prior chat's branch or an active Build slot.
2. **Author source and tests via GitHub first.** Create one isolated feature branch from an immutable approved source SHA, make focused commits using the connected GitHub API, and never push local source edits as an alternative. Capture the initial failing regression where applicable.
3. **Use ChatGPT as the sole reasoning/coding agent.** Via @Remote Desktop Commander, fetch that exact GitHub branch into a new clean isolated worktree on the authorized CachyOS computer. Do not invoke `codex`, `claude`, their headless scripts, or a queue-draining slash dispatcher. Reading the Super Build skill and applying its checks is permitted; claiming the native skill launcher ran is not.
4. **Verify with the computer, not a connector success claim.** Prove the checkout HEAD matches GitHub, install dependencies frozen, run allowed focused RED/GREEN tests and required typecheck/lint/build/boundary checks, inspect failed logs, and re-author any fixes in GitHub before fetching again. For DB tests, create and identify a brand-new disposable DB/port/container, assert all URLs point to it, and destroy it after testing. Never execute against development or production records.
5. **Finalize in GitHub.** Compare the branch diff to its exact file allowlist, create a **draft PR** linking the issue, report actual test counts/exits and runner/toolchain, mark remaining QA/CI gaps, and hand to an independent reviewer. Preserve the worktree as required for QA. No automatic merge, deployment, financial posting or schema migration.
6. **Parallel work:** repeat for *any number of safe nonoverlapping modules* supported by actual independent ChatGPT sessions and isolated resources, with coordinator-owned shared contracts and serialized merges. No hard-coded five-worker queue or assumption that the historical Codex runner launches ChatGPT.

**Tooling evidence and limitation:** Backend [draft PR #35](https://github.com/shuvodelux-commits/nestshererp/pull/35) adds a separately tested ChatGPT-assisted workstation launcher, not a native model host: **13/13 safety tests** passed, and a real GitHub PR #33 checkout yielded `state: verified` after frozen install, build, typecheck, lint and boundaries. One initial typecheck failure and successful retry are both retained. The native `/super-build` host detector still does **not** support ChatGPT (exit 65); do not invoke or misrepresent it, and do not replace ChatGPT with Codex/Claude. This v1 adapter cannot run DB tests, open PRs, merge or deploy; those remain separate authorized steps.

**Launcher invocation (only after PR #35 is approved/accepted in the executing checkout):** `python3 .agents/bin/super-build-chatgpt.py prepare ...`, then `verify --receipt <absolute-path> --check install|build|typecheck|lint|boundaries`, then `finalize --receipt <absolute-path>`. The owner-approved issue supplies exact `--allow` files, immutable `--head`/`--base`, unused worktree/receipt, and check authorization. See the linked backend reference for full arguments. The script does not implement a ChatGPT model API or distributed worker reservation; the coordinator must verify actual concurrency safety. No blanket five-chat quota.

## Reusable conversation prompt

```text
Implement only <MOD-ID>/<TASK-ID> from the approved GitHub packet at
<repo/path + immutable plan commit>. Read its global rules and linked contracts.

Issue: <real issue URL>. Approved revision: <plan SHA>. Owner approval: <link>.
Chosen execution environment: <runner ID/method>. Session owner: <unique ID>.
Frontend baseline: <repo/branch/full SHA>. Backend baseline: <repo/branch/full SHA>.
Allowed writes: <exact paths>. Shared-file owner: <coordinator/session>.
Dependencies: <accepted heads/PRs>. Disposable DB: <identity/host/port, no secrets>.
Verification: <exact static, test and UI commands authorized for this task>.

First reconcile issue comments, actual PR heads, verified board/runner capacity (target
actual concurrent session capacity and unique claims per 2026-11-13 owner override),
coordinator reservation, nonoverlapping shared-file ownership, real checkout and the
source symbols named by the packet.
Show the frontend/backend comparison if this approved revision has not already
received its 10–15 sentence overview and environment approval. Do not demand a
second START when the existing approval covers this revision/environment.

For ChatGPT+Remote Desktop Commander, execute the documented Super Build
checklist interactively; do not invoke headless Codex/Claude or drain Ready,
change worker capacity, take another chat's module or install tools silently.
A connector-only session must use the named runner for execution or report BLOCKED.

Preserve every existing HisabIQ page, component, compact style, Bangla/English,
keyboard/touch flow, drafts, unit chain and source-context action. No Reports work.
Use the specified controller/use case/repository and exact money/quantity rules.
Do not invent missing DTOs, business decisions, endpoints, fallback success or tests.
If source/contract differs, stop that task and report the concrete conflict.

Write the approved meaningful behavior test first, run it against the disposable
fixture, implement the smallest source change, verify exact effects and rollback,
then run the authorized repository gates. Never initialize retained development
or production data. Evidence must identify both repo SHAs and actual runner.

Open linked draft PR(s), include acceptance evidence and source-action trace,
request independent scoped QA on the exact heads, fix verified defects within
scope, and hand the result to the owner for review. No merge or deployment.
```

## Draft PR evidence contract

Problem/result; module/task and approved packet revision; actual changed paths and shared ownership; paired source SHAs; exact UI→request→service→repository→transaction→response→UI→test trace; command exits and runner/database identity; before/after open-state screenshots where UI touched; journal/stock/source assertions for monetary flows; independent QA head and remaining findings; unimplemented acceptance items; manual walkthrough; rollback. A partial PR says Refs issue and states incomplete work; it never claims Closes/Done. Humans approve every merge.
