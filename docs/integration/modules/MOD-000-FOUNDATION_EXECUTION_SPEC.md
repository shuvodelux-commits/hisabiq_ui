# MOD-000-A — integration foundation execution specification

**Revision 3, 2026-11-11. Status: OWNER-APPROVED for GitHub source changes and GitHub Actions with disposable PostgreSQL 16; execution blocked/unreserved.**

Approval provenance and live work status: [backend issue 17](https://github.com/shuvodelux-commits/nestshererp/issues/17). This approval covers only MOD-000-A and its named verification scope; other modules still require their own approved comparison and plan. No application code or tests implemented/run. This is the first bounded foundation increment; it does not complete Google/signup/recovery, durable browser-device enrollment, business-module integration or the entire ERP blueprint.

This document takes precedence over generic MOD-000 task stubs and earlier FOUNDATION.md choices for its named scope. Global UI, accounting, one-worker and human-merge rules remain in the [master](../HISABIQ_NESTSHERERP_MODULE_INTEGRATION_PLAN.md). Historical-opening and optional-cash decisions remain unchanged and are not implemented by this increment.

## 1. Source baseline and verified seams

Frontend `shuvodelux-commits/hisabiq_ui`, main `176bb1a3e8f42eef192ea3098074ac5c8a214261`; backend adoption `1643dac059e568407bba2fff38a990268dfe28fe`. Both refs rechecked for this specification. PR282 and PR16 remain separate candidates, not this source baseline. A changed listed source requires a reviewed packet amendment, not fallback parsing.

| Existing source | Actual behavior | Change owned here |
|---|---|---|
| src/features/auth/LoginPreviewPage.tsx::LoginPreviewScreen.submit | Validates BD phone/six PIN digits, clears secrets and shows preview notice | Await real password/PIN authentication only in connected build; keep preview branch |
| Same file sampleAccounts / LoginPreviewPage wrapper | Explicit fake account identities | Never send sample ID/phone as live identity; connected account picker uses only this tab's verified identity |
| src/App.tsx::App | HashRouter with public auth, /app and /saas routes | Session provider and /app guard only; route definitions/layout retained |
| src/components/layout/AppShell.tsx | TenantSettingsProvider + local RBAC + cash preview store | No production account/permission authority inferred from these providers; no rewrite here |
| src/components/layout/TopBar.tsx | Sample identity, disabled preview sign-out | Unchanged in this increment because connected business routes are not enabled yet |
| vite.config.ts | Relative base, React plugin, no API proxy | Dev-only configured same-origin /api/v1 proxy |
| apps/api/src/registration/login.controller.ts | login, PIN, refresh, logout; JSON data envelope except logout204 | Reuse routes/services without changing auth semantics |
| core-contracts/src/auth.ts::myAccessResponseSchema | user/businessName/permissions/features; lacks tenantId/timezone | Add authoritative bootstrap metadata |
| core-application/src/auth/get-my-access-service.ts | Reads user, name, permissions and feature settings in UOW | Read existing BusinessProfileRepository for current timezone/name |
| core-domain/src/auth/credentials.ts | PIN_LENGTH4 and isValidPin accepts only4 | Add six-digit support without removing existing4-digit credentials |
| shared-utils/src/ulid.ts | Browser-safe crypto, injected Clock, canonical monotonic ULIDs | Port exact algorithm into frontend utility with a small local Clock interface; no package/import across repos |

## 2. Locked engineering decisions

**Build mode:** `VITE_HISABIQ_MODE=preview|connected`, default preview; invalid value fails configuration. It is build/development configuration, not a user-facing toggle or authority. No token-presence detection changes preview into connected. A preview build issues zero real auth or business mutation requests, including when old shererp_auth_token exists.

**Credential persistence:** access token in memory; rotating refresh credential in sessionStorage key `hisabiq.live.session.v1`, scoped to current tab. Record only `{schema:1,refreshToken}`. Do not put access/refresh tokens in URL, localStorage, logs, fixture store or SaaS provider. sessionStorage survives reload but not guaranteed browser restart. This increment's returning-tab PIN is not a claim of durable trusted-device enrollment. If sessionStorage is blocked, keep credentials in memory for the tab and report that returning-tab sign-in cannot persist; successful password sign-in still works. No cookie/BFF or new dependency is introduced here.

**Live entry:** password/PIN authentication plus successful authoritative /me bootstrap are required. A returned token alone never establishes connected tenant/UI permissions. /me determines actual tenantId/userId/timezone/permissions/features. Ignore typed fixture account IDs.

**Business routes:** all existing /app pages remain preview-only until their resource integrations are approved. In a connected build, an unauthenticated /app request returns to /login; authenticated requests to still-unintegrated /app pages return to the existing login screen with the existing notice region saying that sign-in succeeded and workspace integration is pending. Do not mount AppShell/local financial stores in that connected state. Preview build retains the entire current ERP. No new holding page or redesigned shell is needed. This increment is a development authentication foundation, not a complete live ERP release. Later module packets explicitly register their connected route/provider, never merely flip all /app routes live.

**Other routes:** /saas and /design-system keep their existing preview behavior and receive no tenant bearer credentials. Public signup/recovery/Google controls keep their current honest preview/info behavior until their own approved integration; never imply a real signup/reset occurred. A caller can authenticate to these APIs only through the new tenant-auth adapter, not by treating a platform route as tenant auth.

**Requests:** only same-origin /api/v1 paths; redirect mode error so authorization never follows a redirect to another host. No component accepts an upstream URL. Dev proxy reads `HISABIQ_API_TARGET` in vite.config.ts server context (not VITE-prefixed), validates HTTP(S) URL with no credentials, default local http://127.0.0.1:3000. Production reverse-proxy activation is a later environment step; absence of the route fails honestly, never falls back to preview.

**No silent financial retries:** transport does not retry POST/PUT/PATCH/DELETE. Authentication refresh is single-flight. Safe GETs may retry once after successful refresh; a mutation returning401 is returned with draft/intent intact for explicit caller retry after refresh. Timeout/abort/5xx never creates a new operation ID or triggers automatic posting.

**Scope of permissions:** server /me permissions are the connected session's presentation hints; existing backend services enforce every operation. Preview TenantSettingsProvider/effectivePermissions cannot grant a live request. Business-module providers are wired by their later packets; this task does not replace all preview RBAC.

## 3. Exact API contracts

Existing POST `/api/v1/auth/login`: `{identifier:string,password:string}` →200 `{data:{accessToken:string,refreshToken:string,user:{id:string,username:string}}}`. Preserve generic authentication refusal for unknown identifier/wrong password; no account-existence leak. Existing frontend BD normalization maps phone→identifier; no businessCode/body tenant added.

Existing POST `/api/v1/auth/login/pin`: `{refreshToken:string,pin:string}` → same LoginResponse. Require this tab's prior server refresh credential; six entered digits use the real backend user represented by that credential. No credential means no PIN request; show password fallback. Do not pad/truncate a legacy four-digit PIN to satisfy six slots. Legacy accounts use password or existing backend UI until they set a six-digit PIN through the supported security flow.

Existing POST `/api/v1/auth/refresh`: `{refreshToken:string}` → same response; atomically replace rotating credential. Existing POST `/api/v1/auth/logout`: same request →204. Never parse204 as JSON.

GET `/api/v1/me`:200 `{data:MyAccessResponse}`. **PROPOSED additive fields:** tenantId canonical ULID; timezone valid IANA timezone, from current BusinessProfileRepository.findProfile. Retain user.id/username/displayName/roleName, businessName, permissions:string[], features:string[]. Missing/disabled user remains existing NOT_FOUND; absent credentials401. A missing profile returns NOT_FOUND. No request tenant parameter. This read adds no journal/audit/stock mutation.

Errors retain `{error:{code,message,details:Record<string,string>,traceId:string}}` and HTTP status. Malformed error bodies get safe static message with status; successful malformed bodies are protocol errors. Endpoint decoders preserve the whole result envelope; no global .data unwrap.

**PIN compatibility amendment:** retain exported PIN_LENGTH=4 for old consumers. Add `HISABIQ_PIN_LENGTH=6`; isValidPin validates ASCII digits and length4 OR6. Backend registration/security credential setters may now accept6, old4 keeps working. Do not alter existing password requirements, hashing, refund approval/step-up rules, session identity or expiry. No credential data/schema migration. HisabIQ frontend continues requiring6. This is a small explicit compatibility prerequisite, not the full auth redesign.

## 4. Exact frontend interfaces and ownership

CREATE only these production files under src/integration/:

| File | Exports / responsibility |
|---|---|
| config.ts | `readIntegrationMode(value:string|undefined):'preview'|'connected'`; no storage access |
| errors.ts | `ApiError extends Error` with kind network/http/protocol, status?, code?, details, traceId? |
| http.ts | `requestJson<T>(input:ApiRequest,decode:(raw:unknown)=>T):Promise<T>`; raw endpoint transport, no session import |
| auth.ts | `loginPassword(identifier,password,signal?)`, `loginPin(refreshToken,pin,signal?)`, `refreshSession(refreshToken,signal?)`, `logoutSession(refreshToken,signal?)`, `readMyAccess(accessToken,signal?)`; endpoint-specific runtime decoders |
| session.ts | `SessionStore`, subscribe/getSnapshot/loginWithPassword/loginWithPin/restore/refresh/lock/logout/dispose; injected AuthApi and credential storage for tests; no React |
| SessionProvider.tsx | Context exposing store snapshot/actions; effect restore only in connected mode; useSyncExternalStore |
| ConnectedWorkspaceGate.tsx | Preview→children; connected signedout→login; connected authenticated unregistered /app→login pending-workspace notice; no AppShell mount |
| decimal.ts | exact `parseScaledInput(text,scale:2|3|4):number`; use reference algorithm in FOUNDATION; support `.5` as0.5 and `1.` as1.0 after normalization; reject commas/exponents/precision overflow |
| operation.ts | canonical monotonic `generateOperationId(nowMs?:number):string`, `isOperationId(value):boolean`; port pinned ULID algorithm; default Date.now only in frontend utility |
| intent.ts | `createIntent<T>(scope,payload):PendingIntent<T>`, transition helper; freeze serialized JSON snapshot once; states ready/sending/unknown/confirmed; no financial network call or offline queue |

ApiRequest fields: method GET/POST/PUT/PATCH/DELETE, path template `/api/v1/${string}`, body?:unknown, accessToken?:string, operationId?:string, signal?:AbortSignal. Transport receives token explicitly; no circular import session→auth→http→session. Use Headers to merge defaults; reject caller Authorization override inconsistencies and invalid path/control characters/backslash/fragment/origin. Check pathname after URL parsing still starts /api/v1/ and origin equals window origin. Auth login/refresh/logout requests do not attach access token. GET /me does.

`SessionSnapshot` discriminants: preview; signed-out; authenticating; authenticated; locked. Authenticated contains accessToken, tenantId,userId,timezone,businessName,displayName,roleName,username,permissions,features,epoch. Locked contains verified display identity and refresh credential internally, but no exposed accessToken/permissions. Secrets are private to store, not exposed by context snapshot. Refresh token is never returned to a page component.

Session transitions: every new auth/logout/dispose/switch increments epoch and aborts pending controller(s). Password success validates token response then /me under the same epoch; only then save refresh and publish authenticated. Compare login user.id to /me user.id; mismatch is protocol error and no persisted credential. Failed bootstrap drops the candidate credential, best-effort revokes it and remains signedout; no sample workspace. A stale response from an old epoch is ignored, including a late refresh after logout. Login storage failure uses memory-only mode; never substitutes another account's saved credential.

Refresh: one Promise per epoch. On success validate tokens and /me, atomically replace refresh; on401/403/missing identity clear live identity. A transient network error retains private credential and enters locked/offline-auth-unavailable state, with no live permissions; do not repeatedly rotate or discard recoverable credential on a failed network read. Reload restore attempts refresh once using saved credential; failure is honest, no automatic preview. Lock after30minutes inactivity, using key/pointer/touch activity and injected clock/timers; clear access token/visible permissions, retain private refresh for six-digit PIN/password fallback. Logout clears browser/memory credential and identity synchronously, then best-effort server logout with captured credential, with bounded abort; late failure cannot reauthenticate. No shared localStorage credential is used. A browser-duplicated tab can copy sessionStorage and race token rotation; a rejected refresh signs that tab out and requires password login, never retries the old credential. Durable coordinated multi-tab device sessions are outside this increment.

Provider remains mounted above auth routes inside HashRouter; preview defaults return preview state without hitting network. Preserve existing component props/markup/styles/ref focus. Login submit becomes async, prevents duplicate submit while pending using existing button disabled/aria-busy, retains phone, clears password/PIN on failure, shows existing auth-error/notice regions. Connected /login/accounts contains only current verified tab identity (or password sign-in fallback), never sampleAccounts; preview retains both sample identities. Existing account item activation with a different query-only ID cannot change live server identity.

Since connected AppShell is held back, logout acceptance is exercised through SessionStore + browser test harness, not an invented logout button on login. TopBar sign-out is connected only when the first real workspace module is approved; no disabled preview button is falsely called a live logout integration.

## 5. Backend file manifest — no schema/migration

MODIFY `packages/core-contracts/src/auth.ts`: myAccessResponseSchema adds tenantId and timezone; re-export type already uses z.infer. Existing controller return envelope unchanged.

MODIFY `packages/core-application/src/auth/get-my-access-service.ts`: replace its private TenantRepository/name-only dependency with BusinessProfileRepository. In the same UOW read profile alongside permissions/settings; missing profile NOT_FOUND. Return ctx.tenantId and profile.timezone/businessName. Preserve disabled-user check and existing features default evaluation. Import BusinessProfileRepository from existing settings port. Do not change other identity services.

MODIFY `apps/api/src/registration/registration.module.ts`: only GET_MY_ACCESS_SERVICE factory changes its TenantRepository/TENANT_REPOSITORY argument/injection to BusinessProfileRepository/BUSINESS_PROFILE_REPOSITORY. Existing infrastructure token/provider already exists. Other factories still use TenantRepository and remain unchanged.

MODIFY `packages/core-domain/src/auth/credentials.ts`: additive4/6 PIN policy exactly as §3. No hashing/schema changes. Existing index export-star exposes the additional constant; verify no manual index export is necessary before touching it.

CREATE `apps/api/test/me-bootstrap.spec.ts`: current profile/timezone, disabled user, tenant isolation and no-mutation cases using existing fixture helpers. MODIFY `apps/api/test/login.spec.ts`: extend fixture registerAccount with optional six-digit PIN argument while preserving existing4 default; test six-digit setup/login and rotation,4-digit legacy login. MODIFY existing `packages/core-domain/test/auth.spec.ts` PIN describe block: retain four-digit assertions and add six-digit/invalid5/7/non-digit cases. Source package script is `vitest run --passWithNoTests`; focused command is `pnpm --filter @sher/core-domain exec vitest run test/auth.spec.ts`. The only direct GetMyAccessService constructor caller found is the named registration.module.ts factory; API tests instantiate Nest AppModule and have no direct constructor mock. Search again at dispatch for changed source.

No source endpoint, money writer, database table, migration, tenant data, cash/period rule, SaaS control-plane authorization or Vue page is modified. Backend deploy order: additive compatibility PR first; frontend candidate tests pin that exact backend head. Human controls both merges.

## 6. Test-first atomic implementation increments

| Task | Exact allowed production files | Test files | Acceptance |
|---|---|---|---|
| F0-01 backend bootstrap | Three backend files in §5 | me-bootstrap.spec.ts | A/B return distinct tenant IDs and profile timezones; current profile overrides stale token timezone; no journal/stock/settings write |
| F0-02 PIN compatibility | domain auth/credentials.ts | existing domain test/auth.spec.ts + API login.spec.ts | 4 and6 valid;5/7/non-digit invalid;4 and6 actual hashes authenticate; PIN without live refresh rejected |
| F0-03 raw HTTP/auth decoders | config/errors/http/auth.ts | tests/integrationHttp.test.ts, integrationAuth.test.ts | Exact envelopes,204, malformed data, error status/code/details/trace; redirect/foreign origin refused; no automatic monetary retry |
| F0-04 session lifecycle | session.ts | tests/integrationSession.test.ts | Password→me, refresh single-flight,30m lock, reload restore, storage unavailable, logout races and stale epochs |
| F0-05 exact values/intents | decimal/operation/intent.ts | tests/integrationDecimal.test.ts, integrationOperation.test.ts | Exact scales, canonical ULID timestamp/monotonicity, frozen payload/retry identity |
| F0-06 React/dev integration | SessionProvider/ConnectedWorkspaceGate.tsx; App.tsx; LoginPreviewPage.tsx; vite.config.ts | scripts/integration-auth-browser.cjs; existing auth preview browser regression | Live auth real; connected /app never shows sample data; preview unchanged; six slots/focus/Bangla retained |
| F0-07 focused CI evidence | frontend .github/workflows/integration-foundation.yml; scripts/integration-foundation-fixture.cjs | Named tests above | Paired exact SHAs; disposable PG16; actual real React→Nest authentication; no deployment |

Shared files reserved once by coordinator; tasks sequential with one worker. Tests are written before their corresponding production logic; verify meaningful expected failure, then pass. Each PR references this exact specification and its allowed-file subset. Source constructor fixture fallout must be enumerated in the validation addendum; unrelated files are not implicitly allowed.

HTTP tests: `day status remains unwrapped`; `list retains page and summary`; `204 returns void`; `200 HTML fails protocol`; `409 preserves reason/trace`; `POST timeout calls fetch once`; `preview sends zero requests even with legacy token`; `redirect refused`; `old AbortError ignored by current search sequence`; `malformed login user ID/token/myAccess fails before storage`.

Session tests: two /me responses use distinct real tenant ULIDs; a delayed A response after B login/logout never overwrites B; two concurrent refresh requests share exactly one refresh and one rotation; failed me revokes candidate but never exposes sample account; stale refresh cannot resurrect logout; expired refresh signs out; temporary network failure preserves credential privately without permissions; inactivity29m59s stays signedin,30m locks; PIN requires this tab credential and six input digits; blocked storage still allows memory sign-in; refresh replaces tab credential before its next use.

Decimal vectors: 1250.75→125075,০.১২→12,0.001→1 scale3,.5→50 scale2,1.→100 scale2;1.005 rejected scale2; 90071992547409.91→MAX_SAFE_INTEGER, next poisha rejected; scale4 independent. ULID nowMs0 with zero randomness produces26 zeros; same millisecond second ID is monotonic, time does not regress on clock rollback, first char0–7,80-bit random overflow fails. Port fixture RNG injection in tests without changing public production API. Intent: caller edits original object after creation; stored serialized payload unchanged, duplicate confirmed/sending transition cannot generate a new ID; unknown may retry same ID only.

Browser fixture: create two isolated users via existing registration API with a test-only OTP transport and known4/6 PINs; do not write retained user records. Six-digit user logs in via phone/password, /me confirms real tenant, reload rotates and bootstraps, idle locks, /login/pin real six-digit unlocks, attempting sample account query does not impersonate another person. Connected /app/pos returns login pending-workspace notice and mounts no cart preview store. Default preview build uses same existing auth screenshots and emits zero /api/v1 calls. Never use registration devCode outside disposable test mode.

## 7. Verification and reproducible runner

Backend Node20/pnpm9.15.9; frontend Node24/npm lockfile. Follow VERIFICATION.md before any migration/helper; both ADMIN_DATABASE_URL/TEST_DATABASE_URL must name the job's disposable PostgreSQL instance, never retained dev/production. CI service PG16; backend app unprivileged sher_app; fixed test JWT/OTP values only in job environment. No production credentials.

Backend commands: frozen install → lint → build → typecheck → test:boundaries; focused API command `pnpm --filter @sher/api exec vitest run test/me-bootstrap.spec.ts test/login.spec.ts`. Run domain focused command from its actual package config as fixed in the addendum. Final backend required CI stays intact; no assertion/suite weakening.

Frontend commands: npm ci --no-audit --no-fund; npx tsc --noEmit; npm run lint; npm run check:ui-contract; node --experimental-strip-types --test tests/integrationHttp.test.ts tests/integrationAuth.test.ts tests/integrationSession.test.ts tests/integrationDecimal.test.ts tests/integrationOperation.test.ts; npm test; npm run build; existing npm run test:auth-login; new node scripts/integration-auth-browser.cjs. New standalone TS helpers use explicit .ts import paths compatible with current strip-types test convention.

F0-07 workflow uses public checkout of backend immutable approved candidate SHA in a separate folder, never a moving branch. Its default equals the pinned baseline only until backend compatibility PR exists; pass candidate SHA explicitly through workflow input/paired-PR contract. Both heads are printed in evidence; an unmerged candidate is not called baseline. Install/build backend under Node20; run explicit fixture under test environment, prepare fresh PG role/schema using existing test support, bind API127.0.0.1:3000; use Node24 for React dev server127.0.0.1:5173 proxying to API. Health poll has a30second deadline; fail before browser if unhealthy. Browser script launches both preview and connected frontend on separate ports5173/5174, chromium; serial tests avoid credential rotation overlap. On teardown abort servers and destroy only job-owned service data. No required command is claimed executed in this specification.

The fixture script must be included in the approved CI PR rather than assumed pre-existing. It seeds through compiled existing registration endpoints (request OTP→complete registration), and only uses existing disposable setup helper for schema/role initialization. It reports IDs/status, never credentials/token bodies. Runtime setup has no fallback to developer .env or production endpoints. Exact CI YAML is implementation work constrained by these choices, not a request to choose architecture.

## 8. UI preservation, rollout and acceptance

Existing login AuthLayout/Input/Button/Dialog, six-slot PIN, account picker, language preferences, password visibility, refs and focus remain. Preview routes and all ERP modules remain as currently designed in preview mode. Live financial pages are not enabled with fixture data. Screenshots at390/820/1440 widths in light/dark and English/Bangla, including error/locked state, are compared to current design; adapt only text/state required to communicate actual authentication.

No broad AppShell/RBAC rewrite, no persistent multi-account credential vault, no global financial retry queue, no Google/OTP provider production setup, no money/cash-session implementation. Those are explicitly subsequent packets, not fake-complete features. Login/refresh existing backend CLASS S behavior remains; /me reads create no financial journal.

Definition of Done for MOD-000-A: named tests and required gates pass on exact paired heads; session secrets absent from logs/storage other than the chosen tab refresh slot; real /me identity/permissions validated; four-digit existing accounts remain compatible; six-digit HisabIQ PIN works with real six-digit fixture; preview regression unchanged; no connected business fixture rendered; independent QA on candidate; owner approves merge. Durable device enrollment and complete auth/ERP remain separate milestones.

Rollback: revert frontend increment before backend additive change if needed; clear only hisabiq.live.session.v1 and cancel its in-flight requests; do not clear preview settings/drafts. Backend additions are backward compatible and require no data rollback. Revoked/rotated sessions are not restored from old credentials by code rollback. No force push, schema/data reset or deployment is authorized by this document.

## 9. Runner/fixture validation addendum (source-resolved)

The backend `loadConfig` variable names are DATABASE_URL, JWT_SECRET, PORT, WEB_ORIGIN, IDENTITY_VERIFIER, SINGLE_TENANT_MODE, ENTITLEMENT_SOURCE. Fixture env: unprivileged DATABASE_URL to the job-owned database, test-only JWT_SECRET, PORT3000, WEB_ORIGIN http://127.0.0.1:5173, IDENTITY_VERIFIER=dev, SINGLE_TENANT_MODE=false, ENTITLEMENT_SOURCE=subscription. These development fixtures are confined to this disposable integration job; no production change. Proxy browser requests remain same-origin.

Use the compiled adapter exports under the backend checkout to initialize disposable schema: frontend CJS fixture creates a Node createRequire from backend/apps/api/package.json; require @sher/adapter-postgres for createPool/runMigrations and pg via that resolver. Check both DB URLs exactly match the approved job host/port/database before connecting. As disposable admin, create sher_app LOGIN with test-only password if absent, runMigrations(admin, absoluteBackendRoot/migrations), GRANT USAGE ON SCHEMA public and SELECT,INSERT,UPDATE,DELETE,TRUNCATE ON ALL TABLES IN SCHEMA public TO sher_app, matching the existing helper behavior. Do not import raw TypeScript test helpers into Node20 or assume test files were emitted by the build. Close admin pool before starting API as sher_app. Registration/OTP endpoints then create fixture users; no SQL credential/user seeding or dependency on retained data. Test transport devCode is consumed privately.

Before F0-07 approval, record the paired backend compatibility head in its issue/workflow input, not a literal placeholder in executable CI. If that head does not exist yet, F0-07 depends on F0-01/F0-02 draft PR; work cannot run against the old baseline and claim the new contract passed.

Review status: engineering choices for this bounded increment are resolved; source refs, existing files, PIN mismatch and constructor wiring were inspected. The specification has not been independently approved or executed. Owner chooses/approves the proposed GitHub + Actions disposable-runner environment (or another named verified runner) before build; no full-suite/DB work is performed by this planning session.
