# MOD-007 / M7-01b2-P0B — Globally ranked POS search and stock-status pagination

> **Status: CONDITIONAL DESIGN PROPOSAL, NOT AN APPROVED BUILD CONTRACT.**
> This is a source-audited frontend/backend compatibility design following the
> merged [M7-01b2-P0A backend fix #46](https://github.com/shuvodelux-commits/nestshererp/pull/46).
> It authorizes **no** SQL, schema, migrations, API/React changes, tests, posting,
> deployment or production reads. The owner must separately approve the
> proposed query/cursor semantics and a bounded implementation/test slice.
>
> Tracking: [M7-01b2-P0B issue #423](https://github.com/shuvodelux-commits/hisabiq_ui/issues/423),
> [parent integration readiness #402](https://github.com/shuvodelux-commits/hisabiq_ui/issues/402).
> Source pins: frontend \`main@ef4e040f14322a3af5aa86a2c31feb71d5b97521\`;
> backend adoption branch (not main) \`chore/hisabiq-adoption-runtime-a01@22b6fbf534a1c69419d1630599a9d4a055af7614\`.

## 1. Verified source evidence and contract

| Layer | Current implementation | Evidence |
| --- | --- | --- |
| React POS V2 | Preview \`Pos.tsx\`, \`CartTable.tsx\`, \`ProductCombobox.tsx\`, \`usePosCart.ts\` retain compound-unit cart, barcode and keyboard/touch interaction. **Not connected.** | [POS source](https://github.com/shuvodelux-commits/hisabiq_ui/blob/ef4e040f14322a3af5aa86a2c31feb71d5b97521/src/pages/Pos.tsx), [shared picker](https://github.com/shuvodelux-commits/hisabiq_ui/blob/ef4e040f14322a3af5aa86a2c31feb71d5b97521/src/components/pos/ProductCombobox.tsx) |
| Authenticated frontend read client | \`readPosProducts\` GET-only and strict \`decodePosProducts\`; no preview fallback, no rich multi-unit projection. | [merged adapters](https://github.com/shuvodelux-commits/hisabiq_ui/blob/ef4e040f14322a3af5aa86a2c31feb71d5b97521/src/integration/sales.ts) |
| Public Nest contract | \`GET /api/v1/sales/pos-products\`; search/barcode/categoryId/brandId/stockStatus/customerPartyId/cursor/limit (1–100); bare \`{items,nextCursor,negativeStockPolicy}\`. Cursor text max 120, **not explicitly typed or bound to filters**. | [sales Zod contract](https://github.com/shuvodelux-commits/nestshererp/blob/22b6fbf534a1c69419d1630599a9d4a055af7614/packages/core-contracts/src/sales.ts#L393-L459) |
| Application search | Requires \`SALE_CREATE\`; obtains dealer policy, expiry policy, role-aware customer group; fetches \`limit+1\` ID-ordered repository rows; ranks the *retrieved page* with \`searchProducts\`; derives status on each row; **then filters by stockStatus**. | [SaleQueryService](https://github.com/shuvodelux-commits/nestshererp/blob/22b6fbf534a1c69419d1630599a9d4a055af7614/packages/core-application/src/sales/sale-query-service.ts#L180-L273) |
| PostgreSQL selection | Tenant + ACTIVE + nondeleted + exact barcode + normalized all-token search + optional brand/category + ID-keyset \`products.id > cursor\`, ordered by ID with \`LIMIT\`. Aggregates qty from cost state or nonexpired owned OPEN lots according to expiry policy. | [PostgresSaleRepository](https://github.com/shuvodelux-commits/nestshererp/blob/22b6fbf534a1c69419d1630599a9d4a055af7614/packages/adapter-postgres/src/sale-repository.ts#L1273-L1390) |
| Shared ranking | \`normalizeSearchText\` performs NFC/case fold, Bengali digit mapping, punctuation/ZWJ handling; \`rankProduct\` tier ordering is exact barcode, exact SKU, exact name, name prefix, word prefix and substring fallback; positive stock wins within tier. | [product-search.ts](https://github.com/shuvodelux-commits/nestshererp/blob/22b6fbf534a1c69419d1630599a9d4a055af7614/packages/core-domain/src/catalog/product-search.ts#L40-L184) |
| Shared stock status | Qty and minimum stock use scale-3; status: negative → NEGATIVE, zero → ZERO, positive at/below min → LOW, otherwise IN_STOCK. | [stock-status.ts](https://github.com/shuvodelux-commits/nestshererp/blob/22b6fbf534a1c69419d1630599a9d4a055af7614/packages/core-domain/src/inventory/stock-status.ts) |

### What PR #46 did—and did not—fix

P0A correctly moved the cursor boundary to the last **ID-ordered consumed product** rather than the last item after relevance reordering. This protects the existing ID keyset from one skip/duplicate failure, but it **does not** globally rank search results or filter stock **before** choosing a page.

For example, with \`limit=2\`, matching product IDs \`A,B,C,D\` and relevance order \`D,C,A,B\`, the current first page contains only \`A,B\` (reordered within the page), even though \`D\` is globally most relevant. If \`A,B\` are IN_STOCK but \`C,D\` are LOW_STOCK and \`stockStatus=LOW_STOCK\`, the first response can return \`items=[]\` with a non-null next cursor, even when later products match the filter.

These are **algorithmic illustrations**, not claims of executed tests or observed tenant records.

## 2. Required query invariants

1. **Source of truth:** one tenant-scoped, server-owned candidate set. Product status, deletion, brand/category, barcode and normalized-token eligibility are applied *before* pagination; no client-side approximation of monetary/stock authority.
2. **Stock filter ordering:** an explicit \`stockStatus\` must operate on the same effective \`qtyOnHand\` used to produce \`items[].stockStatus\` **before** \`LIMIT\` and cursor evaluation. Missing stockStatus means all four stock categories remain visible; zero and negative products remain selectable subject to *posting* policy, which is separate.
3. **Expiry-aware stock:** \`EXPIRED_STOCK_SALE_POLICY=BLOCK\` uses valid remaining OWNED OPEN lots, with undated lots included; WARN/ALLOW uses the current state aggregation as the existing API does. Do not accidentally filter by \`sellableOwnedQty\` rather than the defined \`qtyOnHand\`.
4. **Global relevance:** when ranked mode is requested with nonempty text, apply the domain hierarchy over the **entire filtered candidate set before limit**. A product that ranks higher must not be hidden behind an earlier low-ID page. Preserve normalized Bengali digits and the word/token matching semantics.
5. **Stable total order:** for ranked mode, use \`(rank DESC, id ASC)\` (stock bonus is part of rank) with a unique ULID tiebreak; for unranked empty search, \`id ASC\`. SQL \`ORDER BY\`, keyset predicate, and next-cursor construction MUST be based on this identical tuple.
6. **Pagination correctness under fixed data:** returned \`items\` contain at most the requested limit, and \`nextCursor=null\` iff no later eligible result exists; no skipped, repeated or empty intermediate pages for a stock filter.
7. **Query-bound continuation:** rank-mode, normalized query, exact barcode, category, brand, stock status, tenant context and policy-effective stock date must be bound to cursor validation. A changed filter, tenant or cursor version must fail cleanly or restart explicitly, never silently enumerate mismatched products.
8. **Currency and permissions:** preserve exact integer poisha, scale-3 quantity, optional \`groupPriceMinor\`, and **absence** of \`purchasePriceMinor\` when COST_VIEW is missing. Ranking and WHERE clauses cannot reveal cost.
9. **Customer relationship:** P0A preserves CUSTOMER dealer price, VENDOR credit-sale selection without customer-only group price, and rejects invalid selected parties in the current dealer lookup; new query paths must not undo this.
10. **Concurrence is explicit:** per-page deterministic ordering under an unchanged snapshot is not the same as consistent multi-page results during live stock/product edits. Decide whether to reject stale cursors, anchor a version/watermark or document best-effort continuation. No claim of snapshot consistency without an implementation.

## 3. Options — do not silently pick an incompatible authority

| Approach | Benefit | Cost / failure mode | Decision |
| --- | --- | --- | --- |
| A. SQL filter + globally ordered rank and versioned cursor | Filter before limit; efficient keyset; one canonical server ordering; scalable candidate architecture | Requires **exactly equivalent normalization/rank**, likely normalized searchable field projections or database functions, SQL changes, index/query plan, per-tenant migration/backfill and cursor-version rollout | **Recommended design candidate**, conditional on contract/schema/security QA |
| B. Stream all matched products into a bounded in-memory top-K ranking on each request | Can reuse JavaScript \`rankProduct\` exactly; avoids immediate SQL rank duplication | Every page scans all candidates, computes expiry-aware lots and dealer prices, raises tail latency and per-tenant resource use; hard cap silently omits matches | **Do not ship as default** without a proven bounded, explicit contract/performance budget and no omitted matches |
| C. Retain ID-based keyset and only locally rank the current page | Preserves v1 API and PR #46 cursor continuity, no new schema | Violates global relevance; a first page can be empty with later stock matches | **Keep as legacy compatibility only**; not acceptance for globally relevant POS search |

### Suggested additive protocol, not a committed public API

Prefer an **opt-in** globally ranked mode (provisional name \`rankingMode=GLOBAL_V2\`) with the legacy v1 ID-keyset unchanged by default. This requires a versioned Zod query addition, an accepted frontend adapter change *when* the backend implementation is ready, and documented error behavior.

A v2 opaque cursor must encode or securely bind (a) rank tuple, (b) last ULID, (c) normalized-filter fingerprint and (d) an agreed date/version context, staying within—or explicitly expanding in an approved version—the current 120-character cursor limit. A continuation with a raw v1 ULID in v2 mode must be rejected, not silently mixed. Consider tamper resistance and unauthorized cross-tenant reuse, but do not use client-supplied tenant IDs or price data as authority.

**Open product normalization decision:** Existing \`products.searchText\` is a normalized concatenation, which is useful for token containment but does not on its own preserve independent normalized \`name\`/\`sku\`/\`barcode\` identities for the exact-rank tiers. A SQL \`lower(name)\` shortcut is *not proven equivalent* to NFC, Bengali-digit replacement and punctuation treatment. Source-audit persisted projections, migration/backfill, write paths and index choice (or a faithful SQL normalizer) before approving the rank expression.

**Open live-mutation decision:** A rank including \`qtyOnHand>0\` can change between pages when a sale posts. A query-bound token alone is not a multi-page database snapshot. Decide when the POS should restart pagination or accept best-effort results, while guaranteeing stale requests do not display a different tenant's products after session-epoch change.

## 4. Future implementation ownership — independent gated tasks, not this PR

1. **P0B-A (contract/normalization acceptance):** Co-own \`core-domain/catalog/product-search.ts\` rank semantics, \`core-contracts/src/sales.ts\` additive version negotiation, database normalization/column migration if needed and any legacy-client compatibility. Shared contract/schema and tenant migration ownership **must be serialized** with MOD-002 product writers. Explicit owner architecture signoff required.
2. **P0B-B (server query implementation):** \`core-application/src/sales/sale-repository.ts\`, \`core-application/src/sales/sale-query-service.ts\`, \`adapter-postgres/src/sale-repository.ts\` and exact supporting query fields only. SQL computes filter/rank/stock before LIMIT, validates v2 cursor, preserves OLD v1 and dealer/cost security. Only after accepted P0B-A and exclusive source reservation.
3. **P0B-C (read-only frontend adoption):** \`src/integration/sales.ts\` and \`saleMapping.ts\` only after server deployed/verified. Keep existing preview React POS fully intact; do not activate AppShell or fill a rich Product from a one-unit DTO.
4. **M7-01b2 live display/cart:** Still blocked by MOD-002 D03/D16 immutable unit chain/independent prices, MOD-004 ledger-role QA, source stock allocation, verified gate/session behavior and shared CartTable ownership. Posting waits MOD-005/006 cashier policy and server source-value tests.

## 5. Required acceptance suite for a *future separately authorized* build

No test was created or run for this design PR. Acceptance needs the owner's explicit test authorization under the backend AGENTS.md / R-0 restriction.

- **Relational/authorization:** unprivileged PG16 tenant A and tenant B using identical search terms, expired lots and party names; no cross-tenant responses/cursors; SALE_CREATE and COST_VIEW permission splits; purchase cost key absent without permission.
- **Ordering:** exact barcode beats exact SKU/name; Bangla digit and NFC variants; SKU/name prefixes; multiple word-prefix permutations; equal scores id ASC; no global rank inversion across page boundaries.
- **Stock:** at least two earlier ID pages with no requested stock status and a later matching page; 0/negative/low/in-stock with minimum edge at equality; BLOCK expiry vs WARN/ALLOW; vendor-owned excluded from owned qty. No empty filtered pages when later eligible rows exist.
- **Cursor:** page sizes 1, 2, 24, 100 and final cursor; no duplicate/skipped ULIDs under unchanged data; alter search/status/brand/category/barcode/ranking mode/tenant context between requests; malformed/truncated/tampered cursor; zero results and exact barcode scan.
- **Mutation/concurrency:** product price/name/status and on-hand stock change between pages; cursor handling according to accepted consistency policy; two requests arriving out of order; actor/session epoch rotation with no preview fallback.
- **Performance:** \`EXPLAIN (ANALYZE, BUFFERS)\` and p95 on seeded/disposable realistic 1k/10k/50k-per-tenant catalogs with indexes, normalized Bengali/search token distributions, lot counts, seller filters and price groups. **These are suggested benchmark sizes, not assertions about current customer catalogs.**
- **Compatibility:** existing v1 ID paging and merged M7-01b1 decoder, P0A vendor credit/dealer customer-role behavior, unchanged error/response envelope, preview UI keyboard and mobile interactions, independent multi-unit prices remain untouched until MOD-002 signoff.

## 6. Gate status and owner decisions

**Verified:** backend PR #46 merged at \`22b6fbf…\`, four GitHub acceptance/verification checks successful before merge; current ID-keyset continuity corrected. UI adapter from PR #397 merged. This document is a source audit, **not a code test or a proof that P0A negative role/tenant cases passed**.

**Not approved:** algorithm implementation; normalized name/code migration; rank-mode query version and cursor wire format; cross-page mutation consistency; new application tests; a database allocation; active connected POS; Product advanced unit/price policies and conversions.

**Recommended next approval packet:** sign off (1) opt-in SQL-based global rank/filter-before-limit, (2) contract mode and cursor validation, (3) normalized field authority/backfill strategy, (4) live-stock pagination consistency semantics, (5) a dedicated disposable PG16 and negative-test run, and (6) a bounded exclusive shared code allowlist with independent security/accounting reviewer. After that, P0B-A can be implemented and reviewed; no live POS UI cutover follows automatically.
