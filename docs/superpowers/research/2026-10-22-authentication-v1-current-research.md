# HisabIQ Authentication V1 — Current Research (2026-10-22)

**Purpose:** Evidence for an Astra technical design review, **not implementation authorization**.  
**Scope:** Existing HisabIQ frontend, approved auth design, October 2026 primary-source authentication and Cloudflare/Neon capabilities.  
**Design:** [V1 spec](../specs/2026-10-22-hisabiq-authentication-v1-design.md) · **Plan:** [Implementation proposal](../plans/2026-10-22-hisabiq-authentication-v1-implementation.md).

## 1. Verified repository state

The current `main` repository is a **React 18 + Vite + TypeScript frontend/UI preview**, not a production ERP backend. This is material; a login form without a real identity store, session authority and tenant permissions must not be labeled secure or production-ready.

| Evidence | Actual finding | Consequence |
| --- | --- | --- |
| [README.md](../../../README.md) | Explicitly says UI preview, not live tenant accounting/persistence | A backend integration prerequisite is mandatory |
| [src/App.tsx](../../../src/App.tsx) | `HashRouter`, `/app/*`, `/saas/*`, current default redirect to `/app/dashboard`; no authenticated route guard | Introduce one session gate at the route boundary, not a patch for every page |
| [wrangler.jsonc](../../../wrangler.jsonc) | `compatibility_date: 2026-10-06`, static `assets.directory: ./dist`, SPA fallback; **no Worker main/API binding** | Design Workers API deployment explicitly; no backend assumed present |
| [package.json](../../../package.json) | React 18, `react-router-dom ^6.26.2`, Vite, Framer Motion, Lucide; no production auth provider/DB client and no Vitest dependency | Do not claim frontend/API/server tests exist; minimize new dependencies |
| [src/components/brand/ApplicationsSection.tsx](../../../src/components/brand/ApplicationsSection.tsx) | Existing Magic Patterns-derived **Login branding** design (around lines 127–169): Ink-left/white-right split, Bangla tagline, mobile/password, shared Input/Button | This is authoritative login visual baseline; extend, do not replace |
| [src/components/layout/AppShell.tsx](../../../src/components/layout/AppShell.tsx) | Current app uses a tenant settings provider and local UI providers | New authenticated context must isolate the existing preview state rather than treat current demo actor as secure identity |
| [src/components/layout/TopBar.tsx](../../../src/components/layout/TopBar.tsx) | Existing user label derives from demo `team.employees` and `actorId` | Do not equate actor selector with production authenticated `user_id`; add business switcher without duplicate headers |
| [src/settings/TenantSettingsPage.tsx](../../../src/settings/TenantSettingsPage.tsx) | Reusable setting fields, Switch, dialogs and settings routes | Extend existing settings UX; do not create a second security dashboard |
| [AGENTS.md](../../../AGENTS.md) | Magic Patterns styling, shadcn components, KISS, POS cart authority, no fake actions | Authenticate without redesigning POS or creating cosmetic security actions |

## 2. External primary-source verification

| Primary authority | Checked technical guidance | HisabIQ design consequence |
| --- | --- | --- |
| [Google Identity: verify server-side ID tokens](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token) | Server verifies token including signature, issuer, audience, expiry; Google **`sub`**, not email, is provider identity; Google Identity Services POST has CSRF implications | Backend-only Google verification; explicit linking; email string alone cannot merge accounts |
| [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) | Reauthentication for sensitive account settings/risk events | Quick PIN is not enough for contact, authenticator, device or ownership changes |
| [OWASP Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) | Recovery must avoid enumeration, use expiring one-time secrets and rate limiting | Reusable SMS/email challenge and contact-change alerts |
| [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) | Session identifiers are server-bound; rotate and revoke; server-enforced idle/absolute timeouts | Logout ends session but does not by itself revoke independent 90-day device enrollment |
| [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) | Adaptive salted hashing, preferably Argon2id; SHA-256 alone unsuitable | Benchmark compliant verifier on real Workers environment **or use a vetted identity provider** |
| [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b/authenticators/) | Short secrets require meaningful server-side rate limiting; SMS/PSTN carries risks | Six-digit PIN has five-attempt cutoff; SMS fallback extra checks |
| [W3C WebAuthn L3](https://www.w3.org/TR/webauthn-3/#sctn-credential-backup) | Backup eligibility/state distinguish single- versus multi-device credentials but do **not** themselves provide physical-device attestation; passkeys may sync | Do not assume all WebAuthn credentials bind to one computer |
| [Cloudflare Workers Web Crypto](https://developers.cloudflare.com/workers/runtime-apis/web-crypto/) (updated 2026-09-30) | Workers supports SubtleCrypto operations, with algorithm-specific differences | Challenge verification feasible in principle; **not** proof that custom PIN+device UX is secure |
| [Cloudflare Workers Node crypto](https://developers.cloudflare.com/workers/runtime-apis/nodejs/crypto/) (updated 2026-10-17) | Built-in `node:crypto` does not support Argon2/argon2Sync | Do not select unavailable password KDFs without vetted compatible module/runtime benchmark |
| [Cloudflare React + Vite SPA/API guide](https://developers.cloudflare.com/workers/vite-plugin/tutorial/) (updated 2026-09-05) | Vite SPA can coexist with a Workers API | Prefer incrementally adding one API layer to current Vite SPA; **do not convert UI to a different router/framework** |
| [Cloudflare Neon integration](https://developers.cloudflare.com/workers/databases/third-party-integrations/neon/) | Hyperdrive or Neon serverless driver can link Workers to Neon | Existing planned Neon store remains plausible, but **not configured in current preview** |
| [Cloudflare Hyperdrive pooling](https://developers.cloudflare.com/hyperdrive/concepts/connection-pooling/) | Hyperdrive is **transaction-pooled**; a Worker invocation may use multiple DB connections | Never rely on `SET tenant_id` outside one explicit transaction; enforce tenant scope and RLS if adopted |
| [Cloudflare Hyperdrive supported features](https://developers.cloudflare.com/hyperdrive/reference/supported-databases-and-features/) (updated 2026-09-30) | SQL-level prepared statements and advisory locks unsupported in the connection model; restrictions on session state | Avoid session-scoped state and advisory lock dependencies |
| [Cloudflare Workers Vitest integration](https://developers.cloudflare.com/workers/testing/vitest-integration/) (updated 2026-08-20) | Official **`@cloudflare/vitest-plugin`** can run tests inside Workers; older vitest-pool guide is legacy | Use current integration after pinning compatible package versions, not outdated pool recipes |

## 3. High-risk architecture questions for Astra

### H1 — Six-digit PIN and proof of browser possession: **BLOCKING**

The user explicitly approved **their own six-digit HisabIQ PIN**, remembered for 90 days, working after logout, with multiple independent accounts per browser. A **PIN-only cookie cannot meet** this design. WebAuthn assertions can require OS/platform user verification or authenticator presence and may create extra prompts; WebAuthn does **not** promise that the HisabIQ-defined PIN is the device's own authenticator activation PIN. IndexedDB-stored non-extractable WebCrypto keys may prove the current browser profile can perform a signature but are **not automatically hardware-bound** or resistant to all browser-profile copying / XSS.

**Decision gate:** Before coding the PIN flow, produce an explicit threat model and a tested working prototype against target Windows Chrome/Edge, Linux Chrome/Firefox and Android Chrome as relevant. Prove: challenge freshness, device proof, PIN verification, five-error lockout, 90-day fixed expiry, separate account enrollments, cross-device-copy behavior, revocation, cookie separation, after-logout login, and fallbacks. If a supported approach cannot meet UX and security simultaneously, **full login remains the safe V1 fallback** and Astra should recommend a user-approved scope correction. No hidden substitution with platform PIN or silent “remember me” token.

### H2 — Managed identity versus custom Workers authentication: **BLOCKING**

The repository has **no existing backend**. An all-custom solution means building password verification, SMS/email OTP, Google linking, account recovery, session storage, rate limits, admin/audit capabilities and device security. This is nontrivial for a small team.

**Review two concrete choices:** (A) established identity product/service for passwords/Google/challenges, with HisabIQ Worker doing tenant mapping, session coordination and custom optional device enrollment if feasible; (B) vetted auth framework hosted in Workers + Neon with the same single-service boundary. Compare **Cloudflare compatibility**, Bangladeshi SMS delivery/cost, Google-only onboarding, provider email OTP behavior, session semantics, optional per-user/browser PIN, data portability, and maintenance/security burden. Prefer the **fewest custom security primitives**, but do not assert a provider meets requirements without verifying current documentation. Commit a decision record before implementation.

### H3 — Production tenant isolation and preview migration: **BLOCKING**

`/app/*` currently renders demo UI. A security implementation must prevent access without active session and valid tenant membership, but **it must not pretend that the existing client-side preview accounting store is durable or tenant-secure**. Architect and test the auth boundary independently; do not ship “secure login to unsafely shared production data.” Separate secure backend rollout from preview demos until real domain data has server tenancy checks.

### H4 — Session policy is proposed, not owner-approved

The design spec suggests **2-hour server idle/12-hour absolute** session lifetime, while user explicitly chose **optional 30-minute UI auto-lock** and **90-day fixed PIN enrollment**. Astra must review risk/UX before treating 2h/12h as final. Auto-lock OFF **never** disables server expiry; reauthentication to turn off auto-lock is also a proposed, not expressly selected detail.

### H5 — SMS delivery and recovery

Confirm local Bangladesh SMS vendor, DLT/operator requirements if any, trial costs, failure paths and deliverability **before** relying on SMS as the mandatory phone verification channel. For assisted recovery, rigorous verification requires an actual reviewed support process; an inert “Recover account” form is unacceptable.

## 4. KISS + Impeccable findings (evidence-driven)

1. **Do not redesign login:** [existing visual draft](../../../src/components/brand/ApplicationsSection.tsx), dark Ink branding panel desktop, white form, Bangla tagline. Only add Google, Forgot password and conditional Quick PIN. Compact mobile collapses tall decoration.
2. **Avoid extra pages:** OTP is one reusable view; security settings live inside existing settings hub. Remembered-account selection appears only for 2+ enrollments.
3. **No deceptive mock interactions:** demo mobile/password values and unverified “Trusted by 2,400+ shops” in brand draft must not become production credentials/facts.
4. **Minimal registration:** mobile OTP/password/business name/type; Google requires mobile OTP but not a HisabIQ password. Optional extra business details later.
5. **No new giant user-management subsystem:** current preview actor select is not an account; separately authenticate real user, then map membership. Staff UI redesign out of scope.
6. **Consolidate into one domain per concern:** identity/session, OTP/recovery, tenant authorization, device enrollments and UI shell integrations. Avoid many generic providers until needed.

## 5. Review status and source limitations

- Inspected current GitHub `main` files and the **design-review branch** spec.
- Magic Patterns reference is the **source-committed brand login component** (not an assumption about a remote editor session). The connected Magic Patterns editor was not required to establish that component's visual authority.
- No implementation, real browser/device experiment, infrastructure credentials check, SMS vendor verification or full visual screenshot audit has been completed.
- Findings distinguish **verified existing code**, **authoritative documentation**, and **proposed architecture**; reviewer must not mark proposals as implemented.

**Astra verdict requested:** Identify false assumptions, unsafe shortcuts, scope overload, missing tests and precise plan changes; keep the user's approved UX contract and KISS constraint.
