# HisabIQ Authentication V1 — UI Design and Backend Alignment Plan

**Status:** Review-only UI design proposal, corrected 2026-10-22 after owner clarification.  
**Execution:** Not authorized. This document does not instruct an agent to start implementation.  
**Replaces:** The former 15-task proposal to bootstrap a separate backend inside `hisabiq_ui`.

## 1. Goal and scope

Design the approved HisabIQ authentication experience using the current Magic Patterns/shadcn UI and map its states to the existing ByabsIQ backend. Cloudflare is used only for the live UI preview in this step.

- **Visual source:** `shuvodelux-commits/hisabiq_ui`, `src/components/brand/ApplicationsSection.tsx:127-170`, current settings/dialogs/shell and shared primitives.
- **Existing application/backend:** [`shuvodelux-commits/ByabsIQ`](https://github.com/shuvodelux-commits/ByabsIQ), inspected `main` at `17dcadfaa86ac868063408cc2be6209ca652e164`: NestJS + Fastify, PostgreSQL + Drizzle, Redis; connected React/Vite web app.
- **Current deliverables:** UI state/interaction checklist, reusable-component map, backend capability/gap map, dependency order and design acceptance criteria.
- **Outside scope:** New Worker API, Hyperdrive setup, database migrations, replacement identity provider, custom auth/session infrastructure, backend feature changes, live service wiring, package installation, implementation code, PRs, merges and deployment.

The backend exists. Its current exposed auth foundation does not yet demonstrate every newly approved UI feature. Gaps remain documented in the [research map](../research/2026-10-22-authentication-v1-current-research.md); this plan neither invents endpoints nor removes approved requirements.

## 2. Approved behavior to preserve

1. Every account verifies mobile; Google does not bypass this. Mobile/password works without email; Google-only users are not forced to create a password.
2. Google linking requires proof of the existing HisabIQ account, never silent email/phone matching.
3. Verified email/Gmail OTP first for password recovery where available; secure SMS fallback; assisted recovery with independent evidence and possible denial.
4. Optional custom six-digit Quick PIN: fixed 90-day enrollment, usable after ordinary logout/restart/session expiry, five wrong attempts disable that enrollment pending full authentication, separate remembered users per browser, remote revocation.
5. Default 30-minute automatic UI lock, optional OFF per user/browser; manual Lock remains. Lock preference must not require PIN enrollment or change server session expiry.
6. Last-used authorized business; switcher only when useful; Save Draft & Switch / Discard & Switch / Stay Here, saving under the old business and staying on save failure.
7. Fresh full authentication for sensitive security/ownership changes; existing permission/confirmation rules for ordinary ERP work.
8. Existing approved login composition, shared shadcn UI, Geist/Hind Siliguri, no monospaced digits, compact responsive forms and English/Bangla/bilingual modes.

## 3. Existing contract and component reuse map

| Concern | Existing authority/reference | Design consequence |
| --- | --- | --- |
| Login branding | UI `src/components/brand/ApplicationsSection.tsx:127-170`, `Logo.tsx`, `Button.tsx`, `Input.tsx` | Preserve the split Ink/form composition; add only approved contextual actions. |
| Connected auth | ByabsIQ `apps/web/src/features/auth/{auth-layout,login-page,signup-page,verify-phone-page}.tsx` | Adapt presentation later; retain real submit/error/session semantics. Do not build another auth service. |
| HTTP/contracts | ByabsIQ `apps/web/src/lib/{api-client,foundation-api}.ts`, `packages/contracts/src/{auth,businesses}.ts` | Map to actual endpoints; no invented `/google`, recovery or PIN routes. Existing client handles cookies, CSRF, 204 and safe errors. |
| Existing API | ByabsIQ `apps/api/src/modules/{auth,businesses}` | Read-only contract source. No code or schema changes during this step. |
| Settings | UI `src/settings/{TenantSettingsPage,ui}.tsx`, `fields.ts`, navigation registry | Personal Account Security must be accessible without business Owner permissions. |
| Business switching | UI `TopBar.tsx`; ByabsIQ `features/businesses/business-switcher.tsx`, `app/workspace-commands.tsx` | Preserve server-confirmed activation, cache reconciliation and payment locks; design draft guard integration. |
| Verification/PIN | Shared input family and approved interaction states | One code-entry presentation, string value, no steppers, paste/autofill and Bangla digit normalization. PIN has separate security meaning from OTP. |
| Language/theme | UI pure `i18n/uiCopy.ts` helpers and existing ThemeContext | Pre-login language must not depend on a demo tenant; no second design/theme system. |

## 4. Eight dependency-ordered design tasks

### Task 1 — Freeze scope, state inventory and capability map

Read both repositories' relevant source. Mark each state as (a) backed by an existing contract or (b) a design preview needing later backend alignment. Include registration, login, verification, linking conflicts, recovery, PIN, lock, account security and business switching.

**Acceptance:** Every approved requirement has a UI state and a capability status. No new infrastructure tasks, invented endpoints or assumption that all new features already exist. No live network connection is added.

### Task 2 — Establish the single shared auth layout and controls

Use the approved Login branding composition: dark Ink panel with logo/Bangla tagline and ledger lines; white form and teal primary action. On mobile, collapse the tall branding panel to a compact header. Reuse existing shared Button/Input/Dialog/Switch, fonts and tokens. The ByabsIQ AuthLayout is the eventual connected integration point; its current centered-card presentation does not override the approved new composition.

Remove demo phone/password defaults and unsupported shop-count/trial claims from actual flow designs. Specify a code-input semantic exception to numeric steppers, accessible password visibility and focused inline errors.

**Depends on:** 1. **Acceptance:** One reusable layout, no new UI kit/input library, and no default-view overload of every login method.

### Task 3 — Design login, registration and explicit linking

Design mobile/password and Google paths, minimal business setup, interrupted signup, duplicate mobile, wrong credentials, Google cancellation and ownership-proof linking. Keep the approved phone → OTP → password design order.

Map existing login/signup behavior precisely: ByabsIQ signup currently receives password + OTP together and does not issue a session; the connected client then calls login. There is no standalone OTP-verification grant endpoint. Google-only accounts conflict with the current required password hash. Business creation currently accepts only name; business type remains an approved design field with a persistence gap. These are future alignment dependencies, not permission to change backend or alter approved UX.

**Depends on:** 1–2. **Acceptance:** All branches preserve entered nonsecret values, explain recovery actions and distinguish confirmed server results from design scenarios. No credentials in URL/browser storage.

### Task 4 — Design shared verification, recovery and reauthentication views

Use one code-entry presentation for registration and permitted recovery steps, with purpose-specific labels and behavior. Include resend/backoff, edit number, delayed/expired/wrong code, delivery failure, email-first recovery, secure SMS fallback, Google-only guidance and a minimal lost-access request/status.

Design reauthentication as a focused prompt that returns to the pending action after verified proof. Public recovery responses must not expose account existence or linked contacts; optional email storage is not verified recovery eligibility.

**Depends on:** 2–3. **Acceptance:** Clear retry/cancel/focus behavior; no reset authority from signup OTP and no fictional assisted-recovery approval. Missing recovery/reauth contracts stay visible in the capability map.

### Task 5 — Design conditional Quick PIN and remembered-account states

Include optional setup/confirm, one remembered account directly to PIN, 2+ account chooser, Use another account/method, wrong attempts, fifth-failure lockout, expired/revoked enrollment, browser-key loss and unsupported device.

The six-digit PIN, 90-day expiry and post-logout behavior stay approved. A preview scenario is not a registered credential. No local PIN verifier, cookie-only login, browser cryptography or implied WebAuthn/device-binding guarantee is added. Production PIN remains dependent on a separately reviewed ByabsIQ alignment and proven browser mechanism.

**Depends on:** 2–4. **Acceptance:** Complete conditional states and safe full-login fallback. No new passkey-management dashboard or mandatory extra enrollment step.

### Task 6 — Design personal Account Security and lock

Reuse current settings layout and profile-menu entry for contacts, login methods, password, Quick PIN, automatic lock and compact trusted-browser management. Keep account settings separate from Owner-only business administration. Browser-specific lock preference works even when PIN is skipped.

Design manual/default 30-minute lock, OFF, wake/background, expired server session behind lock and authorized return to a preserved draft. A mandatory lock surface must not be dismissed like a confirmation dialog. Existing shared dialogs remain appropriate for confirmations.

**Depends on:** 2, 4–5. **Acceptance:** Per-user/browser states, no discarded drafts, no security change claimed without confirmed backend support, and no server timeout change. Existing fixed 30-day backend expiry and earlier unapproved 2h/12h proposals are documented differences.

### Task 7 — Design shell entry and safe business switching

Reuse existing header/select/dialog behavior and ByabsIQ's membership/session/activation semantics. Show no unnecessary picker for one business. Keep last-used business as the approved target and record the lack of a persistent cross-session preference contract.

Inventory actual POS/purchase/editor draft capabilities. Define Save Draft & Switch / Discard & Switch / Stay Here; save under the old business, remain on failure, and never offer false persistence. Preserve existing pending/uncertain payment locks and server reconciliation. Old responses or stale-context commands must not appear under another user/business.

**Depends on:** 1, 3, 6. **Acceptance:** One coherent header, no POS/cart redesign, explicit unsupported draft cases, isolated preview scenarios and no conversion of demo actor/t1 state into real authorization.

### Task 8 — Review design, tests and handoff

Review the UI checklist at phone/tablet/desktop, English/Bangla/bilingual, light/dark, keyboard/touch, zoom and slow/offline/error states. Map each new state to the existing repository's test infrastructure and backend capability status. Feature execution requires separate approval.

**Depends on:** 1–7. **Acceptance:** Owner-reviewable flow/component/state map; specific acceptance cases below; no claim that UI preview or historical test reports prove production security.

## 5. Replacement of the former 15 tasks

| Former task | Disposition |
| --- | --- |
| 1 Provider/PIN/infrastructure gate | UI scope/capability map now; separate future PIN/backend alignment. No provider replacement selection. |
| 2 Worker routing | Removed. Cloudflare stays UI preview hosting. |
| 3 New auth database schema | Removed. Existing backend persistence remains authoritative. |
| 4 New session service/middleware | Removed. Map existing ByabsIQ session and membership behavior. |
| 5 New OTP engine | Removed. Reuse code-entry UI; existing signup OTP is a specific contract. |
| 6 Identity implementation | Design login/link states; missing Google contract stays an alignment gap. |
| 7 Business setup | Design minimal setup against existing create/activate contracts and explicit missing fields. |
| 8 Recovery/reauth implementation | Design states; no backend implementation in this step. |
| 9 Login UI implementation | Shared layout/control design moves earlier. |
| 10 Device-proof implementation | No cryptographic code; preserve future feasibility/security gate. |
| 11 PIN implementation | Full visual/interaction state design; real credential work requires separate scope. |
| 12 Lock/settings implementation | Personal account/lock design using current components. |
| 13 Tenant switching implementation | Design existing-shell/draft integration, preserve backend boundaries. |
| 14 Assisted-recovery tooling | Minimal user-facing request/status design; no new support-admin subsystem. |
| 15 Backend release gate | UI design acceptance and future integration handoff; no release/deployment. |

## 6. Acceptance and later testing strategy

- **Current document checks:** Existing links/paths and endpoint shapes match pinned source; approved requirements are preserved; the five documents agree on scope; no executable backend setup plan remains.
- **Later UI tests:** Use the UI repo's existing Node/Playwright infrastructure for preview states. ByabsIQ already uses its own web/component/browser suites; reuse those for later connected changes. Do not add Workers testing dependencies.
- **Code fields:** `000123`, Bengali digits, paste, correction, autofill, masked PIN, no wheel/arrow arithmetic, accessible field errors and resend state.
- **Routing/copy:** Pre-login translation without tenant context, refresh/back/cancel, phone/tablet/desktop, three language modes, dark/light and focus/keyboard behavior.
- **Session/lock/account:** Wrong credentials, Google/link conflicts as marked scenarios, one/multiple remembered users, fifth PIN failure, fixed expiry, unsupported browser, lock wakeup, user isolation and visible fallback.
- **Business/drafts:** Save/Discard/Stay, failed save/activation, mutation/payment lock, stale responses, empty/revoked memberships and no false draft persistence.
- **Future real-service checks:** Existing ByabsIQ integration/E2E remains the basis. New Google/recovery/PIN behavior needs its own approved contract/security tests before real connection; no mock security certification.

## 7. Rollback and approval

This revision changes documentation only on the existing review branch. ByabsIQ, frontend feature code, Cloudflare configuration, database and live services remain unchanged. A rollback is a documentation revert; no data operation is involved.

Review the corrected design and capability map first. Any frontend implementation, live integration or necessary backend alignment must be separately authorized. No PR creation, merge or deployment is included.
