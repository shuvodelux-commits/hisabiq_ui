# HisabIQ Authentication V1 — Superpowers Design Specification

**Status:** UI design and existing-backend alignment review — product requirements preserved; no feature execution authorized  
**Date:** 2026-10-22  
**Review stage:** Superpowers architectural brainstorming → specification review gate  
**Repository:** `shuvodelux-commits/hisabiq_ui`  
**Scope:** Authentication UI design, interaction states, shared-component reuse and contract alignment with the existing `shuvodelux-commits/ByabsIQ` backend  
**Explicit exclusions:** Feature code, new backend/API infrastructure, database changes, provider replacement, deployment, PR creation and merging. The companion plan is a UI design/alignment proposal for review.

## 1. Purpose and non-negotiable constraints

HisabIQ serves Bangladeshi small businesses with widely varying technical experience. Registration must be familiar, fast, bilingual, and mobile-first. A shopkeeper must be able to resume sales using a trusted-computer six-digit PIN without losing business records, even after logout or normal session expiry. The experience must not sacrifice user isolation, tenant authorization, recovery security, or accounting integrity.

**Product north star:** One person has one HisabIQ identity; login methods are interchangeable entry points; business permissions are checked independently. **KISS:** Minimize mandatory fields and repetitive prompts; put rare security controls in Security settings.

### Approved product decisions (locked for this design)

1. **Every user must supply and verify a mobile number.** Google sign-in does not bypass phone collection. Mobile registration does not require Gmail.
2. Support **mobile number + password** and **Continue with Google**. A Google-only user is not forced to create a HisabIQ password.
3. **Linking Google to an existing user requires authenticated proof of ownership of that existing HisabIQ account**, not a phone match or SMS OTP alone.
4. Password recovery defaults to an **OTP sent to verified Gmail/email** when available; **SMS OTP fallback** is offered securely. Mobile-only accounts default to SMS.
5. When both phone and email are lost, offer **assisted recovery** with rigorous evidence review; approval is not automatic.
6. On a supported, enrolled browser, optional **six-digit Quick PIN** login is valid for a **fixed 90-day** trusted-device authorization. It can establish a new session after browser restart, normal session expiry, or **intentional logout**. Five incorrect PIN submissions disable PIN for that enrollment pending full authentication.
7. The same browser can remember **multiple independently enrolled users**, each with their own PIN and authorization. Show account selection only when needed.
8. **Automatic UI screen lock** is **on by default after 30 minutes of inactivity**; users may turn it off. Preference is **per user, per browser**. Manual lock remains available.
9. After authentication, open the user's **last-used authorized business**; expose a business switcher in the ERP header.
10. For unsaved work on business switching, offer **Save Draft & Switch**, **Discard & Switch**, or **Stay Here**.
11. **Fresh full authentication** is required for account-security, authenticator, trusted-device enrollment/renewal, and business-ownership changes. Ordinary ERP operations use their existing permissions and confirmation rules.
12. **UI design and documentation alignment only.** The owner clarified on 2026-10-22 that the backend already exists in `ByabsIQ` and Cloudflare serves only the UI preview. Revise the documents and review-only UI plan accordingly; feature code, backend changes, releases and merges still require separate authorization.

## 2. Context, current repository boundary, and source authority

**Owner clarification, 2026-10-22:** This is the UI design step. Cloudflare hosts the live UI preview. The existing application/backend repository is [`shuvodelux-commits/ByabsIQ`](https://github.com/shuvodelux-commits/ByabsIQ); it must be inspected and reused, not replaced by a new backend created in `hisabiq_ui`.

- **Visual authority:** `hisabiq_ui` and its Magic Patterns-derived `src/components/brand/ApplicationsSection.tsx` Login branding draft; reuse current shared shadcn UI, Ink/Teal/Mint, Geist/Hind Siliguri, compact forms and bilingual helpers.
- **Existing backend authority:** ByabsIQ `main` inspected at [`17dcadf`](https://github.com/shuvodelux-commits/ByabsIQ/commit/17dcadfaa86ac868063408cc2be6209ca652e164): NestJS + Fastify, PostgreSQL + Drizzle, Redis and pnpm workspaces. Source includes phone/password login, OTP-backed signup, server cookie sessions, CSRF protection, membership checks and business activation.
- **Existing connected frontend reference:** ByabsIQ `apps/web` already has auth pages, a shared `AuthLayout`, an API client, shared contracts, TanStack Router/Query and a business switcher. Reuse its behavior/contracts during later integration while adapting presentation to the current approved UI. Do not copy the preview's router into that application.
- **Preview boundary:** `hisabiq_ui` remains a React/Vite visual preview. Its static hosting configuration is intentional. The absence of API files in that repository does not mean HisabIQ has no backend.

Current source inspection does not establish that every newly approved authentication feature is implemented. Google/OIDC and linking, recovery, trusted-browser PIN, remote enrollment management, fresh-action authentication and persistent last-used-business behavior have no matching contract in the inspected auth surface; record those as alignment gaps. Existing signup verifies the OTP together with password on `/api/auth/signup`; it has no separate phone-verification grant endpoint. Business creation currently accepts `name`, not business type. Approved UI requirements remain intact; do not invent working endpoints or silently remove fields.

Read the [current research and capability map](../research/2026-10-22-authentication-v1-current-research.md) for exact source references. Existing security and tenant boundaries stay authoritative. No Worker API, Hyperdrive setup, new database foundation, authentication-provider migration or backend rewrite is part of this design step.

Existing UI repository references:
- [README.md](../../../README.md)
- [AGENTS.md](../../../AGENTS.md)
- [ERP context-complete workflow design](2026-10-09-erp-kiss-contextual-workflows-design.md)

## 3. User journeys and state transitions

### 3.1 Register with mobile

1. Show mobile-number entry and Continue with Google as two clear paths; accept common Bangladeshi `01...` and `+8801...` forms, normalize to canonical E.164; display/edit the original familiar local format.
2. Send SMS OTP with resend controls, expiry, bounded attempts, throttling, and delivery-failure messaging. Normalize Bengali digits for input where meaningful.
3. Only after phone verification, allow a new mobile user to create a strong password; do not require Gmail.
4. Request minimum business setup: business name and business type. Optional address, logo, extended stock setup and details can wait.
5. Create the person and tenant atomically/idempotently; only after successful creation open the dashboard. If enrollment is interrupted, resume the same pending registration rather than creating duplicates.
6. Offer optional trusted-browser Quick PIN **after** full authentication; a user can skip it.

### 3.2 Register with Google

1. Start Google Identity Services sign-in with CSRF and redirect protections appropriate to the chosen flow.
2. The backend verifies issuer, audience, expiry and signature; identifies the provider account using Google's stable `sub`, **never email alone**.
3. If this Google identity is not linked, require the user's mobile number and successful SMS verification **before creating an active HisabIQ account or tenant**.
4. If that mobile is already attached to an existing HisabIQ account, **pause creation**, explain that the account must be linked, and require existing HisabIQ password authentication or a completed secure account-recovery process. **An SMS OTP or shared email address alone must never silently merge users.**
5. On successful verified linking, retain the pre-existing user, tenant memberships, invoices and balances. If the Google identity is already linked to another user, reject the link and route to reviewed support; do not reassign it.
6. A newly created Google-only user may add HisabIQ password login later through fresh authentication.

A Google identity with a non-Gmail address is still an eligible Google login; recovery email eligibility depends on independently established control/verification, not merely the existence of an email string in a token.

### 3.3 Returning user, normal login

- **Mobile/password:** normalize mobile, verify password securely, apply account status/rate limits, establish new session, then resolve business context.
- **Google:** verify fresh Google authentication result, map `sub` to an existing account, apply account status, establish new session, then resolve business context.
- **Trusted PIN:** if a valid user-specific browser enrollment exists, display PIN directly for one enrolled account; if multiple, show a compact user selector; authenticate using the **PIN plus verifiable registered-device proof** and establish a **new session**.
- No automatic signup or cross-account linking just because the submitted email/mobile resembles an existing record. Generic error wording must avoid identity enumeration.

### 3.4 Forgot HisabIQ password and no-password accounts

- Entry requests registered mobile; the initial public response remains generic and does not reveal account existence or which contacts are linked.
- If the account has an eligible verified Gmail/email recovery destination, send a **HisabIQ-generated email OTP** by default. This is **not** Google's OAuth sign-in and does not imply Google sends the OTP.
- A secure **Use mobile instead** path permits SMS OTP fallback with additional risk checks (especially recent contact changes, SIM-swap signals when available, unusual attempts, or compromised-account indicators). Mobile-only users receive SMS by default.
- Both channels require unpredictable single-use codes, short validity, server-side throttle, protected storage, and invalidation on success. Re-requesting codes cannot reset attempt counters.
- After valid proof, permit a **new HisabIQ password**, notify verified contacts as appropriate, terminate pre-existing sessions, and revoke trusted PIN enrollments. Require a fresh complete login afterward.
- For Google-only users who never set a HisabIQ password, emphasize **Continue with Google**; a separate verified workflow may create a HisabIQ password. Do not show a misleading “reset your existing password” message.
- No PIN alone may change a password, phone, email or Google link.

### 3.5 Assisted recovery without phone or email

1. Offer a publicly discoverable **Recover my account** request with neutral messaging and a recovery case ID.
2. Support gathers previously established, independently verifiable evidence; business name, invoices, public contact details, or caller-supplied screenshots alone are **insufficient**. Staff identity cannot automatically claim business ownership.
3. Use documented risk scoring, trained manual review, a separate approval for high-risk ownership changes, contact notifications when safe, and a waiting/dispute period proportionate to risk.
4. If evidence is inadequate, **deny or pause** recovery; preserving security takes priority over guaranteeing recovery.
5. Only after approval: bind new verified mobile/recovery email, revoke former sessions, trusted devices and affected authenticators, record all decisions, notify contacts, and require full login. The user's business memberships remain unchanged unless ownership transfer was independently authorized.
6. Recovery support cannot browse a tenant's private ledger solely by virtue of a support ticket; support tooling must use audited least-privilege access.

### 3.6 First-time PIN enrollment and trust renewal

- Available only after a **fresh full login**, on a browser that can meet the device-authentication security contract. Show `Enable Quick PIN on this computer` or `Not now`; PIN setup is always optional.
- User creates and confirms exactly **six decimal digits**; no preset/reused default, and block trivially weak PINs with clear feedback. Treat the PIN as sensitive; do not log or persist it in plaintext.
- Establish **one device enrollment per user + browser profile**, bound to server-side user identity and a cryptographically proven authenticator/device capability. A shared computer may hold multiple separate enrollments.
- Validity is **90 × 24 hours from successful enrollment or explicitly reauthenticated renewal**, not sliding with daily PIN use.
- Full logout invalidates the active session, **not** the enrollment. Normal idle/absolute session expiration and browser/computer restarts also leave a valid enrollment eligible for PIN login.
- PIN login requires both server-enforced PIN attempt verification and a fresh challenge showing possession of the registered browser/device credential; rotate the resulting session identifier on success.
- After **five consecutive bad PIN attempts on an enrollment**, disable PIN on that enrollment until the user fully authenticates; do not let browser clearing or different tabs bypass server attempt counting.
- **Revocation, expiry, account suspension, successful password reset, approved assisted recovery, detected credential compromise, or security-triggered forced logout** overrides the 90-day enrollment.
- Expose account name and minimal masked phone/email only as needed on the account picker, not financial information.

**Security feasibility constraint:** A six-digit string or an ordinary persistent cookie **alone is not safe proof of a trusted computer**. Device proof must be origin-bound and cryptographically verified, not an easily copied browser value. WebAuthn/platform credentials are candidates; **synced passkeys are not automatically proof of the same physical computer**, and a user-specified HisabIQ PIN may not map directly to the OS/platform PIN. The eventual technology selection must demonstrate that a standalone six-digit HisabIQ PIN plus device proof meets this contract on each supported browser. If not, **do not silently downgrade to PIN-only access**: offer full Google/password login and a clear compatibility explanation instead. This is a documented security acceptance gate, not a promise of universal browser support.

### 3.7 Automatic lock and session policy

- **Automatic UI lock:** ON by default, after **30 minutes of local inactivity**. Track meaningful keyboard/touch/mouse ERP interaction, not automatic background polling. An eligible trusted user can unlock by PIN. If PIN is not enrolled/available, use full login.
- Preference is per **user + browser enrollment/profile**, not per business. One employee cannot disable another employee's lock preference on the shared browser.
- User can **turn automatic lock OFF** from Security settings; this affects only the optional UI overlay, **not backend session idle/absolute expiry**. Disabling it is security-sensitive and requires fresh full authentication; enabling it does not.
- **Manual Lock** remains available even with automatic lock disabled.
- Server sessions use secure cookie-based authentication (Secure, HttpOnly, appropriate SameSite, CSRF defenses) and independently enforced finite **idle and absolute** lifetimes. Earlier proposed review defaults, still unapproved: **2-hour server idle** and **12-hour absolute** maximum. ByabsIQ currently creates a fixed 30-day expiry; this is a future policy-alignment difference, not a design-step backend change. These are distinct from the 30-minute optional UI lock and 90-day remembered-device authorization.
- On expiration or logout, the session is invalidated **on the server**. A valid trusted enrollment can create a new session using PIN plus device proof; it must never resurrect an expired session token.
- A screen lock must not silently post, save, or discard accounting records; sensitive content is obscured, and access to any unsaved draft after returning requires the authorized user. When re-login crosses a session boundary, never display a previous user's private cached ERP data.

### 3.8 Multiple users on one computer

- Every remembered user has an independent enrollment/PIN, expiration, failed-attempt count and auto-lock preference.
- One remembered user → immediately show PIN; two or more → show a compact account selector and **Use another account**.
- Switching to another user invalidates the previous user's active context, prevents old responses/caches from surfacing, and requires the selected user's PIN/device proof or full login.
- A browser profile and its local enrollment are distinct from an entire physical computer. Users who share an OS/browser profile are advised about the inherent risk, even though backend authorization remains isolated.

## 4. Multi-tenant business access and unsaved work

1. An authenticated user may have multiple memberships but does not become the owner of every business by logging in. Each membership has independently evaluated permissions and status.
2. Resolve the **last-used authorized business per user**. If none is stored, choose the single authorized business automatically; if more than one with no usable history, show the compact business selector.
3. If the last-used business has been removed or the membership revoked, do not open it; fall back to another authorized business or an informative no-access state.
4. The ERP header offers a business switcher where appropriate. Selecting a new business is a server-verified change of tenant context. Clients may submit a tenant selection **as a selector, never proof of authority**.
5. Before switching with unfinished work, show **Save Draft & Switch**, **Discard & Switch**, **Stay Here**. Save draft under the **old tenant** and switch only after confirmed persistence. On save failure stay in the old tenant with the draft intact. Discard affects only unsaved changes; never delete a previously saved draft by accident.
6. For forms without a draft capability, disable the misleading Save Draft option and offer a clear **Discard & Switch / Stay Here** resolution.
7. On successful switch, invalidate/partition the actual tenant-scoped stores, background requests, subscriptions, forms and session UI; isolate drafts by both user and tenant. ByabsIQ already uses TanStack Query; the UI preview does not. Reuse each repository's existing mechanisms rather than adding a cache library solely for authentication. Never let an older in-flight response replace the new tenant's data.
8. The existing ByabsIQ backend remains responsible for membership, role and tenant scope. Preserve its authenticated active-business context, membership guards and transaction/RLS boundaries. An expected-business header is a stale-context precondition, never proof of access. Review coverage for the actual integrated endpoint; do not infer full ERP coverage from foundation checks.
9. Ordinary POS/purchase/payment operations follow domain confirmations and permissions; security reauthentication is **not** added to every everyday ERP transaction.

## 5. Logical architecture and data ownership

This is a **logical responsibility model, not a proposed replacement schema**. Map responsibilities to existing ByabsIQ modules/contracts. Rows below describe required behavior, including capabilities not yet present; they do not authorize parallel credential/session tables or a new authentication service.

| Logical record/service | Owned information and invariant |
| --- | --- |
| `UserIdentity` | Stable internal `user_id`, canonical verified mobile (unique active binding), status and profile; never use mobile/email as immutable primary key |
| `PasswordCredential` | Optional verifier with modern salted adaptive hashing and compromise controls; no plaintext passwords |
| `FederatedIdentity` | Provider = Google, verified provider `sub` unique, link event and status; verified email as attribute, not principal identifier |
| `RecoveryChannel` | Email/mobile verification, eligibility, recent-change age, status; no unverified destination used for recovery |
| `OTPChallenge` | Purpose, destination reference, protected verifier, expires-at, consumed-at, attempts, resend throttle; never log code |
| `TrustedBrowserEnrollment` | User, browser/device proof reference, fixed enrolled/expires-at, revocation and bad-PIN counter; independent from sessions |
| `PINCredential` | Protected PIN verifier/activation mechanism linked to one enrollment; no plaintext/local PIN database |
| `AuthSession` | User, method, created/last-used/expiry, revocation, recent full-reauth evidence; independent of trusted enrollment |
| `UserDevicePreference` | Per-user/browser auto-lock ON/OFF and UI preference metadata |
| `BusinessMembership` | User, tenant, role/status/permissions; authorization source of truth |
| `LastBusinessPreference` | User's last-used tenant, validated against current membership at sign-in |
| `RecoveryCase` | Review evidence references, security reviewer(s), decisions, timestamps, outcome, audit |
| `SecurityAuditEvent` | Redacted login, lockout, session, enrollment, recovery, linking and ownership-change history |

**Boundary:** Global user credentials/Google identities cannot be duplicated per business. Business data (sales, inventory, parties and accounting) remains tenant-scoped. Account recovery changes the principal's login factors, not its permitted tenants.

**Existing-backend alignment:** Reuse ByabsIQ's `apps/api/src/modules/auth`, `modules/businesses`, shared contracts and connected web API client for existing behavior. Unimplemented capabilities need a separate future backend-alignment decision, not a new service in the UI repository. Google verification, credential/device verification, OTP, revocation and tenant access remain server obligations; preview screens cannot certify them.

## 6. KISS UX contract — Impeccable Distill review (2026-10-22)

**Mode:** Operate — shopkeepers need to finish a task, not understand authentication architecture. **Canonical visual reference:** the existing Magic Patterns-derived **Login branding** draft in [`src/components/brand/ApplicationsSection.tsx`](../../../src/components/brand/ApplicationsSection.tsx) (within `/design-system` → **Applications**, approximately lines 127–169 on main). This actual component—not a generic SaaS login example—is the baseline. It includes a two-column desktop card, dark Ledger Ink brand panel with HisabIQ logo and Bangla tagline, subtle ledger-line pattern, and white mobile/password sign-in panel with shared `Input` and `Button`. No new competing component library, authentication dashboard, animated tour, or speculative settings is authorized.

### 6.1 One purpose per screen, minimum prompts

| User-facing surface | Smallest successful experience | Hide until needed |
| --- | --- | --- |
| Sign in | Mobile number + password and one **Continue with Google** alternative; Create account / Forgot password as small links | Enrollment notices and advanced security controls |
| Quick PIN | One six-digit PIN entry when exactly one trusted account exists; visible **Use another login method** | Account selection unless 2+ remembered users |
| Remembered account chooser | Compact list of remembered users → that user's PIN; **Use another account** | Business/financial data; expired enrollments handled through full login |
| Create account | Mobile → SMS OTP → password → business name/type. Google → mobile verification → business setup; never require email on mobile path | Address/logo, optional password for Google-only, PIN setup |
| OTP step | One reusable OTP component for SMS/email, clear resend/correct-number and failure behavior | Multiple channel choices before permitted disclosure |
| Business setup | Business name + type → Start using HisabIQ | Logo, advanced stock, banking, permissions |
| Forgot password | Enter registered mobile; recovery OTP through Gmail-first or secure SMS fallback | Channel details before adequate verification; support case only for lost-both-methods |
| Security settings | A compact **Account Security** area inside existing `/app/settings/:section`: contacts, Google, password, **Quick PIN**, **Automatic lock** toggle and **Manage trusted devices** | Advanced device/audit detail behind one Manage link |
| Business switch | Header switcher only for users with multiple authorized businesses | Separate post-login business selector when last-used membership remains valid |
| Unfinished-work switch | Reuse existing shared confirmation dialog: Save Draft & Switch / Discard & Switch / Stay Here; honest disabled Save when unsupported | New dedicated switching wizard |

**One primary action per surface.** No standalone full-page screen for account linking, trusted devices, PIN preferences, or recovery-status dashboard when a small existing settings section or focused dialog is sufficient. No mandatory intro tour, duplicate Google and email-sign-in controls, or repeated OTP on every return login.

### 6.2 Reuse first; don't redesign HisabIQ

- Use the existing `AppShell`, `TopBar`, tenant settings hub, shared `Button`, `Input`, `Switch`, `Dialog`/`AlertDialog` and theme tokens; auth screens are outside the protected ERP shell but share styling and controls.
- Match the approved Magic Patterns Ink/Teal/Mint palette, Geist and Hind Siliguri, current field sizing and compact spacing. Avoid excessive nested cards and new icon/color families. Use existing responsive and dark-mode conventions; no monospace digits.
- **Desktop:** preserve the exact approved *split-panel* Login branding composition (dark Ink branding panel left; white focused form right) from `ApplicationsSection.tsx`. Do not replace it with a generic centered login card or dashboard-like hero. **Tablet:** preserve split view only where space permits, otherwise stack compactly. **Mobile:** collapse the tall decorative brand panel to a brief logo/tagline header and keep the form immediately reachable, in a single vertical column with appropriate touch targets and errors above the keyboard.
- **Retain** the guide's mobile-number field, password/visibility affordance, teal full-width Sign in button, brand lockup, Bangla `সহজ হিসাব, স্মার্ট ব্যবসা` tagline, and registration-link placement. **Extend minimally** by adding Continue with Google and a compact Forgot password? link; swap the form content to PIN or remembered-account chooser *only when enrollment state warrants it*. No stacked alternative login wizards in the default view.
- **Draft-only content must not ship as facts:** remove the hardcoded demo phone/password from actual login forms; do not show the guide's `Trusted by 2,400+ shops` claim unless independently substantiated; use `Start free for 30 days` only when that promotional trial is an actually enabled offer. Keep the visual hierarchy of those positions if appropriate, not unverified promotional copy.
- Labels are familiar: **Mobile number**, **Password**, **Continue with Google**, **Forgot password?**, **Quick PIN**, **Lock automatically**, **Trusted devices**, **Switch business**. Short Bengali helpers only where they aid understanding; full English/বাংলা modes remain available.
- Motion only communicates focus/state/error or the opening of an existing shared dialog; avoid animated onboarding and delayed authentication steps.
- Accessible labels/focus, paste and SMS autofill, Bangla-digit normalization, failed/expired code feedback, generic account-discovery responses, and disabled/loading states are required even though the UI is minimal.
- A success toast cannot substitute for a verified backend action or safe account/session change.

### 6.3 Distill: what is NOT a V1 end-user feature

Do **not** add a security-score card, device risk map, separate password policies editor, account linking wizard, recovery-code enrollment, WebAuthn/passkey management UI, detailed session dashboard, support-agent workflow screens, device nickname wizard, push notification MFA, or optional login-provider gallery. These are not needed for the agreed flows. Staff-assisted recovery can reuse an audited support case workflow; the minimum necessary internal reviewer tooling and dual-control process still must exist before that recovery path is advertised as operational.

**Separation of concerns remains important:** a simplified *UI* must not merge user identities, recovery/OTP verifiers, browser enrollments, sessions, tenant memberships, or audit events into unsafe shared state.

## 7. Security policy and threat controls

| Threat/edge case | Required protection |
| --- | --- |
| User enumeration through login/recovery | Generic pre-proof responses; avoid revealing whether a phone/email belongs to an account |
| Account duplication / incorrect linking | Unique active provider `sub` and verified mobile binding; explicit ownership challenge |
| Credential theft and brute force | Adaptive password hashing, generic auth errors, server rate limits and risk analysis |
| OTP guessing/spamming | Cryptographically secure OTP, single-use, expiry, rate limits by account/destination/IP/device; notification throttling |
| SIM swap / phone reassignment | SMS is a riskier recovery channel; extra checks and possibly holding period on suspicious fallback |
| Six-digit PIN guessing | Enrollment-specific 5-attempt cutoff, server-side counters, device proof; never accept bare PIN or offline verifier alone |
| Stolen browser cookies | HttpOnly/Secure session cookie; rotate identifiers, server revocation; device enrollment **not** a session cookie |
| Cross-site request forgery / account-link injection | State/nonce/CSRF defenses for Google linking and other authenticated mutations |
| Cross-site scripting / browser compromise | Strict CSP and output encoding; minimize browser-held secrets; device proof cannot be supplied by arbitrary server data |
| Cross-tenant access | Backend membership checks and tenant scoping for every resource; fail closed when tenant context absent |
| Shared-device user confusion | Separate enrollment/lock preference/session per user; wipe cached financial state on account switch |
| Recovery fraud | Trained review, independent evidence, approvals for elevated risks, audit events, dispute channel |
| Malicious support action | Least privilege, separation of duties for high-risk recovery, audit and notifications |
| Loss of only trusted computer | Full Google/password login remains; owner can revoke that computer remotely |
| Password reset / confirmed compromise | Revoke sessions and affected enrollments and require full sign-in |
| Network failure mid-login / switch | No premature successful-login state; no partial tenant switch or duplicate registration |

### Fresh authentication rule

Security-sensitive actions **must not** rely solely on a PIN-created session. Require recent primary proof (HisabIQ password or fresh Google authentication, with risk-appropriate additional verification) for:
- Adding/removing Google login; changing email/mobile or password
- Creating/renewing/removing sensitive trusted-device authorizations and changing PIN
- Turning automatic UI lock OFF (turning it ON is unrestricted)
- Ownership transfer, recovery-method replacement and other critical account-security modifications

Routine sale, purchase, receipt, return and ledger corrections retain their own separate approval, audit and authorization controls; authentication does not replace accounting-domain permissions.

## 8. Error handling and irreversible events

- **SMS delayed/undelivered:** clear retry/backoff, safe cancellation, don't create active tenant until verification.
- **Google canceled or callback invalid:** return to login without changing account links.
- **Existing phone discovered during Google onboarding:** require existing-account ownership proof; never create a duplicate based on another phone attempt.
- **Google email changes:** stable `sub` retains link, recovery email eligibility separately re-evaluated.
- **Wrong PIN:** increment server attempts, display remaining attempts without leaking sensitive enrollment details; five failures demand primary authentication.
- **Browser credential unavailable/unsupported:** disable PIN quick login for that enrollment, explain full-login route; do not fall back to PIN-only.
- **Trust expires during PIN prompt:** reject, discard challenge and require full login.
- **Business permission revoked mid-session:** subsequent access fails closed; invalidate selected tenant context and cancel in-flight old-tenant queries.
- **Save draft on business switch fails:** stay in original business and preserve data; do not show success.
- **Account compromise reported:** account suspension and security revocation supersede any remembered PIN convenience.
- **Recovery denied:** provide status/appeal pathway without exposing sensitive account identifiers.

## 9. Acceptance criteria and review scenarios

The architecture is acceptable only if all of the following can eventually be demonstrated by implementation tests; **none are claimed to be implemented now**:

1. Mobile registration succeeds without Gmail, with verified unique phone and minimal business setup.
2. First-time Google sign-in cannot enter a business before verified phone capture.
3. Account linking never silently creates duplicate tenants or merges users by phone/email match.
4. A verified Gmail/email receives default recovery OTP; SMS fallback is available with risk checks; unauthenticated responses are non-enumerating.
5. Google-only account is not forced to maintain a password and has a safe password-creation route.
6. Assisted recovery requires independent ownership checks; denied cases do not expose data.
7. Quick PIN is optional and **six digits**, with a 90-day fixed enrollment that survives logout, session expiry, restart; five failures trigger full auth.
8. Two users on the same browser can use separate PINs and receive distinct tenant-authorized data; a single remembered user avoids account selection.
9. Auto-lock defaults to 30 min, can be turned off **per user/browser**, and has no authority to alter backend server session expiry.
10. Fresh authentication is required for critical security/ownership changes, but ordinary POS operations are not burdened by arbitrary extra OTP.
11. Session revocation, password reset, trusted device removal and 90-day expiry are enforced server-side.
12. Last-used accessible business opens by default; switching respects membership and no cross-tenant cached state leaks.
13. Save Draft & Switch persists under the old tenant before changing; failures do not lose work; Discard does not delete an already-saved draft.
14. Mobile/tablet/desktop and English/Bangla modes preserve accessibility, existing HisabIQ visuals, and correct error states.
15. Device-proof feasibility and threat modeling **must** pass on every browser where six-digit-only Quick PIN is offered; unsupported cases use full authentication.

## 9.1 UI design and existing-backend alignment boundaries

The [companion plan](../plans/2026-10-22-hisabiq-authentication-v1-implementation.md) is now a review-only UI design/alignment proposal. It replaces the superseded 15-task new-backend proposal.

1. Lock the approved login composition and list UI states/components.
2. Map those states to existing ByabsIQ endpoints, contracts and connected frontend behavior.
3. Design login, registration, verification, recovery, conditional Quick PIN and account security using the shared UI.
4. Design lock, shell entry and safe business switching without changing unrelated ERP modules.
5. Review responsive, multilingual, keyboard, error and unsaved-work states; retain a clear list of backend alignment gaps.

Design previews may use explicit nonsecret scenarios. They must not send real SMS, store passwords/PINs/tokens in browser storage, claim actual Google linking, or label simulated recovery/device enrollment as verified. No live backend connection is added in this step.

Do not add backend bootstrapping tasks, migration tasks, managed-provider replacement, new framework/router adoption, or production deployment steps. Later feature execution and backend alignment require separate scope and approval. Do not multiply screens or duplicate the existing component family.

## 10. Design boundaries and explicit review considerations

This V1 specification intentionally does **not** add passkey-first signup, social providers other than Google, SMS on every login, passwordless mobile OTP for daily login, advanced enterprise SSO, biometric-only HisabIQ login, broad staff-role redesign, or multi-step financial-auth approvals.

The earlier **2-hour server idle / 12-hour server absolute** values and full reauthentication to disable auto-lock remain **unapproved proposals**, not changes to the current backend. ByabsIQ's inspected session service currently creates a fixed 30-day expiry. Record that difference for later policy alignment; this UI design step changes neither server timeout nor cookie policy. Custom six-digit PIN availability remains conditional on sound browser proof; the preview does not demonstrate it.

**Non-negotiable security invariant:** If a browser cannot demonstrate secure device-specific proof, HisabIQ must not authorize a session with a six-digit PIN alone; use full Google/password authentication. “PIN available for 90 days” is **authorization eligibility**, never a promise to bypass revoked identity or session security.

## 11. Primary sources and research basis

1. [Google Identity Services — Verify Google ID token on the server](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token): verify token claims; use stable provider `sub`; link existing accounts through proof.
2. [OWASP — Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html): sensitive-action reauthentication and login defense.
3. [OWASP — Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html): single-use recovery credentials, anti-enumeration, rate limits.
4. [OWASP — Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): server-side revocation and distinct idle/absolute timeouts.
5. [OWASP — Multifactor Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html): secure factor changes and risk-based controls.
6. [OWASP — Multi Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html): server-verified tenant context, authorization and cache isolation.
7. [OWASP — Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html): adaptive salted password-verifier storage.
8. [NIST SP 800-63B (current revision)](https://pages.nist.gov/800-63-4/sp800-63b.html): authenticators, short secret rate limits, risks of SMS-based verification.
9. [W3C Web Authentication Level 3](https://www.w3.org/TR/webauthn-3/): origin-bound public-key credentials and authenticator user verification.

## 12. Review gate — stop here

**Deliverable:** This design spec on a documentation-only review branch.

**Authorized in this revision:** Correct the authentication documents and companion UI design/alignment proposal on the existing documentation branch using ByabsIQ source evidence.

**Not authorized:** Implementing frontend/backend features, connecting live services, changing credentials/data/schema, selecting a replacement provider, deploying, creating PRs, or merging.

**Next step:** Review the corrected UI design and capability map. Any subsequent feature implementation must receive separate approval and reuse the actual existing backend contracts. Approval of document corrections is not approval to execute a feature plan.
