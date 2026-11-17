# MOD-007 M7-SEC-C01 — safe V2 customer Party projection for unmounted POS

**Source pairing:** React `main@412083eec9f175f4af9d7ef31e7e23dfacc3fe4e`; backend adoption `18385b798ad36905b164a66bd95e760c14d57352` after privacy documentation #275. Issue #588. Parent security #245 and POS QA #528. This is a read-only React source/decoder change, no POS activation.

## REUSE / ADAPT / BLOCKED
- **REUSE** existing `decodeTradingPartyList(raw, 'CUSTOMER')` (strict V2 Party response selected-role, WITHHELD vs VISIBLE states, safe integer poisha balances) and `requestJson` authenticated same-origin GET. Keep the POS customer-standing GET endpoint exactly as-is.
- **ADAPT** `src/integration/sales.ts::directoryPath` from `/api/v1/parties` to `/api/v2/parties` while preserving `role=CUSTOMER&status=ACTIVE` and exact optional search/cursor/limit. In `saleMapping.ts`, return a **new POS safe projection**, with only selected Customer role, ID, display name/phone, status, system flag, version, Customer balance/credit/group fields and page/summary; never expose hidden memberships, `profile` or `globalHistory`, even when server returns privileged VISIBLE.
- **BLOCKED:** any backend V1 privacy gate until deployment compatibility is approved; MOD-008 Supplier source adaptation; full POS UI, sales/draft/payment write flow, Vue or migration. No raw PartyResponse fallback.

## TDD steps
1. Rewrite the existing POS fixture as a genuine V2 selected Customer row with profile/history WITHHELD, and adjust the existing POS GET test to require `/api/v2/parties?role=CUSTOMER&status=ACTIVE...`. Prove it returns *no* Supplier role, private profile/global history or `hasLedgerEntries` in the POS entry.
2. Test V2 VISIBLE profile/history response still projects the same minimal safe POS item without leaking private data. Test wrong role, Supplier-only, invalid balance, injected raw NID, malformed pagination and negative summary are rejected. Include null/no credit limit, empty/next page, 401/403/404/5xx and abort/no retry.
3. Run RED focused test-only commit (old V1 transport/decode must fail).
4. GREEN: reuse strict MOD-004 decoder as the single V2 verifier, perform explicit field pick of safe POS directory fields. Keep output DTO small and pure. Do not add a second customer V2 parser or infer balance from all roles.
5. Run focused `node --experimental-strip-types --test` POS+Party+HTTP/session tests, plus the full exact-head ChatGPT-assisted Super Build 6/6 npm checks, GitHub PR Fast CI.
6. Draft PR with receipts, independent security QA and separate owner merge approval. Do not deploy or activate POS.

**Four-path allowlist:** `src/integration/sales.ts`, `src/integration/saleMapping.ts`, `tests/integrationSaleMapping.test.ts`, this plan. No other production file touched.

**Negative case applicability:** Cross-tenant RLS and live login require separate browser→Nest→PG16 acceptance; mock GET alone is not proof. Monetary source/posting, cash session, stock, idempotent write, concurrency and UI keyboard/touch/mobile are not invoked by this read-only unmounted transport.