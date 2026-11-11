# Five-chat ownership and Super Build execution contract

Revision 2 ordering is governed by [integrate then extend](../HISABIQ_INTEGRATE_THEN_EXTEND_PLAN.md) and [cash transaction classification](CASH_SESSION_POLICY.md). Stage A compatible integration precedes Stage B missing backend capabilities; no UI removal or fake posting. Historical opening balances do not require a cash session.

This document prepares future implementation. It authorizes no worker startup, issue mutation, database initialization, merge or deployment in this planning session.

## Coordinator-owned dispatch record

Use GitHub Project [#2](https://github.com/users/shuvodelux-commits/projects/2), actual issue/PR state and checked-in board configuration. Reserve exactly one active build worker; other chats may inspect approved nonoverlapping source or prepare their handoff. Do not change max_workers from1. Builder, QA and reviewer are separate roles; a passing self-review is not independent QA. Run scoped QA against the candidate head, not a generic autonomous bug-bash that changes main or unrelated modules.

| Chat slot | First packet | Preparation allowed | Build dependency | Initial reservation |
|---|---|---|---|---|
| 1 | MOD-000 foundation/auth | Source/contract review | None; D13/bootstrap amendment | UNRESERVED |
| 2 | MOD-001 settings/team | Source/field-map review | Approved MOD-000 slice | UNRESERVED |
| 3 | MOD-002 products/catalog | Source/parity review | MOD-000; approved settings dependencies; D03/D04/D16 | UNRESERVED |
| 4 | MOD-004 parties | Source/parity review | MOD-000; account identity for payment tasks | UNRESERVED |
| 5 | MOD-005 cash sessions | Reconcile issue281/PR282 and backend issue14/PR16 | Approved account identity + cash OFF amendment | UNRESERVED |

The table is a proposal, not five assigned issues. A chat takes only one module/approved task at a time. When finished, a slot can receive a later packet after a fresh source/dependency/reservation check. Do not compress the other eighteen packets into these five assignments.

Every dispatch issue must contain: module/task ID; plan file and revision commit; 10–15 sentence frontend/backend comparison and outcome; dated owner approval and chosen executor; unique owner session ID; repository/base branch/full SHA; branch/worktree; related frontend/backend PR pair; dependency heads; exact allowed files; coordinator-owned shared files and reserved migration number; disposable database identity/port; verification commands and test authorization; acceptance criteria; rollback; remaining blockers; draft PR/evidence/resume action.

An assignee or label cannot implement a distributed lock. The coordinator reconciles actual active workers, issue comments, PR head and worktree evidence before confirming reservation. Competing claims pause dispatch; never force-release or delete another session's worktree. A stale-looking comment is insufficient evidence of abandonment.

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

First reconcile issue comments, actual PR heads, board worker capacity=1,
coordinator reservation, real checkout and the source symbols named by the packet.
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
