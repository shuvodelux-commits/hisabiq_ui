# MOD-008 P-SEC-S01 — V2 Supplier read projection for unmounted Purchase Editor

**Source pairing:** React main `0a31e0f51010de1ffd6447a11b40eb51783291fa`; Nest adoption `e26442e89566b1eab04d97ca6f596cc26e215dc0`; scoped issue #591, parent MOD-008 QA #535 and privacy #245.

## REUSE
- `readPurchaseSuppliers` and `readPurchaseSupplier` keep existing bearer-bound GET, AbortSignal, query validation and source identities.
- Reuse `decodeTradingPartyList(raw,'SUPPLIER')` and `decodeTradingPartyDetail(raw,'SUPPLIER')`; Nest V2 already enforces selected role and distinct WITHHELD privacy/global history. No new financial math.
- Preserve signed AP/Supplier advance net poisha, source metadata, pagination and `summary.ungrouped:null`. Retain existing Purchase source verification, resume and browser preview.

## ADAPT — exact list/detail
- GET list `/api/v2/parties?role=SUPPLIER`, optional existing search/status/cursor/limit in original canonical order.
- GET detail `/api/v2/parties/:id?role=SUPPLIER`, canonical ULID and selected trading relationship.
- Strict decoder validates raw V2 before projecting to minimal `ServerPurchaseSupplier`: id, name, `roles:['SUPPLIER']`, phone, status, system flag, version, exact Supplier balance; exclude Customer-only credit metadata, NID, address, guardian, email, notes, `hasLedgerEntries`, `profile`, `globalHistory`, and other relationship membership.
- `PurchaseSupplierList` reuses current summary/paging and types `ungrouped:null`. Do not substitute 0 or infer Customer grouping.
- Preserve independent `purchase-editor-sources.ts` source selection/identity without changing the Purchase component tree.

## TDD
1. Test-only RED in Purchase Editor source and resume suites: replace V1 server mock with actual V2 Supplier wire `readRole='SUPPLIER'`, WITHHELD/VISIBLE states and null ungrouped. Existing V1 transport/parser must fail.
2. Assert proper authenticated URLs, one list/detail per call, cross-role poisoning refused, supplier-only projected public keys, exact server poisha, 401/403/404/503 no V1 retry, errors/abort/timeout, wrong-ID and malformed/cursor data rejected.
3. GREEN implement small V2 transport + projection, preserving original strict Supplier account-direction invariants and no new server permissions.
4. Focused test suite: `tests/integration-purchase-editor-sources.test.ts`, `tests/integration-purchase-editor-resume.test.ts`, `tests/integration-party-reads.test.ts`, `tests/integrationHttp.test.ts`, `tests/integration-party-read-controller.test.ts`. Also run existing relevant draft source tests.
5. Exact-head `/super-build` assisted prepare/install/build/typecheck/lint/ui-contract/unit/finalize; GitHub Fast CI and independent QA before merge.

**Four-file allowlist:** `src/integration/purchase-suppliers.ts`, `tests/integration-purchase-editor-sources.test.ts`, `tests/integration-purchase-editor-resume.test.ts`, this plan.

**Blocked:** V1 raw PartyResponse security implementation/rollout and 7-role Party activation, purchase posting/receiving/stock, cash session behavior, product units/costs, backend/Vue/migration; no UI redesign. No signed browser→PG16 acceptance claimed from fetch mocks.