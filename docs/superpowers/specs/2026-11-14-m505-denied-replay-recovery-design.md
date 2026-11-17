# M5-05 ambiguous cash replay denial — design (issue #557)

## Intent and scope
A store operator must not accidentally initiate a second financial intent when an earlier Start, Close, or Reopen may already have committed but its HTTP acknowledgement never reached the browser. Source of truth: current React CashSessionProvider, signed session epoch and original Nest operation ID; see issue #557. This is a security/accounting repair, not a redesign.

## Root cause and existing behavior
A pending cash operation retains its identity, fingerprint, ULID, and send closure. A network failure leaves it pending, but the next explicit confirmation can receive 401/403/409 after the original commit and the existing catch block clears the pending object on any 4xx. The distinction between a definitive *first* rejection and a rejection of a *possibly committed* original request is missing.

## Approaches considered
1. **Recommended — in-memory ambiguity bit on the existing pending object**: no persistence, no API or UI change; keep original sender/body/ULID after any denied replay of an earlier unknown outcome. Clear only on genuine success, definitive first-attempt refusal, or existing verified identity lifecycle reset. Smaller blast radius, but hard reload remains an explicit unresolved issue.
2. **Store the pending intent in browser storage**: might handle reload but risks leaking financial intent or replaying it after a tenant/user switch. Requires a separate crypto/retention design and is out of scope.
3. **Trust GET day after a denied replay and clear pending**: rejected; status alone cannot prove which operation posted.

The user's ongoing issue #557 and “Next” authorize approach 1 for this scoped continuation; no new feature or financial posting protocol is added.

## State contract
- **New operation**: cache original request sender, fingerprint, canonical operation ID, `uncertain=false`.
- **New operation receives a definitive 400/401/403/404/409/422**: may clear only when there was no earlier unknown outcome and the response belongs to the current verified identity. Never post to preview on failure.
- **Network error, 5xx, protocol failure, abort, or stale access-snapshot response**: mark `uncertain=true` for the same identity and operation ID. Conservative even if the server never received the request.
- **Explicit confirm after any uncertain outcome**: dispatch the *original* frozen sender with the *same* original ID and current verified token. An HTTP denial is **not** proof the original did not commit. Retain the object and keep other economic actions blocked.
- **Confirmed success**: clear pending only after genuine server response; then allow next action.
- **User/tenant/epoch change**: keep existing session lifecycle clearing/abort and never replay across identity. This may lose an ambiguous ref; separate reconciliation contract is needed before release.
- **Cash Session OFF**: never turn it ON, use preview, or bypass permission to confirm. Retain pending while same verified identity cannot use it.

## Non-goals and anti-goals
No backend schema or journal changes, no implicit retries, no new UI pattern, no free-form localStorage secret cache, no production feature flip, and no auto-merge. Avoid false accounting-complete claims from mocked browser tests.

## Acceptance evidence
Test RED before source edit and GREEN after: direct actual TypeScript policy tests for initial refusal versus denied replay, 5xx/network/aborted/stale snapshot, and success; additionally execute the mounted real React provider with controlled HTTP 401/403 and original-ID assertions at desktop/mobile when safe. The full real Nest/PG16 financial and RLS negative matrix, hard reload and independent security review remain mandatory issue #557 / release #405 gates and must be labeled unverified until actually executed.
