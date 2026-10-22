# HisabIQ Authentication V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **REVIEW DRAFT ONLY — DO NOT EXECUTE.** This plan is being sent to **GPT Astra** for independent review. No implementation authorization, branch merge, production credentials or deployment is implied by committing this document.

**Goal:** Give HisabIQ safe mobile/Google account registration, login and recovery, optional 90-day trusted-browser six-digit Quick PIN, per-user/browser screen lock, and last-used authorized business access, all inside the existing KISS/Magic Patterns UI.

**Architecture:** Add one Cloudflare Workers API next to the existing Vite React SPA; a revocable server session and authenticated tenant membership become the only authority for `/app/*`. Keep identity verification behind a small adapter to permit vetted managed identity or a reviewed Workers-compatible authentication framework. Optional PIN is a separate, device-proof-bound enrollment, never a naked PIN or persistent session cookie.

**Tech Stack:** Existing React 18, TypeScript, Vite, React Router **v6 HashRouter**, shared HisabIQ/Magic Patterns primitives, Node 24, Cloudflare Workers (API), Neon PostgreSQL + Hyperdrive **after configuration**, appropriate vetted provider/library for password/OIDC/OTP, Vitest + current **`@cloudflare/vitest-plugin`** for Worker runtime tests, existing Node tests and Playwright browser scripts.

**Spec:** [2026-10-22 HisabIQ Authentication V1 Design](../specs/2026-10-22-hisabiq-authentication-v1-design.md).  
**Current research:** [2026-10-22 Current Research](../research/2026-10-22-authentication-v1-current-research.md).  
**KISS findings:** [2026-10-22 UX/Scope Findings](../reviews/2026-10-22-authentication-kiss-impeccable-findings.md).

## Global Constraints

- **Do not execute before the owner reviews the spec and this plan, Astra review findings are resolved, and an execution method is chosen.** No auto-merge.
- Registration: **all users must verify mobile by SMS**, even Google users; mobile/password path needs no Gmail; Google-only user needs no custom password.
- Password recovery: **verified Gmail/email OTP first where available**, secure SMS fallback, assisted recovery if both lost; no response may enumerate users.
- PIN: **optional exactly six digits**, fixed **90 days** per separately enrolled browser/user, **five consecutive wrong attempts** disable PIN until full login; works after normal logout/restart/session expiry; trusted device can be remotely revoked.
- **Cryptographic device proof mandatory**. PIN alone, JS flag, localStorage or plain “remembered user” cookie is **not a valid authenticator**. Fail safely to full login if feasible secure device proof is unavailable.
- Multiple users may be enrolled in same browser; show chooser **only** for 2+ remembered users, otherwise show PIN directly.
- Automatic UI lock: **ON by default after 30 min idle**, OFF allowed per **user + browser**; manual Lock remains; OFF never disables server session expiry.
- Business: open **last-used authorized tenant**, dropdown only if multiple memberships; **Save Draft & Switch / Discard & Switch / Stay Here** for unsaved work. Saving uses previous tenant; on failure never switch.
- Full password/fresh Google reauthentication is needed for security factors, enrollment/renewal, sensitive security settings and ownership changes. No extra login challenge for every normal POS action.
- **UI authority:** existing [Brand Guide Login branding](../../../src/components/brand/ApplicationsSection.tsx) (Ink dark branding left + white form right); shared `Button`, `Input`, settings and `Dialog`; Geist/Hind Siliguri; English/বাংলা; compact mobile; **no monospaced digits**, no fake totals/testimonials.
- **Current `main` is a UI-only preview.** Do not imply existing demo POS/ledger data becomes secure production accounting data by adding auth. No broad ERP refactor or staff-permissions expansion.
- Do not add custom password crypto, OTP crypto, token verifier or passkey protocol where a well-maintained provider/library supplies it. No JWT/localStorage session as a shortcut.
- Suggested **2h server idle / 12h absolute** session policy and fresh-auth requirement to turn auto-lock OFF are **proposals needing owner/Astra approval**, not locked product decisions.
- One task = failing test → minimal code → passing test → review → commit; never start the next task when tests fail or security gates are unresolved.

## Review Focus

1. **Copied browser state / synced passkeys / stolen cookies** must never allow standalone six-digit-PIN login; device-proof feasibility gate tests Task 10.
2. **A Google sign-in with a mobile already linked to another account** must stop for explicit full ownership proof, not merge or duplicate tenancy (Task 6).
3. **Logout vs device authorization**: session ceases to work, while separate eligible remembered PIN may create a new session; password reset revokes both (Tasks 3, 11).
4. **Tenant revoked mid-session / old async response after business switch** must not leak the prior business's customer and balance state (Tasks 4, 13).
5. **Lost network during Save Draft & Switch** must keep the current business and unsaved values; saved drafts are never deleted by Discard (Task 13).

## Scope and component map

Exact target paths below are the **new proposed** locations; do not assume they exist in current `main`. Small renames are possible only if Astra records a corresponding interface/path update before execution.

| Unit | Responsibility | Proposed files |
| --- | --- | --- |
| Browser UI | New auth pages use existing Brand Guide components; route guard; session access | `src/auth/AuthPages.tsx`, `src/auth/SignIn.tsx`, `src/auth/PhoneOtp.tsx`, `src/auth/QuickPin.tsx`, `src/auth/AuthContext.tsx`, `src/App.tsx` |
| Worker HTTP | Same-origin `/api/*`, typed request contracts and errors | `worker/index.ts`, `worker/http.ts`, `worker/auth/routes.ts` |
| Identity adapter | Provider-verified password/Google + OTP; no homegrown OAuth | `worker/identity/IdentityGateway.ts`, `worker/identity/provider.ts` |
| Sessions | Cookie issuance, refresh, terminate, freshness and reauthentication | `worker/auth/session.ts`, `worker/auth/requireAuth.ts` |
| Challenges and recovery | SMS/email challenge, replay/expiry, fallback and support state | `worker/auth/challenges.ts`, `worker/recovery/recovery.ts` |
| Browser enrollment | Browser proof, PIN attempt threshold, device listing/revoke | `worker/trust/TrustedBrowser.ts`, `worker/trust/routes.ts`, `src/auth/trustedBrowser.ts` |
| Tenant access | Membership validation and persistent last-used choice | `worker/tenants/resolveTenant.ts`, `worker/tenants/routes.ts`, `src/auth/TenantContext.tsx` |
| Existing shell | Header dropdown, settings security controls, draft-safe switch | `src/components/layout/TopBar.tsx`, `src/settings/TenantSettingsPage.tsx`, `src/components/layout/AppShell.tsx` |
| Persistence | Only new auth/session/tenant membership data; source business tables unchanged | `db/migrations/0001_identity_auth.sql`, `db/migrations/0002_trusted_browsers.sql` |
| Tests | Pure-node contract tests, real Workers integration, browser regression | `tests/auth*.test.ts`, `worker/tests/*.test.ts`, `scripts/auth-browser.cjs` |

### Authenticated request contract (conceptual, stable across tasks)

`AuthPrincipal = { userId: string; sessionId: string; authMethod: 'password' | 'google' | 'pin'; fullReauthenticatedAt: string | null }`. This is server-derived, never supplied as client authority.  
`AuthorizedWorkspace = { principal: AuthPrincipal; tenantId: string; roleIds: string[] }`. `tenantId` comes from checked active membership.  
`ApiError = { code: string; message: string; retryAfterSeconds?: number }` with generic pre-proof errors.  
`AuthGateway` must provide `verifyPassword(mobileE164, password)`, `verifyGoogle(idToken, nonceContext)`, `startChallenge(userOrAttempt, purpose, channel)`, `finishChallenge(challengeId, code)`, and `setPasswordWithRecoveryGrant(...)`. A chosen provider/library may delegate these; **no raw credential decisions in React**.  
All above signatures are contract intent; any chosen dependency-specific adapter must be frozen by the Task 1 decision record before implementation.

---

### Task 1: Prove feasible identity provider, PIN cryptographic design, and rollout boundary — SECURITY GATE

**Files:**
- Create: `docs/superpowers/decisions/2026-10-22-authentication-adapter-and-pin-gates.md`
- Reference: `wrangler.jsonc`, `package.json`, [current research](../research/2026-10-22-authentication-v1-current-research.md)
- Test/evidence: `docs/superpowers/reviews/2026-10-22-authentication-compatibility-matrix.md`

**Interfaces:** Produces **frozen provider SDK/auth-session strategy, OTP source, Worker package/driver versions, chosen cryptographic device verification**, target browser list, and a security sign-off. Consumed by Tasks 2–15. **Must pass before any PIN-related production implementation.**

- [ ] **Step 1: Define acceptance tests/evidence**: table covering Google/mobile signup, verified phone enforcement, Gmail-first recovery + SMS fallback, secure session invalidation, and PIN/device-proof challenge with copy/sync attacks.
- [ ] **Step 2: Demonstrate baseline failure/gaps** by auditing current repo and testing candidate SDKs/proofs in an isolated throwaway prototype; record failed or unsupported browsers. Do not treat a mock as success.
- [ ] **Step 3: Select the smallest vetted identity integration** compatible with Workers + Neon + Bangladesh SMS, or document why a vetted Workers-compatible framework is preferable. Confirm current APIs, pricing and maintenance risks. Verify hardware/user-presence/device-copy limitations rather than assume WebAuthn magic.
- [ ] **Step 4: Re-run acceptance evidence against candidate(s)**; independent security reviewer must sign off. If PIN cannot be secured with acceptable UX, **halt PIN tasks**, return to user for revised scope; full login is the safe fallback.
- [ ] **Step 5: Commit reviewed architecture decision** (`docs: decide V1 identity adapter and trusted PIN design`). No feature code survives this research task.

### Task 2: Add same-origin Worker API routing and reproducible Workers tests

**Files:**
- Create: `worker/index.ts`, `worker/http.ts`, `worker/tests/http.test.ts`
- Modify: `wrangler.jsonc`, `package.json`, `vite.config.ts`
- Preserve: `src/App.tsx`, current SPA routes/assets and scripts

**Interfaces:** Produces `routeRequest(request: Request, env: Env): Promise<Response>` and `jsonError(code, status): Response`. Worker returns `GET /api/health` and static SPA unchanged.

- [ ] **Step 1: Write failing Worker tests**: `GET /api/health` returns JSON 200; `GET /app/dashboard` serves SPA shell; `/api/unknown` returns JSON 404, never `index.html`.
- [ ] **Step 2: Run new `npm run test:auth`** (configure current `@cloudflare/vitest-plugin` based on pinned Workers version): expect failure before implementation.
- [ ] **Step 3: Implement minimal same-origin Worker fetch handler and API/static fallback**, no router/framework migration, secrets supplied only through Worker bindings.
- [ ] **Step 4: Run `npm run test:auth && npm run build && npm run check:ui-contract`**; expect all pass, and `npm test` retains previous behavior.
- [ ] **Step 5: Commit** `feat(auth): add Workers API boundary without changing UI preview`.

### Task 3: Model identity, provider links, verification, sessions and audits in Postgres

**Files:**
- Create: `db/migrations/0001_identity_auth.sql`, `worker/db/authRepository.ts`, `worker/tests/authRepository.test.ts`
- Does **not** change existing preview transaction storage.

**Interfaces:** Repository `createOrGetUserForVerifiedMobile(mobileE164, registrationId)`, `linkProvider(userId, 'google', sub)`, `getMembership(userId, tenantId)`, `appendSecurityEvent(event)`. Define nullable password credential path for Google-only accounts, verified channels and sessions.

- [ ] **Step 1: Write failing integration tests** for unique normalized mobile, unique Google `sub`, idempotent registration retry, active membership lookup, timestamps and nonsecret audit payload.
- [ ] **Step 2: Run DB-backed test suite against isolated disposable Postgres/Neon test database**; expect failures because schema isn't present.
- [ ] **Step 3: Add idempotent transactional schema and narrowly scoped repository**; keep user, tenant and memberships distinct; review Hyperdrive transaction-pooling caveats before use of RLS/SET LOCAL.
- [ ] **Step 4: Run DB tests with deliberate duplicate insert races and cross-tenant queries**; both must be rejected/isolated; no data written to a developer/production tenant.
- [ ] **Step 5: Commit** `feat(auth): persist identity and membership boundaries`.

### Task 4: Revocable session authority and tenant middleware

**Files:**
- Create: `worker/auth/session.ts`, `worker/auth/requireAuth.ts`, `worker/tenants/resolveTenant.ts`, `worker/tests/session.test.ts`, `worker/tests/tenantIsolation.test.ts`

**Interfaces:** `issueSession(userId, method, now): Promise<{cookie:string;sessionId:string}>`; `requirePrincipal(request): Promise<AuthPrincipal>`; `requireWorkspace(principal, tenantId): Promise<AuthorizedWorkspace>`; `revokeSession(sessionId)`; `revokeUserSessions(userId)`. Proposed duration gate **2h idle/12h absolute** remains review-only until approved.

- [ ] **Step 1: Write failing tests**: unauthenticated requests get 401; active session works; expired/revoked cookie never works; membership removal blocks the next request; untrusted `tenant_id` client input gives no extra access.
- [ ] **Step 2: Run Worker test target**; expect failure.
- [ ] **Step 3: Add Secure/HttpOnly/SameSite first-party cookie session, rotation, CSRF defense, server session store, revocation, membership checks**. Keep session expiry independent from 30min screen lock/90d device proof.
- [ ] **Step 4: Run tests** including parallel requests, CSRF, stale membership, and tenant RLS/pooled connection crossovers; expect all pass.
- [ ] **Step 5: Commit** `feat(auth): enforce sessions and tenant membership`.

### Task 5: Reusable SMS/email OTP challenge with resend and generic errors

**Files:**
- Create: `worker/auth/challenges.ts`, `worker/auth/challengeRoutes.ts`, `worker/tests/challenges.test.ts`

**Interfaces:** `startChallenge(subject, channel, purpose): Promise<{challengeId;maskedDestination;retryAfterSeconds}>`; `verifyChallenge(challengeId, code): Promise<{recoveryGrantId}>` (grant scope tied to purpose, user and expiry). Delivery gateway provided by Task 1.

- [ ] **Step 1: Write failing tests** for single-use code, expiry, per-purpose binding, resend preserving failed-attempt budget, delayed carrier delivery, and responses indistinguishable for registered/unregistered numbers.
- [ ] **Step 2: Run `npm run test:auth`**, expect failure.
- [ ] **Step 3: Implement throttled and securely stored OTP grants** through vetted provider/delivery SDK; no raw code logs; reuse same UI/backend primitive for phone verification and account recovery.
- [ ] **Step 4: Run integration tests** for network retry/idempotency, rate limits and blocked OTP spam; confirm no duplicate SMS on idempotent request.
- [ ] **Step 5: Commit** `feat(auth): add verified OTP challenges`.

### Task 6: Mobile/password + Google login with explicit account linking

**Files:**
- Create: `worker/identity/IdentityGateway.ts`, `worker/identity/provider.ts`, `worker/auth/routes.ts`, `worker/tests/identityFlows.test.ts`

**Interfaces:** `signInWithPassword(mobileE164,password): Promise<AuthPrincipal>`; `signInWithGoogle(idToken,csrfContext): Promise<AuthPrincipal | PendingPhoneVerification>`; `linkGoogle(userId,idToken,freshFullAuthProof): Promise<void>`. Provider stable Google `sub` is unique.

- [ ] **Step 1: Write failing tests** for incorrect password, server-verifiable Google `sub`, CSRF/state failure, phone already claimed, explicit linking requiring recent full proof, and Google-only account without stored password.
- [ ] **Step 2: Run failing identity tests**.
- [ ] **Step 3: Implement provider-adapter routes** with robust authorization, idempotency and account linking. **No matching by Google email alone.** Do not create tenant on Google callback until verified phone capture.
- [ ] **Step 4: Test successful and adversarial cases**, including concurrent Google+mobile onboarding; verify single account, single membership and no merge.
- [ ] **Step 5: Commit** `feat(auth): support mobile and Google identity with safe linking`.

### Task 7: Minimal business setup and last-used membership resolution

**Files:**
- Create: `worker/tenants/routes.ts`, `worker/tests/businessSetup.test.ts`
- Modify: `worker/tenants/resolveTenant.ts`

**Interfaces:** `finishRegistration(userId,verifiedPhoneGrant,businessName,businessType,idempotencyKey): Promise<{tenantId}>`; `resolveLastAuthorizedBusiness(userId): Promise<string | null>`; `selectBusiness(principal, tenantId): Promise<void>`.

- [ ] **Step 1: Write failing tests** for mandatory verified phone for both paths, only business name/type required, duplicate request, withdrawn membership fallback, one-shop auto-select and last-used selection.
- [ ] **Step 2: Run failing tests**.
- [ ] **Step 3: Implement minimal atomic tenant setup + membership**, per-user remembered choice validated on every use; no optional settings requirements.
- [ ] **Step 4: Verify** all cases, including zero accessible businesses, cancelled onboarding and duplicate clicks.
- [ ] **Step 5: Commit** `feat(auth): finish verified onboarding and resolve active business`.

### Task 8: Password recovery, fallback, and sensitive-action reauthentication

**Files:**
- Create: `worker/recovery/recovery.ts`, `worker/auth/reauth.ts`, `worker/tests/recovery.test.ts`

**Interfaces:** `startPasswordRecovery(mobileE164)`; `requestSmsFallback(recoveryRequestId, riskSignals)`; `completePasswordRecovery(recoveryGrantId,newPassword)`; `assertFreshFullAuth(principal,action)`.

- [ ] **Step 1: Write failing tests**: linked verified email receives default email OTP, no verified email routes SMS, secure SMS fallback is possible, risk flags cause extra verification/denial, provider-only Google user handled honestly, invalid/consumed grants rejected.
- [ ] **Step 2: Run failing tests**.
- [ ] **Step 3: Implement recovery and fresh-auth policies** backed by verified factors and audit trail; successful reset revokes *all* sessions and trusted PIN enrollments; no PIN-only account security changes.
- [ ] **Step 4: Verify** replay, email enumeration, fallback racing, simultaneous reset, and revocation after changing credentials.
- [ ] **Step 5: Commit** `feat(auth): support safe recovery and sensitive reauthentication`.

### Task 9: Implement login UI by reusing the existing Magic Patterns branding draft

**Files:**
- Create: `src/auth/AuthPages.tsx`, `src/auth/SignIn.tsx`, `src/auth/PhoneOtp.tsx`, `src/auth/AuthContext.tsx`, `scripts/auth-browser.cjs`
- Modify: `src/App.tsx`; reuse `src/components/brand/Logo.tsx`, `src/components/Button.tsx`, `src/components/Input.tsx`, `src/components/Dialog.tsx`
- **Read existing authority:** `src/components/brand/ApplicationsSection.tsx:127-169`; do not copy demo passwords, false shop counts or a new competing design-system.

**Interfaces:** `AuthProvider` exposes `{principal, loading, signIn, signOut, refreshSession}`; protected `/app/*` route requires session; `/login` and `/register` stay outside protected shell (existing HashRouter).

- [ ] **Step 1: Write failing browser tests**: desktop two-panel brand/form fidelity; phone collapses branding; mobile/password + Google + Forgot password accessible; new account forced through verified mobile; security errors show without claiming success; no hardcoded demo credentials.
- [ ] **Step 2: Run `node scripts/auth-browser.cjs`**, expect missing-screen failure.
- [ ] **Step 3: Build minimal UI using existing shared primitives**, brand lockup and current theme; OTP component with SMS autofill/paste/Bangla digit normalization. Do not restyle POS.
- [ ] **Step 4: Run browser matrix (360, 768, 1280px; keyboard; English/Bangla; dark/light) plus existing regression scripts**, expect no clipping/overflow, consistent controls.
- [ ] **Step 5: Commit** `feat(auth): add branded KISS login and signup screens`.

### Task 10: Trusted browser device-proof security feasibility — hard gate before PIN UI

**Files:**
- Create: `worker/trust/TrustedBrowser.ts`, `src/auth/trustedBrowser.ts`, `worker/tests/deviceProof.test.ts`, review evidence in the ADR from Task 1

**Interfaces:** `createEnrollmentChallenge(principal)`, `registerDeviceCredential(principal,attestationOrKeyProof)`, `verifyDeviceChallenge(enrollmentId,challenge,assertion)`. Browser public-key API/attestation semantics follow **the reviewed Task 1 decision**, not guessed WebAuthn claims.

- [ ] **Step 1: Write failing tests** for cryptographic challenge/nonce binding to user+enrollment+origin, replay rejection, copied cookies without credential, outdated expiry and revoked enrollment.
- [ ] **Step 2: Run tests** and experimentally verify selected browsers; document unsupported/browser-sync cases.
- [ ] **Step 3: Implement chosen device-proof adapter from Task 1 only if reviewed**, without silently substituting browser localStorage or custom JS-generated six-digit pseudo-device token.
- [ ] **Step 4: Run both adversarial tests and independent device/browser validation**; reject unproven platforms. Failure is **STOP-and-escalate**, not skip-the-gate.
- [ ] **Step 5: Commit** `feat(auth): verify enrolled browser cryptographic possession` **only after security reviewer approval**.

### Task 11: Six-digit PIN enrollment, validation, lockout and revocation

**Files:**
- Create: `db/migrations/0002_trusted_browsers.sql`, `worker/trust/routes.ts`, `worker/tests/quickPin.test.ts`, `src/auth/QuickPin.tsx`

**Interfaces:** `enrollPin(principal,deviceProof,pin6): Promise<Enrollment>`; `loginWithPin(enrollmentId,pin6,deviceAssertion): Promise<AuthSession>`; `revokeEnrollment(principal,enrollmentId)`; `revokeAllEnrollments(userId)`.

- [ ] **Step 1: Write failing tests** for PIN regex `^[0-9]{6}$`, separately enrolled 2 users in one browser, each own 90d expiry from enrollment/reauthenticated renewal, logout survives but active session invalid, wrong PIN 5 times disables enrollment, password reset revokes enrollment.
- [ ] **Step 2: Run failing tests**; no PIN functionality until Task 10 gate passes.
- [ ] **Step 3: Implement server-side protected verifier + device proof validation + attempt counters**; PIN entry UI appears directly for one recognized enrollment, account chooser only with 2+, full-login fallback always present.
- [ ] **Step 4: Run security tests** with timer boundary at exactly 90d, multiple tabs, concurrent failures, expired challenge, browser reload, revocation and copied storage.
- [ ] **Step 5: Commit** `feat(auth): support optional safe quick PIN per browser`.

### Task 12: Per-user/browser optional 30-minute screen lock and Security settings

**Files:**
- Create: `src/auth/AutoLock.tsx`, `src/auth/useInactivityLock.ts`, `src/auth/SecuritySettings.tsx`, `tests/autoLockContract.test.ts`
- Modify: `src/settings/TenantSettingsPage.tsx`, `src/settings/settingsHub.ts` (as needed), `src/components/layout/AppShell.tsx`

**Interfaces:** `useInactivityLock(userId,enrollmentId,enabled=true,timeoutMs=1800000)`; `setAutoLockPreference(userId,enrollmentId,enabled)`. Manual Lock available even when auto-lock off.

- [ ] **Step 1: Write failing time-controlled tests**: default lock at `1_800_000` ms, interaction renews local activity timer, OFF prevents UI auto-lock but backend session still expires, another remembered user retains own preference, manual Lock always functions.
- [ ] **Step 2: Run test target**, expect failure.
- [ ] **Step 3: Reuse existing settings Switch and Dialog**, one simple **Account Security** section with linked methods, PIN/trusted devices and lock ON/OFF; enforce fresh full auth to change sensitive settings per approved spec/reviewed policy.
- [ ] **Step 4: Verify** stale tabs, browser background/wake, expired server session behind lock, no unsaved POS draft discarded by UI lock, accessible keyboard/focus.
- [ ] **Step 5: Commit** `feat(auth): add per-user browser screen lock and security settings`.

### Task 13: Header tenant switching and unsaved-draft protection

**Files:**
- Create: `src/auth/TenantContext.tsx`, `src/auth/SwitchBusinessDialog.tsx`, `tests/tenantSwitchContract.test.ts`
- Modify: `src/components/layout/TopBar.tsx`, `src/components/layout/AppShell.tsx` and existing domain draft hooks only where needed

**Interfaces:** `switchBusiness(nextTenantId): Promise<void>`; `registerUnsavedGuard({isDirty,canSaveDraft,saveDraft,discardUnsaved})`. Define `switchBusiness` state machine `idle → awaiting-decision → saving-old-tenant → switching → cleared` with fail-safe abort.

- [ ] **Step 1: Write failing tests** for one-business no switcher, authorized last-used opening, a revoked membership rejected, save persists under **previous tenant**, failed save keeps work and tenant, Discard only removes unsaved edits, Stay preserves form, no-draft editors never offer false Save.
- [ ] **Step 2: Run tests**, expect failure.
- [ ] **Step 3: Reuse TopBar dropdown and existing shared AlertDialog**, route owner choice through tenant-safe cache reset / abort stale fetches; do not fork POS carts and do not reinterpret demo actor selector as real login.
- [ ] **Step 4: Verify** 2-user/2-business switch sequences and cross-tenant React state/cache/background-request isolation; include POS and purchase draft workflows.
- [ ] **Step 5: Commit** `feat(auth): switch authorized businesses without losing drafts`.

### Task 14: Assisted recovery with auditable support safeguards

**Files:**
- Create: `worker/recovery/assistedRecovery.ts`, `worker/tests/assistedRecovery.test.ts`
- Integrate: existing `/saas/support` support route **only as a real permissioned workflow**, not fake email/chat actions

**Interfaces:** `submitRecoveryCase(claimant,claimedAccount): caseId`; `recordIndependentEvidence(caseId,evidenceRef,reviewer)`; `approveRecovery(caseId,approver)`; `completeAssistedRecovery(caseId,verifiedNewMethods)`.

- [ ] **Step 1: Write failing tests** for a public recover-access entry point, no proof from shop name alone, no support access to financial ledgers, high-risk second review, reject self-approval, dispute/cooling period, and recovery revoking sessions/PIN.
- [ ] **Step 2: Run tests**, expect failure.
- [ ] **Step 3: Implement real case states and audit with least-privilege staff review**, documented evidence rubric and ownership vs staff account distinction. If support tooling/process cannot meet it, do not advertise assisted recovery as fully available.
- [ ] **Step 4: Verify** denial and appeal safety, original contact notifications when safe, successful re-binding of verified methods only after final review and no membership privilege escalation.
- [ ] **Step 5: Commit** `feat(auth): add audited assisted recovery process`.

### Task 15: Cross-module security regression and release-readiness gate

**Files:**
- Create/extend: `scripts/auth-browser.cjs`, `worker/tests/securityMatrix.test.ts`, `docs/superpowers/reviews/2026-10-22-auth-v1-release-checklist.md`
- Reuse existing: `tests/*.test.ts`, `scripts/pos-*.cjs`, `scripts/party-*.cjs`, `scripts/purchase-*.cjs`, UI contract checker

**Interfaces:** Exposes no new product API; produces a reproducible test/evidence matrix and explicit Go/No-go result. No release until every security invariant passes.

- [ ] **Step 1: Add failing attack tests**: forged cookie, session fixation, OTP enumeration/replay, CSRF, Google `sub` collision, copied PIN state, 90d rollover, fifth PIN failure, revoked membership, stored-XSS risk, stale tenant responses, unauthorized support recovery.
- [ ] **Step 2: Run `npm run test:auth`**, expect red until missing protections fixed.
- [ ] **Step 3: Fix only defects demonstrated by tests**; no unrelated component or billing redesign, no CI bypass or failure suppression.
- [ ] **Step 4: Run `npm test && npm run test:auth && npx tsc --noEmit && npm run lint && npm run check:ui-contract && npm run build` plus targeted Playwright browser scripts; report **existing baseline failures separately** and do not label them as passing. Run Workers integration and DB tests under fresh isolated test credentials. Check Bengali/English, mobile/tablet/desktop, dark/light, slow network, session expiry and auth provider downtime.
- [ ] **Step 5: Commit** `test(auth): verify tenant-safe login and trusted PIN flows` and request independent security/design review. **Do not deploy or merge without explicit user approval.**

## Delivery and KISS acceptance gates (plan-level)

| Gate | Must be true |
| --- | --- |
| G0 decision | Astra/owner agree on identity provider, auth/session ownership and secure browser-device proof; no provider with hidden SMS or new account costs |
| G1 foundation | Real server/DB, revocable sessions, user/tenant boundary, no public access to private routes |
| G2 daily login | Existing two-panel UI adopted, mobile-friendly; Google/mobile signup and recovery usable without redundant prompts |
| G3 trusted computer | Separate user enrollment, cryptographic device proof, fixed 90d, 5 attempts, user-specific preferences, full-login fallback |
| G4 business safety | Last authorized business opens, header switching preserves/discards drafts only per explicit choice, no cross-tenant data/cache leak |
| G5 support and security | Assisted recovery actually supported and reviewed; tests/observability; no fictional success, secrets or unverified marketing claims |
| G6 approval | Owner confirms reviewed implementation plan + execution method before beginning, then separately approves any merge and production rollout |

## Alternatives considered, but not decided by this plan

- **Managed auth provider vs vetted in-Worker auth framework:** choose through Task 1 after current provider docs review; **do not** build passwords/OIDC from scratch as default.
- **WebAuthn single-device credential vs scoped browser-key proof:** only if independently reviewed and compatible with requested custom PIN; synced passkeys not automatically physical-device-binding. Document true threat model and hardware support.
- **2h/12h session durations and forced reauth to disable auto-lock:** spec proposals, not user-approved requirements; escalate to Astra/owner before locking.
- **Domain deployment:** keep `/api/*` same-origin with static SPA; don't silently split cookies between unrelated domains.
- **No new auth-only admin app:** existing settings, `/saas/support`, and header should provide only the small required surfaces; production staff recovery needs audit, not UI decoration.

## Review instructions for GPT Astra

Read in order:
1. [Existing brand login source](../../../src/components/brand/ApplicationsSection.tsx)
2. [Current repository context](../../../README.md), [AGENTS.md](../../../AGENTS.md), [wrangler.jsonc](../../../wrangler.jsonc)
3. [Current research](../research/2026-10-22-authentication-v1-current-research.md)
4. [Approved design spec](../specs/2026-10-22-hisabiq-authentication-v1-design.md)
5. [This plan](2026-10-22-hisabiq-authentication-v1-implementation.md)

**Review request:** Inspect actual repo; challenge missing backend, provider choice, cryptographic device-proof feasibility, tenancy, Cloudflare runtime compatibility, SMS economics, overengineering, task ordering, interfaces, testability and KISS. Report critical/high/medium issues and precise line-specific corrective edits. **Do not start implementation.**
