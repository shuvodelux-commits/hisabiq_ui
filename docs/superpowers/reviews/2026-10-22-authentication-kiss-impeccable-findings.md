# HisabIQ Authentication V1 — KISS + Impeccable UI Alignment Findings

**Date:** 2026-10-22  
**Status:** Corrected after owner clarification; UI design/documentation only.  
**Authority:** Current Magic Patterns/shadcn UI in `hisabiq_ui`; existing backend/contracts in `shuvodelux-commits/ByabsIQ`.  
**Related:** [Design](../specs/2026-10-22-hisabiq-authentication-v1-design.md) · [Research/capability map](../research/2026-10-22-authentication-v1-current-research.md) · [UI plan](../plans/2026-10-22-hisabiq-authentication-v1-implementation.md).

## 1. Corrected scope

Cloudflare is only the live UI preview host for this step. ByabsIQ already implements a NestJS/Fastify backend and connected web foundation. The earlier conclusion that HisabIQ has no backend was incorrect because only the preview repo was inspected.

Remove new Worker API, Hyperdrive, database bootstrapping/migrations, new session/OTP services and provider-replacement tasks. Reuse the existing backend contract as evidence and record gaps for later alignment. No feature code, backend change, live integration or deployment is authorized.

## 2. Ranked design findings

| Priority | Evidence / issue | Minimum design correction |
| --- | --- | --- |
| P1 | Previous plan treats the static UI repo as the entire system and bootstraps another backend. ByabsIQ README, auth/business controllers and connected API client prove an existing foundation. | Replace with eight UI design/alignment tasks; do not rebuild infrastructure. |
| P1 | Approved Login branding exists in `src/components/brand/ApplicationsSection.tsx:127-170` and matches the attached Magic Patterns archive. | Preserve split Ink/white composition, logo, Bangla tagline and teal action. |
| P1 | ByabsIQ `apps/web/src/features/auth/auth-layout.tsx` already owns connected auth presentation but uses a centered card. | Reuse its eventual integration point while aligning presentation to the current approved draft; avoid parallel auth systems. |
| P1 | UI shared `Input.tsx:23-24` routes numeric input modes to `NumericInput` steppers. | Treat PIN/OTP as strings with a minimal code-input exception; no new input library. |
| P1 | UI `i18n/useUiCopy.ts:1-7` depends on tenant settings outside the proposed login surface. | Use existing pure copy helpers for pre-login language; do not mount a demo tenant to translate login. |
| P1 | New UI requirements exceed inspected backend contracts: Google-only/linking, recovery, trusted PIN, reauth and remote enrollment controls. | Keep approved designs, label missing backend alignment; no invented working calls or success claims. |
| P1 | Backend signup consumes OTP with password; business creation accepts name only. | Preserve approved OTP-first/password-later and business-type designs, with explicit verification/persistence gaps. |
| P1 | UI demo actor, `currentBusinessId='t1'` and module-level stores are not real identity. ByabsIQ already has real session, membership, activation and query handling. | Reuse real semantics for later integration; inventory preview stores and isolate design scenarios. |
| P1 | Account Security placed under business-admin access can exclude ordinary employees. | Use personal settings scope and current layout/menu, independent of Owner permissions. |
| P2 | Lock preferences tied to optional PIN enrollment exclude users who skip PIN. | Identify user/browser preference separately; default 30 minutes, OFF and manual lock all remain. |
| P2 | Default shared dialog Escape behavior is unsuitable as an enforced lock. | Design a non-dismissible lock surface; reuse dialogs for confirmations. |
| P2 | Guide contains sample credentials, unverified shop count and trial copy. | Preserve layout, remove credentials and only use factual enabled offers in real flow copy. |
| P2 | Settings path/section registries and auth browser CI coverage were omitted from the earlier plan. | Include actual navigation/copy/state/test dependencies in later UI handoff. |
| P3 | Spec/plan/review prompt disagree on approval and execution status. | Mark this as UI design/documentation alignment; feature execution remains unapproved. |

## 3. Impeccable Operate/Distill direction

**Goal:** Let a shopkeeper reach the right business with a clear, familiar next action. Preserve current HisabIQ density and identity.

- Default login: mobile/password, one Google alternative, small Create account/Forgot password links. No provider gallery.
- Remembered user: direct PIN for one eligible user; chooser only for 2+; full-login fallback remains visible.
- Signup: approved minimum phone/verification/password (except Google) and business name/type; advanced business setup stays later.
- Verification/recovery: one reusable code-entry presentation with contextual labels, resend/backoff, change-number and readable errors.
- Security: one personal Account Security area; compact Manage trusted browsers dialog; no separate dashboard.
- Mobile: compact logo/tagline, immediately reachable form, visible errors above the keyboard; no tall decorative introduction.
- Shared controls/tokens: use current Button/Input/Switch/Dialog, Geist/Hind Siliguri, Ink/Teal/Mint, keyboard/focus/loading and three language modes.
- Business switch: existing header and shared confirmation, real draft capability, Save/Discard/Stay and fail-safe return.

## 4. Security boundaries that simplification must retain

Mandatory verified mobile; explicit ownership proof for linking; verified eligible recovery channels; server-side credential/session/tenant authority; no passwords/PINs/tokens in browser storage; no bare PIN/cookie-only trust; fixed 90-day authorization, five-attempt cutoff, independent remembered users, revocation; sensitive-action full reauthentication; protected unsaved work and honest unsupported/failure states.

These are product/security contracts, not proof of current backend coverage. PIN browser-proof feasibility still needs separate evidence before any real authorization. Existing source reports are not freshly observed runtime results.

## 5. What to remove or merge

| Remove / merge | Reason |
| --- | --- |
| New API/hosting/database/session foundation tasks | Existing ByabsIQ foundation is the reuse baseline; this is UI design. |
| Managed-auth replacement comparison as an execution prerequisite | No backend replacement is requested; first map current contracts and actual gaps. |
| Duplicate auth layouts and page-local control styles | One component family and the approved brand composition are sufficient. |
| Separate linking, device, PIN-preference and recovery dashboards | Focused states/settings/dialogs cover the approved actions. |
| New router, cache library, form framework, OTP UI package or animation library | Reuse the relevant repository's current stack; no new dependency is justified for design. |
| Mandatory email, Google password creation, detailed shop setup or repeated daily OTP | Contradicts or adds friction to approved requirements. |
| Production support-admin expansion and live service wiring | Record future dependencies instead of growing the current UI task. |

## 6. Review limits

This is source-based design/documentation alignment, not a live visual audit, runtime regression run, SMS verification or authentication penetration test. ByabsIQ source was inspected at `17dcadfaa86ac868063408cc2be6209ca652e164`; its backend is unchanged. No implementation, PR, merge or deployment is authorized by this revision.
