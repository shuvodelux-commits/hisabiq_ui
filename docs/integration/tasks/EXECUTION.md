# Five-chat ownership and Super Build execution contract

Revision 2 ordering is governed by [integrate then extend](../HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md) and [cash transaction classification](CASH_SESSION_POLICY.md). Stage A compatible integration precedes Stage B missing backend capabilities; no UI removal or fake posting. Historical opening balances do not require a cash session.

This document prepares future implementation. It authorizes no worker startup, issue mutation, database initialization, merge or deployment in this planning session.

## Coordinator-owned dispatch record

Use GitHub Project [#2](https://github.com/users/shuvodelux-commits/projects/2), actual issue/PR state and checked-in board configuration. **Owner override (2026-11-13): target up to five concurrent, separately approved BUILDING module sessions, not one.** Each chat owns exactly one issue, unique executor/session, isolated GitHub branch/worktree and disposable test database. Coordinator verifies actual Project #2 Building claims and runner capacity before every dispatch; five is a ceiling, not permission to start a dependency-blocked task. One chat may not consume another worker's issue or edit a shared file while someone else owns it. The runner's actual max_workers setting must be located, verified and explicitly changed through its separate governance task; the previously documented config path was not present at review, so this Markdown alone does **not** establish five available runtime slots. Builder, QA and reviewer remain separate roles; scoped independent QA and human merge still apply.

| Chat slot | First packet | Preparation allowed | Build dependency | Initial reservation |
|---|---|---|---|---|
| 1 | MOD-001 settings/team | Independent remaining compatible read/permission slices | Accepted foundation and exact MOD-001 packet | Coordinator must check live claim |
| 2 | MOD-002 products/catalog | Continue already scoped Catalog/Product tasks | Accepted catalogue heads; no rich-field loss | Existing Building claim may occupy this lane |
| 3 | MOD-004 parties | [Backend P0 ledger isolation #28](https://github.com/shuvodelux-commits/nestshererp/issues/28) | Role-scoped read test/contract; no finance write or shared migration | Separate runner/claim required |
| 4 | MOD-005 cash sessions | Reconcile PR #282 and approved backend ON/OFF | Own settings/session policy and locks exclusively; no duplicated cash adapter | Separate runner/claim required |
| 5 | MOD-006 accounts/finance | Compatible account read integration only | Accepted foundation/account head; D08 write paths remain gated | Separate runner/claim required |

The table is a proposed lane split, **not** five active reservations or five preapproved build tasks. A chat takes one independently authorized issue and exact file allowlist at a time. Five can be Building concurrently only after live runner-capacity, nonoverlapping ownership, accepted dependency heads and environment checks. Independently working chats do not grant each other merge, DB or migration authority. After a handoff, a lane may take a later packet; do not compress the other modules into these five assignments.

Every dispatch issue must contain: module/task ID; plan file and revision commit; 10–15 sentence frontend/backend comparison and outcome; dated owner approval and chosen executor; unique owner session ID; repository/base branch/full SHA; branch/worktree; related frontend/backend PR pair; dependency heads; exact allowed files; coordinator-owned shared files and reserved migration number; disposable database identity/port; verification commands and test authorization; acceptance criteria; rollback; remaining blockers; draft PR/evidence/resume action.

An assignee or label cannot implement a distributed lock. The coordinator reconciles actual active workers, issue comments, PR head and worktree evidence before confirming reservation. Competing claims pause dispatch; never force-release or delete another session's worktree. A stale-looking comment is insufficient evidence of abandonment.

## Five-lane execution invariants (owner override, 2026-11-13)

- **Capacity:** maximum five active implementation sessions total across frontend/backend, not five per repo. A Project 2 Building card represents an actual uniquely claimed session; no builder self-promotes an issue. A runner still configured for one may host **only one** while additional sessions require other individually verified authorized runners or an approved capacity change.
- **Isolation:** unique branch and worktree per task. Each test runner uses its own disposable PostgreSQL database/container and verifies the database target before fixtures/migrations; never share a mutable test DB between builds. CI must be pinned to each pair of frontend/backend commits.
- **Ownership:** coordinator assigns exact allowed paths and a cross-repo ownership map before dispatch. Exclusive global writers for shared HTTP/session helpers, Party/Finance types, backend contract exports, controller/module providers, schema/migration numbers, permissions/settings and cash-session locking. Conflicting tasks wait for the owner to publish an accepted shared contract, but unrelated work may proceed.
- **Accounting dependencies:** MOD-004 trading ledger isolation may be a separate read-only slice; MOD-005 owns cash-session ON/OFF/locking; MOD-006 owns lender/borrower/owner finance posting; D07/MOD-012 owns expense-payable treatment. Multiple jobs may run simultaneously, but no payment/finance workflow is activated until its required server contract, session policy, schema and reconciliation tests are accepted. Historical openings remain session-free.
- **Concurrency evidence:** before adding any additional Building claim, inspect all current Project #2 Building tasks, active local/remote sessions, target shared files and any unmerged PR's actual head. No claims of idle capacity based only on stale comments. The coordinator alone assigns/releases reservations and handles conflicting merges serially.
- **Runtime configuration:** the earlier reference to `.claude/super-board/configs/hisabiq-nest-adoption.json` is not evidence of a currently present/checked-in file; it was not found at the documented GitHub path or local checkout when inspected. Locate the actual active runner config and update its worker limit through an approved isolated change before claiming that a single Super Board instance supports five. The logical five-chat policy is effective as owner direction even if the physical runner needs additional setup.
- **Safety:** GitHub branches and draft PRs only; no direct commits to main, auto-merges, production deploy, retained DB writes, broad queue draining, mass resource changes or parallel schema migration. Independent accounting/security QA remains mandatory per actual candidate SHA.

## Installed workflow use

Source-inspected bundle paths: `.agents/skills/super-board/SKILL.md`, `.agents/skills/super-build/SKILL.md`, host links under `.claude/` and `.codex/`, `.agents/bin/super-board-lane.sh`, checked-in config `.claude/super-board/configs/hisabiq-nest-adoption.json`.

Use the installed builder lane only for the selected approved card. Do **not** invoke standalone queue-draining `/super-build` or a whole-board run from a module chat. The installed headless lane accepts `--backend codex --config <file> --card <selected-card-json-file> --lane build --codex=<approved-model>`; this is a source-verified interface, not a tested execution in this environment. The coordinator supplies authentic hydrated card data and verifies helper readiness before invoking it. Preserve its GitHub read budget, selected skill readiness, verification gate, result schema and PR evidence. Model names/availability and reasoning effort must be checked in the chosen runner; an issue cannot promise an unavailable model.

A connected GitHub chat can read/edit source and open PRs, but that is not an executed headless build. It must hand off to the named authorized runtime or report BLOCKED. A local CLI setup on one computer proves nothing about Codex Cloud readiness. No agent may copy filled environment files or reuse a retained financial database to make tests convenient.

Recommended role selection after checking availability: stronger reasoning for architecture amendment and accounting/security QA; a capable implementation model for fully specified small adapter tasks. No lower-reasoning agent receives an unresolved accounting task. Required skills are those installed in the issue's executor, checked by readiness tooling: Super Board/Super Build, implementation/TDD, smallest-change guidance, systematic debugging when failing, code/security review, verification before completion. Do not install or upgrade skills as an undocumented module side effect.

## Shared-file ownership and conflict rules

Coordinator serializes: frontend `src/App.tsx`, `src/types/erp.ts`, `src/integration/{http,session,operation,decimal,errors}.ts`, shared cart/picker changes; backend `packages/core-contracts/src/index.ts`, `permissions.ts`, `settings.ts`, `packages/core-application/src/index.ts`, adapter `schema.ts`, migration files, API module provider wiring and CI workflows. Resource/task-specific files belong to that issue's worker only. An allowlist of a whole `src/` directory is invalid.

Two repositories require linked PRs and a compatibility order. Additive server contract first; frontend begins using it only after the approved server head is available to the authorized runner. A draft PR can test against a pinned paired backend head without claiming that head is merged. Do not merge either automatically. If a source contract changes, pause its dependent packet, update mapping/test vectors, have the coordinator rebase/resolve, and reverify; do not add speculative fallback parsing to accept incompatible meanings.

On interrupted build: record exact head, dirty paths, last command, uncertain database effects and operation IDs, held reservation and resume instruction. Keep worktree/data intact for coordinator reconciliation. If a POST outcome is unknown, do not reset its identity or rerun it under a new key. Resume only after verifying current owner, baseline and prior evidence. Release capacity with a deliberate handoff; do not run crash recovery across the other four chats.

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
maximum five independent BUILDING sessions per 2026-11-13 owner override),
coordinator reservation, nonoverlapping shared-file ownership, real checkout and the
source symbols named by the packet.
Show the frontend/backend comparison if this approved revision has not already
received its 10–15 sentence overview and environment approval. Do not demand a
second START when the existing approval covers this revision/environment.

Run the installed scoped Super Build lane for this card only. Do not drain Ready,
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
