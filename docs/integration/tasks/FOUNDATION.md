> Revision 3: [MOD-000-A execution specification](../modules/MOD-000-FOUNDATION_EXECUTION_SPEC.md) supersedes this draft for its scoped work. It resolves token storage, six-digit PIN compatibility, route isolation and exact task manifests; full auth/ERP remains separate.

# MOD-000 execution specification — transport, identity and exact values

**Status:** PROPOSED. Live auth storage/Google decisions D13 still need approval. No code in this document has been executed. Files marked CREATE do not yet exist in frontend main. Do not edit Vue auth.

## FND-01 — a single fail-closed transport

**Files:** CREATE `src/integration/http.ts`, `src/integration/errors.ts`; CREATE `tests/integrationHttp.test.ts`. MODIFY consumers only in their own resource task. Owner: foundation worker. Dependencies: none. Rollback: revert this isolated addition before any consumer uses it; after adoption revert dependent changes first.

```ts
export type ApiFailure = {
  kind: 'network' | 'http' | 'protocol'; status?: number;
  code?: string; message: string; details: Readonly<Record<string, string>>;
  traceId?: string;
};
export type ApiRequest = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: `/api/v1/${string}`;
  body?: unknown; operationId?: string; signal?: AbortSignal;
};
export async function requestJson<T>(
  request: ApiRequest, decode: (value: unknown) => T
): Promise<T>;
```

`requestJson` takes only a same-origin `/api/v1/` path. Reject protocol-relative, embedded origins and paths outside that prefix. Encode IDs and serialize query parameters with `URLSearchParams`. Server/gateway configuration, never a user-entered URL, determines the upstream. Do not send bearer credentials to control-plane or courier URLs. Use a separate approved platform transport for those.

Algorithm: obtain current live access token from `session.ts`; attach authorization and JSON content type only when appropriate; attach `Idempotency-Key` only when requested by the resource adapter. Call fetch with AbortSignal. On 204 invoke the endpoint's explicit void decoder without JSON parsing. On non-2xx preserve backend `{error:{code,message,details,traceId}}` and HTTP status; absent/invalid envelope gives a static safe error. On successful non-JSON or shape mismatch raise protocol failure; do not cast an unchecked object to T. Return the **whole endpoint result** through its decoder; no global `data` unwrapping because list, money/day and other reads differ. Do not retry mutations automatically on timeout, abort or 5xx. UI retains the confirmed operation and offers retry with the same payload/ID. Log only status/code/trace, never token, password, PIN or financial request body.

Tests (before implementation): `returns raw day status`; `preserves product list page and summary`; `accepts DELETE 204`; `rejects 200 HTML`; `retains 409 code details traceId`; `does not retry timed out POST`; `does not fall back to mock success`; `rejects foreign-origin path`; `abort of old search does not replace current result`. Assertions include exact fetch count, URL, headers and unchanged draft.

## FND-02 — identity and tenant boundary

**Files:** CREATE `src/integration/session.ts`, `src/integration/auth.ts`, `src/integration/SessionProvider.tsx`; MODIFY `src/features/auth/LoginPreviewPage.tsx` (`LoginPreviewScreen.submit`) and `src/App.tsx` (provider/connected gate only); CREATE `tests/integrationSession.test.ts`, `scripts/integration-auth-browser.cjs`. Other auth pages stay preview until their packet is approved.

```ts
export type AppSession =
  | { mode: 'preview' }
  | { mode: 'connected'; state: 'signed-out' | 'authenticating' }
  | { mode: 'connected'; state: 'authenticated'; accessToken: string;
      tenantId: string; userId: string; timezone: string; permissions: readonly string[];
      features: readonly string[]; epoch: number };
```

EXT-01 in [EXTENSIONS](../contracts/EXTENSIONS.md) adds authoritative tenantId/timezone to `/me`; those fields are absent from the baseline. Deploy that additive backend contract before the connected provider. The existing `/me` schema is in backend `core-contracts/src/auth.ts`, `MyAccessResponse`; adapter transformation must be explicit. Do not assume the login response includes tenant: `LoginResponse` contains tokens and user, registration response additionally contains tenant. Fetch `/me` before rendering live data. Normalize Bangladesh phone as the existing form does; map phone → `identifier`, password → `password`; POST `/api/v1/auth/login` → `{data:LoginResponse}`. Wrong password retains phone, clears secret and shows existing inline error. Password/PIN success means successful server reply plus `/me`, not `setNotice(true)`.

Use one refresh promise per session. On concurrent 401s refresh once via `/api/v1/auth/refresh` with the rotating refreshToken; atomically replace both tokens. A mutation may be resubmitted once after successful refresh only with its original payload/idempotency identity and only if the first response was an explicit authentication rejection. Timeout is not that response. Refresh failure clears identity and sensitive query caches while preserving recoverable draft ownership metadata; no automatic preview fallback. Logout calls `/api/v1/auth/logout` with refreshToken, clears local live state even if already expired, and never treats cached permissions as current authorization.

**D13 hold:** recommended initial live tokens in memory; optional trusted-device persistence needs an approved revocation/storage contract. Existing PR282 reads `shererp_auth_token` from localStorage and is not a full login implementation. Do not silently add refresh-token storage there. PIN requires an already valid trusted device refresh credential; never authenticate with six digits alone. Account switch increments epoch, aborts outstanding reads and clears all prior-tenant state. Server tenant context comes from verified identity; there is no caller-controlled tenant body/header added by this blueprint.

Tests: two tenants A/B, identical display names, distinct ULIDs. Resolve an A request after switching to B: A data is discarded. Revoke permission server-side after page load: server denial leaves draft intact. Two simultaneous expired GETs trigger one refresh. PIN without trusted credential sends no login request. Preview forms continue to operate in preview without issuing real mutations. Real Google/signup phone verification remains BLOCKED pending D13.

## FND-03 — exact boundary conversions and durable intent

**Files:** CREATE `src/integration/decimal.ts`, `src/integration/operation.ts`; CREATE `tests/integrationDecimal.test.ts`, `tests/integrationOperation.test.ts`. Reuse present Bangla digit normalization. Do not copy the UI's float rounding into the posting adapter.

```ts
export function parseScaledInput(text: string, scale: 2 | 3 | 4): number {
  const normalized = text.trim().replace(/[০-৯]/g,
    d => String('০১২৩৪৫৬৭৮৯'.indexOf(d)));
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) throw new Error('Invalid number');
  const negative = normalized.startsWith('-');
  const [whole, fraction = ''] = (negative ? normalized.slice(1) : normalized).split('.');
  if (fraction.length > scale) throw new Error('Too many decimal places');
  const magnitude = BigInt(whole) * 10n ** BigInt(scale)
    + BigInt(fraction.padEnd(scale, '0'));
  const raw = negative ? -magnitude : magnitude;
  if (raw > BigInt(Number.MAX_SAFE_INTEGER) || raw < BigInt(Number.MIN_SAFE_INTEGER))
    throw new Error('Number too large');
  return Number(raw);
}
```

Targeted reference: decimal parsing, not complete production code; ensure TS target supports BigInt before using. Sign, zero and maximum business limits are checked by the resource schema; quantity >0, price ≥0. Reject formatted commas, exponential notation, NaN and excess precision rather than guessing. `.5` must be normalized by the existing input control to `0.5` or explicitly supported in an approved parser amendment. Tests: `1250.75→125075`; `০.১২→12`; `0.001→1` scale3; `1.005` rejected scale2; exact safe-integer boundary and overflow; empty/NaN/Infinity rejected. Keep unit-cost scale4 separate from money scale2.

Operation IDs must be canonical ULIDs, compatible with `Ulid.isValid`. Reuse/adapt the existing shared-utils ULID algorithm as a browser-safe utility if its dependency boundary permits; otherwise port that small algorithm with the same vectors and inject current epoch milliseconds/crypto randomness. `cashOperationId()` in open PR282 is only a candidate: its arbitrary first character is not evidence of canonical ULID time encoding. Do not reuse preview uid()/invoice counters.

```ts
export type PendingIntent<T> = {
  operationId: string; tenantId: string; userId: string;
  action: string; payload: T; state: 'ready' | 'sending' | 'unknown' | 'confirmed';
};
```

Create intent after review confirmation, before request; freeze payload. Duplicate clicks reuse the in-flight promise. Timeout → unknown; keep cart and intent. Retry uses same key and payload. Editing changes intent only after resolving/abandoning the uncertain old operation through a documented server reconciliation path; never silently repost under a new key. No general offline queue until MOD-020. `IDEMPOTENCY_KEY_REUSED` is a visible conflict. Versions are not operation IDs.

## Shared read and mutation rules

Each resource adapter declares request/response type and decoder using the pinned contract. Proposed `src/integration/<resource>.ts` files own field mapping. Existing React components retain their form state. A read hook owns loading/error/result and current request sequence. Query/filter change resets cursor and aborts earlier request. Keep last confirmed page visibly stale during refresh; empty and failed are distinct. Disabled monetary buttons retain drafts and focus. Successful mutation replaces data from the response, then refreshes dependent reads; it never increments a balance locally.

Keyset pagination must preserve the UI's paging controls honestly: cache visited cursors per query, reset cache when filters/sort change, enable only reached next/previous pages. An arbitrary page jump or all-data export requires an approved query capability; do not filter just the loaded page while displaying a global count. Full-sheet export and label printing must be scoped and permission-checked.
