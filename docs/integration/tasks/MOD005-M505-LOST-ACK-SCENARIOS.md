# MOD-005 / M5-05 — Super Build acceptance ledger

**Scope:** issue #523; test-only, isolated. A scenario is PASS only after
its exact test is executed. This is not complete financial release acceptance.

**Pinned dispatch sources:** frontend fdf0873c2128dd8e8702746b2beefbcc6823623d;
Nest adoption 7cffa4ebd20c60079b9453f2da0b4db73a1a20fc.
The real-financial test-script invocation was blocked by execution safeguards.
The unit transport test uses a committed ordinary HTTP upstream, not Nest.

## Executable transport tests

Run: node --experimental-strip-types --test tests/mod005LostAckProxy.test.ts
The TypeScript file is also included in the frontend npm test command.

| ID | Test behavior | State |
|---|---|---|
| T01 | Upstream commits; client receives no HTTP acknowledgement | PASS |
| T02 | External origin and noncash/malformed path are rejected | PASS |
| T03 | Wrong verb/path and second request are never forwarded | PASS |
| T04 | Upstream 409 cannot masquerade as a successful commit | PASS |

**Transport T01–T04 do not prove real financial idempotency.**

## Real accounting and React scenario matrix

| ID | Required distinct scenario | State |
|---|---|---|
| R01 | START: real Nest commit, lost ACK, rotate token, original ULID retry, exactly one session/journal | BLOCKED |
| R02 | CLOSE matched: same flow and immutable close once | BLOCKED |
| R03 | CLOSE shortage + reason: exact variance and lost-ACK replay | BLOCKED |
| R04 | CLOSE overage + reason: correct signed variance and replay | BLOCKED |
| R05 | REOPEN: lost ACK + rotated token + original ULID; one supersession/reversal | BLOCKED: backend #114 |
| R06 | Changed note/reason using an old operation ULID is rejected | BLOCKED: backend #114 |
| R07 | Same-ID concurrent requests converge, distinct-ID conflicts reject | NOT VERIFIED |
| R08 | Invalid ULID, cash precision, negative amount, wrong date, missing reason | NOT VERIFIED |
| R09 | Stale session, already closed, earlier day, wrong revision | NOT VERIFIED |
| R10 | Anonymous 401; view-only cashier 403 Start/Close/Reopen | PARTIAL: #507 Start/Close only |
| R11 | Wrong-tenant access, FORCE RLS and per-entry journal balancing | PARTIAL: prior M5-03 only |
| R12 | Real mounted React lost response and retry, token rotation, desktop and mobile | NOT VERIFIED |
| R13 | Cash Session OFF ordinary cash writers post without an open session | BLOCKED: backend #15 |
| R14 | Cash ON requires eligible drawer; bank/MFS and historical openings exempt | NOT VERIFIED for all writers |
| R15 | Day rollover, settings races, stock, audit/outbox and offline conflict cases | NOT VERIFIED |
| R16 | No duplicate close, audit, reversal, outbox, journals or cross-tenant rows | BLOCKED |

## Source audit — not an HTTP reproduction

Nest cash-session-service.ts has idempotency.find/save for START and CLOSE,
but their request fingerprints omit note and reason. REOPEN receives
operationId but has no find/save replay and rejects a retry after the
first successful reopen as "This day is not closed". Source gaps tracked
in backend issue #114. No production change is authorized in issue #523.

## Scope and review gate

Builder leaves work on a draft/WIP PR for QA and Reviewer. Do not
merge, deploy, activate ConnectedWorkspaceGate, or mark #523/#425/#405
completed on the basis of T01–T04. Preserve original demo database.
