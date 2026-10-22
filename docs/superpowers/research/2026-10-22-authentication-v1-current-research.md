# HisabIQ Authentication V1 — UI Design and Existing-Backend Research

**Date:** 2026-10-22  
**Status:** Corrected after owner clarification; source inspection only, no feature implementation.  
**Scope:** Current authentication UI design and alignment with the existing ByabsIQ application.  
**Related:** [Spec](../specs/2026-10-22-hisabiq-authentication-v1-design.md) · [UI plan](../plans/2026-10-22-hisabiq-authentication-v1-implementation.md) · [KISS findings](../reviews/2026-10-22-authentication-kiss-impeccable-findings.md).

## 1. Correct project boundary

The owner confirmed that Cloudflare is used only for the live `hisabiq_ui` preview and the backend is already implemented in [`shuvodelux-commits/ByabsIQ`](https://github.com/shuvodelux-commits/ByabsIQ). The former conclusion that HisabIQ has no backend was based only on the UI repository and is superseded.

- **Visual source:** `shuvodelux-commits/hisabiq_ui`, documentation branch `docs/superpowers-hisabiq-auth-v1-design-20261022`, inspected base `49d22ca0d16c6591164e699d567877bdf05c779e`.
- **Backend/connected application source:** ByabsIQ `main` at `17dcadfaa86ac868063408cc2be6209ca652e164`.
- **Current deliverable:** UI design, interaction states, shared-component reuse and a source-grounded capability map.
- **Excluded:** new API infrastructure, Hyperdrive setup, database migrations, provider replacement, backend feature work, live integration and deployment.

ByabsIQ uses NestJS + Fastify, PostgreSQL + Drizzle, Redis and pnpm workspaces. Its `apps/web` already has connected auth/onboarding/business screens and TanStack Router/Query. Source confirms an implemented foundation; this is not a fresh runtime or production-readiness certification.

## 2. Existing backend contracts

Endpoint paths below include the `/api` prefix configured in `apps/api/src/main.ts:63`.

| Existing contract | Source | UI alignment consequence |
| --- | --- | --- |
| `GET /api/auth/csrf` → `{token}` | `apps/api/src/modules/auth/auth.controller.ts:45-48` | Reuse existing CSRF exchange for later connected mutations. |
| `POST /api/auth/otp/request` with `{phone}` → 202 `{status:'sent'}` | Same controller `50-59` | Existing signup verification-code request; not a recovery or general-purpose OTP API. |
| `POST /api/auth/signup` with `{phone,password,otpCode,email?}` → `{user}` | Same controller `26-31,61-68`; `packages/contracts/src/auth.ts:12-17` | OTP is consumed during signup; no separate verification-grant endpoint is exposed. Signup does not create a session. |
| `POST /api/auth/login` with `{phone,password}` → `{user}` and HttpOnly cookie | Same controller `70-89` | Reuse the existing login/session behavior; no browser bearer token. |
| `POST /api/auth/logout` → 204; `GET /api/auth/session` → `{user,activeBusinessId}` | Same controller `91-109`; `auth.service.ts:153-170` | Design honest pending/expired/lost-response states; active business comes from server context. |
| `GET /api/businesses`; `POST /api/businesses` with `{name}` | `apps/api/src/modules/businesses/businesses.controller.ts:22-45`; `packages/contracts/src/businesses.ts` | Reuse business membership/creation boundaries; business type is not in this creation contract. |
| `POST /api/businesses/:businessId/activate` → `{activeBusinessId}` | Same controller `57-75` | Preserve membership/CSRF guards and server-confirmed activation. |

Permanent source references: [auth controller](https://github.com/shuvodelux-commits/ByabsIQ/blob/17dcadfaa86ac868063408cc2be6209ca652e164/apps/api/src/modules/auth/auth.controller.ts), [auth contracts](https://github.com/shuvodelux-commits/ByabsIQ/blob/17dcadfaa86ac868063408cc2be6209ca652e164/packages/contracts/src/auth.ts), [business controller](https://github.com/shuvodelux-commits/ByabsIQ/blob/17dcadfaa86ac868063408cc2be6209ca652e164/apps/api/src/modules/businesses/businesses.controller.ts).

## 3. Reuse existing connected behavior

| Existing source in ByabsIQ | Verified behavior to preserve during later UI alignment |
| --- | --- |
| `apps/web/src/lib/api-client.ts:1-47` | Same-origin `/api` client, cookie credentials, CSRF on POST, bodyless POST/204 handling, structured errors, abort support and session/business-context events. |
| `apps/web/src/lib/foundation-api.ts:1-21` | Typed access to existing auth/business endpoints. Reuse/adapt these contracts rather than creating duplicate HTTP or session services. |
| `apps/web/src/features/auth/{auth-layout,login-page,signup-page,verify-phone-page}.tsx` | Existing shared layout and forms. Signup credentials are transient React state; verification submits signup then normal login. Presentation needs realignment to the current approved Login branding. |
| `apps/web/src/features/businesses/business-switcher.tsx:1-35` | One-business shortcut; existing shared select; cancels reads, clears affected query caches, reconciles server context on activation/error. |
| `apps/web/src/app/workspace-commands.tsx:1-17` | Existing payment command lock; retain it while designing Save Draft/Discard/Stay behavior for later ERP integration. |
| `apps/api/src/common/guards/business-membership.guard.ts` and `docs/web-foundation.md` | Authenticated session + membership is authority. `x-hisabiq-business-id` is an expected-context check on covered endpoints, not client authorization. Do not assume every domain endpoint has identical coverage. |

Permanent references: [existing API client](https://github.com/shuvodelux-commits/ByabsIQ/blob/17dcadfaa86ac868063408cc2be6209ca652e164/apps/web/src/lib/api-client.ts), [foundation client](https://github.com/shuvodelux-commits/ByabsIQ/blob/17dcadfaa86ac868063408cc2be6209ca652e164/apps/web/src/lib/foundation-api.ts), [web foundation documentation](https://github.com/shuvodelux-commits/ByabsIQ/blob/17dcadfaa86ac868063408cc2be6209ca652e164/docs/web-foundation.md).

## 4. Approved UI requirements versus inspected capability

Missing from this map means no matching capability was found in the inspected auth contracts, module wiring and connected UI. It is not a claim about uninspected private branches or deployed services.

| Approved requirement | Existing evidence / alignment gap | Design-stage treatment |
| --- | --- | --- |
| Mobile/password + mandatory verified mobile | Implemented in auth controller/service and shared contracts. | Reuse semantics and design all success/error/pending states. |
| Mobile → OTP → password order | Current connected UI collects password before OTP; server verifies OTP only with final signup. | Preserve approved design order. Record the missing independent verification/resume contract; do not claim OTP is server-verified at an unsupported earlier step. |
| Google-only account and explicit Google linking | No matching controller/client method found; `packages/db/src/schema/users.ts:13` requires `passwordHash`. | Design Google/link/conflict states; mark backend alignment required. Never manufacture a password or merge by phone/email. |
| Email-first recovery, SMS fallback, assisted recovery | No matching recovery contract found. Optional `email` storage does not establish verification/recovery eligibility. | Design reusable recovery states and handoff; do not reuse signup OTP as password-reset authority. |
| Custom six-digit Quick PIN, 90 days, five failures, multi-account browser, revoke | No matching enrollment/PIN/device endpoint found. | Keep complete visual states and cryptographic proof requirement. Real PIN authentication needs separate reviewed backend alignment and browser evidence. |
| Per-user/browser 30-minute UI lock, optional OFF | No matching account preference/lock contract found. | Design default/disabled/manual/expired-session states; key browser preference independently of optional PIN enrollment. |
| Last-used authorized business | Active business in current session and activation exist; persistent cross-session preference is not exposed in inspected contracts. | Preserve approved last-used requirement and record the contract gap. |
| Business name + type | Creation contract currently accepts only `name`. | Keep approved fields in design; do not claim type is persisted until aligned. |
| Save Draft & Switch / Discard & Switch / Stay Here | Existing switcher handles mutations/payment lock but does not expose a general ERP draft guard. | Reuse switcher behavior and existing domain drafts; record unsupported save cases honestly. |
| Sensitive-action full reauthentication and remote device management | No matching action-bound reauth/device contract found. | Design prompt and return-to-action behavior; no fake successful settings changes. |

## 5. Policy differences to record, not change

- `apps/api/src/modules/auth/session.service.ts:23-30` creates a fixed 30-day session expiry. Earlier 2h idle/12h absolute suggestions remain unapproved; this design work does not alter the backend lifetime.
- `auth.controller.ts:80-86` uses a server cookie, HttpOnly, SameSite Strict and Secure in production. Preserve the established server boundary; do not redesign hosting/cookies as a side effect of UI work.
- `apps/api/src/modules/auth/auth.module.ts:17-26` deliberately refuses the development OTP provider in production and has no configured production SMS adapter in this inspected milestone. No real SMS delivery is certified by the preview.
- Google, recovery and PIN security requirements remain acceptance contracts. The absence of current endpoints is a reason to document an alignment dependency, not a reason to build a parallel backend here.

## 6. UI-specific implementation risks to retain in the design

1. The approved `hisabiq_ui/src/components/brand/ApplicationsSection.tsx:127-170` Login branding block matches the attached Magic Patterns export. Preserve its composition and brand. Remove demo credentials/unverified claims from actual user flows.
2. `hisabiq_ui/src/components/Input.tsx:23-24` routes numeric input modes into steppers. Code/PIN inputs need string semantics, leading zero preservation and no arithmetic controls; reuse the shared family with a minimal semantic exception.
3. `hisabiq_ui/src/i18n/useUiCopy.ts:1-7` depends on tenant settings. Pre-login copy needs existing pure translation helpers without mounting demo tenant state.
4. `hisabiq_ui/src/settings/model.ts:138-141`, its settings provider and module-level preview stores are not authenticated ByabsIQ session/membership state. Do not convert demo actors, cached business IDs or fixtures into authority.
5. Account Security is personal, not Owner-only business administration. Reuse current settings presentation and give ordinary users access to their own methods and browser controls.
6. Preserve the repository boundary: preview uses HashRouter; ByabsIQ connected web uses TanStack Router/Query. Reuse the appropriate existing routing/data layer; copying entire shells between repos is not a design requirement.

## 7. Security basis retained without new infrastructure recommendations

Google stable `sub` and server verification: [Google documentation](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token). Recovery/session controls: [OWASP authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [forgot password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html), [session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html). Browser proof: [WebAuthn](https://www.w3.org/TR/webauthn-3/) and [WebCrypto storage/security limits](https://www.w3.org/TR/2017/REC-WebCryptoAPI-20170126/#security-considerations).

A non-extractable browser key is not automatically hardware/device-copy protection; WebAuthn user verification is not a user-chosen HisabIQ PIN. These are retained security constraints, not a proposal to implement cryptography during UI design. No auth provider is being selected or replaced.

## 8. Verification limits

Read-only inspection covered the named ByabsIQ backend, contracts, connected auth/client/switcher and supporting docs at the pinned commit. No runtime services, database, real OTP delivery, production configuration or browser-proof experiment were exercised. Existing repository reports are historical evidence, not newly observed passing tests. Only the five authentication documents in `hisabiq_ui` are revised; backend and feature files remain unchanged.
