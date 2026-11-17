# MOD-004 T16-R — unmounted V2 historical opening read transport

**Source:** React main `a918a7a18e10a602b4cc7d70a24a473469ca80c6`, paired Nest adoption `91dd0ccf744622e0c64adf32a63b9599d126f979` (backend PR #269 merged). Task #584; parent #568.

## REUSE
Existing strict `readHistoricalPartyOpening` and `decodeHistoricalPartyOpening`, selected role/id local validation, `requestJson` bearer/redirect/AbortSignal, null-vs-source semantics and unmounted `TradingPartyReadController`. Existing backend V2 signed-RLS route `GET /api/v2/parties/:id/opening?role=...` implements role-before-identity, Vendor OFF parity and historical noncash source, no new posting.

## ADAPT
Switch opening read path only to V2. Extend the exact-match HTTP gate `isPartyV2Path` with canonical uppercase ULID and a single recognized role for the `/opening` path, plus pathname guard; keep same-origin GET-only, no body, no operationId, redirects/error parsing and no V1 fallback. Do NOT alter unrelated Party transport/list/detail/ledger queries, React UI, backend or migrations.

## Test-first
1. RED update opening happy-path URL expectation; add role/permission error no fallback, null no opening, tampered response/extra keys, signal and no session tests. Existing V1 opening call should fail.
2. RED shared HTTP test allows canonical V2 opening GET Customer/Supplier/Vendor and rejects missing/duplicate role, bad ULID, traversal, unknown params, non-GET/operationId/body. Existing strict gate should reject allowed new V2 opening GET.
3. GREEN minimal URL change and narrow shared HTTP allowlist, rerun both suites and controller suite, no 401/403/404/5xx automatic retries.
4. Exact-head ChatGPT-assisted Super Build on isolated worktree with only five paths; npm install/build/typecheck/lint/ui-contract/unit. GitHub PR Fast CI exact head, review + separate merge gate.
5. Document any broader live React→Nest→PG16 browser acceptance as unexecuted, not covered by fetch mocks.

**Exact allowlist:** `src/integration/party-reads.ts`, `src/integration/http.ts`, `tests/integration-party-reads.test.ts`, `tests/integrationHttp.test.ts`, this plan.

**BLOCKED:** V1 PartyResponse PII #245, finance-role sources (Lender/Borrower/Owner/Payee), connected Party activation, payments/cash settings, journal writer, Vue. No UI changes.

**Non-applicable:** financial concurrency/idempotent write, rounding/stock/cash register, device/POS offline, keyboard/touch/mobile changes. Read-only metadata transport, no UI.
