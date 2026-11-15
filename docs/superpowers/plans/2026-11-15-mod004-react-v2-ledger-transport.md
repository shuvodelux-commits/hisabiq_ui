# MOD-004 T14-R — React V2 trading Party ledger transport

**Source pairing:** React `main@03b657b1c33322ef5fc716972da750674e9ea31c`; Nest adoption `ef7ff0dbee446fdeac7feaa8f039bc8f46c8bb9c` after backend PR #261. Parent MOD-004 #568; task #580. This is a source-backed, unmounted React read-only adapter correction, NOT complete seven-role integration.

## REUSE / ADAPT / BLOCKED

- REUSE `readTradingPartyLedger`, strict `decodeTradingLedger`, existing selected-role query builder, SessionStore access token and AbortSignal, role-filtered poisha ledger from backend PR #261.
- ADAPT exact URL `GET /api/v2/parties/:id/ledger?role=...`; no fallback to V1. Server V2 requires role, enforces permissions before Party identity, and denies disabled Vendor feature inside transaction.
- BLOCKED/excluded: React Party routes/UI activation, finance roles, new ledger DTO, journals/payment writes, V1 profile privacy retirement, migrations and Vue.

## TDD sequence

1. Update `tests/integration-party-reads.test.ts` current URL expectation from V1 to V2. Add a direct mocked fetch regression proving that forbidden and missing V2 ledger requests each trigger exactly one V2 request, never V1 fallback. Preserve no-token-leak contract and test request `role`, filters and signal.
2. Run focused Node test on GitHub test-only commit and record exit 1 because old implementation still uses V1 (RED).
3. Change only ledgerPath in `src/integration/party-reads.ts` from `/api/v1/parties/` to `/api/v2/parties/`; do not touch V1 historical opening path or V2 list/detail.
4. Run focused integration transport tests GREEN; run 17 controller tests and any related transport regressions. Confirm no new API adapter, no retry/cache/UI mounting or funds touched.
5. Prepare exact-head ChatGPT-assisted Super Build with 3-path allowlist, fixed npm-install/build/typecheck/lint/UI-contract/unit checks, finalize. Require PR Fast CI on Node supported by project. Open draft PR; independent QA, explicit merge approval.

## Scenario matrix

- Happy path: Customer role ledger, source-linked poisha entry, date/cursor/limit exact serialization; cross-role Supplier and Vendor strict response/account decoder unchanged.
- Denial: backend V2 response 400/401/403/404/feature-disabled/5xx yields errors without retrying raw V1; invalid role, ULID, date, limit and unknown query rejected before fetch; malformed ledger response rejected.
- Network: abort, timeout, offline and session revocation discard late results and disclose no private payload.
- Non-applicable: migration, cash-session ON/OFF, financial rounding/posting, concurrency/idempotent write, offline POS, touch UI and mobile layout (no writes/UI code changed).

**Exact changed paths:** `tests/integration-party-reads.test.ts`, `src/integration/party-reads.ts`, `docs/superpowers/plans/2026-11-15-mod004-react-v2-ledger-transport.md`. All other files protected.

**Security:** The remaining V1 historical opening GET is separately role-gated by backend PR #252, but V1 Party profile/list/write responses remain a known release blocker. ConnectedWorkspaceGate must remain closed.